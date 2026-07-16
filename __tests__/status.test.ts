import { describe, it, expect } from "vitest";
import { adjustDailyLoad, computeCapacity } from "../lib/status";
import type { ScheduleItem, DailyStatus } from "../lib/types";

function makeStatus(partial: Partial<DailyStatus>): DailyStatus {
  return {
    date: "2026-07-13",
    energy: 3,
    mood: "neutral",
    availableMinutes: 30,
    aiAdjustedLoad: 1,
    actualMinutes: 0,
    ...partial,
  };
}

function makePlan(): ScheduleItem[] {
  return [
    { day: 1, nodeId: "k1", type: "learn", estimatedMinutes: 20, completed: false },
    { day: 1, nodeId: "k2", type: "learn", estimatedMinutes: 20, completed: false },
    { day: 1, nodeId: "k1", type: "review", cardId: "c1", estimatedMinutes: 10, completed: false },
    { day: 1, nodeId: "k2", type: "review", cardId: "c2", estimatedMinutes: 10, completed: false },
  ];
}

describe("status", () => {
  it("computeCapacity 公式正确", () => {
    expect(computeCapacity(makeStatus({ energy: 3, mood: "neutral", availableMinutes: 30 }))).toBeCloseTo(1.0, 5);
    expect(computeCapacity(makeStatus({ energy: 5, mood: "good", availableMinutes: 60 }))).toBeCloseTo(3.333, 3);
    expect(computeCapacity(makeStatus({ energy: 1, mood: "bad", availableMinutes: 10 }))).toBeCloseTo(0.0778, 3);
  });

  it("capacity < 0.5 → 只复习不学新", () => {
    const status = makeStatus({ energy: 1, mood: "bad", availableMinutes: 10 });
    const result = adjustDailyLoad(makePlan(), status);
    expect(result.every((i) => i.type === "review")).toBe(true);
    expect(result).toHaveLength(2);
  });

  it("capacity 0.5-1.0 → 新内容减半", () => {
    const status = makeStatus({ energy: 2, mood: "neutral", availableMinutes: 30 });
    const result = adjustDailyLoad(makePlan(), status);
    const learnCount = result.filter((i) => i.type === "learn").length;
    expect(learnCount).toBe(1);
    expect(result.filter((i) => i.type === "review")).toHaveLength(2);
  });

  it("capacity 1.0-1.2 → 保持原计划", () => {
    const status = makeStatus({ energy: 3, mood: "neutral", availableMinutes: 30 });
    const result = adjustDailyLoad(makePlan(), status);
    expect(result).toHaveLength(makePlan().length);
  });

  it("capacity > 1.5 → 加学一个节点", () => {
    const status = makeStatus({ energy: 5, mood: "good", availableMinutes: 60 });
    const result = adjustDailyLoad(makePlan(), status);
    const learnCount = result.filter((i) => i.type === "learn").length;
    expect(learnCount).toBe(3);
  });

  it("capacity 1.2-1.5 → 加学一个节点", () => {
    const status = makeStatus({ energy: 4, mood: "good", availableMinutes: 45 });
    // (4/3) * 1 * (45/30) = 2.0 > 1.5 也加量，换个值: energy=4, min=33 → 1.466
    const status2 = makeStatus({ energy: 4, mood: "good", availableMinutes: 33 });
    const cap = computeCapacity(status2);
    expect(cap).toBeGreaterThan(1.2);
    expect(cap).toBeLessThanOrEqual(1.5);
    const result = adjustDailyLoad(makePlan(), status2);
    const learnCount = result.filter((i) => i.type === "learn").length;
    expect(learnCount).toBe(3);
  });
});
