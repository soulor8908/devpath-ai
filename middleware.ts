// middleware.ts
// Next.js Middleware：CSP nonce 注入（2026-07-27 P1-4）
//
// 历史根因（卡帕西视角）：
//   站点体检发现 CSP 含 'unsafe-inline'，SecurityHeaders 评级被卡在 A（封顶），
//   Mozilla Observatory 预估仅 C+。next.config.js 注释已说明"nonces 是后续演进方向"。
//   inline script 来源：
//     1. layout.tsx 主题探测脚本（避免 FOUC，必须首屏前同步执行）
//     2. layout.tsx Service Worker 注册脚本
//     3. Next.js 15 RSC payload 脚本（self.__next_f.push，框架固有）
//
// 闭环解法：
//   1. middleware 生成 per-request nonce（crypto.randomUUID，edge runtime 原生支持）
//   2. 通过 request header 'x-nonce' 传递给 Server Component
//   3. layout.tsx 用 headers() 读取 nonce，注入 <script nonce={nonce}>
//   4. Next.js 15 检测到 layout 中有 nonce script，自动给 RSC payload 脚本加 nonce
//   5. middleware 设置 CSP（含 'nonce-xxx'，去掉 'unsafe-inline'），覆盖 next.config.js 的 CSP
//   6. next.config.js 保留 CSP（含 'unsafe-inline'）作为 fallback——若 middleware 异常，至少有基础防护
//
// 兼容性：
//   - @cloudflare/next-on-pages 1.13+ 支持 Next.js middleware（edge runtime）
//   - crypto.randomUUID() 在 edge runtime 可用（Web Crypto API）
//   - NextResponse.next() 在 edge runtime 可用
//
// 守护测试：__tests__/security-headers-guard.test.ts 更新为断言 nonce 模式

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * 生成 CSP nonce（base64 编码的 16 字节随机数）
 * 用 crypto.getRandomValues 而非 randomUUID，符合 CSP nonce 标准（不可预测）
 */
function generateNonce(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  // base64 编码（edge runtime 原生支持 btoa）
  return btoa(String.fromCharCode(...bytes));
}

/**
 * 构建含 nonce 的 CSP（去掉 'unsafe-inline'）
 * 与 next.config.js 的 CSP 保持一致，仅 script-src 不同
 */
function buildCSP(nonce: string): string {
  return [
    `default-src 'self'`,
    `script-src 'self' 'nonce-${nonce}'`,
    `style-src 'self' 'unsafe-inline'`,
    `img-src 'self' data: https:`,
    `font-src 'self' data:`,
    `connect-src 'self' https:`,
    `frame-ancestors 'none'`,
    `base-uri 'self'`,
    `form-action 'self'`,
    `object-src 'none'`,
  ].join("; ");
}

export function middleware(request: NextRequest) {
  const nonce = generateNonce();

  // 把 nonce 写入 request header，让 Server Component 通过 headers() 读取
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);

  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  // 覆盖 next.config.js 的 CSP（middleware 优先级更高）
  // 去掉 'unsafe-inline'，改用 per-request nonce
  response.headers.set("Content-Security-Policy", buildCSP(nonce));

  return response;
}

/**
 * Matcher：匹配所有路由，排除静态资源
 * - /_next/static/* —— Next.js 静态资源（JS/CSS chunk），无需 CSP nonce
 * - /_next/image/* —— 图片优化
 * - /favicon.ico —— favicon
 * - /icons/* —— PWA 图标
 * - /manifest.json —— PWA manifest
 * - /sw.js —— Service Worker
 */
export const config = {
  matcher: [
    /*
     * 匹配所有路径，排除：
     * - api 路由（API 自己处理响应头）
     * - _next/static（静态资源）
     * - _next/image（图片优化）
     * - favicon.ico / icons/* / manifest.json / sw.js（静态文件）
     */
    "/((?!api|_next/static|_next/image|favicon.ico|icons|manifest.json|sw.js).*)",
  ],
};
