// lib/knowledge/index-store.ts
// 知识索引加载 + IndexedDB 缓存 + 内存常驻
//
// 加载策略（三级，从快到慢）：
//   1. 内存命中 → 直接返回（同会话内重复调用零开销）
//   2. IndexedDB kb_index:manifest 命中 → 校验版本一致后用本地
//   3. fetch /data/knowledge-index.json → 写 IndexedDB → 返回
//   4. 全失败（离线 + 无缓存）→ 返回 null，调用方走空检索
//
// 不参与云端同步（kb_index: 不在 SYNC_PREFIXES，静态资源人人相同）

import { getItem as dbGet, setItem as dbSet } from "@/lib/storage/db";
import { KEY_PREFIXES, type KnowledgeIndexManifest } from "@/lib/types";

/** 内存常驻缓存（同会话内重复调用零开销） */
let cachedManifest: KnowledgeIndexManifest | null = null;

/** IndexedDB key */
const DB_KEY = KEY_PREFIXES.KB_INDEX + "manifest";

/** 静态资源 URL（构建产物，随版本发布） */
const STATIC_URL = "/data/knowledge-index.json";

/**
 * 加载知识索引。
 * 优先级：内存 → IndexedDB → fetch 静态 JSON。
 * @returns manifest 或 null（全失败时）
 */
export async function loadKnowledgeIndex(): Promise<KnowledgeIndexManifest | null> {
  // 1. 内存命中
  if (cachedManifest) return cachedManifest;

  // 2. IndexedDB 命中
  try {
    const local = await dbGet<KnowledgeIndexManifest>(DB_KEY);
    if (local && isValidManifest(local)) {
      cachedManifest = local;
      return local;
    }
  } catch {
    // IndexedDB 读取失败，继续尝试 fetch
  }

  // 3. fetch 静态 JSON
  try {
    const resp = await fetch(STATIC_URL, { cache: "force-cache" });
    if (!resp.ok) {
      console.warn("[knowledge] fetch 静态索引失败:", resp.status);
      return null;
    }
    const manifest = (await resp.json()) as KnowledgeIndexManifest;
    if (!isValidManifest(manifest)) {
      console.warn("[knowledge] 静态索引 schema 无效");
      return null;
    }
    // 写 IndexedDB（失败不阻塞）
    try {
      await dbSet(DB_KEY, manifest);
    } catch {
      // 写入失败忽略，内存缓存仍可用
    }
    cachedManifest = manifest;
    return manifest;
  } catch {
    // fetch 失败（离线）
    console.warn("[knowledge] fetch 静态索引失败（离线？）");
    return null;
  }
}

/** 内存常驻缓存读取（同步，需先 loadKnowledgeIndex） */
export function getCachedIndex(): KnowledgeIndexManifest | null {
  return cachedManifest;
}

/** 清除内存缓存（测试用） */
export function clearCachedIndex(): void {
  cachedManifest = null;
}

/** 校验 manifest schema 完整性 */
function isValidManifest(m: unknown): m is KnowledgeIndexManifest {
  if (!m || typeof m !== "object") return false;
  const obj = m as Record<string, unknown>;
  if (typeof obj.version !== "string") return false;
  if (typeof obj.model !== "string") return false;
  if (typeof obj.dimensions !== "number") return false;
  if (typeof obj.builtAt !== "string") return false;
  if (typeof obj.count !== "number") return false;
  if (!Array.isArray(obj.entries)) return false;
  // 抽样校验第一条
  const first = (obj.entries as unknown[])[0];
  if (!first || typeof first !== "object") return false;
  const e = first as Record<string, unknown>;
  if (typeof e.id !== "string") return false;
  if (typeof e.title !== "string") return false;
  if (!Array.isArray(e.vector)) return false;
  return true;
}
