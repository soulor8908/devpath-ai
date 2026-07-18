// components/EmotionRecorder.tsx
// P3 情绪简化 — 1 秒觉察 + AI 应对建议
//
// 设计（乔布斯视角）：
//   - 旧版 5 个字段（情绪+原因+影响+应对+多巴胺）→ 填写 2 分钟
//   - 新版：选情绪标签 → 输入原因+影响（1框）→ AI 生成建议 → 多选+自定义 → 保存
//   - 目标：10 秒完成
//
// 复用：
//   - 首页内联（紧凑模式）
//   - 情绪页全屏（完整模式 + 历史列表）
//
// 数据流：
//   1. 用户选情绪标签 → setState
//   2. 用户输入原因+影响 → setState
//   3. 用户点"AI 给建议" → POST /api/emotion-coping → 获取建议
//   4. 用户多选建议 + 可选自定义 → setState
//   5. 保存 → setItem(KEY_PREFIXES.EMOTION + date_id, entry) + scheduleAutoSync

"use client";

import { useState, useEffect, useRef } from "react";
import { nanoid } from "nanoid";
import {
  type EmotionTag,
  type DopamineTrigger,
  type EmotionEntry,
  KEY_PREFIXES,
} from "@/lib/types";
import { setItem as dbSet } from "@/lib/storage/db";
import { scheduleAutoSync } from "@/lib/sync";
import { aiFetch } from "@/lib/api-client";
import {
  recordAICall,
  startTimer,
  makeInputDigest,
} from "@/lib/ai/quality-tracker";
import { Icon } from "@/components/Icon";
import { Button, Input } from "@/components/ui";
import { startAITask, setAITaskContent, completeAITask, errorAITask } from "@/lib/ai-task-queue";

// 情绪标签 + emoji 映射
const EMOTION_OPTIONS: Array<{ tag: EmotionTag; emoji: string }> = [
  { tag: "焦虑", emoji: "😰" },
  { tag: "兴奋", emoji: "🤩" },
  { tag: "疲惫", emoji: "😪" },
  { tag: "烦躁", emoji: "😤" },
  { tag: "满足", emoji: "😊" },
  { tag: "冲动", emoji: "🥺" },
  { tag: "平静", emoji: "😌" },
  { tag: "沮丧", emoji: "😞" },
];

const DOPAMINE_OPTIONS: DopamineTrigger[] = [
  "无",
  "刷手机",
  "游戏",
  "短视频",
  "甜食",
  "其他",
];

interface Props {
  /** 保存成功后回调（如刷新历史列表、关闭弹层等） */
  onSaved?: (entry: EmotionEntry) => void;
  /** 紧凑模式（首页内联用）；完整模式（情绪页用） */
  compact?: boolean;
}

export function EmotionRecorder({ onSaved, compact = false }: Props) {
  const [tag, setTag] = useState<EmotionTag | null>(null);
  const [reason, setReason] = useState("");
  const [dopamine, setDopamine] = useState<DopamineTrigger>("无");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [selectedCoping, setSelectedCoping] = useState<string[]>([]);
  const [customCoping, setCustomCoping] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // P1.5 自动触发 AI 建议：选完标签 + 输入原因后 debounce 1s 自动调
  // 避免用户多按一次"给我建议"按钮
  const fetchRef = useRef<() => void>(() => {});
  const lastFiredRef = useRef<string>(""); // 防止相同输入重复触发

  // 请求 AI 应对建议
  const fetchSuggestions = async (options?: { manual?: boolean }) => {
    if (!tag) {
      setError("请先选择情绪标签");
      return;
    }
    setLoading(true);
    setError(null);

    // AI 质量追踪 - 启动计时
    const timer = startTimer();
    const inputDigest = makeInputDigest({ tag, reason });

    // 仅手动点击按钮时显示 AI 任务弹窗（自动 debounce 触发不弹窗，避免干扰输入）
    const isManual = options?.manual === true;
    let aiTaskId: string | null = null;
    let aiSignal: AbortSignal | null = null;
    if (isManual) {
      const task = startAITask("AI 生成情绪应对建议");
      aiTaskId = task.id;
      aiSignal = task.signal;
    }

    try {
      const res = await aiFetch("/api/emotion-coping", {
        method: "POST",
        signal: aiSignal ?? undefined,
        body: JSON.stringify({ tag, reason }),
      });
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
      const data = (await res.json()) as {
        suggestions: string[];
        source: "ai" | "rule";
      };
      setSuggestions(data.suggestions);
      setSelectedCoping([]); // 重置选择

      // 记录 AI 调用成功
      void recordAICall({
        scene: "emotion_coping",
        promptId: "emotion_coping",
        inputDigest,
        outputDigest: makeInputDigest(data.suggestions),
        schemaValid: true,
        durationMs: timer(),
        source: data.source,
      }).catch(() => {});

      if (aiTaskId) {
        setAITaskContent(aiTaskId, "建议已生成");
        completeAITask(aiTaskId);
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : "请求失败";
      setError(msg);
      // 记录 AI 调用失败
      void recordAICall({
        scene: "emotion_coping",
        promptId: "emotion_coping",
        inputDigest,
        outputDigest: "",
        schemaValid: false,
        durationMs: timer(),
        source: "rule",
      }).catch(() => {});

      if (aiTaskId) {
        errorAITask(aiTaskId, msg);
      }
    } finally {
      setLoading(false);
    }
  };

  // 每次 render 更新 ref，让 useEffect 能拿到最新的 fetchSuggestions
  fetchRef.current = fetchSuggestions;

  useEffect(() => {
    if (!tag) return;
    // 原因长度过短不触发（避免刚开始输入就调 AI）
    if (reason.trim().length < 2) return;
    const key = `${tag}|${reason.trim()}`;
    if (key === lastFiredRef.current) return; // 已触发过相同输入
    const timer = setTimeout(() => {
      lastFiredRef.current = key;
      fetchRef.current();
    }, 1000);
    return () => clearTimeout(timer);
  }, [tag, reason]);

  // 切换选中的建议
  const toggleSuggestion = (s: string) => {
    setSelectedCoping((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]
    );
  };

  // 保存
  const handleSave = async () => {
    if (!tag) {
      setError("请选择情绪标签");
      return;
    }
    const now = new Date();
    const entry: EmotionEntry = {
      id: nanoid(),
      date: now.toISOString().slice(0, 10),
      time: now.toTimeString().slice(0, 5),
      tag,
      emoji: EMOTION_OPTIONS.find((o) => o.tag === tag)?.emoji ?? "",
      reason: reason.trim(),
      copingSuggestions: suggestions,
      selectedCoping,
      customCoping: customCoping.trim(),
      dopamine,
    };
    await dbSet(`${KEY_PREFIXES.EMOTION}${entry.date}_${entry.id}`, entry);
    scheduleAutoSync();

    // 重置
    setTag(null);
    setReason("");
    setDopamine("无");
    setSuggestions([]);
    setSelectedCoping([]);
    setCustomCoping("");
    setError(null);

    onSaved?.(entry);
  };

  const padding = compact ? "p-3" : "p-4";

  return (
    <div className={`bg-white rounded-lg ${padding} space-y-3`}>
      {/* Step 1: 情绪标签 */}
      <div>
        <p className="text-xs text-gray-500 mb-2">1. 此刻的情绪</p>
        <div className="flex flex-wrap gap-1.5">
          {EMOTION_OPTIONS.map((opt) => (
            <button
              key={opt.tag}
              onClick={() => setTag(opt.tag)}
              className={`px-2.5 py-1.5 rounded-full text-xs border transition-colors ${
                tag === opt.tag
                  ? "bg-blue-500 text-white border-blue-500"
                  : "bg-white text-gray-700 border-gray-200 hover:border-blue-300"
              }`}
            >
              <span className="mr-0.5">{opt.emoji}</span>
              {opt.tag}
            </button>
          ))}
        </div>
      </div>

      {/* Step 2: 原因+影响（合并 1 个框） */}
      <div>
        <p className="text-xs text-gray-500 mb-2">2. 发生了什么？对你有什么影响？</p>
        <Input
          type="text"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="如：被领导批评了，心慌无法集中"
        />
      </div>

      {/* Step 3: AI 应对建议（P1.5: 选完标签+输入原因后自动触发） */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs text-gray-500">
            3. AI 应对建议
            {loading && (
              <span className="ml-2 text-blue-500 inline-flex items-center gap-1">
                <span className="inline-block w-3 h-3 border-2 border-blue-300 border-t-blue-600 rounded-full animate-spin" />
                自动生成中
              </span>
            )}
          </p>
          <button
            onClick={() => fetchSuggestions({ manual: true })}
            disabled={!tag || loading}
            className="text-xs px-2 py-1 rounded bg-blue-50 text-blue-600 hover:bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
            title="AI 会自动生成，也可手动重新生成"
          >
            <Icon name="sparkles" className="w-3.5 h-3.5 inline-block" />
            {suggestions.length > 0 ? "重新生成" : "给我建议"}
          </button>
        </div>

        {suggestions.length > 0 && (
          <div className="space-y-1.5">
            {suggestions.map((s, i) => (
              <button
                key={i}
                onClick={() => toggleSuggestion(s)}
                className={`w-full text-left px-3 py-2 rounded-lg text-xs border transition-colors ${
                  selectedCoping.includes(s)
                    ? "bg-green-50 border-green-300 text-green-700"
                    : "bg-gray-50 border-gray-200 text-gray-700 hover:border-green-200"
                }`}
              >
                <span className="inline-block w-4">
                  {selectedCoping.includes(s) ? "✓" : ""}
                </span>
                {s}
              </button>
            ))}
          </div>
        )}

        {/* 自定义应对 */}
        {suggestions.length > 0 && (
          <Input
            type="text"
            value={customCoping}
            onChange={(e) => setCustomCoping(e.target.value)}
            placeholder="+ 自定义应对方式（可选）"
            inputSize="sm"
            className="mt-2"
          />
        )}

        {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
      </div>

      {/* Step 4: 多巴胺干扰来源 */}
      <div>
        <p className="text-xs text-gray-500 mb-2">4. 多巴胺干扰来源</p>
        <div className="flex flex-wrap gap-1.5">
          {DOPAMINE_OPTIONS.map((opt) => (
            <button
              key={opt}
              onClick={() => setDopamine(opt)}
              className={`px-2.5 py-1 rounded-full text-xs border transition-colors ${
                dopamine === opt
                  ? "bg-orange-500 text-white border-orange-500"
                  : "bg-white text-gray-700 border-gray-200 hover:border-orange-300"
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
      </div>

      {/* 保存 */}
      <Button
        onClick={handleSave}
        disabled={!tag}
        block
      >
        保存
      </Button>
    </div>
  );
}
