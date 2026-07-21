// lib/ai/train-scheduler.ts
// 训练会话智能调度——决定"现在学什么、接下来做什么"
//
// 设计（卡帕西视角）：
//   - 纯函数：输入用户状态 → 输出会话步骤
//   - 复用 study-queue 的优先级逻辑
//   - 增加"学完立即测"的间隔重复最佳时机

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
