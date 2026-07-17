"use client";

import { ReactNode, useEffect } from "react";
import { Icon } from "@/components/Icon";

interface ChatModalProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
}

export function ChatModal({ open, onClose, children }: ChatModalProps) {
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

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] bg-white dark:bg-gray-900 flex flex-col">
      <header className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-800">
        <h2 className="font-semibold text-lg text-gray-900 dark:text-gray-100">
          AI 对话
        </h2>
        <button
          type="button"
          aria-label="关闭对话"
          onClick={onClose}
          className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300"
        >
          <Icon name="x" className="w-5 h-5" />
        </button>
      </header>
      <div className="flex-1 overflow-hidden flex flex-col">{children}</div>
    </div>
  );
}
