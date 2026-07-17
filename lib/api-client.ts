// lib/api-client.ts
// 客户端 API 调用封装：自动从 IndexedDB 读取 token 并附加 Authorization 头
// token 由用户在 profile 页面配置（存 IndexedDB key="auth:api_token"）
//
// AI Native 鉴权策略：
//   - apiFetch：普通 API 调用（同步/复习等），只附加 token
//   - aiFetch：AI API 调用（学习/周报/调整计划等），自动注入 modelConfig
//     用户配置了自己的模型（含 apiKey）→ 服务端免鉴权，用用户额度
//     未配置模型 → 服务端用默认模型，需 API_TOKEN 鉴权

import { getItem, setItem } from "@/lib/storage/db";
import { getDefaultModelConfig } from "@/lib/model-config";
import { getUserId } from "@/lib/sync";
import type { ModelConfig } from "@/lib/types";

const TOKEN_KEY = "auth:api_token";

export async function getApiToken(): Promise<string | null> {
  return (await getItem<string>(TOKEN_KEY)) ?? null;
}

export async function setApiToken(token: string): Promise<void> {
  await setItem(TOKEN_KEY, token);
}

/** 带 token 的 fetch 封装（非 AI 路由用） */
export async function apiFetch(
  url: string,
  options: RequestInit = {},
): Promise<Response> {
  const token = await getApiToken();
  const headers = new Headers(options.headers);
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }
  return fetch(url, { ...options, headers });
}

/**
 * AI API 专用 fetch 封装：自动注入用户默认模型配置到请求 body。
 * 如果用户配置了模型（含 apiKey），服务端将使用用户模型并跳过鉴权。
 * 如果未配置模型，仅附加 token，服务端使用默认模型并要求鉴权。
 *
 * 超时：60 秒（非流式请求的兜底）。流式接口（/api/learn/answers）
 * 不走 aiFetch，不受此超时影响——流式响应靠逐题推进天然防止挂死。
 */
export async function aiFetch(
  url: string,
  options: RequestInit = {},
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 60000);

  try {
    const token = await getApiToken();
    const modelConfig = await getDefaultModelConfig();

    const headers = new Headers(options.headers);
    headers.set("Content-Type", "application/json");
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }

    // 将 modelConfig 注入到 JSON body 中
    let body = options.body;
    if (modelConfig && modelConfig.apiKey) {
      const configToSend: Partial<ModelConfig> = {
        baseURL: modelConfig.baseURL,
        apiKey: modelConfig.apiKey,
        model: modelConfig.model,
        name: modelConfig.name,
        provider: modelConfig.provider,
      };
      if (typeof body === "string") {
        try {
          const parsed = JSON.parse(body);
          body = JSON.stringify({ ...parsed, modelConfig: configToSend });
        } catch {
          // body 不是 JSON，保持原样
        }
      } else if (body == null) {
        body = JSON.stringify({ modelConfig: configToSend });
      }
    }

    // 注入 userId（服务端限流用，失败静默——限流仅在 useServerModel=true 时生效）
    const userId = await getUserId().catch(() => undefined);
    if (userId && typeof body === "string") {
      try {
        const parsed = JSON.parse(body);
        body = JSON.stringify({ ...parsed, userId });
      } catch {
        // body 不是 JSON，保持原样
      }
    } else if (userId && body == null) {
      body = JSON.stringify({ userId });
    }

    // 合并外部 signal 与超时 signal：任一触发即中止
    // 若调用方传了 signal，则在外部 abort 时同步 abort 本控制器
    const externalSignal = options.signal;
    if (externalSignal) {
      if (externalSignal.aborted) {
        controller.abort();
      } else {
        externalSignal.addEventListener("abort", () => controller.abort(), {
          once: true,
        });
      }
    }

    const res = await fetch(url, {
      ...options,
      headers,
      body,
      signal: controller.signal,
    });
    return res;
  } catch (err) {
    if (err instanceof Error && err.name === "AbortError") {
      throw new Error("请求超时（60秒），请重试");
    }
    throw err;
  } finally {
    clearTimeout(timeoutId);
  }
}
