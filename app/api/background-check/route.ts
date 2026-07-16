// app/api/background-check/route.ts
// 后台定期检查 API：供 Service Worker 在无法直接读 IndexedDB 时调用
// 从 Cloudflare KV 读取用户的复习卡片和学习日志，返回是否需要通知
//
// 设计：
//   - POST 请求，body: { userId }
//   - 从 KV 读取 user:${userId}:backup（UserBackup.data 含全量 IndexedDB key-value）
//   - 检查 card: 前缀的 ReviewCard.due <= now → hasDueCards / dueCount
//   - 检查 learn_log: 前缀的 LearnLog 最新时间 → daysSinceLastLearn
//   - 返回 { hasDueCards, dueCount, daysSinceLastLearn, shouldNotify, message }
//   - daysSinceLastLearn >= 3 → 个性化回归消息；hasDueCards → 复习提醒
//
// 鉴权：数据操作（dataOperation=true），与 /api/sync 一致

import { NextRequest, NextResponse } from "next/server";
import { initCloudflareEnv, getCloudflareKV } from "@/lib/ai/cloudflare-env";
import { requireAuth } from "@/lib/auth";
import { createKVStore } from "@/lib/storage/kv";
import type { ReviewCard, LearnLog } from "@/lib/types";

export const runtime = "edge";

const DAY_MS = 24 * 60 * 60 * 1000;

export async function POST(req: NextRequest) {
  await initCloudflareEnv();
  // 数据操作：不消耗 AI 额度，未配置 API_TOKEN 时放行（与 /api/sync 一致）
  const authError = requireAuth(req, { dataOperation: true });
  if (authError) return authError;

  let body: { userId?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "请求体格式错误" }, { status: 400 });
  }

  const userId = body.userId;
  if (!userId || typeof userId !== "string") {
    return NextResponse.json({ error: "缺少 userId" }, { status: 400 });
  }

  const store = createKVStore(getCloudflareKV());
  const backup = await store.getUserBackup(userId);

  // 云端无数据：无需通知
  if (!backup || !backup.data) {
    return NextResponse.json({
      hasDueCards: false,
      dueCount: 0,
      daysSinceLastLearn: -1,
      shouldNotify: false,
      message: "",
    });
  }

  const now = Date.now();
  const data = backup.data;

  // 1. 检查待复习卡片（card: 前缀，ReviewCard.due <= now）
  let dueCount = 0;
  for (const [key, val] of Object.entries(data)) {
    if (!key.startsWith("card:")) continue;
    const card = val as Partial<ReviewCard>;
    if (card && typeof card.due === "string") {
      const dueTs = new Date(card.due).getTime();
      if (!isNaN(dueTs) && dueTs <= now) dueCount++;
    }
  }

  // 2. 检查最后学习时间（learn_log: 前缀，取最新 timestamp/date）
  let lastLearnTs = 0;
  for (const [key, val] of Object.entries(data)) {
    if (!key.startsWith("learn_log:")) continue;
    const log = val as Partial<LearnLog>;
    const ts = log?.timestamp
      ? new Date(log.timestamp).getTime()
      : log?.date
        ? new Date(log.date).getTime()
        : 0;
    if (!isNaN(ts) && ts > lastLearnTs) lastLearnTs = ts;
  }

  const daysSinceLastLearn =
    lastLearnTs > 0 ? Math.floor((now - lastLearnTs) / DAY_MS) : -1;

  // 3. 决定是否通知 + 生成消息（回归通知优先级高于复习提醒）
  let shouldNotify = false;
  let message = "";

  if (daysSinceLastLearn >= 3) {
    shouldNotify = true;
    message = comebackMessage(daysSinceLastLearn);
  } else if (dueCount > 0) {
    shouldNotify = true;
    message = `你有 ${dueCount} 张卡片到期了，打开 /review 开始复习吧 📚`;
  }

  return NextResponse.json({
    hasDueCards: dueCount > 0,
    dueCount,
    daysSinceLastLearn,
    shouldNotify,
    message,
  });
}

/** 个性化回归消息：根据离开天数生成不同语气的提醒 */
function comebackMessage(days: number): string {
  if (days >= 14) return `已经 ${days} 天没学习了，知识都快忘光了，回来重启节奏吧 💪`;
  if (days >= 7) return `已经一周（${days} 天）没学习了，是时候回来继续了 🔥`;
  return `你已经 ${days} 天没学习了，别让节奏断了，今天学一点就好 🌱`;
}
