# UX 体验大修与学习流程重构 Spec

## Why

第一轮迭代完成了用户名脱敏与仪表盘重构，但用户在实际使用中暴露了多个核心体验问题：

1. **番茄时钟 404**：用户点击「开始专注」后跳转到 `/timer` 出现 404，无法进入全屏专注模式——核心功能完全不可用。
2. **全屏方向错误**：浏览器进入全屏后默认横屏，移动设备用户横屏看倒计时极不友好；进入学习页每次都弹全屏提示，干扰使用；没有让用户主动切换全屏的入口。
3. **用户 ID 泄露风险**：[SyncStatus.tsx](file:///workspace/components/SyncStatus.tsx) 把 `userId`（nanoid 生成的匿名 ID）明文显示在「个人信息」分区，且支持复制。任何看到该 ID 的人都可以通过「导入已有 ID」拉取并覆盖该用户的云端数据。第一轮只做了 `username` 脱敏，但用户实际担忧的是 **`userId`**——这是数据同步的真正钥匙。
4. **API Token 限制逻辑反常识**：[auth.ts](file:///workspace/lib/auth.ts) 在 `useServerModel=true` 且未配置 `API_TOKEN` 时，生产环境直接返回 503；但免费用户本就有 KV 限流（chat=20/天、plan=5/天），不需要再加一层 token 限制。同时用户反馈「用户信息都填了且保存了，但还是说没找到」，说明 503 错误文案误导了用户（实际是未配置 AI 模型，文案却暗示要填用户信息）。
5. **学习流程「秒出题库」错误**：[learn/new/page.tsx](file:///workspace/app/learn/new/page.tsx) 用 `matchPresetByTopic` 把用户输入的「前端性能优化」匹配到「前端工程师」预设并秒开弹窗，主题不符。用户期望的是**渐进式确认流程**：拆知识点 → 用户确认 → 生成题目 → 用户确认 → 生成答案，减少无效等待。
6. **快捷输入静态**：`EXAMPLES` 写死 4 个示例，没有根据用户最近输入/学习/复习/聊天内容动态推荐。
7. **提示框原始**：全站使用 `window.alert` / `window.confirm` / 内联 `<p className="text-red-500">` 散落 20+ 处，无统一组件，无 dark mode 适配。
8. **学习统计按钮低效**：[profile/page.tsx](file:///workspace/app/profile/page.tsx#L580-L602) 「学习统计」分区下的 3 个按钮（热力图 / 雷达图 / AI 周报）全部链接到同一个 `/stats` URL，没有锚点区分。
9. **深色主题可读性差**：26 个组件共 150 处 `dark:bg-*` / `dark:text-*` 中，多处存在「深色背景 + 深色字体」对比度不足的问题（如 `dark:bg-gray-900` 配 `dark:text-gray-800`）。默认主题为 `system`，在系统深色下首屏即触发可读性问题。

## What Changes

### 一、修复番茄时钟 404 与全屏方向

- 排查 `/timer` 404 根因（可能为：路由渲染异常、`PomodoroFull.init()` 中 IndexedDB 调用未在客户端执行、构建产物缺失），修复后保证「开始专注」→ 进入全屏番茄可用
- **BREAKING**: 移除 `useAutoFullscreen` 进入页面自动弹提示的逻辑，改为「用户主动点击全屏按钮」模式
- 新增「全屏专注」按钮（位于学习详情页与番茄页头部），用户主动触发才进入全屏
- **BREAKING**: 默认竖屏展示。监听 `orientationchange`，强制 `screen.orientation.lock("portrait")`（不支持时静默降级）
- 用户首次选择「进入全屏 / 暂不」后，将偏好持久化到 `localStorage`，后续不再主动弹窗（除非用户主动点击全屏按钮）

### 二、用户 ID 脱敏与安全

- **BREAKING**: [SyncStatus.tsx](file:///workspace/components/SyncStatus.tsx) 的 userId 输入框默认脱敏显示（前 4 位 + `****` + 后 4 位），仅在用户主动点击「显示完整 ID」时明文
- 复制按钮保持可用（用户自己复制自己 ID 不算泄露）
- 「导入已有 ID」流程增加二次确认：粘贴新 userId 后提示「此操作会用该 ID 的云端数据覆盖本地，确认这是你自己的 ID？」，避免误粘贴他人 ID
- 服务端 `/api/sync` 增加保护：当请求中的 `userId` 与已存在 backup 的 `username` 不匹配时，记录风险日志（不阻断，避免误伤跨设备用户）

### 三、放开 API Token 限制

- **BREAKING**: [auth.ts](file:///workspace/lib/auth.ts) `requireAuth` 在 `useServerModel=true` 时不再因「未配置 `API_TOKEN`」返回 503。改为：始终放行，依赖 [rate-limit.ts](file:///workspace/lib/ai/rate-limit.ts) 的免费配额控制（chat=20/天、plan=5/天等）
- 503 错误文案重写：明确说明「未配置 AI 模型」是唯一原因，移除「用户信息未找到」的误导性表述
- 保留 `API_TOKEN` 鉴权能力（用于私有部署仍想加密的场景），但默认不启用——仅在 `process.env.REQUIRE_API_TOKEN === "true"` 时生效

### 四、学习流程重构为渐进式确认

- **BREAKING**: [learn/new/page.tsx](file:///workspace/app/learn/new/page.tsx) 的 `matchPresetByTopic` 不再「主题包含即匹配」，改为「主题完全等于预设 topic」才匹配。匹配预设改为通过点击预设卡片入口，而非输入框自动匹配
- 新增「学习向导」组件 `components/LearnWizard.tsx`，4 步流程：
  1. **生成知识点**：调用 `/api/learn/knowledge`（新增）只拆知识树，返回 `KnowledgeNode[]`
  2. **用户确认知识点**：展示知识树脑图 + 「确认知识点 / 调整提示词重新生成」按钮。调整时以对话方式追加 prompt，重新生成
  3. **生成题目**：用户确认知识点后，调用 `/api/learn/questions`（新增）基于知识点生成 `Question[]`，展示题目列表 + 「确认题目 / 调整重新生成」
  4. **生成答案**：用户确认题目后，调用 `/api/learn/answers`（新增）流式生成每题答案，可中断
- **BREAKING**: 拆分 `/api/learn` POST 为 3 个新路由：`/api/learn/knowledge`、`/api/learn/questions`、`/api/learn/answers`。原 `/api/learn` 保留兼容（一次性生成全部，用于「重新生成计划」入口）
- 减少用户等待：每步只生成该步内容，用户可在任何一步调整，无需等 90 秒全部生成后发现不对

### 五、快捷输入智能推荐

- 新增 `lib/recommend-quick-inputs.ts`：从 IndexedDB 读取最近 7 天的 LearnLog / ReviewLog / ChatMessage / 用户输入历史，按频次 + 时近加权打分，返回 top 4 推荐词
- [learn/new/page.tsx](file:///workspace/app/learn/new/page.tsx) `EXAMPLES` 改为动态：`useEffect` 加载推荐词，无数据时回退到默认 4 个示例
- 输入历史持久化：用户每次提交主题后写入 `IndexedDB key="learn:input_history"`（环形队列，最多 50 条）

### 六、全局友好提示组件

- 新增 `components/Toast.tsx` + `lib/toast.ts` + `lib/hooks/use-toast.ts`
- 支持 4 种类型：`success` / `error` / `warning` / `info`，自动消失（默认 3 秒，error 5 秒）
- 支持 Promise 化的 confirm：`await confirmDialog({ title, message, confirmText, cancelText })`
- **BREAKING**: 全站替换 20+ 处 `window.alert` / `window.confirm` / 内联错误文案为 Toast 调用：
  - [PomodoroFull.tsx](file:///workspace/components/PomodoroFull.tsx#L261): `window.alert` → `toast.warning`
  - [PomodoroFull.tsx](file:///workspace/components/PomodoroFull.tsx#L242): `window.confirm` → `confirmDialog`
  - [SyncStatus.tsx](file:///workspace/components/SyncStatus.tsx#L50): `window.confirm` → `confirmDialog`
  - [learn/new/page.tsx](file:///workspace/app/learn/new/page.tsx#L162): `window.confirm` → `confirmDialog`
  - [profile/page.tsx](file:///workspace/app/profile/page.tsx#L488): `confirm` → `confirmDialog`
  - [favorites/page.tsx](file:///workspace/app/favorites/page.tsx#L36): `confirm` → `confirmDialog`
  - [emotion/page.tsx](file:///workspace/app/emotion/page.tsx#L66): `confirm` → `confirmDialog`
  - [chat/ChatClient.tsx](file:///workspace/app/chat/ChatClient.tsx#L1014): `window.confirm` → `confirmDialog`
  - 所有内联 `<p className="text-red-500">` 错误文案 → `<Toast />` 调用
- Toast 渲染在 `app/layout.tsx` 根节点，全局可用

### 七、学习统计按钮重设计

- [profile/page.tsx](file:///workspace/app/profile/page.tsx#L580-L602) 「学习统计」分区下 3 个按钮重新设计：
  - 「热力图」→ `/stats?tab=heatmap`（带 query 锚点）
  - 「雷达图」→ `/stats?tab=radar`
  - 「AI 周报」→ `/stats?tab=weekly`
- [stats/page.tsx](file:///workspace/app/stats/page.tsx) 读取 `?tab=` query 初始化 tab 状态
- 评估新增「错题本」按钮（当前 `/mistakes` 路由独立，从 stats 入口缺失）→ 替换原 3 按钮为 4 按钮：热力图 / 雷达图 / AI 周报 / 错题本

### 八、默认浅色主题 + 深色模式可读性修复

- **BREAKING**: [lib/theme.ts](file:///workspace/lib/theme.ts) `getStoredTheme` 默认值从 `"system"` 改为 `"light"`
- [app/layout.tsx](file:///workspace/app/layout.tsx#L33) inline script 中 `|| 'system'` 改为 `|| 'light'`
- 全站审计 `dark:bg-*` / `dark:text-*` 组合，修复对比度不足的组合：
  - `dark:bg-gray-900 + dark:text-gray-800` → `dark:text-gray-100`
  - `dark:bg-gray-800 + dark:text-gray-700` → `dark:text-gray-200`
  - `dark:bg-gray-700 + dark:text-gray-600` → `dark:text-gray-100`
- 重点审计组件：[PomodoroFull.tsx](file:///workspace/components/PomodoroFull.tsx)、[HomeClient.tsx](file:///workspace/app/HomeClient.tsx)、[ChatClient.tsx](file:///workspace/app/chat/ChatClient.tsx)、[DashboardClient.tsx](file:///workspace/app/dashboard/DashboardClient.tsx)

### 九、合并到 main

- 完成后推送 develop，再合并到 main 并推送

## Impact

### Affected specs
- 现有 `smart-learning-expansion` spec 的「Pomodoro Session Lifecycle」需求修改：默认竖屏 + 用户主动触发全屏
- 现有 `smart-learning-expansion` spec 的「Rate Limit Enforcement」需求修改：免费用户不依赖 API_TOKEN，仅 KV 限流

### Affected code
- 新建文件 8 个：
  - `components/LearnWizard.tsx`（学习向导）
  - `components/Toast.tsx`（全局提示组件）
  - `lib/toast.ts`（toast 状态管理）
  - `lib/hooks/use-toast.ts`（toast hook）
  - `lib/recommend-quick-inputs.ts`（快捷输入推荐）
  - `app/api/learn/knowledge/route.ts`（拆知识点 API）
  - `app/api/learn/questions/route.ts`（生成题目 API）
  - `app/api/learn/answers/route.ts`（生成答案 API）
- 修改文件 15+ 个：
  - `app/timer/page.tsx` / `components/PomodoroFull.tsx`（番茄 404 修复 + 全屏按钮 + 竖屏锁定）
  - `lib/hooks/use-auto-fullscreen.ts`（移除自动弹窗，改为主动触发）
  - `components/FullscreenPrompt.tsx`（移除，被 Toast + 全屏按钮替代）
  - `components/SyncStatus.tsx`（userId 脱敏 + 导入二次确认）
  - `lib/auth.ts`（放开 token 限制 + 503 文案重写）
  - `app/learn/new/page.tsx`（接入 LearnWizard + 动态快捷输入）
  - `lib/presets/index.ts`（matchPresetByTopic 改为精确匹配）
  - `app/profile/page.tsx`（统计按钮重设计 + 替换 alert/confirm）
  - `app/stats/page.tsx`（读取 ?tab= query）
  - `lib/theme.ts` / `app/layout.tsx`（默认浅色）
  - `app/layout.tsx`（注入 Toast 渲染容器）
  - 多个组件审计 dark mode 对比度

## ADDED Requirements

### Requirement: 学习向导渐进式确认流程
系统 SHALL 提供学习计划创建的 4 步渐进式流程：知识点 → 确认 → 题目 → 确认 → 答案。

#### Scenario: 用户输入「前端性能优化」
- **WHEN** 用户在 `/learn/new` 输入「前端性能优化」并点击开始
- **THEN** 调用 `/api/learn/knowledge` 拆解知识点
- **AND** 展示知识树脑图（不带题目）
- **AND** 显示「确认知识点」和「调整重新生成」两个按钮
- **AND** 用户点击「调整重新生成」 → 显示对话框输入补充提示词 → 重新调 `/api/learn/knowledge`
- **AND** 用户点击「确认知识点」 → 进入第 3 步生成题目

#### Scenario: 用户确认题目后生成答案
- **GIVEN** 用户已确认 5 道题目
- **WHEN** 用户点击「确认题目，生成答案」
- **THEN** 调用 `/api/learn/answers` 流式生成每题答案
- **AND** UI 显示进度（3/5 已完成）
- **AND** 完成后跳转到 `/learn/[planId]` 详情页

### Requirement: 全屏专注主动触发
系统 SHALL 不再自动弹全屏提示，改为用户提供主动切换全屏的按钮。

#### Scenario: 用户首次进入学习详情页
- **WHEN** 用户首次访问 `/learn/[planId]`
- **THEN** 不显示全屏提示弹窗
- **AND** 在页面头部显示「全屏专注」按钮（图标 + 文案）
- **AND** 用户点击按钮 → 调用 `requestFullscreen()` 并锁定竖屏方向

#### Scenario: 用户选择不再提示
- **GIVEN** 用户曾点击「暂不进入全屏」
- **WHEN** 用户再次访问学习详情页
- **THEN** 不再显示全屏提示
- **AND** 全屏按钮始终可见，用户可随时主动触发

### Requirement: 用户 ID 脱敏显示
系统 SHALL 在 UI 中默认脱敏显示 userId，仅在用户主动操作时明文。

#### Scenario: 默认显示
- **WHEN** 用户打开「个人信息」分区
- **THEN** userId 输入框显示为 `abcd****wxyz` 格式
- **AND** 旁边有「显示完整 ID」按钮
- **AND** 复制按钮复制的是完整 ID（用户自己复制自己 ID 不算泄露）

#### Scenario: 导入他人 ID 防护
- **WHEN** 用户在「导入已有 ID」输入框粘贴任意 ID 并点击确认
- **THEN** 弹出 confirmDialog「此操作会用该 ID 的云端数据覆盖本地，确认这是你自己的 ID？」
- **AND** 用户确认后才执行 `setUserId`

### Requirement: 全局 Toast 提示组件
系统 SHALL 提供统一的 Toast 组件，支持 success/error/warning/info 4 种类型与 Promise 化 confirm。

#### Scenario: 替换 window.alert
- **WHEN** 严格模式触发 3 次打断自动放弃番茄
- **THEN** 调用 `toast.warning("严格模式：连续 3 次打断，已自动放弃本次番茄")`
- **AND** 顶部居中显示橙色 Toast，3 秒后自动消失

#### Scenario: 替换 window.confirm
- **WHEN** 用户点击「放弃番茄」
- **THEN** 调用 `await confirmDialog({ title: "放弃番茄", message: "本次专注将不计入统计，确认放弃？" })`
- **AND** 显示居中模态对话框，用户点击确认/取消后 Promise resolve/reject

### Requirement: 快捷输入智能推荐
系统 SHALL 根据用户最近 7 天的输入/学习/复习/聊天内容推荐快捷输入词。

#### Scenario: 有历史数据
- **GIVEN** 用户最近 7 天学过「React Hooks」、复习过「闭包」、聊过「TypeScript 泛型」
- **WHEN** 用户打开 `/learn/new`
- **THEN** 快捷输入显示为「React Hooks 进阶」「闭包深入」「TypeScript 泛型」「TypeScript 类型体操」（按频次 + 时近加权）
- **AND** 无历史数据时显示默认 4 个示例

## MODIFIED Requirements

### Requirement: Pomodoro Session Lifecycle
原 `app/timer/page.tsx` 渲染 `<PomodoroFull />` 时存在 404 风险。修改为：排查渲染异常根因（IndexedDB 调用未在客户端执行、init 函数未 catch、构建产物缺失等），并保证「开始专注」→ `/timer` 可用。全屏方向默认竖屏，不再自动弹全屏提示。

### Requirement: Rate Limit Enforcement
原 [auth.ts](file:///workspace/lib/auth.ts) 在 `useServerModel=true` 且未配置 `API_TOKEN` 时返回 503。修改为：始终放行，依赖 KV 限流。`API_TOKEN` 仅在 `process.env.REQUIRE_API_TOKEN === "true"` 时启用。503 文案改为「未配置 AI 模型」，移除「用户信息未找到」误导。

### Requirement: Knowledge Decomposition API
原 `/api/learn` POST 一次性返回完整 plan（拆知识 + 生题 + 生答案 + 排程），用户等待 30-90 秒。修改为：拆分为 3 个独立路由 `/api/learn/knowledge`、`/api/learn/questions`、`/api/learn/answers`，每步独立调用。原 `/api/learn` 保留兼容。

### Requirement: Match Preset By Topic
原 [matchPresetByTopic](file:///workspace/lib/presets/index.ts#L84) 用「主题包含预设 name/tags」模糊匹配，导致「前端性能优化」误匹配「前端工程师」。修改为：仅当主题完全等于预设 topic 时匹配；用户通过预设卡片入口直接选择预设。

### Requirement: Theme Default
原 [getStoredTheme](file:///workspace/lib/theme.ts#L9) 默认 `"system"`，在系统深色下首屏触发可读性问题。修改为：默认 `"light"`。深色模式需用户主动切换，且切换后审计所有 `dark:bg-*/dark:text-*` 组合保证对比度 ≥ 4.5:1（WCAG AA）。

### Requirement: Learn Stats Buttons
原 [profile/page.tsx](file:///workspace/app/profile/page.tsx#L580-L602) 「学习统计」下 3 个按钮全部链接到 `/stats`。修改为：每个按钮带 `?tab=` query 锚点，并新增「错题本」按钮链接到 `/mistakes`。

## REMOVED Requirements

### Requirement: FullscreenPrompt 自动弹窗
**Reason**: 用户反馈每次进入学习页都弹全屏提示，干扰使用。改为「全屏按钮主动触发」模式。
**Migration**: `components/FullscreenPrompt.tsx` 移除（或保留组件但不再自动渲染），`useAutoFullscreen` 移除自动 `setNeedsPrompt(true)` 逻辑，改为用户主动调用 `enterFullscreen()`。
