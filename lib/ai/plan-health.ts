// lib/ai/plan-health.ts
// 计划健康检查：4 条规则扫描异常，产出 HealthAlert[]
//
// 规则：
//   1. 逾期任务 > 3（schedule 中 type=learn 且 day < 当前 day 且 !completed）
//   2. 近 2 周完成率 < 50%（completed / total）
//   3. 能量趋势连续 3 天下降（从 DailyStatus 读最近 4 天 energy）
//   4. FSRS 到期卡片积压 > 10（用 getDueCards）
//
// 当日只跑一次：shouldRunHealthCheck 用 IndexedDB key "health_check:<date>" 标记

import { nanoid } from "nanoid";
import { getItem, setItem, listItems } from "../storage/db";
import { KEY_PREFIXES, type DailyStatus, type HealthAlert, type LearningPlan, type ReviewCard } from "../types";
import { getDueCards } from "../fsrs";
import { chinaDateNow, chinaDateShift } from "../time";

/** 健康检查当次执行标记的 IndexedDB key 前缀 */
const HEALTH_CHECK_KEY_PREFIX = "health_check:";

/** 逾期任务阈值 */
const OVERDUE_THRESHOLD = 3;
/** 完成率阈值 */
const COMPLETION_RATE_THRESHOLD = 0.5;
/** 能量下降所需连续天数（=数据点数-1） */
const ENERGY_DECLINE_DAYS = 3;
/** 能量下降所需数据点数 */
const ENERGY_WINDOW_DAYS = ENERGY_DECLINE_DAYS + 1;
/** FSRS 积压阈值 */
const FSRS_BACKLOG_THRESHOLD = 10;

/**
 * 判断当日是否应该执行健康检查
 * - 当日已执行过 → false（用 "health_check:<date>" 标记幂等）
 * - 未执行 → 写入标记并返回 true
 */
export async function shouldRunHealthCheck(date: string): Promise<boolean> {
  const key = HEALTH_CHECK_KEY_PREFIX + date;
  const existing = await getItem<string>(key);
  if (existing) return false;
  await setItem(key, new Date().toISOString());
  return true;
}

/**
 * 执行全部 4 条健康检查规则
 * - 任何一条规则命中即产出一条 HealthAlert
 * - 不抛错；IO 异常吞掉返回空数组（健康检查不应阻塞主流程）
 */
export async function planHealthCheck(): Promise<HealthAlert[]> {
  try {
    const [plans, cards, statuses] = await Promise.all([
      listItems<LearningPlan>(KEY_PREFIXES.PLAN),
      listItems<ReviewCard>(KEY_PREFIXES.CARD),
      listItems<DailyStatus>(KEY_PREFIXES.STATUS),
    ]);

    const now = new Date();
    const activePlans = plans.filter((p) => !p.frozen);

    const alerts: HealthAlert[] = [];
    const overdue = checkOverdueTasks(activePlans, now);
    if (overdue) alerts.push(overdue);
    const completion = checkCompletionRate(activePlans, now);
    if (completion) alerts.push(completion);
    const energy = checkEnergyDecline(statuses, now);
    if (energy) alerts.push(energy);
    const backlog = checkFsrsBacklog(cards, now);
    if (backlog) alerts.push(backlog);

    return alerts;
  } catch {
    // 健康检查失败不应影响首页加载
    return [];
  }
}

// ============ 规则实现 ============

/** 规则 1：逾期学习任务数 > 3 */
function checkOverdueTasks(plans: LearningPlan[], now: Date): HealthAlert | null {
  let overdueCount = 0;
  for (const plan of plans) {
    const currentDay = computePlanCurrentDay(plan);
    for (const item of plan.schedule) {
      if (item.type === "learn" && !item.completed && item.day < currentDay) {
        overdueCount++;
      }
    }
  }
  if (overdueCount <= OVERDUE_THRESHOLD) return null;
  return {
    id: nanoid(),
    type: "overdue_tasks",
    severity: "warning",
    title: "逾期学习任务较多",
    description: `当前有 ${overdueCount} 个学习任务已逾期未完成，可能拖慢整体进度。`,
    suggestedAction: "建议重新排优先级，或调整计划以追赶进度",
    createdAt: now.toISOString(),
  };
}

/** 规则 2：完成率 < 50% */
function checkCompletionRate(plans: LearningPlan[], now: Date): HealthAlert | null {
  let total = 0;
  let completed = 0;
  for (const plan of plans) {
    for (const item of plan.schedule) {
      total++;
      if (item.completed) completed++;
    }
  }
  if (total === 0) return null;
  const rate = completed / total;
  if (rate >= COMPLETION_RATE_THRESHOLD) return null;
  return {
    id: nanoid(),
    type: "low_completion_rate",
    severity: "warning",
    title: "近期完成率偏低",
    description: `近 2 周整体完成率 ${Math.round(rate * 100)}%（${completed}/${total}），低于 50% 阈值。`,
    suggestedAction: "建议降低每日新学量，或调整计划节奏使其更贴合实际投入时长",
    createdAt: now.toISOString(),
  };
}

/** 规则 3：能量趋势连续 3 天下降（需要最近 4 天数据） */
function checkEnergyDecline(statuses: DailyStatus[], now: Date): HealthAlert | null {
  const today = chinaDateNow();
  const energies: number[] = [];
  for (let i = ENERGY_WINDOW_DAYS - 1; i >= 0; i--) {
    const date = chinaDateShift(today, -i);
    const s = statuses.find((x) => x.date === date);
    if (!s) return null; // 数据不足，不告警
    energies.push(s.energy);
  }
  // 连续 3 天下降 = energies[0] > energies[1] > energies[2] > energies[3]
  let declining = true;
  for (let i = 1; i < energies.length; i++) {
    if (energies[i] >= energies[i - 1]) {
      declining = false;
      break;
    }
  }
  if (!declining) return null;
  return {
    id: nanoid(),
    type: "energy_declining",
    severity: "critical",
    title: "能量持续下降",
    description: `最近 ${ENERGY_WINDOW_DAYS} 天能量曲线持续走低（${energies.join("→")}），可能存在过度疲劳。`,
    suggestedAction: "建议今日减负，只做复习不学新内容，并关注睡眠与休息",
    createdAt: now.toISOString(),
  };
}

/** 规则 4：FSRS 到期卡片积压 > 10 */
function checkFsrsBacklog(cards: ReviewCard[], now: Date): HealthAlert | null {
  const due = getDueCards(cards, now);
  if (due.length <= FSRS_BACKLOG_THRESHOLD) return null;
  return {
    id: nanoid(),
    type: "fsrs_backlog",
    severity: "warning",
    title: "复习卡片积压",
    description: `当前有 ${due.length} 张到期卡片待复习，超过 ${FSRS_BACKLOG_THRESHOLD} 张阈值。`,
    suggestedAction: "建议优先清空到期复习，暂停学习新内容",
    createdAt: now.toISOString(),
  };
}

// ============ 内部工具 ============

/**
 * 计算计划的"当前 day"
 * - 第一个未完成的 learn 任务的 day
 * - 全部完成 → 最大 day + 1
 */
function computePlanCurrentDay(plan: LearningPlan): number {
  const firstIncomplete = plan.schedule.find((s) => s.type === "learn" && !s.completed);
  if (firstIncomplete) return firstIncomplete.day;
  const maxDay = plan.schedule.reduce((max, s) => Math.max(max, s.day), 0);
  return maxDay + 1;
}
