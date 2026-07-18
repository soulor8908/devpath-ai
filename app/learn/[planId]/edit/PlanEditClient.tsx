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
import {
  getRoutine,
  saveRoutine,
  DEFAULT_ROUTINE,
  normalizeRoutine,
} from "@/lib/learn-log";
import { savePlanSummary } from "@/lib/plan-summary";
import { nowISO } from "@/lib/time";
import { Button, Input, Textarea, Checkbox } from "@/components/ui";
import { startAITask, setAITaskContent, completeAITask, errorAITask } from "@/lib/ai-task-queue";

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

  // 折叠面板：当前展开的 section
  const [openSection, setOpenSection] = useState<
    "routine" | "priority" | "questions" | "ai"
  >("routine");
  // 脏数据跟踪
  const [dirty, setDirty] = useState(false);
  const [aiAdjusted, setAiAdjusted] = useState(false);

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
        setRoutine(normalizeRoutine(r));
      }
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  // router 引用稳定（App Router），不作为 effect 依赖避免重渲染（React #185）
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [planId]);

  // ---- Routine 编辑 ----
  function updateRoutine(patch: Partial<Routine>) {
    setDirty(true);
    setRoutine((prev) => ({ ...prev, ...patch }));
  }

  function updateSlot(index: number, patch: Partial<RoutineSlot>) {
    setDirty(true);
    setRoutine((prev) => ({
      ...prev,
      slots: prev.slots.map((s, i) => (i === index ? { ...s, ...patch } : s)),
    }));
  }

  function addSlot() {
    setDirty(true);
    setRoutine((prev) => ({
      ...prev,
      slots: [
        ...prev.slots,
        { label: "新时段", start: "20:00", end: "21:00", minutes: 30 },
      ],
    }));
  }

  function removeSlot(index: number) {
    setDirty(true);
    setRoutine((prev) => ({
      ...prev,
      slots: prev.slots.filter((_, i) => i !== index),
    }));
  }

  function toggleWeekday(day: number) {
    setDirty(true);
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
    setDirty(true);
    const next = [...nodes];
    [next[index], next[newIndex]] = [next[newIndex], next[index]];
    setNodes(next.map((n, i) => ({ ...n, customOrder: i })));
  }

  // ---- 题目包含 ----
  function toggleQuestion(qid: string) {
    setDirty(true);
    setIncludedIds((prev) => {
      const next = new Set(prev);
      if (next.has(qid)) next.delete(qid);
      else next.add(qid);
      return next;
    });
  }

  function selectAllQuestions() {
    if (!plan) return;
    setDirty(true);
    setIncludedIds(new Set(plan.questions.map((q) => q.id)));
  }

  function clearAllQuestions() {
    setDirty(true);
    setIncludedIds(new Set());
  }

  // ---- AI 调整 ----
  async function handleAIAdjust() {
    if (!plan) return;
    if (!instruction.trim()) return;
    setAiLoading(true);
    setAiError(null);
    setAiSuccess(false);
    const { id: aiTaskId, signal: aiSignal } = startAITask("AI 调整学习日程");
    try {
      const res = await aiFetch("/api/adjust-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: aiSignal,
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
      setAiAdjusted(true);
      setDirty(true);
      setAITaskContent(aiTaskId, "日程已调整");
      completeAITask(aiTaskId);
    } catch (e) {
      errorAITask(aiTaskId, e instanceof Error ? e.message : "AI 调整失败");
      setAiError(e instanceof Error ? e.message : "AI 调整失败");
    } finally {
      setAiLoading(false);
    }
  }

  // ---- 保存 ----
  async function handleSave() {
    if (!plan) return;
    setSaving(true);
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
      setDirty(false);
      setAiAdjusted(false);
    } catch {
      // 保存失败由 finally 中的 setSaving(false) 处理 UI 状态
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
    <div className="min-h-screen p-4 max-w-3xl mx-auto pb-24">
      {/* Header */}
      <div className="mb-6">
        <Button
          onClick={() => router.back()}
          variant="ghost"
          size="sm"
          className="mb-2"
        >
          ← 返回
        </Button>
        <h1 className="text-xl font-bold">调整计划</h1>
        <p className="text-sm text-gray-500 mt-1">{plan.topic}</p>
      </div>

      {/* Routine 作息 */}
      <section className="border rounded-lg mb-4 overflow-hidden">
        <button
          type="button"
          onClick={() => setOpenSection("routine")}
          className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
        >
          <h2 className="text-base font-bold">作息时间表</h2>
          <span className="text-gray-400">
            {openSection === "routine" ? "▼" : "▶"}
          </span>
        </button>
        {openSection === "routine" && (
          <div className="p-4">
            <div className="grid grid-cols-2 gap-3 mb-3">
          <label className="block">
            <span className="text-xs text-gray-600 block mb-1">起床时间</span>
            <Input
              type="time"
              value={routine.wakeTime}
              onChange={(e) => updateRoutine({ wakeTime: e.target.value })}
              className="w-full"
            />
          </label>
          <label className="block">
            <span className="text-xs text-gray-600 block mb-1">睡觉时间</span>
            <Input
              type="time"
              value={routine.sleepTime}
              onChange={(e) => updateRoutine({ sleepTime: e.target.value })}
              className="w-full"
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
                <Button
                  key={day}
                  variant={active ? "dark" : "secondary"}
                  size="sm"
                  onClick={() => toggleWeekday(day)}
                >
                  {label}
                </Button>
              );
            })}
          </div>
        </div>

        <div className="mb-3">
          <span className="text-xs text-gray-600 block mb-1">学习强度</span>
          <div className="flex gap-2">
            {INTENSITY_OPTIONS.map((opt) => (
              <Button
                key={opt.value}
                variant={routine.intensity === opt.value ? "dark" : "secondary"}
                size="sm"
                onClick={() => updateRoutine({ intensity: opt.value })}
              >
                {opt.label}
              </Button>
            ))}
          </div>
          <p className="text-[11px] text-gray-400 mt-1">
            {INTENSITY_HINT[routine.intensity]}
          </p>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-gray-600">学习时段</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={addSlot}
              className="text-blue-600 hover:underline"
            >
              + 添加时段
            </Button>
          </div>
          <div className="space-y-2">
            {routine.slots.map((slot, i) => (
              <div
                key={i}
                className="flex items-center gap-2 flex-wrap bg-gray-50 rounded-lg p-2"
              >
                <Input
                  type="text"
                  value={slot.label}
                  onChange={(e) => updateSlot(i, { label: e.target.value })}
                  placeholder="标签"
                  inputSize="sm"
                  className="w-20"
                />
                <Input
                  type="time"
                  value={slot.start}
                  onChange={(e) => updateSlot(i, { start: e.target.value })}
                  inputSize="sm"
                  className="w-24"
                />
                <span className="text-xs text-gray-400">-</span>
                <Input
                  type="time"
                  value={slot.end}
                  onChange={(e) => updateSlot(i, { end: e.target.value })}
                  inputSize="sm"
                  className="w-24"
                />
                <label className="flex items-center gap-1 text-xs text-gray-600">
                  <Input
                    type="number"
                    value={slot.minutes}
                    min={0}
                    onChange={(e) =>
                      updateSlot(i, { minutes: Number(e.target.value) })
                    }
                    inputSize="sm"
                    className="w-16"
                  />
                  min
                </label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeSlot(i)}
                  className="text-red-500 hover:underline ml-auto"
                >
                  删除
                </Button>
              </div>
            ))}
            {routine.slots.length === 0 && (
              <p className="text-xs text-gray-400">暂无学习时段</p>
            )}
          </div>
        </div>
          </div>
        )}
      </section>

      {/* Priority 节点优先级 */}
      <section className="border rounded-lg mb-4 overflow-hidden">
        <button
          type="button"
          onClick={() => setOpenSection("priority")}
          className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
        >
          <h2 className="text-base font-bold">知识点优先级</h2>
          <span className="text-gray-400">
            {openSection === "priority" ? "▼" : "▶"}
          </span>
        </button>
        {openSection === "priority" && (
          <div className="p-4">
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
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => moveNode(i, -1)}
                  disabled={i === 0}
                  className="w-7 h-7"
                  aria-label="上移"
                >
                  ↑
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => moveNode(i, 1)}
                  disabled={i === nodes.length - 1}
                  className="w-7 h-7"
                  aria-label="下移"
                >
                  ↓
                </Button>
              </div>
            </div>
          ))}
        </div>
          </div>
        )}
      </section>

      {/* Question inclusion 题目包含 */}
      <section className="border rounded-lg mb-4 overflow-hidden">
        <button
          type="button"
          onClick={() => setOpenSection("questions")}
          className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
        >
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold">题目包含</h2>
            <span className="text-xs text-gray-500">
              已选 {includedIds.size}/{plan.questions.length}
            </span>
          </div>
          <span className="text-gray-400">
            {openSection === "questions" ? "▼" : "▶"}
          </span>
        </button>
        {openSection === "questions" && (
          <div className="p-4">
            <div className="flex gap-2 mb-3">
          <Button
            variant="secondary"
            size="sm"
            onClick={selectAllQuestions}
          >
            全选
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={clearAllQuestions}
          >
            全不选
          </Button>
        </div>
        <div className="space-y-1 max-h-72 overflow-y-auto">
          {plan.questions.map((q) => {
            const checked = includedIds.has(q.id);
            const node = nodes.find((n) => n.id === q.nodeId);
            return (
              <Checkbox
                key={q.id}
                checked={checked}
                onChange={() => toggleQuestion(q.id)}
                className="w-full items-start p-2 rounded hover:bg-gray-50"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm">{q.question}</p>
                  {node && (
                    <p className="text-[11px] text-gray-400 mt-0.5">
                      {node.title}
                    </p>
                  )}
                </div>
              </Checkbox>
            );
          })}
          {plan.questions.length === 0 && (
            <p className="text-xs text-gray-400">暂无题目</p>
          )}
        </div>
          </div>
        )}
      </section>

      {/* AI 调整 */}
      <section className="border rounded-lg mb-4 overflow-hidden">
        <button
          type="button"
          onClick={() => setOpenSection("ai")}
          className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
        >
          <h2 className="text-base font-bold">AI 调整日程</h2>
          <span className="text-gray-400">
            {openSection === "ai" ? "▼" : "▶"}
          </span>
        </button>
        {openSection === "ai" && (
          <div className="p-4">
            <p className="text-xs text-gray-400 mb-3">
              用自然语言描述调整需求，AI 会重排 schedule（不改变知识点和题目）
            </p>
            <Textarea
              value={instruction}
              onChange={(e) => setInstruction(e.target.value)}
              placeholder="例如：每天只学30分钟 / 把大厂题优先排前面 / 周末多安排些复习"
              rows={3}
              disabled={aiLoading}
              className="w-full"
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
            <Button
              variant="dark"
              block
              loading={aiLoading}
              disabled={aiLoading || !instruction.trim()}
              onClick={handleAIAdjust}
              className="mt-3"
            >
              {aiLoading ? "AI 调整中..." : "让 AI 调整"}
            </Button>
          </div>
        )}
      </section>

      {/* 吸底保存条 */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg z-50">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center gap-3">
          {aiAdjusted && (
            <span className="text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded">
              日程已更新，记得保存
            </span>
          )}
          {dirty && !aiAdjusted && (
            <span className="text-xs text-gray-500">有未保存的修改</span>
          )}
          <div className="flex-1" />
          <Button
            variant="dark"
            loading={saving}
            disabled={saving || !dirty}
            onClick={handleSave}
            leftIcon="check"
          >
            {saving ? "保存中..." : "保存全部修改"}
          </Button>
        </div>
      </div>
    </div>
  );
}
