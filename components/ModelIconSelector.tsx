// components/ModelIconSelector.tsx
// 模型配置圆形图标横排：点击选中某个模型配置
// 数据源：listModelConfigs()（IndexedDB 异步加载）

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { listModelConfigs } from "@/lib/model-config";
import type { ModelConfig } from "@/lib/types";

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

  // 加载中：渲染空（避免布局抖动）
  if (configs === null) return null;

  // 无配置：渲染单个 + 按钮跳转 /profile
  if (configs.length === 0) {
    return (
      <div className="flex gap-1.5 items-center">
        <Link
          href="/profile"
          aria-label="添加模型配置"
          className="w-8 h-8 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-400 hover:border-gray-400 hover:text-gray-500 transition-colors"
        >
          +
        </Link>
      </div>
    );
  }

  return (
    <div className="flex gap-1.5 items-center">
      {configs.map((model) => {
        const color = PROVIDER_COLOR[model.provider] ?? PROVIDER_COLOR.custom;
        const isSelected = model.id === selectedModelId;
        const letter = model.provider.charAt(0).toUpperCase();
        return (
          <button
            key={model.id}
            type="button"
            onClick={() => onSelect(model.id)}
            aria-label={model.name}
            aria-pressed={isSelected}
            className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 transition-shadow ${
              isSelected ? "ring-2 ring-offset-1 ring-blue-500" : ""
            }`}
            style={{ backgroundColor: color }}
          >
            {letter}
          </button>
        );
      })}
    </div>
  );
}
