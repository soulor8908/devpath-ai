// lib/toast.ts
// 全局 Toast 状态管理（订阅模式）
//
// 设计考量（卡帕西视角）：
//   - 单例 store + subscribe：避免 React Context 在大列表下引发的额外 re-render
//   - 任何调用方（包括非 React 模块，例如路由处理器）都能 pushToast
//   - confirm 作为一种特殊 toast：不自动消失，带两个按钮
//   - 零运行时依赖，纯 TypeScript，可在 Node/Vitest 环境单测
//
// 使用：
//   import { toast } from "@/lib/toast";
//   toast.success("保存成功");
//   toast.error("网络错误");
//   const ok = await confirmDialog({ message: "确定删除？" });

export type ToastType = "success" | "error" | "warning" | "info";

export interface ToastConfirm {
  title?: string;
  confirmText: string;
  cancelText: string;
  danger?: boolean;
  resolve: (ok: boolean) => void;
}

export interface ToastItem {
  id: string;
  type: ToastType;
  message: string;
  /** 自动消失毫秒数；0 或不传表示不自动消失（confirm 用） */
  durationMs: number;
  createdAt: number;
  /** confirm 类型专用：按钮文案与 resolve 回调 */
  confirm?: ToastConfirm;
}

export type ToastListener = (toasts: ToastItem[]) => void;

const DEFAULT_DURATION_MS = 3000;

let state: ToastItem[] = [];
const listeners = new Set<ToastListener>();
let seq = 0;

function genId(): string {
  seq += 1;
  return `t_${Date.now().toString(36)}_${seq.toString(36)}`;
}

function emit() {
  const snapshot = state.slice();
  for (const l of listeners) {
    try {
      l(snapshot);
    } catch {
      // 单个监听器抛错不影响其他
    }
  }
}

/** 订阅 toast 变更，返回取消订阅函数 */
export function subscribeToasts(listener: ToastListener): () => void {
  listeners.add(listener);
  // 立即推送当前快照（同样容错）
  try {
    listener(state.slice());
  } catch {
    // 单个监听器抛错不影响其他
  }
  return () => {
    listeners.delete(listener);
  };
}

/** 获取当前快照（非响应式） */
export function getToasts(): ToastItem[] {
  return state.slice();
}

/** 推送一个 toast，返回其 id */
export function pushToast(
  type: ToastType,
  message: string,
  durationMs: number = DEFAULT_DURATION_MS,
  confirm?: ToastConfirm,
): string {
  const id = genId();
  const item: ToastItem = {
    id,
    type,
    message,
    durationMs,
    createdAt: Date.now(),
    confirm,
  };
  state = [...state, item];
  emit();
  // 自动消失（confirm 类型不自动消失）
  if (durationMs > 0 && !confirm && typeof window !== "undefined") {
    window.setTimeout(() => {
      dismissToast(id);
    }, durationMs);
  }
  return id;
}

/** 移除单个 toast */
export function dismissToast(id: string): void {
  const exists = state.some((t) => t.id === id);
  if (!exists) return;
  state = state.filter((t) => t.id !== id);
  emit();
}

/** 清空所有 toast（主要用于测试和路由切换） */
export function clearToasts(): void {
  if (state.length === 0) return;
  state = [];
  emit();
}

/** 快捷方法 */
export const toast = {
  success: (message: string, durationMs?: number) =>
    pushToast("success", message, durationMs ?? DEFAULT_DURATION_MS),
  error: (message: string, durationMs?: number) =>
    pushToast("error", message, durationMs ?? DEFAULT_DURATION_MS + 2000),
  warning: (message: string, durationMs?: number) =>
    pushToast("warning", message, durationMs ?? DEFAULT_DURATION_MS + 1000),
  info: (message: string, durationMs?: number) =>
    pushToast("info", message, durationMs ?? DEFAULT_DURATION_MS),
};
