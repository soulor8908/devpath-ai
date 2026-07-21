// lib/ai/observability.ts
// AI 调用观测层（轻量级）
// Karpathy："你优化不了你测不了的。"
// 包装 LanguageModel，在每次调用前后记录 latency / 成功/失败 / 调用场景
// 不引入外部依赖、不阻塞主流程，失败时只静默打印 console.warn
// 设计：
//   - 仅记录到 console（Cloudflare Pages 边缘日志可见）
//   - 不持久化（持久化由后续观测平台接入）
//   - 同步接口、零开销路径（用 performance.now()）
//
// Trace 链路（t8）：
//   - observeCall 接受 traceId 参数，写入 metric
//   - 一次用户操作可能触发多轮 AI 调用，traceId 让它们在日志里关联起来
//   - 服务端路由从 X-Trace-Id header 读 traceId 后传入 observeCall

import type { LanguageModel } from "ai";

interface CallMetric {
  tag: string;
  ok: boolean;
  durationMs: number;
  error?: string;
  timestamp: string;
  /** 实际使用的 provider ID（如 "glm/glm-4-flash"）；fallback 时与主 provider 不同 */
  providerId?: string;
  /** 一次用户操作的链路 ID（贯穿多轮 AI 调用，便于日志检索） */
  traceId?: string;
}

// 内存缓冲（仅本地开发可见，生产环境走 console）
const METRIC_BUFFER: CallMetric[] = [];
const MAX_BUFFER = 100;

function recordMetric(metric: CallMetric): void {
  METRIC_BUFFER.push(metric);
  if (METRIC_BUFFER.length > MAX_BUFFER) METRIC_BUFFER.shift();
  const traceSuffix = metric.traceId ? ` trace=${metric.traceId}` : "";
  if (metric.ok) {
    console.log(`[ai:observe] ${metric.tag} ok in ${metric.durationMs}ms${traceSuffix}`);
  } else {
    console.warn(
      `[ai:observe] ${metric.tag} FAIL in ${metric.durationMs}ms${traceSuffix}: ${metric.error}`
    );
  }
}

/** 读取本地内存中的最近 N 条指标（用于调试页面或后续 dashboard） */
export function getRecentMetrics(limit = 50): CallMetric[] {
  return METRIC_BUFFER.slice(-limit);
}

/**
 * 包裹一个 LanguageModel，对 doGenerate/doStream 计时并记录指标
 * 失败不吞错，重抛原异常。返回的对象语义与原 model 一致。
 *
 * @param tag 调用场景标签，如 "chat:default"、"knowledge:decompose"
 * @param options.traceId 一次用户操作的链路 ID（贯穿多轮 AI 调用）
 */
export function wrapModelWithObservability(
  model: LanguageModel,
  tag: string,
  options?: { traceId?: string },
): LanguageModel {
  // 直接代理原对象，覆盖 doGenerate / doStream 两个核心方法
  const wrapped = Object.create(model) as LanguageModel;

  if (typeof model.doGenerate === "function") {
    wrapped.doGenerate = async function (
      params: Parameters<LanguageModel["doGenerate"]>[0]
    ) {
      const start = performance.now();
      try {
        const result = await model.doGenerate(params);
        recordMetric({
          tag,
          ok: true,
          durationMs: Math.round(performance.now() - start),
          timestamp: new Date().toISOString(),
          traceId: options?.traceId,
        });
        return result;
      } catch (e) {
        recordMetric({
          tag,
          ok: false,
          durationMs: Math.round(performance.now() - start),
          error: e instanceof Error ? e.message : String(e),
          timestamp: new Date().toISOString(),
          traceId: options?.traceId,
        });
        throw e;
      }
    };
  }

  if (typeof model.doStream === "function") {
    wrapped.doStream = async function (
      params: Parameters<LanguageModel["doStream"]>[0]
    ) {
      const start = performance.now();
      try {
        const result = await model.doStream(params);
        recordMetric({
          tag,
          ok: true,
          durationMs: Math.round(performance.now() - start),
          timestamp: new Date().toISOString(),
          traceId: options?.traceId,
        });
        return result;
      } catch (e) {
        recordMetric({
          tag,
          ok: false,
          durationMs: Math.round(performance.now() - start),
          error: e instanceof Error ? e.message : String(e),
          timestamp: new Date().toISOString(),
          traceId: options?.traceId,
        });
        throw e;
      }
    };
  }

  return wrapped;
}

/**
 * 通用计时包装器：用于非 LanguageModel 路径的 AI 调用（如直接 generateObject）
 * 用法：
 *   const result = await observeCall("knowledge:decompose", () => generateObject({...}));
 *   // 标注实际使用的 provider（fallback 时与主 provider 不同）
 *   await observeCall("chat", () => fn(), { providerId: "deepseek/deepseek-chat" });
 *   // 附带 traceId（一次用户操作贯穿多轮 AI 调用）
 *   await observeCall("knowledge:decompose", () => fn(), { traceId });
 */
export async function observeCall<T>(
  tag: string,
  fn: () => Promise<T>,
  options?: { providerId?: string; traceId?: string },
): Promise<T> {
  const start = performance.now();
  try {
    const result = await fn();
    recordMetric({
      tag,
      ok: true,
      durationMs: Math.round(performance.now() - start),
      timestamp: new Date().toISOString(),
      providerId: options?.providerId,
      traceId: options?.traceId,
    });
    return result;
  } catch (e) {
    recordMetric({
      tag,
      ok: false,
      durationMs: Math.round(performance.now() - start),
      error: e instanceof Error ? e.message : String(e),
      timestamp: new Date().toISOString(),
      providerId: options?.providerId,
      traceId: options?.traceId,
    });
    throw e;
  }
}
