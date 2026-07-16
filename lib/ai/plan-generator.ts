// lib/ai/plan-generator.ts
// 精准计划生成：知识拆解 → 拓扑排序 → 每日分配 → 可行性评估
//
// 流程：
//   1. decomposeKnowledge(topic, prompt, ..., userProfile) 拆解知识树（画像感知）
//   2. topoSort + allocateDaily 排日程
//   3. scoreFeasibility 评估 dailyMinutes / maxNewPerDay 是否贴合用户实际投入
//   4. 构建 LearningPlan 对象返回

import { nanoid } from "nanoid";
import { decomposeKnowledge } from "./knowledge";
import { topoSort, allocateDaily } from "../schedule";
import { scoreFeasibility } from "./plan-feasibility";
import { getTrainedModel } from "../energy-regression";
import type { FeasibilityScore, LearningPlan, UserProfile } from "../types";

/** generateLearningPlan 入参 */
export interface GeneratePlanParams {
  topic: string;
  dailyMinutes: number;
  maxNewPerDay: number;
  prompt?: string;
  /** 计划周期（周），用于设置 deadline */
  durationWeeks?: number;
}

/**
 * 生成个性化学习计划
 * - 调 decomposeKnowledge（传入 userProfile 做画像感知拆解）
 * - topoSort + allocateDaily 排日程
 * - scoreFeasibility 评估可行性
 * - durationWeeks 提供时设置 deadline
 */
export async function generateLearningPlan(
  params: GeneratePlanParams,
  userProfile?: UserProfile,
): Promise<{ plan: LearningPlan; feasibility: FeasibilityScore }> {
  const now = new Date();
  const nowISO = now.toISOString();

  // 1. 知识拆解（画像感知：跳过已掌握节点、按水平调整难度）
  const nodes = await decomposeKnowledge(
    params.topic,
    params.prompt,
    undefined,
    undefined,
    userProfile,
  );

  // 2. 拓扑排序 + 每日分配
  const sorted = topoSort(nodes);
  const schedule = allocateDaily(sorted, params.dailyMinutes, params.maxNewPerDay);

  // 3. deadline（durationWeeks 提供时设置）
  const deadline =
    params.durationWeeks && params.durationWeeks > 0
      ? new Date(
          now.getTime() + params.durationWeeks * 7 * 24 * 60 * 60 * 1000,
        ).toISOString()
      : undefined;

  // 4. 构建 LearningPlan
  const plan: LearningPlan = {
    id: nanoid(),
    topic: params.topic,
    knowledgeTree: nodes,
    questions: [],
    schedule,
    dailyMinutes: params.dailyMinutes,
    maxNewPerDay: params.maxNewPerDay,
    fsrsMode: "standard",
    prompt: params.prompt,
    deadline,
    createdAt: nowISO,
    updatedAt: nowISO,
  };

  // 5. 可行性评估（用已训练模型 + 用户画像）
  const model = await getTrainedModel().catch(() => null);
  const feasibility = await scoreFeasibility(
    { dailyMinutes: plan.dailyMinutes, maxNewPerDay: plan.maxNewPerDay },
    userProfile ?? null,
    model,
  );

  return { plan, feasibility };
}
