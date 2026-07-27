// open-next.config.ts
// OpenNext Cloudflare adapter 配置
// 2026-07-27 从 @cloudflare/next-on-pages 迁移到 @opennextjs/cloudflare
//
// 参考：https://opennext.js.org/cloudflare/get-started
//
// 字段说明（依据 @opennextjs/cloudflare/dist/cli/build/utils/ensure-cf-config.js）：
//   - default.override.wrapper = "cloudflare-node"   主路由用 node 兼容 wrapper（nodejs_compat）
//   - default.override.converter = "edge"            Next Request/Response ↔ CF Request 转换器
//   - default.override.proxyExternalRequest = "fetch" 外部 fetch 走 Workers fetch API
//   - default.override.incrementalCache = "dummy"    Workers 无磁盘，ISR 增量缓存走 dummy（不缓存）
//   - default.override.tagCache = "dummy"            同上，tag 缓存走 dummy
//   - default.override.queue = "dummy"               revalidate 队列走 dummy（无后台任务）
//   - edgeExternals = ["node:crypto"]                middleware 边缘环境外部依赖：node:crypto
//   - middleware.external = true                     middleware 独立编译为 edge runtime bundle
//   - middleware.override.wrapper = "cloudflare-edge" middleware 用 edge wrapper
//   - middleware.override.converter = "edge"         转换器
//   - middleware.override.proxyExternalRequest = "fetch" 外部 fetch 走 Workers fetch API

import type { OpenNextConfig } from "@opennextjs/cloudflare";

const config: OpenNextConfig = {
  default: {
    override: {
      wrapper: "cloudflare-node",
      converter: "edge",
      proxyExternalRequest: "fetch",
      incrementalCache: "dummy",
      tagCache: "dummy",
      queue: "dummy",
    },
  },
  edgeExternals: ["node:crypto"],
  middleware: {
    external: true,
    override: {
      wrapper: "cloudflare-edge",
      converter: "edge",
      proxyExternalRequest: "fetch",
      incrementalCache: "dummy",
      tagCache: "dummy",
      queue: "dummy",
    },
  },
};

export default config;
