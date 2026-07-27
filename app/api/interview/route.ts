// app/api/interview/route.ts
// AI 模拟面试接口
//
// 设计（乔布斯视角）：
//   - 一个路由两种模式：mode=interview 追问下一题；mode=report 生成结构化报告
//   - 面试的核心是"追问"——AI 必须看到完整对话历史才能决定下一问
//   - 报告用纯 JSON 返回，客户端解析后渲染结构化卡片
//   - 失败时降级到规则模板，保证试用用户也能完成面试闭环
//
// 设计（卡帕西视角）：
//   - 复用 /api/chat 的鉴权模式：requireSession 优先 + Trial 降级 + IP 限流
//   - generateText 非流式：面试一问一答，单次响应短，流式反而增加复杂度
//   - 报告模式用 maxOutputTokens 限制，避免 AI 输出超长导致 JSON 解析失败
//   - report prompt 显式要求只返回 JSON，客户端用 parseInterviewReport 容错解析
//
// 鉴权与试用降级（与 /api/chat / /api/daily-nudge 对齐）：
//   1. 已登录 session → 用 session.apiKey 调上游（用户自担额度）
//   2. 未登录 + 服务端配了 AI_API_KEY → trial 模式（getModel + IP 限流）
//   3. 未登录 + 服务端没配 → 返回 401（引导用户配置自己的模型）

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { generateText } from "ai";
import { initCloudflareEnv, getAuthSessionsKV } from "@/lib/ai/cloudflare-env";
import { requireSession } from "@/lib/ai/session-middleware";
import { getModelFromSession, getModel, hasAIKey } from "@/lib/ai/provider";
import { createKVStore } from "@/lib/storage/kv";
import { checkTrialRateLimit, incrementTrialRateLimit } from "@/lib/ai/rate-limit";
import { parseRequestBody, boundedString } from "@/lib/ai/body-validation";
import {
  type InterviewConfig,
  type InterviewMessage,
  buildInterviewerPrompt,
  buildReportPrompt,
} from "@/lib/ai/interview-coach";

// 2026-07-27 P1：用 zod schema 校验请求体（替代 normalizeConfig 手动 if + safeMessages 手动处理）
// 设计权衡（卡帕西视角）：
//   - mode 枚举校验 + 默认值 "interview"：替代手写默认值
//   - config 字段全部带默认值：与原 normalizeConfig 行为一致（向后兼容老客户端）
//     difficulty 默认 junior、topic 默认 "AI 基础"、duration 默认 20、questionCount 默认 5
//     越界值用 clamp 思路处理：zod 用 .refine 拒绝越界，调用方拿到的必是合法值
//   - messages 数组元素结构校验（role 枚举 + content 字符串 + timestamp 字符串）：
//     替代 safeMessages 手动 slice + String() 强转 + timestamp 兜底
//   - messages 上限 30 条：用 .max(30) 替代手动 slice(-30)（zod 拒绝过长而非静默截断，
//     但客户端正常场景只会传最近若干条，不会触发 30 上限）
const interviewBodySchema = z.object({
  mode: z.enum(["interview", "report"]).default("interview"),
  config: z
    .object({
      difficulty: z.enum(["junior", "mid", "senior", "stress"]).default("junior"),
      topic: boundedString(100).default("AI 基础"),
      duration: z.number().finite().int().min(5).max(120).default(20),
      questionCount: z.number().finite().int().min(1).max(15).default(5),
    })
    .default({}),
  messages: z
    .array(
      z.object({
        role: z.enum(["interviewer", "candidate"]),
        content: z.string().max(4000),
        timestamp: z.string(),
      }),
    )
    .max(30)
    .default([]),
});

/**
 * 从请求头提取客户端真实 IP（与 /api/chat 一致）。
 * 优先级：cf-connecting-ip > x-forwarded-for 的第一个值 > "unknown"
 */
function getClientIp(req: NextRequest): string {
  const cfIp = req.headers.get("cf-connecting-ip");
  if (cfIp) return cfIp;
  const xff = req.headers.get("x-forwarded-for");
  if (xff) {
    const first = xff.split(",")[0]?.trim();
    if (first) return first;
  }
  return "unknown";
}

/** 校验面试配置 + 提供默认值 —— 已迁移到 interviewBodySchema（zod schema） */
// normalizeConfig 函数已删除（2026-07-27 P1）：zod schema 用 .default() 内联了所有默认值，
// 调用方拿到的 config 必是 { difficulty, topic, duration, questionCount } 完整对象。

/** 面试模式：基于历史 + 配置生成下一句面试官回复 */
async function runInterview(
  config: InterviewConfig,
  messages: InterviewMessage[],
  model: ReturnType<typeof getModel>,
): Promise<{ reply: string; fallback?: boolean }> {
  const systemPrompt = buildInterviewerPrompt(config);

  // 构建对话历史（system 已用 systemPrompt，messages 直接拼为 chat history）
  // 注意：messages 里 role 是 interviewer/candidate，需映射到 assistant/user
  const chatHistory = messages.map((m) => ({
    role: (m.role === "interviewer" ? "assistant" : "user") as
      | "user"
      | "assistant",
    content: m.content,
  }));

  // 如果历史为空，用一句"开始面试"作为初始 user 消息触发 AI 自我介绍
  const userPrompt =
    chatHistory.length === 0 ? "开始面试" : chatHistory[chatHistory.length - 1]?.content ?? "";

  // 历史 = 全部消息（含最后一条 user 消息），AI 生成下一条 assistant 回复
  const historyForCall = chatHistory.slice(0, -1);
  const finalHistory = chatHistory.length === 0 ? [] : historyForCall;

  try {
    const { text } = await generateText({
      model,
      system: systemPrompt,
      messages: [
        ...finalHistory,
        { role: "user", content: userPrompt },
      ],
    });
    return { reply: text.trim() || "好的，我们开始下一题。" };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.warn("[interview] AI 生成失败，降级到默认追问:", msg);
    // 降级：根据历史长度返回不同的默认回复
    const fallback =
      messages.length === 0
        ? "你好，我是今天的面试官。我们先从基础开始，你能说说你对这个主题的理解吗？"
        : "好的，我们换个角度再问问。你能举个实际项目中的例子吗？";
    return { reply: fallback, fallback: true };
  }
}

/** 报告模式：基于完整对话生成结构化报告 JSON */
async function runReport(
  config: InterviewConfig,
  messages: InterviewMessage[],
  model: ReturnType<typeof getModel>,
): Promise<{ reportJson: string; fallback?: boolean }> {
  const prompt = buildReportPrompt(messages, config);
  try {
    const { text } = await generateText({
      model,
      system: "你是面试评估专家，严格按照要求输出 JSON。",
      prompt,
    });
    return { reportJson: text };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.warn("[interview] AI 报告生成失败，降级到默认报告:", msg);
    // 降级返回默认报告 JSON
    const fallbackReport = {
      overallScore: 70,
      strengths: ["能够回答基本问题"],
      weaknesses: ["部分回答不够深入"],
      improvements: ["多练习项目经验的表述"],
      nextStep: "继续练习，重点提升深度回答能力",
      canInterview: false,
    };
    return { reportJson: JSON.stringify(fallbackReport), fallback: true };
  }
}

export async function POST(req: NextRequest) {
  await initCloudflareEnv();
  try {
    // 先鉴权（requireSession 内部用 req.clone().text() 读 body 签名校验，不消费原 body）
    const sessionResult = await requireSession(req);
    const hasSession = !(sessionResult instanceof NextResponse);
    const session = hasSession ? sessionResult.session : null;

    // zod schema 校验请求体（替代手动 if + safeMessages 手动处理）
    // schema 已内联所有默认值：mode/config/messages 缺失时自动填充
    const bodyResult = await parseRequestBody(req, interviewBodySchema);
    if (bodyResult instanceof NextResponse) return bodyResult;
    const { mode, config, messages: safeMessages } = bodyResult.data;

    // 模型选择
    // - session 存在 → 用 session.apiKey 调上游
    // - session 不存在 + 服务端配了 AI_API_KEY → trial 模式（getModel + IP 限流）
    // - session 不存在 + 服务端没配 → 返回 401（引导用户配置自己的模型）
    let model;
    let isTrial = false;

    if (session) {
      model = getModelFromSession(session, "interview");
    } else {
      if (!hasAIKey()) {
        return sessionResult as NextResponse;
      }
      const ip = getClientIp(req);
      const kv = createKVStore(getAuthSessionsKV() ?? undefined);
      const limit = await checkTrialRateLimit(ip, "chat", kv);
      if (!limit.allowed) {
        return NextResponse.json(
          {
            error: `今日体验额度已用完（${limit.limit} 次/天）。请添加自己的 AI 模型以继续使用。`,
            code: "TRIAL_LIMIT_REACHED",
            limit: limit.limit,
          },
          { status: 429 },
        );
      }
      model = getModel();
      isTrial = true;
      // 异步计数（不阻塞响应）
      void incrementTrialRateLimit(ip, "chat", kv).catch(() => {});
    }

    // 路由到对应模式
    if (mode === "report") {
      const result = await runReport(config, safeMessages, model);
      return NextResponse.json({
        reportJson: result.reportJson,
        fallback: result.fallback ?? false,
        trial: isTrial,
      });
    }

    // 默认 interview 模式
    const result = await runInterview(config, safeMessages, model);
    return NextResponse.json({
      reply: result.reply,
      fallback: result.fallback ?? false,
      trial: isTrial,
    });
  } catch (error) {
    const isUpstreamAuthError =
      error instanceof Error &&
      /401|invalid api key|invalid signature|unauthorized/i.test(error.message);
    if (isUpstreamAuthError) {
      const message = error instanceof Error ? error.message : "上游 AI 鉴权失败";
      console.warn("[interview] upstream auth error:", message);
      return NextResponse.json(
        {
          error: `AI 服务鉴权失败：${message}。请到「我的」→「AI 模型」检查 apiKey 是否正确、是否被风控或失效`,
          code: "UPSTREAM_AUTH",
        },
        { status: 401 },
      );
    }
    const message = error instanceof Error ? error.message : "未知错误";
    console.error("[interview] internal error:", message);
    return NextResponse.json(
      { error: message, code: "INTERNAL_ERROR" },
      { status: 500 },
    );
  }
}
