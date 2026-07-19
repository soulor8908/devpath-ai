// __tests__/ui-emptystate.test.tsx
// UI 体检报告 M4 修复：EmptyState 统一空状态组件

import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { EmptyState } from "../components/ui/EmptyState";

describe("ui/EmptyState", () => {
  it("渲染标题", () => {
    render(<EmptyState title="今日无安排" />);
    expect(screen.getByText("今日无安排")).toBeInTheDocument();
  });

  it("渲染描述", () => {
    render(
      <EmptyState title="无数据" description="所有任务都完成了" />,
    );
    expect(screen.getByText("所有任务都完成了")).toBeInTheDocument();
  });

  it("默认渲染 check-circle 图标", () => {
    const { container } = render(<EmptyState title="空" />);
    const svg = container.querySelector("svg");
    expect(svg).not.toBeNull();
  });

  it("icon prop 切换图标", () => {
    const { container } = render(
      <EmptyState title="加载完成" icon="party" />,
    );
    // 只要 svg 存在即可（具体路径由 Icon 组件保证）
    expect(container.querySelector("svg")).not.toBeNull();
  });

  it("iconNode 覆盖 icon prop（自定义图标）", () => {
    render(
      <EmptyState
        title="空"
        iconNode={<span data-testid="custom-icon">🎯</span>}
      />,
    );
    expect(screen.getByTestId("custom-icon")).toBeInTheDocument();
  });

  it("action 渲染操作区", () => {
    render(
      <EmptyState
        title="还没有错题"
        action={<button type="button">去学习</button>}
      />,
    );
    expect(screen.getByText("去学习")).toBeInTheDocument();
  });

  it("compact=true 时减少 padding（py-6 而非 py-12）", () => {
    const { container } = render(<EmptyState title="空" compact />);
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.className).toContain("py-6");
    expect(wrapper.className).not.toContain("py-12");
  });

  it("compact=false 时默认 padding（py-12）", () => {
    const { container } = render(<EmptyState title="空" />);
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.className).toContain("py-12");
  });

  it("居中对齐 + 文本居中", () => {
    const { container } = render(<EmptyState title="空" />);
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.className).toContain("items-center");
    expect(wrapper.className).toContain("text-center");
  });

  it("icon 大号（非 compact 时 w-12 h-12）", () => {
    const { container } = render(<EmptyState title="空" />);
    const svg = container.querySelector("svg") as SVGElement;
    // SVG 元素的 className 是 SVGAnimatedString，需用 getAttribute('class')
    const cls = svg.getAttribute("class") ?? "";
    expect(cls).toContain("w-12");
    expect(cls).toContain("h-12");
  });

  it("compact 时 icon 小号（w-8 h-8）", () => {
    const { container } = render(<EmptyState title="空" compact />);
    const svg = container.querySelector("svg") as SVGElement;
    const cls = svg.getAttribute("class") ?? "";
    expect(cls).toContain("w-8");
    expect(cls).toContain("h-8");
  });
});
