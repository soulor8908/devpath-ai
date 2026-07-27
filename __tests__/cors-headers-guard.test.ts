// __tests__/cors-headers-guard.test.ts
// CORS 响应头守护测试（2026-07-27 P1-5）
//
// 历史根因：
//   站点体检发现 HTML 页面响应含 access-control-allow-origin: *，
//   意味着任意第三方网站都能跨域 fetch 页面内容（虽无 Cookie 但暴露结构）。
//   代码层面 public/_headers 已收敛（2026-07-27 P2 #3）：
//     - 静态资源（/_next/static/* /icons/* /manifest.json /sw.js /data/*）→ ACAO:*
//     - HTML 页面与 /api/* → 不设置 ACAO（SOP 默认阻止跨域读）
//   实测 ACAO:* 仍出现，来自 Cloudflare dashboard 配置（需手动移除）。
//
// 闭环解法（代码层面）：
//   1. public/_headers 只对公开静态资源设 ACAO:*
//   2. 不对 /* 或 /api/* 设 ACAO
//   3. next.config.js 的 headers() 不设 ACAO
//   4. 本测试守护上述配置，防止未来回归
//
// 注意：CF dashboard 层面的 ACAO:* 无法用代码守护，需在 Cloudflare 控制台手动移除。
//       本测试确保代码层面不主动为页面/API 设置 ACAO。

import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const HEADERS_FILE = readFileSync(
  resolve(__dirname, "../public/_headers"),
  "utf-8",
);

const NEXT_CONFIG = readFileSync(
  resolve(__dirname, "../next.config.js"),
  "utf-8",
);

describe("public/_headers CORS 收敛守护", () => {
  it("_headers 文件必须存在", () => {
    // readFileSync 不抛异常即存在
    expect(HEADERS_FILE.length).toBeGreaterThan(0);
  });

  it("静态资源允许 ACAO:*（/_next/static /icons /manifest.json /sw.js /data）", () => {
    // 这些是公开资源，跨域加载是正常需求
    expect(HEADERS_FILE).toContain("/_next/static/*");
    expect(HEADERS_FILE).toContain("/icons/*");
    expect(HEADERS_FILE).toContain("/manifest.json");
    expect(HEADERS_FILE).toContain("/sw.js");
  });

  it("不能对 /* 设置 Access-Control-Allow-Origin（会暴露所有页面）", () => {
    // 提取所有路径块，检查 /* 块不含 ACAO
    const lines = HEADERS_FILE.split("\n");
    let inWildcardBlock = false;
    for (const line of lines) {
      // 路径行：不以空格开头，非空，非注释
      if (line && !line.startsWith(" ") && !line.startsWith("#")) {
        inWildcardBlock = line.trim() === "/*";
      } else if (inWildcardBlock && line.startsWith("  ")) {
        // 在 /* 块内，不能有 ACAO
        expect(line).not.toMatch(/Access-Control-Allow-Origin/i);
      }
    }
  });

  it("不能对 /api/* 设置 Access-Control-Allow-Origin（API 用 session 鉴权，不需跨域）", () => {
    const lines = HEADERS_FILE.split("\n");
    let inApiBlock = false;
    for (const line of lines) {
      if (line && !line.startsWith(" ") && !line.startsWith("#")) {
        inApiBlock = line.trim().startsWith("/api");
      } else if (inApiBlock && line.startsWith("  ")) {
        expect(line).not.toMatch(/Access-Control-Allow-Origin/i);
      }
    }
  });
});

describe("next.config.js CORS 守护", () => {
  it("next.config.js headers() 不能设置 Access-Control-Allow-Origin", () => {
    // next.config.js 的 headers() 只设置安全头（CSP/HSTS/X-Frame-Options 等）
    // CORS 由 public/_headers 管理，避免两处配置冲突
    expect(NEXT_CONFIG).not.toMatch(/Access-Control-Allow-Origin/i);
    expect(NEXT_CONFIG).not.toMatch(/access-control-allow-origin/i);
  });
});
