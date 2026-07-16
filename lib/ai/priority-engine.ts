// lib/ai/priority-engine.ts
// 优先级引擎：基于四维信号为学习任务打分排序
//
// 公式：priority_score = 0.30*deadline_urgency + 0.30*fsrs_urgency
//                            + 0.20*skill_gap + 0.20*energy_fit
//
// 设计（卡帕西视角）：
//   - 每个权重函数都是纯函数（除缓存 IO），可独立单测
//   - 所有权重返回 [0,1]，主公式线性加权，结果也在 [0,1]
//   - 冷启动友好：energy 未记录时用 preferredSlots 兜底，无 deadline 时该项为 0
//   - 优先级缓存当日有效，避免每次首页渲染都重算

import { getItem, setItem } from "../storage/db";
import { KEY_PREFIXES, type LearningPlan, type MistakeRecord, type ReviewCard, type ScheduleItem } from "../types";
import { getDueCards } from "../fsrs";

/** 排序后的任务条目 */
export interface RankedTask {
  task: ScheduleItem;
  score: number;
  planId: string;
  topic: string;
}

/** computePriorityScore 的上下文 */
export interface PriorityContext {
  plan: LearningPlan;
  cards: ReviewCard[];
  mistakes: MistakeRecord[];
  energy: number | null;
  preferredSlots: string[];
  now: Date;
}

/** rankTasks 的上下文（跨多计划） */
export interface RankContext {
  plans: LearningPlan[];
  cards: ReviewCard[];
  mistakes: MistakeRecord[];
  energy: number | null;
  preferredSlots: string[];
  now: Date;
}

// ============ 四维权重（每个返回 0-1） ============

/**
 * 截止紧迫度
 * - 有 deadline：按距离天数反比（<1天=1, <7天=0.7, <30天=0.4, >30天=0.1）
 * - 无 deadline：0
 * - 已过期（daysUntil <= 0）：1
 */
export function computeDeadlineUrgency(plan: LearningPlan, now: Date): number {
  if (!plan.deadline) return 0;
  const deadlineMs = new Date(plan.deadline).getTime();
  if (Number.isNaN(deadlineMs)) return 0;
  const daysUntil = (deadlineMs - now.getTime()) / (24 * 60 * 60 * 1000);
  if (daysUntil <= 1) return 1;
  if (daysUntil < 7) return 0.7;
  if (daysUntil < 30) return 0.4;
  return 0.1;
}

/**
 * FSRS 复习紧迫度（per-plan）
 * - 该计划下到期卡片数 / max(1, 该计划总卡片数)
 * - 从传入 cards 中按 planId 过滤
 */
export function computeFsrsUrgency(plan: LearningPlan, cards: ReviewCard[], now: Date): number {
  const planCards = cards.filter((c) => c.planId === plan.id);
  const total = planCards.length;
  if (total === 0) return 0;
  const due = getDueCards(planCards, now).length;
  const score = due / Math.max(1, total);
  return Math.min(1, Math.max(0, score));
}

/**
 * 技能缺口（per-node）
 * - 取该 nodeId 的 MistakeRecord.wrongCount + ReviewCard.lapses
 * - 归一化：wrongCount*0.3 + lapses*0.1，上限 1
 * - 仅统计未解决的错题
 */
export function computeSkillGap(
  nodeId: string,
  mistakes: MistakeRecord[],
  cards: ReviewCard[],
): number {
  const wrongCount = mistakes
    .filter((m) => m.nodeId === nodeId && !m.resolved)
    .reduce((sum, m) => sum + m.wrongCount, 0);
  const lapses = cards
    .filter((c) => c.nodeId === nodeId)
    .reduce((sum, c) => sum + c.lapses, 0);
  const score = wrongCount * 0.3 + lapses * 0.1;
  return Math.min(1, Math.max(0, score));
}

/**
 * 能量契合度
 * - energy 为 null（冷启动）：当前是否在偏好时段 → 是=1, 否=0.5
 * - energy >= 4 → 1
 * - energy === 3 → 0.7
 * - energy <= 2 → 0.3
 */
export function computeEnergyFit(
  energy: number | null,
  preferredSlots: string[],
  currentTime: Date,
): number {
  if (energy === null || energy === undefined) {
    return isCurrentInPreferredSlot(preferredSlots, currentTime) ? 1 : 0.5;
  }
  if (energy >= 4) return 1;
  if (energy === 3) return 0.7;
  return 0.3;
}

/**
 * 主公式：四维加权
 * priority_score = 0.30*deadline + 0.30*fsrs + 0.20*skill + 0.20*energy
 */
export function computePriorityScore(task: ScheduleItem, ctx: PriorityContext): number {
  const deadline = computeDeadlineUrgency(ctx.plan, ctx.now);
  const fsrs = computeFsrsUrgency(ctx.plan, ctx.cards, ctx.now);
  const skill = computeSkillGap(task.nodeId, ctx.mistakes, ctx.cards);
  const energy = computeEnergyFit(ctx.energy, ctx.preferredSlots, ctx.now);
  const score = 0.3 * deadline + 0.3 * fsrs + 0.2 * skill + 0.2 * energy;
  return Math.min(1, Math.max(0, score));
}

/**
 * 批量排序：分数高的在前
 * - 自动匹配每个 task 所属的 plan（按 day+nodeId+type+cardId 内容匹配）
 * - 未匹配到任何 plan 的 task 被跳过
 */
export function rankTasks(tasks: ScheduleItem[], ctx: RankContext): RankedTask[] {
  const results: RankedTask[] = [];
  for (const task of tasks) {
    const plan = findPlanForTask(task, ctx.plans);
    if (!plan) continue;
    const score = computePriorityScore(task, {
      plan,
      cards: ctx.cards,
      mistakes: ctx.mistakes,
      energy: ctx.energy,
      preferredSlots: ctx.preferredSlots,
      now: ctx.now,
    });
    results.push({ task, score, planId: plan.id, topic: plan.topic });
  }
  return results.sort((a, b) => b.score - a.score);
}

// ============ 优先级缓存（当日有效） ============

/** 读取当日优先级缓存；不存在返回 null */
export async function getCachedPriority(date: string): Promise<RankedTask[] | null> {
  const cached = await getItem<RankedTask[]>(KEY_PREFIXES.PRIORITY_CACHE + date);
  return cached ?? null;
}

/** 写入当日优先级缓存 */
export async function setCachedPriority(date: string, tasks: RankedTask[]): Promise<void> {
  await setItem(KEY_PREFIXES.PRIORITY_CACHE + date, tasks);
}

// ============ 内部工具 ============

/**
 * 判断当前时间是否落在偏好时段内
 * 偏好时段格式如 "06:00-06:59"，按 HH:MM 解析为分钟数后做区间包含判断
 */
function isCurrentInPreferredSlot(preferredSlots: string[], now: Date): boolean {
  if (!preferredSlots || preferredSlots.length === 0) return false;
  const curMin = now.getHours() * 60 + now.getMinutes();
  for (const slot of preferredSlots) {
    const range = parseSlot(slot);
    if (!range) continue;
    if (curMin >= range.start && curMin <= range.end) return true;
  }
  return false;
}

function parseSlot(slot: string): { start: number; end: number } | null {
  const parts = slot.split("-");
  if (parts.length !== 2) return null;
  const start = parseHHMM(parts[0]);
  const end = parseHHMM(parts[1]);
  if (start === null || end === null) return null;
  return { start, end };
}

function parseHHMM(s: string): number | null {
  const m = s.trim().match(/^(\d{1,2}):(\d{2})$/);
  if (!m) return null;
  const h = Number(m[1]);
  const min = Number(m[2]);
  if (h < 0 || h > 23 || min < 0 || min > 59) return null;
  return h * 60 + min;
}

/**
 * 在 plans 中找到 task 所属的 plan
 * 匹配键：day + nodeId + type + cardId（内容匹配，避免引用依赖）
 */
function findPlanForTask(task: ScheduleItem, plans: LearningPlan[]): LearningPlan | undefined {
  return plans.find((p) =>
    p.schedule.some(
      (s) =>
        s.day === task.day &&
        s.nodeId === task.nodeId &&
        s.type === task.type &&
        s.cardId === task.cardId,
    ),
  );
}
