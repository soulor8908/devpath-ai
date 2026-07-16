// lib/ai/resolve-model.ts
// 统一的 AI 模型解析：从请求 body 中提取 modelConfig，
// 如果用户自带 apiKey 则创建用户模型（免鉴权），否则回退到服务端默认模型（需鉴权）
//
// 所有 AI API 路由统一使用此 helper，确保用户配置的 DeepSeek/GLM 等模型
// 能跨所有 AI 功能（聊天、学习计划、周报、每日提醒等）生效

import type { LanguageModel } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import { getModel } from "./provider";
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
}

/**
 * 从 modelConfig 解析出可用的 LanguageModel。
 * - 有 apiKey → 创建用户自定义模型（免服务端鉴权）
 * - 无 apiKey → 回退服务端默认模型（需 API_TOKEN）
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
    return {
      model: wrapModelWithObservability(
        openai(modelConfig.model),
        `${label}:custom`,
      ),
      useServerModel: false,
    };
  }
  return {
    model: wrapModelWithObservability(getModel(), `${label}:default`),
    useServerModel: true,
  };
}
