# Tasks

按"阻断性 → 安全 → 可靠性 → 性能 → 正确性 → 质量"分阶段推进。Phase 0-1 为 P0（阻断 + 安全），Phase 2-3 为 P1（可靠性 + 性能），Phase 4-5 为 P2（正确性 + 性能），Phase 6 为 P3（质量）。

## 阶段 0：修复 React #185 死循环（P0 阻断）

- [ ] Task 0.1: 修复 `app/learn/list/ListClient.tsx` router 依赖链
  - [ ] SubTask 0.1.1: 将 `router` 从 `refresh` 的 `useCallback` 依赖数组中移除
  - [ ] SubTask 0.1.2: 在 effect 内通过 `routerRef.current` 访问 router（或直接用 `router` 但不放进依赖）
  - [ ] SubTask 0.1.3: `useEffect` 依赖数组改为 `[]`（仅初始加载一次）
  - [ ] SubTask 0.1.4: 添加 eslint-disable-next-line 注释说明为何空依赖
- [ ] Task 0.2: 修复 `app/learn/[planId]/PlanDetailClient.tsx` router 依赖
  - [ ] SubTask 0.2.1: `useEffect` 依赖数组从 `[planId, router]` 改为 `[planId]`
  - [ ] SubTask 0.2.2: effect 内 `router.push("/learn")` 保持不变（router 引用稳定，只是不作为依赖）
  - [ ] SubTask 0.2.3: 添加 eslint-disable-next-line 注释
- [ ] Task 0.3: 修复 `app/learn/[planId]/edit/PlanEditClient.tsx` router 依赖
  - [ ] SubTask 0.3.1: `useEffect` 依赖数组从 `[planId, router]` 改为 `[planId]`
  - [ ] SubTask 0.3.2: 添加 eslint-disable-next-line 注释
- [ ] Task 0.4: 修复 `app/learn/page.tsx` router 依赖
  - [ ] SubTask 0.4.1: `useEffect` 依赖数组从 `[router]` 改为 `[]`
  - [ ] SubTask 0.4.2: 添加 eslint-disable-next-line 注释

## 阶段 1：修复 API Key 明文同步到云端（P0 安全）

- [ ] Task 1.1: 从 `SYNC_PREFIXES` 移除 `MODEL_CONFIG`
  - [ ] SubTask 1.1.1: `lib/sync.ts` 中 `SYNC_PREFIXES` 数组移除 `KEY_PREFIXES.MODEL_CONFIG`
  - [ ] SubTask 1.1.2: 更新注释说明：API Key 仅本地存储，不同步到云端，换设备需重新输入
  - [ ] SubTask 1.1.3: `uploadAll` 和 `uploadIncremental` 不再包含 ModelConfig 数据
- [ ] Task 1.2: 更新 `lib/types.ts` ModelConfig 注释
  - [ ] SubTask 1.2.1: 将 apiKey 字段注释从"存储在 IndexedDB，不上传到云端"改为"仅本地存储，不同步到云端 KV"
- [ ] Task 1.3: 单测验证
  - [ ] SubTask 1.3.1: 在 `__tests__/` 中新增或修改测试，验证 sync 数据不包含 `model:` 前缀的 key

## 阶段 2：Provider Fallback 链（P1 可靠性）

- [ ] Task 2.1: `lib/ai/provider.ts` 新增 fallback 逻辑
  - [ ] SubTask 2.1.1: 新增 `getModelWithFallback(): { model: LanguageModel; providerId: string }` 函数
  - [ ] SubTask 2.1.2: 读取环境变量 `AI_FALLBACK_PROVIDER`（如 "deepseek" / "mimo"），构造备选模型
  - [ ] SubTask 2.1.3: 主模型 + 备选模型构成 fallback 链，缓存主模型实例
- [ ] Task 2.2: AI 调用包装超时 + fallback
  - [ ] SubTask 2.2.1: 新增 `withFallback<T>(fn: (model) => Promise<T>): Promise<{ result: T; providerId: string }>` 高阶函数
  - [ ] SubTask 2.2.2: 主模型调用 30s 超时（`AbortSignal.timeout(30000)`），超时或异常后切备选
  - [ ] SubTask 2.2.3: 所有 provider 都失败时抛出最后一个错误
- [ ] Task 2.3: observability 记录实际使用的 provider
  - [ ] SubTask 2.3.1: `observeCall` 支持 `providerId` 参数，记录到指标中
  - [ ] SubTask 2.3.2: fallback 事件记录为 `warn` 级别日志
- [ ] Task 2.4: 将关键 AI 调用接入 fallback
  - [ ] SubTask 2.4.1: `app/api/learn/knowledge/route.ts`（知识点拆解）接入 `withFallback`
  - [ ] SubTask 2.4.2: `app/api/review/route.ts`（复习评分，如果走 AI 的话）接入
  - [ ] SubTask 2.4.3: `app/api/adjust-plan/route.ts`（AI 调整计划）接入

## 阶段 3：首页数据精准查询（P1 性能）

- [ ] Task 3.1: `lib/storage/dexie-db.ts` 加 `due` 索引
  - [ ] SubTask 3.1.1: Card value 的 `due` 字段加为索引（注意：due 在 value 内部，需要用 Dexie 的 hook 或 multi-entry）
  - [ ] SubTask 3.1.2: 如果 due 在 value 内无法直接索引，改为在 KVRecord 上加 `dueAt` 字段（类似 `updatedAt` 模式），setItem 时自动提取
- [ ] Task 3.2: `lib/storage/db.ts` 新增精准查询函数
  - [ ] SubTask 3.2.1: `countDueCards(now: Date): Promise<number>` — 用 `where('dueAt').below(now.toISOString())` 精准计数
  - [ ] SubTask 3.2.2: `listRecentItems(prefix: string, days: number): Promise<T[]>` — 按 `updatedAt` 索引查最近 N 天记录
- [ ] Task 3.3: `lib/home.ts` 替换全量加载
  - [ ] SubTask 3.3.1: `listItems<LearningPlan>(PLAN)` → `listPlanSummaries()`
  - [ ] SubTask 3.3.2: `listItems<ReviewCard>(CARD)` → `countDueCards(now)` 只取数量
  - [ ] SubTask 3.3.3: `listItems<LearnLog>(LEARN_LOG)` → `listRecentItems(LEARN_LOG, 7)`
  - [ ] SubTask 3.3.4: `listItems<EmotionEntry>(EMOTION)` → `listRecentItems(EMOTION, 7)`
  - [ ] SubTask 3.3.5: 确认首页消费方（HomeClient）不依赖被省略的大字段（knowledgeTree/questions）
- [ ] Task 3.4: 单测
  - [ ] SubTask 3.4.1: `countDueCards` 精准计数测试
  - [ ] SubTask 3.4.2: `listRecentItems` 时间范围过滤测试

## 阶段 4：同步引擎 Tombstone 机制（P2 正确性）

- [ ] Task 4.1: `lib/storage/db.ts` delItem 写 tombstone
  - [ ] SubTask 4.1.1: delItem 删除前写一条 tombstone 记录：key=`tombstone:<原key>`，value=`{ deletedAt: nowISO, originalKey }`，prefix=`tombstone`，updatedAt=nowISO
  - [ ] SubTask 4.1.2: tombstone 记录通过 `db.kv.put` 写入（与正常记录同表）
- [ ] Task 4.2: `lib/sync.ts` mergeData 处理 tombstone
  - [ ] SubTask 4.2.1: 下载同步时识别 `tombstone:` 前缀的 key
  - [ ] SubTask 4.2.2: 对 tombstone，提取 `originalKey`，调用 `delItem(originalKey)` 删除本地记录
  - [ ] SubTask 4.2.3: tombstone 本身也存入本地（避免重复处理）
- [ ] Task 4.3: tombstone 过期清理
  - [ ] SubTask 4.3.1: `uploadAll` 执行时，扫描 `tombstone:` 前缀记录，删除 `deletedAt` 超过 30 天的
  - [ ] SubTask 4.3.2: 新增 `cleanExpiredTombstones()` 函数，在 uploadAll 末尾调用
- [ ] Task 4.4: 单测
  - [ ] SubTask 4.4.1: delItem 后 tombstone 存在
  - [ ] SubTask 4.4.2: mergeData 收到 tombstone 后删除本地记录
  - [ ] SubTask 4.4.3: 30 天过期 tombstone 被清理

## 阶段 5：画像增量更新（P2 性能）

- [ ] Task 5.1: `lib/ai/memory/user-profile.ts` 新增增量更新
  - [ ] SubTask 5.1.1: `updateProfileField(field: keyof UserProfile, value: unknown): Promise<void>` — 读取现有 profile，更新单字段，写回
  - [ ] SubTask 5.1.2: 如果 profile 不存在，不创建（等 maybeBuildProfile 全量构建）
- [ ] Task 5.2: 番茄完成时增量更新 averageSessionMinutes
  - [ ] SubTask 5.2.1: 找到番茄完成回调（`lib/pomodoro.ts` 或 `components/PomodoroFull.tsx`）
  - [ ] SubTask 5.2.2: 完成后调用 `updateProfileField("averageSessionMinutes", newAverage)`
  - [ ] SubTask 5.2.3: newAverage = (oldAverage * oldCount + sessionMinutes) / (oldCount + 1)，需读取 EnergySample 计数
- [ ] Task 5.3: 复习完成时增量更新 skillLevel（可选，如复杂度高可降级为 P3）
  - [ ] SubTask 5.3.1: `app/api/review/route.ts` 评分后触发 skillLevel 更新
  - [ ] SubTask 5.3.2: 根据 ReviewLog 的 correct/total 更新对应 nodeId 的 skillLevel

## 阶段 6：能量回归模型特征增强（P3 质量）

- [ ] Task 6.1: `lib/energy-regression.ts` 特征工程增强
  - [ ] SubTask 6.1.1: 特征向量从 `[1, energy, moodNumeric, availableMinutes]` 扩展为 `[1, energy, moodNumeric, availableMinutes, sin(hour), cos(hour), dayOfWeek, dopamineInterference]`
  - [ ] SubTask 6.1.2: `hourOfDay` 从 EnergySample 的 timestamp 提取（需确认 EnergySample 是否有时间戳字段）
  - [ ] SubTask 6.1.3: `dayOfWeek` 同上
  - [ ] SubTask 6.1.4: `dopamineInterference` 从 DailyStatus.dopamineTrigger 提取（"无"=0，其他=1）
- [ ] Task 6.2: TrainedModel 类型更新
  - [ ] SubTask 6.2.1: `weights` 从 `[number, number, number, number]` 改为 `number[]`（长度 8）
  - [ ] SubTask 6.2.2: `bias` 保留（weights[0]）
- [ ] Task 6.3: 训练 + 预测函数同步更新
  - [ ] SubTask 6.3.1: `trainModel` 的 X 矩阵构建更新
  - [ ] SubTask 6.3.2: `predictActualMinutes` 特征提取更新，参数增加 `hourOfDay` / `dayOfWeek` / `dopamineInterference`
- [ ] Task 6.4: 单测
  - [ ] SubTask 6.4.1: 新特征提取测试
  - [ ] SubTask 6.4.2: 训练 + 预测端到端测试

## 阶段 7：验证与合并

- [ ] Task 7.1: 本地质量门禁
  - [ ] SubTask 7.1.1: `npm run lint` 0 error
  - [ ] SubTask 7.1.2: `npm run typecheck` 0 error
  - [ ] SubTask 7.1.3: `npm test` 全部通过
- [ ] Task 7.2: 手动验证关键路径
  - [ ] SubTask 7.2.1: 打开学习列表页不再触发 React #185
  - [ ] SubTask 7.2.2: 同步后云端 KV 不含 apiKey
  - [ ] SubTask 7.2.3: 首页加载速度可感知提升（无全量 cards 加载）
  - [ ] SubTask 7.2.4: 删除计划后另一设备同步后该计划消失
- [ ] Task 7.3: 提交并推送
  - [ ] SubTask 7.3.1: git commit（按阶段拆原子 commit）
  - [ ] SubTask 7.3.2: git push origin main

# Task Dependencies

- 阶段 0（React 修复）独立，最高优先，无依赖
- 阶段 1（API Key 安全）独立，可与阶段 0 并行
- 阶段 2（Provider fallback）独立，可与阶段 0/1 并行
- 阶段 3（首页精准查询）依赖阶段 0（修复后的页面才能验证性能提升）
- 阶段 4（Tombstone）依赖阶段 1（sync.ts 已改过一次，避免冲突）
- 阶段 5（画像增量）独立，可与阶段 2-4 并行
- 阶段 6（能量模型）独立，可与阶段 2-5 并行
- 阶段 7（验证合并）依赖阶段 0-6 全部完成

并行机会：
- 阶段 0 + 阶段 1 + 阶段 2 可全部并行（3 个独立子任务）
- 阶段 5 + 阶段 6 可与阶段 3/4 并行
