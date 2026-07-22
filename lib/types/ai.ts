// lib/types/ai.ts
// AI 领域类型：模型配置、调用场景、调用记录、Token 用量、反馈、聊天消息、对话

import type { KnowledgeSourceRef } from "./kb-index";

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
