import type { LoadedCurriculum } from "@/lib/curriculum/loader";
import { ContentLoadError } from "@/lib/curriculum/content-load-error";
import type {
  CurriculumGraph,
  SourceTier,
  SkillNode,
} from "@/lib/types/curriculum";

/**
 * 图谱构建与跨文件校验。
 *
 * 校验规则（对应 redesign 的权威体系）：
 * G1 所有 prerequisites 必须指向存在的节点
 * G2 所有 sourceIds 必须指向登记处中的来源
 * G3 每个节点 ≥2 条来源，且至少 1 条为 T0/T1（权威硬约束）
 * G4 依赖图必须无环（Kahn 拓扑排序检测）
 * G5 节点引用的 track 必须存在；节点 phase 必须在轨道 phases 范围内
 * G6 masteryCheck.rubricId 若存在，必须指向存在的 Rubric；
 *    V3/V4 级验证必须挂 Rubric
 * G7 每个 Rubric 的 criteria 权重之和必须为 100
 */

const TIER_RANK: Record<SourceTier, number> = { T0: 0, T1: 1, T2: 2, T3: 3 };

export function buildCurriculumGraph(
  loaded: LoadedCurriculum,
): CurriculumGraph {
  validate(loaded);
  const sourceMap: CurriculumGraph["sources"] = {};
  for (const s of loaded.sources) sourceMap[s.id] = s;
  return {
    version: 1,
    builtAt: new Date().toISOString(),
    sources: sourceMap,
    nodes: loaded.nodes,
    tracks: loaded.tracks,
    rubrics: loaded.rubrics,
  };
}

function validate(loaded: LoadedCurriculum): void {
  const { sources, nodes, tracks, rubrics } = loaded;
  const sourceIds = new Set(sources.map((s) => s.id));
  const nodeIds = new Set(nodes.map((n) => n.id));
  const trackById = new Map(tracks.map((t) => [t.id, t]));
  const rubricIds = new Set(rubrics.map((r) => r.id));

  const fail = (msg: string): never => {
    throw new ContentLoadError("(graph)", msg);
  };

  for (const node of nodes) {
    // G1
    for (const pre of node.prerequisites) {
      if (!nodeIds.has(pre)) {
        fail(`节点 ${node.id} 的前置依赖不存在: ${pre}`);
      }
      if (pre === node.id) {
        fail(`节点 ${node.id} 不能依赖自身`);
      }
    }
    // G2 + G3
    if (node.sourceIds.length < 2) {
      fail(`节点 ${node.id} 来源不足 2 条`);
    }
    let bestTier = Number.POSITIVE_INFINITY;
    for (const sid of node.sourceIds) {
      const src = sources.find((s) => s.id === sid);
      if (!src || !sourceIds.has(sid)) {
        throw new ContentLoadError(
          "(graph)",
          `节点 ${node.id} 引用了未登记的来源: ${sid}`,
        );
      }
      bestTier = Math.min(bestTier, TIER_RANK[src.tier]);
    }
    if (bestTier > TIER_RANK.T1) {
      fail(`节点 ${node.id} 缺少 T0/T1 级权威来源（当前最高仅 T${bestTier}）`);
    }
    // G5
    for (const trackId of node.tracks) {
      const track = trackById.get(trackId);
      if (!track) {
        fail(`节点 ${node.id} 属于不存在的轨道: ${trackId}`);
      } else if (!track.phases.some((p) => p.index === node.phase)) {
        fail(`节点 ${node.id} 的 phase=${node.phase} 不在轨道 ${trackId} 的阶段定义中`);
      }
    }
    // G6
    if (
      (node.masteryCheck.level === "V3" || node.masteryCheck.level === "V4") &&
      !node.masteryCheck.rubricId
    ) {
      fail(`节点 ${node.id} 的 ${node.masteryCheck.level} 验证必须挂载 Rubric`);
    }
    if (node.masteryCheck.rubricId && !rubricIds.has(node.masteryCheck.rubricId)) {
      fail(`节点 ${node.id} 引用了不存在的 Rubric: ${node.masteryCheck.rubricId}`);
    }
  }

  // G7
  for (const rubric of rubrics) {
    const total = rubric.criteria.reduce((sum, c) => sum + c.weight, 0);
    if (total !== 100) {
      fail(`Rubric ${rubric.id} 的权重之和为 ${total}，必须为 100`);
    }
  }

  // G4
  topoSortNodes(nodes);
}

/**
 * Kahn 拓扑排序。同时充当环检测器（G4）。
 * 排序稳定性：同一可用集合内按 (phase, id) 字典序，保证产物确定性。
 */
export function topoSortNodes(nodes: SkillNode[]): string[] {
  const ids = new Set(nodes.map((n) => n.id));
  const byId = new Map(nodes.map((n) => [n.id, n]));
  const indegree = new Map<string, number>();
  const dependents = new Map<string, string[]>();

  for (const n of nodes) {
    const edges = n.prerequisites.filter((p) => ids.has(p));
    indegree.set(n.id, edges.length);
    for (const p of edges) {
      const list = dependents.get(p) ?? [];
      list.push(n.id);
      dependents.set(p, list);
    }
  }

  const ready = nodes
    .filter((n) => (indegree.get(n.id) ?? 0) === 0)
    .map((n) => n.id)
    .sort(compareByPhaseThenId(byId));

  const order: string[] = [];
  while (ready.length > 0) {
    const id = ready.shift() as string;
    order.push(id);
    for (const next of dependents.get(id) ?? []) {
      const d = (indegree.get(next) ?? 0) - 1;
      indegree.set(next, d);
      if (d === 0) {
        // 插入并保持有序，避免每次全量排序
        ready.push(next);
        ready.sort(compareByPhaseThenId(byId));
      }
    }
  }

  if (order.length !== nodes.length) {
    const remaining = nodes
      .map((n) => n.id)
      .filter((id) => !order.includes(id));
    throw new ContentLoadError(
      "(graph)",
      `依赖图存在环，涉及节点: ${remaining.join(", ")}`,
    );
  }
  return order;
}

function compareByPhaseThenId(
  byId: Map<string, SkillNode>,
): (a: string, b: string) => number {
  return (a, b) => {
    const pa = byId.get(a)?.phase ?? 0;
    const pb = byId.get(b)?.phase ?? 0;
    if (pa !== pb) return pa - pb;
    return a.localeCompare(b);
  };
}
