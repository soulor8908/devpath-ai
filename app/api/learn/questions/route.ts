// app/api/learn/questions/route.ts
// 生成题目 API（学习向导第 2 步）
//
// 设计（卡帕西视角）：
//   - 入参 { nodes, topic, prompt? }，由前端传入已确认的知识点
//   - 复用 generateQuestions，但 answer 字段清空（待第 3 步生成）
//   - KV 限流 scene=question_generate（5/天）
//
// 鉴权：requireSession 注入 session，body 不含客户端凭证 / userId

import { NextRequest, NextResponse } from "next/server";
import { generateQuestions } from "@/lib/ai/question";
import { getModelFromSession } from "@/lib/ai/provider";
import { initCloudflareEnv, getCloudflareKV } from "@/lib/ai/cloudflare-env";
import { requireSession } from "@/lib/ai/session-middleware";
import { createKVStore } from "@/lib/storage/kv";
import { checkRateLimit, incrementRateLimit } from "@/lib/ai/rate-limit";
import type { KnowledgeNode } from "@/lib/types";

export const runtime = "edge";

export async function POST(req: NextRequest) {
  await initCloudflareEnv();
  // 先鉴权
  const sessionResult = await requireSession(req);
  if (sessionResult instanceof NextResponse) return sessionResult;
  const { session } = sessionResult;

  const body = await req.json();
  const { nodes } = body as {
    nodes?: KnowledgeNode[];
  };

  if (!Array.isArray(nodes) || nodes.length === 0) {
    return NextResponse.json({ error: "nodes 是必填项且不能为空" }, { status: 400 });
  }

  const model = getModelFromSession(session, "learn");

  const kv = createKVStore(getCloudflareKV());
  const { allowed, limit } = await checkRateLimit(session.userId, "question_generate", kv);
  if (!allowed) {
    return NextResponse.json(
      { error: "今日 AI 调用已达上限", code: "RATE_LIMITED", scene: "question_generate", remaining: 0, limit },
      { status: 429 },
    );
  }

  try {
    const questions = await generateQuestions(nodes, model);
    // 答案字段清空，待第 3 步生成
    const withoutAnswers = questions.map((q) => ({ ...q, answer: "" }));

    await incrementRateLimit(session.userId, "question_generate", kv);

    return NextResponse.json({ questions: withoutAnswers });
  } catch (error) {
    const isUpstreamAuthError =
      error instanceof Error &&
      /401|invalid api key|invalid signature|unauthorized/i.test(error.message);
    if (isUpstreamAuthError) {
      const message = error instanceof Error ? error.message : "上游 AI 鉴权失败";
      console.warn("[questions] upstream auth error:", message);
      return NextResponse.json(
        {
          error: `AI 服务鉴权失败：${message}。请到「我的」→「AI 模型」检查 apiKey`,
          code: "UPSTREAM_AUTH",
        },
        { status: 401 },
      );
    }
    const message = error instanceof Error ? error.message : "未知错误";
    console.error("[questions] internal error:", message);
    return NextResponse.json(
      { error: message, code: "INTERNAL_ERROR" },
      { status: 500 },
    );
  }
}
