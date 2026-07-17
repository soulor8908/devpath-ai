"use client";

// components/ui/Input.tsx
// 统一文本输入框 — 替代散落的 <input className="mt-1 w-full rounded border px-2 py-1">
//
// 设计（乔布斯视角）：
//   - 焦点反馈：蓝色边框 + 浅蓝光环（让用户知道"我在这里"）
//   - 错误态：红色边框 + 浅红光环（视觉即时反馈，不用等 toast）
//   - 禁用态：浅灰背景 + 灰字（不只是 opacity，更像"被锁住"）
//   - password 模式自带显隐按钮（避免每个调用方各写一遍）
//   - 左侧图标槽：用于搜索框、邮箱前缀等场景
//
// 设计（卡帕西视角）：
//   - forwardRef 让 ref 可转发（autoFocus、focus() 等场景）
//   - inputMode/placeholder 等原生 attr 透传
//   - 受控与非受控都支持（value/onChange 或 defaultValue）

import {
  forwardRef,
  useState,
  type InputHTMLAttributes,
  type ReactNode,
} from "react";
import { cn } from "@/lib/cn";
import { Icon } from "@/components/Icon";

export interface InputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "size"> {
  /** 错误态：红色边框 + aria-invalid */
  error?: boolean;
  /** 左侧图标（搜索框等场景） */
  leftIcon?: React.ComponentProps<typeof Icon>["name"];
  /** 右侧附加节点（如单位、按钮） */
  rightSlot?: ReactNode;
  /** password 模式下显示显隐切换按钮（仅 type=password 时生效） */
  showPasswordToggle?: boolean;
  /** 输入框尺寸 */
  inputSize?: "sm" | "md" | "lg";
}

const SIZE_CLASSES = {
  sm: "px-2.5 py-1 text-xs",
  md: "px-3 py-2 text-sm",
  lg: "px-4 py-2.5 text-base",
};

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  {
    className,
    error = false,
    leftIcon,
    rightSlot,
    showPasswordToggle = true,
    inputSize = "md",
    type = "text",
    disabled,
    ...rest
  },
  ref,
) {
  const [reveal, setReveal] = useState(false);
  const isPassword = type === "password";
  const effectiveType = isPassword && reveal ? "text" : type;

  return (
    <div className={cn("relative flex items-center", className)}>
      {leftIcon && (
        <span className="pointer-events-none absolute left-3 text-gray-400">
          <Icon name={leftIcon} className={cn("h-4 w-4", inputSize === "lg" && "h-5 w-5")} />
        </span>
      )}
      <input
        ref={ref}
        type={effectiveType}
        disabled={disabled}
        aria-invalid={error || undefined}
        className={cn(
          "w-full rounded-lg border bg-white text-gray-900 placeholder:text-gray-400 transition-colors",
          "focus:outline-none focus:ring-2 focus:ring-blue-500/20",
          "dark:bg-gray-800 dark:text-gray-100 dark:placeholder:text-gray-500",
          SIZE_CLASSES[inputSize],
          leftIcon && "pl-9",
          (rightSlot != null || (isPassword && showPasswordToggle)) && "pr-9",
          error
            ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
            : "border-gray-300 focus:border-blue-500 dark:border-gray-600",
          disabled &&
            "bg-gray-50 text-gray-400 cursor-not-allowed dark:bg-gray-900 dark:text-gray-500",
        )}
        {...rest}
      />
      {isPassword && showPasswordToggle && !disabled && (
        <button
          type="button"
          tabIndex={-1}
          aria-label={reveal ? "隐藏密码" : "显示密码"}
          onClick={() => setReveal((v) => !v)}
          className="absolute right-2 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
        >
          <Icon name={reveal ? "check-circle" : "info"} className="h-4 w-4" />
        </button>
      )}
      {rightSlot && !isPassword && (
        <span className="absolute right-2 flex items-center">{rightSlot}</span>
      )}
    </div>
  );
});
