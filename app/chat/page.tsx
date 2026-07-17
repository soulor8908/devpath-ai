import ChatClient from "./ChatClient";

export const runtime = "edge";

export default function Page() {
  // ChatClient 现使用 h-full 填充父容器（适配 ChatModal），
  // /chat 路由需外层提供固定全屏容器（底部留出 Nav 高度 bottom-16）
  return (
    <div className="fixed inset-0 bottom-16">
      <ChatClient />
    </div>
  );
}
