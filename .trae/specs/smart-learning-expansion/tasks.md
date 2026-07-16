# Tasks

按"基础设施 → 单点功能 → 编排层 → 体验层"分阶段推进。每个 Task 都是可独立验证的小工作单元。

## 阶段 0：类型与存储基础

- [x] Task 0.1: 扩展 `lib/types.ts` 数据模型
  - [x] SubTask 0.1.1: 新增 `PomodoroSession` interface（含 sessionIndex / interruptions / energyBefore / energyAfter 字段）
  - [x] SubTask 0.1.2: 新增 `UserProfile` interface（skillLevel key 为 nodeId，含 accuracyByNode / goals.progress / preferredPersona）
  - [x] SubTask 0.1.3: 新增 `Achievement` interface + `HealthAlert` interface + `FeasibilityScore` interface（含 downgradePlan）
  - [x] SubTask 0.1.4: 新增 `NextAction` 联合类型 + `RhythmContext` interface
  - [x] SubTask 0.1.5: `LearningPlan` 新增可选字段 `deadline?: string` + `isDemo?: boolean`
  - [x] SubTask 0.1.6: `LearnLog.type` 联合类型新增 `"focus_session"`
  - [x] SubTask 0.1.7: `KEY_PREFIXES` 新增 `POMODORO_SESSION` / `USER_PROFILE` / `ACHIEVEMENT` / `PRIORITY_CACHE` / `RATE_LIMIT`
  - [x] SubTask 0.1.8: `AIScene` 新增 `"plan_generate"` / `"schedule_optimize"` / `"focus_session_start"`
  - [x] SubTask 0.1.9: `ClientAction.type` 新增 `"start_focus_session"` / `"reorder_schedule"` / `"generate_plan"`

## 阶段 1：番茄时钟（独立可用的最小闭环）

- [x] Task 1.1: 创建 `lib/timer/pomodoro.ts`
  - [x] SubTask 1.1.1: `createSession(params)` 创建 PomodoroSession 并持久化
  - [x] SubTask 1.1.2: `completeSession(id)` 标记完成 + 写 LearnLog(type=focus_session) + updateActualMinutes
  - [x] SubTask 1.1.3: `abandonSession(id, reason)` 标记放弃（不写 LearnLog）
  - [x] SubTask 1.1.4: `pauseSession(id)` / `resumeSession(id)` 暂停/恢复
  - [x] SubTask 1.1.5: `getRunningSession()` 查询当前进行中的 session
  - [x] SubTask 1.1.6: `recoverInterruptedSession()` 浏览器重启后恢复逻辑
- [x] Task 1.2: 创建 `lib/timer/pomodoro-rule.ts`
  - [x] SubTask 1.2.1: `getNextBreakType(sessionCount)` 判断短休息/长休息（4 个专注后长休息）
  - [x] SubTask 1.2.2: `getRecommendedDuration(type)` 返回推荐时长（focus=25, short=5, long=15）
  - [x] SubTask 1.2.3: 配置化：从 `Routine.intensity` 读取（light=15/5, standard=25/5, intensive=50/10）
- [x] Task 1.3: 创建 `lib/timer/session-tracker.ts`
  - [x] SubTask 1.3.1: `getTodayCount()` 返回今日已完成番茄数
  - [x] SubTask 1.3.2: `getTodayFocusMinutes()` 返回今日累计专注分钟
  - [x] SubTask 1.3.3: `getRecentSessions(days)` 返回最近 N 天的 session 列表
- [x] Task 1.4: 创建 `lib/timer/notification-permission.ts`
  - [x] SubTask 1.4.1: `requestPermission()` 封装 Notification.requestPermission
  - [x] SubTask 1.4.2: `notify(title, body)` 优先用系统通知，降级为页面 toast
  - [x] SubTask 1.4.3: 检测能力：无 Notification API 时静默降级
- [x] Task 1.5: 创建 `lib/timer/interruption-tracker.ts`
  - [x] SubTask 1.5.1: `startTracking(sessionId, onInterrupt)` 监听 visibilitychange + blur
  - [x] SubTask 1.5.2: `stopTracking()` 移除监听
  - [x] SubTask 1.5.3: 严格模式回调：3 次打断触发 onAbandon
- [x] Task 1.6: 创建 `components/PomodoroWidget.tsx`（右下角浮动组件）
  - [x] SubTask 1.6.1: 倒计时显示（MM:SS 格式）
  - [x] SubTask 1.6.2: 暂停/恢复/放弃按钮
  - [x] SubTask 1.6.3: 当前 session 任务描述展示
  - [x] SubTask 1.6.4: 打断次数提示（interruptions > 0 时显示红色徽标）
- [x] Task 1.7: 创建 `components/PomodoroFull.tsx` + `app/timer/page.tsx`
  - [x] SubTask 1.7.1: 全屏专注模式 UI（大号倒计时 + 任务描述）
  - [x] SubTask 1.7.2: 开始专注表单（任务描述 + 时长 + 关联 planId/nodeId）
  - [x] SubTask 1.7.3: 恢复未完成 session 的提示 UI
  - [x] SubTask 1.7.4: 完成后的"休息建议"卡片（5 分钟短休息 / 再来一个番茄）
- [x] Task 1.8: 单测 `__tests__/pomodoro.test.ts`
  - [x] SubTask 1.8.1: createSession + completeSession 流程
  - [x] SubTask 1.8.2: recoverInterruptedSession 超时自动完成
  - [x] SubTask 1.8.3: getNextBreakType 4-1 规则

## 阶段 2：用户画像（Profile）

- [x] Task 2.1: 创建 `lib/ai/memory/profile-builder.ts`
  - [x] SubTask 2.1.1: `aggregateStabilityByNode(cards): Record<nodeId, number>` 纯函数
  - [x] SubTask 2.1.2: `aggregateAccuracyByNode(reviewLogs): Record<nodeId, {correct, total}>` 纯函数
  - [x] SubTask 2.1.3: `inferSkillLevel(stability, accuracy): "beginner"|"intermediate"|"advanced"` 纯函数
  - [x] SubTask 2.1.4: `inferPreferredTimeSlots(learnLogs): string[]` 按小时聚合
  - [x] SubTask 2.1.5: `computeAverageSessionMinutes(energySamples): number`
  - [x] SubTask 2.1.6: `buildUserProfile(): Promise<UserProfile>` 主入口，并行调用上述函数
- [x] Task 2.2: 创建 `lib/ai/memory/user-profile.ts`（CRUD）
  - [x] SubTask 2.2.1: `getUserProfile()` 读取 IndexedDB
  - [x] SubTask 2.2.2: `saveUserProfile(profile)` 写入 + 标记 updatedAt
  - [x] SubTask 2.2.3: `maybeBuildProfile()` 若 updatedAt > 24h 则后台重建
- [x] Task 2.3: 创建 `lib/ai/memory/conversation-memory.ts`
  - [x] SubTask 2.3.1: `recordConversationTopic(message)` 提取用户提问主题摘要（前 30 字）
  - [x] SubTask 2.3.2: `getRecentTopics(days)` 返回最近 N 天的主题列表
  - [x] SubTask 2.3.3: 自动清理 7 天前的记录
- [x] Task 2.4: 修改 `lib/ai/chat-context.ts` 新增 `buildProfileContext(profile)`
  - [x] SubTask 2.4.1: 生成 ≤ 500 字符的画像文本片段
  - [x] SubTask 2.4.2: 在 `buildChatContext()` 末尾追加画像片段
- [x] Task 2.5: 修改 `lib/home.ts` 后台触发 `maybeBuildProfile()`
  - [x] SubTask 2.5.1: 在 `useHomeData` 的 `Promise.allSettled` 中追加 `maybeBuildProfile()`
- [x] Task 2.6: 创建 `components/UserProfileCard.tsx`
  - [x] SubTask 2.6.1: 展示 skillLevel Top 5 + 薄弱环节 + 偏好时段 + 平均专注时长
  - [x] SubTask 2.6.2: "手动重建画像"按钮（调用 buildUserProfile）
- [x] Task 2.7: 单测 `__tests__/profile-builder.test.ts`
  - [x] SubTask 2.7.1: inferSkillLevel 阈值判定
  - [x] SubTask 2.7.2: inferPreferredTimeSlots 时段聚合
  - [x] SubTask 2.7.3: buildUserProfile 幂等性（相同输入相同输出）

## 阶段 3：优先级引擎 + 精准计划

- [x] Task 3.1: 创建 `lib/ai/priority-engine.ts`
  - [x] SubTask 3.1.1: `computeDeadlineUrgency(plan): number` 0-1
  - [x] SubTask 3.1.2: `computeFsrsUrgency(plan, cards): number` 0-1（per-plan 聚合）
  - [x] SubTask 3.1.3: `computeSkillGap(nodeId, mistakes, cards): number` 0-1
  - [x] SubTask 3.1.4: `computeEnergyFit(energy, preferredSlots, currentTime): number` 0-1（含冷启动）
  - [x] SubTask 3.1.5: `computePriorityScore(task, ctx): number` 主公式
  - [x] SubTask 3.1.6: `rankTasks(tasks, ctx): RankedTask[]` 排序
  - [x] SubTask 3.1.7: 优先级缓存：`getCachedPriority(date)` / `setCachedPriority(date, result)`
- [x] Task 3.2: 创建 `lib/ai/plan-health.ts`
  - [x] SubTask 3.2.1: `planHealthCheck(): Promise<HealthAlert[]>` 实现 4 条规则
    - 逾期任务 > 3
    - 2 周完成率 < 50%
    - 能量趋势连续 3 天下降
    - FSRS 到期卡片积压 > 10
  - [x] SubTask 3.2.2: `shouldRunHealthCheck(date): boolean` 当日只跑一次
- [x] Task 3.3: 创建 `lib/ai/plan-feasibility.ts`
  - [x] SubTask 3.3.1: `predictActualMinutesWithFallback(model, energy, mood, availableMinutes)` 含冷启动
  - [x] SubTask 3.3.2: `scoreFeasibility(plan, profile, model): FeasibilityScore` 主逻辑
  - [x] SubTask 3.3.3: `suggestDowngrade(plan, feasibility): { reduceHoursPerWeek, reduceNewPerDay }` 降级建议
- [x] Task 3.4: 创建 `lib/ai/plan-generator.ts`
  - [x] SubTask 3.4.1: `generateLearningPlan(params, userProfile?): Promise<{ plan: LearningPlan; feasibility: FeasibilityScore }>` 主入口
  - [x] SubTask 3.4.2: 调用 `decomposeKnowledge(topic, prompt, undefined, model, userProfile)`
  - [x] SubTask 3.4.3: 用 `allocateDaily` 排日程
  - [x] SubTask 3.4.4: 调用 `scoreFeasibility` 评估
- [x] Task 3.5: 修改 `lib/ai/knowledge.ts` 的 `decomposeKnowledge()`
  - [x] SubTask 3.5.1: 新增 `userProfile?: UserProfile` 参数
  - [x] SubTask 3.5.2: 有画像时在 prompt 中注入"用户在 X 方面是入门水平，跳过高级内容；在 Y 方面是进阶，可加速"
  - [x] SubTask 3.5.3: 跳过 stability > 21 且 accuracy > 85% 的节点（从 ReviewCard + ReviewLog 聚合）
- [x] Task 3.6: 修改 `lib/ai/chat-tools.ts` 新增 3 个工具
  - [x] SubTask 3.6.1: `start_focus_session` 工具（返回 clientAction）
  - [x] SubTask 3.6.2: `generate_learning_plan` 工具（返回 clientAction）
  - [x] SubTask 3.6.3: `optimize_schedule` 工具（返回 clientAction: reorder_schedule）
- [x] Task 3.7: 修改 `app/api/chat/route.ts` 工具列表更新
  - [x] SubTask 3.7.1: 在 `TOOL_SYSTEM_SUFFIX` 追加新工具说明
- [x] Task 3.8: 单测 `__tests__/priority-engine.test.ts` + `__tests__/plan-feasibility.test.ts`
  - [x] SubTask 3.8.1: computePriorityScore 四权重组合
  - [x] SubTask 3.8.2: energy_fit 冷启动分支
  - [x] SubTask 3.8.3: scoreFeasibility confidence < 0.5 时返回 downgradePlan

## 阶段 4：节奏引擎 + AI 人格化（编排层）

- [x] Task 4.1: 创建 `lib/ai/rhythm-engine.ts`
  - [x] SubTask 4.1.1: 定义 `RhythmContext` interface（聚合 session / energy / cards / plans / routine / profile）
  - [x] SubTask 4.1.2: `getNextAction(ctx): Promise<NextAction>` 实现决策优先级链
  - [x] SubTask 4.1.3: `collectRhythmContext()` 从 IndexedDB 并行抓取所有信号
- [x] Task 4.2: 创建 `app/api/rhythm/route.ts`（GET）
  - [x] SubTask 4.2.1: 调用 `getNextAction` 返回 JSON
  - [x] SubTask 4.2.2: 鉴权用 `requireAuth({ dataOperation: true })`（不消耗 AI 额度）
- [x] Task 4.3: 修改 `components/CurrentTaskCard.tsx`
  - [x] SubTask 4.3.1: 从 routine-based 改为 rhythm-engine-based
  - [x] SubTask 4.3.2: 展示 NextAction.reason + 对应按钮（"开始专注" / "去复习" / "去休息"）
- [x] Task 4.4: 创建 `lib/ai/persona.ts`
  - [x] SubTask 4.4.1: 定义 4 种 Persona + 对应 system prompt 片段
  - [x] SubTask 4.4.2: `selectPersona(ctx): Persona` 选择逻辑
  - [x] SubTask 4.4.3: 用户 `preferredPersona` 覆盖逻辑
- [x] Task 4.5: 修改 `lib/ai/prompts.ts` 新增 `persona_snippets`
  - [x] SubTask 4.5.1: 注册 4 种 persona 的 prompt 片段
  - [x] SubTask 4.5.2: bump chat prompt version（v2 → v3）
- [x] Task 4.6: 修改 `app/api/chat/route.ts` 注入 persona
  - [x] SubTask 4.6.1: 调用 `selectPersona` 获取片段
  - [x] SubTask 4.6.2: 追加到 systemPrompt
- [x] Task 4.7: 修改 `app/profile/page.tsx` 新增 persona 设置
  - [x] SubTask 4.7.1: 单选"自动" / 4 种 persona
  - [x] SubTask 4.7.2: 保存到 `UserProfile.preferredPersona`
- [x] Task 4.8: 单测 `__tests__/rhythm-engine.test.ts` + `__tests__/persona.test.ts`
  - [x] SubTask 4.8.1: getNextAction 6 条决策优先级分支
  - [x] SubTask 4.8.2: selectPersona 4 种 persona 触发条件

## 阶段 5：专注环境保护 + 成就系统（体验层）

- [x] Task 5.1: 创建 `lib/timer/focus-guard.ts`
  - [x] SubTask 5.1.1: `startGuard(sessionId, mode, callbacks)` 启动保护
  - [x] SubTask 5.1.2: 严格模式：3 次打断触发 abandon
  - [x] SubTask 5.1.3: 宽松模式：只记录次数
  - [x] SubTask 5.1.4: `stopGuard()` 清理监听
- [x] Task 5.2: 修改 `components/PomodoroFull.tsx` 集成 focus-guard
  - [x] SubTask 5.2.1: 进入全屏时调用 `startGuard`
  - [x] SubTask 5.2.2: 退出时调用 `stopGuard`
  - [x] SubTask 5.2.3: 严格/宽松模式 toggle（从 UserProfile 读取）
- [x] Task 5.3: 创建 `lib/achievements/detector.ts`
  - [x] SubTask 5.3.1: 定义 15 个预置成就的判定规则
  - [x] SubTask 5.3.2: `detectNewAchievements(stats, sessions, logs): Achievement[]` 纯函数
  - [x] SubTask 5.3.3: `getAchievementProgress(type): number` 未解锁成就的进度
- [x] Task 5.4: 创建 `lib/achievements/store.ts`
  - [x] SubTask 5.4.1: `listAchievements()` 读取已解锁
  - [x] SubTask 5.4.2: `saveAchievement(a)` 持久化
  - [x] SubTask 5.4.3: `hasAchievement(id)` 查询
- [x] Task 5.5: 创建 `lib/achievements/index.ts` 统一入口
  - [x] SubTask 5.5.1: `checkAndNotify()` 检测 + 通知 + 持久化
- [x] Task 5.6: 修改 `lib/home.ts` 后台触发 `checkAndNotify()`
  - [x] SubTask 5.6.1: 在 `Promise.allSettled` 中追加
- [x] Task 5.7: 创建 `components/AchievementCard.tsx`
  - [x] SubTask 5.7.1: 新成就解锁通知卡片（首页顶部，可关闭）
  - [x] SubTask 5.7.2: 成就墙页面 `app/achievements/page.tsx`
- [x] Task 5.8: 修改 `app/u/[username]/UserPageClient.tsx`
  - [x] SubTask 5.8.1: 新增"成就墙"模块（可选展示，默认关闭）
- [x] Task 5.9: 单测 `__tests__/achievements.test.ts`
  - [x] SubTask 5.9.1: streak 3/7/30/100 阈值
  - [x] SubTask 5.9.2: first_time 成就只触发一次
  - [x] SubTask 5.9.3: recovery 断卡后 3 天内恢复

## 阶段 6：限流 + Demo 站

- [x] Task 6.1: 创建 `lib/ai/rate-limit.ts`
  - [x] SubTask 6.1.1: `checkRateLimit(userId, scene): Promise<{ allowed: boolean; remaining: number }>` 服务端
  - [x] SubTask 6.1.2: `incrementRateLimit(userId, scene): Promise<void>`
  - [x] SubTask 6.1.3: 场景配额表：chat=20 / plan=5 / weekly=1 / nudge=4 / other=5
  - [x] SubTask 6.1.4: `getClientRateLimitEstimate(scene): number` 客户端本地估算（仅 UI）
- [x] Task 6.2: 修改 `lib/storage/kv.ts` 新增限流方法
  - [x] SubTask 6.2.1: `getRateLimitCount(userId, scene, date): Promise<number>`
  - [x] SubTask 6.2.2: `incrementRateLimitCount(userId, scene, date): Promise<number>`
- [x] Task 6.3: 修改 `app/api/chat/route.ts` 接入限流
  - [x] SubTask 6.3.1: `useServerModel === true` 时调用 `checkRateLimit`
  - [x] SubTask 6.3.2: 超限返回 429 + `{ code: "RATE_LIMITED", scene, remaining: 0 }`
  - [x] SubTask 6.3.3: 成功调用后 `incrementRateLimit`
- [x] Task 6.4: 修改 `app/api/learn/route.ts` + `app/api/weekly/route.ts` + `app/api/daily-nudge/route.ts` 接入限流
  - [x] SubTask 6.4.1: 每个路由在 `requireAuth` 后调 `checkRateLimit`
- [x] Task 6.5: 创建 `app/api/rate-limit/route.ts`（GET 查询剩余次数）
  - [x] SubTask 6.5.1: 返回各场景的 `used / limit / remaining`
- [x] Task 6.6: 创建 `components/RateLimitBanner.tsx`
  - [x] SubTask 6.6.1: 聊天页底部展示"今日剩余 X 次"
  - [x] SubTask 6.6.2: 超限时显示 banner + "配置自己的 API Key"链接
- [x] Task 6.7: 创建 `lib/demo/preset-data.ts`
  - [x] SubTask 6.7.1: `injectDemoData()` 注入 frontend preset plan + 3 张 FSRS 卡片 + 2 天 LearnLog
  - [x] SubTask 6.7.2: `shouldInjectDemo()` 检测首次访问（无 plan: key）
  - [x] SubTask 6.7.3: `clearDemoData()` 清除所有 isDemo=true 的数据
- [x] Task 6.8: 修改 `app/HomeClient.tsx` 触发 Demo 注入
  - [x] SubTask 6.8.1: `useHomeData` 加载后若 `shouldInjectDemo()` 则异步注入
  - [x] SubTask 6.8.2: 注入后 reload 数据
- [x] Task 6.9: 修改 `app/learn/page.tsx` 创建真实计划后提示清除 Demo
  - [x] SubTask 6.9.1: 检测到 isDemo=true 的计划存在时，新计划创建后弹窗"是否清除示例数据"
- [x] Task 6.10: 单测 `__tests__/rate-limit.test.ts`
  - [x] SubTask 6.10.1: 配额判定
  - [x] SubTask 6.10.2: useServerModel=false 时跳过限流

## 阶段 7：首页集成 + 健康检查展示

- [x] Task 7.1: 修改 `lib/home.ts` 后台任务完整集成
  - [x] SubTask 7.1.1: 追加 `planHealthCheck()` + `detectAchievements()` + `maybeBuildProfile()`
  - [x] SubTask 7.1.2: 所有后台任务用 `Promise.allSettled` 并行
- [x] Task 7.2: 修改 `app/HomeClient.tsx` 展示 HealthAlert
  - [x] SubTask 7.2.1: 顶部可关闭卡片展示 HealthAlert
  - [x] SubTask 7.2.2: "一键采纳"按钮调用 `optimize_schedule` 工具
- [x] Task 7.3: E2E 测试 `e2e/main-flow.spec.ts` 扩展
  - [x] SubTask 7.3.1: 番茄时钟完整流程（开始 → 倒计时 → 完成 → LearnLog 写入）
  - [x] SubTask 7.3.2: Demo 数据注入 + 清除流程

# Task Dependencies

- 阶段 0（类型基础）是所有后续阶段的前置
- 阶段 1（番茄钟）独立于阶段 2/3，可与阶段 2 并行
- 阶段 2（画像）是阶段 3（精准计划/优先级）的前置（priority 需要 profile）
- 阶段 3（优先级引擎）是阶段 4（节奏引擎）的前置（rhythm 调用 priority）
- 阶段 4（节奏引擎）依赖阶段 1 + 2 + 3 全部完成
- 阶段 5（专注保护 + 成就）依赖阶段 1（番茄钟）
- 阶段 6（限流 + Demo）独立，可与阶段 4/5 并行
- 阶段 7（首页集成）依赖阶段 3 + 4 + 5 + 6

并行机会：
- 阶段 1 + 阶段 2 可并行
- 阶段 5 + 阶段 6 可并行（都依赖阶段 1，但不互相依赖）
