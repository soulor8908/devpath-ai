// lib/ai/rhythm-engine.ts
// 节奏引擎：统一编排"现在该做什么"的决策入口
//
// 设计（卡帕西视角）：
//   - 番茄钟、能量、FSRS、计划、routine、画像 6 个信号源各自独立，
//     用户得自己拼凑"现在干什么"。节奏引擎把它们收敛成一个 NextAction。
//   - getNextAction 是纯函数（除内部 rankTasks 的缓存 IO），6 条决策优先级链，
//     从上到下短路：命中即返回。便于单测覆盖每条分支。
//   - collectRhythmContext 用 Promise.all 并行抓取 6 个数据源，1×RTT 完成。
//   - 每个 NextAction 必带 reason 字段，给用户看的人话解释（非日志，是 UI 文案）。
//
// 与优先级引擎的关系：
//   - 规则 4/6（start_focus）调用 rankTasks 选出分数最高的 learn task
//   - 节奏引擎是"指挥官"，优先级引擎是"参谋"，节奏决定"要不要学"，优先级决定"学哪个"

import { getItem, listItems } from "@/lib/storage/db";
import {
  KEY_PREFIXES,
  type RhythmContext,
  type NextAction,
  type PomodoroSession,
  type ReviewCard,
  type ReviewLog,
  type LearningPlan,
  type Routine,
  type UserProfile,
  type ScheduleItem,
  type MistakeRecord,
  type DailyStatus,
  type LearnLog,
} from "@/lib/types";
import { chinaDateNow } from "@/lib/time";
import { getDueCards } from "@/lib/fsrs";
import { getRunningSession } from "@/lib/timer/pomodoro";
import { getTodayCount } from "@/lib/timer/session-tracker";
import { getRecommendedDuration } from "@/lib/timer/pomodoro-rule";
import { getUserProfile } from "@/lib/ai/memory/user-profile";
import { rankTasks, type RankContext } from "@/lib/ai/priority-engine";
import { getUnresolvedMistakes } from "@/lib/mistake-book";

/** 1 小时毫秒数（用于判定"最近是否复习过"） */
const ONE_HOUR_MS = 60 * 60 * 1000;

/** 接近睡眠时间的阈值（分钟） */
const NEAR_SLEEP_THRESHOLD_MIN = 30;

/**
 * 节奏引擎核心：根据上下文决定下一步行动
 *
 * 决策优先级链（从上到下短路）：
 *   1. 当前有 running 的 PomodoroSession → 继续专注（continue_focus）
 *   2. 能量 ≤ 2 → 建议休息（rest）
 *   3. 有到期 FSRS 卡片且最近 1 小时无复习 → 先复习（review）
 *   4. 当前时段在 Routine.slots 内 → 启动专注（start_focus，用 Priority Engine 选 task）
 *   5. 接近 Routine.sleepTime（30 分钟内）→ 建议复盘今天（plan_next_day）
 *   6. 默认 → 建议下一个 learn task（start_focus）
 *
 * @param ctx 节奏上下文（由 collectRhythmContext 聚合）
 * @returns NextAction 联合类型，必带 reason 字段
 */
export async function getNextAction(ctx: RhythmContext): Promise<NextAction> {
  const now = new Date(ctx.now);

  // 1. 当前有 running 的 PomodoroSession → 继续专注
  if (ctx.runningSession) {
    const remaining = computeRemainingMinutes(ctx.runningSession, now);
    return {
      type: "continue_focus",
      session: ctx.runningSession,
      reason:
        `你正在进行「${ctx.runningSession.taskDescription || "专注"}」番茄钟` +
        `（还剩 ${remaining} 分钟），回到计时页继续专注吧。`,
    };
  }

  // 2. 能量 ≤ 2 → 建议休息
  if (ctx.todayEnergy !== null && ctx.todayEnergy <= 2) {
    return {
      type: "rest",
      reason:
        `今天能量只有 ${ctx.todayEnergy}/5，状态偏低。` +
        "先去休息一下（478 呼吸 / 闭眼 5 分钟），别硬撑。",
    };
  }

  // 3. 有到期 FSRS 卡片且最近 1 小时无复习 → 先复习
  if (ctx.dueCards.length > 0 && !ctx.reviewedRecently) {
    return {
      type: "review",
      cards: ctx.dueCards,
      reason:
        `有 ${ctx.dueCards.length} 张复习卡片到期了，且最近 1 小时没复习。` +
        "趁记忆还在，先花 5-10 分钟过一遍，避免遗忘。",
    };
  }

  // 4. 当前时段在 Routine.slots 内 → 启动专注（用 Priority Engine 选 task）
  const slot = ctx.routine ? findCurrentSlot(ctx.routine, now) : null;
  if (slot) {
    const focusAction = await pickFocusTask(ctx, now);
    if (focusAction) {
      return focusAction;
    }
    // 没有可选 task 时落入默认分支
  }

  // 5. 接近 Routine.sleepTime（30 分钟内）→ 建议复盘今天
  if (ctx.routine?.sleepTime) {
    const minutesToSleep = computeMinutesToSleepTime(ctx.routine.sleepTime, now);
    if (minutesToSleep !== null && minutesToSleep >= 0 && minutesToSleep <= NEAR_SLEEP_THRESHOLD_MIN) {
      return {
        type: "plan_next_day",
        reason:
          `离你设定的睡眠时间（${ctx.routine.sleepTime}）只剩 ${minutesToSleep} 分钟了。` +
          "今天先收尾，花 5 分钟复盘今天的收获、规划明天的重点。",
      };
    }
  }

  // 6. 默认 → 建议下一个 learn task
  const defaultAction = await pickFocusTask(ctx, now);
  if (defaultAction) {
    return defaultAction;
  }

  // 连默认 task 都没有（无活跃计划）→ 建议休息或创建计划
  return {
    type: "rest",
    reason:
      "当前没有进行中的番茄钟，也没有待学的任务。" +
      "去创建一个学习计划，或者先休息一下充充电吧。",
  };
}

/**
 * 从 IndexedDB 并行抓取所有节奏信号
 *
 * 6 路并行查询（互不依赖），1×RTT 完成：
 *   - runningSession（番茄钟）
 *   - todayEnergy / todayMood（DailyStatus）
 *   - dueCards（FSRS 到期卡片）
 *   - reviewedRecently（ReviewLog + LearnLog timestamp）
 *   - activePlans（未冻结计划）
 *   - routine + profile（作息 + 画像）
 *   - todayFocusCount（今日已完成番茄数）
 *
 * 任何环节失败不抛错，缺数据用 null/[] 兜底（保证 getNextAction 不崩）
 */
export async function collectRhythmContext(): Promise<RhythmContext> {
  const today = chinaDateNow();
  const now = new Date().toISOString();

  const [
    runningSession,
    todayStatus,
    cards,
    reviewLogs,
    learnLogs,
    plans,
    routine,
    profile,
    todayFocusCount,
  ] = await Promise.all([
    getRunningSession().catch(() => null),
    getItem<DailyStatus>(KEY_PREFIXES.STATUS + today).catch(() => undefined),
    listItems<ReviewCard>(KEY_PREFIXES.CARD).catch(() => [] as ReviewCard[]),
    listItems<ReviewLog>(KEY_PREFIXES.REVIEW_LOG).catch(() => [] as ReviewLog[]),
    listItems<LearnLog>(KEY_PREFIXES.LEARN_LOG).catch(() => [] as LearnLog[]),
    listItems<LearningPlan>(KEY_PREFIXES.PLAN).catch(() => [] as LearningPlan[]),
    getItem<Routine>(KEY_PREFIXES.ROUTINE_DATA).catch(() => undefined),
    getUserProfile().catch(() => null),
    getTodayCount().catch(() => 0),
  ]);

  const dueCards = getDueCards(cards, new Date(now));
  const reviewedRecently = hasReviewedRecently(reviewLogs, learnLogs, now);

  // 活跃计划：未冻结
  const activePlans = plans.filter((p) => !p.frozen);

  return {
    runningSession: runningSession ?? null,
    todayEnergy: todayStatus?.energy ?? null,
    todayMood: todayStatus?.mood,
    dueCards,
    reviewedRecently,
    activePlans,
    routine: routine ?? undefined,
    profile: profile ?? undefined,
    now,
    todayFocusCount,
  };
}

// ============ 内部工具 ============

/**
 * 用 Priority Engine 从活跃计划里选出分数最高的未完成 learn task
 * 返回 start_focus action；若无可用 task 返回 null
 *
 * 内部需要 mistakes 数据用于 skill_gap 计算，
 * 通过重新读取（pickFocusTask 是 async，可在内部并行抓取）
 */
async function pickFocusTask(
  ctx: RhythmContext,
  now: Date,
): Promise<NextAction | null> {
  // 收集所有活跃计划的未完成 learn task
  const tasks: ScheduleItem[] = [];
  for (const plan of ctx.activePlans) {
    for (const s of plan.schedule) {
      if (s.type === "learn" && !s.completed) {
        tasks.push(s);
      }
    }
  }

  if (tasks.length === 0) return null;

  // 抓取 mistakes（priority engine 需要）+ cards（已在 ctx.dueCards，但 rankTasks 需要全部 cards）
  const [mistakes, allCards] = await Promise.all([
    getUnresolvedMistakes().catch(() => [] as MistakeRecord[]),
    listItems<ReviewCard>(KEY_PREFIXES.CARD).catch(() => [] as ReviewCard[]),
  ]);

  const rankCtx: RankContext = {
    plans: ctx.activePlans,
    cards: allCards,
    mistakes,
    energy: ctx.todayEnergy,
    preferredSlots: ctx.profile?.preferredTimeSlots ?? [],
    now,
  };

  const ranked = rankTasks(tasks, rankCtx);
  if (ranked.length === 0) return null;

  const top = ranked[0];
  const duration = ctx.routine
    ? getRecommendedDuration("focus", ctx.routine.intensity)
    : getRecommendedDuration("focus");

  // 解析节点标题用于 reason
  const node = ctx.activePlans
    .find((p) => p.id === top.planId)
    ?.knowledgeTree.find((n) => n.id === top.task.nodeId);
  const nodeTitle = node?.title ?? top.task.nodeId;

  return {
    type: "start_focus",
    task: top.task,
    duration,
    reason:
      `当前能量 ${ctx.todayEnergy ?? "?"}/5，建议专注 ${duration} 分钟学习「${nodeTitle}」` +
      `（来自计划「${top.topic}」）。`,
    planId: top.planId,
  };
}

/**
 * 计算 running session 剩余分钟
 */
function computeRemainingMinutes(session: PomodoroSession, now: Date): number {
  const startMs = new Date(session.startedAt).getTime();
  const elapsedMin = Math.floor((now.getTime() - startMs) / 60_000);
  const remaining = session.durationMinutes - elapsedMin;
  return remaining > 0 ? remaining : 0;
}

/**
 * 判断最近 1 小时是否复习过
 * - 优先用 LearnLog(type=review/review_complete).timestamp 精确判断
 * - 无 timestamp 时回退到 ReviewLog.date === today（粗略）
 */
function hasReviewedRecently(
  reviewLogs: ReviewLog[],
  learnLogs: LearnLog[],
  nowIso: string,
): boolean {
  const nowMs = new Date(nowIso).getTime();

  // 优先用 LearnLog 的 timestamp 精确判断（最近 1 小时内）
  const recentReviewLog = learnLogs.find(
    (l) =>
      (l.type === "review" || l.type === "review_complete") &&
      l.timestamp &&
      nowMs - new Date(l.timestamp).getTime() <= ONE_HOUR_MS,
  );
  if (recentReviewLog) return true;

  // 回退：今日有 ReviewLog（无时间，只能粗略判断"今天复习过"）
  const today = chinaDateNow();
  return reviewLogs.some((r) => r.date === today);
}

/**
 * 判断当前时间是否落在 Routine.slots 内
 * 返回命中的 slot，未命中返回 null
 */
function findCurrentSlot(
  routine: Routine,
  now: Date,
): { label: string; start: string; end: string; minutes: number } | null {
  const curMin = now.getHours() * 60 + now.getMinutes();
  for (const slot of routine.slots) {
    const start = parseHHMM(slot.start);
    const end = parseHHMM(slot.end);
    if (start === null || end === null) continue;
    if (curMin >= start && curMin < end) {
      return slot;
    }
  }
  return null;
}

/**
 * 计算当前时间距离 sleepTime 的分钟数
 * @returns 正数 = 还有 X 分钟到睡眠时间；负数 = 已过睡眠时间；null = 解析失败
 */
function computeMinutesToSleepTime(sleepTime: string, now: Date): number | null {
  const target = parseHHMM(sleepTime);
  if (target === null) return null;
  const curMin = now.getHours() * 60 + now.getMinutes();
  return target - curMin;
}

/** 解析 "HH:MM" 为当天分钟数（0-1439），非法返回 null */
function parseHHMM(s: string): number | null {
  const m = s.trim().match(/^(\d{1,2}):(\d{2})$/);
  if (!m) return null;
  const h = Number(m[1]);
  const min = Number(m[2]);
  if (h < 0 || h > 23 || min < 0 || min > 59) return null;
  return h * 60 + min;
}
