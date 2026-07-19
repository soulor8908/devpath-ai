// __tests__/ui-skeleton.test.tsx
// UI 体检报告 M5 修复：Skeleton 统一加载态组件

import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { Skeleton, SkeletonCard } from "../components/ui/Skeleton";

describe("ui/Skeleton", () => {
  it("variant=text（默认）渲染为行级骨架", () => {
    const { container } = render(<Skeleton />);
    const el = container.firstChild as HTMLElement;
    expect(el.className).toContain("bg-gray-200");
    expect(el.className).toContain("h-4");
    expect(el.className).toContain("w-full");
  });

  it("variant=rect 渲染为大块矩形（h-24）", () => {
    const { container } = render(<Skeleton variant="rect" />);
    const el = container.firstChild as HTMLElement;
    expect(el.className).toContain("h-24");
    expect(el.className).toContain("rounded-card");
  });

  it("variant=card 渲染为卡片矩形（h-32）", () => {
    const { container } = render(<Skeleton variant="card" />);
    const el = container.firstChild as HTMLElement;
    expect(el.className).toContain("h-32");
    expect(el.className).toContain("rounded-card");
  });

  it("variant=avatar 渲染为圆形（rounded-full）", () => {
    const { container } = render(<Skeleton variant="avatar" />);
    const el = container.firstChild as HTMLElement;
    expect(el.className).toContain("rounded-full");
    expect(el.className).toContain("h-10");
    expect(el.className).toContain("w-10");
  });

  it("width / height 覆盖默认尺寸", () => {
    const { container } = render(
      <Skeleton width="w-1/2" height="h-6" />,
    );
    const el = container.firstChild as HTMLElement;
    expect(el.className).toContain("w-1/2");
    expect(el.className).toContain("h-6");
  });

  it("rounded 覆盖默认圆角", () => {
    const { container } = render(
      <Skeleton variant="text" rounded="rounded-full" />,
    );
    const el = container.firstChild as HTMLElement;
    expect(el.className).toContain("rounded-full");
  });

  it("渲染 shimmer 光带（animate-shimmer）", () => {
    const { container } = render(<Skeleton />);
    const shimmer = container.querySelector(".animate-shimmer");
    expect(shimmer).not.toBeNull();
  });

  it("dark 模式自动切换背景", () => {
    const { container } = render(<Skeleton />);
    const el = container.firstChild as HTMLElement;
    expect(el.className).toContain("dark:bg-gray-700");
  });

  it("aria-hidden 标注 shimmer 光带（无障碍）", () => {
    const { container } = render(<Skeleton />);
    const shimmer = container.querySelector(".animate-shimmer") as HTMLElement;
    expect(shimmer).toHaveAttribute("aria-hidden");
  });
});

describe("ui/SkeletonCard", () => {
  it("渲染组合卡片骨架（avatar + 多行 text）", () => {
    const { container } = render(<SkeletonCard />);
    // avatar 圆形
    const avatar = container.querySelector(".rounded-full");
    expect(avatar).not.toBeNull();
    // 多行 text 骨架
    const texts = container.querySelectorAll(".h-4, .h-3");
    expect(texts.length).toBeGreaterThanOrEqual(2);
  });

  it("应用卡片边框 + 圆角", () => {
    const { container } = render(<SkeletonCard />);
    const card = container.firstChild as HTMLElement;
    expect(card.className).toContain("rounded-card");
    expect(card.className).toContain("border");
  });
});
