"use client";

// app/GlobalWidgets.tsx
// 全局浮窗组件容器（2026-07-27 修复 build 失败）
//
// 设计（卡帕西视角）：
//   Next.js 15 不允许在 Server Component（如 app/layout.tsx）中使用 next/dynamic + ssr:false。
//   根因：Server Component 在服务端渲染，没有浏览器环境，ssr:false 没有意义。
//   解法：把 dynamic import 移到 Client Component 中，layout.tsx 引用它。
//
// 性能优化保留（2026-07-26）：
//   - FloatingChat / PomodoroWidget / AITaskModal 仍用 dynamic + ssr:false
//   - 首屏 JS 体积降到最小，用户不点开就不加载
//   - ssr:false 因为这些组件依赖 window/indexedDB，且首屏不需要它们渲染任何东西

import dynamic from "next/dynamic";

const FloatingChat = dynamic(
  () => import("@/components/FloatingChat").then((m) => m.FloatingChat),
  { ssr: false, loading: () => null },
);
const PomodoroWidget = dynamic(
  () => import("@/components/PomodoroWidget").then((m) => m.PomodoroWidget),
  { ssr: false, loading: () => null },
);
const AITaskModal = dynamic(
  () => import("@/components/AITaskModal").then((m) => m.AITaskModal),
  { ssr: false, loading: () => null },
);

export function GlobalWidgets() {
  return (
    <>
      <AITaskModal />
      <FloatingChat />
      {/* 全局浮动番茄钟 widget：仅在 running session 存在且不在 /timer 页时显示
          z-index 高于 FloatingChat/ChatModal（z-[60]），让聊天中启动番茄钟后用户能看到倒计时 */}
      <PomodoroWidget />
    </>
  );
}
