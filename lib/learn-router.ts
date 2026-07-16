// lib/learn-router.ts
// 学习入口智能路由：根据用户已有计划状态决定落地页
//   无计划 → /learn/new（创建页）
//   有计划 → /learn/list（列表页）
// 抽成纯函数便于单测，且与 React 解耦。

import { listPlanSummaries, migrateSummaries } from "./plan-summary";

/**
 * 解析学习入口目标路径。
 * 顺带做一次旧数据 summary 迁移（幂等，无缺失时立即返回）。
 */
export async function resolveLearnEntry(): Promise<string> {
  await migrateSummaries();
  const summaries = await listPlanSummaries();
  return summaries.length === 0 ? "/learn/new" : "/learn/list";
}
