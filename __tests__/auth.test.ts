// __tests__/auth.test.ts
// 测试 requireAuth 鉴权逻辑
//
// 阶段 3：API Token 限制放开（默认不启用，由 KV 限流控制）

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { requireAuth } from "../lib/auth";

function makeReq(opts: { auth?: string } = {}): Request {
  const headers = new Headers();
  if (opts.auth) headers.set("authorization", opts.auth);
  return new Request("https://example.com/api/test", { headers });
}

beforeEach(() => {
  // 清理环境变量（NODE_ENV 是只读的，跳过）
  delete process.env.API_TOKEN;
  delete process.env.REQUIRE_API_TOKEN;
  delete process.env.CF_PAGES;
  // 清理 Cloudflare env
  (globalThis as Record<string, unknown>).__cloudflareEnv = undefined;
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("requireAuth", () => {
  it("useServerModel=false（用户自带 modelConfig）→ 始终放行", () => {
    const res = requireAuth(makeReq(), { useServerModel: false });
    expect(res).toBeNull();
  });

  it("dataOperation=true（数据操作）→ 始终放行", () => {
    const res = requireAuth(makeReq(), { useServerModel: true, dataOperation: true });
    expect(res).toBeNull();
  });

  it("useServerModel=true + 未启用 REQUIRE_API_TOKEN → 放行（默认）", () => {
    const res = requireAuth(makeReq(), { useServerModel: true });
    expect(res).toBeNull();
  });

  it("useServerModel=true + REQUIRE_API_TOKEN=true + 未配置 API_TOKEN → 503", () => {
    process.env.REQUIRE_API_TOKEN = "true";
    const res = requireAuth(makeReq(), { useServerModel: true });
    expect(res).not.toBeNull();
    expect(res!.status).toBe(503);
  });

  it("useServerModel=true + REQUIRE_API_TOKEN=true + token 不匹配 → 401", () => {
    process.env.REQUIRE_API_TOKEN = "true";
    process.env.API_TOKEN = "secret-123";
    const res = requireAuth(makeReq({ auth: "Bearer wrong" }), { useServerModel: true });
    expect(res).not.toBeNull();
    expect(res!.status).toBe(401);
  });

  it("useServerModel=true + REQUIRE_API_TOKEN=true + token 匹配 → 放行", () => {
    process.env.REQUIRE_API_TOKEN = "true";
    process.env.API_TOKEN = "secret-123";
    const res = requireAuth(makeReq({ auth: "Bearer secret-123" }), { useServerModel: true });
    expect(res).toBeNull();
  });

  it("REQUIRE_API_TOKEN 非 'true' 字符串 → 不启用校验", () => {
    process.env.REQUIRE_API_TOKEN = "false";
    process.env.API_TOKEN = "secret-123";
    // 即使有 token，请求未带 auth 也应放行
    const res = requireAuth(makeReq(), { useServerModel: true });
    expect(res).toBeNull();
  });

  it("503 错误文案包含「未配置 AI 模型」", async () => {
    process.env.REQUIRE_API_TOKEN = "true";
    const res = requireAuth(makeReq(), { useServerModel: true });
    const body = await res!.json();
    expect(body.error).toContain("未配置 AI 模型");
    expect(body.code).toBe("NO_MODEL_CONFIG");
  });

  it("Cloudflare env 也能启用 REQUIRE_API_TOKEN", () => {
    (globalThis as Record<string, unknown>).__cloudflareEnv = {
      REQUIRE_API_TOKEN: "true",
      API_TOKEN: "cf-secret",
    };
    const res = requireAuth(makeReq(), { useServerModel: true });
    expect(res).not.toBeNull();
    expect(res!.status).toBe(401);
  });

  it("Cloudflare env + 正确 token → 放行", () => {
    (globalThis as Record<string, unknown>).__cloudflareEnv = {
      REQUIRE_API_TOKEN: "true",
      API_TOKEN: "cf-secret",
    };
    const res = requireAuth(
      makeReq({ auth: "Bearer cf-secret" }),
      { useServerModel: true }
    );
    expect(res).toBeNull();
  });
});
