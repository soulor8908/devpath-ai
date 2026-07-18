# ESLint 本地门禁强化 + apiKey Session 安全架构 Spec

## Why

两个独立但同级严重的工程债再次爆发：

1. **ESLint 问题复发**：[quality-gate-and-ux-rework](file:///workspace/.trae/specs/quality-gate-and-ux-rework/spec.md) spec 已把 CI 拆成 `quality-gate → deploy` 两段，但 ESLint 问题仍复发。根因不在 CI（CI 已是 source of truth），而在**本地反馈链断裂 + warning 容忍**：
   - [.eslintrc.json](file:///workspace/.eslintrc.json) 把 `no-unused-vars` / `exhaustive-deps` / `prefer-const` 设为 `"warn"`，`next lint` 默认对 warning 退出 0 → 错误溜进 CI
   - `npm run lint` 未带 `--max-warnings 0` → 残留 warning 永远不 fail
   - [scripts/install-git-hooks.sh](file:///workspace/scripts/install-git-hooks.sh) 需手动执行，新人/换机器必然漏装
   - `--no-verify` 可绕过 pre-push，无任何兜底

2. **apiKey 明文传输 + userId 泄露**（严重安全漏洞）：[lib/api-client.ts:70-101](file:///workspace/lib/api-client.ts#L70-101) 在每次 AI 请求的 JSON body 里明文注入 `modelConfig.apiKey` 和 `userId`；[lib/sync.ts:289](file:///workspace/lib/sync.ts#L289) 把 userId 放在 `?userId=xxx` query string。攻击面：
   - 浏览器 devtools Network 标签页直接可见 apiKey
   - HTTPS MITM（企业代理/伪证书）可见全部明文
   - 服务端 access log / CDN log 可能记录 body
   - userId 泄露 = 任何人可 `GET /api/sync?userId=xxx` 读你全部数据
   - 无请求签名 → 可篡改 body
   - 无防重放 → 抓到的请求可原样重放

**目标**：
1. 把 ESLint 反馈前移到 commit 时（强制 husky + lint-staged + warning 升级 error + max-warnings 0），让错误在进入远程前就暴露
2. 用 Token Exchange + HMAC 签名架构，让 apiKey 仅 exchange 一次、userId 永不出现在请求中、抗抓包/抗重放/抗篡改

## What Changes

### 一、ESLint 本地门禁强化（P0）

- **BREAKING**: [.eslintrc.json](file:///workspace/.eslintrc.json) 中 `@typescript-eslint/no-unused-vars` / `react-hooks/exhaustive-deps` / `prefer-const` 从 `"warn"` 升级为 `"error"`
- **BREAKING**: `package.json` 的 `lint` 脚本改为 `next lint --max-warnings 0`（任何 warning 也 fail）
- **BREAKING**: 新增 `prepare: "husky"` 脚本，`npm install` 时自动安装 git hook（零 opt-in）
- 新增 `husky` + `lint-staged` 到 devDependencies
- 新增 `.husky/pre-commit`：通过 `lint-staged` 只检查 staged 文件（毫秒级）
- 新增 `.husky/pre-push`：跑 `npm run lint && npm run typecheck`（秒级）
- **删除** [scripts/install-git-hooks.sh](file:///workspace/scripts/install-git-hooks.sh)（被 husky 取代，避免新人困惑）
- **关于 `--no-verify`**：git 设计上 `--no-verify` 不可在客户端禁用。策略是：
  - 本地 husky 强制安装（`prepare` 脚本自动跑，零 opt-in）
  - CI 是 source of truth：CI 必过 lint + typecheck + test，本地绕过 = CI fail，开发者无法绕过最终门禁
  - 文档明确："使用 `--no-verify` 等于把错误推给 CI，CI fail 仍会 block PR"

### 二、apiKey Session 安全架构（P0，BREAKING）

#### 2.1 Token Exchange 协议

新增端点 `POST /api/auth/exchange`：
- 请求 body（**唯一一次明文传输 apiKey + userId**）：
  ```json
  {
    "apiKey": "sk-xxx",
    "userId": "V1St...",
    "provider": "glm",
    "baseURL": "https://open.bigmodel.cn/api/paas/v4",
    "model": "glm-4-flash",
    "name": "智谱 GLM"
  }
  ```
- 服务端处理：
  1. 生成 `sessionId = nanoid(32)`
  2. 生成 `sessionSecret = crypto.getRandomValues(new Uint8Array(32))` → base64
  3. `encryptedApiKey = AES-GCM.encrypt(apiKey, MASTER_KEY, randomIV)` → base64(IV + ciphertext)
  4. `encryptedSecret = AES-GCM.encrypt(sessionSecret, MASTER_KEY, randomIV2)` → base64（服务端需持有 sessionSecret 来验签，但加密存储，KV 泄露不可用）
  5. 存 KV: `auth:session:${sessionId}` = `{ userId, encryptedApiKey, encryptedSecret, provider, baseURL, model, name, createdAt, lastUsedAt, expiresAt: now+7d }`，TTL 7 天
  6. 写审计日志 KV: `auth:audit:${sessionId}:${Date.now()}` = `{ action: "exchange", ip, ua }`，TTL 30 天
  7. 返回 `{ sessionId, sessionSecret, expiresAt }`（**sessionSecret 只此一次返回**）
- 客户端：删除 IndexedDB 中的 `modelConfig.apiKey`，存 `{ sessionId, sessionSecret, expiresAt, provider, baseURL, model, name }`

#### 2.2 请求签名协议

所有受保护 API 请求必须带 4 个 header：
```
X-Session-Id: <sessionId>
X-Request-Timestamp: <unix秒>
X-Request-Nonce: <16字节随机hex>
X-Request-Signature: <HMAC-SHA256(sessionSecret, ...)的hex>
```

签名算法：
```
bodyHash = SHA-256(body || "").hex()
canonicalRequest = method + "\n" + path + "\n" + bodyHash + "\n" + timestamp + "\n" + nonce
signature = HMAC-SHA256(sessionSecret, canonicalRequest).hex()
```

#### 2.3 Session 中间件

新增 `lib/ai/session-middleware.ts`：
1. 从 header 读 `sessionId` / `timestamp` / `nonce` / `signature`
2. **时间窗校验**：`|now - timestamp| > 60s` → 401（抗重放）
3. **nonce 去重**：KV 查 `auth:nonce:${nonce}`，存在 → 401；不存在则写入（TTL 5min）
4. 查 KV `auth:session:${sessionId}`，不存在或 `expiresAt < now` → 401
5. 用 `MASTER_KEY` 解密 `encryptedSecret` 得到 `sessionSecret`
6. 重算签名比对（constant-time compare）
7. **滑动续期**：`lastUsedAt = now`，`expiresAt = now + 7d`，写回 KV
8. 用 `MASTER_KEY` 解密 `encryptedApiKey` 得到 `apiKey`
9. 注入 `req.session = { userId, apiKey, provider, baseURL, model, name }`
10. 调用下游路由

#### 2.4 端点改造

新增端点：
- `POST /api/auth/exchange`：见 2.1
- `POST /api/auth/revoke`：删除当前 session（需签名）
- `GET /api/auth/status`：返回 `{ valid, expiresAt }`（需签名）

改造端点（**BREAKING**：全部改为强制签名）：
- `GET/POST /api/sync`：移除 `?userId=xxx` query，userId 从 `req.session` 取
- `POST /api/chat` / `/api/learn/*` / `/api/review` / `/api/weekly` / `/api/adjust-plan` / `/api/ai-test` / `/api/background-check` / `/api/daily-nudge` / `/api/emotion-coping` / `/api/regenerate` / `/api/rhythm` / `/api/status` / `/api/favorite` / `/api/rate-limit`
- `PUT /api/public/[username]`：仍允许 `PUBLIC_AUTH_TOKEN` 模式（公开主页写入），但同时支持 session 签名

#### 2.5 客户端改造

[lib/api-client.ts](file:///workspace/lib/api-client.ts) 重写：
- 新增 `exchangeSession(modelConfig)`：调 `/api/auth/exchange`，存 session 到 IndexedDB
- 新增 `getValidSession()`：检查 IndexedDB session 是否存在且未过期，否则 throw 引导用户去 profile 重新配置
- 新增 `signRequest(method, path, body)`：生成 timestamp/nonce/signature
- `apiFetch()` 改造：移除 `Authorization: Bearer`，移除 body 里的 userId，加签名 headers
- `aiFetch()` 改造：移除 body 里的 `modelConfig.apiKey` 和 `userId`，只保留 `provider/baseURL/model/name`（服务端从 session 取 apiKey），加签名 headers
- **删除** `getApiToken()` / `setApiToken()` / `TOKEN_KEY`（BREAKING，无兼容期）
- 新增 `revokeSession()`：调 `/api/auth/revoke`，清空 IndexedDB session

[lib/sync.ts](file:///workspace/lib/sync.ts) 改造：
- `downloadAll()` 移除 `?userId=xxx`，服务端从 session 取 userId
- `uploadAll()` / `uploadIncremental()` 移除 body 里的 userId，服务端从 session 取

[lib/auth.ts](file:///workspace/lib/auth.ts) 重写：
- `requireAuth()` → `requireSession()`：调用 session 中间件
- **删除** `REQUIRE_API_TOKEN` 模式（BREAKING，统一走 session）

[lib/ai/provider.ts](file:///workspace/lib/ai/provider.ts) 改造：
- 新增 `getModelFromSession(session)`：用 session 中的 apiKey/baseURL/model 创建模型
- `getModelFromConfig()` 保留但不再用于请求路径（仅 profile 页本地预览）

#### 2.6 配置文件改造

[wrangler.toml](file:///workspace/wrangler.toml) 新增 KV namespace：
- `AUTH_SESSIONS`（存 session 记录）
- `AUTH_NONCES`（存 nonce 去重，5min TTL）
- `AUTH_AUDIT`（存审计日志，30d TTL）

Cloudflare Secret：
- `MASTER_KEY`：32 字节 base64，加解密 apiKey 和 sessionSecret 的根密钥
- 删除 `API_TOKEN` / `REQUIRE_API_TOKEN`（BREAKING）

#### 2.7 迁移策略（破坏性切换）

- **无兼容期**：所有路由只接受签名请求，未签名 → 401
- 客户端首次访问检测到 IndexedDB 有 `modelConfig.apiKey` 但无 session → 显示模态提示「安全升级：请重新输入 API Key 启用加密会话」，跳转 profile 页
- profile 页的模型配置表单：保存时自动调 `exchangeSession`，apiKey 不再持久化到 IndexedDB（只存 session）
- 跨设备：用户在新设备需重新输入 apiKey（与现状一致，但更安全）

## Impact

### Affected specs
- `quality-gate-and-ux-rework`：CI 拆 job 已做，本 spec 补本地 hook + warning 升级，互补不冲突
- `smart-learning-expansion`：Rate Limit 逻辑不变（仍按 userId + scene 计数，userId 改从 session 取）
- `ux-overhaul-and-learning-flow-rework`：不受影响

### Affected code
- 修改文件 ~20 个：
  - `.eslintrc.json` / `package.json`（ESLint 门禁）
  - `lib/api-client.ts` / `lib/sync.ts` / `lib/auth.ts` / `lib/ai/provider.ts`（安全架构）
  - `app/api/sync/route.ts` / `app/api/chat/route.ts` / 所有 `app/api/*/route.ts`（统一 session 校验）
  - `app/profile/page.tsx`（模型配置表单调 exchange）
  - `wrangler.toml`（KV namespace）
- 新增文件 ~5 个：
  - `.husky/pre-commit` / `.husky/pre-push`
  - `lib/ai/session-middleware.ts`
  - `lib/ai/crypto.ts`（AES-GCM + HMAC + SHA-256 封装，edge runtime 兼容）
  - `app/api/auth/exchange/route.ts` / `app/api/auth/revoke/route.ts` / `app/api/auth/status/route.ts`
- 删除文件 1 个：
  - `scripts/install-git-hooks.sh`
- 新增单测：
  - `__tests__/session-middleware.test.ts`：签名校验 / nonce 去重 / 时间窗 / 过期 / 滑动续期
  - `__tests__/crypto.test.ts`：AES-GCM 加解密 / HMAC 签名 / constant-time compare
  - `__tests__/auth-exchange.test.ts`：exchange 端点 / revoke / status

## ADDED Requirements

### Requirement: ESLint Warning Zero Tolerance
系统 SHALL 把所有 ESLint warning 视为 error，`npm run lint` 在存在任何 warning 时以非零退出码失败。

#### Scenario: 残留 warning
- **GIVEN** 代码含 `no-unused-vars` warning
- **WHEN** 运行 `npm run lint`
- **THEN** 退出码非零
- **AND** 输出明确标注是 warning 导致的失败

#### Scenario: 全部通过
- **GIVEN** 代码无任何 warning 或 error
- **WHEN** 运行 `npm run lint`
- **THEN** 退出码 0

### Requirement: Mandatory Local Hook Installation
系统 SHALL 在 `npm install` 时自动安装 git hook，无需用户手动执行任何脚本。

#### Scenario: 新人 clone 后 install
- **GIVEN** 新人 clone 仓库后运行 `npm install`
- **WHEN** install 完成
- **THEN** `.git/hooks/pre-commit` 和 `.git/hooks/pre-push` 已安装并可执行
- **AND** 无需运行任何额外命令

#### Scenario: commit 含 lint error
- **GIVEN** staged 文件含 ESLint error
- **WHEN** `git commit`
- **THEN** pre-commit 钩子运行 lint-staged
- **AND** commit 被拒绝
- **AND** 输出具体错误位置

#### Scenario: push 含 typecheck error
- **GIVEN** 本地 commit 通过但含 tsc 错误
- **WHEN** `git push`
- **THEN** pre-push 钩子运行 `npm run lint && npm run typecheck`
- **AND** push 被拒绝

### Requirement: Token Exchange Protocol
系统 SHALL 提供一次性 Token Exchange 端点，用户用 apiKey + userId 交换 sessionId + sessionSecret，之后 apiKey 永不再传输。

#### Scenario: 首次 exchange
- **GIVEN** 用户在 profile 页配置了 apiKey 和 userId
- **WHEN** 客户端调用 `POST /api/auth/exchange` body 含 apiKey + userId + modelConfig
- **THEN** 服务端生成 sessionId 和 sessionSecret
- **AND** 用 MASTER_KEY 加密 apiKey 和 sessionSecret 后存入 KV（TTL 7 天）
- **AND** 返回 `{ sessionId, sessionSecret, expiresAt }`
- **AND** sessionSecret 只在此响应中返回一次
- **AND** 写入审计日志

#### Scenario: exchange 时缺失字段
- **GIVEN** body 缺 apiKey 或 userId
- **WHEN** 调用 `/api/auth/exchange`
- **THEN** 返回 400，错误信息明确标注缺失字段

#### Scenario: MASTER_KEY 未配置
- **GIVEN** 服务端未配置 `MASTER_KEY` secret
- **WHEN** 调用 `/api/auth/exchange`
- **THEN** 返回 500，错误信息提示部署方配置 `MASTER_KEY`
- **AND** 不泄露任何用户输入

### Requirement: HMAC Request Signature
系统 SHALL 对所有受保护 API 请求校验 HMAC-SHA256 签名，签名覆盖 method + path + bodyHash + timestamp + nonce。

#### Scenario: 签名正确
- **GIVEN** 请求带正确的 `X-Session-Id` / `X-Request-Timestamp` / `X-Request-Nonce` / `X-Request-Signature`
- **WHEN** 中间件校验
- **THEN** 签名通过，请求注入 `req.session`，路由继续处理

#### Scenario: 签名错误
- **GIVEN** 签名与重算结果不匹配
- **WHEN** 中间件校验
- **THEN** 返回 401
- **AND** 不泄露 sessionSecret 或 session 记录内容

#### Scenario: 缺少签名 header
- **GIVEN** 请求缺失任一签名 header
- **WHEN** 中间件校验
- **THEN** 返回 401，错误信息为 "missing signature headers"

### Requirement: Replay Attack Prevention
系统 SHALL 拒绝时间戳偏差超过 60 秒或 nonce 重复的请求。

#### Scenario: 时间戳过期
- **GIVEN** 请求 timestamp 与服务器时间差 > 60 秒
- **WHEN** 中间件校验
- **THEN** 返回 401，错误信息为 "request timestamp out of window"

#### Scenario: nonce 重复
- **GIVEN** 同一 nonce 在 5 分钟内被使用两次
- **WHEN** 第二次请求中间件校验
- **THEN** 返回 401，错误信息为 "nonce already used"

#### Scenario: nonce 首次使用
- **GIVEN** 新的随机 nonce
- **WHEN** 中间件校验通过
- **THEN** nonce 写入 KV（TTL 5min），后续相同 nonce 被拒绝

### Requirement: Session Sliding Expiration
系统 SHALL 在每次有效请求时把 session 过期时间滑动续期到当前时间 + 7 天。

#### Scenario: 持续使用
- **GIVEN** 用户每天使用应用
- **WHEN** 每次请求中间件校验通过
- **THEN** `expiresAt` 更新为 `now + 7d`
- **AND** 用户无需重新 exchange

#### Scenario: 7 天不活跃
- **GIVEN** 用户 7 天未发起任何请求
- **WHEN** 第 8 天发起请求
- **THEN** session 已过期，返回 401
- **AND** 客户端引导用户去 profile 重新输入 apiKey

### Requirement: apiKey Never Transmitted After Exchange
系统 SHALL 在 exchange 之后的任何请求中不传输 apiKey 明文。

#### Scenario: AI 请求 body 检查
- **GIVEN** 用户已 exchange
- **WHEN** 客户端调用 `/api/chat`
- **THEN** 请求 body 不含 `apiKey` 字段
- **AND** 请求 body 不含 `modelConfig.apiKey`
- **AND** 请求 header 不含 `Authorization: Bearer sk-xxx`
- **AND** 服务端从 `req.session.apiKey` 取 apiKey 创建模型

#### Scenario: sync 请求检查
- **GIVEN** 用户已 exchange
- **WHEN** 客户端调用 `GET /api/sync`
- **THEN** 请求 URL 不含 `?userId=xxx`
- **AND** 请求 body 不含 `userId` 字段
- **AND** 服务端从 `req.session.userId` 取 userId

### Requirement: Session Revocation
系统 SHALL 提供 revoke 端点，用户可主动吊销当前 session。

#### Scenario: 主动吊销
- **GIVEN** 用户在 profile 页点击「登出所有设备」
- **WHEN** 客户端调用 `POST /api/auth/revoke` 带当前 session 签名
- **THEN** 服务端删除 KV 中的 session 记录
- **AND** 返回 200
- **AND** 后续用该 sessionId 的请求返回 401

### Requirement: Audit Log
系统 SHALL 对每次 exchange / revoke 写入审计日志，TTL 30 天。

#### Scenario: exchange 审计
- **GIVEN** 用户调用 `/api/auth/exchange`
- **WHEN** 服务端处理完成
- **THEN** KV 写入 `auth:audit:${sessionId}:${timestamp}` = `{ action: "exchange", ip, ua, userIdHash }`
- **AND** TTL 30 天
- **AND** 日志不含 apiKey 或 sessionSecret 明文

### Requirement: Server-Side Zero Trust Logging
系统 SHALL 在所有日志中间件中对 apiKey / sessionSecret / modelConfig.apiKey 字段自动 mask 成 `sk-***`。

#### Scenario: 日志脱敏
- **GIVEN** 路由抛错时 console.error 输出请求信息
- **WHEN** 日志中间件捕获
- **THEN** 输出中 apiKey 字段值为 `sk-***`
- **AND** sessionSecret 字段值为 `***`
- **AND** 不泄露任何凭证

## MODIFIED Requirements

### Requirement: Deploy Workflow
[quality-gate-and-ux-rework](file:///workspace/.trae/specs/quality-gate-and-ux-rework/spec.md) 已把 CI 拆为 `quality-gate → deploy` 两段。本 spec 不改动 CI 结构，但 `quality-gate` job 的 `npm run lint` 现在会因为 `--max-warnings 0` 而对 warning 也 fail。CI 仍是 source of truth，本地 husky 是前置反馈优化。

### Requirement: API Authentication Model
原 [lib/auth.ts](file:///workspace/lib/auth.ts) 使用 `Authorization: Bearer <token>` + `REQUIRE_API_TOKEN` 环境变量开关。修改为：所有受保护路由统一使用 session 签名认证，删除 Bearer token 模式。

### Requirement: API Client
原 [lib/api-client.ts](file:///workspace/lib/api-client.ts) 的 `apiFetch` 附加 Bearer token，`aiFetch` 在 body 注入 modelConfig.apiKey 和 userId。修改为：两者均使用 session 签名，body 不含任何凭证字段。

### Requirement: Sync API
原 [app/api/sync/route.ts](file:///workspace/app/api/sync/route.ts) 的 GET 通过 `?userId=xxx` query 参数读取 userId。修改为：userId 从 `req.session.userId` 取，URL 不再暴露 userId。

## REMOVED Requirements

### Requirement: Bearer Token Authentication
**Reason**: Bearer token 模式无法抗抓包，apiKey 明文在 body 传输，userId 在 URL 暴露，不符合零信任安全架构。
**Migration**: 破坏性切换到 session 签名协议。用户首次访问时检测到旧 modelConfig.apiKey → 自动引导去 profile 页重新输入 apiKey 进行 exchange。无兼容期。

### Requirement: REQUIRE_API_TOKEN Toggle
**Reason**: 双模式（开/关 token 校验）增加复杂度且关模式无任何防护。
**Migration**: 统一为 session 强制校验，删除 `REQUIRE_API_TOKEN` 环境变量。

### Requirement: Manual Git Hook Installation Script
**Reason**: [scripts/install-git-hooks.sh](file:///workspace/scripts/install-git-hooks.sh) 需手动执行，新人/换机器必然漏装，是 ESLint 问题复发的根因之一。
**Migration**: 用 husky 的 `prepare` 脚本替代，`npm install` 时自动安装。
