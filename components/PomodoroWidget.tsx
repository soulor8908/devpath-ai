"use client";

// components/PomodoroWidget.tsx
// 右下角浮动番茄钟 widget：显示进行中 session 的倒计时 + 控制按钮
//
// 设计目标（乔布斯视角：克制即设计）：
//   - 紧凑：宽度 w-56（比原 w-64 窄），高度可折叠为单行
//   - 可拖动：顶部 grip 把手 + 整体 draggable，位置 localStorage 持久化
//   - 不遮挡学习区：默认贴右下角，但用户可拖到任意位置；拖动后记忆
//   - 折叠态：仅显示倒计时数字 + 进度环，悬停/点击展开控制按钮
//   - z-index 高于 ChatModal（z-[60]），让聊天中启动番茄钟后用户能看到倒计时
//
// 设计目标（卡帕西视角：契约层优先）：
//   - 拖动状态用 useRef + useState 分离（ref 防抖动，state 触发渲染）
//   - 位置持久化用 try/catch 包裹（localStorage 在 SSR / 隐私模式可能不可用）
//   - 监听 POMODORO_SESSION_CHANGED_EVENT 立即刷新，避免 1 秒轮询延迟
//   - 倒计时计算用绝对时间差（startedAt + durationMinutes - now），
//     不依赖 setInterval 累积，避免漂移
//
// 交互细节：
//   - mouse down on header → 记录起始 offset，进入 dragging
//   - mouse move → 更新 position state（直接写 style.transform）
//   - mouse up → 退出 dragging，持久化最终位置
//   - 触屏支持：touchstart/touchmove/touchend 等价映射

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
import { Icon } from "@/components/Icon";

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

/** 计算 session 进度百分比（0-100），用于进度环 */
function computeProgress(session: PomodoroSession): number {
  const total = session.durationMinutes * 60_000;
  const elapsed = Date.now() - new Date(session.startedAt).getTime();
  return Math.min(100, Math.max(0, (elapsed / total) * 100));
}

/** localStorage key：持久化 widget 位置（同设备记忆） */
const POSITION_STORAGE_KEY = "pomodoro-widget-position";

interface WidgetPosition {
  x: number;
  y: number;
}

/** 读取上次位置（无则返回 null，调用方用默认位置） */
function loadPosition(): WidgetPosition | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(POSITION_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<WidgetPosition>;
    if (
      typeof parsed.x === "number" &&
      typeof parsed.y === "number" &&
      Number.isFinite(parsed.x) &&
      Number.isFinite(parsed.y)
    ) {
      return { x: parsed.x, y: parsed.y };
    }
  } catch {
    /* localStorage 不可用 / JSON 损坏 → 用默认 */
  }
  return null;
}

/** 持久化位置（失败静默，不影响主流程） */
function savePosition(pos: WidgetPosition): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(POSITION_STORAGE_KEY, JSON.stringify(pos));
  } catch {
    /* ignore */
  }
}

/**
 * 把 widget 位置约束在 viewport 内，避免拖到屏幕外找不回来。
 * widget 尺寸 w-56 (224px) × ~80px (折叠态)。
 */
function clampPosition(pos: WidgetPosition, vw: number, vh: number): WidgetPosition {
  const WIDGET_W = 224;
  const WIDGET_H = 80;
  return {
    x: Math.min(Math.max(0, pos.x), Math.max(0, vw - WIDGET_W)),
    y: Math.min(Math.max(0, pos.y), Math.max(0, vh - WIDGET_H)),
  };
}

export function PomodoroWidget() {
  const [session, setSession] = useState<PomodoroSession | null>(null);
  const [remainingMs, setRemainingMs] = useState<number>(0);
  const [progress, setProgress] = useState<number>(0);
  const [busy, setBusy] = useState(false);
  // 折叠态：默认折叠（仅倒计时 + 进度环），点击/悬停展开控制
  // 折叠时 widget 高度 ~64px，几乎不遮挡学习区
  const [expanded, setExpanded] = useState(false);
  // widget 位置（相对 viewport 左上角的像素坐标）
  // 初始 null → 首次渲染时用默认位置（右下角），挂载后从 localStorage 恢复
  const [position, setPosition] = useState<WidgetPosition | null>(null);
  // 拖动状态：记录起始 mouse/client 坐标 + widget 起始位置
  const dragStateRef = useRef<{
    startClientX: number;
    startClientY: number;
    startWidgetX: number;
    startWidgetY: number;
  } | null>(null);
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
      setProgress(computeProgress(running));
      // 倒计时归零时通知一次（同一 session 只通知一次）
      if (remaining <= 0 && notifiedRef.current !== running.id) {
        notifiedRef.current = running.id;
        void notify(
          "番茄完成",
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
    // 每秒轮询（兜底，处理倒计时刷新 + 进度环动画）
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

  // 首次挂载：从 localStorage 恢复上次位置（同设备记忆）
  // 若无记录则用默认位置（右下角，距边缘 16px）
  useEffect(() => {
    const saved = loadPosition();
    if (saved) {
      setPosition(saved);
    } else {
      // 默认位置：右下角（vh - widget 高度 - 96px，避开底部 Nav）
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      setPosition({
        x: Math.max(0, vw - 224 - 16),
        y: Math.max(0, vh - 80 - 96),
      });
    }
  }, []);

  // 拖动逻辑：mousedown 记录起点，mousemove 更新位置，mouseup 持久化
  const handleDragStart = useCallback(
    (clientX: number, clientY: number) => {
      if (!position) return;
      dragStateRef.current = {
        startClientX: clientX,
        startClientY: clientY,
        startWidgetX: position.x,
        startWidgetY: position.y,
      };
    },
    [position],
  );

  const handleDragMove = useCallback(
    (clientX: number, clientY: number) => {
      const drag = dragStateRef.current;
      if (!drag) return;
      const dx = clientX - drag.startClientX;
      const dy = clientY - drag.startClientY;
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const next = clampPosition(
        { x: drag.startWidgetX + dx, y: drag.startWidgetY + dy },
        vw,
        vh,
      );
      setPosition(next);
    },
    [],
  );

  const handleDragEnd = useCallback(() => {
    if (!dragStateRef.current) return;
    dragStateRef.current = null;
    // 拖动结束才持久化（避免每次 mousemove 都写 localStorage）
    if (position) savePosition(position);
  }, [position]);

  // 全局 mouseup/touchend 监听：即使鼠标移出 widget 也能正确结束拖动
  useEffect(() => {
    const onMouseUp = () => handleDragEnd();
    const onMouseMove = (e: MouseEvent) => handleDragMove(e.clientX, e.clientY);
    const onTouchEnd = () => handleDragEnd();
    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 0) return;
      const t = e.touches[0];
      handleDragMove(t.clientX, t.clientY);
    };
    document.addEventListener("mouseup", onMouseUp);
    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("touchend", onTouchEnd);
    document.addEventListener("touchmove", onTouchMove, { passive: true });
    return () => {
      document.removeEventListener("mouseup", onMouseUp);
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("touchend", onTouchEnd);
      document.removeEventListener("touchmove", onTouchMove);
    };
  }, [handleDragMove, handleDragEnd]);

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

  // 无 running session 不显示；/timer 页有 PomodoroFull 接管，避免双重 UI；
  // position 未就绪时不显示（避免首帧闪烁在错误位置）
  if (!session || pathname === "/timer" || !position) return null;

  const isPaused = session.status === "paused";
  const isOvertime = remainingMs <= 0 && session.status === "running";

  // 进度环参数：半径 14px，周长 ≈ 88px，strokeDashoffset 根据 progress 计算
  const RADIUS = 14;
  const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
  const dashOffset = CIRCUMFERENCE * (1 - progress / 100);

  return (
    <div
      role="region"
      aria-label={`番茄钟 ${formatCountdown(remainingMs)} 剩余`}
      className="fixed z-[80] w-56 bg-white dark:bg-gray-800 rounded-card shadow-floating border border-gray-200 dark:border-gray-700 select-none"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
      }}
    >
      {/* 拖动把手区：整个 header 可拖动 */}
      <div
        role="separator"
        aria-orientation="horizontal"
        aria-label="拖动番茄钟"
        className="flex items-center justify-center h-5 cursor-move text-gray-300 dark:text-gray-600 hover:text-gray-500 dark:hover:text-gray-400 border-b border-gray-100 dark:border-gray-700"
        onMouseDown={(e) => {
          // 阻止文本选中 + 记录拖动起点
          e.preventDefault();
          handleDragStart(e.clientX, e.clientY);
        }}
        onTouchStart={(e) => {
          if (e.touches.length === 0) return;
          const t = e.touches[0];
          handleDragStart(t.clientX, t.clientY);
        }}
      >
        <Icon name="grip" className="w-3 h-3" />
      </div>

      {/* 主体：紧凑布局，倒计时 + 任务名 + 进度环 */}
      {/* 按 AGENTS.md 2.10：复杂可点击卡片用 div + role=button + tabIndex + onKeyDown */}
      <div
        role="button"
        tabIndex={0}
        onClick={() => setExpanded((v) => !v)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setExpanded((v) => !v);
          }
        }}
        aria-expanded={expanded}
        aria-controls="pomodoro-widget-controls"
        aria-label={expanded ? "折叠控制按钮" : "展开控制按钮"}
        className="w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors text-left cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40"
      >
        {/* 进度环：SVG 内嵌 */}
        <svg
          width="32"
          height="32"
          viewBox="0 0 32 32"
          className="shrink-0"
          aria-hidden="true"
        >
          <circle
            cx="16"
            cy="16"
            r={RADIUS}
            fill="none"
            className="stroke-gray-200 dark:stroke-gray-700"
            strokeWidth="3"
          />
          <circle
            cx="16"
            cy="16"
            r={RADIUS}
            fill="none"
            className={
              isOvertime
                ? "stroke-danger"
                : isPaused
                  ? "stroke-gray-400 dark:stroke-gray-500"
                  : "stroke-brand-500"
            }
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={dashOffset}
            transform="rotate(-90 16 16)"
          />
        </svg>

        {/* 倒计时 + 任务名垂直排列 */}
        <div className="min-w-0 flex-1">
          <div
            className={`font-mono text-xl font-bold tabular-nums leading-tight ${
              isOvertime
                ? "text-danger"
                : isPaused
                  ? "text-gray-400 dark:text-gray-500"
                  : "text-gray-900 dark:text-gray-100"
            }`}
          >
            {formatCountdown(remainingMs)}
          </div>
          <div className="text-2xs text-gray-400 dark:text-gray-500 truncate flex items-center gap-1">
            {session.type === "focus" ? null : session.type === "short_break" ? "短休 · " : "长休 · "}
            {session.taskDescription || "（未命名）"}
            {session.interruptions > 0 && (
              <span
                title={`被打断 ${session.interruptions} 次`}
                className="inline-flex items-center justify-center min-w-[16px] h-4 px-1 rounded-full bg-danger text-white text-2xs font-bold"
              >
                {session.interruptions}
              </span>
            )}
          </div>
        </div>

        {/* 展开/折叠指示符 */}
        <Icon
          name={expanded ? "chevron-down" : "chevron-right"}
          className="w-3 h-3 text-gray-400 dark:text-gray-500 shrink-0"
        />
      </div>

      {/* 控制区：折叠时隐藏，展开时显示 */}
      {expanded && (
        <div
          id="pomodoro-widget-controls"
          className="px-3 pb-3 pt-1 space-y-2 border-t border-gray-100 dark:border-gray-700"
        >
          <div className="flex gap-1.5">
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
          <Link
            href="/timer"
            className="block text-center text-2xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            全屏专注 →
          </Link>
        </div>
      )}
    </div>
  );
}
