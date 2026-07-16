import { describe, it, expect, beforeEach } from "vitest";
import "fake-indexeddb/auto";
import {
  buildFavoriteDeck,
  toggleQuestionInPlan,
  createFavoriteDeck,
  listFavoriteDecks,
  deleteFavoriteDeck,
  getFavoriteDeck,
  listFavoritedQuestions,
} from "../lib/favorite";
import { getItem, setItem, delItem, listKeys } from "../lib/storage/db";
import { KEY_PREFIXES } from "../lib/types";
import type { LearningPlan } from "../lib/types";

function makePlan(): LearningPlan {
  return {
    id: "plan-1",
    topic: "前端性能",
    knowledgeTree: [
      { id: "k1", title: "渲染原理", difficulty: 2, prerequisites: [], frequency: "高", summary: "", mastery: 0 },
    ],
    questions: [
      { id: "q1", nodeId: "k1", question: "题1", answer: "答1", keyPoints: ["p1"], followUps: ["f1"], favorited: false },
      { id: "q2", nodeId: "k1", question: "题2", answer: "答2", keyPoints: ["p2"], followUps: ["f2"], favorited: false },
      { id: "q3", nodeId: "k1", question: "题3", answer: "答3", keyPoints: ["p3"], followUps: ["f3"], favorited: false },
    ],
    schedule: [],
    dailyMinutes: 30,
    maxNewPerDay: 1,
    fsrsMode: "standard",
    createdAt: "2026-07-13T00:00:00.000Z",
    updatedAt: "2026-07-13T00:00:00.000Z",
  };
}

async function clearAll() {
  const allKeys = await listKeys();
  for (const k of allKeys) {
    if (typeof k === "string") await delItem(k);
  }
}

describe("favorite (pure logic)", () => {
  it("buildFavoriteDeck 创建快照，questionCount 正确", () => {
    const plan = makePlan();
    const deck = buildFavoriteDeck(plan);
    expect(deck.planId).toBe("plan-1");
    expect(deck.topic).toBe("前端性能");
    expect(deck.questionCount).toBe(3);
    expect(deck.questionIds).toEqual(["q1", "q2", "q3"]);
    expect(deck.questions).toHaveLength(3);
    expect(deck.knowledgeTree).toHaveLength(1);
    expect(deck.id).toBeDefined();
  });

  it("toggleQuestionInPlan 切换 favorited 状态", () => {
    const plan = makePlan();
    const updated = toggleQuestionInPlan(plan, "q2");
    expect(updated.questions[0].favorited).toBe(false);
    expect(updated.questions[1].favorited).toBe(true);
    expect(updated.questions[1].favoritedAt).toBeDefined();
    // 再次切换
    const toggledBack = toggleQuestionInPlan(updated, "q2");
    expect(toggledBack.questions[1].favorited).toBe(false);
    expect(toggledBack.questions[1].favoritedAt).toBeUndefined();
  });

  it("buildFavoriteDeck 是独立快照（修改原 plan 不影响 deck）", () => {
    const plan = makePlan();
    const deck = buildFavoriteDeck(plan);
    plan.questions[0].question = "已修改";
    expect(deck.questions[0].question).toBe("题1");
  });
});

describe("favorite (IndexedDB)", () => {
  beforeEach(async () => {
    await clearAll();
  });

  it("创建 deck，listFavoriteDecks 能读回", async () => {
    const plan = makePlan();
    const deck = await createFavoriteDeck(plan);
    expect(deck.id).toBeDefined();

    const list = await listFavoriteDecks();
    expect(list).toHaveLength(1);
    expect(list[0].id).toBe(deck.id);
    expect(list[0].questionCount).toBe(3);
  });

  it("删除 deck，list 不再包含", async () => {
    const plan = makePlan();
    const deck = await createFavoriteDeck(plan);
    await deleteFavoriteDeck(deck.id);

    const list = await listFavoriteDecks();
    expect(list).toHaveLength(0);

    const got = await getFavoriteDeck(deck.id);
    expect(got).toBeUndefined();
  });

  it("多个 deck 按时间倒序排列", async () => {
    const plan = makePlan();
    const deck1 = await createFavoriteDeck(plan);
    // 等一小段时间确保时间不同
    await new Promise((r) => setTimeout(r, 10));
    const deck2 = await createFavoriteDeck(plan);

    const list = await listFavoriteDecks();
    expect(list).toHaveLength(2);
    expect(list[0].id).toBe(deck2.id);
    expect(list[1].id).toBe(deck1.id);
  });

  it("listFavoritedQuestions 聚合所有 plan 中 favorited 的题", async () => {
    const plan = makePlan();
    // 标记 q1 和 q3 为已收藏
    plan.questions[0].favorited = true;
    plan.questions[2].favorited = true;
    await setItem(KEY_PREFIXES.PLAN + plan.id, plan);

    const favorited = await listFavoritedQuestions();
    expect(favorited).toHaveLength(2);
    expect(favorited.map((f) => f.question.id)).toContain("q1");
    expect(favorited.map((f) => f.question.id)).toContain("q3");
  });

  it("无收藏题时返回空数组", async () => {
    const favorited = await listFavoritedQuestions();
    expect(favorited).toEqual([]);
  });
});
