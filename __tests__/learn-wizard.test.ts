// __tests__/learn-wizard.test.ts
// LearnWizard 流式答案生成 - NDJSON 解析器测试
//
// 说明：
//   - LearnWizard.tsx 是 React 客户端组件，需要 @testing-library/react 才能组件级测试
//   - 项目当前未安装 @testing-library/react，所以提取了最核心的 NDJSON 解析逻辑到
//     lib/parse-ndjson.ts（纯函数，无副作用），此处直接覆盖解析器
//   - 解析器是 wizard 流程中最易错的部分（跨 chunk 边界、单行解析失败、结束标记等）
//   - 组件级 E2E 行为通过功能验证（手动点击 / Playwright）

import { describe, it, expect } from "vitest";
import { parseNDJSONChunk, parseNDJSON } from "../lib/parse-ndjson";
import type { AnswerChunk } from "../components/LearnWizard";

describe("parse-ndjson: NDJSON 流解析", () => {
  it("完整单行解析", () => {
    const input = '{"questionId":"q1","answer":"A1"}\n';
    const { chunks, remaining } = parseNDJSONChunk<AnswerChunk>("", input);
    expect(chunks).toHaveLength(1);
    expect(chunks[0]).toEqual({ questionId: "q1", answer: "A1" });
    expect(remaining).toBe("");
  });

  it("多行一次性解析", () => {
    const input = [
      '{"questionId":"q1","answer":"A1"}',
      '{"questionId":"q2","answer":"A2"}',
      '{"questionId":"q3","answer":"A3","error":"超时"}',
      '{"done":true,"total":3}',
      "",
    ].join("\n");
    const { chunks, remaining } = parseNDJSONChunk<AnswerChunk>("", input);
    expect(chunks).toHaveLength(4);
    expect(chunks[0].questionId).toBe("q1");
    expect(chunks[2].error).toBe("超时");
    expect(chunks[3].done).toBe(true);
    expect(chunks[3].total).toBe(3);
    expect(remaining).toBe("");
  });

  it("跨 chunk 边界：行被切断", () => {
    // 模拟网络传输：第一 chunk 切到一半，第二 chunk 续上
    const chunk1 = '{"questionId":"q1","an';
    const chunk2 = 'swer":"A1"}\n{"questionId":"q2","answer":"A2"}\n';

    const first = parseNDJSONChunk<AnswerChunk>("", chunk1);
    expect(first.chunks).toHaveLength(0);
    expect(first.remaining).toBe('{"questionId":"q1","an');

    const second = parseNDJSONChunk<AnswerChunk>(first.remaining, chunk2);
    expect(second.chunks).toHaveLength(2);
    expect(second.chunks[0].answer).toBe("A1");
    expect(second.chunks[1].questionId).toBe("q2");
    expect(second.remaining).toBe("");
  });

  it("空行跳过，不产生 chunk", () => {
    const input = "\n\n  \n\t\n";
    const { chunks, remaining } = parseNDJSONChunk("", input);
    expect(chunks).toHaveLength(0);
    expect(remaining).toBe("");
  });

  it("单行 JSON 解析失败不影响后续行", () => {
    const input = [
      '{"questionId":"q1","answer":"A1"}',
      "this is not json",
      '{"questionId":"q2","answer":"A2"}',
    ].join("\n") + "\n";
    const { chunks } = parseNDJSONChunk<AnswerChunk>("", input);
    // 第一行成功、第二行失败跳过、第三行成功
    expect(chunks).toHaveLength(2);
    expect(chunks[0].questionId).toBe("q1");
    expect(chunks[1].questionId).toBe("q2");
  });

  it("多字节字符（中文）跨 chunk 不被切断", () => {
    // 中文字符在 UTF-8 中是多字节，但 TextDecoder 已经处理了字节边界
    // 这里测试的是解析器在拿到完整字符串后的行为
    const chunk1 = '{"questionId":"q1","answer":"结';
    const chunk2 = '论：性能优化"}\n';
    const first = parseNDJSONChunk<AnswerChunk>("", chunk1);
    expect(first.chunks).toHaveLength(0);
    const second = parseNDJSONChunk<AnswerChunk>(first.remaining, chunk2);
    expect(second.chunks).toHaveLength(1);
    expect(second.chunks[0].answer).toBe("结论：性能优化");
  });

  it("结束标记 done=true 时 questionId 可为空", () => {
    const input = '{"questionId":"","answer":"","done":true,"total":5}\n';
    const { chunks } = parseNDJSONChunk<AnswerChunk>("", input);
    expect(chunks).toHaveLength(1);
    expect(chunks[0].done).toBe(true);
    expect(chunks[0].total).toBe(5);
    expect(chunks[0].questionId).toBe("");
  });

  it("含 error 字段的失败 chunk", () => {
    const input =
      '{"questionId":"q1","answer":"","error":"LLM 调用超时"}\n';
    const { chunks } = parseNDJSONChunk<AnswerChunk>("", input);
    expect(chunks).toHaveLength(1);
    expect(chunks[0].error).toBe("LLM 调用超时");
    expect(chunks[0].answer).toBe("");
  });

  it("parseNDJSON 一次性解析（用于测试）", () => {
    const input = [
      '{"questionId":"q1","answer":"A1"}',
      '{"questionId":"q2","answer":"A2"}',
    ].join("\n");
    const chunks = parseNDJSON<AnswerChunk>(input);
    expect(chunks).toHaveLength(2);
    expect(chunks.map((c) => c.questionId)).toEqual(["q1", "q2"]);
  });

  it("无尾换行：最后一行作为 remaining 保留", () => {
    // 流未结束时的最后一行（无 \n）应该作为 remaining 留给下次
    const input = '{"questionId":"q1","answer":"A1"}';
    const { chunks, remaining } = parseNDJSONChunk<AnswerChunk>("", input);
    expect(chunks).toHaveLength(0);
    expect(remaining).toBe(input);
  });

  it("连续多次 feed 模拟真实流", () => {
    // 模拟真实网络流：4 次 read，每次返回部分数据
    const feeds = [
      '{"questionId":"q1","answ',
      'er":"A1"}\n{"questionId":"',
      'q2","answer":"A2"}\n{"questionId":"q3',
      '","answer":"A3","error":"超时"}\n',
    ];
    let buffer = "";
    const allChunks: AnswerChunk[] = [];
    for (const feed of feeds) {
      const parsed = parseNDJSONChunk<AnswerChunk>(buffer, feed);
      allChunks.push(...parsed.chunks);
      buffer = parsed.remaining;
    }
    // 流结束后处理残留 buffer
    if (buffer.trim()) {
      const parsed = parseNDJSONChunk<AnswerChunk>("", buffer + "\n");
      allChunks.push(...parsed.chunks);
    }
    expect(allChunks).toHaveLength(3);
    expect(allChunks[0]).toEqual({ questionId: "q1", answer: "A1" });
    expect(allChunks[1]).toEqual({ questionId: "q2", answer: "A2" });
    expect(allChunks[2]?.error).toBe("超时");
  });

  it("answer 字段可包含换行符（JSON 字符串内 \\n）", () => {
    // 答案是 markdown 文本，可能含 \n（JSON 中转义为 \\n）
    const input =
      '{"questionId":"q1","answer":"结论\\n\\n展开解释"}\n';
    const { chunks } = parseNDJSONChunk<AnswerChunk>("", input);
    expect(chunks).toHaveLength(1);
    expect(chunks[0].answer).toBe("结论\n\n展开解释");
  });
});

describe("LearnWizard AnswerChunk 契约（与 /api/learn/answers 一致）", () => {
  // 这一组测试是契约测试：确保前端解析与后端 /api/learn/answers/route.ts
  // 的输出格式严格匹配。后端改动输出格式时，这里必须同步修改。

  it("成功 chunk 字段：questionId + answer", () => {
    const sample = '{"questionId":"abc-123","answer":"这是答案"}\n';
    const { chunks } = parseNDJSONChunk<AnswerChunk>("", sample);
    expect(chunks[0]).toMatchObject({
      questionId: "abc-123",
      answer: "这是答案",
    });
  });

  it("结束 chunk 字段：done=true + total=N + 空 questionId", () => {
    const sample = '{"questionId":"","answer":"","done":true,"total":5}\n';
    const { chunks } = parseNDJSONChunk<AnswerChunk>("", sample);
    expect(chunks[0]).toMatchObject({
      questionId: "",
      answer: "",
      done: true,
      total: 5,
    });
  });

  it("错误 chunk 字段：questionId + answer 空串 + error", () => {
    const sample =
      '{"questionId":"q1","answer":"","error":"timeout"}\n';
    const { chunks } = parseNDJSONChunk<AnswerChunk>("", sample);
    expect(chunks[0]).toMatchObject({
      questionId: "q1",
      answer: "",
      error: "timeout",
    });
  });
});
