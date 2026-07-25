// lib/curriculum/portfolio-store.ts
// V4 作品集客户端存储层（IndexedDB）
//
// 数据流：
//   1. 用户完成 V3 项目评审（review-project API）→ 拿到 reviewPassed + score
//   2. 客户端创建 PortfolioEntry（draft）→ 存 IndexedDB（portfolio:<id>）
//   3. 发布：status=published + publishedAt → 写 KV（/api/portfolio/[username] PUT）
//   4. recordVerificationResult(V4) → 节点 state=mastered
//
// 与 mastery-store.ts 配合：V4 通过 = 节点掌握状态机到顶。

import { nanoid } from "nanoid";

import { getItem, setItem, listItems, delItem } from "@/lib/storage/db";
import { KEY_PREFIXES } from "@/lib/types/constants";
import { nowISO } from "@/lib/time";
import type {
  PortfolioEntry,
  PortfolioStatus,
  PublicPortfolioEntry,
} from "@/lib/types";

function keyFor(id: string): string {
  return KEY_PREFIXES.PORTFOLIO + id;
}

/** 创建一条作品集草稿 */
export async function createPortfolioEntry(input: {
  title: string;
  summary: string;
  nodeId: string;
  rubricId: string;
  repoUrl?: string;
  deployUrl?: string;
  docUrl?: string;
  reviewScore?: number;
  reviewPassed?: boolean;
  reviewFeedback?: string;
}): Promise<PortfolioEntry> {
  const now = nowISO();
  const entry: PortfolioEntry = {
    id: nanoid(),
    title: input.title,
    summary: input.summary,
    nodeId: input.nodeId,
    rubricId: input.rubricId,
    repoUrl: input.repoUrl,
    deployUrl: input.deployUrl,
    docUrl: input.docUrl,
    reviewScore: input.reviewScore,
    reviewPassed: input.reviewPassed,
    reviewFeedback: input.reviewFeedback,
    status: "draft",
    createdAt: now,
    updatedAt: now,
  };
  await setItem(keyFor(entry.id), entry);
  return entry;
}

/** 读取单条作品集 */
export async function getPortfolioEntry(
  id: string,
): Promise<PortfolioEntry | undefined> {
  return getItem<PortfolioEntry>(keyFor(id));
}

/** 列出全部作品集（含 draft） */
export async function listPortfolioEntries(): Promise<PortfolioEntry[]> {
  return listItems<PortfolioEntry>(KEY_PREFIXES.PORTFOLIO);
}

/** 更新作品集（部分字段） */
export async function updatePortfolioEntry(
  id: string,
  patch: Partial<PortfolioEntry>,
): Promise<PortfolioEntry | undefined> {
  const existing = await getPortfolioEntry(id);
  if (!existing) return undefined;
  const updated: PortfolioEntry = {
    ...existing,
    ...patch,
    id: existing.id, // id 不可改
    updatedAt: nowISO(),
  };
  await setItem(keyFor(id), updated);
  return updated;
}

/** 发布作品集：status=published + 设 publishedAt */
export async function publishPortfolioEntry(
  id: string,
): Promise<PortfolioEntry | undefined> {
  return updatePortfolioEntry(id, {
    status: "published" satisfies PortfolioStatus,
    publishedAt: nowISO(),
  });
}

/** 删除作品集 */
export async function deletePortfolioEntry(id: string): Promise<void> {
  await delItem(keyFor(id));
}

/** 把本地作品集转为公开作品集（脱敏，只含 published） */
export function toPublicEntries(
  entries: PortfolioEntry[],
): PublicPortfolioEntry[] {
  return entries
    .filter((e) => e.status === "published" && e.publishedAt)
    .map((e) => ({
      id: e.id,
      title: e.title,
      summary: e.summary,
      nodeId: e.nodeId,
      rubricId: e.rubricId,
      repoUrl: e.repoUrl,
      deployUrl: e.deployUrl,
      docUrl: e.docUrl,
      reviewScore: e.reviewScore,
      reviewPassed: e.reviewPassed,
      publishedAt: e.publishedAt!,
    }));
}
