# devpath-ai 架构文档

> 面向开发者：理解 DevPath 的分层、数据流、关键设计决策、AI-Native 架构。

## 分层架构

```
┌──────────────────────────────────────────────────────────────────┐
│  UI 层（app/*.tsx）                                               │
│  Server Component（SSR 骨架屏）+ Client Component（交互）         │
└───────────────────────────┬──────────────────────────────────────┘
                            │
┌───────────────────────────▼──────────────────────────────────────┐
│  Hook 层（lib/home.ts useHomeData）                               │
│  数据获取并行化 + 5 路后台维护任务触发                            │
└───────────────────────────┬──────────────────────────────────────┘
                            │
┌───────────────────────────▼──────────────────────────────────────┐
│  AI 编排层（lib/ai/*）                                            │
│  ┌─────────────┐ ┌──────────────┐ ┌─────────────────────────┐    │
│  │ 节奏引擎    │ │ 优先级引擎   │ │ 精准计划生成            │    │
│  │ rhythm-engine│ │ priority-engine│ │ plan-generator         │    │
│  │ 6 条决策链  │ │ 4 维加权评分 │ │ 画像驱动+可行性评分    │    │
│  └──────┬──────┘ └──────┬───────┘ └───────────┬─────────────┘    │
│         │               │                     │                  │
│  ┌──────▼───────────────▼─────────────────────▼──────────────┐   │
│  │  上下文构建（chat-context.ts）                             │   │
│  │  学习状态 1.5KB + 用户画像 500B + Persona 200B ≤ 2.3KB    │   │
│  └───────────────────────────┬───────────────────────────────┘   │
│                              │                                    │
│  ┌───────────────┐  ┌────────▼────────┐  ┌──────────────────┐   │
│  │ 用户画像      │  │ AI 人格化       │  │ AI 质量观测      │   │
│  │ memory/       │  │ persona.ts      │  │ quality-tracker  │   │
│  │ 24h TTL 重建  │  │ 4 种 Persona    │  │ 采纳率/再生成率  │   │
│  └───────────────┘  └─────────────────┘  └──────────────────┘   │
└──────────┬────────────────┬─────────────────┬───────────────────┘
           │                │                 │
┌──────────▼──────┐ ┌───────▼───────┐ ┌───────▼──────────────────┐
│  业务逻辑层     │ │   AI 调用     │ │  番茄时钟 + 成就系统     │
│  (lib/*.ts)     │ │  (Vercel      │ │  timer/ + achievements/  │
│  fsrs / energy  │ │   AI SDK)     │ │  focus-guard / detector  │
│  sync / emotion │ │  服务端/用户  │ │  session 生命周期        │
│  schedule       │ │  限流配额     │ │  打断追踪 / 通知         │
└──────┬──────────┘ └───────────────┘ └───────────────────────────┘
       │                │                 │
┌──────▼──────┐  ┌──────▼──────┐  ┌───────▼──────────┐
│ IndexedDB   │  │ Cloudflare  │  │ Cloudflare KV    │
│ (Dexie)     │  │ Pages Edge  │  │ 增量同步 / 限流  │
│ 本地主存储  │  │ Runtime     │  │ 公开成就 / 备份  │
└─────────────┘  └─────────────┘  └──────────────────┘
```

## 数据流

### 首页加载流

1. `app/page.tsx`（Server Component）渲染 `HomeSkeleton` 骨架屏 HTML
2. Suspense fallback 显示骨架屏，hydration 后 `HomeClient` 接管
3. `useHomeData()` hook 并行发起 IndexedDB 查询（`Promise.all`）
4. 数据返回后渲染：节奏引擎推荐任务、待学/待复习卡片、今日日程、热力图、Streak、能量状态
5. 末尾并行触发 **5 路后台维护任务**（`Promise.allSettled`，不阻塞 UI）：
   - `autoFillTodayActualMinutes()`：从今日 LearnLog + 番茄 session 累计时长回填能量样本
   - `maybeRetrain()`：若样本数 ≥ 10 且距上次训练 ≥ 1 天，重新训练线性回归模型
   - `maybeBuildProfile()`：若用户画像 `updatedAt > 24h`，后台异步重建画像
   - `checkAndNotify()`：检测新成就解锁 + 触发浏览器通知
   - `maybeRunHealthCheck(date)`：当日只跑一次，检查计划健康（逾期 / 完成率 / 能量趋势 / 卡片积压）

### 学习计划生成流（画像驱动）

1. 用户输入主题 + 每日可用分钟 + 约束条件
2. `POST /api/learn` → `resolveModel(modelConfig)` 解析 AI 模型
3. `decomposeKnowledge(topic, minutes, maxNew, fsrsMode, userProfile?)` → AI 拆解知识节点
   - 若有画像：注入「用户在 X 方面是入门水平，跳过高级内容；在 Y 方面是进阶，可加速」
   - 跳过 `skillLevel=advanced` 且 `stability>21天` 的已掌握节点
4. `generateQuestions(nodes)` → AI 为每个节点生成面试题
5. `topoSort(nodes)` 拓扑排序 + `allocateDaily(nodes, dailyMinutes)` 分配到每日
6. `scoreFeasibility(plan, userProfile, energyModel)` → 可行性评分
   - `confidence < 0.5` → `suggestDowngrade()` 自动降级（减少每日新学量）
7. 写入 IndexedDB（plan + cards + questions）

### 番茄时钟完整流程

1. 用户点击「开始专注」或 AI 调用 `start_focus_session` 工具
2. `createSession({ taskDescription, durationMinutes, planId?, nodeId? })` → 创建 `PomodoroSession`（status=running）
3. `PomodoroWidget` 显示右下角浮动倒计时
4. `startGuard(sessionId, mode, callbacks)` 启动专注保护：
   - 严格模式：3 次打断（visibilitychange + blur）→ `onAbandon` → `abandonSession()`
   - 宽松模式：只记录打断次数，不暂停
5. 倒计时结束 → 浏览器 Notification（降级为 console.log）
6. 用户标记完成 → `completeSession(id)`：
   - 写 `LearnLog(type=focus_session, duration=扣除打断后的实际时长)`
   - 调用 `updateActualMinutes()` 更新能量样本
   - `sessionIndex++` → `getNextBreakType()` 判断短休息/长休息（4-1 规则）
7. 建议「休息 5 分钟」或「再来一个番茄」
8. 浏览器关闭后重启 → `recoverInterruptedSession()` 超时自动完成

### 节奏引擎决策流

```
collectRhythmContext()  ← 9 路并行抓取信号
    │
    ├─ running PomodoroSession?
    ├─ DailyStatus.energy ≤ 2?
    ├─ 到期 FSRS 卡片 + 最近 1h 无复习?
    ├─ 当前时段在 Routine.slots 内?
    ├─ 接近 Routine.sleepTime (30min 内)?
    └─ 默认
    ↓
getNextAction(ctx) → NextAction
    │
    ├─ priority 1: { type: "start_focus", reason: "继续你的专注session" }
    ├─ priority 2: { type: "rest", reason: "能量较低，建议休息" }
    ├─ priority 3: { type: "review", reason: "有X张卡片到期" }
    ├─ priority 4: { type: "start_focus", reason: "学习时段：Y" }
    ├─ priority 5: { type: "plan_next_day", reason: "接近睡觉时间" }
    └─ priority 6: { type: "start_focus", reason: "继续学习：Z" }
    ↓
GET /api/rhythm → CurrentTaskCard 展示 + 按钮跳转
```

### AI 聊天工具调用流（含 Persona）

1. 用户消息 → `buildChatContext()` 构建上下文（学习状态 + 画像 + 对话记忆）
2. `getUserPersona(userProfile)` 选择 Persona：
   - 用户 `preferredPersona` 覆盖（优先级最高）
   - 否则 `selectPersona({ energy, mood, streak, topic })` 自动选择
3. Persona 片段注入 systemPrompt（在 contextSnapshot + profileContext 之后）
4. `streamAIResponse()` 流式响应
5. AI 返回 `clientAction` 描述符（7 种工具之一）
6. `executeClientAction(action)`：
   - 检查 `idempotencyKey` 是否在 24h 内已执行（IndexedDB TTL）
   - 已执行 → 跳过，返回 `{ ok: true, skipped: true }`
   - 未执行 → 不可变克隆 + 原子写入
7. 结果回传 `trackAIFeedback`（adopted / discarded / viewed）

### 用户画像构建流

```
buildUserProfile()
    │
    ├─ aggregateStabilityByNode(cards)     → Record<nodeId, stability>
    ├─ aggregateAccuracyByNode(logs, cards) → Record<nodeId, {correct, total}>
    ├─ inferSkillLevel(stability, accuracy) → Record<nodeId, SkillLevel>
    ├─ inferPreferredTimeSlots(learnLogs)   → string[] (["06:00-07:00", ...])
    ├─ computeAverageSessionMinutes(samples) → number
    ├─ weakAreas = MistakeRecord(unresolved) → string[]
    └─ goals (from UserProfile, 用户手动设置)
    ↓
saveUserProfile() → IndexedDB (key: user:profile:current)
    ↓
buildProfileContext(profile) → ≤500 字符文本
    ↓
注入 buildChatContext() + decomposeKnowledge() + scoreFeasibility()
```

### 限流流程

```
客户端 aiFetch()
    │
    ├─ useServerModel=false → 直接调用户 API Key，跳过限流
    └─ useServerModel=true  → POST /api/*
         │
         ├─ checkRateLimit(userId, scene)  ← KV: ratelimit:{userId}:{scene}:{date}
         │   ├─ count < quota → 放行
         │   └─ count ≥ quota → 429 { code: "RATE_LIMITED", scene, remaining: 0 }
         │
         └─ incrementRateLimit(userId, scene)  ← 乐观递增（streamText 前）
```

## 关键设计决策

### 1. IndexedDB 作为主存储（而非服务端数据库）

- **原因**：个人学习工具数据量小（KB 级），但需要离线可用、低延迟、无服务端成本
- **代价**：跨设备同步需要手动触发，不能多端实时协作
- **索引设计**：`&key, prefix, updatedAt` 三索引 — `prefix` 支持按类型范围查询，`updatedAt` 支持增量同步

### 2. 增量同步而非全量备份

- `getChangesSince(lastSyncAt)` 利用 `updatedAt` 索引只查变更 key
- 首次同步降级为全量（无 `lastSyncAt` 基线）
- 无变更时返回 `noop`（O(0) 网络成本）

### 3. Prompt 版本指纹（CI 强制校验）

- `promptFingerprint(id, version) = "id:version:djb2hash(system)"`
- `__tests__/prompts.test.ts` 维护 `PROMPT_VERSION_HASHES` 快照
- 改 system 不 bump version → hash 不匹配 → 测试失败
- 防止「改了 prompt 忘记 bump version」导致归因断链

### 4. 能量回归模型冷启动

- `MIN_SAMPLES_TO_TRAIN = 10`：新用户需 10 天数据
- `autoFillTodayActualMinutes()` 自动从 LearnLog + 番茄 session 累计回填
- `maybeRetrain()` 在首页加载时检查，距上次训练 ≥ 1 天则重训
- 闭环：record LearnLog → autoFill actualMinutes → maybeRetrain → predict → scoreFeasibility

### 5. 情绪字段迁移层

- 旧版 EmotionEntry 有 `trigger / impact / coping` 三字段
- 新版合并为 `reason` + 拆分为 `copingSuggestions / selectedCoping / customCoping`
- `LegacyEmotionFields` 联合类型 + `migrateEmotionEntry()` 惰性迁移
- 读取旧数据时自动合并到新字段，写入时只写新字段

### 6. 节奏引擎：规则优先，AI 兜底

- **原因**：AI 调用有成本和延迟，而「现在该做什么」需要低延迟响应
- **设计**：6 条规则决策链覆盖 90% 场景，不消耗 AI 额度
- **兜底**：规则无法决策时降级到默认学习 task
- **扩展**：未来可用 ML 模型替代规则链，但接口不变

### 7. 用户画像：批量重建而非增量更新

- **原因**：画像维度多（技能/时段/时长/薄弱/风格），增量更新每个维度成本高
- **设计**：24h TTL 全量重建，`buildUserProfile()` 并行 6 路聚合
- **代价**：画像有最多 24h 延迟（可接受，画像不需要实时）
- **优化方向**：高频维度（如 averageSessionMinutes）可增量更新

### 8. Persona 单一数据源

- Persona 片段定义在 `lib/ai/prompts.ts` 的 `PERSONA_SNIPPETS` 中
- `lib/ai/persona.ts` 通过 import 引用，避免两处维护不同步
- 选择逻辑在 `persona.ts`，展示在 `profile/page.tsx`，注入在 `chat/route.ts`

### 9. 乐观限流（streamText 前递增）

- **原因**：streamText 是流式响应，完成后才递增会导致并发请求超限
- **设计**：`checkRateLimit` 通过后立即 `incrementRateLimit`，再 streamText
- **代价**：流式失败不回滚计数（可接受，用户重试不频繁）

### 10. 成就检测：纯函数 + 轮询

- `detectNewAchievements(stats, existingIds)` 是纯函数，相同输入相同输出
- 首页加载时 `checkAndNotify()` 轮询检测，新成就触发通知
- **扩展方向**：未来可改为事件驱动（LearnLog 写入 → 触发检测）

## AI-Native 架构分析

### Karpathy 视角：从「调用 AI 的工具」到「AI 编排的系统」

这个项目经历了三个演化阶段：

**阶段 1（基础）：AI 作为功能点**
- 知识拆解、面试题生成、周报 — AI 是独立功能，输入→输出，无反馈闭环
- 每次调用独立，无上下文积累

**阶段 2（增强）：AI 作为助手**
- 能量回归模型预测容量 → AI 据此调整计划
- 情绪觉察 → AI 生成应对建议
- 工具调用让 AI 能执行操作（创建提醒/调整计划）
- 开始有反馈闭环：采纳率/再生成率追踪

**阶段 3（当前）：AI 作为编排器**
- **节奏引擎**统一编排所有子系统（番茄/FSRS/能量/routine），AI 不再是单一功能，而是系统的大脑
- **用户画像**让 AI 有了对用户的持续记忆，每次调用都基于累积的认知
- **Persona**让 AI 有了性格，不再是中立的工具，而是适配用户状态的陪伴者
- **可行性评分**让 AI 学会说不——confidence < 0.5 时主动降级，而不是盲目执行
- **质量观测**形成完整的 AI 反馈闭环：调用 → 用户反馈 → 质量看板 → prompt 迭代

### AI-Native 成熟度评估

| 维度 | 当前状态 | 评分 |
|---|---|---|
| **上下文注入** | 学习状态 1.5KB + 画像 500B + Persona 200B，每次 AI 调用都注入 | ★★★★☆ |
| **反馈闭环** | 采纳率/再生成率/评分追踪 + prompt 版本对比 | ★★★★☆ |
| **降级策略** | 限流 → 429 + 提示；画像缺失 → 跳过；模型不可用 → 规则兜底 | ★★★★☆ |
| **用户建模** | 6 维画像（技能/时段/时长/薄弱/风格/目标），24h TTL | ★★★☆☆ |
| **成本控制** | 场景化配额 + 用户自带 Key 跳过 + 节奏引擎不消耗 AI | ★★★★☆ |
| **可观测性** | AI 质量看板 + 失败模式聚类 + prompt 版本归因 | ★★★★☆ |
| **个性化** | Persona + 画像驱动计划生成 + 跳过已掌握节点 | ★★★★☆ |
| **增量学习** | 能量回归模型在线训练，但画像是批量重建 | ★★☆☆☆ |
| **多模型编排** | 单模型 per call，无 fallback 链 | ★☆☆☆☆ |
| **语义检索** | 无，知识查询全靠 ID 索引 | ★☆☆☆☆ |

### 优化方向

1. **AI 调用成本追踪**（P0）：记录每次调用的 token 用量 + 估算成本，加入 AI 质量看板
2. **模型 fallback 链**（P1）：主模型超时/失败时自动降级到备选模型（如 GLM → DeepSeek）
3. **画像增量更新**（P1）：高频维度（averageSessionMinutes / weakAreas）事件驱动更新，低频维度（skillLevel）保持 24h 批量
4. **Prompt A/B 测试**（P2）：同一场景同时跑两个 prompt 版本，对比采纳率自动选优
5. **语义搜索**（P2）：对知识节点 summary 做向量化，支持「我想学 X」的模糊匹配

## 测试策略

- **Vitest 单测**（379+）：覆盖 fsrs / energy-regression / sync / prompts / chat-tools / emotion-migrate / pomodoro / profile-builder / priority-engine / plan-feasibility / rhythm-engine / persona / achievements / rate-limit 等核心模块
- **Playwright E2E**：主流程（首页 → 学习 → 复习 → 统计）+ 番茄时钟完整流程 + Demo 注入/清除
- **CI 强制校验**：prompt 版本一致性快照、类型检查、ESlint

## 部署

- Cloudflare Pages（Edge Runtime）
- `@cloudflare/next-on-pages` 转换 Next.js 输出
- 推送 `main` 自动触发 GitHub Actions 部署
- Workflow 自动创建 Pages 项目（如不存在）
- KV binding 名 `KV`，需在 Cloudflare Dashboard 创建 namespace
- 生产 URL：https://devpath-ai.pages.dev
