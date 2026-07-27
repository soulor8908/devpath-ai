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
// 2026-07-27 优化：HomeSkeleton 移到 HomeClient.tsx export，
//   Suspense fallback 和 useHomeData isLoading 共用同一骨架屏，
//   避免"chunk 加载骨架屏 → 数据加载假数据 → 真实数据"三段式跳变。

import { Suspense } from "react";
import HomeClient, { HomeSkeleton } from "./HomeClient";

export default function Home() {
  return (
    <Suspense fallback={<HomeSkeleton />}>
      <HomeClient />
    </Suspense>
  );
}
