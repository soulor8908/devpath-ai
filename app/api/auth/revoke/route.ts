// app/api/auth/revoke/route.ts
// 注销 session：删除 KV 中的 session 记录
//
// 安全约束：
//   - 必须带有效签名（requireSession 通过）
//   - 删除后 session 立即失效，无法再用此 sessionId 签发请求
//   - 审计日志记录 revoke 事件（不含敏感字段）
//
// 运行时：edge

import { NextRequest, NextResponse } from "next/server";
import { initCloudflareEnv } from "@/lib/ai/cloudflare-env";
import {
  requireSession,
  createSessionStore,
  createAuditStore,
  AUDIT_TTL_SECONDS,
} from "@/lib/ai/session-middleware";
import { sha256 } from "@/lib/ai/crypto";

export const runtime = "edge";

export async function POST(req: NextRequest) {
  await initCloudflareEnv();

  // 1. 校验签名 + 注入 session
  const result = await requireSession(req);
  if (result instanceof NextResponse) return result;
  const { session } = result;

  // 2. 删除 session
  const sessionStore = createSessionStore();
  await sessionStore.deleteSession(session.sessionId);

  // 3. 审计日志（脱敏：只记 userIdHash）
  const auditStore = createAuditStore();
  await auditStore.writeAudit(
    session.sessionId,
    "revoke",
    { userIdHash: await sha256(session.userId) },
    AUDIT_TTL_SECONDS,
  );

  return NextResponse.json({ ok: true });
}
