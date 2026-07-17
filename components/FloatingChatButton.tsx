"use client";

import { useEffect, useRef, useState } from "react";
import { Icon } from "@/components/Icon";

interface FloatingChatButtonProps {
  onOpen: () => void;
}

const STORAGE_KEY = "chat-fab-pos";
const BUTTON_SIZE = 56; // w-14 h-14 = 56px
const CLICK_THRESHOLD_PX = 5; // 移动距离 < 5px 视为点击

interface SavedPos {
  x: number;
  y: number;
}

function clampPos(x: number, y: number): SavedPos {
  if (typeof window === "undefined") return { x, y };
  const maxX = window.innerWidth - BUTTON_SIZE;
  const maxY = window.innerHeight - BUTTON_SIZE;
  return {
    x: Math.max(0, Math.min(x, Math.max(0, maxX))),
    y: Math.max(0, Math.min(y, Math.max(0, maxY))),
  };
}

function readSavedPos(): SavedPos | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as SavedPos;
    if (
      typeof parsed?.x !== "number" ||
      typeof parsed?.y !== "number" ||
      !isFinite(parsed.x) ||
      !isFinite(parsed.y)
    ) {
      return null;
    }
    return clampPos(parsed.x, parsed.y);
  } catch {
    return null;
  }
}

function writeSavedPos(pos: SavedPos): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(pos));
  } catch {
    // localStorage 不可用（隐私模式等）时静默失败
  }
}

export function FloatingChatButton({ onOpen }: FloatingChatButtonProps) {
  // pos 为 null 表示尚未拖拽过、使用默认 Tailwind 定位
  const [pos, setPos] = useState<SavedPos | null>(null);
  const [dragging, setDragging] = useState(false);

  // 拖拽过程中的临时状态用 ref 持有，避免每次 pointermove 触发重渲染抖动
  const dragStateRef = useRef<{
    pointerId: number;
    startX: number; // pointerdown 时 clientX
    startY: number; // pointerdown 时 clientY
    originX: number; // 拖拽起点按钮 left
    originY: number; // 拖拽起点按钮 top
    moved: number; // 累计移动距离（曼哈顿）
  } | null>(null);

  // 挂载时恢复上次保存的位置
  useEffect(() => {
    const saved = readSavedPos();
    if (saved) setPos(saved);
  }, []);

  const handlePointerDown = (e: React.PointerEvent<HTMLButtonElement>) => {
    // 仅主键 / 触摸触发拖拽
    if (e.button !== 0 && e.pointerType === "mouse") return;

    const currentLeft = pos?.x ?? e.currentTarget.offsetLeft;
    const currentTop = pos?.y ?? e.currentTarget.offsetTop;

    dragStateRef.current = {
      pointerId: e.pointerId,
      startX: e.clientX,
      startY: e.clientY,
      originX: currentLeft,
      originY: currentTop,
      moved: 0,
    };
    setDragging(true);

    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // 某些环境下 setPointerCapture 可能抛错，忽略
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLButtonElement>) => {
    const ds = dragStateRef.current;
    if (!ds || ds.pointerId !== e.pointerId) return;

    const dx = e.clientX - ds.startX;
    const dy = e.clientY - ds.startY;
    ds.moved += Math.abs(dx) + Math.abs(dy);

    const next = clampPos(ds.originX + dx, ds.originY + dy);
    setPos(next);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLButtonElement>) => {
    const ds = dragStateRef.current;
    if (!ds || ds.pointerId !== e.pointerId) return;

    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      // 忽略
    }

    const totalMoved = ds.moved;
    dragStateRef.current = null;
    setDragging(false);

    // 累计移动距离小于阈值 → 视为点击
    if (totalMoved < CLICK_THRESHOLD_PX) {
      onOpen();
      return;
    }

    // 视为拖拽：保存当前位置
    setPos((curr) => {
      if (curr) writeSavedPos(curr);
      return curr;
    });
  };

  // 拖拽中断（例如失去焦点）也要重置状态
  const handlePointerCancel = (e: React.PointerEvent<HTMLButtonElement>) => {
    const ds = dragStateRef.current;
    if (ds && ds.pointerId === e.pointerId) {
      dragStateRef.current = null;
      setDragging(false);
      // 取消时仍保存当前位置，避免位置丢失
      setPos((curr) => {
        if (curr) writeSavedPos(curr);
        return curr;
      });
    }
  };

  // 有显式位置 → 用 inline style（left/top）覆盖默认 Tailwind 定位
  // 无保存位置 → 不传 style，使用 className 中的默认 Tailwind 定位
  const positionStyle: React.CSSProperties | undefined =
    pos !== null
      ? { left: `${pos.x}px`, top: `${pos.y}px`, right: "auto", bottom: "auto" }
      : undefined;

  return (
    <button
      type="button"
      aria-label="打开 AI 对话"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerCancel}
      style={positionStyle}
      className={`fixed w-14 h-14 rounded-full bg-black text-white shadow-lg z-50 touch-none select-none flex items-center justify-center right-4 bottom-20 ${
        dragging ? "cursor-grabbing" : "cursor-grab"
      }`}
    >
      <Icon name="chat" className="w-6 h-6" />
    </button>
  );
}
