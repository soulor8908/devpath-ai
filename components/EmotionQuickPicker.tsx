// components/EmotionQuickPicker.tsx
// Hero 区下方的极简情绪快捷选择（3 个 emoji 一行）
//
// 设计（乔布斯视角）：
//   - 情绪觉察是核心差异化功能，但旧版藏在折叠区第 5 区，3 秒看不到
//   - 极简 3 emoji 一行：兴奋（高能积极）/ 平静（中性）/ 疲惫（低能消极）
//     覆盖开发者日常 3 种核心状态，足够触发自我觉察
//   - 点击即记录，无需展开 / 填写原因 / 调 AI
//   - 深度记录（原因+影响+AI 建议）仍走 EmotionRecorder / /emotion 页
//
// 设计（卡帕西视角）：
//   - 复用 EmotionEntry 类型 + KEY_PREFIXES.EMOTION 存储（与完整版同构）
//   - 简化字段：reason/copingSuggestions/selectedCoping/customCoping/dopamine 全空
//   - id 用 nanoid 保证一天多条不冲突
//   - setItem 后调 scheduleAutoSync 异步同步到 KV（与 EmotionRecorder 一致）
//   - toast 反馈确认，不阻塞 UI
//
// 与 EmotionRecorder 的关系：
//   - 这里是"快照记录"，1 秒完成
//   - EmotionRecorder 是"深度记录"，10 秒完成，含 AI 建议
//   - 两边数据互通：/emotion 页能同时看到快照和深度记录

"use client";

import { useCallback, useState } from "react";
import { nanoid } from "nanoid";
import {
  type EmotionTag,
  type EmotionEntry,
  KEY_PREFIXES,
} from "@/lib/types";
import { setItem as dbSet } from "@/lib/storage/db";
import { scheduleAutoSync } from "@/lib/sync";
import { toast } from "@/lib/toast";
import { chinaDateNow } from "@/lib/time";
import { Button } from "@/components/ui";

interface QuickOption {
  tag: EmotionTag;
  emoji: string;
  /** toast 反馈文案 */
  feedback: string;
  /** emoji 旁的小标签 */
  label: string;
}

// 3 个核心情绪（高能积极 / 中性 / 低能消极）
const QUICK_OPTIONS: QuickOption[] = [
  { tag: "兴奋", emoji: "🤩", label: "兴奋", feedback: "记录了兴奋状态" },
  { tag: "平静", emoji: "😌", label: "平静", feedback: "记录了平静状态" },
  { tag: "疲惫", emoji: "😪", label: "疲惫", feedback: "记录了疲惫状态" },
];

interface EmotionQuickPickerProps {
  /** 可选回调：记录成功后通知父组件刷新（如首页 todayEmotions 统计） */
  onRecorded?: () => void;
}

export function EmotionQuickPicker({ onRecorded }: EmotionQuickPickerProps) {
  const [recording, setRecording] = useState(false);

  const handlePick = useCallback(
    async (option: QuickOption) => {
      if (recording) return;
      setRecording(true);
      try {
        const now = new Date();
        const entry: EmotionEntry = {
          id: nanoid(),
          date: chinaDateNow(),
          time: `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`,
          tag: option.tag,
          emoji: option.emoji,
          reason: "",
          copingSuggestions: [],
          selectedCoping: [],
          customCoping: "",
          // 快速记录无多巴胺来源信息，默认 "无"
          dopamine: "无",
        };
        await dbSet(KEY_PREFIXES.EMOTION + entry.id, entry);
        void scheduleAutoSync();
        toast.success(option.feedback);
        onRecorded?.();
      } catch {
        toast.error("记录失败，请重试");
      } finally {
        setRecording(false);
      }
    },
    [recording, onRecorded],
  );

  return (
    <section
      aria-label="快速情绪记录"
      className="mb-5"
    >
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs text-gray-500 dark:text-gray-400">此刻感受？</p>
        <a
          href="/emotion"
          className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
          aria-label="进入完整情绪记录页"
        >
          完整记录 →
        </a>
      </div>
      <div
        role="group"
        aria-label="选择当前情绪"
        className="grid grid-cols-3 gap-2"
      >
        {QUICK_OPTIONS.map((opt) => (
          <Button
            key={opt.tag}
            variant="ghost"
            onClick={() => void handlePick(opt)}
            disabled={recording}
            aria-label={`记录情绪：${opt.label}`}
            className="flex-col py-3 gap-1 h-auto rounded-xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 hover:shadow-card-hover active:scale-95"
          >
            <span aria-hidden className="text-3xl leading-none">
              {opt.emoji}
            </span>
            <span className="text-xs text-gray-600 dark:text-gray-300">
              {opt.label}
            </span>
          </Button>
        ))}
      </div>
    </section>
  );
}
