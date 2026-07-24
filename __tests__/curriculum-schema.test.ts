/**
 * curriculum/schema.ts 单元测试：结构校验规则
 */
import { describe, expect, it } from "vitest";

import {
  skillNodeSchema,
  sourceEntrySchema,
  sourceRegistrySchema,
  trackFileSchema,
  rubricFileSchema,
} from "@/lib/curriculum/schema";

const validNode = {
  id: "llm.tokens-and-context",
  title: "Token 与上下文",
  summary: "简介",
  tracks: ["frontend-to-ai-engineer"],
  phase: 0,
  prerequisites: [],
  estimatedMinutes: 90,
  difficulty: 2,
  frontendBridge: "bridge",
  concepts: ["token"],
  sourceIds: ["openai-docs", "python-docs"],
  gotchas: [],
  interview: [{ q: "q", answerSkeleton: "a", followups: ["f"] }],
  masteryCheck: { level: "V1", type: "fsrs-cards", description: "d" },
  status: "reviewed",
  lastVerified: "2026-07-24",
};

describe("skillNodeSchema", () => {
  it("接受合法节点", () => {
    expect(() => skillNodeSchema.parse(validNode)).not.toThrow();
  });

  it("拒绝非法 id 格式", () => {
    for (const bad of ["NoDot", "UPPER.case", "a..b", "1abc.x", "a.b c"]) {
      const result = skillNodeSchema.safeParse({ ...validNode, id: bad });
      expect(result.success).toBe(false);
    }
  });

  it("接受带连字符的层级 id", () => {
    const result = skillNodeSchema.safeParse({
      ...validNode,
      id: "llm-api.structured-output",
    });
    expect(result.success).toBe(true);
  });

  it("拒绝来源少于 2 条", () => {
    const result = skillNodeSchema.safeParse({
      ...validNode,
      sourceIds: ["openai-docs"],
    });
    expect(result.success).toBe(false);
  });

  it("拒绝非法难度", () => {
    for (const bad of [0, 6, 2.5]) {
      const result = skillNodeSchema.safeParse({ ...validNode, difficulty: bad });
      expect(result.success).toBe(false);
    }
  });

  it("拒绝非法日期格式", () => {
    const result = skillNodeSchema.safeParse({
      ...validNode,
      lastVerified: "2026/07/24",
    });
    expect(result.success).toBe(false);
  });

  it("拒绝空面试题", () => {
    const result = skillNodeSchema.safeParse({ ...validNode, interview: [] });
    expect(result.success).toBe(false);
  });

  it("拒绝没有追问的面试题", () => {
    const result = skillNodeSchema.safeParse({
      ...validNode,
      interview: [{ q: "q", answerSkeleton: "a", followups: [] }],
    });
    expect(result.success).toBe(false);
  });
});

describe("sourceEntrySchema", () => {
  const validSource = {
    id: "openai-docs",
    title: "OpenAI Docs",
    url: "https://platform.openai.com/docs",
    tier: "T0",
    type: "official-doc",
    lastVerified: "2026-07-20",
  };

  it("接受合法来源", () => {
    expect(() => sourceEntrySchema.parse(validSource)).not.toThrow();
  });

  it("拒绝非法 URL", () => {
    expect(
      sourceEntrySchema.safeParse({ ...validSource, url: "not-a-url" }).success,
    ).toBe(false);
  });

  it("拒绝未知等级", () => {
    expect(
      sourceEntrySchema.safeParse({ ...validSource, tier: "T9" }).success,
    ).toBe(false);
  });

  it("registry 至少包含一条来源", () => {
    expect(sourceRegistrySchema.safeParse({ sources: [] }).success).toBe(false);
    expect(
      sourceRegistrySchema.safeParse({ sources: [validSource] }).success,
    ).toBe(true);
  });
});

describe("trackFileSchema", () => {
  it("接受合法轨道", () => {
    const track = {
      track: {
        id: "frontend-to-ai-engineer",
        title: "t",
        description: "d",
        audience: "a",
        phases: [{ index: 0, title: "p0", goal: "g" }],
      },
    };
    expect(() => trackFileSchema.parse(track)).not.toThrow();
  });

  it("拒绝空阶段", () => {
    const track = {
      track: {
        id: "x",
        title: "t",
        description: "d",
        audience: "a",
        phases: [],
      },
    };
    expect(trackFileSchema.safeParse(track).success).toBe(false);
  });
});

describe("rubricFileSchema", () => {
  it("接受合法 Rubric", () => {
    const rubric = {
      rubric: {
        id: "r1",
        title: "t",
        passScore: 70,
        criteria: [{ id: "c1", description: "d", weight: 100 }],
      },
    };
    expect(() => rubricFileSchema.parse(rubric)).not.toThrow();
  });

  it("拒绝越界 passScore", () => {
    const rubric = {
      rubric: {
        id: "r1",
        title: "t",
        passScore: 101,
        criteria: [{ id: "c1", description: "d", weight: 100 }],
      },
    };
    expect(rubricFileSchema.safeParse(rubric).success).toBe(false);
  });
});
