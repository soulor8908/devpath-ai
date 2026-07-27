// __tests__/security-headers-guard.test.ts
// 安全响应头守护测试（2026-07-27 P0 安全加固）
//
// 历史根因：
//   next.config.js 未配置 headers()，CF Pages 也不默认下发自定义安全头，
//   导致 CSP / HSTS / X-Frame-Options / Permissions-Policy 全部缺失，
//   站点暴露在点击劫持、MIME 嗅探、协议降级、XSS 等风险下。
//
// 闭环解法：
//   next.config.js 的 headers() 返回四件套 + 额外加固头。
//   本测试守护配置内容，防止未来被误删或弱化（如把 CSP 改回 'unsafe-eval'）。
//
// 检测策略：源码级别扫描 next.config.js
//   - 防止"误删整个 headers() 配置"
//   - 防止"降级 CSP"（去掉 frame-ancestors、放宽 script-src 到 'unsafe-eval'）
//   - 防止"误删 HSTS / X-Frame-Options / Permissions-Policy 任一项"
//   - 测试即文档：每条断言说明一个必须存在的安全头

import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const NEXT_CONFIG = readFileSync(
  resolve(__dirname, "../next.config.js"),
  "utf-8",
);

describe("next.config.js 安全响应头四件套守护", () => {
  it("必须配置 headers()（不能整体缺失）", () => {
    expect(NEXT_CONFIG).toContain("async headers()");
    expect(NEXT_CONFIG).toContain("return [");
  });

  it("CSP：必须有 Content-Security-Policy", () => {
    expect(NEXT_CONFIG).toContain("Content-Security-Policy");
    // 关键指令不可缺
    expect(NEXT_CONFIG).toContain("default-src 'self'");
    expect(NEXT_CONFIG).toContain("frame-ancestors 'none'");
    expect(NEXT_CONFIG).toContain("object-src 'none'");
    expect(NEXT_CONFIG).toContain("base-uri 'self'");
  });

  it("CSP：不允许退化到 'unsafe-eval'（XSS 风险）", () => {
    expect(NEXT_CONFIG).not.toContain("unsafe-eval");
  });

  it("HSTS：必须有 Strict-Transport-Security（CF Pages 全站 HTTPS，安全）", () => {
    expect(NEXT_CONFIG).toContain("Strict-Transport-Security");
    // 至少 max-age 一年
    expect(NEXT_CONFIG).toContain("max-age=63072000");
    expect(NEXT_CONFIG).toContain("includeSubDomains");
  });

  it("X-Frame-Options：必须 DENY（点击劫持防御，与 CSP frame-ancestors 互为兜底）", () => {
    expect(NEXT_CONFIG).toContain("X-Frame-Options");
    expect(NEXT_CONFIG).toContain("DENY");
  });

  it("Permissions-Policy：必须收敛摄像头/麦克风/地理位置（PWA 无需这些能力）", () => {
    expect(NEXT_CONFIG).toContain("Permissions-Policy");
    expect(NEXT_CONFIG).toContain("camera=()");
    expect(NEXT_CONFIG).toContain("microphone=()");
    expect(NEXT_CONFIG).toContain("geolocation=()");
  });

  it("X-Content-Type-Options：必须 nosniff（防 MIME 嗅探）", () => {
    expect(NEXT_CONFIG).toContain("X-Content-Type-Options");
    expect(NEXT_CONFIG).toContain("nosniff");
  });

  it("Referrer-Policy：必须配置（默认 no-referrer-when-downgrade 会泄露到非 HTTPS）", () => {
    expect(NEXT_CONFIG).toContain("Referrer-Policy");
    expect(NEXT_CONFIG).toMatch(/strict-origin-when-cross-origin|no-referrer/);
  });
});
