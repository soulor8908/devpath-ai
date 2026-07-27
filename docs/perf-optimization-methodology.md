# 性能优化方法论 — 定期审计与修复手册

> **地位**：本项目性能优化的标准操作手册（SOP），与 [docs/code-audit-methodology.md](file:///workspace/docs/code-audit-methodology.md) 互补。
> **触发**：里程碑发布前 / 每月定期 / 用户反馈性能问题时。
> **目标**：在不破坏功能的前提下，持续降低首屏体积、提升加载速度、消除重复代码。

---

## 0. 三层质量护栏（与 AGENTS.md 第 3.4 节对齐）

| 层 | 触发时机 | 工具 | 内容 |
|---|---|---|---|
| **预防** | 写代码前 | AGENTS.md 第 2 节 + ui-design-system.md | 设计令牌 + 统一组件 + 暗色配对 |
| **检测** | 每次 commit | `__tests__/*-guard.test.ts` | 守护测试拦截违规 |
| **审计** | 里程碑 / 定期 | 本文档 + 多轮深度审计 | 系统性扫描技术债 |

三层缺一不可。

---

## 1. 审计准备（5 分钟）

```bash
# 1. 拉取最新 main，切出审计分支
git checkout main && git pull
git checkout -b perf-audit-YYYY-MM-DD

# 2. 跑一遍守护测试，确认基线 green
npm run typecheck
npm run lint
./node_modules/.bin/vitest run
```

如基线 red，先修复再审计——不要在 red 基线上叠加改动。

---

## 2. 七步审计清单

### 步骤 1：打包体积分析（10 分钟）

```bash
# 生产构建 + 分析报告
NEXT_PUBLIC_STATIC_EXPORT=false npm run build
# （如装了 @next/bundle-analyzer）
ANALYZE=true npm run build
```

**关注点**：
- First Load JS 是否超过 200KB（统计页 / 首页）
- 是否有 vendor chunk 超过 100KB（recharts / d3 / ai-sdk / html-to-image）
- 是否有路由 chunk 重复打包公共依赖

**修复策略**：
- 大依赖 → `next/dynamic` + `ssr:false` 懒加载（参考 [components/Heatmap.tsx](file:///workspace/components/Heatmap.tsx) 模式）
- 函数内一次性依赖 → 函数内 `await import()`（参考 [lib/share-image.ts](file:///workspace/lib/share-image.ts) 模式）
- 跨路由共享 vendor → `next.config.js` 的 `splitChunks.cacheGroups` 拆独立 chunk

### 步骤 2：首屏加载性能（10 分钟）

**关注点**：
- 路由跳转期间是否白屏（无 `loading.tsx`）
- 全局浮窗组件是否进了首屏 bundle
- 是否有大图片未压缩

**修复策略**：
- 每个路由必有 `loading.tsx`（参考 [app/review/loading.tsx](file:///workspace/app/review/loading.tsx)，用 `<RouteLoading>`）
- 全局浮窗 → `app/layout.tsx` 用 `dynamic(..., { ssr: false, loading: () => null })`
- 关键路由的 client component → 拆出 Suspense fallback

### 步骤 3：重复代码扫描（15 分钟）

**关注点**：

| 类型 | 工具 | 命令 |
|---|---|---|
| 完全相同的函数 | Grep 同名函数 + 字节比对 | `Grep pattern="^function formatDate"` |
| 重复的 UI 模式 | 应抽组件 | `Grep pattern="role=\"progressbar\""` |
| 重复的 loading 占位 | 应抽 `<LoadingScreen>` | `Grep pattern="加载中\\.\\.\\."` |
| 重复的 useEffect+listItems 模式 | 应抽 hook | `Grep pattern="listItems.*KEY_PREFIXES"` |

**修复策略**：
- 工具函数 → 抽到 `lib/<domain>.ts`（如 `lib/time.ts` 的 `formatISODate`）
- UI 模式 → 抽到 `components/ui/<Name>.tsx` 并加入 `components/ui/index.ts` 导出
- Hook 模式 → 抽到 `lib/hooks/use-<name>.ts`

### 步骤 4：大组件拆分（30 分钟，按需）

**关注点**：超过 500 行的组件文件。

**修复策略**：
- 按 phase / view / section 拆子组件
- 把纯函数（词法分析、数据转换）抽到 `lib/`
- 把内部子组件抽到同目录的 `<ParentContent>.tsx`，配合 `next/dynamic` 懒加载

**模板**（参考 [components/Heatmap.tsx](file:///workspace/components/Heatmap.tsx) + [components/HeatmapContent.tsx](file:///workspace/components/HeatmapContent.tsx)）：

```tsx
// Parent.tsx — 数据加载 + 派生计算（轻量）
const Child = dynamic(() => import("./Child").then(m => m.Child), {
  loading: () => <Skeleton variant="rect" height="h-80" />,
  ssr: false,
});

// Child.tsx — 重依赖渲染（按需加载）
```

### 步骤 5：React 性能（15 分钟）

**关注点**：
- 列表是否带稳定 `key`
- useEffect 依赖是否完整（防 effect 抖动）
- 大型 useMemo / useCallback 是否合理
- context value 是否每次重建

**修复策略**：
- 列表 key 用 id，不用 index
- context value 用 useMemo 包裹
- 高频回调用 useCallback

### 步骤 6：分包拆包（10 分钟）

检查 `next.config.js`：
- `experimental.optimizePackageImports` 列表是否覆盖所有 barrel export 库
- `webpack.splitChunks.cacheGroups` 是否覆盖所有大 vendor

每加一个新依赖（>30KB）就评估是否要加入分包配置。

### 步骤 7：资源优化（10 分钟）

- 图片：用 WebP / AVIF，配 `next/image` 自动优化（注意 `images.unoptimized: true` 时需手动）
- 字体：用 `next/font` 自托管，避免 Google Fonts 跨域
- Service Worker：检查 `public/sw.js` 缓存策略是否合理

---

## 3. 修复流程（按优先级）

| 优先级 | 类型 | 风险 | 示例 |
|---|---|---|---|
| **P0** | 工具函数去重 | 极低 | `formatISODate` 三处合并 |
| **P0** | 漏 ARIA 的进度条等 | 低 | `ProgressBar` 统一组件 |
| **P0** | 漏 dark: 配对 | 低 | 用 `ui-design-system-guard.test.ts` 检测 |
| **P1** | 缺 `loading.tsx` | 低 | 17 个路由批量补 |
| **P1** | 大依赖未懒加载 | 中 | `next/dynamic` + 测试 |
| **P2** | 大组件拆分 | 中 | 拆 + 守护测试 |
| **P3** | Hook 抽取 | 中 | 逐页迁移 + 测试 |

**修复顺序**：先 P0（低风险高收益）→ 再 P1（中风险中收益）→ 最后 P2/P3（需测试）。

---

## 4. 验证流程

```bash
# 1. 类型检查
npm run typecheck

# 2. Lint
npm run lint

# 3. 全量测试
./node_modules/.bin/vitest run

# 4. 守护测试单独跑一遍
./node_modules/.bin/vitest run __tests__/no-native-form-elements.test.ts
./node_modules/.bin/vitest run __tests__/ui-design-system-guard.test.ts
./node_modules/.bin/vitest run __tests__/content-generation-standard.test.ts
./node_modules/.bin/vitest run __tests__/preset-content-quality.test.ts
./node_modules/.bin/vitest run __tests__/prompts.test.ts

# 5. 生产构建
npm run build

# 6. 启动预览，肉眼检查关键路由
npm run start
# 访问 /, /review, /train, /learn/<planId>, /stats, /profile
```

---

## 5. 已完成的优化（2026-07-26）

**Bug 修复**：
- `components/TrainSessionFlow.tsx` `handleAnswerCorrect` 改 async + await 写库再 dispatch
- `loadCurrentTask` 优先选节点下未看懂的题，避免重复展示已答对题目
- 补 toast 提示，让用户感知"我答对了"已记录

**性能优化**：
- `next.config.js`：新增 `experimental.optimizePackageImports`（recharts / date-fns / ai-sdk 等）+ `webpack.splitChunks`（recharts-vendor / ai-sdk-vendor）
- `app/layout.tsx`：FloatingChat / PomodoroWidget / AITaskModal 改 `dynamic` + `ssr:false`
- `lib/share-image.ts`：html-to-image + qrcode 改函数内 dynamic import（首屏不加载）
- `components/Heatmap.tsx`：拆出 `HeatmapContent.tsx`，react-activity-calendar 懒加载
- `components/RadarChart.tsx`：已懒加载 recharts（保持）

**新增统一组件**：
- `components/ui/ProgressBar.tsx` — 4 size × 5 color，自带 ARIA + dark 配对
- `components/ui/LoadingScreen.tsx` — 全屏加载态，统一文案 + spinner + ARIA
- `components/RouteLoading.tsx` — 4 variant（list / detail / chart / form）路由级骨架屏

**新增 loading.tsx**：
- 18 个路由：review / train / learn/[planId] / stats / profile / u/[username] / mistakes / interview / achievements / favorites / portfolio / daily / emotion / rest / onboarding / learn/list / learn/[planId]/edit / stats/ai-quality / u/[username]/portfolio / docs

**工具函数去重**：
- `formatISODate` 抽到 `lib/time.ts`（替换 3 处拷贝）
- `formatCountdown` 抽到 `lib/timer/format.ts`（替换 2 处拷贝）
- `extractUpdatedAtFromValue` 从 `dexie-db.ts` export，`db.ts` 改 import

---

## 6. 已完成的优化（2026-07-27）

**Bug 修复**：
- `lib/home.ts` `useHomeData` 加窗口聚焦自动 reload（监听 `visibilitychange` + `window.focus`，3 秒节流）——修复"训练页学会了，回首页 PathProgressBar 进度不更新 + 已 mastered 节点仍在今日清单"
- `lib/home.ts` `deriveCareerPath` 进度从节点维度改成题目维度（`understoodCount / totalQuestions × 100`）——每答对一题进度条 +1/N，避免节点 8 题答对 7 题仍显示 0%
- `lib/study-queue/build-study-queue.ts` 学习队列从节点维度改成题目维度（一题一 task，已 understood 的题不进队列）
- 删除"今天还没开始，从第一个知识点开始吧"提示（streak === 0 提醒，用户反馈变成噪音）

**部署失败闭环修复**：
- `app/layout.tsx` 拆出 `app/GlobalWidgets.tsx`（Client Component）承载 `ssr:false` dynamic import——Next.js 15 不允许 Server Component 用 `ssr:false`
- `.husky/pre-push` 改为 4 层门禁：`lint + typecheck + test + build`，任一失败立即终止
- `__tests__/pre-push-hook-guard.test.ts` 守护 hook 不被误删/降级
- 详见 [AGENTS.md 第 2.14 节](file:///workspace/AGENTS.md) / [坑 16-17](file:///workspace/docs/tutorial/appendix/pitfalls.md)

**重名计划校验**：
- `lib/plan-summary.ts` 新增 `checkOverwriteOrCreate(topic)`，3 个创建入口（预设导入 / AI 向导 / Onboarding）统一调用
- 详见 [DEVELOPMENT.md "创建学习计划必须查重"](file:///workspace/docs/DEVELOPMENT.md)

---

## 7. 待办（P2/P3，后续优化）

按优先级排序，**非阻塞当前发布**：

### P2 — 中等优先级
1. **`useIndexedDBLoad` hook** — 封装 `useEffect + listItems + setState + setLoading` 模式（10+ 处复用）
2. **`Section` / `Card` 组件** — 抽到 `components/ui/`（4 处复用）
3. **`StatCard` 组件** — 抽到 `components/ui/`（3 处复用）
4. **`ProgressRing` 组件** — 抽到 `components/ui/Progress.tsx`，与 ProgressBar 合并
5. **`useDraggableFloatingPosition` hook** — 封装浮窗拖拽 + 位置持久化（2 处复用）
6. **大组件拆分**：`ChatClient.tsx` (1772 行) / `PlanDetailClient.tsx` (1318 行) / `profile/page.tsx` (1178 行)
7. **`CodeBlock.tsx`** — 把 `tokenize` 纯函数抽到 `lib/code-tokenizer.ts`

### P3 — 低优先级
1. `escapeHtml` 抽到 `lib/escape.ts`
2. `urlBase64ToUint8Array` 抽到 `lib/push.ts`
3. `formatRelative` / `relativeTime` 合并到 `lib/time.ts`
4. `FloatingChatButton` / `PomodoroWidget` 共享拖拽 hook
5. 卡片容器 Tailwind 类名串统一到 `<Card>` 组件

---

## 8. 审计报告模板

每次审计完成后，在 `docs/superpowers/plans/` 下创建报告：

```
docs/superpowers/plans/YYYY-MM-DD-perf-audit.md
```

报告应包含：
1. 审计范围（哪些目录 / 哪些路由）
2. 发现的问题（按 P0/P1/P2/P3 分级）
3. 已修复内容（含代码 diff 链接）
4. 待办清单（含责任人与截止时间）
5. 性能指标对比（首屏 JS 体积 / Lighthouse 评分）

---

## 9. 与 AGENTS.md 的关系

本文件不替代 AGENTS.md，是其性能优化场景的展开。任何冲突以 AGENTS.md 为准。

**关键约束**（不可违反）：
- 第 2.1：表单元素必须用统一组件库
- 第 2.2：设计令牌是单一事实源
- 第 2.3：暗色模式必须配对
- 第 2.6：进度条必须带 `role="progressbar"`
- 第 2.13：学习路径节点必须自带深度内容
- 第 9 节：AI 内容生成规范（不可削弱质量宪章）

任何"性能优化"导致的违规都会让 CI red，不被接受。
