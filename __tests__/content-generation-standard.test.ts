// __tests__/content-generation-standard.test.ts
// AI 内容生成质量宪章守护测试
//
// 对应 docs/content-generation-standard.md —— 这是"AI 为生成内容负责"的 CI 执法者：
//   - 内容生成 prompt 必须注入规范约束（删约束 = 本测试失败 = CI red）
//   - 与 prompts.test.ts 指纹快照分工：快照管"改动留痕"，本测试管"约束在位"
//
// 守护内容：
//   1. 产答案的 prompt（question_generate / answer_generate）必须包含四段式宪章关键标记
//   2. 产题干的 prompt（question_stem_generate / question_generate）必须包含角度约束
//   3. 知识树拆解 prompt（knowledge_decompose）必须包含正确性/完整性约束
//   4. 任何未来新增的内容生成入口不得绕过（人工评审兜底）

import { describe, it, expect } from "vitest";

import { PROMPTS } from "../lib/ai/prompts";

/** 答案四段式宪章的关键标记（对应规范第 4.1 节） */
const ANSWER_CHARTER_MARKERS = [
  "结论与原理",
  "实战案例",
  "举一反三",
  "扣分点对照",
] as const;

/** 答案反模式约束的关键标记（对应规范第 4.2 节） */
const ANSWER_ANTI_PATTERN_MARKERS = ["量化", "禁止"] as const;

/** 题目角度约束的关键标记（对应规范第 3.1 节） */
const QUESTION_ANGLE_MARKERS = [
  "概念辨析",
  "原理深挖",
  "实战设计",
  "踩坑对比",
] as const;

describe("AI 内容生成质量宪章守护", () => {
  describe("产答案的 prompt 必须注入四段式宪章", () => {
    for (const id of ["question_generate", "answer_generate"] as const) {
      it(`${id} 包含四段式结构标记`, () => {
        for (const marker of ANSWER_CHARTER_MARKERS) {
          expect(
            PROMPTS[id].system,
            `${id}.system 缺少四段式标记「${marker}」——` +
              `答案质量宪章被移除或削弱，见 docs/content-generation-standard.md 第 4 节`,
          ).toContain(marker);
        }
      });

      it(`${id} 包含量化与反模式约束`, () => {
        for (const marker of ANSWER_ANTI_PATTERN_MARKERS) {
          expect(
            PROMPTS[id].system,
            `${id}.system 缺少约束标记「${marker}」`,
          ).toContain(marker);
        }
      });
    }
  });

  describe("产题干的 prompt 必须注入角度约束", () => {
    for (const id of ["question_generate", "question_stem_generate"] as const) {
      it(`${id} 包含四角度约束`, () => {
        for (const marker of QUESTION_ANGLE_MARKERS) {
          expect(
            PROMPTS[id].system,
            `${id}.system 缺少角度标记「${marker}」——` +
              `题目角度约束被移除，见 docs/content-generation-standard.md 第 3 节`,
          ).toContain(marker);
        }
      });

      it(`${id} 禁止泛泛题`, () => {
        expect(PROMPTS[id].system).toContain("泛泛题");
      });
    }
  });

  describe("知识树拆解 prompt 必须注入正确性/完整性约束", () => {
    it("knowledge_decompose 包含正确性约束（反编造 + 经验值带前提）", () => {
      const s = PROMPTS.knowledge_decompose.system;
      expect(s).toContain("正确性");
      expect(s).toContain("适用条件");
    });

    it("knowledge_decompose 包含完整性约束（考点覆盖 + 依赖闭环）", () => {
      const s = PROMPTS.knowledge_decompose.system;
      expect(s).toContain("完整性");
      expect(s).toContain("闭环");
    });
  });
});
