"use client";

// components/PathProgressBar.tsx
// 路径进度可视化——首页 Hero 区核心组件（V2 乔布斯视角重构）
//
// 设计（乔布斯视角）：
//   - 替代原 CurrentTaskCard 作为视觉焦点
//   - 用户打开 app 第一眼看到：离目标还有多远
//   - 进度条 + 当前位置 + 预计时间 = 3 秒知道答案
//   - 一个主按钮：开始今天的训练
//
// 设计（卡帕西视角）：
//   - 进度条带 role="progressbar" + aria 属性（WCAG 4.6）
//   - emoji 作为纯装饰，加 aria-hidden="true"（设计系统 5.4 例外条款）
//   - dark: 配对完整（守护测试 0 容忍）
//   - 渐变色作为饱和背景白名单，不参与 dark 配对

import Link from "next/link";
import { Icon } from "@/components/Icon";
import { Button } from "@/components/ui";

interface PathProgressBarProps {
  careerTitle: string;
  /** 职业路径 emoji 装饰（来自 CareerPath.icon）—— 纯装饰，必须 aria-hidden */
  icon: string;
  /** 进度 0-100 */
  progress: number;
  /** 预计剩余周数 */
  weeksLeft: number;
  /** 当前正在学习的节点标题 */
  currentNodeTitle: string;
  /** 「开始今天的训练」按钮跳转地址，默认 /train */
  trainHref?: string;
}

export function PathProgressBar({
  careerTitle,
  icon,
  progress,
  weeksLeft,
  currentNodeTitle,
  trainHref = "/train",
}: PathProgressBarProps) {
  // 进度值 clamp 到 [0, 100]，避免异常输入导致进度条溢出
  const clampedProgress = Math.max(0, Math.min(100, Math.round(progress)));

  return (
    <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl p-5 text-white shadow-lg">
      {/* 头部：目标 */}
      <div className="flex items-center gap-2 mb-4">
        <span className="text-2xl" aria-hidden="true">{icon}</span>
        <span className="text-sm opacity-90">{careerTitle}</span>
      </div>

      {/* 进度条 */}
      <div className="mb-3">
        <div className="flex justify-between items-baseline mb-1.5">
          <span className="text-3xl font-bold">{clampedProgress}%</span>
          <span className="text-sm opacity-80">
            预计 <span className="font-bold text-yellow-300">{weeksLeft} 周</span> 后可面试
          </span>
        </div>
        <div
          className="h-3 bg-white/20 rounded-full overflow-hidden"
          role="progressbar"
          aria-valuenow={clampedProgress}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`离 ${careerTitle} offer 还有 ${clampedProgress}%`}
        >
          <div
            className="h-full bg-white dark:bg-gray-100 rounded-full transition-all duration-1000"
            style={{ width: `${clampedProgress}%` }}
          />
        </div>
      </div>

      {/* 当前位置 */}
      <div className="flex items-center gap-2 mb-4 text-sm opacity-90">
        <Icon name="target" className="w-4 h-4 shrink-0" />
        <span>当前位置：</span>
        <span className="font-bold">{currentNodeTitle}</span>
      </div>

      {/* 主按钮：包裹 Link 让整按钮可点击跳转 /train */}
      <Link href={trainHref}>
        <Button
          variant="secondary"
          size="lg"
          block
          className="bg-white dark:bg-gray-50 text-blue-600 hover:bg-gray-50 dark:hover:bg-gray-100 font-bold"
          leftIcon="target"
        >
          开始今天的训练
        </Button>
      </Link>
    </div>
  );
}
