import { describe, it, expect, vi } from "vitest";

vi.mock("../lib/ai/provider", () => ({
  hasAIKey: () => false,
  getModel: () => ({}),
}));

import { generateWeeklyReport } from "../lib/ai/weekly-report";
import type { LearnLog, ReviewLog, DailyStatus } from "../lib/types";

function makeWeekData() {
  const learnLogs: LearnLog[] = [];
  const reviewLogs: ReviewLog[] = [];
  const statuses: DailyStatus[] = [];
  const start = new Date("2026-07-06T00:00:00+08:00"); // 周一
  for (let i = 0; i < 7; i++) {
    const d = new Date(start);
    d.setDate(d.getDate() + i);
    const iso = d.toISOString().slice(0, 10);
    learnLogs.push({
      id: `l${i}`,
      planId: "p1",
      nodeId: "k1",
      date: iso,
      duration: 30 + i * 5,
      type: i % 2 === 0 ? "learn" : "review",
    });
    reviewLogs.push({
      id: `r${i}`,
      cardId: "c1",
      date: iso,
      rating: 3,
      elapsedDays: 1,
      stateBefore: 2,
      stateAfter: 2,
    });
    statuses.push({
      date: iso,
      energy: 3,
      mood: "neutral",
      availableMinutes: 30,
      aiAdjustedLoad: 1,
      actualMinutes: 30,
    });
  }
  return { learnLogs, reviewLogs, statuses };
}

describe("weekly-report", () => {
  it("generateWeeklyReport 返回包含模式识别的 markdown", async () => {
    const { learnLogs, reviewLogs, statuses } = makeWeekData();
    const report = await generateWeeklyReport({ learnLogs, reviewLogs, statuses, weekStart: "2026-07-06" });
    expect(typeof report.content).toBe("string");
    expect(report.content).toContain("模式识别");
    expect(report.content).toContain("统计");
    expect(report.content).toContain("下周建议");
  });

  it("空数据 → 返回仍包含三段式标题", async () => {
    const report = await generateWeeklyReport({
      learnLogs: [],
      reviewLogs: [],
      statuses: [],
      weekStart: "2026-07-06",
    });
    expect(report.content).toContain("统计");
    expect(report.content).toContain("模式识别");
    expect(report.content).toContain("下周建议");
  });
});
