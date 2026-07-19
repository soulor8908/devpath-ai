// components/ModelIconSelector.tsx
// 模型选择弹窗：点击当前模型图标，在上方弹出可滚动的模型列表
// 复用 QuickShortcuts 的弹窗模式（open 状态 + containerRef + ESC/外部点击关闭）
// 数据源：listModelConfigs()（IndexedDB 异步加载）

"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { listModelConfigs } from "@/lib/model-config";
import type { ModelConfig } from "@/lib/types";
import { Icon } from "@/components/Icon";
import { Button } from "@/components/ui";

interface ModelIconSelectorProps {
  selectedModelId: string | null;
  onSelect: (modelId: string) => void;
}

/** 提供商品牌色映射 */
const PROVIDER_COLOR: Record<ModelConfig["provider"], string> = {
  glm: "#3b82f6",
  deepseek: "#10b981",
  mimo: "#f59e0b",
  kimi: "#8b5cf6",
  custom: "#6b7280",
};

export function ModelIconSelector({ selectedModelId, onSelect }: ModelIconSelectorProps) {
  const [configs, setConfigs] = useState<ModelConfig[] | null>(null);
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    listModelConfigs()
      .then((list) => {
        if (!cancelled) setConfigs(list);
      })
      .catch(() => {
        if (!cancelled) setConfigs([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

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

  const handleSelect = (modelId: string) => {
    onSelect(modelId);
    setOpen(false);
  };

  // 加载中：渲染空（避免布局抖动）
  if (configs === null) return null;

  // 无配置：渲染单个 + 按钮跳转 /profile
  if (configs.length === 0) {
    return (
      <Link
        href="/profile"
        aria-label="添加模型配置"
        className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
      >
        <Icon name="plus" className="w-4 h-4" />
      </Link>
    );
  }

  // 找到当前选中的模型，用于触发按钮展示
  const selectedModel = configs.find((c) => c.id === selectedModelId);
  const triggerColor = selectedModel
    ? PROVIDER_COLOR[selectedModel.provider] ?? PROVIDER_COLOR.custom
    : undefined;
  const triggerLetter = selectedModel
    ? selectedModel.provider.charAt(0).toUpperCase()
    : null;

  return (
    <div ref={containerRef} className="relative">
      {/* 触发按钮：展示当前选中模型图标，未选中则展示 + */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setOpen(!open)}
        aria-label="选择模型"
        aria-expanded={open}
        className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors shrink-0 ${
          triggerColor
            ? "hover:opacity-90"
            : "bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700"
        }`}
        style={triggerColor ? { backgroundColor: triggerColor } : undefined}
      >
        {triggerLetter ? (
          <span className="text-white text-xs font-bold">{triggerLetter}</span>
        ) : (
          <Icon name="plus" className="w-4 h-4 text-gray-400" />
        )}
      </Button>

      {/* 弹出列表：定位在按钮上方，可滚动 */}
      {open && (
        <div className="absolute bottom-full left-0 mb-2 w-48 max-h-[60vh] overflow-y-auto bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-2 z-50">
          {configs.map((model) => {
            const color = PROVIDER_COLOR[model.provider] ?? PROVIDER_COLOR.custom;
            const isSelected = model.id === selectedModelId;
            const letter = model.provider.charAt(0).toUpperCase();
            return (
              <Button
                key={model.id}
                variant="ghost"
                size="sm"
                onClick={() => handleSelect(model.id)}
                aria-label={model.name}
                aria-pressed={isSelected}
                className="w-full flex items-center gap-2 px-2 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer text-sm text-left text-gray-700 dark:text-gray-200"
              >
                <span
                  className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
                  style={{ backgroundColor: color }}
                >
                  {letter}
                </span>
                <span className="flex-1 truncate">{model.name}</span>
                {isSelected && (
                  <Icon name="check" className="w-4 h-4 text-blue-500 shrink-0" />
                )}
              </Button>
            );
          })}
        </div>
      )}
    </div>
  );
}
