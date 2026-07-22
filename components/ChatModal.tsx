"use client";

// components/ChatModal.tsx
// AI 对话全屏模态容器
//
// 关闭手势（移动端优先）：
//   - ESC 键（桌面）
//   - 右上角 X 按钮
//   - 向右滑动关闭（touch）：从左边缘 24px 内开始，或任意位置水平右滑超过阈值
//     设计：iOS 风格的边缘返回手势，但不触发路由返回（chat 是 store-driven 不是路由）
//
// 实现（卡帕西视角）：
//   - 仅追踪水平位移，垂直位移 > 水平时判定为滚动（不关闭）
//   - 滑动过程中容器 translateX 跟手，松手时按阈值决定关闭/回弹
//   - 阈值：屏幕宽度 25% 或 120px 取小

import { ReactNode, useEffect, useRef, useState } from "react";
import { Icon } from "@/components/Icon";
import { Button } from "@/components/ui";

interface ChatModalProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
}

/** 右滑关闭阈值：屏幕宽度的 25%，但不超过 120px */
const SWIPE_CLOSE_RATIO = 0.25;
const SWIPE_CLOSE_MAX_PX = 120;
/** 边缘手势起始区域宽度（px），从左边缘开始 */
const EDGE_WIDTH = 24;

export function ChatModal({ open, onClose, children }: ChatModalProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);
  const [dragX, setDragX] = useState(0);

  // ESC 关闭 + 锁定 body 滚动
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, onClose]);

  // 重置拖拽状态
  useEffect(() => {
    if (!open) {
      setDragX(0);
      touchStartX.current = null;
      touchStartY.current = null;
    }
  }, [open]);

  function handleTouchStart(e: React.TouchEvent) {
    if (e.touches.length !== 1) return;
    const touch = e.touches[0];
    touchStartX.current = touch.clientX;
    touchStartY.current = touch.clientY;
  }

  function handleTouchMove(e: React.TouchEvent) {
    if (touchStartX.current === null || touchStartY.current === null) return;
    if (e.touches.length !== 1) return;
    const touch = e.touches[0];
    const dx = touch.clientX - touchStartX.current;
    const dy = touch.clientY - touchStartY.current;

    // 垂直位移 > 水平 → 用户在滚动内容，不拦截
    if (Math.abs(dy) > Math.abs(dx)) {
      return;
    }

    // 仅右滑（dx > 0）才跟手；左滑忽略
    if (dx <= 0) {
      setDragX(0);
      return;
    }

    // 边缘手势：起始点在左边缘 EDGE_WIDTH 内，或已经进入拖拽状态
    const isEdgeStart = touchStartX.current < EDGE_WIDTH;
    if (!isEdgeStart && dragX === 0 && dx < 30) {
      // 非边缘起始，需要滑出一定距离才接管（避免误触）
      return;
    }

    // 阻止默认行为（防止页面滚动）
    e.preventDefault();
    // 加阻尼：超出屏幕宽度后阻力增大
    const screenWidth = window.innerWidth;
    const dampened = dx > screenWidth * 0.5 ? screenWidth * 0.5 + (dx - screenWidth * 0.5) * 0.3 : dx;
    setDragX(dampened);
  }

  function handleTouchEnd() {
    if (touchStartX.current === null) return;
    const screenWidth = window.innerWidth;
    const threshold = Math.min(screenWidth * SWIPE_CLOSE_RATIO, SWIPE_CLOSE_MAX_PX);

    if (dragX > threshold) {
      // 超过阈值 → 关闭（先动画到屏幕外再 onClose）
      setDragX(screenWidth);
      setTimeout(() => {
        onClose();
        setDragX(0);
      }, 200);
    } else {
      // 未超过阈值 → 回弹
      setDragX(0);
    }
    touchStartX.current = null;
    touchStartY.current = null;
  }

  if (!open) return null;

  const isDragging = dragX > 0;
  const opacity = isDragging ? Math.max(0.3, 1 - dragX / window.innerWidth) : 1;

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-[60] bg-white dark:bg-gray-900 flex flex-col"
      style={{
        transform: dragX > 0 ? `translateX(${dragX}px)` : undefined,
        transition: isDragging ? "none" : "transform 200ms ease-out, opacity 200ms ease-out",
        opacity,
      }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <header className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-800">
        <h2 className="font-semibold text-lg text-gray-900 dark:text-gray-100">
          AI 对话
        </h2>
        <Button
          variant="ghost"
          size="md"
          iconOnly
          aria-label="关闭对话"
          onClick={onClose}
          className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300"
        >
          <Icon name="x" className="w-5 h-5" />
        </Button>
      </header>
      <div className="flex-1 overflow-hidden flex flex-col">{children}</div>
    </div>
  );
}
