"use client";

// components/KnowledgeDetailModal.tsx
// 知识详情 Modal（「学习详情」）：展示知识索引条目完整信息 + 跳转 CTA。
//
// 入口：
//   - KnowledgeCardGroup 点击卡片
//   - RelatedKnowledge 侧栏点击
//   - 错题本「相关知识点」点击
//
// CTA 策略：
//   - preset 节点：「导入「{presetName}」学习计划」→ 跳 /learn/new?topic=<preset.topic>
//     （复用现有预设导入流程，避免重复实现）
//   - doc 节点：「阅读完整文档」→ 跳 /docs#<id>
//
// 设计遵循 AGENTS.md：
//   - 用统一 <Modal>（2.4 禁手写 div 模态）
//   - 难度星用 <Icon name="star">（2.9 禁 emoji 当功能图标）
//   - 浅色 utility 配对 dark:（2.3）

import { useRouter } from "next/navigation";
import { Modal, Button } from "@/components/ui";
import { Icon } from "@/components/Icon";
import { getPresetById } from "@/lib/presets";
import type { KnowledgeIndexEntry } from "@/lib/types";

export interface KnowledgeDetailModalProps {
  /** 要展示的条目（null 时关闭） */
  entry: KnowledgeIndexEntry | null;
  onClose: () => void;
  /** 切换到另一条目（prereq 链点击用，可选） */
  onNavigate?: (entry: KnowledgeIndexEntry) => void;
}

export function KnowledgeDetailModal({ entry, onClose, onNavigate }: KnowledgeDetailModalProps) {
  const router = useRouter();
  if (!entry) return null;

  const isPreset = entry.source === "preset";
  const preset = isPreset && entry.presetId ? getPresetById(entry.presetId) : undefined;

  const handleImportPreset = () => {
    if (preset) {
      // 跳转到新建学习页，预填 preset 的 topic（matchPresetByTopic 会匹配上）
      router.push(`/learn/new?topic=${encodeURIComponent(preset.topic)}`);
    }
    onClose();
  };

  const handleReadDoc = () => {
    if (entry.href) {
      router.push(entry.href);
    }
    onClose();
  };

  return (
    <Modal
      open={!!entry}
      onClose={onClose}
      size="md"
      title={
        <div className="flex items-center gap-2 pr-8">
          <Icon
            name={isPreset ? "book" : "info"}
            className="w-4 h-4 shrink-0 text-blue-500 dark:text-blue-400"
          />
          <span className="text-base font-semibold text-gray-900 dark:text-gray-100">
            {entry.title}
          </span>
        </div>
      }
    >
      <div className="space-y-3">
        {/* 来源 + 难度 + 频率 */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="inline-flex items-center px-2 py-0.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 rounded">
            {isPreset ? entry.presetName ?? "预设知识" : entry.docCategory ?? "产品文档"}
          </span>
          {isPreset && entry.difficulty && (
            <span className="inline-flex items-center gap-0.5 text-gray-500 dark:text-gray-400">
              难度
              {Array.from({ length: 5 }).map((_, i) => (
                <Icon
                  key={i}
                  name="star"
                  className={
                    i < entry.difficulty!
                      ? "w-3 h-3 text-amber-400 dark:text-amber-500"
                      : "w-3 h-3 text-gray-200 dark:text-gray-700"
                  }
                />
              ))}
            </span>
          )}
          {isPreset && entry.frequency && (
            <span className="inline-flex items-center px-2 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 rounded">
              频率 {entry.frequency}
            </span>
          )}
        </div>

        {/* 摘要 */}
        {entry.summary && (
          <div>
            <h5 className="text-xs font-medium text-gray-400 dark:text-gray-500 mb-1">摘要</h5>
            <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line">
              {entry.summary}
            </p>
          </div>
        )}

        {/* tags */}
        {entry.tags.length > 0 && (
          <div>
            <h5 className="text-xs font-medium text-gray-400 dark:text-gray-500 mb-1">标签</h5>
            <div className="flex flex-wrap gap-1">
              {entry.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center px-1.5 py-0.5 text-2xs bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 rounded"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* 前置依赖（preset 节点） */}
        {isPreset && entry.prerequisites && entry.prerequisites.length > 0 && (
          <div>
            <h5 className="text-xs font-medium text-gray-400 dark:text-gray-500 mb-1">
              前置知识
            </h5>
            <div className="flex flex-wrap gap-1">
              {entry.prerequisites.map((prereqId) => {
                // prereqId 是 KnowledgeNode.id，构造对应索引 id
                const prereqEntryId = `preset:${entry.presetId}:${prereqId}`;
                return (
                  <Button
                    key={prereqId}
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      // 由父组件处理导航（需查索引拿 entry）
                      // 这里简单跳转，父组件可通过 onNavigate 拦截
                      if (onNavigate) {
                        // 触发父组件查找并切换
                        onNavigate({ ...entry, id: prereqEntryId, title: prereqId });
                      }
                    }}
                    className="text-xs h-6 px-2"
                  >
                    {prereqId}
                  </Button>
                );
              })}
            </div>
          </div>
        )}

        {/* CTA */}
        <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
          {isPreset ? (
            <Button onClick={handleImportPreset} className="w-full">
              <Icon name="plus" className="w-4 h-4" />
              导入「{entry.presetName ?? "预设"}」学习计划
            </Button>
          ) : (
            <Button onClick={handleReadDoc} className="w-full">
              <Icon name="external-link" className="w-4 h-4" />
              阅读完整文档
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
}
