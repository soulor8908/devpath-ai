"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon, type IconName } from "@/components/Icon";

// 底部导航：8→4→2→3 Tab（乔布斯焦点原则 + V2 重构）
// V2：从 2 Tab 升级为 3 Tab，新增"训练"入口
// V3（2026-07-23 UI 重设计）：去文字、纯图标、min-h-[44px]（iOS HIG 最小触控区）
//   - 路径 Tab（原"今日"）：首页 Path 路径视图，看进度+开始训练
//   - 训练 Tab：沉浸式训练会话，学→练→复→休息一体化
//   - 我的 Tab：个人设置/模型配置/同步
//   - label 仅作 aria-label 用途（无障碍不变），不再渲染 <span>
const items: Array<{ href: string; label: string; icon: IconName }> = [
  { href: "/", label: "路径", icon: "map" },
  { href: "/train", label: "训练", icon: "target" },
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
            className={`flex items-center justify-center py-2.5 px-1 transition-colors min-h-[44px] ${
              active
                ? "text-blue-600 dark:text-blue-400"
                : "text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
            }`}
          >
            <Icon name={item.icon} className="w-[22px] h-[22px]" />
          </Link>
        );
      })}
    </nav>
  );
}
