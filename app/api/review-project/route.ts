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

import { initCloudflareEnv } from "@/lib/ai/cloudflare-env";
import { getModelFromSession } from "@/lib/ai/provider";
import { reviewProject, type ProjectSubmission } from "@/lib/ai/project-review";
import { requireSession } from "@/lib/ai/session-middleware";
import { getNode, getRubric } from "@/lib/curriculum/server-graph";
import { nowISO } from "@/lib/time";

export async function POST(req: NextRequest) {
  await initCloudflareEnv();

  const sessionResult = await requireSession(req);
  if (sessionResult instanceof NextResponse) return sessionResult;
  const { session } = sessionResult;

  let body: {
    nodeId?: string;
    title?: string;
    repoUrl?: string;
    deployUrl?: string;
    docUrl?: string;
    artifactText?: string;
  };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "请求体格式错误" }, { status: 400 });
  }

  // 参数校验
  if (!body.nodeId || typeof body.nodeId !== "string") {
    return NextResponse.json({ error: "nodeId 是必填项" }, { status: 400 });
  }
  if (!body.title || !body.title.trim()) {
    return NextResponse.json({ error: "title 是必填项" }, { status: 400 });
  }
  if (!body.repoUrl && !body.deployUrl && !body.docUrl && !body.artifactText) {
    return NextResponse.json(
      { error: "至少提供 repoUrl / deployUrl / docUrl / artifactText 之一" },
      { status: 400 },
    );
  }

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
      title: body.title.trim(),
      repoUrl: body.repoUrl?.trim() || undefined,
      deployUrl: body.deployUrl?.trim() || undefined,
      docUrl: body.docUrl?.trim() || undefined,
      artifactText: body.artifactText?.trim() || undefined,
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
