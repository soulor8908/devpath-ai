// lib/ai/behavior-analyzer.ts
// 行为感知——从用户学习行为隐式推断状态
//
// 设计（卡帕西视角）：
//   - 纯函数：输入行为数据 → 输出推断状态
//   - 不需要用户手动配置，从行为信号自动感知
//   - 三个维度：能量、情绪、Persona 建议

import type { LearnLog } from "@/lib/types";

export interface BehaviorSignals {
  /** 最近 N 天的学习日志 */
  recentLogs: LearnLog[];
  /** 今日答题正确数 */
  todayCorrect: number;
  /** 今日答题总数 */
  todayTotal: number;
  /** 今日专注分钟数 */
  todayFocusMinutes: number;
  /** 今日被打断次数 */
  todayInterruptions: number;
  /** 连续打卡天数 */
  streak: number;
  /** 最近 7 天学习时间分布（小时数组，0-23） */
  studyHourDistribution: number[];
}

export interface InferredState {
  /** 推断能量 1-5 */
  energy: number;
  /** 推断情绪 */
  mood: "confident" | "neutral" | "frustrated" | "burnout";
  /** 推荐 Persona */
  recommendedPersona: "strict" | "gentle" | "socratic" | "peer";
  /** 推荐理由（可解释性） */
  reasons: string[];
}

/**
 * 从行为信号推断用户状态
 *
 * 推断规则：
 *   - 能量：专注时长长 + 打断少 → 高能量；专注短 + 打断多 → 低能量
 *   - 情绪：正确率高 → confident；连续低正确率 → frustrated；长时间学习效果差 → burnout
 *   - Persona：frustrated → gentle；confident → strict；neutral → socratic；burnout → peer
 */
export function inferBehaviorState(signals: BehaviorSignals): InferredState {
  const reasons: string[] = [];

  // ====== 能量推断 ======
  // 注意：todayFocusMinutes===0 必须在 <10 之前判断，否则会被 <10 吞掉
  let energy = 3; // 默认中等
  if (signals.todayFocusMinutes === 0) {
    energy = 1;
    reasons.push("今日尚未开始学习");
  } else if (signals.todayFocusMinutes >= 45 && signals.todayInterruptions <= 1) {
    energy = 5;
    reasons.push("专注时长充足且打断少，能量高");
  } else if (signals.todayFocusMinutes >= 25 && signals.todayInterruptions <= 2) {
    energy = 4;
    reasons.push("专注状态良好");
  } else if (signals.todayFocusMinutes < 10 || signals.todayInterruptions >= 4) {
    energy = 2;
    reasons.push("专注时间短或打断频繁，能量偏低");
  }

  // ====== 情绪推断 ======
  let mood: InferredState["mood"] = "neutral";
  const todayAccuracy = signals.todayTotal > 0 ? signals.todayCorrect / signals.todayTotal : 0;

  if (signals.streak >= 14 && todayAccuracy >= 0.7) {
    mood = "confident";
    reasons.push(`连续打卡 ${signals.streak} 天且正确率高，状态自信`);
  } else if (signals.todayTotal >= 3 && todayAccuracy < 0.4) {
    mood = "frustrated";
    reasons.push("今日答题正确率低，可能有挫败感");
  } else if (signals.streak === 0) {
    mood = "neutral";
    reasons.push("今日未打卡");
  } else if (signals.todayFocusMinutes > 90 && todayAccuracy < 0.5) {
    mood = "burnout";
    reasons.push("长时间学习但效果不佳，可能疲劳");
  } else if (todayAccuracy >= 0.8) {
    mood = "confident";
    reasons.push("答题正确率高，状态良好");
  }

  // ====== Persona 推荐 ======
  let recommendedPersona: InferredState["recommendedPersona"] = "socratic";
  switch (mood) {
    case "frustrated":
      recommendedPersona = "gentle";
      reasons.push("检测到挫败感，切换为温和陪伴模式");
      break;
    case "confident":
      recommendedPersona = "strict";
      reasons.push("状态自信，切换为严格教练模式推一把");
      break;
    case "burnout":
      recommendedPersona = "peer";
      reasons.push("可能疲劳，切换为同行者模式");
      break;
    case "neutral":
      recommendedPersona = "socratic";
      reasons.push("状态平稳，使用苏格拉底引导模式");
      break;
  }

  return { energy, mood, recommendedPersona, reasons };
}

/**
 * 推断学习时段偏好
 */
export function inferPreferredSlot(
  studyHourDistribution: number[]
): "morning" | "afternoon" | "evening" | "night" | null {
  if (studyHourDistribution.every(h => h === 0)) return null;

  const morning = studyHourDistribution.slice(6, 12).reduce((a, b) => a + b, 0);
  const afternoon = studyHourDistribution.slice(12, 18).reduce((a, b) => a + b, 0);
  const evening = studyHourDistribution.slice(18, 24).reduce((a, b) => a + b, 0);
  const night = studyHourDistribution.slice(0, 6).reduce((a, b) => a + b, 0);

  const max = Math.max(morning, afternoon, evening, night);
  if (max === 0) return null;

  if (max === morning) return "morning";
  if (max === afternoon) return "afternoon";
  if (max === evening) return "evening";
  return "night";
}

/**
 * 生成增强版教练洞察（基于行为分析）
 */
export function generateEnhancedInsight(
  state: InferredState,
  preferredSlot: string | null,
  streak: number
): {
  tone: "encouraging" | "reminding" | "challenging" | "celebrating";
  message: string;
  icon: string;
} {
  // 庆祝：连续打卡 7+ 天
  if (streak >= 7) {
    return {
      tone: "celebrating",
      message: `连续打卡 ${streak} 天，你正在建立习惯！${
        preferredSlot ? `通常在${preferredSlot}学习效果最好。` : ""
      }保持这个节奏。`,
      icon: "flame",
    };
  }

  // 提醒：今日未学习
  if (state.energy === 1) {
    return {
      tone: "reminding",
      message: "今天还没开始，从第一个知识点开始吧。5 分钟就够。",
      icon: "bell",
    };
  }

  // 挑战：状态好，推一把
  if (state.mood === "confident") {
    return {
      tone: "challenging",
      message: "你今天状态很好，试试更难的题目？突破舒适区才能成长。",
      icon: "target",
    };
  }

  // 鼓励：挫败时
  if (state.mood === "frustrated") {
    return {
      tone: "encouraging",
      message: "今天不太顺利没关系，学任何新东西都有这个过程。休息一下再继续。",
      icon: "heart",
    };
  }

  // 疲劳时
  if (state.mood === "burnout") {
    return {
      tone: "reminding",
      message: "你已经学了很久了，休息一下。好的休息也是学习的一部分。",
      icon: "coffee",
    };
  }

  // 默认鼓励
  return {
    tone: "encouraging",
    message: "每天进步一点点，离 offer 越来越近。",
    icon: "sparkles",
  };
}
