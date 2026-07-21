"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon, type IconName } from "@/components/Icon";

// 底部导航：8→4→2 Tab 减法（乔布斯焦点原则）
// 第 3 阶段：学习/复习合并到「今日」首页（studyQueue 智能排序），不再单独占 Tab。
//   - 学习/复习入口改为首页"今日学习队列"项内联点击 → 跳 /learn /review 子页面
//   - 「今日」Tab 承担：当前任务 / 学习队列 / 情绪 / 错题 / 热力图
//   - 「我的」Tab 承担：个人设置 / 模型配置 / 同步
// 原 /learn /review /mistakes /emotion /dashboard 路由保留（直接访问 URL 仍可用）
const items: Array<{ href: string; label: string; icon: IconName }> = [
  { href: "/", label: "今日", icon: "home" },
  { href: "/profile", label: "我的", icon: "user" },
];

export function Nav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="主导航"
      className="fixed bottom-0 left-0 right-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur-lg border-t border-gray-200 dark:border-gray-800 flex justify-around z-50 pb-[env(safe-area-inset-bottom)]"
    >
      {items.map((item) => {
        const active =
          pathname === item.href ||
          (item.href !== "/" && pathname.startsWith(item.href));
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-label={item.label}
            aria-current={active ? "page" : undefined}
            className={`flex flex-col items-center gap-0.5 py-2 px-1 transition-colors ${
              active
                ? "text-blue-600 dark:text-blue-400"
                : "text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
            }`}
          >
            <Icon name={item.icon} className="w-[22px] h-[22px]" />
            <span className="text-2xs font-medium">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
