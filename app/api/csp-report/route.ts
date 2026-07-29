// app/api/csp-report/route.ts
// CSP 违规报告接收端点
//
// 浏览器在 CSP 被触发时（如 inline script 被 unsafe-inline 放行但仍需观测，
// 或未来收紧 CSP 后捕获违规）会向 report-uri 指定的端点 POST JSON 报告。
// 本端点仅记录到 console，不存储（避免 KV 写配额消耗）。
//
// 2026-07-28 P2 安全：加 IP 维度限流 + 字段长度上限
//   - 防日志爆炸：攻击者脚本化刷 POST → Workers console 日志爆炸
//   - 防日志注入：攻击者构造畸形 csp-report 把任意字符串写进 console.warn
//   - 限流配额：50/IP/小时（CSP 报告是浏览器自动发，正常用户不会超）
//
// 运行时：Cloudflare Workers（nodejs_compat）

import { NextRequest, NextResponse } from "next/server";
import { getAuthSessionsKV } from "@/lib/ai/cloudflare-env";

export const runtime = "edge";

/** csp-report 端点 IP 维度限流：每 IP 每小时最多 50 次报告 */
const CSP_REPORT_RATE_LIMIT = 50;
const CSP_REPORT_TTL = 3600; // 1 小时

/** 字段长度上限（防日志注入 + 防 console 爆炸） */
const MAX_FIELD_LENGTH = 200;

/**
 * 从请求头提取客户端真实 IP（与 exchange 端点一致）。
 */
function getClientIp(req: NextRequest): string {
  const cfIp = req.headers.get("cf-connecting-ip");
  if (cfIp) return cfIp;
  const xff = req.headers.get("x-forwarded-for");
  if (xff) {
    const first = xff.split(",")[0]?.trim();
    if (first) return first;
  }
  return "unknown";
}

/**
 * IP 维度限流：防止刷 POST 爆炸 Workers console 日志。
 * 复用 AUTH_SESSIONS KV namespace，key 前缀 ratelimit:csp-report:。
 * KV 不可用时（本地开发）跳过限流。
 */
async function checkCspReportRateLimit(ip: string): Promise<boolean> {
  const kv = getAuthSessionsKV();
  if (!kv) return true; // 本地开发无 KV，放行
  const hourKey = `ratelimit:csp-report:${ip}:${Math.floor(Date.now() / 3600000)}`;
  const current = await kv.get(hourKey);
  const count = current ? parseInt(current, 10) : 0;
  return count < CSP_REPORT_RATE_LIMIT;
}

async function incrementCspReportRateLimit(ip: string): Promise<void> {
  const kv = getAuthSessionsKV();
  if (!kv) return; // 本地开发无 KV，跳过
  const hourKey = `ratelimit:csp-report:${ip}:${Math.floor(Date.now() / 3600000)}`;
  const current = await kv.get(hourKey);
  const count = current ? parseInt(current, 10) : 0;
  await kv.put(hourKey, String(count + 1), { expirationTtl: CSP_REPORT_TTL });
}

/** 安全截断字段长度 + 过滤控制字符（防日志注入） */
function sanitizeField(value: unknown): string {
  if (typeof value !== "string") return "unknown";
  return value
    .slice(0, MAX_FIELD_LENGTH)
    // 移除控制字符（防 ANSI 转义序列注入 / 终端控制字符）
    .replace(/[\x00-\x1f\x7f]/g, "")
    || "unknown";
}

/**
 * 接收 CSP 违规报告（POST application/csp-report 或 application/json）。
 * 浏览器发送格式：{ "csp-report": { "violated-directive": "...", ... } }
 * 本端点只做日志记录，始终返回 204 No Content（浏览器期望 2xx）。
 */
export async function POST(req: NextRequest) {
  // 1. IP 维度限流（防日志爆炸）
  const ip = getClientIp(req);
  const allowed = await checkCspReportRateLimit(ip);
  if (!allowed) {
    // 限流时仍返回 204，避免浏览器重试（CSP 报告失败不应影响用户体验）
    return new NextResponse(null, { status: 204 });
  }

  // 2. 解析 + 安全记录
  try {
    const body = await req.json();
    const report = body?.["csp-report"] ?? body;
    const directive = sanitizeField(report?.["violated-directive"]);
    const uri = sanitizeField(report?.["document-uri"]);
    const blocked = sanitizeField(report?.["blocked-uri"]);
    console.warn(
      `[CSP] violated-directive=${directive} document=${uri} blocked=${blocked}`,
    );
  } catch {
    // body 解析失败也静默（浏览器报告格式可能变化，不阻塞）
  }

  // 3. 计数（成功记录后才计数，避免恶意请求耗尽配额）
  await incrementCspReportRateLimit(ip);

  return new NextResponse(null, { status: 204 });
}
