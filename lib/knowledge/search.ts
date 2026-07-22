// lib/knowledge/search.ts
// 知识检索：余弦相似度 + 关键词降级 + 启发式判定 + 高层封装
//
// 检索流程（retrieveKnowledge 高层封装）：
//   1. shouldRetrieveKnowledge(text) 启发式判定是否值得检索
//   2. 在线：POST /api/embed → queryVec → vectorSearch top-k
//   3. 离线降级：/api/embed 失败 → keywordSearch token 重叠匹配
//   4. 无索引 → mode="none"
//
// 性能：500 条 × 768 维余弦 < 5ms（客户端全量扫描，无需 ANN）

import type {
  KnowledgeIndexEntry,
  KnowledgeIndexManifest,
} from "@/lib/types";
import { apiFetch } from "@/lib/api-client";
import { loadKnowledgeIndex } from "./index-store";

/** 默认相似度阈值（bge-base 余弦，经验值，可调） */
const DEFAULT_THRESHOLD = 0.35;
/** 默认 top-k */
const DEFAULT_TOP_K = 5;
/** /api/embed 超时（ms），超时走关键词降级 */
const EMBED_TIMEOUT_MS = 2000;

// ============================================================================
// 启发式判定
// ============================================================================

/** 命令型前缀（这些消息不触发知识检索） */
const COMMAND_PREFIXES = [
  "设置", "调整", "删除", "查看今日", "查看今天", "下一步", "开始专注",
  "开始番茄", "帮我设置", "帮我调整", "帮我删除", "帮我查看",
  "今天怎么样", "今日总结", "复盘", "打卡", "休息",
];

/** 知识型信号词（命中任一即认为值得检索） */
const KNOWLEDGE_SIGNALS = [
  "?", "？", "什么是", "有哪些", "解释", "区别", "原理", "如何",
  "为什么", "对比", "总结", "策略", "方案", "概念", "理解",
  "介绍一下", "讲一下", "说一下", "聊聊", "谈谈",
  "是什么", "怎么办", "怎么用", "怎么实现", "怎么处理",
  "最佳实践", "常见问题", "陷阱", "坑",
];

/**
 * 启发式判定：该消息是否值得触发知识检索。
 * 避免命令类消息（"设置提醒"）也消耗 embed 额度。
 */
export function shouldRetrieveKnowledge(text: string): boolean {
  const t = text.trim();
  // 太短不检索
  if (t.length < 6) return false;
  // 命令型前缀不检索
  for (const prefix of COMMAND_PREFIXES) {
    if (t.startsWith(prefix)) return false;
  }
  // 含知识型信号词 → 检索
  for (const signal of KNOWLEDGE_SIGNALS) {
    if (t.includes(signal)) return true;
  }
  // 中等长度且无明显命令特征 → 检索（宁可多检索也不漏）
  // 阈值 10 字：避免"好的""谢谢"等短回复触发
  return t.length >= 10;
}

// ============================================================================
// 余弦相似度 + 向量检索
// ============================================================================

/**
 * 余弦相似度。两个等长向量的 cosine = dot(a,b) / (|a|*|b|)。
 * bge-base 输出已归一化，但查询向量可能未归一化，仍做完整计算。
 */
export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) {
    throw new Error(`向量维度不匹配：${a.length} vs ${b.length}`);
  }
  let dot = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  const denom = Math.sqrt(normA) * Math.sqrt(normB);
  if (denom === 0) return 0;
  return dot / denom;
}

/**
 * 向量检索 top-k。
 * 全量扫描余弦，500 条 < 5ms。
 */
export function vectorSearch(
  queryVec: number[],
  index: KnowledgeIndexManifest,
  opts?: { topK?: number; excludeIds?: string[]; threshold?: number },
): Array<{ entry: KnowledgeIndexEntry; score: number }> {
  const topK = opts?.topK ?? DEFAULT_TOP_K;
  const threshold = opts?.threshold ?? DEFAULT_THRESHOLD;
  const excludeSet = new Set(opts?.excludeIds ?? []);

  // 维度一致性校验（防模型不一致）
  if (queryVec.length !== index.dimensions) {
    throw new Error(
      `查询向量维度 ${queryVec.length} 与索引维度 ${index.dimensions} 不一致`,
    );
  }

  const scored: Array<{ entry: KnowledgeIndexEntry; score: number }> = [];
  for (const entry of index.entries) {
    if (excludeSet.has(entry.id)) continue;
    if (entry.vector.length !== index.dimensions) continue;
    const score = cosineSimilarity(queryVec, entry.vector);
    if (score >= threshold) {
      scored.push({ entry, score });
    }
  }
  // 降序排序，取 top-k
  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, topK);
}

// ============================================================================
// 关键词降级检索
// ============================================================================

/** 中文/英文 token 化（简单分词：英文按空格+标点，中文按字） */
function tokenize(text: string): string[] {
  const tokens: string[] = [];
  // 英文单词
  const englishWords = text.toLowerCase().match(/[a-z][a-z0-9-]+/g);
  if (englishWords) tokens.push(...englishWords);
  // 中文：按 2-gram（bigram），覆盖无分词器的中文匹配
  const chineseChars = text.match(/[\u4e00-\u9fa5]+/g);
  if (chineseChars) {
    for (const seg of chineseChars) {
      if (seg.length === 1) {
        tokens.push(seg);
      } else {
        for (let i = 0; i < seg.length - 1; i++) {
          tokens.push(seg.slice(i, i + 2));
        }
      }
    }
  }
  return tokens;
}

/**
 * 离线降级：token 重叠关键词匹配。
 * 用 Jaccard 相似度的变体：命中 token 数 / 查询 token 数。
 */
export function keywordSearch(
  query: string,
  index: KnowledgeIndexManifest,
  opts?: { topK?: number; excludeIds?: string[] },
): Array<{ entry: KnowledgeIndexEntry; score: number }> {
  const topK = opts?.topK ?? DEFAULT_TOP_K;
  const excludeSet = new Set(opts?.excludeIds ?? []);
  const queryTokens = new Set(tokenize(query));
  if (queryTokens.size === 0) return [];

  const scored: Array<{ entry: KnowledgeIndexEntry; score: number }> = [];
  for (const entry of index.entries) {
    if (excludeSet.has(entry.id)) continue;
    const entryTokens = new Set(tokenize(entry.searchText));
    if (entryTokens.size === 0) continue;
    // 命中 token 数
    let hit = 0;
    for (const t of queryTokens) {
      if (entryTokens.has(t)) hit++;
    }
    if (hit === 0) continue;
    // 归一化分数：命中 / 查询 token 数（让短查询命中更显著）
    const score = hit / queryTokens.size;
    scored.push({ entry, score });
  }
  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, topK);
}

// ============================================================================
// 高层封装：retrieveKnowledge
// ============================================================================

export interface RetrieveResult {
  entries: Array<{ entry: KnowledgeIndexEntry; score: number }>;
  mode: "vector" | "keyword" | "none";
}

/**
 * 高层检索封装：给定查询文本，返回命中条目。
 * 在线优先向量检索，离线降级关键词检索，无索引返回 none。
 *
 * @param query 查询文本（用户消息 / 节点标题等）
 * @param opts.topK 返回条数上限
 * @param opts.excludeIds 排除的 entry id（如当前节点自身）
 * @param opts.threshold 向量检索相似度阈值（默认 0.35）
 */
export async function retrieveKnowledge(
  query: string,
  opts?: { topK?: number; excludeIds?: string[]; threshold?: number },
): Promise<RetrieveResult> {
  const index = await loadKnowledgeIndex();
  if (!index || index.entries.length === 0) {
    return { entries: [], mode: "none" };
  }

  // 在线向量检索
  try {
    const queryVec = await embedQuery(query);
    const results = vectorSearch(queryVec, index, opts);
    if (results.length > 0) {
      return { entries: results, mode: "vector" };
    }
    // 向量检索无命中（score 都低于阈值）→ 也降级关键词试试
    // 这样「有哪些缓存策略」这种泛查询即使向量没命中，关键词也能兜住
  } catch {
    // embed 失败，走降级
  }

  // 离线降级：关键词检索
  const keywordResults = keywordSearch(query, index, opts);
  return { entries: keywordResults, mode: keywordResults.length > 0 ? "keyword" : "none" };
}

/**
 * 调 /api/embed 嵌入查询文本。
 * 带超时，超时抛错让上层降级。
 */
async function embedQuery(text: string): Promise<number[]> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), EMBED_TIMEOUT_MS);
  try {
    const resp = await apiFetch(
      "/api/embed",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
        signal: controller.signal,
      },
    );
    if (!resp.ok) {
      throw new Error(`embed 失败: ${resp.status}`);
    }
    const data = (await resp.json()) as { vector?: number[] };
    if (!Array.isArray(data.vector) || data.vector.length === 0) {
      throw new Error("embed 返回空向量");
    }
    return data.vector;
  } finally {
    clearTimeout(timer);
  }
}
