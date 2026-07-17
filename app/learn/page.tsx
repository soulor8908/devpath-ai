"use client";

// app/learn/page.tsx
// 学习入口智能路由：
//   无计划 → /learn/new
//   有计划 → /learn/list
// 本页自身不渲染业务内容，只显示极简骨架屏后跳转。

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { resolveLearnEntry } from "@/lib/learn-router";
import { Icon } from "@/components/Icon";

export default function LearnRouterPage() {
  const router = useRouter();
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const target = await resolveLearnEntry();
        if (!cancelled) router.replace(target);
      } catch {
        if (!cancelled) {
          // 兜底：读取失败时回到创建页，保证不卡死
          setFailed(true);
          router.replace("/learn/new");
        }
      }
    })();
    return () => {
      cancelled = true;
    };
    // router 引用稳定（App Router），不作为 effect 依赖避免重渲染（React #185）
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8">
      <div className="mb-4 animate-pulse">
        <Icon name="book" className="w-10 h-10 inline-block text-gray-300" />
      </div>
      <p className="text-sm text-gray-400">正在进入学习…</p>
      {failed && (
        <button
          onClick={() => router.replace("/learn/new")}
          className="mt-4 text-xs text-blue-500 underline"
        >
          点击手动进入
        </button>
      )}
    </div>
  );
}
