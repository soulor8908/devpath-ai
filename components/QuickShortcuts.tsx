// components/QuickShortcuts.tsx
// 快捷指令弹窗：点击图标按钮，在上方弹出可滚动的列表
// 上半区「常用」为通用提示词，下半区「AI 工具」按分类展示工具的快捷指令
// 消费 TOOL_REGISTRY（单一事实源），新增工具自动出现在此

"use client";

import { useState, useEffect, useRef } from "react";
import { TOOL_CATEGORIES, getToolsByCategory } from "@/lib/ai/tool-registry";
import { Icon } from "@/components/Icon";

// 本组件使用的内置常用提示词（与 ChatClient 中的 BUILTIN_PROMPTS 内容一致）
const COMMON_PROMPTS = [
  "详细解释这个概念",
  "给出代码示例",
  "对比优缺点",
  "面试中怎么回答",
  "常见误区有哪些",
];

interface QuickShortcutsProps {
  onSelect: (prompt: string) => void;
}

export function QuickShortcuts({ onSelect }: QuickShortcutsProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // 点击外部关闭 + ESC 关闭
  useEffect(() => {
    if (!open) return;
    const handleMouseDown = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", handleMouseDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleMouseDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  const handleSelect = (prompt: string) => {
    onSelect(prompt);
    setOpen(false);
  };

  return (
    <div ref={containerRef} className="relative">
      {/* 触发按钮 */}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-label="快捷指令"
        aria-expanded={open}
        className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
      >
        <Icon name="zap" className="w-4 h-4 text-gray-600 dark:text-gray-300" />
      </button>

      {/* 弹出列表：定位在按钮上方，可滚动 */}
      {open && (
        <div className="absolute bottom-full left-0 mb-2 w-72 max-h-[60vh] overflow-y-auto bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-2 z-50">
          {/* Section 1: 常用 */}
          <div className="text-xs text-gray-400 font-medium px-2 py-1">常用</div>
          {COMMON_PROMPTS.map((prompt) => (
            <button
              key={prompt}
              type="button"
              onClick={() => handleSelect(prompt)}
              className="w-full flex items-center gap-2 px-2 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer text-sm text-left text-gray-700 dark:text-gray-200"
            >
              <Icon
                name="message-circle"
                className="w-4 h-4 text-gray-400 shrink-0"
              />
              <span>{prompt}</span>
            </button>
          ))}

          {/* 分隔线 */}
          <div className="h-px bg-gray-200 dark:bg-gray-700 my-1" />

          {/* Section 2: AI 工具（按分类分组） */}
          <div className="text-xs text-gray-400 font-medium px-2 py-1">AI 工具</div>
          {TOOL_CATEGORIES.map((cat) => {
            const tools = getToolsByCategory(cat.id);
            if (tools.length === 0) return null;
            return (
              <div key={cat.id}>
                <div className="text-xs text-gray-400 px-2 py-1 flex items-center gap-1">
                  <Icon name={cat.icon} className="w-3.5 h-3.5" />
                  {cat.label}
                </div>
                {tools.map((tool) =>
                  tool.quickPrompts.map((qp, idx) => (
                    <button
                      key={`${tool.name}-${idx}`}
                      type="button"
                      onClick={() => handleSelect(qp)}
                      className="w-full flex items-center gap-2 px-2 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer text-sm text-left text-gray-700 dark:text-gray-200"
                    >
                      <Icon
                        name={tool.icon}
                        className="w-4 h-4 text-gray-400 shrink-0"
                      />
                      <span>{qp}</span>
                    </button>
                  ))
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
