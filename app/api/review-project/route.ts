// app/api/review-project/route.ts
// V3 项目评审：用户提交项目 → AI 按 Rubric 逐项打分 → 返回评审结果
//
// 评审结果返回给前端，由前端：
//   1. 存入 IndexedDB（project_review:<id>）
//   2. 调 recordVerificationResult 写回 mastery_state（V3 通过 → v3_passed/mastered）
//
// 注意：AI 只能访问提交内容（文本/链接描述），不 clone 仓库也不访问部署——
// 这是当前部署边界下的务实设计（真沙箱需 E2B/Modal 外部服务）。
import { NextRequest, NextResponse } from "next/server";
import { nanoid } from "nanoid";
import { z } from "zod";

import { initCloudflareEnv } from "@/lib/ai/cloudflare-env";
import { getModelFromSession } from "@/lib/ai/provider";
import { reviewProject, type ProjectSubmission } from "@/lib/ai/project-review";
import { requireSession } from "@/lib/ai/session-middleware";
import { getNode, getRubric } from "@/lib/curriculum/server-graph";
import { nowISO } from "@/lib/time";
import { parseRequestBody, nonEmptyString, boundedString } from "@/lib/ai/body-validation";

// 2026-07-28 P1 安全：改用 zod schema 强校验，防 prompt 注入
// - repoUrl/deployUrl/docUrl 用 URL 协议白名单（http/https），防止 javascript: 等协议
// - artifactText 限长 10000 字符，防超长 prompt 注入
// - 至少提供一个材料字段（refine 保证）
const httpUrlOrEmpty = z
  .string()
  .trim()
  .regex(/^https?:\/\/[^\s]+$/i, { message: "链接必须是 http(s) URL" })
  .or(z.literal(""));

const reviewProjectBodySchema = z
  .object({
    nodeId: nonEmptyString,
    title: boundedString(200),
    repoUrl: httpUrlOrEmpty.optional(),
    deployUrl: httpUrlOrEmpty.optional(),
    docUrl: httpUrlOrEmpty.optional(),
    artifactText: boundedString(10000).optional(),
  })
  .refine(
    (data) =>
      Boolean(data.repoUrl || data.deployUrl || data.docUrl || data.artifactText),
    { message: "至少提供 repoUrl / deployUrl / docUrl / artifactText 之一" },
  );

export async function POST(req: NextRequest) {
  await initCloudflareEnv();

  const sessionResult = await requireSession(req);
  if (sessionResult instanceof NextResponse) return sessionResult;
  const { session } = sessionResult;

  // 2026-07-28 P1：用 parseRequestBody 替代 as cast + 手写 if
  // requireSession 用 req.clone().text() 算签名，不消费原 body，此处可安全 req.json()
  const result = await parseRequestBody(req, reviewProjectBodySchema);
  if (result instanceof NextResponse) return result;
  const body = result.data;

  const node = getNode(body.nodeId);
  if (!node) {
    return NextResponse.json(
      { error: `节点不存在: ${body.nodeId}` },
      { status: 400 },
    );
  }

  // V3 节点的 masteryCheck 必须挂 Rubric
  const rubricId = node.masteryCheck.rubricId;
  if (!rubricId) {
    return NextResponse.json(
      { error: `节点 ${body.nodeId} 未挂 Rubric，无法做 V3 评审` },
      { status: 400 },
    );
  }
  const rubric = getRubric(rubricId);
  if (!rubric) {
    return NextResponse.json(
      { error: `Rubric 不存在: ${rubricId}` },
      { status: 400 },
    );
  }

  try {
    const model = getModelFromSession(session, "review-project");
    const submission: ProjectSubmission = {
      title: body.title,
      repoUrl: body.repoUrl || undefined,
      deployUrl: body.deployUrl || undefined,
      docUrl: body.docUrl || undefined,
      artifactText: body.artifactText || undefined,
    };

    const review = await reviewProject(rubric, submission, model);

    // 返回评审记录（前端落盘 + 写回 mastery_state）
    return NextResponse.json({
      reviewId: nanoid(),
      nodeId: body.nodeId,
      rubricId: rubric.id,
      review,
      reviewedAt: nowISO(),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "评审失败";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
