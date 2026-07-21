"use client";

// app/learn/new/page.tsx
// 学习教练创建页（原 /learn/page.tsx 迁移而来）：
// - 顶部：AI 主题输入（任意主题 → 渐进式向导）
// - 中部：4 个预设知识库（算法200题/前端/后端/AI）—— 内置数据秒级加载
//   · 点击预设 → 弹窗展示知识树脑图（可点击节点开始学习）
//   · 右上角"重新生成"按钮 → 调用 AI 重新生成整个知识树
// - 非预设主题提交 → 进入 LearnWizard 4 步向导（知识点 → 题目 → 答案 → 计划）
// - 快捷输入：基于用户最近学习/复习/聊天记录智能推荐（无数据用默认）
// 历史计划列表已迁移到 /learn/list，本页聚焦"创建"。

import { useState, useMemo, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { setItem } from "@/lib/storage/db";
import { aiFetch } from "@/lib/api-client";
import { KEY_PREFIXES, type LearningPlan, type KnowledgeNode, type Question, type ScheduleItem, type PromptLibraryItem } from "@/lib/types";
import { PRESETS, type PresetMeta, matchPresetByTopic } from "@/lib/presets";
import { MindMap } from "@/components/MindMap";
import {
  listPrompts,
  savePrompt,
  markPromptUsed,
  deletePrompt,
  BUILTIN_PROMPTS,
} from "@/lib/prompt-library";
import { savePlanSummary } from "@/lib/plan-summary";
import { nanoid } from "nanoid";
import { Icon } from "@/components/Icon";
import { hasDemoData, clearDemoData } from "@/lib/demo/preset-data";
import { LearnWizard } from "@/components/LearnWizard";
import { getRecommendedQuickInputs, getDefaultQuickInputs } from "@/lib/recommend-quick-inputs";
import { toast } from "@/lib/toast";
import { confirmDialog } from "@/lib/confirm-dialog";
import { startAITask, setAITaskContent, completeAITask, errorAITask } from "@/lib/ai-task-queue";
import { Button, Input, Textarea } from "@/components/ui";

interface PresetPlanData {
  topic: string;
  knowledgeTree: KnowledgeNode[];
  questions: Question[];
  schedule: ScheduleItem[];
}

export default function LearnNewPage() {
  const router = useRouter();
  const [topic, setTopic] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [dailyMinutes, setDailyMinutes] = useState(30);
  const [maxNewPerDay, setMaxNewPerDay] = useState(1);

  // 视图状态：form 表单 / wizard 渐进式向导
  const [view, setView] = useState<"form" | "wizard">("form");

  // 快捷输入推荐：基于用户最近学习/复习/聊天记录
  const [quickInputs, setQuickInputs] = useState<string[]>(getDefaultQuickInputs());
  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const inputs = await getRecommendedQuickInputs();
        if (!cancelled && inputs.length > 0) setQuickInputs(inputs);
      } catch {
        // 推荐失败静默回退默认（不阻塞用户）
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // 读取 AI 工具生成的待处理计划参数（从聊天页 generate_learning_plan 跳转携带）
  // sessionStorage 中存放的是预填参数（topic/dailyMinutes/maxNewPerDay/prompt），
  // 非完整 LearningPlan，因此填入表单供用户确认后走正常创建流程
  useEffect(() => {
    const pending = sessionStorage.getItem("learn:pending_plan");
    if (!pending) return;
    try {
      const planData = JSON.parse(pending) as {
        topic?: string;
        dailyMinutes?: number;
        maxNewPerDay?: number;
        prompt?: string;
      };
      if (planData.topic) setTopic(planData.topic);
      if (typeof planData.dailyMinutes === "number") setDailyMinutes(planData.dailyMinutes);
      if (typeof planData.maxNewPerDay === "number") setMaxNewPerDay(planData.maxNewPerDay);
      if (planData.prompt) setPromptText(planData.prompt);
      toast.success("已填入 AI 生成的学习计划参数，请确认后开始");
    } catch {
      // 解析失败静默忽略
    } finally {
      sessionStorage.removeItem("learn:pending_plan");
    }
  }, []);

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

  // 按需加载提示词库（首次展开时调用）
  const ensurePromptLibrary = useCallback(async () => {
    if (promptLibraryLoaded) return;
    const prompts = await listPrompts();
    setPromptLibrary(prompts);
    setPromptLibraryLoaded(true);
  }, [promptLibraryLoaded]);

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
    const { id: aiTaskId, signal: aiSignal } = startAITask("AI 重新生成知识树");
    try {
      const res = await aiFetch("/api/learn", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: aiSignal,
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
      setAITaskContent(aiTaskId, "知识树已重新生成");
      completeAITask(aiTaskId);
    } catch (err) {
      errorAITask(aiTaskId, err instanceof Error ? err.message : "未知错误");
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
    if (hasDemo) {
      const ok = await confirmDialog({
        title: "清除示例数据？",
        message: "检测到首次访问注入的示例数据。已创建真实学习计划，是否清除示例数据？",
        confirmText: "清除",
        cancelText: "保留",
        danger: true,
      });
      if (ok) await clearDemoData();
    }
    // 如果点击了具体节点，通过 query 选中该节点
    const query = node ? `?node=${encodeURIComponent(node.id)}` : "";
    router.push(`/learn/${plan.id}${query}`);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!topic.trim()) return;

    // 精确匹配预设 → 立即打开预设弹窗（零等待，预设数据秒开）
    // 无匹配 → 进入 LearnWizard 渐进式向导（拆知识点 → 题目 → 答案 → 计划）
    const matched = matchPresetByTopic(topic.trim());
    if (matched) {
      const customizedPreset: PresetMeta = {
        ...matched,
        topic: topic.trim(),
      };
      openPreset(customizedPreset);
      setError("");
      setLoading(false);
      return;
    }

    // 无匹配预设 → 进入渐进式向导（取代旧版 /api/learn 全量生成）
    // 向导内部依次调用 /api/learn/knowledge → /questions → /answers
    // 用户每步确认后再继续，减少等待焦虑
    setError("");
    setView("wizard");
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

  // 向导视图：渐进式 AI 生成（拆知识点 → 题目 → 答案 → 计划）
  if (view === "wizard") {
    return (
      <LearnWizard
        topic={topic}
        initialPrompt={promptText}
        dailyMinutes={dailyMinutes}
        maxNewPerDay={maxNewPerDay}
        onExit={() => {
          setView("form");
          setTopic("");
          setPromptText("");
        }}
      />
    );
  }

  return (
    <div className="min-h-screen p-6 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-2xl font-bold">AI 学习教练</h1>
        <Link
          href="/learn/list"
          className="text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1"
        >
          <Icon name="book" className="w-4 h-4 inline-block" />
          我的学习
        </Link>
      </div>
      <p className="text-gray-500 mb-6">
        告诉 AI 你想学什么，它给你拆知识树、排学习计划、生面试题
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          type="text"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="你想学什么？"
          inputSize="lg"
          autoFocus
        />

        <div className="flex flex-wrap gap-2">
          {quickInputs.map((ex) => (
            <Button
              key={ex}
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setTopic(ex)}
              className="px-3 py-1"
            >
              {ex}
            </Button>
          ))}
        </div>

        {/* 自定义提示词 */}
        <div className="border rounded-lg p-3 bg-amber-50/50">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">
              <Icon name="target" className="w-4 h-4 inline-block align-middle" /> 自定义提示词（可选）
            </span>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="link"
                size="sm"
                onClick={async () => {
                  await ensurePromptLibrary();
                  setShowPromptLib((v) => !v);
                }}
              >
                <Icon name="book" className="w-4 h-4 inline-block align-middle" /> 常用 {promptLibraryLoaded ? `(${promptLibrary.length})` : ""}
              </Button>
              {promptText.trim() && (
                <Button
                  type="button"
                  variant="link"
                  size="sm"
                  onClick={() => setShowSavePrompt((v) => !v)}
                >
                  💾 存为常用
                </Button>
              )}
            </div>
          </div>
          <Textarea
            value={promptText}
            onChange={(e) => setPromptText(e.target.value)}
            placeholder="例如：请以大厂面试官视角拆解，重点考察高并发场景和源码原理；或留空使用默认生成逻辑"
            rows={3}
            maxLength={2000}
            showCount
          />
          {promptText.trim() && (
            <p className="text-2xs text-gray-400 mt-1">
              生成时会附加到 AI 请求
            </p>
          )}

          {/* 常用提示词选择 */}
          {showPromptLib && (
            <div className="mt-2 border-t pt-2 space-y-1">
              <p className="text-xs text-gray-500 mb-1">选择常用提示词：</p>
              {promptLibrary.length === 0 ? (
                <p className="text-xs text-gray-400">暂无，可输入后点击&quot;存为常用&quot;</p>
              ) : (
                promptLibrary.map((p) => (
                  <div
                    key={p.id}
                    className="flex items-start gap-2 p-2 rounded hover:bg-white border border-transparent hover:border-gray-200 transition-colors"
                  >
                    <Button
                      type="button"
                      variant="ghost"
                      className="flex-1 text-left"
                      onClick={() => applyPrompt(p)}
                    >
                      <p className="text-xs font-medium text-gray-800">
                        {p.title}
                        {p.usedCount > 0 && (
                          <span className="ml-2 text-2xs text-gray-400">
                            使用 {p.usedCount} 次
                          </span>
                        )}
                      </p>
                      <p className="text-2xs text-gray-500 line-clamp-2">
                        {p.content}
                      </p>
                    </Button>
                    {/* 仅用户自定义的可删除 */}
                    {!BUILTIN_PROMPTS.some((b) => b.id === p.id) && (
                      <Button
                        iconOnly
                        variant="ghost"
                        size="sm"
                        aria-label="删除"
                        onClick={() => removePrompt(p.id)}
                      >
                        <Icon name="x" className="w-3.5 h-3.5 inline-block" />
                      </Button>
                    )}
                  </div>
                ))
              )}
            </div>
          )}

          {/* 保存为常用提示词 */}
          {showSavePrompt && promptText.trim() && (
            <div className="mt-2 border-t pt-2 flex items-center gap-2">
              <Input
                type="text"
                value={savePromptTitle}
                onChange={(e) => setSavePromptTitle(e.target.value)}
                placeholder="给这个提示词起个名字"
                inputSize="sm"
                maxLength={40}
                className="flex-1"
              />
              <Button
                type="button"
                size="sm"
                variant="success"
                onClick={saveCurrentPrompt}
              >
                保存
              </Button>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => setShowSavePrompt(false)}
              >
                取消
              </Button>
            </div>
          )}
        </div>

        {error && (
          <p className="text-red-500 text-sm bg-red-50 px-3 py-2 rounded">{error}</p>
        )}

        <Button
          type="submit"
          variant="dark"
          size="lg"
          block
          disabled={!topic.trim()}
          loading={loading}
        >
          {loading ? "AI 生成中..." : "开始学习"}
        </Button>
      </form>

      {/* 预设知识库 */}
      <div className="mt-8">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
            <Icon name="package" className="w-4 h-4" />
            内置知识库（{PRESETS.length} 个方向）
          </h2>
          <span className="text-xs text-gray-400 dark:text-gray-500">秒级加载 · 可重新生成</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {PRESETS.map((p) => (
            <div
              key={p.id}
              role="button"
              tabIndex={0}
              aria-label={`打开内置知识库：${p.name}`}
              onClick={() => openPreset(p)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  openPreset(p);
                }
              }}
              className="group cursor-pointer text-left p-4 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 hover:shadow-card dark:hover:shadow-gray-900/30 rounded-card transition-all flex flex-col w-full focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40"
            >
              {/* 标题行：图标 + 名称 + 右侧箭头 */}
              <div className="flex items-center gap-2.5 mb-2">
                <span className="text-2xl shrink-0" aria-hidden="true">{p.icon}</span>
                <span className="font-bold text-sm text-gray-900 dark:text-gray-100 truncate flex-1">{p.name}</span>
                <Icon
                  name="chevron-right"
                  className="w-4 h-4 text-gray-300 dark:text-gray-600 group-hover:text-blue-500 dark:group-hover:text-blue-400 group-hover:translate-x-0.5 transition-all shrink-0"
                />
              </div>
              {/* 描述：2 行省略 */}
              <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mb-3 leading-relaxed min-h-[2rem]">
                {p.description}
              </p>
              {/* tags */}
              <div className="flex flex-wrap gap-1 mb-2.5">
                {p.tags.slice(0, 3).map((t) => (
                  <span
                    key={t}
                    className="px-1.5 py-0.5 text-2xs bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-300 rounded font-medium"
                  >
                    {t}
                  </span>
                ))}
              </div>
              {/* 统计：知识点 / 题目数 */}
              <div className="flex items-center gap-3 text-2xs text-gray-400 dark:text-gray-500 pt-2 border-t border-gray-100 dark:border-gray-700/50 mt-auto">
                <span className="flex items-center gap-0.5">
                  <Icon name="book" className="w-3 h-3" />
                  {p.knowledgeTree.length} 知识点
                </span>
                <span className="flex items-center gap-0.5">
                  <Icon name="list" className="w-3 h-3" />
                  {p.questions.length} 题
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

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
                    <span className="ml-2 px-1.5 py-0.5 bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 rounded text-2xs font-medium">
                      AI 重生成
                    </span>
                  )}
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 ml-2">
            <Button
              size="sm"
              variant="dark"
              onClick={onRegenerate}
              loading={regenerating}
              leftIcon={regenerating ? undefined : "refresh-cw"}
              title="调用 AI 重新生成整个知识树、面试题与学习计划"
            >
              {regenerating ? "生成中..." : "重新生成"}
            </Button>
            <Button
              iconOnly
              variant="ghost"
              size="sm"
              aria-label="关闭"
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center"
            >
              <Icon name="x" className="w-4 h-4 inline-block" />
            </Button>
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
          <Button
            onClick={onImportAll}
            block
            className="sm:w-auto"
          >
            一键导入全部 →
          </Button>
        </div>
      </div>
    </div>
  );
}
