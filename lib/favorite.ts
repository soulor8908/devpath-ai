// lib/favorite.ts
// 收藏管理：试题集（FavoriteDeck）+ 单题收藏
// 逻辑函数（纯函数）+ 存储函数（IndexedDB）

import { getItem, setItem, delItem, listKeys } from "./storage/db";
import { nanoid } from "nanoid";
import { nowISO } from "./time";
import { KEY_PREFIXES } from "./types";
import type { FavoriteDeck, LearningPlan, Question } from "./types";
import { savePlanSummary } from "./plan-summary";

// ===== 纯逻辑函数 =====

export function buildFavoriteDeck(plan: LearningPlan): FavoriteDeck {
  return {
    id: nanoid(),
    planId: plan.id,
    topic: plan.topic,
    questionIds: plan.questions.map((q) => q.id),
    questionCount: plan.questions.length,
    favoritedAt: nowISO(),
    questions: plan.questions.map((q) => ({ ...q })),
    knowledgeTree: plan.knowledgeTree.map((n) => ({ ...n })),
  };
}

export function toggleQuestionInPlan(
  plan: LearningPlan,
  questionId: string
): LearningPlan {
  return {
    ...plan,
    updatedAt: nowISO(),
    questions: plan.questions.map((q) => {
      if (q.id === questionId) {
        const favorited = !q.favorited;
        return {
          ...q,
          favorited,
          favoritedAt: favorited ? nowISO() : undefined,
        };
      }
      return q;
    }),
  };
}

// ===== 存储函数（IndexedDB）=====

export async function createFavoriteDeck(plan: LearningPlan): Promise<FavoriteDeck> {
  const deck = buildFavoriteDeck(plan);
  await setItem(KEY_PREFIXES.DECK + deck.id, deck);
  return deck;
}

export async function listFavoriteDecks(): Promise<FavoriteDeck[]> {
  const allKeys = await listKeys();
  const deckKeys = allKeys.filter(
    (k): k is string => typeof k === "string" && k.startsWith(KEY_PREFIXES.DECK)
  );
  const decks = await Promise.all(
    deckKeys.map((k) => getItem<FavoriteDeck>(k))
  );
  return decks
    .filter((d): d is FavoriteDeck => d !== undefined)
    .sort(
      (a, b) =>
        new Date(b.favoritedAt).getTime() - new Date(a.favoritedAt).getTime()
    );
}

export async function getFavoriteDeck(id: string): Promise<FavoriteDeck | undefined> {
  return getItem<FavoriteDeck>(KEY_PREFIXES.DECK + id);
}

export async function deleteFavoriteDeck(id: string): Promise<void> {
  await delItem(KEY_PREFIXES.DECK + id);
}

// 从所有 plan 聚合 favorited 单题（带 planId 以便取消收藏）
export interface FavoritedQuestionWithPlan {
  question: Question;
  planId: string;
  planTopic: string;
}

export async function listFavoritedQuestions(): Promise<FavoritedQuestionWithPlan[]> {
  const allKeys = await listKeys();
  const planKeys = allKeys.filter(
    (k): k is string => typeof k === "string" && k.startsWith(KEY_PREFIXES.PLAN)
  );
  const plans = await Promise.all(
    planKeys.map((k) => getItem<LearningPlan>(k))
  );
  const favorited: FavoritedQuestionWithPlan[] = [];
  for (const plan of plans) {
    if (!plan) continue;
    for (const q of plan.questions) {
      if (q.favorited) favorited.push({ question: q, planId: plan.id, planTopic: plan.topic });
    }
  }
  return favorited;
}

// 取消单题收藏：找到对应 plan，翻转 favorited，写回
export async function unfavorQuestion(planId: string, questionId: string): Promise<void> {
  const plan = await getItem<LearningPlan>(KEY_PREFIXES.PLAN + planId);
  if (!plan) return;
  const updated = toggleQuestionInPlan(plan, questionId);
  await setItem(KEY_PREFIXES.PLAN + planId, updated);
  // 同步摘要（updatedAt 已变化）
  await savePlanSummary(updated);
}
