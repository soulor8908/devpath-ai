"use client";

// components/DailyNudge.tsx
// 每日 AI 主动提醒卡片
// AI Native 升级：让 AI 在用户没问时主动开口
// 流程：
//   1. 组件挂载 → 构建上下文快照（lib/ai/chat-context.ts）
//   2. 检查 IndexedDB 当天缓存，命中直接渲染
//   3. 未命中 → 调 /api/daily-nudge → 缓存 → 渲染
//   4. 用户可点刷新按钮强制重新生成（更新缓存）
//
// 反馈方式（设计原则：系统默认动作不阻塞用户）：
//   - 自动触发（首次进入首页 cache miss）：用卡片自身的 inline loader + toast 反馈
//     不弹 AITaskModal（模态框是"用户主动发起且必须等待"的场景，系统主动建议不该用）
//   - 手动触发（用户点"换一个"）：也走 inline loader，避免遮挡用户视线
//   - 失败：toast.error + 卡片内显示重试按钮

import { useState, useEffect, useCallback, useRef } from "react";
import { getItem, setItem } from "@/lib/storage/db";
import { KEY_PREFIXES } from "@/lib/types";
import { chinaDateNow } from "@/lib/time";
import { buildChatContext } from "@/lib/ai/chat-context";
import { aiFetch } from "@/lib/api-client";
import { getDefaultModelConfig } from "@/lib/model-config";
import { toast } from "@/lib/toast";
import {
  recordAICall,
  trackAIFeedback,
  startTimer,
  makeInputDigest,
  makeOutputDigest,
  generateCallId,
} from "@/lib/ai/quality-tracker";
import { Icon } from "@/components/Icon";
import { Button } from "@/components/ui";

interface NudgePayload {
  nudge: string;
  source: "ai" | "rule";
  generatedAt: string;
}

interface CachedNudge extends NudgePayload {
  date: string;
  /** 关联的 AI 调用记录 ID（用于反馈归因） */
  aiCallId?: string;
}

export function DailyNudge() {
  const [nudge, setNudge] = useState<NudgePayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // 当前展示的 nudge 对应的 callId（用于反馈归因）
  const callIdRef = useRef<string | null>(null);

  const today = chinaDateNow();
  const cacheKey = KEY_PREFIXES.DAILY_NUDGE + today;

  const fetchNudge = useCallback(
    async (forceRefresh: boolean): Promise<void> => {
      setLoading(true);
      setError(null);

      // 1. 命中当天缓存（非强制刷新）直接用
      if (!forceRefresh) {
        try {
          const cached = await getItem<CachedNudge>(cacheKey);
          if (cached && cached.date === today && cached.nudge) {
            setNudge({
              nudge: cached.nudge,
              source: cached.source,
              generatedAt: cached.generatedAt,
            });
            callIdRef.current = cached.aiCallId ?? null;
            setLoading(false);
            return;
          }
        } catch {
          /* 缓存读取失败，继续走 AI */
        }
      }

      // 2. 构建上下文快照
      let contextSnapshot = "";
      try {
        contextSnapshot = await buildChatContext();
      } catch {
        contextSnapshot = "";
      }

      // 3. 调 API + AI 质量追踪
      // 不再使用 startAITask（模态弹框）—— 系统默认动作不应阻塞用户
      // 进度反馈由卡片自身 inline loader 承担，完成/失败用 toast 提示
      //
      // Trial 模式降级（与 ChatClient 一致）：
      //   - 用户没配模型 / apiKey 为空 → 走普通 fetch（不带 session 签名头）
      //   - 服务端检测到无 session 会自动降级到 trial 模式（getModel + IP 限流）
      //   - 即使服务端没配 AI_API_KEY，也会降级到 rule 模板（不报错）
      //   - 关键约束：试用用户进首页不能看到"AI 提醒加载失败"
      const defaultCfg = await getDefaultModelConfig().catch(() => undefined);
      const useTrialMode = !defaultCfg || !defaultCfg.apiKey;

      const newCallId = generateCallId();
      const stopTimer = startTimer();
      try {
        const requestBody = JSON.stringify({ contextSnapshot });
        const res = useTrialMode
          ? await fetch("/api/daily-nudge", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: requestBody,
            })
          : await aiFetch("/api/daily-nudge", {
              method: "POST",
              body: requestBody,
            });

        if (!res.ok) {
          throw new Error(`请求失败 (${res.status})`);
        }

        const data = (await res.json()) as NudgePayload;
        const durationMs = stopTimer();
        setNudge(data);
        callIdRef.current = newCallId;

        // AI 质量追踪：记录调用（异步，失败静默）
        void recordAICall({
          callId: newCallId,
          scene: "daily_nudge",
          promptId: "daily_nudge",
          inputDigest: makeInputDigest(contextSnapshot),
          outputDigest: makeOutputDigest(data),
          schemaValid: true,
          durationMs,
          source: data.source === "ai" ? "ai" : "rule",
        }).catch(() => {});

        // 4. 写入缓存（带 callId，便于刷新后仍可归因）
        try {
          const cached: CachedNudge = { ...data, date: today, aiCallId: newCallId };
          await setItem(cacheKey, cached);
        } catch {
          /* 缓存写入失败忽略 */
        }
        // 仅强制刷新时弹 toast（让用户知道"换一个"成功）；
        // 自动触发不弹 toast（卡片本身已显示就是反馈，避免打扰）
        if (forceRefresh) {
          toast.success("今日建议已更新");
        }
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        setError(msg);
        // 失败用 toast 反馈（非阻塞，用户可继续浏览其他内容）
        toast.error(`AI 提醒加载失败：${msg}`);
      } finally {
        setLoading(false);
      }
    },
    [cacheKey, today]
  );

  useEffect(() => {
    void fetchNudge(false);
  }, [fetchNudge]);

  if (loading) {
    return (
      <div
        className="mb-4 rounded-lg border border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 p-3 dark:border-blue-800 dark:from-blue-950 dark:to-indigo-950"
        aria-busy="true"
      >
        <div className="flex items-center gap-2">
          <Icon name="sparkles" className="w-4 h-4" />
          <span className="text-sm text-gray-500 dark:text-gray-400">
            AI 正在为你准备今日建议...
          </span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mb-4 rounded-lg border border-gray-200 bg-white p-3 dark:border-gray-700 dark:bg-gray-800">
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs text-gray-400 truncate">
            <Icon name="alert" className="w-3.5 h-3.5 inline-block align-middle" /> AI 提醒加载失败：{error}
          </span>
          <Button
            variant="link"
            size="sm"
            onClick={() => void fetchNudge(true)}
            className="text-xs text-blue-500 hover:underline shrink-0"
          >
            重试
          </Button>
        </div>
      </div>
    );
  }

  if (!nudge) return null;

  // 隐式反馈：用户点"换一个" = 当前建议不满意
  const handleRefresh = () => {
    if (callIdRef.current) {
      void trackAIFeedback({
        callRecordId: callIdRef.current,
        scene: "daily_nudge",
        action: "regenerated",
      }).catch(() => {});
    }
    void fetchNudge(true);
  };

  // 显式反馈：用户点 👎 = 当前建议没帮助
  const handleThumbsDown = () => {
    if (callIdRef.current) {
      void trackAIFeedback({
        callRecordId: callIdRef.current,
        scene: "daily_nudge",
        rating: 1,
      }).catch(() => {});
    }
  };

  return (
    <div className="mb-4 rounded-lg border border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 p-3 dark:border-blue-800 dark:from-blue-950 dark:to-indigo-950">
      <div className="flex items-start gap-2">
        <Icon name="sparkles" className="w-4 h-4 shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-sm text-gray-800 dark:text-gray-200 leading-relaxed">
            {nudge.nudge}
          </p>
          <div className="mt-1 flex items-center gap-2 text-2xs text-gray-400">
            <span>
              {nudge.source === "ai" ? "AI 生成" : "规则生成"} ·{" "}
              {new Date(nudge.generatedAt).toLocaleTimeString("zh-CN", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
            <Button
              variant="link"
              size="sm"
              onClick={handleRefresh}
              className="text-blue-500 hover:underline"
              aria-label="重新生成今日建议"
            >
              换一个 →
            </Button>
            {nudge.source === "ai" && (
              <Button
                variant="ghost"
                size="sm"
                iconOnly
                onClick={handleThumbsDown}
                className="text-gray-400 hover:text-red-500 transition-colors"
                aria-label="这条建议没帮助"
                title="这条建议没帮助"
              >
                <Icon name="thumbs-down" className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
