"use client";

// app/HomeClient.tsx
// 首页（仪表盘）—— 行动指挥中心
//
// 设计（乔布斯视角）：
//   原首页 12 个区块单列，CurrentTaskCard 被推到第 5 位，3 秒看不到答案。
//   重构为 6 区结构（需求 4：学习队列移到最下面，KPI 卡片作为快速入口）：
//     1. Hero 行动区：CurrentTaskCard + 番茄钟入口 + 低能量休息链接
//     2. KPI 三宫格：今日学习清单 N 项（可点击进入学习）/ 已完成 X 项 / 连续打卡 N 天
//     3. AI 教练洞察区：HomeInsightsCard（成就 + 健康提醒）+ 能力画像 + AI 质量摘要
//     4. 能量趋势迷你图（新账户无数据时隐藏）
//     5. 7 天热力图（常驻，新账户无打卡记录时隐藏）
//     6. 今日学习队列（移到最下面作为详细视图，KPI 卡片已能快速进入学习）
//
// 第 5 轮简化：
//   - 折叠区里的「今日情绪」「错题本」与 EmotionQuickPicker / /mistakes 重复 → 删除
//   - 「更多」折叠按钮无存在意义 → 移除折叠逻辑，7 天热力图常驻
//
// 新账户隐藏空数据区块（需求 4）：
//   - 第 3 区（AI 教练洞察）：仅在 userProfileSummary || aiQualitySummary || newAchievements.length || healthAlerts.length 时渲染
//   - 第 4 区能量趋势迷你图：仅在 energyTrend 有非 null 值时渲染
//   - 第 5 区 7 天热力图：仅在 heatmapData 有非 0 分钟数据时渲染
//   - KPI 三宫格第 2 格「已完成」：todayCompletedCount > 0 时才着色突出
//
// 新增：
//   - 用户画像摘要（beginner/intermediate/advanced 节点数 + 偏好时段）
//   - 能量趋势迷你图
//   - AI 质量摘要（今日调用数 + 采纳率）
//   - 第 2 阶段：studyQueue 智能排序学习队列（合并 learn + review 单一待办流）
//   - 需求 4：KPI 第 1 格可点击进入学习（队列第一项或 /learn/new 兜底）

import { useState } from "react";
import Link from "next/link";
import { useHomeData, getStreakMeta } from "@/lib/home";
import { CurrentTaskCard } from "@/components/CurrentTaskCard";
import { EmotionQuickPicker } from "@/components/EmotionQuickPicker";
import { Icon, type IconName } from "@/components/Icon";
import { Button, LinkButton } from "@/components/ui";
import { HomeInsightsCard } from "@/components/HomeInsightsCard";
import { EnergyTrendMini } from "@/components/EnergyTrendMini";
import { shouldInjectDemo, injectDemoData } from "@/lib/demo/preset-data";
import { POMODORO_OPEN_LARGE_EVENT } from "@/lib/timer/pomodoro";
import { useEffect } from "react";

export default function HomeClient() {
  const {
    streak,
    lastStreak,
    heatmapData,
    todayEnergy,
    hasPlans,
    username,
    newAchievements,
    healthAlerts,
    userProfileSummary,
    energyTrend,
    aiQualitySummary,
    studyQueue,
    todayCompletedCount,
    reload,
  } = useHomeData();

  const [shareMsg, setShareMsg] = useState<string>("");

  // Demo 数据注入
  useEffect(() => {
    void Promise.resolve().then(async () => {
      const needInject = await shouldInjectDemo();
      if (!needInject) return;
      await injectDemoData();
      await reload();
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleShare() {
    if (!username) {
      setShareMsg("请先在「我的」设置用户名");
      setTimeout(() => setShareMsg(""), 2500);
      return;
    }
    const shareUrl = `${window.location.origin}/u/${encodeURIComponent(username)}`;
    const shareText = "来看看我的开发者成长主页";
    if (navigator.share) {
      try {
        await navigator.share({ title: "devpath", text: shareText, url: shareUrl });
      } catch {
        // 用户取消
      }
    } else {
      try {
        await navigator.clipboard.writeText(shareUrl);
        setShareMsg("链接已复制到剪贴板");
        setTimeout(() => setShareMsg(""), 2500);
      } catch {
        setShareMsg(shareUrl);
        setTimeout(() => setShareMsg(""), 5000);
      }
    }
  }

  const heatColor = (minutes: number) => {
    if (minutes === 0) return "bg-gray-100 dark:bg-gray-700";
    if (minutes < 15) return "bg-green-200";
    if (minutes < 30) return "bg-green-400";
    if (minutes < 60) return "bg-green-500";
    return "bg-green-700";
  };

  const streakMeta = getStreakMeta(streak, lastStreak);
  const lowEnergy = todayEnergy !== null && todayEnergy <= 2;
  // 需求 4：7 天热力图仅在至少 1 天有打卡数据时才显示（新账户隐藏）
  const heatmapHasData = heatmapData.some((d) => d.minutes > 0);

  // ============ 新用户引导 ============
  if (hasPlans === false) {
    return (
      <div className="min-h-screen p-4 max-w-2xl mx-auto pb-20 dark:bg-gray-900 flex flex-col items-center justify-center text-center">
        <div className="mb-6">
          <Icon name="sparkles" className="w-16 h-16 mx-auto text-purple-500" />
        </div>
        <h1 className="text-2xl font-bold mb-3">欢迎来到 devpath</h1>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-6 max-w-md">
          AI 驱动的开发者成长 OS。告诉 AI 你想学什么，它帮你拆知识树、排计划、出面试题、按遗忘曲线复习。
        </p>
        <LinkButton
          href="/learn/new"
          size="lg"
          className="rounded-full px-8 shadow-lg"
        >
          开始第一个学习计划 →
        </LinkButton>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 max-w-2xl mx-auto pb-20 dark:bg-gray-900">
      {/* ============ 1. Hero 行动区 ============ */}
      <section className="mb-5">
        {/* 顶部：问候 + 分享 */}
        <div className="flex items-center justify-between mb-3">
          <div>
            <h1 className="text-xl font-bold">今天</h1>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
              {new Date().toLocaleDateString("zh-CN", { month: "long", day: "numeric", weekday: "long" })}
            </p>
          </div>
          <Button
            variant="secondary"
            size="sm"
            leftIcon="share"
            onClick={handleShare}
          >
            分享
          </Button>
        </div>
        {shareMsg && (
          <div
            role="status"
            aria-live="polite"
            className="mb-3 rounded-lg border border-blue-200 bg-blue-50 dark:bg-blue-950 dark:border-blue-800 p-2 text-sm text-blue-700 dark:text-blue-300 break-all"
          >
            {shareMsg}
          </div>
        )}

        {/* CurrentTaskCard 是核心答案 */}
        <CurrentTaskCard />

        {/* 行动入口：番茄钟（常驻）+ 低能量休息提示（条件，文字链接避免视觉过重）
            入口改造：原 <Link href="/timer"> 跳转路由 → 移除 /timer 路由
            改为派发 POMODORO_OPEN_LARGE_EVENT 事件，全局 PomodoroWidget 监听后打开 large Modal
            （路由 → 弹框工具：更符合 AI Native 风格，不离开当前页就能开始专注） */}
        <Button
          variant="ghost"
          onClick={() => {
            if (typeof window !== "undefined") {
              window.dispatchEvent(new CustomEvent(POMODORO_OPEN_LARGE_EVENT));
            }
          }}
          className="mt-2 w-full flex items-center justify-between rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 p-3 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors h-auto"
        >
          <span className="flex items-center gap-2 text-sm text-red-800 dark:text-red-300">
            <Icon name="tomato" className="w-4 h-4 text-red-500" />
            番茄钟 · 开始一段专注
          </span>
          <span className="text-xs text-red-700 dark:text-red-400 flex items-center gap-0.5">
            25:00 <Icon name="chevron-right" className="w-3.5 h-3.5" />
          </span>
        </Button>
        {lowEnergy && (
          <Link
            href="/rest"
            className="mt-1.5 block text-center text-xs text-green-600 dark:text-green-400 hover:underline"
          >
            <Icon name="leaf" className="w-3 h-3 inline mr-0.5" />
            检测到今天能量偏低，去休息一下？
          </Link>
        )}
      </section>

      {/* ============ 1.5 情绪快捷选择 ============ */}
      {/* 极简 3 emoji 一行（兴奋 / 平静 / 疲惫），点击即记录，无需展开折叠区。
          情绪觉察是核心差异化功能，从折叠区提到 Hero 区下方，3 秒内可触发自我觉察。
          深度记录（原因+影响+AI 建议）仍走折叠区 EmotionRecorder 或 /emotion 页。 */}
      <EmotionQuickPicker onRecorded={reload} />

      {/* ============ 2. KPI 三宫格（第 2 阶段：学习+复习合并为单一队列）
          需求 4：第一格「今日学习清单」可点击进入学习（队列第一项或 /learn/new 兜底）============ */}
      <section className="mb-5 grid grid-cols-3 gap-3">
        <Link
          href={studyQueue[0] ? (studyQueue[0].type === "review" ? "/review" : `/learn/${studyQueue[0].planId ?? ""}`) : "/learn/new"}
          aria-label={`今日学习清单 ${studyQueue.length} 项，点击进入学习`}
          className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl p-4 text-center hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-md transition-all group relative"
        >
          <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{studyQueue.length}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 flex items-center justify-center gap-0.5">
            今日学习清单
            <Icon name="chevron-right" className="w-3 h-3 text-gray-300 dark:text-gray-600 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors" />
          </p>
        </Link>
        <div
          aria-label={`今日已完成 ${todayCompletedCount} 项`}
          className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl p-4 text-center"
        >
          <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{todayCompletedCount}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">已完成</p>
        </div>
        <div
          aria-label={`连续打卡 ${streak} 天`}
          className={`border rounded-2xl p-4 text-center ${streakMeta.color}`}
        >
          <p className="text-3xl font-bold flex items-center justify-center gap-1">
            {streakMeta.emoji ? (
              <Icon name={streakMeta.emoji as IconName} className="w-5 h-5 inline-block" />
            ) : null}
            {streak}
          </p>
          <p className="text-xs mt-1">{streak === 0 ? "去打卡" : streakMeta.sub}</p>
        </div>
      </section>

      {/* ============ 3. AI 教练洞察区（需求 4：新账户无数据时整区隐藏）============ */}
      {(userProfileSummary ||
        aiQualitySummary ||
        newAchievements.length > 0 ||
        healthAlerts.length > 0) && (
        <section className="mb-5">
          <HomeInsightsCard
            newAchievements={newAchievements}
            healthAlerts={healthAlerts}
          />

          {/* 用户画像 + AI 质量摘要（与 HomeInsights 同组） */}
          {(userProfileSummary || aiQualitySummary) && (
            <div className="mt-3 grid grid-cols-2 gap-3">
              {userProfileSummary && (
                <div className="rounded-2xl border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 p-3">
                  <div className="flex items-center gap-1.5 mb-2">
                    <Icon name="user" className="w-3.5 h-3.5 text-purple-500" />
                    <span className="text-xs font-medium text-gray-500">能力画像</span>
                  </div>
                  <div className="space-y-0.5 text-xs">
                    <div className="flex justify-between">
                      <span className="text-gray-400">入门</span>
                      <span className="text-gray-700 dark:text-gray-300 font-medium">{userProfileSummary.skillLevelCount.beginner}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">进阶</span>
                      <span className="text-gray-700 dark:text-gray-300 font-medium">{userProfileSummary.skillLevelCount.intermediate}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">高级</span>
                      <span className="text-gray-700 dark:text-gray-300 font-medium">{userProfileSummary.skillLevelCount.advanced}</span>
                    </div>
                    {userProfileSummary.preferredSlot && (
                      <div className="flex justify-between pt-1 border-t border-gray-100 dark:border-gray-700 mt-1">
                        <span className="text-gray-400">偏好时段</span>
                        <span className="text-purple-600 dark:text-purple-400 font-medium">{userProfileSummary.preferredSlot}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
              {aiQualitySummary && (
                <div className="rounded-2xl border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 p-3">
                  <div className="flex items-center gap-1.5 mb-2">
                    <Icon name="sparkles" className="w-3.5 h-3.5 text-blue-500" />
                    <span className="text-xs font-medium text-gray-500">AI 质量</span>
                  </div>
                  <div className="space-y-0.5 text-xs">
                    <div className="flex justify-between">
                      <span className="text-gray-400">今日调用</span>
                      <span className="text-gray-700 dark:text-gray-300 font-medium">{aiQualitySummary.todayCalls}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">采纳率</span>
                      <span className="text-green-600 dark:text-green-400 font-medium">
                        {Math.round(aiQualitySummary.adoptionRate * 100)}%
                      </span>
                    </div>
                  </div>
                  <Link
                    href="/stats/ai-quality"
                    className="block text-2xs text-gray-400 hover:text-blue-500 mt-2 text-center"
                  >
                    详情 →
                  </Link>
                </div>
              )}
            </div>
          )}
        </section>
      )}

      {/* ============ 4. 能量趋势迷你图（需求 4：新账户无能量数据时隐藏）============ */}
      {energyTrend.some((v) => v !== null) && (
        <section className="mb-5">
          <EnergyTrendMini trend={energyTrend} todayEnergy={todayEnergy} />
        </section>
      )}

      {/* ============ 5. 7 天热力图（需求 1：移除折叠按钮+今日情绪+错题本，常驻显示；
                                       需求 4：新账户无打卡记录时隐藏）============ */}
      {heatmapHasData && (
        <section className="mb-5">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2 flex items-center gap-1.5">
            <Icon name="calendar" className="w-4 h-4" />
            最近 7 天
          </h3>
          <div className="flex gap-1">
            {heatmapData.map((d) => (
              <div key={d.date} className="flex-1 text-center">
                <div
                  className={`h-12 rounded ${heatColor(d.minutes)} flex items-end justify-center pb-1`}
                >
                  {d.minutes > 0 && (
                    <span className="text-xs text-white font-medium">{d.minutes}</span>
                  )}
                </div>
                <p className="text-xs text-gray-400 mt-1">{d.date.slice(5)}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ============ 6. 今日学习队列（需求 4：移到最下面，作为详细视图）
          第 2 阶段：studyQueue 渲染——合并待学+待复习，按 priority 排序
          需求 3：header 右侧新增「+ 新建计划」入口，跳 /learn/new ============ */}
      <section className="mb-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
            <Icon name="calendar-check" className="w-4 h-4" />
            今日学习队列
          </h2>
          <Link
            href="/learn/new"
            aria-label="新建学习计划"
            className="text-xs text-blue-500 hover:text-blue-600 dark:hover:text-blue-400 flex items-center gap-0.5"
          >
            <Icon name="plus" className="w-3.5 h-3.5" />
            新建计划
          </Link>
        </div>

        {studyQueue.length > 0 ? (
          <div className="space-y-1.5">
            {studyQueue.slice(0, 5).map((task) => {
              const href = task.type === "review" ? "/review" : `/learn/${task.planId ?? ""}`;
              return (
                <Link
                  key={task.id}
                  href={href}
                  aria-label={`${task.type === "review" ? "复习" : "新学"}：${task.title}，优先级 ${task.priority}`}
                  className="flex items-start gap-2 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl p-2.5 hover:shadow-md transition-shadow"
                >
                  <span
                    className={`text-xs px-2 py-0.5 rounded shrink-0 ${
                      task.type === "review"
                        ? "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300"
                        : "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300"
                    }`}
                  >
                    {task.type === "review" ? "复" : "学"}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm truncate text-gray-800 dark:text-gray-200">{task.title}</p>
                    {task.reason && (
                      <p className="text-2xs text-gray-400 dark:text-gray-500 mt-0.5 truncate">
                        {task.reason}
                      </p>
                    )}
                  </div>
                  {task.estimatedMinutes && (
                    <span className="text-xs text-gray-400 shrink-0">{task.estimatedMinutes}min</span>
                  )}
                  <Icon name="chevron-right" className="w-3.5 h-3.5 text-gray-400 shrink-0 mt-1" />
                </Link>
              );
            })}
            {studyQueue.length > 5 && (
              <Link
                href="/review"
                className="block text-center text-xs text-blue-500 hover:underline pt-1"
              >
                查看全部 {studyQueue.length} 项 →
              </Link>
            )}
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl p-4 text-center">
            <Icon name="check-circle" className="w-8 h-8 mx-auto text-green-500 mb-1" />
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {todayCompletedCount > 0 ? "今日清单已清空" : "今日暂无待办"}
            </p>
            <Link
              href="/learn/new"
              className="text-xs text-blue-500 hover:underline mt-2 inline-block"
            >
              建一个学习计划 →
            </Link>
          </div>
        )}
      </section>
    </div>
  );
}
