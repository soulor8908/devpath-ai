# Tasks

按依赖关系分阶段，同阶段内可并行。

## 阶段 1：修复 AI 工具执行链（最高优先级，独立）

- [x] Task 1.1: 修复流解析器前缀 `a` → `6`
  - [x] 读取 `app/chat/ChatClient.tsx` 第 624-655 行 `parseDataLine` 函数
  - [x] 将 `if (type === "a")` 改为 `if (type === "6")`
  - [x] 验证 `pendingActions` 能正确提取 `clientAction`
- [x] Task 1.2: 修复 `start_focus_session` 二级 bug
  - [x] 跳转目标 `/focus` → `/timer`
  - [x] 写入逻辑改为 `KEY_PREFIXES.POMODORO_SESSION` 的 running session（status `"running"`），让 `getRunningSession()` 能识别
  - [x] 读取 `lib/timer/pomodoro.ts` 确认 running session 数据结构
- [x] Task 1.3: 修复 `generate_learning_plan` 二级 bug
  - [x] `app/learn/new/page.tsx` 增加 `sessionStorage["learn:pending_plan"]` 读取
  - [x] 命中则预填 topic + 跳过输入步骤，直接进 wizard
- [x] Task 1.4: 工具执行 UI 反馈
  - [x] `executeClientAction` 成功后显示 toast（如"番茄钟已启动"、"提醒已设置"）
  - [x] 失败显示 toast.error
- [x] Task 1.5: 端到端测试
  - [x] 新建 `__tests__/ai-tool-execution.test.ts`
  - [x] 测试 `6:` 前缀解析 → `pendingActions` 提取 → `executeClientAction` 调用

## 阶段 2：聊天体验优化（独立，可并行）

- [x] Task 2.1: ModelIconSelector popover 化
  - [x] 参考 QuickShortcuts.tsx 模式，加 `open` state + `containerRef`
  - [x] 触发按钮显示当前选中模型图标
  - [x] 上方弹出模型列表
  - [x] ESC / 点击外部关闭
- [x] Task 2.2: 追问新开对话
  - [x] `ChatClient.tsx` 初始化逻辑：`prefill` 存在且无 `conversationId` 时跳过恢复最近对话
  - [x] 调 `handleNewConversation` + `setInput(prefill)`
  - [x] 读取 `sourceType/sourceId/sourceTitle` 组装 `ChatSource`
  - [x] `handleSend` 的 `createConversation` 透传 `source`
  - [x] 消费后 `router.replace('/chat')`
- [x] Task 2.3: 恢复历史聊天入口
  - [x] 顶部 toolbar 加"历史"按钮触发 `setShowHistory(true)`
  - [x] 渲染历史抽屉，遍历 `filteredConversations`
  - [x] 每条接入 `switchConversation`/`handleTogglePin`/`handleDelete`/`handleRename`
  - [x] 加搜索框接 `setSearchQuery`

## 阶段 3：复习卡片优化（独立，可并行）

- [x] Task 3.1: 左右滑手势
  - [x] `ReviewCardView` 或外层容器加 `onTouchStart`/`onTouchMove`/`onTouchEnd`
  - [x] 左滑 > 50px → 下一条，右滑 > 50px → 上一条
  - [x] < 10px 视为点击
- [x] Task 3.2: 删除重复删除按钮
  - [x] 删除 `app/review/page.tsx` 第 459-464 行元信息区删除按钮
  - [x] 保留第 505-510 行底部操作行删除按钮
- [x] Task 3.3: 扩展 `findExistingCard` 查重
  - [x] `lib/fsrs.ts` 去掉 `deckId` 必填约束，支持 `planId + questionId` 查重
- [x] Task 3.4: 学习时自动造卡
  - [x] `PlanDetailClient.tsx` 标记 `learn_complete` 时为 nodeId 下未造卡 questions 调 `createCard`
- [x] Task 3.5: 单题星标造卡
  - [x] `QuestionCard.tsx` 星标收藏 true 时调 `createCard`
- [x] Task 3.6: 错题本造卡
  - [x] `lib/mistake-book.ts` `recordMistake` 时同步 `createCard`
- [x] Task 3.7: 修正文档
  - [x] `lib/docs-content.ts` 文档与实现一致

## 阶段 4：试题生成优化（独立，可并行）

- [x] Task 4.1: draft 持久化
  - [x] `lib/types.ts` `KEY_PREFIXES` 加 `PLAN_DRAFT`
  - [x] `LearnWizard.tsx` 中间态写入 IndexedDB
  - [x] 挂载时检查 draft，命中则恢复
- [x] Task 4.2: 完成条件放宽
  - [x] `LearnWizard.tsx` Step 3"完成"按钮允许 `done < total`（标注"X 题未生成答案"）
- [x] Task 4.3: 继续生成答案
  - [x] `PlanDetailClient.tsx` 对无答案题目新增"继续生成答案"按钮
  - [x] 调 `/api/learn/answers` 只补缺失题
- [x] Task 4.4: aiFetch 超时
  - [x] `lib/api-client.ts` `aiFetch` 加 `AbortController` + 60s 超时
  - [x] 超时显示 toast"请求超时，请重试"

## 阶段 5：质量门禁 + 同步

- [x] Task 5.1: `npm run lint` + `tsc --noEmit` + `npm test` 全绿（tsc 0 error / lint 0 error / 571/571 tests passed）
- [~] Task 5.2: commit + push 到 origin/main
  - [x] 5 个本地 commit 已就绪：76659df / bf08587 / a32a6db / decdddf / 7906402
  - [ ] **push 受阻**：当前沙箱环境无 GitHub 凭证（无 `GITHUB_TOKEN` / SSH key / `gh auth` / credential helper），`git push origin main` 报 `fatal: could not read Username for 'https://github.com'`
  - [ ] 需用户在本地环境执行 `git push origin main`，或在此沙箱提供 GitHub Token 后由助手重试

# Task Dependencies

- 阶段 1（AI 工具修复）独立，最高优先级
- 阶段 2（聊天）、阶段 3（复习）、阶段 4（试题）互相独立，可并行
- 阶段 5 依赖所有前置阶段完成
- Task 3.4/3.5/3.6 依赖 Task 3.3（查重扩展）
