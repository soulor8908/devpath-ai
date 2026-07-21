// app/interview/page.tsx
// AI 模拟面试入口
//
// 设计（卡帕西视角）：
//   - useSearchParams 必须在 Suspense 内使用（Next.js 15 App Router 强制要求）
//   - page.tsx 仅做路由级懒加载边界，业务逻辑在 InterviewClient.tsx

import { Suspense } from "react";
import InterviewClient from "./InterviewClient";

export default function InterviewPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen p-4 dark:bg-gray-900 text-sm text-gray-500 dark:text-gray-400">
          加载中...
        </div>
      }
    >
      <InterviewClient />
    </Suspense>
  );
}
