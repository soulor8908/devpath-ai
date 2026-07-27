// app/api/weekly/route.ts
// 周报生成路由：接收本周数据 → 调 AI → 返回 markdown
// 支持可选 emotions（来自情绪觉察流程的 EmotionEntry）
// ⚠️ Edge runtime 无法访问客户端 IndexedDB，报告由客户端自行存储
//
// 鉴权：requireSession 注入 session，body 不含客户端凭证 / userId
//   session 架构下所有用户都用自己加密在 session 中的 apiKey，服务端不再做"今日 N 次"限流
//
// 成本追踪（t7）：
//   - 从 generateWeeklyReport 返回值提取 usage（generateText result.usage）
//   - 通过响应体 _meta.tokenUsage 字段返回客户端
//   - 通过响应头 X-AI-Model-Id 返回 modelId（与 /api/chat 一致）
//   - 客户端 WeeklyReport 读取 _meta 后调用 recordAICall 估成本
//
// Trace 链路（t8）：
//   - 服务端从 X-Trace-Id header 读取 traceId（不存在则自生成）
//   - 通过响应头 X-Trace-Id 回传，客户端可用于日志关联

import { NextResponse } from "next/server";
import { z } from "zod";
import { generateWeeklyReport } from "@/lib/ai/weekly-report";
import { initCloudflareEnv } from "@/lib/ai/cloudflare-env";
import { requireSession } from "@/lib/ai/session-middleware";
import { parseRequestBody, isoDate } from "@/lib/ai/body-validation";
import { getModelFromSession } from "@/lib/ai/provider";
import { nanoid } from "nanoid";
import { getOrCreateTraceIdFromRequest, TRACE_ID_HEADER } from "@/lib/ai/trace";
import type { LearnLog, ReviewLog, DailyStatus, EmotionEntry, TokenUsage } from "@/lib/types";

export const runtime = "edge";

// 2026-07-27 P1：用 zod 替代手写校验
//   - weekStart 必须 YYYY-MM-DD
//   - learnLogs/reviewLogs/statuses 必须是数组（元素结构下游兜底，避免过严破坏旧数据）
//   - emotions 可选数组
//   旧实现仅校验 `!weekStart || !Array.isArray(learnLogs)`，
//   reviewLogs/statuses/emotions 完全不校验 → 畸形数据直传 LLM 污染 prompt
const weeklyBodySchema = z.object({
  weekStart: isoDate,
  learnLogs: z.array(z.unknown()),
  reviewLogs: z.array(z.unknown()),
  statuses: z.array(z.unknown()),
  emotions: z.array(z.unknown()).optional(),
});

interface WeeklyRequestBody {
  weekStart: string;
  learnLogs: LearnLog[];
  reviewLogs: ReviewLog[];
  statuses: DailyStatus[];
  /** 情绪觉察条目（可选） */
  emotions?: EmotionEntry[];
}

/** 响应体 _meta 字段类型（成本追踪用） */
interface WeeklyResponseMeta {
  /** LLM 调用 token 用量（走 AI 路径时存在；降级路径不存在） */
  tokenUsage?: TokenUsage;
  /** 实际使用的模型 ID（如 glm-4-flash），用于客户端成本估算 */
  modelId?: string;
  /** 服务端观测的 traceId，客户端可用于日志关联 */
  traceId: string;
}

export async function POST(req: Request) {
  await initCloudflareEnv();
  // 先鉴权
  const sessionResult = await requireSession(req);
  if (sessionResult instanceof NextResponse) return sessionResult;
  const { session } = sessionResult;

  let body: WeeklyRequestBody;
  {
    const result = await parseRequestBody(req, weeklyBodySchema);
    if (result instanceof NextResponse) return result;
    body = result.data as WeeklyRequestBody;
  }

  const model = getModelFromSession(session, "weekly");

  const { content, usage, modelId: reportModelId } = await generateWeeklyReport({
    learnLogs: body.learnLogs,
    reviewLogs: body.reviewLogs,
    statuses: body.statuses,
    emotions: body.emotions,
    weekStart: body.weekStart,
  }, model);

  const id = nanoid();

  // 模型 ID：路由层 session.model 最准（generateWeeklyReport 内部拿不到 model.modelId）
  const finalModelId = reportModelId ?? session.model;
  const traceId = getOrCreateTraceIdFromRequest(req);

  // 构造 _meta：usage 走降级路径时为 undefined（不传给客户端，避免误导）
  const meta: WeeklyResponseMeta = {
    tokenUsage: usage,
    modelId: finalModelId,
    traceId,
  };

  // 返回 id + content + _meta，让客户端自行存入 IndexedDB（edge runtime 无法访问）
  const response = NextResponse.json({
    id,
    content,
    weekStart: body.weekStart,
    _meta: meta,
  });
  // 通过响应头同步暴露 traceId + modelId，便于客户端在 _meta 之外也能拿到（与 /api/chat 一致）
  response.headers.set(TRACE_ID_HEADER, traceId);
  if (finalModelId) {
    response.headers.set("X-AI-Model-Id", finalModelId);
  }
  return response;
}

export async function GET() {
  return NextResponse.json({ error: "use POST" }, { status: 405 });
}
