import { describe, it, expect } from "vitest";
import "fake-indexeddb/auto";
import type {
  RhythmContext,
  NextAction,
  PomodoroSession,
  ReviewCard,
  Routine,
  LearningPlan,
  ScheduleItem,
} from "../lib/types";
import { getNextAction } from "../lib/ai/rhythm-engine";

// ============ 工厂函数 ============

function makeCtx(over: Partial<RhythmContext> = {}): RhythmContext {
  return {
    runningSession: null,
    todayEnergy: null,
    todayMood: undefined,
    dueCards: [],
    reviewedRecently: false,
    activePlans: [],
    routine: undefined,
    profile: undefined,
    now: new Date(2026, 6, 16, 14, 0).toISOString(), // 2026-07-16 14:00 local
    todayFocusCount: 0,
    ...over,
  };
}

function makeRunningSession(over: Partial<PomodoroSession> = {}): PomodoroSession {
  return {
    id: "s1",
    planId: "p1",
    nodeId: "k1",
    taskDescription: "专注任务",
    type: "focus",
    durationMinutes: 25,
    startedAt: new Date(Date.now() - 10 * 60_000).toISOString(),
    status: "running",
    sessionIndex: 1,
    interruptions: 0,
    ...over,
  };
}

function makeCard(over: Partial<ReviewCard> = {}): ReviewCard {
  return {
    id: "c1",
    planId: "p1",
    nodeId: "k1",
    questionId: "q1",
    front: "问题",
    back: "答案",
    due: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
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

function makeRoutine(over: Partial<Routine> = {}): Routine {
  return {
    wakeTime: "07:00",
    sleepTime: "23:00",
    slots: [],
    weekdays: [1, 2, 3, 4, 5],
    intensity: "standard",
    ...over,
  };
}

function makePlan(over: Partial<LearningPlan> = {}): LearningPlan {
  return {
    id: "p1",
    topic: "测试计划",
    knowledgeTree: [
      {
        id: "k1",
        title: "知识点1",
        difficulty: 3,
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
    maxNewPerDay: 1,
    fsrsMode: "standard",
    createdAt: "2026-07-01T00:00:00.000Z",
    updatedAt: "2026-07-01T00:00:00.000Z",
    ...over,
  };
}

function makeLearnTask(over: Partial<ScheduleItem> = {}): ScheduleItem {
  return {
    day: 1,
    nodeId: "k1",
    type: "learn",
    estimatedMinutes: 25,
    completed: false,
    ...over,
  };
}

// ============ 6 条决策优先级分支测试 ============

describe("getNextAction 6 条决策链", () => {
  // 1. running session → continue_focus
  it("分支 1: 当前有 running PomodoroSession → continue_focus", async () => {
    const ctx = makeCtx({ runningSession: makeRunningSession() });
    const action = await getNextAction(ctx);
    expect(action.type).toBe("continue_focus");
    expect(action).toHaveProperty("session");
    expect((action as Extract<NextAction, { type: "continue_focus" }>).session.id).toBe("s1");
    expect(action.reason).toContain("专注");
  });

  // 2. energy ≤ 2 → rest
  it("分支 2: todayEnergy ≤ 2 → rest", async () => {
    const ctx = makeCtx({ todayEnergy: 2 });
    const action = await getNextAction(ctx);
    expect(action.type).toBe("rest");
    expect(action.reason).toContain("能量");
  });

  it("分支 2: todayEnergy = 1 → rest（极低能量）", async () => {
    const ctx = makeCtx({ todayEnergy: 1 });
    const action = await getNextAction(ctx);
    expect(action.type).toBe("rest");
  });

  // 3. due cards > 0 且未复习过 → review
  it("分支 3: 有到期卡片 + reviewedRecently=false → review", async () => {
    const ctx = makeCtx({
      dueCards: [makeCard(), makeCard({ id: "c2" })],
      reviewedRecently: false,
    });
    const action = await getNextAction(ctx);
    expect(action.type).toBe("review");
    expect((action as Extract<NextAction, { type: "review" }>).cards.length).toBe(2);
    expect(action.reason).toContain("2 张");
  });

  it("分支 3 短路: 有到期卡片但 reviewedRecently=true → 不进入 review", async () => {
    // 即使有到期卡片，最近 1 小时复习过则不进 review，落入后续分支
    const ctx = makeCtx({
      dueCards: [makeCard()],
      reviewedRecently: true,
      activePlans: [], // 无 activePlans，最终落入默认 rest
    });
    const action = await getNextAction(ctx);
    expect(action.type).not.toBe("review");
  });

  // 4. routine slot 命中 → start_focus
  // 注意：pickFocusTask 内部读 IndexedDB（mistakes + cards），
  //       fake-indexeddb 提供空数据兜底，不影响 start_focus 触发判定
  //       （只要有 activePlans 未完成 learn task 就会触发）
  it("分支 4: routine slot 命中 + activePlans 有未完成 task → start_focus", async () => {
    const task = makeLearnTask();
    const plan = makePlan({ schedule: [task] });
    const routine = makeRoutine({
      slots: [{ label: "下午", start: "14:00", end: "15:00", minutes: 60 }],
    });

    const ctx = makeCtx({
      activePlans: [plan],
      routine,
      now: new Date(2026, 6, 16, 14, 30).toISOString(), // 14:30 命中 slot
    });
    const action = await getNextAction(ctx);
    expect(action.type).toBe("start_focus");
    expect(action).toHaveProperty("duration");
    expect(action.reason).toContain("专注");
  });

  it("分支 4 短路: routine slot 未命中 → 不进入 start_focus", async () => {
    // 当前时间不在任何 slot 内
    const routine = makeRoutine({
      slots: [{ label: "早晨", start: "06:00", end: "08:00", minutes: 120 }],
    });
    const ctx = makeCtx({
      routine,
      now: new Date(2026, 6, 16, 14, 30).toISOString(), // 14:30 不在 06-08 内
    });
    const action = await getNextAction(ctx);
    expect(action.type).not.toBe("start_focus");
  });

  it("分支 4 兜底: routine slot 命中但 activePlans=[] → 落入后续分支", async () => {
    const routine = makeRoutine({
      slots: [{ label: "下午", start: "14:00", end: "15:00", minutes: 60 }],
      sleepTime: "23:00", // 离睡眠还远，不进 plan_next_day
    });
    const ctx = makeCtx({
      activePlans: [], // 无活跃计划，pickFocusTask 返回 null
      routine,
      now: new Date(2026, 6, 16, 14, 30).toISOString(),
    });
    const action = await getNextAction(ctx);
    // activePlans=[] 时 pickFocusTask 返回 null，落入分支 5/6
    // 离 sleepTime 还远 → 不进分支 5 → 进入分支 6（默认 pickFocusTask 又返回 null → rest）
    expect(action.type).toBe("rest");
  });

  // 5. 接近 sleepTime → plan_next_day
  it("分支 5: 当前时间距 sleepTime ≤ 30 分钟 → plan_next_day", async () => {
    const routine = makeRoutine({ sleepTime: "22:45" });
    const ctx = makeCtx({
      routine,
      now: new Date(2026, 6, 16, 22, 30).toISOString(), // 22:30，距 22:45 还有 15 分钟
    });
    const action = await getNextAction(ctx);
    expect(action.type).toBe("plan_next_day");
    expect(action.reason).toContain("睡眠时间");
  });

  it("分支 5: 距 sleepTime = 30 分钟（边界） → plan_next_day", async () => {
    const routine = makeRoutine({ sleepTime: "23:00" });
    const ctx = makeCtx({
      routine,
      now: new Date(2026, 6, 16, 22, 30).toISOString(), // 22:30，距 23:00 正好 30 分钟
    });
    const action = await getNextAction(ctx);
    expect(action.type).toBe("plan_next_day");
  });

  it("分支 5 短路: 距 sleepTime > 30 分钟 → 不进入 plan_next_day", async () => {
    const routine = makeRoutine({ sleepTime: "23:00" });
    const ctx = makeCtx({
      routine,
      now: new Date(2026, 6, 16, 22, 0).toISOString(), // 22:00，距 23:00 还有 60 分钟
    });
    const action = await getNextAction(ctx);
    expect(action.type).not.toBe("plan_next_day");
  });

  // 6. 默认 → start_focus（有 activePlans）或 rest（无 activePlans）
  it("分支 6: 无 routine slot + activePlans=[] → rest（无可用 task）", async () => {
    const ctx = makeCtx({
      activePlans: [],
      now: new Date(2026, 6, 16, 14, 0).toISOString(),
    });
    const action = await getNextAction(ctx);
    expect(action.type).toBe("rest");
    expect(action.reason).toContain("没有");
  });

  it("分支 6: 无 routine + activePlans 有 task → start_focus", async () => {
    const task = makeLearnTask();
    const plan = makePlan({ schedule: [task] });
    const ctx = makeCtx({
      activePlans: [plan],
      now: new Date(2026, 6, 16, 14, 0).toISOString(),
    });
    const action = await getNextAction(ctx);
    expect(action.type).toBe("start_focus");
    expect(action.reason).toContain("专注");
  });
});

// ============ 优先级链短路验证 ============

describe("决策链优先级（从上到下短路）", () => {
  it("running session 优先于 energy ≤ 2", async () => {
    const ctx = makeCtx({
      runningSession: makeRunningSession(),
      todayEnergy: 1, // 极低能量
    });
    const action = await getNextAction(ctx);
    expect(action.type).toBe("continue_focus");
  });

  it("energy ≤ 2 优先于 due cards", async () => {
    const ctx = makeCtx({
      todayEnergy: 1,
      dueCards: [makeCard()],
      reviewedRecently: false,
    });
    const action = await getNextAction(ctx);
    expect(action.type).toBe("rest");
  });

  it("due cards 优先于 routine slot", async () => {
    const routine = makeRoutine({
      slots: [{ label: "下午", start: "13:00", end: "15:00", minutes: 120 }],
    });
    const ctx = makeCtx({
      dueCards: [makeCard()],
      reviewedRecently: false,
      routine,
      now: new Date(2026, 6, 16, 14, 0).toISOString(), // 命中 slot
      activePlans: [], // 防止进入 start_focus
    });
    const action = await getNextAction(ctx);
    expect(action.type).toBe("review");
  });

  it("routine slot 命中 优先于 plan_next_day", async () => {
    const task = makeLearnTask();
    const plan = makePlan({ schedule: [task] });
    const routine = makeRoutine({
      slots: [{ label: "晚上", start: "22:00", end: "23:00", minutes: 60 }],
      sleepTime: "22:30",
    });
    const ctx = makeCtx({
      activePlans: [plan],
      routine,
      now: new Date(2026, 6, 16, 22, 15).toISOString(), // 命中 slot + 接近 sleepTime
    });
    const action = await getNextAction(ctx);
    expect(action.type).toBe("start_focus");
  });

  it("plan_next_day 优先于默认 start_focus", async () => {
    const routine = makeRoutine({ sleepTime: "22:45" });
    const ctx = makeCtx({
      routine,
      activePlans: [], // 无可用 task
      now: new Date(2026, 6, 16, 22, 30).toISOString(),
    });
    const action = await getNextAction(ctx);
    expect(action.type).toBe("plan_next_day");
  });
});

// ============ NextAction.reason 字段验证 ============

describe("NextAction.reason 字段", () => {
  it("所有分支都返回非空 reason", async () => {
    // 分支 1
    const a1 = await getNextAction(makeCtx({ runningSession: makeRunningSession() }));
    expect(a1.reason.length).toBeGreaterThan(0);

    // 分支 2
    const a2 = await getNextAction(makeCtx({ todayEnergy: 1 }));
    expect(a2.reason.length).toBeGreaterThan(0);

    // 分支 3
    const a3 = await getNextAction(
      makeCtx({ dueCards: [makeCard()], reviewedRecently: false }),
    );
    expect(a3.reason.length).toBeGreaterThan(0);

    // 分支 5
    const a5 = await getNextAction(
      makeCtx({
        routine: makeRoutine({ sleepTime: "22:45" }),
        now: new Date(2026, 6, 16, 22, 30).toISOString(),
      }),
    );
    expect(a5.reason.length).toBeGreaterThan(0);

    // 分支 6（无 activePlans）
    const a6 = await getNextAction(makeCtx({ activePlans: [] }));
    expect(a6.reason.length).toBeGreaterThan(0);
  });
});
