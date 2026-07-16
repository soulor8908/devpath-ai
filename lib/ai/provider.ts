// lib/ai/provider.ts
// Vercel AI SDK Provider 配置
// 支持 GLM / DeepSeek / MiMo / 自定义（均兼容 OpenAI 格式）
// 默认 GLM 国内端点（零梯子可达）

import { createOpenAI } from "@ai-sdk/openai";
import type { LanguageModel } from "ai";
import type { ModelConfig } from "../types";

export type AIProvider = "glm" | "deepseek" | "mimo" | "custom";

interface ProviderConfig {
  baseURL: string;
  model: string;
  apiKey: string;
}

const PRESETS: Record<string, Omit<ProviderConfig, "apiKey">> = {
  glm: {
    baseURL: "https://open.bigmodel.cn/api/paas/v4",
    model: "glm-4-flash",
  },
  deepseek: {
    baseURL: "https://api.deepseek.com/v1",
    model: "deepseek-chat",
  },
  mimo: {
    baseURL: "https://api.xiaomimimo.com/v1",
    model: "mimo-v2-pro",
  },
};

// Cloudflare Pages 运行时环境变量访问
// next-on-pages 构建时 process.env 被内联为字面量，运行时环境变量必须通过 getRequestContext 获取
// 开发环境（next dev）走 process.env，生产环境（Cloudflare Pages）走 getRequestContext
declare global {
  // eslint-disable-next-line no-var
  var __cloudflareEnv: Record<string, string> | undefined;
}

function getEnv(key: string): string | undefined {
  // 1. 开发环境：process.env
  const pe = process.env[key];
  if (pe) return pe;
  // 2. Cloudflare Pages 运行时：通过 getRequestContext 注入的 env
  if (globalThis.__cloudflareEnv && globalThis.__cloudflareEnv[key]) {
    return globalThis.__cloudflareEnv[key];
  }
  return undefined;
}

/** 由 API route 在请求时调用，注入 Cloudflare 运行时环境变量 */
export function setCloudflareEnv(env: Record<string, unknown>): void {
  const filtered: Record<string, string> = {};
  for (const [k, v] of Object.entries(env)) {
    if (typeof v === "string") filtered[k] = v;
  }
  globalThis.__cloudflareEnv = filtered;
  // 重置缓存，让下次 getModel 重新读取
  cachedModel = null;
}

function resolveConfig(): ProviderConfig {
  const provider = (getEnv("AI_PROVIDER") || "glm").toLowerCase();
  const preset = PRESETS[provider];

  const baseURL = getEnv("AI_API_URL") || preset?.baseURL;
  const model = getEnv("AI_MODEL") || preset?.model;

  const apiKey =
    getEnv("AI_API_KEY") ||
    (provider === "glm" && getEnv("GLM_API_KEY")) ||
    (provider === "deepseek" && getEnv("DEEPSEEK_API_KEY")) ||
    (provider === "mimo" && getEnv("MIMO_API_KEY")) ||
    "";

  if (!baseURL || !model) {
    throw new Error(
      `未知的 AI_PROVIDER: ${provider}，请配置 AI_API_URL 和 AI_MODEL`
    );
  }

  return { baseURL, model, apiKey };
}

let cachedModel: LanguageModel | null = null;

/** 获取 AI 模型（带缓存，走环境变量配置） */
export function getModel(): LanguageModel {
  if (cachedModel) return cachedModel;
  const { baseURL, model, apiKey } = resolveConfig();
  if (!apiKey) {
    throw new Error(
      "AI API Key 未配置：请设置 AI_API_KEY 或对应 provider 的 key 环境变量"
    );
  }
  const openai = createOpenAI({ baseURL, apiKey });
  cachedModel = openai(model);
  return cachedModel;
}

/** 从用户 ModelConfig 创建模型（无缓存，每次新建） */
export function getModelFromConfig(config: ModelConfig): LanguageModel {
  if (!config.apiKey) {
    throw new Error(`模型 "${config.name}" 未配置 API Key`);
  }
  const openai = createOpenAI({ baseURL: config.baseURL, apiKey: config.apiKey });
  return openai(config.model);
}

/** 检查是否配置了 AI Key */
export function hasAIKey(): boolean {
  const provider = (getEnv("AI_PROVIDER") || "glm").toLowerCase();
  return Boolean(
    getEnv("AI_API_KEY") ||
      (provider === "glm" && getEnv("GLM_API_KEY")) ||
      (provider === "deepseek" && getEnv("DEEPSEEK_API_KEY")) ||
      (provider === "mimo" && getEnv("MIMO_API_KEY"))
  );
}

/** 向后兼容：原 MVP 接口 */
export function createAIProvider(): LanguageModel {
  return getModel();
}

/** 用于测试：重置缓存 */
export function _resetModelCache(): void {
  cachedModel = null;
}

export function getProviderInfo(): { provider: string; model: string; baseURL: string } {
  const provider = (getEnv("AI_PROVIDER") || "glm").toLowerCase();
  const preset = PRESETS[provider];
  return {
    provider,
    model: getEnv("AI_MODEL") || preset?.model || "unknown",
    baseURL: getEnv("AI_API_URL") || preset?.baseURL || "unknown",
  };
}

/** 获取预设列表（供前端展示） */
export function getPresets() {
  return PRESETS;
}
