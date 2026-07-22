// lib/types/engine.ts
// 引擎领域类型：可行性评分 + 优先级引擎 + 节奏引擎

import type { PomodoroSession } from "./pomodoro";
import type { ReviewCard } from "./review";
import type { LearningPlan, ScheduleItem } from "./plan";
import type { Routine } from "./routine";
import type { UserProfile } from "./profile";

// ============ 计划可行性评分 ============

/** 计划降级建议（confidence < 0.5 时给出） */
export interface DowngradePlan {
  /** 建议减少的每周学习小时数 */
  reduceHoursPerWeek?: number;
  /** 建议减少的每日新学节点数 */
  reduceNewPerDay?: number;
}

/** 可行性评分结果 */
export interface FeasibilityScore {
  /** 是否可行 */
  feasible: boolean;
  /** 置信度 0-1（< 0.5 标记不可行） */
  confidence: number;
  /** 风险列表（如"每日要求 60 分钟但历史平均仅 30 分钟"） */
  risks: string[];
  /** 建议（如"建议减少每日新学量到 1 个"） */
  suggestions: string[];
  /** 降级方案（confidence < 0.5 时给出具体参数） */
  downgradePlan?: DowngradePlan;
}

// ============ 优先级引擎 ============

/** 健康检查告警 */
export interface HealthAlert {
  id: string;
  /** 告警类型 */
  type: "overdue_tasks" | "low_completion_rate" | "energy_declining" | "fsrs_backlog";
  /** 严重程度 */
  severity: "info" | "warning" | "critical";
  /** 告警标题 */
  title: string;
  /** 详细描述 */
  description: string;
  /** 建议动作（如"重新排优先级"） */
  suggestedAction?: string;
  /** 关联计划 ID（可选） */
  planId?: string;
  /** 创建时间 ISO */
  createdAt: string;
}

/** 优化日程模式 */
export type OptimizeMode = "balanced" | "catch_up" | "light";

/** 优化结果 */
export interface OptimizeResult {
  /** 重排后的任务 ID 顺序 */
  reorderedTaskIds: string[];
  /** 决策理由（给用户看） */
  reasoning: string;
  /** 关联的告警列表 */
  alerts: HealthAlert[];
}

// ============ 节奏引擎 ============

/** 节奏引擎决策上下文（聚合所有信号） */
export interface RhythmContext {
  /** 当前进行中的番茄 session（如有） */
  runningSession: PomodoroSession | null;
  /** 今日能量（1-5，可能未记录） */
  todayEnergy: number | null;
  /** 今日心情 */
  todayMood?: string;
  /** 到期 FSRS 卡片 */
  dueCards: ReviewCard[];
  /** 最近 1 小时是否有复习记录 */
  reviewedRecently: boolean;
  /** 活跃学习计划（未冻结） */
  activePlans: LearningPlan[];
  /** 用户作息 */
  routine?: Routine;
  /** 用户画像 */
  profile?: UserProfile;
  /** 当前时间 ISO */
  now: string;
  /** 今日已完成番茄数 */
  todayFocusCount: number;
}

/** 节奏引擎输出的下一步行动（联合类型） */
export type NextAction =
  | { type: "start_focus"; task?: ScheduleItem; duration: number; reason: string; planId?: string }
  | { type: "review"; cards: ReviewCard[]; reason: string }
  | { type: "break"; minutes: number; reason: string }
  | { type: "rest"; reason: string }
  | { type: "plan_next_day"; reason: string }
  | { type: "continue_focus"; session: PomodoroSession; reason: string };
