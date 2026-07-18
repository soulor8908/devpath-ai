// __tests__/session-middleware.test.ts
// 测试 requireSession 鉴权中间件
//
// 覆盖：
//   1. 缺任一 header → 401 missing signature headers
//   2. timestamp 超窗 → 401 request timestamp out of window
//   3. timestamp 非数字 → 401
//   4. nonce 重复（连续两次相同 nonce）→ 第二次 401 nonce already used
//   5. session 不存在 → 401 session expired or invalid
//   6. session 过期（expiresAt 在过去）→ 401 session expired
//   7. 签名错误 → 401 invalid signature
//   8. 签名正确 → 返回 { session: SessionContext }
//   9. 签名正确时 KV 中 expiresAt 被更新为 now+7d（滑动续期）
//   10. 签名正确时 nonce 写入 KV

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

import {
  requireSession,
  signCanonicalRequest,
  SESSION_TTL_SECONDS,
  type SessionContext,
} from "../lib/ai/session-middleware";
import { SessionStore, type SessionRecord } from "../lib/storage/kv";
import { aesGcmEncrypt, bytesToBase64, randomBytes } from "../lib/ai/crypto";

// ---------- 测试夹具 ----------

const TEST_MASTER_KEY = bytesToBase64(new Uint8Array(32).fill(42));
const TEST_PATH = "/api/test";

/** 两个独立 store（基于 mockKVs 共享底层 KV） */
let sessionStore: SessionStore;
let noncesStore: SessionStore;

beforeEach(() => {
  // 设置 MASTER_KEY
  process.env.MASTER_KEY = TEST_MASTER_KEY;
  // 清理 Cloudflare env
  (globalThis as Record<string, unknown>).__cloudflareEnv = undefined;

  // 清空共享 KV
  mockKVs.sessions._map.clear();
  mockKVs.nonces._map.clear();
  mockKVs.audit._map.clear();

  // 两个独立 SessionStore（sessionStore 用于读 session，noncesStore 用于读 nonce）
  sessionStore = new SessionStore(mockKVs.sessions);
  noncesStore = new SessionStore(mockKVs.nonces);
});

afterEach(() => {
  delete process.env.MASTER_KEY;
  vi.restoreAllMocks();
});

/** 构造一个完整 SessionRecord（明文 apiKey + sessionSecret 加密后入库） */
async function makeRecord(
  overrides: Partial<SessionRecord> = {},
): Promise<{ record: SessionRecord; sessionSecret: string; sessionId: string }> {
  const sessionId = randomBytes(16);
  const sessionSecretBytes = crypto.getRandomValues(new Uint8Array(32));
  const sessionSecret = bytesToBase64(sessionSecretBytes);
  const encryptedApiKey = await aesGcmEncrypt("test-api-key-xyz", TEST_MASTER_KEY);
  const encryptedSecret = await aesGcmEncrypt(sessionSecret, TEST_MASTER_KEY);
  const now = new Date();
  const expiresAt = new Date(now.getTime() + SESSION_TTL_SECONDS * 1000);
  const record: SessionRecord = {
    userId: "user-1",
    encryptedApiKey,
    encryptedSecret,
    provider: "glm",
    baseURL: "https://api.glm.com/v1",
    model: "glm-4-flash",
    name: "Test Model",
    createdAt: now.toISOString(),
    lastUsedAt: now.toISOString(),
    expiresAt: expiresAt.toISOString(),
    ...overrides,
  };
  return { record, sessionSecret, sessionId };
}

/** 把 record 写入 sessionStore */
async function seedSession(
  overrides: Partial<SessionRecord> = {},
): Promise<{ record: SessionRecord; sessionSecret: string; sessionId: string }> {
  const seed = await makeRecord(overrides);
  await sessionStore.createSession(seed.sessionId, seed.record, SESSION_TTL_SECONDS);
  return seed;
}

/** 构造一个签名好的 Request */
async function makeSignedRequest(
  sessionId: string,
  sessionSecret: string,
  opts: {
    method?: string;
    body?: string;
    timestamp?: string;
    nonce?: string;
    path?: string;
    omitHeader?: "sessionId" | "timestamp" | "nonce" | "signature";
  } = {},
): Promise<Request> {
  const method = opts.method ?? "POST";
  const body = opts.body ?? "";
  const timestamp = opts.timestamp ?? Math.floor(Date.now() / 1000).toString();
  const nonce = opts.nonce ?? randomBytes(16);
  const path = opts.path ?? TEST_PATH;
  const signature = await signCanonicalRequest(
    method,
    path,
    body,
    timestamp,
    nonce,
    sessionSecret,
  );

  const headers = new Headers();
  if (opts.omitHeader !== "sessionId") headers.set("x-session-id", sessionId);
  if (opts.omitHeader !== "timestamp")
    headers.set("x-request-timestamp", timestamp);
  if (opts.omitHeader !== "nonce") headers.set("x-request-nonce", nonce);
  if (opts.omitHeader !== "signature")
    headers.set("x-request-signature", signature);

  return new Request(`https://example.com${path}`, {
    method,
    headers,
    body: method === "GET" ? undefined : body,
  });
}

// ---------- 测试用例 ----------

describe("requireSession: 缺 header", () => {
  it("缺任一 header → 401 missing signature headers", async () => {
    const { sessionId, sessionSecret } = await seedSession();
    for (const omit of ["sessionId", "timestamp", "nonce", "signature"] as const) {
      const req = await makeSignedRequest(sessionId, sessionSecret, { omitHeader: omit });
      const result = await requireSession(req);
      expect(result).toBeInstanceOf(Response);
      const res = result as Response;
      expect(res.status).toBe(401);
      const body = await res.json();
      expect(body.error).toBe("missing signature headers");
      expect(body.code).toBe("MISSING_HEADERS");
    }
  });
});

describe("requireSession: timestamp 校验", () => {
  it("timestamp 超窗（±60s 之外）→ 401 request timestamp out of window", async () => {
    const { sessionId, sessionSecret } = await seedSession();
    const futureTimestamp = (Math.floor(Date.now() / 1000) + 120).toString();
    const req = await makeSignedRequest(sessionId, sessionSecret, {
      timestamp: futureTimestamp,
    });
    const result = await requireSession(req);
    expect(result).toBeInstanceOf(Response);
    const res = result as Response;
    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.error).toBe("request timestamp out of window");
    expect(body.code).toBe("TIMESTAMP_OUT_OF_WINDOW");
  });

  it("timestamp 非数字 → 401", async () => {
    const { sessionId, sessionSecret } = await seedSession();
    const req = await makeSignedRequest(sessionId, sessionSecret, {
      timestamp: "not-a-number",
    });
    const result = await requireSession(req);
    expect(result).toBeInstanceOf(Response);
    const res = result as Response;
    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.error).toBe("request timestamp out of window");
    expect(body.code).toBe("TIMESTAMP_INVALID");
  });
});

describe("requireSession: nonce 防重放", () => {
  it("nonce 重复（连续两次相同 nonce）→ 第二次 401 nonce already used", async () => {
    const { sessionId, sessionSecret } = await seedSession();
    const sharedNonce = randomBytes(16);

    // 第一次：会因签名校验之外其他原因通过 nonce 检查（这里只要 nonce 被消费即可）
    const req1 = await makeSignedRequest(sessionId, sessionSecret, {
      nonce: sharedNonce,
    });
    await requireSession(req1);

    // 第二次：相同 nonce → 应在 nonce 步骤失败
    const req2 = await makeSignedRequest(sessionId, sessionSecret, {
      nonce: sharedNonce,
    });
    const result2 = await requireSession(req2);
    expect(result2).toBeInstanceOf(Response);
    const res = result2 as Response;
    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.error).toBe("nonce already used");
    expect(body.code).toBe("NONCE_REPLAY");
  });

  it("签名正确时 nonce 写入 KV（TTL 5min）", async () => {
    const { sessionId, sessionSecret } = await seedSession();
    const nonce = randomBytes(16);
    const req = await makeSignedRequest(sessionId, sessionSecret, { nonce });
    const result = await requireSession(req);
    expect(result).not.toBeInstanceOf(Response);
    // 直接查 nonces store：应已存在
    const consumed = await noncesStore.useNonce(nonce, 60);
    expect(consumed).toBe(false); // 已存在，再次消费应失败
  });
});

describe("requireSession: session 校验", () => {
  it("session 不存在 → 401 session expired or invalid", async () => {
    // 不调 seedSession，sessionId 在 KV 中不存在
    const sessionSecret = bytesToBase64(crypto.getRandomValues(new Uint8Array(32)));
    const sessionId = randomBytes(16);
    const req = await makeSignedRequest(sessionId, sessionSecret);
    const result = await requireSession(req);
    expect(result).toBeInstanceOf(Response);
    const res = result as Response;
    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.error).toBe("session expired or invalid");
    expect(body.code).toBe("SESSION_NOT_FOUND");
  });

  it("session 过期（expiresAt 在过去）→ 401 session expired", async () => {
    const pastExpiresAt = new Date(Date.now() - 60 * 1000).toISOString();
    const { sessionId, sessionSecret } = await seedSession({
      expiresAt: pastExpiresAt,
    });
    const req = await makeSignedRequest(sessionId, sessionSecret);
    const result = await requireSession(req);
    expect(result).toBeInstanceOf(Response);
    const res = result as Response;
    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.error).toBe("session expired");
    expect(body.code).toBe("SESSION_EXPIRED");
  });
});

describe("requireSession: 签名校验", () => {
  it("签名错误（用错 sessionSecret）→ 401 invalid signature", async () => {
    const { sessionId } = await seedSession();
    // 用一个错误的 sessionSecret 签名
    const wrongSecret = bytesToBase64(new Uint8Array(32).fill(99));
    const req = await makeSignedRequest(sessionId, wrongSecret);
    const result = await requireSession(req);
    expect(result).toBeInstanceOf(Response);
    const res = result as Response;
    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.error).toBe("invalid signature");
    expect(body.code).toBe("INVALID_SIGNATURE");
  });

  it("签名正确 → 返回 { session: SessionContext }", async () => {
    const { sessionId, sessionSecret, record } = await seedSession();
    const req = await makeSignedRequest(sessionId, sessionSecret);
    const result = await requireSession(req);
    expect(result).not.toBeInstanceOf(Response);
    const { session } = result as { session: SessionContext };
    expect(session.userId).toBe(record.userId);
    expect(session.apiKey).toBe("test-api-key-xyz");
    expect(session.provider).toBe(record.provider);
    expect(session.baseURL).toBe(record.baseURL);
    expect(session.model).toBe(record.model);
    expect(session.name).toBe(record.name);
    expect(session.sessionId).toBe(sessionId);
  });
});

describe("requireSession: 滑动续期", () => {
  it("签名正确时 KV 中的 session expiresAt 被更新为 now+7d", async () => {
    // 设置一个较近的 expiresAt（1 小时后），调用后应被刷新为 7 天后
    const nearExpiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString();
    const { sessionId, sessionSecret } = await seedSession({
      expiresAt: nearExpiresAt,
    });

    const beforeMs = Date.now();
    const req = await makeSignedRequest(sessionId, sessionSecret);
    const result = await requireSession(req);
    expect(result).not.toBeInstanceOf(Response);

    // 读取更新后的 record
    const updated = await sessionStore.getSession(sessionId);
    expect(updated).not.toBeNull();
    const newExpiresAtMs = new Date(updated!.expiresAt).getTime();
    const sevenDaysMs = SESSION_TTL_SECONDS * 1000;
    // 新 expiresAt 应在 beforeMs + 7d 附近（允许 ±5s 误差）
    expect(newExpiresAtMs).toBeGreaterThan(beforeMs + sevenDaysMs - 5000);
    expect(newExpiresAtMs).toBeLessThan(Date.now() + sevenDaysMs + 5000);
    // lastUsedAt 也应被更新
    expect(updated!.lastUsedAt).not.toBe(nearExpiresAt);
  });
});

// ---------- 篡改与重放测试（补缺：body / path / method / 跨 session） ----------

describe("requireSession: 篡改检测", () => {
  it("body 篡改：用 body A 签名、发送 body B → 401 INVALID_SIGNATURE", async () => {
    const { sessionId, sessionSecret } = await seedSession();
    // 用 body A 签名，但实际发 body B
    const req = await makeSignedRequest(sessionId, sessionSecret, {
      body: '{"topic":"A"}',
    });
    // 手工重写 request 的 body 为 B（构造新 Request）
    const tampered = new Request(req.url, {
      method: "POST",
      headers: req.headers,
      body: '{"topic":"B"}',
    });
    const result = await requireSession(tampered);
    expect(result).toBeInstanceOf(Response);
    const res = result as Response;
    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.code).toBe("INVALID_SIGNATURE");
  });

  it("非空 body 签名正确 → 通过（验证非空 body 真的参与签名）", async () => {
    const { sessionId, sessionSecret } = await seedSession();
    const req = await makeSignedRequest(sessionId, sessionSecret, {
      body: '{"topic":"真实主题"}',
    });
    const result = await requireSession(req);
    expect(result).not.toBeInstanceOf(Response);
  });

  it("path 篡改：为 /api/A 签名、发到 /api/B → 401 INVALID_SIGNATURE", async () => {
    const { sessionId, sessionSecret } = await seedSession();
    // 为 path A 签名
    const req = await makeSignedRequest(sessionId, sessionSecret, {
      path: "/api/A",
    });
    // 但实际请求 path B（签名头不变）
    const tampered = new Request("https://example.com/api/B", {
      method: "POST",
      headers: req.headers,
      body: "",
    });
    const result = await requireSession(tampered);
    expect(result).toBeInstanceOf(Response);
    const res = result as Response;
    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.code).toBe("INVALID_SIGNATURE");
  });

  it("method 篡改：用 POST 签名、GET 发送 → 401 INVALID_SIGNATURE", async () => {
    const { sessionId, sessionSecret } = await seedSession();
    // 用 POST 签名
    const req = await makeSignedRequest(sessionId, sessionSecret, {
      method: "POST",
    });
    // 实际用 GET 发（GET 无 body）
    const tampered = new Request(req.url, {
      method: "GET",
      headers: req.headers,
    });
    const result = await requireSession(tampered);
    expect(result).toBeInstanceOf(Response);
    const res = result as Response;
    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.code).toBe("INVALID_SIGNATURE");
  });

  it("timestamp 篡改：签名时 T1，header 发 T2 → 401 INVALID_SIGNATURE（或 TIMESTAMP_OUT_OF_WINDOW）", async () => {
    const { sessionId, sessionSecret } = await seedSession();
    // 用 T1 签名
    const t1 = Math.floor(Date.now() / 1000).toString();
    const req = await makeSignedRequest(sessionId, sessionSecret, {
      timestamp: t1,
    });
    // 把 header 里的 timestamp 改成 T2（仍在窗口内，避免被 TIMESTAMP_OUT_OF_WINDOW 提前拦截）
    const t2 = (Math.floor(Date.now() / 1000) + 10).toString();
    const tampered = new Request(req.url, {
      method: "POST",
      headers: new Headers([
        ["x-session-id", sessionId],
        ["x-request-timestamp", t2],
        ["x-request-nonce", req.headers.get("x-request-nonce")!],
        ["x-request-signature", req.headers.get("x-request-signature")!],
      ]),
      body: "",
    });
    const result = await requireSession(tampered);
    expect(result).toBeInstanceOf(Response);
    const res = result as Response;
    expect(res.status).toBe(401);
    const body = await res.json();
    // 改了 timestamp 后重算签名对不上，应是 INVALID_SIGNATURE
    expect(body.code).toBe("INVALID_SIGNATURE");
  });
});

describe("requireSession: 跨 session 重放", () => {
  it("用 session A 的 secret 签名，header 带 session B 的 sessionId → 401", async () => {
    const seedA = await seedSession();
    const seedB = await seedSession();
    // 用 A 的 secret 签名
    const req = await makeSignedRequest(seedA.sessionId, seedA.sessionSecret, {});
    // 但把 header 里的 sessionId 改成 B
    const tampered = new Request(req.url, {
      method: "POST",
      headers: new Headers([
        ["x-session-id", seedB.sessionId],
        ["x-request-timestamp", req.headers.get("x-request-timestamp")!],
        ["x-request-nonce", req.headers.get("x-request-nonce")!],
        ["x-request-signature", req.headers.get("x-request-signature")!],
      ]),
      body: "",
    });
    const result = await requireSession(tampered);
    expect(result).toBeInstanceOf(Response);
    const res = result as Response;
    expect(res.status).toBe(401);
    // B 解密出的 secret 与签名时用的 A 的 secret 不同 → INVALID_SIGNATURE
    const body = await res.json();
    expect(body.code).toBe("INVALID_SIGNATURE");
  });
});

describe("requireSession: 非 ASCII / 大 body", () => {
  it("中文 JSON body 签名正确 → 通过（验证 UTF-8 编码两端一致）", async () => {
    const { sessionId, sessionSecret } = await seedSession();
    const chineseBody = JSON.stringify({
      topic: "前端学习路径",
      detail: "深入理解 React Hooks 与并发模式",
    });
    const req = await makeSignedRequest(sessionId, sessionSecret, {
      body: chineseBody,
    });
    const result = await requireSession(req);
    expect(result).not.toBeInstanceOf(Response);
  });

  it("大 body（>32KB）签名正确 → 通过", async () => {
    const { sessionId, sessionSecret } = await seedSession();
    // 构造 > 32KB 的 body（验证 bytesToBase64 分块逻辑不影响 sha256）
    const big = "x".repeat(40000);
    const req = await makeSignedRequest(sessionId, sessionSecret, {
      body: JSON.stringify({ data: big }),
    });
    const result = await requireSession(req);
    expect(result).not.toBeInstanceOf(Response);
  });
});
