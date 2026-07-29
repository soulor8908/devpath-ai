// __tests__/csp-nonce-guard.test.ts
// CSP nonce 模式守护测试（2026-07-27 P1-4）
//
// 完整决策记录详见 docs/adr/0001-csp-nonce-next-on-pages-limitation.md
// 摘要：nonce 模式因 @cloudflare/next-on-pages 限制（middleware 让 dynamic routes
// 必须声明 edge runtime，/_not-found 无法声明）不可启用，当前保留 'unsafe-inline'。
//
// 检测策略：源码级别扫描，防止"误删 fallback CSP"或"误加回退的 middleware"
//   - middleware.ts 必须不存在（nonce 模式未启用前，防止误启用导致白屏）
//   - next.config.js 必须保留 CSP fallback（含 'unsafe-inline'）
//   - layout.tsx inline script 不能带 nonce 属性（nonce 来源未实现）

import { describe, it, expect } from "vitest";
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

const MIDDLEWARE_PATH = resolve(__dirname, "../middleware.ts");
const LAYOUT_PATH = resolve(__dirname, "../app/layout.tsx");
const NEXT_CONFIG_PATH = resolve(__dirname, "../next.config.js");

const LAYOUT = readFileSync(LAYOUT_PATH, "utf-8");
const NEXT_CONFIG = readFileSync(NEXT_CONFIG_PATH, "utf-8");

describe("CSP nonce 模式现状守护（OpenNext 迁移已完成，nonce 模式待启用）", () => {
  it("middleware.ts 必须不存在（nonce 模式未启用前，防止误启用导致白屏）", () => {
    // 2026-07-28 OpenNext 迁移已完成，此限制可解除
    // 启用 nonce 模式时：创建 middleware.ts 后删除此断言
    expect(existsSync(MIDDLEWARE_PATH)).toBe(false);
  });

  it("next.config.js 必须保留 CSP fallback（含 'unsafe-inline'）", () => {
    // 防止误删 CSP 配置导致无任何脚本保护
    // 2026-07-28 OpenNext 迁移后可移除 unsafe-inline（启用 nonce 模式时）
    expect(NEXT_CONFIG).toContain("Content-Security-Policy");
    expect(NEXT_CONFIG).toContain("script-src");
    // nonce 模式未启用前，'unsafe-inline' 是必要的（inline script 无 nonce）
    expect(NEXT_CONFIG).toContain("unsafe-inline");
  });

  it("layout.tsx inline script 不能带 nonce 属性（nonce 来源已移除）", () => {
    // 防止残留 nonce={nonce} 引用，会导致 build 失败（nonce 未定义）
    const scriptTags = LAYOUT.match(/<script[^>]*>/g) || [];
    expect(scriptTags.length).toBeGreaterThan(0);
    for (const tag of scriptTags) {
      expect(tag).not.toContain("nonce={nonce}");
      expect(tag).not.toMatch(/nonce=\{[^}]*\}/);
    }
  });

  it("layout.tsx RootLayout 不能是 async 函数（不再 await headers）", () => {
    // async + await headers() 会让 layout 变 dynamic，触发 adapter 限制
    expect(LAYOUT).not.toMatch(/export default async function RootLayout/);
    expect(LAYOUT).toMatch(/export default function RootLayout/);
  });

  it("layout.tsx 不能 import headers from next/headers", () => {
    // 防止残留 import，typecheck 会报 unused 但更明确地断言意图
    expect(LAYOUT).not.toMatch(/from\s+["']next\/headers["']/);
  });
});

describe("未来启用 nonce 模式的检查清单（OpenNext 迁移已完成，可启用）", () => {
  // 2026-07-28 OpenNext 迁移已完成，下列步骤可执行：
  //   1. 创建 middleware.ts（生成 nonce + 设置 CSP，移除 unsafe-inline）
  //   2. layout.tsx 改 async + await headers() + 注入 nonce
  //   3. 反转上方断言（middleware.ts 必须存在 / unsafe-inline 不再出现）
  //   4. 线上验证 CSP 生效 + 无白屏
  it("TODO: 启用 nonce 模式后反转上方断言", () => {
    // 当前不强制，作为文档提醒
    expect(true).toBe(true);
  });
});
