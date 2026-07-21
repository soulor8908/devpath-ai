"use client";

// components/ReviewCardView.tsx
// 复习卡片视图：显示正反面 + 4 档评分
//
// 选文字问 AI（用户需求）：
//   - 复习题的问题（card.front）和答案（card.back）都支持选中文字后弹"问 AI"按钮
//   - 通过 useAskAI hook 统一实现（lib/hooks/use-ask-ai.ts），避免重复代码
//   - 点击按钮 → openChatModal({ prefill, source }) 跳聊天页追问

import { useState } from "react";
import type { ReviewCard, Rating } from "@/lib/types";
import { Icon, type IconName } from "@/components/Icon";
import { Button } from "@/components/ui";
import { useAskAI } from "@/lib/hooks/use-ask-ai";
import { openChatModal } from "@/lib/chat-modal-store";

const RATINGS: { value: Rating; label: string; icon: IconName; color: string }[] = [
  { value: 1, label: "Again", icon: "frown", color: "bg-red-500" },
  { value: 2, label: "Hard", icon: "meh", color: "bg-orange-500" },
  { value: 3, label: "Good", icon: "smile", color: "bg-green-500" },
  { value: 4, label: "Easy", icon: "smile", color: "bg-blue-500" },
];

interface Props {
  card: ReviewCard;
  onRate: (rating: Rating) => void;
}

export function ReviewCardView({ card, onRate }: Props) {
  const [showAnswer, setShowAnswer] = useState(false);

  // 问题区域：选文字问 AI
  const frontAsk = useAskAI({
    onAskAI: (selectedText) => {
      const prefill = `关于复习题「${card.front}」的问题片段：\n\n> ${selectedText}\n\n请帮我深入理解这段内容。`;
      openChatModal({
        prefill,
        source: {
          type: "question",
          id: card.questionId,
          title: card.front,
          planId: card.planId,
        },
      });
    },
  });

  // 答案区域：选文字问 AI（仅展开后渲染容器，hook 仍可无条件调用）
  const backAsk = useAskAI({
    onAskAI: (selectedText) => {
      const prefill = `关于复习题「${card.front}」的答案片段：\n\n> ${selectedText}\n\n请帮我深入理解这段内容。`;
      openChatModal({
        prefill,
        source: {
          type: "question",
          id: card.questionId,
          title: card.front,
          planId: card.planId,
        },
      });
    },
  });

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 bg-white dark:bg-gray-800 shadow-sm">
      <div
        ref={frontAsk.containerRef}
        className="text-lg font-medium mb-4"
      >
        {card.front}
        {frontAsk.floatingButton}
      </div>

      {!showAnswer ? (
        <Button
          variant="secondary"
          block
          aria-expanded={showAnswer}
          aria-controls="review-answer-panel"
          onClick={() => setShowAnswer(true)}
        >
          显示答案
        </Button>
      ) : (
        <>
          <div
            id="review-answer-panel"
            ref={backAsk.containerRef}
            className="text-sm text-gray-700 dark:text-gray-200 whitespace-pre-wrap mb-4 p-3 bg-gray-50 dark:bg-gray-900/60 rounded"
          >
            {card.back}
            {backAsk.floatingButton}
          </div>
          <div className="grid grid-cols-4 gap-2">
            {RATINGS.map((r) => (
              <Button
                key={r.value}
                variant="primary"
                size="sm"
                onClick={() => onRate(r.value)}
                className={`flex-col ${r.color} hover:opacity-90`}
              >
                <span className="text-xl"><Icon name={r.icon} className="w-5 h-5 inline-block" /></span>
                <span className="text-xs">{r.label}</span>
              </Button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
