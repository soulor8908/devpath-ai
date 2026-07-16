// lib/ai/memory/conversation-memory.ts
// 存储最近 7 天用户提问主题摘要（不是完整对话）
//
// 设计（卡帕西视角）：
//   - 只存"摘要前 30 字"而非完整消息，控制 IndexedDB 体积
//   - 写入时顺便清理 7 天前的记录（惰性 GC，无需定时器）
//   - key 前缀 "conv_topic:"（自定义前缀，不污染 KEY_PREFIXES）
//
// 前缀提取规则（lib/storage/dexie-db.ts extractPrefix）：
//   "conv_topic:abc" → "conv_topic:" → listItems("conv_topic:") 可枚举

import { nanoid } from "nanoid";
import { setItem, listItems, delItem } from "@/lib/storage/db";

/** IndexedDB key 前缀（自定义，不在 KEY_PREFIXES 中） */
const CONV_TOPIC_PREFIX = "conv_topic:";

/** 保留天数 */
const RETENTION_DAYS = 7;

const DAY_MS = 24 * 60 * 60 * 1000;

/** 对话主题条目（存储结构） */
interface ConvTopicEntry {
  id: string;
  /** 主题摘要（用户消息前 30 字） */
  summary: string;
  /** ISO 时间戳 */
  timestamp: string;
}

/**
 * 记录一条用户提问主题
 * 提取前 30 字作为摘要，带 timestamp 存入 IndexedDB
 * 写入时顺便清理 7 天前的记录
 */
export async function recordConversationTopic(message: string): Promise<void> {
  const summary = message.slice(0, 30);
  const id = nanoid();
  const entry: ConvTopicEntry = {
    id,
    summary,
    timestamp: new Date().toISOString(),
  };
  await setItem(CONV_TOPIC_PREFIX + id, entry);

  // 惰性清理：写入时顺便删除 7 天前的记录（失败静默，不阻塞主流程）
  void cleanupOldTopics().catch(() => {});
}

/**
 * 获取最近 N 天的主题摘要列表
 * @param days 默认 7
 * @returns 摘要字符串列表（按时间倒序，最近的在前）
 */
export async function getRecentTopics(days: number = RETENTION_DAYS): Promise<string[]> {
  const all = await listItems<ConvTopicEntry>(CONV_TOPIC_PREFIX);
  const cutoff = Date.now() - days * DAY_MS;
  return all
    .filter((e) => new Date(e.timestamp).getTime() >= cutoff)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .map((e) => e.summary);
}

/**
 * 清理 7 天前的主题记录
 */
async function cleanupOldTopics(): Promise<void> {
  const all = await listItems<ConvTopicEntry>(CONV_TOPIC_PREFIX);
  const cutoff = Date.now() - RETENTION_DAYS * DAY_MS;
  for (const entry of all) {
    if (new Date(entry.timestamp).getTime() < cutoff) {
      await delItem(CONV_TOPIC_PREFIX + entry.id);
    }
  }
}
