"use client";

// app/HomeClient.tsx
// 首页（仪表盘）—— 行动指挥中心
//
// 设计（乔布斯视角）：
//   原首页 12 个区块单列，CurrentTaskCard 被推到第 5 位，3 秒看不到答案。
//   重构为 5 区结构：
//     1. Hero 行动区：CurrentTaskCard + 番茄钟入口 + 低能量休息链接
//     2. KPI 三宫格：今日待学 / 今日待复习 / 连续打卡
//     3. AI 教练洞察区：HomeInsightsCard（成就 + 健康提醒）+ 能力画像 + AI 质量摘要
//     4. 今日学习安排：精简 schedule 列表 + 能量趋势迷你图
//     5. 折叠区：情绪记录 / 错题 / 7 天热力图
//
// 砍掉：
//   - 与底部热力图重复的 streak 数字（保留在 KPI 三宫格）
//   - StatusCard（功能与 HomeInsightsCard 重叠，已删除导入）
//   - 继续学习入口（与底部 Nav 重复）
//   - 三宫格快捷入口（与底部 Nav 重复）
//
// 新增：
//   - 用户画像摘要（beginner/intermediate/advanced 节点数 + 偏好时段）
//   - 能量趋势迷你图
//   - AI 质量摘要（今日调用数 + 采纳率）

import { useState } from "react";
import Link from "next/link";
import { useHomeData, getStreakMeta } from "@/lib/home";
import { CurrentTaskCard } from "@/components/CurrentTaskCard";
import { EmotionRecorder } from "@/components/EmotionRecorder";
import { Icon, type IconName } from "@/components/Icon";
import { Button, LinkButton } from "@/components/ui";
import { HomeInsightsCard } from "@/components/HomeInsightsCard";
import { EnergyTrendMini } from "@/components/EnergyTrendMini";
import { shouldInjectDemo, injectDemoData } from "@/lib/demo/preset-data";
import { useEffect } from "react";

export default function HomeClient() {
  const {
    dueCount,
    todayLearnCount,
    streak,
    lastStreak,
    todaySchedule,
    heatmapData,
    todayEnergy,
    hasPlans,
    username,
    todayEmotions,
    recentMistakes,
    newAchievements,
    healthAlerts,
    userProfileSummary,
    energyTrend,
    aiQualitySummary,
    reload,
  } = useHomeData();

  const [shareMsg, setShareMsg] = useState<string>("");
  const [showEmotionRecorder, setShowEmotionRecorder] = useState(false);
  const [showMoreSection, setShowMoreSection] = useState(false);

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
          href="/learn"
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
          <div className="mb-3 rounded-lg border border-blue-200 bg-blue-50 dark:bg-blue-950 dark:border-blue-800 p-2 text-sm text-blue-700 dark:text-blue-300 break-all">
            {shareMsg}
          </div>
        )}

        {/* CurrentTaskCard 是核心答案 */}
        <CurrentTaskCard />

        {/* 行动入口：番茄钟（常驻）+ 低能量休息提示（条件，文字链接避免视觉过重） */}
        <Link
          href="/timer"
          className="mt-2 flex items-center justify-between rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 p-3 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
        >
          <span className="flex items-center gap-2 text-sm text-red-800 dark:text-red-300">
            <Icon name="tomato" className="w-4 h-4 text-red-500" />
            番茄钟 · 开始一段专注
          </span>
          <span className="text-xs text-red-700 dark:text-red-400 flex items-center gap-0.5">
            25:00 <Icon name="chevron-right" className="w-3.5 h-3.5" />
          </span>
        </Link>
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

      {/* ============ 2. KPI 三宫格 ============ */}
      <section className="mb-5 grid grid-cols-3 gap-3">
        <Link
          href="/learn"
          className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl p-4 text-center hover:shadow-md transition-shadow"
        >
          <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{todayLearnCount}</p>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">今日待学</p>
        </Link>
        <Link
          href="/review"
          className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl p-4 text-center hover:shadow-md transition-shadow"
        >
          <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{dueCount}</p>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">今日待复习</p>
        </Link>
        <Link
          href="/learn"
          className={`border rounded-2xl p-4 text-center hover:shadow-md transition-shadow ${streakMeta.color}`}
        >
          <p className="text-3xl font-bold flex items-center justify-center gap-1">
            {streakMeta.emoji ? (
              <Icon name={streakMeta.emoji as IconName} className="w-5 h-5 inline-block" />
            ) : null}
            {streak}
          </p>
          <p className="text-xs mt-1">{streak === 0 ? "去打卡" : streakMeta.sub}</p>
        </Link>
      </section>

      {/* ============ 3. AI 教练洞察区（HomeInsights + 能力画像 + AI 质量，合并洞察类信息）============ */}
      <section className="mb-5">
        <HomeInsightsCard
          newAchievements={newAchievements}
          healthAlerts={healthAlerts}
        />

        {/* 用户画像 + AI 质量摘要（从 section 4 移入，与 HomeInsights 同组） */}
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

      {/* ============ 4. 今日学习安排 + 能量趋势（精简：移除继续学习入口，能力画像已移入 section 3）============ */}
      <section className="mb-5">
        <h2 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3 flex items-center gap-1.5">
          <Icon name="calendar-check" className="w-4 h-4" />
          今日安排
        </h2>

        {todaySchedule.length > 0 ? (
          <div className="space-y-1.5">
            {todaySchedule.slice(0, 3).map((item, i) => (
              <Link
                key={i}
                href={`/learn/${item.planId}`}
                className="flex items-center gap-2 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl p-2.5 hover:shadow-md transition-shadow"
              >
                <span
                  className={`text-xs px-2 py-0.5 rounded ${
                    item.type === "learn"
                      ? "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300"
                      : "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300"
                  }`}
                >
                  {item.type === "learn" ? "学" : "复"}
                </span>
                <span className="text-sm flex-1 truncate text-gray-800 dark:text-gray-200">{item.topic}</span>
                <span className="text-xs text-gray-400">{item.estimatedMinutes}min</span>
                <Icon name="chevron-right" className="w-3.5 h-3.5 text-gray-400" />
              </Link>
            ))}
            {todaySchedule.length > 3 && (
              <Link
                href="/learn"
                className="block text-center text-xs text-blue-500 hover:underline pt-1"
              >
                查看全部 {todaySchedule.length} 项 →
              </Link>
            )}
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl p-4 text-center">
            <Icon name="check-circle" className="w-8 h-8 mx-auto text-green-500 mb-1" />
            <p className="text-xs text-gray-500 dark:text-gray-400">今日无安排</p>
            <Link
              href="/learn"
              className="text-xs text-blue-500 hover:underline mt-2 inline-block"
            >
              去学习 →
            </Link>
          </div>
        )}

        {/* 能量趋势迷你图 */}
        <div className="mt-3">
          <EnergyTrendMini trend={energyTrend} todayEnergy={todayEnergy} />
        </div>
      </section>

      {/* ============ 5. 折叠区：情绪 + 错题 + 7 天热力图 ============ */}
      <section className="mb-5">
        <Button
          variant="ghost"
          onClick={() => setShowMoreSection(!showMoreSection)}
          className="w-full flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 py-2"
        >
          <span className="flex items-center gap-1.5">
            <Icon name="chevron-right" className={`w-4 h-4 transition-transform ${showMoreSection ? "rotate-90" : ""}`} />
            更多
          </span>
        </Button>

        {showMoreSection && (
          <div className="space-y-4 pt-2">
            {/* 情绪区 */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                  <Icon name="heart" className="w-4 h-4 text-pink-500" />
                  今日情绪
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  leftIcon="plus"
                  onClick={() => setShowEmotionRecorder(!showEmotionRecorder)}
                >
                  {showEmotionRecorder ? "收起" : "记一次"}
                </Button>
              </div>

              {showEmotionRecorder && (
                <div className="mb-3">
                  <EmotionRecorder
                    compact
                    onSaved={() => {
                      setShowEmotionRecorder(false);
                      void reload();
                    }}
                  />
                </div>
              )}

              {todayEmotions.length > 0 ? (
                <div className="space-y-1.5">
                  {todayEmotions.map((entry) => (
                    <div
                      key={entry.id}
                      className="bg-white dark:bg-gray-800 rounded-lg p-2.5 flex items-start gap-2"
                    >
                      <span className="text-lg">{entry.emoji}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 text-xs">
                          <span className="font-medium text-gray-700 dark:text-gray-300">{entry.tag}</span>
                          <span className="text-gray-400">{entry.time}</span>
                          {entry.dopamine !== "无" && (
                            <span className="px-1.5 py-0.5 rounded text-2xs bg-orange-100 text-orange-700">
                              {entry.dopamine}
                            </span>
                          )}
                        </div>
                        {entry.reason && (
                          <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">{entry.reason}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                !showEmotionRecorder && (
                  <p className="text-xs text-gray-400 text-center py-3">
                    今天还没记录情绪
                  </p>
                )
              )}

              <Link
                href="/emotion"
                className="mt-2 block text-center text-xs text-gray-500 hover:text-blue-500"
              >
                查看全部历史 →
              </Link>
            </div>

            {/* 错题区 */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                  <Icon name="x-circle" className="w-4 h-4 text-red-500" />
                  错题回顾
                </h3>
                {recentMistakes.length > 0 && (
                  <Link
                    href="/mistakes"
                    className="text-xs text-blue-600 hover:text-blue-700"
                  >
                    全部 →
                  </Link>
                )}
              </div>

              {recentMistakes.length === 0 ? (
                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 text-center">
                  <Icon name="check-circle" className="w-8 h-8 mx-auto text-green-500 mb-1" />
                  <p className="text-xs text-gray-500 dark:text-gray-400">还没有未解决的错题</p>
                </div>
              ) : (
                <div className="space-y-1.5">
                  {recentMistakes.map((m) => (
                    <Link
                      key={m.id}
                      href="/review"
                      className="block bg-white dark:bg-gray-800 rounded-lg p-2.5 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start gap-2">
                        <span className="text-2xs px-1.5 py-0.5 rounded bg-red-100 text-red-700 font-medium">
                          ×{m.wrongCount}
                        </span>
                        <p className="text-xs text-gray-700 dark:text-gray-300 flex-1 line-clamp-2">
                          {m.questionText}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* 7 天热力图 */}
            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">最近 7 天</h3>
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
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
