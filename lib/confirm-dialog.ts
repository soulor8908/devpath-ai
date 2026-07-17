// lib/confirm-dialog.ts
// Promise 化 confirm 对话框：复用 toast store 渲染
//
// 设计考量（卡帕西视角）：
//   - 不引入新 UI 容器，复用 Toast.tsx 的渲染管线
//   - 通过 confirm 字段标记为「阻塞式」toast，不自动消失
//   - 用户点击按钮后 resolve Promise 并 dismiss
//   - 支持 danger 风格（删除按钮红色）
//
// 使用：
//   const ok = await confirmDialog({ message: "确定删除？" });
//   if (ok) await deletePlan();

import { pushToast, dismissToast, type ToastConfirm } from "@/lib/toast";

export interface ConfirmOptions {
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  /** danger=true 时确认按钮显示红色（删除/放弃等破坏性操作） */
  danger?: boolean;
}

/** 弹出确认对话框，返回 Promise<boolean>：true=确认，false=取消 */
export function confirmDialog(options: ConfirmOptions): Promise<boolean> {
  return new Promise<boolean>((resolve) => {
    let resolved = false;
    const safeResolve = (ok: boolean) => {
      if (resolved) return;
      resolved = true;
      resolve(ok);
    };
    const confirm: ToastConfirm = {
      title: options.title,
      confirmText: options.confirmText ?? "确定",
      cancelText: options.cancelText ?? "取消",
      danger: options.danger ?? false,
      resolve: safeResolve,
    };
    // durationMs=0 不自动消失；confirm 字段会阻止自动 dismiss
    const id = pushToast("info", options.message, 0, confirm);
    // 兜底：confirm 已 dismiss 后用户再次操作不应触发 resolve
    // dismissToast 已经被 Toast.tsx 在点击按钮时调用
    void id;
  });
}

/** 仅导出 dismissToast 便于测试调用 */
export { dismissToast };
