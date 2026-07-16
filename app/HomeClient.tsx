"use client";

// app/HomeClient.tsx
// 首页的客户端组件部分（从原 page.tsx 拆出）
// 拆分原因（Issue 6 修复）：
//   - 原 page.tsx 是 "use client" + 15 个 useState + useEffect = 完全客户端渲染
//   - 首次加载白屏（SSR 输出空 HTML，hydration 后才有内容）
//   - 拆分后：app/page.tsx (server component) 渲染骨架屏 HTML，Suspense 包装本组件
//   - SSR 阶段：用户看到骨架屏（有视觉反馈，不再是白屏）
//   - hydration 后：useHomeData hook 加载 IndexedDB 数据，渲染真实内容

import { useState, useEffect } from "react";
import Link from "next/link";
import { useHomeData, getStreakMeta } from "@/lib/home";
import { StatusCard } from "@/components/StatusCard";
import { CurrentTaskCard } from "@/components/CurrentTaskCard";
import { DailyNudge } from "@/components/DailyNudge";
import { EmotionRecorder } from "@/components/EmotionRecorder";
import { AchievementCard } from "@/components/AchievementCard";
import { HealthAlertCard } from "@/components/HealthAlertCard";
import { Icon, type IconName } from "@/components/Icon";
import { shouldInjectDemo, injectDemoData } from "@/lib/demo/preset-data";

export default function HomeClient() {
  const {
    dueCount,
    todayLearnCount,
    streak,
    lastStreak,
    todaySchedule,
    heatmapData,
    todayEnergy,
    latestPlan,
    hasPlans,
    username,
    todayEmotions,
    recentMistakes,
    newAchievements,
    healthAlerts,
    reload,
  } = useHomeData();

  const [shareMsg, setShareMsg] = useState<string>("");
  const [showEmotionRecorder, setShowEmotionRecorder] = useState(false);
  // 成就卡片关闭状态：关闭后隐藏，直到出现新的成就
  const [achievementsDismissed, setAchievementsDismissed] = useState(false);
  // 已关闭的 HealthAlert id 集合（仅本会话内，刷新后重新出现）
  const [dismissedAlertIds, setDismissedAlertIds] = useState<Set<string>>(
    new Set(),
  );

  // Demo 数据注入：首次访问（IndexedDB 无任何 plan）时异步注入示例数据
  // 不阻塞 UI——注入完成后 reload 刷新首页数据
  useEffect(() => {
    void Promise.resolve().then(async () => {
      const needInject = await shouldInjectDemo();
      if (!needInject) return;
      await injectDemoData();
      await reload();
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 出现新成就时重置关闭状态（让卡片重新展示）
  useEffect(() => {
    if (newAchievements.length > 0) {
      setAchievementsDismissed(false);
    }
  }, [newAchievements]);

  // 分享主页地址
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
        // 用户取消分享，静默处理
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
    if (minutes === 0) return "bg-gray-100";
    if (minutes < 15) return "bg-green-200";
    if (minutes < 30) return "bg-green-400";
    if (minutes < 60) return "bg-green-500";
    return "bg-green-700";
  };

  const streakMeta = getStreakMeta(streak, lastStreak);
  const lowEnergy = todayEnergy !== null && todayEnergy <= 2;

  return (
    <div className="min-h-screen p-4 max-w-2xl mx-auto pb-20 dark:bg-gray-900">
      {/* ============ 顶部：标题 + 分享 ============ */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">今日</h1>
        <button
          type="button"
          onClick={handleShare}
          className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors"
        >
          <Icon name="share" className="w-3.5 h-3.5" />
          分享主页
        </button>
      </div>
      {shareMsg && (
        <div className="mb-3 rounded-lg border border-blue-200 bg-blue-50 dark:bg-blue-950 dark:border-blue-800 p-2 text-sm text-blue-700 dark:text-blue-300 break-all">
          {shareMsg}
        </div>
      )}

      {/* 新成就解锁通知卡片（可关闭） */}
      {!achievementsDismissed && newAchievements.length > 0 && (
        <AchievementCard
          achievements={newAchievements}
          onClose={() => setAchievementsDismissed(true)}
        />
      )}

      {/* 健康检查告警卡片（可关闭 + 一键采纳） */}
      <HealthAlertCard
        alerts={healthAlerts}
        dismissedIds={dismissedAlertIds}
        onClose={(alertId) =>
          setDismissedAlertIds((prev) => {
            const next = new Set(prev);
            next.add(alertId);
            return next;
          })
        }
      />

      {/* ============ 1. AI 主动提醒 + 现在该做什么 ============ */}
      <section className="mb-4 space-y-3">
        <DailyNudge />
        <CurrentTaskCard />
      </section>

      {/* 新用户引导 */}
      {hasPlans === false && (
        <div className="mb-6 rounded-lg border-2 border-blue-300 bg-blue-50 p-6 text-center">
          <p className="text-lg font-semibold mb-2">欢迎来到 devpath</p>
          <p className="mb-4 text-sm text-gray-600">
            告诉 AI 你想学什么，它帮你拆知识树、排计划、出面试题
          </p>
          <Link
            href="/learn"
            className="inline-block rounded-lg bg-blue-600 px-6 py-2 text-white hover:bg-blue-700"
          >
            开始第一个学习计划
          </Link>
        </div>
      )}

      {/* ============ 2. 今日安排（学习/复习任务）+ 待学待复习统计 ============ */}
      <section className="mb-4">
        {/* 三宫格统计 */}
        <div className="grid grid-cols-3 gap-3 mb-3">
          <Link
            href="/learn"
            className="bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg p-3 text-center hover:shadow-md transition-shadow"
          >
            <p className="text-2xl font-bold">{todayLearnCount}</p>
            <p className="text-xs text-gray-400 dark:text-gray-500">今日待学</p>
          </Link>
          <Link
            href="/review"
            className="bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg p-3 text-center hover:shadow-md transition-shadow"
          >
            <p className="text-2xl font-bold">{dueCount}</p>
            <p className="text-xs text-gray-400 dark:text-gray-500">今日待复习</p>
          </Link>
          <Link
            href="/learn"
            className={`border rounded-lg p-3 text-center hover:shadow-md transition-shadow ${streakMeta.color}`}
          >
            <p className="text-2xl font-bold">
              {streakMeta.emoji ? (
                <Icon
                  name={streakMeta.emoji as IconName}
                  className="w-5 h-5 inline-block align-middle"
                />
              ) : null}{" "}
              {streak}
            </p>
            <p className="text-xs">{streak === 0 ? "去打卡" : streakMeta.sub}</p>
          </Link>
        </div>

        {/* 今日安排列表 */}
        {todaySchedule.length > 0 && (
          <div className="space-y-1">
            <h2 className="text-sm font-medium text-gray-500 mb-2">今日安排</h2>
            {todaySchedule.map((item, i) => (
              <Link
                key={i}
                href={`/learn/${item.planId}`}
                className="flex items-center gap-2 bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg p-2 hover:shadow-md transition-shadow"
              >
                <span
                  className={`text-xs px-2 py-0.5 rounded ${
                    item.type === "learn"
                      ? "bg-blue-100 text-blue-700"
                      : "bg-green-100 text-green-700"
                  }`}
                >
                  {item.type === "learn" ? "学" : "复"}
                </span>
                <span className="text-sm flex-1 truncate">{item.topic}</span>
                <span className="text-xs text-gray-400">
                  {item.estimatedMinutes}min
                </span>
                <span className="text-xs text-blue-500">→</span>
              </Link>
            ))}
          </div>
        )}

        {/* 打卡引导 */}
        {streak === 0 && hasPlans && (
          <div className="mt-3 rounded-lg border border-blue-200 bg-blue-50 dark:bg-blue-950 dark:border-blue-800 p-3">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              <Icon
                name="lightbulb"
                className="w-4 h-4 inline-block align-middle"
              />{" "}
              完成今日第一个学习/复习任务即可自动打卡。点击上方「今日待学」开始吧！
            </p>
          </div>
        )}

        {/* 低能量休息提示 */}
        {lowEnergy && (
          <Link
            href="/rest"
            className="mt-3 flex items-center justify-between rounded-xl bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 p-3 hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors"
          >
            <span className="flex items-center gap-2 text-sm text-green-800 dark:text-green-300">
              <Icon name="leaf" className="w-4 h-4" />
              检测到今天能量偏低，去休息一下？
            </span>
            <span className="text-xs text-green-700 dark:text-green-400 flex items-center gap-0.5">
              478 呼吸 <Icon name="chevron-right" className="w-3.5 h-3.5" />
            </span>
          </Link>
        )}

        {/* 今日状态 */}
        <div className="mt-3">
          <StatusCard />
        </div>
      </section>

      {/* ============ 3. 情绪区：今日情绪快捷记录 + 历史条目 ============ */}
      <section className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-sm font-medium text-gray-500 flex items-center gap-1.5">
            <Icon name="heart" className="w-4 h-4 text-pink-500" />
            今日情绪
          </h2>
          <button
            onClick={() => setShowEmotionRecorder(!showEmotionRecorder)}
            className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-0.5"
          >
            <Icon name="plus" className="w-3.5 h-3.5" />
            {showEmotionRecorder ? "收起" : "记一次"}
          </button>
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

        {/* 今日情绪列表 */}
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
                    <span className="font-medium text-gray-700">{entry.tag}</span>
                    <span className="text-gray-400">{entry.time}</span>
                    {entry.dopamine !== "无" && (
                      <span className="px-1.5 py-0.5 rounded text-[10px] bg-orange-100 text-orange-700">
                        {entry.dopamine}
                      </span>
                    )}
                  </div>
                  {entry.reason && (
                    <p className="text-xs text-gray-600 mt-0.5">{entry.reason}</p>
                  )}
                  {(entry.selectedCoping?.length > 0 || entry.customCoping) && (
                    <p className="text-xs text-green-700 mt-0.5">
                      应对：
                      {[
                        ...(entry.selectedCoping ?? []),
                        ...(entry.customCoping ? [entry.customCoping] : []),
                      ].join("、")}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          !showEmotionRecorder && (
            <p className="text-xs text-gray-400 text-center py-3">
              今天还没记录情绪，点「记一次」开始
            </p>
          )
        )}

        {/* 跳转完整情绪页 */}
        <Link
          href="/emotion"
          className="mt-2 block text-center text-xs text-gray-500 hover:text-blue-500"
        >
          查看全部历史 →
        </Link>
      </section>

      {/* ============ 4. 错题区：今日错题回顾 ============ */}
      <section className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-sm font-medium text-gray-500 flex items-center gap-1.5">
            <Icon name="x-circle" className="w-4 h-4 text-red-500" />
            错题回顾
          </h2>
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
            <Icon
              name="check-circle"
              className="w-8 h-8 mx-auto text-green-500 mb-1"
            />
            <p className="text-xs text-gray-500">
              还没有未解决的错题，继续保持！
            </p>
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
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-100 text-red-700 font-medium">
                    ×{m.wrongCount}
                  </span>
                  <p className="text-xs text-gray-700 flex-1 line-clamp-2">
                    {m.questionText}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* ============ 5. 底部：打卡状态 + 迷你热力图 + 继续学习 ============ */}
      <section className="mb-4">
        {/* 迷你热力图（最近 7 天） */}
        <h2 className="text-sm font-medium text-gray-500 mb-2">最近 7 天</h2>
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

        {/* 继续学习入口 */}
        {latestPlan && (
          <Link
            href={`/learn/${latestPlan.id}`}
            className="mt-3 flex items-center justify-between rounded-xl border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/30 p-3 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
          >
            <span className="flex items-center gap-2 text-sm text-blue-800 dark:text-blue-300">
              <Icon name="book" className="w-4 h-4" />
              继续学习：{latestPlan.topic}
            </span>
            <Icon
              name="chevron-right"
              className="w-4 h-4 text-blue-600 dark:text-blue-400"
            />
          </Link>
        )}

        {/* 快捷入口 */}
        <div className="grid grid-cols-3 gap-3 mt-3">
          <Link
            href="/learn"
            className="bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 rounded-xl p-4 text-center font-medium flex flex-col items-center gap-1.5 hover:opacity-90 transition-opacity"
          >
            <Icon name="book" className="w-5 h-5" />
            <span className="text-sm">学习</span>
          </Link>
          <Link
            href="/review"
            className="bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-xl p-4 text-center font-medium flex flex-col items-center gap-1.5 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <Icon name="repeat" className="w-5 h-5" />
            <span className="text-sm">复习</span>
          </Link>
          <Link
            href="/chat"
            className="bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-xl p-4 text-center font-medium flex flex-col items-center gap-1.5 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <Icon name="chat" className="w-5 h-5" />
            <span className="text-sm">AI 聊天</span>
          </Link>
        </div>
      </section>
    </div>
  );
}
