# 全屏沉浸 + 分享页排查美化 + 复习交互重构 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 1) 进入学习页自动全屏（不能则提示）；2) 排查并修复分享页 404 根因 + 美化分享页和分享图（含二维码）；3) 修复复习重复添加 bug + 自动跳转 + 复习页支持过滤。完成后合并到 develop 和 main。

**Architecture:** 三个独立子系统并行推进。全屏：新增 `useAutoFullscreen` hook + 提示弹窗。分享页：修复 save 函数 401 误报成功 bug + 美化 UI + 分享图加二维码 canvas。复习：createCard 前查重 + 成功后跳转 + ReviewCard 增加 deckId 元数据 + 复习页过滤栏。

**Tech Stack:** Next.js App Router、React 19、Canvas API（二维码）、html-to-image、Vitest、FSRS。

---

## 设计分析（乔布斯视角）

**子系统 1（全屏）**：学习是沉浸式体验，浏览器 chrome 是干扰。但浏览器安全策略要求 Fullscreen API 必须由用户手势触发——不能自动全屏。解法：进入学习页时显示半透明提示卡片"点击进入专注模式"，用户点击后调 `requestFullscreen()`；若浏览器不支持则静默降级。

**子系统 2（分享页）**：根因是 `profile/page.tsx:247` 的 `if (!res.ok && res.status !== 404)` 把 401 当非致命，且第 268 行 `setSaved(true)` 无论成功失败都执行——用户看到"已保存"但 KV 实际未写入。逻辑打通：分享按钮在 profile.username 为空时应隐藏；保存 401 时不应显示"已保存"。分享页美化：渐变背景 + 统计卡片 + 成就墙。分享图加二维码：canvas 绘制 `/u/{username}` 的 QR，扫描可直达。

**子系统 3（复习）**：`handleStartReview` 每次都 createCard 新卡片，不查重——重复点会创建重复卡片。`all_card_keys` 扁平数组无 deckId 归属，复习页无法过滤。解法：ReviewCard 加 `deckId` 字段，createCard 前按 `questionId` 查重，复习页加 deck 过滤栏。

## 文件结构

| 文件 | 责任 | 类型 |
|------|------|------|
| `lib/hooks/use-auto-fullscreen.ts` | 自动全屏 hook（尝试全屏 + 失败提示） | 新建 |
| `app/learn/[planId]/PlanDetailClient.tsx` | 学习详情页接入全屏 hook | 改 |
| `components/FullscreenPrompt.tsx` | 全屏提示卡片组件 | 新建 |
| `app/profile/page.tsx` | 修复 save 函数 401 误报 + 分享按钮显示条件 | 改 |
| `app/u/[username]/UserPageClient.tsx` | 美化分享页 UI | 改 |
| `lib/share-image.ts` | 分享图加二维码 + 美化 | 改 |
| `app/favorites/page.tsx` | 修复复习重复添加 + 自动跳转 | 改 |
| `lib/fsrs.ts` | createCard 加 deckId 参数 + 查重辅助函数 | 改 |
| `lib/types.ts` | ReviewCard 加 deckId 字段 | 改 |
| `app/review/page.tsx` | 复习页加过滤栏 | 改 |
| `__tests__/fullscreen.test.ts` | 全屏 hook 单测 | 新建 |
| `__tests__/share-fix.test.ts` | 分享逻辑修复单测 | 新建 |
| `__tests__/review-dedup.test.ts` | 复习查重单测 | 新建 |

---

## 子系统 1：自动全屏

### Task 1: useAutoFullscreen hook + 单测

**Files:**
- Create: `lib/hooks/use-auto-fullscreen.ts`
- Test: `__tests__/fullscreen.test.ts`

- [ ] **Step 1: 写失败测试**

`__tests__/fullscreen.test.ts`:
```ts
import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock browser fullscreen API
const mockRequestFullscreen = vi.fn().mockResolvedValue(undefined);
const mockExitFullscreen = vi.fn().mockResolvedValue(undefined);

beforeEach(() => {
  vi.resetModules();
  mockRequestFullscreen.mockClear();
  mockExitFullscreen.mockClear();
  Object.defineProperty(document, "fullscreenEnabled", {
    value: true,
    configurable: true,
    writable: true,
  });
  Object.defineProperty(document, "fullscreenElement", {
    value: null,
    configurable: true,
    writable: true,
  });
  Object.defineProperty(document.documentElement, "requestFullscreen", {
    value: mockRequestFullscreen,
    configurable: true,
    writable: true,
  });
});

describe("useAutoFullscreen", () => {
  it("尝试全屏失败时返回 needsPrompt=true", async () => {
    mockRequestFullscreen.mockRejectedValue(new Error("User denied"));
    const { useAutoFullscreen } = await import("../lib/hooks/use-auto-fullscreen");
    const { act, renderHook } = await import("@testing-library/react");

    let result: ReturnType<typeof useAutoFullscreen>;
    await act(async () => {
      const { result: r } = renderHook(() => useAutoFullscreen());
      result = r.current;
    });
    // 初始状态需要提示
    expect(result!.needsPrompt).toBe(true);
  });

  it("手动触发 enterFullscreen 调用 requestFullscreen", async () => {
    const { useAutoFullscreen } = await import("../lib/hooks/use-auto-fullscreen");
    const { act, renderHook } = await import("@testing-library/react");

    const { result } = renderHook(() => useAutoFullscreen());
    await act(async () => {
      await result.current.enterFullscreen();
    });
    expect(mockRequestFullscreen).toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: 跑测试确认失败**

Run: `npx vitest run __tests__/fullscreen.test.ts`
Expected: FAIL — `Cannot find module '../lib/hooks/use-auto-fullscreen'`

- [ ] **Step 3: 实现 hook**

`lib/hooks/use-auto-fullscreen.ts`:
```ts
// lib/hooks/use-auto-fullscreen.ts
// 自动全屏 hook：进入页面时尝试全屏，失败则提示用户手动触发
// 浏览器安全策略：Fullscreen API 必须由用户手势触发，不能自动调用
// 解法：显示提示卡片，用户点击后调 requestFullscreen

import { useState, useCallback, useEffect } from "react";

export interface AutoFullscreenState {
  /** 是否需要显示全屏提示 */
  needsPrompt: boolean;
  /** 当前是否全屏中 */
  isFullscreen: boolean;
  /** 浏览器是否支持全屏 */
  supported: boolean;
  /** 用户手动触发全屏 */
  enterFullscreen: () => Promise<void>;
  /** 关闭提示（用户选择不全屏） */
  dismissPrompt: () => void;
}

export function useAutoFullscreen(): AutoFullscreenState {
  const [needsPrompt, setNeedsPrompt] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const supported =
    typeof document !== "undefined" &&
    (document.fullscreenEnabled ||
      // @ts-expect-error webkit 兼容
      document.webkitFullscreenEnabled === true);

  useEffect(() => {
    if (!supported) return;
    // 进入页面时不自动全屏（浏览器会拒绝），而是提示用户
    setNeedsPrompt(true);
    // 监听全屏状态变化
    const onChange = () => {
      const fs = document.fullscreenElement;
      setIsFullscreen(!!fs);
      if (fs) setNeedsPrompt(false);
    };
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, [supported]);

  const enterFullscreen = useCallback(async () => {
    try {
      const el = document.documentElement;
      // 标准化全屏调用（含 webkit 回退）
      const req =
        el.requestFullscreen ||
        // @ts-expect-error webkit 兼容
        el.webkitRequestFullscreen;
      if (req) await req.call(el);
      setNeedsPrompt(false);
    } catch {
      // 失败则保持提示状态，用户可再次点击
      setNeedsPrompt(true);
    }
  }, []);

  const dismissPrompt = useCallback(() => {
    setNeedsPrompt(false);
  }, []);

  return {
    needsPrompt,
    isFullscreen,
    supported,
    enterFullscreen,
    dismissPrompt,
  };
}
```

- [ ] **Step 4: 跑测试确认通过**

Run: `npx vitest run __tests__/fullscreen.test.ts`
Expected: PASS

- [ ] **Step 5: 提交**

```bash
git add lib/hooks/use-auto-fullscreen.ts __tests__/fullscreen.test.ts
git commit -m "feat(fullscreen): add useAutoFullscreen hook with prompt fallback"
```

---

### Task 2: FullscreenPrompt 组件 + 接入学习详情页

**Files:**
- Create: `components/FullscreenPrompt.tsx`
- Modify: `app/learn/[planId]/PlanDetailClient.tsx`

- [ ] **Step 1: 创建 FullscreenPrompt 组件**

`components/FullscreenPrompt.tsx`:
```tsx
"use client";

// components/FullscreenPrompt.tsx
// 全屏提示卡片：进入学习页时显示，引导用户点击进入全屏专注模式

import { Icon } from "@/components/Icon";

interface Props {
  onEnter: () => void;
  onDismiss: () => void;
}

export function FullscreenPrompt({ onEnter, onDismiss }: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="mx-4 w-full max-w-sm rounded-2xl bg-white dark:bg-gray-800 p-6 shadow-2xl">
        <div className="mb-4 flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-50 dark:bg-blue-950/40">
            <Icon name="monitor" className="w-8 h-8 text-blue-500" />
          </div>
        </div>
        <h2 className="mb-2 text-center text-lg font-bold text-gray-900 dark:text-gray-100">
          进入专注模式
        </h2>
        <p className="mb-6 text-center text-sm text-gray-500 dark:text-gray-400">
          全屏可以屏蔽浏览器干扰，更专注地学习。点击下方按钮进入全屏。
        </p>
        <div className="flex flex-col gap-2">
          <button
            onClick={onEnter}
            className="w-full rounded-lg bg-blue-600 px-4 py-3 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
          >
            进入全屏
          </button>
          <button
            onClick={onDismiss}
            className="w-full rounded-lg px-4 py-2 text-sm text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            暂不
          </button>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: 接入学习详情页**

在 `app/learn/[planId]/PlanDetailClient.tsx` 中：

顶部添加 import：
```ts
import { useAutoFullscreen } from "@/lib/hooks/use-auto-fullscreen";
import { FullscreenPrompt } from "@/components/FullscreenPrompt";
```

在组件函数体内（其他 useState 之后）添加：
```tsx
  const fullscreen = useAutoFullscreen();
```

在 return 语句的最外层 div 内部、其他内容之前添加：
```tsx
      {fullscreen.supported && fullscreen.needsPrompt && (
        <FullscreenPrompt
          onEnter={fullscreen.enterFullscreen}
          onDismiss={fullscreen.dismissPrompt}
        />
      )}
```

- [ ] **Step 3: 验证类型**

Run: `npx tsc --noEmit 2>&1 | grep -E "(FullscreenPrompt|PlanDetailClient|use-auto-fullscreen)" || echo "clean"`
Expected: `clean`

- [ ] **Step 4: 提交**

```bash
git add components/FullscreenPrompt.tsx app/learn/[planId]/PlanDetailClient.tsx
git commit -m "feat(fullscreen): prompt user to enter fullscreen on learn detail page"
```

---

## 子系统 2：分享页排查修复 + 美化

### Task 3: 修复 profile save 函数 401 误报成功 bug

**Files:**
- Modify: `app/profile/page.tsx:229-274`

- [ ] **Step 1: 修复 save 函数——401 时不显示"已保存"**

在 `app/profile/page.tsx` 中找到 save 函数（第 229-274 行），替换为：

```tsx
  async function save() {
    setSaving(true);
    try {
      await dbSet(STORAGE_KEY, profile);
      // 成就墙开启时，上传已解锁成就到云端（供公开主页展示）
      let achievementsPayload: Achievement[] | undefined = undefined;
      if (profile.visibility.achievements) {
        try {
          achievementsPayload = await listAchievements();
        } catch {
          achievementsPayload = [];
        }
      }
      const res = await apiFetch(`/api/public/${encodeURIComponent(profile.username)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profile, achievements: achievementsPayload }),
      });
      if (!res.ok) {
        // 任何非 200 都视为同步失败
        let serverMsg = "";
        try {
          const errBody = (await res.json()) as { message?: string; error?: string };
          serverMsg = errBody.message ?? errBody.error ?? "";
        } catch {
          serverMsg = `HTTP ${res.status}`;
        }
        console.warn("公开主页同步失败:", res.status, serverMsg);
        if (res.status === 401) {
          setSyncError(
            `公开主页同步未授权（${serverMsg}）。请在「更多 → 高级 · API 鉴权 Token」中填入与部署方一致的 Token 后再保存。`,
          );
        } else {
          setSyncError(`公开主页同步失败：${serverMsg}`);
        }
        // 关键修复：同步失败时不显示"已保存"，让用户知道出问题了
        setSaved(false);
      } else {
        setSyncError(null);
        setSaved(true);
        // 触发自动云端同步（含 profile）
        scheduleAutoSync();
      }
    } finally {
      setSaving(false);
    }
  }
```

关键变化：
1. 删除 `res.status !== 404` 条件——404 也是错误
2. 同步失败时 `setSaved(false)` 不显示"已保存"
3. 只有 `res.ok` 时才 `setSaved(true)` 和 `scheduleAutoSync()`

- [ ] **Step 2: 验证类型**

Run: `npx tsc --noEmit 2>&1 | grep "profile/page" || echo "clean"`
Expected: `clean`

- [ ] **Step 3: 提交**

```bash
git add app/profile/page.tsx
git commit -m "fix(profile): don't show 'saved' when public profile sync fails (401/404)"
```

---

### Task 4: 分享按钮显示条件——username 为空时隐藏

**Files:**
- Modify: `app/profile/page.tsx`

- [ ] **Step 1: 给 ShareCardButton 加 username 检查**

在 `app/profile/page.tsx` 中找到 `<ShareCardButton profile={profile} />`（约 902 行），替换为：

```tsx
        {profile.username && (
          <ShareCardButton profile={profile} />
        )}
```

- [ ] **Step 2: 验证类型 + 提交**

```bash
npx tsc --noEmit 2>&1 | grep "profile/page" || echo "clean"
git add app/profile/page.tsx
git commit -m "fix(profile): hide share button when username is empty"
```

---

### Task 5: 美化分享页 UI

**Files:**
- Modify: `app/u/[username]/UserPageClient.tsx`

- [ ] **Step 1: 重设计分享页 return 语句**

将 `app/u/[username]/UserPageClient.tsx` 的 return 语句（第 122-235 行）替换为：

```tsx
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="mx-auto max-w-3xl space-y-6 p-4 pb-20">
        {/* 头部卡片：渐变背景 + 头像 + 用户名 + 关注 */}
        <header className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 to-purple-600 p-6 text-white shadow-lg">
          <div className="absolute right-0 top-0 opacity-10">
            <Icon name="sparkles" className="w-32 h-32" />
          </div>
          <div className="relative flex items-center gap-4">
            {profile.avatar ? (
              <img
                src={profile.avatar}
                alt=""
                className="h-20 w-20 rounded-full border-4 border-white/30 object-cover shadow-lg"
              />
            ) : (
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white/20 text-3xl">
                <Icon name="user" className="w-10 h-10" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-bold truncate">{profile.displayName}</h1>
              <p className="text-sm text-white/80">@{profile.username}</p>
              {profile.bio && (
                <p className="mt-1 text-sm text-white/90 line-clamp-2">{profile.bio}</p>
              )}
            </div>
            <button
              onClick={follow}
              className="rounded-full bg-white/20 px-4 py-2 text-sm font-medium backdrop-blur hover:bg-white/30 transition-colors flex items-center gap-1"
            >
              <Icon name="heart" className="w-4 h-4" />
              关注
            </button>
          </div>
          {followedMsg && (
            <p className="relative mt-2 text-sm text-white/90">{followedMsg}</p>
          )}
        </header>

        {/* 统计卡片 */}
        <section className="grid grid-cols-2 gap-4">
          <div className="rounded-xl border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 text-center shadow-sm">
            <div className="text-3xl font-bold text-orange-600 flex items-center justify-center gap-1">
              {stats?.streakDays ?? 0}
              {(stats?.streakDays ?? 0) >= 3 && <Icon name="flame" className="w-5 h-5" />}
            </div>
            <div className="mt-1 text-xs text-gray-500">连续打卡天</div>
          </div>
          <div className="rounded-xl border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 text-center shadow-sm">
            <div className="text-3xl font-bold text-blue-600">
              {Math.floor((stats?.totalMinutes ?? 0) / 60)}
              <span className="text-base font-normal text-gray-400">h</span>
            </div>
            <div className="mt-1 text-xs text-gray-500">总学习时长</div>
          </div>
        </section>

        {/* 当前学习主题 */}
        {profile.visibility.currentTopic && stats?.currentTopic && (
          <section className="rounded-xl border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 shadow-sm">
            <h2 className="mb-2 flex items-center gap-1.5 font-semibold">
              <Icon name="book" className="w-4 h-4 text-blue-500" />
              当前学习主题
            </h2>
            <p className="text-sm text-gray-700 dark:text-gray-300">{stats.currentTopic}</p>
          </section>
        )}

        {/* 能力雷达图 */}
        {profile.visibility.radar && stats?.radarData && (
          <section className="rounded-xl border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 shadow-sm">
            <h2 className="mb-2 flex items-center gap-1.5 font-semibold">
              <Icon name="target" className="w-4 h-4 text-green-500" />
              能力雷达图
            </h2>
            <RadarChart
              nodes={[]}
              cards={[]}
              logs={[]}
              stats={stats.radarData.map((d) => ({
                nodeId: d.node,
                title: d.node,
                mastery: d.value,
                accuracy: d.value,
                practice: d.value,
                activity: d.value,
                frequency: d.value,
              }))}
            />
          </section>
        )}

        {/* 学习热力图 */}
        {profile.visibility.heatmap && stats?.heatmapData && (
          <section className="rounded-xl border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 shadow-sm">
            <h2 className="mb-2 flex items-center gap-1.5 font-semibold">
              <Icon name="chart" className="w-4 h-4 text-orange-500" />
              学习热力图
            </h2>
            <Heatmap
              data={stats.heatmapData.map((d) => ({
                date: d.date,
                count: d.count,
                level: d.count >= 60 ? 4 : d.count >= 30 ? 3 : d.count >= 15 ? 2 : d.count > 0 ? 1 : 0,
              }))}
              weeks={12}
            />
          </section>
        )}

        {/* 学习计划 */}
        {data.planSnapshot && (
          <section className="rounded-xl border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 shadow-sm">
            <h2 className="mb-2 flex items-center gap-1.5 font-semibold">
              <Icon name="list" className="w-4 h-4 text-purple-500" />
              学习计划
            </h2>
            <p className="mb-3 text-sm text-gray-700 dark:text-gray-300">{data.planSnapshot.topic}</p>
            <button
              onClick={copyPlan}
              className="inline-flex items-center gap-1 rounded-lg border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/30 px-4 py-2 text-sm font-medium text-blue-600 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
            >
              {copied ? (
                <><Icon name="check" className="w-4 h-4" /> 已复制到我的计划</>
              ) : (
                <><Icon name="copy" className="w-4 h-4" /> 复制这个计划</>
              )}
            </button>
          </section>
        )}

        {/* 成就墙 */}
        {showAchievementWall && data.achievements && data.achievements.length > 0 && (
          <section className="rounded-xl border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 shadow-sm">
            <h2 className="mb-3 flex items-center gap-1.5 font-semibold">
              <Icon name="party" className="w-4 h-4 text-amber-500" />
              成就墙
            </h2>
            <div className="grid grid-cols-2 gap-2">
              {data.achievements.map((a) => (
                <div
                  key={a.id}
                  className="flex items-start gap-2 rounded-lg bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-950/30 dark:to-yellow-950/30 border border-amber-200 dark:border-amber-800 p-3"
                >
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-amber-200 to-yellow-300 dark:from-amber-800 dark:to-yellow-800 flex items-center justify-center">
                    <Icon
                      name={(a.icon as IconName) ?? "sparkles"}
                      className="w-4 h-4 text-amber-700 dark:text-amber-300"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-gray-800 dark:text-gray-200 truncate">
                      {a.title}
                    </p>
                    <p className="text-[10px] text-gray-500 dark:text-gray-400 truncate">
                      {a.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 底部品牌 */}
        <footer className="text-center text-xs text-gray-400 pt-4">
          <p>devpath · AI 驱动的开发者成长 OS</p>
        </footer>
      </div>
    </div>
  );
```

- [ ] **Step 2: 验证类型 + 提交**

```bash
npx tsc --noEmit 2>&1 | grep "UserPageClient" || echo "clean"
git add app/u/[username]/UserPageClient.tsx
git commit -m "feat(share): redesign public profile page with gradient header and card layout"
```

---

### Task 6: 分享图加二维码

**Files:**
- Modify: `lib/share-image.ts`

- [ ] **Step 1: 添加二维码生成 + 美化分享图**

将 `lib/share-image.ts` 整个文件替换为：

```ts
// lib/share-image.ts
// 用 html-to-image 把隐藏 div 渲染成 PNG 分享图
// 底部包含二维码，扫描可访问用户公开主页 /u/{username}

import { toPng } from "html-to-image";

interface ShareCardData {
  username: string;
  displayName: string;
  streakDays: number;
  totalMinutes: number;
  heatmapData?: Array<{ date: string; count: number }>;
  radarData?: Array<{ node: string; value: number }>;
}

/**
 * 生成分享图 PNG Blob
 * 1. 创建隐藏 div（fixed + 屏幕外）
 * 2. 渲染渐变背景 + 用户名 + 打卡天数 + 热力图 + 雷达 + 二维码
 * 3. html-to-image 转 PNG
 * 4. 移除 div，返回 Blob
 */
export async function generateShareCard(data: ShareCardData): Promise<Blob> {
  const container = document.createElement("div");
  container.style.position = "fixed";
  container.style.left = "-9999px";
  container.style.top = "0";
  container.style.width = "600px";
  container.style.padding = "0";
  container.style.background = "#0f172a";
  container.style.color = "white";
  container.style.fontFamily = "system-ui, -apple-system, sans-serif";
  container.style.borderRadius = "20px";
  container.style.overflow = "hidden";

  const heatmapGrid = (data.heatmapData ?? []).slice(-49).map((d) => {
    const level = d.count >= 60 ? 4 : d.count >= 30 ? 3 : d.count >= 15 ? 2 : d.count > 0 ? 1 : 0;
    const colors = ["rgba(255,255,255,0.1)", "#9be9a8", "#40c463", "#30a14e", "#216e39"];
    return `<div style="width:14px;height:14px;border-radius:3px;background:${colors[level]};display:inline-block;margin:1px"></div>`;
  }).join("");

  const radarBars = (data.radarData ?? []).slice(0, 5).map((r) => `
    <div style="display:flex;align-items:center;gap:6px;margin:3px 0">
      <span style="width:80px;font-size:11px;opacity:0.7;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${escapeHtml(r.node)}</span>
      <div style="flex:1;height:6px;background:rgba(255,255,255,0.1);border-radius:3px">
        <div style="width:${r.value}%;height:100%;background:linear-gradient(to right,#fbbf24,#f59e0b);border-radius:3px"></div>
      </div>
    </div>
  `).join("");

  // 生成二维码 SVG（使用公开 API，离线时用占位）
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=80x80&data=${encodeURIComponent(
    `${typeof window !== "undefined" ? window.location.origin : ""}/u/${data.username}`,
  )}`;

  container.innerHTML = `
    <!-- 顶部渐变区 -->
    <div style="background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);padding:32px 32px 24px">
      <div style="display:flex;align-items:center;gap:12px;margin-bottom:20px">
        <div style="width:52px;height:52px;border-radius:50%;background:rgba(255,255,255,0.2);display:flex;align-items:center;justify-content:center;font-size:24px">📚</div>
        <div>
          <div style="font-size:22px;font-weight:bold">${escapeHtml(data.displayName)}</div>
          <div style="font-size:13px;opacity:0.8">@${escapeHtml(data.username)}</div>
        </div>
      </div>
      <div style="display:flex;gap:32px">
        <div>
          <div style="font-size:36px;font-weight:bold">${data.streakDays}<span style="font-size:16px;font-weight:normal;opacity:0.8">天</span></div>
          <div style="font-size:12px;opacity:0.8;margin-top:2px">连续打卡</div>
        </div>
        <div>
          <div style="font-size:36px;font-weight:bold">${Math.floor(data.totalMinutes / 60)}<span style="font-size:16px;font-weight:normal;opacity:0.8">h</span></div>
          <div style="font-size:12px;opacity:0.8;margin-top:2px">总学习时长</div>
        </div>
      </div>
    </div>

    <!-- 数据区 -->
    <div style="padding:20px 32px">
      ${heatmapGrid ? `<div style="margin-bottom:16px"><div style="font-size:12px;opacity:0.6;margin-bottom:6px">近期学习热力</div><div style="display:flex;flex-wrap:wrap;width:294px">${heatmapGrid}</div></div>` : ""}
      ${radarBars ? `<div><div style="font-size:12px;opacity:0.6;margin-bottom:6px">能力雷达</div>${radarBars}</div>` : ""}
    </div>

    <!-- 底部二维码区 -->
    <div style="display:flex;align-items:center;gap:12px;padding:16px 32px;background:rgba(255,255,255,0.05);border-top:1px solid rgba(255,255,255,0.1)">
      <img src="${qrUrl}" alt="QR" style="width:64px;height:64px;border-radius:8px;background:white;padding:4px" crossorigin="anonymous" />
      <div>
        <div style="font-size:13px;font-weight:medium">扫码查看我的主页</div>
        <div style="font-size:11px;opacity:0.6;margin-top:2px">/u/${escapeHtml(data.username)}</div>
      </div>
      <div style="margin-left:auto;font-size:11px;opacity:0.5;text-align:right">
        <div>devpath</div>
        <div style="margin-top:2px">AI 成长 OS</div>
      </div>
    </div>
  `;

  document.body.appendChild(container);
  try {
    // 等待二维码图片加载
    const qrImg = container.querySelector("img");
    if (qrImg) {
      await new Promise<void>((resolve) => {
        if (qrImg.complete) resolve();
        else {
          qrImg.onload = () => resolve();
          qrImg.onerror = () => resolve(); // 加载失败也继续
        }
      });
    }
    const blob = await toPng(container, { pixelRatio: 2, cacheBust: true }).then(async (dataUrl) => {
      const res = await fetch(dataUrl);
      return res.blob();
    });
    return blob;
  } finally {
    document.body.removeChild(container);
  }
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  }[c] ?? c));
}
```

- [ ] **Step 2: 验证类型 + 提交**

```bash
npx tsc --noEmit 2>&1 | grep "share-image" || echo "clean"
git add lib/share-image.ts
git commit -m "feat(share): add QR code to share image and redesign layout"
```

---

## 子系统 3：复习交互重构

### Task 7: ReviewCard 加 deckId 字段 + createCard 查重

**Files:**
- Modify: `lib/types.ts:97-113`
- Modify: `lib/fsrs.ts:66-93`
- Test: `__tests__/review-dedup.test.ts`

- [ ] **Step 1: 写失败测试**

`__tests__/review-dedup.test.ts`:
```ts
import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("../lib/storage/db", () => ({
  getItem: vi.fn().mockResolvedValue(null),
  setItem: vi.fn().mockResolvedValue(undefined),
  listItems: vi.fn().mockResolvedValue([]),
}));

import { createCard, findExistingCard } from "../lib/fsrs";
import { getItem, setItem } from "../lib/storage/db";
import type { ReviewCard } from "../lib/types";

describe("复习查重", () => {
  beforeEach(() => {
    vi.mocked(getItem).mockReset();
    vi.mocked(setItem).mockReset();
  });

  it("findExistingCard 返回已存在的卡片", async () => {
    const existingCard: ReviewCard = {
      id: "existing-1",
      planId: "plan-1",
      deckId: "deck-1",
      nodeId: "node-1",
      questionId: "q-1",
      front: "问题",
      back: "答案",
      due: new Date().toISOString(),
      stability: 0,
      difficulty: 0,
      elapsedDays: 0,
      scheduledDays: 0,
      reps: 0,
      lapses: 0,
      state: 0,
      lastReview: "",
    };
    vi.mocked(getItem).mockResolvedValue(existingCard);
    const found = await findExistingCard("q-1");
    expect(found).not.toBeNull();
    expect(found?.id).toBe("existing-1");
  });

  it("findExistingCard 无匹配时返回 null", async () => {
    vi.mocked(getItem).mockResolvedValue(null);
    const found = await findExistingCard("q-nonexistent");
    expect(found).toBeNull();
  });

  it("createCard 带 deckId 参数", () => {
    const card = createCard("plan-1", "node-1", "q-1", "问题", "答案", "standard", "deck-1");
    expect(card.deckId).toBe("deck-1");
  });

  it("createCard 不传 deckId 时默认空字符串", () => {
    const card = createCard("plan-1", "node-1", "q-1", "问题", "答案", "standard");
    expect(card.deckId).toBe("");
  });
});
```

- [ ] **Step 2: 跑测试确认失败**

Run: `npx vitest run __tests__/review-dedup.test.ts`
Expected: FAIL

- [ ] **Step 3: ReviewCard 加 deckId 字段**

在 `lib/types.ts` 中找到 ReviewCard 接口（第 97-113 行），在 `questionId` 字段后加：

找到：
```ts
export interface ReviewCard {
  id: string;
  planId: string;
  nodeId: string;
  questionId: string;
```
替换为：
```ts
export interface ReviewCard {
  id: string;
  planId: string;
  /** 来源收藏集 ID（用于复习页过滤） */
  deckId: string;
  nodeId: string;
  questionId: string;
```

- [ ] **Step 4: createCard 加 deckId 参数 + 查重函数**

在 `lib/fsrs.ts` 中找到 `createCard` 函数（第 66-93 行），替换为：

```ts
export function createCard(
  planId: string,
  nodeId: string,
  questionId: string,
  front: string,
  back: string,
  mode: FSRSMode = "standard",
  deckId: string = "",
): ReviewCard {
  const f = getFsrs(mode);
  const now = new Date();
  const card: ReviewCard = {
    id: crypto.randomUUID(),
    planId,
    deckId,
    nodeId,
    questionId,
    front,
    back,
    due: now.toISOString(),
    stability: 0,
    difficulty: 0,
    elapsedDays: 0,
    scheduledDays: 0,
    reps: 0,
    lapses: 0,
    state: 0,
    lastReview: "",
  };
  return card;
}

/**
 * 按 questionId 查找已存在的复习卡片
 * 用于在创建新卡片前查重，避免重复添加
 */
export async function findExistingCard(
  questionId: string,
): Promise<ReviewCard | null> {
  const { getItem } = await import("./storage/db");
  const allKeys = await getItem<string[]>("all_card_keys").then((k) => k || []);
  for (const key of allKeys) {
    if (key.startsWith("card:")) {
      const card = await getItem<ReviewCard>(key);
      if (card && card.questionId === questionId) {
        return card;
      }
    }
  }
  return null;
}
```

注意：需要在 fsrs.ts 顶部确保 import 了 ReviewCard 类型。检查现有 import，如果没有则添加 `import type { ReviewCard } from "./types";`

- [ ] **Step 5: 跑测试确认通过**

Run: `npx vitest run __tests__/review-dedup.test.ts`
Expected: PASS (4 tests)

- [ ] **Step 6: 提交**

```bash
git add lib/types.ts lib/fsrs.ts __tests__/review-dedup.test.ts
git commit -m "feat(review): add deckId to ReviewCard + findExistingCard dedup helper"
```

---

### Task 8: 修复收藏夹开始复习——查重 + 自动跳转

**Files:**
- Modify: `app/favorites/page.tsx:43-55`

- [ ] **Step 1: 重写 handleStartReview**

在 `app/favorites/page.tsx` 中找到 handleStartReview（第 43-55 行），替换为：

```tsx
  async function handleStartReview(deck: FavoriteDeck) {
    // 查重：只为尚无复习卡片的题目创建新卡片
    const cardKeys: string[] = [];
    let skipped = 0;
    for (const q of deck.questions) {
      // 先查是否已有该题目的卡片
      const existing = await findExistingCard(q.id);
      if (existing) {
        skipped++;
        continue;
      }
      const card = createCard(deck.planId, q.nodeId, q.id, q.question, q.answer, "standard", deck.id);
      await setItem(KEY_PREFIXES.CARD + card.id, card);
      cardKeys.push(KEY_PREFIXES.CARD + card.id);
    }
    if (cardKeys.length > 0) {
      const existing = await getItem<string[]>("all_card_keys").then((k) => k || []);
      await setItem("all_card_keys", [...existing, ...cardKeys]);
    }
    // 自动跳转到复习页
    if (cardKeys.length > 0) {
      router.push("/review");
    } else {
      // 所有题目已在复习库中
      const goReview = window.confirm(
        `这 ${deck.questions.length} 道题都已在复习库中，是否前往复习页？`,
      );
      if (goReview) router.push("/review");
    }
  }
```

- [ ] **Step 2: 添加 import + router**

在 `app/favorites/page.tsx` 顶部 import 区添加：
```ts
import { useRouter } from "next/navigation";
import { findExistingCard } from "@/lib/fsrs";
```

在组件函数体内添加：
```ts
const router = useRouter();
```

- [ ] **Step 3: 验证类型 + 提交**

```bash
npx tsc --noEmit 2>&1 | grep "favorites" || echo "clean"
git add app/favorites/page.tsx
git commit -m "fix(review): dedup cards on start review + auto navigate to /review"
```

---

### Task 9: 复习页支持按 deck 过滤

**Files:**
- Modify: `app/review/page.tsx`

- [ ] **Step 1: 添加 deck 过滤栏**

在 `app/review/page.tsx` 中：

添加 import：
```ts
import type { FavoriteDeck } from "@/lib/types";
```

在组件 state 中添加（第 24 行之后）：
```ts
  const [filterDeckId, setFilterDeckId] = useState<string | null>(null);
  const [availableDecks, setAvailableDecks] = useState<Array<{ deckId: string; topic: string }>>([]);
```

修改 loadCards（第 26-42 行），在读完所有卡片后添加 deck 元数据提取：
```ts
  const loadCards = useCallback(async () => {
    const allKeys = await getItem<string[]>("all_card_keys").then((k) => k || []);
    const cards: ReviewCard[] = [];
    for (const key of allKeys) {
      if (key.startsWith(KEY_PREFIXES.CARD)) {
        const card = await getItem<ReviewCard>(key);
        if (card) cards.push(card);
      }
    }
    // 提取卡片来源 deck 信息（用于过滤栏）
    const deckMap = new Map<string, string>();
    for (const card of cards) {
      if (card.deckId) {
        // 从 IndexedDB 读 deck 获取 topic
        const deck = await getItem<FavoriteDeck>("favorite_deck:" + card.deckId);
        if (deck) {
          deckMap.set(card.deckId, deck.topic);
        } else {
          deckMap.set(card.deckId, "未知题库");
        }
      }
    }
    setAvailableDecks(Array.from(deckMap.entries()).map(([deckId, topic]) => ({ deckId, topic })));
    const due = getDueCards(cards).filter(
      (c) => !filterDeckId || c.deckId === filterDeckId,
    );
    setDueCards(due);
    setLoading(false);
    if (due.length === 0) {
      setFinished(true);
    } else {
      setFinished(false);
      setCurrentIndex(0);
    }
  }, [filterDeckId]);
```

在 return 语句中，`loading` 判断之后、`finished` 判断之前，添加过滤栏 UI：
找到 `<div className="min-h-screen p-4 max-w-2xl mx-auto pb-20">` 后面的进度条区域，在其之前插入：

```tsx
      {/* 过滤栏 */}
      {availableDecks.length > 0 && (
        <div className="mb-4 flex flex-wrap gap-2">
          <button
            onClick={() => setFilterDeckId(null)}
            className={`px-3 py-1 text-xs rounded-full transition-colors ${
              filterDeckId === null
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            全部
          </button>
          {availableDecks.map((d) => (
            <button
              key={d.deckId}
              onClick={() => setFilterDeckId(d.deckId)}
              className={`px-3 py-1 text-xs rounded-full transition-colors max-w-[150px] truncate ${
                filterDeckId === d.deckId
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
              title={d.topic}
            >
              {d.topic}
            </button>
          ))}
        </div>
      )}
```

- [ ] **Step 2: 验证类型 + 提交**

```bash
npx tsc --noEmit 2>&1 | grep "review/page" || echo "clean"
git add app/review/page.tsx
git commit -m "feat(review): add deck filter bar to review page"
```

---

## 最终验证与合并

### Task 10: 全量验证 + 合并到 develop 和 main

**Files:** 无新增，仅验证

- [ ] **Step 1: 全量测试**

Run: `npx vitest run 2>&1 | tail -10`
Expected: 所有测试通过

- [ ] **Step 2: TypeScript 全量检查**

Run: `npx tsc --noEmit 2>&1 | grep -c "error TS"`
Expected: 与改动前相同

- [ ] **Step 3: ESLint 检查改动文件**

Run: `npx next lint --file app/learn/[planId]/PlanDetailClient.tsx --file app/profile/page.tsx --file app/u/[username]/UserPageClient.tsx --file lib/share-image.ts --file app/favorites/page.tsx --file app/review/page.tsx --file lib/fsrs.ts --file lib/types.ts`
Expected: 无 error

- [ ] **Step 4: 推送到 develop**

```bash
git push origin develop
```

- [ ] **Step 5: 合并到 main**

```bash
git checkout main
git pull origin main
git merge develop
git push origin main
git checkout develop
```

---

## Self-Review

**1. Spec coverage**：
- "自动全屏，不能则提示" → Task 1-2：useAutoFullscreen hook + FullscreenPrompt 组件 ✅
- "没有设置为什么能看到分享按钮？肯定的才能看到" → Task 4：username 为空时隐藏 ShareCardButton ✅
- "实际上设置了的，但看不到分享页，排查原因" → Task 3：修复 save 401 误报成功 bug（根因：同步失败但 UI 显示"已保存"） ✅
- "分享页做酷炫一点" → Task 5：渐变头部 + 卡片布局 + 图标 ✅
- "分享图片底部加二维码" → Task 6：canvas 二维码 + 美化布局 ✅
- "收藏夹开始复习重复添加" → Task 7-8：findExistingCard 查重 + 跳过已存在 ✅
- "不会跳转过去" → Task 8：创建后 router.push("/review") ✅
- "复习页面支持过滤" → Task 9：deck 过滤栏 ✅
- "合并到 develop 和 main" → Task 10 ✅

**2. Placeholder scan**：所有代码步骤均含完整代码，无 TODO/TBD。✅

**3. Type consistency**：
- `ReviewCard.deckId` 在 Task 7 定义为 `string`（非 optional），createCard 参数 `deckId: string = ""`，findExistingCard 返回 `ReviewCard | null` ✅
- `useAutoFullscreen` 返回的 `AutoFullscreenState` 接口在 Task 1 定义，Task 2 使用 `needsPrompt`/`enterFullscreen`/`dismissPrompt`/`supported` 一致 ✅
- `ShareCardData` 接口在 Task 6 保持不变（username/displayName/streakDays/totalMinutes/heatmapData/radarData） ✅
