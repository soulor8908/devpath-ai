# Tasks

## 阶段 0：学习详情页标题布局修复（独立小改动，可并行先行）

- [x] Task 0.1: 修改 `app/learn/[planId]/PlanDetailClient.tsx` 第 329 行标题布局
  - 将 `flex items-start justify-between gap-2 flex-wrap` 改为 `flex flex-col gap-3`
  - 按钮组容器（第 337 行）去掉 `shrink-0`，保留 `flex items-center gap-2`
  - 验证：标题独占一行，按钮组在标题下方左对齐，超长标题 break-words 正确换行

## 阶段 1：移除底部 AI tab + 浮动入口图标（基础设施）

- [x] Task 1.1: 从 `components/Nav.tsx` 移除 AI tab
  - 删除 `items` 数组中 `{ href: "/chat", label: "AI", icon: "chat" }` 一行
  - 验证：底部导航显示 4 个 tab（今日/学习/复习/我的），/chat 路由仍可直接访问

- [x] Task 1.2: 新建 `components/FloatingChatButton.tsx` 浮动可拖动入口图标
  - `position: fixed` 圆形按钮，默认位置右下角（bottom-20 right-4，Nav 上方）
  - pointer 事件实现拖动：pointerdown 记录起点 → pointermove 更新位置 → pointerup 判断点击/拖动
  - 移动距离 < 5px 视为点击（打开弹框），>= 5px 视为拖动
  - 拖动位置存 `localStorage` key `chat-fab-pos`（格式 `{x, y}`），mount 时恢复
  - 边界约束：拖动位置不超出视口（x ∈ [0, innerWidth-btnSize], y ∈ [0, innerHeight-btnSize]）
  - 点击时调用 `onOpen` 回调（由父组件控制弹框状态）
  - 图标用 Icon 组件的 `chat` 图标，深色背景（bg-black text-white），带轻微阴影

- [x] Task 1.3: 新建 `components/ChatModal.tsx` 满屏弹框容器
  - `fixed inset-0 z-[60] bg-white` 全屏覆盖（覆盖 Nav）
  - Props: `open: boolean`, `onClose: () => void`, `children: ReactNode`
  - open 为 false 时不渲染（return null）
  - 关闭方式：右上角 X 按钮 + ESC 键监听（useEffect addEventListener）
  - 防止 body 滚动：open 时 `document.body.style.overflow = 'hidden'`，关闭时恢复
  - 内部布局：顶部 header（标题 + X 按钮）+ 中间内容区（flex-1 overflow-y-auto）+ 底部（children 自带）

- [x] Task 1.4: 在 `app/layout.tsx` 挂载 FloatingChatButton + ChatModal
  - 新增状态 `const [chatOpen, setChatOpen] = useState(false)`
  - 渲染 `<FloatingChatButton onOpen={() => setChatOpen(true)} />`
  - 渲染 `<ChatModal open={chatOpen} onClose={() => setChatOpen(false)}>` 内嵌聊天内容
  - 聊天内容暂时复用 ChatClient 的核心逻辑（后续阶段重构）

## 阶段 2：ChatClient 弹框化 + 默认恢复上次对话

- [x] Task 2.1: 重构 `app/chat/ChatClient.tsx` 为弹框内使用
  - 移除 `fixed inset-0 bottom-16` 外层容器（由 ChatModal 提供）
  - 改为普通 flex-col 布局填充父容器（h-full）
  - 移除自带的历史抽屉（改为弹框内的侧边栏或简化）
  - 顶部 header 由 ChatModal 提供，ChatClient 不再渲染自己的 header

- [x] Task 2.2: 实现默认恢复上次对话
  - 弹框打开时（open 变为 true 的 useEffect）：
    - 若无 `?conversationId` URL 参数
    - 调用 `listConversations()` 获取对话列表
    - 若列表非空，自动选中 `conversations[0]`（已按 pinned 优先 + lastMessageAt 倒序）
    - 加载该对话的消息
  - 若列表为空，保持空对话状态（显示快捷方式引导）
  - 避免重复加载：用 ref 标记是否已初始化

## 阶段 3：快捷方式常驻 + 模型图标化 + 输入框重排

- [x] Task 3.1: 新建快捷方式横滑条组件
  - 从 `lib/ai/tool-registry.ts` 导入 `TOOL_REGISTRY`
  - 渲染横向滚动条（`overflow-x-auto flex gap-2`）
  - 每个工具显示：圆形图标背景 + 工具 icon + 截断的 quickPrompts[0]（前 8 字 + …）
  - 点击 → 调用 `onSelect(quickPrompts[0])` 填入输入框
  - 样式：`shrink-0 px-3 py-1.5 bg-gray-100 rounded-full text-xs` 

- [x] Task 3.2: 新建模型图标选择器组件
  - 从 `listModelConfigs()` 获取模型列表
  - 每个模型渲染为圆形图标：provider 首字母大写 + 品牌色背景
    - glm=#3b82f6 / deepseek=#10b981 / mimo=#f59e0b / kimi=#8b5cf6 / custom=#6b7280
  - 当前 `selectedModelId` 对应的图标高亮（ring-2 ring-offset-1）
  - 点击图标 → `onSelect(model.id)` 切换模型
  - 无配置时显示 "+" 图标，点击跳转 `/profile`
  - 放在快捷方式横滑条右边（同一行，用分隔符或间距区分）

- [x] Task 3.3: 重排底部输入区为两行布局
  - 第一行（上方）：快捷方式横滑条 + 模型图标组（flex items-center）
  - 第二行（下方）：textarea 输入框 + 发送按钮（独占一行）
  - 移除原"提示词库按钮"（快捷方式已常驻）
  - 移除原模型 `<select>` 下拉框（被图标选择器替代）
  - 输入框样式：`flex-1 resize-none` + 发送按钮 `shrink-0`

## 阶段 4：最新用户消息编辑 + 刷新按钮

- [x] Task 4.1: 实现用户消息编辑功能
  - 新增状态：`editingMessageId: string | null`, `editContent: string`
  - 仅最新一条 user 消息显示"编辑"按钮（hover 显示，与删除按钮并列）
  - 点击编辑：设置 `editingMessageId = msg.id`, `editContent = msg.content`
  - 编辑态：user 气泡变为 `<textarea>` + "保存"/"取消" 按钮
  - 保存：`deleteMessagesFrom(msg.id)` → `addMessage(conversationId, "user", editContent)` → `streamAIResponse` → 清除编辑态
  - 取消：清除 `editingMessageId` 和 `editContent`

- [x] Task 4.2: 实现最新用户消息下方刷新按钮
  - 修改 `handleRegenerateAnswer`：新增以 user 消息为锚点的重载
    - 输入 userMsgId → 找到该 user 消息对应的下一条 assistant 消息
    - `deleteMessagesFrom(assistantMsgId)` 删除 AI 回答及之后所有
    - `streamAIResponse` 用该 user 消息内容重新回答
  - 仅最新一条 user 消息下方显示刷新按钮（refresh-cw 图标）
  - 条件：`!streaming && messages.length > 0 && msg.role === "user" && msg === lastUserMessage`
  - 移除原 assistant 消息下方的刷新按钮（避免重复入口）

## 阶段 5：质量门禁 + 提交推送

- [x] Task 5.1: 运行质量门禁验证
  - `npm run lint`（0 error）
  - `node_modules/.bin/tsc --noEmit`（0 error）
  - `npm test`（全部通过）
  - 本地 `wrangler pages dev` 验证：浮动图标显示、拖动、点击打开弹框、聊天正常

- [x] Task 5.2: commit + push 到远程 main 分支
  - 按用户规则同步代码到远程分支
  - 回复是否成功

# Task Dependencies

- Task 0.1 无依赖，可最先并行执行
- Task 1.1 / 1.2 / 1.3 互相独立，可并行
- Task 1.4 依赖 1.2 + 1.3（挂载需要两个组件存在）
- Task 2.1 依赖 1.4（弹框容器就绪后重构 ChatClient）
- Task 2.2 依赖 2.1
- Task 3.1 / 3.2 互相独立，可并行
- Task 3.3 依赖 3.1 + 3.2（重排需要两个子组件）
- Task 4.1 / 4.2 互相独立，可并行（但都依赖 2.1 的弹框化完成）
- Task 5.1 依赖所有前置任务
- Task 5.2 依赖 5.1
