import type {
  Rubric,
  SkillNode,
  VerificationLevel,
} from "@/lib/types/curriculum";

/**
 * L3 验证层：能力验证状态机。
 *
 * 第一性原理：反馈回路必须快且客观。掌握与否不来自自评，
 * 而来自可执行验证的通过记录。状态机保证验证按 V1→V4 逐级递进，
 * 不允许跳级（没写过代码不能算「能构建」）。
 */

/** 节点掌握状态（递进式） */
export type MasteryState =
  | "locked" // 前置未完成，不可学
  | "unlocked" // 可学，尚未开始
  | "learning" // 学习中
  | "v1_passed" // 通过理解验证（FSRS）
  | "v2_passed" // 通过应用验证（代码题）
  | "v3_passed" // 通过构建验证（项目检查点）
  | "mastered"; // 通过该节点要求的最高级验证

export const LEVEL_ORDER: VerificationLevel[] = ["V1", "V2", "V3", "V4"];

const STATE_RANK: Record<MasteryState, number> = {
  locked: -1,
  unlocked: 0,
  learning: 1,
  v1_passed: 2,
  v2_passed: 3,
  v3_passed: 4,
  mastered: 5,
};

export function isMasteryState(value: string): value is MasteryState {
  return value in STATE_RANK;
}

/**
 * 节点要求的验证链：从 V1 到节点 masteryCheck.level 的连续序列。
 * 例如 masteryCheck.level = V2 → ["V1", "V2"]
 */
export function requiredLevels(node: SkillNode): VerificationLevel[] {
  const top = LEVEL_ORDER.indexOf(node.masteryCheck.level);
  return LEVEL_ORDER.slice(0, top + 1);
}

/** 某级验证通过后对应的掌握状态 */
export function stateAfterPass(
  node: SkillNode,
  level: VerificationLevel,
): MasteryState {
  const required = requiredLevels(node);
  if (!required.includes(level)) {
    throw new VerificationError(
      `节点 ${node.id} 不要求 ${level} 级验证（要求到 ${node.masteryCheck.level} 为止）`,
    );
  }
  if (level === node.masteryCheck.level) return "mastered";
  if (level === "V1") return required.includes("V2") ? "v1_passed" : "mastered";
  if (level === "V2") return required.includes("V3") ? "v2_passed" : "mastered";
  return "v3_passed";
}

export class VerificationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "VerificationError";
  }
}

/** 判断某级验证在当前状态下是否可执行（必须逐级递进） */
export function canAttempt(
  node: SkillNode,
  state: MasteryState,
  level: VerificationLevel,
): boolean {
  if (state === "locked" || state === "unlocked") return false;
  const required = requiredLevels(node);
  if (!required.includes(level)) return false;
  const expected = nextRequiredLevel(node, state);
  return expected === level;
}

/** 当前状态下，下一级待通过的验证 */
export function nextRequiredLevel(
  node: SkillNode,
  state: MasteryState,
): VerificationLevel | null {
  if (state === "mastered") return null;
  const required = requiredLevels(node);
  const passedCount =
    state === "v1_passed" ? 1 : state === "v2_passed" ? 2 : state === "v3_passed" ? 3 : 0;
  return required[passedCount] ?? null;
}

/** 应用一次验证结果，返回新状态（不允许跳级） */
export function applyVerificationResult(
  node: SkillNode,
  state: MasteryState,
  level: VerificationLevel,
  passed: boolean,
): MasteryState {
  if (!passed) {
    // 失败不回退已通过等级，只停留在原状态（但必须已开始学习）
    return state === "unlocked" ? "learning" : state;
  }
  if (!canAttempt(node, state === "unlocked" ? "learning" : state, level)) {
    throw new VerificationError(
      `节点 ${node.id} 当前状态 ${state} 不能进行 ${level} 验证，` +
        `下一级应为 ${nextRequiredLevel(node, state === "unlocked" ? "learning" : state) ?? "无"}`,
    );
  }
  return stateAfterPass(node, level);
}

/** 前置全部 mastered 时节点解锁 */
export function deriveLockState(
  node: SkillNode,
  stateByNodeId: ReadonlyMap<string, MasteryState>,
): "locked" | "unlocked" {
  for (const pre of node.prerequisites) {
    if (stateByNodeId.get(pre) !== "mastered") return "locked";
  }
  return "unlocked";
}

/**
 * Rubric 加权评分：返回 0-100 的总分与是否通过。
 * scores 必须覆盖 Rubric 全部 criteria，每档得分 0-100。
 */
export function scoreRubric(
  rubric: Rubric,
  scores: Record<string, number>,
): { total: number; passed: boolean } {
  let total = 0;
  for (const criterion of rubric.criteria) {
    const raw = scores[criterion.id];
    if (raw === undefined) {
      throw new VerificationError(
        `Rubric ${rubric.id} 缺少评分项: ${criterion.id}`,
      );
    }
    if (raw < 0 || raw > 100) {
      throw new VerificationError(
        `Rubric ${rubric.id} 评分项 ${criterion.id} 得分越界: ${raw}（必须 0-100）`,
      );
    }
    total += (raw * criterion.weight) / 100;
  }
  const rounded = Math.round(total * 100) / 100;
  return { total: rounded, passed: rounded >= rubric.passScore };
}
