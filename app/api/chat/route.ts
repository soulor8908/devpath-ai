// app/api/chat/route.ts
// 流式聊天接口：接收 { messages, modelConfig, contextSnapshot, toolContext } → 调用 streamText → 返回流式响应
// AI Native 升级：
//   1. 支持客户端注入"用户上下文快照"（contextSnapshot），让 LLM 知道用户当前在学什么
//   2. 支持 8 个 AI 工具（toolContext + tools），让 AI 能查看状态、创建提醒、调整计划
// 工具架构：
//   - 只读工具在服务端执行，直接返回 toolContext 中的数据
//   - 写入工具返回 clientAction 描述符，客户端在流结束后解析并执行 IndexedDB 操作

import { NextRequest, NextResponse } from "next/server";
import { streamText } from "ai";
import { initCloudflareEnv, getCloudflareKV } from "@/lib/ai/cloudflare-env";
import { requireAuth } from "@/lib/auth";
import { resolveModel, type ClientModelConfig } from "@/lib/ai/resolve-model";
import { getPrompt } from "@/lib/ai/prompts";
import { createChatTools, type ToolContext } from "@/lib/ai/chat-tools";
import { createKVStore } from "@/lib/storage/kv";
import { checkRateLimit, incrementRateLimit } from "@/lib/ai/rate-limit";

export const runtime = "edge";

interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

// 从 Prompt Registry 读取基础 system（运行时拼接 contextSnapshot）
const PROMPT_DEF = getPrompt("chat");

// 工具能力说明（追加到 system prompt）
const TOOL_SYSTEM_SUFFIX = `
# AI 工具能力
你拥有以下工具，可以根据用户意图主动调用：
- get_daily_schedule：查看今日时间表（作息+学习计划）
- get_next_task：推荐接下来该做什么
- set_reminder：设置提醒（如"30分钟后提醒我学习"）
- review_today：获取今日学习数据用于复盘
- get_upcoming_plan：查看未来几天的学习安排
- adjust_plan：调整学习计划（如"周日有事，延后那天的计划"）
- toggle_plan_freeze：冻结/解冻学习计划
- set_plan_priority：调整计划优先级（1-5）

调用工具时遵循：
1. 用户问"今天有什么安排"→ 调 get_daily_schedule
2. 用户问"接下来学什么"→ 调 get_next_task
3. 用户说"X分钟后提醒我..."→ 调 set_reminder
4. 用户说"复盘今天"→ 调 review_today，然后基于数据给出分析
5. 用户说"未来几天有什么计划"→ 调 get_upcoming_plan
6. 用户说"某天有事调整计划"→ 先调 get_upcoming_plan 确认，再调 adjust_plan
7. 用户说"冻结/暂停某计划"→ 调 toggle_plan_freeze
8. 用户说"调整优先级"→ 调 set_plan_priority
调用工具后，用自然语言总结结果并给出建议。`;

export async function POST(req: NextRequest) {
  await initCloudflareEnv();
  try {
    const body = await req.json();
    const { messages, modelConfig, contextSnapshot, toolContext, userId } = body as {
      messages?: ChatMessage[];
      modelConfig?: ClientModelConfig;
      contextSnapshot?: string;
      toolContext?: ToolContext;
      userId?: string;
    };

    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: "messages 必须是非空数组" },
        { status: 400 },
      );
    }

    const { model, useServerModel } = resolveModel(modelConfig, "chat");
    const authError = requireAuth(req, { useServerModel });
    if (authError) return authError;

    // 限流：仅使用服务端默认模型时检查（用户自带 modelConfig 不限流）
    if (useServerModel && userId) {
      const kv = createKVStore(getCloudflareKV());
      const { allowed, remaining, limit } = await checkRateLimit(userId, "chat", kv);
      if (!allowed) {
        return NextResponse.json(
          { error: "今日 AI 调用已达上限", code: "RATE_LIMITED", scene: "chat", remaining: 0, limit },
          { status: 429 },
        );
      }
      // 乐观计数：流式响应前先 +1，失败不回滚（可接受，保守计数）
      await incrementRateLimit(userId, "chat", kv);
      void remaining; // remaining 仅用于 429 响应，此处已通过检查
    }

    const safeContext =
      typeof contextSnapshot === "string" && contextSnapshot.length > 0
        ? contextSnapshot.slice(0, 4000)
        : "";

    const systemPrompt = safeContext
      ? `${PROMPT_DEF.system}\n\n${safeContext}\n${TOOL_SYSTEM_SUFFIX}`
      : `${PROMPT_DEF.system}\n${TOOL_SYSTEM_SUFFIX}`;

    // 如果有 toolContext，创建工具并启用多步调用
    const hasTools = toolContext && Array.isArray(toolContext.plans);
    const tools = hasTools ? createChatTools(toolContext!) : undefined;

    const result = await streamText({
      model,
      messages,
      system: systemPrompt,
      ...(tools ? { tools, maxSteps: 5 } : {}),
    });

    return result.toDataStreamResponse();
  } catch (error) {
    const message = error instanceof Error ? error.message : "未知错误";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
