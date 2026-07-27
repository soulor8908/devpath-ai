// app/api/learn/knowledge/route.ts
// 拆知识点 API（学习向导第 1 步）
//
// 设计（卡帕西视角）：
//   - 复用 decomposeKnowledge，但只返回 { nodes }，不一次性返回题目和答案
//   - 减少用户等待时间：先让用户确认知识点
//   - recordAICall 质量追踪
//
// 鉴权（2026-07-25 用户需求：试用用户也要能生成知识库）：
//   - 优先走 requireSession（用户已配置自己模型 → 用 session.apiKey）
//   - requireSession 失败（401）→ 降级到 trial 模式：
//       a. 服务端用默认模型 getModel()（环境变量配置的 AI_API_KEY）
//       b. IP 维度限流（knowledge_decompose=2/天，learn 类成本较高）
//       c. 响应头 X-Trial-Mode: 1 + X-Trial-Remaining: N
//   - trial 模式让体验用户第一时间能拆解知识点（乔布斯视角：API Key 不应是首日门槛）

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import type { LanguageModel } from "ai";
import { decomposeKnowledge } from "@/lib/ai/knowledge";
import { getModelFromSession } from "@/lib/ai/provider";
import { initCloudflareEnv } from "@/lib/ai/cloudflare-env";
import { requireSession } from "@/lib/ai/session-middleware";
import { tryTrialMode, applyTrialHeaders } from "@/lib/ai/trial-mode";
import { parseRequestBody, nonEmptyString, boundedString } from "@/lib/ai/body-validation";

export const runtime = "edge";

// 2026-07-27 P1：用 zod 替代手写校验
const knowledgeBodySchema = z.object({
  topic: nonEmptyString,
  prompt: boundedString(2000, 1).optional(),
});

export async function POST(req: NextRequest) {
  await initCloudflareEnv();
  // 先鉴权
  const sessionResult = await requireSession(req);
  const hasSession = !(sessionResult instanceof NextResponse);
  const session = hasSession ? sessionResult.session : null;

  // 2026-07-25：session 不存在时降级到 trial 模式（服务端默认模型 + IP 限流）
  let model: LanguageModel;
  let isTrial = false;
  let trialRemaining: number | undefined;
  if (session) {
    model = getModelFromSession(session, "learn");
  } else {
    const trial = await tryTrialMode(req, "knowledge_decompose", sessionResult as NextResponse);
    if (trial.errorResponse || !trial.model) return trial.errorResponse ?? NextResponse.json({ error: "trial mode unavailable" }, { status: 500 });
    model = trial.model;
    isTrial = trial.isTrial;
    trialRemaining = trial.remaining;
  }

  let topic: string;
  let userPrompt: string | undefined;
  {
    const result = await parseRequestBody(req, knowledgeBodySchema);
    if (result instanceof NextResponse) return result;
    topic = result.data.topic.trim();
    userPrompt = result.data.prompt?.trim();
  }

  try {
    const nodes = await decomposeKnowledge(topic, userPrompt, undefined, model);

    const response = NextResponse.json({ nodes });
    applyTrialHeaders(response, isTrial, trialRemaining);
    return response;
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
