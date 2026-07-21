// components/ui/Toast.tsx
// 全局 Toast 渲染容器（统一组件库成员）
//
// 设计考量（乔布斯视角）：
//   - 顶部居中堆叠：移动端友好的可视区，不遮挡底部 Nav
//   - 4 种语义色：success=绿 / error=红 / warning=橙 / info=蓝
//   - confirm 类型：带两个按钮，不自动消失，居中浮层样式
//   - dark mode 对比度均 ≥ 4.5:1（WCAG AA）
//   - 进出动画：slide-down + fade，符合 Tailwind animate-* 关键帧
//
// 设计考量（卡帕西视角）：
//   - 单组件订阅 store，避免每个使用点都订阅
//   - 自动消失定时器在 hover 时暂停
//   - confirm 按钮点击后 resolve + dismiss，幂等保护
//
// 与其他统一组件的关系：
//   - 与 lib/toast.ts（store + API）解耦：组件只负责渲染
//   - 与 lib/hooks/use-toast.ts（订阅 hook）解耦：组件只负责呈现
//   - 调用方使用 pushToast/toast.success 等 API，无需关心渲染细节
//   - 全局挂载在 app/layout.tsx 的 ToastContainer 自动渲染所有 toast

"use client";

import { useEffect, useRef, useState } from "react";
import { useToasts } from "@/lib/hooks/use-toast";
import { dismissToast } from "@/lib/toast";
import type { ToastItem, ToastType } from "@/lib/toast";
import { Icon, type IconName } from "@/components/Icon";
import { Button } from "@/components/ui";

const TYPE_ICON: Record<ToastType, IconName> = {
  success: "check-circle",
  error: "x-circle",
  warning: "alert",
  info: "info",
};

const TYPE_STYLES: Record<ToastType, {
  container: string;
  icon: string;
  accent: string;
}> = {
  success: {
    container: "bg-white dark:bg-gray-800 border-l-4 border-green-500",
    icon: "text-green-500 dark:text-green-400",
    accent: "text-green-600 dark:text-green-400",
  },
  error: {
    container: "bg-white dark:bg-gray-800 border-l-4 border-red-500",
    icon: "text-red-500 dark:text-red-400",
    accent: "text-red-600 dark:text-red-400",
  },
  warning: {
    container: "bg-white dark:bg-gray-800 border-l-4 border-amber-500",
    icon: "text-amber-500 dark:text-amber-400",
    accent: "text-amber-600 dark:text-amber-400",
  },
  info: {
    container: "bg-white dark:bg-gray-800 border-l-4 border-blue-500",
    icon: "text-blue-500 dark:text-blue-400",
    accent: "text-blue-600 dark:text-blue-400",
  },
};

function ToastCard({ toast: item }: { toast: ToastItem }) {
  const [paused, setPaused] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const dismissedRef = useRef(false);
  const styles = TYPE_STYLES[item.type];
  const iconName = TYPE_ICON[item.type];

  // 自动消失定时器（confirm 类型不自动消失）
  useEffect(() => {
    if (item.confirm) return;
    if (item.durationMs <= 0) return;
    if (paused) return;
    const remaining = item.durationMs - (Date.now() - item.createdAt);
    if (remaining <= 0) {
      handleDismiss();
      return;
    }
    const timer = window.setTimeout(handleDismiss, remaining);
    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [item.durationMs, item.createdAt, paused, item.confirm]);

  function handleDismiss() {
    if (dismissedRef.current) return;
    dismissedRef.current = true;
    setLeaving(true);
    // 等动画结束后真正移除
    window.setTimeout(() => dismissToast(item.id), 180);
  }

  function handleConfirmClick(ok: boolean) {
    if (dismissedRef.current) return;
    dismissedRef.current = true;
    try {
      item.confirm?.resolve(ok);
    } finally {
      setLeaving(true);
      window.setTimeout(() => dismissToast(item.id), 180);
    }
  }

  return (
    <div
      role={item.confirm ? "dialog" : "status"}
      aria-live={item.type === "error" ? "assertive" : "polite"}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      className={`pointer-events-auto w-full max-w-sm rounded-lg shadow-lg ring-1 ring-black/5 dark:ring-white/5 transition-all duration-200 ${
        leaving ? "opacity-0 -translate-y-2" : "opacity-100 translate-y-0"
      } ${styles.container}`}
    >
      <div className="flex items-start gap-3 p-3">
        <Icon name={iconName} className={`w-5 h-5 flex-shrink-0 mt-0.5 ${styles.icon}`} />
        <div className="flex-1 min-w-0">
          {item.confirm?.title && (
            <div className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-0.5">
              {item.confirm.title}
            </div>
          )}
          <div className="text-sm text-gray-700 dark:text-gray-200 break-words">
            {item.message}
          </div>
          {item.confirm && (
            <div className="mt-3 flex gap-2 justify-end">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => handleConfirmClick(false)}
              >
                {item.confirm.cancelText}
              </Button>
              <Button
                variant={item.confirm.danger ? "danger" : "primary"}
                size="sm"
                onClick={() => handleConfirmClick(true)}
              >
                {item.confirm.confirmText}
              </Button>
            </div>
          )}
        </div>
        {!item.confirm && (
          <Button
            iconOnly
            variant="ghost"
            size="sm"
            onClick={handleDismiss}
            aria-label="关闭提示"
            className="flex-shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
          >
            <Icon name="x" className="w-4 h-4" />
          </Button>
        )}
      </div>
    </div>
  );
}

export function ToastContainer() {
  const toasts = useToasts();

  if (toasts.length === 0) return null;

  // confirm 类型居中浮层；普通类型顶部堆叠
  const confirms = toasts.filter((t) => t.confirm);
  const normals = toasts.filter((t) => !t.confirm);

  return (
    <>
      {normals.length > 0 && (
        <div
          aria-label="通知"
          className="fixed top-3 left-1/2 -translate-x-1/2 z-[9999] flex flex-col gap-2 w-[calc(100vw-1.5rem)] max-w-sm pointer-events-none"
        >
          {normals.map((t) => (
            <ToastCard key={t.id} toast={t} />
          ))}
        </div>
      )}
      {confirms.length > 0 && (
        <div
          aria-label="确认对话框"
          className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
        >
          <div className="w-full max-w-sm flex flex-col gap-2">
            {confirms.map((t) => (
              <ToastCard key={t.id} toast={t} />
            ))}
          </div>
        </div>
      )}
    </>
  );
}
