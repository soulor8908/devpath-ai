import type { Metadata, Viewport } from "next";
import dynamic from "next/dynamic";
import "./globals.css";
import { Nav } from "@/components/Nav";
import { ToastContainer } from "@/components/ui";

// 2026-07-26 性能优化（卡帕西视角）：
// 全局浮窗组件改 dynamic + ssr:false，把首屏 JS 体积降到最小。
// - FloatingChat：含 ChatClient（重型，含流式 LLM 调用 + 消息列表），用户不点开就不加载
// - PomodoroWidget：番茄钟 widget，仅 running session 存在时才渲染，没必要进首屏 bundle
// - AITaskModal：AI 任务进度弹窗，仅在有 AI 任务时才渲染
// 保留 Nav + ToastContainer 同步加载：Nav 是首屏可见的底部导航，Toast 是错误反馈必需，
// 它们体积小且必须立即可用，不能延迟加载。
// ssr:false 因为这些组件依赖 window/indexedDB，且首屏不需要它们渲染任何东西。
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

export const metadata: Metadata = {
  title: "devpath-ai — AI 驱动的开发者成长 OS",
  description: "告诉 AI 你想学什么，它给你拆知识树、排学习计划、生面试题、按遗忘曲线复习、追踪能量与情绪",
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  themeColor: "#2563eb",
  // 允许用户缩放（WCAG 1.4.4 Resize Text）：低视力用户可放大文字
  // 脑图内部的双指缩放由组件内 touch-action 处理，不应在 viewport 层禁用整页缩放
  initialScale: 1,
  width: "device-width",
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <head>
        <script dangerouslySetInnerHTML={{ __html: `
          (function() {
            try {
              var stored = localStorage.getItem('devpath:theme') || 'light';
              var dark = stored === 'dark' || (stored === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
              if (dark) document.documentElement.classList.add('dark');
            } catch(e) {}
          })();
        `}} />
      </head>
      <body className="bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 min-h-screen pb-11">
        <a href="#main-content" className="skip-link">跳到主内容</a>
        <main id="main-content">{children}</main>
        <ToastContainer />
        <AITaskModal />
        <Nav />
        <FloatingChat />
        {/* 全局浮动番茄钟 widget：仅在 running session 存在且不在 /timer 页时显示
            z-index 高于 FloatingChat/ChatModal（z-[60]），让聊天中启动番茄钟后用户能看到倒计时 */}
        <PomodoroWidget />
        <script
          dangerouslySetInnerHTML={{
            __html: `if ('serviceWorker' in navigator) {
              window.addEventListener('load', () => {
                navigator.serviceWorker.register('/sw.js').catch((e) => console.warn('SW reg failed:', e));
              });
            }`,
          }}
        />
      </body>
    </html>
  );
}
