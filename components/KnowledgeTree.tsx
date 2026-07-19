"use client";

// components/KnowledgeTree.tsx
// 知识树列表组件（按难度分组的折叠列表）
//
// 设计（乔布斯视角）：
//   - 每个节点是一个可折叠卡片，点击标题区展开/收起详情
//   - 标题区右侧有"进入学习"小按钮，点击触发 onSelectNode（与展开区分）
//   - 展开后显示：summary / 依赖 / 掌握度 / 学习反馈按钮（标记掌握 / 需要加强）
//   - 已掌握节点显示绿色 ✓ 标识，需要加强显示橙色 ⚠ 标识
//
// 设计（卡帕西视角）：
//   - 仍按 difficulty 分组（1-5 级从易到难）
//   - onSelectNode 可选，未传时不显示进入按钮
//   - selectedNodeId 用于高亮当前选中的节点
//   - onMarkMastered / onMarkNeedsReinforce 可选，未传时不显示反馈按钮
//   - mastery 仍直接读 node.mastery（plan 已同步派生值），无需在本组件计算

import { useState } from "react";
import type { KnowledgeNode } from "@/lib/types";
import { Button } from "@/components/ui";

interface KnowledgeTreeProps {
  nodes: KnowledgeNode[];
  /** 节点点击回调（与展开/收起区分） */
  onSelectNode?: (node: KnowledgeNode) => void;
  /** 当前选中节点 id（高亮显示） */
  selectedNodeId?: string;
  /** 是否显示"进入学习"按钮（仅在传了 onSelectNode 时生效） */
  showEnterButton?: boolean;
  /** 标记 / 取消标记节点为"已掌握" */
  onMarkMastered?: (node: KnowledgeNode, mastered: boolean) => void;
  /** 标记 / 取消标记节点为"需要加强" */
  onMarkNeedsReinforce?: (node: KnowledgeNode, needsReinforce: boolean) => void;
}

const DIFFICULTY_COLORS: Record<number, string> = {
  1: "bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-300",
  2: "bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300",
  3: "bg-yellow-100 dark:bg-yellow-950 text-yellow-700 dark:text-yellow-300",
  4: "bg-orange-100 dark:bg-orange-950 text-orange-700 dark:text-orange-300",
  5: "bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300",
};

const DIFFICULTY_LABELS: Record<number, string> = {
  1: "入门",
  2: "基础",
  3: "进阶",
  4: "高级",
  5: "专家",
};

const FREQ_COLORS: Record<string, string> = {
  高: "bg-red-50 dark:bg-red-950 text-red-600 dark:text-red-400",
  中: "bg-yellow-50 dark:bg-yellow-950 text-yellow-600 dark:text-yellow-400",
  低: "bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400",
};

export function KnowledgeTree({
  nodes,
  onSelectNode,
  selectedNodeId,
  showEnterButton = true,
  onMarkMastered,
  onMarkNeedsReinforce,
}: KnowledgeTreeProps) {
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
      <p className="text-xs text-gray-400">
        {onSelectNode
          ? "点击节点标题展开详情，点「进入」筛选该知识点的题目"
          : "点击节点标题展开/收起详情"}
        {onMarkMastered && "，展开后可标记掌握状态"}
      </p>
      {sortedLevels.map((level) => (
        <div key={level}>
          <p className="text-xs text-gray-400 mb-1">
            难度 {level} · {DIFFICULTY_LABELS[level]}
          </p>
          <div className="space-y-1">
            {groups[level].map((node) => {
              const isSelected = selectedNodeId === node.id;
              const isMastered = node.mastered === true;
              const needsReinforce = node.needsReinforce === true;
              return (
                <div
                  key={node.id}
                  className={`border rounded-lg overflow-hidden transition-colors ${
                    isSelected
                      ? "border-blue-500 ring-1 ring-blue-500/20"
                      : isMastered
                      ? "border-green-300 bg-green-50/40"
                      : needsReinforce
                      ? "border-orange-300 bg-orange-50/40"
                      : ""
                  }`}
                >
                  <div className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-800">
                    <span
                      className={`text-xs px-2 py-0.5 rounded ${DIFFICULTY_COLORS[node.difficulty]}`}
                    >
                      D{node.difficulty}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggle(node.id)}
                      className="flex-1 justify-start text-sm font-medium text-left"
                    >
                      {node.title}
                    </Button>
                    {/* 状态标识：已掌握 / 需加强 */}
                    {isMastered && (
                      <span
                        className="text-xs px-1.5 py-0.5 rounded bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-300"
                        title="已掌握"
                      >
                        ✓ 掌握
                      </span>
                    )}
                    {needsReinforce && (
                      <span
                        className="text-xs px-1.5 py-0.5 rounded bg-orange-100 dark:bg-orange-950 text-orange-700 dark:text-orange-300"
                        title="需要加强"
                      >
                        ⚠ 加强
                      </span>
                    )}
                    <span
                      className={`text-xs px-2 py-0.5 rounded ${FREQ_COLORS[node.frequency]}`}
                    >
                      {node.frequency}频
                    </span>
                    {node.bigTech && (
                      <span className="text-xs px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300">
                        大厂
                      </span>
                    )}
                    {onSelectNode && showEnterButton && (
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectNode(node);
                        }}
                        title="筛选该知识点的题目"
                      >
                        进入
                      </Button>
                    )}
                    <Button
                      iconOnly
                      variant="ghost"
                      size="sm"
                      onClick={() => toggle(node.id)}
                      aria-label={expanded.has(node.id) ? "收起" : "展开"}
                      className="text-gray-400"
                    >
                      {expanded.has(node.id) ? "▼" : "▶"}
                    </Button>
                  </div>
                  {expanded.has(node.id) && (
                    <div className="px-3 py-2 bg-gray-50 dark:bg-gray-800/50 text-sm text-gray-600 dark:text-gray-300">
                      <p>{node.summary}</p>
                      {node.prerequisites.length > 0 && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          依赖：{node.prerequisites.join(", ")}
                        </p>
                      )}
                      <div
                        role="progressbar"
                        aria-valuenow={isMastered ? 100 : node.mastery}
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-label={`${node.title} 掌握度 ${isMastered ? 100 : node.mastery}%`}
                        className="mt-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2"
                      >
                        <div
                          className={`h-2 rounded-full transition-all ${
                            isMastered
                              ? "bg-green-500"
                              : needsReinforce
                              ? "bg-orange-500"
                              : "bg-blue-500"
                          }`}
                          style={{ width: `${isMastered ? 100 : node.mastery}%` }}
                        />
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        掌握度：{isMastered ? 100 : node.mastery}%
                      </p>
                      {/* 学习反馈按钮：标记掌握 / 需要加强 */}
                      {onMarkMastered && (
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          <Button
                            variant="success"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              onMarkMastered(node, !isMastered);
                            }}
                            title={isMastered ? "取消掌握标记" : "标记为已掌握"}
                          >
                            {isMastered ? "✓ 已掌握" : "标记掌握"}
                          </Button>
                          {onMarkNeedsReinforce && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                onMarkNeedsReinforce(node, !needsReinforce);
                              }}
                              title={
                                needsReinforce
                                  ? "取消加强标记"
                                  : "标记为需要加强（薄弱点）"
                              }
                            >
                              {needsReinforce ? "⚠ 加强中" : "需要加强"}
                            </Button>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
