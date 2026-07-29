// lib/ai/cloudflare-env.ts
// 在 Cloudflare Pages 运行时获取环境变量并注入到 provider
//
// 2026-07-28 从 OpenNext 回退到 @cloudflare/next-on-pages：
//   - 删除 @opennextjs/cloudflare 的 getCloudflareContext() 路径
//   - 仅保留 raw symbol（globalThis[Symbol.for("__cloudflare-request-context__")]）
//   - 这是 next-on-pages 注入请求上下文的官方机制
//
// 历史轨迹：
//   - 2026-07-27 OpenNext 迁移：曾改用 getCloudflareContext() 优先 + raw symbol fallback
//   - 2026-07-28 因 workers.dev 国内无法访问回退到 next-on-pages，恢复单一路径
//
// 开发环境（next dev）下 process.env 已可用，此函数为 no-op。

import { setCloudflareEnv } from "./provider";

const CF_CTX_SYMBOL = Symbol.for("__cloudflare-request-context__");

/**
 * 从当前请求上下文获取 Cloudflare env（bindings + vars + secrets）。
 *
 * 通过 next-on-pages 注入的 raw symbol 读取。非 Cloudflare 环境（next dev / 测试）
 * 返回 undefined，调用方降级到 process.env。
 */
function getCloudflareEnv(): Record<string, unknown> | undefined {
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
