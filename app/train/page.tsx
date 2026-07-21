// app/train/page.tsx
// 训练会话入口——Suspense 包装（TrainClient 使用 useEffect 等客户端 API）

import { Suspense } from "react";
import TrainClient from "./TrainClient";

export default function TrainPage() {
  return (
    <Suspense fallback={<div className="min-h-screen p-4 dark:bg-gray-900 text-sm text-gray-500 dark:text-gray-400">加载中...</div>}>
      <TrainClient />
    </Suspense>
  );
}
