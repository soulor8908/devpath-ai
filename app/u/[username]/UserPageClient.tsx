"use client";

// app/u/[username]/UserPageClient.tsx
// 用户公开主页 —— 视觉化分享卡片设计
//
// 设计目标：
//   1. 朋友圈/社交媒体分享后能吸引点击——渐变 hero、卡片化、强视觉层次
//   2. 数据展示一目了然：连续打卡 / 总时长 / 热力图 / 雷达 / 当前主题 / 成就墙
//   3. 易传播：头部提供「复制链接」CTA，底部固定二维码可扫码访问
//   4. 仅展示 profile.visibility 显式开启的字段（隐私优先）

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Heatmap } from "@/components/Heatmap";
import { RadarChart } from "@/components/RadarChart";
import { Icon, type IconName } from "@/components/Icon";
import type { PublicProfile, KnowledgeNode, Achievement } from "@/lib/types";
import type { PublicStats } from "@/lib/storage/kv";
import { setItem as dbSet, getItem as dbGet } from "@/lib/storage/db";
import { maskUsername } from "@/lib/username-mask";
import { topoSort, allocateDaily } from "@/lib/schedule";
import { nanoid } from "nanoid";
import QRCode from "qrcode";

interface PublicResponse {
  profile: PublicProfile;
  stats: PublicStats | null;
  planSnapshot?: { topic: string; knowledgeTree: unknown[]; questions: unknown[] };
  /** 公开成就列表（需后端 /api/public 扩展返回；当前未实现） */
  achievements?: Achievement[];
}

export default function UserPageClient() {
  const params = useParams<{ username: string }>();
  const username = params?.username ?? "";
  const [data, setData] = useState<PublicResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const [followedMsg, setFollowedMsg] = useState<string | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string>("");

  useEffect(() => {
    if (!username) return;
    (async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/public/${encodeURIComponent(username)}`);
        if (res.status === 404) {
          setError("not_found");
          return;
        }
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = (await res.json()) as PublicResponse;
        setData(json);
      } catch (e) {
        setError(e instanceof Error ? e.message : "加载失败");
      } finally {
        setLoading(false);
      }
    })();
  }, [username]);

  // 生成当前页面二维码（供扫码访问）
  useEffect(() => {
    if (!username) return;
    const url = `${window.location.origin}/u/${encodeURIComponent(username)}`;
    QRCode.toDataURL(url, {
      width: 240,
      margin: 1,
      color: { dark: "#0f172a", light: "#ffffff" },
      errorCorrectionLevel: "M",
    })
      .then(setQrDataUrl)
      .catch(() => setQrDataUrl(""));
  }, [username]);

  async function copyPlan() {
    if (!data?.planSnapshot) return;
    const newPlanId = nanoid();
    const nodes = data.planSnapshot.knowledgeTree as KnowledgeNode[];
    const sorted = topoSort(nodes);
    const schedule = allocateDaily(sorted, 30, 2);
    await dbSet(`plan:${newPlanId}`, {
      id: newPlanId,
      topic: data.planSnapshot.topic,
      knowledgeTree: data.planSnapshot.knowledgeTree,
      questions: data.planSnapshot.questions,
      schedule,
      dailyMinutes: 30,
      maxNewPerDay: 2,
      fsrsMode: "standard",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    } catch {
      // 降级：使用旧 API
      const ta = document.createElement("textarea");
      ta.value = window.location.href;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    }
  }

  async function follow() {
    const list = (await dbGet<string[]>("my:following")) ?? [];
    if (data && !list.includes(data.profile.username)) {
      list.push(data.profile.username);
      await dbSet("my:following", list);
      setFollowedMsg(`已关注 ${data.profile.displayName}`);
      setTimeout(() => setFollowedMsg(null), 2000);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-500">加载中...</div>
      </div>
    );
  }

  if (error === "not_found") {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full rounded-2xl border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/30 p-6 text-sm text-amber-800 dark:text-amber-200 space-y-3 shadow-lg">
          <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
            <Icon name="alert" className="w-5 h-5" />
            <p className="font-medium text-base">用户「{maskUsername(username)}」暂未公开主页</p>
          </div>
          <p className="text-xs">可能原因：</p>
          <ul className="text-xs list-disc list-inside space-y-1 ml-1">
            <li>该用户尚未在「我的」中保存公开资料</li>
            <li>用户名拼写错误</li>
            <li>用户保存时云端同步失败（网络或鉴权问题）</li>
          </ul>
          <p className="text-xs pt-2 border-t border-amber-200 dark:border-amber-800">
            如果这是你自己的主页，请前往「我的」→ 设置用户名并保存。
          </p>
          <a
            href="/profile"
            className="inline-flex items-center gap-1.5 rounded-lg bg-amber-600 px-3 py-1.5 text-xs text-white hover:bg-amber-700 transition-colors"
          >
            <Icon name="settings" className="w-3.5 h-3.5" />
            去设置我的主页 →
          </a>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="rounded-lg border border-red-200 bg-red-50 dark:bg-red-950/30 dark:border-red-800 p-4 text-sm text-red-700 dark:text-red-300">
          加载失败：{error}
        </div>
      </div>
    );
  }

  if (!data) return null;

  const { profile, stats } = data;
  const showAchievementWall = profile.visibility.achievements === true;
  const initial = (profile.displayName || profile.username || "?").slice(0, 1).toUpperCase();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/30 to-pink-50/40 dark:from-gray-950 dark:via-purple-950/20 dark:to-gray-900 pb-20">
      <div className="mx-auto max-w-3xl px-4 py-6 space-y-5">
        {/* ============ Hero 渐变卡片 ============ */}
        <header className="relative overflow-hidden rounded-3xl shadow-xl">
          {/* 渐变背景 */}
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-400" />
          {/* 装饰圆点 */}
          <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-white/10 blur-2xl" />
          <div className="absolute -bottom-16 -left-12 w-56 h-56 rounded-full bg-white/10 blur-3xl" />

          <div className="relative p-6 sm:p-8 text-white">
            <div className="flex items-start gap-4 sm:gap-6">
              {/* 头像 / 首字母占位 */}
              {profile.avatar ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={profile.avatar}
                  alt={profile.displayName}
                  className="h-20 w-20 sm:h-24 sm:w-24 rounded-2xl object-cover border-2 border-white/40 shadow-lg backdrop-blur"
                />
              ) : (
                <div className="h-20 w-20 sm:h-24 sm:w-24 rounded-2xl bg-white/20 border-2 border-white/40 backdrop-blur flex items-center justify-center text-4xl font-bold shadow-lg">
                  {initial}
                </div>
              )}

              <div className="flex-1 min-w-0">
                <h1 className="text-2xl sm:text-3xl font-bold leading-tight break-words">
                  {profile.displayName || "(未设置)"}
                </h1>
                <p className="text-sm text-white/80 mt-0.5">@{maskUsername(profile.username)}</p>
                {profile.bio && (
                  <p className="mt-2 text-sm text-white/90 line-clamp-3">{profile.bio}</p>
                )}
              </div>
            </div>

            {/* CTA 按钮组 */}
            <div className="mt-6 flex flex-wrap gap-2">
              <button
                onClick={follow}
                className="inline-flex items-center gap-1.5 rounded-full bg-white text-purple-700 px-4 py-2 text-sm font-medium hover:bg-white/90 transition-colors shadow-md"
              >
                <Icon name="heart" className="w-4 h-4" />
                关注 ta
              </button>
              <button
                onClick={copyLink}
                className="inline-flex items-center gap-1.5 rounded-full bg-white/15 backdrop-blur border border-white/30 text-white px-4 py-2 text-sm font-medium hover:bg-white/25 transition-colors"
              >
                <Icon name={linkCopied ? "check" : "share"} className="w-4 h-4" />
                {linkCopied ? "链接已复制" : "分享主页"}
              </button>
              {followedMsg && (
                <span className="inline-flex items-center text-sm text-white/90 self-center">
                  {followedMsg}
                </span>
              )}
            </div>
          </div>
        </header>

        {/* ============ 核心数据卡片 ============ */}
        <section className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <StatCard
            icon="flame"
            label="连续打卡"
            value={stats?.streakDays ?? 0}
            unit="天"
            gradient="from-orange-400 to-red-500"
          />
          <StatCard
            icon="clock"
            label="总学习"
            value={stats?.totalMinutes ?? 0}
            unit="分钟"
            gradient="from-blue-400 to-cyan-500"
          />
          <StatCard
            icon="chart"
            label="能力点"
            value={(stats?.radarData ?? []).reduce((s, r) => s + r.value, 0)}
            unit="分"
            gradient="from-purple-400 to-pink-500"
            className="col-span-2 sm:col-span-1"
          />
        </section>

        {/* ============ 当前学习主题 ============ */}
        {profile.visibility.currentTopic && stats?.currentTopic && (
          <Card icon="book" title="当前学习主题">
            <p className="text-sm text-gray-700 dark:text-gray-300">{stats.currentTopic}</p>
          </Card>
        )}

        {/* ============ 能力雷达图 ============ */}
        {profile.visibility.radar && stats?.radarData && stats.radarData.length > 0 && (
          <Card icon="chart" title="能力雷达图">
            <RadarChart
              nodes={[]}
              cards={[]}
              logs={[]}
              stats={stats.radarData.map((d) => ({
                nodeId: d.node,
                title: d.node,
                mastery: d.value,
                accuracy: d.value,
                practice: d.value,
                activity: d.value,
                frequency: d.value,
              }))}
            />
          </Card>
        )}

        {/* ============ 学习热力图 ============ */}
        {profile.visibility.heatmap && stats?.heatmapData && stats.heatmapData.length > 0 && (
          <Card icon="flame" title="学习热力图">
            <Heatmap
              data={stats.heatmapData.map((d) => ({
                date: d.date,
                count: d.count,
                level: d.count >= 60 ? 4 : d.count >= 30 ? 3 : d.count >= 15 ? 2 : d.count > 0 ? 1 : 0,
              }))}
              weeks={12}
            />
          </Card>
        )}

        {/* ============ 学习计划 ============ */}
        {data.planSnapshot && (
          <Card icon="calendar-check" title="学习计划">
            <p className="mb-3 text-sm text-gray-700 dark:text-gray-300">{data.planSnapshot.topic}</p>
            <button
              onClick={copyPlan}
              className="inline-flex items-center gap-1.5 rounded-lg border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/30 px-3 py-1.5 text-sm text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors"
            >
              <Icon name={copied ? "check" : "copy"} className="w-4 h-4" />
              {copied ? "已复制到我的计划" : "复制这个计划"}
            </button>
          </Card>
        )}

        {/* ============ 成就墙 ============ */}
        {showAchievementWall && data.achievements && data.achievements.length > 0 && (
          <Card icon="party" title="成就墙">
            <div className="grid grid-cols-2 gap-2">
              {data.achievements.map((a) => (
                <div
                  key={a.id}
                  className="flex items-start gap-2 rounded-lg bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-950/30 dark:to-yellow-950/30 border border-amber-200 dark:border-amber-800 p-2.5"
                >
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-amber-100 to-yellow-200 dark:from-amber-900/50 dark:to-yellow-900/50 flex items-center justify-center">
                    <Icon
                      name={(a.icon as IconName) ?? "sparkles"}
                      className="w-4 h-4 text-amber-600 dark:text-amber-400"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-800 dark:text-gray-200 truncate">
                      {a.title}
                    </p>
                    <p className="text-[10px] text-gray-500 dark:text-gray-400 truncate">
                      {a.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* ============ 底部二维码区 ============ */}
        {qrDataUrl && (
          <Card icon="share" title="扫码访问">
            <div className="flex items-center gap-4">
              <div className="w-24 h-24 bg-white p-2 rounded-xl shadow-sm flex-shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={qrDataUrl} alt="扫码访问" className="w-full h-full" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                  扫码或长按识别
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 break-all">
                  {typeof window !== "undefined" ? window.location.href : `/u/${username}`}
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                  AI 驱动的开发者成长 OS · devpath
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* ============ Footer ============ */}
        <footer className="text-center text-xs text-gray-400 dark:text-gray-600 pt-4">
          <Link
            href="/"
            className="inline-flex items-center gap-1 hover:text-purple-500 transition-colors"
          >
            <Icon name="sparkles" className="w-3.5 h-3.5" />
            创建我自己的学习主页 →
          </Link>
        </footer>
      </div>
    </div>
  );
}

/** 统计数据小卡片 */
function StatCard({
  icon,
  label,
  value,
  unit,
  gradient,
  className = "",
}: {
  icon: IconName;
  label: string;
  value: number;
  unit: string;
  gradient: string;
  className?: string;
}) {
  return (
    <div
      className={`rounded-2xl bg-white dark:bg-gray-800 p-4 shadow-sm border border-gray-100 dark:border-gray-700 ${className}`}
    >
      <div className={`inline-flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br ${gradient} text-white mb-2`}>
        <Icon name={icon} className="w-4 h-4" />
      </div>
      <div className="text-2xl font-bold text-gray-900 dark:text-gray-100 leading-tight">
        {value}
        <span className="text-xs font-normal text-gray-400 ml-1">{unit}</span>
      </div>
      <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{label}</div>
    </div>
  );
}

/** 通用卡片：标题 + 内容 */
function Card({
  icon,
  title,
  children,
}: {
  icon: IconName;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl bg-white dark:bg-gray-800 p-5 shadow-sm border border-gray-100 dark:border-gray-700">
      <h2 className="flex items-center gap-2 text-base font-semibold mb-3 text-gray-900 dark:text-gray-100">
        <Icon name={icon} className="w-4 h-4 text-purple-500" />
        {title}
      </h2>
      {children}
    </section>
  );
}
