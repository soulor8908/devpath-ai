"use client";

// components/ui/Button.tsx
// 统一按钮组件 — 替代散落各页面的 <button className="rounded-lg bg-blue-600 ...">
//
// 设计（乔布斯视角）：
//   - 视觉一致性 > 灵活度。6 种 variant + 3 种 size 覆盖 95% 场景
//   - 每种 variant 有明确的语义：primary=主操作 / secondary=次操作 / danger=删除 / ghost=弱化 / success=成功 / dark=深色
//   - loading 态自带 spinner，避免每个调用方各写一遍
//   - disabled 视觉不只是 opacity，还改 cursor
//
// 设计（卡帕西视角）：
//   - forwardRef 让 ref 可转发（聚焦/测距等场景）
//   - variant 用对象字典 lookup，O(1) 取样式，比 cva 更轻
//   - props extends 原生 button，不丢类型
//   - button 默认 type="button"（避免 form 内误触提交）

import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/cn";
import { Icon } from "@/components/Icon";

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "ghost"
  | "danger"
  | "success"
  | "dark";
export type ButtonSize = "sm" | "md" | "lg";

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary:
    "bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800 shadow-sm",
  secondary:
    "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 active:bg-gray-100 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-700",
  ghost:
    "bg-transparent text-gray-600 hover:bg-gray-100 active:bg-gray-200 dark:text-gray-300 dark:hover:bg-gray-700",
  danger:
    "bg-red-500 text-white hover:bg-red-600 active:bg-red-700 shadow-sm",
  success:
    "bg-green-600 text-white hover:bg-green-700 active:bg-green-800 shadow-sm",
  dark: "bg-gray-900 text-white hover:bg-black active:bg-gray-800 shadow-sm dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100",
};

const SIZE_CLASSES: Record<ButtonSize, string> = {
  sm: "px-2.5 py-1 text-xs gap-1",
  md: "px-3.5 py-2 text-sm gap-1.5",
  lg: "px-5 py-2.5 text-base gap-2",
};

const LOADING_SPINNER_SIZE: Record<ButtonSize, string> = {
  sm: "w-3 h-3 border",
  md: "w-3.5 h-3.5 border-2",
  lg: "w-4 h-4 border-2",
};

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** 加载中：显示 spinner + 禁用点击。优先级高于 disabled */
  loading?: boolean;
  /** 左侧图标名（Icon 组件支持的 name） */
  leftIcon?: React.ComponentProps<typeof Icon>["name"];
  /** 是否占满宽度 */
  block?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(
    {
      variant = "primary",
      size = "md",
      loading = false,
      leftIcon,
      block = false,
      className,
      children,
      disabled,
      type = "button",
      ...rest
    },
    ref,
  ) {
    const isDisabled = disabled || loading;
    return (
      <button
        ref={ref}
        type={type}
        disabled={isDisabled}
        aria-busy={loading || undefined}
        className={cn(
          "inline-flex items-center justify-center font-medium rounded-lg transition-colors",
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40 focus-visible:ring-offset-0",
          "disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none",
          VARIANT_CLASSES[variant],
          SIZE_CLASSES[size],
          block && "w-full",
          className,
        )}
        {...rest}
      >
        {loading && (
          <span
            aria-hidden
            className={cn(
              "inline-block rounded-full border-current border-t-transparent animate-spin",
              LOADING_SPINNER_SIZE[size],
            )}
          />
        )}
        {!loading && leftIcon && (
          <Icon name={leftIcon} className="w-4 h-4 shrink-0" />
        )}
        {children}
      </button>
    );
  },
);
