// app/api/learn/questions/route.ts
// 生成题目 API（学习向导第 2 步）
//
// 设计（卡帕西视角）：
//   - 入参 { nodes, topic, prompt? }，由前端传入已确认的知识点
//   - 复用 generateQuestions，但 answer 字段清空（待第 3 步生成）
//
// 鉴权：requireSession 注入 session，body 不含客户端凭证 / userId
//   session 架构下所有用户都用自己加密在 session 中的 apiKey，服务端不再做"今日 N 次"限流

import { NextRequest, NextResponse } from "next/server";
import { generateQuestions } from "@/lib/ai/question";
import { getModelFromSession } from "@/lib/ai/provider";
import { initCloudflareEnv } from "@/lib/ai/cloudflare-env";
import { requireSession } from "@/lib/ai/session-middleware";
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

  try {
    const questions = await generateQuestions(nodes, model);
    // 答案字段清空，待第 3 步生成
    const withoutAnswers = questions.map((q) => ({ ...q, answer: "" }));

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
