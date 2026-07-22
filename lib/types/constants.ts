// lib/types/constants.ts
// IndexedDB key 前缀常量（唯一运行时常量，as const）

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
