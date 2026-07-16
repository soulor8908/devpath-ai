// functions/api/public/[username].ts
// Cloudflare Pages Function（边缘运行时）
// GET：读 KV → 返回 PublicProfile + PublicStats
// PUT：验证身份 → 更新 KV
//
// 鉴权策略（与 /api/sync 的 dataOperation 保持一致）：
//   - 服务端未配置任何 token（开发模式）→ 允许写入（profile 是用户自己的公开数据）
//   - 服务端配置了 token → 客户端需在 Authorization 头中携带匹配的 token
//   - GET 始终无需鉴权（公开数据）

import { createKVStore } from "../../../lib/storage/kv";
import type { PublicProfile, Achievement } from "../../../lib/types";
import type { PublicStats } from "../../../lib/storage/kv";

// 最小类型定义（无 @cloudflare/workers-types 时使用）
interface KVNamespace {
  get(key: string): Promise<string | null>;
  put(key: string, value: string): Promise<void>;
}

interface PagesEnv {
  KV: KVNamespace;
  PUBLIC_AUTH_TOKEN?: string;
  API_TOKEN?: string;
}

interface PagesContext {
  request: Request;
  env: PagesEnv;
  params: { username: string };
}

type PagesFunction<T = PagesEnv> = (context: PagesContext & { env: T }) => Promise<Response> | Response;

export const onRequestGet: PagesFunction<PagesEnv> = async (context) => {
  const username = context.params.username as string;
  const kv = createKVStore(context.env.KV as unknown as { get: (k: string) => Promise<string | null>; put: (k: string, v: string) => Promise<void> });

  const profile = await kv.getProfile(username);
  if (!profile) {
    return new Response(JSON.stringify({ error: "not found" }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    });
  }

  const stats = await kv.getStats(username);
  // 仅当用户显式开启 visibility.achievements 时返回公开成就
  const achievements =
    profile.visibility?.achievements === true
      ? await kv.getPublicAchievements(username)
      : [];
  return new Response(JSON.stringify({ profile, stats, achievements }), {
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "public, max-age=300", // 5 分钟边缘缓存
    },
  });
};

export const onRequestPut: PagesFunction<PagesEnv> = async (context) => {
  const username = context.params.username as string;
  const authHeader = context.request.headers.get("Authorization") ?? "";
  const token = authHeader.replace(/^Bearer\s+/i, "");

  // 收集服务端配置的所有有效 token
  const validTokens = [context.env.PUBLIC_AUTH_TOKEN, context.env.API_TOKEN].filter(
    (t): t is string => typeof t === "string" && t.length > 0,
  );

  // 鉴权策略：
  // 1. 服务端未配置任何 token（开发模式）→ 放行（profile 是用户自己的公开数据）
  // 2. 服务端配置了 token → 客户端必须携带匹配的 token
  if (validTokens.length > 0 && !token) {
    return new Response(
      JSON.stringify({
        error: "unauthorized",
        message: "服务端已启用鉴权，请在「我的 → 设置 → API 鉴权 Token」中填入与部署方一致的 Token",
      }),
      { status: 401, headers: { "Content-Type": "application/json" } },
    );
  }
  if (validTokens.length > 0 && !validTokens.includes(token)) {
    return new Response(
      JSON.stringify({
        error: "unauthorized",
        message: "Token 不匹配，请检查「我的 → 设置 → API 鉴权 Token」中的值",
      }),
      { status: 401, headers: { "Content-Type": "application/json" } },
    );
  }

  const kv = createKVStore(context.env.KV as unknown as { get: (k: string) => Promise<string | null>; put: (k: string, v: string) => Promise<void> });

  const body = (await context.request.json()) as {
    profile?: Partial<PublicProfile>;
    stats?: Partial<PublicStats>;
    achievements?: Achievement[];
  };

  if (body.profile) {
    const existing = (await kv.getProfile(username)) ?? {
      username,
      displayName: username,
      avatar: undefined,
      bio: "",
      visibility: { radar: true, heatmap: true, currentTopic: true, notes: false, achievements: false },
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
    await kv.setProfile(merged);

    // 成就墙关闭时，清空云端成就（避免残留公开数据）
    if (merged.visibility.achievements === false) {
      await kv.setPublicAchievements(username, []);
    }
  }

  // 成就列表整体覆盖写入（仅当客户端显式上传时）
  if (body.achievements !== undefined) {
    await kv.setPublicAchievements(username, body.achievements);
  }

  if (body.stats) {
    await kv.updateStats(username, body.stats);
  }

  return new Response(JSON.stringify({ ok: true }), {
    headers: { "Content-Type": "application/json" },
  });
};
