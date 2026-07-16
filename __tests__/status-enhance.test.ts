import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("../lib/ai/provider", () => ({
  hasAIKey: () => true,
  getModel: () => ({}),
}));

import { enhanceAdjustment } from "../lib/ai/status-enhance";

describe("status-enhance", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("连续 3 天低能量 → 建议休息", async () => {
    const result = await enhanceAdjustment({ consecutiveLowDays: 3, nodeFailCount: {} });
    expect(result.length).toBeGreaterThan(0);
    expect(result.some((s) => s.includes("休息"))).toBe(true);
  });

  it("某节点连续 3 次评分低 → 建议补学", async () => {
    const result = await enhanceAdjustment({
      consecutiveLowDays: 0,
      nodeFailCount: { "React 重渲染优化": 3 },
    });
    expect(result.some((s) => s.includes("React 重渲染优化"))).toBe(true);
  });

  it("无触发条件 → 返回空数组", async () => {
    const result = await enhanceAdjustment({ consecutiveLowDays: 0, nodeFailCount: {} });
    expect(result).toEqual([]);
  });

  it("同时满足两个条件 → 返回两条建议", async () => {
    const result = await enhanceAdjustment({
      consecutiveLowDays: 3,
      nodeFailCount: { "diff 算法": 3 },
    });
    expect(result.length).toBeGreaterThanOrEqual(2);
  });
});
