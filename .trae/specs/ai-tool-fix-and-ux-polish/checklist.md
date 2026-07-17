# Checklist

## 阶段 1：AI 工具执行链修复
- [x] `ChatClient.tsx` 流解析器 `type === "a"` 已改为 `type === "6"`
- [x] `6:` 前缀的 payload 能正确提取 `result.clientAction`
- [x] `pendingActions` 数组在工具调用后非空
- [x] `executeClientAction` 被调用
- [x] `start_focus_session` 跳转目标为 `/timer`（非 `/focus`）
- [x] `start_focus_session` 写入 running session（status `"running"`）
- [x] `PomodoroFull.tsx` 的 `getRunningSession()` 能识别 AI 启动的 session
- [x] `generate_learning_plan` 的 `learn:pending_plan` 被 `/learn/new` 读取
- [x] 工具执行成功显示 toast
- [x] 工具执行失败显示 toast.error
- [x] 端到端测试覆盖 `6:` 解析 → `executeClientAction` 链路

## 阶段 2：聊天体验优化
- [x] ModelIconSelector 是 popover（非平铺）
- [x] 触发按钮显示当前选中模型图标
- [x] 点击后上方弹出模型列表
- [x] ESC / 点击外部关闭
- [x] 追问 prefill 进入时新开对话（不恢复最近）
- [x] `sourceType/sourceId/sourceTitle` 被读取并组装 ChatSource
- [x] `createConversation` 透传 source
- [x] 消费后 URL 参数清除
- [x] 顶部 toolbar 有"历史"按钮
- [x] 历史抽屉显示对话列表
- [x] 支持切换/收藏/重命名/删除
- [x] 支持搜索过滤

## 阶段 3：复习卡片优化
- [x] 左滑 > 50px 切换下一条
- [x] 右滑 > 50px 切换上一条
- [x] < 10px 视为点击（不误触发滑动）
- [x] 元信息区删除按钮已删除
- [x] 底部操作行删除按钮保留
- [x] `findExistingCard` 支持 `planId + questionId` 查重（不要求 deckId）
- [x] 标记 learn_complete 时自动造卡
- [x] 单题星标收藏时造卡
- [x] 错题本 recordMistake 时造卡
- [x] 不重复造卡（查重生效）
- [x] 文档与实现一致

## 阶段 4：试题生成优化
- [x] `KEY_PREFIXES.PLAN_DRAFT` 已添加
- [x] LearnWizard 中间态持久化到 IndexedDB
- [x] 刷新/退出后可恢复
- [x] Step 3 完成按钮允许 `done < total`
- [x] 完成按钮标注"X 题未生成答案"
- [x] PlanDetailClient 对无答案题目显示"继续生成答案"按钮
- [x] 继续生成只补缺失题
- [x] `aiFetch` 有 60s 超时
- [x] 超时显示 toast"请求超时，请重试"
- [x] 超时后不卡死在 loading

## 阶段 5：质量门禁
- [x] `npm run lint` 0 error
- [x] `tsc --noEmit` 0 error
- [x] `npm test` 全部通过（571/571）
- [ ] 代码已 commit + push 到 origin/main
  - 5 个 commit 已就绪在本地 main，受沙箱无 GitHub 凭证所限 `git push` 失败
  - 需用户在本地或提供 GitHub Token 后重试
