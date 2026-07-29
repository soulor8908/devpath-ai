// app/api/learn/route.ts
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { nanoid } from "nanoid";
import { decomposeKnowledge } from "@/lib/ai/knowledge";
import { generateQuestions } from "@/lib/ai/question";
import { getModelFromSession } from "@/lib/ai/provider";
import { initCloudflareEnv } from "@/lib/ai/cloudflare-env";
import { requireSession } from "@/lib/ai/session-middleware";
import { parseRequestBody, nonEmptyString, boundedString } from "@/lib/ai/body-validation";
import { topoSort, allocateDaily } from "@/lib/schedule";
import { nowISO } from "@/lib/time";
import type { LearningPlan } from "@/lib/types";

export const runtime = "edge";

// 2026-07-27 P1：用 zod 校验范围（替代手写 if）
const learnBodySchema = z.object({
  topic: nonEmptyString,
  dailyMinutes: z.number().finite().min(15).max(120).default(30),
  maxNewPerDay: z.number().finite().int().min(1).max(5).default(1),
  prompt: boundedString(2000, 1).optional(),
});

export async function POST(req: NextRequest) {
  await initCloudflareEnv();
  // 先鉴权
  const sessionResult = await requireSession(req);
  if (sessionResult instanceof NextResponse) return sessionResult;
  const { session } = sessionResult;

  let topic: string;
  let dailyMinutes: number;
  let maxNewPerDay: number;
  let userPrompt: string | undefined;
  {
    const result = await parseRequestBody(req, learnBodySchema);
    if (result instanceof NextResponse) return result;
    topic = result.data.topic.trim();
    dailyMinutes = result.data.dailyMinutes;
    maxNewPerDay = result.data.maxNewPerDay;
    userPrompt = result.data.prompt?.trim();
  }

  const model = getModelFromSession(session, "learn");

  // 无服务端限流：session 架构下所有用户都用自己加密在 session 中的 apiKey

  try {

    // 1. 拆知识树（传入用户自定义提示词）
    const nodes = await decomposeKnowledge(topic, userPrompt, undefined, model);

    // 2. 生成面试题（并行分批）
    const questions = await generateQuestions(nodes, model);

    // 3. 编排学习计划
    const sorted = topoSort(nodes);
    const schedule = allocateDaily(sorted, dailyMinutes, maxNewPerDay);

    // 4. 构建 LearningPlan
    const now = nowISO();
    const plan: LearningPlan = {
      id: nanoid(),
      topic,
      knowledgeTree: nodes,
      questions,
      schedule,
      dailyMinutes,
      maxNewPerDay,
      fsrsMode: "standard",
      prompt: userPrompt,
      createdAt: now,
      updatedAt: now,
    };

    // 返回给前端，由前端存 IndexedDB（API route 无法访问客户端 IndexedDB）
    return NextResponse.json({ planId: plan.id, plan });
  } catch (error) {
    const message = error instanceof Error ? error.message : "未知错误";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
