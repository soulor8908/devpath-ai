"use client";

// app/train/TrainClient.tsx
// 训练会话页客户端——沉浸式学习，不跳转

import { useState, useEffect } from "react";
import Link from "next/link";
import { useHomeData } from "@/lib/home";
import { TrainSessionFlow } from "@/components/TrainSessionFlow";
import { Icon } from "@/components/Icon";
import { LinkButton } from "@/components/ui";

export default function TrainClient() {
  const { studyQueue, reload } = useHomeData();
  const [sessionStartTime] = useState(() => Date.now());
  const [elapsedMinutes, setElapsedMinutes] = useState(0);

  // 计时器
  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedMinutes(Math.floor((Date.now() - sessionStartTime) / 60000));
    }, 30000);
    return () => clearInterval(timer);
  }, [sessionStartTime]);

  if (studyQueue.length === 0) {
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
              第 1/{studyQueue.length} 项 · 专注 {elapsedMinutes}分钟
            </p>
          </div>
          <div className="w-5" />
        </div>
      </div>

      {/* 训练会话核心 */}
      <div className="p-4 max-w-2xl mx-auto">
        <TrainSessionFlow
          studyQueue={studyQueue}
          onSessionComplete={() => reload()}
        />
      </div>
    </div>
  );
}
