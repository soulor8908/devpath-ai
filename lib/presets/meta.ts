// lib/presets/meta.ts
// 预设知识库【轻量元数据】——客户端组件唯一允许静态引入的 presets 模块。
//
// 设计（卡帕西视角）：
//   完整题库数据（backend.ts / llm-app.ts 等各上万行）是「内容」不是「代码」，
//   静态 import 会把 ~700kB 数据打进首包（/learn/new 842kB、/learn/[planId] 858kB）。
//   因此拆分两层：
//     - meta.ts（本文件）：id/name/icon/description/tags/topic + 统计计数，< 3kB，可静态引入
//     - loader.ts：loadPresetById(id) 动态 import 单个 preset 文件，按需加载
//   客户端组件禁止 `from "@/lib/presets"`（barrel 会拉全量数据），
//   由 __tests__/preset-bundle-guard.test.ts 守护。
//
// 计数一致性：knowledgeCount / questionCount / dayCount 与真实 preset 数据的
//   knowledgeTree.length / questions.length / schedule.length 一一对应，
//   由 preset-bundle-guard.test.ts 断言守护（改 preset 数据后必须同步更新本文件）。

/** 预设卡片元信息（列表/卡片展示 + 主题匹配用，不含题库数据） */
export interface PresetCardMeta {
  id: string;
  name: string;
  icon: string;
  description: string;
  tags: string[];
  /** 完整 preset 的 topic（matchPresetByTopic 的匹配键 + 创建计划时的默认主题） */
  topic: string;
  /** knowledgeTree.length */
  knowledgeCount: number;
  /** questions.length */
  questionCount: number;
  /** schedule.length */
  dayCount: number;
}

export const PRESET_METAS: PresetCardMeta[] = [
  {
    id: "frontend-to-ai-engineer",
    name: "前端转 AI 工程师",
    icon: "⚡",
    description:
      "策展旗舰轨道：Python 桥接 → LLM 心智模型 → API 工程化 → RAG → Agent，每节点带权威来源与面试题",
    tags: ["前端转型", "LLM", "Agent", "RAG", "策展内容"],
    topic: "前端工程师 → AI 工程师",
    knowledgeCount: 38,
    questionCount: 38,
    dayCount: 76,
  },
  {
    id: "algorithm-200",
    name: "算法 200 题",
    icon: "🎯",
    description: "Hot 100 核心 + 进阶突破 + 高频面试，覆盖数组/链表/树/DP/图论/贪心等全部专题",
    tags: ["算法", "面试", "LeetCode"],
    topic: "LeetCode 200 题全攻略",
    knowledgeCount: 14,
    questionCount: 163,
    dayCount: 28,
  },
  {
    id: "frontend",
    name: "前端工程师",
    icon: "🎨",
    description: "HTML/CSS → JS → TS → React/Vue → 性能 → 工程化 → 移动端，主流前端技术栈全覆盖",
    tags: ["前端", "React", "Vue", "TypeScript"],
    topic: "前端工程师（含 AI 前端方向）",
    knowledgeCount: 30,
    questionCount: 213,
    dayCount: 58,
  },
  {
    id: "backend",
    name: "后端工程师",
    icon: "⚙️",
    description: "Java/Python/Go 语言 + Spring/Django/FastAPI 框架 + MySQL/Redis/MQ + 微服务 + 分布式系统设计",
    tags: ["后端", "Java", "Go", "分布式"],
    topic: "后端工程师（含 AI 后端方向）",
    knowledgeCount: 30,
    questionCount: 215,
    dayCount: 60,
  },
  {
    id: "ai",
    name: "AI 工程师",
    icon: "🤖",
    description: "ML 基础 → 经典算法 → 神经网络 → CNN/RNN/Transformer → LLM → CV/推荐",
    tags: ["AI", "ML", "LLM", "深度学习"],
    topic: "AI 算法工程师",
    knowledgeCount: 30,
    questionCount: 206,
    dayCount: 60,
  },
  {
    id: "llm-app",
    name: "LLM 应用开发",
    icon: "🧠",
    description: "LLM 基础 → Prompt/API → RAG/Embedding → Agent/Function Calling → LangChain/LlamaIndex → 微调/部署/评估 → 多模态/MCP → 工程实践",
    tags: ["LLM", "RAG", "Agent", "LangChain", "MCP"],
    topic: "LLM 应用开发工程师",
    knowledgeCount: 30,
    questionCount: 211,
    dayCount: 60,
  },
];

/** 按 id 取预设元信息（轻量，同步） */
export function getPresetMetaById(id: string): PresetCardMeta | undefined {
  return PRESET_METAS.find((p) => p.id === id);
}

/**
 * 按主题精确匹配预设元信息（同步、轻量）。
 * 与 lib/presets/index.ts 的 matchPresetByTopic 规则保持一致：
 *   1. 完全等于预设 topic（大小写不敏感、去空白）→ 命中
 *   2. 完全等于预设 name（同上）→ 命中
 *   3. 否则 undefined（走 LearnWizard 渐进式向导）
 * 命中后如需完整题库数据，用 loadPresetById(meta.id) 动态加载。
 */
export function matchPresetMetaByTopic(topic: string): PresetCardMeta | undefined {
  const t = topic.trim().toLowerCase();
  if (!t) return undefined;
  for (const p of PRESET_METAS) {
    if (t === p.topic.trim().toLowerCase()) return p;
    if (t === p.name.trim().toLowerCase()) return p;
  }
  return undefined;
}
