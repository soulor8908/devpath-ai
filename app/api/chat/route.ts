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
import { getProviderInfo } from "@/lib/ai/provider";
import { getPrompt } from "@/lib/ai/prompts";
import { createChatTools, type ToolContext } from "@/lib/ai/chat-tools";
import { createKVStore } from "@/lib/storage/kv";
import { checkRateLimit, incrementRateLimit } from "@/lib/ai/rate-limit";
import { PERSONAS, selectPersona, type PersonaContext, type Persona } from "@/lib/ai/persona";
import type { PersonaId } from "@/lib/types";

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
- start_focus_session：启动番茄钟专注学习 session（如"开始专注 25 分钟"）
- generate_learning_plan：根据用户画像生成精准学习计划（如"帮我制定 4 周 React 计划"）
- optimize_schedule：智能优化今日学习安排的优先级（如"优化今天的日程顺序"）

调用工具时遵循：
1. 用户问"今天有什么安排"→ 调 get_daily_schedule
2. 用户问"接下来学什么"→ 调 get_next_task
3. 用户说"X分钟后提醒我..."→ 调 set_reminder
4. 用户说"复盘今天"→ 调 review_today，然后基于数据给出分析
5. 用户说"未来几天有什么计划"→ 调 get_upcoming_plan
6. 用户说"某天有事调整计划"→ 先调 get_upcoming_plan 确认，再调 adjust_plan
7. 用户说"冻结/暂停某计划"→ 调 toggle_plan_freeze
8. 用户说"调整优先级"→ 调 set_plan_priority
9. 用户说"开始专注/开始学习/启动番茄钟"→ 调 start_focus_session
10. 用户说"制定学习计划/生成计划"→ 调 generate_learning_plan
11. 用户说"优化今日日程/安排今天的顺序"→ 调 optimize_schedule
调用工具后，用自然语言总结结果并给出建议。`;

export async function POST(req: NextRequest) {
  await initCloudflareEnv();
  try {
    const body = await req.json();
    const { messages, modelConfig, contextSnapshot, toolContext, userId, personaContext, preferredPersona } = body as {
      messages?: ChatMessage[];
      modelConfig?: ClientModelConfig;
      contextSnapshot?: string;
      toolContext?: ToolContext;
      userId?: string;
      /** Persona 选择上下文（客户端聚合：energy/mood/streak/topic） */
      personaContext?: PersonaContext;
      /** 用户手动设置的偏好 Persona（覆盖自动选择） */
      preferredPersona?: PersonaId;
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

    // Persona 注入：根据用户状态选择匹配的 AI 人格片段
    // - preferredPersona（用户手动设置）覆盖自动选择
    // - personaContext（客户端聚合 energy/mood/streak/topic）用于自动选择
    // - 两者都缺时跳过 persona 注入（保持向后兼容）
    // - persona.id 可由客户端记入 AICallRecord.inputDigest 用于归因分析
    let personaSnippet = "";
    let personaId: PersonaId | null = null;
    if (preferredPersona) {
      // 用户手动设置优先级最高
      const persona: Persona = PERSONAS[preferredPersona];
      personaSnippet = persona.snippet;
      personaId = persona.id;
    } else if (personaContext) {
      // 自动选择（服务端不读 IndexedDB，由客户端聚合 ctx）
      const persona = selectPersona(personaContext);
      personaSnippet = persona.snippet;
      personaId = persona.id;
    }
    void personaId; // 当前仅用于调试/未来归因，不写入响应

    // systemPrompt 拼接顺序：基础 prompt → contextSnapshot → persona 片段 → 工具能力说明
    // persona 片段在 contextSnapshot 之后，让 AI 先了解用户上下文再调整语气
    const parts: string[] = [PROMPT_DEF.system];
    if (safeContext) parts.push(safeContext);
    if (personaSnippet) parts.push(personaSnippet);
    parts.push(TOOL_SYSTEM_SUFFIX);
    const systemPrompt = parts.join("\n\n");

    // 如果有 toolContext，创建工具并启用多步调用
    const hasTools = toolContext && Array.isArray(toolContext.plans);
    const tools = hasTools ? createChatTools(toolContext!) : undefined;

    // 解析当前使用的模型 ID（用于客户端成本估算）
    // - 用户自定义模型：从 modelConfig.model 取
    // - 服务端默认模型：从 getProviderInfo().model 取
    const currentModelId = useServerModel
      ? getProviderInfo().model
      : modelConfig?.model ?? "unknown";

    const result = await streamText({
      model,
      messages,
      system: systemPrompt,
      ...(tools ? { tools, maxSteps: 5 } : {}),
      // onFinish 回调：流式完成后服务端观测 usage（用于服务端日志/未来扩展）
      // 客户端通过解析 data stream protocol 的 "d:" finish 消息直接拿到 usage
      onFinish: ({ usage, finishReason }) => {
        console.info("[chat] usage", {
          modelId: currentModelId,
          promptTokens: usage?.promptTokens,
          completionTokens: usage?.completionTokens,
          totalTokens: usage?.totalTokens,
          finishReason,
        });
      },
    });

    const response = result.toDataStreamResponse();
    // 通过响应头传递 modelId，客户端用于成本估算（与 "d:" 消息中的 usage 配合）
    response.headers.set("X-AI-Model-Id", currentModelId);
    return response;
  } catch (error) {
    const message = error instanceof Error ? error.message : "未知错误";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
