"use client";

// components/PomodoroWidget.tsx
// 番茄钟两态 widget：small ↔ large
//
// 两态设计（乔布斯视角：克制即设计，移除冗余的 medium 半步）：
//   - small：圆形进度条（直径 56px）+ 中间显示剩余分钟数 + 可拖动
//     点击 → 展开 large Modal（不丢失当前 session 状态）
//   - large：Modal 形式渲染 PomodoroFullContent（idle/running/completed 三态视图）
//     失焦 / ESC / 关闭按钮 → 回到 small
//
// 拖动优化（卡帕西视角，修卡顿 + 防事件透传）：
//   - Pointer Events API 替代 mouse + touch 双套监听
//   - setPointerCapture(e.pointerId)：所有后续指针事件都路由到 handle 元素，
//     **不会透传到页面**（修拖动快时鼠标飞出 widget 触发底层 hover/click 的问题）
//   - 拖动时直接操作 ref.style.left/top（不 setState），拖动结束才同步 state
//     → 60fps 平滑拖动，无重渲染开销
//
// 边界 + 吸附：
//   - clampPosition：上下左右不能跑到屏幕外，底部预留 96px 给底部 Nav
//   - 小弹框拖动结束时，自动吸附到最近边（左/右/上/下）：
//     计算到 4 个边的距离，取最近的吸附，带 200ms transition 平滑过渡
//
// 暂停不关闭弹窗（关键约束）：
//   - small：暂停只切 session.status=paused，widget 仍渲染
//   - large：Modal onClose 由用户主动触发（关闭按钮/ESC），pauseSession 不调用 onClose
//
// 入口改造：
//   - HomeClient 入口派发 POMODORO_OPEN_LARGE_EVENT 全局事件
//   - widget useEffect 监听该事件 → setMode("large") 唤醒大弹窗
//   - 即使无 running session 也能打开 large modal（PomodoroFullContent 内有 start form）

import { useState, useEffect, useCallback, useRef } from "react";
import type { PomodoroSession } from "@/lib/types";
import {
  getActiveSession,
  pauseSession,
  resumeSession,
  abandonSession,
  POMODORO_SESSION_CHANGED_EVENT,
  POMODORO_OPEN_LARGE_EVENT,
} from "@/lib/timer/pomodoro";
import { notify } from "@/lib/timer/notification-permission";
import { confirmDialog } from "@/lib/confirm-dialog";
import { Button } from "@/components/ui";
import { Modal } from "@/components/ui";
import { Icon } from "@/components/Icon";
import { PomodoroFullContent } from "@/components/PomodoroFullContent";

/** Widget 两态：small（圆环）/ large（Modal） */
type WidgetMode = "small" | "large";

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

/**
 * 底部 Nav 高度预留（避开底部导航栏，widget 不被遮挡）
 */
const BOTTOM_NAV_RESERVE = 96;

/**
 * 把 widget 位置约束在 viewport 内，避免拖到屏幕外找不回来。
 * 底部预留 BOTTOM_NAV_RESERVE（96px）给底部 Nav。
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
    y: Math.min(
      Math.max(0, pos.y),
      Math.max(0, vh - widgetH - BOTTOM_NAV_RESERVE),
    ),
  };
}

/**
 * 计算小弹框拖动结束时的吸附位置：吸附到最近的边（左/右/上/下）。
 * 上下边距为 8px，左右边距为 8px；底部需预留 Nav。
 * 返回吸附后的坐标。
 */
function snapToNearestEdge(
  pos: WidgetPosition,
  vw: number,
  vh: number,
  widgetSize: number,
): WidgetPosition {
  const margin = 8;
  // 到 4 个边的距离
  const distLeft = pos.x;
  const distRight = vw - pos.x - widgetSize;
  const distTop = pos.y;
  const distBottom = vh - pos.y - widgetSize - BOTTOM_NAV_RESERVE;
  const minDist = Math.min(distLeft, distRight, distTop, distBottom);
  if (minDist === distLeft) {
    return { x: margin, y: pos.y };
  }
  if (minDist === distRight) {
    return { x: vw - widgetSize - margin, y: pos.y };
  }
  if (minDist === distTop) {
    return { x: pos.x, y: margin };
  }
  // 吸附到 Nav 上方
  return { x: pos.x, y: vh - widgetSize - BOTTOM_NAV_RESERVE - margin };
}

/** small 模式尺寸：直径 56px */
const SMALL_SIZE = 56;

export function PomodoroWidget() {
  const [session, setSession] = useState<PomodoroSession | null>(null);
  const [remainingMs, setRemainingMs] = useState<number>(0);
  const [progress, setProgress] = useState<number>(0);
  const [busy, setBusy] = useState(false);
  // 两态模式：small（默认）/ large
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
  // 拖动 vs 点击判定：移动距离 < 5px 视为点击
  const dragMovedRef = useRef(false);
  // 上一次 refresh 时的 session 快照：用于检测 focus session 从 running → completed 的转变
  // 检测到完成时自动展开 large modal 显示 completed 视图（需求2：番茄结束后提醒进入休息）
  const prevSessionRef = useRef<PomodoroSession | null>(null);

  const refresh = useCallback(async () => {
    // 用 getActiveSession（running 或 paused 都算活跃）：
    // 修 bug：用户点暂停后 session.status=paused，原 getRunningSession 返回 null
    // → setSession(null) → widget 守卫隐藏整个 widget，看起来像"点暂停关闭了弹窗"
    const active = await getActiveSession();
    const prev = prevSessionRef.current;

    // 检测 focus session 刚刚完成（prev 是 running focus session，当前已无 active 或换了新 session）
    // → 自动展开 large modal 显示 completed 视图（休息建议）
    // 仅在 small 模式下触发（large 模式下 PomodoroFullContent 内部已 setView("completed")）
    if (
      prev &&
      prev.type === "focus" &&
      prev.status === "running" &&
      (!active || active.id !== prev.id) &&
      mode === "small"
    ) {
      setMode("large");
    }
    prevSessionRef.current = active;

    setSession(active);
    if (active) {
      const remaining = computeRemainingMs(active);
      setRemainingMs(remaining);
      setProgress(computeProgress(active));
      if (remaining <= 0 && notifiedRef.current !== active.id) {
        notifiedRef.current = active.id;
        void notify(
          "番茄完成",
          `「${active.taskDescription}」专注完成，去休息一下吧`,
        );
      }
    } else {
      notifiedRef.current = null;
    }
  }, [mode]);

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

  // 首次挂载：恢复位置（默认 small 模式，不持久化模式偏好——只有 small 一种常态）
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
  }, []);

  // 监听全局事件：HomeClient 的「番茄钟」入口派发 POMODORO_OPEN_LARGE_EVENT
  // → 唤醒 large Modal。即使无 running session 也能打开（PomodoroFullContent 内有 start form）
  useEffect(() => {
    const openLarge = () => setMode("large");
    window.addEventListener(POMODORO_OPEN_LARGE_EVENT, openLarge);
    return () => window.removeEventListener(POMODORO_OPEN_LARGE_EVENT, openLarge);
  }, []);

  // 模式切换时重新吸附（small 模式下，从 large 关闭回来时重新吸附到最近边）：
  // 用 requestAnimationFrame 延后一帧再设置 transition，让浏览器先绘制 small
  // 在旧 position 的初始位置，然后再启动过渡到吸附位置。
  useEffect(() => {
    if (mode !== "small") return;
    if (!widgetRef.current || !position) return;
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const snapped = snapToNearestEdge(position, vw, vh, SMALL_SIZE);
    // 仅当位置变化时才更新（避免不必要的 transition）
    if (snapped.x === position.x && snapped.y === position.y) return;

    const rafId = requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (!widgetRef.current) return;
        widgetRef.current.style.transition =
          "left 200ms ease-out, top 200ms ease-out";
        widgetRef.current.style.left = `${snapped.x}px`;
        widgetRef.current.style.top = `${snapped.y}px`;
      });
    });
    setPosition(snapped);
    savePosition(snapped);
    const t = window.setTimeout(() => {
      if (widgetRef.current) widgetRef.current.style.transition = "";
    }, 320);
    return () => {
      cancelAnimationFrame(rafId);
      window.clearTimeout(t);
    };
    // 故意不依赖 position：仅 mode 变化时才需要重新吸附
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  /**
   * Pointer Events 拖动：setPointerCapture 后所有后续 pointer 事件都路由到 handle 元素，
   * 即使鼠标飞出 widget 也不会触发底层元素的 click/hover（修事件透传）。
   * 拖动时直接操作 ref.style.left/top，不 setState → 60fps 平滑无重渲染。
   * 拖动距离 < 5px 视为点击（触发 large Modal）。
   */
  const handlePointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!position) return;
      // 仅响应主键（左键 / 触屏）
      if (e.button !== 0 && e.pointerType === "mouse") return;
      // 捕获指针：后续所有 pointer 事件都路由到当前元素，不会透传
      e.currentTarget.setPointerCapture(e.pointerId);
      dragMovedRef.current = false;
      dragStateRef.current = {
        pointerId: e.pointerId,
        startClientX: e.clientX,
        startClientY: e.clientY,
        startWidgetX: position.x,
        startWidgetY: position.y,
      };
    },
    [position],
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      const drag = dragStateRef.current;
      if (!drag || drag.pointerId !== e.pointerId) return;
      const dx = e.clientX - drag.startClientX;
      const dy = e.clientY - drag.startClientY;
      // 标记是否发生过移动（> 5px 视为拖动，否则视为点击）
      if (Math.abs(dx) > 5 || Math.abs(dy) > 5) {
        dragMovedRef.current = true;
      }
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const next = clampPosition(
        { x: drag.startWidgetX + dx, y: drag.startWidgetY + dy },
        vw,
        vh,
        SMALL_SIZE,
        SMALL_SIZE,
      );
      // 直接操作 DOM（不 setState，避免重渲染抖动）
      if (widgetRef.current) {
        widgetRef.current.style.left = `${next.x}px`;
        widgetRef.current.style.top = `${next.y}px`;
      }
    },
    [],
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

      // 若拖动距离 < 5px，视为点击 → 打开 large Modal
      if (!dragMovedRef.current) {
        setMode("large");
        return;
      }

      // 读取拖动结束时的当前位置
      const left = widgetRef.current?.style.left;
      const top = widgetRef.current?.style.top;
      if (left && top) {
        const x = parseFloat(left);
        const y = parseFloat(top);
        if (Number.isFinite(x) && Number.isFinite(y)) {
          const vw = window.innerWidth;
          const vh = window.innerHeight;
          // small 模式：吸附到最近边（带 200ms transition 平滑过渡）
          if (widgetRef.current) {
            const snapped = snapToNearestEdge(
              { x, y },
              vw,
              vh,
              SMALL_SIZE,
            );
            widgetRef.current.style.transition =
              "left 200ms ease-out, top 200ms ease-out";
            widgetRef.current.style.left = `${snapped.x}px`;
            widgetRef.current.style.top = `${snapped.y}px`;
            setPosition(snapped);
            savePosition(snapped);
            window.setTimeout(() => {
              if (widgetRef.current) {
                widgetRef.current.style.transition = "";
              }
            }, 220);
          }
        }
      }
    },
    [],
  );

  // large modal 关闭：回到 small
  const handleLargeClose = useCallback(() => {
    setMode("small");
  }, []);

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

  // large 模式：只渲染 Modal，不渲染 small widget（需求4：打开大番茄时钟时隐藏小番茄时钟）
  // 关闭 Modal 后会自然回到 small 模式渲染，无需提前渲染 small widget
  // position 未就绪时不显示（避免首帧闪烁在错误位置）
  // 需求2：onComplete 不再关闭 modal —— 番茄完成是"胜利时刻"，应保持 modal 打开
  // 显示 completed 视图（休息建议 + 再来一个番茄）。用户主动关闭或开始休息后才回到 small。
  if (mode === "large") {
    return (
      <Modal
        open
        onClose={handleLargeClose}
        title="番茄专注"
        size="lg"
      >
        <PomodoroFullContent />
      </Modal>
    );
  }

  // small 模式：必须有 running session 才显示
  if (!session || !position) return null;

  return (
    <SmallWidget
      widgetRef={widgetRef}
      position={position}
      session={session}
      remainingMs={remainingMs}
      progress={progress}
      busy={busy}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onPauseResume={handlePauseResume}
      onAbandon={handleAbandon}
    />
  );
}

/** 小弹框组件：圆形进度条 + 中间显示剩余分钟数 + 长按弹出控制菜单 */
interface SmallWidgetProps {
  widgetRef: React.RefObject<HTMLDivElement | null>;
  position: WidgetPosition;
  session: PomodoroSession;
  remainingMs: number;
  progress: number;
  busy: boolean;
  onPointerDown: (e: React.PointerEvent<HTMLDivElement>) => void;
  onPointerMove: (e: React.PointerEvent<HTMLDivElement>) => void;
  onPointerUp: (e: React.PointerEvent<HTMLDivElement>) => void;
  onPointerCancel: (e: React.PointerEvent<HTMLDivElement>) => void;
  onPauseResume: (e?: React.MouseEvent) => void;
  onAbandon: (e?: React.MouseEvent) => void;
}

function SmallWidget({
  widgetRef,
  position,
  session,
  remainingMs,
  progress,
  busy,
  onPointerDown,
  onPointerMove,
  onPointerUp,
  onPointerCancel,
  onPauseResume,
  onAbandon,
}: SmallWidgetProps) {
  const isPaused = session.status === "paused";
  const isOvertime = remainingMs <= 0 && session.status === "running";

  // 圆环参数：直径 56px，stroke 4
  const SIZE = SMALL_SIZE;
  const STROKE = 4;
  const RADIUS = (SIZE - STROKE) / 2;
  const CIRC = 2 * Math.PI * RADIUS;
  const dashOffset = CIRC * (1 - progress / 100);
  const remainingMinutes = Math.max(0, Math.ceil(remainingMs / 60_000));

  // 控制菜单（长按或右键唤起）
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <div
        ref={widgetRef}
        role="button"
        tabIndex={0}
        aria-label={`番茄钟 剩余 ${remainingMinutes} 分钟，点击展开`}
        aria-live="polite"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerCancel}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            // 键盘点击：打开控制菜单（不拖动）
            setMenuOpen((v) => !v);
          }
        }}
        onContextMenu={(e) => {
          // 右键唤起菜单（桌面端补充）
          e.preventDefault();
          setMenuOpen(true);
        }}
        className="fixed z-[80] touch-none cursor-pointer select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40 rounded-full shadow-floating"
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
          width: `${SIZE}px`,
          height: `${SIZE}px`,
        }}
        title="点击打开 / 拖动移动 / 长按控制"
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
        {/* 暂停标记：右上角小点 */}
        {isPaused && (
          <div
            aria-hidden
            className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-gray-400 dark:bg-gray-500"
          />
        )}
      </div>

      {/* 控制菜单：长按或右键唤起，pause/resume/abandon */}
      {menuOpen && (
        <>
          {/* 全屏点击关闭 */}
          <div
            className="fixed inset-0 z-[90]"
            onClick={() => setMenuOpen(false)}
            aria-hidden
          />
          {/* 菜单本体：定位在 widget 上方 */}
          <div
            role="menu"
            aria-label="番茄钟控制"
            className="fixed z-[100] bg-white dark:bg-gray-800 rounded-card shadow-floating border border-gray-200 dark:border-gray-700 py-1 min-w-[140px]"
            style={{
              left: `${Math.max(8, Math.min(position.x - 42, window.innerWidth - 156))}px`,
              top: `${Math.max(8, position.y - 96)}px`,
            }}
          >
            <div className="px-3 py-1.5 text-2xs text-gray-400 dark:text-gray-500 border-b border-gray-100 dark:border-gray-700 font-mono">
              {formatCountdown(remainingMs)}
            </div>
            <Button
              variant="ghost"
              role="menuitem"
              disabled={busy}
              onClick={(e) => {
                onPauseResume(e);
                setMenuOpen(false);
              }}
              className="w-full justify-start px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 disabled:opacity-50"
            >
              <Icon name={isPaused ? "rotate" : "clock"} className="w-3.5 h-3.5" />
              {isPaused ? "恢复" : "暂停"}
            </Button>
            <Button
              variant="ghost"
              role="menuitem"
              disabled={busy}
              onClick={(e) => {
                onAbandon(e);
                setMenuOpen(false);
              }}
              className="w-full justify-start px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 disabled:opacity-50"
            >
              <Icon name="x" className="w-3.5 h-3.5" />
              放弃
            </Button>
          </div>
        </>
      )}
    </>
  );
}

// 注：原 medium 模式（224px 卡片）已移除，简化为 small + large 两态。
// 暂停/放弃等控制操作通过 small widget 长按/右键唤起的菜单完成。
