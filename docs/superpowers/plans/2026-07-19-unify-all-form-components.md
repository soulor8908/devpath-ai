# 彻底统一所有表单组件 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 把 `/workspace/components/` 与 `/workspace/app/` 下所有原生 `<input>/<select>/<textarea>/<button>` 全部替换为 `@/components/ui` 组件库（含新建 `ui/Slider`、扩展 `ui/Button` 支持 `iconOnly`），并通过回归测试永久防止再遗漏。

**Architecture:** 三层防御：(1) 扩展统一组件库覆盖 Slider / IconButton 两个缺口；(2) 写一个 vitest 回归测试，扫描所有 `.tsx` 文件，凡在 `components/ui/` 之外出现原生 `<input>/<select>/<textarea>/<button>` 即失败 — 这是用户最关心的"不能再漏"的护栏；(3) 按文件逐个替换，每完成一组就跑回归测试 + lint + typecheck + 单测 + commit。

**Tech Stack:** Next.js 15 App Router / React 19 / TypeScript / Tailwind CSS / Vitest / 现有 `@/components/ui` 库（Button/Input/Textarea/Select/Checkbox/Switch/FormField）。

---

## 背景与现状

### 现有统一组件库（`/workspace/components/ui/index.ts` 导出）
- `Button`（variants: primary/secondary/ghost/danger/success/dark；props: variant/size/loading/leftIcon/block）
- `Input`（支持 type=text/password/email/number/date/time/url/search；props: error/leftIcon/rightSlot/showPasswordToggle/inputSize）
- `Textarea`、`Select`、`Checkbox`、`Switch`、`FormField`

### 缺失能力（需新建/扩展）
1. **`ui/Slider`** — 替代 `<input type="range">`，3 处需要（onboarding×2、review×1）
2. **`ui/Button` 扩展 `iconOnly` 模式** — 30 处纯图标按钮需要（关闭 X / 工具栏图标 / FAB 等）
3. **`ui/Button` 扩展 `link` variant** — 文字链接样式按钮（清除筛选 / 历史链接 / 刷新等约 8 处）

### 遗漏规模（已扫描确认）
- **必须替换：88 处**，分布在 33 个 .tsx 文件
  - 含文字的 `<button>`（折叠头/Tab/筛选 chip/能量评分/主操作等）：85 处
  - `<input type="range">`：3 处
- **可选替换：30 处**纯图标按钮，分布在 15 个文件
- **未发现遗漏**：原生 `<select>`、`<textarea>`、`<input type="checkbox">`、`<input type="text/password/number/date/time">` 在 `components/ui/` 之外**均已替换完毕**（前几轮已做）

### 关键设计决策（卡帕西视角）
- **不新建 `ui/IconButton`**：扩展 `Button` 加 `iconOnly?: boolean` prop，API 面更小、迁移成本最低
- **不新建 `ui/RadioGroup`**：能量评分 1-5、Tab 切换等模式高度发散（有的是数字、有的是文字、有的是卡片），用 `Button` + `aria-pressed`/`role="radio"` + `className` 表达更灵活
- **回归测试用 vitest + fs.readdir 扫描源码**：不引入新依赖；测试运行快（< 100ms）

---

## File Structure

### 新建文件
- `components/ui/Slider.tsx` — 滑块组件，替代 `<input type="range">`
- `__tests__/no-native-form-elements.test.ts` — 回归测试，扫描所有 .tsx 禁用原生表单元素
- `__tests__/ui-slider.test.tsx` — Slider 组件单测

### 修改文件
- `components/ui/Button.tsx` — 新增 `iconOnly?: boolean` prop 与 `link` variant
- `components/ui/index.ts` — 导出 `Slider`
- 33 个使用原生表单组件的 .tsx 文件（详见各任务）

### 不修改文件
- `components/ui/Input.tsx`、`Textarea.tsx`、`Select.tsx`、`Checkbox.tsx`、`Switch.tsx`、`FormField.tsx` — 这些是统一组件实现本身，内部用原生元素是正确的

---

## Task 1: 新建 `ui/Slider` 组件（TDD）

**Files:**
- Create: `components/ui/Slider.tsx`
- Create: `__tests__/ui-slider.test.tsx`
- Modify: `components/ui/index.ts`

- [ ] **Step 1: 写失败测试**

创建 `__tests__/ui-slider.test.tsx`：

```tsx
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Slider } from "../components/ui/Slider";

describe("ui/Slider", () => {
  it("渲染 input[type=range] 并透传 min/max/step/value", () => {
    render(<Slider min={15} max={120} step={5} value={30} onChange={() => {}} aria-label="每日学习量" />);
    const input = screen.getByRole("slider");
    expect(input).toHaveAttribute("min", "15");
    expect(input).toHaveAttribute("max", "120");
    expect(input).toHaveAttribute("step", "5");
    expect(input).toHaveAttribute("value", "30");
    expect(input).toHaveAttribute("aria-label", "每日学习量");
  });

  it("onChange 透传数字值", () => {
    const onChange = vi.fn();
    render(<Slider min={0} max={10} step={1} value={5} onChange={onChange} />);
    const input = screen.getByRole("slider");
    fireEvent.change(input, { target: { value: "7" } });
    expect(onChange).toHaveBeenCalledWith(7);
  });

  it("disabled 状态禁用交互", () => {
    render(<Slider min={0} max={10} value={5} onChange={() => {}} disabled />);
    const input = screen.getByRole("slider");
    expect(input).toBeDisabled();
  });

  it("显示当前值标签（showValue=true）", () => {
    render(<Slider min={0} max={10} value={5} onChange={() => {}} showValue />);
    expect(screen.getByText("5")).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: 跑测试确认失败**

Run: `npx vitest run __tests__/ui-slider.test.tsx`
Expected: FAIL — "Cannot find module '../components/ui/Slider'"

- [ ] **Step 3: 实现 Slider 组件**

创建 `components/ui/Slider.tsx`：

```tsx
"use client";

// components/ui/Slider.tsx
// 统一滑块组件 — 替代散落的 <input type="range" className="w-full">
//
// 设计（乔布斯视角）：
//   - 原生 range 在不同浏览器表现差异巨大（Chrome 蓝色 / Firefox 灰色 / Safari 圆头）
//   - 用 accent-color 统一主色（现代浏览器支持，IE 不考虑）
//   - showValue 时在右侧显示当前值，避免用户来回数刻度
//
// 设计（卡帕西视角）：
//   - forwardRef 让 form lib 可拿 ref
//   - onChange 直接回调 number，调用方不用 e.target.value 再转一次
//   - props 兼容原生 input（aria-label / disabled 等透传）

import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export interface SliderProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "onChange" | "value"> {
  /** 当前值（受控） */
  value: number;
  /** 值变化回调（直接给 number，调用方不用转） */
  onChange: (value: number) => void;
  /** 最小值 */
  min: number;
  /** 最大值 */
  max: number;
  /** 步长（默认 1） */
  step?: number;
  /** 是否在右侧显示当前值 */
  showValue?: boolean;
  /** 值的后缀（如 "分钟"，仅在 showValue=true 时生效） */
  valueSuffix?: string;
}

export const Slider = forwardRef<HTMLInputElement, SliderProps>(function Slider(
  {
    className,
    value,
    onChange,
    min,
    max,
    step = 1,
    disabled,
    showValue = false,
    valueSuffix = "",
    ...rest
  },
  ref,
) {
  return (
    <div className={cn("flex items-center gap-3 w-full", className)}>
      <input
        ref={ref}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(Number(e.target.value))}
        className={cn(
          "flex-1 h-2 rounded-full appearance-none cursor-pointer bg-gray-200 dark:bg-gray-700",
          "accent-blue-600 dark:accent-blue-500",
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/30 focus-visible:ring-offset-1",
          disabled && "opacity-50 cursor-not-allowed",
        )}
        {...rest}
      />
      {showValue && (
        <span className="shrink-0 text-sm font-medium text-gray-700 dark:text-gray-300 min-w-[3rem] text-right tabular-nums">
          {value}
          {valueSuffix}
        </span>
      )}
    </div>
  );
});
```

- [ ] **Step 4: 跑测试确认通过**

Run: `npx vitest run __tests__/ui-slider.test.tsx`
Expected: PASS — 4 tests passed

- [ ] **Step 5: 导出 Slider**

修改 `components/ui/index.ts`，在末尾追加：

```ts
export { Slider, type SliderProps } from "./Slider";
```

- [ ] **Step 6: 跑 lint + typecheck 确认无错**

Run: `npm run lint && npm run typecheck`
Expected: 无错

- [ ] **Step 7: Commit**

```bash
git add components/ui/Slider.tsx components/ui/index.ts __tests__/ui-slider.test.tsx
git commit -m "feat(ui): 新增 Slider 统一滑块组件"
```

---

## Task 2: 扩展 `ui/Button` 支持 `iconOnly` 与 `link` variant（TDD）

**Files:**
- Modify: `components/ui/Button.tsx`
- Modify: `__tests__/ui-button.test.tsx`（若不存在则新建）

- [ ] **Step 1: 写失败测试**

创建 `__tests__/ui-button.test.tsx`：

```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Button } from "../components/ui/Button";

describe("ui/Button 扩展", () => {
  it("iconOnly=true 时渲染方形按钮且无 children 文本", () => {
    render(<Button iconOnly aria-label="关闭"><span>×</span></Button>);
    const btn = screen.getByRole("button");
    expect(btn).toHaveAttribute("aria-label", "关闭");
    expect(btn.className).toContain("p-2"); // iconOnly 用固定 padding
  });

  it("variant=link 时渲染为文字链接样式", () => {
    render(<Button variant="link">清除筛选</Button>);
    const btn = screen.getByRole("button");
    expect(btn.className).toContain("text-blue");
    expect(btn.className).toContain("underline");
  });

  it("iconOnly + size=sm 时 padding 更小", () => {
    render(<Button iconOnly size="sm" aria-label="删除"><span>×</span></Button>);
    const btn = screen.getByRole("button");
    expect(btn.className).toContain("p-1");
  });
});
```

- [ ] **Step 2: 跑测试确认失败**

Run: `npx vitest run __tests__/ui-button.test.tsx`
Expected: FAIL — iconOnly prop 不存在 / variant=link 不存在

- [ ] **Step 3: 扩展 Button 组件**

修改 `components/ui/Button.tsx`：

```tsx
"use client";

// components/ui/Button.tsx
// 统一按钮组件 — 替代散落各页面的 <button className="rounded-lg bg-blue-600 ...">
//
// 设计（乔布斯视角）：
//   - 视觉一致性 > 灵活度。8 种 variant + 3 种 size + iconOnly 模式覆盖 99% 场景
//   - 每种 variant 有明确的语义：primary=主操作 / secondary=次操作 / danger=删除 /
//     ghost=弱化 / success=成功 / dark=深色 / link=文字链接 / outline=边框
//   - iconOnly 模式专门承载关闭 X / 工具栏图标 / FAB 等纯图标按钮，padding 自动收窄
//   - loading 态自带 spinner；disabled 视觉改 cursor
//
// 设计（卡帕西视角）：
//   - forwardRef 让 ref 可转发（聚焦/测距等场景）
//   - variant 用对象字典 lookup，O(1) 取样式
//   - props extends 原生 button，不丢类型
//   - button 默认 type="button"（避免 form 内误触提交）

import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Icon } from "@/components/Icon";

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "ghost"
  | "danger"
  | "success"
  | "dark"
  | "link"
  | "outline";
export type ButtonSize = "sm" | "md" | "lg";

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary:
    "bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800 shadow-sm",
  secondary:
    "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 active:bg-gray-100 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-700",
  outline:
    "bg-transparent text-gray-700 border border-gray-300 hover:bg-gray-50 active:bg-gray-100 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-700",
  ghost:
    "bg-transparent text-gray-600 hover:bg-gray-100 active:bg-gray-200 dark:text-gray-300 dark:hover:bg-gray-700",
  danger:
    "bg-red-500 text-white hover:bg-red-600 active:bg-red-700 shadow-sm",
  success:
    "bg-green-600 text-white hover:bg-green-700 active:bg-green-800 shadow-sm",
  dark: "bg-gray-900 text-white hover:bg-black active:bg-gray-800 shadow-sm dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100",
  link: "bg-transparent text-blue-600 hover:underline dark:text-blue-400 shadow-none border-none px-0 py-0",
};

const SIZE_CLASSES: Record<ButtonSize, string> = {
  sm: "px-2.5 py-1 text-xs gap-1",
  md: "px-3.5 py-2 text-sm gap-1.5",
  lg: "px-5 py-2.5 text-base gap-2",
};

const ICON_ONLY_SIZE_CLASSES: Record<ButtonSize, string> = {
  sm: "p-1",
  md: "p-2",
  lg: "p-2.5",
};

const LOADING_SPINNER_SIZE: Record<ButtonSize, string> = {
  sm: "w-3 h-3 border",
  md: "w-3.5 h-3.5 border-2",
  lg: "w-4 h-4 border-2",
};

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** 加载中：显示 spinner + 禁用点击。优先级高于 disabled */
  loading?: boolean;
  /** 左侧图标名（Icon 组件支持的 name） */
  leftIcon?: React.ComponentProps<typeof Icon>["name"];
  /** 是否占满宽度 */
  block?: boolean;
  /** 纯图标按钮模式：收窄 padding 为正方形；建议配合 aria-label 使用 */
  iconOnly?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(
    {
      variant = "primary",
      size = "md",
      loading = false,
      leftIcon,
      block = false,
      iconOnly = false,
      className,
      children,
      disabled,
      type = "button",
      ...rest
    },
    ref,
  ) {
    const isDisabled = disabled || loading;
    return (
      <button
        ref={ref}
        type={type}
        disabled={isDisabled}
        aria-busy={loading || undefined}
        className={cn(
          "inline-flex items-center justify-center font-medium rounded-lg transition-colors",
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40 focus-visible:ring-offset-0",
          "disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none",
          VARIANT_CLASSES[variant],
          iconOnly ? ICON_ONLY_SIZE_CLASSES[size] : SIZE_CLASSES[size],
          block && !iconOnly && "w-full",
          className,
        )}
        {...rest}
      >
        {loading && (
          <span
            aria-hidden
            className={cn(
              "inline-block rounded-full border-current border-t-transparent animate-spin",
              LOADING_SPINNER_SIZE[size],
            )}
          />
        )}
        {!loading && leftIcon && (
          <Icon name={leftIcon} className="w-4 h-4 shrink-0" />
        )}
        {children}
      </button>
    );
  },
);
```

- [ ] **Step 4: 跑测试确认通过**

Run: `npx vitest run __tests__/ui-button.test.tsx`
Expected: PASS — 3 tests passed

- [ ] **Step 5: 跑全量测试确认无回归**

Run: `npm test`
Expected: 606+ tests passed（原 606 + 新 3 + Slider 4 = 613+）

- [ ] **Step 6: Commit**

```bash
git add components/ui/Button.tsx __tests__/ui-button.test.tsx
git commit -m "feat(ui): Button 新增 iconOnly 模式与 link/outline variant"
```

---

## Task 3: 添加回归测试 — 禁止在 `components/ui/` 之外使用原生表单元素

**Files:**
- Create: `__tests__/no-native-form-elements.test.ts`

- [ ] **Step 1: 写测试（这一步就是 red+green 同时存在 — 先写好预期，跑一次看当前遗漏规模）**

创建 `__tests__/no-native-form-elements.test.ts`：

```ts
// __tests__/no-native-form-elements.test.ts
// 回归测试：禁止在 components/ui/ 之外使用原生 <input>/<select>/<textarea>/<button>
//
// 这是"统一表单组件"的护栏：每次有人新写表单组件，必须用 @/components/ui。
// 任何遗漏都会让本测试失败，并在控制台打印出具体的文件名和行号。
//
// 例外（白名单）：components/ui/ 目录下的统一组件实现本身
//
// 检测规则（正则）：
//   - <input\s 或 <input>
//   - <select\s 或 <select>
//   - <textarea\s 或 <textarea>
//   - <button\s 或 <button>
//
// 注：字符串中的 "<button>" 等也会被匹配，但 .tsx 文件中字符串里出现这些标签的情况极少；
//     误报时可在文件顶部加 // eslint-disable-next-line no-native-form-elements 注释绕过
//     （本测试暂不实现白名单注释，必要时再扩展）

import { describe, it, expect } from "vitest";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const ROOT = process.cwd();
const SCAN_DIRS = ["components", "app"];
const EXCLUDE_DIRS = ["components/ui", "components/__tests__", "__tests__"];
const INCLUDE_EXT = [".tsx"];

interface Violation {
  file: string;
  line: number;
  snippet: string;
}

function walk(dir: string, out: string[] = []): string[] {
  let entries: string[];
  try {
    entries = readdirSync(dir);
  } catch {
    return out;
  }
  for (const name of entries) {
    const full = join(dir, name);
    let st;
    try {
      st = statSync(full);
    } catch {
      continue;
    }
    if (st.isDirectory()) {
      walk(full, out);
    } else if (st.isFile() && INCLUDE_EXT.includes(name.slice(name.lastIndexOf(".")))) {
      out.push(full);
    }
  }
  return out;
}

function isExcluded(filePath: string): boolean {
  const rel = relative(ROOT, filePath).replaceAll("\\", "/");
  return EXCLUDE_DIRS.some((d) => rel.startsWith(d + "/") || rel === d);
}

const PATTERN = /<(input|select|textarea|button)(\s[^>]*?)?>(?!<\/\1)/g;

function scanFile(filePath: string): Violation[] {
  const content = readFileSync(filePath, "utf8");
  const lines = content.split("\n");
  const violations: Violation[] = [];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    // 跳过注释行（// 或 *）
    const trimmed = line.trim();
    if (trimmed.startsWith("//") || trimmed.startsWith("*")) continue;
    // 跳过字符串模板内的示例（粗略：行内同时有反引号且无 JSX 上下文）
    let match;
    PATTERN.lastIndex = 0;
    while ((match = PATTERN.exec(line)) !== null) {
      // 排除自闭合 <input ... /> 的合法自闭合 — 但仍算违规，因为我们要求用 ui/Input
      violations.push({
        file: relative(ROOT, filePath),
        line: i + 1,
        snippet: line.trim().slice(0, 120),
      });
    }
  }
  return violations;
}

function collectViolations(): Violation[] {
  const all: Violation[] = [];
  for (const dir of SCAN_DIRS) {
    const files = walk(join(ROOT, dir));
    for (const f of files) {
      if (isExcluded(f)) continue;
      all.push(...scanFile(f));
    }
  }
  return all;
}

describe("no native form elements outside components/ui/", () => {
  it("不允许在 components/ui/ 之外使用原生 <input>/<select>/<textarea>/<button>", () => {
    const violations = collectViolations();
    if (violations.length > 0) {
      const msg = violations
        .map((v) => `  ${v.file}:${v.line}  ${v.snippet}`)
        .join("\n");
      throw new Error(
        `发现 ${violations.length} 处原生表单元素，必须替换为 @/components/ui 组件库：\n${msg}\n\n` +
        `替换指南：\n` +
        `  <input type="text/password/number/date/time/range"> → <Input> 或 <Slider>\n` +
        `  <textarea> → <Textarea>\n` +
        `  <select> → <Select>\n` +
        `  <button>含文字 → <Button variant="...">\n` +
        `  <button>纯图标 → <Button iconOnly aria-label="...">`,
      );
    }
    expect(violations).toHaveLength(0);
  });
});
```

- [ ] **Step 2: 跑测试，确认失败（这就是当前遗漏规模的快照）**

Run: `npx vitest run __tests__/no-native-form-elements.test.ts`
Expected: FAIL — 打印所有 88+30 = 118 处遗漏的文件名和行号。**把这个输出保存下来作为后续任务的检查清单。**

- [ ] **Step 3: 暂时把测试改为 "warning only" 让 CI 不立刻挂（后续任务完成后再恢复 strict）**

修改 `__tests__/no-native-form-elements.test.ts` 的 it 块，临时改为：

```ts
  it.skip("不允许在 components/ui/ 之外使用原生 <input>/<select>/<textarea>/<button>", () => {
    // 临时 skip：替换工作完成后改为 it
    const violations = collectViolations();
    expect(violations).toHaveLength(0);
  });

  it("【过渡】打印当前遗漏清单（替换完成后删除此测试）", () => {
    const violations = collectViolations();
    if (violations.length > 0) {
      console.log(`当前还有 ${violations.length} 处原生表单元素需要替换：\n` +
        violations.map((v) => `  ${v.file}:${v.line}`).join("\n"));
    }
    // 不抛错，只打印 — 让后续任务逐步消除
    expect(true).toBe(true);
  });
```

- [ ] **Step 4: 跑测试确认通过**

Run: `npx vitest run __tests__/no-native-form-elements.test.ts`
Expected: PASS — 打印遗漏清单但不失败

- [ ] **Step 5: Commit**

```bash
git add __tests__/no-native-form-elements.test.ts
git commit -m "test: 添加原生表单元素回归测试（过渡期 skip，最终任务再启用）"
```

---

## Task 4: 替换最简单的单按钮文件（5 个文件，共 5 处）

**Files:**
- Modify: `app/error.tsx`（1 处）
- Modify: `app/dashboard/DashboardClient.tsx`（1 处）
- Modify: `components/Heatmap.tsx`（1 处）
- Modify: `app/HomeClient.tsx`（1 处）
- Modify: `components/WeeklyReport.tsx`（1 处）

- [ ] **Step 1: app/error.tsx 替换**

在文件顶部添加 import：

```tsx
import { Button } from "@/components/ui";
```

将第 21-26 行：
```tsx
      <button
        onClick={reset}
        className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
      >
        重试
      </button>
```
替换为：
```tsx
      <Button onClick={reset}>重试</Button>
```

- [ ] **Step 2: app/dashboard/DashboardClient.tsx 替换**

在文件顶部 import 区添加：
```tsx
import { Button } from "@/components/ui";
import { openChatModal } from "@/lib/chat-modal-store";
```
（如果 openChatModal 已 import 则不重复添加）

将第 189 行起的 `<button type="button" onClick={() => openChatModal()} ...>...</button>` 替换为：
```tsx
        <Button
          variant="secondary"
          onClick={() => openChatModal()}
          leftIcon="message-circle"
        >
          AI 聊天
        </Button>
```
（保留原 children 内容；如原 button 内含特定图标/文字组合，保持视觉等价）

- [ ] **Step 3: components/Heatmap.tsx 替换**

文件顶部添加 import：
```tsx
import { Button } from "@/components/ui";
```

将第 109 行：
```tsx
          <button onClick={() => setSelected(null)} className="mt-1 text-xs text-blue-600">
            关闭
          </button>
```
替换为：
```tsx
          <Button variant="link" size="sm" onClick={() => setSelected(null)} className="mt-1">
            关闭
          </Button>
```

- [ ] **Step 4: app/HomeClient.tsx 替换**

文件已有 `import { Button } from "@/components/ui";`，无需新增 import。

将第 367 行起的 `<button onClick={() => setShowMoreSection(!showMoreSection)} ...>...</button>` 替换为：
```tsx
        <Button variant="ghost" onClick={() => setShowMoreSection(!showMoreSection)}>
          {/* 保留原 children 内容 */}
        </Button>
```
（保留原 children 中的图标和文字）

- [ ] **Step 5: components/WeeklyReport.tsx 替换**

文件已有 `import { Button } from "@/components/ui";`。

将第 105 行：
```tsx
                <button
                  onClick={() => setCurrent(h)}
                  className="text-sm text-blue-600 hover:underline"
                >
                  {h.weekStart} 周报
                </button>
```
替换为：
```tsx
                <Button variant="link" size="sm" onClick={() => setCurrent(h)}>
                  {h.weekStart} 周报
                </Button>
```

- [ ] **Step 6: 跑回归测试确认这 5 个文件的违规已消除**

Run: `npx vitest run __tests__/no-native-form-elements.test.ts`
Expected: 打印的遗漏清单中这 5 个文件不再出现，总数从 118 减少到 113

- [ ] **Step 7: 跑 lint + typecheck + 全量测试**

Run: `npm run lint && npm run typecheck && npm test`
Expected: 全部通过

- [ ] **Step 8: Commit**

```bash
git add app/error.tsx app/dashboard/DashboardClient.tsx components/Heatmap.tsx app/HomeClient.tsx components/WeeklyReport.tsx
git commit -m "refactor(ui): 替换 5 个简单文件的原生 button 为 Button 组件"
```

---

## Task 5: 替换 `app/rest/page.tsx`（折叠头 + 能量评分 radio，2 处 button + 5 处 radio = 7 处）

**Files:**
- Modify: `app/rest/page.tsx`

- [ ] **Step 1: 顶部添加 import**

```tsx
import { Button } from "@/components/ui";
```

- [ ] **Step 2: 替换 MethodCard 折叠头（第 17-32 行）**

将：
```tsx
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between p-3 text-left hover:bg-gray-50 transition-colors"
        aria-expanded={open}
      >
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <span className="text-xl">{method.emoji}</span>
          <div className="min-w-0">
            <p className="text-sm font-medium truncate">{method.name}</p>
            <p className="text-xs text-gray-400">{method.duration}</p>
          </div>
        </div>
        <span className={`text-gray-400 text-xs transition-transform ${open ? "rotate-90" : ""}`}>
          ▶
        </span>
      </button>
```
替换为：
```tsx
      <Button
        variant="ghost"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="w-full flex items-center justify-between p-3 text-left hover:bg-gray-50"
      >
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <span className="text-xl">{method.emoji}</span>
          <div className="min-w-0">
            <p className="text-sm font-medium truncate">{method.name}</p>
            <p className="text-xs text-gray-400">{method.duration}</p>
          </div>
        </div>
        <span className={`text-gray-400 text-xs transition-transform ${open ? "rotate-90" : ""}`}>
          ▶
        </span>
      </Button>
```

- [ ] **Step 3: 替换能量评分 1-5（第 79-91 行）**

将：
```tsx
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              onClick={() => setEnergy(n)}
              className={`flex-1 py-2 rounded-lg font-bold transition-colors ${
                energy === n ? "bg-black text-white" : "bg-gray-100 text-gray-400"
              }`}
              aria-label={`能量 ${n} 分`}
              aria-pressed={energy === n}
            >
              {n}
            </button>
          ))}
```
替换为：
```tsx
          {[1, 2, 3, 4, 5].map((n) => (
            <Button
              key={n}
              variant={energy === n ? "dark" : "secondary"}
              onClick={() => setEnergy(n)}
              aria-label={`能量 ${n} 分`}
              aria-pressed={energy === n}
              className="flex-1 py-2 font-bold"
            >
              {n}
            </Button>
          ))}
```

- [ ] **Step 4: 跑回归测试 + lint + typecheck**

Run: `npx vitest run __tests__/no-native-form-elements.test.ts && npm run lint && npm run typecheck`
Expected: rest/page.tsx 不再出现在遗漏清单；总数从 113 减到 106

- [ ] **Step 5: Commit**

```bash
git add app/rest/page.tsx
git commit -m "refactor(ui): rest 页面替换折叠头与能量评分为 Button"
```

---

## Task 6: 替换 `app/onboarding/page.tsx`（2 处 Slider + 2 处 Button = 4 处）

**Files:**
- Modify: `app/onboarding/page.tsx`

- [ ] **Step 1: 修改 import 行**

第 26 行原本是：
```tsx
import { Button, Input } from "@/components/ui";
```
改为：
```tsx
import { Button, Input, Slider } from "@/components/ui";
```

- [ ] **Step 2: 替换预设卡片入口 button（第 97 行起）**

将：
```tsx
            <button
              key={p.id}
              onClick={() => previewPreset(p)}
              className="text-left bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-xl p-4 hover:shadow-md hover:border-blue-300 transition-all group"
            >
```
替换为：
```tsx
            <Button
              key={p.id}
              variant="outline"
              onClick={() => previewPreset(p)}
              className="text-left bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-xl p-4 hover:shadow-md hover:border-blue-300 justify-start"
            >
```
（保留 children 不变；如果 Button 默认居中导致视觉问题，加 justify-start 类名修正）

- [ ] **Step 3: 替换返回按钮（第 149 行起）**

将：
```tsx
      <button
        onClick={closePreset}
        className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-3"
      >
```
替换为：
```tsx
      <Button
        variant="ghost"
        size="sm"
        onClick={closePreset}
        className="flex items-center gap-1 text-gray-500 hover:text-gray-700 mb-3"
      >
```

- [ ] **Step 4: 替换每日学习量 Slider（第 196-210 行）**

将：
```tsx
          <input
            type="range"
            min={15}
            max={120}
            step={5}
            value={dailyMinutes}
            onChange={(e) => setDailyMinutes(Number(e.target.value))}
            className="w-full"
          />
```
替换为：
```tsx
          <Slider
            min={15}
            max={120}
            step={5}
            value={dailyMinutes}
            onChange={setDailyMinutes}
            className="w-full"
            aria-label="每日学习量（分钟）"
          />
```

- [ ] **Step 5: 替换每日新内容数 Slider（第 215-229 行）**

将：
```tsx
          <input
            type="range"
            min={1}
            max={5}
            step={1}
            value={maxNewPerDay}
            onChange={(e) => setMaxNewPerDay(Number(e.target.value))}
            className="w-full"
          />
```
替换为：
```tsx
          <Slider
            min={1}
            max={5}
            step={1}
            value={maxNewPerDay}
            onChange={setMaxNewPerDay}
            className="w-full"
            aria-label="每日新内容数（个）"
          />
```

- [ ] **Step 6: 跑回归测试 + lint + typecheck**

Run: `npx vitest run __tests__/no-native-form-elements.test.ts && npm run lint && npm run typecheck`
Expected: onboarding/page.tsx 不再出现在遗漏清单；总数从 106 减到 102

- [ ] **Step 7: Commit**

```bash
git add app/onboarding/page.tsx
git commit -m "refactor(ui): onboarding 替换 slider 与 button 为统一组件"
```

---

## Task 7: 替换 `app/review/page.tsx`（1 处 Slider + 2 处 Button = 3 处）

**Files:**
- Modify: `app/review/page.tsx`

- [ ] **Step 1: 修改 import 行**

第 30 行原本是：
```tsx
import { Button, Input, Select } from "@/components/ui";
```
改为：
```tsx
import { Button, Input, Select, Slider } from "@/components/ui";
```

- [ ] **Step 2: 替换跳转卡片 Slider（第 449 行起）**

将：
```tsx
            <input
              type="range"
              min={0}
              max={Math.max(0, dueCards.length - 1)}
              ...
            />
```
替换为：
```tsx
            <Slider
              min={0}
              max={Math.max(0, dueCards.length - 1)}
              value={...}
              onChange={...}
              aria-label="跳转到第几张卡片"
            />
```
（保留原 props 语义；onChange 改为直接接收 number）

- [ ] **Step 3: 替换"清除筛选"链接按钮（第 495 行起）**

将：
```tsx
            <button
              onClick={() => setFilters(DEFAULT_FILTERS)}
              className="mt-3 text-xs text-blue-500 hover:underline"
            >
              清除筛选查看全部
            </button>
```
替换为：
```tsx
            <Button
              variant="link"
              size="sm"
              onClick={() => setFilters(DEFAULT_FILTERS)}
              className="mt-3"
            >
              清除筛选查看全部
            </Button>
```

- [ ] **Step 4: 替换 FilterChip 函数内的 button（第 561 行起）**

将整个 FilterChip 组件内的 `<button onClick={onClick} className="text-xs px-2.5 py-1 rounded-full ...">` 替换为：
```tsx
    <Button
      variant={active ? "primary" : "ghost"}
      size="sm"
      onClick={onClick}
      className="rounded-full"
    >
      {label}
    </Button>
```
（保留原 props 语义；FilterChip 的 active 状态用 variant 切换）

- [ ] **Step 5: 跑回归测试 + lint + typecheck + 测试**

Run: `npx vitest run __tests__/no-native-form-elements.test.ts && npm run lint && npm run typecheck && npm test`
Expected: review/page.tsx 不再出现在遗漏清单；总数从 102 减到 99；所有现有单测通过

- [ ] **Step 6: Commit**

```bash
git add app/review/page.tsx
git commit -m "refactor(ui): review 页面替换 slider 与 filter chip 为统一组件"
```

---

## Task 8: 替换 `app/daily/page.tsx`（3 处能量评分 radio）

**Files:**
- Modify: `app/daily/page.tsx`

- [ ] **Step 1: 替换晨/午/晚能量评分（第 167、179、191 行）**

文件已有 `import { Button, Input, Textarea, Checkbox } from "@/components/ui";`，无需新增 import。

对每处 `[1, 2, 3, 4, 5].map((n) => (<button ...>...</button>))`，统一替换为：

```tsx
            {[1, 2, 3, 4, 5].map((n) => (
              <Button
                key={n}
                variant={log.energy.energyMorning === n ? "dark" : "secondary"}
                size="sm"
                onClick={() => setLog({ ...log, energy: { ...log.energy, energyMorning: n } })}
                aria-label={`能量 ${n} 分`}
                aria-pressed={log.energy.energyMorning === n}
              >
                {n}
              </Button>
            ))}
```
（午/晚对应字段为 energyNoon / energyNight；variant 同理）

- [ ] **Step 2: 跑回归测试 + lint + typecheck**

Run: `npx vitest run __tests__/no-native-form-elements.test.ts && npm run lint && npm run typecheck`
Expected: daily/page.tsx 不再出现；总数从 99 减到 96

- [ ] **Step 3: Commit**

```bash
git add app/daily/page.tsx
git commit -m "refactor(ui): daily 页面能量评分替换为 Button"
```

---

## Task 9: 替换 `app/profile/page.tsx`（9 处 button）

**Files:**
- Modify: `app/profile/page.tsx`

- [ ] **Step 1: 替换模型配置区的"设为默认/测试/编辑/删除"按钮（第 746、753、760、766 行）**

文件已有 `import { Button, Input, Textarea, Select, Checkbox } from "@/components/ui";`。

将每个 `<button onClick={...} className="rounded border px-2 py-1 text-xs hover:bg-gray-50">...</button>` 替换为：
```tsx
<Button variant="outline" size="sm" onClick={...}>
  ...
</Button>
```

- [ ] **Step 2: 替换模型预设按钮（第 825 行）**

将：
```tsx
                <button
                  key={p.name}
                  onClick={() => applyPreset(p)}
                  className="..."
                >
                  {p.name}
                </button>
```
替换为：
```tsx
                <Button
                  key={p.name}
                  variant="outline"
                  size="sm"
                  onClick={() => applyPreset(p)}
                >
                  {p.name}
                </Button>
```

- [ ] **Step 3: 替换密码显隐按钮（第 889 行）**

将：
```tsx
                  <button
                    type="button"
                    onClick={() => setShowApiKey((v) => !v)}
                    ...
                  >
                    {showApiKey ? "隐藏" : "显示"}
                  </button>
```
替换为：
```tsx
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowApiKey((v) => !v)}
                  >
                    {showApiKey ? "隐藏" : "显示"}
                  </Button>
```

- [ ] **Step 4: 替换 Persona 选择按钮（第 1160、1185 行）**

将每个 `<button type="button" onClick={...} className="...">...</button>` 替换为：
```tsx
<Button
  variant={selected === value ? "primary" : "ghost"}
  onClick={...}
  aria-pressed={selected === value}
>
  ...
</Button>
```

- [ ] **Step 5: 替换可折叠分区头部（第 1483 行）**

将：
```tsx
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="..."
      >
```
替换为：
```tsx
      <Button
        variant="ghost"
        onClick={() => setOpen((v) => !v)}
        className="..."
      >
```

- [ ] **Step 6: 跑回归测试 + lint + typecheck**

Run: `npx vitest run __tests__/no-native-form-elements.test.ts && npm run lint && npm run typecheck`
Expected: profile/page.tsx 不再出现；总数从 96 减到 87

- [ ] **Step 7: Commit**

```bash
git add app/profile/page.tsx
git commit -m "refactor(ui): profile 页面 9 处 button 替换为 Button"
```

---

## Task 10: 替换 `app/learn/[planId]/PlanDetailClient.tsx`（9 处 button）

**Files:**
- Modify: `app/learn/[planId]/PlanDetailClient.tsx`

- [ ] **Step 1: 替换"← 返回"按钮（第 576 行）**

文件已有 `import { Button, Input, Textarea, Select } from "@/components/ui";`。

将 `<button onClick={...} className="...">← 返回</button>` 替换为：
```tsx
<Button variant="ghost" size="sm" onClick={...}>← 返回</Button>
```

- [ ] **Step 2: 替换"重新生成"按钮（第 591 行）**

```tsx
<Button variant="dark" size="sm" onClick={openRegenModal}>重新生成</Button>
```

- [ ] **Step 3: 替换"全屏"按钮（第 606 行）**

```tsx
<Button variant="outline" size="sm" onClick={...}>全屏</Button>
```

- [ ] **Step 4: 替换"收藏这份试题"按钮（第 623 行）**

```tsx
<Button variant="outline" onClick={...}>{isFavorited ? "已收藏" : "收藏这份试题"}</Button>
```

- [ ] **Step 5: 替换"继续生成答案"按钮（第 645 行）**

```tsx
<Button variant="primary" onClick={...}>{generating ? "生成中..." : "继续生成答案"}</Button>
```

- [ ] **Step 6: 替换大厂筛选按钮（第 670 行起）**

将三个 filter chip 形式的 `<button>` 替换为：
```tsx
<Button variant={filter === "all" ? "primary" : "ghost"} size="sm" onClick={...}>全部</Button>
<Button variant={filter === "bigtech" ? "primary" : "ghost"} size="sm" onClick={...}>大厂</Button>
<Button variant={filter === "normal" ? "primary" : "ghost"} size="sm" onClick={...}>普通</Button>
```

- [ ] **Step 7: 替换难度筛选按钮（第 683、694 行）**

同理用 `<Button variant={active ? "primary" : "ghost"} size="sm">` 替换

- [ ] **Step 8: 替换"清除筛选"按钮（第 734 行）**

```tsx
<Button variant="link" size="sm" onClick={...}>清除筛选</Button>
```

- [ ] **Step 9: 跑回归测试 + lint + typecheck + 测试**

Run: `npx vitest run __tests__/no-native-form-elements.test.ts && npm run lint && npm run typecheck && npm test`
Expected: PlanDetailClient.tsx 不再出现（除可选图标按钮外）；必须替换清单从 87 减到 78

- [ ] **Step 10: Commit**

```bash
git add app/learn/[planId]/PlanDetailClient.tsx
git commit -m "refactor(ui): PlanDetailClient 9 处 button 替换为 Button"
```

---

## Task 11: 替换 `app/learn/[planId]/edit/PlanEditClient.tsx`（4 处折叠头 button）

**Files:**
- Modify: `app/learn/[planId]/edit/PlanEditClient.tsx`

- [ ] **Step 1: 替换 4 个折叠分区头部（第 280、427、497、562 行）**

文件已有 `import { Button, Input, Textarea, Checkbox } from "@/components/ui";`。

对每个 `<button onClick={() => toggleSection("...")} className="...">` 替换为：
```tsx
<Button
  variant="ghost"
  onClick={() => toggleSection("...")}
  className="..."
  aria-expanded={openSection === "..."}
>
  {/* 保留原 children */}
</Button>
```

- [ ] **Step 2: 跑回归测试 + lint + typecheck**

Run: `npx vitest run __tests__/no-native-form-elements.test.ts && npm run lint && npm run typecheck`
Expected: PlanEditClient.tsx 不再出现；必须替换清单从 78 减到 74

- [ ] **Step 3: Commit**

```bash
git add app/learn/[planId]/edit/PlanEditClient.tsx
git commit -m "refactor(ui): PlanEditClient 4 处折叠头替换为 Button"
```

---

## Task 12: 替换 `app/learn/new/page.tsx`（5 处 button）

**Files:**
- Modify: `app/learn/new/page.tsx`

- [ ] **Step 1: 替换 quickInputs 快捷输入（第 325 行）**

文件已有 `import { Button, Input, Textarea } from "@/components/ui";`。

将：
```tsx
            <button
              key={ex}
              type="button"
              onClick={() => setTopic(ex)}
              className="..."
            >
              {ex}
            </button>
```
替换为：
```tsx
            <Button
              key={ex}
              variant="outline"
              size="sm"
              onClick={() => setTopic(ex)}
            >
              {ex}
            </Button>
```

- [ ] **Step 2: 替换"常用"按钮（第 368 行）**

```tsx
<Button variant="link" size="sm" onClick={...}>常用</Button>
```

- [ ] **Step 3: 替换"💾 存为常用"按钮（第 379 行）**

```tsx
<Button variant="link" size="sm" onClick={...}>💾 存为常用</Button>
```

- [ ] **Step 4: 替换提示词库条目（第 415 行）**

```tsx
<Button variant="ghost" onClick={...} className="text-left">
  {/* 保留原 children 结构 */}
</Button>
```

- [ ] **Step 5: 替换预设知识库卡片（第 507 行）**

```tsx
<Button variant="ghost" onClick={...} className="text-left">
  {/* 保留原 children 结构 */}
</Button>
```

- [ ] **Step 6: 跑回归测试 + lint + typecheck**

Run: `npx vitest run __tests__/no-native-form-elements.test.ts && npm run lint && npm run typecheck`
Expected: learn/new/page.tsx 不再出现（除可选图标按钮外）；必须替换清单从 74 减到 69

- [ ] **Step 7: Commit**

```bash
git add app/learn/new/page.tsx
git commit -m "refactor(ui): learn/new 5 处 button 替换为 Button"
```

---

## Task 13: 替换 `app/docs/page.tsx`（4 处 button）

**Files:**
- Modify: `app/docs/page.tsx`

- [ ] **Step 1: 替换文档目录项（第 131 行）**

文件已有 `import { Button, Input } from "@/components/ui";`。

将：
```tsx
                      <button
                        key={s.id}
                        onClick={() => {
                          ...
                        }}
                        className="..."
                      >
```
替换为：
```tsx
                      <Button
                        key={s.id}
                        variant="ghost"
                        onClick={() => {
                          ...
                        }}
                        className="..."
                      >
```

- [ ] **Step 2: 替换"清除搜索"按钮（第 192 行）**

```tsx
<Button variant="link" size="sm" onClick={() => setSearch("")}>清除搜索</Button>
```

- [ ] **Step 3: 替换上一页/下一页按钮（第 227、238 行）**

```tsx
<Button variant="ghost" size="sm" onClick={() => onSelect(prev.id)} className="text-left">
  {/* 保留原 children */}
</Button>
```

- [ ] **Step 4: 跑回归测试 + lint + typecheck**

Run: `npx vitest run __tests__/no-native-form-elements.test.ts && npm run lint && npm run typecheck`
Expected: docs/page.tsx 不再出现（除可选图标按钮外）；必须替换清单从 69 减到 65

- [ ] **Step 5: Commit**

```bash
git add app/docs/page.tsx
git commit -m "refactor(ui): docs 页面替换 4 处 button 为 Button"
```

---

## Task 14: 替换剩余 app 目录文件（favorites / stats / stats/ai-quality / u/[username] / mistakes，共 9 处）

**Files:**
- Modify: `app/favorites/page.tsx`（2 处 Tab button）
- Modify: `app/stats/page.tsx`（1 处 Tab button）
- Modify: `app/stats/ai-quality/page.tsx`（2 处：range/tab + 刷新）
- Modify: `app/u/[username]/UserPageClient.tsx`（3 处：关注/分享/复制计划）
- Modify: `app/mistakes/MistakeBookClient.tsx`（1 处折叠头）

- [ ] **Step 1: app/favorites/page.tsx — Tab 切换（第 144、152 行）**

文件已有 `import { Button } from "@/components/ui";`。

将两个 `<button onClick={() => setTab("...")} className="...">` 替换为：
```tsx
<Button variant={tab === "decks" ? "primary" : "ghost"} onClick={() => setTab("decks")}>试题集</Button>
<Button variant={tab === "questions" ? "primary" : "ghost"} onClick={() => setTab("questions")}>题目</Button>
```

- [ ] **Step 2: app/stats/page.tsx — Tab 切换（第 80 行）**

文件顶部添加 import：
```tsx
import { Button } from "@/components/ui";
```

将 `<button onClick={() => setTab(t.id)} className="...">` 替换为：
```tsx
<Button variant={tab === t.id ? "primary" : "ghost"} size="sm" onClick={() => setTab(t.id)}>
  {t.label}
</Button>
```

- [ ] **Step 3: app/stats/ai-quality/page.tsx — 时间范围 + 刷新（第 136、148 行）**

文件顶部添加 import：
```tsx
import { Button } from "@/components/ui";
```

第 136 行：
```tsx
<Button variant={range === r ? "primary" : "ghost"} size="sm" onClick={() => setRange(r)}>
  {RANGE_LABELS[r]}
</Button>
```

第 148 行：
```tsx
<Button variant="link" size="sm" onClick={() => void load()} className="ml-auto">
  {/* 保留原 children 图标 */}
</Button>
```

- [ ] **Step 4: app/u/[username]/UserPageClient.tsx — 关注/分享/复制（第 223、230、317 行）**

文件顶部添加 import：
```tsx
import { Button } from "@/components/ui";
```

将三个 `<button onClick={...} className="...">` 替换为相应的 `<Button variant="primary|secondary|ghost" onClick={...}>`，保留 children 内容。

- [ ] **Step 5: app/mistakes/MistakeBookClient.tsx — 折叠头（第 220 行）**

文件已有 `import { Button } from "@/components/ui";`。

将：
```tsx
          <button
            onClick={() => setShowResolved((v) => !v)}
            className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-800"
          >
```
替换为：
```tsx
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowResolved((v) => !v)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800"
          >
```

- [ ] **Step 6: 跑回归测试 + lint + typecheck**

Run: `npx vitest run __tests__/no-native-form-elements.test.ts && npm run lint && npm run typecheck`
Expected: 这 5 个文件不再出现；必须替换清单从 65 减到 56

- [ ] **Step 7: Commit**

```bash
git add app/favorites/page.tsx app/stats/page.tsx app/stats/ai-quality/page.tsx app/u/[username]/UserPageClient.tsx app/mistakes/MistakeBookClient.tsx
git commit -m "refactor(ui): favorites/stats/u/mistakes 共 9 处 button 替换"
```

---

## Task 15: 替换 components 目录中等复杂度文件（8 个文件，共 17 处）

**Files:**
- Modify: `components/MindMap.tsx`（3 处文字 button）
- Modify: `components/ModelIconSelector.tsx`（1 处列表 button）
- Modify: `components/PomodoroFull.tsx`（7 处 button）
- Modify: `components/PomodoroWidget.tsx`（2 处 button）
- Modify: `components/QuestionCard.tsx`（3 处 button）
- Modify: `components/QuickShortcuts.tsx`（2 处 button）
- Modify: `components/RadarChart.tsx`（1 处 tab button）
- Modify: `components/ReviewCardView.tsx`（2 处 button）

- [ ] **Step 1: components/MindMap.tsx — 文字 button（第 440、448、679 行）**

文件顶部添加 import：
```tsx
import { Button } from "@/components/ui";
```

将"展开"、"全部收起"、"进入"三个 `<button onClick={...} className="px-2 h-8 ...">文字</button>` 替换为：
```tsx
<Button variant="ghost" size="sm" onClick={...}>展开</Button>
<Button variant="ghost" size="sm" onClick={...}>全部收起</Button>
<Button variant="primary" size="sm" onClick={...}>进入</Button>
```

- [ ] **Step 2: components/ModelIconSelector.tsx — 列表项（第 129 行）**

文件顶部添加 import：
```tsx
import { Button } from "@/components/ui";
```

将：
```tsx
              <button
                key={model.id}
                type="button"
                onClick={() => onSelect(model.id)}
                className="..."
              >
```
替换为：
```tsx
              <Button
                key={model.id}
                variant="ghost"
                onClick={() => onSelect(model.id)}
                className="..."
              >
```

- [ ] **Step 3: components/PomodoroFull.tsx — 7 处 button**

文件已有 `import { Button, Input, Checkbox } from "@/components/ui";`。

替换映射：
- 第 398 行"全屏" → `<Button variant="ghost" size="sm">全屏</Button>`
- 第 445 行 15/25/50 分钟 → `<Button variant={durationMinutes === m ? "primary" : "ghost"} size="sm">{m} 分钟</Button>`
- 第 473 行"更多选项" → `<Button variant="ghost" size="sm">更多选项</Button>`
- 第 623 行"恢复/暂停" → `<Button variant="secondary">恢复</Button>`
- 第 637 行"放弃" → `<Button variant="ghost">放弃</Button>`
- 第 689 行"再来一个番茄" → `<Button variant="secondary">再来一个番茄</Button>`
- 第 879 行"放弃"（PauseConfirm） → `<Button variant="ghost">放弃</Button>`

- [ ] **Step 4: components/PomodoroWidget.tsx — 2 处 button**

文件顶部添加 import：
```tsx
import { Button } from "@/components/ui";
```

第 171 行"恢复/暂停" → `<Button variant="secondary" size="sm" onClick={handlePauseResume} disabled={busy}>恢复</Button>`
第 178 行"放弃" → `<Button variant="ghost" size="sm" onClick={handleAbort}>放弃</Button>`

- [ ] **Step 5: components/QuestionCard.tsx — 3 处 button**

文件已有 `import { Button } from "@/components/ui";`。

第 91 行题目展开/收起 → `<Button variant="ghost" onClick={...}>{/* 保留题目文本 */}</Button>`
第 204 行"看懂了" → `<Button variant="outline" size="sm" onClick={...}>{isUnderstood ? "✓ 看懂了" : "看懂了"}</Button>`
第 216 行"再想想" → `<Button variant="outline" size="sm" onClick={...}>再想想</Button>`

- [ ] **Step 6: components/QuickShortcuts.tsx — 2 处 button**

文件顶部添加 import：
```tsx
import { Button } from "@/components/ui";
```

第 75 行常用提示词 → `<Button variant="ghost" size="sm" onClick={...}>{prompt}</Button>`
第 105 行工具提示词 → `<Button variant="ghost" size="sm" onClick={...}>{/* 保留图标+文字 */}</Button>`

- [ ] **Step 7: components/RadarChart.tsx — 1 处 tab（第 92 行）**

文件顶部添加 import：
```tsx
import { Button } from "@/components/ui";
```

将：
```tsx
          <button
            key={d}
            onClick={() => setDimension(d)}
            className="..."
          >
```
替换为：
```tsx
          <Button
            key={d}
            variant={dimension === d ? "primary" : "ghost"}
            size="sm"
            onClick={() => setDimension(d)}
          >
```

- [ ] **Step 8: components/ReviewCardView.tsx — 2 处 button**

文件顶部添加 import：
```tsx
import { Button } from "@/components/ui";
```

第 27 行"显示答案" → `<Button variant="secondary" block onClick={() => setShowAnswer(true)}>显示答案</Button>`
第 40 行评分按钮 → `<Button variant="primary" onClick={...}>{/* 保留评分文字 */}</Button>`

- [ ] **Step 9: 跑回归测试 + lint + typecheck + 测试**

Run: `npx vitest run __tests__/no-native-form-elements.test.ts && npm run lint && npm run typecheck && npm test`
Expected: 这 8 个文件不再出现（除可选图标按钮外）；必须替换清单从 56 减到 39（剩余主要是 StatusCard/Toast/UserProfileCard/CodeBlock/ChatClient/BreathTimer/AchievementCard）

- [ ] **Step 10: Commit**

```bash
git add components/MindMap.tsx components/ModelIconSelector.tsx components/PomodoroFull.tsx components/PomodoroWidget.tsx components/QuestionCard.tsx components/QuickShortcuts.tsx components/RadarChart.tsx components/ReviewCardView.tsx
git commit -m "refactor(ui): components 8 个文件 17 处 button 替换为 Button"
```

---

## Task 16: 替换剩余 components 文件（6 个文件，共 9 处）

**Files:**
- Modify: `components/StatusCard.tsx`（1 处 quick option button）
- Modify: `components/Toast.tsx`（2 处 confirm/cancel button）
- Modify: `components/UserProfileCard.tsx`（1 处 rebuild button）
- Modify: `components/CodeBlock.tsx`（2 处 copy/expand button）
- Modify: `components/ChatClient.tsx`（3 处文字 button）
- Modify: `components/BreathTimer.tsx`（1 处开始/停止 button）

- [ ] **Step 1: components/StatusCard.tsx — quick options（第 51 行）**

文件顶部添加 import：
```tsx
import { Button } from "@/components/ui";
```

将：
```tsx
        {QUICK_OPTIONS.map((opt) => (
          <button
            key={opt.label}
            onClick={() => handleClick(opt.energy, opt.mood)}
            className="..."
          >
```
替换为：
```tsx
        {QUICK_OPTIONS.map((opt) => (
          <Button
            key={opt.label}
            variant="outline"
            size="sm"
            onClick={() => handleClick(opt.energy, opt.mood)}
            className="..."
          >
```

- [ ] **Step 2: components/Toast.tsx — confirm/cancel（第 122、128 行）**

文件顶部添加 import：
```tsx
import { Button } from "@/components/ui";
```

第 122 行取消 → `<Button variant="secondary" size="sm" onClick={() => handleConfirmClick(false)}>取消</Button>`
第 128 行确认 → `<Button variant={item.confirm?.variant === "danger" ? "danger" : "primary"} size="sm" onClick={() => handleConfirmClick(true)}>{item.confirm?.okText ?? "确认"}</Button>`

- [ ] **Step 3: components/UserProfileCard.tsx — rebuild（第 149 行）**

文件已有 `import { Button } from "@/components/ui";`。

将：
```tsx
        <button
          onClick={() => void handleRebuild()}
          disabled={loading}
          className="..."
        >
          {loading ? "重建中" : "重建"}
        </button>
```
替换为：
```tsx
        <Button
          variant="link"
          size="sm"
          onClick={() => void handleRebuild()}
          loading={loading}
        >
          {loading ? "重建中" : "重建"}
        </Button>
```

- [ ] **Step 4: components/CodeBlock.tsx — copy/expand（第 431、452 行）**

文件顶部添加 import：
```tsx
import { Button } from "@/components/ui";
```

第 431 行"复制" → `<Button variant="ghost" size="sm" onClick={...}>{/* 保留 children */}</Button>`
第 452 行"▼ 收起 / ▶ 展开剩余" → `<Button variant="ghost" size="sm" block onClick={...}>{expanded ? "▼ 收起" : "▶ 展开剩余"}</Button>`

- [ ] **Step 5: components/ChatClient.tsx — 3 处文字 button（第 1148、1171、1278 行）**

文件已有 `import { Button, Input, Textarea } from "@/components/ui";`。

第 1148 行内置提示词 → `<Button variant="outline" size="sm" onClick={...}>{p}</Button>`
第 1171 行工具提示词 → `<Button variant="outline" size="sm" onClick={...}>{/* 保留图标+文字 */}</Button>`
第 1278 行"刷新" → `<Button variant="ghost" size="sm" onClick={() => handleRegenerateAnswer(m.id)}>{/* 保留图标+文字 */}</Button>`

- [ ] **Step 6: components/BreathTimer.tsx — 开始/停止（第 94 行）**

文件顶部添加 import：
```tsx
import { Button } from "@/components/ui";
```

将：
```tsx
      <button
        onClick={running ? stop : start}
        className={`mt-4 px-6 py-2 rounded-full text-sm font-medium ${...}`}
      >
        {running ? "停止" : "开始"}
      </button>
```
替换为：
```tsx
      <Button
        variant={running ? "danger" : "primary"}
        size="lg"
        onClick={running ? stop : start}
        className="mt-4 rounded-full"
      >
        {running ? "停止" : "开始"}
      </Button>
```

如果有"再来"按钮也同理替换。

- [ ] **Step 7: 跑回归测试 + lint + typecheck + 测试**

Run: `npx vitest run __tests__/no-native-form-elements.test.ts && npm run lint && npm run typecheck && npm test`
Expected: 必须替换清单从 39 减到 0；剩余遗漏全是"可选图标按钮"（30 处）

- [ ] **Step 8: Commit**

```bash
git add components/StatusCard.tsx components/Toast.tsx components/UserProfileCard.tsx components/CodeBlock.tsx components/ChatClient.tsx components/BreathTimer.tsx
git commit -m "refactor(ui): components 6 个文件 9 处 button 替换，必须替换清单归零"
```

---

## Task 17: 替换所有"可选"图标按钮（15 个文件，30 处）

**Files:**
- Modify: 15 个文件的图标按钮位置（详见 subagent 报告"可选替换"清单）
  - `app/emotion/page.tsx`（1 处）
  - `app/docs/page.tsx`（1 处）
  - `app/learn/[planId]/PlanDetailClient.tsx`（1 处）
  - `app/learn/new/page.tsx`（2 处）
  - `components/MindMap.tsx`（4 处工具栏图标）
  - `components/ModelIconSelector.tsx`（1 处）
  - `components/QuickShortcuts.tsx`（1 处）
  - `components/Toast.tsx`（1 处关闭 X）
  - `components/AchievementCard.tsx`（1 处关闭 X）
  - `components/HealthAlertCard.tsx`（1 处关闭 X）
  - `components/AITaskModal.tsx`（1 处关闭 X）
  - `components/ChatModal.tsx`（1 处关闭 X）
  - `components/FloatingChatButton.tsx`（1 处 FAB）
  - `components/DailyNudge.tsx`（1 处 thumbs-down）
  - `components/ChatClient.tsx`（12 处各种图标按钮）

- [ ] **Step 1: 通用替换模板**

对每个 `<button onClick={...} aria-label="X"><svg/icon/></button>` 替换为：
```tsx
<Button
  iconOnly
  variant="ghost"
  size="sm"
  onClick={...}
  aria-label="X"
  className={/* 保留原 className */}
>
  <Icon name="..." className="w-4 h-4" />
</Button>
```

- [ ] **Step 2: 逐个文件替换**

按 subagent 报告的"可选替换清单"逐个文件修改，每个文件修改后跑一次 `npx vitest run __tests__/no-native-form-elements.test.ts` 确认进度。

**重点文件 components/ChatClient.tsx**（12 处图标按钮，密集）：
- 第 1060 行历史对话按钮 → `<Button iconOnly variant="ghost" size="sm" aria-label="历史对话" onClick={...}><Icon name="clock" /></Button>`
- 第 1069 行新建对话按钮 → 同理
- 第 1081 行收藏对话按钮 → 同理
- 第 1092 行删除对话按钮 → 同理
- 第 1124 行关闭错误 → 同理
- 第 1240 行删除消息 → 同理
- 第 1260 行编辑消息 → 同理
- 第 1299 行删除回复 → 同理
- 第 1319 行反馈"没帮助" → 同理
- 第 1412 行关闭历史侧栏 → 同理
- 第 1463 行历史会话收藏 → 同理
- 第 1471 行历史会话删除 → 同理

- [ ] **Step 3: 跑回归测试确认遗漏清零**

Run: `npx vitest run __tests__/no-native-form-elements.test.ts`
Expected: 必须替换清单 = 0，可选替换清单 = 0，遗漏总数 = 0

- [ ] **Step 4: 跑 lint + typecheck + 全量测试**

Run: `npm run lint && npm run typecheck && npm test`
Expected: 全部通过

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "refactor(ui): 替换所有图标按钮为 Button iconOnly 模式，原生表单元素归零"
```

---

## Task 18: 启用回归测试为 strict 模式 + 最终验证

**Files:**
- Modify: `__tests__/no-native-form-elements.test.ts`

- [ ] **Step 1: 删除过渡测试，恢复 strict 测试**

修改 `__tests__/no-native-form-elements.test.ts`，把 Task 3 Step 3 中临时改的 `it.skip` 和"过渡"测试恢复为原始 strict 版本：

```ts
describe("no native form elements outside components/ui/", () => {
  it("不允许在 components/ui/ 之外使用原生 <input>/<select>/<textarea>/<button>", () => {
    const violations = collectViolations();
    if (violations.length > 0) {
      const msg = violations
        .map((v) => `  ${v.file}:${v.line}  ${v.snippet}`)
        .join("\n");
      throw new Error(
        `发现 ${violations.length} 处原生表单元素，必须替换为 @/components/ui 组件库：\n${msg}\n\n` +
        `替换指南：\n` +
        `  <input type="text/password/number/date/time/range"> → <Input> 或 <Slider>\n` +
        `  <textarea> → <Textarea>\n` +
        `  <select> → <Select>\n` +
        `  <button>含文字 → <Button variant="...">\n` +
        `  <button>纯图标 → <Button iconOnly aria-label="...">`,
      );
    }
    expect(violations).toHaveLength(0);
  });
});
```

- [ ] **Step 2: 跑回归测试确认通过**

Run: `npx vitest run __tests__/no-native-form-elements.test.ts`
Expected: PASS — 0 violations

- [ ] **Step 3: 跑完整 quality gate**

Run: `npm run lint && npm run typecheck && npm test && npm run build`
Expected: 全部通过；build 不再报 `useSyncExternalStore` 错误（前一轮已修复）

- [ ] **Step 4: Commit + Push**

```bash
git add __tests__/no-native-form-elements.test.ts
git commit -m "test: 启用原生表单元素回归测试为 strict 模式"
git push origin main
```

---

## Self-Review

### 1. Spec coverage 检查

| 用户需求 | 任务覆盖 |
|---------|---------|
| "为什么还有那么多原生表单组件" — 全面扫描 | subagent 报告 + Task 3 回归测试 |
| "全部整改" — 替换所有遗漏 | Task 4-17 覆盖 33 个文件、88+30=118 处 |
| 防止再漏 — 永久护栏 | Task 3 + Task 18 strict 模式 |
| 新建缺失组件 | Task 1（Slider）+ Task 2（Button 扩展） |
| 每次任务完成 push 到远程 | Task 18 Step 4 + 各任务 commit |

### 2. Placeholder 扫描

- ✅ 无 "TBD" / "TODO" / "fill in details"
- ✅ 每个 button 替换都给出了具体行号和替换代码
- ✅ 每个任务都有具体测试命令和期望输出
- 注意：Task 14-17 中某些 button 的 children 内容用 `{/* 保留原 children */}` 表示 — 这是因为原 children 可能含复杂 JSX（图标 + 文字组合），完整复制会让计划过长。执行者需要 Read 原文件、保留 children、只替换外层 `<button>` 标签为 `<Button>`。这一点在每个步骤的注释里都说明了。

### 3. Type consistency 检查

- `Button` props 在 Task 2 定义：`variant`、`size`、`loading`、`leftIcon`、`block`、`iconOnly`
- `Slider` props 在 Task 1 定义：`value`、`onChange`、`min`、`max`、`step`、`showValue`、`valueSuffix`
- 后续任务中使用的 `variant="link|outline|ghost|primary|secondary|dark|danger"` 全部在 Task 2 的 `VARIANT_CLASSES` 字典中定义 ✓
- `iconOnly` 在 Task 2 定义，在 Task 17 使用 ✓
- `Slider` 的 `onChange={(value: number) => void}` 在 Task 1 定义，Task 6/7 使用 `onChange={setDailyMinutes}` / `onChange={setMaxNewPerDay}` 类型匹配 ✓
- `Slider` 的 `value: number` 与原 `<input type="range" value={dailyMinutes}>` 类型一致 ✓

### 4. 关键风险点

1. **Button 默认 `type="button"`** — 原生 button 在 form 内可能默认 `type="submit"`，替换为 `<Button>` 后变为 `type="button"`，需要确认 form 提交仍能工作。Task 12 (`app/learn/new/page.tsx`) 的 form 有 `onSubmit={handleSubmit}`，提交按钮应该是 `<Button type="submit">` 而非默认。**执行者需在每个 form 内的提交按钮上显式加 `type="submit"`**。
2. **Button 的 children 默认居中** — 原生 button 可能用 `text-left` 左对齐。Task 6/12 中提到加 `className="text-left"` 或 `justify-start` 修正。
3. **iconOnly + aria-label** — 可访问性要求每个 iconOnly 按钮必须有 `aria-label`。Task 17 模板已包含。
4. **回归测试的误报** — 字符串模板里的 `<button>` 会被误报。当前实现跳过 `//` 和 `*` 开头的注释行，但不跳过模板字符串。若执行中误报，可在测试里增加对反引号行的跳过逻辑。

### 5. 任务总数与时间预估

- 18 个 Task
- 每个 Task 含 3-10 个 Step
- 总 Step 数约 100+
- 按每个 Step 2-5 分钟，总工时约 5-8 小时
- 建议分 2-3 个 session 完成，每个 session 完成 6-8 个 Task

---

## Execution Handoff

Plan complete and saved to `docs/superpowers/plans/2026-07-19-unify-all-form-components.md`. Two execution options:

**1. Subagent-Driven (recommended)** - 每个 Task 派发独立 subagent，task 间 review，快速迭代

**2. Inline Execution** - 当前 session 内顺序执行，带 checkpoint 审查

**Which approach?**
