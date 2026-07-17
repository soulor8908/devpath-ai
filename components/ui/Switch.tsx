"use client";

// components/ui/Switch.tsx
// 开关 — 适合 on/off 二态切换（比 checkbox 更适合"开关"语义）
//
// 设计（乔布斯视角）：
//   - 视觉隐喻：物理开关，圆点滑轨，开=蓝色亮起，关=灰色
//   - 比 checkbox 更适合"独立设置项"（如通知开关、隐私选项）
//   - 动画过渡：圆点滑动 + 背景色渐变，120ms 自然不卡顿
//
// 设计（卡帕西视角）：
//   - 内部仍是 input[type=checkbox]，仅视觉层自定义
//   - sr-only 隐藏原生控件，保留 a11y 语义
//   - forwardRef 让 form lib 可拿 ref

import {
  forwardRef,
  type InputHTMLAttributes,
} from "react";
import { cn } from "@/lib/cn";

export interface SwitchProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "size"> {
  /** 尺寸 */
  switchSize?: "sm" | "md" | "lg";
  /** 开启时的轨道色（默认 blue-600） */
  activeColor?: "blue" | "green" | "orange";
}

const TRACK_SIZE = {
  sm: "h-4 w-7",
  md: "h-5 w-9",
  lg: "h-6 w-11",
};

const THUMB_SIZE = {
  sm: "h-3 w-3",
  md: "h-4 w-4",
  lg: "h-5 w-5",
};

const THUMB_TRANSLATE = {
  sm: "peer-checked:translate-x-3",
  md: "peer-checked:translate-x-4",
  lg: "peer-checked:translate-x-5",
};

const ACTIVE_COLOR: Record<NonNullable<SwitchProps["activeColor"]>, string> = {
  blue: "peer-checked:bg-blue-600",
  green: "peer-checked:bg-green-600",
  orange: "peer-checked:bg-orange-500",
};

export const Switch = forwardRef<HTMLInputElement, SwitchProps>(
  function Switch(
    {
      className,
      switchSize = "md",
      activeColor = "blue",
      checked,
      disabled,
      ...rest
    },
    ref,
  ) {
    return (
      <span
        className={cn(
          "relative inline-flex shrink-0",
          disabled && "opacity-50 cursor-not-allowed",
          className,
        )}
      >
        <input
          ref={ref}
          type="checkbox"
          role="switch"
          checked={checked}
          disabled={disabled}
          className="sr-only peer"
          {...rest}
        />
        <span
          aria-hidden
          className={cn(
            "inline-block rounded-full bg-gray-300 dark:bg-gray-600 transition-colors",
            "peer-focus-visible:ring-2 peer-focus-visible:ring-blue-500/30 peer-focus-visible:ring-offset-1",
            TRACK_SIZE[switchSize],
            ACTIVE_COLOR[activeColor],
          )}
        />
        <span
          aria-hidden
          className={cn(
            "absolute top-0.5 left-0.5 rounded-full bg-white shadow-sm transition-transform",
            THUMB_SIZE[switchSize],
            THUMB_TRANSLATE[switchSize],
          )}
        />
      </span>
    );
  },
);
