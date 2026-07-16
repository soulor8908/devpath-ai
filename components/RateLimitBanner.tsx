"use client";

// components/RateLimitBanner.tsx
// 聊天页底部限流提示：展示"今日剩余 X 次"
// - 有剩余：轻量提示
// - 已耗尽：醒目 banner + "配置自己的 API Key"链接（指向 /profile）
//
// 仅在使用服务端默认模型时需要限流；用户自带 modelConfig 时不展示本组件
// （由调用方根据 useServerModel 状态决定是否渲染）

import { useState, useEffect } from "react";
import Link from "next/link";
import { getApiToken } from "@/lib/api-client";
import { getUserId } from "@/lib/sync";

interface SceneStatus {
  scene: string;
  used: number;
  limit: number;
  remaining: number;
}

/**
 * 限流提示横幅
 * @param scene 要展示的场景（默认 "chat"）
 * @param refreshKey 外部传入的刷新信号（如每次发送消息后 +1）触发重新拉取
 */
export function RateLimitBanner({
  scene = "chat",
  refreshKey = 0,
}: {
  scene?: string;
  refreshKey?: number;
}) {
  const [status, setStatus] = useState<SceneStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const userId = await getUserId().catch(() => null);
        if (!userId) {
          setLoading(false);
          return;
        }
        const token = await getApiToken();
        const res = await fetch(
          `/api/rate-limit?userId=${encodeURIComponent(userId)}`,
          {
            headers: token ? { Authorization: `Bearer ${token}` } : {},
          },
        );
        if (!res.ok) {
          setLoading(false);
          return;
        }
        const data = (await res.json()) as { scenes: SceneStatus[] };
        if (cancelled) return;
        const found = data.scenes.find((s) => s.scene === scene);
        setStatus(found ?? null);
      } catch {
        // 静默失败，不影响聊天
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [scene, refreshKey]);

  if (loading || !status) return null;

  // 已耗尽：醒目 banner + 配置链接
  if (status.remaining === 0) {
    return (
      <div className="rounded-lg border border-orange-300 dark:border-orange-700 bg-orange-50 dark:bg-orange-950/40 px-3 py-2 text-xs flex items-center justify-between gap-2">
        <span className="text-orange-700 dark:text-orange-300">
          今日 AI 调用已达上限（{status.limit} 次）
        </span>
        <Link
          href="/profile"
          className="shrink-0 text-blue-600 dark:text-blue-400 hover:underline font-medium"
        >
          配置自己的 API Key →
        </Link>
      </div>
    );
  }

  // 有剩余：轻量提示
  const low = status.remaining <= Math.max(1, Math.floor(status.limit * 0.2));
  return (
    <div
      className={`rounded-lg px-3 py-1.5 text-xs flex items-center justify-between gap-2 ${
        low
          ? "border border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300"
          : "border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 text-gray-500 dark:text-gray-400"
      }`}
    >
      <span>
        今日剩余 <strong className="font-semibold">{status.remaining}</strong> / {status.limit} 次
      </span>
      <Link
        href="/profile"
        className="shrink-0 text-blue-500 dark:text-blue-400 hover:underline"
      >
        配置自己的 Key →
      </Link>
    </div>
  );
}
