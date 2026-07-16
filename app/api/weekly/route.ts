// app/api/weekly/route.ts
// 周报生成路由：接收本周数据 → 调 AI → 返回 markdown
// 支持可选 emotions（来自情绪觉察流程的 EmotionEntry）
// ⚠️ Edge runtime 无法访问客户端 IndexedDB，报告由客户端自行存储

import { NextResponse } from "next/server";
import { generateWeeklyReport } from "@/lib/ai/weekly-report";
import { initCloudflareEnv, getCloudflareKV } from "@/lib/ai/cloudflare-env";
import { requireAuth } from "@/lib/auth";
import { nanoid } from "nanoid";
import type { LearnLog, ReviewLog, DailyStatus, EmotionEntry } from "@/lib/types";
import { resolveModel, type ClientModelConfig } from "@/lib/ai/resolve-model";
import { createKVStore } from "@/lib/storage/kv";
import { checkRateLimit, incrementRateLimit } from "@/lib/ai/rate-limit";

export const runtime = "edge";

interface WeeklyRequestBody {
  weekStart: string;
  learnLogs: LearnLog[];
  reviewLogs: ReviewLog[];
  statuses: DailyStatus[];
  /** 情绪觉察条目（可选） */
  emotions?: EmotionEntry[];
  /** 客户端传入的模型配置（可选，含 apiKey 时免鉴权） */
  modelConfig?: ClientModelConfig;
  /** 用户 ID（服务端限流用） */
  userId?: string;
}

export async function POST(req: Request) {
  await initCloudflareEnv();

  let body: WeeklyRequestBody;
  try {
    body = (await req.json()) as WeeklyRequestBody;
  } catch {
    return NextResponse.json({ error: "请求体格式错误" }, { status: 400 });
  }

  const { model, useServerModel } = resolveModel(body.modelConfig, "weekly");

  const authError = requireAuth(req, { useServerModel });
  if (authError) return authError;

  // 限流：仅使用服务端默认模型时检查（用户自带 modelConfig 不限流）
  if (useServerModel && body.userId) {
    const kv = createKVStore(getCloudflareKV());
    const { allowed } = await checkRateLimit(body.userId, "weekly_report", kv);
    if (!allowed) {
      return NextResponse.json(
        { error: "今日 AI 调用已达上限", code: "RATE_LIMITED", scene: "weekly_report", remaining: 0 },
        { status: 429 },
      );
    }
  }

  if (!body.weekStart || !Array.isArray(body.learnLogs)) {
    return NextResponse.json({ error: "缺少必填字段" }, { status: 400 });
  }

  const report = await generateWeeklyReport({
    learnLogs: body.learnLogs,
    reviewLogs: body.reviewLogs,
    statuses: body.statuses,
    emotions: body.emotions,
    weekStart: body.weekStart,
  }, model);

  // 限流计数 +1（成功生成后）
  if (useServerModel && body.userId) {
    const kv = createKVStore(getCloudflareKV());
    await incrementRateLimit(body.userId, "weekly_report", kv);
  }

  const id = nanoid();

  // 返回 id + content 让客户端自行存入 IndexedDB（edge runtime 无法访问）
  return NextResponse.json({ id, content: report, weekStart: body.weekStart });
}

export async function GET() {
  return NextResponse.json({ error: "use POST" }, { status: 405 });
}
