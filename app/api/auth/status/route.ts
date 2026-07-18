// app/api/auth/status/route.ts
// 查询当前 session 状态：是否有效 + 剩余有效期
//
// 安全约束：
//   - 必须带有效签名（requireSession 通过）
//   - 返回的 expiresAt 是滑动续期后的新值（与 requireSession 一致）
//   - 不写审计日志（高频调用，避免噪音）
//
// 运行时：edge

import { NextRequest, NextResponse } from "next/server";
import { initCloudflareEnv } from "@/lib/ai/cloudflare-env";
import { requireSession } from "@/lib/ai/session-middleware";

export const runtime = "edge";

export async function GET(req: NextRequest) {
  await initCloudflareEnv();

  // 1. 校验签名 + 注入 session
  const result = await requireSession(req);
  if (result instanceof NextResponse) return result;
  const { session } = result;

  // 2. 计算剩余有效期
  const expiresAtMs = new Date(session.expiresAt).getTime();
  const remaining = Math.max(0, expiresAtMs - Date.now());

  return NextResponse.json({
    valid: true,
    expiresAt: session.expiresAt,
    remaining,
  });
}
