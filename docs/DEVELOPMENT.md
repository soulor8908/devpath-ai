# 开发指南

## 环境要求

- Node.js 22+
- npm 10+

## 本地开发

```bash
npm ci
npm run dev
```

> 首次访问会自动注入 Demo 数据（前端工程师示例计划 + 3 张复习卡片 + 2 天学习日志）。创建真实计划后会提示清除 Demo 数据。

## 测试

```bash
# 全部单测（379+ 用例）
npm test

# 监听模式
npm run test:watch

# 性能基准测试
npm run test:perf

# 覆盖率
npm run test:coverage

# E2E（需先 npx playwright install chromium + 启动 dev server）
npm run test:e2e
```

## 代码质量

```bash
npx tsc --noEmit   # 类型检查
npx next lint      # ESLint（next/core-web-vitals + typescript）
```

> 已知 `__tests__/observability.test.ts` 有 2 个 vitest mock 类型兼容性噪声，与业务代码无关。

## 构建

```bash
npm run build                    # Next.js 构建
npx @cloudflare/next-on-pages    # Cloudflare Pages 适配
```

## 添加新的 AI Prompt

1. 在 `lib/ai/prompts.ts` 的 `PROMPTS` 对象中添加条目：

```ts
my_new_prompt: {
  id: "my_new_prompt",
  version: "v1",
  scene: "my_new_prompt" as const,
  system: `你是...`,
  changelog: "v1: 初始版本",
},
```

2. 在 `lib/types.ts` 的 `AIScene` 类型中添加 `"my_new_prompt"`

3. 在 `app/stats/ai-quality/page.tsx` 的 `SCENE_LABELS` 中添加标签

4. **必须**：在 `__tests__/prompts.test.ts` 的 `PROMPT_VERSION_HASHES` 中添加快照条目

```ts
my_new_prompt: "v1:<hash>",
```

> 运行 `npx vitest run __tests__/prompts.test.ts` 看失败信息里的「实际值」，复制到快照即可。

5. 修改 prompt 内容时，必须 bump `version`（v1→v2）并更新快照，否则 CI 测试失败。

## 添加新的 AI 工具（clientAction）

1. 在 `lib/ai/chat-tools.ts` 的 `tools` 数组中添加工具定义
2. 在 `lib/types.ts` 的 `ClientAction.type` 联合类型中添加新类型
3. 如果是写入工具（有副作用），必须：
   - 使用 `makeIdempotencyKey(type, params)` 生成幂等键
   - 在返回值中填充 `clientAction.idempotencyKey`
4. 在 `app/chat/ChatClient.tsx` 的 `executeClientAction` 中添加处理分支
5. 在 `app/api/chat/route.ts` 的 `TOOL_SYSTEM_SUFFIX` 中添加工具描述
6. 写入操作用不可变克隆 + 单次原子写入（参考 `adjust_plan` 的实现）

## 添加新的 IndexedDB 数据类型

1. 在 `lib/types.ts` 定义类型，并添加到 `KEY_PREFIXES`：

```ts
export const KEY_PREFIXES = {
  // ...
  MY_TYPE: "mytype:",
} as const;
```

2. 使用 `setItem(`${KEY_PREFIXES.MY_TYPE}${id}`, value)` 写入
3. 使用 `listItems<MyType>(KEY_PREFIXES.MY_TYPE)` 查询
4. `updatedAt` 字段会被 `setUpdatedAt()` 自动设置，增量同步自动生效

## 番茄时钟开发

### Session 生命周期

```
lib/timer/pomodoro.ts
  createSession()     → 创建 running session
  completeSession()   → 标记 completed + 写 LearnLog + updateActualMinutes
  abandonSession()    → 标记 abandoned（不写 LearnLog）
  pauseSession()      → 标记 paused
  resumeSession()     → 恢复 running
  getRunningSession() → 查询当前进行中
  recoverInterruptedSession() → 浏览器重启后恢复（超时自动完成）
```

### 休息规则

- `lib/timer/pomodoro-rule.ts`
- `getNextBreakType(sessionCount)` — 4 个专注后长休息，否则短休息
- `getRecommendedDuration(type)` — focus=25 / short=5 / long=15（可从 Routine.intensity 配置）

### 专注保护

- `lib/timer/focus-guard.ts` — 基于 `interruption-tracker.ts` 构建
- 严格模式：3 次打断（visibilitychange + blur）→ 自动放弃
- 宽松模式：只记录打断次数
- 模式来自 `UserProfile.strictFocusMode`

### 完成时的副作用

`completeSession(id)` 会：
1. 写 `LearnLog(type=focus_session, duration=扣除打断后的实际时长)`
2. 调用 `updateActualMinutes()` 更新当日能量样本
3. 触发成就检测（首次番茄成就）

## 用户画像开发

### 构建流程

- `lib/ai/memory/profile-builder.ts` — 6 个纯函数 + `buildUserProfile()` 主入口
- `lib/ai/memory/user-profile.ts` — CRUD + `maybeBuildProfile()`（24h TTL）
- `lib/ai/memory/conversation-memory.ts` — 7 天对话主题摘要

### 画像注入点

1. `lib/ai/chat-context.ts` 的 `buildProfileContext(profile)` → ≤500 字符 → 注入 chat 上下文
2. `lib/ai/knowledge.ts` 的 `decomposeKnowledge(topic, ..., userProfile?)` → 跳过已掌握节点
3. `lib/ai/plan-feasibility.ts` 的 `scoreFeasibility(plan, userProfile, ...)` → 可行性评分

### 添加新的画像维度

1. 在 `lib/types.ts` 的 `UserProfile` interface 添加字段
2. 在 `lib/ai/memory/profile-builder.ts` 添加聚合纯函数
3. 在 `buildUserProfile()` 中调用
4. 在 `buildProfileContext()` 中格式化输出
5. 添加单测到 `__tests__/profile-builder.test.ts`

## 优先级引擎开发

### 评分公式

```
priority_score =
  0.30 * deadline_urgency +    // 越近越急
  0.30 * fsrs_urgency +        // 到期卡片越多越急
  0.20 * skill_gap +           // 薄弱环节权重高
  0.20 * energy_fit            // 当前能量匹配度
```

### 关键文件

- `lib/ai/priority-engine.ts` — `rankTasks(tasks, ctx)` + IndexedDB 缓存（当日有效）
- `lib/ai/plan-health.ts` — 4 条健康检查规则 + `shouldRunHealthCheck(date)` 幂等
- `lib/ai/plan-feasibility.ts` — `predictActualMinutesWithFallback()` + `scoreFeasibility()` + `suggestDowngrade()`
- `lib/ai/plan-generator.ts` — `generateLearningPlan()` 编排：拆解 → 拓扑排序 → 分配 → 评分

### 健康检查规则

1. 逾期任务 > 3 → 建议重新排优先级
2. 2 周完成率 < 50% → 建议调整计划
3. 能量趋势连续 3 天下降 → 建议减轻日程
4. FSRS 到期卡片积压 > 10 → 建议先复习

## 节奏引擎开发

### 决策优先级链

```
lib/ai/rhythm-engine.ts
  priority 1: running PomodoroSession → start_focus
  priority 2: energy ≤ 2 → rest
  priority 3: 到期 FSRS 卡片 + 1h 内无复习 → review
  priority 4: routine 时段内 → start_focus
  priority 5: 接近 sleepTime → plan_next_day
  priority 6: 默认 → start_focus
```

### 添加新的决策分支

1. 在 `lib/types.ts` 的 `NextAction` 联合类型添加新分支
2. 在 `lib/ai/rhythm-engine.ts` 的 `getNextAction()` 中添加条件判断（注意优先级顺序）
3. 在 `collectRhythmContext()` 中添加所需数据抓取
4. 在 `components/CurrentTaskCard.tsx` 中添加 UI 渲染分支
5. 添加单测到 `__tests__/rhythm-engine.test.ts`

## AI Persona 开发

### 4 种 Persona

| ID | 名称 | 触发条件 |
|---|---|---|
| `strict_coach` | 严厉教练 | energy≥4 + 计划滞后 |
| `gentle_companion` | 温和陪伴 | energy≤2 + mood=bad |
| `socratic_tutor` | 苏格拉底导师 | topic 含代码/算法/原理关键词 |
| `peer_dev` | 平等同行 | 默认 |

### 关键文件

- `lib/ai/persona.ts` — `selectPersona(ctx)` + `getUserPersona(userProfile?)`
- `lib/ai/prompts.ts` — `PERSONA_SNIPPETS` 注册表（片段定义的唯一数据源）
- `app/api/chat/route.ts` — 注入 persona 到 systemPrompt
- `app/profile/page.tsx` — persona 设置 UI

### 添加新的 Persona

1. 在 `lib/types.ts` 的 `PersonaId` 联合类型添加新 ID
2. 在 `lib/ai/prompts.ts` 的 `PERSONA_SNIPPETS` 添加片段（≤200 字符）
3. 在 `lib/ai/persona.ts` 的 `selectPersona()` 添加触发条件
4. 在 `app/profile/page.tsx` 添加选项
5. 添加单测到 `__tests__/persona.test.ts`

## 成就系统开发

### 16 个预置成就

| 类型 | 数量 | 示例 |
|---|---|---|
| `streak` | 4 | 连续 3/7/30/100 天 |
| `topic_mastery` | 3 | 完成 1/3/10 个学习计划 |
| `focus_hours` | 3 | 累计专注 10/50/200 小时 |
| `review_streak` | 2 | 连续复习 7/30 天 |
| `recovery` | 1 | 断卡后 3 天内恢复 |
| `first_time` | 3 | 首次番茄 / 首次答对错题 / 首次周报 |

### 添加新的成就

1. 在 `lib/achievements/detector.ts` 的 `ACHIEVEMENT_DEFINITIONS` 添加定义
2. 在 `detectNewAchievements()` 中添加判定逻辑（纯函数）
3. 在 `collectStats()` 中添加所需数据聚合（`lib/achievements/index.ts`）
4. 添加单测到 `__tests__/achievements.test.ts`（覆盖边界值 + 幂等性）

## 限流开发

### 场景配额

| 场景 | 每日配额 | 说明 |
|---|---|---|
| `chat` | 20 | AI 聊天对话 |
| `plan_generate` | 5 | 精准计划生成 |
| `weekly_report` | 1 | 周报生成 |
| `daily_nudge` | 4 | 每日提醒 |
| 其他 | 5 | 默认配额 |

### 关键文件

- `lib/ai/rate-limit.ts` — `checkRateLimit()` + `incrementRateLimit()` + `getClientRateLimitEstimate()`
- `lib/storage/kv.ts` — `getRateLimitCount()` + `incrementRateLimitCount()`（KV key: `ratelimit:{userId}:{scene}:{date}`）
- `app/api/chat/route.ts` — 乐观递增（streamText 前递增，失败不回滚）
- `components/RateLimitBanner.tsx` — 客户端剩余次数展示

### 添加新的限流场景

1. 在 `lib/types.ts` 的 `AIScene` 添加场景
2. 在 `lib/ai/rate-limit.ts` 的 `SCENE_QUOTAS` 添加配额
3. 在对应 API 路由中调用 `checkRateLimit()` + `incrementRateLimit()`
4. 在 `app/stats/ai-quality/page.tsx` 的 `SCENE_LABELS` 添加标签

## Demo 数据开发

- `lib/demo/preset-data.ts` — `injectDemoData()` / `shouldInjectDemo()` / `clearDemoData()` / `hasDemoData()`
- Demo 数据用固定 ID（`demo-frontend-plan` / `demo-card-N` / `demo-log-N`）确保幂等
- `app/HomeClient.tsx` 首次访问触发注入
- `app/learn/page.tsx` 创建真实计划后提示清除

## 能量回归模型

- `lib/energy-config.ts`：配置（最小样本数、重训间隔）
- `lib/energy-collector.ts`：记录样本 + 自动回填
- `lib/energy-regression.ts`：线性回归训练 + 预测
- 首页 `useHomeData` 末尾并行触发 `autoFillTodayActualMinutes()` + `maybeRetrain()`
- `lib/ai/plan-feasibility.ts` 用 `predictActualMinutesWithFallback()` 预测实际可完成时长

## 同步引擎

- `lib/sync.ts`：`uploadIncremental()` / `uploadAll()` / `downloadAll()`
- `lib/storage/kv.ts`：KVStore 接口 + `mergeUserBackup` LWW 合并 + 限流计数 + 公开成就
- `app/api/sync/route.ts`：POST 支持 `mode: "incremental"` 和全量两种模式

## 首页后台任务

`lib/home.ts` 的 `useHomeData()` 末尾 `Promise.allSettled` 并行触发 5 路后台任务：

| 任务 | 文件 | 说明 |
|---|---|---|
| `autoFillTodayActualMinutes` | `lib/energy-collector.ts` | 从 LearnLog + 番茄 session 回填能量样本 |
| `maybeRetrain` | `lib/energy-regression.ts` | 距上次训练 ≥ 1 天则重训线性回归 |
| `maybeBuildProfile` | `lib/ai/memory/user-profile.ts` | 画像 updatedAt > 24h 则重建 |
| `checkAndNotify` | `lib/achievements/index.ts` | 检测新成就 + 浏览器通知 |
| `maybeRunHealthCheck` | `lib/ai/plan-health.ts` | 当日只跑一次，检查计划健康 |

> 所有后台任务失败静默，不阻塞 UI。

## 代码风格

- TypeScript strict mode
- 函数式风格优先（纯函数 + 不可变数据）
- 中文注释（与现有代码库一致）
- 文件头注释说明文件职责
- AI 相关函数优先用 `observeCall(tag, fn)` 包装（计时 + 记录指标）
