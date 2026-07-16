import { describe, it, expect, vi } from "vitest";

vi.mock("../lib/ai/provider", () => ({
  hasAIKey: () => false,
  getModel: () => ({}),
}));

import { analyzeEnergyPattern, aggregateByWeekday } from "../lib/ai/energy-pattern";
import type { DailyStatus } from "../lib/types";

function makeStatus(date: string, energy: 1 | 2 | 3 | 4 | 5): DailyStatus {
  return {
    date,
    energy,
    mood: "neutral",
    availableMinutes: 30,
    aiAdjustedLoad: 1,
    actualMinutes: 30,
  };
}

// 28 天数据，2026-06-15（周一）起
function make28Days(): DailyStatus[] {
  const out: DailyStatus[] = [];
  // 使用 UTC 午夜，避免 toISOString() 因 +08:00 偏移把日期退回前一天
  const start = new Date("2026-06-15T00:00:00Z");
  for (let i = 0; i < 28; i++) {
    const d = new Date(start);
    d.setUTCDate(d.getUTCDate() + i);
    const iso = d.toISOString().slice(0, 10);
    out.push(makeStatus(iso, (i % 5) + 1 as 1 | 2 | 3 | 4 | 5));
  }
  return out;
}

describe("energy-pattern", () => {
  it("aggregateByWeekday 返回长度 7", () => {
    const arr = aggregateByWeekday(make28Days());
    expect(arr).toHaveLength(7);
    arr.forEach((v) => expect(typeof v).toBe("number"));
  });

  it("analyzeEnergyPattern 返回 avgEnergyByWeekday 长度 7", async () => {
    const pattern = await analyzeEnergyPattern(make28Days());
    expect(pattern.avgEnergyByWeekday).toHaveLength(7);
    expect(pattern.weekStart).toBe("2026-06-15");
    expect(Array.isArray(pattern.insights)).toBe(true);
    expect(Array.isArray(pattern.recommendations)).toBe(true);
  });

  it("空数据 → 返回全 0 数组", async () => {
    const pattern = await analyzeEnergyPattern([]);
    expect(pattern.avgEnergyByWeekday).toEqual([0, 0, 0, 0, 0, 0, 0]);
  });
});
