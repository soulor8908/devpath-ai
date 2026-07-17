// lib/timer/pomodoro.ts
// 番茄钟 session 核心 API：创建 / 完成 / 放弃 / 暂停 / 恢复 / 查询 / 恢复中断 session
//
// 数据存储：IndexedDB，key 前缀 KEY_PREFIXES.POMODORO_SESSION = "pomodoro:"
// 与现有模块的关系：
//   - 复用 lib/learn-log.ts 的 logLearning 写 LearnLog（type=focus_session）
//   - 复用 lib/energy-collector.ts 的 updateActualMinutes 回填能量样本
//   - 复用 lib/timer/session-tracker.ts 的 getTodayCount / getTodayFocusMinutes
//
// 所有 IO 异步，不阻塞 UI；服务端调用 getItem/setItem 返回 undefined/void（见 db.ts 守卫）

import { nanoid } from "nanoid";
import { getItem, setItem, listItems } from "@/lib/storage/db";
import { KEY_PREFIXES, type PomodoroSession, type LearnLog } from "@/lib/types";
import { chinaDateNow } from "@/lib/time";
import { updateActualMinutes } from "@/lib/energy-collector";
import { getTodayCount, getTodayFocusMinutes } from "@/lib/timer/session-tracker";
import { refreshAverageSessionMinutes } from "@/lib/ai/memory/user-profile";

/** createSession 入参 */
export interface CreateSessionParams {
  /** 关联学习计划 ID（休息 session 可空） */
  planId?: string;
  /** 关联知识点 ID（休息 session 可空） */
  nodeId?: string;
  /** 任务描述（用户输入或 AI 生成） */
  taskDescription: string;
  /** session 类型 */
  type: PomodoroSession["type"];
  /** 时长（分钟） */
  durationMinutes: number;
  /** 开始时的能量等级 1-5（可选） */
  energyBefore?: number;
}

/**
 * 创建并持久化一个新 session
 * - status=running
 * - sessionIndex = getTodayCount() + 1（今日第几个番茄）
 * - startedAt = 当前 ISO 时间
 */
export async function createSession(
  params: CreateSessionParams,
): Promise<PomodoroSession> {
  const sessionIndex = (await getTodayCount()) + 1;
  const session: PomodoroSession = {
    id: nanoid(),
    planId: params.planId,
    nodeId: params.nodeId,
    taskDescription: params.taskDescription,
    type: params.type,
    durationMinutes: params.durationMinutes,
    startedAt: new Date().toISOString(),
    status: "running",
    sessionIndex,
    interruptions: 0,
    energyBefore: params.energyBefore,
    pausedMinutes: 0,
  };
  await setItem(KEY_PREFIXES.POMODORO_SESSION + session.id, session);
  return session;
}

/**
 * 完成 session：
 * 1. 标记 status=completed + completedAt + energyAfter
 * 2. 写入 LearnLog(type=focus_session, duration=durationMinutes - interruptions)
 *    （仅 focus 类型才写 LearnLog；break 类型不写）
 * 3. 调用 updateActualMinutes(today, 累计时长) 回填能量样本
 *
 * @param id session id
 * @param energyAfter 结束时的能量等级 1-5（可选）
 */
export async function completeSession(
  id: string,
  energyAfter?: number,
): Promise<void> {
  const session = await getItem<PomodoroSession>(
    KEY_PREFIXES.POMODORO_SESSION + id,
  );
  if (!session) return;
  if (session.status === "completed" || session.status === "abandoned") return;

  const now = new Date().toISOString();
  const updated: PomodoroSession = {
    ...session,
    status: "completed",
    completedAt: now,
    energyAfter,
  };
  await setItem(KEY_PREFIXES.POMODORO_SESSION + id, updated);

  // 仅 focus 类型写入 LearnLog + 回填 actualMinutes
  if (session.type === "focus") {
    const effectiveMinutes = Math.max(
      0,
      session.durationMinutes - (session.interruptions ?? 0),
    );
    // 写 LearnLog（duration 字段表示"实际专注分钟数（扣除打断）"）
    // LearnLog.planId 必填，focus session 无关联计划时用 "standalone" 占位
    await writeFocusSessionLearnLog({
      planId: session.planId ?? "standalone",
      nodeId: session.nodeId,
      duration: effectiveMinutes,
    });
    // 累计今日专注分钟数（含本 session，因为 status 已是 completed）
    const totalMinutes = await getTodayFocusMinutes();
    await updateActualMinutes(chinaDateNow(), totalMinutes);
    // 事件驱动更新画像高频维度（替代等 24h 批量重建）
    // actualMinutes 已回填 → 立即重算 averageSessionMinutes 写回画像
    // fire-and-forget：不阻塞番茄完成主流程，失败由内部 try/catch 静默
    void refreshAverageSessionMinutes();
  }
}

/**
 * 放弃 session：
 * - 标记 status=abandoned + completedAt
 * - 不写 LearnLog（不计入专注时长统计）
 *
 * @param id session id
 * @param reason 放弃原因（可选，仅记录到内存日志，不持久化）
 */
export async function abandonSession(
  id: string,
  reason?: string,
): Promise<void> {
  const session = await getItem<PomodoroSession>(
    KEY_PREFIXES.POMODORO_SESSION + id,
  );
  if (!session) return;
  if (session.status === "completed" || session.status === "abandoned") return;

  const updated: PomodoroSession = {
    ...session,
    status: "abandoned",
    completedAt: new Date().toISOString(),
  };
  await setItem(KEY_PREFIXES.POMODORO_SESSION + id, updated);
  if (reason) {
    // 仅记录到控制台，不持久化（避免污染日志数据）
    console.info(`[pomodoro] session ${id} abandoned: ${reason}`);
  }
}

/**
 * 暂停 session：status=running → paused
 * 仅 running 状态可暂停
 */
export async function pauseSession(id: string): Promise<void> {
  const session = await getItem<PomodoroSession>(
    KEY_PREFIXES.POMODORO_SESSION + id,
  );
  if (!session) return;
  if (session.status !== "running") return;
  await setItem(KEY_PREFIXES.POMODORO_SESSION + id, {
    ...session,
    status: "paused",
  });
}

/**
 * 恢复 session：status=paused → running
 * 仅 paused 状态可恢复
 */
export async function resumeSession(id: string): Promise<void> {
  const session = await getItem<PomodoroSession>(
    KEY_PREFIXES.POMODORO_SESSION + id,
  );
  if (!session) return;
  if (session.status !== "paused") return;
  await setItem(KEY_PREFIXES.POMODORO_SESSION + id, {
    ...session,
    status: "running",
  });
}

/**
 * 查询当前 running 的 session
 * 同时只有一个 session 处于 running（按创建协议保证）
 * 返回最新 startedAt 的那个（防御性）
 */
export async function getRunningSession(): Promise<PomodoroSession | null> {
  const sessions = await listItems<PomodoroSession>(
    KEY_PREFIXES.POMODORO_SESSION,
  );
  const running = sessions
    .filter((s) => s.status === "running")
    .sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime());
  return running[0] ?? null;
}

/**
 * 恢复中断的 session：
 * 检测 status=running 的 session（可能是浏览器崩溃/刷新前未结束的）：
 *   - 若距 startedAt 已超过 durationMinutes（含 30 秒宽限）→ 自动调 completeSession
 *   - 否则返回该 session 让 UI 提示用户「是否继续 / 放弃」
 *
 * @returns null 表示无 running session 或已自动完成；PomodoroSession 表示需用户决策
 */
export async function recoverInterruptedSession(): Promise<PomodoroSession | null> {
  const running = await getRunningSession();
  if (!running) return null;

  const startMs = new Date(running.startedAt).getTime();
  const elapsedMs = Date.now() - startMs;
  const expectedMs = running.durationMinutes * 60_000;
  // 30 秒宽限：避免边界 case 误判
  const GRACE_MS = 30_000;

  if (elapsedMs >= expectedMs + GRACE_MS) {
    // 已超时，自动完成
    await completeSession(running.id);
    return null;
  }
  // 未超时，返回让 UI 提示用户
  return running;
}

// ============ 内部工具 ============

/**
 * 写一条 focus_session 类型的 LearnLog
 * 直接走 setItem（不调 logLearning 是因为 logLearning 不支持 duration 字段）
 *
 * LearnLog.duration 含义（见 lib/types.ts 注释）：
 *   - 旧的 learn/review 类型不写此字段
 *   - focus_session 类型：明确表示"实际专注分钟数（扣除打断）"
 */
async function writeFocusSessionLearnLog(params: {
  planId: string;
  nodeId?: string;
  duration: number;
}): Promise<void> {
  const log: LearnLog = {
    id: nanoid(),
    planId: params.planId,
    nodeId: params.nodeId,
    type: "focus_session",
    duration: params.duration,
    date: chinaDateNow(),
    timestamp: new Date().toISOString(),
  };
  await setItem(KEY_PREFIXES.LEARN_LOG + log.id, log);
}
