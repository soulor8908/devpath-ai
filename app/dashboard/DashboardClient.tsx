"use client";

// app/dashboard/DashboardClient.tsx
// 学习仪表盘：聚合学习日志与计划，展示统计、热力图、掌握度、薄弱点与最近计划

import { useState, useEffect } from "react";
import Link from "next/link";
import { listItems } from "@/lib/storage/db";
import { KEY_PREFIXES, type LearningPlan, type LearnStats } from "@/lib/types";
import { computeStats } from "@/lib/learn-log";
import { Icon, type IconName } from "@/components/Icon";
import { openChatModal } from "@/lib/chat-modal-store";

// 格式化日期为 YYYY-MM-DD（本地时区）
function formatDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

// 根据活动数返回热力图颜色（Tailwind 完整类名，便于 JIT 扫描）
function getHeatmapColor(count: number): string {
  if (!count || count === 0) return "bg-gray-100";
  if (count <= 2) return "bg-green-200";
  if (count <= 5) return "bg-green-400";
  return "bg-green-600";
}

// 根据掌握度返回进度条颜色
function getMasteryColor(mastery: number): string {
  if (mastery >= 80) return "bg-green-500";
  if (mastery >= 50) return "bg-yellow-400";
  return "bg-red-500";
}

export default function DashboardClient() {
  const [stats, setStats] = useState<LearnStats | null>(null);
  const [plans, setPlans] = useState<LearningPlan[]>([]);
  const [nodeTitleMap, setNodeTitleMap] = useState<
    Record<string, { title: string; planId: string }>
  >({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [s, allPlans] = await Promise.all([
          computeStats(),
          listItems<LearningPlan>(KEY_PREFIXES.PLAN),
        ]);
        if (cancelled) return;
        setStats(s);
        allPlans.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        setPlans(allPlans);
        // 构建 nodeId → { title, planId } 映射，供薄弱知识点展示标题与跳转
        const titleMap: Record<string, { title: string; planId: string }> = {};
        for (const p of allPlans) {
          for (const node of p.knowledgeTree) {
            if (!titleMap[node.id]) {
              titleMap[node.id] = { title: node.title, planId: p.id };
            }
          }
        }
        setNodeTitleMap(titleMap);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen p-4 max-w-3xl mx-auto pb-20 flex items-center justify-center">
        <p className="text-gray-400">加载中...</p>
      </div>
    );
  }

  // 空状态：没有任何计划，也没有任何学习行为
  if (!stats || (plans.length === 0 && stats.totalActions === 0)) {
    return (
      <div className="min-h-screen p-4 max-w-3xl mx-auto pb-20">
        <div className="flex items-center gap-2 mb-6">
          <Icon name="chart" className="w-6 h-6 text-blue-500" />
          <h1 className="text-2xl font-bold">学习仪表盘</h1>
        </div>
        <div className="text-center py-16 text-gray-400">
          <div className="w-16 h-16 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4 mx-auto">
            <Icon name="book" className="w-8 h-8 text-gray-400" />
          </div>
          <p className="mb-2">还没有学习数据</p>
          <Link href="/learn" className="text-blue-500 hover:underline">
            去创建第一个学习计划 →
          </Link>
        </div>
      </div>
    );
  }

  // ============ 热力图：生成最近 30 天（旧 → 新） ============
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dates: Date[] = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    dates.push(d);
  }

  // 星期索引：0=周一, 6=周日
  function weekdayIdx(d: Date): number {
    return (d.getDay() + 6) % 7;
  }

  const weekdayLabels = ["一", "二", "三", "四", "五", "六", "日"];

  // 起始空白填充，使日期对齐到正确的星期行
  const firstWeekday = weekdayIdx(dates[0]);
  const cells: (Date | null)[] = [];
  for (let i = 0; i < firstWeekday; i++) cells.push(null);
  for (const d of dates) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);

  // ============ 掌握度列表（取前 12 个，按 total 与 mastery 排序） ============
  const nodeProgressList = Object.entries(stats.nodeProgress)
    .map(([nodeId, prog]) => ({
      nodeId,
      completed: prog.completed,
      total: prog.total,
      mastery: prog.mastery,
      title: nodeTitleMap[nodeId]?.title ?? "未知知识点",
    }))
    .sort((a, b) => b.total - a.total || b.mastery - a.mastery)
    .slice(0, 12);

  // ============ 薄弱知识点（mastery < 50%） ============
  const weakAreasList = stats.weakAreas
    .map((nodeId) => {
      const prog = stats.nodeProgress[nodeId];
      const info = nodeTitleMap[nodeId];
      if (!prog || !info) return null;
      if (prog.mastery >= 50) return null; // 双重保险
      return {
        nodeId,
        title: info.title,
        planId: info.planId,
        mastery: prog.mastery,
        completed: prog.completed,
        total: prog.total,
      };
    })
    .filter((x): x is NonNullable<typeof x> => x !== null);

  return (
    <div className="min-h-screen p-4 max-w-3xl mx-auto pb-20">
      <div className="flex items-center gap-2 mb-6">
        <Icon name="chart" className="w-6 h-6 text-blue-500" />
        <h1 className="text-2xl font-bold">学习仪表盘</h1>
      </div>

      {/* 快捷入口 */}
      <div className="flex flex-wrap gap-2 mb-6">
        {([
          { href: "/learn", icon: "book", label: "学习计划" },
          { href: "/stats", icon: "trending-up", label: "学习统计" },
          { href: "/stats/ai-quality", icon: "sparkles", label: "AI 质量" },
          { href: "/daily", icon: "calendar", label: "每日日志" },
          { href: "/emotion", icon: "heart", label: "情绪日记" },
          { href: "/mistakes", icon: "x-circle", label: "错题本" },
        ] as Array<{ href: string; icon: IconName; label: string }>).map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-full bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors"
          >
            <Icon name={item.icon} className="w-3.5 h-3.5" />
            {item.label}
          </Link>
        ))}
        {/* AI 聊天：通过全局 chat-modal-store 打开弹窗，不再走 /chat 路由 */}
        <button
          type="button"
          onClick={() => openChatModal()}
          className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-full bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors"
        >
          <Icon name="chat" className="w-3.5 h-3.5" />
          AI 聊天
        </button>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <div className="border border-gray-100 dark:border-gray-700 rounded-xl p-3 bg-white dark:bg-gray-800">
          <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
            <Icon name="flame" className="w-3.5 h-3.5 text-orange-500" />
            连续学习
          </div>
          <div className="text-xl font-bold mt-1">{stats.currentStreak} 天</div>
          <div className="text-[10px] text-gray-400 mt-0.5">
            最长 {stats.longestStreak} 天
          </div>
        </div>
        <div className="border border-gray-100 dark:border-gray-700 rounded-xl p-3 bg-white dark:bg-gray-800">
          <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
            <Icon name="book" className="w-3.5 h-3.5 text-blue-500" />
            已学知识点
          </div>
          <div className="text-xl font-bold mt-1">{stats.learnedCount} 个</div>
        </div>
        <div className="border border-gray-100 dark:border-gray-700 rounded-xl p-3 bg-white dark:bg-gray-800">
          <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
            <Icon name="repeat" className="w-3.5 h-3.5 text-green-500" />
            已复习
          </div>
          <div className="text-xl font-bold mt-1">{stats.reviewedCount} 次</div>
        </div>
        <div className="border border-gray-100 dark:border-gray-700 rounded-xl p-3 bg-white dark:bg-gray-800">
          <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
            <Icon name="heart" className="w-3.5 h-3.5 text-red-400" />
            已收藏
          </div>
          <div className="text-xl font-bold mt-1">
            {stats.favoritedQuestions} 题
          </div>
        </div>
      </div>

      {/* 学习热力图 */}
      <section className="mb-6 border border-gray-100 dark:border-gray-700 rounded-xl p-4 bg-white dark:bg-gray-800">
        <h2 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          学习热力图（最近 30 天）
        </h2>
        <div className="flex gap-2">
          {/* 星期标签 */}
          <div className="flex flex-col gap-1 text-[10px] text-gray-400 pt-0.5">
            {weekdayLabels.map((w, i) => (
              <div key={i} className="h-3 leading-3">
                {w}
              </div>
            ))}
          </div>
          {/* 热力图网格：按列填充，每列一周 */}
          <div
            className="grid gap-1"
            style={{
              gridTemplateRows: "repeat(7, 12px)",
              gridAutoFlow: "column",
            }}
          >
            {cells.map((d, i) => {
              if (!d) return <div key={i} className="w-3 h-3" />;
              const dateStr = formatDate(d);
              const count = stats.dailyActivity[dateStr] ?? 0;
              return (
                <div
                  key={i}
                  className={`w-3 h-3 rounded-sm ${getHeatmapColor(count)}`}
                  title={`${dateStr}: ${count} 次活动`}
                />
              );
            })}
          </div>
        </div>
        {/* 日期标签 */}
        <div className="flex text-[10px] text-gray-400 mt-2 ml-5">
          <div className="flex-1 flex justify-between">
            <span>
              {dates[0].toLocaleDateString("zh-CN", {
                month: "short",
                day: "numeric",
              })}
            </span>
            <span>
              {dates[Math.floor(dates.length / 2)].toLocaleDateString("zh-CN", {
                month: "short",
                day: "numeric",
              })}
            </span>
            <span>
              {dates[dates.length - 1].toLocaleDateString("zh-CN", {
                month: "short",
                day: "numeric",
              })}
            </span>
          </div>
        </div>
        {/* 图例 */}
        <div className="flex items-center gap-1 text-[10px] text-gray-500 mt-2 ml-5">
          <span>少</span>
          <div className="w-3 h-3 rounded-sm bg-gray-100" />
          <div className="w-3 h-3 rounded-sm bg-green-200" />
          <div className="w-3 h-3 rounded-sm bg-green-400" />
          <div className="w-3 h-3 rounded-sm bg-green-600" />
          <span>多</span>
        </div>
      </section>

      {/* 知识点掌握度 */}
      <section className="mb-6 border border-gray-100 dark:border-gray-700 rounded-xl p-4 bg-white dark:bg-gray-800">
        <h2 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          知识点掌握度
        </h2>
        {nodeProgressList.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-4">
            暂无知识点数据
          </p>
        ) : (
          <div className="space-y-2">
            {nodeProgressList.map((node) => {
              // 防止 mastery 超过 100% 时进度条溢出
              const barWidth = Math.min(node.mastery, 100);
              return (
                <div key={node.nodeId}>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-medium truncate flex-1 mr-2">
                      {node.title}
                    </span>
                    <span className="text-gray-500 shrink-0">
                      {node.completed}/{node.total} · {node.mastery}%
                    </span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${getMasteryColor(
                        node.mastery
                      )} transition-all`}
                      style={{ width: `${barWidth}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* 薄弱知识点 */}
      <section className="mb-6 border border-gray-100 dark:border-gray-700 rounded-xl p-4 bg-white dark:bg-gray-800">
        <h2 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          薄弱知识点
        </h2>
        {weakAreasList.length === 0 ? (
          <div className="text-center py-6 text-gray-500 dark:text-gray-400">
            <div className="w-12 h-12 rounded-xl bg-green-50 dark:bg-green-950/30 flex items-center justify-center mb-2 mx-auto">
              <Icon name="check" className="w-6 h-6 text-green-500" />
            </div>
            <p className="text-sm">太棒了！没有薄弱知识点</p>
          </div>
        ) : (
          <div className="space-y-2">
            {weakAreasList.map((node) => (
              <div
                key={node.nodeId}
                className="flex items-center justify-between gap-2 p-2 border rounded-lg"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{node.title}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    掌握度 {node.mastery}% · {node.completed}/{node.total} 完成
                  </p>
                </div>
                <Link
                  href={`/learn/${node.planId}`}
                  className="shrink-0 px-3 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium hover:bg-blue-200"
                >
                  去学习
                </Link>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 最近计划 */}
      <section className="border border-gray-100 dark:border-gray-700 rounded-xl p-4 bg-white dark:bg-gray-800">
        <h2 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">最近计划</h2>
        {plans.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-4">
            还没有学习计划，
            <Link
              href="/learn"
              className="text-blue-500 hover:underline"
            >
              去创建一个 →
            </Link>
          </p>
        ) : (
          <div className="space-y-2">
            {plans.map((plan) => {
              const completed = plan.schedule.filter((s) => s.completed).length;
              const total = plan.schedule.length;
              const pct =
                total > 0 ? Math.round((completed / total) * 100) : 0;
              return (
                <Link
                  key={plan.id}
                  href={`/learn/${plan.id}`}
                  className="block border rounded-lg p-3 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {plan.topic}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {completed}/{total} 完成 · {pct}% ·{" "}
                        {new Date(plan.createdAt).toLocaleDateString("zh-CN")}
                      </p>
                    </div>
                    <span className="text-xs text-gray-400 shrink-0">
                      查看 →
                    </span>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden mt-2">
                    <div
                      className="h-full bg-blue-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
