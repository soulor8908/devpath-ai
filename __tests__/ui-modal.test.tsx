// __tests__/ui-modal.test.tsx
// UI 体检报告 C5/m5 修复：Modal 统一模态组件

import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Modal } from "../components/ui/Modal";

describe("ui/Modal", () => {
  it("open=false 时不渲染", () => {
    const { container } = render(
      <Modal open={false} onClose={() => {}} title="标题" />,
    );
    expect(container.firstChild).toBeNull();
  });

  it("open=true 时渲染 dialog 并展示标题", () => {
    render(<Modal open onClose={() => {}} title="确认删除" />);
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText("确认删除")).toBeInTheDocument();
  });

  it("展示描述文字", () => {
    render(
      <Modal open onClose={() => {}} title="标题" description="此操作不可撤销" />,
    );
    expect(screen.getByText("此操作不可撤销")).toBeInTheDocument();
  });

  it("点击遮罩触发 onClose（默认）", () => {
    const onClose = vi.fn();
    render(<Modal open onClose={onClose} title="标题" />);
    // 遮罩是 dialog 容器的第一个子元素
    const backdrop = screen.getByRole("presentation").firstChild as HTMLElement;
    fireEvent.click(backdrop);
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("closeOnBackdropClick=false 时点击遮罩不关闭", () => {
    const onClose = vi.fn();
    render(
      <Modal open onClose={onClose} title="标题" closeOnBackdropClick={false} />,
    );
    const backdrop = screen.getByRole("presentation").firstChild as HTMLElement;
    fireEvent.click(backdrop);
    expect(onClose).not.toHaveBeenCalled();
  });

  it("ESC 键触发 onClose（默认）", () => {
    const onClose = vi.fn();
    render(<Modal open onClose={onClose} title="标题" />);
    fireEvent.keyDown(document, { key: "Escape" });
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("closeOnEsc=false 时 ESC 不关闭", () => {
    const onClose = vi.fn();
    render(
      <Modal open onClose={onClose} title="标题" closeOnEsc={false} />,
    );
    fireEvent.keyDown(document, { key: "Escape" });
    expect(onClose).not.toHaveBeenCalled();
  });

  it("showCloseButton=true 时渲染右上角关闭按钮", () => {
    const onClose = vi.fn();
    render(<Modal open onClose={onClose} title="标题" showCloseButton />);
    const closeBtn = screen.getByLabelText("关闭");
    fireEvent.click(closeBtn);
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("showCloseButton=false 时不渲染关闭按钮", () => {
    render(
      <Modal open onClose={() => {}} title="标题" showCloseButton={false} />,
    );
    expect(screen.queryByLabelText("关闭")).toBeNull();
  });

  it("footer 渲染底部操作区", () => {
    render(
      <Modal
        open
        onClose={() => {}}
        title="标题"
        footer={<button>确认</button>}
      />,
    );
    expect(screen.getByText("确认")).toBeInTheDocument();
  });

  it("children 渲染到主体区", () => {
    render(
      <Modal open onClose={() => {}} title="标题">
        正文内容
      </Modal>,
    );
    expect(screen.getByText("正文内容")).toBeInTheDocument();
  });

  it("size=sm/md/lg 应用对应 max-width", () => {
    const { rerender } = render(
      <Modal open onClose={() => {}} title="t" size="sm" />,
    );
    expect(screen.getByRole("dialog").className).toContain("max-w-sm");

    rerender(<Modal open onClose={() => {}} title="t" size="md" />);
    expect(screen.getByRole("dialog").className).toContain("max-w-md");

    rerender(<Modal open onClose={() => {}} title="t" size="lg" />);
    expect(screen.getByRole("dialog").className).toContain("max-w-lg");
  });

  it("aria-modal=true 满足 WCAG", () => {
    render(<Modal open onClose={() => {}} title="标题" />);
    expect(screen.getByRole("dialog")).toHaveAttribute("aria-modal", "true");
  });
});
