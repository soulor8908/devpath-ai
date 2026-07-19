import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Button } from "../components/ui/Button";

describe("ui/Button 扩展", () => {
  it("iconOnly=true 时渲染方形按钮且无 children 文本", () => {
    render(<Button iconOnly aria-label="关闭"><span>×</span></Button>);
    const btn = screen.getByRole("button");
    expect(btn).toHaveAttribute("aria-label", "关闭");
    // iconOnly 用固定 padding p-2，不再用 px-/py- 的尺寸 class
    expect(btn.className).toContain("p-2");
  });

  it("variant=link 时渲染为文字链接样式", () => {
    render(<Button variant="link">清除筛选</Button>);
    const btn = screen.getByRole("button");
    expect(btn.className).toContain("text-blue");
    expect(btn.className).toContain("underline");
  });

  it("variant=outline 时渲染为边框样式", () => {
    render(<Button variant="outline">取消</Button>);
    const btn = screen.getByRole("button");
    expect(btn.className).toContain("border");
  });

  it("iconOnly + size=sm 时 padding 更小", () => {
    render(<Button iconOnly size="sm" aria-label="删除"><span>×</span></Button>);
    const btn = screen.getByRole("button");
    expect(btn.className).toContain("p-1");
  });

  it("iconOnly + size=lg 时 padding 最大", () => {
    render(<Button iconOnly size="lg" aria-label="菜单"><span>≡</span></Button>);
    const btn = screen.getByRole("button");
    expect(btn.className).toContain("p-2.5");
  });

  it("block=true 时 iconOnly 不应强制 w-full（避免图标按钮被拉宽）", () => {
    render(<Button iconOnly block aria-label="关闭"><span>×</span></Button>);
    const btn = screen.getByRole("button");
    expect(btn.className).not.toContain("w-full");
  });

  it("原有 variant=primary 仍然工作（向后兼容）", () => {
    render(<Button variant="primary">提交</Button>);
    const btn = screen.getByRole("button");
    expect(btn.className).toContain("bg-blue-600");
  });
});
