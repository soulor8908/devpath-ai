# React 死循环修复与架构加固 Spec

## Why

两个独立但紧迫的问题同时暴露：

1. **React error #185（Maximum update depth exceeded）阻塞用户使用**：`app/learn/list/ListClient.tsx` 的 `useCallback(refresh, [router])` + `useEffect(refresh)` 形成链式依赖，router 引用抖动即触发无限渲染。同类 `useEffect(..., [planId, router])` 反模式在 4 个文件中重复出现。
2. **7 个架构隐患积压**：从安全（API Key 明文同步到云端）、可靠性（Provider 单点故障）、性能（首页全量加载）、正确性（同步不传播删除）到模型质量（能量回归特征薄弱），需要系统性排期而非零散修补。

### 卡帕西视角的优先级判断

不堆叠所有优化，按"阻断性 → 安全 → 可靠性 → 性能 → 正确性 → 质量"排序：

| 优先级 | 问题 | 判断依据 |
|--------|------|----------|
| P0 | React #185 死循环 | 用户当前无法使用页面 |
| P0 | E. API Key 明文同步到云端 | 安全漏洞，非优化——apiKey 与注释"不上传"矛盾，userId 泄漏即所有 AI Key 泄漏 |
| P1 | B. Provider 无 fallback | 单点故障，一个 GLM 宕机全盘崩溃；fallback 是可靠性基础工程 |
| P1 | F. 首页全量加载 + PLAN_SUMMARY 未用 | 低垂果实——PLAN_SUMMARY 已完整实现但首页未接入；dueCount 全量加载 cards 只为数 10 张到期卡 |
| P2 | D. 同步不传播删除 | 多设备场景产生幽灵数据；tombstone 是标准解 |
| P2 | C. 画像 24h 全量重建 | high-frequency 维度（averageSessionMinutes）应事件驱动 |
| P3 | G. 能量回归特征薄弱 | 3 特征线性模型；加 sin/cos(hourOfDay) 零成本提升 |
| P3 | A. 单表 KV 多表迁移 | 当前规模下单表够用；多表迁移投入大收益不明确，暂不做 |

**关于 A（多表迁移）的决策**：不纳入本次 spec。理由——当前用户规模（数百卡片）下单表 + prefix 索引性能可接受；真正的瓶颈是查询模式（全量加载后内存过滤），而非表结构。Phase 3 的精准查询（`where('due').below(now)` + PLAN_SUMMARY）已解决 80% 问题，剩余 20% 等真实规模数据出来再决定。

## What Changes

### 一、修复 React #185 死循环（P0）

- **根因**：4 个文件中 `useEffect` 依赖数组包含 `router`（`useRouter()` 返回值），router 引用变化 → effect 重跑 → setState → re-render → 可能再次触发 router 变化 → 无限循环
- **修复模式**：将 `router` 从 `useEffect` / `useCallback` 依赖数组中移除。Next.js App Router 的 `useRouter()` 返回稳定引用，但不应作为 effect 依赖——effect 只应依赖真正参与数据流的值。用 `useRef` 持有 router 引用，effect 内通过 ref 访问
- **涉及文件**：
  - `app/learn/list/ListClient.tsx`（最高危——router 经 useCallback 二次包装进 useEffect）
  - `app/learn/[planId]/PlanDetailClient.tsx`（7 个 setState 在 effect 内）
  - `app/learn/[planId]/edit/PlanEditClient.tsx`（5 个 setState 在 effect 内）
  - `app/learn/page.tsx`（effect 依赖 `[router]`）

### 二、修复 API Key 明文同步到云端（P0 安全）

- **根因**：`lib/sync.ts` 的 `SYNC_PREFIXES` 包含 `KEY_PREFIXES.MODEL_CONFIG`，`uploadAll` 会将含 `apiKey` 明文的 ModelConfig 同步到 Cloudflare KV。与 `lib/types.ts` 注释"不上传到云端"矛盾
- **修复**：从 `SYNC_PREFIXES` 中移除 `MODEL_CONFIG`。API Key 仅本地存储，换设备需重新输入。这是最安全的方案——加密同步需要密钥管理基础设施，当前阶段过度工程化
- **涉及文件**：`lib/sync.ts`（移除 MODEL_CONFIG 前缀 + 注释说明决策）

### 三、Provider Fallback 链（P1 可靠性）

- **现状**：`lib/ai/provider.ts` 的 `getModel()` 返回单模型，无 fallback、无超时、无重试
- **改动**：
  - 新增 `getModelWithFallback()` 函数，返回 `{ model, providerId }` 标注实际使用的模型
  - Fallback 链从 `ModelConfig` 读取主模型，环境变量 `AI_FALLBACK_PROVIDER` 指定备选
  - 超时：AI 调用包装 30s 超时（`AbortSignal.timeout`），超时后切备选
  - 成本追踪：返回值带 `providerId` 用于 observability 记录
- **涉及文件**：`lib/ai/provider.ts`（新增 fallback 逻辑）、`lib/ai/observability.ts`（记录实际使用的 provider）

### 四、首页数据精准查询（P1 性能）

- **现状**：`lib/home.ts` 的 `useHomeData` 9 路并行中 4 路全量加载（cards / plans / logs / emotions），PLAN_SUMMARY 已完整实现但未接入
- **改动**：
  - **Plans**：`listItems<LearningPlan>(PLAN)` → `listPlanSummaries()`，首页只需要 id/topic/schedule/createdAt，不需要 knowledgeTree/questions
  - **Cards**：新增 `countDueCards(now)` 函数，用 Dexie `where('due').below(now.toISOString())` 精准查询到期卡片数量，取代全量加载 cards 只为算 dueCount
  - **Logs**：新增 `listRecentLogs(days=7)` 函数，只查最近 7 天日志（首页统计只需近期数据）
  - **Emotions**：新增 `listRecentEmotions(days=7)` 函数，同理
- **涉及文件**：`lib/home.ts`（替换 4 路全量加载）、`lib/storage/db.ts`（新增精准查询函数）、`lib/storage/dexie-db.ts`（Card value 加 `due` 索引）

### 五、同步引擎 Tombstone 机制（P2 正确性）

- **现状**：`lib/sync.ts` 的 `uploadIncremental` 不传播删除，`delItem` 物理删除无 tombstone
- **改动**：
  - `delItem` 删除时额外写一条 tombstone 记录 `{ key: 'tombstone:<originalKey>', value: { deletedAt, originalPrefix }, prefix: 'tombstone', updatedAt }`，TTL 30 天自动过期
  - `getChangesSince` 返回结果包含 tombstone 记录
  - `mergeData`（下载合并）识别 tombstone → 删除本地对应 key
  - `uploadIncremental` 自动传播 tombstone
  - `uploadAll` 全量同步时自动清理过期 tombstone
- **涉及文件**：`lib/storage/db.ts`（delItem 写 tombstone）、`lib/sync.ts`（mergeData 处理 tombstone + 清理过期）

### 六、画像增量更新（P2 性能）

- **现状**：`lib/ai/memory/profile-builder.ts` 的 `buildUserProfile` 24h TTL 全量重建，4 路全量加载
- **改动**：
  - 新增 `updateProfileField(field, value)` 函数，支持单字段增量更新
  - 番茄完成时调用 `updateProfileField("averageSessionMinutes", newValue)` 即时更新
  - 复习完成时调用 `updateProfileField("skillLevel", partialUpdate)` 局部更新技能等级
  - 低频维度（goals / learningStyle）保持 24h 批量重建
- **涉及文件**：`lib/ai/memory/user-profile.ts`（新增增量更新）、`lib/ai/memory/profile-builder.ts`（拆分高频/低频维度）、`app/api/review/route.ts`（评分后触发增量更新）

### 七、能量回归模型特征增强（P3 质量）

- **现状**：`lib/energy-regression.ts` 3 特征线性回归（energy / moodNumeric / availableMinutes）
- **改动**：
  - 新增特征：`hourOfDay`（sin/cos 编码捕捉时段效应）、`dayOfWeek`（0-6）、`consecutiveHighIntensityDays`（连续高强度天数，捕捉疲劳累积）、`dopamineInterference`（0/1，有多巴胺干扰=1）
  - 模型升级：从 3 特征线性回归 → 7 特征线性回归（保持正规方程求解，不引入 TF.js）
  - 预测函数 `predictActualMinutes` 同步更新特征提取
- **涉及文件**：`lib/energy-regression.ts`（特征工程 + 训练 + 预测）

## Impact

### Affected specs
- `quality-gate-and-ux-rework`：不受影响（CI 门禁已就位）
- `ux-overhaul-and-learning-flow-rework`：不受影响
- `smart-learning-expansion`：Provider fallback 可能影响 Rate Limit Enforcement 需求（fallback 调用也需计入 rate limit）

### Affected code
- 修改文件 12 个：
  - `app/learn/list/ListClient.tsx`（router 依赖修复）
  - `app/learn/[planId]/PlanDetailClient.tsx`（router 依赖修复）
  - `app/learn/[planId]/edit/PlanEditClient.tsx`（router 依赖修复）
  - `app/learn/page.tsx`（router 依赖修复）
  - `lib/sync.ts`（移除 MODEL_CONFIG 同步 + tombstone 机制）
  - `lib/storage/db.ts`（delItem tombstone + 精准查询函数）
  - `lib/storage/dexie-db.ts`（Card value 加 due 索引）
  - `lib/ai/provider.ts`（fallback 链）
  - `lib/ai/observability.ts`（记录实际 provider）
  - `lib/home.ts`（精准查询替换全量加载）
  - `lib/ai/memory/user-profile.ts` + `lib/ai/memory/profile-builder.ts`（增量更新）
  - `lib/energy-regression.ts`（特征增强）
- 新增文件 0 个（全部修改既有文件）

## ADDED Requirements

### Requirement: Stable useEffect Dependencies
系统 SHALL 确保所有 `useEffect` 的依赖数组不包含 `useRouter()` 返回值，避免 router 引用抖动触发无限渲染。

#### Scenario: router 引用变化
- **GIVEN** Next.js App Router 因路由变化或 hydration 导致 `useRouter()` 返回新引用
- **WHEN** 组件 re-render
- **THEN** `useEffect` 不重跑（router 不在依赖数组中）
- **AND** router 通过 `useRef` 在 effect 内访问
- **AND** 不触发 React error #185

### Requirement: API Key Local-Only Storage
系统 SHALL NOT 将 API Key 同步到云端，API Key 仅存储在本地 IndexedDB。

#### Scenario: 用户配置 API Key
- **GIVEN** 用户在设置页配置了 GLM API Key
- **WHEN** 触发同步（uploadAll / uploadIncremental）
- **THEN** ModelConfig 记录不包含在同步数据中
- **AND** 云端 KV 中不存在任何 apiKey 字段
- **AND** 换设备时用户需重新输入 API Key

### Requirement: Provider Fallback Chain
系统 SHALL 在主模型故障时自动切换到备选模型，确保 AI 功能不因单点故障中断。

#### Scenario: 主模型超时
- **GIVEN** 主模型（如 GLM）在 30 秒内未响应
- **WHEN** AI 调用触发
- **THEN** 自动切换到备选 provider（如 DeepSeek）
- **AND** 返回结果标注实际使用的 `providerId`
- **AND** observability 记录 fallback 事件

#### Scenario: 主模型返回错误
- **GIVEN** 主模型返回 5xx 或网络错误
- **WHEN** AI 调用触发
- **THEN** 自动重试备选 provider
- **AND** 用户无感知（除非所有 provider 都失败）

### Requirement: Targeted Data Queries
系统 SHALL 使用精准查询替代全量加载，减少首页内存开销。

#### Scenario: 首页加载 dueCount
- **GIVEN** 用户有 500 张复习卡片，其中 10 张到期
- **WHEN** 首页加载计算 dueCount
- **THEN** 仅查询 `due <= now` 的卡片（O(due) 而非 O(n)）
- **AND** 不将 500 张卡片全部加载到内存

#### Scenario: 首页加载计划列表
- **GIVEN** 用户有 10 个学习计划
- **WHEN** 首页加载计划列表
- **THEN** 使用 `listPlanSummaries()` 返回轻量摘要
- **AND** 不加载 knowledgeTree / questions 等大字段

### Requirement: Sync Tombstone Propagation
系统 SHALL 通过 tombstone 机制传播删除操作，确保多设备间删除同步。

#### Scenario: 删除计划后同步
- **GIVEN** 用户在设备 A 删除了一个学习计划
- **WHEN** 设备 A 触发增量同步
- **THEN** 上传一条 tombstone 记录 `{ key, deletedAt }`
- **AND** 设备 B 增量下载时收到 tombstone
- **AND** 设备 B 删除本地对应的计划记录

#### Scenario: tombstone 过期清理
- **GIVEN** 一条 tombstone 已存在 30 天
- **WHEN** 全量同步（uploadAll）执行
- **THEN** 该 tombstone 被清理
- **AND** 不再占用存储空间

### Requirement: Incremental Profile Update
系统 SHALL 对高频维度（averageSessionMinutes / skillLevel）使用事件驱动增量更新，低频维度保持批量重建。

#### Scenario: 番茄完成后更新画像
- **GIVEN** 用户完成一个 25 分钟番茄
- **WHEN** completeSession() 执行
- **THEN** `averageSessionMinutes` 立即增量更新
- **AND** 不触发全量 buildUserProfile

### Requirement: Enhanced Energy Model Features
系统 SHALL 使用增强特征集训练能量回归模型，捕捉非线性因素影响。

#### Scenario: 模型训练
- **GIVEN** 有 ≥10 条 EnergySample 数据
- **WHEN** 触发模型训练
- **THEN** 使用 7 个特征：energy / moodNumeric / availableMinutes / sin(hourOfDay) / cos(hourOfDay) / dayOfWeek / dopamineInterference
- **AND** 模型预测精度优于 3 特征基线

## MODIFIED Requirements

### Requirement: Deploy Workflow
`quality-gate-and-ux-rework` 已建立 CI 质量门禁。本次修改不改变 CI 流程，但所有改动须通过 `npm run quality-gate` 验证。

### Requirement: Data Sync
原同步引擎仅支持增量新增/更新，不传播删除。修改为：通过 tombstone 机制支持删除传播，30 天 TTL 自动清理。

### Requirement: Home Data Loading
原首页全量加载 cards/plans/logs/emotions。修改为：plans 用 PLAN_SUMMARY，cards 用 dueCount 精准查询，logs/emotions 只查最近 7 天。

## REMOVED Requirements

### Requirement: API Key Cloud Sync
**Reason**: 安全漏洞——apiKey 明文同步到云端 KV，userId 泄漏即所有 AI Key 泄漏。
**Migration**: API Key 改为仅本地存储。已有云端 KV 中的 apiKey 数据需用户手动删除（或后续版本加清理脚本）。换设备时需重新输入 API Key。
