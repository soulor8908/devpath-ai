// lib/timer/pomodoro-rule.ts
// 番茄钟规则纯函数：
//   - 休息类型规则：每 4 个专注后长休息
//   - 推荐时长规则：light=15/5/10、standard=25/5/15、intensive=50/10/20
//
// 设计：纯函数模块，无副作用，无 IO，方便单测

import type { PomodoroSessionType } from "@/lib/types";

/** 学习强度档位 */
export type PomodoroIntensity = "light" | "standard" | "intensive";

/**
 * 计算下一次休息的类型
 * 规则：每 4 个专注后长休息，否则短休息
 *
 * @param sessionCount 已完成的专注 session 数（>=0）
 * @returns "long_break" 或 "short_break"
 *
 * 例子：
 *   sessionCount=0 → short_break（专注前休息，理论上一般不调用）
 *   sessionCount=1 → short_break
 *   sessionCount=3 → short_break
 *   sessionCount=4 → long_break  ← 第 4 个专注后长休息
 *   sessionCount=5 → short_break
 *   sessionCount=8 → long_break  ← 第 8 个专注后长休息
 */
export function getNextBreakType(
  sessionCount: number,
): "short_break" | "long_break" {
  if (sessionCount <= 0) return "short_break";
  // 每 4 个专注后长休息（4, 8, 12, ...）
  return sessionCount % 4 === 0 ? "long_break" : "short_break";
}

/**
 * 根据类型 + 强度推荐时长（分钟）
 *
 * 强度档位（focus / short_break / long_break）：
 *   - light:     15 / 5  / 10
 *   - standard:  25 / 5  / 15
 *   - intensive: 50 / 10 / 20
 *
 * @param type session 类型（focus / short_break / long_break）
 * @param intensity 学习强度，默认 standard
 */
export function getRecommendedDuration(
  type: PomodoroSessionType,
  intensity: PomodoroIntensity = "standard",
): number {
  const table: Record<PomodoroIntensity, Record<PomodoroSessionType, number>> = {
    light: { focus: 15, short_break: 5, long_break: 10 },
    standard: { focus: 25, short_break: 5, long_break: 15 },
    intensive: { focus: 50, short_break: 10, long_break: 20 },
  };
  return table[intensity][type];
}
