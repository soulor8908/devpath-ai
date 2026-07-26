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
import { generateQuestionStems, FAILED_QUESTION_SENTINEL } from "@/lib/ai/question";
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
    // 2026-07-26 根因修复：改用 stem-only 批量生成（只产题干，答案由 step3 流式生成）。
    // 旧版 generateQuestions 要求模型一次输出大 JSON（question+answer+keyPoints+followUps
    // +codeSnippet）且 5 路并发，在 GLM/DeepSeek 等免费档下极易截断/限流 → 整批占位失败；
    // 且 answer 随后被本路由丢弃，纯属浪费。详见 lib/ai/question.ts 文件头。
    const { questions, firstError } = await generateQuestionStems(nodes, model);
    // 答案字段统一清空（stem 路径本就没答案；占位题的 [ERROR] 详情也清掉，
    // 真实错误通过 firstError 字段透出，避免污染 UI 展示）
    const withoutAnswers = questions.map((q) => ({ ...q, answer: "" }));

    // 统计失败题数并附在响应体里，让前端按情况显示分级提示：
    //   - failedCount === 0 → 全部成功，正常 toast.success
    //   - 0 < failedCount < total → 部分成功，toast.warning 提示可重试
    //   - failedCount === total → 全部失败，toast.error 提示用户检查 API Key 或重试
    const failedCount = withoutAnswers.filter(
      (q) => q.question === FAILED_QUESTION_SENTINEL,
    ).length;
    const successCount = withoutAnswers.length - failedCount;

    const response = NextResponse.json({
      questions: withoutAnswers,
      failedCount,
      successCount,
      total: withoutAnswers.length,
      // 2026-07-26：透出第一道题的真实失败原因（如 429 限流 / 401 鉴权 / schema 校验失败），
      // 前端在失败 toast 中展示，用户不用再猜"AI 配置正常为什么还失败"
      firstError: failedCount > 0 ? firstError : null,
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
