"use client";

// components/HeatmapContent.tsx
// 热力图内容组件——持有 react-activity-calendar 这个重依赖（~80KB+，含 date-fns + d3-scale）
//
// 2026-07-26 性能优化（卡帕西视角）：
//   原 Heatmap.tsx 顶层 import ActivityCalendar，导致 /stats 和 /u/[username] 路由
//   的 chunk 都包含这个重库。即使这两个路由不是首屏，用户进入时仍要下载完整 chunk。
//   拆出 HeatmapContent 后，Heatmap.tsx 用 next/dynamic 懒加载本文件，
//   react-activity-calendar 进独立 chunk，只在用户实际看到热力图时才下载。
//   与 RadarChart.tsx → RadarChartContent.tsx 的拆分模式保持一致。
//
// 注意：本文件被 Heatmap.tsx 通过 next/dynamic ssr:false 加载，
// 因此 ActivityCalendar 内部使用 window/document 等 API 不会在 SSR 阶段崩溃。

import { cloneElement, isValidElement } from "react";
import type { ReactElement } from "react";
import { ActivityCalendar } from "react-activity-calendar";
import { Button } from "@/components/ui";

export interface DayData {
  date: string; // YYYY-MM-DD
  count: number; // 当天总学习分钟
  level: 0 | 1 | 2 | 3 | 4;
}

interface Props {
  data: DayData[];
  /** 点击某天的回调（用于显示 tooltip） */
  onDayClick?: (day: DayData) => void;
  /** 选中的天（用于 tooltip 展示） */
  selected?: DayData | null;
  /** 关闭 tooltip 回调 */
  onCloseTooltip?: () => void;
}

/**
 * 渲染 ActivityCalendar + tooltip
 * 数据排序、level 计算等纯函数逻辑放在 Heatmap.tsx，本组件只负责渲染。
 */
export function HeatmapContent({ data, onDayClick, selected, onCloseTooltip }: Props) {
  return (
    <div className="relative">
      <ActivityCalendar
        data={data}
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
                  onDayClick?.({
                    date: activity.date,
                    count: (activity as { count?: number }).count ?? 0,
                    level: 0,
                  });
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
          <Button variant="link" size="sm" onClick={() => onCloseTooltip?.()} className="mt-1">
            关闭
          </Button>
        </div>
      )}
    </div>
  );
}
