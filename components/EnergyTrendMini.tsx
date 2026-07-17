"use client";

// components/EnergyTrendMini.tsx
// 7 天能量迷你柱状图：展示最近一周的能量趋势（1-5）
//
// 设计（卡帕西视角）：
//   - 纯展示组件，数据通过 props 传入
//   - 长度 7 数组，索引 0=周一 ... 6=周日
//   - null 值用浅灰占位柱
//   - 颜色：能量 ≤2 红、=3 橙、≥4 绿
//   - 今日用蓝色边框高亮

import { Icon } from "@/components/Icon";

interface Props {
  /** 长度 7 数组，索引 0=周一 ... 6=周日；null 表示无数据 */
  trend: Array<number | null>;
  /** 今日能量值（用于高亮今日柱） */
  todayEnergy: number | null;
}

const WEEKDAYS = ["一", "二", "三", "四", "五", "六", "日"];

export function EnergyTrendMini({ trend, todayEnergy }: Props) {
  // 找今日 weekday 索引
  const jsDay = new Date().getDay();
  const todayIdx = jsDay === 0 ? 6 : jsDay - 1;

  const hasAnyData = trend.some((v) => v !== null);

  if (!hasAnyData) {
    return (
      <div className="rounded-2xl border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 p-4">
        <div className="flex items-center gap-2 mb-2">
          <Icon name="zap" className="w-4 h-4 text-amber-500" />
          <h3 className="text-xs font-medium text-gray-500">本周能量</h3>
        </div>
        <p className="text-xs text-gray-400 text-center py-3">
          记录今日状态后即可看到能量趋势
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Icon name="zap" className="w-4 h-4 text-amber-500" />
          <h3 className="text-xs font-medium text-gray-500">本周能量</h3>
        </div>
        {todayEnergy !== null && (
          <span className="text-xs text-gray-400">
            今日 <span className="font-bold text-gray-700 dark:text-gray-300">{todayEnergy}</span>/5
          </span>
        )}
      </div>
      <div className="flex items-end justify-between gap-1.5 h-16">
        {trend.map((v, i) => {
          const isToday = i === todayIdx;
          const height = v === null ? 8 : Math.max(8, (v / 5) * 100);
          const color =
            v === null
              ? "bg-gray-100 dark:bg-gray-700"
              : v <= 2
                ? "bg-red-400"
                : v === 3
                  ? "bg-orange-400"
                  : "bg-green-400";
          return (
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              <div className="w-full flex items-end justify-center" style={{ height: 56 }}>
                <div
                  className={`w-full max-w-[16px] rounded-t ${color} ${
                    isToday ? "ring-2 ring-blue-400" : ""
                  }`}
                  style={{ height: `${height}%` }}
                  title={v === null ? "无数据" : `能量 ${v}/5`}
                />
              </div>
              <span className={`text-[10px] ${isToday ? "text-blue-500 font-bold" : "text-gray-400"}`}>
                {WEEKDAYS[i]}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
