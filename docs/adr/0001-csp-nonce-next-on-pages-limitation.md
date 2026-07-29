# ADR 0001：CSP nonce 模式因 next-on-pages 限制不可启用

- **状态**：Accepted（受限于部署平台，等待迁移条件成熟后重评估）
- **日期**：2026-07-27 提出 / 2026-07-28 复核确认
- **相关**：[next.config.js](../../next.config.js)、[app/layout.tsx](../../app/layout.tsx)、[__tests__/csp-nonce-guard.test.ts](../../__tests__/csp-nonce-guard.test.ts)、[wrangler.toml](../../wrangler.toml)

## 背景

站点体检发现 CSP 含 `'unsafe-inline'`，SecurityHeaders 评级被卡在 A（封顶），Mozilla Observatory 预估仅 C+。需要 inline 的脚本包括：

- `app/layout.tsx` 主题探测脚本（避免 FOUC 暗色闪烁）
- `app/layout.tsx` Service Worker 注册脚本
- Next.js 15 RSC payload 脚本（框架固有，运行时注入）

提升评级的正道是启用 CSP nonce 模式：每个请求生成随机 nonce，只允许带该 nonce 的 inline 脚本执行，从而去掉 `'unsafe-inline'`。

## 决策

**当前不启用 CSP nonce 模式，保留 `next.config.js` 静态 CSP（含 `'unsafe-inline'`）。**

该 CSP 仍能拦截外部域脚本注入，仅放行同源 + inline 脚本。安全评级妥协为 A，换取部署可行性。

## 已尝试方案与回退原因

2026-07-27 P1-4 尝试启用 nonce 模式：

1. `middleware.ts` 生成 per-request nonce，覆盖 `next.config.js` 的 CSP
2. `layout.tsx` 用 `await headers()` 读取 nonce，注入 `<script nonce={nonce}>`
3. Next.js 15 自动给 RSC payload 脚本加 nonce

回退原因（`@cloudflare/next-on-pages` adapter 限制）：

- middleware 会让所有路由变 dynamic
- `@cloudflare/next-on-pages` 要求所有 dynamic 路由声明 `runtime='edge'`
- `/_not-found` 是 Next.js 内置路由，无法声明 edge runtime
- 部署失败：`ERROR: Failed to produce a Cloudflare Pages build`

2026-07-28 因 `workers.dev` 域名国内无法访问（DNS 污染 + SSL 干扰），从 `@opennextjs/cloudflare`（Workers）回退到 `@cloudflare/next-on-pages`（Pages，`pages.dev` 国内可访问）。上述 adapter 限制依然存在，nonce 模式仍不可启用。

## 备选方案

| 方案 | 可行性 | 说明 |
|---|---|---|
| nonce + middleware（Pages） | ❌ | 触发 dynamic routes 限制，`/_not-found` 部署失败 |
| 迁回 Workers + 自定义域名 | ⏸ | 自定义域名可解决国内访问，但需额外域名成本与配置，暂缓 |
| hash 替代 nonce | ❌ | RSC payload 脚本运行时生成，无法预算 hash |
| 维持 `'unsafe-inline'` | ✅ | 当前方案，安全评级 A，防御纵深靠其他头部补齐 |

## 守护

[__tests__/csp-nonce-guard.test.ts](../../__tests__/csp-nonce-guard.test.ts) 源码级扫描，防止 nonce 模式未启用前的回退：

- `middleware.ts` 必须不存在（防止误启用导致白屏）
- `next.config.js` 必须保留 CSP fallback（含 `'unsafe-inline'`）
- `layout.tsx` inline script 不能带 nonce 属性（nonce 来源未实现）

## 未来启用路径

1. 迁移到 Cloudflare Workers（`@opennextjs/cloudflare`）
2. 绑定自定义域名解决国内访问
3. 启用 `middleware.ts` 生成 per-request nonce
4. `layout.tsx` 读取 nonce 注入 inline script
5. 移除 CSP 中的 `'unsafe-inline'`，改用 `'nonce-<随机>'`
6. 更新本 ADR 状态为 Superseded，新增 ADR 记录新决策
