// app/api/regenerate/route.ts
// 重新生成单道面试题：接收 { node } → 调 AI → 返回新 Question
//
// 鉴权：requireSession 注入 session，body 不含客户端凭证

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { regenerateQuestion } from "@/lib/ai/question";
import { initCloudflareEnv } from "@/lib/ai/cloudflare-env";
import { requireSession } from "@/lib/ai/session-middleware";
import { parseRequestBody, nonEmptyString } from "@/lib/ai/body-validation";
import { getModelFromSession } from "@/lib/ai/provider";
import type { KnowledgeNode } from "@/lib/types";

export const runtime = "edge";

// 2026-07-27 P1：用 zod 校验 node 必含 id + title（regenerateQuestion 强依赖）
//   旧实现只 if 判 id/title 存在，缺 summary/difficulty 等下游字段会让 AI 生成低质量题
//   用 passthrough() 保留所有字段，仅校验关键字段
const regenerateBodySchema = z.object({
  node: z.object(
    { id: nonEmptyString, title: nonEmptyString },
    { message: "node 必须含 id 和 title 字段" },
  ).passthrough(),
});

export async function POST(req: NextRequest) {
  await initCloudflareEnv();
  // 先鉴权
  const sessionResult = await requireSession(req);
  if (sessionResult instanceof NextResponse) return sessionResult;
  const { session } = sessionResult;

  let node: KnowledgeNode;
  {
    const result = await parseRequestBody(req, regenerateBodySchema);
    if (result instanceof NextResponse) return result;
    node = result.data.node as unknown as KnowledgeNode;
  }
  const model = getModelFromSession(session, "regenerate");
  try {
    const question = await regenerateQuestion(node, model);
    return NextResponse.json({ question });
  } catch (error) {
    const message = error instanceof Error ? error.message : "未知错误";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
