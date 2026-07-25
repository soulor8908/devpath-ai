import { describe, it, expect } from "vitest";
import { createKVStore } from "../lib/storage/kv";
import type { PublicProfile } from "../lib/types";

function makeProfile(username: string): PublicProfile {
  return {
    username,
    displayName: username,
    avatar: undefined,
    bio: "",
    visibility: { radar: true, heatmap: true, currentTopic: true, notes: false, achievements: false },
    followerCount: 0,
    followingCount: 0,
    updatedAt: new Date().toISOString(),
  };
}

describe("kv", () => {
  it("set 后 get 返回一致", async () => {
    const kv = createKVStore(); // 无 env.KV，使用 mock 内存 Map
    await kv.setProfile(makeProfile("alice"));
    const got = await kv.getProfile("alice");
    expect(got?.username).toBe("alice");
    expect(got?.displayName).toBe("alice");
  });

  it("get 不存在的 username → null", async () => {
    const kv = createKVStore();
    const got = await kv.getProfile("nobody");
    expect(got).toBeNull();
  });

  it("updateStats 增量更新", async () => {
    const kv = createKVStore();
    await kv.updateStats("bob", { streakDays: 5, totalMinutes: 100 } as any);
    const stats = await kv.getStats("bob");
    expect(stats?.streakDays).toBe(5);
  });

  it("getUsernameOwner 未绑定时返回 null", async () => {
    const kv = createKVStore();
    expect(await kv.getUsernameOwner("alice")).toBeNull();
  });

  it("claimUsername 后 getUsernameOwner 返回绑定的 userId", async () => {
    const kv = createKVStore();
    await kv.claimUsername("alice", "user-1");
    expect(await kv.getUsernameOwner("alice")).toBe("user-1");
  });

  it("claimUsername 幂等：同一 userId 重复认领不报错", async () => {
    const kv = createKVStore();
    await kv.claimUsername("alice", "user-1");
    await kv.claimUsername("alice", "user-1");
    expect(await kv.getUsernameOwner("alice")).toBe("user-1");
  });

  it("不同 username 的所有权互相隔离", async () => {
    const kv = createKVStore();
    await kv.claimUsername("alice", "user-1");
    await kv.claimUsername("bob", "user-2");
    expect(await kv.getUsernameOwner("alice")).toBe("user-1");
    expect(await kv.getUsernameOwner("bob")).toBe("user-2");
    expect(await kv.getUsernameOwner("carol")).toBeNull();
  });
});
