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
import { getItem, listItems } from "@/lib/storage/db";
import { KEY_PREFIXES } from "@/lib/types";
import type {
  LearningPlan,
  ReviewCard,
  LearnLog,
  ScheduleItem,
  DailyStatus,
  PublicProfile,
  MistakeRecord,
  EmotionEntry,
  Achievement,
} from "@/lib/types";
import { chinaDateNow, chinaDateShift } from "@/lib/time";
import { getDueCards } from "@/lib/fsrs";
import { getUnresolvedMistakes } from "@/lib/mistake-book";
import { autoFillTodayActualMinutes } from "@/lib/energy-collector";
import { maybeRetrain } from "@/lib/energy-regression";
import { maybeBuildProfile } from "@/lib/ai/memory/user-profile";
import { checkAndNotify } from "@/lib/achievements";

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

/** 从 plans 计算今日学习安排 + 待学数 + 最新 plan */
export function computeTodaySchedule(plans: LearningPlan[]): {
  todaySchedule: Array<ScheduleItem & { planId: string; topic: string }>;
  todayLearnCount: number;
  latestPlan: { id: string; topic: string } | null;
  hasPlans: boolean;
} {
  let todayLearn = 0;
  const todayItems: Array<ScheduleItem & { planId: string; topic: string }> = [];
  for (const plan of plans) {
    const today = plan.schedule.filter((s) => s.day === 1 && !s.completed);
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
  });

  const load = useCallback(async () => {
    const today = chinaDateNow();
    const todayStatusKey = KEY_PREFIXES.STATUS + today;

    // 7 路并行查询（互不依赖）
    const [cards, plans, logs, todayStatus, profile, emotions, mistakes] =
      await Promise.all([
        listItems<ReviewCard>(KEY_PREFIXES.CARD),
        listItems<LearningPlan>(KEY_PREFIXES.PLAN),
        listItems<LearnLog>(KEY_PREFIXES.LEARN_LOG),
        getItem<DailyStatus>(todayStatusKey),
        getItem<PublicProfile>("my:profile"),
        listItems<EmotionEntry>(KEY_PREFIXES.EMOTION),
        getUnresolvedMistakes(),
      ]);

    // 内存派生计算（无 IO）
    const due = getDueCards(cards);
    const { streak, lastStreak } = computeStreaks(logs);
    const heatmapData = computeHeatmap(logs);
    const {
      todaySchedule,
      todayLearnCount,
      latestPlan,
      hasPlans,
    } = computeTodaySchedule(plans);

    setData({
      dueCount: due.length,
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
    });

    // 后台维护任务：不阻塞 UI，失败静默
    // - autoFillTodayActualMinutes: 自动回填今日 actualMinutes
    //   修复"模型永远无法训练"的冷启动问题（Issue 4）
    // - maybeRetrain: 检查是否需要重训练能量回归模型
    // - maybeBuildProfile: 懒构建/刷新用户画像（24h TTL）
    // - checkAndNotify: 成就检测 + 通知（新成就存入 state 供 UI 展示）
    void Promise.allSettled([
      autoFillTodayActualMinutes(),
      maybeRetrain(),
      maybeBuildProfile(),
      checkAndNotify(),
    ])
      .then((results) => {
        // checkAndNotify 是第 4 个；fulfilled 时取其返回的新成就
        const achievementResult = results[3];
        const newAchievements =
          achievementResult.status === "fulfilled" ? achievementResult.value : [];
        if (newAchievements.length > 0) {
          setData((prev) => ({ ...prev, newAchievements }));
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
