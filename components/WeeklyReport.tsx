"use client";

// components/WeeklyReport.tsx
// 周报展示 + 生成按钮 + 历史列表
// 扩展：从 IndexedDB 加载 EmotionEntry 一并提交给 API（用于情绪+多巴胺章节）
// 成本追踪（t7）：从 /api/weekly 响应 _meta 读取 tokenUsage + modelId，写入 recordAICall

import { useState, useEffect } from "react";
import { listItems, setItem } from "@/lib/storage/db";
import { aiFetch } from "@/lib/api-client";
import type { LearnLog, ReviewLog, DailyStatus, EmotionEntry, TokenUsage } from "@/lib/types";
import { KEY_PREFIXES } from "@/lib/types";
import { Button } from "@/components/ui";
import { toast } from "@/lib/toast";
import { startAITask, setAITaskContent, completeAITask, errorAITask } from "@/lib/ai-task-queue";
import {
  recordAICall,
  startTimer,
  makeInputDigest,
  makeOutputDigest,
  generateCallId,
} from "@/lib/ai/quality-tracker";

interface WeeklyEntry {
  id: string;
  weekStart: string;
  content: string;
  createdAt: string;
}

/** /api/weekly 响应体类型（含 _meta 成本追踪字段） */
interface WeeklyApiResponse extends WeeklyEntry {
  _meta?: {
    tokenUsage?: TokenUsage;
    modelId?: string;
    traceId?: string;
  };
}

interface Props {
  learnLogs: LearnLog[];
  reviewLogs: ReviewLog[];
  statuses: DailyStatus[];
}

function getMondayStr(d = new Date()): string {
  const date = new Date(d);
  const day = date.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  date.setDate(date.getDate() + diff);
  return date.toISOString().slice(0, 10);
}

export function WeeklyReport({ learnLogs, reviewLogs, statuses }: Props) {
  const [history, setHistory] = useState<WeeklyEntry[]>([]);
  const [current, setCurrent] = useState<WeeklyEntry | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      const entries = await listItems<WeeklyEntry>("weekly:");
      entries.sort((a, b) => b.weekStart.localeCompare(a.weekStart));
      setHistory(entries);
    })();
  }, []);

  async function generate() {
    setLoading(true);
    const { id: aiTaskId, signal: aiSignal } = startAITask("AI 生成本周周报");
    const newCallId = generateCallId();
    const stopTimer = startTimer();
    try {
      const weekStart = getMondayStr();
      // 加载本周 EmotionEntry（用于情绪+多巴胺章节）
      const allEmotions = await listItems<EmotionEntry>(KEY_PREFIXES.EMOTION);
      // 取本周（weekStart 起 7 天）内的情绪条目
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 7);
      const weekEndStr = weekEnd.toISOString().slice(0, 10);
      const emotions = allEmotions.filter((e) => e.date >= weekStart && e.date < weekEndStr);

      const inputDigest = makeInputDigest({ weekStart, learnLogs, reviewLogs, statuses, emotions });

      const res = await aiFetch("/api/weekly", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: aiSignal,
        body: JSON.stringify({ weekStart, learnLogs, reviewLogs, statuses, emotions }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = (await res.json()) as WeeklyApiResponse;
      // 客户端存储周报到 IndexedDB（edge runtime 无法写入）
      // 注意：存储时剥离 _meta（成本追踪用，不需要持久化）
      const { _meta, ...entry } = data;
      await setItem(KEY_PREFIXES.WEEKLY + entry.id, entry);
      setCurrent(entry);
      setHistory((h) => [entry, ...h.filter((x) => x.id !== entry.id)]);
      setAITaskContent(aiTaskId, "周报已生成");
      completeAITask(aiTaskId);

      // 成本追踪（t7）：从 _meta 读取 tokenUsage + modelId
      void recordAICall({
        callId: newCallId,
        scene: "weekly_report",
        promptId: "weekly_report",
        inputDigest,
        outputDigest: makeOutputDigest(entry.content),
        schemaValid: true,
        durationMs: stopTimer(),
        source: "ai",
        tokenUsage: _meta?.tokenUsage,
        modelId: _meta?.modelId,
      }).catch(() => {});
    } catch (err) {
      errorAITask(aiTaskId, err instanceof Error ? err.message : "生成失败");
      toast.error(err instanceof Error ? err.message : "周报生成失败");
      throw err;
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <Button onClick={generate} loading={loading}>
        {loading ? "生成中..." : "生成本周周报"}
      </Button>

      {current && (
        <div className="rounded-lg border p-4">
          <h3 className="mb-2 font-semibold">本周报告（{current.weekStart} 起）</h3>
          <pre className="whitespace-pre-wrap text-sm text-gray-700">{current.content}</pre>
        </div>
      )}

      {history.length > 0 && (
        <div>
          <h4 className="mb-2 text-sm font-medium">历史周报</h4>
          <ul className="space-y-1">
            {history.map((h) => (
              <li key={h.id}>
                <Button variant="link" size="sm" onClick={() => setCurrent(h)}>
                  {h.weekStart} 起
                </Button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
