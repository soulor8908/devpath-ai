"use client";

import { useState } from "react";
import type { ReviewCard, Rating } from "@/lib/types";
import { Icon, type IconName } from "@/components/Icon";
import { Button } from "@/components/ui";

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

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 bg-white dark:bg-gray-800 shadow-sm">
      <p className="text-lg font-medium mb-4">{card.front}</p>

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
            className="text-sm text-gray-700 dark:text-gray-200 whitespace-pre-wrap mb-4 p-3 bg-gray-50 dark:bg-gray-900/60 rounded"
          >
            {card.back}
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
