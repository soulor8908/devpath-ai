"use client";

// components/ShareCardButton.tsx
// 「生成分享图」按钮：聚合数据 → 调 generateShareCard → 触发下载

import { useState } from "react";
import { generateShareCard } from "@/lib/share-image";
import { listItems } from "@/lib/storage/db";
import type { PublicProfile, LearnLog, ReviewCard } from "@/lib/types";
import { Icon } from "@/components/Icon";
import { toast } from "@/lib/toast";
import { Button } from "@/components/ui";

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

      // visibility 可能为 undefined（旧数据/未初始化），做 null-safety 降级
      const vis = profile.visibility ?? { radar: true, heatmap: true, currentTopic: true, notes: false, achievements: true };
      const radarData = vis.radar
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
        heatmapData: vis.heatmap ? heatmapData : undefined,
        radarData,
        // 公开主页 URL（用于生成二维码，扫码即可访问）
        shareUrl: `${window.location.origin}/u/${encodeURIComponent(profile.username)}`,
      });

      // 触发下载
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `devpath-${profile.username}-${new Date().toISOString().slice(0, 10)}.png`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("[share-image] 生成失败:", err);
      toast.error(`分享图生成失败：${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setGenerating(false);
    }
  }

  return (
    <Button
      variant="secondary"
      onClick={handleClick}
      loading={generating}
      leftIcon="sparkles"
    >
      {generating ? "生成中..." : "生成分享图"}
    </Button>
  );
}
