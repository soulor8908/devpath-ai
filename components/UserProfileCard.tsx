"use client";

// components/UserProfileCard.tsx
// 用户画像卡片：展示技能等级 / 薄弱环节 / 偏好时段 / 平均专注时长
// 支持"手动重建画像"（调用 buildUserProfile + saveUserProfile）
//
// 设计（乔布斯视角）：
//   - 信息密度高但层次清晰：技能画像用 badge 标签，薄弱环节用红色高亮
//   - dark mode 全覆盖（bg-gray-800/900 + text-gray-100/200）
//   - 重建按钮反馈即时（loading spinner + 状态文案）
//   - 无画像时不留白，引导用户点击重建

import { useState, useEffect } from "react";
import { listItems } from "@/lib/storage/db";
import { KEY_PREFIXES, type UserProfile, type SkillLevel, type LearningPlan } from "@/lib/types";
import { buildUserProfile } from "@/lib/ai/memory/profile-builder";
import { saveUserProfile } from "@/lib/ai/memory/user-profile";
import { Icon } from "@/components/Icon";
import { Button } from "@/components/ui";

/** 技能等级 → 中文标签 */
const SKILL_LABEL: Record<SkillLevel, string> = {
  advanced: "进阶",
  intermediate: "中级",
  beginner: "入门",
};

/** 技能等级排序权重（advanced > intermediate > beginner） */
const SKILL_ORDER: Record<SkillLevel, number> = {
  advanced: 3,
  intermediate: 2,
  beginner: 1,
};

/** 技能等级 → badge 颜色（含 dark mode） */
const SKILL_BADGE_CLASS: Record<SkillLevel, string> = {
  advanced: "bg-green-50 text-green-700 border-green-200 dark:bg-green-900/40 dark:text-green-300 dark:border-green-800",
  intermediate: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/40 dark:text-blue-300 dark:border-blue-800",
  beginner: "bg-red-50 text-red-700 border-red-200 dark:bg-red-900/40 dark:text-red-300 dark:border-red-800",
};

/** 从时段 "HH:00-HH:59" 提取中文时段前缀 */
function timeSlotPrefix(slot: string): string {
  const hour = parseInt(slot.slice(0, 2), 10);
  if (isNaN(hour)) return "";
  if (hour >= 6 && hour < 12) return "早";
  if (hour >= 12 && hour < 18) return "午";
  if (hour >= 18 && hour < 24) return "晚";
  return "夜";
}

interface Props {
  /** 用户画像；undefined 时显示"暂无画像" */
  profile?: UserProfile;
}

export function UserProfileCard({ profile }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // 本地画像状态：重建后即时更新 UI（不依赖父组件刷新 prop）
  const [localProfile, setLocalProfile] = useState(profile);

  // nodeId → 标题映射（从计划解析，best-effort）
  const [titleMap, setTitleMap] = useState<Record<string, string>>({});

  useEffect(() => {
    setLocalProfile(profile);
  }, [profile]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const plans = await listItems<LearningPlan>(KEY_PREFIXES.PLAN);
        const map: Record<string, string> = {};
        for (const p of plans) {
          for (const n of p.knowledgeTree) {
            map[n.id] = n.title;
          }
        }
        if (!cancelled) setTitleMap(map);
      } catch {
        /* ignore */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const resolveTitle = (nodeId: string) => titleMap[nodeId] ?? nodeId;

  async function handleRebuild() {
    setLoading(true);
    setError(null);
    try {
      const newProfile = await buildUserProfile();
      await saveUserProfile(newProfile);
      setLocalProfile(newProfile);
    } catch (e) {
      setError(e instanceof Error ? e.message : "重建失败");
    } finally {
      setLoading(false);
    }
  }

  // ============ 无画像态 ============
  if (!localProfile) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2 mb-3">
          <Icon name="user" className="w-4 h-4 text-gray-400 dark:text-gray-500" />
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-200">用户画像</h3>
        </div>
        <p className="text-sm text-gray-400 dark:text-gray-500 mb-3">暂无画像</p>
        <Button
          block
          onClick={() => void handleRebuild()}
          loading={loading}
          leftIcon="sparkles"
        >
          {loading ? "构建中..." : "手动重建画像"}
        </Button>
        {error && <p className="text-xs text-red-500 mt-2">{error}</p>}
      </div>
    );
  }

  // ============ 有画像态 ============
  const topSkills = Object.entries(localProfile.skillLevel)
    .sort((a, b) => SKILL_ORDER[b[1]] - SKILL_ORDER[a[1]])
    .slice(0, 5);

  const weakAreas = Object.entries(localProfile.skillLevel)
    .filter(([, level]) => level === "beginner")
    .slice(0, 3)
    .map(([nodeId]) => resolveTitle(nodeId));

  const slots = localProfile.preferredTimeSlots;
  const avgMinutes = localProfile.averageSessionMinutes;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 space-y-3">
      {/* 标题 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon name="user" className="w-4 h-4 text-gray-400 dark:text-gray-500" />
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-200">用户画像</h3>
        </div>
        <button
          onClick={() => void handleRebuild()}
          disabled={loading}
          className="text-xs text-blue-600 dark:text-blue-400 hover:underline disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
        >
          {loading ? (
            <>
              <span className="inline-block w-3 h-3 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
              重建中
            </>
          ) : (
            <>
              <Icon name="refresh-cw" className="w-3 h-3" />
              手动重建画像
            </>
          )}
        </button>
      </div>

      {/* 技能画像 Top 5 */}
      {topSkills.length > 0 && (
        <div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1.5">技能画像</p>
          <div className="flex flex-wrap gap-1.5">
            {topSkills.map(([nodeId, level]) => (
              <span
                key={nodeId}
                className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs border ${SKILL_BADGE_CLASS[level]}`}
              >
                {resolveTitle(nodeId)} ({SKILL_LABEL[level]})
              </span>
            ))}
          </div>
        </div>
      )}

      {/* 薄弱环节 */}
      {weakAreas.length > 0 && (
        <div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1.5">薄弱环节</p>
          <div className="flex flex-wrap gap-1.5">
            {weakAreas.map((title, i) => (
              <span
                key={i}
                className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-red-50 text-red-600 border border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800"
              >
                {title}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* 偏好时段 */}
      {slots.length > 0 && (
        <div className="flex items-center gap-2">
          <Icon name="clock" className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500 shrink-0" />
          <p className="text-xs text-gray-600 dark:text-gray-300">
            偏好时段：{slots.map((s) => `${timeSlotPrefix(s)} ${s}`).join("、")}
          </p>
        </div>
      )}

      {/* 平均专注时长 */}
      {avgMinutes > 0 && (
        <div className="flex items-center gap-2">
          <Icon name="target" className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500 shrink-0" />
          <p className="text-xs text-gray-600 dark:text-gray-300">
            平均专注时长：{avgMinutes} 分钟
          </p>
        </div>
      )}

      {/* 无有效数据提示 */}
      {topSkills.length === 0 && slots.length === 0 && avgMinutes === 0 && (
        <p className="text-xs text-gray-400 dark:text-gray-500">
          画像数据为空，点击&quot;手动重建画像&quot;生成
        </p>
      )}

      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
