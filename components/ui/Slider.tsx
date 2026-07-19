"use client";

// components/ui/Slider.tsx
// 统一滑块组件 — 替代散落的 <input type="range" className="w-full">
//
// 设计（乔布斯视角）：
//   - 原生 range 在不同浏览器表现差异巨大（Chrome 蓝色 / Firefox 灰色 / Safari 圆头）
//   - 用 accent-color 统一主色（现代浏览器支持，IE 不考虑）
//   - showValue 时在右侧显示当前值，避免用户来回数刻度
//
// 设计（卡帕西视角）：
//   - forwardRef 让 form lib 可拿 ref
//   - onChange 直接回调 number，调用方不用 e.target.value 再转一次
//   - props 兼容原生 input（aria-label / disabled 等透传）

import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export interface SliderProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "onChange" | "value"> {
  /** 当前值（受控） */
  value: number;
  /** 值变化回调（直接给 number，调用方不用转） */
  onChange: (value: number) => void;
  /** 最小值 */
  min: number;
  /** 最大值 */
  max: number;
  /** 步长（默认 1） */
  step?: number;
  /** 是否在右侧显示当前值 */
  showValue?: boolean;
  /** 值的后缀（如 "分钟"，仅在 showValue=true 时生效） */
  valueSuffix?: string;
}

export const Slider = forwardRef<HTMLInputElement, SliderProps>(function Slider(
  {
    className,
    value,
    onChange,
    min,
    max,
    step = 1,
    disabled,
    showValue = false,
    valueSuffix = "",
    ...rest
  },
  ref,
) {
  return (
    <div className={cn("flex items-center gap-3 w-full", className)}>
      <input
        ref={ref}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(Number(e.target.value))}
        className={cn(
          "flex-1 h-2 rounded-full appearance-none cursor-pointer bg-gray-200 dark:bg-gray-700",
          "accent-blue-600 dark:accent-blue-500",
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/30 focus-visible:ring-offset-1",
          disabled && "opacity-50 cursor-not-allowed",
        )}
        {...rest}
      />
      {showValue && (
        <span className="shrink-0 text-sm font-medium text-gray-700 dark:text-gray-300 min-w-[3rem] text-right tabular-nums">
          {value}
          {valueSuffix}
        </span>
      )}
    </div>
  );
});
