"use client";

// app/stats/ai-quality/page.tsx
// AI 质量仪表盘：展示 AI 调用统计、场景质量、Prompt 版本对比、失败模式聚类
// 数据来源：lib/ai/quality-tracker.ts 从 IndexedDB 读取（ai_call:* / ai_feedback:*）
// 设计目标（用户规范第 6 节）：
//   6.1 按场景的 AI 质量报告（调用数/平均评分/采纳率/再生成率/平均耗时）
//   6.2 Prompt 版本对比
//   6.3 失败模式聚类

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  getQualityReport,
  pruneOldRecords,
  type QualityReport,
} from "@/lib/ai/quality-tracker";
import { PROMPTS } from "@/lib/ai/prompts";
import type { AIScene } from "@/lib/types";
import { Icon, type IconName } from "@/components/Icon";

const SCENE_LABELS: Record<AIScene, string> = {
  knowledge_decompose: "知识树拆解",
  question_generate: "面试题生成",
  answer_generate: "答案生成",
  daily_nudge: "每日提醒",
  chat: "聊天",
  energy_pattern: "能量分析",
  status_enhance: "状态增强",
  weekly_report: "周报",
  adjust_plan: "计划调整",
  chat_tool_action: "工具动作执行",
  emotion_coping: "情绪应对建议",
  plan_generate: "精准计划生成",
  schedule_optimize: "日程优化",
  focus_session_start: "番茄启动",
};

// 时间范围选项
type Range = "7d" | "30d" | "all";
const RANGE_LABELS: Record<Range, string> = {
  "7d": "近 7 天",
  "30d": "近 30 天",
  all: "全部",
};

function rangeToSince(range: Range): string | undefined {
  if (range === "all") return undefined;
  const days = range === "7d" ? 7 : 30;
  const d = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  return d.toISOString();
}

// 格式化耗时
function fmtDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}

// 格式化百分比
function fmtPct(v: number | null): string {
  if (v === null) return "—";
  return `${v}%`;
}

// 格式化评分
function fmtRating(v: number | null): string {
  if (v === null) return "—";
  return v.toFixed(1);
}

// 格式化 token 数（带 K/M 简写）
function fmtTokens(n: number): string {
  if (n === 0) return "—";
  if (n < 1000) return String(n);
  if (n < 1_000_000) return `${(n / 1000).toFixed(1)}K`;
  return `${(n / 1_000_000).toFixed(2)}M`;
}

// 格式化 USD 成本
function fmtCost(v: number): string {
  if (v === 0) return "—";
  if (v < 0.01) return `$${v.toFixed(6)}`;
  return `$${v.toFixed(4)}`;
}

export default function AIQualityPage() {
  const [report, setReport] = useState<QualityReport | null>(null);
  const [range, setRange] = useState<Range>("30d");
  const [loading, setLoading] = useState(true);
  const [pruned, setPruned] = useState<number | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      // 静默清理 90 天前的旧记录
      const deleted = await pruneOldRecords(90);
      setPruned(deleted);
      const r = await getQualityReport(rangeToSince(range));
      setReport(r);
    } finally {
      setLoading(false);
    }
  }, [range]);

  useEffect(() => {
    void load();
  }, [load]);

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl p-4">
        <h1 className="text-2xl font-bold mb-4">AI 质量</h1>
        <p className="text-gray-500">加载中...</p>
      </div>
    );
  }

  if (!report) return null;

  const hasData = report.totalCalls > 0;

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-4">
      {/* 标题 + 返回 */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">AI 质量仪表盘</h1>
        <Link href="/stats" className="text-sm text-blue-500 hover:underline">
          ← 返回统计
        </Link>
      </div>

      {/* 时间范围切换 */}
      <div className="flex gap-2">
        {(Object.keys(RANGE_LABELS) as Range[]).map((r) => (
          <button
            key={r}
            onClick={() => setRange(r)}
            className={`px-3 py-1 text-sm rounded-full transition-colors ${
              range === r
                ? "bg-blue-500 text-white"
                : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
            }`}
          >
            {RANGE_LABELS[r]}
          </button>
        ))}
        <button
          onClick={() => void load()}
          className="ml-auto text-sm text-blue-500 hover:underline inline-flex items-center gap-1"
        >
          <Icon name="refresh-cw" className="w-4 h-4 inline-block align-middle" /> 刷新
        </button>
      </div>

      {!hasData ? (
        <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-8 text-center">
          <div className="mb-3 flex justify-center">
            <Icon name="chart" className="w-10 h-10 text-gray-400" />
          </div>
          <p className="text-gray-600 dark:text-gray-300 font-medium mb-1">
            还没有 AI 调用数据
          </p>
          <p className="text-sm text-gray-400">
            使用学习计划、每日提醒、AI 聊天等功能后，这里会展示 AI 输出质量统计。
          </p>
        </div>
      ) : (
        <>
          {/* 概览卡片 */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <StatCard label="AI 调用" value={String(report.totalCalls)} icon="sparkles" />
            <StatCard label="用户反馈" value={String(report.totalFeedback)} icon="message-circle" />
            <StatCard
              label="Token 总量"
              value={fmtTokens(report.totalTokens)}
              icon="zap"
            />
            <StatCard
              label="估算成本"
              value={fmtCost(report.totalCost)}
              icon="trending-up"
            />
          </div>

          {/* 时间范围副信息 */}
          <p className="text-xs text-gray-400 -mt-3">
            时间范围：
            {report.period.from
              ? `${report.period.from.slice(0, 10)} ~ ${report.period.to?.slice(0, 10) ?? ""}`
              : "—"}
            {" · "}
            场景数 {report.scenes.length}
            {report.totalTokens > 0 && " · 成本基于模型定价表估算（USD）"}
          </p>

          {pruned !== null && pruned > 0 && (
            <p className="text-xs text-gray-400">
              已自动清理 {pruned} 条 90 天前的旧记录
            </p>
          )}

          {/* 6.1 按场景的 AI 质量报告 */}
          <section>
            <h2 className="text-lg font-bold mb-3">按场景质量报告</h2>
            <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300">
                  <tr>
                    <th className="text-left px-3 py-2 font-medium">场景</th>
                    <th className="text-right px-3 py-2 font-medium">调用数</th>
                    <th className="text-right px-3 py-2 font-medium">平均评分</th>
                    <th className="text-right px-3 py-2 font-medium">采纳率</th>
                    <th className="text-right px-3 py-2 font-medium">再生成率</th>
                    <th className="text-right px-3 py-2 font-medium">平均耗时</th>
                    <th className="text-right px-3 py-2 font-medium">Token 数</th>
                    <th className="text-right px-3 py-2 font-medium">成本</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                  {report.scenes
                    .sort((a, b) => b.calls - a.calls)
                    .map((s) => (
                      <tr key={s.scene} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                        <td className="px-3 py-2 font-medium text-gray-800 dark:text-gray-200">
                          {SCENE_LABELS[s.scene] ?? s.scene}
                        </td>
                        <td className="text-right px-3 py-2 text-gray-600 dark:text-gray-300">{s.calls}</td>
                        <td className="text-right px-3 py-2">
                          <RatingCell rating={s.avgRating} />
                        </td>
                        <td className="text-right px-3 py-2 text-gray-600 dark:text-gray-300">
                          {fmtPct(s.adoptionRate)}
                        </td>
                        <td className="text-right px-3 py-2">
                          <RegenCell rate={s.regenerationRate} />
                        </td>
                        <td className="text-right px-3 py-2 text-gray-600 dark:text-gray-300">
                          {fmtDuration(s.avgDurationMs)}
                        </td>
                        <td className="text-right px-3 py-2 text-gray-600 dark:text-gray-300">
                          {fmtTokens(s.totalTokens)}
                        </td>
                        <td className="text-right px-3 py-2 text-gray-600 dark:text-gray-300">
                          {fmtCost(s.totalCost)}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
            <p className="text-xs text-gray-400 mt-2">
              采纳率 = adopted / (adopted + discarded) · 再生成率 = regenerated / calls · 评分仅来自显式反馈 · Token/成本仅统计有 usage 记录的调用
            </p>
          </section>

          {/* 6.2 Prompt 版本对比 */}
          {report.promptVersions.length > 0 && (
            <section>
              <h2 className="text-lg font-bold mb-3">Prompt 版本对比</h2>
              <div className="space-y-2">
                {report.promptVersions
                  .sort((a, b) => b.calls - a.calls)
                  .map((pv) => {
                    const [promptId, version] = pv.promptVersion.split(":");
                    const def = PROMPTS[promptId as keyof typeof PROMPTS];
                    return (
                      <div
                        key={pv.promptVersion}
                        className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-3"
                      >
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="font-medium text-sm text-gray-800 dark:text-gray-200 truncate">
                              {SCENE_LABELS[promptId as AIScene] ?? promptId}
                            </span>
                            <span className="text-xs px-1.5 py-0.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 rounded font-mono">
                              {version}
                            </span>
                          </div>
                          <span className="text-xs text-gray-400 shrink-0">{pv.calls} 次调用</span>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                          <span>评分 {fmtRating(pv.avgRating)}</span>
                          <span>采纳率 {fmtPct(pv.adoptionRate)}</span>
                          {def?.changelog && (
                            <span className="text-gray-400 truncate" title={def.changelog}>
                              · {def.changelog}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
              </div>
            </section>
          )}

          {/* 6.3 失败模式聚类 */}
          {report.failureClusters.length > 0 ? (
            <section>
              <h2 className="text-lg font-bold mb-3">失败模式聚类</h2>
              <p className="text-xs text-gray-400 mb-2">
                高再生成率的输入（至少 2 次调用 + 有再生成反馈），按再生成率排序
              </p>
              <div className="space-y-2">
                {report.failureClusters.map((c, i) => (
                  <div
                    key={`${c.scene}-${c.label}-${i}`}
                    className="flex items-center justify-between rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-3"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-400">#{i + 1}</span>
                        <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
                          {SCENE_LABELS[c.scene] ?? c.scene}
                        </span>
                      </div>
                      <code className="text-xs text-gray-500 dark:text-gray-400 truncate block mt-1">
                        {c.label}
                      </code>
                    </div>
                    <div className="text-right shrink-0 ml-2">
                      <div className="text-sm font-medium text-red-500">
                        {c.regenerationRate}% 再生成
                      </div>
                      <div className="text-xs text-gray-400">{c.count} 次调用</div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ) : (
            hasData && (
              <section>
                <h2 className="text-lg font-bold mb-3">失败模式聚类</h2>
                <p className="text-sm text-gray-400">
                  暂无明显的失败模式（没有输入出现 2 次以上的再生成反馈）。
                </p>
              </section>
            )
          )}
        </>
      )}
    </div>
  );
}

// === 子组件 ===

function StatCard({
  label,
  value,
  icon,
  small,
}: {
  label: string;
  value: string;
  icon: IconName;
  small?: boolean;
}) {
  return (
    <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-3">
      <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-1">
        <Icon name={icon} className="w-3.5 h-3.5" />
        <span>{label}</span>
      </div>
      <div className={`font-bold text-gray-800 dark:text-gray-100 ${small ? "text-xs" : "text-xl"}`}>
        {value}
      </div>
    </div>
  );
}

function RatingCell({ rating }: { rating: number | null }) {
  if (rating === null) return <span className="text-gray-300">—</span>;
  const color = rating >= 4 ? "text-green-600" : rating >= 3 ? "text-yellow-600" : "text-red-500";
  return <span className={`font-medium ${color}`}>{rating.toFixed(1)}</span>;
}

function RegenCell({ rate }: { rate: number | null }) {
  if (rate === null) return <span className="text-gray-300">—</span>;
  const color = rate >= 30 ? "text-red-500" : rate >= 15 ? "text-yellow-600" : "text-gray-600 dark:text-gray-300";
  return <span className={color}>{rate}%</span>;
}
