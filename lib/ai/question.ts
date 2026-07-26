// lib/ai/question.ts
// 面试题生成：对每个 KnowledgeNode 生成面试题
//
// 两条生成路径：
//   1. generateQuestionStems（学习向导 step2 批量）：stem-only 精简输出
//      - 只产 { question, bigTech }，答案由 step3 流式生成（/api/learn/answers）
//      - 2026-07-26 根因修复（用户第三次反馈"题目全部生成失败"）：
//        旧版批量路径要求模型一次输出 question + 200-500字 answer + keyPoints +
//        followUps + codeSnippet 的大 JSON，且 5 路并发：
//          a) 大输出在 provider 默认 max_tokens 下易截断 → JSON 非法 → schema 校验失败
//          b) 5 并发 × 大输出触发 GLM/DeepSeek 等免费档限流（429）
//          c) 降级 generateText 用同一重 prompt，同样截断 → 重试仍败 → 整批占位
//          d) 生成的 answer 被 /api/learn/questions route 直接丢弃（纯浪费 token）
//        对比能用的 knowledge_decompose：单调用 + 小输出 + 全 required schema。
//        现批量路径对齐该模式：小 schema（全 required）+ 小输出 + 并发降为 3。
//   2. generateQuestions（旧版 /api/learn 整计划路由）+ regenerateQuestion（详情页单题）：
//      保留完整字段输出（answer/keyPoints/followUps），因为这两个场景没有
//      step3 流式补答案环节。单题/整计划调用频率低，大输出风险可接受。
//
// 共同的容错策略（两条路径一致）：
//   - generateObject 失败 → 降级 generateText + 手动 JSON 解析（剥离 fence + 截取首尾花括号）
//   - 单题失败自动重试 1 次（800ms 退避），仍失败返回占位 Question
//   - 占位 question = "生成失败，点击重试"（QuestionCard 以此 sentinel 识别失败态）
//   - 批量路径聚合 firstError 透出给 API 响应，让用户能看到真实失败原因
//     （旧版真实错误只埋在占位 answer 字段里，route 又把 answer 清空 → 用户完全不可见）

import { generateObject, generateText } from "ai";
import type { LanguageModel } from "ai";
import { z } from "zod";
import { nanoid } from "nanoid";
import { createAIProvider } from "./provider";
import { getPrompt } from "./prompts";
import type { KnowledgeNode, Question } from "../types";

// 从 Prompt Registry 读取
const PROMPT_DEF = getPrompt("question_generate");
const STEM_PROMPT_DEF = getPrompt("question_stem_generate");

/** 单题失败时的重试延迟（毫秒），用于短暂退避 */
const RETRY_DELAY_MS = 800;

/** 批量生成并发度：3 路（与 /api/learn/answers 的 CONCURRENCY 对齐） */
const BULK_CONCURRENCY = 3;

/** 失败占位题的 sentinel 文本（QuestionCard / questions route 依赖此值识别失败态） */
export const FAILED_QUESTION_SENTINEL = "生成失败，点击重试";

/**
 * stem-only schema：全 required（对齐 knowledge_decompose 的可用模式）。
 * 部分 OpenAI 兼容 provider 的 tool-calling 对 optional/default 字段处理不稳定，
 * 小 schema + 全 required 是最稳妥的组合。
 */
const stemSchema = z.object({
  question: z.string(),
  bigTech: z.boolean(),
});

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

function buildNodePrompt(node: KnowledgeNode): string {
  return `知识点：${node.title}\n描述：${node.summary}\n难度：${node.difficulty}\n面试频率：${node.frequency}`;
}

/**
 * 从 generateText 的纯文本返回中手动解析 JSON 对象。
 * 容错：剥离 markdown fence → 截取首个 { 到最后一个 } → JSON.parse。
 * 失败时抛错（由调用方 catch 后走重试/占位逻辑）。
 */
function extractJsonObject(raw: string): unknown {
  let text = raw.trim();
  // 剥离 markdown fence（```json ... ``` 或 ``` ... ```）
  const fenceMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  if (fenceMatch && fenceMatch[1]) {
    text = fenceMatch[1].trim();
  }
  // 截取首尾花括号（去除前后解释文字）
  const firstBrace = text.indexOf("{");
  const lastBrace = text.lastIndexOf("}");
  if (firstBrace === -1 || lastBrace === -1 || lastBrace <= firstBrace) {
    throw new Error(`文本中未找到 JSON 对象：${text.slice(0, 100)}`);
  }
  const jsonStr = text.slice(firstBrace, lastBrace + 1);
  try {
    return JSON.parse(jsonStr);
  } catch (e) {
    throw new Error(
      `JSON.parse 失败：${e instanceof Error ? e.message : String(e)}；原文：${jsonStr.slice(0, 200)}`,
    );
  }
}

/** 宽松解析 stem JSON：bigTech 缺失时默认 false（不因次要字段缺失判失败） */
function parseStemFromText(raw: string): z.infer<typeof stemSchema> {
  const parsed = extractJsonObject(raw);
  const result = stemSchema.safeParse(parsed);
  if (result.success) return result.data;
  // bigTech 缺失/类型错时降级：只要 question 存在即算成功
  if (
    parsed !== null &&
    typeof parsed === "object" &&
    typeof (parsed as Record<string, unknown>).question === "string" &&
    ((parsed as Record<string, unknown>).question as string).trim().length > 0
  ) {
    return {
      question: (parsed as Record<string, unknown>).question as string,
      bigTech: (parsed as Record<string, unknown>).bigTech === true,
    };
  }
  throw new Error(`stem schema 校验失败：${result.error.issues[0]?.message ?? "未知"}`);
}

function makePlaceholder(node: KnowledgeNode, firstMsg: string, secondMsg: string): Question {
  return {
    id: nanoid(),
    nodeId: node.id,
    question: FAILED_QUESTION_SENTINEL,
    answer: `[ERROR] 第一次: ${firstMsg}；重试: ${secondMsg}`,
    keyPoints: [],
    followUps: [],
    favorited: false,
    bigTech: false,
  };
}

interface GenerateOutcome {
  question: Question;
  /** 最终失败时的聚合错误信息（成功时为 null） */
  error: string | null;
}

/**
 * 通用单题生成（带 1 次自动重试）。
 * callOnce 封装"generateObject → 降级 generateText"的完整单次尝试。
 */
async function generateWithRetry(
  node: KnowledgeNode,
  callOnce: () => Promise<Question>,
  label: string,
): Promise<GenerateOutcome> {
  try {
    return { question: await callOnce(), error: null };
  } catch (firstErr) {
    const firstMsg = firstErr instanceof Error ? firstErr.message : String(firstErr);
    console.error(`[${label}] 第一次失败 (node=${node.id}, title=${node.title}): ${firstMsg}`);
    await sleep(RETRY_DELAY_MS);
    try {
      const retryResult = await callOnce();
      console.info(`[${label}] 重试成功 (node=${node.id})`);
      return { question: retryResult, error: null };
    } catch (secondErr) {
      const secondMsg = secondErr instanceof Error ? secondErr.message : String(secondErr);
      console.error(`[${label}] 重试仍失败 (node=${node.id}): ${secondMsg}`);
      return {
        question: makePlaceholder(node, firstMsg, secondMsg),
        error: `第一次: ${firstMsg}；重试: ${secondMsg}`,
      };
    }
  }
}

/**
 * 单次调用 AI 生成一道完整题（不含重试，失败直接抛错）。
 * generateObject 失败时降级到 generateText + 手动 JSON 解析，
 * 这样即使模型不支持 tool-calling / json mode，只要返回的文本里含合法 JSON 就能解析成功。
 */
async function callGenerateFullOnce(node: KnowledgeNode, model: LanguageModel): Promise<Question> {
  const prompt = buildNodePrompt(node);
  try {
    const result = await generateObject({
      model,
      schema: questionSchema,
      system: PROMPT_DEF.system,
      prompt,
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
  } catch (objErr) {
    const objMsg = objErr instanceof Error ? objErr.message : String(objErr);
    console.warn(
      `[question_generate] generateObject 失败，降级到 generateText (node=${node.id}): ${objMsg}`,
    );
    const textResult = await generateText({
      model,
      system: PROMPT_DEF.system,
      prompt,
    });
    const validated = questionSchema.parse(extractJsonObject(textResult.text));
    return {
      id: nanoid(),
      nodeId: node.id,
      question: validated.question,
      answer: validated.answer,
      keyPoints: validated.keyPoints,
      followUps: validated.followUps,
      codeSnippet: validated.codeSnippet,
      bigTech: validated.bigTech,
      favorited: false,
    };
  }
}

/**
 * 单次调用 AI 生成题干（不含重试，失败直接抛错）。
 * 与完整题相同的 generateObject → generateText 降级策略，但输出极小（~50 token），
 * 规避大 JSON 输出截断导致的整批失败。
 */
async function callGenerateStemOnce(node: KnowledgeNode, model: LanguageModel): Promise<Question> {
  const prompt = buildNodePrompt(node);
  let stem: z.infer<typeof stemSchema>;
  try {
    const result = await generateObject({
      model,
      schema: stemSchema,
      system: STEM_PROMPT_DEF.system,
      prompt,
    });
    stem = result.object;
  } catch (objErr) {
    const objMsg = objErr instanceof Error ? objErr.message : String(objErr);
    console.warn(
      `[question_stem_generate] generateObject 失败，降级到 generateText (node=${node.id}): ${objMsg}`,
    );
    const textResult = await generateText({
      model,
      system: STEM_PROMPT_DEF.system,
      prompt,
    });
    stem = parseStemFromText(textResult.text);
  }
  return {
    id: nanoid(),
    nodeId: node.id,
    question: stem.question,
    // 答案留空：由 step3（/api/learn/answers）流式生成
    answer: "",
    keyPoints: [],
    followUps: [],
    bigTech: stem.bigTech,
    favorited: false,
  };
}

export interface StemGenerateResult {
  questions: Question[];
  /** 第一道题失败时的真实错误信息（全部成功为 null），供 API 透出给用户排查 */
  firstError: string | null;
}

/**
 * 批量生成题干（学习向导 step2 专用）。
 * stem-only 小输出 + 3 路并发 + 错误透出，规避旧版大 JSON 批量生成的整批失败问题。
 */
export async function generateQuestionStems(
  nodes: KnowledgeNode[],
  model?: LanguageModel,
): Promise<StemGenerateResult> {
  const aiModel = model ?? createAIProvider();
  const batches = chunk(nodes, BULK_CONCURRENCY);
  const results: Question[] = [];
  let firstError: string | null = null;
  for (const batch of batches) {
    const batchResults = await Promise.all(
      batch.map((n) => generateWithRetry(n, () => callGenerateStemOnce(n, aiModel), "question_stem_generate")),
    );
    for (const r of batchResults) {
      results.push(r.question);
      if (r.error && !firstError) firstError = r.error;
    }
  }
  return { questions: results, firstError };
}

/**
 * 批量生成完整题（旧版 /api/learn 整计划路由专用）。
 * 该路由没有 step3 流式补答案环节，需要带答案的完整题目。
 * 新代码（学习向导）请用 generateQuestionStems。
 */
export async function generateQuestions(nodes: KnowledgeNode[], model?: LanguageModel): Promise<Question[]> {
  const aiModel = model ?? createAIProvider();
  const batches = chunk(nodes, BULK_CONCURRENCY);
  const results: Question[] = [];
  for (const batch of batches) {
    const batchResults = await Promise.all(
      batch.map((n) => generateWithRetry(n, () => callGenerateFullOnce(n, aiModel), "question_generate")),
    );
    results.push(...batchResults.map((r) => r.question));
  }
  return results;
}

/** 详情页单题重新生成：完整字段输出（keyPoints/followUps 在详情页展示） */
export async function regenerateQuestion(node: KnowledgeNode, model?: LanguageModel): Promise<Question> {
  const aiModel = model ?? createAIProvider();
  const { question } = await generateWithRetry(node, () => callGenerateFullOnce(node, aiModel), "question_generate");
  return question;
}

export { chunk };
