// lib/home.ts
// 首页数据获取 hook + 打卡可视化元数据
//
// 设计（卡帕西视角）：
//   原版 loadHomeData 串行 7 次 IndexedDB 查询（cards → plans → logs → status → profile → emotions → mistakes），
//   但 7 个数据源互不依赖——全部应该 Promise.all 并行。
//   并行后首页数据加载从 7×RTT 降到 1×RTT（IndexedDB 事务在浏览器内仍串行执行，但调度并行）。
//
//   streakMeta 原本是组件内的 40 行 IIFE，纯函数特性 → 抽出为独立函数 getStreakMeta，
//   便于单测、复用、且使 page.tsx 渲染层保持"纯展示"。

import { useState, useEffect, useCallback } from "react";
import { getItem, countDueCards, listDueCards, listRecentItems } from "@/lib/storage/db";
import { KEY_PREFIXES } from "@/lib/types";
import type {
  LearningPlanSummary,
  LearnLog,
  ScheduleItem,
  DailyStatus,
  PublicProfile,
  MistakeRecord,
  EmotionEntry,
  Achievement,
  HealthAlert,
  UserProfile,
  ReviewCard,
} from "@/lib/types";
import { chinaDateNow, chinaDateShift } from "@/lib/time";
import { getUnresolvedMistakes } from "@/lib/mistake-book";
import { autoFillTodayActualMinutes } from "@/lib/energy-collector";
import { maybeRetrain } from "@/lib/energy-regression";
import { maybeBuildProfile, getUserProfile } from "@/lib/ai/memory/user-profile";
import { checkAndNotify } from "@/lib/achievements";
import {
  planHealthCheck,
  shouldRunHealthCheck,
} from "@/lib/ai/plan-health";
import { getQualityReport } from "@/lib/ai/quality-tracker";
import { listPlanSummaries, migrateSummaries } from "@/lib/plan-summary";
import { buildStudyQueueFromData } from "@/lib/study-queue/build-study-queue";
import type { StudyTask } from "@/lib/study-queue/types";

// ============ 打卡可视化元数据 ============

export interface StreakMeta {
  color: string;
  emoji: string;
  sub: string;
  /** 是否断卡冲击态（用于动画/震动反馈） */
  shock: boolean;
}

/**
 * 根据当前连续天数 + 上次连续天数计算打卡可视化的颜色/emoji/文案
 * 纯函数，便于单测
 *
 * @param streak 当前连续打卡天数
 * @param lastStreak 上次断卡前的连续天数（streak=0 时用于显示"上次连续 X 天"）
 */
export function getStreakMeta(streak: number, lastStreak: number): StreakMeta {
  if (streak === 0) {
    if (lastStreak >= 3) {
      return {
        color: "bg-red-50 border-red-300 text-red-600",
        emoji: "heart",
        sub: `断卡！上次连续 ${lastStreak} 天`,
        shock: true,
      };
    }
    return {
      color: "bg-gray-50 border-gray-200 text-gray-500",
      emoji: "",
      sub: "今日未打卡",
      shock: false,
    };
  }
  if (streak >= 30)
    return {
      color: "bg-purple-50 border-purple-300 text-purple-700",
      emoji: "flame",
      sub: "满月达成！",
      shock: false,
    };
  if (streak >= 14)
    return {
      color: "bg-orange-50 border-orange-300 text-orange-700",
      emoji: "flame",
      sub: "两周连胜！",
      shock: false,
    };
  if (streak >= 7)
    return {
      color: "bg-orange-50 border-orange-300 text-orange-600",
      emoji: "flame",
      sub: "一周连胜！",
      shock: false,
    };
  if (streak >= 3)
    return {
      color: "bg-yellow-50 border-yellow-300 text-yellow-700",
      emoji: "star",
      sub: "保持节奏",
      shock: false,
    };
  return {
    color: "bg-blue-50 border-blue-300 text-blue-700",
    emoji: "leaf",
    sub: "开始打卡",
    shock: false,
  };
}

// ============ 首页数据状态 ============

export interface HomeData {
  dueCount: number;
  todayLearnCount: number;
  streak: number;
  /** 上一次连续天数（昨日或更早结束的连续段）—— 用于断卡视觉 */
  lastStreak: number;
  todaySchedule: Array<ScheduleItem & { planId: string; topic: string }>;
  heatmapData: Array<{ date: string; minutes: number }>;
  todayEnergy: number | null;
  latestPlan: { id: string; topic: string } | null;
  hasPlans: boolean | null;
  username: string;
  todayEmotions: EmotionEntry[];
  recentMistakes: MistakeRecord[];
  /** 后台检测到的新解锁成就（供首页顶部展示通知卡片） */
  newAchievements: Achievement[];
  /** 健康检查告警（首页顶部展示，可关闭 + 一键采纳） */
  healthAlerts: HealthAlert[];
  /**
   * 用户画像摘要（新增）：
   * - skillLevelCount：beginner/intermediate/advanced 三档节点数
   * - preferredSlot：偏好学习时段（如 "晚上"）
   * - averageSessionMinutes：平均专注时长
   * null 表示画像未构建或冷启动
   */
  userProfileSummary: {
    skillLevelCount: { beginner: number; intermediate: number; advanced: number };
    preferredSlot: string | null;
    averageSessionMinutes: number | null;
  } | null;
  /**
   * 最近 7 天能量趋势（新增）：[Monday, Tuesday, ..., Sunday] 的平均能量 1-5
   * 全为 null 表示无数据
   */
  energyTrend: Array<number | null>;
  /**
   * AI 质量摘要（新增）：今日 AI 调用数 + 整体采纳率
   * null 表示无 AI 调用记录
   */
  aiQualitySummary: {
    todayCalls: number;
    adoptionRate: number;
  } | null;
  /**
   * 今日学习队列（第 2 阶段：学习+复习合并）：
   * - 合并 plans 中的待学 schedule 项 + dueCards 中的待复习卡片
   * - 按智能优先级排序（review 紧迫度 + new 承接性 + 能量/多巴胺补偿）
   * - 空数组表示今日无待办（已完成或无计划）
   */
  studyQueue: StudyTask[];
  /**
   * 今日已完成学习/复习项数（第 2 阶段：KPI 三宫格第 2 格）
   * 来自 LearnLog 中今日 type 为 learn_complete / review_complete 的条数。
   * 0 表示今日尚未完成任何学习项。
   */
  todayCompletedCount: number;
}

// ============ 纯函数：从原始数据计算派生状态 ============
// 这些纯函数从原始查询结果计算派生状态，便于单测且不依赖 React。

/** 从 logs 计算连续打卡天数 + 上次连续天数 */
export function computeStreaks(
  logs: LearnLog[],
): { streak: number; lastStreak: number } {
  const logDates = new Set(logs.map((l) => l.date));

  let streak = 0;
  let checkDate = chinaDateNow();
  while (logDates.has(checkDate)) {
    streak++;
    checkDate = chinaDateShift(checkDate, -1);
  }

  let lastStreak = 0;
  if (streak === 0) {
    let yDate = chinaDateShift(chinaDateNow(), -1);
    while (logDates.has(yDate)) {
      lastStreak++;
      yDate = chinaDateShift(yDate, -1);
    }
  }
  return { streak, lastStreak };
}

/**
 * 派生今日已完成学习/复习项数（第 2 阶段：KPI 三宫格第 2 格）
 *
 * LearnLog 的 type 字段：
 *   - learn_complete / review_complete 表示今日完成的学习/复习动作
 *   - learn / review 表示学习/复习中（非完成）
 *   - question_view / question_favorite / focus_session 表示其他动作
 *
 * @param logs 最近 7 天 LearnLog 列表
 * @param today 今日日期（YYYY-MM-DD 中国时区）
 * @returns 今日完成的学习/复习项数
 */
export function deriveTodayCompletedCount(
  logs: LearnLog[],
  today: string,
): number {
  return logs.filter(
    (l) =>
      l.date === today &&
      (l.type === "learn_complete" || l.type === "review_complete"),
  ).length;
}

/**
 * 派生用户画像摘要（新增）：
 * - skillLevelCount：beginner/intermediate/advanced 三档节点数
 * - preferredSlot：偏好学习时段名（中文化）
 * - averageSessionMinutes：平均专注时长
 *
 * null 表示画像未构建
 */
export function deriveUserProfileSummary(
  profile: UserProfile | null,
): HomeData["userProfileSummary"] {
  if (!profile) return null;

  const skillLevelCount = { beginner: 0, intermediate: 0, advanced: 0 };
  for (const level of Object.values(profile.skillLevel ?? {})) {
    if (level === "beginner") skillLevelCount.beginner++;
    else if (level === "intermediate") skillLevelCount.intermediate++;
    else if (level === "advanced") skillLevelCount.advanced++;
  }

  const preferredSlot = profile.preferredTimeSlots?.[0]
    ? slotToChinese(profile.preferredTimeSlots[0])
    : null;

  return {
    skillLevelCount,
    preferredSlot,
    averageSessionMinutes: profile.averageSessionMinutes ?? null,
  };
}

/** 时段标识转中文（用于 UI 显示） */
function slotToChinese(slot: string): string {
  const map: Record<string, string> = {
    morning: "早上",
    afternoon: "下午",
    evening: "晚上",
    night: "深夜",
    "上午": "上午",
    "下午": "下午",
    "晚上": "晚上",
    "深夜": "深夜",
  };
  return map[slot] ?? slot;
}

/**
 * 派生最近 7 天能量趋势（新增）
 *
 * 简化实现：仅填充今日能量到对应 weekday 位置，其余为 null。
 * 完整实现需后台任务读取最近 7 天 DailyStatus；为保持 1×RTT，此处仅用 todayStatus。
 *
 * @returns 长度 7 的数组，索引 0 = 周一 ... 6 = 周日
 */
export function deriveEnergyTrend(
  todayStatus: DailyStatus | null,
): Array<number | null> {
  const trend: Array<number | null> = [null, null, null, null, null, null, null];
  if (todayStatus?.energy) {
    const jsDay = new Date().getDay();
    const mondayIndex = jsDay === 0 ? 6 : jsDay - 1;
    trend[mondayIndex] = todayStatus.energy;
  }
  return trend;
}

/**
 * 派生 AI 质量摘要（新增）
 *
 * - todayCalls：今日 AI 调用数
 * - adoptionRate：整体采纳率（按 calls 加权）
 *
 * null 表示今日无调用记录
 */
export function deriveAiQualitySummary(
  report: { totalCalls: number; scenes: Array<{ adoptionRate: number | null; calls: number }> },
): HomeData["aiQualitySummary"] {
  if (report.totalCalls === 0) return null;

  let totalWeight = 0;
  let weightedSum = 0;
  for (const scene of report.scenes) {
    if (scene.adoptionRate !== null) {
      weightedSum += scene.adoptionRate * scene.calls;
      totalWeight += scene.calls;
    }
  }
  const adoptionRate = totalWeight > 0 ? weightedSum / totalWeight : 0;

  return {
    todayCalls: report.totalCalls,
    adoptionRate: Math.round(adoptionRate * 100) / 100,
  };
}

/** 从 logs 计算最近 7 天热力图数据 */
export function computeHeatmap(
  logs: LearnLog[],
): Array<{ date: string; minutes: number }> {
  const out: Array<{ date: string; minutes: number }> = [];
  for (let i = 6; i >= 0; i--) {
    const date = chinaDateShift(chinaDateNow(), -i);
    const minutes = logs
      .filter((l) => l.date === date)
      .reduce((sum, l) => sum + (l.duration ?? 0), 0);
    out.push({ date, minutes });
  }
  return out;
}

/** 从 plans 计算今日学习安排 + 待学数 + 最新 plan
 *  P1 优化：接受 LearningPlanSummary（含 schedule 字段），避免首页加载完整 plan 的 knowledgeTree/questions
 */
export function computeTodaySchedule(plans: LearningPlanSummary[]): {
  todaySchedule: Array<ScheduleItem & { planId: string; topic: string }>;
  todayLearnCount: number;
  latestPlan: { id: string; topic: string } | null;
  hasPlans: boolean;
} {
  let todayLearn = 0;
  const todayItems: Array<ScheduleItem & { planId: string; topic: string }> = [];
  for (const plan of plans) {
    const today = (plan.schedule ?? []).filter((s) => s.day === 1 && !s.completed);
    for (const s of today) {
      todayItems.push({ ...s, planId: plan.id, topic: plan.topic });
    }
    todayLearn += today.filter((s) => s.type === "learn").length;
  }

  let latestPlan: { id: string; topic: string } | null = null;
  if (plans.length > 0) {
    const sorted = [...plans].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
    latestPlan = { id: sorted[0].id, topic: sorted[0].topic };
  }

  return {
    todaySchedule: todayItems.slice(0, 5),
    todayLearnCount: todayLearn,
    latestPlan,
    hasPlans: plans.length > 0,
  };
}

// ============ 首页数据 hook ============

/**
 * 加载首页所有数据
 *
 * 性能：用 Promise.all 把 7 次 IndexedDB 查询并行化
 *   原版串行：cards → plans → logs → status → profile → emotions → mistakes ≈ 7×RTT
 *   并行版：1×RTT（Dexie 内部仍串行执行，但调度并行，省 await 切换开销）
 *
 * 数据源之间无依赖：cards/plans/logs/emotions/profile/status 走不同前缀，
 *   mistakes 走 getUnresolvedMistakes() 内部独立查询，均可并行。
 */
export function useHomeData(): HomeData & {
  reload: () => Promise<void>;
} {
  const [data, setData] = useState<HomeData>({
    dueCount: 0,
    todayLearnCount: 0,
    streak: 0,
    lastStreak: 0,
    todaySchedule: [],
    heatmapData: [],
    todayEnergy: null,
    latestPlan: null,
    hasPlans: null,
    username: "",
    todayEmotions: [],
    recentMistakes: [],
    newAchievements: [],
    healthAlerts: [],
    userProfileSummary: null,
    energyTrend: [null, null, null, null, null, null, null],
    aiQualitySummary: null,
    studyQueue: [],
    todayCompletedCount: 0,
  });

  const load = useCallback(async () => {
    const today = chinaDateNow();
    const todayStatusKey = KEY_PREFIXES.STATUS + today;
    // 今日 0 点 ISO（用于 AI 质量统计的 since 过滤）
    const todayStartIso = new Date(`${today}T00:00:00+08:00`).toISOString();

    // 先迁移旧摘要（补齐缺失/过期 summary，含 schedule 字段），
    // 再并行加载首页数据。迁移为 no-op 时仅扫 key，开销极小。
    await migrateSummaries();
    // P1 精准查询优化（替代全量加载）：
    //   - 卡片：countDueCards(now) 走 dueAt 索引精准计数，O(due) 而非 O(n)
    //     （首页只需要 dueCount，不需要卡片数据本身）
    //   - 计划：listPlanSummaries() 加载轻量 summary（含 schedule），避免拉取 knowledgeTree/questions
    //   - 日志/情绪：listRecentItems(prefix, 7) 只查最近 7 天，走 updatedAt 索引
    // 第 2 阶段：新增 listDueCards 拉到期卡片数据（用于 studyQueue 渲染）
    const now = new Date();
    const [
      dueCount, plans, logs, todayStatus, profile, emotions, mistakes, userProfile, qualityReport, dueCards,
    ] = await Promise.all([
      countDueCards(now),
      listPlanSummaries(),
      listRecentItems<LearnLog>(KEY_PREFIXES.LEARN_LOG, 7),
      getItem<DailyStatus>(todayStatusKey),
      getItem<PublicProfile>("my:profile"),
      listRecentItems<EmotionEntry>(KEY_PREFIXES.EMOTION, 7),
      getUnresolvedMistakes(),
      getUserProfile(),
      getQualityReport(todayStartIso),
      listDueCards<ReviewCard>(now, 50),
    ]);

    // 内存派生计算（无 IO）
    const { streak, lastStreak } = computeStreaks(logs);
    const heatmapData = computeHeatmap(logs);
    const todayCompletedCount = deriveTodayCompletedCount(logs, today);
    const {
      todaySchedule,
      todayLearnCount,
      latestPlan,
      hasPlans,
    } = computeTodaySchedule(plans);

    // 第 2 阶段：构建今日学习队列（合并 plans 待学 + dueCards 待复习，按 priority 排序）
    // 排序上下文：用今日能量 + 今日多巴胺状态（来自 todayStatus）
    const studyQueueContext = {
      energy: todayStatus?.energy ?? 3,
      dopamine: todayStatus?.dopamineTrigger ?? ("无" as const),
    };
    const studyQueue = buildStudyQueueFromData(plans, dueCards, {
      date: today,
      context: studyQueueContext,
      now,
    });

    // 派生：用户画像摘要（从 UserProfile 计算三档节点数）
    const userProfileSummary = deriveUserProfileSummary(userProfile);

    // 派生：最近 7 天能量趋势（从 DailyStatus 列表计算）
    // 注：这里复用 logs 的 date 信息；为避免新增 IO，从 logs 的 date 集合 + 已加载的 todayStatus 派生
    // 完整实现需要读取最近 7 天的 DailyStatus；为保持 1×RTT，此处仅用 todayStatus，
    // 后续可通过后台任务或扩展查询补全历史数据
    const energyTrend = deriveEnergyTrend(todayStatus ?? null);

    // 派生：AI 质量摘要（从 QualityReport 计算今日调用数 + 整体采纳率）
    const aiQualitySummary = deriveAiQualitySummary(qualityReport);

    setData({
      dueCount,
      todayLearnCount,
      streak,
      lastStreak,
      todaySchedule,
      heatmapData,
      todayEnergy: todayStatus?.energy ?? null,
      latestPlan,
      hasPlans,
      username: profile?.username ?? "",
      todayEmotions: emotions.filter((e) => e.date === today),
      recentMistakes: mistakes.slice(0, 3),
      newAchievements: [],
      healthAlerts: [],
      userProfileSummary,
      energyTrend,
      aiQualitySummary,
      studyQueue,
      todayCompletedCount,
    });

    // 后台维护任务：不阻塞 UI，失败静默
    // - autoFillTodayActualMinutes: 自动回填今日 actualMinutes
    //   修复"模型永远无法训练"的冷启动问题（Issue 4）
    // - maybeRetrain: 检查是否需要重训练能量回归模型
    // - maybeBuildProfile: 懒构建/刷新用户画像（24h TTL）
    // - checkAndNotify: 成就检测 + 通知（新成就存入 state 供 UI 展示）
    // - maybeRunHealthCheck: 计划健康检查（当日只跑一次，HealthAlert 存入 state 供 UI 展示）
    void Promise.allSettled([
      autoFillTodayActualMinutes(),
      maybeRetrain(),
      maybeBuildProfile(),
      checkAndNotify(),
      maybeRunHealthCheck(today),
    ])
      .then((results) => {
        // checkAndNotify 是第 4 个；fulfilled 时取其返回的新成就
        const achievementResult = results[3];
        const newAchievements =
          achievementResult.status === "fulfilled" ? achievementResult.value : [];
        if (newAchievements.length > 0) {
          setData((prev) => ({ ...prev, newAchievements }));
        }
        // maybeRunHealthCheck 是第 5 个；fulfilled 时取其返回的 HealthAlert[]
        const healthResult = results[4];
        const healthAlerts =
          healthResult.status === "fulfilled" ? healthResult.value : [];
        if (healthAlerts.length > 0) {
          setData((prev) => ({ ...prev, healthAlerts }));
        }
      })
      .catch(() => {
        // 维护任务失败不影响首页加载
      });
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return { ...data, reload: load };
}

// ============ 内部工具：后台任务包装 ============

/**
 * 计划健康检查包装：当日只跑一次
 * - shouldRunHealthCheck 返回 true → 调 planHealthCheck() 返回 HealthAlert[]
 * - shouldRunHealthCheck 返回 false（当日已跑过）→ 返回空数组
 * - 任何异常吞掉返回空数组（与 Promise.allSettled 失败静默协议一致）
 */
async function maybeRunHealthCheck(today: string): Promise<HealthAlert[]> {
  try {
    const shouldRun = await shouldRunHealthCheck(today);
    if (!shouldRun) return [];
    return await planHealthCheck();
  } catch {
    return [];
  }
}
