import { describe, it, expect } from "vitest";
import { createKVStore } from "../lib/storage/kv";
import type { PublicProfile } from "../lib/types";

// 直接测试 KV 逻辑（Pages Function 本身依赖 Cloudflare 运行时，只测 KV 行为）
describe("api-public (via KV mock)", () => {
  it("模拟 GET 流程：set profile → get 返回", async () => {
    const kv = createKVStore();
    const profile: PublicProfile = {
      username: "alice",
      displayName: "Alice",
      avatar: undefined,
      bio: "learning FE",
      visibility: { radar: true, heatmap: true, currentTopic: true, notes: false },
      followerCount: 0,
      followingCount: 0,
      updatedAt: new Date().toISOString(),
    };
    await kv.setProfile(profile);
    const got = await kv.getProfile("alice");
    expect(got?.displayName).toBe("Alice");
    expect(got?.bio).toBe("learning FE");
  });

  it("模拟 PUT 流程：updateStats 后 getStats 一致", async () => {
    const kv = createKVStore();
    await kv.updateStats("alice", { streakDays: 7, totalMinutes: 210 });
    const stats = await kv.getStats("alice");
    expect(stats?.streakDays).toBe(7);
    expect(stats?.totalMinutes).toBe(210);
  });

  it("GET 不存在用户 → getProfile 返回 null（路由层应转 404）", async () => {
    const kv = createKVStore();
    const got = await kv.getProfile("ghost");
    expect(got).toBeNull();
  });
});
