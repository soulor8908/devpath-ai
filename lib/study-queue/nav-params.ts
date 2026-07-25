// lib/study-queue/nav-params.ts
// 学习场景跳转参数构造工具（2026-07-25 交互闭环优化）
//
// 设计目的（乔布斯视角）：
//   用户从"今日学习清单"点击某个任务 → 进入训练/复习/学习详情页时，
//   应该自动聚焦到那个任务，而不是让用户在目标页重新找一遍。
//   "我刚点过的东西，在新页面就应该默认选中"——这是基本的交互闭环。
//
// 设计目的（卡帕西视角）：
//   - 把"构造 query string"的逻辑收敛到一处，避免每个入口手写 `?planId=...&nodeId=...`
//   - 类型安全：参数由 StudyTask 类型派生，不会拼错字段名
//   - 解析端用 parseSceneParams 统一读取，避免每个页面重复实现
//   - 未知参数自动忽略（防御性），缺失参数返回 undefined（不强制要求）
//
// 参数约定：
//   - planId：关联的学习计划 id（type=new 时有值）
//   - nodeId：关联的知识点 id（type=new 时有值）
//   - cardId：关联的 FSRS 卡片 id（type=review 时有值）
//   - date：任务日期 "YYYY-MM-DD"（用于"今日计划"过滤，目标页可据此缩小范围）
//   - from：来源标记（如 "home" / "plan-detail"），用于目标页做埋点/差异化提示

import type { StudyTask } from "./types";

/** 场景参数（解析后的结构化形式） */
export interface SceneParams {
  planId?: string;
  nodeId?: string;
  cardId?: string;
  date?: string;
  from?: string;
}

/** 从 StudyTask 构造跳转 URL（带 query 参数） */
export function buildSceneUrl(
  baseUrl: string,
  task: StudyTask,
  from?: string,
): string {
  const params = new URLSearchParams();
  if (task.planId) params.set("planId", task.planId);
  if (task.nodeId) params.set("nodeId", task.nodeId);
  if (task.cardId) params.set("cardId", task.cardId);
  if (task.date) params.set("date", task.date);
  if (from) params.set("from", from);
  const qs = params.toString();
  return qs ? `${baseUrl}?${qs}` : baseUrl;
}

/** 从 URLSearchParams 解析场景参数 */
export function parseSceneParams(
  searchParams: URLSearchParams | null | undefined,
): SceneParams {
  if (!searchParams) return {};
  return {
    planId: searchParams.get("planId") ?? undefined,
    nodeId: searchParams.get("nodeId") ?? undefined,
    cardId: searchParams.get("cardId") ?? undefined,
    date: searchParams.get("date") ?? undefined,
    from: searchParams.get("from") ?? undefined,
  };
}
