import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Nav } from "@/components/Nav";
import { ToastContainer } from "@/components/Toast";
import { FloatingChat } from "@/components/FloatingChat";
import { AITaskModal } from "@/components/AITaskModal";

export const metadata: Metadata = {
  title: "devpath-ai — AI 驱动的开发者成长 OS",
  description: "告诉 AI 你想学什么，它给你拆知识树、排学习计划、生面试题、按遗忘曲线复习、追踪能量与情绪",
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  themeColor: "#2563eb",
  // 禁止移动端整体缩放：脑图内部自行处理两指缩放
  userScalable: false,
  maximumScale: 1,
  minimumScale: 1,
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
      <body className="bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 min-h-screen pb-16">
        {children}
        <ToastContainer />
        <AITaskModal />
        <Nav />
        <FloatingChat />
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
