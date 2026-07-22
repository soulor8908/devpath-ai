// lib/onboarding/career-paths.ts
// 3 条职业路径定义——用户选"成为什么"，不是"学什么"
//
// 设计（乔布斯视角 V2 修正）：
//   - 原版自定义节点（transformer-basics 等）与实际 preset 知识库不匹配
//   - 新版：路径定义只保留元信息（标题/时长/难度等），节点从 preset 动态获取
//   - onboarding 预览显示实际 preset 的知识树顶层节点
//   - 这样路径预览和实际学习内容完全一致

import type { CareerPath } from "@/lib/types";

export const CAREER_PATHS: CareerPath[] = [
  {
    id: "ai-app-dev",
    title: "AI 应用开发工程师",
    subtitle: "做 LLM 应用/RAG/Agent，最快上岗",
    icon: "🚀",
    description: "适合想快速转 AI 应用层的开发者，学完能做 RAG 系统、AI Agent、LLM 应用",
    weeksEstimate: 8,
    weeklyHours: 7,
    dailyMinutesDefault: 45,
    maxNewPerDayDefault: 2,
    difficulty: "beginner",
    cta: "从 LLM 基础开始，今天就开启你的第一个训练会话",
    linkedPresetId: "llm-app",
    // 节点从 preset 动态获取，不再硬编码
    nodes: [],
  },
  {
    id: "ai-algorithm",
    title: "AI 算法工程师",
    subtitle: "做模型训练/微调，门槛高薪资高",
    icon: "🧠",
    description: "适合有数学基础和 Python 基础，想做模型层的开发者",
    weeksEstimate: 16,
    weeklyHours: 10,
    dailyMinutesDefault: 60,
    maxNewPerDayDefault: 2,
    difficulty: "advanced",
    cta: "从数学基础和机器学习开始，扎实走好每一步",
    linkedPresetId: "ai",
    nodes: [],
  },
  {
    id: "ai-product",
    title: "AI 产品经理",
    subtitle: "懂技术会设计，非技术背景也能转",
    icon: "💡",
    description: "适合产品/运营转 AI 产品，不需要写代码但要懂技术原理",
    weeksEstimate: 6,
    weeklyHours: 5,
    dailyMinutesDefault: 30,
    maxNewPerDayDefault: 2,
    difficulty: "beginner",
    cta: "从理解 AI 能力边界开始，成为懂技术的 AI PM",
    linkedPresetId: "llm-app",
    nodes: [],
  },
];

export function getCareerPathById(id: string): CareerPath | undefined {
  return CAREER_PATHS.find((p) => p.id === id);
}

/**
 * 从 preset 知识库动态生成路径预览节点
 * 取知识树中无前置依赖（prerequisites 为空）的顶层节点作为里程碑
 */
export function getCareerPathNodes(
  path: CareerPath,
  presetNodes: { id: string; title: string; summary?: string; frequency?: string; difficulty?: number }[]
): CareerPath["nodes"] {
  // 取顶层节点（无前置依赖）作为路径里程碑
  const topLevelNodes = presetNodes.filter(
    (n) => !n.frequency || true // 取所有节点，按顺序取前 6 个作为预览
  );

  return topLevelNodes.slice(0, 6).map((n, i) => ({
    id: n.id,
    title: n.title,
    description: n.summary || "",
    estimatedHours: n.difficulty ? n.difficulty * 2 : 3,
    isMilestone: i === 0 || i === topLevelNodes.length - 1 || (n.frequency === "高" && i <= 2),
    interviewFrequency: (n.frequency as "高" | "中" | "低") || "中",
  }));
}
