// app/api/public/[username]/route.ts
// 用户公开主页 API（Cloudflare KV）
// - GET  /api/public/[username]：读取 profile + stats + 公开成就（无需鉴权）
// - PUT  /api/public/[username]：写入 profile / achievements / stats（需 session 鉴权）
//
// 鉴权（apiKey Session 安全架构改造后）：
//   - GET 始终无需鉴权（公开数据，任何人都可查看用户主页）
//   - PUT 改用 requireSession 校验签名 + 注入 session（不再依赖 PUBLIC_AUTH_TOKEN / API_TOKEN）
//   - username 来自 URL，session.userId 用于审计（不强制校验 username 与 userId 绑定，
//     因为 username 是用户自设置的别名，可变；服务端只校验请求来自有效 session）
// 运行时：edge。通过 getCloudflareKV() 拿到 Cloudflare KV binding，
//         无 binding 时降级为内存 mock（仅本地开发）。

import { NextRequest, NextResponse } from "next/server";
import { initCloudflareEnv, getCloudflareKV } from "@/lib/ai/cloudflare-env";
import { requireSession } from "@/lib/ai/session-middleware";
import { createKVStore } from "@/lib/storage/kv";
import type { PublicProfile, Achievement } from "@/lib/types";
import type { PublicStats } from "@/lib/storage/kv";

export const runtime = "edge";

interface RouteContext {
  params: Promise<{ username: string }>;
}

export async function GET(_req: NextRequest, ctx: RouteContext) {
  await initCloudflareEnv();
  const { username } = await ctx.params;

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
  const { username } = await ctx.params;

  // 统一 session 鉴权（requireSession 内部用 req.clone().text() 读 body 签名校验，不消费原 body）
  const sessionResult = await requireSession(req);
  if (sessionResult instanceof NextResponse) return sessionResult;
  // session 注入成功即放行（userId 不参与 username 校验，因 username 是可变别名）
  void sessionResult;

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
