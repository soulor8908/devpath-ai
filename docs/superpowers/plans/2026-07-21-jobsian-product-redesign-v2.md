# devpath-ai 乔布斯视角产品重构计划 V2（基于最新系统状态）

&gt; **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在已有 6 区首页 + 2 Tab 导航 + study-queue 智能排序 + LearnWizard 渐进式生成的基础上，完成"AI 面试通关教练"的产品重构——聚焦 Path/Train/Interview 三模式，让用户从"使用工具"转变为"被教练陪跑"。

**Architecture:** 复用已有基础设施（UI 组件库、节奏引擎、用户画像、study-queue、番茄钟组件化），新增三层体验：1) Path 路径视图替代 KPI 三宫格；2) Train 沉浸式会话整合学习+复习+番茄钟；3) Interview AI 模拟面试闭环。核心是"减法+聚焦"，不是推倒重来。

**Tech Stack:** Next.js 15 + React 19 + TypeScript + Tailwind CSS + IndexedDB（复用现有技术栈，零新增依赖）

---

## 第一部分：最新系统诊断（V2 基线）

### 已落地的优化（相比 V1 计划）

| 优化项 | 状态 | 说明 |
|---|---|---|
| 底部导航减法 | ✅ 已完成 | 8 Tab → 4 Tab → **2 Tab**（今日/我的），超额完成 |
| 首页区块简化 | ✅ 已完成 | 12 区 → **6 区**（Hero/情绪/KPI/洞察/能量/热力图/队列） |
| 学习+复习合并队列 | ✅ 已完成 | `lib/study-queue/` 智能排序，首页 studyQueue 统一入口 |
| 番茄钟组件化 | ✅ 已完成 | `/timer` 路由移除，改为 `PomodoroWidget` 全局浮动 + 事件触发 Modal |
| 情绪快捷记录 | ✅ 已完成 | `EmotionQuickPicker` 3 emoji 一行，从折叠区提到 Hero 区 |
| 空数据区块隐藏 | ✅ 已完成 | 新账户隐藏洞察/能量/热力图区，避免空状态噪音 |
| LearnWizard 渐进式生成 | ✅ 已完成 | 4 步状态机（知识→题目→答案→保存），每步可独立重新生成 |
| UI 组件库统一 | ✅ 已完成 | 14 个组件 + 守护测试，原生表单元素禁止 |
| AI 质量观测 | ✅ 已完成 | 调用数/采纳率/成本追踪 |
| API Key 加密 session | ✅ 已完成 | exchangeSession + revokeSession |

### 仍未解决的核心问题（V2 诊断）

#### 问题 1：首页仍是"仪表盘思维"，不是"教练思维"
当前 [HomeClient.tsx](file:///workspace/app/HomeClient.tsx) 是 6 区仪表盘：CurrentTaskCard + 情绪 + KPI 三宫格 + AI 洞察 + 能量趋势 + 热力图 + 学习队列。

**乔布斯会问：** "用户打开 app，3 秒内能知道'我离拿 offer 还有多远'吗？"
**答案：** 不能。用户看到的是"今日学习清单 5 项、已完成 2 项、连续打卡 7 天"——这是过程指标，不是结果指标。用户真正想知道的是："我现在的水平能面试了吗？""还要学多久？"

#### 问题 2：Onboarding 仍要求配置，Aha Moment 不够快
当前 [onboarding/page.tsx](file:///workspace/app/onboarding/page.tsx) 第 2 步仍然让用户配置：
- 每日学习量（Slider 15-120 分钟）
- 每日新内容数（Slider 1-5 个）
- AI API Key（Input）

**乔布斯会说：** "用户还没体验到价值，凭什么让他配置？" 这三个配置项应该全部消失，用合理默认值（45分钟/2个新内容/无API Key也能用预设数据），等用户真正需要时再引导。

#### 问题 3：学习体验是"浏览式"，不是"沉浸式"
当前 [PlanDetailClient.tsx](file:///workspace/app/learn/[planId]/PlanDetailClient.tsx) 是一个信息密集的详情页：知识树 + 脑图 + 题目列表 + 筛选器 + 重新生成弹窗。

**问题：** 用户需要自己决定"先看哪个知识点、先做哪道题"。没有引导式的学习流，用户容易迷失或跳过。真正的教练应该带你走："现在学这个 → 学完立即测 → 测完继续下一个"，而不是把所有内容摊开让你自己挑。

#### 问题 4：学习和复习仍是两个独立页面
虽然 study-queue 在首页合并了待办，但点击后：
- 学习任务 → 跳 `/learn/[planId]` 详情页
- 复习任务 → 跳 `/review` 独立页

**两个页面的交互模式完全不同**，用户在页面间跳转时会丢失心流。应该有一个统一的"训练会话"页面，智能调度学→练→复，不跳转。

#### 问题 5：预设是"技术主题"，不是"职业路径"
当前 [presets/index.ts](file:///workspace/lib/presets/index.ts) 5 个预设：算法200题/前端/后端/AI工程师/LLM应用开发。

**问题：** 这些是"学什么"，不是"成为什么"。用户的目标不是"学 LLM 应用开发"，而是"拿到 AI 应用开发工程师的 offer"。职业路径应该有明确的起点、终点、里程碑、预计时间，而不是一个知识树。

#### 问题 6：AI 仍是"工具按钮"，不是"教练"
CurrentTaskCard 虽然集成了节奏引擎，但本质还是"显示当前该做什么 + 一个跳转按钮"。AI 聊天是浮动按钮（FloatingChat），和 ChatGPT 体验无异。

**缺失的魔法时刻：**
- 连续3题做错 → AI 应该主动暂停推进，带你复习前置知识
- 专注50分钟 → AI 应该主动提醒休息，而不是等用户自己开番茄钟
- 一周没学习 → AI 应该发一条有温度的消息，不是冷冰冰的通知
- 路径走到80% → AI 应该主动说"你准备好模拟面试了"，而不是让用户自己发现

---

## 第二部分：V2 重构策略——"渐进式聚焦"，不是推倒重来

### 核心原则
1. **复用已有基础设施**——不重写 UI 组件库、节奏引擎、study-queue、番茄钟组件
2. **新增三个核心页面**——Path（首页升级）、Train（新会话页）、Interview（新面试页）
3. **逐步下线旧页面**——不一次性删除，新页面就绪后通过路由重定向过渡
4. **每个 Task 可独立交付**——不是大爆炸式重构，而是渐进式改进

### 三模式架构（V2 调整）

| 模式 | V1 计划 | V2 调整（基于已有基础） |
|---|---|---|
| **Path** | 全新路径视图 | **升级现有首页**：在 6 区基础上，Hero 区替换为 Path 进度条，KPI 三宫格降级为辅助信息 |
| **Train** | 全新训练会话页 | **新增 `/train` 路由**：复用 study-queue 调度逻辑 + QuestionCard + PomodoroWidget，封装为沉浸式会话 |
| **Interview** | 全新模拟面试 | **新增 `/interview` 路由**：复用 AI 聊天流式 + chat-tools，封装为面试场景 |

### 砍掉/降级的功能（V2 保留更多，更务实）

| 功能 | V1 计划 | V2 调整 |
|---|---|---|
| 手动情绪记录 | 砍掉 | **保留快捷版**（EmotionQuickPicker 已极简），废弃深度记录页 |
| 手动能量配置 | 砍掉 | **保留但降级**——从首页移除 EnergyTrendMini，移到 Profile 页 |
| 公开主页 | 砍掉 | **保留**——已有成就墙和分享功能，不主动推但不删除 |
| 复杂统计仪表盘 | 砍掉 | **保留 /stats**——开发者用户群喜欢数据，不强制 |
| AI Persona 手动选择 | 砍掉 | **保留手动覆盖**，但增加自动切换逻辑 |
| 周报 | 砍掉 | **保留**——改为 Path 进度页的一个 section |

---

## 第三部分：文件结构规划

### 新增文件

| 文件 | 职责 | 依赖的已有模块 |
|---|---|---|
| `lib/onboarding/career-paths.ts` | 3 条职业路径定义（AI应用/AI算法/AI产品） | 复用 `lib/presets/` 数据 |
| `components/PathProgressBar.tsx` | 路径进度可视化（一条线+节点+里程碑） | 新组件 |
| `components/PathCoachInsight.tsx` | AI 教练洞察卡片（替代冰冷统计） | 复用 `lib/ai/rhythm-engine` |
| `app/train/page.tsx` | 训练会话入口路由 | 复用 `lib/study-queue/` |
| `app/train/TrainClient.tsx` | 训练会话客户端（状态机） | 复用 `QuestionCard` + `PomodoroWidget` |
| `components/TrainSessionFlow.tsx` | 训练会话流程组件（学→练→复→休息） | 新组件 |
| `components/KnowledgeBrief.tsx` | 知识点简洁讲解卡片（极简版，3段以内） | 新组件 |
| `components/SocraticFeedback.tsx` | 答题反馈（苏格拉底式引导，不直接给答案） | 新组件 |
| `app/interview/page.tsx` | 模拟面试入口路由 | 复用 `lib/ai/chat-context` |
| `app/interview/InterviewClient.tsx` | 面试会话客户端 | 复用 `ChatClient` 流式逻辑 |
| `components/InterviewReport.tsx` | 面试反馈报告 | 新组件 |
| `lib/ai/interview-coach.ts` | 面试官逻辑（追问+评分+反馈生成） | 复用 `lib/ai/prompts` |
| `lib/ai/train-scheduler.ts` | 训练会话智能调度（学→练→复顺序决策） | 复用 `lib/study-queue/` |
| `lib/ai/behavior-analyzer.ts` | 行为感知（从答题/打断/时长推断状态） | 复用 `lib/ai/energy-pattern` |

### 修改文件

| 文件 | 改动 |
|---|---|
| `app/HomeClient.tsx` | Hero 区替换为 PathProgressBar + CoachInsight，KPI 降级 |
| `app/onboarding/page.tsx` | 移除 Slider/Key 配置，改为 3 选 1 + 一键开始 |
| `components/Nav.tsx` | 2 Tab → 3 Tab（今日/训练/我的），训练 Tab 在路径 80% 时解锁 |
| `lib/presets/index.ts` | 增加 `careerPathId` 字段关联职业路径 |
| `lib/types.ts` | 增加 `CareerPath`、`TrainSession`、`InterviewSession` 类型 |

### 逐步下线（不删除，路由重定向）

| 路由 | 处理 |
|---|---|
| `/review` | 训练会话就绪后，重定向到 `/train?mode=review` |
| `/learn/[planId]` | 训练会话就绪后，学习部分重定向到 `/train?planId=xxx` |
| `/emotion` | 保留（深度记录），但首页只留 EmotionQuickPicker |
| `/dashboard` | 保留，但首页不再链接 |
| `/timer` | 已移除（番茄钟组件化） |

---

## 第四部分：任务分解（按优先级）

### Task 1: Onboarding 极简化——移除配置，3选1+一键开始

**Files:**
- Modify: `app/onboarding/page.tsx`（全量重写第 2 步）
- Create: `lib/onboarding/career-paths.ts`
- Modify: `lib/types.ts`（增加 CareerPath 类型）

**设计原则：** 用户不需要配置任何东西。默认 45 分钟/天、2 个新内容/天、无 API Key 也能用预设数据。API Key 在第一次需要 AI 生成时再优雅提示。

- [ ] **Step 1: 写失败的 onboarding 极简测试**

```tsx
// __tests__/onboarding-v2.test.ts
import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import OnboardingPage from "@/app/onboarding/page";

describe("Onboarding V2（极简版）", () => {
  it("第一步显示3个职业路径选择，不是5个技术预设", () => {
    render(<OnboardingPage />);
    expect(screen.getByText(/AI 应用开发工程师/)).toBeInTheDocument();
    expect(screen.getByText(/AI 算法工程师/)).toBeInTheDocument();
    expect(screen.getByText(/AI 产品经理/)).toBeInTheDocument();
    // 不应该有算法200题/前端/后端这些技术预设
    expect(screen.queryByText(/算法 200 题/)).not.toBeInTheDocument();
  });

  it("点击路径后不应该有 Slider 和 API Key 输入", () => {
    render(<OnboardingPage />);
    fireEvent.click(screen.getByText(/AI 应用开发工程师/));
    // 不应该有配置项
    expect(screen.queryByLabelText(/每日学习量/)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/每日新内容数/)).not.toBeInTheDocument();
    expect(screen.queryByPlaceholderText(/sk-/)).not.toBeInTheDocument();
  });

  it("点击路径后应该显示路径预览+预计时间+一键开始按钮", () => {
    render(<OnboardingPage />);
    fireEvent.click(screen.getByText(/AI 应用开发工程师/));
    expect(screen.getByText(/预计.*周/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /开始第一次训练/ })).toBeInTheDocument();
  });

  it("点击开始应该跳转到 /train，而不是 /learn/xxx", () => {
    // 验证 router.push 到 /train?planId=xxx
  });
});
```

- [ ] **Step 2: 运行测试确认失败**

Run: `npx vitest run __tests__/onboarding-v2.test.ts -v`
Expected: FAIL

- [ ] **Step 3: 创建职业路径定义**

Create `lib/onboarding/career-paths.ts`:

```typescript
import type { CareerPath, CareerPathNode } from "@/lib/types";

/**
 * 3 条职业路径定义
 *
 * 设计（乔布斯视角）：
 *   - 用户目标是"拿到 offer"，不是"学知识树"
 *   - 每条路径有明确起点、终点、里程碑、预计时间
 *   - 路径节点关联已有 presets 的 knowledgeTree，复用数据
 */
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
      {
        id: "transformer-basics",
        title: "Transformer 基础",
        description: "理解 Attention 机制和 Transformer 架构",
        estimatedHours: 3,
        isMilestone: true,
        interviewFrequency: "高",
      },
      {
        id: "prompt-engineering",
        title: "Prompt Engineering",
        description: "学会和 LLM 有效对话，掌握 CoT/Few-shot 等",
        estimatedHours: 2,
        isMilestone: false,
        interviewFrequency: "高",
      },
      {
        id: "llm-api",
        title: "LLM API 调用",
        description: "OpenAI/国产大模型 API 实战，流式+工具调用",
        estimatedHours: 4,
        isMilestone: false,
        interviewFrequency: "中",
      },
      {
        id: "rag",
        title: "RAG 检索增强生成",
        description: "搭建完整 RAG 系统：嵌入+向量库+检索+生成",
        estimatedHours: 6,
        isMilestone: true,
        interviewFrequency: "高",
      },
      {
        id: "agents",
        title: "Agent 智能体",
        description: "ReAct/工具调用/多 Agent 协作",
        estimatedHours: 6,
        isMilestone: false,
        interviewFrequency: "高",
      },
      {
        id: "interview-ready",
        title: "模拟面试通关",
        description: "AI 模拟面试+面经复盘",
        estimatedHours: 8,
        isMilestone: true,
        interviewFrequency: "高",
      },
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
      {
        id: "math-foundations",
        title: "数学基础",
        description: "线性代数/概率论/微积分核心概念",
        estimatedHours: 8,
        isMilestone: true,
        interviewFrequency: "中",
      },
      {
        id: "ml-basics",
        title: "机器学习基础",
        description: "监督/无监督/强化学习，经典算法",
        estimatedHours: 10,
        isMilestone: false,
        interviewFrequency: "高",
      },
      {
        id: "deep-learning",
        title: "深度学习",
        description: "CNN/RNN/Transformer 架构与训练",
        estimatedHours: 12,
        isMilestone: true,
        interviewFrequency: "高",
      },
      {
        id: "fine-tuning",
        title: "模型微调",
        description: "LoRA/QLoRA/全量微调实战",
        estimatedHours: 8,
        isMilestone: false,
        interviewFrequency: "高",
      },
      {
        id: "interview-ready",
        title: "模拟面试通关",
        description: "AI 模拟面试+算法面+系统设计",
        estimatedHours: 10,
        isMilestone: true,
        interviewFrequency: "高",
      },
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
      {
        id: "ai-capabilities",
        title: "AI 能力边界",
        description: "理解 LLM 能做什么、不能做什么",
        estimatedHours: 3,
        isMilestone: true,
        interviewFrequency: "高",
      },
      {
        id: "product-design",
        title: "AI 产品设计",
        description: "Prompt 驱动产品设计、AI Native 交互",
        estimatedHours: 4,
        isMilestone: false,
        interviewFrequency: "高",
      },
      {
        id: "evaluation",
        title: "AI 评估与优化",
        description: "如何评估 AI 产品效果、持续迭代",
        estimatedHours: 3,
        isMilestone: false,
        interviewFrequency: "中",
      },
      {
        id: "interview-ready",
        title: "模拟面试通关",
        description: "AI PM 面试模拟+案例分析",
        estimatedHours: 6,
        isMilestone: true,
        interviewFrequency: "高",
      },
    ],
  },
];

export function getCareerPathById(id: string): CareerPath | undefined {
  return CAREER_PATHS.find((p) => p.id === id);
}
```

- [ ] **Step 4: 增加 CareerPath 类型定义**

Modify `lib/types.ts`，在合适位置增加：

```typescript
export interface CareerPathNode {
  id: string;
  title: string;
  description: string;
  estimatedHours: number;
  isMilestone: boolean;
  interviewFrequency: "高" | "中" | "低";
}

export interface CareerPath {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  description: string;
  weeksEstimate: number;
  weeklyHours: number;
  dailyMinutesDefault: number;
  maxNewPerDayDefault: number;
  difficulty: "beginner" | "intermediate" | "advanced";
  cta: string;
  linkedPresetId: string;
  nodes: CareerPathNode[];
}
```

- [ ] **Step 5: 重写 onboarding 页面**

Rewrite `app/onboarding/page.tsx`——核心改动：
1. 第 1 步：从 `PRESETS`（5个技术预设）改为 `CAREER_PATHS`（3个职业路径）
2. 第 2 步：移除 Slider（dailyMinutes/maxNewPerDay）和 Input（aiKey），改为路径预览+预计时间+一键开始
3. 默认值从路径定义取（`path.dailyMinutesDefault` / `path.maxNewPerDayDefault`）
4. 跳转目标从 `/learn/${planId}` 改为 `/train?planId=${planId}`

```tsx
"use client";

// app/onboarding/page.tsx
// V2 极简化：3 选 1 → 路径预览 → 一键开始（零配置）
//
// 设计（乔布斯视角）：
//   - 用户目标是"拿到 offer"，不是"配置学习参数"
//   - 默认值从路径定义取，不让用户选
//   - API Key 在第一次需要 AI 生成时再提示，不堵在门口
//   - 跳转 /train 而不是 /learn，立即进入沉浸式训练

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { setItem, set as dbSet } from "@/lib/storage/db";
import { KEY_PREFIXES, type LearningPlan, type CareerPath as CareerPathType } from "@/lib/types";
import { CAREER_PATHS } from "@/lib/onboarding/career-paths";
import { getPresetById } from "@/lib/presets";
import { Icon } from "@/components/Icon";
import { Button } from "@/components/ui";
import { nanoid } from "nanoid";

export default function OnboardingPage() {
  const router = useRouter();
  const [selectedPath, setSelectedPath] = useState<CareerPathType | null>(null);
  const [starting, setStarting] = useState(false);

  async function handleStart() {
    if (!selectedPath) return;
    setStarting(true);
    try {
      const now = new Date().toISOString();
      const preset = getPresetById(selectedPath.linkedPresetId);
      const plan: LearningPlan = {
        id: nanoid(),
        topic: selectedPath.title,
        knowledgeTree: preset?.knowledgeTree ?? [],
        questions: preset?.questions ?? [],
        schedule: preset?.schedule ?? [],
        dailyMinutes: selectedPath.dailyMinutesDefault,
        maxNewPerDay: selectedPath.maxNewPerDayDefault,
        fsrsMode: "standard",
        createdAt: now,
        updatedAt: now,
      };
      await setItem(KEY_PREFIXES.PLAN + plan.id, plan);
      await dbSet("my:onboarding", {
        pathId: selectedPath.id,
        planId: plan.id,
        completedAt: now,
      });
      // 立即开始第一个训练会话
      router.push(`/train?planId=${plan.id}`);
    } finally {
      setStarting(false);
    }
  }

  // 第一步：3 选 1
  if (!selectedPath) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 max-w-lg mx-auto pb-20">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold mb-3">你想成为哪种 AI 人才？</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            选一个方向，我们立即为你定制学习路径
          </p>
        </div>

        <div className="w-full space-y-3">
          {CAREER_PATHS.map((path) => (
            <button
              key={path.id}
              onClick={() => setSelectedPath(path)}
              className="w-full bg-white dark:bg-gray-800 border-2 border-gray-100 dark:border-gray-700 rounded-2xl p-5 text-left hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-lg transition-all group"
            >
              <div className="flex items-start gap-4">
                <span className="text-4xl">{path.icon}</span>
                <div className="flex-1">
                  <h3 className="font-bold text-lg mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {path.title}
                  </h3>
                  <p className="text-sm text-blue-600 dark:text-blue-400 font-medium mb-1">
                    {path.subtitle}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                    {path.description}
                  </p>
                  <div className="flex gap-3 text-xs text-gray-400">
                    <span className="flex items-center gap-1">
                      <Icon name="clock" className="w-3 h-3" />
                      约 {path.weeksEstimate} 周
                    </span>
                    <span className="flex items-center gap-1">
                      <Icon name="map" className="w-3 h-3" />
                      {path.nodes.length} 个阶段
                    </span>
                    <span className="flex items-center gap-1">
                      <Icon name="target" className="w-3 h-3" />
                      每天 {path.dailyMinutesDefault} 分钟
                    </span>
                  </div>
                </div>
                <Icon
                  name="chevron-right"
                  className="w-5 h-5 text-gray-300 group-hover:text-blue-500 group-hover:translate-x-1 transition-all mt-2"
                />
              </div>
            </button>
          ))}
        </div>

        <p className="text-xs text-gray-400 mt-8 text-center">
          已经知道自己要学什么？{" "}
          <Link href="/learn/new" className="text-blue-500 hover:underline">
            自定义学习主题 →
          </Link>
        </p>
      </div>
    );
  }

  // 第二步：路径预览 + 一键开始（零配置）
  return (
    <div className="min-h-screen flex flex-col p-4 max-w-lg mx-auto pb-20">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setSelectedPath(null)}
        className="self-start mb-4"
      >
        <Icon name="chevron-right" className="w-4 h-4 rotate-180 mr-1" />
        重选
      </Button>

      <div className="text-center mb-6">
        <span className="text-6xl mb-4 block">{selectedPath.icon}</span>
        <h1 className="text-2xl font-bold mb-2">{selectedPath.title}</h1>
        <p className="text-gray-500 dark:text-gray-400">{selectedPath.subtitle}</p>
      </div>

      {/* Aha Moment 卡片 */}
      <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl p-6 text-white mb-6 shadow-xl">
        <p className="text-sm opacity-80 mb-1">看到了。</p>
        <p className="text-xl font-bold mb-2">
          每天投入 {selectedPath.dailyMinutesDefault} 分钟，预计
          <span className="text-yellow-300"> {selectedPath.weeksEstimate} 周 </span>
          可以准备好面试。
        </p>
        <p className="text-sm opacity-80">我们从今天开始。</p>
      </div>

      {/* 路径节点预览 */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 mb-6 border dark:border-gray-700">
        <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-3">
          你的学习路径
        </p>
        <div className="space-y-0">
          {selectedPath.nodes.map((node, i) => (
            <div key={node.id} className="flex items-start gap-3">
              <div className="flex flex-col items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    node.isMilestone
                      ? "bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300"
                      : "bg-gray-100 dark:bg-gray-700 text-gray-500"
                  }`}
                >
                  {node.isMilestone ? (
                    <Icon name="star" className="w-4 h-4" />
                  ) : (
                    i + 1
                  )}
                </div>
                {i < selectedPath.nodes.length - 1 && (
                  <div className="w-0.5 h-6 bg-gray-200 dark:bg-gray-600" />
                )}
              </div>
              <div className="flex-1 pb-3">
                <p className="font-medium text-sm">{node.title}</p>
                <p className="text-xs text-gray-400">
                  {node.description} · {node.estimatedHours}h
                </p>
              </div>
            </div>
          ))}
          {/* 终点线 */}
          <div className="flex items-center gap-3 mt-1">
            <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
              <Icon name="check" className="w-4 h-4 text-white" />
            </div>
            <p className="font-medium text-green-600 dark:text-green-400">
              拿到 offer 🏆
            </p>
          </div>
        </div>
      </div>

      <Button
        variant="success"
        size="lg"
        block
        onClick={handleStart}
        loading={starting}
        className="text-lg py-4 rounded-full shadow-lg"
        leftIcon={starting ? undefined : "zap"}
      >
        {starting ? "准备中..." : "开始第一次训练 →"}
      </Button>

      <p className="text-xs text-gray-400 text-center mt-3">{selectedPath.cta}</p>
    </div>
  );
}
```

- [ ] **Step 6: 运行测试确认通过**

Run: `npx vitest run __tests__/onboarding-v2.test.ts -v`
Expected: PASS

- [ ] **Step 7: 运行类型检查和 lint**

Run: `npm run typecheck && npm run lint`
Expected: 0 errors

- [ ] **Step 8: Commit**

```bash
git add app/onboarding/page.tsx lib/onboarding/career-paths.ts lib/types.ts __tests__/onboarding-v2.test.ts
git commit -m "feat: onboarding 极简化为 3选1+一键开始（乔布斯视角 V2）"
```

---

### Task 2: 首页 Hero 区升级为 Path 路径视图

**Files:**
- Modify: `app/HomeClient.tsx`（Hero 区替换）
- Create: `components/PathProgressBar.tsx`
- Create: `components/PathCoachInsight.tsx`
- Modify: `lib/home.ts`（增加路径进度计算）

**设计原则：** 不重写整个首页，只替换 Hero 区。CurrentTaskCard 保留但降级为 Path 下方辅助信息。KPI 三宫格保留但视觉降级。

- [ ] **Step 1: 写 Path 进度条测试**

```tsx
// __tests__/path-progress.test.ts
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { PathProgressBar } from "@/components/PathProgressBar";

describe("PathProgressBar", () => {
  it("应该显示进度百分比和离目标的预计时间", () => {
    render(
      <PathProgressBar
        careerTitle="AI 应用开发工程师"
        icon="🚀"
        progress={58}
        weeksLeft={4}
        currentNodeTitle="RAG 检索增强生成"
      />
    );
    expect(screen.getByText(/58%/)).toBeInTheDocument();
    expect(screen.getByText(/预计.*4 周/)).toBeInTheDocument();
    expect(screen.getByText(/RAG 检索增强生成/)).toBeInTheDocument();
  });

  it("进度条应该有 role=progressbar 和 aria 属性", () => {
    render(<PathProgressBar careerTitle="test" icon="🚀" progress={50} weeksLeft={4} currentNodeTitle="test" />);
    const bar = screen.getByRole("progressbar");
    expect(bar).toHaveAttribute("aria-valuenow", "50");
    expect(bar).toHaveAttribute("aria-valuemin", "0");
    expect(bar).toHaveAttribute("aria-valuemax", "100");
  });
});
```

- [ ] **Step 2: 创建 PathProgressBar 组件**

Create `components/PathProgressBar.tsx`:

```tsx
"use client";

// components/PathProgressBar.tsx
// 路径进度可视化——首页 Hero 区核心组件
//
// 设计（乔布斯视角）：
//   - 替代原 CurrentTaskCard + KPI 三宫格作为视觉焦点
//   - 用户打开 app 第一眼看到：离目标还有多远
//   - 进度条 + 当前位置 + 预计时间 = 3 秒知道答案
//   - 一个主按钮：开始今天的训练

import Link from "next/link";
import { Icon } from "@/components/Icon";
import { Button } from "@/components/ui";

interface PathProgressBarProps {
  careerTitle: string;
  icon: string;
  progress: number; // 0-100
  weeksLeft: number;
  currentNodeTitle: string;
  trainHref?: string;
}

export function PathProgressBar({
  careerTitle,
  icon,
  progress,
  weeksLeft,
  currentNodeTitle,
  trainHref = "/train",
}: PathProgressBarProps) {
  return (
    <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl p-5 text-white shadow-lg">
      {/* 头部：目标 */}
      <div className="flex items-center gap-2 mb-4">
        <span className="text-2xl">{icon}</span>
        <span className="text-sm opacity-90">{careerTitle}</span>
      </div>

      {/* 进度条 */}
      <div className="mb-3">
        <div className="flex justify-between items-baseline mb-1.5">
          <span className="text-3xl font-bold">{progress}%</span>
          <span className="text-sm opacity-80">
            预计 <span className="font-bold text-yellow-300">{weeksLeft} 周</span> 后可面试
          </span>
        </div>
        <div
          className="h-3 bg-white/20 rounded-full overflow-hidden"
          role="progressbar"
          aria-valuenow={progress}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`离 ${careerTitle} offer 还有 ${progress}%`}
        >
          <div
            className="h-full bg-white rounded-full transition-all duration-1000"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* 当前位置 */}
      <div className="flex items-center gap-2 mb-4 text-sm opacity-90">
        <Icon name="map-pin" className="w-4 h-4" />
        <span>当前位置：</span>
        <span className="font-bold">{currentNodeTitle}</span>
      </div>

      {/* 主按钮 */}
      <Link href={trainHref}>
        <Button
          variant="secondary"
          size="lg"
          block
          className="bg-white text-blue-600 hover:bg-gray-50 font-bold"
          leftIcon="target"
        >
          开始今天的训练
        </Button>
      </Link>
    </div>
  );
}
```

- [ ] **Step 3: 创建 PathCoachInsight 组件**

Create `components/PathCoachInsight.tsx`——AI 教练有温度的洞察卡片，替代冰冷的统计数字：

```tsx
"use client";

// components/PathCoachInsight.tsx
// AI 教练洞察——有温度的每日一句话，不是冰冷统计
//
// 设计（乔布斯视角）：
//   - 不显示"今日调用数/采纳率"这种工程师自嗨指标
//   - 用教练的口吻说一句话，基于用户昨天/今天的行为
//   - 举例："你昨天在向量检索相关题上错了2道，我们今天会先巩固这部分再往前推进。"

import { Icon, type IconName } from "@/components/Icon";

export interface CoachInsight {
  tone: "encouraging" | "reminding" | "challenging" | "celebrating";
  message: string;
  icon: IconName;
}

interface PathCoachInsightProps {
  insight: CoachInsight | null;
}

const TONE_STYLES: Record<CoachInsight["tone"], string> = {
  encouraging: "bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300",
  reminding: "bg-orange-50 dark:bg-orange-950/30 border-orange-200 dark:border-orange-800 text-orange-700 dark:text-orange-300",
  challenging: "bg-purple-50 dark:bg-purple-950/30 border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300",
  celebrating: "bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800 text-green-700 dark:text-green-300",
};

export function PathCoachInsight({ insight }: PathCoachInsightProps) {
  if (!insight) return null;

  return (
    <div className={`rounded-xl border p-3 flex items-start gap-2.5 ${TONE_STYLES[insight.tone]}`}>
      <Icon name={insight.icon} className="w-4 h-4 mt-0.5 shrink-0" />
      <p className="text-sm leading-relaxed">{insight.message}</p>
    </div>
  );
}
```

- [ ] **Step 4: 修改 HomeClient Hero 区**

Modify `app/HomeClient.tsx`——替换 Hero 区的 CurrentTaskCard + 番茄钟入口为 PathProgressBar + CoachInsight：

关键改动：
1. Hero 区第 1 行保留问候+分享
2. 第 2 行替换为 `PathProgressBar`（如果有 careerPath）或保留 `CurrentTaskCard`（兼容旧 plan）
3. 第 3 行新增 `PathCoachInsight`
4. 番茄钟入口移到学习队列区（不再是 Hero 区焦点）
5. KPI 三宫格保留但视觉降级（缩小字号）

- [ ] **Step 5: 修改 lib/home.ts 增加路径进度计算**

在 `useHomeData` 中增加：
- `careerPath`：从 plan 的 pathId 获取
- `pathProgress`：基于已完成节点数/总节点数计算
- `weeksLeft`：基于剩余节点预估时间/周时长计算
- `coachInsight`：基于昨日答题正确率、今日完成情况、连续天数生成

- [ ] **Step 6: 运行测试、类型检查、lint**

- [ ] **Step 7: Commit**

---

### Task 3: 创建 Train 沉浸式训练会话

**Files:**
- Create: `app/train/page.tsx`
- Create: `app/train/TrainClient.tsx`
- Create: `components/TrainSessionFlow.tsx`
- Create: `components/KnowledgeBrief.tsx`
- Create: `components/SocraticFeedback.tsx`
- Create: `lib/ai/train-scheduler.ts`

**设计原则：** 复用 study-queue 的调度逻辑，但封装为沉浸式单页面体验。学→练→复→休息在一个会话内完成，不跳转。

- [ ] **Step 1: 写训练会话状态机测试**

```tsx
// __tests__/train-session.test.ts
import { describe, it, expect } from "vitest";
import { TrainSessionFlow } from "@/components/TrainSessionFlow";
import { render, screen } from "@testing-library/react";

describe("TrainSessionFlow 沉浸式训练", () => {
  it("初始状态应该显示当前知识点讲解", () => {
    render(<TrainSessionFlow planId="test" />);
    expect(screen.getByText(/知识点/)).toBeInTheDocument();
  });

  it("学完知识点应该立即出现检测题，不需要跳转页面", () => {
    // 模拟点击"我学会了，测一测"按钮
    // 应该出现题目卡片，不是跳转
  });

  it("25分钟专注后应该自动触发休息提示", () => {
    // 模拟时间流逝
  });
});
```

- [ ] **Step 2: 实现训练会话调度器**

Create `lib/ai/train-scheduler.ts`:

```typescript
// lib/ai/train-scheduler.ts
// 训练会话智能调度——决定"现在学什么、接下来做什么"
//
// 设计（卡帕西视角）：
//   - 纯函数：输入用户状态 → 输出会话步骤列表
//   - 复用 study-queue 的优先级逻辑
//   - 增加"学完立即测"的间隔重复最佳时机
//
// 会话状态机：
//   idle → learning → questioning → feedback
//                    ↓ (休息时间到)
//                  breaking → resume
//                    ↓ (完成今日目标)
//                  completed

import type { StudyTask } from "@/lib/study-queue/types";
import type { ReviewCard, KnowledgeNode, Question } from "@/lib/types";

export type TrainSessionPhase =
  | "learning"      // 知识点讲解
  | "questioning"   // 答题中
  | "feedback"      // 答题反馈（苏格拉底式）
  | "breaking"      // 休息中
  | "completed";    // 会话完成

export interface TrainSessionState {
  phase: TrainSessionPhase;
  currentTask: StudyTask | null;
  currentNode: KnowledgeNode | null;
  currentQuestion: Question | null;
  questionsAnswered: number;
  questionsCorrect: number;
  focusMinutes: number;
  needsBreak: boolean;
}

export interface TrainSessionAction {
  type: "LEARN_COMPLETE" | "ANSWER_SUBMIT" | "FEEDBACK_ACKNOWLEDGE" | "BREAK_START" | "BREAK_END" | "SESSION_COMPLETE";
  payload?: {
    isCorrect?: boolean;
  };
}

/**
 * 训练会话状态机——纯函数 reducer
 */
export function trainSessionReducer(
  state: TrainSessionState,
  action: TrainSessionAction
): TrainSessionState {
  switch (action.type) {
    case "LEARN_COMPLETE":
      return {
        ...state,
        phase: "questioning",
      };

    case "ANSWER_SUBMIT": {
      const isCorrect = action.payload?.isCorrect ?? false;
      return {
        ...state,
        phase: "feedback",
        questionsAnswered: state.questionsAnswered + 1,
        questionsCorrect: state.questionsCorrect + (isCorrect ? 1 : 0),
      };
    }

    case "FEEDBACK_ACKNOWLEDGE":
      // 如果连续答错 2 次，自动插入复习
      // 如果专注时间 >= 25 分钟，触发休息
      const needsBreak = state.focusMinutes >= 25;
      if (needsBreak) {
        return { ...state, phase: "breaking", needsBreak: true };
      }
      return { ...state, phase: "learning" };

    case "BREAK_START":
      return { ...state, phase: "breaking" };

    case "BREAK_END":
      return { ...state, phase: "learning", needsBreak: false };

    case "SESSION_COMPLETE":
      return { ...state, phase: "completed" };

    default:
      return state;
  }
}

/**
 * 生成苏格拉底式反馈——不直接给答案，用问题引导
 */
export function generateSocraticFeedback(
  question: Question,
  userAnswer: string,
  isCorrect: boolean
): string {
  if (isCorrect) {
    const praises = [
      "答对了。你能再举一个具体的例子吗？",
      "很好。想想这个概念在实际项目中会怎么用？",
      "正确。如果数据量是10倍呢？你的答案还成立吗？",
    ];
    return praises[Math.floor(Math.random() * praises.length)];
  }

  // 答错：不给答案，给引导
  const hint = question.keyPoints?.[0] ?? "再想想核心概念";
  return `不完全对。提示：${hint}。你能从这个角度重新思考一下吗？`;
}
```

- [ ] **Step 3: 创建知识点简洁讲解卡片**

Create `components/KnowledgeBrief.tsx`——极简知识点卡片，3 段话以内：

```tsx
"use client";

// components/KnowledgeBrief.tsx
// 知识点简洁讲解——极简版，3段以内
//
// 设计（乔布斯视角）：
//   - 原来的知识点展示太长太学术
//   - 一个知识点卡片只讲1个核心概念
//   - 关键记忆点高亮
//   - 不超过一屏

import type { KnowledgeNode } from "@/lib/types";
import { Icon } from "@/components/Icon";
import { Button } from "@/components/ui";

interface KnowledgeBriefProps {
  node: KnowledgeNode;
  onLearned: () => void;
}

export function KnowledgeBrief({ node, onLearned }: KnowledgeBriefProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 border dark:border-gray-700">
      <div className="flex items-center gap-2 mb-3">
        <Icon name="book" className="w-4 h-4 text-blue-500" />
        <h2 className="text-lg font-bold">{node.title}</h2>
      </div>

      {/* 知识点讲解——简洁版 */}
      <div className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
        {node.description || "暂无讲解"}
      </div>

      {/* 关键记忆点 */}
      {node.keyPoints && node.keyPoints.length > 0 && (
        <div className="bg-yellow-50 dark:bg-yellow-950/30 rounded-lg p-3 mb-4">
          <p className="text-xs font-medium text-yellow-700 dark:text-yellow-300 mb-1">
            💡 关键记忆点
          </p>
          <ul className="text-sm space-y-1">
            {node.keyPoints.map((point, i) => (
              <li key={i} className="text-gray-700 dark:text-gray-300">
                {point}
              </li>
            ))}
          </ul>
        </div>
      )}

      <Button variant="primary" block onClick={onLearned} leftIcon="check">
        我学会了，测一测
      </Button>
    </div>
  );
}
```

- [ ] **Step 4: 创建苏格拉底式反馈组件**

Create `components/SocraticFeedback.tsx`:

```tsx
"use client";

// components/SocraticFeedback.tsx
// 答题反馈——苏格拉底式引导，不直接给答案
//
// 设计（乔布斯视角）：
//   - 答对：不是简单"✓"，而是追问深化理解
//   - 答错：不是直接给答案，而是用问题引导思考

import { Icon } from "@/components/Icon";
import { Button } from "@/components/ui";

interface SocraticFeedbackProps {
  isCorrect: boolean;
  feedback: string;
  onContinue: () => void;
}

export function SocraticFeedback({ isCorrect, feedback, onContinue }: SocraticFeedbackProps) {
  return (
    <div
      className={`rounded-2xl p-5 border-2 ${
        isCorrect
          ? "bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800"
          : "bg-orange-50 dark:bg-orange-950/30 border-orange-200 dark:border-orange-800"
      }`}
    >
      <div className="flex items-start gap-3 mb-4">
        <Icon
          name={isCorrect ? "check-circle" : "alert-circle"}
          className={`w-6 h-6 shrink-0 ${
            isCorrect ? "text-green-500" : "text-orange-500"
          }`}
        />
        <p className="text-sm leading-relaxed text-gray-700 dark:text-gray-300">
          {feedback}
        </p>
      </div>

      <Button
        variant={isCorrect ? "success" : "primary"}
        block
        onClick={onContinue}
        leftIcon="chevron-right"
      >
        {isCorrect ? "继续下一个" : "再想想，然后继续"}
      </Button>
    </div>
  );
}
```

- [ ] **Step 5: 实现训练会话流程组件**

Create `components/TrainSessionFlow.tsx`——核心状态机组件，整合 KnowledgeBrief + QuestionCard + SocraticFeedback + 内置番茄钟：

核心逻辑：
1. 从 studyQueue 取第一个任务
2. 显示 KnowledgeBrief（知识点讲解）
3. 用户点"我学会了"→ 显示 QuestionCard（答题）
4. 用户提交答案 → 显示 SocraticFeedback
5. 反馈确认后 → 如果专注时间 ≥25 分钟，触发 BreakTimer；否则取下一个任务
6. studyQueue 清空 → 显示会话完成总结

- [ ] **Step 6: 创建训练会话页面**

Create `app/train/page.tsx` + `app/train/TrainClient.tsx`：

```tsx
// app/train/page.tsx
import { Suspense } from "react";
import TrainClient from "./TrainClient";

export default function TrainPage() {
  return (
    <Suspense fallback={<div className="p-4">加载中...</div>}>
      <TrainClient />
    </Suspense>
  );
}
```

```tsx
// app/train/TrainClient.tsx
"use client";

// 训练会话页——沉浸式学习，不跳转
//
// 设计（乔布斯视角）：
//   - 用户从首页"开始今天的训练"进入
//   - 一个页面完成：学→练→复→休息
//   - 顶部显示进度（第 3/5 个知识点 · 专注 23:45）
//   - 底部无导航栏，全屏沉浸

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useHomeData } from "@/lib/home";
import { TrainSessionFlow } from "@/components/TrainSessionFlow";
import { Icon } from "@/components/Icon";
import { Button } from "@/components/ui";

export default function TrainClient() {
  const searchParams = useSearchParams();
  const planId = searchParams.get("planId");
  const { studyQueue, reload } = useHomeData();
  const [sessionStartTime] = useState(() => Date.now());
  const [elapsedMinutes, setElapsedMinutes] = useState(0);

  // 计时器
  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedMinutes(Math.floor((Date.now() - sessionStartTime) / 60000));
    }, 30000);
    return () => clearInterval(timer);
  }, [sessionStartTime]);

  if (studyQueue.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
        <Icon name="check-circle" className="w-16 h-16 text-green-500 mb-4" />
        <h1 className="text-2xl font-bold mb-2">今天的训练完成了！</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
          休息一下，明天继续。
        </p>
        <Link href="/">
          <Button variant="primary" size="lg" rounded="full">
            返回首页
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20">
      {/* 顶部进度条 */}
      <div className="sticky top-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur-lg border-b dark:border-gray-800 px-4 py-3 z-10">
        <div className="flex items-center justify-between">
          <Link href="/">
            <Icon name="chevron-right" className="w-5 h-5 rotate-180 text-gray-400" />
          </Link>
          <div className="text-center">
            <p className="text-xs text-gray-400">训练中</p>
            <p className="text-sm font-medium">
              第 1/{studyQueue.length} 项 · 专注 {elapsedMinutes}分钟
            </p>
          </div>
          <div className="w-5" />
        </div>
      </div>

      {/* 训练会话核心 */}
      <div className="p-4 max-w-2xl mx-auto">
        <TrainSessionFlow
          studyQueue={studyQueue}
          onSessionComplete={() => reload()}
        />
      </div>
    </div>
  );
}
```

- [ ] **Step 7: 运行测试、类型检查、lint**

- [ ] **Step 8: Commit**

---

### Task 4: 创建 Interview AI 模拟面试

**Files:**
- Create: `app/interview/page.tsx`
- Create: `app/interview/InterviewClient.tsx`
- Create: `components/InterviewReport.tsx`
- Create: `lib/ai/interview-coach.ts`

**设计原则：** 复用 AI 聊天流式逻辑，但封装为面试场景。AI 面试官有角色设定（初级/中级/高级），会追问，结束后给结构化报告。

- [ ] **Step 1: 实现面试官逻辑**

Create `lib/ai/interview-coach.ts`:

```typescript
// lib/ai/interview-coach.ts
// AI 面试官逻辑——追问+评分+反馈生成
//
// 设计（卡帕西视角）：
//   - 面试官 Prompt 工程：角色设定 + 追问策略 + 评分维度
//   - 复用现有 AI provider（DeepSeek/GLM/MiMo）
//   - 面试结束生成结构化报告

export type InterviewDifficulty = "junior" | "mid" | "senior" | "stress";

export interface InterviewConfig {
  difficulty: InterviewDifficulty;
  topic: string;
  duration: number; // 分钟
  questionCount: number;
}

export interface InterviewMessage {
  role: "interviewer" | "candidate";
  content: string;
  timestamp: string;
}

export interface InterviewReport {
  overallScore: number; // 0-100
  strengths: string[];
  weaknesses: string[];
  improvements: string[];
  nextStep: string;
  canInterview: boolean;
}

/**
 * 生成面试官系统 Prompt
 */
export function buildInterviewerPrompt(config: InterviewConfig): string {
  const difficultyMap: Record<InterviewDifficulty, string> = {
    junior: "初级面试官，考察基础概念，态度友好，会引导",
    mid: "中级面试官，考察项目经验和深度理解，会追问细节",
    senior: "高级面试官，考察系统设计和架构思维，压力大",
    stress: "压力面试官，故意挑战你的回答，考察抗压能力",
  };

  return `你是一位${difficultyMap[config.difficulty]}。

面试主题：${config.topic}
预计时长：${config.duration} 分钟
题目数量：约 ${config.questionCount} 题

面试规则：
1. 每次只问一个问题
2. 根据候选人的回答决定是否追问（追问是面试的核心）
3. 不要一次给反馈，面试结束后统一给
4. 如果候选人卡壳，给适当提示而不是直接跳过
5. 从简单到难，循序渐进
6. 用中文面试，态度专业但不冷漠

现在开始面试。先简短自我介绍，然后问第一个问题。`;
}

/**
 * 生成面试结束后的结构化报告
 */
export function buildInterviewReportPrompt(
  messages: InterviewMessage[],
  config: InterviewConfig
): string {
  const transcript = messages
    .map((m) => `${m.role === "interviewer" ? "面试官" : "候选人"}：${m.content}`)
    .join("\n");

  return `以下是候选人面试记录，请生成结构化反馈报告。

面试主题：${config.topic}
难度：${config.difficulty}

面试记录：
${transcript}

请按以下 JSON 格式返回报告：
{
  "overallScore": 0-100 的整数,
  "strengths": ["答得好的地方1", "答得好的地方2"],
  "weaknesses": ["可以更好的地方1", "可以更好的地方2"],
  "improvements": ["具体改进建议1", "具体改进建议2"],
  "nextStep": "下一步建议",
  "canInterview": true/false（是否可以参加真实面试）
}`;
}
```

- [ ] **Step 2: 创建面试报告组件**

Create `components/InterviewReport.tsx`:

```tsx
"use client";

// components/InterviewReport.tsx
// 面试结束后的结构化反馈报告

import type { InterviewReport as Report } from "@/lib/ai/interview-coach";
import { Icon } from "@/components/Icon";
import { Button } from "@/components/ui";

interface InterviewReportProps {
  report: Report;
  onRetry: () => void;
  onBack: () => void;
}

export function InterviewReport({ report, onRetry, onBack }: InterviewReportProps) {
  return (
    <div className="max-w-2xl mx-auto p-4 pb-20 space-y-4">
      {/* 总分 */}
      <div className={`rounded-2xl p-6 text-center ${
        report.canInterview
          ? "bg-gradient-to-br from-green-500 to-emerald-600 text-white"
          : "bg-gradient-to-br from-orange-500 to-red-600 text-white"
      }`}>
        <p className="text-sm opacity-80 mb-1">面试评分</p>
        <p className="text-5xl font-bold mb-2">{report.overallScore}</p>
        <p className="text-sm">
          {report.canInterview ? "✨ 你准备好参加真实面试了！" : "继续练习，你会更好的"}
        </p>
      </div>

      {/* 答得好的地方 */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 border dark:border-gray-700">
        <h3 className="text-sm font-medium text-green-600 dark:text-green-400 mb-2 flex items-center gap-1.5">
          <Icon name="check-circle" className="w-4 h-4" />
          答得好的地方
        </h3>
        <ul className="space-y-1.5">
          {report.strengths.map((s, i) => (
            <li key={i} className="text-sm text-gray-700 dark:text-gray-300 flex items-start gap-2">
              <span className="text-green-500 mt-0.5">✓</span>
              {s}
            </li>
          ))}
        </ul>
      </div>

      {/* 可以更好的地方 */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 border dark:border-gray-700">
        <h3 className="text-sm font-medium text-orange-600 dark:text-orange-400 mb-2 flex items-center gap-1.5">
          <Icon name="alert-circle" className="w-4 h-4" />
          可以更好的地方
        </h3>
        <ul className="space-y-1.5">
          {report.weaknesses.map((w, i) => (
            <li key={i} className="text-sm text-gray-700 dark:text-gray-300 flex items-start gap-2">
              <span className="text-orange-500 mt-0.5">⚠</span>
              {w}
            </li>
          ))}
        </ul>
      </div>

      {/* 改进建议 */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 border dark:border-gray-700">
        <h3 className="text-sm font-medium text-blue-600 dark:text-blue-400 mb-2 flex items-center gap-1.5">
          <Icon name="target" className="w-4 h-4" />
          下一步建议
        </h3>
        <p className="text-sm text-gray-700 dark:text-gray-300">{report.nextStep}</p>
      </div>

      {/* 操作按钮 */}
      <div className="flex gap-3">
        <Button variant="ghost" block onClick={onBack}>
          返回首页
        </Button>
        <Button variant="primary" block onClick={onRetry} leftIcon="repeat">
          再练一次
        </Button>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: 创建面试会话页面**

Create `app/interview/page.tsx` + `app/interview/InterviewClient.tsx`:

核心逻辑：
1. 入口页选择难度（初级/中级/高级/压力面）和主题
2. 面试进行中：流式显示面试官问题，用户输入回答
3. 面试结束：调用 AI 生成结构化报告，显示 InterviewReport

- [ ] **Step 4: 运行测试、类型检查、lint**

- [ ] **Step 5: Commit**

---

### Task 5: 更新导航 + 路由过渡

**Files:**
- Modify: `components/Nav.tsx`
- Modify: `app/learn/page.tsx`（智能路由增加 /train 重定向）

- [ ] **Step 1: 导航从 2 Tab 升级为 3 Tab**

```typescript
// components/Nav.tsx
const items: Array<{ href: string; label: string; icon: IconName }> = [
  { href: "/", label: "路径", icon: "map" },
  { href: "/train", label: "训练", icon: "target" },
  { href: "/profile", label: "我的", icon: "user" },
];
```

- [ ] **Step 2: 训练 Tab 在路径进度 < 80% 时仍可见，但点击时如果有待办就进入训练**

- [ ] **Step 3: 保留 /learn /review 路由可用，但首页主入口指向 /train**

- [ ] **Step 4: Commit**

---

### Task 6: 行为感知 + AI 教练智能化

**Files:**
- Create: `lib/ai/behavior-analyzer.ts`
- Modify: `lib/ai/persona.ts`（增加自动切换逻辑）
- Modify: `lib/home.ts`（增加 coachInsight 生成）

- [ ] **Step 1: 实现行为分析器**

从以下信号隐式感知用户状态：
- 能量：专注时长变化、答题反应速度、打断频率
- 情绪：答题正确率趋势、是否连续放弃、session 完成率
- Persona 建议：挫败时→温和；连续正确→严厉推一把；迷茫时→苏格拉底引导

- [ ] **Step 2: 生成每日教练洞察**

在 `lib/home.ts` 的 `useHomeData` 中增加 `coachInsight` 计算：
- 昨日答题正确率 < 60% → reminding tone
- 连续打卡 7 天 → celebrating tone
- 今日已完成 3 项 → challenging tone（推一把）
- 默认 → encouraging tone

- [ ] **Step 3: Commit**

---

## 第五部分：自我审查

### 1. Spec 覆盖检查
- ✅ 焦点：6 区首页升级为 Path 路径视图（不推倒重来）
- ✅ Aha Moment：Onboarding 3选1+一键开始，零配置
- ✅ 情感连接：PathCoachInsight 有温度的每日洞察
- ✅ 沉浸式体验：Train 会话整合学→练→复→休息
- ✅ 技术隐形：Onboarding 移除所有 Slider/Input 配置
- ✅ 魔法时刻：苏格拉底式反馈+AI 教练自动洞察
- ✅ 面试闭环：Interview 模拟面试+结构化报告

### 2. 与 V1 的差异（务实调整）
- 不一次性删除旧页面（/learn /review /emotion /dashboard 保留可用）
- 不重写整个首页（只替换 Hero 区）
- 保留 EmotionQuickPicker（已极简，不废弃）
- 保留 /stats（开发者用户群喜欢数据）
- 保留公开主页（不主动推但不删除）
- 复用 study-queue + QuestionCard + PomodoroWidget（不重造轮子）

### 3. 类型一致性
- `CareerPath` 类型定义在 `lib/types.ts`，在 `lib/onboarding/career-paths.ts` 和 `app/onboarding/page.tsx` 中一致使用
- `TrainSessionState` / `TrainSessionPhase` 定义在 `lib/ai/train-scheduler.ts`
- `InterviewReport` 定义在 `lib/ai/interview-coach.ts`

---

## 第六部分：执行优先级

**P0（必须最先做，用户第一印象）：**
1. Task 1: Onboarding 极简化（零配置 3选1）
2. Task 5: 导航更新为 3 Tab

**P1（核心体验）：**
3. Task 2: 首页 Hero 升级为 Path 路径视图
4. Task 3: Train 沉浸式训练会话

**P2（闭环完成）：**
5. Task 4: Interview 模拟面试
6. Task 6: 行为感知+AI 教练智能化

---

Plan complete and saved to `docs/superpowers/plans/2026-07-21-jobsian-product-redesign-v2.md`. Two execution options:

**1. Subagent-Driven (recommended)** - I dispatch a fresh subagent per task, review between tasks, fast iteration

**2. Inline Execution** - Execute tasks in this session using executing-plans, batch execution with checkpoints

**Which approach?**
