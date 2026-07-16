import { describe, it, expect } from "vitest";
import { topoSort, allocateDaily, nodeMinutes, buildSchedule } from "../lib/schedule";
import type { KnowledgeNode } from "../lib/types";

function makeNode(
  id: string,
  difficulty: 1 | 2 | 3 | 4 | 5 = 2,
  prerequisites: string[] = []
): KnowledgeNode {
  return {
    id,
    title: `节点 ${id}`,
    difficulty,
    prerequisites,
    frequency: "中",
    summary: "",
    mastery: 0,
  };
}

describe("topoSort", () => {
  it("8 节点无依赖，保持原顺序（同层按 difficulty 升序）", () => {
    const nodes = [
      makeNode("k1", 3),
      makeNode("k2", 1),
      makeNode("k3", 2),
      makeNode("k4", 5),
      makeNode("k5", 1),
      makeNode("k6", 4),
      makeNode("k7", 2),
      makeNode("k8", 3),
    ];
    const sorted = topoSort(nodes);
    expect(sorted).toHaveLength(8);
    // 同层按 difficulty 升序
    expect(sorted[0].difficulty).toBe(1);
    expect(sorted[1].difficulty).toBe(1);
    expect(sorted[2].difficulty).toBe(2);
  });

  it("有依赖 k2→k1, k3→k1，k1 排在前面", () => {
    const nodes = [
      makeNode("k1", 2),
      makeNode("k2", 1, ["k1"]),
      makeNode("k3", 3, ["k1"]),
    ];
    const sorted = topoSort(nodes);
    expect(sorted[0].id).toBe("k1");
    expect(sorted.slice(1).map((n) => n.id)).toContain("k2");
    expect(sorted.slice(1).map((n) => n.id)).toContain("k3");
  });

  it("多层依赖：k3→k2→k1", () => {
    const nodes = [
      makeNode("k3", 1, ["k2"]),
      makeNode("k2", 1, ["k1"]),
      makeNode("k1", 1),
    ];
    const sorted = topoSort(nodes);
    const ids = sorted.map((n) => n.id);
    expect(ids.indexOf("k1")).toBeLessThan(ids.indexOf("k2"));
    expect(ids.indexOf("k2")).toBeLessThan(ids.indexOf("k3"));
  });

  it("循环依赖不崩溃，返回所有节点", () => {
    const nodes = [
      makeNode("k1", 1, ["k2"]),
      makeNode("k2", 1, ["k1"]),
    ];
    const sorted = topoSort(nodes);
    expect(sorted).toHaveLength(2);
  });
});

describe("allocateDaily", () => {
  it("8 节点无依赖，dailyMinutes=30，maxNewPerDay=1 → 8 天每天 1 learn + 1 review", () => {
    const nodes = Array.from({ length: 8 }, (_, i) => makeNode(`k${i + 1}`, 1));
    const sorted = topoSort(nodes);
    const schedule = allocateDaily(sorted, 30, 1);
    
    // 8 天 * 2 项（learn + review）= 16 项
    expect(schedule).toHaveLength(16);
    
    // 每天有 1 个 learn
    for (let d = 1; d <= 8; d++) {
      const dayItems = schedule.filter((s) => s.day === d);
      const learnItems = dayItems.filter((s) => s.type === "learn");
      expect(learnItems).toHaveLength(1);
    }
    
    // 每个节点都有 review（在 learn 的下一天）
    const reviewItems = schedule.filter((s) => s.type === "review");
    expect(reviewItems).toHaveLength(8);
  });

  it("有依赖 k2→k1, k3→k1，k1 的 learn 排在前面", () => {
    const nodes = [
      makeNode("k1", 2),
      makeNode("k2", 1, ["k1"]),
      makeNode("k3", 3, ["k1"]),
    ];
    const schedule = buildSchedule(nodes, 30, 1);
    
    const k1Learn = schedule.find((s) => s.nodeId === "k1" && s.type === "learn")!;
    const k2Learn = schedule.find((s) => s.nodeId === "k2" && s.type === "learn")!;
    const k3Learn = schedule.find((s) => s.nodeId === "k3" && s.type === "learn")!;
    
    expect(k1Learn.day).toBeLessThanOrEqual(k2Learn.day);
    expect(k1Learn.day).toBeLessThanOrEqual(k3Learn.day);
  });

  it("dailyMinutes=15，节点 difficulty=3（24min），该节点单独占一天", () => {
    const nodes = [makeNode("k1", 3)];
    const schedule = allocateDaily(nodes, 15, 1);
    
    const learnItem = schedule.find((s) => s.type === "learn")!;
    expect(learnItem.day).toBe(1);
    expect(learnItem.estimatedMinutes).toBe(24);
  });

  it("nodeMinutes = difficulty * 8", () => {
    expect(nodeMinutes(makeNode("k1", 1))).toBe(8);
    expect(nodeMinutes(makeNode("k1", 5))).toBe(40);
    expect(nodeMinutes(makeNode("k1", 3))).toBe(24);
  });

  it("maxNewPerDay=2 时每天最多 2 个 learn", () => {
    const nodes = Array.from({ length: 4 }, (_, i) => makeNode(`k${i + 1}`, 1));
    const schedule = allocateDaily(nodes, 60, 2);
    
    const day1Learns = schedule.filter((s) => s.day === 1 && s.type === "learn");
    expect(day1Learns.length).toBeLessThanOrEqual(2);
  });
});
