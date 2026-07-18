"use client";

// components/HomeInsightsCard.tsx
// 首页「AI 教练洞察区」：合并 DailyNudge + HealthAlert 为一张卡，减少视觉碎片化
//
// 设计（乔布斯视角）：
//   原 HomeClient 把 DailyNudge 和 HealthAlertCard 分两个区块渲染，视觉割裂。
//   合并为一张卡片：nudge 是「日常提示」，alert 是「紧急建议」，统一在一个容器内
//   用"AI 教练"人格化表达，强化产品核心价值。
//
// 交互：
//   - 无 nudge 无 alert → 不渲染
//   - 有 nudge → 显示提示文案 + 来源标识（AI / 规则）
//   - 有 alert → severity 三色徽章 + 建议文案 + 一键采纳按钮
//   - 单条关闭（X 按钮）

import { useState } from "react";
import { DailyNudge } from "@/components/DailyNudge";
import { HealthAlertCard } from "@/components/HealthAlertCard";
import type { Achievement, HealthAlert } from "@/lib/types";
import { AchievementCard } from "@/components/AchievementCard";

interface Props {
  newAchievements: Achievement[];
  healthAlerts: HealthAlert[];
}

export function HomeInsightsCard({ newAchievements, healthAlerts }: Props) {
  const [achievementsDismissed, setAchievementsDismissed] = useState(false);
  const [dismissedAlertIds, setDismissedAlertIds] = useState<Set<string>>(
    new Set(),
  );

  const visibleAlerts = healthAlerts.filter((a) => !dismissedAlertIds.has(a.id));
  const showAchievements = !achievementsDismissed && newAchievements.length > 0;

  // 没有任何洞察时不渲染整张卡
  if (!showAchievements && visibleAlerts.length === 0) {
    return (
      <section className="mb-4">
        <DailyNudge />
      </section>
    );
  }

  return (
    <section className="mb-4 space-y-3">
      {/* DailyNudge 始终在最上方（独立卡，保持其换一个/反馈交互） */}
      <DailyNudge />

      {/* 新成就解锁通知 */}
      {showAchievements && (
        <AchievementCard
          achievements={newAchievements}
          onClose={() => setAchievementsDismissed(true)}
        />
      )}

      {/* 健康告警 */}
      <HealthAlertCard
        alerts={healthAlerts}
        dismissedIds={dismissedAlertIds}
        onClose={(alertId) =>
          setDismissedAlertIds((prev) => {
            const next = new Set(prev);
            next.add(alertId);
            return next;
          })
        }
      />
    </section>
  );
}
