// components/RouteLoading.tsx
// 路由级骨架屏 — App Router loading.tsx 的统一加载态
//
// 2026-07-26 性能优化（卡帕西视角）：
//   原版各路由跳转期间浏览器只显示空白（路由 chunk 下载 + 客户端 hydrate 完成前）。
//   Next.js App Router 约定 loading.tsx 在路由 chunk 加载期间立即渲染，
//   用骨架屏填满 viewport 能消除"白屏闪烁"，给用户"正在加载"的明确反馈。
//
// 设计（乔布斯视角）：
//   - 骨架形状必须模拟真实内容，否则用户会以为是"占位符"而非"加载中"
//   - shimmer 动画（Skeleton 组件内置）比纯 pulse 更高级
//   - 复用 Skeleton 组件，不重复造轮子
//
// 设计（卡帕西视角）：
//   - 4 种 variant 覆盖主要路由形态：list / detail / chart / form
//   - 服务端组件（无 "use client"）—— App Router loading.tsx 必须是 server component
//   - 零运行时依赖，纯 JSX

import { Skeleton, SkeletonCard } from "@/components/ui";

export type RouteLoadingVariant = "list" | "detail" | "chart" | "form";

interface RouteLoadingProps {
  variant?: RouteLoadingVariant;
  /** 自定义容器 className */
  className?: string;
}

/**
 * 路由级骨架屏
 *
 * - list: 卡片列表（复习 / 收藏 / 错题本 / 计划列表）
 * - detail: 详情页（学习详情 / 用户主页）
 * - chart: 图表页（统计 / 雷达 / 热力图）
 * - form: 表单页（设置 / 编辑）
 */
export function RouteLoading({
  variant = "list",
  className = "",
}: RouteLoadingProps) {
  return (
    <div
      className={`mx-auto max-w-2xl space-y-4 p-4 pb-20 ${className}`}
      role="status"
      aria-label="正在加载"
      aria-live="polite"
    >
      {variant === "list" && (
        <>
          <Skeleton variant="text" width="w-32" height="h-6" />
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </>
      )}

      {variant === "detail" && (
        <>
          <Skeleton variant="text" width="w-1/2" height="h-7" />
          <Skeleton variant="rect" height="h-24" />
          <Skeleton variant="rect" height="h-40" />
          <Skeleton variant="rect" height="h-40" />
        </>
      )}

      {variant === "chart" && (
        <>
          <Skeleton variant="text" width="w-32" height="h-7" />
          <div className="flex gap-2">
            <Skeleton variant="text" width="w-16" height="h-8" />
            <Skeleton variant="text" width="w-16" height="h-8" />
            <Skeleton variant="text" width="w-16" height="h-8" />
          </div>
          <Skeleton variant="rect" height="h-80" />
        </>
      )}

      {variant === "form" && (
        <>
          <Skeleton variant="text" width="w-32" height="h-7" />
          <Skeleton variant="rect" height="h-12" />
          <Skeleton variant="rect" height="h-12" />
          <Skeleton variant="rect" height="h-24" />
          <Skeleton variant="text" width="w-24" height="h-10" />
        </>
      )}

      <span className="sr-only">正在加载页面内容...</span>
    </div>
  );
}
