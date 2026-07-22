// lib/types/profile.ts
// 用户画像领域类型（AI 画像）：技能等级、学习风格、AI 人格、目标、画像

// ============ 用户画像 ============

/** 技能等级 */
export type SkillLevel = "beginner" | "intermediate" | "advanced";

/** 学习风格（P2，可从 LearnLog type 分布推断） */
export type LearningStyle = "visual" | "hands-on" | "reading" | "mixed";

/** AI 人格 ID */
export type PersonaId = "strict_coach" | "gentle_companion" | "socratic_tutor" | "peer_dev";

/** 用户目标（短/中/长期） */
export interface UserGoal {
  text: string;
  /** 完成进度 0-1 */
  progress?: number;
  /** 目标日期 ISO（可选） */
  targetDate?: string;
}

/** 用户画像（单例，存 IndexedDB + 增量同步到 KV） */
export interface UserProfile {
  /** 固定为 "ai:profile"（单例标识） */
  id: "ai:profile";
  /** 技能等级：key 为 nodeId，value 为 beginner/intermediate/advanced */
  skillLevel: Record<string, SkillLevel>;
  /** 各节点准确率（从 ReviewLog 聚合，用于 skillLevel 判定的第二维度） */
  accuracyByNode: Record<string, { correct: number; total: number }>;
  /** 偏好学习时段（如 ["06:00-07:00", "12:00-12:30"]） */
  preferredTimeSlots: string[];
  /** 平均专注时长（分钟，从 EnergySample.actualMinutes 聚合） */
  averageSessionMinutes: number;
  /** 学习风格（P2，可选） */
  learningStyle?: LearningStyle;
  /** 用户偏好的 AI 人格（覆盖自动选择，undefined=自动） */
  preferredPersona?: PersonaId;
  /** 短期目标（1-2 周） */
  goals: {
    short: UserGoal[];
    mid: UserGoal[];
    long: UserGoal[];
  };
  /** 严格专注模式（true=3 次打断自动放弃，false=只记录） */
  strictFocusMode?: boolean;
  /** 最近更新时间 ISO */
  updatedAt: string;
}
