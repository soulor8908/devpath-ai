"use client";

// components/ShareCardButton.tsx
// 「生成分享图」按钮：聚合数据 → 调 generateShareCard → 触发下载

import { useState } from "react";
import { generateShareCard } from "@/lib/share-image";
import { listItems } from "@/lib/storage/db";
import type { PublicProfile, LearnLog, ReviewCard } from "@/lib/types";
import { Icon } from "@/components/Icon";

interface Props {
  profile: PublicProfile;
}

export function ShareCardButton({ profile }: Props) {
  const [generating, setGenerating] = useState(false);

  async function handleClick() {
    setGenerating(true);
    try {
      // 聚合数据
      const learnLogs = await listItems<LearnLog>("learn_log:");
      const cards = await listItems<ReviewCard>("card:");

      const datesSet = new Set(learnLogs.map((l) => l.date));
      let streakDays = 0;
      const cursor = new Date();
      while (datesSet.has(cursor.toISOString().slice(0, 10))) {
        streakDays++;
        cursor.setDate(cursor.getDate() - 1);
      }
      const totalMinutes = learnLogs.reduce((s, l) => s + (l.duration ?? 0), 0);

      const heatmapData = learnLogs.reduce((acc: Array<{ date: string; count: number }>, l) => {
        const existing = acc.find((x) => x.date === l.date);
        if (existing) existing.count += (l.duration ?? 0);
        else acc.push({ date: l.date, count: l.duration ?? 0 });
        return acc;
      }, []);

      const radarData = profile.visibility.radar
        ? cards.slice(0, 5).map((c) => ({
            node: c.nodeId,
            value: Math.min(100, Math.round((c.stability / 30) * 100)),
          }))
        : undefined;

      const blob = await generateShareCard({
        username: profile.username,
        displayName: profile.displayName,
        streakDays,
        totalMinutes,
        heatmapData: profile.visibility.heatmap ? heatmapData : undefined,
        radarData,
      });

      // 触发下载
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `devpath-${profile.username}-${new Date().toISOString().slice(0, 10)}.png`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setGenerating(false);
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={generating}
      className="flex items-center gap-1.5 rounded-lg border dark:border-gray-600 px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 transition-colors"
    >
      <Icon name="sparkles" className="w-4 h-4" />
      {generating ? "生成中..." : "生成分享图"}
    </button>
  );
}
