// lib/ai/question.ts
// 面试题生成：对每个 KnowledgeNode 并行生成面试题
// 分批 5 个一组，单节点失败不影响其他

import { generateObject } from "ai";
import type { LanguageModel } from "ai";
import { z } from "zod";
import { nanoid } from "nanoid";
import { createAIProvider } from "./provider";
import { getPrompt } from "./prompts";
import type { KnowledgeNode, Question } from "../types";

// 从 Prompt Registry 读取
const PROMPT_DEF = getPrompt("question_generate");

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

async function generateOne(node: KnowledgeNode, model: LanguageModel): Promise<Question> {
  try {
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
  } catch (e) {
    const errMsg = e instanceof Error ? e.message : String(e);
    return {
      id: nanoid(),
      nodeId: node.id,
      question: "生成失败，点击重试",
      answer: `[ERROR] ${errMsg}`,
      keyPoints: [],
      followUps: [],
      favorited: false,
      bigTech: false,
    };
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
