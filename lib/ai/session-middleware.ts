// lib/ai/session-middleware.ts
// 服务端 session 鉴权中间件（apiKey Session 安全架构 Task 6）
//
// 设计要点（卡帕西视角）：
//   - 零信任：服务端不存 apiKey / sessionSecret 明文，KV 中只保存 AES-GCM 密文
//   - 防重放：每次请求需带 timestamp + nonce；nonce 一次性消费，TTL 5min
//   - 防篡改：HMAC-SHA256(sessionSecret, canonicalRequest) 常数时间比对
//   - 滑动续期：每次成功调用刷新 expiresAt = now + 7d，活跃用户不掉线
//   - 审计可追溯：敏感操作（exchange / revoke）写审计日志，明文不入日志
//   - 三个 KV namespace 各司其职：AUTH_SESSIONS / AUTH_NONCES / AUTH_AUDIT
//     （key 前缀也隔离，但通过独立 namespace 避免配额争用）
//
// 日志安全约束：console.* 中绝不输出 sessionSecret / apiKey / encryptedSecret /
//   encryptedApiKey 的值；调试需要时仅打印 sessionId 前缀 + 错误类型。

import { NextResponse } from "next/server";
import {
  aesGcmDecrypt,
  hmacSha256,
  sha256,
  constantTimeEqual,
} from "./crypto";
import {
  getAuthSessionsKV,
  getAuthNoncesKV,
  getAuthAuditKV,
} from "./cloudflare-env";
import { SessionStore } from "../storage/kv";

// 与 provider.ts 的 globalThis.__cloudflareEnv 声明保持一致
declare global {
  // eslint-disable-next-line no-var
  var __cloudflareEnv: Record<string, string> | undefined;
}

// ---------------------------------------------------------------------------
// 类型与常量
// ---------------------------------------------------------------------------

/** 已通过鉴权的 session 上下文，注入到 req 供下游路由使用 */
export interface SessionContext {
  userId: string;
  /** 已解密的 apiKey，供路由直接调 AI provider */
  apiKey: string;
  provider: string;
  baseURL: string;
  model: string;
  name: string;
  sessionId: string;
  expiresAt: string;
}

/** session 有效期 7 天（与滑动续期一致） */
export const SESSION_TTL_SECONDS = 7 * 24 * 60 * 60;
/** nonce 防重放 TTL：5 分钟（与 timestamp 时间窗相当） */
export const NONCE_TTL_SECONDS = 5 * 60;
/** 审计日志保留 30 天 */
export const AUDIT_TTL_SECONDS = 30 * 24 * 60 * 60;
/** 请求 timestamp 允许的时间窗：±60 秒 */
export const TIMESTAMP_WINDOW_SECONDS = 60;

// ---------------------------------------------------------------------------
// 环境变量访问
// ---------------------------------------------------------------------------

/**
 * 读取 MASTER_KEY（用于加解密 session 中的 apiKey / sessionSecret）。
 * 复用 provider.ts 的 getEnv 模式：先 process.env，再 globalThis.__cloudflareEnv。
 * @returns base64 编码的 32 字节密钥
 * @throws MASTER_KEY 未配置时抛错
 */
export function getMasterKey(): string {
  const pe = process.env.MASTER_KEY;
  if (pe) return pe;
  if (globalThis.__cloudflareEnv && globalThis.__cloudflareEnv.MASTER_KEY) {
    return globalThis.__cloudflareEnv.MASTER_KEY;
  }
  throw new Error("MASTER_KEY not configured");
}

// ---------------------------------------------------------------------------
// 签名
// ---------------------------------------------------------------------------

/**
 * 计算规范化请求的 HMAC-SHA256 签名。
 * canonical = method + "\n" + path + "\n" + bodyHash + "\n" + timestamp + "\n" + nonce
 *
 * @param method HTTP 方法（大写）
 * @param path URL pathname（不含 query）
 * @param body 请求体原文（可为空字符串）
 * @param timestamp Unix 秒（字符串）
 * @param nonce 一次性随机数
 * @param sessionSecret base64 编码的 32 字节签名密钥（与加密前一致）
 * @returns hex 编码的 HMAC-SHA256 签名（64 字符）
 */
export async function signCanonicalRequest(
  method: string,
  path: string,
  body: string,
  timestamp: string,
  nonce: string,
  sessionSecret: string,
): Promise<string> {
  const bodyHash = await sha256(body || "");
  const canonical =
    method + "\n" + path + "\n" + bodyHash + "\n" + timestamp + "\n" + nonce;
  return await hmacSha256(sessionSecret, canonical);
}

// ---------------------------------------------------------------------------
// SessionStore 工厂
// ---------------------------------------------------------------------------

/**
 * 创建 session 存储实例（绑定 AUTH_SESSIONS KV namespace）。
 * 本地开发或测试环境（无 KV binding）→ 返回内存 Map 降级版。
 */
export function createSessionStore(): SessionStore {
  return new SessionStore(getAuthSessionsKV());
}

/**
 * 创建 nonce 存储实例（绑定 AUTH_NONCES KV namespace）。
 * 仅用于 useNonce 防重放。
 */
export function createNoncesStore(): SessionStore {
  return new SessionStore(getAuthNoncesKV());
}

/**
 * 创建审计日志存储实例（绑定 AUTH_AUDIT KV namespace）。
 * 仅用于 writeAudit。
 */
export function createAuditStore(): SessionStore {
  return new SessionStore(getAuthAuditKV());
}

// ---------------------------------------------------------------------------
// 中间件
// ---------------------------------------------------------------------------

/** 统一的 401 错误响应构造器 */
function unauthorized(error: string, code: string): NextResponse {
  return NextResponse.json({ error, code }, { status: 401 });
}

/**
 * 校验请求签名并注入 session 上下文。
 *
 * 步骤：
 *   a. 读 header：X-Session-Id / X-Request-Timestamp / X-Request-Nonce / X-Request-Signature
 *   b. 缺任一 → 401 missing signature headers
 *   c. timestamp 非数字或超窗 ±60s → 401 request timestamp out of window
 *   d. nonce 已被消费 → 401 nonce already used
 *   e. session 不存在 → 401 session expired or invalid
 *   f. session 已过期（expiresAt < now）→ 401 session expired
 *   g. 解密 encryptedSecret 得 sessionSecret
 *   h. 重算签名 + constant-time 比对 → 不匹配 → 401 invalid signature
 *   i. 滑动续期：updateSession({ lastUsedAt, expiresAt: now+7d }, TTL)
 *   j. 解密 encryptedApiKey 得 apiKey
 *   k. 返回 { session: SessionContext }
 *
 * 注意：body 用 req.clone().text() 读取，保证下游路由仍可正常 req.json()。
 *
 * @returns 成功返回 { session }；失败返回 NextResponse(401)
 */
export async function requireSession(
  req: Request,
): Promise<{ session: SessionContext } | NextResponse> {
  // a. 读 header
  const sessionId = req.headers.get("x-session-id");
  const timestampStr = req.headers.get("x-request-timestamp");
  const nonce = req.headers.get("x-request-nonce");
  const receivedSignature = req.headers.get("x-request-signature");

  if (!sessionId || !timestampStr || !nonce || !receivedSignature) {
    return unauthorized("missing signature headers", "MISSING_HEADERS");
  }

  // c. timestamp 校验
  const timestampNum = Number(timestampStr);
  if (!Number.isFinite(timestampNum)) {
    return unauthorized("request timestamp out of window", "TIMESTAMP_INVALID");
  }
  const nowSec = Math.floor(Date.now() / 1000);
  if (Math.abs(nowSec - timestampNum) > TIMESTAMP_WINDOW_SECONDS) {
    return unauthorized("request timestamp out of window", "TIMESTAMP_OUT_OF_WINDOW");
  }

  // d. session 查询（先查 session，再验签，最后才消费 nonce）
  // 顺序说明（修正历史 bug）：
  //   旧实现 nonce 在签名校验前消费，导致任何后续步骤失败（SESSION_NOT_FOUND /
  //   INVALID_SIGNATURE 等）后 nonce 被永久消费，客户端若重试会卡 NONCE_REPLAY。
  //   正确顺序：先验签通过，证明请求合法且未被篡改，再消费 nonce 防重放。
  //   攻击者要重放必须先有合法签名（需要 sessionSecret），所以先验签不削弱安全性。
  const sessionStore = createSessionStore();
  const record = await sessionStore.getSession(sessionId);
  if (!record) {
    return unauthorized("session expired or invalid", "SESSION_NOT_FOUND");
  }

  // e. session 过期校验（双保险：KV TTL 应该已经清除，但内存降级模式无自动过期）
  const expiresAtMs = new Date(record.expiresAt).getTime();
  if (!Number.isFinite(expiresAtMs) || expiresAtMs < Date.now()) {
    return unauthorized("session expired", "SESSION_EXPIRED");
  }

  // f. 解密 sessionSecret
  let masterKey: string;
  try {
    masterKey = getMasterKey();
  } catch {
    // 服务端配置错误，不泄露细节给客户端
    console.error("[session] MASTER_KEY not configured");
    return unauthorized("server misconfig", "SERVER_MISCONFIG");
  }

  let sessionSecret: string;
  try {
    sessionSecret = await aesGcmDecrypt(record.encryptedSecret, masterKey);
  } catch {
    // 密文损坏或密钥不匹配 → 视为 session 失效
    console.error(
      `[session] decrypt sessionSecret failed for session ${sessionId.slice(0, 8)}…`,
    );
    return unauthorized("session expired or invalid", "SESSION_CORRUPT");
  }

  // g. 签名校验（先读 body，再重算签名）
  // 用 clone 避免消费原 body，下游路由仍可 req.json() / req.text()
  const bodyText = await req.clone().text();
  const path = new URL(req.url).pathname;
  const computedSignature = await signCanonicalRequest(
    req.method,
    path,
    bodyText,
    timestampStr,
    nonce,
    sessionSecret,
  );
  if (!constantTimeEqual(receivedSignature, computedSignature)) {
    return unauthorized("invalid signature", "INVALID_SIGNATURE");
  }

  // h. nonce 防重放（签名校验通过后才消费，避免失败请求污染 nonce 池）
  const noncesStore = createNoncesStore();
  const nonceOk = await noncesStore.useNonce(nonce, NONCE_TTL_SECONDS);
  if (!nonceOk) {
    return unauthorized("nonce already used", "NONCE_REPLAY");
  }

  // i. 滑动续期：lastUsedAt + expiresAt = now + 7d
  const now = new Date();
  const newExpiresAt = new Date(
    now.getTime() + SESSION_TTL_SECONDS * 1000,
  ).toISOString();
  await sessionStore.updateSession(
    sessionId,
    { lastUsedAt: now.toISOString(), expiresAt: newExpiresAt },
    SESSION_TTL_SECONDS,
  );

  // j. 解密 apiKey
  let apiKey: string;
  try {
    apiKey = await aesGcmDecrypt(record.encryptedApiKey, masterKey);
  } catch {
    console.error(
      `[session] decrypt apiKey failed for session ${sessionId.slice(0, 8)}…`,
    );
    return unauthorized("session expired or invalid", "SESSION_CORRUPT");
  }

  // k. 注入 session 上下文
  const session: SessionContext = {
    userId: record.userId,
    apiKey,
    provider: record.provider,
    baseURL: record.baseURL,
    model: record.model,
    name: record.name,
    sessionId,
    expiresAt: newExpiresAt,
  };

  return { session };
}
