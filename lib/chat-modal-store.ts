"use client";

// lib/chat-modal-store.ts
// 全局 ChatModal 状态管理（单例 store + 订阅模式，与 toast / ai-task-queue 一致）
//
// 设计目的（卡帕西视角）：
//   - 删除 /chat 路由后，所有"打开聊天"的入口（FloatingChatButton / QuestionCard 追问 /
//     DashboardClient 快捷入口 / 其他业务页面）需要统一通过此 store 触发弹窗
//   - 弹窗不仅能"打开"，还能携带 prefill / source 等参数（追问场景）
//   - 单例 store + subscribe 模式避免 Context re-render，且与项目其他全局 store 一致
//
// 设计目的（乔布斯视角）：
//   - 用户从任何地方点"AI 聊天"或"追问"都进入同一个聊天弹窗，认知一致
//   - 不再有"路由 vs 弹窗"两个入口造成的困惑

import type { ChatSource } from "@/lib/types";

export interface ChatModalState {
  /** 是否打开 */
  open: boolean;
  /** 预填充文本（追问场景：把题目/知识点内容塞入输入框等用户编辑后发送） */
  prefill?: string;
  /** 预填充来源信息（追问场景：标识这条对话由什么触发） */
  source?: ChatSource;
  /** 单调递增序号：每次 open 调用都递增，让 ChatClient 能识别"新一轮 prefill" */
  seq: number;
}

export type ChatModalListener = (state: ChatModalState) => void;

const initialState: ChatModalState = {
  open: false,
  seq: 0,
};

let currentState: ChatModalState = initialState;
const listeners = new Set<ChatModalListener>();

function emit(): void {
  for (const l of listeners) {
    try {
      l(currentState);
    } catch {
      // 单个监听器抛错不影响其他
    }
  }
}

/** 订阅 ChatModal 状态变化（用 useSyncExternalStore） */
export function subscribeChatModal(listener: ChatModalListener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/** 获取当前状态快照（useSyncExternalStore 的 getSnapshot） */
export function getChatModalSnapshot(): ChatModalState {
  return currentState;
}

/**
 * 服务端快照：SSR 时返回关闭状态的常量引用。
 *
 * 必须提供此函数作为 useSyncExternalStore 的第三个参数（getServerSnapshot），
 * 否则 Next.js 在 prerender /_not-found 等纯静态页面时会抛出：
 *   "Missing getServerSnapshot, which is required for server-rendered content"
 * 因为 FloatingChat 全局挂载在 layout.tsx，/_not-found 也会渲染它。
 *
 * 注意：返回的必须是稳定引用（模块级常量），不能每次返回新对象，
 * 否则 React 会判定 store 变化 → 重渲染 → 无限循环。
 */
const SERVER_SNAPSHOT: ChatModalState = { open: false, seq: 0 };

/** useSyncExternalStore 的 getServerSnapshot */
export function getChatModalServerSnapshot(): ChatModalState {
  return SERVER_SNAPSHOT;
}

export interface OpenChatOptions {
  prefill?: string;
  source?: ChatSource;
}

/**
 * 打开聊天弹窗，可携带 prefill/source（追问场景）。
 * 每次调用 seq 递增，ChatClient 通过比较 seq 知道"用户又点了一次追问"。
 */
export function openChatModal(opts?: OpenChatOptions): void {
  currentState = {
    open: true,
    prefill: opts?.prefill,
    source: opts?.source,
    seq: currentState.seq + 1,
  };
  emit();
}

/** 关闭聊天弹窗（不清空 prefill/source，避免关闭瞬间 ChatClient 状态闪烁） */
export function closeChatModal(): void {
  if (!currentState.open) return;
  currentState = { ...currentState, open: false };
  emit();
}

/**
 * 消费 prefill/source（ChatClient 接收到 prefill 后调用，清空 store 中的 prefill 避免重复消费）。
 * 保留 seq 不变，避免触发 ChatClient 重新初始化。
 */
export function consumeChatModalPrefill(): void {
  if (!currentState.prefill && !currentState.source) return;
  currentState = { ...currentState, prefill: undefined, source: undefined };
  emit();
}
