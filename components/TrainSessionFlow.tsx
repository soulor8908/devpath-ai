"use client";

// components/TrainSessionFlow.tsx
// 训练会话流程组件——学→练→反馈→休息 状态机
//
// 测试设计修正（用户反馈：学习材料和测试答案一样，测试失去意义）：
//   - 学习阶段：完整展示答案作为"学习材料"（用户先学习）
//   - 测试阶段：先隐藏答案，强制用户回忆 → 点击"查看答案"才揭示
//     这样测试才有意义——从"对照答案自评"变成"先回忆再对照"
//   - 答案用 AnswerContent 渲染（代码编辑器样式 + 代码高亮）
//   - 答案和题目支持选中文字问 AI
//   - 题目支持收藏（收藏时自动造 FSRS 复习卡）
//
// 2026-07-25 进度持久化：
//   - 用户反馈"训练到第3题跳出去再回来，又要从第1题开始"
//   - 用 sessionStorage 保存进度，同一天内跳转回来自动恢复
//   - 详见 lib/ai/train-scheduler.ts 的 restoreTrainSession / saveTrainSession / clearTrainSession
//   - 恢复时瞬态 phase（feedback/breaking）降级到稳定 phase（questioning/learning），
//     避免恢复出"空反馈"或"卡在休息中"的破损 UI

import { useReducer, useEffect, useState, useCallback, useRef } from "react";
import { getItem, setItem } from "@/lib/storage/db";
import {
  KEY_PREFIXES,
  type LearningPlan,
  type KnowledgeNode,
  type Question,
  type ReviewCard,
} from "@/lib/types";
import type { StudyTask } from "@/lib/study-queue/types";
import {
  createInitialTrainState,
  trainSessionReducer,
  generateSocraticFeedback,
  FOCUS_THRESHOLD_MINUTES,
  restoreTrainSession,
  saveTrainSession,
  clearTrainSession,
  type TrainSessionState,
  type TrainSessionExtras,
} from "@/lib/ai/train-scheduler";
import { KnowledgeBrief } from "@/components/KnowledgeBrief";
import { SocraticFeedback } from "@/components/SocraticFeedback";
import { AnswerContent } from "@/components/CodeBlock";
import { Icon } from "@/components/Icon";
import { Button } from "@/components/ui";
import { openChatModal } from "@/lib/chat-modal-store";
import { createCard, findExistingCard } from "@/lib/fsrs";
import { toggleQuestionInPlan } from "@/lib/favorite";
import { trackAIFeedback } from "@/lib/ai/quality-tracker";
import { toast } from "@/lib/toast";
import { markQuestionUnderstoodAndMaybeMasterNode } from "@/lib/node-mastery";

interface TrainSessionFlowProps {
  studyQueue: StudyTask[];
  onSessionComplete: () => void;
  /**
   * 进度回调：每当 currentIndex / questionsAnswered / questionsCorrect 变化时触发。
   * 父组件（TrainClient）据此更新顶部进度条，避免硬编码 "1/total"。
   */
  onProgressChange?: (progress: {
    currentIndex: number;
    total: number;
    questionsAnswered: number;
    questionsCorrect: number;
    phase: string;
  }) => void;
}

export function TrainSessionFlow({ studyQueue, onSessionComplete, onProgressChange }: TrainSessionFlowProps) {
  // 恢复持久化的训练会话（只调用一次，避免 StrictMode 双调用重复读 sessionStorage）
  // useRef + lazy 模式：第一次访问时计算，之后复用
  // useMemo 不行——StrictMode 会重复调用，可能导致重复消费
  const restoredRef = useRef<
    { state: TrainSessionState; extras: TrainSessionExtras } | null | undefined
  >(undefined);
  if (restoredRef.current === undefined) {
    restoredRef.current = restoreTrainSession(studyQueue.length);
  }
  const restored = restoredRef.current;

  const [state, dispatch] = useReducer(
    trainSessionReducer,
    studyQueue.length,
    // lazy initializer：有持久化数据则恢复，否则用默认初始状态
    () => restored?.state ?? createInitialTrainState(),
  );
  const [currentNode, setCurrentNode] = useState<KnowledgeNode | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [currentPlan, setCurrentPlan] = useState<LearningPlan | null>(null);
  const [feedback, setFeedback] = useState("");
  const [isCorrect, setIsCorrect] = useState(false);
  const [loading, setLoading] = useState(true);
  // 测试阶段答案是否已揭示（默认隐藏，强制用户先回忆）
  // 2026-07-25 持久化：恢复时从 sessionStorage 读出（用户已看过答案就直接展示）
  const [answerRevealed, setAnswerRevealed] = useState(restored?.extras.answerRevealed ?? false);

  const currentTask = studyQueue[state.currentIndex];

  // 跟踪已加载过的任务 id，避免在同一任务上因 phase 切换重复 fetch
  // 2026-07-25 持久化恢复场景：用户可能直接落在 questioning phase（跳过 learning），
  // 此时 currentNode/currentQuestion 尚未加载，需要触发 loadCurrentTask。
  // 但 learning → questioning 的正常流程中不应重复加载（数据已就绪）。
  const loadedTaskIdRef = useRef<string | null>(null);

  // 专注时间计时——每分钟 +1 focusMinutes，达到阈值触发休息
  useEffect(() => {
    const timer = setInterval(() => {
      dispatch({ type: "FOCUS_TICK" });
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  // 加载当前任务的知识点和题目
  // 2026-07-25 修改：移除 setAnswerRevealed(false) —— answerRevealed 的重置
  // 由 LEARN_COMPLETE / NEXT_TASK 的 dispatch 处负责，避免恢复时被错误清空
  //
  // 2026-07-27 重构：学习队列改成题目维度，StudyTask 现在带 questionId
  //   - 旧设计：一节点一 task，loadCurrentTask 运行时从节点下挑一道 !understood 的题
  //   - 新设计：一题一 task，task.questionId 直接指定要做的题，不需要运行时挑选
  //   - 好处：已 understood 的题不会进队列（buildStudyQueueFromData 已过滤），
  //     训练中不会再出现已答对的题
  //   - 兜底：若 task 无 questionId（旧数据兼容）或 questionId 找不到，回退到节点下首道题
  const loadCurrentTask = useCallback(async () => {
    if (!currentTask) {
      dispatch({ type: "SESSION_COMPLETE" });
      return;
    }
    setLoading(true);
    try {
      if (currentTask.type === "new" && currentTask.planId) {
        // 加载计划中的知识点
        const plan = await getItem<LearningPlan>(KEY_PREFIXES.PLAN + currentTask.planId);
        if (plan) {
          const node = plan.knowledgeTree.find((n) => n.id === currentTask.nodeId) || plan.knowledgeTree[0];
          // 2026-07-27：优先用 task.questionId 直接定位题目（题目维度队列）
          // 兜底：无 questionId 或找不到时，回退到节点下首道题（向后兼容旧节点维度队列）
          const question = currentTask.questionId
            ? plan.questions.find((q) => q.id === currentTask.questionId) ?? null
            : plan.questions.find((q) => q.nodeId === node?.id && !q.understood) ||
              plan.questions.find((q) => q.nodeId === node?.id) ||
              null;
          setCurrentNode(node ?? null);
          setCurrentQuestion(question);
          setCurrentPlan(plan);
        }
      } else if (currentTask.type === "review" && currentTask.cardId) {
        // 复习卡片：从 ReviewCard 加载
        const card = await getItem<ReviewCard>(KEY_PREFIXES.CARD + currentTask.cardId);
        if (card) {
          setCurrentNode({
            id: card.id,
            title: "复习卡片",
            summary: card.front,
            difficulty: 3,
            prerequisites: [],
            frequency: "中",
            mastery: 0,
          });
          setCurrentQuestion(null);
          setCurrentPlan(null);
        }
      }
    } finally {
      setLoading(false);
    }
  }, [currentTask]);

  // 任务加载触发条件：
  // - currentTask 变化（NEXT_TASK 后切到新任务）
  // - 恢复时落在 questioning phase（currentNode/currentQuestion 尚未加载）
  // 用 loadedTaskIdRef 去重：同一任务不重复加载，避免 learning → questioning 时的无谓 fetch
  useEffect(() => {
    if (!currentTask) {
      // 队列耗尽或索引越界（恢复数据与当前队列不匹配）→ 结束会话
      dispatch({ type: "SESSION_COMPLETE" });
      return;
    }
    if (loadedTaskIdRef.current === currentTask.id) return;
    loadedTaskIdRef.current = currentTask.id;
    void loadCurrentTask();
  }, [currentTask, loadCurrentTask]);

  // 持久化训练进度到 sessionStorage（2026-07-25 新增）
  // - 每次 state / answerRevealed 变化都写入
  // - phase === "completed" 时不写入（saveTrainSession 内部已处理）
  // - 完成时清除持久化数据，避免下次进入训练页错误恢复
  useEffect(() => {
    saveTrainSession(state, { answerRevealed }, studyQueue.length);
  }, [state, answerRevealed, studyQueue.length]);

  useEffect(() => {
    if (state.phase === "completed") {
      clearTrainSession();
    }
  }, [state.phase]);

  // 恢复进度提示（2026-07-25 交互闭环）
  // 用户从其他页面跳回训练页时，如果恢复了之前的进度，给一个明确提示，
  // 让用户知道"系统记得我刚才做到哪了"，而不是默默跳到第 N 题让用户困惑。
  // 仅在恢复到非第 0 题时提示（第 0 题是默认起始位置，无需提示）。
  useEffect(() => {
    if (!restored) return;
    if (restored.state.currentIndex > 0) {
      toast.info(`已恢复到第 ${restored.state.currentIndex + 1} 题`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 选中文字问 AI（题目/答案通用回调）
  const handleAskAI = useCallback((selectedText: string, sourceLabel: string) => {
    openChatModal({
      prefill: `关于「${sourceLabel}」的问题片段：\n\n> ${selectedText}\n\n请帮我深入理解这段内容。`,
      source: currentQuestion
        ? {
            type: "question",
            id: currentQuestion.id,
            title: currentQuestion.question,
            planId: currentPlan?.id,
          }
        : undefined,
    });
  }, [currentQuestion, currentPlan]);

  // 收藏当前题目（收藏时自动造 FSRS 复习卡，与 QuestionCard 逻辑一致）
  const handleFavorite = useCallback(async () => {
    if (!currentQuestion || !currentPlan) return;
    const wasFavorited = currentQuestion.favorited;
    // 先更新 plan 中的 question.favorited
    const updatedPlan = toggleQuestionInPlan(currentPlan, currentQuestion.id);
    setCurrentPlan(updatedPlan);
    const updatedQ = updatedPlan.questions.find((q) => q.id === currentQuestion.id) ?? null;
    setCurrentQuestion(updatedQ);
    try {
      await setItem(KEY_PREFIXES.PLAN + updatedPlan.id, updatedPlan);
    } catch {
      // 持久化失败不影响 UI
    }
    if (!wasFavorited) {
      // 隐式反馈：仅当题目有 aiCallId 时记录（老题目静默跳过）
      if (currentQuestion.aiCallId) {
        void trackAIFeedback({
          callRecordId: currentQuestion.aiCallId,
          scene: "question_generate",
          implicitAction: "favorited",
        });
      }
      try {
        const existing = await findExistingCard({ planId: currentPlan.id, questionId: currentQuestion.id });
        if (!existing) {
          const card = createCard(
            currentPlan.id,
            currentQuestion.nodeId,
            currentQuestion.id,
            currentQuestion.question,
            currentQuestion.answer || "",
            "standard",
          );
          await setItem(KEY_PREFIXES.CARD + card.id, card);
        }
      } catch {
        // 造卡失败不影响收藏本身
      }
    }
  }, [currentQuestion, currentPlan]);

  // 用户点击"我答对了"：写 understood 状态 + 自动标记节点掌握（2026-07-25 用户需求）
  //
  // 设计：训练中"我答对了"和计划详情页"看懂了"是同一语义——用户已掌握该题。
  // 因此训练中点"我答对了"应：
  //   1. 调 markQuestionUnderstoodAndMaybeMasterNode 持久化 understood=true
  //   2. 同步更新 currentPlan / currentQuestion 内存状态（避免 NEXT_TASK 重新 loadCurrentTask 读到旧 plan）
  //   3. 弹 toast 提示用户（autoMastered 显示节点掌握，否则显示题目已记录）
  //
  // 2026-07-26 修复（用户反馈"点击我答对了，进度没变化"）：
  //   - 原版仅在 autoMastered 时弹 toast，单题理解时用户无感知 → 补 else 分支 toast
  //   - 原版 fire-and-forget 写库与 NEXT_TASK 存在竞态：写未完成时 loadCurrentTask
  //     可能读到旧 plan → 改为 await 写库后再 dispatch
  //   - loadCurrentTask 优先选节点下 !understood 的题，避免下次进来重复已答对的题
  //
  // 2026-07-27 二次修复（用户反馈"开始训练的进度还是一直为 0"）：
  //   - 上次修复引入了 regression：handleAnswerCorrect 返回 boolean，
  //     onClick 里 `if (!ok) return` 阻止了 dispatch ANSWER_SUBMIT
  //   - 这导致 questionsAnswered/questionsCorrect 永远不增加 → 顶部进度条一直为 0
  //   - 根因：写库失败时不该阻塞 UI 流程——用户点"我答对了"应该始终进入 feedback phase
  //     （即使写库失败，用户也不该卡在 questioning phase 无响应）
  //   - 修复：回到不返回 boolean 的设计，写库失败只 toast 不阻塞 dispatch
  //     dispatch ANSWER_SUBMIT 始终触发，让训练进度正常累加
  //
  // 注意：
  //   - "没答对"按钮不写 understood=false（避免污染从未标记过的题）
  //   - 仅 type="new" 且有 currentQuestion 时调用（review 任务无 Question 概念）
  //   - markQuestionUnderstood 已改为找不到题目时抛错（避免静默失败），这里 catch 住
  const handleAnswerCorrect = useCallback(async (): Promise<void> => {
    if (!currentQuestion || !currentPlan) return;
    try {
      const { plan: updatedPlan, autoMastered, node } =
        await markQuestionUnderstoodAndMaybeMasterNode(
          currentPlan,
          currentQuestion.id,
        );
      setCurrentPlan(updatedPlan);
      const updatedQ =
        updatedPlan.questions.find((q) => q.id === currentQuestion.id) ?? null;
      setCurrentQuestion(updatedQ);
      // 与 PlanDetailClient.handleMarkUnderstood 保持一致：
      // autoMastered 显示节点掌握提示，否则显示单题已记录（让用户知道点击有效）
      if (autoMastered && node) {
        toast.success(
          `「${node.title}」下题目全部看懂，已自动标记为「已掌握」`,
        );
      } else {
        toast.success("已记录「我答对了」");
      }
    } catch (e) {
      // 持久化失败不阻塞训练流程（dispatch 仍会触发，让用户进入 feedback phase）
      // 但 toast 提示用户重试，避免静默失败导致"下次进来还是没学"
      console.warn("[train] 写 understood 失败:", e);
      toast.error("记录失败，请重试");
    }
  }, [currentQuestion, currentPlan]);

  // 会话完成
  useEffect(() => {
    if (state.phase === "completed") {
      onSessionComplete();
    }
  }, [state.phase, onSessionComplete]);

  // 进度同步：把 currentIndex / answered / correct / phase 上报到父组件
  // 父组件据此渲染顶部进度条（替代硬编码 "1/total"）
  useEffect(() => {
    onProgressChange?.({
      currentIndex: state.currentIndex,
      total: studyQueue.length,
      questionsAnswered: state.questionsAnswered,
      questionsCorrect: state.questionsCorrect,
      phase: state.phase,
    });
  }, [
    state.currentIndex,
    state.questionsAnswered,
    state.questionsCorrect,
    state.phase,
    studyQueue.length,
    onProgressChange,
  ]);

  if (!currentTask || state.phase === "completed") {
    // 完成视图：仅展示统计，不渲染按钮
    // 父组件 TrainClient 监听 phase === "completed" 后弹 Modal 让用户确认 → 跳今日进度
    return (
      <div className="text-center py-12">
        <Icon name="check-circle" className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h2 className="text-xl font-bold mb-2 text-gray-900 dark:text-gray-100">今天的训练完成了！</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          答对 {state.questionsCorrect} / {state.questionsAnswered} 题
        </p>
        <p className="text-xs text-gray-400 dark:text-gray-500">
          <Icon name="loader" className="w-3 h-3 inline-block align-middle animate-spin mr-1" />
          正在统计结果...
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <Icon name="loader" className="w-8 h-8 text-gray-400 dark:text-gray-500 mx-auto animate-spin mb-2" />
        <p className="text-sm text-gray-500 dark:text-gray-400">加载中...</p>
      </div>
    );
  }

  // 渲染当前 phase
  return (
    <div>
      {/* 顶部：当前任务信息 */}
      <div className="mb-4 flex items-center justify-between text-xs text-gray-400 dark:text-gray-500">
        <span className="flex items-center gap-1">
          <Icon name={currentTask.type === "review" ? "repeat" : "book"} className="w-3.5 h-3.5" />
          {currentTask.type === "review" ? "复习" : "新学"} · {currentTask.title}
        </span>
        <span>第 {state.currentIndex + 1} / {studyQueue.length} 项</span>
      </div>

      {/* learning phase */}
      {state.phase === "learning" && currentNode && (
        <KnowledgeBrief
          node={currentNode}
          question={currentQuestion}
          onLearned={() => {
            // 进入 questioning 前重置答案揭示状态（隐藏答案，强制用户先回忆）
            setAnswerRevealed(false);
            dispatch({ type: "LEARN_COMPLETE" });
          }}
          onAskAI={(text) => handleAskAI(text, "学习材料")}
        />
      )}

      {/* questioning phase */}
      {state.phase === "questioning" && currentQuestion && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Icon name="help-circle" className="w-4 h-4 text-blue-500" />
              <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">检测题</h2>
            </div>
            {/* 收藏按钮：收藏后进入 FSRS 复习轮换 */}
            <Button
              onClick={handleFavorite}
              variant="ghost"
              size="sm"
              iconOnly
              aria-label={currentQuestion.favorited ? "取消收藏" : "收藏题目"}
              className={currentQuestion.favorited ? "text-yellow-500" : "text-gray-300 dark:text-gray-600"}
            >
              <Icon name="star" className="w-5 h-5" />
            </Button>
          </div>

          {/* 题目（选中文字可问 AI） */}
          <AnswerContent
            text={currentQuestion.question}
            className="text-sm text-gray-700 dark:text-gray-300 mb-4 leading-relaxed select-text"
            onAskAI={(selectedText) => handleAskAI(selectedText, currentQuestion.question.slice(0, 30))}
          />

          {/* 答案揭示机制：默认隐藏，强制用户先回忆再查看
              设计修正：原版默认展开答案 = 把答案直接给用户看，测试失去意义
              新版：先让用户回忆，点击"查看答案"才揭示，再自评对错 */}
          {!answerRevealed ? (
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 mb-4 border border-dashed border-gray-200 dark:border-gray-600 text-center">
              <Icon name="lightbulb" className="w-6 h-6 text-gray-400 dark:text-gray-500 mx-auto mb-2" />
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                先在脑中回忆你的答案，准备好后查看参考答案
              </p>
              <Button
                variant="secondary"
                onClick={() => setAnswerRevealed(true)}
                leftIcon="chevron-down"
              >
                查看答案
              </Button>
            </div>
          ) : (
            <div className="bg-blue-50 dark:bg-blue-950/30 rounded-xl p-4 mb-4 border border-blue-100 dark:border-blue-900">
              <div className="flex items-center gap-1.5 mb-2">
                <Icon name="lightbulb" className="w-3.5 h-3.5 text-blue-500" />
                <p className="text-xs font-medium text-blue-600 dark:text-blue-400">参考答案</p>
              </div>
              {/* 答案用 AnswerContent 渲染：代码编辑器样式 + 代码高亮 + 选中文字问 AI */}
              <AnswerContent
                text={currentQuestion.answer}
                className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed"
                onAskAI={(selectedText) => handleAskAI(selectedText, "参考答案")}
              />
              {currentQuestion.keyPoints && currentQuestion.keyPoints.length > 0 && (
                <div className="mt-3 pt-3 border-t border-blue-100 dark:border-blue-900">
                  <p className="text-xs font-medium text-blue-600 dark:text-blue-400 mb-1.5">
                    <Icon name="zap" className="w-3 h-3 inline-block align-middle mr-0.5" />
                    关键点
                  </p>
                  <ul className="space-y-1">
                    {currentQuestion.keyPoints.map((kp, i) => (
                      <li key={i} className="text-xs text-gray-600 dark:text-gray-400 flex items-start gap-1.5">
                        <span className="text-blue-400 mt-0.5">•</span>
                        <span>{kp}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* 自评按钮：只有揭示答案后才显示 */}
          {answerRevealed && (
            <>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-3 text-center">
                对照答案，你答对了吗？
              </p>
              <div className="flex gap-2">
                <Button
                  variant="success"
                  block
                  onClick={async () => {
                    setIsCorrect(true);
                    setFeedback(generateSocraticFeedback(true, currentQuestion.keyPoints?.[0]));
                    // 2026-07-26 修复：await 写库再 dispatch，避免 NEXT_TASK 读到旧 plan
                    // 2026-07-27 二次修复：写库失败不阻塞 dispatch——
                    //   用户点"我答对了"应该始终进入 feedback phase（即使写库失败），
                    //   否则训练进度（questionsAnswered/Correct）永远不增加，用户感知"进度为 0"
                    //   写库失败时 handleAnswerCorrect 内部已 toast 提示用户重试
                    await handleAnswerCorrect();
                    dispatch({ type: "ANSWER_SUBMIT", isCorrect: true });
                  }}
                  leftIcon="check"
                >
                  我答对了
                </Button>
                <Button
                  variant="ghost"
                  block
                  onClick={() => {
                    setIsCorrect(false);
                    setFeedback(generateSocraticFeedback(false, currentQuestion.keyPoints?.[0]));
                    dispatch({ type: "ANSWER_SUBMIT", isCorrect: false });
                  }}
                  leftIcon="x"
                >
                  没答对
                </Button>
              </div>
            </>
          )}
        </div>
      )}

      {/* questioning phase but no question */}
      {state.phase === "questioning" && !currentQuestion && currentNode && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            这个知识点暂无检测题，直接标记为已学。
          </p>
          <Button
            variant="primary"
            block
            onClick={() => {
              setIsCorrect(true);
              setFeedback("知识点已标记完成，继续下一个。");
              dispatch({ type: "ANSWER_SUBMIT", isCorrect: true });
            }}
            leftIcon="chevron-right"
          >
            继续
          </Button>
        </div>
      )}

      {/* feedback phase */}
      {state.phase === "feedback" && (
        <SocraticFeedback
          isCorrect={isCorrect}
          feedback={feedback}
          onContinue={() => {
            // 进入下一项任务前重置答案揭示状态
            setAnswerRevealed(false);
            dispatch({ type: "NEXT_TASK" });
          }}
        />
      )}

      {/* breaking phase */}
      {state.phase === "breaking" && (
        <div className="bg-green-50 dark:bg-green-950/30 rounded-2xl p-6 border-2 border-green-200 dark:border-green-800 text-center">
          <Icon name="leaf" className="w-12 h-12 text-green-500 mx-auto mb-3" />
          <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">休息一下</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            你已经专注了 {FOCUS_THRESHOLD_MINUTES} 分钟，站起来活动一下，喝杯水。
          </p>
          <Button
            variant="success"
            block
            onClick={() => dispatch({ type: "BREAK_END" })}
            leftIcon="zap"
          >
            休息好了，继续
          </Button>
        </div>
      )}
    </div>
  );
}
