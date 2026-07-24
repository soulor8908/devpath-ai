/**
 * curriculum/path-engine.ts 单元测试：路径计算、跳过已会、排程、适配器
 */
import { describe, expect, it } from "vitest";

import {
  computePath,
  PathEngineError,
  toKnowledgeNodes,
} from "@/lib/curriculum/path-engine";
import { buildCurriculumGraph } from "@/lib/curriculum/graph";
import type { LoadedCurriculum } from "@/lib/curriculum/loader";
import type { SourceEntry, SkillNode } from "@/lib/types/curriculum";

function makeSource(id: string): SourceEntry {
  return {
    id,
    title: id,
    url: "https://example.com",
    tier: "T0",
    type: "official-doc",
    lastVerified: "2026-07-20",
  };
}

let seq = 0;
function makeNode(overrides: Partial<SkillNode> = {}): SkillNode {
  seq += 1;
  return {
    id: `n.${seq}`,
    title: `node-${seq}`,
    summary: "s",
    tracks: ["t1"],
    phase: 0,
    prerequisites: [],
    estimatedMinutes: 60,
    difficulty: 2,
    concepts: ["c"],
    sourceIds: ["s1", "s2"],
    gotchas: [],
    interview: [{ q: "q", answerSkeleton: "a", followups: ["f"] }],
    masteryCheck: { level: "V1", type: "fsrs-cards", description: "d" },
    status: "reviewed",
    lastVerified: "2026-07-24",
    ...overrides,
  };
}

function buildGraph(nodes: SkillNode[]) {
  const loaded: LoadedCurriculum = {
    sources: [makeSource("s1"), makeSource("s2")],
    nodes,
    tracks: [
      {
        id: "t1",
        title: "t",
        description: "d",
        audience: "a",
        phases: [
          { index: 0, title: "p0", goal: "g" },
          { index: 1, title: "p1", goal: "g" },
        ],
      },
    ],
    rubrics: [],
  };
  return buildCurriculumGraph(loaded);
}

describe("computePath", () => {
  it("无先修知识时返回全量拓扑序", () => {
    const a = makeNode({ id: "n.a" });
    const b = makeNode({ id: "n.b", prerequisites: ["n.a"] });
    const graph = buildGraph([b, a]);
    const path = computePath(graph, {
      trackId: "t1",
      knownNodeIds: [],
      dailyMinutes: 120,
    });
    expect(path.orderedNodeIds).toEqual(["n.a", "n.b"]);
    expect(path.skippedNodeIds).toEqual([]);
    expect(path.totalMinutes).toBe(120);
  });

  it("跳过已掌握节点并解锁其后续", () => {
    const a = makeNode({ id: "n.a" });
    const b = makeNode({ id: "n.b", prerequisites: ["n.a"] });
    const c = makeNode({ id: "n.c", prerequisites: ["n.b"] });
    const graph = buildGraph([a, b, c]);
    const path = computePath(graph, {
      trackId: "t1",
      knownNodeIds: ["n.a", "n.b"],
      dailyMinutes: 120,
    });
    expect(path.orderedNodeIds).toEqual(["n.c"]);
    expect(path.skippedNodeIds).toEqual(["n.a", "n.b"]);
  });

  it("忽略不属于本轨道的 knownNodeIds", () => {
    const a = makeNode({ id: "n.a" });
    const graph = buildGraph([a]);
    const path = computePath(graph, {
      trackId: "t1",
      knownNodeIds: ["other.track-node"],
      dailyMinutes: 120,
    });
    expect(path.orderedNodeIds).toEqual(["n.a"]);
  });

  it("全部掌握时返回空路径", () => {
    const a = makeNode({ id: "n.a" });
    const graph = buildGraph([a]);
    const path = computePath(graph, {
      trackId: "t1",
      knownNodeIds: ["n.a"],
      dailyMinutes: 120,
    });
    expect(path.orderedNodeIds).toEqual([]);
    expect(path.totalDays).toBe(0);
    expect(path.totalMinutes).toBe(0);
  });

  it("按每日分钟数装箱排程，节点不跨天", () => {
    const nodes = [
      makeNode({ id: "n.1", estimatedMinutes: 100 }),
      makeNode({ id: "n.2", estimatedMinutes: 100 }),
      makeNode({ id: "n.3", estimatedMinutes: 60 }),
    ];
    const graph = buildGraph(nodes);
    const path = computePath(graph, {
      trackId: "t1",
      knownNodeIds: [],
      dailyMinutes: 120,
    });
    // day1: n.1(100)，n.2 放不下 → day2: n.2(100)，n.3 加入会超 → 不，100+60>120 → day3: n.3
    expect(path.days).toHaveLength(3);
    expect(path.days[0]).toEqual({ day: 1, nodeIds: ["n.1"], totalMinutes: 100 });
    expect(path.days[1]).toEqual({ day: 2, nodeIds: ["n.2"], totalMinutes: 100 });
    expect(path.days[2]).toEqual({ day: 3, nodeIds: ["n.3"], totalMinutes: 60 });
  });

  it("同一天可装多个小节点", () => {
    const nodes = [
      makeNode({ id: "n.1", estimatedMinutes: 40 }),
      makeNode({ id: "n.2", estimatedMinutes: 50 }),
      makeNode({ id: "n.3", estimatedMinutes: 40 }),
    ];
    const graph = buildGraph(nodes);
    const path = computePath(graph, {
      trackId: "t1",
      knownNodeIds: [],
      dailyMinutes: 120,
    });
    // 40+50+40=130 > 120 → 前两天装 n.1+n.2=90，n.3 到 day2
    expect(path.days).toHaveLength(2);
    expect(path.days[0].nodeIds).toEqual(["n.1", "n.2"]);
    expect(path.days[1].nodeIds).toEqual(["n.3"]);
  });

  it("超大节点独占一天", () => {
    const nodes = [makeNode({ id: "n.big", estimatedMinutes: 300 })];
    const graph = buildGraph(nodes);
    const path = computePath(graph, {
      trackId: "t1",
      knownNodeIds: [],
      dailyMinutes: 120,
    });
    expect(path.days).toHaveLength(1);
    expect(path.days[0].totalMinutes).toBe(300);
  });

  it("轨道不存在时报错", () => {
    const graph = buildGraph([makeNode()]);
    expect(() =>
      computePath(graph, {
        trackId: "ghost",
        knownNodeIds: [],
        dailyMinutes: 120,
      }),
    ).toThrow(PathEngineError);
  });

  it("dailyMinutes 非正数时报错", () => {
    const graph = buildGraph([makeNode()]);
    expect(() =>
      computePath(graph, { trackId: "t1", knownNodeIds: [], dailyMinutes: 0 }),
    ).toThrow(PathEngineError);
  });
});

describe("toKnowledgeNodes 适配器", () => {
  it("输出符合既有 KnowledgeNode 形状且按拓扑序编号", () => {
    const a = makeNode({ id: "n.a" });
    const b = makeNode({
      id: "n.b",
      prerequisites: ["n.a"],
      difficulty: 5,
      frontendBridge: "bridge",
      gotchas: ["g1"],
    });
    const result = toKnowledgeNodes([b, a]);
    expect(result.map((n) => n.id)).toEqual(["n.a", "n.b"]);
    expect(result[1]).toMatchObject({
      id: "n.b",
      difficulty: 5,
      frequency: "高",
      mastery: 0,
      customOrder: 1,
      prerequisites: ["n.a"],
    });
    expect(result[1].summary).toContain("bridge");
    expect(result[1].summary).toContain("g1");
  });

  it("难度到面试频率的映射", () => {
    const n1 = makeNode({ id: "n.1", difficulty: 1 });
    const n3 = makeNode({ id: "n.3", difficulty: 3 });
    const n5 = makeNode({ id: "n.5", difficulty: 5 });
    const result = toKnowledgeNodes([n5, n3, n1]);
    const freq = Object.fromEntries(result.map((n) => [n.id, n.frequency]));
    expect(freq["n.1"]).toBe("低");
    expect(freq["n.3"]).toBe("中");
    expect(freq["n.5"]).toBe("高");
  });
});
