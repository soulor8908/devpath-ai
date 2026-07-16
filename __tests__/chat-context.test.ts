import { describe, it, expect, beforeEach, vi } from "vitest";
import "fake-indexeddb/auto";
import { setItem, delItem, listKeys } from "../lib/storage/db";
import { KEY_PREFIXES, type LearningPlan, type MistakeRecord, type DailyStatus } from "../lib/types";
import { buildChatContext } from "../lib/ai/chat-context";

// 强制时间函数返回固定值，避免测试日期漂移
const FIXED_TODAY = "2026-07-13";
vi.mock("../lib/time", () => ({
  chinaDateNow: () => FIXED_TODAY,
  chinaDateShift: (date: string, delta: number) => {
    const d = new Date(date + "T00:00:00Z");
    d.setUTCDate(d.getUTCDate() + delta);
    return d.toISOString().slice(0, 10);
  },
  nowISO: () => FIXED_TODAY + "T00:00:00.000Z",
}));

function makePlan(overrides: Partial<LearningPlan> = {}): LearningPlan {
  return {
    id: "plan-1",
    topic: "React 基础",
    knowledgeTree: [
      { id: "k1", title: "JSX 本质", difficulty: 1, prerequisites: [], frequency: "高", summary: "JSX 编译为 createElement", mastery: 0 },
      { id: "k2", title: "Hooks", difficulty: 2, prerequisites: ["k1"], frequency: "高", summary: "useState/useEffect", mastery: 0 },
    ],
    questions: [],
    schedule: [
      { day: 1, nodeId: "k1", type: "learn", estimatedMinutes: 8, completed: false },
      { day: 2, nodeId: "k2", type: "learn", estimatedMinutes: 16, completed: false },
    ],
    dailyMinutes: 30,
    maxNewPerDay: 1,
    fsrsMode: "standard",
    createdAt: "2026-07-12T00:00:00.000Z",
    updatedAt: "2026-07-12T00:00:00.000Z",
    ...overrides,
  };
}

describe("chat-context", () => {
  beforeEach(async () => {
    // 清空相关前缀
    for (const prefix of [KEY_PREFIXES.PLAN, KEY_PREFIXES.LEARN_LOG, KEY_PREFIXES.MISTAKE, KEY_PREFIXES.STATUS]) {
      const keys = await listKeys(prefix);
      for (const k of keys) await delItem(k);
    }
  });

  it("空数据库时返回基础上下文（不抛错）", async () => {
    const text = await buildChatContext();
    expect(text).toContain("用户当前学习上下文");
    expect(text).toContain("暂无学习计划");
  });

  it("注入最新计划与进度", async () => {
    await setItem(KEY_PREFIXES.PLAN + "p1", makePlan());
    const text = await buildChatContext();
    expect(text).toContain("React 基础");
    expect(text).toContain("0/2");
    expect(text).toContain("JSX 本质"); // 当前应该学的节点
  });

  it("已完成节点计入进度", async () => {
    const plan = makePlan({
      schedule: [
        { day: 1, nodeId: "k1", type: "learn", estimatedMinutes: 8, completed: true },
        { day: 2, nodeId: "k2", type: "learn", estimatedMinutes: 16, completed: false },
      ],
    });
    await setItem(KEY_PREFIXES.PLAN + "p1", plan);
    const text = await buildChatContext();
    expect(text).toContain("1/2（50%）");
    expect(text).toContain("Hooks"); // 下一个待学节点
  });

  it("注入未解决错题", async () => {
    await setItem(KEY_PREFIXES.PLAN + "p1", makePlan());
    const mistake: MistakeRecord = {
      id: "m1",
      planId: "p1",
      questionId: "q1",
      nodeId: "k1",
      questionText: "请解释 React Fiber 架构与时间切片的关系？",
      wrongCount: 2,
      lastWrongAt: "2026-07-13T00:00:00.000Z",
      resolved: false,
      createdAt: "2026-07-13T00:00:00.000Z",
    };
    await setItem(KEY_PREFIXES.MISTAKE + "m1", mistake);

    const text = await buildChatContext();
    expect(text).toContain("最近答错的题目");
    expect(text).toContain("React Fiber");
  });

  it("已解决的错题不注入", async () => {
    await setItem(KEY_PREFIXES.PLAN + "p1", makePlan());
    const mistake: MistakeRecord = {
      id: "m2",
      planId: "p1",
      questionId: "q2",
      nodeId: "k1",
      questionText: "应该被忽略的错题",
      wrongCount: 1,
      lastWrongAt: "2026-07-13T00:00:00.000Z",
      resolved: true,
      createdAt: "2026-07-13T00:00:00.000Z",
    };
    await setItem(KEY_PREFIXES.MISTAKE + "m2", mistake);

    const text = await buildChatContext();
    expect(text).not.toContain("应该被忽略的错题");
  });

  it("注入今日状态（能量/心情/可用时间）", async () => {
    await setItem(KEY_PREFIXES.PLAN + "p1", makePlan());
    const status: DailyStatus = {
      date: FIXED_TODAY,
      energy: 2,
      mood: "bad",
      availableMinutes: 20,
      aiAdjustedLoad: 10,
      actualMinutes: 0,
    };
    await setItem(KEY_PREFIXES.STATUS + FIXED_TODAY, status);

    const text = await buildChatContext();
    expect(text).toContain("能量 2/5");
    expect(text).toContain("心情低落");
    expect(text).toContain("可用时间 20 分钟");
  });

  it("连续打卡天数正确", async () => {
    await setItem(KEY_PREFIXES.PLAN + "p1", makePlan());
    // 今日 + 昨日 + 前天
    await setItem(KEY_PREFIXES.LEARN_LOG + "l1", { id: "l1", planId: "p1", date: FIXED_TODAY, type: "learn", duration: 30 });
    await setItem(KEY_PREFIXES.LEARN_LOG + "l2", { id: "l2", planId: "p1", date: "2026-07-12", type: "learn", duration: 30 });
    await setItem(KEY_PREFIXES.LEARN_LOG + "l3", { id: "l3", planId: "p1", date: "2026-07-11", type: "learn", duration: 30 });

    const text = await buildChatContext();
    expect(text).toContain("连续打卡：3 天");
  });

  it("输出体积 < 4KB（token 控制）", async () => {
    await setItem(KEY_PREFIXES.PLAN + "p1", makePlan());
    // 塞入大量错题
    for (let i = 0; i < 20; i++) {
      await setItem(KEY_PREFIXES.MISTAKE + `m${i}`, {
        id: `m${i}`,
        planId: "p1",
        questionId: `q${i}`,
        nodeId: "k1",
        questionText: `错题 ${i}: `.repeat(50),
        wrongCount: 1,
        lastWrongAt: "2026-07-13T00:00:00.000Z",
        resolved: false,
        createdAt: "2026-07-13T00:00:00.000Z",
      } as MistakeRecord);
    }

    const text = await buildChatContext();
    expect(text.length).toBeLessThan(4500); // 留一点冗余
  });
});
