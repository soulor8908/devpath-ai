import { describe, it, expect, vi, beforeEach } from "vitest";

// mock plan-summary，避免触碰真实 IndexedDB
vi.mock("../lib/plan-summary", () => ({
  listPlanSummaries: vi.fn(),
  migrateSummaries: vi.fn(async () => 0),
}));

import { resolveLearnEntry } from "../lib/learn-router";
import { listPlanSummaries } from "../lib/plan-summary";
import type { LearningPlanSummary } from "../lib/types";

function makeSummary(id: string): LearningPlanSummary {
  return {
    id,
    topic: `topic-${id}`,
    knowledgeCount: 3,
    questionCount: 5,
    scheduleDays: 7,
    dailyMinutes: 30,
    maxNewPerDay: 1,
    schedule: [],
    createdAt: "2026-07-01T00:00:00.000Z",
    updatedAt: "2026-07-01T00:00:00.000Z",
  };
}

describe("resolveLearnEntry", () => {
  beforeEach(() => {
    vi.mocked(listPlanSummaries).mockReset();
    vi.mocked(listPlanSummaries).mockResolvedValue([]);
  });

  it("无计划 → 返回 /learn/new", async () => {
    vi.mocked(listPlanSummaries).mockResolvedValue([]);
    expect(await resolveLearnEntry()).toBe("/learn/new");
  });

  it("有 1 个计划 → 返回 /learn/list", async () => {
    vi.mocked(listPlanSummaries).mockResolvedValue([makeSummary("p1")]);
    expect(await resolveLearnEntry()).toBe("/learn/list");
  });

  it("有多个计划 → 返回 /learn/list", async () => {
    vi.mocked(listPlanSummaries).mockResolvedValue([
      makeSummary("p1"),
      makeSummary("p2"),
    ]);
    expect(await resolveLearnEntry()).toBe("/learn/list");
  });
});
