// __tests__/sync-security.test.ts
// 测试同步引擎的安全性与正确性：
//   1. SYNC_PREFIXES 不含 MODEL_CONFIG（API Key 不上传云端）
//   2. mergeData 处理 tombstone 删除传播
//   3. extractTombstoneDeletions 正确提取待删除 key

import { describe, it, expect } from "vitest";
import { SYNC_PREFIXES, mergeData, extractTombstoneDeletions } from "../lib/sync";
import { KEY_PREFIXES } from "../lib/types";

// ============ API Key 安全：MODEL_CONFIG 不在同步列表 ============

describe("SYNC_PREFIXES 安全性", () => {
  it("不包含 MODEL_CONFIG（API Key 不上传云端）", () => {
    expect(SYNC_PREFIXES).not.toContain(KEY_PREFIXES.MODEL_CONFIG);
  });

  it("不包含 ENERGY_MODEL（模型权重无需跨设备同步）", () => {
    expect(SYNC_PREFIXES).not.toContain(KEY_PREFIXES.ENERGY_MODEL);
  });

  it("不包含 USER_PROFILE（画像含本地推断，跨设备重建即可）", () => {
    // 用户画像是本地聚合产物，跨设备应重新构建而非同步
    expect(SYNC_PREFIXES).not.toContain(KEY_PREFIXES.USER_PROFILE);
  });

  it("包含核心业务数据前缀", () => {
    // 确保关键业务数据仍在同步列表中
    expect(SYNC_PREFIXES).toContain(KEY_PREFIXES.PLAN);
    expect(SYNC_PREFIXES).toContain(KEY_PREFIXES.CARD);
    expect(SYNC_PREFIXES).toContain(KEY_PREFIXES.LEARN_LOG);
    expect(SYNC_PREFIXES).toContain(KEY_PREFIXES.PLAN_SUMMARY);
  });
});

// ============ Tombstone 删除传播 ============

describe("mergeData tombstone 处理", () => {
  it("远端 tombstone → 删除本地对应原 key", () => {
    const local = {
      "plan:abc": { id: "abc", updatedAt: "2026-07-01T00:00:00.000Z" },
      "plan:xyz": { id: "xyz", updatedAt: "2026-07-01T00:00:00.000Z" },
    };
    const remote = {
      "tombstone:plan:abc": {
        deletedAt: "2026-07-10T00:00:00.000Z",
        originalKey: "plan:abc",
      },
    };
    const merged = mergeData(local, remote);
    // plan:abc 应被删除
    expect(merged["plan:abc"]).toBeUndefined();
    // plan:xyz 应保留
    expect(merged["plan:xyz"]).toBeDefined();
    // tombstone 记录本身应存在（避免重复处理）
    expect(merged["tombstone:plan:abc"]).toBeDefined();
  });

  it("无 tombstone 时正常 LWW 合并", () => {
    const local = {
      "plan:abc": { id: "abc", updatedAt: "2026-07-01T00:00:00.000Z" },
    };
    const remote = {
      "plan:abc": { id: "abc", updatedAt: "2026-07-10T00:00:00.000Z" },
    };
    const merged = mergeData(local, remote);
    // 远端较新 → 取远端
    expect((merged["plan:abc"] as { updatedAt: string }).updatedAt).toBe(
      "2026-07-10T00:00:00.000Z",
    );
  });

  it("tombstone originalKey 缺失时用 key 后缀兜底", () => {
    const local = {
      "card:123": { id: "123", updatedAt: "2026-07-01T00:00:00.000Z" },
    };
    // tombstone 没有 originalKey 字段 → 用 key.slice("tombstone:".length) 兜底
    const remote = {
      "tombstone:card:123": { deletedAt: "2026-07-10T00:00:00.000Z" },
    };
    const merged = mergeData(local, remote);
    expect(merged["card:123"]).toBeUndefined();
  });
});

describe("extractTombstoneDeletions", () => {
  it("从 remote 数据中提取 tombstone 指向的原 key", () => {
    const remote = {
      "plan:abc": { id: "abc", updatedAt: "2026-07-10T00:00:00.000Z" },
      "tombstone:plan:old": {
        deletedAt: "2026-07-09T00:00:00.000Z",
        originalKey: "plan:old",
      },
      "tombstone:card:gone": {
        deletedAt: "2026-07-09T00:00:00.000Z",
        originalKey: "card:gone",
      },
    };
    const deletions = extractTombstoneDeletions(remote);
    expect(deletions).toContain("plan:old");
    expect(deletions).toContain("card:gone");
    expect(deletions).not.toContain("plan:abc");
  });

  it("无 tombstone 时返回空数组", () => {
    const remote = {
      "plan:abc": { id: "abc", updatedAt: "2026-07-10T00:00:00.000Z" },
    };
    expect(extractTombstoneDeletions(remote)).toEqual([]);
  });

  it("空 remote 返回空数组", () => {
    expect(extractTombstoneDeletions({})).toEqual([]);
  });
});
