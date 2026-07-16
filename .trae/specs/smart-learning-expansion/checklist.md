# Verification Checklist

## 阶段 0：类型与存储基础
- [x] `lib/types.ts` 新增 `PomodoroSession` interface 包含 sessionIndex / interruptions / energyBefore / energyAfter 字段
- [x] `lib/types.ts` 新增 `UserProfile` interface，skillLevel key 明确为 nodeId
- [x] `lib/types.ts` 新增 `Achievement` / `HealthAlert` / `FeasibilityScore`（含 downgradePlan）interface
- [x] `lib/types.ts` 新增 `NextAction` 联合类型 + `RhythmContext` interface
- [x] `LearningPlan` 新增 `deadline?: string` + `isDemo?: boolean` 可选字段
- [x] `LearnLog.type` 联合类型包含 `"focus_session"`
- [x] `KEY_PREFIXES` 新增 POMODORO_SESSION / USER_PROFILE / ACHIEVEMENT / PRIORITY_CACHE / RATE_LIMIT
- [x] `AIScene` 新增 plan_generate / schedule_optimize / focus_session_start
- [x] `ClientAction.type` 新增 start_focus_session / reorder_schedule / generate_plan
- [x] `npm run typecheck` 通过（无类型错误，仅预存的 observability.test.ts vitest mock 类型问题）

## 阶段 1：番茄时钟
- [x] `lib/timer/pomodoro.ts` 提供 createSession / completeSession / abandonSession / pauseSession / resumeSession / getRunningSession / recoverInterruptedSession 7 个函数
- [x] completeSession 同时写入 LearnLog(type=focus_session) + 调用 updateActualMinutes
- [x] recoverInterruptedSession 超时（距 startedAt > durationMinutes）自动标记 completed
- [x] `lib/timer/pomodoro-rule.ts` 实现 4-1 长休息规则
- [x] `lib/timer/session-tracker.ts` 提供 getTodayCount / getTodayFocusMinutes / getRecentSessions
- [x] `lib/timer/notification-permission.ts` 权限拒绝时降级为 toast
- [x] `lib/timer/interruption-tracker.ts` 监听 visibilitychange + blur，严格模式 3 次打断触发 onAbandon
- [x] `components/PomodoroWidget.tsx` 右下角浮动，显示倒计时 + 打断次数
- [x] `app/timer/page.tsx` 全屏专注模式 + 恢复未完成 session 提示
- [x] `__tests__/pomodoro.test.ts` 覆盖 createSession + completeSession + recoverInterruptedSession + getNextBreakType

## 阶段 2：用户画像
- [x] `lib/ai/memory/profile-builder.ts` 的 6 个聚合函数全部纯函数化
- [x] inferSkillLevel 阈值：stability>21 + accuracy>85% → advanced；stability<7 或 accuracy<60% → beginner
- [x] `lib/ai/memory/user-profile.ts` 提供 getUserProfile / saveUserProfile / maybeBuildProfile
- [x] maybeBuildProfile 在 updatedAt > 24h 时触发重建
- [x] `lib/ai/memory/conversation-memory.ts` 存储最近 7 天提问主题摘要
- [x] `buildProfileContext(profile)` 输出 ≤ 500 字符
- [x] `buildChatContext()` 末尾追加画像片段
- [x] `lib/home.ts` 的 useHomeData 后台任务包含 maybeBuildProfile
- [x] `components/UserProfileCard.tsx` 展示 skillLevel Top 5 + 薄弱环节 + 偏好时段 + 平均专注时长
- [x] `__tests__/profile-builder.test.ts` 覆盖 inferSkillLevel + inferPreferredTimeSlots + 幂等性

## 阶段 3：优先级引擎 + 精准计划
- [x] `lib/ai/priority-engine.ts` 实现 4 个 0-1 归一化权重函数 + 主公式
- [x] computeEnergyFit 在无 DailyStatus 时使用 preferredTimeSlots 冷启动
- [x] 优先级缓存以 `priority_cache:<date>` 为 key，当日有效
- [x] `lib/ai/plan-health.ts` 实现 4 条健康检查规则
- [x] `lib/ai/plan-feasibility.ts` predictActualMinutesWithFallback 在无模型时返回 availableMinutes * 0.7
- [x] scoreFeasibility 在 confidence < 0.5 时返回 feasible=false + downgradePlan
- [x] `lib/ai/plan-generator.ts` 输出 LearningPlan + FeasibilityScore
- [x] `lib/ai/knowledge.ts` 的 decomposeKnowledge 新增 userProfile 参数
- [x] 有 userProfile 时 prompt 注入画像段落 + 跳过已掌握节点
- [x] `lib/ai/chat-tools.ts` 新增 start_focus_session / generate_learning_plan / optimize_schedule 3 个工具
- [x] `app/api/chat/route.ts` 的 TOOL_SYSTEM_SUFFIX 更新
- [x] `__tests__/priority-engine.test.ts` 覆盖 computePriorityScore + energy_fit 冷启动
- [x] `__tests__/plan-feasibility.test.ts` 覆盖 confidence < 0.5 + downgradePlan

## 阶段 4：节奏引擎 + AI 人格化
- [ ] `lib/ai/rhythm-engine.ts` 的 getNextAction 实现 6 条决策优先级
- [ ] 决策链：running session > energy≤2 > FSRS 到期 > routine 时段 > 接近睡眠 > 默认 learn
- [ ] `app/api/rhythm/route.ts` GET 接口返回 NextAction JSON
- [ ] `components/CurrentTaskCard.tsx` 改用 rhythm-engine，展示 reason + 对应按钮
- [ ] `lib/ai/persona.ts` 定义 4 种 Persona + selectPersona 选择逻辑
- [ ] `lib/ai/prompts.ts` 新增 persona_snippets 注册表 + bump chat version
- [ ] `app/api/chat/route.ts` 注入 persona 片段到 systemPrompt
- [ ] `app/profile/page.tsx` 新增 persona 设置（自动 / 4 种手动）
- [ ] UserProfile.preferredPersona 覆盖自动选择
- [ ] `__tests__/rhythm-engine.test.ts` 覆盖 6 条决策分支
- [ ] `__tests__/persona.test.ts` 覆盖 4 种 persona 触发条件

## 阶段 5：专注环境保护 + 成就系统
- [x] `lib/timer/focus-guard.ts` 严格模式 3 次打断触发 abandon
- [x] 宽松模式只记录打断次数不暂停
- [x] `components/PomodoroFull.tsx` 集成 focus-guard，进入全屏启动 / 退出停止
- [x] 严格/宽松模式 toggle 从 UserProfile 读取
- [x] `lib/achievements/detector.ts` 定义 15 个预置成就判定规则
- [x] detectNewAchievements 纯函数，相同输入相同输出
- [x] `lib/achievements/store.ts` 提供 listAchievements / saveAchievement / hasAchievement
- [x] `lib/achievements/index.ts` 的 checkAndNotify 检测 + 通知 + 持久化
- [x] `lib/home.ts` 后台任务包含 checkAndNotify
- [x] `components/AchievementCard.tsx` 新成就通知卡片（首页顶部，可关闭）
- [x] `app/achievements/page.tsx` 成就墙页面
- [x] `app/u/[username]/UserPageClient.tsx` 新增成就墙模块（默认关闭）
- [x] `__tests__/achievements.test.ts` 覆盖 streak 阈值 + first_time 只触发一次 + recovery

## 阶段 6：限流 + Demo 站
- [x] `lib/ai/rate-limit.ts` checkRateLimit + incrementRateLimit 实现
- [x] 场景配额：chat=20 / plan=5 / weekly=1 / nudge=4 / other=5
- [x] `lib/storage/kv.ts` 新增 getRateLimitCount + incrementRateLimitCount
- [x] `app/api/chat/route.ts` 在 useServerModel=true 时调用限流，超限返回 429
- [x] `app/api/learn/route.ts` + `app/api/weekly/route.ts` + `app/api/daily-nudge/route.ts` 接入限流
- [x] useServerModel=false（用户自带 modelConfig）时完全跳过限流
- [x] `app/api/rate-limit/route.ts` GET 返回各场景 used/limit/remaining
- [x] `components/RateLimitBanner.tsx` 展示剩余次数 + 超限提示
- [x] `lib/demo/preset-data.ts` injectDemoData 注入 frontend preset + 3 张卡片 + 2 天 LearnLog
- [x] shouldInjectDemo 检测首次访问（无 plan: key）
- [x] Demo 数据标记 isDemo=true
- [x] `app/HomeClient.tsx` 首次访问触发 Demo 注入
- [x] `app/learn/page.tsx` 创建真实计划后提示清除 Demo
- [x] `__tests__/rate-limit.test.ts` 覆盖配额判定 + useServerModel=false 跳过

## 阶段 7：首页集成
- [ ] `lib/home.ts` useHomeData 后台任务包含 planHealthCheck + detectAchievements + maybeBuildProfile
- [ ] 所有后台任务用 Promise.allSettled 并行，失败静默
- [ ] `app/HomeClient.tsx` 顶部展示 HealthAlert 可关闭卡片
- [ ] HealthAlert 卡片支持"一键采纳"按钮调用 optimize_schedule
- [ ] `e2e/main-flow.spec.ts` 扩展番茄时钟完整流程测试
- [ ] `e2e/main-flow.spec.ts` 扩展 Demo 数据注入 + 清除测试

## 全局质量门禁
- [ ] `npm run typecheck` 通过
- [ ] `npm test` 所有单测通过（含新增 5 个测试文件）
- [ ] `npm run test:e2e` 主流程 E2E 通过
- [ ] 无 lint 警告（`npm run lint`）
- [ ] 新增 prompt 修改已 bump version（prompts.test.ts 快照更新）
- [ ] chat-context 总体积 ≤ 2.3KB（学习状态 1.5KB + 画像 500B + persona 200B）
- [ ] PomodoroSession 完成路径不阻塞 UI（所有 IO 异步）
- [ ] 限流逻辑不影响用户自带 modelConfig 的请求
