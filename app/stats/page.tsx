"use client";

// app/stats/page.tsx
// 数据可视化总览：顶部 Tab 切换 热力图 / 雷达图 / 周报

import { useState, useEffect } from "react";
import Link from "next/link";
import { Heatmap } from "@/components/Heatmap";
import { RadarChart } from "@/components/RadarChart";
import { WeeklyReport } from "@/components/WeeklyReport";
import { listItems } from "@/lib/storage/db";
import type { KnowledgeNode, ReviewCard, ReviewLog, LearnLog, DailyStatus, LearningPlan } from "@/lib/types";

type Tab = "heatmap" | "radar" | "weekly";

export default function StatsPage() {
  const [tab, setTab] = useState<Tab>("heatmap");
  const [nodes, setNodes] = useState<KnowledgeNode[]>([]);
  const [cards, setCards] = useState<ReviewCard[]>([]);
  const [reviewLogs, setReviewLogs] = useState<ReviewLog[]>([]);
  const [learnLogs, setLearnLogs] = useState<LearnLog[]>([]);
  const [statuses, setStatuses] = useState<DailyStatus[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      // 聚合所有计划的 KnowledgeNode + ReviewCard
      const plans = await listItems<LearningPlan>("plan:");
      const allNodes: KnowledgeNode[] = plans.flatMap((p) => p.knowledgeTree ?? []);
      const cs = await listItems<ReviewCard>("card:");

      // 聚合日志
      const learnLogsArr = await listItems<LearnLog>("learn_log:");
      const reviewLogsArr = await listItems<ReviewLog>("review_log:");

      // 聚合状态
      const statusArr = await listItems<DailyStatus>("status:");

      setNodes(allNodes);
      setCards(cs);
      setReviewLogs(reviewLogsArr);
      setLearnLogs(learnLogsArr);
      setStatuses(statusArr);
      setLoading(false);
    })();
  }, []);

  if (loading) {
    return <div className="p-8 text-gray-500">加载中...</div>;
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">学习数据</h1>
        <Link
          href="/stats/ai-quality"
          className="text-sm text-blue-500 hover:underline"
        >
          AI 质量 →
        </Link>
      </div>

      <div className="flex gap-2 border-b">
        {([
          { id: "heatmap" as const, label: "热力图" },
          { id: "radar" as const, label: "雷达图" },
          { id: "weekly" as const, label: "周报" },
        ]).map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`-mb-px border-b-2 px-4 py-2 ${
              tab === t.id ? "border-blue-600 text-blue-600" : "border-transparent text-gray-600"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "heatmap" && <Heatmap weeks={12} />}

      {tab === "radar" && <RadarChart nodes={nodes} cards={cards} logs={reviewLogs} />}

      {tab === "weekly" && <WeeklyReport learnLogs={learnLogs} reviewLogs={reviewLogs} statuses={statuses} />}
    </div>
  );
}
