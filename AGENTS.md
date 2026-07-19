# AGENTS.md — AI 编码守则

> **地位**：本项目所有 AI（Claude / Cursor / Copilot / Trae 等）和人类开发者**必须**遵守的强制规范。
> **优先级**：本文件 > `docs/DEVELOPMENT.md` > `docs/ARCHITECTURE.md` > 其他文档。
> **强制性**：与 `docs/ui-design-system.md` + `__tests__/no-native-form-elements.test.ts` + `__tests__/ui-design-system-guard.test.ts` 一起构成护栏。任何违反都会让 CI 失败。

---

## 0. 项目身份

- **项目名**：devpath-ai — AI 驱动的开发者成长 OS
- **技术栈**：Next.js 15 (App Router) + React 19 + TypeScript 5.5 + Tailwind CSS 3.4
- **测试**：Vitest 1.6 + Testing Library + jsdom
- **存储**：IndexedDB（本地）+ Cloudflare KV（云端同步，可选）
- **生产链接**：https://devpath-ai.pages.dev/

---

## 1. 必读文档（按顺序）

启动任何 UI / 前端任务前，**必须**先读：

1. [docs/ui-design-system.md](file:///workspace/docs/ui-design-system.md) — UI 设计系统规范（强制）
2. [tailwind.config.ts](file:///workspace/tailwind.config.ts) — 设计令牌定义
3. [components/ui/index.ts](file:///workspace/components/ui/index.ts) — 可用的统一组件清单
4. 目标文件的头注释（如 [app/HomeClient.tsx](file:///workspace/app/HomeClient.tsx) 文件头有 5 区结构说明）

启动后端 / API 任务前，先读 [docs/ARCHITECTURE.md](file:///workspace/docs/ARCHITECTURE.md) 和 [docs/DEVELOPMENT.md](file:///workspace/docs/DEVELOPMENT.md)。

---

## 2. UI 编码强制规则

### 2.1 表单元素必须用统一组件库

```tsx
// ✅ 正确
import { Button, Input, Select, Textarea, Modal } from "@/components/ui";

// ❌ 禁止：原生表单元素（守护测试会失败）
<button>...</button>
<input />
<select>...</select>
<textarea />
```

**守护测试**：[__tests__/no-native-form-elements.test.ts](file:///workspace/__tests__/no-native-form-elements.test.ts) 扫描 `components/` 和 `app/` 下所有 `.tsx` 文件（`components/ui/` 除外），发现原生表单元素即失败。

### 2.2 设计令牌是单一事实源

**禁止**以下逃逸值：

```tsx
// ❌ 禁止
<div className="text-[10px] text-[11px] text-[13px]" />
<div className="bg-[#ff5000] border-[#abcdef]" />
<div className="rounded-[13px] shadow-[0_0_10px_red]" />
```

**必须**用 [tailwind.config.ts](file:///workspace/tailwind.config.ts) 定义的令牌：`text-2xs` / `text-xs` / `text-sm` / `rounded-card` / `shadow-card` / `bg-brand-600` 等。

### 2.3 暗色模式必须配对

每一组浅色 utility **必须**带对应的 `dark:` 变体。常见配对见 [docs/ui-design-system.md](file:///workspace/docs/ui-design-system.md) 第 3.2 节。

```tsx
// ✅ 正确
<div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-4" />
<p className="text-gray-500 dark:text-gray-400">辅助文字</p>

// ❌ 禁止（守护测试会失败）
<div className="bg-white p-4" />
<p className="text-gray-400" />
```

**守护测试**：[__tests__/ui-design-system-guard.test.ts](file:///workspace/__tests__/ui-design-system-guard.test.ts) 扫描浅色 utility，要求同 className 内必须带 `dark:` 配对。

### 2.4 模态必须用 `<Modal>`

```tsx
// ✅ 正确：用统一 Modal 组件（内置 focus trap + ARIA + ESC + 焦点恢复）
<Modal open={open} onClose={onClose} titleId="my-title">
  <h2 id="my-title">标题</h2>
  ...
</Modal>

// ❌ 禁止：手写 div 模态（缺 ARIA + focus trap）
<div className="fixed inset-0 bg-black/40" onClick={onClose}>
  <div onClick={(e) => e.stopPropagation()}>...</div>
</div>
```

### 2.5 折叠按钮必须带 `aria-expanded` + `aria-controls`

```tsx
// ✅ 正确
<Button aria-expanded={open} aria-controls="panel-id" onClick={toggle}>
  展开
</Button>
<section id="panel-id" className={open ? "" : "hidden"}>...</section>

// ❌ 禁止
<Button onClick={toggle}>展开</Button>
```

### 2.6 进度条必须带 `role="progressbar"`

```tsx
// ✅ 正确
<div
  role="progressbar"
  aria-valuenow={50}
  aria-valuemin={0}
  aria-valuemax={100}
  aria-label="掌握度 50%"
  className="bg-gray-200 dark:bg-gray-700 rounded-full h-2"
>
  <div style={{ width: "50%" }} />
</div>
```

### 2.7 倒计时必须带 `role="timer"`

```tsx
// ✅ 正确
<div
  role="timer"
  aria-live="off"
  aria-atomic="true"
  aria-label={`剩余 ${seconds} 秒`}
>
  {seconds}
</div>
```

### 2.8 icon-only 按钮必须带 `aria-label`

```tsx
// ✅ 正确
<Button iconOnly aria-label="关闭" onClick={close}>
  <Icon name="x" />
</Button>

// ❌ 禁止
<Button iconOnly onClick={close}>
  <Icon name="x" />
</Button>
```

### 2.9 图标必须用 `<Icon>` 组件，禁止 emoji 当功能图标

```tsx
// ✅ 正确
<Icon name="tomato" className="w-16 h-16 text-red-500" />
<Icon name="alert" className="w-3.5 h-3.5" /> 已被打断

// ❌ 禁止：emoji 当功能图标
<div className="text-5xl">🍅</div>
<span>⚠️ 已被打断</span>
```

**例外**：情绪表情等纯装饰 emoji 允许保留，但应加 `aria-hidden="true"`。

### 2.10 禁止 `div onClick` 当交互元素

```tsx
// ❌ 禁止：div onClick 当按钮（键盘不可访问）
<div onClick={handleClick} className="cursor-pointer">点击</div>

// ✅ 必须用 <Button> 或 <Link>
<Button onClick={handleClick}>点击</Button>
<Link href="/target">点击</Link>
```

如必须用 div（如复杂卡片整体可点击），必须补 `role="button"` + `tabIndex={0}` + `onKeyDown`（Enter/Space）。

---

## 3. 首页 5 区结构（不可破坏）

[app/HomeClient.tsx](file:///workspace/app/HomeClient.tsx) 文件头注释定义了首页 5 区结构：

1. Hero 行动区：CurrentTaskCard + 番茄钟入口 + 低能量休息链接
2. KPI 三宫格：今日待学 / 今日待复习 / 连续打卡
3. AI 教练洞察区：HomeInsightsCard + 能力画像 + AI 质量摘要
4. 今日学习安排：精简 schedule 列表 + 能量趋势迷你图
5. 折叠区：情绪记录 / 错题 / 7 天热力图

**修改首页前必须先读文件头注释**。禁止：
- 堆砌 9+ 个并列区块
- 添加与底部 Nav 重复的快捷入口
- 添加与 HomeInsightsCard 功能重叠的 StatusCard

---

## 4. 测试与质量门禁

### 4.1 提交前必跑

```bash
npm run typecheck       # TypeScript 类型检查
npm run lint            # ESLint (--max-warnings 0)
./node_modules/.bin/vitest run   # 全量测试（必须 100% 通过）
```

### 4.2 守护测试清单

| 测试文件 | 守护内容 |
|---|---|
| [__tests__/no-native-form-elements.test.ts](file:///workspace/__tests__/no-native-form-elements.test.ts) | `components/ui/` 之外禁止原生表单元素 |
| [__tests__/ui-design-system-guard.test.ts](file:///workspace/__tests__/ui-design-system-guard.test.ts) | 浅色 utility 必须带 `dark:` 配对；禁止 `text-[Npx]` 逃逸值 |

**新增设计规则时，应同时新增对应的守护测试**。规则没有测试守护等于不存在。

### 4.3 测试即文档

测试名应该描述规则：
```tsx
it("不允许在 components/ui/ 之外使用原生 <input>/<select>/<textarea>/<button>", () => { ... });
it("浅色 utility 必须带 dark: 配对", () => { ... });
```

---

## 5. 代码风格

### 5.1 TypeScript

- 严格模式（`strict: true`）
- 禁止 `any`，用 `unknown` + 类型守卫
- 优先 `interface`，扩展用 `extends`，联合类型用 `type`
- 所有公共函数和组件 props 必须有显式类型

### 5.2 React

- 组件用 `forwardRef`（除非是页面级组件）
- 状态优先用 `useState`，跨组件用 Context
- 副作用用 `useEffect`，清理函数必须返回
- 列表 `key` 用稳定 id，不用 index

### 5.3 命名

- 组件：`PascalCase`（如 `CurrentTaskCard`）
- 函数/变量：`camelCase`（如 `handleClick`）
- 常量：`UPPER_SNAKE_CASE`（如 `KEY_PREFIXES`）
- 类型：`PascalCase`（如 `Question`）
- 文件名：组件文件 `PascalCase.tsx`，工具文件 `kebab-case.ts`

### 5.4 注释

- 文件头必须有注释，说明组件用途和设计思路
- 复杂逻辑必须有行内注释
- 设计决策（如"为什么用 5 区结构"）写在文件头
- **禁止**仅复述代码的注释（如 `// 设置 state`）

---

## 6. Git 规范

### 6.1 Commit message

用 [Conventional Commits](https://www.conventionalcommits.org/) 格式：

```
<type>(<scope>): <subject>

<body>
```

`type` 取值：
- `feat`：新功能
- `fix`：bug 修复
- `refactor`：重构（无功能变化）
- `style`：样式调整
- `docs`：文档
- `test`：测试
- `chore`：杂项（构建 / 依赖）

### 6.2 分支

- `main`：生产分支，受保护
- 功能开发：从 `main` 切出，PR 合回 `main`

### 6.3 提交粒度

- 一次 commit 解决一个问题
- 不要在一个 commit 里混合多个无关改动
- 大改动拆成多个小 commit（便于 review 和 revert）

---

## 7. 安全规范

详见 [docs/DEVELOPMENT.md](file:///workspace/docs/DEVELOPMENT.md) 安全配置章节。关键点：

- `MASTER_KEY` 是加密会话根密钥，必须配置
- API Key 通过加密 session 传输，不直接暴露
- 旧用户首次访问检测：有 `modelConfig.apiKey` 但无 session → 显示升级提示
- 提供「登出所有设备」按钮调 `revokeSession` 吊销 session

---

## 8. 部署

- 平台：Cloudflare Pages
- 命令：`npm run build`
- 环境变量：`MASTER_KEY`（必配）、`NEXT_PUBLIC_VAPID_PUBLIC_KEY`（推送通知，可选）

---

## 9. 违反守则的后果

| 违反项 | 后果 |
|---|---|
| 用原生表单元素 | `no-native-form-elements.test.ts` 失败 → CI red |
| 浅色 utility 缺 dark 配对 | `ui-design-system-guard.test.ts` 失败 → CI red |
| 用 `text-[10px]` 逃逸值 | `ui-design-system-guard.test.ts` 失败 → CI red |
| 手写 div 模态 | 代码评审打回（暂无测试守护，未来补） |
| 折叠按钮缺 aria-expanded | 代码评审打回（暂无测试守护） |
| emoji 当功能图标 | 代码评审打回（暂无测试守护） |
| 破坏首页 5 区结构 | 代码评审打回 |

---

## 10. 更新本文件

本文件是活文档。新增设计规则、组件、令牌时，**必须**同步更新本文件和 [docs/ui-design-system.md](file:///workspace/docs/ui-design-system.md)。

**规则没有文档等于不存在，文档没有测试守护等于建议。**
