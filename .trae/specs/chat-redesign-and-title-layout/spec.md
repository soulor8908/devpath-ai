# 聊天页面重设计与学习详情页标题布局修复 Spec

## Why

两个独立的体验问题需要解决：

1. **学习详情页标题被按钮挤压**：`/learn/[planId]/PlanDetailClient.tsx` 第 329 行用 `flex items-start justify-between gap-2 flex-wrap` 横排标题与按钮组，但 `flex-1 min-w-0`（标题块）+ `shrink-0`（按钮组）的组合让 `flex-wrap` 形同虚设——浏览器优先让 h1 文字内部 `break-words` 换行，而非触发容器层面的 flex 换行。结果：3 个按钮（重新生成 / 调整计划 / 全屏）在窄屏挤压标题宽度，标题多行折行、视觉拥挤。之前一次"加 flex-wrap"的修复无效，根因就在这里。用户明确要求：**标题不应该跟按钮放在同一行**。

2. **聊天页面交互模式落后**：当前聊天占用底部一个 tab（5 tab 之一），入口重、占用导航位。聊天页面是单文件大组件（1294 行），输入栏布局是 `[提示词库][textarea][发送]` 一行 + 下方模型下拉框一行，快捷输入只在空对话时显示。用户期望的交互模式是：**浮动可拖动入口图标 → 满屏弹框 → 默认恢复上次对话 → 快捷方式常驻（含 AI 工具）→ 模型图标化 → 输入框独占一行 → 最新用户消息可编辑/可刷新**。

## What Changes

### 一、学习详情页标题布局修复（小改动）

- **BREAKING**（视觉）：[PlanDetailClient.tsx](file:///workspace/app/learn/[planId]/PlanDetailClient.tsx#L329) 第 329 行标题+按钮组容器从 `flex items-start justify-between gap-2 flex-wrap` 改为 `flex flex-col gap-3`，标题独占一行，按钮组换到标题下方左对齐
- 按钮组容器去掉 `shrink-0`（纵向布局下无意义），保留 `flex items-center gap-2`
- h1 保留 `break-words`（超长中文标题仍能正确换行）
- 不改动按钮本身样式、不改动"收藏这份试题"按钮（它本就在下方独立一行）

### 二、聊天页面重设计（中等改动）

#### 2.1 移除底部 AI tab
- [Nav.tsx](file:///workspace/components/Nav.tsx) `items` 数组删除 `{ href: "/chat", label: "AI", icon: "chat" }` 一行
- `/chat` 路由保留（直接访问 URL 仍可用，与 `/mistakes` `/emotion` 模式一致）
- `ChatClient.tsx` 的 `bottom-16`（给 Nav 预留 64px）在弹框模式下不再需要，改为 `inset-0`

#### 2.2 浮动可拖动聊天入口图标
- 新建 `components/FloatingChatButton.tsx`：`position: fixed` 圆形按钮，默认右下角（Nav 上方）
- 可拖动：`pointerdown / pointermove / pointerup` 实现，拖动位置存 `localStorage`（key: `chat-fab-pos`），下次恢复
- 点击（非拖动）打开聊天弹框
- 全局挂载在 [layout.tsx](file:///workspace/app/layout.tsx)，所有页面可见
- 拖动与点击区分：移动距离 < 5px 视为点击

#### 2.3 满屏弹框 Modal
- 新建 `components/ChatModal.tsx`：`fixed inset-0 z-[60] bg-white` 全屏覆盖（含 Nav）
- 打开/关闭由 `FloatingChatButton` 控制（状态提升到 layout 或用全局 store）
- 关闭方式：右上角 X 按钮 / Android 返回键 / ESC
- 打开时自动滚动到最新消息

#### 2.4 默认恢复上次对话
- 弹框打开时：若无 `?conversationId` 参数，自动选中 `conversations[0]`（按 pinned 优先 + lastMessageAt 倒序的第一条）
- 已有 `listConversations()` 支持排序，只需在打开时自动选中

#### 2.5 快捷方式常驻（含 AI 工具）
- 弹框底部输入区上方常驻一行快捷方式横滑条
- 内容来源：[tool-registry.ts](file:///workspace/lib/ai/tool-registry.ts) 的 `TOOL_REGISTRY` 11 个工具，每个工具显示 `icon` + 截断的 `quickPrompts[0]`（前 8 字）
- 点击快捷方式 → 填入输入框（不自动发送，保持现有行为）
- 横向滚动（`overflow-x-auto`），不占过多垂直空间

#### 2.6 大模型图标化
- 模型选择从 `<select>` 下拉框改为图标横排
- 每个 `ModelConfig` 显示为一个圆形图标（provider 首字母 + 品牌色背景），放在快捷方式右边
- 点击图标切换 `selectedModelId`，选中态高亮（边框/底色）
- 无配置时显示一个 "+" 图标链接到 `/profile`
- provider 品牌色映射：glm=#3b82f6 / deepseek=#10b981 / mimo=#f59e0b / kimi=#8b5cf6 / custom=#6b7280

#### 2.7 输入框独占最下面一行
- 底部布局重排为两行：
  - 第一行：快捷方式横滑条 + 模型图标组（左右排列）
  - 第二行：输入框 + 发送按钮（独占一行）
- 移除原来的"提示词库按钮"（快捷方式已常驻，提示词库冗余）

#### 2.8 最新用户消息可编辑
- 仅最新一条 user 消息显示"编辑"按钮（hover 显示，与现有删除按钮并列）
- 点击编辑 → user 气泡变为 `<textarea>` 内联编辑态 + 保存/取消按钮
- 保存时：`deleteMessagesFrom(userMsgId)` 删除该消息及之后所有消息 → 用编辑后的内容重新 `addMessage(user)` → `streamAIResponse` 重新回答
- 取消时：恢复原内容，退出编辑态

#### 2.9 最新用户消息下方刷新按钮
- 仅最新一条 user 消息下方显示"刷新"按钮（refresh-cw 图标）
- 点击刷新：以该 user 消息为锚点，`deleteMessagesFrom(对应的 assistant 消息 id)` 删除 AI 回答 → `streamAIResponse` 重新回答
- 逻辑复用现有 `handleRegenerateAnswer`，改为以 user 消息为锚点（当前是以 assistant 消息为锚点）
- 移除原 assistant 消息下方的刷新按钮（避免重复）

## Impact

- Affected specs: 无（独立的新 spec）
- Affected code:
  - `app/learn/[planId]/PlanDetailClient.tsx`（标题布局，1 行 className 改动）
  - `components/Nav.tsx`（移除 AI tab，1 行删除）
  - `components/FloatingChatButton.tsx`（新建，浮动可拖动入口）
  - `components/ChatModal.tsx`（新建，满屏弹框容器）
  - `app/chat/ChatClient.tsx`（重构：弹框化 + 快捷方式常驻 + 模型图标化 + 输入框重排 + 用户消息编辑/刷新）
  - `app/layout.tsx`（挂载 FloatingChatButton）
  - `lib/ai/tool-registry.ts`（只读复用，不改动）

## ADDED Requirements

### Requirement: 浮动可拖动聊天入口
系统 SHALL 在所有页面提供一个浮动可拖动的聊天入口图标，固定在视口右下角，支持拖动到任意位置并记忆位置。

#### Scenario: 首次打开
- **WHEN** 用户首次访问任意页面
- **THEN** 右下角显示圆形聊天图标（Nav 上方）
- **AND** 点击图标打开满屏聊天弹框

#### Scenario: 拖动记忆位置
- **WHEN** 用户拖动图标到新位置
- **THEN** 位置保存到 localStorage
- **AND** 下次访问时图标恢复到上次位置

#### Scenario: 拖动与点击区分
- **WHEN** 用户按下图标移动距离 < 5px 后释放
- **THEN** 视为点击，打开聊天弹框
- **WHEN** 用户按下图标移动距离 >= 5px 后释放
- **THEN** 视为拖动，不打开弹框

### Requirement: 满屏聊天弹框
系统 SHALL 以满屏弹框形式展示聊天界面，覆盖底部导航栏。

#### Scenario: 打开弹框
- **WHEN** 用户点击浮动聊天图标
- **THEN** 满屏弹框从全屏展开（`fixed inset-0 z-[60]`）
- **AND** 自动选中最近一次对话（若无 conversationId 参数）
- **AND** 自动滚动到最新消息

#### Scenario: 关闭弹框
- **WHEN** 用户点击右上角 X / 按 ESC / 按返回键
- **THEN** 弹框关闭，回到原页面

### Requirement: 常驻快捷方式栏
系统 SHALL 在聊天弹框底部输入框上方常驻显示 AI 工具快捷方式横滑条。

#### Scenario: 显示快捷方式
- **WHEN** 聊天弹框打开
- **THEN** 输入框上方显示 AI 工具快捷方式横滑条（11 个工具）
- **AND** 每个快捷方式显示工具图标 + 截断的 quickPrompts[0]
- **AND** 横滑条可横向滚动

#### Scenario: 点击快捷方式
- **WHEN** 用户点击某个快捷方式
- **THEN** 对应指令填入输入框
- **AND** 不自动发送（用户可编辑后手动发送）

### Requirement: 模型图标化选择
系统 SHALL 以圆形图标横排形式展示用户配置的 AI 模型，放在快捷方式右边。

#### Scenario: 已配置模型
- **WHEN** 用户已配置 1 个或多个模型
- **THEN** 每个模型显示为圆形图标（provider 首字母 + 品牌色）
- **AND** 当前选中的模型高亮显示
- **WHEN** 用户点击某个模型图标
- **THEN** 切换为该模型

#### Scenario: 未配置模型
- **WHEN** 用户未配置任何模型
- **THEN** 显示 "+" 图标
- **AND** 点击跳转到 /profile 页面

### Requirement: 最新用户消息可编辑
系统 SHALL 允许用户编辑最新一条 user 消息，编辑后 AI 重新回答。

#### Scenario: 进入编辑
- **WHEN** 用户 hover 最新一条 user 消息并点击"编辑"按钮
- **THEN** 消息气泡变为 textarea 内联编辑态
- **AND** 显示"保存"和"取消"按钮

#### Scenario: 保存编辑
- **WHEN** 用户编辑内容后点击"保存"
- **THEN** 删除该 user 消息及之后所有消息
- **AND** 用编辑后的内容重新创建 user 消息
- **AND** AI 重新回答

#### Scenario: 取消编辑
- **WHEN** 用户点击"取消"
- **THEN** 恢复原内容，退出编辑态

### Requirement: 最新用户消息下方刷新按钮
系统 SHALL 在最新一条 user 消息下方显示刷新按钮，点击让 AI 重新回答。

#### Scenario: 显示刷新按钮
- **WHEN** 当前对话有消息且不在流式输出中
- **THEN** 最新一条 user 消息下方显示刷新按钮
- **AND** 其他 user 消息不显示

#### Scenario: 点击刷新
- **WHEN** 用户点击刷新按钮
- **THEN** 删除该 user 消息对应的 AI 回答
- **AND** AI 重新回答该 user 消息

## MODIFIED Requirements

### Requirement: 学习详情页标题布局
学习详情页标题 SHALL 独占一行，按钮组在标题下方左对齐。

#### Scenario: 标题与按钮布局
- **WHEN** 用户访问 `/learn/[planId]` 页面
- **THEN** h1 标题独占一行（宽度 100%）
- **AND** 按钮组（重新生成 / 调整计划 / 全屏）在标题下方左对齐
- **AND** 超长标题正确换行（break-words）

### Requirement: 底部导航
底部导航 SHALL 包含 4 个 tab（今日 / 学习 / 复习 / 我的），不再包含 AI tab。

#### Scenario: 导航显示
- **WHEN** 用户在任意页面查看底部导航
- **THEN** 显示 4 个 tab：今日 / 学习 / 复习 / 我的
- **AND** 不显示 AI tab
- **AND** /chat 路由仍可直接访问（不删除路由）

### Requirement: 聊天输入区布局
聊天弹框底部输入区 SHALL 分为两行：上行快捷方式+模型图标，下行输入框+发送。

#### Scenario: 输入区布局
- **WHEN** 聊天弹框打开
- **THEN** 底部第一行显示快捷方式横滑条 + 模型图标组
- **AND** 底部第二行显示输入框 + 发送按钮（独占一行）
