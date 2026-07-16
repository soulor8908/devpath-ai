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

  it("中间一个抛错，返回 3 题但其中一个 question 是失败标记", async () => {
    const nodes = [makeNode("k1"), makeNode("k2"), makeNode("k3")];
    vi.mocked(generateObject)
      .mockResolvedValueOnce({
        object: { question: "题1", answer: "答1", keyPoints: ["p1"], followUps: ["f1"] },
      } as any)
      .mockRejectedValueOnce(new Error("AI 失败"))
      .mockResolvedValueOnce({
        object: { question: "题3", answer: "答3", keyPoints: ["p3"], followUps: ["f3"] },
      } as any);

    const questions = await generateQuestions(nodes);
    expect(questions).toHaveLength(3);
    expect(questions[0].question).toBe("题1");
    expect(questions[1].question).toBe("生成失败，点击重试");
    expect(questions[1].answer).toBe("[ERROR] AI 失败");
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
