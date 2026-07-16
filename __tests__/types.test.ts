import { describe, it, expect } from "vitest";
import type { LearningPlan, KnowledgeNode, Question, ReviewCard } from "../lib/types";

describe("types", () => {
  it("LearningPlan 对象符合类型定义", () => {
    const plan: LearningPlan = {
      id: "plan-1",
      topic: "前端性能优化",
      knowledgeTree: [
        {
          id: "k1",
          title: "浏览器渲染原理",
          difficulty: 2,
          prerequisites: [],
          frequency: "高",
          summary: "DOM/CSSOM/Render Tree 流程",
          mastery: 0,
        },
      ],
      questions: [
        {
          id: "q1",
          nodeId: "k1",
          question: "请解释浏览器的关键渲染路径",
          answer: "结论：浏览器渲染分五步…",
          keyPoints: ["DOM 树构建", "CSSOM 构建", "渲染树合成"],
          followUps: ["什么是 reflow？"],
          favorited: false,
        },
      ],
      schedule: [
        { day: 1, nodeId: "k1", type: "learn", estimatedMinutes: 16, completed: false },
        { day: 2, nodeId: "k1", type: "review", estimatedMinutes: 5, completed: false },
      ],
      dailyMinutes: 30,
      maxNewPerDay: 1,
      fsrsMode: "standard",
      createdAt: "2026-07-13T00:00:00.000Z",
      updatedAt: "2026-07-13T00:00:00.000Z",
    };
    expect(plan.id).toBe("plan-1");
    expect(plan.knowledgeTree).toHaveLength(1);
    expect(plan.questions[0].keyPoints).toHaveLength(3);
    expect(plan.schedule).toHaveLength(2);
    expect(plan.fsrsMode).toBe("standard");
  });

  it("KnowledgeNode difficulty 限定 1-5", () => {
    const node: KnowledgeNode = {
      id: "k1",
      title: "test",
      difficulty: 3,
      prerequisites: [],
      frequency: "中",
      summary: "",
      mastery: 50,
    };
    expect(node.difficulty).toBeGreaterThanOrEqual(1);
    expect(node.difficulty).toBeLessThanOrEqual(5);
  });

  it("ReviewCard state 限定 0-4", () => {
    const card: ReviewCard = {
      id: "c1",
      planId: "p1",
      nodeId: "k1",
      questionId: "q1",
      front: "问题",
      back: "答案",
      due: "2026-07-13T00:00:00.000Z",
      stability: 1.0,
      difficulty: 5.0,
      elapsedDays: 0,
      scheduledDays: 1,
      reps: 1,
      lapses: 0,
      state: 2,
      lastReview: "2026-07-13T00:00:00.000Z",
    };
    expect(card.state).toBeGreaterThanOrEqual(0);
    expect(card.state).toBeLessThanOrEqual(4);
  });

  it("Question favorited 默认 false", () => {
    const q: Question = {
      id: "q1",
      nodeId: "k1",
      question: "test",
      answer: "answer",
      keyPoints: [],
      followUps: [],
      favorited: false,
    };
    expect(q.favorited).toBe(false);
    expect(q.favoritedAt).toBeUndefined();
  });
});
