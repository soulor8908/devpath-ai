// lib/emotion-migrate.ts
// EmotionEntry 迁移层：把 P3 前的旧字段（trigger/impact/coping）合并到新字段
//
// 设计目标（Issue 5 修复）：
//   - 旧数据：trigger + impact → reason；coping → customCoping
//   - 迁移后：旧字段从对象中删除，类型严格为 EmotionEntry
//   - 幂等：迁移过的数据再次迁移无副作用
//   - 惰性：仅在读写时按需调用，不强制全表扫描
//
// 使用方式：
//   读取时：const entry = migrateEmotionEntry(rawFromDB);
//   写入时：先 migrate 再 setItem，保证存储的始终是新格式

import { setItem, listKeys } from "./storage/db";
import { KEY_PREFIXES, type EmotionEntry, type LegacyEmotionFields } from "./types";

/**
 * 把可能含旧字段的 entry 迁移为新格式（删除 trigger/impact/coping）
 * 不写入存储，仅返回迁移后的纯对象
 *
 * @param raw 从 IndexedDB 读出的原始数据（可能含 trigger/impact/coping）
 * @returns 严格符合 EmotionEntry 的对象（无 legacy 字段）
 */
export function migrateEmotionEntry(
  raw: EmotionEntry & LegacyEmotionFields,
): EmotionEntry {
  const { trigger, impact, coping, ...clean } = raw;

  // reason 合并：若新字段为空但旧字段存在，从旧字段构造
  if ((!clean.reason || clean.reason.trim() === "") && (trigger || impact)) {
    const parts: string[] = [];
    if (trigger) parts.push(`原因: ${trigger}`);
    if (impact) parts.push(`影响: ${impact}`);
    clean.reason = parts.join(" / ");
  }

  // coping 合并：若 selectedCoping/customCoping 都为空但旧 coping 存在，迁到 customCoping
  const hasNewCoping =
    (clean.selectedCoping?.length ?? 0) > 0 || Boolean(clean.customCoping);
  if (!hasNewCoping && coping) {
    clean.customCoping = coping;
  }

  // 保证新字段类型完整（旧数据可能没有 copingSuggestions/selectedCoping）
  if (!Array.isArray(clean.copingSuggestions)) clean.copingSuggestions = [];
  if (!Array.isArray(clean.selectedCoping)) clean.selectedCoping = [];
  if (clean.customCoping === undefined) clean.customCoping = "";

  return clean as EmotionEntry;
}

/**
 * 读取展示用：合并新旧字段的 reason 文本（不修改原对象）
 * 用于 UI 层降级展示，等价于旧版 getDisplayReason
 */
export function getDisplayReason(
  entry: EmotionEntry & LegacyEmotionFields,
): string {
  if (entry.reason) return entry.reason;
  const parts: string[] = [];
  if (entry.trigger) parts.push(`原因: ${entry.trigger}`);
  if (entry.impact) parts.push(`影响: ${entry.impact}`);
  return parts.join(" / ");
}

/**
 * 读取展示用：合并新旧字段的 coping 文本
 */
export function getDisplayCoping(
  entry: EmotionEntry & LegacyEmotionFields,
): string {
  const parts: string[] = [];
  if (entry.selectedCoping?.length > 0) parts.push(entry.selectedCoping.join("、"));
  if (entry.customCoping) parts.push(entry.customCoping);
  if (parts.length > 0) return parts.join(" + ");
  if (entry.coping) return entry.coping;
  return "";
}

/**
 * 一次性批量迁移所有旧版情绪条目（惰性执行）
 *
 * 工作原理：
 *   1. 列出所有 emotion: 前缀的 key
 *   2. 读出原始数据，跑 migrateEmotionEntry
 *   3. 若数据有变化（含旧字段），写回新格式
 *
 * 调用时机：
 *   - 用户进入 /emotion 页面时（一次性迁移）
 *   - App 升级到新版本后第一次访问
 *
 * 幂等：已迁移过的数据再次调用无副作用
 */
export async function migrateAllEmotionEntries(): Promise<number> {
  const keys = await listKeys(KEY_PREFIXES.EMOTION);
  let migrated = 0;
  for (const key of keys) {
    // getItem 后 cast 到联合类型
    const { getItem } = await import("./storage/db");
    const raw = await getItem<EmotionEntry & LegacyEmotionFields>(key);
    if (!raw) continue;

    const hasLegacy =
      "trigger" in raw || "impact" in raw || "coping" in raw;
    if (!hasLegacy) continue;

    const migrated_entry = migrateEmotionEntry(raw);
    await setItem(key, migrated_entry);
    migrated++;
  }
  return migrated;
}
