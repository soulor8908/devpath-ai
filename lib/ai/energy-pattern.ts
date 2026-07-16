// lib/ai/energy-pattern.ts
// 聚合 28 天能量数据，按周几算平均，可选 AI 生成洞察与建议
// 扩展：情绪 + 多巴胺联合分析（情绪标签 / 多巴胺干扰 / 高干扰日期）

import { hasAIKey, getModel } from "./provider";
import { generateText } from "ai";
import { getPrompt } from "./prompts";
import type { DailyStatus, EnergyPattern, EmotionEntry, EmotionTag, DopamineTrigger } from "../types";

// 从 Prompt Registry 读取
const PROMPT_DEF = getPrompt("energy_pattern");

const WEEKDAY_NAMES = ["周一", "周二", "周三", "周四", "周五", "周六", "周日"];

const EMOTION_TAGS: EmotionTag[] = [
  "焦虑", "兴奋", "疲惫", "烦躁", "满足", "冲动", "平静", "沮丧",
];

const DOPAMINE_TRIGGERS: DopamineTrigger[] = ["无", "刷手机", "游戏", "短视频", "甜食", "其他"];

/**
 * 按周一..周日聚合平均能量
 * JS getDay(): 0=周日, 1=周一..6=周六
 * 输出顺序：[周一, 周二, ..., 周日]
 */
export function aggregateByWeekday(statuses: DailyStatus[]): number[] {
  const sums = [0, 0, 0, 0, 0, 0, 0];
  const counts = [0, 0, 0, 0, 0, 0, 0];
  for (const s of statuses) {
    const jsDay = new Date(s.date + "T00:00:00+08:00").getDay();
    const idx = jsDay === 0 ? 6 : jsDay - 1;
    sums[idx] += s.energy;
    counts[idx] += 1;
  }
  return sums.map((sum, i) => (counts[i] === 0 ? 0 : Number((sum / counts[i]).toFixed(2))));
}

/**
 * 聚合情绪标签出现次数（最近 28 天 EmotionEntry）
 */
export function aggregateEmotionCounts(emotions: EmotionEntry[]): Record<EmotionTag, number> {
  const counts = {} as Record<EmotionTag, number>;
  for (const t of EMOTION_TAGS) counts[t] = 0;
  for (const e of emotions) {
    if (counts[e.tag] !== undefined) counts[e.tag]++;
  }
  return counts;
}

/**
 * 聚合多巴胺干扰来源次数（合并 DailyStatus.dopamineTrigger 与 EmotionEntry.dopamine）
 * - "无" 也计入
 * - highDopamineDates: dopamine != "无" 的日期集合（去重、升序）
 */
export function aggregateDopamine(
  statuses: DailyStatus[],
  emotions: EmotionEntry[] = [],
): { counts: Record<DopamineTrigger, number>; highDopamineDates: string[] } {
  const counts = {} as Record<DopamineTrigger, number>;
  for (const d of DOPAMINE_TRIGGERS) counts[d] = 0;

  const highDates = new Set<string>();

  // 来自 DailyStatus
  for (const s of statuses) {
    const t = s.dopamineTrigger;
    if (!t) continue; // 旧数据无此字段，忽略
    counts[t] = (counts[t] ?? 0) + 1;
    if (t !== "无") highDates.add(s.date);
  }

  // 来自 EmotionEntry
  for (const e of emotions) {
    counts[e.dopamine] = (counts[e.dopamine] ?? 0) + 1;
    if (e.dopamine !== "无") highDates.add(e.date);
  }

  return {
    counts,
    highDopamineDates: Array.from(highDates).sort(),
  };
}

/**
 * 多巴胺干扰与学习时长的交叉分析：
 * - 高多巴胺日的平均学习时长 vs 无干扰日的平均学习时长
 * - 返回比值（高/低），<1 表示高多巴胺日学习时长下降
 */
export function dopamineVsLearnMinutes(
  statuses: DailyStatus[],
  highDopamineDates: string[],
  learnLogs: { date: string; duration: number }[] = [],
): { highAvg: number; lowAvg: number; ratio: number } {
  const sumBy = (dates: string[]) => {
    const set = new Set(dates);
    const matched = learnLogs.filter((l) => set.has(l.date));
    if (matched.length === 0) return 0;
    return matched.reduce((s, l) => s + (l.duration ?? 0), 0) / matched.length;
  };
  const highAvg = sumBy(highDopamineDates);
  const lowDates = statuses
    .filter((s) => !s.dopamineTrigger || s.dopamineTrigger === "无")
    .map((s) => s.date);
  const lowAvg = sumBy(lowDates);
  const ratio = lowAvg === 0 ? 0 : Number((highAvg / lowAvg).toFixed(2));
  return { highAvg: Number(highAvg.toFixed(2)), lowAvg: Number(lowAvg.toFixed(2)), ratio };
}

/**
 * 分析 28 天能量 + 情绪 + 多巴胺联合模式
 * - 聚合周几平均能量
 * - 聚合情绪标签次数、多巴胺干扰次数
 * - 有 AI key 时调用 LLM 生成 insights + recommendations（喂入情绪+多巴胺数据）
 * - 无 AI 或失败时降级为规则模板
 *
 * @param statuses 最近 28 天 DailyStatus
 * @param emotions  最近 28 天 EmotionEntry（可选，来自情绪觉察流程）
 */
export async function analyzeEnergyPattern(
  statuses: DailyStatus[],
  emotions: EmotionEntry[] = [],
): Promise<EnergyPattern> {
  const avgEnergyByWeekday = aggregateByWeekday(statuses);
  const weekStart = statuses.length > 0 ? statuses[0].date : new Date().toISOString().slice(0, 10);

  const emotionCounts = aggregateEmotionCounts(emotions);
  const { counts: dopamineCounts, highDopamineDates } = aggregateDopamine(statuses, emotions);

  const minIdx = avgEnergyByWeekday.indexOf(Math.min(...avgEnergyByWeekday.filter((v) => v > 0)));
  const maxIdx = avgEnergyByWeekday.indexOf(Math.max(...avgEnergyByWeekday));

  const fallbackInsights: string[] = [];
  const fallbackRecs: string[] = [];

  if (avgEnergyByWeekday.some((v) => v > 0)) {
    if (minIdx >= 0) fallbackInsights.push(`${WEEKDAY_NAMES[minIdx]}是你的低能量日（平均 ${avgEnergyByWeekday[minIdx]} 分）`);
    if (maxIdx >= 0) fallbackInsights.push(`${WEEKDAY_NAMES[maxIdx]}是你的高能量日（平均 ${avgEnergyByWeekday[maxIdx]} 分）`);
    if (minIdx >= 0) fallbackRecs.push(`建议${WEEKDAY_NAMES[minIdx]}只做轻度复习，不学新内容`);
    if (maxIdx >= 0) fallbackRecs.push(`建议${WEEKDAY_NAMES[maxIdx]}安排最难的知识节点`);
  }
  if (statuses.filter((s) => s.energy < 3).length >= 7) {
    fallbackInsights.push("近 28 天有 7 天以上低能量，可能存在过度疲劳");
    fallbackRecs.push("建议安排一个零学习日恢复");
  }

  // 情绪模式识别（规则降级）
  const topEmotion = (Object.entries(emotionCounts) as [EmotionTag, number][])
    .sort((a, b) => b[1] - a[1])[0];
  if (topEmotion && topEmotion[1] > 0) {
    fallbackInsights.push(`最近最常见的情绪是「${topEmotion[0]}」（${topEmotion[1]} 次）`);
    if (topEmotion[0] === "焦虑" || topEmotion[0] === "烦躁" || topEmotion[0] === "沮丧") {
      fallbackRecs.push(`高频「${topEmotion[0]}」情绪，建议在学习前做 478 呼吸或散步放松`);
    }
  }

  // 多巴胺模式识别（规则降级）
  const topDopamine = (Object.entries(dopamineCounts) as [DopamineTrigger, number][])
    .filter(([k]) => k !== "无")
    .sort((a, b) => b[1] - a[1])[0];
  if (topDopamine && topDopamine[1] > 0) {
    fallbackInsights.push(`最近最大干扰源是「${topDopamine[0]}」（${topDopamine[1]} 次）`);
    fallbackRecs.push(`建议在「${topDopamine[0]}」高发时段提前把手机放远或开启专注模式`);
  }
  if (highDopamineDates.length >= 5) {
    fallbackInsights.push(`近 28 天有 ${highDopamineDates.length} 天出现多巴胺干扰`);
  }

  if (!hasAIKey() || statuses.length === 0) {
    return {
      weekStart,
      avgEnergyByWeekday,
      insights: fallbackInsights,
      recommendations: fallbackRecs,
      emotionCounts,
      dopamineCounts,
      highDopamineDates,
    };
  }

  try {
    const model = getModel();
    const dataStr = avgEnergyByWeekday.map((v, i) => `${WEEKDAY_NAMES[i]}: ${v}`).join(", ");
    const emotionStr = (Object.entries(emotionCounts) as [EmotionTag, number][])
      .filter(([, n]) => n > 0)
      .map(([k, n]) => `${k}=${n}`)
      .join(", ");
    const dopamineStr = (Object.entries(dopamineCounts) as [DopamineTrigger, number][])
      .filter(([k, n]) => k !== "无" && n > 0)
      .map(([k, n]) => `${k}=${n}`)
      .join(", ");

    const { text } = await generateText({
      model,
      system: PROMPT_DEF.system,
      prompt:
        `周几平均能量：${dataStr}\n` +
        `情绪标签次数：${emotionStr || "无记录"}\n` +
        `多巴胺干扰次数：${dopamineStr || "无记录"}\n` +
        `高多巴胺干扰日数：${highDopamineDates.length}`,
    });
    const parsed = JSON.parse(text) as { insights: string[]; recommendations: string[] };
    return {
      weekStart,
      avgEnergyByWeekday,
      insights: Array.isArray(parsed.insights) ? parsed.insights : fallbackInsights,
      recommendations: Array.isArray(parsed.recommendations) ? parsed.recommendations : fallbackRecs,
      emotionCounts,
      dopamineCounts,
      highDopamineDates,
    };
  } catch {
    return {
      weekStart,
      avgEnergyByWeekday,
      insights: fallbackInsights,
      recommendations: fallbackRecs,
      emotionCounts,
      dopamineCounts,
      highDopamineDates,
    };
  }
}
