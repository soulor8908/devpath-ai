"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import { getItem, setItem } from "@/lib/storage/db";
import { aiFetch } from "@/lib/api-client";
import { KEY_PREFIXES } from "@/lib/types";
import type { LearningPlan, Question, ScheduleItem, KnowledgeNode } from "@/lib/types";
import { KnowledgeTree } from "@/components/KnowledgeTree";
import { MindMap } from "@/components/MindMap";
import { QuestionCard } from "@/components/QuestionCard";
import { RelatedKnowledge } from "@/components/RelatedKnowledge";
import { Icon } from "@/components/Icon";
import { Button, Input, Textarea, Select, Modal } from "@/components/ui";
import { toggleQuestionInPlan, createFavoriteDeck, listFavoriteDecks, deleteFavoriteDeck } from "@/lib/favorite";
import { savePlanSummary } from "@/lib/plan-summary";
import { nowISO } from "@/lib/time";
import { logLearning } from "@/lib/learn-log";
import { createCard, findExistingCard } from "@/lib/fsrs";
import {
  markNodeMastered,
  markNodeNeedsReinforce,
  markQuestionUnderstood,
  markQuestionViewed,
} from "@/lib/node-mastery";
import {
  recordAICall,
  startTimer,
  makeInputDigest,
  makeOutputDigest,
  generateCallId,
} from "@/lib/ai/quality-tracker";
import { toast } from "@/lib/toast";

// 上次查看的题目缓存（按 planId 维度，localStorage 存储）
// 用户点开过任一面试题后写入；下次进入该 plan 不再弹脑图，直接滚动到这题
// key 形如 "learn:lastViewedQ:<planId>"，value 为 questionId
const LAST_VIEWED_Q_PREFIX = "learn:lastViewedQ:";
function getLastViewedQuestion(planId: string): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(LAST_VIEWED_Q_PREFIX + planId);
  } catch {
    return null;
  }
}
function setLastViewedQuestion(planId: string, questionId: string): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(LAST_VIEWED_Q_PREFIX + planId, questionId);
  } catch {
    // 隐私模式或配额满，静默忽略
  }
}
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

  // 需求 5：脑图入口弹窗 + 悬浮脑图按钮
  // showMindMapModal: 显示全屏脑图弹窗（首次进入自动弹出，可被悬浮按钮重新打开）
  // showMindMapFloat: 显示悬浮脑图小图标（弹窗关闭后变为可见，点击重新打开弹窗）
  // 脑图组件已封装为可复用的 MindMap，本页通过 onSelectNode 回调将节点点击映射到 filterNodeId
  const [showMindMapModal, setShowMindMapModal] = useState(false);
  const [showMindMapFloat, setShowMindMapFloat] = useState(false);

  // 知识树 / 学习计划外层区块默认折叠（用户主动展开查看）
  // 折叠按钮带 aria-expanded + aria-controls（遵循 AGENTS.md 2.5）
  const [knowledgeTreeCollapsed, setKnowledgeTreeCollapsed] = useState(true);
  const [scheduleCollapsed, setScheduleCollapsed] = useState(true);

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
        return;
      }

      // 上次查看的题目缓存：用户点开过任一面试题后写入 localStorage，
      // 下次进入该 plan 不再弹脑图，直接滚动到上次查看的题目（续学场景）
      const lastViewedQid = getLastViewedQuestion(p.id);
      const lastViewedQ = lastViewedQid
        ? p.questions.find((q) => q.id === lastViewedQid)
        : null;
      if (lastViewedQ) {
        // 自动筛选到该题所属知识点（让用户看到上下文），再滚动到该题
        setFilterNodeId(lastViewedQ.nodeId);
        setShowMindMapFloat(true); // 不弹脑图，但保留悬浮入口
        setTimeout(() => {
          questionRefs.current[lastViewedQ.id]?.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });
        }, 150);
      } else {
        // 首次进入（无 ?node= 参数 + 无上次查看记录）→ 自动弹出脑图入口弹窗
        // 让用户鸟瞰整个知识树，主动选择今天从哪个知识点开始
        setShowMindMapModal(true);
      }
    })();
  // router/searchParams 引用稳定（App Router），不作为 effect 依赖避免重渲染
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [planId]);

  // 需求 5：脑图节点点击 → 过滤该节点题目 + 关闭弹窗 + 显示悬浮图标 + 滚动到题目区
  function handleMindMapNodeSelect(node: KnowledgeNode) {
    setFilterNodeId(node.id);
    setShowMindMapModal(false);
    setShowMindMapFloat(true);
    setTimeout(() => {
      const q = plan?.questions.find((x) => x.nodeId === node.id);
      if (q && questionRefs.current[q.id]) {
        questionRefs.current[q.id]?.scrollIntoView({ behavior: "smooth", block: "center" });
      } else {
        questionsSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 100);
  }

  // 需求 5：脑图弹窗底部「直接进入」按钮 → 不过滤 + 关闭弹窗 + 显示悬浮图标
  function handleMindMapDirectEnter() {
    setFilterNodeId("all");
    setShowMindMapModal(false);
    setShowMindMapFloat(true);
  }

  // 需求 5：脑图弹窗「关闭按钮 / 遮罩点击 / ESC」→ 关闭弹窗 + 显示悬浮图标（保留当前 filter 不变）
  // 与「直接进入」的区别：直接进入显式重置 filter，dismiss 保留 filter（用户可能已从 URL ?node= 带 filter 进来）
  // 注：ESC + body scroll lock + 焦点陷阱已由统一 <Modal> 组件内置，无需手写
  function handleMindMapDismiss() {
    setShowMindMapModal(false);
    setShowMindMapFloat(true);
  }

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

  // 学习反馈闭环：用户标记题目"看懂了 / 再想想"
  // 增强项（需求 5）：标记"看懂"后，检查所属知识点下的题目是否全部 understood，
  // 若是且该节点尚未 mastered → 自动调用 markNodeMastered(plan, nodeId, true)
  // 让"看完所有题"自然推导出"掌握该知识点"，无需用户再手动标记
  async function handleMarkUnderstood(questionId: string, understood: boolean) {
    if (!plan) return;
    try {
      const updated = await markQuestionUnderstood(plan, questionId, understood);
      setPlan(updated);

      // 仅在「标记看懂」时检查自动掌握（取消看懂不触发）
      if (understood) {
        const targetQ = updated.questions.find((q) => q.id === questionId);
        if (targetQ) {
          const nodeQuestions = updated.questions.filter(
            (q) => q.nodeId === targetQ.nodeId,
          );
          const node = updated.knowledgeTree.find(
            (n) => n.id === targetQ.nodeId,
          );
          // 该节点至少有 1 道题，且全部 understood，且节点尚未被显式 mastered
          if (
            node &&
            !node.mastered &&
            nodeQuestions.length > 0 &&
            nodeQuestions.every((q) => q.understood)
          ) {
            const masteredPlan = await markNodeMastered(
              updated,
              node.id,
              true,
            );
            setPlan(masteredPlan);
            toast.success(
              `「${node.title}」下题目全部看懂，已自动标记为「已掌握」`,
            );
            return;
          }
        }
      }
      toast.success(understood ? "已记录「看懂了」" : "已取消「看懂了」标记");
    } catch (e) {
      toast.error("标记失败：" + (e instanceof Error ? e.message : String(e)));
    }
  }

  // 学习反馈闭环：用户首次展开答案 → 隐式记录 viewed + 缓存到 localStorage
  // 缓存的 questionId 用于下次进入该 plan 时直接滚动到这题（不弹脑图）
  async function handleQuestionViewed(questionId: string) {
    if (!plan) return;
    try {
      const updated = await markQuestionViewed(plan, questionId);
      setPlan(updated);
      // 持久化上次查看的题目 id（按 planId 维度）
      setLastViewedQuestion(plan.id, questionId);
    } catch {
      // 静默失败（隐式反馈不应阻塞用户阅读答案）
    }
  }

  // 学习反馈闭环：用户标记知识点"已掌握"
  async function handleMarkNodeMastered(
    node: { id: string },
    mastered: boolean
  ) {
    if (!plan) return;
    try {
      const updated = await markNodeMastered(plan, node.id, mastered);
      setPlan(updated);
      toast.success(mastered ? "已标记为「已掌握」" : "已取消「已掌握」标记");
    } catch (e) {
      toast.error("标记失败：" + (e instanceof Error ? e.message : String(e)));
    }
  }

  // 学习反馈闭环：用户标记知识点"需要加强"
  async function handleMarkNodeNeedsReinforce(
    node: { id: string },
    needsReinforce: boolean
  ) {
    if (!plan) return;
    try {
      const updated = await markNodeNeedsReinforce(plan, node.id, needsReinforce);
      setPlan(updated);
      toast.success(
        needsReinforce ? "已标记为「需要加强」" : "已取消「需要加强」标记"
      );
    } catch (e) {
      toast.error("标记失败：" + (e instanceof Error ? e.message : String(e)));
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

  // 当前选中的知识点节点（用于「相关知识」面板）
  // 仅在用户从知识树/脑图选中某个节点时存在，未选（filterNodeId==="all"）时为 null
  const selectedNodeForRelated =
    filterNodeId !== "all"
      ? plan.knowledgeTree.find((n) => n.id === filterNodeId) ?? null
      : null;

  return (
    <div className="min-h-screen p-4 max-w-3xl mx-auto pb-20">
      <div className="mb-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push("/learn")}
          className="mb-2"
        >
          ← 返回
        </Button>
        <div className="flex flex-col gap-3">
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold break-words">{plan.topic}</h1>
            <p className="text-sm text-gray-500 mt-1">
              {plan.knowledgeTree.length} 个知识点 · {plan.questions.length} 道题 ·{" "}
              {days.length} 天计划
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="dark"
              size="sm"
              onClick={openRegenModal}
              title="重新编辑提示词与计划参数，AI 重新生成"
            >
              <Icon name="refresh-cw" className="w-4 h-4 inline-block align-middle" /> 重新生成
            </Button>
            <Link
              href={`/learn/${plan.id}/edit`}
              className="px-3 py-1.5 text-xs border rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
              title="编辑作息、优先级与题目范围"
            >
              <Icon name="pen" className="w-4 h-4 inline-block align-middle" /> 调整计划
            </Link>
          </div>
        </div>
        <Button
          variant="outline"
          onClick={handleDeckFavorite}
          className="mt-3"
        >
          {deckFavorited ? <><Icon name="star" className="w-3.5 h-3.5 inline-block" /> 已收藏（点击取消）</> : <><Icon name="star" className="w-3.5 h-3.5 inline-block" /> 收藏这份试题</>}
        </Button>
      </div>

      <div className="mb-6">
        <Button
          variant="ghost"
          size="sm"
          aria-expanded={!knowledgeTreeCollapsed}
          aria-controls="knowledge-tree-panel"
          onClick={() => setKnowledgeTreeCollapsed((v) => !v)}
          className="w-full justify-between mb-2"
        >
          <span className="flex items-center gap-1.5 font-bold text-base text-gray-800 dark:text-gray-100">
            <Icon
              name={knowledgeTreeCollapsed ? "chevron-right" : "chevron-down"}
              className="w-4 h-4"
            />
            知识树（{plan.knowledgeTree.length}）
          </span>
          <span className="text-2xs text-gray-400 dark:text-gray-500">
            {knowledgeTreeCollapsed ? "展开" : "收起"}
          </span>
        </Button>
        {!knowledgeTreeCollapsed && (
          <div id="knowledge-tree-panel">
            <KnowledgeTree
              nodes={plan.knowledgeTree}
              onSelectNode={handleKnowledgeNodeSelect}
              selectedNodeId={filterNodeId !== "all" ? filterNodeId : undefined}
              onMarkMastered={handleMarkNodeMastered}
              onMarkNeedsReinforce={handleMarkNodeNeedsReinforce}
            />
          </div>
        )}
      </div>

      {/* 相关知识（v1 知识检索扩展1）：选中某个知识点节点后，
          基于该节点语义检索知识库中的相关知识，点击进入学习详情 */}
      {selectedNodeForRelated && (
        <RelatedKnowledge node={selectedNodeForRelated} />
      )}

      <div className="mb-6" ref={questionsSectionRef}>
        <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
          <h2 className="text-lg font-bold">面试题（{filteredQuestions.length}/{plan.questions.length}）</h2>
          {plan.questions.some((q) => !q.answer) && (
            <Button
              variant="primary"
              onClick={handleContinueGenerate}
              disabled={generatingAnswers}
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
            </Button>
          )}
        </div>
        <div className="mb-3 p-3 bg-gray-50 rounded-lg space-y-2">
          {/* Row 1: bigTech + difficulty */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-gray-500">大厂:</span>
            {(["all", "big", "normal"] as const).map((v) => (
              <Button
                key={v}
                variant={filterBigTech === v ? "primary" : "ghost"}
                size="sm"
                onClick={() => setFilterBigTech(v)}
              >
                {v === "all" ? "全部" : v === "big" ? <><Icon name="building" className="w-3 h-3 inline-block" /> 大厂</> : "普通"}
              </Button>
            ))}
            <span className="text-xs text-gray-500 ml-2">难度:</span>
            <Button
              variant={filterDifficulty === "all" ? "primary" : "ghost"}
              size="sm"
              onClick={() => setFilterDifficulty("all")}
            >
              全部
            </Button>
            {[1, 2, 3, 4, 5].map((d) => (
              <Button
                key={d}
                variant={filterDifficulty === d ? "primary" : "ghost"}
                size="sm"
                onClick={() => setFilterDifficulty(d)}
              >
                {d}
              </Button>
            ))}
          </div>
          {/* Row 2: node filter + search */}
          <div className="flex flex-wrap items-center gap-2">
            <Select
              value={filterNodeId}
              onChange={(e) => setFilterNodeId(e.target.value)}
              inputSize="sm"
              className="min-w-[140px]"
            >
              <option value="all">全部知识点</option>
              {plan.knowledgeTree.map((n) => (
                <option key={n.id} value={n.id}>
                  {n.title}
                </option>
              ))}
            </Select>
            {/* 上一个 / 下一个 知识点快速切换：仅当 Select 选了具体知识点时显示，
                按知识树顺序前后切换 filterNodeId 并滚动到题目区 */}
            {filterNodeId !== "all" && (
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const idx = plan.knowledgeTree.findIndex(
                      (n) => n.id === filterNodeId,
                    );
                    if (idx > 0) {
                      const prev = plan.knowledgeTree[idx - 1];
                      setFilterNodeId(prev.id);
                      setTimeout(() => {
                        const q = plan.questions.find(
                          (x) => x.nodeId === prev.id,
                        );
                        if (q && questionRefs.current[q.id]) {
                          questionRefs.current[q.id]?.scrollIntoView({
                            behavior: "smooth",
                            block: "center",
                          });
                        } else {
                          questionsSectionRef.current?.scrollIntoView({
                            behavior: "smooth",
                            block: "start",
                          });
                        }
                      }, 50);
                    }
                  }}
                  disabled={
                    plan.knowledgeTree.findIndex(
                      (n) => n.id === filterNodeId,
                    ) <= 0
                  }
                  title="上一个知识点"
                  aria-label="上一个知识点"
                >
                  <Icon name="chevron-left" className="w-3.5 h-3.5" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const idx = plan.knowledgeTree.findIndex(
                      (n) => n.id === filterNodeId,
                    );
                    if (idx >= 0 && idx < plan.knowledgeTree.length - 1) {
                      const next = plan.knowledgeTree[idx + 1];
                      setFilterNodeId(next.id);
                      setTimeout(() => {
                        const q = plan.questions.find(
                          (x) => x.nodeId === next.id,
                        );
                        if (q && questionRefs.current[q.id]) {
                          questionRefs.current[q.id]?.scrollIntoView({
                            behavior: "smooth",
                            block: "center",
                          });
                        } else {
                          questionsSectionRef.current?.scrollIntoView({
                            behavior: "smooth",
                            block: "start",
                          });
                        }
                      }, 50);
                    }
                  }}
                  disabled={
                    plan.knowledgeTree.findIndex(
                      (n) => n.id === filterNodeId,
                    ) >=
                    plan.knowledgeTree.length - 1
                  }
                  title="下一个知识点"
                  aria-label="下一个知识点"
                >
                  <Icon name="chevron-right" className="w-3.5 h-3.5" />
                </Button>
              </div>
            )}
            <Input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="搜索题目..."
              inputSize="sm"
              className="flex-1 min-w-[120px]"
            />
            {(filterBigTech !== "all" ||
              filterDifficulty !== "all" ||
              filterNodeId !== "all" ||
              searchQuery) && (
              <Button
                variant="link"
                size="sm"
                onClick={() => {
                  setFilterBigTech("all");
                  setFilterDifficulty("all");
                  setFilterNodeId("all");
                  setSearchQuery("");
                }}
              >
                清除筛选
              </Button>
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
                onMarkUnderstood={handleMarkUnderstood}
                onViewed={handleQuestionViewed}
              />
            </div>
          ))}
        </div>
      </div>

      <div className="mb-6">
        <Button
          variant="ghost"
          size="sm"
          aria-expanded={!scheduleCollapsed}
          aria-controls="schedule-panel"
          onClick={() => setScheduleCollapsed((v) => !v)}
          className="w-full justify-between mb-2"
        >
          <span className="flex items-center gap-1.5 font-bold text-base text-gray-800 dark:text-gray-100">
            <Icon
              name={scheduleCollapsed ? "chevron-right" : "chevron-down"}
              className="w-4 h-4"
            />
            学习计划（{days.length} 天）
          </span>
          <span className="text-2xs text-gray-400 dark:text-gray-500">
            {scheduleCollapsed ? "展开" : "收起"}
          </span>
        </Button>
        {!scheduleCollapsed && (
          <div id="schedule-panel">
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
        )}
      </div>

      {/* 重新生成弹窗（用统一 Modal 组件）*/}
      <Modal
        open={showRegenModal}
        onClose={() => !regeneratingPlan && setShowRegenModal(false)}
        size="lg"
        title={
          <span className="flex items-center gap-2">
            <Icon name="refresh-cw" className="w-4 h-4" />
            重新生成计划
          </span>
        }
        description="修改下方参数后点击生成，AI 将重新拆解知识树并生成面试题，当前计划内容会被替换。"
        footer={
          <>
            <Button
              onClick={handleRegenPlan}
              disabled={regeneratingPlan || !regenTopic.trim()}
              loading={regeneratingPlan}
              leftIcon="refresh-cw"
              variant="dark"
              className="flex-1 py-2.5"
            >
              {regeneratingPlan ? "AI 生成中..." : "重新生成"}
            </Button>
            <Button
              onClick={() => setShowRegenModal(false)}
              disabled={regeneratingPlan}
              variant="secondary"
              className="py-2.5"
            >
              取消
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="text-sm text-gray-600 dark:text-gray-300 block mb-1">学习主题</label>
            <Input
              type="text"
              value={regenTopic}
              onChange={(e) => setRegenTopic(e.target.value)}
              disabled={regeneratingPlan}
              placeholder="例如：React Hooks 深入"
            />
          </div>

          <div className="flex gap-3">
            <label className="flex-1">
              <span className="text-sm text-gray-600 dark:text-gray-300 block mb-1">每日学习时间（分钟）</span>
              <Input
                type="number"
                value={regenDailyMinutes}
                onChange={(e) => setRegenDailyMinutes(Number(e.target.value))}
                min={15}
                max={120}
                disabled={regeneratingPlan}
              />
            </label>
            <label className="flex-1">
              <span className="text-sm text-gray-600 dark:text-gray-300 block mb-1">每日新内容数</span>
              <Input
                type="number"
                value={regenMaxNew}
                onChange={(e) => setRegenMaxNew(Number(e.target.value))}
                min={1}
                max={5}
                disabled={regeneratingPlan}
              />
            </label>
          </div>

          <div>
            <label className="text-sm text-gray-600 dark:text-gray-300 block mb-1">
              自定义提示词（可选）
            </label>
            <Textarea
              value={regenPrompt}
              onChange={(e) => setRegenPrompt(e.target.value)}
              placeholder="例如：请以大厂面试官视角拆解，重点考察高并发场景和源码原理"
              rows={4}
              maxLength={2000}
              showCount
              disabled={regeneratingPlan}
            />
          </div>

          {regenPlanError && (
            <div className="rounded bg-red-50 dark:bg-red-950 px-3 py-2 text-sm text-red-600 dark:text-red-400">
              {regenPlanError}
            </div>
          )}

          <p className="text-2xs text-gray-400 dark:text-gray-500 text-center">
            预计 30-90 秒，生成期间请勿关闭页面
          </p>
        </div>
      </Modal>

      {/* ============ 需求 5：脑图入口弹窗（用统一 Modal 组件）============ */}
      {/* 首次进入学习页自动弹出，让用户鸟瞰知识树并选择今日起点。
          点击节点 → 筛选该节点题目；点击「直接进入」→ 查看全部题目。
          关闭后变为右下角悬浮小图标，点击重新展开。
          size="xl" + fillHeight 让脑图画布占满 90vh - header - footer，移动端贴底桌面端居中 */}
      {plan && (
        <Modal
          open={showMindMapModal}
          onClose={handleMindMapDismiss}
          size="xl"
          fillHeight
          title={
            <span className="flex items-center gap-2">
              <Icon name="target" className="w-5 h-5 text-blue-500" />
              知识点脑图
            </span>
          }
          description="点击节点筛选该知识点题目，绿色节点为已掌握"
          contentClassName="p-0"
          footer={
            <Button
              variant="primary"
              onClick={handleMindMapDirectEnter}
              leftIcon="target"
            >
              直接进入（全部题目）
            </Button>
          }
        >
          <MindMap
            nodes={plan.knowledgeTree}
            onSelectNode={handleMindMapNodeSelect}
            selectedNodeId={filterNodeId !== "all" ? filterNodeId : undefined}
            fillHeight
            showEnterButton={false}
            titleClickMode="select"
          />
        </Modal>
      )}

      {/* ============ 需求 5：脑图悬浮小图标 ============ */}
      {/* 弹窗关闭后显示，点击重新展开脑图。
          样式与 FloatingChatButton / PomodoroWidget 统一：56px 圆形 + shadow-floating
          定位：right-4 bottom-32（垂直错开 FloatingChat bottom-20，避开底部 nav）
          层级：z-50（与 FloatingChat 同层，低于 PomodoroWidget z-[80]、Modal z-[60]） */}
      {showMindMapFloat && !showMindMapModal && (
        <Button
          iconOnly
          variant="dark"
          aria-label="打开知识点脑图"
          title="打开知识点脑图"
          onClick={() => setShowMindMapModal(true)}
          className="fixed right-4 bottom-32 z-50 w-14 h-14 rounded-full shadow-floating flex items-center justify-center"
        >
          <Icon name="target" className="w-6 h-6" />
        </Button>
      )}
    </div>
  );
}
