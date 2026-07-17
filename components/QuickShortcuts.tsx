// components/QuickShortcuts.tsx
// AI 工具快捷指令横向滚动条：点击把首条 quickPrompt 填入输入框（不自动发送）
// 消费 TOOL_REGISTRY（单一事实源），新增工具自动出现在此条

"use client";

import { TOOL_REGISTRY } from "@/lib/ai/tool-registry";
import { Icon } from "@/components/Icon";

interface QuickShortcutsProps {
  onSelect: (prompt: string) => void;
}

/** 截断到 8 个字符，超出加省略号 */
function truncate(text: string, max = 8): string {
  return text.length > max ? text.slice(0, max) + "…" : text;
}

export function QuickShortcuts({ onSelect }: QuickShortcutsProps) {
  return (
    <div
      className="flex gap-2 overflow-x-auto pb-1 touch-pan-x"
      style={{ scrollbarWidth: "none" }}
    >
      <style jsx>{`
        div::-webkit-scrollbar {
          display: none;
        }
      `}</style>
      {TOOL_REGISTRY.map((tool) => {
        const prompt = tool.quickPrompts[0] ?? "";
        return (
          <button
            key={tool.name}
            type="button"
            onClick={() => onSelect(prompt)}
            className="shrink-0 px-3 py-1.5 bg-gray-100 dark:bg-gray-800 rounded-full text-xs whitespace-nowrap hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors flex items-center gap-1"
          >
            <Icon name={tool.icon} className="w-3 h-3 shrink-0" />
            <span>{truncate(prompt)}</span>
          </button>
        );
      })}
    </div>
  );
}
