/**
 * 权威来源新鲜度巡检脚本（进 CI）
 * 用法：npx tsx scripts/audit-source-freshness.ts
 *
 * 守护内容（对应 docs/TODO.md P0 来源新鲜度）：
 *   - lastVerified 超过 STALE_DAYS 天的来源标记为 stale（陈旧）
 *   - 缺失 lastVerified 或格式非法的来源标记为 invalid
 *   - 任一 invalid 或 stale 占比超 STALE_RATIO_THRESHOLD 时以非零码退出（CI red）
 *
 * 设计原则（卡帕西视角）：
 *   - 纯函数 + 可测试：核心逻辑与 fs 解耦，便于单测
 *   - CI 即评审：内容腐烂由 CI 拦截，不靠人工记忆
 *   - 渐进收紧：先防 invalid（硬错误），stale 先告警不阻断，比例超阈值才阻断
 */
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

import { parse as parseYaml } from "yaml";

import { sourceRegistrySchema } from "../lib/curriculum/schema";
import type { SourceEntry } from "../lib/types/curriculum";

const REGISTRY_PATH = join(__dirname, "..", "content", "sources", "registry.yaml");

/** 陈旧阈值：lastVerified 超过此天数视为 stale */
const STALE_DAYS = 90;
/** stale 占比超此阈值时 CI red（允许少量陈旧，防止全量阻断） */
const STALE_RATIO_THRESHOLD = 0.3;

export interface FreshnessResult {
  total: number;
  invalid: { id: string; reason: string }[];
  stale: { id: string; lastVerified: string; daysAgo: number }[];
  fresh: number;
  staleRatio: number;
  passed: boolean;
}

/** 解析 lastVerified 字符串为日期，非法返回 null */
function parseDate(s: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return null;
  const d = new Date(s + "T00:00:00Z");
  return Number.isNaN(d.getTime()) ? null : d;
}

/** 核心纯函数：给定来源列表与参考日期，计算新鲜度结果 */
export function auditFreshness(
  sources: SourceEntry[],
  now: Date,
): FreshnessResult {
  const invalid: { id: string; reason: string }[] = [];
  const stale: { id: string; lastVerified: string; daysAgo: number }[] = [];

  for (const s of sources) {
    if (!s.lastVerified) {
      invalid.push({ id: s.id, reason: "缺失 lastVerified 字段" });
      continue;
    }
    const d = parseDate(s.lastVerified);
    if (!d) {
      invalid.push({
        id: s.id,
        reason: `lastVerified 格式非法: "${s.lastVerified}"（应为 YYYY-MM-DD）`,
      });
      continue;
    }
    const daysAgo = Math.floor((now.getTime() - d.getTime()) / 86_400_000);
    if (daysAgo > STALE_DAYS) {
      stale.push({ id: s.id, lastVerified: s.lastVerified, daysAgo });
    }
  }

  const fresh = sources.length - invalid.length - stale.length;
  const staleRatio = sources.length > 0 ? stale.length / sources.length : 0;
  // invalid 是硬错误；stale 超比例才阻断
  const passed = invalid.length === 0 && staleRatio <= STALE_RATIO_THRESHOLD;

  return { total: sources.length, invalid, stale, fresh, staleRatio, passed };
}

function main(): void {
  if (!existsSync(REGISTRY_PATH)) {
    console.error(`来源登记表不存在: ${REGISTRY_PATH}`);
    process.exit(1);
  }
  const raw = parseYaml(readFileSync(REGISTRY_PATH, "utf-8"));
  const parsed = sourceRegistrySchema.parse(raw);
  const sources = parsed.sources;

  const result = auditFreshness(sources, new Date());

  console.log("来源新鲜度巡检报告");
  console.log("=".repeat(60));
  console.log(`总来源数: ${result.total}`);
  console.log(`新鲜: ${result.fresh}`);
  console.log(`陈旧（> ${STALE_DAYS} 天）: ${result.stale.length}（占比 ${(result.staleRatio * 100).toFixed(1)}%，阈值 ${STALE_RATIO_THRESHOLD * 100}%）`);
  console.log(`非法: ${result.invalid.length}`);

  if (result.invalid.length > 0) {
    console.log("\n--- 非法来源（必须修复）---");
    for (const i of result.invalid) {
      console.log(`  ${i.id}: ${i.reason}`);
    }
  }

  if (result.stale.length > 0) {
    console.log("\n--- 陈旧来源（建议复核 URL 可达性与内容准确性）---");
    // 按陈旧程度倒序，最老的排前面
    const sorted = [...result.stale].sort((a, b) => b.daysAgo - a.daysAgo);
    for (const s of sorted) {
      console.log(`  ${s.id}（lastVerified=${s.lastVerified}, ${s.daysAgo} 天前）`);
    }
  }

  console.log("=".repeat(60));
  if (result.passed) {
    console.log("✓ 巡检通过");
    process.exit(0);
  } else {
    if (result.invalid.length > 0) {
      console.log(`✗ 巡检失败：${result.invalid.length} 条非法来源（硬错误）`);
    }
    if (result.staleRatio > STALE_RATIO_THRESHOLD) {
      console.log(
        `✗ 巡检失败：陈旧占比 ${(result.staleRatio * 100).toFixed(1)}% 超阈值 ${STALE_RATIO_THRESHOLD * 100}%`,
      );
    }
    process.exit(1);
  }
}

main();
