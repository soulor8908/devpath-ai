// __tests__/knowledge-vector-search.test.ts
// 知识检索单元测试：启发式判定 / 余弦相似度 / 向量检索 / 关键词降级 / retrieveKnowledge 降级
// 守护设计文档 docs/superpowers/specs/2026-07-22-knowledge-vector-search-design.md 第 13.1 节

import { describe, it, expect, vi, beforeEach } from "vitest";

// mock 依赖（必须在 import search 之前用 vi.mock）
const { loadKnowledgeIndexMock } = vi.hoisted(() => ({
  loadKnowledgeIndexMock: vi.fn(),
}));
const { apiFetchMock } = vi.hoisted(() => ({
  apiFetchMock: vi.fn(),
}));

vi.mock("@/lib/knowledge/index-store", () => ({
  loadKnowledgeIndex: loadKnowledgeIndexMock,
  getCachedIndex: vi.fn().mockReturnValue(null),
  clearCachedIndex: vi.fn(),
}));

vi.mock("@/lib/api-client", () => ({
  apiFetch: apiFetchMock,
}));

import {
  shouldRetrieveKnowledge,
  cosineSimilarity,
  vectorSearch,
  keywordSearch,
  retrieveKnowledge,
} from "@/lib/knowledge/search";
import type { KnowledgeIndexManifest } from "@/lib/types";

/** 构造测试用索引（3 条，2 维向量便于人工验证） */
function makeTestIndex(): KnowledgeIndexManifest {
  return {
    version: "1.0.0",
    model: "test-model",
    dimensions: 2,
    builtAt: "2026-07-22T00:00:00.000Z",
    count: 3,
    entries: [
      {
        id: "preset:frontend:cache-strategy",
        source: "preset",
        presetId: "frontend",
        presetName: "前端工程师",
        title: "浏览器缓存策略",
        summary: "强缓存与协商缓存，Cache-Control/ETag/Last-Modified",
        searchText: "浏览器缓存策略 强缓存与协商缓存 Cache-Control ETag Last-Modified",
        vector: [1, 0],
        href: "",
        tags: ["前端", "缓存"],
        difficulty: 3,
        frequency: "高",
      },
      {
        id: "preset:backend:redis-cache",
        source: "preset",
        presetId: "backend",
        presetName: "后端工程师",
        title: "Redis 缓存",
        summary: "Redis 缓存穿透/击穿/雪崩，分布式缓存",
        searchText: "Redis 缓存 缓存穿透 击穿 雪崩 分布式缓存",
        vector: [0.9, 0.44],
        href: "",
        tags: ["后端", "Redis"],
        difficulty: 3,
        frequency: "高",
      },
      {
        id: "doc:getting-started",
        source: "doc",
        docCategory: "快速开始",
        title: "30 秒快速上手",
        summary: "输入主题 AI 生成计划 开始学习",
        searchText: "30 秒快速上手 输入主题 AI 生成计划 开始学习",
        vector: [0, 1],
        href: "/docs#getting-started",
        tags: ["开始", "入门"],
      },
    ],
  };
}

describe("shouldRetrieveKnowledge", () => {
  it("命令型消息不触发检索", () => {
    expect(shouldRetrieveKnowledge("设置提醒")).toBe(false);
    expect(shouldRetrieveKnowledge("调整计划")).toBe(false);
    expect(shouldRetrieveKnowledge("下一步干嘛")).toBe(false);
    expect(shouldRetrieveKnowledge("开始专注")).toBe(false);
    expect(shouldRetrieveKnowledge("帮我设置提醒")).toBe(false);
    expect(shouldRetrieveKnowledge("今日总结")).toBe(false);
  });

  it("太短的消息不触发检索", () => {
    expect(shouldRetrieveKnowledge("好的")).toBe(false);
    expect(shouldRetrieveKnowledge("谢谢")).toBe(false);
    expect(shouldRetrieveKnowledge("明白了")).toBe(false);
  });

  it("含知识型信号词的消息触发检索", () => {
    expect(shouldRetrieveKnowledge("有哪些缓存策略？")).toBe(true);
    expect(shouldRetrieveKnowledge("什么是强缓存")).toBe(true);
    expect(shouldRetrieveKnowledge("Redis 和 Memcached 的区别")).toBe(true);
    expect(shouldRetrieveKnowledge("解释一下 PagedAttention 原理")).toBe(true);
    expect(shouldRetrieveKnowledge("如何实现一个 RAG 系统")).toBe(true);
    expect(shouldRetrieveKnowledge("为什么需要缓存")).toBe(true);
  });

  it("中等长度无明显命令的消息触发检索", () => {
    expect(shouldRetrieveKnowledge("React 性能优化的几种方法")).toBe(true);
    expect(shouldRetrieveKnowledge("分布式锁的实现方案")).toBe(true);
  });
});

describe("cosineSimilarity", () => {
  it("相同向量相似度为 1", () => {
    expect(cosineSimilarity([1, 0], [1, 0])).toBeCloseTo(1, 6);
    expect(cosineSimilarity([3, 4], [3, 4])).toBeCloseTo(1, 6);
  });

  it("正交向量相似度为 0", () => {
    expect(cosineSimilarity([1, 0], [0, 1])).toBeCloseTo(0, 6);
  });

  it("反向向量相似度为 -1", () => {
    expect(cosineSimilarity([1, 0], [-1, 0])).toBeCloseTo(-1, 6);
  });

  it("维度不一致抛错", () => {
    expect(() => cosineSimilarity([1, 0], [1, 0, 0])).toThrow(/维度不匹配/);
  });

  it("零向量返回 0（避免除零）", () => {
    expect(cosineSimilarity([0, 0], [1, 0])).toBe(0);
  });
});

describe("vectorSearch", () => {
  const index = makeTestIndex();

  it("查询向量命中预期条目 top-1", () => {
    // 查询向量 [1, 0] 应命中 cache-strategy（向量 [1, 0]）
    const results = vectorSearch([1, 0], index, { threshold: 0.5 });
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].entry.id).toBe("preset:frontend:cache-strategy");
    expect(results[0].score).toBeCloseTo(1, 6);
  });

  it("excludeIds 生效", () => {
    const results = vectorSearch([1, 0], index, {
      threshold: 0.5,
      excludeIds: ["preset:frontend:cache-strategy"],
    });
    const ids = results.map((r) => r.entry.id);
    expect(ids).not.toContain("preset:frontend:cache-strategy");
  });

  it("threshold 过滤低分条目", () => {
    // 阈值 0.99 时只有完全相同向量命中
    const results = vectorSearch([1, 0], index, { threshold: 0.99 });
    expect(results.length).toBe(1);
    expect(results[0].entry.id).toBe("preset:frontend:cache-strategy");
  });

  it("topK 限制返回数量", () => {
    const results = vectorSearch([1, 0], index, { topK: 1, threshold: 0 });
    expect(results.length).toBe(1);
  });

  it("维度不一致抛错", () => {
    expect(() => vectorSearch([1, 0, 0], index)).toThrow(/维度/);
  });
});

describe("keywordSearch", () => {
  const index = makeTestIndex();

  it("中文 bigram 命中", () => {
    // "缓存策略" → bigram: 缓存, 存策, 策略
    const results = keywordSearch("有哪些缓存策略", index);
    expect(results.length).toBeGreaterThan(0);
    // 应命中含"缓存策略"的条目
    const ids = results.map((r) => r.entry.id);
    expect(ids).toContain("preset:frontend:cache-strategy");
  });

  it("英文单词命中", () => {
    const results = keywordSearch("Redis cache", index);
    expect(results.length).toBeGreaterThan(0);
    const ids = results.map((r) => r.entry.id);
    expect(ids).toContain("preset:backend:redis-cache");
  });

  it("无命中返回空", () => {
    const results = keywordSearch("xyzabc", index);
    expect(results.length).toBe(0);
  });

  it("excludeIds 生效", () => {
    const results = keywordSearch("缓存", index, {
      excludeIds: ["preset:frontend:cache-strategy"],
    });
    const ids = results.map((r) => r.entry.id);
    expect(ids).not.toContain("preset:frontend:cache-strategy");
  });
});

describe("retrieveKnowledge", () => {
  beforeEach(() => {
    loadKnowledgeIndexMock.mockReset();
    apiFetchMock.mockReset();
  });

  it("无索引时返回 mode=none", async () => {
    loadKnowledgeIndexMock.mockResolvedValue(null);
    const result = await retrieveKnowledge("有哪些缓存策略");
    expect(result.mode).toBe("none");
    expect(result.entries).toHaveLength(0);
  });

  it("向量检索命中返回 mode=vector", async () => {
    const index = makeTestIndex();
    loadKnowledgeIndexMock.mockResolvedValue(index);
    apiFetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ vector: [1, 0] }),
    });
    const result = await retrieveKnowledge("有哪些缓存策略", { threshold: 0.5 });
    expect(result.mode).toBe("vector");
    expect(result.entries.length).toBeGreaterThan(0);
    expect(result.entries[0].entry.id).toBe("preset:frontend:cache-strategy");
  });

  it("embed 失败时降级 keyword", async () => {
    const index = makeTestIndex();
    loadKnowledgeIndexMock.mockResolvedValue(index);
    apiFetchMock.mockRejectedValue(new Error("network error"));
    const result = await retrieveKnowledge("有哪些缓存策略");
    expect(result.mode).toBe("keyword");
    expect(result.entries.length).toBeGreaterThan(0);
  });
});
