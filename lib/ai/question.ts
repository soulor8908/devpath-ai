// lib/ai/question.ts
// 面试题生成：对每个 KnowledgeNode 并行生成面试题
// 分批 5 个一组，单节点失败不影响其他
//
// 修复（用户需求 3）：题目"全部生成失败"
//   - 原版：generateObject 在 schema 校验失败 / 模型不支持 JSON mode / 网络抖动时直接 catch 返回占位 Question
//   - 新版：单题失败时自动重试 1 次（短延迟），重试仍失败才返回占位
//   - 同时把 schema 中的 keyPoints/followUps 用 .default([]) 兜底，避免模型偶尔漏字段导致整题失败
//   - 加 console.error 输出真实错误信息，便于线上诊断（占位 Question 只暴露简要 errMsg 给 UI）

import { generateObject } from "ai";
import type { LanguageModel } from "ai";
import { z } from "zod";
import { nanoid } from "nanoid";
import { createAIProvider } from "./provider";
import { getPrompt } from "./prompts";
import type { KnowledgeNode, Question } from "../types";

// 从 Prompt Registry 读取
const PROMPT_DEF = getPrompt("question_generate");

/** 单题失败时的重试延迟（毫秒），用于短暂退避 */
const RETRY_DELAY_MS = 800;

const questionSchema = z.object({
  question: z.string(),
  answer: z.string(),
  // 使用默认值避免 AI 偶尔漏字段时整个生成失败（用户的 bug 报告：
  // "生成代码部分题目失败后点击重新生成报异常 keyPoints/followUps/bigTech Required"）
  keyPoints: z.array(z.string()).default([]),
  followUps: z.array(z.string()).default([]),
  codeSnippet: z.string().optional(),
  bigTech: z.boolean().describe("是否大厂高频面试题").default(false),
});

function chunk<T>(arr: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size));
  }
  return chunks;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * 单次调用 AI 生成一道题（不含重试，失败直接抛错）
 * 抽出便于 generateOne 实现"重试 1 次"逻辑
 */
async function callGenerateOnce(node: KnowledgeNode, model: LanguageModel): Promise<Question> {
  const result = await generateObject({
    model,
    schema: questionSchema,
    system: PROMPT_DEF.system,
    prompt: `知识点：${node.title}\n描述：${node.summary}\n难度：${node.difficulty}\n面试频率：${node.frequency}`,
  });
  return {
    id: nanoid(),
    nodeId: node.id,
    question: result.object.question,
    answer: result.object.answer,
    keyPoints: result.object.keyPoints,
    followUps: result.object.followUps,
    codeSnippet: result.object.codeSnippet,
    bigTech: result.object.bigTech,
    favorited: false,
  };
}

/**
 * 生成单道题（带 1 次自动重试）
 *
 * 重试触发条件：generateObject 抛出任何错误（schema 校验失败 / 模型不支持 / 网络抖动 / 超时）
 * 重试策略：固定延迟 800ms 后再试 1 次，仍失败才返回占位 Question
 *
 * 占位 Question 的 question 字段使用 sentinel string "生成失败，点击重试"，
 * QuestionCard 通过字符串相等识别失败态并显示红色"重新生成"按钮
 */
async function generateOne(node: KnowledgeNode, model: LanguageModel): Promise<Question> {
  try {
    return await callGenerateOnce(node, model);
  } catch (firstErr) {
    // 短延迟后重试 1 次
    const firstMsg = firstErr instanceof Error ? firstErr.message : String(firstErr);
    console.error(`[question_generate] 第一次失败 (node=${node.id}, title=${node.title}): ${firstMsg}`);
    await sleep(RETRY_DELAY_MS);
    try {
      const retryResult = await callGenerateOnce(node, model);
      console.info(`[question_generate] 重试成功 (node=${node.id})`);
      return retryResult;
    } catch (secondErr) {
      const secondMsg = secondErr instanceof Error ? secondErr.message : String(secondErr);
      console.error(`[question_generate] 重试仍失败 (node=${node.id}): ${secondMsg}`);
      return {
        id: nanoid(),
        nodeId: node.id,
        question: "生成失败，点击重试",
        answer: `[ERROR] 第一次: ${firstMsg}；重试: ${secondMsg}`,
        keyPoints: [],
        followUps: [],
        favorited: false,
        bigTech: false,
      };
    }
  }
}

export async function generateQuestions(nodes: KnowledgeNode[], model?: LanguageModel): Promise<Question[]> {
  const aiModel = model ?? createAIProvider();
  const batches = chunk(nodes, 5);
  const results: Question[] = [];
  for (const batch of batches) {
    const batchResults = await Promise.all(batch.map((n) => generateOne(n, aiModel)));
    results.push(...batchResults);
  }
  return results;
}

export async function regenerateQuestion(node: KnowledgeNode, model?: LanguageModel): Promise<Question> {
  const aiModel = model ?? createAIProvider();
  return generateOne(node, aiModel);
}

export { chunk };
