// lib/ai/knowledge.ts
// 知识树拆解：调用 LLM 生成 KnowledgeNode[]
// 失败重试 2 次，最终降级到预设模板
// AI Native 升级：增加 Cloudflare KV 缓存层
//   - 同 topic + 同 userPrompt 的拆解结果可复用（知识树对所有人通用）
//   - TTL 7 天，避免长期固化陈旧知识结构
//   - KV 不可用时静默降级为直接调用（不阻塞主流程）

import { generateObject } from "ai";
import type { LanguageModel } from "ai";
import { z } from "zod";
import { createAIProvider } from "./provider";
import { getFallbackTemplate } from "./templates";
import { getCloudflareKV } from "./cloudflare-env";
import { observeCall } from "./observability";
import { getPrompt } from "./prompts";
import type { KnowledgeNode, UserProfile } from "../types";

// 从 Prompt Registry 读取（修改 prompt 在 lib/ai/prompts.ts 中 bump version）
const PROMPT_DEF = getPrompt("knowledge_decompose");

const nodeSchema = z.object({
  id: z.string().describe("节点 ID，格式 k1, k2, ..."),
  title: z.string().describe("知识点标题"),
  difficulty: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4), z.literal(5)]),
  prerequisites: z.array(z.string()).describe("依赖的节点 id 列表"),
  frequency: z.union([z.literal("高"), z.literal("中"), z.literal("低")]),
  bigTech: z.boolean().describe("是否大厂高频考点"),
  summary: z.string().describe("一句话知识点摘要"),
});

const treeSchema = z.object({
  topic: z.string(),
  nodes: z.array(nodeSchema),
});

// 缓存配置
const CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 天
const CACHE_KEY_PREFIX = "ai:knowledge:";

interface CachedDecomposition {
  topic: string;
  nodes: KnowledgeNode[];
  createdAt: string;
}

/**
 * djb2 字符串哈希（同步、无依赖，53-bit 空间对缓存 key 足够）
 * 用于生成 cache key，不需要密码学强度
 */
function hashString(str: string): string {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) + hash) + str.charCodeAt(i); // hash * 33 + c
    hash = hash & 0xffffffff; // 32-bit 截断
  }
  return (hash >>> 0).toString(16);
}

function buildCacheKey(topic: string, userPrompt?: string, userProfile?: UserProfile): string {
  const raw = `${topic.trim().toLowerCase()}|${(userPrompt ?? "").trim()}|${profileFingerprint(userProfile)}`;
  return `${CACHE_KEY_PREFIX}${hashString(raw)}`;
}

/**
 * 用户画像指纹（用于 cache key 区分不同画像的拆解结果）
 * - 无 userProfile 时返回空串（向后兼容旧 cache key）
 * - 有画像时按 nodeId 排序拼接 skillLevel，保证稳定
 */
function profileFingerprint(userProfile?: UserProfile): string {
  if (!userProfile) return "";
  const entries = Object.entries(userProfile.skillLevel ?? {}).sort(([a], [b]) =>
    a.localeCompare(b),
  );
  if (entries.length === 0) return "";
  return entries.map(([id, level]) => `${id}:${level}`).join(",");
}

export async function decomposeKnowledge(
  topic: string,
  userPrompt?: string,
  opts?: { skipCache?: boolean },
  model?: LanguageModel,
  userProfile?: UserProfile,
): Promise<KnowledgeNode[]> {
  const skipCache = opts?.skipCache ?? false;

  // 1. 尝试缓存命中（非跳过缓存场景）
  if (!skipCache) {
    const cached = await tryReadCache(topic, userPrompt, userProfile).catch(() => null);
    if (cached && cached.length > 0) {
      return cached;
    }
  }

  // 2. 调用 LLM 拆解（带观测 + 重试）
  try {
    const aiModel = model ?? createAIProvider();
    const result = await observeCall("knowledge:decompose", () =>
      withRetry(
        () =>
          generateObject({
            model: aiModel,
            schema: treeSchema,
            system: PROMPT_DEF.system,
            prompt: buildPrompt(topic, userPrompt, userProfile),
          }),
        2
      )
    );
    let nodes: KnowledgeNode[] = result.object.nodes.map((n) => ({
      ...n,
      mastery: 0,
    }));

    // 2.5 画像感知：跳过已掌握（advanced）节点（stability>21 且 accuracy>85% 已编码为 advanced）
    if (userProfile) {
      nodes = filterByProfile(nodes, userProfile);
    }

    // 3. 写入缓存（失败静默忽略）
    if (!skipCache && nodes.length > 0) {
      await tryWriteCache(topic, userPrompt, nodes, userProfile).catch(() => {});
    }

    return nodes;
  } catch {
    // 4. LLM 失败降级到预设模板
    return getFallbackTemplate(topic);
  }
}

function buildPrompt(topic: string, userPrompt?: string, userProfile?: UserProfile): string {
  const promptParts = [`请拆解学习主题：${topic}`];
  if (userPrompt && userPrompt.trim()) {
    promptParts.push(`\n用户补充要求：\n${userPrompt.trim()}`);
  }
  const profileSeg = buildProfileSegment(userProfile);
  if (profileSeg) {
    promptParts.push(`\n${profileSeg}`);
  }
  return promptParts.join("\n");
}

/**
 * 构建用户画像段落（注入到 prompt）
 * - 无 userProfile 或无 skillLevel 数据时返回空串
 * - 有数据时按 beginner/intermediate/advanced 分组计数，指导 LLM 调整拆解粒度
 */
function buildProfileSegment(userProfile?: UserProfile): string {
  if (!userProfile) return "";
  const entries = Object.entries(userProfile.skillLevel ?? {});
  if (entries.length === 0) return "";
  const counts = { beginner: 0, intermediate: 0, advanced: 0 };
  for (const [, level] of entries) {
    counts[level]++;
  }
  return [
    "用户画像（请据此调整拆解粒度）：",
    `- 已掌握(advanced)：${counts.advanced} 个节点 → 跳过这些高级内容，避免重复学习`,
    `- 进阶(intermediate)：${counts.intermediate} 个节点 → 可加速，减少基础铺垫`,
    `- 入门(beginner)：${counts.beginner} 个节点 → 需夯实基础，拆得更细`,
  ].join("\n");
}

/**
 * 画像感知过滤：跳过 skillLevel === "advanced" 的节点
 * （advanced 已编码 stability>21 且 accuracy>85% 的判定）
 * - 若过滤后为空（全部已掌握），返回原集合避免空知识树
 */
function filterByProfile(nodes: KnowledgeNode[], userProfile: UserProfile): KnowledgeNode[] {
  const filtered = nodes.filter((n) => userProfile.skillLevel[n.id] !== "advanced");
  return filtered.length > 0 ? filtered : nodes;
}

async function tryReadCache(topic: string, userPrompt?: string, userProfile?: UserProfile): Promise<KnowledgeNode[] | null> {
  const kv = getCloudflareKV();
  if (!kv) return null;

  const key = buildCacheKey(topic, userPrompt, userProfile);
  const raw = await kv.get(key);
  if (!raw) return null;

  try {
    const cached = JSON.parse(raw) as CachedDecomposition;
    // TTL 检查
    const age = Date.now() - new Date(cached.createdAt).getTime();
    if (age > CACHE_TTL_MS) return null;
    // topic 不匹配时跳过（hash 冲突防护）
    if (cached.topic !== topic) return null;
    return cached.nodes;
  } catch {
    return null;
  }
}

async function tryWriteCache(topic: string, userPrompt: string | undefined, nodes: KnowledgeNode[], userProfile?: UserProfile): Promise<void> {
  const kv = getCloudflareKV();
  if (!kv) return;

  const key = buildCacheKey(topic, userPrompt, userProfile);
  const payload: CachedDecomposition = {
    topic,
    nodes,
    createdAt: new Date().toISOString(),
  };
  await kv.put(key, JSON.stringify(payload));
}

async function withRetry<T>(fn: () => Promise<T>, retries: number): Promise<T> {
  let lastError: unknown;
  for (let i = 0; i <= retries; i++) {
    try {
      return await fn();
    } catch (e) {
      lastError = e;
    }
  }
  throw lastError;
}

// 暴露给测试用的内部函数
export const _internal = {
  buildCacheKey,
  hashString,
  CACHE_TTL_MS,
};
