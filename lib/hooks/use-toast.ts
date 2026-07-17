// lib/hooks/use-toast.ts
// React hook 订阅 toast store
//
// 设计考量（卡帕西视角）：
//   - useSyncExternalStore 是 React 18+ 推荐的外部 store 订阅方式
//   - 自动处理 Concurrent Mode tearing 问题
//   - 与 React 19 完全兼容
//   - getServerSnapshot 必须返回缓存的稳定引用——若每次返回新数组，
//     React 会误判 store 变化 → 重渲染 → 再调用 → 无限循环（React #185）

"use client";

import { useSyncExternalStore, useCallback } from "react";
import {
  subscribeToasts,
  getToasts,
  dismissToast,
  type ToastItem,
} from "@/lib/toast";

/**
 * 服务端快照：缓存的空数组，保证引用稳定。
 * Toast 是纯客户端状态（用户交互触发），SSR 时永远为空。
 * 不能用 getToasts()（每次 state.slice() 返回新引用 → 死循环）。
 */
const EMPTY_TOASTS: ToastItem[] = [];

/** 订阅并返回当前 toast 列表 */
export function useToasts(): ToastItem[] {
  return useSyncExternalStore(
    subscribeToasts,
    getToasts,
    () => EMPTY_TOASTS,
  );
}

/** 返回 dismiss 函数（稳定引用） */
export function useDismissToast(): (id: string) => void {
  return useCallback((id: string) => dismissToast(id), []);
}
