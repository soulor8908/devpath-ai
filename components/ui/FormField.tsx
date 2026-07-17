"use client";

// components/ui/FormField.tsx
// 表单字段布局容器 — 统一 label / hint / error 的排版
//
// 设计（乔布斯视角）：
//   - 表单最丑的不是控件，是 label 与控件的对齐：有的 mb-1 有的 mb-2 有的紧挨有的远离
//   - 用 FormField 强制统一：label 上方 + 控件 + hint/error 下方，间距固定
//   - error 自带红色图标 + 红色文字，hint 是灰色辅助说明
//   - required asterisk 自动渲染（red *）
//
// 设计（卡帕西视角）：
//   - 不接管控件本身（不绑 value/onChange），只做布局，最大复用性
//   - htmlFor 自动用 useId 生成，避免重复 id
//   - children 是受控控件（Input/Select/Textarea/自定义）

import { useId, type ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Icon } from "@/components/Icon";

export interface FormFieldProps {
  /** 主标签 */
  label?: ReactNode;
  /** 辅助说明（灰色小字） */
  hint?: ReactNode;
  /** 错误信息（红色小字 + 图标） */
  error?: ReactNode;
  /** 是否必填（在 label 后渲染红色 *） */
  required?: boolean;
  /** 标签右侧附加操作（如"显示/隐藏"按钮） */
  labelExtra?: ReactNode;
  /** 控件 */
  children?: ReactNode;
  /** 整体布局方向：垂直（默认）/水平（label 与控件同一行） */
  layout?: "vertical" | "horizontal";
  className?: string;
  /** 自定义 htmlFor（默认自动生成 id） */
  htmlFor?: string;
}

export function FormField({
  label,
  hint,
  error,
  required = false,
  labelExtra,
  children,
  layout = "vertical",
  className,
  htmlFor,
}: FormFieldProps) {
  const autoId = useId();
  const id = htmlFor ?? autoId;
  // 注意：children 直接渲染，不 cloneElement 注入 id
  // 因为 Input/Textarea/Select 是 forwardRef 组件，透传 id 会落到外层 div 而非内部 input
  // 调用方需要绑定 htmlFor 时，应在控件上显式传 id

  return (
    <div
      className={cn(
        layout === "horizontal"
          ? "flex items-center gap-3"
          : "space-y-1.5",
        className,
      )}
    >
      {label && (
        <div
          className={cn(
            "flex items-center justify-between",
            layout === "horizontal" && "shrink-0 w-28",
          )}
        >
          <label
            htmlFor={id}
            className="text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer"
          >
            {label}
            {required && <span className="ml-0.5 text-red-500">*</span>}
          </label>
          {labelExtra && <span className="ml-2">{labelExtra}</span>}
        </div>
      )}
      <div className={cn(layout === "horizontal" && "flex-1 min-w-0")}>
        {children}
        {hint && !error && (
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            {hint}
          </p>
        )}
        {error && (
          <p className="mt-1 flex items-start gap-1 text-xs text-red-600 dark:text-red-400">
            <Icon name="alert" className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            <span>{error}</span>
          </p>
        )}
      </div>
    </div>
  );
}
