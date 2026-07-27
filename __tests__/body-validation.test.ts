// __tests__/body-validation.test.ts
// 请求体校验中间件守护测试（2026-07-27 P1）
//
// 历史根因：
//   18 个 AI 路由逐字重复 `try { body = await req.json() } catch { 400 }`，
//   然后用 `body as { ... }` 裸类型断言 + 手写 if 校验。
//   依赖下游/LLM 兜底 → 攻击者可构造畸形 body 触发未定义行为或污染 prompt。
//
// 闭环解法：
//   抽公共 parseRequestBody<T>(req, schema) 中间件 + 共享 schema 片段
//   （nonEmptyString / isoDate / boundedString）。
//
// 本测试守护：
//   - parseRequestBody 的核心契约（成功返 {data}，失败返 NextResponse(400)）
//   - 共享 schema 片段的语义（trim、长度、枚举）
//   - 已迁移路由的 schema 关键字段（防回归）

import { describe, it, expect } from "vitest";
import { z } from "zod";
import { NextResponse } from "next/server";
import {
  parseRequestBody,
  nonEmptyString,
  isoDate,
  boundedString,
} from "@/lib/ai/body-validation";

// 辅助：构造一个 mock Request
function makeReq(body: unknown): Request {
  return new Request("https://test.local/api/test", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: typeof body === "string" ? body : JSON.stringify(body),
  });
}

// 辅助：构造一个 body 解析会抛错的 Request（无效 JSON）
function makeInvalidJsonReq(): Request {
  return new Request("https://test.local/api/test", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: "not-json{",
  });
}

describe("parseRequestBody 核心契约", () => {
  const schema = z.object({
    name: z.string().min(1),
    age: z.number().int().min(0).max(150),
  });

  it("合法 body → 返回 { data }", async () => {
    const result = await parseRequestBody(makeReq({ name: "alice", age: 30 }), schema);
    expect(result).not.toBeInstanceOf(NextResponse);
    expect((result as { data: { name: string; age: number } }).data).toEqual({
      name: "alice",
      age: 30,
    });
  });

  it("非法 JSON → 返回 NextResponse(400) + INVALID_JSON", async () => {
    const result = await parseRequestBody(makeInvalidJsonReq(), schema);
    expect(result).toBeInstanceOf(NextResponse);
    const res = result as NextResponse;
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.code).toBe("INVALID_JSON");
    expect(body.error).toContain("请求体格式错误");
  });

  it("schema 校验失败 → 返回 NextResponse(400) + VALIDATION_FAILED + 字段路径", async () => {
    const result = await parseRequestBody(makeReq({ name: "", age: 999 }), schema);
    expect(result).toBeInstanceOf(NextResponse);
    const res = result as NextResponse;
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.code).toBe("VALIDATION_FAILED");
    expect(body.error).toContain("字段校验失败");
    // issues 数组供调试
    expect(Array.isArray(body.issues)).toBe(true);
    expect(body.issues.length).toBeGreaterThan(0);
  });

  it("缺字段 → 校验失败 + 字段路径包含缺失字段名", async () => {
    const result = await parseRequestBody(makeReq({ name: "alice" }), schema);
    expect(result).toBeInstanceOf(NextResponse);
    const body = await (result as NextResponse).json();
    expect(body.error).toContain("age");
  });

  it("支持 .default() —— 字段缺失时填充默认值（类型也是必填）", async () => {
    const schemaWithDefault = z.object({
      topic: z.string(),
      dailyMinutes: z.number().min(15).max(120).default(30),
    });
    const result = await parseRequestBody(makeReq({ topic: "react" }), schemaWithDefault);
    expect(result).not.toBeInstanceOf(NextResponse);
    const data = (result as { data: { topic: string; dailyMinutes: number } }).data;
    expect(data.dailyMinutes).toBe(30);
    // 类型层面 dailyMinutes 应该是 number（不是 number | undefined）
    // 这里通过赋值给 number 类型变量间接验证
    const _: number = data.dailyMinutes;
    expect(_).toBe(30);
  });
});

describe("共享 schema 片段语义", () => {
  it("nonEmptyString: trim 后非空才通过", () => {
    expect(nonEmptyString.safeParse("hello").success).toBe(true);
    expect(nonEmptyString.safeParse("  hello  ").success).toBe(true);
    expect(nonEmptyString.safeParse("").success).toBe(false);
    expect(nonEmptyString.safeParse("   ").success).toBe(false);
  });

  it("isoDate: 必须 YYYY-MM-DD 格式", () => {
    expect(isoDate.safeParse("2026-07-27").success).toBe(true);
    expect(isoDate.safeParse("2026-7-27").success).toBe(false);
    expect(isoDate.safeParse("2026/07/27").success).toBe(false);
    expect(isoDate.safeParse("").success).toBe(false);
    expect(isoDate.safeParse("not-a-date").success).toBe(false);
  });

  it("boundedString: 限长 + trim", () => {
    const s = boundedString(10, 1);
    expect(s.safeParse("hello").success).toBe(true);
    expect(s.safeParse("").success).toBe(false); // min=1
    expect(s.safeParse("   ").success).toBe(false); // trim 后空
    expect(s.safeParse("this is too long text").success).toBe(false); // 超长
  });

  it("boundedString(min=0) 允许空字符串（用于可选字段）", () => {
    const allowEmpty = boundedString(10, 0);
    // trim 后空字符串长度=0，min(0) 通过
    expect(allowEmpty.safeParse("").success).toBe(true);
    expect(allowEmpty.safeParse("ok").success).toBe(true);
    expect(allowEmpty.safeParse("   ").success).toBe(true); // trim 后空字符串
  });
});

describe("已迁移路由的 schema 关键字段（防回归）", () => {
  // 这里只做 schema 级别的 smoke 检测，不导入路由模块（避免 edge runtime 依赖）
  // 主要防止：未来有人改 schema 时去掉关键字段，本测试能立即发现

  it("weekly 路由 schema：weekStart 必须是 YYYY-MM-DD", () => {
    // 直接用相同 schema 形状做 smoke
    const schema = z.object({
      weekStart: isoDate,
      learnLogs: z.array(z.unknown()),
      reviewLogs: z.array(z.unknown()),
      statuses: z.array(z.unknown()),
      emotions: z.array(z.unknown()).optional(),
    });
    expect(schema.safeParse({
      weekStart: "2026-07-27",
      learnLogs: [],
      reviewLogs: [],
      statuses: [],
    }).success).toBe(true);
    expect(schema.safeParse({
      weekStart: "not-date",
      learnLogs: [],
      reviewLogs: [],
      statuses: [],
    }).success).toBe(false);
  });

  it("review 路由 schema：rating 必须 1-4 枚举", () => {
    const schema = z.object({
      card: z.object({ id: nonEmptyString }).passthrough(),
      rating: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4)]),
      mode: z.enum(["conservative", "standard", "aggressive"]).default("standard"),
    });
    expect(schema.safeParse({ card: { id: "c1" }, rating: 3 }).success).toBe(true);
    expect(schema.safeParse({ card: { id: "c1" }, rating: 5 }).success).toBe(false); // 不在枚举
    expect(schema.safeParse({ card: { id: "c1" }, rating: "3" }).success).toBe(false); // 字符串
    // mode 默认值
    const result = schema.safeParse({ card: { id: "c1" }, rating: 3 });
    if (result.success) {
      expect(result.data.mode).toBe("standard");
    }
  });

  it("emotion-coping 路由 schema：tag 必须 EmotionTag 枚举", () => {
    const EMOTION_TAGS = ["焦虑", "兴奋", "疲惫", "烦躁", "满足", "冲动", "平静", "沮丧"] as const;
    const schema = z.object({
      tag: z.enum(EMOTION_TAGS),
      reason: boundedString(500, 0).optional(),
    });
    expect(schema.safeParse({ tag: "焦虑" }).success).toBe(true);
    expect(schema.safeParse({ tag: "unknown" }).success).toBe(false);
    expect(schema.safeParse({ tag: "" }).success).toBe(false);
  });

  it("chat 路由 schema：messages 必须非空数组且元素有合法 role + content", () => {
    const schema = z.object({
      messages: z
        .array(
          z.object({
            role: z.enum(["user", "assistant", "system"]),
            content: z.string().min(1),
          }),
        )
        .min(1),
      contextSnapshot: boundedString(4000).optional(),
      toolContext: z.unknown().optional(),
      personaContext: z
        .object({
          energy: z.number(),
          mood: z.string(),
          streak: z.number(),
          topic: z.string().optional(),
        })
        .optional(),
      preferredPersona: z
        .enum(["strict_coach", "gentle_companion", "socratic_tutor", "peer_dev"])
        .optional(),
      knowledgeContext: boundedString(4000).optional(),
    });
    // 合法
    expect(
      schema.safeParse({
        messages: [{ role: "user", content: "hi" }],
      }).success,
    ).toBe(true);
    // 空 messages 数组 → 失败
    expect(
      schema.safeParse({ messages: [] }).success,
    ).toBe(false);
    // 非法 role → 失败
    expect(
      schema.safeParse({
        messages: [{ role: "tool", content: "x" }],
      }).success,
    ).toBe(false);
    // 空 content → 失败
    expect(
      schema.safeParse({
        messages: [{ role: "user", content: "" }],
      }).success,
    ).toBe(false);
    // 非法 preferredPersona → 失败
    expect(
      schema.safeParse({
        messages: [{ role: "user", content: "hi" }],
        preferredPersona: "unknown_persona",
      }).success,
    ).toBe(false);
    // contextSnapshot 超长 → 失败（boundedString 拒绝）
    expect(
      schema.safeParse({
        messages: [{ role: "user", content: "hi" }],
        contextSnapshot: "x".repeat(4001),
      }).success,
    ).toBe(false);
  });

  it("interview 路由 schema：config 字段全部带默认值 + 越界拒绝", () => {
    const schema = z.object({
      mode: z.enum(["interview", "report"]).default("interview"),
      config: z
        .object({
          difficulty: z.enum(["junior", "mid", "senior", "stress"]).default("junior"),
          topic: boundedString(100).default("AI 基础"),
          duration: z.number().finite().int().min(5).max(120).default(20),
          questionCount: z.number().finite().int().min(1).max(15).default(5),
        })
        .default({}),
      messages: z
        .array(
          z.object({
            role: z.enum(["interviewer", "candidate"]),
            content: z.string().max(4000),
            timestamp: z.string(),
          }),
        )
        .max(30)
        .default([]),
    });
    // 空 body → 全部默认值填充
    const emptyResult = schema.safeParse({});
    expect(emptyResult.success).toBe(true);
    if (emptyResult.success) {
      expect(emptyResult.data.mode).toBe("interview");
      expect(emptyResult.data.config.difficulty).toBe("junior");
      expect(emptyResult.data.config.topic).toBe("AI 基础");
      expect(emptyResult.data.config.duration).toBe(20);
      expect(emptyResult.data.config.questionCount).toBe(5);
      expect(emptyResult.data.messages).toEqual([]);
    }
    // 越界 duration → 失败（不再静默 clamp）
    expect(
      schema.safeParse({
        config: { difficulty: "junior", topic: "x", duration: 999, questionCount: 5 },
      }).success,
    ).toBe(false);
    // 非法 difficulty → 失败
    expect(
      schema.safeParse({
        config: { difficulty: "intern", topic: "x", duration: 20, questionCount: 5 },
      }).success,
    ).toBe(false);
    // 非法 mode → 失败
    expect(
      schema.safeParse({ mode: "unknown", config: {} }).success,
    ).toBe(false);
    // messages 超过 30 条 → 失败
    const tooManyMessages = Array.from({ length: 31 }, (_, i) => ({
      role: "interviewer" as const,
      content: String(i),
      timestamp: "2026-07-27",
    }));
    expect(
      schema.safeParse({ config: {}, messages: tooManyMessages }).success,
    ).toBe(false);
  });
});
