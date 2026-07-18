# Checklist

## 阶段一：ESLint 本地门禁强化

- [x] [.eslintrc.json](file:///workspace/.eslintrc.json) 中 `no-unused-vars` / `exhaustive-deps` / `prefer-const` 已升级为 `"error"`
- [x] [package.json](file:///workspace/package.json) 的 `lint` 脚本为 `next lint --max-warnings 0`
- [x] 运行 `npm run lint` 退出码为 0（无 warning 残留）
- [x] [package.json](file:///workspace/package.json) 含 `"prepare": "husky"` 脚本
- [x] [package.json](file:///workspace/package.json) 含 `husky` 和 `lint-staged` 在 devDependencies
- [x] [package.json](file:///workspace/package.json) 含 `lint-staged` 配置块
- [x] `.husky/pre-commit` 文件存在且执行 `npx lint-staged`
- [x] `.husky/pre-push` 文件存在且执行 `npm run lint && npm run typecheck`
- [ ] 在干净仓库 `rm -rf .git/hooks/* && npm install` 后 `.git/hooks/pre-commit` 和 `pre-push` 自动生成（需手动验证）
- [ ] 故意 staged 一个含 `const x = 1;` 未使用变量的文件，`git commit` 被拒绝（需手动验证）
- [ ] 故意 commit 一个含 tsc 错误的文件（lint 通过），`git push` 被拒绝（需手动验证）
- [x] [scripts/install-git-hooks.sh](file:///workspace/scripts/install-git-hooks.sh) 已删除
- [x] 全局搜索 `install-git-hooks` 无引用残留

## 阶段二：apiKey Session 安全架构

### 基础设施

- [x] `lib/ai/crypto.ts` 存在，导出 `aesGcmEncrypt` / `aesGcmDecrypt` / `hmacSha256` / `sha256` / `constantTimeEqual` / `randomBytes`
- [x] `__tests__/crypto.test.ts` 通过：加解密往返、HMAC 已知向量、constant-time 不短路（长度不同时仍走完）
- [x] [wrangler.toml](file:///workspace/wrangler.toml) 含 `AUTH_SESSIONS` / `AUTH_NONCES` / `AUTH_AUDIT` 三个 KV namespace
- [x] [lib/storage/kv.ts](file:///workspace/lib/storage/kv.ts) 含 `SessionStore` 类，方法 `createSession` / `getSession` / `updateSession` / `deleteSession` / `useNonce` / `writeAudit`
- [x] `SessionStore.useNonce` 在 nonce 已存在时返回 false，否则写入并返回 true

### Session 中间件

- [x] `lib/ai/session-middleware.ts` 存在，导出 `requireSession` 和 `signCanonicalRequest`
- [x] `__tests__/session-middleware.test.ts` 覆盖：缺 header → 401、timestamp 超窗 → 401、nonce 重复 → 401、session 不存在 → 401、session 过期 → 401、签名错误 → 401、签名正确 → 注入 req.session
- [x] 签名正确时 `req.session` 含 `userId` / `apiKey` / `provider` / `baseURL` / `model` / `name`
- [x] 签名正确时 KV 中的 session `expiresAt` 被更新为 `now + 7d`（滑动续期）
- [x] 签名正确时 nonce 写入 KV（TTL 5min）

### Exchange / Revoke / Status 端点

- [x] `app/api/auth/exchange/route.ts` 存在，`runtime = "edge"`
- [x] exchange 成功返回 `{ sessionId, sessionSecret, expiresAt }`，sessionSecret 只在响应中出现一次
- [x] exchange 时 KV 写入 `auth:session:${sessionId}`，含 `encryptedApiKey` / `encryptedSecret` / `userId` / `provider` / `baseURL` / `model` / `name` / `createdAt` / `lastUsedAt` / `expiresAt`，TTL 7 天
- [x] exchange 写入审计日志 `auth:audit:${sessionId}:${timestamp}`，TTL 30 天，不含 apiKey/sessionSecret 明文
- [x] exchange 缺字段返回 400
- [x] MASTER_KEY 未配置返回 500，不泄露用户输入
- [x] `app/api/auth/revoke/route.ts` 存在，需签名校验，成功删除 session
- [x] `app/api/auth/status/route.ts` 存在，需签名校验，返回 `{ valid, expiresAt, remaining }`

### 路由改造

- [x] `grep -r "requireAuth" app/api` 无结果
- [x] `grep -r "REQUIRE_API_TOKEN" lib` 无结果
- [x] `grep -r "API_TOKEN" lib/auth.ts` 无结果（除注释外）
- [x] [app/api/sync/route.ts](file:///workspace/app/api/sync/route.ts) GET 不再读取 `?userId=xxx`
- [x] [app/api/sync/route.ts](file:///workspace/app/api/sync/route.ts) POST 不再从 body 读 userId，改用 `req.session.userId`
- [x] 所有 AI 路由（chat / learn/* / review / weekly / adjust-plan / ai-test / background-check / daily-nudge / emotion-coping / regenerate / rhythm / status / favorite / rate-limit）使用 `requireSession`
- [x] [lib/ai/provider.ts](file:///workspace/lib/ai/provider.ts) 含 `getModelFromSession(session)` 方法
- [x] [lib/auth.ts](file:///workspace/lib/auth.ts) 仅导出 `requireSession`（从 session-middleware re-export）

### 客户端改造

- [x] [lib/api-client.ts](file:///workspace/lib/api-client.ts) 不再含 `getApiToken` / `setApiToken` / `TOKEN_KEY`
- [x] [lib/api-client.ts](file:///workspace/lib/api-client.ts) 含 `exchangeSession` / `getValidSession` / `signRequest` / `revokeSession`
- [x] `apiFetch` 不再附加 `Authorization: Bearer` header
- [x] `aiFetch` 的 body 不再含 `modelConfig.apiKey` 字段
- [x] `aiFetch` 的 body 不再含 `userId` 字段
- [x] [lib/sync.ts](file:///workspace/lib/sync.ts) `downloadAll` URL 不含 `?userId=xxx`
- [x] [lib/sync.ts](file:///workspace/lib/sync.ts) `uploadAll` / `uploadIncremental` body 不含 `userId` 字段
- [x] [app/profile/page.tsx](file:///workspace/app/profile/page.tsx) 保存模型时调 `exchangeSession`，不存 apiKey 到 IndexedDB
- [x] [app/profile/page.tsx](file:///workspace/app/profile/page.tsx) 含「登出所有设备」按钮，调 `revokeSession`
- [x] [app/profile/page.tsx](file:///workspace/app/profile/page.tsx) 检测旧 `modelConfig.apiKey` 存在但无 session 时显示升级提示

### 服务端零信任

- [x] 所有路由的 `console.error` / `console.warn` 输出经日志中间件脱敏（apiKey → `sk-***`，sessionSecret → `***`）
- [x] exchange 端点不把 apiKey 写入任何日志
- [x] session 中间件不把 sessionSecret 写入任何日志

### 配置与文档

- [x] [.env.local.example](file:///workspace/.env.local.example) 含 `MASTER_KEY=` 占位
- [x] [docs/DEVELOPMENT.md](file:///workspace/docs/DEVELOPMENT.md) 或 [README.md](file:///workspace/README.md) 含「安全配置」章节，说明 `MASTER_KEY` 生成与配置方式
- [x] 文档说明 Cloudflare Pages 部署用 `wrangler pages secret put MASTER_KEY` 配置

### 端到端验证

- [ ] 本地 `npm run dev`：profile 配置模型 → exchange 成功 → 学习计划生成正常（需部署后验证）
- [ ] 本地 `npm run dev`：复习 / 周报 / chat / sync 上传下载均正常（需部署后验证）
- [ ] 浏览器 devtools Network 标签页：所有请求无 `apiKey` 明文（需部署后验证）
- [ ] 浏览器 devtools Network 标签页：所有请求 URL 无 `userId` query（需部署后验证）
- [ ] 浏览器 devtools Network 标签页：所有请求 body 无 `apiKey` / `userId` 字段（需部署后验证）
- [ ] 浏览器 devtools Network 标签页：所有请求含 `X-Session-Id` / `X-Request-Timestamp` / `X-Request-Nonce` / `X-Request-Signature` 四个 header（需部署后验证）
- [ ] 7 天不活跃后请求返回 401，客户端引导重新 exchange（手动改 KV expiresAt 模拟）（需部署后验证）
- [ ] 重复 nonce 请求返回 401（需部署后验证）
- [ ] 篡改 body 后签名校验失败返回 401（需部署后验证）
- [x] `npm run lint && npm run typecheck && npm test` 全绿
- [x] `npm run build` 成功
- [x] `npx @cloudflare/next-on-pages` 构建成功
