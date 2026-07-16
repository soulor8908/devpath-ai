// app/api/rate-limit/route.ts
// 限流查询接口：客户端 GET ?userId=xxx → 返回各场景的 { used, limit, remaining }
// 用于聊天页底部 RateLimitBanner 展示"今日剩余 X 次"
//
// 鉴权：requireAuth({ dataOperation: true })——数据操作不消耗 AI 额度，
// 未配置 API_TOKEN 时放行（开发模式），生产环境需 token

import { NextRequest, NextResponse } from "next/server";
import { initCloudflareEnv, getCloudflareKV } from "@/lib/ai/cloudflare-env";
import { requireAuth } from "@/lib/auth";
import { createKVStore } from "@/lib/storage/kv";
import { getRateLimitScenes, getSceneQuota } from "@/lib/ai/rate-limit";
import { chinaDateNow } from "@/lib/time";

export const runtime = "edge";

export async function GET(req: NextRequest) {
  await initCloudflareEnv();

  const authError = requireAuth(req, { dataOperation: true });
  if (authError) return authError;

  const userId = req.nextUrl.searchParams.get("userId");
  if (!userId) {
    return NextResponse.json(
      { error: "缺少 userId 参数" },
      { status: 400 },
    );
  }

  const kv = createKVStore(getCloudflareKV());
  const date = chinaDateNow();
  const scenes = getRateLimitScenes();

  const result = await Promise.all(
    scenes.map(async (scene) => {
      const limit = getSceneQuota(scene);
      const used = await kv.getRateLimitCount(userId, scene, date);
      return {
        scene,
        used,
        limit,
        remaining: Math.max(0, limit - used),
      };
    }),
  );

  return NextResponse.json({ scenes: result, date });
}
