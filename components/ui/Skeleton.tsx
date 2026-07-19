// components/ui/Skeleton.tsx
// 统一骨架屏组件 — 替代散落的 animate-pulse 加载态
//
// 体检报告 M5 修复：
//   - 学习路由页：animate-pulse 图标 + "正在进入学习…"
//   - 复习页：纯文字 "加载复习卡片..."（无动画）
//   - 数据页：无骨架屏（数据密集页应有骨架）
//   - ChatModal：纯文字 "加载中..."
//   → 4 种加载态，统一到 Skeleton
//
// 设计（乔布斯视角）：
//   - 加载态不是"等待"，而是"承诺"——告诉用户"内容正在路上，长这样"
//   - shimmer 动画（光带扫过）比纯 pulse 更高级，是 Linear / Notion 的选择
//   - 骨架形状必须模拟真实内容，否则用户会以为是"占位符"而非"加载中"
//
// 设计（卡帕西视角）：
//   - 4 种 variant 覆盖 90% 场景：text / rect / card / avatar
//   - 用设计令牌 animate-shimmer（tailwind.config.ts 中定义）
//   - bg-gray-200 + bg-gradient-to-r 模拟 shimmer 光带
//   - dark 模式自动切换到 bg-gray-700

import { type ReactNode } from "react";
import { cn } from "@/lib/cn";

export type SkeletonVariant = "text" | "rect" | "card" | "avatar";

export interface SkeletonProps {
  variant?: SkeletonVariant;
  /** 自定义宽度（如 "w-32" / "w-full"）*/
  width?: string;
  /** 自定义高度（如 "h-4" / "h-24"）*/
  height?: string;
  /** 圆角类（如 "rounded-card"）；不传则按 variant 默认 */
  rounded?: string;
  className?: string;
  children?: ReactNode;
}

const VARIANT_DEFAULTS: Record<
  SkeletonVariant,
  { className: string; rounded: string }
> = {
  text: { className: "h-4 w-full", rounded: "rounded" },
  rect: { className: "h-24 w-full", rounded: "rounded-card" },
  card: { className: "h-32 w-full", rounded: "rounded-card" },
  avatar: { className: "h-10 w-10", rounded: "rounded-full" },
};

export function Skeleton({
  variant = "text",
  width,
  height,
  rounded,
  className,
}: SkeletonProps) {
  const defaults = VARIANT_DEFAULTS[variant];
  return (
    <div
      className={cn(
        "relative overflow-hidden bg-gray-200 dark:bg-gray-700",
        rounded ?? defaults.rounded,
        defaults.className,
        width,
        height,
        className,
      )}
    >
      {/* shimmer 光带 */}
      <div
        className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/40 dark:via-white/10 to-transparent"
        aria-hidden
      />
    </div>
  );
}

// 组合骨架：一个完整卡片骨架（头像 + 标题 + 描述 + 行）
export interface SkeletonCardProps {
  className?: string;
}

export function SkeletonCard({ className }: SkeletonCardProps) {
  return (
    <div
      className={cn(
        "flex items-start gap-3 p-4 rounded-card border border-gray-100 dark:border-gray-700",
        className,
      )}
    >
      <Skeleton variant="avatar" />
      <div className="flex-1 space-y-2">
        <Skeleton variant="text" width="w-1/3" />
        <Skeleton variant="text" width="w-2/3" height="h-3" />
        <Skeleton variant="text" width="w-1/2" height="h-3" />
      </div>
    </div>
  );
}
