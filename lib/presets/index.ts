// lib/presets/index.ts
// 预设知识库统一索引：算法 200 题 / 前端 / 后端 / AI / LLM 应用开发
// 用户选择预设时直接导入内置数据（秒级响应），
// 之后可在右上角点击"重新生成"调用 AI 重新生成整个知识树。

import type { KnowledgeNode, Question, ScheduleItem } from "../types";
import { ALGORITHM_200_PRESET } from "./algorithm-200";
import { FRONTEND_PRESET } from "./frontend";
import { BACKEND_PRESET } from "./backend";
import { AI_PRESET } from "./ai";
import { LLM_APP_PRESET } from "./llm-app";

// 预设元信息（用于 UI 卡片展示）
export interface PresetMeta {
  id: string;
  name: string;
  icon: string;
  description: string;
  tags: string[];
  // 以下字段同时是 LearningPlan 的核心数据
  topic: string;
  knowledgeTree: KnowledgeNode[];
  questions: Question[];
  schedule: ScheduleItem[];
}

export const PRESETS: PresetMeta[] = [
  {
    id: "algorithm-200",
    name: "算法 200 题",
    icon: "🎯",
    description: "Hot 100 核心 + 进阶突破 + 高频面试，覆盖数组/链表/树/DP/图论/贪心等全部专题",
    tags: ["算法", "面试", "LeetCode"],
    ...ALGORITHM_200_PRESET,
  },
  {
    id: "frontend",
    name: "前端工程师",
    icon: "🎨",
    description: "HTML/CSS → JS → TS → React/Vue → 性能 → 工程化 → 移动端，主流前端技术栈全覆盖",
    tags: ["前端", "React", "Vue", "TypeScript"],
    ...FRONTEND_PRESET,
  },
  {
    id: "backend",
    name: "后端工程师",
    icon: "⚙️",
    description: "Java/Python/Go 语言 + Spring/Django/FastAPI 框架 + MySQL/Redis/MQ + 微服务 + 分布式系统设计",
    tags: ["后端", "Java", "Go", "分布式"],
    ...BACKEND_PRESET,
  },
  {
    id: "ai",
    name: "AI 工程师",
    icon: "🤖",
    description: "ML 基础 → 经典算法 → 神经网络 → CNN/RNN/Transformer → LLM → CV/推荐",
    tags: ["AI", "ML", "LLM", "深度学习"],
    ...AI_PRESET,
  },
  {
    id: "llm-app",
    name: "LLM 应用开发",
    icon: "🧠",
    description: "LLM 基础 → Prompt/API → RAG/Embedding → Agent/Function Calling → LangChain/LlamaIndex → 微调/部署/评估 → 多模态/MCP → 工程实践",
    tags: ["LLM", "RAG", "Agent", "LangChain", "MCP"],
    ...LLM_APP_PRESET,
  },
];

/** 按 id 取预设 */
export function getPresetById(id: string): PresetMeta | undefined {
  return PRESETS.find((p) => p.id === id);
}

/**
 * P2 AI 等待优化：按主题关键词匹配最接近的预设
 * 用于"输入主题 → 立即展示骨架知识树 → 右上角 AI 异步优化"流程
 *
 * 匹配规则：
 * 1. 主题包含预设 name 或 tags 中任一关键词 → 返回该预设
 * 2. 多个匹配 → 返回得分最高的（命中 tag 数多者胜）
 * 3. 无匹配 → 返回 undefined（调用方回退到 AI 全量生成）
 */
export function matchPresetByTopic(topic: string): PresetMeta | undefined {
  const t = topic.trim().toLowerCase();
  if (!t) return undefined;

  let best: { preset: PresetMeta; score: number } | null = null;
  for (const p of PRESETS) {
    let score = 0;
    // name 命中得 3 分（强信号）
    if (t.includes(p.name.toLowerCase())) score += 3;
    // tags 命中每个得 2 分
    for (const tag of p.tags) {
      if (t.includes(tag.toLowerCase())) score += 2;
    }
    // topic 命中（预设主题通常更具体）得 1 分
    if (t.includes(p.topic.toLowerCase().slice(0, 4))) score += 1;

    if (score > 0 && (!best || score > best.score)) {
      best = { preset: p, score };
    }
  }
  return best?.preset;
}
