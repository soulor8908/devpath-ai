// lib/mistake-book.ts
// 错题本：复习答错自动收集 + 管理

import { nanoid } from "nanoid";
import { getItem, setItem, listItems, delItem } from "./storage/db";
import { KEY_PREFIXES, type MistakeRecord, type Question } from "./types";
import { createCard, findExistingCard } from "./fsrs";

/** 记录答错（如果已存在则增加 wrongCount），同时自动造复习卡（带查重） */
export async function recordMistake(params: {
  planId: string;
  questionId: string;
  nodeId: string;
  questionText: string;
  /** 答案文本（可选，用于自动造卡时填充卡片背面） */
  answerText?: string;
}): Promise<void> {
  const existing = await findMistake(params.questionId);
  const now = new Date().toISOString();
  if (existing) {
    await setItem(KEY_PREFIXES.MISTAKE + existing.id, {
      ...existing,
      wrongCount: existing.wrongCount + 1,
      lastWrongAt: now,
      resolved: false, // 重新答错，取消已掌握
    });
  } else {
    const record: MistakeRecord = {
      id: nanoid(),
      planId: params.planId,
      questionId: params.questionId,
      nodeId: params.nodeId,
      questionText: params.questionText,
      wrongCount: 1,
      lastWrongAt: now,
      resolved: false,
      createdAt: now,
    };
    await setItem(KEY_PREFIXES.MISTAKE + record.id, record);
  }

  // 同步造复习卡（带查重，避免重复造卡）
  try {
    const existingCard = await findExistingCard({
      planId: params.planId,
      questionId: params.questionId,
    });
    if (!existingCard) {
      const card = createCard(
        params.planId,
        params.nodeId,
        params.questionId,
        params.questionText,
        params.answerText ?? "",
        "standard"
      );
      await setItem(KEY_PREFIXES.CARD + card.id, card);
    }
  } catch {
    // 造卡失败不影响错题记录主流程
  }
}

/** 查找题目的错题记录 */
async function findMistake(questionId: string): Promise<MistakeRecord | undefined> {
  const all = await listItems<MistakeRecord>(KEY_PREFIXES.MISTAKE);
  return all.find((m) => m.questionId === questionId && !m.resolved);
}

/** 获取所有未解决的错题 */
export async function getUnresolvedMistakes(): Promise<MistakeRecord[]> {
  const all = await listItems<MistakeRecord>(KEY_PREFIXES.MISTAKE);
  return all
    .filter((m) => !m.resolved)
    .sort((a, b) => new Date(b.lastWrongAt).getTime() - new Date(a.lastWrongAt).getTime());
}

/** 标记为已掌握 */
export async function resolveMistake(id: string): Promise<void> {
  const record = await getItem<MistakeRecord>(KEY_PREFIXES.MISTAKE + id);
  if (record) {
    await setItem(KEY_PREFIXES.MISTAKE + id, { ...record, resolved: true });
  }
}

/** 删除错题记录 */
export async function deleteMistake(id: string): Promise<void> {
  await delItem(KEY_PREFIXES.MISTAKE + id);
}

/** 获取错题统计 */
export async function getMistakeStats(): Promise<{
  total: number;
  unresolved: number;
  byNode: Record<string, number>;
}> {
  const all = await listItems<MistakeRecord>(KEY_PREFIXES.MISTAKE);
  const unresolved = all.filter((m) => !m.resolved);
  const byNode: Record<string, number> = {};
  for (const m of unresolved) {
    byNode[m.nodeId] = (byNode[m.nodeId] ?? 0) + 1;
  }
  return { total: all.length, unresolved: unresolved.length, byNode };
}
