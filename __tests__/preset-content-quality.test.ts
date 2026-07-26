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
//   - 全局硬阈值 = 500 字符（与 audit-presets.ts 的「浅薄」线 FLAG_ANSWER_SHORT 对齐）
//   - 2026-07-26 收紧：5 个工程师 preset 完成深度扩充 + algorithm-200 重写 69 条弱答案后，
//     全部 1332 道题答案均 >= 500 字符，阈值从 80（防严重残缺）提升到 500（防浅薄）
//   - 这意味着任何新提交的预置题答案必须有思路推导 + 代码 + 案例 + 变体的完整深度
//
// 渐进收紧策略（已完成）：
//   - 80 → 500：2026-07-26 完成，与「浅薄」线对齐，audit 与 CI 双闸门同一标准

import { describe, it, expect } from "vitest";

import { PRESET_METAS, type PresetMeta } from "@/lib/presets";
import { FRONTEND_TO_AI_ENGINEER_PRESET } from "@/lib/presets/frontend-to-ai-engineer";
import { ALGORITHM_200_PRESET } from "@/lib/presets/algorithm-200";
import { FRONTEND_PRESET } from "@/lib/presets/frontend";
import { BACKEND_PRESET } from "@/lib/presets/backend";
import { AI_PRESET } from "@/lib/presets/ai";
import { LLM_APP_PRESET } from "@/lib/presets/llm-app";

// preset 数据改为运行时 fetch JSON 后（v3，修复 Worker bundle > 3MB 部署失败），
// 测试直接 import TS 源模块：保证类型安全 + 校验源码内容（而非 fetch 产物）。
// 测试只在 vitest（Node 环境）跑，不进客户端 bundle，不影响部署。
const PRESET_DATA_RECORD: Record<string, Omit<PresetMeta, keyof typeof PRESET_METAS[number]>> = {
  "frontend-to-ai-engineer": FRONTEND_TO_AI_ENGINEER_PRESET,
  "algorithm-200": ALGORITHM_200_PRESET,
  frontend: FRONTEND_PRESET,
  backend: BACKEND_PRESET,
  ai: AI_PRESET,
  "llm-app": LLM_APP_PRESET,
};

const presets: PresetMeta[] = PRESET_METAS.map((meta) => {
  const data = PRESET_DATA_RECORD[meta.id];
  if (!data) throw new Error(`preset ${meta.id} 缺少源数据`);
  return { ...meta, ...data };
});

if (presets.length !== PRESET_METAS.length) {
  throw new Error(
    `preset 加载不全：期望 ${PRESET_METAS.length} 个，实际 ${presets.length} 个`,
  );
}

// ============ 阈值与占位符清单 ============

/** 答案最小字符数（与 audit-presets.ts 的 FLAG_ANSWER_SHORT「浅薄」线对齐） */
const MIN_ANSWER_LENGTH = 500;

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
function collectQuestionFields(q: PresetMeta["questions"][number]): FieldToScan[] {
  return [
    { field: "question", value: q.question },
    { field: "answer", value: q.answer },
    ...q.keyPoints.map((kp: string, i: number) => ({ field: `keyPoints[${i}]`, value: kp })),
    ...q.followUps.map((fu: string, i: number) => ({ field: `followUps[${i}]`, value: fu })),
  ];
}

// ============ 测试 ============

describe("preset 内容质量门禁", () => {
  describe("答案最小长度阈值", () => {
    it(`每道题答案 >= ${MIN_ANSWER_LENGTH} 字符（防浅薄，与 audit 浅薄线对齐）`, () => {
      const offenders: string[] = [];
      for (const preset of presets) {
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
      for (const preset of presets) {
        for (const q of preset.questions) {
          expect(q.answer.trim().length).toBeGreaterThan(0);
        }
      }
    });
  });

  describe("keyPoints / followUps 必填", () => {
    it("每道题至少 1 条 keyPoint", () => {
      const offenders: string[] = [];
      for (const preset of presets) {
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
      for (const preset of presets) {
        for (const q of preset.questions) {
          if (q.followUps.length === 0) {
            offenders.push(`${preset.id}/${q.id}`);
          }
        }
      }
      expect(offenders).toEqual([]);
    });

    it("keyPoints / followUps 每条非空且去空白后仍有内容", () => {
      for (const preset of presets) {
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
      for (const preset of presets) {
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
      for (const preset of presets) {
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
      for (const preset of presets) {
        const ids = preset.questions.map((q) => q.id);
        const unique = new Set(ids);
        expect(unique.size).toBe(ids.length);
      }
    });

    it("跨 preset 题目 id 也唯一（防 id 冲突污染收藏/复习）", () => {
      const allIds: string[] = [];
      for (const preset of presets) {
        allIds.push(...preset.questions.map((q) => q.id));
      }
      const unique = new Set(allIds);
      expect(unique.size).toBe(allIds.length);
    });
  });

  describe("题面不重复", () => {
    it("每个 preset 内题面不重复（trim + 大小写不敏感）", () => {
      for (const preset of presets) {
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
      for (const preset of presets) {
        for (const n of preset.knowledgeTree) {
          globalNodeIds.add(n.id);
        }
      }
      // 策展轨道（frontend-to-ai-engineer）的前置可能是同轨道或外部节点
      const offenders: string[] = [];
      for (const preset of presets) {
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

  // ============ 深度字段达标校验（v4 引入，修复"学习路径浮于表面"投诉） ============
  //
  // 策略（卡帕西视角，渐进收紧）：
  //   - 字段全部可选：现有手工 preset（frontend/backend/llm-app/ai）的旧节点不带这些字段
  //     也能编译通过，避免一次性让几千道题 CI red
  //   - 但只要节点"带了"深度字段，就必须达标——防止"凑数式"深度字段蒙混过关
  //   - AI 新生成的节点（knowledge_decompose v4）会自带这些字段，自动受守护
  //   - 后续手工补全 preset 时，逐个节点补字段即可逐个达标，无需一次性重写
  describe("深度字段达标（v4，节点若带深度字段必须达标）", () => {
    it("coreMechanism 若存在，长度 >= 50 字符且不含占位符", () => {
      const offenders: string[] = [];
      for (const preset of presets) {
        for (const n of preset.knowledgeTree) {
          const cm = n.coreMechanism;
          if (cm === undefined) continue; // 可选字段，未提供不报错
          if (cm.trim().length < 50) {
            offenders.push(
              `${preset.id}/${n.id}.coreMechanism: ${cm.trim().length} 字符（< 50，过短不像机制深挖）`,
            );
          }
          const hit = findPlaceholder(cm);
          if (hit) {
            offenders.push(`${preset.id}/${n.id}.coreMechanism: 命中 "${hit}"`);
          }
        }
      }
      expect(offenders).toEqual([]);
    });

    it("commonPitfalls 若存在，至少 2 条且每条带具体场景（>= 10 字符）", () => {
      const offenders: string[] = [];
      for (const preset of presets) {
        for (const n of preset.knowledgeTree) {
          const cp = n.commonPitfalls;
          if (cp === undefined) continue;
          if (cp.length < 2) {
            offenders.push(
              `${preset.id}/${n.id}.commonPitfalls: 仅 ${cp.length} 条（< 2，不够覆盖高频踩坑）`,
            );
          }
          for (let i = 0; i < cp.length; i++) {
            if (cp[i].trim().length < 10) {
              offenders.push(
                `${preset.id}/${n.id}.commonPitfalls[${i}]: "${cp[i]}"（< 10 字符，无场景无修复方向）`,
              );
            }
            const hit = findPlaceholder(cp[i]);
            if (hit) {
              offenders.push(
                `${preset.id}/${n.id}.commonPitfalls[${i}]: 命中 "${hit}"`,
              );
            }
          }
        }
      }
      expect(offenders).toEqual([]);
    });

    it("interviewAngles 若存在，必须正好 4 条（对应四角度）且每条非空", () => {
      const offenders: string[] = [];
      for (const preset of presets) {
        for (const n of preset.knowledgeTree) {
          const ia = n.interviewAngles;
          if (ia === undefined) continue;
          if (ia.length !== 4) {
            offenders.push(
              `${preset.id}/${n.id}.interviewAngles: ${ia.length} 条（应为 4 条，对应概念辨析/原理深挖/实战设计/踩坑对比）`,
            );
          }
          for (let i = 0; i < ia.length; i++) {
            if (ia[i].trim().length === 0) {
              offenders.push(`${preset.id}/${n.id}.interviewAngles[${i}]: 空`);
            }
            const hit = findPlaceholder(ia[i]);
            if (hit) {
              offenders.push(
                `${preset.id}/${n.id}.interviewAngles[${i}]: 命中 "${hit}"`,
              );
            }
          }
        }
      }
      expect(offenders).toEqual([]);
    });

    it("sourceHint 若存在，长度 >= 5 字符且不含占位符", () => {
      const offenders: string[] = [];
      for (const preset of presets) {
        for (const n of preset.knowledgeTree) {
          const sh = n.sourceHint;
          if (sh === undefined) continue;
          if (sh.trim().length < 5) {
            offenders.push(
              `${preset.id}/${n.id}.sourceHint: "${sh}"（< 5 字符，无来源指向）`,
            );
          }
          const hit = findPlaceholder(sh);
          if (hit) {
            offenders.push(`${preset.id}/${n.id}.sourceHint: 命中 "${hit}"`);
          }
        }
      }
      expect(offenders).toEqual([]);
    });

    it("深度字段一致性：要么 4 个字段都带，要么都不带（防'凑数式'部分补充）", () => {
      const DEPTH_FIELDS = [
        "coreMechanism",
        "commonPitfalls",
        "interviewAngles",
        "sourceHint",
      ] as const;
      const offenders: string[] = [];
      for (const preset of presets) {
        for (const n of preset.knowledgeTree) {
          const present = DEPTH_FIELDS.filter((f) => n[f] !== undefined).length;
          // 允许 0 个（旧节点）或 4 个（完整深度节点），不允许 1-3 个（凑数）
          if (present !== 0 && present !== 4) {
            offenders.push(
              `${preset.id}/${n.id}: 仅 ${present}/4 个深度字段（应 0 或 4，部分补充是凑数）`,
            );
          }
        }
      }
      expect(offenders).toEqual([]);
    });
  });
});
