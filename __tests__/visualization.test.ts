import { describe, it, expect, vi } from "vitest";

vi.mock("../lib/storage/db", () => ({
  get: vi.fn(),
  set: vi.fn(),
  del: vi.fn(),
  keys: vi.fn().mockResolvedValue([]),
  getMany: vi.fn().mockResolvedValue([]),
}));

import { buildPublicStats } from "../lib/visualization";
import type { PublicProfile, LearnLog } from "../lib/types";

const profile: PublicProfile = {
  username: "alice",
  displayName: "Alice",
  avatar: undefined,
  bio: "",
  visibility: { radar: true, heatmap: true, currentTopic: true, notes: false },
  followerCount: 10,
  followingCount: 5,
  updatedAt: new Date().toISOString(),
};

describe("visualization", () => {
  it("PublicStats 不含 followerCount（隐私字段）", async () => {
    const stats = await buildPublicStats("alice", profile, [], [], [], undefined);
    expect(stats).not.toHaveProperty("followerCount");
    expect(stats).not.toHaveProperty("followingCount");
  });

  it("visibility.heatmap=false → heatmapData 为 undefined", async () => {
    const hiddenProfile = { ...profile, visibility: { ...profile.visibility, heatmap: false } };
    const stats = await buildPublicStats("alice", hiddenProfile, [], [], [], undefined);
    expect(stats.heatmapData).toBeUndefined();
  });

  it("visibility.radar=false → radarData 为 undefined", async () => {
    const hiddenProfile = { ...profile, visibility: { ...profile.visibility, radar: false } };
    const stats = await buildPublicStats("alice", hiddenProfile, [], [], [], undefined);
    expect(stats.radarData).toBeUndefined();
  });

  it("连续打卡计算正确", async () => {
    const today = new Date().toISOString().slice(0, 10);
    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
    const learnLogs: LearnLog[] = [
      { id: "1", planId: "p", nodeId: "k", date: today, duration: 30, type: "learn" },
      { id: "2", planId: "p", nodeId: "k", date: yesterday, duration: 20, type: "review" },
    ];
    const stats = await buildPublicStats("alice", profile, learnLogs, [], [], undefined);
    expect(stats.streakDays).toBe(2);
    expect(stats.totalMinutes).toBe(50);
  });
});
