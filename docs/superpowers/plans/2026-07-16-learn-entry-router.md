# 学习入口智能路由 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 让"学习"导航入口变聪明——新用户（无任何学习计划）进入创建页，老用户（已有计划）进入学习列表页，点击列表中的计划再进入详情。

**Architecture:** 将 `/learn` 改造为薄路由页（客户端读 IndexedDB 判断状态后 `router.replace`）。把原创建页内容迁移到 `/learn/new`，新增 `/learn/list` 专门做计划列表。利用 Next.js App Router 静态路由优先于动态路由的特性，`/learn/new`、`/learn/list` 不会被 `/learn/[planId]` 捕获。路由判断逻辑抽成纯函数 `resolveLearnEntry()`，便于单测。

**Tech Stack:** Next.js App Router (client components)、IndexedDB (Dexie)、Vitest、Tailwind。

---

## 设计分析（乔布斯视角）

**问题**：当前点击「学习」一律落到 `/learn`，创建表单占据首屏顶部，老用户每次都得滑过表单才能在底部找到自己的历史计划。这违背焦点原则——把最常用的动作（继续学习）藏在了不常用动作（新建计划）之下。

**解法**：
1. **新用户** → 进入 `/learn/new`（创建页）：聚焦"输入主题 → 拆知识树"，去掉底部历史列表的视觉噪音。
2. **老用户** → 进入 `/learn/list`（列表页）：一屏看完全部计划，点卡片即进详情。顶部留"+ 新建"入口，但不喧宾夺主。
3. **`/learn` 本身** → 退化为智能路由器，根据状态 0 跳转，自身不渲染业务内容，只显示极简骨架屏。

**为何是"列表"而非"直接跳最新计划详情"**：列表给用户掌控感和全局视野。直接跳详情会让人困惑"我怎么到这儿了"。列表 → 详情是可预测的两步路径。

## 文件结构

| 文件 | 责任 | 类型 |
|------|------|------|
| `lib/learn-router.ts` | `resolveLearnEntry()` 纯函数：读摘要 → 返回目标路径 | 新建 |
| `app/learn/page.tsx` | 薄路由页：调用 `resolveLearnEntry` 后 `router.replace` | 改写 |
| `app/learn/new/page.tsx` | 创建页（原 `/learn/page.tsx` 内容，去掉历史列表段） | 新建 |
| `app/learn/list/page.tsx` | 列表页壳，渲染 `ListClient` | 新建 |
| `app/learn/list/ListClient.tsx` | 列表页客户端逻辑：加载摘要、渲染卡片、删除、空态防御 | 新建 |
| `__tests__/learn-router.test.ts` | `resolveLearnEntry` 单测 | 新建 |

**路由优先级说明**：Next.js App Router 中，静态段 `/learn/new`、`/learn/list` 优先于动态段 `/learn/[planId]`，无需额外配置。

---

### Task 1: 路由判断纯函数 + 单测

**Files:**
- Create: `lib/learn-router.ts`
- Test: `__tests__/learn-router.test.ts`

- [ ] **Step 1: 写失败测试**

`__tests__/learn-router.test.ts`:
```ts
import { describe, it, expect, vi, beforeEach } from "vitest";

// mock plan-summary，避免触碰真实 IndexedDB
vi.mock("../lib/plan-summary", () => ({
  listPlanSummaries: vi.fn(),
  migrateSummaries: vi.fn(async () => 0),
}));

import { resolveLearnEntry } from "../lib/learn-router";
import { listPlanSummaries } from "../lib/plan-summary";
import type { LearningPlanSummary } from "../lib/types";

function makeSummary(id: string): LearningPlanSummary {
  return {
    id,
    topic: `topic-${id}`,
    knowledgeCount: 3,
    questionCount: 5,
    scheduleDays: 7,
    dailyMinutes: 30,
    maxNewPerDay: 1,
    createdAt: "2026-07-01T00:00:00.000Z",
    updatedAt: "2026-07-01T00:00:00.000Z",
  };
}

describe("resolveLearnEntry", () => {
  beforeEach(() => {
    vi.mocked(listPlanSummaries).mockReset();
    vi.mocked(listPlanSummaries).mockResolvedValue([]);
  });

  it("无计划 → 返回 /learn/new", async () => {
    vi.mocked(listPlanSummaries).mockResolvedValue([]);
    expect(await resolveLearnEntry()).toBe("/learn/new");
  });

  it("有 1 个计划 → 返回 /learn/list", async () => {
    vi.mocked(listPlanSummaries).mockResolvedValue([makeSummary("p1")]);
    expect(await resolveLearnEntry()).toBe("/learn/list");
  });

  it("有多个计划 → 返回 /learn/list", async () => {
    vi.mocked(listPlanSummaries).mockResolvedValue([
      makeSummary("p1"),
      makeSummary("p2"),
    ]);
    expect(await resolveLearnEntry()).toBe("/learn/list");
  });
});
```

- [ ] **Step 2: 跑测试确认失败**

Run: `npx vitest run __tests__/learn-router.test.ts`
Expected: FAIL — `Cannot find module '../lib/learn-router'`

- [ ] **Step 3: 实现纯函数**

`lib/learn-router.ts`:
```ts
// lib/learn-router.ts
// 学习入口智能路由：根据用户已有计划状态决定落地页
//   无计划 → /learn/new（创建页）
//   有计划 → /learn/list（列表页）
// 抽成纯函数便于单测，且与 React 解耦。

import { listPlanSummaries, migrateSummaries } from "./plan-summary";

/**
 * 解析学习入口目标路径。
 * 顺带做一次旧数据 summary 迁移（幂等，无缺失时立即返回）。
 */
export async function resolveLearnEntry(): Promise<string> {
  await migrateSummaries();
  const summaries = await listPlanSummaries();
  return summaries.length === 0 ? "/learn/new" : "/learn/list";
}
```

- [ ] **Step 4: 跑测试确认通过**

Run: `npx vitest run __tests__/learn-router.test.ts`
Expected: PASS (3 tests)

- [ ] **Step 5: 提交**

```bash
git add lib/learn-router.ts __tests__/learn-router.test.ts
git commit -m "feat(learn): add resolveLearnEntry pure router function"
```

---

### Task 2: `/learn` 改造为智能路由页

**Files:**
- Modify: `app/learn/page.tsx`（整体重写为薄路由）

- [ ] **Step 1: 重写为薄路由页**

`app/learn/page.tsx`:
```tsx
"use client";

// app/learn/page.tsx
// 学习入口智能路由：
//   无计划 → /learn/new
//   有计划 → /learn/list
// 本页自身不渲染业务内容，只显示极简骨架屏后跳转。

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { resolveLearnEntry } from "@/lib/learn-router";
import { Icon } from "@/components/Icon";

export default function LearnRouterPage() {
  const router = useRouter();
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const target = await resolveLearnEntry();
        if (!cancelled) router.replace(target);
      } catch {
        if (!cancelled) {
          // 兜底：读取失败时回到创建页，保证不卡死
          router.replace("/learn/new");
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8">
      <div className="mb-4 animate-pulse">
        <Icon name="book" className="w-10 h-10 inline-block text-gray-300" />
      </div>
      <p className="text-sm text-gray-400">正在进入学习…</p>
      {failed && (
        <button
          onClick={() => router.replace("/learn/new")}
          className="mt-4 text-xs text-blue-500 underline"
        >
          点击手动进入
        </button>
      )}
    </div>
  );
}
```

- [ ] **Step 2: 验证构建**

Run: `npx tsc --noEmit`
Expected: 无类型错误

- [ ] **Step 3: 提交**

```bash
git add app/learn/page.tsx
git commit -m "feat(learn): convert /learn into smart entry router"
```

---

### Task 3: 创建 `/learn/new` 创建页（迁移原内容）

**Files:**
- Create: `app/learn/new/page.tsx`（从原 `app/learn/page.tsx` 迁移，移除"历史计划"段及相关状态）

- [ ] **Step 1: 创建 `/learn/new/page.tsx`**

将原 `app/learn/page.tsx` 的全部业务内容（AI 主题输入、预设知识库、自定义提示词、预设脑图弹窗）复制到 `app/learn/new/page.tsx`，并做以下精简：
1. **移除**「历史计划」整段 JSX（原 561-601 行）及其相关 state 与函数：`history`、`historyMigrating`、`confirmingDeleteId`、`refreshHistory`、`deletePlan`、`migrateSummaries` 调用。
2. **保留** demo 数据检测与清除逻辑（`hasDemoData` / `clearDemoData`），因为它们在创建真实计划时触发。
3. **保留**创建后 `router.push(`/learn/${plan.id}`)` 跳详情的原行为。
4. 顶部标题下方加一行返回链接：有需要时可回列表（用 Link 指向 `/learn/list`）。

完整文件见 `app/learn/new/page.tsx`（基于原文件删减历史段，约 600 行 → 约 530 行）。核心改动 diff 摘要：
- 删除 import：`listPlanSummaries` / `savePlanSummary` / `deletePlanSummary` / `migrateSummaries`（`savePlanSummary` 在创建时仍需，保留）。
- 删除 state：`history` / `confirmingDeleteId` / `historyMigrating`。
- 删除函数：`refreshHistory` / `deletePlan`。
- 删除 JSX：`{history.length > 0 && (...)}` 整段 + `{historyMigrating && ...}`。
- `useEffect` 移除 `refreshHistory()` 调用。

- [ ] **Step 2: 验证类型与构建**

Run: `npx tsc --noEmit`
Expected: 无类型错误

- [ ] **Step 3: 提交**

```bash
git add app/learn/new/page.tsx
git commit -m "feat(learn): move creation flow to /learn/new"
```

---

### Task 4: 创建 `/learn/list` 列表页

**Files:**
- Create: `app/learn/list/page.tsx`
- Create: `app/learn/list/ListClient.tsx`

- [ ] **Step 1: 创建列表页壳**

`app/learn/list/page.tsx`:
```tsx
import ListClient from "./ListClient";

export default function Page() {
  return <ListClient />;
}
```

- [ ] **Step 2: 创建 ListClient 组件**

`app/learn/list/ListClient.tsx`:
```tsx
"use client";

// app/learn/list/ListClient.tsx
// 学习计划列表页：展示所有计划摘要，点击进详情，支持删除。
// 空态防御：若用户在本页把所有计划删完，自动跳回 /learn/new。

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { listPlanSummaries, migrateSummaries, deletePlanSummary } from "@/lib/plan-summary";
import { delItem } from "@/lib/storage/db";
import { KEY_PREFIXES, type LearningPlanSummary } from "@/lib/types";
import { Icon } from "@/components/Icon";

export default function ListClient() {
  const router = useRouter();
  const [plans, setPlans] = useState<LearningPlanSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirmingDeleteId, setConfirmingDeleteId] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      await migrateSummaries();
      const summaries = await listPlanSummaries();
      if (summaries.length === 0) {
        // 防御：理论上 router 不会让 0 计划用户进入 list，
        // 但用户可能在本页删完所有计划，此时回到创建页
        router.replace("/learn/new");
        return;
      }
      setPlans(summaries);
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  async function deletePlan(planId: string, e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (confirmingDeleteId !== planId) {
      setConfirmingDeleteId(planId);
      setTimeout(() => setConfirmingDeleteId(null), 3000);
      return;
    }
    await delItem(KEY_PREFIXES.PLAN + planId);
    await deletePlanSummary(planId);
    const remaining = plans.filter((p) => p.id !== planId);
    setPlans(remaining);
    setConfirmingDeleteId(null);
    if (remaining.length === 0) {
      router.replace("/learn/new");
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-8">
        <div className="w-8 h-8 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin" />
        <p className="text-sm text-gray-400 mt-3">加载学习计划…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 max-w-2xl mx-auto">
      <header className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">我的学习</h1>
          <p className="text-sm text-gray-500 mt-1">
            共 {plans.length} 个计划
          </p>
        </div>
        <Link
          href="/learn/new"
          className="flex items-center gap-1 px-4 py-2 bg-black text-white text-sm rounded-lg font-medium hover:bg-gray-800 transition-colors"
        >
          <Icon name="plus" className="w-4 h-4 inline-block" />
          新建
        </Link>
      </header>

      <div className="space-y-2">
        {plans.map((p) => (
          <Link
            key={p.id}
            href={`/learn/${p.id}`}
            className="block border rounded-lg p-4 hover:bg-gray-50 hover:border-blue-300 transition-colors bg-white"
          >
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-base font-medium truncate">{p.topic}</p>
                <p className="text-xs text-gray-400 mt-1">
                  {p.knowledgeCount} 知识点 · {p.questionCount} 题 ·{" "}
                  {p.scheduleDays} 天计划 · 每日 {p.dailyMinutes} 分钟
                </p>
                <p className="text-[11px] text-gray-400 mt-0.5">
                  创建于 {new Date(p.createdAt).toLocaleDateString("zh-CN")}
                </p>
              </div>
              <div className="flex items-center gap-2 ml-2">
                <button
                  onClick={(e) => deletePlan(p.id, e)}
                  className={`text-xs px-2 py-1 rounded transition-colors ${
                    confirmingDeleteId === p.id
                      ? "bg-red-500 text-white"
                      : "text-gray-400 hover:bg-red-50 hover:text-red-500"
                  }`}
                  aria-label="删除计划"
                >
                  {confirmingDeleteId === p.id ? (
                    "确认删除"
                  ) : (
                    <Icon name="x" className="w-3.5 h-3.5 inline-block" />
                  )}
                </button>
                <span className="text-xs text-gray-400">查看 →</span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <p className="text-center text-xs text-gray-300 mt-8">
        <Icon name="lightbulb" className="w-3.5 h-3.5 inline-block align-middle" />{" "}
        点击计划卡片进入学习详情
      </p>
    </div>
  );
}
```

- [ ] **Step 3: 验证类型与构建**

Run: `npx tsc --noEmit`
Expected: 无类型错误

- [ ] **Step 4: 提交**

```bash
git add app/learn/list/page.tsx app/learn/list/ListClient.tsx
git commit -m "feat(learn): add /learn/list plans list page"
```

---

### Task 5: 全量测试与构建验证

**Files:** 无新增，仅验证

- [ ] **Step 1: 跑路由函数单测**

Run: `npx vitest run __tests__/learn-router.test.ts`
Expected: PASS (3 tests)

- [ ] **Step 2: 跑既有 learn 相关测试确保无回归**

Run: `npx vitest run __tests__/learn-api.test.ts __tests__/plan-feasibility.test.ts`
Expected: PASS

- [ ] **Step 3: TypeScript 全量类型检查**

Run: `npx tsc --noEmit`
Expected: 无错误

- [ ] **Step 4: ESLint 检查改动文件**

Run: `npx next lint --file app/learn/page.tsx --file app/learn/new/page.tsx --file app/learn/list/ListClient.tsx --file lib/learn-router.ts`
Expected: 无 error（warning 可接受）

- [ ] **Step 5: 推送到远程**

```bash
git push origin develop
```

---

## Self-Review

**1. Spec coverage**：
- "没有学习过或没有学习计划就进入学习页" → `resolveLearnEntry` 返回 `/learn/new`（Task 1）✅
- "有的话应该进入学习列表或学习详情" → 有计划返回 `/learn/list`（Task 1），列表点卡片进 `/learn/[planId]` 详情（Task 4）✅
- 智能入口落地 → `/learn` 薄路由（Task 2）✅

**2. Placeholder scan**：Task 3 描述了具体删减项与保留项，未用 "TODO/TBD"；所有代码步骤均含完整代码。✅

**3. Type consistency**：`resolveLearnEntry()` 在 Task 1/2 一致；`LearningPlanSummary` 字段（knowledgeCount/questionCount/scheduleDays/dailyMinutes/createdAt）与 `lib/types.ts` 定义一致；`KEY_PREFIXES.PLAN` / `KEY_PREFIXES.PLAN_SUMMARY` 与现有定义一致。✅
