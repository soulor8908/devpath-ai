// app/train/page.tsx
// 训练会话页占位（Task 3 将实现完整的沉浸式训练会话）

import { Icon } from "@/components/Icon";
import { LinkButton } from "@/components/ui";

export default function TrainPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 max-w-lg mx-auto pb-20 dark:bg-gray-900 text-center">
      <Icon name="target" className="w-16 h-16 text-blue-500 mb-4" />
      <h1 className="text-2xl font-bold mb-2">训练会话即将上线</h1>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
        沉浸式学习体验正在开发中，敬请期待。
      </p>
      <LinkButton href="/" variant="primary" size="lg">
        返回首页
      </LinkButton>
    </div>
  );
}
