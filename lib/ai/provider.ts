// lib/ai/provider.ts
// Vercel AI SDK Provider 配置
// 支持 GLM / DeepSeek / MiMo / 自定义（均兼容 OpenAI 格式）
// 默认 GLM 国内端点（零梯子可达）

import { createOpenAI } from "@ai-sdk/openai";
import type { LanguageModel } from "ai";
import type { ModelConfig } from "../types";
import { wrapModelWithObservability } from "./observability";
import type { SessionContext } from "./session-middleware";

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
  cachedPrimary = null;
  cachedFallback = undefined;
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

/**
 * 从已鉴权 session 创建模型（无缓存，每次新建）。
 * - 用 session.apiKey / baseURL / model 直接构造 OpenAI 兼容客户端
 * - 包裹 observability 计时（tag 为 `${label}:session`）
 * - session-middleware.ts 不 import 本文件，无循环依赖
 */
export function getModelFromSession(
  session: SessionContext,
  label: string,
): LanguageModel {
  const openai = createOpenAI({ baseURL: session.baseURL, apiKey: session.apiKey });
  return wrapModelWithObservability(openai(session.model), `${label}:session`);
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
  cachedPrimary = null;
  cachedFallback = undefined;
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

// ========== Provider Fallback 链（P1 可靠性） ==========
// 卡帕西视角：单点故障不可接受——一个 GLM 宕机就全盘崩溃是工程债。
// Fallback 链：主模型（AI_PROVIDER）30s 超时 → 切备选（AI_FALLBACK_PROVIDER）
// 设计：
//   - getModelWithFallback(): 返回主模型 + providerId（用于成本追踪）
//   - withFallback<T>(): 高阶函数，调用层包装（routes 显式使用）
//   - wrapModelWithFallback(): 模型代理，透明 fallback（resolveModel 集成用）
//   - 超时用 AbortSignal.timeout（Node 20+ / 现代浏览器原生支持）

const PRIMARY_TIMEOUT_MS = 30_000;

interface ProviderEntry {
  model: LanguageModel;
  providerId: string;
}

let cachedPrimary: ProviderEntry | null = null;
// undefined = 未解析；null = 已解析但无 fallback；ProviderEntry = 已解析
let cachedFallback: ProviderEntry | null | undefined;

function buildProviderEntry(
  provider: string,
  baseURL: string,
  model: string,
  apiKey: string,
): ProviderEntry {
  const openai = createOpenAI({ baseURL, apiKey });
  return {
    model: openai(model),
    providerId: `${provider}/${model}`,
  };
}

function resolvePrimary(): ProviderEntry {
  if (cachedPrimary) return cachedPrimary;
  const { baseURL, model, apiKey } = resolveConfig();
  if (!apiKey) {
    throw new Error(
      "AI API Key 未配置：请设置 AI_API_KEY 或对应 provider 的 key 环境变量",
    );
  }
  const provider = (getEnv("AI_PROVIDER") || "glm").toLowerCase();
  cachedPrimary = buildProviderEntry(provider, baseURL, model, apiKey);
  return cachedPrimary;
}

/**
 * 解析备选 provider（从 AI_FALLBACK_* 环境变量）。
 * 备选 apiKey 可独立配置（AI_FALLBACK_API_KEY），也可复用 provider 专属 key。
 * 未配置或配置不全时返回 null（无 fallback）。
 */
function resolveFallback(): ProviderEntry | null {
  if (cachedFallback !== undefined) return cachedFallback;
  const fallbackProvider = (getEnv("AI_FALLBACK_PROVIDER") || "").toLowerCase();
  if (!fallbackProvider) {
    cachedFallback = null;
    return null;
  }
  const preset = PRESETS[fallbackProvider];
  const baseURL = getEnv("AI_FALLBACK_API_URL") || preset?.baseURL;
  const model = getEnv("AI_FALLBACK_MODEL") || preset?.model;
  const apiKey =
    getEnv("AI_FALLBACK_API_KEY") ||
    (fallbackProvider === "glm" && getEnv("GLM_API_KEY")) ||
    (fallbackProvider === "deepseek" && getEnv("DEEPSEEK_API_KEY")) ||
    (fallbackProvider === "mimo" && getEnv("MIMO_API_KEY")) ||
    "";
  if (!baseURL || !model || !apiKey) {
    cachedFallback = null;
    return null;
  }
  cachedFallback = buildProviderEntry(fallbackProvider, baseURL, model, apiKey);
  return cachedFallback;
}

/**
 * 获取主模型 + providerId（带缓存）。
 * 用于需要标注实际使用模型 ID 的场景（成本追踪 / observability）。
 * 注意：此函数只返回主模型，fallback 由 withFallback() 在调用时执行。
 */
export function getModelWithFallback(): {
  model: LanguageModel;
  providerId: string;
} {
  const primary = resolvePrimary();
  return { model: primary.model, providerId: primary.providerId };
}

/** 获取备选 providerId（未配置返回 null），用于 observability 预期标注 */
export function getFallbackProviderId(): string | null {
  const fb = resolveFallback();
  return fb?.providerId ?? null;
}

/**
 * 带 fallback 的 AI 调用包装器（高阶函数）。
 * - 主模型 30s 超时（AbortSignal.timeout），超时或异常后切备选 provider
 * - 全部失败抛最后一个错误
 * - 返回值带 providerId 标注实际使用的模型（用于成本追踪）
 *
 * 用法：
 *   const { result, providerId } = await withFallback(
 *     (model, signal) => generateObject({ model, abortSignal: signal, ... })
 *   );
 */
export async function withFallback<T>(
  fn: (model: LanguageModel, signal?: AbortSignal) => Promise<T>,
): Promise<{ result: T; providerId: string }> {
  const primary = resolvePrimary();
  const fallback = resolveFallback();

  try {
    const signal = AbortSignal.timeout(PRIMARY_TIMEOUT_MS);
    const result = await fn(primary.model, signal);
    return { result, providerId: primary.providerId };
  } catch (primaryErr) {
    if (!fallback) throw primaryErr;
    console.warn(
      `[ai:fallback] primary (${primary.providerId}) failed, switching to ${fallback.providerId}:`,
      primaryErr instanceof Error ? primaryErr.message : String(primaryErr),
    );
    // fallback 不设超时，让备选 provider 有充足时间响应
    const result = await fn(fallback.model);
    return { result, providerId: fallback.providerId };
  }
}

/**
 * 合并多个 AbortSignal（任一触发即 abort）。
 * 优先用原生 AbortSignal.any（Node 20+ / 现代浏览器），否则手动组合。
 */
function combineSignals(
  ...signals: (AbortSignal | null | undefined)[]
): AbortSignal | undefined {
  const valid = signals.filter(Boolean) as AbortSignal[];
  if (valid.length === 0) return undefined;
  if (valid.length === 1) return valid[0];
  if (typeof AbortSignal.any === "function") {
    return AbortSignal.any(valid);
  }
  // 兜底：手动组合（旧运行时）
  const controller = new AbortController();
  for (const sig of valid) {
    if (sig.aborted) {
      controller.abort(sig.reason);
      break;
    }
    sig.addEventListener(
      "abort",
      () => controller.abort(sig.reason),
      { once: true },
    );
  }
  return controller.signal;
}

/**
 * 模型代理：透明 fallback（用于 resolveModel 集成，路由无需改动）。
 * - doGenerate/doStream 调用时：主模型 + 30s 超时
 * - 主模型失败/超时 → 切备选 provider（不设超时）
 * - 无备选时直接返回原模型（零开销）
 *
 * 注意：此包装不改变 model 的其他属性（如 specification），仅覆盖两个核心方法。
 */
export function wrapModelWithFallback(
  primary: LanguageModel,
  fallback: LanguageModel | null,
  primaryProviderId: string,
  fallbackProviderId: string | undefined,
  timeoutMs = PRIMARY_TIMEOUT_MS,
): LanguageModel {
  if (!fallback) return primary;
  const wrapped = Object.create(primary) as LanguageModel;

  wrapped.doGenerate = async function (
    params: Parameters<LanguageModel["doGenerate"]>[0],
  ) {
    try {
      const timeoutSignal = AbortSignal.timeout(timeoutMs);
      const combined = combineSignals(params.abortSignal, timeoutSignal);
      return await primary.doGenerate({ ...params, abortSignal: combined });
    } catch (primaryErr) {
      console.warn(
        `[ai:fallback] doGenerate primary (${primaryProviderId}) failed, switching to ${fallbackProviderId}:`,
        primaryErr instanceof Error ? primaryErr.message : String(primaryErr),
      );
      return await fallback.doGenerate(params);
    }
  };

  wrapped.doStream = async function (
    params: Parameters<LanguageModel["doStream"]>[0],
  ) {
    try {
      const timeoutSignal = AbortSignal.timeout(timeoutMs);
      const combined = combineSignals(params.abortSignal, timeoutSignal);
      return await primary.doStream({ ...params, abortSignal: combined });
    } catch (primaryErr) {
      console.warn(
        `[ai:fallback] doStream primary (${primaryProviderId}) failed, switching to ${fallbackProviderId}:`,
        primaryErr instanceof Error ? primaryErr.message : String(primaryErr),
      );
      return await fallback.doStream(params);
    }
  };

  return wrapped;
}

/** 内部导出：供 resolveModel 构建带 fallback 的默认模型 */
export function _resolvePrimaryEntry(): ProviderEntry | null {
  try {
    return resolvePrimary();
  } catch {
    return null;
  }
}

/** 内部导出：供 resolveModel 构建带 fallback 的默认模型 */
export function _resolveFallbackEntry(): ProviderEntry | null {
  return resolveFallback();
}
