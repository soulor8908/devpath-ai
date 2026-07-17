// lib/learn-input-history.ts
// 学习主题输入历史持久化（IndexedDB）
//
// 用于「快捷输入推荐」（recommend-quick-inputs.ts）：
//   - 用户每次提交学习主题时调 recordInputHistory(topic)
//   - 环形队列最多 50 条（FIFO）
//   - 同 topic 去重，但更新 timestamp（提高权重）

import { getItem, setItem } from "@/lib/storage/db";

const HISTORY_KEY = "learn:input_history";

export interface InputHistoryItem {
  topic: string;
  /** ISO 时间字符串，最后一次输入时间 */
  updatedAt: string;
}

const MAX_ITEMS = 50;

/**
 * 记录用户输入的 topic
 * - 同 topic 去重（移到队首，更新时间）
 * - 超过 50 条 FIFO 移除
 */
export async function recordInputHistory(topic: string): Promise<void> {
  const trimmed = topic.trim();
  if (!trimmed) return;
  const list = await getItem<InputHistoryItem[]>(HISTORY_KEY);
  const current = Array.isArray(list) ? list : [];
  // 去重：移除已存在的同 topic
  const filtered = current.filter((x) => x.topic !== trimmed);
  // 队首插入
  const next = [
    { topic: trimmed, updatedAt: new Date().toISOString() },
    ...filtered,
  ].slice(0, MAX_ITEMS);
  await setItem(HISTORY_KEY, next);
}

/**
 * 读取最近 limit 条输入历史（默认 50）
 */
export async function getInputHistory(limit = 50): Promise<InputHistoryItem[]> {
  const list = await getItem<InputHistoryItem[]>(HISTORY_KEY);
  const current = Array.isArray(list) ? list : [];
  return current.slice(0, limit);
}

/** 清空历史（主要供测试使用） */
export async function clearInputHistory(): Promise<void> {
  await setItem(HISTORY_KEY, []);
}
