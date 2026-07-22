"use client";

// components/KnowledgeCardGroup.tsx
// 知识来源卡片组：聊天回答下方展示「📚 知识来源」标题 + 卡片列表。
// 点击任一卡片 → 打开 KnowledgeDetailModal。

import { useState } from "react";
import { Icon } from "@/components/Icon";
import { KnowledgeCard } from "./KnowledgeCard";
import { KnowledgeDetailModal } from "./KnowledgeDetailModal";
import type { KnowledgeSourceRef } from "@/lib/types";

export interface KnowledgeCardGroupProps {
  /** 该回答引用的知识来源列表 */
  sources: KnowledgeSourceRef[];
  /** 紧凑模式（聊天下方用紧凑卡片） */
  compact?: boolean;
}

export function KnowledgeCardGroup({ sources, compact }: KnowledgeCardGroupProps) {
  const [selectedEntryId, setSelectedEntryId] = useState<string | null>(null);
  const [entryMap, setEntryMap] = useState<Record<string, import("@/lib/types").KnowledgeIndexEntry>>({});

  if (!sources || sources.length === 0) return null;

  const handleClick = async (ref: KnowledgeSourceRef) => {
    // 先看缓存
    if (entryMap[ref.id]) {
      setSelectedEntryId(ref.id);
      return;
    }
    // 从索引按 id 查
    const { loadKnowledgeIndex } = await import("@/lib/knowledge/index-store");
    const index = await loadKnowledgeIndex();
    if (!index) return;
    const entry = index.entries.find((e) => e.id === ref.id);
    if (!entry) return;
    setEntryMap((prev) => ({ ...prev, [ref.id]: entry }));
    setSelectedEntryId(ref.id);
  };

  const selectedEntry = selectedEntryId ? entryMap[selectedEntryId] : null;

  return (
    <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
      <div className="flex items-center gap-1.5 mb-2">
        <Icon name="book" className="w-3.5 h-3.5 text-blue-500 dark:text-blue-400" />
        <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
          知识来源（{sources.length}）
        </span>
      </div>
      <div className="grid gap-2 sm:grid-cols-2">
        {sources.map((ref) => (
          <KnowledgeCard
            key={ref.id}
            entry={
              entryMap[ref.id] ?? {
                // 占位：从 ref 构造最小 entry 供卡片渲染标题/来源
                id: ref.id,
                source: ref.source,
                title: ref.title,
                summary: "",
                searchText: "",
                vector: [],
                href: ref.source === "doc" ? "/docs" : "",
                tags: [],
              }
            }
            score={ref.score}
            compact={compact}
            onClick={() => handleClick(ref)}
          />
        ))}
      </div>
      {selectedEntry && (
        <KnowledgeDetailModal
          entry={selectedEntry}
          onClose={() => setSelectedEntryId(null)}
        />
      )}
    </div>
  );
}
