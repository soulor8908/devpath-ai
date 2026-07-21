// lib/ai/retry.ts
// 通用指数退避重试工具
//
// 卡帕西视角：
//   - 重试是鲁棒性的最后一道闸，必须显式可观测、可定制
//   - 默认策略：网络错误/超时/5xx 重试；AbortError/SessionExpiredError 不重试
//   - 加 jitter（50%-100% 随机倍数）避免雷鸣群效应（thundering herd）
//   - 重试日志走 console.warn，便于调试时观察但不污染正常路径
//
// 用法：
//   import { retryWithBackoff } from "@/lib/ai/retry";
//   const data = await retryWithBackoff(() => fetch('/api/x').then(r => r.json()), {
//     maxRetries: 3,
//     baseDelay: 1000,
//   });
//
// 配套：
//   - aiFetch 已接入 retryWithBackoff（默认 maxRetries=2，避免影响 timeout 累积）
//   - 服务端 generateText/generateObject 可按需用 retryWithBackoff 包装
//   - 重试期间限流计数不回滚（保守计数，避免滥用）

export interface RetryOptions {
  /** 最大重试次数（不含首次调用），默认 3 */
  maxRetries?: number;
  /** 基础延迟（ms），默认 1000；指数退避：baseDelay * 2^attempt */
  baseDelay?: number;
  /** 最大延迟上限（ms），默认 10000（10 秒） */
  maxDelay?: number;
  /**
   * 判断错误是否重试
   * 默认：AbortError / SessionExpiredError 不重试，其他都重试
   */
  retryOn?: (err: unknown, attempt: number) => boolean;
  /**
   * 每次重试前回调（用于日志/observability）
   * 不抛错的回调被忽略
   */
  onRetry?: (info: {
    attempt: number;
    delay: number;
    error: unknown;
  }) => void;
}

/**
 * 默认重试判定：
 *   - AbortError（用户主动取消）→ 不重试
 *   - SessionExpiredError（session 失效，重试也是死循环）→ 不重试
 *   - 其他错误 → 重试
 */
function defaultRetryOn(err: unknown): boolean {
  if (err instanceof Error) {
    // 用户主动取消（fetch abort）
    if (err.name === "AbortError") return false;
    // session 失效：再重试也是 401，避免死循环
    if (err.name === "SessionExpiredError") return false;
    // aiFetch 包装的超时错误（含"请求超时"字样）→ 重试一次
    // 但用户主动中止（"请求已中止"）→ 不重试
    if (err.message === "请求已中止") return false;
  }
  return true;
}

/**
 * 指数退避重试
 *
 * @param fn 要执行的异步函数（每次重试都会重新调用）
 * @param options 重试选项
 * @returns fn 的返回值
 * @throws 最后一次失败的错误
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {},
): Promise<T> {
  const {
    maxRetries = 3,
    baseDelay = 1000,
    maxDelay = 10_000,
    retryOn = defaultRetryOn,
    onRetry,
  } = options;

  let lastError: unknown;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      // 最后一次失败直接抛
      if (attempt === maxRetries) break;
      // 判定是否重试
      if (!retryOn(err, attempt)) throw err;
      // 计算延迟：baseDelay * 2^attempt，封顶 maxDelay
      const rawDelay = Math.min(maxDelay, baseDelay * 2 ** attempt);
      // jitter：50%-100% 之间随机，避免雷鸣群
      const delay = Math.round(rawDelay * (0.5 + Math.random() * 0.5));
      onRetry?.({ attempt: attempt + 1, delay, error: err });
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
  throw lastError;
}
