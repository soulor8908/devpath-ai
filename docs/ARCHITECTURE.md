# devpath-ai 架构文档

> 面向开发者：理解 DevPath 的分层、数据流、关键设计决策。

## 分层架构

```
┌──────────────────────────────────────────────────────────┐
│  UI 层（app/*.tsx）                                       │
│  Server Component（SSR 骨架屏）+ Client Component（交互）│
└───────────────────────┬──────────────────────────────────┘
                        │
┌───────────────────────▼──────────────────────────────────┐
│  Hook 层（lib/home.ts useHomeData）                       │
│  数据获取并行化 + 后台维护任务触发                       │
└───────────────────────┬──────────────────────────────────┘
                        │
┌───────────────────────▼──────────────────────────────────┐
│  业务逻辑层（lib/*.ts）                                   │
│  fsrs / energy-regression / sync / emotion-migrate ...   │
└──────┬──────────────┬──────────────┬─────────────────────┘
       │              │              │
┌──────▼─────┐  ┌─────▼─────┐  ┌────▼──────────┐
│ IndexedDB  │  │  AI 调用  │  │ Cloudflare KV │
│ (Dexie)    │  │ (Vercel   │  │ (增量同步)     │
│            │  │  AI SDK)  │  │                │
│ 本地主存储 │  │ 服务端/用户│  │ 跨设备备份     │
└────────────┘  └───────────┘  └────────────────┘
```

## 数据流

### 首页加载流

1. `app/page.tsx`（Server Component）渲染 `HomeSkeleton` 骨架屏 HTML
2. Suspense fallback 显示骨架屏，hydration 后 `HomeClient` 接管
3. `useHomeData()` hook 并行发起 7 路 IndexedDB 查询（`Promise.all`）
4. 数据返回后渲染：待学/待复习卡片、今日日程、热力图、Streak、能量状态
5. 末尾并行触发后台维护任务（不阻塞 UI）：
   - `autoFillTodayActualMinutes()`：从今日 LearnLog 累计时长回填能量样本
   - `maybeRetrain()`：若样本数 ≥ 10 且距上次训练 ≥ 1 天，重新训练线性回归模型

### 学习计划生成流

1. 用户输入主题 + 每日可用分钟
2. `POST /api/learn` → `resolveModel(modelConfig)` 解析 AI 模型
3. `decomposeKnowledge(topic)` → AI 拆解知识节点（含依赖、难度、面试频率、bigTech 标记）
4. `generateQuestions(nodes)` → AI 为每个节点生成面试题
5. `topoSort(nodes)` 拓扑排序 + `allocateDaily(nodes, dailyMinutes)` 分配到每日
6. 写入 IndexedDB（plan + cards + questions）

### 跨设备同步流

1. 本地写入 → IndexedDB `updatedAt` 时间戳
2. 用户点击「上传到云端」→ `uploadIncremental()`：
   - 首次：`uploadAll()` 全量备份（降级兜底）
   - 后续：`getChangesSince(lastSyncAt)` 只查变更 key，POST `{ mode: "incremental", changes }`
3. KV 端 `mergeUserBackup(userId, changes)`：按 `updatedAt` 做 Last-Write-Wins 合并
4. 新设备 `downloadAll()` → 拉取全量 → 写回 IndexedDB

### AI 聊天工具调用流

1. 用户消息 → `streamAIResponse()` 流式响应
2. AI 返回 `clientAction` 描述符（如 `adjust_plan`）
3. `executeClientAction(action)`：
   - 检查 `idempotencyKey` 是否在 24h 内已执行（IndexedDB TTL）
   - 已执行 → 跳过，返回 `{ ok: true, skipped: true }`
   - 未执行 → 不可变克隆 + 原子写入
4. 结果回传 `trackAIFeedback`（adopted / discarded / viewed）

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
- `autoFillTodayActualMinutes()` 自动从 LearnLog 累计回填，无需手动触发
- `maybeRetrain()` 在首页加载时检查，距上次训练 ≥ 1 天则重训
- 闭环：record LearnLog → autoFill actualMinutes → maybeRetrain

### 5. 情绪字段迁移层

- 旧版 EmotionEntry 有 `trigger / impact / coping` 三字段
- 新版合并为 `reason` + 拆分为 `copingSuggestions / selectedCoping / customCoping`
- `LegacyEmotionFields` 联合类型 + `migrateEmotionEntry()` 惰性迁移
- 读取旧数据时自动合并到新字段，写入时只写新字段

## 测试策略

- **Vitest 单测**（183+）：覆盖 fsrs / energy-regression / sync / prompts / chat-tools / emotion-migrate 等核心模块
- **Playwright E2E**：主流程（首页 → 学习 → 复习 → 统计）
- **CI 强制校验**：prompt 版本一致性快照、类型检查

## 部署

- Cloudflare Pages（Edge Runtime）
- `@cloudflare/next-on-pages` 转换 Next.js 输出
- 推送 `main` 自动触发 GitHub Actions 部署
- KV binding 名 `KV`，需在 Cloudflare Dashboard 创建 namespace
