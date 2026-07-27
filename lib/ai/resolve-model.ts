// lib/ai/resolve-model.ts
// 统一的 AI 模型解析：服务端默认模型 + fallback 链
//
// 2026-07-27 P0 安全加固（卡帕西视角：根因修复）：
//   - 删除 client apiKey 遗留分支（旧路径让 apiKey 明文走请求 body，绕过 session 鉴权）
//   - 所有用户 AI 调用必须通过 session 鉴权（requireSession 中间件）
//   - session.apiKey 在服务端解密后由 getModelFromSession 注入 provider，本 helper 不再触碰 apiKey
//   - 客户端 ModelConfig.apiKey 仅用于一次性 exchange，绝不持久化也不随请求传输
//
// Fallback 链（P1 可靠性增强，卡帕西视角：单点故障不可接受）：
//   - 主模型 30s 超时 → 切备选 provider（AI_FALLBACK_*）
//   - 透明代理（wrapModelWithFallback）：调用层无感知，路由代码无需改动
//   - 无备选配置时零开销（直接返回原模型）
//   - Cloudflare Workers 兼容性：Object.create + AbortSignal.timeout 均为 Web 标准，原生支持

import type { LanguageModel } from "ai";
import {
  getModel,
  getModelWithFallback,
  wrapModelWithFallback,
  _resolveFallbackEntry,
} from "./provider";
import { wrapModelWithObservability } from "./observability";

/**
 * 客户端传来的模型配置元数据（仅用于 observability 标注，不含 apiKey）。
 *
 * 2026-07-27 起 apiKey 不再出现在请求 body 中：
 *   - 客户端 ModelConfig.apiKey 仅在表单内存中持有，用于 exchange
 *   - exchange 后所有请求用 HMAC 签名（X-Session-Id + X-Request-Signature）
 *   - 服务端 requireSession 解密 session 拿到 apiKey，调 getModelFromSession 注入 provider
 *   - 本 helper 只负责服务端默认模型的 fallback 链，不读取 apiKey
 */
export interface ClientModelConfig {
  baseURL?: string;
  model?: string;
  name?: string;
  provider?: string;
}

export interface ResolvedModel {
  model: LanguageModel;
  /** true = 使用服务端默认模型（需要 session 鉴权）；保留字段，向后兼容 */
  useServerModel: boolean;
  /** 实际使用的主 provider ID（如 "glm/glm-4-flash"），用于 observability 标注 */
  providerId?: string;
  /** 是否启用了 fallback 链（用于 observability 标注） */
  hasFallback?: boolean;
}

/**
 * 解析出服务端默认模型 + fallback 链。
 *
 * 2026-07-27 起：所有用户 AI 调用通过 session 鉴权，session 内的 apiKey
 * 由 requireSession + getModelFromSession 处理，本函数只负责服务端默认模型的
 * fallback 包装。modelConfig 参数仅用于 observability 标注，不再影响模型选择。
 *
 * Fallback 链工作方式：
 *   1. 解析备选 provider（AI_FALLBACK_* 环境变量，未配置则返回 null）
 *   2. 无备选 → 直接返回主模型（零开销，与原行为一致）
 *   3. 有备选 → 用 wrapModelWithFallback 包装：主模型 30s 超时后切备选
 *   4. observability 包装在最外层：测量用户感知的总延迟（含 fallback 切换时间）
 */
export function resolveModel(
  _modelConfig: ClientModelConfig | undefined,
  label: string,
): ResolvedModel {
  void _modelConfig; // 仅用于 observability 标注，不影响模型选择

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
