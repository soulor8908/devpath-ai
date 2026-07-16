"use client";

// components/CurrentTaskCard.tsx
// 首页"现在该做什么"卡片（节奏引擎版）：
// - 主路径：客户端直接调用 collectRhythmContext + getNextAction（IndexedDB）
// - 展示 NextAction.reason + 对应按钮（开始专注 / 去复习 / 去休息 / 继续专注 / 复盘今天）
// - 失败兜底：降级回原 routine-based 时段显示（保留对作息时段的兜底展示）
// - 每 30 秒刷新一次
//
// 与 app/api/rhythm/route.ts 的关系：
//   API 是统一入口（便于未来服务端缓存），客户端直调 lib 是低延迟主路径。
//   两者都调 collectRhythmContext + getNextAction，结果一致。

import { useState, useEffect } from "react";
import Link from "next/link";
import { loadRoutineMarkdown, parseRoutine, getCurrentTask } from "@/lib/routine";
import { chinaTimeNow } from "@/lib/time";
import { collectRhythmContext, getNextAction } from "@/lib/ai/rhythm-engine";
import type { NextAction, CurrentTask as CurrentTaskType } from "@/lib/types";
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
  const [action, setAction] = useState<NextAction | null>(null);
  const [fallbackTask, setFallbackTask] = useState<CurrentTaskType | null>(null);
  const [hasRoutine, setHasRoutine] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function refresh() {
      // 主路径：节奏引擎决策
      try {
        const ctx = await collectRhythmContext();
        if (cancelled) return;
        const next = await getNextAction(ctx);
        if (cancelled) return;
        setAction(next);
        setLoading(false);
        return;
      } catch {
        // 节奏引擎失败 → 降级到 routine 兜底
      }

      // 兜底：routine-based 显示
      try {
        const md = await loadRoutineMarkdown();
        if (cancelled) return;
        if (!md) {
          setHasRoutine(false);
          setFallbackTask(null);
          setLoading(false);
          return;
        }
        setHasRoutine(true);
        setFallbackTask(getCurrentTask(parseRoutine(md), chinaTimeNow()));
      } catch {
        setHasRoutine(false);
      }
      setLoading(false);
    }

    refresh();
    const timer = setInterval(refresh, 30_000);
    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, []);

  if (loading) {
    return (
      <div className="bg-white rounded-xl p-4 shadow-sm">
        <p className="text-gray-400 text-sm">正在分析你当下的状态...</p>
      </div>
    );
  }

  // 主路径：节奏引擎
  if (action) {
    return <RhythmActionCard action={action} />;
  }

  // 兜底：未配置 routine
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

  // 兜底：routine-based 时段显示
  if (!fallbackTask) return null;

  if (!fallbackTask.current) {
    return (
      <div className="bg-white rounded-xl p-4 shadow-sm">
        <p className="text-gray-500 text-sm">当前无安排</p>
        {fallbackTask.next && (
          <p className="text-sm mt-1">
            下一项：<span className="font-medium">{fallbackTask.next.activity}</span>（{fallbackTask.next.start}）
          </p>
        )}
      </div>
    );
  }

  const colorClass = TYPE_COLORS[fallbackTask.current.type] || TYPE_COLORS.其他;
  const isLearn = fallbackTask.current.type === "学习";
  const isRest = fallbackTask.current.type === "休息";

  return (
    <div className={`rounded-xl p-4 border-2 ${colorClass}`}>
      <div className="flex justify-between items-start">
        <div>
          <p className="text-xs text-gray-500 mb-1">现在该做什么</p>
          <p className="text-lg font-bold">{fallbackTask.current.activity}</p>
          <p className="text-sm text-gray-500">
            {fallbackTask.current.start} - {fallbackTask.current.end}
          </p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold">{fallbackTask.minutesLeft}</p>
          <p className="text-xs text-gray-500">分钟剩余</p>
        </div>
      </div>

      {isLearn && (
        <Link
          href="/review"
          className="mt-3 flex items-center justify-between rounded-lg bg-white/70 px-3 py-2 hover:bg-white"
        >
          <span className="text-sm">
            <Icon name="book" className="w-4 h-4 inline-block align-middle" /> 学习时段 · 去复习今日卡片
          </span>
          <span className="text-xs text-blue-600">去复习 →</span>
        </Link>
      )}

      {isRest && (
        <Link
          href="/rest"
          className="mt-3 flex items-center justify-between rounded-lg bg-white/70 px-3 py-2 hover:bg-white"
        >
          <span className="text-sm"><Icon name="moon" className="w-4 h-4 inline-block align-middle" /> 休息时段 · 去呼吸放松</span>
          <span className="text-xs text-green-600">开始 478 呼吸 →</span>
        </Link>
      )}

      {fallbackTask.next && (
        <p className="text-xs text-gray-400 mt-2">
          下一项：{fallbackTask.next.activity}（{fallbackTask.next.start}）
        </p>
      )}
    </div>
  );
}

// ============ 节奏引擎结果卡片 ============

function RhythmActionCard({ action }: { action: NextAction }) {
  const { type, reason } = action;

  // 按钮配置：根据 NextAction.type 决定跳转目标 + 文案 + 图标
  const button = pickActionButton(type);

  // 卡片颜色：根据 type 区分语义
  const cardColor = pickCardColor(type);

  return (
    <div className={`rounded-xl p-4 border-2 ${cardColor}`}>
      <div className="flex justify-between items-start gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-xs text-gray-500 mb-1">现在该做什么</p>
          <p className="text-base font-bold leading-snug">{reason}</p>
        </div>
        <Icon name={button.icon} className="w-6 h-6 shrink-0 text-gray-400" />
      </div>

      {button && (
        <Link
          href={button.href}
          className="mt-3 flex items-center justify-between rounded-lg bg-white/70 px-3 py-2 hover:bg-white transition-colors"
        >
          <span className="text-sm">
            <Icon name={button.icon} className="w-4 h-4 inline-block align-middle" /> {button.label}
          </span>
          <span className={`text-xs ${button.accentColor}`}>{button.cta} →</span>
        </Link>
      )}
    </div>
  );
}

/** 根据 NextAction.type 选按钮（href + 文案 + 图标 + 强调色） */
function pickActionButton(type: NextAction["type"]): {
  href: string;
  label: string;
  cta: string;
  icon: Parameters<typeof Icon>[0]["name"];
  accentColor: string;
} {
  switch (type) {
    case "continue_focus":
      return {
        href: "/timer",
        label: "继续专注",
        cta: "回到计时页",
        icon: "clock",
        accentColor: "text-blue-600",
      };
    case "start_focus":
      return {
        href: "/timer",
        label: "开始专注",
        cta: "启动番茄钟",
        icon: "target",
        accentColor: "text-blue-600",
      };
    case "review":
      return {
        href: "/review",
        label: "去复习",
        cta: "查看待复习卡片",
        icon: "book",
        accentColor: "text-purple-600",
      };
    case "break":
    case "rest":
      return {
        href: "/rest",
        label: "去休息",
        cta: "478 呼吸放松",
        icon: "moon",
        accentColor: "text-green-600",
      };
    case "plan_next_day":
      return {
        href: "/review",
        label: "复盘今天",
        cta: "规划明天",
        icon: "calendar-check",
        accentColor: "text-orange-600",
      };
    default:
      return {
        href: "/",
        label: "查看首页",
        cta: "返回",
        icon: "home",
        accentColor: "text-gray-600",
      };
  }
}

/** 根据 NextAction.type 选卡片底色 */
function pickCardColor(type: NextAction["type"]): string {
  switch (type) {
    case "continue_focus":
    case "start_focus":
      return "bg-blue-50 border-blue-200";
    case "review":
      return "bg-purple-50 border-purple-200";
    case "break":
    case "rest":
      return "bg-green-50 border-green-200";
    case "plan_next_day":
      return "bg-orange-50 border-orange-200";
    default:
      return "bg-white border-gray-200";
  }
}
