// lib/types/emotion.ts
// 情绪 + 能量领域类型：情绪标签、多巴胺干扰、情绪觉察条目、能量模式、每日状态

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

// 能量等级（1=极低 5=极高）
export type EnergyLevel = 1 | 2 | 3 | 4 | 5;

// 情绪文件（一天的情绪笔记，含多条 EmotionEntry）
export interface EmotionFile {
  date: string;
  entries: EmotionEntry[];
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
