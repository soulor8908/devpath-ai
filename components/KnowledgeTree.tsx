"use client";

import { useState } from "react";
import type { KnowledgeNode } from "@/lib/types";

const DIFFICULTY_COLORS: Record<number, string> = {
  1: "bg-green-100 text-green-700",
  2: "bg-blue-100 text-blue-700",
  3: "bg-yellow-100 text-yellow-700",
  4: "bg-orange-100 text-orange-700",
  5: "bg-red-100 text-red-700",
};

const FREQ_COLORS: Record<string, string> = {
  高: "bg-red-50 text-red-600",
  中: "bg-yellow-50 text-yellow-600",
  低: "bg-gray-50 text-gray-500",
};

export function KnowledgeTree({ nodes }: { nodes: KnowledgeNode[] }) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  function toggle(id: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  // 按 difficulty 分组
  const groups: Record<number, KnowledgeNode[]> = {};
  for (const node of nodes) {
    if (!groups[node.difficulty]) groups[node.difficulty] = [];
    groups[node.difficulty].push(node);
  }
  const sortedLevels = Object.keys(groups).map(Number).sort((a, b) => a - b);

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold">知识树（{nodes.length} 个节点）</h2>
      {sortedLevels.map((level) => (
        <div key={level}>
          <p className="text-xs text-gray-400 mb-1">难度 {level}</p>
          <div className="space-y-1">
            {groups[level].map((node) => (
              <div key={node.id} className="border rounded-lg overflow-hidden">
                <button
                  onClick={() => toggle(node.id)}
                  className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-gray-50"
                >
                  <span className={`text-xs px-2 py-0.5 rounded ${DIFFICULTY_COLORS[node.difficulty]}`}>
                    D{node.difficulty}
                  </span>
                  <span className="flex-1 text-sm font-medium">{node.title}</span>
                  <span className={`text-xs px-2 py-0.5 rounded ${FREQ_COLORS[node.frequency]}`}>
                    {node.frequency}频
                  </span>
                  <span className="text-gray-400 text-xs">
                    {expanded.has(node.id) ? "▼" : "▶"}
                  </span>
                </button>
                {expanded.has(node.id) && (
                  <div className="px-3 py-2 bg-gray-50 text-sm text-gray-600">
                    <p>{node.summary}</p>
                    {node.prerequisites.length > 0 && (
                      <p className="text-xs text-gray-400 mt-1">
                        依赖：{node.prerequisites.join(", ")}
                      </p>
                    )}
                    <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full transition-all"
                        style={{ width: `${node.mastery}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-400 mt-1">掌握度：{node.mastery}%</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
