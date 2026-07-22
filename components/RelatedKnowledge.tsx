"use client";

// components/RelatedKnowledge.tsx
// 相关知识面板：学习详情页选中某个知识点节点后，
// 自动检索知识库中与之语义相关的其他知识（preset 节点 / doc 文档），
// 点击任一卡片打开 KnowledgeDetailModal 进入学习详情。
//
// 设计遵循 AGENTS.md：
//   - 用 <Button> 包卡片（KnowledgeCard 已处理 2.10）
//   - 浅色 utility 配对 dark:（2.3）
//   - 无原生表单元素（2.1）
//   - 加载/失败状态用 EmptyState 风格的灰字提示，不引入原生 element
//
// 检索策略：
//   - query = node.title + " " + node.summary（中英混合，bge-base 可处理）
//   - topK = 4（侧栏空间有限）
//   - 排除当前节点自身（按 title 去重，避免展示用户正在看的同一条）

import { useEffect, useState } from "react";
import { Icon } from "@/components/Icon";
import { KnowledgeCard } from "./KnowledgeCard";
import { KnowledgeDetailModal } from "./KnowledgeDetailModal";
import { retrieveKnowledge } from "@/lib/knowledge/search";
import type { KnowledgeIndexEntry, KnowledgeNode } from "@/lib/types";

export interface RelatedKnowledgeProps {
  /** 当前选中的知识点节点（用于排除自身 + 兜底 query） */
  node: KnowledgeNode;
  /**
   * 自定义检索 query（可选）。
   * 默认用 `node.title + " " + node.summary`；
   * 错题本场景传入题目原文（questionText），召回更精准的相关知识。
   */
  query?: string;
}

interface RelatedState {
  loading: boolean;
  entries: Array<{ entry: KnowledgeIndexEntry; score: number }>;
  error: boolean;
}

export function RelatedKnowledge({ node, query: queryOverride }: RelatedKnowledgeProps) {
  const [state, setState] = useState<RelatedState>({
    loading: true,
    entries: [],
    error: false,
  });
  const [selectedEntry, setSelectedEntry] = useState<KnowledgeIndexEntry | null>(null);

  // 实际检索 query：优先用外部传入（如错题原文），否则用节点 title+summary
  const query = (queryOverride ?? `${node.title} ${node.summary}`).trim();

  useEffect(() => {
    let cancelled = false;
    setState({ loading: true, entries: [], error: false });
    (async () => {
      try {
        if (!query) {
          setState({ loading: false, entries: [], error: false });
          return;
        }
        const result = await retrieveKnowledge(query, { topK: 5 });
        if (cancelled) return;
        // 过滤掉当前节点自身（按 title 去重，避免展示用户正在看的同一条）
        const filtered = result.entries.filter((r) => r.entry.title !== node.title);
        setState({ loading: false, entries: filtered, error: false });
      } catch {
        if (!cancelled) {
          setState({ loading: false, entries: [], error: true });
        }
      }
    })();
    return () => {
      cancelled = true;
    };
    // query 通过 node.id/node.title/node.summary + queryOverride 派生，
    // 这里依赖 node 字段 + queryOverride 字符串本身保证重新检索
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [node.id, node.title, node.summary, queryOverride]);

  return (
    <div className="mb-6 p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
      <div className="flex items-center gap-1.5 mb-2">
        <Icon name="book" className="w-3.5 h-3.5 text-blue-500 dark:text-blue-400" />
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-200">
          相关知识
        </h3>
        <span className="text-2xs text-gray-400 dark:text-gray-500">
          基于当前节点语义检索
        </span>
      </div>

      {state.loading ? (
        <p className="text-xs text-gray-400 dark:text-gray-500 py-2">检索中...</p>
      ) : state.error ? (
        <p className="text-xs text-gray-400 dark:text-gray-500 py-2">
          检索失败，稍后再试
        </p>
      ) : state.entries.length === 0 ? (
        <p className="text-xs text-gray-400 dark:text-gray-500 py-2">
          暂无相关知识
        </p>
      ) : (
        <div className="grid gap-2 sm:grid-cols-2">
          {state.entries.slice(0, 4).map(({ entry, score }) => (
            <KnowledgeCard
              key={entry.id}
              entry={entry}
              score={score}
              compact
              onClick={(e) => setSelectedEntry(e)}
            />
          ))}
        </div>
      )}

      {selectedEntry && (
        <KnowledgeDetailModal
          entry={selectedEntry}
          onClose={() => setSelectedEntry(null)}
          onNavigate={(e) => setSelectedEntry(e)}
        />
      )}
    </div>
  );
}
