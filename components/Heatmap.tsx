"use client";

// components/Heatmap.tsx
// 学习热力图：聚合 ReviewLog + LearnLog 按日期，4 档颜色
// 数据源：从 IndexedDB 读 log:* 前缀，聚合为 { date, count(分钟) }
//
// 2026-07-26 修复：用户反馈"看不到图"
// 根因分析（三层问题，任一都会导致渲染失败）：
//   1. **renderBlock 返回 HTML div 包裹 SVG rect**（致命）：
//      原代码 `<div key={activity.date} onClick={...}>{block}</div>`
//      ActivityCalendar 内部把 renderBlock 返回值放进 SVG `<g>` 元素
//      （见 node_modules/react-activity-calendar/build/chunks/index-*.js L547-550），
//      但 SVG 规范不允许 `<div>` 直接嵌套在 `<g>` 中 → 浏览器渲染失败 → 整个 SVG 空白
//      修复：用 React.cloneElement 给原 rect 加 onClick + cursor 样式，保持 SVG 元素类型
//
//   2. **数据未按日期升序排序**（潜在）：
//      ActivityCalendar 的 fillHoles 函数依赖 activities[0] 和 activities[length-1]
//      确定日历范围（eachDayOfInterval(start, end)），如果数据未排序导致 start > end，
//      date-fns 会抛 RangeError('Invalid interval')
//      修复：聚合后按 date 升序排序
//
//   3. **fallback 数据只有一个日期**（体验）：
//      用户无学习日志时 internal 为空，fallback `[{date: today, count: 0, level: 0}]`
//      只渲染一个 12px 的格子，用户看不到"图"
//      修复：fallback 填充整个 weeks 范围（weeks*7 天），渲染完整空日历

import { useEffect, useState, useMemo, cloneElement, isValidElement } from "react";
import type { ReactElement } from "react";
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

/** 生成连续的空日期数据，作为 fallback 让用户看到完整空日历 */
function generateEmptyRange(weeks: number): DayData[] {
  const today = new Date();
  const start = new Date(today);
  start.setDate(start.getDate() - weeks * 7);
  const arr: DayData[] = [];
  const cursor = new Date(start);
  while (cursor <= today) {
    arr.push({
      date: cursor.toISOString().slice(0, 10),
      count: 0,
      level: 0,
    });
    cursor.setDate(cursor.getDate() + 1);
  }
  return arr;
}

export function Heatmap({ data, weeks = 12 }: Props) {
  const [internal, setInternal] = useState<DayData[]>([]);
  const [loading, setLoading] = useState(!data);
  const [selected, setSelected] = useState<DayData | null>(null);

  useEffect(() => {
    if (data) {
      // 外部传入数据也按日期升序排序（避免 ActivityCalendar fillHoles 抛错）
      const sorted = [...data].sort((a, b) => a.date.localeCompare(b.date));
      setInternal(sorted);
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
      // 关键修复：按日期升序排序，避免 ActivityCalendar fillHoles 计算
      // eachDayOfInterval(start, end) 时 start > end 抛 RangeError
      arr.sort((a, b) => a.date.localeCompare(b.date));
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

  // fallback：用户无学习日志时填充整个时间范围，让用户看到完整空日历
  // 否则只渲染一个 12px 的格子，用户看不到"图"
  const displayData =
    calendarData.length > 0 ? calendarData : generateEmptyRange(weeks);

  return (
    <div className="relative">
      <ActivityCalendar
        data={displayData}
        theme={{
          light: ["#ebedf0", "#9be9a8", "#40c463", "#30a14e", "#216e39"],
          dark: ["#1f2937", "#0e4f2c", "#166534", "#15803d", "#22c55e"],
        }}
        labels={{
          totalCount: "{{count}} 分钟学习",
        }}
        renderBlock={(block, activity) => {
          // 关键修复：必须返回 SVG 元素，不能包裹 HTML div
          // 原代码 <div onClick={...}>{block}</div> 在 SVG <g> 中渲染失败 → 整个日历空白
          // 用 cloneElement 给原 <rect> 加 onClick + cursor 样式，保持 SVG 兼容性
          if (isValidElement(block)) {
            return cloneElement(
              block as ReactElement<Record<string, unknown>>,
              {
                onClick: () => {
                  const d = internal.find((x) => x.date === activity.date);
                  if (d) setSelected(d);
                },
                style: {
                  ...((block.props as { style?: Record<string, unknown> }).style ?? {}),
                  cursor: "pointer",
                },
              },
            );
          }
          return block;
        }}
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
