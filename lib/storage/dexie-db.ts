// lib/storage/dexie-db.ts
// Dexie.js 数据库定义 + 从 idb-keyval 自动迁移
//
// 设计要点（P1 数据层升级）：
//   1. 单表 kv：&key（主键）+ prefix/updatedAt 索引
//      - 保持与 idb-keyval 一致的 key-value 语义，所有调用方零改动
//      - 利用 Dexie 索引实现：按前缀枚举、按 updatedAt 增量查询
//   2. 首次启动自动迁移：读取 idb-keyval 旧数据 → bulkPut 到 Dexie
//   3. 迁移幂等：以 key 为主键覆盖写入，重复执行无副作用
//   4. SSR/Edge 安全：动态导入 Dexie，避免 BroadcastChannel 泄漏到 Edge runtime
//
// 与 idb-keyval 的关系：
//   - idb-keyval 仍作为依赖保留（__tests__/favorite.test.ts 直接使用）
//   - 生产代码全部走 Dexie；测试代码保持原样以降低风险

import type { Table } from "dexie";

// ============ 类型定义 ============

/** kv 表记录：key（主键）+ value（原始数据）+ 元信息 */
export interface KVRecord {
  /** 主键：完整 key（如 "plan:abc"） */
  key: string;
  /** 原始 value（任意类型，Dexie 透传） */
  value: unknown;
  /** 前缀（如 "plan:"），用于按前缀索引查询 */
  prefix: string;
  /** 从 value.updatedAt 提取的时间戳（ISO 字符串），用于增量同步 */
  updatedAt?: string;
}

/**
 * Dexie 数据库实例接口（用于类型检查，避免直接依赖 Dexie 类）
 * 实际实例在浏览器端通过动态 import 创建
 */
export interface AppDBInstance {
  kv: Table<KVRecord, string>;
  close(): void;
}

// ============ 单例 + SSR/Edge 守卫 ============

let dbInstance: AppDBInstance | null = null;
let migrationPromise: Promise<void> | null = null;

/**
 * 获取 Dexie 实例（浏览器环境单例）
 * 服务端/Edge 返回 null（动态导入 Dexie 避免打包到 Edge runtime）
 *
 * 注意：此函数是异步的（因为动态 import）
 */
export async function getDB(): Promise<AppDBInstance | null> {
  if (typeof window === "undefined" || typeof indexedDB === "undefined") {
    return null;
  }
  if (!dbInstance) {
    // 动态导入 Dexie：避免静态 import 导致 Dexie 被打包到 Edge runtime
    // （Dexie 内部使用 BroadcastChannel，Edge runtime 不支持）
    const { default: Dexie } = await import("dexie");

    class AppDB extends Dexie {
      kv!: Table<KVRecord, string>;
      constructor() {
        super("devpath");
        // v1: 单表 kv，主键 key + 两个索引（prefix、updatedAt）
        //   - prefix 索引：listKeys(prefix) 走索引而非全表扫描
        //   - updatedAt 索引：增量同步 getChangesSince(ts) 直接索引范围查询
        this.version(1).stores({
          kv: "&key, prefix, updatedAt",
        });
      }
    }

    dbInstance = new AppDB();
  }
  return dbInstance;
}

// ============ 前缀提取 ============

/**
 * 从完整 key 提取前缀（用于索引）
 * 约定：KEY_PREFIXES 形如 "plan:" "card:" "review_log:"
 * 提取规则：第一个 ":" 之前的内容（含冒号）
 *   plan:abc     → "plan:"
 *   my:profile   → "my:"
 *   auth:user_id → "auth:"
 *   routine:default → "routine:"
 */
export function extractPrefix(key: string): string {
  const idx = key.indexOf(":");
  if (idx === -1) return "";
  return key.slice(0, idx + 1);
}

// ============ 迁移：idb-keyval → Dexie ============

/**
 * 从 idb-keyval 迁移数据到 Dexie（幂等，重复执行无副作用）
 *
 * 触发时机：首次调用 ensureDBReady() 时自动执行一次
 * 策略：
 *   1. 读取 idb-keyval 所有 key
 *   2. 无数据 → 跳过
 *   3. 有数据 → bulkPut 到 Dexie kv 表（以 key 为主键覆盖）
 *   4. 记录迁移完成标志（IndexedDB key="_dexie_migrated"）
 *   5. 不删除 idb-keyval 旧数据（保留作为备份，避免迁移失败丢数据）
 */
export async function migrateFromIdbKeyval(): Promise<void> {
  const db = await getDB();
  if (!db) return;

  // 幂等：检查迁移标志
  const flag = await db.kv.get("_dexie_migrated");
  if (flag) return;

  // 动态导入 idb-keyval（避免服务端打包）
  const idbKeyval = await import("idb-keyval");
  const allKeys = await idbKeyval.keys();
  if (allKeys.length === 0) {
    // 旧库为空，直接标记已迁移
    await db.kv.put({ key: "_dexie_migrated", value: true, prefix: "_meta:" });
    return;
  }

  // 批量读取旧数据
  const records: KVRecord[] = [];
  for (const k of allKeys) {
    if (typeof k !== "string") continue;
    const value = await idbKeyval.get(k);
    records.push({
      key: k,
      value,
      prefix: extractPrefix(k),
      updatedAt: extractUpdatedAtFromValue(value),
    });
  }

  // 批量写入 Dexie
  await db.kv.bulkPut(records);

  // 标记迁移完成
  await db.kv.put({ key: "_dexie_migrated", value: true, prefix: "_meta:" });

  console.info(
    `[dexie] migrated ${records.length} records from idb-keyval to Dexie`
  );
}

/**
 * 确保 Dexie 就绪 + 迁移完成（首次调用会触发迁移）
 * 所有 Dexie 操作前都应 await 此函数
 */
export function ensureDBReady(): Promise<void> {
  if (migrationPromise) return migrationPromise;
  migrationPromise = (async () => {
    if (typeof window === "undefined" || typeof indexedDB === "undefined") {
      return;
    }
    try {
      await migrateFromIdbKeyval();
    } catch (e) {
      // 迁移失败不阻塞使用（可能是 idb-keyval 已被卸载或损坏）
      console.warn("[dexie] migration failed, continue with empty db:", e);
    }
  })();
  return migrationPromise;
}

// ============ 内部工具 ============

function extractUpdatedAtFromValue(value: unknown): string | undefined {
  if (value && typeof value === "object" && "updatedAt" in value) {
    const ts = (value as { updatedAt?: unknown }).updatedAt;
    return typeof ts === "string" ? ts : undefined;
  }
  return undefined;
}
