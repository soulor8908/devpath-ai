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
  type KnowledgeNode,
  type Question,
} from "./types";

/** 列表页缓存 key（整列表级别） */
const SUMMARY_LIST_CACHE_KEY = "__cache:plan_summaries";
/** 缓存 TTL：5 分钟 */
const SUMMARY_CACHE_TTL_MS = 5 * 60 * 1000;

/**
 * 规范化 LearningPlan：对 knowledgeTree/questions/schedule 做回退，
 * 避免旧 IndexedDB 数据缺字段导致渲染崩溃。
 * 调用方需先过滤 undefined（本函数入参必填）。
 */
export function normalizePlan(plan: LearningPlan): LearningPlan {
  return {
    ...plan,
    knowledgeTree: Array.isArray(plan.knowledgeTree) ? plan.knowledgeTree : [],
    questions: Array.isArray(plan.questions) ? plan.questions : [],
    schedule: Array.isArray(plan.schedule) ? plan.schedule : [],
  };
}

/**
 * 规范化 LearningPlanSummary：对 schedule / nodeStates 做回退，
 * 避免旧摘要缺字段导致首页 computeTodaySchedule 崩溃。
 *
 * 2026-07-25：nodeStates 字段回退为空对象（旧 summary 缺此字段时不过滤，向后兼容）
 */
export function normalizePlanSummary(summary: LearningPlanSummary): LearningPlanSummary {
  return {
    ...summary,
    schedule: Array.isArray(summary.schedule) ? summary.schedule : [],
    // 旧 summary 缺 nodeStates → 回退为空对象（不过滤任何节点）
    nodeStates: summary.nodeStates ?? {},
  };
}

/** 从完整 plan 提取摘要（对旧数据缺字段做回退，避免 .length/.map 崩溃） */
export function toSummary(plan: LearningPlan): LearningPlanSummary {
  const knowledgeTree = Array.isArray(plan.knowledgeTree) ? plan.knowledgeTree : [];
  const questions = Array.isArray(plan.questions) ? plan.questions : [];
  const schedule = Array.isArray(plan.schedule) ? plan.schedule : [];
  return {
    id: plan.id,
    topic: plan.topic,
    knowledgeCount: knowledgeTree.length,
    questionCount: questions.length,
    scheduleDays: new Set(schedule.map((s) => s.day)).size,
    dailyMinutes: plan.dailyMinutes,
    maxNewPerDay: plan.maxNewPerDay,
    // P1 优化：包含完整 schedule，首页 computeTodaySchedule 无需加载完整 plan
    // schedule 体积小（~6KB/30天计划），远小于 knowledgeTree + questions（~100KB+）
    schedule,
    // 2026-07-25 派生 nodeStates：study-queue 据此过滤已掌握/全部看懂的节点
    // 计算成本 O(N+Q)，远小于加载完整 plan 的 IO 成本
    nodeStates: deriveNodeStates(knowledgeTree, questions),
    createdAt: plan.createdAt,
    updatedAt: plan.updatedAt,
  };
}

/**
 * 派生计算节点状态表（2026-07-25 新增）。
 *
 * 规则：
 *   - mastered: 节点 master 字段 === true（用户显式标记掌握）
 *   - allUnderstood: 节点下至少有 1 道题，且所有题 understood === true
 *
 * 用途：buildStudyQueueFromData 据此过滤掉已掌握/全部看懂的节点的学习任务
 * 旧 summary 缺此字段时回退为空对象（不过滤），向后兼容
 */
function deriveNodeStates(
  knowledgeTree: KnowledgeNode[],
  questions: Question[],
): Record<string, { mastered: boolean; allUnderstood: boolean }> {
  const result: Record<string, { mastered: boolean; allUnderstood: boolean }> = {};
  for (const node of knowledgeTree) {
    const nodeQuestions = questions.filter((q) => q.nodeId === node.id);
    const allUnderstood =
      nodeQuestions.length > 0 && nodeQuestions.every((q) => q.understood === true);
    result[node.id] = {
      mastered: node.mastered === true,
      allUnderstood,
    };
  }
  return result;
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
      // 规范化：旧摘要可能缺 schedule 字段，回退为 [] 避免首页崩溃
      return items
        .map(normalizePlanSummary)
        .sort(
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
 * 一次性迁移：扫描所有旧 plan（无 summary 或 summary 缺 schedule 字段）并补齐
 * 返回新增/修复的摘要数量；列表页据此判断是否需要刷新
 *
 * P1 扩展：除了补齐缺失的 summary，还修复旧 summary（缺 schedule 字段的）
 */
export async function migrateSummaries(): Promise<number> {
  // 找出所有 plan key 和已有 summary key
  const [planKeys, existingSummaries] = await Promise.all([
    listKeys(KEY_PREFIXES.PLAN),
    listItems<LearningPlanSummary>(KEY_PREFIXES.PLAN_SUMMARY),
  ]);

  const summaryIds = new Set(existingSummaries.map((s) => s.id));
  // 缺失 summary 的 plan key
  const missingKeys = planKeys.filter((k) => {
    const id = k.slice(KEY_PREFIXES.PLAN.length);
    return !summaryIds.has(id);
  });
  // 旧 summary 缺 schedule 字段的（P1 升级前的数据）
  const staleIds = new Set(
    existingSummaries
      .filter((s) => !Array.isArray(s.schedule))
      .map((s) => s.id),
  );
  const staleKeys = planKeys.filter((k) => {
    const id = k.slice(KEY_PREFIXES.PLAN.length);
    return staleIds.has(id);
  });

  const toRebuild = [...new Set([...missingKeys, ...staleKeys])];
  if (toRebuild.length === 0) return 0;

  // 按需加载缺失/过期的 plan（只加载这一次）
  const plans = await Promise.all(
    toRebuild.map((k) => getItem<LearningPlan>(k)),
  );
  await Promise.all(
    plans
      .filter((p): p is LearningPlan => p !== undefined)
      .map((p) => setItem(KEY_PREFIXES.PLAN_SUMMARY + p.id, toSummary(p))),
  );
  // 迁移后失效列表缓存
  invalidateCache(SUMMARY_LIST_CACHE_KEY);
  return toRebuild.length;
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
