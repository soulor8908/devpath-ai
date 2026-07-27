# 第 4c 章：技术选型 — AI 集成

> **视角**：卡帕西（系统思维 / 第一性原理 / 权衡分析 / 关注点分离）
> **前置知识**：读完了 [第 4b 章 后端与存储技术选型](file:///workspace/docs/tutorial/04b-tech-backend.md)
> **本章学什么**：
> 1. AI SDK：Vercel AI SDK vs LangChain.js vs LlamaIndex.TS vs 直接 fetch
> 2. AI Provider 适配：@ai-sdk/openai 适配 vs 各家原生 SDK vs OpenRouter vs 自写适配层
> 3. 复习算法：ts-fsrs (FSRS-4.5) vs SuperMemo-2 vs Anki 算法 vs 自写 SM-2
> 4. 向量搜索：Workers AI BGE vs Transformers.js vs OpenAI Embeddings vs Pinecone vs 自建
> 5. Session 安全：明文存 apiKey vs Cookie+HttpOnly vs 零信任 session
> **预计阅读时间**：35 分钟
> **关联文档**：[docs/ARCHITECTURE.md](file:///workspace/docs/ARCHITECTURE.md) / [docs/content-generation-standard.md](file:///workspace/docs/content-generation-standard.md)

---

## 4c.1 基础概念（初学者先读这节）

- **LLM（Large Language Model）**：大语言模型，如 GPT-4 / Claude / GLM / DeepSeek。
- **AI SDK**：封装 LLM 调用的库，提供统一 API + 流式响应 + 工具调用 + 结构化输出。
- **流式响应（Streaming）**：AI 一个字一个字输出，用户看到打字效果，体验比等待完整响应好。
- **Tool Calling**：AI 调用外部工具（如"启动番茄钟"/"创建提醒"），LLM 决定何时调 + 传什么参数。
- **Embedding（向量嵌入）**：把文本转成数字向量（如 768 维），相似文本向量距离近。用于语义搜索。
- **FSRS（Free Spaced Repetition Scheduler）**：基于遗忘曲线的科学复习调度算法，比 Anki 的 SM-2 更准。
- **零信任 session**：不信任客户端，每次请求都验证 + 加密 + 防重放。
- **AES-GCM**：对称加密算法（同密钥加解密）+ 认证（防篡改）。Edge Runtime 的 Web Crypto API 原生支持。
- **HMAC-SHA256**：消息认证码，用密钥对消息签名，验证消息完整性和来源。
- **nonce**：一次性随机数，防重放攻击。每次请求用不同 nonce，用过即失效。

---

## 4c.2 A1. AI SDK：Vercel AI SDK

### 决策

选择 **Vercel AI SDK**（`generateObject` / `streamText`）。

### 背景

devpath-ai 需要：
- 流式 AI 对话（聊天 / 周报）
- 结构化输出（生成知识节点 / 面试题 / 学习计划，需 Zod schema 校验）
- 工具调用（8 个工具：番茄钟 / 提醒 / 计划调整 等）
- 多 Provider 适配（DeepSeek / GLM / MiMo / 用户自定义）

### 对比

| 维度 | Vercel AI SDK | LangChain.js | LlamaIndex.TS | 直接 fetch |
|---|---|---|---|---|
| 流式响应 | ✅ 原生（streamText） | ✅ | ✅ | ❌（需手写） |
| 结构化输出 | ✅ generateObject + Zod | ✅（Output Parser） | ✅ | ❌（需手写 JSON 解析） |
| 工具调用 | ✅ 原生 | ✅ | ✅ | ❌（需手写） |
| Provider 适配 | ✅ @ai-sdk/openai 等 | ✅ 多 Provider | ✅ 多 Provider | ❌（每家手写） |
| TypeScript | ✅ 原生 | ✅ | ✅ | ❌（需手写类型） |
| Bundle 体积 | ✅ 小（~30KB） | ❌ 大（~200KB+） | ❌ 大 | ✅ 0 |
| 学习曲线 | ✅ 低 | ❌ 高（概念多） | 中 | ✅ 低 |
| 与 Next.js 集成 | ✅ 原生 | 中 | 中 | ✅ |
| Edge Runtime | ✅ | ⚠️（部分依赖） | ⚠️ | ✅ |
| 生态 | ✅ 大（Vercel 背书） | ✅ 大 | 中 | - |

### 选择理由（卡帕西视角）

1. **`generateObject` + Zod**：AI 输出直接符合 schema，无需手动解析 JSON + 校验。知识节点 / 面试题 / 学习计划都用这个。
2. **流式响应原生**：`streamText` 返回流式 response，用户看到打字效果。LangChain 需要更多配置。
3. **工具调用原生**：8 个工具定义（番茄钟 / 提醒 / 计划调整等）用 `tools` 参数传入，AI 自动决定调用。
4. **Provider 适配**：`@ai-sdk/openai` 适配所有 OpenAI 兼容协议（DeepSeek / GLM / MiMo 都是），切换 Provider 只改环境变量。
5. **与 Next.js 原生集成**：`toDataStreamResponse()` 直接返回 Next.js Response，无需手写 stream 处理。
6. **Edge Runtime 友好**：无 Node 依赖，纯 JS，可在 Cloudflare Pages Edge 运行。
7. **bundle 小**：~30KB，比 LangChain ~200KB 小很多。

### 代价

- **概念相对少**：不像 LangChain 有 Agent / Chain / Memory 等高级抽象。devpath-ai 自己实现 Agent 逻辑（Persona + 工具调用）。
- **Memory 需自建**：Vercel AI SDK 不提供对话记忆，devpath-ai 用 `lib/ai/memory/` 自己实现（用户画像 + 对话历史）。
- **Provider 适配范围**：`@ai-sdk/openai` 只适配 OpenAI 兼容协议，不兼容的需自写适配层。

### 实现细节

引用自 [app/api/chat/route.ts](file:///workspace/app/api/chat/route.ts)（简化）：

```typescript
import { streamText, generateObject } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';

const model = createOpenAI({
  baseURL: getModelConfig(session).baseURL,  // DeepSeek / GLM / MiMo
  apiKey: decryptSession(session),
});

// 流式对话 + 工具调用
const result = await streamText({
  model: model(session.model),
  messages: await buildContext(session.userId),
  tools: chatTools,  // 8 个工具
  system: buildSystemPrompt(persona, userProfile),
});

return result.toDataStreamResponse();
```

引用自 [lib/ai/knowledge.ts](file:///workspace/lib/ai/knowledge.ts)（结构化输出）：

```typescript
const result = await generateObject({
  model,
  schema: nodeSchema,  // Zod schema
  prompt: `拆解知识节点：${topic}`,
});
// result.object 已校验，直接符合 KnowledgeNode 类型
```

### 踩过的坑

- **Data Stream Protocol 前缀**：Vercel AI SDK 用 `6:` 前缀发送工具结果，早期代码监听 `type === "a"`（annotation）导致工具空转。详见 [07-iteration.md](file:///workspace/docs/tutorial/07-iteration.md) Phase 13。
- **`generateObject` 与 Zod 严格模式**：Zod `min(2)` 在 AI 输出只有 1 条时会报错，需 prompt 强约束 + retry。

---

## 4c.3 A2. AI Provider 适配：@ai-sdk/openai

### 决策

选择 **`@ai-sdk/openai` 适配**（OpenAI 兼容协议）。

### 背景

devpath-ai 需要支持多 Provider：
- DeepSeek（国内可用 / 性价比高）
- GLM（国内免梯子 / 有免费额度）
- MiMo（小米 / 国内可用）
- 用户自定义（任何 OpenAI 兼容协议）

### 对比

| 维度 | @ai-sdk/openai 适配 | 各家原生 SDK | OpenRouter | 自写适配层 |
|---|---|---|---|---|
| 代码统一性 | ✅ 一套代码 | ❌ 每家不同 | ✅ 一套代码 | ✅ 一套代码 |
| Provider 覆盖 | ✅ 所有 OpenAI 兼容 | ❌ 仅自家 | ✅ 多家 | 取决于实现 |
| 切换成本 | ✅ 改 baseURL + apiKey | ❌ 改 SDK + 代码 | ✅ 改 model 名 | ✅ 改适配层 |
| 依赖体积 | ✅ 小（~10KB） | ❌ 大（每家 SDK） | 中 | ✅ 0 |
| 新功能支持 | ⚠️ 滞后（等 SDK 更新） | ✅ 最快 | ⚠️ 滞后 | ✅ 自控 |
| 成本 | ✅ Provider 原价 | ✅ Provider 原价 | ❌ 加价 5-10% | ✅ Provider 原价 |
| 学习曲线 | ✅ 低 | 中 | ✅ 低 | 中 |

### 选择理由（卡帕西视角）

1. **OpenAI 兼容协议是事实标准**：DeepSeek / GLM / MiMo 都兼容 OpenAI API，一套适配层覆盖所有。
2. **切换成本最低**：用户在"我的 → AI 模型配置"改 baseURL + apiKey，立即切换 Provider，无需改代码。
3. **依赖体积小**：`@ai-sdk/openai` ~10KB，比每家原生 SDK 加起来小很多。
4. **零加价**：直接调用 Provider，不像 OpenRouter 加价 5-10%。
5. **与 Vercel AI SDK 原生集成**：`createOpenAI()` 返回的 model 直接传给 `streamText` / `generateObject`。

### 代价

- **新功能滞后**：Provider 推出新功能（如 GLM 的多模态），需等 `@ai-sdk/openai` 适配
- **OpenAI 兼容性差异**：各家声称兼容，但有细微差异（如 tool calling 格式 / streaming chunk 结构），需 fallback
- **不支持非 OpenAI 协议**：如 Anthropic Claude 用自己的协议，需 `@ai-sdk/anthropic` 单独适配

### 实现细节

引用自 [lib/ai/provider.ts](file:///workspace/lib/ai/provider.ts)（简化）：

```typescript
import { createOpenAI } from '@ai-sdk/openai';

const PRESETS = {
  deepseek: { baseURL: 'https://api.deepseek.com/v1', models: [...] },
  glm:      { baseURL: 'https://open.bigmodel.cn/api/paas/v4', models: [...] },
  mimo:     { baseURL: 'https://api.mimo.xiaomi.com/v1', models: [...] },
};

export function getModel(config: ModelConfig) {
  const preset = PRESETS[config.provider] ?? { baseURL: config.baseURL };
  const openai = createOpenAI({
    baseURL: preset.baseURL,
    apiKey: decryptApiKey(config.apiKey),  // 零信任解密
  });
  return openai(config.model);
}
```

### 踩过的坑

- **GLM streaming chunk 格式差异**：GLM 的 SSE chunk 与 OpenAI 略有不同，早期 `@ai-sdk/openai` 解析失败。需升级 SDK 版本。
- **DeepSeek tool calling 偶发失败**：DeepSeek 的 tool calling 在长上下文时偶发不返回 `tool_calls`，需 retry + fallback 到纯文本。

---

## 4c.4 A3. 复习算法：ts-fsrs 4.5

### 决策

选择 **ts-fsrs 4.5**（FSRS-4.5 算法）。

### 背景

devpath-ai 需要基于遗忘曲线调度复习卡片：
- 每张卡片有 stability（稳定性）/ difficulty（难度）/ dueAt（下次到期）
- 用户评分（Again / Hard / Good / Easy）更新卡片状态
- 算法预测下次到期时间，最大化长期记忆

### 对比

| 维度 | ts-fsrs (FSRS-4.5) | SuperMemo-2 (SM-2) | Anki 算法 | 自写 SM-2 |
|---|---|---|---|---|
| 算法精度 | ✅ 高（基于 5 亿条复习数据训练） | 中（1987 年算法） | 中（基于 SM-2 改进） | 中 |
| TypeScript 支持 | ✅ 原生 | ❌（需手写） | ❌（Python） | ✅ |
| 参数调优 | ✅ 3 种预设（conservative/standard/aggressive） | ❌（固定） | ✅ 可调 | ✅ 自控 |
| 学习曲线 | ✅ 低（开箱即用） | 中 | 中 | 中 |
| 维护活跃度 | ✅ 活跃（open-spaced-repetition 社区） | ❌ 停更 | ✅ 活跃 | - |
| Bundle 体积 | ✅ 小（~15KB） | ✅ 0（手写） | - | ✅ 0 |
| 数据迁移 | ✅（与 Anki 兼容） | ✅ | ✅ | ❌ |

### 选择理由（卡帕西视角）

1. **算法精度最高**：FSRS-4.5 基于 5 亿条复习数据训练，比 1987 年的 SM-2 准很多。引用：[FSRS wiki](https://github.com/open-spaced-repetition/fsrs4anki/wiki)。
2. **TypeScript 原生**：`ts-fsrs` 是 TS 实现，与 devpath-ai 技术栈一致，类型安全。
3. **3 种参数预设**：conservative 0.95（保守，复习频繁）/ standard 0.9（默认）/ aggressive 0.8（激进，复习稀疏），用户可按需切换。
4. **与 Anki 兼容**：数据格式与 Anki 兼容，未来用户可导出到 Anki。
5. **维护活跃**：open-spaced-repetition 社区持续更新，算法不断改进。
6. **bundle 小**：~15KB，不影响首屏。

### 代价

- **算法黑盒**：FSRS-4.5 是神经网络训练的权重，不像 SM-2 是显式公式。但 `ts-fsrs` 提供源码可读。
- **参数调优需数据**：FSRS-4.5 的 optimal retention 参数需用户复习 1000+ 张卡片后才能个性化调优。devpath-ai 用 3 种预设兜底。

### 实现细节

引用自 [lib/fsrs.ts](file:///workspace/lib/fsrs.ts)（简化）：

```typescript
import { fsrs, generatorParameters, Rating } from 'ts-fsrs';

const params = generatorParameters({
  request_retention: 0.9,  // standard 预设
  maximum_interval: 365,
});

const f = fsrs(params);

// 创建新卡片
const card = f.createEmptyCard();

// 用户评分后更新
const now = new Date();
const result = f.schedule(card, now, Rating.Good);
// result[0] = Again, result[1] = Hard, result[2] = Good, result[3] = Easy
const updatedCard = result[2];  // 用户选 Good
```

### 踩过的坑

- **时区问题**：FSRS 用 Date 对象，早期未固定时区导致跨时区用户 dueAt 偏移。`lib/time.ts` 固定 Asia/Shanghai。
- **旧数据迁移**：早期用 SM-2，迁移到 FSRS 需保留 stability/difficulty。`migrateFromSM2()` 函数处理。

---

## 4c.5 A4. 向量搜索：Workers AI BGE（构建期预嵌入）

### 决策

选择 **Workers AI `bge-base-en-v1.5`**（768 维，构建期预嵌入）。

### 背景

devpath-ai 需要知识库语义搜索：
- 用户问"Transformer 的注意力机制"，找到 `llm.attention-mechanism` 节点
- 500 条知识条目 × 768 维向量
- 余弦相似度 top-k + 关键词降级 + 启发式判定

### 对比

| 维度 | Workers AI BGE | Transformers.js | OpenAI Embeddings | Pinecone | 自建（TF-IDF） |
|---|---|---|---|---|---|
| 部署位置 | ✅ Cloudflare Edge | ❌ 浏览器 | ❌ OpenAI 服务器 | ❌ Pinecone 服务器 | ✅ 本地 |
| 运行时成本 | ✅ 低（只嵌查询文本） | ❌ 高（浏览器推理慢） | ❌ 高（每次调用付费） | ❌ 高（托管费） | ✅ 0 |
| 构建期预嵌入 | ✅（脚本预嵌 500 条） | ❌（运行时嵌） | ✅（脚本预嵌） | ✅（脚本预嵌） | ✅（脚本预嵌） |
| 模型质量 | ✅ 高（BGE 优秀） | ✅ 高 | ✅ 高 | ✅ 高 | ❌ 低（TF-IDF） |
| Bundle 体积 | ✅ 0（云端推理） | ❌ 大（模型 ~100MB） | ✅ 0 | ✅ 0 | ✅ 0 |
| 离线支持 | ❌（需联网） | ✅ | ❌ | ❌ | ✅ |
| 与 Cloudflare 集成 | ✅ 原生 | ❌ | ❌ | ❌ | - |
| 免费额度 | ✅（Workers AI 免费） | - | ❌ 付费 | ❌ 付费 | - |

### 选择理由（卡帕西视角）

1. **构建期预嵌入省 99% 调用**：500 条知识条目在构建时用脚本 `scripts/build-knowledge-index.ts` 预嵌入成 `public/data/knowledge-index.json`（2.7MB），运行时只嵌查询文本（1 次调用/查询）。
2. **与 Cloudflare 原生集成**：Workers AI 是 Cloudflare 服务，与 Pages 同平台，延迟最低。
3. **免费额度**：Workers AI 有免费额度，devpath-ai 的查询量低（用户搜索时才调用），免费够用。
4. **BGE 模型质量高**：`bge-base-en-v1.5` 是开源 SOTA 模型，768 维平衡精度和体积。
5. **不依赖浏览器推理**：Transformers.js 在浏览器跑模型，移动端性能差 + bundle 大（~100MB）。

### 代价

- **离线不可用**：查询时需联网调 Workers AI。降级方案：关键词搜索（运行时本地跑）。
- **构建期依赖**：新增知识条目需重新跑 `npm run build:knowledge-index` 预嵌入。
- **2.7MB 索引体积**：`knowledge-index.json` 2.7MB，首次加载有成本。用 Service Worker 缓存。

### 实现细节

引用自 [scripts/build-knowledge-index.ts](file:///workspace/scripts/build-knowledge-index.ts)（简化）：

```typescript
// 构建期：预嵌入 500 条知识条目
const articles = loadKnowledgeArticles();  // 500 条
const embeddings = await workersAI.embed(
  articles.map(a => a.title + ' ' + a.content),
  'bge-base-en-v1.5'
);
// 写入 public/data/knowledge-index.json（2.7MB）
writeJSON('public/data/knowledge-index.json', { articles, embeddings });
```

引用自 [lib/knowledge/search.ts](file:///workspace/lib/knowledge/search.ts)（运行时，简化）：

```typescript
// 三级降级加载索引
const index = await loadIndex();  // 内存 → IndexedDB → fetch JSON

// 运行时：只嵌查询文本
const queryVec = await workersAI.embed([query], 'bge-base-en-v1.5');

// 余弦相似度 top-k
const results = cosineSimilarityTopK(queryVec, index.embeddings, 5);

// 关键词降级
if (results.length === 0) {
  return keywordSearch(query);
}

// 启发式判定（命令型前缀不检索）
if (isCommand(query)) return [];  // 如"删除卡片"不检索
```

### 踩过的坑

- **2.7MB 索引首次加载慢**：用 Service Worker 缓存 + IndexedDB 持久化，第二次秒开
- **BGE 模型对中文支持一般**：`bge-base-en-v1.5` 是英文模型，中文查询需降级到关键词搜索。可换 `bge-base-zh-v1.5`。

---

## 4c.6 A5. Session 安全：零信任 session

### 决策

选择 **零信任 session**（AES-GCM 加密 + nonce 5min 一次性消费 + HMAC-SHA256 签名 + 时间窗 ±60s + 滑动续期 7d）。

### 背景

devpath-ai 用户可自带 API Key（GLM / DeepSeek / OpenAI 等），需安全传输：
- apiKey 不能直接暴露给前端 JS（XSS 会偷）
- 服务端不存 apiKey 明文
- 防重放攻击（截获请求重放）
- 防中间人攻击（篡改请求）

### 对比

| 维度 | 明文存 apiKey | Cookie + HttpOnly | 零信任 session（本项目） |
|---|---|---|---|
| apiKey 暴露风险 | ❌ 高（XSS 可偷） | ✅ 低（HttpOnly 防偷） | ✅ 低（加密存服务端） |
| 服务端存储 | ❌ 无 | ✅ Cookie 本地 | ✅ KV 加密存 |
| 防重放 | ❌ 无 | ❌ 无 | ✅ nonce 5min 一次性 |
| 防篡改 | ❌ 无 | ❌ 无 | ✅ HMAC-SHA256 签名 |
| 防中间人 | ❌ 无 | ✅ HTTPS | ✅ HTTPS + 时间窗 ±60s |
| 跨设备 | ❌ 难（需同步 apiKey） | ❌ 难（Cookie 不跨设备） | ✅ session 在 KV |
| 撤销 | ❌ 难（需改 apiKey） | ❌ 难（需清 Cookie） | ✅ revokeSession 一键撤销 |
| 实现复杂度 | ✅ 低 | ✅ 低 | ❌ 高 |
| Edge Runtime 兼容 | ✅ | ✅ | ✅（Web Crypto API） |

### 选择理由（卡帕西视角）

1. **apiKey 不直接暴露**：用户输入 apiKey 后，服务端立即用 MASTER_KEY（AES-GCM）加密存入 KV，前端只拿 sessionId（不含 apiKey）。
2. **每次请求验证**：前端请求带 sessionId + nonce + timestamp + HMAC 签名，服务端验证：session 有效 + nonce 未用过 + timestamp 在 ±60s 窗口 + HMAC 签名匹配。
3. **防重放**：nonce 5min 一次性消费，存入 `AUTH_NONCES` KV namespace，用过即删。
4. **防篡改**：HMAC-SHA256 签名（用 session 中的 HMAC_KEY）确保请求完整。
5. **滑动续期 7d**：每次请求成功，session 过期时间延后 7 天，避免用户频繁重新登录。
6. **跨设备**：session 在 KV，用户在另一台设备用 userId + apiKey 重新 exchange 即可。
7. **一键撤销**：`revokeSession` 删除 KV 中的 session，所有设备立即失效。

### 实现细节

引用自 [lib/ai/session-middleware.ts](file:///workspace/lib/ai/session-middleware.ts) + [lib/api-client.ts](file:///workspace/lib/api-client.ts)（简化）：

```typescript
// 客户端：发送请求
async function secureFetch(url, body, session) {
  const nonce = generateNonce();
  const timestamp = Date.now();
  const payload = JSON.stringify(body);
  const hmac = await HMAC(session.hmacKey, `${nonce}:${timestamp}:${payload}`);
  
  return fetch(url, {
    method: 'POST',
    headers: {
      'X-Session-Id': session.id,
      'X-Nonce': nonce,
      'X-Timestamp': timestamp,
      'X-HMAC': hmac,
    },
    body: payload,
  });
}

// 服务端：验证请求
async function verifySession(req) {
  const sessionId = req.headers['X-Session-Id'];
  const nonce = req.headers['X-Nonce'];
  const timestamp = Number(req.headers['X-Timestamp']);
  const hmac = req.headers['X-HMAC'];
  
  // 1. 时间窗验证（±60s）
  if (Math.abs(Date.now() - timestamp) > 60_000) throw new Error('Expired');
  
  // 2. Session 验证（KV 查询）
  const session = await KV_SESSIONS.get(sessionId);
  if (!session) throw new Error('Invalid session');
  
  // 3. HMAC 验证
  const expected = await HMAC(session.hmacKey, `${nonce}:${timestamp}:${body}`);
  if (hmac !== expected) throw new Error('Invalid HMAC');
  
  // 4. Nonce 验证（防重放）
  const used = await KV_NONCES.get(`${sessionId}:${nonce}`);
  if (used) throw new Error('Replay attack');
  await KV_NONCES.set(`${sessionId}:${nonce}`, '1', { expirationTtl: 300 });  // 5min
  
  // 5. 滑动续期 7d
  await KV_SESSIONS.put(sessionId, { ...session, expiresAt: Date.now() + 7 * 86400_000 });
  
  return session;
}
```

### 代价

- **实现复杂**：AES-GCM + nonce + HMAC + 时间窗 + 滑动续期，5 个机制叠加，调试困难
- **每次请求 4 次 KV 操作**：session 查 + nonce 查 + nonce 写 + session 更新。免费额度 100K reads/天够用，但 1K writes/天需注意
- **MASTER_KEY 必配**：加密根密钥，未配置则 `/api/auth/exchange` 返回 500。`openssl rand -base64 32` 生成
- **Edge Runtime Web Crypto API**：与 Node.js `crypto` 不同，需 `lib/ai/crypto.ts` 封装 base64/hex/AES-GCM/HMAC-SHA256

### 踩过的坑

- **早期明文存 apiKey**：XSS 可偷，且同步到云端等于明文传输。改为零信任 session。
- **nonce 不限时长**：早期 nonce 永久存，KV 写入量爆炸。改为 5min TTL。
- **时间窗 ±60s 太严**：网络慢的移动端请求被拒。改为 ±60s（合理范围）。

---

## 4c.7 章节小结：AI 技术栈一览

| 层 | 选型 | 理由 |
|---|---|---|
| AI SDK | Vercel AI SDK | generateObject + 流式 + 工具调用 + Provider 适配 |
| Provider 适配 | @ai-sdk/openai | OpenAI 兼容协议是事实标准 |
| 复习算法 | ts-fsrs 4.5 | 精度最高 + TS 原生 + 3 预设 |
| 向量搜索 | Workers AI BGE（预嵌入） | 构建期预嵌省 99% 调用 + Cloudflare 原生 |
| Session 安全 | 零信任 session | apiKey 不暴露 + 防重放 + 防篡改 + 跨设备 |

---

## 本章小结

**学到了什么**：
1. Vercel AI SDK 的选择理由：generateObject + 流式 + 工具调用 + 与 Next.js 原生集成，代价是概念少需自建 Memory
2. @ai-sdk/openai 适配的选择理由：OpenAI 兼容协议是事实标准，切换 Provider 改 baseURL 即可
3. ts-fsrs 4.5 的选择理由：基于 5 亿数据训练 + TS 原生 + 3 预设，代价是算法黑盒
4. Workers AI BGE 预嵌入的选择理由：构建期预嵌省 99% 调用 + Cloudflare 原生，代价是离线不可用
5. 零信任 session 的选择理由：apiKey 不暴露 + 防重放 + 防篡改 + 跨设备，代价是实现复杂

**关键决策回顾**：
1. **AI 是编排器不是主功能**：Persona + 画像 + 工具调用，不是简单的 chat
2. **结构化输出**：generateObject + Zod schema，AI 输出直接符合类型
3. **构建期预嵌入**：500 条知识向量在构建时预嵌，运行时只嵌查询
4. **零信任 session 5 机制**：AES-GCM + nonce + HMAC + 时间窗 + 滑动续期

## 下一章衔接

下一章 [04d-tech-deployment.md](file:///workspace/docs/tutorial/04d-tech-deployment.md) 讲部署与 CI/CD 技术选型：部署平台 / 运行时 / CI/CD / 测试框架 / PWA 策略。

## 延伸阅读

- [Vercel AI SDK 文档](https://sdk.vercel.ai/docs)
- [ts-fsrs 文档](https://github.com/open-spaced-repetition/ts-fsrs)
- [Cloudflare Workers AI 文档](https://developers.cloudflare.com/workers-ai/)
- [OWASP API Security Top 10](https://owasp.org/API-Security/)
