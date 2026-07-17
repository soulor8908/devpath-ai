// app/api/learn/knowledge/route.ts
// 拆知识点 API（学习向导第 1 步）
//
// 设计（卡帕西视角）：
//   - 复用 decomposeKnowledge，但只返回 { nodes }，不一次性返回题目和答案
//   - 减少用户等待时间：先让用户确认知识点
//   - KV 限流 scene=knowledge_decompose（5/天）
//   - recordAICall 质量追踪

import { NextRequest, NextResponse } from "next/server";
import { decomposeKnowledge } from "@/lib/ai/knowledge";
import { resolveModel, type ClientModelConfig } from "@/lib/ai/resolve-model";
import { initCloudflareEnv, getCloudflareKV } from "@/lib/ai/cloudflare-env";
import { requireAuth } from "@/lib/auth";
import { createKVStore } from "@/lib/storage/kv";
import { checkRateLimit, incrementRateLimit } from "@/lib/ai/rate-limit";

export const runtime = "edge";

export async function POST(req: NextRequest) {
  await initCloudflareEnv();
  const body = await req.json();
  const { topic, prompt, modelConfig, userId } = body as {
    topic?: string;
    prompt?: string;
    modelConfig?: ClientModelConfig;
    userId?: string;
  };

  if (!topic || typeof topic !== "string" || !topic.trim()) {
    return NextResponse.json({ error: "topic 是必填项" }, { status: 400 });
  }

  const { model, useServerModel } = resolveModel(modelConfig, "learn");
  const authError = requireAuth(req, { useServerModel });
  if (authError) return authError;

  // 限流
  if (useServerModel && userId) {
    const kv = createKVStore(getCloudflareKV());
    const { allowed, remaining, limit } = await checkRateLimit(userId, "knowledge_decompose", kv);
    if (!allowed) {
      return NextResponse.json(
        { error: "今日 AI 调用已达上限", code: "RATE_LIMITED", scene: "knowledge_decompose", remaining: 0, limit },
        { status: 429 },
      );
    }
  }

  try {
    const userPrompt =
      typeof prompt === "string" && prompt.trim().length > 0
        ? prompt.trim().slice(0, 2000)
        : undefined;
    const nodes = await decomposeKnowledge(topic.trim(), userPrompt, undefined, model);

    if (useServerModel && userId) {
      const kv = createKVStore(getCloudflareKV());
      await incrementRateLimit(userId, "knowledge_decompose", kv);
    }

    return NextResponse.json({ nodes });
  } catch (error) {
    const message = error instanceof Error ? error.message : "未知错误";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
