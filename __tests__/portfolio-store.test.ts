// __tests__/portfolio-store.test.ts
// V4 作品集客户端存储层测试
//
// 验证：
//   - createPortfolioEntry：创建草稿，status=draft，无 publishedAt
//   - getPortfolioEntry：按 id 读取
//   - listPortfolioEntries：列出全部（含 draft）
//   - updatePortfolioEntry：部分字段更新 + updatedAt 自动刷新
//   - publishPortfolioEntry：status=published + publishedAt 设置
//   - deletePortfolioEntry：删除后读不到
//   - toPublicEntries：只返回 published + 字段脱敏（无 status/createdAt/updatedAt）

import { describe, it, expect, beforeEach } from "vitest";
import "fake-indexeddb/auto";
import {
  createPortfolioEntry,
  getPortfolioEntry,
  listPortfolioEntries,
  updatePortfolioEntry,
  publishPortfolioEntry,
  deletePortfolioEntry,
  toPublicEntries,
} from "../lib/curriculum/portfolio-store";
import { listKeys, delItem } from "../lib/storage/db";
import { KEY_PREFIXES } from "../lib/types/constants";
import type { PortfolioEntry } from "../lib/types";

async function clearPortfolio() {
  const keys = await listKeys(KEY_PREFIXES.PORTFOLIO);
  for (const k of keys) {
    await delItem(k);
  }
}

const baseInput = {
  title: "我的项目",
  summary: "一句话描述",
  nodeId: "project.cli-llm-tool",
  rubricId: "project-cli-llm-tool",
  repoUrl: "https://github.com/u/r",
  deployUrl: "https://demo.example.com",
  docUrl: undefined,
  reviewScore: 85,
  reviewPassed: true,
  reviewFeedback: "代码结构清晰",
};

describe("portfolio-store", () => {
  beforeEach(async () => {
    await clearPortfolio();
  });

  it("createPortfolioEntry 创建草稿，status=draft 且无 publishedAt", async () => {
    const entry = await createPortfolioEntry(baseInput);
    expect(entry.id).toBeTruthy();
    expect(entry.status).toBe("draft");
    expect(entry.publishedAt).toBeUndefined();
    expect(entry.title).toBe(baseInput.title);
    expect(entry.reviewScore).toBe(85);
    expect(entry.createdAt).toBe(entry.updatedAt);
  });

  it("getPortfolioEntry 按 id 读取", async () => {
    const created = await createPortfolioEntry(baseInput);
    const got = await getPortfolioEntry(created.id);
    expect(got).toBeDefined();
    expect(got?.id).toBe(created.id);
  });

  it("getPortfolioEntry 不存在返回 undefined", async () => {
    const got = await getPortfolioEntry("nonexistent-id");
    expect(got).toBeUndefined();
  });

  it("listPortfolioEntries 列出全部（含 draft）", async () => {
    await createPortfolioEntry({ ...baseInput, title: "P1" });
    await createPortfolioEntry({ ...baseInput, title: "P2" });
    const list = await listPortfolioEntries();
    expect(list).toHaveLength(2);
    const titles = list.map((e) => e.title).sort();
    expect(titles).toEqual(["P1", "P2"]);
  });

  it("updatePortfolioEntry 部分字段更新且 updatedAt 刷新；id 不可改", async () => {
    const created = await createPortfolioEntry(baseInput);
    // 等一秒确保 updatedAt 会变
    await new Promise((r) => setTimeout(r, 10));
    const updated = await updatePortfolioEntry(created.id, {
      title: "新标题",
      repoUrl: "https://github.com/u/new",
    });
    expect(updated?.title).toBe("新标题");
    expect(updated?.repoUrl).toBe("https://github.com/u/new");
    expect(updated?.summary).toBe(baseInput.summary); // 未改字段保留
    expect(updated?.updatedAt).not.toBe(created.updatedAt);
    // id 不可改：传入试图覆盖 id 的 patch 也应被忽略
    const malicious = await updatePortfolioEntry(created.id, {
      ...({} as Partial<PortfolioEntry>),
      id: "tampered-id",
    });
    expect(malicious?.id).toBe(created.id);
  });

  it("updatePortfolioEntry 不存在的 id 返回 undefined", async () => {
    const result = await updatePortfolioEntry("nonexistent", { title: "x" });
    expect(result).toBeUndefined();
  });

  it("publishPortfolioEntry 设置 status=published + publishedAt", async () => {
    const created = await createPortfolioEntry(baseInput);
    const published = await publishPortfolioEntry(created.id);
    expect(published?.status).toBe("published");
    expect(published?.publishedAt).toBeTruthy();
    // ISO 时间格式
    expect(published?.publishedAt).toMatch(
      /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/,
    );
  });

  it("deletePortfolioEntry 删除后读不到", async () => {
    const created = await createPortfolioEntry(baseInput);
    await deletePortfolioEntry(created.id);
    const got = await getPortfolioEntry(created.id);
    expect(got).toBeUndefined();
  });

  describe("toPublicEntries 过滤与脱敏", () => {
    it("只返回 published 条目，draft 被过滤", async () => {
      const draft = await createPortfolioEntry({ ...baseInput, title: "Draft" });
      const published = await createPortfolioEntry({ ...baseInput, title: "Pub" });
      await publishPortfolioEntry(published.id);
      const all = await listPortfolioEntries();
      const publicEntries = toPublicEntries(all);
      expect(publicEntries).toHaveLength(1);
      expect(publicEntries[0].title).toBe("Pub");
      expect(publicEntries.some((e) => e.id === draft.id)).toBe(false);
    });

    it("脱敏后不含本地字段（status/createdAt/updatedAt/reviewFeedback）", async () => {
      const created = await createPortfolioEntry(baseInput);
      await publishPortfolioEntry(created.id);
      const all = await listPortfolioEntries();
      const [publicEntry] = toPublicEntries(all);
      expect(publicEntry).toBeDefined();
      // 必须含 publishedAt（脱敏后保留）
      expect(publicEntry.publishedAt).toBeTruthy();
      // 不应含本地敏感字段
      expect("status" in publicEntry).toBe(false);
      expect("createdAt" in publicEntry).toBe(false);
      expect("updatedAt" in publicEntry).toBe(false);
      expect("reviewFeedback" in publicEntry).toBe(false);
      // 评审字段保留（公开作品集要展示 AI 通过分数）
      expect(publicEntry.reviewScore).toBe(85);
      expect(publicEntry.reviewPassed).toBe(true);
    });

    it("未发布的 published 条目（publishedAt 缺失）也被过滤", async () => {
      // 直接构造一个 status=published 但无 publishedAt 的脏数据
      const created = await createPortfolioEntry(baseInput);
      await updatePortfolioEntry(created.id, { status: "published" });
      const all = await listPortfolioEntries();
      const publicEntries = toPublicEntries(all);
      expect(publicEntries).toHaveLength(0);
    });
  });
});
