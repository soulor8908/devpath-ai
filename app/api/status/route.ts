// app/api/status/route.ts
// 接收当日状态 + 基础计划 → 规则调量 → 可选 AI 增强 → 返回
// 支持可选 dopamineTrigger（来自情绪觉察流程）
// ⚠️ Edge runtime 无法访问客户端 IndexedDB，历史状态由客户端传入

import { NextResponse } from "next/server";
import { adjustDailyLoad, detectEnhanceTrigger } from "@/lib/status";
import { enhanceAdjustment } from "@/lib/ai/status-enhance";
import { initCloudflareEnv } from "@/lib/ai/cloudflare-env";
import { requireAuth } from "@/lib/auth";
import type { DailyStatus, ScheduleItem, DopamineTrigger } from "@/lib/types";
import { resolveModel, type ClientModelConfig } from "@/lib/ai/resolve-model";

export const runtime = "edge";

interface StatusRequestBody {
  date: string;
  energy: 1 | 2 | 3 | 4 | 5;
  mood: "good" | "neutral" | "bad";
  availableMinutes: number;
  basePlan: ScheduleItem[];
  /** 多巴胺干扰来源（情绪觉察流程收集，可选） */
  dopamineTrigger?: DopamineTrigger;
  /** 最近 7 天历史状态（由客户端从 IndexedDB 读取后传入） */
  recentStatuses?: DailyStatus[];
  /** 客户端传入的模型配置（可选，含 apiKey 时免鉴权） */
  modelConfig?: ClientModelConfig;
}

export async function POST(req: Request) {
  await initCloudflareEnv();

  let body: StatusRequestBody;
  try {
    body = (await req.json()) as StatusRequestBody;
  } catch {
    return NextResponse.json({ error: "请求体格式错误" }, { status: 400 });
  }

  const { model, useServerModel } = resolveModel(body.modelConfig, "status");

  const authError = requireAuth(req, { useServerModel });
  if (authError) return authError;

  if (!body.date || !body.energy || !body.mood || typeof body.availableMinutes !== "number" || !Array.isArray(body.basePlan)) {
    return NextResponse.json({ error: "缺少必填字段" }, { status: 400 });
  }

  const status: DailyStatus = {
    date: body.date,
    energy: body.energy,
    mood: body.mood,
    availableMinutes: body.availableMinutes,
    aiAdjustedLoad: 0,
    actualMinutes: 0,
    // 仅写入合法值；"无" 视为未设置（保持与旧数据语义一致）
    dopamineTrigger:
      body.dopamineTrigger && body.dopamineTrigger !== "无"
        ? body.dopamineTrigger
        : undefined,
  };

  // 规则调量
  const adjustedPlan = adjustDailyLoad(body.basePlan, status);

  // 检查是否需 AI 增强：使用客户端传入的历史状态
  const recentStatuses = body.recentStatuses ?? [];
  recentStatuses.push(status);

  const trigger = detectEnhanceTrigger(recentStatuses, {});
  let suggestions: string[] = [];
  if (trigger.consecutiveLowDays >= 3 || Object.values(trigger.nodeFailCount).some((c) => c >= 3)) {
    suggestions = await enhanceAdjustment(trigger, model);
  }

  status.aiAdjustedLoad = adjustedPlan.length;

  // 返回 status 让客户端自行存入 IndexedDB（edge runtime 无法访问）
  return NextResponse.json({ adjustedPlan, suggestions, status });
}
