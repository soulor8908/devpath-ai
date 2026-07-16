// app/api/learn/route.ts
import { NextRequest, NextResponse } from "next/server";
import { nanoid } from "nanoid";
import { decomposeKnowledge } from "@/lib/ai/knowledge";
import { generateQuestions } from "@/lib/ai/question";
import { resolveModel, type ClientModelConfig } from "@/lib/ai/resolve-model";
import { initCloudflareEnv } from "@/lib/ai/cloudflare-env";
import { requireAuth } from "@/lib/auth";
import { topoSort, allocateDaily } from "@/lib/schedule";
import { nowISO } from "@/lib/time";
import type { LearningPlan } from "@/lib/types";

export const runtime = "edge";

export async function POST(req: NextRequest) {
  await initCloudflareEnv();
  const body = await req.json();
  const { topic, dailyMinutes = 30, maxNewPerDay = 1, prompt, modelConfig } = body as {
    topic?: string;
    dailyMinutes?: number;
    maxNewPerDay?: number;
    prompt?: string;
    modelConfig?: ClientModelConfig;
  };
  const { model, useServerModel } = resolveModel(modelConfig, "learn");
  const authError = requireAuth(req, { useServerModel });
  if (authError) return authError;
  try {

    if (!topic || typeof topic !== "string" || !topic.trim()) {
      return NextResponse.json({ error: "topic 是必填项" }, { status: 400 });
    }

    if (dailyMinutes < 15 || dailyMinutes > 120) {
      return NextResponse.json(
        { error: "dailyMinutes 须在 15-120 之间" },
        { status: 400 }
      );
    }

    if (maxNewPerDay < 1 || maxNewPerDay > 5) {
      return NextResponse.json(
        { error: "maxNewPerDay 须在 1-5 之间" },
        { status: 400 }
      );
    }

    // 用户自定义提示词（可选，最长 2000 字符）
    const userPrompt =
      typeof prompt === "string" && prompt.trim().length > 0
        ? prompt.trim().slice(0, 2000)
        : undefined;

    // 1. 拆知识树（传入用户自定义提示词）
    const nodes = await decomposeKnowledge(topic.trim(), userPrompt, undefined, model);

    // 2. 生成面试题（并行分批）
    const questions = await generateQuestions(nodes, model);

    // 3. 编排学习计划
    const sorted = topoSort(nodes);
    const schedule = allocateDaily(sorted, dailyMinutes, maxNewPerDay);

    // 4. 构建 LearningPlan
    const now = nowISO();
    const plan: LearningPlan = {
      id: nanoid(),
      topic: topic.trim(),
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
