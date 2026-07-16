// lib/hooks/use-auto-fullscreen.ts
// 自动全屏 hook：进入页面时提示用户进入全屏（浏览器安全策略要求用户手势触发）
// 不能自动全屏 → 显示提示卡片 → 用户点击后调 requestFullscreen

import { useState, useCallback, useEffect } from "react";

export interface AutoFullscreenState {
  /** 是否需要显示全屏提示 */
  needsPrompt: boolean;
  /** 当前是否全屏中 */
  isFullscreen: boolean;
  /** 浏览器是否支持全屏 */
  supported: boolean;
  /** 用户手动触发全屏 */
  enterFullscreen: () => Promise<void>;
  /** 关闭提示（用户选择不全屏） */
  dismissPrompt: () => void;
}

export function useAutoFullscreen(): AutoFullscreenState {
  const [needsPrompt, setNeedsPrompt] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const supported =
    typeof document !== "undefined" &&
    (document.fullscreenEnabled ||
      // @ts-expect-error webkit 兼容
      document.webkitFullscreenEnabled === true);

  useEffect(() => {
    if (!supported) return;
    // 进入页面时显示提示（浏览器会拒绝自动全屏，必须用户手势触发）
    setNeedsPrompt(true);
    // 监听全屏状态变化
    const onChange = () => {
      const fs = document.fullscreenElement;
      setIsFullscreen(!!fs);
      if (fs) setNeedsPrompt(false);
    };
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, [supported]);

  const enterFullscreen = useCallback(async () => {
    try {
      const el = document.documentElement;
      // 标准化全屏调用（含 webkit 回退）
      const req =
        el.requestFullscreen ||
        // @ts-expect-error webkit 兼容
        el.webkitRequestFullscreen;
      if (req) await req.call(el);
      setNeedsPrompt(false);
    } catch {
      // 失败则保持提示状态，用户可再次点击
      setNeedsPrompt(true);
    }
  }, []);

  const dismissPrompt = useCallback(() => {
    setNeedsPrompt(false);
  }, []);

  return {
    needsPrompt,
    isFullscreen,
    supported,
    enterFullscreen,
    dismissPrompt,
  };
}
