// __tests__/review-dedup.test.ts
// 测试收藏试题集「开始复习」时的查重逻辑：
//   - createCard 携带 deckId
//   - findExistingCard({ deckId, questionId }) 能正确返回已存在的卡片
//   - 也支持 { planId, questionId } 查重（学习/收藏单题/错题场景）

import { describe, it, expect, beforeEach } from "vitest";
import "fake-indexeddb/auto";
import { setItem, listKeys, delItem } from "../lib/storage/db";
import { KEY_PREFIXES } from "../lib/types";
import { createCard, findExistingCard } from "../lib/fsrs";

describe("review dedup", () => {
  beforeEach(async () => {
    // 清理旧卡片，避免测试间数据污染（fake-indexeddb 跨测试共享内存）
    const keys = await listKeys(KEY_PREFIXES.CARD);
    for (const k of keys) await delItem(k);
  });

  it("createCard 带 deckId 字段", () => {
    const card = createCard("plan-1", "node-1", "q-1", "问题", "答案", "standard", "deck-unique-1");
    expect(card.deckId).toBe("deck-unique-1");
  });

  it("createCard 不传 deckId 时为 undefined（向后兼容）", () => {
    const card = createCard("plan-1", "node-1", "q-1", "问题", "答案", "standard");
    expect(card.deckId).toBeUndefined();
  });

  it("findExistingCard 找到匹配 deckId+questionId 的卡片", async () => {
    // 使用唯一 deckId 避免与其他测试冲突
    const deckId = "deck-find-test";
    const card = createCard("plan-1", "node-1", "q-1", "问题", "答案", "standard", deckId);
    await setItem(KEY_PREFIXES.CARD + card.id, card);

    const found = await findExistingCard({ deckId, questionId: "q-1" });
    expect(found).toBeDefined();
    expect(found?.id).toBe(card.id);
    expect(found?.deckId).toBe(deckId);
  });

  it("findExistingCard 区分不同 deckId（相同 questionId）", async () => {
    // 同一道题（q-1）被收藏到两个 deck
    const deckA = "deck-distinct-A";
    const deckB = "deck-distinct-B";
    const cardA = createCard("plan-1", "node-1", "q-1", "问题", "答案", "standard", deckA);
    const cardB = createCard("plan-1", "node-1", "q-1", "问题", "答案", "standard", deckB);
    await setItem(KEY_PREFIXES.CARD + cardA.id, cardA);
    await setItem(KEY_PREFIXES.CARD + cardB.id, cardB);

    const foundA = await findExistingCard({ deckId: deckA, questionId: "q-1" });
    const foundB = await findExistingCard({ deckId: deckB, questionId: "q-1" });
    expect(foundA?.id).toBe(cardA.id);
    expect(foundB?.id).toBe(cardB.id);
    expect(foundA?.id).not.toBe(foundB?.id);
  });

  it("findExistingCard 不存在时返回 undefined", async () => {
    const found = await findExistingCard({ deckId: "nonexistent-deck", questionId: "nonexistent-q" });
    expect(found).toBeUndefined();
  });

  it("findExistingCard 在 deckId 缺失但 planId 提供时按 planId+questionId 查重", async () => {
    // 不传 deckId 但传 planId：应按 planId+questionId 查重
    const card = createCard("plan-lookup", "node-1", "q-plan-1", "问题", "答案", "standard");
    await setItem(KEY_PREFIXES.CARD + card.id, card);

    const found = await findExistingCard({ planId: "plan-lookup", questionId: "q-plan-1" });
    expect(found).toBeDefined();
    expect(found?.id).toBe(card.id);

    // 不同 planId 不算重复
    const notFound = await findExistingCard({ planId: "plan-other", questionId: "q-plan-1" });
    expect(notFound).toBeUndefined();
  });

  it("findExistingCard 同 deckId 不同 questionId 不算重复", async () => {
    // 同一个 deck 内不同题目
    const deckId = "deck-same-diff-q";
    const card = createCard("plan-1", "node-1", "q-1", "问题1", "答案1", "standard", deckId);
    await setItem(KEY_PREFIXES.CARD + card.id, card);

    const foundSameQ = await findExistingCard({ deckId, questionId: "q-1" });
    const foundDiffQ = await findExistingCard({ deckId, questionId: "q-2" });
    expect(foundSameQ).toBeDefined();
    expect(foundDiffQ).toBeUndefined();
  });
});
