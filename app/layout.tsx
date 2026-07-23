import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Nav } from "@/components/Nav";
import { ToastContainer } from "@/components/ui";
import { FloatingChat } from "@/components/FloatingChat";
import { AITaskModal } from "@/components/AITaskModal";
import { PomodoroWidget } from "@/components/PomodoroWidget";

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
