// app/api/status/route.ts
// 接收当日状态 + 基础计划 → 规则调量 → 可选 AI 增强 → 返回
// 支持可选 dopamineTrigger（来自情绪觉察流程）
// ⚠️ Edge runtime 无法访问客户端 IndexedDB，历史状态由客户端传入
//
// 鉴权：requireSession 注入 session，body 不含客户端凭证

import { NextResponse } from "next/server";
import { z } from "zod";
import { adjustDailyLoad, detectEnhanceTrigger } from "@/lib/status";
import { enhanceAdjustment } from "@/lib/ai/status-enhance";
import { initCloudflareEnv } from "@/lib/ai/cloudflare-env";
import { requireSession } from "@/lib/ai/session-middleware";
import { getModelFromSession } from "@/lib/ai/provider";
import { parseRequestBody, isoDate } from "@/lib/ai/body-validation";
import type { DailyStatus, ScheduleItem, DopamineTrigger } from "@/lib/types";

export const runtime = "edge";

// 2026-07-28 P1 安全：改用 zod schema 强校验，替代 as cast + 手写 if
// - date 用 isoDate 校验（YYYY-MM-DD）
// - energy 限定 1-5 整数
// - mood 限定枚举
// - availableMinutes 限定 0-1440 整数（一天最多 1440 分钟）
// - basePlan 是数组（元素结构由 ScheduleItem 类型保证，运行时不深校验避免性能开销）
// - dopamineTrigger 可选枚举
// - recentStatuses 可选数组
const statusBodySchema = z.object({
  date: isoDate,
  energy: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4), z.literal(5)]),
  mood: z.enum(["good", "neutral", "bad"]),
  availableMinutes: z.number().int().min(0).max(1440),
  basePlan: z.array(z.unknown()),
  dopamineTrigger: z.string().optional(),
  recentStatuses: z.array(z.unknown()).optional(),
});

export async function POST(req: Request) {
  await initCloudflareEnv();
  // 先鉴权
  const sessionResult = await requireSession(req);
  if (sessionResult instanceof NextResponse) return sessionResult;
  const { session } = sessionResult;

  // 2026-07-28 P1：用 parseRequestBody 替代 as cast + 手写 if
  const result = await parseRequestBody(req, statusBodySchema);
  if (result instanceof NextResponse) return result;
  const body = result.data as {
    date: string;
    energy: 1 | 2 | 3 | 4 | 5;
    mood: "good" | "neutral" | "bad";
    availableMinutes: number;
    basePlan: ScheduleItem[];
    dopamineTrigger?: DopamineTrigger;
    recentStatuses?: DailyStatus[];
  };

  const model = getModelFromSession(session, "status");

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
