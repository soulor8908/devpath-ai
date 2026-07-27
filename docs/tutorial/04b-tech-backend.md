# 第 4b 章：技术选型 — 后端与存储

> **视角**：卡帕西（系统思维 / 第一性原理 / 权衡分析 / 关注点分离）
> **前置知识**：读完了 [第 4a 章 前端技术选型](file:///workspace/docs/tutorial/04a-tech-frontend.md)
> **本章学什么**：
> 1. 本地存储：IndexedDB (Dexie) vs localStorage vs SQLite WASM vs OPFS
> 2. 云端存储：Cloudflare KV vs Supabase vs Firebase vs PlanetScale vs Turso
> 3. 数据同步策略：全量备份 vs 增量同步+LWW vs CRDT vs 实时同步
> 4. API 路由模式：Next.js API Routes vs Edge Functions vs Pages Functions vs 独立后端
> 5. 数据校验：Zod vs Yup vs Joi vs Valibot vs 手写类型守卫
> **预计阅读时间**：35 分钟
> **关联文档**：[docs/ARCHITECTURE.md](file:///workspace/docs/ARCHITECTURE.md) / [docs/DEVELOPMENT.md](file:///workspace/docs/DEVELOPMENT.md)

---

## 4b.1 基础概念（初学者先读这节）

- **IndexedDB**：浏览器内置的 NoSQL 数据库，能存大量结构化数据（通常 50MB-无上限），异步 API，支持索引查询。
- **Dexie.js**：IndexedDB 的 Promise 化封装，API 更友好（`db.table.add()` 而不是 `transaction.objectStore().add()`）。
- **localStorage**：浏览器内置的同步 KV 存储，容量小（通常 5-10MB），会阻塞主线程，只能存字符串。
- **Cloudflare KV**：Cloudflare 的全球边缘键值存储，最终一致性，按 namespace 隔离，免费额度 100K reads/天 + 1K writes/天。
- **LWW（Last-Write-Wins）**：冲突合并策略，最后写入的覆盖先写入的。简单但可能丢数据。
- **CRDT（Conflict-free Replicated Data Type）**：无冲突复制数据类型，自动合并，不丢数据，但实现复杂。
- **tombstone**：删除标记。数据"删除"时不真删，标记为 tombstone，同步时告诉其他设备"这条删了"。
- **Edge Function**：运行在 CDN 边缘节点的函数，离用户最近，冷启动几乎为零。
- **Zod**：TypeScript 优先的运行时数据校验库，schema 即类型（`z.infer<typeof schema>` 自动推导 TS 类型）。

---

## 4b.2 B1. 本地存储：IndexedDB + Dexie

### 决策

选择 **IndexedDB + Dexie.js**（单表 kv + 4 索引：`&key, prefix, updatedAt, dueAt`）。

### 背景

devpath-ai 是本地优先 PWA，所有学习数据存在浏览器：
- FSRS 复习卡片（数千张）
- 学习计划 + 知识节点（49 节点派生）
- 学习日志（LearnLog）
- 能量样本（EnergySample）
- 情绪记录
- 用户配置（含 apiKey，加密存储）

需要：
- 大容量（>50MB）
- 索引查询（按 updatedAt 找变更 / 按 dueAt 找到期卡片）
- 异步 API（不阻塞主线程）
- 浏览器原生（不依赖服务器）

### 对比

| 维度 | IndexedDB (Dexie) | localStorage | SQLite WASM | OPFS |
|---|---|---|---|---|
| 容量 | ✅ 大（50MB-无上限） | ❌ 小（5-10MB） | ✅ 大 | ✅ 大 |
| API 类型 | ✅ 异步 | ❌ 同步（阻塞） | ✅ 异步 | ✅ 异步 |
| 索引查询 | ✅（createIndex） | ❌（只能遍历） | ✅（SQL） | ❌ |
| 数据类型 | ✅ 结构化（对象/数组/Blob） | ❌ 字符串 | ✅ SQL 类型 | ✅ Blob |
| 事务支持 | ✅ | ❌ | ✅ | ❌ |
| 浏览器兼容 | ✅ 所有现代浏览器 | ✅ | ⚠️（需 WASM 支持） | ⚠️（较新） |
| Bundle 体积 | ✅ 0（原生）+ Dexie ~30KB | ✅ 0 | ❌ 大（~1MB WASM） | ✅ 0 |
| 学习曲线 | 中（Dexie 简化） | ✅ 低 | 中（SQL） | 中 |

### 选择理由（卡帕西视角）

1. **容量够大**：49 节点 + 数千卡片 + 学习日志 + 能量样本，localStorage 5-10MB 不够。
2. **索引查询**：FSRS 复习需要按 `dueAt` 索引找到期卡片；增量同步需要按 `updatedAt` 索引找变更。IndexedDB 原生支持。
3. **异步 API**：不阻塞主线程，UI 流畅。localStorage 同步会卡顿。
4. **Dexie 简化 API**：原生 IndexedDB API 极其难用（事务 + objectStore + cursor），Dexie 用 Promise + 链式调用简化。
5. **零依赖原生**：IndexedDB 浏览器原生，不依赖 WASM 加载。

### 实现细节

引用自 [lib/storage/dexie-db.ts](file:///workspace/lib/storage/dexie-db.ts)：

```typescript
// 单表 kv + 4 索引
db.version(1).stores({
  kv: '&key, prefix, updatedAt, dueAt'
});

// 自动迁移 idb-keyval（旧用户）
if (await needMigrate()) {
  await migrateFromIdbKeyval();
}
```

**为什么单表 kv 而不是多表**：
- 简化同步逻辑（只需同步一个表）
- prefix 索引区分不同数据类型（如 `plan:xxx` / `card:xxx` / `log:xxx`）
- LWW 合并只需比较 updatedAt

### 代价

- **Dexie 体积 ~30KB**：比原生 IndexedDB 大，但 API 友好度提升 10 倍
- **IndexedDB 事务模型复杂**：跨表事务需显式声明，Dexie 简化但仍需理解
- **浏览器隐私模式失效**：Safari 隐私模式 IndexedDB 不可用，需降级到 localStorage

### 踩过的坑

- **Safari 隐私模式**：IndexedDB 不可用，需 try-catch 降级到 localStorage（只存关键配置）
- **IndexedDB 版本迁移**：早期用 idb-keyval（单 key），迁移到 Dexie 时需保留旧数据。`migrateFromIdbKeyval()` 函数处理。
- **大数据集查询慢**：全量 list 卡顿，加 `countDueCards()` 索引查询只返回 count，不返回数据。

---

## 4b.3 B2. 云端存储：Cloudflare KV

### 决策

选择 **Cloudflare KV**（4 namespace：业务数据 / AUTH_SESSIONS / AUTH_NONCES / AUTH_AUDIT）。

### 背景

devpath-ai 需要跨设备同步 + 零信任 session 存储 + 限流计数：
- 业务数据：用户的学习数据备份（手动触发上传）
- AUTH_SESSIONS：加密的 apiKey session（AES-GCM）
- AUTH_NONCES：防重放攻击的 nonce（5min 一次性消费）
- AUTH_AUDIT：鉴权审计日志

### 对比

| 维度 | Cloudflare KV | Supabase | Firebase | PlanetScale | Turso |
|---|---|---|---|---|---|
| 数据模型 | KV（键值） | Postgres | NoSQL | MySQL | SQLite |
| 部署位置 | ✅ 全球 Edge | 单区域 | 单区域 | 单区域 | 多区域 |
| 冷启动 | ✅ 零 | 有 | 有 | 有 | 有 |
| 一致性 | 最终一致 | 强一致 | 强一致 | 强一致 | 强一致 |
| 免费额度 | ✅ 100K reads + 1K writes/天 | 500MB + 50K MAU | 1GB + 50K reads/天 | ❌ 无免费 | 500 DB + 1K reads/天 |
| 与 Cloudflare Pages 集成 | ✅ 原生 | ❌ | ❌ | ❌ | ❌ |
| 事务支持 | ❌ | ✅ | ❌ | ✅ | ✅ |
| 关系查询 | ❌ | ✅ SQL | ❌ | ✅ SQL | ✅ SQL |
| 学习曲线 | ✅ 低（KV） | 中（SQL + Auth） | 中 | 中 | 中 |
| 数据归属 | ✅ 用户（按 userId 隔离） | 平台 | 平台 | 平台 | 用户 |

### 选择理由（卡帕西视角）

1. **与 Cloudflare Pages 原生集成**：部署在同一平台，无需跨平台配置。Binding 直接访问，延迟最低。
2. **全球 Edge**：数据存在离用户最近的节点，读取快。
3. **免费额度足够**：100K reads/天 + 1K writes/天，devpath-ai 的同步是手动触发的低频场景。
4. **数据归属用户**：按 `userId` 隔离，每个用户的数据独立，符合"用户拥有数据"原则。
5. **不需要 SQL**：devpath-ai 的数据是 KV 模型（key-value），不需要关系查询。SQL 是过度工程。
6. **零冷启动**：与 Cloudflare Pages Edge Runtime 一致，无 server wake-up 延迟。

### 代价

- **最终一致性**：写入后可能延迟几秒才全球同步。session 写入后需 retry 机制。
- **无事务**：跨 namespace 操作不是原子的。需用幂等键 + 重试。
- **无关系查询**：不能 JOIN。但 devpath-ai 用 prefix 索引（`plan:xxx` / `card:xxx`）模拟关系。
- **写入限流**：1K writes/天，需用增量同步（只传变更）+ tombstone TTL 30 天减少写入。

### 实现细节

引用自 [lib/storage/kv.ts](file:///workspace/lib/storage/kv.ts)：

```typescript
// 4 个独立 namespace
const KV_BUSINESS = env.DEVPATH_KV;           // 业务数据
const KV_SESSIONS = env.AUTH_SESSIONS;        // 加密 session
const KV_NONCES = env.AUTH_NONCES;            // nonce 防重放
const KV_AUDIT = env.AUTH_AUDIT;              // 审计日志

// 按 userId 隔离
function k(userId: string, key: string) {
  return `${userId}:${key}`;
}

// 增量同步：只传 updatedAt > lastSyncAt 的数据
async function getChangesSince(userId: string, lastSyncAt: number) {
  // 利用 IndexedDB 的 updatedAt 索引
  const changes = await db.kv.where('updatedAt').above(lastSyncAt).toArray();
  return changes;
}
```

### 踩过的坑

- **session 写入后立即读取不到**：最终一致性，需 retry 3 次 + 200ms 间隔
- **KV 限流**：早期用全量同步，写入超限。改为增量同步 + LWW 合并
- **跨 namespace 一致性**：session 写入 + nonce 删除不是原子的，需幂等键

---

## 4b.4 B3. 数据同步策略：增量同步 + LWW

### 决策

选择 **增量同步（updatedAt 索引）+ Last-Write-Wins 合并 + tombstone TTL 30 天**。

### 背景

devpath-ai 需要跨设备同步：
- 用户在公司电脑学了一上午（番茄 4 个 + 复习 10 张卡）
- 上传到云端
- 回家在另一台电脑下载，继续学习

需要：
- 低网络成本（只传变更）
- 冲突合并简单（LWW）
- 删除传播（tombstone）

### 对比

| 维度 | 全量备份 | 增量同步+LWW | CRDT | 实时同步 |
|---|---|---|---|---|
| 网络成本 | ❌ 高（每次全量） | ✅ 低（只传变更） | ✅ 低 | ✅ 低 |
| 冲突处理 | ❌ 覆盖（后写赢） | ✅ LWW（按 updatedAt） | ✅ 自动合并 | ❌ 需手动 |
| 数据丢失风险 | ❌ 高（旧覆盖新） | 中（同时编辑会丢） | ✅ 零 | 中 |
| 实现复杂度 | ✅ 低 | ✅ 低 | ❌ 高 | 中 |
| 实时性 | ❌ 低（手动触发） | ❌ 低（手动触发） | ✅ 高 | ✅ 高 |
| 离线支持 | ✅ | ✅ | ✅ | ❌ |
| 服务器成本 | ❌ 高（全量存储） | ✅ 低 | ✅ 低 | ❌ 高（长连接） |

### 选择理由（卡帕西视角）

1. **YAGNI**：devpath-ai 是单人学习工具，不是协作工具。同时编辑概率低，LWW 够用。CRDT 是过度工程。
2. **网络成本低**：增量同步利用 IndexedDB 的 `updatedAt` 索引，只传 `updatedAt > lastSyncAt` 的数据。无变更返回 noop（O(0) 网络成本）。
3. **实现简单**：LWW 合并只需比较 `updatedAt`，代码量 < 50 行。CRDT 需引入 Yjs / Automerge 等库。
4. **离线优先**：同步是手动触发的，不依赖实时连接。用户离线学习一段时间后，连网手动上传。
5. **服务器成本低**：增量同步 + 手动触发，KV 写入量低，免费额度内。

### 实现细节

引用自 [lib/sync.ts](file:///workspace/lib/sync.ts)：

```typescript
// 上传：增量同步
async function uploadChanges(userId: string, lastSyncAt: number) {
  const changes = await db.kv.where('updatedAt').above(lastSyncAt).toArray();
  if (changes.length === 0) return { status: 'noop' };  // O(0) 网络成本
  
  // 批量写入 KV（LWW）
  for (const item of changes) {
    await KV_BUSINESS.put(`${userId}:${item.key}`, JSON.stringify(item));
  }
  return { status: 'ok', count: changes.length };
}

// 下载：LWW 合并
async function downloadAndMerge(userId: string, lastSyncAt: number) {
  const remote = await KV_BUSITIES.list({ prefix: `${userId}:` });
  for (const { name, metadata } of remote.keys) {
    const local = await db.kv.get(name.split(':')[1]);
    if (!local || local.updatedAt < metadata.updatedAt) {
      // LWW：远端较新，覆盖本地
      await db.kv.put(JSON.parse(await KV_BUSINESS.get(name)));
    }
  }
}

// 删除传播：tombstone TTL 30 天
async function deleteItem(key: string) {
  await db.kv.put({ key, deleted: true, updatedAt: Date.now() });  // tombstone
  // 30 天后真删（cron job 清理）
}
```

### 代价

- **同时编辑会丢数据**：用户在两台设备同时编辑同一条，后写的覆盖先写的。但 devpath-ai 是单人工具，概率极低。
- **无实时性**：同步是手动触发的，不是实时的。但用户期望也是"备份"而非"实时同步"。
- **tombstone 占空间**：删除标记保留 30 天，占用 IndexedDB + KV 空间。30 天后 cron 清理。

### 踩过的坑

- **删除不传播**：早期真删数据，同步时不知道这条删了，远端又拉回来。改为 tombstone 后解决。
- **LWW 丢数据**：用户在 A 设备改了卡片，B 设备同时改了同一张，B 上传覆盖 A。降级方案：合并复习历史数组（不覆盖，append）。

---

## 4b.5 B4. API 路由模式：Next.js API Routes (Edge)

### 决策

选择 **Next.js API Routes (Edge Runtime)**（20 个路由）。

### 背景

devpath-ai 的后端需求：
- AI 调用代理（聊天 / 生成计划 / 周报 / V3 评审）
- 鉴权（session 交换 / nonce 验证 / revoke）
- 数据同步（上传 / 下载 / 增量合并）
- 限流（按场景配额）
- Trial 模式（服务端付费 AI 调用）

需要：
- Edge Runtime（零冷启动 + 全球 CDN）
- 与 Next.js 同仓库（不养独立后端）
- TypeScript 原生
- 无服务器维护

### 对比

| 维度 | Next.js API Routes (Edge) | Cloudflare Pages Functions | Cloudflare Workers | 独立后端 (Express) |
|---|---|---|---|---|
| 与 Next.js 集成 | ✅ 原生 | ✅（next-on-pages） | ❌（独立） | ❌ |
| Edge Runtime | ✅ | ✅ | ✅ | ❌（Node.js） |
| 冷启动 | ✅ 零 | ✅ 零 | ✅ 零 | ❌ 有 |
| Bundle 限制 | ⚠️ 3MB（next-on-pages） | ⚠️ 3MB | ⚠️ 10MB | ❌ 无 |
| Node API 支持 | ⚠️ nodejs_compat | ⚠️ nodejs_compat | ⚠️ nodejs_compat | ✅ 完整 |
| TypeScript | ✅ | ✅ | ✅ | ✅ |
| 学习曲线 | ✅ 低（Next.js 生态） | 中 | 中 | ✅ 低 |
| 部署复杂度 | ✅ 低（git push） | ✅ 低 | 中 | ❌ 高（需服务器） |

### 选择理由（卡帕西视角）

1. **与 Next.js 同仓库**：API 路由在 `app/api/` 下，与前端代码同仓库同 PR，部署一致。
2. **Edge Runtime 零冷启动**：与 Cloudflare Pages 部署一致，全球 CDN 边缘节点运行。
3. **TypeScript 原生**：类型安全 + 与前端共享类型（如 `lib/types/`）。
4. **无服务器维护**：git push 自动部署，无需 DevOps。
5. **nodejs_compat flag 解决 Node API 限制**：能用 `Buffer` / `crypto.subtle` 等。

### 代价

- **3MB bundle 限制**：preset TS 源文件静态 import 导致 13MB → 改为 fetch JSON 降到 6.5MB
- **Edge Runtime 限制**：不能用 `fs` / `path` / 原生 `crypto`，需 Web Crypto API 封装
- **无长连接**：不能做 WebSocket / SSE 长连接（用 Vercel AI SDK 的流式响应替代）

### 实现细节

引用自 [app/api/chat/route.ts](file:///workspace/app/api/chat/route.ts)（简化）：

```typescript
export const runtime = 'edge';  // Edge Runtime

export async function POST(req: Request) {
  // 1. 鉴权（零信任 session）
  const session = await verifySession(req);
  
  // 2. 限流（按场景）
  await rateLimit(session.userId, 'chat', 20);  // 20/日
  
  // 3. 流式 AI 调用
  const result = await streamText({
    model: getModel(session.modelConfig),
    messages: await buildContext(session.userId),
    tools: chatTools,
  });
  
  // 4. 返回流式响应
  return result.toDataStreamResponse();
}
```

### 踩过的坑

- **Edge Runtime 不支持 `fs`**：preset 数据早期用 `import` 静态加载 TS 源文件，bundle 爆炸。改为运行时 `fetch('/data/presets/{id}.json')`。
- **crypto.subtle API 差异**：Edge Runtime 的 Web Crypto API 与 Node.js `crypto` 不同，需 `lib/ai/crypto.ts` 封装。

---

## 4b.6 B5. 数据校验：Zod

### 决策

选择 **Zod**（schema 即类型）。

### 背景

devpath-ai 需要校验：
- AI 生成的内容（知识节点 / 面试题 / 答案 / 学习计划）
- API 请求体（聊天 / 同步 / 鉴权）
- 课程图谱 YAML（49 节点 + 来源 + Rubric）
- 用户配置（modelConfig / profile）

需要：
- TypeScript 类型自动推导
- 运行时校验
- 详细的错误信息
- 可组合（schema 嵌套）

### 对比

| 维度 | Zod | Yup | Joi | Valibot | 手写类型守卫 |
|---|---|---|---|---|---|
| TypeScript 集成 | ✅ `z.infer` 自动推导 | ❌ 需手动 | ❌ 需手动 | ✅ | ❌ |
| Bundle 体积 | 中（~13KB） | 中（~14KB） | ❌ 大（~50KB） | ✅ 小（按需） | ✅ 0 |
| 运行时校验 | ✅ | ✅ | ✅ | ✅ | ✅（手写） |
| 错误信息 | ✅ 详细 | ✅ | ✅ | ✅ | ❌（需手写） |
| 可组合 | ✅（嵌套） | ✅ | ✅ | ✅ | ❌ |
| 学习曲线 | ✅ 低 | ✅ 低 | 中 | ✅ 低 | ✅ 低 |
| 生态 | ✅ 大（React Hook Form / tRPC 等） | 中 | 中 | 新 | - |

### 选择理由（卡帕西视角）

1. **schema 即类型**：`z.infer<typeof schema>` 自动推导 TypeScript 类型，避免手写类型与校验逻辑不一致。
2. **运行时校验**：AI 生成的内容不可信，必须运行时校验。Zod 在 API 边界 + AI 输出边界都做校验。
3. **详细的错误信息**：校验失败时返回具体路径 + 期望类型 + 实际值，调试方便。
4. **可组合**：`z.object({ user: UserSchema, posts: z.array(PostSchema) })` 嵌套方便。
5. **生态大**：React Hook Form / tRPC / Next.js 都原生支持。

### 实现细节

引用自 [lib/curriculum/schema.ts](file:///workspace/lib/curriculum/schema.ts)（简化）：

```typescript
const NodeSchema = z.object({
  id: z.string().regex(/^[a-z]+\.[a-z-]+$/),
  title: z.string().min(1),
  track: z.array(z.string()),
  prerequisites: z.array(z.string()),
  authoritative_sources: z.array(SourceSchema).min(2),  // 至少 2 条
  concepts: z.array(ConceptSchema),
  gotchas: z.array(z.string()),
  interview: z.array(InterviewSchema),
  mastery_check: MasteryCheckSchema,
});

type KnowledgeNode = z.infer<typeof NodeSchema>;  // 自动推导类型
```

引用自 [lib/ai/knowledge.ts](file:///workspace/lib/ai/knowledge.ts)（AI 输出校验）：

```typescript
const nodeSchema = z.object({
  // ... 基础字段
  summary: z.string(),
  // v4 深度字段（必填）
  coreMechanism: z.string().describe("核心机制 80-150 字"),
  commonPitfalls: z.array(z.string()).min(2),
  interviewAngles: z.array(z.string()).length(4),
  sourceHint: z.string().min(5),
});

// AI 生成 + Zod 校验
const result = await generateObject({
  schema: nodeSchema,
  // ...
});
```

### 代价

- **bundle 体积 ~13KB**：比 Yup 大，但 TypeScript 集成优势远超体积代价
- **性能**：校验大对象时比手写类型守卫慢，但 devpath-ai 的对象都不大（< 100 字段）
- **学习曲线**：需学 Zod DSL，但比 Joi / Yup 简单

### 踩过的坑

- **Zod + Vercel AI SDK `generateObject`**：早期版本 schema 变化未触发类型重新推导，需重启 TS server
- **深层嵌套校验慢**：课程图谱 schema 嵌套 5 层，校验 49 节点 + 40 来源 + 5 Rubric 需 ~200ms。可接受（CI 跑，不在运行时）

---

## 4b.7 章节小结：后端技术栈一览

| 层 | 选型 | 理由 |
|---|---|---|
| 本地存储 | IndexedDB + Dexie | 大容量 + 索引查询 + 异步 API |
| 云端存储 | Cloudflare KV（4 namespace） | 与 Pages 原生集成 + 全球 Edge + 免费 |
| 数据同步 | 增量同步 + LWW + tombstone 30 天 | YAGNI + 网络成本低 + 实现简单 |
| API 路由 | Next.js API Routes (Edge) | 与 Next.js 同仓库 + 零冷启动 |
| 数据校验 | Zod | schema 即类型 + 运行时校验 + 生态大 |

---

## 本章小结

**学到了什么**：
1. IndexedDB + Dexie 的选择理由：大容量 + 索引查询 + 异步 API，代价是事务模型复杂
2. Cloudflare KV 的选择理由：与 Pages 原生集成 + 全球 Edge + 免费额度，代价是最终一致性
3. 增量同步 + LWW 的选择理由：YAGNI + 网络成本低 + 实现简单，代价是同时编辑会丢数据
4. Next.js API Routes (Edge) 的选择理由：与 Next.js 同仓库 + 零冷启动，代价是 3MB bundle 限制
5. Zod 的选择理由：schema 即类型 + 运行时校验，代价是 bundle 体积

**关键决策回顾**：
1. **本地优先 + 可选同步**：数据归用户，不归平台
2. **单表 kv + 4 索引**：简化同步逻辑 + LWW 合并只需比较 updatedAt
3. **YAGNI 原则**：不用 CRDT / SQL / 实时同步，用最简单的 LWW
4. **契约层优先**：Zod schema 是单一事实源，TS 类型自动推导

## 下一章衔接

下一章 [04c-tech-ai.md](file:///workspace/docs/tutorial/04c-tech-ai.md) 讲 AI 集成技术选型：AI SDK / Provider 适配 / 复习算法 / 向量搜索 / Session 安全。

## 延伸阅读

- [IndexedDB API](https://developer.mozilla.org/docs/Web/API/IndexedDB_API)
- [Dexie.js 文档](https://dexie.org/)
- [Cloudflare KV 文档](https://developers.cloudflare.com/kv/)
- [Zod 文档](https://zod.dev/)
