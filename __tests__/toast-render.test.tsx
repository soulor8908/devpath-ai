// __tests__/toast-render.test.tsx
// 真正的 React 渲染测试——验证 useSyncExternalStore 不会触发无限循环。
//
// 如果 getToasts() 返回不稳定引用（每次 state.slice() 新数组），
// React 会在渲染后检测到 getSnapshot 返回值变化，抛出：
//   "The result of getSnapshot should be cached to avoid an infinite loop"
//   或 "Maximum update depth exceeded"
//
// 本测试用 react-dom/client 的 createRoot 真实渲染组件，
// 能捕获 vitest 普通 unit test 无法捕获的 useSyncExternalStore 运行时问题。

import React from "react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { createRoot } from "react-dom/client";
import { act } from "react-dom/test-utils";
import { useToasts } from "@/lib/hooks/use-toast";
import { clearToasts, pushToast, getToasts } from "@/lib/toast";

// 每个测试前彻底清理：清空 toast + 清除所有 pending timer（避免跨测试泄漏）
beforeEach(() => {
  vi.clearAllTimers();
  clearToasts();
  // 确保清理后 state 确实为空
  if (getToasts().length > 0) {
    clearToasts();
  }
});

// 简单组件：使用 useToasts() 订阅 toast store
function TestComponent() {
  const toasts = useToasts();
  return (
    <div data-testid="toast-container">
      {toasts.map((t) => (
        <div key={t.id} data-testid={`toast-item-${t.id}`}>
          {t.message}
        </div>
      ))}
    </div>
  );
}

describe("useToasts React 渲染（useSyncExternalStore 无限循环检测）", () => {
  it("渲染时不触发 getSnapshot 无限循环", () => {
    clearToasts();

    const container = document.createElement("div");
    document.body.appendChild(container);
    const root = createRoot(container);

    // 如果 getToasts() 返回不稳定引用，
    // act() 会抛出 "Maximum update depth exceeded" 或
    // "The result of getSnapshot should be cached to avoid an infinite loop"
    expect(() => {
      act(() => {
        root.render(<TestComponent />);
      });
    }).not.toThrow();

    // 验证组件正常渲染
    expect(container.querySelector('[data-testid="toast-container"]')).toBeTruthy();

    // 清理
    act(() => {
      root.unmount();
    });
    container.remove();
    clearToasts();
  });

  it("pushToast 后组件正确更新且不触发无限循环", () => {
    // pushToast 前验证 state 为空
    expect(getToasts().length).toBe(0);

    const container = document.createElement("div");
    document.body.appendChild(container);
    const root = createRoot(container);

    act(() => {
      root.render(<TestComponent />);
    });

    // pushToast 前再次验证
    expect(getToasts().length).toBe(0);

    // pushToast 后组件应更新（用 0 duration 避免 setTimeout 泄漏到其他测试）
    act(() => {
      pushToast("info", "test message", 0);
    });

    // 验证 state 只有 1 个
    expect(getToasts().length).toBe(1);
    expect(container.querySelectorAll('[data-testid^="toast-item-"]')).toHaveLength(1);
    expect(container.textContent).toContain("test message");

    // 清理
    act(() => {
      root.unmount();
    });
    container.remove();
    clearToasts();
  });

  it("多次渲染（re-render）不触发无限循环", () => {
    clearToasts();

    const container = document.createElement("div");
    document.body.appendChild(container);
    const root = createRoot(container);

    // 首次渲染
    act(() => {
      root.render(<TestComponent />);
    });

    // 强制多次重渲染——如果 getSnapshot 引用不稳定，这里会死循环
    act(() => {
      root.render(<TestComponent />);
    });
    act(() => {
      root.render(<TestComponent />);
    });
    act(() => {
      root.render(<TestComponent />);
    });

    expect(container.querySelector('[data-testid="toast-container"]')).toBeTruthy();

    // 清理
    act(() => {
      root.unmount();
    });
    container.remove();
    clearToasts();
  });
});
