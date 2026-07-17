import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("../lib/ai/provider", () => ({
  hasAIKey: () => false,
  getModel: () => ({}),
  _resolvePrimaryEntry: () => null,
  _resolveFallbackEntry: () => null,
  wrapModelWithFallback: (m: unknown) => m,
}));

vi.mock("../lib/storage/db", () => ({
  setItem: vi.fn().mockResolvedValue(undefined),
  getItem: vi.fn().mockResolvedValue(undefined),
}));

import { POST } from "../app/api/status/route";
import type { ScheduleItem } from "../lib/types";

function makeBasePlan(): ScheduleItem[] {
  return [
    { day: 1, nodeId: "k1", type: "learn", estimatedMinutes: 20, completed: false },
    { day: 1, nodeId: "k2", type: "learn", estimatedMinutes: 20, completed: false },
    { day: 1, nodeId: "k1", type: "review", cardId: "c1", estimatedMinutes: 10, completed: false },
  ];
}

function makeRequest(body: unknown): Request {
  return new Request("http://localhost/api/status", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("/api/status", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("低能量 → learn 项数减少", async () => {
    const res = await POST(
      makeRequest({
        date: "2026-07-13",
        energy: 1,
        mood: "bad",
        availableMinutes: 10,
        basePlan: makeBasePlan(),
      }),
    );
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.adjustedPlan.filter((i: ScheduleItem) => i.type === "learn")).toHaveLength(0);
    expect(data.suggestions).toBeDefined();
    expect(Array.isArray(data.suggestions)).toBe(true);
  });

  it("正常能量 → 保持原计划", async () => {
    const res = await POST(
      makeRequest({
        date: "2026-07-13",
        energy: 3,
        mood: "neutral",
        availableMinutes: 30,
        basePlan: makeBasePlan(),
      }),
    );
    const data = await res.json();
    expect(data.adjustedPlan).toHaveLength(makeBasePlan().length);
  });

  it("缺少字段 → 400", async () => {
    const res = await POST(makeRequest({ date: "2026-07-13" }));
    expect(res.status).toBe(400);
  });
});
