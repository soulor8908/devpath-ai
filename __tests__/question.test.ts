import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("ai", () => ({
  generateObject: vi.fn(),
  generateText: vi.fn(),
}));

vi.mock("../lib/ai/provider", () => ({
  createAIProvider: vi.fn(() => ({})),
}));

import { generateObject, generateText } from "ai";
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
    vi.mocked(generateText).mockReset();
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
    // 2026-07-25 更新：generateObject 失败后会降级到 generateText。
    // 此测试验证"重试成功"路径，所以 generateText 也要 mock 失败，
    // 让流程走到 sleep + 重试 generateObject。
    // Promise.all 并行调用 generateObject，顺序为 k1→k2→k3 第 1 轮，
    // k2 失败后降级 generateText 也失败 → sleep 800ms 重试 → k2 重试 generateObject 成功
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
    // k2 第一次降级时 generateText 也失败，触发重试
    vi.mocked(generateText).mockRejectedValueOnce(new Error("降级也失败"));

    const questions = await generateQuestions(nodes);
    expect(questions).toHaveLength(3);
    expect(questions[0].question).toBe("题1");
    expect(questions[1].question).toBe("题2-重试");
    expect(questions[2].question).toBe("题3");
  });

  it("第一次和重试都失败，返回占位 Question（用户需求 3：占位 + 错误信息聚合）", async () => {
    const nodes = [makeNode("k1"), makeNode("k2"), makeNode("k3")];
    // 2026-07-25 更新：generateObject 失败后会降级到 generateText，
    // 所以"真正失败"需要 generateObject 抛错 + generateText 也抛错。
    // mock 调用顺序：k1 成功 → k2 generateObject 失败 + generateText 失败 →
    //               k3 成功 → k2 重试 generateObject 失败 + generateText 失败
    vi.mocked(generateObject)
      .mockResolvedValueOnce({
        object: { question: "题1", answer: "答1", keyPoints: ["p1"], followUps: ["f1"] },
      } as any)
      .mockRejectedValueOnce(new Error("第一次失败"))
      .mockResolvedValueOnce({
        object: { question: "题3", answer: "答3", keyPoints: ["p3"], followUps: ["f3"] },
      } as any)
      .mockRejectedValueOnce(new Error("重试也失败"));
    // generateText 在两次降级时都被调用，都失败
    vi.mocked(generateText)
      .mockRejectedValueOnce(new Error("降级也失败-1"))
      .mockRejectedValueOnce(new Error("降级也失败-2"));

    const questions = await generateQuestions(nodes);
    expect(questions).toHaveLength(3);
    expect(questions[0].question).toBe("题1");
    expect(questions[1].question).toBe("生成失败，点击重试");
    // 2026-07-25 更新：占位 answer 现在记录的是降级 generateText 的失败信息
    // （因为 generateObject 失败后会先降级，降级也失败才进占位）
    // 第一次：generateObject 失败"第一次失败" → 降级 generateText 失败"降级也失败-1"
    // 重试：generateObject 失败"重试也失败" → 降级 generateText 失败"降级也失败-2"
    // 占位 answer 聚合两次降级的错误信息（最终抛出的错误）
    expect(questions[1].answer).toContain("降级也失败-1");
    expect(questions[1].answer).toContain("降级也失败-2");
    expect(questions[2].question).toBe("题3");
  });

  it("generateObject 失败但 generateText 降级成功（2026-07-25 用户需求 3：避免有返回却判失败）", async () => {
    const nodes = [makeNode("k1")];
    // generateObject 抛错（模拟 schema 校验失败 / 模型不支持 json mode）
    vi.mocked(generateObject).mockRejectedValueOnce(new Error("schema 校验失败"));
    // generateText 返回带 markdown fence 的 JSON（模拟模型实际有返回但格式不标准）
    vi.mocked(generateText).mockResolvedValueOnce({
      text: '好的，这是题目：\n```json\n{"question":"降级题","answer":"降级答","keyPoints":["p1"],"followUps":["f1"],"bigTech":false}\n```\n希望对你有帮助',
    } as any);

    const questions = await generateQuestions(nodes);
    expect(questions).toHaveLength(1);
    expect(questions[0].question).toBe("降级题");
    expect(questions[0].answer).toBe("降级答");
    expect(questions[0].keyPoints).toEqual(["p1"]);
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
