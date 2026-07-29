// app/api/auth/exchange/route.ts
// apiKey 换取 session：客户端用 apiKey + userId 换取 sessionId + sessionSecret
//
// 安全约束（卡帕西视角）：
//   - apiKey / sessionSecret 在服务端只以 AES-GCM 密文形式落 KV
//   - sessionSecret 仅在 exchange 响应中返回一次（客户端需安全存储）
//   - 审计日志记录 userIdHash / IP / UA，绝不记录 apiKey / sessionSecret 明文
//   - MASTER_KEY 未配置时返回 500，且不泄露任何用户输入
//
// 运行时：Cloudflare Workers（nodejs_compat）

import { NextRequest, NextResponse } from "next/server";
import { initCloudflareEnv, getAuthSessionsKV } from "@/lib/ai/cloudflare-env";
import {
  getMasterKey,
  createSessionStore,
  createAuditStore,
  SESSION_TTL_SECONDS,
  AUDIT_TTL_SECONDS,
} from "@/lib/ai/session-middleware";
import { aesGcmEncrypt, sha256, randomBytes, bytesToBase64 } from "@/lib/ai/crypto";
import { chinaDateNow } from "@/lib/time";
import type { SessionRecord } from "@/lib/storage/kv";

export const runtime = "edge";

/** exchange 端点 IP 维度限流：每 IP 每天最多 10 次换 session */
const EXCHANGE_RATE_LIMIT = 10;
const EXCHANGE_RATE_TTL = 86400; // 24 小时

/**
 * 从请求头提取客户端真实 IP。
 * 优先 cf-connecting-ip（Cloudflare 注入，最可信），其次 x-forwarded-for。
 */
function getClientIp(req: NextRequest): string {
  const cfIp = req.headers.get("cf-connecting-ip");
  if (cfIp) return cfIp;
  const xff = req.headers.get("x-forwarded-for");
  if (xff) {
    const first = xff.split(",")[0]?.trim();
    if (first) return first;
  }
  return "unknown";
}

/**
 * IP 维度限流：防止暴力枚举 apiKey 耗尽 KV 写配额。
 * 复用 AUTH_SESSIONS KV namespace，key 前缀 ratelimit:exchange: 与 session key 空间隔离。
 * KV 不可用时（本地开发）跳过限流。
 */
async function checkExchangeRateLimit(ip: string): Promise<boolean> {
  const kv = getAuthSessionsKV();
  if (!kv) return true; // 本地开发无 KV，放行
  const date = chinaDateNow();
  const key = `ratelimit:exchange:${ip}:${date}`;
  const current = await kv.get(key);
  const count = current ? parseInt(current, 10) : 0;
  return count < EXCHANGE_RATE_LIMIT;
}

async function incrementExchangeRateLimit(ip: string): Promise<void> {
  const kv = getAuthSessionsKV();
  if (!kv) return; // 本地开发无 KV，跳过
  const date = chinaDateNow();
  const key = `ratelimit:exchange:${ip}:${date}`;
  const current = await kv.get(key);
  const count = current ? parseInt(current, 10) : 0;
  await kv.put(key, String(count + 1), { expirationTtl: EXCHANGE_RATE_TTL });
}

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

  // 0. IP 维度限流（防暴力枚举 apiKey 耗尽 KV 写配额）
  const ip = getClientIp(req);
  const allowed = await checkExchangeRateLimit(ip);
  if (!allowed) {
    return NextResponse.json(
      { error: "Too many session exchanges, try again tomorrow", code: "RATE_LIMITED" },
      { status: 429 },
    );
  }

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
  // MASTER_KEY 配错（非 32 字节 base64）或 Web Crypto 内部异常时
  // aesGcmEncrypt 会抛错，需返回结构化 500，避免 edge runtime 兜底成非 JSON
  let encryptedApiKey: string;
  let encryptedSecret: string;
  try {
    encryptedApiKey = await aesGcmEncrypt(body.apiKey!, masterKey);
    encryptedSecret = await aesGcmEncrypt(sessionSecret, masterKey);
  } catch (e) {
    console.error(
      "[auth/exchange] aesGcmEncrypt failed:",
      e instanceof Error ? e.message : String(e),
    );
    return NextResponse.json(
      {
        error: "encrypt failed (MASTER_KEY may be malformed)",
        code: "ENCRYPT_FAILED",
      },
      { status: 500 },
    );
  }

  // 6. 构造 SessionRecord 并写入 KV
  // KV binding 异常（namespace 删了/id 错/账号无权限）时返回结构化 500
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
  try {
    await sessionStore.createSession(sessionId, record, SESSION_TTL_SECONDS);
  } catch (e) {
    console.error(
      "[auth/exchange] sessionStore.createSession failed:",
      e instanceof Error ? e.message : String(e),
    );
    return NextResponse.json(
      {
        error: "session store unavailable",
        code: "SESSION_STORE_FAILED",
      },
      { status: 500 },
    );
  }

  // 7. 审计日志（脱敏：不记 apiKey / sessionSecret，只记 userIdHash + IP + UA）
  // 审计失败不阻塞 exchange 主流程（用户已拿到 session，审计可降级）
  const auditStore = createAuditStore();
  try {
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
  } catch (e) {
    console.error(
      "[auth/exchange] audit write failed (non-blocking):",
      e instanceof Error ? e.message : String(e),
    );
  }

  // 8. 返回 sessionId + sessionSecret + expiresAt
  // sessionSecret 只在此次响应中出现，客户端需自行存储
  // 限流计数 +1（成功换 session 后才计数，失败不计数）
  await incrementExchangeRateLimit(ip);
  return NextResponse.json({
    sessionId,
    sessionSecret,
    expiresAt: expiresAt.toISOString(),
  });
}
