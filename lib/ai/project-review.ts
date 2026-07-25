// lib/ai/project-review.ts
// V3 项目评审：AI 按 Rubric 逐项打分
//
// 第一性原理（卡帕西视角）：
//   - 评审是概率性 LLM 的判断，不是确定性执行——所以不做"运行用户代码"的真沙箱
//     （那需要 E2B/Modal 外部服务，超出当前部署边界）
//   - 而是让 AI 扮演"资深工程师审查官"，按 Rubric 逐项给 0-100 分 + 证据
//   - scoreRubric（纯函数）做加权汇总，对比 passScore 判定通过
//   - 失败时把反馈回喂，用户改进后可重试（与 prompt.versioning-and-testing 节点理念一致）

import { generateObject } from "ai";
import type { LanguageModel } from "ai";
import { z } from "zod";

import { scoreRubric } from "@/lib/curriculum/verification";
import type { Rubric } from "@/lib/types/curriculum";

/** 单项评分：得分 + 证据 + 改进建议 */
export interface CriterionScore {
  /** Rubric criterion id */
  criterionId: string;
  /** 0-100 */
  score: number;
  /** 评分依据（引用提交内容中的具体证据） */
  evidence: string;
  /** 改进建议（未满分时必填） */
  improvement?: string;
}

/** 评审提交物 */
export interface ProjectSubmission {
  /** 项目标题 */
  title: string;
  /** GitHub 仓库链接 */
  repoUrl?: string;
  /** 部署链接 */
  deployUrl?: string;
  /** 文档链接（eval 报告/架构图等） */
  docUrl?: string;
  /** 直接附上的代码/文档摘要（当无链接或需补充说明时） */
  artifactText?: string;
}

/** 评审结果 */
export interface ReviewResult {
  /** 各项评分 */
  scores: Record<string, number>;
  /** 各项详细评审（含证据与改进建议） */
  details: CriterionScore[];
  /** 加权总分 0-100 */
  total: number;
  /** 是否通过（>= rubric.passScore） */
  passed: boolean;
  /** 总体反馈摘要 */
  summary: string;
}

const criterionScoreSchema = z.object({
  criterionId: z.string(),
  score: z.number().min(0).max(100),
  evidence: z.string(),
  improvement: z.string().optional(),
});

const reviewSchema = z.object({
  items: z.array(criterionScoreSchema),
  summary: z.string(),
});

function buildReviewPrompt(rubric: Rubric, submission: ProjectSubmission): string {
  const criteriaText = rubric.criteria
    .map((c) => `- ${c.id}（权重 ${c.weight}%）：${c.description}`)
    .join("\n");

  const submissionParts: string[] = [`项目标题：${submission.title}`];
  if (submission.repoUrl) submissionParts.push(`GitHub 仓库：${submission.repoUrl}`);
  if (submission.deployUrl) submissionParts.push(`部署链接：${submission.deployUrl}`);
  if (submission.docUrl) submissionParts.push(`文档链接：${submission.docUrl}`);
  if (submission.artifactText) {
    submissionParts.push(
      `提交内容摘要：\n${submission.artifactText.slice(0, 8000)}`,
    );
  }

  return [
    `请按以下 Rubric 逐项评审这个项目提交。`,
    `通过线：${rubric.passScore} 分（加权总分）。`,
    ``,
    `评分项：`,
    criteriaText,
    ``,
    `提交内容：`,
    submissionParts.join("\n"),
    ``,
    `评审要求：`,
    `1. 每项给 0-100 分，score 必须在 0-100`,
    `2. evidence 必须引用提交内容中的具体证据（代码/文档/数据），不能空泛`,
    `3. 未满分的项必须给 improvement 改进建议`,
    `4. summary 给一段总体评价（含是否通过的建议与最关键的 1-2 个改进点）`,
    `5. 严格基于提交内容评审，未提供的部分该扣分就扣分，不要臆测`,
  ].join("\n");
}

/**
 * AI 按 Rubric 评审项目提交。
 *
 * 注意：AI 只能访问提交内容（文本/链接描述），不会真的去 clone 仓库或访问部署。
 * 这是有意的边界——真沙箱执行需外部服务，当前用 AI 审查 + 用户诚实提交。
 * 生产增强方向：接入 GitHub API 拉取仓库内容喂给 AI，或接 E2B 执行测试。
 */
export async function reviewProject(
  rubric: Rubric,
  submission: ProjectSubmission,
  model: LanguageModel,
): Promise<ReviewResult> {
  const result = await generateObject({
    model,
    schema: reviewSchema,
    system:
      "你是资深 AI 工程面试官，按 Rubric 严格评审候选人提交的项目。" +
      "评分必须基于提交内容中的具体证据，不能凭印象。严格但公正。",
    prompt: buildReviewPrompt(rubric, submission),
  });

  const details: CriterionScore[] = result.object.items;
  const scores: Record<string, number> = {};
  for (const d of details) {
    scores[d.criterionId] = d.score;
  }

  // 用纯函数做加权汇总（AI 不参与算分，只给分项分）
  const { total, passed } = scoreRubric(rubric, scores);

  return {
    scores,
    details,
    total,
    passed,
    summary: result.object.summary,
  };
}
