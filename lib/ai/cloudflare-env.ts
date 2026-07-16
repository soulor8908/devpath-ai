// lib/ai/cloudflare-env.ts
// 在 Cloudflare Pages 运行时获取环境变量并注入到 provider
//
// 原理：@cloudflare/next-on-pages 在运行时会把请求上下文挂到
//   globalThis[Symbol.for("__cloudflare-request-context__")]
// 该对象形如 { env, cf, ctx }，env 即 Cloudflare Pages 环境变量。
// 直接读取该 symbol 可避免导入 @cloudflare/next-on-pages（其内部 require("server-only")
// 会在 next build 阶段触发模块求值导致构建失败）。
//
// 开发环境（next dev）下 process.env 已可用，此函数为 no-op。

import { setCloudflareEnv } from "./provider";

const CF_CTX_SYMBOL = Symbol.for("__cloudflare-request-context__");

// 注意：不用 initialized flag 缓存。
// 原因：Cloudflare Pages 的请求上下文是 per-request 的，
// 第一次请求时 symbol 可能尚未挂载，如果缓存了 initialized=true，
// 后续请求即使 symbol 已就绪也不会再读取，导致 env 永远为空。
// setCloudflareEnv 内部有 cachedModel 缓存，不会重复创建模型。

export async function initCloudflareEnv(): Promise<void> {
  // 开发环境：process.env 已可用，无需注入
  if (
    process.env.AI_PROVIDER ||
    process.env.AI_API_KEY ||
    process.env.DEEPSEEK_API_KEY ||
    process.env.GLM_API_KEY
  ) {
    return;
  }

  // Cloudflare Pages 运行时：直接从 globalThis 读取请求上下文
  try {
    const ctx = (globalThis as Record<symbol, { env?: Record<string, unknown> } | undefined>)[CF_CTX_SYMBOL];
    if (ctx?.env) {
      setCloudflareEnv(ctx.env);
    }
  } catch {
    // 非 Cloudflare 环境，忽略
  }
}

// Cloudflare KV 最小接口（与 lib/storage/kv.ts 的 KVLike 一致）
export interface KVLike {
  get(key: string): Promise<string | null>;
  put(key: string, value: string): Promise<void>;
}

/**
 * 从当前 Cloudflare Pages 请求上下文获取 KV namespace binding。
 * app/api 的 Edge runtime 路由无 context.env，需通过 getRequestContext 读取。
 * 非 Cloudflare 环境（如本地 next dev）返回 undefined，调用方可降级为 mock。
 */
export function getCloudflareKV(): KVLike | undefined {
  try {
    const ctx = (globalThis as Record<symbol, { env?: Record<string, unknown> } | undefined>)[CF_CTX_SYMBOL];
    const kv = ctx?.env?.KV;
    if (
      kv &&
      typeof kv === "object" &&
      typeof (kv as { get?: unknown }).get === "function" &&
      typeof (kv as { put?: unknown }).put === "function"
    ) {
      return kv as KVLike;
    }
  } catch {
    // 非 Cloudflare 环境，忽略
  }
  return undefined;
}
