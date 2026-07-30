// lib/presets/index.ts
// 预设知识库统一索引：算法 200 题 / 前端 / 后端 / AI / LLM 应用开发
//
// 架构说明（卡帕西视角，2026-07-26 修复部署失败）：
//   旧版用静态 import 把 6 个 preset（含 13305 行 frontend.ts + 5819 行 algorithm-200.ts）
//   全部打进客户端 bundle，导致 Worker bundle 达 11.25 MiB，远超 Cloudflare Pages
//   免费版 3 MiB 限制 → 部署失败。
//
//   v2 改造：拆成两层
//   1. PRESET_METAS（同步，< 2 KB）：只含 id/name/icon/description/tags/topic/count，
//      任何客户端页面都能安全 import，用于卡片展示和列表渲染
//   2. loadPresetData(id)（async）：用 await import() 按需加载单个 preset 的
//      knowledgeTree/questions/schedule，每个 preset 成为独立 chunk，不再全部打进主 bundle
//
//   v3 改造（2026-07-26，彻底修复）：next-on-pages 把动态 import() 目标内联进 Worker，
//   v2 的动态 import 仍导致 7MB chunk。改为运行时 fetch JSON：
//   - preset 数据由 scripts/export-presets.ts 导出为 public/data/presets/{id}.json
//   - loadPresetData 用 fetch() 加载，preset TS 文件不再进 Worker bundle
//   - 测试/脚本直接 import TS 模块（不走 fetch，保证类型安全与源码校验）
//   - 与 curriculum-graph.json / knowledge-index.json 同构（运行时 fetch 静态 JSON）
//
//   调用方改造：
//   - 渲染卡片/列表 → 用 PRESET_METAS（轻量）
//   - 需要完整数据（创建计划等）→ 用 await loadPresetData(id)
//   - matchPresetByTopic 改成只匹配元信息（同步），匹配后用 loadPresetData 加载数据

import type { KnowledgeNode, Question, ScheduleItem } from "../types";

// 预设元信息（轻量，安全打进客户端 bundle）
export interface PresetMetaInfo {
  id: string;
  name: string;
  icon: string;
  description: string;
  tags: string[];
  topic: string;
  knowledgeNodeCount: number;
  questionCount: number;
}

// 预设完整数据（重量级，按需 async 加载）
export interface PresetMeta extends PresetMetaInfo {
  knowledgeTree: KnowledgeNode[];
  questions: Question[];
  schedule: ScheduleItem[];
}

/**
 * 预设元信息列表（同步，轻量）
 *
 * count 来源：各 preset 文件头注释（构建时已知，非运行时计算，避免拉入数据）
 */
export const PRESET_METAS: PresetMetaInfo[] = [
  {
    id: "frontend-to-ai-engineer",
    name: "前端转 AI 工程师",
    icon: "⚡",
    description:
      "策展旗舰轨道：Python 桥接 → LLM 心智模型 → API 工程化 → RAG → Agent，每节点带权威来源与面试题",
    tags: ["前端转型", "LLM", "Agent", "RAG", "策展内容"],
    // 必须与 frontend-to-ai-engineer.ts 里 FRONTEND_TO_AI_ENGINEER_PRESET.topic 一致
    // （matchPresetByTopic 同步匹配靠这个字段，loadPresetData 之后会被实际数据覆盖）
    topic: "前端工程师 → AI 工程师",
    knowledgeNodeCount: 49,
    questionCount: 196,
  },
  {
    id: "algorithm-200",
    name: "算法 200 题",
    icon: "🎯",
    description: "Hot 100 核心 + 进阶突破 + 高频面试，覆盖数组/链表/树/DP/图论/贪心等全部专题",
    tags: ["算法", "面试", "LeetCode"],
    // 必须与 algorithm-200.ts 里 ALGORITHM_200_PRESET.topic 一致
    topic: "LeetCode 200 题全攻略",
    knowledgeNodeCount: 20,
    questionCount: 200,
  },
  {
    id: "frontend",
    name: "前端工程师",
    icon: "🎨",
    description: "HTML/CSS → JS → TS → React/Vue → 性能 → 工程化 → 移动端，主流前端技术栈全覆盖",
    tags: ["前端", "React", "Vue", "TypeScript"],
    topic: "前端工程师（含 AI 前端方向）",
    knowledgeNodeCount: 30,
    questionCount: 210,
  },
  {
    id: "backend",
    name: "后端工程师",
    icon: "⚙️",
    description: "Java/Python/Go 语言 + Spring/Django/FastAPI 框架 + MySQL/Redis/MQ + 微服务 + 分布式系统设计",
    tags: ["后端", "Java", "Go", "分布式"],
    topic: "后端工程师（含 AI 后端方向）",
    knowledgeNodeCount: 46,
    questionCount: 340,
  },
  {
    id: "ai",
    name: "AI 工程师",
    icon: "🤖",
    description: "ML 基础 → 经典算法 → 神经网络 → CNN/RNN/Transformer → LLM → CV/推荐",
    tags: ["AI", "ML", "LLM", "深度学习"],
    topic: "AI 算法工程师",
    knowledgeNodeCount: 44,
    questionCount: 270,
  },
  {
    id: "llm-app",
    name: "LLM 应用开发",
    icon: "🧠",
    description: "LLM 基础 → Prompt/API → RAG/Embedding → Agent/Function Calling → LangChain/LlamaIndex → 微调/部署/评估 → 多模态/MCP → 工程实践",
    tags: ["LLM", "RAG", "Agent", "LangChain", "MCP"],
    topic: "LLM 应用开发工程师",
    knowledgeNodeCount: 38,
    questionCount: 287,
  },
];

/**
 * 按需异步加载完整 preset 数据（knowledgeTree/questions/schedule）
 *
 * v3：运行时 fetch /data/presets/{id}.json（由 scripts/export-presets.ts 生成）。
 * preset TS 源文件不再进 Worker bundle，彻底解决 Cloudflare Pages 3MB 限制。
 *
 * 缓存策略：浏览器 HTTP 缓存 + 内存常驻（同会话内重复调用零开销）。
 *
 * 2026-07-30：加 8s 超时（AbortController）。
 *   旧版 fetch 无超时，若 CDN/网络 hang 住会永远 pending，
 *   导致 injectDemoData 卡死 → useHomeData 卡死 → 首页骨架屏永远不消失。
 *   8s 足够覆盖正常网络（frontend.json ~1MB，国内 CF 节点 < 3s），
 *   超时后返回 undefined，injectDemoData 静默退出，首页仍能加载。
 */
const presetDataCache = new Map<string, PresetMeta | undefined>();
const FETCH_TIMEOUT_MS = 8000;

export async function loadPresetData(id: string): Promise<PresetMeta | undefined> {
  // 内存命中（同会话内重复调用零开销）
  if (presetDataCache.has(id)) return presetDataCache.get(id);

  const meta = PRESET_METAS.find((m) => m.id === id);
  if (!meta) return undefined;

  try {
    // AbortController 实现 fetch 超时
    // 超时后 fetch 抛 AbortError，被 catch 捕获返回 undefined
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
    try {
      const res = await fetch(`/data/presets/${id}.json`, {
        signal: controller.signal,
      });
      if (!res.ok) {
        console.error(`loadPresetData(${id}): HTTP ${res.status}`);
        return undefined;
      }
      const data = (await res.json()) as {
        topic: string;
        knowledgeTree: KnowledgeNode[];
        questions: Question[];
        schedule: ScheduleItem[];
      };
      const result: PresetMeta = { ...meta, ...data };
      presetDataCache.set(id, result);
      return result;
    } finally {
      clearTimeout(timeoutId);
    }
  } catch (e) {
    // AbortError 时给出明确日志，便于诊断"骨架屏卡住"问题
    const isTimeout = e instanceof Error && e.name === "AbortError";
    console.error(
      `loadPresetData(${id}) ${isTimeout ? `超时（${FETCH_TIMEOUT_MS}ms）` : "failed"}:`,
      e,
    );
    return undefined;
  }
}

/**
 * 按主题精确匹配预设（只返回元信息，不加载重数据）
 *
 * 匹配规则：
 * 1. 完全等于预设 topic（大小写不敏感、去空白）→ 返回该预设元信息
 * 2. 完全等于预设 name（同上）→ 返回该预设元信息
 * 3. 无匹配 → 返回 undefined（走 LearnWizard 渐进式向导）
 *
 * 匹配后用 loadPresetData(id) 获取完整数据
 */
export function matchPresetByTopic(topic: string): PresetMetaInfo | undefined {
  const t = topic.trim().toLowerCase();
  if (!t) return undefined;
  for (const p of PRESET_METAS) {
    if (t === p.topic.trim().toLowerCase()) return p;
    if (t === p.name.trim().toLowerCase()) return p;
  }
  return undefined;
}
