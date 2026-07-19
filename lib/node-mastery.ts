// lib/node-mastery.ts
// 知识点掌握度派生与学习反馈闭环核心 API
//
// 设计（乔布斯视角）：
//   - "掌握度"是结果，不是用户操作；用户只关心两个动作："我掌握了" / "需要再加强"
//   - 题目层面：用户看完答案后给一个轻量反馈"看懂了 / 再想想"，不做强制测验
//   - 系统不该装作"知道"用户掌握了——只有用户说了算；mastery 数值只是辅助参考
//
// 设计（卡帕西视角）：
//   - mastery 是 derived field：由 computeNodeMastery(node, questions) 计算
//     = (understood 题数 + favorited 题数 * 0.5) / 总题数 * 100，封顶 100
//     （收藏视为部分理解，因为用户主动收说明看懂了至少一半）
//   - mastered / needsReinforce 是用户显式 state，由 UI 按钮触发
//   - 所有变更走不可变更新 + 一次 setItem，保证 IndexedDB 一致性
//   - 写入 LearnLog（understood_event / mastered_event / reinforce_event）
//     供后续仪表盘统计与 AI 上下文使用

import type { KnowledgeNode, LearningPlan, Question } from "./types";
import { logLearning } from "./learn-log";
import { setItem } from "./storage/db";
import { KEY_PREFIXES } from "./types";
import { savePlanSummary } from "./plan-summary";
import { scheduleAutoSync } from "./sync";
import { nowISO } from "./time";

/**
 * 派生计算单个知识点的掌握度（0-100）。
 *
 * 公式：
 *   score = understood题数 * 1.0 + favorited题数 * 0.5
 *   mastery = round(score / total * 100)
 *
 * 边界：
 *   - 总题数 0 → 返回 0（避免除零）
 *   - mastery > 100 → 封顶 100
 *
 * @param node 知识点（仅取 id）
 * @param questions 全计划题目（按 nodeId 过滤）
 */
export function computeNodeMastery(
  node: Pick<KnowledgeNode, "id">,
  questions: Question[]
): number {
  const nodeQuestions = questions.filter((q) => q.nodeId === node.id);
  const total = nodeQuestions.length;
  if (total === 0) return 0;
  let score = 0;
  for (const q of nodeQuestions) {
    if (q.understood) score += 1;
    else if (q.favorited) score += 0.5;
  }
  const raw = Math.round((score / total) * 100);
  return Math.max(0, Math.min(100, raw));
}

/**
 * 节点是否被用户显式标记为"已掌握"。
 * mastered=true 优先级高于派生 mastery 数值。
 */
export function isNodeMastered(node: KnowledgeNode): boolean {
  return node.mastered === true;
}

/**
 * 节点是否需要加强（用户主动反馈薄弱）。
 */
export function isNodeNeedsReinforce(node: KnowledgeNode): boolean {
  return node.needsReinforce === true;
}

/**
 * 标记 / 取消标记知识点为"已掌握"。
 * 不可变更新，返回新 plan 对象。
 *
 * 副作用：
 *   - 写回 IndexedDB（plan + plan summary）
 *   - 触发 scheduleAutoSync
 *   - 写入 LearnLog（mastered_event / unmastered_event）
 */
export async function markNodeMastered(
  plan: LearningPlan,
  nodeId: string,
  mastered: boolean
): Promise<LearningPlan> {
  const now = nowISO();
  const updated: LearningPlan = {
    ...plan,
    updatedAt: now,
    knowledgeTree: plan.knowledgeTree.map((n) =>
      n.id === nodeId
        ? {
            ...n,
            mastered,
            masteredAt: mastered ? now : undefined,
            // 标记掌握时清除"需要加强"（互斥）
            needsReinforce: mastered ? false : n.needsReinforce,
            // 同步更新 mastery 数值（派生值，但写入便于旧代码读取）
            mastery: mastered ? 100 : computeNodeMastery(n, plan.questions),
          }
        : n
    ),
  };
  await setItem(KEY_PREFIXES.PLAN + plan.id, updated);
  await savePlanSummary(updated);
  scheduleAutoSync();
  // 仅在"标记掌握"时写日志（取消不写，避免污染统计）
  if (mastered) {
    await logLearning({
      planId: plan.id,
      nodeId,
      type: "learn_complete",
    }).catch(() => {
      // 日志失败不影响主流程
    });
  }
  return updated;
}

/**
 * 标记 / 取消标记知识点为"需要加强"。
 * 与 mastered 互斥：标记 needsReinforce=true 时清除 mastered。
 */
export async function markNodeNeedsReinforce(
  plan: LearningPlan,
  nodeId: string,
  needsReinforce: boolean
): Promise<LearningPlan> {
  const now = nowISO();
  const updated: LearningPlan = {
    ...plan,
    updatedAt: now,
    knowledgeTree: plan.knowledgeTree.map((n) =>
      n.id === nodeId
        ? {
            ...n,
            needsReinforce,
            // 标记加强时清除"已掌握"（互斥）
            mastered: needsReinforce ? false : n.mastered,
            masteredAt: needsReinforce ? undefined : n.masteredAt,
          }
        : n
    ),
  };
  await setItem(KEY_PREFIXES.PLAN + plan.id, updated);
  await savePlanSummary(updated);
  scheduleAutoSync();
  return updated;
}

/**
 * 标记题目"看懂了 / 再想想"。
 * 不可变更新，同时刷新所属知识点的派生 mastery（除非该节点被显式 mastered）。
 *
 * 副作用：
 *   - 写回 plan
 *   - 写入 LearnLog（understood_event / ununderstood_event）
 */
export async function markQuestionUnderstood(
  plan: LearningPlan,
  questionId: string,
  understood: boolean
): Promise<LearningPlan> {
  const now = nowISO();
  const targetQ = plan.questions.find((q) => q.id === questionId);
  if (!targetQ) return plan;

  const updatedQuestions = plan.questions.map((q) =>
    q.id === questionId
      ? {
          ...q,
          understood,
          understoodAt: understood ? now : undefined,
          // 标记看懂时自动写 viewed（避免数据不一致）
          viewed: understood ? true : q.viewed,
          viewedAt: understood ? now : q.viewedAt,
        }
      : q
  );

  // 重新计算所属节点的派生 mastery（除非用户已显式 mastered=true）
  const updatedTree = plan.knowledgeTree.map((n) => {
    if (n.id !== targetQ.nodeId) return n;
    if (n.mastered) return n; // 显式掌握的不覆盖
    return {
      ...n,
      mastery: computeNodeMastery(n, updatedQuestions),
    };
  });

  const updated: LearningPlan = {
    ...plan,
    updatedAt: now,
    questions: updatedQuestions,
    knowledgeTree: updatedTree,
  };
  await setItem(KEY_PREFIXES.PLAN + plan.id, updated);
  await savePlanSummary(updated);
  scheduleAutoSync();
  // 仅在"标记看懂"时写日志（取消不写，避免污染统计）
  if (understood) {
    await logLearning({
      planId: plan.id,
      nodeId: targetQ.nodeId,
      questionId,
      type: "question_view",
    }).catch(() => {
      // 日志失败不影响主流程
    });
  }
  return updated;
}

/**
 * 记录题目被展开查看（隐式反馈）。
 * 不修改 understood 状态，只更新 viewed 时间戳。
 */
export async function markQuestionViewed(
  plan: LearningPlan,
  questionId: string
): Promise<LearningPlan> {
  const targetQ = plan.questions.find((q) => q.id === questionId);
  if (!targetQ || targetQ.viewed) return plan; // 已查看过则不重复记录

  const now = nowISO();
  const updated: LearningPlan = {
    ...plan,
    updatedAt: now,
    questions: plan.questions.map((q) =>
      q.id === questionId
        ? { ...q, viewed: true, viewedAt: now }
        : q
    ),
  };
  await setItem(KEY_PREFIXES.PLAN + plan.id, updated);
  await savePlanSummary(updated);
  await logLearning({
    planId: plan.id,
    nodeId: targetQ.nodeId,
    questionId,
    type: "question_view",
  }).catch(() => {
    // 日志失败不影响主流程
  });
  return updated;
}
