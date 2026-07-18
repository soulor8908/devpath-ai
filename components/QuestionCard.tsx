"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import type { Question } from "@/lib/types";
import { AnswerContent, CodeBlock } from "@/components/CodeBlock";
import { trackAIFeedback } from "@/lib/ai/quality-tracker";
import { Icon } from "@/components/Icon";
import { Button } from "@/components/ui";
import { createCard, findExistingCard } from "@/lib/fsrs";
import { setItem } from "@/lib/storage/db";
import { KEY_PREFIXES } from "@/lib/types";

// 停留时间阈值（毫秒）
const DWELL_TOO_SIMPLE_MS = 3_000;   // < 3s → 太简单
const DWELL_NEEDS_PRACTICE_MS = 300_000; // > 5min → 需要更多练习

interface Props {
  question: Question;
  /** 关联计划 ID（用于收藏时自动造复习卡） */
  planId?: string;
  onFavoriteToggle?: (questionId: string) => void;
  onRegenerate?: (questionId: string) => void;
  regenerating?: boolean;
  onFollowUpClick?: (followUp: string) => void;
}

export function QuestionCard({ question, planId, onFavoriteToggle, onRegenerate, regenerating, onFollowUpClick }: Props) {
  const router = useRouter();
  const [expanded, setExpanded] = useState(false);
  const isFailed = question.question === "生成失败，点击重试";

  // 停留时间追踪：记录答案展开的时间戳
  const expandTimeRef = useRef<number | null>(null);
  const dwellTrackedRef = useRef(false);

  // 隐式反馈：记录用户对这道题的行为（仅当有 aiCallId 时触发，老题目静默跳过）
  const trackImplicit = useCallback((implicitAction: "expanded" | "followed_up" | "favorited" | "too_simple" | "needs_practice" | "copied") => {
    if (!question.aiCallId) return;
    void trackAIFeedback({
      callRecordId: question.aiCallId,
      scene: "question_generate",
      implicitAction,
    });
  }, [question.aiCallId]);

  // 根据停留时间推断隐式反馈
  const trackDwell = useCallback(() => {
    if (!expandTimeRef.current || dwellTrackedRef.current) return;
    const dwellMs = Date.now() - expandTimeRef.current;
    if (dwellMs < DWELL_TOO_SIMPLE_MS) {
      trackImplicit("too_simple");
      dwellTrackedRef.current = true;
    } else if (dwellMs > DWELL_NEEDS_PRACTICE_MS) {
      trackImplicit("needs_practice");
      dwellTrackedRef.current = true;
    }
  }, [trackImplicit]);

  // 组件卸载时记录停留时间
  useEffect(() => {
    return () => {
      trackDwell();
    };
  }, [trackDwell]);

  const handleFollowUpClick = (fu: string) => {
    trackImplicit("followed_up");
    if (onFollowUpClick) {
      onFollowUpClick(fu);
    } else {
      router.push(`/chat?prefill=${encodeURIComponent(fu)}&sourceType=question&sourceId=${question.id}&sourceTitle=${encodeURIComponent(question.question)}`);
    }
  };

  return (
    <div className="border rounded-lg p-4 bg-white">
      <div className="flex items-start gap-2">
        <button
          onClick={() => {
            if (!expanded) {
              trackImplicit("expanded");
              expandTimeRef.current = Date.now();
              dwellTrackedRef.current = false;
            } else {
              trackDwell();
              expandTimeRef.current = null;
            }
            setExpanded(!expanded);
          }}
          className="flex-1 text-left text-sm font-medium hover:text-blue-600"
        >
          {question.bigTech && (
            <span className="inline-block px-1.5 py-0.5 mr-2 text-[10px] bg-amber-100 text-amber-700 rounded font-medium align-middle">
              <Icon name="building" className="w-3 h-3 inline-block align-middle" /> 大厂
            </span>
          )}
          {question.question}
        </button>
        {onFavoriteToggle && (
          <Button
            onClick={async () => {
              if (!question.favorited) {
                trackImplicit("favorited");
                // 即将收藏 → 同步造复习卡（带查重，避免重复）
                if (planId) {
                  try {
                    const existing = await findExistingCard({ planId, questionId: question.id });
                    if (!existing) {
                      const card = createCard(
                        planId,
                        question.nodeId,
                        question.id,
                        question.question,
                        question.answer || "",
                        "standard"
                      );
                      await setItem(KEY_PREFIXES.CARD + card.id, card);
                    }
                  } catch {
                    // 造卡失败不影响收藏本身
                  }
                }
              }
              onFavoriteToggle(question.id);
            }}
            variant="ghost"
            size="sm"
            className={`text-lg ${question.favorited ? "text-yellow-500" : "text-gray-300"}`}
            aria-label="收藏"
          >
            <Icon name="star" className="w-5 h-5" />
          </Button>
        )}
      </div>

      {expanded && question.answer && (
        <div className="mt-3 space-y-2">
          <AnswerContent text={question.answer} />
          {question.keyPoints.length > 0 && (
            <div>
              <p className="text-xs font-medium text-gray-500 mt-2">关键点：</p>
              <ul className="text-xs text-gray-600 list-disc list-inside">
                {question.keyPoints.map((kp, i) => (
                  <li key={i}>{kp}</li>
                ))}
              </ul>
            </div>
          )}
          {question.followUps.length > 0 && (
            <div>
              <p className="text-xs font-medium text-gray-500 mt-2">追问（点击向 AI 提问）：</p>
              <div className="flex flex-wrap gap-1.5 mt-1">
                {question.followUps.map((fu, i) => (
                  <Button
                    key={i}
                    onClick={() => handleFollowUpClick(fu)}
                    variant="ghost"
                    size="sm"
                    className="text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-full border border-blue-100"
                    title="点击进入 AI 聊天"
                  >
                    <Icon name="message-circle" className="w-3.5 h-3.5 inline-block align-middle" /> {fu}
                  </Button>
                ))}
              </div>
            </div>
          )}
          {question.codeSnippet && (
            <CodeBlock
              code={question.codeSnippet}
              language="javascript"
              onCopy={() => trackImplicit("copied")}
            />
          )}
        </div>
      )}

      <div className="flex items-center gap-2 mt-2">
        {!expanded && question.answer && (
          <Button
            onClick={() => {
              trackImplicit("expanded");
              expandTimeRef.current = Date.now();
              dwellTrackedRef.current = false;
              setExpanded(true);
            }}
            variant="ghost"
            size="sm"
            className="text-blue-500"
          >
            展开答案 ▼
          </Button>
        )}
        {onRegenerate && (
          <Button
            onClick={() => {
              trackDwell();
              // 隐式反馈：用户主动换题 = 对当前题目不满意
              if (question.aiCallId && !isFailed) {
                void trackAIFeedback({
                  callRecordId: question.aiCallId,
                  scene: "question_generate",
                  action: "regenerated",
                });
              }
              onRegenerate(question.id);
            }}
            variant="ghost"
            size="sm"
            loading={regenerating}
            disabled={regenerating}
            leftIcon="refresh-cw"
            className={`ml-auto ${
              isFailed
                ? "bg-red-100 text-red-600 hover:bg-red-200"
                : "text-gray-400 hover:text-blue-500 hover:bg-blue-50"
            }`}
          >
            {regenerating ? "生成中..." : (isFailed ? "重新生成" : "换一题")}
          </Button>
        )}
      </div>
    </div>
  );
}
