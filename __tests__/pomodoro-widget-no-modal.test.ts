// __tests__/pomodoro-widget-no-modal.test.ts
// 守护测试：PomodoroWidget 不得使用 large Modal，必须用 ring/card/hidden 三态浮窗
//
// 这是 docs/superpowers/specs/2026-07-23-ui-redesign-and-learning-page-rework-design.md
// 设计点 1 的"执法者"（卡帕西视角）：
//   - 测试即文档：番茄钟移除全屏 Modal 打断感，改为克制的浮窗工具
//   - CI 即评审：防止有人把 <Modal> 加回去、或把 WidgetMode 退回到 small/large 两态
//
// 守护内容：
//   1. components/PomodoroWidget.tsx 不导入 Modal（来自 @/components/ui）
//   2. 不渲染 <Modal> JSX 元素
//   3. WidgetMode 类型必须是三态 "hidden" | "ring" | "card"（不接受 "small"/"large"）
//   4. 必须使用 POMODORO_OPEN_EVENT（不是 deprecated 的 POMODORO_OPEN_LARGE_EVENT）
//
// 设计动机（乔布斯视角）：
//   - 全屏 Modal 打断用户流，与"专注工具应克制"的设计哲学冲突
//   - ring（56px 圆环）= 专注中无打扰，card（280px 浮窗）= idle/completed 承载表单
//   - hidden = 无 session 且用户未主动打开，不渲染任何浮窗（视觉零负担）

import { describe, it, expect } from "vitest";
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const ROOT = process.cwd();
const WIDGET_FILE = join(ROOT, "components", "PomodoroWidget.tsx");

function readWidgetSource(): string {
  if (!existsSync(WIDGET_FILE)) {
    throw new Error(`PomodoroWidget 不存在：${WIDGET_FILE}`);
  }
  return readFileSync(WIDGET_FILE, "utf-8");
}

describe("PomodoroWidget：移除 large Modal，三态浮窗", () => {
  const src = readWidgetSource();

  it("PomodoroWidget.tsx 文件存在且可读", () => {
    expect(src.length).toBeGreaterThan(0);
  });

  it("不从 @/components/ui 导入 Modal", () => {
    // 匹配 import { ... Modal ... } from "@/components/ui"
    const importRegex = /import\s*\{[^}]*\}\s*from\s*"@\/components\/ui"/g;
    const matches = src.match(importRegex) ?? [];
    for (const m of matches) {
      expect(m).not.toMatch(/\bModal\b/);
    }
  });

  it("不渲染 <Modal> JSX 元素", () => {
    // 匹配 <Modal ...> 或 <Modal/>（含多行）
    expect(src).not.toMatch(/<Modal\b[\s\S]*?>/);
    expect(src).not.toMatch(/<Modal\b[^>]*\/>/);
  });

  it("WidgetMode 类型必须为三态 hidden/ring/card", () => {
    // 匹配 type WidgetMode = "hidden" | "ring" | "card";
    const modeRegex = /type\s+WidgetMode\s*=\s*"hidden"\s*\|\s*"ring"\s*\|\s*"card"/;
    expect(src).toMatch(modeRegex);
  });

  it("不接受旧的 small/large 两态（防止回退）", () => {
    // 旧设计：type WidgetMode = "small" | "large"
    // 如果有人改回去，这条会失败
    expect(src).not.toMatch(/type\s+WidgetMode\s*=\s*"small"\s*\|\s*"large"/);
  });

  it("使用 POMODORO_OPEN_EVENT，不使用 deprecated 的 POMODORO_OPEN_LARGE_EVENT", () => {
    expect(src).toContain("POMODORO_OPEN_EVENT");
    expect(src).not.toContain("POMODORO_OPEN_LARGE_EVENT");
  });

  it("card 浮窗用 CardWidget 组件承载（不是直接渲染 PomodoroFullContent）", () => {
    expect(src).toMatch(/function\s+CardWidget\b/);
    expect(src).toMatch(/<CardWidget\b/);
  });

  it("ring 浮窗用 RingWidget 组件承载", () => {
    expect(src).toMatch(/function\s+RingWidget\b/);
    expect(src).toMatch(/<RingWidget\b/);
  });

  it("z-index 层级：浮窗 z-[80]，长按菜单 z-[100]", () => {
    // 与 docs/ui-design-system.md z-index 层级表一致
    expect(src).toContain("z-[80]");
    expect(src).toContain("z-[100]");
  });
});
