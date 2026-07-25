"use client";

// components/PortfolioEditorModal.tsx
// V4 作品集编辑器模态 —— 创建/编辑作品集条目
//
// 设计（乔布斯视角）：
//   - 一屏内完成核心输入：标题 / 摘要 / 节点 / 链接 / 评审结果
//   - 必填项一目了然（红色 *），可选项用 hint 解释用途
//   - 评审字段（score / passed / feedback）只读展示——这些来自 V3 AI 评审，
//     不允许手编，保证「发布 = AI 已验证」的契约
//
// 设计（卡帕西视角）：
//   - 用统一 <Modal> + <FormField> + <Input> + <Textarea>，护栏测试自动覆盖
//   - 表单状态用 useState，提交时做客户端校验（标题/摘要必填）
//   - 节点列表从编译产物读取（public/data/curriculum-graph.json），只列 V3/V4 节点
//   - 受控表单 + 提交按钮 loading 态，避免重复提交

import { useEffect, useMemo, useState } from "react";
import { Modal, Button, FormField, Input, Textarea, Select } from "@/components/ui";
import { Icon } from "@/components/Icon";
import type {
  PortfolioEntry,
  PortfolioStatus,
} from "@/lib/types";
import type { SkillNode } from "@/lib/types/curriculum";

/** 可选节点：仅展示带 V3/V4 masteryCheck 的里程碑节点 */
function filterPortfolioEligibleNodes(nodes: SkillNode[]): SkillNode[] {
  return nodes.filter(
    (n) =>
      n.masteryCheck?.level === "V3" ||
      n.masteryCheck?.level === "V4",
  );
}

export interface PortfolioEditorSubmit {
  title: string;
  summary: string;
  nodeId: string;
  rubricId: string;
  repoUrl?: string;
  deployUrl?: string;
  docUrl?: string;
  /** 评审字段透传：编辑时不修改，由调用方从原 entry 继承 */
  reviewScore?: number;
  reviewPassed?: boolean;
  reviewFeedback?: string;
  status: PortfolioStatus;
}

interface PortfolioEditorModalProps {
  open: boolean;
  onClose: () => void;
  /** 全部节点（用于节点下拉） */
  nodes: SkillNode[];
  /** 编辑模式时传入既有 entry；创建模式传 undefined */
  entry?: PortfolioEntry;
  onSubmit: (data: PortfolioEditorSubmit) => Promise<void> | void;
}

export function PortfolioEditorModal({
  open,
  onClose,
  nodes,
  entry,
  onSubmit,
}: PortfolioEditorModalProps) {
  const eligibleNodes = useMemo(() => filterPortfolioEligibleNodes(nodes), [nodes]);

  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [nodeId, setNodeId] = useState("");
  const [repoUrl, setRepoUrl] = useState("");
  const [deployUrl, setDeployUrl] = useState("");
  const [docUrl, setDocUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ title?: string; summary?: string; nodeId?: string }>({});

  // 打开时同步表单状态（创建/编辑切换）
  useEffect(() => {
    if (!open) return;
    setTitle(entry?.title ?? "");
    setSummary(entry?.summary ?? "");
    setNodeId(entry?.nodeId ?? "");
    setRepoUrl(entry?.repoUrl ?? "");
    setDeployUrl(entry?.deployUrl ?? "");
    setDocUrl(entry?.docUrl ?? "");
    setErrors({});
  }, [open, entry]);

  const selectedNode = eligibleNodes.find((n) => n.id === nodeId);
  const rubricId = selectedNode?.masteryCheck?.rubricId ?? entry?.rubricId ?? "";

  function validate(): boolean {
    const next: typeof errors = {};
    if (!title.trim()) next.title = "标题不能为空";
    if (!summary.trim()) next.summary = "摘要不能为空";
    if (!nodeId) next.nodeId = "请选择关联节点";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit() {
    if (!validate()) return;
    setSubmitting(true);
    try {
      await onSubmit({
        title: title.trim(),
        summary: summary.trim(),
        nodeId,
        rubricId,
        repoUrl: repoUrl.trim() || undefined,
        deployUrl: deployUrl.trim() || undefined,
        docUrl: docUrl.trim() || undefined,
        // 评审字段透传（编辑时保留，创建时未设置）
        reviewScore: entry?.reviewScore,
        reviewPassed: entry?.reviewPassed,
        reviewFeedback: entry?.reviewFeedback,
        status: entry?.status ?? "draft",
      });
      onClose();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={entry ? "编辑作品集" : "新建作品集"}
      description={
        entry
          ? "修改作品集元信息。评审分数由 V3 AI 评审生成，不可手编。"
          : "把 V3 通过的项目发布为作品集。带 * 的字段必填。"
      }
      size="lg"
      mobilePosition="center"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={submitting}>
            取消
          </Button>
          <Button onClick={handleSubmit} loading={submitting} leftIcon="check">
            {entry ? "保存" : "创建"}
          </Button>
        </>
      }
    >
      <div className="space-y-4 py-2">
        <FormField label="项目标题" required error={errors.title} htmlFor="portfolio-title">
          <Input
            id="portfolio-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="如：CLI 文本批处理工具"
            error={!!errors.title}
            maxLength={80}
          />
        </FormField>

        <FormField
          label="一句话摘要"
          required
          error={errors.summary}
          htmlFor="portfolio-summary"
          hint="展示在作品集卡片上，建议 30-80 字"
        >
          <Textarea
            id="portfolio-summary"
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            placeholder="如：基于 asyncio 的 LLM 批处理工具，支持限流/重试/成本统计"
            error={!!errors.summary}
            rows={2}
            maxLength={200}
          />
        </FormField>

        <FormField
          label="关联节点"
          required
          error={errors.nodeId}
          htmlFor="portfolio-node"
          hint="只能关联 V3/V4 里程碑节点；选中后自动绑定 Rubric"
        >
          <Select
            id="portfolio-node"
            value={nodeId}
            onChange={(e) => setNodeId(e.target.value)}
            error={!!errors.nodeId}
          >
            <option value="">请选择节点…</option>
            {eligibleNodes.map((n) => (
              <option key={n.id} value={n.id}>
                {n.title}
              </option>
            ))}
          </Select>
        </FormField>

        {rubricId && (
          <div className="rounded-card bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 px-3 py-2 text-xs text-blue-700 dark:text-blue-300 flex items-center gap-2">
            <Icon name="info" className="w-3.5 h-3.5 shrink-0" />
            <span>已绑定 Rubric: <span className="font-mono">{rubricId}</span></span>
          </div>
        )}

        <FormField label="GitHub 仓库链接" htmlFor="portfolio-repo" hint="可选；建议提供以便面试官查看代码">
          <Input
            id="portfolio-repo"
            value={repoUrl}
            onChange={(e) => setRepoUrl(e.target.value)}
            placeholder="https://github.com/username/repo"
            leftIcon="github"
            inputMode="url"
          />
        </FormField>

        <FormField label="在线部署链接" htmlFor="portfolio-deploy" hint="可选；可运行 demo 大幅加分">
          <Input
            id="portfolio-deploy"
            value={deployUrl}
            onChange={(e) => setDeployUrl(e.target.value)}
            placeholder="https://your-demo.vercel.app"
            leftIcon="external-link"
            inputMode="url"
          />
        </FormField>

        <FormField label="项目文档链接" htmlFor="portfolio-doc" hint="可选；架构图 / Eval 报告 / README 都可">
          <Input
            id="portfolio-doc"
            value={docUrl}
            onChange={(e) => setDocUrl(e.target.value)}
            placeholder="https://docs.example.com/your-project"
            leftIcon="book"
            inputMode="url"
          />
        </FormField>

        {/* 评审结果只读展示（编辑模式 + 已评审时显示） */}
        {entry?.reviewPassed !== undefined && (
          <div className="rounded-card border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/40 p-3 space-y-1.5">
            <div className="flex items-center gap-2 text-xs font-medium text-gray-700 dark:text-gray-300">
              <Icon name="sparkles" className="w-3.5 h-3.5" />
              V3 AI 评审结果（只读）
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="text-gray-500 dark:text-gray-400">分数：</span>
              <span className="font-mono font-medium text-gray-800 dark:text-gray-200">
                {entry.reviewScore ?? "-"}
              </span>
              <span className="text-gray-300 dark:text-gray-600">|</span>
              <span className="text-gray-500 dark:text-gray-400">结果：</span>
              {entry.reviewPassed ? (
                <span className="inline-flex items-center gap-1 text-green-600 dark:text-green-400">
                  <Icon name="check-circle" className="w-3.5 h-3.5" />
                  通过
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-red-600 dark:text-red-400">
                  <Icon name="x-circle" className="w-3.5 h-3.5" />
                  未通过
                </span>
              )}
            </div>
            {entry.reviewFeedback && (
              <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-3 pt-1 border-t border-gray-200 dark:border-gray-700">
                {entry.reviewFeedback}
              </p>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
}
