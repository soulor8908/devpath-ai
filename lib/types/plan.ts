// lib/types/plan.ts
// 学习计划领域类型：学习计划、知识节点、面试题、日程项、收藏试题集、提示词库、职业路径

// 学习计划
export interface LearningPlan {
  id: string;
  topic: string;
  knowledgeTree: KnowledgeNode[];
  questions: Question[];
  schedule: ScheduleItem[];
  dailyMinutes: number;
  maxNewPerDay: number;
  fsrsMode: "conservative" | "standard" | "aggressive";
  /** 生成时使用的自定义提示词（用于重新生成时回填） */
  prompt?: string;
  /** 冻结状态：冻结后不计入每日调度和 AI 推荐 */
  frozen?: boolean;
  /** 优先级 1-5（1=最高），多计划并存时排序用，默认 3 */
  priority?: number;
  /** 截止日期 ISO（可选，用于优先级引擎 deadline_urgency 计算） */
  deadline?: string;
  /** 是否为 Demo 预置数据（首次访问自动注入，用户创建真实计划后可清除） */
  isDemo?: boolean;
  createdAt: string;
  updatedAt: string;
}

// 学习计划摘要（仅用于列表展示，体积小、加载快）
// 列表页只加载摘要，点击进入详情时才加载完整 plan
// P1 优化：包含 schedule（轻量字段），首页 computeTodaySchedule 无需加载完整 plan
export interface LearningPlanSummary {
  id: string;
  topic: string;
  knowledgeCount: number;
  questionCount: number;
  scheduleDays: number;
  dailyMinutes: number;
  maxNewPerDay: number;
  /** 完整 schedule（P1 新增）：首页计算今日安排用，避免加载 knowledgeTree/questions */
  schedule: ScheduleItem[];
  createdAt: string;
  updatedAt: string;
}

// 知识节点
export interface KnowledgeNode {
  id: string;
  title: string;
  difficulty: 1 | 2 | 3 | 4 | 5;
  prerequisites: string[];
  frequency: "高" | "中" | "低";
  summary: string;
  /**
   * 掌握度（0-100）。
   *
   * 设计变更（学习反馈闭环）：
   *   - 旧实现：直接存储数值，但创建后从未更新 → 永远 0% 的"数据干尸"
   *   - 新实现：派生字段，由 computeNodeMastery(node, questions) 计算
   *     （understood 题目数 / 总题目数 * 100）
   *   - 此字段保留是为了向后兼容（旧 IndexedDB 数据），但 UI 应优先用 computeNodeMastery
   *     而非直接读这个字段
   */
  mastery: number;
  /** 用户主观标记"已掌握"（与派生 mastery 互补：mastery 是客观题数比，mastered 是用户主观判断） */
  mastered?: boolean;
  /** 标记掌握的时间（ISO 字符串） */
  masteredAt?: string;
  /** 用户主动标记"需要加强"（薄弱点反馈，影响 AI 上下文与 FSRS 复习调度） */
  needsReinforce?: boolean;
  customOrder?: number;
  // 大厂高频考点标记（true = 互联网大厂面试重点考察）
  bigTech?: boolean;
}

// 面试题
export interface Question {
  id: string;
  nodeId: string;
  question: string;
  answer: string;
  keyPoints: string[];
  followUps: string[];
  codeSnippet?: string;
  favorited: boolean;
  favoritedAt?: string;
  // 大厂高频面试题标记
  bigTech?: boolean;
  // 关联 AI 调用记录 ID（用于反馈归因，仅客户端重新生成时填充）
  aiCallId?: string;
  /**
   * 答案生成失败的错误信息（流式生成失败时填充）。
   * 含此字段表示该题答案未成功生成，不应进入复习卡池，也不应缓存到正式计划。
   * 用户可在详情页用"继续生成"重试，成功后此字段应被清除。
   */
  answerError?: string;
  /** 用户展开过答案（隐式反馈：用户看过这道题的解答） */
  viewed?: boolean;
  viewedAt?: string;
  /** 用户主动点"看懂了"（显式正向反馈，参与 computeNodeMastery 计算） */
  understood?: boolean;
  understoodAt?: string;
}

// 试题集收藏
export interface FavoriteDeck {
  id: string;
  planId: string;
  topic: string;
  questionIds: string[];
  questionCount: number;
  favoritedAt: string;
  questions: Question[];
  knowledgeTree: KnowledgeNode[];
}

// 学习计划项
export interface ScheduleItem {
  day: number;
  nodeId: string;
  type: "learn" | "review";
  cardId?: string;
  estimatedMinutes: number;
  completed: boolean;
  completedAt?: string;
}

// 用户保存的常用提示词
export interface PromptLibraryItem {
  id: string;
  /** 提示词标题（用户给的名字） */
  title: string;
  /** 提示词内容（附加到 AI 生成请求的指令） */
  content: string;
  /** 创建时间 ISO */
  createdAt: string;
  /** 最近使用时间 ISO */
  usedAt?: string;
  /** 使用次数 */
  usedCount: number;
}

// ============ 职业路径（V2 乔布斯视角重构） ============

export interface CareerPathNode {
  id: string;
  title: string;
  description: string;
  estimatedHours: number;
  isMilestone: boolean;
  interviewFrequency: "高" | "中" | "低";
}

export interface CareerPath {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  description: string;
  weeksEstimate: number;
  weeklyHours: number;
  dailyMinutesDefault: number;
  maxNewPerDayDefault: number;
  difficulty: "beginner" | "intermediate" | "advanced";
  cta: string;
  linkedPresetId: string;
  nodes: CareerPathNode[];
}
