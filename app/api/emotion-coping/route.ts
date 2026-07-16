// app/api/emotion-coping/route.ts
// P3 情绪简化 — AI 应对建议生成
// 输入：{ tag, reason, modelConfig? }
// 输出：{ suggestions: string[], source: "ai" | "rule" }
// 失败/无 key 时降级到规则模板（按情绪类型给固定建议）

import { NextRequest, NextResponse } from "next/server";
import { generateText } from "ai";
import { initCloudflareEnv } from "@/lib/ai/cloudflare-env";
import { requireAuth } from "@/lib/auth";
import { hasAIKey } from "@/lib/ai/provider";
import { getPrompt } from "@/lib/ai/prompts";
import { resolveModel, type ClientModelConfig } from "@/lib/ai/resolve-model";
import type { EmotionTag } from "@/lib/types";

export const runtime = "edge";

const PROMPT_DEF = getPrompt("emotion_coping");

interface EmotionCopingBody {
  tag?: EmotionTag;
  reason?: string;
  modelConfig?: ClientModelConfig;
}

export async function POST(req: NextRequest) {
  await initCloudflareEnv();

  let body: EmotionCopingBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "请求体格式错误" }, { status: 400 });
  }

  const { tag, reason, modelConfig } = body;
  const { model, useServerModel } = resolveModel(modelConfig, "emotion-coping");

  const authError = requireAuth(req, { useServerModel });
  if (authError) return authError;

  if (!tag) {
    return NextResponse.json({ error: "缺少 tag 字段" }, { status: 400 });
  }

  const safeReason =
    typeof reason === "string" && reason.length > 0
      ? reason.slice(0, 500)
      : "";

  // 无 AI key 降级到规则模板
  if (useServerModel && !hasAIKey()) {
    return NextResponse.json({
      suggestions: ruleBasedCoping(tag),
      source: "rule",
    });
  }

  try {
    const userPrompt = `情绪：${tag}\n原因/影响：${safeReason || "（用户未填写）"}\n\n请生成 3-5 条应对建议：`;

    const { text } = await generateText({
      model,
      system: PROMPT_DEF.system,
      prompt: userPrompt,
    });

    // 解析 JSON 输出
    const parsed = parseSuggestionsJSON(text);
    if (parsed.length > 0) {
      return NextResponse.json({
        suggestions: parsed.slice(0, 5),
        source: "ai",
      });
    }

    // JSON 解析失败 → 降级规则
    return NextResponse.json({
      suggestions: ruleBasedCoping(tag),
      source: "rule",
    });
  } catch {
    return NextResponse.json({
      suggestions: ruleBasedCoping(tag),
      source: "rule",
    });
  }
}

/**
 * 从 AI 输出文本中解析 suggestions JSON
 * AI 可能返回 ```json {...} ``` 或纯 JSON，需兜底
 */
function parseSuggestionsJSON(text: string): string[] {
  try {
    // 去掉 ```json ``` 包裹
    const cleaned = text
      .replace(/^```(?:json)?\s*/i, "")
      .replace(/\s*```\s*$/i, "")
      .trim();
    const obj = JSON.parse(cleaned) as { suggestions?: unknown };
    if (
      obj &&
      typeof obj === "object" &&
      Array.isArray(obj.suggestions) &&
      obj.suggestions.every((s) => typeof s === "string")
    ) {
      return obj.suggestions as string[];
    }
  } catch {
    // ignore
  }
  return [];
}

/**
 * 规则降级：按情绪类型给出固定 3 条建议
 * 保证无 AI key 时也有可用体验
 */
function ruleBasedCoping(tag: EmotionTag): string[] {
  const RULES: Record<EmotionTag, string[]> = {
    焦虑: ["深呼吸 3 次", "写下此刻最担心的事", "去散步 10 分钟"],
    兴奋: ["记录此刻的想法", "做 5 分钟冥想平复", "把能量用到学习上"],
    疲惫: ["闭眼休息 5 分钟", "喝杯水走动一下", "今天只做轻度复习"],
    烦躁: ["转移注意力 5 分钟", "做一组伸展运动", "换个环境走一走"],
    满足: ["记录今天的小成就", "奖励自己一杯茶", "继续推进下一个节点"],
    冲动: ["停下等 10 秒再决定", "写下想做什么", "深呼吸 3 次"],
    平静: ["保持当前节奏", "做一会儿深度学习", "记录此刻的状态"],
    沮丧: ["对自己说一句肯定话", "去找朋友聊两句", "完成一个小任务找成就感"],
  };
  return RULES[tag] ?? RULES.平静;
}
