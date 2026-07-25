// lib/ai/train-scheduler.ts
// 训练会话智能调度——决定"现在学什么、接下来做什么"
//
// 设计（卡帕西视角）：
//   - 纯函数：输入用户状态 → 输出会话步骤
//   - 复用 study-queue 的优先级逻辑
//   - 增加"学完立即测"的间隔重复最佳时机
//
// 2026-07-25 新增：训练进度持久化
//   - 用户反馈"训练到第3题跳出去再回来，又要从第1题开始"
//   - 用 sessionStorage 保存 phase/currentIndex/questionsAnswered 等，
//     按"YYYY-MM-DD"作为 key，同一天内跳转回来自动恢复
//   - 不同天 key 不同 → 自动开始新一天的训练
//   - 持久化范围：phase / currentIndex / questionsAnswered / questionsCorrect / focusMinutes / needsBreak / answerRevealed
//   - 不持久化：feedback / isCorrect（feedback phase 是瞬态，恢复时降级到 questioning）

export type TrainSessionPhase =
  | "learning"      // 知识点讲解
  | "questioning"   // 答题中
  | "feedback"      // 答题反馈（苏格拉底式）
  | "breaking"      // 休息中
  | "completed";    // 会话完成

export interface TrainSessionState {
  phase: TrainSessionPhase;
  currentIndex: number;
  questionsAnswered: number;
  questionsCorrect: number;
  focusMinutes: number;
  needsBreak: boolean;
}

export type TrainSessionAction =
  | { type: "LEARN_COMPLETE" }
  | { type: "ANSWER_SUBMIT"; isCorrect: boolean }
  | { type: "FEEDBACK_ACKNOWLEDGE" }
  | { type: "BREAK_START" }
  | { type: "BREAK_END" }
  | { type: "NEXT_TASK" }
  | { type: "SESSION_COMPLETE" }
  | { type: "FOCUS_TICK" };

export const FOCUS_THRESHOLD_MINUTES = 25;

/**
 * 训练会话状态机——纯函数 reducer
 */
export function trainSessionReducer(
  state: TrainSessionState,
  action: TrainSessionAction
): TrainSessionState {
  switch (action.type) {
    case "LEARN_COMPLETE":
      return { ...state, phase: "questioning" };

    case "ANSWER_SUBMIT": {
      const isCorrect = action.isCorrect;
      return {
        ...state,
        phase: "feedback",
        questionsAnswered: state.questionsAnswered + 1,
        questionsCorrect: state.questionsCorrect + (isCorrect ? 1 : 0),
      };
    }

    case "FEEDBACK_ACKNOWLEDGE": {
      const needsBreak = state.focusMinutes >= FOCUS_THRESHOLD_MINUTES;
      if (needsBreak) {
        return { ...state, phase: "breaking", needsBreak: true };
      }
      return { ...state, phase: "learning" };
    }

    case "BREAK_START":
      return { ...state, phase: "breaking" };

    case "BREAK_END":
      return { ...state, phase: "learning", needsBreak: false };

    case "NEXT_TASK":
      return {
        ...state,
        phase: "learning",
        currentIndex: state.currentIndex + 1,
      };

    case "SESSION_COMPLETE":
      return { ...state, phase: "completed" };

    case "FOCUS_TICK":
      return { ...state, focusMinutes: state.focusMinutes + 1 };

    default:
      return state;
  }
}

/**
 * 生成苏格拉底式反馈——不直接给答案，用问题引导
 */
export function generateSocraticFeedback(
  isCorrect: boolean,
  keyPoint?: string
): string {
  if (isCorrect) {
    const praises = [
      "答对了。你能再举一个具体的例子吗？",
      "很好。想想这个概念在实际项目中会怎么用？",
      "正确。如果数据量是10倍呢？你的答案还成立吗？",
    ];
    return praises[Math.floor(Math.random() * praises.length)];
  }

  const hint = keyPoint ?? "再想想核心概念";
  return `不完全对。提示：${hint}。你能从这个角度重新思考一下吗？`;
}

export function createInitialTrainState(): TrainSessionState {
  return {
    phase: "learning",
    currentIndex: 0,
    questionsAnswered: 0,
    questionsCorrect: 0,
    focusMinutes: 0,
    needsBreak: false,
  };
}

// ============ 训练进度持久化（sessionStorage）============
//
// 设计目标（用户视角 / Jobs）：
//   用户训练到第 3 题跳出去看别的页面，再回来应该从第 3 题继续，
//   而不是从第 1 题重新开始。这是"我刚点过的东西应该被记住"的基本尊重。
//
// 设计实现（卡帕西视角）：
//   - 用 sessionStorage 而非 localStorage：会话级持久化，关闭标签页即失效，
//     避免跨天残留旧进度。同一天内刷新页面 / 跳转其他页面再回来均可恢复。
//   - key 按"YYYY-MM-DD"分桶：不同天自动开始新会话，无需手动清理。
//   - 持久化内容：phase / currentIndex / 答题统计 / answerRevealed
//   - 不持久化：feedback / isCorrect（feedback 是瞬态，恢复时降级到 questioning
//     让用户重新作答，避免恢复出"空反馈"的破损 UI）
//   - 边界处理：currentIndex 越界 / phase 是 completed / 数据格式异常 → 全部降级到 fresh
//
// SSR 安全：所有 sessionStorage 访问都检查 typeof window，避免 Next.js 报错

const TRAIN_SESSION_KEY_PREFIX = "train-session:";

/** 获取今日训练会话的 sessionStorage key（按中国时区日期分桶） */
function getTodaySessionKey(): string {
  // 用 toLocaleDateString 拿 "YYYY-MM-DD" 格式（中国时区）
  // 与 chinaDateNow 保持一致的语义（用户视角的"今天"）
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${TRAIN_SESSION_KEY_PREFIX}${y}-${m}-${d}`;
}

/** 持久化时携带的额外 UI 状态（不属于 reducer state 但需要随会话恢复） */
export interface TrainSessionExtras {
  /** 答案是否已揭示（questioning phase 专属） */
  answerRevealed: boolean;
}

interface PersistedTrainSession {
  state: TrainSessionState;
  extras: TrainSessionExtras;
  /** 持久化时的队列长度，用于恢复时校验 currentIndex 是否越界 */
  queueLength: number;
}

/**
 * 读取并校验持久化的训练会话
 *
 * 恢复规则：
 *   - phase === "completed" → 不恢复（会话已结束，应由 TrainClient 弹完成 Modal）
 *   - phase === "feedback"  → 降级为 "questioning"（让用户重新作答，避免空反馈 UI）
 *   - phase === "breaking"  → 降级为 "learning"（休息被打断，直接进入下一项学习）
 *   - currentIndex >= currentQueueLength → 不恢复（队列已变，索引失效）
 *   - 数据格式异常 → 不恢复
 *
 * @param currentQueueLength 当前 studyQueue 长度，用于校验索引越界
 */
export function restoreTrainSession(currentQueueLength: number): {
  state: TrainSessionState;
  extras: TrainSessionExtras;
} | null {
  if (typeof window === "undefined") return null;
  if (currentQueueLength === 0) return null;

  try {
    const raw = window.sessionStorage.getItem(getTodaySessionKey());
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PersistedTrainSession;
    if (!parsed || typeof parsed !== "object") return null;
    if (!parsed.state || typeof parsed.state !== "object") return null;
    if (!parsed.extras || typeof parsed.extras !== "object") return null;

    const s = parsed.state;
    // 字段类型校验（防止脏数据导致 reducer 崩溃）
    if (
      typeof s.currentIndex !== "number" ||
      typeof s.questionsAnswered !== "number" ||
      typeof s.questionsCorrect !== "number" ||
      typeof s.focusMinutes !== "number" ||
      typeof s.needsBreak !== "boolean" ||
      typeof s.phase !== "string"
    ) {
      return null;
    }

    // 已完成的会话不恢复（让用户走完成 Modal 流程，避免重复进入 completed）
    if (s.phase === "completed") return null;

    // 索引越界 → 不恢复（队列已变，让用户从头开始更安全）
    if (s.currentIndex < 0 || s.currentIndex >= currentQueueLength) return null;

    // 瞬态 phase 降级（恢复出破损 UI 比从头开始更糟）
    let restoredPhase = s.phase as TrainSessionPhase;
    const restoredAnswerRevealed = !!parsed.extras.answerRevealed;
    if (restoredPhase === "feedback") {
      // feedback 是答题后的瞬态：恢复时降级到 questioning，让用户重新作答
      restoredPhase = "questioning";
      // 答案揭示状态保留（用户已经看过答案，没必要再藏一次）
    } else if (restoredPhase === "breaking") {
      // breaking 是休息中：恢复时降级到 learning，直接开始 currentIndex 指向的任务
      restoredPhase = "learning";
    }

    return {
      state: {
        phase: restoredPhase,
        currentIndex: s.currentIndex,
        questionsAnswered: s.questionsAnswered,
        questionsCorrect: s.questionsCorrect,
        focusMinutes: s.focusMinutes,
        needsBreak: s.needsBreak,
      },
      extras: { answerRevealed: restoredAnswerRevealed },
    };
  } catch {
    // JSON 解析失败 / sessionStorage 不可用 → 静默降级到 fresh
    return null;
  }
}

/**
 * 持久化训练会话到 sessionStorage
 * - phase === "completed" 时不写入（避免覆盖未完成的会话）
 * - SSR 环境直接 no-op
 */
export function saveTrainSession(
  state: TrainSessionState,
  extras: TrainSessionExtras,
  queueLength: number,
): void {
  if (typeof window === "undefined") return;
  // 已完成的会话不持久化（应该用 clearTrainSession 清掉）
  if (state.phase === "completed") return;
  try {
    const payload: PersistedTrainSession = { state, extras, queueLength };
    window.sessionStorage.setItem(getTodaySessionKey(), JSON.stringify(payload));
  } catch {
    // sessionStorage 满 / 隐私模式 → 静默失败，不阻断训练流程
  }
}

/** 清除今日训练会话持久化数据（会话完成时调用） */
export function clearTrainSession(): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.removeItem(getTodaySessionKey());
  } catch {
    // 静默失败
  }
}
