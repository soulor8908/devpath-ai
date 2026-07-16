// lib/ai/plan-feasibility.ts
// 计划可行性评分：评估 dailyMinutes / maxNewPerDay 是否贴合用户实际投入能力
//
// 信号优先级：
//   1. UserProfile.averageSessionMinutes（历史平均专注时长，最直接）
//   2. TrainedModel 预测（用中性能量+心情+计划时长预测实际时长）
//   3. 兜底：plan.dailyMinutes * 0.7（冷启动 70% 达成假设）
//
// confidence = min(1, predicted / plan.dailyMinutes)
// confidence < 0.5 → feasible=false + 调 suggestDowngrade 给出具体降级参数

import { predictActualMinutes, type TrainedModel } from "../energy-regression";
import type { DowngradePlan, FeasibilityScore, UserProfile } from "../types";

/** 可行性评估时假设的中性能量/心情（无今日状态时用） */
const ASSUMED_ENERGY = 3;
const ASSUMED_MOOD = "neutral";
/** 冷启动达成率（无画像无模型时假设用户能完成 70% 计划时长） */
const COLD_START_RATIO = 0.7;
/** 可行性阈值 */
const FEASIBILITY_THRESHOLD = 0.5;

/**
 * 带兜底的预测实际学习时长
 * - model 为 null：返回 availableMinutes * 0.7 + isEstimate=true（冷启动估算）
 * - model 存在：调 predictActualMinutes + isEstimate=false
 */
export function predictActualMinutesWithFallback(
  model: TrainedModel | null,
  energy: number,
  mood: string,
  availableMinutes: number,
): { predicted: number; isEstimate: boolean } {
  if (!model) {
    return {
      predicted: Math.max(0, availableMinutes * COLD_START_RATIO),
      isEstimate: true,
    };
  }
  return {
    predicted: predictActualMinutes(model, energy, mood, availableMinutes),
    isEstimate: false,
  };
}

/**
 * 主逻辑：评估计划可行性
 * - 用 profile.averageSessionMinutes 或模型预测每日实际可投入时长
 * - 对比 plan.dailyMinutes → confidence（实际/要求，>1 则 confidence=1）
 * - confidence < 0.5 → feasible=false + suggestDowngrade
 */
export async function scoreFeasibility(
  plan: { dailyMinutes: number; maxNewPerDay: number },
  profile: UserProfile | null,
  model: TrainedModel | null,
): Promise<FeasibilityScore> {
  const risks: string[] = [];
  const suggestions: string[] = [];

  const predicted = predictDailyMinutes(plan, profile, model);

  // confidence = 实际/要求，>1 钳制为 1
  const confidence =
    plan.dailyMinutes > 0
      ? Math.min(1, predicted / plan.dailyMinutes)
      : 1;

  const feasible = confidence >= FEASIBILITY_THRESHOLD;

  if (predicted < plan.dailyMinutes) {
    risks.push(
      `每日要求 ${plan.dailyMinutes} 分钟，但预计实际仅能投入 ${Math.round(predicted)} 分钟`,
    );
  }

  if (!feasible) {
    suggestions.push("建议降低每日学习时长或减少每日新学节点数，使计划更贴合实际投入");
  } else if (confidence < 1) {
    suggestions.push("计划基本可行，但留有一定余量，可适当增加机动复习时间");
  }

  const result: FeasibilityScore = {
    feasible,
    confidence,
    risks,
    suggestions,
  };

  if (!feasible) {
    result.downgradePlan = suggestDowngrade(plan, predicted);
  }

  return result;
}

/**
 * 降级建议：按比例缩减每周时长与每日新学量
 * - reduceHoursPerWeek：每周应减少的小时数（向上取整）
 * - reduceNewPerDay：每日应减少的新学节点数
 */
export function suggestDowngrade(
  plan: { dailyMinutes: number; maxNewPerDay: number },
  predicted: number,
): DowngradePlan {
  if (plan.dailyMinutes <= 0) return {};

  const ratio = Math.max(0, Math.min(1, predicted / plan.dailyMinutes));
  const result: DowngradePlan = {};

  // 每周时长差（分钟 → 小时，四舍五入；无缺口则不缩减）
  const weeklyShortfallMin = Math.max(0, (plan.dailyMinutes - predicted) * 7);
  if (weeklyShortfallMin > 0) {
    const reduceHoursPerWeek = Math.max(1, Math.round(weeklyShortfallMin / 60));
    result.reduceHoursPerWeek = reduceHoursPerWeek;
  }

  // 每日新学量按比例缩减（至少保留 1 个）
  const suggestedNew = Math.max(1, Math.floor(plan.maxNewPerDay * ratio));
  const reduceNewPerDay = Math.max(0, plan.maxNewPerDay - suggestedNew);
  if (reduceNewPerDay > 0) result.reduceNewPerDay = reduceNewPerDay;

  return result;
}

// ============ 内部工具 ============

/**
 * 预测每日实际可投入时长（分钟）
 * 优先级：profile.averageSessionMinutes > 模型预测 > 0.7 兜底
 */
function predictDailyMinutes(
  plan: { dailyMinutes: number },
  profile: UserProfile | null,
  model: TrainedModel | null,
): number {
  // 1. 历史平均专注时长（最直接的实际投入信号）
  if (profile && profile.averageSessionMinutes && profile.averageSessionMinutes > 0) {
    return profile.averageSessionMinutes;
  }
  // 2. 模型预测（中性能量/心情 + 计划时长作为 availableMinutes）
  const { predicted } = predictActualMinutesWithFallback(
    model,
    ASSUMED_ENERGY,
    ASSUMED_MOOD,
    plan.dailyMinutes,
  );
  return predicted;
}
