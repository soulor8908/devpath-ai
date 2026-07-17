# Checklist

## 阶段 0：全局 Toast 组件
- [ ] `lib/toast.ts` 实现 pushToast / dismissToast / subscribeToasts / 4 个快捷方法
- [ ] `lib/hooks/use-toast.ts` 实现 useToasts / useDismissToast
- [ ] `components/Toast.tsx` 渲染 4 种类型 + 自动消失 + dark mode 适配 + 进出动画
- [ ] `lib/confirm-dialog.ts` 实现 Promise 化 confirmDialog
- [ ] `app/layout.tsx` 注入 `<ToastContainer />`，全局可用
- [ ] `__tests__/toast.test.ts` 单测通过（pushToast / dismissToast / confirmDialog Promise）
- [ ] Toast 在浅色 + 深色主题下对比度均 ≥ 4.5:1

## 阶段 1：番茄时钟 404 修复 + 全屏方向
- [ ] `/timer` 路由访问不再 404（本地 `npm run dev` 验证 + `npm run build` 后验证）
- [ ] `lib/hooks/use-auto-fullscreen.ts` 不再自动 `setNeedsPrompt(true)`
- [ ] `enterFullscreen` 调用 `screen.orientation.lock("portrait")`，不支持时静默 catch
- [ ] 学习详情页头部新增「全屏专注」按钮，点击触发全屏
- [ ] 番茄页头部新增「全屏」按钮
- [ ] 用户首次选择后偏好持久化到 localStorage（key=`fullscreen:dismissed`）
- [ ] 后续访问不再主动弹全屏提示
- [ ] `__tests__/use-auto-fullscreen.test.ts` 单测更新通过
- [ ] 移动设备实测：进入全屏后默认竖屏（非横屏）

## 阶段 2：用户 ID 脱敏与安全
- [ ] `lib/username-mask.ts` 新增 `maskUserId(userId)` 函数
- [ ] `components/SyncStatus.tsx` userId 输入框默认脱敏显示（前 4 + **** + 后 4）
- [ ] 「显示完整 ID」按钮可切换明文/脱敏
- [ ] 复制按钮始终复制完整 userId
- [ ] 「导入已有 ID」流程增加 `confirmDialog` 二次确认
- [ ] `__tests__/username-mask.test.ts` 新增 `maskUserId` 测试通过
- [ ] 审视：截图分享时 SyncStatus 不会泄露完整 userId

## 阶段 3：放开 API Token 限制
- [ ] `lib/auth.ts` `requireAuth` 在未配置 API_TOKEN 时返回 null（放行）
- [ ] 仅 `REQUIRE_API_TOKEN=true` 时启用 token 校验
- [ ] 503 错误文案改为「未配置 AI 模型」，移除「用户信息未找到」误导
- [ ] `__tests__/auth.test.ts` 单测更新通过
- [ ] 实测：未配置 API_TOKEN + 未配置 AI 模型时，调用 `/api/chat` 返回 503 + 新文案
- [ ] 实测：未配置 API_TOKEN + 已配置 AI 模型时，调用 `/api/chat` 正常返回（用户用自己的 API Key）

## 阶段 4：学习流程重构
- [ ] `app/api/learn/knowledge/route.ts` 创建，返回 `{ nodes: KnowledgeNode[] }`
- [ ] `app/api/learn/questions/route.ts` 创建，入参 nodes，返回 `{ questions: Question[] }`（answer 为空）
- [ ] `app/api/learn/answers/route.ts` 创建，流式返回每题答案
- [ ] 3 个新路由均接入 `requireAuth` + KV 限流
- [ ] `lib/presets/index.ts` `matchPresetByTopic` 改为精确匹配（仅 topic 完全相等才匹配）
- [ ] 实测：输入「前端性能优化」不再秒出「前端工程师」题库
- [ ] `components/LearnWizard.tsx` 4 步状态机实现完整
- [ ] Step 1 输入主题 → Step 2 调 `/api/learn/knowledge` 拆知识点 → 展示 MindMap
- [ ] Step 2 「调整重新生成」可追加 prompt 重新生成
- [ ] Step 2 「确认知识点」→ Step 3 调 `/api/learn/questions` → 展示题目列表
- [ ] Step 3 「确认题目」→ Step 4 调 `/api/learn/answers` 流式生成答案
- [ ] Step 4 完成后跳转 `/learn/[planId]`
- [ ] 每步失败时 toast.error + 重试按钮
- [ ] `app/learn/new/page.tsx` 接入 `<LearnWizard>`
- [ ] 原 `/api/learn` POST 路由保留（兼容「重新生成计划」入口）
- [ ] `__tests__/learn-wizard.test.ts` 单测通过

## 阶段 5：快捷输入智能推荐
- [ ] `lib/recommend-quick-inputs.ts` 实现 `getRecommendedQuickInputs(): Promise<string[]>`
- [ ] 数据源包含：input_history × 3 + LearnLog × 2 + ReviewLog × 1 + ChatMessage × 1
- [ ] 时近衰减正确（7 天前 × 0.3，3 天前 × 0.7，今天 × 1.0）
- [ ] 无数据时返回默认 4 个示例
- [ ] `lib/learn-input-history.ts` 实现 `recordInputHistory(topic)` 环形队列（最多 50 条）
- [ ] `app/learn/new/page.tsx`（或 LearnWizard）快捷输入动态加载
- [ ] 用户点击推荐词 → 填入主题输入框
- [ ] 用户提交主题后调 `recordInputHistory(topic)`
- [ ] `__tests__/recommend-quick-inputs.test.ts` 单测通过

## 阶段 6：全局替换 alert/confirm 为 Toast
- [ ] `components/PomodoroFull.tsx` 2 处 alert/confirm 替换为 toast/confirmDialog
- [ ] `components/SyncStatus.tsx` 1 处 confirm 替换
- [ ] `app/learn/new/page.tsx` 2 处 confirm 替换
- [ ] `app/profile/page.tsx` 1 处 confirm 替换
- [ ] `app/favorites/page.tsx` 2 处 confirm 替换
- [ ] `app/emotion/page.tsx` 1 处 confirm 替换
- [ ] `app/chat/ChatClient.tsx` 3 处 confirm 替换
- [ ] 全站 `window.alert` / `window.confirm` 调用为 0（grep 验证）
- [ ] 内联错误文案 `<p className="text-red-500">` 替换为 toast.error
- [ ] Toast 替换后功能等价（确认/取消行为一致）

## 阶段 7：学习统计按钮重设计
- [ ] `app/profile/page.tsx` 「学习统计」3 按钮 → 4 按钮
- [ ] 4 个按钮分别链接到 `/stats?tab=heatmap` / `/stats?tab=radar` / `/stats?tab=weekly` / `/mistakes`
- [ ] `app/stats/page.tsx` 读取 `?tab=` query 初始化 tab
- [ ] tab 参数无效时回退到 "heatmap"
- [ ] 实测：从 profile 点击「雷达图」→ 直接打开 stats 并显示雷达图 tab

## 阶段 8：默认浅色主题 + 深色模式可读性修复
- [ ] `lib/theme.ts` 默认主题改为 "light"
- [ ] `app/layout.tsx` inline script 默认值改为 'light'
- [ ] 首次访问（无 localStorage）默认浅色主题
- [ ] 已有用户切换过主题的不受影响（localStorage 仍生效）
- [ ] dark mode 对比度审计完成（7 个重点组件 + 其余组件抽查）
- [ ] `components/PomodoroFull.tsx` dark mode 对比度修复
- [ ] `app/HomeClient.tsx` dark mode 对比度修复
- [ ] `app/chat/ChatClient.tsx` dark mode 对比度修复
- [ ] `app/dashboard/DashboardClient.tsx` dark mode 对比度修复
- [ ] `app/u/[username]/UserPageClient.tsx` dark mode 对比度修复
- [ ] `app/profile/page.tsx` dark mode 对比度修复
- [ ] `app/stats/page.tsx` + `app/stats/ai-quality/page.tsx` dark mode 对比度修复
- [ ] 视觉验证：浅色主题下首屏所有文字可读
- [ ] 视觉验证：深色主题下首屏所有文字可读（对比度 ≥ 4.5:1 WCAG AA）

## 阶段 9：合并到 main
- [ ] `npx vitest run` 全部通过
- [ ] `npx tsc --noEmit` 无新增错误
- [ ] `npm run build` 通过（无 ESLint Error）
- [ ] 推送 develop 成功
- [ ] 合并到 main 成功
- [ ] 推送 main 成功
