// lib/achievements/store.ts
// 成就持久化：读写 IndexedDB（key 前缀 KEY_PREFIXES.ACHIEVEMENT = "achievement:"）
//
// 设计：
//   - 统一走 lib/storage/db.ts 的 getItem / setItem / listItems（不直接用 Dexie）
//   - saveAchievement 在 unlockedAt 为空时填入当前 ISO（detectNewAchievements 留空的占位）
//   - listLockedAchievements 返回未解锁的成就定义（带 progress=0，供成就墙展示）

import { getItem, setItem, listItems } from "@/lib/storage/db";
import { KEY_PREFIXES, type Achievement } from "@/lib/types";
import {
  ACHIEVEMENT_DEFINITIONS,
  getAchievementProgress,
  type AchievementStats,
} from "./detector";

/** IndexedDB key：achievement:<id> */
function achievementKey(id: string): string {
  return KEY_PREFIXES.ACHIEVEMENT + id;
}

/**
 * 读取所有已解锁的成就
 * @returns 已解锁成就列表（按 unlockedAt 升序，无成就返回空数组）
 */
export async function listAchievements(): Promise<Achievement[]> {
  const items = await listItems<Achievement>(KEY_PREFIXES.ACHIEVEMENT);
  return items.sort((a, b) => a.unlockedAt.localeCompare(b.unlockedAt));
}

/**
 * 持久化一个成就
 * - 若 unlockedAt 为空字符串（detectNewAchievements 的占位），填入当前 ISO
 * - 已存在同 id 的成就会被覆盖（但正常流程不会重复保存已解锁成就）
 */
export async function saveAchievement(a: Achievement): Promise<void> {
  const stamped: Achievement =
    a.unlockedAt && a.unlockedAt.length > 0
      ? a
      : { ...a, unlockedAt: new Date().toISOString() };
  await setItem(achievementKey(stamped.id), stamped);
}

/**
 * 查询某成就是否已解锁
 */
export async function hasAchievement(id: string): Promise<boolean> {
  const item = await getItem<Achievement>(achievementKey(id));
  return item !== undefined;
}

/**
 * 批量查询已解锁的成就 id 集合（供 detectNewAchievements 去重用）
 */
export async function listUnlockedIds(): Promise<string[]> {
  const items = await listItems<Achievement>(KEY_PREFIXES.ACHIEVEMENT);
  return items.map((a) => a.id);
}

/**
 * 返回未解锁的成就定义（转成 Achievement 形态，progress=0，unlockedAt 为空）
 * 需要传入 stats 用于计算每个未解锁成就的真实 progress
 *
 * @param stats 当前统计（用于计算 progress）
 * @returns 未解锁成就列表（带 progress，unlockedAt 为空）
 */
export async function listLockedAchievements(
  stats: AchievementStats,
): Promise<Achievement[]> {
  const unlockedIds = new Set(await listUnlockedIds());
  const result: Achievement[] = [];
  for (const def of ACHIEVEMENT_DEFINITIONS) {
    if (unlockedIds.has(def.id)) continue;
    // 未解锁：用对应 type 的 currentValue 计算 progress
    const currentValue = currentValueForType(def.type, stats);
    result.push({
      id: def.id,
      type: def.type,
      title: def.title,
      description: def.description,
      icon: def.icon,
      unlockedAt: "",
      progress: getAchievementProgress(def.type, currentValue),
    });
  }
  return result;
}

/**
 * 返回所有成就（已解锁 + 未解锁），供成就墙页面展示
 * 已解锁的 progress=1，未解锁的按 stats 计算 progress
 */
export async function listAllAchievements(
  stats: AchievementStats,
): Promise<Achievement[]> {
  const unlocked = await listAchievements();
  const unlockedMap = new Map(unlocked.map((a) => [a.id, a]));
  const result: Achievement[] = [];
  for (const def of ACHIEVEMENT_DEFINITIONS) {
    const existing = unlockedMap.get(def.id);
    if (existing) {
      result.push({ ...existing, progress: 1 });
    } else {
      const currentValue = currentValueForType(def.type, stats);
      result.push({
        id: def.id,
        type: def.type,
        title: def.title,
        description: def.description,
        icon: def.icon,
        unlockedAt: "",
        progress: getAchievementProgress(def.type, currentValue),
      });
    }
  }
  return result;
}

// ============ 内部工具 ============

/** 根据 type 从 stats 取当前值（用于 progress 计算） */
function currentValueForType(
  type: Achievement["type"],
  stats: AchievementStats,
): number {
  switch (type) {
    case "streak":
      return stats.streakDays;
    case "topic_mastery":
      return stats.completedPlans;
    case "focus_hours":
      return stats.focusMinutes;
    case "review_streak":
      return stats.reviewStreak;
    case "recovery":
      return stats.recoveredFromBreak ? 1 : 0;
    case "first_time":
      // first_time 有 3 个独立成就，progress 用"任一已完成"近似
      return stats.firstPomodoroDone ||
        stats.firstMistakeCorrected ||
        stats.firstWeeklyReportGenerated
        ? 1
        : 0;
    default:
      return 0;
  }
}
