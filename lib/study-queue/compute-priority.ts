// lib/study-queue/compute-priority.ts
// 学习队列排序算法：综合 FSRS 紧迫度 + 能量 + 多巴胺 + 上一项类型
//
// 设计（卡帕西视角）：
//   - 纯函数：输入相同 → 输出相同，可独立单测，不依赖任何 IO
//   - 可解释：每条加分/扣分都附中文 reason，最终可在 UI 展示给用户
//     "为什么是这个顺序"，避免黑盒排序让用户困惑
//   - 可调权重：所有阈值/系数都是命名常量，调整一处即可全局生效
//   - 不引入 ML：规则优先，与项目"节奏引擎：规则优先，AI 兜底"一致
//
// 评分维度（每个维度都有可解释的"为什么"）：
//   1. review 基础分：FSRS 到期就该复习（50 分起步）+ 稳定性低易忘加分
//   2. new 基础分：新内容基础分低（20），避免抢占复习
//   3. 认知过载：连续 new 内容时降权（避免"学不进去"）
//   4. 能量补偿：低能量时优先做认知负担小的复习
//   5. 多巴胺补偿：高干扰日避免开新内容（容易分心）

import type { StudyTask, StudyQueueContext } from "./types";

/** 一天的毫秒数（用于计算过期天数） */
const DAY_MS = 24 * 60 * 60 * 1000;

/** 低能量阈值：energy <= 此值视为"低能量" */
const LOW_ENERGY_THRESHOLD = 2;

/** review 基础分上限 */
const REVIEW_BASE_CAP = 50;

/** 稳定性加分系数：stability 越低越易忘，加分越多 */
const STABILITY_BONUS_COEFF = 1.5;

/** 稳定性加分上限对应的 stability 值（21 天以上视为稳定，不再加分） */
const STABILITY_BONUS_MAX_DAYS = 21;

/** 新内容基础分 */
const NEW_BASE_SCORE = 20;

/** 连续 new 内容认知过载扣分 */
const CONSECUTIVE_NEW_PENALTY = 10;

/** 低能量补偿分 */
const LOW_ENERGY_BONUS = 15;

/** 高干扰日新内容扣分 */
const HIGH_DOPAMINE_NEW_PENALTY = 10;

/** 优先级上下限 */
const PRIORITY_MIN = 0;
const PRIORITY_MAX = 100;

/**
 * 计算复习任务的过期天数
 * - dueDate 在未来或今天稍后 → 0（还没过期或刚到期）
 * - dueDate 在 N 天前 → N
 *
 * 注意：用 floor 取整天数，避免 5 小时被算成 1 天。
 * 这是"过期天数"的语义而非"过期时长"——FSRS 算法也是按天调度。
 */
function computeOverdueDays(dueDate: string | undefined, now: Date): number {
  if (!dueDate) return 0;
  const dueMs = new Date(dueDate).getTime();
  if (Number.isNaN(dueMs)) return 0;
  const diffMs = now.getTime() - dueMs;
  if (diffMs <= 0) return 0;
  return Math.floor(diffMs / DAY_MS);
}

/** clamp 到 [min, max] */
function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n));
}

/**
 * 解释任务优先级：返回最终分数 + 原因数组
 *
 * @param task 学习任务
 * @param ctx 排序上下文（能量 / 多巴胺 / 上一项类型）
 * @param now 当前时间（可选，默认 new Date()；测试时可传固定时间保证确定性）
 *
 * @returns { priority: 0-100 整数, reasons: 中文原因数组 }
 */
export function explainPriority(
  task: StudyTask,
  ctx: StudyQueueContext,
  now: Date = new Date(),
): { priority: number; reasons: string[] } {
  const reasons: string[] = [];
  let score = 0;

  if (task.type === "review") {
    // 1a. FSRS 到期基础分：过期 0 天也有 50（FSRS 到期就该复习）
    const overdueDays = computeOverdueDays(task.dueDate, now);
    const baseScore = Math.min(REVIEW_BASE_CAP, (overdueDays + 5) * 10);
    score += baseScore;
    if (overdueDays > 0) {
      reasons.push(`已过期 ${overdueDays} 天，紧迫度提升`);
    } else {
      reasons.push("FSRS 到期，基础分 50");
    }

    // 1b. 稳定性低加分（易忘）：stability 越低越紧迫
    // 21 天以上视为稳定，不再加分；0 天 → 加 31.5
    const stability = task.stability ?? 0;
    const stabilityBonus =
      (STABILITY_BONUS_MAX_DAYS - Math.min(STABILITY_BONUS_MAX_DAYS, stability)) *
      STABILITY_BONUS_COEFF;
    if (stabilityBonus > 0) {
      score += stabilityBonus;
      reasons.push(`稳定性低（${stability} 天），易忘加分 ${stabilityBonus}`);
    }
  } else {
    // 2a. 新内容基础分：低于 review 基础分，避免抢占复习
    score += NEW_BASE_SCORE;
    reasons.push(`新内容基础分 ${NEW_BASE_SCORE}`);

    // 2b. 连续新内容认知过载：上一项也是 new 时降权
    if (ctx.lastTaskType === "new") {
      score -= CONSECUTIVE_NEW_PENALTY;
      reasons.push(`连续新内容，认知过载降权 ${CONSECUTIVE_NEW_PENALTY}`);
    }
  }

  // 3. 能量补偿：低能量时优先做复习（认知负担小），避免开新内容
  // 防御性检查：energy 可能 undefined（旧数据/未记录），按正常能量处理
  const energy = ctx.energy;
  if (typeof energy === "number" && energy <= LOW_ENERGY_THRESHOLD) {
    if (task.type === "review") {
      score += LOW_ENERGY_BONUS;
      reasons.push(`低能量优先复习，加分 ${LOW_ENERGY_BONUS}`);
    } else {
      score -= LOW_ENERGY_BONUS;
      reasons.push(`低能量避免新内容，扣分 ${LOW_ENERGY_BONUS}`);
    }
  }

  // 4. 多巴胺补偿：高干扰日避免开新内容（容易分心）
  // dopamine 可能 undefined（旧数据），按"无干扰"处理
  if (
    ctx.dopamine !== undefined &&
    ctx.dopamine !== "无" &&
    task.type === "new"
  ) {
    score -= HIGH_DOPAMINE_NEW_PENALTY;
    reasons.push(`高干扰日避免新内容，扣分 ${HIGH_DOPAMINE_NEW_PENALTY}`);
  }

  // 5. clamp + round
  const priority = Math.round(clamp(score, PRIORITY_MIN, PRIORITY_MAX));
  return { priority, reasons };
}

/**
 * 计算任务优先级（0-100 整数）
 *
 * explainPriority 的简捷封装：仅返回数字分数。
 * 如需展示原因给用户，请直接调 explainPriority 拿 reasons 数组。
 *
 * @param task 学习任务
 * @param ctx 排序上下文
 * @param now 当前时间（可选，测试时可传固定时间）
 */
export function computePriority(
  task: StudyTask,
  ctx: StudyQueueContext,
  now: Date = new Date(),
): number {
  return explainPriority(task, ctx, now).priority;
}
