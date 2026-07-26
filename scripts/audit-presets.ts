/**
 * 预置知识库量化体检脚本（一次性审计工具，不进 CI）
 * 用法：npx tsx scripts/audit-presets.ts
 *
 * 注意：preset 数据已改为运行时 fetch JSON（v3，修复 Worker bundle > 3MB 部署失败），
 * 脚本直接 import TS 源模块（不走 fetch，保证校验源码内容）。
 */
import { PRESET_METAS, type PresetMeta } from "../lib/presets";
import { FRONTEND_TO_AI_ENGINEER_PRESET } from "../lib/presets/frontend-to-ai-engineer";
import { ALGORITHM_200_PRESET } from "../lib/presets/algorithm-200";
import { FRONTEND_PRESET } from "../lib/presets/frontend";
import { BACKEND_PRESET } from "../lib/presets/backend";
import { AI_PRESET } from "../lib/presets/ai";
import { LLM_APP_PRESET } from "../lib/presets/llm-app";

const PRESET_DATA_RECORD: Record<string, Omit<PresetMeta, keyof typeof PRESET_METAS[number]>> = {
  "frontend-to-ai-engineer": FRONTEND_TO_AI_ENGINEER_PRESET,
  "algorithm-200": ALGORITHM_200_PRESET,
  frontend: FRONTEND_PRESET,
  backend: BACKEND_PRESET,
  ai: AI_PRESET,
  "llm-app": LLM_APP_PRESET,
};

const FLAG_ANSWER_SHORT = 300; // 答案低于此字符数视为浅薄
const FLAG_ANSWER_MIN = 80; // 低于此视为严重残缺

interface PresetStats {
  id: string;
  nodes: number;
  questions: number;
  nodesWithoutQuestions: string[];
  answerLen: { min: number; avg: number; median: number; max: number };
  severeShort: { id: string; len: number }[];
  shallow: { id: string; len: number }[];
  missingKeyPoints: string[];
  missingFollowUps: string[];
  orphanQuestions: string[]; // nodeId 不在知识树中
  duplicateQuestions: string[];
  invalidPrereqs: { node: string; prereq: string }[];
}

function median(nums: number[]): number {
  const s = [...nums].sort((a, b) => a - b);
  const mid = Math.floor(s.length / 2);
  return s.length % 2 ? s[mid] : (s[mid - 1] + s[mid]) / 2;
}

function auditPreset(p: PresetMeta): PresetStats {
  const treeIds = new Set(p.knowledgeTree.map((n) => n.id));
  const answerLens = p.questions.map((q) => q.answer.length);
  const nodeQuestionCount = new Map<string, number>();
  const seenQuestions = new Map<string, number>();

  for (const q of p.questions) {
    nodeQuestionCount.set(q.nodeId, (nodeQuestionCount.get(q.nodeId) ?? 0) + 1);
    const key = q.question.trim().toLowerCase();
    seenQuestions.set(key, (seenQuestions.get(key) ?? 0) + 1);
  }

  const invalidPrereqs: { node: string; prereq: string }[] = [];
  for (const n of p.knowledgeTree) {
    for (const pre of n.prerequisites) {
      if (!treeIds.has(pre)) invalidPrereqs.push({ node: n.id, prereq: pre });
    }
  }

  return {
    id: p.id,
    nodes: p.knowledgeTree.length,
    questions: p.questions.length,
    nodesWithoutQuestions: p.knowledgeTree
      .filter((n) => !nodeQuestionCount.has(n.id))
      .map((n) => n.id),
    answerLen: {
      min: Math.min(...answerLens),
      avg: Math.round(answerLens.reduce((a, b) => a + b, 0) / answerLens.length),
      median: median(answerLens),
      max: Math.max(...answerLens),
    },
    severeShort: p.questions
      .filter((q) => q.answer.length < FLAG_ANSWER_MIN)
      .map((q) => ({ id: q.id, len: q.answer.length })),
    shallow: p.questions
      .filter(
        (q) => q.answer.length >= FLAG_ANSWER_MIN && q.answer.length < FLAG_ANSWER_SHORT,
      )
      .map((q) => ({ id: q.id, len: q.answer.length })),
    missingKeyPoints: p.questions
      .filter((q) => q.keyPoints.length === 0)
      .map((q) => q.id),
    missingFollowUps: p.questions
      .filter((q) => q.followUps.length === 0)
      .map((q) => q.id),
    orphanQuestions: p.questions
      .filter((q) => !treeIds.has(q.nodeId))
      .map((q) => q.id),
    duplicateQuestions: [...seenQuestions.entries()]
      .filter(([, count]) => count > 1)
      .map(([q]) => q.slice(0, 60)),
    invalidPrereqs,
  };
}

function main() {
  const presets: PresetMeta[] = PRESET_METAS.map((meta) => {
    const data = PRESET_DATA_RECORD[meta.id];
    if (!data) throw new Error(`preset ${meta.id} 缺少源数据`);
    return { ...meta, ...data };
  });

  const results = presets.map(auditPreset);

  for (const r of results) {
    console.log(`\n========== ${r.id} ==========`);
    console.log(
      `节点 ${r.nodes} | 题目 ${r.questions} | 题/节点 ${(r.questions / r.nodes).toFixed(1)}`,
    );
    console.log(
      `答案长度: min=${r.answerLen.min} avg=${r.answerLen.avg} median=${r.answerLen.median} max=${r.answerLen.max}`,
    );
    console.log(
      `严重残缺(<${FLAG_ANSWER_MIN}) ${r.severeShort.length} | 浅薄(<${FLAG_ANSWER_SHORT}) ${r.shallow.length} | 缺keyPoints ${r.missingKeyPoints.length} | 缺followUps ${r.missingFollowUps.length}`,
    );
    console.log(
      `无题节点 ${r.nodesWithoutQuestions.length} | 孤儿题 ${r.orphanQuestions.length} | 重复题 ${r.duplicateQuestions.length} | 悬空前置 ${r.invalidPrereqs.length}`,
    );
    if (r.severeShort.length > 0) {
      console.log(`  严重残缺: ${r.severeShort.map((s) => `${s.id}(${s.len})`).join(", ")}`);
    }
    if (r.nodesWithoutQuestions.length > 0) {
      console.log(`  无题节点: ${r.nodesWithoutQuestions.join(", ")}`);
    }
    if (r.orphanQuestions.length > 0) {
      console.log(`  孤儿题: ${r.orphanQuestions.join(", ")}`);
    }
    if (r.invalidPrereqs.length > 0) {
      console.log(
        `  悬空前置: ${r.invalidPrereqs.map((x) => `${x.node}→${x.prereq}`).join(", ")}`,
      );
    }
  }

  // 汇总浅答题数量（用于修复工作量评估）
  const totalShallow = results.reduce((s, r) => s + r.shallow.length, 0);
  const totalSevere = results.reduce((s, r) => s + r.severeShort.length, 0);
  const totalQ = results.reduce((s, r) => s + r.questions, 0);
  console.log(`\n===== 汇总 =====`);
  console.log(
    `总题数 ${totalQ} | 严重残缺 ${totalSevere} | 浅薄 ${totalShallow} | 健康 ${totalQ - totalSevere - totalShallow}`,
  );
}

void main();
