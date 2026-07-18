"use client";

// lib/hooks/use-ai-task.ts
// 订阅全局 AI 任务状态的 React hook

import { useSyncExternalStore } from "react";
import {
  subscribeAITask,
  getCurrentAITask,
  type AITask,
} from "@/lib/ai-task-queue";

export function useAITask(): AITask | null {
  return useSyncExternalStore(subscribeAITask, getCurrentAITask, getCurrentAITask);
}
