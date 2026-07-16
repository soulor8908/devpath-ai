// app/api/daily-nudge/route.ts
// 每日 AI 主动提醒：基于客户端传入的上下文快照，生成 1-2 句"今天该做什么"建议
// AI Native 升级：从"用户问 AI 才回答" → "AI 主动开口"
// 设计：
//   - 客户端从 IndexedDB 聚合快照后 POST 过来
//   - 服务端调一次 LLM，返回短文本
//   - 失败/无 key 时降级为规则模板
//   - 客户端按当天缓存（IndexedDB），避免每次进首页都跑 LLM

import { NextRequest, NextResponse } from "next/server";
import { generateText } from "ai";
import { initCloudflareEnv, getCloudflareKV } from "@/lib/ai/cloudflare-env";
import { requireAuth } from "@/lib/auth";
import { hasAIKey } from "@/lib/ai/provider";
import { getPrompt } from "@/lib/ai/prompts";
import { resolveModel, type ClientModelConfig } from "@/lib/ai/resolve-model";
import { createKVStore } from "@/lib/storage/kv";
import { checkRateLimit, incrementRateLimit } from "@/lib/ai/rate-limit";

export const runtime = "edge";

// 从 Prompt Registry 读取
const PROMPT_DEF = getPrompt("daily_nudge");

export async function POST(req: NextRequest) {
  await initCloudflareEnv();

  let body: { contextSnapshot?: string; modelConfig?: ClientModelConfig; userId?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "请求体格式错误" }, { status: 400 });
  }

  const { contextSnapshot, modelConfig, userId } = body;
  const { model, useServerModel } = resolveModel(modelConfig, "daily-nudge");

  const authError = requireAuth(req, { useServerModel });
  if (authError) return authError;

  // 限流：仅使用服务端默认模型时检查（用户自带 modelConfig 不限流）
  if (useServerModel && userId) {
    const kv = createKVStore(getCloudflareKV());
    const { allowed } = await checkRateLimit(userId, "daily_nudge", kv);
    if (!allowed) {
      return NextResponse.json(
        { error: "今日 AI 调用已达上限", code: "RATE_LIMITED", scene: "daily_nudge", remaining: 0 },
        { status: 429 },
      );
    }
  }

  try {
    // 安全截断
    const safeSnapshot =
      typeof contextSnapshot === "string" && contextSnapshot.length > 0
        ? contextSnapshot.slice(0, 4000)
        : "";

    // 无 AI key 降级到规则模板
    if ((useServerModel && !hasAIKey()) || !safeSnapshot) {
      return NextResponse.json({
        nudge: ruleBasedNudge(safeSnapshot),
        source: "rule",
        generatedAt: new Date().toISOString(),
      });
    }

    try {
      const { text } = await generateText({
        model,
        system: PROMPT_DEF.system,
        prompt: `用户上下文：\n${safeSnapshot}\n\n请生成今日建议：`,
      });

      const cleaned = text.trim().split("\n").filter((s) => s.trim()).join(" ");
      if (cleaned.length === 0) {
        return NextResponse.json({
          nudge: ruleBasedNudge(safeSnapshot),
          source: "rule",
          generatedAt: new Date().toISOString(),
        });
      }

      // 限流计数 +1（AI 成功生成后；规则降级不计数）
      if (useServerModel && userId) {
        const kv = createKVStore(getCloudflareKV());
        await incrementRateLimit(userId, "daily_nudge", kv);
      }

      return NextResponse.json({
        nudge: cleaned.slice(0, 200),
        source: "ai",
        generatedAt: new Date().toISOString(),
      });
    } catch {
      return NextResponse.json({
        nudge: ruleBasedNudge(safeSnapshot),
        source: "rule",
        generatedAt: new Date().toISOString(),
      });
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "未知错误";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/**
 * 规则降级：从快照里抓关键信号，生成模板建议
 * 简单字符串匹配，避免引入复杂解析
 */
function ruleBasedNudge(snapshot: string): string {
  if (!snapshot) {
    return "今天先打开一个学习计划，告诉 AI 你想学什么。";
  }

  // 低能量提示
  const energyMatch = snapshot.match(/能量\s*(\d)\s*\/\s*5/);
  if (energyMatch) {
    const energy = Number(energyMatch[1]);
    if (energy <= 2) {
      return "今天能量偏低，建议只做轻度复习，不开新内容。先去 /rest 做 478 呼吸 5 分钟再开始。";
    }
  }

  // 错题提示
  if (snapshot.includes("最近答错的题目")) {
    return "你有未解决的错题，先打开错题本复习 1-2 道再学新内容，避免重复踩坑。";
  }

  // 待复习
  if (snapshot.includes("今日待复习")) {
    return "先打开 /review 把今天到期的复习卡片做完，再开始学新内容。";
  }

  // 当前节点
  const nodeMatch = snapshot.match(/当前应该学的节点：(.+)/);
  if (nodeMatch) {
    return `今天的下一个知识点是「${nodeMatch[1].trim()}」，建议用 30 分钟专注学完。`;
  }

  // 默认
  return "保持节奏，今天先打开学习计划完成一个节点。";
}
