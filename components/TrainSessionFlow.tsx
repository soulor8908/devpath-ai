"use client";

// components/TrainSessionFlow.tsx
// 训练会话流程组件——学→练→反馈→休息 状态机

import { useReducer, useEffect, useState, useCallback } from "react";
import { getItem } from "@/lib/storage/db";
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
import { Icon } from "@/components/Icon";
import { Button } from "@/components/ui";

interface TrainSessionFlowProps {
  studyQueue: StudyTask[];
  onSessionComplete: () => void;
}

export function TrainSessionFlow({ studyQueue, onSessionComplete }: TrainSessionFlowProps) {
  const [state, dispatch] = useReducer(trainSessionReducer, undefined, createInitialTrainState);
  const [currentNode, setCurrentNode] = useState<KnowledgeNode | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [feedback, setFeedback] = useState("");
  const [isCorrect, setIsCorrect] = useState(false);
  const [loading, setLoading] = useState(true);

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
    try {
      if (currentTask.type === "new" && currentTask.planId) {
        // 加载计划中的知识点
        const plan = await getItem<LearningPlan>(KEY_PREFIXES.PLAN + currentTask.planId);
        if (plan) {
          const node = plan.knowledgeTree.find((n) => n.id === currentTask.nodeId) || plan.knowledgeTree[0];
          const question = plan.questions.find((q) => q.nodeId === node?.id) || null;
          setCurrentNode(node ?? null);
          setCurrentQuestion(question);
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
        />
      )}

      {/* questioning phase */}
      {state.phase === "questioning" && currentQuestion && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-2 mb-3">
            <Icon name="help-circle" className="w-4 h-4 text-blue-500" />
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">检测题</h2>
          </div>
          <p className="text-sm text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
            {currentQuestion.question}
          </p>

          {/* 答案参考（默认展开，让用户对照答案自评） */}
          <div className="bg-blue-50 dark:bg-blue-950/30 rounded-xl p-3 mb-4 border border-blue-100 dark:border-blue-900">
            <div className="flex items-center gap-1.5 mb-1.5">
              <Icon name="lightbulb" className="w-3.5 h-3.5 text-blue-500" />
              <p className="text-xs font-medium text-blue-600 dark:text-blue-400">参考答案</p>
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed whitespace-pre-wrap">
              {currentQuestion.answer}
            </div>
            {currentQuestion.keyPoints && currentQuestion.keyPoints.length > 0 && (
              <div className="mt-2 pt-2 border-t border-blue-100 dark:border-blue-900">
                <p className="text-xs text-blue-600 dark:text-blue-400 mb-1">💡 关键点</p>
                <ul className="space-y-0.5">
                  {currentQuestion.keyPoints.map((kp, i) => (
                    <li key={i} className="text-xs text-gray-600 dark:text-gray-400">• {kp}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

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
