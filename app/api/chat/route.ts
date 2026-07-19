// app/api/chat/route.ts
// 流式聊天接口：接收 { messages, contextSnapshot, toolContext } → 调用 streamText → 返回流式响应
// AI Native 升级：
//   1. 支持客户端注入"用户上下文快照"（contextSnapshot），让 LLM 知道用户当前在学什么
//   2. 支持 8 个 AI 工具（toolContext + tools），让 AI 能查看状态、创建提醒、调整计划
// 工具架构：
//   - 只读工具在服务端执行，直接返回 toolContext 中的数据
//   - 写入工具返回 clientAction 描述符，客户端在流结束后解析并执行 IndexedDB 操作
//
// 鉴权（apiKey Session 安全架构）：
//   - requireSession 校验签名 + 注入 session（apiKey / baseURL / model）
//   - body 不含客户端凭证；模型从 session 构造

import { NextRequest, NextResponse } from "next/server";
import { streamText } from "ai";
import { initCloudflareEnv } from "@/lib/ai/cloudflare-env";
import { requireSession } from "@/lib/ai/session-middleware";
import { getModelFromSession } from "@/lib/ai/provider";
import { getPrompt } from "@/lib/ai/prompts";
import { createChatTools, type ToolContext } from "@/lib/ai/chat-tools";
import { buildToolSystemSuffix } from "@/lib/ai/tool-registry";
import { PERSONAS, selectPersona, type PersonaContext, type Persona } from "@/lib/ai/persona";
import type { PersonaId } from "@/lib/types";

export const runtime = "edge";

interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

// 从 Prompt Registry 读取基础 system（运行时拼接 contextSnapshot）
const PROMPT_DEF = getPrompt("chat");

// 工具能力说明（从 tool-registry 动态生成，追加到 system prompt）
const TOOL_SYSTEM_SUFFIX = buildToolSystemSuffix();

export async function POST(req: NextRequest) {
  await initCloudflareEnv();
  try {
    // 先鉴权（requireSession 内部用 req.clone().text() 读 body 签名校验，不消费原 body）
    const sessionResult = await requireSession(req);
    if (sessionResult instanceof NextResponse) return sessionResult;
    const { session } = sessionResult;

    // 再读 body（不再含客户端凭证字段）
    const body = await req.json();
    const { messages, contextSnapshot, toolContext, personaContext, preferredPersona } = body as {
      messages?: ChatMessage[];
      contextSnapshot?: string;
      toolContext?: ToolContext;
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

    // 用 session 创建模型
    const model = getModelFromSession(session, "chat");

    // 无服务端限流：session 架构下所有用户都用自己加密在 session 中的 apiKey，
    // 直接调用上游 AI provider，由用户自担额度/费用。服务端不再做"今日 N 次"拦截。

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

    // 解析当前使用的模型 ID（用于客户端成本估算）：直接从 session 取
    const currentModelId = session.model;

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
    // 区分上游 AI provider 错误 vs 本地错误，避免把上游 401 当成 500 吞掉
    // 上游 401（apiKey 失效/风控）→ 透传 401 + UPSTREAM_AUTH，客户端提示用户检查模型配置
    // 本地签名/鉴权 401 → 已在 requireSession 中间件返回，不会走到这里
    const isUpstreamAuthError =
      error instanceof Error &&
      /401|invalid api key|invalid signature|unauthorized/i.test(error.message);
    if (isUpstreamAuthError) {
      const message = error instanceof Error ? error.message : "上游 AI 鉴权失败";
      console.warn("[chat] upstream auth error:", message);
      return NextResponse.json(
        {
          error: `AI 服务鉴权失败：${message}。请到「我的」→「AI 模型」检查 apiKey 是否正确、是否被风控或失效`,
          code: "UPSTREAM_AUTH",
        },
        { status: 401 },
      );
    }
    const message = error instanceof Error ? error.message : "未知错误";
    console.error("[chat] internal error:", message);
    return NextResponse.json(
      { error: message, code: "INTERNAL_ERROR" },
      { status: 500 },
    );
  }
}
