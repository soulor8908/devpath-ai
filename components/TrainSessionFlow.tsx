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

import { useReducer, useEffect, useState, useCallback } from "react";
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

interface TrainSessionFlowProps {
  studyQueue: StudyTask[];
  onSessionComplete: () => void;
}

export function TrainSessionFlow({ studyQueue, onSessionComplete }: TrainSessionFlowProps) {
  const [state, dispatch] = useReducer(trainSessionReducer, undefined, createInitialTrainState);
  const [currentNode, setCurrentNode] = useState<KnowledgeNode | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [currentPlan, setCurrentPlan] = useState<LearningPlan | null>(null);
  const [feedback, setFeedback] = useState("");
  const [isCorrect, setIsCorrect] = useState(false);
  const [loading, setLoading] = useState(true);
  // 测试阶段答案是否已揭示（默认隐藏，强制用户先回忆）
  const [answerRevealed, setAnswerRevealed] = useState(false);

  const currentTask = studyQueue[state.currentIndex];

  // 专注时间计时——每分钟 +1 focusMinutes，达到阈值触发休息
  useEffect(() => {
    const timer = setInterval(() => {
      dispatch({ type: "FOCUS_TICK" });
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  // 加载当前任务的知识点和题目
  const loadCurrentTask = useCallback(async () => {
    if (!currentTask) {
      dispatch({ type: "SESSION_COMPLETE" });
      return;
    }
    setLoading(true);
    setAnswerRevealed(false);
    try {
      if (currentTask.type === "new" && currentTask.planId) {
        // 加载计划中的知识点
        const plan = await getItem<LearningPlan>(KEY_PREFIXES.PLAN + currentTask.planId);
        if (plan) {
          const node = plan.knowledgeTree.find((n) => n.id === currentTask.nodeId) || plan.knowledgeTree[0];
          const question = plan.questions.find((q) => q.nodeId === node?.id) || null;
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

  useEffect(() => {
    if (state.phase === "learning" && currentTask) {
      void loadCurrentTask();
    }
  }, [state.phase, currentTask, loadCurrentTask]);

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

  // 会话完成
  useEffect(() => {
    if (state.phase === "completed") {
      onSessionComplete();
    }
  }, [state.phase, onSessionComplete]);

  if (!currentTask || state.phase === "completed") {
    return (
      <div className="text-center py-12">
        <Icon name="check-circle" className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h2 className="text-xl font-bold mb-2 text-gray-900 dark:text-gray-100">今天的训练完成了！</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          答对 {state.questionsCorrect} / {state.questionsAnswered} 题
        </p>
        <Button variant="primary" onClick={onSessionComplete}>
          返回首页
        </Button>
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
          onLearned={() => dispatch({ type: "LEARN_COMPLETE" })}
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
                  onClick={() => {
                    setIsCorrect(true);
                    setFeedback(generateSocraticFeedback(true, currentQuestion.keyPoints?.[0]));
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
          onContinue={() => dispatch({ type: "NEXT_TASK" })}
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
