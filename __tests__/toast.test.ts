// __tests__/toast.test.ts
// 测试 toast 状态管理 + confirmDialog

import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  pushToast,
  dismissToast,
  clearToasts,
  subscribeToasts,
  getToasts,
  toast,
} from "../lib/toast";
import { confirmDialog } from "../lib/confirm-dialog";

beforeEach(() => {
  clearToasts();
});

describe("toast store", () => {
  it("pushToast 后 subscribeToasts 收到新增", () => {
    const calls: ReturnType<typeof getToasts>[] = [];
    const unsub = subscribeToasts((t) => calls.push(t));
    pushToast("success", "保存成功");
    const last = calls[calls.length - 1];
    expect(last.length).toBe(1);
    expect(last[0].type).toBe("success");
    expect(last[0].message).toBe("保存成功");
    unsub();
  });

  it("dismissToast 后列表更新", () => {
    const id = pushToast("info", "提示");
    expect(getToasts().length).toBe(1);
    dismissToast(id);
    expect(getToasts().length).toBe(0);
  });

  it("dismissToast 不存在的 id 不影响状态", () => {
    pushToast("info", "提示");
    dismissToast("not-exist");
    expect(getToasts().length).toBe(1);
  });

  it("toast.success/error/warning/info 快捷方法", () => {
    toast.success("成功");
    toast.error("错误");
    toast.warning("警告");
    toast.info("信息");
    const list = getToasts();
    expect(list.map((t) => t.type)).toEqual(["success", "error", "warning", "info"]);
  });

  it("error 默认时长更长（+2s）", () => {
    toast.success("s");
    toast.error("e");
    const [s, e] = getToasts();
    expect(e.durationMs).toBeGreaterThan(s.durationMs);
  });

  it("多次 subscribe 互不影响", () => {
    const calls1: number[] = [];
    const calls2: number[] = [];
    const u1 = subscribeToasts((t) => calls1.push(t.length));
    const u2 = subscribeToasts((t) => calls2.push(t.length));
    pushToast("info", "x");
    u1();
    pushToast("info", "y");
    // u1 已取消，不应再收到；u2 应收到 3 次（订阅初始 + 2 次 push）
    expect(calls1.length).toBeLessThan(calls2.length);
    u2();
  });

  it("clearToasts 清空", () => {
    pushToast("info", "1");
    pushToast("info", "2");
    expect(getToasts().length).toBe(2);
    clearToasts();
    expect(getToasts().length).toBe(0);
  });

  it("confirm 不自动消失（durationMs=0）", () => {
    const p = confirmDialog({ message: "确定删除？" });
    const list = getToasts();
    expect(list.length).toBe(1);
    expect(list[0].confirm).toBeDefined();
    expect(list[0].durationMs).toBe(0);
    // 不 resolve 的话 Promise 永远 pending
    list[0].confirm!.resolve(true);
    return expect(p).resolves.toBe(true);
  });

  it("confirmDialog 在用户确认后 resolve true", async () => {
    const p = confirmDialog({
      message: "继续？",
      confirmText: "是",
      cancelText: "否",
      danger: true,
    });
    const [item] = getToasts();
    expect(item.confirm?.confirmText).toBe("是");
    expect(item.confirm?.cancelText).toBe("否");
    expect(item.confirm?.danger).toBe(true);
    item.confirm!.resolve(true);
    await expect(p).resolves.toBe(true);
  });

  it("confirmDialog 在用户取消后 resolve false", async () => {
    const p = confirmDialog({ message: "取消？" });
    const [item] = getToasts();
    item.confirm!.resolve(false);
    await expect(p).resolves.toBe(false);
  });

  it("confirmDialog 安全 resolve：多次调用只生效一次", async () => {
    const p = confirmDialog({ message: "重？" });
    const [item] = getToasts();
    item.confirm!.resolve(true);
    item.confirm!.resolve(false); // 不应影响
    await expect(p).resolves.toBe(true);
  });

  it("subscribe 立即收到当前快照", () => {
    pushToast("info", "已有");
    let received: number | null = null;
    subscribeToasts((t) => {
      if (received === null) received = t.length;
    })();
    expect(received).toBe(1);
  });

  it("监听器抛错不影响其他监听器", () => {
    const calls: number[] = [];
    subscribeToasts(() => {
      throw new Error("listener failed");
    });
    subscribeToasts((t) => calls.push(t.length));
    expect(() => pushToast("info", "test")).not.toThrow();
    expect(calls[calls.length - 1]).toBe(1);
  });
});

describe("toast 自动消失定时器", () => {
  it("非 confirm 类型 durationMs 后自动 dismiss", async () => {
    vi.useFakeTimers();
    try {
      pushToast("info", "auto", 1000);
      expect(getToasts().length).toBe(1);
      // window 类型在 jsdom 下存在
      vi.advanceTimersByTime(1100);
      expect(getToasts().length).toBe(0);
    } finally {
      vi.useRealTimers();
    }
  });

  it("confirm 类型不自动消失", async () => {
    vi.useFakeTimers();
    try {
      const p = confirmDialog({ message: "确认？" });
      vi.advanceTimersByTime(10000);
      expect(getToasts().length).toBe(1);
      // 清理
      getToasts()[0].confirm!.resolve(false);
      await p;
    } finally {
      vi.useRealTimers();
    }
  });
});
