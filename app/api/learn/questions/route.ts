// app/api/learn/questions/route.ts
// 生成题目 API（学习向导第 2 步）
//
// 设计（卡帕西视角）：
//   - 入参 { nodes, topic, prompt? }，由前端传入已确认的知识点
//   - 复用 generateQuestions，但 answer 字段清空（待第 3 步生成）
//   - KV 限流 scene=question_generate（5/天）

import { NextRequest, NextResponse } from "next/server";
import { generateQuestions } from "@/lib/ai/question";
import { resolveModel, type ClientModelConfig } from "@/lib/ai/resolve-model";
import { initCloudflareEnv, getCloudflareKV } from "@/lib/ai/cloudflare-env";
import { requireAuth } from "@/lib/auth";
import { createKVStore } from "@/lib/storage/kv";
import { checkRateLimit, incrementRateLimit } from "@/lib/ai/rate-limit";
import type { KnowledgeNode } from "@/lib/types";

export const runtime = "edge";

export async function POST(req: NextRequest) {
  await initCloudflareEnv();
  const body = await req.json();
  const { nodes, modelConfig, userId } = body as {
    nodes?: KnowledgeNode[];
    modelConfig?: ClientModelConfig;
    userId?: string;
  };

  if (!Array.isArray(nodes) || nodes.length === 0) {
    return NextResponse.json({ error: "nodes 是必填项且不能为空" }, { status: 400 });
  }

  const { model, useServerModel } = resolveModel(modelConfig, "learn");
  const authError = requireAuth(req, { useServerModel });
  if (authError) return authError;

  if (useServerModel && userId) {
    const kv = createKVStore(getCloudflareKV());
    const { allowed, remaining, limit } = await checkRateLimit(userId, "question_generate", kv);
    if (!allowed) {
      return NextResponse.json(
        { error: "今日 AI 调用已达上限", code: "RATE_LIMITED", scene: "question_generate", remaining: 0, limit },
        { status: 429 },
      );
    }
  }

  try {
    const questions = await generateQuestions(nodes, model);
    // 答案字段清空，待第 3 步生成
    const withoutAnswers = questions.map((q) => ({ ...q, answer: "" }));

    if (useServerModel && userId) {
      const kv = createKVStore(getCloudflareKV());
      await incrementRateLimit(userId, "question_generate", kv);
    }

    return NextResponse.json({ questions: withoutAnswers });
  } catch (error) {
    const message = error instanceof Error ? error.message : "未知错误";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
