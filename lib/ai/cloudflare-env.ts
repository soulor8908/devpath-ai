// lib/ai/cloudflare-env.ts
// 在 Cloudflare Workers 运行时获取环境变量并注入到 provider
//
// 2026-07-27 OpenNext 迁移：从 raw symbol 改用官方 getCloudflareContext()
//   - 旧实现用 globalThis[Symbol.for("__cloudflare-request-context__")]，是
//     @cloudflare/next-on-pages 时代的内部实现细节，OpenNext 后不再保证注入
//   - 新实现优先用 @opennextjs/cloudflare 的 getCloudflareContext()，raw symbol
//     作为 fallback（向后兼容旧 adapter，且非 Cloudflare 环境安全降级）
//   - getCloudflareContext() 在非 Cloudflare 环境（next dev / next build / 测试）
//     会抛错，需 try/catch 包装
//
// 开发环境（next dev）下 process.env 已可用，此函数为 no-op。

import { setCloudflareEnv } from "./provider";

const CF_CTX_SYMBOL = Symbol.for("__cloudflare-request-context__");

/**
 * 从当前请求上下文获取 Cloudflare env（bindings + vars + secrets）。
 *
 * 优先级：
 *   1. getCloudflareContext()（OpenNext 官方 API，推荐）
 *   2. raw symbol（向后兼容 @cloudflare/next-on-pages）
 *   3. undefined（非 Cloudflare 环境，调用方降级）
 *
 * 用 try/catch + 动态 import 包装，避免 next build 阶段求值失败。
 */
function getCloudflareEnv(): Record<string, unknown> | undefined {
  // 1. 优先用 OpenNext 官方 API
  //    用 Function('return require')() 动态调用 require，避免：
  //    - webpack 静态分析把 @opennextjs/cloudflare 打进客户端 bundle
  //    - eslint no-require-imports 规则报错
  //    - next build 阶段（Node 环境）求值失败
  try {
    // eslint-disable-next-line @typescript-eslint/no-implied-eval, no-new-func
    const dynamicRequire = new Function("id", "return require(id)") as (id: string) => {
      getCloudflareContext?: () => { env?: Record<string, unknown> } | undefined;
    };
    const mod = dynamicRequire("@opennextjs/cloudflare");
    const ctx = mod?.getCloudflareContext?.();
    if (ctx?.env) return ctx.env;
  } catch {
    // 非 Cloudflare 环境（next dev / next build / 测试），降级
  }

  // 2. Fallback: raw symbol（向后兼容 @cloudflare/next-on-pages）
  try {
    const ctx = (globalThis as Record<symbol, { env?: Record<string, unknown> } | undefined>)[CF_CTX_SYMBOL];
    if (ctx?.env) return ctx.env;
  } catch {
    // 非 Cloudflare 环境，忽略
  }

  return undefined;
}

// 注意：不用 initialized flag 缓存。
// 原因：Cloudflare 请求上下文是 per-request 的，第一次请求时 context 可能尚未挂载，
// 缓存 initialized=true 会导致后续请求不再读取，env 永远为空。
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

  // Cloudflare Workers 运行时：从 getCloudflareContext() 读取 env
  const env = getCloudflareEnv();
  if (env) {
    setCloudflareEnv(env);
  }
}

// Cloudflare KV 最小接口（与 lib/storage/kv.ts 的 KVLike 一致）
export interface KVLike {
  get(key: string): Promise<string | null>;
  put(key: string, value: string): Promise<void>;
}

/**
 * Cloudflare Workers KV namespace 最小接口（apiKey Session 安全架构用）。
 * 真实运行时由 @cloudflare/workers-types 提供 KVNamespace 全局类型；
 * 该包未安装时使用本接口（与 Cloudflare KV API 子集兼容）。
 * put 的 options 支持 expirationTtl，用于 session/nonce TTL。
 */
export interface KVNamespace {
  get(key: string): Promise<string | null>;
  put(
    key: string,
    value: string,
    options?: { expirationTtl?: number; expiration?: number },
  ): Promise<void>;
  delete(key: string): Promise<void>;
}

/**
 * 从当前 Cloudflare Workers 请求上下文获取 KV namespace binding。
 * app/api 路由无 context.env，需通过 getCloudflareContext 读取。
 * 非 Cloudflare 环境（如本地 next dev）返回 undefined，调用方可降级为 mock。
 */
export function getCloudflareKV(): KVLike | undefined {
  const env = getCloudflareEnv();
  const kv = env?.KV;
  if (
    kv &&
    typeof kv === "object" &&
    typeof (kv as { get?: unknown }).get === "function" &&
    typeof (kv as { put?: unknown }).put === "function"
  ) {
    return kv as KVLike;
  }
  return undefined;
}

/**
 * 通用 KV binding 读取：从 Cloudflare Workers 请求上下文按 binding 名取 KV namespace。
 * 校验 get/put/delete 均为 function，避免误把非 KV binding 当 KV 使用。
 * 非 Cloudflare 环境或 binding 不存在 → 返回 null，调用方（SessionStore）降级为内存 Map。
 */
function getAuthKV(binding: string): KVNamespace | null {
  const env = getCloudflareEnv();
  const kv = env?.[binding];
  if (
    kv &&
    typeof kv === "object" &&
    typeof (kv as { get?: unknown }).get === "function" &&
    typeof (kv as { put?: unknown }).put === "function" &&
    typeof (kv as { delete?: unknown }).delete === "function"
  ) {
    return kv as unknown as KVNamespace;
  }
  return null;
}

/**
 * 获取 AUTH_SESSIONS KV namespace（存储加密后的 session 记录）。
 * 非 Cloudflare 环境返回 null，调用方降级为内存 Map（仅本地开发）。
 */
export function getAuthSessionsKV(): KVNamespace | null {
  return getAuthKV("AUTH_SESSIONS");
}

/**
 * 获取 AUTH_NONCES KV namespace（存储已用 nonce 防重放）。
 * 非 Cloudflare 环境返回 null，调用方降级为内存 Map（仅本地开发）。
 */
export function getAuthNoncesKV(): KVNamespace | null {
  return getAuthKV("AUTH_NONCES");
}

/**
 * 获取 AUTH_AUDIT KV namespace（存储审计日志）。
 * 非 Cloudflare 环境返回 null，调用方降级为内存 Map（仅本地开发）。
 */
export function getAuthAuditKV(): KVNamespace | null {
  return getAuthKV("AUTH_AUDIT");
}

// ============================================================================
// Workers AI binding（知识库向量化用）
// ============================================================================

/**
 * Workers AI binding 最小接口。
 * 真实运行时由 @cloudflare/workers-types 提供 Ai 全局类型；
 * 该包未安装时使用本接口（与 Workers AI run() API 子集兼容）。
 *
 * bge 嵌入模型返回形状：{ shape: [N, D], data: number[][] }
 */
export interface AIExecutor {
  run(
    model: string,
    inputs: { text: string | string[] },
  ): Promise<{ shape?: number[]; data: number[][] | number[] }>;
}

/**
 * 从当前 Cloudflare Workers 请求上下文获取 Workers AI binding。
 * app/api 路由通过 getCloudflareContext 读取 env.AI。
 * 非 Cloudflare 环境或 binding 不存在 → 返回 null，调用方（/api/embed）返回 503，
 * 客户端走离线降级（关键词检索）。
 */
export function getAI(): AIExecutor | null {
  const env = getCloudflareEnv();
  const ai = env?.AI;
  if (
    ai &&
    typeof ai === "object" &&
    typeof (ai as { run?: unknown }).run === "function"
  ) {
    return ai as AIExecutor;
  }
  return null;
}
