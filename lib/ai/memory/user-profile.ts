// lib/ai/memory/user-profile.ts
// 用户画像 CRUD：从 IndexedDB 读写 UserProfile（单例，key = KEY_PREFIXES.USER_PROFILE + "current"）
//
// 设计（卡帕西视角）：
//   - 单例存储：一个用户一份画像，key 固定，避免列表管理开销
//   - maybeBuildProfile 做"懒构建 + 24h TTL"：
//     首次访问无画像 → 构建；超过 24h → 自动刷新
//   - 写入时自动更新 updatedAt，保证增量同步能感知到变化

import { getItem, setItem } from "@/lib/storage/db";
import { KEY_PREFIXES, type UserProfile } from "@/lib/types";
import { buildUserProfile } from "./profile-builder";

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
