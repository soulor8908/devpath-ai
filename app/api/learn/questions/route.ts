// app/api/learn/questions/route.ts
// 生成题目 API（学习向导第 2 步）
//
// 设计（卡帕西视角）：
//   - 入参 { nodes, topic, prompt? }，由前端传入已确认的知识点
//   - 复用 generateQuestions，但 answer 字段清空（待第 3 步生成）
//
// 鉴权（2026-07-25 用户需求：试用用户也要能生成知识库）：
//   - 优先走 requireSession（用户已配置自己模型 → 用 session.apiKey）
//   - requireSession 失败（401）→ 降级到 trial 模式（服务端默认模型 + IP 限流）
//   - trial 配额 question_generate=2/天（单次拆解会生成多题，限流按"次调用"计）

import { NextRequest, NextResponse } from "next/server";
import type { LanguageModel } from "ai";
import { generateQuestions } from "@/lib/ai/question";
import { getModelFromSession } from "@/lib/ai/provider";
import { initCloudflareEnv } from "@/lib/ai/cloudflare-env";
import { requireSession } from "@/lib/ai/session-middleware";
import { tryTrialMode, applyTrialHeaders } from "@/lib/ai/trial-mode";
import type { KnowledgeNode } from "@/lib/types";

export const runtime = "edge";

export async function POST(req: NextRequest) {
  await initCloudflareEnv();
  // 先鉴权
  const sessionResult = await requireSession(req);
  const hasSession = !(sessionResult instanceof NextResponse);
  const session = hasSession ? sessionResult.session : null;

  // 2026-07-25：session 不存在时降级到 trial 模式
  let model: LanguageModel;
  let isTrial = false;
  let trialRemaining: number | undefined;
  if (session) {
    model = getModelFromSession(session, "learn");
  } else {
    const trial = await tryTrialMode(req, "question_generate", sessionResult as NextResponse);
    if (trial.errorResponse || !trial.model) return trial.errorResponse ?? NextResponse.json({ error: "trial mode unavailable" }, { status: 500 });
    model = trial.model;
    isTrial = trial.isTrial;
    trialRemaining = trial.remaining;
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "请求体格式错误" }, { status: 400 });
  }
  const { nodes } = body as {
    nodes?: KnowledgeNode[];
  };

  if (!Array.isArray(nodes) || nodes.length === 0) {
    return NextResponse.json({ error: "nodes 是必填项且不能为空" }, { status: 400 });
  }

  try {
    const questions = await generateQuestions(nodes, model);
    // 答案字段清空，待第 3 步生成
    const withoutAnswers = questions.map((q) => ({ ...q, answer: "" }));

    // 2026-07-26 修复：题目生成失败但前端误报"生成成功"的问题
    // generateQuestions 对单题失败会返回占位 Question（question === "生成失败，点击重试"），
    // 不抛错。原 API 路由不区分"全部成功 / 部分失败 / 全部失败"，统一以 200 返回，
    // 前端无条件 toast.success("已生成 X 道题目")，误导用户。
    // 现在统计失败题数并附在响应体里，让前端按情况显示分级提示：
    //   - failedCount === 0 → 全部成功，正常 toast.success
    //   - 0 < failedCount < total → 部分成功，toast.warning 提示可重试
    //   - failedCount === total → 全部失败，toast.error 提示用户检查 API Key 或重试
    const FAILED_SENTINEL = "生成失败，点击重试";
    const failedCount = withoutAnswers.filter(
      (q) => q.question === FAILED_SENTINEL,
    ).length;
    const successCount = withoutAnswers.length - failedCount;

    const response = NextResponse.json({
      questions: withoutAnswers,
      failedCount,
      successCount,
      total: withoutAnswers.length,
    });
    applyTrialHeaders(response, isTrial, trialRemaining);
    return response;
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
