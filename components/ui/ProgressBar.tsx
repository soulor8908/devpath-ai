"use client";

// components/ui/ProgressBar.tsx
// 统一进度条组件 — 替代散落各页面的内联 progressbar div
//
// 2026-07-26 性能优化 + AGENTS.md 2.6 守护：
//   原 KnowledgeCard / KnowledgeTree / review/page.tsx 各自手写 progressbar div，
//   其中 review/page.tsx 还漏了 ARIA 属性（违反 AGENTS.md 2.6）。
//   统一到本组件后：
//   - 内置 role="progressbar" + aria-valuenow/min/max/label，永远满足 2.6
//   - 4 种 size（xs/sm/md/lg）+ 4 种 color（blue/green/orange/red）
//   - dark: 配对完整（守护测试 0 容忍）
//   - forwardRef 让 ref 可转发
//
// 设计（卡帕西视角）：
//   - size 字典 O(1) lookup，比 cva 更轻
//   - props 极简：value/min/max + label + size + color + className
//   - clamp 钳到 [min, max]，防异常输入导致 width 溢出
//   - dark: 配对到 dark:bg-gray-700 / dark:bg-blue-400 等

import { forwardRef } from "react";
import { cn } from "@/lib/cn";

export type ProgressBarSize = "xs" | "sm" | "md" | "lg";
export type ProgressBarColor = "blue" | "green" | "orange" | "red" | "gray";

export interface ProgressBarProps {
  /** 当前值，会被 clamp 到 [min, max] */
  value: number;
  /** 最小值，默认 0 */
  min?: number;
  /** 最大值，默认 100 */
  max?: number;
  /** a11y 标签，必填（无障碍） */
  label: string;
  /** 尺寸：xs(h-1) / sm(h-1.5) / md(h-2) / lg(h-3) */
  size?: ProgressBarSize;
  /** 颜色：blue/green/orange/red/gray（默认 blue） */
  color?: ProgressBarColor;
  /** 自定义宽度类（如 "w-12" / "w-full"） */
  widthClassName?: string;
  className?: string;
}

const SIZE_CLASSES: Record<ProgressBarSize, string> = {
  xs: "h-1",
  sm: "h-1.5",
  md: "h-2",
  lg: "h-3",
};

const TRACK_CLASSES = "bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden";

const FILL_CLASSES: Record<ProgressBarColor, string> = {
  blue: "bg-blue-500 dark:bg-blue-400",
  green: "bg-green-500 dark:bg-green-400",
  orange: "bg-orange-500 dark:bg-orange-400",
  red: "bg-red-500 dark:bg-red-400",
  gray: "bg-gray-500 dark:bg-gray-400",
};

/**
 * 统一进度条 — 自带 ARIA + dark 配对
 *
 * @example
 * <ProgressBar value={50} label="掌握度 50%" />
 * <ProgressBar value={mastery} max={100} color="green" size="md" label={`${title} 掌握度 ${mastery}%`} />
 */
export const ProgressBar = forwardRef<HTMLDivElement, ProgressBarProps>(
  function ProgressBar(
    {
      value,
      min = 0,
      max = 100,
      label,
      size = "sm",
      color = "blue",
      widthClassName = "w-full",
      className,
    },
    ref,
  ) {
    const clamped = Math.max(min, Math.min(max, value));
    const pct = max > min ? ((clamped - min) / (max - min)) * 100 : 0;
    return (
      <div
        ref={ref}
        role="progressbar"
        aria-valuenow={Math.round(clamped)}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-label={label}
        className={cn(
          SIZE_CLASSES[size],
          TRACK_CLASSES,
          widthClassName,
          className,
        )}
      >
        <div
          className={cn("h-full rounded-full transition-all", FILL_CLASSES[color])}
          style={{ width: `${pct}%` }}
        />
      </div>
    );
  },
);
