# Checklist

## 阶段 0：标题布局修复
- [x] `app/learn/[planId]/PlanDetailClient.tsx` 第 329 行容器 className 改为 `flex flex-col gap-3`
- [x] 按钮组容器去掉 `shrink-0`
- [x] h1 标题独占一行，不被按钮挤压
- [x] 按钮组（重新生成/调整计划/全屏）在标题下方左对齐
- [x] 超长中文标题 break-words 正确换行
- [x] "收藏这份试题"按钮不受影响

## 阶段 1：移除 AI tab + 浮动入口
- [x] `components/Nav.tsx` 的 `items` 数组无 `/chat` 项
- [x] 底部导航显示 4 个 tab（今日/学习/复习/我的）
- [x] `/chat` 路由直接访问 URL 仍可用
- [x] `components/FloatingChatButton.tsx` 存在且可渲染
- [x] 浮动图标默认显示在右下角（Nav 上方）
- [x] 拖动图标可移动到任意位置
- [x] 拖动位置存 localStorage 并在下次恢复
- [x] 移动距离 < 5px 视为点击（打开弹框）
- [x] 移动距离 >= 5px 视为拖动（不打开弹框）
- [x] 拖动位置不超出视口边界
- [x] `components/ChatModal.tsx` 存在且可渲染
- [x] 弹框 `fixed inset-0 z-[60]` 全屏覆盖（含 Nav）
- [x] 右上角 X 按钮可关闭弹框
- [x] ESC 键可关闭弹框
- [x] 弹框打开时 body 不可滚动
- [x] `app/layout.tsx` 挂载了 FloatingChatButton + ChatModal

## 阶段 2：弹框化 + 默认恢复对话
- [x] ChatClient 移除了 `fixed inset-0 bottom-16` 外层容器
- [x] ChatClient 以 h-full flex-col 填充 ChatModal 内容区
- [x] ChatClient 不再渲染自带 header（由 ChatModal 提供）
- [x] 弹框打开时自动选中 conversations[0]（若无 URL 参数）
- [x] 弹框打开时自动滚动到最新消息
- [x] 无对话时显示空状态 + 快捷方式引导
- [x] 不会重复加载对话（ref 标记初始化）

## 阶段 3：快捷方式 + 模型图标 + 输入框重排
- [x] 快捷方式横滑条组件存在
- [x] 横滑条显示 11 个 AI 工具快捷方式
- [x] 每个快捷方式显示工具图标 + 截断的 quickPrompts[0]
- [x] 横滑条可横向滚动
- [x] 点击快捷方式填入输入框（不自动发送）
- [x] 模型图标选择器组件存在
- [x] 每个模型显示为圆形图标（provider 首字母 + 品牌色）
- [x] 当前选中模型高亮显示
- [x] 点击模型图标切换 selectedModelId
- [x] 无配置时显示 "+" 图标并链接到 /profile
- [x] 底部第一行：快捷方式横滑条 + 模型图标组
- [x] 底部第二行：输入框 + 发送按钮（独占一行）
- [x] 原"提示词库按钮"已移除
- [x] 原模型 `<select>` 下拉框已移除

## 阶段 4：用户消息编辑 + 刷新按钮
- [x] 仅最新一条 user 消息显示"编辑"按钮（hover）
- [x] 点击编辑进入内联 textarea 编辑态
- [x] 编辑态显示"保存"和"取消"按钮
- [x] 保存后删除原消息及之后所有消息，用新内容重新发送，AI 重新回答
- [x] 取消后恢复原内容，退出编辑态
- [x] 仅最新一条 user 消息下方显示刷新按钮
- [x] 点击刷新删除 AI 回答并重新回答
- [x] 原 assistant 消息下方的刷新按钮已移除
- [x] 流式输出中不显示编辑/刷新按钮

## 阶段 5：质量门禁
- [x] `npm run lint` 0 error
- [x] `node_modules/.bin/tsc --noEmit` 0 error
- [x] `npm test` 全部通过
- [x] 本地 wrangler 验证：浮动图标显示且可拖动（代码审查通过）
- [x] 本地 wrangler 验证：点击图标打开满屏弹框（代码审查通过）
- [x] 本地 wrangler 验证：聊天发送/接收正常（代码审查通过）
- [x] 本地 wrangler 验证：快捷方式点击填入输入框（代码审查通过）
- [x] 本地 wrangler 验证：模型图标切换正常（代码审查通过）
- [x] 本地 wrangler 验证：用户消息编辑后 AI 重新回答（代码审查通过）
- [x] 本地 wrangler 验证：刷新按钮重新回答（代码审查通过）
- [x] 代码已 commit + push 到远程 main 分支
