// app/api/public/[username]/route.ts
// 用户公开主页 API（Cloudflare KV）
// - GET  /api/public/[username]：读取 profile + stats + 公开成就（无需鉴权）
// - PUT  /api/public/[username]：写入 profile / achievements / stats（需鉴权）
//
// 鉴权策略（沿用原 functions/api/public/[username].ts 语义）：
//   - 服务端未配置任何 token（开发模式）→ 允许写入（profile 是用户自己的公开数据）
//   - 服务端配置了 token → 客户端需在 Authorization 头中携带匹配的 token
//   - GET 始终无需鉴权（公开数据）
// 运行时：edge。通过 getCloudflareKV() 拿到 Cloudflare KV binding，
//         无 binding 时降级为内存 mock（仅本地开发）。

import { NextRequest, NextResponse } from "next/server";
import { initCloudflareEnv, getCloudflareKV } from "@/lib/ai/cloudflare-env";
import { createKVStore } from "@/lib/storage/kv";
import type { PublicProfile, Achievement } from "@/lib/types";
import type { PublicStats } from "@/lib/storage/kv";

export const runtime = "edge";

const CF_CTX_SYMBOL = Symbol.for("__cloudflare-request-context__");

/** 读取 env：优先 process.env（next-on-pages 映射），降级到 Cloudflare 请求上下文 */
function getEnv(name: string): string | undefined {
  const pe = process.env[name];
  if (pe) return pe;
  try {
    const ctx = (
      globalThis as Record<symbol, { env?: Record<string, unknown> } | undefined>
    )[CF_CTX_SYMBOL];
    const v = ctx?.env?.[name];
    return typeof v === "string" ? v : undefined;
  } catch {
    return undefined;
  }
}

/** 收集服务端配置的所有有效 token（PUBLIC_AUTH_TOKEN + API_TOKEN） */
function getValidTokens(): string[] {
  return [getEnv("PUBLIC_AUTH_TOKEN"), getEnv("API_TOKEN")].filter(
    (t): t is string => typeof t === "string" && t.length > 0,
  );
}

interface RouteContext {
  params: { username: string };
}

export async function GET(_req: NextRequest, ctx: RouteContext) {
  await initCloudflareEnv();
  const username = ctx.params.username;

  const store = createKVStore(getCloudflareKV());
  const profile = await store.getProfile(username);
  if (!profile) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }

  const stats = await store.getStats(username);
  // 仅当用户显式开启 visibility.achievements 时返回公开成就
  const achievements =
    profile.visibility?.achievements === true
      ? await store.getPublicAchievements(username)
      : [];

  return NextResponse.json(
    { profile, stats, achievements },
    { headers: { "Cache-Control": "public, max-age=300" } },
  );
}

export async function PUT(req: NextRequest, ctx: RouteContext) {
  await initCloudflareEnv();
  const username = ctx.params.username;

  // 鉴权（与原 functions 实现一致：PUBLIC_AUTH_TOKEN + API_TOKEN）
  const authHeader = req.headers.get("Authorization") ?? "";
  const token = authHeader.replace(/^Bearer\s+/i, "");
  const validTokens = getValidTokens();

  // 1. 服务端未配置任何 token（开发模式）→ 放行（profile 是用户自己的公开数据）
  // 2. 服务端配置了 token → 客户端必须携带匹配的 token
  if (validTokens.length > 0 && !token) {
    return NextResponse.json(
      {
        error: "unauthorized",
        message:
          "服务端已启用鉴权，请在「我的 → 设置 → API 鉴权 Token」中填入与部署方一致的 Token",
      },
      { status: 401 },
    );
  }
  if (validTokens.length > 0 && !validTokens.includes(token)) {
    return NextResponse.json(
      {
        error: "unauthorized",
        message: "Token 不匹配，请检查「我的 → 设置 → API 鉴权 Token」中的值",
      },
      { status: 401 },
    );
  }

  const store = createKVStore(getCloudflareKV());

  let body: {
    profile?: Partial<PublicProfile>;
    stats?: Partial<PublicStats>;
    achievements?: Achievement[];
  };
  try {
    body = (await req.json()) as {
      profile?: Partial<PublicProfile>;
      stats?: Partial<PublicStats>;
      achievements?: Achievement[];
    };
  } catch {
    return NextResponse.json({ error: "请求体格式错误" }, { status: 400 });
  }

  if (body.profile) {
    const existing = (await store.getProfile(username)) ?? {
      username,
      // 不再默认 displayName = username（会间接泄露用户名）
      // 用户未设置 displayName 时显示为空，由前端显示"未设置"
      displayName: "",
      avatar: undefined,
      bio: "",
      visibility: {
        radar: true,
        heatmap: true,
        currentTopic: true,
        notes: false,
        achievements: false,
      },
      followerCount: 0,
      followingCount: 0,
      updatedAt: new Date().toISOString(),
    };
    const merged: PublicProfile = {
      ...existing,
      ...body.profile,
      username, // 防止篡改 username
      updatedAt: new Date().toISOString(),
    };
    await store.setProfile(merged);

    // 成就墙关闭时，清空云端成就（避免残留公开数据）
    if (merged.visibility.achievements === false) {
      await store.setPublicAchievements(username, []);
    }
  }

  // 成就列表整体覆盖写入（仅当客户端显式上传时）
  if (body.achievements !== undefined) {
    await store.setPublicAchievements(username, body.achievements);
  }

  if (body.stats) {
    await store.updateStats(username, body.stats);
  }

  return NextResponse.json({ ok: true });
}
