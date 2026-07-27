// __tests__/pre-push-hook-guard.test.ts
// pre-push hook 守护测试（2026-07-27 闭环修复）
//
// 历史根因：
//   2026-07-25~27 连续 3 次"代码 push 后 Cloudflare Pages 部署失败"。
//   旧 pre-push hook 只跑 `lint + typecheck`，让 build/测试错误漏到 main 分支。
//   typecheck 通过 ≠ build 通过（Next.js 15 Server Component 限制不会触发 tsc 错误）。
//
// 闭环解法：
//   pre-push hook 改为跑 4 层门禁：lint + typecheck + test + build。
//   本测试守护 hook 内容，防止未来被误删/降级回只跑 lint+typecheck。
//
// 检测策略：源码级别扫描 .husky/pre-push 文件
//   - 防止"误删整个 hook"的最常见失效模式
//   - 防止"降级回旧版只跑 lint+typecheck"的退化
//   - 测试即文档：每条断言说明一个必须存在的门禁层

import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const HOOK = readFileSync(resolve(__dirname, "../.husky/pre-push"), "utf-8");

describe("pre-push hook 4 层门禁守护", () => {
  it("门禁 1：必须跑 lint（捕获 ESLint 错误）", () => {
    expect(HOOK).toContain("npm run lint");
  });

  it("门禁 2：必须跑 typecheck（捕获 TypeScript 类型错误）", () => {
    expect(HOOK).toContain("npm run typecheck");
  });

  it("门禁 3：必须跑 test（捕获测试失败，旧 hook 遗漏的关键层）", () => {
    expect(HOOK).toContain("npm test");
  });

  it("门禁 4：必须跑 build（捕获 Next.js 构建错误，旧 hook 遗漏的关键层）", () => {
    expect(HOOK).toContain("npm run build");
  });

  it("不能退化回旧版（只跑 lint + typecheck）", () => {
    // 旧版只有一行：npm run lint && npm run typecheck
    // 新版必须有 4 层门禁
    const oldVersionPattern = /^npm run lint && npm run typecheck\s*$/m;
    expect(oldVersionPattern.test(HOOK)).toBe(false);
  });

  it("必须有 set -e（任一门禁失败立即终止，不继续 push）", () => {
    expect(HOOK).toContain("set -e");
  });

  it("必须有跳过指引（紧急 hotfix 用 --no-verify）", () => {
    // 用户需要知道紧急情况下可以跳过，否则可能直接改 hook
    expect(HOOK).toContain("--no-verify");
  });
});
