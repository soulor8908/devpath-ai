// lib/ai/resolve-model.ts
// 统一的 AI 模型解析：从请求 body 中提取 modelConfig，
// 如果用户自带 apiKey 则创建用户模型（免鉴权），否则回退到服务端默认模型（需鉴权）
//
// 所有 AI API 路由统一使用此 helper，确保用户配置的 DeepSeek/GLM 等模型
// 能跨所有 AI 功能（聊天、学习计划、周报、每日提醒等）生效
//
// Fallback 链（P1 可靠性增强，卡帕西视角：单点故障不可接受）：
//   - 服务端默认模型分支：主模型 30s 超时 → 切备选 provider（AI_FALLBACK_*）
//   - 透明代理（wrapModelWithFallback）：调用层无感知，路由代码无需改动
//   - 无备选配置时零开销（直接返回原模型）
//   - 用户自带 apiKey 分支：不启用 fallback（用户主动选择模型，切换会违背预期）
//   - Cloudflare Workers 兼容性：Object.create + AbortSignal.timeout 均为 Web 标准，原生支持

import type { LanguageModel } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import {
  getModel,
  getModelWithFallback,
  wrapModelWithFallback,
  _resolveFallbackEntry,
} from "./provider";
import { wrapModelWithObservability } from "./observability";

/** 客户端传来的模型配置（与 lib/types.ts ModelConfig 兼容） */
export interface ClientModelConfig {
  baseURL?: string;
  apiKey?: string;
  model?: string;
  name?: string;
  provider?: string;
}

export interface ResolvedModel {
  model: LanguageModel;
  /** true = 使用服务端默认模型（需要 API_TOKEN 鉴权）；false = 用户自带模型（免鉴权） */
  useServerModel: boolean;
  /** 实际使用的主 provider ID（如 "glm/glm-4-flash"），用于 observability 标注 */
  providerId?: string;
  /** 是否启用了 fallback 链（用于 observability 标注）；undefined = 用户自带模型未启用 */
  hasFallback?: boolean;
}

/**
 * 从 modelConfig 解析出可用的 LanguageModel。
 * - 有 apiKey → 创建用户自定义模型（免服务端鉴权，不启用 fallback）
 * - 无 apiKey → 服务端默认模型 + fallback 链（AI_FALLBACK_PROVIDER 配置时启用）
 *
 * Fallback 链工作方式：
 *   1. 解析备选 provider（AI_FALLBACK_* 环境变量，未配置则返回 null）
 *   2. 无备选 → 直接返回主模型（零开销，与原行为一致）
 *   3. 有备选 → 用 wrapModelWithFallback 包装：主模型 30s 超时后切备选
 *   4. observability 包装在最外层：测量用户感知的总延迟（含 fallback 切换时间）
 */
export function resolveModel(
  modelConfig: ClientModelConfig | undefined,
  label: string,
): ResolvedModel {
  // 用户自带 apiKey：创建自定义模型（免服务端鉴权）
  // 不启用 fallback —— 用户主动选择模型，自动切换会违背预期
  if (
    modelConfig &&
    modelConfig.apiKey &&
    modelConfig.baseURL &&
    modelConfig.model
  ) {
    const openai = createOpenAI({
      baseURL: modelConfig.baseURL,
      apiKey: modelConfig.apiKey,
    });
    const providerId = `${modelConfig.provider ?? "custom"}/${modelConfig.model}`;
    return {
      model: wrapModelWithObservability(
        openai(modelConfig.model),
        `${label}:custom`,
      ),
      useServerModel: false,
      providerId,
      hasFallback: false,
    };
  }

  // 服务端默认模型 + fallback 链
  const fallback = _resolveFallbackEntry();
  if (!fallback) {
    // 无 fallback 配置：直接用 getModel()（保持原行为，零开销）
    return {
      model: wrapModelWithObservability(getModel(), `${label}:default`),
      useServerModel: true,
      hasFallback: false,
    };
  }

  // 有 fallback 配置：包装主模型 + 透明 fallback
  // wrapModelWithFallback 用 Object.create 代理主模型，仅覆盖 doGenerate/doStream
  // 主模型 30s 超时（AbortSignal.timeout）→ 切备选 provider（不设超时）
  const primary = getModelWithFallback();
  const wrapped = wrapModelWithFallback(
    primary.model,
    fallback.model,
    primary.providerId,
    fallback.providerId,
  );

  return {
    model: wrapModelWithObservability(wrapped, `${label}:default`),
    useServerModel: true,
    providerId: primary.providerId,
    hasFallback: true,
  };
}
