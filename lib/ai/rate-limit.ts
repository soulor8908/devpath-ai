// lib/ai/rate-limit.ts
// 服务端 AI 限流逻辑（基于 Cloudflare KV，按"用户 + 场景 + 日期"维度计数）
//
// 设计：
// - 每个场景有每日配额（chat=20 / plan_generate=5 / weekly_report=1 / daily_nudge=4 / other=5）
// - KV key 格式：ratelimit:{userId}:{scene}:{YYYY-MM-DD}（中国时区日期）
// - 乐观计数：成功调用前先 increment，失败不回滚（可接受，保守计数）
//
// ⚠️ 当前状态（session 架构改造后）：
//   - 所有通过 requireSession 鉴权的请求都使用用户自己加密在 session 中的 apiKey，
//     由用户自担 AI provider 额度/费用，服务端不再做"今日 N 次"拦截
//   - 本模块作为基础设施保留（含单测），未来若引入"服务端默认模型 / 匿名免费层"，
//     可在路由中按 useServerModel === true 条件调用 checkRateLimit / incrementRateLimit
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

// ---------------------------------------------------------------------------
// Trial 模式限流（IP 维度，针对未配置自己 apiKey 的体验用户）
// ---------------------------------------------------------------------------
//
// 设计（卡帕西视角）：
//   - 体验用户没添加自己的模型时，服务端用默认模型（AI_API_KEY）兜底响应
//   - 但必须有 IP 维度的限流闸门防滥用，不能让一个 IP 无限消耗服务端配额
//   - 配额比登录用户更紧（chat=5/天），且 key 前缀独立（trial:）避免与用户配额撞车
//   - KV 复用 AUTH_SESSIONS（与 SessionStore 同 namespace），key 前缀区分用途

/**
 * Trial 模式场景配额表：每日上限（比登录用户更紧）
 */
const TRIAL_SCENE_QUOTAS: Partial<Record<AIScene, number>> = {
  chat: 5,
  // 知识检索嵌入：trial 用户 100/天（每次知识型聊天约 1 次 embed，足够体验）
  embed: 100,
};

const TRIAL_DEFAULT_QUOTA = 2;

/** 获取 trial 模式某场景的配额 */
export function getTrialSceneQuota(scene: AIScene): number {
  return TRIAL_SCENE_QUOTAS[scene] ?? TRIAL_DEFAULT_QUOTA;
}

/**
 * 检查 trial 模式是否允许调用（IP 维度）。
 *
 * 实现复用 SessionStore 的 getRateLimitCount，userId 位置传 `trial:${ip}`，
 * 由此生成的 KV key 为 `ratelimit:trial:${ip}:${scene}:${date}`，
 * 与登录用户的 `ratelimit:${userId}:${scene}:${date}` 完全独立，不会撞车。
 *
 * @param ip 客户端 IP（从 cf-connecting-ip / x-forwarded-for 提取）
 */
export async function checkTrialRateLimit(
  ip: string,
  scene: AIScene,
  kv: KVStore,
): Promise<{ allowed: boolean; remaining: number; limit: number }> {
  const limit = getTrialSceneQuota(scene);
  const date = chinaDateNow();
  const used = await kv.getRateLimitCount(`trial:${ip}`, scene, date);
  const remaining = Math.max(0, limit - used);
  return {
    allowed: used < limit,
    remaining,
    limit,
  };
}

/**
 * Trial 模式计数 +1（IP 维度）。
 * 与 checkTrialRateLimit 共享 key 前缀，配合使用。
 */
export async function incrementTrialRateLimit(
  ip: string,
  scene: AIScene,
  kv: KVStore,
): Promise<void> {
  const date = chinaDateNow();
  await kv.incrementRateLimitCount(`trial:${ip}`, scene, date);
}
