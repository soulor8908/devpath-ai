// lib/types/review.ts
// FSRS 复习 + 学习数据领域类型：复习卡、评分、复习日志、学习日志、错题记录、提醒、学习统计

// FSRS 复习卡片
export interface ReviewCard {
  id: string;
  planId: string;
  nodeId: string;
  questionId: string;
  front: string;
  back: string;
  due: string;
  stability: number;
  difficulty: number;
  elapsedDays: number;
  scheduledDays: number;
  reps: number;
  lapses: number;
  state: 0 | 1 | 2 | 3 | 4;
  lastReview: string;
  /**
   * 关联的收藏试题集 ID（如有）。
   * 用于「开始复习」时查重：deckId + questionId 唯一标识一张卡。
   * 历史 / 演示数据可能缺失，按 undefined 处理。
   */
  deckId?: string;
}

// FSRS 评分
export type Rating = 1 | 2 | 3 | 4; // Again / Hard / Good / Easy

// 复习日志
export interface ReviewLog {
  id: string;
  cardId: string;
  date: string;
  rating: 1 | 2 | 3 | 4;
  elapsedDays: number;
  stateBefore: number;
  stateAfter: number;
}

// 学习日志
export interface LearnLog {
  id: string;
  planId: string;
  /** 关联知识点（question_view 时可空） */
  nodeId?: string;
  /** 关联面试题（可选） */
  questionId?: string;
  date: string;
  /** 精确时间戳 ISO（可选，旧数据可能没有） */
  timestamp?: string;
  /** 学习时长（分钟）。
   * 旧字段原本仅作兼容用；新增 type=focus_session 后，
   * 此字段明确表示"实际专注分钟数（扣除打断）"。
   * 旧的 learn/review 类型不写此字段，保持兼容。 */
  duration?: number;
  type: "learn" | "review" | "learn_complete" | "review_complete" | "question_view" | "question_favorite" | "question_regenerate" | "focus_session";
}

// 错题记录（复习时答错自动收集）
export interface MistakeRecord {
  id: string;
  /** 关联计划 ID */
  planId: string;
  /** 关联题目 ID */
  questionId: string;
  /** 关联知识点 ID */
  nodeId: string;
  /** 题目内容快照（避免题目被删除后无法显示） */
  questionText: string;
  /** 答错次数 */
  wrongCount: number;
  /** 最近一次答错时间 ISO */
  lastWrongAt: string;
  /** 是否已掌握（从错题本移除） */
  resolved: boolean;
  /** 创建时间 ISO */
  createdAt: string;
}

// AI 工具创建的提醒（浏览器通知）
export interface Reminder {
  id: string;
  /** 提醒标题 */
  title: string;
  /** 提醒内容（可选，更详细的描述） */
  body?: string;
  /** 触发时间 ISO 字符串 */
  scheduledFor: string;
  /** 创建时间 ISO */
  createdAt: string;
  /** 是否已触发 */
  triggered: boolean;
  /** 关联学习计划 ID（可选） */
  planId?: string;
}

// 学习统计（仪表盘用）
export interface LearnStats {
  /** 总学习天数 */
  totalDays: number;
  /** 总学习行为数 */
  totalActions: number;
  /** 已完成学习任务数 */
  learnedCount: number;
  /** 已完成复习任务数 */
  reviewedCount: number;
  /** 已查看面试题数 */
  viewedQuestions: number;
  /** 已收藏面试题数 */
  favoritedQuestions: number;
  /** 当前连续学习天数 */
  currentStreak: number;
  /** 最长连续学习天数 */
  longestStreak: number;
  /** 最近 30 天活动：{ date: count } */
  dailyActivity: Record<string, number>;
  /** 各知识点掌握度：{ nodeId: { completed, total, mastery } } */
  nodeProgress: Record<string, { completed: number; total: number; mastery: number }>;
  /** 薄弱知识点 ID（完成率 < 50%） */
  weakAreas: string[];
}
