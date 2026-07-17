// lib/storage/db.ts
// IndexedDB 封装（via Dexie.js）
//
// 升级历史（P1 数据层升级）：
//   - v1: idb-keyval（key-value 简单封装）
//   - v2: Dexie.js（带索引：&key, prefix, updatedAt）
//
// API 完全向后兼容：
//   getItem / setItem / delItem / listKeys / listItems / getMany
//   所有调用方零改动
//
// 新增能力（P1）：
//   - getChangesSince(ts): 增量同步用，按 updatedAt 索引查询
//   - bulkPutItems(items): 批量写入（增量同步下载用）
//   - listItemsByPrefix(prefix, limit): 按前缀索引快速枚举
//   - countByPrefix(prefix): 按前缀计数
//   - 内存缓存集成：setItem 自动失效缓存

import {
  getDB,
  ensureDBReady,
  extractPrefix,
  extractDueAtFromValue,
  type KVRecord,
} from "@/lib/storage/dexie-db";
import { invalidateCache, setCached } from "@/lib/storage/cache";

// ============ 向后兼容 API ============

/**
 * 读取单个值
 * 服务端返回 undefined
 */
export async function getItem<T>(key: string): Promise<T | undefined> {
  if (typeof window === "undefined") return undefined;
  await ensureDBReady();
  const db = await getDB();
  if (!db) return undefined;
  const rec = await db.kv.get(key);
  return rec?.value as T | undefined;
}

/**
 * 写入单个值
 * - 自动提取 prefix 和 updatedAt 建索引
 * - 自动失效对应缓存
 */
export async function setItem<T>(key: string, value: T): Promise<void> {
  if (typeof window === "undefined") return;
  await ensureDBReady();
  const db = await getDB();
  if (!db) return;

  const record: KVRecord = {
    key,
    value,
    prefix: extractPrefix(key),
    updatedAt: extractUpdatedAtFromValue(value),
    dueAt: extractDueAtFromValue(value),
  };
  await db.kv.put(record);

  // 写穿缓存：更新内存缓存（如果有）
  setCached(key, value);
}

/**
 * 删除单个值
 * P2 正确性：写入 tombstone 记录用于增量同步传播删除（30 天 TTL）
 * - tombstone key: "tombstone:<原key>"，prefix: "tombstone:"
 * - 增量同步 getChangesSince 会返回 tombstone（updatedAt = 删除时间）
 * - downloadAll 收到 tombstone 后删除本地对应 key
 * - uploadAll 定期清理超过 30 天的 tombstone
 */
export async function delItem(key: string): Promise<void> {
  if (typeof window === "undefined") return;
  await ensureDBReady();
  const db = await getDB();
  if (!db) return;
  await db.kv.delete(key);
  // 写 tombstone（与原 key 同表，通过 prefix="tombstone:" 区分）
  const nowIso = new Date().toISOString();
  const tombstoneKey = `tombstone:${key}`;
  const tombstone: KVRecord = {
    key: tombstoneKey,
    value: { deletedAt: nowIso, originalKey: key },
    prefix: "tombstone:",
    updatedAt: nowIso,
  };
  await db.kv.put(tombstone);
  invalidateCache(key);
}

/**
 * 列出所有 key（可按前缀过滤）
 * 走 prefix 索引而非全表扫描
 */
export async function listKeys(prefix?: string): Promise<string[]> {
  if (typeof window === "undefined") return [];
  await ensureDBReady();
  const db = await getDB();
  if (!db) return [];
  if (prefix) {
    // 利用 prefix 索引
    const records = await db.kv.where("prefix").equals(prefix).toArray();
    return records.map((r) => r.key);
  }
  const all = await db.kv.toArray();
  return all.map((r) => r.key);
}

/**
 * 列出某前缀下所有 value
 */
export async function listItems<T>(prefix: string): Promise<T[]> {
  if (typeof window === "undefined") return [];
  await ensureDBReady();
  const db = await getDB();
  if (!db) return [];
  const records = await db.kv.where("prefix").equals(prefix).toArray();
  return records.map((r) => r.value as T);
}

// 别名：与计划文档代码保持一致（get/set/del/keys/getMany）
export const get = getItem;
export const set = setItem;
export const del = delItem;
export const keys = listKeys;

/** 按显式 key 数组批量取值（过滤 undefined） */
export async function getMany<T>(ks: string[]): Promise<T[]> {
  if (typeof window === "undefined") return [];
  await ensureDBReady();
  const db = await getDB();
  if (!db) return [];
  const records = await db.kv.bulkGet(ks);
  return records
    .filter((r): r is KVRecord => r !== undefined)
    .map((r) => r.value as T);
}

// ============ P1 新增能力：增量同步 + 索引查询 ============

/**
 * 增量查询：读取 updatedAt > since 的所有记录
 * 用于增量同步（sync.ts 调用）
 * @param since ISO 时间字符串，返回该时间之后更新的记录
 */
export async function getChangesSince(since: string): Promise<KVRecord[]> {
  if (typeof window === "undefined") return [];
  await ensureDBReady();
  const db = await getDB();
  if (!db) return [];
  // 利用 updatedAt 索引范围查询
  return await db.kv.where("updatedAt").above(since).toArray();
}

/**
 * 批量写入（增量同步下载用，比逐条 setItem 快 10x+）
 */
export async function bulkPutItems<T>(
  items: Array<{ key: string; value: T }>
): Promise<void> {
  if (typeof window === "undefined") return;
  await ensureDBReady();
  const db = await getDB();
  if (!db) return;
  const records: KVRecord[] = items.map(({ key, value }) => ({
    key,
    value,
    prefix: extractPrefix(key),
    updatedAt: extractUpdatedAtFromValue(value),
    dueAt: extractDueAtFromValue(value),
  }));
  await db.kv.bulkPut(records);
  // 批量写入后失效缓存（避免逐条失效）
  for (const { key } of items) {
    invalidateCache(key);
  }
}

/**
 * 按前缀计数（用于统计缓存）
 */
export async function countByPrefix(prefix: string): Promise<number> {
  if (typeof window === "undefined") return 0;
  await ensureDBReady();
  const db = await getDB();
  if (!db) return 0;
  return await db.kv.where("prefix").equals(prefix).count();
}

/**
 * 按前缀枚举（带 limit，用于分页/采样）
 */
export async function listItemsByPrefix<T>(
  prefix: string,
  limit?: number
): Promise<T[]> {
  if (typeof window === "undefined") return [];
  await ensureDBReady();
  const db = await getDB();
  if (!db) return [];
  let query = db.kv.where("prefix").equals(prefix);
  if (limit) {
    query = query.limit(limit);
  }
  const records = await query.toArray();
  return records.map((r) => r.value as T);
}

// ============ P1 精准查询（避免全量加载） ============

/**
 * 精准统计到期复习卡片数量（走 dueAt 索引，O(due) 而非 O(n)）。
 * 替代首页 listItems<CARD> 全量加载只为算 dueCount 的模式。
 * - 500 张卡片全量加载 ~5ms → 索引查询 10 张到期 ~0.2ms
 * - Dexie 不索引 undefined 值，非 Card 记录自动排除
 */
export async function countDueCards(now: Date): Promise<number> {
  if (typeof window === "undefined") return 0;
  await ensureDBReady();
  const db = await getDB();
  if (!db) return 0;
  const nowIso = now.toISOString();
  return await db.kv.where("dueAt").belowOrEqual(nowIso).count();
}

/**
 * 按前缀查最近 N 天的记录（走 updatedAt 索引 + prefix 过滤）。
 * 用于首页 logs/emotions 等只需近期数据的场景，替代全量加载。
 * @param prefix key 前缀（如 KEY_PREFIXES.LEARN_LOG）
 * @param days 查询天数（如 7 = 最近 7 天）
 */
export async function listRecentItems<T>(
  prefix: string,
  days: number,
): Promise<T[]> {
  if (typeof window === "undefined") return [];
  await ensureDBReady();
  const db = await getDB();
  if (!db) return [];
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
  // updatedAt 索引范围查询 + prefix 内存过滤
  // 注：Dexie 不支持单查询同时用两个索引，所以用 updatedAt 索引 + .and() 过滤 prefix
  const records = await db.kv
    .where("updatedAt")
    .above(since)
    .and((rec) => rec.prefix === prefix)
    .toArray();
  return records.map((r) => r.value as T);
}

/**
 * 清理过期的 tombstone 记录（30 天 TTL）。
 * 在 uploadAll 全量同步时调用，避免 tombstone 无限增长。
 */
export async function cleanExpiredTombstones(
  maxAgeDays = 30,
): Promise<number> {
  if (typeof window === "undefined") return 0;
  await ensureDBReady();
  const db = await getDB();
  if (!db) return 0;
  const cutoff = new Date(
    Date.now() - maxAgeDays * 24 * 60 * 60 * 1000,
  ).toISOString();
  // tombstone 的 prefix 是 "tombstone:"，updatedAt = 删除时间
  const expired = await db.kv
    .where("prefix")
    .equals("tombstone:")
    .and((rec) => (rec.updatedAt ?? "") < cutoff)
    .primaryKeys();
  if (expired.length > 0) {
    await db.kv.bulkDelete(expired);
  }
  return expired.length;
}

// ============ 内部工具 ============

function extractUpdatedAtFromValue(value: unknown): string | undefined {
  if (value && typeof value === "object" && "updatedAt" in value) {
    const ts = (value as { updatedAt?: unknown }).updatedAt;
    return typeof ts === "string" ? ts : undefined;
  }
  return undefined;
}
