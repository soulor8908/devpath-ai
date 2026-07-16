import { describe, it, expect } from "vitest";
import { POST } from "../app/api/review/route";
import type { ReviewCard } from "../lib/types";

function mockRequest(body: any) {
  return { json: async () => body } as any;
}

function makeCard(): ReviewCard {
  return {
    id: "c1",
    planId: "p1",
    nodeId: "k1",
    questionId: "q1",
    front: "问题",
    back: "答案",
    due: new Date().toISOString(),
    stability: 0,
    difficulty: 0,
    elapsedDays: 0,
    scheduledDays: 0,
    reps: 0,
    lapses: 0,
    state: 0,
    lastReview: "",
  };
}

describe("/api/review", () => {
  it("评分 Good 后返回 stability/difficulty 更新的卡片", async () => {
    const card = makeCard();
    const req = mockRequest({ card, rating: 3 });
    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.card).toBeDefined();
    expect(data.card.reps).toBe(1);
    expect(data.card.stability).toBeGreaterThan(0);
    expect(data.log).toBeDefined();
    expect(data.log.cardId).toBe("c1");
    expect(data.log.rating).toBe(3);
    expect(data.log.stateBefore).toBe(0);
    expect(data.log.stateAfter).toBe(data.card.state);
  });

  it("评分 Again 后 reps 不增加但 lapses 增加", async () => {
    const card = makeCard();
    const req = mockRequest({ card, rating: 1 });
    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.log.rating).toBe(1);
  });

  it("缺少 card 返回 400", async () => {
    const req = mockRequest({ rating: 3 });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("rating 超范围返回 400", async () => {
    const card = makeCard();
    const req = mockRequest({ card, rating: 5 });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });
});
