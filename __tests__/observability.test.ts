import { describe, it, expect, vi, beforeEach, type MockInstance } from "vitest";
import type { LanguageModel } from "ai";
import {
  wrapModelWithObservability,
  observeCall,
  getRecentMetrics,
} from "../lib/ai/observability";

// 控制台日志 spy，用于断言 observability 输出
let logSpy: MockInstance;
let warnSpy: MockInstance;

beforeEach(() => {
  logSpy = vi.spyOn(console, "log").mockImplementation(() => {});
  warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
});

describe("observability", () => {
  it("observeCall 成功时记录 ok 指标", async () => {
    const result = await observeCall("test:ok", async () => 42);
    expect(result).toBe(42);
    expect(logSpy).toHaveBeenCalledWith(
      expect.stringMatching(/\[ai:observe\] test:ok ok in \d+ms/)
    );
  });

  it("observeCall 失败时记录 FAIL 指标并重抛", async () => {
    const err = new Error("boom");
    await expect(observeCall("test:fail", async () => { throw err; })).rejects.toThrow("boom");
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringMatching(/\[ai:observe\] test:fail FAIL in \d+ms: boom/)
    );
  });

  it("wrapModelWithObservability 包装 doGenerate 并记录指标", async () => {
    const fakeModel: LanguageModel = {
      specificationVersion: "v1",
      provider: "test",
      modelId: "test-model",
      doGenerate: vi.fn(async () => ({ raw: { foo: "bar" } } as never)),
    } as unknown as LanguageModel;

    const wrapped = wrapModelWithObservability(fakeModel, "chat:test");
    await wrapped.doGenerate({} as Parameters<LanguageModel["doGenerate"]>[0]);

    expect(fakeModel.doGenerate).toHaveBeenCalled();
    expect(logSpy).toHaveBeenCalledWith(
      expect.stringMatching(/\[ai:observe\] chat:test ok in \d+ms/)
    );
  });

  it("wrapModelWithObservability 包装 doStream 并记录指标", async () => {
    const fakeModel: LanguageModel = {
      specificationVersion: "v1",
      provider: "test",
      modelId: "test-model",
      doStream: vi.fn(async () => ({ stream: (async function* () {})() } as never)),
    } as unknown as LanguageModel;

    const wrapped = wrapModelWithObservability(fakeModel, "chat:stream");
    await wrapped.doStream({} as Parameters<LanguageModel["doStream"]>[0]);

    expect(fakeModel.doStream).toHaveBeenCalled();
    expect(logSpy).toHaveBeenCalledWith(
      expect.stringMatching(/\[ai:observe\] chat:stream ok in \d+ms/)
    );
  });

  it("wrapModelWithObservability 失败时不吞错并记录 FAIL", async () => {
    const fakeModel: LanguageModel = {
      specificationVersion: "v1",
      provider: "test",
      modelId: "test-model",
      doGenerate: vi.fn(async () => { throw new Error("network down"); }),
    } as unknown as LanguageModel;

    const wrapped = wrapModelWithObservability(fakeModel, "chat:err");
    await expect(
      wrapped.doGenerate({} as Parameters<LanguageModel["doGenerate"]>[0])
    ).rejects.toThrow("network down");

    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringMatching(/\[ai:observe\] chat:err FAIL in \d+ms: network down/)
    );
  });

  it("getRecentMetrics 返回最近指标", async () => {
    await observeCall("metrics:test", async () => "ok");
    const metrics = getRecentMetrics(10);
    expect(metrics.length).toBeGreaterThan(0);
    const last = metrics[metrics.length - 1];
    expect(last.tag).toBe("metrics:test");
    expect(last.ok).toBe(true);
  });

  it("wrapModelWithObservability 不破坏原始 model 的其他属性", () => {
    const fakeModel: LanguageModel = {
      specificationVersion: "v1",
      provider: "test",
      modelId: "test-model",
      doGenerate: vi.fn(),
    } as unknown as LanguageModel;

    const wrapped = wrapModelWithObservability(fakeModel, "chat:identity");
    // 包装后应保留 provider / modelId
    expect(wrapped.provider).toBe("test");
    expect(wrapped.modelId).toBe("test-model");
    expect(wrapped.specificationVersion).toBe("v1");
  });
});
