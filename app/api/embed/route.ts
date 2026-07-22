// app/api/embed/route.ts
// 知识库查询嵌入接口：把用户查询文本嵌入成向量，供客户端余弦检索。
//
// 架构（方案 C：构建期预嵌入 + 客户端余弦）：
//   - 知识库条目的向量在构建期已预嵌入（scripts/build-knowledge-index.ts）
//   - 运行时只需嵌入「查询文本」一次（约 50 token），客户端拿向量做余弦 top-k
//   - 本接口职责单一：文本 → 向量，附带 KV 缓存（30 天 TTL，按文本 sha256 去重）
//
// 鉴权（与 /api/chat 一致的双轨）：
//   - 优先 requireSession（用户已配置自己模型 → 用 session 鉴权）
//   - 失败降级 Trial 模式（IP 限流 embed=100/天，复用 lib/ai/rate-limit.ts）
//   - Trial 模式响应头 X-Trial-Mode / X-Trial-Remaining
//
// 失败降级：
//   - 无 AI binding（非 Cloudflare / 未配置）→ 503，客户端走关键词检索
//   - 上游 AI 错误 → 500，客户端走关键词检索
//   - 限流 → 429，客户端走关键词检索
//
// 成功响应：{ vector: number[], cached: boolean, model: string, dimensions: number }

import { NextRequest, NextResponse } from "next/server";
import { initCloudflareEnv, getAI, getAuthSessionsKV } from "@/lib/ai/cloudflare-env";
import { requireSession } from "@/lib/ai/session-middleware";
import { createKVStore } from "@/lib/storage/kv";
import { checkTrialRateLimit, incrementTrialRateLimit } from "@/lib/ai/rate-limit";
import { sha256 } from "@/lib/ai/crypto";

export const runtime = "edge";

/** 嵌入模型 id（与构建期 scripts/build-knowledge-index.ts 保持一致） */
const EMBEDDING_MODEL = "@cf/baai/bge-base-en-v1.5";
/** bge-base-en-v1.5 输出维度 */
const EMBEDDING_DIMENSIONS = 768;
/** KV 缓存 key 前缀 + TTL（30 天） */
const CACHE_KEY_PREFIX = "kb:embed:";
const CACHE_TTL_SECONDS = 30 * 24 * 60 * 60;
/** 查询文本最大长度（截断防滥用，bge-base 上下文 512 token，中文约 200 字） */
const MAX_TEXT_LENGTH = 500;

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
    const ai = getAI();
    if (!ai) {
      // 无 AI binding → 客户端走关键词降级
      return NextResponse.json(
        { error: "Workers AI 不可用，请使用关键词检索", code: "AI_UNAVAILABLE" },
        { status: 503 },
      );
    }

    // 鉴权（双轨，与 /api/chat 一致）
    const sessionResult = await requireSession(req);
    const hasSession = !(sessionResult instanceof NextResponse);
    const session = hasSession ? sessionResult.session : null;

    // Trial 模式限流检查（仅未登录用户）
    let isTrial = false;
    let trialRemaining: number | undefined;
    if (!session) {
      const ip = getClientIp(req);
      const kv = createKVStore(getAuthSessionsKV() ?? undefined);
      const limit = await checkTrialRateLimit(ip, "embed", kv);
      if (!limit.allowed) {
        return NextResponse.json(
          {
            error: `今日知识检索体验额度已用完（${limit.limit} 次/天）`,
            code: "TRIAL_LIMIT_REACHED",
            limit: limit.limit,
          },
          { status: 429 },
        );
      }
      trialRemaining = limit.remaining - 1;
      isTrial = true;
      void incrementTrialRateLimit(ip, "embed", kv).catch(() => {});
    }

    // 读 body
    const body = await req.json();
    const { text: rawText } = body as { text?: unknown };
    if (typeof rawText !== "string" || rawText.trim().length === 0) {
      return NextResponse.json(
        { error: "text 必须是非空字符串", code: "INVALID_INPUT" },
        { status: 400 },
      );
    }
    // 截断防滥用
    const text = rawText.slice(0, MAX_TEXT_LENGTH);

    // KV 缓存检查（按文本 sha256 去重）
    const textHash = await sha256(text);
    const cacheKey = CACHE_KEY_PREFIX + textHash;
    const kv = getAuthSessionsKV();
    if (kv) {
      try {
        const cached = await kv.get(cacheKey);
        if (cached) {
          const parsed = JSON.parse(cached) as { vector: number[] };
          return NextResponse.json({
            vector: parsed.vector,
            cached: true,
            model: EMBEDDING_MODEL,
            dimensions: EMBEDDING_DIMENSIONS,
            ...(isTrial
              ? { trialMode: true, trialRemaining }
              : {}),
          });
        }
      } catch {
        // 缓存读取失败，继续走实时嵌入
      }
    }

    // 调 Workers AI 嵌入
    const result = await ai.run(EMBEDDING_MODEL, { text: String(text) });
    // bge 返回 data: number[][]（批量）或 number[]（单条），统一成 number[]
    let vector: number[];
    if (Array.isArray(result.data) && result.data.length > 0) {
      if (Array.isArray((result.data as unknown[])[0])) {
        vector = (result.data as number[][])[0];
      } else {
        vector = result.data as number[];
      }
    } else {
      return NextResponse.json(
        { error: "嵌入返回空数据", code: "EMPTY_EMBEDDING" },
        { status: 500 },
      );
    }

    if (vector.length !== EMBEDDING_DIMENSIONS) {
      return NextResponse.json(
        {
          error: `嵌入维度不匹配：期望 ${EMBEDDING_DIMENSIONS}，实际 ${vector.length}`,
          code: "DIMENSION_MISMATCH",
        },
        { status: 500 },
      );
    }

    // 写 KV 缓存（失败不阻塞主流程）
    if (kv) {
      try {
        await kv.put(cacheKey, JSON.stringify({ vector }), {
          expirationTtl: CACHE_TTL_SECONDS,
        });
      } catch {
        // 缓存写入失败，忽略
      }
    }

    const response = NextResponse.json({
      vector,
      cached: false,
      model: EMBEDDING_MODEL,
      dimensions: EMBEDDING_DIMENSIONS,
      ...(isTrial ? { trialMode: true, trialRemaining } : {}),
    });
    if (isTrial) {
      response.headers.set("X-Trial-Mode", "1");
      if (trialRemaining !== undefined) {
        response.headers.set("X-Trial-Remaining", String(trialRemaining));
      }
    }
    return response;
  } catch (error) {
    const message = error instanceof Error ? error.message : "未知错误";
    console.error("[embed] internal error:", message);
    return NextResponse.json(
      { error: message, code: "INTERNAL_ERROR" },
      { status: 500 },
    );
  }
}
