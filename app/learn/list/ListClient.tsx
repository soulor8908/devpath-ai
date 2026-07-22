"use client";

// app/learn/list/ListClient.tsx
// 学习计划列表页：展示所有计划摘要，点击进详情，支持删除。
// 空态防御：若用户在本页把所有计划删完，自动跳回 /learn/new。

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { listPlanSummaries, migrateSummaries, deletePlanSummary } from "@/lib/plan-summary";
import { delItem, listItems } from "@/lib/storage/db";
import {
  KEY_PREFIXES,
  type LearningPlanSummary,
  type ReviewCard,
  type LearnLog,
  type MistakeRecord,
  type FavoriteDeck,
} from "@/lib/types";
import { Icon } from "@/components/Icon";
import { Button } from "@/components/ui";

export default function ListClient() {
  const router = useRouter();
  // router 通过 ref 在 effect 内访问，避免 router 引用抖动触发无限渲染（React #185）
  const routerRef = useRef(router);
  routerRef.current = router;
  const [plans, setPlans] = useState<LearningPlanSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirmingDeleteId, setConfirmingDeleteId] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      await migrateSummaries();
      const summaries = await listPlanSummaries();
      if (summaries.length === 0) {
        // 防御：理论上 router 不会让 0 计划用户进入 list，
        // 但用户可能在本页删完所有计划，此时回到创建页
        routerRef.current.replace("/learn/new");
        return;
      }
      setPlans(summaries);
    } finally {
      setLoading(false);
    }
    // router 通过 ref 访问，不作为依赖（ref 引用稳定）
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  // 删除学习计划 + 联动清理关联数据（避免孤立数据残留）
  // 联动清理范围：
  //   1. 计划本身（KEY_PREFIXES.PLAN）
  //   2. 计划摘要（PlanSummary，列表/首页用）
  //   3. FSRS 复习卡片（KEY_PREFIXES.CARD，card.planId === planId）
  //   4. 学习日志（KEY_PREFIXES.LEARN_LOG，log.planId === planId）
  //   5. 错题记录（KEY_PREFIXES.MISTAKE，mistake.planId === planId）
  //   6. 收藏的知识库（KEY_PREFIXES.DECK，deck.planId === planId）
  // 不删除：PomodoroSession（历史专注记录，用于统计/打卡，与计划解耦）
  //         EmotionEntry / EnergySample（用户级数据，与计划无关）
  async function deletePlan(planId: string, e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (confirmingDeleteId !== planId) {
      setConfirmingDeleteId(planId);
      setTimeout(() => setConfirmingDeleteId(null), 3000);
      return;
    }
    // 并行查询所有关联数据，再串行删除（查询无依赖，删除按类型批量执行）
    const [cards, logs, mistakes, decks] = await Promise.all([
      listItems<ReviewCard>(KEY_PREFIXES.CARD),
      listItems<LearnLog>(KEY_PREFIXES.LEARN_LOG),
      listItems<MistakeRecord>(KEY_PREFIXES.MISTAKE),
      listItems<FavoriteDeck>(KEY_PREFIXES.DECK),
    ]);
    const cardsToDelete = cards.filter((c) => c.planId === planId);
    const logsToDelete = logs.filter((l) => l.planId === planId);
    const mistakesToDelete = mistakes.filter((m) => m.planId === planId);
    const decksToDelete = decks.filter((d) => d.planId === planId);

    // 串行删除（IndexedDB 单事务，避免并发冲突）
    await delItem(KEY_PREFIXES.PLAN + planId);
    await deletePlanSummary(planId);
    for (const card of cardsToDelete) {
      await delItem(KEY_PREFIXES.CARD + card.id);
    }
    for (const log of logsToDelete) {
      await delItem(KEY_PREFIXES.LEARN_LOG + log.id);
    }
    for (const mistake of mistakesToDelete) {
      await delItem(KEY_PREFIXES.MISTAKE + mistake.id);
    }
    for (const deck of decksToDelete) {
      await delItem(KEY_PREFIXES.DECK + deck.id);
    }

    const remaining = plans.filter((p) => p.id !== planId);
    setPlans(remaining);
    setConfirmingDeleteId(null);
    if (remaining.length === 0) {
      router.replace("/learn/new");
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-8">
        <div className="w-8 h-8 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin" />
        <p className="text-sm text-gray-400 mt-3">加载学习计划…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 max-w-2xl mx-auto">
      <header className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">我的学习</h1>
          <p className="text-sm text-gray-500 mt-1">
            共 {plans.length} 个计划
          </p>
        </div>
        <Link
          href="/learn/new"
          className="flex items-center gap-1 px-4 py-2 bg-black text-white text-sm rounded-lg font-medium hover:bg-gray-800 transition-colors"
        >
          <Icon name="plus" className="w-4 h-4 inline-block" />
          新建
        </Link>
      </header>

      <div className="space-y-2">
        {plans.map((p) => (
          <Link
            key={p.id}
            href={`/learn/${p.id}`}
            className="block border rounded-lg p-4 hover:bg-gray-50 hover:border-blue-300 transition-colors bg-white"
          >
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-base font-medium truncate">{p.topic}</p>
                <p className="text-xs text-gray-400 mt-1">
                  {p.knowledgeCount} 知识点 · {p.questionCount} 题 ·{" "}
                  {p.scheduleDays} 天计划 · 每日 {p.dailyMinutes} 分钟
                </p>
                <p className="text-2xs text-gray-400 mt-0.5">
                  创建于 {new Date(p.createdAt).toLocaleDateString("zh-CN")}
                </p>
              </div>
              <div className="flex items-center gap-2 ml-2">
                <Button
                  onClick={(e) => deletePlan(p.id, e)}
                  variant={confirmingDeleteId === p.id ? "danger" : "ghost"}
                  size="sm"
                  aria-label="删除计划"
                >
                  {confirmingDeleteId === p.id ? (
                    "确认删除"
                  ) : (
                    <Icon name="x" className="w-3.5 h-3.5 inline-block" />
                  )}
                </Button>
                <span className="text-xs text-gray-400">查看 →</span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <p className="text-center text-xs text-gray-300 mt-8">
        <Icon name="lightbulb" className="w-3.5 h-3.5 inline-block align-middle" />{" "}
        点击计划卡片进入学习详情
      </p>
    </div>
  );
}
