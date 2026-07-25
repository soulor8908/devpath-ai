// __tests__/preset-content-quality.test.ts
// 预置知识库内容质量门禁测试
//
// 这是「内容不再贫血」的 CI 执法者（卡帕西视角）：
//   - 测试即文档：每条规则都有对应的测试断言
//   - CI 即评审：任何人改 preset 内容都会被自动拦截
//
// 守护内容（对应 docs/TODO.md 第 2 项）：
//   1. 答案最小长度阈值（防严重残缺，与 audit-presets.ts 的 FLAG_ANSWER_MIN 对齐）
//   2. keyPoints / followUps 必填（防裸答案）
//   3. 无占位符（TODO / 待补充 / lorem / FIXME 等）
//   4. nodeId 引用有效（防孤儿题）
//   5. 题目 id 唯一、题面不重复（防拷贝粘贴污染）
//
// 阈值说明：
//   - 全局硬阈值 = 80 字符（audit-presets.ts 的「严重残缺」线）
//   - 当前所有 preset 均通过此阈值（最低 min=193，见 algorithm-200）
//   - 300 字符的「浅薄」线由 audit-presets.ts 手动体检追踪，不进 CI 硬门禁
//   - 这样既能防极端贫血，又不会因 algorithm-200 的 25 条 < 300 题目让 CI red
//
// 渐进收紧策略：
//   - 当所有 preset 的 min 都 >= 150 时，可将阈值提升到 150
//   - 当所有 preset 的 min 都 >= 300 时，可将阈值提升到 300（与浅薄线对齐）

import { describe, it, expect } from "vitest";

import { PRESETS } from "@/lib/presets";

// ============ 阈值与占位符清单 ============

/** 答案最小字符数（与 audit-presets.ts 的 FLAG_ANSWER_MIN 对齐） */
const MIN_ANSWER_LENGTH = 80;

/**
 * 占位符黑名单（大小写不敏感）：
 * 任何 preset 的任何字段出现这些词都视为未完成的占位内容。
 * 命中即失败，杜绝「TODO: 待补充」「lorem ipsum」混进生产内容。
 *
 * 设计原则（卡帕西视角）：
 *   - 只匹配「明确的未完成标记」，避免误伤合法技术术语
 *   - 「待补充 / 待填充 / 待完善」是中文里明确的"未完成"信号
 *   - 「TODO: / FIXME:」带冒号是代码注释里通用的未完成标记
 *   - 「lorem ipsum」是经典的占位文本
 *   - 不匹配单独的「xxx / 占位 / placeholder / todo」——它们在技术内容里有合法用法
 *     （如 HTML placeholder 属性、CSS Modules hash 后缀 _x8y2k、Prompt 模板占位符讨论、
 *      TanStack Query 的 staleTime 等）
 */
const PLACEHOLDER_PATTERNS = [
  "待补充",
  "待填充",
  "待完善",
  "todo:",
  "todo：",
  "fixme:",
  "fixme：",
  "lorem ipsum",
  "tbd:",
  "tbd：",
] as const;

/** 需要扫描占位符的字段类型 */
interface FieldToScan {
  field: string;
  value: string;
}

// ============ 辅助函数 ============

/** 在字符串中查找占位符，命中则返回该占位符，否则返回 null */
function findPlaceholder(text: string): string | null {
  const lower = text.toLowerCase();
  for (const p of PLACEHOLDER_PATTERNS) {
    if (lower.includes(p)) return p;
  }
  return null;
}

/** 收集一道题的所有可扫描文本字段 */
function collectQuestionFields(q: (typeof PRESETS)[number]["questions"][number]): FieldToScan[] {
  return [
    { field: "question", value: q.question },
    { field: "answer", value: q.answer },
    ...q.keyPoints.map((kp, i) => ({ field: `keyPoints[${i}]`, value: kp })),
    ...q.followUps.map((fu, i) => ({ field: `followUps[${i}]`, value: fu })),
  ];
}

// ============ 测试 ============

describe("preset 内容质量门禁", () => {
  describe("答案最小长度阈值", () => {
    it(`每道题答案 >= ${MIN_ANSWER_LENGTH} 字符（防严重残缺）`, () => {
      const offenders: string[] = [];
      for (const preset of PRESETS) {
        for (const q of preset.questions) {
          if (q.answer.length < MIN_ANSWER_LENGTH) {
            offenders.push(
              `${preset.id}/${q.id}: ${q.answer.length} 字符`,
            );
          }
        }
      }
      expect(offenders).toEqual([]);
    });

    it("答案非空且去除空白后仍有内容", () => {
      for (const preset of PRESETS) {
        for (const q of preset.questions) {
          expect(q.answer.trim().length).toBeGreaterThan(0);
        }
      }
    });
  });

  describe("keyPoints / followUps 必填", () => {
    it("每道题至少 1 条 keyPoint", () => {
      const offenders: string[] = [];
      for (const preset of PRESETS) {
        for (const q of preset.questions) {
          if (q.keyPoints.length === 0) {
            offenders.push(`${preset.id}/${q.id}`);
          }
        }
      }
      expect(offenders).toEqual([]);
    });

    it("每道题至少 1 条 followUp", () => {
      const offenders: string[] = [];
      for (const preset of PRESETS) {
        for (const q of preset.questions) {
          if (q.followUps.length === 0) {
            offenders.push(`${preset.id}/${q.id}`);
          }
        }
      }
      expect(offenders).toEqual([]);
    });

    it("keyPoints / followUps 每条非空且去空白后仍有内容", () => {
      for (const preset of PRESETS) {
        for (const q of preset.questions) {
          for (const kp of q.keyPoints) {
            expect(kp.trim().length).toBeGreaterThan(0);
          }
          for (const fu of q.followUps) {
            expect(fu.trim().length).toBeGreaterThan(0);
          }
        }
      }
    });
  });

  describe("无占位符", () => {
    it("题目、答案、keyPoints、followUps 均不含占位符", () => {
      const offenders: string[] = [];
      for (const preset of PRESETS) {
        for (const q of preset.questions) {
          for (const { field, value } of collectQuestionFields(q)) {
            const hit = findPlaceholder(value);
            if (hit) {
              offenders.push(
                `${preset.id}/${q.id}.${field}: 命中 "${hit}"`,
              );
            }
          }
        }
      }
      expect(offenders).toEqual([]);
    });
  });

  describe("nodeId 引用有效", () => {
    it("每道题的 nodeId 都存在于该 preset 的知识树", () => {
      const offenders: string[] = [];
      for (const preset of PRESETS) {
        const treeIds = new Set(preset.knowledgeTree.map((n) => n.id));
        for (const q of preset.questions) {
          if (!treeIds.has(q.nodeId)) {
            offenders.push(`${preset.id}/${q.id} → nodeId "${q.nodeId}"`);
          }
        }
      }
      expect(offenders).toEqual([]);
    });
  });

  describe("题目 id 唯一", () => {
    it("每个 preset 内题目 id 全局唯一", () => {
      for (const preset of PRESETS) {
        const ids = preset.questions.map((q) => q.id);
        const unique = new Set(ids);
        expect(unique.size).toBe(ids.length);
      }
    });

    it("跨 preset 题目 id 也唯一（防 id 冲突污染收藏/复习）", () => {
      const allIds: string[] = [];
      for (const preset of PRESETS) {
        allIds.push(...preset.questions.map((q) => q.id));
      }
      const unique = new Set(allIds);
      expect(unique.size).toBe(allIds.length);
    });
  });

  describe("题面不重复", () => {
    it("每个 preset 内题面不重复（trim + 大小写不敏感）", () => {
      for (const preset of PRESETS) {
        const seen = new Map<string, number>();
        for (const q of preset.questions) {
          const key = q.question.trim().toLowerCase();
          seen.set(key, (seen.get(key) ?? 0) + 1);
        }
        const dupes = [...seen.entries()].filter(([, c]) => c > 1);
        expect(dupes).toEqual([]);
      }
    });
  });

  describe("知识树节点引用闭环", () => {
    it("知识树节点的 prerequisites 在全局节点集中存在或为跨轨道前置", () => {
      // 跨 preset 的全局节点 id 集合（允许跨轨道引用前置）
      const globalNodeIds = new Set<string>();
      for (const preset of PRESETS) {
        for (const n of preset.knowledgeTree) {
          globalNodeIds.add(n.id);
        }
      }
      // 策展轨道（frontend-to-ai-engineer）的前置可能是同轨道或外部节点
      const offenders: string[] = [];
      for (const preset of PRESETS) {
        const localIds = new Set(preset.knowledgeTree.map((n) => n.id));
        for (const n of preset.knowledgeTree) {
          for (const pre of n.prerequisites) {
            // 本地存在 OR 全局存在（跨轨道）才合法
            if (!localIds.has(pre) && !globalNodeIds.has(pre)) {
              offenders.push(`${preset.id}/${n.id} → prereq "${pre}"`);
            }
          }
        }
      }
      expect(offenders).toEqual([]);
    });
  });
});
