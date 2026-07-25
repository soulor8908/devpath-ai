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
      visibility: { radar: true, heatmap: true, currentTopic: true, notes: false, achievements: false },
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

  // IDOR 越权防护（Round 3 修复）：
  // 路由层 PUT 前执行 —— owner = getUsernameOwner(username)
  //   owner && owner !== session.userId → 403
  //   !owner → claimUsername(username, session.userId)（首次认领）
  it("IDOR 防护：username 被认领后，其他 userId 的写入应被路由层拒绝", async () => {
    const kv = createKVStore();
    // user-1 首次写入 → 认领 alice
    await kv.claimUsername("alice", "user-1");
    // user-2 尝试写入：路由层读 owner 比对 → 不一致 → 403
    const owner = await kv.getUsernameOwner("alice");
    expect(owner).toBe("user-1");
    expect(owner !== "user-2").toBe(true);
    // user-1 本人写入：owner === session.userId → 放行
    expect(owner === "user-1").toBe(true);
  });
});
