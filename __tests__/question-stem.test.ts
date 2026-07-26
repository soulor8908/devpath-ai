import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("ai", () => ({
  generateObject: vi.fn(),
  generateText: vi.fn(),
}));

vi.mock("../lib/ai/provider", () => ({
  createAIProvider: vi.fn(() => ({})),
}));

import { generateObject, generateText } from "ai";
import { generateQuestionStems, FAILED_QUESTION_SENTINEL } from "../lib/ai/question";
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

describe("generateQuestionStems (stem-only 批量生成)", () => {
  beforeEach(() => {
    vi.mocked(generateObject).mockReset();
    vi.mocked(generateText).mockReset();
  });

  it("成功生成题干：answer 为空，bigTech 透传", async () => {
    const nodes = [makeNode("k1"), makeNode("k2")];
    vi.mocked(generateObject).mockImplementation(async (opts: any) => {
      const prompt: string = opts?.prompt ?? "";
      if (prompt.includes("知识点 k1")) {
        return { object: { question: "题1", bigTech: true } } as any;
      }
      if (prompt.includes("知识点 k2")) {
        return { object: { question: "题2", bigTech: false } } as any;
      }
      throw new Error("unexpected");
    });

    const { questions, firstError } = await generateQuestionStems(nodes);

    expect(questions).toHaveLength(2);
    expect(questions[0].question).toBe("题1");
    expect(questions[0].answer).toBe(""); // stem 路径不生成答案
    expect(questions[0].keyPoints).toEqual([]);
    expect(questions[0].followUps).toEqual([]);
    expect(questions[0].bigTech).toBe(true);
    expect(questions[1].bigTech).toBe(false);
    expect(firstError).toBeNull();
  });

  it("generateObject 失败时降级 generateText 并宽松解析 bigTech 缺失", async () => {
    const nodes = [makeNode("k1")];
    vi.mocked(generateObject).mockRejectedValueOnce(new Error("schema 校验失败"));
    // 模型返回带 fence + 缺 bigTech 字段的文本
    vi.mocked(generateText).mockResolvedValueOnce({
      text: '好的：\n```json\n{"question":"降级题"}\n```\n希望有帮助',
    } as any);

    const { questions, firstError } = await generateQuestionStems(nodes);

    expect(questions).toHaveLength(1);
    expect(questions[0].question).toBe("降级题");
    expect(questions[0].answer).toBe("");
    // bigTech 缺失时默认 false（宽松解析，不因次要字段缺失判失败）
    expect(questions[0].bigTech).toBe(false);
    expect(firstError).toBeNull();
  });

  it("全部失败时返回占位 + firstError 透出真实错误", async () => {
    const nodes = [makeNode("k1")];
    vi.mocked(generateObject).mockRejectedValue(new Error("429 rate limit"));
    vi.mocked(generateText).mockRejectedValue(new Error("429 rate limit"));

    const { questions, firstError } = await generateQuestionStems(nodes);

    expect(questions).toHaveLength(1);
    expect(questions[0].question).toBe(FAILED_QUESTION_SENTINEL);
    expect(firstError).toContain("429 rate limit");
  });

  it("部分失败时 firstError 只记录第一道失败题的错误", async () => {
    const nodes = [makeNode("k1"), makeNode("k2")];
    vi.mocked(generateObject).mockImplementation(async (opts: any) => {
      const prompt: string = opts?.prompt ?? "";
      if (prompt.includes("知识点 k1")) {
        return { object: { question: "题1", bigTech: false } } as any;
      }
      throw new Error("timeout");
    });
    vi.mocked(generateText).mockRejectedValue(new Error("timeout"));

    const { questions, firstError } = await generateQuestionStems(nodes);

    expect(questions).toHaveLength(2);
    expect(questions[0].question).toBe("题1");
    expect(questions[1].question).toBe(FAILED_QUESTION_SENTINEL);
    expect(firstError).toContain("timeout");
  });

  it("空节点数组返回空结果", async () => {
    const { questions, firstError } = await generateQuestionStems([]);
    expect(questions).toEqual([]);
    expect(firstError).toBeNull();
    expect(generateObject).not.toHaveBeenCalled();
  });
});
