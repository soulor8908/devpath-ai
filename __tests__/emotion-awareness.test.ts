import { describe, it, expect, vi } from "vitest";

vi.mock("../lib/ai/provider", () => ({
  hasAIKey: () => false,
  getModel: () => ({}),
}));

import {
  aggregateByWeekday,
  aggregateEmotionCounts,
  aggregateDopamine,
  dopamineVsLearnMinutes,
  analyzeEnergyPattern,
} from "../lib/ai/energy-pattern";
import type { DailyStatus, EmotionEntry } from "../lib/types";

function makeStatus(date: string, energy: 1 | 2 | 3 | 4 | 5, dopamine?: DailyStatus["dopamineTrigger"]): DailyStatus {
  return {
    date,
    energy,
    mood: "neutral",
    availableMinutes: 30,
    aiAdjustedLoad: 1,
    actualMinutes: 30,
    dopamineTrigger: dopamine,
  };
}

function makeEmotion(date: string, tag: EmotionEntry["tag"], dopamine: EmotionEntry["dopamine"]): EmotionEntry {
  return {
    id: `${date}_${tag}`,
    date,
    time: "10:00",
    tag,
    emoji: "❓",
    reason: "test",
    copingSuggestions: [],
    selectedCoping: [],
    customCoping: "",
    dopamine,
  };
}

describe("emotion-awareness: aggregateEmotionCounts", () => {
  it("统计 8 种情绪标签出现次数", () => {
    const counts = aggregateEmotionCounts([
      makeEmotion("2026-07-01", "焦虑", "刷手机"),
      makeEmotion("2026-07-02", "焦虑", "游戏"),
      makeEmotion("2026-07-03", "疲惫", "无"),
    ]);
    expect(counts["焦虑"]).toBe(2);
    expect(counts["疲惫"]).toBe(1);
    expect(counts["兴奋"]).toBe(0);
  });

  it("空数组 → 全部 0", () => {
    const counts = aggregateEmotionCounts([]);
    expect(Object.values(counts).every((v) => v === 0)).toBe(true);
    expect(Object.keys(counts)).toHaveLength(8);
  });
});

describe("emotion-awareness: aggregateDopamine", () => {
  it("合并 DailyStatus 与 EmotionEntry 的多巴胺来源", () => {
    const statuses = [
      makeStatus("2026-07-01", 3, "刷手机"),
      makeStatus("2026-07-02", 4, "无"),
      makeStatus("2026-07-03", 2, "短视频"),
    ];
    const emotions = [
      makeEmotion("2026-07-01", "焦虑", "刷手机"), // 与 status 同日，去重
      makeEmotion("2026-07-04", "烦躁", "游戏"),
    ];
    const { counts, highDopamineDates } = aggregateDopamine(statuses, emotions);
    expect(counts["刷手机"]).toBe(2);
    expect(counts["短视频"]).toBe(1);
    expect(counts["游戏"]).toBe(1);
    expect(counts["无"]).toBe(1);
    // 高干扰日期去重
    expect(highDopamineDates).toEqual(
      ["2026-07-01", "2026-07-03", "2026-07-04"].sort(),
    );
  });

  it("旧 DailyStatus 无 dopamineTrigger 字段 → 不报错，计入无干扰", () => {
    const statuses: DailyStatus[] = [
      { date: "2026-07-01", energy: 3, mood: "neutral", availableMinutes: 30, aiAdjustedLoad: 1, actualMinutes: 30 },
    ];
    const { counts, highDopamineDates } = aggregateDopamine(statuses, []);
    expect(counts["无"]).toBe(0); // 无 dopamineTrigger 字段不计数
    expect(highDopamineDates).toEqual([]);
  });
});

describe("emotion-awareness: dopamineVsLearnMinutes", () => {
  it("高干扰日学习时长低于无干扰日 → ratio < 1", () => {
    const statuses: DailyStatus[] = [
      makeStatus("2026-07-01", 3, "刷手机"),
      makeStatus("2026-07-02", 3, "刷手机"),
      makeStatus("2026-07-03", 3, "无"),
      makeStatus("2026-07-04", 3, "无"),
    ];
    const learnLogs = [
      { date: "2026-07-01", duration: 10 }, // 高干扰日
      { date: "2026-07-02", duration: 10 },
      { date: "2026-07-03", duration: 50 }, // 无干扰日
      { date: "2026-07-04", duration: 50 },
    ];
    const r = dopamineVsLearnMinutes(statuses, ["2026-07-01", "2026-07-02"], learnLogs);
    expect(r.highAvg).toBe(10);
    expect(r.lowAvg).toBe(50);
    expect(r.ratio).toBe(0.2);
  });

  it("无学习日志 → 全 0", () => {
    const r = dopamineVsLearnMinutes([], ["2026-07-01"], []);
    expect(r.highAvg).toBe(0);
    expect(r.lowAvg).toBe(0);
    expect(r.ratio).toBe(0);
  });
});

describe("emotion-awareness: analyzeEnergyPattern 集成", () => {
  it("含情绪+多巴胺数据 → pattern 包含 emotionCounts/dopamineCounts/highDopamineDates", async () => {
    const statuses = [
      makeStatus("2026-06-15", 3, "刷手机"),
      makeStatus("2026-06-16", 4, "无"),
      makeStatus("2026-06-17", 2, "短视频"),
    ];
    const emotions = [
      makeEmotion("2026-06-15", "焦虑", "刷手机"),
      makeEmotion("2026-06-17", "烦躁", "短视频"),
    ];
    const pattern = await analyzeEnergyPattern(statuses, emotions);
    expect(pattern.avgEnergyByWeekday).toHaveLength(7);
    expect(pattern.emotionCounts?.["焦虑"]).toBe(1);
    expect(pattern.emotionCounts?.["烦躁"]).toBe(1);
    expect(pattern.dopamineCounts?.["刷手机"]).toBeGreaterThanOrEqual(1);
    expect(pattern.highDopamineDates).toContain("2026-06-15");
    expect(pattern.highDopamineDates).toContain("2026-06-17");
    // 规则降级：高频情绪/多巴胺会出现在 insights
    expect(pattern.insights.some((s) => s.includes("焦虑") || s.includes("刷手机"))).toBe(true);
  });

  it("无情绪数据 → emotionCounts 全 0，dopamineCounts 全 0（旧 status 无字段）", async () => {
    const statuses: DailyStatus[] = [
      { date: "2026-06-15", energy: 3, mood: "neutral", availableMinutes: 30, aiAdjustedLoad: 1, actualMinutes: 30 },
    ];
    const pattern = await analyzeEnergyPattern(statuses, []);
    expect(Object.values(pattern.emotionCounts ?? {}).every((v) => v === 0)).toBe(true);
    expect(pattern.highDopamineDates).toEqual([]);
  });
});
