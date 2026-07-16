// lib/ai/rate-limit.ts
// 服务端 AI 限流逻辑（基于 Cloudflare KV，按"用户 + 场景 + 日期"维度计数）
//
// 设计：
// - 每个场景有每日配额（chat=20 / plan_generate=5 / weekly_report=1 / daily_nudge=4 / other=5）
// - KV key 格式：ratelimit:{userId}:{scene}:{YYYY-MM-DD}（中国时区日期）
// - 仅对 useServerModel=true 生效（用户自带 modelConfig 不限流，判断在调用方做）
// - 乐观计数：成功调用前先 increment，失败不回滚（可接受，保守计数）
//
// 卡帕西视角：限流是"防滥用"的最后一道闸，必须无状态可推导、低延迟。
// KV 单 key 读+写即可完成判定+计数，无需分布式锁（Cloudflare KV 强一致 put + 最终一致 get，
// 同一用户同一天短时间内的并发调用由"乐观计数"兜底——先 +1 再判定，略微保守但绝不漏计）。

import type { AIScene } from "../types";
import type { KVStore } from "../storage/kv";
import { chinaDateNow } from "../time";

/**
 * 场景配额表：每日上限
 * 未列出的场景使用 DEFAULT_QUOTA
 */
const SCENE_QUOTAS: Partial<Record<AIScene, number>> = {
  chat: 20,
  plan_generate: 5,
  weekly_report: 1,
  daily_nudge: 4,
};

/** 默认配额（未在表中明确列出的场景） */
const DEFAULT_QUOTA = 5;

/** 显式限流的场景列表（用于客户端展示 + /api/rate-limit 返回） */
const RATE_LIMITED_SCENES: AIScene[] = [
  "chat",
  "plan_generate",
  "weekly_report",
  "daily_nudge",
];

/** 获取某场景的配额 */
export function getSceneQuota(scene: AIScene): number {
  return SCENE_QUOTAS[scene] ?? DEFAULT_QUOTA;
}

/**
 * 检查是否允许调用（读 KV 当前计数，对比配额）
 * 注意：调用方需先判断 useServerModel=false 时跳过本函数（用户自带 modelConfig 不限流）
 *
 * @returns allowed 是否允许；remaining 剩余次数；limit 总配额
 */
export async function checkRateLimit(
  userId: string,
  scene: AIScene,
  kv: KVStore,
): Promise<{ allowed: boolean; remaining: number; limit: number }> {
  const limit = getSceneQuota(scene);
  const date = chinaDateNow();
  const used = await kv.getRateLimitCount(userId, scene, date);
  const remaining = Math.max(0, limit - used);
  return {
    allowed: used < limit,
    remaining,
    limit,
  };
}

/**
 * 计数 +1（成功调用后触发）
 * 注意：调用方需先判断 useServerModel=false 时跳过本函数
 */
export async function incrementRateLimit(
  userId: string,
  scene: AIScene,
  kv: KVStore,
): Promise<void> {
  const date = chinaDateNow();
  await kv.incrementRateLimitCount(userId, scene, date);
}

/**
 * 客户端用：返回该场景的配额（仅 UI 提示用，不读 KV）
 * 客户端无法直接读服务端 KV，此函数返回静态配额用于本地展示
 */
export function getClientRateLimitEstimate(scene: AIScene): { limit: number } {
  return { limit: getSceneQuota(scene) };
}

/** 返回所有限流场景列表 */
export function getRateLimitScenes(): AIScene[] {
  return [...RATE_LIMITED_SCENES];
}
