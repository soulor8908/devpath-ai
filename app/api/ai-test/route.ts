// app/api/ai-test/route.ts
// AI 模型配置测试端点：接收 modelConfig → 发送一条测试消息 → 返回结果
// 用于 profile 页面的"测试连接"按钮，帮助用户诊断 AI 配置是否正确

import { NextRequest, NextResponse } from "next/server";
import { generateText } from "ai";
import { initCloudflareEnv } from "@/lib/ai/cloudflare-env";
import { requireAuth } from "@/lib/auth";
import { resolveModel, type ClientModelConfig } from "@/lib/ai/resolve-model";

export const runtime = "edge";

export async function POST(req: NextRequest) {
  await initCloudflareEnv();
  try {
    const body = await req.json();
    const { modelConfig } = body as { modelConfig?: ClientModelConfig };

    const { model, useServerModel } = resolveModel(modelConfig, "ai-test");
    const authError = requireAuth(req, { useServerModel });
    if (authError) return authError;

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
      model: modelConfig?.model || "server-default",
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
