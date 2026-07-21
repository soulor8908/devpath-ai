"use client";

// components/ui/Modal.tsx
// 统一模态组件 — 替代 3 套散落的模态实现（Toast confirm / profile 升级模态 / ChatModal）
//
// 体检报告 C5 + m5 修复：
//   - 背景遮罩：bg-black/40 vs bg-black/50 → 统一 backdrop-blur-sm + bg-black/40
//   - 阴影：shadow-lg vs shadow-2xl → 统一 shadow-modal（设计令牌）
//   - 圆角：rounded-xl → 统一 rounded-card（设计令牌，12px）
//   - 焦点陷阱：之前全部缺失 → 现在内置 focus trap + ESC 关闭 + 焦点恢复
//
// 设计（乔布斯视角）：
//   - 模态是"打断用户流"的强视觉，必须克制 — 只有 1 种遮罩、1 种阴影、1 种圆角
//   - ESC 关闭 + 点遮罩关闭是用户预期，不能漏
//   - 动画 150ms fade-in + 200ms slide-up，足够感知但不拖沓
//
// 设计（卡帕西视角）：
//   - focus trap 用 useEffect + keydown 监听，零依赖
//   - 焦点恢复：关闭时把焦点还给触发元素（document.activeElement 快照）
//   - aria-modal + role="dialog" + aria-labelledby 满足 WCAG
//   - body scroll lock 防止背景滚动

import { useEffect, useRef, type ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Icon } from "@/components/Icon";
import { Button } from "./Button";

export type ModalSize = "sm" | "md" | "lg" | "xl";

const SIZE_CLASSES: Record<ModalSize, string> = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
  // xl：超宽弹窗（脑图、知识树等需要大画布的场景），桌面端接近视口宽度
  // 需求3：从 max-w-3xl (768px) 加大到 max-w-5xl (1024px)，让宽脑图有更大画布
  xl: "max-w-5xl",
};

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: ReactNode;
  description?: ReactNode;
  size?: ModalSize;
  children?: ReactNode;
  /** 底部操作区（如确认/取消按钮）*/
  footer?: ReactNode;
  /** 是否显示右上角关闭按钮（默认 true）*/
  showCloseButton?: boolean;
  /** 点击遮罩是否关闭（默认 true）*/
  closeOnBackdropClick?: boolean;
  /** ESC 是否关闭（默认 true）*/
  closeOnEsc?: boolean;
  /** 隐藏后是否卸载（默认 false，保留 DOM 用于过渡）*/
  forceMount?: boolean;
  className?: string;
  /** 内容区 className（覆盖默认 px-5 py-2，用于脑图等需要满铺的场景）*/
  contentClassName?: string;
  /** 是否撑满视口高度（默认 false，脑图等大画布场景设 true 让内容区高度 = 90vh - header - footer）*/
  fillHeight?: boolean;
}

export function Modal({
  open,
  onClose,
  title,
  description,
  size = "md",
  children,
  footer,
  showCloseButton = true,
  closeOnBackdropClick = true,
  closeOnEsc = true,
  forceMount = false,
  className,
  contentClassName,
  fillHeight = false,
}: ModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const previouslyFocusedRef = useRef<HTMLElement | null>(null);

  // 焦点陷阱 + ESC 关闭 + body scroll lock
  useEffect(() => {
    if (!open) return;

    // 快照当前焦点，关闭后恢复
    previouslyFocusedRef.current = document.activeElement as HTMLElement | null;

    // body scroll lock
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const dialog = dialogRef.current;
    if (dialog) {
      // 聚焦到模态内第一个可聚焦元素
      const focusable = dialog.querySelector<HTMLElement>(FOCUSABLE_SELECTOR);
      if (focusable) {
        focusable.focus();
      } else {
        dialog.focus();
      }
    }

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && closeOnEsc) {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key !== "Tab" || !dialogRef.current) return;
      const focusableEls =
        dialogRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR);
      if (focusableEls.length === 0) return;
      const first = focusableEls[0];
      const last = focusableEls[focusableEls.length - 1];
      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = prevOverflow;
      // 焦点恢复
      previouslyFocusedRef.current?.focus?.();
    };
  }, [open, onClose, closeOnEsc]);

  if (!open && !forceMount) return null;

  return (
    <div
      className={cn(
        // z-[60]：高于底部 Nav (z-50) 与 FloatingChat (z-50)，低于 PomodoroWidget (z-[80])
        // 移动端 items-end：modal 从底部滑入，避免键盘弹出时顶部留白
        // sm+ items-center：桌面端居中
        "fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4",
        open ? "animate-fade-in" : "opacity-0 pointer-events-none",
      )}
      role="presentation"
    >
      {/* 遮罩 */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={closeOnBackdropClick ? onClose : undefined}
        aria-hidden
      />

      {/* 对话框 */}
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? "modal-title" : undefined}
        aria-describedby={description ? "modal-desc" : undefined}
        tabIndex={-1}
        className={cn(
          "relative w-full bg-white dark:bg-gray-800 shadow-modal",
          // 移动端：贴底显示，顶部大圆角，无底部圆角，最大高度 90vh 防溢出
          "rounded-t-card sm:rounded-card",
          "max-h-[90vh] overflow-y-auto",
          "animate-slide-up",
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40",
          // fillHeight：用 flex column 让 children 占满剩余高度（脑图等大画布场景）
          fillHeight && "flex flex-col",
          SIZE_CLASSES[size],
          className,
        )}
      >
        {(title || showCloseButton) && (
          <div className="flex items-start justify-between gap-4 px-5 pt-5 pb-3 shrink-0">
            <div className="min-w-0 flex-1">
              {title && (
                <h2
                  id="modal-title"
                  className="text-lg font-semibold text-gray-900 dark:text-gray-100"
                >
                  {title}
                </h2>
              )}
              {description && (
                <p
                  id="modal-desc"
                  className="mt-1 text-sm text-gray-500 dark:text-gray-400"
                >
                  {description}
                </p>
              )}
            </div>
            {showCloseButton && (
              <Button
                iconOnly
                size="sm"
                variant="ghost"
                aria-label="关闭"
                onClick={onClose}
                className="-mr-1 -mt-1 shrink-0"
              >
                <Icon name="x" className="w-4 h-4" />
              </Button>
            )}
          </div>
        )}

        {children && (
          <div
            className={cn(
              "px-5 py-2 text-sm text-gray-700 dark:text-gray-300",
              // fillHeight：children 区占满剩余高度，min-h-0 让内部 overflow 生效
              fillHeight && "flex-1 min-h-0",
              contentClassName,
            )}
          >
            {children}
          </div>
        )}

        {footer && (
          <div className="flex items-center justify-end gap-2 px-5 py-4 shrink-0">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
