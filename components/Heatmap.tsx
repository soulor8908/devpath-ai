"use client";

// components/Heatmap.tsx
// 学习热力图：聚合 ReviewLog + LearnLog 按日期，4 档颜色
// 数据源：从 IndexedDB 读 log:* 前缀，聚合为 { date, count(分钟) }

import { useEffect, useState, useMemo } from "react";
import { ActivityCalendar } from "react-activity-calendar";
import { listItems } from "@/lib/storage/db";
import type { ReviewLog, LearnLog } from "@/lib/types";
import { Button } from "@/components/ui";

interface DayData {
  date: string; // YYYY-MM-DD
  count: number; // 当天总学习分钟
  level: 0 | 1 | 2 | 3 | 4;
}

interface Props {
  /** 外部传入数据（优先）；不传则内部从 IndexedDB 读 */
  data?: DayData[];
  weeks?: number; // 显示最近 N 周，默认 12
}

function toLevel(minutes: number): 0 | 1 | 2 | 3 | 4 {
  if (minutes >= 60) return 4;
  if (minutes >= 30) return 3;
  if (minutes >= 15) return 2;
  if (minutes > 0) return 1;
  return 0;
}

export function Heatmap({ data, weeks = 12 }: Props) {
  const [internal, setInternal] = useState<DayData[]>([]);
  const [loading, setLoading] = useState(!data);
  const [selected, setSelected] = useState<DayData | null>(null);

  useEffect(() => {
    if (data) {
      setInternal(data);
      setLoading(false);
      return;
    }
    let cancelled = false;
    (async () => {
      setLoading(true);
      const learnLogs = await listItems<LearnLog>("learn_log:");
      const reviewLogs = await listItems<ReviewLog>("review_log:");
      const logs: ((ReviewLog & { duration?: number }) | LearnLog)[] = [...learnLogs, ...reviewLogs];
      if (cancelled) return;
      const byDate = new Map<string, number>();
      for (const log of logs) {
        const date = (log as LearnLog).date;
        const duration = (log as LearnLog).duration ?? 10;
        byDate.set(date, (byDate.get(date) ?? 0) + duration);
      }
      const arr: DayData[] = Array.from(byDate.entries()).map(([date, count]) => ({
        date,
        count,
        level: toLevel(count),
      }));
      setInternal(arr);
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [data]);

  const calendarData = useMemo(() => {
    const today = new Date();
    const start = new Date(today);
    start.setDate(start.getDate() - weeks * 7);
    const startStr = start.toISOString().slice(0, 10);
    return internal
      .filter((d) => d.date >= startStr)
      .map((d) => ({ date: d.date, count: d.count, level: d.level }));
  }, [internal, weeks]);

  if (loading) {
    return <div className="h-32 animate-pulse rounded bg-gray-100 dark:bg-gray-800" />;
  }

  return (
    <div className="relative">
      <ActivityCalendar
        data={calendarData.length > 0 ? calendarData : [{ date: new Date().toISOString().slice(0, 10), count: 0, level: 0 }]}
        theme={{
          light: ["#ebedf0", "#9be9a8", "#40c463", "#30a14e", "#216e39"],
          dark: ["#1f2937", "#0e4f2c", "#166534", "#15803d", "#22c55e"],
        }}
        labels={{
          totalCount: "{{count}} 分钟学习",
        }}
        renderBlock={(block, activity) => (
          <div
            key={activity.date}
            onClick={() => {
              const d = internal.find((x) => x.date === activity.date);
              if (d) setSelected(d);
            }}
          >
            {block}
          </div>
        )}
      />
      {selected && (
        <div
          role="tooltip"
          className="absolute right-0 top-0 z-10 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-3 shadow-lg"
        >
          <div className="text-sm font-medium">{selected.date}</div>
          <div className="text-xs text-gray-600 dark:text-gray-300">学习 {selected.count} 分钟</div>
          <Button variant="link" size="sm" onClick={() => setSelected(null)} className="mt-1">
            关闭
          </Button>
        </div>
      )}
    </div>
  );
}
