// __tests__/ui-kbd.test.tsx
// UI 体检报告 m8 修复：Kbd 统一键盘按键样式

import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Kbd } from "../components/ui/Kbd";

describe("ui/Kbd", () => {
  it("渲染 <kbd> 元素", () => {
    render(<Kbd>Cmd</Kbd>);
    const kbd = screen.getByText("Cmd");
    expect(kbd.tagName).toBe("KBD");
  });

  it("默认 size=md 应用 h-6 + text-xs", () => {
    render(<Kbd>K</Kbd>);
    const kbd = screen.getByText("K");
    expect(kbd.className).toContain("h-6");
    expect(kbd.className).toContain("text-xs");
  });

  it("size=sm 应用 h-5 + text-2xs", () => {
    render(<Kbd size="sm">⌘</Kbd>);
    const kbd = screen.getByText("⌘");
    expect(kbd.className).toContain("h-5");
    expect(kbd.className).toContain("text-2xs");
  });

  it("size=lg 应用 h-7 + text-sm", () => {
    render(<Kbd size="lg">Enter</Kbd>);
    const kbd = screen.getByText("Enter");
    expect(kbd.className).toContain("h-7");
    expect(kbd.className).toContain("text-sm");
  });

  it("使用 mono 字体族", () => {
    render(<Kbd>K</Kbd>);
    const kbd = screen.getByText("K");
    expect(kbd.className).toContain("font-mono");
  });

  it("应用边框 + 阴影（模拟物理按键）", () => {
    render(<Kbd>K</Kbd>);
    const kbd = screen.getByText("K");
    expect(kbd.className).toContain("border");
    expect(kbd.className).toContain("shadow-sm");
  });

  it("dark 模式自动切换背景", () => {
    render(<Kbd>K</Kbd>);
    const kbd = screen.getByText("K");
    expect(kbd.className).toContain("dark:bg-gray-700");
  });

  it("min-width 确保窄字符（如 K）不会太窄", () => {
    render(<Kbd>K</Kbd>);
    const kbd = screen.getByText("K");
    expect(kbd.className).toContain("min-w-");
  });

  it("inline-flex 居中", () => {
    render(<Kbd>K</Kbd>);
    const kbd = screen.getByText("K");
    expect(kbd.className).toContain("inline-flex");
    expect(kbd.className).toContain("items-center");
    expect(kbd.className).toContain("justify-center");
  });

  it("className 透传", () => {
    render(<Kbd className="ml-2">K</Kbd>);
    const kbd = screen.getByText("K");
    expect(kbd.className).toContain("ml-2");
  });
});
