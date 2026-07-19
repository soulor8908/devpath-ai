"use client";

// components/HealthAlertCard.tsx
// 计划健康检查告警卡片：首页顶部展示，可关闭 + "一键采纳"
//
// 设计：
//   - 与 AchievementCard 同级，但展示的是 HealthAlert（来自 planHealthCheck）
//   - 每条 alert 一行：severity icon + title + description + suggestedAction
//   - severity=critical 用红色边框，warning 用橙色，info 用蓝色
//   - "一键采纳"按钮：调用 priority-engine 的 rankTasks 重排今日待学任务，
//     结果持久化到 priority_cache:<today>（不消耗 AI 额度，当日有效）
//   - 已采纳的 alert 标记为 resolved（隐藏采纳按钮，仅保留关闭）
//   - 已关闭的 alert 隐藏整张卡片
//   - dark mode 支持

import { useState } from "react";
import { Icon, type IconName } from "@/components/Icon";
import type { HealthAlert } from "@/lib/types";
import { listItems } from "@/lib/storage/db";
import {
  KEY_PREFIXES,
  type LearningPlan,
  type ReviewCard,
  type ScheduleItem,
  type MistakeRecord,
  type DailyStatus,
} from "@/lib/types";
import { rankTasks, setCachedPriority } from "@/lib/ai/priority-engine";
import { chinaDateNow } from "@/lib/time";
import { Button } from "@/components/ui";

interface HealthAlertCardProps {
  alerts: HealthAlert[];
  /** 已关闭的 alert id 集合（由父组件管理，刷新后重置） */
  dismissedIds: Set<string>;
  onClose: (alertId: string) => void;
}

/** severity → 视觉风格 */
function severityStyle(sev: HealthAlert["severity"]): {
  border: string;
  bg: string;
  text: string;
  iconColor: string;
  icon: IconName;
} {
  switch (sev) {
    case "critical":
      return {
        border: "border-red-300 dark:border-red-800",
        bg: "bg-red-50 dark:bg-red-950/30",
        text: "text-red-800 dark:text-red-300",
        iconColor: "text-red-600 dark:text-red-400",
        icon: "alert",
      };
    case "warning":
      return {
        border: "border-orange-300 dark:border-orange-800",
        bg: "bg-orange-50 dark:bg-orange-950/30",
        text: "text-orange-800 dark:text-orange-300",
        iconColor: "text-orange-600 dark:text-orange-400",
        icon: "alert",
      };
    case "info":
    default:
      return {
        border: "border-blue-300 dark:border-blue-800",
        bg: "bg-blue-50 dark:bg-blue-950/30",
        text: "text-blue-800 dark:text-blue-300",
        iconColor: "text-blue-600 dark:text-blue-400",
        icon: "info",
      };
  }
}

/**
 * 一键采纳：调用 priority-engine 重新排优先级
 * - 收集所有活跃计划的今日未完成 schedule 项
 * - 调 rankTasks 计算新顺序
 * - 持久化到 priority_cache:<today>（当日有效）
 * - 不消耗 AI 额度
 */
async function adoptOptimizeSchedule(): Promise<{ count: number; reason: string }> {
  const today = chinaDateNow();
  const now = new Date();

  const [plans, cards, mistakes, statuses] = await Promise.all([
    listItems<LearningPlan>(KEY_PREFIXES.PLAN),
    listItems<ReviewCard>(KEY_PREFIXES.CARD),
    listItems<MistakeRecord>(KEY_PREFIXES.MISTAKE),
    listItems<DailyStatus>(KEY_PREFIXES.STATUS),
  ]);

  const activePlans = plans.filter((p) => !p.frozen);
  // 收集所有未完成的 learn 任务（任意 day，避免遗漏逾期项）
  const tasks: ScheduleItem[] = activePlans.flatMap((p) =>
    p.schedule.filter((s) => s.type === "learn" && !s.completed),
  );

  // 今日能量（无则 null，priority-engine 自有冷启动逻辑）
  const todayStatus = statuses.find((s) => s.date === today);
  const energy = todayStatus?.energy ?? null;

  // preferredSlots 从画像读取（无画像时为空数组，energy_fit 自动冷启动）
  // 此处不强制读画像，保持简单；rankTasks 在 preferredSlots=[] 时也能工作
  const preferredSlots: string[] = [];

  const ranked = rankTasks(tasks, {
    plans: activePlans,
    cards,
    mistakes,
    energy,
    preferredSlots,
    now,
  });

  await setCachedPriority(today, ranked);

  return {
    count: ranked.length,
    reason: `已重排 ${ranked.length} 个待学任务，优先级缓存生效至今日结束`,
  };
}

export function HealthAlertCard({
  alerts,
  dismissedIds,
  onClose,
}: HealthAlertCardProps) {
  // 已采纳的 alert id 集合（仅本会话内，刷新后重置）
  const [adoptedIds, setAdoptedIds] = useState<Set<string>>(new Set());
  // 采纳中状态（按 alert id 隔离，避免重复点击）
  const [adoptingId, setAdoptingId] = useState<string | null>(null);
  // 错误提示
  const [errorMsg, setErrorMsg] = useState<string>("");

  const visible = alerts.filter((a) => !dismissedIds.has(a.id));
  if (visible.length === 0) return null;

  async function handleAdopt(alert: HealthAlert) {
    if (adoptingId) return;
    setAdoptingId(alert.id);
    setErrorMsg("");
    try {
      const result = await adoptOptimizeSchedule();
      setAdoptedIds((prev) => new Set(prev).add(alert.id));
      // 静默成功提示（用 console 替代 toast，避免引入额外组件）
      console.info(`[health-alert] adopted: ${result.reason}`);
    } catch (e) {
      setErrorMsg(e instanceof Error ? e.message : "采纳失败，请稍后重试");
    } finally {
      setAdoptingId(null);
    }
  }

  return (
    <div className="mb-4 space-y-2">
      {errorMsg && (
        <div className="rounded-lg border border-red-200 bg-red-50 dark:bg-red-950/30 dark:border-red-800 p-2 text-xs text-red-700 dark:text-red-300">
          {errorMsg}
        </div>
      )}
      {visible.map((alert) => {
        const style = severityStyle(alert.severity);
        const adopted = adoptedIds.has(alert.id);
        const isAdopting = adoptingId === alert.id;
        return (
          <div
            key={alert.id}
            className={`rounded-xl border-2 ${style.border} ${style.bg} p-3 space-y-2`}
            role="alert"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-start gap-2 flex-1 min-w-0">
                <Icon
                  name={style.icon}
                  className={`w-5 h-5 flex-shrink-0 mt-0.5 ${style.iconColor}`}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className={`text-sm font-semibold ${style.text}`}>
                      {alert.title}
                    </p>
                    <span
                      className={`text-2xs px-1.5 py-0.5 rounded font-medium uppercase tracking-wide ${style.bg} ${style.iconColor} border ${style.border}`}
                    >
                      {alert.severity}
                    </span>
                  </div>
                  <p className="text-xs text-gray-700 dark:text-gray-300 mt-1">
                    {alert.description}
                  </p>
                  {alert.suggestedAction && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      <Icon
                        name="lightbulb"
                        className="w-3 h-3 inline-block align-middle mr-0.5"
                      />
                      建议：{alert.suggestedAction}
                    </p>
                  )}
                </div>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                iconOnly
                onClick={() => onClose(alert.id)}
                aria-label="关闭"
                className={`flex-shrink-0 ${style.iconColor} hover:opacity-70 transition-opacity`}
              >
                <Icon name="x" className="w-4 h-4" />
              </Button>
            </div>

            {!adopted ? (
              <div className="flex justify-end">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handleAdopt(alert)}
                  loading={isAdopting}
                  leftIcon="zap"
                >
                  {isAdopting ? "采纳中..." : "一键采纳（重排今日优先级）"}
                </Button>
              </div>
            ) : (
              <div className="flex justify-end">
                <span className="inline-flex items-center gap-1 text-xs text-green-700 dark:text-green-400">
                  <Icon name="check-circle" className="w-4 h-4" />
                  已采纳，新优先级已生效
                </span>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
