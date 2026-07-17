# AI 工具修复与多项体验打磨 Spec

## Why

用户反馈 5 个问题，调研后发现根因比表象更深：

1. **AI 工具完全空转**：用户说"只看到 AI 回复，没看到番茄钟"。根因是 `ChatClient.tsx:637` 流解析器监听 `type === "a"`（annotation 前缀），但工具结果实际通过 `6:` 前缀发送（Vercel AI SDK Data Stream Protocol）。`pendingActions` 永远为空，`executeClientAction` 从不执行。7 个写入工具（番茄钟/计划调整/提醒/生成计划）全是空转。还有二级 bug：`start_focus_session` 跳 `/focus`（实际是 `/timer`），`generate_learning_plan` 写 `learn:pending_plan` 但无人读取。

2. **聊天模型选择**：当前是平铺图标，用户希望改成和 QuickShortcuts 一样的 popover（点击图标 → 上方弹列表）。

3. **追问新开对话**：从 QuestionCard 追问跳转 `/chat?prefill=...` 时，当前会塞进最近一条对话，而非新开。

4. **历史聊天入口消失**：`showHistory` 是死 state，`switchConversation`/`handleRename`/`filteredConversations` 都已实现但无 UI 调用。用户无法看到/切换过去对话。

5. **复习卡片**：无滑动手势；两个删除按钮调同一 handler；学习时不自动造卡（文档却声称已实现）。

6. **试题生成**：向导中间态无缓存（刷新即丢）；Step 3 流中断后用户卡死（完成按钮条件永不满足）；无"继续生成答案"入口；无超时处理。

## What Changes

### 一、修复 AI 工具执行链（最高优先级）

- **BREAKING 修复**：`ChatClient.tsx:637` 流解析器 `type === "a"` → `type === "6"`，正确匹配 Vercel AI SDK 的工具结果前缀
- **修复二级 bug**：
  - `start_focus_session`：跳转目标 `/focus` → `/timer`；`focus:pending_session` 改为直接写 `KEY_PREFIXES.POMODORO_SESSION` 的 running session（status 改为 `"running"` 而非 `"pending"`），让 `PomodoroFull.tsx` 的 `getRunningSession()` 能识别
  - `generate_learning_plan`：`/learn/new/page.tsx` 增加 `sessionStorage["learn:pending_plan"]` 读取逻辑，命中则直接预填 topic + 跳过输入步骤
- **新增工具执行 UI 反馈**：工具执行成功/失败时显示 toast（如"番茄钟已启动 25 分钟"、"提醒已设置"），让用户明确感知工具生效
- **新增端到端测试**：覆盖 `route.ts → SDK 流 → ChatClient parseDataLine → executeClientAction` 链路，避免回归

### 二、聊天模型选择改 popover

- **BREAKING**：`ModelIconSelector.tsx` 从平铺图标改为 popover 模式（与 QuickShortcuts 一致）
- 触发按钮显示当前选中模型图标（无选中显示 `+`）
- 点击后上方弹出模型列表，每项点击切换并关闭
- ESC / 点击外部关闭

### 三、追问新开对话

- **BREAKING**：`ChatClient.tsx` 初始化逻辑，当 `prefill` 参数存在且无 `conversationId` 时：
  - 跳过"恢复最近对话"分支
  - 调用 `handleNewConversation`（清空 activeConv）
  - 读取 `sourceType/sourceId/sourceTitle` 组装 `ChatSource`
  - `handleSend` 的 `createConversation` 透传 `source`
  - 消费后 `router.replace('/chat')` 清 URL 参数

### 四、恢复历史聊天入口

- ChatClient 顶部 toolbar 新增"历史"按钮（`clock` 或 `list` 图标）触发 `setShowHistory(true)`
- 渲染历史抽屉/弹层，遍历 `filteredConversations` 显示对话列表
- 每条对话接入已实现的 `switchConversation`/`handleTogglePin`/`handleDelete`/`handleRename`
- 加搜索框接 `setSearchQuery`（让 `filteredConversations` 生效）

### 五、复习卡片优化

- **BREAKING**：`ReviewCardView` 或外层容器增加 touch 事件支持左右滑切换（左滑下一条、右滑上一条，阈值 50px，<10px 视为点击）
- 删除元信息区的删除按钮（保留底部操作行那个）
- **新增造卡路径**：
  - 学习详情页标记 `learn_complete` 时，为该 nodeId 下所有未造卡的 questions 调 `createCard`（带 `findExistingCard` 查重，扩展为 `planId + questionId` 查重）
  - `QuestionCard` 单题星标收藏时同步 `createCard`
  - 错题本 `recordMistake` 时同步 `createCard`
- 修正 `lib/docs-content.ts` 文档与实现一致

### 六、试题生成优化

- **BREAKING**：LearnWizard 中间态持久化到 IndexedDB（新增 `KEY_PREFIXES.PLAN_DRAFT`，存 `{topic, nodes, questions, answerProgress, step}`）
- LearnWizard 挂载时检查 draft，命中则恢复
- Step 3"完成"按钮条件放宽：允许 `answerProgress.done < total` 时也显示"完成"按钮（标注"X 题未生成答案"）
- PlanDetailClient 对无答案题目新增"继续生成答案"按钮，调 `/api/learn/answers` 只补缺失题
- 所有 AI 生成过程加超时（`aiFetch` 增加 `AbortController` + 60s 超时）
- 超时/异常显示明确 toast 反馈

## Impact

### Affected specs
- `chat-redesign-and-title-layout`：聊天重设计的延续，不冲突
- `quality-gate-and-ux-rework`：复习页导航需求扩展（加滑动手势）
- `ux-overhaul-and-learning-flow-rework`：学习向导渐进式流程扩展（加 draft 持久化 + 继续生成）

### Affected code
- 修改文件 ~12 个：
  - `app/chat/ChatClient.tsx`（流解析修复 + 追问新开 + 历史入口 + 工具执行 UI 反馈）
  - `components/ModelIconSelector.tsx`（popover 化）
  - `app/learn/new/page.tsx`（读取 pending_plan）
  - `app/review/page.tsx`（滑动手势 + 删重复删除按钮）
  - `components/ReviewCardView.tsx`（touch 事件）
  - `app/learn/[planId]/PlanDetailClient.tsx`（造卡 + 继续生成答案）
  - `components/QuestionCard.tsx`（星标造卡）
  - `components/LearnWizard.tsx`（draft 持久化 + 完成条件放宽）
  - `lib/api-client.ts`（aiFetch 超时）
  - `lib/fsrs.ts`（findExistingCard 扩展查重）
  - `lib/mistake-book.ts`（造卡）
  - `lib/types.ts`（KEY_PREFIXES 加 PLAN_DRAFT）
  - `lib/docs-content.ts`（文档修正）
- 新增文件 1-2 个：
  - `__tests__/ai-tool-execution.test.ts`（端到端链路测试）

## ADDED Requirements

### Requirement: AI 工具端到端执行
系统 SHALL 在 AI 聊天流中正确解析工具执行结果（`6:` 前缀），并调用 `executeClientAction` 执行副作用。

#### Scenario: 用户请求启动番茄钟
- **GIVEN** 用户在聊天输入"开始专注 25 分钟"
- **WHEN** AI 调用 `start_focus_session` 工具
- **THEN** 客户端解析 `6:` 前缀的工具结果
- **AND** `executeClientAction` 写入 running session 到 IndexedDB
- **AND** 跳转到 `/timer` 页面
- **AND** `PomodoroFull.tsx` 识别该 session 并开始倒计时
- **AND** 显示 toast"番茄钟已启动 25 分钟"

#### Scenario: 用户请求设置提醒
- **GIVEN** 用户输入"30 分钟后提醒我学习"
- **WHEN** AI 调用 `set_reminder` 工具
- **THEN** 客户端执行 `createReminder` 写入 IndexedDB
- **AND** 显示 toast"提醒已设置"

### Requirement: 模型选择 Popover
系统 SHALL 提供与快捷方式一致的模型选择 popover 交互。

#### Scenario: 切换模型
- **WHEN** 用户点击模型图标按钮
- **THEN** 上方弹出模型列表（可滚动）
- **AND** 当前选中模型高亮
- **AND** 点击其他模型后切换并关闭 popover
- **AND** ESC / 点击外部关闭

### Requirement: 追问新开对话
系统 SHALL 在带 prefill 参数进入聊天时新开对话，而非塞进最近对话。

#### Scenario: 从试题追问进入聊天
- **GIVEN** 用户在 QuestionCard 点击"追问"
- **WHEN** 跳转到 `/chat?prefill=...&sourceType=question`
- **THEN** 创建新对话（不恢复最近对话）
- **AND** prefill 内容填入输入框
- **AND** source 信息记录到对话元数据

### Requirement: 历史聊天入口
系统 SHALL 提供历史聊天记录入口，用户可查看、切换、搜索过去对话。

#### Scenario: 查看历史
- **WHEN** 用户点击顶部"历史"按钮
- **THEN** 显示对话列表抽屉
- **AND** 每条显示标题、时间、收藏状态
- **AND** 支持点击切换、收藏、重命名、删除
- **AND** 支持搜索过滤

### Requirement: 复习卡片左右滑
系统 SHALL 支持左右滑手势切换复习卡片。

#### Scenario: 左滑下一条
- **GIVEN** 用户在复习页
- **WHEN** 左滑距离 > 50px
- **THEN** 切换到下一条卡片
- **AND** 滑动距离 < 10px 视为点击（不触发切换）

### Requirement: 学习内容自动加入复习
系统 SHALL 在学习过程中自动将题目加入复习卡片队列。

#### Scenario: 完成知识点学习
- **GIVEN** 用户在 PlanDetailClient 标记知识点 learn_complete
- **WHEN** 该 nodeId 下有未造卡的 questions
- **THEN** 自动 `createCard`（带查重）
- **AND** 不重复造卡

### Requirement: 试题生成中间态持久化
系统 SHALL 将 LearnWizard 的中间状态持久化到 IndexedDB，刷新/退出可恢复。

#### Scenario: 中途退出
- **GIVEN** 用户在 Step 2 生成了题目但未生成答案
- **WHEN** 用户关闭页面
- **THEN** draft 保存到 IndexedDB
- **AND** 下次进入 `/learn/new?topic=...` 恢复到 Step 2

### Requirement: 继续生成答案
系统 SHALL 支持对答案缺失的题目继续生成答案。

#### Scenario: 部分答案缺失
- **GIVEN** plan 中部分 question.answer 为空
- **WHEN** 用户在 PlanDetailClient 看到"继续生成答案"按钮
- **THEN** 调用 `/api/learn/answers` 只补缺失题
- **AND** 生成完成后更新 plan

### Requirement: AI 生成超时反馈
系统 SHALL 对所有 AI 生成过程加超时和异常反馈。

#### Scenario: 超时
- **GIVEN** AI 生成超过 60 秒未响应
- **THEN** 中断请求
- **AND** 显示 toast"请求超时，请重试"
- **AND** 不卡死在 loading 状态

## MODIFIED Requirements

### Requirement: Review Card Navigation
原仅支持按钮 + 键盘导航。修改为：增加左右滑手势，删除重复的删除按钮。

### Requirement: LearnWizard Flow
原全有或全无（必须完成 4 步才保存）。修改为：中间态持久化 + 完成条件放宽 + 继续生成答案。
