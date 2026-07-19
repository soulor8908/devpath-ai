// __tests__/ui-linkbutton.test.tsx
// UI 体检报告 M3 修复：LinkButton 统一"Link 当按钮"组件
//
// 护栏：no-native-form-elements.test.ts 确保组件库外无原生 <button>。
// LinkButton 渲染 <a>，不会触发该护栏。

import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { LinkButton } from "../components/ui/LinkButton";

describe("ui/LinkButton", () => {
  it("渲染为 <a> 链接，href 正确", () => {
    render(
      <LinkButton href="/learn" variant="primary">
        开始学习
      </LinkButton>,
    );
    const link = screen.getByRole("link", { name: "开始学习" });
    expect(link.tagName).toBe("A");
    expect(link).toHaveAttribute("href", "/learn");
  });

  it("variant=primary 时共享 Button 的 bg-blue-600 样式", () => {
    render(
      <LinkButton href="/x" variant="primary">
        主操作
      </LinkButton>,
    );
    const link = screen.getByRole("link");
    expect(link.className).toContain("bg-blue-600");
    expect(link.className).toContain("text-white");
  });

  it("variant=outline 时共享 Button 的边框样式", () => {
    render(
      <LinkButton href="/x" variant="outline" size="sm">
        查看
      </LinkButton>,
    );
    const link = screen.getByRole("link");
    expect(link.className).toContain("border");
    expect(link.className).toContain("px-2.5");
  });

  it("size=lg 时使用大号 padding", () => {
    render(
      <LinkButton href="/x" size="lg">
        大按钮
      </LinkButton>,
    );
    const link = screen.getByRole("link");
    expect(link.className).toContain("px-5 py-2.5");
  });

  it("block=true 时占满宽度（非 iconOnly）", () => {
    render(
      <LinkButton href="/x" block>
        占满
      </LinkButton>,
    );
    const link = screen.getByRole("link");
    expect(link.className).toContain("w-full");
  });

  it("block=true 时 iconOnly 不应强制 w-full（与 Button 行为一致）", () => {
    render(
      <LinkButton href="/x" block iconOnly aria-label="返回">
        <span>←</span>
      </LinkButton>,
    );
    const link = screen.getByRole("link");
    expect(link.className).not.toContain("w-full");
  });

  it("iconOnly 时 padding 收窄为正方形", () => {
    render(
      <LinkButton href="/x" iconOnly aria-label="设置">
        <span>⚙</span>
      </LinkButton>,
    );
    const link = screen.getByRole("link");
    expect(link.className).toContain("p-2");
  });

  it("rightIcon 默认不渲染（避免每个 link 都带箭头）", () => {
    render(<LinkButton href="/x">查看</LinkButton>);
    // rightIcon 默认 null，不应自动加 chevron-right
    // 通过检查 children 是否只有文本（无额外 svg）来验证
    const link = screen.getByRole("link");
    expect(link.textContent).toBe("查看");
  });

  it("rightIcon='chevron-right' 时渲染右侧箭头", () => {
    render(
      <LinkButton href="/x" rightIcon="chevron-right">
        查看更多
      </LinkButton>,
    );
    const link = screen.getByRole("link");
    // chevron-right 会渲染一个 svg
    expect(link.querySelector("svg")).not.toBeNull();
  });

  it("支持 onClick 透传", () => {
    const onClick = vi.fn();
    render(
      <LinkButton href="/x" onClick={onClick}>
        点我
      </LinkButton>,
    );
    fireEvent.click(screen.getByRole("link"));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it("focus-visible 焦点环样式存在（与 Button 一致）", () => {
    render(<LinkButton href="/x">焦点</LinkButton>);
    const link = screen.getByRole("link");
    expect(link.className).toContain("focus-visible:ring-2");
    expect(link.className).toContain("ring-blue-500/40");
  });
});
