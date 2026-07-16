// lib/ai/memory/profile-builder.ts
// 纯函数化的用户画像构建器
//
// 设计（卡帕西视角）：
//   - 聚合函数全部纯函数化（给定输入 → 确定输出），便于单测与复用
//   - buildUserProfile 主入口并行抓取 4 个数据源，1×RTT 完成
//   - skillLevel 双维度判定：FSRS stability（记忆强度）+ ReviewLog accuracy（准确率）
//   - 偏好时段从 LearnLog.timestamp 的小时分布推断（Asia/Shanghai 时区）

import { listItems } from "@/lib/storage/db";
import { KEY_PREFIXES, type ReviewCard, type ReviewLog, type LearnLog, type UserProfile, type SkillLevel } from "@/lib/types";
import { listEnergySamples, type EnergySample } from "@/lib/energy-collector";

// ============ 纯函数：聚合 ============

/**
 * 按 nodeId 聚合 ReviewCard 的 stability 均值
 * 纯函数：相同 cards 输入 → 相同输出
 */
export function aggregateStabilityByNode(cards: ReviewCard[]): Record<string, number> {
  const sums: Record<string, number> = {};
  const counts: Record<string, number> = {};
  for (const c of cards) {
    if (!c.nodeId) continue;
    sums[c.nodeId] = (sums[c.nodeId] ?? 0) + c.stability;
    counts[c.nodeId] = (counts[c.nodeId] ?? 0) + 1;
  }
  const result: Record<string, number> = {};
  for (const nodeId of Object.keys(sums)) {
    result[nodeId] = sums[nodeId] / counts[nodeId];
  }
  return result;
}

/**
 * 按 nodeId 聚合 ReviewLog 准确率
 * correct = rating 3|4 的数量，total = 全部
 *
 * 注意：ReviewLog 没有 nodeId 字段，需要通过 ReviewCard 关联：
 *   ReviewLog.cardId → ReviewCard.nodeId
 * 因此本函数需要额外接收 cards 参数用于映射（纯函数：相同输入 → 相同输出）
 */
export function aggregateAccuracyByNode(
  reviewLogs: ReviewLog[],
  cards: ReviewCard[],
): Record<string, { correct: number; total: number }> {
  const cardIdToNodeId = new Map<string, string>();
  for (const c of cards) {
    cardIdToNodeId.set(c.id, c.nodeId);
  }
  const result: Record<string, { correct: number; total: number }> = {};
  for (const log of reviewLogs) {
    const nodeId = cardIdToNodeId.get(log.cardId);
    if (!nodeId) continue; // 卡片已删除或不存在
    if (!result[nodeId]) result[nodeId] = { correct: 0, total: 0 };
    result[nodeId].total++;
    if (log.rating === 3 || log.rating === 4) result[nodeId].correct++;
  }
  return result;
}

// ============ 纯函数：推断 ============

/**
 * 根据 stability + accuracy 推断技能等级
 *
 * 规则：
 *   - stability > 21 且 accuracy > 85% → "advanced"
 *   - stability < 7 或 accuracy < 60% → "beginner"
 *   - 其他 → "intermediate"
 *   - accuracy 为 {correct:0, total:0}（无数据）→ "intermediate"
 */
export function inferSkillLevel(
  stability: number,
  accuracy: { correct: number; total: number },
): SkillLevel {
  const { correct, total } = accuracy;
  if (total === 0) return "intermediate";
  const ratio = correct / total;
  if (stability > 21 && ratio > 0.85) return "advanced";
  if (stability < 7 || ratio < 0.6) return "beginner";
  return "intermediate";
}

/**
 * 从 LearnLog.timestamp 推断偏好学习时段
 * 按小时聚合，返回出现次数 Top 3 的时段
 * 格式 "HH:00-HH:59"
 *
 * 时区：Asia/Shanghai（与 lib/time.ts 一致，不受运行环境影响）
 * 排序：按出现次数降序，同频按小时升序（保证确定性）
 */
export function inferPreferredTimeSlots(learnLogs: LearnLog[]): string[] {
  const hourCounts = new Map<number, number>();
  for (const log of learnLogs) {
    if (!log.timestamp) continue; // 旧数据无 timestamp，跳过
    const hour = getChinaHourFromISO(log.timestamp);
    if (hour === null) continue;
    hourCounts.set(hour, (hourCounts.get(hour) ?? 0) + 1);
  }
  const sorted = [...hourCounts.entries()].sort((a, b) => {
    if (b[1] !== a[1]) return b[1] - a[1]; // 次数降序
    return a[0] - b[0]; // 小时升序（同频确定性）
  });
  return sorted.slice(0, 3).map(([hour]) => {
    const h = String(hour).padStart(2, "0");
    return `${h}:00-${h}:59`;
  });
}

/**
 * 计算平均专注时长（分钟）
 * 返回 actualMinutes > 0 的样本的平均值，无样本返回 0
 */
export function computeAverageSessionMinutes(energySamples: EnergySample[]): number {
  const valid = energySamples.filter((s) => s.actualMinutes > 0);
  if (valid.length === 0) return 0;
  const sum = valid.reduce((acc, s) => acc + s.actualMinutes, 0);
  return Math.round(sum / valid.length);
}

// ============ 主入口 ============

/**
 * 构建用户画像
 * 并行抓取 ReviewCard / ReviewLog / LearnLog / EnergySample，调用纯函数组装
 * id 固定 "ai:profile"
 */
export async function buildUserProfile(): Promise<UserProfile> {
  const [cards, reviewLogs, learnLogs, energySamples] = await Promise.all([
    listItems<ReviewCard>(KEY_PREFIXES.CARD),
    listItems<ReviewLog>(KEY_PREFIXES.REVIEW_LOG),
    listItems<LearnLog>(KEY_PREFIXES.LEARN_LOG),
    listEnergySamples(),
  ]);

  const stabilityByNode = aggregateStabilityByNode(cards);
  const accuracyByNode = aggregateAccuracyByNode(reviewLogs, cards);

  // 对 stability 和 accuracy 的 nodeId 并集逐一推断技能等级
  const skillLevel: Record<string, SkillLevel> = {};
  const allNodeIds = new Set<string>([
    ...Object.keys(stabilityByNode),
    ...Object.keys(accuracyByNode),
  ]);
  for (const nodeId of allNodeIds) {
    const stability = stabilityByNode[nodeId] ?? 0;
    const accuracy = accuracyByNode[nodeId] ?? { correct: 0, total: 0 };
    skillLevel[nodeId] = inferSkillLevel(stability, accuracy);
  }

  const preferredTimeSlots = inferPreferredTimeSlots(learnLogs);
  const averageSessionMinutes = computeAverageSessionMinutes(energySamples);

  return {
    id: "ai:profile",
    skillLevel,
    accuracyByNode,
    preferredTimeSlots,
    averageSessionMinutes,
    goals: { short: [], mid: [], long: [] },
    updatedAt: new Date().toISOString(),
  };
}

// ============ 内部工具 ============

/**
 * 从 ISO 时间戳提取 Asia/Shanghai 时区的小时（0-23）
 * 失败返回 null
 */
function getChinaHourFromISO(iso: string): number | null {
  try {
    const parts = new Intl.DateTimeFormat("zh-CN", {
      timeZone: "Asia/Shanghai",
      hour: "2-digit",
      hour12: false,
    }).formatToParts(new Date(iso));
    const hourStr = parts.find((p) => p.type === "hour")?.value;
    if (!hourStr) return null;
    let hour = parseInt(hourStr, 10);
    if (isNaN(hour)) return null;
    if (hour === 24) hour = 0; // 某些 locale 把午夜返回为 24
    return hour;
  } catch {
    return null;
  }
}
