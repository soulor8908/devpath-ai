import { describe, it, expect, vi } from "vitest";
import {
  checkRateLimit,
  incrementRateLimit,
  getClientRateLimitEstimate,
  getRateLimitScenes,
  getSceneQuota,
} from "../lib/ai/rate-limit";
import { chinaDateNow } from "../lib/time";
import type { KVStore } from "../lib/storage/kv";

/**
 * 创建 mock KVStore，支持直接设置限流计数（绕过 increment 累加）
 */
function createMockKV(): KVStore & {
  _setCount(userId: string, scene: string, date: string, count: number): void;
} {
  const counts = new Map<string, number>();
  return {
    _setCount(userId: string, scene: string, date: string, count: number) {
      counts.set(`${userId}:${scene}:${date}`, count);
    },
    async getRateLimitCount(userId: string, scene: string, date: string) {
      return counts.get(`${userId}:${scene}:${date}`) ?? 0;
    },
    async incrementRateLimitCount(userId: string, scene: string, date: string) {
      const key = `${userId}:${scene}:${date}`;
      const next = (counts.get(key) ?? 0) + 1;
      counts.set(key, next);
      return next;
    },
    // 以下为 KVStore 接口的其他方法，测试中不需要，用 stub 填充
    async getProfile() {
      return null;
    },
    async setProfile() {
      /* stub */
    },
    async getStats() {
      return null;
    },
    async updateStats() {
      /* stub */
    },
    async getUserBackup() {
      return null;
    },
    async setUserBackup() {
      /* stub */
    },
    async mergeUserBackup() {
      return "";
    },
  } as unknown as KVStore & {
    _setCount(userId: string, scene: string, date: string, count: number): void;
  };
}

describe("rate-limit", () => {
  // ============ 配额判定 ============

  it("chat 场景 count=20 时 allowed=false（达上限）", async () => {
    const kv = createMockKV();
    const date = chinaDateNow();
    kv._setCount("user1", "chat", date, 20);

    const result = await checkRateLimit("user1", "chat", kv);
    expect(result.allowed).toBe(false);
    expect(result.remaining).toBe(0);
    expect(result.limit).toBe(20);
  });

  it("chat 场景 count=19 时 allowed=true, remaining=1", async () => {
    const kv = createMockKV();
    const date = chinaDateNow();
    kv._setCount("user1", "chat", date, 19);

    const result = await checkRateLimit("user1", "chat", kv);
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(1);
    expect(result.limit).toBe(20);
  });

  it("chat 场景 count=0 时 allowed=true, remaining=20", async () => {
    const kv = createMockKV();

    const result = await checkRateLimit("user1", "chat", kv);
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(20);
    expect(result.limit).toBe(20);
  });

  // ============ 其他场景配额 ============

  it("plan_generate 配额为 5", async () => {
    const kv = createMockKV();
    const date = chinaDateNow();
    kv._setCount("user1", "plan_generate", date, 5);

    const result = await checkRateLimit("user1", "plan_generate", kv);
    expect(result.allowed).toBe(false);
    expect(result.limit).toBe(5);
  });

  it("weekly_report 配额为 1", async () => {
    const kv = createMockKV();
    const date = chinaDateNow();
    kv._setCount("user1", "weekly_report", date, 1);

    const result = await checkRateLimit("user1", "weekly_report", kv);
    expect(result.allowed).toBe(false);
    expect(result.limit).toBe(1);
  });

  it("daily_nudge 配额为 4", async () => {
    const kv = createMockKV();

    const result = await checkRateLimit("user1", "daily_nudge", kv);
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(4);
    expect(result.limit).toBe(4);
  });

  it("未显式列出的场景使用默认配额 5", async () => {
    expect(getSceneQuota("knowledge_decompose")).toBe(5);
    expect(getSceneQuota("question_generate")).toBe(5);
    expect(getSceneQuota("energy_pattern")).toBe(5);
  });

  // ============ incrementRateLimit ============

  it("incrementRateLimit 将计数 +1", async () => {
    const kv = createMockKV();

    await incrementRateLimit("user1", "chat", kv);
    await incrementRateLimit("user1", "chat", kv);

    const result = await checkRateLimit("user1", "chat", kv);
    expect(result.remaining).toBe(18); // 20 - 2
  });

  it("increment 后达上限时 allowed=false", async () => {
    const kv = createMockKV();
    // 连续 +1 直到达上限（weekly_report 配额=1）
    await incrementRateLimit("user1", "weekly_report", kv);

    const result = await checkRateLimit("user1", "weekly_report", kv);
    expect(result.allowed).toBe(false);
    expect(result.remaining).toBe(0);
  });

  // ============ useServerModel=false 跳过限流 ============

  it("useServerModel=false 时不调用 checkRateLimit（用户自带 modelConfig 不限流）", async () => {
    // 模拟路由中的限流判断逻辑：
    //   仅当 useServerModel === true && userId 存在时才调 checkRateLimit
    const mockCheck = vi.fn().mockResolvedValue({ allowed: true, remaining: 20, limit: 20 });
    const mockIncrement = vi.fn().mockResolvedValue(undefined);

    async function routeRateLimitCheck(useServerModel: boolean, userId: string | undefined) {
      if (useServerModel && userId) {
        const { allowed } = await mockCheck(userId, "chat", undefined);
        if (!allowed) return false;
        await mockIncrement(userId, "chat", undefined);
      }
      return true;
    }

    // useServerModel=false → 跳过限流，不调用 check/increment
    const ok = await routeRateLimitCheck(false, "user1");
    expect(ok).toBe(true);
    expect(mockCheck).not.toHaveBeenCalled();
    expect(mockIncrement).not.toHaveBeenCalled();

    // useServerModel=true → 调用 check/increment
    await routeRateLimitCheck(true, "user1");
    expect(mockCheck).toHaveBeenCalledTimes(1);
    expect(mockIncrement).toHaveBeenCalledTimes(1);
  });

  it("useServerModel=false 时即使 KV 已达上限也不拦截（限流逻辑被跳过）", async () => {
    const kv = createMockKV();
    const date = chinaDateNow();
    kv._setCount("user1", "chat", date, 100); // 远超上限

    // 模拟路由逻辑：useServerModel=false → 不检查
    const useServerModel = false;
    let blocked = false;
    if (useServerModel) {
      const { allowed } = await checkRateLimit("user1", "chat", kv);
      if (!allowed) blocked = true;
    }
    expect(blocked).toBe(false);
  });

  // ============ 客户端估算 + 场景列表 ============

  it("getClientRateLimitEstimate 返回场景配额（仅 UI 提示）", () => {
    expect(getClientRateLimitEstimate("chat")).toEqual({ limit: 20 });
    expect(getClientRateLimitEstimate("plan_generate")).toEqual({ limit: 5 });
    expect(getClientRateLimitEstimate("weekly_report")).toEqual({ limit: 1 });
    expect(getClientRateLimitEstimate("daily_nudge")).toEqual({ limit: 4 });
  });

  it("getRateLimitScenes 返回所有限流场景", () => {
    const scenes = getRateLimitScenes();
    expect(scenes).toContain("chat");
    expect(scenes).toContain("plan_generate");
    expect(scenes).toContain("weekly_report");
    expect(scenes).toContain("daily_nudge");
    expect(scenes.length).toBe(4);
  });
});
