// lib/plan-summary.ts
// 学习计划摘要存储：列表页只加载 summary（体积小），
// 点击进入详情时再按需读取完整 plan，避免一次性加载所有计划数据
//
// 兼容：旧数据没有 summary，首次访问时 migrateSummaries() 会补齐
//
// P1 优化：内存缓存层（5min TTL）
//   - listPlanSummaries() 走缓存，避免重复读取 IndexedDB
//   - savePlanSummary / deletePlanSummary 自动失效缓存

import { getItem, setItem, listItems, delItem, listKeys } from "@/lib/storage/db";
import { getCached, invalidateCache } from "@/lib/storage/cache";
import {
  KEY_PREFIXES,
  type LearningPlan,
  type LearningPlanSummary,
} from "./types";

/** 列表页缓存 key（整列表级别） */
const SUMMARY_LIST_CACHE_KEY = "__cache:plan_summaries";
/** 缓存 TTL：5 分钟 */
const SUMMARY_CACHE_TTL_MS = 5 * 60 * 1000;

/** 从完整 plan 提取摘要 */
export function toSummary(plan: LearningPlan): LearningPlanSummary {
  return {
    id: plan.id,
    topic: plan.topic,
    knowledgeCount: plan.knowledgeTree.length,
    questionCount: plan.questions.length,
    scheduleDays: new Set(plan.schedule.map((s) => s.day)).size,
    dailyMinutes: plan.dailyMinutes,
    maxNewPerDay: plan.maxNewPerDay,
    createdAt: plan.createdAt,
    updatedAt: plan.updatedAt,
  };
}

/** 保存摘要（在保存完整 plan 时一起调用） */
export async function savePlanSummary(plan: LearningPlan): Promise<void> {
  await setItem(KEY_PREFIXES.PLAN_SUMMARY + plan.id, toSummary(plan));
  // 写入后失效列表缓存（单条缓存会被 setItem 自动更新）
  invalidateCache(SUMMARY_LIST_CACHE_KEY);
}

/**
 * 列出所有摘要（按 createdAt 降序）
 * P1: 走内存缓存（5min TTL），首页热路径优化
 */
export async function listPlanSummaries(): Promise<LearningPlanSummary[]> {
  return await getCached(
    SUMMARY_LIST_CACHE_KEY,
    async () => {
      const items = await listItems<LearningPlanSummary>(KEY_PREFIXES.PLAN_SUMMARY);
      return items.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
    },
    SUMMARY_CACHE_TTL_MS,
  ) ?? [];
}

/** 删除摘要 */
export async function deletePlanSummary(planId: string): Promise<void> {
  await delItem(KEY_PREFIXES.PLAN_SUMMARY + planId);
  // 失效列表缓存
  invalidateCache(SUMMARY_LIST_CACHE_KEY);
}

/**
 * 一次性迁移：扫描所有旧 plan（无 summary 的）并补齐 summary
 * 返回新增的摘要数量；列表页据此判断是否需要刷新
 */
export async function migrateSummaries(): Promise<number> {
  // 找出所有 plan key 和已有 summary key
  const [planKeys, summaryKeys] = await Promise.all([
    listKeys(KEY_PREFIXES.PLAN),
    listKeys(KEY_PREFIXES.PLAN_SUMMARY),
  ]);
  const summaryIds = new Set(summaryKeys.map((k) => k.slice(KEY_PREFIXES.PLAN_SUMMARY.length)));
  const missingKeys = planKeys.filter(
    (k) => !summaryIds.has(k.slice(KEY_PREFIXES.PLAN.length)),
  );
  if (missingKeys.length === 0) return 0;

  // 按需加载缺失的 plan（只加载这一次）
  const plans = await Promise.all(
    missingKeys.map((k) => getItem<LearningPlan>(k)),
  );
  await Promise.all(
    plans
      .filter((p): p is LearningPlan => p !== undefined)
      .map((p) => setItem(KEY_PREFIXES.PLAN_SUMMARY + p.id, toSummary(p))),
  );
  // 迁移后失效列表缓存
  invalidateCache(SUMMARY_LIST_CACHE_KEY);
  return missingKeys.length;
}

/**
 * 按 id 获取摘要
 * P1: 走内存缓存（5min TTL）
 */
export async function getPlanSummary(
  planId: string,
): Promise<LearningPlanSummary | undefined> {
  return await getCached(
    KEY_PREFIXES.PLAN_SUMMARY + planId,
    () => getItem<LearningPlanSummary>(KEY_PREFIXES.PLAN_SUMMARY + planId),
    SUMMARY_CACHE_TTL_MS,
  );
}
