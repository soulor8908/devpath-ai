// lib/auth.ts
// 简单 token 校验：检查 Authorization: Bearer <token> 头
//
// AI Native 鉴权策略（2026-07 重构）：
//   - 用户自带 modelConfig（含 apiKey）→ 始终放行（用户用自己的额度）
//   - 使用服务端默认模型 + 未配置 API_TOKEN → 默认放行（免费用户由 KV 限流控制）
//   - 仅当部署方显式设置 REQUIRE_API_TOKEN=true 时才启用 token 校验
//
// 503 文案要点：未配置 AI 模型时，提示用户去「我的 → AI 模型配置」添加
// （不再误导为"用户信息未找到"）

import { NextResponse } from "next/server";

function getApiToken(): string | undefined {
  // 开发环境：process.env
  const pe = process.env.API_TOKEN;
  if (pe) return pe;
  // Cloudflare Pages 运行时（由 initCloudflareEnv 注入到 globalThis.__cloudflareEnv）
  const cf = (
    globalThis as Record<string, unknown>
  ).__cloudflareEnv as Record<string, string> | undefined;
  return cf?.API_TOKEN;
}

function shouldRequireToken(): boolean {
  // 显式开启：环境变量 REQUIRE_API_TOKEN === "true"
  const pe = process.env.REQUIRE_API_TOKEN;
  if (pe === "true") return true;
  const cf = (
    globalThis as Record<string, unknown>
  ).__cloudflareEnv as Record<string, string> | undefined;
  if (cf?.REQUIRE_API_TOKEN === "true") return true;
  return false;
}

/**
 * 校验请求是否携带有效 token。
 * @param req 请求对象
 * @param options.useServerModel 是否使用服务端默认模型（true 时可能需要 token 校验）
 * @param options.dataOperation 是否为数据操作（如 sync，不消耗 AI 额度，始终放行）
 * @returns null 表示通过；NextResponse(401/503) 表示拒绝
 */
export function requireAuth(
  req: Request,
  options?: { useServerModel?: boolean; dataOperation?: boolean }
): NextResponse | null {
  const expected = getApiToken();
  const useServerModel = options?.useServerModel ?? true;
  const dataOperation = options?.dataOperation ?? false;
  const requireToken = shouldRequireToken();

  // 用户自带 modelConfig（含 apiKey）→ 始终放行
  if (!useServerModel) return null;

  // 数据操作（如 sync）：不消耗 AI 额度，始终放行
  if (dataOperation) return null;

  // 仅当部署方显式启用 REQUIRE_API_TOKEN 时才做 token 校验
  if (!requireToken) {
    // 未启用 token 校验：免费用户由 KV 限流控制（chat=20/天、plan=5/天等）
    return null;
  }

  // 启用了 token 校验但未配置 API_TOKEN → 配置错误，提示部署方
  if (!expected) {
    console.error(
      "[auth] REQUIRE_API_TOKEN=true 但未配置 API_TOKEN。请在 Cloudflare/环境变量中设置 API_TOKEN。"
    );
    return NextResponse.json(
      {
        error:
          "未配置 AI 模型。请在「我的 → AI 模型配置」中添加模型（含 API Key、baseURL、模型名），并设为默认。",
        code: "NO_MODEL_CONFIG",
      },
      { status: 503 }
    );
  }

  // 启用了 token 校验且配置了 API_TOKEN：校验请求头
  const auth = req.headers.get("authorization");
  if (auth === `Bearer ${expected}`) return null;

  return NextResponse.json({ error: "未授权" }, { status: 401 });
}
