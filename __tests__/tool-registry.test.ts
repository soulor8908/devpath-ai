import { describe, it, expect } from "vitest";
import {
  TOOL_REGISTRY,
  TOOL_CATEGORIES,
  getToolById,
  getToolQuickPrompts,
  getToolsByCategory,
  buildToolSystemSuffix,
} from "../lib/ai/tool-registry";

describe("tool-registry", () => {
  it("包含 11 个工具", () => {
    expect(TOOL_REGISTRY).toHaveLength(11);
  });

  it("每个工具有 name/category/icon/description 字段", () => {
    for (const t of TOOL_REGISTRY) {
      expect(t.name).toBeTruthy();
      expect(t.category).toBeTruthy();
      expect(t.icon).toBeTruthy();
      expect(t.description).toBeTruthy();
    }
  });

  it("TOOL_CATEGORIES 有 4 个分类", () => {
    expect(TOOL_CATEGORIES).toHaveLength(4);
    for (const c of TOOL_CATEGORIES) {
      expect(c.id).toBeTruthy();
      expect(c.label).toBeTruthy();
      expect(c.icon).toBeTruthy();
    }
  });

  it("getToolById 返回正确工具", () => {
    expect(getToolById("get_daily_schedule")?.name).toBe("get_daily_schedule");
    expect(getToolById("nonexistent")).toBeUndefined();
  });

  it("getToolQuickPrompts 返回所有工具的快捷指令", () => {
    const prompts = getToolQuickPrompts();
    expect(prompts.length).toBeGreaterThanOrEqual(11);
    for (const p of prompts) {
      expect(typeof p).toBe("string");
      expect(p.length).toBeGreaterThan(0);
    }
  });

  it("每个工具至少有 1 条快捷指令", () => {
    for (const t of TOOL_REGISTRY) {
      expect(t.quickPrompts.length).toBeGreaterThanOrEqual(1);
    }
  });

  it("getToolsByCategory 正确分组", () => {
    const queryTools = getToolsByCategory("query");
    expect(queryTools.length).toBe(3);
    const planTools = getToolsByCategory("plan");
    expect(planTools.length).toBe(4);
    const focusTools = getToolsByCategory("focus");
    expect(focusTools.length).toBe(2);
    const assistTools = getToolsByCategory("assist");
    expect(assistTools.length).toBe(2);
  });

  it("buildToolSystemSuffix 包含所有工具名", () => {
    const suffix = buildToolSystemSuffix();
    for (const t of TOOL_REGISTRY) {
      expect(suffix).toContain(t.name);
    }
  });
});
