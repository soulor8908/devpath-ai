"use client";

// components/AchievementCard.tsx
// 新成就解锁通知卡片：首页顶部展示，可关闭
//
// 设计：
//   - 接收 newAchievements 列表 + onClose 回调
//   - 多个新成就时以列表形式展示（每个一行：icon + title + description + unlockedAt）
//   - 整体可一键关闭（关闭后清空 state，不再展示）
//   - dark mode 支持

import { Icon, type IconName } from "@/components/Icon";
import { Button } from "@/components/ui";
import type { Achievement } from "@/lib/types";

interface AchievementCardProps {
  achievements: Achievement[];
  onClose: () => void;
}

/** 格式化解锁时间为 "MM-DD HH:MM" 简短展示 */
function formatUnlockedAt(iso: string): string {
  if (!iso) return "";
  try {
    const d = new Date(iso);
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    const hh = String(d.getHours()).padStart(2, "0");
    const mm = String(d.getMinutes()).padStart(2, "0");
    return `${m}-${day} ${hh}:${mm}`;
  } catch {
    return "";
  }
}

export function AchievementCard({ achievements, onClose }: AchievementCardProps) {
  if (achievements.length === 0) return null;

  return (
    <div className="mb-4 rounded-xl border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/30 p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-amber-800 dark:text-amber-200 flex items-center gap-1.5">
          <Icon name="party" className="w-4 h-4" />
          成就解锁
          {achievements.length > 1 && (
            <span className="text-xs font-normal text-amber-600 dark:text-amber-400">
              （{achievements.length} 个新成就）
            </span>
          )}
        </h2>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          iconOnly
          onClick={onClose}
          aria-label="关闭"
          className="text-amber-600 dark:text-amber-400 hover:text-amber-800 dark:hover:text-amber-200 transition-colors"
        >
          <Icon name="x" className="w-4 h-4" />
        </Button>
      </div>

      <div className="space-y-2">
        {achievements.map((a) => (
          <div
            key={a.id}
            className="flex items-start gap-3 rounded-lg bg-white/60 dark:bg-gray-900/40 p-2.5"
          >
            <div className="flex-shrink-0 w-9 h-9 rounded-full bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center">
              <Icon
                name={(a.icon as IconName) ?? "sparkles"}
                className="w-5 h-5 text-amber-600 dark:text-amber-400"
              />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">
                  {a.title}
                </p>
                {a.unlockedAt && (
                  <span className="text-2xs text-gray-400 dark:text-gray-500 flex-shrink-0">
                    {formatUnlockedAt(a.unlockedAt)}
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                {a.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
