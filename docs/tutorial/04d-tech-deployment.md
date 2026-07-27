# 第 4d 章：技术选型 — 部署与 CI/CD

> **视角**：卡帕西（系统思维 / 第一性原理 / 权衡分析 / Edge Runtime / 零信任 / 成本控制）
> **前置知识**：读完了 [第 4c 章 AI 集成技术选型](file:///workspace/docs/tutorial/04c-tech-ai.md)
> **本章学什么**：
> 1. 部署平台：Cloudflare Pages vs Vercel vs Netlify vs AWS Amplify vs 自建
> 2. 运行时：Edge Runtime vs Node.js vs Deno vs Bun
> 3. CI/CD：GitHub Actions vs GitLab CI vs CircleCI vs Jenkins vs Drone
> 4. 测试框架：Vitest vs Jest vs Bun test vs Node test runner
> 5. PWA 策略：无 PWA vs SW stale-while-revalidate vs Workbox vs 自写 SW
> **预计阅读时间**：35 分钟
> **关联文档**：[.github/workflows/deploy-devpath.yml](file:///workspace/.github/workflows/deploy-devpath.yml) / [wrangler.toml](file:///workspace/wrangler.toml) / [docs/DEVELOPMENT.md](file:///workspace/docs/DEVELOPMENT.md)

---

## 4d.1 基础概念（初学者先读这节）

- **CI/CD**：Continuous Integration / Continuous Deployment，持续集成 / 持续部署。代码 push 后自动跑测试 + 部署。
- **Quality Gate**：质量门禁。CI 流程中"测试 + lint + typecheck"全过才允许部署。
- **Edge Runtime**：运行在 CDN 边缘节点的 JS 运行时，离用户最近，冷启动几乎为零。
- **Node.js**：服务端 JS 运行时，生态最成熟，但有冷启动 + 中心化部署。
- **PWA（Progressive Web App）**：能用 Service Worker 离线工作 + 推送通知 + 装到桌面的网页。
- **Service Worker（SW）**：浏览器后台运行的 JS 脚本，可拦截网络请求 + 缓存 + 推送。
- **stale-while-revalidate**：缓存策略。先返回缓存（stale），同时后台更新（revalidate），下次请求用新缓存。
- **Web Push**：浏览器推送通知 API，需用户授权 + VAPID 密钥。
- **VAPID**：Voluntary Application Server Identification，Web Push 的身份认证机制。
- **Manifest**：PWA 的配置文件（`manifest.json`），定义图标 / 名称 / 主题色 / 启动方式。

---

## 4d.2 D1. 部署平台：Cloudflare Pages

### 决策

选择 **Cloudflare Pages**。

### 背景

devpath-ai 需要部署：
- Next.js 15 App Router（SSR + API Routes）
- Edge Runtime（零冷启动）
- Cloudflare KV（4 namespace）
- Workers AI（向量嵌入）
- PWA（Service Worker + Web Push）
- 自定义域名 + HTTPS

### 对比

| 维度 | Cloudflare Pages | Vercel | Netlify | AWS Amplify | 自建（VPS） |
|---|---|---|---|---|---|
| Edge Runtime | ✅ 原生 | ✅ 原生 | ❌ | ❌ | ❌ |
| 冷启动 | ✅ 零 | ✅ 零 | ❌ 有 | ❌ 有 | ❌ 有 |
| 全球 CDN | ✅ Cloudflare 全球 | ✅ Vercel 全球 | ✅ | ✅ | ❌ 需自配 |
| Next.js 集成 | ✅ next-on-pages | ✅ 原生（最佳） | ✅ | ✅ | ✅ |
| KV / D1 / R2 | ✅ 原生 | ❌（Vercel KV） | ❌ | ❌ | ❌ |
| Workers AI | ✅ 原生 | ❌ | ❌ | ❌ | ❌ |
| 免费额度 | ✅ 500 builds/月 + 无限请求 | ✅ 100GB 带宽 | ✅ 100GB | ✅ 5GB | ❌ |
| 成本（超免费） | ✅ 低 | 中 | 中 | 中 | ❌ 高（VPS + CDN） |
| 自定义域名 | ✅ 免费 + 自动 HTTPS | ✅ | ✅ | ✅ | ❌ 需手动配 |
| 学习曲线 | ✅ 低（git push） | ✅ 低 | ✅ 低 | 中 | ❌ 高 |
| 中国访问 | ✅ 较好（Cloudflare 部分） | ❌ 慢 | ❌ 慢 | ❌ 慢 | 取决于服务器 |

### 选择理由（卡帕西视角）

1. **Edge Runtime 零冷启动**：与 Next.js API Routes Edge Runtime 一致，全球 CDN 边缘节点运行。
2. **与 Cloudflare KV / Workers AI 原生集成**：Binding 直接访问，无跨平台配置。
3. **免费额度足够**：500 builds/月 + 无限请求，devpath-ai 的流量在免费内。
4. **中国访问较好**：Cloudflare 部分节点在中国可访问（Vercel / Netlify 都被墙）。
5. **自定义域名免费 + 自动 HTTPS**：Cloudflare SSL 证书自动签发。
6. **git push 自动部署**：与 GitHub Actions CI 集成，push 到 main 自动触发。

### 代价

- **next-on-pages 适配**：Next.js App Router 需 `@cloudflare/next-on-pages` 适配，有 3MB bundle 限制
- **Node API 限制**：Edge Runtime 不支持 `fs` / `path` / 原生 `crypto`，需 `nodejs_compat` flag + Web Crypto API 封装
- **构建慢**：next-on-pages 构建比 Vercel 慢（~3 分钟 vs ~1 分钟）

### 实现细节

引用自 [wrangler.toml](file:///workspace/wrangler.toml)（简化）：

```toml
name = "devpath-ai"
compatibility_date = "2024-09-01"
compatibility_flags = ["nodejs_compat"]

# 4 个 KV namespace
[[kv_namespaces]]
binding = "DEVPATH_KV"
id = "xxx"

[[kv_namespaces]]
binding = "AUTH_SESSIONS"
id = "xxx"

[[kv_namespaces]]
binding = "AUTH_NONCES"
id = "xxx"

[[kv_namespaces]]
binding = "AUTH_AUDIT"
id = "xxx"

# Workers AI
[ai]
binding = "AI"
```

### 踩过的坑

- **3MB bundle 限制**：preset TS 源文件静态 import 导致 13MB → 改为 fetch JSON 降到 6.5MB
- **nodejs_compat flag**：未启用时 `Buffer` / `crypto.subtle` 报错。在 `wrangler.toml` 加 `compatibility_flags = ["nodejs_compat"]`
- **构建超时**：Cloudflare Pages 构建限 20 分钟，大型项目需优化构建。devpath-ai 用增量构建 + 缓存。

---

## 4d.3 D2. 运行时：Edge Runtime + nodejs_compat

### 决策

选择 **Edge Runtime + nodejs_compat flag**。

### 背景

devpath-ai 的 API Routes 需要：
- 零冷启动（AI 调用响应快）
- 全球 CDN（离用户近）
- Web Crypto API（AES-GCM / HMAC-SHA256 加密）
- 与 Cloudflare KV / Workers AI 原生集成

### 对比

| 维度 | Edge Runtime | Node.js | Deno | Bun |
|---|---|---|---|---|
| 冷启动 | ✅ 零 | ❌ 有 | ❌ 有 | ❌ 有 |
| 部署位置 | ✅ 全球 Edge | 中心化 | 中心化 | 中心化 |
| Node API 支持 | ⚠️ nodejs_compat | ✅ 完整 | ✅ 兼容 | ✅ 兼容 |
| Web Crypto API | ✅ 原生 | ⚠️ 实验性 | ✅ | ✅ |
| TypeScript | ✅ 原生 | ❌（需 tsc） | ✅ 原生 | ✅ 原生 |
| Bundle 限制 | ⚠️ 3MB（Pages） | ❌ 无 | ❌ 无 | ❌ 无 |
| 生态成熟度 | 中（新） | ✅ 最大 | 中 | 新 |
| 与 Cloudflare 集成 | ✅ 原生 | ❌ | ❌ | ❌ |
| 学习曲线 | 中 | ✅ 低 | 中 | 中 |

### 选择理由（卡帕西视角）

1. **零冷启动**：Edge Runtime 启动时间 < 5ms，AI 调用响应快。Node.js 冷启动 1-3 秒。
2. **全球 Edge**：用户离最近节点近，延迟低。Node.js 中心化部署，远地用户延迟高。
3. **Web Crypto API 原生**：AES-GCM / HMAC-SHA256 是零信任 session 的基础，Edge Runtime 原生支持。
4. **与 Cloudflare 原生集成**：KV / Workers AI 通过 Binding 直接访问，无网络开销。
5. **nodejs_compat flag 解决 Node API 限制**：能用 `Buffer` / `process.env` 等部分 Node API。

### 代价

- **Node API 限制**：不能用 `fs` / `path` / `crypto`（原生），需 Web Crypto API 封装
- **3MB bundle 限制**：重库需懒加载，preset 数据需 fetch JSON 而非 import
- **生态较新**：部分 npm 包不兼容 Edge Runtime，需筛选

### 实现细节

```typescript
// app/api/chat/route.ts
export const runtime = 'edge';  // 显式声明 Edge Runtime

export async function POST(req: Request) {
  // 用 Web Crypto API（非 Node crypto）
  const key = await crypto.subtle.importKey(...);
  const encrypted = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, data);
  // ...
}
```

### 踩过的坑

- **Edge Runtime 不支持 `fs`**：preset 数据早期 `import` 静态加载 TS 源文件，bundle 爆炸。改为运行时 `fetch('/data/presets/{id}.json')`。
- **`crypto` vs `crypto.subtle`**：Node.js `crypto` 与 Edge Runtime `crypto.subtle` API 不同，需 `lib/ai/crypto.ts` 统一封装。
- **`process.env` 在 Edge Runtime**：需 `nodejs_compat` flag，且只有构建时注入的 env 可用。

---

## 4d.4 D3. CI/CD：GitHub Actions

### 决策

选择 **GitHub Actions**（quality-gate → deploy 两段）。

### 背景

devpath-ai 需要：
- push 到 main 自动触发部署
- 部署前必跑测试 + lint + typecheck（quality-gate）
- quality-gate 失败则不部署
- 与 Cloudflare Pages 集成

### 对比

| 维度 | GitHub Actions | GitLab CI | CircleCI | Jenkins | Drone |
|---|---|---|---|---|---|
| 与 GitHub 集成 | ✅ 原生 | ❌ | ❌ | ❌ | ❌ |
| 免费额度 | ✅ 2000 分钟/月 | ✅ 400 分钟/月 | ✅ 6000 分钟/月 | ❌ 自建 | ❌ 自建 |
| YAML 配置 | ✅ | ✅ | ✅ | ❌（Groovy） | ✅ |
| 并行 job | ✅ | ✅ | ✅ | ✅ | ✅ |
| 自定义 action 市场 | ✅ 大 | 中 | 中 | ❌ | ❌ |
| 学习曲线 | ✅ 低 | ✅ 低 | 中 | ❌ 高 | 中 |
| 自托管 runner | ✅ | ✅ | ✅ | ✅ | ✅ |

### 选择理由（卡帕西视角）

1. **与 GitHub 原生集成**：代码在 GitHub，CI 也在 GitHub，无需跨平台配置。
2. **免费额度足够**：2000 分钟/月，devpath-ai 的 CI 跑 ~5 分钟，每月 ~150 分钟够用。
3. **YAML 配置简单**：声明式 YAML，读改都方便。
4. **自定义 action 市场**：`actions/checkout` / `actions/setup-node` 等官方 action 开箱即用。
5. **两段 CI 设计**：quality-gate job 通过后才跑 deploy job，质量门禁强制。

### 代价

- **免费额度限制**：私有仓库 2000 分钟/月，公开仓库无限。devpath-ai 是公开仓库，无限制。
- **运行环境限制**：GitHub-hosted runner 2 核 7GB，大型构建慢。devpath-ai 的构建 ~3 分钟可接受。
- **YAML 调试难**：语法错误需重跑 job 才发现。用 `act` 本地跑缓解。

### 实现细节

引用自 [.github/workflows/deploy-devpath.yml](file:///workspace/.github/workflows/deploy-devpath.yml)（简化）：

```yaml
name: Deploy to Cloudflare Pages

on:
  push:
    branches: [main]

jobs:
  quality-gate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
      - run: npm ci
      - run: npm run lint            # ESLint --max-warnings 0
      - run: npm run typecheck       # TypeScript 严格模式
      - run: npm test                # Vitest 986 用例
      - run: npm run content:validate  # 课程图谱 G1-G7 校验
  
  deploy:
    needs: quality-gate              # 必须等 quality-gate 通过
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
      - run: npm ci
      - run: npm run build
      - name: Deploy to Cloudflare Pages
        uses: cloudflare/pages-action@v1
        with:
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          accountId: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
          projectName: devpath-ai
          directory: out
```

### 踩过的坑

- **ESLint warning 溜进 CI**：早期 `npm run lint` 未带 `--max-warnings 0`，warning 退出 0，错误溜进 main。改为强制 0 warning。
- **本地反馈链断裂**：开发者本地不跑 lint，CI 才发现。引入 `scripts/install-git-hooks.sh` pre-commit hook。

---

## 4d.5 D4. 测试框架：Vitest 1.6

### 决策

选择 **Vitest 1.6**（986 单测 / 77 个测试文件）+ **Playwright E2E**。

### 背景

devpath-ai 需要测试：
- 986 个单元测试（FSRS / 节奏引擎 / 优先级 / 同步 / 加密 等）
- 5+ 个守护测试（原生表单 / 设计令牌 / 暗色配对 / Prompt 指纹 / Preset 质量）
- E2E 测试（主流程：登录 / 学习 / 复习 / 同步）
- 性能基准测试

### 对比

| 维度 | Vitest | Jest | Bun test | Node test runner |
|---|---|---|---|---|
| 与 Vite 集成 | ✅ 原生 | ❌（需配置） | - | - |
| 与 Next.js 集成 | ✅ | ✅（默认） | - | - |
| TypeScript | ✅ 原生 | ⚠️（需 ts-jest） | ✅ | ✅ |
| ESM 支持 | ✅ 原生 | ❌（需配置） | ✅ | ✅ |
| 速度 | ✅ 快（Vite 转译） | ❌ 慢（babel） | ✅ 最快 | ✅ 快 |
| Watch 模式 | ✅ 快（HMR） | ✅ | ✅ | ✅ |
| Snapshot | ✅ | ✅ | ❌ | ✅ |
| Coverage | ✅（v8） | ✅（istanbul） | ❌ | ✅ |
| 守护测试友好 | ✅（API 灵活） | ✅ | ⚠️ | ⚠️ |
| 学习曲线 | ✅ 低（与 Jest API 兼容） | ✅ 低 | ✅ 低 | ✅ 低 |

### 选择理由（卡帕西视角）

1. **与 Vite/Next.js 原生集成**：Vitest 用 Vite 转译，与 Next.js 开发环境一致，无需额外配置。
2. **速度快**：Vitest 用 Vite 的 esbuild 转译，比 Jest 的 babel 快 5-10 倍。986 用例 ~30 秒跑完。
3. **ESM 原生支持**：devpath-ai 用 ESM，Vitest 原生支持，Jest 需配置。
4. **TypeScript 原生**：无需 ts-jest，直接跑 `.ts` 测试文件。
5. **Jest API 兼容**：`describe` / `it` / `expect` / `beforeEach` 等 API 与 Jest 一致，迁移成本低。
6. **守护测试友好**：Vitest 的 API 灵活，能扫描文件 + 正则匹配 + 自定义 matcher。
7. **Coverage 用 v8**：比 istanbul 快，且支持 ESM。

### 代价

- **生态比 Jest 小**：部分 Jest 插件不兼容（如 jest-styled-components）。devpath-ai 不用这些。
- **Watch 模式偶发卡顿**：大型项目 watch 重启慢。devpath-ai 可接受。
- **Playwright E2E 分离**：Vitest 跑单测，E2E 用 Playwright（不在 Vitest 内）。

### 实现细节

守护测试示例（[__tests__/no-native-form-elements.test.ts](file:///workspace/__tests__/no-native-form-elements.test.ts) 简化）：

```typescript
import { describe, it, expect } from 'vitest';
import { glob } from 'glob';
import { readFile } from 'fs/promises';

describe('UI 编码强制规则', () => {
  it('不允许在 components/ui/ 之外使用原生 <input>/<select>/<textarea>/<button>', async () => {
    const files = await glob('**/*.tsx', { ignore: ['components/ui/**', 'node_modules/**'] });
    const violations: string[] = [];
    
    for (const file of files) {
      const content = await readFile(file, 'utf-8');
      // 正则匹配原生表单元素
      if (/<(input|select|textarea|button)\b/.test(content)) {
        violations.push(file);
      }
    }
    
    expect(violations).toEqual([]);
  });
});
```

### 踩过的坑

- **Vitest + Edge Runtime API**：测试 `crypto.subtle` 需 jsdom 环境配 `webcrypto` polyfill
- **测试速度退化**：早期 986 用例 60 秒，优化 import 后降到 30 秒

---

## 4d.6 D5. PWA 策略：自写 Service Worker + Web Push

### 决策

选择 **自写 Service Worker**（stale-while-revalidate + Web Push + periodicsync）。

### 背景

devpath-ai 是本地优先 PWA，需要：
- 离线可用（学习数据在 IndexedDB，但静态资源需缓存）
- 推送通知（到期复习提醒 + 断卡回归提醒）
- 后台同步（periodicsync 检查到期卡片）
- 可安装到桌面（manifest）

### 对比

| 维度 | 无 PWA | SW stale-while-revalidate | Workbox | 自写 SW（本项目） |
|---|---|---|---|---|
| 离线可用 | ❌ | ✅ | ✅ | ✅ |
| 推送通知 | ❌ | ❌ | ❌ | ✅ |
| 后台同步 | ❌ | ❌ | ❌ | ✅ |
| 可安装 | ❌ | ⚠️（需 manifest） | ⚠️ | ✅ |
| Bundle 体积 | ✅ 0 | ✅ 0（SW 不计入） | ❌ 大（~50KB） | ✅ 0 |
| 学习曲线 | - | ✅ 低 | 中 | 中 |
| 灵活性 | - | ❌ 低 | 中 | ✅ 高 |
| 维护成本 | ✅ 0 | 中 | ✅ 低（Google 维护） | ❌ 高（自维护） |

### 选择理由（卡帕西视角）

1. **完全控制**：自写 SW 能精确控制缓存策略 + 推送逻辑 + 后台同步。Workbox 抽象太重，难以定制。
2. **bundle 体积 0**：SW 文件不计入主 bundle，自写不影响首屏。Workbox ~50KB。
3. **stale-while-revalidate 策略**：先返回缓存（stale），同时后台更新（revalidate），下次请求用新缓存。兼顾速度和新鲜度。
4. **Web Push + periodicsync**：到期复习提醒 + 断卡回归提醒。Workbox 不直接支持 periodicsync。
5. **manifest 配置**：`public/manifest.json` 定义图标 / 名称 / 主题色 / 启动方式，让网页能装到桌面。

### 代价

- **维护成本高**：SW 生命周期（install / activate / fetch / push / periodicsync）需手写，bug 难调试
- **破坏性更新风险**：SW 更新不当会导致用户卡在旧版本。需 `self.skipWaiting()` + `clients.claim()` 谨慎处理
- **浏览器兼容性**：periodicsync 仅 Chrome 支持，Safari / Firefox 不可用。需降级

### 实现细节

引用自 [public/sw.js](file:///workspace/public/sw.js)（简化）：

```javascript
// 安装：预缓存关键资源
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open('v1').then((cache) => cache.addAll(['/', '/manifest.json']))
  );
  self.skipWaiting();  // 立即激活新版本
});

// 激活：清理旧缓存
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => 
      Promise.all(keys.filter(k => k !== 'v1').map(k => caches.delete(k)))
    )
  );
  clients.claim();  // 立即控制所有客户端
});

// fetch：stale-while-revalidate
self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then((cached) => {
      const fetchPromise = fetch(e.request).then((response) => {
        caches.open('v1').then((cache) => cache.put(e.request, response.clone()));
        return response;
      });
      return cached || fetchPromise;  // 先返回缓存，同时后台更新
    })
  );
});

// 推送通知
self.addEventListener('push', (e) => {
  const data = e.data.json();
  e.waitUntil(
    self.registration.showNotification(data.title, { body: data.body })
  );
});

// 后台同步（到期复习提醒）
self.addEventListener('periodicsync', (e) => {
  if (e.tag === 'check-due-cards') {
    e.waitUntil(checkDueCardsAndNotify());
  }
});
```

### 踩过的坑

- **SW 更新卡死**：早期未 `self.skipWaiting()`，用户卡在旧版本。改为立即激活新版本。
- **缓存清理遗漏**：新版本发布后旧缓存未清理，占用空间。`activate` 事件清理旧版本。
- **periodicsync 仅 Chrome**：Safari / Firefox 不支持，需降级到推送通知或用户主动打开。
- **Web Push 需 VAPID 密钥**：需生成 `NEXT_PUBLIC_VAPID_PUBLIC_KEY` + `VAPID_PRIVATE_KEY`，配置在 Cloudflare Pages Secrets。

---

## 4d.7 章节小结：部署技术栈一览

| 层 | 选型 | 理由 |
|---|---|---|
| 部署平台 | Cloudflare Pages | Edge Runtime + KV 原生 + 中国访问较好 + 免费 |
| 运行时 | Edge Runtime + nodejs_compat | 零冷启动 + 全球 Edge + Web Crypto 原生 |
| CI/CD | GitHub Actions | 与 GitHub 原生 + 免费 + quality-gate 两段 |
| 测试框架 | Vitest 1.6 + Playwright | 速度快 + ESM + TS 原生 + 守护测试友好 |
| PWA | 自写 SW + Web Push | 完全控制 + bundle 0 + stale-while-revalidate |

---

## 本章小结

**学到了什么**：
1. Cloudflare Pages 的选择理由：Edge Runtime + KV 原生 + 中国访问较好，代价是 next-on-pages 3MB 限制
2. Edge Runtime 的选择理由：零冷启动 + 全球 Edge + Web Crypto 原生，代价是 Node API 限制
3. GitHub Actions 的选择理由：与 GitHub 原生 + 免费 + quality-gate 两段设计
4. Vitest 的选择理由：速度快 + ESM + TS 原生 + 守护测试友好，代价是生态比 Jest 小
5. 自写 SW 的选择理由：完全控制 + bundle 0 + stale-while-revalidate，代价是维护成本高

**关键决策回顾**：
1. **quality-gate 两段设计**：lint + typecheck + test 全过才部署
2. **nodejs_compat flag**：解决 Edge Runtime 的 Node API 限制
3. **守护测试强制**：Vitest 扫描文件 + 正则匹配 + 自定义 matcher
4. **stale-while-revalidate**：先返回缓存，同时后台更新，兼顾速度和新鲜度

## 下一章衔接

下一章 [05-standards.md](file:///workspace/docs/tutorial/05-standards.md) 讲规范约束制定：AGENTS.md 的地位 + 13 条 UI 强制规则 + 守护测试清单 + 设计令牌 + 三层质量护栏。

## 延伸阅读

- [Cloudflare Pages 文档](https://developers.cloudflare.com/pages/)
- [GitHub Actions 文档](https://docs.github.com/actions)
- [Vitest 文档](https://vitest.dev/)
- [Web.dev: PWA](https://web.dev/learn/pwa/)
