import { describe, it, expect, beforeEach } from "vitest";
import "fake-indexeddb/auto";
import { delItem, listKeys } from "../lib/storage/db";
import { KEY_PREFIXES } from "../lib/types";
import {
  computeDeadlineUrgency,
  computeFsrsUrgency,
  computeSkillGap,
  computeEnergyFit,
  computePriorityScore,
  rankTasks,
  getCachedPriority,
  setCachedPriority,
} from "../lib/ai/priority-engine";
import type {
  LearningPlan,
  MistakeRecord,
  ReviewCard,
  ScheduleItem,
} from "../lib/types";

// 用本地时间构造 Date，避免 runner 时区影响 getHours()/getMinutes()
const NOW = new Date(2026, 6, 16, 6, 30); // 2026-07-16 06:30 local
const DAY_MS = 24 * 60 * 60 * 1000;

function makePlan(over: Partial<LearningPlan> = {}): LearningPlan {
  return {
    id: "p1",
    topic: "测试计划",
    knowledgeTree: [],
    questions: [],
    schedule: [],
    dailyMinutes: 30,
    maxNewPerDay: 1,
    fsrsMode: "standard",
    createdAt: "2026-07-01T00:00:00.000Z",
    updatedAt: "2026-07-01T00:00:00.000Z",
    ...over,
  };
}

function makeCard(over: Partial<ReviewCard> = {}): ReviewCard {
  return {
    id: "c1",
    planId: "p1",
    nodeId: "k1",
    questionId: "q1",
    front: "f",
    back: "b",
    due: new Date(NOW.getTime() - DAY_MS).toISOString(),
    stability: 1,
    difficulty: 5,
    elapsedDays: 0,
    scheduledDays: 1,
    reps: 0,
    lapses: 0,
    state: 0,
    lastReview: "",
    ...over,
  };
}

function makeMistake(over: Partial<MistakeRecord> = {}): MistakeRecord {
  return {
    id: "m1",
    planId: "p1",
    questionId: "q1",
    nodeId: "k1",
    questionText: "q",
    wrongCount: 1,
    lastWrongAt: "2026-07-12T00:00:00.000Z",
    resolved: false,
    createdAt: "2026-07-12T00:00:00.000Z",
    ...over,
  };
}

function makeTask(over: Partial<ScheduleItem> = {}): ScheduleItem {
  return {
    day: 1,
    nodeId: "k1",
    type: "learn",
    estimatedMinutes: 16,
    completed: false,
    ...over,
  };
}

// ============ computeDeadlineUrgency ============

describe("computeDeadlineUrgency", () => {
  it("无 deadline → 0", () => {
    expect(computeDeadlineUrgency(makePlan(), NOW)).toBe(0);
  });

  it("deadline 在 0.5 天后（<1 天）→ 1", () => {
    const plan = makePlan({
      deadline: new Date(NOW.getTime() + 0.5 * DAY_MS).toISOString(),
    });
    expect(computeDeadlineUrgency(plan, NOW)).toBe(1);
  });

  it("deadline 已过期 → 1", () => {
    const plan = makePlan({
      deadline: new Date(NOW.getTime() - DAY_MS).toISOString(),
    });
    expect(computeDeadlineUrgency(plan, NOW)).toBe(1);
  });

  it("deadline 在 5 天后（<7 天）→ 0.7", () => {
    const plan = makePlan({
      deadline: new Date(NOW.getTime() + 5 * DAY_MS).toISOString(),
    });
    expect(computeDeadlineUrgency(plan, NOW)).toBe(0.7);
  });

  it("deadline 在 20 天后（<30 天）→ 0.4", () => {
    const plan = makePlan({
      deadline: new Date(NOW.getTime() + 20 * DAY_MS).toISOString(),
    });
    expect(computeDeadlineUrgency(plan, NOW)).toBe(0.4);
  });

  it("deadline 在 60 天后（>30 天）→ 0.1", () => {
    const plan = makePlan({
      deadline: new Date(NOW.getTime() + 60 * DAY_MS).toISOString(),
    });
    expect(computeDeadlineUrgency(plan, NOW)).toBe(0.1);
  });
});

// ============ computeFsrsUrgency ============

describe("computeFsrsUrgency", () => {
  it("无卡片 → 0", () => {
    expect(computeFsrsUrgency(makePlan(), [], NOW)).toBe(0);
  });

  it("2/2 到期 → 1", () => {
    const cards = [
      makeCard({ id: "c1" }),
      makeCard({ id: "c2" }),
    ];
    expect(computeFsrsUrgency(makePlan(), cards, NOW)).toBe(1);
  });

  it("1/4 到期 → 0.25", () => {
    const cards = [
      makeCard({ id: "c1" }), // due (yesterday)
      makeCard({ id: "c2", due: new Date(NOW.getTime() + DAY_MS).toISOString() }),
      makeCard({ id: "c3", due: new Date(NOW.getTime() + DAY_MS).toISOString() }),
      makeCard({ id: "c4", due: new Date(NOW.getTime() + DAY_MS).toISOString() }),
    ];
    expect(computeFsrsUrgency(makePlan(), cards, NOW)).toBe(0.25);
  });

  it("只统计本计划卡片（其他 planId 被过滤）", () => {
    const cards = [
      makeCard({ id: "c1", planId: "p1" }),
      makeCard({ id: "c2", planId: "other" }), // 应被忽略
    ];
    expect(computeFsrsUrgency(makePlan({ id: "p1" }), cards, NOW)).toBe(1);
  });
});

// ============ computeSkillGap ============

describe("computeSkillGap", () => {
  it("无错题无 lapses → 0", () => {
    expect(computeSkillGap("k1", [], [])).toBe(0);
  });

  it("wrongCount=1 + lapses=2 → 0.5", () => {
    const mistakes = [makeMistake({ wrongCount: 1 })];
    const cards = [makeCard({ lapses: 2 })];
    expect(computeSkillGap("k1", mistakes, cards)).toBeCloseTo(0.5, 5);
  });

  it("wrongCount=2 + lapses=4 → 上限 1", () => {
    const mistakes = [makeMistake({ wrongCount: 2 })]; // 0.6
    const cards = [makeCard({ lapses: 4 })]; // 0.4
    expect(computeSkillGap("k1", mistakes, cards)).toBe(1);
  });

  it("已解决的错题不计入", () => {
    const mistakes = [makeMistake({ wrongCount: 5, resolved: true })];
    expect(computeSkillGap("k1", mistakes, [])).toBe(0);
  });

  it("只匹配同 nodeId", () => {
    const mistakes = [makeMistake({ nodeId: "other", wrongCount: 5 })];
    expect(computeSkillGap("k1", mistakes, [])).toBe(0);
  });
});

// ============ computeEnergyFit（含冷启动）============

describe("computeEnergyFit", () => {
  it("energy=null + 当前在偏好时段 → 1", () => {
    const now = new Date(2026, 6, 16, 6, 30); // 06:30
    expect(computeEnergyFit(null, ["06:00-06:59"], now)).toBe(1);
  });

  it("energy=null + 不在偏好时段 → 0.5", () => {
    const now = new Date(2026, 6, 16, 10, 0); // 10:00
    expect(computeEnergyFit(null, ["06:00-06:59"], now)).toBe(0.5);
  });

  it("energy=null + 无偏好时段 → 0.5", () => {
    const now = new Date(2026, 6, 16, 6, 30);
    expect(computeEnergyFit(null, [], now)).toBe(0.5);
  });

  it("energy=4 → 1", () => {
    expect(computeEnergyFit(4, [], NOW)).toBe(1);
  });

  it("energy=5 → 1", () => {
    expect(computeEnergyFit(5, [], NOW)).toBe(1);
  });

  it("energy=3 → 0.7", () => {
    expect(computeEnergyFit(3, [], NOW)).toBe(0.7);
  });

  it("energy=2 → 0.3", () => {
    expect(computeEnergyFit(2, [], NOW)).toBe(0.3);
  });

  it("energy=1 → 0.3", () => {
    expect(computeEnergyFit(1, [], NOW)).toBe(0.3);
  });
});

// ============ computePriorityScore（四权重组合）============

describe("computePriorityScore 四权重组合", () => {
  it("deadline=1 + fsrs=1 + skill=0.5 + energy=1 → 0.9", () => {
    // deadline 0.5 天后 → 1
    const plan = makePlan({
      deadline: new Date(NOW.getTime() + 0.5 * DAY_MS).toISOString(),
    });
    // 2/2 到期 → fsrs=1，且 lapses 各 1 → skill 用
    const cards = [
      makeCard({ id: "c1", lapses: 1 }),
      makeCard({ id: "c2", lapses: 1 }),
    ];
    const mistakes = [makeMistake({ wrongCount: 1 })]; // 0.3
    // skill = 0.3 + 2*0.1 = 0.5
    const ctx = {
      plan,
      cards,
      mistakes,
      energy: 4 as number | null, // → 1
      preferredSlots: [],
      now: NOW,
    };
    const score = computePriorityScore(makeTask({ nodeId: "k1" }), ctx);
    expect(score).toBeCloseTo(0.9, 5);
  });

  it("deadline=0 + fsrs=0.25 + skill=0 + energy=0.7 → 0.215", () => {
    const plan = makePlan(); // 无 deadline → 0
    const cards = [
      makeCard({ id: "c1" }), // due
      makeCard({ id: "c2", due: new Date(NOW.getTime() + DAY_MS).toISOString() }),
      makeCard({ id: "c3", due: new Date(NOW.getTime() + DAY_MS).toISOString() }),
      makeCard({ id: "c4", due: new Date(NOW.getTime() + DAY_MS).toISOString() }),
    ];
    const ctx = {
      plan,
      cards,
      mistakes: [], // skill=0
      energy: 3 as number | null, // → 0.7
      preferredSlots: [],
      now: NOW,
    };
    const score = computePriorityScore(makeTask({ nodeId: "k1" }), ctx);
    // 0.3*0 + 0.3*0.25 + 0.2*0 + 0.2*0.7 = 0.075 + 0.14 = 0.215
    expect(score).toBeCloseTo(0.215, 5);
  });

  it("结果始终在 [0,1]", () => {
    const plan = makePlan({
      deadline: new Date(NOW.getTime() + 0.5 * DAY_MS).toISOString(),
    });
    const cards = [
      makeCard({ id: "c1", lapses: 100 }),
      makeCard({ id: "c2", lapses: 100 }),
    ];
    const mistakes = [makeMistake({ wrongCount: 100 })];
    const ctx = {
      plan,
      cards,
      mistakes,
      energy: 5 as number | null,
      preferredSlots: [],
      now: NOW,
    };
    const score = computePriorityScore(makeTask({ nodeId: "k1" }), ctx);
    expect(score).toBeGreaterThanOrEqual(0);
    expect(score).toBeLessThanOrEqual(1);
  });
});

// ============ rankTasks ============

describe("rankTasks", () => {
  it("分数高的排在前面", () => {
    const plan = makePlan({
      deadline: new Date(NOW.getTime() + 0.5 * DAY_MS).toISOString(),
    });
    // 高分任务：到期卡片多
    const highCards = [
      makeCard({ id: "h1", nodeId: "k1", lapses: 0 }),
      makeCard({ id: "h2", nodeId: "k1", lapses: 0 }),
    ];
    const lowPlan = makePlan({
      id: "p2",
      topic: "低分计划",
      // 无 deadline
    });
    const lowCards = [
      makeCard({ id: "l1", planId: "p2", nodeId: "k2", due: new Date(NOW.getTime() + DAY_MS).toISOString() }),
    ];
    const allCards = [...highCards, ...lowCards];

    const taskHigh: ScheduleItem = { day: 1, nodeId: "k1", type: "learn", estimatedMinutes: 16, completed: false };
    const taskLow: ScheduleItem = { day: 1, nodeId: "k2", type: "learn", estimatedMinutes: 16, completed: false };

    // 把任务挂到对应 plan.schedule 以便 findPlanForTask 匹配
    plan.schedule = [taskHigh];
    lowPlan.schedule = [taskLow];

    const ranked = rankTasks([taskLow, taskHigh], {
      plans: [plan, lowPlan],
      cards: allCards,
      mistakes: [],
      energy: 4,
      preferredSlots: [],
      now: NOW,
    });

    expect(ranked).toHaveLength(2);
    expect(ranked[0].task).toBe(taskHigh);
    expect(ranked[0].score).toBeGreaterThanOrEqual(ranked[1].score);
    expect(ranked[0].planId).toBe("p1");
    expect(ranked[1].planId).toBe("p2");
  });

  it("未匹配到任何 plan 的 task 被跳过", () => {
    const orphan: ScheduleItem = { day: 9, nodeId: "orphan", type: "learn", estimatedMinutes: 16, completed: false };
    const ranked = rankTasks([orphan], {
      plans: [makePlan()],
      cards: [],
      mistakes: [],
      energy: 4,
      preferredSlots: [],
      now: NOW,
    });
    expect(ranked).toHaveLength(0);
  });
});

// ============ 优先级缓存 ============

describe("优先级缓存", () => {
  beforeEach(async () => {
    const keys = await listKeys(KEY_PREFIXES.PRIORITY_CACHE);
    for (const k of keys) await delItem(k);
  });

  it("setCachedPriority 后 getCachedPriority 可读回", async () => {
    const date = "2026-07-16";
    const tasks = [
      {
        task: makeTask(),
        score: 0.9,
        planId: "p1",
        topic: "测试计划",
      },
    ];
    await setCachedPriority(date, tasks);
    const cached = await getCachedPriority(date);
    expect(cached).not.toBeNull();
    expect(cached).toHaveLength(1);
    expect(cached![0].score).toBe(0.9);
    expect(cached![0].planId).toBe("p1");
  });

  it("未写入时 getCachedPriority 返回 null", async () => {
    const cached = await getCachedPriority("2099-01-01");
    expect(cached).toBeNull();
  });
});
