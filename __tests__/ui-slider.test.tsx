import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Slider } from "../components/ui/Slider";

describe("ui/Slider", () => {
  it("渲染 input[type=range] 并透传 min/max/step/value", () => {
    render(<Slider min={15} max={120} step={5} value={30} onChange={() => {}} aria-label="每日学习量" />);
    const input = screen.getByRole("slider");
    expect(input).toHaveAttribute("min", "15");
    expect(input).toHaveAttribute("max", "120");
    expect(input).toHaveAttribute("step", "5");
    expect(input).toHaveAttribute("value", "30");
    expect(input).toHaveAttribute("aria-label", "每日学习量");
  });

  it("onChange 透传数字值", () => {
    const onChange = vi.fn();
    render(<Slider min={0} max={10} step={1} value={5} onChange={onChange} />);
    const input = screen.getByRole("slider");
    fireEvent.change(input, { target: { value: "7" } });
    expect(onChange).toHaveBeenCalledWith(7);
  });

  it("disabled 状态禁用交互", () => {
    render(<Slider min={0} max={10} value={5} onChange={() => {}} disabled />);
    const input = screen.getByRole("slider");
    expect(input).toBeDisabled();
  });

  it("显示当前值标签（showValue=true）", () => {
    render(<Slider min={0} max={10} value={5} onChange={() => {}} showValue />);
    expect(screen.getByText("5")).toBeInTheDocument();
  });
});
