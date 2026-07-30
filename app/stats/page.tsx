"use client";

// app/stats/page.tsx
// 数据可视化总览：顶部 Tab 切换 热力图 / 雷达图 / 周报
// 阶段 7：支持 ?tab= query 初始化（来自「我的」统计按钮跳转）
//
// 2026-07-30 性能优化（卡帕西视角）：
//   3 个 tab 内容（Heatmap/RadarChart/WeeklyReport）改 next/dynamic 异步加载。
//   - Heatmap 内部已 dynamic 加载 react-activity-calendar（~80KB）
//   - RadarChart 内部已 dynamic 加载 recharts（~234KB）
//   - WeeklyReport 静态依赖 CodeBlock + ai-task-queue + quality-tracker
//   旧版三者静态 import 全打进 /stats 首屏 chunk（163KB First Load）。
//   改造后只加载当前活动 tab 的 chunk，其他 tab 点击时再加载（带 loading 反馈）。
//   配合 Tab 切换时的 loading 态，用户感知"立即响应"而非"白屏等待"。

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui";
import { listItems } from "@/lib/storage/db";
import type { KnowledgeNode, ReviewCard, ReviewLog, LearnLog, DailyStatus, LearningPlan } from "@/lib/types";

type Tab = "heatmap" | "radar" | "weekly";

const VALID_TABS: Tab[] = ["heatmap", "radar", "weekly"];

function parseTab(value: string | null | undefined): Tab {
  if (value && (VALID_TABS as string[]).includes(value)) return value as Tab;
  return "heatmap";
}

// 3 个 tab 内容异步加载：每个 tab 成为独立 chunk，仅活动 tab 下载
const Heatmap = dynamic(
  () => import("@/components/Heatmap").then((m) => m.Heatmap),
  {
    loading: () => (
      <div className="flex items-center justify-center min-h-[200px] text-sm text-gray-500 dark:text-gray-400">
        加载热力图...
      </div>
    ),
  },
);
const RadarChart = dynamic(
  () => import("@/components/RadarChart").then((m) => m.RadarChart),
  {
    loading: () => (
      <div className="flex items-center justify-center min-h-[320px] text-sm text-gray-500 dark:text-gray-400">
        加载雷达图...
      </div>
    ),
  },
);
const WeeklyReport = dynamic(
  () => import("@/components/WeeklyReport").then((m) => m.WeeklyReport),
  {
    loading: () => (
      <div className="flex items-center justify-center min-h-[200px] text-sm text-gray-500 dark:text-gray-400">
        加载周报...
      </div>
    ),
  },
);

function StatsInner() {
  const searchParams = useSearchParams();
  const [tab, setTab] = useState<Tab>(() => parseTab(searchParams.get("tab")));
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
          <Button
            key={t.id}
            onClick={() => setTab(t.id)}
            variant={tab === t.id ? "primary" : "ghost"}
            size="sm"
            className="-mb-px"
          >
            {t.label}
          </Button>
        ))}
      </div>

      {tab === "heatmap" && <Heatmap weeks={12} />}

      {tab === "radar" && <RadarChart nodes={nodes} cards={cards} logs={reviewLogs} />}

      {tab === "weekly" && <WeeklyReport learnLogs={learnLogs} reviewLogs={reviewLogs} statuses={statuses} />}
    </div>
  );
}

export default function StatsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-gray-500">加载中...</div>}>
      <StatsInner />
    </Suspense>
  );
}
