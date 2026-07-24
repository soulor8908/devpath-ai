/**
 * curriculum/verification.ts 单元测试：掌握状态机、逐级递进、Rubric 评分
 */
import { describe, expect, it } from "vitest";

import {
  applyVerificationResult,
  canAttempt,
  deriveLockState,
  nextRequiredLevel,
  requiredLevels,
  scoreRubric,
  stateAfterPass,
  VerificationError,
  type MasteryState,
} from "@/lib/curriculum/verification";
import type { Rubric, SkillNode } from "@/lib/types/curriculum";

function makeNode(level: SkillNode["masteryCheck"]["level"]): SkillNode {
  return {
    id: "n.demo",
    title: "t",
    summary: "s",
    tracks: ["t1"],
    phase: 0,
    prerequisites: [],
    estimatedMinutes: 60,
    difficulty: 2,
    concepts: ["c"],
    sourceIds: ["s1", "s2"],
    gotchas: [],
    interview: [{ q: "q", answerSkeleton: "a", followups: ["f"] }],
    masteryCheck: { level, type: "fsrs-cards", description: "d" },
    status: "reviewed",
    lastVerified: "2026-07-24",
  };
}

describe("requiredLevels", () => {
  it("V1 节点只需 V1", () => {
    expect(requiredLevels(makeNode("V1"))).toEqual(["V1"]);
  });

  it("V3 节点需要 V1-V3 逐级通过", () => {
    expect(requiredLevels(makeNode("V3"))).toEqual(["V1", "V2", "V3"]);
  });
});

describe("stateAfterPass", () => {
  it("通过最高级验证即 mastered", () => {
    expect(stateAfterPass(makeNode("V1"), "V1")).toBe("mastered");
    expect(stateAfterPass(makeNode("V3"), "V3")).toBe("mastered");
  });

  it("通过中间级进入对应过渡态", () => {
    expect(stateAfterPass(makeNode("V3"), "V1")).toBe("v1_passed");
    expect(stateAfterPass(makeNode("V3"), "V2")).toBe("v2_passed");
  });

  it("节点不要求的验证等级直接报错", () => {
    expect(() => stateAfterPass(makeNode("V1"), "V3")).toThrow(
      VerificationError,
    );
  });
});

describe("canAttempt / nextRequiredLevel", () => {
  const node = makeNode("V3");

  it("locked/unlocked 不能做任何验证", () => {
    expect(canAttempt(node, "locked", "V1")).toBe(false);
    expect(canAttempt(node, "unlocked", "V1")).toBe(false);
  });

  it("learning 只能做 V1，逐级递进", () => {
    expect(canAttempt(node, "learning", "V1")).toBe(true);
    expect(canAttempt(node, "learning", "V2")).toBe(false);
    expect(nextRequiredLevel(node, "learning")).toBe("V1");
  });

  it("v1_passed 后只能做 V2", () => {
    expect(canAttempt(node, "v1_passed", "V2")).toBe(true);
    expect(canAttempt(node, "v1_passed", "V3")).toBe(false);
    expect(nextRequiredLevel(node, "v1_passed")).toBe("V2");
  });

  it("mastered 后无待办验证", () => {
    expect(nextRequiredLevel(node, "mastered")).toBeNull();
    expect(canAttempt(node, "mastered", "V1")).toBe(false);
  });
});

describe("applyVerificationResult", () => {
  const node = makeNode("V2");

  it("通过 V1 → v1_passed，再通过 V2 → mastered", () => {
    let state: MasteryState = "learning";
    state = applyVerificationResult(node, state, "V1", true);
    expect(state).toBe("v1_passed");
    state = applyVerificationResult(node, state, "V2", true);
    expect(state).toBe("mastered");
  });

  it("unlocked 状态首次验证视为开始学习", () => {
    expect(applyVerificationResult(node, "unlocked", "V1", true)).toBe(
      "v1_passed",
    );
  });

  it("跳级验证抛错", () => {
    expect(() =>
      applyVerificationResult(node, "learning", "V2", true),
    ).toThrow(VerificationError);
  });

  it("失败不回退已通过等级", () => {
    expect(applyVerificationResult(node, "v1_passed", "V2", false)).toBe(
      "v1_passed",
    );
  });

  it("unlocked 失败转为 learning", () => {
    expect(applyVerificationResult(node, "unlocked", "V1", false)).toBe(
      "learning",
    );
  });
});

describe("deriveLockState", () => {
  it("前置全部 mastered 才解锁", () => {
    const node = makeNode("V1");
    node.prerequisites = ["n.pre1", "n.pre2"];
    const states = new Map<string, MasteryState>([
      ["n.pre1", "mastered"],
      ["n.pre2", "v2_passed"],
    ]);
    expect(deriveLockState(node, states)).toBe("locked");
    states.set("n.pre2", "mastered");
    expect(deriveLockState(node, states)).toBe("unlocked");
  });

  it("无前置直接解锁", () => {
    expect(deriveLockState(makeNode("V1"), new Map())).toBe("unlocked");
  });
});

describe("scoreRubric", () => {
  const rubric: Rubric = {
    id: "r1",
    title: "t",
    passScore: 70,
    criteria: [
      { id: "a", description: "d", weight: 50 },
      { id: "b", description: "d", weight: 30 },
      { id: "c", description: "d", weight: 20 },
    ],
  };

  it("加权求分并判定通过", () => {
    const { total, passed } = scoreRubric(rubric, { a: 80, b: 60, c: 100 });
    expect(total).toBe(80 * 0.5 + 60 * 0.3 + 100 * 0.2);
    expect(passed).toBe(true);
  });

  it("低于通过线则不通过", () => {
    const { passed } = scoreRubric(rubric, { a: 50, b: 50, c: 50 });
    expect(passed).toBe(false);
  });

  it("缺少评分项抛错", () => {
    expect(() => scoreRubric(rubric, { a: 80, b: 60 })).toThrow(
      VerificationError,
    );
  });

  it("评分越界抛错", () => {
    expect(() => scoreRubric(rubric, { a: 101, b: 60, c: 50 })).toThrow(
      /越界/,
    );
  });
});
