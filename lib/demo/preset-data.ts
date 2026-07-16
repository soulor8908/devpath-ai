// lib/demo/preset-data.ts
// Demo 站预置数据：首次访问（IndexedDB 无任何 plan）时自动注入示例数据
// 让新用户立刻看到"有内容"的产品状态，而非空荡荡的空白页
//
// 设计（乔布斯视角）：
//   第一印象决定留存。新用户打开看到一个空列表 = "这产品没东西" → 流失。
//   注入一份完整的前端学习计划 + 几张复习卡 + 两天学习日志，
//   用户立刻能体验"知识树→面试题→复习→打卡"完整闭环，理解产品价值。
//   用户创建自己的第一个真实计划时，温和提示清除示例数据。
//
// 幂等性：用固定 ID（demo-frontend-plan / demo-card-N / demo-log-N），
//   重复调用 injectDemoData 只会覆盖不会叠加。

import { getItem, setItem, listItems, delItem } from "@/lib/storage/db";
import { savePlanSummary, deletePlanSummary } from "@/lib/plan-summary";
import { createCard } from "@/lib/fsrs";
import { FRONTEND_PRESET } from "@/lib/presets/frontend";
import { KEY_PREFIXES } from "@/lib/types";
import type { LearningPlan, ReviewCard, LearnLog } from "@/lib/types";
import { chinaDateNow, chinaDateShift } from "@/lib/time";

/** Demo 计划固定 ID（幂等：重复注入只覆盖不叠加） */
const DEMO_PLAN_ID = "demo-frontend-plan";

/**
 * 检测是否需要注入 Demo 数据
 * 规则：IndexedDB 中没有任何 "plan:" key 时返回 true
 */
export async function shouldInjectDemo(): Promise<boolean> {
  if (typeof window === "undefined") return false;
  // 直接检查 demo plan 是否已存在（快速路径）
  const existing = await getItem<LearningPlan>(KEY_PREFIXES.PLAN + DEMO_PLAN_ID);
  if (existing) return false;
  // 检查是否有任意 plan（用户可能已创建自己的计划）
  const plans = await listItems<LearningPlan>(KEY_PREFIXES.PLAN);
  return plans.length === 0;
}

/**
 * 注入 Demo 数据：
 * 1. frontend preset 计划（标记 isDemo: true）
 * 2. 3 张 FSRS 卡片（关联该计划的 nodeId）
 * 3. 2 天 LearnLog（前 1 天和前 2 天，type=learn_complete）
 */
export async function injectDemoData(): Promise<void> {
  if (typeof window === "undefined") return;

  const now = new Date().toISOString();
  const today = chinaDateNow();

  // 1. Demo 计划（基于 frontend preset）
  const plan: LearningPlan = {
    id: DEMO_PLAN_ID,
    topic: FRONTEND_PRESET.topic,
    knowledgeTree: FRONTEND_PRESET.knowledgeTree,
    questions: FRONTEND_PRESET.questions,
    schedule: FRONTEND_PRESET.schedule,
    dailyMinutes: 30,
    maxNewPerDay: 1,
    fsrsMode: "standard",
    isDemo: true,
    createdAt: now,
    updatedAt: now,
  };
  await setItem(KEY_PREFIXES.PLAN + plan.id, plan);
  // 同步写入 summary（学习页列表用）
  await savePlanSummary(plan);

  // 2. 3 张 FSRS 卡片（取前 3 道面试题）
  const demoQuestions = FRONTEND_PRESET.questions.slice(0, 3);
  for (let i = 0; i < demoQuestions.length; i++) {
    const q = demoQuestions[i];
    const card = createCard(
      plan.id,
      q.nodeId,
      q.id,
      q.question,
      q.answer,
      "standard",
    );
    // 固定 ID 保证幂等
    card.id = `demo-card-${i + 1}`;
    await setItem(KEY_PREFIXES.CARD + card.id, card);
  }

  // 3. 2 天 LearnLog（前 2 天和前 1 天，type=learn_complete）
  const logs: LearnLog[] = [
    {
      id: "demo-log-1",
      planId: plan.id,
      nodeId: demoQuestions[0]?.nodeId,
      questionId: demoQuestions[0]?.id,
      date: chinaDateShift(today, -2),
      type: "learn_complete",
    },
    {
      id: "demo-log-2",
      planId: plan.id,
      nodeId: demoQuestions[1]?.nodeId,
      questionId: demoQuestions[1]?.id,
      date: chinaDateShift(today, -1),
      type: "learn_complete",
    },
  ];
  for (const log of logs) {
    await setItem(KEY_PREFIXES.LEARN_LOG + log.id, log);
  }
}

/**
 * 清除所有 Demo 数据：
 * - 删除所有 isDemo=true 的计划 + 对应 summary
 * - 删除关联这些计划的卡片
 * - 删除关联这些计划的 LearnLog
 */
export async function clearDemoData(): Promise<void> {
  if (typeof window === "undefined") return;

  // 1. 找出所有 demo 计划
  const plans = await listItems<LearningPlan>(KEY_PREFIXES.PLAN);
  const demoPlans = plans.filter((p) => p.isDemo === true);
  const demoPlanIds = new Set(demoPlans.map((p) => p.id));

  // 2. 删除 demo 计划 + summary
  for (const plan of demoPlans) {
    await delItem(KEY_PREFIXES.PLAN + plan.id);
    await deletePlanSummary(plan.id);
  }

  // 3. 删除关联 demo 计划的卡片
  const cards = await listItems<ReviewCard>(KEY_PREFIXES.CARD);
  for (const card of cards) {
    if (demoPlanIds.has(card.planId)) {
      await delItem(KEY_PREFIXES.CARD + card.id);
    }
  }

  // 4. 删除关联 demo 计划的 LearnLog
  const logs = await listItems<LearnLog>(KEY_PREFIXES.LEARN_LOG);
  for (const log of logs) {
    if (demoPlanIds.has(log.planId)) {
      await delItem(KEY_PREFIXES.LEARN_LOG + log.id);
    }
  }
}

/**
 * 检测是否存在 Demo 数据（用于创建真实计划后提示清除）
 */
export async function hasDemoData(): Promise<boolean> {
  if (typeof window === "undefined") return false;
  const plans = await listItems<LearningPlan>(KEY_PREFIXES.PLAN);
  return plans.some((p) => p.isDemo === true);
}
