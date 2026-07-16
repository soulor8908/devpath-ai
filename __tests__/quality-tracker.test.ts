import { describe, it, expect, beforeEach, vi } from "vitest";
import "fake-indexeddb/auto";
import { setItem, getItem, listKeys } from "../lib/storage/db";
import { KEY_PREFIXES, type AICallRecord, type AIFeedback } from "../lib/types";
import { PROMPTS } from "../lib/ai/prompts";

// 在 fake-indexeddb 环境下，isBrowser 检测需要 window 存在
// fake-indexeddb/auto 会设置 indexedDB，但不会设置 window
// quality-tracker 检查 typeof window !== "undefined"
// jsdom 环境下 window 已存在，所以应该能正常工作

import {
  recordAICall,
  trackAIFeedback,
  getQualityReport,
  listAICalls,
  listAIFeedbacks,
  makeInputDigest,
  makeOutputDigest,
  startTimer,
  generateCallId,
  pruneOldRecords,
  estimateCost,
  normalizeModelId,
  parseUsageFromFinishMessage,
  MODEL_PRICING,
} from "../lib/ai/quality-tracker";

// 清理 IndexedDB
beforeEach(async () => {
  // 删除所有 ai_call:* 和 ai_feedback:* 记录
  const callKeys = await listKeys(KEY_PREFIXES.AI_CALL);
  const fbKeys = await listKeys(KEY_PREFIXES.AI_FEEDBACK);
  for (const k of [...callKeys, ...fbKeys]) {
    const { delItem } = await import("../lib/storage/db");
    await delItem(k);
  }
});

describe("makeInputDigest", () => {
  it("对象输入返回 8 位 hex 哈希", () => {
    const d = makeInputDigest({ topic: "React Fiber" });
    expect(d).toMatch(/^[0-9a-f]{8}$/);
  });

  it("字符串输入返回 8 位 hex 哈希", () => {
    const d = makeInputDigest("some text input");
    expect(d).toMatch(/^[0-9a-f]{8}$/);
  });

  it("相同输入产生相同摘要", () => {
    const d1 = makeInputDigest({ a: 1, b: 2 });
    const d2 = makeInputDigest({ a: 1, b: 2 });
    expect(d1).toBe(d2);
  });

  it("不同输入产生不同摘要", () => {
    const d1 = makeInputDigest({ topic: "A" });
    const d2 = makeInputDigest({ topic: "B" });
    expect(d1).not.toBe(d2);
  });

  it("null/空输入返回 'empty'", () => {
    expect(makeInputDigest(null)).toBe("empty");
    expect(makeInputDigest("")).toBe("empty");
    expect(makeInputDigest(undefined)).toBe("empty");
  });
});

describe("makeOutputDigest", () => {
  it("字符串输出：fields:0|前100字", () => {
    const d = makeOutputDigest("这是一段 AI 生成的回复内容");
    expect(d).toBe("fields:0|这是一段 AI 生成的回复内容");
  });

  it("长字符串截断到 100 字", () => {
    const long = "a".repeat(200);
    const d = makeOutputDigest(long);
    expect(d.length).toBeLessThan(120);
    expect(d.endsWith("a".repeat(100))).toBe(true);
  });

  it("对象输出：fields:N|内容预览", () => {
    const d = makeOutputDigest({ question: "Q1", answer: "A1", keyPoints: [] });
    expect(d).toMatch(/^fields:\d+\|/);
  });

  it("对象输出提取 answer 字段作为预览", () => {
    const d = makeOutputDigest({ answer: "这是答案" });
    expect(d).toContain("这是答案");
  });

  it("对象输出无 answer 时回退到 question", () => {
    const d = makeOutputDigest({ question: "这是问题" });
    expect(d).toContain("这是问题");
  });

  it("对象输出无常见字段时回退到 JSON", () => {
    const d = makeOutputDigest({ foo: "bar", baz: 42 });
    expect(d).toMatch(/^fields:2\|/);
  });

  it("null 输出返回 fields:0|", () => {
    expect(makeOutputDigest(null)).toBe("fields:0|");
  });
});

describe("startTimer", () => {
  it("返回 stop 函数，调用后返回数字", () => {
    const stop = startTimer();
    const ms = stop();
    expect(typeof ms).toBe("number");
    expect(ms).toBeGreaterThanOrEqual(0);
  });

  it("测量经过的时间", async () => {
    const stop = startTimer();
    await new Promise((r) => setTimeout(r, 10));
    const ms = stop();
    expect(ms).toBeGreaterThanOrEqual(8);
  });
});

describe("generateCallId", () => {
  it("返回非空字符串", () => {
    const id = generateCallId();
    expect(typeof id).toBe("string");
    expect(id.length).toBeGreaterThan(0);
  });

  it("多次调用产生不同 ID", () => {
    const ids = new Set<string>();
    for (let i = 0; i < 100; i++) {
      ids.add(generateCallId());
    }
    expect(ids.size).toBe(100);
  });
});

describe("recordAICall", () => {
  it("写入 IndexedDB 并返回 callId", async () => {
    const id = await recordAICall({
      scene: "question_generate",
      promptId: "question_generate",
      inputDigest: "abc12345",
      outputDigest: "fields:3|test",
      schemaValid: true,
      durationMs: 1500,
      source: "ai",
      refId: "q-1",
    });

    expect(typeof id).toBe("string");
    const stored = await getItem<AICallRecord>(`${KEY_PREFIXES.AI_CALL}${id}`);
    expect(stored).toBeDefined();
    expect(stored?.scene).toBe("question_generate");
    expect(stored?.durationMs).toBe(1500);
    expect(stored?.source).toBe("ai");
    expect(stored?.refId).toBe("q-1");
    expect(stored?.promptVersion).toMatch(new RegExp(`^question_generate:${PROMPTS.question_generate.version}:[0-9a-f]+$`));
    expect(stored?.createdAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  });

  it("使用传入的 callId", async () => {
    const customId = "my-custom-id";
    const id = await recordAICall({
      callId: customId,
      scene: "chat",
      promptId: "chat",
      inputDigest: "def67890",
      outputDigest: "fields:0|hello",
      schemaValid: true,
      durationMs: 500,
      source: "ai",
    });
    expect(id).toBe(customId);
  });

  it("source 可以是 rule / fallback", async () => {
    const id = await recordAICall({
      scene: "daily_nudge",
      promptId: "daily_nudge",
      inputDigest: "ghi13579",
      outputDigest: "fields:0|nudge",
      schemaValid: true,
      durationMs: 100,
      source: "rule",
    });
    const stored = await getItem<AICallRecord>(`${KEY_PREFIXES.AI_CALL}${id}`);
    expect(stored?.source).toBe("rule");
  });
});

describe("trackAIFeedback", () => {
  it("写入 IndexedDB", async () => {
    await trackAIFeedback({
      callRecordId: "call-1",
      scene: "question_generate",
      action: "regenerated",
    });

    const feedbacks = await listAIFeedbacks();
    expect(feedbacks.length).toBe(1);
    expect(feedbacks[0].callRecordId).toBe("call-1");
    expect(feedbacks[0].action).toBe("regenerated");
    expect(feedbacks[0].rating).toBeUndefined();
  });

  it("支持 rating + reason", async () => {
    await trackAIFeedback({
      callRecordId: "call-2",
      scene: "daily_nudge",
      rating: 1,
      reason: "不相关",
    });

    const feedbacks = await listAIFeedbacks();
    const fb = feedbacks.find((f) => f.callRecordId === "call-2");
    expect(fb?.rating).toBe(1);
    expect(fb?.reason).toBe("不相关");
  });

  it("支持 implicitAction", async () => {
    await trackAIFeedback({
      callRecordId: "call-3",
      scene: "question_generate",
      implicitAction: "expanded",
    });

    const feedbacks = await listAIFeedbacks();
    const fb = feedbacks.find((f) => f.callRecordId === "call-3");
    expect(fb?.implicitAction).toBe("expanded");
  });

  it("无 callRecordId 时静默跳过", async () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    await trackAIFeedback({
      callRecordId: "",
      scene: "chat",
      rating: 1,
    });
    expect(warnSpy).toHaveBeenCalled();
    warnSpy.mockRestore();
  });
});

describe("getQualityReport", () => {
  it("空数据返回零值报告", async () => {
    const report = await getQualityReport();
    expect(report.totalCalls).toBe(0);
    expect(report.totalFeedback).toBe(0);
    expect(report.scenes.length).toBe(0);
    expect(report.promptVersions.length).toBe(0);
    expect(report.failureClusters.length).toBe(0);
    expect(report.period.from).toBeNull();
    expect(report.period.to).toBeNull();
  });

  it("按场景聚合调用数和耗时", async () => {
    // 写入 3 条 question_generate + 2 条 daily_nudge
    for (let i = 0; i < 3; i++) {
      await recordAICall({
        scene: "question_generate",
        promptId: "question_generate",
        inputDigest: `q-input-${i}`,
        outputDigest: "fields:3|q",
        schemaValid: true,
        durationMs: 1000 + i * 500,
        source: "ai",
      });
    }
    for (let i = 0; i < 2; i++) {
      await recordAICall({
        scene: "daily_nudge",
        promptId: "daily_nudge",
        inputDigest: `n-input-${i}`,
        outputDigest: "fields:0|nudge",
        schemaValid: true,
        durationMs: 500,
        source: "ai",
      });
    }

    const report = await getQualityReport();
    expect(report.totalCalls).toBe(5);
    expect(report.scenes.length).toBe(2);

    const qScene = report.scenes.find((s) => s.scene === "question_generate");
    expect(qScene?.calls).toBe(3);
    expect(qScene?.avgDurationMs).toBe(1500); // (1000+1500+2000)/3 = 1500

    const nScene = report.scenes.find((s) => s.scene === "daily_nudge");
    expect(nScene?.calls).toBe(2);
    expect(nScene?.avgDurationMs).toBe(500);
  });

  it("聚合评分和采纳率", async () => {
    const callId1 = await recordAICall({
      scene: "chat",
      promptId: "chat",
      inputDigest: "c1",
      outputDigest: "fields:0|a",
      schemaValid: true,
      durationMs: 100,
      source: "ai",
    });
    const callId2 = await recordAICall({
      scene: "chat",
      promptId: "chat",
      inputDigest: "c2",
      outputDigest: "fields:0|b",
      schemaValid: true,
      durationMs: 200,
      source: "ai",
    });

    // callId1: rating 4 + adopted
    await trackAIFeedback({ callRecordId: callId1, scene: "chat", rating: 4, action: "adopted" });
    // callId2: rating 2 + discarded
    await trackAIFeedback({ callRecordId: callId2, scene: "chat", rating: 2, action: "discarded" });

    const report = await getQualityReport();
    const chatScene = report.scenes.find((s) => s.scene === "chat");
    expect(chatScene?.calls).toBe(2);
    expect(chatScene?.avgRating).toBe(3); // (4+2)/2
    expect(chatScene?.adoptionRate).toBe(50); // 1 adopted / (1+1) = 50%
  });

  it("再生成率 = regenerated / calls", async () => {
    const c1 = await recordAICall({
      scene: "question_generate", promptId: "question_generate",
      inputDigest: "r1", outputDigest: "fields:0|q", schemaValid: true, durationMs: 100, source: "ai",
    });
    const c2 = await recordAICall({
      scene: "question_generate", promptId: "question_generate",
      inputDigest: "r2", outputDigest: "fields:0|q", schemaValid: true, durationMs: 100, source: "ai",
    });
    await recordAICall({
      scene: "question_generate", promptId: "question_generate",
      inputDigest: "r3", outputDigest: "fields:0|q", schemaValid: true, durationMs: 100, source: "ai",
    });
    // c1 被再生成
    await trackAIFeedback({ callRecordId: c1, scene: "question_generate", action: "regenerated" });

    const report = await getQualityReport();
    const qScene = report.scenes.find((s) => s.scene === "question_generate");
    expect(qScene?.calls).toBe(3);
    expect(qScene?.regenerationRate).toBeCloseTo(33.3, 1); // 1/3 ≈ 33.3%
  });

  it("按 prompt 版本聚合", async () => {
    await recordAICall({
      scene: "knowledge_decompose", promptId: "knowledge_decompose",
      inputDigest: "k1", outputDigest: "fields:5|k", schemaValid: true, durationMs: 2000, source: "ai",
    });
    await recordAICall({
      scene: "knowledge_decompose", promptId: "knowledge_decompose",
      inputDigest: "k2", outputDigest: "fields:5|k", schemaValid: true, durationMs: 3000, source: "ai",
    });

    const report = await getQualityReport();
    expect(report.promptVersions.length).toBe(1);
    expect(report.promptVersions[0].promptVersion).toMatch(new RegExp(`^knowledge_decompose:${PROMPTS.knowledge_decompose.version}:[0-9a-f]+$`));
    expect(report.promptVersions[0].calls).toBe(2);
  });

  it("失败模式聚类：高再生成率的输入", async () => {
    // 同一 inputDigest 调用 3 次，其中 2 次被再生成 → 66.7% 再生成率
    const ids: string[] = [];
    for (let i = 0; i < 3; i++) {
      const id = await recordAICall({
        scene: "question_generate", promptId: "question_generate",
        inputDigest: "failing-input", outputDigest: "fields:0|q",
        schemaValid: true, durationMs: 100, source: "ai",
        refId: "node-fail",
      });
      ids.push(id);
    }
    await trackAIFeedback({ callRecordId: ids[0], scene: "question_generate", action: "regenerated" });
    await trackAIFeedback({ callRecordId: ids[1], scene: "question_generate", action: "regenerated" });

    const report = await getQualityReport();
    expect(report.failureClusters.length).toBeGreaterThan(0);
    const cluster = report.failureClusters[0];
    expect(cluster.count).toBe(3);
    expect(cluster.regenerationRate).toBeCloseTo(66.7, 1);
  });

  it("since 时间过滤", async () => {
    // 写入一条旧记录（手动设置 createdAt）
    const oldRecord: AICallRecord = {
      id: "old-call",
      scene: "chat",
      promptVersion: "chat:v1:abc",
      inputDigest: "old",
      outputDigest: "fields:0|old",
      schemaValid: true,
      durationMs: 100,
      source: "ai",
      createdAt: "2020-01-01T00:00:00.000Z",
    };
    await setItem(`${KEY_PREFIXES.AI_CALL}old-call`, oldRecord);

    // 写入一条新记录
    await recordAICall({
      scene: "chat", promptId: "chat",
      inputDigest: "new", outputDigest: "fields:0|new",
      schemaValid: true, durationMs: 100, source: "ai",
    });

    // 过滤到近 7 天：应只剩新记录
    const since7d = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const report = await getQualityReport(since7d);
    expect(report.totalCalls).toBe(1);

    // 不过滤：应有 2 条
    const allReport = await getQualityReport();
    expect(allReport.totalCalls).toBe(2);
  });
});

describe("pruneOldRecords", () => {
  it("清理超过 maxAgeDays 的记录", async () => {
    // 写入旧记录
    const oldCall: AICallRecord = {
      id: "prune-me",
      scene: "chat",
      promptVersion: "chat:v1:abc",
      inputDigest: "x",
      outputDigest: "fields:0|x",
      schemaValid: true,
      durationMs: 100,
      source: "ai",
      createdAt: "2020-01-01T00:00:00.000Z",
    };
    await setItem(`${KEY_PREFIXES.AI_CALL}prune-me`, oldCall);

    const oldFeedback: AIFeedback = {
      id: "prune-fb",
      callRecordId: "prune-me",
      scene: "chat",
      rating: 1,
      createdAt: "2020-01-01T00:00:00.000Z",
    };
    await setItem(`${KEY_PREFIXES.AI_FEEDBACK}prune-fb`, oldFeedback);

    // 清理 90 天前的记录
    const deleted = await pruneOldRecords(90);
    expect(deleted).toBe(2);

    // 确认已删除
    const remainingCalls = await listAICalls();
    expect(remainingCalls.find((c) => c.id === "prune-me")).toBeUndefined();
  });

  it("保留近期记录", async () => {
    await recordAICall({
      scene: "chat", promptId: "chat",
      inputDigest: "recent", outputDigest: "fields:0|recent",
      schemaValid: true, durationMs: 100, source: "ai",
    });

    const before = await listAICalls();
    const deleted = await pruneOldRecords(90);
    expect(deleted).toBe(0);
    const after = await listAICalls();
    expect(after.length).toBe(before.length);
  });
});

// ============ 成本估算 ============

describe("normalizeModelId", () => {
  it("去掉 provider 前缀", () => {
    expect(normalizeModelId("openai/gpt-4o")).toBe("gpt-4o");
    expect(normalizeModelId("custom/glm-4-flash")).toBe("glm-4-flash");
  });

  it("小写化", () => {
    expect(normalizeModelId("GLM-4-Flash")).toBe("glm-4-flash");
    expect(normalizeModelId("DeepSeek-Chat")).toBe("deepseek-chat");
  });

  it("空字符串返回空", () => {
    expect(normalizeModelId("")).toBe("");
  });

  it("无前缀的模型名保持不变（仅小写）", () => {
    expect(normalizeModelId("glm-4-flash")).toBe("glm-4-flash");
  });
});

describe("estimateCost", () => {
  it("GLM-4-Flash 已知价格", () => {
    // glm-4-flash: $0.1/1M input + $0.1/1M output
    const cost = estimateCost("glm-4-flash", { prompt: 1000, completion: 500, total: 1500 });
    // 1000/1M * 0.1 + 500/1M * 0.1 = 0.0001 + 0.00005 = 0.00015
    expect(cost).toBe(0.00015);
  });

  it("DeepSeek-Chat 输入输出差异定价", () => {
    // deepseek-chat: $0.14/1M input + $0.28/1M output
    const cost = estimateCost("deepseek-chat", { prompt: 1_000_000, completion: 0, total: 1_000_000 });
    expect(cost).toBe(0.14);
    const cost2 = estimateCost("deepseek-chat", { prompt: 0, completion: 1_000_000, total: 1_000_000 });
    expect(cost2).toBe(0.28);
  });

  it("未知模型走 DEFAULT_PRICING", () => {
    // DEFAULT_PRICING = { input: 0.5, output: 0.5 }
    const cost = estimateCost("unknown-model-xyz", { prompt: 1_000_000, completion: 0, total: 1_000_000 });
    expect(cost).toBe(0.5);
  });

  it("大小写不敏感（通过 normalizeModelId）", () => {
    const c1 = estimateCost("GLM-4-FLASH", { prompt: 1000, completion: 0, total: 1000 });
    const c2 = estimateCost("glm-4-flash", { prompt: 1000, completion: 0, total: 1000 });
    expect(c1).toBe(c2);
  });

  it("去掉 provider 前缀后匹配", () => {
    const c1 = estimateCost("openai/gpt-4o-mini", { prompt: 1_000_000, completion: 0, total: 1_000_000 });
    // gpt-4o-mini: $0.15/1M input
    expect(c1).toBe(0.15);
  });

  it("0 token 返回 0 成本", () => {
    expect(estimateCost("glm-4-flash", { prompt: 0, completion: 0, total: 0 })).toBe(0);
  });

  it("保留 6 位小数精度", () => {
    // 100 tokens * $0.1/1M = 0.00001
    const cost = estimateCost("glm-4-flash", { prompt: 50, completion: 50, total: 100 });
    expect(cost).toBe(0.00001);
  });

  it("MODEL_PRICING 包含主流模型", () => {
    expect(MODEL_PRICING["glm-4-flash"]).toBeDefined();
    expect(MODEL_PRICING["deepseek-chat"]).toBeDefined();
    expect(MODEL_PRICING["deepseek-reasoner"]).toBeDefined();
    // input/output 价格不同
    expect(MODEL_PRICING["deepseek-chat"].output).toBeGreaterThan(MODEL_PRICING["deepseek-chat"].input);
  });
});

describe("parseUsageFromFinishMessage", () => {
  it("解析标准 finish 消息", () => {
    const payload = JSON.stringify({
      finishReason: "stop",
      usage: { promptTokens: 50, completionTokens: 100, totalTokens: 150 },
    });
    const usage = parseUsageFromFinishMessage(payload);
    expect(usage).toEqual({ prompt: 50, completion: 100, total: 150 });
  });

  it("无 usage 字段返回 null", () => {
    const payload = JSON.stringify({ finishReason: "stop" });
    expect(parseUsageFromFinishMessage(payload)).toBeNull();
  });

  it("缺 totalTokens 时自动求和", () => {
    const payload = JSON.stringify({
      finishReason: "stop",
      usage: { promptTokens: 30, completionTokens: 70 },
    });
    const usage = parseUsageFromFinishMessage(payload);
    expect(usage).toEqual({ prompt: 30, completion: 70, total: 100 });
  });

  it("0 tokens 返回 null（避免噪声）", () => {
    const payload = JSON.stringify({
      finishReason: "stop",
      usage: { promptTokens: 0, completionTokens: 0, totalTokens: 0 },
    });
    expect(parseUsageFromFinishMessage(payload)).toBeNull();
  });

  it("非法 JSON 返回 null", () => {
    expect(parseUsageFromFinishMessage("not json{")).toBeNull();
  });

  it("空字符串返回 null", () => {
    expect(parseUsageFromFinishMessage("")).toBeNull();
  });
});

describe("recordAICall with tokenUsage + modelId", () => {
  it("持久化 tokenUsage + modelId + estimatedCost", async () => {
    const id = await recordAICall({
      scene: "chat", promptId: "chat",
      inputDigest: "test", outputDigest: "fields:0|test",
      schemaValid: true, durationMs: 500, source: "ai",
      tokenUsage: { prompt: 1000, completion: 500, total: 1500 },
      modelId: "glm-4-flash",
    });

    const calls = await listAICalls();
    const record = calls.find((c) => c.id === id);
    expect(record).toBeDefined();
    expect(record?.tokenUsage).toEqual({ prompt: 1000, completion: 500, total: 1500 });
    expect(record?.modelId).toBe("glm-4-flash");
    // 自动计算 estimatedCost
    expect(record?.estimatedCost).toBe(0.00015);
  });

  it("无 tokenUsage 时不设置 estimatedCost", async () => {
    const id = await recordAICall({
      scene: "chat", promptId: "chat",
      inputDigest: "no-usage", outputDigest: "fields:0|no-usage",
      schemaValid: true, durationMs: 500, source: "ai",
    });

    const calls = await listAICalls();
    const record = calls.find((c) => c.id === id);
    expect(record?.tokenUsage).toBeUndefined();
    expect(record?.estimatedCost).toBeUndefined();
    expect(record?.modelId).toBeUndefined();
  });

  it("显式 estimatedCost 覆盖自动计算", async () => {
    const id = await recordAICall({
      scene: "chat", promptId: "chat",
      inputDigest: "explicit", outputDigest: "fields:0|explicit",
      schemaValid: true, durationMs: 500, source: "ai",
      tokenUsage: { prompt: 1000, completion: 500, total: 1500 },
      modelId: "glm-4-flash",
      estimatedCost: 0.999, // 显式覆盖
    });

    const calls = await listAICalls();
    const record = calls.find((c) => c.id === id);
    expect(record?.estimatedCost).toBe(0.999);
  });
});

describe("getQualityReport with cost aggregation", () => {
  it("场景级别聚合 token + 成本", async () => {
    // chat 场景 2 次调用，都有 usage
    await recordAICall({
      scene: "chat", promptId: "chat",
      inputDigest: "c1", outputDigest: "fields:0|c1",
      schemaValid: true, durationMs: 500, source: "ai",
      tokenUsage: { prompt: 1000, completion: 500, total: 1500 },
      modelId: "glm-4-flash",
    });
    await recordAICall({
      scene: "chat", promptId: "chat",
      inputDigest: "c2", outputDigest: "fields:0|c2",
      schemaValid: true, durationMs: 500, source: "ai",
      tokenUsage: { prompt: 2000, completion: 1000, total: 3000 },
      modelId: "glm-4-flash",
    });

    const report = await getQualityReport();
    const chatScene = report.scenes.find((s) => s.scene === "chat");
    expect(chatScene).toBeDefined();
    expect(chatScene?.totalTokens).toBe(4500); // 1500 + 3000
    expect(chatScene?.totalCost).toBe(0.00045); // 0.00015 + 0.0003
    expect(chatScene?.avgCostPerCall).toBeCloseTo(0.000225, 6);
  });

  it("全局聚合 token + 成本", async () => {
    await recordAICall({
      scene: "chat", promptId: "chat",
      inputDigest: "g1", outputDigest: "fields:0|g1",
      schemaValid: true, durationMs: 500, source: "ai",
      tokenUsage: { prompt: 1000, completion: 0, total: 1000 },
      modelId: "glm-4-flash", // 0.0001
    });
    await recordAICall({
      scene: "question_generate", promptId: "question_generate",
      inputDigest: "g2", outputDigest: "fields:0|g2",
      schemaValid: true, durationMs: 500, source: "ai",
      tokenUsage: { prompt: 2000, completion: 0, total: 2000 },
      modelId: "glm-4-flash", // 0.0002
    });

    const report = await getQualityReport();
    expect(report.totalTokens).toBe(3000);
    expect(report.totalCost).toBe(0.0003);
  });

  it("无 usage 的调用不影响 token/cost 聚合", async () => {
    await recordAICall({
      scene: "chat", promptId: "chat",
      inputDigest: "no-usage", outputDigest: "fields:0|no-usage",
      schemaValid: true, durationMs: 500, source: "ai",
      // 不传 tokenUsage / modelId
    });
    await recordAICall({
      scene: "chat", promptId: "chat",
      inputDigest: "with-usage", outputDigest: "fields:0|with-usage",
      schemaValid: true, durationMs: 500, source: "ai",
      tokenUsage: { prompt: 1000, completion: 0, total: 1000 },
      modelId: "glm-4-flash",
    });

    const report = await getQualityReport();
    expect(report.totalCalls).toBe(2);
    expect(report.totalTokens).toBe(1000); // 只算有 usage 的
    expect(report.totalCost).toBe(0.0001);
  });
});
