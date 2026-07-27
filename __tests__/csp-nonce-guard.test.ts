// __tests__/csp-nonce-guard.test.ts
// CSP nonce 模式守护测试（2026-07-27 P1-4）
//
// 历史根因：
//   站点体检发现 CSP 含 'unsafe-inline'，SecurityHeaders 评级被卡在 A（封顶），
//   Mozilla Observatory 预估仅 C+。inline script 包括：
//   - layout.tsx 主题探测脚本（避免 FOUC）
//   - layout.tsx SW 注册脚本
//   - Next.js RSC payload 脚本（框架固有）
//
// 闭环解法：
//   middleware.ts 生成 per-request nonce，覆盖 next.config.js 的 CSP
//   layout.tsx 读取 nonce，注入 <script nonce={nonce}>
//   Next.js 15 自动给 RSC payload 脚本加 nonce
//
// 检测策略：源码级别扫描
//   - 防止"误删 middleware.ts"
//   - 防止"middleware 不生成 nonce"
//   - 防止"middleware 不设置 CSP"
//   - 防止"layout.tsx 不读取 nonce"
//   - 防止"layout.tsx inline script 不带 nonce 属性"
//   - 防止"next.config.js CSP 退化（去掉 fallback）"

import { describe, it, expect } from "vitest";
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

const MIDDLEWARE_PATH = resolve(__dirname, "../middleware.ts");
const LAYOUT_PATH = resolve(__dirname, "../app/layout.tsx");

const MIDDLEWARE = existsSync(MIDDLEWARE_PATH)
  ? readFileSync(MIDDLEWARE_PATH, "utf-8")
  : "";
const LAYOUT = readFileSync(LAYOUT_PATH, "utf-8");

describe("middleware.ts CSP nonce 守护", () => {
  it("middleware.ts 必须存在（CSP nonce 注入入口）", () => {
    expect(existsSync(MIDDLEWARE_PATH)).toBe(true);
  });

  it("必须生成 nonce（crypto.getRandomValues 或 crypto.randomUUID）", () => {
    expect(MIDDLEWARE).toMatch(/crypto\.(getRandomValues|randomUUID)/);
  });

  it("必须设置 Content-Security-Policy 响应头（覆盖 next.config.js 的 CSP）", () => {
    expect(MIDDLEWARE).toContain("Content-Security-Policy");
    expect(MIDDLEWARE).toContain("response.headers.set");
  });

  it("CSP 必须含 'nonce-${nonce}'（不能用 'unsafe-inline'）", () => {
    expect(MIDDLEWARE).toMatch(/nonce-\$\{nonce\}/);
    // middleware 的 buildCSP 函数不能含 'unsafe-inline' 在 script-src
    // 注意：style-src 'unsafe-inline' 是允许的（Next.js 内联样式需要）
    const buildCSPMatch = MIDDLEWARE.match(
      /function buildCSP[\s\S]*?return\s*\[[\s\S]*?\]\.join/
    );
    expect(buildCSPMatch).not.toBeNull();
    const buildCSPBody = buildCSPMatch![0];
    // script-src 行不能含 unsafe-inline
    const scriptSrcLine = buildCSPBody
      .split("\n")
      .find((l) => l.includes("script-src"));
    expect(scriptSrcLine).toBeTruthy();
    expect(scriptSrcLine).not.toContain("unsafe-inline");
  });

  it("必须把 nonce 写入 request header 'x-nonce'（供 layout.tsx 读取）", () => {
    expect(MIDDLEWARE).toContain("x-nonce");
    expect(MIDDLEWARE).toContain("requestHeaders.set");
  });

  it("matcher 必须排除静态资源（_next/static / icons / sw.js 等）", () => {
    expect(MIDDLEWARE).toContain("matcher");
    expect(MIDDLEWARE).toContain("_next/static");
    expect(MIDDLEWARE).toContain("favicon.ico");
    expect(MIDDLEWARE).toContain("sw.js");
  });
});

describe("app/layout.tsx nonce 注入守护", () => {
  it("必须 import headers from next/headers（读取 middleware 注入的 nonce）", () => {
    expect(LAYOUT).toContain('from "next/headers"');
    expect(LAYOUT).toContain("headers");
  });

  it("RootLayout 必须是 async 函数（Next.js 15 headers() 返回 Promise）", () => {
    expect(LAYOUT).toMatch(/export default async function RootLayout/);
  });

  it("必须 await headers() 读取 nonce", () => {
    expect(LAYOUT).toMatch(/await headers\(\)/);
    expect(LAYOUT).toContain("x-nonce");
  });

  it("所有 inline <script> 必须带 nonce 属性（含 dangerouslySetInnerHTML 的）", () => {
    // 提取所有 <script 标签
    const scriptTags = LAYOUT.match(/<script[^>]*>/g) || [];
    expect(scriptTags.length).toBeGreaterThan(0);
    for (const tag of scriptTags) {
      // 每个 script 标签必须含 nonce={nonce}
      expect(tag).toContain("nonce={nonce}");
    }
  });
});
