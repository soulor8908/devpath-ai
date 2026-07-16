// app/api/sync/route.ts
// 用户数据云端同步 API（Cloudflare KV）
// - GET  ?userId=xxx：读取 user:${userId}:backup，返回完整备份数据
// - POST body=UserBackup：写入 user:${userId}:backup
// 鉴权：数据操作（dataOperation=true），不消耗 AI 额度，
//       未配置 API_TOKEN 时放行（数据按 userId 隔离，无滥用风险）
// 运行时：edge。通过 getCloudflareKV() 拿到 Cloudflare KV binding，
//         无 binding 时降级为内存 mock（仅本地开发）。

import { NextRequest, NextResponse } from "next/server";
import { initCloudflareEnv, getCloudflareKV } from "@/lib/ai/cloudflare-env";
import { requireAuth } from "@/lib/auth";
import { createKVStore } from "@/lib/storage/kv";
import type { UserBackup } from "@/lib/types";

export const runtime = "edge";

const BACKUP_VERSION = 1;

/** 同步请求体：以 mode 作为判别字段，区分全量 / 增量两种模式 */
type SyncRequestBody =
  | {
      userId: string;
      mode?: "full"; // 省略时默认全量，向后兼容旧客户端
      data: Record<string, unknown>;
      updatedAt?: string;
      version?: number;
    }
  | {
      userId: string;
      mode: "incremental";
      changes: Record<string, unknown>;
      baseUpdatedAt?: string;
    };

export async function GET(req: NextRequest) {
  await initCloudflareEnv();
  // 数据操作：不消耗 AI 额度，未配置 API_TOKEN 时放行
  const authError = requireAuth(req, { dataOperation: true });
  if (authError) return authError;

  const userId = req.nextUrl.searchParams.get("userId");
  if (!userId) {
    return NextResponse.json({ error: "缺少 userId 参数" }, { status: 400 });
  }

  const store = createKVStore(getCloudflareKV());
  const backup = await store.getUserBackup(userId);
  if (!backup) {
    return NextResponse.json({ error: "云端无数据" }, { status: 404 });
  }
  return NextResponse.json({ backup });
}

export async function POST(req: NextRequest) {
  await initCloudflareEnv();
  // 数据操作：不消耗 AI 额度，未配置 API_TOKEN 时放行
  const authError = requireAuth(req, { dataOperation: true });
  if (authError) return authError;

  let body: SyncRequestBody;
  try {
    body = (await req.json()) as SyncRequestBody;
  } catch {
    return NextResponse.json({ error: "请求体格式错误" }, { status: 400 });
  }

  if (!body.userId || typeof body.userId !== "string") {
    return NextResponse.json({ error: "缺少 userId" }, { status: 400 });
  }

  const store = createKVStore(getCloudflareKV());

  // 增量同步模式：只合并变更的 key
  if (body.mode === "incremental") {
    if (!body.changes || typeof body.changes !== "object") {
      return NextResponse.json(
        { error: "增量同步缺少 changes 字段" },
        { status: 400 },
      );
    }
    const updatedAt = await store.mergeUserBackup(body.userId, body.changes);
    return NextResponse.json({ ok: true, updatedAt });
  }

  // 全量备份模式（mode 省略或 "full"，向后兼容旧客户端）
  if (!body.data || typeof body.data !== "object") {
    return NextResponse.json({ error: "缺少 data 字段" }, { status: 400 });
  }

  const backup: UserBackup = {
    userId: body.userId,
    updatedAt: body.updatedAt ?? new Date().toISOString(),
    version: body.version ?? BACKUP_VERSION,
    data: body.data,
  };

  await store.setUserBackup(body.userId, backup);
  return NextResponse.json({ ok: true, updatedAt: backup.updatedAt });
}
