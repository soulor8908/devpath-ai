// app/api/daily-nudge/route.ts
// 每日 AI 主动提醒：基于客户端传入的上下文快照，生成 1-2 句"今天该做什么"建议
// AI Native 升级：从"用户问 AI 才回答" → "AI 主动开口"
// 设计：
//   - 客户端从 IndexedDB 聚合快照后 POST 过来
//   - 服务端调一次 LLM，返回短文本
//   - 失败时降级为规则模板
//   - 客户端按当天缓存（IndexedDB），避免每次进首页都跑 LLM
//
// 鉴权与试用降级（与 /api/chat 对齐）：
//   1. 已登录：requireSession 注入 session，用 session.apiKey 调上游（用户自担额度）
//   2. 未登录：若服务端配了 AI_API_KEY，走 trial 模式（getModel() + IP 限流
//      daily_nudge=1/天，已用完则降级到 rule 模板，不报错）
//   3. 未登录且服务端没配 AI_API_KEY：降级到 rule 模板（不报错）
//   关键约束：试用用户进首页不能看到"AI 提醒加载失败"，必须能正常请求
//
// 成本追踪（t7）：
//   - 从 generateText result.usage 提取 token 用量
//   - 通过响应体 _meta.tokenUsage 字段返回客户端
//   - 通过响应头 X-AI-Model-Id 返回 modelId
//   - 客户端 DailyNudge 读取 _meta 后传给 recordAICall 估成本
//
// Trace 链路（t8）：
//   - 服务端从 X-Trace-Id header 读取 traceId（不存在则自生成）
//   - 通过响应头 X-Trace-Id 回传，客户端可用于日志关联

import { NextRequest, NextResponse } from "next/server";
import { generateText } from "ai";
import { initCloudflareEnv } from "@/lib/ai/cloudflare-env";
import { requireSession } from "@/lib/ai/session-middleware";
import { getModelFromSession, getModel, hasAIKey, getProviderInfo } from "@/lib/ai/provider";
import { getPrompt } from "@/lib/ai/prompts";
import { createKVStore } from "@/lib/storage/kv";
import { getAuthSessionsKV } from "@/lib/ai/cloudflare-env";
import { checkTrialRateLimit, incrementTrialRateLimit } from "@/lib/ai/rate-limit";
import { getOrCreateTraceIdFromRequest, TRACE_ID_HEADER } from "@/lib/ai/trace";
import type { TokenUsage } from "@/lib/types";

export const runtime = "edge";

// 从 Prompt Registry 读取
const PROMPT_DEF = getPrompt("daily_nudge");

/**
 * 从请求头提取客户端真实 IP（与 /api/chat 一致）。
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

/** 从 generateText 返回的 usage 提取 TokenUsage（无数据时返回 undefined） */
function extractTokenUsage(usage: { promptTokens?: number; completionTokens?: number; totalTokens?: number } | undefined): TokenUsage | undefined {
  if (!usage) return undefined;
  const prompt = usage.promptTokens ?? 0;
  const completion = usage.completionTokens ?? 0;
  const total = usage.totalTokens ?? prompt + completion;
  if (prompt === 0 && completion === 0) return undefined;
  return { prompt, completion, total };
}

interface DailyNudgeMeta {
  tokenUsage?: TokenUsage;
  modelId?: string;
  traceId: string;
}

/** 构造规则降级响应（不报错，保证试用用户也能看到内容） */
function ruleResponse(snapshot: string, traceId: string): NextResponse {
  return NextResponse.json({
    nudge: ruleBasedNudge(snapshot),
    source: "rule",
    generatedAt: new Date().toISOString(),
    _meta: { traceId } satisfies DailyNudgeMeta,
  });
}

export async function POST(req: NextRequest) {
  await initCloudflareEnv();

  // traceId：从客户端 header 读取，不存在则自生成（贯穿本次请求的所有 AI 调用）
  const traceId = getOrCreateTraceIdFromRequest(req);

  // 鉴权：先尝试 requireSession（内部用 req.clone().text() 读 body 签名校验，不消费原 body）
  // 顺序很关键：requireSession 必须在 req.json() 之前，否则 body 被消费后签名校验会失败
  const sessionResult = await requireSession(req);
  const hasSession = !(sessionResult instanceof NextResponse);
  const session = hasSession ? sessionResult.session : null;

  // 再读 body（requireSession 用 clone 不消费原 body）
  let body: { contextSnapshot?: string };
  try {
    body = await req.json() as { contextSnapshot?: string };
  } catch {
    return NextResponse.json({ error: "请求体格式错误" }, { status: 400 });
  }
  const { contextSnapshot } = body;

  // 安全截断
  const safeSnapshot =
    typeof contextSnapshot === "string" && contextSnapshot.length > 0
      ? contextSnapshot.slice(0, 4000)
      : "";

  // 无 contextSnapshot 时直接走规则模板（不需要 LLM）
  if (!safeSnapshot) {
    return ruleResponse(safeSnapshot, traceId);
  }

  // 模型选择
  // - session 存在 → 用 session.apiKey 调上游
  // - session 不存在 + 服务端配了 AI_API_KEY → trial 模式（getModel + IP 限流）
  // - session 不存在 + 服务端没配 AI_API_KEY → 降级到 rule 模板（不报错）
  let model;
  let isTrial = false;
  let modelId: string | undefined;

  if (session) {
    model = getModelFromSession(session, "daily-nudge");
    modelId = session.model;
  } else if (hasAIKey()) {
    // Trial 模式：IP 维度限流（daily_nudge 默认配额 1/天，足够）
    const ip = getClientIp(req);
    const kv = createKVStore(getAuthSessionsKV() ?? undefined);
    const limit = await checkTrialRateLimit(ip, "daily_nudge", kv);
    if (!limit.allowed) {
      // 试用额度用完 → 降级到 rule 模板（不报错，保证试用用户能看到内容）
      return ruleResponse(safeSnapshot, traceId);
    }
    model = getModel();
    modelId = getProviderInfo().model;
    isTrial = true;
  } else {
    // 服务端没配 AI_API_KEY 且用户未登录 → 降级到 rule 模板
    return ruleResponse(safeSnapshot, traceId);
  }

  try {
    try {
      const { text, usage } = await generateText({
        model,
        system: PROMPT_DEF.system,
        prompt: `用户上下文：\n${safeSnapshot}\n\n请生成今日建议：`,
      });

      const cleaned = text.trim().split("\n").filter((s) => s.trim()).join(" ");
      if (cleaned.length === 0) {
        return ruleResponse(safeSnapshot, traceId);
      }

      // trial 模式计数（异步，失败静默，不阻塞响应）
      if (isTrial) {
        const ip = getClientIp(req);
        const kv = createKVStore(getAuthSessionsKV() ?? undefined);
        void incrementTrialRateLimit(ip, "daily_nudge", kv).catch(() => {});
      }

      const meta: DailyNudgeMeta = {
        tokenUsage: extractTokenUsage(usage),
        modelId,
        traceId,
      };

      const response = NextResponse.json({
        nudge: cleaned.slice(0, 200),
        source: "ai",
        generatedAt: new Date().toISOString(),
        _meta: meta,
      });
      // 通过响应头同步暴露 traceId + modelId（与 /api/chat 一致）
      response.headers.set(TRACE_ID_HEADER, traceId);
      if (modelId) {
        response.headers.set("X-AI-Model-Id", modelId);
      }
      return response;
    } catch {
      // LLM 调用失败 → 降级到 rule 模板（不报错）
      return ruleResponse(safeSnapshot, traceId);
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
