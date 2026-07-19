"use client";

// app/achievements/page.tsx
// 成就墙页面：列出所有成就（已解锁 + 未解锁），按 type 分组展示
//
// 设计：
//   - 已解锁：展示 icon + title + description + unlockedAt（高亮）
//   - 未解锁：展示 icon + title + description + progress bar（灰显）
//   - 按 type 分组：streak / topic_mastery / focus_hours / review_streak / recovery / first_time

import { useEffect, useState } from "react";
import Link from "next/link";
import { Icon, type IconName } from "@/components/Icon";
import type { Achievement, AchievementType } from "@/lib/types";
import {
  collectStats,
  listAllAchievements,
} from "@/lib/achievements";

/** type 中文标签 + 图标 + 排序 */
const TYPE_META: Array<{
  type: AchievementType;
  label: string;
  icon: IconName;
}> = [
  { type: "streak", label: "连续学习", icon: "flame" },
  { type: "topic_mastery", label: "计划精通", icon: "target" },
  { type: "focus_hours", label: "专注时长", icon: "clock" },
  { type: "review_streak", label: "连续复习", icon: "repeat" },
  { type: "recovery", label: "韧性恢复", icon: "refresh-cw" },
  { type: "first_time", label: "初次成就", icon: "sparkles" },
];

function formatUnlockedAt(iso: string): string {
  if (!iso) return "";
  try {
    const d = new Date(iso);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  } catch {
    return "";
  }
}

export default function AchievementsPage() {
  const [all, setAll] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void (async () => {
      try {
        const stats = await collectStats();
        const list = await listAllAchievements(stats);
        setAll(list);
      } catch (e) {
        console.warn("[achievements] load failed:", e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const unlockedCount = all.filter((a) => a.unlockedAt).length;

  return (
    <div className="min-h-screen p-4 max-w-2xl mx-auto pb-20 dark:bg-gray-900">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">成就墙</h1>
        <Link href="/" className="text-sm text-blue-500 hover:underline">
          ← 返回
        </Link>
      </div>

      <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
        已解锁 {unlockedCount} / {all.length} 个成就
      </p>

      {loading ? (
        <p className="text-center text-gray-500 py-8">加载中...</p>
      ) : (
        <div className="space-y-6">
          {TYPE_META.map(({ type, label, icon: groupIcon }) => {
            const items = all.filter((a) => a.type === type);
            if (items.length === 0) return null;
            return (
              <section key={type}>
                <h2 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2 flex items-center gap-1.5">
                  <Icon name={groupIcon} className="w-4 h-4" />
                  {label}
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {items.map((a) => {
                    const unlocked = !!a.unlockedAt;
                    const progress = unlocked ? 1 : Math.max(0, Math.min(1, a.progress ?? 0));
                    return (
                      <div
                        key={a.id}
                        className={`rounded-lg border p-3 flex items-start gap-3 transition-colors ${
                          unlocked
                            ? "border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/30"
                            : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 opacity-70"
                        }`}
                      >
                        <div
                          className={`flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center ${
                            unlocked
                              ? "bg-amber-100 dark:bg-amber-900/50"
                              : "bg-gray-100 dark:bg-gray-700"
                          }`}
                        >
                          <Icon
                            name={(a.icon as IconName) ?? "sparkles"}
                            className={`w-5 h-5 ${
                              unlocked
                                ? "text-amber-600 dark:text-amber-400"
                                : "text-gray-400 dark:text-gray-500"
                            }`}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p
                              className={`text-sm font-medium truncate ${
                                unlocked
                                  ? "text-gray-800 dark:text-gray-200"
                                  : "text-gray-500 dark:text-gray-400"
                              }`}
                            >
                              {a.title}
                            </p>
                            {unlocked && (
                              <Icon
                                name="check-circle"
                                className="w-3.5 h-3.5 text-amber-500 flex-shrink-0"
                              />
                            )}
                          </div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                            {a.description}
                          </p>
                          {unlocked ? (
                            a.unlockedAt && (
                              <p className="text-2xs text-amber-600 dark:text-amber-400 mt-1">
                                解锁于 {formatUnlockedAt(a.unlockedAt)}
                              </p>
                            )
                          ) : (
                            <div className="mt-1.5">
                              <div className="h-1 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-amber-400 transition-all"
                                  style={{ width: `${progress * 100}%` }}
                                />
                              </div>
                              <p className="text-2xs text-gray-400 mt-0.5">
                                {Math.round(progress * 100)}%
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
