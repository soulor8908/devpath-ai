import { describe, it, expect } from "vitest";
import {
  predictActualMinutesWithFallback,
  scoreFeasibility,
  suggestDowngrade,
} from "../lib/ai/plan-feasibility";
import type { TrainedModel } from "../lib/energy-regression";
import type { UserProfile } from "../lib/types";

// ============ 测试夹具 ============

/**
 * 构造 TrainedModel：y = bias + w1*energy + w2*moodNumeric + w3*availableMinutes
 * moodNumeric: bad=0 / neutral=1 / good=2
 */
function makeModel(
  weights: [number, number, number, number],
  sampleCount = 20,
): TrainedModel {
  return {
    weights,
    bias: weights[0],
    sampleCount,
    trainedAt: "2026-07-01T00:00:00.000Z",
  };
}

function makeProfile(over: Partial<UserProfile> = {}): UserProfile {
  return {
    id: "ai:profile",
    skillLevel: {},
    accuracyByNode: {},
    preferredTimeSlots: [],
    averageSessionMinutes: 0,
    goals: { short: [], mid: [], long: [] },
    updatedAt: "2026-07-01T00:00:00.000Z",
    ...over,
  };
}

// ============ predictActualMinutesWithFallback ============

describe("predictActualMinutesWithFallback", () => {
  it("无模型时返回 availableMinutes * 0.7 + isEstimate=true（冷启动）", () => {
    const result = predictActualMinutesWithFallback(null, 3, "neutral", 100);
    expect(result.predicted).toBeCloseTo(70, 5);
    expect(result.isEstimate).toBe(true);
  });

  it("无模型 + availableMinutes=0 → predicted=0", () => {
    const result = predictActualMinutesWithFallback(null, 3, "neutral", 0);
    expect(result.predicted).toBe(0);
    expect(result.isEstimate).toBe(true);
  });

  it("无模型 + availableMinutes 为负 → predicted 钳制为 0", () => {
    const result = predictActualMinutesWithFallback(null, 3, "neutral", -50);
    expect(result.predicted).toBe(0);
    expect(result.isEstimate).toBe(true);
  });

  it("有模型时调用 predictActualMinutes + isEstimate=false", () => {
    // y = 10 + 5*energy + 2*moodNumeric + 0.5*availableMinutes
    // energy=3, mood="neutral"(1), available=100 → 10 + 15 + 2 + 50 = 77
    const model = makeModel([10, 5, 2, 0.5]);
    const result = predictActualMinutesWithFallback(model, 3, "neutral", 100);
    expect(result.predicted).toBeCloseTo(77, 5);
    expect(result.isEstimate).toBe(false);
  });

  it("有模型但预测为负 → 钳制为 0", () => {
    // y = -100 + 1*energy + 0*mood + 0*available → energy=3 → -97 → 0
    const model = makeModel([-100, 1, 0, 0]);
    const result = predictActualMinutesWithFallback(model, 3, "neutral", 100);
    expect(result.predicted).toBe(0);
    expect(result.isEstimate).toBe(false);
  });
});

// ============ scoreFeasibility ============

describe("scoreFeasibility", () => {
  it("confidence < 0.5 时返回 feasible=false + downgradePlan", async () => {
    // 模型预测远低于 dailyMinutes：y = 0 + 0*energy + 0*mood + 0.3*available
    // available=dailyMinutes=100 → predicted = 30 → confidence = 0.3 < 0.5
    const model = makeModel([0, 0, 0, 0.3]);
    const plan = { dailyMinutes: 100, maxNewPerDay: 3 };

    const result = await scoreFeasibility(plan, null, model);

    expect(result.feasible).toBe(false);
    expect(result.confidence).toBeCloseTo(0.3, 5);
    expect(result.risks.length).toBeGreaterThan(0);
    expect(result.suggestions.length).toBeGreaterThan(0);
    expect(result.downgradePlan).toBeDefined();
    // 降级参数：weeklyShortfall = (100-30)*7 = 490 min → ceil(490/60) ≈ 8 h
    expect(result.downgradePlan!.reduceHoursPerWeek).toBeGreaterThanOrEqual(1);
    expect(result.downgradePlan!.reduceNewPerDay).toBeGreaterThanOrEqual(1);
  });

  it("无模型 + 无画像（冷启动 0.7）→ confidence=0.7 → feasible=true", async () => {
    // predicted = 100 * 0.7 = 70, confidence = 70/100 = 0.7
    const plan = { dailyMinutes: 100, maxNewPerDay: 2 };

    const result = await scoreFeasibility(plan, null, null);

    expect(result.feasible).toBe(true);
    expect(result.confidence).toBeCloseTo(0.7, 5);
    expect(result.downgradePlan).toBeUndefined();
    // confidence < 1 时应给出"留有余量"建议
    expect(result.suggestions.length).toBeGreaterThan(0);
  });

  it("profile.averageSessionMinutes 优先于模型预测", async () => {
    // profile 给出 50 分钟，但模型预测应更高；应采用 profile 的 50
    // confidence = 50/100 = 0.5 → feasible=true（>= 阈值）
    const profile = makeProfile({ averageSessionMinutes: 50 });
    // 模型预测：y = 0 + 0 + 0 + 1.0*100 = 100（若被使用则 confidence=1.0）
    const model = makeModel([0, 0, 0, 1.0]);
    const plan = { dailyMinutes: 100, maxNewPerDay: 2 };

    const result = await scoreFeasibility(plan, profile, model);

    expect(result.confidence).toBeCloseTo(0.5, 5);
    expect(result.feasible).toBe(true);
  });

  it("profile.averageSessionMinutes 过低 → confidence<0.5 → feasible=false + downgradePlan", async () => {
    // profile 给出 30 分钟，plan 要求 100 → confidence = 0.3
    const profile = makeProfile({ averageSessionMinutes: 30 });
    const plan = { dailyMinutes: 100, maxNewPerDay: 3 };

    const result = await scoreFeasibility(plan, profile, null);

    expect(result.feasible).toBe(false);
    expect(result.confidence).toBeCloseTo(0.3, 5);
    expect(result.downgradePlan).toBeDefined();
  });

  it("predicted > dailyMinutes → confidence 钳制为 1，feasible=true，无 risks", async () => {
    // profile 给出 150 分钟，plan 要求 100 → confidence = min(1, 1.5) = 1
    const profile = makeProfile({ averageSessionMinutes: 150 });
    const plan = { dailyMinutes: 100, maxNewPerDay: 2 };

    const result = await scoreFeasibility(plan, profile, null);

    expect(result.feasible).toBe(true);
    expect(result.confidence).toBe(1);
    expect(result.risks).toHaveLength(0);
    expect(result.downgradePlan).toBeUndefined();
  });

  it("dailyMinutes=0 → confidence=1，feasible=true（避免除零）", async () => {
    const plan = { dailyMinutes: 0, maxNewPerDay: 1 };
    const result = await scoreFeasibility(plan, null, null);
    expect(result.confidence).toBe(1);
    expect(result.feasible).toBe(true);
  });
});

// ============ suggestDowngrade ============

describe("suggestDowngrade", () => {
  it("predicted >= dailyMinutes → 空降级方案（无需缩减）", () => {
    const plan = { dailyMinutes: 60, maxNewPerDay: 3 };
    // predicted=90 > 60 → ratio=1, weeklyShortfall=0
    const result = suggestDowngrade(plan, 90);
    expect(result).toEqual({});
  });

  it("dailyMinutes <= 0 → 空降级方案", () => {
    const plan = { dailyMinutes: 0, maxNewPerDay: 3 };
    const result = suggestDowngrade(plan, 0);
    expect(result).toEqual({});
  });

  it("正常降级：predicted=40, dailyMinutes=100, maxNewPerDay=3", () => {
    const plan = { dailyMinutes: 100, maxNewPerDay: 3 };
    const result = suggestDowngrade(plan, 40);
    // ratio = 0.4
    // weeklyShortfallMin = (100-40)*7 = 420 → reduceHoursPerWeek = max(1, round(420/60)) = 7
    // suggestedNew = max(1, floor(3*0.4)) = max(1, 1) = 1 → reduceNewPerDay = 3-1 = 2
    expect(result.reduceHoursPerWeek).toBe(7);
    expect(result.reduceNewPerDay).toBe(2);
  });

  it("predicted=0 → 全量缩减（保留至少 1 个新学节点）", () => {
    const plan = { dailyMinutes: 100, maxNewPerDay: 4 };
    const result = suggestDowngrade(plan, 0);
    // ratio = 0, weeklyShortfall = 700 → reduceHoursPerWeek = round(700/60) ≈ 12
    // suggestedNew = max(1, 0) = 1 → reduceNewPerDay = 4-1 = 3
    expect(result.reduceHoursPerWeek).toBeGreaterThanOrEqual(1);
    expect(result.reduceNewPerDay).toBe(3);
  });

  it("maxNewPerDay=1 时 reduceNewPerDay 不出现（无法再减）", () => {
    // plan.maxNewPerDay=1, suggestedNew = max(1, floor(1*ratio)) = 1 → reduceNewPerDay = 0
    const plan = { dailyMinutes: 100, maxNewPerDay: 1 };
    const result = suggestDowngrade(plan, 50);
    expect(result.reduceHoursPerWeek).toBeGreaterThanOrEqual(1);
    expect(result.reduceNewPerDay).toBeUndefined();
  });
});
