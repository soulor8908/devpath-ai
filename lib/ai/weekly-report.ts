// lib/ai/weekly-report.ts
// 喂入本周所有学习/复习/状态/情绪日志，AI 生成四段式 markdown 周报
// 新增：情绪模式 + 多巴胺干扰章节（无相关数据时自动省略）
// 无 AI key 时降级为统计模板

import { hasAIKey, getModel } from "./provider";
import { generateText } from "ai";
import type { LanguageModel } from "ai";
import { getPrompt } from "./prompts";
import type { LearnLog, ReviewLog, DailyStatus, EmotionEntry, DopamineTrigger, EmotionTag, TokenUsage } from "../types";

// 从 Prompt Registry 读取（基础模板含 {emotion_section} 占位符，运行时替换）
const PROMPT_DEF = getPrompt("weekly_report");

const EMOTION_SECTION_PROMPT =
  "## 情绪与多巴胺模式\n（情绪标签频率、最大干扰源、高干扰日学习时长变化，每条一行带 -）\n\n";

export interface WeeklyInput {
  learnLogs: LearnLog[];
  reviewLogs: ReviewLog[];
  statuses: DailyStatus[];
  /** 情绪觉察条目（来自 IndexedDB emotion: 前缀，可选） */
  emotions?: EmotionEntry[];
  weekStart: string; // YYYY-MM-DD 周一
}

/**
 * 周报生成结果
 * - content：四段式 markdown 周报文本
 * - usage / modelId：成本追踪用（来自 generateText 的 result.usage）
 *   未调用 LLM（降级路径）时为 undefined
 */
export interface WeeklyReportResult {
  content: string;
  /** LLM 调用返回的 token 用量，仅在走 AI 路径时存在 */
  usage?: TokenUsage;
  /** 实际使用的模型 ID（如 glm-4-flash），用于客户端成本估算 */
  modelId?: string;
}

const EMOTION_EMOJI: Record<EmotionTag, string> = {
  "焦虑": "😰",
  "兴奋": "🤩",
  "疲惫": "😴",
  "烦躁": "😤",
  "满足": "😊",
  "冲动": "🔥",
  "平静": "😌",
  "沮丧": "😞",
};

/**
 * 生成四段式 markdown 周报：
 * ## 本周统计
 * ## 模式识别
 * ## 情绪与多巴胺模式（有情绪数据时）
 * ## 下周建议
 *
 * 返回值改为对象 { content, usage?, modelId? }：
 *   - content：四段式 markdown 文本（与原字符串兼容）
 *   - usage / modelId：用于客户端成本追踪（_meta 字段）
 *   - 走 AI 路径时附 usage；降级路径（无 AI key / 失败兜底）usage 为 undefined
 */
export async function generateWeeklyReport(input: WeeklyInput, model?: LanguageModel): Promise<WeeklyReportResult> {
  const totalMinutes = input.learnLogs.reduce((sum, l) => sum + (l.duration ?? 0), 0);
  const learnCount = input.learnLogs.filter((l) => l.type === "learn").length;
  const reviewCount = input.reviewLogs.length;
  const correctCount = input.reviewLogs.filter((r) => r.rating >= 3).length;
  const accuracy = reviewCount > 0 ? Math.round((correctCount / reviewCount) * 100) : 0;
  const streakDays = new Set(input.learnLogs.map((l) => l.date)).size;
  const avgEnergy =
    input.statuses.length > 0
      ? Number((input.statuses.reduce((s, x) => s + x.energy, 0) / input.statuses.length).toFixed(2))
      : 0;

  // === 情绪与多巴胺聚合 ===
  const emotions = input.emotions ?? [];
  const emotionCounts = new Map<EmotionTag, number>();
  for (const e of emotions) {
    emotionCounts.set(e.tag, (emotionCounts.get(e.tag) ?? 0) + 1);
  }
  // DailyStatus.dopamineTrigger 与 EmotionEntry.dopamine 合并
  const dopamineCounts = new Map<DopamineTrigger, number>();
  const highDopamineDates = new Set<string>();
  for (const s of input.statuses) {
    if (!s.dopamineTrigger) continue;
    dopamineCounts.set(s.dopamineTrigger, (dopamineCounts.get(s.dopamineTrigger) ?? 0) + 1);
    if (s.dopamineTrigger !== "无") highDopamineDates.add(s.date);
  }
  for (const e of emotions) {
    dopamineCounts.set(e.dopamine, (dopamineCounts.get(e.dopamine) ?? 0) + 1);
    if (e.dopamine !== "无") highDopamineDates.add(e.date);
  }
  // 高干扰日的学习时长
  const highDopamineLearnMinutes = input.learnLogs
    .filter((l) => highDopamineDates.has(l.date))
    .reduce((s, l) => s + (l.duration ?? 0), 0);
  const noDopamineDates = new Set(
    input.statuses.filter((s) => !s.dopamineTrigger || s.dopamineTrigger === "无").map((s) => s.date),
  );
  const noDopamineLearnMinutes = input.learnLogs
    .filter((l) => noDopamineDates.has(l.date))
    .reduce((s, l) => s + (l.duration ?? 0), 0);

  const hasEmotionData = emotions.length > 0 || dopamineCounts.size > 0;

  const statsSection = `## 本周统计

- 总学习时长：**${totalMinutes} 分钟**（约 ${(totalMinutes / 60).toFixed(1)} 小时）
- 新学知识节点：${learnCount} 个
- 复习卡片：${reviewCount} 张，正确率 ${accuracy}%
- 连续打卡：${streakDays} 天
- 平均能量：${avgEnergy} / 5`;

  // === 情绪与多巴胺章节（有数据才输出） ===
  let emotionSection = "";
  if (hasEmotionData) {
    const topEmotion = Array.from(emotionCounts.entries()).sort((a, b) => b[1] - a[1])[0];
    const topDopamine = Array.from(dopamineCounts.entries())
      .filter(([k]) => k !== "无")
      .sort((a, b) => b[1] - a[1])[0];

    const lines: string[] = [];
    if (topEmotion) {
      lines.push(`- 本周最频繁情绪：${EMOTION_EMOJI[topEmotion[0]]} ${topEmotion[0]}（${topEmotion[1]} 次）`);
    }
    if (topDopamine) {
      lines.push(`- 最大干扰源：${topDopamine[0]}（${topDopamine[1]} 次）`);
    }
    if (highDopamineDates.size > 0) {
      lines.push(`- 多巴胺干扰日数：${highDopamineDates.size} 天`);
      // 交叉分析：高干扰日 vs 无干扰日学习时长
      if (noDopamineLearnMinutes > 0 && highDopamineLearnMinutes >= 0) {
        const highCount = highDopamineDates.size || 1;
        const lowCount = noDopamineDates.size || 1;
        const highAvg = (highDopamineLearnMinutes / highCount).toFixed(0);
        const lowAvg = (noDopamineLearnMinutes / lowCount).toFixed(0);
        if (Number(highAvg) < Number(lowAvg)) {
          lines.push(`- ⚠️ 高干扰日平均学习 ${highAvg} 分钟，无干扰日 ${lowAvg} 分钟——干扰显著拉低学习时长`);
        } else {
          lines.push(`- 高干扰日平均学习 ${highAvg} 分钟，无干扰日 ${lowAvg} 分钟`);
        }
      }
    }
    if (lines.length > 0) {
      emotionSection = `\n\n## 情绪与多巴胺模式\n\n${lines.join("\n")}`;
    }
  }

  // 无 AI key 降级
  if (!hasAIKey() || input.learnLogs.length === 0) {
    const insights: string[] = [];
    if (accuracy < 60) insights.push("复习正确率偏低，建议放慢新内容节奏，加强巩固");
    if (avgEnergy < 3) insights.push("本周能量偏低，注意休息");
    if (streakDays >= 5) insights.push("坚持打卡良好，保持节奏");
    if (insights.length === 0) insights.push("数据稳定，无明显异常模式");

    const recs: string[] = [];
    recs.push("维持当前每日学习量");
    if (accuracy < 60) recs.push("增加 1 次复习频率");
    if (avgEnergy < 3) recs.push("安排 1 天零学习日恢复");
    if (highDopamineDates.size >= 3) recs.push("高干扰日增多，建议提前规划专注时段（如番茄钟 + 手机远离）");

    return {
      content: `${statsSection}

## 模式识别

${insights.map((s) => `- ${s}`).join("\n")}
${emotionSection}

## 下周建议

${recs.map((s) => `- ${s}`).join("\n")}`,
    };
  }

  try {
    const aiModel = model ?? getModel();
    const dataSummary = JSON.stringify({
      totalMinutes,
      learnCount,
      reviewCount,
      accuracy,
      streakDays,
      avgEnergy,
      dailyMinutes: input.learnLogs.reduce((acc, l) => {
        acc[l.date] = (acc[l.date] ?? 0) + (l.duration ?? 0);
        return acc;
      }, {} as Record<string, number>),
      emotionCounts: Object.fromEntries(emotionCounts),
      dopamineCounts: Object.fromEntries(dopamineCounts),
      highDopamineDates: Array.from(highDopamineDates),
      highDopamineLearnMinutes,
      noDopamineLearnMinutes,
    });
    const { text, usage } = await generateText({
      model: aiModel,
      system: PROMPT_DEF.system.replace(
        "{emotion_section}",
        hasEmotionData ? EMOTION_SECTION_PROMPT : "",
      ),
      prompt: `本周数据：${dataSummary}`,
    });
    // 校验 AI 返回包含至少三段标题，缺失则补全
    let report = text;
    if (!report.includes("## 本周统计")) report = statsSection + "\n\n" + report;
    if (!report.includes("## 模式识别")) report += "\n\n## 模式识别\n\n- 数据不足以识别模式";
    if (hasEmotionData && !report.includes("## 情绪与多巴胺模式") && emotionSection) {
      report = report.replace("## 下周建议", emotionSection.trimStart() + "\n\n## 下周建议");
    }
    if (!report.includes("## 下周建议")) report += "\n\n## 下周建议\n\n- 维持当前节奏";

    // 提取 token 用量（generateText 返回 usage.promptTokens/completionTokens/totalTokens）
    let tokenUsage: TokenUsage | undefined;
    if (usage) {
      const prompt = usage.promptTokens ?? 0;
      const completion = usage.completionTokens ?? 0;
      const total = usage.totalTokens ?? prompt + completion;
      if (prompt > 0 || completion > 0) {
        tokenUsage = { prompt, completion, total };
      }
    }

    return {
      content: report,
      usage: tokenUsage,
      // modelId 由路由层从 session.model 或 getProviderInfo() 注入更准确（这里不直接拿 model.modelId）
    };
  } catch {
    // 失败降级（递归调用走降级路径，不附带 usage）
    return generateWeeklyReport({ ...input, learnLogs: [] });
  }
}
