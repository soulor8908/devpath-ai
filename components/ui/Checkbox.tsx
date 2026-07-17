"use client";

// components/ui/Checkbox.tsx
// 自定义勾选框 — 替代原生 <input type="checkbox" className="h-5 w-5">
//
// 设计（乔布斯视角）：
//   - 原生 checkbox 跨浏览器/跨平台样式不一致，是表单最丑的元素之一
//   - 用 div 模拟勾选框：未选=空心边框 / 已选=蓝底白勾 / 禁用=灰底
//   - 勾选动画用 SVG path 的 stroke-dashoffset，比 transform scale 更优雅
//   - 仍走原生 input 的 a11y 语义（aria-checked、键盘空格触发）
//
// 设计（卡帕西视角）：
//   - input 用 sr-only 隐藏但保留语义，div 是视觉层
//   - forwardRef 转发到 input 元素（让 form lib 能拿到 ref）
//   - label 通过 <label> 包裹实现点击区域扩大

import {
  forwardRef,
  type InputHTMLAttributes,
  type ReactNode,
} from "react";
import { cn } from "@/lib/cn";

export interface CheckboxProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "size"> {
  /** 标签文本（可选，与 children 二选一） */
  label?: ReactNode;
  /** 自定义标签内容（如带图标的复杂标签） */
  children?: ReactNode;
  /** 尺寸 */
  checkboxSize?: "sm" | "md" | "lg";
  /** 标签位置：右侧（默认）或左侧 */
  labelPosition?: "left" | "right";
}

const BOX_SIZE = {
  sm: "h-3.5 w-3.5",
  md: "h-4 w-4",
  lg: "h-5 w-5",
};

const CHECK_ICON_SIZE = {
  sm: "h-2.5 w-2.5",
  md: "h-3 w-3",
  lg: "h-3.5 w-3.5",
};

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  function Checkbox(
    {
      className,
      label,
      children,
      checkboxSize = "md",
      labelPosition = "right",
      checked,
      disabled,
      ...rest
    },
    ref,
  ) {
    const content = children ?? label;
    return (
      <label
        className={cn(
          "inline-flex items-center gap-2 cursor-pointer select-none",
          labelPosition === "left" && "flex-row-reverse",
          disabled && "cursor-not-allowed opacity-60",
          className,
        )}
      >
        <span className="relative inline-flex shrink-0">
          <input
            ref={ref}
            type="checkbox"
            checked={checked}
            disabled={disabled}
            className="sr-only peer"
            {...rest}
          />
          <span
            aria-hidden
            className={cn(
              "inline-flex items-center justify-center rounded border-2 transition-colors",
              BOX_SIZE[checkboxSize],
              checked
                ? "bg-blue-600 border-blue-600"
                : "bg-white border-gray-300 dark:border-gray-600 dark:bg-gray-800",
              "peer-focus-visible:ring-2 peer-focus-visible:ring-blue-500/30 peer-focus-visible:ring-offset-1",
            )}
          >
            {checked && (
              <svg
                viewBox="0 0 12 12"
                fill="none"
                className={cn("text-white", CHECK_ICON_SIZE[checkboxSize])}
                aria-hidden
              >
                <path
                  d="M2.5 6L5 8.5L9.5 3.5"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            )}
          </span>
        </span>
        {content && (
          <span className="text-sm text-gray-700 dark:text-gray-200">
            {content}
          </span>
        )}
      </label>
    );
  },
);
