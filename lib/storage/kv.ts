// lib/storage/kv.ts
// Cloudflare KV 封装（公开主页数据）
// 运行时：Cloudflare Pages Functions 通过 env.KV binding 注入
// 本地开发/测试：无 env.KV 时降级为内存 Map（mock）

import type { PublicProfile, UserBackup } from "../types";

export interface PublicStats {
  username: string;
  streakDays: number;
  totalMinutes: number;
  currentTopic?: string;
  radarData?: Array<{ node: string; value: number }>;
  heatmapData?: Array<{ date: string; count: number }>;
  updatedAt: string;
}

export interface KVStore {
  getProfile(username: string): Promise<PublicProfile | null>;
  setProfile(profile: PublicProfile): Promise<void>;
  getStats(username: string): Promise<PublicStats | null>;
  updateStats(username: string, stats: Partial<PublicStats>): Promise<void>;
  getUserBackup(userId: string): Promise<UserBackup | null>;
  setUserBackup(userId: string, data: UserBackup): Promise<void>;
  /**
   * 增量合并：将客户端变更的 key 合并到云端 backup.data
   * - 每个 key 按 value.updatedAt 较新者为准（last-write-wins）
   * - key 仅在变更集中存在 → 直接写入
   * - 无 updatedAt 字段 → 以变更集为准（保守取最新）
   * - 若云端无 backup，等价于 setUserBackup（首次同步兜底）
   *
   * @param userId 用户 ID
   * @param changes 变更的 key → value 映射
   * @returns 合并后的 backup.updatedAt
   */
  mergeUserBackup(
    userId: string,
    changes: Record<string, unknown>,
  ): Promise<string>;
}

interface KVLike {
  get(key: string): Promise<string | null>;
  put(key: string, value: string): Promise<void>;
}

/**
 * 创建 KV 存储实例
 * @param envKV Cloudflare env.KV binding（边缘运行时注入）
 * 无传入时降级为内存 Map（仅本地开发/测试）
 */
export function createKVStore(envKV?: KVLike): KVStore {
  const kv: KVLike = envKV ?? createMockKV();

  return {
    async getProfile(username: string) {
      const raw = await kv.get(`profile:${username}`);
      if (!raw) return null;
      try {
        return JSON.parse(raw) as PublicProfile;
      } catch {
        return null;
      }
    },
    async setProfile(profile: PublicProfile) {
      await kv.put(`profile:${profile.username}`, JSON.stringify(profile));
    },
    async getStats(username: string) {
      const raw = await kv.get(`stats:${username}`);
      if (!raw) return null;
      try {
        return JSON.parse(raw) as PublicStats;
      } catch {
        return null;
      }
    },
    async updateStats(username: string, stats: Partial<PublicStats>) {
      const existing = await this.getStats(username);
      const merged: PublicStats = {
        username,
        streakDays: stats.streakDays ?? existing?.streakDays ?? 0,
        totalMinutes: stats.totalMinutes ?? existing?.totalMinutes ?? 0,
        currentTopic: stats.currentTopic ?? existing?.currentTopic,
        radarData: stats.radarData ?? existing?.radarData,
        heatmapData: stats.heatmapData ?? existing?.heatmapData,
        updatedAt: new Date().toISOString(),
      };
      await kv.put(`stats:${username}`, JSON.stringify(merged));
    },
    async getUserBackup(userId: string) {
      const raw = await kv.get(`user:${userId}:backup`);
      if (!raw) return null;
      try {
        return JSON.parse(raw) as UserBackup;
      } catch {
        return null;
      }
    },
    async setUserBackup(userId: string, data: UserBackup) {
      await kv.put(`user:${userId}:backup`, JSON.stringify(data));
    },
    async mergeUserBackup(
      userId: string,
      changes: Record<string, unknown>,
    ): Promise<string> {
      // 读旧 backup（不存在则视为空）
      const existing = await this.getUserBackup(userId);
      const mergedData: Record<string, unknown> = {
        ...(existing?.data ?? {}),
      };

      // 每个 key 按 updatedAt 较新者为准（与 sync.ts mergeData 一致的 LWW 语义）
      for (const [key, newVal] of Object.entries(changes)) {
        const oldVal = mergedData[key];
        if (oldVal === undefined) {
          mergedData[key] = newVal;
          continue;
        }
        const oldTs = pickUpdatedAt(oldVal);
        const newTs = pickUpdatedAt(newVal);
        if (oldTs && newTs) {
          mergedData[key] = newTs > oldTs ? newVal : oldVal;
        } else {
          // 无法比较 → 取新值（保守假设客户端最新）
          mergedData[key] = newVal;
        }
      }

      const updatedAt = new Date().toISOString();
      const backup: UserBackup = {
        userId,
        updatedAt,
        version: existing?.version ?? 1,
        data: mergedData,
      };
      await kv.put(`user:${userId}:backup`, JSON.stringify(backup));
      return updatedAt;
    },
  };
}

/** 从 unknown value 中安全提取 updatedAt 字符串 */
function pickUpdatedAt(v: unknown): string | undefined {
  if (v && typeof v === "object" && "updatedAt" in v) {
    const ts = (v as { updatedAt?: unknown }).updatedAt;
    return typeof ts === "string" ? ts : undefined;
  }
  return undefined;
}

function createMockKV(): KVLike {
  const map = new Map<string, string>();
  return {
    async get(key: string) {
      return map.has(key) ? map.get(key)! : null;
    },
    async put(key: string, value: string) {
      map.set(key, value);
    },
  };
}
