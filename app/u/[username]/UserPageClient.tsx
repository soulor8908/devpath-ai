"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Heatmap } from "@/components/Heatmap";
import { RadarChart } from "@/components/RadarChart";
import { Icon, type IconName } from "@/components/Icon";
import type { PublicProfile, KnowledgeNode, Achievement } from "@/lib/types";
import type { PublicStats } from "@/lib/storage/kv";
import { setItem as dbSet, getItem as dbGet } from "@/lib/storage/db";
import { topoSort, allocateDaily } from "@/lib/schedule";
import { nanoid } from "nanoid";

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
  const [followedMsg, setFollowedMsg] = useState<string | null>(null);

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

  async function copyPlan() {
    if (!data?.planSnapshot) return;
    const newPlanId = nanoid();
    // 从知识树生成学习计划（修复 schedule: [] 空 bug）
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

  async function follow() {
    const list = (await dbGet<string[]>("my:following")) ?? [];
    if (data && !list.includes(data.profile.username)) {
      list.push(data.profile.username);
      await dbSet("my:following", list);
      setFollowedMsg(`已关注 ${data.profile.displayName}`);
      setTimeout(() => setFollowedMsg(null), 2000);
    }
  }

  if (loading) return <div className="p-8 text-gray-500">加载中...</div>;
  if (error === "not_found") {
    return (
      <div className="mx-auto max-w-md p-8 space-y-3">
        <div className="rounded-lg border border-amber-200 bg-amber-50 dark:bg-amber-950/30 dark:border-amber-800 p-4 text-sm text-amber-800 dark:text-amber-200 space-y-2">
          <p className="font-medium text-base">用户「{username}」暂未公开主页</p>
          <p className="text-xs">
            可能原因：
          </p>
          <ul className="text-xs list-disc list-inside space-y-1">
            <li>该用户尚未在「我的」中保存公开资料</li>
            <li>用户名拼写错误</li>
          </ul>
          <p className="text-xs pt-2 border-t border-amber-200 dark:border-amber-800">
            如果这是你自己的主页，请前往「我的」→ 设置用户名并保存。
          </p>
          <div className="pt-2">
            <a
              href="/profile"
              className="inline-block rounded-lg bg-blue-600 px-3 py-1.5 text-xs text-white hover:bg-blue-700"
            >
              去设置我的主页 →
            </a>
          </div>
        </div>
      </div>
    );
  }
  if (error) return <div className="p-8 text-red-600">加载失败：{error}</div>;
  if (!data) return null;

  const { profile, stats } = data;

  // 成就墙：仅当用户在隐私设置中显式开启 visibility.achievements 时展示
  const showAchievementWall = profile.visibility.achievements === true;

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-4">
      <header className="flex items-center gap-4">
        {profile.avatar && <img src={profile.avatar} alt="" className="h-16 w-16 rounded-full" />}
        <div className="flex-1">
          <h1 className="text-2xl font-bold">{profile.displayName}</h1>
          <p className="text-sm text-gray-500">@{profile.username}</p>
          {profile.bio && <p className="mt-1 text-sm text-gray-700">{profile.bio}</p>}
        </div>
        <button
          onClick={follow}
          className="rounded-lg bg-blue-600 px-3 py-1 text-sm text-white hover:bg-blue-700 inline-flex items-center gap-1"
        >
          <Icon name="heart" className="w-4 h-4 inline-block align-middle" /> 关注 ta
        </button>
        {followedMsg && (
          <span className="text-sm text-green-600">{followedMsg}</span>
        )}
      </header>

      <section className="grid grid-cols-2 gap-4">
        <div className="rounded-lg border p-4 text-center">
          <div className="text-2xl font-bold text-blue-600">{stats?.streakDays ?? 0}</div>
          <div className="text-xs text-gray-500">连续打卡天</div>
        </div>
        <div className="rounded-lg border p-4 text-center">
          <div className="text-2xl font-bold text-blue-600">{stats?.totalMinutes ?? 0}</div>
          <div className="text-xs text-gray-500">总学习分钟</div>
        </div>
      </section>

      {profile.visibility.currentTopic && stats?.currentTopic && (
        <section className="rounded-lg border p-4">
          <h2 className="mb-1 font-semibold">当前学习主题</h2>
          <p className="text-sm text-gray-700">{stats.currentTopic}</p>
        </section>
      )}

      {profile.visibility.radar && stats?.radarData && (
        <section className="rounded-lg border p-4">
          <h2 className="mb-2 font-semibold">能力雷达图</h2>
          <RadarChart nodes={[]} cards={[]} logs={[]} stats={stats.radarData.map((d) => ({
            nodeId: d.node,
            title: d.node,
            mastery: d.value,
            accuracy: d.value,
            practice: d.value,
            activity: d.value,
            frequency: d.value,
          }))} />
        </section>
      )}

      {profile.visibility.heatmap && stats?.heatmapData && (
        <section className="rounded-lg border p-4">
          <h2 className="mb-2 font-semibold">学习热力图</h2>
          <Heatmap
            data={stats.heatmapData.map((d) => ({
              date: d.date,
              count: d.count,
              level: d.count >= 60 ? 4 : d.count >= 30 ? 3 : d.count >= 15 ? 2 : d.count > 0 ? 1 : 0,
            }))}
            weeks={12}
          />
        </section>
      )}

      {data.planSnapshot && (
        <section className="rounded-lg border p-4">
          <h2 className="mb-2 font-semibold">学习计划</h2>
          <p className="mb-2 text-sm text-gray-700">{data.planSnapshot.topic}</p>
          <button
            onClick={copyPlan}
            className="rounded-lg border px-3 py-1 text-sm hover:bg-gray-50 inline-flex items-center gap-1"
          >
            {copied ? "✓ 已复制到我的计划" : (<><Icon name="copy" className="w-4 h-4 inline-block align-middle" /> 复制这个计划</>)}
          </button>
        </section>
      )}

      {/* 成就墙模块：用户在隐私设置中开启 visibility.achievements 后展示 */}
      {showAchievementWall && data.achievements && data.achievements.length > 0 && (
        <section className="rounded-lg border p-4">
          <h2 className="mb-2 font-semibold flex items-center gap-1.5">
            <Icon name="party" className="w-4 h-4" />
            成就墙
          </h2>
          <div className="grid grid-cols-2 gap-2">
            {data.achievements.map((a) => (
              <div
                key={a.id}
                className="flex items-start gap-2 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 p-2"
              >
                <div className="flex-shrink-0 w-7 h-7 rounded-full bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center">
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
        </section>
      )}
    </div>
  );
}
