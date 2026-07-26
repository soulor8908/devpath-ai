import { describe, it, expect, vi, beforeEach } from "vitest";

// mock storage/db：用内存 Map 模拟 IndexedDB，验证级联删除逻辑
const store = new Map<string, unknown>();

vi.mock("../lib/storage/db", () => ({
  listItems: vi.fn(async (prefix: string) => {
    const results: unknown[] = [];
    for (const [key, value] of store.entries()) {
      if (key.startsWith(prefix)) results.push(value);
    }
    return results;
  }),
  delItem: vi.fn(async (key: string) => {
    store.delete(key);
  }),
  getItem: vi.fn(async (key: string) => store.get(key) ?? null),
  setItem: vi.fn(async (key: string, value: unknown) => {
    store.set(key, value);
  }),
}));

vi.mock("../lib/plan-summary", () => ({
  deletePlanSummary: vi.fn(async (planId: string) => {
    store.delete("plan_summary:" + planId);
  }),
}));

import { deletePlanCascade, sweepOrphanPlanData } from "../lib/plan-cleanup";
import { KEY_PREFIXES } from "../lib/types";
import type {
  ReviewCard,
  ReviewLog,
  LearnLog,
  MistakeRecord,
  FavoriteDeck,
  Reminder,
  LearningPlan,
} from "../lib/types";

function seedPlan(planId: string): void {
  const plan: LearningPlan = {
    id: planId,
    topic: `topic-${planId}`,
    knowledgeTree: [],
    questions: [],
    schedule: [],
    dailyMinutes: 30,
    maxNewPerDay: 1,
    fsrsMode: "standard",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  store.set(KEY_PREFIXES.PLAN + planId, plan);
  store.set(KEY_PREFIXES.PLAN_SUMMARY + planId, { id: planId, topic: plan.topic });
}

function seedCard(cardId: string, planId: string): ReviewCard {
  const card: ReviewCard = {
    id: cardId,
    planId,
    nodeId: "n1",
    questionId: "q1",
    front: "front",
    back: "back",
    due: new Date().toISOString(),
    stability: 1,
    difficulty: 1,
    elapsedDays: 0,
    scheduledDays: 1,
    reps: 0,
    lapses: 0,
    state: 0,
    lastReview: new Date().toISOString(),
  };
  store.set(KEY_PREFIXES.CARD + cardId, card);
  return card;
}

function seedReviewLog(logId: string, cardId: string): void {
  const log: ReviewLog = {
    id: logId,
    cardId,
    date: new Date().toISOString(),
    rating: 3,
    elapsedDays: 0,
    stateBefore: 0,
    stateAfter: 1,
  };
  store.set(KEY_PREFIXES.REVIEW_LOG + logId, log);
}

function seedLearnLog(logId: string, planId: string): void {
  const log: LearnLog = {
    id: logId,
    planId,
    date: new Date().toISOString(),
    type: "learn_complete",
  };
  store.set(KEY_PREFIXES.LEARN_LOG + logId, log);
}

function seedMistake(mistakeId: string, planId: string): void {
  const mistake: MistakeRecord = {
    id: mistakeId,
    planId,
    questionId: "q1",
    nodeId: "n1",
    questionText: "text",
    wrongCount: 1,
    lastWrongAt: new Date().toISOString(),
    resolved: false,
    createdAt: new Date().toISOString(),
  };
  store.set(KEY_PREFIXES.MISTAKE + mistakeId, mistake);
}

function seedDeck(deckId: string, planId: string): void {
  const deck: FavoriteDeck = {
    id: deckId,
    planId,
    topic: "deck",
    questionIds: [],
    questionCount: 0,
    favoritedAt: new Date().toISOString(),
    questions: [],
    knowledgeTree: [],
  };
  store.set(KEY_PREFIXES.DECK + deckId, deck);
}

function seedReminder(reminderId: string, planId: string): void {
  const reminder: Reminder = {
    id: reminderId,
    title: "提醒",
    scheduledFor: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    triggered: false,
    planId,
  };
  store.set(KEY_PREFIXES.REMINDER + reminderId, reminder);
}

function seedPriorityCache(date: string): void {
  store.set(KEY_PREFIXES.PRIORITY_CACHE + date, { date, tasks: [] });
}

describe("deletePlanCascade", () => {
  beforeEach(() => {
    store.clear();
  });

  it("删除计划时级联清理所有关联数据", async () => {
    seedPlan("p1");
    const card = seedCard("c1", "p1");
    seedReviewLog("rl1", card.id);
    seedLearnLog("ll1", "p1");
    seedMistake("m1", "p1");
    seedDeck("d1", "p1");
    seedReminder("r1", "p1");
    seedPriorityCache("2026-07-26");

    const result = await deletePlanCascade("p1");

    expect(result.deleted.plan).toBe(1);
    expect(result.deleted.planSummary).toBe(1);
    expect(result.deleted.cards).toBe(1);
    expect(result.deleted.reviewLogs).toBe(1);
    expect(result.deleted.learnLogs).toBe(1);
    expect(result.deleted.mistakes).toBe(1);
    expect(result.deleted.decks).toBe(1);
    expect(result.deleted.reminders).toBe(1);
    expect(result.deleted.priorityCaches).toBe(1);
    expect(result.errors).toHaveLength(0);

    // 验证所有 key 已从 store 删除
    expect(store.has(KEY_PREFIXES.PLAN + "p1")).toBe(false);
    expect(store.has(KEY_PREFIXES.CARD + "c1")).toBe(false);
    expect(store.has(KEY_PREFIXES.REVIEW_LOG + "rl1")).toBe(false);
    expect(store.has(KEY_PREFIXES.LEARN_LOG + "ll1")).toBe(false);
    expect(store.has(KEY_PREFIXES.MISTAKE + "m1")).toBe(false);
    expect(store.has(KEY_PREFIXES.DECK + "d1")).toBe(false);
    expect(store.has(KEY_PREFIXES.REMINDER + "r1")).toBe(false);
    expect(store.has(KEY_PREFIXES.PRIORITY_CACHE + "2026-07-26")).toBe(false);
  });

  it("不删除其他计划的数据", async () => {
    seedPlan("p1");
    seedPlan("p2");
    seedCard("c1", "p1");
    seedCard("c2", "p2");
    seedReviewLog("rl1", "c1");
    seedReviewLog("rl2", "c2");

    await deletePlanCascade("p1");

    // p1 的数据被删
    expect(store.has(KEY_PREFIXES.CARD + "c1")).toBe(false);
    expect(store.has(KEY_PREFIXES.REVIEW_LOG + "rl1")).toBe(false);
    // p2 的数据保留
    expect(store.has(KEY_PREFIXES.PLAN + "p2")).toBe(true);
    expect(store.has(KEY_PREFIXES.CARD + "c2")).toBe(true);
    expect(store.has(KEY_PREFIXES.REVIEW_LOG + "rl2")).toBe(true);
  });

  it("单步删除失败不中断后续清理", async () => {
    seedPlan("p1");
    seedCard("c1", "p1");
    seedReviewLog("rl1", "c1");

    // 模拟 delItem 对 card key 抛错（仅对 CARD 前缀抛错，其他正常）
    const { delItem } = await import("../lib/storage/db");
    const originalDel = vi.mocked(delItem).getMockImplementation();
    vi.mocked(delItem).mockImplementation(async (key: string) => {
      if (key.startsWith(KEY_PREFIXES.CARD)) {
        throw new Error("IndexedDB transaction error");
      }
      store.delete(key);
    });

    const result = await deletePlanCascade("p1");

    // card 删除失败被记录
    expect(result.errors.length).toBeGreaterThan(0);
    expect(result.errors.some((e) => e.type.includes("card"))).toBe(true);
    // 但后续 reviewLog 删除仍执行
    expect(result.deleted.reviewLogs).toBe(1);
    expect(store.has(KEY_PREFIXES.REVIEW_LOG + "rl1")).toBe(false);

    // 恢复原始 mock 实现，避免影响后续测试
    vi.mocked(delItem).mockImplementation(originalDel ?? (async () => {}));
  });
});

describe("sweepOrphanPlanData", () => {
  beforeEach(() => {
    store.clear();
  });

  it("清扫引用了已删计划的孤儿数据", async () => {
    // 只保留 p1，p2 已被删但关联数据残留
    seedPlan("p1");
    seedCard("c1", "p1"); // 正常
    seedCard("c2", "p2"); // 孤儿：p2 不存在
    seedReviewLog("rl1", "c1"); // 正常（c1 存在）
    seedReviewLog("rl2", "c2"); // 孤儿：c2 关联的卡片将被清扫
    seedLearnLog("ll1", "p1"); // 正常
    seedLearnLog("ll2", "p2"); // 孤儿
    seedMistake("m1", "p2"); // 孤儿
    seedDeck("d1", "p2"); // 孤儿

    const result = await sweepOrphanPlanData();

    expect(result.cards).toBe(1); // c2
    expect(result.reviewLogs).toBe(1); // rl2（c2 被删后变孤儿）
    expect(result.learnLogs).toBe(1); // ll2
    expect(result.mistakes).toBe(1); // m1
    expect(result.decks).toBe(1); // d1

    // 正常数据保留
    expect(store.has(KEY_PREFIXES.CARD + "c1")).toBe(true);
    expect(store.has(KEY_PREFIXES.REVIEW_LOG + "rl1")).toBe(true);
    expect(store.has(KEY_PREFIXES.LEARN_LOG + "ll1")).toBe(true);
  });

  it("standalone focus_session 日志不被清扫", async () => {
    seedPlan("p1");
    // focus_session 类型的 LearnLog planId 为 "standalone"，不应被当孤儿
    const log: LearnLog = {
      id: "ll-focus",
      planId: "standalone",
      date: new Date().toISOString(),
      type: "focus_session",
      duration: 25,
    };
    store.set(KEY_PREFIXES.LEARN_LOG + "ll-focus", log);

    const result = await sweepOrphanPlanData();

    expect(result.learnLogs).toBe(0);
    expect(store.has(KEY_PREFIXES.LEARN_LOG + "ll-focus")).toBe(true);
  });

  it("无计划时返回 0", async () => {
    seedCard("c1", "p1");
    const result = await sweepOrphanPlanData();
    expect(result.cards).toBe(0);
  });
});
