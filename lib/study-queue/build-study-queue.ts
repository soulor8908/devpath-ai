// lib/study-queue/build-study-queue.ts
// 学习队列聚合：从 plans（待学 schedule 项）+ dueCards（待复习卡片）→ 合并为 StudyTask[] → 排序
//
// 第 2 阶段实现（修正第 1 阶段语义偏差）：
//   - 第 1 阶段读 LearnLog/ReviewLog（已完成日志）是错的——首页需要"今日待办"，不是"今日已做"
//   - 第 2 阶段改为接受外部传入数据（plans + dueCards），由 useHomeData 调用
//   - new 任务：plans[].schedule 筛 day === 1 && !completed && type === "learn"
//     （与 computeTodaySchedule 语义一致：每个 plan 的第 1 天未完成学习项）
//   - review 任务：dueCards 筛 due <= now（FSRS 到期卡片）
//   - 合并后用 explainPriority 计算优先级 + reason，按 priority 降序返回
//
// 第 3 阶段（2026-07-27 重构）：学习队列从节点维度改成题目维度
//   - 用户反馈"学了几题进度还是 0"+ "已学会的题不应该出现在训练页"
//   - 旧设计：一节点一 StudyTask（scheduleItemToTask），具体做哪道题由 TrainSessionFlow 运行时挑
//   - 新设计：一题一 StudyTask（questionToTask），每道未 understood 的题都是独立任务
//   - 过滤逻辑：从 nodeStates.mastered/allUnderstood 改成直接查 question.understood
//   - 签名变更：接收 LearningPlan[]（需 questions 字段）而非 LearningPlanSummary[]
//
// 设计（卡帕西视角）：
//   - 纯函数：输入相同 → 输出相同，可在 Node 环境单测，不依赖 IndexedDB
//   - 可解释：reason 字段告诉用户"为什么排在这里"
//   - 不读 IndexedDB：调用方负责数据获取，本函数只做转换 + 排序

import { nanoid } from "nanoid";
import { chinaDateNow, nowISO } from "@/lib/time";
import type { LearningPlan, ScheduleItem, ReviewCard, Question } from "@/lib/types";
import { explainPriority } from "./compute-priority";
import type { StudyTask, StudyQueueContext } from "./types";

/** 默认排序上下文：能量正常、无多巴胺干扰、无上一项 */
const DEFAULT_CONTEXT: StudyQueueContext = {
  energy: 3,
  dopamine: "无",
};

/** buildStudyQueueFromData 的可选参数 */
export interface BuildStudyQueueOptions {
  /** 队列所属日期，默认今天（中国时区） */
  date?: string;
  /** 排序上下文，默认 { energy: 3, dopamine: "无" } */
  context?: StudyQueueContext;
  /** 当前时间，用于计算 review 任务紧迫度（默认 new Date()） */
  now?: Date;
}

/**
 * 把一道 Question 转换为 new 类型的 StudyTask（2026-07-27 题目维度重构）
 *
 * 字段映射：
 *   - plan.id → task.planId（用于跳转 /learn/{planId}）
 *   - question.nodeId → task.nodeId
 *   - question.id → task.questionId（新字段，题目维度）
 *   - plan.topic → task.topic
 *   - question.question 前 30 字 → task.title（"新学 - {题目前缀}"）
 *   - item.estimatedMinutes → task.estimatedMinutes
 */
function questionToTask(
  question: Question,
  item: ScheduleItem,
  plan: LearningPlan,
  date: string,
  createdAt: string,
): StudyTask {
  const questionPreview = question.question.slice(0, 30);
  return {
    id: nanoid(),
    date,
    type: "new",
    planId: plan.id,
    nodeId: question.nodeId,
    questionId: question.id,
    topic: plan.topic,
    estimatedMinutes: item.estimatedMinutes,
    title: `新学 - ${questionPreview}${question.question.length > 30 ? "..." : ""}`,
    priority: 0,
    reason: "",
    status: "todo",
    createdAt,
  };
}

/**
 * 把 ReviewCard 转换为 review 类型的 StudyTask
 *
 * 字段映射：
 *   - card.id → task.cardId
 *   - card.due → task.dueDate
 *   - card.stability → task.stability
 *   - card.front → task.title（"复习 - {front 前 30 字}"）
 */
function reviewCardToTask(card: ReviewCard, date: string, createdAt: string): StudyTask {
  const frontPreview = card.front.slice(0, 30);
  return {
    id: nanoid(),
    date,
    type: "review",
    cardId: card.id,
    dueDate: card.due,
    stability: card.stability,
    retrievability: undefined,
    title: `复习 - ${frontPreview}${card.front.length > 30 ? "..." : ""}`,
    priority: 0,
    reason: "",
    status: "todo",
    createdAt,
  };
}

/**
 * 从 plans + dueCards 构建今日学习队列（纯函数，不读 IndexedDB）
 *
 * 2026-07-27 重构：学习队列从节点维度改成题目维度
 *   - 旧设计：一节点一 task（scheduleItemToTask）
 *   - 新设计：一题一 task（questionToTask），每道未 understood 的题都是独立任务
 *   - 已 understood 的题不进队列（用户已学会，不再出现）
 *   - 已 mastered 的节点下所有题不进队列（节点已完成）
 *
 * 流程：
 *   1. plans[].schedule 筛 day === 1 && !completed && type === "learn" → 候选节点
 *   2. 对每个候选节点，找 plan.questions 中 q.nodeId === nodeId && !q.understood 的题
 *      - 节点已 mastered → 跳过整个节点
 *      - 节点下所有题都 understood → 跳过（不产生 task）
 *      - 节点下有未 understood 的题 → 每题一个 task
 *   3. dueCards（已到期） → review 任务
 *   4. 合并 + 用 explainPriority 计算 priority + reason
 *   5. 按 priority 降序排序后返回
 *
 * @param plans 完整学习计划列表（含 schedule + questions + knowledgeTree）
 * @param dueCards 已到期的复习卡片列表
 * @param options 日期 / 上下文 / 当前时间（均可选，有默认值）
 * @returns 排序后的 StudyTask[]（priority 大的在前）
 */
export function buildStudyQueueFromData(
  plans: LearningPlan[],
  dueCards: ReviewCard[],
  options?: BuildStudyQueueOptions,
): StudyTask[] {
  const date = options?.date ?? chinaDateNow();
  const ctx = options?.context ?? DEFAULT_CONTEXT;
  const now = options?.now ?? new Date();
  const createdAt = nowISO();

  const tasks: StudyTask[] = [];

  // 1. new 任务：按题目维度展开
  for (const plan of plans) {
    // 筛今日待学的 schedule 项（day === 1 && !completed && type === "learn"）
    const todayItems = (plan.schedule ?? []).filter(
      (s) => s.day === 1 && !s.completed && s.type === "learn",
    );

    // 构建 nodeId → node 的映射（用于查 mastered 状态）
    const nodeMap = new Map(plan.knowledgeTree.map((n) => [n.id, n]));

    for (const item of todayItems) {
      const node = nodeMap.get(item.nodeId);
      // 节点已 mastered → 跳过整个节点
      if (node?.mastered) continue;

      // 找该节点下所有未 understood 的题
      const pendingQuestions = plan.questions.filter(
        (q) => q.nodeId === item.nodeId && !q.understood,
      );

      // 每题一个 task
      for (const question of pendingQuestions) {
        tasks.push(questionToTask(question, item, plan, date, createdAt));
      }
    }
  }

  // 2. review 任务：dueCards 直接转换（调用方已筛 due <= now）
  for (const card of dueCards) {
    tasks.push(reviewCardToTask(card, date, createdAt));
  }

  // 3. 计算优先级 + 填充 reason
  for (const task of tasks) {
    const { priority, reasons } = explainPriority(task, ctx, now);
    task.priority = priority;
    task.reason = reasons.join("；");
  }

  // 4. 降序排序（priority 大的在前）
  tasks.sort((a, b) => b.priority - a.priority);

  return tasks;
}
