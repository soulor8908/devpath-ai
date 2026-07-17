// __tests__/toast-snapshot-stability.test.ts
// 验证 getToasts() 的引用稳定性——useSyncExternalStore 的 getSnapshot 核心契约。
//
// 之前的 bug：getToasts() 返回 state.slice()，每次调用产生新数组引用。
// useSyncExternalStore 在渲染期间多次调用 getSnapshot 并用 Object.is 比较：
//   - 新引用 → Object.is 为 false → React 误判 store 变了 → 无限重渲染（React #185）
//   - 稳定引用 → Object.is 为 true → React 正确识别无变化 → 不重渲染
//
// 本测试模拟 useSyncExternalStore 的行为：多次调用 getToasts() 验证引用相等。
// 如果回退到 state.slice() 实现，本测试会立即失败。

import { describe, it, expect, beforeEach } from "vitest";
import {
  getToasts,
  pushToast,
  dismissToast,
  clearToasts,
} from "../lib/toast";

// 每个测试前清空状态，避免相互影响
beforeEach(() => {
  clearToasts();
});

describe("getToasts 引用稳定性（useSyncExternalStore getSnapshot 契约）", () => {
  it("state 未变化时，多次调用返回同一引用", () => {
    const a = getToasts();
    const b = getToasts();
    const c = getToasts();
    // 必须是同一引用，否则 useSyncExternalStore 会无限重渲染
    expect(a).toBe(b);
    expect(b).toBe(c);
  });

  it("空 state 时多次调用返回同一引用", () => {
    const a = getToasts();
    const b = getToasts();
    expect(a).toBe(b);
    expect(a).toEqual([]);
  });

  it("pushToast 后引用变化（新数组），之后再次稳定", () => {
    const before = getToasts();
    pushToast("info", "test");
    const after1 = getToasts();
    const after2 = getToasts();

    // state 变化 → 新引用
    expect(before).not.toBe(after1);
    // 之后再次稳定
    expect(after1).toBe(after2);
    expect(after1).toHaveLength(1);
  });

  it("dismissToast 后引用变化，之后再次稳定", () => {
    const id = pushToast("info", "test");
    const before = getToasts();
    dismissToast(id);
    const after1 = getToasts();
    const after2 = getToasts();

    expect(before).not.toBe(after1);
    expect(after1).toBe(after2);
    expect(after1).toEqual([]);
  });

  it("clearToasts 后引用变化，之后再次稳定", () => {
    pushToast("info", "a");
    pushToast("info", "b");
    const before = getToasts();
    clearToasts();
    const after1 = getToasts();
    const after2 = getToasts();

    expect(before).not.toBe(after1);
    expect(after1).toBe(after2);
    expect(after1).toEqual([]);
  });

  it("clearToasts 空 state 时不改变引用（early return）", () => {
    const before = getToasts();
    clearToasts(); // state 已经为空，early return
    const after = getToasts();
    expect(before).toBe(after);
  });

  it("dismissToast 不存在的 id 时不改变引用", () => {
    const before = getToasts();
    dismissToast("nonexistent");
    const after = getToasts();
    expect(before).toBe(after);
  });
});

describe("useSyncExternalStore 契约模拟", () => {
  it("模拟渲染期间两次调用 getSnapshot：引用相等（无无限重渲染）", () => {
    // useSyncExternalStore 在渲染开始和结束时各调用一次 getSnapshot
    // 用 Object.is 比较——这正是 React 内部的判断逻辑
    pushToast("info", "render test");

    const snapshotAtRenderStart = getToasts();
    // ... 模拟渲染过程（无状态变更）...
    const snapshotAtRenderEnd = getToasts();

    // React 用 Object.is 判断是否需要重渲染
    // 如果为 false（引用不同）→ 无限循环
    // 如果为 true（引用相同）→ 正常
    expect(Object.is(snapshotAtRenderStart, snapshotAtRenderEnd)).toBe(true);
  });
});
