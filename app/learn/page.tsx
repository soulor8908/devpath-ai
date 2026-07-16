"use client";

// app/learn/page.tsx
// 学习教练首页：
// - 顶部：AI 主题输入（任意主题 → AI 拆解）
// - 中部：4 个预设知识库（算法200题/前端/后端/AI）—— 内置数据秒级加载
//   · 点击预设 → 弹窗展示知识树脑图（可点击节点开始学习）
//   · 右上角"重新生成"按钮 → 调用 AI 重新生成整个知识树
// - 底部：历史计划列表（只加载摘要，按需读取完整 plan）

import { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { setItem, delItem } from "@/lib/storage/db";
import { aiFetch } from "@/lib/api-client";
import { KEY_PREFIXES, type LearningPlan, type KnowledgeNode, type Question, type ScheduleItem, type PromptLibraryItem, type LearningPlanSummary } from "@/lib/types";
import { PRESETS, type PresetMeta, matchPresetByTopic } from "@/lib/presets";
import { MindMap } from "@/components/MindMap";
import {
  listPrompts,
  savePrompt,
  markPromptUsed,
  deletePrompt,
  BUILTIN_PROMPTS,
} from "@/lib/prompt-library";
import {
  listPlanSummaries,
  savePlanSummary,
  deletePlanSummary,
  migrateSummaries,
} from "@/lib/plan-summary";
import { nanoid } from "nanoid";
import { Icon } from "@/components/Icon";
import { hasDemoData, clearDemoData } from "@/lib/demo/preset-data";

const EXAMPLES = [
  "前端性能优化",
  "React 源码原理",
  "TypeScript 进阶",
  "系统设计基础",
];

interface PresetPlanData {
  topic: string;
  knowledgeTree: KnowledgeNode[];
  questions: Question[];
  schedule: ScheduleItem[];
}

export default function LearnPage() {
  const router = useRouter();
  const [topic, setTopic] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [dailyMinutes, setDailyMinutes] = useState(30);
  const [maxNewPerDay, setMaxNewPerDay] = useState(1);
  const [history, setHistory] = useState<LearningPlanSummary[]>([]);
  const [confirmingDeleteId, setConfirmingDeleteId] = useState<string | null>(null);
  // 历史计划是否正在迁移（首次访问旧数据时一次性补齐 summary）
  const [historyMigrating, setHistoryMigrating] = useState(false);

  // 预设弹窗状态
  const [activePreset, setActivePreset] = useState<PresetMeta | null>(null);
  const [presetData, setPresetData] = useState<PresetPlanData | null>(null);
  const [presetSource, setPresetSource] = useState<"preset" | "ai">("preset");
  const [regenerating, setRegenerating] = useState(false);
  const [regenError, setRegenError] = useState("");
  const [selectedNodeId, setSelectedNodeId] = useState<string | undefined>();

  // 用户自定义提示词
  const [promptText, setPromptText] = useState("");
  const [promptLibrary, setPromptLibrary] = useState<PromptLibraryItem[]>([]);
  // 提示词库懒加载：仅当用户首次点击"常用"按钮时才加载（避免页面初始化时多读一次 IndexedDB）
  const [promptLibraryLoaded, setPromptLibraryLoaded] = useState(false);
  const [showPromptLib, setShowPromptLib] = useState(false);
  const [showSavePrompt, setShowSavePrompt] = useState(false);
  const [savePromptTitle, setSavePromptTitle] = useState("");

  // 加载历史计划摘要（轻量），首次访问自动迁移旧数据
  const refreshHistory = useCallback(async () => {
    setHistoryMigrating(true);
    try {
      // 兼容旧版本：扫描缺失 summary 并补齐（只读一次完整 plan）
      await migrateSummaries();
      const summaries = await listPlanSummaries();
      setHistory(summaries);
    } finally {
      setHistoryMigrating(false);
    }
  }, []);

  useEffect(() => {
    refreshHistory();
  }, [refreshHistory]);

  // 按需加载提示词库（首次展开时调用）
  const ensurePromptLibrary = useCallback(async () => {
    if (promptLibraryLoaded) return;
    const prompts = await listPrompts();
    setPromptLibrary(prompts);
    setPromptLibraryLoaded(true);
  }, [promptLibraryLoaded]);

  async function deletePlan(planId: string, e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (confirmingDeleteId !== planId) {
      setConfirmingDeleteId(planId);
      setTimeout(() => setConfirmingDeleteId(null), 3000);
      return;
    }
    await delItem(KEY_PREFIXES.PLAN + planId);
    await deletePlanSummary(planId);
    setHistory((h) => h.filter((p) => p.id !== planId));
    setConfirmingDeleteId(null);
  }

  // 打开预设弹窗：直接用内置数据
  function openPreset(p: PresetMeta) {
    setActivePreset(p);
    setPresetData({
      topic: p.topic,
      knowledgeTree: p.knowledgeTree,
      questions: p.questions,
      schedule: p.schedule,
    });
    setPresetSource("preset");
    setRegenError("");
    setSelectedNodeId(undefined);
  }

  function closePreset() {
    setActivePreset(null);
    setPresetData(null);
    setRegenerating(false);
    setRegenError("");
    setSelectedNodeId(undefined);
  }

  // 右上角"重新生成"按钮：调用 /api/learn 用 AI 重新生成整个知识树
  async function regenerateWithAI() {
    if (!activePreset || !presetData) return;
    setRegenerating(true);
    setRegenError("");
    try {
      const res = await aiFetch("/api/learn", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: presetData.topic,
          dailyMinutes,
          maxNewPerDay,
          prompt: promptText.trim() || undefined,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `请求失败 (${res.status})`);
      }
      const { plan } = (await res.json()) as { plan: LearningPlan };
      setPresetData({
        topic: plan.topic,
        knowledgeTree: plan.knowledgeTree,
        questions: plan.questions,
        schedule: plan.schedule,
      });
      setPresetSource("ai");
      setSelectedNodeId(undefined);
      // 如果使用了提示词，标记使用
      if (promptText.trim()) {
        const matched = promptLibrary.find((p) => p.content === promptText.trim());
        if (matched) await markPromptUsed(matched.id);
      }
    } catch (err) {
      setRegenError(err instanceof Error ? err.message : "未知错误");
    } finally {
      setRegenerating(false);
    }
  }

  // 基于当前 presetData 创建学习计划并跳转
  async function startLearningFromPreset(node?: KnowledgeNode) {
    if (!presetData) return;
    const now = new Date().toISOString();
    const plan: LearningPlan = {
      id: nanoid(),
      topic: presetData.topic,
      knowledgeTree: presetData.knowledgeTree,
      questions: presetData.questions,
      schedule: presetData.schedule,
      dailyMinutes,
      maxNewPerDay,
      fsrsMode: "standard",
      prompt: promptText.trim() || undefined,
      createdAt: now,
      updatedAt: now,
    };
    await setItem(KEY_PREFIXES.PLAN + plan.id, plan);
    await savePlanSummary(plan);
    // 创建真实计划后，若存在 Demo 数据则提示清除
    const hasDemo = await hasDemoData();
    if (hasDemo && window.confirm("检测到示例数据，是否清除示例数据？")) {
      await clearDemoData();
    }
    // 如果点击了具体节点，通过 query 选中该节点
    const query = node ? `?node=${encodeURIComponent(node.id)}` : "";
    router.push(`/learn/${plan.id}${query}`);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!topic.trim()) return;

    // P2 AI 等待优化：优先匹配预设，立即展示骨架知识树，AI 异步优化
    // 旧版：调 /api/learn 全屏 loading 30-90 秒
    // 新版：匹配到预设 → openPreset 弹窗骨架秒开 → 用户点"重新生成"才异步调 AI
    //       无匹配 → 回退到原 AI 全量生成流程
    const matched = matchPresetByTopic(topic.trim());
    if (matched) {
      // 立即打开预设弹窗（零等待）
      // 注意：这里用 topic 覆盖 preset.topic，让弹窗显示用户输入的主题
      const customizedPreset: PresetMeta = {
        ...matched,
        topic: topic.trim(), // 保留用户原始输入作为主题
      };
      openPreset(customizedPreset);
      // 提示用户可点"重新生成"用 AI 优化
      setError("");
      setLoading(false);
      return;
    }

    // 无匹配预设 → 回退到 AI 全量生成
    setLoading(true);
    setError("");
    try {
      const res = await aiFetch("/api/learn", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: topic.trim(),
          dailyMinutes,
          maxNewPerDay,
          prompt: promptText.trim() || undefined,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `请求失败 (${res.status})`);
      }
      const { planId, plan } = (await res.json()) as { planId: string; plan: LearningPlan };
      await setItem(KEY_PREFIXES.PLAN + planId, plan);
      await savePlanSummary(plan);
      // 如果使用了提示词，标记使用
      if (promptText.trim()) {
        // 提示词库可能尚未加载，仅在已加载时尝试匹配
        if (promptLibraryLoaded) {
          const matched = promptLibrary.find((p) => p.content === promptText.trim());
          if (matched) {
            await markPromptUsed(matched.id);
            // 刷新提示词库
            const prompts = await listPrompts();
            setPromptLibrary(prompts);
          }
        } else {
          // 库未加载：直接按内容查找一次（按需）
          const all = await listPrompts();
          const matched = all.find((p) => p.content === promptText.trim());
          if (matched) await markPromptUsed(matched.id);
        }
      }
      // 创建真实计划后，若存在 Demo 数据则提示清除
      const hasDemo = await hasDemoData();
      if (hasDemo && window.confirm("检测到示例数据，是否清除示例数据？")) {
        await clearDemoData();
      }
      router.push(`/learn/${planId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "未知错误");
    } finally {
      setLoading(false);
    }
  }

  // 选择某个常用提示词
  function applyPrompt(p: PromptLibraryItem) {
    setPromptText(p.content);
    setShowPromptLib(false);
  }

  // 保存当前提示词为常用
  async function saveCurrentPrompt() {
    const content = promptText.trim();
    if (!content) return;
    const title = savePromptTitle.trim() || content.slice(0, 20);
    await savePrompt(title, content);
    const prompts = await listPrompts();
    setPromptLibrary(prompts);
    setShowSavePrompt(false);
    setSavePromptTitle("");
  }

  // 删除某个用户自定义提示词
  async function removePrompt(id: string) {
    const ok = await deletePrompt(id);
    if (ok) {
      const prompts = await listPrompts();
      setPromptLibrary(prompts);
    }
  }

  const loadingState = loading || regenerating;

  if (loadingState && !activePreset) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-8">
        <div className="mb-6 animate-pulse">
          <Icon name="sparkles" className="w-12 h-12 inline-block" />
        </div>
        <p className="text-xl font-bold mb-2">
          {regenerating ? "AI 正在重新生成知识树..." : "AI 正在拆解知识树..."}
        </p>
        <p className="text-sm text-gray-500 mb-1">
          主题：{regenerating ? presetData?.topic : topic}
        </p>
        <p className="text-xs text-gray-400 mt-4">预计 30-90 秒，请稍候</p>
        {!regenerating && (
          <p className="text-xs text-blue-500 mt-2 max-w-md text-center">
            💡 等不及？下方可选预设知识库（秒开），AI 后台帮你优化
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-2">AI 学习教练</h1>
      <p className="text-gray-500 mb-6">
        告诉 AI 你想学什么，它给你拆知识树、排学习计划、生面试题
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="你想学什么？"
          className="w-full px-4 py-3 text-lg border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          autoFocus
        />

        <div className="flex flex-wrap gap-2">
          {EXAMPLES.map((ex) => (
            <button
              key={ex}
              type="button"
              onClick={() => setTopic(ex)}
              className="px-3 py-1 text-sm bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
            >
              {ex}
            </button>
          ))}
        </div>

        <div className="flex gap-4">
          <label className="flex-1">
            <span className="text-sm text-gray-600">每日学习时间（分钟）</span>
            <input
              type="number"
              value={dailyMinutes}
              onChange={(e) => setDailyMinutes(Number(e.target.value))}
              min={15}
              max={120}
              className="w-full px-3 py-2 border rounded mt-1"
            />
          </label>
          <label className="flex-1">
            <span className="text-sm text-gray-600">每日新内容数</span>
            <input
              type="number"
              value={maxNewPerDay}
              onChange={(e) => setMaxNewPerDay(Number(e.target.value))}
              min={1}
              max={5}
              className="w-full px-3 py-2 border rounded mt-1"
            />
          </label>
        </div>

        {/* 自定义提示词 */}
        <div className="border rounded-lg p-3 bg-amber-50/50">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">
              <Icon name="target" className="w-4 h-4 inline-block align-middle" /> 自定义提示词（可选）
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={async () => {
                  await ensurePromptLibrary();
                  setShowPromptLib((v) => !v);
                }}
                className="text-xs text-blue-600 hover:text-blue-800"
              >
                <Icon name="book" className="w-4 h-4 inline-block align-middle" /> 常用 {promptLibraryLoaded ? `(${promptLibrary.length})` : ""}
              </button>
              {promptText.trim() && (
                <button
                  type="button"
                  onClick={() => setShowSavePrompt((v) => !v)}
                  className="text-xs text-green-600 hover:text-green-800"
                >
                  💾 存为常用
                </button>
              )}
            </div>
          </div>
          <textarea
            value={promptText}
            onChange={(e) => setPromptText(e.target.value)}
            placeholder="例如：请以大厂面试官视角拆解，重点考察高并发场景和源码原理；或留空使用默认生成逻辑"
            rows={3}
            maxLength={2000}
            className="w-full px-3 py-2 text-sm border rounded resize-y focus:outline-none focus:ring-2 focus:ring-amber-400"
          />
          {promptText.trim() && (
            <p className="text-[11px] text-gray-400 mt-1">
              {promptText.length}/2000 字 · 生成时会附加到 AI 请求
            </p>
          )}

          {/* 常用提示词选择 */}
          {showPromptLib && (
            <div className="mt-2 border-t pt-2 space-y-1">
              <p className="text-xs text-gray-500 mb-1">选择常用提示词：</p>
              {promptLibrary.length === 0 ? (
                <p className="text-xs text-gray-400">暂无，可输入后点击"存为常用"</p>
              ) : (
                promptLibrary.map((p) => (
                  <div
                    key={p.id}
                    className="flex items-start gap-2 p-2 rounded hover:bg-white border border-transparent hover:border-gray-200 transition-colors"
                  >
                    <button
                      type="button"
                      onClick={() => applyPrompt(p)}
                      className="flex-1 text-left"
                    >
                      <p className="text-xs font-medium text-gray-800">
                        {p.title}
                        {p.usedCount > 0 && (
                          <span className="ml-2 text-[10px] text-gray-400">
                            使用 {p.usedCount} 次
                          </span>
                        )}
                      </p>
                      <p className="text-[11px] text-gray-500 line-clamp-2">
                        {p.content}
                      </p>
                    </button>
                    {/* 仅用户自定义的可删除 */}
                    {!BUILTIN_PROMPTS.some((b) => b.id === p.id) && (
                      <button
                        type="button"
                        onClick={() => removePrompt(p.id)}
                        className="text-gray-300 hover:text-red-500 text-xs"
                        aria-label="删除"
                      >
                        <Icon name="x" className="w-3.5 h-3.5 inline-block" />
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          )}

          {/* 保存为常用提示词 */}
          {showSavePrompt && promptText.trim() && (
            <div className="mt-2 border-t pt-2 flex items-center gap-2">
              <input
                type="text"
                value={savePromptTitle}
                onChange={(e) => setSavePromptTitle(e.target.value)}
                placeholder="给这个提示词起个名字"
                className="flex-1 px-2 py-1 text-sm border rounded"
                maxLength={40}
              />
              <button
                type="button"
                onClick={saveCurrentPrompt}
                className="px-3 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700"
              >
                保存
              </button>
              <button
                type="button"
                onClick={() => setShowSavePrompt(false)}
                className="px-2 py-1 text-xs text-gray-500"
              >
                取消
              </button>
            </div>
          )}
        </div>

        {error && (
          <p className="text-red-500 text-sm bg-red-50 px-3 py-2 rounded">{error}</p>
        )}

        <button
          type="submit"
          disabled={!topic.trim() || loading}
          className="w-full py-3 bg-black text-white rounded-lg font-medium disabled:opacity-50 hover:bg-gray-800 transition-colors"
        >
          {loading ? "AI 生成中..." : "开始学习"}
        </button>
      </form>

      {/* 预设知识库 */}
      <div className="mt-8">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-medium text-gray-500">
            <Icon name="package" className="w-4 h-4 inline-block align-middle" /> 内置知识库（{PRESETS.length} 个方向）
          </h2>
          <span className="text-xs text-gray-400">秒级加载 · 可重新生成</span>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {PRESETS.map((p) => (
            <button
              key={p.id}
              onClick={() => openPreset(p)}
              className="text-left p-3 border rounded-lg hover:border-blue-400 hover:shadow-sm transition-all bg-white"
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="text-2xl">{p.icon}</span>
                <span className="font-bold text-sm">{p.name}</span>
              </div>
              <p className="text-xs text-gray-500 line-clamp-2 mb-2">
                {p.description}
              </p>
              <div className="flex flex-wrap gap-1 mb-1">
                {p.tags.slice(0, 3).map((t) => (
                  <span
                    key={t}
                    className="px-1.5 py-0.5 text-[10px] bg-gray-100 text-gray-600 rounded"
                  >
                    {t}
                  </span>
                ))}
              </div>
              <p className="text-[11px] text-gray-400">
                {p.knowledgeTree.length} 知识点 · {p.questions.length} 题
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* 历史计划 */}
      {history.length > 0 && (
        <div className="mt-8">
          <h2 className="text-sm font-medium text-gray-500 mb-3">
            历史计划（{history.length}）
          </h2>
          <div className="space-y-2">
            {history.map((p) => (
              <Link
                key={p.id}
                href={`/learn/${p.id}`}
                className="block border rounded-lg p-3 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{p.topic}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {p.knowledgeCount} 知识点 · {p.questionCount} 题 ·{" "}
                      {new Date(p.createdAt).toLocaleDateString("zh-CN")}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 ml-2">
                    <button
                      onClick={(e) => deletePlan(p.id, e)}
                      className={`text-xs px-2 py-1 rounded transition-colors ${
                        confirmingDeleteId === p.id
                          ? "bg-red-500 text-white"
                          : "text-gray-400 hover:bg-red-50 hover:text-red-500"
                      }`}
                      aria-label="删除计划"
                    >
                      {confirmingDeleteId === p.id ? "确认删除" : <Icon name="x" className="w-3.5 h-3.5 inline-block" />}
                    </button>
                    <span className="text-xs text-gray-400">查看 →</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* 历史计划迁移中提示（仅首次访问旧数据时短暂出现） */}
      {historyMigrating && history.length === 0 && (
        <div className="mt-8 text-xs text-gray-400 text-center">
          正在加载历史计划…
        </div>
      )}

      {/* 预设脑图弹窗 */}
      {activePreset && presetData && (
        <PresetMindMapModal
          preset={activePreset}
          data={presetData}
          source={presetSource}
          regenerating={regenerating}
          regenError={regenError}
          selectedNodeId={selectedNodeId}
          onClose={closePreset}
          onRegenerate={regenerateWithAI}
          onSelectNode={(node) => {
            setSelectedNodeId(node.id);
            startLearningFromPreset(node);
          }}
          onImportAll={() => startLearningFromPreset()}
        />
      )}
    </div>
  );
}

// =================== 脑图弹窗 ===================

interface PresetMindMapModalProps {
  preset: PresetMeta;
  data: PresetPlanData;
  source: "preset" | "ai";
  regenerating: boolean;
  regenError: string;
  selectedNodeId?: string;
  onClose: () => void;
  onRegenerate: () => void;
  onSelectNode: (node: KnowledgeNode) => void;
  onImportAll: () => void;
}

function PresetMindMapModal({
  preset,
  data,
  source,
  regenerating,
  regenError,
  selectedNodeId,
  onClose,
  onRegenerate,
  onSelectNode,
  onImportAll,
}: PresetMindMapModalProps) {
  // 按 frequency 统计
  const stats = useMemo(() => {
    const high = data.knowledgeTree.filter((n) => n.frequency === "高").length;
    return {
      total: data.knowledgeTree.length,
      high,
      questions: data.questions.length,
      scheduleDays: new Set(data.schedule.map((s) => s.day)).size,
    };
  }, [data]);

  return (
    <div
      className="fixed inset-0 z-[60] bg-black/40 flex items-center justify-center p-0 sm:p-4 sm:pb-24 overscroll-contain"
      style={{ touchAction: "none" }}
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-gray-800 sm:rounded-2xl w-full max-w-5xl h-full sm:h-[85vh] flex flex-col overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 顶部：标题 + 右上角操作 */}
        <div
          className="shrink-0 flex items-start justify-between p-4 border-b dark:border-gray-700 bg-gradient-to-r from-gray-50 to-white dark:from-gray-900 dark:to-gray-800"
          style={{ touchAction: "manipulation" }}
        >
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-3xl">{preset.icon}</span>
              <div className="min-w-0">
                <h2 className="text-lg font-bold truncate text-gray-900 dark:text-gray-100">{data.topic}</h2>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {stats.total} 知识点 · {stats.questions} 题 · {stats.scheduleDays} 天计划 ·
                  高频 {stats.high} 个
                  {source === "ai" && (
                    <span className="ml-2 px-1.5 py-0.5 bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 rounded text-[10px] font-medium">
                      AI 重生成
                    </span>
                  )}
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 ml-2">
            <button
              onClick={onRegenerate}
              disabled={regenerating}
              className="px-3 py-1.5 text-xs bg-black text-white rounded-lg font-medium hover:bg-gray-800 disabled:opacity-50 transition-colors flex items-center gap-1"
              title="调用 AI 重新生成整个知识树、面试题与学习计划"
            >
              {regenerating ? (
                <>
                  <span className="inline-block w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  生成中...
                </>
              ) : (
                <><Icon name="refresh-cw" className="w-4 h-4 inline-block align-middle" /> 重新生成</>
              )}
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
              aria-label="关闭"
            >
              <Icon name="x" className="w-4 h-4 inline-block" />
            </button>
          </div>
        </div>

        {/* 重新生成错误 */}
        {regenError && (
          <div className="shrink-0 px-4 py-2 bg-red-50 dark:bg-red-950 text-red-600 dark:text-red-400 text-xs border-b dark:border-gray-700">
            重新生成失败：{regenError}
          </div>
        )}

        {/* 脑图 - 填充剩余空间，不滚动（MindMap 内部处理 pan/zoom） */}
        <div className="flex-1 min-h-0 overflow-hidden bg-gray-50 dark:bg-gray-900">
          {regenerating ? (
            <div className="flex flex-col items-center justify-center h-full min-h-[200px]">
              <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4" />
              <p className="text-sm text-gray-600 dark:text-gray-300 font-medium">
                AI 正在重新生成知识树...
              </p>
              <p className="text-xs text-gray-400 mt-1">
                预计 30-90 秒，请勿关闭弹窗
              </p>
            </div>
          ) : (
            <MindMap
              nodes={data.knowledgeTree}
              topic={data.topic}
              selectedNodeId={selectedNodeId}
              onSelectNode={onSelectNode}
              fillHeight
            />
          )}
        </div>

        {/* 底部：操作 */}
        <div
          className="shrink-0 p-3 border-t dark:border-gray-700 bg-white dark:bg-gray-800 flex items-center justify-between gap-2"
          style={{ touchAction: "manipulation" }}
        >
          <p className="text-xs text-gray-500 dark:text-gray-400 flex-1 hidden sm:block">
            <Icon name="lightbulb" className="w-4 h-4 inline-block align-middle" /> 点击任意知识点可立即开始学习该节点 · <Icon name="building" className="w-4 h-4 inline-block align-middle" /> 标记为大厂高频考点
          </p>
          <button
            onClick={onImportAll}
            className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg font-medium hover:bg-blue-700 transition-colors w-full sm:w-auto"
          >
            一键导入全部 →
          </button>
        </div>
      </div>
    </div>
  );
}
