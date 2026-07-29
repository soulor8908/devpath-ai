"use client";

// app/learn/list/ListClient.tsx
// 学习计划列表页：展示所有计划摘要，点击进详情，支持删除。
// 空态防御：若用户在本页把所有计划删完，自动跳回 /learn/new。

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { listPlanSummaries, migrateSummaries } from "@/lib/plan-summary";
import { deletePlanCascade, sweepOrphanPlanData } from "@/lib/plan-cleanup";
import { type LearningPlanSummary } from "@/lib/types";
import { Icon } from "@/components/Icon";
import { Button, ProgressBar, type ProgressBarColor } from "@/components/ui";

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
  // 2026-07-26 修复（用户反馈"删除知识库后复习里还包含那些题目"）：
  //   旧版 deletePlan 内联在组件里，漏删 ReviewLog / PRIORITY_CACHE / Reminder，
  //   且无 try/catch（任一 delItem 失败 → 后续级联中断 → 留下孤儿卡片 / 日志）。
  //   现收敛到 lib/plan-cleanup.ts 的 deletePlanCascade：
  //     1. 覆盖全部关联类型（含 REVIEW_LOG 通过 cardId 反查、PRIORITY_CACHE 全清）
  //     2. 每步独立 try/catch，单步失败不中断
  //     3. 删除后调 sweepOrphanPlanData 清扫历史残骸（旧版漏删留下的孤儿）
  //   不删除：PomodoroSession（历史专注记录，与计划解耦，用于统计/打卡）
  //         EmotionEntry / EnergySample（用户级数据，与计划无关）
  async function deletePlan(planId: string, e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (confirmingDeleteId !== planId) {
      setConfirmingDeleteId(planId);
      setTimeout(() => setConfirmingDeleteId(null), 3000);
      return;
    }
    // 级联删除当前计划 + 扫描历史孤儿数据
    // sweepOrphanPlanData 走 IndexedDB 全量扫描，数据量不大时可在 100ms 内完成
    await deletePlanCascade(planId);
    // 清扫历史残骸（之前删除流程中断 / 旧版漏删留下的孤儿卡片 / 日志）
    // 静默执行，不阻塞 UI
    void sweepOrphanPlanData().catch(() => {
      // 清扫失败不影响本次删除结果
    });

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
        <p className="text-sm text-gray-500 mt-3">加载学习计划…</p>
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
        {plans.map((p) => {
          // 2026-07-26 修复（用户反馈"我答对了进度还是 0"）：
          // 在列表卡片直接展示"已看懂 X/Y 题"进度，让用户看到点击效果
          // understoodCount 由 toSummary 派生（plan.questions.filter(q => q.understood).length）
          // 旧 summary 缺此字段时 normalizePlanSummary 回退为 0（向后兼容）
          const understood = p.understoodCount ?? 0;
          const total = p.questionCount ?? 0;
          const hasProgress = total > 0;
          const progressPct = hasProgress ? Math.round((understood / total) * 100) : 0;
          // 全部看懂显示绿色，部分进度显示蓝色，未开始显示灰色
          const progressColor: ProgressBarColor =
            understood === 0
              ? "gray"
              : understood >= total
                ? "green"
                : "blue";
          return (
            <Link
              key={p.id}
              href={`/learn/${p.id}`}
              className="block border rounded-lg p-4 hover:bg-gray-50 hover:border-blue-300 transition-colors bg-white"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-base font-medium truncate">{p.topic}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {p.knowledgeCount} 知识点 · {p.questionCount} 题 ·{" "}
                    {p.scheduleDays} 天计划 · 每日 {p.dailyMinutes} 分钟
                  </p>
                  {/* 进度展示（2026-07-26 新增）：让用户在列表页就能看到学习进度 */}
                  {hasProgress && (
                    <div className="mt-2 flex items-center gap-2">
                      <ProgressBar
                        value={understood}
                        max={total}
                        color={progressColor}
                        size="xs"
                        widthClassName="w-24"
                        label={`已看懂 ${understood} / ${total} 题，进度 ${progressPct}%`}
                      />
                      <span
                        className={`text-2xs ${
                          understood === 0
                            ? "text-gray-500 dark:text-gray-400"
                            : understood >= total
                              ? "text-green-600 dark:text-green-400"
                              : "text-blue-600 dark:text-blue-400"
                        }`}
                      >
                        已看懂 {understood}/{total} 题
                        {understood >= total && " · 已完成"}
                      </span>
                    </div>
                  )}
                  <p className="text-2xs text-gray-500 mt-0.5">
                    创建于 {new Date(p.createdAt).toLocaleDateString("zh-CN")}
                  </p>
                </div>
                <div className="flex items-center gap-2 ml-2">
                  <Button
                    onClick={(e) => deletePlan(p.id, e)}
                    variant={confirmingDeleteId === p.id ? "danger" : "ghost"}
                    size="sm"
                    aria-label={confirmingDeleteId === p.id ? "确认删除" : "删除计划"}
                  >
                    {confirmingDeleteId === p.id ? (
                      "确认删除"
                    ) : (
                      <Icon name="x" className="w-3.5 h-3.5 inline-block" />
                    )}
                  </Button>
                  <span className="text-xs text-gray-500">查看 →</span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      <p className="text-center text-xs text-gray-500 dark:text-gray-400 mt-8">
        <Icon name="lightbulb" className="w-3.5 h-3.5 inline-block align-middle" />{" "}
        点击计划卡片进入学习详情
      </p>
    </div>
  );
}
