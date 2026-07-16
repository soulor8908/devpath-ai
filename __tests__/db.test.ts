import { describe, it, expect, beforeEach } from "vitest";
import "fake-indexeddb/auto";
import { getItem, setItem, delItem, listKeys, listItems } from "../lib/storage/db";
import type { LearningPlan } from "../lib/types";

describe("db", () => {
  beforeEach(async () => {
    // 清理：删除所有以 "plan:" 开头的 key
    const keys = await listKeys("plan:");
    for (const k of keys) {
      await delItem(k);
    }
  });

  it("写入 LearningPlan 后能读回，字段一致", async () => {
    const plan: LearningPlan = {
      id: "test-1",
      topic: "前端性能",
      knowledgeTree: [],
      questions: [],
      schedule: [],
      dailyMinutes: 30,
      maxNewPerDay: 1,
      fsrsMode: "standard",
      createdAt: "2026-07-13T00:00:00.000Z",
      updatedAt: "2026-07-13T00:00:00.000Z",
    };
    await setItem("plan:test-1", plan);
    const read = await getItem<LearningPlan>("plan:test-1");
    expect(read).toBeDefined();
    expect(read!.id).toBe("test-1");
    expect(read!.topic).toBe("前端性能");
    expect(read!.dailyMinutes).toBe(30);
    expect(read!.fsrsMode).toBe("standard");
  });

  it("删除后读回 undefined", async () => {
    await setItem("plan:test-2", { id: "test-2" });
    await delItem("plan:test-2");
    const read = await getItem("plan:test-2");
    expect(read).toBeUndefined();
  });

  it("listKeys 按前缀过滤", async () => {
    await setItem("plan:a", { id: "a" });
    await setItem("plan:b", { id: "b" });
    await setItem("card:c", { id: "c" });
    const planKeys = await listKeys("plan:");
    expect(planKeys).toContain("plan:a");
    expect(planKeys).toContain("plan:b");
    expect(planKeys).not.toContain("card:c");
  });

  it("listItems 返回前缀匹配的所有值", async () => {
    await setItem("plan:x", { id: "x", topic: "X" });
    await setItem("plan:y", { id: "y", topic: "Y" });
    const items = await listItems<{ id: string; topic: string }>("plan:");
    expect(items).toHaveLength(2);
    const topics = items.map((i) => i.topic);
    expect(topics).toContain("X");
    expect(topics).toContain("Y");
  });

  it("未存储的 key 返回 undefined", async () => {
    const read = await getItem("nonexistent:key");
    expect(read).toBeUndefined();
  });
});
