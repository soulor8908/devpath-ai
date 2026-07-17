// lib/hooks/use-toast.ts
// React hook 订阅 toast store
//
// 设计考量（卡帕西视角）：
//   - useSyncExternalStore 是 React 18+ 推荐的外部 store 订阅方式
//   - 自动处理 Concurrent Mode tearing 问题
//   - 与 React 19 完全兼容

"use client";

import { useSyncExternalStore, useCallback } from "react";
import {
  subscribeToasts,
  getToasts,
  dismissToast,
  type ToastItem,
} from "@/lib/toast";

/** 订阅并返回当前 toast 列表 */
export function useToasts(): ToastItem[] {
  return useSyncExternalStore(subscribeToasts, getToasts, getToasts);
}

/** 返回 dismiss 函数（稳定引用） */
export function useDismissToast(): (id: string) => void {
  return useCallback((id: string) => dismissToast(id), []);
}
