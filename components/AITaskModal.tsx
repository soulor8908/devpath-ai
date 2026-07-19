"use client";

// components/AITaskModal.tsx
// 全局 AI 任务等待模态窗
//
// 设计（乔布斯视角）：
//   - 任何用户主动触发的 AI 调用都显示此模态窗
//   - 流式输出 AI 内容（打字机效果），让用户知道"系统在工作"
//   - 中止按钮（红色）立即停止任务
//   - 关闭按钮：任务未完成时点关闭，提醒"任务会关闭，是否继续？"
//   - backdrop 不可点击关闭（防止误触丢失任务）
//   - 完成后自动 1.5s 淡出（让用户看到结果）
//
// 设计（卡帕西视角）：
//   - 订阅 ai-task-queue 单例 store，不依赖 Context
//   - 自动滚动到底部（流式输出时跟随）
//   - useLayoutEffect 避免滚动抖动

import { useEffect, useRef } from "react";
import { useAITask } from "@/lib/hooks/use-ai-task";
import {
  abortCurrentAITask,
  clearAITask,
} from "@/lib/ai-task-queue";
import { confirmDialog } from "@/lib/confirm-dialog";
import { Icon } from "@/components/Icon";
import { Button } from "@/components/ui";

export function AITaskModal() {
  const task = useAITask();
  const contentRef = useRef<HTMLDivElement | null>(null);

  // 流式输出时自动滚动到底部
  useEffect(() => {
    if (task && contentRef.current) {
      contentRef.current.scrollTop = contentRef.current.scrollHeight;
    }
  }, [task]);

  // 任务完成后 1.5s 自动清除（让用户看到结果）
  useEffect(() => {
    if (!task) return;
    if (task.status === "done" || task.status === "error" || task.status === "aborted") {
      const timer = window.setTimeout(() => {
        clearAITask();
      }, 1800);
      return () => {
        window.clearTimeout(timer);
      };
    }
  }, [task]);

  if (!task) return null;

  const isRunning = task.status === "running";

  async function handleClose() {
    if (!task) return;
    if (isRunning) {
      // 任务运行中：提醒用户
      const ok = await confirmDialog({
        title: "关闭任务？",
        message: "任务尚未完成，关闭后 AI 生成将被中止。确定要关闭吗？",
        confirmText: "关闭并中止",
        cancelText: "继续等待",
        danger: true,
      });
      if (!ok) return;
      abortCurrentAITask();
      // 中止后立即清除（不等自动淡出）
      setTimeout(() => clearAITask(), 100);
    } else {
      clearAITask();
    }
  }

  function handleAbort() {
    abortCurrentAITask();
  }

  const statusConfig = {
    running: {
      icon: "loader" as const,
      iconClass: "animate-spin text-blue-500 dark:text-blue-400",
      label: "AI 思考中",
      labelClass: "text-blue-600 dark:text-blue-400",
    },
    done: {
      icon: "check-circle" as const,
      iconClass: "text-green-500 dark:text-green-400",
      label: "完成",
      labelClass: "text-green-600 dark:text-green-400",
    },
    error: {
      icon: "x-circle" as const,
      iconClass: "text-red-500 dark:text-red-400",
      label: "出错",
      labelClass: "text-red-600 dark:text-red-400",
    },
    aborted: {
      icon: "x-circle" as const,
      iconClass: "text-gray-400 dark:text-gray-500",
      label: "已中止",
      labelClass: "text-gray-500 dark:text-gray-400",
    },
  };
  const status = statusConfig[task.status];

  return (
    <div
      className="fixed inset-0 z-[9998] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      role="dialog"
      aria-modal="true"
      aria-label="AI 任务进度"
    >
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b dark:border-gray-700">
          <div className="flex items-center gap-2 min-w-0">
            <Icon name={status.icon} className={`w-5 h-5 shrink-0 ${status.iconClass}`} />
            <h3 className="font-semibold text-sm truncate">{task.title}</h3>
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 ${status.labelClass}`}>
              {status.label}
            </span>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            iconOnly
            onClick={handleClose}
            aria-label="关闭"
            className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 shrink-0"
          >
            <Icon name="x" className="w-4 h-4" />
          </Button>
        </div>

        {/* Content - 流式输出 */}
        <div
          ref={contentRef}
          className="flex-1 overflow-y-auto px-5 py-4 text-sm text-gray-700 dark:text-gray-200 whitespace-pre-wrap break-words"
        >
          {task.content ? (
            task.content
          ) : (
            <div className="flex items-center gap-2 text-gray-400 dark:text-gray-500">
              <span className="inline-flex gap-1">
                <span className="w-2 h-2 rounded-full bg-gray-300 dark:bg-gray-600 animate-pulse" />
                <span className="w-2 h-2 rounded-full bg-gray-300 dark:bg-gray-600 animate-pulse" style={{ animationDelay: "0.2s" }} />
                <span className="w-2 h-2 rounded-full bg-gray-300 dark:bg-gray-600 animate-pulse" style={{ animationDelay: "0.4s" }} />
              </span>
              <span className="text-xs">等待 AI 响应...</span>
            </div>
          )}
          {isRunning && task.content && (
            <span className="inline-block w-2 h-4 ml-0.5 bg-blue-500 animate-pulse align-middle" />
          )}
        </div>

        {/* Error message */}
        {task.status === "error" && task.error && (
          <div className="px-5 py-2 bg-red-50 dark:bg-red-950/30 border-t border-red-200 dark:border-red-800 text-xs text-red-600 dark:text-red-400">
            <Icon name="alert" className="w-3.5 h-3.5 inline-block align-middle" /> {task.error}
          </div>
        )}

        {/* Footer - 操作按钮 */}
        <div className="flex items-center justify-between gap-2 px-5 py-3 border-t dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
          <span className="text-xs text-gray-400">
            {task.createdAt && (
              <>
                已运行 {Math.max(0, Math.round(((task.finishedAt ?? Date.now()) - task.createdAt) / 1000))}s
              </>
            )}
          </span>
          <div className="flex items-center gap-2">
            {isRunning && (
              <Button
                size="sm"
                variant="danger"
                onClick={handleAbort}
                leftIcon="x"
              >
                中止执行
              </Button>
            )}
            <Button
              size="sm"
              variant="secondary"
              onClick={handleClose}
            >
              {isRunning ? "关闭" : "完成"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
