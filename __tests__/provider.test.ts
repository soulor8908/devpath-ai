import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

describe("provider", () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    process.env = { ...originalEnv };
    delete process.env.AI_PROVIDER;
    delete process.env.AI_API_KEY;
    delete process.env.AI_API_URL;
    delete process.env.AI_MODEL;
    delete process.env.GLM_API_KEY;
    delete process.env.DEEPSEEK_API_KEY;
    delete process.env.MIMO_API_KEY;
  });

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  it("默认使用 GLM provider", async () => {
    process.env.GLM_API_KEY = "test-glm-key";
    const { getProviderInfo } = await import("../lib/ai/provider");
    const info = getProviderInfo();
    expect(info.provider).toBe("glm");
    expect(info.model).toBe("glm-4-flash");
    expect(info.baseURL).toBe("https://open.bigmodel.cn/api/paas/v4");
  });

  it("DeepSeek provider 配置正确", async () => {
    process.env.AI_PROVIDER = "deepseek";
    process.env.DEEPSEEK_API_KEY = "test-ds-key";
    const { getProviderInfo } = await import("../lib/ai/provider");
    const info = getProviderInfo();
    expect(info.provider).toBe("deepseek");
    expect(info.model).toBe("deepseek-chat");
    expect(info.baseURL).toBe("https://api.deepseek.com/v1");
  });

  it("MiMo provider 配置正确", async () => {
    process.env.AI_PROVIDER = "mimo";
    process.env.MIMO_API_KEY = "test-mimo-key";
    const { getProviderInfo } = await import("../lib/ai/provider");
    const info = getProviderInfo();
    expect(info.provider).toBe("mimo");
    expect(info.model).toBe("mimo-v2-pro");
    expect(info.baseURL).toBe("https://api.xiaomimimo.com/v1");
  });

  it("通用 AI_API_URL/AI_MODEL 优先级最高", async () => {
    process.env.AI_PROVIDER = "glm";
    process.env.GLM_API_KEY = "test-key";
    process.env.AI_API_URL = "https://custom.api.com/v1";
    process.env.AI_MODEL = "custom-model";
    const { getProviderInfo } = await import("../lib/ai/provider");
    const info = getProviderInfo();
    expect(info.baseURL).toBe("https://custom.api.com/v1");
    expect(info.model).toBe("custom-model");
  });

  it("无 API Key 时抛错", async () => {
    process.env.AI_PROVIDER = "glm";
    const { createAIProvider } = await import("../lib/ai/provider");
    expect(() => createAIProvider()).toThrow(/AI API Key/);
  });

  it("createAIProvider 返回有 doGenerate 方法的 model 对象", async () => {
    process.env.AI_PROVIDER = "glm";
    process.env.GLM_API_KEY = "test-key";
    const { createAIProvider } = await import("../lib/ai/provider");
    const model = createAIProvider();
    expect(model).toBeDefined();
    expect(typeof model.doGenerate).toBe("function");
  });
});
