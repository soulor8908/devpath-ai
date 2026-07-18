// app/api/ai-test/route.ts
// AI 模型配置测试端点：用 session 中的配置发送一条测试消息 → 返回结果
// 用于 profile 页面的"测试连接"按钮，帮助用户诊断 AI 配置是否正确
//
// 鉴权：requireSession 注入 session，body 不含客户端凭证
// （session 中的 apiKey / baseURL / model 即用户配置）

import { NextRequest, NextResponse } from "next/server";
import { generateText } from "ai";
import { initCloudflareEnv } from "@/lib/ai/cloudflare-env";
import { requireSession } from "@/lib/ai/session-middleware";
import { getModelFromSession } from "@/lib/ai/provider";

export const runtime = "edge";

export async function POST(req: NextRequest) {
  await initCloudflareEnv();
  try {
    // 先鉴权
    const sessionResult = await requireSession(req);
    if (sessionResult instanceof NextResponse) return sessionResult;
    const { session } = sessionResult;

    // 消费 body（即使无字段也要读，避免上游 req.json() 报错；当前路由无必填字段）
    await req.json();

    const model = getModelFromSession(session, "ai-test");

    // 发送一条简短测试消息
    const startTime = Date.now();
    const { text } = await generateText({
      model,
      prompt: '请回复"连接成功"四个字。',
    });
    const elapsed = Date.now() - startTime;

    return NextResponse.json({
      success: true,
      reply: text.trim(),
      elapsedMs: elapsed,
      model: session.model,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "未知错误";
    return NextResponse.json(
      {
        success: false,
        error: message,
      },
      { status: 500 },
    );
  }
}
