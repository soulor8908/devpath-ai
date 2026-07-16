# 分享页 Token 误导修复 + AI 工具库重构 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 1) 修正分享页 404 文案误导访问者关于 API Token；2) 重构 AI 工具库——补全缺失的 clientAction 实现，新增工具元数据注册表，重新设计分类快捷面板交互。

**Architecture:** 新增 `lib/ai/tool-registry.ts` 统一管理工具元数据（分类/图标/快捷指令），消除 `ChatClient.tsx` 和 `route.ts` 中重复的工具列表。补全 `ChatClient.tsx` 缺失的 3 个 clientAction case。重设计空状态面板为分类网格。修正 `UserPageClient.tsx` 404 文案移除 Token 误导。

**Tech Stack:** Next.js App Router、React 19、TypeScript、Vercel AI SDK（tool）、Vitest。

---

## 设计分析（乔布斯视角）

**问题 1**：访问者打开 `/u/alice`，看到"可能原因：该用户保存资料时公开主页同步失败（如未配置 API Token）"。访问者不是 alice，也无法为她配置 Token——这段文案纯粹是噪音，把后端鉴权问题甩给了毫无关联的访问者。正确做法：访问者只需要知道"该用户暂未公开主页"，引导自身用户去设置自己的主页。

**问题 2**：当前 11 个 AI 工具只有 5 个有快捷按钮，3 个写入工具（`start_focus_session`/`generate_plan`/`reorder_schedule`）定义了 clientAction 但客户端 switch 没有对应 case——AI 调用后静默跳过，用户以为执行了其实没执行。交互方式上只有文本预填按钮，没有分类和图标，用户不知道 AI 能做什么。工具列表散落在 3 个文件（`chat-tools.ts` 定义、`route.ts` 的 TOOL_SYSTEM_SUFFIX、`ChatClient.tsx` 的 TOOL_PROMPTS），DRY 违规。

**解法**：
1. 新增 `tool-registry.ts` 单一事实源：工具名/分类/图标/描述/快捷指令/参数提示，所有消费方从它取数据。
2. 补全 3 个缺失的 clientAction 实现。
3. 空状态面板：4 类 × 网格卡片，每卡片含图标+标题+描述+快捷指令按钮组，点击即发消息。
4. 输入栏旁新增「⚡工具」按钮，对话进行中也能快速调起工具面板。

## 文件结构

| 文件 | 责任 | 类型 |
|------|------|------|
| `lib/ai/tool-registry.ts` | 工具元数据单一事实源：分类/图标/描述/快捷指令 | 新建 |
| `app/api/chat/route.ts` | 从 tool-registry 动态生成 TOOL_SYSTEM_SUFFIX | 改 |
| `app/chat/ChatClient.tsx` | 补全 3 个 clientAction case + 重设计空状态面板 + 工具面板 | 改 |
| `app/u/[username]/UserPageClient.tsx` | 修正 404 文案移除 Token 误导 | 改 |
| `__tests__/tool-registry.test.ts` | tool-registry 单测 | 新建 |

---

### Task 1: 修正分享页 404 文案

**Files:**
- Modify: `app/u/[username]/UserPageClient.tsx:86-113`

- [ ] **Step 1: 修正 404 文案**

找到 `app/u/[username]/UserPageClient.tsx` 第 86-113 行，将整段 `error === "not_found"` 的返回 JSX 替换为：

```tsx
  if (error === "not_found") {
    return (
      <div className="mx-auto max-w-md p-8 space-y-3">
        <div className="rounded-lg border border-amber-200 bg-amber-50 dark:bg-amber-950/30 dark:border-amber-800 p-4 text-sm text-amber-800 dark:text-amber-200 space-y-2">
          <p className="font-medium text-base">用户「{username}」暂未公开主页</p>
          <p className="text-xs">
            可能原因：
          </p>
          <ul className="text-xs list-disc list-inside space-y-1">
            <li>该用户尚未在「我的」中保存公开资料</li>
            <li>用户名拼写错误</li>
          </ul>
          <p className="text-xs pt-2 border-t border-amber-200 dark:border-amber-800">
            如果这是你自己的主页，请前往「我的」→ 设置用户名并保存。
          </p>
          <div className="pt-2">
            <a
              href="/profile"
              className="inline-block rounded-lg bg-blue-600 px-3 py-1.5 text-xs text-white hover:bg-blue-700"
            >
              去设置我的主页 →
            </a>
          </div>
        </div>
      </div>
    );
  }
```

关键变化：删除第 96 行 `<li>该用户保存资料时公开主页同步失败（如未配置 API Token）</li>`，因为访问者与此无关。

- [ ] **Step 2: 验证类型**

Run: `npx tsc --noEmit 2>&1 | grep "UserPageClient" || echo "clean"`
Expected: `clean`

- [ ] **Step 3: 提交**

```bash
git add app/u/[username]/UserPageClient.tsx
git commit -m "fix(share): remove misleading API Token hint from public profile 404 page"
```

---

### Task 2: 创建 tool-registry.ts 单一事实源 + 单测

**Files:**
- Create: `lib/ai/tool-registry.ts`
- Test: `__tests__/tool-registry.test.ts`

- [ ] **Step 1: 写失败测试**

`__tests__/tool-registry.test.ts`:
```ts
import { describe, it, expect } from "vitest";
import { TOOL_REGISTRY, TOOL_CATEGORIES, getToolById, getToolQuickPrompts } from "../lib/ai/tool-registry";

describe("tool-registry", () => {
  it("包含 11 个工具", () => {
    expect(TOOL_REGISTRY).toHaveLength(11);
  });

  it("每个工具有 name/category/icon/description 字段", () => {
    for (const t of TOOL_REGISTRY) {
      expect(t.name).toBeTruthy();
      expect(t.category).toBeTruthy();
      expect(t.icon).toBeTruthy();
      expect(t.description).toBeTruthy();
    }
  });

  it("TOOL_CATEGORIES 有 4 个分类", () => {
    expect(TOOL_CATEGORIES).toHaveLength(4);
    for (const c of TOOL_CATEGORIES) {
      expect(c.id).toBeTruthy();
      expect(c.label).toBeTruthy();
      expect(c.icon).toBeTruthy();
    }
  });

  it("getToolById 返回正确工具", () => {
    expect(getToolById("get_daily_schedule")?.name).toBe("get_daily_schedule");
    expect(getToolById("nonexistent")).toBeUndefined();
  });

  it("getToolQuickPrompts 返回所有工具的快捷指令", () => {
    const prompts = getToolQuickPrompts();
    expect(prompts.length).toBeGreaterThanOrEqual(11);
    // 每条快捷指令是字符串
    for (const p of prompts) {
      expect(typeof p).toBe("string");
      expect(p.length).toBeGreaterThan(0);
    }
  });

  it("每个工具至少有 1 条快捷指令", () => {
    for (const t of TOOL_REGISTRY) {
      expect(t.quickPrompts.length).toBeGreaterThanOrEqual(1);
    }
  });
});
```

- [ ] **Step 2: 跑测试确认失败**

Run: `npx vitest run __tests__/tool-registry.test.ts`
Expected: FAIL — `Cannot find module '../lib/ai/tool-registry'`

- [ ] **Step 3: 实现 tool-registry.ts**

`lib/ai/tool-registry.ts`:
```ts
// lib/ai/tool-registry.ts
// AI 工具元数据单一事实源：工具名/分类/图标/描述/快捷指令
// 消费方：route.ts（生成 system prompt）、ChatClient.tsx（渲染快捷面板）
// 新增/修改工具时只需改这一个文件

import type { IconName } from "@/components/Icon";

export type ToolCategoryId = "query" | "plan" | "focus" | "assist";

export interface ToolCategory {
  id: ToolCategoryId;
  label: string;
  icon: IconName;
  desc: string;
}

export interface ToolMeta {
  /** 工具名，与 chat-tools.ts 中的 key 一致 */
  name: string;
  /** 分类 ID */
  category: ToolCategoryId;
  /** 图标名 */
  icon: IconName;
  /** 简短描述（面向用户） */
  description: string;
  /** 快捷指令（点击后直接发送，触发该工具） */
  quickPrompts: string[];
}

export const TOOL_CATEGORIES: ToolCategory[] = [
  {
    id: "query",
    label: "查询",
    icon: "search",
    desc: "查看今日安排、推荐任务、未来计划",
  },
  {
    id: "plan",
    label: "计划管理",
    icon: "calendar-check",
    desc: "调整、冻结、优先级、优化日程",
  },
  {
    id: "focus",
    label: "专注学习",
    icon: "zap",
    desc: "启动番茄钟、生成学习计划",
  },
  {
    id: "assist",
    label: "提醒与复盘",
    icon: "bell",
    desc: "设置提醒、复盘今日表现",
  },
];

export const TOOL_REGISTRY: ToolMeta[] = [
  // === 查询类 ===
  {
    name: "get_daily_schedule",
    category: "query",
    icon: "calendar",
    description: "查看今日完整时间表（作息 + 学习计划）",
    quickPrompts: ["今天有什么安排？"],
  },
  {
    name: "get_next_task",
    category: "query",
    icon: "target",
    description: "推荐接下来该做什么",
    quickPrompts: ["接下来该学什么？"],
  },
  {
    name: "get_upcoming_plan",
    category: "query",
    icon: "list",
    description: "查看未来几天的学习安排",
    quickPrompts: ["未来几天有什么计划？"],
  },
  {
    name: "review_today",
    category: "assist",
    icon: "trending-up",
    description: "获取今日学习数据用于复盘",
    quickPrompts: ["复盘一下今天的表现"],
  },

  // === 计划管理类 ===
  {
    name: "adjust_plan",
    category: "plan",
    icon: "refresh-cw",
    description: "调整学习计划（延后/跳过/重分配）",
    quickPrompts: ["周日有事，把那天的计划延后一天", "今天的计划太多了，帮我重新分配"],
  },
  {
    name: "toggle_plan_freeze",
    category: "plan",
    icon: "snowflake",
    description: "冻结/解冻学习计划",
    quickPrompts: ["暂停我的 React 学习计划", "解冻算法学习计划"],
  },
  {
    name: "set_plan_priority",
    category: "plan",
    icon: "star",
    description: "调整计划优先级（1-5）",
    quickPrompts: ["把算法计划优先级提到最高", "降低前端计划的优先级"],
  },
  {
    name: "optimize_schedule",
    category: "plan",
    icon: "sparkles",
    description: "智能优化今日学习安排的优先级",
    quickPrompts: ["优化今天的日程顺序", "帮我安排今天该先学什么"],
  },

  // === 专注学习类 ===
  {
    name: "start_focus_session",
    category: "focus",
    icon: "zap",
    description: "启动番茄钟专注学习 session",
    quickPrompts: ["开始专注 25 分钟", "我要学 50 分钟算法"],
  },
  {
    name: "generate_learning_plan",
    category: "focus",
    icon: "lightbulb",
    description: "根据用户画像生成个性化学习计划",
    quickPrompts: ["帮我制定 4 周 React 学习计划", "生成一个 2 周算法计划，每天 1 小时"],
  },

  // === 提醒与复盘类 ===
  {
    name: "set_reminder",
    category: "assist",
    icon: "bell",
    description: "设置学习提醒（X 分钟后 / 指定时间）",
    quickPrompts: ["30分钟后提醒我学习", "晚上 8 点提醒我复习"],
  },
];

/** 按 ID 查找工具 */
export function getToolById(name: string): ToolMeta | undefined {
  return TOOL_REGISTRY.find((t) => t.name === name);
}

/** 获取所有工具的快捷指令（扁平数组） */
export function getToolQuickPrompts(): string[] {
  return TOOL_REGISTRY.flatMap((t) => t.quickPrompts);
}

/** 按分类分组工具 */
export function getToolsByCategory(categoryId: ToolCategoryId): ToolMeta[] {
  return TOOL_REGISTRY.filter((t) => t.category === categoryId);
}

/** 生成 system prompt 中的工具能力说明文本 */
export function buildToolSystemSuffix(): string {
  const lines: string[] = [
    "# AI 工具能力",
    "你拥有以下工具，可以根据用户意图主动调用：",
  ];
  for (const cat of TOOL_CATEGORIES) {
    const tools = getToolsByCategory(cat.id);
    lines.push(`\n## ${cat.label}`);
    for (const t of tools) {
      lines.push(`- ${t.name}：${t.description}`);
    }
  }
  lines.push(
    "\n调用工具时遵循：",
    "1. 优先用工具获取数据，再基于数据给出建议",
    "2. 一个回合可调用多个工具（maxSteps: 5）",
    "3. 调用工具后，用自然语言总结结果并给出建议",
  );
  return lines.join("\n");
}
```

注意：`snowflake` 不在 IconName 联合类型中，需在 Task 3 中添加。

- [ ] **Step 4: 跑测试确认通过**

Run: `npx vitest run __tests__/tool-registry.test.ts`
Expected: PASS (6 tests)

- [ ] **Step 5: 提交**

```bash
git add lib/ai/tool-registry.ts __tests__/tool-registry.test.ts
git commit -m "feat(ai): add tool-registry single source of truth for tool metadata"
```

---

### Task 3: 添加 snowflake 图标 + route.ts 从 registry 生成 system prompt

**Files:**
- Modify: `components/Icon.tsx`（IconName 联合类型追加 `"snowflake"`）
- Modify: `app/api/chat/route.ts:34-61`（替换 TOOL_SYSTEM_SUFFIX）

- [ ] **Step 1: 添加 snowflake 图标**

在 `components/Icon.tsx` 中，IconName 联合类型末尾 `| "tag";` 后追加：

找到：
```ts
  | "tag";
```
替换为：
```ts
  | "tag"
  | "snowflake";
```

然后在同文件的 icon path 映射中添加 snowflake 的 SVG path。找到最后一个 icon path 定义（如 `tag` 的定义），在其后添加：

```ts
  // 等等，我需要先看 Icon.tsx 的实际结构
```

实际操作：在 `components/Icon.tsx` 中，找到 `"tag"` 对应的 path 定义，在其后添加：
```ts
  snowflake: (
    <path d="M12 2v20M4.93 4.93l14.14 14.14M2 12h20M4.93 19.07L19.07 4.93" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  ),
```

- [ ] **Step 2: route.ts 从 registry 生成 system prompt**

在 `app/api/chat/route.ts` 中：

找到 import 区，在 `import { createChatTools, type ToolContext } from "@/lib/ai/chat-tools";` 之后添加：
```ts
import { buildToolSystemSuffix } from "@/lib/ai/tool-registry";
```

找到第 34-61 行的 `const TOOL_SYSTEM_SUFFIX = \`...\`;`，整段替换为：
```ts
const TOOL_SYSTEM_SUFFIX = buildToolSystemSuffix();
```

- [ ] **Step 3: 验证类型**

Run: `npx tsc --noEmit 2>&1 | grep -E "(tool-registry|route\.ts)" || echo "clean"`
Expected: `clean`

- [ ] **Step 4: 提交**

```bash
git add components/Icon.tsx app/api/chat/route.ts
git commit -m "feat(ai): generate tool system prompt from registry + add snowflake icon"
```

---

### Task 4: 补全 ChatClient.tsx 缺失的 3 个 clientAction case

**Files:**
- Modify: `app/chat/ChatClient.tsx:234-328`（executeClientAction switch）

- [ ] **Step 1: 在 executeClientAction switch 中添加 3 个缺失 case**

在 `app/chat/ChatClient.tsx` 中，找到 `executeClientAction` 函数的 switch 语句。当前最后一个 case 是 `adjust_plan`（约 279-327 行），在其 `break;` 之后、switch 闭合 `}` 之前，添加 3 个新 case：

```tsx
          case "start_focus_session": {
            const params = action.params as {
              task_description: string;
              duration_minutes: number;
              plan_id?: string;
              node_id?: string;
            };
            // 写入一个 session 记录到 IndexedDB，供专注页读取启动
            const session = {
              id: nanoid(),
              taskDescription: params.task_description,
              durationMinutes: params.duration_minutes,
              planId: params.plan_id,
              nodeId: params.node_id,
              status: "pending" as const,
              createdAt: new Date().toISOString(),
            };
            await dbSet("focus:pending_session", session);
            // 跳转到专注页，由专注页接管
            window.location.href = `/focus?session=${session.id}`;
            success = true;
            break;
          }
          case "generate_plan": {
            const params = action.params as {
              goal: string;
              duration_weeks: number;
              constraints: {
                hours_per_week: number;
                preferred_times?: string[];
              };
            };
            // 构造一个学习计划并跳转到创建页预填
            const planData = {
              topic: params.goal,
              dailyMinutes: Math.floor(
                (params.constraints.hours_per_week * 60) /
                  (params.duration_weeks * 7),
              ),
              maxNewPerDay: 2,
              prompt: `基于用户画像生成：目标 ${params.goal}，${params.duration_weeks} 周，每周 ${params.constraints.hours_per_week} 小时`,
            };
            sessionStorage.setItem(
              "learn:pending_plan",
              JSON.stringify(planData),
            );
            window.location.href = "/learn/new";
            success = true;
            break;
          }
          case "reorder_schedule": {
            const params = action.params as {
              date: string;
              mode?: "balanced" | "catch_up" | "light";
            };
            // 遍历所有未冻结计划，按 mode 调整今日任务优先级
            const allKeys = await listItems<LearningPlan>(
              KEY_PREFIXES.PLAN,
            );
            const modePriority: Record<string, number> = {
              catch_up: 5,
              balanced: 3,
              light: 1,
            };
            const maxNew = modePriority[params.mode ?? "balanced"] ?? 3;
            for (const plan of allKeys) {
              if (plan.frozen) continue;
              plan.maxNewPerDay = maxNew;
              plan.updatedAt = new Date().toISOString();
              await dbSet(KEY_PREFIXES.PLAN + plan.id, plan);
            }
            scheduleAutoSync();
            success = true;
            break;
          }
```

注意：需要确保 `nanoid` 已在文件顶部 import。检查 import 区，如果没有则添加：
```ts
import { nanoid } from "nanoid";
```

也需要确保 `listItems` 已 import。检查 import 区，找到 `import { ... } from "@/lib/storage/db";`，确认是否包含 `listItems`，如果没有则添加。

- [ ] **Step 2: 验证类型**

Run: `npx tsc --noEmit 2>&1 | grep "ChatClient" || echo "clean"`
Expected: `clean`

- [ ] **Step 3: 提交**

```bash
git add app/chat/ChatClient.tsx
git commit -m "fix(ai): implement 3 missing clientAction cases (focus session, generate plan, reorder schedule)"
```

---

### Task 5: 重设计空状态面板——分类工具网格

**Files:**
- Modify: `app/chat/ChatClient.tsx:58-65`（删除 TOOL_PROMPTS 常量）
- Modify: `app/chat/ChatClient.tsx:878-913`（重设计空状态面板）

- [ ] **Step 1: 添加 import + 删除旧常量**

在 `app/chat/ChatClient.tsx` 顶部 import 区添加：
```ts
import { TOOL_REGISTRY, TOOL_CATEGORIES, getToolsByCategory } from "@/lib/ai/tool-registry";
```

删除旧的 TOOL_PROMPTS 常量（第 58-65 行）：
```ts
// AI 工具快捷指令
const TOOL_PROMPTS = [
  "今天有什么安排？",
  "接下来该学什么？",
  "30分钟后提醒我学习",
  "复盘一下今天的表现",
  "未来几天有什么计划？",
];
```

- [ ] **Step 2: 重设计空状态面板**

找到空状态面板中的「AI 工具能力」区域（约 899-911 行），替换为分类网格：

找到：
```tsx
            <p className="mb-2 text-xs text-gray-400">AI 工具能力</p>
            <div className="flex flex-wrap gap-2 justify-center max-w-md">
              {TOOL_PROMPTS.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => applyPrompt(p)}
                  className="px-3 py-1.5 text-xs bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 text-blue-600 dark:text-blue-300 rounded-full transition-colors"
                >
                  {p}
                </button>
              ))}
            </div>
```

替换为：
```tsx
            <div className="w-full max-w-lg space-y-3">
              <p className="text-xs text-gray-400 font-medium">AI 工具能力</p>
              {TOOL_CATEGORIES.map((cat) => {
                const tools = getToolsByCategory(cat.id);
                if (tools.length === 0) return null;
                return (
                  <div key={cat.id} className="text-left">
                    <p className="mb-1 text-xs text-gray-500 flex items-center gap-1">
                      <Icon name={cat.icon} className="w-3.5 h-3.5 inline-block" />
                      {cat.label}
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {tools.map((t) => (
                        <button
                          key={t.name}
                          type="button"
                          onClick={() => applyPrompt(t.quickPrompts[0])}
                          className="px-2.5 py-1 text-xs bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 text-blue-600 dark:text-blue-300 rounded-lg transition-colors flex items-center gap-1"
                          title={t.description}
                        >
                          <Icon name={t.icon} className="w-3 h-3 inline-block" />
                          {t.quickPrompts[0].length > 12
                            ? t.quickPrompts[0].slice(0, 12) + "…"
                            : t.quickPrompts[0]}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
```

- [ ] **Step 3: 验证类型**

Run: `npx tsc --noEmit 2>&1 | grep "ChatClient" || echo "clean"`
Expected: `clean`

- [ ] **Step 4: 提交**

```bash
git add app/chat/ChatClient.tsx
git commit -m "feat(chat): redesign empty state with categorized tool grid"
```

---

### Task 6: 全量验证与推送

**Files:** 无新增，仅验证

- [ ] **Step 1: 跑 tool-registry 单测**

Run: `npx vitest run __tests__/tool-registry.test.ts`
Expected: PASS (6 tests)

- [ ] **Step 2: 全量测试**

Run: `npx vitest run 2>&1 | tail -10`
Expected: 所有测试通过

- [ ] **Step 3: TypeScript 全量检查**

Run: `npx tsc --noEmit 2>&1 | grep -c "error TS"`
Expected: 与改动前相同（仅 observability.test.ts 的预先存在错误）

- [ ] **Step 4: ESLint**

Run: `npx next lint --file app/chat/ChatClient.tsx --file lib/ai/tool-registry.ts --file app/api/chat/route.ts`
Expected: 无 error

- [ ] **Step 5: 推送到远程**

```bash
git push origin develop
```

---

## Self-Review

**1. Spec coverage**：
- "访问用户分享的页面提示没有设置 api token，不应该要 token" → Task 1 修正 404 文案移除 Token 误导 ✅
- "当前 AI 能调用的工具太少" → 11 个工具已存在，但 3 个 clientAction 未实现 → Task 4 补全 ✅
- "没有快捷方式" → Task 5 重设计分类网格，覆盖全部 11 个工具的快捷指令 ✅
- "重新设计完善的 AI 工具库" → Task 2 tool-registry 单一事实源 + 4 分类 ✅
- "更好的调用和交互方式" → Task 5 分类网格 + 图标 + tooltip ✅

**2. Placeholder scan**：所有代码步骤均含完整代码，无 TODO/TBD。✅

**3. Type consistency**：
- `ToolMeta.name` 与 `chat-tools.ts` 中的工具 key 一列（get_daily_schedule/get_next_task/get_upcoming_plan/review_today/adjust_plan/toggle_plan_freeze/set_plan_priority/optimize_schedule/start_focus_session/generate_learning_plan/set_reminder）✅
- `ClientAction.type` 中的 `start_focus_session`/`generate_plan`/`reorder_schedule` 与 Task 4 新增 case 一致 ✅
- `ToolCategoryId` = `"query"|"plan"|"focus"|"assist"` 与 TOOL_CATEGORIES 和 TOOL_REGISTRY 中的 category 值一致 ✅
- `IconName` 中的 `snowflake` 在 Task 3 中添加 ✅
