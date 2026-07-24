// lib/presets/frontend-to-ai-engineer.ts
// 旗舰轨道预设：「前端工程师 → AI 工程师」（Content-as-Code 策展内容）
//
// 与其他 preset 的区别：
//   - 其余 preset 是手工维护的静态 TS 数据
//   - 本预设由 content/ 目录的策展 YAML 编译产物（public/data/curriculum-graph.json）
//     经 L2 路径引擎（computePath）与适配器（toKnowledgeNodes）推导生成
//   - 内容更新流程：改 content/ → npm run content:compile → 本预设自动更新
//   - content:validate（quality-gate 一部分）会校验编译产物新鲜度，防止打包陈旧内容

import rawGraph from "@/public/data/curriculum-graph.json";
import type {
  CurriculumGraph,
  KnowledgeNode,
  Question,
  ScheduleItem,
  SkillNode,
} from "../types";
import { computePath, toKnowledgeNodes } from "../curriculum/path-engine";

// 编译产物由 content:compile 从校验过的 YAML 生成，形状受 schema 约束
const graph = rawGraph as unknown as CurriculumGraph;

export const CURRICULUM_TRACK_ID = "frontend-to-ai-engineer";

/** 排程假设：每日 60 分钟（与职业卡 dailyMinutesDefault 对齐） */
const SCHEDULE_DAILY_MINUTES = 60;

function trackNodes(): SkillNode[] {
  return graph.nodes.filter((n) => n.tracks.includes(CURRICULUM_TRACK_ID));
}

// ====================================================================
// 知识树：策展节点 → 现有 KnowledgeNode（拓扑序，交付层零改动消费）
// ====================================================================

const NODES: KnowledgeNode[] = toKnowledgeNodes(trackNodes());

// ====================================================================
// 面试题：节点入库的 interview（题目 + 答案骨架 + 追问）→ Question
// ====================================================================

function buildQuestions(nodes: SkillNode[]): Question[] {
  const questions: Question[] = [];
  for (const node of nodes) {
    node.interview.forEach((iq, i) => {
      questions.push({
        id: `${node.id}--q${i + 1}`,
        nodeId: node.id,
        question: iq.q,
        answer: iq.answerSkeleton,
        keyPoints: node.concepts.slice(0, 3),
        followUps: iq.followups,
        favorited: false,
        bigTech: node.difficulty >= 3,
      });
    });
  }
  return questions;
}

const QUESTIONS: Question[] = buildQuestions(trackNodes());

// ====================================================================
// 学习计划：L2 路径引擎排程（拓扑序 + 每日分钟装箱）+ 次日复习
// ====================================================================

function buildSchedule(): ScheduleItem[] {
  const path = computePath(graph, {
    trackId: CURRICULUM_TRACK_ID,
    knownNodeIds: [],
    dailyMinutes: SCHEDULE_DAILY_MINUTES,
  });
  const byId = new Map(graph.nodes.map((n) => [n.id, n]));
  const schedule: ScheduleItem[] = [];
  for (const day of path.days) {
    for (const nodeId of day.nodeIds) {
      const node = byId.get(nodeId);
      schedule.push({
        day: day.day,
        nodeId,
        type: "learn",
        estimatedMinutes: node?.estimatedMinutes ?? 30,
        completed: false,
      });
      schedule.push({
        day: day.day + 1,
        nodeId,
        type: "review",
        estimatedMinutes: 5,
        completed: false,
      });
    }
  }
  return schedule;
}

export const FRONTEND_TO_AI_ENGINEER_PRESET = {
  topic: "前端工程师 → AI 工程师",
  knowledgeTree: NODES,
  questions: QUESTIONS,
  schedule: buildSchedule(),
};
