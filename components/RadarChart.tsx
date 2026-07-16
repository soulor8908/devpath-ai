"use client";

// components/RadarChart.tsx
// 能力雷达图：每个知识节点一个轴（最多 8 个），5 个维度可切换
// 维度：掌握度 / 正确率 / 练习次数 / 活跃度 / 面试权重
// recharts 重依赖通过 dynamic import 懒加载（D8 优化）

import { useState, useMemo } from "react";
import dynamic from "next/dynamic";
import type { KnowledgeNode, ReviewLog, ReviewCard } from "@/lib/types";

const RadarChartContent = dynamic(
  () => import("./RadarChartContent").then((m) => m.RadarChartContent),
  {
    loading: () => (
      <div className="flex h-80 items-center justify-center text-sm text-gray-400">
        加载图表...
      </div>
    ),
    ssr: false,
  },
);

type Dimension = "mastery" | "accuracy" | "practice" | "activity" | "frequency";

interface NodeStat {
  nodeId: string;
  title: string;
  mastery: number; // 0-100
  accuracy: number; // 0-100
  practice: number; // 练习次数
  activity: number; // 最近 7 天活跃度 0-100
  frequency: number; // 面试权重 高=100 中=60 低=30
}

interface Props {
  nodes: KnowledgeNode[];
  cards: ReviewCard[];
  logs: ReviewLog[];
  /** 外部传入节点统计（优先）；不传则内部计算 */
  stats?: NodeStat[];
}

const DIM_LABELS: Record<Dimension, string> = {
  mastery: "掌握度",
  accuracy: "正确率",
  practice: "练习次数",
  activity: "活跃度",
  frequency: "面试权重",
};

function frequencyToScore(f: "高" | "中" | "低"): number {
  return f === "高" ? 100 : f === "中" ? 60 : 30;
}

export function RadarChart({ nodes, cards, logs, stats }: Props) {
  const [dimension, setDimension] = useState<Dimension>("mastery");

  const computedStats: NodeStat[] = useMemo(() => {
    if (stats) return stats.slice(0, 8);
    return nodes.slice(0, 8).map((node) => {
      const nodeCards = cards.filter((c) => c.nodeId === node.id);
      const nodeLogs = logs.filter((l) => nodeCards.some((c) => c.id === l.cardId));
      const correctCount = nodeLogs.filter((l) => l.rating >= 3).length;
      const accuracy = nodeLogs.length > 0 ? Math.round((correctCount / nodeLogs.length) * 100) : 0;
      const practice = nodeLogs.length;
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      const recentLogs = nodeLogs.filter((l) => new Date(l.date) >= sevenDaysAgo);
      const activity = Math.min(100, recentLogs.length * 20);
      return {
        nodeId: node.id,
        title: node.title,
        mastery: node.mastery,
        accuracy,
        practice: Math.min(100, practice * 10),
        activity,
        frequency: frequencyToScore(node.frequency),
      };
    });
  }, [nodes, cards, logs, stats]);

  const chartData = computedStats.map((s) => ({
    node: s.title.length > 8 ? s.title.slice(0, 8) + "…" : s.title,
    value: s[dimension],
  }));

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {(Object.keys(DIM_LABELS) as Dimension[]).map((d) => (
          <button
            key={d}
            onClick={() => setDimension(d)}
            className={`rounded-full px-3 py-1 text-sm ${
              dimension === d ? "bg-blue-600 text-white" : "border text-gray-700"
            }`}
          >
            {DIM_LABELS[d]}
          </button>
        ))}
      </div>
      <div className="h-80 w-full">
        <RadarChartContent data={chartData} />
      </div>
      {computedStats.length === 0 && <p className="text-center text-sm text-gray-500">暂无知识节点</p>}
    </div>
  );
}
