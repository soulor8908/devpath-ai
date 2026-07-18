"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import { getItem, setItem } from "@/lib/storage/db";
import { aiFetch } from "@/lib/api-client";
import { KEY_PREFIXES } from "@/lib/types";
import type { LearningPlan, Question, ScheduleItem } from "@/lib/types";
import { KnowledgeTree } from "@/components/KnowledgeTree";
import { QuestionCard } from "@/components/QuestionCard";
import { Icon } from "@/components/Icon";
import { toggleQuestionInPlan, createFavoriteDeck, listFavoriteDecks, deleteFavoriteDeck } from "@/lib/favorite";
import { savePlanSummary } from "@/lib/plan-summary";
import { nowISO } from "@/lib/time";
import { logLearning } from "@/lib/learn-log";
import { createCard, findExistingCard } from "@/lib/fsrs";
import {
  recordAICall,
  startTimer,
  makeInputDigest,
  makeOutputDigest,
  generateCallId,
} from "@/lib/ai/quality-tracker";
import { useAutoFullscreen } from "@/lib/hooks/use-auto-fullscreen";
import { toast } from "@/lib/toast";
import { confirmDialog } from "@/lib/confirm-dialog";
import {
  startAITask,
  appendAITaskContent,
  setAITaskContent,
  completeAITask,
  errorAITask,
} from "@/lib/ai-task-queue";

export default function PlanDetailClient() {
  const params = useParams<{ planId: string }>();
  const planId = params?.planId ?? "";
  const router = useRouter();
  const searchParams = useSearchParams();
  const [plan, setPlan] = useState<LearningPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [deckFavorited, setDeckFavorited] = useState(false);
  const [deckId, setDeckId] = useState<string | null>(null);
  const [regeneratingId, setRegeneratingId] = useState<string | null>(null);
  const [regenError, setRegenError] = useState<string | null>(null);
  const questionRefs = useRef<Record<string, HTMLDivElement | null>>({});
  // 题目区容器引用（用于从知识树跳转时滚动定位）
  const questionsSectionRef = useRef<HTMLDivElement | null>(null);
  // 批量补生成缺失答案（学习向导 Step 3 未完成时进入详情页可继续）
  const [generatingAnswers, setGeneratingAnswers] = useState(false);

  // 重新生成弹窗状态
  const [showRegenModal, setShowRegenModal] = useState(false);
  const [regenTopic, setRegenTopic] = useState("");
  const [regenPrompt, setRegenPrompt] = useState("");
  const [regenDailyMinutes, setRegenDailyMinutes] = useState(30);
  const [regenMaxNew, setRegenMaxNew] = useState(1);
  const [regeneratingPlan, setRegeneratingPlan] = useState(false);
  const [regenPlanError, setRegenPlanError] = useState<string | null>(null);

  // 筛选状态
  const [filterBigTech, setFilterBigTech] = useState<"all" | "big" | "normal">("all");
  const [filterDifficulty, setFilterDifficulty] = useState<number | "all">("all");
  const [filterNodeId, setFilterNodeId] = useState<string | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");

  const fullscreen = useAutoFullscreen();

  useEffect(() => {
    (async () => {
      const p = await getItem<LearningPlan>(KEY_PREFIXES.PLAN + planId);
      if (!p) {
        router.push("/learn");
        return;
      }
      setPlan(p);
      setLoading(false);
      // 初始化重新生成表单
      setRegenTopic(p.topic);
      setRegenPrompt(p.prompt ?? "");
      setRegenDailyMinutes(p.dailyMinutes);
      setRegenMaxNew(p.maxNewPerDay);
      // 检查是否已收藏为 deck
      const decks = await listFavoriteDecks();
      const found = decks.find((d) => d.planId === p.id);
      if (found) {
        setDeckFavorited(true);
        setDeckId(found.id);
      }

      // URL 参数 ?node=xxx 自动筛选 + 滚动到题目区
      // 用于从其他入口（脑图、知识树、追问等）带着知识点 id 进入
      const nodeParam = searchParams?.get("node");
      if (nodeParam && p.knowledgeTree.some((n) => n.id === nodeParam)) {
        setFilterNodeId(nodeParam);
        // 等 filteredQuestions 重渲染后再滚动
        setTimeout(() => {
          questionsSectionRef.current?.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        }, 100);
      }
    })();
  // router/searchParams 引用稳定（App Router），不作为 effect 依赖避免重渲染
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [planId]);

  async function handleQuestionFavorite(questionId: string) {
    if (!plan) return;
    const oldQ = plan.questions.find((q) => q.id === questionId);
    const updated = toggleQuestionInPlan(plan, questionId);
    setPlan(updated);
    await setItem(KEY_PREFIXES.PLAN + plan.id, updated);
    await savePlanSummary(updated);
    // 记录收藏日志（仅在新增收藏时）
    if (oldQ && !oldQ.favorited) {
      logLearning({
        planId: plan.id,
        nodeId: oldQ.nodeId,
        questionId,
        type: "question_favorite",
      }).catch(() => {});
    }
  }

  async function handleDeckFavorite() {
    if (!plan) return;
    if (deckFavorited && deckId) {
      // 已收藏 → 取消收藏（二次确认）
      const ok = await confirmDialog({
        title: "取消收藏？",
        message: "确定取消收藏这份试题集吗？",
        confirmText: "取消收藏",
        cancelText: "保留",
        danger: true,
      });
      if (!ok) return;
      await deleteFavoriteDeck(deckId);
      setDeckFavorited(false);
      setDeckId(null);
      return;
    }
    // 未收藏 → 收藏（真正写入 IndexedDB）
    try {
      const deck = await createFavoriteDeck(plan);
      setDeckFavorited(true);
      setDeckId(deck.id);
    } catch {
      // 静默失败
    }
  }

  // 点击 schedule 项 → 标记完成/取消完成，写回 plan
  async function handleScheduleClick(scheduleIndex: number) {
    if (!plan) return;
    const oldItem = plan.schedule[scheduleIndex];
    const willComplete = !oldItem.completed;
    const updated: LearningPlan = {
      ...plan,
      updatedAt: nowISO(),
      schedule: plan.schedule.map((item, idx) => {
        if (idx === scheduleIndex) {
          return {
            ...item,
            completed: willComplete,
            completedAt: willComplete ? nowISO() : undefined,
          };
        }
        return item;
      }),
    };
    setPlan(updated);
    await setItem(KEY_PREFIXES.PLAN + plan.id, updated);
    await savePlanSummary(updated);
    // 记录学习日志
    if (willComplete) {
      logLearning({
        planId: plan.id,
        nodeId: oldItem.nodeId,
        type: oldItem.type === "learn" ? "learn_complete" : "review_complete",
      }).catch(() => {});

      // learn_complete 时自动为该知识点下的题目造复习卡（带查重，避免重复）
      if (oldItem.type === "learn") {
        const nodeQuestions = plan.questions.filter((q) => q.nodeId === oldItem.nodeId);
        for (const q of nodeQuestions) {
          try {
            const existing = await findExistingCard({ planId: plan.id, questionId: q.id });
            if (!existing) {
              const card = createCard(
                plan.id,
                oldItem.nodeId,
                q.id,
                q.question,
                q.answer || "",
                plan.fsrsMode
              );
              await setItem(KEY_PREFIXES.CARD + card.id, card);
            }
          } catch {
            // 造卡失败不阻塞标记完成流程
          }
        }
      }
    }
  }

  // 跳转到对应知识点的第一道题
  function handleScheduleScroll(nodeId: string) {
    if (!plan) return;
    // 设置筛选条件，只显示该知识点的题目
    setFilterNodeId(nodeId);
    // 滚动到题目区
    setTimeout(() => {
      const q = plan.questions.find((x) => x.nodeId === nodeId);
      if (q && questionRefs.current[q.id]) {
        questionRefs.current[q.id]?.scrollIntoView({ behavior: "smooth", block: "center" });
      } else {
        // 该知识点暂无题目，滚动到题目区头部
        questionsSectionRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }
    }, 50);
  }

  // 知识树点击「进入」：筛选该知识点题目 + 滚动到题目区
  function handleKnowledgeNodeSelect(node: { id: string }) {
    handleScheduleScroll(node.id);
  }

  // 重新生成单道题
  async function handleRegenerate(questionId: string) {
    if (!plan) return;
    const oldQ = plan.questions.find((q) => q.id === questionId);
    if (!oldQ) return;
    const node = plan.knowledgeTree.find((n) => n.id === oldQ.nodeId);
    if (!node) return;
    setRegeneratingId(questionId);
    setRegenError(null);

    // AI 质量追踪：生成 callId + 计时（失败静默，不影响主流程）
    const callId = generateCallId();
    const stopTimer = startTimer();

    // 启动全局 AI 任务（弹窗显示进度）
    const { id: aiTaskId, signal: aiSignal } = startAITask("AI 重新生成题目");
    try {
      const res = await aiFetch("/api/regenerate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ node }),
        signal: aiSignal,
      });
      if (!res.ok) throw new Error(`请求失败 (${res.status})`);
      const { question } = (await res.json()) as { question: Question };
      const durationMs = stopTimer();

      // 记录 AI 调用（异步，不阻塞主流程）
      void recordAICall({
        callId,
        scene: "question_generate",
        promptId: "question_generate",
        inputDigest: makeInputDigest({ nodeId: node.id, title: node.title }),
        outputDigest: makeOutputDigest(question),
        schemaValid: true,
        durationMs,
        source: "ai",
        refId: question.id,
      }).catch(() => {});

      // 保留原 id 和 favorited 状态，替换内容；挂上 callId 供 QuestionCard 反馈归因
      const newQuestion: Question = {
        ...question,
        id: oldQ.id,
        favorited: oldQ.favorited,
        favoritedAt: oldQ.favoritedAt,
        aiCallId: callId,
      };
      const updated: LearningPlan = {
        ...plan,
        updatedAt: nowISO(),
        questions: plan.questions.map((q) => (q.id === questionId ? newQuestion : q)),
      };
      setPlan(updated);
      await setItem(KEY_PREFIXES.PLAN + plan.id, updated);
      await savePlanSummary(updated);
      setAITaskContent(aiTaskId, "题目已重新生成");
      completeAITask(aiTaskId);
    } catch (e) {
      setRegenError(e instanceof Error ? e.message : "重新生成失败");
      errorAITask(aiTaskId, e instanceof Error ? e.message : "重新生成失败");
    } finally {
      setRegeneratingId(null);
    }
  }

  // 打开重新生成弹窗
  function openRegenModal() {
    if (!plan) return;
    setRegenTopic(plan.topic);
    setRegenPrompt(plan.prompt ?? "");
    setRegenDailyMinutes(plan.dailyMinutes);
    setRegenMaxNew(plan.maxNewPerDay);
    setRegenPlanError(null);
    setShowRegenModal(true);
  }

  // 提交重新生成
  async function handleRegenPlan() {
    if (!plan) return;
    if (!regenTopic.trim()) {
      setRegenPlanError("主题不能为空");
      return;
    }
    setRegeneratingPlan(true);
    setRegenPlanError(null);
    // 启动全局 AI 任务（弹窗显示进度）
    const { id: aiTaskId, signal: aiSignal } = startAITask("AI 重新生成学习计划");
    try {
      const res = await aiFetch("/api/learn", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: regenTopic.trim(),
          dailyMinutes: regenDailyMinutes,
          maxNewPerDay: regenMaxNew,
          prompt: regenPrompt.trim() || undefined,
        }),
        signal: aiSignal,
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `请求失败 (${res.status})`);
      }
      const { plan: newPlan } = (await res.json()) as { plan: LearningPlan };
      // 保留原 planId，用新内容替换旧计划
      const replaced: LearningPlan = {
        ...newPlan,
        id: plan.id,
        createdAt: plan.createdAt,
        updatedAt: nowISO(),
      };
      setPlan(replaced);
      await setItem(KEY_PREFIXES.PLAN + plan.id, replaced);
      await savePlanSummary(replaced);
      setShowRegenModal(false);
      setAITaskContent(aiTaskId, "学习计划已重新生成");
      completeAITask(aiTaskId);
    } catch (e) {
      setRegenPlanError(e instanceof Error ? e.message : "重新生成失败");
      errorAITask(aiTaskId, e instanceof Error ? e.message : "重新生成失败");
    } finally {
      setRegeneratingPlan(false);
    }
  }

  // 批量补生成缺失答案：复用 /api/learn/answers 流式接口
  // 仅对 answer 为空的题目发起请求，逐题回写本地 plan
  async function handleContinueGenerate() {
    if (!plan) return;
    const missingQuestions = plan.questions.filter((q) => !q.answer);
    if (missingQuestions.length === 0) return;
    setGeneratingAnswers(true);
    // 启动全局 AI 任务（弹窗显示进度，流式输出）
    const { id: aiTaskId, signal: aiSignal } = startAITask("AI 继续生成答案");
    try {
      const res = await aiFetch(
        "/api/learn/answers",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            questions: missingQuestions,
            nodes: plan.knowledgeTree,
            topic: plan.topic,
          }),
          signal: aiSignal,
        },
        0,
      );
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `请求失败 (${res.status})`);
      }
      if (!res.body) throw new Error("响应无流");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      const updatedQuestions = [...plan.questions];

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";
        for (const line of lines) {
          if (!line.trim()) continue;
          try {
            const data = JSON.parse(line) as {
              questionId?: string;
              answer?: string;
              done?: boolean;
            };
            if (data.questionId && data.answer) {
              const idx = updatedQuestions.findIndex(
                (q) => q.id === data.questionId,
              );
              if (idx >= 0) {
                updatedQuestions[idx] = {
                  ...updatedQuestions[idx],
                  answer: data.answer,
                };
                // 增量回写：让用户看到逐题完成的进度
                setPlan({ ...plan, questions: [...updatedQuestions] });
                // 流式追加到 AI 任务弹窗
                appendAITaskContent(aiTaskId, `Q${idx + 1}: ${data.answer}\n\n`);
              }
            }
          } catch {
            // 单行 JSON 解析失败：跳过（不影响后续行）
          }
        }
      }
      // 处理流末尾残留 buffer
      if (buffer.trim()) {
        try {
          const data = JSON.parse(buffer) as {
            questionId?: string;
            answer?: string;
          };
          if (data.questionId && data.answer) {
            const idx = updatedQuestions.findIndex(
              (q) => q.id === data.questionId,
            );
            if (idx >= 0) {
              updatedQuestions[idx] = {
                ...updatedQuestions[idx],
                answer: data.answer,
              };
            }
          }
        } catch {
          // 忽略残留解析失败
        }
      }
      // 持久化最终结果
      const updatedPlan = { ...plan, questions: updatedQuestions, updatedAt: nowISO() };
      await setItem(KEY_PREFIXES.PLAN + plan.id, updatedPlan);
      await savePlanSummary(updatedPlan);
      setPlan(updatedPlan);
      const doneCount = missingQuestions.filter(
        (mq) => updatedQuestions.find((u) => u.id === mq.id)?.answer,
      ).length;
      setAITaskContent(
        aiTaskId,
        `答案生成完成（${doneCount}/${missingQuestions.length}）`,
      );
      completeAITask(aiTaskId);
      toast.success("答案生成完成");
    } catch (err) {
      toast.error("生成失败：" + (err instanceof Error ? err.message : String(err)));
      errorAITask(aiTaskId, err instanceof Error ? err.message : String(err));
    } finally {
      setGeneratingAnswers(false);
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

  const scheduleByDay: Record<number, { item: ScheduleItem; index: number }[]> = {};
  plan.schedule.forEach((item, index) => {
    if (!scheduleByDay[item.day]) scheduleByDay[item.day] = [];
    scheduleByDay[item.day].push({ item, index });
  });
  const days = Object.keys(scheduleByDay).map(Number).sort((a, b) => a - b);

  // 筛选后的题目
  const filteredQuestions = plan.questions.filter((q) => {
    if (filterBigTech === "big" && !q.bigTech) return false;
    if (filterBigTech === "normal" && q.bigTech) return false;
    if (filterDifficulty !== "all") {
      const node = plan.knowledgeTree.find((n) => n.id === q.nodeId);
      if (node?.difficulty !== filterDifficulty) return false;
    }
    if (filterNodeId !== "all" && q.nodeId !== filterNodeId) return false;
    if (searchQuery.trim()) {
      const q_lower = searchQuery.toLowerCase();
      if (
        !q.question.toLowerCase().includes(q_lower) &&
        !q.answer.toLowerCase().includes(q_lower)
      )
        return false;
    }
    return true;
  });

  return (
    <div className="min-h-screen p-4 max-w-3xl mx-auto pb-20">
      <div className="mb-6">
        <button
          onClick={() => router.push("/learn")}
          className="text-sm text-gray-400 mb-2"
        >
          ← 返回
        </button>
        <div className="flex flex-col gap-3">
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold break-words">{plan.topic}</h1>
            <p className="text-sm text-gray-500 mt-1">
              {plan.knowledgeTree.length} 个知识点 · {plan.questions.length} 道题 ·{" "}
              {days.length} 天计划
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={openRegenModal}
              className="px-3 py-1.5 text-xs bg-black text-white rounded-lg font-medium hover:bg-gray-800 transition-colors"
              title="重新编辑提示词与计划参数，AI 重新生成"
            >
              <Icon name="refresh-cw" className="w-4 h-4 inline-block align-middle" /> 重新生成
            </button>
            <Link
              href={`/learn/${plan.id}/edit`}
              className="px-3 py-1.5 text-xs border rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
              title="编辑作息、优先级与题目范围"
            >
              <Icon name="pen" className="w-4 h-4 inline-block align-middle" /> 调整计划
            </Link>
            {fullscreen.supported && (
              <button
                onClick={async () => {
                  const ok = await fullscreen.enterFullscreen();
                  if (ok) {
                    toast.info("已进入全屏专注，按 Esc 退出");
                  } else {
                    toast.warning("当前浏览器不支持全屏");
                  }
                }}
                className="px-3 py-1.5 text-xs border rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
                title="进入全屏专注模式（默认竖屏）"
              >
                <Icon name="monitor" className="w-4 h-4 inline-block align-middle" /> 全屏
              </button>
            )}
          </div>
        </div>
        <button
          onClick={handleDeckFavorite}
          className="mt-3 px-4 py-2 bg-yellow-100 text-yellow-700 rounded-lg text-sm font-medium hover:bg-yellow-200"
        >
          {deckFavorited ? <><Icon name="star" className="w-3.5 h-3.5 inline-block" /> 已收藏（点击取消）</> : <><Icon name="star" className="w-3.5 h-3.5 inline-block" /> 收藏这份试题</>}
        </button>
      </div>

      <div className="mb-6">
        <KnowledgeTree
          nodes={plan.knowledgeTree}
          onSelectNode={handleKnowledgeNodeSelect}
          selectedNodeId={filterNodeId !== "all" ? filterNodeId : undefined}
        />
      </div>

      <div className="mb-6" ref={questionsSectionRef}>
        <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
          <h2 className="text-lg font-bold">面试题（{filteredQuestions.length}/{plan.questions.length}）</h2>
          {plan.questions.some((q) => !q.answer) && (
            <button
              onClick={handleContinueGenerate}
              disabled={generatingAnswers}
              className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center gap-1"
              title="对未生成答案的题目批量调用 AI 生成"
            >
              {generatingAnswers ? (
                <>
                  <span className="inline-block w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  生成中...
                </>
              ) : (
                <>
                  <Icon name="refresh-cw" className="w-3.5 h-3.5 inline-block" />
                  继续生成答案（{plan.questions.filter((q) => !q.answer).length} 题缺失）
                </>
              )}
            </button>
          )}
        </div>
        <div className="mb-3 p-3 bg-gray-50 rounded-lg space-y-2">
          {/* Row 1: bigTech + difficulty */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-gray-500">大厂:</span>
            {(["all", "big", "normal"] as const).map((v) => (
              <button
                key={v}
                onClick={() => setFilterBigTech(v)}
                className={`text-xs px-2 py-0.5 rounded ${
                  filterBigTech === v
                    ? "bg-black text-white"
                    : "bg-white text-gray-600 border"
                }`}
              >
                {v === "all" ? "全部" : v === "big" ? <><Icon name="building" className="w-3 h-3 inline-block" /> 大厂</> : "普通"}
              </button>
            ))}
            <span className="text-xs text-gray-500 ml-2">难度:</span>
            <button
              onClick={() => setFilterDifficulty("all")}
              className={`text-xs px-2 py-0.5 rounded ${
                filterDifficulty === "all"
                  ? "bg-black text-white"
                  : "bg-white border"
              }`}
            >
              全部
            </button>
            {[1, 2, 3, 4, 5].map((d) => (
              <button
                key={d}
                onClick={() => setFilterDifficulty(d)}
                className={`text-xs px-2 py-0.5 rounded ${
                  filterDifficulty === d
                    ? "bg-black text-white"
                    : "bg-white border"
                }`}
              >
                {d}
              </button>
            ))}
          </div>
          {/* Row 2: node filter + search */}
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={filterNodeId}
              onChange={(e) => setFilterNodeId(e.target.value)}
              className="text-xs border rounded px-2 py-1 bg-white"
            >
              <option value="all">全部知识点</option>
              {plan.knowledgeTree.map((n) => (
                <option key={n.id} value={n.id}>
                  {n.title}
                </option>
              ))}
            </select>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="搜索题目..."
              className="text-xs border rounded px-2 py-1 flex-1 min-w-[120px]"
            />
            {(filterBigTech !== "all" ||
              filterDifficulty !== "all" ||
              filterNodeId !== "all" ||
              searchQuery) && (
              <button
                onClick={() => {
                  setFilterBigTech("all");
                  setFilterDifficulty("all");
                  setFilterNodeId("all");
                  setSearchQuery("");
                }}
                className="text-xs text-gray-400 hover:text-red-500"
              >
                清除筛选
              </button>
            )}
          </div>
          {/* Result count */}
          <p className="text-xs text-gray-400">
            显示 {filteredQuestions.length} / {plan.questions.length} 题
          </p>
        </div>
        {regenError && (
          <div className="mb-2 rounded bg-red-50 px-3 py-2 text-sm text-red-600">
            重新生成失败：{regenError}
          </div>
        )}
        <p className="text-xs text-gray-400 mb-2">点击题目展开答案，可单题收藏或重新生成</p>
        <div className="space-y-2">
          {filteredQuestions.map((q) => (
            <div key={q.id} ref={(el) => { questionRefs.current[q.id] = el; }}>
              <QuestionCard
                question={q}
                planId={plan.id}
                onFavoriteToggle={handleQuestionFavorite}
                onRegenerate={handleRegenerate}
                regenerating={regeneratingId === q.id}
              />
            </div>
          ))}
        </div>
      </div>

      <div className="mb-6">
        <h2 className="text-lg font-bold mb-3">学习计划</h2>
        <p className="text-xs text-gray-400 mb-2">点击任务标记完成/取消，点击标题跳转到对应题目</p>
        <div className="space-y-2">
          {days.map((day) => {
            const dayItems = scheduleByDay[day];
            const completedCount = dayItems.filter((d) => d.item.completed).length;
            return (
              <div key={day} className="border rounded-lg p-3">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm font-medium">第 {day} 天</p>
                  <span className="text-xs text-gray-400">{completedCount}/{dayItems.length} 完成</span>
                </div>
                <div className="space-y-1">
                  {dayItems.map(({ item, index }) => {
                    const nodeTitle = plan.knowledgeTree.find((n) => n.id === item.nodeId)?.title || item.nodeId;
                    return (
                      <div
                        key={index}
                        className={`flex items-center gap-2 text-xs p-1.5 rounded cursor-pointer hover:bg-gray-50 transition-colors ${
                          item.completed ? "opacity-50" : ""
                        }`}
                        onClick={() => handleScheduleClick(index)}
                      >
                        <span
                          className={`px-2 py-0.5 rounded select-none ${
                            item.type === "learn"
                              ? "bg-blue-100 text-blue-700"
                              : "bg-green-100 text-green-700"
                          }`}
                        >
                          {item.type === "learn" ? "学" : "复"}
                        </span>
                        <span
                          className="text-gray-600 flex-1 hover:text-blue-600 hover:underline"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleScheduleScroll(item.nodeId);
                          }}
                        >
                          {nodeTitle}
                        </span>
                        {item.completed && <span className="text-green-500"><Icon name="check" className="w-3.5 h-3.5 inline-block" /></span>}
                        <span className="text-gray-400">{item.estimatedMinutes}min</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 重新生成弹窗 */}
      {showRegenModal && (
        <div
          className="fixed inset-0 z-[70] bg-black/40 flex items-center justify-center p-4"
          onClick={() => !regeneratingPlan && setShowRegenModal(false)}
        >
          <div
            className="bg-white rounded-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold"><Icon name="refresh-cw" className="w-4 h-4 inline-block align-middle" /> 重新生成计划</h2>
                <button
                  onClick={() => !regeneratingPlan && setShowRegenModal(false)}
                  className="text-gray-400 hover:bg-gray-100 rounded-full w-8 h-8 flex items-center justify-center"
                  aria-label="关闭"
                >
                  <Icon name="x" className="w-4 h-4 inline-block" />
                </button>
              </div>
              <p className="text-xs text-gray-500 mb-4">
                修改下方参数后点击生成，AI 将重新拆解知识树并生成面试题，当前计划内容会被替换。
              </p>

              <div className="space-y-4">
                <div>
                  <label className="text-sm text-gray-600 block mb-1">学习主题</label>
                  <input
                    type="text"
                    value={regenTopic}
                    onChange={(e) => setRegenTopic(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={regeneratingPlan}
                  />
                </div>

                <div className="flex gap-3">
                  <label className="flex-1">
                    <span className="text-sm text-gray-600 block mb-1">每日学习时间（分钟）</span>
                    <input
                      type="number"
                      value={regenDailyMinutes}
                      onChange={(e) => setRegenDailyMinutes(Number(e.target.value))}
                      min={15}
                      max={120}
                      className="w-full px-3 py-2 border rounded-lg text-sm"
                      disabled={regeneratingPlan}
                    />
                  </label>
                  <label className="flex-1">
                    <span className="text-sm text-gray-600 block mb-1">每日新内容数</span>
                    <input
                      type="number"
                      value={regenMaxNew}
                      onChange={(e) => setRegenMaxNew(Number(e.target.value))}
                      min={1}
                      max={5}
                      className="w-full px-3 py-2 border rounded-lg text-sm"
                      disabled={regeneratingPlan}
                    />
                  </label>
                </div>

                <div>
                  <label className="text-sm text-gray-600 block mb-1">
                    自定义提示词（可选）
                  </label>
                  <textarea
                    value={regenPrompt}
                    onChange={(e) => setRegenPrompt(e.target.value)}
                    placeholder="例如：请以大厂面试官视角拆解，重点考察高并发场景和源码原理"
                    rows={4}
                    maxLength={2000}
                    className="w-full px-3 py-2 border rounded-lg text-sm resize-y focus:outline-none focus:ring-2 focus:ring-amber-400"
                    disabled={regeneratingPlan}
                  />
                  {regenPrompt.trim() && (
                    <p className="text-[11px] text-gray-400 mt-1">
                      {regenPrompt.length}/2000 字
                    </p>
                  )}
                </div>

                {regenPlanError && (
                  <div className="rounded bg-red-50 px-3 py-2 text-sm text-red-600">
                    {regenPlanError}
                  </div>
                )}

                <div className="flex items-center gap-2 pt-2">
                  <button
                    onClick={handleRegenPlan}
                    disabled={regeneratingPlan || !regenTopic.trim()}
                    className="flex-1 py-2.5 bg-black text-white rounded-lg font-medium text-sm disabled:opacity-50 hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
                  >
                    {regeneratingPlan ? (
                      <>
                        <span className="inline-block w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        AI 生成中...
                      </>
                    ) : (
                      <><Icon name="refresh-cw" className="w-4 h-4 inline-block align-middle" /> 重新生成</>
                    )}
                  </button>
                  <button
                    onClick={() => setShowRegenModal(false)}
                    disabled={regeneratingPlan}
                    className="px-4 py-2.5 text-sm text-gray-500 border rounded-lg hover:bg-gray-50 disabled:opacity-50"
                  >
                    取消
                  </button>
                </div>
                <p className="text-[11px] text-gray-400 text-center">
                  预计 30-90 秒，生成期间请勿关闭页面
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
