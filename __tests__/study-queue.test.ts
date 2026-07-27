// __tests__/study-queue.test.ts
// 「学习+复习合并」第 1 阶段 + 第 2 阶段测试
//
// 覆盖：
//   - compute-priority：所有评分规则（基础分 / 稳定性 / 连续 new / 能量 / 多巴胺 / clamp）
//   - explainPriority：返回 reasons 数组（非空 / 中文可读）
//   - buildStudyQueueFromData：从 plans + dueCards 构建 + 排序（第 2 阶段纯函数，不读 IndexedDB）

import { describe, it, expect } from "vitest";
import type { LearningPlan, ReviewCard } from "../lib/types";
import {
  computePriority,
  explainPriority,
} from "../lib/study-queue/compute-priority";
import { buildStudyQueueFromData } from "../lib/study-queue/build-study-queue";
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

describe("buildStudyQueueFromData", () => {
  // 第 3 阶段（2026-07-27 重构）：题目维度队列测试
  // - 旧设计：一节点一 StudyTask（scheduleItemToTask）
  // - 新设计：一题一 StudyTask（questionToTask），每道未 understood 的题都是独立 task
  // - 过滤：节点 mastered=true → 跳过整个节点；题 understood=true → 不进队列
  // - 签名：接收 LearningPlan[]（需 questions 字段）而非 LearningPlanSummary[]

  /** 构造完整 LearningPlan（含 knowledgeTree + questions + schedule，题目维度） */
  function makePlan(over: Partial<LearningPlan> = {}): LearningPlan {
    return {
      id: "p1",
      topic: "测试计划",
      knowledgeTree: [
        {
          id: "k1",
          title: "知识点1",
          summary: "摘要",
          difficulty: 3,
          prerequisites: [],
          frequency: "中",
          mastery: 0,
        },
      ],
      questions: [
        {
          id: "q1",
          nodeId: "k1",
          question: "题目1内容",
          answer: "答案",
          keyPoints: [],
          followUps: [],
          favorited: false,
          understood: false,
        },
      ],
      schedule: [
        { day: 1, type: "learn", nodeId: "k1", estimatedMinutes: 30, completed: false },
      ],
      dailyMinutes: 30,
      maxNewPerDay: 5,
      fsrsMode: "standard",
      createdAt: NOW.toISOString(),
      updatedAt: NOW.toISOString(),
      ...over,
    };
  }

  function makeCard(over: Partial<ReviewCard> = {}): ReviewCard {
    return {
      id: "c1",
      planId: "p1",
      nodeId: "k1",
      questionId: "q1",
      front: "测试卡正面",
      back: "测试卡背面",
      due: TODAY_ISO,
      stability: 21,
      difficulty: 3,
      elapsedDays: 0,
      scheduledDays: 1,
      reps: 1,
      lapses: 0,
      state: 2,
      lastReview: TODAY_ISO,
      ...over,
    };
  }

  it("返回 StudyTask 数组（合并 learn + review 并按 priority 降序，题目维度）", () => {
    // 1 道未 understood 的题 → 1 个 new task；1 张到期卡片 → 1 个 review task
    const plans: LearningPlan[] = [makePlan()];
    const cards: ReviewCard[] = [makeCard()];

    const queue = buildStudyQueueFromData(plans, cards, {
      date: TODAY,
      context: { energy: 3, dopamine: "无" },
      now: NOW,
    });

    expect(Array.isArray(queue)).toBe(true);
    // 题目维度：1 个 new task（来自 q1）+ 1 个 review task
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
    // new task 字段（题目维度：带 questionId，title 用题目前缀而非 plan.topic）
    expect(queue[1].planId).toBe("p1");
    expect(queue[1].nodeId).toBe("k1");
    expect(queue[1].questionId).toBe("q1");
    expect(queue[1].topic).toBe("测试计划");
    // title 是"新学 - {题面前 30 字}"，不再是"新学 - {plan.topic}"
    expect(queue[1].title).toContain("新学");
    expect(queue[1].title).toContain("题目1内容");
  });

  it("只取今日待学 schedule（day === 1 && !completed && type === \"learn\"），按题目维度展开", () => {
    // 多节点 + 每节点一题，schedule 含 4 种过滤场景
    const plans: LearningPlan[] = [
      makePlan({
        knowledgeTree: [
          { id: "k-today", title: "今日待学", summary: "摘要", difficulty: 3, prerequisites: [], frequency: "中", mastery: 0 },
          { id: "k-yesterday", title: "昨日", summary: "摘要", difficulty: 3, prerequisites: [], frequency: "中", mastery: 0 },
          { id: "k-complete", title: "已完成", summary: "摘要", difficulty: 3, prerequisites: [], frequency: "中", mastery: 0 },
          { id: "k-other", title: "review类型", summary: "摘要", difficulty: 3, prerequisites: [], frequency: "中", mastery: 0 },
        ],
        questions: [
          { id: "q-today", nodeId: "k-today", question: "今日题", answer: "答案", keyPoints: [], followUps: [], favorited: false, understood: false },
          { id: "q-yesterday", nodeId: "k-yesterday", question: "昨日题", answer: "答案", keyPoints: [], followUps: [], favorited: false, understood: false },
          { id: "q-complete", nodeId: "k-complete", question: "已完成题", answer: "答案", keyPoints: [], followUps: [], favorited: false, understood: false },
          { id: "q-other", nodeId: "k-other", question: "review题", answer: "答案", keyPoints: [], followUps: [], favorited: false, understood: false },
        ],
        schedule: [
          // 今日待学（应保留 → q-today 进队列）
          { day: 1, type: "learn", nodeId: "k-today", estimatedMinutes: 30, completed: false },
          // 昨日 schedule（day=0 应被过滤）
          { day: 0, type: "learn", nodeId: "k-yesterday", estimatedMinutes: 30, completed: false },
          // 今日但已完成（应被过滤）
          { day: 1, type: "learn", nodeId: "k-complete", estimatedMinutes: 30, completed: true },
          // 今日但 type=review（应被过滤——new 任务只取 type=learn）
          { day: 1, type: "review", nodeId: "k-other", estimatedMinutes: 30, completed: false },
        ],
      }),
    ];

    const queue = buildStudyQueueFromData(plans, [], {
      date: TODAY,
      now: NOW,
    });
    // 只有 k-today 节点的 q-today 题进入队列
    expect(queue).toHaveLength(1);
    expect(queue[0].nodeId).toBe("k-today");
    expect(queue[0].questionId).toBe("q-today");
  });

  it("空 plans + 空 dueCards 返回空数组", () => {
    const queue = buildStudyQueueFromData([], [], { date: TODAY, now: NOW });
    expect(queue).toEqual([]);
  });

  it("低能量上下文下 review 排在 new 前面（认知负担小优先）", () => {
    const plans: LearningPlan[] = [makePlan()];
    const cards: ReviewCard[] = [makeCard()];

    // 低能量：review 加分 15 / new 扣分 15，差距进一步拉大
    const queue = buildStudyQueueFromData(plans, cards, {
      date: TODAY,
      context: { energy: 2, dopamine: "无" },
      now: NOW,
    });
    expect(queue[0].type).toBe("review");
    expect(queue[1].type).toBe("new");
  });

  // ============ 2026-07-27 重构：题目维度过滤（替换旧 nodeStates 派生字段） ============
  // 用户需求：训练中点"我答对了"→题目 understood=true，
  // 节点下所有题 understood 时该节点不再产生 new 任务；
  // 节点 mastered=true 时整个节点跳过。
  // 新设计直接查 plan.knowledgeTree[].mastered 和 plan.questions[].understood，
  // 不再用 summary.nodeStates 派生字段（无需向后兼容旧 summary）。
  describe("已掌握 / 全部看懂的节点排除（题目维度，2026-07-27 重构）", () => {
    it("mastered=true 的节点不进入 study-queue（整个节点跳过）", () => {
      const plans: LearningPlan[] = [
        makePlan({
          knowledgeTree: [
            { id: "k1", title: "知识点1", summary: "摘要", difficulty: 3, prerequisites: [], frequency: "中", mastery: 0, mastered: true },
          ],
        }),
      ];
      const queue = buildStudyQueueFromData(plans, [], {
        date: TODAY,
        now: NOW,
      });
      // k1 节点 mastered → 跳过整个节点（即使该节点下有未 understood 的题）
      expect(queue).toHaveLength(0);
    });

    it("节点下所有题 understood=true 时不进入 study-queue（!q.understood 过滤）", () => {
      const plans: LearningPlan[] = [
        makePlan({
          questions: [
            { id: "q1", nodeId: "k1", question: "题目1内容", answer: "答案", keyPoints: [], followUps: [], favorited: false, understood: true },
          ],
        }),
      ];
      const queue = buildStudyQueueFromData(plans, [], {
        date: TODAY,
        now: NOW,
      });
      // k1 节点下所有题 understood → 没有未 understood 的题 → 队列空
      expect(queue).toHaveLength(0);
    });

    it("节点 mastered=false 且有未 understood 的题时正常进入 study-queue", () => {
      const plans: LearningPlan[] = [
        makePlan({
          knowledgeTree: [
            { id: "k1", title: "知识点1", summary: "摘要", difficulty: 3, prerequisites: [], frequency: "中", mastery: 0, mastered: false },
          ],
          questions: [
            { id: "q1", nodeId: "k1", question: "题目1内容", answer: "答案", keyPoints: [], followUps: [], favorited: false, understood: false },
          ],
        }),
      ];
      const queue = buildStudyQueueFromData(plans, [], {
        date: TODAY,
        now: NOW,
      });
      // 节点未掌握且有未看懂的题 → 该题进入队列
      expect(queue).toHaveLength(1);
      expect(queue[0].nodeId).toBe("k1");
      expect(queue[0].questionId).toBe("q1");
    });

    it("混合场景：部分节点掌握、部分题目看懂、部分题目未看懂", () => {
      const plans: LearningPlan[] = [
        makePlan({
          knowledgeTree: [
            { id: "k1", title: "已掌握", summary: "摘要", difficulty: 3, prerequisites: [], frequency: "中", mastery: 0, mastered: true },
            { id: "k2", title: "全看懂", summary: "摘要", difficulty: 3, prerequisites: [], frequency: "中", mastery: 0 },
            { id: "k3", title: "未完成", summary: "摘要", difficulty: 3, prerequisites: [], frequency: "中", mastery: 0 },
          ],
          questions: [
            // k1 下有未 understood 题，但节点 mastered → 跳过整个节点
            { id: "q1", nodeId: "k1", question: "题1", answer: "答案", keyPoints: [], followUps: [], favorited: false, understood: false },
            // k2 下所有题 understood → 跳过
            { id: "q2", nodeId: "k2", question: "题2", answer: "答案", keyPoints: [], followUps: [], favorited: false, understood: true },
            // k3 下有未 understood 题 → 保留
            { id: "q3", nodeId: "k3", question: "题3", answer: "答案", keyPoints: [], followUps: [], favorited: false, understood: false },
          ],
          schedule: [
            { day: 1, type: "learn", nodeId: "k1", estimatedMinutes: 30, completed: false },
            { day: 1, type: "learn", nodeId: "k2", estimatedMinutes: 30, completed: false },
            { day: 1, type: "learn", nodeId: "k3", estimatedMinutes: 30, completed: false },
          ],
        }),
      ];
      const queue = buildStudyQueueFromData(plans, [], {
        date: TODAY,
        now: NOW,
      });
      // 只有 k3 的 q3 进入队列（k1 mastered、k2 全 understood）
      expect(queue).toHaveLength(1);
      expect(queue[0].nodeId).toBe("k3");
      expect(queue[0].questionId).toBe("q3");
    });

    it("review 卡片不受 mastered 影响（仅过滤 new 学习任务）", () => {
      const plans: LearningPlan[] = [
        makePlan({
          knowledgeTree: [
            { id: "k1", title: "知识点1", summary: "摘要", difficulty: 3, prerequisites: [], frequency: "中", mastery: 0, mastered: true },
          ],
        }),
      ];
      const cards: ReviewCard[] = [makeCard({ nodeId: "k1" })];
      const queue = buildStudyQueueFromData(plans, cards, {
        date: TODAY,
        now: NOW,
      });
      // new 任务被过滤（k1 mastered），但 review 卡片应保留
      // review 卡片由 dueCards 直接转换，不走 mastered 过滤
      const reviewTasks = queue.filter((t) => t.type === "review");
      const newTasks = queue.filter((t) => t.type === "new");
      expect(newTasks).toHaveLength(0);
      expect(reviewTasks).toHaveLength(1);
    });
  });
});
