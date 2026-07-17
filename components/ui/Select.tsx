"use client";

// components/ui/Select.tsx
// 统一下拉选择框 — 替代原生 <select className="mt-1 w-full rounded border px-2 py-1">
//
// 设计（乔布斯视角）：
//   - 原生 select 的下拉箭头在不同浏览器表现不一，必须自定义
//   - 视觉与 Input 一致（圆角/边框/焦点环）
//   - 保留原生 <option> 弹层（跨平台一致性最佳，不另造下拉弹层）
//
// 设计（卡帕西视角）：
//   - 用 appearance-none + 背景 SVG 模拟箭头（不依赖图标库）
//   - children 由调用方传入 <option>，保持原生 API

import { forwardRef, type SelectHTMLAttributes, type ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Icon } from "@/components/Icon";

export interface SelectProps
  extends SelectHTMLAttributes<HTMLSelectElement> {
  error?: boolean;
  /** 输入框尺寸 */
  inputSize?: "sm" | "md" | "lg";
  /** 右侧自定义图标（默认 chevron-down） */
  rightIcon?: React.ComponentProps<typeof Icon>["name"];
  children?: ReactNode;
}

const SIZE_CLASSES = {
  sm: "px-2.5 py-1 text-xs pr-7",
  md: "px-3 py-2 text-sm pr-9",
  lg: "px-4 py-2.5 text-base pr-10",
};

const ICON_SIZE = {
  sm: "h-3 w-3",
  md: "h-4 w-4",
  lg: "h-5 w-5",
};

const ICON_RIGHT = {
  sm: "right-2",
  md: "right-2.5",
  lg: "right-3",
};

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  function Select(
    {
      className,
      error = false,
      inputSize = "md",
      disabled,
      rightIcon = "chevron-down",
      children,
      ...rest
    },
    ref,
  ) {
    return (
      <div className={cn("relative inline-block w-full", className)}>
        <select
          ref={ref}
          disabled={disabled}
          aria-invalid={error || undefined}
          className={cn(
            "w-full rounded-lg border bg-white text-gray-900 transition-colors appearance-none cursor-pointer",
            "focus:outline-none focus:ring-2 focus:ring-blue-500/20",
            "dark:bg-gray-800 dark:text-gray-100",
            SIZE_CLASSES[inputSize],
            error
              ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
              : "border-gray-300 focus:border-blue-500 dark:border-gray-600",
            disabled &&
              "bg-gray-50 text-gray-400 cursor-not-allowed dark:bg-gray-900 dark:text-gray-500",
          )}
          {...rest}
        >
          {children}
        </select>
        {!disabled && (
          <span
            aria-hidden
            className={cn(
              "pointer-events-none absolute top-1/2 -translate-y-1/2 text-gray-400",
              ICON_RIGHT[inputSize],
            )}
          >
            <Icon name={rightIcon} className={ICON_SIZE[inputSize]} />
          </span>
        )}
      </div>
    );
  },
);
