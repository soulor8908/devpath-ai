// lib/curriculum/mastery-store.ts
// 课程节点掌握状态的 IndexedDB 存储层（L3 验证层的运行时持久化）
//
// 对应 lib/curriculum/verification.ts 的 MasteryState 状态机：
//   - 状态机本身是纯函数（计算"通过某级后该是什么状态"）
//   - 本模块负责把状态记录落盘 + 读取 + 应用验证结果
//
// 存储模型：mastery_state:<nodeId> → MasteryStateRecord
//   - 一个节点一条记录（含 state + 各级验证历史）
//   - 跨设备同步：已加入 SYNC_PREFIXES（lib/sync.ts）

import { nanoid } from "nanoid";

import { getItem, setItem, listItems } from "@/lib/storage/db";
import { KEY_PREFIXES } from "@/lib/types/constants";
import { nowISO } from "@/lib/time";
import type { SkillNode, VerificationLevel } from "@/lib/types/curriculum";
import {
  applyVerificationResult,
  canAttempt,
  type MasteryState,
  nextRequiredLevel,
} from "@/lib/curriculum/verification";

/** 单次验证尝试的记录（成功或失败均落盘，便于回溯） */
export interface VerificationAttempt {
  id: string;
  level: VerificationLevel;
  passed: boolean;
  /** 0-100，V3/V4 项目评审的加权总分；V1/V2 可为分项得分聚合 */
  score?: number;
  /** AI 评审反馈（V3）或失败原因 */
  feedback?: string;
  /** 关联的提交内容 id（V3 的 projectReviewId / V4 的 portfolioEntryId） */
  artifactId?: string;
  attemptedAt: string;
}

/** 节点掌握状态记录（mastery_state:<nodeId>） */
export interface MasteryStateRecord {
  nodeId: string;
  state: MasteryState;
  /** 历次验证尝试（按时间倒序，最新在前） */
  attempts: VerificationAttempt[];
  updatedAt: string;
}

function keyFor(nodeId: string): string {
  return KEY_PREFIXES.MASTERY_STATE + nodeId;
}

/** 读取节点掌握状态，不存在返回初始 unlocked */
export async function getMasteryState(
  nodeId: string,
): Promise<MasteryStateRecord> {
  const existing = await getItem<MasteryStateRecord>(keyFor(nodeId));
  if (existing) return existing;
  return {
    nodeId,
    state: "unlocked",
    attempts: [],
    updatedAt: nowISO(),
  };
}

/** 批量读取多节点状态（用于 deriveLockState 计算前置解锁） */
export async function getMasteryStates(
  nodeIds: string[],
): Promise<Map<string, MasteryStateRecord>> {
  const map = new Map<string, MasteryStateRecord>();
  await Promise.all(
    nodeIds.map(async (id) => {
      map.set(id, await getMasteryState(id));
    }),
  );
  return map;
}

/**
 * 应用一次验证结果并落盘。
 * - 校验：是否可执行该级验证（canAttempt），不可则抛 VerificationError
 * - 失败不回退已通过等级，仅记录尝试
 * - 成功则状态机前移，并记录 attempt
 *
 * @returns 更新后的记录
 */
export async function recordVerificationResult(
  node: SkillNode,
  level: VerificationLevel,
  result: { passed: boolean; score?: number; feedback?: string; artifactId?: string },
): Promise<MasteryStateRecord> {
  const current = await getMasteryState(node.id);
  // canAttempt 要求 state >= learning；unlocked 视为 learning 起步
  const effectiveState: MasteryState =
    current.state === "unlocked" ? "learning" : current.state;

  if (!canAttempt(node, effectiveState, level)) {
    const next = nextRequiredLevel(node, effectiveState);
    throw new Error(
      `节点 ${node.id} 当前状态 ${current.state} 不能进行 ${level} 验证，下一级应为 ${next ?? "无"}`,
    );
  }

  const newState = applyVerificationResult(
    node,
    effectiveState,
    level,
    result.passed,
  );

  const attempt: VerificationAttempt = {
    id: nanoid(),
    level,
    passed: result.passed,
    score: result.score,
    feedback: result.feedback,
    artifactId: result.artifactId,
    attemptedAt: nowISO(),
  };

  const updated: MasteryStateRecord = {
    nodeId: node.id,
    state: newState,
    // 新尝试置顶（倒序）
    attempts: [attempt, ...current.attempts].slice(0, 50),
    updatedAt: nowISO(),
  };
  await setItem(keyFor(node.id), updated);
  return updated;
}

/** 列出所有已记录的掌握状态（用于全局进度统计） */
export async function listMasteryStates(): Promise<MasteryStateRecord[]> {
  return listItems<MasteryStateRecord>(KEY_PREFIXES.MASTERY_STATE);
}
