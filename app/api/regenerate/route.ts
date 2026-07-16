// app/api/regenerate/route.ts
// 重新生成单道面试题：接收 { node } → 调 AI → 返回新 Question

import { NextRequest, NextResponse } from "next/server";
import { regenerateQuestion } from "@/lib/ai/question";
import { initCloudflareEnv } from "@/lib/ai/cloudflare-env";
import { requireAuth } from "@/lib/auth";
import type { KnowledgeNode } from "@/lib/types";
import { resolveModel, type ClientModelConfig } from "@/lib/ai/resolve-model";

export const runtime = "edge";

export async function POST(req: NextRequest) {
  await initCloudflareEnv();

  let body: { node?: KnowledgeNode; modelConfig?: ClientModelConfig };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "请求体格式错误" }, { status: 400 });
  }

  const { node, modelConfig } = body;
  const { model, useServerModel } = resolveModel(modelConfig, "regenerate");

  const authError = requireAuth(req, { useServerModel });
  if (authError) return authError;
  try {
    if (!node || !node.id || !node.title) {
      return NextResponse.json({ error: "node 是必填项" }, { status: 400 });
    }

    const question = await regenerateQuestion(node, model);
    return NextResponse.json({ question });
  } catch (error) {
    const message = error instanceof Error ? error.message : "未知错误";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
