// lib/plan-cleanup.ts
// 学习计划级联删除：确保删除计划时关联数据被完整清理
//
// 2026-07-26 修复（用户反馈"删除知识库后复习里还包含那些题目"）：
//   旧 deletePlan 只清 PLAN/PLAN_SUMMARY/CARD/LEARN_LOG/MISTAKE/DECK，
//   漏掉以下关联数据导致"幽灵题目"残留：
//     1. ReviewLog（无 planId 字段，只能通过 cardId 反查）
//        → 卡片虽删，复习历史日志仍留在 IndexedDB，统计/周报仍会读到
//     2. PRIORITY_CACHE（当日优先级缓存含已删计划的复习任务）
//        → 首页今日清单继续显示已删计划的复习入口
//     3. Reminder（planId 关联的 AI 提醒）
//     4. 历史孤儿数据（之前删除流程中断/旧版漏删留下的残骸）
//   现统一收敛为 deletePlanCascade，并新增 sweepOrphanPlanData 清扫历史残骸。
//
// 设计：
//   - 查询阶段全并行（listItems 之间无依赖）
//   - 删除阶段串行（IndexedDB 单事务语义，避免并发冲突）
//   - 每个删除步骤独立 try/catch：单步失败不中断后续清理
//     （旧版无 try/catch，任一 delItem 抛错 → 后续级联全部中断 → 留下孤儿）
//   - 不删除：PomodoroSession（历史专注记录，与计划解耦，用于统计/打卡）
//             EmotionEntry / EnergySample（用户级数据，与计划无关）

import { listItems, delItem } from "@/lib/storage/db";
import { deletePlanSummary } from "@/lib/plan-summary";
import { KEY_PREFIXES } from "@/lib/types";
import type {
  ReviewCard,
  ReviewLog,
  LearnLog,
  MistakeRecord,
  FavoriteDeck,
  Reminder,
} from "@/lib/types";

/** 清理结果，供调用方做日志/提示 */
export interface CleanupResult {
  /** 成功删除的条目数（按类型计） */
  deleted: {
    plan: number;
    planSummary: number;
    cards: number;
    reviewLogs: number;
    learnLogs: number;
    mistakes: number;
    decks: number;
    reminders: number;
    priorityCaches: number;
  };
  /** 失败的步骤（每条含类型 + 错误信息），全部成功时为空 */
  errors: { type: string; error: string }[];
}

const EMPTY_RESULT: CleanupResult = {
  deleted: {
    plan: 0,
    planSummary: 0,
    cards: 0,
    reviewLogs: 0,
    learnLogs: 0,
    mistakes: 0,
    decks: 0,
    reminders: 0,
    priorityCaches: 0,
  },
  errors: [],
};

async function safeDelete(
  type: string,
  fn: () => Promise<void>,
  result: CleanupResult,
  countField?: keyof CleanupResult["deleted"],
  count = 1,
): Promise<void> {
  try {
    await fn();
    if (countField) result.deleted[countField] += count;
  } catch (e) {
    result.errors.push({
      type,
      error: e instanceof Error ? e.message : String(e),
    });
  }
}

/**
 * 级联删除单个学习计划及其所有关联数据。
 *
 * @param planId 要删除的计划 ID
 * @returns CleanupResult 供调用方记录日志 / 提示用户
 */
export async function deletePlanCascade(planId: string): Promise<CleanupResult> {
  const result: CleanupResult = {
    deleted: { ...EMPTY_RESULT.deleted },
    errors: [],
  };

  // 1. 并行查询所有关联数据（listItems 之间无依赖）
  const [cards, reviewLogs, learnLogs, mistakes, decks, reminders, priorityCaches] =
    await Promise.all([
      listItems<ReviewCard>(KEY_PREFIXES.CARD).catch(() => [] as ReviewCard[]),
      listItems<ReviewLog>(KEY_PREFIXES.REVIEW_LOG).catch(() => [] as ReviewLog[]),
      listItems<LearnLog>(KEY_PREFIXES.LEARN_LOG).catch(() => [] as LearnLog[]),
      listItems<MistakeRecord>(KEY_PREFIXES.MISTAKE).catch(() => [] as MistakeRecord[]),
      listItems<FavoriteDeck>(KEY_PREFIXES.DECK).catch(() => [] as FavoriteDeck[]),
      listItems<Reminder>(KEY_PREFIXES.REMINDER).catch(() => [] as Reminder[]),
      listItems<{ date?: string }>(KEY_PREFIXES.PRIORITY_CACHE).catch(
        () => [] as { date?: string }[],
      ),
    ]);

  // 2. 筛选属于该计划的数据
  // ReviewLog 无 planId 字段，通过关联的 cardId 反查：
  //   先找出该计划的所有卡片 id，再匹配 reviewLog.cardId
  const planCardIds = new Set(cards.filter((c) => c.planId === planId).map((c) => c.id));
  const cardsToDelete = cards.filter((c) => c.planId === planId);
  const reviewLogsToDelete = reviewLogs.filter((log) => planCardIds.has(log.cardId));
  const learnLogsToDelete = learnLogs.filter((log) => log.planId === planId);
  const mistakesToDelete = mistakes.filter((m) => m.planId === planId);
  const decksToDelete = decks.filter((d) => d.planId === planId);
  const remindersToDelete = reminders.filter((r) => r.planId === planId);

  // 3. 串行删除（IndexedDB 单事务语义）
  // 每步独立 try/catch：单步失败不中断后续清理（旧版无 try/catch 导致级联中断留孤儿）
  await safeDelete("plan", () => delItem(KEY_PREFIXES.PLAN + planId), result, "plan");
  await safeDelete(
    "plan_summary",
    () => deletePlanSummary(planId),
    result,
    "planSummary",
  );

  for (const card of cardsToDelete) {
    await safeDelete(
      `card:${card.id}`,
      () => delItem(KEY_PREFIXES.CARD + card.id),
      result,
      "cards",
    );
  }
  for (const log of reviewLogsToDelete) {
    await safeDelete(
      `review_log:${log.id}`,
      () => delItem(KEY_PREFIXES.REVIEW_LOG + log.id),
      result,
      "reviewLogs",
    );
  }
  for (const log of learnLogsToDelete) {
    await safeDelete(
      `learn_log:${log.id}`,
      () => delItem(KEY_PREFIXES.LEARN_LOG + log.id),
      result,
      "learnLogs",
    );
  }
  for (const mistake of mistakesToDelete) {
    await safeDelete(
      `mistake:${mistake.id}`,
      () => delItem(KEY_PREFIXES.MISTAKE + mistake.id),
      result,
      "mistakes",
    );
  }
  for (const deck of decksToDelete) {
    await safeDelete(
      `deck:${deck.id}`,
      () => delItem(KEY_PREFIXES.DECK + deck.id),
      result,
      "decks",
    );
  }
  for (const reminder of remindersToDelete) {
    await safeDelete(
      `reminder:${reminder.id}`,
      () => delItem(KEY_PREFIXES.REMINDER + reminder.id),
      result,
      "reminders",
    );
  }

  // PRIORITY_CACHE 按 date 存（key = priority_cache:<YYYY-MM-DD>），无 planId 字段。
  // 策略：全部删除（当日缓存会在下次访问首页时由 priority-engine 重建）。
  // 这是安全的：缓存本质是临时数据，重建无副作用，且能确保已删计划的复习任务
  // 不再出现在首页今日清单。
  for (const cache of priorityCaches) {
    const cacheKey = cache?.date;
    if (cacheKey) {
      await safeDelete(
        `priority_cache:${cacheKey}`,
        () => delItem(KEY_PREFIXES.PRIORITY_CACHE + cacheKey),
        result,
        "priorityCaches",
      );
    }
  }

  return result;
}

/**
 * 扫描并清除"孤儿"关联数据：引用了不存在 planId 的卡片 / 日志 / 错题 / 试题集。
 *
 * 背景：用户反馈"删除知识库后复习里还包含那些题目"，除了当前删除流程的漏删，
 * 历史上多次删除流程中断 / 旧版漏删 REVIEW_LOG / 数据迁移残留等都会留下孤儿。
 * 这些孤儿数据会被复习页 / 统计页读到，表现为"已删计划的题目还在"。
 *
 * 调用时机：
 *   - 删除计划后调用（清理本次 + 历史残骸）
 *   - 应用启动时可选调用（定期清扫，成本可控因为 listItems 走 IndexedDB 全量扫描）
 *
 * @returns 清理掉的孤儿条目数
 */
export async function sweepOrphanPlanData(): Promise<{
  cards: number;
  reviewLogs: number;
  learnLogs: number;
  mistakes: number;
  decks: number;
}> {
  // 1. 拿到所有现存 planId（真相源）
  const plans = await listItems<{ id: string }>(KEY_PREFIXES.PLAN).catch(
    () => [] as { id: string }[],
  );
  const validPlanIds = new Set(plans.map((p) => p.id));
  if (validPlanIds.size === 0) return { cards: 0, reviewLogs: 0, learnLogs: 0, mistakes: 0, decks: 0 };

  // 2. 查询卡片，识别孤儿卡片（planId 不在 validPlanIds 中）
  //    先确定孤儿卡片，再用"保留卡片"判断 reviewLog 孤儿，
  //    避免"孤儿卡片还活着 → 其 reviewLog 不算孤儿 → 扫不到"的遗漏。
  const cards = await listItems<ReviewCard>(KEY_PREFIXES.CARD).catch(
    () => [] as ReviewCard[],
  );
  const orphanCards = cards.filter((c) => !validPlanIds.has(c.planId));
  // 保留的卡片 id（删除孤儿卡片后仍存在的）
  const survivingCardIds = new Set(
    cards.filter((c) => validPlanIds.has(c.planId)).map((c) => c.id),
  );

  // 3. 并行扫描各关联表，找出孤儿
  const [reviewLogs, learnLogs, mistakes, decks] = await Promise.all([
    listItems<ReviewLog>(KEY_PREFIXES.REVIEW_LOG).catch(() => [] as ReviewLog[]),
    listItems<LearnLog>(KEY_PREFIXES.LEARN_LOG).catch(() => [] as LearnLog[]),
    listItems<MistakeRecord>(KEY_PREFIXES.MISTAKE).catch(() => [] as MistakeRecord[]),
    listItems<FavoriteDeck>(KEY_PREFIXES.DECK).catch(() => [] as FavoriteDeck[]),
  ]);

  // ReviewLog 无 planId，通过 cardId 反查：
  //   cardId 不在 survivingCardIds（保留的卡片）中即为孤儿。
  //   这包括两种情况：卡片已被之前的删除流程删掉，或卡片本身是即将被删的孤儿。
  const orphanReviewLogs = reviewLogs.filter(
    (log) => !survivingCardIds.has(log.cardId),
  );
  const orphanLearnLogs = learnLogs.filter(
    (log) => !validPlanIds.has(log.planId) && log.planId !== "standalone",
  );
  const orphanMistakes = mistakes.filter((m) => !validPlanIds.has(m.planId));
  const orphanDecks = decks.filter((d) => !validPlanIds.has(d.planId));

  // 3. 串行删除（每步独立 try/catch，失败不中断）
  let deletedCards = 0;
  let deletedReviewLogs = 0;
  let deletedLearnLogs = 0;
  let deletedMistakes = 0;
  let deletedDecks = 0;

  for (const card of orphanCards) {
    try {
      await delItem(KEY_PREFIXES.CARD + card.id);
      deletedCards++;
    } catch {
      // 静默失败，继续清理其他
    }
  }
  for (const log of orphanReviewLogs) {
    try {
      await delItem(KEY_PREFIXES.REVIEW_LOG + log.id);
      deletedReviewLogs++;
    } catch {
      // 静默失败
    }
  }
  for (const log of orphanLearnLogs) {
    try {
      await delItem(KEY_PREFIXES.LEARN_LOG + log.id);
      deletedLearnLogs++;
    } catch {
      // 静默失败
    }
  }
  for (const mistake of orphanMistakes) {
    try {
      await delItem(KEY_PREFIXES.MISTAKE + mistake.id);
      deletedMistakes++;
    } catch {
      // 静默失败
    }
  }
  for (const deck of orphanDecks) {
    try {
      await delItem(KEY_PREFIXES.DECK + deck.id);
      deletedDecks++;
    } catch {
      // 静默失败
    }
  }

  return {
    cards: deletedCards,
    reviewLogs: deletedReviewLogs,
    learnLogs: deletedLearnLogs,
    mistakes: deletedMistakes,
    decks: deletedDecks,
  };
}
