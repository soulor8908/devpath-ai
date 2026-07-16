"use client";

import { useState } from "react";
import type { ReviewCard, Rating } from "@/lib/types";
import { Icon, type IconName } from "@/components/Icon";

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
    <div className="border rounded-lg p-6 bg-white shadow-sm">
      <p className="text-lg font-medium mb-4">{card.front}</p>

      {!showAnswer ? (
        <button
          onClick={() => setShowAnswer(true)}
          className="w-full py-2 bg-gray-100 rounded-lg text-sm font-medium hover:bg-gray-200"
        >
          显示答案
        </button>
      ) : (
        <>
          <div className="text-sm text-gray-700 whitespace-pre-wrap mb-4 p-3 bg-gray-50 rounded">
            {card.back}
          </div>
          <div className="grid grid-cols-4 gap-2">
            {RATINGS.map((r) => (
              <button
                key={r.value}
                onClick={() => onRate(r.value)}
                className={`flex flex-col items-center py-2 ${r.color} text-white rounded-lg hover:opacity-90`}
              >
                <span className="text-xl"><Icon name={r.icon} className="w-5 h-5 inline-block" /></span>
                <span className="text-xs">{r.label}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
