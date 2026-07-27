// app/api/review/route.ts
// POST /api/review: 接收 { card, rating, mode }
// 服务端用 FSRS 计算评分后的卡片，返回更新后的 card + ReviewLog
// 客户端负责将结果存入 IndexedDB
//
// 鉴权：requireSession 注入 session，body 不含客户端凭证
// （review 是纯规则计算，session 仅用于身份校验，模型不实际使用）

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { nanoid } from "nanoid";
import { rateCard } from "@/lib/fsrs";
import { initCloudflareEnv } from "@/lib/ai/cloudflare-env";
import { requireSession } from "@/lib/ai/session-middleware";
import { parseRequestBody, nonEmptyString } from "@/lib/ai/body-validation";
import { nowISO } from "@/lib/time";
import type { ReviewCard, ReviewLog, Rating } from "@/lib/types";

// 2026-07-27 P1：用 zod 替代手写校验
//   - rating 必须 1-4（FSRS 标准评级），用 z.literal 联合类型而非 number 范围
//   - mode 限定三档枚举（默认 "standard"）
//   - card 用 passthrough() 保留所有字段（rateCard 需要完整 card 结构）
const reviewBodySchema = z.object({
  card: z.object(
    { id: nonEmptyString },
    { message: "card 必须含 id 字段" },
  ).passthrough(),
  rating: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4)]),
  mode: z.enum(["conservative", "standard", "aggressive"]).default("standard"),
});

export async function POST(req: NextRequest) {
  await initCloudflareEnv();
  // 先鉴权（review 是纯规则计算，session 仅用于身份校验，模型不实际使用）
  const sessionResult = await requireSession(req);
  if (sessionResult instanceof NextResponse) return sessionResult;

  let card: ReviewCard;
  let rating: Rating;
  let mode: "conservative" | "standard" | "aggressive";
  {
    const result = await parseRequestBody(req, reviewBodySchema);
    if (result instanceof NextResponse) return result;
    card = result.data.card as unknown as ReviewCard;
    rating = result.data.rating;
    mode = result.data.mode;
  }
  try {
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
