"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { getItem, setItem } from "@/lib/storage/db";
import { aiFetch } from "@/lib/api-client";
import {
  KEY_PREFIXES,
  type LearningPlan,
  type ScheduleItem,
  type Routine,
  type KnowledgeNode,
} from "@/lib/types";
import { getRoutine, saveRoutine, DEFAULT_ROUTINE } from "@/lib/learn-log";
import { savePlanSummary } from "@/lib/plan-summary";
import { nowISO } from "@/lib/time";
import { Icon } from "@/components/Icon";

type RoutineSlot = Routine["slots"][number];

const INTENSITY_OPTIONS: { value: Routine["intensity"]; label: string }[] = [
  { value: "light", label: "轻松" },
  { value: "standard", label: "标准" },
  { value: "intensive", label: "冲刺" },
];

const WEEKDAY_LABELS = ["周一", "周二", "周三", "周四", "周五", "周六", "周日"];

const INTENSITY_HINT: Record<Routine["intensity"], string> = {
  light: "轻松：每天少安排一些",
  standard: "标准：按目标时间安排",
  intensive: "冲刺：尽量填满可用时段",
};

/** 包含题目 ID 的 IndexedDB key（独立于 plan，保持 plan.questions 完整） */
function includedKey(planId: string): string {
  return `${KEY_PREFIXES.PLAN}${planId}:included`;
}

export default function PlanEditClient() {
  const params = useParams<{ planId: string }>();
  const planId = params?.planId ?? "";
  const router = useRouter();

  const [plan, setPlan] = useState<LearningPlan | null>(null);
  const [nodes, setNodes] = useState<KnowledgeNode[]>([]);
  const [includedIds, setIncludedIds] = useState<Set<string>>(new Set());
  const [routine, setRoutine] = useState<Routine>(DEFAULT_ROUTINE);
  const [loading, setLoading] = useState(true);

  const [instruction, setInstruction] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [aiSuccess, setAiSuccess] = useState(false);

  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const p = await getItem<LearningPlan>(KEY_PREFIXES.PLAN + planId);
      if (!p) {
        router.push("/learn");
        return;
      }
      if (cancelled) return;
      setPlan(p);
      // 节点优先级：按 customOrder 升序，未设置则按原顺序
      const sortedNodes = [...p.knowledgeTree].sort(
        (a, b) => (a.customOrder ?? 0) - (b.customOrder ?? 0)
      );
      setNodes(sortedNodes.map((n, i) => ({ ...n, customOrder: i })));
      setIncludedIds(new Set(p.questions.map((q) => q.id)));
      // 读取已保存的包含列表（覆盖默认全选）
      const savedIncluded = await getItem<string[]>(includedKey(planId));
      if (savedIncluded && !cancelled) {
        setIncludedIds(new Set(savedIncluded));
      }
      const r = await getRoutine();
      if (!cancelled) {
        setRoutine(r ?? DEFAULT_ROUTINE);
      }
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [planId, router]);

  // ---- Routine 编辑 ----
  function updateRoutine(patch: Partial<Routine>) {
    setRoutine((prev) => ({ ...prev, ...patch }));
  }

  function updateSlot(index: number, patch: Partial<RoutineSlot>) {
    setRoutine((prev) => ({
      ...prev,
      slots: prev.slots.map((s, i) => (i === index ? { ...s, ...patch } : s)),
    }));
  }

  function addSlot() {
    setRoutine((prev) => ({
      ...prev,
      slots: [
        ...prev.slots,
        { label: "新时段", start: "20:00", end: "21:00", minutes: 30 },
      ],
    }));
  }

  function removeSlot(index: number) {
    setRoutine((prev) => ({
      ...prev,
      slots: prev.slots.filter((_, i) => i !== index),
    }));
  }

  function toggleWeekday(day: number) {
    setRoutine((prev) => {
      const has = prev.weekdays.includes(day);
      return {
        ...prev,
        weekdays: has
          ? prev.weekdays.filter((d) => d !== day)
          : [...prev.weekdays, day].sort(),
      };
    });
  }

  // ---- 节点优先级 ----
  function moveNode(index: number, dir: -1 | 1) {
    const newIndex = index + dir;
    if (newIndex < 0 || newIndex >= nodes.length) return;
    const next = [...nodes];
    [next[index], next[newIndex]] = [next[newIndex], next[index]];
    setNodes(next.map((n, i) => ({ ...n, customOrder: i })));
  }

  // ---- 题目包含 ----
  function toggleQuestion(qid: string) {
    setIncludedIds((prev) => {
      const next = new Set(prev);
      if (next.has(qid)) next.delete(qid);
      else next.add(qid);
      return next;
    });
  }

  function selectAllQuestions() {
    if (!plan) return;
    setIncludedIds(new Set(plan.questions.map((q) => q.id)));
  }

  function clearAllQuestions() {
    setIncludedIds(new Set());
  }

  // ---- AI 调整 ----
  async function handleAIAdjust() {
    if (!plan) return;
    if (!instruction.trim()) return;
    setAiLoading(true);
    setAiError(null);
    setAiSuccess(false);
    try {
      const res = await aiFetch("/api/adjust-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plan: { ...plan, knowledgeTree: nodes },
          instruction: instruction.trim(),
          routine,
        }),
      });
      if (!res.ok) {
        const err = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(err.error || `请求失败 (${res.status})`);
      }
      const { schedule } = (await res.json()) as { schedule: ScheduleItem[] };
      const updated: LearningPlan = {
        ...plan,
        knowledgeTree: nodes,
        schedule,
        updatedAt: nowISO(),
      };
      setPlan(updated);
      setAiSuccess(true);
    } catch (e) {
      setAiError(e instanceof Error ? e.message : "AI 调整失败");
    } finally {
      setAiLoading(false);
    }
  }

  // ---- 保存 ----
  async function handleSave() {
    if (!plan) return;
    setSaving(true);
    setSaveError(null);
    setSaved(false);
    try {
      const updated: LearningPlan = {
        ...plan,
        knowledgeTree: nodes,
        updatedAt: nowISO(),
      };
      await setItem(KEY_PREFIXES.PLAN + plan.id, updated);
      await savePlanSummary(updated);
      await saveRoutine(routine);
      await setItem(includedKey(plan.id), Array.from(includedIds));
      setPlan(updated);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (e) {
      setSaveError(e instanceof Error ? e.message : "保存失败");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-400">加载中...</p>
      </div>
    );
  }

  if (!plan) return null;

  return (
    <div className="min-h-screen p-4 max-w-3xl mx-auto pb-20">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => router.back()}
          className="text-sm text-gray-400 mb-2"
        >
          ← 返回
        </button>
        <h1 className="text-xl font-bold">调整计划</h1>
        <p className="text-sm text-gray-500 mt-1">{plan.topic}</p>
      </div>

      {/* Routine 作息 */}
      <section className="border rounded-lg p-4 mb-4">
        <h2 className="text-base font-bold mb-3">作息时间表</h2>
        <div className="grid grid-cols-2 gap-3 mb-3">
          <label className="block">
            <span className="text-xs text-gray-600 block mb-1">起床时间</span>
            <input
              type="time"
              value={routine.wakeTime}
              onChange={(e) => updateRoutine({ wakeTime: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg text-sm"
            />
          </label>
          <label className="block">
            <span className="text-xs text-gray-600 block mb-1">睡觉时间</span>
            <input
              type="time"
              value={routine.sleepTime}
              onChange={(e) => updateRoutine({ sleepTime: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg text-sm"
            />
          </label>
        </div>

        <div className="mb-3">
          <span className="text-xs text-gray-600 block mb-1">可学习日期</span>
          <div className="flex flex-wrap gap-2">
            {WEEKDAY_LABELS.map((label, i) => {
              const day = i + 1;
              const active = routine.weekdays.includes(day);
              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => toggleWeekday(day)}
                  className={`px-3 py-1 text-xs rounded-lg border transition-colors ${
                    active
                      ? "bg-black text-white border-black"
                      : "bg-white text-gray-600 border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="mb-3">
          <span className="text-xs text-gray-600 block mb-1">学习强度</span>
          <div className="flex gap-2">
            {INTENSITY_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => updateRoutine({ intensity: opt.value })}
                className={`px-3 py-1 text-xs rounded-lg border transition-colors ${
                  routine.intensity === opt.value
                    ? "bg-black text-white border-black"
                    : "bg-white text-gray-600 border-gray-300 hover:bg-gray-50"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
          <p className="text-[11px] text-gray-400 mt-1">
            {INTENSITY_HINT[routine.intensity]}
          </p>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-gray-600">学习时段</span>
            <button
              type="button"
              onClick={addSlot}
              className="text-xs text-blue-600 hover:underline"
            >
              + 添加时段
            </button>
          </div>
          <div className="space-y-2">
            {routine.slots.map((slot, i) => (
              <div
                key={i}
                className="flex items-center gap-2 flex-wrap bg-gray-50 rounded-lg p-2"
              >
                <input
                  type="text"
                  value={slot.label}
                  onChange={(e) => updateSlot(i, { label: e.target.value })}
                  placeholder="标签"
                  className="px-2 py-1 border rounded text-xs w-20"
                />
                <input
                  type="time"
                  value={slot.start}
                  onChange={(e) => updateSlot(i, { start: e.target.value })}
                  className="px-2 py-1 border rounded text-xs"
                />
                <span className="text-xs text-gray-400">-</span>
                <input
                  type="time"
                  value={slot.end}
                  onChange={(e) => updateSlot(i, { end: e.target.value })}
                  className="px-2 py-1 border rounded text-xs"
                />
                <label className="flex items-center gap-1 text-xs text-gray-600">
                  <input
                    type="number"
                    value={slot.minutes}
                    min={0}
                    onChange={(e) =>
                      updateSlot(i, { minutes: Number(e.target.value) })
                    }
                    className="px-2 py-1 border rounded text-xs w-16"
                  />
                  min
                </label>
                <button
                  type="button"
                  onClick={() => removeSlot(i)}
                  className="text-xs text-red-500 hover:underline ml-auto"
                >
                  删除
                </button>
              </div>
            ))}
            {routine.slots.length === 0 && (
              <p className="text-xs text-gray-400">暂无学习时段</p>
            )}
          </div>
        </div>
      </section>

      {/* Priority 节点优先级 */}
      <section className="border rounded-lg p-4 mb-4">
        <h2 className="text-base font-bold mb-1">知识点优先级</h2>
        <p className="text-xs text-gray-400 mb-3">
          排在前面的优先学习（customOrder 越小优先级越高）
        </p>
        <div className="space-y-2">
          {nodes.map((node, i) => (
            <div
              key={node.id}
              className="flex items-center gap-2 border rounded-lg p-2"
            >
              <span className="text-xs text-gray-400 w-6 text-center shrink-0">
                {i + 1}
              </span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-medium truncate">
                    {node.title}
                  </span>
                  {node.bigTech && (
                    <span className="px-1.5 py-0.5 text-[10px] bg-red-100 text-red-700 rounded font-medium shrink-0">
                      大厂高频
                    </span>
                  )}
                </div>
                <div className="text-[11px] text-gray-400 mt-0.5">
                  难度{node.difficulty} · 频率{node.frequency}
                </div>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  onClick={() => moveNode(i, -1)}
                  disabled={i === 0}
                  className="w-7 h-7 border rounded text-xs disabled:opacity-30 hover:bg-gray-50"
                  aria-label="上移"
                >
                  ↑
                </button>
                <button
                  type="button"
                  onClick={() => moveNode(i, 1)}
                  disabled={i === nodes.length - 1}
                  className="w-7 h-7 border rounded text-xs disabled:opacity-30 hover:bg-gray-50"
                  aria-label="下移"
                >
                  ↓
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Question inclusion 题目包含 */}
      <section className="border rounded-lg p-4 mb-4">
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-base font-bold">题目包含</h2>
          <span className="text-xs text-gray-500">
            已选 {includedIds.size}/{plan.questions.length}
          </span>
        </div>
        <div className="flex gap-2 mb-3">
          <button
            type="button"
            onClick={selectAllQuestions}
            className="px-3 py-1 text-xs border rounded-lg hover:bg-gray-50"
          >
            全选
          </button>
          <button
            type="button"
            onClick={clearAllQuestions}
            className="px-3 py-1 text-xs border rounded-lg hover:bg-gray-50"
          >
            全不选
          </button>
        </div>
        <div className="space-y-1 max-h-72 overflow-y-auto">
          {plan.questions.map((q) => {
            const checked = includedIds.has(q.id);
            const node = nodes.find((n) => n.id === q.nodeId);
            return (
              <label
                key={q.id}
                className="flex items-start gap-2 p-2 rounded hover:bg-gray-50 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggleQuestion(q.id)}
                  className="mt-0.5"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm">{q.question}</p>
                  {node && (
                    <p className="text-[11px] text-gray-400 mt-0.5">
                      {node.title}
                    </p>
                  )}
                </div>
              </label>
            );
          })}
          {plan.questions.length === 0 && (
            <p className="text-xs text-gray-400">暂无题目</p>
          )}
        </div>
      </section>

      {/* AI 调整 */}
      <section className="border rounded-lg p-4 mb-4">
        <h2 className="text-base font-bold mb-1">AI 调整日程</h2>
        <p className="text-xs text-gray-400 mb-3">
          用自然语言描述调整需求，AI 会重排 schedule（不改变知识点和题目）
        </p>
        <textarea
          value={instruction}
          onChange={(e) => setInstruction(e.target.value)}
          placeholder="例如：每天只学30分钟 / 把大厂题优先排前面 / 周末多安排些复习"
          rows={3}
          className="w-full px-3 py-2 border rounded-lg text-sm resize-y focus:outline-none focus:ring-2 focus:ring-amber-400"
          disabled={aiLoading}
        />
        {aiError && (
          <div className="mt-2 rounded bg-red-50 px-3 py-2 text-sm text-red-600">
            {aiError}
          </div>
        )}
        {aiSuccess && (
          <div className="mt-2 rounded bg-green-50 px-3 py-2 text-sm text-green-700">
            日程已调整，记得点击下方保存。
          </div>
        )}
        <button
          type="button"
          onClick={handleAIAdjust}
          disabled={aiLoading || !instruction.trim()}
          className="mt-3 w-full py-2.5 bg-black text-white rounded-lg font-medium text-sm disabled:opacity-50 hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
        >
          {aiLoading ? (
            <>
              <span className="inline-block w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              AI 调整中...
            </>
          ) : (
            "让 AI 调整"
          )}
        </button>
      </section>

      {/* Save */}
      <button
        type="button"
        onClick={handleSave}
        disabled={saving}
        className="w-full py-3 bg-black text-white rounded-lg font-medium text-sm disabled:opacity-50 hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
      >
        {saving ? (
          <>
            <span className="inline-block w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            保存中...
          </>
        ) : saved ? (
          <><Icon name="check" className="w-3.5 h-3.5 inline-block" /> 已保存</>
        ) : (
          "保存全部修改"
        )}
      </button>
      {saveError && (
        <div className="mt-2 rounded bg-red-50 px-3 py-2 text-sm text-red-600">
          {saveError}
        </div>
      )}
    </div>
  );
}
