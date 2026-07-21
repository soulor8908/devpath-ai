"use client";

// components/SocraticFeedback.tsx
// 答题反馈——苏格拉底式引导，不直接给答案

import { Icon } from "@/components/Icon";
import { Button } from "@/components/ui";

interface SocraticFeedbackProps {
  isCorrect: boolean;
  feedback: string;
  onContinue: () => void;
}

export function SocraticFeedback({ isCorrect, feedback, onContinue }: SocraticFeedbackProps) {
  return (
    <div
      className={`rounded-2xl p-5 border-2 ${
        isCorrect
          ? "bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800"
          : "bg-orange-50 dark:bg-orange-950/30 border-orange-200 dark:border-orange-800"
      }`}
    >
      <div className="flex items-start gap-3 mb-4">
        <Icon
          name={isCorrect ? "check-circle" : "alert"}
          className={`w-6 h-6 shrink-0 ${
            isCorrect ? "text-green-500" : "text-orange-500"
          }`}
        />
        <p className="text-sm leading-relaxed text-gray-700 dark:text-gray-300">
          {feedback}
        </p>
      </div>

      <Button
        variant={isCorrect ? "success" : "primary"}
        block
        onClick={onContinue}
        leftIcon="chevron-right"
      >
        {isCorrect ? "继续下一个" : "再想想，然后继续"}
      </Button>
    </div>
  );
}
