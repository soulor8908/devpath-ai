# Tasks

按「基础设施 → 单点修复 → 流程重构 → 体验优化 → 合并」分阶段推进。每个 Task 都是可独立验证的小工作单元。

## 阶段 0：全局 Toast 组件（基础设施，所有后续任务依赖）

- [ ] Task 0.1: 创建 `lib/toast.ts` Toast 状态管理
  - [ ] SubTask 0.1.1: 定义 `ToastType = "success" | "error" | "warning" | "info"` 类型
  - [ ] SubTask 0.1.2: 定义 `ToastItem` interface（id / type / message / durationMs / createdAt）
  - [ ] SubTask 0.1.3: 实现 `pushToast(type, message, durationMs?)` 返回 toast id
  - [ ] SubTask 0.1.4: 实现 `dismissToast(id)` 移除单个
  - [ ] SubTask 0.1.5: 实现 `subscribeToasts(callback)` 订阅模式（供 React hook 订阅）
  - [ ] SubTask 0.1.6: 实现 `toast.success/error/warning/info` 4 个快捷方法
- [ ] Task 0.2: 创建 `lib/hooks/use-toast.ts` React hook
  - [ ] SubTask 0.2.1: `useToasts()` 返回当前 toast 列表（订阅 store）
  - [ ] SubTask 0.2.2: `useDismissToast()` 返回 dismiss 函数
- [ ] Task 0.3: 创建 `components/Toast.tsx` Toast 渲染组件
  - [ ] SubTask 0.3.1: 顶部居中堆叠展示（z-index 9999）
  - [ ] SubTask 0.3.2: 4 种类型颜色：success=green / error=red / warning=amber / info=blue
  - [ ] SubTask 0.3.3: 自动消失定时器（durationMs 后调 dismiss）
  - [ ] SubTask 0.3.4: 鼠标 hover 暂停定时器
  - [ ] SubTask 0.3.5: dark mode 适配（对比度审计）
  - [ ] SubTask 0.3.6: 进出动画（slide-down + fade）
- [ ] Task 0.4: 创建 `lib/confirm-dialog.ts` Promise 化 confirm
  - [ ] SubTask 0.4.1: 定义 `ConfirmOptions` interface（title / message / confirmText / cancelText / danger?）
  - [ ] SubTask 0.4.2: 实现 `confirmDialog(options): Promise<boolean>` 返回 Promise
  - [ ] SubTask 0.4.3: 内部用 toast store 推送一个 type=confirm 的特殊 toast，用户点击后 resolve
  - [ ] SubTask 0.4.4: 在 `Toast.tsx` 中渲染 confirm 类型 toast（带两个按钮，不自动消失）
- [ ] Task 0.5: 在 `app/layout.tsx` 注入 `<ToastContainer />`
  - [ ] SubTask 0.5.1: 在 body 末尾、Nav 之前渲染 `<ToastContainer />`
  - [ ] SubTask 0.5.2: ToastContainer 内部用 `useToasts()` 订阅并渲染所有 toast
- [ ] Task 0.6: 单测 `__tests__/toast.test.ts`
  - [ ] SubTask 0.6.1: pushToast 后 subscribeToasts 收到新增
  - [ ] SubTask 0.6.2: dismissToast 后列表更新
  - [ ] SubTask 0.6.3: confirmDialog Promise 在用户确认后 resolve true

## 阶段 1：番茄时钟 404 修复 + 全屏方向

- [ ] Task 1.1: 排查 `/timer` 404 根因
  - [ ] SubTask 1.1.1: 本地 `npm run dev` 访问 `/timer` 复现 404
  - [ ] SubTask 1.1.2: 检查 `app/timer/page.tsx` 是否被 `next.config.js` 误排除
  - [ ] SubTask 1.1.3: 检查 `PomodoroFull.tsx` 的 init() 是否在 SSR 阶段抛错（IndexedDB 在 server 端不可用）
  - [ ] SubTask 1.1.4: 若是 SSR 问题，将 `app/timer/page.tsx` 改为 `"use client"` 或动态 import `PomodoroFull`
  - [ ] SubTask 1.1.5: 验证 `npm run build` 后访问 `/timer` 不再 404
- [ ] Task 1.2: 改造 `lib/hooks/use-auto-fullscreen.ts` 为主动触发
  - [ ] SubTask 1.2.1: 移除 `useEffect` 中 `setNeedsPrompt(true)` 自动弹窗逻辑
  - [ ] SubTask 1.2.2: `enterFullscreen` 增加 `screen.orientation.lock("portrait")` 调用（不支持时静默 catch）
  - [ ] SubTask 1.2.3: 新增 `enterFullscreenOnce()` 首次进入时持久化偏好到 localStorage（key=`fullscreen:dismissed`）
  - [ ] SubTask 1.2.4: 后续访问若 `fullscreen:dismissed === "true"` 则不再自动提示（保留按钮可见）
- [ ] Task 1.3: 学习详情页接入「全屏专注」按钮
  - [ ] SubTask 1.3.1: 在 `app/learn/[planId]/PlanDetailClient.tsx` 头部按钮区新增「全屏专注」按钮（图标 + 文案）
  - [ ] SubTask 1.3.2: 点击调用 `fullscreen.enterFullscreen()`，触发后用 toast.info 提示「已进入全屏，按 Esc 退出」
  - [ ] SubTask 1.3.3: 移除 `<FullscreenPrompt>` 渲染（保留组件文件不删，仅不渲染）
- [ ] Task 1.4: 番茄页头部新增「全屏」按钮
  - [ ] SubTask 1.4.1: 在 `components/PomodoroFull.tsx` 表单视图与运行视图头部新增「全屏」按钮
  - [ ] SubTask 1.4.2: 复用 `useAutoFullscreen().enterFullscreen()` 逻辑
- [ ] Task 1.5: 单测 `__tests__/use-auto-fullscreen.test.ts` 更新
  - [ ] SubTask 1.5.1: 默认 `needsPrompt === false`（不再自动弹）
  - [ ] SubTask 1.5.2: `enterFullscreen()` 调用 `screen.orientation.lock`

## 阶段 2：用户 ID 脱敏与安全

- [ ] Task 2.1: 扩展 `lib/username-mask.ts` 新增 `maskUserId(userId)` 函数
  - [ ] SubTask 2.1.1: `maskUserId` 规则：长度 ≤ 8 时显示前 2 + `****` + 后 2；长度 > 8 时显示前 4 + `****` + 后 4
  - [ ] SubTask 2.1.2: 空 ID 返回空串
- [ ] Task 2.2: 改造 `components/SyncStatus.tsx` userId 输入框脱敏
  - [ ] SubTask 2.2.1: 默认显示 `maskUserId(userId)`（readOnly + 脱敏值）
  - [ ] SubTask 2.2.2: 新增「显示完整 ID」按钮，点击切换为明文显示
  - [ ] SubTask 2.2.3: 复制按钮始终复制完整 userId（用户自己复制自己 ID 不算泄露）
  - [ ] SubTask 2.2.4: 「导入已有 ID」流程增加 `confirmDialog` 二次确认（防止误粘贴他人 ID）
- [ ] Task 2.3: 单测 `__tests__/username-mask.test.ts` 新增 `maskUserId` 测试
  - [ ] SubTask 2.3.1: 长度 12 的 ID 脱敏为前 4 + **** + 后 4
  - [ ] SubTask 2.3.2: 长度 6 的 ID 脱敏为前 2 + **** + 后 2
  - [ ] SubTask 2.3.3: 空 ID 返回空串

## 阶段 3：放开 API Token 限制

- [ ] Task 3.1: 改造 `lib/auth.ts` `requireAuth`
  - [ ] SubTask 3.1.1: 移除「未配置 API_TOKEN 时生产环境返回 503」逻辑
  - [ ] SubTask 3.1.2: 新增 `process.env.REQUIRE_API_TOKEN === "true"` 才启用 token 校验
  - [ ] SubTask 3.1.3: 503 错误文案改为：「未配置 AI 模型。请在『我的 → AI 模型配置』中添加模型（含 API Key、baseURL、模型名），并设为默认。」
  - [ ] SubTask 3.1.4: 移除「用户信息未找到」相关误导文案
- [ ] Task 3.2: 单测 `__tests__/auth.test.ts` 更新
  - [ ] SubTask 3.2.1: `useServerModel=true` 且未配置 API_TOKEN 时返回 null（放行）
  - [ ] SubTask 3.2.2: `useServerModel=true` 且 `REQUIRE_API_TOKEN=true` 且 token 不匹配时返回 401
  - [ ] SubTask 3.2.3: `useServerModel=false` 始终放行

## 阶段 4：学习流程重构（核心，依赖阶段 0）

- [ ] Task 4.1: 创建 `app/api/learn/knowledge/route.ts` 拆知识点 API
  - [ ] SubTask 4.1.1: 复用 `decomposeKnowledge` 但只返回 `{ nodes: KnowledgeNode[] }`
  - [ ] SubTask 4.1.2: 接入 `requireAuth` + KV 限流（scene=`knowledge_decompose`，配额 5/天）
  - [ ] SubTask 4.1.3: 接入 `recordAICall` 质量追踪
- [ ] Task 4.2: 创建 `app/api/learn/questions/route.ts` 生成题目 API
  - [ ] SubTask 4.2.1: 入参 `{ nodes: KnowledgeNode[], topic: string, prompt?: string }`
  - [ ] SubTask 4.2.2: 复用 `generateQuestions` 但允许传 nodes（不再从 topic 拆解）
  - [ ] SubTask 4.2.3: 返回 `{ questions: Question[] }`，answer 字段为空（待第 3 步生成）
  - [ ] SubTask 4.2.4: 接入限流（scene=`question_generate`，配额 5/天）
- [ ] Task 4.3: 创建 `app/api/learn/answers/route.ts` 生成答案 API
  - [ ] SubTask 4.3.1: 入参 `{ questions: Question[], nodes: KnowledgeNode[], topic: string }`
  - [ ] SubTask 4.3.2: 流式调用 LLM 生成每题答案（用 `streamText`），按 questionId 逐题返回
  - [ ] SubTask 4.3.3: 返回 `ReadableStream`，每题答案完成后推送 `{ questionId, answer }` chunk
  - [ ] SubTask 4.3.4: 接入限流（scene=`answer_generate`，配额 5/天）
- [ ] Task 4.4: 修改 `lib/presets/index.ts` `matchPresetByTopic` 改为精确匹配
  - [ ] SubTask 4.4.1: 仅当 `topic.trim().toLowerCase() === p.topic.toLowerCase()` 时匹配
  - [ ] SubTask 4.4.2: 不再因「主题包含 name/tags 关键词」而匹配
  - [ ] SubTask 4.4.3: 用户通过预设卡片入口直接选择预设（保持现有 UI）
- [ ] Task 4.5: 创建 `components/LearnWizard.tsx` 学习向导组件
  - [ ] SubTask 4.5.1: 4 步状态机：`step: "input" | "knowledge" | "questions" | "answers"`
  - [ ] SubTask 4.5.2: Step 1「input」：输入主题 + 提示词 + 每日时长 + 快捷输入（动态推荐，见阶段 5）
  - [ ] SubTask 4.5.3: Step 2「knowledge」：调 `/api/learn/knowledge` → 展示 `<MindMap>` + 「确认知识点」「调整重新生成」按钮
  - [ ] SubTask 4.5.4: Step 2 调整模式：显示对话框输入补充 prompt → 重新调 `/api/learn/knowledge`，最新结果替换
  - [ ] SubTask 4.5.5: Step 3「questions」：调 `/api/learn/questions` → 展示题目列表（题干 + 难度 + 知识点）+ 「确认题目」「调整重新生成」
  - [ ] SubTask 4.5.6: Step 4「answers」：调 `/api/learn/answers` 流式 → 显示进度（`3/5 已完成`）+ 完成后跳 `/learn/[planId]`
  - [ ] SubTask 4.5.7: 每步显示 loading 骨架屏 + 失败时 toast.error + 重试按钮
- [ ] Task 4.6: 改造 `app/learn/new/page.tsx` 接入 LearnWizard
  - [ ] SubTask 4.6.1: 移除原 `handleSubmit` 直接调 `/api/learn` 的逻辑
  - [ ] SubTask 4.6.2: 渲染 `<LearnWizard>` 替换原表单
  - [ ] SubTask 4.6.3: 预设知识库卡片入口保留（点击预设仍走预设流程，不走向导）
- [ ] Task 4.7: 单测 `__tests__/learn-wizard.test.ts`
  - [ ] SubTask 4.7.1: 4 步状态机切换正确
  - [ ] SubTask 4.7.2: Step 2 调整 prompt 后重新生成
  - [ ] SubTask 4.7.3: Step 4 流式接收答案 chunk

## 阶段 5：快捷输入智能推荐

- [ ] Task 5.1: 创建 `lib/recommend-quick-inputs.ts`
  - [ ] SubTask 5.1.1: `getRecommendedQuickInputs(): Promise<string[]>` 返回 top 4 推荐词
  - [ ] SubTask 5.1.2: 数据源：IndexedDB 读 `learn:input_history`（最近 50 条用户输入）+ `LearnLog`（最近 7 天学习的 topic）+ `ReviewLog`（最近 7 天复习的 nodeId 标题）+ `ChatMessage`（最近 7 天聊天主题摘要）
  - [ ] SubTask 5.1.3: 加权打分：input_history × 3 + LearnLog topic × 2 + ReviewLog 标题 × 1 + ChatMessage 主题 × 1
  - [ ] SubTask 5.1.4: 时近衰减：7 天前 × 0.3，3 天前 × 0.7，今天 × 1.0
  - [ ] SubTask 5.1.5: 去重 + 取 top 4
  - [ ] SubTask 5.1.6: 无数据时返回默认 `["前端性能优化", "React 源码原理", "TypeScript 进阶", "系统设计基础"]`
- [ ] Task 5.2: 创建 `lib/learn-input-history.ts` 输入历史持久化
  - [ ] SubTask 5.2.1: `recordInputHistory(topic: string)` 写入 IndexedDB key=`learn:input_history`
  - [ ] SubTask 5.2.2: 环形队列，最多 50 条（超限 FIFO 移除）
  - [ ] SubTask 5.2.3: 去重（相同 topic 不重复写入，但更新 timestamp）
- [ ] Task 5.3: 改造 `app/learn/new/page.tsx`（或 LearnWizard）动态加载快捷输入
  - [ ] SubTask 5.3.1: `useEffect` 调 `getRecommendedQuickInputs()` 设置 state
  - [ ] SubTask 5.3.2: 渲染动态推荐词替代静态 `EXAMPLES`
  - [ ] SubTask 5.3.3: 用户点击推荐词 → 填入主题输入框
  - [ ] SubTask 5.3.4: 用户提交主题后调 `recordInputHistory(topic)`
- [ ] Task 5.4: 单测 `__tests__/recommend-quick-inputs.test.ts`
  - [ ] SubTask 5.4.1: 有历史数据时返回 top 4
  - [ ] SubTask 5.4.2: 无历史数据时返回默认 4 个
  - [ ] SubTask 5.4.3: 时近衰减正确（7 天前 × 0.3）

## 阶段 6：全局替换 alert/confirm 为 Toast

- [ ] Task 6.1: 替换 `components/PomodoroFull.tsx` 中的 alert/confirm
  - [ ] SubTask 6.1.1: Line 242 `window.confirm("确定放弃这个番茄吗？")` → `await confirmDialog({...})`
  - [ ] SubTask 6.1.2: Line 261 `window.alert("⚠️ 严格模式...")` → `toast.warning("严格模式：连续 3 次打断，已自动放弃本次番茄")`
- [ ] Task 6.2: 替换 `components/SyncStatus.tsx` 中的 confirm
  - [ ] SubTask 6.2.1: Line 50 `window.confirm("从云端恢复...")` → `await confirmDialog({...})`
- [ ] Task 6.3: 替换 `app/learn/new/page.tsx` 中的 confirm
  - [ ] SubTask 6.3.1: Line 162 / 234 `window.confirm("检测到示例数据...")` → `await confirmDialog({...})`
- [ ] Task 6.4: 替换 `app/profile/page.tsx` 中的 confirm
  - [ ] SubTask 6.4.1: Line 488 `confirm("确定删除该模型配置？")` → `await confirmDialog({...})`
- [ ] Task 6.5: 替换 `app/favorites/page.tsx` 中的 confirm
  - [ ] SubTask 6.5.1: Line 36 `confirm("确定删除试题集...")` → `await confirmDialog({...})`
  - [ ] SubTask 6.5.2: Line 42 `confirm("确定取消收藏...")` → `await confirmDialog({...})`
- [ ] Task 6.6: 替换 `app/emotion/page.tsx` 中的 confirm
  - [ ] SubTask 6.6.1: Line 66 `confirm("确定删除这条情绪记录？")` → `await confirmDialog({...})`
- [ ] Task 6.7: 替换 `app/chat/ChatClient.tsx` 中的 confirm
  - [ ] SubTask 6.7.1: Line 1014 / 1046 `window.confirm("删除这条消息？")` → `await confirmDialog({...})`
  - [ ] SubTask 6.7.2: Line 1233 `window.confirm("确定删除此对话？")` → `await confirmDialog({...})`
- [ ] Task 6.8: 替换内联错误文案为 toast
  - [ ] SubTask 6.8.1: `app/learn/new/page.tsx` `{error && <p className="text-red-500">...}` → toast.error
  - [ ] SubTask 6.8.2: `app/learn/[planId]/PlanDetailClient.tsx` `{regenError && ...}` → toast.error
  - [ ] SubTask 6.8.3: `app/profile/page.tsx` `{modelError && ...}` → toast.error

## 阶段 7：学习统计按钮重设计

- [ ] Task 7.1: 改造 `app/profile/page.tsx` 「学习统计」按钮
  - [ ] SubTask 7.1.1: 3 按钮 → 4 按钮：热力图 / 雷达图 / AI 周报 / 错题本
  - [ ] SubTask 7.1.2: 热力图按钮 → `<Link href="/stats?tab=heatmap">`
  - [ ] SubTask 7.1.3: 雷达图按钮 → `<Link href="/stats?tab=radar">`
  - [ ] SubTask 7.1.4: AI 周报按钮 → `<Link href="/stats?tab=weekly">`
  - [ ] SubTask 7.1.5: 错题本按钮 → `<Link href="/mistakes">`
- [ ] Task 7.2: 改造 `app/stats/page.tsx` 读取 `?tab=` query
  - [ ] SubTask 7.2.1: `useSearchParams()` 读取 `tab` 参数
  - [ ] SubTask 7.2.2: 初始化 `useState<Tab>(tabFromQuery ?? "heatmap")`
  - [ ] SubTask 7.2.3: tab 参数无效时回退到 "heatmap"

## 阶段 8：默认浅色主题 + 深色模式可读性修复

- [ ] Task 8.1: 修改 `lib/theme.ts` 默认主题为 light
  - [ ] SubTask 8.1.1: `getStoredTheme` 返回 `(stored as Theme) || "light"`
  - [ ] SubTask 8.1.2: `getResolvedTheme` 中 `theme === "system"` 仍按系统偏好（保留 system 选项给用户）
- [ ] Task 8.2: 修改 `app/layout.tsx` inline script 默认值
  - [ ] SubTask 8.2.1: `var stored = localStorage.getItem('devpath:theme') || 'light';`
  - [ ] SubTask 8.2.2: 仅当 `stored === 'dark'` 或 `stored === 'system' && matchMedia dark` 时加 dark class
- [ ] Task 8.3: 审计并修复 dark mode 对比度问题
  - [ ] SubTask 8.3.1: `components/PomodoroFull.tsx`：检查 dark:text-gray-900 等低对比度组合
  - [ ] SubTask 8.3.2: `app/HomeClient.tsx`：检查所有 dark:bg-* + dark:text-* 组合
  - [ ] SubTask 8.3.3: `app/chat/ChatClient.tsx`：同上
  - [ ] SubTask 8.3.4: `app/dashboard/DashboardClient.tsx`：同上
  - [ ] SubTask 8.3.5: `app/u/[username]/UserPageClient.tsx`：同上
  - [ ] SubTask 8.3.6: `app/profile/page.tsx`：同上
  - [ ] SubTask 8.3.7: `app/stats/page.tsx` / `app/stats/ai-quality/page.tsx`：同上
  - [ ] SubTask 8.3.8: 修复规则：`dark:bg-gray-900` 配 `dark:text-gray-100`；`dark:bg-gray-800` 配 `dark:text-gray-200`；`dark:bg-gray-700` 配 `dark:text-gray-100`
- [ ] Task 8.4: 视觉验证
  - [ ] SubTask 8.4.1: 浅色主题下首屏所有文字可读
  - [ ] SubTask 8.4.2: 深色主题下首屏所有文字可读（对比度 ≥ 4.5:1）

## 阶段 9：合并到 main

- [ ] Task 9.1: 全量测试
  - [ ] SubTask 9.1.1: `npx vitest run` 全部通过
  - [ ] SubTask 9.1.2: `npx tsc --noEmit` 无新增错误
  - [ ] SubTask 9.1.3: `npm run build` 通过（无 ESLint Error）
- [ ] Task 9.2: 推送 develop
  - [ ] SubTask 9.2.1: `git push origin develop`
- [ ] Task 9.3: 合并到 main
  - [ ] SubTask 9.3.1: `git checkout main && git pull origin main`
  - [ ] SubTask 9.3.2: `git merge develop`
  - [ ] SubTask 9.3.3: `git push origin main`
  - [ ] SubTask 9.3.4: `git checkout develop`

# Task Dependencies

- 阶段 0（Toast 基础设施）是阶段 6（替换 alert/confirm）的前置
- 阶段 1（番茄 404 + 全屏）独立，可与阶段 0 并行
- 阶段 2（用户 ID 脱敏）独立，可与阶段 0/1 并行
- 阶段 3（API Token 放开）独立，可与阶段 0/1/2 并行
- 阶段 4（学习流程重构）依赖阶段 0（Toast）+ 阶段 5（快捷输入推荐）
- 阶段 5（快捷输入推荐）独立，可与阶段 0/1/2/3 并行
- 阶段 6（全局替换 alert/confirm）依赖阶段 0（Toast）+ 阶段 2（maskUserId 用于 SyncStatus）
- 阶段 7（统计按钮）独立，可与阶段 0-6 并行
- 阶段 8（主题修复）独立，可与阶段 0-7 并行
- 阶段 9（合并 main）依赖阶段 0-8 全部完成

并行机会：
- 阶段 0 + 阶段 1 + 阶段 2 + 阶段 3 + 阶段 5 + 阶段 7 + 阶段 8 可全部并行（7 个独立子任务）
- 阶段 4 在阶段 0 完成后启动
- 阶段 6 在阶段 0 + 阶段 2 完成后启动
