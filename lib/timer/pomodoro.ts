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

/** 全局事件名：session 列表发生变化时由 mutation 函数派发，widget 监听后立即刷新 */
export const POMODORO_SESSION_CHANGED_EVENT = "pomodoro:session-changed";

/**
 * 全局事件名：调用方派发此事件让全局挂载的 PomodoroWidget 进入 large 模式（Modal）。
 *
 * 用途：HomeClient 的「番茄钟 · 开始一段专注」入口不再跳转 /timer 路由
 * （该路由已移除），改为派发此事件唤醒 large Modal。
 *
 * 派发：window.dispatchEvent(new CustomEvent(POMODORO_OPEN_LARGE_EVENT))
 * 监听：PomodoroWidget useEffect 内 addEventListener，setMode("large")
 */
export const POMODORO_OPEN_LARGE_EVENT = "pomodoro:open-large";

/** 派发 session 变化事件，让监听方（如 PomodoroWidget）立即刷新，避免 1 秒轮询延迟 */
function notifySessionChanged(): void {
  if (typeof window === "undefined") return;
  try {
    window.dispatchEvent(new CustomEvent(POMODORO_SESSION_CHANGED_EVENT));
  } catch {
    // window.dispatchEvent 在极端环境下可能抛错，忽略避免影响主流程
  }
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
  // 需求 5：标记当前浏览会话已知该 running session
  // 避免"用户关闭 Modal 再打开"时误触发"发现未完成的番茄"恢复提示
  markSessionCurrent(session.id);
  notifySessionChanged();
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
  // 需求 5：session 完成 → 清除当前会话标记
  clearCurrentSessionFlag();
  notifySessionChanged();
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
  // 需求 5：session 放弃 → 清除当前会话标记
  clearCurrentSessionFlag();
  notifySessionChanged();
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
  notifySessionChanged();
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
  notifySessionChanged();
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
 * 查询当前"活跃"的 session：running 或 paused 都算。
 *
 * 区别于 getRunningSession（仅 running），用于 widget / UI 展示场景：
 *   - 用户点暂停后 session.status=paused，但 widget 仍要显示进度环变灰 + "已暂停" 标记
 *   - 如果用 getRunningSession，paused 状态返回 null，widget 守卫会隐藏整个 widget
 *     → 看起来像"点暂停把弹窗关了"，实际是状态被丢失
 *
 * @returns 最新 startedAt 的 running 或 paused session；都没有则返回 null
 */
export async function getActiveSession(): Promise<PomodoroSession | null> {
  const sessions = await listItems<PomodoroSession>(
    KEY_PREFIXES.POMODORO_SESSION,
  );
  const active = sessions
    .filter((s) => s.status === "running" || s.status === "paused")
    .sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime());
  return active[0] ?? null;
}

/**
 * 当前浏览会话的标记 key（用于区分"同会话内的 running"和"跨会话的中断"）
 * 关闭标签页/刷新浏览器会清空 sessionStorage，重新打开后才会触发恢复提示
 */
const CURRENT_SESSION_FLAG = "pomodoro-current-session-id";

/**
 * 标记当前会话已知道某个 running session 的存在（避免重复弹恢复提示）
 * 应在 createSession 后、resumeSession 后、recoverInterruptedSession 返回 null 后调用
 */
export function markSessionCurrent(sessionId: string): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(CURRENT_SESSION_FLAG, sessionId);
  } catch {
    // sessionStorage 不可用时静默失败
  }
}

/**
 * 清除当前会话标记（session 完成/放弃后调用）
 */
export function clearCurrentSessionFlag(): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.removeItem(CURRENT_SESSION_FLAG);
  } catch {
    // 静默失败
  }
}

/**
 * 恢复中断的 session：
 * 检测 status=running 的 session（可能是浏览器崩溃/刷新前未结束的）：
 *   - 若距 startedAt 已超过 durationMinutes（含 30 秒宽限）→ 自动调 completeSession
 *   - 若当前浏览会话已知道该 session（sessionStorage 标记）→ 返回 null（同会话内不算中断）
 *   - 否则返回该 session 让 UI 提示用户「是否继续 / 放弃」
 *
 * 需求 5 修复：之前任何 running session 都触发恢复提示，
 *   导致"刚创建第一个就关闭 Modal 再打开"也误报"发现未完成的番茄"。
 *   现在用 sessionStorage 区分：
 *   - 同一浏览会话内（未关闭标签页）→ 不弹恢复提示，直接进 running 视图
 *   - 跨浏览会话（关闭/刷新后重开）→ 弹恢复提示
 *
 * @returns null 表示无 running session / 已自动完成 / 同会话内已知；PomodoroSession 表示需用户决策
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
    clearCurrentSessionFlag();
    return null;
  }

  // 需求 5：检查当前浏览会话是否已知该 session
  // 已知 → 同会话内（用户主动关闭 Modal 再打开）→ 不算中断，返回 null
  // 未知 → 跨会话（浏览器关闭/刷新后重开）→ 返回 session 让 UI 提示
  if (typeof window !== "undefined") {
    try {
      const knownId = window.sessionStorage.getItem(CURRENT_SESSION_FLAG);
      if (knownId === running.id) {
        return null;
      }
    } catch {
      // sessionStorage 不可用时按旧逻辑处理
    }
  }

  // 跨会话中断，返回让 UI 提示用户
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
