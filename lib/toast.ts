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
/**
 * 缓存的快照引用。useSyncExternalStore 的 getSnapshot 要求：
 * 在 store 状态未变化时，多次调用必须返回引用相等的值（Object.is 为 true）。
 * 若每次返回 state.slice() 新数组 → React 误判 store 变了 → 无限重渲染（React #185）。
 *
 * 只在 state 真正变化时（通过 updateState）才重新生成新数组。
 */
let cachedSnapshot: ToastItem[] = state;
const listeners = new Set<ToastListener>();
let seq = 0;

function genId(): string {
  seq += 1;
  return `t_${Date.now().toString(36)}_${seq.toString(36)}`;
}

/**
 * 更新 state 并刷新缓存快照。
 * 所有状态变更必须走此函数，保证 cachedSnapshot 与 state 同步。
 */
function updateState(newState: ToastItem[]): void {
  state = newState;
  cachedSnapshot = state.slice();
  emit();
}

function emit() {
  // 通知监听器时传 cachedSnapshot（与 getToasts 返回值一致）
  for (const l of listeners) {
    try {
      l(cachedSnapshot);
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
    listener(cachedSnapshot);
  } catch {
    // 单个监听器抛错不影响其他
  }
  return () => {
    listeners.delete(listener);
  };
}

/**
 * 获取当前快照（引用稳定）。
 * 供 useSyncExternalStore 的 getSnapshot 使用——在 state 未变化时
 * 多次调用返回同一引用，避免 React 无限重渲染。
 */
export function getToasts(): ToastItem[] {
  return cachedSnapshot;
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
  updateState([...state, item]);
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
  updateState(state.filter((t) => t.id !== id));
}

/** 清空所有 toast（主要用于测试和路由切换） */
export function clearToasts(): void {
  if (state.length === 0) return;
  updateState([]);
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
