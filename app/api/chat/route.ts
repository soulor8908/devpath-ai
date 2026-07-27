// app/api/chat/route.ts
// 流式聊天接口：接收 { messages, contextSnapshot, toolContext } → 调用 streamText → 返回流式响应
// AI Native 升级：
//   1. 支持客户端注入"用户上下文快照"（contextSnapshot），让 LLM 知道用户当前在学什么
//   2. 支持 8 个 AI 工具（toolContext + tools），让 AI 能查看状态、创建提醒、调整计划
// 工具架构：
//   - 只读工具在服务端执行，直接返回 toolContext 中的数据
//   - 写入工具返回 clientAction 描述符，客户端在流结束后解析并执行 IndexedDB 操作
//
// 鉴权（apiKey Session 安全架构 + Trial 模式降级）：
//   - 优先走 requireSession（用户已配置自己模型 → 用 session.apiKey）
//   - requireSession 失败（401）→ 降级到 trial 模式：
//       a. 服务端用默认模型 getModel()（环境变量配置的 AI_API_KEY）
//       b. IP 维度限流（chat=5/天，独立 KV key 前缀 trial: 防撞）
//       c. 响应头 X-Trial-Mode: 1 + X-Trial-Remaining: N
//   - trial 模式让体验用户第一时间得到 AI 响应（乔布斯视角：API Key 不应是首日门槛）

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { streamText } from "ai";
import { initCloudflareEnv, getAuthSessionsKV } from "@/lib/ai/cloudflare-env";
import { requireSession } from "@/lib/ai/session-middleware";
import { getModelFromSession, getModel, hasAIKey, getProviderInfo } from "@/lib/ai/provider";
import { getPrompt } from "@/lib/ai/prompts";
import { createChatTools, type ToolContext } from "@/lib/ai/chat-tools";
import { buildToolSystemSuffix } from "@/lib/ai/tool-registry";
import { PERSONAS, selectPersona, type PersonaContext, type Persona } from "@/lib/ai/persona";
import type { PersonaId } from "@/lib/types";
import { createKVStore } from "@/lib/storage/kv";
import { checkTrialRateLimit, incrementTrialRateLimit } from "@/lib/ai/rate-limit";
import { parseRequestBody, boundedString } from "@/lib/ai/body-validation";

interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

// 2026-07-27 P1：用 zod schema 校验请求体（替代手写 if + filter）
// 设计权衡（卡帕西视角）：
//   - messages 数组元素结构强校验（role 枚举 + content 非空字符串）：替代手动 filter
//   - personaContext 形状校验（energy/mood/streak 类型 + topic 可选）：替代手动 if
//   - preferredPersona 枚举校验：替代 Object.hasOwn 运行时检查
//   - toolContext 保持 z.unknown() passthrough：结构复杂且客户端可能扩展字段，
//     强行 schema 化会让客户端合法调用被 400 拒绝；服务端 createChatTools 内部
//     自己会校验 plans 数组等字段，不需要在入口重复校验
//   - contextSnapshot / knowledgeContext 用 boundedString(4000) 同时校验类型与长度，
//     替代手动 slice(0, 4000)（zod 的 .max() 会直接拒绝过长，避免静默截断）
const chatBodySchema = z.object({
  messages: z
    .array(
      z.object({
        role: z.enum(["user", "assistant", "system"]),
        content: z.string().min(1, { message: "content 不能为空字符串" }),
      }),
    )
    .min(1, { message: "messages 必须是非空数组" }),
  contextSnapshot: boundedString(4000).optional(),
  toolContext: z.unknown().optional(),
  personaContext: z
    .object({
      energy: z.number(),
      mood: z.string(),
      streak: z.number(),
      topic: z.string().optional(),
    })
    .optional(),
  preferredPersona: z
    .enum(["strict_coach", "gentle_companion", "socratic_tutor", "peer_dev"])
    .optional(),
  knowledgeContext: boundedString(4000).optional(),
});

// 从 Prompt Registry 读取基础 system（运行时拼接 contextSnapshot）
const PROMPT_DEF = getPrompt("chat");

// 工具能力说明（从 tool-registry 动态生成，追加到 system prompt）
const TOOL_SYSTEM_SUFFIX = buildToolSystemSuffix();

/**
 * 从请求头提取客户端真实 IP。
 * 优先级：
 *   1. cf-connecting-ip（Cloudflare Pages 注入，最可信）
 *   2. x-forwarded-for 的第一个值（其他反代场景）
 *   3. 兜底 "unknown"（限流将以 unknown 维度计数，可接受）
 */
function getClientIp(req: NextRequest): string {
  const cfIp = req.headers.get("cf-connecting-ip");
  if (cfIp) return cfIp;
  const xff = req.headers.get("x-forwarded-for");
  if (xff) {
    const first = xff.split(",")[0]?.trim();
    if (first) return first;
  }
  return "unknown";
}

export async function POST(req: NextRequest) {
  await initCloudflareEnv();
  try {
    // 先鉴权（requireSession 内部用 req.clone().text() 读 body 签名校验，不消费原 body）
    const sessionResult = await requireSession(req);
    const hasSession = !(sessionResult instanceof NextResponse);
    const session = hasSession ? sessionResult.session : null;

    // 再读 body（不再含客户端凭证字段）+ zod schema 校验
    // parseRequestBody 失败时返回 400 + 结构化 error，路由层用 instanceof 判失败
    const bodyResult = await parseRequestBody(req, chatBodySchema);
    if (bodyResult instanceof NextResponse) return bodyResult;
    const {
      messages,
      contextSnapshot,
      toolContext,
      personaContext,
      preferredPersona,
      knowledgeContext,
    } = bodyResult.data;

    // zod schema 已保证 messages 是非空数组且每个元素有合法 role + content
    const validMessages: ChatMessage[] = messages.map((m) => ({
      role: m.role,
      content: m.content,
    }));

    // 模型选择 + Trial 模式判定
    // - session 存在 → 用 session.apiKey 调上游（用户自担额度）
    // - session 不存在 → 尝试 trial 模式（服务端默认模型 + IP 限流）
    //   - 服务端没配 AI_API_KEY → 返回原 401（requireSession 的错误响应）
    //     （这种情况说明部署环境未启用 trial，应引导用户自配模型）
    let model;
    let currentModelId: string;
    let isTrial = false;
    let trialRemaining: number | undefined;

    if (session) {
      model = getModelFromSession(session, "chat");
      currentModelId = session.model;
    } else {
      // Trial 模式：先检查服务端是否配了 AI_API_KEY
      if (!hasAIKey()) {
        // 服务端没配 trial model → 返回原 401（让用户去配置自己的模型）
        return sessionResult as NextResponse;
      }
      // IP 维度限流
      const ip = getClientIp(req);
      const kv = createKVStore(getAuthSessionsKV() ?? undefined);
      const limit = await checkTrialRateLimit(ip, "chat", kv);
      if (!limit.allowed) {
        return NextResponse.json(
          {
            error: `今日体验额度已用完（${limit.limit} 次/天）。请添加自己的 AI 模型以继续使用。`,
            code: "TRIAL_LIMIT_REACHED",
            limit: limit.limit,
          },
          { status: 429 },
        );
      }
      trialRemaining = limit.remaining - 1; // 本次调用后剩余
      model = getModel();
      const info = getProviderInfo();
      currentModelId = info.model;
      isTrial = true;
      // 异步计数（不阻塞响应）；即使本次调用失败也计数，避免被滥用刷免费额度
      void incrementTrialRateLimit(ip, "chat", kv).catch(() => {});
    }

    // zod schema 已校验 contextSnapshot 为 string | undefined 且长度 <= 4000
    const safeContext = contextSnapshot ?? "";

    // Persona 注入：根据用户状态选择匹配的 AI 人格片段
    // - preferredPersona（用户手动设置）覆盖自动选择
    // - personaContext（客户端聚合 energy/mood/streak/topic）用于自动选择
    // - 两者都缺时跳过 persona 注入（保持向后兼容）
    // - persona.id 可由客户端记入 AICallRecord.inputDigest 用于归因分析
    // - zod schema 已校验 personaContext 形状与 preferredPersona 枚举合法性
    let personaSnippet = "";
    let personaId: PersonaId | null = null;
    if (preferredPersona) {
      // preferredPersona 已是合法 PersonaId（zod enum 校验过），PERSONAS 必有对应项
      const persona: Persona = PERSONAS[preferredPersona];
      personaSnippet = persona.snippet;
      personaId = persona.id;
    } else if (personaContext) {
      const safeCtx: PersonaContext = {
        energy: personaContext.energy,
        mood: personaContext.mood,
        streak: personaContext.streak,
        ...(personaContext.topic ? { topic: personaContext.topic } : {}),
      };
      const persona = selectPersona(safeCtx);
      personaSnippet = persona.snippet;
      personaId = persona.id;
    }
    void personaId; // 当前仅用于调试/未来归因，不写入响应

    // systemPrompt 拼接顺序：基础 prompt → contextSnapshot → 知识检索结果 → persona 片段 → 工具能力说明
    // 知识检索结果在 contextSnapshot 之后、persona 之前，让 AI 先了解用户上下文和检索知识再调整语气
    const parts: string[] = [PROMPT_DEF.system];
    if (safeContext) parts.push(safeContext);
    // 知识库检索结果注入（v1 知识检索）：客户端 pre-retrieval 命中后传入，
    // 让 AI 回答 grounded 在检索结果上，回答中可引用知识标题
    // zod schema 已校验 knowledgeContext 为 string | undefined 且长度 <= 4000
    if (knowledgeContext) {
      parts.push(
        `【知识库检索结果】\n以下是检索到的相关知识，回答时可参考并引用其标题。若用户问"有哪些 X"，请基于这些知识作答；若与问题无关请忽略。\n${knowledgeContext}`,
      );
    }
    if (personaSnippet) parts.push(personaSnippet);
    // Trial 模式追加提示：让 AI 知道当前是体验用户、应建议添加自己的模型
    if (isTrial) {
      parts.push(
        "[体验模式] 当前用户使用服务端默认模型（基础版）。回答末尾可礼貌建议：「当前是体验模型，建议在「我的 → AI 模型」添加自己的模型以获得更稳定的体验」，但每轮最多提示一次，避免打扰。",
      );
    }
    parts.push(TOOL_SYSTEM_SUFFIX);
    const systemPrompt = parts.join("\n\n");

    // 如果有 toolContext，创建工具并启用多步调用
    // zod schema 把 toolContext 类型保留为 unknown（passthrough），
    // 这里用结构判别 + 类型断言：plans 是数组则视为合法 ToolContext
    const hasTools = !!toolContext && typeof toolContext === "object" && Array.isArray((toolContext as ToolContext).plans);
    const tools = hasTools ? createChatTools(toolContext as ToolContext) : undefined;

    const result = await streamText({
      model,
      messages: validMessages,
      system: systemPrompt,
      ...(tools ? { tools, maxSteps: 5 } : {}),
      // onFinish 回调：流式完成后服务端观测 usage（用于服务端日志/未来扩展）
      // 客户端通过解析 data stream protocol 的 "d:" finish 消息直接拿到 usage
      onFinish: ({ usage, finishReason }) => {
        console.info("[chat] usage", {
          modelId: currentModelId,
          trial: isTrial,
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
    if (isTrial) {
      // Trial 模式标识 + 剩余次数：客户端据此显示 banner + 引导添加模型
      response.headers.set("X-Trial-Mode", "1");
      if (trialRemaining !== undefined) {
        response.headers.set("X-Trial-Remaining", String(trialRemaining));
      }
    }
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
