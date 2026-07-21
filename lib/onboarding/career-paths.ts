// lib/onboarding/career-paths.ts
// 3 条职业路径定义——用户选"成为什么"，不是"学什么"

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
    cta: "从 Transformer 基础开始，今天就开启你的第一个训练会话",
    linkedPresetId: "llm-app",
    nodes: [
      { id: "transformer-basics", title: "Transformer 基础", description: "理解 Attention 机制和 Transformer 架构", estimatedHours: 3, isMilestone: true, interviewFrequency: "高" },
      { id: "prompt-engineering", title: "Prompt Engineering", description: "学会和 LLM 有效对话，掌握 CoT/Few-shot 等", estimatedHours: 2, isMilestone: false, interviewFrequency: "高" },
      { id: "llm-api", title: "LLM API 调用", description: "OpenAI/国产大模型 API 实战，流式+工具调用", estimatedHours: 4, isMilestone: false, interviewFrequency: "中" },
      { id: "rag", title: "RAG 检索增强生成", description: "搭建完整 RAG 系统：嵌入+向量库+检索+生成", estimatedHours: 6, isMilestone: true, interviewFrequency: "高" },
      { id: "agents", title: "Agent 智能体", description: "ReAct/工具调用/多 Agent 协作", estimatedHours: 6, isMilestone: false, interviewFrequency: "高" },
      { id: "interview-ready", title: "模拟面试通关", description: "AI 模拟面试+面经复盘", estimatedHours: 8, isMilestone: true, interviewFrequency: "高" },
    ],
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
    cta: "从数学基础和 PyTorch 开始，扎实走好每一步",
    linkedPresetId: "ai",
    nodes: [
      { id: "math-foundations", title: "数学基础", description: "线性代数/概率论/微积分核心概念", estimatedHours: 8, isMilestone: true, interviewFrequency: "中" },
      { id: "ml-basics", title: "机器学习基础", description: "监督/无监督/强化学习，经典算法", estimatedHours: 10, isMilestone: false, interviewFrequency: "高" },
      { id: "deep-learning", title: "深度学习", description: "CNN/RNN/Transformer 架构与训练", estimatedHours: 12, isMilestone: true, interviewFrequency: "高" },
      { id: "fine-tuning", title: "模型微调", description: "LoRA/QLoRA/全量微调实战", estimatedHours: 8, isMilestone: false, interviewFrequency: "高" },
      { id: "interview-ready", title: "模拟面试通关", description: "AI 模拟面试+算法面+系统设计", estimatedHours: 10, isMilestone: true, interviewFrequency: "高" },
    ],
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
    nodes: [
      { id: "ai-capabilities", title: "AI 能力边界", description: "理解 LLM 能做什么、不能做什么", estimatedHours: 3, isMilestone: true, interviewFrequency: "高" },
      { id: "product-design", title: "AI 产品设计", description: "Prompt 驱动产品设计、AI Native 交互", estimatedHours: 4, isMilestone: false, interviewFrequency: "高" },
      { id: "evaluation", title: "AI 评估与优化", description: "如何评估 AI 产品效果、持续迭代", estimatedHours: 3, isMilestone: false, interviewFrequency: "中" },
      { id: "interview-ready", title: "模拟面试通关", description: "AI PM 面试模拟+案例分析", estimatedHours: 6, isMilestone: true, interviewFrequency: "高" },
    ],
  },
];

export function getCareerPathById(id: string): CareerPath | undefined {
  return CAREER_PATHS.find((p) => p.id === id);
}
