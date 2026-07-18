// __tests__/auth-exchange.test.ts
// 测试 /api/auth/exchange / revoke / status 三个端点
//
// 覆盖：
//   1. exchange 成功：返回 sessionId / sessionSecret / expiresAt，sessionSecret 是 base64
//   2. exchange 缺字段：返回 400 + missing 数组
//   3. exchange 后调 requireSession 用返回的 sessionSecret 签名 → 通过
//   4. MASTER_KEY 未配置 → 500
//   5. revoke：需签名，成功后 session 被删除
//   6. status：需签名，返回 valid + expiresAt + remaining

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

// 共享的内存 KV mock（在 vi.mock 工厂外用 vi.hoisted 创建，避免 hoisting 顺序问题）
const mockKVs = vi.hoisted(() => {
  const makeKV = () => {
    const map = new Map<string, string>();
    return {
      get: (k: string) => Promise.resolve(map.has(k) ? map.get(k)! : null),
      put: (k: string, v: string) => {
        map.set(k, v);
        return Promise.resolve();
      },
      delete: (k: string) => {
        map.delete(k);
        return Promise.resolve();
      },
      _map: map,
    };
  };
  return {
    sessions: makeKV(),
    nonces: makeKV(),
    audit: makeKV(),
  };
});

// mock cloudflare-env：让 session-middleware 通过 mock KV 访问存储
vi.mock("../lib/ai/cloudflare-env", () => ({
  initCloudflareEnv: vi.fn(),
  getAuthSessionsKV: () => mockKVs.sessions,
  getAuthNoncesKV: () => mockKVs.nonces,
  getAuthAuditKV: () => mockKVs.audit,
  getCloudflareKV: () => undefined,
}));

import { NextRequest } from "next/server";
import {
  requireSession,
  signCanonicalRequest,
  SESSION_TTL_SECONDS,
  type SessionContext,
} from "../lib/ai/session-middleware";
import { SessionStore } from "../lib/storage/kv";
import { bytesToBase64, randomBytes } from "../lib/ai/crypto";

// 路由 handler（在 vi.mock 设置后导入）
import { POST as EXCHANGE_POST } from "../app/api/auth/exchange/route";
import { POST as REVOKE_POST } from "../app/api/auth/revoke/route";
import { GET as STATUS_GET } from "../app/api/auth/status/route";

// ---------- 测试夹具 ----------

const TEST_MASTER_KEY = bytesToBase64(new Uint8Array(32).fill(42));

/** 直接基于 mockKVs 的 store（用于直接读 session 状态） */
let sessionStore: SessionStore;

beforeEach(() => {
  // 设置 MASTER_KEY
  process.env.MASTER_KEY = TEST_MASTER_KEY;
  // 清理 Cloudflare env
  (globalThis as Record<string, unknown>).__cloudflareEnv = undefined;

  // 清空共享 KV
  mockKVs.sessions._map.clear();
  mockKVs.nonces._map.clear();
  mockKVs.audit._map.clear();

  // sessionStore 绑定 sessions KV（用于直接读 session 状态）
  sessionStore = new SessionStore(mockKVs.sessions);
});

afterEach(() => {
  delete process.env.MASTER_KEY;
  vi.restoreAllMocks();
});

/** 构造合法的 exchange body */
function makeExchangeBody(overrides: Record<string, string> = {}): Record<string, string> {
  return {
    apiKey: "sk-test-api-key-xyz",
    userId: "user-1",
    provider: "glm",
    baseURL: "https://api.glm.com/v1",
    model: "glm-4-flash",
    name: "Test GLM",
    ...overrides,
  };
}

/** 构造 exchange NextRequest */
function makeExchangeRequest(body: unknown): NextRequest {
  return new NextRequest("https://example.com/api/auth/exchange", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: typeof body === "string" ? body : JSON.stringify(body),
  });
}

/** 构造已签名的 NextRequest（用于 revoke / status） */
async function makeSignedRequest(
  sessionId: string,
  sessionSecret: string,
  opts: { method: string; path: string; body?: string },
): Promise<NextRequest> {
  const { method, path, body = "" } = opts;
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const nonce = randomBytes(16);
  const signature = await signCanonicalRequest(
    method,
    path,
    body,
    timestamp,
    nonce,
    sessionSecret,
  );
  const headers = new Headers({
    "x-session-id": sessionId,
    "x-request-timestamp": timestamp,
    "x-request-nonce": nonce,
    "x-request-signature": signature,
  });
  return new NextRequest(`https://example.com${path}`, {
    method,
    headers,
    body: method === "GET" ? undefined : body,
  });
}

// ---------- 测试用例 ----------

describe("/api/auth/exchange", () => {
  it("exchange 成功：返回 sessionId / sessionSecret / expiresAt，sessionSecret 是 base64", async () => {
    const req = makeExchangeRequest(makeExchangeBody());
    const res = await EXCHANGE_POST(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.sessionId).toMatch(/^[0-9a-f]{32}$/);
    expect(body.sessionSecret).toMatch(/^[A-Za-z0-9+/]{43}=$/); // 32 字节 base64
    expect(body.expiresAt).toBeDefined();
    // expiresAt 应为 ISO 字符串
    expect(() => new Date(body.expiresAt).toISOString()).not.toThrow();
  });

  it("exchange 缺字段：返回 400 + missing 数组", async () => {
    // 缺 apiKey 和 model
    const req = makeExchangeRequest(
      makeExchangeBody({ apiKey: "", model: "" }),
    );
    const res = await EXCHANGE_POST(req);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.code).toBe("MISSING_FIELDS");
    expect(Array.isArray(body.missing)).toBe(true);
    expect(body.missing).toContain("apiKey");
    expect(body.missing).toContain("model");
  });

  it("exchange 后调 requireSession 用返回的 sessionSecret 签名 → 通过", async () => {
    // 1. exchange
    const exchangeReq = makeExchangeRequest(makeExchangeBody());
    const exchangeRes = await EXCHANGE_POST(exchangeReq);
    expect(exchangeRes.status).toBe(200);
    const { sessionId, sessionSecret } = await exchangeRes.json();

    // 2. 用返回的 sessionSecret 签名一个请求，调 requireSession
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const nonce = randomBytes(16);
    const path = "/api/test-echo";
    const body = '{"hello":"world"}';
    const signature = await signCanonicalRequest(
      "POST",
      path,
      body,
      timestamp,
      nonce,
      sessionSecret,
    );
    const signedReq = new NextRequest(`https://example.com${path}`, {
      method: "POST",
      headers: {
        "x-session-id": sessionId,
        "x-request-timestamp": timestamp,
        "x-request-nonce": nonce,
        "x-request-signature": signature,
        "Content-Type": "application/json",
      },
      body,
    });
    const result = await requireSession(signedReq);
    expect(result).not.toBeInstanceOf(Response);
    const { session } = result as { session: SessionContext };
    expect(session.apiKey).toBe("sk-test-api-key-xyz");
    expect(session.userId).toBe("user-1");
    expect(session.provider).toBe("glm");
  });

  it("MASTER_KEY 未配置 → 500", async () => {
    delete process.env.MASTER_KEY;
    (globalThis as Record<string, unknown>).__cloudflareEnv = undefined;
    const req = makeExchangeRequest(makeExchangeBody());
    const res = await EXCHANGE_POST(req);
    expect(res.status).toBe(500);
    const body = await res.json();
    expect(body.code).toBe("SERVER_MISCONFIG");
    // 不泄露用户输入
    const text = JSON.stringify(body);
    expect(text).not.toContain("sk-test-api-key");
  });
});

describe("/api/auth/revoke", () => {
  it("revoke：需签名，成功后 session 被删除", async () => {
    // 1. exchange 创建 session
    const exchangeReq = makeExchangeRequest(makeExchangeBody());
    const exchangeRes = await EXCHANGE_POST(exchangeReq);
    expect(exchangeRes.status).toBe(200);
    const { sessionId, sessionSecret } = await exchangeRes.json();

    // 2. 用 sessionSecret 签 revoke 请求
    const revokeReq = await makeSignedRequest(sessionId, sessionSecret, {
      method: "POST",
      path: "/api/auth/revoke",
      body: "",
    });
    const revokeRes = await REVOKE_POST(revokeReq);
    expect(revokeRes.status).toBe(200);
    const body = await revokeRes.json();
    expect(body.ok).toBe(true);

    // 3. session 应已被删除
    const stillExists = await sessionStore.getSession(sessionId);
    expect(stillExists).toBeNull();

    // 4. 审计日志已写入：再次用相同 sessionId 签请求，应在 session 查询步骤失败
    const revokeReq2 = await makeSignedRequest(sessionId, sessionSecret, {
      method: "POST",
      path: "/api/auth/revoke",
      body: "",
    });
    const revokeRes2 = await REVOKE_POST(revokeReq2);
    expect(revokeRes2.status).toBe(401);
  });
});

describe("/api/auth/status", () => {
  it("status：需签名，返回 valid + expiresAt + remaining", async () => {
    // 1. exchange 创建 session
    const exchangeReq = makeExchangeRequest(makeExchangeBody());
    const exchangeRes = await EXCHANGE_POST(exchangeReq);
    expect(exchangeRes.status).toBe(200);
    const { sessionId, sessionSecret } = await exchangeRes.json();

    // 2. 用 sessionSecret 签 status 请求
    const statusReq = await makeSignedRequest(sessionId, sessionSecret, {
      method: "GET",
      path: "/api/auth/status",
    });
    const statusRes = await STATUS_GET(statusReq);
    expect(statusRes.status).toBe(200);
    const body = await statusRes.json();
    expect(body.valid).toBe(true);
    expect(body.expiresAt).toBeDefined();
    expect(typeof body.remaining).toBe("number");
    expect(body.remaining).toBeGreaterThan(0);
    // 应在 7 天附近（滑动续期刚发生，允许 ≤ 10s 的延迟误差）
    const sevenDaysMs = SESSION_TTL_SECONDS * 1000;
    expect(body.remaining).toBeLessThanOrEqual(sevenDaysMs);
    expect(body.remaining).toBeGreaterThan(sevenDaysMs - 10_000);

    // 3. 缺签名 → 401
    const unsignedReq = new NextRequest("https://example.com/api/auth/status", {
      method: "GET",
    });
    const unsignedRes = await STATUS_GET(unsignedReq);
    expect(unsignedRes.status).toBe(401);
  });
});
