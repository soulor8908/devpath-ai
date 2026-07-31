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
  /**
   * 从 value.due 提取的到期时间（ISO 字符串），仅 ReviewCard 有此字段。
   * 用于 countDueCards(now) 精准查询，避免全量加载 cards 只为算 dueCount。
   * P1 性能优化：500 张卡片全量加载 → O(due) 索引查询。
   */
  dueAt?: string;
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
 * 创建 Dexie 数据库实例（含 schema 定义）
 */
async function createDB(): Promise<AppDBInstance> {
  const { default: Dexie } = await import("dexie");

  class AppDB extends Dexie {
    kv!: Table<KVRecord, string>;
    constructor() {
      super("devpath");
      this.version(1).stores({
        kv: "&key, prefix, updatedAt",
      });
      this.version(2).stores({
        kv: "&key, prefix, updatedAt, dueAt",
      }).upgrade(async (tx) => {
        await tx.table("kv").toCollection().modify((rec: KVRecord) => {
          if (
            rec.value &&
            typeof rec.value === "object" &&
            "due" in rec.value
          ) {
            const due = (rec.value as { due?: unknown }).due;
            if (typeof due === "string") {
              rec.dueAt = due;
            }
          }
        });
      });
    }
  }

  return new AppDB();
}

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
    dbInstance = await createDB();
  }
  return dbInstance;
}

/**
 * 重置数据库连接（2026-07-31 新增）。
 *
 * 触发场景：IndexedDB 事务中止（如 "Data lost due to missing file"）后，
 * 旧连接可能处于不可用状态。关闭旧连接并重置单例，下次 getDB() 会创建新实例。
 *
 * 使用模式（db.ts 的 setItem/delItem 等在捕获事务错误后调用）：
 *   ```ts
 *   try { await db.kv.put(record); }
 *   catch (e) { await resetDBConnection(); throw e; }
 *   ```
 */
export async function resetDBConnection(): Promise<void> {
  if (dbInstance) {
    try {
      dbInstance.close();
    } catch {
      // 关闭失败忽略
    }
    dbInstance = null;
    migrationPromise = null;
  }
}

/**
 * 彻底删除并重建数据库（2026-07-31 新增）。
 *
 * 根因（经充分调研确认）：
 *   微信清理缓存 / iOS 系统存储清理 / 清理工具 会删除 WKWebView 的
 *   IndexedDB 底层数据库文件。文件丢失后，IndexedDB 系统表仍注册着
 *   "devpath" 数据库，但底层文件不存在 → 任何操作都报
 *   "Data lost due to missing file. Affected record should be considered irrevocable"
 *
 *   参考：Super Productivity 项目相同 issue（johannesjo/super-productivity#4527）
 *   维护者确认："The error appears when some other app (some cleaner utility?)
 *   has deleted some of super productivity's files."
 *
 * 恢复策略：
 *   1. 关闭所有 Dexie 连接（释放数据库锁）
 *   2. 等待连接释放（100ms）
 *   3. indexedDB.deleteDatabase("devpath") 删除损坏的数据库注册
 *   4. 等待删除完成（处理 onblocked，最多等 5s）
 *   5. 下次 getDB() 会创建全新数据库 + 全新文件
 *
 * 数据影响：
 *   底层文件已被清理工具删除，数据本就不可恢复。
 *   deleteDatabase 只是清理 IndexedDB 系统表中的残留注册信息，
 *   让数据库能被重新创建。不会造成额外数据丢失。
 */
export async function nukeAndRebuildDB(): Promise<void> {
  // 1. 关闭 Dexie 连接
  await resetDBConnection();

  // 2. 等待连接释放（Dexie.close() 是同步的，但底层 IndexedDB 连接释放可能需要一点时间）
  await new Promise((resolve) => setTimeout(resolve, 100));

  // 3. 删除数据库
  await new Promise<void>((resolve) => {
    let resolved = false;
    const finish = () => {
      if (!resolved) {
        resolved = true;
        resolve();
      }
    };
    try {
      const req = indexedDB.deleteDatabase("devpath");
      req.onsuccess = () => {
        console.info("[dexie] 数据库已删除，准备重建");
        finish();
      };
      req.onerror = () => {
        console.warn("[dexie] deleteDatabase 失败，尝试继续创建新实例");
        finish();
      };
      req.onblocked = () => {
        // 连接未完全释放，等待后继续
        // 即使 deleteDatabase 被 blocked，Dexie 创建新实例时仍可能成功
        console.warn("[dexie] deleteDatabase 被 blocked（连接未释放），等待后继续");
        finish();
      };
      // 5s 超时兜底
      setTimeout(() => {
        console.warn("[dexie] deleteDatabase 超时（5s），尝试继续创建新实例");
        finish();
      }, 5000);
    } catch (e) {
      console.warn("[dexie] deleteDatabase 异常:", e);
      finish();
    }
  });

  // 4. 重置迁移标志，允许重新迁移
  migrationPromise = null;
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

/**
 * 从 value.due 提取到期时间（仅 ReviewCard 有此字段）。
 * 用于 dueAt 索引，支持 countDueCards 精准查询。
 */
function extractDueAtFromValue(value: unknown): string | undefined {
  if (value && typeof value === "object" && "due" in value) {
    const due = (value as { due?: unknown }).due;
    return typeof due === "string" ? due : undefined;
  }
  return undefined;
}

/**
 * 导出 extractUpdatedAtFromValue + extractDueAtFromValue 供 db.ts 复用。
 * 2026-07-26 抽取：原 db.ts 与 dexie-db.ts 各有一份 extractUpdatedAtFromValue 实现，
 * 此处 export 后 db.ts 改为 import，避免两份拷贝漂移。
 */
export { extractUpdatedAtFromValue, extractDueAtFromValue };
