"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon, type IconName } from "@/components/Icon";

// 底部导航：8→5 Tab 减法（乔布斯焦点原则）
// 移除的 3 个 Tab 折叠到「今日」：
//   - 错题 → 今日「错题回顾」卡片（首页内联）
//   - 情绪 → 今日「情绪快捷记录」（首页内联）
//   - 仪表盘 → 今日底部「统计 + 热力图」（首页内联）
// 原 /mistakes /emotion /dashboard 路由保留（直接访问 URL 仍可用）
const items: Array<{ href: string; label: string; icon: IconName }> = [
  { href: "/", label: "今日", icon: "home" },
  { href: "/learn", label: "学习", icon: "book" },
  { href: "/review", label: "复习", icon: "repeat" },
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
            <span className="text-[10px] font-medium">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
