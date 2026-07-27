import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Nav } from "@/components/Nav";
import { ToastContainer } from "@/components/ui";
import { GlobalWidgets } from "./GlobalWidgets";

// 2026-07-27 修复 build 失败：
//   Next.js 15 不允许在 Server Component（layout.tsx）中用 next/dynamic + ssr:false。
//   把 FloatingChat / PomodoroWidget / AITaskModal 的 dynamic import 移到
//   Client Component（GlobalWidgets.tsx）中，layout.tsx 引用它。
//   性能优化保留：首屏 JS 体积降到最小，用户不点开就不加载。
//   详见 app/GlobalWidgets.tsx 文件头注释。

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
        <Nav />
        <GlobalWidgets />
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
