# devpath-ai UI 设计系统规范

> **地位**：项目 UI 设计的"宪法"，所有视觉与交互决策必须从这里推导。
> **生效范围**：`app/**/*.tsx`、`components/**/*.tsx` 全部页面与组件。
> **强制性**：本文档与 `AGENTS.md`、`__tests__/no-native-form-elements.test.ts`、`__tests__/ui-design-system-guard.test.ts` 一起构成 AI/人类编码的强制护栏。

---

## 0. 核心理念

### 0.1 乔布斯视角：克制即设计

- **每屏只回答一个问题**：用户进入页面 3 秒内必须看到核心答案。首页 Hero 区只放 CurrentTaskCard，其它信息按优先级递减。
- **减法优先于加法**：新增一块 UI 前，先问"能否合并到已有区块"。"和底部 Nav 重复的快捷入口"必须删除。
- **层级靠留白，不靠装饰**：section 之间用 `mb-5` 分隔，不要画分隔线；卡片用 `shadow-sm` 而非 `shadow-2xl`。
- **状态色克制**：每屏最多 3 种状态色（success/warning/danger），其它用 gray 阶。

### 0.2 卡帕西视角：契约层优先

- **设计令牌是单一事实源**：颜色/圆角/阴影/字号只能用 `tailwind.config.ts` 中定义的令牌，禁止 `text-[10px]` / `bg-[#ff5000]` 等逃逸值。
- **组件库是契约**：表单元素必须用 `@/components/ui`，禁止在 `components/ui/` 之外使用原生 `<input>/<select>/<textarea>/<button>`（由 `no-native-form-elements.test.ts` 强制）。
- **测试即文档**：每条设计规则都应有对应的守护测试，让 CI 在每次提交时验证。

---

## 1. 设计令牌（Design Tokens）

定义在 [tailwind.config.ts](file:///workspace/tailwind.config.ts)，所有视觉决策的单一事实源。

### 1.1 颜色

| Token | 值 | 用途 |
|---|---|---|
| `brand-{50..900}` | Tailwind blue 同色阶 | 品牌主色，CTA / 链接 / 焦点环 |
| `brand` (DEFAULT) | `#2563eb` (blue-600) | 等价于 `bg-brand-600` |
| `success` / `success-soft` | `#16a34a` / `#dcfce7` | 成功状态（绿） |
| `warning` / `warning-soft` | `#d97706` / `#fef3c7` | 警告状态（橙） |
| `danger` / `danger-soft` | `#dc2626` / `#fee2e2` | 危险/错误状态（红） |
| `info` / `info-soft` | `#2563eb` / `#dbeafe` | 信息提示（蓝） |

**规则**：
- 新组件优先用语义色（`bg-success-soft`）而非原始色阶（`bg-green-100`）。
- 旧代码可保留 `bg-blue-600` 等原始色阶，但**禁止新增** `bg-[#xxxxxx]` 任意值。

### 1.2 圆角（4 档）

| Token | 值 | 用途 |
|---|---|---|
| `rounded-sm` | 8px (Tailwind 默认) | 输入框 / 按钮 |
| `rounded-card` | 12px | 卡片默认圆角 |
| `rounded-lg2` | 16px | 大卡片 |
| `rounded-pill` | 9999px | 胶囊（Filter Chip / FAB / CTA） |

**禁止**：`rounded-[13px]` / `rounded-[20px]` 等逃逸值。

### 1.3 阴影（4 档）

| Token | 用途 |
|---|---|
| `shadow-card` | 静态卡片默认阴影 |
| `shadow-card-hover` | 卡片 hover 态 |
| `shadow-modal` | 模态弹窗 |
| `shadow-floating` | 浮层（toast / widget） |

### 1.4 字号

| Token | 值 | 用途 |
|---|---|---|
| `text-2xs` | 11px / 16px | 徽章、辅助标签（替代 `text-[10px]`/`text-[11px]` 逃逸值） |
| `text-xs` | 12px | 次要文字、辅助说明 |
| `text-sm` | 14px | 正文小字 |
| `text-base` | 16px | 正文 |
| `text-lg` | 18px | 标题 |
| `text-xl` | 20px | 页面主标题 |

**禁止**：`text-[10px]` / `text-[11px]` / `text-[13px]` 等逃逸值。

### 1.5 动画

| Token | 用途 |
|---|---|
| `animate-fade-in` | 150ms 渐入 |
| `animate-slide-up` | 200ms 上滑渐入 |
| `animate-shimmer` | 骨架屏光带（1.5s 循环） |

### 1.6 字体

中文字体回退链：`system-ui → -apple-system → PingFang SC → Microsoft YaHei`，跨平台一致。

---

## 2. UI 组件库（13 个核心组件）

定义在 [components/ui/](file:///workspace/components/ui)，由 [components/ui/index.ts](file:///workspace/components/ui/index.ts) 统一导出。

### 2.1 表单组件（8 个）

| 组件 | 用途 | 关键 props |
|---|---|---|
| `Button` | 主按钮 | `variant`: primary/secondary/outline/ghost/success/danger/dark/link; `size`: sm/md/lg; `iconOnly`; `leftIcon`; `loading` |
| `LinkButton` | 链接型按钮（与 Button 共享 variant/size） | `href`; 其余同 Button |
| `Input` | 文本输入 | `error`; `leftIcon`; `rightAddon` |
| `Textarea` | 多行输入 | `error`; `autoResize` |
| `Select` | 下拉选择 | `error`; `options` |
| `Checkbox` | 复选框 | `checked`; `onCheckedChange` |
| `Switch` | 开关 | `checked`; `onCheckedChange` |
| `Slider` | 滑块 | `min`; `max`; `step`; `value` |
| `FormField` | 表单字段包装（label + 错误提示） | `label`; `error`; `htmlFor` |

### 2.2 展示/反馈组件（5 个）

| 组件 | 用途 | 关键 props |
|---|---|---|
| `Modal` | 模态弹窗（内置 focus trap + ESC + 焦点恢复 + body lock） | `open`; `onClose`; `titleId`; `size`: sm/md/lg |
| `EmptyState` | 空状态（icon + title + description + action） | `icon`; `title`; `description`; `action` |
| `Skeleton` | 骨架屏（text/rect/card/avatar + shimmer） | `variant`; `className` |
| `SkeletonCard` | 组合骨架（卡片式） | `lines` |
| `Kbd` | 键盘按键样式 | `size`: sm/md/lg |

### 2.3 使用规则

✅ **必须**：
```tsx
import { Button, Input, Modal } from "@/components/ui";
<Button variant="primary" size="md">提交</Button>
<Input error={errors.name} />
<Modal open={open} onClose={close} titleId="my-title">...</Modal>
```

❌ **禁止**（守护测试会失败）：
```tsx
<button onClick={...}>提交</button>            // 必须用 <Button>
<input type="text" />                          // 必须用 <Input>
<select><option>...</option></select>          // 必须用 <Select>
<div onClick={...} className="modal">...</div> // 必须用 <Modal>
```

### 2.4 iconOnly 按钮规则

`<Button iconOnly>` 必须提供 `aria-label`：
```tsx
<Button iconOnly aria-label="关闭" onClick={close}>
  <Icon name="x" />
</Button>
```

---

## 3. 暗色模式规范

### 3.1 切换机制

- 配置：`tailwind.config.ts` 中 `darkMode: "class"`
- 触发：[app/layout.tsx](file:///workspace/app/layout.tsx) 通过 inline script 在 SSR 前注入 `document.documentElement.classList.add('dark')`
- 存储：`localStorage.devpath:theme`，值为 `light` / `dark` / `system`

### 3.2 颜色配对规则（强制）

每一组浅色 utility 都**必须**带对应的 `dark:` 变体。常见配对：

| 浅色（light） | 暗色（dark） |
|---|---|
| `bg-white` | `dark:bg-gray-800` |
| `bg-gray-50` | `dark:bg-gray-800` 或 `dark:bg-gray-900/60` |
| `bg-gray-100` | `dark:bg-gray-800` |
| `bg-gray-200`（track） | `dark:bg-gray-700` |
| `bg-blue-50` | `dark:bg-blue-950` 或 `dark:bg-blue-950/40` |
| `bg-green-50` / `bg-green-100` | `dark:bg-green-950` / `dark:bg-green-950/40` |
| `bg-red-50` / `bg-red-100` | `dark:bg-red-950` / `dark:bg-red-950/40` |
| `bg-orange-50` / `bg-orange-100` | `dark:bg-orange-950` / `dark:bg-orange-950/40` |
| `bg-yellow-50` / `bg-yellow-100` | `dark:bg-yellow-950` / `dark:bg-yellow-950/50` |
| `bg-amber-50` / `bg-amber-100` | `dark:bg-amber-950` |
| `bg-pink-50` / `bg-purple-50` | `dark:bg-pink-950/40` / `dark:bg-purple-950/40` |
| `border-gray-100` / `border-gray-200` | `dark:border-gray-700` |
| `text-gray-400` | `dark:text-gray-500`（提升暗背景下对比度） |
| `text-gray-500` | `dark:text-gray-400` |
| `text-gray-600` | `dark:text-gray-300` |
| `text-gray-700` | `dark:text-gray-200` |
| `text-gray-900` | `dark:text-gray-100` |
| `text-blue-600` | `dark:text-blue-400` |
| `text-green-600` / `text-green-700` | `dark:text-green-400` / `dark:text-green-300` |
| `text-red-600` | `dark:text-red-400` |
| `hover:bg-gray-50` | `dark:hover:bg-gray-800` |
| `hover:bg-white` | `dark:hover:bg-gray-900` |

### 3.3 图表暗色处理

- **Heatmap**：必须传 `theme.light` + `theme.dark` 两套色阶。
- **Recharts 图表**：用 `className="text-gray-300 dark:text-gray-600"` + `stroke="currentColor"` + `tick={{ fill: "currentColor" }}`，让 SVG 跟随 Tailwind dark variant。
- **SVG 内联色**：避免硬编码 `#e5e7eb`，改用 `var(--surface)` 等 CSS 变量（未来扩展）。

### 3.4 守护测试

由 `__tests__/ui-design-system-guard.test.ts` 强制：扫描 `components/ui/` 之外的浅色 utility，要求同 className 内必须带 `dark:` 配对。新增违规会让 CI 失败。

---

## 4. 可访问性规范（WCAG 2.1 AA）

### 4.1 全局兜底（已实现）

定义在 [app/globals.css](file:///workspace/app/globals.css)：

- `:focus-visible` 全局规则：键盘聚焦显示 2px 蓝色 outline
- `:focus:not(:focus-visible)`：鼠标点击不残留 outline
- `.skip-link`：跳过链接样式（layout.tsx 中已使用）
- `.sr-only`：屏幕阅读器专用隐藏类

### 4.2 跳过链接（已实现）

[app/layout.tsx](file:///workspace/app/layout.tsx) 中：
```tsx
<a href="#main-content" className="skip-link">跳到主内容</a>
<main id="main-content">{children}</main>
```

### 4.3 Viewport 缩放

**禁止**在 `viewport` 中设置 `userScalable: false` / `maximumScale: 1` — 违反 WCAG 1.4.4 Resize Text。低视力用户必须能放大页面。

### 4.4 模态弹窗

所有模态必须用 [components/ui/Modal.tsx](file:///workspace/components/ui/Modal.tsx)，它内置：
- `role="dialog"` + `aria-modal="true"` + `aria-labelledby`
- focus trap（焦点不出弹窗）
- ESC 关闭
- 焦点恢复（关闭后回到触发元素）
- body scroll lock

**禁止**手写 `<div className="fixed inset-0" onClick={...}>` 当模态。

### 4.5 折叠/展开

折叠按钮必须带 `aria-expanded` + `aria-controls`，被控区域带 `id`：
```tsx
<Button aria-expanded={open} aria-controls="panel-id" onClick={toggle}>展开</Button>
<section id="panel-id" className={open ? "" : "hidden"}>...</section>
```

### 4.6 进度条

进度条容器必须带 `role="progressbar"` + `aria-valuenow/min/max` + `aria-label`：
```tsx
<div role="progressbar" aria-valuenow={50} aria-valuemin={0} aria-valuemax={100}
     aria-label="掌握度 50%" className="...">
  <div style={{ width: "50%" }} />
</div>
```

### 4.7 倒计时

实时倒计时（番茄钟/呼吸法）必须带 `role="timer"` + `aria-live="off"` + `aria-label`：
```tsx
<div role="timer" aria-live="off" aria-atomic="true"
     aria-label={`剩余 ${seconds} 秒`}>
  {seconds}
</div>
```

`aria-live="off"` 避免每秒被读出。关键节点（归零/完成）通过另外的 `aria-live="polite"` 区域播报。

### 4.8 表单 label

`<label>` 必须用 `htmlFor` 关联 `<Input id>`：
```tsx
import { useId } from "react";
const id = useId();
<label htmlFor={id}>名称</label>
<Input id={id} />
```

或用 `FormField` 组件包装（推荐）。

### 4.9 live region

- 操作反馈（如"链接已复制"）：`role="status"` + `aria-live="polite"`
- 错误提示：`role="alert"`
- 新成就解锁通知：`role="status"` + `aria-live="polite"`

### 4.10 颜色对比度

- 主要文字 ≥ 4.5:1（WCAG AA）
- 大字号（≥18px）≥ 3:1
- **避免** `text-gray-400` 作为白底主要文字（对比度仅 2.85:1），改为 `text-gray-500 dark:text-gray-400`

---

## 5. 视觉语言

### 5.1 卡片样式（默认）

```tsx
<div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700
                rounded-card p-4 shadow-card">
  ...
</div>
```

### 5.2 间距

- section 之间：`mb-5`（20px）
- 卡片内 padding：`p-4`（16px）
- 表单字段之间：`space-y-3` 或 `gap-3`
- 按钮组：`gap-2`

### 5.3 状态色徽章

```tsx
// 大厂标签
<span className="text-2xs px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-950
                 text-amber-700 dark:text-amber-300 font-medium">
  大厂
</span>

// 难度徽章（D1-D5）
const DIFFICULTY_COLORS = {
  1: "bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-300",
  // ...
};
```

### 5.4 图标

- 全部用 [components/Icon.tsx](file:///workspace/components/Icon.tsx)，stroke-based，与 Lucide 风格一致
- **禁止**用 emoji 作为功能图标（如 `🍅` `⚠️`），仅可用于纯装饰（如情绪表情 `entry.emoji`）
- emoji 装饰元素应加 `aria-hidden="true"`

---

## 6. 首页设计范式（6 区结构）

参考 [app/HomeClient.tsx](file:///workspace/app/HomeClient.tsx) 的 6 区结构（第 5 轮简化后，折叠区已删除，热力图常驻）：

1. **Hero 行动区**：CurrentTaskCard + 番茄钟入口 + 低能量休息链接
2. **KPI 三宫格**：今日学习清单 N 项（可点击进入学习）/ 已完成 X 项 / 连续打卡 N 天
3. **AI 教练洞察区**：HomeInsightsCard（成就 + 健康提醒）+ 能力画像 + AI 质量摘要
4. **能量趋势迷你图**（新账户无数据时隐藏）
5. **7 天热力图**（常驻，新账户无打卡记录时隐藏）
6. **今日学习队列**（移到最下面作为详细视图，KPI 卡片已能快速进入学习）

**原则**：
- 用户进入 3 秒内能看到 1+2 区（核心答案 + KPI）
- 3+4 区是次要洞察，可滚动查看
- 5 区是低频可视化，常驻但可空
- 6 区作为详细视图，KPI 卡片已能快速进入学习，避免重复入口
- 新账户隐藏空数据区块（第 3/4/5 区按数据存在性条件渲染）

**禁止**：
- 在首页堆砌 9+ 个并列区块
- 与底部 Nav 重复的快捷入口
- 与 HomeInsightsCard 功能重叠的 StatusCard
- 与 EmotionQuickPicker / /mistakes 重复的折叠入口

---

## 7. 禁止清单（反模式）

### 7.1 颜色

```tsx
// ❌ 禁止：逃逸值
<div className="text-[13px] bg-[#ff5000] rounded-[13px]" />

// ❌ 禁止：浅色 utility 不带 dark 配对（守护测试会失败）
<div className="bg-white p-4" />           // 缺 dark:bg-gray-800
<p className="text-gray-400" />            // 缺 dark:text-gray-500

// ❌ 禁止：硬编码 SVG 颜色（无法跟随 dark）
<path stroke="#e5e7eb" />
```

### 7.2 表单

```tsx
// ❌ 禁止：原生表单元素（守护测试会失败）
<button onClick={...}>提交</button>
<input type="text" />
<select>...</select>
<textarea />

// ❌ 禁止：div onClick 当按钮（无键盘可访问性）
<div onClick={handleClick} className="cursor-pointer">点击</div>
```

### 7.3 模态

```tsx
// ❌ 禁止：手写 div 模态（缺 ARIA + focus trap）
<div className="fixed inset-0 bg-black/40" onClick={onClose}>
  <div onClick={e => e.stopPropagation()}>...</div>
</div>

// ✅ 必须用 <Modal>
<Modal open={open} onClose={onClose} titleId="my-title">
  ...
</Modal>
```

### 7.4 折叠

```tsx
// ❌ 禁止：折叠按钮缺 aria-expanded
<Button onClick={toggle}>展开</Button>

// ✅ 必须带 aria-expanded + aria-controls
<Button aria-expanded={open} aria-controls="panel" onClick={toggle}>展开</Button>
<section id="panel">...</section>
```

### 7.5 emoji

```tsx
// ❌ 禁止：emoji 当功能图标
<div className="text-5xl">🍅</div>
<span>⚠️ 已被打断</span>

// ✅ 必须用 <Icon>
<Icon name="tomato" className="w-16 h-16 text-red-500" />
<Icon name="alert" className="w-3.5 h-3.5" /> 已被打断
```

---

## 8. AI 编码时的强制流程

当 AI（或人类）在本项目新增 UI 时，必须按以下顺序检查：

1. **是否有现成组件**？查 [components/ui/index.ts](file:///workspace/components/ui/index.ts)，90% 场景已有
2. **是否用了设计令牌**？查本文档第 1 节，禁止逃逸值
3. **是否补了 dark 配对**？浅色 utility 必须带 `dark:` 变体
4. **是否补了 ARIA**？模态、折叠、进度条、计时器、icon-only 按钮都有专属规则
5. **是否破坏了 6 区结构**？首页修改前先读 [app/HomeClient.tsx](file:///workspace/app/HomeClient.tsx) 头注释
6. **是否冲突了 z-index 层级**？参考第 11 节"z-index 层级表"
7. **运行守护测试**：`./node_modules/.bin/vitest run no-native-form-elements ui-design-system-guard`

---

## 9. 守护测试清单

| 测试文件 | 守护内容 |
|---|---|
| `__tests__/no-native-form-elements.test.ts` | `components/ui/` 之外禁止原生 `<input>/<select>/<textarea>/<button>` |
| `__tests__/ui-design-system-guard.test.ts` | 浅色 utility 必须带 `dark:` 配对；禁止 `text-[Npx]` 逃逸值 |

新增设计规则时，应同时新增对应的守护测试，让规则可被 CI 验证。

---

## 10. 变更记录

| 日期 | 版本 | 变更 |
|---|---|---|
| 2026-07-19 | v1.0 | 首次发布。包含设计令牌、13 个 UI 组件、暗色模式、可访问性、首页 5 区结构等完整规范 |
| 2026-07-23 | v1.1 | 首页结构由 5 区升级为 6 区（折叠区删除，热力图常驻，学习队列移到最下面）；新增第 11 节 z-index 层级表，规范 Nav/FloatingChat/Modal/PomodoroWidget 的层叠关系 |
| 2026-07-23 | v1.2 | 番茄钟移除 large Modal，改为 hidden/ring/card 三态浮窗；新增 ring/card 拖动遮罩 z-[90] + 长按菜单 z-[100]；Nav 纯图标 + min-h-[44px]；Modal 新增 mobilePosition="center" 用于 ModelConfigModal 居中定位 |

---

## 11. z-index 层级表

全局浮层与模态的层叠关系（避免互相遮挡，定义单一事实源）：

| 层级 | z-index | 元素 | 文件 | 说明 |
|---|---|---|---|---|
| 内容层 | `z-10` | sticky 顶部进度条 / 训练页头部 | `app/train/TrainClient.tsx` 等 | 页面内局部 sticky |
| 导航层 | `z-50` | 底部 `<Nav>`（纯图标 + min-h-[44px]） | [components/Nav.tsx](file:///workspace/components/Nav.tsx) | 3 Tab：路径 / 训练 / 我的；iOS HIG 触控区合规 |
| 浮动按钮层 | `z-50` | `<FloatingChatButton>` | [components/FloatingChatButton.tsx](file:///workspace/components/FloatingChatButton.tsx) | 右下角 AI 对话入口（与 Nav 同层，靠 `bottom-20` 让位 Nav） |
| 模态层 | `z-[60]` | 统一 `<Modal>` | [components/ui/Modal.tsx](file:///workspace/components/ui/Modal.tsx) | 内置 focus trap + ESC + 焦点恢复 + body lock；`mobilePosition="bottom"`（默认，贴底）/ `"center"`（居中，用于 ModelConfigModal 等配置类弹窗） |
| 学习页脑图浮按钮 | `z-50` | `<Button>` fixed right-4 bottom-32 | `app/learn/[planId]/PlanDetailClient.tsx` | 脑图悬浮小图标，点击展开脑图 Modal |
| 番茄 widget 浮窗层 | `z-[80]` | `<PomodoroWidget>` ring/card 态 | [components/PomodoroWidget.tsx](file:///workspace/components/PomodoroWidget.tsx) | 三态浮窗：`hidden`（不渲染）/ `ring`（56px 圆环）/ `card`（280×420 卡片）；不再使用 Modal |
| 番茄拖动遮罩 | `z-[90]` | card 拖动时的全屏透明遮罩 | [components/PomodoroWidget.tsx](file:///workspace/components/PomodoroWidget.tsx) | 阻止拖动期间触发其他点击；仅在拖动中渲染 |
| 番茄长按菜单 | `z-[100]` | card 长按弹出的操作菜单 | [components/PomodoroWidget.tsx](file:///workspace/components/PomodoroWidget.tsx) | 重置 / 切换模式 / 关闭 等操作；仅 card 态长按触发 |

**规则**：
- 任何新浮层必须先查本表，禁止凭感觉写 `z-[100]` / `z-[9999]`
- 模态层（`z-[60]`）高于 Nav/FloatingChat（`z-50`），保证打开模态时遮罩覆盖底部 Nav
- 番茄 widget（`z-[80]`）高于模态层，保证 ring/card 浮窗在模态之上仍可见；不再使用 Modal 渲染 large 态
- 番茄长按菜单（`z-[100]`）为 widget 内最高层，仅 card 态长按触发；不要在其他地方复用此值
- `ToastContainer` 在 `<Modal>` 之上（具体值见 [components/ui/Toast.tsx](file:///workspace/components/ui/Toast.tsx)）
