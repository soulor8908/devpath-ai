// __tests__/api-portfolio.test.ts
// V4 作品集 API 的 KV 层测试（与 api-public.test.ts 同构）
//
// 路由层依赖 Cloudflare 运行时无法直接测，本测试只验证 KV 行为：
//   - getPortfolio 不存在 → null
//   - setPortfolio → getPortfolio 返回一致
//   - 整体覆盖写入（旧数据被替换）

import { describe, it, expect } from "vitest";
import { createKVStore } from "../lib/storage/kv";
import type { PublicPortfolio, PublicPortfolioEntry } from "../lib/types";

function makeEntry(overrides: Partial<PublicPortfolioEntry> = {}): PublicPortfolioEntry {
  return {
    id: "entry-1",
    title: "CLI 文本批处理工具",
    summary: "基于 asyncio 的 LLM 批处理工具",
    nodeId: "project.cli-llm-tool",
    rubricId: "project-cli-llm-tool",
    repoUrl: "https://github.com/alice/cli-tool",
    deployUrl: undefined,
    docUrl: undefined,
    reviewScore: 82,
    reviewPassed: true,
    publishedAt: "2026-07-25T00:00:00.000Z",
    ...overrides,
  };
}

describe("api-portfolio (via KV mock)", () => {
  it("未写入时 getPortfolio 返回 null", async () => {
    const kv = createKVStore();
    const got = await kv.getPortfolio("alice");
    expect(got).toBeNull();
  });

  it("setPortfolio → getPortfolio 返回一致", async () => {
    const kv = createKVStore();
    const portfolio: PublicPortfolio = {
      username: "alice",
      entries: [makeEntry({ id: "a" }), makeEntry({ id: "b", title: "RAG 管线" })],
    };
    await kv.setPortfolio("alice", portfolio);
    const got = await kv.getPortfolio("alice");
    expect(got).not.toBeNull();
    expect(got?.username).toBe("alice");
    expect(got?.entries).toHaveLength(2);
    expect(got?.entries[0].id).toBe("a");
    expect(got?.entries[1].title).toBe("RAG 管线");
  });

  it("整体覆盖写入：旧数据被替换", async () => {
    const kv = createKVStore();
    await kv.setPortfolio("alice", {
      username: "alice",
      entries: [makeEntry({ id: "old-1" }), makeEntry({ id: "old-2" })],
    });
    // 整体覆盖为单条
    await kv.setPortfolio("alice", {
      username: "alice",
      entries: [makeEntry({ id: "new-1", title: "新作品" })],
    });
    const got = await kv.getPortfolio("alice");
    expect(got?.entries).toHaveLength(1);
    expect(got?.entries[0].id).toBe("new-1");
    expect(got?.entries[0].title).toBe("新作品");
  });

  it("不同 username 的作品集相互隔离", async () => {
    const kv = createKVStore();
    await kv.setPortfolio("alice", {
      username: "alice",
      entries: [makeEntry({ id: "a-1" })],
    });
    await kv.setPortfolio("bob", {
      username: "bob",
      entries: [makeEntry({ id: "b-1" })],
    });
    const alice = await kv.getPortfolio("alice");
    const bob = await kv.getPortfolio("bob");
    expect(alice?.entries[0].id).toBe("a-1");
    expect(bob?.entries[0].id).toBe("b-1");
  });
});
