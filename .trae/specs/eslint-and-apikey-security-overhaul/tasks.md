# Tasks

## 阶段一：ESLint 本地门禁强化（P0，独立可并行）

- [x] Task 1: 升级 ESLint 规则级别为 error
  - [x] SubTask 1.1: 修改 [.eslintrc.json](file:///workspace/.eslintrc.json) 把 `no-unused-vars` / `exhaustive-deps` / `prefer-const` 从 `"warn"` 改为 `"error"`
  - [x] SubTask 1.2: 修改 [package.json](file:///workspace/package.json) 的 `lint` 脚本为 `next lint --max-warnings 0`
  - [x] SubTask 1.3: 运行 `npm run lint` 排查现有 warning，逐一修复（若存在）
  - 验证：`npm run lint` 退出码为 0

- [x] Task 2: 安装并配置 husky + lint-staged
  - [x] SubTask 2.1: `npm install -D husky lint-staged`
  - [x] SubTask 2.2: 在 [package.json](file:///workspace/package.json) 添加 `"prepare": "husky"` 脚本
  - [x] SubTask 2.3: 在 [package.json](file:///workspace/package.json) 添加 `lint-staged` 配置：`*.{ts,tsx}` 跑 `eslint --fix --max-warnings 0`，`*.{json,md,css}` 跑 `prettier --write`（如项目无 prettier 则仅 eslint）
  - [x] SubTask 2.4: 运行 `npx husky init` 创建 `.husky/` 目录
  - [x] SubTask 2.5: 写 `.husky/pre-commit`：执行 `npx lint-staged`
  - [x] SubTask 2.6: 写 `.husky/pre-push`：执行 `npm run lint && npm run typecheck`
  - 验证：`git commit` 含 lint error 时被拒绝；`git push` 含 typecheck error 时被拒绝

- [x] Task 3: 删除手动 hook 安装脚本
  - [x] SubTask 3.1: 删除 [scripts/install-git-hooks.sh](file:///workspace/scripts/install-git-hooks.sh)
  - [x] SubTask 3.2: 全局搜索 `install-git-hooks` 引用，更新或删除
  - 验证：`grep -r "install-git-hooks"` 无结果

## 阶段二：apiKey Session 安全架构（P0，依赖顺序执行）

### 2.1 基础设施层

- [x] Task 4: 实现 edge runtime 兼容的加解密工具
  - [x] SubTask 4.1: 新建 `lib/ai/crypto.ts`
  - [x] SubTask 4.2: 实现 `aesGcmEncrypt(plaintext, key, associatedData?)` 和 `aesGcmDecrypt(ciphertext, key, associatedData?)`，使用 Web Crypto API（`crypto.subtle`，edge runtime 原生支持）
  - [x] SubTask 4.3: 实现 `hmacSha256(key, message)` 返回 hex
  - [x] SubTask 4.4: 实现 `sha256(message)` 返回 hex
  - [x] SubTask 4.5: 实现 `constantTimeEqual(a, b)` 常数时间字符串比较
  - [x] SubTask 4.6: 实现 `randomBytes(n)` 返回 hex（用 `crypto.getRandomValues`）
  - 验证：`__tests__/crypto.test.ts` 通过（加解密往返、HMAC 已知向量、constant-time 不短路）

- [x] Task 5: 配置 Cloudflare KV namespace
  - [x] SubTask 5.1: 修改 [wrangler.toml](file:///workspace/wrangler.toml) 新增三个 KV namespace：`AUTH_SESSIONS` / `AUTH_NONCES` / `AUTH_AUDIT`
  - [x] SubTask 5.2: 在 [lib/ai/cloudflare-env.ts](file:///workspace/lib/ai/cloudflare-env.ts) 暴露三个 KV binding 的访问器
  - [x] SubTask 5.3: 在 [lib/storage/kv.ts](file:///workspace/lib/storage/kv.ts) 新增 `SessionStore` 类：`createSession` / `getSession` / `updateSession` / `deleteSession` / `useNonce` / `writeAudit`
  - 验证：本地 `wrangler dev` 可访问 KV；单测 mock KV 通过

### 2.2 服务端 session 层

- [x] Task 6: 实现 session 中间件
  - [x] SubTask 6.1: 新建 `lib/ai/session-middleware.ts`
  - [x] SubTask 6.2: 实现 `requireSession(req): Promise<{ session: SessionContext } | NextResponse>`：
    - 读 header `X-Session-Id` / `X-Request-Timestamp` / `X-Request-Nonce` / `X-Request-Signature`
    - 缺任一 → 401 `missing signature headers`
    - 时间窗校验 ±60s → 401 `request timestamp out of window`
    - nonce 查重 → 401 `nonce already used`
    - 查 session KV → 不存在/过期 → 401 `session expired or invalid`
    - 解密 `encryptedSecret` 得 sessionSecret
    - 重算签名 constant-time 比对 → 不匹配 → 401 `invalid signature`
    - 滑动续期 `lastUsedAt` + `expiresAt = now + 7d`
    - 解密 `encryptedApiKey` 得 apiKey
    - 返回 `{ session: { userId, apiKey, provider, baseURL, model, name } }`
  - [x] SubTask 6.3: 实现 `signCanonicalRequest(method, path, body, timestamp, nonce, sessionSecret)` 返回 hex
  - 验证：`__tests__/session-middleware.test.ts` 覆盖所有 401 分支 + 成功路径 + 滑动续期

- [x] Task 7: 实现 exchange / revoke / status 端点
  - [x] SubTask 7.1: 新建 `app/api/auth/exchange/route.ts`，`runtime = "edge"`，POST 处理：
    - 校验 body 含 apiKey / userId / provider / baseURL / model / name
    - 生成 sessionId + sessionSecret
    - 加密 apiKey + sessionSecret
    - 存 KV（TTL 7d）
    - 写审计日志
    - 返回 `{ sessionId, sessionSecret, expiresAt }`
  - [x] SubTask 7.2: 新建 `app/api/auth/revoke/route.ts`，POST：
    - 调 `requireSession` 校验
    - 删除 session KV
    - 写审计日志
    - 返回 200
  - [x] SubTask 7.3: 新建 `app/api/auth/status/route.ts`，GET：
    - 调 `requireSession` 校验
    - 返回 `{ valid: true, expiresAt, remaining: expiresAt - now }`
  - 验证：`__tests__/auth-exchange.test.ts` 覆盖 exchange 成功 / 缺字段 / revoke / status

### 2.3 路由层改造（BREAKING，依赖 Task 6）

- [x] Task 8: 改造 sync 路由（最易被利用，优先修）
  - [x] SubTask 8.1: 修改 [app/api/sync/route.ts](file:///workspace/app/api/sync/route.ts) GET：移除 `?userId=xxx` 读取，改用 `req.session.userId`
  - [x] SubTask 8.2: 修改 POST：移除 body 中的 userId 校验，改用 `req.session.userId`
  - [x] SubTask 8.3: 用 `requireSession` 替代 `requireAuth(req, { dataOperation: true })`
  - 验证：`__tests__/sync-security.test.ts` 更新，断言 URL 无 userId、body 无 userId

- [x] Task 9: 改造所有 AI 路由
  - [x] SubTask 9.1: [app/api/chat/route.ts](file:///workspace/app/api/chat/route.ts)
  - [x] SubTask 9.2: [app/api/learn/route.ts](file:///workspace/app/api/learn/route.ts) / `answers/route.ts` / `knowledge/route.ts` / `questions/route.ts`
  - [x] SubTask 9.3: [app/api/review/route.ts](file:///workspace/app/api/review/route.ts)
  - [x] SubTask 9.4: [app/api/weekly/route.ts](file:///workspace/app/api/weekly/route.ts)
  - [x] SubTask 9.5: [app/api/adjust-plan/route.ts](file:///workspace/app/api/adjust-plan/route.ts)
  - [x] SubTask 9.6: [app/api/ai-test/route.ts](file:///workspace/app/api/ai-test/route.ts) / `background-check/route.ts` / `daily-nudge/route.ts` / `emotion-coping/route.ts` / `regenerate/route.ts` / `rhythm/route.ts` / `status/route.ts` / `favorite/route.ts` / `rate-limit/route.ts`
  - 每个路由：用 `requireSession` 替代 `requireAuth`，从 `req.session` 取 userId / apiKey / modelConfig
  - 验证：每个路由单测通过；无 `requireAuth` 残留引用

- [x] Task 10: 改造 provider 层
  - [x] SubTask 10.1: 在 [lib/ai/provider.ts](file:///workspace/lib/ai/provider.ts) 新增 `getModelFromSession(session: SessionContext)`：用 session.apiKey / baseURL / model 创建模型
  - [x] SubTask 10.2: `getModelFromConfig` 保留但标注"仅 profile 本地预览用"
  - [x] SubTask 10.3: 删除 `getModel` 的 fallback 到环境变量模式（BREAKING：服务端不再提供默认模型，用户必须自带 apiKey）
    - 注：若需保留免费模式，可让部署方在 profile 预填一个共享 apiKey，用户 exchange 后用此 key——但本 spec 不实现免费模式，留作后续
  - 验证：provider 单测通过

### 2.4 客户端改造

- [x] Task 11: 重写 api-client
  - [x] SubTask 11.1: 在 [lib/api-client.ts](file:///workspace/lib/api-client.ts) 新增 IndexedDB key `auth:session`，存 `{ sessionId, sessionSecret, expiresAt, provider, baseURL, model, name }`
  - [x] SubTask 11.2: 新增 `exchangeSession(modelConfig: ModelConfig)`：调 `/api/auth/exchange`，存 session，删除 IndexedDB 中的 `modelConfig.apiKey`
  - [x] SubTask 11.3: 新增 `getValidSession()`：读 IndexedDB，过期或不存在 → throw `SessionExpiredError`
  - [x] SubTask 11.4: 新增 `signRequest(method, path, body, sessionSecret)` 返回 4 个 header
  - [x] SubTask 11.5: 重写 `apiFetch(url, options)`：调 `getValidSession` + `signRequest`，移除 Bearer token
  - [x] SubTask 11.6: 重写 `aiFetch(url, options, timeoutMs)`：同上 + body 中移除 `modelConfig.apiKey` 和 `userId`，只保留 provider/baseURL/model/name（实际服务端从 session 取，body 不需要这些）
  - [x] SubTask 11.7: 新增 `revokeSession()`：调 `/api/auth/revoke`，清空 IndexedDB session
  - [x] SubTask 11.8: **删除** `getApiToken` / `setApiToken` / `TOKEN_KEY`
  - 验证：`__tests__/api-client.test.ts`（若存在）更新；浏览器 devtools Network 标签页看不到 apiKey/userId

- [x] Task 12: 改造 sync 客户端
  - [x] SubTask 12.1: 修改 [lib/sync.ts](file:///workspace/lib/sync.ts) `downloadAll()`：移除 `?userId=xxx`
  - [x] SubTask 12.2: 修改 `uploadAll()` / `uploadIncremental()`：移除 body 中的 userId
  - [x] SubTask 12.3: `getUserId()` 保留（本地 IndexedDB 仍需 userId 用于 exchange），但不再用于请求
  - 验证：`__tests__/sync-security.test.ts` 更新

- [x] Task 13: 改造 profile 页模型配置表单
  - [x] SubTask 13.1: 修改 [app/profile/page.tsx](file:///workspace/app/profile/page.tsx) 模型配置保存逻辑：保存时调 `exchangeSession(modelConfig)`，不存 apiKey 到 IndexedDB
  - [x] SubTask 13.2: 模型配置列表展示：apiKey 字段显示为 `sk-***`（从 session 读或显示占位符）
  - [x] SubTask 13.3: 新增「登出所有设备」按钮：调 `revokeSession()`
  - [x] SubTask 13.4: 检测到旧 `modelConfig.apiKey` 存在但无 session → 显示模态提示「安全升级：请重新输入 API Key 启用加密会话」
  - 验证：手动测试 profile 页保存模型 → exchange 成功 → 后续 AI 请求正常

- [x] Task 14: 改造 auth 库
  - [x] SubTask 14.1: 重写 [lib/auth.ts](file:///workspace/lib/auth.ts)：删除 `requireAuth` / `getApiToken` / `shouldRequireToken`，导出 `requireSession` 作为统一鉴权入口（从 session-middleware re-export）
  - [x] SubTask 14.2: 全局搜索 `requireAuth` 引用，全部改为 `requireSession`
  - [x] SubTask 14.3: 删除 `REQUIRE_API_TOKEN` / `API_TOKEN` 环境变量引用
  - 验证：`grep -r "requireAuth"` 无结果；`grep -r "REQUIRE_API_TOKEN"` 无结果

### 2.5 收尾

- [x] Task 15: 配置 MASTER_KEY Secret 与文档
  - [x] SubTask 15.1: 在 [README.md](file:///workspace/README.md) 或 [docs/DEVELOPMENT.md](file:///workspace/docs/DEVELOPMENT.md) 新增「安全配置」章节：说明 `MASTER_KEY`（32 字节 base64）必须配置，提供生成命令 `openssl rand -base64 32`
  - [x] SubTask 15.2: 在 [.env.local.example](file:///workspace/.env.local.example) 添加 `MASTER_KEY=` 占位
  - [x] SubTask 15.3: 在文档说明 Cloudflare Pages 部署时通过 `wrangler pages secret put MASTER_KEY` 配置
  - 验证：文档清晰，新部署方可独立完成配置

- [x] Task 16: 端到端验证
  - [x] SubTask 16.1: 本地 `npm run dev` 测试：profile 配置模型 → exchange → 学习计划生成 → 复习 → 周报 → sync 上传/下载（需部署后验证）
  - [x] SubTask 16.2: 浏览器 devtools Network 检查：所有请求无 apiKey / userId 明文，只有 sessionId + 签名（需部署后验证）
  - [x] SubTask 16.3: `npm run lint && npm run typecheck && npm test` 全绿
  - [x] SubTask 16.4: `npm run build` + `npx @cloudflare/next-on-pages` 构建成功
  - 验证：所有检查项通过

# Task Dependencies

- Task 1, 2, 3 可并行（ESLint 门禁，与安全架构独立）
- Task 4 是 Task 6, 7 的前置依赖
- Task 5 是 Task 6, 7 的前置依赖
- Task 6 是 Task 7, 8, 9, 10, 11, 14 的前置依赖
- Task 7 是 Task 11, 13 的前置依赖
- Task 11 是 Task 12, 13 的前置依赖
- Task 8, 9, 10 可并行（不同路由）
- Task 14 依赖 Task 6, 11
- Task 16 是最终验收，依赖所有前序任务

并行机会：
- 阶段一（Task 1-3）与阶段二（Task 4+）完全独立，可同时启动
- Task 8, 9, 10 在 Task 6 完成后可并行
