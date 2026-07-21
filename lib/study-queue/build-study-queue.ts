// lib/study-queue/build-study-queue.ts
// 学习队列客户端聚合：从 IndexedDB 读 LearnLog/ReviewLog → 合并为 StudyTask[] → 排序
//
// 第 1 阶段策略（务实，不过度设计）：
//   - 只读现有 KEY_PREFIXES.LEARN_LOG / REVIEW_LOG，不引入新前缀，不改 lib/types.ts
//   - LearnLog(type === "learn", date === today) → StudyTask(type === "new")
//   - ReviewLog(date === today)                  → StudyTask(type === "review")
//   - 由于 LearnLog / ReviewLog 没有标题/预估时长/stability 字段，
//     第 1 阶段用 ID 作为标题占位、用 log.duration 作为预估时长兜底、
//     stability 留 undefined（computePriority 视为易忘）。
//     第 2 阶段接入 UI 时再补充查 KnowledgeNode.title / ReviewCard.front
//     来填充完整标题，并查 ReviewCard.stability 填稳定性。
//   - 服务端渲染 / IndexedDB 不可用 → 返回空数组（不抛错，不阻塞 SSR）
//   - 严格"只读"：不写 IndexedDB、不影响 /learn /review 路由

import { nanoid } from "nanoid";
import { listItems } from "@/lib/storage/db";
import { chinaDateNow, nowISO } from "@/lib/time";
import { KEY_PREFIXES, type LearnLog, type ReviewLog } from "@/lib/types";
import { explainPriority } from "./compute-priority";
import type { StudyTask, StudyQueueContext } from "./types";

/** 默认排序上下文：能量正常、无多巴胺干扰、无上一项 */
const DEFAULT_CONTEXT: StudyQueueContext = {
  energy: 3,
  dopamine: "无",
};

/** buildStudyQueue 的可选参数 */
export interface BuildStudyQueueOptions {
  /** 队列所属日期，默认今天（中国时区） */
  date?: string;
  /** 排序上下文，默认 { energy: 3, dopamine: "无" } */
  context?: StudyQueueContext;
}

/**
 * 把 LearnLog 转换为 new 类型的 StudyTask
 *
 * 第 1 阶段字段映射说明：
 *   - nodeId / planId → topic 用 nodeId 优先，缺则用 planId 作占位
 *   - title → `新学 - ${nodeId ?? planId}`（第 2 阶段查 KnowledgeNode.title 替换）
 *   - estimatedMinutes → log.duration（旧字段含义：实际专注分钟数；作为预估兜底）
 */
function learnLogToTask(log: LearnLog, date: string, createdAt: string): StudyTask {
  const identifier = log.nodeId ?? log.planId;
  return {
    id: nanoid(),
    date,
    type: "new",
    nodeId: log.nodeId,
    topic: identifier,
    estimatedMinutes: log.duration,
    title: `新学 - ${identifier}`,
    priority: 0,
    reason: "",
    status: "todo",
    createdAt,
  };
}

/**
 * 把 ReviewLog 转换为 review 类型的 StudyTask
 *
 * 第 1 阶段字段映射说明：
 *   - dueDate → `${log.date}T00:00:00.000Z`（用 review 当日作为"今天到期"近似）
 *   - stability → undefined（ReviewLog 没有此字段；computePriority 视为易忘，
 *     第 2 阶段可查 ReviewCard.stability 填充）
 *   - title → `复习 - 卡片 ${cardId}`（第 2 阶段查 ReviewCard.front 替换为题面）
 */
function reviewLogToTask(log: ReviewLog, date: string, createdAt: string): StudyTask {
  const dueDate = `${log.date}T00:00:00.000Z`;
  return {
    id: nanoid(),
    date,
    type: "review",
    cardId: log.cardId,
    dueDate,
    title: `复习 - 卡片 ${log.cardId}`,
    priority: 0,
    reason: "",
    status: "todo",
    createdAt,
  };
}

/**
 * 构建今日学习队列
 *
 * 流程：
 *   1. 服务端 → 返回空数组（避免 SSR 期间访问 IndexedDB）
 *   2. 并行读 IndexedDB（LearnLog + ReviewLog），任一失败 → 返回空数组
 *   3. 过滤今日记录，转换为 StudyTask[]
 *   4. 用 explainPriority 计算每个任务的 priority 和 reason
 *   5. 按 priority 降序排序后返回
 *
 * @returns 排序后的 StudyTask[]（priority 大的在前）
 */
export async function buildStudyQueue(
  options?: BuildStudyQueueOptions,
): Promise<StudyTask[]> {
  // 1. 服务端渲染时返回空数组（listItems 内部也有同样检查，这里显式做避免不必要的工作）
  if (typeof window === "undefined") return [];

  const date = options?.date ?? chinaDateNow();
  const ctx = options?.context ?? DEFAULT_CONTEXT;
  const now = new Date();
  const createdAt = nowISO();

  // 2. 并行读 IndexedDB，任一失败 → 返回空数组（不抛错，不阻塞 UI）
  let learnLogs: LearnLog[] = [];
  let reviewLogs: ReviewLog[] = [];
  try {
    [learnLogs, reviewLogs] = await Promise.all([
      listItems<LearnLog>(KEY_PREFIXES.LEARN_LOG),
      listItems<ReviewLog>(KEY_PREFIXES.REVIEW_LOG),
    ]);
  } catch {
    return [];
  }

  // 3. 过滤今日记录并转换
  const tasks: StudyTask[] = [];

  for (const log of learnLogs) {
    // 第 1 阶段只处理 type === "learn" 的"开始学习"动作；
    // learn_complete / focus_session / question_view 等不计入队列
    if (log.type !== "learn") continue;
    if (log.date !== date) continue;
    tasks.push(learnLogToTask(log, date, createdAt));
  }

  for (const log of reviewLogs) {
    if (log.date !== date) continue;
    tasks.push(reviewLogToTask(log, date, createdAt));
  }

  // 4. 计算优先级 + 填充 reason
  for (const task of tasks) {
    const { priority, reasons } = explainPriority(task, ctx, now);
    task.priority = priority;
    task.reason = reasons.join("；");
  }

  // 5. 降序排序（priority 大的在前）
  tasks.sort((a, b) => b.priority - a.priority);

  return tasks;
}
