"use client";

// lib/ai-task-queue.ts
// 全局 AI 任务管理器（单例 store + 订阅模式，类似 toast）
//
// 设计（乔布斯视角）：
//   - 用户每次主动触发 AI 调用（生成题目、重新生成计划、生成答案、聊天等）
//     都会创建一个 AI 任务，弹窗显示进度
//   - 模态窗显示：标题 + 流式输出内容 + 中止按钮 + 关闭按钮
//   - 任务完成前关闭 → 提醒"任务会关闭，是否继续？"
//   - backdrop 不可点击关闭，避免误触丢失任务
//
// 设计（卡帕西视角）：
//   - 单例 store + subscribe：与 toast 一致的模式，避免 Context re-render
//   - 每个任务有 AbortController，中止时调用 abort
//   - 流式更新通过 updateTaskContent 增量更新
//   - 任何模块都能调用 startAITask / updateAITask / endAITask

export interface AITask {
  id: string;
  title: string;
  /** 流式输出的内容（实时更新） */
  content: string;
  /** 任务状态 */
  status: "running" | "done" | "error" | "aborted";
  /** 错误信息（status=error 时） */
  error?: string;
  /** 创建时间 */
  createdAt: number;
  /** 完成时间 */
  finishedAt?: number;
  /** AbortController，用于中止底层 fetch */
  controller: AbortController;
}

export type AITaskListener = (task: AITask | null) => void;

let currentTask: AITask | null = null;
const listeners = new Set<AITaskListener>();
let seq = 0;

function genId(): string {
  seq += 1;
  return `ai_task_${Date.now().toString(36)}_${seq.toString(36)}`;
}

function emit() {
  for (const l of listeners) {
    try {
      l(currentTask);
    } catch {
      // 单个监听器抛错不影响其他
    }
  }
}

/** 订阅当前 AI 任务变化 */
export function subscribeAITask(listener: AITaskListener): () => void {
  listeners.add(listener);
  try {
    listener(currentTask);
  } catch {
    // ignore
  }
  return () => {
    listeners.delete(listener);
  };
}

/** 获取当前任务快照 */
export function getCurrentAITask(): AITask | null {
  return currentTask;
}

/**
 * 启动一个 AI 任务
 * @param title 任务标题（如"AI 正在拆解知识点..."）
 * @returns task id 与 AbortSignal（传给 fetch）
 */
export function startAITask(title: string): { id: string; signal: AbortSignal } {
  // 如果已有任务在运行，先中止它（理论上一时刻只有一个 AI 任务）
  if (currentTask && currentTask.status === "running") {
    try {
      currentTask.controller.abort();
    } catch {
      // ignore
    }
  }
  const id = genId();
  const controller = new AbortController();
  currentTask = {
    id,
    title,
    content: "",
    status: "running",
    createdAt: Date.now(),
    controller,
  };
  emit();
  return { id, signal: controller.signal };
}

/**
 * 增量更新任务内容（流式输出）
 * @param id 任务 id
 * @param chunk 新增内容片段
 */
export function appendAITaskContent(id: string, chunk: string): void {
  if (!currentTask || currentTask.id !== id) return;
  currentTask = {
    ...currentTask,
    content: currentTask.content + chunk,
  };
  emit();
}

/**
 * 替换任务内容（用于非流式调用一次性设置最终内容）
 */
export function setAITaskContent(id: string, content: string): void {
  if (!currentTask || currentTask.id !== id) return;
  currentTask = {
    ...currentTask,
    content,
  };
  emit();
}

/**
 * 标记任务完成
 */
export function completeAITask(id: string, finalContent?: string): void {
  if (!currentTask || currentTask.id !== id) return;
  currentTask = {
    ...currentTask,
    status: "done",
    content: finalContent ?? currentTask.content,
    finishedAt: Date.now(),
  };
  emit();
}

/**
 * 标记任务出错
 */
export function errorAITask(id: string, error: string): void {
  if (!currentTask || currentTask.id !== id) return;
  currentTask = {
    ...currentTask,
    status: "error",
    error,
    finishedAt: Date.now(),
  };
  emit();
}

/**
 * 中止当前任务（用户点击"中止执行"）
 */
export function abortCurrentAITask(): void {
  if (!currentTask) return;
  try {
    currentTask.controller.abort();
  } catch {
    // ignore
  }
  currentTask = {
    ...currentTask,
    status: "aborted",
    finishedAt: Date.now(),
  };
  emit();
}

/**
 * 关闭任务弹窗（清除当前任务）
 * 仅在任务已完成/出错/中止后允许关闭
 * 运行中关闭需调用方先调 abortCurrentAITask
 */
export function clearAITask(): void {
  currentTask = null;
  emit();
}
