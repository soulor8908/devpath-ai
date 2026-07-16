import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock AI SDK
vi.mock("ai", () => ({
  generateObject: vi.fn(),
}));

// Mock provider
vi.mock("../lib/ai/provider", () => ({
  createAIProvider: vi.fn(() => ({})),
}));

// Mock cloudflare-env：getCloudflareKV 返回内存 KV，验证缓存命中
const mockKVMap = new Map<string, string>();
vi.mock("../lib/ai/cloudflare-env", () => ({
  getCloudflareKV: () => ({
    get: async (key: string) => (mockKVMap.has(key) ? mockKVMap.get(key)! : null),
    put: async (key: string, value: string) => { mockKVMap.set(key, value); },
  }),
}));

// Mock observability 的 observeCall 让它直通（避免污染 console）
vi.mock("../lib/ai/observability", () => ({
  observeCall: (_tag: string, fn: () => Promise<unknown>) => fn(),
  wrapModelWithObservability: (model: unknown) => model,
}));

import { generateObject } from "ai";
import { decomposeKnowledge, _internal } from "../lib/ai/knowledge";
import { getFallbackTemplate, listTemplateTopics } from "../lib/ai/templates";

describe("knowledge", () => {
  beforeEach(() => {
    vi.mocked(generateObject).mockReset();
    mockKVMap.clear();
  });

  it("AI 返回 3 节点时正确解析", async () => {
    vi.mocked(generateObject).mockResolvedValueOnce({
      object: {
        topic: "测试主题",
        nodes: [
          { id: "k1", title: "节点1", difficulty: 1, prerequisites: [], frequency: "高", summary: "摘要1" },
          { id: "k2", title: "节点2", difficulty: 2, prerequisites: ["k1"], frequency: "中", summary: "摘要2" },
          { id: "k3", title: "节点3", difficulty: 3, prerequisites: ["k1"], frequency: "低", summary: "摘要3" },
        ],
      },
    } as any);

    const nodes = await decomposeKnowledge("测试主题");
    expect(nodes).toHaveLength(3);
    expect(nodes[0].id).toBe("k1");
    expect(nodes[0].mastery).toBe(0);
    expect(nodes[1].prerequisites).toEqual(["k1"]);
    expect(nodes[2].difficulty).toBe(3);
  });

  it("AI 抛错时降级到模板返回 8 节点", async () => {
    vi.mocked(generateObject).mockRejectedValue(new Error("AI 调用失败"));
    const nodes = await decomposeKnowledge("前端性能");
    expect(nodes).toHaveLength(8);
    expect(nodes[0].id).toBe("k1");
    expect(nodes[0].mastery).toBe(0);
  });

  it("AI 第一次失败、第二次成功时返回正确结果", async () => {
    vi.mocked(generateObject)
      .mockRejectedValueOnce(new Error("第一次失败"))
      .mockResolvedValueOnce({
        object: {
          topic: "React",
          nodes: [
            { id: "k1", title: "JSX", difficulty: 1, prerequisites: [], frequency: "高", summary: "JSX 基础" },
          ],
        },
      } as any);

    const nodes = await decomposeKnowledge("React");
    expect(nodes).toHaveLength(1);
    expect(nodes[0].title).toBe("JSX");
  });

  it("getFallbackTemplate 匹配前端性能", () => {
    const nodes = getFallbackTemplate("前端性能优化");
    expect(nodes).toHaveLength(8);
    expect(nodes[0].title).toContain("浏览器渲染");
  });

  it("getFallbackTemplate 未匹配时返回默认模板", () => {
    const nodes = getFallbackTemplate("完全不匹配的主题");
    expect(nodes.length).toBeGreaterThan(0);
  });

  it("listTemplateTopics 返回 5 个主题", () => {
    const topics = listTemplateTopics();
    expect(topics).toHaveLength(5);
    expect(topics).toContain("前端性能");
    expect(topics).toContain("React基础");
    expect(topics).toContain("TypeScript");
    expect(topics).toContain("算法基础");
    expect(topics).toContain("系统设计");
  });
});

describe("knowledge cache", () => {
  beforeEach(() => {
    vi.mocked(generateObject).mockReset();
    mockKVMap.clear();
  });

  it("hashString 返回稳定 16 进制值", () => {
    const h1 = _internal.hashString("React基础");
    const h2 = _internal.hashString("React基础");
    expect(h1).toBe(h2);
    // 不同 topic 应有不同 hash（绝大概率）
    const h3 = _internal.hashString("Vue基础");
    expect(h3).not.toBe(h1);
  });

  it("buildCacheKey 大小写与首尾空格无关", () => {
    expect(_internal.buildCacheKey("React基础")).toBe(_internal.buildCacheKey("  react基础 "));
  });

  it("userPrompt 不同时 cache key 不同", () => {
    expect(_internal.buildCacheKey("React", undefined)).not.toBe(
      _internal.buildCacheKey("React", "大厂视角")
    );
  });

  it("首次调用走 AI 并写入缓存", async () => {
    vi.mocked(generateObject).mockResolvedValueOnce({
      object: {
        topic: "React",
        nodes: [
          { id: "k1", title: "JSX", difficulty: 1, prerequisites: [], frequency: "高", summary: "JSX" },
        ],
      },
    } as any);

    const nodes = await decomposeKnowledge("React");
    expect(nodes).toHaveLength(1);
    expect(generateObject).toHaveBeenCalledTimes(1);
    // 缓存已写入
    expect(mockKVMap.size).toBe(1);
  });

  it("第二次调用相同 topic 命中缓存，不再调 AI", async () => {
    vi.mocked(generateObject).mockResolvedValueOnce({
      object: {
        topic: "React",
        nodes: [
          { id: "k1", title: "JSX", difficulty: 1, prerequisites: [], frequency: "高", summary: "JSX" },
        ],
      },
    } as any);

    await decomposeKnowledge("React");
    await decomposeKnowledge("React"); // 应命中缓存

    expect(generateObject).toHaveBeenCalledTimes(1);
  });

  it("skipCache=true 强制走 AI", async () => {
    vi.mocked(generateObject)
      .mockResolvedValueOnce({
        object: { topic: "React", nodes: [{ id: "k1", title: "v1", difficulty: 1, prerequisites: [], frequency: "高", summary: "" }] },
      } as any)
      .mockResolvedValueOnce({
        object: { topic: "React", nodes: [{ id: "k1", title: "v2", difficulty: 1, prerequisites: [], frequency: "高", summary: "" }] },
      } as any);

    const first = await decomposeKnowledge("React");
    const second = await decomposeKnowledge("React", undefined, { skipCache: true });

    expect(first[0].title).toBe("v1");
    expect(second[0].title).toBe("v2");
    expect(generateObject).toHaveBeenCalledTimes(2);
  });

  it("缓存 TTL 过期后重新调 AI", async () => {
    vi.mocked(generateObject)
      .mockResolvedValueOnce({
        object: { topic: "React", nodes: [{ id: "k1", title: "old", difficulty: 1, prerequisites: [], frequency: "高", summary: "" }] },
      } as any)
      .mockResolvedValueOnce({
        object: { topic: "React", nodes: [{ id: "k1", title: "new", difficulty: 1, prerequisites: [], frequency: "高", summary: "" }] },
      } as any);

    await decomposeKnowledge("React");

    // 把缓存写入时间回拨到 8 天前
    const cacheKey = _internal.buildCacheKey("React");
    const cached = JSON.parse(mockKVMap.get(cacheKey)!);
    cached.createdAt = new Date(Date.now() - _internal.CACHE_TTL_MS - 86400000).toISOString();
    mockKVMap.set(cacheKey, JSON.stringify(cached));

    const result = await decomposeKnowledge("React");
    expect(result[0].title).toBe("new");
    expect(generateObject).toHaveBeenCalledTimes(2);
  });
});
