"use client";

import { useState } from "react";
import { setItem } from "@/lib/storage/db";
import { KEY_PREFIXES } from "@/lib/types";
import { chinaDateNow } from "@/lib/time";
import type { DailyStatus } from "@/lib/types";
import { Icon } from "@/components/Icon";

const QUICK_OPTIONS = [
  { energy: 2 as const, mood: "bad" as const, label: "不太好", icon: "frown" as const },
  { energy: 3 as const, mood: "neutral" as const, label: "一般", icon: "meh" as const },
  { energy: 4 as const, mood: "good" as const, label: "状态不错", icon: "smile" as const },
];

export function StatusCard() {
  const [selected, setSelected] = useState<DailyStatus | null>(null);

  async function handleClick(energy: 2 | 3 | 4, mood: "bad" | "neutral" | "good") {
    const status: DailyStatus = {
      date: chinaDateNow(),
      energy,
      mood,
      availableMinutes: 30,
      aiAdjustedLoad: 1.0,
      actualMinutes: 0,
    };
    await setItem(KEY_PREFIXES.STATUS + status.date, status);
    setSelected(status);
  }

  if (selected) {
    return (
      <div className="bg-white border rounded-lg p-4">
        <p className="text-sm text-gray-500 mb-1">今日状态</p>
        <p className="text-lg font-medium">
          {selected.energy >= 4 ? <Icon name="smile" className="w-5 h-5 inline-block align-middle" /> : selected.energy >= 3 ? <Icon name="meh" className="w-5 h-5 inline-block align-middle" /> : <Icon name="frown" className="w-5 h-5 inline-block align-middle" />} 精力 {selected.energy}/5
        </p>
        <p className="text-xs text-gray-400 mt-1">
          可用时间 {selected.availableMinutes}min · 建议负载 {selected.aiAdjustedLoad.toFixed(1)}x
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white border rounded-lg p-4">
      <p className="text-sm text-gray-500 mb-3">今天感觉怎么样？</p>
      <div className="flex gap-2">
        {QUICK_OPTIONS.map((opt) => (
          <button
            key={opt.label}
            onClick={() => handleClick(opt.energy, opt.mood)}
            className="flex-1 py-3 border rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="mb-1"><Icon name={opt.icon} className="w-6 h-6 inline-block" /></div>
            <div className="text-xs text-gray-600">{opt.label}</div>
          </button>
        ))}
      </div>
    </div>
  );
}
