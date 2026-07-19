"use client";

// app/daily/page.tsx
// 每日日志编辑器（从主站 DailyEditor 迁移）
// 存储改为 IndexedDB（daily_log:<date>），不再依赖 GitHub

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { getItem, setItem } from "@/lib/storage/db";
import { KEY_PREFIXES, type DailyLog } from "@/lib/types";
import { parseDailyLog, toggleChecklistItem, createEmptyLog, formatDailyLog } from "@/lib/daily";
import { chinaDateNow } from "@/lib/time";
import { Button, Input, Textarea, Checkbox } from "@/components/ui";

export default function DailyPage() {
  const [date, setDate] = useState(chinaDateNow());
  const [log, setLog] = useState<DailyLog | null>(null);
  const [rawContent, setRawContent] = useState("");
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [hasData, setHasData] = useState(false);

  const loadLog = useCallback(async (d: string) => {
    setError("");
    try {
      const content = await getItem<string>(`${KEY_PREFIXES.DAILY_LOG}${d}`);
      if (content) {
        setRawContent(content);
        setLog(parseDailyLog(content, d));
        setHasData(true);
      } else {
        const empty = createEmptyLog(d);
        setLog(empty);
        setRawContent(formatDailyLog(empty));
        setHasData(false);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "加载失败");
    }
  }, []);

  useEffect(() => {
    void loadLog(date);
  }, [date, loadLog]);

  async function save() {
    if (!log) return;
    setSaving(true);
    setError("");
    try {
      const content = formatDailyLog(log);
      await setItem(`${KEY_PREFIXES.DAILY_LOG}${date}`, content);
      setRawContent(content);
      setSavedAt(Date.now());
      setHasData(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "保存失败");
    } finally {
      setSaving(false);
    }
  }

  async function toggleChecklist(idx: number) {
    if (!log) return;
    const newChecklist = [...log.checklist];
    newChecklist[idx] = {
      ...newChecklist[idx],
      checked: !newChecklist[idx].checked,
    };
    setLog({ ...log, checklist: newChecklist });
    const newContent = toggleChecklistItem(rawContent, idx);
    setRawContent(newContent);
    // 自动保存
    try {
      await setItem(`${KEY_PREFIXES.DAILY_LOG}${date}`, newContent);
      setSavedAt(Date.now());
      setHasData(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "保存失败");
    }
  }

  if (!log) {
    return (
      <div className="mx-auto max-w-2xl p-4">
        <p className="text-gray-400 text-sm">加载中...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-4 p-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">每日日志</h1>
        <Link href="/dashboard" className="text-sm text-blue-500 hover:underline">
          ← 返回
        </Link>
      </div>

      {error && <p className="text-red-500 text-xs">{error}</p>}

      <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-3">
        <Input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          inputSize="sm"
          className="max-w-[180px]"
        />
        {!hasData && (
          <span className="ml-2 text-xs text-gray-400">（新日志）</span>
        )}
      </div>

      {/* Checklist */}
      <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4">
        <p className="text-sm font-medium mb-2 text-gray-800 dark:text-gray-200">今日执行 checklist</p>
        <div className="space-y-2">
          {log.checklist.map((item, i) => (
            <Checkbox
              key={i}
              checked={item.checked}
              onChange={() => toggleChecklist(i)}
            >
              <span className={`text-sm ${item.checked ? "line-through text-gray-400" : "text-gray-700 dark:text-gray-300"}`}>
                {item.text}
              </span>
            </Checkbox>
          ))}
          {log.checklist.length === 0 && (
            <p className="text-xs text-gray-400">当日无 checklist</p>
          )}
        </div>
      </div>

      {/* 能量数据 */}
      <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 space-y-2">
        <p className="text-sm font-medium text-gray-800 dark:text-gray-200">能量数据</p>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <label className="flex items-center gap-1 text-gray-700 dark:text-gray-300">
            睡眠
            <Input
              inputSize="sm"
              value={log.energy.sleep}
              onChange={(e) => setLog({ ...log, energy: { ...log.energy, sleep: e.target.value } })}
              placeholder="7.5"
              className="w-12"
            />
            h
          </label>
          <Checkbox
            checked={log.energy.sleepOnTime === true}
            onChange={(e) => setLog({ ...log, energy: { ...log.energy, sleepOnTime: e.target.checked } })}
            label={<span className="text-xs">22:45 关灯</span>}
            className="text-gray-700 dark:text-gray-300"
          />
          <Checkbox
            checked={log.energy.exerciseDone === true}
            onChange={(e) => setLog({ ...log, energy: { ...log.energy, exerciseDone: e.target.checked } })}
            label={<span className="text-xs">晨练执行</span>}
            className="text-gray-700 dark:text-gray-300"
          />
          <div className="flex items-center gap-1 text-xs text-gray-700 dark:text-gray-300">
            晨
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                onClick={() => setLog({ ...log, energy: { ...log.energy, energyMorning: n } })}
                className={`w-6 h-6 rounded ${log.energy.energyMorning === n ? "bg-blue-500 text-white" : "bg-gray-100 dark:bg-gray-700"}`}
              >
                {n}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-1 text-xs text-gray-700 dark:text-gray-300">
            中
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                onClick={() => setLog({ ...log, energy: { ...log.energy, energyNoon: n } })}
                className={`w-6 h-6 rounded ${log.energy.energyNoon === n ? "bg-blue-500 text-white" : "bg-gray-100 dark:bg-gray-700"}`}
              >
                {n}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-1 text-xs text-gray-700 dark:text-gray-300">
            晚
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                onClick={() => setLog({ ...log, energy: { ...log.energy, energyEvening: n } })}
                className={`w-6 h-6 rounded ${log.energy.energyEvening === n ? "bg-blue-500 text-white" : "bg-gray-100 dark:bg-gray-700"}`}
              >
                {n}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 复盘 */}
      <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 space-y-2">
        <p className="text-sm font-medium text-gray-800 dark:text-gray-200">复盘</p>
        <Textarea
          inputSize="sm"
          rows={3}
          value={log.review.good}
          onChange={(e) => setLog({ ...log, review: { ...log.review, good: e.target.value } })}
          placeholder="今天做得好的"
        />
        <Textarea
          inputSize="sm"
          rows={3}
          value={log.review.problems}
          onChange={(e) => setLog({ ...log, review: { ...log.review, problems: e.target.value } })}
          placeholder="今天的问题"
        />
        <Textarea
          inputSize="sm"
          rows={3}
          value={log.review.tomorrow}
          onChange={(e) => setLog({ ...log, review: { ...log.review, tomorrow: e.target.value } })}
          placeholder="明天的调整"
        />
      </div>

      <Button
        variant="primary"
        block
        loading={saving}
        leftIcon={savedAt && Date.now() - savedAt < 3000 ? "check" : undefined}
        onClick={save}
      >
        {saving ? "保存中..." : savedAt && Date.now() - savedAt < 3000 ? "已保存" : "保存日志"}
      </Button>
    </div>
  );
}
