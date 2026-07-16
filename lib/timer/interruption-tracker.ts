// lib/timer/interruption-tracker.ts
// 番茄钟打断追踪：监听 document visibilitychange + window blur
//
// 设计：
//   - 单例模块：同时只有一个 session 在追踪
//   - 严格模式（strictMode=true）：3 次打断触发 onAbandon
//   - 宽松模式（strictMode=false）：仅累计次数，不触发放弃
//   - SSR 安全：所有 DOM API 调用前用 typeof document !== "undefined" 守卫
//
// 监听策略：
//   - visibilitychange + document.hidden=true：用户切到其他标签页
//   - window blur：用户切到其他应用（桌面端）

/** 打断追踪器单例状态 */
interface TrackerState {
  sessionId: string;
  count: number;
  strictMode: boolean;
  /** 用户传入的回调 */
  onInterrupt: (count: number) => void;
  onAbandon?: () => void;
  /** bound handler 引用，便于 removeEventListener */
  handleVisibility: () => void;
  handleBlur: () => void;
}

let state: TrackerState | null = null;

/**
 * 启动打断追踪
 *
 * @param sessionId 当前 session id
 * @param onInterrupt 每次被打断时回调（传入累计次数）
 * @param onAbandon 严格模式下累计 3 次打断时回调（让 UI 调 abandonSession）
 * @param strictMode 是否严格模式（默认 false）
 */
export function startTracking(
  sessionId: string,
  onInterrupt: (count: number) => void,
  onAbandon?: () => void,
  strictMode: boolean = false,
): void {
  // 客户端守卫：服务端调用直接 no-op
  if (typeof document === "undefined" || typeof window === "undefined") return;

  // 已有 tracker 在跑：先停掉旧的
  if (state) {
    stopTracking();
  }

  const handleVisibility = () => {
    if (document.hidden) {
      incrementInterrupt();
    }
  };

  const handleBlur = () => {
    incrementInterrupt();
  };

  state = {
    sessionId,
    count: 0,
    strictMode,
    onInterrupt,
    onAbandon,
    handleVisibility,
    handleBlur,
  };

  document.addEventListener("visibilitychange", handleVisibility);
  window.addEventListener("blur", handleBlur);
}

/**
 * 停止追踪：移除所有事件监听
 * 安全：可重复调用，无副作用
 */
export function stopTracking(): void {
  if (!state) return;
  if (typeof document !== "undefined") {
    document.removeEventListener("visibilitychange", state.handleVisibility);
  }
  if (typeof window !== "undefined") {
    window.removeEventListener("blur", state.handleBlur);
  }
  state = null;
}

/** 查询当前累计打断次数（无 tracker 时返回 0） */
export function getCurrentInterruptCount(): number {
  return state?.count ?? 0;
}

/** 查询当前追踪的 session id（无 tracker 时返回 null） */
export function getCurrentSessionId(): string | null {
  return state?.sessionId ?? null;
}

// ============ 内部工具 ============

const ABANDON_THRESHOLD = 3;

function incrementInterrupt(): void {
  if (!state) return;
  state.count += 1;
  const count = state.count;
  try {
    state.onInterrupt(count);
  } catch (e) {
    console.warn("[pomodoro:interrupt] onInterrupt callback threw:", e);
  }
  // 严格模式：累计达到阈值时触发 onAbandon
  if (state.strictMode && count >= ABANDON_THRESHOLD && state.onAbandon) {
    try {
      state.onAbandon();
    } catch (e) {
      console.warn("[pomodoro:interrupt] onAbandon callback threw:", e);
    }
  }
}
