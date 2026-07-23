# 学习模式定位重构与「我懂了/我答对了/掌握」关系重设计 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 把 5 种学习模式（训练 / 学习 / 复习 / 错题 / 收藏）的入口关系理清——训练作为 AI 智能安排留在底部导航，学习与复习入口移入「我的」并按点击热度决定是否在首页浮现；同时把「我懂了 / 我答对了 / 知识点掌握」三个概念的语义与数据关系重新设计为「理解信号 + 回忆信号 → 派生掌握度」。

**Architecture:** 新增「模式点击计数器」（IndexedDB 环形队列，仿 `learn-input-history.ts`），驱动首页是否浮现学习/复习入口。底部导航从 5 Tab 收敛为 4 Tab（今日 / 训练 / AI / 我的），把原「学习」Tab 重命名为「训练」（指向同一 `/learn` AI 排程流），移除「复习」Tab。在「我的」新增「学习模式」分区，收纳 学习（全量自由浏览）/ 复习 / 错题 / 收藏 4 个入口。新增 `/browse` 自由学习页（跨计划全量题目平铺浏览）。掌握度从「理解 + 回忆」两类信号派生（新 `lib/mastery.ts` 纯函数），`KnowledgeNode.mastery` 不再手动设置；错题在复习中答对（Good/Easy）自动标记已掌握。

**Tech Stack:** Next.js App Router (client components)、IndexedDB (Dexie)、Vitest、Tailwind、FSRS。

---

## 设计分析

### Part A：模式定位（乔布斯视角）

**问题**：当前底部导航 5 Tab（今日 / 学习 / AI / 复习 / 我的）把「学习」和「复习」并列为一级模式，但产品定位上「训练（AI 智能安排）」才是职业路线的默认主干，「学习（自由全量）/ 复习 / 错题 / 收藏」是用户自驱的次级模式。把 5 个模式平铺到底部导航，违背焦点原则——用户分不清「学习」Tab（其实是 AI 排程的训练）和真正的「自由学习」。

**解法**：
1. **底部导航收敛为 4 Tab**：今日 / 训练 / AI / 我的。「训练」= 原「学习」Tab 的同一 `/learn` 流程（AI 排程），仅改名以正名。移除「复习」Tab——复习成为次级模式，与学习/错题/收藏并列收入「我的」。
2. **「我的」新增「学习模式」分区**：4 个入口卡片（学习 / 复习 / 错题 / 收藏），每个带图标 + 一句话定位 + 今日待处理数。
3. **首页智能浮现**：默认不在首页显示学习/复习入口（保持首页聚焦「现在该做什么」）。追踪 5 个模式的点击次数（最近 14 天环形队列），当 `学习+复习` 点击数 > `训练` 点击数时，首页浮现学习/复习快捷入口卡片，让偏爱自驱学习的用户不必每次绕道「我的」。
4. **新增 `/browse` 自由学习页**：跨所有计划平铺全部题目，带筛选（计划/知识点/大厂/难度/搜索），无排程无「今日任务」，纯自由浏览。

**为何移除「复习」Tab**：复习虽高频，但它是「自驱模式」之一。点击追踪机制保证——一旦用户真的高频复习，首页会自动浮现复习入口，比底部 Tab 更显眼。底部导航只保留「默认职业路线」的 4 个锚点，是更克制也更聚焦的设计。

### Part B：掌握度关系（卡帕西视角）

**问题**：当前三个概念各自为政、语义混乱——
- `QuestionCard`（学习/浏览态）只有「展开答案 / 收藏 / 换一题」，没有「我懂了」信号。
- `ReviewCardView`（复习态）用 FSRS 的 Again/Hard/Good/Easy，但中文用户分不清「我答对了」对应哪个。
- `KnowledgeNode.mastery` 由 `learn-log.computeStats` 从 schedule 完成率派生（`completed/total`），与「是否真懂/真答对」脱节。
- `MistakeRecord.resolved` 由用户在错题本手点「已掌握」，与复习表现脱节（答对了不会自动消除错题）。

**解法**：把三个概念统一为「两类用户信号 → 一个派生状态」：
- **我懂了（understood）**= 学习/浏览态信号。用户看完题+答案后点「我懂了」，写 `Question.understood=true` + `LearnLog(type=question_understood)`。语义：「我读懂了这道题的解析」。低门槛，必要性信号。
- **我答对了（recalled correct）**= 复习态信号。`ReviewCardView` 把 Again/Hard/Good/Easy 重命名为「没答对 / 生疏 / 答对了 / 很简单」，rating≥3（Good/Easy）= 回忆正确，写 `ReviewLog`（已有）。高门槛，充分性信号。
- **知识点掌握（mastery）**= 派生状态。新 `lib/mastery.ts` 纯函数 `computeNodeMastery()` 从 `Question.understood` 比例 + `ReviewLog` 正确率 + 最近 lapse 综合算 0-100。`KnowledgeNode.mastery` 由该函数回写，不再由 schedule 完成率推算。错题在复习 rating≥3 时自动 `resolveMistake`，移除错题本手动「已掌握」按钮（保留为只读状态展示）。

**关系一句话**：理解是必要条件，答对是充分条件，掌握是两者派生的状态——用户只点信号，系统算状态。

---

## 文件结构

| 文件 | 责任 | 类型 |
|------|------|------|
| `lib/mode-click-tracker.ts` | 5 模式点击计数（环形队列）+ `shouldSurfaceLearnReview()` 派生 | 新建 |
| `__tests__/mode-click-tracker.test.ts` | 计数器 + 浮现判定单测 | 新建 |
| `components/Nav.tsx` | 4 Tab 收敛（学习→训练，移除复习）+ 训练 Tab 点击计数 | 改写 |
| `app/profile/page.tsx` | 新增「学习模式」分区（4 入口 + 点击计数） | 修改 |
| `app/browse/page.tsx` | 自由学习页壳 | 新建 |
| `app/browse/BrowseClient.tsx` | 跨计划全量题目平铺浏览 + 筛选 + 我懂了 | 新建 |
| `lib/home.ts` | `HomeData` 增 `modeClicks` + `showLearnReviewEntries` 派生 | 修改 |
| `app/HomeClient.tsx` | 条件渲染学习/复习快捷入口区 | 修改 |
| `lib/types.ts` | `Question.understood/understoodAt` + `LearnLog.type` 增 `question_understood` | 修改 |
| `lib/mastery.ts` | `computeNodeMastery/classifyMasteryLevel/shouldAutoResolveMistake` 纯函数 | 新建 |
| `__tests__/mastery.test.ts` | 掌握度派生单测 | 新建 |
| `components/QuestionCard.tsx` | 增「我懂了」按钮（onUnderstood 回调） | 修改 |
| `app/learn/[planId]/PlanDetailClient.tsx` | 接 onUnderstood：写 understood + log + 重算 mastery | 修改 |
| `components/ReviewCardView.tsx` | Again/Hard/Good/Easy → 没答对/生疏/答对了/很简单 | 修改 |
| `app/review/page.tsx` | rating≥3 时自动 resolveMistake + 重算 mastery | 修改 |
| `app/mistakes/MistakeBookClient.tsx` | 移除手动「已掌握」按钮，改为派生状态展示 | 修改 |
| `lib/mistake-book.ts` | 增 `resolveMistakeByQuestionId(questionId)` | 修改 |
| `lib/learn-log.ts` | `computeStats` 的 mastery 改用 `lib/mastery.computeNodeMastery` | 修改 |

---

# Part A：模式定位重构

### Task A1: 模式点击计数器纯函数 + 单测

**Files:**
- Create: `lib/mode-click-tracker.ts`
- Test: `__tests__/mode-click-tracker.test.ts`

- [ ] **Step 1: 写失败测试**

`__tests__/mode-click-tracker.test.ts`:
```ts
import { describe, it, expect, vi, beforeEach } from "vitest";

// mock db，避免触碰真实 IndexedDB
vi.mock("../lib/storage/db", () => ({
  getItem: vi.fn(async () => undefined),
  setItem: vi.fn(async () => {}),
}));

import { getItem, setItem } from "../lib/storage/db";
import {
  recordModeClick,
  getModeClickStats,
  shouldSurfaceLearnReview,
  type ModeId,
} from "../lib/mode-click-tracker";

const DAY = 24 * 60 * 60 * 1000;

describe("mode-click-tracker", () => {
  beforeEach(() => {
    vi.mocked(getItem).mockReset();
    vi.mocked(getItem).mockResolvedValue(undefined);
    vi.mocked(setItem).mockReset();
  });

  it("首次记录 → 写入单条时间戳", async () => {
    await recordModeClick("train");
    expect(setItem).toHaveBeenCalledTimes(1);
    const [, value] = vi.mocked(setItem).mock.calls[0];
    expect(Array.isArray(value)).toBe(true);
    expect((value as string[]).length).toBe(1);
  });

  it("多次记录 → 追加时间戳，环形截断 100 条", async () => {
    vi.mocked(getItem).mockResolvedValue(Array.from({ length: 100 }, (_, i) => Date.now() - i * DAY));
    await recordModeClick("learn");
    const [, value] = vi.mocked(setItem).mock.calls[0];
    expect((value as string[]).length).toBe(100); // 截断后仍 100
  });

  it("getModeClickStats 按最近 14 天计数", async () => {
    const now = Date.now();
    vi.mocked(getItem).mockImplementation(async (key) => {
      if (key === "mode_click:train") return [String(now - 1 * DAY), String(now - 30 * DAY)];
      if (key === "mode_click:learn") return [String(now), String(now - 2 * DAY)];
      return undefined;
    });
    const stats = await getModeClickStats();
    expect(stats.train14d).toBe(1); // 30 天前的不计
    expect(stats.learn14d).toBe(2);
  });

  it("shouldSurfaceLearnReview：learn+review > train → true", async () => {
    const now = Date.now();
    vi.mocked(getItem).mockImplementation(async (key) => {
      if (key === "mode_click:train") return [String(now)];
      if (key === "mode_click:learn") return [String(now), String(now - 1 * DAY)];
      if (key === "mode_click:review") return [String(now)];
      return undefined;
    });
    expect(await shouldSurfaceLearnReview()).toBe(true); // 3 > 1
  });

  it("shouldSurfaceLearnReview：learn+review <= train → false", async () => {
    const now = Date.now();
    vi.mocked(getItem).mockImplementation(async (key) => {
      if (key === "mode_click:train") return [String(now), String(now - 1 * DAY), String(now - 2 * DAY)];
      if (key === "mode_click:learn") return [String(now)];
      return undefined;
    });
    expect(await shouldSurfaceLearnReview()).toBe(false); // 1 <= 3
  });

  it("无任何点击 → false（不浮现）", async () => {
    expect(await shouldSurfaceLearnReview()).toBe(false);
  });
});
```

- [ ] **Step 2: 跑测试确认失败**

Run: `npx vitest run __tests__/mode-click-tracker.test.ts`
Expected: FAIL — `Cannot find module '../lib/mode-click-tracker'`

- [ ] **Step 3: 实现计数器**

`lib/mode-click-tracker.ts`:
```ts
// lib/mode-click-tracker.ts
// 5 种学习模式的点击计数（IndexedDB 环形队列）
//   训练(train) / 学习(learn) / 复习(review) / 错题(mistake) / 收藏(favorite)
// 用途：首页是否浮现学习/复习快捷入口（learn+review 14天点击 > train 14天点击）
// 仿 learn-input-history.ts 的环形队列模式

import { getItem, setItem } from "@/lib/storage/db";

export type ModeId = "train" | "learn" | "review" | "mistake" | "favorite";

const MAX_CLICKS = 100; // 每模式最多保留 100 条时间戳
const WINDOW_MS = 14 * 24 * 60 * 60 * 1000; // 14 天窗口

function keyOf(mode: ModeId): string {
  return `mode_click:${mode}`;
}

/** 记录一次模式点击（追加时间戳，环形截断） */
export async function recordModeClick(mode: ModeId): Promise<void> {
  const k = keyOf(mode);
  const list = (await getItem<string[]>(k)) ?? [];
  const next = [...list, Date.now().toString()].slice(-MAX_CLICKS);
  await setItem(k, next);
}

/** 单模式最近 14 天点击数 */
export async function getModeClickCount(mode: ModeId, windowMs = WINDOW_MS): Promise<number> {
  const list = (await getItem<string[]>(keyOf(mode))) ?? [];
  const cutoff = Date.now() - windowMs;
  return list.filter((t) => Number(t) >= cutoff).length;
}

export interface ModeClickStats {
  train14d: number;
  learn14d: number;
  review14d: number;
  mistake14d: number;
  favorite14d: number;
}

/** 5 模式最近 14 天点击统计 */
export async function getModeClickStats(): Promise<ModeClickStats> {
  const [train14d, learn14d, review14d, mistake14d, favorite14d] = await Promise.all([
    getModeClickCount("train"),
    getModeClickCount("learn"),
    getModeClickCount("review"),
    getModeClickCount("mistake"),
    getModeClickCount("favorite"),
  ]);
  return { train14d, learn14d, review14d, mistake14d, favorite14d };
}

/**
 * 首页是否应浮现学习/复习快捷入口
 * 规则：最近 14 天 (learn+review) 点击数 > train 点击数
 * 边界：train=0 且 learn+review=0 → false（无数据不浮现，保持默认聚焦训练）
 */
export async function shouldSurfaceLearnReview(): Promise<boolean> {
  const stats = await getModeClickStats();
  const learnReview = stats.learn14d + stats.review14d;
  if (learnReview === 0) return false;
  return learnReview > stats.train14d;
}
```

- [ ] **Step 4: 跑测试确认通过**

Run: `npx vitest run __tests__/mode-click-tracker.test.ts`
Expected: PASS (6 tests)

- [ ] **Step 5: 提交**

```bash
git add lib/mode-click-tracker.ts __tests__/mode-click-tracker.test.ts
git commit -m "feat(mode-tracker): add 5-mode click counter with home-surfacing rule"
```

---

### Task A2: 底部导航 4 Tab 收敛（学习→训练，移除复习）

**Files:**
- Modify: `components/Nav.tsx`

- [ ] **Step 1: 重写 Nav**

`components/Nav.tsx`:
```tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon, type IconName } from "@/components/Icon";
import { recordModeClick } from "@/lib/mode-click-tracker";

// 底部导航：5→4 Tab 减法（乔布斯焦点原则）
// 收敛逻辑：
//   - 原「学习」Tab 重命名为「训练」（同一 /learn 流程，AI 智能排程）
//   - 移除「复习」Tab（复习成为次级模式，收入「我的」学习模式分区）
//   - 学习/复习/错题/收藏 4 个自驱模式统一在「我的」入口，按点击热度决定是否在首页浮现
// 原 /review /mistakes /emotion /dashboard 路由保留（直接访问 URL 仍可用）
const items: Array<{ href: string; label: string; icon: IconName; mode?: "train" }> = [
  { href: "/", label: "今日", icon: "home" },
  { href: "/learn", label: "训练", icon: "zap", mode: "train" },
  { href: "/chat", label: "AI", icon: "chat" },
  { href: "/profile", label: "我的", icon: "user" },
];

export function Nav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="主导航"
      className="fixed bottom-0 left-0 right-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur-lg border-t border-gray-200 dark:border-gray-800 flex justify-around z-50 pb-[env(safe-area-inset-bottom)]"
    >
      {items.map((item) => {
        const active =
          pathname === item.href ||
          (item.href !== "/" && pathname.startsWith(item.href));
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-label={item.label}
            aria-current={active ? "page" : undefined}
            onClick={() => {
              if (item.mode) void recordModeClick(item.mode);
            }}
            className={`flex flex-col items-center gap-0.5 py-2 px-1 transition-colors ${
              active
                ? "text-blue-600 dark:text-blue-400"
                : "text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
            }`}
          >
            <Icon name={item.icon} className="w-[22px] h-[22px]" />
            <span className="text-[10px] font-medium">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
```

- [ ] **Step 2: 验证类型与构建**

Run: `npx tsc --noEmit`
Expected: 无类型错误

- [ ] **Step 3: 提交**

```bash
git add components/Nav.tsx
git commit -m "feat(nav): collapse to 4 tabs, rename 学习→训练, move 复习 to profile"
```

---

### Task A3: 「我的」新增「学习模式」分区

**Files:**
- Modify: `app/profile/page.tsx`

- [ ] **Step 1: 在 profile 顶部「学习统计」分区前插入「学习模式」分区**

在 `app/profile/page.tsx` 的 `return (` 后 `<h1>我的</h1>` 之后、`{/* 1. 学习统计概览 */}` 之前，插入新分区。同时在顶部 import 区追加：

```ts
import { recordModeClick, type ModeId } from "@/lib/mode-click-tracker";
```

并在组件内（`return` 之前）加入待处理数加载 `useEffect` 与 state。先在已有 `useEffect` 内追加（复用同一次加载），找到 `// 加载收藏统计` 段并在其下方追加待复习/错题数加载：

```ts
      // 加载各模式待处理数（学习模式分区展示）
      const [allCardsForCount, unresolvedMistakes] = await Promise.all([
        listItems<ReviewCard>(KEY_PREFIXES.CARD),
        getUnresolvedMistakes(),
      ]);
      const dueReviewCount = getDueCards(allCardsForCount).length;
      setDueReviewCount(dueReviewCount);
      setMistakeCount(unresolvedMistakes.length);
```

并在文件顶部 import 区追加（如尚无）：
```ts
import { listItems } from "@/lib/storage/db";
import { KEY_PREFIXES, type ReviewCard } from "@/lib/types";
import { getDueCards } from "@/lib/fsrs";
import { getUnresolvedMistakes } from "@/lib/mistake-book";
```

注：`listItems` / `KEY_PREFIXES` / `ReviewCard` / `getUnresolvedMistakes` 部分已 import，按实际未引入的补充。`getDueCards` 来自 `@/lib/fsrs`。

在组件 state 区（`const [streak, setStreak] = useState(0);` 附近）追加：
```ts
  // 学习模式分区：各模式待处理数
  const [dueReviewCount, setDueReviewCount] = useState(0);
  const [mistakeCount, setMistakeCount] = useState(0);
```

- [ ] **Step 2: 插入「学习模式」分区 JSX**

在 `<h1 className="text-2xl font-bold">我的</h1>` 之后插入：

```tsx
      {/* === 置顶：学习模式入口（4 个自驱模式）=== */}
      <section className="space-y-3 rounded-xl border dark:border-gray-700 bg-white dark:bg-gray-800 p-4 shadow-sm">
        <header className="flex items-center justify-between gap-3">
          <h2 className="flex items-center gap-2 text-base font-semibold">
            <Icon name="zap" className="w-5 h-5 shrink-0" />
            学习模式
          </h2>
          <span className="text-right text-xs text-gray-400">自驱学习入口</span>
        </header>
        <div className="grid grid-cols-2 gap-3">
          <ModeEntry
            href="/browse"
            icon="book"
            title="学习"
            desc="全量自由浏览"
            badge={undefined}
            mode="learn"
          />
          <ModeEntry
            href="/review"
            icon="repeat"
            title="复习"
            desc="按遗忘曲线"
            badge={dueReviewCount > 0 ? `${dueReviewCount} 待复习` : undefined}
            mode="review"
          />
          <ModeEntry
            href="/mistakes"
            icon="x-circle"
            title="错题"
            desc="攻克薄弱点"
            badge={mistakeCount > 0 ? `${mistakeCount} 待攻克` : undefined}
            mode="mistake"
          />
          <ModeEntry
            href="/favorites"
            icon="star"
            title="收藏"
            desc="试题集与单题"
            badge={deckCount + questionCount > 0 ? `${deckCount}集/${questionCount}题` : undefined}
            mode="favorite"
          />
        </div>
        <p className="text-[11px] text-gray-400 leading-relaxed">
          「训练」在底部导航（AI 智能排程）。这里收纳 4 个自驱模式。常用模式会自动在首页浮现。
        </p>
      </section>
```

- [ ] **Step 3: 在文件底部追加 `ModeEntry` 子组件**

在 `function Section(...)` 定义之前追加：

```tsx
/** 学习模式入口卡片：图标 + 标题 + 描述 + 待处理徽标，点击记录模式点击 */
function ModeEntry({
  href,
  icon,
  title,
  desc,
  badge,
  mode,
}: {
  href: string;
  icon: IconName;
  title: string;
  desc: string;
  badge?: string;
  mode: ModeId;
}) {
  return (
    <Link
      href={href}
      onClick={() => void recordModeClick(mode)}
      className="flex flex-col gap-1 rounded-lg border border-gray-200 dark:border-gray-700 p-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
    >
      <div className="flex items-center justify-between">
        <Icon name={icon} className="w-4 h-4 text-blue-500" />
        {badge && (
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-orange-50 dark:bg-orange-950/40 text-orange-600 dark:text-orange-300 font-medium">
            {badge}
          </span>
        )}
      </div>
      <span className="text-sm font-medium">{title}</span>
      <span className="text-[11px] text-gray-400">{desc}</span>
    </Link>
  );
}
```

- [ ] **Step 4: 验证类型与构建**

Run: `npx tsc --noEmit`
Expected: 无类型错误

- [ ] **Step 5: 提交**

```bash
git add app/profile/page.tsx
git commit -m "feat(profile): add 学习模式 section with 4 self-driven entries"
```

---

### Task A4: `/browse` 自由学习页

**Files:**
- Create: `app/browse/page.tsx`
- Create: `app/browse/BrowseClient.tsx`

- [ ] **Step 1: 创建页壳**

`app/browse/page.tsx`:
```tsx
import BrowseClient from "./BrowseClient";

export default function Page() {
  return <BrowseClient />;
}
```

- [ ] **Step 2: 创建 BrowseClient**

`app/browse/BrowseClient.tsx`:
```tsx
"use client";

// app/browse/BrowseClient.tsx
// 自由学习页：跨所有计划平铺全部题目，无排程无「今日任务」，纯自由浏览。
// 与 PlanDetailClient 的区别：
//   - 聚合所有 plan 的 questions（平铺），不按计划分组
//   - 不渲染 schedule / 知识树脑图
//   - 筛选维度：计划 / 知识点 / 大厂 / 难度 / 搜索 / 仅未懂
//   - 复用 QuestionCard（含「我懂了」按钮，Part B 接入）

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { listItems, setItem } from "@/lib/storage/db";
import { KEY_PREFIXES, type LearningPlan, type Question } from "@/lib/types";
import { QuestionCard } from "@/components/QuestionCard";
import { toggleQuestionInPlan } from "@/lib/favorite";
import { savePlanSummary } from "@/lib/plan-summary";
import { Icon } from "@/components/Icon";

interface FlatQuestion {
  question: Question;
  planId: string;
  planTopic: string;
  nodeId: string;
}

export default function BrowseClient() {
  const [plans, setPlans] = useState<LearningPlan[]>([]);
  const [loading, setLoading] = useState(true);

  // 筛选状态
  const [filterPlanId, setFilterPlanId] = useState<string | "all">("all");
  const [filterNodeId, setFilterNodeId] = useState<string | "all">("all");
  const [filterBigTech, setFilterBigTech] = useState<"all" | "big" | "normal">("all");
  const [filterDifficulty, setFilterDifficulty] = useState<number | "all">("all");
  const [filterUnunderstood, setFilterUnunderstood] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    (async () => {
      const all = await listItems<LearningPlan>(KEY_PREFIXES.PLAN);
      setPlans(all);
      setLoading(false);
    })();
  }, []);

  // 平铺所有题目
  const flat: FlatQuestion[] = useMemo(() => {
    const out: FlatQuestion[] = [];
    for (const plan of plans) {
      for (const q of plan.questions) {
        out.push({ question: q, planId: plan.id, planTopic: plan.topic, nodeId: q.nodeId });
      }
    }
    return out;
  }, [plans]);

  // 可选知识点（按计划筛选收敛）
  const nodeOptions = useMemo(() => {
    const map = new Map<string, string>();
    for (const p of plans) {
      if (filterPlanId !== "all" && p.id !== filterPlanId) continue;
      for (const n of p.knowledgeTree) map.set(n.id, n.title);
    }
    return Array.from(map.entries());
  }, [plans, filterPlanId]);

  // 难度查找表（nodeId → difficulty）
  const difficultyMap = useMemo(() => {
    const map = new Map<string, number>();
    for (const p of plans) {
      for (const n of p.knowledgeTree) map.set(n.id, n.difficulty);
    }
    return map;
  }, [plans]);

  const filtered = useMemo(() => {
    return flat.filter(({ question: q, nodeId }) => {
      if (filterPlanId !== "all" && q.nodeId !== q.nodeId) {
        // 计划筛选在 flat 里按 planTopic 维度更直观，这里按 planId 过滤
      }
      if (filterBigTech === "big" && !q.bigTech) return false;
      if (filterBigTech === "normal" && q.bigTech) return false;
      if (filterDifficulty !== "all" && difficultyMap.get(nodeId) !== filterDifficulty) return false;
      if (filterNodeId !== "all" && nodeId !== filterNodeId) return false;
      if (filterUnunderstood && q.understood) return false;
      if (searchQuery.trim()) {
        const ql = searchQuery.toLowerCase();
        if (!q.question.toLowerCase().includes(ql) && !q.answer.toLowerCase().includes(ql)) return false;
      }
      return true;
    }).filter(({ planId }) => filterPlanId === "all" || planId === filterPlanId);
  }, [flat, filterPlanId, filterBigTech, filterDifficulty, filterNodeId, filterUnunderstood, searchQuery, difficultyMap]);

  async function handleFavorite(planId: string, questionId: string) {
    const plan = plans.find((p) => p.id === planId);
    if (!plan) return;
    const updated = toggleQuestionInPlan(plan, questionId);
    setPlans((prev) => prev.map((p) => (p.id === planId ? updated : p)));
    await setItem(KEY_PREFIXES.PLAN + planId, updated);
    await savePlanSummary(updated);
  }

  // Part B 接入：我懂了 回调（Task B4 接线，此处先留 noop 容错）
  async function handleUnderstood(planId: string, questionId: string) {
    const plan = plans.find((p) => p.id === planId);
    if (!plan) return;
    const q = plan.questions.find((x) => x.id === questionId);
    if (!q || q.understood) return;
    const updatedQuestions = plan.questions.map((x) =>
      x.id === questionId
        ? { ...x, understood: true, understoodAt: new Date().toISOString() }
        : x
    );
    const updated = { ...plan, questions: updatedQuestions, updatedAt: new Date().toISOString() };
    setPlans((prev) => prev.map((p) => (p.id === planId ? updated : p)));
    await setItem(KEY_PREFIXES.PLAN + planId, updated);
    await savePlanSummary(updated);
    // log + mastery 重算在 Task B4 接线
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-8">
        <div className="w-8 h-8 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin" />
        <p className="text-sm text-gray-400 mt-3">加载全部题目…</p>
      </div>
    );
  }

  if (plans.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-8 text-center">
        <Icon name="book" className="w-12 h-12 text-gray-300 mb-3" />
        <p className="text-gray-500">还没有学习计划</p>
        <Link href="/learn" className="mt-4 px-4 py-2 bg-black text-white rounded-lg text-sm">
          去训练（创建计划）
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 max-w-3xl mx-auto pb-20">
      <header className="mb-4">
        <Link href="/profile" className="text-sm text-gray-400 mb-2 inline-block">← 返回</Link>
        <h1 className="text-xl font-bold flex items-center gap-2">
          <Icon name="book" className="w-5 h-5 inline-block" /> 自由学习
        </h1>
        <p className="text-xs text-gray-500 mt-1">
          跨全部计划平铺 {flat.length} 道题，自由浏览无排程
        </p>
      </header>

      {/* 筛选栏 */}
      <div className="mb-4 p-3 bg-gray-50 rounded-lg space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={filterPlanId}
            onChange={(e) => { setFilterPlanId(e.target.value); setFilterNodeId("all"); }}
            className="text-xs border rounded px-2 py-1 bg-white"
          >
            <option value="all">全部计划</option>
            {plans.map((p) => (
              <option key={p.id} value={p.id}>{p.topic}</option>
            ))}
          </select>
          <select
            value={filterNodeId}
            onChange={(e) => setFilterNodeId(e.target.value)}
            className="text-xs border rounded px-2 py-1 bg-white"
          >
            <option value="all">全部知识点</option>
            {nodeOptions.map(([id, title]) => (
              <option key={id} value={id}>{title}</option>
            ))}
          </select>
          <select
            value={filterBigTech}
            onChange={(e) => setFilterBigTech(e.target.value as "all" | "big" | "normal")}
            className="text-xs border rounded px-2 py-1 bg-white"
          >
            <option value="all">大厂全部</option>
            <option value="big">仅大厂</option>
            <option value="normal">仅普通</option>
          </select>
          <select
            value={filterDifficulty}
            onChange={(e) => setFilterDifficulty(e.target.value === "all" ? "all" : Number(e.target.value))}
            className="text-xs border rounded px-2 py-1 bg-white"
          >
            <option value="all">难度全部</option>
            {[1, 2, 3, 4, 5].map((d) => (
              <option key={d} value={d}>难度 {d}</option>
            ))}
          </select>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="搜索题目或答案..."
            className="text-xs border rounded px-2 py-1 flex-1 min-w-[120px]"
          />
          <label className="flex items-center gap-1 text-xs text-gray-600">
            <input
              type="checkbox"
              checked={filterUnunderstood}
              onChange={(e) => setFilterUnunderstood(e.target.checked)}
              className="h-4 w-4"
            />
            仅未懂
          </label>
          {(filterPlanId !== "all" || filterNodeId !== "all" || filterBigTech !== "all" ||
            filterDifficulty !== "all" || filterUnunderstood || searchQuery) && (
            <button
              onClick={() => {
                setFilterPlanId("all"); setFilterNodeId("all"); setFilterBigTech("all");
                setFilterDifficulty("all"); setFilterUnunderstood(false); setSearchQuery("");
              }}
              className="text-xs text-gray-400 hover:text-red-500"
            >
              清除筛选
            </button>
          )}
        </div>
        <p className="text-xs text-gray-400">显示 {filtered.length} / {flat.length} 题</p>
      </div>

      {/* 题目列表 */}
      <div className="space-y-2">
        {filtered.map(({ question, planId, planTopic }) => (
          <div key={`${planId}-${question.id}`}>
            <p className="text-[10px] text-gray-400 mb-1">
              <Icon name="bookmark" className="w-3 h-3 inline-block align-middle" /> {planTopic}
            </p>
            <QuestionCard
              question={question}
              onFavoriteToggle={(qid) => handleFavorite(planId, qid)}
              onUnderstood={(qid) => handleUnderstood(planId, qid)}
            />
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <Icon name="search" className="w-8 h-8 inline-block mb-2" />
            <p className="text-sm">筛选下无题目</p>
          </div>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 3: 验证类型与构建（此时 onUnderstood prop 尚未存在于 QuestionCard，先注释掉该 prop 传递，Task B3 接回）**

> 注：Task B3 会在 `QuestionCard` 增加 `onUnderstood` 可选 prop。本任务先在 `BrowseClient` 的 `<QuestionCard>` 上**保留** `onUnderstood` 传递但**暂时移除该行**以避免类型错误，待 Task B3 完成后回填。即先把 `onUnderstood={(qid) => handleUnderstood(planId, qid)}` 这一行注释掉，并保留 `handleUnderstood` 函数定义。

Run: `npx tsc --noEmit`
Expected: 无类型错误

- [ ] **Step 4: 提交**

```bash
git add app/browse/page.tsx app/browse/BrowseClient.tsx
git commit -m "feat(browse): add /browse free-learning page (cross-plan flat question list)"
```

---

### Task A5: 首页数据 hook 增 `showLearnReviewEntries` + 派生

**Files:**
- Modify: `lib/home.ts`

- [ ] **Step 1: 在 `HomeData` 接口追加字段**

在 `lib/home.ts` 的 `HomeData` interface 末尾（`aiQualitySummary` 字段后）追加：

```ts
  /**
   * 是否在首页浮现学习/复习快捷入口（新增）
   * 规则：最近 14 天 (learn+review) 点击数 > train 点击数
   * false 时首页不渲染该分区，保持聚焦「训练」
   */
  showLearnReviewEntries: boolean;
```

- [ ] **Step 2: 在 `useState` 初始值追加 `showLearnReviewEntries: false`**

在 `useHomeData` 的 `useState<HomeData>({...})` 初始对象末尾追加 `showLearnReviewEntries: false,`。

- [ ] **Step 3: 在 `load` 的并行查询数组追加 `shouldSurfaceLearnReview()`**

找到 `const [cards, plans, logs, todayStatus, profile, emotions, mistakes, userProfile, qualityReport] = await Promise.all([...])`，将其改为 10 路并行：

```ts
    const [cards, plans, logs, todayStatus, profile, emotions, mistakes, userProfile, qualityReport, showLearnReviewEntries] =
      await Promise.all([
        listItems<ReviewCard>(KEY_PREFIXES.CARD),
        listItems<LearningPlan>(KEY_PREFIXES.PLAN),
        listItems<LearnLog>(KEY_PREFIXES.LEARN_LOG),
        getItem<DailyStatus>(todayStatusKey),
        getItem<PublicProfile>("my:profile"),
        listItems<EmotionEntry>(KEY_PREFIXES.EMOTION),
        getUnresolvedMistakes(),
        getUserProfile(),
        getQualityReport(todayStartIso),
        shouldSurfaceLearnReview(),
      ]);
```

并在文件顶部 import 区追加：
```ts
import { shouldSurfaceLearnReview } from "@/lib/mode-click-tracker";
```

- [ ] **Step 4: 在 `setData({...})` 调用追加 `showLearnReviewEntries`**

在 `setData({...})` 对象末尾（`aiQualitySummary,` 之后）追加：
```ts
      showLearnReviewEntries,
```

- [ ] **Step 5: 验证类型与单测**

Run: `npx tsc --noEmit && npx vitest run __tests__/home-derive.test.ts`
Expected: 无类型错误；home-derive 测试 PASS（新增字段有默认值，不破坏既有断言）

- [ ] **Step 6: 提交**

```bash
git add lib/home.ts
git commit -m "feat(home): derive showLearnReviewEntries from mode click stats"
```

---

### Task A6: 首页条件渲染学习/复习快捷入口

**Files:**
- Modify: `app/HomeClient.tsx`

- [ ] **Step 1: 从 `useHomeData()` 解构 `showLearnReviewEntries`**

在 `app/HomeClient.tsx` 的 `const { ... } = useHomeData();` 解构中追加 `showLearnReviewEntries,`。

- [ ] **Step 2: 在 KPI 三宫格之后插入条件分区**

找到 `{/* ============ 3. AI 教练洞察区` 之前（即 KPI 三宫格 `</section>` 之后），插入：

```tsx
      {/* ============ 2.5 自驱模式快捷入口（按点击热度浮现）============ */}
      {showLearnReviewEntries && (
        <section className="mb-5 grid grid-cols-2 gap-3">
          <Link
            href="/browse"
            onClick={() => void recordModeClick("learn")}
            className="flex items-center gap-3 rounded-2xl border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/30 p-4 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
          >
            <Icon name="book" className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            <div>
              <p className="text-sm font-medium text-blue-800 dark:text-blue-300">自由学习</p>
              <p className="text-[11px] text-blue-600 dark:text-blue-400">全量浏览，无排程</p>
            </div>
          </Link>
          <Link
            href="/review"
            onClick={() => void recordModeClick("review")}
            className="flex items-center gap-3 rounded-2xl border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950/30 p-4 hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors"
          >
            <Icon name="repeat" className="w-6 h-6 text-green-600 dark:text-green-400" />
            <div>
              <p className="text-sm font-medium text-green-800 dark:text-green-300">去复习</p>
              <p className="text-[11px] text-green-600 dark:text-green-400">
                {dueCount > 0 ? `${dueCount} 张待复习` : "无待复习"}
              </p>
            </div>
          </Link>
        </section>
      )}
```

- [ ] **Step 3: 顶部 import 追加**

```ts
import { recordModeClick } from "@/lib/mode-click-tracker";
```

- [ ] **Step 4: 验证类型与构建**

Run: `npx tsc --noEmit`
Expected: 无类型错误

- [ ] **Step 5: 提交**

```bash
git add app/HomeClient.tsx
git commit -m "feat(home): surface learn/review quick entries by click heat"
```

---

# Part B：「我懂了 / 我答对了 / 掌握」关系重构

### Task B1: 类型扩展（Question.understood + LearnLog.type）

**Files:**
- Modify: `lib/types.ts`

- [ ] **Step 1: `Question` 接口追加字段**

在 `lib/types.ts` 的 `Question` interface 中，`aiCallId?: string;` 之后追加：

```ts
  /** 用户点击「我懂了」标记（学习/浏览态信号，掌握度派生的必要条件） */
  understood?: boolean;
  /** 标记「我懂了」的时间 ISO */
  understoodAt?: string;
```

- [ ] **Step 2: `LearnLog.type` 联合类型追加 `question_understood`**

找到 `type: "learn" | "review" | "learn_complete" | "review_complete" | "question_view" | "question_favorite" | "question_regenerate" | "focus_session";`，追加 `"question_understood"`：

```ts
  type: "learn" | "review" | "learn_complete" | "review_complete" | "question_view" | "question_favorite" | "question_regenerate" | "focus_session" | "question_understood";
```

- [ ] **Step 3: 验证类型与全量单测无回归**

Run: `npx tsc --noEmit && npx vitest run __tests__/types.test.ts __tests__/learn-api.test.ts`
Expected: 无类型错误；既有测试 PASS（新字段均为可选，向后兼容）

- [ ] **Step 4: 提交**

```bash
git add lib/types.ts
git commit -m "feat(types): add Question.understood + LearnLog question_understood type"
```

---

### Task B2: 掌握度派生纯函数 + 单测

**Files:**
- Create: `lib/mastery.ts`
- Test: `__tests__/mastery.test.ts`

- [ ] **Step 1: 写失败测试**

`__tests__/mastery.test.ts`:
```ts
import { describe, it, expect } from "vitest";
import {
  computeNodeMastery,
  classifyMasteryLevel,
  shouldAutoResolveMistake,
} from "../lib/mastery";
import type { Question, ReviewLog } from "../lib/types";

function mkQuestion(overrides: Partial<Question> = {}): Question {
  return {
    id: "q1",
    nodeId: "k1",
    question: "q",
    answer: "a",
    keyPoints: [],
    followUps: [],
    favorited: false,
    ...overrides,
  };
}

describe("computeNodeMastery", () => {
  it("无题目无复习 → 0", () => {
    expect(computeNodeMastery({ nodeId: "k1", questions: [], reviewLogs: [], hasRecentLapse: false })).toBe(0);
  });

  it("全部懂但无复习 → 40（仅理解分）", () => {
    const questions = [mkQuestion({ understood: true }), mkQuestion({ understood: true })];
    const m = computeNodeMastery({ nodeId: "k1", questions, reviewLogs: [], hasRecentLapse: false });
    expect(m).toBe(40);
  });

  it("全部懂 + 全部答对 → 80（理解40 + 回忆40）", () => {
    const questions = [mkQuestion({ understood: true })];
    const reviewLogs: ReviewLog[] = [
      { id: "l1", cardId: "c1", date: "2026-07-01", rating: 3, elapsedDays: 1, stateBefore: 2, stateAfter: 2 },
      { id: "l2", cardId: "c1", date: "2026-07-02", rating: 4, elapsedDays: 1, stateBefore: 2, stateAfter: 2 },
    ];
    const m = computeNodeMastery({ nodeId: "k1", questions, reviewLogs, hasRecentLapse: false });
    expect(m).toBe(80);
  });

  it("最近 lapse → 扣 20", () => {
    const questions = [mkQuestion({ understood: true })];
    const reviewLogs: ReviewLog[] = [
      { id: "l1", cardId: "c1", date: "2026-07-01", rating: 4, elapsedDays: 1, stateBefore: 2, stateAfter: 2 },
    ];
    const m = computeNodeMastery({ nodeId: "k1", questions, reviewLogs, hasRecentLapse: true });
    expect(m).toBe(60); // 40 + 40 - 20
  });

  it("上限 100，下限 0", () => {
    const questions = [mkQuestion({ understood: true })];
    const reviewLogs: ReviewLog[] = [
      { id: "l1", cardId: "c1", date: "2026-07-01", rating: 4, elapsedDays: 1, stateBefore: 2, stateAfter: 2 },
    ];
    expect(computeNodeMastery({ nodeId: "k1", questions, reviewLogs, hasRecentLapse: false })).toBeLessThanOrEqual(100);
    expect(computeNodeMastery({ nodeId: "k1", questions: [], reviewLogs: [], hasRecentLapse: true })).toBeGreaterThanOrEqual(0);
  });
});

describe("classifyMasteryLevel", () => {
  it(">=80 → advanced", () => {
    expect(classifyMasteryLevel(80)).toBe("advanced");
    expect(classifyMasteryLevel(100)).toBe("advanced");
  });
  it("50-79 → intermediate", () => {
    expect(classifyMasteryLevel(50)).toBe("intermediate");
    expect(classifyMasteryLevel(79)).toBe("intermediate");
  });
  it("<50 → beginner", () => {
    expect(classifyMasteryLevel(0)).toBe("beginner");
    expect(classifyMasteryLevel(49)).toBe("beginner");
  });
});

describe("shouldAutoResolveMistake", () => {
  it("rating 3 (Good) → true", () => {
    expect(shouldAutoResolveMistake(3)).toBe(true);
  });
  it("rating 4 (Easy) → true", () => {
    expect(shouldAutoResolveMistake(4)).toBe(true);
  });
  it("rating 1 (Again) → false", () => {
    expect(shouldAutoResolveMistake(1)).toBe(false);
  });
  it("rating 2 (Hard) → false", () => {
    expect(shouldAutoResolveMistake(2)).toBe(false);
  });
});
```

- [ ] **Step 2: 跑测试确认失败**

Run: `npx vitest run __tests__/mastery.test.ts`
Expected: FAIL — `Cannot find module '../lib/mastery'`

- [ ] **Step 3: 实现 mastery 纯函数**

`lib/mastery.ts`:
```ts
// lib/mastery.ts
// 知识点掌握度派生：从「我懂了（understood）」+「我答对了（review correct）」两类用户信号
// 派生 KnowledgeNode.mastery（0-100）。
//
// 关系设计（卡帕西视角）：
//   - 理解（understood）是必要条件：读懂解析 ≠ 能回忆。权重 0.4，满 40 分。
//   - 回忆正确（review rating≥3）是充分条件：能主动回忆 = 真掌握。权重 0.4，满 40 分。
//   - 最近 lapse 扣分：最近一次答错会拉低掌握度，避免「曾经答对=永久掌握」误判。扣 20。
//   - 剩余 20 分留给 recency/稳定度（本期先用 0 占位，后续接入 FSRS stability）。
//
// 用户只点信号（我懂了 / 我答对了），系统算状态（mastery）。

import type { Question, ReviewLog, SkillLevel } from "./types";

export interface MasteryInput {
  nodeId: string;
  /** 该节点下的全部题目（用于算 understood 比例） */
  questions: Question[];
  /** 该节点相关卡片的复习日志（用于算正确率）。
   * 调用方需先按 nodeId 过滤好（通过 plan.knowledgeTree / card.nodeId 关联） */
  reviewLogs: ReviewLog[];
  /** 最近一次该节点的复习是否 lapse（rating=1）。调用方判定 */
  hasRecentLapse: boolean;
}

const WEIGHT_UNDERSTOOD = 40;
const WEIGHT_RECALL = 40;
const LAPSE_PENALTY = 20;

/**
 * 计算单个知识点的掌握度（0-100）
 * 纯函数，无 IO，便于单测与缓存
 */
export function computeNodeMastery(input: MasteryInput): number {
  const { questions, reviewLogs, hasRecentLapse } = input;

  // 理解分：understood 题目占比 × 40
  let score = 0;
  if (questions.length > 0) {
    const understoodCount = questions.filter((q) => q.understood).length;
    score += (understoodCount / questions.length) * WEIGHT_UNDERSTOOD;
  }

  // 回忆分：rating≥3 占比 × 40
  if (reviewLogs.length > 0) {
    const correctCount = reviewLogs.filter((l) => l.rating >= 3).length;
    score += (correctCount / reviewLogs.length) * WEIGHT_RECALL;
  }

  // lapse 扣分
  if (hasRecentLapse) {
    score -= LAPSE_PENALTY;
  }

  // recency 分（预留 20，本期不实现，保持 0）

  return Math.max(0, Math.min(100, Math.round(score)));
}

/**
 * 把 0-100 掌握度映射为三档技能等级
 * 与 UserProfile.skillLevel 对齐
 */
export function classifyMasteryLevel(mastery: number): SkillLevel {
  if (mastery >= 80) return "advanced";
  if (mastery >= 50) return "intermediate";
  return "beginner";
}

/**
 * 复习评分是否应自动消除错题
 * rating≥3（Good/Easy = 答对了/很简单）= 回忆成功 → 错题自动标记已掌握
 * rating<3（Again/Hard = 没答对/生疏）= 仍需练习 → 错题保留
 */
export function shouldAutoResolveMistake(rating: ReviewLog["rating"]): boolean {
  return rating >= 3;
}
```

- [ ] **Step 4: 跑测试确认通过**

Run: `npx vitest run __tests__/mastery.test.ts`
Expected: PASS (9 tests)

- [ ] **Step 5: 提交**

```bash
git add lib/mastery.ts __tests__/mastery.test.ts
git commit -m "feat(mastery): add derived mastery from understood + recall signals"
```

---

### Task B3: QuestionCard 增「我懂了」按钮

**Files:**
- Modify: `components/QuestionCard.tsx`

- [ ] **Step 1: Props 增 `onUnderstood`**

在 `components/QuestionCard.tsx` 的 `interface Props` 中追加：

```ts
  /** 用户点击「我懂了」回调（学习/浏览态信号）。不传则不渲染按钮（如复习态用 ReviewCardView） */
  onUnderstood?: (questionId: string) => void;
```

并在解构中追加 `onUnderstood`：
```ts
export function QuestionCard({ question, onFavoriteToggle, onRegenerate, regenerating, onFollowUpClick, onUnderstood }: Props) {
```

- [ ] **Step 2: 在答案展开区追加「我懂了」按钮**

找到 `{question.codeSnippet && (<CodeBlock ... />)}` 之后、`</div>`（关闭 `expanded && question.answer` 块）之前，插入：

```tsx
          {onUnderstood && (
            <div className="pt-1">
              {question.understood ? (
                <span className="inline-flex items-center gap-1 text-xs text-green-600">
                  <Icon name="check-circle" className="w-4 h-4" /> 已懂
                </span>
              ) : (
                <button
                  onClick={() => onUnderstood(question.id)}
                  className="inline-flex items-center gap-1 text-xs px-3 py-1 rounded-full bg-green-50 text-green-700 hover:bg-green-100 transition-colors border border-green-200"
                >
                  <Icon name="check" className="w-3.5 h-3.5" /> 我懂了
                </button>
              )}
            </div>
          )}
```

- [ ] **Step 3: 验证类型与构建**

Run: `npx tsc --noEmit`
Expected: 无类型错误

- [ ] **Step 4: 回填 BrowseClient 的 onUnderstood 传递（Task A4 注释掉的那行）**

在 `app/browse/BrowseClient.tsx` 找到 `<QuestionCard>` 调用，把之前注释的 `onUnderstood={(qid) => handleUnderstood(planId, qid)}` 取消注释（恢复传递）。

Run: `npx tsc --noEmit`
Expected: 无类型错误

- [ ] **Step 5: 提交**

```bash
git add components/QuestionCard.tsx app/browse/BrowseClient.tsx
git commit -m "feat(question-card): add 我懂了 button wired to onUnderstood"
```

---

### Task B4: PlanDetail 接 onUnderstood + 写 log + 重算 mastery

**Files:**
- Modify: `app/learn/[planId]/PlanDetailClient.tsx`

- [ ] **Step 1: 顶部 import 追加**

```ts
import { computeNodeMastery } from "@/lib/mastery";
import { listItems } from "@/lib/storage/db";
import type { ReviewLog } from "@/lib/types";
```

- [ ] **Step 2: 新增 `handleUnderstood` 函数**

在 `PlanDetailClient` 的 `handleQuestionFavorite` 函数之后追加：

```tsx
  // 我懂了：标记 Question.understood + 写 log + 重算该节点 mastery
  async function handleUnderstood(questionId: string) {
    if (!plan) return;
    const oldQ = plan.questions.find((q) => q.id === questionId);
    if (!oldQ || oldQ.understood) return;
    const updatedQuestions = plan.questions.map((q) =>
      q.id === questionId
        ? { ...q, understood: true, understoodAt: nowISO() }
        : q
    );
    // 重算该节点 mastery
    const nodeId = oldQ.nodeId;
    const nodeQuestions = updatedQuestions.filter((q) => q.nodeId === nodeId);
    const allReviewLogs = await listItems<ReviewLog>(KEY_PREFIXES.REVIEW_LOG);
    // 该节点的复习日志：通过 card→nodeId 关联（card.nodeId === nodeId）
    const allCards = await listItems<ReviewCard>(KEY_PREFIXES.CARD);
    const nodeCardIds = new Set(allCards.filter((c) => c.nodeId === nodeId).map((c) => c.id));
    const nodeReviewLogs = allReviewLogs.filter((l) => nodeCardIds.has(l.cardId));
    const hasRecentLapse = nodeReviewLogs.some((l) => l.rating === 1);
    const updatedTree = plan.knowledgeTree.map((n) =>
      n.id === nodeId
        ? { ...n, mastery: computeNodeMastery({ nodeId, questions: nodeQuestions, reviewLogs: nodeReviewLogs, hasRecentLapse }) }
        : n
    );
    const updated: LearningPlan = {
      ...plan,
      questions: updatedQuestions,
      knowledgeTree: updatedTree,
      updatedAt: nowISO(),
    };
    setPlan(updated);
    await setItem(KEY_PREFIXES.PLAN + plan.id, updated);
    await savePlanSummary(updated);
    // 写学习日志（掌握度派生的「理解」信号）
    logLearning({
      planId: plan.id,
      nodeId,
      questionId,
      type: "question_understood",
    }).catch(() => {});
  }
```

> 注：`ReviewCard` 类型与 `KEY_PREFIXES` 已在文件顶部 import（`KEY_PREFIXES` 来自 `@/lib/types`，`ReviewCard` 需确认已 import；若未 import，在 `import type { LearningPlan, Question, ScheduleItem } from "@/lib/types";` 行追加 `ReviewCard` 与 `ReviewLog`）。

- [ ] **Step 3: 在 `QuestionCard` 调用接线 `onUnderstood`**

找到 `<QuestionCard question={q} onFavoriteToggle={handleQuestionFavorite} onRegenerate={handleRegenerate} regenerating={regeneratingId === q.id} />`，追加 `onUnderstood={handleUnderstood}`：

```tsx
              <QuestionCard
                question={q}
                onFavoriteToggle={handleQuestionFavorite}
                onRegenerate={handleRegenerate}
                regenerating={regeneratingId === q.id}
                onUnderstood={handleUnderstood}
              />
```

- [ ] **Step 4: BrowseClient 的 handleUnderstood 补 log + mastery（与 PlanDetail 对齐）**

在 `app/browse/BrowseClient.tsx` 顶部 import 追加：
```ts
import { logLearning } from "@/lib/learn-log";
import { computeNodeMastery } from "@/lib/mastery";
import { listItems } from "@/lib/storage/db";
import type { ReviewCard, ReviewLog } from "@/lib/types";
```

把 Task A4 中的 `handleUnderstood` 函数替换为完整版（在原 `setItem`/`savePlanSummary` 之后追加 log + mastery 重算）：

```tsx
  async function handleUnderstood(planId: string, questionId: string) {
    const plan = plans.find((p) => p.id === planId);
    if (!plan) return;
    const q = plan.questions.find((x) => x.id === questionId);
    if (!q || q.understood) return;
    const updatedQuestions = plan.questions.map((x) =>
      x.id === questionId
        ? { ...x, understood: true, understoodAt: new Date().toISOString() }
        : x
    );
    const nodeId = q.nodeId;
    const nodeQuestions = updatedQuestions.filter((x) => x.nodeId === nodeId);
    const allReviewLogs = await listItems<ReviewLog>(KEY_PREFIXES.REVIEW_LOG);
    const allCards = await listItems<ReviewCard>(KEY_PREFIXES.CARD);
    const nodeCardIds = new Set(allCards.filter((c) => c.nodeId === nodeId).map((c) => c.id));
    const nodeReviewLogs = allReviewLogs.filter((l) => nodeCardIds.has(l.cardId));
    const hasRecentLapse = nodeReviewLogs.some((l) => l.rating === 1);
    const updatedTree = plan.knowledgeTree.map((n) =>
      n.id === nodeId
        ? { ...n, mastery: computeNodeMastery({ nodeId, questions: nodeQuestions, reviewLogs: nodeReviewLogs, hasRecentLapse }) }
        : n
    );
    const updated = { ...plan, questions: updatedQuestions, knowledgeTree: updatedTree, updatedAt: new Date().toISOString() };
    setPlans((prev) => prev.map((p) => (p.id === planId ? updated : p)));
    await setItem(KEY_PREFIXES.PLAN + planId, updated);
    await savePlanSummary(updated);
    logLearning({ planId, nodeId, questionId, type: "question_understood" }).catch(() => {});
  }
```

- [ ] **Step 5: 验证类型与构建**

Run: `npx tsc --noEmit`
Expected: 无类型错误

- [ ] **Step 6: 提交**

```bash
git add app/learn/[planId]/PlanDetailClient.tsx app/browse/BrowseClient.tsx
git commit -m "feat(mastery): wire onUnderstood to log + recompute node mastery"
```

---

### Task B5: ReviewCardView 重命名评分按钮（我答对了语义）

**Files:**
- Modify: `components/ReviewCardView.tsx`

- [ ] **Step 1: 重命名 RATINGS 标签**

把 `components/ReviewCardView.tsx` 顶部 `RATINGS` 数组改为：

```ts
const RATINGS: { value: Rating; label: string; icon: IconName; color: string }[] = [
  { value: 1, label: "没答对", icon: "frown", color: "bg-red-500" },
  { value: 2, label: "生疏", icon: "meh", color: "bg-orange-500" },
  { value: 3, label: "答对了", icon: "smile", color: "bg-green-500" },
  { value: 4, label: "很简单", icon: "smile", color: "bg-blue-500" },
];
```

- [ ] **Step 2: 在评分按钮上方加一行提示**

找到 `<div className="grid grid-cols-4 gap-2">` 之前，插入：

```tsx
          <p className="text-[11px] text-gray-400 text-center mb-1">
            自评回忆结果：「答对了/很简单」= 掌握信号，会自动消除错题
          </p>
```

- [ ] **Step 3: 同步更新 review 完成页的统计文案**

在 `app/review/page.tsx` 的完成页 JSX 中，把 `Again: / Hard: / Good: / Easy:` 改为中文标签：

```tsx
            <p><Icon name="frown" className="w-4 h-4 inline-block align-middle" /> 没答对: {stats.again}</p>
            <p><Icon name="meh" className="w-4 h-4 inline-block align-middle" /> 生疏: {stats.hard}</p>
            <p><Icon name="smile" className="w-4 h-4 inline-block align-middle" /> 答对了: {stats.good}</p>
            <p><Icon name="smile" className="w-4 h-4 inline-block align-middle" /> 很简单: {stats.easy}</p>
```

- [ ] **Step 4: 验证类型与构建**

Run: `npx tsc --noEmit`
Expected: 无类型错误

- [ ] **Step 5: 提交**

```bash
git add components/ReviewCardView.tsx app/review/page.tsx
git commit -m "feat(review): relabel ratings to 没答对/生疏/答对了/很简单"
```

---

### Task B6: 复习答对自动消除错题 + 重算 mastery

**Files:**
- Modify: `lib/mistake-book.ts`
- Modify: `app/review/page.tsx`

- [ ] **Step 1: `lib/mistake-book.ts` 增 `resolveMistakeByQuestionId`**

在 `lib/mistake-book.ts` 的 `resolveMistake` 函数之后追加：

```ts
/** 按题目 ID 标记错题为已掌握（复习答对时自动调用） */
export async function resolveMistakeByQuestionId(questionId: string): Promise<void> {
  const all = await listItems<MistakeRecord>(KEY_PREFIXES.MISTAKE);
  const matches = all.filter((m) => m.questionId === questionId && !m.resolved);
  await Promise.all(
    matches.map((m) => setItem(KEY_PREFIXES.MISTAKE + m.id, { ...m, resolved: true })),
  );
}
```

- [ ] **Step 2: `app/review/page.tsx` 在 `handleRate` 中接自动消除**

在 `app/review/page.tsx` 顶部 import 追加：
```ts
import { recordMistake, resolveMistakeByQuestionId } from "@/lib/mistake-book";
import { shouldAutoResolveMistake } from "@/lib/mastery";
```

（`recordMistake` 已 import，确认即可；新增 `resolveMistakeByQuestionId` 与 `shouldAutoResolveMistake`。）

在 `handleRate` 函数中，找到 `// 答错（Again）自动加入错题本` 段，在其 `if (rating === 1) {...}` 之后追加 `else if (shouldAutoResolveMistake(rating))` 分支：

```tsx
      // 答错（Again）自动加入错题本
      if (rating === 1) {
        try {
          await recordMistake({
            planId: card.planId,
            questionId: card.questionId,
            nodeId: card.nodeId,
            questionText: card.front,
          });
        } catch {
          // 错题记录失败不影响复习流程
        }
      } else if (shouldAutoResolveMistake(rating)) {
        // 答对（Good/Easy = 答对了/很简单）自动消除该题的错题记录
        try {
          await resolveMistakeByQuestionId(card.questionId);
        } catch {
          // 消除失败不影响复习流程
        }
      }
```

- [ ] **Step 3: 验证类型与单测**

Run: `npx tsc --noEmit && npx vitest run __tests__/review-api.test.ts __tests__/review-dedup.test.ts`
Expected: 无类型错误；既有 review 测试 PASS

- [ ] **Step 4: 提交**

```bash
git add lib/mistake-book.ts app/review/page.tsx
git commit -m "feat(review): auto-resolve mistake on Good/Easy rating"
```

---

### Task B7: 错题本 UI 移除手动「已掌握」按钮 + 派生状态展示

**Files:**
- Modify: `app/mistakes/MistakeBookClient.tsx`

- [ ] **Step 1: 移除未解决错题的「已掌握」手动按钮**

在 `app/mistakes/MistakeBookClient.tsx` 中，找到未解决错题卡片底部的 `<button onClick={() => handleResolve(m.id)} ...>已掌握</button>`，**删除该 button**。保留旁边的「去复习」`<Link>`。

把该 `<div className="flex gap-2">` 内仅保留：

```tsx
                  <div className="flex gap-2">
                    <Link
                      href="/review"
                      className="px-2 py-1 text-xs bg-blue-50 text-blue-700 rounded font-medium hover:bg-blue-100 transition-colors"
                    >
                      去复习
                    </Link>
                  </div>
```

- [ ] **Step 2: 在未解决错题卡片加一行提示「答对后自动消除」**

在未解决错题卡片的 `<div className="flex items-center justify-between mt-2">` 之前（即题目文本 `<p>` 之后），追加：

```tsx
                <p className="text-[10px] text-gray-400 mt-1">
                  在复习中选「答对了/很简单」会自动消除此错题
                </p>
```

- [ ] **Step 3: 移除不再使用的 `handleResolve` 函数与 `resolveMistake` import**

删除组件内的 `async function handleResolve(id: string) {...}` 函数，并把顶部 import 中的 `resolveMistake` 移除（仅保留 `getUnresolvedMistakes`）：

```ts
import {
  getUnresolvedMistakes,
} from "@/lib/mistake-book";
```

- [ ] **Step 4: 验证类型与构建**

Run: `npx tsc --noEmit`
Expected: 无类型错误

- [ ] **Step 5: 提交**

```bash
git add app/mistakes/MistakeBookClient.tsx
git commit -m "refactor(mistakes): remove manual 已掌握 button, rely on auto-resolve"
```

---

### Task B8: learn-log.computeStats 的 mastery 改用 lib/mastery

**Files:**
- Modify: `lib/learn-log.ts`

- [ ] **Step 1: 顶部 import 追加**

```ts
import { computeNodeMastery } from "./mastery";
import type { ReviewLog } from "./types";
```

- [ ] **Step 2: 重写 `computeStats` 的 mastery 计算**

找到 `computeStats` 中 `// 计算掌握度` 段（约 156-163 行），把：

```ts
  // 计算掌握度
  const weakAreas: string[] = [];
  for (const [nodeId, prog] of Object.entries(nodeProgress)) {
    prog.mastery = prog.total > 0 ? Math.round((prog.completed / prog.total) * 100) : 0;
    if (prog.total > 0 && prog.completed / prog.total < 0.5) {
      weakAreas.push(nodeId);
    }
  }
```

替换为：

```ts
  // 计算掌握度（改用 lib/mastery 派生：理解信号 + 回忆信号，而非 schedule 完成率）
  const allReviewLogs = await listItems<ReviewLog>(KEY_PREFIXES.REVIEW_LOG);
  const allCardsForMastery = await listItems<ReviewCard>(KEY_PREFIXES.CARD);
  const weakAreas: string[] = [];
  for (const [nodeId, prog] of Object.entries(nodeProgress)) {
    // 收集该节点的题目 + 复习日志
    const nodeQuestions: Question[] = [];
    for (const plan of allPlans) {
      for (const q of plan.questions) {
        if (q.nodeId === nodeId) nodeQuestions.push(q);
      }
    }
    const nodeCardIds = new Set(
      allCardsForMastery.filter((c) => c.nodeId === nodeId).map((c) => c.id)
    );
    const nodeReviewLogs = allReviewLogs.filter((l) => nodeCardIds.has(l.cardId));
    const hasRecentLapse = nodeReviewLogs.some((l) => l.rating === 1);
    prog.mastery = computeNodeMastery({
      nodeId,
      questions: nodeQuestions,
      reviewLogs: nodeReviewLogs,
      hasRecentLapse,
    });
    if (prog.mastery < 50) {
      weakAreas.push(nodeId);
    }
  }
```

并在顶部 import 区追加 `Question` 与 `ReviewCard` 类型（若未引入）：
```ts
import type { LearnLog, LearnStats, Routine, LearningPlan, Question, ReviewCard } from "./types";
```

- [ ] **Step 3: 跑相关单测确认无回归**

Run: `npx vitest run __tests__/knowledge.test.ts __tests__/profile-builder.test.ts`
Expected: PASS（mastery 数值变化不影响这些测试的断言；若有断言 mastery 具体值的测试失败，按新派生逻辑更新断言）

- [ ] **Step 4: 验证类型与构建**

Run: `npx tsc --noEmit`
Expected: 无类型错误

- [ ] **Step 5: 提交**

```bash
git add lib/learn-log.ts
git commit -m "refactor(learn-log): derive node mastery via lib/mastery instead of schedule completion"
```

---

### Task A7（收尾）: 全量测试、构建验证、推送到远程

**Files:** 无新增，仅验证

- [ ] **Step 1: 跑全部新增/改动相关单测**

Run: `npx vitest run __tests__/mode-click-tracker.test.ts __tests__/mastery.test.ts __tests__/learn-router.test.ts __tests__/home-derive.test.ts __tests__/review-api.test.ts __tests__/favorite.test.ts`
Expected: 全部 PASS

- [ ] **Step 2: 全量 TypeScript 检查**

Run: `npx tsc --noEmit`
Expected: 无错误

- [ ] **Step 3: ESLint 检查改动文件**

Run: `npx next lint --file lib/mode-click-tracker.ts --file components/Nav.tsx --file app/profile/page.tsx --file app/browse/BrowseClient.tsx --file lib/home.ts --file app/HomeClient.tsx --file lib/types.ts --file lib/mastery.ts --file components/QuestionCard.tsx --file app/learn/[planId]/PlanDetailClient.tsx --file components/ReviewCardView.tsx --file app/review/page.tsx --file app/mistakes/MistakeBookClient.tsx --file lib/mistake-book.ts --file lib/learn-log.ts`
Expected: 无 error（warning 可接受）

- [ ] **Step 4: 推送到远程 develop**

Run: `git push origin develop`
Expected: 推送成功

---

## Self-Review

**1. Spec coverage**：

需求 1（功能定位）：
- 5 模式定义（训练/学习/复习/错题/收藏）→ `mode-click-tracker.ts` ModeId + Nav 训练 Tab + Profile 学习模式分区（4 入口）+ /browse 自由学习页 ✅
- 训练在底部导航 → Nav 4 Tab，学习→训练改名（Task A2）✅
- 学习/复习入口放「我的」→ Profile 学习模式分区（Task A3）✅
- 记录点击次数判定是否比训练多 → `recordModeClick` + `shouldSurfaceLearnReview`（Task A1）✅
- 首页按热度浮现学习/复习入口 → HomeClient 条件分区（Task A6）✅
- 默认隐藏 → `shouldSurfaceLearnReview` 在无数据时返回 false（Task A1 测试覆盖）✅

需求 2（我懂了/我答对了/掌握关系）：
- 梳理三者关系 → 设计分析 + mastery.ts 派生公式（Task B2）✅
- 我懂了 信号 → QuestionCard 按钮 + Question.understood + LearnLog(type=question_understood)（Task B1/B3/B4）✅
- 我答对了 语义 → ReviewCardView 重命名「答对了/很简单」+ shouldAutoResolveMistake（Task B2/B5）✅
- 知识点掌握 派生 → computeNodeMastery 从 understood + recall 派生，回写 KnowledgeNode.mastery（Task B2/B4/B8）✅
- 错题自动消除 → resolveMistakeByQuestionId + review 接线（Task B6）✅
- 移除手动「已掌握」→ MistakeBookClient 改造（Task B7）✅

**2. Placeholder scan**：所有步骤含完整代码或精确改动位置；无 TODO/TBD/「类似 Task N」；测试含真实断言。✅

**3. Type consistency**：
- `ModeId` 在 Task A1 定义，在 Task A2/A3/A6 一致使用 ✅
- `Question.understood/understoodAt` 在 Task B1 定义，B3/B4 读写一致 ✅
- `LearnLog.type` 新增 `question_understood` 在 B1 定义，B4 写入一致 ✅
- `computeNodeMastery(input: MasteryInput)` 签名在 B2 定义，B4/B8 调用一致（`{ nodeId, questions, reviewLogs, hasRecentLapse }`）✅
- `shouldAutoResolveMistake(rating)` 在 B2 定义，B6 调用一致 ✅
- `resolveMistakeByQuestionId(questionId)` 在 B6 定义并调用 ✅
- `recordModeClick(mode)` / `shouldSurfaceLearnReview()` 在 A1 定义，A2/A3/A5/A6 调用一致 ✅
- `QuestionCard` 新增 `onUnderstood?` 可选 prop 在 B3 定义，A4/B4 接线一致 ✅

**4. 边界场景**：
- /browse 空计划态 → Task A4 Step 2 有空态分支 ✅
- 训练 Tab 点击计数在 SSR 安全 → recordModeClick 内部用 getItem（db.ts SSR 返回 undefined），Nav onClick 仅客户端触发 ✅
- 旧 Question 无 understood 字段 → 可选字段，`q.understood` 为 undefined 时 `if (q.understood)` 为 false，按未懂处理 ✅
- 旧 KnowledgeNode.mastery 旧值 → 由 computeNodeMastery 在下次「我懂了」/复习时覆盖；computeStats 也改用派生 ✅

---

## Execution Handoff

Plan complete and saved to `docs/superpowers/plans/2026-07-23-mode-positioning-and-mastery-rework.md`. Two execution options:

**1. Subagent-Driven (recommended)** - 每个 Task 派一个全新 subagent 实现，Task 间 review，迭代快、上下文干净。

**2. Inline Execution** - 在当前会话用 executing-plans 批量执行，带 checkpoint review。

选哪种？
