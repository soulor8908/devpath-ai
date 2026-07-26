import { describe, it, expect, vi, beforeEach } from "vitest";

// 与 __tests__/question.test.ts 相同的 mock 模式
// 2026-07-25：question.ts 新增 generateObject 失败降级到 generateText 的容错，
// mock 需同时包含 generateText
vi.mock("ai", () => ({
  generateObject: vi.fn(),
  generateText: vi.fn(),
}));

vi.mock("../lib/ai/provider", () => ({
  createAIProvider: vi.fn(() => ({})),
}));

import { generateObject, generateText } from "ai";
import { generateQuestions } from "../lib/ai/question";
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

describe("AI Mock 场景", () => {
  beforeEach(() => {
    vi.mocked(generateObject).mockReset();
    vi.mocked(generateText).mockReset();
  });

  it("字段缺失时不崩溃（keyPoints/followUps/bigTech 缺失）", async () => {
    const nodes = [makeNode("k1"), makeNode("k2")];
    // AI 返回畸形数据：缺少 keyPoints / followUps / bigTech
    vi.mocked(generateObject).mockResolvedValue({
      object: {
        question: "完整题目文本",
        answer: "完整答案",
        // 故意省略 keyPoints / followUps / bigTech
      },
    } as any);

    // 不应抛出异常
    const questions = await generateQuestions(nodes);

    expect(questions).toHaveLength(2);
    // 题目正文与答案仍可读
    expect(questions[0].question).toBe("完整题目文本");
    expect(questions[0].answer).toBe("完整答案");
    expect(questions[0].nodeId).toBe("k1");
    expect(questions[1].nodeId).toBe("k2");
    // 缺失字段不会导致整体流程中断（容错：仍返回 Question 结构）
    expect(questions[0].favorited).toBe(false);
  });

  it("AI 超时返回失败标记", async () => {
    const nodes = [makeNode("k1")];
    // 2026-07-25：generateObject 失败后会降级到 generateText，
    // 要走到占位需要 generateText 也失败。两个都 mock 超时错误。
    vi.mocked(generateObject).mockRejectedValue(new Error("The operation was aborted due to timeout"));
    // generateObject 失败 → 降级 generateText 也超时（第 1 次）
    // → sleep 800ms 重试 generateObject 还超时 → 降级 generateText 还超时（第 2 次）→ 占位
    vi.mocked(generateText).mockRejectedValue(new Error("The operation was aborted due to timeout"));

    const questions = await generateQuestions(nodes);

    expect(questions).toHaveLength(1);
    // 失败标记：题目为「生成失败，点击重试」，答案带 [ERROR] 前缀
    expect(questions[0].question).toBe("生成失败，点击重试");
    expect(questions[0].answer).toContain("[ERROR]");
    expect(questions[0].answer).toContain("timeout");
    // 失败时 keyPoints/followUps 为空数组，bigTech 为 false
    expect(questions[0].keyPoints).toEqual([]);
    expect(questions[0].followUps).toEqual([]);
    expect(questions[0].bigTech).toBe(false);
  });

  it("空结果返回空数组", async () => {
    // 1) 无节点 → 直接返回空数组，不调用 AI
    const empty = await generateQuestions([]);
    expect(empty).toEqual([]);
    expect(generateObject).not.toHaveBeenCalled();

    // 2) AI 返回空对象 {} 也不应崩溃
    vi.mocked(generateObject).mockResolvedValue({ object: {} } as any);
    const questions = await generateQuestions([makeNode("k1")]);
    expect(questions).toHaveLength(1);
    // 空对象不会中断流程
    expect(questions[0].nodeId).toBe("k1");
  });

  it("部分成功部分失败", async () => {
    const nodes = [makeNode("k1"), makeNode("k2"), makeNode("k3"), makeNode("k4")];
    // 2026-07-26 更新：并发从 5 降到 3 后，mockRejectedValueOnce/mockResolvedValueOnce
    // 的消费顺序与节点顺序不再一致（重试的 generateObject 调用可能抢先消费到给 k4 的 mock）。
    // 改用 mockImplementation 按节点 id 分发，消除调用顺序依赖：
    //   k1/k4 → 成功；k2 → 超时失败；k3 → 网络错误失败
    // generateObject 和 generateText 都按 prompt 中的节点 id 判定返回值。
    vi.mocked(generateObject).mockImplementation(async (opts: any) => {
      const prompt: string = opts?.prompt ?? "";
      if (prompt.includes("知识点 k1")) {
        return { object: { question: "题1", answer: "答1", keyPoints: ["p1"], followUps: ["f1"] } } as any;
      }
      if (prompt.includes("知识点 k4")) {
        return { object: { question: "题4", answer: "答4", keyPoints: ["p4"], followUps: ["f4"], bigTech: true } } as any;
      }
      if (prompt.includes("知识点 k2")) {
        throw new Error("Request timeout");
      }
      if (prompt.includes("知识点 k3")) {
        throw new Error("fetch failed: network error");
      }
      throw new Error("unexpected node in mock");
    });
    // generateText 降级也按节点 id 分发，对应节点抛对应错误
    vi.mocked(generateText).mockImplementation(async (opts: any) => {
      const prompt: string = opts?.prompt ?? "";
      if (prompt.includes("知识点 k2")) {
        throw new Error("Request timeout");
      }
      if (prompt.includes("知识点 k3")) {
        throw new Error("fetch failed: network error");
      }
      throw new Error("unexpected node in mock");
    });

    const questions = await generateQuestions(nodes);

    expect(questions).toHaveLength(4);
    // 成功
    expect(questions[0].question).toBe("题1");
    expect(questions[0].answer).toBe("答1");
    expect(questions[0].keyPoints).toEqual(["p1"]);
    // 失败标记（超时）
    expect(questions[1].question).toBe("生成失败，点击重试");
    expect(questions[1].answer).toContain("[ERROR]");
    expect(questions[1].answer).toContain("timeout");
    // 失败标记（网络错误）
    expect(questions[2].question).toBe("生成失败，点击重试");
    expect(questions[2].answer).toContain("network error");
    // 成功（含 bigTech 标记）
    expect(questions[3].question).toBe("题4");
    expect(questions[3].bigTech).toBe(true);
    // 失败的两条不影响成功的两条，顺序保持
    expect(questions.map((q) => q.nodeId)).toEqual(["k1", "k2", "k3", "k4"]);
  });
});
