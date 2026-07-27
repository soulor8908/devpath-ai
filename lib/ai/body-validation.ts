// lib/ai/body-validation.ts
// 服务端请求体校验中间件（2026-07-27 P1）
//
// 历史根因（卡帕西视角）：
//   18 个 AI 路由几乎逐字重复 `try { body = await req.json() } catch { 400 }`，
//   然后用 `body as { ... }` 裸类型断言 + 手写 if 校验，强度参差不齐：
//   - weekly 路由完全不校验 reviewLogs/statuses/emotions，畸形数据直传 LLM
//   - emotion-coping 不校验 tag 枚举，未知名 tag 静默落到 fallback
//   - learn/answers、learn/questions 不校验数组元素内部结构
//   依赖下游/LLM 兜底 → 攻击者可构造畸形 body 触发未定义行为或污染 prompt。
//
// 闭环解法：
//   抽公共 `parseRequestBody<T>(req, schema)` 中间件，沿用 `requireSession` 的
//   `{ data } | NextResponse` 联合返回模式，路由层用 `instanceof NextResponse` 判失败。
//   - zod safeParse 失败时返回 400 + 结构化 error（字段路径 + 错误码）
//   - 错误响应格式与现有路由一致：`{ error: string, code?: string }`
//   - 不消费原 req（用 req.json() 一次性读完，下游不再读）
//
// 使用示例：
//   ```ts
//   const result = await parseRequestBody(req, weeklyBodySchema);
//   if (result instanceof NextResponse) return result;
//   const { weekStart, learnLogs } = result.data;
//   ```
//
// 顺序约束：必须先 `requireSession` 再 `parseRequestBody`。
//   `requireSession` 内部用 `req.clone().text()` 读 body 算签名（不消费原 body），
//   `parseRequestBody` 用 `req.json()` 一次性消费原 body，二者不冲突。

import { NextResponse } from "next/server";
import { z, type ZodTypeAny } from "zod";

/** 校验成功时的返回值 */
export interface BodyValidationOk<T> {
  data: T;
}

/**
 * 用 zod schema 校验请求体。
 *
 * @param req 原始 Request（必须未消费过 body）
 * @param schema zod schema（推荐用 z.object({...}) 形式）
 * @returns 成功返回 { data }；失败返回 NextResponse(400)
 *
 * 类型签名说明：
 *   schema: ZodTypeAny —— 任意 zod schema（含 .default() / .optional() 等变换）
 *   返回值 O 通过 schema 推断为 Output 类型（变换后的形状，含默认值填充后的必填字段）
 *   调用方用 `z.infer<typeof schema>` 或解构 result.data 拿到正确类型
 */
export async function parseRequestBody<O>(
  req: Request,
  schema: ZodTypeAny & { _output: O },
): Promise<BodyValidationOk<O> | NextResponse> {
  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return NextResponse.json(
      { error: "请求体格式错误", code: "INVALID_JSON" },
      { status: 400 },
    );
  }

  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    // 取第一条错误的 path + message，避免响应体过大
    const first = parsed.error.issues[0];
    const fieldPath = first.path.length > 0 ? first.path.join(".") : "(root)";
    return NextResponse.json(
      {
        error: `字段校验失败：${fieldPath} ${first.message}`,
        code: "VALIDATION_FAILED",
        // 完整 issues 供调试（生产环境可移除）
        issues: parsed.error.issues.map((i) => ({
          path: i.path.join("."),
          message: i.message,
        })),
      },
      { status: 400 },
    );
  }

  return { data: parsed.data as O };
}

// ---------------------------------------------------------------------------
// 共享 schema 片段（被多个路由复用）
// ---------------------------------------------------------------------------

/** 非空字符串（trim 后 length > 0） */
export const nonEmptyString = z
  .string()
  .trim()
  .min(1, { message: "不能为空字符串" });

/** ISO 日期字符串（YYYY-MM-DD，简单校验，不强校验合法性） */
export const isoDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, { message: "日期格式必须为 YYYY-MM-DD" });

/** 安全字符串：trim 后非空 + 限长（防 prompt 注入过长内容） */
export function boundedString(max: number, min = 1): z.ZodString {
  return z
    .string()
    .trim()
    .min(min, { message: `长度不能小于 ${min}` })
    .max(max, { message: `长度不能超过 ${max}` });
}
