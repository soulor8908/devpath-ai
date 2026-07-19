// components/ui/EmptyState.tsx
// 统一空状态组件 — 替代 6 种散落的空状态实现
//
// 体检报告 M4 修复：
//   - 首页 schedule 为空：rounded-2xl p-4 卡片
//   - 复习页无卡片：py-12 text-gray-400 纯文字
//   - Profile 无模型：border-dashed bg-gray-50 虚线框
//   - 错题本无错题：rounded-lg p-4 实心卡片
//   - 成就墙 0%：进度条 + 百分比
//   - 复习完成：party 图标 + 文字
//   → 6 种视觉处理，全部统一到 EmptyState
//
// 设计（乔布斯视角）：
//   - 空状态是"产品的呼吸"——不是"没数据"，而是"引导用户创造数据"
//   - 一个图标 + 一句标题 + 一句描述 + 一个 CTA，足够
//   - icon 用大号 muted 色，标题用 text-base font-medium，描述用 text-sm text-gray-500
//
// 设计（卡帕西视角）：
//   - 组件职责单一：只负责布局，不负责业务
//   - action 是 ReactNode，可以是 LinkButton / Button / 任意元素，灵活组合
//   - icon 支持 IconName（复用 Icon 组件）或自定义 ReactNode

import { type ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Icon, type IconName } from "@/components/Icon";

export interface EmptyStateProps {
  /** 图标名（Icon 组件支持的 name）*/
  icon?: IconName;
  /** 自定义图标节点（优先级高于 icon）*/
  iconNode?: ReactNode;
  /** 标题 */
  title: ReactNode;
  /** 描述文字 */
  description?: ReactNode;
  /** 操作区（通常是 LinkButton / Button）*/
  action?: ReactNode;
  /** 紧凑模式（减少 padding，用于卡片内部）*/
  compact?: boolean;
  /** 自定义类名 */
  className?: string;
}

export function EmptyState({
  icon = "check-circle",
  iconNode,
  title,
  description,
  action,
  compact = false,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center",
        compact ? "py-6 px-4" : "py-12 px-4",
        className,
      )}
    >
      {iconNode ? (
        <div className={cn(compact ? "mb-2" : "mb-3", "text-gray-300 dark:text-gray-600")}>
          {iconNode}
        </div>
      ) : (
        <Icon
          name={icon}
          className={cn(
            "text-gray-300 dark:text-gray-600",
            compact ? "w-8 h-8 mb-2" : "w-12 h-12 mb-3",
          )}
        />
      )}
      <p
        className={cn(
          "font-medium text-gray-700 dark:text-gray-300",
          compact ? "text-sm" : "text-base",
        )}
      >
        {title}
      </p>
      {description && (
        <p
          className={cn(
            "mt-1 text-gray-500 dark:text-gray-400",
            compact ? "text-xs" : "text-sm",
          )}
        >
          {description}
        </p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
