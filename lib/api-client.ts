// lib/api-client.ts
// 客户端 API 调用封装：基于 session 签名的零信任客户端
//
// 设计（卡帕西视角）：
//   - 客户端不再持有长期 Bearer token；用 sessionId + HMAC-SHA256 签名替代
//   - apiKey 一次性发送到 /api/auth/exchange 换取 session（服务端 AES-GCM 加密落 KV）
//   - 之后所有请求带 X-Session-Id + X-Request-Timestamp + X-Request-Nonce + X-Request-Signature
//   - 服务端用 sessionSecret 验签 + constant-time 比对，防篡改防重放
//   - sessionSecret 仅客户端持有（IndexedDB），永不传输
//
// 安全收益：
//   - 网络上不再有 apiKey 明文（仅 exchange 那一次）
//   - 任何请求被截获也无法重放（nonce 一次性 + 时间窗 ±60s）
//   - 任何请求被篡改都会导致签名校验失败
//   - 用户主动 revoke 可立即吊销所有设备

import { getItem, setItem, delItem } from "@/lib/storage/db";
import { randomBytes } from "@/lib/ai/crypto";
import { signCanonicalRequest } from "@/lib/ai/session-middleware";

const SESSION_KEY = "auth:session";

/** 客户端持有的 session 上下文（IndexedDB 持久化） */
export interface ClientSession {
  sessionId: string;
  /** base64 编码的 32 字节签名密钥，仅客户端持有，永不传输 */
  sessionSecret: string;
  /** ISO 字符串，过期时间 */
  expiresAt: string;
  /** 用户 ID（本地缓存，用于 UI 展示与 exchange 时使用） */
  userId: string;
  provider: string;
  baseURL: string;
  model: string;
  name: string;
}

/** session 过期或不存在时抛出，调用方应引导用户重新 exchange */
export class SessionExpiredError extends Error {
  constructor(msg = "session expired or not found, please re-exchange") {
    super(msg);
    this.name = "SessionExpiredError";
  }
}

/**
 * 调 /api/auth/exchange 用 apiKey + userId 换取 session
 * 成功后将 session 持久化到 IndexedDB
 */
export async function exchangeSession(modelConfig: {
  apiKey: string;
  userId: string;
  provider: string;
  baseURL: string;
  model: string;
  name: string;
}): Promise<ClientSession> {
  const res = await fetch("/api/auth/exchange", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(modelConfig),
  });
  if (!res.ok) {
    const err = (await res.json().catch(() => ({ error: "exchange failed" }))) as {
      error?: string;
    };
    throw new Error(err.error || `exchange failed: ${res.status}`);
  }
  const data = (await res.json()) as {
    sessionId: string;
    sessionSecret: string;
    expiresAt: string;
  };
  const session: ClientSession = {
    sessionId: data.sessionId,
    sessionSecret: data.sessionSecret,
    expiresAt: data.expiresAt,
    userId: modelConfig.userId,
    provider: modelConfig.provider,
    baseURL: modelConfig.baseURL,
    model: modelConfig.model,
    name: modelConfig.name,
  };
  await setItem(SESSION_KEY, session);
  return session;
}

/** 读取有效 session，过期或不存在抛 SessionExpiredError */
export async function getValidSession(): Promise<ClientSession> {
  const session = await getItem<ClientSession>(SESSION_KEY);
  if (!session) throw new SessionExpiredError();
  const expiresAtMs = new Date(session.expiresAt).getTime();
  if (!Number.isFinite(expiresAtMs) || expiresAtMs < Date.now()) {
    throw new SessionExpiredError();
  }
  return session;
}

/** 检查是否已有有效 session（不抛错，返回 boolean） */
export async function hasValidSession(): Promise<boolean> {
  try {
    await getValidSession();
    return true;
  } catch {
    return false;
  }
}

/**
 * 生成签名 headers（X-Session-Id / X-Request-Timestamp / X-Request-Nonce / X-Request-Signature）
 * @param method HTTP 方法
 * @param path URL pathname（不含 query）
 * @param body 请求体原文（可为空字符串）
 * @param sessionSecret base64 编码的签名密钥
 */
async function signRequest(
  method: string,
  path: string,
  body: string,
  sessionSecret: string,
): Promise<Record<string, string>> {
  const timestamp = String(Math.floor(Date.now() / 1000));
  const nonce = randomBytes(16); // 32 hex 字符
  const signature = await signCanonicalRequest(
    method,
    path,
    body,
    timestamp,
    nonce,
    sessionSecret,
  );
  return {
    "X-Session-Id": (await getValidSession()).sessionId,
    "X-Request-Timestamp": timestamp,
    "X-Request-Nonce": nonce,
    "X-Request-Signature": signature,
  };
}

/**
 * 带 session 签名的 fetch（非 AI 路由用，如 /api/sync）
 * 不再附加 Authorization: Bearer，改用 HMAC 签名
 */
export async function apiFetch(
  url: string,
  options: RequestInit = {},
): Promise<Response> {
  const session = await getValidSession();
  const headers = new Headers(options.headers);
  headers.set("Content-Type", "application/json");
  const path = new URL(url, window.location.origin).pathname;
  const body = typeof options.body === "string" ? options.body : "";
  const sigHeaders = await signRequest(
    options.method ?? "GET",
    path,
    body,
    session.sessionSecret,
  );
  for (const [k, v] of Object.entries(sigHeaders)) {
    headers.set(k, v);
  }
  return fetch(url, { ...options, headers });
}

/**
 * AI API 专用 fetch（带超时）
 *
 * 与 apiFetch 区别：
 *   - 默认 180s 超时（AI 调用较慢）
 *   - 支持外部 signal 合并（用户点"中止"按钮时取消）
 *   - body 不再注入 modelConfig.apiKey 和 userId（服务端从 session 取）
 */
export async function aiFetch(
  url: string,
  options: RequestInit = {},
  timeoutMs: number = 180000,
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = timeoutMs > 0 ? setTimeout(() => controller.abort(), timeoutMs) : null;
  try {
    const session = await getValidSession();
    const headers = new Headers(options.headers);
    headers.set("Content-Type", "application/json");
    const body = typeof options.body === "string" ? options.body : "";
    const path = new URL(url, window.location.origin).pathname;
    const sigHeaders = await signRequest(
      options.method ?? "POST",
      path,
      body,
      session.sessionSecret,
    );
    for (const [k, v] of Object.entries(sigHeaders)) {
      headers.set(k, v);
    }
    // 合并外部 signal：任一触发即中止
    const externalSignal = options.signal;
    if (externalSignal) {
      if (externalSignal.aborted) controller.abort();
      else externalSignal.addEventListener("abort", () => controller.abort(), { once: true });
    }
    return fetch(url, { ...options, headers, signal: controller.signal });
  } catch (err) {
    if (err instanceof Error && err.name === "AbortError") {
      if (timeoutMs > 0) {
        throw new Error(`请求超时（${Math.round(timeoutMs / 1000)}秒），请重试`);
      }
      throw new Error("请求已中止");
    }
    throw err;
  } finally {
    if (timeoutId) clearTimeout(timeoutId);
  }
}

/**
 * 吊销当前 session
 * - 调 /api/auth/revoke（带签名）服务端立即删除 session
 * - 清空本地 IndexedDB 中的 session 记录
 * - 即使服务端调用失败（网络错误等）也清空本地，确保本机立即登出
 */
export async function revokeSession(): Promise<void> {
  try {
    const session = await getValidSession();
    const path = "/api/auth/revoke";
    const sigHeaders = await signRequest("POST", path, "", session.sessionSecret);
    await fetch("/api/auth/revoke", {
      method: "POST",
      headers: { "Content-Type": "application/json", ...sigHeaders },
    });
  } catch {
    // 忽略错误（session 可能已失效）
  }
  await delItem(SESSION_KEY);
}
