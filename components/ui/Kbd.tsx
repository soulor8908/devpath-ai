// components/ui/Kbd.tsx
// 统一键盘按键样式组件
//
// 体检报告 m8 修复：profile/page.tsx:1388 直接用 <kbd> 无统一样式
//
// 设计（乔布斯视角）：
//   - 键盘按键是"技术细节的优雅化"——告诉用户快捷键时不破坏视觉
//   - Apple 风格：浅灰背景 + 小号字 + 圆角 + 底部阴影（模拟物理按键）
//
// 设计（卡帕西视角）：
//   - 单一职责：只渲染 <kbd> 元素 + 统一样式
//   - 语义化 HTML：<kbd> 是 HTML5 标准元素，无需 role
//   - size 复用 Button 的 sm/md/lg 字号体系

import { type ReactNode } from "react";
import { cn } from "@/lib/cn";

export type KbdSize = "sm" | "md" | "lg";

const SIZE_CLASSES: Record<KbdSize, string> = {
  sm: "h-5 min-w-[1.25rem] px-1 text-2xs",
  md: "h-6 min-w-[1.5rem] px-1.5 text-xs",
  lg: "h-7 min-w-[1.75rem] px-2 text-sm",
};

export interface KbdProps {
  children: ReactNode;
  size?: KbdSize;
  className?: string;
}

export function Kbd({ children, size = "md", className }: KbdProps) {
  return (
    <kbd
      className={cn(
        "inline-flex items-center justify-center font-mono font-medium",
        "bg-gray-100 text-gray-600 border border-gray-300 rounded shadow-sm",
        "dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600",
        SIZE_CLASSES[size],
        className,
      )}
    >
      {children}
    </kbd>
  );
}
