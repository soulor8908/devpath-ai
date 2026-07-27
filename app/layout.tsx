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

// 2026-07-27 P1：补齐 OG / Twitter Card / canonical
//   - metadataBase 让所有相对路径（og:image / canonical）解析为绝对 URL
//   - OG 标签：facebook / linkedin / 微信 / 钉钉 等分享卡片
//   - Twitter Card：summary_large_image（即使没大图也降级到 summary）
//   - og:image 引用 manifest 已声明的 /icons/icon-512.png
//     （用户后续补图标文件即可自动生效，无需改 metadata）
//   - 守护测试：__tests__/seo-metadata-guard.test.ts
const SITE_URL = "https://devpath-ai.pages.dev";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "devpath-ai — AI 驱动的开发者成长 OS",
    template: "%s · devpath-ai",
  },
  description: "告诉 AI 你想学什么，它给你拆知识树、排学习计划、生面试题、按遗忘曲线复习、追踪能量与情绪",
  applicationName: "devpath-ai",
  manifest: "/manifest.json",
  keywords: [
    "AI 学习",
    "开发者成长",
    "学习路径",
    "知识树",
    "面试题",
    "FSRS 间隔重复",
    "复习算法",
    "开发者 OS",
  ],
  authors: [{ name: "devpath-ai" }],
  creator: "devpath-ai",
  publisher: "devpath-ai",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "zh_CN",
    url: SITE_URL,
    siteName: "devpath-ai",
    title: "devpath-ai — AI 驱动的开发者成长 OS",
    description: "告诉 AI 你想学什么，它给你拆知识树、排学习计划、生面试题、按遗忘曲线复习、追踪能量与情绪",
    images: [
      {
        url: "/icons/og-image.png",
        width: 1200,
        height: 630,
        alt: "devpath-ai",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "devpath-ai — AI 驱动的开发者成长 OS",
    description: "告诉 AI 你想学什么，它给你拆知识树、排学习计划、生面试题、按遗忘曲线复习、追踪能量与情绪",
    images: ["/icons/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  icons: {
    // 2026-07-27 P0-1：补齐所有尺寸 + SVG 矢量版 + favicon
    icon: [
      { url: "/favicon.ico", sizes: "32x32" },
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
      { url: "/icons/icon.svg", type: "image/svg+xml" },
    ],
    apple: [
      { url: "/icons/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
    ],
  },
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
  // 2026-07-27 P1-4 nonce 模式因 @cloudflare/next-on-pages 限制回退：
  //   middleware 会让所有路由变 dynamic，而 @cloudflare/next-on-pages 要求
  //   dynamic 路由声明 runtime='edge'，但 /_not-found 是 Next.js 内置路由
  //   无法声明 → 部署失败。CSP nonce 模式留待迁移到 OpenNext adapter 后启用。
  //   详见 __tests__/csp-nonce-guard.test.ts 顶部说明。
  //   当前 CSP 由 next.config.js 静态注入（含 'unsafe-inline'），仍能拦截
  //   外部域脚本注入，仅允许同源 + inline 脚本。

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
