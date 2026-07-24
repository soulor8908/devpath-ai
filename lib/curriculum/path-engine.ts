import { topoSortNodes } from "@/lib/curriculum/graph";
import type {
  CurriculumGraph,
  LearningPath,
  PathDay,
  PathRequest,
  SkillNode,
  KnowledgeNode,
} from "@/lib/types";

/**
 * L2 路径引擎：从策展图谱推导个性化学习路径。
 *
 * 第一性原理：学习效率 = 路径优化。给定目标技能图与已掌握集合 S₀，
 * 最优路径是图的拓扑排序中跳过 S₀ 的最短序列。
 * 已掌握节点视为其依赖边的「已满足」，其后续节点可直接解锁。
 */

export class PathEngineError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PathEngineError";
  }
}

/** 计算个性化学习路径（纯函数，确定性输出） */
export function computePath(
  graph: CurriculumGraph,
  request: PathRequest,
): LearningPath {
  const track = graph.tracks.find((t) => t.id === request.trackId);
  if (!track) {
    throw new PathEngineError(`轨道不存在: ${request.trackId}`);
  }
  if (request.dailyMinutes <= 0) {
    throw new PathEngineError("dailyMinutes 必须为正数");
  }

  const trackNodes = graph.nodes.filter((n) =>
    n.tracks.includes(request.trackId),
  );
  const trackNodeIds = new Set(trackNodes.map((n) => n.id));
  const known = new Set(
    request.knownNodeIds.filter((id) => trackNodeIds.has(id)),
  );

  // 待学集合：剔除已掌握；前置边若指向已掌握/非本轨道节点，视为已满足
  const remaining = trackNodes
    .filter((n) => !known.has(n.id))
    .map((n) => ({
      ...n,
      prerequisites: n.prerequisites.filter(
        (p) => trackNodeIds.has(p) && !known.has(p),
      ),
    }));

  const orderedNodeIds = topoSortNodes(remaining);
  const skippedNodeIds = trackNodes
    .filter((n) => known.has(n.id))
    .map((n) => n.id)
    .sort();

  const byId = new Map(remaining.map((n) => [n.id, n]));
  const days = scheduleDays(
    orderedNodeIds.map((id) => byId.get(id) as SkillNode),
    request.dailyMinutes,
  );
  const totalMinutes = remaining.reduce((s, n) => s + n.estimatedMinutes, 0);

  return {
    trackId: request.trackId,
    orderedNodeIds,
    skippedNodeIds,
    totalMinutes,
    totalDays: days.length,
    days,
  };
}

/**
 * 贪心排程：按拓扑序依次装箱，节点不可分割（一个节点完整放入某一天）。
 * 超大节点（超过单日容量）独占一天。
 */
function scheduleDays(nodes: SkillNode[], dailyMinutes: number): PathDay[] {
  const days: PathDay[] = [];
  let current: PathDay = { day: 1, nodeIds: [], totalMinutes: 0 };

  for (const node of nodes) {
    const fits =
      current.nodeIds.length === 0 ||
      current.totalMinutes + node.estimatedMinutes <= dailyMinutes;
    if (!fits) {
      days.push(current);
      current = { day: current.day + 1, nodeIds: [], totalMinutes: 0 };
    }
    current.nodeIds.push(node.id);
    current.totalMinutes += node.estimatedMinutes;
  }
  if (current.nodeIds.length > 0) days.push(current);
  return days;
}

/**
 * 适配器：把策展节点映射为现有 KnowledgeNode 类型，
 * 使 plan-generator / FSRS / 脑图等既有模块可以直接消费策展图谱，
 * 无需改动交付层（L4）代码。
 */
export function toKnowledgeNodes(nodes: SkillNode[]): KnowledgeNode[] {
  const order = topoSortNodes(nodes);
  return order.map((id, index) => {
    const n = nodes.find((node) => node.id === id) as SkillNode;
    return {
      id: n.id,
      title: n.title,
      difficulty: n.difficulty,
      prerequisites: n.prerequisites,
      frequency: difficultyToFrequency(n.difficulty),
      summary: buildSummary(n),
      mastery: 0,
      customOrder: index,
    };
  });
}

function difficultyToFrequency(
  difficulty: SkillNode["difficulty"],
): KnowledgeNode["frequency"] {
  // 策展内容均来自岗位 JD 交集，难度高的核心节点通常也是高频面试点
  if (difficulty >= 4) return "高";
  if (difficulty >= 2) return "中";
  return "低";
}

function buildSummary(node: SkillNode): string {
  const parts = [node.summary];
  if (node.frontendBridge) {
    parts.push(`前端迁移：${node.frontendBridge}`);
  }
  parts.push(`概念：${node.concepts.join("；")}`);
  if (node.gotchas.length > 0) {
    parts.push(`坑点：${node.gotchas.join("；")}`);
  }
  return parts.join("\n");
}
