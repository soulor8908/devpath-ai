// lib/timer/focus-guard.ts
// 专注环境保护：基于 interruption-tracker 构建的高层抽象
//
// 设计（卡帕西视角）：
//   - 不重复实现 visibilitychange / blur 监听 —— 复用 interruption-tracker.startTracking
//   - 在其之上叠加 mode 语义（strict / loose）与 onPause / onResume 回调
//   - strict 模式：3 次打断触发 onAbandon（调用方负责 abandonSession）；每次打断前触发 onPause
//   - loose 模式：仅记录打断次数，不暂停，触发 onInterrupt
//   - onResume：用户切回标签页时触发（interruption-tracker 只监听"离开"，这里补充"返回"）
//
// 与 interruption-tracker 的职责切分：
//   - interruption-tracker：底层事件监听 + 计数 + strict 阈值判定（纯机制）
//   - focus-guard：上层语义 + pause/resume 信号 + mode 映射（策略层）

import {
  startTracking,
  stopTracking,
} from "@/lib/timer/interruption-tracker";

/** 专注保护模式 */
export type FocusGuardMode = "strict" | "loose";

/** focus-guard 回调集合（全部可选，调用方按需传入） */
export interface FocusGuardCallbacks {
  /** 每次被打断时触发（传入累计次数） */
  onInterrupt?: (count: number) => void;
  /** 严格模式累计 3 次打断时触发（调用方应在此调 abandonSession） */
  onAbandon?: () => void;
  /** 严格模式下每次打断前触发（调用方可在此暂停倒计时） */
  onPause?: () => void;
  /** 用户切回标签页时触发（调用方可在此恢复倒计时或提示"你离开了 X 秒"） */
  onResume?: () => void;
}

/** guard 单例状态 */
interface GuardState {
  mode: FocusGuardMode;
  callbacks: FocusGuardCallbacks;
  /** "返回标签页"监听器引用（visibilitychange 中 hidden=false 分支） */
  handleReturn: () => void;
}

let guardState: GuardState | null = null;

/** 严格模式打断阈值（与 interruption-tracker 保持一致） */
const STRICT_ABANDON_THRESHOLD = 3;

/**
 * 启动专注保护
 *
 * @param sessionId 当前番茄 session id
 * @param mode "strict" | "loose"（来自 UserProfile.strictFocusMode）
 * @param callbacks 见 FocusGuardCallbacks
 */
export function startGuard(
  sessionId: string,
  mode: FocusGuardMode,
  callbacks: FocusGuardCallbacks,
): void {
  // 已有 guard 在跑：先停掉旧的，保证单例
  if (guardState) {
    stopGuard();
  }

  const handleReturn = () => {
    if (!guardState) return;
    // 仅在"切回标签页"时触发 onResume（与 tracker 的"切走"互补）
    if (typeof document !== "undefined" && !document.hidden) {
      try {
        guardState.callbacks.onResume?.();
      } catch (e) {
        console.warn("[focus-guard] onResume callback threw:", e);
      }
    }
  };

  guardState = { mode, callbacks, handleReturn };

  // 补充"返回标签页"监听（interruption-tracker 只监听"离开"，不重复）
  if (typeof document !== "undefined") {
    document.addEventListener("visibilitychange", handleReturn);
  }

  // 复用 interruption-tracker 的离开监听 + 计数 + strict 阈值判定
  startTracking(
    sessionId,
    (count) => {
      // 每次打断都通知调用方更新 UI
      try {
        callbacks.onInterrupt?.(count);
      } catch (e) {
        console.warn("[focus-guard] onInterrupt callback threw:", e);
      }
      // 严格模式：达到阈值前的打断触发 onPause（让调用方暂停倒计时）
      if (mode === "strict" && count < STRICT_ABANDON_THRESHOLD) {
        try {
          callbacks.onPause?.();
        } catch (e) {
          console.warn("[focus-guard] onPause callback threw:", e);
        }
      }
    },
    () => {
      // 严格模式累计 3 次：调用方负责 abandonSession
      try {
        callbacks.onAbandon?.();
      } catch (e) {
        console.warn("[focus-guard] onAbandon callback threw:", e);
      }
    },
    mode === "strict",
  );
}

/**
 * 停止专注保护：移除所有监听
 * 安全：可重复调用，无副作用
 */
export function stopGuard(): void {
  if (guardState && typeof document !== "undefined") {
    document.removeEventListener("visibilitychange", guardState.handleReturn);
  }
  guardState = null;
  // 转发到底层 tracker 清理 visibilitychange + blur
  stopTracking();
}

/**
 * 根据 UserProfile.strictFocusMode 解析 guard 模式
 * true / undefined 之外的 falsy → loose；true → strict
 */
export function resolveGuardMode(strictFocusMode?: boolean): FocusGuardMode {
  return strictFocusMode === true ? "strict" : "loose";
}
