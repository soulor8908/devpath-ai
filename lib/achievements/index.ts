// lib/achievements/index.ts
// 成就系统统一入口：检测 + 持久化 + 通知
//
// 设计（卡帕西视角）：
//   - checkAndNotify 是唯一对外入口，内部编排：聚合 stats → detectNewAchievements → saveAchievement → notify
//   - stats 聚合并行抓取 6 个数据源（LearnLog / LearningPlan / ReviewLog / PomodoroSession / MistakeRecord / Weekly），1×RTT
//   - 失败静默（不阻塞首页加载，与 useHomeData 的 Promise.allSettled 协议一致）
//   - 通知复用 lib/timer/notification-permission.ts 的 notify

import { listItems } from "@/lib/storage/db";
import {
  KEY_PREFIXES,
  type Achievement,
  type LearnLog,
  type LearningPlan,
  type ReviewLog,
  type PomodoroSession,
  type MistakeRecord,
} from "@/lib/types";
import { chinaDateNow, chinaDateShift } from "@/lib/time";
import { detectNewAchievements, type AchievementStats } from "./detector";
import { listUnlockedIds, saveAchievement } from "./store";
import { notify } from "@/lib/timer/notification-permission";

export { detectNewAchievements, getAchievementProgress, ACHIEVEMENT_DEFINITIONS } from "./detector";
export type { AchievementStats, AchievementDefinition } from "./detector";
export {
  listAchievements,
  saveAchievement,
  hasAchievement,
  listLockedAchievements,
  listAllAchievements,
  listUnlockedIds,
} from "./store";

/**
 * 检测新成就 + 持久化 + 浏览器通知
 *
 * 调用时机：首页加载时后台异步触发（lib/home.ts useHomeData 的 Promise.allSettled）
 *
 * @returns 新解锁的成就列表（供 UI 展示卡片）；无新成就或失败返回空数组
 */
export async function checkAndNotify(): Promise<Achievement[]> {
  try {
    const stats = await collectStats();
    const existingIds = await listUnlockedIds();
    const newAchievements = detectNewAchievements(stats, existingIds);

    if (newAchievements.length === 0) return [];

    // 持久化 + 通知（并行，单个失败不影响其他）
    await Promise.all(
      newAchievements.map(async (a) => {
        await saveAchievement(a);
        await notify("成就解锁 🏆", `${a.title} — ${a.description}`);
      }),
    );

    return newAchievements;
  } catch (e) {
    console.warn("[achievements] checkAndNotify failed:", e);
    return [];
  }
}

/**
 * 从 IndexedDB 聚合成就检测所需的 stats
 * 并行抓取 6 个数据源，内存计算派生指标
 */
export async function collectStats(): Promise<AchievementStats> {
  const [learnLogs, plans, reviewLogs, sessions, mistakes, weeklies] =
    await Promise.all([
      listItems<LearnLog>(KEY_PREFIXES.LEARN_LOG),
      listItems<LearningPlan>(KEY_PREFIXES.PLAN),
      listItems<ReviewLog>(KEY_PREFIXES.REVIEW_LOG),
      listItems<PomodoroSession>(KEY_PREFIXES.POMODORO_SESSION),
      listItems<MistakeRecord>(KEY_PREFIXES.MISTAKE),
      listItems<unknown>(KEY_PREFIXES.WEEKLY),
    ]);

  // 累计专注分钟（仅 focus_session 类型 LearnLog 的 duration 之和）
  const focusMinutes = learnLogs
    .filter((l) => l.type === "focus_session")
    .reduce((sum, l) => sum + (l.duration ?? 0), 0);

  // 已完成的学习计划数（schedule 非空且全部 completed）
  const completedPlans = plans.filter(
    (p) => p.schedule.length > 0 && p.schedule.every((s) => s.completed),
  ).length;

  // 学习连续天数（从 LearnLog.date 聚合）
  const learnDates = new Set(learnLogs.map((l) => l.date));
  const { streak: streakDays, recoveredFromBreak } = computeStreakAndRecovery(learnDates);

  // 复习连续天数（从 ReviewLog.date 聚合）
  const reviewDates = new Set(reviewLogs.map((r) => r.date));
  const reviewStreak = computeStreak(reviewDates);

  // first_time 系列
  const firstPomodoroDone =
    sessions.some((s) => s.status === "completed") ||
    learnLogs.some((l) => l.type === "focus_session");
  const firstMistakeCorrected = mistakes.some((m) => m.resolved);
  const firstWeeklyReportGenerated = weeklies.length > 0;

  return {
    streakDays,
    completedPlans,
    focusMinutes,
    reviewStreak,
    recoveredFromBreak,
    firstPomodoroDone,
    firstMistakeCorrected,
    firstWeeklyReportGenerated,
  };
}

// ============ 内部工具：连续天数 & 恢复判定 ============

/**
 * 从日期集合计算当前连续天数
 * （与 lib/home.ts computeStreaks 同语义，但本模块自包含以避免拉入 home.ts 的 hook 依赖）
 */
function computeStreak(logDates: Set<string>): number {
  let streak = 0;
  let checkDate = chinaDateNow();
  while (logDates.has(checkDate)) {
    streak++;
    checkDate = chinaDateShift(checkDate, -1);
  }
  return streak;
}

/**
 * 计算连续天数 + 是否处于"断卡后 3 天内恢复"状态
 *
 * recovery 判定：当前 streak ∈ [1, 3]（刚恢复不超过 3 天），
 *   且 streak 起始日的前一天无记录（断卡点），
 *   且再前一天有记录（说明断卡前存在连续学习）
 */
function computeStreakAndRecovery(
  logDates: Set<string>,
): { streak: number; recoveredFromBreak: boolean } {
  const streak = computeStreak(logDates);

  if (streak < 1 || streak > 3) {
    return { streak, recoveredFromBreak: false };
  }

  // streak 起始日 = 今天 - (streak - 1) 天
  const streakStart = chinaDateShift(chinaDateNow(), -(streak - 1));
  // 断卡点 = streak 起始日的前一天（应无记录）
  const gapDay = chinaDateShift(streakStart, -1);
  // 断卡前一天（应有记录，证明断卡前在连续学习）
  const prevDay = chinaDateShift(gapDay, -1);

  const recoveredFromBreak =
    !logDates.has(gapDay) && logDates.has(prevDay);

  return { streak, recoveredFromBreak };
}
