"use client";

// components/FloatingChat.tsx
// 全局浮动聊天入口：FloatingChatButton（常驻）+ ChatModal（按需挂载 ChatClient）
// 作为客户端组件岛嵌入根 layout（layout 本身保持 server component）
//
// 状态管理（卡帕西视角）：
//   - 删除 /chat 路由后，所有"打开聊天"的入口（FloatingChatButton / QuestionCard 追问 /
//     DashboardClient 快捷入口）都通过 lib/chat-modal-store 全局 store 触发
//   - 本组件用 useSyncExternalStore 订阅 store，store 中 open=true 时挂载 ChatClient
//   - prefill / source 通过 props 传给 ChatClient（替代旧的 URL searchParams）

import { Suspense, useCallback } from "react";
import { useSyncExternalStore } from "react";
import { FloatingChatButton } from "@/components/FloatingChatButton";
import { ChatModal } from "@/components/ChatModal";
import ChatClient from "@/components/ChatClient";
import {
  subscribeChatModal,
  getChatModalSnapshot,
  closeChatModal,
  consumeChatModalPrefill,
  openChatModal,
} from "@/lib/chat-modal-store";

export function FloatingChat() {
  // 订阅全局 chat modal store（与 toast / ai-task-queue 同模式）
  const state = useSyncExternalStore(subscribeChatModal, getChatModalSnapshot);

  const handleClose = useCallback(() => {
    closeChatModal();
  }, []);

  // 浮动按钮点击：通过 store 打开（不携带 prefill，普通入口）
  const handleOpen = useCallback(() => {
    openChatModal();
  }, []);

  // ChatClient 消费完 prefill 后调此函数清空 store 中的 prefill/source
  // （避免关闭重开后重复消费；保留 open=true 和 seq 不变）
  const handlePrefillConsumed = useCallback(() => {
    consumeChatModalPrefill();
  }, []);

  return (
    <>
      {/* 常驻浮动按钮（自身 fixed 定位，点击触发 openChatModal） */}
      <FloatingChatButton onOpen={handleOpen} />

      {/* 模态容器：open=false 时返回 null，ChatClient 不会挂载 */}
      <ChatModal open={state.open} onClose={handleClose}>
        {/* ChatClient 内部已不再使用 useSearchParams，无需 Suspense 包裹；
            但保留 Suspense 作为 lazy 加载的兼容兜底 */}
        <Suspense fallback={<div className="flex-1 flex items-center justify-center text-gray-400">加载中...</div>}>
          <ChatClient
            prefill={state.prefill}
            source={state.source}
            prefillSeq={state.seq}
            onPrefillConsumed={handlePrefillConsumed}
          />
        </Suspense>
      </ChatModal>
    </>
  );
}
