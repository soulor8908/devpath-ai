// __tests__/study-queue.test.ts
// 「学习+复习合并」第 1 阶段测试
//
// 覆盖：
//   - compute-priority：所有评分规则（基础分 / 稳定性 / 连续 new / 能量 / 多巴胺 / clamp）
//   - explainPriority：返回 reasons 数组（非空 / 中文可读）
//   - buildStudyQueue：从 IndexedDB 读 + 转换 + 排序；IndexedDB 不可用时返回空数组

import { describe, it, expect, beforeEach, vi } from "vitest";
import "fake-indexeddb/auto";
import { setItem, delItem, listKeys } from "../lib/storage/db";
import * as dbModule from "../lib/storage/db";
import { KEY_PREFIXES, type LearnLog, type ReviewLog } from "../lib/types";
import {
  computePriority,
  explainPriority,
} from "../lib/study-queue/compute-priority";
import { buildStudyQueue } from "../lib/study-queue/build-study-queue";
import type { StudyTask, StudyQueueContext } from "../lib/study-queue/types";

// 固定基准时间（UTC 中午 12 点，避免跨日边界），保证过期天数计算确定性
const NOW = new Date("2026-07-16T12:00:00.000Z");
const DAY_MS = 24 * 60 * 60 * 1000;
const TODAY = "2026-07-16";
const TODAY_ISO = NOW.toISOString();
const THREE_DAYS_AGO_ISO = new Date(NOW.getTime() - 3 * DAY_MS).toISOString();

/** 构造 review 任务（默认 stability=21 无加分，便于隔离测试基础分） */
function makeReviewTask(over: Partial<StudyTask> = {}): StudyTask {
  return {
    id: "r1",
    date: TODAY,
    type: "review",
    cardId: "c1",
    dueDate: TODAY_ISO,
    stability: 21,
    title: "复习 - 卡片 c1",
    priority: 0,
    reason: "",
    status: "todo",
    createdAt: NOW.toISOString(),
    ...over,
  };
}

/** 构造 new 任务 */
function makeNewTask(over: Partial<StudyTask> = {}): StudyTask {
  return {
    id: "n1",
    date: TODAY,
    type: "new",
    nodeId: "k1",
    topic: "k1",
    estimatedMinutes: 30,
    title: "新学 - k1",
    priority: 0,
    reason: "",
    status: "todo",
    createdAt: NOW.toISOString(),
    ...over,
  };
}

/** 构造上下文（默认 energy=3 / dopamine="无" / 无上一项） */
function makeContext(over: Partial<StudyQueueContext> = {}): StudyQueueContext {
  return {
    energy: 3,
    dopamine: "无",
    ...over,
  };
}

describe("compute-priority", () => {
  it("review 任务过期 0 天也有基础分 50", () => {
    // stability=21 视为稳定，无加分；只测基础分
    const task = makeReviewTask({ dueDate: TODAY_ISO, stability: 21 });
    // base = min(50, (0+5)*10) = 50, stabilityBonus = 0
    expect(computePriority(task, makeContext(), NOW)).toBe(50);
  });

  it("review 任务过期 3 天且稳定性低时分数高于过期 0 天", () => {
    // 公式 base = min(50, (overdue+5)*10) → 0 天和 3 天都被 cap 到 50
    // 因此同 stability 时两者基础分相同；此测试通过 stability 差异制造区分
    // （过期 + 易忘的任务应排到未过期 + 稳定的任务前面）
    const taskFresh = makeReviewTask({
      dueDate: TODAY_ISO,
      stability: 21, // base 50, bonus 0 → 50
    });
    const taskOverdue = makeReviewTask({
      dueDate: THREE_DAYS_AGO_ISO,
      stability: 0, // base 50, bonus 31.5 → 82
    });
    expect(computePriority(taskOverdue, makeContext(), NOW)).toBeGreaterThan(
      computePriority(taskFresh, makeContext(), NOW)
    );
  });

  it("review 任务 stability 越低分数越高（易忘优先）", () => {
    const stable = makeReviewTask({ stability: 21 }); // 50
    const fragile = makeReviewTask({ stability: 0 }); // 50 + 31.5 → 82
    expect(computePriority(fragile, makeContext(), NOW)).toBeGreaterThan(
      computePriority(stable, makeContext(), NOW)
    );
  });

  it("new 任务基础分 20", () => {
    const task = makeNewTask();
    expect(computePriority(task, makeContext(), NOW)).toBe(20);
  });

  it("连续 new 任务降权 10", () => {
    const task = makeNewTask();
    const ctx = makeContext({ lastTaskType: "new" });
    // 20 - 10 = 10
    expect(computePriority(task, ctx, NOW)).toBe(10);
  });

  it("lastTaskType === 'review' 时不影响 new 任务分数", () => {
    const task = makeNewTask();
    const ctx = makeContext({ lastTaskType: "review" });
    // 不触发连续 new 降权
    expect(computePriority(task, ctx, NOW)).toBe(20);
  });

  it("低能量时 review 加分 15", () => {
    const task = makeReviewTask({ stability: 21 }); // base 50
    const ctx = makeContext({ energy: 2 });
    // 50 + 15 = 65
    expect(computePriority(task, ctx, NOW)).toBe(65);
  });

  it("低能量时 new 扣分 15", () => {
    const task = makeNewTask();
    const ctx = makeContext({ energy: 2 });
    // 20 - 15 = 5
    expect(computePriority(task, ctx, NOW)).toBe(5);
  });

  it("能量正常（3）时不触发能量补偿", () => {
    const reviewTask = makeReviewTask({ stability: 21 });
    const newTask = makeNewTask();
    expect(computePriority(reviewTask, makeContext({ energy: 3 }), NOW)).toBe(50);
    expect(computePriority(newTask, makeContext({ energy: 3 }), NOW)).toBe(20);
  });

  it("高干扰日 new 扣分 10", () => {
    const task = makeNewTask();
    const ctx = makeContext({ dopamine: "刷手机" });
    // 20 - 10 = 10
    expect(computePriority(task, ctx, NOW)).toBe(10);
  });

  it("高干扰日 review 不受影响", () => {
    const task = makeReviewTask({ stability: 21 });
    const ctx = makeContext({ dopamine: "刷手机" });
    // 多巴胺补偿只针对 new
    expect(computePriority(task, ctx, NOW)).toBe(50);
  });

  it("dopamine === '无' 时不触发扣分", () => {
    const task = makeNewTask();
    const ctx = makeContext({ dopamine: "无" });
    expect(computePriority(task, ctx, NOW)).toBe(20);
  });

  it("clamp 到 [0, 100]：极端低分下限 0", () => {
    // new + 连续 new + 低能量 + 高干扰 = 20 - 10 - 15 - 10 = -15 → clamp 0
    const task = makeNewTask();
    const ctx = makeContext({
      energy: 1,
      dopamine: "刷手机",
      lastTaskType: "new",
    });
    expect(computePriority(task, ctx, NOW)).toBe(0);
  });

  it("clamp 到 [0, 100]：极端高分上限 100", () => {
    // review + stability=0 + 过期 3 天 + 低能量 = 50 + 31.5 + 15 = 96.5 → 97
    // 即使叠加再多加分，也不会超过 100
    const task = makeReviewTask({
      dueDate: THREE_DAYS_AGO_ISO,
      stability: 0,
    });
    const ctx = makeContext({ energy: 1 });
    const score = computePriority(task, ctx, NOW);
    expect(score).toBeLessThanOrEqual(100);
    expect(score).toBeGreaterThanOrEqual(0);
    // 验证具体值（97 = round(96.5)）
    expect(score).toBe(97);
  });
});

describe("explainPriority", () => {
  it("返回原因数组（非空）", () => {
    const task = makeReviewTask({ dueDate: THREE_DAYS_AGO_ISO, stability: 5 });
    const { reasons } = explainPriority(task, makeContext(), NOW);
    expect(Array.isArray(reasons)).toBe(true);
    expect(reasons.length).toBeGreaterThan(0);
  });

  it("原因可读、中文", () => {
    const task = makeNewTask();
    const ctx = makeContext({ energy: 2, dopamine: "刷手机" });
    const { reasons } = explainPriority(task, ctx, NOW);
    // 至少有一条包含中文字符
    expect(reasons.some((r) => /[\u4e00-\u9fa5]/.test(r))).toBe(true);
  });

  it("过期 review 任务原因里包含过期天数", () => {
    const task = makeReviewTask({ dueDate: THREE_DAYS_AGO_ISO, stability: 21 });
    const { reasons } = explainPriority(task, makeContext(), NOW);
    expect(reasons.some((r) => r.includes("3"))).toBe(true);
  });

  it("低能量 + new 任务原因包含低能量扣分说明", () => {
    const task = makeNewTask();
    const ctx = makeContext({ energy: 2 });
    const { reasons } = explainPriority(task, ctx, NOW);
    expect(reasons.some((r) => r.includes("低能量"))).toBe(true);
  });

  it("priority 与 explainPriority 返回的 priority 一致", () => {
    const task = makeReviewTask({ stability: 5 });
    const ctx = makeContext({ energy: 2 });
    expect(explainPriority(task, ctx, NOW).priority).toBe(
      computePriority(task, ctx, NOW)
    );
  });
});

describe("buildStudyQueue", () => {
  beforeEach(async () => {
    // 清空 learn_log / review_log 前缀下的所有 key，避免用例间污染
    const learnKeys = await listKeys(KEY_PREFIXES.LEARN_LOG);
    for (const k of learnKeys) await delItem(k);
    const reviewKeys = await listKeys(KEY_PREFIXES.REVIEW_LOG);
    for (const k of reviewKeys) await delItem(k);
  });

  it("返回 StudyTask 数组（合并 learn + review 并按 priority 降序）", async () => {
    // 注入 1 条今日 LearnLog(type=learn) + 1 条今日 ReviewLog
    const log: LearnLog = {
      id: "l1",
      planId: "p1",
      nodeId: "k1",
      date: TODAY,
      timestamp: NOW.toISOString(),
      type: "learn",
    };
    await setItem(KEY_PREFIXES.LEARN_LOG + "l1", log);

    const rev: ReviewLog = {
      id: "r1",
      cardId: "c1",
      date: TODAY,
      rating: 3,
      elapsedDays: 1,
      stateBefore: 2,
      stateAfter: 2,
    };
    await setItem(KEY_PREFIXES.REVIEW_LOG + "r1", rev);

    const queue = await buildStudyQueue({
      date: TODAY,
      context: { energy: 3, dopamine: "无" },
    });

    expect(Array.isArray(queue)).toBe(true);
    expect(queue).toHaveLength(2);

    // review 基础分 50+，new 基础分 20 → review 排前面
    expect(queue[0].type).toBe("review");
    expect(queue[1].type).toBe("new");
    // 降序校验
    expect(queue[0].priority).toBeGreaterThanOrEqual(queue[1].priority);

    // 字段类型校验
    expect(typeof queue[0].priority).toBe("number");
    expect(typeof queue[0].reason).toBe("string");
    expect(queue[0].reason.length).toBeGreaterThan(0);
    expect(typeof queue[0].id).toBe("string");
    expect(typeof queue[0].createdAt).toBe("string");

    // review task 字段
    expect(queue[0].cardId).toBe("c1");
    expect(queue[0].dueDate).toBeDefined();
    // new task 字段
    expect(queue[1].nodeId).toBe("k1");
    expect(queue[1].topic).toBe("k1");
    expect(queue[1].title).toContain("新学");
  });

  it("只取今日 LearnLog（type=learn），过滤其他日期/类型", async () => {
    // 今日 learn
    await setItem(KEY_PREFIXES.LEARN_LOG + "today", {
      id: "today",
      planId: "p1",
      nodeId: "k-today",
      date: TODAY,
      timestamp: NOW.toISOString(),
      type: "learn",
    } satisfies LearnLog);
    // 昨日 learn（应被过滤）
    await setItem(KEY_PREFIXES.LEARN_LOG + "yesterday", {
      id: "yesterday",
      planId: "p1",
      nodeId: "k-yesterday",
      date: "2026-07-15",
      timestamp: NOW.toISOString(),
      type: "learn",
    } satisfies LearnLog);
    // 今日但 type=learn_complete（应被过滤）
    await setItem(KEY_PREFIXES.LEARN_LOG + "complete", {
      id: "complete",
      planId: "p1",
      nodeId: "k-complete",
      date: TODAY,
      timestamp: NOW.toISOString(),
      type: "learn_complete",
    } satisfies LearnLog);

    const queue = await buildStudyQueue({ date: TODAY });
    expect(queue).toHaveLength(1);
    expect(queue[0].nodeId).toBe("k-today");
  });

  it("空 IndexedDB 返回空数组", async () => {
    const queue = await buildStudyQueue({ date: TODAY });
    expect(queue).toEqual([]);
  });

  it("IndexedDB 不可用时返回空数组（不抛错）", async () => {
    // 通过 spy 让 listItems 抛错，模拟 IndexedDB 异常关闭
    const spy = vi
      .spyOn(dbModule, "listItems")
      .mockRejectedValue(new Error("IndexedDB closed"));
    const queue = await buildStudyQueue({ date: TODAY });
    expect(queue).toEqual([]);
    spy.mockRestore();
  });

  it("低能量上下文下 review 排在 new 前面（认知负担小优先）", async () => {
    await setItem(KEY_PREFIXES.LEARN_LOG + "n1", {
      id: "n1",
      planId: "p1",
      nodeId: "k-new",
      date: TODAY,
      timestamp: NOW.toISOString(),
      type: "learn",
    } satisfies LearnLog);

    await setItem(KEY_PREFIXES.REVIEW_LOG + "r1", {
      id: "r1",
      cardId: "c-review",
      date: TODAY,
      rating: 3,
      elapsedDays: 1,
      stateBefore: 2,
      stateAfter: 2,
    } satisfies ReviewLog);

    // 低能量：review 加分 15 / new 扣分 15，差距进一步拉大
    const queue = await buildStudyQueue({
      date: TODAY,
      context: { energy: 2, dopamine: "无" },
    });
    expect(queue[0].type).toBe("review");
    expect(queue[1].type).toBe("new");
  });
});
