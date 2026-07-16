"use client";

// components/FullscreenPrompt.tsx
// 全屏提示卡片：进入学习页时显示，引导用户点击进入全屏专注模式

import { Icon } from "@/components/Icon";

interface Props {
  onEnter: () => void;
  onDismiss: () => void;
}

export function FullscreenPrompt({ onEnter, onDismiss }: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="mx-4 w-full max-w-sm rounded-2xl bg-white dark:bg-gray-800 p-6 shadow-2xl">
        <div className="mb-4 flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-50 dark:bg-blue-950/40">
            <Icon name="monitor" className="w-8 h-8 text-blue-500" />
          </div>
        </div>
        <h2 className="mb-2 text-center text-lg font-bold text-gray-900 dark:text-gray-100">
          进入专注模式
        </h2>
        <p className="mb-6 text-center text-sm text-gray-500 dark:text-gray-400">
          全屏可以屏蔽浏览器干扰，更专注地学习。点击下方按钮进入全屏。
        </p>
        <div className="flex flex-col gap-2">
          <button
            onClick={onEnter}
            className="w-full rounded-lg bg-blue-600 px-4 py-3 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
          >
            进入全屏
          </button>
          <button
            onClick={onDismiss}
            className="w-full rounded-lg px-4 py-2 text-sm text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            暂不
          </button>
        </div>
      </div>
    </div>
  );
}
