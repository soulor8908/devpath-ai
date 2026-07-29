# devpath-ai 架构文档

> 面向开发者：理解 DevPath 的产品分层、运行时分层、数据流、关键设计决策、AI-Native 架构。

## 产品四层架构（L1-L4）

DevPath 不是单一学习工具，而是从内容到交付的完整转型系统。四层架构互为支撑：内容是护城河、路径是个性化、验证是闭环证据、交付解决坚持与记忆。

```
┌─────────────────────────────────────────────────────────────────┐
│  L4 交付层（已有，保留并增强）                                       │
│  FSRS 复习 · 番茄钟 · 节奏引擎 · 优先级引擎 · 能量回归 · 情绪 · 成就 │
│  PWA Service Worker（stale-while-revalidate + Web Push + periodicsync）│
│  → 职责：解决"坚持"和"记忆"                                         │
├─────────────────────────────────────────────────────────────────┤
│  L3 验证层（V1-V4 能力证据链）                                       │
│  V1 FSRS 卡片（理解）→ V2 沙箱代码题（应用）→                       │
│  V3 项目检查点（AI 按 Rubric 审 GitHub 仓库）→ V4 作品集发布（交付） │
│  L4 作品集：/portfolio 草稿/发布/同步 + 二维码分享；/u/[user]/portfolio │
│  → 职责：解决"学会了吗"的客观验证                                    │
├─────────────────────────────────────────────────────────────────┤
│  L2 路径引擎（个性化最短路径）                                       │
│  技能图谱 + 拓扑排序（Kahn 算法，同层按 phase/id 字典序确定性产物）   │
│  + 迁移映射 + 跳过已掌握节点 + 时间约束分配                          │
│  → 职责：解决"下一步学什么"                                         │
├─────────────────────────────────────────────────────────────────┤
│  L1 内容层（Content-as-Code 护城河）                                 │
│  content/graph/nodes/*.yaml（49 节点）+ tracks/ + sources/registry  │
│  + labs/ + projects/ + reviews/（版本化、可审查）                    │
│  三层质量门禁：zod schema + G1-G7 图谱规则 + 成分权威体系            │
│  → 职责：解决"学什么"和"凭什么信你"                                  │
└─────────────────────────────────────────────────────────────────┘
```

### L1 内容层关键设计

- **Content-as-Code**：知识库不是数据库行，是仓库里的 YAML 代码。`content/graph/nodes/*.yaml` 49 个技能节点（覆盖 LLM / RAG / Agent / 工程 / Python / Prompt 等九大类），每个节点必须挂载 ≥2 条 T0-T2 级权威来源（官方文档 / 论文 / 经典源码 / 一线工程博客），不允许 LLM 即兴生成
- **权威来源等级**：T0 一手规范（官方文档/论文） / T1 一手实现（经典源码/Cookbook） / T2 权威工程实践（一线从业者深度文章） / T3 二手解读（仅作补充，不可单独支撑节点）
- **三层质量门禁**：
  - 结构层：`lib/curriculum/schema.ts` zod schema 强制字段完整
  - 图谱层：G1-G7 规则（前置存在 / 来源已登记 / ≥1 T0-T1 / 无环 / 轨道阶段合法 / V3-V4 必挂 Rubric / 权重=100）
  - 成分层：权威体系 / 教学完备 / 路径引擎端到端可跑
- **内容生产管线**：AI 起草（读 T0/T1 来源）→ 自动校验（CI 跑 schema + 来源可达性 + 代码实验可运行）→ 人工审校（领域专家 review）→ 合并入库（带 reviewer 签名）→ 持续保鲜（每季度重新验证来源有效性）
- **6 个预置学习计划**：frontend-to-ai-engineer（旗舰，49 节点派生自策展图谱）/ algorithm-200（LeetCode 200 题）/ frontend / backend / ai / llm-app
- **运行时加载**：preset TS 源文件不再进 Worker bundle（避免 Cloudflare Pages 3MB 限制），由 `scripts/export-presets.ts` 导出为 `public/data/presets/{id}.json`，运行时 `loadPresetData(id)` 用 `fetch()` 按需加载
- **知识库向量搜索**：500 条 × 768 维 BGE 嵌入（构建期预嵌入，运行时只嵌查询文本），余弦相似度 top-k + 关键词降级 + 启发式判定（命令型前缀不检索）

### 零信任 session（安全架构）

```
客户端                                     Cloudflare Edge
  │                                              │
  ├─ 1. POST /api/auth/exchange                  │
  │     { apiKey, modelId }                      │
  │                                              │
  │                                              ├─ 2. AES-GCM 加密 apiKey
  │                                              │     → KV session:{id}
  │                                              │   HMAC-SHA256 签名
  │                                              │     → 返回 sessionToken
  │  3. 收到 sessionToken                         │
  │     + nonce（5min TTL，一次性消费）            │
  │     + 时间窗 ±60s                             │
  ↓                                              ↓
  每次 AI 调用：                                   │
  ┌──────────────────────────────────────────────┘
  │ X-Session-Id: <sessionId>
  │ X-Request-Timestamp: <unix-ms>
  │ X-Request-Nonce: <nonce>
  │ X-Request-Signature: <HMAC>
  ├─ 服务端校验：
  │  - HMAC 签名匹配（sessionSecret + nonce + timestamp）
  │  - nonce 未消费过（KV nonce:{nonce} TTL 5min，一次性消费）
  │  - timestamp 在 ±60s 窗口内
  │  - session 未过期（滑动续期 7d）
  ├─ 校验通过 → 解密 apiKey → 调 AI → 返回响应
  └─ 消费 nonce（一次性）
```

关键文件：
- `lib/ai/crypto.ts` — AES-GCM 加密 / HMAC 签名 / nonce 生成
- `lib/ai/session-middleware.ts` — 服务端校验链（requireSession + nonce 消费 + 滑动续期）
- `app/api/auth/exchange/route.ts` — apiKey → sessionId + sessionSecret 交换
- `lib/ai/cloudflare-env.ts` — Cloudflare Workers 环境变量 + KV binding 读取
- `lib/storage/kv.ts` — session / nonce / 审计 4 个独立 KV namespace

旧用户首次访问检测：有 `modelConfig.apiKey` 但无 session → 显示升级提示，引导重新 exchange。

### PWA Service Worker

- `public/sw.js` — stale-while-revalidate 缓存策略（API 不缓存，静态资源 CDN 优先）
- Web Push 推送：到期复习提醒 + 断卡回归提醒（VAPID keys）
- `periodicsync` 事件：后台检查到期卡片，触发推送通知
- 安装提示：满足 PWA criteria 后自动提示添加到主屏

## 运行时分层架构

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
4. 数据返回后按 **6 区结构**渲染（详见 [docs/ui-design-system.md](file:///workspace/docs/ui-design-system.md) 第 6 节）：
   1. Hero 行动区：CurrentTaskCard + 番茄钟入口 + 低能量休息链接
   2. KPI 三宫格：今日学习清单 N 项（可点击进入学习）/ 已完成 X 项 / 连续打卡 N 天
   3. AI 教练洞察区：HomeInsightsCard + 能力画像 + AI 质量摘要
   4. 能量趋势迷你图（新账户无数据时隐藏）
   5. 7 天热力图（常驻，新账户无打卡记录时隐藏）
   6. 今日学习队列（移到最下面作为详细视图，KPI 卡片已能快速进入学习）
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

番茄时钟统一为右下角浮动 widget（`components/PomodoroWidget.tsx`），三态切换（2026-07-23 重构，移除 large Modal）：

- **hidden 态**：不渲染 DOM（无运行中 session 且用户未主动打开）
- **ring 态**：56px 圆环浮窗，常驻显示倒计时进度，可拖动 + 边缘吸附（`z-[80]`）
- **card 态**：280×420 卡片浮窗，承载 idle / running / completed 三态视图与表单输入（`z-[80]`）；长按弹出操作菜单（`z-[100]`）；拖动期间渲染透明遮罩（`z-[90]`）

> 设计变更说明：原 large 态使用 `<Modal>` 渲染（z-[60]），会与底部 Nav / FloatingChat 产生层叠冲突且移动端体验割裂。重构为 card 浮窗后，所有番茄交互都在 widget 内部完成，不再依赖 Modal。事件名从 `POMODORO_OPEN_LARGE_EVENT` 重命名为 `POMODORO_OPEN_EVENT`（旧名作为 deprecated 别名保留向后兼容）。

1. 用户点击「开始专注」或 AI 调用 `start_focus_session` 工具（首页 Hero / 训练页 / Chat 工具均通过 `window.dispatchEvent(new CustomEvent(POMODORO_OPEN_EVENT))` 唤起 card 态）
2. `createSession({ taskDescription, durationMinutes, planId?, nodeId? })` → 创建 `PomodoroSession`（status=running）
3. `PomodoroWidget` 在 ring 态显示圆环倒计时，点击切到 card 态查看详情
4. `startGuard(sessionId, mode, callbacks)` 启动专注保护：
   - 严格模式：3 次打断（visibilitychange + blur）→ `onAbandon` → `abandonSession()`
   - 宽松模式：只记录打断次数，不暂停
5. 倒计时结束 → 浏览器 Notification（降级为 console.log），widget 自动切到 card 态展示 completed 视图
6. 用户标记完成 → `completeSession(id)`：
   - 写 `LearnLog(type=focus_session, duration=扣除打断后的实际时长)`
   - 调用 `updateActualMinutes()` 更新能量样本
   - `sessionIndex++` → `getNextBreakType()` 判断短休息/长休息（4-1 规则）
7. completed 视图建议「休息 5 分钟」或「再来一个番茄」
8. 浏览器关闭后重启 → `recoverInterruptedSession()` 超时自动完成
9. `BOTTOM_NAV_RESERVE = 96` 确保 widget 拖动范围避开底部导航

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
- 选择逻辑在 `persona.ts`，展示在 `app/profile/page.tsx`，注入在 `app/api/chat/route.ts`

### 9. 乐观限流（streamText 前递增）

- **原因**：streamText 是流式响应，完成后才递增会导致并发请求超限
- **设计**：`checkRateLimit` 通过后立即 `incrementRateLimit`，再 streamText
- **代价**：流式失败不回滚计数（可接受，用户重试不频繁）

### 10. 成就检测：纯函数 + 轮询

- `detectNewAchievements(stats, existingIds)` 是纯函数，相同输入相同输出
- 首页加载时 `checkAndNotify()` 轮询检测，新成就触发通知
- **扩展方向**：未来可改为事件驱动（LearnLog 写入 → 触发检测）

### 11. 学习队列按题目维度展开（2026-07-27 重构）

- **原因**：旧设计一节点一 StudyTask（节点维度），用户答对 7/8 题节点还没 mastered，进度条 0%，反馈断裂
- **新设计**：一题一 StudyTask（题目维度），每道未 `understood` 的题都是独立任务，已答对的题不进队列
- **代价**：队列变长（1 节点 8 题 → 8 个 task），但首页清单粒度更细，用户认知更清晰
- **进度统计同步**：`deriveCareerPath.progress` 从 `masteredCount/totalNodes` 改成 `understoodCount/totalQuestions`，每答对一题进度条 +1/N

### 12. useHomeData 窗口聚焦自动 reload（2026-07-27 修复）

- **原因**：`useHomeData` 只在 mount 时调一次 `load`，用户从训练页/计划详情页回首页时 hook 不重新加载，显示旧数据
- **解法**：监听 `visibilitychange` + `window.focus`，窗口聚焦时自动 reload，3 秒节流避免频繁刷新
- **覆盖场景**：训练页中途退出回首页 / 计划详情页标记 mastered 后回首页 / 任何修改 plan 的页面回首页
- **守护测试**：`__tests__/home-auto-reload-guard.test.ts` 防止监听被误删

### 13. pre-push 4 层门禁（2026-07-27 闭环修复）

- **原因**：旧 pre-push hook 只跑 `lint + typecheck`，`typecheck` 通过 ≠ `build` 通过（Next.js 15 Server Component 限制），导致部署失败
- **解法**：pre-push 跑 `lint + typecheck + test + build` 4 层门禁，任一失败立即终止
- **守护测试**：`__tests__/pre-push-hook-guard.test.ts` 防止 hook 被误删/降级
- **详见**：[AGENTS.md 第 2.14 节](file:///workspace/AGENTS.md)

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
| **成本控制** | 场景化配额 + 用户自带 Key 跳过 + 节奏引擎不消耗 AI + token 用量追踪 + USD 成本估算 + 仪表盘可视化 | ★★★★★ |
| **可观测性** | AI 质量看板 + 失败模式聚类 + prompt 版本归因 | ★★★★☆ |
| **个性化** | Persona + 画像驱动计划生成 + 跳过已掌握节点 | ★★★★☆ |
| **增量学习** | 能量回归模型在线训练，但画像是批量重建（averageSessionMinutes / accuracy 已增量） | ★★★☆☆ |
| **多模型编排** | 单模型 per call，无 fallback 链 | ★☆☆☆☆ |
| **语义检索** | 500 条 × 768 维 BGE 嵌入向量搜索 + 关键词降级 + 启发式判定 | ★★★☆☆ |

### 优化方向

1. **~~AI 调用成本追踪~~（P0 ✅ 已完成 2025-11）**：从 Vercel AI SDK data stream 协议解析 token usage，按模型定价表（`MODEL_PRICING`）估算 USD 成本，仪表盘展示 Token 总量 + 估算成本 + 场景级聚合。详见 `lib/ai/quality-tracker.ts` 的 `estimateCost()` / `parseUsageFromFinishMessage()`
2. **~~知识库向量搜索~~（P1 ✅ 已完成 2026-07）**：500 条 × 768 维 BGE 嵌入向量搜索 + 关键词降级 + 启发式判定（命令型前缀不检索）。详见 `lib/knowledge/`
3. **模型 fallback 链**（P1）：主模型超时/失败时自动降级到备选模型（如 GLM → DeepSeek）
4. **~~画像增量更新~~（P1 ✅ 部分完成 2026-07）**：高频维度（averageSessionMinutes / accuracy）已事件驱动增量更新，低频维度（skillLevel / weakAreas）保持 24h 批量
5. **Prompt A/B 测试**（P2）：同一场景同时跑两个 prompt 版本，对比采纳率自动选优
6. **成本追踪扩展到非流式路由**（P1）：目前仅 `/api/chat` 接入成本追踪，扩展到 `/api/daily-nudge` / `/api/learn` / `/api/weekly-report` 等非流式路由

## 测试策略

- **Vitest 单测**（1037 用例 / 92 个测试文件）：覆盖 fsrs / energy-regression / sync / prompts / chat-tools / emotion-migrate / pomodoro / profile-builder / priority-engine / plan-feasibility / rhythm-engine / persona / achievements / rate-limit / cost-tracking / curriculum 图谱规则 / preset 内容质量 / no-native-form-elements 守护 / ui-design-system-guard 守护 / pomodoro-widget-no-modal 守护 / mindmap-question-stats 守护 / nav-icon-only 守护 / heatmap SVG 渲染守护 / security-headers-guard 守护 / seo-metadata-guard 守护 / body-validation 守护 等核心模块
- **Playwright E2E**：主流程（首页 → 学习 → 复习 → 我的；浮动按钮打开 AI 对话）+ Demo 注入/清除
- **CI 强制校验**：prompt 版本一致性快照、类型检查、ESlint、UI 设计系统守护测试（原生表单元素 / dark 配对 / 逃逸值）

## 部署

- Cloudflare Pages（Edge Runtime）
- `@cloudflare/next-on-pages` 转换 Next.js 输出
- 推送 `main` 自动触发 GitHub Actions 部署
- Pages 项目通过 Cloudflare API 预创建（direct upload 模式，不连 GitHub source）
- KV binding 名 `KV`，需在 Cloudflare Dashboard 创建 namespace
- 生产 URL：https://devpath-ai.pages.dev（pages.dev 国内可访问，workers.dev 国内不可访问）
