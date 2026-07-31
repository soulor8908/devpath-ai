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
  resetDBConnection,
  nukeAndRebuildDB,
  extractPrefix,
  extractDueAtFromValue,
  extractUpdatedAtFromValue,
  type KVRecord,
} from "@/lib/storage/dexie-db";
import { invalidateCache, setCached } from "@/lib/storage/cache";

/**
 * 判断是否为"数据库文件丢失"错误（2026-07-31 修复）。
 *
 * 微信清理缓存 / iOS 存储清理 会删除 IndexedDB 底层数据库文件。
 * 文件丢失后，IndexedDB 系统表仍注册着数据库，但操作时报：
 *   "Data lost due to missing file. Affected record should be considered irrevocable"
 *
 * 此类错误必须通过 nukeAndRebuildDB（删除数据库+重建）恢复，
 * 单纯重置连接无效（底层文件已不存在）。
 */
function isDataLostError(e: unknown): boolean {
  if (!(e instanceof Error)) return false;
  const msg = e.message.toLowerCase();
  return (
    msg.includes("data lost") ||
    msg.includes("missing file") ||
    msg.includes("irrecoverable")
  );
}

/**
 * 判断是否为可重试的临时性事务错误。
 * 这类错误重置连接后重试即可恢复（非文件丢失）。
 */
function isRetryableTransactionError(e: unknown): boolean {
  if (!(e instanceof Error)) return false;
  const msg = e.message.toLowerCase();
  return (
    msg.includes("database is closed") ||
    msg.includes("connection closed") ||
    e.name === "UnknownError"
  );
}

/**
 * 执行 DB 操作，遇错误时自动恢复并重试（2026-07-31 修复）。
 *
 * 恢复策略：
 *   1. "Data lost due to missing file" → nukeAndRebuildDB（删除+重建数据库）
 *      根因：微信清理缓存删除了 IndexedDB 底层文件，必须删除数据库注册并重建
 *   2. "database is closed" 等 → resetDBConnection（仅重置连接）
 *      根因：Dexie 连接状态异常，重置后重试即可
 */
async function withDBRetry<T>(fn: (db: NonNullable<Awaited<ReturnType<typeof getDB>>>) => Promise<T>): Promise<T> {
  const db = await getDB();
  if (!db) throw new Error("Database unavailable");
  try {
    return await fn(db);
  } catch (e) {
    if (isDataLostError(e)) {
      // 文件丢失：必须删除数据库并重建
      console.error("[db] 检测到数据库文件丢失（微信清理缓存导致），执行 nukeAndRebuildDB:", e);
      await nukeAndRebuildDB();
      await ensureDBReady();
      const newDb = await getDB();
      if (!newDb) throw new Error("Database unavailable after nuke");
      return await fn(newDb);
    }
    if (isRetryableTransactionError(e)) {
      // 临时性事务错误：重置连接后重试
      console.warn("[db] 事务失败，重置连接后重试:", e);
      await resetDBConnection();
      await ensureDBReady();
      const newDb = await getDB();
      if (!newDb) throw new Error("Database unavailable after reset");
      return await fn(newDb);
    }
    throw e;
  }
}

// ============ 向后兼容 API ============

/**
 * 读取单个值
 * 服务端返回 undefined
 * 2026-07-31：包 withDBRetry，遇 "Data lost" 自动 nuke 重建
 */
export async function getItem<T>(key: string): Promise<T | undefined> {
  if (typeof window === "undefined") return undefined;
  await ensureDBReady();
  try {
    return await withDBRetry(async (db) => {
      const rec = await db.kv.get(key);
      return rec?.value as T | undefined;
    });
  } catch {
    // 读取失败返回 undefined（nuke 重建后数据已丢失）
    return undefined;
  }
}

/**
 * 写入单个值
 * - 自动提取 prefix 和 updatedAt 建索引
 * - 自动失效对应缓存
 */
export async function setItem<T>(key: string, value: T): Promise<void> {
  if (typeof window === "undefined") return;
  await ensureDBReady();

  const record: KVRecord = {
    key,
    value,
    prefix: extractPrefix(key),
    updatedAt: extractUpdatedAtFromValue(value),
    dueAt: extractDueAtFromValue(value),
  };
  // 2026-07-31：用 withDBRetry 包裹，遇 "Data lost due to missing file" 等事务错误时
  // 重置连接并重试一次，避免 onboarding/learn-new 创建计划时因临时 DB 故障永久失败
  await withDBRetry(async (db) => {
    await db.kv.put(record);
  });

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
  const nowIso = new Date().toISOString();
  const tombstoneKey = `tombstone:${key}`;
  const tombstone: KVRecord = {
    key: tombstoneKey,
    value: { deletedAt: nowIso, originalKey: key },
    prefix: "tombstone:",
    updatedAt: nowIso,
  };
  // 2026-07-31：删除 + 写 tombstone 用同一重试逻辑
  await withDBRetry(async (db) => {
    await db.kv.delete(key);
    await db.kv.put(tombstone);
  });
  invalidateCache(key);
}

/**
 * 列出所有 key（可按前缀过滤）
 * 走 prefix 索引而非全表扫描
 * 2026-07-31：包 withDBRetry
 */
export async function listKeys(prefix?: string): Promise<string[]> {
  if (typeof window === "undefined") return [];
  await ensureDBReady();
  try {
    return await withDBRetry(async (db) => {
      if (prefix) {
        const records = await db.kv.where("prefix").equals(prefix).toArray();
        return records.map((r) => r.key);
      }
      const all = await db.kv.toArray();
      return all.map((r) => r.key);
    });
  } catch {
    return [];
  }
}

/**
 * 列出某前缀下所有 value
 * 2026-07-31：包 withDBRetry
 */
export async function listItems<T>(prefix: string): Promise<T[]> {
  if (typeof window === "undefined") return [];
  await ensureDBReady();
  try {
    return await withDBRetry(async (db) => {
      const records = await db.kv.where("prefix").equals(prefix).toArray();
      return records.map((r) => r.value as T);
    });
  } catch {
    return [];
  }
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
 * 2026-07-31：包 withDBRetry
 */
export async function bulkPutItems<T>(
  items: Array<{ key: string; value: T }>
): Promise<void> {
  if (typeof window === "undefined") return;
  await ensureDBReady();
  const records: KVRecord[] = items.map(({ key, value }) => ({
    key,
    value,
    prefix: extractPrefix(key),
    updatedAt: extractUpdatedAtFromValue(value),
    dueAt: extractDueAtFromValue(value),
  }));
  await withDBRetry(async (db) => {
    await db.kv.bulkPut(records);
  });
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
 * 列出到期待复习的卡片列表（走 dueAt 索引，O(due) 而非 O(n)）。
 *
 * 与 countDueCards 的区别：返回卡片数据本身（含 front / stability / due 等），
 * 用于首页"今日学习队列"渲染（第 2 阶段：学习+复习合并）。
 *
 * @param now 当前时间，到期日 ≤ now 的卡片视为待复习
 * @param limit 最大返回数量（避免一次拉过多；首页只展示前 N 项），默认 50
 */
export async function listDueCards<T = unknown>(now: Date, limit = 50): Promise<T[]> {
  if (typeof window === "undefined") return [];
  await ensureDBReady();
  const db = await getDB();
  if (!db) return [];
  const nowIso = now.toISOString();
  const records = await db.kv
    .where("dueAt")
    .belowOrEqual(nowIso)
    .limit(limit)
    .toArray();
  return records.map((r) => r.value as T);
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
// extractUpdatedAtFromValue / extractDueAtFromValue 已统一从 dexie-db.ts 导入
// （2026-07-26 抽取：原 db.ts 本地拷贝已删除，避免两份漂移）
