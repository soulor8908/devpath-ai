"use client";

// components/CurrentTaskCard.tsx
// 首页"现在该做什么"卡片：
// - 从 IndexedDB 加载用户在 profile 配置的时间表（key="routine:default"）
// - 实时显示当前任务 + 剩余分钟 + 下一项
// - FSRS 联动：学习时段 → 显示今日待复习卡片数，点击进入 /review
// - 休息联动：休息时段 → 显示"去呼吸放松"入口，点击进入 /rest
// - 每 30 秒刷新一次

import { useState, useEffect } from "react";
import Link from "next/link";
import { loadRoutineMarkdown, parseRoutine, getCurrentTask } from "@/lib/routine";
import { chinaTimeNow } from "@/lib/time";
import { listItems } from "@/lib/storage/db";
import { getDueCards } from "@/lib/fsrs";
import { KEY_PREFIXES } from "@/lib/types";
import type { CurrentTask as CurrentTaskType, ReviewCard } from "@/lib/types";
import { Icon } from "@/components/Icon";

const TYPE_COLORS: Record<string, string> = {
  运动: "bg-orange-50 border-orange-200",
  学习: "bg-blue-50 border-blue-200",
  休息: "bg-green-50 border-green-200",
  家庭: "bg-pink-50 border-pink-200",
  睡眠: "bg-purple-50 border-purple-200",
  工作: "bg-gray-50 border-gray-200",
  其他: "bg-white border-gray-200",
};

export function CurrentTaskCard() {
  const [task, setTask] = useState<CurrentTaskType | null>(null);
  const [hasRoutine, setHasRoutine] = useState<boolean | null>(null);
  const [dueCount, setDueCount] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function refresh() {
      const md = await loadRoutineMarkdown();
      if (cancelled) return;
      if (!md) {
        setHasRoutine(false);
        setTask(null);
        return;
      }
      setHasRoutine(true);
      const slots = parseRoutine(md);
      setTask(getCurrentTask(slots, chinaTimeNow()));

      // 学习时段时顺便算一下待复习卡片数
      const t = getCurrentTask(slots, chinaTimeNow());
      if (t.current?.type === "学习") {
        const cards = await listItems<ReviewCard>(KEY_PREFIXES.CARD);
        if (cancelled) return;
        setDueCount(getDueCards(cards).length);
      }
    }

    refresh();
    const timer = setInterval(refresh, 30_000);
    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, []);

  if (hasRoutine === null) {
    return (
      <div className="bg-white rounded-xl p-4 shadow-sm">
        <p className="text-gray-400 text-sm">加载时间表...</p>
      </div>
    );
  }

  if (hasRoutine === false) {
    return (
      <div className="bg-white rounded-xl p-4 shadow-sm">
        <p className="text-sm text-gray-500 mb-2">尚未配置每日时间表</p>
        <Link href="/profile" className="text-xs text-blue-600 underline">
          去个人中心配置 →
        </Link>
      </div>
    );
  }

  if (!task) return null;

  if (!task.current) {
    return (
      <div className="bg-white rounded-xl p-4 shadow-sm">
        <p className="text-gray-500 text-sm">当前无安排</p>
        {task.next && (
          <p className="text-sm mt-1">
            下一项：<span className="font-medium">{task.next.activity}</span>（{task.next.start}）
          </p>
        )}
      </div>
    );
  }

  const colorClass = TYPE_COLORS[task.current.type] || TYPE_COLORS.其他;
  const isLearn = task.current.type === "学习";
  const isRest = task.current.type === "休息";

  return (
    <div className={`rounded-xl p-4 border-2 ${colorClass}`}>
      <div className="flex justify-between items-start">
        <div>
          <p className="text-xs text-gray-500 mb-1">现在该做什么</p>
          <p className="text-lg font-bold">{task.current.activity}</p>
          <p className="text-sm text-gray-500">
            {task.current.start} - {task.current.end}
          </p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold">{task.minutesLeft}</p>
          <p className="text-xs text-gray-500">分钟剩余</p>
        </div>
      </div>

      {/* FSRS 联动：学习时段 → 推荐待复习卡片 */}
      {isLearn && (
        <Link
          href="/review"
          className="mt-3 flex items-center justify-between rounded-lg bg-white/70 px-3 py-2 hover:bg-white"
        >
          <span className="text-sm">
            <Icon name="book" className="w-4 h-4 inline-block align-middle" /> 学习时段 · 今日待复习 <b className="text-blue-600">{dueCount}</b> 张
          </span>
          <span className="text-xs text-blue-600">去复习 →</span>
        </Link>
      )}

      {/* 休息联动：休息时段 → 弹出呼吸工具入口 */}
      {isRest && (
        <Link
          href="/rest"
          className="mt-3 flex items-center justify-between rounded-lg bg-white/70 px-3 py-2 hover:bg-white"
        >
          <span className="text-sm"><Icon name="moon" className="w-4 h-4 inline-block align-middle" /> 休息时段 · 去呼吸放松</span>
          <span className="text-xs text-green-600">开始 478 呼吸 →</span>
        </Link>
      )}

      {task.next && (
        <p className="text-xs text-gray-400 mt-2">
          下一项：{task.next.activity}（{task.next.start}）
        </p>
      )}
    </div>
  );
}
