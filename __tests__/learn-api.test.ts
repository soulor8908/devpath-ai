import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("../lib/ai/knowledge", () => ({
  decomposeKnowledge: vi.fn(),
}));

vi.mock("../lib/ai/question", () => ({
  generateQuestions: vi.fn(),
}));

vi.mock("../lib/ai/provider", () => ({
  createAIProvider: vi.fn(() => ({})),
  getModel: vi.fn(() => ({})),
  hasAIKey: () => false,
}));

import { decomposeKnowledge } from "../lib/ai/knowledge";
import { generateQuestions } from "../lib/ai/question";
import { POST } from "../app/api/learn/route";
import type { KnowledgeNode, Question } from "../lib/types";

function mockRequest(body: any) {
  return {
    json: async () => body,
  } as any;
}

describe("/api/learn", () => {
  beforeEach(() => {
    vi.mocked(decomposeKnowledge).mockReset();
    vi.mocked(generateQuestions).mockReset();
  });

  it("mock AI 返回，验证响应结构", async () => {
    const nodes: KnowledgeNode[] = [
      { id: "k1", title: "节点1", difficulty: 2, prerequisites: [], frequency: "高", summary: "摘要", mastery: 0 },
    ];
    const questions: Question[] = [
      { id: "q1", nodeId: "k1", question: "题1", answer: "答1", keyPoints: ["p1"], followUps: ["f1"], favorited: false },
    ];
    vi.mocked(decomposeKnowledge).mockResolvedValue(nodes);
    vi.mocked(generateQuestions).mockResolvedValue(questions);

    const req = mockRequest({ topic: "前端性能", dailyMinutes: 30, maxNewPerDay: 1 });
    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.planId).toBeDefined();
    expect(data.plan.topic).toBe("前端性能");
    expect(data.plan.knowledgeTree).toHaveLength(1);
    expect(data.plan.questions).toHaveLength(1);
    expect(data.plan.schedule.length).toBeGreaterThan(0);
    expect(data.plan.fsrsMode).toBe("standard");
    expect(data.plan.dailyMinutes).toBe(30);
  });

  it("缺少 topic 返回 400", async () => {
    const req = mockRequest({ dailyMinutes: 30 });
    const res = await POST(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toContain("topic");
  });

  it("dailyMinutes 超范围返回 400", async () => {
    const req = mockRequest({ topic: "测试", dailyMinutes: 5 });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });
});
