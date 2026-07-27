# 附录 A：技术决策卡片

> 20 个核心技术决策点的速查卡片。每张卡片含：决策 / 选项 / 选择 / 理由 / 代价。详细对比见第 4 章技术选型。

---

## F1：前端框架

| 项 | 内容 |
|---|---|
| **决策** | 选哪个前端框架 |
| **选项** | Next.js 15 App Router / Remix / Vite+React Router / Astro |
| **选择** | Next.js 15 App Router |
| **理由** | (1) Server Components 减少 client bundle；(2) App Router 文件式路由降低心智负担；(3) Vercel AI SDK 原生支持；(4) Cloudflare Pages 通过 `@cloudflare/next-on-pages` 支持 |
| **代价** | 绑定 Vercel 生态（Data Stream Protocol 等）；Edge Runtime 兼容性需 `@cloudflare/next-on-pages` 转换 |

详见 [04a-tech-frontend.md](file:///workspace/docs/tutorial/04a-tech-frontend.md) F1。

---

## F2：UI 样式方案

| 项 | 内容 |
|---|---|
| **决策** | 选哪个 CSS 方案 |
| **选项** | Tailwind CSS / CSS-in-JS (emotion) / CSS Modules / Vanilla Extract |
| **选择** | Tailwind CSS 3.4 |
| **理由** | (1) 原子类避免命名；(2) 设计令牌通过 `tailwind.config.ts` 集中管理；(3) dark: 变体内置；(4) 守护测试可扫描 className |
| **代价** | className 长；设计令牌逃逸值（`text-[10px]`）需守护测试拦截 |

详见 [04a-tech-frontend.md](file:///workspace/docs/tutorial/04a-tech-frontend.md) F2。

---

## F3：状态管理

| 项 | 内容 |
|---|---|
| **决策** | 选哪个状态管理方案 |
| **选项** | useState+Context / Redux Toolkit / Zustand / Jotai |
| **选择** | useState + Context |
| **理由** | (1) 状态简单（用户配置 / 主题 / Toast）；(2) Server Components 减少客户端状态需求；(3) IndexedDB 是真正的"状态源" |
| **代价** | 跨组件状态要 prop drilling 或 Context；高频更新场景需 useCallback 优化 |

详见 [04a-tech-frontend.md](file:///workspace/docs/tutorial/04a-tech-frontend.md) F3。

---

## F4：表单组件策略

| 项 | 内容 |
|---|---|
| **决策** | 选哪个表单组件策略 |
| **选项** | 原生+守护测试 / 统一组件库 / Radix Primitives / shadcn/ui |
| **选择** | 统一组件库（自建 `components/ui/`）+ 守护测试 |
| **理由** | (1) 完全可控（样式 / 行为 / ARIA）；(2) 守护测试 `no-native-form-elements.test.ts` 拦截原生元素；(3) 不引入 Radix / shadcn 依赖 |
| **代价** | 自建 16 个组件工作量大；要自己维护 ARIA / focus trap / 键盘支持 |

详见 [04a-tech-frontend.md](file:///workspace/docs/tutorial/04a-tech-frontend.md) F4。

---

## F5：图表库

| 项 | 内容 |
|---|---|
| **决策** | 选哪个图表库 |
| **选项** | Recharts / Chart.js / D3 / Visx / 自绘 SVG |
| **选择** | Recharts + 自绘 SVG 混合 |
| **理由** | (1) 雷达图用 Recharts（成熟）；(2) 热力图用 react-activity-calendar；(3) 简单进度条 / 圆环自绘 SVG（轻量）；(4) 重库用外壳组件 + 懒加载 |
| **代价** | 多套方案并存增加维护成本；bundle 要严格分层（外壳轻量 / 内容懒加载） |

详见 [04a-tech-frontend.md](file:///workspace/docs/tutorial/04a-tech-frontend.md) F5。

---

## B1：本地存储

| 项 | 内容 |
|---|---|
| **决策** | 选哪个本地存储方案 |
| **选项** | IndexedDB+Dexie / localStorage / SQLite WASM / OPFS |
| **选择** | IndexedDB + Dexie.js（单表 kv + 4 索引） |
| **理由** | (1) 容量大（GB 级）；(2) Dexie 封装 API 友好；(3) 单表 kv 迁移成本低（idb-keyval 直接升级）；(4) 4 索引（`&key, prefix, updatedAt, dueAt`）覆盖主要查询 |
| **代价** | 单表 prefix 扫描效率不如多表关系查询；事务模型比 SQLite 弱 |

详见 [04b-tech-backend.md](file:///workspace/docs/tutorial/04b-tech-backend.md) B1。

---

## B2：云端存储

| 项 | 内容 |
|---|---|
| **决策** | 选哪个云端存储方案 |
| **选项** | Cloudflare KV / Supabase / Firebase / PlanetScale / Turso |
| **选择** | Cloudflare KV（4 个独立 namespace） |
| **理由** | (1) 边缘网络延迟低；(2) 与 Cloudflare Pages 同平台无跨域；(3) 免费额度足够；(4) 4 namespace 隔离安全边界（业务 / session / nonce / audit） |
| **代价** | KV 是最终一致性（写入到全球传播有延迟）；无关系查询能力 |

详见 [04b-tech-backend.md](file:///workspace/docs/tutorial/04b-tech-backend.md) B2。

---

## B3：数据同步策略

| 项 | 内容 |
|---|---|
| **决策** | 选哪个数据同步策略 |
| **选项** | 全量备份 / 增量同步+LWW / CRDT / 实时同步 |
| **选择** | 增量同步 + LWW（Last-Write-Wins）+ tombstone TTL 30 天 |
| **理由** | (1) `getChangesSince(lastSyncAt)` 利用 updatedAt 索引，无变更返回 noop（O(0) 网络成本）；(2) LWW 合并简单可预测；(3) tombstone 解决删除传播 |
| **代价** | LWW 会丢失并发冲突（后写覆盖先写）；tombstone 占用 30 天存储 |

详见 [04b-tech-backend.md](file:///workspace/docs/tutorial/04b-tech-backend.md) B3。

---

## B4：API 路由模式

| 项 | 内容 |
|---|---|
| **决策** | 选哪个 API 路由模式 |
| **选项** | Next.js API Routes (App Router) / Edge Functions / Pages Functions / 独立后端 |
| **选择** | Next.js App Router Route Handlers（`app/api/*/route.ts`） |
| **理由** | (1) 与前端同仓库，类型共享；(2) App Router Route Handlers 默认 Edge Runtime；(3) `@cloudflare/next-on-pages` 自动转换 |
| **代价** | Edge Runtime 限制（无 Node.js 原生模块）；绑定 KV/AI 要走 `getRequestContext().env` |

详见 [04b-tech-backend.md](file:///workspace/docs/tutorial/04b-tech-backend.md) B4。

---

## B5：数据校验

| 项 | 内容 |
|---|---|
| **决策** | 选哪个数据校验方案 |
| **选项** | Zod / Yup / Joi / Valibot / 手写类型守卫 |
| **选择** | Zod |
| **理由** | (1) TypeScript 优先（`z.infer` 推断类型）；(2) Vercel AI SDK `generateObject` 原生支持；(3) 错误信息友好；(4) 社区主流 |
| **代价** | bundle 较大（~50KB）；运行时校验有性能开销 |

详见 [04b-tech-backend.md](file:///workspace/docs/tutorial/04b-tech-backend.md) B5。

---

## A1：AI SDK

| 项 | 内容 |
|---|---|
| **决策** | 选哪个 AI SDK |
| **选项** | Vercel AI SDK / LangChain.js / LlamaIndex.TS / 直接 fetch |
| **选择** | Vercel AI SDK |
| **理由** | (1) `streamText` / `generateObject` 开箱即用；(2) 工具调用原生支持；(3) Data Stream Protocol 标准化；(4) 与 Next.js 深度集成 |
| **代价** | 绑定 Vercel 协议；工具调用流解析器 bug 难发现（Phase 10 教训） |

详见 [04c-tech-ai.md](file:///workspace/docs/tutorial/04c-tech-ai.md) A1。

---

## A2：AI Provider 适配

| 项 | 内容 |
|---|---|
| **决策** | 选哪个 AI Provider 适配方案 |
| **选项** | `@ai-sdk/openai` 适配 / 各家原生 SDK / OpenRouter / 自写适配层 |
| **选择** | `@ai-sdk/openai` 适配（DeepSeek / GLM / MiMo 都兼容 OpenAI API） |
| **理由** | (1) 一套代码适配多家；(2) 切换 provider 只改 baseURL + apiKey；(3) fallback 链简单实现 |
| **代价** | 无法用 provider 专有特性（如 GLM 的 function calling 扩展） |

详见 [04c-tech-ai.md](file:///workspace/docs/tutorial/04c-tech-ai.md) A2。

---

## A3：复习算法

| 项 | 内容 |
|---|---|
| **决策** | 选哪个复习算法 |
| **选项** | ts-fsrs (FSRS-4.5) / SuperMemo-2 / Anki 算法 / 自写 SM-2 |
| **选择** | ts-fsrs 4.5 |
| **理由** | (1) 社区最佳实现；(2) 3 种参数预设（conservative 0.95 / standard 0.9 / aggressive 0.8）；(3) TypeScript 原生 |
| **代价** | FSRS-5 已发布（更好的短时记忆建模）；API 升级有 breaking change |

详见 [04c-tech-ai.md](file:///workspace/docs/tutorial/04c-tech-ai.md) A3。

---

## A4：向量搜索

| 项 | 内容 |
|---|---|
| **决策** | 选哪个向量搜索方案 |
| **选项** | Workers AI BGE / Transformers.js / OpenAI Embeddings / Pinecone / 自建 |
| **选择** | Workers AI `bge-base-en-v1.5`（768 维，构建期预嵌入） |
| **理由** | (1) 边缘网络零延迟；(2) 与 Cloudflare Pages 同平台无跨域；(3) 免费额度足够；(4) 构建期预嵌入，运行时只嵌查询文本 |
| **代价** | 768 维向量索引较大（500 条 ~3MB）；BGE 英文优化，中文检索质量略低 |

详见 [04c-tech-ai.md](file:///workspace/docs/tutorial/04c-tech-ai.md) A4。

---

## A5：Session 安全

| 项 | 内容 |
|---|---|
| **决策** | 选哪个 Session 安全方案 |
| **选项** | 明文存 apiKey / Cookie+HttpOnly / 零信任 session (AES-GCM+nonce+HMAC) |
| **选择** | 零信任 session |
| **理由** | (1) apiKey 永不出现在请求里；(2) nonce 防重放；(3) HMAC 防篡改；(4) 时间窗 ±60s 防中间人；(5) 滑动续期 7d 体验好 |
| **代价** | 架构复杂（4 个 KV namespace）；客户端要管理 session 生命周期 |

详见 [04c-tech-ai.md](file:///workspace/docs/tutorial/04c-tech-ai.md) A5。

---

## D1：部署平台

| 项 | 内容 |
|---|---|
| **决策** | 选哪个部署平台 |
| **选项** | Cloudflare Pages / Vercel / Netlify / AWS Amplify / 自建 |
| **选择** | Cloudflare Pages |
| **理由** | (1) 本地优先 PWA + KV 同步架构自洽；(2) KV 在边缘网络延迟低；(3) 免费额度足够；(4) Workers AI 直接 binding |
| **代价** | Edge Runtime 限制；`@cloudflare/next-on-pages` 转换层增加构建复杂度 |

详见 [04d-tech-deployment.md](file:///workspace/docs/tutorial/04d-tech-deployment.md) D1。

---

## D2：运行时

| 项 | 内容 |
|---|---|
| **决策** | 选哪个运行时 |
| **选项** | Edge Runtime / Node.js / Deno / Bun |
| **选择** | Edge Runtime（Cloudflare Pages 默认） |
| **理由** | (1) 冷启动毫秒级；(2) 边缘网络全球低延迟；(3) 与 KV / Workers AI 同 runtime |
| **代价** | 无 Node.js 原生模块（`fs` / `crypto` 部分方法）；需 `nodejs_compat` flag 启用 polyfill |

详见 [04d-tech-deployment.md](file:///workspace/docs/tutorial/04d-tech-deployment.md) D2。

---

## D3：CI/CD

| 项 | 内容 |
|---|---|
| **决策** | 选哪个 CI/CD 平台 |
| **选项** | GitHub Actions / GitLab CI / CircleCI / Jenkins / Drone |
| **选择** | GitHub Actions |
| **理由** | (1) 与 GitHub 仓库原生集成；(2) marketplace 丰富（actions/checkout / actions/setup-node 等）；(3) 免费额度足够（公开仓库无限） |
| **代价** | 私有仓库免费分钟数有限；自托管 runner 配置复杂 |

详见 [04d-tech-deployment.md](file:///workspace/docs/tutorial/04d-tech-deployment.md) D3。

---

## D4：测试框架

| 项 | 内容 |
|---|---|
| **决策** | 选哪个测试框架 |
| **选项** | Vitest / Jest / Bun test / Node test runner |
| **选择** | Vitest 1.6 |
| **理由** | (1) 与 Vite/Next.js 共享配置；(2) ESM 原生支持；(3) watch 模式快；(4) UI 模式调试友好 |
| **代价** | 生态比 Jest 小；某些 Jest 兼容库需要适配 |

详见 [04d-tech-deployment.md](file:///workspace/docs/tutorial/04d-tech-deployment.md) D4。

---

## D5：PWA 策略

| 项 | 内容 |
|---|---|
| **决策** | 选哪个 PWA 策略 |
| **选项** | 无 PWA / SW stale-while-revalidate / Workbox / 自写 SW |
| **选择** | 自写 Service Worker（stale-while-revalidate + Web Push + periodicsync） |
| **理由** | (1) 完全可控（缓存策略 / 推送 payload / 同步时机）；(2) 无 Workbox 依赖（bundle 小）；(3) periodicsync 后台检查到期复习 |
| **代价** | 自写 SW 要处理生命周期 / 版本管理 / 缓存失效；调试复杂 |

详见 [04d-tech-deployment.md](file:///workspace/docs/tutorial/04d-tech-deployment.md) D5。

---

## 速查索引

| 决策点 | 选择 | 章节 |
|---|---|---|
| F1 框架 | Next.js 15 App Router | [04a](file:///workspace/docs/tutorial/04a-tech-frontend.md) |
| F2 样式 | Tailwind CSS 3.4 | [04a](file:///workspace/docs/tutorial/04a-tech-frontend.md) |
| F3 状态 | useState + Context | [04a](file:///workspace/docs/tutorial/04a-tech-frontend.md) |
| F4 表单 | 统一组件库 + 守护测试 | [04a](file:///workspace/docs/tutorial/04a-tech-frontend.md) |
| F5 图表 | Recharts + 自绘 SVG | [04a](file:///workspace/docs/tutorial/04a-tech-frontend.md) |
| B1 本地 | IndexedDB + Dexie | [04b](file:///workspace/docs/tutorial/04b-tech-backend.md) |
| B2 云端 | Cloudflare KV | [04b](file:///workspace/docs/tutorial/04b-tech-backend.md) |
| B3 同步 | 增量 + LWW + tombstone | [04b](file:///workspace/docs/tutorial/04b-tech-backend.md) |
| B4 API | App Router Route Handlers | [04b](file:///workspace/docs/tutorial/04b-tech-backend.md) |
| B5 校验 | Zod | [04b](file:///workspace/docs/tutorial/04b-tech-backend.md) |
| A1 SDK | Vercel AI SDK | [04c](file:///workspace/docs/tutorial/04c-tech-ai.md) |
| A2 Provider | `@ai-sdk/openai` 适配 | [04c](file:///workspace/docs/tutorial/04c-tech-ai.md) |
| A3 复习 | ts-fsrs 4.5 | [04c](file:///workspace/docs/tutorial/04c-tech-ai.md) |
| A4 向量 | Workers AI BGE | [04c](file:///workspace/docs/tutorial/04c-tech-ai.md) |
| A5 Session | 零信任 session | [04c](file:///workspace/docs/tutorial/04c-tech-ai.md) |
| D1 部署 | Cloudflare Pages | [04d](file:///workspace/docs/tutorial/04d-tech-deployment.md) |
| D2 运行时 | Edge Runtime | [04d](file:///workspace/docs/tutorial/04d-tech-deployment.md) |
| D3 CI/CD | GitHub Actions | [04d](file:///workspace/docs/tutorial/04d-tech-deployment.md) |
| D4 测试 | Vitest 1.6 | [04d](file:///workspace/docs/tutorial/04d-tech-deployment.md) |
| D5 PWA | 自写 SW | [04d](file:///workspace/docs/tutorial/04d-tech-deployment.md) |
