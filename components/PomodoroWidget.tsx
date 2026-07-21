"use client";

// components/PomodoroWidget.tsx
// 番茄钟三态 widget：small ↔ medium ↔ large
//
// 三态设计（乔布斯视角：克制即设计）：
//   - small：圆形进度条（直径 56px）+ 中间显示剩余分钟数 + 可拖动
//     点击 → 展开 medium（不丢失当前 session 状态）
//   - medium：grip 拖动条 + 倒计时 + 任务名 + 进度环 + 控制按钮
//     点击「展开全屏」→ large modal
//   - large：Modal 形式渲染 PomodoroFullContent（idle/running/completed 三态视图）
//     失焦 / ESC / 关闭按钮 → 回到 small（不回 medium，避免遮挡）
//
// 拖动优化（卡帕西视角，修卡顿 + 防事件透传）：
//   - Pointer Events API 替代 mouse + touch 双套监听
//   - setPointerCapture(e.pointerId)：所有后续指针事件都路由到 handle 元素，
//     **不会透传到页面**（修拖动快时鼠标飞出 widget 触发底层 hover/click 的问题）
//   - 拖动时直接操作 ref.style.transform（不 setState），拖动结束才同步 state
//     → 60fps 平滑拖动，无重渲染开销
//   - 拖动期间 widget 加 pointer-events-none 到子元素，避免内部按钮 hover 触发
//
// 暂停不关闭弹窗（关键约束）：
//   - small/medium：暂停只切 session.status=paused，widget 仍渲染
//   - large：Modal onClose 由用户主动触发（关闭按钮/ESC），pauseSession 不调用 onClose
//
// 不遮挡学习区：
//   - small 直径仅 56px，比 medium w-56 更小
//   - 默认贴右下角，距边缘 16px，避开底部 Nav 96px
//   - 拖动后位置 localStorage 持久化（同设备记忆）

import { useState, useEffect, useCallback, useRef } from "react";
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
import { Modal } from "@/components/ui";
import { Icon } from "@/components/Icon";
import { PomodoroFullContent } from "@/components/PomodoroFullContent";

/** Widget 三态：small（圆环）/ medium（卡片）/ large（Modal） */
type WidgetMode = "small" | "medium" | "large";

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
/** localStorage key：持久化 widget 模式（用户偏好 small/medium，下次默认该模式） */
const MODE_STORAGE_KEY = "pomodoro-widget-mode";

interface WidgetPosition {
  x: number;
  y: number;
}

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
    /* ignore */
  }
  return null;
}

function savePosition(pos: WidgetPosition): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(POSITION_STORAGE_KEY, JSON.stringify(pos));
  } catch {
    /* ignore */
  }
}

/** 加载上次模式偏好（默认 small，最小遮挡） */
function loadModePreference(): WidgetMode {
  if (typeof window === "undefined") return "small";
  try {
    const raw = localStorage.getItem(MODE_STORAGE_KEY);
    if (raw === "small" || raw === "medium") return raw;
  } catch {
    /* ignore */
  }
  return "small";
}

function saveModePreference(mode: WidgetMode): void {
  if (typeof window === "undefined") return;
  // large 不持久化（modal 默认不开），下次仍用 small/medium
  if (mode === "large") return;
  try {
    localStorage.setItem(MODE_STORAGE_KEY, mode);
  } catch {
    /* ignore */
  }
}

/**
 * 把 widget 位置约束在 viewport 内，避免拖到屏幕外找不回来。
 * 用传入的 widgetW/H（不同模式尺寸不同）做精准约束。
 */
function clampPosition(
  pos: WidgetPosition,
  vw: number,
  vh: number,
  widgetW: number,
  widgetH: number,
): WidgetPosition {
  return {
    x: Math.min(Math.max(0, pos.x), Math.max(0, vw - widgetW)),
    y: Math.min(Math.max(0, pos.y), Math.max(0, vh - widgetH)),
  };
}

/** small 模式尺寸：直径 56px */
const SMALL_SIZE = 56;
/** medium 模式尺寸：宽 224px / 折叠态高 ~88px */
const MEDIUM_W = 224;
const MEDIUM_H_COLLAPSED = 88;

export function PomodoroWidget() {
  const [session, setSession] = useState<PomodoroSession | null>(null);
  const [remainingMs, setRemainingMs] = useState<number>(0);
  const [progress, setProgress] = useState<number>(0);
  const [busy, setBusy] = useState(false);
  // 三态模式：small（默认）/ medium / large
  const [mode, setMode] = useState<WidgetMode>("small");
  // widget 位置（相对 viewport 左上角像素）
  const [position, setPosition] = useState<WidgetPosition | null>(null);
  // 拖动状态：使用 ref 直接操作 DOM transform，避免每帧 setState 重渲染
  const widgetRef = useRef<HTMLDivElement | null>(null);
  const dragStateRef = useRef<{
    pointerId: number;
    startClientX: number;
    startClientY: number;
    startWidgetX: number;
    startWidgetY: number;
  } | null>(null);
  // 用于 session 切换时避免重复通知
  const notifiedRef = useRef<string | null>(null);
  // 当前路由：在 /timer 页不显示 widget（路由页已接管，避免双重 UI）
  const pathname = usePathname();

  const refresh = useCallback(async () => {
    const running = await getRunningSession();
    setSession(running);
    if (running) {
      const remaining = computeRemainingMs(running);
      setRemainingMs(remaining);
      setProgress(computeProgress(running));
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
    void refresh();
    const timer = setInterval(() => { void refresh(); }, 1000);
    const onSessionChanged = () => { void refresh(); };
    window.addEventListener(POMODORO_SESSION_CHANGED_EVENT, onSessionChanged);
    return () => {
      clearInterval(timer);
      window.removeEventListener(POMODORO_SESSION_CHANGED_EVENT, onSessionChanged);
    };
  }, [refresh]);

  // 首次挂载：恢复位置 + 模式偏好
  useEffect(() => {
    const savedPos = loadPosition();
    if (savedPos) {
      setPosition(savedPos);
    } else {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      // 默认右下角，避开底部 Nav
      setPosition({
        x: Math.max(0, vw - SMALL_SIZE - 16),
        y: Math.max(0, vh - SMALL_SIZE - 96),
      });
    }
    setMode(loadModePreference());
  }, []);

  /**
   * Pointer Events 拖动：setPointerCapture 后所有后续 pointer 事件都路由到 handle 元素，
   * 即使鼠标飞出 widget 也不会触发底层元素的 click/hover（修事件透传）。
   * 拖动时直接操作 ref.style.transform，不 setState → 60fps 平滑无重渲染。
   */
  const handlePointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!position) return;
      // 仅响应主键（左键 / 触屏）
      if (e.button !== 0 && e.pointerType === "mouse") return;
      // 捕获指针：后续所有 pointer 事件都路由到当前元素，不会透传
      e.currentTarget.setPointerCapture(e.pointerId);
      dragStateRef.current = {
        pointerId: e.pointerId,
        startClientX: e.clientX,
        startClientY: e.clientY,
        startWidgetX: position.x,
        startWidgetY: position.y,
      };
      // 拖动期间给 widget 加 dragging 类，子元素 pointer-events-none
      widgetRef.current?.classList.add("dragging");
    },
    [position],
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      const drag = dragStateRef.current;
      if (!drag || drag.pointerId !== e.pointerId) return;
      const dx = e.clientX - drag.startClientX;
      const dy = e.clientY - drag.startClientY;
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      // 用当前模式的尺寸做约束
      const [w, h] = mode === "small"
        ? [SMALL_SIZE, SMALL_SIZE]
        : [MEDIUM_W, MEDIUM_H_COLLAPSED];
      const next = clampPosition(
        { x: drag.startWidgetX + dx, y: drag.startWidgetY + dy },
        vw,
        vh,
        w,
        h,
      );
      // 直接操作 DOM transform（不 setState，避免重渲染抖动）
      if (widgetRef.current) {
        widgetRef.current.style.left = `${next.x}px`;
        widgetRef.current.style.top = `${next.y}px`;
      }
    },
    [mode],
  );

  const handlePointerUp = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      const drag = dragStateRef.current;
      if (!drag || drag.pointerId !== e.pointerId) return;
      // 释放指针捕获
      try {
        e.currentTarget.releasePointerCapture(drag.pointerId);
      } catch {
        /* ignore */
      }
      dragStateRef.current = null;
      widgetRef.current?.classList.remove("dragging");
      // 拖动结束才同步 state（持久化用）
      const left = widgetRef.current?.style.left;
      const top = widgetRef.current?.style.top;
      if (left && top) {
        const x = parseFloat(left);
        const y = parseFloat(top);
        if (Number.isFinite(x) && Number.isFinite(y)) {
          setPosition({ x, y });
          savePosition({ x, y });
        }
      }
    },
    [],
  );

  // 切换模式：large → small（用户主动关闭 modal 时）
  // medium ↔ small 都通过 setMode + saveModePreference 持久化
  const switchMode = useCallback((next: WidgetMode) => {
    setMode(next);
    saveModePreference(next);
  }, []);

  // small → medium：点击展开
  // medium → small：点击折叠
  // medium → large：点击「展开全屏」按钮（不在拖动 handle 上）
  const handleWidgetClick = useCallback(() => {
    if (mode === "small") {
      switchMode("medium");
    } else if (mode === "medium") {
      switchMode("small");
    }
    // large 不在此处切换（modal 关闭按钮触发）
  }, [mode, switchMode]);

  // large modal 关闭：回到 small（用户需求：失焦直接变回小弹窗）
  const handleLargeClose = useCallback(() => {
    switchMode("small");
  }, [switchMode]);

  // medium 中「展开」按钮：阻止冒泡，避免触发 handleWidgetClick 折叠
  const handleExpandToLarge = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      switchMode("large");
    },
    [switchMode],
  );

  async function handlePauseResume(e?: React.MouseEvent) {
    e?.stopPropagation();
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

  async function handleAbandon(e?: React.MouseEvent) {
    e?.stopPropagation();
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

  // 无 running session 不显示；/timer 页有路由页接管，避免双重 UI；
  // position 未就绪时不显示（避免首帧闪烁在错误位置）
  if (!session || pathname === "/timer" || !position) return null;

  const isPaused = session.status === "paused";
  const isOvertime = remainingMs <= 0 && session.status === "running";

  // ============ small 模式：圆形进度条 + 中间显示剩余分钟数 ============
  if (mode === "small") {
    // 圆环参数：直径 56px，stroke 4
    const SIZE = SMALL_SIZE;
    const STROKE = 4;
    const RADIUS = (SIZE - STROKE) / 2;
    const CIRC = 2 * Math.PI * RADIUS;
    const dashOffset = CIRC * (1 - progress / 100);
    const remainingMinutes = Math.max(0, Math.ceil(remainingMs / 60_000));

    return (
      <div
        ref={widgetRef}
        role="button"
        tabIndex={0}
        aria-label={`番茄钟 剩余 ${remainingMinutes} 分钟，点击展开`}
        aria-live="polite"
        onClick={handleWidgetClick}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            handleWidgetClick();
          }
        }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        className="fixed z-[80] touch-none cursor-pointer select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40 rounded-full"
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
          width: `${SIZE}px`,
          height: `${SIZE}px`,
        }}
        title="点击展开 / 拖动移动位置"
      >
        <svg
          width={SIZE}
          height={SIZE}
          viewBox={`0 0 ${SIZE} ${SIZE}`}
          className="-rotate-90"
          aria-hidden="true"
        >
          <circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={RADIUS}
            fill="none"
            className="stroke-gray-200 dark:stroke-gray-700"
            strokeWidth={STROKE}
          />
          <circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={RADIUS}
            fill="none"
            className={
              isOvertime
                ? "stroke-danger"
                : isPaused
                  ? "stroke-gray-400 dark:stroke-gray-500"
                  : "stroke-brand-500"
            }
            strokeWidth={STROKE}
            strokeLinecap="round"
            strokeDasharray={CIRC}
            strokeDashoffset={dashOffset}
          />
        </svg>
        {/* 中间分钟数 */}
        <div
          className={`absolute inset-0 flex items-center justify-center font-mono font-bold tabular-nums text-sm ${
            isOvertime
              ? "text-danger"
              : isPaused
                ? "text-gray-400 dark:text-gray-500"
                : "text-gray-900 dark:text-gray-100"
          }`}
        >
          {remainingMinutes}
        </div>
        {/* 暂停标记：左上角小点 */}
        {isPaused && (
          <div
            aria-hidden
            className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-gray-400 dark:bg-gray-500"
          />
        )}
      </div>
    );
  }

  // ============ medium 模式：卡片式 ============
  // 适配 medium 宽度的进度环：直径 32px
  const M_RING_SIZE = 32;
  const M_STROKE = 3;
  const M_RADIUS = (M_RING_SIZE - M_STROKE) / 2;
  const M_CIRC = 2 * Math.PI * M_RADIUS;
  const mDashOffset = M_CIRC * (1 - progress / 100);

  return (
    <>
      <div
        ref={widgetRef}
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
          className="flex items-center justify-center h-5 cursor-move text-gray-300 dark:text-gray-600 hover:text-gray-500 dark:hover:text-gray-400 border-b border-gray-100 dark:border-gray-700 touch-none"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
        >
          <Icon name="grip" className="w-3 h-3" />
        </div>

        {/* 主体：点击折叠回 small，控制按钮不冒泡 */}
        <div
          role="button"
          tabIndex={0}
          onClick={handleWidgetClick}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              handleWidgetClick();
            }
          }}
          aria-label="点击折叠为小弹窗"
          className="w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors text-left cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40"
        >
          {/* 进度环 */}
          <svg
            width={M_RING_SIZE}
            height={M_RING_SIZE}
            viewBox={`0 0 ${M_RING_SIZE} ${M_RING_SIZE}`}
            className="shrink-0"
            aria-hidden="true"
          >
            <circle
              cx={M_RING_SIZE / 2}
              cy={M_RING_SIZE / 2}
              r={M_RADIUS}
              fill="none"
              className="stroke-gray-200 dark:stroke-gray-700"
              strokeWidth={M_STROKE}
            />
            <circle
              cx={M_RING_SIZE / 2}
              cy={M_RING_SIZE / 2}
              r={M_RADIUS}
              fill="none"
              className={
                isOvertime
                  ? "stroke-danger"
                  : isPaused
                    ? "stroke-gray-400 dark:stroke-gray-500"
                    : "stroke-brand-500"
              }
              strokeWidth={M_STROKE}
              strokeLinecap="round"
              strokeDasharray={M_CIRC}
              strokeDashoffset={mDashOffset}
              transform={`rotate(-90 ${M_RING_SIZE / 2} ${M_RING_SIZE / 2})`}
            />
          </svg>

          {/* 倒计时 + 任务名 */}
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

          {/* 展开指示符 */}
          <Icon
            name="chevron-down"
            className="w-3 h-3 text-gray-400 dark:text-gray-500 shrink-0"
            aria-hidden
          />
        </div>

        {/* 控制按钮区：每个按钮 stopPropagation，避免点击触发折叠 */}
        <div className="px-3 pb-3 pt-1 space-y-2 border-t border-gray-100 dark:border-gray-700">
          <div className="flex gap-1.5">
            <Button
              variant="secondary"
              size="sm"
              onClick={(e) => void handlePauseResume(e)}
              disabled={busy}
              className="flex-1"
            >
              {isPaused ? "恢复" : "暂停"}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => void handleAbandon(e)}
              disabled={busy}
              className="flex-1"
            >
              放弃
            </Button>
            <Button
              variant="ghost"
              size="sm"
              iconOnly
              onClick={handleExpandToLarge}
              aria-label="展开为大弹窗"
              title="展开为大弹窗"
              disabled={busy}
            >
              <Icon name="maximize" className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      </div>

      {/* large 模式：Modal 渲染 PomodoroFullContent */}
      {/* 关键：onClose 由 Modal 内部 ESC / 遮罩点击 / 关闭按钮触发，与 pauseSession 无关， */}
      {/* 因此暂停状态下弹窗不会自动关闭 */}
      <Modal
        open={mode === "large"}
        onClose={handleLargeClose}
        title="番茄专注"
        size="lg"
      >
        <PomodoroFullContent />
      </Modal>
    </>
  );
}
