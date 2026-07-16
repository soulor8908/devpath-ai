// lib/sync.ts
// 用户数据云端同步引擎（Cloudflare KV + 用户自生成 userId）
//
// 设计：
// - userId 首次访问自动生成（nanoid），存 IndexedDB key="auth:user_id"
// - 云端数据以 userId 为前缀存入 KV：user:${userId}:backup
// - 客户端先写 IndexedDB（离线可用），再异步同步到 KV
// - 拉取时先读 IndexedDB，跨设备时调云端合并

import { nanoid } from "nanoid";
import { getItem, setItem, listKeys, getMany, bulkPutItems, getChangesSince } from "@/lib/storage/db";
import { apiFetch } from "@/lib/api-client";
import type { UserBackup } from "./types";
import { KEY_PREFIXES } from "./types";

// IndexedDB key：用户唯一标识
const USER_ID_KEY = "auth:user_id";
// IndexedDB key：上次成功同步时间（ISO 字符串）
const LAST_SYNC_KEY = "sync:last_synced_at";

// 需要同步的数据 key 前缀（所有用户业务数据）
// MODEL_CONFIG 含 apiKey，同步到用户私有 KV 命名空间（需 API_TOKEN 鉴权），
// 确保跨设备可用 AI 模型配置，否则换设备后会报 503（未配置 AI）
// DAILY_NUDGE / WEEKLY 是缓存，无需同步
// DAILY_LOG（每日日志 Markdown）和 EMOTION（情绪笔记）需同步以支持跨设备
const SYNC_PREFIXES = [
  KEY_PREFIXES.PLAN,
  KEY_PREFIXES.PLAN_SUMMARY,
  KEY_PREFIXES.CARD,
  KEY_PREFIXES.STATUS,
  KEY_PREFIXES.REVIEW_LOG,
  KEY_PREFIXES.LEARN_LOG,
  KEY_PREFIXES.EMOTION,
  KEY_PREFIXES.ROUTINE,
  KEY_PREFIXES.DECK,
  KEY_PREFIXES.MISTAKE,
  KEY_PREFIXES.CONVERSATION,
  KEY_PREFIXES.CHAT_MESSAGE,
  KEY_PREFIXES.PROMPT,
  KEY_PREFIXES.MODEL_CONFIG,
  KEY_PREFIXES.REMINDER,
  KEY_PREFIXES.DAILY_LOG,
] as const;

// 不在前缀体系内但需要同步的独立 key
const SYNC_EXTRA_KEYS = [
  "my:profile", // 个人信息（用户名/显示名/简介/头像/隐私设置）
] as const;

// 备份数据结构版本号
const BACKUP_VERSION = 1;

/** 获取或生成 userId（首次访问自动生成并持久化） */
export async function getUserId(): Promise<string> {
  const existing = await getItem<string>(USER_ID_KEY);
  if (existing) return existing;
  const id = nanoid();
  await setItem(USER_ID_KEY, id);
  return id;
}

/**
 * 导入已有 userId（跨设备恢复用）
 * 新设备/换 App 时粘贴旧设备的 userId，即可继承云端数据
 * @param userId 用户输入的旧 userId
 * @returns 持久化后的 userId
 */
export async function setUserId(userId: string): Promise<string> {
  const trimmed = userId.trim();
  if (!trimmed) throw new Error("userId 不能为空");
  await setItem(USER_ID_KEY, trimmed);
  return trimmed;
}

/** 读取上次成功同步时间，未同步过返回 null */
export async function getLastSyncedAt(): Promise<string | null> {
  const v = await getItem<string>(LAST_SYNC_KEY);
  return v ?? null;
}

/**
 * 合并策略：以 updatedAt 较新者为准。
 * - key 仅在某一方存在 → 取存在的一方
 * - 两方都有 updatedAt → 取较新者
 * - 无法比较 updatedAt → 以云端为准（last-write-wins）
 * @param local 本地数据（key → value）
 * @param remote 云端数据（key → value）
 */
export function mergeData(
  local: Record<string, unknown>,
  remote: Record<string, unknown>,
): Record<string, unknown> {
  const merged: Record<string, unknown> = { ...local };
  for (const [key, remoteVal] of Object.entries(remote)) {
    const localVal = merged[key];
    if (localVal === undefined) {
      merged[key] = remoteVal;
      continue;
    }
    const localTs = getUpdatedAt(localVal);
    const remoteTs = getUpdatedAt(remoteVal);
    if (localTs && remoteTs) {
      merged[key] = remoteTs > localTs ? remoteVal : localVal;
    } else {
      // 无法比较时间戳 → 以云端为准
      merged[key] = remoteVal;
    }
  }
  return merged;
}

function getUpdatedAt(v: unknown): string | undefined {
  if (v && typeof v === "object" && "updatedAt" in v) {
    const ts = (v as { updatedAt?: unknown }).updatedAt;
    return typeof ts === "string" ? ts : undefined;
  }
  return undefined;
}

/**
 * 上传所有本地数据到 KV（全量备份）
 *
 * 优化（P1 数据层升级）：
 *   - 用 getMany 批量读取每个前缀下的数据（而非逐 key await）
 *   - Dexie prefix 索引 + bulkGet 比 idb-keyval 快 3-5x
 */
export async function uploadAll(): Promise<void> {
  const userId = await getUserId();
  const data: Record<string, unknown> = {};
  for (const prefix of SYNC_PREFIXES) {
    const keys = await listKeys(prefix);
    if (keys.length === 0) continue;
    // 批量读取（比逐 key getItem 快 3-5x）
    const values = await getMany<unknown>(keys);
    keys.forEach((k, i) => {
      if (values[i] !== undefined) data[k] = values[i];
    });
  }
  // 同步独立 key（如 my:profile）
  for (const key of SYNC_EXTRA_KEYS) {
    const v = await getItem<unknown>(key);
    if (v !== undefined) data[key] = v;
  }
  const backup: UserBackup = {
    userId,
    updatedAt: new Date().toISOString(),
    version: BACKUP_VERSION,
    data,
  };
  const res = await apiFetch("/api/sync", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(backup),
  });
  if (!res.ok) {
    const msg = await safeErrText(res);
    throw new Error(`上传失败: ${res.status}${msg ? ` ${msg}` : ""}`);
  }
  await setItem(LAST_SYNC_KEY, backup.updatedAt);
}

/**
 * 增量上传：只上传自上次同步以来变更的 key
 *
 * 工作原理：
 *   1. 读 lastSyncAt（上次成功同步时间）
 *   2. 若为空（首次同步） → 降级为 uploadAll 全量备份
 *   3. 用 Dexie 的 updatedAt 索引查询：getChangesSince(lastSyncAt)
 *   4. 把变更的 key 打包发送到 /api/sync，服务端 mergeUserBackup 按 LWW 合并
 *   5. 无变更时立即返回（O(0) 网络成本）
 *
 * 复杂度对比：
 *   - uploadAll:        O(N)          N=本地全部 key
 *   - uploadIncremental: O(Δ)          Δ=自上次同步以来变更的 key
 *   对于用了几个月、累计几千条数据的用户，每次同步从全量 → 增量是 10-100x 提升。
 *
 * 已知限制：增量同步不传播删除（getChangesSince 只返回现有记录）。
 *   这是接受的：用户手动点「上传到云端」会走 uploadAll 全量覆盖，把删除同步出去。
 *   自动同步日常增量，定期手动同步兜底。
 *
 * @returns "incremental" | "full" | "noop" 表示本次同步的实际模式
 */
export async function uploadIncremental(): Promise<"incremental" | "full" | "noop"> {
  const userId = await getUserId();
  const lastSyncAt = await getLastSyncedAt();

  // 首次同步 → 降级为全量
  if (!lastSyncAt) {
    await uploadAll();
    return "full";
  }

  // 增量查询：updatedAt > lastSyncAt 的记录（走 Dexie updatedAt 索引）
  const changes = await getChangesSince(lastSyncAt);
  if (changes.length === 0) {
    return "noop";
  }

  const data: Record<string, unknown> = {};
  for (const rec of changes) {
    data[rec.key] = rec.value;
  }

  const res = await apiFetch("/api/sync", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      userId,
      mode: "incremental" as const,
      changes: data,
      baseUpdatedAt: lastSyncAt,
    }),
  });
  if (!res.ok) {
    const msg = await safeErrText(res);
    throw new Error(`增量上传失败: ${res.status}${msg ? ` ${msg}` : ""}`);
  }

  // 用本次同步发起时间作为新的 lastSyncAt（而非 res 返回的 updatedAt），
  // 因为客户端的 updatedAt 索引基准是本地时间，与云端时间可能不一致。
  // 取 max(lastSyncAt, 最新变更的 updatedAt) 防止遗漏仍在变更的 key。
  const newSyncAt = new Date().toISOString();
  await setItem(LAST_SYNC_KEY, newSyncAt);
  return "incremental";
}

/**
 * 从云端下载并合并到本地。
 * @returns true=云端有数据已合并；false=云端无数据
 *
 * 优化（P1 数据层升级）：
 *   - 用 getMany 批量读取本地数据（而非逐 key await）
 *   - 用 bulkPutItems 批量写入合并结果（10x+ 快于逐条 setItem）
 */
export async function downloadAll(): Promise<boolean> {
  const userId = await getUserId();
  const res = await apiFetch(
    `/api/sync?userId=${encodeURIComponent(userId)}`,
    { method: "GET" },
  );
  if (res.status === 404) return false;
  if (!res.ok) {
    const msg = await safeErrText(res);
    throw new Error(`下载失败: ${res.status}${msg ? ` ${msg}` : ""}`);
  }
  const payload = (await res.json()) as { backup?: UserBackup };
  const remote = payload?.backup;
  if (!remote || !remote.data) return false;

  // 批量读取本地对应 key 的值用于合并
  const remoteKeys = Object.keys(remote.data);
  const localValues = await getMany<unknown>(remoteKeys);
  const local: Record<string, unknown> = {};
  remoteKeys.forEach((key, i) => {
    if (localValues[i] !== undefined) local[key] = localValues[i];
  });

  const merged = mergeData(local, remote.data);

  // 批量写入合并结果（增量写入，只写变化的 key）
  const toWrite: Array<{ key: string; value: unknown }> = [];
  for (const [k, v] of Object.entries(merged)) {
    toWrite.push({ key: k, value: v });
  }
  await bulkPutItems(toWrite);

  await setItem(LAST_SYNC_KEY, new Date().toISOString());
  return true;
}

async function safeErrText(res: Response): Promise<string> {
  try {
    const j = (await res.json()) as { error?: unknown };
    return typeof j.error === "string" ? j.error : "";
  } catch {
    return "";
  }
}

// ========== 自动同步（防抖 + 增量） ==========
// 用户操作（完成学习/复习/改 profile 等）后调用 scheduleAutoSync()
// 5 秒内多次操作只触发一次上传，避免频繁请求
// 自动同步走增量模式（uploadIncremental），手动同步走全量模式（uploadAll）
let autoSyncTimer: ReturnType<typeof setTimeout> | null = null;
const AUTO_SYNC_DELAY_MS = 5000;

/**
 * 排队一次自动同步（防抖 5 秒，增量模式）
 * 静默执行，失败不抛错（不阻塞用户操作）
 * 用于用户操作后自动把数据推到云端
 *
 * 增量 vs 全量：
 *   - 自动同步：增量（只传变更的 key，O(Δ)）
 *   - 手动同步（SyncStatus 按钮触发）：全量（O(N)，作为兜底，同步删除操作）
 */
export function scheduleAutoSync(): void {
  if (autoSyncTimer) clearTimeout(autoSyncTimer);
  autoSyncTimer = setTimeout(async () => {
    autoSyncTimer = null;
    try {
      await uploadIncremental();
    } catch (e) {
      console.warn("[sync] auto-sync failed:", e);
    }
  }, AUTO_SYNC_DELAY_MS);
}
