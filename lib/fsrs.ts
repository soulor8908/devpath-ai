// lib/fsrs.ts
// ts-fsrs 封装：createCard / rateCard / getDueCards
// 三种参数预设：conservative / standard / aggressive

import {
  fsrs,
  generatorParameters,
  Rating,
  createEmptyCard,
  type Card,
  type State,
  type Grade,
} from "ts-fsrs";
import { nanoid } from "nanoid";
import type { ReviewCard, Rating as AppRating } from "./types";
import { listItems } from "./storage/db";
import { KEY_PREFIXES } from "./types";

export type FSRSMode = "conservative" | "standard" | "aggressive";

const MODE_CONFIG: Record<FSRSMode, { request_retention: number; enable_fuzz: boolean }> = {
  conservative: { request_retention: 0.95, enable_fuzz: false },
  standard: { request_retention: 0.9, enable_fuzz: true },
  aggressive: { request_retention: 0.8, enable_fuzz: true },
};

function getFsrs(mode: FSRSMode) {
  return fsrs(generatorParameters(MODE_CONFIG[mode]));
}

function toISO(date: Date): string {
  return date.toISOString();
}

function fromISO(str: string): Date {
  return new Date(str);
}

function toFsrsCard(card: ReviewCard): Card {
  return {
    due: fromISO(card.due),
    stability: card.stability,
    difficulty: card.difficulty,
    elapsed_days: card.elapsedDays,
    scheduled_days: card.scheduledDays,
    reps: card.reps,
    lapses: card.lapses,
    state: card.state as State,
    last_review: card.lastReview ? fromISO(card.lastReview) : undefined,
  };
}

function fromFsrsCard(card: Card, original: ReviewCard): ReviewCard {
  return {
    ...original,
    due: toISO(card.due),
    stability: card.stability,
    difficulty: card.difficulty,
    elapsedDays: card.elapsed_days,
    scheduledDays: card.scheduled_days,
    reps: card.reps,
    lapses: card.lapses,
    state: card.state as 0 | 1 | 2 | 3 | 4,
    lastReview: card.last_review ? toISO(card.last_review) : "",
  };
}

export function createCard(
  planId: string,
  nodeId: string,
  questionId: string,
  front: string,
  back: string,
  _mode: FSRSMode = "standard",
  /** 可选 deckId：收藏试题集生成的卡片会带上，便于查重 */
  deckId?: string
): ReviewCard {
  const empty = createEmptyCard(new Date());
  return {
    id: nanoid(),
    planId,
    nodeId,
    questionId,
    front,
    back,
    due: toISO(empty.due),
    stability: empty.stability,
    difficulty: empty.difficulty,
    elapsedDays: empty.elapsed_days,
    scheduledDays: empty.scheduled_days,
    reps: empty.reps,
    lapses: empty.lapses,
    state: empty.state as 0,
    lastReview: "",
    deckId,
  };
}

/**
 * 查重：根据 deckId + questionId 或 planId + questionId 找已存在的卡片
 *
 * 用途：「开始复习」/ 学习完成 / 单题收藏 / 错题记录时避免重复创建卡片
 * - 传 deckId → 按 deckId + questionId 查重（收藏试题集场景）
 * - 不传 deckId 但传 planId → 按 planId + questionId 查重（学习/收藏单题/错题场景）
 * - 都不传 → 返回 undefined（无法查重，按"无重复"处理）
 * - 找到匹配 → 返回已存在的 ReviewCard，调用方应跳过创建
 * - 未找到 → 返回 undefined，调用方按需创建
 *
 * 性能：一次性 listItems 读全部 card，仅在用户行为触发时调用，OK
 */
export async function findExistingCard(opts: {
  deckId?: string;
  planId?: string;
  questionId: string;
}): Promise<ReviewCard | undefined> {
  const allCards = await listItems<ReviewCard>(KEY_PREFIXES.CARD);
  return allCards.find((c) => {
    if (opts.deckId && c.deckId === opts.deckId && c.questionId === opts.questionId) return true;
    if (!opts.deckId && c.planId === opts.planId && c.questionId === opts.questionId) return true;
    return false;
  });
}

// app Rating (1|2|3|4) → ts-fsrs Grade (排除 Rating.Manual) 映射
const RATING_MAP: Record<AppRating, Grade> = {
  1: Rating.Again,
  2: Rating.Hard,
  3: Rating.Good,
  4: Rating.Easy,
};

export function rateCard(
  card: ReviewCard,
  rating: AppRating,
  mode: FSRSMode = "standard"
): ReviewCard {
  const f = getFsrs(mode);
  const fsrsCard = toFsrsCard(card);
  const now = new Date();
  const result = f.repeat(fsrsCard, now);
  const { card: updatedCard } = result[RATING_MAP[rating]];
  return fromFsrsCard(updatedCard, card);
}

export function getDueCards(
  cards: ReviewCard[],
  now: Date = new Date()
): ReviewCard[] {
  const nowTime = now.getTime();
  return cards.filter((c) => fromISO(c.due).getTime() <= nowTime);
}

export function getDueCount(cards: ReviewCard[], now: Date = new Date()): number {
  return getDueCards(cards, now).length;
}

// 降级固定间隔（ts-fsrs 异常时使用）
export function fallbackSchedule(reps: number): number {
  const intervals = [1, 3, 7, 15, 30];
  return intervals[Math.min(reps, intervals.length - 1)];
}
