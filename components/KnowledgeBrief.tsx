"use client";

// components/KnowledgeBrief.tsx
// 知识点简洁讲解——极简版，3段以内
//
// 设计（乔布斯视角）：
//   - 一个知识点卡片只讲1个核心概念
//   - 关键记忆点高亮
//   - 不超过一屏

import type { KnowledgeNode } from "@/lib/types";
import { Icon } from "@/components/Icon";
import { Button } from "@/components/ui";

interface KnowledgeBriefProps {
  node: KnowledgeNode;
  onLearned: () => void;
}

export function KnowledgeBrief({ node, onLearned }: KnowledgeBriefProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700">
      <div className="flex items-center gap-2 mb-3">
        <Icon name="book" className="w-4 h-4 text-blue-500" />
        <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">{node.title}</h2>
      </div>

      {/* 知识点讲解——简洁版 */}
      <div className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
        {node.summary || "暂无讲解"}
      </div>

      {/* 关键信息 */}
      <div className="flex flex-wrap gap-2 mb-4">
        {node.frequency && (
          <span className="text-xs px-2 py-0.5 rounded bg-red-50 dark:bg-red-950 text-red-600 dark:text-red-400">
            面试频率：{node.frequency}
          </span>
        )}
        {node.bigTech && (
          <span className="text-xs px-2 py-0.5 rounded bg-purple-50 dark:bg-purple-950 text-purple-600 dark:text-purple-400">
            大厂高频
          </span>
        )}
      </div>

      <Button variant="primary" block onClick={onLearned} leftIcon="check">
        我学会了，测一测
      </Button>
    </div>
  );
}
