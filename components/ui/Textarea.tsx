"use client";

// components/ui/Textarea.tsx
// 统一多行文本输入框
//
// 设计（乔布斯视角）：
//   - 与 Input 一致的视觉语言（边框/焦点/错误态）
//   - resize 默认 vertical（只允许纵向拉伸，避免横向破坏布局）
//   - 字数统计可选（maxLength 存在时自动显示 X/Y）

import { forwardRef, type TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export interface TextareaProps
  extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean;
  /** 是否显示字数统计（需配合 maxLength） */
  showCount?: boolean;
  /** 输入框尺寸 */
  inputSize?: "sm" | "md" | "lg";
}

const SIZE_CLASSES = {
  sm: "px-2.5 py-1 text-xs",
  md: "px-3 py-2 text-sm",
  lg: "px-4 py-2.5 text-base",
};

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  function Textarea(
    {
      className,
      error = false,
      showCount = false,
      inputSize = "md",
      disabled,
      value,
      maxLength,
      ...rest
    },
    ref,
  ) {
    const count =
      showCount && maxLength
        ? `${String(value ?? "").length}/${maxLength}`
        : null;

    return (
      <div className={cn("relative", className)}>
        <textarea
          ref={ref}
          disabled={disabled}
          aria-invalid={error || undefined}
          maxLength={maxLength}
          value={value}
          className={cn(
            "w-full rounded-lg border bg-white text-gray-900 placeholder:text-gray-400 transition-colors resize-y",
            "focus:outline-none focus:ring-2 focus:ring-blue-500/20",
            "dark:bg-gray-800 dark:text-gray-100 dark:placeholder:text-gray-500",
            SIZE_CLASSES[inputSize],
            error
              ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
              : "border-gray-300 focus:border-blue-500 dark:border-gray-600",
            disabled &&
              "bg-gray-50 text-gray-400 cursor-not-allowed dark:bg-gray-900 dark:text-gray-500",
            count && "pb-6",
          )}
          {...rest}
        />
        {count && (
          <span className="pointer-events-none absolute bottom-1.5 right-2 text-2xs text-gray-400">
            {count}
          </span>
        )}
      </div>
    );
  },
);
