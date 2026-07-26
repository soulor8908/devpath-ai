// components/ui/LoadingScreen.tsx
// 统一全屏加载态组件 — 替代散落各页面的 "加载中..." 文案
//
// 2026-07-26 性能优化（卡帕西视角）：
//   原代码库 17+ 处都有 `<div className="flex items-center justify-center min-h-screen">
//   <p className="text-gray-400">加载中...</p></div>` 的复制粘贴。其中部分缺 dark:
//   配对、部分缺 ARIA、部分文案不一。这里统一为单一事实源。
//
// 设计（乔布斯视角）：
//   - 加载态是"承诺"——用 spinner 图标比纯文字更明确告诉用户"正在加载"
//   - 文案可选（默认"加载中..."），特定场景可定制（如"加载复习卡片..."）
//   - 全屏占位 min-h-screen，确保不闪烁
//
// 设计（卡帕西视角）：
//   - forwardRef 让 ref 可转发
//   - dark: 配对完整（守护测试 0 容忍）
//   - role="status" + aria-live="polite" 让屏幕阅读器读出"正在加载"
//   - 图标用 animate-spin（Tailwind 内置）

import { forwardRef, type ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Icon } from "@/components/Icon";

export interface LoadingScreenProps {
  /** 自定义文案，默认"加载中..." */
  text?: string;
  /** 容器 className */
  className?: string;
  /** 自定义 children（替代默认文案） */
  children?: ReactNode;
}

/**
 * 全屏加载占位 — 统一文案 + spinner + ARIA
 *
 * @example <LoadingScreen />
 * @example <LoadingScreen text="加载复习卡片..." />
 */
export const LoadingScreen = forwardRef<HTMLDivElement, LoadingScreenProps>(
  function LoadingScreen(
    { text = "加载中...", className, children },
    ref,
  ) {
    return (
      <div
        ref={ref}
        role="status"
        aria-live="polite"
        aria-label={text}
        className={cn(
          "flex items-center justify-center min-h-screen",
          "text-sm text-gray-400 dark:text-gray-500",
          className,
        )}
      >
        {children ?? (
          <>
            <Icon name="loader" className="w-5 h-5 mr-2 animate-spin" />
            {text}
          </>
        )}
      </div>
    );
  },
);
