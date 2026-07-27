# 第 8 章 部署与上线

> **视角**：卡帕西（工程视角，关注可重复、可观测、可回滚）
> **预计阅读时间**：18 分钟
> **前置知识**：第 4d 章部署技术选型、第 5 章规范约束
> **学习目标**：理解 devpath-ai 如何从一行代码变成 https://devpath-ai.pages.dev/ 上的生产服务，包括 CI/CD 流水线、Secrets 配置、KV 命名空间、域名 HTTPS、本地验证流程。

---

## 部署架构总览

```
开发者 push 到 main
        ↓
GitHub Actions 触发 deploy-devpath.yml
        ↓
┌─────────────────────────────────────┐
│  Job 1: quality-gate (ubuntu-latest) │
│  ─ npm ci                            │
│  ─ npm run lint (--max-warnings 0)   │
│  ─ npm run typecheck                 │
│  ─ npm test (Vitest 986 单测)        │
└─────────────────────────────────────┘
        ↓ (失败则阻断 deploy)
┌─────────────────────────────────────┐
│  Job 2: deploy (ubuntu-latest)       │
│  ─ npm ci                            │
│  ─ npm run build (Next.js 构建)      │
│  ─ npx @cloudflare/next-on-pages     │
│      (转 Edge Runtime 产物)          │
│  ─ 校验 CLOUDFLARE_API_TOKEN/        │
│      CLOUDFLARE_ACCOUNT_ID 存在       │
│  ─ wrangler pages project create     │
│      (idempotent，已存在则跳过)       │
│  ─ wrangler pages deploy             │
│      .vercel/output/static           │
│      --project-name=devpath-ai       │
└─────────────────────────────────────┘
        ↓
Cloudflare Pages 边缘网络
https://devpath-ai.pages.dev/
        ↓
绑定 4 个 KV namespace + Workers AI binding
        ↓
首次请求冷启动 → 后续边缘缓存命中
```

**核心设计原则**：
1. **两段而非一段**：quality-gate 失败时不浪费 deploy 的构建时间
2. **幂等**：`wrangler pages project create` 已存在则跳过，不会因项目已存在而失败
3. **Secret 校验前置**：deploy job 第一步校验 `CLOUDFLARE_API_TOKEN` 和 `CLOUDFLARE_ACCOUNT_ID` 存在，缺失则 fail fast 而非构建到一半才失败
4. **路径触发**：只监听 `app/**` / `components/**` / `lib/**` / `functions/**` / `public/**` / `package.json` 等业务路径，改 README 或 docs 不触发部署

---

## CI/CD 流水线详解

流水线定义在 [.github/workflows/deploy-devpath.yml](file:///workspace/.github/workflows/deploy-devpath.yml)。

### 触发条件

```yaml
on:
  push:
    branches: [main, develop]
    paths:
      - "app/**"
      - "components/**"
      - "lib/**"
      - "functions/**"
      - "public/**"
      - "package.json"
      - "package-lock.json"
      - "next.config.js"
      - ".github/workflows/deploy-devpath.yml"
  workflow_dispatch:  # 手动触发（用于紧急回滚或重跑）
```

**为什么监听 `develop` 分支**：develop 用于预发布验证——main 是生产，develop 是预览。Cloudflare Pages 会自动给 develop 分支的部署分配 `dev.devpath-ai.pages.dev` 子域名（预览环境），不污染生产数据（KV 用 `preview_id`）。

**为什么用 `paths` 过滤**：避免改文档或测试就触发部署。代价是改了 `next.config.js` 但没改业务代码时会触发（罕见），收益是节省 CI 资源。

### Job 1: quality-gate

```yaml
quality-gate:
  name: Quality Gate (lint + typecheck + test)
  runs-on: ubuntu-latest
  steps:
    - uses: actions/checkout@v4
    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: "22"
        cache: "npm"
        cache-dependency-path: package-lock.json
    - name: Install dependencies
      run: npm ci
    - name: ESLint
      run: npm run lint
    - name: TypeScript Typecheck
      run: npm run typecheck
    - name: Unit Tests
      run: npm test
```

**关键点**：
- `node-version: "22"`：与本地开发环境一致，避免 Node 版本差异导致构建行为不一致
- `cache: "npm"`：缓存 `~/.npm`，加速 `npm ci`。`cache-dependency-path: package-lock.json` 确保 lock 文件变了才重建缓存
- `npm ci` 而非 `npm install`：严格按 lock 文件安装，不更新依赖，保证可重复构建
- `npm run lint` 内部是 `next lint --max-warnings 0`（Phase 8 强化），warning 当 error
- `npm test` 跑 Vitest 986 单测，包括 16 个守护测试

### Job 2: deploy

```yaml
deploy:
  name: Build & Deploy
  runs-on: ubuntu-latest
  needs: quality-gate  # 等 quality-gate 通过
  steps:
    - uses: actions/checkout@v4
    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: "22"
        cache: "npm"
        cache-dependency-path: package-lock.json
    - name: Install dependencies
      run: npm ci
    - name: Build Next.js
      run: npm run build
      env:
        NEXT_TELEMETRY_DISABLED: "1"
    - name: Build for Cloudflare Pages
      run: npx @cloudflare/next-on-pages
      env:
        NEXT_TELEMETRY_DISABLED: "1"
```

**两段构建的原因**：
1. `npm run build`：Next.js 标准构建，产出 `.next/` 目录（Node.js 产物）
2. `npx @cloudflare/next-on-pages`：把 Next.js 产物转换成 Cloudflare Pages 兼容的 Edge Runtime 产物，输出到 `.vercel/output/static/`

**为什么需要 `@cloudflare/next-on-pages`**：Next.js 15 App Router 默认产出 Node.js Runtime 产物，但 Cloudflare Pages 只支持 Edge Runtime（基于 V8 isolates，不是 Node.js）。`@cloudflare/next-on-pages` 做了三件事：
- 把 Node.js API 调用替换成 Edge Runtime 等价物（如 `Buffer` → `Uint8Array`）
- 启用 `nodejs_compat` flag（在 wrangler.toml 配置），允许部分 Node.js polyfill
- 重新组织路由结构，匹配 Cloudflare Pages 的 `functions/` 约定

**`NEXT_TELEMETRY_DISABLED: "1"`**：禁用 Next.js 遥测，避免 CI 环境数据污染。

### Secrets 校验

```yaml
- name: Verify Cloudflare Secrets
  env:
    CF_API_TOKEN: ${{ secrets.CLOUDFLARE_API_TOKEN }}
    CF_ACCOUNT_ID: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
  run: |
    echo "API Token set: $([[ -n "$CF_API_TOKEN" ]] && echo 'YES' || echo 'NO - MISSING!')"
    echo "Account ID set: $([[ -n "$CF_ACCOUNT_ID" ]] && echo 'YES' || echo 'NO - MISSING!')"
    echo "Account ID value: ${CF_ACCOUNT_ID:0:4}****${CF_ACCOUNT_ID: -4}"
    if [[ -z "$CF_API_TOKEN" || -z "$CF_ACCOUNT_ID" ]]; then
      echo "::error::CLOUDFLARE_API_TOKEN or CLOUDFLARE_ACCOUNT_ID secret is missing!"
      exit 1
    fi
```

**为什么 fail fast**：如果 Secret 缺失，构建已经完成但部署会失败——浪费 5 分钟构建时间。提前校验，缺失立即退出，节省 CI 资源。

**为什么打印 Account ID 的前后 4 位**：调试用——确认 Secret 真的被注入了，但又不泄露完整值。Token 不打印任何位（更敏感）。

### 部署到 Cloudflare Pages

```yaml
- name: Ensure Pages Project Exists
  env:
    CLOUDFLARE_API_TOKEN: ${{ secrets.CLOUDFLARE_API_TOKEN }}
    CLOUDFLARE_ACCOUNT_ID: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
  run: |
    echo "Ensuring project 'devpath-ai' exists..."
    npx wrangler pages project create devpath-ai --production-branch=main 2>&1 || echo "Project may already exist, continuing..."

- name: Deploy to Cloudflare Pages
  uses: cloudflare/wrangler-action@v3
  with:
    apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
    accountId: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
    command: pages deploy .vercel/output/static --project-name=devpath-ai --commit-dirty=true
```

**`--commit-dirty=true` 的作用**：允许工作区有未提交的改动时部署。CI 环境一般干净，但 `@cloudflare/next-on-pages` 会在 `.vercel/output/` 生成产物，wrangler 会检测到"工作区脏"，加这个 flag 跳过检查。

**为什么用 `cloudflare/wrangler-action@v3` 而非裸 `npx wrangler`**：action 封装了错误处理、重试、日志格式化。裸 `npx wrangler` 失败时日志难读。

---

## Secrets 与环境变量配置

### GitHub Secrets（CI 用）

在 GitHub 仓库 `Settings > Secrets and variables > Actions` 配置：

| Secret 名 | 用途 | 获取方式 |
|---|---|---|
| `CLOUDFLARE_API_TOKEN` | wrangler 鉴权 | Cloudflare Dashboard > My Profile > API Tokens > Create Token > "Edit Cloudflare Workers" 模板 |
| `CLOUDFLARE_ACCOUNT_ID` | 标识账户 | Cloudflare Dashboard 右下角 Account ID |

**为什么是 Secrets 而非 Variables**：Secrets 加密存储且日志自动脱敏（`***`），Variables 明文存储。API Token 必须是 Secret。

### Cloudflare Pages Secrets（运行时用）

通过 `wrangler pages secret put <NAME> --project-name=devpath-ai` 上传：

| Secret 名 | 用途 | 生成方式 |
|---|---|---|
| `MASTER_KEY` | 加密会话根密钥（32 字节 base64） | `openssl rand -base64 32` |
| `DEEPSEEK_API_KEY` | DeepSeek API Key（Trial 模式用） | DeepSeek 平台 |
| `GLM_API_KEY` | 智谱 GLM API Key（Trial 模式用） | 智谱开放平台 |
| `NEXT_PUBLIC_VAPID_PUBLIC_KEY` | Web Push VAPID 公钥（可选） | `npx web-push generate-vapid-keys` |

**`MASTER_KEY` 是关键**：零信任 session 的根密钥，AES-GCM 加密 apiKey 时用。**必须配置**，否则 session 加密无法工作。Phase 8 零信任 session 设计的核心。

**为什么 `NEXT_PUBLIC_VAPID_PUBLIC_KEY` 是 `NEXT_PUBLIC_` 前缀**：Next.js 约定，`NEXT_PUBLIC_` 前缀的环境变量会暴露给客户端（构建时内联）。VAPID 公钥本就是公开的（客户端用公钥订阅，服务端用私钥推送），所以放客户端无妨。

### wrangler.toml 中的 vars（非敏感配置）

```toml
[vars]
AI_PROVIDER = "deepseek"
```

**为什么 `AI_PROVIDER` 是 vars 而非 Secret**：默认 provider 是公开信息（用户能看到默认用哪个模型），不是敏感数据。vars 在 wrangler.toml 明文存储，构建时注入。

---

## KV 命名空间配置

[wrangler.toml](file:///workspace/wrangler.toml) 定义了 4 个 KV namespace：

```toml
[[kv_namespaces]]
binding = "KV"
id = "086d793456e5425bacb04836da93ad9b"
preview_id = "preview-kv-namespace-placeholder"

[[kv_namespaces]]
binding = "AUTH_SESSIONS"
id = "ff753a3ce9664d93a79f2e25c36f3433"

[[kv_namespaces]]
binding = "AUTH_NONCES"
id = "02684817b6884df4a1eb48416426cf07"

[[kv_namespaces]]
binding = "AUTH_AUDIT"
id = "31f90bc37a644f55902e1a8b4ebce13f"
```

### 4 个 namespace 的职责

| Binding | 职责 | TTL 策略 | 为什么独立 |
|---|---|---|---|
| `KV` | 业务数据（学习计划 / FSRS 卡片 / 能量样本 / 用户画像 / 学习日志 / 公开主页） | 无 TTL（用户数据永久存） | 业务数据量大，不能被安全数据污染 |
| `AUTH_SESSIONS` | 零信任 session token | 7d 滑动续期 | session 有独立生命周期，登出时 `revokeSession` 直接清空 |
| `AUTH_NONCES` | 防重放 nonce | 5min 一次性消费 | nonce 必须短期失效，独立 TTL 管理 |
| `AUTH_AUDIT` | 安全审计日志 | 30d 保留 | 审计日志不能被业务操作删除 |

**为什么 4 个而非 1 个**：Phase 8 零信任 session 设计的核心决策——安全边界清晰。如果都塞进 `KV`，一次误操作（如清空业务数据）会连带清空 session；独立 namespace 则天然隔离。

**`preview_id` 的作用**：预览环境（develop 分支部署）用独立 namespace，避免污染生产数据。`preview-kv-namespace-placeholder` 是占位符，实际创建预览 namespace 后替换成真实 id。

### Workers AI binding

```toml
[ai]
binding = "AI"
```

**作用**：知识库向量化（Phase 11）调用 Workers AI `bge-base-en-v1.5` 嵌入查询文本。代码里通过 `getRequestContext().env.AI.run(...)` 访问。

**为什么是 `[ai]` 而非 `[[ai]]`**：wrangler 4.x 要求对象形式，数组形式会报错 `The field 'ai' should be an object but got [...]`。这是踩过的坑——注释里特意写明。

---

## 域名与 HTTPS

### 默认域名

Cloudflare Pages 自动分配：
- 生产：`https://devpath-ai.pages.dev/`
- 预览：`https://dev.devpath-ai.pages.dev/`（develop 分支）
- 每次 PR 自动分配预览域名

### HTTPS 自动配置

Cloudflare 自动签发 SSL 证书，无需手动配置。HTTP 自动重定向 HTTPS。

**为什么不用自定义域名**：devpath-ai 是工具产品，`pages.dev` 子域名足够。如果要绑定自定义域名（如 `devpath.ai`），在 Cloudflare Dashboard > Pages > devpath-ai > Custom domains 添加，Cloudflare 自动签发证书。

---

## 本地验证流程

部署前在本地验证，避免 CI 失败浪费构建时间。

### 1. 跑 quality-gate 等价命令

```bash
npm run lint       # ESLint (--max-warnings 0)
npm run typecheck  # TypeScript 类型检查
npm test           # Vitest 986 单测
```

三个都通过才考虑 push。本地失败比 CI 失败快 10 倍。

### 2. 本地构建验证

```bash
npm run build                              # Next.js 构建
npx @cloudflare/next-on-pages              # 转 Edge Runtime 产物
npx wrangler pages dev .vercel/output/static  # 本地预览
```

`wrangler pages dev` 启动本地 Cloudflare Pages 模拟环境，包括 KV / Workers AI binding（用本地 Miniflare 模拟）。可以验证 Edge Runtime 兼容性——某些 Node.js API（如 `Buffer` / `process`）在 Edge 下行为不同。

### 3. 预览部署验证

push 到 `develop` 分支会自动部署到预览环境 `https://dev.devpath-ai.pages.dev/`，用真实 Cloudflare KV（preview_id）和真实 Workers AI。在预览环境跑一遍核心流程（创建计划 / 复习 / 聊天 / 番茄钟）再合并到 main。

---

## 部署失败排查

### 常见失败 1：quality-gate 失败

**现象**：Job 1 红灯，Job 2 不触发。

**排查**：
- 看 Job 1 日志，定位是 lint / typecheck / test 哪个失败
- lint 失败：本地跑 `npm run lint` 复现，修 warning
- typecheck 失败：本地跑 `npm run typecheck` 复现，修类型错误
- test 失败：看是哪个测试文件，本地跑 `npx vitest run <file>` 复现

### 常见失败 2：Secret 缺失

**现象**：Job 2 在 "Verify Cloudflare Secrets" 步骤失败，日志 `CLOUDFLARE_API_TOKEN or CLOUDFLARE_ACCOUNT_ID secret is missing!`。

**修复**：在 GitHub 仓库 `Settings > Secrets and variables > Actions` 添加对应 Secret。

### 常见失败 3：`@cloudflare/next-on-pages` 失败

**现象**：Job 2 在 "Build for Cloudflare Pages" 步骤失败。

**常见原因**：
- 用了 Edge Runtime 不支持的 Node.js API（如 `fs` / `crypto` 的某些方法）
- 第三方依赖用了 Node.js 原生模块（如 `Buffer`）
- `next.config.js` 配置了 `runtime: 'nodejs'` 而非 `runtime: 'edge'`

**排查**：看构建日志，定位是哪个文件 / 哪个 API。本地跑 `npx @cloudflare/next-on-pages --watch` 实时看错误。

### 常见失败 4：wrangler 部署失败

**现象**：Job 2 在 "Deploy to Cloudflare Pages" 步骤失败。

**常见原因**：
- API Token 权限不足（需要 "Edit Cloudflare Workers" 模板）
- Account ID 错误
- Pages project 名拼写错误（必须是 `devpath-ai`）
- 部署产物超过 Cloudflare Pages 限制（25MB / 文件，25000 文件总数）

**排查**：看 wrangler 报错。权限问题去 Cloudflare Dashboard 重新生成 Token。

---

## 部署历史中的关键决策

### 决策 1：Cloudflare Pages 而非 Vercel

详见 [04d-tech-deployment.md](file:///workspace/docs/tutorial/04d-tech-deployment.md) D1 决策点。核心原因：
- 本地优先 PWA + Cloudflare KV 同步的架构自洽
- KV 在 Cloudflare 边缘网络，延迟低
- 免费额度足够（500 builds/月，无限请求）
- Workers AI 直接 binding，无需额外 API 调用

### 决策 2：两段 CI 而非一段

详见 Phase 5 迭代史。核心原因：quality-gate 失败时不浪费 deploy 的构建时间。

### 决策 3：`@cloudflare/next-on-pages` 而非 Pages Functions 原生

详见 [04d-tech-deployment.md](file:///workspace/docs/tutorial/04d-tech-deployment.md) D4 决策点。核心原因：Next.js App Router 的 Server Components / Route Handlers 已经是路由系统，用 `@cloudflare/next-on-pages` 转换比手写 Pages Functions 更省事。

### 决策 4：Preset 数据从静态 import 改为运行时 fetch

**背景**：Phase 13 之前，preset 数据（学习计划 + 知识点 + 面试题）是静态 `import` TS 源文件，打包进 bundle。Phase 13 后 preset 增到 6 个，bundle 13MB 超过 Cloudflare Pages 3MB 限制。

**决策**：改为运行时 `fetch('/data/presets/{id}.json')`，JSON 数据放 `public/data/`，构建期由 `scripts/export-presets.ts` 从 TS 源生成。bundle 从 13MB 降到 6.5MB，通过 Cloudflare Pages 限制。

**代价**：首次加载多一次 HTTP 请求（按需加载，不影响首屏）。**收益**：bundle 通过限制，preset 数据可独立缓存（HTTP 缓存 + Service Worker stale-while-revalidate）。

---

## 监控与可观测性

部署成功不等于运行正常。devpath-ai 的可观测性有 3 层：

### 1. Cloudflare Dashboard

- Pages 部署历史（每次部署的 commit / 触发分支 / 部署时长 / 状态）
- KV 操作统计（读取 / 写入 / 删除次数）
- Workers AI 调用次数 / 错误率
- 边缘缓存命中率

### 2. 应用内 AI 质量看板

`/stats/ai-quality` 页面统计：
- 按场景统计调用数 / 采纳率 / 再生成率 / 平均耗时
- Prompt 版本对比
- 失败模式聚类
- Token 总量 + 估算成本（按模型定价表）

数据来源：`lib/ai/quality-tracker.ts` + `lib/ai/observability.ts` + `lib/ai/trace.ts`。

### 3. AUTH_AUDIT KV namespace

零信任 session 的审计日志：
- session 创建 / 续期 / 吊销
- nonce 消费
- 异常时间窗请求（±60s 外的）

30d 保留，用于事后排查安全事件。

---

## 回滚策略

### 快速回滚（推荐）

Cloudflare Pages 支持一键回滚到任意历史部署：

1. Cloudflare Dashboard > Pages > devpath-ai > Deployments
2. 找到上一个绿色部署，点 "Promote to production"
3. 立即生效（边缘缓存秒级更新）

**适用场景**：上线后发现 bug，需要立即回滚。

### Git revert + 重新部署

```bash
git revert <bad-commit>
git push origin main
# 触发 CI 重新部署
```

**适用场景**：bug 已经污染了 KV 数据，需要代码层面撤销（如错误的 migration）。

### KV 数据回滚

KV 没有原生版本控制，但有 `backup` API：

```bash
npx wrangler kv key list --binding=KV
npx wrangler kv key get --binding=KV "<key>" > backup.json
```

**适用场景**：误删数据。但更好的策略是 Phase 9 的 tombstone（删除标记而非物理删除），30d 内可恢复。

---

## 小结

部署不是"代码 push 上去就完事"，是一个工程系统：
- **CI/CD 流水线**：两段（quality-gate → deploy），fail fast，幂等
- **Secrets 管理**：GitHub Secrets（CI 用）+ Cloudflare Pages Secrets（运行时用）+ vars（非敏感）
- **KV 命名空间**：4 个独立 namespace，安全边界清晰
- **本地验证**：lint + typecheck + test + build + wrangler pages dev 五步
- **可观测性**：Cloudflare Dashboard + 应用内 AI 质量看板 + AUTH_AUDIT 审计日志
- **回滚策略**：一键回滚 / git revert / KV backup

下一章 [09-retrospective.md](file:///workspace/docs/tutorial/09-retrospective.md) 会从方法论高度总结整个项目的得与失。
