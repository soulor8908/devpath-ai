"use client";

// components/ui/LinkButton.tsx
// 统一"Link 当按钮"组件 — 替代散落各页面的 <Link className="rounded-... bg-...">
//
// 体检报告 M3 修复：全仓至少 7 种不同的"Link 当按钮"样式（查看收藏 / 查看文档 /
// 热力图入口 / 继续学习 等），圆角、内边距、颜色各不相同，破坏了按钮系统的可信度。
//
// 设计（乔布斯视角）：
//   - LinkButton 与 Button 共享同一套 variant/size 字典 → 视觉完全一致
//   - 用户看到 Button 和 LinkButton 长得一样，潜意识就知道"这是可点击的"
//   - 唯一区别：LinkButton 渲染 <a>（用于路由跳转），Button 渲染 <button>（用于动作）
//
// 设计（卡帕西视角）：
//   - 直接复用 Button 的 VARIANT_CLASSES / SIZE_CLASSES，DRY
//   - forwardRef 转发，focus-visible 焦点环与 Button 一致
//   - 不使用原生 <button>，通过 no-native-form-elements 护栏

import { forwardRef } from "react";
import Link from "next/link";
import { cn } from "@/lib/cn";
import { Icon } from "@/components/Icon";
import {
  VARIANT_CLASSES,
  SIZE_CLASSES,
  ICON_ONLY_SIZE_CLASSES,
  type ButtonVariant,
  type ButtonSize,
} from "./Button";

export interface LinkButtonProps
  extends Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "href"> {
  href: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** 左侧图标名 */
  leftIcon?: React.ComponentProps<typeof Icon>["name"];
  /** 右侧图标名（默认 chevron-right，常用于"查看更多"入口；传 null 可关闭）*/
  rightIcon?: React.ComponentProps<typeof Icon>["name"] | null;
  /** 是否占满宽度 */
  block?: boolean;
  /** 纯图标模式（如返回箭头），建议配合 aria-label */
  iconOnly?: boolean;
  /** Next.js Link 的 prefetch 配置 */
  prefetch?: boolean;
}

const DEFAULT_RIGHT_ICON: React.ComponentProps<typeof Icon>["name"] | null =
  null;

export const LinkButton = forwardRef<HTMLAnchorElement, LinkButtonProps>(
  function LinkButton(
    {
      href,
      variant = "primary",
      size = "md",
      leftIcon,
      rightIcon = DEFAULT_RIGHT_ICON,
      block = false,
      iconOnly = false,
      prefetch,
      className,
      children,
      ...rest
    },
    ref,
  ) {
    return (
      <Link
        ref={ref}
        href={href}
        prefetch={prefetch}
        className={cn(
          "inline-flex items-center justify-center font-medium rounded-lg transition-colors",
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40 focus-visible:ring-offset-0",
          VARIANT_CLASSES[variant],
          iconOnly ? ICON_ONLY_SIZE_CLASSES[size] : SIZE_CLASSES[size],
          block && !iconOnly && "w-full",
          className,
        )}
        {...rest}
      >
        {leftIcon && <Icon name={leftIcon} className="w-4 h-4 shrink-0" />}
        {children}
        {rightIcon && !iconOnly && (
          <Icon name={rightIcon} className="w-4 h-4 shrink-0" />
        )}
      </Link>
    );
  },
);
