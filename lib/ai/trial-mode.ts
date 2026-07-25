// lib/ai/trial-mode.ts
// Trial 模式公共逻辑：服务端默认模型 + IP 维度限流
//
// 2026-07-25 用户需求：试用用户（未配置自己的 AI 模型）也要能生成知识库。
//   - 原本只有 /api/chat 支持 trial 降级，learn 系列 3 个 route 都强制 requireSession
//   - 抽出此模块让 learn 系列 route 复用同一套 trial 降级逻辑
//   - 配额由 rate-limit.ts 的 TRIAL_SCENE_QUOTAS 控制（learn 类成本高，2/天）
//
// 卡帕西视角：
//   - 单一事实源：trial 判定 + 限流 + 模型选择集中在此模块
//   - 路由层只关心"业务逻辑"，鉴权降级由本模块透明处理
//   - 失败原因分桶：服务端没配 AI_API_KEY → 返回原 401；超配额 → 429

import { NextRequest, NextResponse } from "next/server";
import type { LanguageModel } from "ai";
import { getAuthSessionsKV } from "./cloudflare-env";
import { hasAIKey, getModel, getProviderInfo } from "./provider";
import { checkTrialRateLimit, incrementTrialRateLimit } from "./rate-limit";
import { createKVStore } from "../storage/kv";
import type { AIScene } from "../types";

/** Trial 模式判定结果 */
export interface TrialResolution {
  /** 是否进入 trial 模式 */
  isTrial: boolean;
  /** trial 模式下使用的模型（isTrial=true 时有值） */
  model: LanguageModel | null;
  /** trial 模式下的模型 ID（用于响应头 / 日志） */
  modelId: string;
  /** 本次调用后剩余次数（用于响应头 X-Trial-Remaining） */
  remaining: number | undefined;
  /**
   * 鉴权失败响应（isTrial=false 且需要返回 401/429 时有值）。
   * 路由层应直接 `return resolution.errorResponse`。
   */
  errorResponse: NextResponse | null;
}

/**
 * 从请求头提取客户端真实 IP。
 * 优先级：
 *   1. cf-connecting-ip（Cloudflare Pages 注入，最可信）
 *   2. x-forwarded-for 的第一个值（其他反代场景）
 *   3. 兜底 "unknown"（限流以 unknown 维度计数，可接受）
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

/**
 * 尝试进入 trial 模式（服务端默认模型 + IP 限流）。
 *
 * 调用时机：requireSession 返回 401 后调用本函数尝试降级。
 *
 * 三种结果：
 *   1. 服务端没配 AI_API_KEY → 返回 errorResponse（原 401，让客户端引导配置模型）
 *   2. IP 限流超配额 → 返回 errorResponse（429，提示今日体验额度已用完）
 *   3. 通过 → 返回 { isTrial: true, model, modelId, remaining }，路由层用 model 调 AI
 *
 * @param req NextRequest 实例（用于提取 IP）
 * @param scene AI 场景（用于配额查表，如 "knowledge_decompose"）
 * @param originalFailureResponse requireSession 返回的 401 响应（服务端无 AI_API_KEY 时原样回传）
 */
export async function tryTrialMode(
  req: NextRequest,
  scene: AIScene,
  originalFailureResponse: NextResponse,
): Promise<TrialResolution> {
  // 1. 服务端必须配 AI_API_KEY 才能 trial
  if (!hasAIKey()) {
    return {
      isTrial: false,
      model: null,
      modelId: "",
      remaining: undefined,
      errorResponse: originalFailureResponse,
    };
  }

  // 2. IP 维度限流
  const ip = getClientIp(req);
  const kv = createKVStore(getAuthSessionsKV() ?? undefined);
  const limit = await checkTrialRateLimit(ip, scene, kv);
  if (!limit.allowed) {
    const errorResponse = NextResponse.json(
      {
        error: `今日体验额度已用完（${limit.limit} 次/天）。请添加自己的 AI 模型以继续使用。`,
        code: "TRIAL_LIMIT_REACHED",
        limit: limit.limit,
      },
      { status: 429 },
    );
    return {
      isTrial: false,
      model: null,
      modelId: "",
      remaining: undefined,
      errorResponse,
    };
  }

  // 3. 通过 → 用服务端默认模型
  const model = getModel();
  const info = getProviderInfo();
  const remaining = limit.remaining - 1; // 本次调用后剩余
  // 异步计数（不阻塞响应）；即使本次调用失败也计数，避免被滥用刷免费额度
  void incrementTrialRateLimit(ip, scene, kv).catch(() => {});

  return {
    isTrial: true,
    model,
    modelId: info.model,
    remaining,
    errorResponse: null,
  };
}

/**
 * 给响应注入 trial 模式标识头（X-Trial-Mode / X-Trial-Remaining）。
 * 路由层在返回响应前调用此函数。
 */
export function applyTrialHeaders(
  response: Response | NextResponse,
  isTrial: boolean,
  remaining?: number,
): void {
  if (!isTrial) return;
  response.headers.set("X-Trial-Mode", "1");
  if (typeof remaining === "number" && Number.isFinite(remaining)) {
    response.headers.set("X-Trial-Remaining", String(remaining));
  }
}
