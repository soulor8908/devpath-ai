// lib/hooks/use-auto-fullscreen.ts
// 全屏 hook：从「自动弹窗」改为「主动触发」
//
// 设计考量（卡帕西视角）：
//   - 不再 useEffect 自动 setNeedsPrompt(true)，避免一进页面就弹窗
//   - 改为暴露 enterFullscreen() 让按钮调用（用户主动手势）
//   - 用户首次 dismiss 后持久化偏好，后续访问不再弹（按钮仍可用）
//   - 锁定竖屏方向（移动端），不支持时静默 catch
//   - 支持 webkit 兼容（iOS Safari）

import { useState, useCallback, useEffect } from "react";

const DISMISS_KEY = "fullscreen:dismissed";

export interface AutoFullscreenState {
  /** 当前是否全屏中 */
  isFullscreen: boolean;
  /** 浏览器是否支持全屏 */
  supported: boolean;
  /** 用户手动触发全屏（推荐用户主动点击按钮调用） */
  enterFullscreen: () => Promise<boolean>;
  /** 当前是否需要提示（仅用于首次访问；按钮始终可见） */
  needsPrompt: boolean;
  /** 关闭首次提示（持久化偏好，后续访问不再提示） */
  dismissPrompt: () => void;
}

function readDismissed(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return localStorage.getItem(DISMISS_KEY) === "true";
  } catch {
    return false;
  }
}

function writeDismissed() {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(DISMISS_KEY, "true");
  } catch {
    // 隐私模式下静默失败
  }
}

async function lockPortrait() {
  // 仅在用户手势触发的上下文中生效
  try {
    // @ts-expect-error lock 兼容
    if (screen.orientation && screen.orientation.lock) {
      // @ts-expect-error lock 兼容
      await screen.orientation.lock("portrait");
    }
  } catch {
    // iOS Safari 不支持 / 用户手势不在调用栈 → 静默忽略
  }
}

export function useAutoFullscreen(): AutoFullscreenState {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [needsPrompt, setNeedsPrompt] = useState(false);

  const supported =
    typeof document !== "undefined" &&
    (document.fullscreenEnabled ||
      // @ts-expect-error webkit 兼容
      document.webkitFullscreenEnabled === true);

  useEffect(() => {
    if (!supported) return;
    // 仅首次访问且未 dismiss 过时显示提示
    if (!readDismissed()) {
      setNeedsPrompt(true);
    }
    const onChange = () => {
      const fs = document.fullscreenElement;
      setIsFullscreen(!!fs);
      if (fs) setNeedsPrompt(false);
    };
    document.addEventListener("fullscreenchange", onChange);
    // webkit 兼容（iOS Safari）
    document.addEventListener("webkitfullscreenchange", onChange);
    return () => {
      document.removeEventListener("fullscreenchange", onChange);
      document.removeEventListener("webkitfullscreenchange", onChange);
    };
  }, [supported]);

  const enterFullscreen = useCallback(async () => {
    if (!supported) return false;
    try {
      const el = document.documentElement;
      const req =
        el.requestFullscreen ||
        // @ts-expect-error webkit 兼容
        el.webkitRequestFullscreen;
      if (!req) return false;
      await req.call(el);
      // 进入全屏后尝试锁定竖屏（必须在用户手势调用栈内）
      await lockPortrait();
      setNeedsPrompt(false);
      return true;
    } catch {
      // 失败保持原状
      return false;
    }
  }, [supported]);

  const dismissPrompt = useCallback(() => {
    setNeedsPrompt(false);
    writeDismissed();
  }, []);

  return {
    isFullscreen,
    supported,
    enterFullscreen,
    needsPrompt,
    dismissPrompt,
  };
}
