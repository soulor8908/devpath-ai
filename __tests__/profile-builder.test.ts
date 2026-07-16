import { describe, it, expect, beforeEach } from "vitest";
import "fake-indexeddb/auto";
import { setItem, delItem, listKeys } from "../lib/storage/db";
import {
  KEY_PREFIXES,
  type ReviewCard,
  type ReviewLog,
  type LearnLog,
} from "../lib/types";
import type { EnergySample } from "../lib/energy-collector";
import {
  inferSkillLevel,
  inferPreferredTimeSlots,
  buildUserProfile,
} from "../lib/ai/memory/profile-builder";

describe("profile-builder", () => {
  beforeEach(async () => {
    // 清理相关前缀，避免测试间数据污染
    for (const prefix of [
      KEY_PREFIXES.CARD,
      KEY_PREFIXES.REVIEW_LOG,
      KEY_PREFIXES.LEARN_LOG,
      KEY_PREFIXES.ENERGY_SAMPLE,
    ]) {
      const keys = await listKeys(prefix);
      for (const k of keys) await delItem(k);
    }
  });

  // ============ inferSkillLevel 阈值测试 ============
  describe("inferSkillLevel", () => {
    it("stability>21 + accuracy 90% → advanced", () => {
      expect(inferSkillLevel(22, { correct: 9, total: 10 })).toBe("advanced");
    });

    it("stability<7 → beginner（即使准确率高）", () => {
      expect(inferSkillLevel(5, { correct: 5, total: 5 })).toBe("beginner");
    });

    it("accuracy < 60% → beginner（即使 stability 高）", () => {
      expect(inferSkillLevel(15, { correct: 5, total: 10 })).toBe("beginner");
    });

    it("中间值 stability + 中等准确率 → intermediate", () => {
      expect(inferSkillLevel(15, { correct: 8, total: 10 })).toBe("intermediate");
    });

    it("stability>21 但准确率仅 80%（≤85%）→ intermediate", () => {
      expect(inferSkillLevel(22, { correct: 8, total: 10 })).toBe("intermediate");
    });

    it("空 accuracy（无数据）→ intermediate（无论 stability）", () => {
      expect(inferSkillLevel(22, { correct: 0, total: 0 })).toBe("intermediate");
      expect(inferSkillLevel(5, { correct: 0, total: 0 })).toBe("intermediate");
      expect(inferSkillLevel(0, { correct: 0, total: 0 })).toBe("intermediate");
    });
  });

  // ============ inferPreferredTimeSlots 测试 ============
  describe("inferPreferredTimeSlots", () => {
    it("返回出现次数 Top 3 时段（按次数降序）", () => {
      // 使用 +08:00 时区偏移，确保 Asia/Shanghai 小时确定
      const logs: LearnLog[] = [
        makeLearnLog("l1", "2026-07-13T06:30:00+08:00"),
        makeLearnLog("l2", "2026-07-13T06:45:00+08:00"),
        makeLearnLog("l3", "2026-07-13T06:50:00+08:00"), // hour 6 × 3
        makeLearnLog("l4", "2026-07-13T12:15:00+08:00"),
        makeLearnLog("l5", "2026-07-13T12:30:00+08:00"), // hour 12 × 2
        makeLearnLog("l6", "2026-07-13T18:45:00+08:00"), // hour 18 × 1
        makeLearnLog("l7", "2026-07-13T22:00:00+08:00"), // hour 22 × 1
      ];
      const slots = inferPreferredTimeSlots(logs);
      expect(slots).toHaveLength(3);
      expect(slots[0]).toBe("06:00-06:59"); // 3 次
      expect(slots[1]).toBe("12:00-12:59"); // 2 次
      // hour 18 和 22 均 1 次，同频按小时升序 → 18 在前
      expect(slots[2]).toBe("18:00-18:59");
    });

    it("不足 3 个时段时返回实际数量", () => {
      const logs: LearnLog[] = [
        makeLearnLog("l1", "2026-07-13T09:00:00+08:00"),
        makeLearnLog("l2", "2026-07-13T09:30:00+08:00"),
      ];
      const slots = inferPreferredTimeSlots(logs);
      expect(slots).toHaveLength(1);
      expect(slots[0]).toBe("09:00-09:59");
    });

    it("无 timestamp 的 log 被跳过", () => {
      const logs: LearnLog[] = [
        { id: "l1", planId: "p1", date: "2026-07-13", type: "learn" },
      ];
      const slots = inferPreferredTimeSlots(logs);
      expect(slots).toHaveLength(0);
    });

    it("空数组返回空数组", () => {
      expect(inferPreferredTimeSlots([])).toEqual([]);
    });

    it("格式为 HH:00-HH:59（两位补零）", () => {
      const logs: LearnLog[] = [
        makeLearnLog("l1", "2026-07-13T07:00:00+08:00"),
      ];
      const slots = inferPreferredTimeSlots(logs);
      expect(slots[0]).toBe("07:00-07:59");
    });
  });

  // ============ buildUserProfile 幂等性测试 ============
  describe("buildUserProfile 幂等性", () => {
    it("相同输入两次调用产出相同 skillLevel / preferredTimeSlots / averageSessionMinutes", async () => {
      await seedProfileData();

      const profile1 = await buildUserProfile();
      const profile2 = await buildUserProfile();

      // 幂等性：核心字段一致（updatedAt 必然不同，不比较）
      expect(profile1.skillLevel).toEqual(profile2.skillLevel);
      expect(profile1.preferredTimeSlots).toEqual(profile2.preferredTimeSlots);
      expect(profile1.averageSessionMinutes).toBe(profile2.averageSessionMinutes);
      expect(profile1.accuracyByNode).toEqual(profile2.accuracyByNode);
    });

    it("id 固定为 ai:profile", async () => {
      await seedProfileData();
      const profile = await buildUserProfile();
      expect(profile.id).toBe("ai:profile");
    });

    it("正确推断技能等级（advanced / beginner）", async () => {
      await seedProfileData();
      const profile = await buildUserProfile();

      // node_react: stability 25 (>21), accuracy 2/2=100% (>85%) → advanced
      expect(profile.skillLevel["node_react"]).toBe("advanced");
      // node_algo: stability 5 (<7) → beginner
      expect(profile.skillLevel["node_algo"]).toBe("beginner");
    });

    it("正确计算平均专注时长（仅 actualMinutes>0 的样本）", async () => {
      await seedProfileData();
      const profile = await buildUserProfile();
      // (30 + 40) / 2 = 35
      expect(profile.averageSessionMinutes).toBe(35);
    });

    it("正确推断偏好时段", async () => {
      await seedProfileData();
      const profile = await buildUserProfile();
      // 06:30 和 12:30 各 1 次 → 两个时段
      expect(profile.preferredTimeSlots).toContain("06:00-06:59");
      expect(profile.preferredTimeSlots).toContain("12:00-12:59");
    });

    it("空数据库时不抛错，返回空画像", async () => {
      const profile = await buildUserProfile();
      expect(profile.id).toBe("ai:profile");
      expect(profile.skillLevel).toEqual({});
      expect(profile.preferredTimeSlots).toEqual([]);
      expect(profile.averageSessionMinutes).toBe(0);
    });
  });
});

// ============ 测试辅助函数 ============

function makeLearnLog(id: string, timestamp: string): LearnLog {
  return {
    id,
    planId: "p1",
    date: "2026-07-13",
    timestamp,
    type: "learn",
  };
}

/** 构造一组固定测试数据并写入 IndexedDB */
async function seedProfileData(): Promise<void> {
  // ReviewCard：两个节点，stability 分别为 25（advanced）和 5（beginner）
  const cards: ReviewCard[] = [
    {
      id: "c1",
      planId: "p1",
      nodeId: "node_react",
      questionId: "q1",
      front: "f",
      back: "b",
      due: "2026-07-13T00:00:00.000Z",
      stability: 25,
      difficulty: 5,
      elapsedDays: 0,
      scheduledDays: 1,
      reps: 3,
      lapses: 0,
      state: 2,
      lastReview: "2026-07-12T00:00:00.000Z",
    },
    {
      id: "c2",
      planId: "p1",
      nodeId: "node_algo",
      questionId: "q2",
      front: "f",
      back: "b",
      due: "2026-07-13T00:00:00.000Z",
      stability: 5,
      difficulty: 8,
      elapsedDays: 0,
      scheduledDays: 1,
      reps: 1,
      lapses: 2,
      state: 1,
      lastReview: "2026-07-12T00:00:00.000Z",
    },
  ];
  for (const c of cards) {
    await setItem(KEY_PREFIXES.CARD + c.id, c);
  }

  // ReviewLog：node_react 全对（rating 3|4），node_algo 全错（rating 1|2）
  const reviewLogs: ReviewLog[] = [
    { id: "r1", cardId: "c1", date: "2026-07-12", rating: 3, elapsedDays: 1, stateBefore: 1, stateAfter: 2 },
    { id: "r2", cardId: "c1", date: "2026-07-13", rating: 4, elapsedDays: 1, stateBefore: 2, stateAfter: 2 },
    { id: "r3", cardId: "c2", date: "2026-07-13", rating: 1, elapsedDays: 0, stateBefore: 0, stateAfter: 1 },
    { id: "r4", cardId: "c2", date: "2026-07-13", rating: 2, elapsedDays: 0, stateBefore: 1, stateAfter: 1 },
  ];
  for (const r of reviewLogs) {
    await setItem(KEY_PREFIXES.REVIEW_LOG + r.id, r);
  }

  // LearnLog：06:30 和 12:30 各一次
  const learnLogs: LearnLog[] = [
    makeLearnLog("ll1", "2026-07-13T06:30:00+08:00"),
    makeLearnLog("ll2", "2026-07-13T12:30:00+08:00"),
  ];
  for (const l of learnLogs) {
    await setItem(KEY_PREFIXES.LEARN_LOG + l.id, l);
  }

  // EnergySample：两个有效样本（30 + 40 = 70 / 2 = 35）
  const energySamples: EnergySample[] = [
    {
      id: "e1",
      date: "2026-07-12",
      energy: 4,
      mood: "good",
      availableMinutes: 60,
      predictedLoad: 1,
      actualMinutes: 30,
      createdAt: "2026-07-12T00:00:00.000Z",
    },
    {
      id: "e2",
      date: "2026-07-13",
      energy: 3,
      mood: "neutral",
      availableMinutes: 45,
      predictedLoad: 1,
      actualMinutes: 40,
      createdAt: "2026-07-13T00:00:00.000Z",
    },
  ];
  for (const e of energySamples) {
    await setItem(KEY_PREFIXES.ENERGY_SAMPLE + e.id, e);
  }
}
