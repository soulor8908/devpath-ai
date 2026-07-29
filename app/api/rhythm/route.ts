// app/api/rhythm/route.ts
// 节奏引擎 API：返回"下一步该做什么"的 NextAction
//
// 设计说明：
//   - 节奏引擎是纯规则计算（非 AI 调用），不消耗 AI 额度
//   - 鉴权用 requireSession：仅校验身份，不消耗 AI 额度
//   - collectRhythmContext 读取 IndexedDB（客户端数据源），在 Edge Runtime 上
//     IndexedDB 不可用（getItem 返回 undefined），此时返回默认 action。
//     客户端 CurrentTaskCard 也会直接调用 lib 函数作为主路径，本 API 作为
//     统一入口存在，便于未来扩展（如服务端缓存、批量预计算）。

import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/ai/session-middleware";
import { collectRhythmContext, getNextAction } from "@/lib/ai/rhythm-engine";

export const runtime = "edge";

export async function GET(req: NextRequest) {
  const sessionResult = await requireSession(req);
  if (sessionResult instanceof NextResponse) return sessionResult;

  try {
    const ctx = await collectRhythmContext();
    const action = await getNextAction(ctx);
    return NextResponse.json({ action, context: { now: ctx.now } });
  } catch (error) {
    const message = error instanceof Error ? error.message : "节奏引擎计算失败";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
