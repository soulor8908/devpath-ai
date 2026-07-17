// lib/ai/resolve-model.ts
// 统一的 AI 模型解析：从请求 body 中提取 modelConfig，
// 如果用户自带 apiKey 则创建用户模型（免鉴权），否则回退到服务端默认模型（需鉴权）
//
// 所有 AI API 路由统一使用此 helper，确保用户配置的 DeepSeek/GLM 等模型
// 能跨所有 AI 功能（聊天、学习计划、周报、每日提醒等）生效
//
// P1 可靠性升级：服务端默认模型自动接入 fallback 链（主模型 30s 超时 → 切备选 provider）。
// 路由无需改动——fallback 通过 wrapModelWithFallback 代理在 model 层透明执行。

import type { LanguageModel } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import { getModel, wrapModelWithFallback, _resolvePrimaryEntry, _resolveFallbackEntry } from "./provider";
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
}

/**
 * 从 modelConfig 解析出可用的 LanguageModel。
 * - 有 apiKey → 创建用户自定义模型（免服务端鉴权，无 fallback——用户自己的 key 自己负责）
 * - 无 apiKey → 回退服务端默认模型（需 API_TOKEN），自动接入 fallback 链
 */
export function resolveModel(
  modelConfig: ClientModelConfig | undefined,
  label: string,
): ResolvedModel {
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
    };
  }
  // 服务端默认模型：接入 fallback 链
  const primary = _resolvePrimaryEntry();
  const fallback = _resolveFallbackEntry();
  if (primary) {
    // 用 fallback 代理包装主模型（无 fallback 时 wrapModelWithFallback 返回原模型，零开销）
    const withFallback = wrapModelWithFallback(
      primary.model,
      fallback?.model ?? null,
      primary.providerId,
      fallback?.providerId,
    );
    return {
      model: wrapModelWithObservability(withFallback, `${label}:default`),
      useServerModel: true,
      providerId: primary.providerId,
    };
  }
  // 兜底：primary 解析失败（缺 apiKey 等）——保留原行为让 getModel 抛错
  return {
    model: wrapModelWithObservability(getModel(), `${label}:default`),
    useServerModel: true,
  };
}
