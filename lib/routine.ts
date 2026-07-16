// lib/routine.ts
// 每日时间表解析 + 当前任务推断（从主项目迁移，改为 IndexedDB 存储）
// 用户在 profile 页面配置 markdown 时间表，存 IndexedDB key="routine:default"
// 首页 CurrentTaskCard 实时显示"现在该做什么"+ 剩余分钟 + 下一项

import type { RoutineSlot, CurrentTask } from "./types";
import { getItem as dbGet, setItem as dbSet } from "./storage/db";

/** IndexedDB key（用户在 profile 配置的唯一默认时间表） */
export const ROUTINE_KEY = "routine:default";

function normalizeTime(t: string): string {
  const [h, m] = t.split(":");
  return `${h.padStart(2, "0")}:${m.padStart(2, "0")}`;
}

function toMinutes(t: string): number {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

/**
 * 解析 markdown 时间表为 RoutineSlot[]
 * 期望格式：`| 06:30 - 07:00 | 🏃 晨跑 | 运动 |`
 */
export function parseRoutine(markdown: string): RoutineSlot[] {
  const slots: RoutineSlot[] = [];
  const lines = markdown.split("\n");

  for (const line of lines) {
    const match = line.match(/\|\s*(\d{1,2}:\d{2})\s*-\s*(\d{1,2}:\d{2})\s*\|\s*(.+?)\s*\|\s*(.+?)\s*\|/);
    if (!match) continue;

    const [, startRaw, endRaw, activityRaw, typeRaw] = match;
    const start = normalizeTime(startRaw);
    const end = normalizeTime(endRaw);

    // 去掉 emoji / 加粗符号
    const activity = activityRaw
      .replace(/\*\*/g, "")
      .replace(/[🏃🎯😴🛏️👨‍👧💪📚💼🔋🍽️☕🚿]/g, "")
      .trim();

    let type: RoutineSlot["type"] = "其他";
    if (typeRaw.includes("运动")) type = "运动";
    else if (typeRaw.includes("学习")) type = "学习";
    else if (typeRaw.includes("休息")) type = "休息";
    else if (typeRaw.includes("家庭")) type = "家庭";
    else if (typeRaw.includes("睡眠")) type = "睡眠";
    else if (typeRaw.includes("工作")) type = "工作";

    slots.push({ start, end, activity, type });
  }

  return slots;
}

/** 根据"HH:MM"找出当前任务 + 剩余分钟 + 下一项 */
export function getCurrentTask(slots: RoutineSlot[], now: string): CurrentTask {
  const nowMin = toMinutes(now);

  let current: RoutineSlot | null = null;
  let next: RoutineSlot | null = null;
  let minutesLeft = 0;

  for (let i = 0; i < slots.length; i++) {
    const slot = slots[i];
    const startMin = toMinutes(slot.start);
    const endMin = toMinutes(slot.end);

    if (nowMin >= startMin && nowMin < endMin) {
      current = slot;
      minutesLeft = endMin - nowMin;
      next = slots[i + 1] ?? null;
      break;
    }
    if (nowMin < startMin) {
      next = slot;
      break;
    }
  }

  return { current, next, minutesLeft };
}

/** 默认时间表模板（首次进入 profile 时给用户参考） */
export function defaultRoutineMarkdown(): string {
  return `# 每日时间表

| 时间 | 活动 | 类型 |
| --- | --- | --- |
| 06:30 - 07:00 | 🏃 晨跑 | 运动 |
| 07:00 - 08:00 | 🍽️ 早餐 + 准备 | 家庭 |
| 08:00 - 12:00 | 💼 上午工作 | 工作 |
| 12:00 - 13:00 | ☕ 午休 | 休息 |
| 13:00 - 18:00 | 💰 下午工作 | 工作 |
| 18:00 - 19:00 | 🍽️ 晚餐 | 家庭 |
| 19:00 - 21:00 | 📚 晚间学习 | 学习 |
| 21:00 - 22:00 | 😴 放松休息 | 休息 |
| 22:00 - 06:30 | 🛏️ 睡眠 | 睡眠 |
`;
}

/** 从 IndexedDB 加载时间表 markdown，无则返回空字符串 */
export async function loadRoutineMarkdown(): Promise<string> {
  const v = await dbGet<string>(ROUTINE_KEY);
  return v ?? "";
}

/** 保存时间表 markdown 到 IndexedDB */
export async function saveRoutineMarkdown(markdown: string): Promise<void> {
  await dbSet(ROUTINE_KEY, markdown);
}
