// lib/ai/trace.ts
// AI 调用链路追踪：给一次用户操作生成 traceId，贯穿多轮 AI 调用
//
// 卡帕西视角：
//   - 一次用户操作（如"生成学习计划"）可能触发多轮 AI 调用：
//     拆解 → 生成题目 → 可行性评分 → 落库，每轮都是独立 AI 调用
//   - 没有 traceId 时，这些调用在日志里是孤立的，难以排查"为什么这次生成慢"
//   - traceId 让所有相关调用关联起来，便于日志检索 + 性能分析
//
// 设计：
//   - 客户端：startUserTrace() 生成 ID 存 sessionStorage，跨页面/路由保持
//   - 客户端：aiFetch 自动加 X-Trace-Id header（从 sessionStorage 读）
//   - 服务端：从 X-Trace-Id header 读，不存在则自生成
//   - 服务端：observeCall 时附带 traceId 到 metric
//   - 用户操作结束：endUserTrace() 清除 sessionStorage
//
// trace ID 格式：trace_<base36 时间戳>_<6 位随机>
//   - 总长度 20-30 字符，便于日志显示
//   - 无版本前缀（避免长 ID），用前缀 "trace_" 识别
//   - 时间戳 base36 让 ID 包含时间信息，肉眼可读

export const TRACE_ID_HEADER = "X-Trace-Id";

/** sessionStorage key（仅在客户端使用） */
const TRACE_ID_STORAGE_KEY = "ai:trace-id";

/**
 * 生成 trace ID
 * 格式：trace_<base36 时间戳>_<6 位随机>
 */
export function generateTraceId(): string {
  const ts = Date.now().toString(36);
  const rand = Math.random().toString(36).slice(2, 8);
  return `trace_${ts}_${rand}`;
}

/** 校验 trace ID 合法性（防止 header 注入） */
export function isValidTraceId(id: string): boolean {
  if (typeof id !== "string") return false;
  if (!id.startsWith("trace_")) return false;
  if (id.length < 15 || id.length > 60) return false;
  // 只允许 base36 字符 + 下划线
  return /^trace_[a-z0-9]+_[a-z0-9]+$/.test(id);
}

/**
 * 服务端入口：从请求头读 trace ID，不存在则生成
 * 用于 API 路由的 POST handler
 */
export function getOrCreateTraceIdFromRequest(req: Request): string {
  const fromHeader = req.headers.get(TRACE_ID_HEADER);
  if (fromHeader && isValidTraceId(fromHeader)) return fromHeader;
  return generateTraceId();
}

/**
 * 客户端：开始一个新的用户 trace（覆盖旧的）
 * 一次用户操作开始时调用
 * @returns 新生成的 trace ID
 */
export function startUserTrace(): string {
  const id = generateTraceId();
  if (typeof window !== "undefined") {
    try {
      sessionStorage.setItem(TRACE_ID_STORAGE_KEY, id);
    } catch {
      // sessionStorage 不可用（隐私模式等），降级为不持久化
      // 调用方仍可用返回的 id 显式传递
    }
  }
  return id;
}

/**
 * 客户端：读取当前 trace ID（不存在则生成并存储）
 * 用于 aiFetch 自动加 header
 */
export function getOrCreateTraceId(): string {
  if (typeof window === "undefined") return generateTraceId();
  let id: string | null = null;
  try {
    id = sessionStorage.getItem(TRACE_ID_STORAGE_KEY);
  } catch {
    // sessionStorage 不可用
  }
  if (!id || !isValidTraceId(id)) {
    id = startUserTrace();
  }
  return id;
}

/**
 * 客户端：结束当前 trace（清除 sessionStorage）
 * 用户操作完成后调用（如生成计划成功/失败后）
 */
export function endUserTrace(): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.removeItem(TRACE_ID_STORAGE_KEY);
  } catch {
    // ignore
  }
}

/**
 * 客户端：在不持有 trace 上下文时，给单次请求强制注入 trace ID
 * 用于不想持久化但希望本次请求可追溯的场景（如后台同步）
 */
export function withTrace<T>(fn: (traceId: string) => Promise<T>): Promise<T> {
  const id = startUserTrace();
  return fn(id).finally(() => {
    endUserTrace();
  });
}
