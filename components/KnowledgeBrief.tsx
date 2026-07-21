"use client";

// components/KnowledgeBrief.tsx
// 知识点讲解——学习阶段核心组件
//
// 设计（乔布斯视角 V2 修正）：
//   - 原版只显示 node.summary 一句话，用户没学到东西就被要求"测一测"
//   - 新版：显示知识点摘要 + 关联题目的答案作为学习材料
//   - 让用户先看答案学习，再进入测试
//   - 关键记忆点高亮

import type { KnowledgeNode, Question } from "@/lib/types";
import { Icon } from "@/components/Icon";
import { Button } from "@/components/ui";

interface KnowledgeBriefProps {
  node: KnowledgeNode;
  /** 关联题目（可选）——其答案作为学习材料展示 */
  question?: Question | null;
  onLearned: () => void;
}

export function KnowledgeBrief({ node, question, onLearned }: KnowledgeBriefProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700">
      {/* 标题 */}
      <div className="flex items-center gap-2 mb-3">
        <Icon name="book" className="w-4 h-4 text-blue-500" />
        <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">{node.title}</h2>
      </div>

      {/* 知识点摘要 */}
      {node.summary && (
        <div className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
          {node.summary}
        </div>
      )}

      {/* 关键信息标签 */}
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
        {node.difficulty && (
          <span className="text-xs px-2 py-0.5 rounded bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-400">
            难度：{"★".repeat(node.difficulty)}
          </span>
        )}
      </div>

      {/* 学习材料：关联题目的答案 */}
      {question && (
        <div className="bg-blue-50 dark:bg-blue-950/30 rounded-xl p-4 mb-4 border border-blue-100 dark:border-blue-900">
          <div className="flex items-center gap-1.5 mb-2">
            <Icon name="lightbulb" className="w-4 h-4 text-blue-500" />
            <p className="text-xs font-medium text-blue-600 dark:text-blue-400">学习材料</p>
          </div>
          {/* 题目 */}
          <p className="text-sm font-medium text-gray-800 dark:text-gray-200 mb-2">
            {question.question}
          </p>
          {/* 答案（完整展示作为学习内容） */}
          <div className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
            {question.answer}
          </div>
          {/* 关键点 */}
          {question.keyPoints && question.keyPoints.length > 0 && (
            <div className="mt-3 pt-3 border-t border-blue-100 dark:border-blue-900">
              <p className="text-xs font-medium text-blue-600 dark:text-blue-400 mb-1">💡 关键记忆点</p>
              <ul className="space-y-1">
                {question.keyPoints.map((point, i) => (
                  <li key={i} className="text-xs text-gray-600 dark:text-gray-400 flex items-start gap-1.5">
                    <span className="text-blue-400 mt-0.5">•</span>
                    {point}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* 无学习材料时的提示 */}
      {!question && (
        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3 mb-4">
          <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
            {node.summary ? "准备好后就进入测试" : "这个知识点暂无详细讲解，直接进入测试"}
          </p>
        </div>
      )}

      <Button variant="primary" block onClick={onLearned} leftIcon="check">
        学会了，进入测试
      </Button>
    </div>
  );
}
