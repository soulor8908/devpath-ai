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
//
// 2026-07-25 扩展：nodeStates 派生字段
//   - 用途：study-queue 据此过滤已掌握/全部看懂的节点，避免首页今日清单包含已掌握任务
//   - 由 toSummary(plan) 派生计算（不存原始 questions/knowledgeTree）
//   - 旧 summary 缺此字段时回退为空对象（不过滤），向后兼容
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
  /**
   * 节点状态派生表（2026-07-25 新增）：nodeId → { mastered, allUnderstood }
   * - mastered: 节点被显式标记为已掌握（mastered=true）
   * - allUnderstood: 节点下所有题 understood=true（即使未被显式 mastered）
   * study-queue 据此过滤：mastered 或 allUnderstood 的节点不进入今日学习队列
   * 旧 summary 缺此字段时回退为空对象（不过滤），向后兼容
   */
  nodeStates?: Record<string, { mastered: boolean; allUnderstood: boolean }>;
  /**
   * 已看懂题目数（2026-07-26 新增）：列表页/详情页据此展示"已看懂 X/Y 题"进度。
   * - 派生自 plan.questions.filter(q => q.understood).length
   * - 旧 summary 缺此字段时回退为 0（向后兼容）
   * - 用户在训练页点"我答对了"或计划详情页点"看懂了"后，savePlanSummary 会同步更新此字段
   * - 解决用户反馈"我答对了进度还是 0"：列表卡片直接展示进度，让用户看到点击有效
   */
  understoodCount?: number;
  /**
   * 是否为 Demo 预置数据（2026-07-31 新增）。
   * - 用于 findExistingPlanByTopic 排除 demo 计划，避免用户导入 preset 时误判重复
   * - 旧 summary 缺此字段时视为非 demo（向后兼容）
   */
  isDemo?: boolean;
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

  // ============ 深度内容字段（v4 引入，让学习路径节点本身就是求职资产） ============
  // 设计动机（卡帕西视角）：旧 schema 只有 summary 一句话，用户看到的学习路径就是
  // "标题列表 + 一句话摘要"，必然浮于表面。深度字段让每个节点自带核心机制/踩坑/面试角度/
  // 来源提示，用户即使不点进具体题目，也能从知识树本身获取求职级深度。
  // 字段全部可选：向后兼容现有 preset 与旧 IndexedDB 数据；AI 新生成的节点会自带这些字段。
  // 守护：preset-content-quality.test.ts 对"带字段的节点"做达标校验，缺字段不强制报错
  // （渐进收紧策略），但 content-generation-standard.test.ts 强制 knowledge_decompose
  // prompt 必须包含这些字段的约束标记。

  /**
   * 核心机制 80-150 字：回答"为什么这样设计、内部发生什么、权衡与适用场景"。
   * 含量化细节（具体数字/量级/百分比），禁止名词罗列或教科书定义。
   * 与 summary 区别：summary 是一句话指路，coreMechanism 是机制深挖。
   */
  coreMechanism?: string;

  /**
   * 高频踩坑 2-3 条，每条带具体场景与修复方向。
   * 反例（不合格）："注意性能" / "避免内存泄漏"
   * 正例（合格）："高频删除导致 HNSW 墓碑节点膨胀，p95 退化 → 定期 reindex 或选 IVF-Flat"
   */
  commonPitfalls?: string[];

  /**
   * 4 题角度提示，对应题目规范四角度（docs/content-generation-standard.md 第 3.1 节）：
   * 概念辨析 / 原理深挖 / 实战设计 / 踩坑对比，各一句带具体场景感的提示。
   * 后续 question_generate 会基于这些角度产具体题目。
   */
  interviewAngles?: string[];

  /**
   * 一手来源提示（官方文档/规范/论文/工程博客的名称，不强制 URL，给方向即可）。
   * 例："MDN Web Docs / Chrome DevTools 团队博客" / "OpenAI Embeddings 文档 + Eugene Yan RAG 实战博客"
   * 用途：用户验证内容真实性 + 深入学习时的入口，避免"AI 说什么就信什么"。
   */
  sourceHint?: string;
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
