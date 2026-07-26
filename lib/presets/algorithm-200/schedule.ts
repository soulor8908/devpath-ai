// lib/presets/algorithm-200/schedule.ts
// 学习计划：18 个专题，每个先 learn 后 review，每天 2 项，共 18 天
// 时间预算：learn ≈ 每题 30 分钟，review ≈ 每题 15 分钟（按各节点实际题量计算）

import type { ScheduleItem } from "../../types";

// [nodeId, 题目数] —— 与 questions/ 目录下各文件实际题量一一对应
const NODE_QUESTION_COUNTS: [string, number][] = [
  // Phase 1：基础筑基
  ["p1-array-string", 16],
  ["p1-hash", 10],
  ["p1-linkedlist", 10],
  ["p1-stack-queue", 12],
  ["p1-tree", 13],
  ["p1-backtrack", 8],
  ["p1-sort-binary", 11],
  ["p1-bit-math", 8],
  // Phase 2：进阶突破
  ["p2-prefix-sum", 7],
  ["p2-dp", 21],
  ["p2-graph", 12],
  ["p2-heap", 8],
  ["p2-greedy", 8],
  ["p2-string-adv", 9],
  ["p2-design", 7],
  ["p2-highfreq", 10],
  // Phase 3：冲刺保温
  ["p3-bytedance-tencent", 16],
  ["p3-ali-meituan", 14],
];

export function buildSchedule(): ScheduleItem[] {
  const order: [string, "learn" | "review", number][] = [];
  for (const [nodeId, count] of NODE_QUESTION_COUNTS) {
    order.push([nodeId, "learn", count * 30]);
    order.push([nodeId, "review", count * 15]);
  }
  return order.map(([nodeId, type, minutes], idx) => ({
    day: Math.floor(idx / 2) + 1, // 每 2 项一天，共 18 天
    nodeId,
    type,
    estimatedMinutes: minutes,
    completed: false,
  }));
}
