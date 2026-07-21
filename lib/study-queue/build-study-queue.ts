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
// 设计（卡帕西视角）：
//   - 纯函数：输入相同 → 输出相同，可在 Node 环境单测，不依赖 IndexedDB
//   - 可解释：reason 字段告诉用户"为什么排在这里"
//   - 不读 IndexedDB：调用方负责数据获取，本函数只做转换 + 排序

import { nanoid } from "nanoid";
import { chinaDateNow, nowISO } from "@/lib/time";
import type { LearningPlanSummary, ScheduleItem, ReviewCard } from "@/lib/types";
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
 * 把 ScheduleItem（plan 内部）转换为 new 类型的 StudyTask
 *
 * 字段映射：
 *   - plan.id → task.planId（用于跳转 /learn/{planId}）
 *   - nodeId → task.nodeId
 *   - plan.topic → task.topic
 *   - plan.topic → task.title（"新学 - {topic}"）
 *   - estimatedMinutes → task.estimatedMinutes
 */
function scheduleItemToTask(
  item: ScheduleItem,
  plan: LearningPlanSummary,
  date: string,
  createdAt: string,
): StudyTask {
  return {
    id: nanoid(),
    date,
    type: "new",
    planId: plan.id,
    nodeId: item.nodeId,
    topic: plan.topic,
    estimatedMinutes: item.estimatedMinutes,
    title: `新学 - ${plan.topic}`,
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
 * 流程：
 *   1. plans[].schedule 筛 day === 1 && !completed && type === "learn" → new 任务
 *   2. dueCards（已到期） → review 任务
 *   3. 合并 + 用 explainPriority 计算 priority + reason
 *   4. 按 priority 降序排序后返回
 *
 * @param plans 学习计划列表（含 schedule 字段）
 * @param dueCards 已到期的复习卡片列表
 * @param options 日期 / 上下文 / 当前时间（均可选，有默认值）
 * @returns 排序后的 StudyTask[]（priority 大的在前）
 */
export function buildStudyQueueFromData(
  plans: LearningPlanSummary[],
  dueCards: ReviewCard[],
  options?: BuildStudyQueueOptions,
): StudyTask[] {
  const date = options?.date ?? chinaDateNow();
  const ctx = options?.context ?? DEFAULT_CONTEXT;
  const now = options?.now ?? new Date();
  const createdAt = nowISO();

  const tasks: StudyTask[] = [];

  // 1. new 任务：每个 plan 的 schedule 中 day === 1 && !completed && type === "learn"
  for (const plan of plans) {
    const todayItems = (plan.schedule ?? []).filter(
      (s) => s.day === 1 && !s.completed && s.type === "learn",
    );
    for (const item of todayItems) {
      tasks.push(scheduleItemToTask(item, plan, date, createdAt));
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

// ============ 兼容旧接口（第 1 阶段实现，标记为 deprecated） ============

/**
 * @deprecated 第 1 阶段实现，读 LearnLog/ReviewLog 已完成日志——语义偏差。
 * 第 2 阶段起请使用 buildStudyQueueFromData（接受 plans + dueCards）。
 *
 * 保留此函数仅为不破坏现有测试；新代码请用 buildStudyQueueFromData。
 */
export async function buildStudyQueue(
  options?: BuildStudyQueueOptions,
): Promise<StudyTask[]> {
  // 服务端渲染 → 空数组
  if (typeof window === "undefined") return [];
  // 第 1 阶段实现已废弃，返回空数组（调用方应改用 buildStudyQueueFromData）
  // 不抛错以保持向后兼容
  void options;
  return [];
}
