import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import {
  applyReviewFilters,
  DEFAULT_FILTERS,
  type ReviewFilters,
} from "../lib/review-filter";
import type { ReviewCard, LearningPlan } from "../lib/types";

const mockCard = (overrides: Partial<ReviewCard>): ReviewCard => ({
  id: "c1",
  planId: "p1",
  nodeId: "n1",
  questionId: "q1",
  front: "What is closure",
  back: "A function with access to its lexical scope",
  due: new Date().toISOString(),
  stability: 1,
  difficulty: 5,
  elapsedDays: 0,
  scheduledDays: 1,
  reps: 0,
  lapses: 0,
  state: 0,
  lastReview: "",
  ...overrides,
});

const mockPlan = (overrides: Partial<LearningPlan>): LearningPlan => ({
  id: "p1",
  topic: "JS 基础",
  knowledgeTree: [
    {
      id: "n1",
      title: "闭包",
      difficulty: 3,
      prerequisites: [],
      frequency: "高",
      summary: "",
      mastery: 0,
      bigTech: true,
    },
    {
      id: "n2",
      title: "原型链",
      difficulty: 5,
      prerequisites: [],
      frequency: "中",
      summary: "",
      mastery: 0,
      bigTech: false,
    },
  ],
  questions: [],
  schedule: [],
  dailyMinutes: 30,
  maxNewPerDay: 3,
  fsrsMode: "standard",
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
  ...overrides,
});

const HOUR = 60 * 60 * 1000;
const DAY = 24 * 60 * 60 * 1000;

describe("applyReviewFilters", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-07-15T12:00:00.000Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("DEFAULT_FILTERS (dueStatus=all) 仅返回 due <= now 的卡片", () => {
    const now = new Date();
    const cards = [
      mockCard({ id: "due-now", due: new Date(now.getTime() - 60 * 1000).toISOString() }),
      mockCard({ id: "future", due: new Date(now.getTime() + 60 * 1000).toISOString() }),
    ];
    const result = applyReviewFilters(cards, DEFAULT_FILTERS, {
      plans: [mockPlan({})],
      now,
    });
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("due-now");
  });

  it("planId 过滤：只返回匹配 planId 的卡片", () => {
    const now = new Date();
    const dueIso = new Date(now.getTime() - 60 * 1000).toISOString();
    const cards = [
      mockCard({ id: "c-p1", planId: "p1", due: dueIso }),
      mockCard({ id: "c-p2", planId: "p2", due: dueIso }),
    ];
    const filters: ReviewFilters = { ...DEFAULT_FILTERS, planId: "p1" };
    const result = applyReviewFilters(cards, filters, {
      plans: [mockPlan({})],
      now,
    });
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("c-p1");
  });

  it("difficulty 过滤：通过 plans.knowledgeTree 反查节点难度", () => {
    const now = new Date();
    const dueIso = new Date(now.getTime() - 60 * 1000).toISOString();
    const cards = [
      mockCard({ id: "c-n1", nodeId: "n1", due: dueIso }), // n1 difficulty=3
      mockCard({ id: "c-n2", nodeId: "n2", due: dueIso }), // n2 difficulty=5
    ];
    const filters: ReviewFilters = { ...DEFAULT_FILTERS, difficulty: 5 };
    const result = applyReviewFilters(cards, filters, {
      plans: [mockPlan({})],
      now,
    });
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("c-n2");
  });

  it("dueStatus=overdue：仅返回 due < startOfToday 且 due <= now", () => {
    const now = new Date();
    const startOfToday = new Date(now);
    startOfToday.setHours(0, 0, 0, 0);
    const cards = [
      mockCard({
        id: "overdue",
        due: new Date(startOfToday.getTime() - HOUR).toISOString(),
      }),
      mockCard({
        id: "today",
        due: new Date(startOfToday.getTime() + HOUR).toISOString(),
      }),
    ];
    const filters: ReviewFilters = { ...DEFAULT_FILTERS, dueStatus: "overdue" };
    const result = applyReviewFilters(cards, filters, {
      plans: [mockPlan({})],
      now,
    });
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("overdue");
  });

  it("多维度组合 (planId + bigTech + overdue) AND 逻辑", () => {
    const now = new Date();
    const startOfToday = new Date(now);
    startOfToday.setHours(0, 0, 0, 0);
    const overdueIso = new Date(startOfToday.getTime() - HOUR).toISOString();
    const todayIso = new Date(startOfToday.getTime() + HOUR).toISOString();
    const cards = [
      // 匹配：p1 + n1(bigTech=true) + overdue
      mockCard({ id: "match", planId: "p1", nodeId: "n1", due: overdueIso }),
      // 不匹配：planId=p2
      mockCard({ id: "wrong-plan", planId: "p2", nodeId: "n1", due: overdueIso }),
      // 不匹配：n2 bigTech=false
      mockCard({ id: "wrong-bigtech", planId: "p1", nodeId: "n2", due: overdueIso }),
      // 不匹配：非 overdue（今日到期）
      mockCard({ id: "not-overdue", planId: "p1", nodeId: "n1", due: todayIso }),
    ];
    const filters: ReviewFilters = {
      ...DEFAULT_FILTERS,
      planId: "p1",
      bigTech: "yes",
      dueStatus: "overdue",
    };
    const result = applyReviewFilters(cards, filters, {
      plans: [mockPlan({})],
      now,
    });
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("match");
  });

  it("search：front 或 back 大小写不敏感匹配", () => {
    const now = new Date();
    const dueIso = new Date(now.getTime() - 60 * 1000).toISOString();
    const cards = [
      mockCard({ id: "front-match", front: "What is CLOSURE", back: "xxx", due: dueIso }),
      mockCard({ id: "back-match", front: "yyy", back: "the CLOSURE concept", due: dueIso }),
      mockCard({ id: "no-match", front: "What is prototype", back: "chain", due: dueIso }),
    ];
    const filters: ReviewFilters = { ...DEFAULT_FILTERS, search: "closure" };
    const result = applyReviewFilters(cards, filters, {
      plans: [mockPlan({})],
      now,
    });
    expect(result.map((c) => c.id).sort()).toEqual(["back-match", "front-match"]);
  });

  it("dueStatus=week：仅返回 now < due <= now+7天", () => {
    const now = new Date();
    const cards = [
      mockCard({ id: "past", due: new Date(now.getTime() - 60 * 1000).toISOString() }),
      mockCard({ id: "in-week", due: new Date(now.getTime() + DAY).toISOString() }),
      mockCard({ id: "too-far", due: new Date(now.getTime() + 8 * DAY).toISOString() }),
    ];
    const filters: ReviewFilters = { ...DEFAULT_FILTERS, dueStatus: "week" };
    const result = applyReviewFilters(cards, filters, {
      plans: [mockPlan({})],
      now,
    });
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("in-week");
  });
});
