// app/api/rate-limit/route.ts
// 限流查询接口：客户端 GET → 返回各场景的 { used, limit, remaining }
// 用于聊天页底部 RateLimitBanner 展示"今日剩余 X 次"
//
// 鉴权：requireSession 注入 session，userId 从 session 取（不再从 query 读取）

import { NextRequest, NextResponse } from "next/server";
import { initCloudflareEnv, getCloudflareKV } from "@/lib/ai/cloudflare-env";
import { requireSession } from "@/lib/ai/session-middleware";
import { createKVStore } from "@/lib/storage/kv";
import { getRateLimitScenes, getSceneQuota } from "@/lib/ai/rate-limit";
import { chinaDateNow } from "@/lib/time";

export const runtime = "edge";

export async function GET(req: NextRequest) {
  await initCloudflareEnv();

  const sessionResult = await requireSession(req);
  if (sessionResult instanceof NextResponse) return sessionResult;
  const { session } = sessionResult;

  const userId = session.userId;
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
