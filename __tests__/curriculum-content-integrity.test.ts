/**
 * 内容完整性测试（成分测试）：对 content/ 目录的真实策展内容做全量校验。
 *
 * 这不是普通单测——它是内容质量的 CI 门禁：
 * 任何人修改内容文件，npm test 都会重新验证权威体系、图谱自洽性与教学完备性。
 */
import { readdirSync, readFileSync, existsSync } from "node:fs";
import { join, relative } from "node:path";

import { describe, expect, it } from "vitest";

import { loadCurriculumFiles, type ContentFile } from "@/lib/curriculum/loader";
import { buildCurriculumGraph, topoSortNodes } from "@/lib/curriculum/graph";
import { computePath, toKnowledgeNodes } from "@/lib/curriculum/path-engine";
import { requiredLevels } from "@/lib/curriculum/verification";
import type { SourceTier } from "@/lib/types/curriculum";

const CONTENT_DIR = join(__dirname, "..", "content");

function collectContentFiles(): ContentFile[] {
  const walk = (dir: string): string[] => {
    if (!existsSync(dir)) return [];
    return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
      const full = join(dir, entry.name);
      if (entry.isDirectory()) return walk(full);
      return /\.(yaml|yml)$/.test(entry.name) ? [full] : [];
    });
  };
  return walk(CONTENT_DIR)
    .sort()
    .map((p) => ({
      path: relative(CONTENT_DIR, p),
      content: readFileSync(p, "utf-8"),
    }));
}

const files = collectContentFiles();
const loaded = loadCurriculumFiles(files);
const graph = buildCurriculumGraph(loaded);

const TIER_RANK: Record<SourceTier, number> = { T0: 0, T1: 1, T2: 2, T3: 3 };

describe("内容规模基线", () => {
  it("内容文件存在且达到一定规模", () => {
    expect(files.length).toBeGreaterThanOrEqual(10);
    expect(loaded.nodes.length).toBeGreaterThanOrEqual(15);
    expect(loaded.sources.length).toBeGreaterThanOrEqual(20);
    expect(loaded.tracks.length).toBeGreaterThanOrEqual(1);
  });

  it("旗舰轨道存在且阶段完整", () => {
    const track = loaded.tracks.find((t) => t.id === "frontend-to-ai-engineer");
    expect(track).toBeDefined();
    expect(track?.phases.length).toBeGreaterThanOrEqual(5);
  });
});

describe("权威体系（内容可信度门禁）", () => {
  it("每个节点至少 2 条来源，且最高等级不弱于 T1", () => {
    for (const node of loaded.nodes) {
      expect(node.sourceIds.length).toBeGreaterThanOrEqual(2);
      const best = Math.min(
        ...node.sourceIds.map((id) => TIER_RANK[graph.sources[id].tier]),
      );
      expect(best).toBeLessThanOrEqual(TIER_RANK.T1);
    }
  });

  it("不允许 T3 来源单独支撑节点", () => {
    for (const node of loaded.nodes) {
      const tiers = node.sourceIds.map((id) => graph.sources[id].tier);
      const nonT3 = tiers.filter((t) => t !== "T3");
      expect(nonT3.length).toBeGreaterThanOrEqual(1);
    }
  });

  it("所有来源都带最近验证日期", () => {
    for (const source of loaded.sources) {
      expect(source.lastVerified).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      // 来源保鲜告警：验证日期距今不应超过 12 个月
      const verified = new Date(source.lastVerified).getTime();
      const ageMs = Date.now() - verified;
      expect(ageMs).toBeLessThan(366 * 24 * 60 * 60 * 1000);
    }
  });
});

describe("图谱自洽性", () => {
  it("全图无环，拓扑排序可完成", () => {
    expect(() => topoSortNodes(loaded.nodes)).not.toThrow();
  });

  it("每个节点的前置与其处于同一轨道", () => {
    const byId = new Map(loaded.nodes.map((n) => [n.id, n]));
    for (const node of loaded.nodes) {
      for (const pre of node.prerequisites) {
        const preNode = byId.get(pre);
        expect(preNode).toBeDefined();
        // 前置节点必须与当前节点共享至少一条轨道
        const shared = node.tracks.some((t) => preNode?.tracks.includes(t));
        expect(shared).toBe(true);
      }
    }
  });

  it("每个节点归属至少一个已定义阶段", () => {
    for (const node of loaded.nodes) {
      for (const trackId of node.tracks) {
        const track = loaded.tracks.find((t) => t.id === trackId);
        expect(track?.phases.some((p) => p.index === node.phase)).toBe(true);
      }
    }
  });
});

describe("教学完备性", () => {
  it("每个节点都有前端迁移映射（旗舰轨道的要求）", () => {
    const flagshipNodes = loaded.nodes.filter((n) =>
      n.tracks.includes("frontend-to-ai-engineer"),
    );
    for (const node of flagshipNodes) {
      expect(
        node.frontendBridge,
        `节点 ${node.id} 缺少 frontendBridge`,
      ).toBeTruthy();
    }
  });

  it("每个节点都有面试题与追问", () => {
    for (const node of loaded.nodes) {
      expect(node.interview.length).toBeGreaterThanOrEqual(1);
      for (const item of node.interview) {
        expect(item.followups.length).toBeGreaterThanOrEqual(1);
      }
    }
  });

  it("里程碑项目节点必须挂 V3 验证与 Rubric", () => {
    const milestones = loaded.nodes.filter((n) => n.id.startsWith("project."));
    expect(milestones.length).toBeGreaterThanOrEqual(2);
    for (const node of milestones) {
      expect(["V3", "V4"]).toContain(node.masteryCheck.level);
      expect(node.masteryCheck.rubricId).toBeTruthy();
    }
  });

  it("每个节点的验证链可从 V1 逐级推导", () => {
    for (const node of loaded.nodes) {
      const levels = requiredLevels(node);
      expect(levels[0]).toBe("V1");
      expect(levels[levels.length - 1]).toBe(node.masteryCheck.level);
    }
  });
});

describe("路径引擎端到端（真实内容）", () => {
  const TRACK = "frontend-to-ai-engineer";

  it("零基础路径覆盖全部节点且天数合理", () => {
    const path = computePath(graph, {
      trackId: TRACK,
      knownNodeIds: [],
      dailyMinutes: 120,
    });
    const trackNodeCount = loaded.nodes.filter((n) =>
      n.tracks.includes(TRACK),
    ).length;
    expect(path.orderedNodeIds).toHaveLength(trackNodeCount);
    // 每天 2 小时，总时长应在 5-90 天之间
    // （Phase 0-4 全程：语言桥接 + LLM API + RAG + Agent + 工程化 + Capstone，
    // 完整前端转 AI 工程师路径，38-45 天为当前规模典型值）
    expect(path.totalDays).toBeGreaterThanOrEqual(5);
    expect(path.totalDays).toBeLessThanOrEqual(90);
  });

  it("入学评估跳过 Python 基础后路径缩短", () => {
    const pythonNodes = loaded.nodes
      .filter((n) => n.id.startsWith("python."))
      .map((n) => n.id);
    const path = computePath(graph, {
      trackId: TRACK,
      knownNodeIds: pythonNodes,
      dailyMinutes: 120,
    });
    expect(path.skippedNodeIds).toEqual(pythonNodes.sort());
    expect(path.orderedNodeIds).not.toContain("python.for-js-devs");
    // 跳过前置后，依赖它们的节点仍在路径中且可用
    expect(path.orderedNodeIds).toContain("project.cli-llm-tool");
  });

  it("里程碑项目排在其前置节点之后", () => {
    const path = computePath(graph, {
      trackId: TRACK,
      knownNodeIds: [],
      dailyMinutes: 120,
    });
    const order = path.orderedNodeIds;
    expect(order.indexOf("project.cli-llm-tool")).toBeGreaterThan(
      order.indexOf("llm.streaming-basics"),
    );
    expect(order.indexOf("project.streaming-chat-app")).toBeGreaterThan(
      order.indexOf("frontend.streaming-ux"),
    );
  });

  it("策展图谱可无损适配为既有 KnowledgeNode 类型", () => {
    const trackNodes = loaded.nodes.filter((n) => n.tracks.includes(TRACK));
    const adapted = toKnowledgeNodes(trackNodes);
    expect(adapted).toHaveLength(trackNodes.length);
    for (const node of adapted) {
      expect(node.mastery).toBe(0);
      expect(node.summary.length).toBeGreaterThan(10);
      expect(["高", "中", "低"]).toContain(node.frequency);
    }
  });
});
