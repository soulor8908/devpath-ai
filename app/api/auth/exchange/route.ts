// app/api/auth/exchange/route.ts
// apiKey 换取 session：客户端用 apiKey + userId 换取 sessionId + sessionSecret
//
// 安全约束（卡帕西视角）：
//   - apiKey / sessionSecret 在服务端只以 AES-GCM 密文形式落 KV
//   - sessionSecret 仅在 exchange 响应中返回一次（客户端需安全存储）
//   - 审计日志记录 userIdHash / IP / UA，绝不记录 apiKey / sessionSecret 明文
//   - MASTER_KEY 未配置时返回 500，且不泄露任何用户输入
//
// 运行时：edge（Cloudflare Pages Functions）

import { NextRequest, NextResponse } from "next/server";
import { initCloudflareEnv } from "@/lib/ai/cloudflare-env";
import {
  getMasterKey,
  createSessionStore,
  createAuditStore,
  SESSION_TTL_SECONDS,
  AUDIT_TTL_SECONDS,
} from "@/lib/ai/session-middleware";
import { aesGcmEncrypt, sha256, randomBytes, bytesToBase64 } from "@/lib/ai/crypto";
import type { SessionRecord } from "@/lib/storage/kv";

export const runtime = "edge";

interface ExchangeBody {
  apiKey?: string;
  userId?: string;
  provider?: string;
  baseURL?: string;
  model?: string;
  name?: string;
}

export async function POST(req: NextRequest) {
  await initCloudflareEnv();

  // 1. MASTER_KEY 检查（前置：避免后续加密失败泄露 body 已解析的细节）
  let masterKey: string;
  try {
    masterKey = getMasterKey();
  } catch {
    console.error("[auth/exchange] MASTER_KEY not configured");
    return NextResponse.json(
      { error: "MASTER_KEY not configured", code: "SERVER_MISCONFIG" },
      { status: 500 },
    );
  }

  // 2. 解析 body
  let body: ExchangeBody;
  try {
    body = (await req.json()) as ExchangeBody;
  } catch {
    return NextResponse.json(
      { error: "invalid body", code: "INVALID_BODY" },
      { status: 400 },
    );
  }

  // 3. 校验必填字段
  const missing: string[] = [];
  if (!body.apiKey) missing.push("apiKey");
  if (!body.userId) missing.push("userId");
  if (!body.provider) missing.push("provider");
  if (!body.baseURL) missing.push("baseURL");
  if (!body.model) missing.push("model");
  if (!body.name) missing.push("name");
  if (missing.length > 0) {
    return NextResponse.json(
      {
        error: `missing fields: ${missing.join(", ")}`,
        code: "MISSING_FIELDS",
        missing,
      },
      { status: 400 },
    );
  }

  // 4. 生成 sessionId + sessionSecret
  // sessionId: 32 hex 字符（16 字节随机）
  const sessionId = randomBytes(16);
  // sessionSecret: 32 字节 base64（直接作为 HMAC key 的 base64 输入）
  const sessionSecretBytes = crypto.getRandomValues(new Uint8Array(32));
  const sessionSecret = bytesToBase64(sessionSecretBytes);

  // 5. 加密 apiKey 和 sessionSecret
  const encryptedApiKey = await aesGcmEncrypt(body.apiKey!, masterKey);
  const encryptedSecret = await aesGcmEncrypt(sessionSecret, masterKey);

  // 6. 构造 SessionRecord 并写入 KV
  const now = new Date();
  const expiresAt = new Date(now.getTime() + SESSION_TTL_SECONDS * 1000);

  const record: SessionRecord = {
    userId: body.userId!,
    encryptedApiKey,
    encryptedSecret,
    provider: body.provider!,
    baseURL: body.baseURL!,
    model: body.model!,
    name: body.name!,
    createdAt: now.toISOString(),
    lastUsedAt: now.toISOString(),
    expiresAt: expiresAt.toISOString(),
  };

  const sessionStore = createSessionStore();
  await sessionStore.createSession(sessionId, record, SESSION_TTL_SECONDS);

  // 7. 审计日志（脱敏：不记 apiKey / sessionSecret，只记 userIdHash + IP + UA）
  const auditStore = createAuditStore();
  await auditStore.writeAudit(
    sessionId,
    "exchange",
    {
      userIdHash: await sha256(body.userId!),
      ip: req.headers.get("x-forwarded-for") || "unknown",
      ua: req.headers.get("user-agent") || "unknown",
    },
    AUDIT_TTL_SECONDS,
  );

  // 8. 返回 sessionId + sessionSecret + expiresAt
  // sessionSecret 只在此次响应中出现，客户端需自行存储
  return NextResponse.json({
    sessionId,
    sessionSecret,
    expiresAt: expiresAt.toISOString(),
  });
}
