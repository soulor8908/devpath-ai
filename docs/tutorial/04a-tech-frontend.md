# 第 4a 章：技术选型 — 前端

> **视角**：卡帕西（系统思维 / 第一性原理 / 权衡分析 / 关注点分离）
> **前置知识**：读完了 [第 3 章 产品设计](file:///workspace/docs/tutorial/03-product-design.md)；了解 React 基础（组件 / props / state / hooks）
> **本章学什么**：
> 1. 前端框架选型：Next.js 15 vs Remix vs Vite vs Astro
> 2. UI 样式方案：Tailwind vs CSS-in-JS vs CSS Modules
> 3. 状态管理：useState+Context vs Redux vs Zustand vs Jotai
> 4. 表单组件策略：原生+守护测试 vs 统一组件库 vs Radix vs shadcn/ui
> 5. 图表库：Recharts vs Chart.js vs D3 vs Visx vs 自绘 SVG
> **预计阅读时间**：35 分钟
> **关联文档**：[docs/ARCHITECTURE.md](file:///workspace/docs/ARCHITECTURE.md) / [docs/ui-design-system.md](file:///workspace/docs/ui-design-system.md) / [AGENTS.md](file:///workspace/AGENTS.md)

---

## 4a.1 基础概念（初学者先读这节）

在进入对比表之前，先解释几个关键概念：

- **SSR（Server-Side Rendering）**：服务端渲染。页面在服务器生成 HTML 再发给浏览器，首屏快、SEO 好。
- **SSG（Static Site Generation）**：静态站点生成。构建时生成 HTML，部署到 CDN，最快。
- **CSR（Client-Side Rendering）**：客户端渲染。浏览器下载 JS 后渲染，首屏慢但交互流畅。
- **Edge Runtime**：运行在 CDN 边缘节点的 JS 运行时（类似 Node.js 但更轻量），离用户最近，冷启动几乎为零。
- **Server Component**：React 18+ 引入的在服务器渲染的组件，不能有 state 和副作用，发送到客户端的是序列化数据而非 JS。
- **Client Component**：传统的 React 组件，有 state 和副作用，需要发送 JS 到客户端。
- **App Router**：Next.js 13+ 引入的新路由系统，支持 Server Component。
- **Bundle 体积**：浏览器下载的 JS 总大小，影响首屏加载时间。Cloudflare Pages Worker 限制 3MB。
- **守护测试（Guard Test）**：自动扫描代码违规的测试，如"components/ui/ 之外不能有原生 `<input>`"。

---

## 4a.2 F1. 框架选型：Next.js 15 App Router

### 决策

选择 **Next.js 15 App Router**。

### 背景

devpath-ai 是一个本地优先 PWA，需要：
- SSR/SSG 提升首屏速度（Edge Runtime 零冷启动）
- API Routes 内置（不想养独立后端）
- 部署到 Cloudflare Pages（Edge Runtime 兼容）
- 生态成熟（遇到问题能找到答案）

### 对比

| 维度 | Next.js 15 | Remix | Vite + React Router | Astro |
|---|---|---|---|---|
| SSR/SSG | ✅ App Router 全栈 | ✅ Loader/Action | ❌ 需额外配置 | ✅ Islands |
| Edge Runtime | ✅ 原生支持 | ✅ 支持 | ❌ | ✅ 支持 |
| API Routes | ✅ 内置 | ✅ Loader/Action | ❌ 需额外 | ✅ Endpoints |
| Server Component | ✅ 原生（App Router） | ❌（v2 才有） | ❌ | ✅（Islands） |
| 生态成熟度 | ✅ 最大 | 中 | 大（React 生态） | 中 |
| 学习曲线 | 中（App Router 新） | 低 | 低 | 中 |
| Cloudflare 兼容 | ✅ next-on-pages | ✅ 直接 | ✅ 直接 | ✅ 直接 |
| PWA 支持 | ✅（手动配 SW） | ✅ | ✅ | ✅ |
| TypeScript | ✅ 原生 | ✅ | ✅ | ✅ |

### 选择理由（卡帕西视角）

1. **App Router 的 Server/Client Component 边界清晰**：适合"骨架屏 SSR + 交互 CSR"模式。首页 Server Component 做数据预取 + 骨架屏，客户端组件做交互。
2. **next-on-pages 适配 Cloudflare Pages Edge Runtime**：零冷启动，全球 CDN 边缘节点运行。
3. **API Routes 内置**：20 个 Edge API 路由（聊天 / 学习 / 复习 / 节奏 / 限流 / 同步 / 周报 / V3 评审 / V4 作品集 / 鉴权）无需独立后端。
4. **生态最大**：986 测试 + 三层质量护栏 + 守护测试等工程实践都有现成方案。

### 代价

- **App Router 较新**：部分文档滞后，遇到 Edge Case 需要读源码
- **next-on-pages 有 3MB bundle 限制**：preset TS 源文件静态 import 导致 Worker bundle 13MB → 改为运行时 fetch JSON 降到 6.5MB（preset 数据从 `lib/presets/*.ts` 改为 `public/data/presets/{id}.json`）
- **Edge Runtime 限制部分 Node API**：不能用 `fs` / `path` / 原生 `crypto`，需 `nodejs_compat` flag + `lib/ai/crypto.ts` 封装 Web Crypto API

### 踩过的坑

- **preset bundle 爆炸**：详见 [appendix/pitfalls.md](file:///workspace/docs/tutorial/appendix/pitfalls.md) "preset bundle 爆炸" 条目
- **React 19 + Next.js 15 的 cache 默认行为变化**：fetch 默认 no-store，需显式 `cache: 'force-cache'`

---

## 4a.3 F2. UI 样式方案：Tailwind CSS 3.4

### 决策

选择 **Tailwind CSS 3.4** + 设计令牌（`tailwind.config.ts` 定义）。

### 背景

devpath-ai 需要：
- 暗色模式（强制配对，守护测试扫描）
- 设计令牌单一事实源（禁止 `text-[10px]` 逃逸值）
- 守护测试可扫描（`ui-design-system-guard.test.ts` 检查浅色 utility 是否带 `dark:` 配对）
- Bundle 体积小（Tailwind 只生成用到的 class）

### 对比

| 维度 | Tailwind CSS | CSS-in-JS (styled-components) | CSS Modules | Vanilla Extract |
|---|---|---|---|---|
| 编译时 / 运行时 | 编译时（零运行时） | 运行时（JS 注入 CSS） | 编译时 | 编译时 |
| Bundle 体积 | ✅ 小（Purge 未用 class） | ❌ 大（含运行时） | ✅ 小 | ✅ 小 |
| 暗色模式 | ✅ `dark:` 前缀 | ✅ 主题对象 | ✅ `:global(.dark)` | ✅ 主题合约 |
| 守护测试可扫描 | ✅（正则匹配 className） | ❌（在 JS 里） | ✅ | ✅ |
| 设计令牌 | ✅ `tailwind.config.ts` | ✅ 主题对象 | ❌（需手写） | ✅ 主题合约 |
| TypeScript 类型 | ❌（className 是字符串） | ✅（主题对象） | ❌ | ✅ |
| 学习曲线 | 低（utility-first） | 中 | 低 | 中 |
| SSR 友好 | ✅ | ❌（需兜底样式） | ✅ | ✅ |

### 选择理由（卡帕西视角）

1. **守护测试可扫描**：`ui-design-system-guard.test.ts` 用正则匹配 className 中的 `text-[10px]` 逃逸值 + 检查浅色 utility 是否带 `dark:` 配对。CSS-in-JS 在 JS 里写样式，扫描成本高。
2. **设计令牌单一事实源**：`tailwind.config.ts` 定义所有令牌（`text-2xs` / `rounded-card` / `bg-brand-600` 等），守护测试强制禁止 `text-[10px]` / `bg-[#ff5000]` 逃逸值。
3. **Bundle 体积小**：Tailwind Purge 只生成用到的 class，比 CSS-in-JS 含运行时小很多。
4. **SSR 友好**：CSS-in-JS 需要兜底样式（ServerStyleSheet），Tailwind 直接生成 CSS 文件。

### 代价

- **className 较长**：`className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-4"` 比 `className="card"` 长很多
- **TypeScript 类型弱**：className 是字符串，IDE 不能补全 class 名（但有 Tailwind CSS IntelliSense 插件缓解）
- **重复模式**：相同组合需提取成组件（如 `<Card>`）或用 `@apply`（本项目用统一组件库解决）

### 踩过的坑

- **暗色配对遗忘**：写 `bg-white` 忘了 `dark:bg-gray-800`，守护测试失败。已用 `ui-design-system-guard.test.ts` 强制。
- **逃逸值诱惑**：想快速调一个 `text-[11px]`，被守护测试拦截。正确做法是加 `text-2xs` 令牌到 `tailwind.config.ts`。

---

## 4a.4 F3. 状态管理：useState + Context

### 决策

选择 **useState + Context**（轻量，不引入额外状态库）。

### 背景

devpath-ai 的状态分两类：
- **服务端状态**（FSRS 卡片 / 学习计划 / 用户画像）：用 IndexedDB + 5min TTL 缓存，不需要全局状态库
- **UI 状态**（modal 开关 / 当前选中项 / 表单临时值）：用 useState + Context 足够

### 对比

| 维度 | useState+Context | Redux Toolkit | Zustand | Jotai |
|---|---|---|---|---|
| 学习曲线 | ✅ 低（React 原生） | 中（action/reducer/selectors） | 低 | 中（原子思维） |
| Bundle 体积 | ✅ 0 KB（React 内置） | ~3KB | ~1KB | ~2KB |
| 模板代码 | 中（Context + Provider） | ❌ 多（action/reducer/types） | ✅ 少 | ✅ 少 |
| DevTools | ❌（需自建） | ✅ 强大 | ✅ 有 | ✅ 有 |
| 异步处理 | ✅ useEffect | ✅ createAsyncThunk | ✅ | ✅ |
| 适合场景 | 中小型 + UI 状态 | 大型 + 复杂业务 | 中型 + 轻量 | 原子化状态 |
| TypeScript | ✅ | ✅（但模板多） | ✅ | ✅ |

### 选择理由（卡帕西视角）

1. **YAGNI 原则**：devpath-ai 的状态复杂度不高，IndexedDB 缓存层已经处理了服务端状态，UI 状态用 useState + Context 足够。引入 Redux / Zustand 是过度工程。
2. **零依赖**：不增加 bundle 体积，不增加学习成本。
3. **React 原生**：Context + useReducer 能覆盖大部分场景，且与 React 19 的 Server Component 兼容性最好。
4. **关注点分离**：服务端状态（IndexedDB + 缓存）vs UI 状态（useState + Context）边界清晰。

### 代价

- **Context 性能**：Context value 变化会让所有 consumer 重渲染。devpath-ai 用拆分 Context（如 `ToastContext` / `TimerContext` 分离）+ `useMemo` 优化。
- **无 DevTools**：调试状态变化不如 Redux DevTools 直观。用 `console.log` + React DevTools 替代。
- **异步处理需手写**：用 `useEffect` + `useCallback`，没有 `createAsyncThunk` 的自动化。

### 踩过的坑

- **Context 性能陷阱**：早期把所有状态塞进一个 `AppContext`，导致任何变化都重渲染整棵树。改为按域拆分（`ToastContext` / `TimerContext` / `ProfileContext`）。
- **useEffect 死循环**：`useCallback(refresh, [router])` + `useEffect(refresh)` 链式依赖，router 引用抖动触发无限渲染。详见 [07-iteration.md](file:///workspace/docs/tutorial/07-iteration.md) Phase 8。

---

## 4a.5 F4. 表单组件策略：统一组件库 + 守护测试

### 决策

选择 **统一组件库**（`components/ui/` 16 个组件）+ **守护测试**（`no-native-form-elements.test.ts` 强制）。

### 背景

devpath-ai 需要：
- 一致的设计令牌（颜色 / 圆角 / 阴影 / 字号）
- 无障碍（a11y）：Modal focus trap / ARIA / ESC / 焦点恢复
- 暗色模式配对
- 防止开发者偷懒用原生 `<input>` / `<button>`

### 对比

| 维度 | 原生+守护测试 | 统一组件库 | Radix（Headless） | shadcn/ui |
|---|---|---|---|---|
| 一致性 | ❌（每个开发者自写） | ✅（统一） | ✅（Headless） | ✅（基于 Radix） |
| 无障碍 | ❌（需手写） | ✅（内置） | ✅（内置） | ✅（内置） |
| 设计令牌 | ❌（易逃逸） | ✅（强制） | ❌（需自配） | ✅ |
| 守护测试 | ✅（拦截原生） | ✅（拦截原生） | ❌（不拦截原生） | ❌ |
| 学习曲线 | ✅ 低（HTML） | 中（学 API） | 中 | 中 |
| 灵活性 | ✅ 最高 | 中 | ✅ 高 | ✅ 高 |
| Bundle 体积 | ✅ 0 | 中（自己写） | 中（Headless） | 中 |

### 选择理由（卡帕西视角）

1. **契约层优先**：`no-native-form-elements.test.ts` 扫描 `components/` 和 `app/` 下所有 `.tsx` 文件（`components/ui/` 除外），发现原生 `<input>` / `<select>` / `<textarea>` / `<button>` 即失败。这是"契约"，不是"建议"。
2. **设计令牌单一事实源**：统一组件库内部用 `text-2xs` / `rounded-card` / `bg-brand-600` 等令牌，禁止逃逸值。
3. **无障碍内置**：`<Modal>` 内置 focus trap + ARIA + ESC + 焦点恢复；`<Button iconOnly>` 强制 `aria-label`；进度条强制 `role="progressbar"`。
4. **暗色模式配对**：组件内部已配对 `dark:` 变体，开发者不用关心。

### 16 个统一组件清单

引用自 [components/ui/index.ts](file:///workspace/components/ui/index.ts)：

```
Button / Input / Select / Textarea / Modal / Checkbox / Switch /
Slider / FormField / LinkButton / EmptyState / Skeleton / ProgressBar /
LoadingScreen / Kbd / ToastContainer
```

### 代价

- **组件库需维护**：16 个组件需要持续维护（修复 bug / 加新功能 / 适配 React 19）
- **灵活性受限**：特殊场景下需绕过组件库（如复杂的自定义表单），但守护测试要求"绕过"只能在 `components/ui/` 内
- **学习成本**：新开发者需学习 16 个组件的 API

### 踩过的坑

- **早期用原生 `<input>`**：写起来快，但暗色模式 / a11y / 设计令牌都不一致。引入守护测试后强制统一。
- **Modal 缺 focus trap**：早期手写 `<div className="fixed inset-0">`，键盘用户无法 ESC 关闭 + 焦点跑出 modal。改为统一 `<Modal>` 后内置。

---

## 4a.6 F5. 图表库：Recharts（懒加载）

### 决策

选择 **Recharts**（懒加载）。

### 背景

devpath-ai 需要的图表：
- 7 天热力图（学习强度）
- 能力雷达图（6 维用户画像）
- 能量趋势迷你图

### 对比

| 维度 | Recharts | Chart.js | D3.js | Visx | 自绘 SVG |
|---|---|---|---|---|---|
| 学习曲线 | ✅ 低（React 组件） | 中（Canvas API） | ❌ 高（DSL） | 中（D3 + React） | 中 |
| 灵活性 | 中 | 中 | ✅ 最高 | ✅ 高 | ✅ 最高 |
| Bundle 体积 | ❌ 大（~150KB） | 中（~70KB） | ❌ 最大（~270KB） | 中（按需） | ✅ 0 |
| React 集成 | ✅ 原生 | ❌（需 wrapper） | ❌ | ✅ | ✅ |
| 暗色模式 | ✅（prop 配置） | ✅ | ✅（手写） | ✅ | ✅ |
| 响应式 | ✅（Container） | ✅ | ❌（需手写） | ✅ | ❌ |
| SVG / Canvas | SVG | Canvas | SVG | SVG | SVG |

### 选择理由（卡帕西视角）

1. **React 原生集成**：Recharts 是 React 组件，与现有代码风格一致。Chart.js 需 wrapper，D3 是命令式 DSL。
2. **懒加载解决 bundle 体积**：Recharts ~150KB 较大，用外壳组件 + 懒加载内容组件解决（[components/Heatmap.tsx](file:///workspace/components/Heatmap.tsx) + [components/RadarChart.tsx](file:///workspace/components/RadarChart.tsx)）：
   ```tsx
   // 外壳（轻量，立即可见）
   export function Heatmap() {
     return <Suspense fallback={<Skeleton />}><HeatmapContent /></Suspense>;
   }
   // 内容（重，懒加载）
   const HeatmapContent = lazy(() => import('./HeatmapContent'));
   ```
3. **响应式内置**：`<ResponsiveContainer>` 自动适配父容器宽度，移动端友好。
4. **暗色模式**：通过 prop 配置（`<RadarChart dark={isDark} />`），不用手写 CSS。

### 代价

- **Bundle 体积大**：~150KB，必须懒加载
- **灵活性中**：定制特殊图表（如热力图的 SVG rect 点击）需用 `cloneElement` hack
- **SVG 性能**：大数据集（>1000 点）比 Canvas 慢，但 devpath-ai 的数据集小（7 天 / 6 维），够用

### 踩过的坑

- **热力图 SVG rect 点击**：Recharts 不直接支持 rect 点击，需用 `cloneElement` 注入 onClick。禁止 div 包裹破坏 SVG。
- **Recharts + React 19 兼容性**：早期版本有 peer dep 警告，需 `--legacy-peer-deps` 或等 Recharts 适配。

---

## 4a.7 章节小结：前端技术栈一览

| 层 | 选型 | 理由 |
|---|---|---|
| 框架 | Next.js 15 App Router | SSR + Edge + API Routes 内置 |
| UI 样式 | Tailwind CSS 3.4 + 设计令牌 | 守护测试可扫描 + 单一事实源 |
| 状态管理 | useState + Context | YAGNI + 零依赖 |
| 表单组件 | 统一组件库（16 个）+ 守护测试 | 契约层优先 + a11y 内置 |
| 图表库 | Recharts（懒加载） | React 原生 + 响应式 + 暗色模式 |

---

## 本章小结

**学到了什么**：
1. Next.js 15 App Router 的选择理由：SSR + Edge + API Routes，代价是 bundle 限制 + Node API 限制
2. Tailwind 的选择理由：守护测试可扫描 + 设计令牌单一事实源，代价是 className 较长
3. useState + Context 的选择理由：YAGNI + 零依赖，代价是 Context 性能需拆分优化
4. 统一组件库 + 守护测试的选择理由：契约层优先 + a11y 内置，代价是组件库需维护
5. Recharts 懒加载的选择理由：React 原生 + 响应式，代价是 bundle 体积大需懒加载

**关键决策回顾**：
1. **守护测试是契约**：`no-native-form-elements.test.ts` + `ui-design-system-guard.test.ts` 不是建议是强制
2. **懒加载解决 bundle**：Recharts 等重库用外壳 + 懒加载内容组件模式
3. **YAGNI 原则**：状态管理不引入 Redux / Zustand，用 React 原生足够

## 下一章衔接

下一章 [04b-tech-backend.md](file:///workspace/docs/tutorial/04b-tech-backend.md) 讲后端与存储技术选型：本地存储（IndexedDB）/ 云端存储（Cloudflare KV）/ 数据同步策略 / API 路由 / 数据校验。

## 延伸阅读

- [Next.js App Router 文档](https://nextjs.org/docs/app)
- [Tailwind CSS 文档](https://tailwindcss.com/docs)
- [Recharts 文档](https://recharts.org/)
- [AGENTS.md](file:///workspace/AGENTS.md) — UI 编码强制规则
