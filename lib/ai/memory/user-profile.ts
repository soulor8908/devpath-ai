// lib/ai/memory/user-profile.ts
// 用户画像 CRUD：从 IndexedDB 读写 UserProfile（单例，key = KEY_PREFIXES.USER_PROFILE + "current"）
//
// 设计（卡帕西视角）：
//   - 单例存储：一个用户一份画像，key 固定，避免列表管理开销
//   - maybeBuildProfile 做"懒构建 + 24h TTL"：
//     首次访问无画像 → 构建；超过 24h → 自动刷新
//   - 写入时自动更新 updatedAt，保证增量同步能感知到变化
//   - P2 增量更新：高频维度（averageSessionMinutes）事件驱动即时刷新，
//     低频维度（skillLevel/preferredTimeSlots）保持 24h 批量重建

import { getItem, setItem, listItems } from "@/lib/storage/db";
import { KEY_PREFIXES, type UserProfile, type ReviewCard, type ReviewLog, type SkillLevel } from "@/lib/types";
import {
  buildUserProfile,
  computeAverageSessionMinutes,
  aggregateStabilityByNode,
  aggregateAccuracyByNode,
  inferSkillLevel,
} from "./profile-builder";
import { listEnergySamples } from "@/lib/energy-collector";

/** IndexedDB key：单例画像 */
const PROFILE_KEY = KEY_PREFIXES.USER_PROFILE + "current";

/** 24 小时毫秒数 */
const TWENTY_FOUR_HOURS_MS = 24 * 60 * 60 * 1000;

/**
 * 从 IndexedDB 读取用户画像
 * @returns 画像；不存在返回 null
 */
export async function getUserProfile(): Promise<UserProfile | null> {
  const profile = await getItem<UserProfile>(PROFILE_KEY);
  return profile ?? null;
}

/**
 * 写入用户画像到 IndexedDB
 * 自动更新 updatedAt
 */
export async function saveUserProfile(profile: UserProfile): Promise<void> {
  const stamped: UserProfile = {
    ...profile,
    updatedAt: new Date().toISOString(),
  };
  await setItem(PROFILE_KEY, stamped);
}

/**
 * 若画像不存在或 updatedAt 距今 > 24h，则重新构建并保存
 *
 * 调用时机：首页加载时（lib/home.ts useHomeData 后台触发）
 * 失败静默（不阻塞首页加载）
 */
export async function maybeBuildProfile(): Promise<void> {
  const existing = await getUserProfile();
  const needsBuild =
    !existing ||
    Date.now() - new Date(existing.updatedAt).getTime() > TWENTY_FOUR_HOURS_MS;
  if (!needsBuild) return;
  const profile = await buildUserProfile();
  await saveUserProfile(profile);
}

// ============ P2 事件驱动增量更新 ============

/**
 * 增量更新画像的单个字段（事件驱动，替代 24h 批量重建高频维度）。
 * - 仅更新指定字段 + updatedAt，不触发全量重建
 * - 若画像不存在则静默跳过（冷启动时由 maybeBuildProfile 兜底）
 *
 * 适用场景：番茄完成 → averageSessionMinutes 即时刷新
 * 不适用场景：skillLevel/preferredTimeSlots 等低频维度（保持 24h 批量重建）
 */
export async function updateProfileField<K extends keyof UserProfile>(
  field: K,
  value: UserProfile[K],
): Promise<void> {
  const existing = await getUserProfile();
  if (!existing) return; // 冷启动无画像，等 maybeBuildProfile 兜底
  await saveUserProfile({ ...existing, [field]: value });
}

/**
 * 事件驱动刷新 averageSessionMinutes（高频维度增量更新）。
 *
 * 番茄完成后调用——读取能量样本，重算均值，写回画像单字段。
 * 避免等 24h 批量重建才能反映今日最新专注时长。
 * 失败静默（不阻塞番茄完成流程）。
 */
export async function refreshAverageSessionMinutes(): Promise<void> {
  try {
    const existing = await getUserProfile();
    if (!existing) return; // 冷启动无画像，等 maybeBuildProfile 兜底
    const samples = await listEnergySamples();
    const newAverage = computeAverageSessionMinutes(samples);
    await updateProfileField("averageSessionMinutes", newAverage);
  } catch {
    // 增量更新失败不影响番茄完成主流程
  }
}

/**
 * 事件驱动刷新 accuracyByNode + skillLevel（中频维度增量更新）。
 *
 * 复习评分/错题记录后调用——读取 ReviewLog + ReviewCard，重算准确率与技能等级，写回画像。
 * 避免等 24h 批量重建才能反映最新复习表现。
 * 失败静默（不阻塞复习主流程）。
 *
 * 设计权衡（卡帕西视角）：
 *   - 本函数重算全量 accuracyByNode + skillLevel（非真增量）
 *   - 真增量需维护 per-node running counter，复杂度高且 ReviewLog 数据量小（< 1k 条）
 *   - 全量重算 < 10ms，性能够用；待数据量增长后再优化为真增量
 *
 * 调用时机：
 *   - 复习评分（app/review/page.tsx handleRate）→ ReviewLog 写入后
 *   - 错题记录（lib/mistake-book.ts recordMistake）→ MistakeRecord + 复习卡写入后
 */
export async function refreshAccuracyAndSkill(): Promise<void> {
  try {
    const existing = await getUserProfile();
    if (!existing) return; // 冷启动无画像，等 maybeBuildProfile 兜底
    const [cards, reviewLogs] = await Promise.all([
      listItems<ReviewCard>(KEY_PREFIXES.CARD),
      listItems<ReviewLog>(KEY_PREFIXES.REVIEW_LOG),
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
    await saveUserProfile({
      ...existing,
      accuracyByNode,
      skillLevel,
    });
  } catch {
    // 增量更新失败不影响复习主流程
  }
}
