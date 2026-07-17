// __tests__/home-derive.test.ts
// 测试 home.ts 新增的派生纯函数

import { describe, it, expect } from "vitest";
import {
  deriveUserProfileSummary,
  deriveEnergyTrend,
  deriveAiQualitySummary,
} from "../lib/home";
import type { UserProfile, DailyStatus } from "../lib/types";

describe("deriveUserProfileSummary", () => {
  it("profile 为 null 时返回 null", () => {
    expect(deriveUserProfileSummary(null)).toBeNull();
  });

  it("正确统计三档节点数", () => {
    const profile: UserProfile = {
      id: "ai:profile",
      skillLevel: {
        n1: "beginner",
        n2: "intermediate",
        n3: "advanced",
        n4: "beginner",
      },
      accuracyByNode: {},
      preferredTimeSlots: ["evening"],
      averageSessionMinutes: 25,
      learningStyle: "mixed",
      preferredPersona: "strict_coach",
      goals: { short: [], mid: [], long: [] },
      updatedAt: new Date().toISOString(),
    };
    const summary = deriveUserProfileSummary(profile);
    expect(summary).not.toBeNull();
    expect(summary?.skillLevelCount).toEqual({
      beginner: 2,
      intermediate: 1,
      advanced: 1,
    });
  });

  it("preferredSlot 中文转换", () => {
    const profile: UserProfile = {
      id: "ai:profile",
      skillLevel: {},
      accuracyByNode: {},
      preferredTimeSlots: ["evening"],
      averageSessionMinutes: 25,
      learningStyle: "mixed",
      preferredPersona: "strict_coach",
      goals: { short: [], mid: [], long: [] },
      updatedAt: new Date().toISOString(),
    };
    expect(deriveUserProfileSummary(profile)?.preferredSlot).toBe("晚上");
  });

  it("无 preferredTimeSlots 时 preferredSlot 为 null", () => {
    const profile: UserProfile = {
      id: "ai:profile",
      skillLevel: {},
      accuracyByNode: {},
      preferredTimeSlots: [],
      averageSessionMinutes: 25,
      learningStyle: "mixed",
      preferredPersona: "strict_coach",
      goals: { short: [], mid: [], long: [] },
      updatedAt: new Date().toISOString(),
    };
    expect(deriveUserProfileSummary(profile)?.preferredSlot).toBeNull();
  });
});

describe("deriveEnergyTrend", () => {
  it("todayStatus 为 null 时返回全 null 数组", () => {
    const trend = deriveEnergyTrend(null);
    expect(trend).toHaveLength(7);
    expect(trend.every((v) => v === null)).toBe(true);
  });

  it("有 energy 时填充对应 weekday 位置", () => {
    const status: DailyStatus = {
      date: "2026-07-16",
      energy: 4,
      mood: "good",
      availableMinutes: 60,
      aiAdjustedLoad: 2,
      actualMinutes: 30,
      dopamineTrigger: "无",
    };
    const trend = deriveEnergyTrend(status);
    // 应该有一个位置是 4，其余是 null
    const filled = trend.filter((v) => v === 4);
    expect(filled).toHaveLength(1);
  });
});

describe("deriveAiQualitySummary", () => {
  it("totalCalls = 0 时返回 null", () => {
    expect(
      deriveAiQualitySummary({ totalCalls: 0, scenes: [] }),
    ).toBeNull();
  });

  it("正确计算加权采纳率", () => {
    const summary = deriveAiQualitySummary({
      totalCalls: 10,
      scenes: [
        { adoptionRate: 0.8, calls: 5 }, // 贡献 4.0
        { adoptionRate: 0.6, calls: 5 }, // 贡献 3.0
      ],
    });
    expect(summary).not.toBeNull();
    expect(summary?.todayCalls).toBe(10);
    // (0.8*5 + 0.6*5) / 10 = 0.7
    expect(summary?.adoptionRate).toBe(0.7);
  });

  it("adoptionRate 全 null 时采纳率为 0", () => {
    const summary = deriveAiQualitySummary({
      totalCalls: 5,
      scenes: [{ adoptionRate: null, calls: 5 }],
    });
    expect(summary?.adoptionRate).toBe(0);
  });
});
