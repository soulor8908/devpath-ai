"use client";

// app/train/TrainClient.tsx
// 训练会话页客户端——沉浸式学习，不跳转

import { useState, useEffect, useRef, useMemo } from "react";
import Link from "next/link";
import { useHomeData } from "@/lib/home";
import { TrainSessionFlow } from "@/components/TrainSessionFlow";
import { Icon } from "@/components/Icon";
import { LinkButton } from "@/components/ui";
import { POMODORO_OPEN_EVENT, getRunningSession } from "@/lib/timer/pomodoro";

export default function TrainClient() {
  const { studyQueue, reload } = useHomeData();
  const [sessionStartTime] = useState(() => Date.now());
  const [elapsedMinutes, setElapsedMinutes] = useState(0);
  // 防止 StrictMode 双调用导致重复唤起番茄钟
  const pomodoroTriggeredRef = useRef(false);

  // 训练会话重排：先学新内容，后复习。
  // useHomeData 返回的 studyQueue 按 FSRS 紧迫度排序（review 高于 new），
  // 适合首页"今日学习清单"展示紧迫感；但训练会话的体感是"先学新再复习"，
  // 因此这里按 type 重排：new 在前（保持 priority 降序），review 在后（保持 priority 降序）。
  // 首页 studyQueue 的排序不受影响，仅在训练页本地重排。
  const orderedQueue = useMemo(() => {
    const newTasks = studyQueue.filter((t) => t.type === "new");
    const reviewTasks = studyQueue.filter((t) => t.type === "review");
    return [...newTasks, ...reviewTasks];
  }, [studyQueue]);

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

  if (orderedQueue.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center pb-20 dark:bg-gray-900">
        <Icon name="check-circle" className="w-16 h-16 text-green-500 mb-4" />
        <h1 className="text-2xl font-bold mb-2 text-gray-900 dark:text-gray-100">今天的训练完成了！</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
          休息一下，明天继续。
        </p>
        <LinkButton href="/" variant="primary" size="lg">
          返回首页
        </LinkButton>
      </div>
    );
  }

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
              第 1/{orderedQueue.length} 项 · 专注 {elapsedMinutes}分钟
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
        />
      </div>
    </div>
  );
}
