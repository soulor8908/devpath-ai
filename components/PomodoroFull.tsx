"use client";

// components/PomodoroFull.tsx
// 番茄钟路由页（/timer）— 薄壳组件，包 PomodoroFullContent + TopBar
//
// 设计变化（按用户需求）：
//   - 主体逻辑抽到 PomodoroFullContent（单一事实源）
//   - 路由页仅保留外壳 + TopBar（返回按钮 + 标题）
//   - 移除原「全屏」按钮（fullscreen API）— 用户不再需要浏览器原生全屏，
//     大 modal 形态已足够聚焦
//   - 移除 useAutoFullscreen hook（不再使用）
//   - 路由页仍可访问（向后兼容收藏 URL 的用户），但主入口已改为
//     PomodoroWidget 的 large modal

import Link from "next/link";
import { Icon } from "@/components/Icon";
import { PomodoroFullContent } from "@/components/PomodoroFullContent";

export function PomodoroFull() {
  return (
    <div className="mx-auto max-w-md p-4 space-y-4">
      {/* TopBar：标题 + 返回（移除全屏按钮） */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
          <Icon name="tomato" className="w-5 h-5 text-red-500" />
          番茄专注
        </h1>
        <Link
          href="/"
          className="text-sm text-blue-500 hover:underline flex items-center gap-1"
        >
          <Icon name="chevron-left" className="w-3.5 h-3.5" />
          返回
        </Link>
      </div>

      {/* 主体内容（复用 Modal 内同一组件） */}
      <PomodoroFullContent />
    </div>
  );
}
