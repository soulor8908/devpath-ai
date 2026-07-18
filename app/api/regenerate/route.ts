// app/api/regenerate/route.ts
// 重新生成单道面试题：接收 { node } → 调 AI → 返回新 Question
//
// 鉴权：requireSession 注入 session，body 不含客户端凭证

import { NextRequest, NextResponse } from "next/server";
import { regenerateQuestion } from "@/lib/ai/question";
import { initCloudflareEnv } from "@/lib/ai/cloudflare-env";
import { requireSession } from "@/lib/ai/session-middleware";
import { getModelFromSession } from "@/lib/ai/provider";
import type { KnowledgeNode } from "@/lib/types";

export const runtime = "edge";

export async function POST(req: NextRequest) {
  await initCloudflareEnv();
  // 先鉴权
  const sessionResult = await requireSession(req);
  if (sessionResult instanceof NextResponse) return sessionResult;
  const { session } = sessionResult;

  let body: { node?: KnowledgeNode };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "请求体格式错误" }, { status: 400 });
  }

  const { node } = body;
  const model = getModelFromSession(session, "regenerate");
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
