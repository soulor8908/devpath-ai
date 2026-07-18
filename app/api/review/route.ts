// app/api/review/route.ts
// POST /api/review: 接收 { card, rating, mode }
// 服务端用 FSRS 计算评分后的卡片，返回更新后的 card + ReviewLog
// 客户端负责将结果存入 IndexedDB
//
// 鉴权：requireSession 注入 session，body 不含客户端凭证
// （review 是纯规则计算，session 仅用于身份校验，模型不实际使用）

import { NextRequest, NextResponse } from "next/server";
import { nanoid } from "nanoid";
import { rateCard } from "@/lib/fsrs";
import { initCloudflareEnv } from "@/lib/ai/cloudflare-env";
import { requireSession } from "@/lib/ai/session-middleware";
import { nowISO } from "@/lib/time";
import type { ReviewCard, ReviewLog, Rating } from "@/lib/types";

export const runtime = "edge";

export async function POST(req: NextRequest) {
  await initCloudflareEnv();
  // 先鉴权（review 是纯规则计算，session 仅用于身份校验，模型不实际使用）
  const sessionResult = await requireSession(req);
  if (sessionResult instanceof NextResponse) return sessionResult;

  let body: {
    card?: ReviewCard;
    rating?: Rating;
    mode?: "conservative" | "standard" | "aggressive";
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "请求体格式错误" }, { status: 400 });
  }

  const { card, rating, mode = "standard" } = body;
  try {
    if (!card || !card.id) {
      return NextResponse.json({ error: "card 是必填项" }, { status: 400 });
    }

    if (!rating || ![1, 2, 3, 4].includes(rating)) {
      return NextResponse.json({ error: "rating 须为 1-4" }, { status: 400 });
    }

    const updatedCard = rateCard(card, rating, mode);

    const log: ReviewLog = {
      id: nanoid(),
      cardId: card.id,
      date: nowISO(),
      rating,
      elapsedDays: card.elapsedDays,
      stateBefore: card.state,
      stateAfter: updatedCard.state,
    };

    return NextResponse.json({ card: updatedCard, log });
  } catch (error) {
    const message = error instanceof Error ? error.message : "未知错误";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
