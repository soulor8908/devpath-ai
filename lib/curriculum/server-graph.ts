// lib/curriculum/server-graph.ts
// 服务端课程图谱访问器（API route 用）
//
// content/ 的 YAML 经 npm run content:compile 编译为
// public/data/curriculum-graph.json，本模块在服务端直接 import 该产物，
// 提供 by-id 查询（节点 / Rubric）。

import rawGraph from "@/public/data/curriculum-graph.json";
import type {
  CurriculumGraph,
  Rubric,
  SkillNode,
} from "@/lib/types/curriculum";

const graph = rawGraph as unknown as CurriculumGraph;

const nodeById = new Map<string, SkillNode>(graph.nodes.map((n) => [n.id, n]));
const rubricById = new Map<string, Rubric>(graph.rubrics.map((r) => [r.id, r]));

/** 按 id 查节点，不存在返回 undefined */
export function getNode(nodeId: string): SkillNode | undefined {
  return nodeById.get(nodeId);
}

/** 按 id 查 Rubric，不存在返回 undefined */
export function getRubric(rubricId: string): Rubric | undefined {
  return rubricById.get(rubricId);
}

/** 获取全部节点（用于路径引擎 / 全局统计） */
export function getAllNodes(): SkillNode[] {
  return graph.nodes;
}

/** 获取全部 Rubric */
export function getAllRubrics(): Rubric[] {
  return graph.rubrics;
}
