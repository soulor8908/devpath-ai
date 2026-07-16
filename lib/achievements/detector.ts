// lib/achievements/detector.ts
// 成就检测器：纯函数模块
//
// 设计（卡帕西视角）：
//   - detectNewAchievements 是纯函数：相同输入 → 相同输出，便于单测与缓存
//   - 不在此处访问 IndexedDB / Date.now() —— 时间戳由调用方（store/checkAndNotify）填充
//   - 返回的 Achievement.unlockedAt 为空字符串占位，持久化时由 store 填入真实 ISO
//   - 16 个预置成就（spec 说 15 个，但 first_time 列了 3 个，按 16 个实现更合理）
//
// 阈值设计：
//   - streak: 3 / 7 / 30 / 100 天（4 个）
//   - topic_mastery: 完成 1 / 3 / 10 个学习计划（3 个）
//   - focus_hours: 累计专注 10 / 50 / 200 小时 = 600 / 3000 / 12000 分钟（3 个）
//   - review_streak: 连续复习 7 / 30 天（2 个）
//   - recovery: 断卡后 3 天内恢复（1 个）
//   - first_time: 首次完成番茄 / 首次答对错题 / 首次生成周报（3 个）

import type { Achievement, AchievementType } from "@/lib/types";

/** 成就检测所需的聚合统计（由 checkAndNotify 从各数据源聚合后传入） */
export interface AchievementStats {
  /** 当前连续学习天数 */
  streakDays: number;
  /** 已完成的学习计划数（所有 schedule 项均 completed） */
  completedPlans: number;
  /** 累计专注分钟数（LearnLog type=focus_session 的 duration 之和） */
  focusMinutes: number;
  /** 连续复习天数 */
  reviewStreak: number;
  /** 是否在断卡后 3 天内恢复 */
  recoveredFromBreak: boolean;
  /** 是否已完成过至少一个番茄 */
  firstPomodoroDone: boolean;
  /** 是否已答对过至少一道错题 */
  firstMistakeCorrected: boolean;
  /** 是否已生成过至少一份周报 */
  firstWeeklyReportGenerated: boolean;
}

/** 成就定义（不含 unlockedAt，unlockedAt 由检测时填入） */
export interface AchievementDefinition {
  id: string;
  type: AchievementType;
  title: string;
  description: string;
  /** 图标名称（对应 components/Icon.tsx 的 IconName） */
  icon: string;
  /** 判定函数：给定 stats 返回是否达成 */
  isUnlocked: (stats: AchievementStats) => boolean;
  /** 该成就的数值阈值（用于 getAchievementProgress 计算；布尔型成就用 1） */
  threshold: number;
}

/**
 * 16 个预置成就定义
 * 顺序即展示顺序，按 type 分组
 */
export const ACHIEVEMENT_DEFINITIONS: AchievementDefinition[] = [
  // ============ streak（4 个）============
  {
    id: "streak_3",
    type: "streak",
    title: "初尝连胜",
    description: "连续学习 3 天",
    icon: "flame",
    isUnlocked: (s) => s.streakDays >= 3,
    threshold: 3,
  },
  {
    id: "streak_7",
    type: "streak",
    title: "一周坚持",
    description: "连续学习 7 天",
    icon: "flame",
    isUnlocked: (s) => s.streakDays >= 7,
    threshold: 7,
  },
  {
    id: "streak_30",
    type: "streak",
    title: "满月达成",
    description: "连续学习 30 天",
    icon: "flame",
    isUnlocked: (s) => s.streakDays >= 30,
    threshold: 30,
  },
  {
    id: "streak_100",
    type: "streak",
    title: "百日传奇",
    description: "连续学习 100 天",
    icon: "flame",
    isUnlocked: (s) => s.streakDays >= 100,
    threshold: 100,
  },
  // ============ topic_mastery（3 个）============
  {
    id: "topic_mastery_1",
    type: "topic_mastery",
    title: "首个里程碑",
    description: "完成 1 个学习计划",
    icon: "target",
    isUnlocked: (s) => s.completedPlans >= 1,
    threshold: 1,
  },
  {
    id: "topic_mastery_3",
    type: "topic_mastery",
    title: "三杯不醉",
    description: "完成 3 个学习计划",
    icon: "target",
    isUnlocked: (s) => s.completedPlans >= 3,
    threshold: 3,
  },
  {
    id: "topic_mastery_10",
    type: "topic_mastery",
    title: "十项全能",
    description: "完成 10 个学习计划",
    icon: "target",
    isUnlocked: (s) => s.completedPlans >= 10,
    threshold: 10,
  },
  // ============ focus_hours（3 个，阈值单位为分钟）============
  {
    id: "focus_hours_10",
    type: "focus_hours",
    title: "十小时专注",
    description: "累计专注 10 小时",
    icon: "clock",
    isUnlocked: (s) => s.focusMinutes >= 600,
    threshold: 600,
  },
  {
    id: "focus_hours_50",
    type: "focus_hours",
    title: "五十小时专注",
    description: "累计专注 50 小时",
    icon: "clock",
    isUnlocked: (s) => s.focusMinutes >= 3000,
    threshold: 3000,
  },
  {
    id: "focus_hours_200",
    type: "focus_hours",
    title: "两百小时大师",
    description: "累计专注 200 小时",
    icon: "clock",
    isUnlocked: (s) => s.focusMinutes >= 12000,
    threshold: 12000,
  },
  // ============ review_streak（2 个）============
  {
    id: "review_streak_7",
    type: "review_streak",
    title: "复习一周",
    description: "连续复习 7 天",
    icon: "repeat",
    isUnlocked: (s) => s.reviewStreak >= 7,
    threshold: 7,
  },
  {
    id: "review_streak_30",
    type: "review_streak",
    title: "复习满月",
    description: "连续复习 30 天",
    icon: "repeat",
    isUnlocked: (s) => s.reviewStreak >= 30,
    threshold: 30,
  },
  // ============ recovery（1 个）============
  {
    id: "recovery_3day",
    type: "recovery",
    title: "卷土重来",
    description: "断卡后 3 天内恢复学习",
    icon: "refresh-cw",
    isUnlocked: (s) => s.recoveredFromBreak,
    threshold: 1,
  },
  // ============ first_time（3 个）============
  {
    id: "first_pomodoro",
    type: "first_time",
    title: "初次专注",
    description: "完成第一个番茄",
    icon: "sparkles",
    isUnlocked: (s) => s.firstPomodoroDone,
    threshold: 1,
  },
  {
    id: "first_mistake_corrected",
    type: "first_time",
    title: "错题克星",
    description: "首次答对一道错题",
    icon: "star",
    isUnlocked: (s) => s.firstMistakeCorrected,
    threshold: 1,
  },
  {
    id: "first_weekly_report",
    type: "first_time",
    title: "首份周报",
    description: "首次生成周报",
    icon: "chart",
    isUnlocked: (s) => s.firstWeeklyReportGenerated,
    threshold: 1,
  },
];

/** 各 type 的阈值列表（升序，用于 getAchievementProgress） */
const THRESHOLDS_BY_TYPE: Record<AchievementType, number[]> = {
  streak: [3, 7, 30, 100],
  topic_mastery: [1, 3, 10],
  focus_hours: [600, 3000, 12000],
  review_streak: [7, 30],
  recovery: [1],
  first_time: [1],
};

/**
 * 检测新解锁的成就（纯函数）
 *
 * @param stats 当前聚合统计
 * @param existingAchievementIds 已解锁的成就 id 列表（用于避免重复触发）
 * @returns 新解锁的成就列表（unlockedAt 为空字符串占位，由 store 填入真实时间）
 *
 * 幂等性：相同 stats + existingAchievementIds → 相同输出
 */
export function detectNewAchievements(
  stats: AchievementStats,
  existingAchievementIds: string[],
): Achievement[] {
  const existingSet = new Set(existingAchievementIds);
  const result: Achievement[] = [];
  for (const def of ACHIEVEMENT_DEFINITIONS) {
    // 已解锁的不再返回
    if (existingSet.has(def.id)) continue;
    // 未达成的不返回
    if (!def.isUnlocked(stats)) continue;
    // 新达成：unlockedAt 留空，由 store 填入真实 ISO（保证纯函数）
    result.push({
      id: def.id,
      type: def.type,
      title: def.title,
      description: def.description,
      icon: def.icon,
      unlockedAt: "",
      progress: 1,
    });
  }
  return result;
}

/**
 * 计算某 type 下一个未解锁成就的进度（0-1）
 *
 * - 数值型 type（streak / topic_mastery / focus_hours / review_streak）：
 *   找到大于 currentValue 的最小阈值 t，返回 min(1, currentValue / t)
 *   若 currentValue 已超过最大阈值，返回 1
 * - 布尔型 type（recovery / first_time）：currentValue >= 1 → 1，否则 0
 *
 * @param type 成就类型
 * @param currentValue 当前数值（布尔型成就传 0 或 1）
 */
export function getAchievementProgress(
  type: AchievementType,
  currentValue: number,
): number {
  const thresholds = THRESHOLDS_BY_TYPE[type] ?? [];
  if (thresholds.length === 0) return 0;

  // 布尔型：只有一个阈值 1
  if (type === "recovery" || type === "first_time") {
    return currentValue >= 1 ? 1 : 0;
  }

  // 数值型：找到下一个未达成的阈值
  const nextThreshold = thresholds.find((t) => currentValue < t);
  if (nextThreshold === undefined) {
    // 已超过所有阈值 → 全部解锁
    return 1;
  }
  if (currentValue <= 0) return 0;
  const ratio = currentValue / nextThreshold;
  // 钳制到 [0, 1]
  return Math.max(0, Math.min(1, ratio));
}

/**
 * 获取某 type 下所有成就定义（按阈值升序）
 * 供成就墙页面分组展示用
 */
export function getDefinitionsByType(type: AchievementType): AchievementDefinition[] {
  return ACHIEVEMENT_DEFINITIONS.filter((d) => d.type === type);
}
