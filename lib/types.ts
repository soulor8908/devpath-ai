// lib/types.ts
// devpath 全部数据模型（对应 spec Data Model）

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
  createdAt: string;
  updatedAt: string;
}

// 学习计划摘要（仅用于列表展示，体积小、加载快）
// 列表页只加载摘要，点击进入详情时才加载完整 plan
export interface LearningPlanSummary {
  id: string;
  topic: string;
  knowledgeCount: number;
  questionCount: number;
  scheduleDays: number;
  dailyMinutes: number;
  maxNewPerDay: number;
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
  mastery: number;
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
}

// 每日状态
export interface DailyStatus {
  date: string;
  energy: 1 | 2 | 3 | 4 | 5;
  mood: "good" | "neutral" | "bad";
  availableMinutes: number;
  aiAdjustedLoad: number;
  actualMinutes: number;
  /** 多巴胺干扰来源（情绪觉察流程收集，可选——旧数据无此字段） */
  dopamineTrigger?: DopamineTrigger;
}

// 情绪标签（8 种，复用主项目设计）
export type EmotionTag =
  | "焦虑"
  | "兴奋"
  | "疲惫"
  | "烦躁"
  | "满足"
  | "冲动"
  | "平静"
  | "沮丧";

// 多巴胺干扰来源
export type DopamineTrigger = "无" | "刷手机" | "游戏" | "短视频" | "甜食" | "其他";

// 情绪觉察条目（嵌入情绪觉察流程时存入 IndexedDB，key 前缀 emotion:）
// P3 简化：5 字段 → 4 字段 + AI 应对建议
//   - trigger + impact → reason（合并为 1 个输入框）
//   - coping → copingSuggestions（AI 生成）+ selectedCoping（用户多选）+ customCoping（自定义）
//   - tag/emoji/dopamine 保留
//
// 旧数据兼容策略（Issue 5 修复）：
//   - 旧数据（含 trigger/impact/coping 字段）通过 migrateEmotionEntry 在读写时自动迁移
//   - 读取时用 EmotionEntry & LegacyEmotionFields 兼容降级展示
//   - 新写入只使用新字段（EmotionEntry 严格类型），不再包含 deprecated 字段
export interface EmotionEntry {
  /** id 作为 IndexedDB key 后缀，保证一天多条不冲突 */
  id: string;
  /** "YYYY-MM-DD" */
  date: string;
  /** "HH:MM" */
  time: string;
  tag: EmotionTag;
  emoji: string;
  /** 原因+影响合并（P3 简化前是 trigger/impact 两个字段） */
  reason: string;
  /** AI 生成的应对建议（3-5 条） */
  copingSuggestions: string[];
  /** 用户选中的应对建议（多选） */
  selectedCoping: string[];
  /** 用户自定义的应对方式（可选） */
  customCoping: string;
  dopamine: DopamineTrigger;
}

/**
 * 旧版情绪条目字段（P3 前用，已迁移）
 * 仅用于读取历史数据时的类型联合：`EmotionEntry & LegacyEmotionFields`
 * 新代码不再写入这些字段；migrateEmotionEntry 会将其合并到新字段后删除
 */
export interface LegacyEmotionFields {
  /** @deprecated P3 前用，已合并到 reason */
  trigger?: string;
  /** @deprecated P3 前用，已合并到 reason */
  impact?: string;
  /** @deprecated P3 前用，已拆分为 copingSuggestions + selectedCoping + customCoping */
  coping?: string;
}

// 每日时间表时段
export interface RoutineSlot {
  start: string; // "HH:MM"
  end: string; // "HH:MM"
  activity: string;
  type: "运动" | "学习" | "休息" | "家庭" | "睡眠" | "工作" | "其他";
}

// 当前任务（首页"现在该做什么"卡片）
export interface CurrentTask {
  current: RoutineSlot | null;
  next: RoutineSlot | null;
  minutesLeft: number;
}

// ============ 主站迁移类型（阶段 1：类型统一）============
// 以下类型从主站 lib/types.ts 迁入，用于日志编辑器 / 算法进度 / 后端路线

// 能量等级（1=极低 5=极高）
export type EnergyLevel = 1 | 2 | 3 | 4 | 5;

// 情绪文件（一天的情绪笔记，含多条 EmotionEntry）
export interface EmotionFile {
  date: string;
  entries: EmotionEntry[];
}

// 日志 checklist 项
export interface ChecklistItem {
  text: string;
  checked: boolean;
}

// 日志能量数据（从 daily/*.md Markdown 解析）
export interface DailyEnergy {
  sleep: string;
  sleepOnTime: boolean | null;
  exerciseDone: boolean | null;
  exerciseNote: string;
  energyMorning: number | null;
  energyNoon: number | null;
  energyEvening: number | null;
  emotion: string;
  familyQuality: number;
}

// 复盘段落（每日日志的三段式回顾）
export interface DailyReview {
  good: string;
  problems: string;
  tomorrow: string;
}

// 完整的日志结构（从 daily/*.md Markdown 解析）
export interface DailyLog {
  date: string;
  plan: string;
  checklist: ChecklistItem[];
  energy: DailyEnergy;
  review: DailyReview;
}

// 进度统计（仪表盘聚合数据）
export interface ProgressInfo {
  algorithmDone: number;
  algorithmTotal: number;
  algorithmPercent: number;
  streakDays: number;
  totalLogs: number;
  latestLog: string;
  weekHours: number;
  algorithmTodayCount: number;
  algorithmIndependentCount: number;
  backendWeeksDone: number;
  backendWeeksTotal: number;
}

// AI 分析结果（主站 /api/ai 返回格式，DevPath 用 AICallRecord + EnergyPattern 替代）
export interface AIAnalysis {
  summary: string;
  patterns: string[];
  suggestions: string[];
}

// 学习中心 Tab（阶段 3 迁移后用于 /stats 页面切换）
export type StudyTab = "stats";

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
  /** 学习时长（分钟，旧字段，兼容） */
  duration?: number;
  type: "learn" | "review" | "learn_complete" | "review_complete" | "question_view" | "question_favorite" | "question_regenerate";
}

// 公开主页
export interface PublicProfile {
  username: string;
  displayName: string;
  avatar?: string;
  bio: string;
  visibility: {
    radar: boolean;
    heatmap: boolean;
    currentTopic: boolean;
    notes: boolean;
  };
  followerCount: number;
  followingCount: number;
  updatedAt: string;
}

// 用户数据云端备份（全量同步：IndexedDB 所有 key-value 打包）
export interface UserBackup {
  userId: string;
  updatedAt: string;
  version: number;
  data: Record<string, unknown>; // 所有 IndexedDB key-value
}

// 能量模式（扩展为情绪+能量联合分析）
export interface EnergyPattern {
  weekStart: string;
  avgEnergyByWeekday: number[];
  insights: string[];
  recommendations: string[];
  /** 各情绪标签出现次数（最近 28 天） */
  emotionCounts?: Record<EmotionTag, number>;
  /** 各多巴胺干扰来源出现次数（最近 28 天，含来自 DailyStatus 与 EmotionEntry 合并） */
  dopamineCounts?: Record<DopamineTrigger, number>;
  /** 多巴胺干扰高的日子（按日期） */
  highDopamineDates?: string[];
}

// FSRS 评分
export type Rating = 1 | 2 | 3 | 4; // Again / Hard / Good / Easy

// IndexedDB key 前缀常量
export const KEY_PREFIXES = {
  PLAN: "plan:",
  /** 学习计划摘要（轻量列表数据，避免每次都加载完整 plan） */
  PLAN_SUMMARY: "plan_summary:",
  CARD: "card:",
  DECK: "favorite_deck:",
  REVIEW_LOG: "review_log:",
  LEARN_LOG: "learn_log:",
  STATUS: "status:",
  /** 周报缓存：weekly:<weekStart> */
  WEEKLY: "weekly:",
  /** 每日 AI 主动提醒缓存：daily_nudge:<YYYY-MM-DD> */
  DAILY_NUDGE: "daily_nudge:",
  /** 情绪觉察条目：emotion:<date>_<id> */
  EMOTION: "emotion:",
  /** 每日时间表（用户在 profile 配置）：routine:default */
  ROUTINE: "routine:",
  /** 常用提示词库：prompt:<id> */
  PROMPT: "prompt:",
  /** 学习日志：log:<id> */
  LOG: "log:",
  /** 用户作息时间表：routine:default */
  ROUTINE_DATA: "routine:default",
  /** 聊天对话：conv:<id> */
  CONVERSATION: "conv:",
  /** 聊天消息：chat:<conversationId>_<id> */
  CHAT_MESSAGE: "chat:",
  /** AI 模型配置：model:<id> */
  MODEL_CONFIG: "model:",
  /** 错题记录：mistake:<id> */
  MISTAKE: "mistake:",
  /** AI 调用记录：ai_call:<id> */
  AI_CALL: "ai_call:",
  /** AI 输出反馈：ai_feedback:<id> */
  AI_FEEDBACK: "ai_feedback:",
  /** 每日日志（Markdown 格式）：daily_log:<YYYY-MM-DD> */
  DAILY_LOG: "daily_log:",
  /** AI 工具创建的提醒：reminder:<id> */
  REMINDER: "reminder:",
  /** 能量样本（学习时长采集）：energy_sample:<id> */
  ENERGY_SAMPLE: "energy_sample:",
  /** 已训练的能量回归模型：energy_model:current（单例） */
  ENERGY_MODEL: "energy_model:",
} as const;

// AI 模型配置（用户可在 profile 配置多个）
export interface ModelConfig {
  id: string;
  /** 配置名称（如"我的 GPT"、"DeepSeek"） */
  name: string;
  /** 提供商类型 */
  provider: "glm" | "deepseek" | "mimo" | "kimi" | "custom";
  /** API baseURL（OpenAI 兼容格式） */
  baseURL: string;
  /** API Key（存储在 IndexedDB，不上传到云端） */
  apiKey: string;
  /** 模型名称（如 gpt-4o, deepseek-chat, glm-4-flash） */
  model: string;
  /** 是否默认模型 */
  isDefault: boolean;
  /** 创建时间 ISO */
  createdAt: string;
}

// ============ AI 质量观测数据模型 ============

/** AI 调用场景（与 prompt registry 的 key 对应） */
export type AIScene =
  | "knowledge_decompose"
  | "question_generate"
  | "daily_nudge"
  | "chat"
  | "energy_pattern"
  | "status_enhance"
  | "weekly_report"
  | "adjust_plan"
  | "chat_tool_action"
  | "emotion_coping";

/** AI 调用记录（一次 AI 调用 = 一条记录） */
export interface AICallRecord {
  id: string;
  /** 调用场景 */
  scene: AIScene;
  /** prompt 版本指纹（自动从 prompt 内容计算，格式 promptId:version:hash） */
  promptVersion: string;
  /** 输入摘要（topic / nodeId / 快照hash，不存原文，控制体积） */
  inputDigest: string;
  /** 输出摘要（前 100 字 + 结构化字段数量，不存完整输出） */
  outputDigest: string;
  /** 结构化输出验证：schema 验证是否通过 */
  schemaValid: boolean;
  /** 耗时 ms */
  durationMs: number;
  /** 来源：ai / rule / fallback */
  source: "ai" | "rule" | "fallback";
  /** 关联资源 ID（如 planId / questionId / conversationId，用于反馈归因） */
  refId?: string;
  /** 时间 */
  createdAt: string;
}

/** AI 输出反馈动作（显式 + 隐式） */
export type AIFeedbackRating = 1 | 2 | 3 | 4 | 5;
export type AIFeedbackAction = "adopted" | "discarded" | "regenerated" | "edited" | "viewed";
export type AIImplicitAction =
  | "viewed"
  | "expanded"
  | "ignored"
  | "followed_up"
  | "copied"
  | "favorited"
  | "too_simple"      // 停留过短（< 3s 即切走）→ 标记太简单
  | "needs_practice"; // 停留过长（> 5min）→ 标记需要更多练习

/** AI 输出反馈（用户对某次输出的评价） */
export interface AIFeedback {
  id: string;
  /** 关联的 AICallRecord.id */
  callRecordId: string;
  scene: AIScene;
  /** 显式反馈：1=很差 5=很好（仅负面反馈时采集，默认满意不记录） */
  rating?: AIFeedbackRating;
  /** 显式反馈：采纳 / 丢弃 / 再生成 / 编辑 */
  action?: AIFeedbackAction;
  /** 隐式反馈（由系统自动从行为推断） */
  implicitAction?: AIImplicitAction;
  /** 反馈原因（用户选择，如"太难""不相关""答案错误"） */
  reason?: string;
  /** 时间 */
  createdAt: string;
}

// 聊天消息来源（指向触发该对话的题目或知识点）
export interface ChatSource {
  /** 来源类型 */
  type: "question" | "knowledge" | "manual";
  /** 来源 ID（questionId / nodeId） */
  id: string;
  /** 来源标题（题目内容 / 知识点标题） */
  title: string;
  /** 关联计划 ID（用于跳转） */
  planId?: string;
}

// 聊天消息
export interface ChatMessage {
  id: string;
  conversationId: string;
  /** 角色 */
  role: "user" | "assistant" | "system";
  /** 消息内容 */
  content: string;
  /** 创建时间 ISO */
  createdAt: string;
}

// 聊天对话
export interface Conversation {
  id: string;
  /** 对话标题（默认取首条用户消息前 30 字） */
  title: string;
  /** 创建时间 ISO */
  createdAt: string;
  /** 最后更新时间 ISO（用于排序和清理） */
  updatedAt: string;
  /** 最后一条消息时间 ISO */
  lastMessageAt: string;
  /** 是否收藏/置顶（收藏的不自动清理） */
  pinned: boolean;
  /** 使用的模型配置 ID */
  modelConfigId?: string;
  /** 消息来源（如有，指向触发该对话的题目） */
  source?: ChatSource;
  /** 消息数量缓存 */
  messageCount: number;
}

// 用户作息时间表（用于 AI 调整计划）
export interface Routine {
  /** 起床时间 HH:MM */
  wakeTime: string;
  /** 睡觉时间 HH:MM */
  sleepTime: string;
  /** 可用学习时段 */
  slots: {
    /** 时段标签：早晨/午间/晚上 */
    label: string;
    /** 开始 HH:MM */
    start: string;
    /** 结束 HH:MM */
    end: string;
    /** 可用分钟数 */
    minutes: number;
  }[];
  /** 每周可学习的星期（1-7，1=周一） */
  weekdays: number[];
  /** 偏好学习强度：轻松/标准/冲刺 */
  intensity: "light" | "standard" | "intensive";
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
