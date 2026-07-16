"use client";

// app/error.tsx
// 全局错误边界：捕获未处理的运行时错误，提供重试入口

import { Icon } from "@/components/Icon";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="mb-4"><Icon name="alert" className="w-12 h-12" /></div>
      <h1 className="text-xl font-bold mb-2">出错了</h1>
      <p className="mb-4 text-sm text-gray-500">
        {error.message || "页面加载失败"}
      </p>
      <button
        onClick={reset}
        className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
      >
        重试
      </button>
    </div>
  );
}
