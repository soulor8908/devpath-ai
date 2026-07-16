// lib/timer/session-tracker.ts
// 番茄钟会话统计：今日完成数 / 累计专注分钟 / 最近 N 天 sessions
//
// 设计：
//   - 所有查询走 listItems(prefix="pomodoro:")，按 status/date 过滤
//   - "今日"以 chinaDateNow() 判定（Asia/Shanghai 时区）
//   - 仅统计 status=completed 的 focus session（abandoned 不计）
//   - 与 pomodoro.ts 单向依赖：pomodoro.ts → session-tracker.ts → db.ts

import { listItems } from "@/lib/storage/db";
import { KEY_PREFIXES, type PomodoroSession } from "@/lib/types";
import { chinaDateNow, chinaDateShift } from "@/lib/time";

/**
 * 今日 completed 的 focus session 数
 * 用于：createSession 计算 sessionIndex = getTodayCount() + 1
 */
export async function getTodayCount(): Promise<number> {
  const today = chinaDateNow();
  const sessions = await listItems<PomodoroSession>(KEY_PREFIXES.POMODORO_SESSION);
  return sessions.filter(
    (s) =>
      s.type === "focus" &&
      s.status === "completed" &&
      isSameChinaDay(s.startedAt, today),
  ).length;
}

/**
 * 今日累计 focus 分钟数（仅 completed 的 focus session）
 * 用于：completeSession 后调 updateActualMinutes(today, 累计时长)
 */
export async function getTodayFocusMinutes(): Promise<number> {
  const today = chinaDateNow();
  const sessions = await listItems<PomodoroSession>(KEY_PREFIXES.POMODORO_SESSION);
  return sessions
    .filter(
      (s) =>
        s.type === "focus" &&
        s.status === "completed" &&
        isSameChinaDay(s.startedAt, today),
    )
    .reduce((sum, s) => sum + effectiveDurationMinutes(s), 0);
}

/**
 * 最近 N 天的 sessions（按 startedAt 倒序）
 * @param days 最近多少天（含今天）
 */
export async function getRecentSessions(days: number): Promise<PomodoroSession[]> {
  const today = chinaDateNow();
  const startDate = chinaDateShift(today, -(days - 1));
  const startMs = new Date(startDate + "T00:00:00+08:00").getTime();
  const sessions = await listItems<PomodoroSession>(KEY_PREFIXES.POMODORO_SESSION);
  return sessions
    .filter((s) => new Date(s.startedAt).getTime() >= startMs)
    .sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime());
}

// ============ 内部工具 ============

/** 判断 ISO 时间是否属于中国时区的某天 */
function isSameChinaDay(iso: string, chinaDateStr: string): boolean {
  // 用 Intl.DateTimeFormat 解析 ISO 的中国时区日期部分
  const parts = new Intl.DateTimeFormat("zh-CN", {
    timeZone: "Asia/Shanghai",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date(iso));
  const y = parts.find((p) => p.type === "year")?.value || "";
  const m = parts.find((p) => p.type === "month")?.value || "";
  const d = parts.find((p) => p.type === "day")?.value || "";
  return `${y}-${m}-${d}` === chinaDateStr;
}

/** session 有效专注分钟：durationMinutes - interruptions（每次打断按 1 分钟扣减，下限 0） */
function effectiveDurationMinutes(s: PomodoroSession): number {
  const eff = s.durationMinutes - (s.interruptions ?? 0);
  return eff > 0 ? eff : 0;
}
