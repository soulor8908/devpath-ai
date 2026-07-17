import type { ReviewCard, LearningPlan } from "./types";

export interface ReviewFilters {
  planId: string | "all";
  nodeId: string | "all";
  difficulty: number | "all";
  dueStatus: "overdue" | "today" | "week" | "all";
  bigTech: "all" | "yes" | "no";
  search: string;
}

export const DEFAULT_FILTERS: ReviewFilters = {
  planId: "all",
  nodeId: "all",
  difficulty: "all",
  dueStatus: "all",
  bigTech: "all",
  search: "",
};

/**
 * Apply multi-dimensional filters to review cards.
 * - dueStatus="all": due <= now (same as getDueCards semantics)
 * - dueStatus="overdue": due < start of today
 * - dueStatus="today": start of today <= due <= now
 * - dueStatus="week": now < due <= now + 7 days (future cards for preview)
 * - difficulty/bigTech/nodeId: reverse-lookup from plans' knowledgeTree
 * - search: case-insensitive match on front + back
 */
export function applyReviewFilters(
  cards: ReviewCard[],
  filters: ReviewFilters,
  ctx: { plans: LearningPlan[]; now: Date }
): ReviewCard[] {
  const nowMs = ctx.now.getTime();
  const startOfToday = new Date(ctx.now);
  startOfToday.setHours(0, 0, 0, 0);
  const startOfTodayMs = startOfToday.getTime();
  const weekEndMs = nowMs + 7 * 24 * 60 * 60 * 1000;

  // Build a lookup: card.nodeId -> KnowledgeNode (from any plan that has it)
  // Also planId -> plan (for plan topic lookup, though filtering by planId is direct on card.planId)
  const nodeMap = new Map<string, { difficulty: number; bigTech?: boolean }>();
  for (const plan of ctx.plans) {
    for (const node of plan.knowledgeTree) {
      if (!nodeMap.has(node.id)) {
        nodeMap.set(node.id, { difficulty: node.difficulty, bigTech: node.bigTech });
      }
    }
  }

  const searchLower = filters.search.trim().toLowerCase();

  return cards.filter((card) => {
    // dueStatus filter
    const dueMs = new Date(card.due).getTime();
    if (filters.dueStatus === "all") {
      if (dueMs > nowMs) return false;
    } else if (filters.dueStatus === "overdue") {
      if (dueMs >= startOfTodayMs) return false; // must be before today
      if (dueMs > nowMs) return false; // still must be due
    } else if (filters.dueStatus === "today") {
      if (dueMs < startOfTodayMs) return false;
      if (dueMs > nowMs) return false;
    } else if (filters.dueStatus === "week") {
      if (dueMs <= nowMs) return false;
      if (dueMs > weekEndMs) return false;
    }

    // planId filter (direct on card)
    if (filters.planId !== "all" && card.planId !== filters.planId) return false;

    // nodeId filter (direct on card)
    if (filters.nodeId !== "all" && card.nodeId !== filters.nodeId) return false;

    // difficulty + bigTech via nodeMap reverse lookup
    const nodeInfo = nodeMap.get(card.nodeId);
    if (filters.difficulty !== "all") {
      if (!nodeInfo || nodeInfo.difficulty !== filters.difficulty) return false;
    }
    if (filters.bigTech === "yes") {
      if (!nodeInfo || !nodeInfo.bigTech) return false;
    } else if (filters.bigTech === "no") {
      if (nodeInfo && nodeInfo.bigTech) return false;
    }

    // search filter
    if (searchLower) {
      const front = (card.front || "").toLowerCase();
      const back = (card.back || "").toLowerCase();
      if (!front.includes(searchLower) && !back.includes(searchLower)) return false;
    }

    return true;
  });
}
