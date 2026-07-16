// lib/schedule.ts
// 学习计划编排：拓扑排序 + 每日分配
// Step 1: Kahn 算法 BFS，同层按 difficulty 升序
// Step 2: 每日容量 = dailyMinutes - 已安排复习时间
// Step 3: 学完当天加 1 张复习卡（明天到期）

import type { KnowledgeNode, ScheduleItem } from "./types";

// 节点耗时 = difficulty * 8min
export function nodeMinutes(node: KnowledgeNode): number {
  return node.difficulty * 8;
}

// 复习估计时间（分钟）
const REVIEW_MINUTES = 5;

// 拓扑排序（Kahn 算法 BFS，同层按 difficulty 升序）
export function topoSort(nodes: KnowledgeNode[]): KnowledgeNode[] {
  const nodeMap = new Map(nodes.map((n) => [n.id, n]));
  const inDegree = new Map(nodes.map((n) => [n.id, 0]));
  const adjList = new Map<string, string[]>(nodes.map((n) => [n.id, []]));

  // 构建有向图
  for (const node of nodes) {
    for (const prereq of node.prerequisites) {
      if (nodeMap.has(prereq)) {
        adjList.get(prereq)!.push(node.id);
        inDegree.set(node.id, (inDegree.get(node.id) || 0) + 1);
      }
    }
  }

  const result: KnowledgeNode[] = [];
  const visited = new Set<string>();

  // 按层处理，每层内按 difficulty 升序
  while (result.length < nodes.length) {
    const layer = nodes
      .filter((n) => !visited.has(n.id) && (inDegree.get(n.id) || 0) === 0)
      .sort((a, b) => a.difficulty - b.difficulty);

    if (layer.length === 0) {
      // 环或缺失依赖，追加剩余节点
      for (const node of nodes) {
        if (!visited.has(node.id)) {
          result.push(node);
          visited.add(node.id);
        }
      }
      break;
    }

    for (const node of layer) {
      visited.add(node.id);
      result.push(node);
    }

    // 递减下一层入度
    for (const node of layer) {
      for (const depId of adjList.get(node.id) || []) {
        inDegree.set(depId, (inDegree.get(depId) || 0) - 1);
      }
    }
  }

  return result;
}

// 每日分配
export function allocateDaily(
  topoSorted: KnowledgeNode[],
  dailyMinutes: number,
  maxNewPerDay: number
): ScheduleItem[] {
  const schedule: ScheduleItem[] = [];
  const reviewMinutesByDay = new Map<number, number>();

  let day = 1;
  let dayNewMinutes = 0;
  let dayNewCount = 0;

  for (const node of topoSorted) {
    const minutes = nodeMinutes(node);
    const reviewToday = reviewMinutesByDay.get(day) || 0;
    const availableForNew = dailyMinutes - reviewToday - dayNewMinutes;
    const fitsToday =
      availableForNew >= minutes && dayNewCount < maxNewPerDay;

    if (!fitsToday && (dayNewCount > 0 || dayNewMinutes > 0)) {
      // 移到下一天
      day++;
      dayNewMinutes = 0;
      dayNewCount = 0;
    }

    // 安排 learn
    schedule.push({
      day,
      nodeId: node.id,
      type: "learn",
      estimatedMinutes: minutes,
      completed: false,
    });
    dayNewMinutes += minutes;
    dayNewCount++;

    // 安排 review（下一天）
    const reviewDay = day + 1;
    schedule.push({
      day: reviewDay,
      nodeId: node.id,
      type: "review",
      estimatedMinutes: REVIEW_MINUTES,
      completed: false,
    });
    reviewMinutesByDay.set(
      reviewDay,
      (reviewMinutesByDay.get(reviewDay) || 0) + REVIEW_MINUTES
    );
  }

  return schedule;
}

// 完整编排：拓扑排序 + 每日分配
export function buildSchedule(
  nodes: KnowledgeNode[],
  dailyMinutes: number,
  maxNewPerDay: number
): ScheduleItem[] {
  return allocateDaily(topoSort(nodes), dailyMinutes, maxNewPerDay);
}
