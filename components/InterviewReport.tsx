"use client";

// components/InterviewReport.tsx
// 面试结束后的结构化反馈报告
//
// 设计（乔布斯视角）：
//   - 第一屏就是总分——让用户立刻看到结果，而不是要读 3 屏才看到评分
//   - 三个区块用语义色：绿色=优势 / 橙色=待改进 / 蓝色=下一步
//   - canInterview=true 时用绿色渐变背景庆祝，false 时用橙色渐变提示继续练习
//   - 底部双按钮：返回首页（弱化）+ 再练一次（主操作）
//
// 设计（卡帕西视角）：
//   - 组件纯展示：report 数据由父组件传入，本组件不 fetch 不持有状态
//   - 列表用稳定 key（i+字段前缀），避免 React 重渲染抖动
//   - 渐变背景用 Tailwind 原生 from-/to- 令牌，禁止任意颜色逃逸值
//   - 全部浅色 utility 都带 dark: 配对（通过 ui-design-system-guard 守护）

import type { InterviewReport as Report } from "@/lib/ai/interview-coach";
import { Icon } from "@/components/Icon";
import { Button, LinkButton } from "@/components/ui";

interface InterviewReportProps {
  report: Report;
  onRetry: () => void;
}

export function InterviewReportView({ report, onRetry }: InterviewReportProps) {
  return (
    <div className="max-w-2xl mx-auto p-4 pb-20 space-y-4 dark:bg-gray-900 min-h-screen">
      {/* 总分卡片 */}
      <div
        className={`rounded-card p-6 text-center ${
          report.canInterview
            ? "bg-gradient-to-br from-green-500 to-emerald-600 text-white"
            : "bg-gradient-to-br from-orange-500 to-red-600 text-white"
        }`}
      >
        <p className="text-sm opacity-80 mb-1">面试评分</p>
        <p className="text-5xl font-bold mb-2">{report.overallScore}</p>
        <p className="text-sm">
          {report.canInterview
            ? "你准备好参加真实面试了！"
            : "继续练习，你会更好的"}
        </p>
      </div>

      {/* 答得好的地方 */}
      {report.strengths.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-card p-4 border border-gray-100 dark:border-gray-700">
          <h3 className="text-sm font-medium text-green-600 dark:text-green-400 mb-2 flex items-center gap-1.5">
            <Icon name="check-circle" className="w-4 h-4" />
            答得好的地方
          </h3>
          <ul className="space-y-1.5">
            {report.strengths.map((s, i) => (
              <li
                key={`strength-${i}`}
                className="text-sm text-gray-700 dark:text-gray-300 flex items-start gap-2"
              >
                <Icon
                  name="check"
                  className="w-3.5 h-3.5 text-green-500 mt-0.5 shrink-0"
                  aria-hidden="true"
                />
                <span>{s}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* 可以更好的地方 */}
      {report.weaknesses.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-card p-4 border border-gray-100 dark:border-gray-700">
          <h3 className="text-sm font-medium text-orange-600 dark:text-orange-400 mb-2 flex items-center gap-1.5">
            <Icon name="alert" className="w-4 h-4" />
            可以更好的地方
          </h3>
          <ul className="space-y-1.5">
            {report.weaknesses.map((w, i) => (
              <li
                key={`weakness-${i}`}
                className="text-sm text-gray-700 dark:text-gray-300 flex items-start gap-2"
              >
                <Icon
                  name="alert"
                  className="w-3.5 h-3.5 text-orange-500 mt-0.5 shrink-0"
                  aria-hidden="true"
                />
                <span>{w}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* 改进建议 */}
      {report.improvements.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-card p-4 border border-gray-100 dark:border-gray-700">
          <h3 className="text-sm font-medium text-blue-600 dark:text-blue-400 mb-2 flex items-center gap-1.5">
            <Icon name="lightbulb" className="w-4 h-4" />
            具体改进建议
          </h3>
          <ul className="space-y-1.5">
            {report.improvements.map((imp, i) => (
              <li
                key={`improvement-${i}`}
                className="text-sm text-gray-700 dark:text-gray-300 flex items-start gap-2"
              >
                <span className="text-blue-500 dark:text-blue-400 mt-0.5 font-medium shrink-0">
                  {i + 1}.
                </span>
                <span>{imp}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* 下一步建议 */}
      <div className="bg-white dark:bg-gray-800 rounded-card p-4 border border-gray-100 dark:border-gray-700">
        <h3 className="text-sm font-medium text-blue-600 dark:text-blue-400 mb-2 flex items-center gap-1.5">
          <Icon name="target" className="w-4 h-4" />
          下一步建议
        </h3>
        <p className="text-sm text-gray-700 dark:text-gray-300">{report.nextStep}</p>
      </div>

      {/* 操作按钮 */}
      <div className="flex gap-3">
        <LinkButton href="/" variant="ghost" size="lg" block>
          返回首页
        </LinkButton>
        <Button
          variant="primary"
          size="lg"
          block
          onClick={onRetry}
          leftIcon="rotate"
        >
          再练一次
        </Button>
      </div>
    </div>
  );
}
