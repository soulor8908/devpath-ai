# Checklist

## 阶段 0：修复 React #185 死循环
- [ ] `app/learn/list/ListClient.tsx` 的 `refresh` useCallback 不依赖 `router`
- [ ] `app/learn/list/ListClient.tsx` 的 useEffect 依赖数组不包含 `router`（改为 `[]` 或仅 `[planId]`）
- [ ] `app/learn/[planId]/PlanDetailClient.tsx` 的 useEffect 依赖从 `[planId, router]` 改为 `[planId]`
- [ ] `app/learn/[planId]/edit/PlanEditClient.tsx` 的 useEffect 依赖从 `[planId, router]` 改为 `[planId]`
- [ ] `app/learn/page.tsx` 的 useEffect 依赖从 `[router]` 改为 `[]`
- [ ] 所有被移除 router 依赖的 useEffect 有 eslint-disable-next-line 注释
- [ ] 手动验证：学习列表页 / 计划详情页 / 调整计划页 / 学习入口页均不再触发 React #185

## 阶段 1：修复 API Key 明文同步
- [ ] `lib/sync.ts` 的 `SYNC_PREFIXES` 不含 `KEY_PREFIXES.MODEL_CONFIG`
- [ ] `uploadAll` 同步数据中不含 `model:` 前缀的 key
- [ ] `uploadIncremental` 同步数据中不含 `model:` 前缀的 key
- [ ] `lib/types.ts` 的 ModelConfig.apiKey 注释更新为"仅本地存储，不同步到云端"
- [ ] 单测验证：同步数据不含 apiKey 字段
- [ ] 注释说明决策：API Key 仅本地，换设备需重新输入

## 阶段 2：Provider Fallback 链
- [ ] `lib/ai/provider.ts` 导出 `getModelWithFallback(): { model, providerId }`
- [ ] fallback 链从 `AI_FALLBACK_PROVIDER` 环境变量读取备选
- [ ] `withFallback<T>(fn)` 高阶函数实现 30s 超时 + 异常切换
- [ ] 所有 provider 失败时抛出最后一个错误
- [ ] `observeCall` 支持 `providerId` 参数
- [ ] fallback 事件记录为 warn 级别日志
- [ ] `app/api/learn/knowledge/route.ts` 接入 withFallback
- [ ] `app/api/adjust-plan/route.ts` 接入 withFallback
- [ ] 主模型正常时不走 fallback（无性能损耗）

## 阶段 3：首页数据精准查询
- [ ] `lib/storage/dexie-db.ts` KVRecord 新增 `dueAt` 字段（或 Card 加 due 索引）
- [ ] `setItem` 写入 ReviewCard 时自动提取 `dueAt`
- [ ] `lib/storage/db.ts` 新增 `countDueCards(now): Promise<number>`
- [ ] `countDueCards` 使用 `where('dueAt').below(now)` 精准查询
- [ ] `lib/storage/db.ts` 新增 `listRecentItems(prefix, days): Promise<T[]>`
- [ ] `listRecentItems` 使用 `where('updatedAt').above(sevenDaysAgo)` 精准查询
- [ ] `lib/home.ts` plans 加载改为 `listPlanSummaries()`
- [ ] `lib/home.ts` cards 加载改为 `countDueCards(now)`
- [ ] `lib/home.ts` logs 加载改为 `listRecentItems(LEARN_LOG, 7)`
- [ ] `lib/home.ts` emotions 加载改为 `listRecentItems(EMOTION, 7)`
- [ ] HomeClient 不依赖被省略的 knowledgeTree/questions 大字段
- [ ] 单测：countDueCards 精准计数
- [ ] 单测：listRecentItems 时间范围过滤

## 阶段 4：同步引擎 Tombstone
- [ ] `delItem` 删除前写 tombstone 记录（key=`tombstone:<原key>`，prefix=`tombstone`）
- [ ] tombstone 记录含 `deletedAt` ISO 时间戳
- [ ] `getChangesSince` 返回结果包含 tombstone 记录
- [ ] `lib/sync.ts` mergeData 识别 tombstone 前缀
- [ ] mergeData 收到 tombstone 后删除本地对应 originalKey
- [ ] `cleanExpiredTombstones()` 清理 30 天以上 tombstone
- [ ] `uploadAll` 末尾调用 `cleanExpiredTombstones()`
- [ ] 单测：delItem 后 tombstone 存在
- [ ] 单测：mergeData 收到 tombstone 后删除本地记录
- [ ] 单测：30 天过期 tombstone 被清理

## 阶段 5：画像增量更新
- [ ] `lib/ai/memory/user-profile.ts` 导出 `updateProfileField(field, value)`
- [ ] profile 不存在时不创建（等全量构建）
- [ ] 番茄完成后调用 `updateProfileField("averageSessionMinutes", newAverage)`
- [ ] newAverage 计算正确（增量平均）
- [ ] 复习完成后调用 skillLevel 更新（如实现）
- [ ] 低频维度保持 24h 批量重建

## 阶段 6：能量回归模型特征增强
- [ ] 特征向量从 4 维扩展为 8 维
- [ ] 新增 `sin(hourOfDay)` / `cos(hourOfDay)` 特征
- [ ] 新增 `dayOfWeek` 特征
- [ ] 新增 `dopamineInterference` 特征
- [ ] `TrainedModel.weights` 类型改为 `number[]`
- [ ] `trainModel` X 矩阵构建更新
- [ ] `predictActualMinutes` 参数增加 hourOfDay / dayOfWeek / dopamineInterference
- [ ] 单测：新特征提取
- [ ] 单测：训练 + 预测端到端

## 阶段 7：验证与合并
- [ ] `npm run lint` 0 error
- [ ] `npm run typecheck` 0 error
- [ ] `npm test` 全部通过
- [ ] 手动验证：学习列表页不再触发 React #185
- [ ] 手动验证：同步后云端 KV 不含 apiKey
- [ ] 手动验证：首页加载无全量 cards 日志
- [ ] 手动验证：删除计划后同步，另一设备该计划消失
- [ ] 代码已 commit
- [ ] 代码已 push 到远程分支
