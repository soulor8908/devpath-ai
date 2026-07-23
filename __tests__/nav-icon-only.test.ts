// __tests__/nav-icon-only.test.ts
// 守护测试：底部导航栏必须纯图标 + 44px 最小触控区
//
// 这是 docs/ui-design-system.md 与 docs/superpowers/specs/2026-07-23-ui-redesign-and-learning-page-rework-design.md
// 设计点 3 的"执法者"（卡帕西视角）：
//   - 测试即文档：底部导航去文字、保留图标、min-h-[44px]（iOS HIG 最小触控区）
//   - CI 即评审：防止有人手贱把 label span 加回去
//
// 守护内容：
//   1. components/Nav.tsx 每个 <Link> 内不渲染 <span> 文字 label
//      （label 仅作 aria-label 使用，无障碍不变，但视觉上不再显示）
//   2. 每个 <Link> 必须含 min-h-[44px]（触控区合规）
//   3. 不允许出现 min-h-[48px]（旧值，已废弃）
//
// 设计动机（乔布斯视角）：
//   - 纯图标导航更克制、视觉更轻
//   - 3 个 Tab 都是高频常用功能，图标足以识别，文字是冗余噪音
//   - 44px 触控区满足 iOS HIG / WCAG 2.5.5 最小触控区要求

import { describe, it, expect } from "vitest";
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const ROOT = process.cwd();
const NAV_FILE = join(ROOT, "components", "Nav.tsx");

function readNavSource(): string {
  if (!existsSync(NAV_FILE)) {
    throw new Error(`Nav 组件不存在：${NAV_FILE}`);
  }
  return readFileSync(NAV_FILE, "utf-8");
}

describe("底部导航栏：纯图标 + 44px 触控区", () => {
  const src = readNavSource();

  it("Nav.tsx 文件存在且可读", () => {
    expect(src.length).toBeGreaterThan(0);
  });

  it("每个 <Link> 内不渲染 <span> 子元素（纯图标导航）", () => {
    // 提取所有 <Link ...>...</Link> 块
    const linkBlockRegex = /<Link[\s\S]*?>([\s\S]*?)<\/Link>/g;
    const blocks: string[] = [];
    let m: RegExpExecArray | null;
    while ((m = linkBlockRegex.exec(src)) !== null) {
      blocks.push(m[1]);
    }
    expect(blocks.length).toBeGreaterThan(0);
    for (const block of blocks) {
      // 允许 <Icon ... />，但不允许 <span ...>label</span>
      expect(block).not.toMatch(/<span\b/);
    }
  });

  it("每个 <Link> 含 min-h-[44px]（iOS HIG 最小触控区）", () => {
    const linkRegex = /<Link[\s\S]*?\/>/g;
    const selfClosing = src.match(linkRegex) ?? [];
    const linkBlockRegex = /<Link[\s\S]*?>([\s\S]*?)<\/Link>/g;
    const paired: string[] = [];
    let m: RegExpExecArray | null;
    while ((m = linkBlockRegex.exec(src)) !== null) {
      paired.push(src.slice(m.index, m.index + m[0].length));
    }
    const allLinks = [...selfClosing, ...paired];
    expect(allLinks.length).toBeGreaterThan(0);
    for (const link of allLinks) {
      expect(link).toContain("min-h-[44px]");
    }
  });

  it("不再使用旧的 min-h-[48px]（已降级到 44px）", () => {
    expect(src).not.toContain("min-h-[48px]");
  });

  it("aria-label 保留（无障碍不变）", () => {
    // 每个 Link 必须有 aria-label，确保去掉文字后仍可被屏幕阅读器识别
    const linkRegex = /<Link\b/g;
    const linkCount = (src.match(linkRegex) ?? []).length;
    const ariaLabelCount = (src.match(/aria-label=/g) ?? []).length;
    expect(linkCount).toBeGreaterThan(0);
    expect(ariaLabelCount).toBeGreaterThanOrEqual(linkCount);
  });
});
