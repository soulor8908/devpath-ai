/**
 * curriculum/graph.ts 单元测试：跨文件校验规则 G1-G7 与拓扑排序
 */
import { describe, expect, it } from "vitest";

import { buildCurriculumGraph, topoSortNodes } from "@/lib/curriculum/graph";
import type { LoadedCurriculum } from "@/lib/curriculum/loader";
import type { SourceEntry, SkillNode } from "@/lib/types/curriculum";

function makeSource(id: string, tier: SourceEntry["tier"]): SourceEntry {
  return {
    id,
    title: id,
    url: "https://example.com",
    tier,
    type: "official-doc",
    lastVerified: "2026-07-20",
  };
}

function makeNode(overrides: Partial<SkillNode> = {}): SkillNode {
  return {
    id: "a.b",
    title: "t",
    summary: "s",
    tracks: ["t1"],
    phase: 0,
    prerequisites: [],
    estimatedMinutes: 60,
    difficulty: 2,
    concepts: ["c"],
    sourceIds: ["s-t0", "s-t2"],
    gotchas: [],
    interview: [{ q: "q", answerSkeleton: "a", followups: ["f"] }],
    masteryCheck: { level: "V1", type: "fsrs-cards", description: "d" },
    status: "reviewed",
    lastVerified: "2026-07-24",
    ...overrides,
  };
}

function makeLoaded(
  overrides: Partial<LoadedCurriculum> = {},
): LoadedCurriculum {
  return {
    sources: [makeSource("s-t0", "T0"), makeSource("s-t2", "T2")],
    nodes: [makeNode()],
    tracks: [
      {
        id: "t1",
        title: "t",
        description: "d",
        audience: "a",
        phases: [{ index: 0, title: "p", goal: "g" }],
      },
    ],
    rubrics: [],
    ...overrides,
  };
}

describe("buildCurriculumGraph 校验规则", () => {
  it("G1: 前置依赖必须存在", () => {
    const loaded = makeLoaded({
      nodes: [makeNode({ prerequisites: ["not.exist"] })],
    });
    expect(() => buildCurriculumGraph(loaded)).toThrow(/前置依赖不存在/);
  });

  it("G1: 节点不能依赖自身", () => {
    const loaded = makeLoaded({
      nodes: [makeNode({ id: "a.b", prerequisites: ["a.b"] })],
    });
    expect(() => buildCurriculumGraph(loaded)).toThrow(/依赖自身/);
  });

  it("G2: 来源必须已登记", () => {
    const loaded = makeLoaded({
      nodes: [makeNode({ sourceIds: ["s-t0", "ghost"] })],
    });
    expect(() => buildCurriculumGraph(loaded)).toThrow(/未登记的来源/);
  });

  it("G3: 至少 1 条 T0/T1 来源", () => {
    const loaded = makeLoaded({
      sources: [makeSource("s-t2", "T2"), makeSource("s-t3", "T3")],
      nodes: [makeNode({ sourceIds: ["s-t2", "s-t3"] })],
    });
    expect(() => buildCurriculumGraph(loaded)).toThrow(/T0\/T1/);
  });

  it("G3: T1 来源满足权威硬约束", () => {
    const loaded = makeLoaded({
      sources: [makeSource("s-t1", "T1"), makeSource("s-t3", "T3")],
      nodes: [makeNode({ sourceIds: ["s-t1", "s-t3"] })],
    });
    expect(() => buildCurriculumGraph(loaded)).not.toThrow();
  });

  it("G5: 节点所属轨道必须存在", () => {
    const loaded = makeLoaded({
      nodes: [makeNode({ tracks: ["ghost-track"] })],
    });
    expect(() => buildCurriculumGraph(loaded)).toThrow(/不存在的轨道/);
  });

  it("G5: 节点 phase 必须在轨道阶段内", () => {
    const loaded = makeLoaded({ nodes: [makeNode({ phase: 9 })] });
    expect(() => buildCurriculumGraph(loaded)).toThrow(/phase/);
  });

  it("G6: V3/V4 验证必须挂 Rubric", () => {
    const loaded = makeLoaded({
      nodes: [
        makeNode({
          masteryCheck: {
            level: "V3",
            type: "project-checkpoint",
            description: "d",
          },
        }),
      ],
    });
    expect(() => buildCurriculumGraph(loaded)).toThrow(/Rubric/);
  });

  it("G6: rubricId 必须存在", () => {
    const loaded = makeLoaded({
      nodes: [
        makeNode({
          masteryCheck: {
            level: "V2",
            type: "code-challenge",
            description: "d",
            rubricId: "ghost",
          },
        }),
      ],
    });
    expect(() => buildCurriculumGraph(loaded)).toThrow(/不存在的 Rubric/);
  });

  it("G7: Rubric 权重之和必须为 100", () => {
    const loaded = makeLoaded({
      rubrics: [
        {
          id: "r1",
          title: "t",
          passScore: 70,
          criteria: [
            { id: "c1", description: "d", weight: 60 },
            { id: "c2", description: "d", weight: 30 },
          ],
        },
      ],
    });
    expect(() => buildCurriculumGraph(loaded)).toThrow(/权重之和/);
  });
});

describe("topoSortNodes", () => {
  it("依赖在前，被依赖在后", () => {
    const nodes = [
      makeNode({ id: "c.out", prerequisites: ["b.mid"] }),
      makeNode({ id: "a.in", prerequisites: [] }),
      makeNode({ id: "b.mid", prerequisites: ["a.in"] }),
    ];
    expect(topoSortNodes(nodes)).toEqual(["a.in", "b.mid", "c.out"]);
  });

  it("检测环", () => {
    const nodes = [
      makeNode({ id: "a.x", prerequisites: ["c.x"] }),
      makeNode({ id: "b.x", prerequisites: ["a.x"] }),
      makeNode({ id: "c.x", prerequisites: ["b.x"] }),
    ];
    expect(() => topoSortNodes(nodes)).toThrow(/环/);
  });

  it("同层按 (phase, id) 字典序保证确定性", () => {
    const nodes = [
      makeNode({ id: "z.last", prerequisites: [] }),
      makeNode({ id: "a.first", prerequisites: [] }),
    ];
    expect(topoSortNodes(nodes)).toEqual(["a.first", "z.last"]);
  });

  it("忽略不在集合内的前置（子图排序）", () => {
    const nodes = [makeNode({ id: "b.x", prerequisites: ["outside.node"] })];
    expect(topoSortNodes(nodes)).toEqual(["b.x"]);
  });
});
