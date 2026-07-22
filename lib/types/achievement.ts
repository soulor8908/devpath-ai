// lib/types/achievement.ts
// 成就系统领域类型：成就类型、成就记录

// ============ 成就系统 ============

/** 成就类型 */
export type AchievementType =
  | "streak"
  | "topic_mastery"
  | "focus_hours"
  | "review_streak"
  | "recovery"
  | "first_time";

/** 成就记录 */
export interface Achievement {
  id: string;
  type: AchievementType;
  /** 成就标题 */
  title: string;
  /** 成就描述 */
  description: string;
  /** 图标名称（对应 components/Icon.tsx 的 IconName） */
  icon: string;
  /** 解锁时间 ISO */
  unlockedAt: string;
  /** 进度 0-1（未解锁时显示进度，已解锁时为 1） */
  progress?: number;
}
