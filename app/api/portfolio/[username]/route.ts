// app/api/portfolio/[username]/route.ts
// V4 作品集发布 API（Cloudflare KV）
// - GET  /api/portfolio/[username]：读取公开作品集（无需鉴权）
// - PUT  /api/portfolio/[username]：整体覆盖写入作品集（需 session 鉴权）
//
// 作品集是用户带去面试的"硬资产"——V4 通过的项目发布为公开作品。
// 客户端维护完整 portfolio 列表（IndexedDB），整体上传到 KV（与 achievements 同构）。
import { NextRequest, NextResponse } from "next/server";

import { initCloudflareEnv, getCloudflareKV } from "@/lib/ai/cloudflare-env";
import { requireSession } from "@/lib/ai/session-middleware";
import { createKVStore } from "@/lib/storage/kv";
import type { PublicPortfolio, PublicPortfolioEntry } from "@/lib/types";

export const runtime = "edge";

interface RouteContext {
  params: Promise<{ username: string }>;
}

export async function GET(_req: NextRequest, ctx: RouteContext) {
  await initCloudflareEnv();
  const { username } = await ctx.params;

  const store = createKVStore(getCloudflareKV());
  const portfolio = await store.getPortfolio(username);

  return NextResponse.json(
    { entries: portfolio?.entries ?? [] },
    { headers: { "Cache-Control": "public, max-age=300" } },
  );
}

export async function PUT(req: NextRequest, ctx: RouteContext) {
  await initCloudflareEnv();
  const { username } = await ctx.params;

  const sessionResult = await requireSession(req);
  if (sessionResult instanceof NextResponse) return sessionResult;
  const { session } = sessionResult;

  const store = createKVStore(getCloudflareKV());

  // 越权防护（IDOR 修复）：username 与 session.userId 绑定校验
  // - 已绑定：仅 owner 可写（防止任意 session 覆写他人公开作品集）
  // - 未绑定：当前 session 认领（首次写入；老数据无绑定时由首个写入者认领）
  const owner = await store.getUsernameOwner(username);
  if (owner && owner !== session.userId) {
    return NextResponse.json(
      { error: "无权修改该用户的作品集", code: "FORBIDDEN" },
      { status: 403 },
    );
  }
  if (!owner) {
    await store.claimUsername(username, session.userId);
  }

  let body: { entries?: PublicPortfolioEntry[] };
  try {
    body = (await req.json()) as { entries?: PublicPortfolioEntry[] };
  } catch {
    return NextResponse.json({ error: "请求体格式错误" }, { status: 400 });
  }

  if (!Array.isArray(body.entries)) {
    return NextResponse.json(
      { error: "entries 必须是数组" },
      { status: 400 },
    );
  }

  // 校验每条 entry 必须含必要字段 + publishedAt
  for (const e of body.entries) {
    if (!e.id || !e.title || !e.nodeId || !e.rubricId || !e.publishedAt) {
      return NextResponse.json(
        { error: `作品集条目字段缺失: ${e.id ?? "(无 id)"}` },
        { status: 400 },
      );
    }
    // URL 协议白名单（防存储型 XSS：公开页会直接渲染这些链接）
    for (const url of [e.repoUrl, e.deployUrl, e.docUrl]) {
      if (url !== undefined && url !== "" && !/^https?:\/\//i.test(url.trim())) {
        return NextResponse.json(
          { error: `链接必须是 http(s) URL: ${e.id}` },
          { status: 400 },
        );
      }
    }
  }

  const portfolio: PublicPortfolio = {
    username,
    entries: body.entries,
  };
  await store.setPortfolio(username, portfolio);

  return NextResponse.json({ ok: true, count: body.entries.length });
}
