"use client";

// components/PomodoroWidget.tsx
// 右下角浮动番茄钟 widget：显示进行中的 session 倒计时 + 控制按钮
//
// 设计：
//   - fixed bottom-4 right-4 浮动卡片（避免遮挡底部导航，bottom-16 在移动端更安全）
//   - 倒计时从 running session 的 startedAt + durationMinutes 计算
//   - 每 1 秒轮询 getRunningSession() 更新倒计时
//   - 监听 POMODORO_SESSION_CHANGED_EVENT 事件，session 变化时立即刷新（避免 1 秒延迟）
//   - 暂停/恢复/放弃 三个按钮
//   - 打断次数 > 0 时显示红色徽标
//   - 无 running session 时不显示
//   - dark mode 支持
//   - z-index 高于 ChatModal（z-[60]），让聊天中启动番茄钟后用户能看到倒计时

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import type { PomodoroSession } from "@/lib/types";
import {
  getRunningSession,
  pauseSession,
  resumeSession,
  abandonSession,
  POMODORO_SESSION_CHANGED_EVENT,
} from "@/lib/timer/pomodoro";
import { notify } from "@/lib/timer/notification-permission";
import { confirmDialog } from "@/lib/confirm-dialog";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui";

/** 倒计时显示格式 MM:SS */
function formatCountdown(ms: number): string {
  if (ms < 0) ms = 0;
  const totalSec = Math.floor(ms / 1000);
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

/** 计算 session 剩余时间（ms），负值表示已超时 */
function computeRemainingMs(session: PomodoroSession): number {
  const startMs = new Date(session.startedAt).getTime();
  const endMs = startMs + session.durationMinutes * 60_000;
  return endMs - Date.now();
}

export function PomodoroWidget() {
  const [session, setSession] = useState<PomodoroSession | null>(null);
  const [remainingMs, setRemainingMs] = useState<number>(0);
  const [busy, setBusy] = useState(false);
  // 用于在 session 切换时避免重复通知
  const notifiedRef = useRef<string | null>(null);
  // 当前路由：在 /timer 页时不显示 widget（PomodoroFull 已接管，避免双重 UI）
  const pathname = usePathname();

  const refresh = useCallback(async () => {
    const running = await getRunningSession();
    setSession(running);
    if (running) {
      const remaining = computeRemainingMs(running);
      setRemainingMs(remaining);
      // 倒计时归零时通知一次（同一 session 只通知一次）
      if (remaining <= 0 && notifiedRef.current !== running.id) {
        notifiedRef.current = running.id;
        void notify(
          "番茄完成 🍅",
          `「${running.taskDescription}」专注完成，去休息一下吧`,
        );
      }
    } else {
      notifiedRef.current = null;
    }
  }, []);

  useEffect(() => {
    // 首次立即拉一次
    void refresh();
    // 每秒轮询（兜底，处理倒计时刷新）
    const timer = setInterval(() => {
      void refresh();
    }, 1000);
    // 监听 session 变化事件：session 创建/完成/放弃/暂停/恢复时立即刷新
    // 把响应延迟从 1 秒降到 <100ms，让"AI 启动番茄钟" → "看到倒计时" 体验流畅
    const onSessionChanged = () => { void refresh(); };
    window.addEventListener(POMODORO_SESSION_CHANGED_EVENT, onSessionChanged);
    return () => {
      clearInterval(timer);
      window.removeEventListener(POMODORO_SESSION_CHANGED_EVENT, onSessionChanged);
    };
  }, [refresh]);

  async function handlePauseResume() {
    if (!session) return;
    setBusy(true);
    try {
      if (session.status === "running") {
        await pauseSession(session.id);
      } else if (session.status === "paused") {
        await resumeSession(session.id);
      }
      await refresh();
    } finally {
      setBusy(false);
    }
  }

  async function handleAbandon() {
    if (!session) return;
    const ok = await confirmDialog({
      title: "放弃本次番茄？",
      message: "确定放弃这个番茄吗？本次专注将不计入统计",
      confirmText: "放弃",
      cancelText: "继续",
      danger: true,
    });
    if (!ok) return;
    setBusy(true);
    try {
      await abandonSession(session.id, "user_abandon_from_widget");
      await refresh();
    } finally {
      setBusy(false);
    }
  }

  // 无 running session 不显示；/timer 页有 PomodoroFull 接管，避免双重 UI
  if (!session || pathname === "/timer") return null;

  const isPaused = session.status === "paused";
  const isOvertime = remainingMs <= 0 && session.status === "running";

  return (
    <div className="fixed bottom-20 right-4 z-[80] w-64 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-lg p-3 space-y-2">
      {/* 顶部：任务描述 + 打断徽标 */}
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="text-[10px] uppercase tracking-wide text-gray-400">
            {session.type === "focus" ? "专注中" : session.type === "short_break" ? "短休息" : "长休息"}
            {isPaused && " · 已暂停"}
            {isOvertime && " · 已超时"}
          </p>
          <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">
            {session.taskDescription || "（未命名任务）"}
          </p>
        </div>
        {session.interruptions > 0 && (
          <span
            title={`被打断 ${session.interruptions} 次`}
            className="shrink-0 inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-red-500 text-white text-[10px] font-bold"
          >
            {session.interruptions}
          </span>
        )}
      </div>

      {/* 倒计时 */}
      <div
        className={`text-center font-mono text-3xl font-bold tabular-nums ${
          isOvertime
            ? "text-red-600 dark:text-red-400"
            : isPaused
              ? "text-gray-400 dark:text-gray-500"
              : "text-gray-900 dark:text-gray-100"
        }`}
      >
        {formatCountdown(remainingMs)}
      </div>

      {/* 控制按钮 */}
      <div className="flex gap-2">
        <Button
          variant="secondary"
          size="sm"
          onClick={handlePauseResume}
          disabled={busy}
          className="flex-1"
        >
          {isPaused ? "恢复" : "暂停"}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleAbandon}
          disabled={busy}
          className="flex-1"
        >
          放弃
        </Button>
      </div>

      {/* 跳转全屏 */}
      <Link
        href="/timer"
        className="block text-center text-[10px] text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
      >
        全屏专注 →
      </Link>
    </div>
  );
}
