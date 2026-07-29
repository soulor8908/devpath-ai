// app/api/sync/route.ts
// 用户数据云端同步 API（Cloudflare KV）
// - GET  ：读取 user:${userId}:backup，返回完整备份数据（userId 从 session 取）
// - POST body=UserBackup：写入 user:${userId}:backup（userId 从 session 取）
// 鉴权：统一走 requireSession（apiKey Session 安全架构）。
// 运行时：Cloudflare Workers（nodejs_compat）。通过 getCloudflareKV() 拿到 Cloudflare KV binding，
//         无 binding 时降级为内存 mock（仅本地开发）。

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { initCloudflareEnv, getCloudflareKV } from "@/lib/ai/cloudflare-env";
import { requireSession } from "@/lib/ai/session-middleware";
import { createKVStore } from "@/lib/storage/kv";
import { parseRequestBody } from "@/lib/ai/body-validation";
import type { UserBackup } from "@/lib/types";

export const runtime = "edge";

const BACKUP_VERSION = 1;

// 2026-07-28 P1 安全：改用 zod schema 强校验，防 changes 任意对象直传 KV 污染数据
// - mode="incremental" 时 changes 必须是 object
// - mode="full" 或省略时 data 必须是 object
// - updatedAt/baseUpdatedAt 用 z.string().datetime() 校验完整 ISO 8601（如 2026-07-28T12:34:56.789Z）
//   注意：不能用 isoDate（YYYY-MM-DD），因为客户端发的是 new Date().toISOString() 完整时间戳，
//   用 isoDate 会导致正则不匹配 → 400 Bad Request（2026-07-29 修复的真实线上 bug）
// 用 object + superRefine 而非 discriminatedUnion，因为 mode 可选（省略时默认 full），
// discriminatedUnion 要求 discriminator 必填，不兼容向后兼容场景
const syncBodySchema = z
  .object({
    mode: z.enum(["full", "incremental"]).optional(),
    data: z.record(z.string(), z.unknown()).optional(),
    changes: z.record(z.string(), z.unknown()).optional(),
    updatedAt: z.string().datetime().optional(),
    baseUpdatedAt: z.string().datetime().optional(),
    version: z.number().int().min(1).optional(),
  })
  .superRefine((data, ctx) => {
    if (data.mode === "incremental") {
      if (!data.changes) {
        ctx.addIssue({
          code: "custom",
          message: "增量同步缺少 changes 字段",
          path: ["changes"],
        });
      }
    } else {
      // mode 省略或 "full"：全量备份
      if (!data.data) {
        ctx.addIssue({
          code: "custom",
          message: "缺少 data 字段",
          path: ["data"],
        });
      }
    }
  });

export async function GET(req: NextRequest) {
  await initCloudflareEnv();
  // 统一 session 鉴权
  const sessionResult = await requireSession(req);
  if (sessionResult instanceof NextResponse) return sessionResult;
  const { session } = sessionResult;

  const userId = session.userId;
  const store = createKVStore(getCloudflareKV());
  const backup = await store.getUserBackup(userId);
  if (!backup) {
    return NextResponse.json({ error: "云端无数据" }, { status: 404 });
  }
  return NextResponse.json({ backup });
}

export async function POST(req: NextRequest) {
  await initCloudflareEnv();
  // 统一 session 鉴权（requireSession 内部用 req.clone().text() 读 body 签名校验，不消费原 body）
  const sessionResult = await requireSession(req);
  if (sessionResult instanceof NextResponse) return sessionResult;
  const { session } = sessionResult;

  // 2026-07-28 P1：用 parseRequestBody 替代 as cast + 手写 if
  const result = await parseRequestBody(req, syncBodySchema);
  if (result instanceof NextResponse) return result;
  const body = result.data;

  const userId = session.userId;
  const store = createKVStore(getCloudflareKV());

  // 增量同步模式：只合并变更的 key
  // superRefine 已校验 changes 存在，此处用 ! 断言
  if (body.mode === "incremental") {
    const updatedAt = await store.mergeUserBackup(userId, body.changes!);
    return NextResponse.json({ ok: true, updatedAt });
  }

  // 全量备份模式（mode 省略或 "full"，向后兼容旧客户端）
  // superRefine 已校验 data 存在，此处用 ! 断言
  const backup: UserBackup = {
    userId,
    updatedAt: body.updatedAt ?? new Date().toISOString(),
    version: body.version ?? BACKUP_VERSION,
    data: body.data!,
  };

  await store.setUserBackup(userId, backup);
  return NextResponse.json({ ok: true, updatedAt: backup.updatedAt });
}
