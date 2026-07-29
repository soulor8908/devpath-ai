"use client";

// components/FloatingChat.tsx
// 全局浮动聊天入口：FloatingChatButton（常驻）+ ChatModal（按需挂载 ChatClient）
// 作为客户端组件岛嵌入根 layout（layout 本身保持 server component）
//
// 性能优化（2026-07-29）：ChatClient 拆为独立 chunk，点击图标后才加载
//   - FloatingChatButton + ChatModal 是轻量组件（~340 行），随首页 chunk 加载
//   - ChatClient 是重组件（~1800 行，含 KnowledgeCardGroup / QuickShortcuts /
//     ModelIconSelector / ModelConfigModal / AnswerContent / tool-registry /
//     chat-store / knowledge/search / chat-context / chat-tools 等）
//   - 改为 dynamic import + 条件渲染：open=false 时不渲染 ChatClient，不触发 chunk 加载
//   - 用户点击悬浮图标 → open=true → ChatClient chunk 开始加载 → 显示 loading 占位
//
// 状态管理（卡帕西视角）：
//   - 删除 /chat 路由后，所有"打开聊天"的入口（FloatingChatButton / QuestionCard 追问 /
//     DashboardClient 快捷入口）都通过 lib/chat-modal-store 全局 store 触发
//   - 本组件用 useSyncExternalStore 订阅 store，store 中 open=true 时挂载 ChatClient
//   - prefill / source 通过 props 传给 ChatClient（替代旧的 URL searchParams）

import { Suspense, useCallback } from "react";
import { useSyncExternalStore } from "react";
import dynamic from "next/dynamic";
import { FloatingChatButton } from "@/components/FloatingChatButton";
import { ChatModal } from "@/components/ChatModal";
import {
  subscribeChatModal,
  getChatModalSnapshot,
  getChatModalServerSnapshot,
  closeChatModal,
  consumeChatModalPrefill,
  openChatModal,
} from "@/lib/chat-modal-store";

// ChatClient 是重组件（~1800 行 + 大量依赖），拆为独立 chunk
// ssr: false 因为 ChatClient 依赖 IndexedDB / localStorage 等浏览器 API
const ChatClient = dynamic(() => import("@/components/ChatClient"), {
  ssr: false,
  loading: () => (
    <div className="flex-1 flex items-center justify-center text-gray-500 dark:text-gray-400 text-sm">
      加载中...
    </div>
  ),
});

export function FloatingChat() {
  // 订阅全局 chat modal store（与 toast / ai-task-queue 同模式）
  // 第三个参数 getServerSnapshot 必传：FloatingChat 全局挂载在 layout.tsx，
  // /_not-found 等静态页面 prerender 时也会渲染本组件，缺此参数会导致构建失败
  const state = useSyncExternalStore(
    subscribeChatModal,
    getChatModalSnapshot,
    getChatModalServerSnapshot,
  );

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
        {/* open=false 时不渲染 ChatClient，避免触发 dynamic chunk 加载
            Suspense 包裹是 dynamic import 的兼容兜底 */}
        {state.open && (
          <Suspense
            fallback={
              <div className="flex-1 flex items-center justify-center text-gray-500 dark:text-gray-400 text-sm">
                加载中...
              </div>
            }
          >
            <ChatClient
              prefill={state.prefill}
              source={state.source}
              prefillSeq={state.seq}
              onPrefillConsumed={handlePrefillConsumed}
            />
          </Suspense>
        )}
      </ChatModal>
    </>
  );
}
