"use client";

// components/FloatingChat.tsx
// 全局浮动聊天入口：FloatingChatButton（常驻）+ ChatModal（按需挂载 ChatClient）
// 作为客户端组件岛嵌入根 layout（layout 本身保持 server component）

import { Suspense, useState } from "react";
import { FloatingChatButton } from "@/components/FloatingChatButton";
import { ChatModal } from "@/components/ChatModal";
import ChatClient from "@/app/chat/ChatClient";

export function FloatingChat() {
  const [chatOpen, setChatOpen] = useState(false);

  return (
    <>
      {/* 常驻浮动按钮（自身 fixed 定位） */}
      <FloatingChatButton onOpen={() => setChatOpen(true)} />

      {/* 模态容器：open=false 时返回 null，ChatClient 不会挂载 */}
      <ChatModal open={chatOpen} onClose={() => setChatOpen(false)}>
        {/* ChatClient 内部使用 useSearchParams，包一层 Suspense 以兼容静态预渲染 */}
        <Suspense fallback={<div className="flex-1 flex items-center justify-center text-gray-400">加载中...</div>}>
          <ChatClient />
        </Suspense>
      </ChatModal>
    </>
  );
}
