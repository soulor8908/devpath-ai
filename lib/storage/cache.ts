// lib/storage/cache.ts
// 内存缓存层（P1 数据层升级）
//
// 目标：首页加载只读 summary + 统计缓存（5min TTL）
//   - 减少 IndexedDB 读取次数（Dexie get 仍是异步 IO）
//   - 热路径数据（plan_summary、stats）缓存到内存
//   - 写入时自动失效（write-through invalidation）
//
// 使用方式：
//   import { getCached, setCachedWithInvalidation, invalidateCache } from "@/lib/storage/cache";
//   // 读：缓存命中直接返回，未命中降级到 DB
//   const summary = await getCached<LearningPlanSummary>(key);
//   // 写：写入 DB + 失效缓存（下次读会重新加载）
//   await setCachedWithInvalidation(key, value);
//
// 缓存策略：
//   - TTL: 5 分钟（默认，可配置）
//   - LRU: 最多 100 条（超出时淘汰最旧的）
//   - 按 prefix 失效：写入 plan:xxx 时失效 plan_summary:xxx

const DEFAULT_TTL_MS = 5 * 60 * 1000; // 5 分钟
const MAX_ENTRIES = 100;

interface CacheEntry<T = unknown> {
  value: T;
  expires: number;
  lastAccess: number;
}

const cache = new Map<string, CacheEntry>();

/**
 * 从缓存读取（未命中或过期返回 undefined）
 * 命中时刷新 lastAccess（用于 LRU 淘汰）
 */
export function getCachedSync<T>(key: string): T | undefined {
  const entry = cache.get(key);
  if (!entry) return undefined;
  if (entry.expires < Date.now()) {
    cache.delete(key);
    return undefined;
  }
  entry.lastAccess = Date.now();
  return entry.value as T;
}

/**
 * 异步读取：缓存命中直接返回，未命中调用 fallback 并写回缓存
 * @param key 缓存 key
 * @param fallback 未命中时的数据源（如 IndexedDB 读取）
 * @param ttlMs TTL（毫秒），默认 5 分钟
 */
export async function getCached<T>(
  key: string,
  fallback: () => Promise<T | undefined>,
  ttlMs: number = DEFAULT_TTL_MS
): Promise<T | undefined> {
  const hit = getCachedSync<T>(key);
  if (hit !== undefined) return hit;

  const value = await fallback();
  if (value !== undefined) {
    setCached(key, value, ttlMs);
  }
  return value;
}

/**
 * 写入缓存
 */
export function setCached<T>(key: string, value: T, ttlMs: number = DEFAULT_TTL_MS): void {
  // LRU: 超出容量时淘汰最久未访问的
  if (cache.size >= MAX_ENTRIES) {
    evictLRU();
  }
  cache.set(key, {
    value,
    expires: Date.now() + ttlMs,
    lastAccess: Date.now(),
  });
}

/**
 * 失效缓存：
 *   - 无参数：清空全部
 *   - 给定 prefix：失效所有以 prefix 开头的 key
 *   - 给定具体 key：只失效该 key
 */
export function invalidateCache(keyOrPrefix?: string): void {
  if (!keyOrPrefix) {
    cache.clear();
    return;
  }
  // 先尝试精确匹配
  if (cache.has(keyOrPrefix)) {
    cache.delete(keyOrPrefix);
    return;
  }
  // 再按前缀匹配（keyOrPrefix 是前缀如 "plan_summary:"）
  for (const k of cache.keys()) {
    if (k.startsWith(keyOrPrefix)) {
      cache.delete(k);
    }
  }
}

/**
 * 失效 plan 相关缓存（plan + plan_summary）
 * 写入 plan 时调用：plan 改了 summary 也得失效
 */
export function invalidatePlanCache(planId?: string): void {
  if (planId) {
    invalidateCache(`plan:${planId}`);
    invalidateCache(`plan_summary:${planId}`);
  } else {
    invalidateCache("plan:");
    invalidateCache("plan_summary:");
  }
}

// ============ 内部工具 ============

function evictLRU(): void {
  let oldestKey: string | null = null;
  let oldestTime = Infinity;
  for (const [k, entry] of cache) {
    if (entry.lastAccess < oldestTime) {
      oldestTime = entry.lastAccess;
      oldestKey = k;
    }
  }
  if (oldestKey) cache.delete(oldestKey);
}

/**
 * 调试用：返回当前缓存大小和 key 列表
 */
export function debugCacheState(): { size: number; keys: string[] } {
  return {
    size: cache.size,
    keys: Array.from(cache.keys()),
  };
}
