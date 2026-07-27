# 附录 C：术语表

> 45 个 devpath-ai 教程中出现的术语，每条含 1 句解释 + 项目内链接（如有）。

---

## A

### AES-GCM
Advanced Encryption Standard - Galois/Counter Mode。一种对称加密算法，同时提供加密和完整性校验。devpath-ai 用它加密零信任 session 中的 apiKey。详见 [lib/ai/crypto.ts](file:///workspace/lib/ai/crypto.ts)。

### App Router
Next.js 13+ 引入的文件式路由系统，基于文件系统约定（`app/` 目录）。比旧版 Pages Router 更适合 Server Components 和 Edge Runtime。

### ARIA
Accessible Rich Internet Applications。一组 HTML 属性，让屏幕阅读器理解动态 Web 内容。如 `aria-expanded` / `aria-controls` / `aria-label` / `role="progressbar"`。

---

## B

### BGE（BAAI General Embedding）
北京智源研究院的通用文本嵌入模型。devpath-ai 用 `bge-base-en-v1.5`（768 维）做知识库向量化。详见 [scripts/build-knowledge-index.ts](file:///workspace/scripts/build-knowledge-index.ts)。

### Bundle
前端构建产物的总称，包含所有 JavaScript / CSS / 资源。devpath-ai 的 bundle 限制是 Cloudflare Pages 单文件 3MB。

---

## C

### Client Component
React 18+ 中用 `"use client"` 声明的组件，在浏览器端渲染。与 Server Component 对应。

### Cloudflare KV
Cloudflare 的边缘键值存储，最终一致性，全球低延迟。devpath-ai 用 4 个独立 namespace（业务 / session / nonce / audit）。

### Cloudflare Pages
Cloudflare 的静态站点托管 + Edge Functions 平台，devpath-ai 的生产部署目标。详见 [08-deployment.md](file:///workspace/docs/tutorial/08-deployment.md)。

### Content-as-Code
把内容（如知识库）当作代码管理——版本化（git）、可审查（PR review）、可校验（CI 跑规则）、可重建（脚本生成）。devpath-ai 的 `content/` 目录就是 Content-as-Code 实践。

### CRDT（Conflict-free Replicated Data Type）
无冲突复制数据类型，多端同步时自动合并不冲突。devpath-ai 没用 CRDT，用的是更简单的 LWW + tombstone。

---

## D

### Data Stream Protocol
Vercel AI SDK 的流式响应协议，用前缀标记不同类型 chunk：`0:` text / `2:` data / `6:` tool-result / `8:` annotations。详见 [Vercel AI SDK 文档](https://sdk.vercel.ai/docs/ai-sdk-ui/streaming)。

### Dexie.js
IndexedDB 的 JavaScript 封装库，提供友好的链式 API。devpath-ai 用 Dexie 管理单表 kv + 4 索引。

### dark: variant
Tailwind CSS 的暗色模式变体。每个浅色 utility 必须带对应的 `dark:` 配对，否则暗色模式断裂。守护测试在 [__tests__/ui-design-system-guard.test.ts](file:///workspace/__tests__/ui-design-system-guard.test.ts)。

---

## E

### Edge Runtime
基于 V8 isolates 的 JavaScript 运行时（Cloudflare Workers / Vercel Edge Functions）。冷启动毫秒级，但无 Node.js 原生模块。devpath-ai 默认 Edge Runtime。

### ESLint
JavaScript / TypeScript 代码静态分析工具。devpath-ai 用 `next/core-web-vitals` + `typescript` 配置，`--max-warnings 0` 把 warning 当 error。

---

## F

### fallback 链
AI Provider 故障时的降级链。如 DeepSeek 失败 → GLM → MiMo。详见 [lib/ai/provider.ts](file:///workspace/lib/ai/provider.ts)。

### FSRS（Free Spaced Repetition Scheduler）
开源间隔重复算法，2024 年版本是 FSRS-4.5。比 Anki 的 SM-2 算法更准确。devpath-ai 用 ts-fsrs 4.5 实现。

### focus trap
模态框打开时，键盘焦点被"困"在模态内，Tab 不会跑到背景。`<Modal>` 组件内置实现。详见 [components/ui/Modal.tsx](file:///workspace/components/ui/Modal.tsx)。

---

## G

### generateObject
Vercel AI SDK 的 API，根据 zod schema 生成结构化 JSON 对象。devpath-ai 用它生成知识节点 / 学习计划 / 面试题等。

### G1-G7 图谱规则
devpath-ai 课程图谱的 7 条校验规则：(G1) 前置存在 / (G2) 来源已登记 / (G3) ≥1 T0-T1 / (G4) 无环 / (G5) 轨道阶段合法 / (G6) V3-V4 必挂 Rubric / (G7) 权重=100。详见 [lib/curriculum/graph.ts](file:///workspace/lib/curriculum/graph.ts)。

---

## H

### HMAC-SHA256
Hash-based Message Authentication Code，用 SHA-256 哈希算法。devpath-ai 用它做零信任 session 的签名，防篡改。

### HttpOnly Cookie
设置了 `HttpOnly` flag 的 Cookie，JavaScript 无法读取。devpath-ai 没用（无后端服务器），改用零信任 session。

---

## I

### IndexedDB
浏览器的 NoSQL 数据库，容量大（GB 级）。devpath-ai 的本地存储基于 IndexedDB + Dexie.js。

### idempotency key（幂等键）
确保同一操作只执行一次的键。devpath-ai 的 AI 工具调用用 `toolCallId + args hash` 作为幂等键，防网络重试触发多次执行。

---

## K

### Kahn 算法
拓扑排序算法，每次取入度为 0 的节点。devpath-ai 用它做学习路径排序，同层按 phase/id 字典序保证产物确定性。详见 [lib/curriculum/graph.ts](file:///workspace/lib/curriculum/graph.ts)。

---

## L

### LWW（Last-Write-Wins）
冲突解决策略，后写覆盖先写。devpath-ai 的数据同步用 LWW，简单可预测，但会丢失并发冲突。

### Local-first
本地优先架构，数据存浏览器，云端只是可选同步。devpath-ai 是 Local-first PWA。

---

## M

### Mastery Check
devpath-ai 课程节点的"掌握度验证"。V1 FSRS 卡片（理解）→ V2 代码沙箱（应用）→ V3 项目检查点（构建）→ V4 作品集发布（交付）。

### MASTER_KEY
零信任 session 的根密钥（32 字节 base64），用于 AES-GCM 加密 apiKey。必须配置，`openssl rand -base64 32` 生成。

### Miniflare
Cloudflare Workers 的本地模拟器，`wrangler pages dev` 用它模拟 KV / Workers AI 等 binding。

---

## N

### next-on-pages
`@cloudflare/next-on-pages` 工具，把 Next.js 构建产物转换成 Cloudflare Pages 兼容的 Edge Runtime 产物。

### nodejs_compat
Cloudflare 的兼容性 flag，允许 Edge Runtime 使用部分 Node.js polyfill（如 `Buffer` / `process`）。在 wrangler.toml 配置。

### nonce
"Number used once"，一次性随机数。devpath-ai 用它防重放攻击，5min 一次性消费。

---

## P

### Pages Functions
Cloudflare Pages 的 Edge Functions，类似 Vercel 的 API Routes。devpath-ai 没直接用，通过 `@cloudflare/next-on-pages` 转换 Next.js Route Handlers。

### Persona
AI 教练的"人格"。devpath-ai 有 4 种：严厉教练 / 温和陪伴 / 苏格拉底导师 / 平等同行，根据能量/心情/连续天数/提问内容自动切换。

### PWA（Progressive Web App）
渐进式 Web 应用，可安装、可离线、可推送通知。devpath-ai 是 PWA，含 Service Worker + Web Push + Manifest + periodicsync。

---

## R

### React 19
React 19 版本，引入 `use()` API / Actions / Server Components 稳定。devpath-ai 用 React 19。

### Route Handlers
Next.js App Router 的 API 路由，文件式约定 `app/api/*/route.ts`，导出 `GET` / `POST` 等函数。默认 Edge Runtime。

### Rubric
评分细则。devpath-ai 的 V3 项目检查点用 Rubric 让 AI 逐项打分（架构 / 错误处理 / 成本意识 / 安全）。详见 [content/rubrics/](file:///workspace/content/rubrics/)。

---

## S

### Server Component
React 18+ 中默认的组件类型，在服务端渲染，不进 client bundle。不能有 `useState` / `useEffect`。

### Service Worker
浏览器后台运行的 JavaScript，可拦截网络请求、缓存资源、推送通知。devpath-ai 自写 SW（stale-while-revalidate + Web Push + periodicsync）。

### stale-while-revalidate
缓存策略，先返回旧缓存（stale），同时后台更新（revalidate）。devpath-ai 的 SW 用这个策略。

### streamText
Vercel AI SDK 的 API，流式生成文本。devpath-ai 的 `/api/chat` 用它。

### SuperMemo-2
经典的间隔重复算法，Anki 早期版本用。比 FSRS 旧，准确性略低。

---

## T

### tombstone
"墓碑"，删除时不是物理删除而是写入 `deletedAt` 时间戳。devpath-ai 用 tombstone TTL 30 天解决同步删除传播。

### ts-fsrs
FSRS 算法的 TypeScript 实现。devpath-ai 用 4.5 版本。

### T0-T3 权威来源等级
devpath-ai 内容层的来源分级：T0 一手规范（官方文档/论文）/ T1 一手实现（经典源码/Cookbook）/ T2 权威工程实践（一线工程博客）/ T3 二手解读（仅作补充，不可单独支撑节点）。

---

## V

### V1-V4 验证层
devpath-ai 的 4 级能力验证：V1 FSRS 卡片（理解）→ V2 代码沙箱（应用）→ V3 AI 按 Rubric 审 GitHub 仓库（构建）→ V4 作品集发布（交付）。

### VAPID
Voluntary Application Server Identification for Web Push。Web Push 协议的鉴权机制，用公钥/私钥对。devpath-ai 用 `NEXT_PUBLIC_VAPID_PUBLIC_KEY` + 私钥。

### Vercel AI SDK
Vercel 出品的 AI 调用 SDK，提供 `streamText` / `generateObject` / `useChat` 等。devpath-ai 的 AI 调用层基于它。

### Vitest
Vite 生态的测试框架，与 Vite/Next.js 共享配置，ESM 原生支持。devpath-ai 用 Vitest 1.6。

---

## W

### Web Push
浏览器推送通知协议，需要 Service Worker + VAPID 密钥。devpath-ai 用它推送到期复习提醒。

### Workers AI
Cloudflare 的边缘 AI 推理服务，支持 BGE / Llama 等模型。devpath-ai 用它做知识库向量化（`bge-base-en-v1.5`）。

### wrangler
Cloudflare 的 CLI 工具，用于本地开发、部署、管理 Workers / Pages / KV。`wrangler pages deploy` 是部署命令。

---

## Z

### Zod
TypeScript 优先的运行时数据校验库。`z.infer<typeof schema>` 可从 schema 推断 TypeScript 类型。devpath-ai 用 Zod 校验所有外部数据 + AI 生成结构。

---

## 速查索引（按类别）

### 前端框架与运行时
- [App Router](#app-router) / [Client Component](#client-component) / [Server Component](#server-component) / [React 19](#react-19) / [Route Handlers](#route-handlers) / [Edge Runtime](#edge-runtime) / [nodejs_compat](#nodejs_compat) / [next-on-pages](#next-on-pages)

### 样式与组件
- [dark: variant](#dark-variant) / [focus trap](#focus-trap) / [ARIA](#aria)

### 数据存储
- [IndexedDB](#indexeddb) / [Dexie.js](#dexiejs) / [Cloudflare KV](#cloudflare-kv) / [Local-first](#local-first) / [LWW](#lww) / [tombstone](#tombstone) / [CRDT](#crdt)

### AI 与算法
- [Vercel AI SDK](#vercel-ai-sdk) / [streamText](#streamtext) / [generateObject](#generateobject) / [Data Stream Protocol](#data-stream-protocol) / [BGE](#bge) / [Workers AI](#workers-ai) / [FSRS](#fsrs) / [ts-fsrs](#ts-fsrs) / [SuperMemo-2](#supermemo-2) / [Persona](#persona) / [fallback 链](#fallback-链) / [idempotency key](#idempotency-key幂等键)

### 安全
- [AES-GCM](#aes-gcm) / [HMAC-SHA256](#hmac-sha256) / [nonce](#nonce) / [MASTER_KEY](#master_key) / [HttpOnly Cookie](#httponly-cookie)

### 部署与工程
- [Cloudflare Pages](#cloudflare-pages) / [Pages Functions](#pages-functions) / [wrangler](#wrangler) / [Miniflare](#miniflare) / [Vitest](#vitest) / [ESLint](#eslint) / [Bundle](#bundle) / [PWA](#pwaprogressive-web-app) / [Service Worker](#service-worker) / [stale-while-revalidate](#stale-while-revalidate) / [Web Push](#web-push) / [VAPID](#vapid)

### 课程内容
- [Content-as-Code](#content-as-code) / [G1-G7 图谱规则](#g1-g7-图谱规则) / [Kahn 算法](#kahn-算法) / [Mastery Check](#mastery-check) / [Rubric](#rubric) / [T0-T3 权威来源等级](#t0-t3-权威来源等级) / [V1-V4 验证层](#v1-v4-验证层) / [Zod](#zod)
