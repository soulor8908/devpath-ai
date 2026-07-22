# 知识库向量化与 AI 语义检索设计

> 日期：2026-07-22
> 状态：待评审
> 范围：v1（核心 + 3 个扩展场景）
> 关联守则：[AGENTS.md](file:///workspace/AGENTS.md) / [docs/ui-design-system.md](file:///workspace/docs/ui-design-system.md)

---

## 1. 目标与非目标

### 1.1 目标

1. **核心场景**：用户在现有聊天里问「有哪些缓存策略」→ 客户端语义检索内置知识库 → AI 回答 grounded 在检索结果上 → 回答下方展示可点击的「知识来源卡片」→ 点击进入该知识的学习详情。
2. **扩展 1**：学习详情页查看某知识节点时，侧栏展示跨计划语义相邻的「相关知识」。
3. **扩展 2**：错题本每条错题旁加「相关知识点」入口，用题面语义反查知识库。
4. **扩展 3**：聊天回答的「知识来源卡片」本身（即核心场景的溯源部分，独立列出便于实现追踪）。

### 1.2 非目标（v1 不做）

- 用户手动新增知识 CRUD（笔记/外链/上传文件）。
- LLM 动态拆解知识节点的实时嵌入。
- 知识图谱可视化、跨计划语义去重。
- 引入 Cloudflare Vectorize binding（语料规模未到门槛）。
- 历史聊天记录 / 错题本全文向量化。

### 1.3 语料范围（已确认）

仅索引**静态预设 + 内置文档**：

- `lib/presets/*` 5 个方向预设的 `KnowledgeNode[]`（约 300–500 节点）。
- `lib/docs-content.ts` 的 `DOC_SECTIONS`（约 20 节）。

总量约 500 条稳定条目，随版本发布，不需运行时动态嵌入语料本身。

---

## 2. 方案选型结论（卡帕西视角）

| 维度 | A. llms.txt 上下文塞入 | B. Cloudflare Vectorize | **C. 构建期预嵌入 + 客户端余弦（采纳）** |
|---|---|---|---|
| 检索质量 | 中（LLM 自挑，长上下文噪声） | 高 | 高（500 条余弦足够） |
| 离线可用 | ✅ | ❌ | ✅（向量入 IndexedDB） |
| 新增基础设施 | 无 | Vectorize + AI binding | 仅 AI binding |
| 运行成本 | 每次查询多 2–4k token | 按查询计费 | 仅查询嵌入 ≈ $0.000008/次 |
| 与现有架构契合 | 高 | 中 | 高（Edge route + IndexedDB） |
| 扩展到 5000+ | ❌ | ✅ | ✅（平滑迁移 Vectorize） |

**选 C 的理由**：500 × 768 维 ≈ 1.5MB，客户端余弦 < 5ms；离线优先与本产品 IndexedDB 哲学一致；成本近乎零；向量 schema 透出 metadata，未来语料涨到 5000+ 时只换存储层、业务层不动——这是好的边界。

**关于「卡帕西 llm wiki」**：实为 Jeremy Howard 的 llms.txt 约定（喂干净 markdown 全文给大上下文 LLM）。对 500 条小语料有启发但不够稳：每次聊天塞 KB 文本会污染上下文、抬高 token 成本，且 LLM 在长上下文里 needle-in-haystack 不稳定。故仅作为离线降级时的小语料兜底，不作主路径。

---

## 3. 架构总览

```
┌──────────────────────────── 构建期（CI / 手动） ────────────────────────────┐
│  scripts/build-knowledge-index.ts                                            │
│   ① 读取 lib/presets/* + lib/docs-content.ts                                │
│   ② 构造 searchText + href + metadata                                       │
│   ③ 调 Workers AI REST（bge-base-en-v1.5，768 维）批量嵌入                   │
│   ④ 输出 public/data/knowledge-index.json（随版本发布）                      │
└──────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌──────────────────────────── 运行时（客户端） ───────────────────────────────┐
│  首次进入聊天：fetch /data/knowledge-index.json → 缓存 IndexedDB → 内存常驻  │
│                                                                              │
│  用户发送消息：                                                              │
│   ① shouldRetrieveKnowledge(text) 启发式判定（避免命令类消息也嵌入）        │
│   ② 若是：POST /api/embed { text } → queryVec（KV 缓存 30 天）              │
│   ③ cosineSearch(queryVec, index) → top-k，按阈值 0.35 过滤                 │
│   ④ 把命中条目的 title+summary 拼成 knowledgeContext 随聊天请求发送         │
│   ⑤ /api/chat 把 knowledgeContext 追加进 system prompt                       │
│   ⑥ AI 流式回答（grounded）                                                  │
│   ⑦ 回答下方渲染「📚 知识来源」卡片（客户端已知命中数据，无需 AI 回传）     │
│   ⑧ 点击卡片 → KnowledgeDetailModal（学习详情）                             │
└──────────────────────────────────────────────────────────────────────────────┘
                                    │
              离线降级：/api/embed 不可达 → 关键词 token 重叠匹配（同索引）
```

**关键设计决策**：检索发生在**客户端、发送聊天请求之前**（pre-retrieval injection），而非 AI tool 服务端检索。原因：

- 向量在客户端 IndexedDB，服务端无向量访问权（方案 C 的前提）。
- 客户端预先把命中知识注入 system prompt，AI 回答才真正 grounded。
- 来源卡片由客户端用已检索数据渲染，确定性强、不依赖 AI 回传结构化数据。

---

## 4. 数据模型

### 4.1 新增类型（追加到 [lib/types.ts](file:///workspace/lib/types.ts)）

```typescript
/** 知识索引条目：一个可被检索的知识单元 */
export interface KnowledgeIndexEntry {
  /** 稳定 id：preset 节点 = `preset:<presetId>:<nodeId>`；doc = `doc:<sectionId>` */
  id: string;
  /** 来源类型 */
  source: "preset" | "doc";
  /** 来源预设 id（仅 preset），如 "frontend" */
  presetId?: string;
  /** 来源预设名（仅 preset），如 "前端工程师" */
  presetName?: string;
  /** 文档分类（仅 doc），如 "核心功能" */
  docCategory?: string;
  /** 标题 */
  title: string;
  /** 摘要（卡片展示 + 检索文本的一部分） */
  summary: string;
  /** 检索用全文 = title + " " + summary + keywords 拼接，嵌入用 */
  searchText: string;
  /** 嵌入向量（768 维，bge-base-en-v1.5） */
  vector: number[];
  /** 难度（仅 preset） */
  difficulty?: 1 | 2 | 3 | 4 | 5;
  /** 频率（仅 preset） */
  frequency?: "高" | "中" | "低";
  /** 前置依赖节点 id 列表（仅 preset，用于详情页展示 prereq 链） */
  prerequisites?: string[];
  /** 跳转锚点：doc → `/docs#<id>`；preset → 由 KnowledgeDetailModal 处理（无路由） */
  href: string;
  /** 标签（preset 用 tags，doc 用 keywords） */
  tags: string[];
}

/** 知识索引清单（随构建产物发布的元数据 + 向量） */
export interface KnowledgeIndexManifest {
  /** 索引语义版本（schema 不变则不变，内容变了用 builtAt 区分） */
  version: string;
  /** 嵌入模型 id，如 "@cf/baai/bge-base-en-v1.5" */
  model: string;
  /** 向量维度，如 768 */
  dimensions: number;
  /** 构建时间 ISO */
  builtAt: string;
  /** 条目数 */
  count: number;
  /** 全部条目（含向量） */
  entries: KnowledgeIndexEntry[];
}
```

### 4.2 IndexedDB 新前缀（追加到 `KEY_PREFIXES`）

```typescript
/** 知识索引清单缓存（单例，离线可用；不参与云端同步） */
KB_INDEX: "kb_index:",
```

存储约定：
- 单 key `kb_index:manifest`，value = `KnowledgeIndexManifest`（含向量，约 1.5–2MB，单 record 可接受）。
- **排除出云端同步**：在 [lib/sync.ts](file:///workspace/lib/sync.ts) 的上传/枚举逻辑里跳过 `kb_index:` 前缀（静态资源，人人相同，同步会污染 KV backup 配额）。实现时核对 sync.ts 现有排除清单并补上。

### 4.3 现有可复用类型

- `KnowledgeNode`（[lib/types.ts](file:///workspace/lib/types.ts#L46)）：preset 节点原貌，索引构建时读取其 id/title/summary/difficulty/frequency/prerequisites。
- `DocSection`（[lib/docs-content.ts](file:///workspace/lib/docs-content.ts#L5)）：doc 节点原貌，读取 id/category/title/keywords/content（content 截前 200 字作 summary）。
- `MistakeRecord`（[lib/types.ts](file:///workspace/lib/types.ts#L664)）：错题反查用其 `questionText` + `nodeId`。

---

## 5. 构建期嵌入流水线

### 5.1 新增脚本 `scripts/build-knowledge-index.ts`

职责：
1. 从 `lib/presets/index.ts` 的 `PRESETS` 读取所有节点，从 `lib/docs-content.ts` 读取 `DOC_SECTIONS`。
2. 为每条构造 `KnowledgeIndexEntry`（不含 vector）：
   - preset 节点 `searchText` = `title + " " + summary`（preset summary 已含关键术语，不再塞 prerequisites 文本）。
   - doc `searchText` = `title + " " + keywords.join(" ") + " " + content.slice(0, 200)`。
   - preset 节点 `href` = `""`（由 KnowledgeDetailModal 处理，无独立路由）。
   - doc `href` = `/docs#${id}`。
3. 批量调嵌入（按 100 条一批，避免单请求过大）：
   - 默认 `EMBEDDING_PROVIDER=cloudflare`：调 Workers AI REST `accounts/<id>/ai/run/@cf/baai/bge-base-en-v1.5`，需 `CLOUDFLARE_API_TOKEN` + `CLOUDFLARE_ACCOUNT_ID` 环境变量。
   - 兜底 `EMBEDDING_PROVIDER=local`：用 `@xenova/transformers` 本地跑同款 BGE（首次拉模型 ~80MB，无需凭证，dev 友好）。**注意**：本地模型与 Workers AI 在线模型向量分布不完全一致，仅用于 dev 调试；生产构建必须用 cloudflare provider 保证与运行时 `/api/embed` 同模型。
4. 输出 `public/data/knowledge-index.json`（`KnowledgeIndexManifest`，含 entries + vectors）。
5. 打印统计：总条目数、维度、耗时、是否成功。

### 5.2 package.json 脚本

```json
"scripts": {
  "build:knowledge-index": "tsx scripts/build-knowledge-index.ts"
}
```

构建时机：发布前手动跑一次，commit `public/data/knowledge-index.json`（静态产物随版本走，部署不需凭证，最稳）。CI 可加一步校验该文件存在且 schema 正确。

### 5.3 wrangler.toml 新增 AI binding

```toml
[[ai]]
binding = "AI"
```

> 实现阶段需验证 `@cloudflare/next-on-pages` 对 `[[ai]]` binding 的支持。若 Pages 不支持该声明，则改在 Cloudflare Dashboard 项目设置里绑定 AI，并在 [lib/ai/cloudflare-env.ts](file:///workspace/lib/ai/cloudflare-env.ts) 的请求上下文里读取 `env.AI`。

---

## 6. 运行时：查询嵌入 `/api/embed`

### 6.1 新增 `app/api/embed/route.ts`

```typescript
export const runtime = "edge";

// POST { text: string } → { vector: number[], cached: boolean, model: string }
```

职责：
1. `initCloudflareEnv()` + 鉴权：优先 `requireSession`；失败降级 Trial 模式（IP 限流，scene = `"embed"`，限额 100/天，复用 [lib/ai/rate-limit.ts](file:///workspace/lib/ai/rate-limit.ts)）。
2. 读 body `text`，校验非空、长度 ≤ 500（截断防滥用）。
3. KV 缓存命中检查：key = `kb:embed:<sha256(text)>`，TTL 30 天。命中直接返回。
4. 未命中：调 `env.AI.run("@cf/baai/bge-base-en-v1.5", { text })` 得向量。
5. 写 KV 缓存，返回 `{ vector, cached: false, model }`。

### 6.2 cloudflare-env 扩展

在 [lib/ai/cloudflare-env.ts](file:///workspace/lib/ai/cloudflare-env.ts) 新增：

```typescript
/** 获取 Workers AI binding（仅 Edge 运行时可用） */
export function getAI(): AIExecutor | null { ... }
```

`AIExecutor` 类型最小化：`run(model: string, inputs: { text: string }): Promise<{ data: number[][] }>`。无 binding 时返回 null（/api/embed 返回 503，客户端走离线降级）。

---

## 7. 客户端检索层 `lib/knowledge/`

### 7.1 `lib/knowledge/index-store.ts`

```typescript
/** 加载知识索引（IndexedDB 优先，首次 fetch 静态 JSON 回填） */
export async function loadKnowledgeIndex(): Promise<KnowledgeIndexManifest | null>;

/** 内存常驻缓存（同会话内重复调用零开销） */
export function getCachedIndex(): KnowledgeIndexManifest | null;

/** 清除内存缓存（切换主题/测试用） */
export function clearCachedIndex(): void;
```

加载策略：
1. 内存命中 → 直接返回。
2. IndexedDB `kb_index:manifest` 命中 → 校验 `version` 与 `public/data/knowledge-index.json` 的版本（HEAD 请求或内置版本号对比）；一致则用本地。
3. 未命中或版本旧 → `fetch('/data/knowledge-index.json')` → 写 IndexedDB → 返回。
4. 全失败（离线 + 无缓存）→ 返回 null，调用方走空检索。

### 7.2 `lib/knowledge/search.ts`

```typescript
/** 启发式判定：该消息是否值得触发知识检索 */
export function shouldRetrieveKnowledge(text: string): boolean;

/** 余弦相似度 */
export function cosineSimilarity(a: number[], b: number[]): number;

/** 向量检索 top-k */
export function vectorSearch(
  queryVec: number[],
  index: KnowledgeIndexManifest,
  opts?: { topK?: number; excludeIds?: string[]; threshold?: number }
): Array<{ entry: KnowledgeIndexEntry; score: number }>;

/** 离线降级：token 重叠关键词匹配（同索引的 searchText） */
export function keywordSearch(
  query: string,
  index: KnowledgeIndexManifest,
  opts?: { topK?: number; excludeIds?: string[] }
): Array<{ entry: KnowledgeIndexEntry; score: number }>;

/** 高层封装：给定查询文本，返回命中条目（在线优先向量，离线降级关键词） */
export async function retrieveKnowledge(
  query: string,
  opts?: { topK?: number; excludeIds?: string[]; threshold?: number }
): Promise<{ entries: Array<{ entry: KnowledgeIndexEntry; score: number }>; mode: "vector" | "keyword" | "none" }>;
```

`shouldRetrieveKnowledge` 启发式（v1 简单可调）：
- 长度 ≥ 6 字符；且
- 含知识型信号：`?`/`？`/`什么是`/`有哪些`/`解释`/`区别`/`原理`/`如何`/`为什么`/`对比`/`总结`/`策略`/`方案` 等；或
- 非明确命令型：不以 `设置`/`调整`/`删除`/`查看今日`/`下一步`/`开始专注`/`帮我`+动词 开头。

阈值默认 `0.35`（bge-base 余弦，经验值；实现后用真实语料校准，可配置）。

### 7.3 向量检索正确性

- `vectorSearch` 对 `entries[].vector` 全量余弦，500 条 < 5ms，无需近似最近邻。
- 维度一致性校验：`queryVec.length === index.dimensions`，不一致抛错（防模型不一致）。

---

## 8. 核心场景：聊天集成

### 8.1 `app/api/chat/route.ts` 改动

请求体新增可选字段：

```typescript
{ messages, contextSnapshot, toolContext, personaContext, preferredPersona,
  knowledgeContext?: string }
```

服务端在拼 system prompt 时，于 `contextSnapshot` 之后、persona 之前插入：

```
【知识库检索结果】
以下是检索到的相关知识，回答时可参考并引用其标题。若用户问"有哪些 X"，请基于这些知识作答；若与问题无关请忽略。
${knowledgeContext}
```

`knowledgeContext` 由客户端拼成：
```
- 前端性能优化（重排重绘、虚拟列表、懒加载...）: 浏览器渲染流水线...
- 浏览器缓存策略（强缓存/协商缓存）: ...
```

### 8.2 `components/ChatClient.tsx` 改动

发送消息前新增 pre-retrieval 流程：

```typescript
async function sendWithKnowledge(text: string) {
  let knowledgeContext: string | undefined;
  let sources: Array<{ entry; score }> = [];
  if (shouldRetrieveKnowledge(text)) {
    const result = await retrieveKnowledge(text, { topK: 5, threshold: 0.35 });
    sources = result.entries;
    if (sources.length) {
      knowledgeContext = sources
        .map(s => `- ${s.entry.title}: ${s.entry.summary}`)
        .join("\n");
    }
  }
  // 原发送逻辑 + body 追加 knowledgeContext
  // 流式完成后，在对应 assistant 消息下方挂载 sources 渲染 KnowledgeCard 列表
}
```

来源卡片渲染：
- 流式回答结束后，在 assistant 消息气泡下方渲染 `<KnowledgeCardGroup sources={sources} />`。
- `sources` 存进该 ChatMessage 的扩展字段（新增 `ChatMessage.knowledgeSources?: KnowledgeSourceRef[]`，仅存 entry id + title + score，避免重复存向量）。
- 卡片点击 → 打开 `KnowledgeDetailModal`。

### 8.3 `components/KnowledgeCard.tsx`（新建，复用组件）

 Props：`entry: KnowledgeIndexEntry`、`score?: number`、`compact?: boolean`。
 渲染：标题、来源徽标（preset 名 / doc 分类）、难度星（preset）、摘要截断、`score` 进度条（`role="progressbar"`，遵循 [AGENTS.md 2.6](file:///workspace/AGENTS.md)）。
 用 `<Button>` 包整个卡片（遵循 2.10，禁 div onClick）。

### 8.4 `components/KnowledgeDetailModal.tsx`（新建，「学习详情」）

Props：`entryId: string | null`、`onClose`。
内容：
- 标题、来源、难度、频率、tags。
- 完整 summary。
- prerequisites chips（点击切到该 prereq 的 modal，递归）。
- CTA：
  - preset：`<Button>`「导入「{presetName}」学习计划」→ 复用现有预设导入流程（`matchPresetByTopic` / `PRESETS`）→ 成功后 `router.push('/learn/' + planId)`；若用户已有该预设的 plan，则直接跳转。
  - doc：`<Button>`「阅读完整文档」→ `router.push(entry.href)`。
- 用统一 `<Modal>`（遵循 2.4），`titleId` 走 entry.id。

---

## 9. 扩展 1：学习详情页「相关知识」侧栏

### 9.1 `app/learn/[planId]/PlanDetailClient.tsx` 改动

在知识节点详情区域旁加 `<RelatedKnowledge nodeId={...} nodeTitle={...} nodeSummary={...} currentPlanId={...} />`。

### 9.2 `components/RelatedKnowledge.tsx`（新建）

逻辑：
1. 优先用 `nodeId` 在索引里查（preset 节点已在索引）→ 直接拿存储向量。
2. 若节点不在索引（LLM 生成的 plan 节点）→ 调 `/api/embed` 嵌入 `title + " " + summary`。
3. `vectorSearch(vec, index, { topK: 6, excludeIds: [nodeId], threshold: 0.3 })`。
4. 可选过滤：排除与当前节点同 `presetId` 的条目，强制跨计划视野（实现时加 prop `crossPlanOnly?: boolean`）。
5. 渲染 `<KnowledgeCard compact>` 列表，点击 → `KnowledgeDetailModal`。
6. 离线 + 节点不在索引 → 显示「联网后可查看相关知识」占位（不阻塞页面）。

---

## 10. 扩展 2：错题本「相关知识点」

### 10.1 `components/MistakeBookClient.tsx` 改动

每条错题行加 `<Button iconOnly aria-label="查看相关知识点">`（遵循 2.8），点击打开 `<Modal>` 展示检索结果。

### 10.2 检索逻辑

- 查询文本：优先错题关联节点的 `title + summary`（若 plan 在本地可查到），否则用 `questionText`。
- `retrieveKnowledge(query, { topK: 5, threshold: 0.3 })`。
- 结果用 `<KnowledgeCard>` 渲染在 Modal 内，点击 → `KnowledgeDetailModal`。
- embed 结果按 `questionText` hash 缓存（复用 /api/embed 的 KV 缓存即可，无需客户端额外缓存）。

---

## 11. 离线降级策略

| 场景 | 在线 | 离线 |
|---|---|---|
| 聊天 pre-retrieval | 向量检索 + 注入 + 卡片 | 关键词检索 + 卡片（不注入 system prompt，AI 回答不 grounded，但卡片仍展示） |
| 相关知识侧栏（preset 节点） | 向量检索 | **向量检索**（preset 节点向量已在索引，离线可用） |
| 相关知识侧栏（LLM 生成节点） | embed + 向量检索 | 占位「联网后可查看」 |
| 错题反查 | embed + 向量检索 | 关键词检索（用 questionText token 匹配） |

`retrieveKnowledge` 内部封装此降级：`/api/embed` 失败/超时（2s）→ `keywordSearch` 兜底。

---

## 12. 文件清单

### 12.1 新建

| 路径 | 用途 |
|---|---|
| `scripts/build-knowledge-index.ts` | 构建期嵌入脚本 |
| `lib/knowledge/index-store.ts` | 索引加载 + IndexedDB 缓存 + 内存常驻 |
| `lib/knowledge/search.ts` | 余弦/关键词检索 + 启发式 + retrieveKnowledge 高层封装 |
| `app/api/embed/route.ts` | 查询嵌入 Edge route（Workers AI + KV 缓存 + Trial 限流） |
| `components/KnowledgeCard.tsx` | 复用卡片组件 |
| `components/KnowledgeCardGroup.tsx` | 卡片列表（聊天来源用） |
| `components/KnowledgeDetailModal.tsx` | 知识详情 Modal（「学习详情」） |
| `components/RelatedKnowledge.tsx` | 学习详情页侧栏 |
| `__tests__/knowledge-vector-search.test.ts` | 检索/启发式/降级单元测试 |
| `public/data/knowledge-index.json` | 构建产物（commit） |

### 12.2 修改

| 路径 | 改动 |
|---|---|
| [lib/types.ts](file:///workspace/lib/types.ts) | 新增 `KnowledgeIndexEntry` / `KnowledgeIndexManifest` / `KnowledgeSourceRef`；`KEY_PREFIXES.KB_INDEX`；`ChatMessage.knowledgeSources?` |
| [lib/ai/cloudflare-env.ts](file:///workspace/lib/ai/cloudflare-env.ts) | 新增 `getAI()` |
| [lib/ai/rate-limit.ts](file:///workspace/lib/ai/rate-limit.ts) | scene `"embed"` 限额 100/天（若现有限流是按 scene 配置则补一项） |
| [lib/sync.ts](file:///workspace/lib/sync.ts) | 排除 `kb_index:` 前缀出云端同步 |
| [app/api/chat/route.ts](file:///workspace/app/api/chat/route.ts) | 接收 `knowledgeContext` 并拼入 system prompt |
| [components/ChatClient.tsx](file:///workspace/components/ChatClient.tsx) | pre-retrieval 流程 + 来源卡片渲染 |
| [app/learn/[planId]/PlanDetailClient.tsx](file:///workspace/app/learn/[planId]/PlanDetailClient.tsx) | 挂载 `<RelatedKnowledge>` |
| [components/MistakeBookClient.tsx](file:///workspace/components/MistakeBookClient.tsx) | 每条错题加相关知识点入口 + Modal |
| [wrangler.toml](file:///workspace/wrangler.toml) | `[[ai]] binding = "AI"` |
| [package.json](file:///workspace/package.json) | `build:knowledge-index` 脚本 + `tsx` dev 依赖（若未装） |

---

## 13. 测试计划

遵循 [AGENTS.md 3.x](file:///workspace/AGENTS.md)，提交前 `npm run typecheck && npm run lint && vitest run` 全绿。

### 13.1 单元测试 `__tests__/knowledge-vector-search.test.ts`

- `shouldRetrieveKnowledge`：命令类（「设置提醒」「下一步干嘛」）→ false；知识类（「有哪些缓存策略」「Redis 和 Memcached 区别」）→ true。
- `cosineSimilarity`：正交向量 = 0，相同向量 = 1，反向 = -1。
- `vectorSearch`：构造 3 条假索引，查询向量命中预期条目，top-1 正确；`excludeIds` 生效；`threshold` 过滤生效。
- `keywordSearch`：token 重叠排序合理。
- `retrieveKnowledge`：mock fetch /api/embed 成功 → mode="vector"；失败 → mode="keyword"；无索引 → mode="none"。
- 维度不一致抛错。

### 13.2 守护测试

- 本特性新增组件全部用 `<Button>`/`<Modal>`/`<Input>`（无原生表单元素）→ 现有 [no-native-form-elements.test.ts](file:///workspace/__tests__/no-native-form-elements.test.ts) 自动守护。
- 所有浅色 utility 带 `dark:` 配对 + 无 `text-[Npx]` 逃逸值 → 现有 [ui-design-system-guard.test.ts](file:///workspace/__tests__/ui-design-system-guard.test.ts) 自动守护。
- 进度条带 `role="progressbar"`、icon-only 按钮带 `aria-label`、Modal 用统一组件 → 代码评审 + 守则约束（暂无测试守护，按 AGENTS.md 人工把关）。

### 13.3 构建产物校验

- `scripts/build-knowledge-index.ts` 跑完后断言：`entries.length === 预设节点总数 + doc 节点总数`；每条 `vector.length === 768`；`id` 唯一。
- 可选：加 `__tests__/knowledge-index-artifact.test.ts` 读 `public/data/knowledge-index.json` 校验 schema（CI 防止提交坏产物）。

---

## 14. 滚动发布与迁移

1. **第 1 步**：基础设施——types + wrangler AI binding + cloudflare-env `getAI()` + `/api/embed` route + 单测。可独立合入，不影响现有功能。
2. **第 2 步**：构建脚本 + 跑一次生成 `knowledge-index.json` 并 commit。
3. **第 3 步**：客户端检索层（index-store + search）+ 单测。可独立合入。
4. **第 4 步**：聊天集成（ChatClient pre-retrieval + KnowledgeCard + KnowledgeDetailModal + chat route knowledgeContext）。
5. **第 5 步**：扩展 1（RelatedKnowledge 侧栏）。
6. **第 6 步**：扩展 2（错题反查）。

每步独立可 revert，不破坏现有聊天/学习/错题功能。`knowledgeContext` 为可选字段，老客户端不发送时行为不变。

---

## 15. 成本与性能

- **构建期**：500 条 × ~50 token ≈ 25k token，Workers AI bge-base $0.16/M token ≈ **$0.004 一次性**。
- **运行期**：每次知识型查询 ≈ 50 token ≈ **$0.000008**；KV 缓存命中则零嵌入成本。Trial 用户 100/天 embed 限额足够。
- **客户端**：索引 1.5–2MB（gzip 后 ~1MB），首次 fetch + IndexedDB 落盘；内存常驻 500×768 floats ≈ 1.5MB；余弦 < 5ms。
- **延迟**：pre-retrieval 给每次知识型聊天增加 ~50–150ms（embed + cosine），可接受；非知识型消息零开销。

---

## 16. v2 演进（不在本期）

- 语料 > 5000 条 → 切 Cloudflare Vectorize，仅替换 `index-store` + `search` 的存储/检索实现，业务层不动。
- 用户手动新增知识（笔记/外链/上传）→ 新增 `kb_user:` 前缀 + 增量嵌入流水线。
- LLM 动态拆解节点实时嵌入 → 生成 plan 后异步 embed 入索引。
- 知识图谱可视化、跨计划语义去重。

---

## 17. 开放问题（实现时确认）

1. `[[ai]] binding` 在 `@cloudflare/next-on-pages` 下的声明方式——若 wrangler.toml 不支持则改 Dashboard 绑定 + 文档说明。
2. `lib/sync.ts` 现有排除前缀清单需核对，确认 `kb_index:` 加入后不改变现有同步行为。
3. bge-base 余弦阈值 0.35 为经验值，实现后用真实 preset 语料 + 一组测试查询校准（可写一个 `scripts/calibrate-threshold.ts` 辅助）。
4. `KnowledgeDetailModal` 的 preset 导入 CTA 复用现有预设导入入口——实现时定位现有「预设卡片导入」函数并复用，避免重复实现。
