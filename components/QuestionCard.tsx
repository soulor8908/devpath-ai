"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import type { Question } from "@/lib/types";
import { AnswerContent, CodeBlock } from "@/components/CodeBlock";
import { trackAIFeedback } from "@/lib/ai/quality-tracker";
import { Icon } from "@/components/Icon";

// 停留时间阈值（毫秒）
const DWELL_TOO_SIMPLE_MS = 3_000;   // < 3s → 太简单
const DWELL_NEEDS_PRACTICE_MS = 300_000; // > 5min → 需要更多练习

interface Props {
  question: Question;
  onFavoriteToggle?: (questionId: string) => void;
  onRegenerate?: (questionId: string) => void;
  regenerating?: boolean;
  onFollowUpClick?: (followUp: string) => void;
}

export function QuestionCard({ question, onFavoriteToggle, onRegenerate, regenerating, onFollowUpClick }: Props) {
  const router = useRouter();
  const [expanded, setExpanded] = useState(false);
  const isFailed = question.question === "生成失败，点击重试";

  // 停留时间追踪：记录答案展开的时间戳
  const expandTimeRef = useRef<number | null>(null);
  const dwellTrackedRef = useRef(false);

  // 隐式反馈：记录用户对这道题的行为（仅当有 aiCallId 时触发，老题目静默跳过）
  const trackImplicit = (implicitAction: "expanded" | "followed_up" | "favorited" | "too_simple" | "needs_practice" | "copied") => {
    if (!question.aiCallId) return;
    void trackAIFeedback({
      callRecordId: question.aiCallId,
      scene: "question_generate",
      implicitAction,
    });
  };

  // 根据停留时间推断隐式反馈
  const trackDwell = () => {
    if (!expandTimeRef.current || dwellTrackedRef.current) return;
    const dwellMs = Date.now() - expandTimeRef.current;
    if (dwellMs < DWELL_TOO_SIMPLE_MS) {
      trackImplicit("too_simple");
      dwellTrackedRef.current = true;
    } else if (dwellMs > DWELL_NEEDS_PRACTICE_MS) {
      trackImplicit("needs_practice");
      dwellTrackedRef.current = true;
    }
  };

  // 组件卸载时记录停留时间
  useEffect(() => {
    return () => {
      trackDwell();
    };
  }, []);

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
          <button
            onClick={() => {
              if (!question.favorited) trackImplicit("favorited");
              onFavoriteToggle(question.id);
            }}
            className={`text-lg ${question.favorited ? "text-yellow-500" : "text-gray-300"}`}
            aria-label="收藏"
          >
            <Icon name="star" className="w-5 h-5" />
          </button>
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
                  <button
                    key={i}
                    onClick={() => handleFollowUpClick(fu)}
                    className="text-xs text-blue-600 bg-blue-50 hover:bg-blue-100 px-2 py-1 rounded-full transition-colors border border-blue-100"
                    title="点击进入 AI 聊天"
                  >
                    <Icon name="message-circle" className="w-3.5 h-3.5 inline-block align-middle" /> {fu}
                  </button>
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
          <button
            onClick={() => {
              trackImplicit("expanded");
              expandTimeRef.current = Date.now();
              dwellTrackedRef.current = false;
              setExpanded(true);
            }}
            className="text-xs text-blue-500"
          >
            展开答案 ▼
          </button>
        )}
        {onRegenerate && (
          <button
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
            disabled={regenerating}
            className={`text-xs ml-auto px-2 py-1 rounded ${
              isFailed
                ? "bg-red-100 text-red-600 hover:bg-red-200"
                : "text-gray-400 hover:text-blue-500 hover:bg-blue-50"
            } disabled:opacity-50`}
          >
            {regenerating ? "生成中..." : (<><Icon name="refresh-cw" className="w-3.5 h-3.5 inline-block align-middle" /> {isFailed ? "重新生成" : "换一题"}</>)}
          </button>
        )}
      </div>
    </div>
  );
}
