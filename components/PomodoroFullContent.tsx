"use client";

// components/PomodoroFullContent.tsx
// 番茄钟主体内容（无 TopBar，可作为 Modal 内容或路由页渲染）
//
// 设计目标：
//   - 单一事实源：把 PomodoroFull 的核心逻辑（idle/running/completed 三态视图）
//     抽出为独立组件，可同时供 /timer 路由页和 PomodoroWidget 的 large modal 复用
//   - 不含 TopBar（全屏按钮 / 返回链接）：由调用方决定是否包 TopBar
//   - 关联学习计划改 Select 下拉：替代原来的两个手填 Input（planId/nodeId）
//   - 不依赖路由：作为 Modal 内容时不调用 useRouter
//
// 设计哲学（乔布斯视角）：
//   - 倒计时是 hero，不是表单的附属品。打开立刻看到 25:00
//   - 一次点击开始。任务描述/计划关联是次要选项，折叠收起
//   - 圆形进度环 + 大号 MM:SS = 真实番茄钟的物理感
//   - 底部展示今日已完成番茄列表，给用户即时反馈
//
// 技术架构（卡帕西视角）：
//   - view 状态机 idle | running | completed，session API 不变
//   - 倒计时计算复用 computeRemainingMs（基于 startedAt + durationMinutes）
//   - ProgressRing 是纯 SVG 子组件，progress ∈ [0,1]
//   - 今日列表复用 getRecentSessions(1)，按 status=completed 过滤
//   - 通知 / 严格模式 / 恢复中断 session 保留

import { useState, useEffect, useCallback, useRef } from "react";
import type { LearningPlan, PomodoroSession } from "@/lib/types";
import { KEY_PREFIXES } from "@/lib/types";
import { setItem as dbSetItem, listItems } from "@/lib/storage/db";
import {
  createSession,
  completeSession,
  abandonSession,
  pauseSession,
  resumeSession,
  recoverInterruptedSession,
  getRunningSession,
  POMODORO_SESSION_CHANGED_EVENT,
} from "@/lib/timer/pomodoro";
import {
  getNextBreakType,
  getRecommendedDuration,
} from "@/lib/timer/pomodoro-rule";
import {
  getTodayCount,
  getTodayFocusMinutes,
  getRecentSessions,
} from "@/lib/timer/session-tracker";
import {
  startGuard,
  stopGuard,
  type FocusGuardMode,
} from "@/lib/timer/focus-guard";
import { notify, requestPermission, hasPermission } from "@/lib/timer/notification-permission";
import {
  getUserProfile,
  saveUserProfile,
} from "@/lib/ai/memory/user-profile";
import { toast } from "@/lib/toast";
import { confirmDialog } from "@/lib/confirm-dialog";
import { Icon } from "@/components/Icon";
import { Button, Input, Select, Checkbox } from "@/components/ui";

type View = "idle" | "running" | "completed";

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

/** 把 ISO 时间格式化为 HH:MM 显示（用于今日列表） */
function formatStartedAtTime(iso: string): string {
  const d = new Date(iso);
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

export interface PomodoroFullContentProps {
  /** 完成后回调（large modal 可借此关闭） */
  onComplete?: () => void;
  /** 放弃后回调 */
  onAbandon?: () => void;
}

export function PomodoroFullContent({
  onComplete,
  onAbandon,
}: PomodoroFullContentProps = {}) {
  // 视图状态
  const [view, setView] = useState<View>("idle");
  // 当前 session
  const [session, setSession] = useState<PomodoroSession | null>(null);
  const [remainingMs, setRemainingMs] = useState<number>(0);
  // 表单状态（任务描述改为可选）
  const [taskDescription, setTaskDescription] = useState("");
  const [durationMinutes, setDurationMinutes] = useState(25);
  const [planId, setPlanId] = useState("");
  // 是否展开「更多选项」（任务描述 / 关联计划 / 严格模式）
  const [showOptions, setShowOptions] = useState(false);
  // 严格模式 toggle
  const [strictMode, setStrictMode] = useState(false);
  // 打断次数（从 interruption-tracker 同步）
  const [interruptions, setInterruptions] = useState(0);
  // 今日已完成番茄数（用于休息建议 + idle 视图底部统计）
  const [todayCount, setTodayCount] = useState(0);
  // 今日累计专注分钟
  const [todayMinutes, setTodayMinutes] = useState(0);
  // 今日已完成 sessions（用于底部列表）
  const [todaySessions, setTodaySessions] = useState<PomodoroSession[]>([]);
  // 学习计划列表（下拉选择用，idle 视图展开更多选项时加载）
  const [plans, setPlans] = useState<LearningPlan[]>([]);
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

  // 拉取今日番茄列表 + 统计
  const refreshTodayStats = useCallback(async () => {
    const [count, minutes, recent] = await Promise.all([
      getTodayCount(),
      getTodayFocusMinutes(),
      getRecentSessions(1),
    ]);
    setTodayCount(count);
    setTodayMinutes(minutes);
    // 只展示今日 completed 的 focus session
    setTodaySessions(
      recent.filter(
        (s) => s.type === "focus" && s.status === "completed",
      ),
    );
  }, []);

  // 初始化：检查通知权限 + 检查恢复 session + 从画像读取严格模式 + 今日统计
  const init = useCallback(async () => {
    setNotifPermission(hasPermission());
    // 从 UserProfile 读取 strictFocusMode（默认 loose）
    const profile = await getUserProfile();
    if (profile?.strictFocusMode === true) {
      setStrictMode(true);
    }
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
    await refreshTodayStats();
  }, [refreshTodayStats]);

  useEffect(() => {
    void init();
    // 监听 session 变化：AI 调用工具创建/操作 session 时立即刷新视图
    const onSessionChanged = () => { void init(); };
    window.addEventListener(POMODORO_SESSION_CHANGED_EVENT, onSessionChanged);
    return () => {
      window.removeEventListener(POMODORO_SESSION_CHANGED_EVENT, onSessionChanged);
    };
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
          "番茄完成",
          `「${session.taskDescription || "专注"}」专注完成，去休息一下吧`,
        );
      }
    };
    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view, session]);

  // 严格模式自动放弃
  const handleAbandonStrict = useCallback(async () => {
    if (!session) return;
    stopGuard();
    try {
      await abandonSession(session.id, "strict_mode_3_interruptions");
      toast.warning("严格模式：连续 3 次打断，已自动放弃本次番茄");
      setSession(null);
      setView("idle");
      setInterruptions(0);
      onAbandon?.();
    } catch (e) {
      setError(e instanceof Error ? e.message : "自动放弃失败");
    }
  }, [session, onAbandon]);

  // 启动专注保护（基于 focus-guard，复用 interruption-tracker）
  const startInterruptTracking = useCallback(
    (sessionId: string) => {
      const mode: FocusGuardMode = strictMode ? "strict" : "loose";
      startGuard(sessionId, mode, {
        onInterrupt: (count) => {
          setInterruptions(count);
          setSession((prev) =>
            prev ? { ...prev, interruptions: count } : prev,
          );
        },
        onAbandon: () => {
          void handleAbandonStrict();
        },
      });
    },
    [strictMode, handleAbandonStrict],
  );

  // 展开更多选项时按需加载 plans 列表（避免 idle 视图无谓加载）
  useEffect(() => {
    if (!showOptions || plans.length > 0) return;
    let cancelled = false;
    void listItems<LearningPlan>(KEY_PREFIXES.PLAN)
      .then((list) => {
        if (cancelled) return;
        // 过滤掉冻结的计划，按优先级 + 创建时间排序
        const visible = list
          .filter((p) => !p.frozen)
          .sort((a, b) => {
            const pa = a.priority ?? 3;
            const pb = b.priority ?? 3;
            if (pa !== pb) return pa - pb;
            return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          });
        setPlans(visible);
      })
      .catch(() => {
        if (!cancelled) setPlans([]);
      });
    return () => {
      cancelled = true;
    };
  }, [showOptions, plans.length]);

  // 启动一个新 session（任务描述可选，planId 改为 Select 下拉选择）
  async function handleStart() {
    setError("");
    try {
      const newSession = await createSession({
        taskDescription: taskDescription.trim() || "专注",
        type: "focus",
        durationMinutes,
        planId: planId.trim() || undefined,
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
    stopGuard();
    try {
      // 持久化打断次数，确保 completeSession 读取到正确的 interruptions
      if (interruptions > 0) {
        await dbSetItem(KEY_PREFIXES.POMODORO_SESSION + session.id, {
          ...session,
          interruptions,
        });
      }
      await completeSession(session.id);
      await refreshTodayStats();
      setView("completed");
      onComplete?.();
    } catch (e) {
      setError(e instanceof Error ? e.message : "完成失败");
    } finally {
      completingRef.current = false;
    }
  }

  // 暂停 / 恢复
  // 关键：暂停后不关闭弹窗（仅切 session.status = paused，view 保持 running）
  // Modal 的 onClose 由用户主动操作（点关闭按钮 / ESC）触发，与暂停状态无关
  async function handlePauseResume() {
    if (!session) return;
    try {
      if (session.status === "running") {
        await pauseSession(session.id);
        setSession({ ...session, status: "paused" });
        stopGuard();
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
    const ok = await confirmDialog({
      title: "放弃本次番茄？",
      message: "确定放弃这个番茄吗？本次专注将不计入统计",
      confirmText: "放弃",
      cancelText: "继续",
      danger: true,
    });
    if (!ok) return;
    stopGuard();
    try {
      await abandonSession(session.id, "user_abandon");
      setSession(null);
      setView("idle");
      setInterruptions(0);
      onAbandon?.();
    } catch (e) {
      setError(e instanceof Error ? e.message : "放弃失败");
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
    setView("idle");
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
      stopGuard();
    } catch (e) {
      setError(e instanceof Error ? e.message : "启动休息失败");
    }
  }

  // ============ 渲染 ============

  // 恢复提示
  if (recoveryPrompt) {
    return (
      <div className="p-2 space-y-4">
        <RecoveryCard
          session={recoveryPrompt}
          onContinue={handleRecoverContinue}
          onAbandon={handleRecoverAbandon}
        />
      </div>
    );
  }

  // idle 视图：大号倒计时 hero + 时长预设 + 开始按钮 + 可选选项 + 今日列表
  if (view === "idle") {
    // idle 视图下，"剩余时间" = 选中的时长（静态展示）
    const idleMs = durationMinutes * 60_000;
    return (
      <div className="space-y-4">
        {error && <p className="text-red-500 text-xs">{error}</p>}

        {/* Hero：圆形进度环 + 大号倒计时 */}
        <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 flex flex-col items-center space-y-5">
          <ProgressRing progress={0} variant="idle">
            <div className="flex flex-col items-center">
              <div className="font-mono text-6xl font-bold tabular-nums text-gray-900 dark:text-gray-100">
                {formatCountdown(idleMs)}
              </div>
              <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">点按下方开始</div>
            </div>
          </ProgressRing>

          {/* 时长预设 */}
          <div className="w-full">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 text-center">
              专注时长
            </p>
            <div className="flex gap-2">
              {[15, 25, 50].map((m) => (
                <Button
                  key={m}
                  variant={durationMinutes === m ? "primary" : "ghost"}
                  size="sm"
                  onClick={() => setDurationMinutes(m)}
                  className="flex-1"
                >
                  {m} 分钟
                </Button>
              ))}
            </div>
          </div>

          {/* 一键开始 */}
          <Button
            block
            size="lg"
            leftIcon="target"
            onClick={handleStart}
            className="text-base"
          >
            开始专注
          </Button>

          {/* 可选选项（折叠） */}
          <div className="w-full">
            <Button
              variant="ghost"
              size="sm"
              block
              onClick={() => setShowOptions(!showOptions)}
              aria-expanded={showOptions}
              aria-controls="pomodoro-options"
            >
              <Icon
                name="chevron-right"
                className={`w-3.5 h-3.5 transition-transform ${showOptions ? "rotate-90" : ""}`}
              />
              {showOptions ? "收起选项" : "更多选项（任务 / 计划 / 模式）"}
            </Button>
            {showOptions && (
              <div id="pomodoro-options" className="mt-3 space-y-3">
                <div>
                  <label className="block text-xs font-medium mb-1 text-gray-600 dark:text-gray-400">
                    任务描述（可选）
                  </label>
                  <Input
                    value={taskDescription}
                    onChange={(e) => setTaskDescription(e.target.value)}
                    placeholder="例如：完成 React Hooks 章节练习"
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1 text-gray-600 dark:text-gray-400">
                    关联学习计划（可选）
                  </label>
                  <Select
                    value={planId}
                    onChange={(e) => setPlanId(e.target.value)}
                    inputSize="sm"
                    className="w-full"
                    aria-label="选择关联学习计划"
                  >
                    <option value="">不关联</option>
                    {plans.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.topic}
                      </option>
                    ))}
                  </Select>
                  {plans.length === 0 && (
                    <p className="text-2xs text-gray-400 dark:text-gray-500 mt-1">
                      暂无学习计划，可去「学习」页面创建
                    </p>
                  )}
                </div>
                <Checkbox
                  checked={strictMode}
                  onChange={async (e) => {
                    const next = e.target.checked;
                    setStrictMode(next);
                    try {
                      const profile = await getUserProfile();
                      if (profile) {
                        await saveUserProfile({ ...profile, strictFocusMode: next });
                      }
                    } catch {
                      // 持久化失败不影响当前会话的 toggle
                    }
                  }}
                  label="严格模式（3 次打断自动放弃）"
                />
              </div>
            )}
          </div>
        </div>

        {/* 今日统计 + 列表 */}
        <TodaySummary
          count={todayCount}
          minutes={todayMinutes}
          sessions={todaySessions}
        />
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
    const ringVariant: "running" | "paused" | "overtime" = isOvertime
      ? "overtime"
      : isPaused
        ? "paused"
        : "running";

    return (
      <div className="space-y-4">
        {error && <p className="text-red-500 text-xs">{error}</p>}

        <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 flex flex-col items-center space-y-5">
          {/* 类型徽章 + 任务描述 */}
          <div className="text-center w-full">
            <p className="text-2xs uppercase tracking-wide text-gray-400 dark:text-gray-500 mb-1">
              {session.type === "focus"
                ? "专注中"
                : session.type === "short_break"
                  ? "短休息"
                  : "长休息"}
              {isPaused && " · 已暂停"}
              {isOvertime && " · 已超时"}
            </p>
            <p className="text-sm text-gray-700 dark:text-gray-300 truncate max-w-full">
              {session.taskDescription || "（未命名任务）"}
            </p>
          </div>

          {/* Hero：圆环 + 大号倒计时 */}
          <ProgressRing progress={progress} variant={ringVariant}>
            <div className="flex flex-col items-center">
              <div
                className={`font-mono text-6xl font-bold tabular-nums ${
                  isOvertime
                    ? "text-red-600 dark:text-red-400"
                    : isPaused
                      ? "text-gray-400 dark:text-gray-500"
                      : "text-gray-900 dark:text-gray-100"
                }`}
              >
                {formatCountdown(remainingMs)}
              </div>
              <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                {isOvertime
                  ? "已超时，请尽快完成"
                  : isPaused
                    ? "已暂停"
                    : "保持专注"}
              </div>
            </div>
          </ProgressRing>

          {/* 打断提示 */}
          {interruptions > 0 && (
            <p className="text-xs text-red-500 text-center flex items-center justify-center gap-1">
              <Icon name="alert" className="w-3.5 h-3.5" />
              已被打断 {interruptions} 次
              {strictMode && `（严格模式：${3 - interruptions} 次后将放弃）`}
            </p>
          )}

          {/* 控制按钮：暂停/恢复后弹窗不关闭，仅 session.status 变化 */}
          <div className="w-full flex gap-2">
            {session.type === "focus" && (
              <Button
                variant="secondary"
                onClick={handlePauseResume}
                className="flex-1"
              >
                {isPaused ? "恢复" : "暂停"}
              </Button>
            )}
            <Button
              variant="success"
              className="flex-1"
              onClick={handleComplete}
            >
              提前完成
            </Button>
            <Button
              variant="ghost"
              onClick={handleAbandon}
              className="flex-1"
            >
              放弃
            </Button>
          </div>
        </div>

        {/* 今日统计 + 列表（运行中也可看到进度） */}
        <TodaySummary
          count={todayCount}
          minutes={todayMinutes}
          sessions={todaySessions}
        />
      </div>
    );
  }

  // 完成视图：显示休息建议
  if (view === "completed") {
    const nextBreak = getNextBreakType(todayCount);
    const breakMinutes = getRecommendedDuration(nextBreak, "standard");
    return (
      <div className="space-y-4">
        <div className="rounded-2xl border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950/30 p-8 text-center space-y-4">
          <Icon name="tomato" className="w-16 h-16 text-red-500 mx-auto" />
          <h2 className="text-xl font-bold text-green-700 dark:text-green-400">
            番茄完成！
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            今日已完成 {todayCount} 个番茄 · 累计 {todayMinutes} 分钟
          </p>

          <div className="rounded-lg bg-white dark:bg-gray-800 p-4 space-y-2">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
              休息建议
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {nextBreak === "long_break"
                ? `已经完成 ${todayCount} 个番茄，建议长休息 ${breakMinutes} 分钟`
                : `建议短休息 ${breakMinutes} 分钟`}
            </p>
            <div className="flex gap-2 pt-2">
              <Button
                className="flex-1"
                onClick={() => handleStartBreak(nextBreak)}
              >
                开始休息 {breakMinutes} 分钟
              </Button>
              <Button
                variant="secondary"
                onClick={handleStartAnother}
                className="flex-1"
              >
                再来一个番茄
              </Button>
            </div>
          </div>
        </div>

        {/* 今日番茄列表 */}
        <TodaySummary
          count={todayCount}
          minutes={todayMinutes}
          sessions={todaySessions}
        />
      </div>
    );
  }

  return null;
}

// ============ 子组件：圆形进度环 ============

type RingVariant = "idle" | "running" | "paused" | "overtime";

const RING_COLORS: Record<RingVariant, { track: string; progress: string }> = {
  idle: { track: "stroke-gray-100 dark:stroke-gray-700", progress: "stroke-gray-300 dark:stroke-gray-600" },
  running: { track: "stroke-gray-100 dark:stroke-gray-700", progress: "stroke-blue-500" },
  paused: { track: "stroke-gray-100 dark:stroke-gray-700", progress: "stroke-gray-400" },
  overtime: { track: "stroke-gray-100 dark:stroke-gray-700", progress: "stroke-red-500" },
};

function ProgressRing({
  progress,
  variant = "running",
  size = 280,
  children,
}: {
  progress: number;
  variant?: RingVariant;
  size?: number;
  children?: React.ReactNode;
}) {
  const stroke = 12;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.max(0, Math.min(1, progress));
  const offset = circumference * (1 - clamped);
  const colors = RING_COLORS[variant];

  return (
    <div
      className="relative flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="-rotate-90"
        aria-hidden
      >
        {/* 轨道 */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={stroke}
          className={colors.track}
        />
        {/* 进度 */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className={`${colors.progress} transition-[stroke-dashoffset] duration-1000 ease-linear`}
        />
      </svg>
      {/* 中间内容 */}
      <div className="absolute inset-0 flex items-center justify-center">
        {children}
      </div>
    </div>
  );
}

// ============ 子组件：今日番茄统计 + 列表 ============

function TodaySummary({
  count,
  minutes,
  sessions,
}: {
  count: number;
  minutes: number;
  sessions: PomodoroSession[];
}) {
  return (
    <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 space-y-3">
      {/* 统计 */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
          <Icon name="tomato" className="w-4 h-4 text-red-500" />
          今日番茄
        </h3>
        <div className="flex items-center gap-3 text-xs">
          <span className="text-gray-500 dark:text-gray-400">
            完成 <span className="font-bold text-gray-900 dark:text-gray-100">{count}</span> 个
          </span>
          <span className="text-gray-300 dark:text-gray-600">·</span>
          <span className="text-gray-500 dark:text-gray-400">
            累计 <span className="font-bold text-gray-900 dark:text-gray-100">{minutes}</span> 分钟
          </span>
        </div>
      </div>

      {/* 列表 */}
      {sessions.length > 0 ? (
        <ul className="space-y-1.5">
          {sessions.map((s) => (
            <li
              key={s.id}
              className="flex items-center gap-2 text-xs py-1.5 px-2 rounded-lg bg-gray-50 dark:bg-gray-900/40"
            >
              <span className="text-gray-400 dark:text-gray-500 font-mono shrink-0">
                {formatStartedAtTime(s.startedAt)}
              </span>
              <span className="text-gray-700 dark:text-gray-300 flex-1 truncate">
                {s.taskDescription || "（未命名任务）"}
              </span>
              <span className="text-gray-400 dark:text-gray-500 shrink-0">
                {s.durationMinutes}min
              </span>
              {(s.interruptions ?? 0) > 0 && (
                <span
                  title={`被打断 ${s.interruptions} 次`}
                  className="shrink-0 inline-flex items-center justify-center min-w-[18px] h-4 px-1 rounded-full bg-red-100 dark:bg-red-950 text-red-600 dark:text-red-400 text-2xs font-bold"
                >
                  {s.interruptions}
                </span>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-center text-xs text-gray-400 dark:text-gray-500 py-2">
          今天还没有完成番茄，点上方「开始专注」开启第一个
        </p>
      )}
    </div>
  );
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
      <Icon name="alert" className="w-12 h-12 text-amber-500 mx-auto" />
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
        <Button className="flex-1" onClick={onContinue}>
          继续专注
        </Button>
        <Button
          variant="ghost"
          onClick={onAbandon}
          className="flex-1"
        >
          放弃
        </Button>
      </div>
    </div>
  );
}
