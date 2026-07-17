// lib/learn-log.ts
// 学习记录采集与统计：记录用户学习/复习/查看行为，计算仪表盘数据

import { nanoid } from "nanoid";
import { getItem, setItem, listItems, delItem } from "./storage/db";
import { KEY_PREFIXES, type LearnLog, type LearnStats, type Routine, type LearningPlan } from "./types";

/** 今日日期 YYYY-MM-DD（本地时区） */
function todayDate(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** ISO 转 YYYY-MM-DD */
function toDate(iso: string): string {
  const d = new Date(iso);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** 记录一条学习日志 */
export async function logLearning(params: {
  planId: string;
  nodeId?: string;
  questionId?: string;
  type: LearnLog["type"];
}): Promise<void> {
  const log: LearnLog = {
    id: nanoid(),
    planId: params.planId,
    nodeId: params.nodeId,
    questionId: params.questionId,
    type: params.type,
    timestamp: new Date().toISOString(),
    date: todayDate(),
  };
  await setItem(KEY_PREFIXES.LEARN_LOG + log.id, log);
}

/** 获取所有学习日志（按时间正序） */
export async function getAllLogs(): Promise<LearnLog[]> {
  const logs = await listItems<LearnLog>(KEY_PREFIXES.LEARN_LOG);
  return logs.sort((a, b) => {
    const ta = a.timestamp ? new Date(a.timestamp).getTime() : new Date(a.date).getTime();
    const tb = b.timestamp ? new Date(b.timestamp).getTime() : new Date(b.date).getTime();
    return ta - tb;
  });
}

/** 获取指定计划的学习日志 */
export async function getLogsByPlan(planId: string): Promise<LearnLog[]> {
  const logs = await getAllLogs();
  return logs.filter((l) => l.planId === planId);
}

/** 删除指定计划的所有日志 */
export async function deleteLogsByPlan(planId: string): Promise<void> {
  const logs = await getLogsByPlan(planId);
  await Promise.all(logs.map((l) => delItem(KEY_PREFIXES.LEARN_LOG + l.id)));
}

/** 计算连续学习天数 */
function computeStreak(dates: string[]): { current: number; longest: number } {
  if (dates.length === 0) return { current: 0, longest: 0 };
  const sorted = [...new Set(dates)].sort();
  const today = todayDate();
  const yesterday = toDate(new Date(Date.now() - 86400000).toISOString());

  // 当前连续：从最后一天往前数
  let current = 0;
  let lastDate = sorted[sorted.length - 1];
  // 如果最后一天是今天或昨天，从那天开始数
  if (lastDate === today || lastDate === yesterday) {
    current = 1;
    const checkDate = new Date(lastDate);
    for (let i = sorted.length - 2; i >= 0; i--) {
      checkDate.setDate(checkDate.getDate() - 1);
      const expected = toDate(checkDate.toISOString());
      if (sorted[i] === expected) {
        current++;
      } else {
        break;
      }
    }
  }

  // 最长连续
  let longest = 1;
  let tempStreak = 1;
  for (let i = 1; i < sorted.length; i++) {
    const prev = new Date(sorted[i - 1]);
    prev.setDate(prev.getDate() + 1);
    if (toDate(prev.toISOString()) === sorted[i]) {
      tempStreak++;
      longest = Math.max(longest, tempStreak);
    } else {
      tempStreak = 1;
    }
  }

  return { current, longest: Math.max(longest, current) };
}

/** 计算学习统计 */
export async function computeStats(): Promise<LearnStats> {
  const logs = await getAllLogs();

  // 按天聚合
  const dailyActivity: Record<string, number> = {};
  const allDates: string[] = [];
  for (const log of logs) {
    dailyActivity[log.date] = (dailyActivity[log.date] ?? 0) + 1;
    allDates.push(log.date);
  }

  // 最近 30 天活动
  const recent30: Record<string, number> = {};
  for (let i = 0; i < 30; i++) {
    const d = new Date(Date.now() - i * 86400000);
    const dateStr = toDate(d.toISOString());
    if (dailyActivity[dateStr]) {
      recent30[dateStr] = dailyActivity[dateStr];
    }
  }

  // 各类型计数
  const learnedCount = logs.filter((l) => l.type === "learn_complete").length;
  const reviewedCount = logs.filter((l) => l.type === "review_complete").length;
  const viewedQuestions = logs.filter((l) => l.type === "question_view").length;
  const favoritedQuestions = logs.filter((l) => l.type === "question_favorite").length;

  // 连续学习天数
  const { current: currentStreak, longest: longestStreak } = computeStreak(allDates);

  // 各知识点进度（从所有计划中聚合）
  const allPlans = await listItems<LearningPlan>(KEY_PREFIXES.PLAN);
  const nodeProgress: Record<string, { completed: number; total: number; mastery: number }> = {};
  for (const plan of allPlans) {
    for (const node of plan.knowledgeTree ?? []) {
      if (!nodeProgress[node.id]) {
        nodeProgress[node.id] = { completed: 0, total: 0, mastery: 0 };
      }
      nodeProgress[node.id].total += 1;
    }
    for (const item of plan.schedule ?? []) {
      if (item.completed && nodeProgress[item.nodeId]) {
        nodeProgress[item.nodeId].completed += 1;
      }
    }
  }
  // 计算掌握度
  const weakAreas: string[] = [];
  for (const [nodeId, prog] of Object.entries(nodeProgress)) {
    prog.mastery = prog.total > 0 ? Math.round((prog.completed / prog.total) * 100) : 0;
    if (prog.total > 0 && prog.completed / prog.total < 0.5) {
      weakAreas.push(nodeId);
    }
  }

  return {
    totalDays: Object.keys(dailyActivity).length,
    totalActions: logs.length,
    learnedCount,
    reviewedCount,
    viewedQuestions,
    favoritedQuestions,
    currentStreak,
    longestStreak,
    dailyActivity: recent30,
    nodeProgress,
    weakAreas,
  };
}

/** 获取用户作息时间表 */
export async function getRoutine(): Promise<Routine | undefined> {
  return getItem<Routine>(KEY_PREFIXES.ROUTINE_DATA);
}

/** 保存用户作息时间表 */
export async function saveRoutine(routine: Routine): Promise<void> {
  await setItem(KEY_PREFIXES.ROUTINE_DATA, routine);
}

/**
 * 规范化 Routine：对每个字段做回退，避免旧数据缺字段导致渲染崩溃。
 * - 入参 undefined → 返回 DEFAULT_ROUTINE 的深拷贝
 * - 非数组的 slots/weeks 回退到默认
 * - 缺失的标量字段回退到默认
 */
export function normalizeRoutine(r?: Routine): Routine {
  if (!r)
    return {
      ...DEFAULT_ROUTINE,
      slots: DEFAULT_ROUTINE.slots.map((s) => ({ ...s })),
      weekdays: [...DEFAULT_ROUTINE.weekdays],
    };
  return {
    wakeTime: r.wakeTime ?? DEFAULT_ROUTINE.wakeTime,
    sleepTime: r.sleepTime ?? DEFAULT_ROUTINE.sleepTime,
    slots: Array.isArray(r.slots)
      ? r.slots
      : DEFAULT_ROUTINE.slots.map((s) => ({ ...s })),
    weekdays: Array.isArray(r.weekdays)
      ? r.weekdays
      : [...DEFAULT_ROUTINE.weekdays],
    intensity: r.intensity ?? DEFAULT_ROUTINE.intensity,
  };
}

/** 默认作息时间表 */
export const DEFAULT_ROUTINE: Routine = {
  wakeTime: "08:00",
  sleepTime: "23:00",
  slots: [
    { label: "早晨", start: "08:00", end: "09:00", minutes: 30 },
    { label: "午间", start: "12:30", end: "13:30", minutes: 30 },
    { label: "晚上", start: "20:00", end: "22:00", minutes: 60 },
  ],
  weekdays: [1, 2, 3, 4, 5],
  intensity: "standard",
};
