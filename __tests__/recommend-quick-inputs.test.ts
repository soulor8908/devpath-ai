// __tests__/recommend-quick-inputs.test.ts
// 测试快捷输入推荐

import { describe, it, expect, beforeEach, vi } from "vitest";

// Mock IndexedDB API（避免真实 IndexedDB 交互）
vi.mock("@/lib/storage/db", () => ({
  getItem: vi.fn(async () => undefined),
  setItem: vi.fn(async () => undefined),
  listItems: vi.fn(async () => []),
}));

import { getRecommendedQuickInputs, getDefaultQuickInputs } from "../lib/recommend-quick-inputs";
import { getInputHistory, recordInputHistory, clearInputHistory } from "../lib/learn-input-history";
import * as db from "@/lib/storage/db";

// 用 fake-indexeddb 跑真实存储测试
beforeEach(async () => {
  vi.clearAllMocks();
  // 默认 mock 返回 undefined
  (db.getItem as ReturnType<typeof vi.fn>).mockResolvedValue(undefined);
  (db.listItems as ReturnType<typeof vi.fn>).mockResolvedValue([]);
  (db.setItem as ReturnType<typeof vi.fn>).mockResolvedValue(undefined);
});

describe("getRecommendedQuickInputs", () => {
  it("无任何数据时返回默认 4 个", async () => {
    const result = await getRecommendedQuickInputs();
    expect(result).toEqual([
      "前端性能优化",
      "React 源码原理",
      "TypeScript 进阶",
      "系统设计基础",
    ]);
  });

  it("getDefaultQuickInputs 始终返回默认 4 个", () => {
    expect(getDefaultQuickInputs()).toHaveLength(4);
  });

  it("仅有 input_history 时返回 top 4（按权重排序）", async () => {
    const today = new Date().toISOString();
    (db.getItem as ReturnType<typeof vi.fn>).mockResolvedValue([
      { topic: "前端性能优化", updatedAt: today },
      { topic: "React 源码原理", updatedAt: today },
      { topic: "TypeScript 进阶", updatedAt: today },
      { topic: "系统设计基础", updatedAt: today },
      { topic: "Go 并发", updatedAt: today },
    ]);
    const result = await getRecommendedQuickInputs();
    expect(result.length).toBe(4);
    // 全部来自 input_history
    expect(result).toContain("前端性能优化");
    expect(result).toContain("React 源码原理");
  });

  it("不足 4 个时用默认补齐", async () => {
    const today = new Date().toISOString();
    (db.getItem as ReturnType<typeof vi.fn>).mockResolvedValue([
      { topic: "Go 并发", updatedAt: today },
    ]);
    const result = await getRecommendedQuickInputs();
    expect(result.length).toBe(4);
    expect(result).toContain("Go 并发");
    expect(result).toContain("前端性能优化");
  });

  it("超过 7 天的 input_history 不计入（时近衰减=0）", async () => {
    const old = new Date(Date.now() - 8 * 86400000).toISOString();
    (db.getItem as ReturnType<typeof vi.fn>).mockResolvedValue([
      { topic: "过期主题", updatedAt: old },
    ]);
    const result = await getRecommendedQuickInputs();
    // 应该返回默认（过期主题被排除）
    expect(result).not.toContain("过期主题");
  });

  it("LearnLog 关联的 plan.topic 计入推荐（× 2 权重）", async () => {
    const today = new Date().toISOString();
    // input_history 为空
    (db.getItem as ReturnType<typeof vi.fn>).mockResolvedValue(undefined);
    // getAllLogs 通过 listItems 查询
    (db.listItems as ReturnType<typeof vi.fn>).mockImplementation(async (prefix: string) => {
      if (prefix === "learn_log:") {
        return [
          { id: "1", planId: "p1", type: "learn_complete", timestamp: today, date: today.slice(0, 10) },
        ];
      }
      if (prefix === "plan:") {
        return [
          { id: "p1", topic: "Rust 内存安全" },
        ];
      }
      return [];
    });
    const result = await getRecommendedQuickInputs();
    expect(result).toContain("Rust 内存安全");
  });

  it("ChatMessage 对话主题计入推荐（× 1 权重）", async () => {
    const today = new Date().toISOString();
    (db.listItems as ReturnType<typeof vi.fn>).mockImplementation(async (prefix: string) => {
      if (prefix === "conv:") {
        return [
          { id: "c1", title: "如何写好技术简历", updatedAt: today },
        ];
      }
      return [];
    });
    const result = await getRecommendedQuickInputs();
    expect(result).toContain("如何写好技术简历");
  });

  it("去重：相同主题来自多个数据源合并分数", async () => {
    const today = new Date().toISOString();
    (db.getItem as ReturnType<typeof vi.fn>).mockResolvedValue([
      { topic: "React Hooks", updatedAt: today },
    ]);
    (db.listItems as ReturnType<typeof vi.fn>).mockImplementation(async (prefix: string) => {
      if (prefix === "learn_log:") {
        return [
          { id: "1", planId: "p1", type: "learn_complete", timestamp: today, date: today.slice(0, 10) },
        ];
      }
      if (prefix === "plan:") {
        return [
          { id: "p1", topic: "React Hooks" },
        ];
      }
      return [];
    });
    const result = await getRecommendedQuickInputs();
    expect(result).toContain("React Hooks");
    expect(result.filter((x) => x === "React Hooks").length).toBe(1); // 去重
  });
});

describe("learn-input-history", () => {
  it("recordInputHistory 写入历史", async () => {
    await recordInputHistory("React 并发模式");
    expect(db.setItem).toHaveBeenCalledWith(
      "learn:input_history",
      expect.arrayContaining([
        expect.objectContaining({ topic: "React 并发模式" }),
      ]),
    );
  });

  it("recordInputHistory 空字符串不写入", async () => {
    await recordInputHistory("");
    expect(db.setItem).not.toHaveBeenCalled();
  });

  it("recordInputHistory 同 topic 去重并更新 timestamp", async () => {
    // 模拟已有历史
    (db.getItem as ReturnType<typeof vi.fn>).mockResolvedValue([
      { topic: "React", updatedAt: "2025-01-01T00:00:00.000Z" },
    ]);
    await recordInputHistory("React");
    const [, value] = (db.setItem as ReturnType<typeof vi.fn>).mock.calls[0];
    expect(value).toHaveLength(1);
    expect(value[0].topic).toBe("React");
    // 时间应更新（不等于旧的 2025）
    expect(value[0].updatedAt).not.toBe("2025-01-01T00:00:00.000Z");
  });

  it("recordInputHistory 超过 50 条 FIFO 移除", async () => {
    const existing = Array.from({ length: 50 }, (_, i) => ({
      topic: `topic-${i}`,
      updatedAt: "2025-01-01T00:00:00.000Z",
    }));
    (db.getItem as ReturnType<typeof vi.fn>).mockResolvedValue(existing);
    await recordInputHistory("new-topic");
    const [, value] = (db.setItem as ReturnType<typeof vi.fn>).mock.calls[0];
    expect(value).toHaveLength(50);
    expect(value[0].topic).toBe("new-topic");
    // FIFO：最后的 topic-49 应被移除（新条目入队首，队尾淘汰）
    expect(value.find((x: { topic: string }) => x.topic === "topic-49")).toBeUndefined();
    // topic-0 仍保留
    expect(value.find((x: { topic: string }) => x.topic === "topic-0")).toBeDefined();
  });

  it("getInputHistory 返回 list", async () => {
    (db.getItem as ReturnType<typeof vi.fn>).mockResolvedValue([
      { topic: "a", updatedAt: "2025-01-01T00:00:00.000Z" },
      { topic: "b", updatedAt: "2025-01-02T00:00:00.000Z" },
    ]);
    const list = await getInputHistory();
    expect(list).toHaveLength(2);
  });

  it("clearInputHistory 写入空数组", async () => {
    await clearInputHistory();
    expect(db.setItem).toHaveBeenCalledWith("learn:input_history", []);
  });
});
