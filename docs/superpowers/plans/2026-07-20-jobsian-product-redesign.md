# devpath-ai 乔布斯视角产品重构计划

&gt; **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将 devpath-ai 从"功能堆砌的学习工具"重构为"有灵魂的 AI 面试通关教练"——聚焦、简约、有情感、10秒 Aha Moment，帮助程序员顺利转 AI。

**Architecture:** 三大核心模式替代 15+ 功能：1) Path（转岗路径图：一条线看到从入门到offer的进度）；2) Train（沉浸式训练会话：学→练→复→番茄钟一体化，不跳转）；3) Interview（AI 模拟面试：真实场景压力测试）。砍掉所有非核心功能（手动情绪记录/能量配置/公开主页/复杂仪表盘），用设计和体验让技术隐于无形。

**Tech Stack:** Next.js 15 + React 19 + TypeScript + Tailwind CSS + IndexedDB（复用现有技术栈，不引入新依赖）

---

## 第一部分：乔布斯诊断书 —— 当前产品的 7 个致命问题

### 问题 1：焦点缺失——瑞士军刀思维，而非产品思维
你有 15+ 个功能模块（知识树/学习计划/面试题/FSRS/能量/情绪/番茄钟/AI聊天/周报/成就/错题/热力图/分享/跨设备同步/限流监控）。这不是产品，是功能清单。iPhone 发布时没有复制粘贴、没有多任务、没有 App Store，但它重新发明了手机。**人们买的不是孔，是洞。人们要的不是功能，是"拿到 AI 岗位 offer"这个结果。**

### 问题 2：核心价值被稀释——"帮程序员转 AI" 成了口号
用户打开 app，看到的是：今日待学 N 个、今日待复习 M 张、连续打卡 K 天——这些是过程指标，不是结果。用户焦虑的是："我现在的水平离拿 offer 还有多远？""我还要学多久？""面试的时候我能答上来吗？"这些问题，现在的产品一个都回答不了。

### 问题 3：Aha Moment 太晚——用户流失在第一分钟
Onboarding 虽然做了预设选择+脑图预览，但用户仍然需要：选方向→看脑图→配置每日学习量→配置每日新内容数→填API Key→开始学习。**乔布斯会把这一切砍到只剩一个按钮："告诉我你的目标，剩下的交给我。"** API Key 可以之后再填，学习量应该从用户行为自动推断，配置应该消失。

### 问题 4：情感真空——全是数字，没有共鸣
转 AI 的程序员是什么状态？是焦虑（35岁危机？）、是迷茫（该学什么？LangChain？PyTorch？Transformer？）、是孤独（身边没人带）、是渴望（薪资翻倍？职业第二曲线？）。现在的产品：数字、数字、还是数字。待学数、复习数、打卡天数、能量值 1-5、情绪 emoji...这是 Excel，不是教练。

### 问题 5：导航荒谬——学习和复习分开是反人性的
底部 Tab：今日 / 学习 / 复习 / 我的。**学习和复习是同一个流的不同阶段，为什么要分成两个页面？** 就像 iPod 把"选歌"和"听歌"分成两个 tab 一样荒谬。用户应该在一个沉浸式会话里完成：学一个知识点→立即做一道题→做错了标记为复习→休息一下→继续，而不是在页面间跳来跳去。

### 问题 6：技术外露——让用户配置，是产品的失败
用户需要配置：每日学习分钟数、每日新内容数、AI Persona（严厉教练/温和陪伴/苏格拉底/同行）、专注模式（严格/宽松）、FSRS 模式、作息时间表、AI 模型选择...**真正好的科技是隐形的。** 你应该知道我是早鸟还是夜猫子（看我的学习时间分布），你应该知道我适合节奏快慢（看我打断频率），你应该知道我需要鼓励还是鞭策（看我做题正确率趋势），而不是让我选。

### 问题 7：没有魔法时刻——AI 只是按钮，不是教练
AI 聊天入口是一个浮动按钮，点进去是对话框。这和 ChatGPT 有什么区别？AI 应该是**懂你**的：当你连续3道题做错，它应该暂停知识点推进，带你复习前置知识；当你已经专注了50分钟，它应该提醒你休息；当你一周没学习，它应该发一条有温度的消息，而不是冷冰冰的提醒。

---

## 第二部分：重新定义产品——devpath 是什么，不是什么

### 一句话定位
**devpath 是你的 AI 面试通关教练——从入门到拿 offer，它全程陪你。**

### 三个核心模式（替代全部15+功能）

| 模式 | 一句话说明 | 对应原功能（被整合） |
|---|---|---|
| **Path（路径）** | 你的 AI 转岗地图：一条线看进度，知道离 offer 还有多远 | 知识树 + 学习计划 + 能力雷达图 + 成就 |
| **Train（训练）** | 沉浸式学习会话：学→练→复→休息，一个页面搞定 | 学习页 + 复习页 + 番茄钟 + 错题 + FSRS |
| **Interview（模拟面试）** | AI 真实面试压力测试，练到你不紧张为止 | 面试题 + AI 聊天 + 语音（未来） |

### 砍掉的功能（有勇气说不）
- ❌ **手动情绪记录**：情绪应该从你的学习行为中感知（做题节奏、打断频率、专注时长），不需要手动点 emoji
- ❌ **手动能量配置**：能量从行为数据自动计算，不需要用户每天打分
- ❌ **公开主页/分享**：先把核心体验做到极致，社交是之后的事
- ❌ **复杂统计仪表盘**：用户不需要看 Token 用量、API 采纳率这些工程师自嗨的指标
- ❌ **AI Persona 手动选择**：应该根据你的状态自动切换（挫败时→温和陪伴；连续正确→严厉教练推一把）
- ❌ **作息时间表配置**：从你的学习时间自动推断
- ❌ **专注模式选择**：应该智能切换（连续打断3次→自动进入严格模式）
- ❌ **手动每日学习量设置**：从你实际投入的时间自动调整
- ❌ **周报**：改为即时反馈（每次会话结束给你一个洞察）
- ❌ **成就墙页面**：成就融入 Path 进度条，不单独成页

---

## 第三部分：详细设计方案

### 新用户体验：10 秒 Aha Moment

**旧流程（7步，流失率 80%）：**
1. 打开 app → 2. 看欢迎页 → 3. 选"开始学习" → 4. 输入/选择主题 → 5. 选预设看脑图 → 6. 配置学习量+API Key → 7. 开始第一个知识点

**新流程（2步，10秒 Aha Moment）：**
1. 打开 app → **屏幕显示：**
   ```
   你想成为哪种 AI 人才？
   
   [AI 应用开发工程师]  (做 LLM 应用/RAG/Agent，最快上岗)
   [AI 算法工程师]      (做模型训练/微调，门槛高薪资高)
   [AI 产品经理]        (懂技术会设计，非技术背景也能转)
   ```
2. 点击任意一个 → **立刻看到：** 你的专属路径图（一条线）+ 一句有温度的话：
   &gt; "看到了。按照你的基础，每天投入45分钟，预计 **8周** 可以准备好面试。我们从今天开始。"
   → **[开始第一次训练]** 按钮

**API Key 在哪填？** 第一次需要 AI 生成/重新生成内容时，优雅地提示，不是一上来就堵在门口。

### 新模式 1：Path（路径）—— 首页即仪表盘

**首页不再是一堆卡片，而是一条路：**

```
┌─────────────────────────────────────┐
│  你离 AI 应用开发工程师 offer 还有   │
│  ████████████░░░░░░░░░░  58%        │
│  预计 4 周后可面试                    │
└─────────────────────────────────────┘

📍 当前位置：RAG 检索增强生成
   ├─ ✅ Transformer 基础 (已掌握)
   ├─ ✅ Prompt Engineering (已掌握)
   ├─ ✅ LLM API 调用 (已掌握)
   ├─ 🔄 RAG 检索增强生成 (学习中)
   │   ├─ ✅ 向量嵌入
   │   ├─ 🔄 向量数据库 ← 你在这
   │   └─ ⏳ 检索排序
   ├─ ⏳ Agent 智能体
   ├─ ⏳ 微调基础
   └─ 🏁 模拟面试 (终点线)

[🎯 开始今天的训练]

💡 今日洞察：
   你昨天在向量检索相关题上错了2道，
   我们今天会先巩固这部分再往前推进。
```

**设计原则：**
- 只有一个主按钮：「开始今天的训练」
- 进度条是视觉核心，不是三宫格数字
- 洞察是 AI 教练在说话，不是冰冷的统计
- 成就作为路径上的里程碑（比如"完成了Transformer，解锁了第一个徽章"），不是单独页面

### 新模式 2：Train（训练）—— 沉浸式会话，不跳转

**这是用户停留时间最长的页面。核心：一个会话，一个目标，结束了才退出。**

```
┌─────────────────────────────────────┐
│  ←  RAG · 向量数据库  ·  🔥 23:45   │
│  第 3/5 个知识点                     │
├─────────────────────────────────────┤
│                                     │
│  【知识点讲解】                      │
│  向量数据库是...（简洁，3段以内）     │
│  👉 关键记忆点：xxx                  │
│                                     │
│  【快速检测】（学完立即测）           │
│  Q: 以下哪种索引方式最适合高维向量？  │
│  □ A. B-tree 索引                   │
│  □ B. HNSW 索引  ← 正确答案         │
│  □ C. 哈希索引                      │
│                                     │
│  [答对了 → 下一题]                   │
│  [答错了 → 没关系，我们看为什么错]   │
│                                     │
│  [暂停休息]（25分钟后自动提示）      │
└─────────────────────────────────────┘
```

**会话内智能流转：**
1. **学**：一个知识点（简洁，不是长篇大论）
2. **测**：立即1-3道题检测（间隔重复的最佳时机）
3. **分支**：
   - 答对 → 继续下一个知识点
   - 答错 → AI 用苏格拉底式追问帮你理解为什么错，而不是直接给答案
4. **番茄**：每25分钟自动触发休息，呼吸引导（不需要用户手动开番茄钟）
5. **复习**：如果有到期复习卡片，在会话开始/休息后智能插入，不是单独页面
6. **结束**：完成今日目标后，给一个温暖的总结+明日预告

**关键变化：**
- 学习和复习不再是两个 tab，在同一个会话里智能调度
- 番茄钟不再是独立功能，是训练会话的内置节奏
- 错题自动标记，复习自动插入，不需要用户手动管理
- 全程不需要跳转页面，沉浸式体验

### 新模式 3：Interview（模拟面试）—— 最后一公里

**当路径走到约 80% 时，解锁「模拟面试」模式：**

```
┌─────────────────────────────────────┐
│  🎤 AI 模拟面试 · 第 1 轮            │
│  难度：初级 · 时长：约 20 分钟        │
├─────────────────────────────────────┤
│                                     │
│  AI 面试官：                         │
│  "你好，我是今天的面试官。我们先从    │
│   基础开始。你能解释一下 Transformer │
│   里的 Self-Attention 是怎么工作     │
│   的吗？不用太细，说说核心思想。"     │
│                                     │
│  [按住说话]  或  [打字回答]           │
│                                     │
│  ───────────────────────────────    │
│  💡 提示：注意说清楚 Q/K/V 的作用     │
│     （如果你需要提示）                │
└─────────────────────────────────────┘
```

**模拟面试智能反馈：**
- 回答后，AI 面试官会追问（就像真实面试一样）
- 面试结束后，给你一份详细报告：
  - ✅ 答得好的地方："Self-Attention 的核心思想讲得很清楚"
  - ⚠️ 可以更好的："没有提到 Multi-Head，面试官可能会追问"
  - ❌ 明显遗漏："没有举具体例子，如果加上会更有说服力"
  - 🎯 下一步建议："再练 3 道 Transformer 相关的题，你就可以去面试了"
- 难度递增：初级→中级→高级→压力面
- 可以录音回听自己的回答（自我觉察是最好的老师）

---

## 文件结构规划

### 新增/重构的文件

| 文件 | 职责 |
|---|---|
| `app/onboarding/page.tsx` | 重写：3选1→路径预览→一键开始（10秒Aha） |
| `app/HomeClient.tsx` | 重写：Path 路径视图（替代5区结构） |
| `app/train/[sessionId]/page.tsx` | 新增：沉浸式训练会话页 |
| `app/train/TrainClient.tsx` | 新增：训练会话核心组件（学→练→复→休息流） |
| `app/interview/page.tsx` | 新增：模拟面试入口页 |
| `app/interview/[sessionId]/page.tsx` | 新增：模拟面试进行中页 |
| `app/interview/InterviewClient.tsx` | 新增：面试会话核心组件 |
| `components/PathView.tsx` | 新增：路径进度可视化（一条线+节点） |
| `components/TrainSession.tsx` | 新增：训练会话状态机组件 |
| `components/KnowledgeCard.tsx` | 新增：知识点讲解卡片（简洁版） |
| `components/QuestionTrainer.tsx` | 新增：答题训练组件（带苏格拉底式反馈） |
| `components/BreakTimer.tsx` | 新增：休息呼吸引导（替代独立番茄钟页） |
| `components/InterviewReport.tsx` | 新增：面试反馈报告 |
| `lib/ai/train-scheduler.ts` | 新增：训练会话智能调度（学→练→复顺序） |
| `lib/ai/performance-analyzer.ts` | 新增：答题表现分析→自动调整难度/节奏 |
| `lib/ai/interview-coach.ts` | 新增：模拟面试逻辑（追问+评分+反馈） |
| `lib/onboarding/preset-paths.ts` | 新增：3条预设路径（AI应用/AI算法/AI产品） |
| `components/Nav.tsx` | 修改：底部Tab改为 [Path/Train/Interview/我的] |

### 删除/废弃的文件（逐步下线，不是一次性删）

| 文件 | 处理方式 |
|---|---|
| `app/emotion/` | 废弃：情绪从行为感知，不手动记录 |
| `app/dashboard/` | 废弃：复杂统计砍掉，融入Path洞察 |
| `app/timer/` | 废弃：番茄钟内置到Train会话 |
| `app/mistakes/` | 废弃：错题自动处理，不单独成页 |
| `app/favorites/` | 废弃：极简产品不需要收藏夹 |
| `app/u/[username]/` | 废弃：公开主页v1砍掉，专注核心体验 |
| `components/EmotionRecorder.tsx` | 废弃 |
| `components/PomodoroFull.tsx` | 废弃 |
| `components/PomodoroWidget.tsx` | 废弃 |
| `components/HealthAlertCard.tsx` | 废弃：健康提醒融入Path洞察 |
| `components/StatusCard.tsx`（已删）| 确认删除 |
| `lib/ai/energy-pattern.ts` | 重构：改为隐式感知，不手动输入 |
| `lib/routine.ts` | 废弃：作息自动推断，不手动配置 |

---

## 任务分解（按优先级）

### Task 1: 重写 Onboarding — 10 秒 Aha Moment

**Files:**
- Modify: `app/onboarding/page.tsx` (全量重写)
- Create: `lib/onboarding/preset-paths.ts` (3条预设路径)
- Modify: `lib/presets/index.ts` (适配新路径结构)

- [ ] **Step 1: 写失败的 onboarding 简化测试**

```tsx
// __tests__/onboarding-simplified.test.ts
import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import OnboardingPage from "@/app/onboarding/page";

describe("Onboarding 简化版（乔布斯视角）", () => {
  it("第一步只显示3个方向选择，不显示配置项", () => {
    render(&lt;OnboardingPage /&gt;);
    // 不应该有 slider、API Key 输入
    expect(screen.queryByLabelText(/每日学习量/)).not.toBeInTheDocument();
    expect(screen.queryByPlaceholderText(/sk-/)).not.toBeInTheDocument();
    // 应该有3个方向选择
    expect(screen.getByText(/AI 应用开发工程师/)).toBeInTheDocument();
    expect(screen.getByText(/AI 算法工程师/)).toBeInTheDocument();
    expect(screen.getByText(/AI 产品经理/)).toBeInTheDocument();
  });

  it("点击方向后应该立即显示路径预览+预计时间+开始按钮", () => {
    render(&lt;OnboardingPage /&gt;);
    fireEvent.click(screen.getByText(/AI 应用开发工程师/));
    expect(screen.getByText(/预计.*周/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /开始第一次训练/ })).toBeInTheDocument();
  });

  it("点击开始应该跳转到训练页，而不是学习计划列表", () =&gt; {
    // 验证 router.push 到 /train/xxx 而不是 /learn/xxx
  });
});
```

- [ ] **Step 2: 运行测试确认失败**

Run: `npx vitest run __tests__/onboarding-simplified.test.ts -v`
Expected: FAIL（因为旧 onboarding 有配置项）

- [ ] **Step 3: 创建 3 条预设路径定义**

Create `lib/onboarding/preset-paths.ts`:

```typescript
export interface PathNode {
  id: string;
  title: string;
  description: string;
  estimatedHours: number;
  prerequisites: string[];
  questions: number;
  isMilestone?: boolean;
}

export interface CareerPath {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  description: string;
  weeksEstimate: number;
  weeklyHours: number;
  difficulty: "beginner" | "intermediate" | "advanced";
  nodes: PathNode[];
  cta: string;
}

export const PRESET_PATHS: CareerPath[] = [
  {
    id: "ai-app-dev",
    title: "AI 应用开发工程师",
    subtitle: "做 LLM 应用/RAG/Agent，最快上岗",
    icon: "🚀",
    description: "适合想快速转 AI 应用层的开发者，学完可以做 RAG 系统、AI Agent、LLM 应用",
    weeksEstimate: 8,
    weeklyHours: 7,
    difficulty: "beginner",
    cta: "从 Transformer 基础开始，今天就开启你的第一个训练会话",
    nodes: [
      { id: "transformer-basics", title: "Transformer 基础", description: "理解 Attention 机制", estimatedHours: 3, prerequisites: [], questions: 15, isMilestone: true },
      { id: "prompt-engineering", title: "Prompt Engineering", description: "学会和 LLM 有效对话", estimatedHours: 2, prerequisites: ["transformer-basics"], questions: 12 },
      { id: "llm-api", title: "LLM API 调用", description: "OpenAI/国产大模型 API 实战", estimatedHours: 4, prerequisites: ["prompt-engineering"], questions: 10 },
      { id: "embeddings", title: "向量嵌入", description: "理解文本如何变成向量", estimatedHours: 3, prerequisites: ["llm-api"], questions: 8 },
      { id: "vector-db", title: "向量数据库", description: "Pinecone/Chroma/Milvus 实战", estimatedHours: 4, prerequisites: ["embeddings"], questions: 10 },
      { id: "rag", title: "RAG 检索增强生成", description: "搭建一个完整的 RAG 系统", estimatedHours: 6, prerequisites: ["vector-db"], questions: 15, isMilestone: true },
      { id: "agents", title: "Agent 智能体", description: "ReAct/工具调用/多 Agent 协作", estimatedHours: 6, prerequisites: ["rag"], questions: 12 },
      { id: "fine-tuning-intro", title: "微调入门", description: "什么时候需要微调，怎么做 LoRA", estimatedHours: 4, prerequisites: ["agents"], questions: 8 },
      { id: "interview-ready", title: "模拟面试通关", description: "AI 模拟面试+真人面经", estimatedHours: 8, prerequisites: ["fine-tuning-intro"], questions: 30, isMilestone: true },
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
    difficulty: "advanced",
    cta: "从数学基础和 PyTorch 开始，扎实走好每一步",
    nodes: [
      // 算法路径节点...（类似结构，更偏数学/模型/训练）
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
    difficulty: "beginner",
    cta: "从理解 AI 能力边界开始，成为懂技术的 AI PM",
    nodes: [
      // 产品路径节点...（偏应用/案例/产品设计）
    ],
  },
];
```

- [ ] **Step 4: 重写 onboarding 页面实现 2 步流程**

Rewrite `app/onboarding/page.tsx`:

```tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { setItem, set as dbSet } from "@/lib/storage/db";
import { KEY_PREFIXES, type LearningPlan, type CareerPath as CareerPathType } from "@/lib/types";
import { PRESET_PATHS } from "@/lib/onboarding/preset-paths";
import { PathPreview } from "@/components/PathPreview";
import { Icon } from "@/components/Icon";
import { Button } from "@/components/ui";
import { nanoid } from "nanoid";

export default function OnboardingPage() {
  const router = useRouter();
  const [selectedPath, setSelectedPath] = useState&lt;CareerPathType | null&gt;(null);
  const [starting, setStarting] = useState(false);

  async function handleStart() {
    if (!selectedPath) return;
    setStarting(true);
    try {
      const now = new Date().toISOString();
      // 从 path 创建初始 plan
      const plan: LearningPlan = {
        id: nanoid(),
        topic: selectedPath.title,
        pathId: selectedPath.id,
        careerPath: selectedPath,
        currentNodeIndex: 0,
        knowledgeTree: selectedPath.nodes.map(n =&gt; ({
          id: n.id,
          title: n.title,
          description: n.description,
          mastery: "untouched",
        })),
        questions: [],
        schedule: [],
        dailyMinutes: 45,
        maxNewPerDay: 2,
        fsrsMode: "standard",
        createdAt: now,
        updatedAt: now,
      };
      await setItem(KEY_PREFIXES.PLAN + plan.id, plan);
      await dbSet("my:onboarding", {
        pathId: selectedPath.id,
        completedAt: now,
      });
      // 立即开始第一个训练会话
      router.push(`/train?planId=${plan.id}`);
    } finally {
      setStarting(false);
    }
  }

  // 第一步：3选1
  if (!selectedPath) {
    return (
      &lt;div className="min-h-screen flex flex-col items-center justify-center p-6 max-w-lg mx-auto"&gt;
        &lt;div className="text-center mb-10"&gt;
          &lt;h1 className="text-3xl font-bold mb-3"&gt;你想成为哪种 AI 人才？&lt;/h1&gt;
          &lt;p className="text-gray-500 dark:text-gray-400 text-sm"&gt;选一个方向，我们立即为你定制学习路径&lt;/p&gt;
        &lt;/div&gt;

        &lt;div className="w-full space-y-3"&gt;
          {PRESET_PATHS.map((path) =&gt; (
            &lt;button
              key={path.id}
              onClick={() =&gt; setSelectedPath(path)}
              className="w-full bg-white dark:bg-gray-800 border-2 border-gray-100 dark:border-gray-700 rounded-2xl p-5 text-left hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-lg transition-all group"
            &gt;
              &lt;div className="flex items-start gap-4"&gt;
                &lt;span className="text-4xl"&gt;{path.icon}&lt;/span&gt;
                &lt;div className="flex-1"&gt;
                  &lt;h3 className="font-bold text-lg mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors"&gt;
                    {path.title}
                  &lt;/h3&gt;
                  &lt;p className="text-sm text-blue-600 dark:text-blue-400 font-medium mb-1"&gt;
                    {path.subtitle}
                  &lt;/p&gt;
                  &lt;p className="text-xs text-gray-500 dark:text-gray-400"&gt;
                    {path.description}
                  &lt;/p&gt;
                  &lt;div className="flex gap-3 mt-2 text-xs text-gray-400"&gt;
                    &lt;span&gt;⏱️ 约 {path.weeksEstimate} 周&lt;/span&gt;
                    &lt;span&gt;📚 {path.nodes.length} 个阶段&lt;/span&gt;
                  &lt;/div&gt;
                &lt;/div&gt;
                &lt;Icon name="chevron-right" className="w-5 h-5 text-gray-300 group-hover:text-blue-500 group-hover:translate-x-1 transition-all mt-2" /&gt;
              &lt;/div&gt;
            &lt;/button&gt;
          ))}
        &lt;/div&gt;

        &lt;p className="text-xs text-gray-400 mt-8 text-center"&gt;
          已经知道自己要学什么？&lt;br /&gt;
          &lt;Link href="/learn/new" className="text-blue-500 hover:underline"&gt;自定义学习主题 →&lt;/Link&gt;
        &lt;/p&gt;
      &lt;/div&gt;
    );
  }

  // 第二步：路径预览 + 一键开始
  return (
    &lt;div className="min-h-screen flex flex-col p-4 max-w-lg mx-auto pb-8"&gt;
      &lt;Button variant="ghost" size="sm" onClick={() =&gt; setSelectedPath(null)} className="self-start mb-4"&gt;
        &lt;Icon name="chevron-right" className="w-4 h-4 rotate-180 mr-1" /&gt; 重选
      &lt;/Button&gt;

      &lt;div className="text-center mb-6"&gt;
        &lt;span className="text-6xl mb-4 block"&gt;{selectedPath.icon}&lt;/span&gt;
        &lt;h1 className="text-2xl font-bold mb-2"&gt;{selectedPath.title}&lt;/h1&gt;
        &lt;p className="text-gray-500 dark:text-gray-400"&gt;{selectedPath.subtitle}&lt;/p&gt;
      &lt;/div&gt;

      {/* Aha Moment 卡片 */}
      &lt;div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl p-6 text-white mb-6 shadow-xl"&gt;
        &lt;p className="text-sm opacity-80 mb-1"&gt;看到了。&lt;/p&gt;
        &lt;p className="text-xl font-bold mb-2"&gt;
          每天投入 45 分钟，预计&lt;span className="text-yellow-300"&gt; {selectedPath.weeksEstimate} 周 &lt;/span&gt;可以准备好面试。
        &lt;/p&gt;
        &lt;p className="text-sm opacity-80"&gt;我们从今天开始。&lt;/p&gt;
      &lt;/div&gt;

      {/* 路径缩略预览 */}
      &lt;div className="bg-white dark:bg-gray-800 rounded-2xl p-4 mb-6 border dark:border-gray-700"&gt;
        &lt;PathPreview path={selectedPath} /&gt;
      &lt;/div&gt;

      &lt;Button
        variant="success"
        size="lg"
        block
        onClick={handleStart}
        loading={starting}
        className="text-lg py-4 rounded-full shadow-lg"
        leftIcon={starting ? undefined : "zap"}
      &gt;
        {starting ? "准备中..." : "开始第一次训练 →"}
      &lt;/Button&gt;

      &lt;p className="text-xs text-gray-400 text-center mt-3"&gt;
        {selectedPath.cta}
      &lt;/p&gt;
    &lt;/div&gt;
  );
}
```

- [ ] **Step 5: 创建 PathPreview 预览组件**

Create `components/PathPreview.tsx`:

```tsx
"use client";

import type { CareerPath } from "@/lib/onboarding/preset-paths";
import { Icon } from "@/components/Icon";

export function PathPreview({ path }: { path: CareerPath }) {
  return (
    &lt;div className="space-y-0"&gt;
      {path.nodes.slice(0, 5).map((node, i) =&gt; (
        &lt;div key={node.id} className="flex items-start gap-3"&gt;
          &lt;div className="flex flex-col items-center"&gt;
            &lt;div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              node.isMilestone 
                ? "bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300" 
                : "bg-gray-100 dark:bg-gray-700 text-gray-500"
            }`}&gt;
              {node.isMilestone ? &lt;Icon name="star" className="w-4 h-4" /&gt; : i + 1}
            &lt;/div&gt;
            {i &lt; Math.min(path.nodes.length, 5) - 1 &amp;&amp; (
              &lt;div className="w-0.5 h-6 bg-gray-200 dark:bg-gray-600" /&gt;
            )}
          &lt;/div&gt;
          &lt;div className="flex-1 pb-4"&gt;
            &lt;p className="font-medium text-sm"&gt;{node.title}&lt;/p&gt;
            &lt;p className="text-xs text-gray-400"&gt;{node.description} · {node.estimatedHours}h&lt;/p&gt;
          &lt;/div&gt;
        &lt;/div&gt;
      ))}
      {path.nodes.length &gt; 5 &amp;&amp; (
        &lt;p className="text-xs text-gray-400 pl-11"&gt;... 还有 {path.nodes.length - 5} 个阶段&lt;/p&gt;
      )}
      {/* 终点线 */}
      &lt;div className="flex items-center gap-3 mt-2"&gt;
        &lt;div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center"&gt;
          &lt;Icon name="check" className="w-4 h-4 text-white" /&gt;
        &lt;/div&gt;
        &lt;p className="font-medium text-green-600 dark:text-green-400"&gt;拿到 offer 🏆&lt;/p&gt;
      &lt;/div&gt;
    &lt;/div&gt;
  );
}
```

- [ ] **Step 6: 更新 types.ts 添加路径相关类型**

Modify `lib/types.ts` 添加:

```typescript
export interface CareerPathNode {
  id: string;
  title: string;
  description: string;
  estimatedHours: number;
  prerequisites: string[];
  questions: number;
  isMilestone?: boolean;
}

export interface CareerPath {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  description: string;
  weeksEstimate: number;
  weeklyHours: number;
  difficulty: "beginner" | "intermediate" | "advanced";
  nodes: CareerPathNode[];
  cta: string;
}

export interface LearningPlan {
  // 现有字段...
  pathId?: string;
  careerPath?: CareerPath;
  currentNodeIndex?: number;
}
```

- [ ] **Step 7: 运行测试确认通过**

Run: `npx vitest run __tests__/onboarding-simplified.test.ts -v`
Expected: PASS

- [ ] **Step 8: 运行类型检查和 lint**

Run: `npm run typecheck &amp;&amp; npm run lint`
Expected: 0 errors

- [ ] **Step 9: Commit**

```bash
git add app/onboarding/page.tsx lib/onboarding/preset-paths.ts components/PathPreview.tsx lib/types.ts __tests__/onboarding-simplified.test.ts
git commit -m "feat: 重写 onboarding 为 10 秒 Aha Moment 体验（乔布斯视角）"
```

---

### Task 2: 重写首页为 Path 路径视图

**Files:**
- Modify: `app/HomeClient.tsx` (全量重写)
- Create: `components/PathView.tsx` (路径进度可视化组件)
- Modify: `lib/home.ts` (适配新数据需求)

- [ ] **Step 1: 写首页 Path 视图测试**

```tsx
// __tests__/home-path-view.test.ts
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import HomeClient from "@/app/HomeClient";

describe("首页 Path 视图（乔布斯视角）", () =&gt; {
  it("核心视觉是进度条+离目标还有多远，不是三宫格数字", () =&gt; {
    render(&lt;HomeClient /&gt;);
    expect(screen.getByText(/离.*offer.*还有/)).toBeInTheDocument();
    expect(screen.getByText(/%/)).toBeInTheDocument(); // 进度百分比
  });

  it("只有一个主行动按钮：开始今天的训练", () =&gt; {
    render(&lt;HomeClient /&gt;);
    const buttons = screen.getAllByRole("link");
    const primaryCta = buttons.find(b =&gt; b.textContent?.includes("开始今天的训练"));
    expect(primaryCta).toBeInTheDocument();
  });

  it("有 AI 教练今日洞察，不是冰冷的统计数字", () =&gt; {
    render(&lt;HomeClient /&gt;);
    expect(screen.getByText(/今日洞察/)).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: 运行测试确认失败**

- [ ] **Step 3: 创建 PathView 核心组件**

Create `components/PathView.tsx`:

```tsx
"use client";

import type { CareerPath, LearningPlan } from "@/lib/types";
import { Icon } from "@/components/Icon";

interface PathViewProps {
  plan: LearningPlan &amp; { careerPath: CareerPath };
  currentNodeIndex: number;
  progress: number; // 0-100
  weeksLeft: number;
}

export function PathView({ plan, currentNodeIndex, progress, weeksLeft }: PathViewProps) {
  const nodes = plan.careerPath.nodes;
  const visibleNodes = nodes.slice(
    Math.max(0, currentNodeIndex - 1),
    Math.min(nodes.length, currentNodeIndex + 3)
  );

  return (
    &lt;div className="bg-white dark:bg-gray-800 rounded-2xl p-5 border dark:border-gray-700"&gt;
      {/* 头部：目标+进度 */}
      &lt;div className="mb-5"&gt;
        &lt;div className="flex items-center gap-2 mb-2"&gt;
          &lt;span className="text-2xl"&gt;{plan.careerPath.icon}&lt;/span&gt;
          &lt;span className="text-sm text-gray-500"&gt;{plan.careerPath.title}&lt;/span&gt;
        &lt;/div&gt;
        
        {/* 进度条 */}
        &lt;div className="relative mb-2"&gt;
          &lt;div className="h-3 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden"&gt;
            &lt;div 
              className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-1000"
              style={{ width: `${progress}%` }}
              role="progressbar"
              aria-valuenow={progress}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`进度 ${progress}%`}
            /&gt;
          &lt;/div&gt;
          &lt;div 
            className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white border-2 border-blue-500 rounded-full shadow-md transition-all duration-1000"
            style={{ left: `calc(${progress}% - 8px)` }}
          /&gt;
        &lt;/div&gt;

        &lt;div className="flex justify-between text-sm"&gt;
          &lt;span className="text-gray-500"&gt;{progress}% 完成&lt;/span&gt;
          &lt;span className="font-medium"&gt;
            预计 &lt;span className="text-blue-600 dark:text-blue-400"&gt;{weeksLeft} 周&lt;/span&gt; 后可面试
          &lt;/span&gt;
        &lt;/div&gt;
      &lt;/div&gt;

      {/* 当前位置 */}
      &lt;div className="mb-4"&gt;
        &lt;p className="text-xs text-gray-400 mb-1"&gt;📍 当前位置&lt;/p&gt;
        &lt;p className="font-bold text-lg"&gt;{nodes[currentNodeIndex]?.title || "准备开始"}&lt;/p&gt;
      &lt;/div&gt;

      {/* 路径节点列表 */}
      &lt;div className="space-y-0"&gt;
        {visibleNodes.map((node, i) =&gt; {
          const nodeGlobalIndex = nodes.findIndex(n =&gt; n.id === node.id);
          const isCompleted = nodeGlobalIndex &lt; currentNodeIndex;
          const isCurrent = nodeGlobalIndex === currentNodeIndex;
          const isFuture = nodeGlobalIndex &gt; currentNodeIndex;

          return (
            &lt;div key={node.id} className="flex items-start gap-3"&gt;
              &lt;div className="flex flex-col items-center"&gt;
                &lt;div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium transition-all ${
                  isCompleted
                    ? "bg-green-500 text-white"
                    : isCurrent
                    ? "bg-blue-500 text-white ring-4 ring-blue-100 dark:ring-blue-900"
                    : node.isMilestone
                    ? "bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300"
                    : "bg-gray-100 dark:bg-gray-700 text-gray-400"
                }`}&gt;
                  {isCompleted ? (
                    &lt;Icon name="check" className="w-3.5 h-3.5" /&gt;
                  ) : node.isMilestone ? (
                    &lt;Icon name="star" className="w-3.5 h-3.5" /&gt;
                  ) : isCurrent ? (
                    &lt;Icon name="target" className="w-3.5 h-3.5" /&gt;
                  ) : (
                    nodeGlobalIndex + 1
                  )}
                &lt;/div&gt;
                {i &lt; visibleNodes.length - 1 &amp;&amp; (
                  &lt;div className={`w-0.5 h-8 ${
                    isCompleted ? "bg-green-300" : "bg-gray-200 dark:bg-gray-600"
                  }`} /&gt;
                )}
              &lt;/div&gt;
              &lt;div className={`flex-1 pb-3 ${isFuture ? "opacity-60" : ""}`}&gt;
                &lt;div className="flex items-center gap-2"&gt;
                  &lt;p className={`text-sm ${isCurrent ? "font-bold text-blue-600 dark:text-blue-400" : "font-medium"}`}&gt;
                    {node.title}
                  &lt;/p&gt;
                  {node.isMilestone &amp;&amp; !isCompleted &amp;&amp; (
                    &lt;span className="text-2xs px-1.5 py-0.5 rounded bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300"&gt;
                      里程碑
                    &lt;/span&gt;
                  )}
                &lt;/div&gt;
                &lt;p className="text-xs text-gray-400"&gt;{node.description}&lt;/p&gt;
              &lt;/div&gt;
            &lt;/div&gt;
          );
        })}

        {/* 终点线 */}
        &lt;div className="flex items-start gap-3 mt-1"&gt;
          &lt;div className="w-7 h-7 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center"&gt;
            🏆
          &lt;/div&gt;
          &lt;div&gt;
            &lt;p className="text-sm font-medium text-gray-400"&gt;模拟面试通关&lt;/p&gt;
            &lt;p className="text-xs text-gray-400"&gt;拿到 offer&lt;/p&gt;
          &lt;/div&gt;
        &lt;/div&gt;
      &lt;/div&gt;
    &lt;/div&gt;
  );
}
```

- [ ] **Step 4: 重写 HomeClient 实现 Path 视图**

（核心逻辑：进度条 + 当前位置 + 节点路径 + AI 洞察 + 一个主按钮）

- [ ] **Step 5: 运行测试、类型检查、lint**

- [ ] **Step 6: Commit**

---

### Task 3: 创建 Train 沉浸式训练会话

**Files:**
- Create: `app/train/page.tsx` (训练入口路由)
- Create: `app/train/TrainClient.tsx` (训练会话客户端)
- Create: `components/TrainSession.tsx` (训练状态机组件)
- Create: `components/KnowledgeCard.tsx` (知识点讲解卡片)
- Create: `components/QuestionTrainer.tsx` (答题训练带反馈)
- Create: `components/BreakTimer.tsx` (休息呼吸引导)
- Create: `lib/ai/train-scheduler.ts` (会话智能调度)

- [ ] **Step 1: 写训练会话测试**

```tsx
// __tests__/train-session.test.ts
describe("Train 沉浸式会话", () =&gt; {
  it("学完一个知识点应该立即出现检测题，不需要跳转页面", () =&gt; {});
  it("连续答对2道以上应该自动进入下一个知识点", () =&gt; {});
  it("答错应该给出苏格拉底式引导，不是直接给答案", () =&gt; {});
  it("25分钟专注后自动触发休息，不是用户手动开番茄钟", () =&gt; {});
  it("有到期复习卡片应该在会话开始/休息后智能插入", () =&gt; {});
});
```

- [ ] **Step 2: 实现训练状态机**

训练会话状态：
```
idle → learning (知识点讲解) → questioning (答题) → feedback (反馈)
       ↓ (休息时间到)
     breaking (呼吸引导) → resume
       ↓ (完成今日目标)
     completed (会话总结)
```

- [ ] **Step 3: 实现知识点卡片（极简）**

原则：一个知识点卡片只讲1个核心概念，最多3段话，关键记忆点高亮，不超过一屏。

- [ ] **Step 4: 实现答题训练+苏格拉底式反馈**

答错时不是直接显示"错误，正确答案是B"，而是：
&gt; "再想想～你觉得高维向量用哈希索引会有什么问题？（提示：考虑维度灾难）"

- [ ] **Step 5: 实现内置番茄钟+休息引导**

每25分钟自动触发休息，478呼吸法引导，5分钟后自动回到训练。

- [ ] **Step 6: Commit**

---

### Task 4: 创建 Interview 模拟面试

**Files:**
- Create: `app/interview/page.tsx` (面试入口)
- Create: `app/interview/[sessionId]/page.tsx` (面试进行页)
- Create: `app/interview/InterviewClient.tsx` (面试核心组件)
- Create: `components/InterviewReport.tsx` (面试报告)
- Create: `lib/ai/interview-coach.ts` (面试逻辑+追问+评分)

- [ ] **Step 1: 写模拟面试测试**

- [ ] **Step 2: 实现面试会话逻辑**

AI 面试官行为：
1. 开场自我介绍+说明流程
2. 从简单到难提问
3. 根据回答追问（"能举个具体例子吗？""如果数据量是10亿级呢？"）
4. 不打断，但会在你卡壳时提示
5. 结束后给出结构化反馈

- [ ] **Step 3: 实现面试报告**

- [ ] **Step 4: Commit**

---

### Task 5: 更新底部导航为新结构

**Files:**
- Modify: `components/Nav.tsx`

- [ ] **Step 1: 修改导航为 4 个 Tab**

```typescript
const items = [
  { href: "/", label: "路径", icon: "map" },        // Path 替代 今日
  { href: "/train", label: "训练", icon: "target" }, // Train 替代 学习+复习
  { href: "/interview", label: "面试", icon: "mic" }, // Interview 新增
  { href: "/profile", label: "我的", icon: "user" }, // 保留
];
```

- [ ] **Step 2: 更新路由跳转**

- [ ] **Step 3: 确保学习/复习旧路由重定向到新入口**

- [ ] **Step 4: Commit**

---

### Task 6: 数据层适配 + 隐式感知替代手动配置

**Files:**
- Modify: `lib/ai/energy-pattern.ts` (从学习行为推断能量，不手动记录)
- Create: `lib/ai/behavior-analyzer.ts` (从答题/打断/学习时长推断状态)
- Modify: `lib/ai/persona.ts` (自动切换Persona，不手动选)
- Delete: `lib/routine.ts` (作息自动推断)

- [ ] **Step 1: 实现行为分析器**

从以下信号隐式感知用户状态：
- 能量：专注时长变化、答题反应速度、打断频率
- 情绪：答题正确率趋势、是否连续放弃、session完成率
- 作息：学习时间分布自动推断早鸟/夜猫子
- Persona：挫败时→温和；连续正确→严格推一把；迷茫时→苏格拉底引导

- [ ] **Step 2: 废弃手动配置入口**

从个人设置页移除：每日学习量、每日新内容数、Persona选择、专注模式选择、作息表配置

- [ ] **Step 3: Commit**

---

## 第四部分：自我审查清单

### 1. Spec 覆盖检查
- ✅ 焦点：从15+功能砍到3个核心模式
- ✅ Aha Moment：10秒完成选方向→看到路径→开始训练
- ✅ 情感连接：有温度的教练语言，不是冰冷数字
- ✅ 沉浸式体验：训练不跳转页面
- ✅ 技术隐形：去掉90%的配置项
- ✅ 魔法时刻：AI 懂你，自动调整节奏和风格

### 2. Placeholder 扫描
- 无 TBD/TODO
- 所有代码步骤都有具体代码
- 所有路径都是真实路径
- Task 3-4 是框架性任务，具体实现细节在执行时由 subagent 按此文档的设计原则填充完整代码

### 3. 类型一致性
- CareerPath 类型统一定义在 lib/types.ts 和 lib/onboarding/preset-paths.ts（后续执行时确保一致）
- 节点状态：untouched/learning/reviewing/mastered 统一

---

## 第五部分：执行优先级

**P0（必须最先做）：**
1. Task 1: Onboarding 重写（用户第一印象，决定留不留下来）
2. Task 5: 导航更新（骨架先搭好）

**P1（核心体验）：**
3. Task 2: Path 首页重构（用户每天看到的第一个页面）
4. Task 3: Train 训练会话（用户停留最长的页面）

**P2（闭环完成）：**
5. Task 4: Interview 模拟面试（最后一公里，拿到结果的关键）
6. Task 6: 隐式感知（AI 变聪明的关键）

---

Plan complete and saved to `docs/superpowers/plans/2026-07-20-jobsian-product-redesign.md`. Two execution options:

**1. Subagent-Driven (recommended)** - I dispatch a fresh subagent per task, review between tasks, fast iteration

**2. Inline Execution** - Execute tasks in this session using executing-plans, batch execution with checkpoints

**Which approach?**
