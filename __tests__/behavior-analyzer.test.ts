import { describe, it, expect } from "vitest";
import {
  inferBehaviorState,
  inferPreferredSlot,
  generateEnhancedInsight,
  type BehaviorSignals,
} from "@/lib/ai/behavior-analyzer";

const baseSignals: BehaviorSignals = {
  recentLogs: [],
  todayCorrect: 0,
  todayTotal: 0,
  todayFocusMinutes: 0,
  todayInterruptions: 0,
  streak: 0,
  studyHourDistribution: new Array(24).fill(0),
};

describe("inferBehaviorState", () => {
  it("专注时长长+打断少 → 高能量", () => {
    const state = inferBehaviorState({
      ...baseSignals,
      todayFocusMinutes: 50,
      todayInterruptions: 0,
    });
    expect(state.energy).toBe(5);
  });

  it("今日未学习 → 能量1", () => {
    const state = inferBehaviorState(baseSignals);
    expect(state.energy).toBe(1);
  });

  it("正确率高+连续打卡 → confident", () => {
    const state = inferBehaviorState({
      ...baseSignals,
      todayCorrect: 4,
      todayTotal: 5,
      streak: 14,
      todayFocusMinutes: 30,
    });
    expect(state.mood).toBe("confident");
    expect(state.recommendedPersona).toBe("strict");
  });

  it("正确率低 → frustrated → gentle", () => {
    const state = inferBehaviorState({
      ...baseSignals,
      todayCorrect: 1,
      todayTotal: 5,
      todayFocusMinutes: 20,
    });
    expect(state.mood).toBe("frustrated");
    expect(state.recommendedPersona).toBe("gentle");
  });

  it("长时间学习+效果差 → burnout → peer", () => {
    const state = inferBehaviorState({
      ...baseSignals,
      todayCorrect: 2,
      todayTotal: 5,
      todayFocusMinutes: 100,
      streak: 3,
    });
    expect(state.mood).toBe("burnout");
    expect(state.recommendedPersona).toBe("peer");
  });

  it("推断结果包含可解释性理由", () => {
    const state = inferBehaviorState({
      ...baseSignals,
      todayFocusMinutes: 50,
      todayInterruptions: 0,
      streak: 7,
      todayCorrect: 4,
      todayTotal: 5,
    });
    expect(state.reasons.length).toBeGreaterThan(0);
    expect(state.reasons.some(r => r.includes("能量"))).toBe(true);
  });
});

describe("inferPreferredSlot", () => {
  it("无数据返回 null", () => {
    expect(inferPreferredSlot(new Array(24).fill(0))).toBeNull();
  });

  it("早上学习最多 → morning", () => {
    const dist = new Array(24).fill(0);
    dist[8] = 5; dist[9] = 3; dist[10] = 2;
    expect(inferPreferredSlot(dist)).toBe("morning");
  });

  it("晚上学习最多 → evening", () => {
    const dist = new Array(24).fill(0);
    dist[20] = 5; dist[21] = 3;
    expect(inferPreferredSlot(dist)).toBe("evening");
  });
});

describe("generateEnhancedInsight", () => {
  it("连续打卡7天 → celebrating", () => {
    const insight = generateEnhancedInsight(
      { energy: 4, mood: "confident", recommendedPersona: "strict", reasons: [] },
      "evening",
      7
    );
    expect(insight.tone).toBe("celebrating");
    expect(insight.message).toContain("7");
  });

  it("能量1(未学习) → reminding", () => {
    const insight = generateEnhancedInsight(
      { energy: 1, mood: "neutral", recommendedPersona: "socratic", reasons: [] },
      null,
      0
    );
    expect(insight.tone).toBe("reminding");
  });

  it("frustrated → encouraging", () => {
    const insight = generateEnhancedInsight(
      { energy: 3, mood: "frustrated", recommendedPersona: "gentle", reasons: [] },
      null,
      3
    );
    expect(insight.tone).toBe("encouraging");
  });
});
