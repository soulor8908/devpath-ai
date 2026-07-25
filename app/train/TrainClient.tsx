"use client";

// app/train/TrainClient.tsx
// 训练会话页客户端——沉浸式学习，不跳转
//
// 2026-07-25 修复（用户反馈）：
//   1. 顶部进度条硬编码 "第 1/total" → 通过 onProgressChange 回调动态显示当前进度
//   2. 训练完成后无提示 → 增加 <Modal> 完成确认弹窗
//   3. 用户确认后切换到"今日查看进度"（首页有今日学习清单 + 完成数 + 番茄统计）
//   4. 训练完成时自动结束进行中的番茄钟（completeSession），避免专注计时继续空跑

import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useHomeData } from "@/lib/home";
import { TrainSessionFlow } from "@/components/TrainSessionFlow";
import { Icon } from "@/components/Icon";
import { Button, Modal } from "@/components/ui";
import { POMODORO_OPEN_EVENT, getRunningSession, completeSession } from "@/lib/timer/pomodoro";
import { parseSceneParams } from "@/lib/study-queue/nav-params";

interface TrainProgress {
  currentIndex: number;
  total: number;
  questionsAnswered: number;
  questionsCorrect: number;
  phase: string;
}

export default function TrainClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const scene = useMemo(() => parseSceneParams(searchParams), [searchParams]);
  const { studyQueue, reload } = useHomeData();
  const [sessionStartTime] = useState(() => Date.now());
  const [elapsedMinutes, setElapsedMinutes] = useState(0);
  // 防止 StrictMode 双调用导致重复唤起番茄钟
  const pomodoroTriggeredRef = useRef(false);
  // 训练进度（由 TrainSessionFlow 上报）
  const [progress, setProgress] = useState<TrainProgress | null>(null);
  // 完成确认弹窗：训练 phase === "completed" 时显示
  const [completionOpen, setCompletionOpen] = useState(false);
  // 防止重复触发完成流程（StrictMode / 多次 phase 变化）
  const completionHandledRef = useRef(false);
  // 用户确认跳转中（避免重复点击）
  const [navigating, setNavigating] = useState(false);
  // 完成时是否真的有番茄钟被结束（决定完成 Modal 文案，避免"谎报军情"）
  const [pomodoroCompleted, setPomodoroCompleted] = useState(false);

  // 训练会话重排：先学新内容，后复习。
  // useHomeData 返回的 studyQueue 按 FSRS 紧迫度排序（review 高于 new），
  // 适合首页"今日学习清单"展示紧迫感；但训练会话的体感是"先学新再复习"，
  // 因此这里按 type 重排：new 在前（保持 priority 降序），review 在后（保持 priority 降序）。
  // 首页 studyQueue 的排序不受影响，仅在训练页本地重排。
  //
  // 2026-07-25 交互闭环：如果 URL 带了场景参数（planId/nodeId/cardId/date），
  // 则按参数过滤队列——用户从首页点某个任务进训练页，应该只训练那一项/那一组，
  // 而不是把今日全部任务塞给他。这是"我刚点过的东西在新页面应该默认选中"的体现。
  const orderedQueue = useMemo(() => {
    // 场景过滤：任一参数存在时启用
    const hasSceneFilter =
      !!scene.planId || !!scene.nodeId || !!scene.cardId || !!scene.date;
    let queue = studyQueue;
    if (hasSceneFilter) {
      queue = studyQueue.filter((t) => {
        if (scene.planId && t.planId !== scene.planId) return false;
        if (scene.nodeId && t.nodeId !== scene.nodeId) return false;
        if (scene.cardId && t.cardId !== scene.cardId) return false;
        if (scene.date && t.date !== scene.date) return false;
        return true;
      });
    }
    const newTasks = queue.filter((t) => t.type === "new");
    const reviewTasks = queue.filter((t) => t.type === "review");
    return [...newTasks, ...reviewTasks];
  }, [studyQueue, scene]);

  // 计时器
  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedMinutes(Math.floor((Date.now() - sessionStartTime) / 60000));
    }, 30000);
    return () => clearInterval(timer);
  }, [sessionStartTime]);

  // 进入训练会话时自动唤起番茄钟（沉浸专注的氛围感）
  // 仅当番茄钟未在运行时才唤起——避免打断用户已经开始的专注会话
  useEffect(() => {
    let cancelled = false;
    async function maybeOpenPomodoro() {
      if (orderedQueue.length === 0 || pomodoroTriggeredRef.current) return;
      // 先检测番茄钟是否正在运行（status="running"），运行中则不打扰
      try {
        const running = await getRunningSession();
        if (running) {
          // 已有番茄钟在跑，不重复唤起（小 widget 已在右下角可见）
          pomodoroTriggeredRef.current = true;
          return;
        }
      } catch {
        // 读取失败时降级为唤起（宁可重复唤起也不漏唤起）
      }
      if (cancelled) return;
      pomodoroTriggeredRef.current = true;
      try {
        window.dispatchEvent(new CustomEvent(POMODORO_OPEN_EVENT));
      } catch {
        // 极端环境下 dispatchEvent 可能抛错，忽略
      }
    }
    void maybeOpenPomodoro();
    return () => {
      cancelled = true;
    };
  }, [orderedQueue.length]);

  // 进度回调：TrainSessionFlow 每次状态变化时上报
  const handleProgressChange = useCallback((p: TrainProgress) => {
    setProgress(p);
  }, []);

  // 训练完成处理：phase === "completed" 时自动触发
  // 1. 弹完成确认 Modal
  // 2. 自动结束进行中的番茄钟（completeSession，计入今日统计）
  // 3. 等用户确认后跳首页查看今日进度
  useEffect(() => {
    if (progress?.phase !== "completed") return;
    if (completionHandledRef.current) return;
    completionHandledRef.current = true;

    setCompletionOpen(true);

    // 自动结束进行中的番茄钟（不阻塞 UI）
    void (async () => {
      try {
        const running = await getRunningSession();
        if (running) {
          // 训练已结束，番茄钟没必要继续空跑 → completeSession 写入今日统计
          await completeSession(running.id);
          setPomodoroCompleted(true);
        }
      } catch {
        // 番茄钟结束失败不阻断训练完成流程
      }
    })();
  }, [progress?.phase]);

  // 用户点击"查看今日进度"：跳首页（首页有今日学习清单 + 完成数 + 番茄统计 + 7 天热力图）
  const handleViewTodayProgress = useCallback(() => {
    if (navigating) return;
    setNavigating(true);
    // 先 reload 一次首页数据（让今日完成数立即更新），再跳转
    void reload().finally(() => {
      router.push("/");
    });
  }, [navigating, reload, router]);

  if (orderedQueue.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center pb-20 dark:bg-gray-900">
        <Icon name="check-circle" className="w-16 h-16 text-green-500 mb-4" />
        <h1 className="text-2xl font-bold mb-2 text-gray-900 dark:text-gray-100">今天的训练完成了！</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
          休息一下，明天继续。
        </p>
        <Button variant="primary" size="lg" onClick={handleViewTodayProgress}>
          查看今日进度
        </Button>
      </div>
    );
  }

  // 顶部进度条文案：
  // - 进行中：第 {currentIndex+1}/{total} 项 · 专注 {elapsedMinutes}分钟
  // - 已完成：已完成 {correct}/{answered} 题
  const progressText = progress?.phase === "completed"
    ? `已完成 ${progress.questionsCorrect}/${progress.questionsAnswered} 题`
    : `第 ${(progress?.currentIndex ?? 0) + 1}/${orderedQueue.length} 项 · 专注 ${elapsedMinutes}分钟`;

  return (
    <div className="min-h-screen pb-20 dark:bg-gray-900">
      {/* 顶部进度条 */}
      <div className="sticky top-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur-lg border-b border-gray-200 dark:border-gray-800 px-4 py-3 z-10">
        <div className="flex items-center justify-between max-w-2xl mx-auto">
          <Link href="/" aria-label="返回首页">
            <Icon name="chevron-right" className="w-5 h-5 rotate-180 text-gray-400 dark:text-gray-500" />
          </Link>
          <div className="text-center">
            <p className="text-xs text-gray-400 dark:text-gray-500">训练中</p>
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
              {progressText}
            </p>
          </div>
          <div className="w-5" />
        </div>
      </div>

      {/* 训练会话核心 */}
      <div className="p-4 max-w-2xl mx-auto">
        <TrainSessionFlow
          studyQueue={orderedQueue}
          onSessionComplete={() => reload()}
          onProgressChange={handleProgressChange}
        />
      </div>

      {/* 训练完成确认 Modal
          - 用户反馈：训练做完后应该提示用户已完成，用户确定后切换到今日查看进度
          - 番茄时钟自动结束（completeSession 已在 useEffect 中调用） */}
      <Modal
        open={completionOpen}
        onClose={() => setCompletionOpen(false)}
        title="训练完成"
        size="sm"
        mobilePosition="center"
        closeOnBackdropClick={false}
        closeOnEsc={false}
      >
        <div className="text-center py-2 space-y-3">
          <Icon name="check-circle" className="w-14 h-14 text-green-500 mx-auto" />
          <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">
            今天的训练完成了！
          </h2>
          {progress && (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              答对 <span className="font-bold text-green-600 dark:text-green-400">{progress.questionsCorrect}</span>
              {" / "}
              <span className="font-bold text-gray-700 dark:text-gray-300">{progress.questionsAnswered}</span> 题
              {" · "}专注 {elapsedMinutes} 分钟
            </p>
          )}
          {pomodoroCompleted && (
            <p className="text-xs text-gray-400 dark:text-gray-500">
              番茄钟已自动结束并计入今日统计
            </p>
          )}
          <div className="pt-2">
            <Button
              variant="primary"
              block
              size="lg"
              loading={navigating}
              onClick={handleViewTodayProgress}
              leftIcon="check"
            >
              查看今日进度
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
