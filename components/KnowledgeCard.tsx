"use client";

// components/KnowledgeCard.tsx
// 知识来源卡片：展示单条知识索引条目（preset 节点 / doc 文档），点击进入详情。
//
// 复用场景：
//   - 聊天回答下方的「知识来源」列表（KnowledgeCardGroup）
//   - 学习详情页的「相关知识」侧栏（compact 模式）
//   - 错题本的「相关知识点」弹窗
//
// 设计遵循 AGENTS.md：
//   - 用 <Button> 包整个卡片（2.10 禁 div onClick）
//   - score 进度条带 role="progressbar"（2.6）
//   - 浅色 utility 配对 dark:（2.3）
//   - 无原生表单元素

import { Button } from "@/components/ui";
import { Icon } from "@/components/Icon";
import type { KnowledgeIndexEntry } from "@/lib/types";

export interface KnowledgeCardProps {
  /** 知识索引条目 */
  entry: KnowledgeIndexEntry;
  /** 相似度分数 0-1（可选，preset 节点无分数时不展示） */
  score?: number;
  /** 紧凑模式（侧栏用，隐藏摘要和 score） */
  compact?: boolean;
  /** 点击回调（不传则不渲染为按钮） */
  onClick?: (entry: KnowledgeIndexEntry) => void;
}

export function KnowledgeCard({ entry, score, compact, onClick }: KnowledgeCardProps) {
  const sourceLabel =
    entry.source === "preset"
      ? entry.presetName ?? "预设知识"
      : entry.docCategory ?? "产品文档";

  const card = (
    <div
      className={
        compact
          ? "w-full text-left"
          : "w-full text-left p-3"
      }
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-1.5 min-w-0">
          <Icon
            name={entry.source === "preset" ? "book" : "info"}
            className="w-3.5 h-3.5 shrink-0 text-gray-400 dark:text-gray-500"
          />
          <span className="text-xs text-gray-400 dark:text-gray-500 truncate">
            {sourceLabel}
          </span>
        </div>
        {typeof score === "number" && !compact && (
          <div
            role="progressbar"
            aria-valuenow={Math.round(score * 100)}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`匹配度 ${Math.round(score * 100)}%`}
            className="shrink-0 w-12 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden"
          >
            <div
              className="h-full bg-blue-500 dark:bg-blue-400 rounded-full"
              style={{ width: `${Math.round(score * 100)}%` }}
            />
          </div>
        )}
      </div>
      <h4 className="mt-1 text-sm font-medium text-gray-900 dark:text-gray-100 line-clamp-2">
        {entry.title}
      </h4>
      {!compact && entry.summary && (
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
          {entry.summary}
        </p>
      )}
      {!compact && entry.tags.length > 0 && (
        <div className="mt-1.5 flex flex-wrap gap-1">
          {entry.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center px-1.5 py-0.5 text-2xs bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 rounded"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );

  if (!onClick) {
    return card;
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => onClick(entry)}
      className="w-full justify-start h-auto whitespace-normal rounded-lg border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20"
    >
      {card}
    </Button>
  );
}
