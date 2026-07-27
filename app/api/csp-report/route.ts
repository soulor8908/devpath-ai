// app/api/csp-report/route.ts
// CSP 违规报告接收端点
//
// 浏览器在 CSP 被触发时（如 inline script 被 unsafe-inline 放行但仍需观测，
// 或未来收紧 CSP 后捕获违规）会向 report-uri 指定的端点 POST JSON 报告。
// 本端点仅记录到 console，不存储（避免 KV 写配额消耗）。
//
// 运行时：Cloudflare Workers（nodejs_compat）

import { NextRequest, NextResponse } from "next/server";

/**
 * 接收 CSP 违规报告（POST application/csp-report 或 application/json）。
 * 浏览器发送格式：{ "csp-report": { "violated-directive": "...", ... } }
 * 本端点只做日志记录，始终返回 204 No Content（浏览器期望 2xx）。
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const report = body?.["csp-report"] ?? body;
    const directive = report?.["violated-directive"] ?? "unknown";
    const uri = report?.["document-uri"] ?? "unknown";
    const blocked = report?.["blocked-uri"] ?? "unknown";
    console.warn(
      `[CSP] violated-directive=${directive} document=${uri} blocked=${blocked}`,
    );
  } catch {
    // body 解析失败也静默（浏览器报告格式可能变化，不阻塞）
  }
  return new NextResponse(null, { status: 204 });
}
