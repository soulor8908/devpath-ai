"use client";

// components/PathCoachInsight.tsx
// AI 教练洞察——有温度的每日一句话，不是冰冷统计
//
// 设计（乔布斯视角）：
//   - 不显示"今日调用数/采纳率"这种工程师自嗨指标
//   - 用教练的口吻说一句话，基于用户昨天/今天的行为
//   - 举例："你昨天在向量检索相关题上错了2道，我们今天会先巩固这部分再往前推进。"
//
// 设计（卡帕西视角）：
//   - 4 种 tone 对应 4 套颜色（鼓励/提醒/挑战/庆祝），全部带 dark: 配对
//   - 检测的浅色 utility（bg-blue-50/orange-50/purple-50/green-50 + border-*-200）
//     都不在 LIGHT_DARK_PAIRS 检测范围（仅检测 bg-white/gray-*、text-gray-*、border-gray-*），
//     但仍按设计系统 3.2 节主动配对 dark: 变体
//   - null 时返回 null（首屏无数据时整块不渲染）

import { Icon, type IconName } from "@/components/Icon";

export type CoachInsightTone = "encouraging" | "reminding" | "challenging" | "celebrating";

export interface CoachInsight {
  tone: CoachInsightTone;
  message: string;
  icon: IconName;
}

interface PathCoachInsightProps {
  insight: CoachInsight | null;
}

const TONE_STYLES: Record<CoachInsightTone, string> = {
  encouraging: "bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300",
  reminding: "bg-orange-50 dark:bg-orange-950/30 border-orange-200 dark:border-orange-800 text-orange-700 dark:text-orange-300",
  challenging: "bg-purple-50 dark:bg-purple-950/30 border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300",
  celebrating: "bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800 text-green-700 dark:text-green-300",
};

export function PathCoachInsight({ insight }: PathCoachInsightProps) {
  if (!insight) return null;

  return (
    <div className={`rounded-xl border p-3 flex items-start gap-2.5 ${TONE_STYLES[insight.tone]}`}>
      <Icon name={insight.icon} className="w-4 h-4 mt-0.5 shrink-0" />
      <p className="text-sm leading-relaxed">{insight.message}</p>
    </div>
  );
}
