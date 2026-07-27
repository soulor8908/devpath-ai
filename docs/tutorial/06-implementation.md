# 第 6 章：代码实现

> **视角**：卡帕西（关注点分离 / 纯函数 / 不可变数据 / 契约层优先）
> **前置知识**：读完了 [第 5 章 规范约束制定](file:///workspace/docs/tutorial/05-standards.md)
> **本章学什么**：
> 1. 6 个核心模块的实现决策 + 代码片段
> 2. 每模块的职责 / 关键决策 / 踩过的坑
> 3. 实际代码示例（≤30 行 / 段）
> **预计阅读时间**：40 分钟
> **关联文档**：[docs/ARCHITECTURE.md](file:///workspace/docs/ARCHITECTURE.md) / [docs/DEVELOPMENT.md](file:///workspace/docs/DEVELOPMENT.md)

---

## 6.1 模块概览

devpath-ai 的核心模块按职责分层：

```
┌─────────────────────────────────────────────────────────────┐
│  AI 层（lib/ai/）                                              │
│  ├─ session-middleware.ts  零信任 session 鉴权                  │
│  ├─ crypto.ts              Edge runtime 兼容加解密              │
│  ├─ provider.ts            模型解析 + fallback 链               │
│  ├─ prompts.ts             Prompt 注册表 + 版本指纹             │
│  ├─ chat-tools.ts          8 个 AI 工具定义                     │
│  ├─ persona.ts             4 种 Persona 自动选择                │
│  ├─ rhythm-engine.ts       节奏引擎（6 条决策链）               │
│  └─ priority-engine.ts     优先级引擎（4 维加权）               │
├─────────────────────────────────────────────────────────────┤
│  课程层（lib/curriculum/）                                      │
│  ├─ schema.ts              zod 校验                            │
│  ├─ graph.ts               图谱构建 + G1-G7 + Kahn 拓扑排序     │
│  └─ path-engine.ts         L2 个性化路径引擎                    │
├─────────────────────────────────────────────────────────────┤
│  存储层（lib/storage/）                                         │
│  ├─ dexie-db.ts            IndexedDB 单表 kv + 4 索引          │
│  ├─ db.ts                  数据访问层                          │
│  ├─ cache.ts               5min TTL + LRU 100 内存缓存         │
│  └─ kv.ts                  Cloudflare KV 封装                  │
├─────────────────────────────────────────────────────────────┤
│  业务层（lib/）                                                 │
│  ├─ fsrs.ts                FSRS 复习调度                       │
│  ├─ sync.ts                增量同步引擎                        │
│  ├─ study-queue/           学习队列（5 维评分）                │
│  └─ timer/                 番茄时钟                            │
└─────────────────────────────────────────────────────────────┘
```

本章深入 6 个核心模块：
1. **FSRS 复习引擎**（lib/fsrs.ts）
2. **节奏引擎**（lib/ai/rhythm-engine.ts）
3. **零信任 session**（lib/ai/session-middleware.ts + lib/ai/crypto.ts）
4. **数据同步引擎**（lib/sync.ts）
5. **学习队列**（lib/study-queue/）
6. **课程图谱**（lib/curriculum/）

---

## 6.2 模块 1：FSRS 复习引擎

### 职责

基于遗忘曲线调度复习卡片，决定每张卡片下次到期的最佳时间。

### 关键决策

| 决策 | 选择 | 理由 |
|---|---|---|
| 算法 | FSRS-4.5（ts-fsrs） | 基于 5 亿数据训练，精度最高 |
| 参数预设 | 3 种（conservative 0.95 / standard 0.9 / aggressive 0.8） | 用户按需切换 |
| 时区 | 固定 Asia/Shanghai | 避免跨时区 dueAt 偏移 |
| 数据格式 | 与 Anki 兼容 | 未来可导出 |

### 代码片段

引用自 [lib/fsrs.ts](file:///workspace/lib/fsrs.ts)（简化）：

```typescript
import { fsrs, generatorParameters, Rating } from 'ts-fsrs';

// 3 种参数预设
const PRESETS = {
  conservative: 0.95,  // 保守，复习频繁
  standard:     0.9,   // 默认
  aggressive:   0.8,   // 激进，复习稀疏
};

export function createScheduler(preset: keyof typeof PRESETS) {
  const params = generatorParameters({
    request_retention: PRESETS[preset],
    maximum_interval: 365,
  });
  return fsrs(params);
}

// 调度卡片
export function scheduleCard(card: Card, rating: Rating, preset = 'standard') {
  const scheduler = createScheduler(preset);
  const now = new Date();
  const results = scheduler.schedule(card, now);
  return results[rating];  // 返回对应评分的下一状态
}
```

### 踩过的坑

- **时区偏移**：早期未固定时区，跨时区用户 dueAt 偏移 8 小时。`lib/time.ts` 固定 Asia/Shanghai 解决。
- **旧数据迁移**：早期用 SM-2，迁移到 FSRS 需保留 stability/difficulty。`migrateFromSM2()` 函数处理。
- **`maximum_interval` 限制**：FSRS 默认 36500 天，太长。改为 365 天，避免卡片"永不出现"。

---

## 6.3 模块 2：节奏引擎

### 职责

统一编排"现在该做什么"，6 条决策优先级链，不消耗 AI 额度。

### 关键决策

| 决策 | 选择 | 理由 |
|---|---|---|
| 决策方式 | 规则链（非 AI） | 零成本 + 确定性 |
| 优先级 | 6 条（继续专注 → 低能量休息 → 到期复习 → routine 时段 → 睡前复盘 → 默认学习） | 覆盖所有场景 |
| 数据源 | LearnLog + EnergySample + Routine | 本地 IndexedDB |
| 触发 | 首页加载 + 定时刷新 | 实时反馈 |

### 代码片段

引用自 [lib/ai/rhythm-engine.ts](file:///workspace/lib/ai/rhythm-engine.ts)（简化）：

```typescript
// 6 条决策优先级链
const RULES: Rule[] = [
  // 1. 继续专注（有未完成的番茄钟）
  {
    id: 'continue-focus',
    priority: 1,
    condition: (ctx) => ctx.activePomodoro && !ctx.activePomodoro.completed,
    action: (ctx) => ({ type: 'focus', target: ctx.activePomodoro }),
  },
  // 2. 低能量休息（能量 ≤ 2）
  {
    id: 'low-energy-rest',
    priority: 2,
    condition: (ctx) => ctx.energy <= 2,
    action: () => ({ type: 'rest', reason: '能量低，建议休息' }),
  },
  // 3. 到期复习（有 FSRS 到期卡片）
  {
    id: 'due-review',
    priority: 3,
    condition: (ctx) => ctx.dueCards > 0,
    action: (ctx) => ({ type: 'review', count: ctx.dueCards }),
  },
  // 4. routine 时段专注
  // 5. 睡前复盘
  // 6. 默认学习
];

export async function decideNextAction(userId: string): Promise<Action> {
  const ctx = await buildContext(userId);  // 本地数据
  for (const rule of RULES.sort((a, b) => a.priority - b.priority)) {
    if (rule.condition(ctx)) {
      return rule.action(ctx);
    }
  }
  return { type: 'learn' };  // 默认学习
}
```

### 踩过的坑

- **规则冲突**：早期"低能量休息"优先级高于"到期复习"，导致低能量时不复习。调整为：到期复习优先于低能量休息（除非能量极低 ≤1）。
- **规则膨胀**：早期 10+ 条规则，调试难。精简为 6 条核心规则，覆盖 95% 场景。

---

## 6.4 模块 3：零信任 session

### 职责

安全传输 apiKey，防重放 / 防篡改 / 防中间人 / 跨设备 / 一键撤销。

### 关键决策

| 决策 | 选择 | 理由 |
|---|---|---|
| 加密算法 | AES-GCM | Edge Runtime Web Crypto 原生 + 认证加密 |
| 签名 | HMAC-SHA256 | 防篡改 |
| nonce | 5min 一次性消费 | 防重放 |
| 时间窗 | ±60s | 防中间人 + 兼容网络延迟 |
| 续期 | 滑动 7d | 用户体验 |
| 存储 | Cloudflare KV（4 namespace） | 跨设备 + 一键撤销 |

### 代码片段

引用自 [lib/ai/crypto.ts](file:///workspace/lib/ai/crypto.ts)（简化）：

```typescript
// Edge Runtime 兼容的 AES-GCM 加密
export async function encrypt(plaintext: string, masterKey: Uint8Array) {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await crypto.subtle.importKey(
    'raw', masterKey, { name: 'AES-GCM' }, false, ['encrypt']
  );
  const ciphertext = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    new TextEncoder().encode(plaintext)
  );
  return { ciphertext: bufToBase64(ciphertext), iv: bufToBase64(iv) };
}

// HMAC-SHA256 签名
export async function hmac(key: Uint8Array, message: string) {
  const cryptoKey = await crypto.subtle.importKey(
    'raw', key, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
  );
  const sig = await crypto.subtle.sign('HMAC', cryptoKey, new TextEncoder().encode(message));
  return bufToHex(sig);
}
```

引用自 [lib/ai/session-middleware.ts](file:///workspace/lib/ai/session-middleware.ts)（简化）：

```typescript
export async function verifySession(req: Request): Promise<Session> {
  const sessionId = req.headers.get('X-Session-Id')!;
  const nonce = req.headers.get('X-Nonce')!;
  const timestamp = Number(req.headers.get('X-Timestamp'));
  const hmac = req.headers.get('X-HMAC')!;
  const body = await req.text();
  
  // 1. 时间窗（±60s）
  if (Math.abs(Date.now() - timestamp) > 60_000) throw new HttpError(401, 'Expired');
  
  // 2. Session 查询
  const session = await KV_SESSIONS.get(sessionId);
  if (!session) throw new HttpError(401, 'Invalid session');
  
  // 3. HMAC 验证
  const expected = await hmac(session.hmacKey, `${nonce}:${timestamp}:${body}`);
  if (hmac !== expected) throw new HttpError(401, 'Invalid HMAC');
  
  // 4. nonce 防重放
  const used = await KV_NONCES.get(`${sessionId}:${nonce}`);
  if (used) throw new HttpError(401, 'Replay attack');
  await KV_NONCES.set(`${sessionId}:${nonce}`, '1', { expirationTtl: 300 });
  
  // 5. 滑动续期 7d
  await KV_SESSIONS.put(sessionId, { ...session, expiresAt: Date.now() + 7 * 86400_000 });
  
  return session;
}
```

### 踩过的坑

- **早期明文存 apiKey**：XSS 可偷。改为零信任 session。
- **nonce 永久存**：KV 写入量爆炸。改为 5min TTL。
- **时间窗 ±5s 太严**：移动端网络慢被拒。改为 ±60s。
- **Edge Runtime `crypto` vs Node `crypto`**：API 不同，需 `lib/ai/crypto.ts` 统一封装。

---

## 6.5 模块 4：数据同步引擎

### 职责

跨设备同步学习数据，增量传输 + LWW 合并 + tombstone 删除传播。

### 关键决策

| 决策 | 选择 | 理由 |
|---|---|---|
| 同步策略 | 增量（updatedAt 索引） | YAGNI + 网络成本低 |
| 冲突合并 | LWW（Last-Write-Wins） | 实现简单 + 单人工具无冲突 |
| 删除传播 | tombstone TTL 30 天 | 避免远端拉回已删数据 |
| 触发 | 手动 | 数据归用户 |

### 代码片段

引用自 [lib/sync.ts](file:///workspace/lib/sync.ts)（简化）：

```typescript
// 上传：增量同步
export async function uploadChanges(userId: string, lastSyncAt: number) {
  const changes = await db.kv.where('updatedAt').above(lastSyncAt).toArray();
  if (changes.length === 0) return { status: 'noop' };  // O(0) 网络成本
  
  for (const item of changes) {
    await KV_BUSINESS.put(`${userId}:${item.key}`, JSON.stringify(item));
  }
  return { status: 'ok', count: changes.length };
}

// 下载：LWW 合并
export async function downloadAndMerge(userId: string, lastSyncAt: number) {
  const remote = await KV_BUSINESS.list({ prefix: `${userId}:` });
  for (const { name } of remote.keys) {
    const remoteItem = JSON.parse(await KV_BUSINESS.get(name));
    const localItem = await db.kv.get(remoteItem.key);
    
    if (!localItem || localItem.updatedAt < remoteItem.updatedAt) {
      // LWW：远端较新，覆盖本地
      await db.kv.put(remoteItem);
    }
  }
}

// 删除：tombstone
export async function deleteItem(key: string) {
  await db.kv.put({ key, deleted: true, updatedAt: Date.now() });
  // 30 天后 cron 清理
}
```

### 踩过的坑

- **删除不传播**：早期真删数据，同步时远端又拉回来。改为 tombstone。
- **LWW 丢数据**：两台设备同时编辑同一张卡片，后写覆盖前写。降级方案：复习历史数组 append（不覆盖）。
- **KV 限流**：全量同步写入超 1K/天。改为增量同步 + tombstone TTL。

---

## 6.6 模块 5：学习队列

### 职责

合并"新学"+"复习"为单一待办流，5 维评分排序 + 中文 reason + 场景参数跳转。

### 关键决策

| 决策 | 选择 | 理由 |
|---|---|---|
| 队列模型 | 合并 new + review | 单一待办流，用户不用切换 |
| 评分维度 | 5 维（FSRS 紧迫度 + 能量补偿 + 多巴胺补偿 + 连续 new 过载扣分 + 中文 reason） | 综合考虑 |
| 跳转 | buildSceneUrl 携带场景参数 | AGENTS.md 2.12 强制 |
| 数据源 | IndexedDB 本地查询 | 离线可用 |

### 代码片段

引用自 [lib/study-queue/compute-priority.ts](file:///workspace/lib/study-queue/compute-priority.ts)（简化）：

```typescript
export function computePriority(task: StudyTask, ctx: QueueContext): Score {
  // 1. FSRS 紧迫度（0-1）
  const fsrsUrgency = task.type === 'review' 
    ? Math.max(0, 1 - (task.dueAt - Date.now()) / 86400_000)
    : 0;
  
  // 2. 能量补偿（低能量优先简单任务）
  const energyBoost = ctx.energy <= 2 && task.difficulty === 'easy' ? 0.2 : 0;
  
  // 3. 多巴胺补偿（多巴胺干扰时优先熟悉任务）
  const dopamineBoost = ctx.dopamineInterference && task.type === 'review' ? 0.1 : 0;
  
  // 4. 连续 new 过载扣分（连续 3 个 new 后降级）
  const newOverloadPenalty = ctx.consecutiveNew >= 3 && task.type === 'new' ? -0.3 : 0;
  
  const total = fsrsUrgency * 0.4 + energyBoost + dopamineBoost + newOverloadPenalty;
  
  return {
    score: total,
    reason: buildReason({ fsrsUrgency, energyBoost, dopamineBoost, newOverloadPenalty }),
  };
}
```

引用自 [lib/study-queue/nav-params.ts](file:///workspace/lib/study-queue/nav-params.ts)（简化）：

```typescript
// 跳转方：构造带场景参数的 URL
export function buildSceneUrl(path: string, task: StudyTask, from: string) {
  const params = new URLSearchParams();
  if (task.planId) params.set('planId', task.planId);
  if (task.nodeId) params.set('nodeId', task.nodeId);
  if (task.cardId) params.set('cardId', task.cardId);
  if (task.date) params.set('date', task.date);
  params.set('from', from);
  return `${path}?${params}`;
}

// 目标页：读取场景参数
export function parseSceneParams(searchParams: URLSearchParams): SceneParams {
  return {
    planId: searchParams.get('planId') ?? undefined,
    nodeId: searchParams.get('nodeId') ?? undefined,
    cardId: searchParams.get('cardId') ?? undefined,
    date: searchParams.get('date') ?? undefined,
    from: searchParams.get('from') ?? undefined,
  };
}
```

### 踩过的坑

- **跳转不带场景参数**：用户从首页点任务 X 跳到学习页，落到全量列表需重新找。改为 `buildSceneUrl` 携带 `planId` / `nodeId` 等。
- **评分维度膨胀**：早期 8 维评分，调试难。精简为 5 维核心评分。
- **reason 太技术化**：早期 reason 是 `"fsrs=0.8,energy=0.2"`，用户看不懂。改为中文："FSRS 紧迫度高 + 能量匹配"。

---

## 6.7 模块 6：课程图谱

### 职责

Content-as-Code 课程图谱：YAML 解析 + zod 校验 + G1-G7 图谱规则 + Kahn 拓扑排序 + 跳过已掌握。

### 关键决策

| 决策 | 选择 | 理由 |
|---|---|---|
| 内容管理 | Content-as-Code（YAML） | 版本化 + 可审查 + CI 校验 |
| 校验 | zod schema + G1-G7 图谱规则 | 结构层 + 图谱层 |
| 排序 | Kahn 拓扑排序 + 同层 phase/id 字典序 | 确定性 |
| 跳过已掌握 | skillLevel=advanced 且 stability>21天 | 个性化最短路径 |

### 代码片段

引用自 [lib/curriculum/graph.ts](file:///workspace/lib/curriculum/graph.ts)（简化）：

```typescript
// G1-G7 图谱规则校验
function validateGraph(nodes: KnowledgeNode[], sources: Source[]) {
  const errors: string[] = [];
  
  // G1: 前置存在
  for (const node of nodes) {
    for (const prereq of node.prerequisites) {
      if (!nodes.find(n => n.id === prereq)) {
        errors.push(`G1: ${node.id} 的前置 ${prereq} 不存在`);
      }
    }
  }
  
  // G2: 来源已登记
  // G3: ≥1 T0-T1
  // G4: 无环（拓扑排序检测）
  // G5: 轨道阶段合法
  // G6: V3-V4 必挂 Rubric
  // G7: Rubric 权重和=100
  
  return errors;
}

// Kahn 拓扑排序
export function topologicalSort(nodes: KnowledgeNode[]): KnowledgeNode[] {
  const inDegree = new Map<string, number>();
  const adj = new Map<string, string[]>();
  
  for (const node of nodes) {
    inDegree.set(node.id, node.prerequisites.length);
    for (const prereq of node.prerequisites) {
      if (!adj.has(prereq)) adj.set(prereq, []);
      adj.get(prereq)!.push(node.id);
    }
  }
  
  // 同层按 phase/id 字典序保证确定性
  const queue = nodes
    .filter(n => inDegree.get(n.id) === 0)
    .sort((a, b) => a.phase - b.phase || a.id.localeCompare(b.id));
  
  const result: KnowledgeNode[] = [];
  while (queue.length > 0) {
    const node = queue.shift()!;
    result.push(node);
    for (const next of adj.get(node.id) ?? []) {
      inDegree.set(next, inDegree.get(next)! - 1);
      if (inDegree.get(next) === 0) {
        queue.push(nodes.find(n => n.id === next)!);
        queue.sort((a, b) => a.phase - b.phase || a.id.localeCompare(b.id));
      }
    }
  }
  
  return result;
}
```

### 踩过的坑

- **YAML 解析在 Edge Runtime**：`yaml` 库较大，且不能进客户端 bundle。改为构建期编译 `content/` → `public/data/curriculum-graph.json`，运行时 fetch JSON。
- **G4 无环检测**：早期用 DFS 检测环，但拓扑排序自然检测（结果长度 < 节点数说明有环）。
- **同层排序确定性**：早期用插入顺序，不稳定。改为按 phase/id 字典序。

---

## 本章小结

**学到了什么**：
1. FSRS 复习引擎：ts-fsrs 4.5 + 3 预设 + 固定时区
2. 节奏引擎：6 条规则链 + 优先级排序 + 零 AI 成本
3. 零信任 session：AES-GCM + nonce + HMAC + 时间窗 + 滑动续期
4. 数据同步：增量 + LWW + tombstone 30 天
5. 学习队列：5 维评分 + 中文 reason + 场景参数跳转
6. 课程图谱：Content-as-Code + G1-G7 + Kahn 拓扑排序

**关键决策回顾**：
1. **纯函数 + 本地数据**：节奏引擎 / 优先级引擎 / 学习队列都是纯函数 + IndexedDB 数据，可离线 + 可测试
2. **YAGNI**：不用 CRDT / 实时同步 / 复杂状态库
3. **契约层优先**：zod schema + G1-G7 + 守护测试
4. **确定性**：拓扑排序按 phase/id 字典序，保证产物一致

## 下一章衔接

下一章 [07-iteration.md](file:///workspace/docs/tutorial/07-iteration.md) 讲迭代史：14 阶段时间线 + 每阶段的"做了什么 / 为什么 / 学到了什么 / 如果重写会怎么做"。

## 延伸阅读

- [docs/ARCHITECTURE.md](file:///workspace/docs/ARCHITECTURE.md) — 技术架构
- [docs/DEVELOPMENT.md](file:///workspace/docs/DEVELOPMENT.md) — 开发指南
- [Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html) — 关注点分离
