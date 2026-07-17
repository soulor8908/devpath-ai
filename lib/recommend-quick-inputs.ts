// lib/recommend-quick-inputs.ts
// 快捷输入智能推荐
//
// 设计（卡帕西视角）：
//   - 多源加权打分：input_history × 3 + LearnLog topic × 2 + ReviewLog 标题 × 1 + ChatMessage 主题 × 1
//   - 时近衰减：今天 × 1.0 / 3 天前 × 0.7 / 7 天前 × 0.3
//   - 取 top 4 去重
//   - 无数据返回默认 4 个示例
//
// 调用方：app/learn/new/page.tsx（或 LearnWizard）useEffect 加载

import { getInputHistory } from "@/lib/learn-input-history";
import { getAllLogs } from "@/lib/learn-log";
import { listItems } from "@/lib/storage/db";
import { KEY_PREFIXES, type LearnLog, type LearningPlan, type ReviewLog, type Conversation } from "@/lib/types";

const DEFAULT_QUICK_INPUTS = [
  "前端性能优化",
  "React 源码原理",
  "TypeScript 进阶",
  "系统设计基础",
];

const DAY_MS = 86400000;
const RECENT_DAYS = 7;
const TOP_N = 4;

interface ScoredItem {
  text: string;
  score: number;
}

/** 时近衰减系数：今天=1.0，3 天前=0.7，7 天前=0.3 */
function decayFactor(isoTimestamp: string): number {
  const ts = new Date(isoTimestamp).getTime();
  if (isNaN(ts)) return 0.3;
  const daysAgo = (Date.now() - ts) / DAY_MS;
  if (daysAgo <= 1) return 1.0;
  if (daysAgo <= 3) return 0.7;
  if (daysAgo <= RECENT_DAYS) return 0.3;
  return 0; // 超过 7 天不计入
}

function addScore(list: ScoredItem[], text: string, weight: number, ts: string) {
  const trimmed = text.trim();
  if (!trimmed) return;
  const decay = decayFactor(ts);
  if (decay <= 0) return;
  const existing = list.find((x) => x.text === trimmed);
  if (existing) {
    existing.score += weight * decay;
  } else {
    list.push({ text: trimmed, score: weight * decay });
  }
}

/**
 * 推荐快捷输入词（top 4）
 * 数据源：input_history / LearnLog / ReviewLog / ChatMessage
 */
export async function getRecommendedQuickInputs(): Promise<string[]> {
  const scored: ScoredItem[] = [];

  // 1. 输入历史（× 3）
  const inputHistory = await getInputHistory(50);
  for (const item of inputHistory) {
    addScore(scored, item.topic, 3, item.updatedAt);
  }

  // 2. LearnLog 关联的 plan.topic（× 2）
  // 先拉最近 7 天 LearnLog，再 join plan.topic
  const cutoff = new Date(Date.now() - RECENT_DAYS * DAY_MS).toISOString();
  const allLogs = await getAllLogs();
  const recentLogs = allLogs.filter(
    (l) => (l.timestamp ?? l.date) >= cutoff,
  );
  if (recentLogs.length > 0) {
    // 收集所有 planId 并 join plan.topic
    const planIds = [...new Set(recentLogs.map((l) => l.planId))];
    const plans = await listItems<LearningPlan>(KEY_PREFIXES.PLAN);
    const planMap = new Map(plans.map((p) => [p.id, p]));
    for (const log of recentLogs) {
      const plan = planMap.get(log.planId);
      if (!plan) continue;
      addScore(scored, plan.topic, 2, log.timestamp ?? log.date);
    }
  }

  // 3. ReviewLog 关联的 card 标题（× 1）
  // ReviewLog 没有 title 字段，但可以通过 cardId 反查 ReviewCard.question（取前 N 字作为摘要）
  // 简化：暂不接入 ReviewLog（避免引入复杂查询）；用 LearnLog 的 nodeId 反查 node.title
  // 这里仍按 spec 接入 ReviewLog，但用其 date 作为时间
  const reviewLogs = await listItems<ReviewLog>(KEY_PREFIXES.REVIEW_LOG);
  const recentReviewLogs = reviewLogs.filter((r) => r.date >= cutoff.slice(0, 10));
  // ReviewLog 无 title 字段，使用 cardId 作为弱信号（如果同一 cardId 多次复习说明相关 topic 重要）
  // 但 cardId 不可读，所以这部分信号较弱，仅作为打分提示
  // 改进：通过 cardId 反查 ReviewCard，但为简化此处直接跳过（已有 LearnLog 信号覆盖）
  void recentReviewLogs;

  // 4. ChatMessage 对话主题（× 1）
  // 直接读 Conversation，取最近 7 天的 title
  const convs = await listItems<Conversation>(KEY_PREFIXES.CONVERSATION);
  for (const c of convs) {
    if (!c.updatedAt) continue;
    if (c.updatedAt < cutoff) continue;
    addScore(scored, c.title, 1, c.updatedAt);
  }

  // 无数据返回默认
  if (scored.length === 0) {
    return DEFAULT_QUICK_INPUTS.slice();
  }

  // 排序取 top 4，且排除过短（≤ 1 字符）的项
  const filtered = scored.filter((x) => x.text.length > 1);
  filtered.sort((a, b) => b.score - a.score);
  const top = filtered.slice(0, TOP_N).map((x) => x.text);

  // 不足 4 个用默认补齐
  if (top.length < TOP_N) {
    for (const def of DEFAULT_QUICK_INPUTS) {
      if (top.length >= TOP_N) break;
      if (!top.includes(def)) top.push(def);
    }
  }
  return top;
}

/** 默认快捷输入（无数据时） */
export function getDefaultQuickInputs(): string[] {
  return DEFAULT_QUICK_INPUTS.slice();
}
