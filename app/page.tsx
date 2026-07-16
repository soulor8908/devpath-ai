// app/page.tsx
// 首页入口（Server Component）
//
// Issue 6 修复：从纯客户端渲染 → SSR + Suspense 骨架屏
//
// 旧版问题：
//   - "use client" + 15 个 useState + useEffect 数据获取 = 完全客户端渲染
//   - 首次加载白屏（SSR 输出空 HTML，hydration 后才有内容）
//   - PWA 场景虽然可接受，但首次进入仍影响感知性能
//
// 新版方案：
//   - 本文件是 Server Component，渲染骨架屏 HTML（首屏有视觉反馈）
//   - HomeClient 是 Client Component，用 Suspense 包装
//   - SSR 阶段：输出骨架屏 HTML
//   - hydration 后：HomeClient 挂载，useHomeData 异步加载 IndexedDB 数据
//   - 数据加载完成：真实内容替换骨架屏
//
// 设计参考：app/dashboard/page.tsx 已经采用同样的 server/client 拆分模式

import { Suspense } from "react";
import HomeClient from "./HomeClient";

// 首屏骨架屏：与 HomeClient 布局对齐，提供"结构感"而非白屏
function HomeSkeleton() {
  return (
    <div className="min-h-screen p-4 max-w-2xl mx-auto pb-20 dark:bg-gray-900 animate-pulse">
      {/* 顶部 */}
      <div className="flex items-center justify-between mb-4">
        <div className="h-8 w-16 bg-gray-200 dark:bg-gray-700 rounded" />
        <div className="h-7 w-20 bg-gray-100 dark:bg-gray-700 rounded-full" />
      </div>

      {/* AI 提醒卡片占位 */}
      <div className="mb-4 space-y-3">
        <div className="h-16 bg-gray-100 dark:bg-gray-800 rounded-lg" />
        <div className="h-12 bg-gray-100 dark:bg-gray-800 rounded-lg" />
      </div>

      {/* 三宫格统计占位 */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="h-16 bg-gray-100 dark:bg-gray-800 border dark:border-gray-700 rounded-lg"
          />
        ))}
      </div>

      {/* 今日安排占位 */}
      <div className="space-y-2 mb-4">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="h-9 bg-gray-100 dark:bg-gray-800 rounded-lg"
          />
        ))}
      </div>

      {/* 情绪区占位 */}
      <div className="mb-4">
        <div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
        <div className="h-10 bg-gray-100 dark:bg-gray-800 rounded-lg" />
      </div>

      {/* 错题区占位 */}
      <div className="mb-4">
        <div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
        <div className="h-10 bg-gray-100 dark:bg-gray-800 rounded-lg" />
      </div>

      {/* 热力图占位 */}
      <div className="mb-4">
        <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
        <div className="flex gap-1">
          {[0, 1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="flex-1 h-12 bg-gray-100 dark:bg-gray-800 rounded"
            />
          ))}
        </div>
      </div>

      {/* 快捷入口占位 */}
      <div className="grid grid-cols-3 gap-3 mt-3">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="h-16 bg-gray-100 dark:bg-gray-800 rounded-xl"
          />
        ))}
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<HomeSkeleton />}>
      <HomeClient />
    </Suspense>
  );
}
