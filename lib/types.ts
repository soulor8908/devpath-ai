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
  /** 学习时长（分钟）。
   * 旧字段原本仅作兼容用；新增 type=focus_session 后，
   * 此字段明确表示"实际专注分钟数（扣除打断）"。
   * 旧的 learn/review 类型不写此字段，保持兼容。 */
  duration?: number;
  type: "learn" | "review" | "learn_complete" | "review_complete" | "question_view" | "question_favorite" | "question_regenerate" | "focus_session";
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
    /** 成就墙是否公开（默认 false，用户需显式开启） */
    achievements: boolean;
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
  /** 番茄钟 session：pomodoro:<id> */
  POMODORO_SESSION: "pomodoro:",
  /** 用户画像（单例）：user:profile:current */
  USER_PROFILE: "user:profile:",
  /** 成就记录：achievement:<id> */
  ACHIEVEMENT: "achievement:",
  /** 优先级引擎缓存：priority_cache:<YYYY-MM-DD>（当日有效） */
  PRIORITY_CACHE: "priority_cache:",
  /** 限流客户端估算：rate_limit:<YYYY-MM-DD>:<scene>（仅 UI 提示） */
  RATE_LIMIT: "rate_limit:",
  /** 学习向导草稿：learn:plan_draft:<topic>（断点续传用，保存后自动删除） */
  PLAN_DRAFT: "learn:plan_draft:",
  /**
   * 知识索引清单缓存（单例 kb_index:manifest，离线可用；不参与云端同步）。
   * 存 KnowledgeIndexManifest（含向量，约 1.5–2MB）。
   * 排除同步：静态资源人人相同，同步会污染 KV backup 配额（见 lib/sync.ts SYNC_PREFIXES）。
   */
  KB_INDEX: "kb_index:",
} as const;

// ============================================================================
// 知识库向量化与 AI 语义检索（v1）
// 详见 docs/superpowers/specs/2026-07-22-knowledge-vector-search-design.md
// ============================================================================

/** 知识索引条目：一个可被检索的知识单元（preset 节点 或 doc 文档节） */
export interface KnowledgeIndexEntry {
  /** 稳定 id：preset 节点 = `preset:<presetId>:<nodeId>`；doc = `doc:<sectionId>` */
  id: string;
  /** 来源类型 */
  source: "preset" | "doc";
  /** 来源预设 id（仅 preset），如 "frontend" */
  presetId?: string;
  /** 来源预设名（仅 preset），如 "前端工程师" */
  presetName?: string;
  /** 文档分类（仅 doc），如 "核心功能" */
  docCategory?: string;
  /** 标题 */
  title: string;
  /** 摘要（卡片展示 + 检索文本的一部分） */
  summary: string;
  /** 检索用全文 = title + " " + summary + keywords 拼接，嵌入用 */
  searchText: string;
  /** 嵌入向量（768 维，bge-base-en-v1.5） */
  vector: number[];
  /** 难度（仅 preset） */
  difficulty?: 1 | 2 | 3 | 4 | 5;
  /** 频率（仅 preset） */
  frequency?: "高" | "中" | "低";
  /** 前置依赖节点 id 列表（仅 preset，用于详情页展示 prereq 链） */
  prerequisites?: string[];
  /** 跳转锚点：doc → `/docs#<id>`；preset → 由 KnowledgeDetailModal 处理（无路由） */
  href: string;
  /** 标签（preset 用 tags，doc 用 keywords） */
  tags: string[];
}

/** 知识索引清单（随构建产物发布的元数据 + 向量） */
export interface KnowledgeIndexManifest {
  /** 索引语义版本（schema 不变则不变，内容变了用 builtAt 区分） */
  version: string;
  /** 嵌入模型 id，如 "@cf/baai/bge-base-en-v1.5" */
  model: string;
  /** 向量维度，如 768 */
  dimensions: number;
  /** 构建时间 ISO */
  builtAt: string;
  /** 条目数 */
  count: number;
  /** 全部条目（含向量） */
  entries: KnowledgeIndexEntry[];
}

/**
 * 聊天消息中引用的知识来源（轻量引用，仅存 id/title/score，不重复存向量）。
 * 挂在 assistant 消息上，用于渲染「知识来源卡片」与点击进入详情。
 */
export interface KnowledgeSourceRef {
  /** 对应 KnowledgeIndexEntry.id */
  id: string;
  /** 标题快照（避免每次都查索引） */
  title: string;
  /** 相似度分数 0–1 */
  score: number;
  /** 来源类型快照 */
  source: "preset" | "doc";
}

// AI 模型配置（用户可在 profile 配置多个）
export interface ModelConfig {
  id: string;
  /** 配置名称（如"我的 GPT"、"DeepSeek"） */
  name: string;
  /** 提供商类型 */
  provider: "glm" | "deepseek" | "mimo" | "kimi" | "custom";
  /** API baseURL（OpenAI 兼容格式） */
  baseURL: string;
  /** API Key（仅本地存储 IndexedDB，不同步到云端 KV——换设备需重新输入） */
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
  | "answer_generate"
  | "daily_nudge"
  | "chat"
  | "energy_pattern"
  | "status_enhance"
  | "weekly_report"
  | "adjust_plan"
  | "chat_tool_action"
  | "emotion_coping"
  | "plan_generate"
  | "schedule_optimize"
  | "focus_session_start"
  | "embed";

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
  /** Token 使用量（可选，仅当 API 返回时填充，用于成本追踪） */
  tokenUsage?: TokenUsage;
  /** 估算成本 USD（可选，由客户端 estimateCost 计算） */
  estimatedCost?: number;
  /** 模型 ID（可选，用于成本归因，如 glm-4-flash / deepseek-chat） */
  modelId?: string;
  /** 时间 */
  createdAt: string;
}

/**
 * AI 调用的 token 使用量（用于成本追踪）
 * 数据来源：
 *   - 流式：Vercel AI SDK data stream protocol 的 "d:" finish 消息中的 usage 字段
 *   - 非流式：generateObject 返回的 result.usage
 */
export interface TokenUsage {
  /** 输入 token 数（prompt tokens） */
  prompt: number;
  /** 输出 token 数（completion tokens） */
  completion: number;
  /** 总 token 数（一般 = prompt + completion） */
  total: number;
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
  /**
   * 该 assistant 回答引用的知识来源（v1 知识检索）。
   * 仅在 pre-retrieval 命中时填充，客户端据此渲染「知识来源卡片」。
   * 轻量引用（KnowledgeSourceRef），不重复存向量。
   */
  knowledgeSources?: KnowledgeSourceRef[];
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
