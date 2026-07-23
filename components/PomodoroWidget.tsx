"use client";

// components/PomodoroWidget.tsx
// 番茄钟两态 widget：ring（圆环小浮窗）↔ card（卡片浮窗）
//
// 2026-07-23 UI 重设计（设计点 1）：
//   - 移除 large Modal（全屏遮罩打断用户流，与"专注工具应该克制"冲突）
//   - 改为 ring / card / hidden 三态自适应浮窗
//   - ring 态：56px 圆环（running/paused/break-running 时显示，专注中无打扰）
//   - card 态：280px 卡片浮窗（idle/completed 时显示，承载表单 + 休息建议）
//   - hidden 态：无 session 且用户未主动打开
//
// 状态机（卡帕西视角：单一事实源，状态机统一在 widget）：
//   - focus running/paused → ring
//   - break running/paused → ring（绿色环区分）
//   - focus 完成（倒计时归零）→ card（completed 视图，显示休息建议，不自动开始 break）
//   - break 完成 → card（idle 视图，让用户主动开始下一个 focus）
//   - POMODORO_OPEN_EVENT → card（即使无 session 也显示 idle）
//   - 用户点击 ring → card（查看详情/操作）
//   - card 关闭按钮 → ring（若有 session）或 hidden（若无 session）
//
// 拖动优化（卡帕西视角，修卡顿 + 防事件透传）：
//   - Pointer Events API 替代 mouse + touch 双套监听
//   - setPointerCapture(e.pointerId)：所有后续指针事件都路由到 handle 元素
//   - 拖动时直接操作 ref.style.left/top（不 setState），拖动结束才同步 state
//
// 边界 + 吸附：
//   - clampPosition：上下左右不能跑到屏幕外，底部预留 56px 给底部 Nav
//   - ring 拖动结束时，自动吸附到最近边（左/右/上/下）
//   - card 拖动结束时，也吸附到最近边（但 card 尺寸更大）

import { useState, useEffect, useCallback, useRef } from "react";
import type { PomodoroSession } from "@/lib/types";
import {
  getActiveSession,
  completeSession,
  pauseSession,
  resumeSession,
  abandonSession,
  POMODORO_SESSION_CHANGED_EVENT,
  POMODORO_OPEN_EVENT,
} from "@/lib/timer/pomodoro";
import { notify } from "@/lib/timer/notification-permission";
import { confirmDialog } from "@/lib/confirm-dialog";
import { Button } from "@/components/ui";
import { Icon } from "@/components/Icon";
import { PomodoroFullContent } from "@/components/PomodoroFullContent";

/**
 * Widget 三态：
 * - "hidden"：无 session 且用户未主动打开（不渲染任何浮窗）
 * - "ring"：圆环小浮窗（running session 时显示）
 * - "card"：卡片浮窗（idle/completed 时显示，承载表单）
 */
type WidgetMode = "hidden" | "ring" | "card";

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
 * 2026-07-23 UI 重设计：Nav 高度从 48px 降到 44px，预留从 96 调整为 56（44 + 12 安全边距）
 */
const BOTTOM_NAV_RESERVE = 56;

/**
 * 把 widget 位置约束在 viewport 内，避免拖到屏幕外找不回来。
 * 底部预留 BOTTOM_NAV_RESERVE 给底部 Nav。
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
 * 计算浮窗拖动结束时的吸附位置：吸附到最近的边（左/右/上/下）。
 * 上下边距为 8px，左右边距为 8px；底部需预留 Nav。
 */
function snapToNearestEdge(
  pos: WidgetPosition,
  vw: number,
  vh: number,
  widgetW: number,
  widgetH: number,
): WidgetPosition {
  const margin = 8;
  const distLeft = pos.x;
  const distRight = vw - pos.x - widgetW;
  const distTop = pos.y;
  const distBottom = vh - pos.y - widgetH - BOTTOM_NAV_RESERVE;
  const minDist = Math.min(distLeft, distRight, distTop, distBottom);
  if (minDist === distLeft) {
    return { x: margin, y: pos.y };
  }
  if (minDist === distRight) {
    return { x: vw - widgetW - margin, y: pos.y };
  }
  if (minDist === distTop) {
    return { x: pos.x, y: margin };
  }
  // 吸附到 Nav 上方
  return { x: pos.x, y: vh - widgetH - BOTTOM_NAV_RESERVE - margin };
}

/** ring 模式尺寸：直径 56px */
const RING_SIZE = 56;
/** card 模式尺寸：宽 280px，最大高度 420px（idle 表单 + 今日统计） */
const CARD_WIDTH = 280;
const CARD_MAX_HEIGHT = 420;

export function PomodoroWidget() {
  const [session, setSession] = useState<PomodoroSession | null>(null);
  const [remainingMs, setRemainingMs] = useState<number>(0);
  const [progress, setProgress] = useState<number>(0);
  const [busy, setBusy] = useState(false);
  // 三态模式：hidden（默认）/ ring / card
  const [mode, setMode] = useState<WidgetMode>("hidden");
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
  // 正在完成的 session id：防止 refresh 重入
  const completingRef = useRef<string | null>(null);

  // 单一事实源（卡帕西视角）：
  // 把"倒计时归零 → 完成 → 切 card 浮窗"状态机收归到 widget，
  // ring / card 两种形态共享同一套生命周期。
  //
  // 2026-07-23 UI 重设计后的状态机：
  //   - focus 完成（归零）→ notify + completeSession + setMode("card")
  //     （不自动创建 break，让用户在 card 的 completed 视图主动选择"开始休息"或"再来一个"）
  //   - break 完成（归零）→ notify + completeSession + setMode("card")
  //     （让用户在 card 的 idle 视图主动开始下一个 focus）
  //   - ring 态：focus/break running/paused 时显示
  //   - card 态：idle/completed 时显示
  const refresh = useCallback(async () => {
    const active = await getActiveSession();

    // ===== 1. 完成状态机：检测归零需自动完成 =====
    if (
      active &&
      active.status === "running" &&
      computeRemainingMs(active) <= 0 &&
      completingRef.current !== active.id
    ) {
      completingRef.current = active.id;
      try {
        // 1.1 通知用户
        if (notifiedRef.current !== active.id) {
          notifiedRef.current = active.id;
          if (active.type === "focus") {
            await notify(
              "番茄完成",
              `「${active.taskDescription || "专注"}」专注完成，去休息一下吧`,
            );
          } else {
            await notify(
              "休息结束",
              "休息结束，准备开始下一段专注",
            );
          }
        }
        // 1.2 完成 session（写 LearnLog、清 current flag、派发 change 事件）
        await completeSession(active.id);

        // 1.3 切到 card 态让用户看 completed 视图（focus）或 idle 视图（break）
        // 不再自动创建 break session：用户在 card 的 completed 视图主动点"开始休息"
        // PomodoroFullContent 重新挂载后会检测"10s 内完成的 focus session"→ completed 视图
        setMode("card");
      } catch (e) {
        console.error("[pomodoro-widget] auto-complete failed:", e);
      } finally {
        completingRef.current = null;
      }
    }

    // ===== 2. 重新拉取 active（completeSession 后状态可能已变） =====
    const latest = await getActiveSession();
    setSession(latest);
    if (latest) {
      setRemainingMs(computeRemainingMs(latest));
      setProgress(computeProgress(latest));
      // 有 running session 时自动切到 ring（除非用户正在 card 里操作）
      // 但如果当前是 card 态且 session 是 running，说明用户刚点了"开始专注"
      // → 此时应该切到 ring（PomodoroFullContent 的 onStart 回调已处理）
      // 这里不强制切换，避免覆盖用户主动打开 card 的意图
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

  // 首次挂载：恢复位置 + 根据 session 状态决定初始 mode
  useEffect(() => {
    const savedPos = loadPosition();
    if (savedPos) {
      setPosition(savedPos);
    } else {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      // 默认右下角，避开底部 Nav
      setPosition({
        x: Math.max(0, vw - RING_SIZE - 16),
        y: Math.max(0, vh - RING_SIZE - 96),
      });
    }
    // 检查是否有 running session → 初始 mode 为 ring
    void getActiveSession().then((active) => {
      if (active && active.status !== "completed") {
        setMode("ring");
      }
      // 无 session 时保持 hidden（等用户主动派发 POMODORO_OPEN_EVENT）
    });
  }, []);

  // 监听全局事件：HomeClient / TrainClient / CurrentTaskCard 派发 POMODORO_OPEN_EVENT
  // → 唤醒 card 浮窗。即使无 running session 也能打开（PomodoroFullContent 内有 idle 表单）
  useEffect(() => {
    const openCard = () => setMode("card");
    window.addEventListener(POMODORO_OPEN_EVENT, openCard);
    return () => window.removeEventListener(POMODORO_OPEN_EVENT, openCard);
  }, []);

  // ring 模式下，从 card 切回时重新吸附（带 200ms transition）
  useEffect(() => {
    if (mode !== "ring") return;
    if (!widgetRef.current || !position) return;
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const snapped = snapToNearestEdge(position, vw, vh, RING_SIZE, RING_SIZE);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  /**
   * Pointer Events 拖动（ring 态）：setPointerCapture 后所有后续 pointer 事件都路由到 handle 元素。
   * 拖动距离 < 5px 视为点击（触发 card 浮窗）。
   */
  const handleRingPointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!position) return;
      if (e.button !== 0 && e.pointerType === "mouse") return;
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

  const handleRingPointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      const drag = dragStateRef.current;
      if (!drag || drag.pointerId !== e.pointerId) return;
      const dx = e.clientX - drag.startClientX;
      const dy = e.clientY - drag.startClientY;
      if (Math.abs(dx) > 5 || Math.abs(dy) > 5) {
        dragMovedRef.current = true;
      }
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const next = clampPosition(
        { x: drag.startWidgetX + dx, y: drag.startWidgetY + dy },
        vw,
        vh,
        RING_SIZE,
        RING_SIZE,
      );
      if (widgetRef.current) {
        widgetRef.current.style.left = `${next.x}px`;
        widgetRef.current.style.top = `${next.y}px`;
      }
    },
    [],
  );

  const handleRingPointerUp = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      const drag = dragStateRef.current;
      if (!drag || drag.pointerId !== e.pointerId) return;
      try {
        e.currentTarget.releasePointerCapture(drag.pointerId);
      } catch {
        /* ignore */
      }
      dragStateRef.current = null;

      // 拖动距离 < 5px → 视为点击 → 打开 card 浮窗
      if (!dragMovedRef.current) {
        setMode("card");
        return;
      }

      const left = widgetRef.current?.style.left;
      const top = widgetRef.current?.style.top;
      if (left && top) {
        const x = parseFloat(left);
        const y = parseFloat(top);
        if (Number.isFinite(x) && Number.isFinite(y)) {
          const vw = window.innerWidth;
          const vh = window.innerHeight;
          if (widgetRef.current) {
            const snapped = snapToNearestEdge(
              { x, y },
              vw,
              vh,
              RING_SIZE,
              RING_SIZE,
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

  /**
   * Pointer Events 拖动（card 态）：与 ring 类似，但尺寸不同。
   * 拖动距离 < 5px 视为点击（不触发任何操作，card 内部有自己的交互）。
   */
  const handleCardPointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      // 仅在 header 区域启动拖动（避免拖动冲突内部按钮/输入）
      const target = e.target as HTMLElement;
      if (!target.closest("[data-card-header]")) return;
      if (!position) return;
      if (e.button !== 0 && e.pointerType === "mouse") return;
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

  const handleCardPointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      const drag = dragStateRef.current;
      if (!drag || drag.pointerId !== e.pointerId) return;
      const dx = e.clientX - drag.startClientX;
      const dy = e.clientY - drag.startClientY;
      if (Math.abs(dx) > 5 || Math.abs(dy) > 5) {
        dragMovedRef.current = true;
      }
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      // card 高度用当前实际高度（从 DOM 读取）
      const cardH = widgetRef.current?.offsetHeight ?? CARD_MAX_HEIGHT;
      const next = clampPosition(
        { x: drag.startWidgetX + dx, y: drag.startWidgetY + dy },
        vw,
        vh,
        CARD_WIDTH,
        cardH,
      );
      if (widgetRef.current) {
        widgetRef.current.style.left = `${next.x}px`;
        widgetRef.current.style.top = `${next.y}px`;
      }
    },
    [],
  );

  const handleCardPointerUp = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      const drag = dragStateRef.current;
      if (!drag || drag.pointerId !== e.pointerId) return;
      try {
        e.currentTarget.releasePointerCapture(drag.pointerId);
      } catch {
        /* ignore */
      }
      dragStateRef.current = null;
      if (!dragMovedRef.current) return; // 点击不处理

      const left = widgetRef.current?.style.left;
      const top = widgetRef.current?.style.top;
      if (left && top) {
        const x = parseFloat(left);
        const y = parseFloat(top);
        if (Number.isFinite(x) && Number.isFinite(y)) {
          const vw = window.innerWidth;
          const vh = window.innerHeight;
          if (widgetRef.current) {
            const cardH = widgetRef.current.offsetHeight;
            const snapped = snapToNearestEdge(
              { x, y },
              vw,
              vh,
              CARD_WIDTH,
              cardH,
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

  // card 关闭：若有 running session → 切 ring；否则 → hidden
  const handleCardClose = useCallback(() => {
    if (session && session.status !== "completed") {
      setMode("ring");
    } else {
      setMode("hidden");
    }
  }, [session]);

  // PomodoroFullContent 回调：用户点"开始专注"/"开始休息"后切回 ring
  const handleStart = useCallback(() => {
    setMode("ring");
  }, []);
  const handleStartBreak = useCallback(() => {
    setMode("ring");
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
      // 放弃后无 session → 切 hidden
      setMode("hidden");
    } finally {
      setBusy(false);
    }
  }

  // ===== 渲染 =====
  // hidden 态：不渲染
  if (mode === "hidden" || !position) return null;

  // card 态：渲染卡片浮窗 + PomodoroFullContent
  if (mode === "card") {
    return (
      <CardWidget
        widgetRef={widgetRef}
        position={position}
        onClose={handleCardClose}
        onPointerDown={handleCardPointerDown}
        onPointerMove={handleCardPointerMove}
        onPointerUp={handleCardPointerUp}
        onPointerCancel={handleCardPointerUp}
      >
        <PomodoroFullContent
          onStart={handleStart}
          onStartBreak={handleStartBreak}
        />
      </CardWidget>
    );
  }

  // ring 态：必须有 running session 才显示
  // 边界情况：用户在 ring 态时 session 被外部清除（如 AI 工具放弃）→ 回退到 hidden
  if (!session) {
    // session 暂时为 null 但 mode=ring，可能是 refresh 间隙 → 渲染 null 避免闪烁
    return null;
  }

  return (
    <RingWidget
      widgetRef={widgetRef}
      position={position}
      session={session}
      remainingMs={remainingMs}
      progress={progress}
      busy={busy}
      onPointerDown={handleRingPointerDown}
      onPointerMove={handleRingPointerMove}
      onPointerUp={handleRingPointerUp}
      onPointerCancel={handleRingPointerUp}
      onPauseResume={handlePauseResume}
      onAbandon={handleAbandon}
    />
  );
}

// ============ RingWidget：圆环小浮窗 ============

interface RingWidgetProps {
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

function RingWidget({
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
}: RingWidgetProps) {
  const isPaused = session.status === "paused";
  const isOvertime = remainingMs <= 0 && session.status === "running";
  const isBreak =
    session.type === "short_break" || session.type === "long_break";
  const isLongBreak = session.type === "long_break";

  const SIZE = RING_SIZE;
  const STROKE = 4;
  const RADIUS = (SIZE - STROKE) / 2;
  const CIRC = 2 * Math.PI * RADIUS;
  const dashOffset = CIRC * (1 - progress / 100);
  const remainingMinutes = Math.max(0, Math.ceil(remainingMs / 60_000));

  const [menuOpen, setMenuOpen] = useState(false);

  const stateLabel = isOvertime
    ? "已超时"
    : isPaused
      ? "已暂停"
      : isLongBreak
        ? "长休息中"
        : isBreak
          ? "短休息中"
          : "专注中";
  const ariaLabel = `番茄钟 · ${stateLabel} · 剩余 ${remainingMinutes} 分钟，点击展开`;

  return (
    <>
      <div
        ref={widgetRef}
        role="button"
        tabIndex={0}
        aria-label={ariaLabel}
        aria-live="polite"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerCancel}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setMenuOpen((v) => !v);
          }
        }}
        onContextMenu={(e) => {
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
                  : isBreak
                    ? "stroke-green-500"
                    : "stroke-brand-500"
            }
            strokeWidth={STROKE}
            strokeLinecap="round"
            strokeDasharray={CIRC}
            strokeDashoffset={dashOffset}
          />
        </svg>
        <div
          className={`absolute inset-0 flex items-center justify-center font-mono font-bold tabular-nums text-sm ${
            isOvertime
              ? "text-danger"
              : isPaused
                ? "text-gray-400 dark:text-gray-500"
                : isBreak
                  ? "text-green-600 dark:text-green-400"
                  : "text-gray-900 dark:text-gray-100"
          }`}
        >
          {remainingMinutes}
        </div>
        {isPaused && (
          <div
            aria-hidden
            className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-gray-400 dark:bg-gray-500"
          />
        )}
        {isBreak && !isPaused && (
          <div
            aria-hidden
            className="absolute top-1 left-1 w-1.5 h-1.5 rounded-full bg-green-500"
          />
        )}
      </div>

      {/* 控制菜单：长按或右键唤起，pause/resume/abandon */}
      {menuOpen && (
        <>
          <div
            className="fixed inset-0 z-[90]"
            onClick={() => setMenuOpen(false)}
            aria-hidden
          />
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

// ============ CardWidget：卡片浮窗（替代原 large Modal）============

interface CardWidgetProps {
  widgetRef: React.RefObject<HTMLDivElement | null>;
  position: WidgetPosition;
  onClose: () => void;
  onPointerDown: (e: React.PointerEvent<HTMLDivElement>) => void;
  onPointerMove: (e: React.PointerEvent<HTMLDivElement>) => void;
  onPointerUp: (e: React.PointerEvent<HTMLDivElement>) => void;
  onPointerCancel: (e: React.PointerEvent<HTMLDivElement>) => void;
  children: React.ReactNode;
}

function CardWidget({
  widgetRef,
  position,
  onClose,
  onPointerDown,
  onPointerMove,
  onPointerUp,
  onPointerCancel,
  children,
}: CardWidgetProps) {
  return (
    <div
      ref={widgetRef}
      role="dialog"
      aria-modal="false"
      aria-label="番茄专注"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerCancel}
      className="fixed z-[80] touch-none select-none bg-white dark:bg-gray-800 rounded-card shadow-floating border border-gray-200 dark:border-gray-700 flex flex-col animate-slide-up"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        width: `${CARD_WIDTH}px`,
        maxHeight: `${CARD_MAX_HEIGHT}px`,
      }}
    >
      {/* Header（可拖动区域）：标题 + 关闭按钮 */}
      <div
        data-card-header
        className="flex items-center justify-between gap-2 px-4 py-3 border-b border-gray-200 dark:border-gray-700 cursor-grab active:cursor-grabbing shrink-0"
      >
        <div className="flex items-center gap-2 min-w-0">
          <Icon name="tomato" className="w-4 h-4 text-red-500 shrink-0" />
          <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
            番茄专注
          </h2>
        </div>
        <Button
          iconOnly
          size="sm"
          variant="ghost"
          aria-label="关闭"
          onClick={onClose}
          className="-mr-1 -mt-0.5 shrink-0"
        >
          <Icon name="x" className="w-4 h-4" />
        </Button>
      </div>
      {/* 内容区：可滚动，不响应拖动（避免与内部交互冲突） */}
      <div
        className="flex-1 min-h-0 overflow-y-auto p-4 text-sm text-gray-700 dark:text-gray-300 touch-auto"
        style={{ touchAction: "auto" }}
      >
        {children}
      </div>
    </div>
  );
}
