// lib/presets/ai/index.ts
// AI 算法工程师面试全攻略预设：聚合知识树与各域题库，生成学习计划
// 覆盖：机器学习基础 → 深度学习 → CV → NLP → 推荐系统 → 强化学习 → 前沿与部署
// 大厂高频题答案结合真实项目场景（字节抖音推荐/阿里电商搜索/腾讯广告/百度凤巢等）

import type { Question, ScheduleItem } from "../../types";
import { AI_NODES } from "./nodes";
import { ML_QUESTIONS } from "./questions-ml";
import { DL_QUESTIONS } from "./questions-dl";
import { CV_QUESTIONS } from "./questions-cv";
import { NLP_QUESTIONS } from "./questions-nlp";
import { REC_RL_QUESTIONS } from "./questions-rec-rl";
import { FRONTIER_QUESTIONS } from "./questions-frontier";

const AI_QUESTIONS: Question[] = [
  ...ML_QUESTIONS,
  ...DL_QUESTIONS,
  ...CV_QUESTIONS,
  ...NLP_QUESTIONS,
  ...REC_RL_QUESTIONS,
  ...FRONTIER_QUESTIONS,
];

// 按拓扑顺序生成学习计划：AI_NODES 数组顺序已按 prerequisites 拓扑排列，
// 每天最多学 2 个新节点（day = floor(idx/2)+1），次日复习当天所学；
// 节点数变化时天数自动适应，保证每天 1-2 个 learn + 1 个 review。
function buildSchedule(): ScheduleItem[] {
  // 拓扑顺序：AI_NODES 已按 prerequisites 排列，直接取数组顺序
  const order = AI_NODES.map((n) => n.id);

  const schedule: ScheduleItem[] = [];
  order.forEach((nodeId, idx) => {
    // 每天最多 2 个 learn：第 0、1 个在 day1，第 2、3 个在 day2...
    const day = Math.floor(idx / 2) + 1;
    const node = AI_NODES[idx];
    // learn 估计时间 = difficulty * 8 分钟
    schedule.push({
      day,
      nodeId,
      type: "learn",
      estimatedMinutes: node.difficulty * 8,
      completed: false,
    });
    // 当天所学次日复习
    schedule.push({
      day: day + 1,
      nodeId,
      type: "review",
      estimatedMinutes: 5,
      completed: false,
    });
  });
  return schedule;
}

export const AI_PRESET = {
  topic: "AI 算法工程师",
  knowledgeTree: AI_NODES,
  questions: AI_QUESTIONS,
  schedule: buildSchedule(),
};
