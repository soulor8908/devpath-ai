// app/api/adjust-plan/route.ts
// 调整学习计划：接收 { plan, instruction, routine? } → 调 AI → 返回调整后的 schedule

import { NextRequest, NextResponse } from "next/server";
import { generateObject } from "ai";
import { z } from "zod";
import { resolveModel, type ClientModelConfig } from "@/lib/ai/resolve-model";
import { initCloudflareEnv } from "@/lib/ai/cloudflare-env";
import { requireAuth } from "@/lib/auth";
import { getPrompt } from "@/lib/ai/prompts";
import type { LearningPlan, Routine } from "@/lib/types";

export const runtime = "edge";

// 从 Prompt Registry 读取
const PROMPT_DEF = getPrompt("adjust_plan");

const scheduleItemSchema = z.object({
  day: z.number(),
  nodeId: z.string(),
  type: z.enum(["learn", "review"]),
  estimatedMinutes: z.number(),
  completed: z.boolean(),
});

const adjustSchema = z.object({
  schedule: z.array(scheduleItemSchema),
});

const INTENSITY_LABEL: Record<Routine["intensity"], string> = {
  light: "轻松",
  standard: "标准",
  intensive: "冲刺",
};

const WEEKDAY_NAMES = ["一", "二", "三", "四", "五", "六", "日"];

export async function POST(req: NextRequest) {
  await initCloudflareEnv();
  const body = await req.json();
  const { plan, instruction, routine, modelConfig } = body as {
    plan?: LearningPlan;
    instruction?: string;
    routine?: Routine;
    modelConfig?: ClientModelConfig;
  };
  const { model, useServerModel } = resolveModel(modelConfig, "adjust-plan");
  const authError = requireAuth(req, { useServerModel });
  if (authError) return authError;
  try {

    if (!plan || !Array.isArray(plan.schedule) || !Array.isArray(plan.knowledgeTree)) {
      return NextResponse.json({ error: "plan 是必填项" }, { status: 400 });
    }
    if (!instruction || typeof instruction !== "string" || !instruction.trim()) {
      return NextResponse.json({ error: "instruction 是必填项" }, { status: 400 });
    }

    // 组装 prompt：知识点列表 + 当前日程 + 作息（可选） + 用户指令
    const lines: string[] = [];

    lines.push("知识点列表：");
    for (const node of plan.knowledgeTree) {
      const segs = [
        `- ${node.id}: ${node.title}`,
        `难度${node.difficulty}`,
        `频率${node.frequency}`,
      ];
      if (node.bigTech) segs.push("大厂高频");
      segs.push(`customOrder=${node.customOrder ?? "-"}`);
      lines.push(`${segs.join(", ")}`);
    }

    lines.push("");
    lines.push("当前日程：");
    for (const item of plan.schedule) {
      const node = plan.knowledgeTree.find((n) => n.id === item.nodeId);
      const title = node?.title ?? item.nodeId;
      lines.push(
        `- 第${item.day}天 ${item.type === "learn" ? "学习" : "复习"} ${item.nodeId}(${title}) ${item.estimatedMinutes}min${item.completed ? " 已完成" : ""}`
      );
    }

    if (routine) {
      lines.push("");
      lines.push("用户作息：");
      lines.push(`起床 ${routine.wakeTime}，睡觉 ${routine.sleepTime}`);
      if (routine.slots && routine.slots.length > 0) {
        lines.push(
          "学习时段：" +
            routine.slots
              .map((s) => `${s.label} ${s.start}-${s.end}(${s.minutes}min)`)
              .join(", ")
        );
      }
      if (routine.weekdays && routine.weekdays.length > 0) {
        lines.push(
          "可学习日期：周" +
            routine.weekdays.map((d) => WEEKDAY_NAMES[d - 1] ?? String(d)).join("、")
        );
      }
      lines.push(`强度：${INTENSITY_LABEL[routine.intensity] ?? routine.intensity}`);
    }

    lines.push("");
    lines.push(`每日学习时间目标：${plan.dailyMinutes}分钟`);
    lines.push(`每日新内容上限：${plan.maxNewPerDay}`);

    lines.push("");
    lines.push(`用户指令：${instruction.trim()}`);

    const prompt = lines.join("\n");

    const result = await generateObject({
      model,
      schema: adjustSchema,
      system: PROMPT_DEF.system,
      prompt,
    });

    return NextResponse.json({ schedule: result.object.schedule });
  } catch (error) {
    const message = error instanceof Error ? error.message : "未知错误";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
