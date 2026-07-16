# 智能化学习系统扩展 Spec

## Why

当前 devpath-ai 已具备知识拆解、FSRS 复习、能量回归、情绪觉察、AI 聊天工具等能力，但用户在实际学习过程中仍面临三个核心痛点：

1. **缺乏执行层抓手**：AI 能告诉你"接下来学什么"，但没有"现在就开始学"的强执行机制。用户看到建议后容易拖延，缺少番茄钟这类把"建议"转化为"行动"的工具。
2. **AI 对用户一无所知**：当前 chat-context 只注入"当前在学什么"，不注入"用户是什么样的人"。同样的"闭包"问题，对入门者和进阶者应该有不同深度的回答；同样的"每日 45 分钟"计划，对历史平均 30 分钟的用户可行性很低。
3. **多系统割裂**：FSRS、能量回归、错题本、学习计划各自独立，没有一个"指挥官"把它们编排成统一的"现在该做什么"决策。优先级引擎、精准计划各自设计，但缺少与番茄钟、画像的协同。

用户提出的 5 个功能（番茄时钟、用户画像、精准计划、优先级引擎、Demo 站+限流）方向正确，但在数据模型完备性、跨系统集成、边界场景处理上存在不足。本 spec 在补全这些不足的同时，新增 4 个高价值功能（学习节奏引擎、AI 人格化、专注环境保护、成就系统），把分散的能力收敛为统一的智能化学习体验。

## What Changes

### 一、对原 5 个功能的补全

#### 1. 番茄时钟 — 补全 7 处不足

- **BREAKING**: `PomodoroSession` 增加 `sessionIndex`（今日第几个番茄）、`interruptions`（被打断次数）、`energyBefore` / `energyAfter`（开始/结束时能量，供能量回归模型使用）字段
- 增加 `lib/timer/pomodoro-rule.ts`：经典番茄规则（4 个专注后 1 个长休息），可配置
- 增加 `lib/timer/interruption-tracker.ts`：visibilitychange 事件监听，番茄进行中切走标签页记一次打断
- 增加 `lib/timer/notification-permission.ts`：通知权限请求 + 降级方案（权限拒绝时用页面内 toast + 声音）
- 增加 `app/timer/page.tsx` 的全屏专注模式（`PomodoroFull` 组件）：隐藏导航、屏蔽非必要通知
- LearnLog 新增 `type: "focus_session"`，记录 `duration` 字段为实际专注分钟数（替代旧的 `duration` 兼容字段语义）
- PomodoroSession 完成时同步写入 `EnergySample.actualMinutes`（已有 `updateActualMinutes`），并在 `energyBefore`/`energyAfter` 不同时触发 `maybeRetrain`
- 跨会话连续性：`sessionTracker.getTodayCount()` 返回今日已完成番茄数，用于长休息判定
- 浏览器关闭恢复：`status: "running"` 的 session 在 `app/timer/page.tsx` 加载时检测，若距 `startedAt` 已超过 `durationMinutes` 则自动标记 completed，否则提示用户"上次有未完成番茄，是否继续/放弃"

#### 2. 用户画像 — 补全 6 处不足

- **BREAKING**: `UserProfile.skillLevel` 的 key 明确为 `nodeId`（不是模糊的 string），与 `KnowledgeNode.id` 对齐
- 新增 `accuracyByNode: Record<string, { correct: number; total: number }>` 派生字段，从 `ReviewLog` 聚合，作为 skillLevel 判定的第二维度（stability 来自 ReviewCard，accuracy 来自 ReviewLog）
- `weakAreas` / `strongAreas` 不再重复存储 nodeId 列表，改为从 `LearnStats.weakAreas` + `MistakeRecord` + `ReviewCard.stability` 实时派生（避免数据冗余和不同步）
- `goals` 增加 `progress?: number`（0-1）和 `targetDate?: string`，让目标可追踪
- `conversation-memory.ts` 明确职责：存储最近 7 天的"用户提问主题摘要"（不是完整对话），用于 AI 判断用户兴趣点
- 画像同步：`UserProfile` 加入 `KEY_PREFIXES.USER_PROFILE = "user:profile:"`，通过现有 `UserBackup` 增量同步机制跨设备
- 画像构建幂等：`profile-builder.ts` 的所有聚合函数纯函数化，相同输入产出相同画像，便于单测和缓存
- 隐私：画像只存 IndexedDB 和用户自己的 KV backup，不进入公开主页 `/u/<username>`

#### 3. 精准计划 — 补全 5 处不足

- **BREAKING**: `FeasibilityScore` 增加 `downgradePlan?: { reduceHoursPerWeek?: number; reduceNewPerDay?: number }`，当 `confidence < 0.5` 时不仅标记不可行，还给出具体的降级参数
- `decomposeKnowledge()` 修改：新增 `userProfile?: UserProfile` 参数；跳过逻辑明确为"聚合该 topic 下所有 ReviewCard 的 stability 均值 > 21 且 accuracy > 85% 的节点"，而非"skillLevel=advanced"（因为 skillLevel 是 topic 级别，节点级别需要从卡片聚合）
- `plan-generator.ts` 输出明确为 `LearningPlan`（与现有 `/api/learn` 输出一致），并通过现有 `setItem(KEY_PREFIXES.PLAN + plan.id, plan)` 持久化
- 新计划与旧计划的关系：默认并存（不替换），但若用户在 chat 中明确说"重新规划"，则旧计划标记 `frozen: true`
- `constraints.preferred_times` 与 `Routine.slots` 统一：plan-generator 优先使用 `Routine.slots`，`preferred_times` 作为覆盖项
- 冷启动：新用户无能量回归模型时，`predictActualMinutes` 返回 `availableMinutes * 0.7`（经验系数），并在 `FeasibilityScore.risks` 中标注"模型未训练，预测为经验估值"

#### 4. 优先级引擎 — 补全 6 处不足

- **BREAKING**: `priority_score` 公式的 `deadline_urgency` 明确数据源：`LearningPlan` 新增可选字段 `deadline?: string`（ISO），用户可在计划详情页设置；无 deadline 时该项为 0
- `fsrs_urgency` 改为 per-plan 聚合：`该计划下到期卡片数 / max(1, 该计划总卡片数)`，而非全局到期数
- `skill_gap` 明确：per-task 计算时取 `task.nodeId` 对应的 `MistakeRecord.wrongCount` + `ReviewCard.lapses`，归一化到 0-1
- `energy_fit` 冷启动：今日未记录 `DailyStatus` 时，使用 `UserProfile.preferredTimeSlots` 判断当前是否在偏好时段，是=1，否=0.5
- `optimize_schedule` 返回 `OptimizeResult`：`{ reorderedTaskIds: string[]; reasoning: string; alerts: HealthAlert[] }`，并通过新的 `clientAction: "reorder_schedule"` 持久化到 `LearningPlan.schedule` 的 `customOrder`
- `planHealthCheck()` 返回的 `HealthAlert[]` 在首页 `HomeClient` 顶部以可关闭的卡片展示，并支持"一键采纳建议"（如"重新排优先级"按钮直接调用 `optimize_schedule`）
- 优先级缓存：计算结果以 `priority_cache:<date>` 为 key 存 IndexedDB，当日有效，避免每次首页加载都重算

#### 5. Demo 站 + 限流 — 补全 4 处不足

- 限流计数以服务端 KV 为准，客户端计数仅作 UI 提示（显示"今日剩余 X 次"）
- KV key 改为 `ratelimit:{userId}:{scene}:{date}`，按场景分别计数（chat: 20、plan: 5、weekly: 1、nudge: 4、other: 5），总计不超过 35 次/天
- 用户自带 `modelConfig`（含 apiKey）的请求完全跳过限流（服务端通过 `useServerModel === false` 判断）
- `userId` 来源：客户端从 IndexedDB 读取 `my:profile.username`，若无则生成基于 `crypto.randomUUID()` 的匿名 ID 存入 IndexedDB（防伪造：服务端校验 userId 格式，但本质是软限制）
- Demo 预置数据触发条件：首次访问且 IndexedDB 无任何 `plan:` key 时，自动注入 `frontend` preset 计划 + 3 张 FSRS 卡片 + 2 天 LearnLog
- Demo 数据标记 `isDemo: true`（加到 `LearningPlan` 可选字段），用户创建真实计划后提示"是否清除示例数据"

### 二、新增 4 个高价值功能

#### 功能 A：学习节奏引擎（Rhythm Engine）— 统一编排器

**Why**：番茄钟、优先级引擎、画像、计划各自独立，用户依然要自己拼凑"现在该干什么"。需要一个统一入口，把所有信号收敛成一个 action。

**设计**：
- 新增 `lib/ai/rhythm-engine.ts`
- 核心函数 `getNextAction(ctx: RhythmContext): Promise<NextAction>`
- `NextAction` 联合类型：
  - `{ type: "start_focus"; task: ScheduleItem; duration: number; reason: string }`
  - `{ type: "review"; cards: ReviewCard[]; reason: string }`
  - `{ type: "break"; minutes: number; reason: string }`
  - `{ type: "rest"; reason: string }`（能量过低时）
  - `{ type: "plan_next_day"; reason: string }`（晚间规划）
- 决策优先级：
  1. 当前有 running 的 PomodoroSession → 继续专注
  2. 能量 ≤ 2 → 建议休息（指引用户去 /rest）
  3. 有到期 FSRS 卡片且最近 1 小时无复习 → 先复习
  4. 当前时段在 `Routine.slots` 内 → 启动专注（用 Priority Engine 选 task）
  5. 接近 `Routine.sleepTime` → 建议复盘今天
  6. 默认 → 建议下一个 learn task
- 新增 API `app/api/rhythm/route.ts`（GET），供首页 `CurrentTaskCard` 调用
- 首页 `CurrentTaskCard` 改造：从 `getCurrentTask()`（基于 routine）升级为 `getNextAction()`（基于全信号）

#### 功能 B：AI 人格化（Persona-based AI）

**Why**：当前 AI 语气统一，无法适应用户状态。低能量时还用严厉语气会加剧放弃；高能量时太温和又浪费状态。

**设计**：
- 新增 `lib/ai/persona.ts`，定义 4 种人格：
  - `strict_coach`：严厉教练，高能量日 + 计划滞后时启用
  - `gentle_companion`：温和陪伴，低能量日 + 情绪低落时启用
  - `socratic_tutor`：苏格拉底式追问，深度技术问题时启用
  - `peer_dev`：平等同行，日常闲聊时启用
- `selectPersona(ctx: { energy: number; mood: string; streak: number; topic?: string }): Persona`
- 每种 persona 对应一段 system prompt 片段（追加到 `PROMPTS.chat.system` 之后）
- 在 `lib/ai/prompts.ts` 新增 `persona_snippets` 注册表
- 用户可在 profile 页手动覆盖自动选择（`UserProfile.preferredPersona?: Persona["id"]`）
- persona 选择记入 `AICallRecord` 的 `inputDigest`，便于归因分析哪种 persona 效果好

#### 功能 C：专注环境保护（Focus Protection）

**Why**：番茄钟只计时，不防打扰。用户开番茄钟后刷手机，timer 照样走完，actualMinutes 却是 0，污染能量回归模型。

**设计**：
- 新增 `lib/timer/focus-guard.ts`
- `PomodoroFull` 组件进入全屏模式，监听 `visibilitychange` / `blur` 事件
- 每次切走标签页：
  - 记录一次 `interruption`（写入 `PomodoroSession.interruptions`）
  - 暂停倒计时（可选，用户可在 settings 配置"严格模式"vs"宽松模式"）
  - 显示"你离开了 X 秒，专注已暂停"提示
- 严格模式：3 次打断后自动 abandoned 该番茄
- 宽松模式：只记录打断次数，不暂停
- 番茄完成时，若 `interruptions > 0`，`actualMinutes = durationMinutes - interruptions * 1`（每次打断扣 1 分钟，避免污染能量模型）
- 可选：白噪音播放（`/public/sounds/` 下预置 3 种：雨声、咖啡馆、纯白噪）

#### 功能 D：成就系统（Achievement System）

**Why**：现有 streak 是单一指标，无法激励长期学习。用户学完一个 topic 后没有"达成感"，容易流失。

**设计**：
- 新增 `lib/achievements/` 目录
- 数据模型 `Achievement`：
  ```ts
  interface Achievement {
    id: string;
    type: "streak" | "topic_mastery" | "focus_hours" | "review_streak" | "recovery" | "first_time";
    title: string;
    description: string;
    icon: string;  // icon name
    unlockedAt: string;  // ISO
    progress?: number;  // 0-1，未解锁时显示进度
  }
  ```
- 成就检测器 `lib/achievements/detector.ts`：纯函数，输入 `LearnStats + PomodoroSession[] + LearnLog[]`，输出新解锁的成就
- 触发时机：首页加载时后台异步检测，新成就通过浏览器通知 + 首页卡片展示
- 预置 15 个成就：
  - streak: 3/7/30/100 天
  - topic_mastery: 完成 1/3/10 个学习计划
  - focus_hours: 累计专注 10/50/200 小时
  - review_streak: 连续复习 7/30 天
  - recovery: 断卡后 3 天内恢复
  - first_time: 首次完成番茄 / 首次答对错题 / 首次生成周报
- 公开主页 `/u/<username>` 新增"成就墙"模块（可选展示，默认关闭）

## Impact

### Affected specs
- 现有 `lib/types.ts` 新增 4 个 interface（PomodoroSession / UserProfile / Achievement / FeasibilityScore）+ 1 个 type（NextAction）+ 3 个字段扩展（LearningPlan.deadline / LearningPlan.isDemo / DailyStatus 无变化）
- 现有 `lib/ai/chat-tools.ts` 新增 3 个工具（start_focus_session / generate_learning_plan / optimize_schedule）
- 现有 `lib/ai/chat-context.ts` 新增 `buildProfileContext()` 注入
- 现有 `lib/home.ts` 后台任务新增 `planHealthCheck()` + `detectAchievements()`
- 现有 `app/api/chat/route.ts` 新增限流逻辑 + persona 注入
- 现有 `lib/ai/knowledge.ts` 的 `decomposeKnowledge()` 签名变更（新增 userProfile 参数）

### Affected code
- 新增文件 23 个（见 tasks.md）
- 修改文件 11 个：`lib/types.ts` / `lib/ai/chat-tools.ts` / `lib/ai/chat-context.ts` / `lib/ai/knowledge.ts` / `lib/ai/prompts.ts` / `lib/home.ts` / `app/api/chat/route.ts` / `app/HomeClient.tsx` / `components/CurrentTaskCard.tsx` / `lib/storage/kv.ts`（新增限流方法）/ `app/profile/page.tsx`（persona 设置）
- 新增 API 路由 2 个：`app/api/rhythm/route.ts` / `app/api/rate-limit/route.ts`（查询剩余次数）

## ADDED Requirements

### Requirement: Pomodoro Session Lifecycle
系统 SHALL 提供完整的番茄时钟生命周期管理，包括启动、暂停、恢复、完成、放弃、异常恢复。

#### Scenario: 正常完成
- **WHEN** 用户启动 25 分钟专注 session
- **THEN** 创建 `PomodoroSession` (status=running, energyBefore=当前能量)
- **AND** 倒计时结束后 status=completed，completedAt=当前时间，energyAfter=当前能量
- **AND** 自动写入 `LearnLog` (type=focus_session, duration=durationMinutes)
- **AND** 调用 `updateActualMinutes(today, 累计时长)` 更新能量样本

#### Scenario: 浏览器关闭后恢复
- **WHEN** 用户关闭浏览器时存在 status=running 的 session
- **AND** 用户再次访问 `/timer`
- **THEN** 系统检测到未完成 session
- **AND** 若距 startedAt 超过 durationMinutes → 自动标记 completed
- **AND** 否则提示"上次有未完成番茄（剩 X 分钟），继续/放弃？"

#### Scenario: 严格模式下被打断
- **GIVEN** 严格模式开启
- **WHEN** 番茄进行中用户切走标签页累计 3 次
- **THEN** session 自动标记 abandoned
- **AND** 不写入 LearnLog（避免污染数据）
- **AND** 提示"专注被打断 3 次，本次番茄已取消，建议休息后再试"

### Requirement: User Profile Accuracy
系统 SHALL 基于多维度数据构建用户技能画像，并保证画像的时效性。

#### Scenario: 画像构建
- **WHEN** 首页加载且 `UserProfile.updatedAt` 距今超过 24 小时
- **THEN** 后台异步触发 `buildUserProfile()`
- **AND** 从 ReviewCard 聚合 stability 均值（per nodeId）
- **AND** 从 ReviewLog 聚合 accuracy（per nodeId）
- **AND** stability > 21 且 accuracy > 85% → skillLevel[nodeId] = "advanced"
- **AND** stability < 7 或 accuracy < 60% → skillLevel[nodeId] = "beginner"
- **AND** 其他 → "intermediate"
- **AND** 写入 IndexedDB + 标记 updatedAt

#### Scenario: 画像注入聊天上下文
- **WHEN** 用户发送聊天消息
- **THEN** `buildProfileContext(profile)` 生成 ≤ 500 字符的画像片段
- **AND** 注入到 system prompt（在 contextSnapshot 之后）
- **AND** AI 回答深度匹配用户 skillLevel

### Requirement: Plan Feasibility Scoring
系统 SHALL 在生成学习计划时评估可行性，并对不可行计划给出降级建议。

#### Scenario: 不可行计划
- **GIVEN** 用户历史平均专注 30 分钟/天
- **WHEN** AI 生成要求每日 60 分钟的计划
- **THEN** `FeasibilityScore.confidence < 0.5`
- **AND** `feasible = false`
- **AND** `risks` 包含"每日要求 60 分钟但历史平均仅 30 分钟"
- **AND** `downgradePlan.reduceHoursPerWeek` 给出建议值（如 30）
- **AND** `suggestions` 包含"建议减少每日新学量到 1 个"

### Requirement: Priority Engine Integration
系统 SHALL 把优先级引擎接入首页和 AI 工具，提供可执行的优化建议。

#### Scenario: 健康检查触发
- **WHEN** 首页加载且当日未做过健康检查
- **THEN** 后台调用 `planHealthCheck()`
- **AND** 若检测到"逾期任务 > 3" → 生成 HealthAlert
- **AND** HealthAlert 在首页顶部以可关闭卡片展示
- **AND** 用户点击"一键采纳" → 调用 `optimize_schedule`

### Requirement: Rate Limit Enforcement
系统 SHALL 对使用服务端默认模型的请求按场景限流，用户自带 modelConfig 不受限。

#### Scenario: 超限
- **GIVEN** 用户今日已调用 chat 场景 20 次
- **WHEN** 用户再次发送聊天消息且未配置自己的 modelConfig
- **THEN** 服务端返回 429
- **AND** 客户端显示 RateLimitBanner"今日 AI 聊天已达上限（20/20），明天再来，或配置自己的 API Key"
- **AND** 已配置 modelConfig 的用户不受此限制

### Requirement: Rhythm Engine Unified Decision
系统 SHALL 提供统一的"下一步行动"决策入口，整合番茄钟、能量、FSRS、计划、routine 信号。

#### Scenario: 全信号决策
- **GIVEN** 用户当前能量 4/5，有 2 张 FSRS 卡片到期，routine 当前是学习时段，无 running session
- **WHEN** 首页调用 `getNextAction()`
- **THEN** 返回 `{ type: "start_focus", task: 优先级最高的 learn task, duration: 25, reason: "当前是学习时段，能量充足，建议专注 25 分钟学习 X" }`
- **AND** 首页 CurrentTaskCard 展示该建议 + "开始专注"按钮

### Requirement: AI Persona Adaptation
系统 SHALL 根据用户状态自动选择 AI 人格，使回答语气匹配用户当下情境。

#### Scenario: 低能量日
- **GIVEN** 用户今日 energy=2, mood=bad, streak=0
- **WHEN** 用户发送聊天消息
- **THEN** `selectPersona()` 返回 `gentle_companion`
- **AND** system prompt 追加"用户今天状态不好，语气温和，不要催促，先共情再给小建议"
- **AND** AI 回答以"今天辛苦了"开头，给 1 个小动作而非大计划

### Requirement: Focus Protection
系统 SHALL 在专注期间检测并记录打断，严格模式下自动取消被打断过多的番茄。

#### Scenario: 严格模式 3 次打断
- **GIVEN** 用户开启严格模式，启动 25 分钟专注
- **WHEN** 用户切走标签页累计 3 次
- **THEN** session.status = "abandoned"
- **AND** 不写入 LearnLog
- **AND** 提示"专注被打断 3 次，已取消，建议休息 5 分钟后再试"

### Requirement: Achievement Detection
系统 SHALL 在用户达成里程碑时自动检测并通知，成就可选择性公开展示。

#### Scenario: 首次解锁
- **GIVEN** 用户从未完成过番茄
- **WHEN** 用户完成首个番茄 session
- **THEN** 后台 `detectAchievements()` 检测到 `first_time: first_pomodoro` 成就
- **AND** 浏览器通知"成就解锁：初次专注！"
- **AND** 首页展示成就卡片（可关闭）
- **AND** 写入 IndexedDB `achievement:<id>`

## MODIFIED Requirements

### Requirement: Chat Context Injection
原 `buildChatContext()` 只注入当前学习状态。修改为：先注入学习状态（~1.5KB），再注入画像片段（~500 字符），再注入 persona 片段（~200 字符）。总体积 ≤ 2.3KB。

### Requirement: Knowledge Decomposition
原 `decomposeKnowledge(topic, userPrompt?, opts?, model?)` 修改为 `decomposeKnowledge(topic, userPrompt?, opts?, model?, userProfile?)`。有 userProfile 时，prompt 中注入画像段落，并跳过已掌握节点。

### Requirement: Home Data Loading
原 `useHomeData()` 后台触发 `autoFillTodayActualMinutes` + `maybeRetrain`。修改为追加 `planHealthCheck()` + `detectAchievements()` + `maybeBuildProfile()`（>24h 则重建画像）。所有后台任务用 `Promise.allSettled` 并行，失败静默。

### Requirement: Chat API Route
原 `app/api/chat/route.ts` 不限流。修改为：在 `requireAuth` 之后调用 `checkRateLimit(userId, scene)`，超限返回 429；根据 contextSnapshot 选择 persona 并追加到 system prompt。

## REMOVED Requirements

### Requirement: 弱化的 LearnLog.duration 字段语义
**Reason**: 原 `LearnLog.duration` 字段语义模糊（旧字段，兼容用），番茄功能引入后需要明确记录"实际专注时长"。
**Migration**: 新增 `LearnLog.type: "focus_session"`，其 `duration` 字段明确为"实际专注分钟数（扣除打断）"。旧的 learn/review 类型不写 duration 字段，保持兼容。
