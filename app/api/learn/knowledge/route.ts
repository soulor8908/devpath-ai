// app/api/learn/knowledge/route.ts
// 拆知识点 API（学习向导第 1 步）
//
// 设计（卡帕西视角）：
//   - 复用 decomposeKnowledge，但只返回 { nodes }，不一次性返回题目和答案
//   - 减少用户等待时间：先让用户确认知识点
//   - recordAICall 质量追踪
//
// 鉴权：requireSession 注入 session，body 不含客户端凭证 / userId
//   session 架构下所有用户都用自己加密在 session 中的 apiKey，服务端不再做"今日 N 次"限流

import { NextRequest, NextResponse } from "next/server";
import { decomposeKnowledge } from "@/lib/ai/knowledge";
import { getModelFromSession } from "@/lib/ai/provider";
import { initCloudflareEnv } from "@/lib/ai/cloudflare-env";
import { requireSession } from "@/lib/ai/session-middleware";

export const runtime = "edge";

export async function POST(req: NextRequest) {
  await initCloudflareEnv();
  // 先鉴权
  const sessionResult = await requireSession(req);
  if (sessionResult instanceof NextResponse) return sessionResult;
  const { session } = sessionResult;

  const body = await req.json();
  const { topic, prompt } = body as {
    topic?: string;
    prompt?: string;
  };

  if (!topic || typeof topic !== "string" || !topic.trim()) {
    return NextResponse.json({ error: "topic 是必填项" }, { status: 400 });
  }

  const model = getModelFromSession(session, "learn");

  try {
    const userPrompt =
      typeof prompt === "string" && prompt.trim().length > 0
        ? prompt.trim().slice(0, 2000)
        : undefined;
    const nodes = await decomposeKnowledge(topic.trim(), userPrompt, undefined, model);

    return NextResponse.json({ nodes });
  } catch (error) {
    // 区分上游 AI 鉴权失败 vs 本地错误（与 chat route 一致）
    const isUpstreamAuthError =
      error instanceof Error &&
      /401|invalid api key|invalid signature|unauthorized/i.test(error.message);
    if (isUpstreamAuthError) {
      const message = error instanceof Error ? error.message : "上游 AI 鉴权失败";
      console.warn("[knowledge] upstream auth error:", message);
      return NextResponse.json(
        {
          error: `AI 服务鉴权失败：${message}。请到「我的」→「AI 模型」检查 apiKey 是否正确、是否被风控或失效`,
          code: "UPSTREAM_AUTH",
        },
        { status: 401 },
      );
    }
    const message = error instanceof Error ? error.message : "未知错误";
    console.error("[knowledge] internal error:", message);
    return NextResponse.json(
      { error: message, code: "INTERNAL_ERROR" },
      { status: 500 },
    );
  }
}
