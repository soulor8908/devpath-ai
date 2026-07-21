import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("ai", () => ({
  generateObject: vi.fn(),
}));

vi.mock("../lib/ai/provider", () => ({
  createAIProvider: vi.fn(() => ({})),
}));

import { generateObject } from "ai";
import { generateQuestions, chunk } from "../lib/ai/question";
import type { KnowledgeNode } from "../lib/types";

function makeNode(id: string): KnowledgeNode {
  return {
    id,
    title: `知识点 ${id}`,
    difficulty: 2,
    prerequisites: [],
    frequency: "高",
    summary: "摘要",
    mastery: 0,
  };
}

describe("question", () => {
  beforeEach(() => {
    vi.mocked(generateObject).mockReset();
  });

  it("mock 返回 3 题，验证解析", async () => {
    const nodes = [makeNode("k1"), makeNode("k2"), makeNode("k3")];
    vi.mocked(generateObject).mockImplementation(async () => ({
      object: {
        question: `题 ${nodes[vi.mocked(generateObject).mock.calls.length]?.id || "k?"}`,
        answer: "三段式答案",
        keyPoints: ["要点1", "要点2"],
        followUps: ["追问1"],
        codeSnippet: "const x = 1;",
      },
    } as any));

    const questions = await generateQuestions(nodes);
    expect(questions).toHaveLength(3);
    expect(questions[0].nodeId).toBe("k1");
    expect(questions[0].favorited).toBe(false);
    expect(questions[0].keyPoints).toHaveLength(2);
    expect(questions[0].codeSnippet).toBe("const x = 1;");
  });

  it("第一次抛错但重试成功，返回成功题目（用户需求 3：自动重试机制）", async () => {
    const nodes = [makeNode("k1"), makeNode("k2"), makeNode("k3")];
    // Promise.all 并行调用 generateObject，顺序为 k1→k2→k3 第 1 轮，
    // k2 失败后 sleep 800ms 重试，此时 k3 已在第 1 轮完成。
    // 实际 mock 调用顺序：k1 成功 → k2 失败 → k3 成功 → k2 重试成功
    vi.mocked(generateObject)
      .mockResolvedValueOnce({
        object: { question: "题1", answer: "答1", keyPoints: ["p1"], followUps: ["f1"] },
      } as any)
      .mockRejectedValueOnce(new Error("AI 失败"))
      .mockResolvedValueOnce({
        object: { question: "题3", answer: "答3", keyPoints: ["p3"], followUps: ["f3"] },
      } as any)
      .mockResolvedValueOnce({
        object: { question: "题2-重试", answer: "答2", keyPoints: ["p2"], followUps: ["f2"] },
      } as any);

    const questions = await generateQuestions(nodes);
    expect(questions).toHaveLength(3);
    expect(questions[0].question).toBe("题1");
    expect(questions[1].question).toBe("题2-重试");
    expect(questions[2].question).toBe("题3");
  });

  it("第一次和重试都失败，返回占位 Question（用户需求 3：占位 + 错误信息聚合）", async () => {
    const nodes = [makeNode("k1"), makeNode("k2"), makeNode("k3")];
    // mock 调用顺序：k1 成功 → k2 失败 → k3 成功 → k2 重试失败
    vi.mocked(generateObject)
      .mockResolvedValueOnce({
        object: { question: "题1", answer: "答1", keyPoints: ["p1"], followUps: ["f1"] },
      } as any)
      .mockRejectedValueOnce(new Error("第一次失败"))
      .mockResolvedValueOnce({
        object: { question: "题3", answer: "答3", keyPoints: ["p3"], followUps: ["f3"] },
      } as any)
      .mockRejectedValueOnce(new Error("重试也失败"));

    const questions = await generateQuestions(nodes);
    expect(questions).toHaveLength(3);
    expect(questions[0].question).toBe("题1");
    expect(questions[1].question).toBe("生成失败，点击重试");
    // 占位 answer 同时记录第一次和重试的错误信息，便于诊断
    expect(questions[1].answer).toContain("第一次失败");
    expect(questions[1].answer).toContain("重试也失败");
    expect(questions[2].question).toBe("题3");
  });

  it("chunk 函数正确分批", () => {
    expect(chunk([1, 2, 3, 4, 5, 6, 7], 3)).toEqual([[1, 2, 3], [4, 5, 6], [7]]);
    expect(chunk([1, 2], 5)).toEqual([[1, 2]]);
    expect(chunk([], 3)).toEqual([]);
  });

  it("空节点数组返回空数组", async () => {
    const questions = await generateQuestions([]);
    expect(questions).toEqual([]);
  });
});
