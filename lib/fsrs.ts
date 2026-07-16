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
  mode: FSRSMode = "standard"
): ReviewCard {
  const f = getFsrs(mode);
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
  };
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
