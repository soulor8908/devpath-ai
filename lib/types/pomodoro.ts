// lib/types/pomodoro.ts
// 番茄时钟领域类型：session 类型、状态、完整记录

// ============ 番茄时钟 ============

/** 番茄 session 类型 */
export type PomodoroSessionType = "focus" | "short_break" | "long_break";

/** 番茄 session 状态 */
export type PomodoroSessionStatus = "running" | "paused" | "completed" | "abandoned";

/** 番茄时钟 session（一次专注/休息的完整记录） */
export interface PomodoroSession {
  id: string;
  /** 关联学习计划 ID（休息 session 可空） */
  planId?: string;
  /** 关联知识点 ID（休息 session 可空） */
  nodeId?: string;
  /** 任务描述（用户输入或 AI 生成） */
  taskDescription: string;
  type: PomodoroSessionType;
  /** 时长（分钟） */
  durationMinutes: number;
  /** 开始时间 ISO */
  startedAt: string;
  status: PomodoroSessionStatus;
  /** 完成时间 ISO（status=completed/abandoned 时填写） */
  completedAt?: string;
  /** 今日第几个番茄（从 1 开始，用于长休息判定） */
  sessionIndex: number;
  /** 被打断次数（visibilitychange 切走标签页累计） */
  interruptions: number;
  /** 开始时的能量等级（1-5，供能量回归模型使用） */
  energyBefore?: number;
  /** 结束时的能量等级（1-5，供能量回归模型使用） */
  energyAfter?: number;
  /** 暂停累计时长（分钟，用于精确计算实际专注时长） */
  pausedMinutes?: number;
}
