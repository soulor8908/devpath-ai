"use client";

// components/PomodoroFull.tsx
// 全屏专注模式：
//   - 大号倒计时显示
//   - 开始专注表单（任务描述 + 时长 select 15/25/50 + 关联 planId/nodeId 可选）
//   - 恢复未完成 session 的提示 UI（调 recoverInterruptedSession）
//   - 完成后显示"休息建议"卡片（短休息 / 再来一个番茄）
//   - 严格/宽松模式 toggle
//   - dark mode 支持

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import type { PomodoroSession } from "@/lib/types";
import {
  createSession,
  completeSession,
  abandonSession,
  pauseSession,
  resumeSession,
  recoverInterruptedSession,
  getRunningSession,
} from "@/lib/timer/pomodoro";
import {
  getNextBreakType,
  getRecommendedDuration,
} from "@/lib/timer/pomodoro-rule";
import { getTodayCount } from "@/lib/timer/session-tracker";
import {
  startTracking,
  stopTracking,
} from "@/lib/timer/interruption-tracker";
import { notify, requestPermission, hasPermission } from "@/lib/timer/notification-permission";

type View = "form" | "running" | "completed";

/** 倒计时显示格式 MM:SS */
function formatCountdown(ms: number): string {
  if (ms < 0) ms = 0;
  const totalSec = Math.floor(ms / 1000);
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

/** 计算 session 剩余时间（ms） */
function computeRemainingMs(session: PomodoroSession): number {
  const startMs = new Date(session.startedAt).getTime();
  const endMs = startMs + session.durationMinutes * 60_000;
  return endMs - Date.now();
}

export function PomodoroFull() {
  // 视图状态
  const [view, setView] = useState<View>("form");
  // 当前 session
  const [session, setSession] = useState<PomodoroSession | null>(null);
  const [remainingMs, setRemainingMs] = useState<number>(0);
  // 表单状态
  const [taskDescription, setTaskDescription] = useState("");
  const [durationMinutes, setDurationMinutes] = useState(25);
  const [planId, setPlanId] = useState("");
  const [nodeId, setNodeId] = useState("");
  // 严格模式 toggle
  const [strictMode, setStrictMode] = useState(false);
  // 打断次数（从 interruption-tracker 同步）
  const [interruptions, setInterruptions] = useState(0);
  // 今日已完成番茄数（用于休息建议）
  const [todayCount, setTodayCount] = useState(0);
  // 恢复提示
  const [recoveryPrompt, setRecoveryPrompt] = useState<PomodoroSession | null>(null);
  // 错误提示
  const [error, setError] = useState("");
  // 通知权限
  const [notifPermission, setNotifPermission] = useState(false);

  // 防止重复完成
  const completingRef = useRef(false);
  // 防止重复通知
  const notifiedRef = useRef<string | null>(null);

  // 初始化：检查通知权限 + 检查恢复 session
  const init = useCallback(async () => {
    setNotifPermission(hasPermission());
    const recovered = await recoverInterruptedSession();
    if (recovered) {
      setRecoveryPrompt(recovered);
    }
    const running = await getRunningSession();
    if (running && !recovered) {
      // 有进行中 session 且未超时：直接进入 running 视图
      setSession(running);
      setView("running");
      setInterruptions(running.interruptions ?? 0);
    }
    setTodayCount(await getTodayCount());
  }, []);

  useEffect(() => {
    void init();
  }, [init]);

  // running 视图：每秒轮询 + 倒计时归零自动完成
  useEffect(() => {
    if (view !== "running" || !session) return;
    const tick = () => {
      const remaining = computeRemainingMs(session);
      setRemainingMs(remaining);
      // 倒计时归零：自动完成（仅 running 状态触发，paused 不触发）
      if (
        remaining <= 0 &&
        session.status === "running" &&
        !completingRef.current
      ) {
        completingRef.current = true;
        void handleComplete();
      }
      // 通知（同一 session 只触发一次）
      if (remaining <= 0 && notifiedRef.current !== session.id) {
        notifiedRef.current = session.id;
        void notify(
          "番茄完成 🍅",
          `「${session.taskDescription}」专注完成，去休息一下吧`,
        );
      }
    };
    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view, session]);

  // 启动打断追踪
  const startInterruptTracking = useCallback(
    (sessionId: string) => {
      startTracking(
        sessionId,
        (count) => {
          setInterruptions(count);
          // 同步到 session 对象（用于持久化）
          setSession((prev) =>
            prev ? { ...prev, interruptions: count } : prev,
          );
        },
        () => {
          // 严格模式：3 次打断 → 自动放弃
          void handleAbandonStrict();
        },
        strictMode,
      );
    },
    [strictMode],
  );

  // 启动一个新 session
  async function handleStart() {
    setError("");
    if (!taskDescription.trim()) {
      setError("请先填写任务描述");
      return;
    }
    try {
      const newSession = await createSession({
        taskDescription: taskDescription.trim(),
        type: "focus",
        durationMinutes,
        planId: planId.trim() || undefined,
        nodeId: nodeId.trim() || undefined,
      });
      setSession(newSession);
      setInterruptions(0);
      setView("running");
      notifiedRef.current = null;
      completingRef.current = false;
      startInterruptTracking(newSession.id);
      // 顺带申请通知权限（首次启动时）
      if (!notifPermission) {
        const ok = await requestPermission();
        setNotifPermission(ok);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "启动失败");
    }
  }

  // 完成当前 session
  async function handleComplete() {
    if (!session) return;
    stopTracking();
    try {
      await completeSession(session.id);
      setTodayCount(await getTodayCount());
      setView("completed");
    } catch (e) {
      setError(e instanceof Error ? e.message : "完成失败");
    } finally {
      completingRef.current = false;
    }
  }

  // 暂停 / 恢复
  async function handlePauseResume() {
    if (!session) return;
    try {
      if (session.status === "running") {
        await pauseSession(session.id);
        setSession({ ...session, status: "paused" });
        stopTracking();
      } else if (session.status === "paused") {
        await resumeSession(session.id);
        setSession({ ...session, status: "running" });
        startInterruptTracking(session.id);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "操作失败");
    }
  }

  // 放弃（用户主动）
  async function handleAbandon() {
    if (!session) return;
    if (!window.confirm("确定放弃这个番茄吗？本次专注将不计入统计")) return;
    stopTracking();
    try {
      await abandonSession(session.id, "user_abandon");
      setSession(null);
      setView("form");
      setInterruptions(0);
    } catch (e) {
      setError(e instanceof Error ? e.message : "放弃失败");
    }
  }

  // 严格模式自动放弃
  async function handleAbandonStrict() {
    if (!session) return;
    stopTracking();
    try {
      await abandonSession(session.id, "strict_mode_3_interruptions");
      // 提示用户
      window.alert("⚠️ 严格模式：连续 3 次打断，已自动放弃本次番茄");
      setSession(null);
      setView("form");
      setInterruptions(0);
    } catch (e) {
      setError(e instanceof Error ? e.message : "自动放弃失败");
    }
  }

  // 恢复中断的 session
  async function handleRecoverContinue() {
    if (!recoveryPrompt) return;
    setSession(recoveryPrompt);
    setInterruptions(recoveryPrompt.interruptions ?? 0);
    setView("running");
    setRecoveryPrompt(null);
    notifiedRef.current = null;
    completingRef.current = false;
    startInterruptTracking(recoveryPrompt.id);
  }

  // 放弃恢复的 session
  async function handleRecoverAbandon() {
    if (!recoveryPrompt) return;
    try {
      await abandonSession(recoveryPrompt.id, "user_skip_recovered");
      setRecoveryPrompt(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "放弃失败");
    }
  }

  // 完成后：再来一个番茄
  function handleStartAnother() {
    setSession(null);
    setView("form");
    setInterruptions(0);
  }

  // 完成后：开始休息
  async function handleStartBreak(breakType: "short_break" | "long_break") {
    try {
      const breakSession = await createSession({
        taskDescription: breakType === "long_break" ? "长休息" : "短休息",
        type: breakType,
        durationMinutes: getRecommendedDuration(breakType, "standard"),
      });
      setSession(breakSession);
      setView("running");
      setInterruptions(0);
      notifiedRef.current = null;
      completingRef.current = false;
      // 休息 session 不启动打断追踪
      stopTracking();
    } catch (e) {
      setError(e instanceof Error ? e.message : "启动休息失败");
    }
  }

  // ============ 渲染 ============

  // 恢复提示
  if (recoveryPrompt) {
    return (
      <div className="mx-auto max-w-md p-4 space-y-4">
        <RecoveryCard
          session={recoveryPrompt}
          onContinue={handleRecoverContinue}
          onAbandon={handleRecoverAbandon}
        />
      </div>
    );
  }

  // 表单视图
  if (view === "form") {
    return (
      <div className="mx-auto max-w-md p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">番茄专注</h1>
          <Link href="/" className="text-sm text-blue-500 hover:underline">
            ← 返回
          </Link>
        </div>

        {error && <p className="text-red-500 text-xs">{error}</p>}

        <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 space-y-3">
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
              任务描述
            </label>
            <input
              type="text"
              value={taskDescription}
              onChange={(e) => setTaskDescription(e.target.value)}
              placeholder="例如：完成 React Hooks 章节练习"
              className="w-full border rounded px-2 py-1.5 text-sm bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
              专注时长（分钟）
            </label>
            <div className="flex gap-2">
              {[15, 25, 50].map((m) => (
                <button
                  key={m}
                  onClick={() => setDurationMinutes(m)}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                    durationMinutes === m
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          <details className="text-sm">
            <summary className="cursor-pointer text-gray-600 dark:text-gray-400">
              关联学习计划（可选）
            </summary>
            <div className="mt-2 space-y-2">
              <input
                type="text"
                value={planId}
                onChange={(e) => setPlanId(e.target.value)}
                placeholder="planId"
                className="w-full border rounded px-2 py-1 text-xs bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
              />
              <input
                type="text"
                value={nodeId}
                onChange={(e) => setNodeId(e.target.value)}
                placeholder="nodeId"
                className="w-full border rounded px-2 py-1 text-xs bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
              />
            </div>
          </details>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={strictMode}
              onChange={(e) => setStrictMode(e.target.checked)}
              className="w-4 h-4"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">
              严格模式（3 次打断自动放弃）
            </span>
          </label>

          <button
            onClick={handleStart}
            className="w-full bg-blue-600 text-white rounded-lg py-2.5 text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            开始专注
          </button>
        </div>

        {todayCount > 0 && (
          <p className="text-center text-xs text-gray-400">
            今日已完成 {todayCount} 个番茄 🍅
          </p>
        )}
      </div>
    );
  }

  // 运行中视图
  if (view === "running" && session) {
    const isPaused = session.status === "paused";
    const isOvertime = remainingMs <= 0 && session.status === "running";
    const progress = Math.max(
      0,
      Math.min(
        1,
        1 - remainingMs / (session.durationMinutes * 60_000),
      ),
    );

    return (
      <div className="mx-auto max-w-md p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold">
            {session.type === "focus"
              ? "专注中"
              : session.type === "short_break"
                ? "短休息"
                : "长休息"}
          </h1>
          <Link href="/" className="text-sm text-blue-500 hover:underline">
            ← 返回
          </Link>
        </div>

        {error && <p className="text-red-500 text-xs">{error}</p>}

        <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-8 text-center space-y-4">
          <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
            {session.taskDescription || "（未命名任务）"}
          </p>

          <div
            className={`font-mono text-7xl font-bold tabular-nums ${
              isOvertime
                ? "text-red-600 dark:text-red-400"
                : isPaused
                  ? "text-gray-400 dark:text-gray-500"
                  : "text-gray-900 dark:text-gray-100"
            }`}
          >
            {formatCountdown(remainingMs)}
          </div>

          {/* 进度条 */}
          <div className="w-full h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all ${
                isPaused
                  ? "bg-gray-400"
                  : isOvertime
                    ? "bg-red-500"
                    : "bg-blue-500"
              }`}
              style={{ width: `${progress * 100}%` }}
            />
          </div>

          {interruptions > 0 && (
            <p className="text-xs text-red-500">
              ⚠️ 已被打断 {interruptions} 次
              {strictMode && `（严格模式：${3 - interruptions} 次后将放弃）`}
            </p>
          )}

          <div className="flex gap-2 pt-2">
            {session.type === "focus" && (
              <button
                onClick={handlePauseResume}
                className="flex-1 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 text-sm font-medium py-2 transition-colors"
              >
                {isPaused ? "恢复" : "暂停"}
              </button>
            )}
            <button
              onClick={handleComplete}
              className="flex-1 rounded-lg bg-green-600 hover:bg-green-700 text-white text-sm font-medium py-2 transition-colors"
            >
              提前完成
            </button>
            <button
              onClick={handleAbandon}
              className="flex-1 rounded-lg bg-red-50 dark:bg-red-950/40 hover:bg-red-100 dark:hover:bg-red-900/40 text-red-600 dark:text-red-400 text-sm font-medium py-2 transition-colors"
            >
              放弃
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 完成视图：显示休息建议
  if (view === "completed") {
    const nextBreak = getNextBreakType(todayCount);
    const breakMinutes = getRecommendedDuration(nextBreak, "standard");
    return (
      <div className="mx-auto max-w-md p-4 space-y-4">
        <div className="rounded-2xl border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950/30 p-8 text-center space-y-4">
          <div className="text-5xl">🍅</div>
          <h2 className="text-xl font-bold text-green-700 dark:text-green-400">
            番茄完成！
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            今日已完成 {todayCount} 个番茄
          </p>

          <div className="rounded-lg bg-white dark:bg-gray-800 p-4 space-y-2">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
              休息建议
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {nextBreak === "long_break"
                ? `已经完成 ${todayCount} 个番茄，建议长休息 ${breakMinutes} 分钟 🌿`
                : `建议短休息 ${breakMinutes} 分钟 ☕`}
            </p>
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => handleStartBreak(nextBreak)}
                className="flex-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2 transition-colors"
              >
                开始休息 {breakMinutes} 分钟
              </button>
              <button
                onClick={handleStartAnother}
                className="flex-1 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 text-sm font-medium py-2 transition-colors"
              >
                再来一个番茄
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}

// ============ 子组件：恢复提示卡片 ============

function RecoveryCard({
  session,
  onContinue,
  onAbandon,
}: {
  session: PomodoroSession;
  onContinue: () => void;
  onAbandon: () => void;
}) {
  const remaining = computeRemainingMs(session);
  const mins = Math.max(0, Math.floor(remaining / 60_000));
  return (
    <div className="rounded-2xl border border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-950/30 p-6 space-y-3">
      <div className="text-center text-4xl">⚠️</div>
      <h2 className="text-center text-lg font-bold text-yellow-700 dark:text-yellow-400">
        发现未完成的番茄
      </h2>
      <p className="text-center text-sm text-gray-600 dark:text-gray-400">
        「{session.taskDescription}」还剩约 {mins} 分钟
      </p>
      <p className="text-center text-xs text-gray-500 dark:text-gray-500">
        可能是浏览器刷新或关闭前未结束
      </p>
      <div className="flex gap-2 pt-2">
        <button
          onClick={onContinue}
          className="flex-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2 transition-colors"
        >
          继续专注
        </button>
        <button
          onClick={onAbandon}
          className="flex-1 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 text-sm font-medium py-2 transition-colors"
        >
          放弃
        </button>
      </div>
    </div>
  );
}
