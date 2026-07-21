import { describe, it, expect, vi } from "vitest";

vi.mock("../lib/ai/provider", () => ({
  hasAIKey: () => false,
  getModel: () => ({}),
}));

import { generateWeeklyReport } from "../lib/ai/weekly-report";
import type { LearnLog, ReviewLog, DailyStatus, EmotionEntry } from "../lib/types";

function makeStatus(
  date: string,
  dopamine?: DailyStatus["dopamineTrigger"],
): DailyStatus {
  return {
    date,
    energy: 3,
    mood: "neutral",
    availableMinutes: 30,
    aiAdjustedLoad: 1,
    actualMinutes: 30,
    dopamineTrigger: dopamine,
  };
}

function makeEmotion(
  date: string,
  tag: EmotionEntry["tag"],
  dopamine: EmotionEntry["dopamine"],
): EmotionEntry {
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

describe("weekly-report: 情绪 + 多巴胺章节", () => {
  it("有情绪+多巴胺数据 → 周报含「情绪与多巴胺模式」章节", async () => {
    const start = "2026-07-06"; // 周一
    const dates = ["2026-07-06", "2026-07-07", "2026-07-08", "2026-07-09", "2026-07-10", "2026-07-11", "2026-07-12"];

    const learnLogs: LearnLog[] = dates.map((d, i) => ({
      id: `l${i}`,
      planId: "p1",
      nodeId: "k1",
      date: d,
      duration: 30,
      type: i % 2 === 0 ? "learn" : "review",
    }));
    const reviewLogs: ReviewLog[] = [];
    // 高干扰日 (刷手机) 学习时长 10 分钟；无干扰日 50 分钟
    const statuses: DailyStatus[] = [
      makeStatus("2026-07-06", "刷手机"),
      makeStatus("2026-07-07", "无"),
    ];
    const emotions: EmotionEntry[] = [
      makeEmotion("2026-07-06", "焦虑", "刷手机"),
      makeEmotion("2026-07-07", "满足", "无"),
    ];
    // 调整 learnLogs：07-06 高干扰 10 min，07-07 无干扰 50 min
    learnLogs[0].duration = 10;
    learnLogs[1].duration = 50;

    const report = await generateWeeklyReport({
      learnLogs,
      reviewLogs,
      statuses,
      emotions,
      weekStart: start,
    });

    expect(report.content).toContain("## 本周统计");
    expect(report.content).toContain("## 模式识别");
    expect(report.content).toContain("## 情绪与多巴胺模式");
    expect(report.content).toContain("## 下周建议");
    expect(report.content).toContain("焦虑");
    expect(report.content).toContain("刷手机");
    // 高干扰日学习时长下降提示
    expect(report.content).toContain("⚠️");
  });

  it("无情绪数据 → 周报不输出「情绪与多巴胺模式」章节（保持三段式）", async () => {
    const report = await generateWeeklyReport({
      learnLogs: [],
      reviewLogs: [],
      statuses: [],
      weekStart: "2026-07-06",
    });
    expect(report.content).toContain("## 本周统计");
    expect(report.content).toContain("## 模式识别");
    expect(report.content).not.toContain("## 情绪与多巴胺模式");
    expect(report.content).toContain("## 下周建议");
  });

  it("DailyStatus 含 dopamineTrigger 即可触发多巴胺章节（不需 EmotionEntry）", async () => {
    const report = await generateWeeklyReport({
      learnLogs: [],
      reviewLogs: [],
      statuses: [makeStatus("2026-07-06", "游戏")],
      weekStart: "2026-07-06",
    });
    expect(report.content).toContain("## 情绪与多巴胺模式");
    expect(report.content).toContain("游戏");
  });
});
