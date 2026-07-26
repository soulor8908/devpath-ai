"use client";

// app/portfolio/page.tsx
// V4 作品集管理页 —— 用户管理自己的作品集（草稿/发布/删除/同步云端）
//
// 设计（乔布斯视角）：
//   - 「作品集是带去面试的硬资产」：管理页要让用户清楚知道
//     「我现在有几个作品、几个发布、几个 AI 通过」
//   - 主操作前置：新建按钮在顶部右上角；每张卡片的发布/编辑/删除在卡片右下
//   - 发布到云端 = 同步到 /api/portfolio PUT（与 /api/public 成就墙同构）
//   - 二维码 / 分享链接入口让用户能立刻把作品集发出去
//
// 设计（卡帕西视角）：
//   - 列表数据来自 IndexedDB（lib/curriculum/portfolio-store.ts）
//   - 节点信息从编译产物 public/data/curriculum-graph.json 读取
//   - 发布流程：local status=published → 调 toPublicEntries → PUT /api/portfolio/[username]
//   - 删除/草稿/发布都用统一 store API，UI 用 Modal 守护
//   - 全部 UI 元素用 @/components/ui，守护测试自动覆盖

import { useEffect, useState } from "react";
import Link from "next/link";
import { Icon } from "@/components/Icon";
import {
  Button,
  EmptyState,
  SkeletonCard,
} from "@/components/ui";
import { PortfolioEditorModal } from "@/components/PortfolioEditorModal";
import {
  createPortfolioEntry,
  deletePortfolioEntry,
  listPortfolioEntries,
  publishPortfolioEntry,
  toPublicEntries,
  updatePortfolioEntry,
} from "@/lib/curriculum/portfolio-store";
import { recordVerificationResult } from "@/lib/curriculum/mastery-store";
import { getItem as dbGet } from "@/lib/storage/db";
import { apiFetch } from "@/lib/api-client";
import { confirmDialog } from "@/lib/confirm-dialog";
import { toast } from "@/lib/toast";
import type { PortfolioEntry, PublicProfile } from "@/lib/types";
import type { CurriculumGraph, SkillNode } from "@/lib/types/curriculum";

// 改为运行时 fetch（避免静态 import 把 568KB JSON 打进客户端 bundle，
// 修复 Cloudflare Pages 部署失败：Worker bundle 总大小超 3MB 限制）
// graph.json 是 public/data/ 下的静态资源，部署后直接 fetch 即可。
let graphCache: CurriculumGraph | null = null;
async function loadGraph(): Promise<CurriculumGraph> {
  if (graphCache) return graphCache;
  const res = await fetch("/data/curriculum-graph.json");
  if (!res.ok) {
    throw new Error(`加载课程图谱失败: ${res.status}`);
  }
  graphCache = (await res.json()) as CurriculumGraph;
  return graphCache;
}

// 兼容原 `graph.nodes.find(...)` 调用的轻量查找函数
async function findNode(nodeId: string): Promise<SkillNode | undefined> {
  const g = await loadGraph();
  return g.nodes.find((n) => n.id === nodeId);
}

async function getAllNodes(): Promise<SkillNode[]> {
  const g = await loadGraph();
  return g.nodes;
}

type LoadState =
  | { kind: "loading" }
  | { kind: "ready"; entries: PortfolioEntry[]; username: string }
  | { kind: "no-username" };

export default function PortfolioManagementPage() {
  const [state, setState] = useState<LoadState>({ kind: "loading" });
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<PortfolioEntry | undefined>(undefined);
  const [syncing, setSyncing] = useState(false);
  // 节点列表供 PortfolioEditorModal 使用，按需 async 加载（避免静态 import 大 JSON）
  const [allNodes, setAllNodes] = useState<SkillNode[]>([]);

  useEffect(() => {
    let cancelled = false;
    void getAllNodes().then((nodes) => {
      if (!cancelled) setAllNodes(nodes);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  async function refresh() {
    try {
      const [entries, profile] = await Promise.all([
        listPortfolioEntries(),
        dbGet<PublicProfile>("my:profile"),
      ]);
      const username = profile?.username?.trim() ?? "";
      if (!username) {
        setState({ kind: "no-username" });
      } else {
        setState({ kind: "ready", entries, username });
      }
    } catch (e) {
      console.warn("[portfolio] load failed:", e);
      setState({ kind: "no-username" });
    }
  }

  useEffect(() => {
    void refresh();
  }, []);

  function openCreate() {
    setEditingEntry(undefined);
    setEditorOpen(true);
  }

  function openEdit(entry: PortfolioEntry) {
    setEditingEntry(entry);
    setEditorOpen(true);
  }

  async function handleSubmit(data: {
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
    status: PortfolioEntry["status"];
  }) {
    if (editingEntry) {
      await updatePortfolioEntry(editingEntry.id, data);
      toast.success("作品集已更新");
    } else {
      await createPortfolioEntry(data);
      toast.success("已创建草稿");
    }
    await refresh();
  }

  async function handlePublish(entry: PortfolioEntry) {
    if (state.kind !== "ready") return;
    if (!entry.reviewPassed) {
      const ok = await confirmDialog({
        title: "发布未通过 V3 评审的作品？",
        message:
          "该作品尚未通过 AI 评审（或评审未通过）。发布后访客能看到，但会显示「未通过」徽章。建议先在 V3 评审通过后再发布。",
        confirmText: "仍要发布",
        cancelText: "取消",
      });
      if (!ok) return;
    }
    try {
      await publishPortfolioEntry(entry.id);
      // 同步到云端
      await syncToCloud();
      toast.success("已发布到云端");

      // 若关联节点是 V4 验证等级，记录 V4 通过 → 节点状态机到顶
      const node = await findNode(entry.nodeId);
      if (node && node.masteryCheck?.level === "V4") {
        try {
          await recordVerificationResult(node, "V4", {
            passed: true,
            score: entry.reviewScore,
            feedback: "作品集已发布",
            artifactId: entry.id,
          });
        } catch (e) {
          console.warn("[portfolio] record V4 failed:", e);
        }
      }
      await refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "发布失败");
    }
  }

  async function handleUnpublish(entry: PortfolioEntry) {
    const ok = await confirmDialog({
      title: "撤回发布？",
      message: "撤回后该作品将从公开作品集移除（本地保留为草稿）。",
      confirmText: "撤回",
      cancelText: "取消",
    });
    if (!ok) return;
    try {
      await updatePortfolioEntry(entry.id, { status: "draft", publishedAt: undefined });
      await syncToCloud();
      toast.success("已撤回");
      await refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "撤回失败");
    }
  }

  async function handleDelete(entry: PortfolioEntry) {
    const ok = await confirmDialog({
      title: "删除作品？",
      message: `确定删除「${entry.title}」？此操作不可恢复。`,
      confirmText: "删除",
      cancelText: "取消",
      danger: true,
    });
    if (!ok) return;
    try {
      await deletePortfolioEntry(entry.id);
      // 删除后若已发布过，需同步到云端（移除该条）
      if (entry.status === "published") {
        await syncToCloud();
      }
      toast.success("已删除");
      await refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "删除失败");
    }
  }

  /** 把本地 published 条目整体覆盖上传到 KV */
  async function syncToCloud() {
    if (state.kind !== "ready") return;
    const username = state.username;
    const all = await listPortfolioEntries();
    const publicEntries = toPublicEntries(all);
    setSyncing(true);
    try {
      const res = await apiFetch(
        `/api/portfolio/${encodeURIComponent(username)}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ entries: publicEntries }),
        },
      );
      if (!res.ok) {
        let msg = `HTTP ${res.status}`;
        try {
          const err = (await res.json()) as { error?: string };
          if (err.error) msg = err.error;
        } catch {
          /* noop */
        }
        throw new Error(msg);
      }
    } finally {
      setSyncing(false);
    }
  }

  // ============ 渲染分支 ============

  if (state.kind === "loading") {
    return (
      <PageShell>
        <div className="space-y-3">
          <SkeletonCard />
          <SkeletonCard />
        </div>
      </PageShell>
    );
  }

  if (state.kind === "no-username") {
    return (
      <PageShell>
        <EmptyState
          icon="user"
          title="未设置用户名"
          description="发布作品集前，请先在「我的」中设置公开主页用户名"
          action={
            <Link
              href="/profile"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline"
            >
              <Icon name="settings" className="w-4 h-4" />
              去设置用户名 →
            </Link>
          }
        />
      </PageShell>
    );
  }

  const { entries, username } = state;
  const publishedCount = entries.filter((e) => e.status === "published").length;
  const passedCount = entries.filter((e) => e.reviewPassed === true).length;
  const publicUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/u/${encodeURIComponent(username)}/portfolio`
      : `/u/${encodeURIComponent(username)}/portfolio`;

  return (
    <PageShell>
      {/* 顶部摘要 + 操作 */}
      <section className="rounded-card bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-sm p-4 mb-4">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div>
            <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <Icon name="package" className="w-4 h-4 text-purple-500 dark:text-purple-400" />
              我的作品集
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              共 {entries.length} 条 · 已发布 {publishedCount} · AI 通过 {passedCount}
            </p>
          </div>
          <Button leftIcon="plus" size="sm" onClick={openCreate}>
            新建作品
          </Button>
        </div>

        {/* 公开链接 + 同步按钮 */}
        <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between gap-2 flex-wrap">
          <a
            href={publicUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 hover:underline break-all"
          >
            <Icon name="external-link" className="w-3.5 h-3.5 shrink-0" />
            {publicUrl}
          </a>
          <Button
            variant="outline"
            size="sm"
            onClick={syncToCloud}
            loading={syncing}
            leftIcon="cloud"
          >
            重新同步云端
          </Button>
        </div>
      </section>

      {/* 列表 */}
      {entries.length === 0 ? (
        <EmptyState
          icon="package"
          title="还没有作品集"
          description="完成 V3 项目评审后，把项目发布为作品集，作为求职硬资产"
          action={
            <Button leftIcon="plus" size="sm" onClick={openCreate}>
              新建第一个作品
            </Button>
          }
        />
      ) : (
        <div className="space-y-3">
          {entries
            .slice()
            .sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1))
            .map((entry) => (
              <PortfolioManageCard
                key={entry.id}
                entry={entry}
                onEdit={() => openEdit(entry)}
                onPublish={() => handlePublish(entry)}
                onUnpublish={() => handleUnpublish(entry)}
                onDelete={() => handleDelete(entry)}
              />
            ))}
        </div>
      )}

      <PortfolioEditorModal
        open={editorOpen}
        onClose={() => setEditorOpen(false)}
        nodes={allNodes}
        entry={editingEntry}
        onSubmit={handleSubmit}
      />
    </PageShell>
  );
}

function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/30 to-pink-50/40 dark:from-gray-950 dark:via-purple-950/20 dark:to-gray-900 pb-20">
      <div className="mx-auto max-w-3xl px-4 py-6">
        <header className="mb-5 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <Icon name="package" className="w-5 h-5 text-purple-500 dark:text-purple-400" />
              作品集
            </h1>
            <p className="text-2xs text-gray-500 dark:text-gray-400 mt-0.5">
              V4 验证等级 · 带去面试的硬资产
            </p>
          </div>
          <Link
            href="/profile"
            className="text-sm text-blue-500 dark:text-blue-400 hover:underline"
          >
            ← 返回
          </Link>
        </header>
        {children}
      </div>
    </div>
  );
}

function PortfolioManageCard({
  entry,
  onEdit,
  onPublish,
  onUnpublish,
  onDelete,
}: {
  entry: PortfolioEntry;
  onEdit: () => void;
  onPublish: () => void;
  onUnpublish: () => void;
  onDelete: () => void;
}) {
  const isPublished = entry.status === "published";
  return (
    <article className="rounded-card bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-sm p-4">
      {/* 标题行 + 状态徽章 */}
      <div className="flex items-start justify-between gap-3 mb-2">
        <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 flex-1 min-w-0">
          {entry.title}
        </h3>
        <StatusBadge status={entry.status} />
      </div>

      {/* 摘要 */}
      <p className="text-sm text-gray-600 dark:text-gray-300 mb-2 line-clamp-2">
        {entry.summary}
      </p>

      {/* 元信息 */}
      <div className="flex flex-wrap items-center gap-2 text-2xs text-gray-500 dark:text-gray-400 mb-3">
        <span className="inline-flex items-center gap-1">
          <Icon name="book" className="w-3 h-3" />
          <span className="font-mono">{entry.nodeId}</span>
        </span>
        {typeof entry.reviewScore === "number" && (
          <>
            <span className="text-gray-300 dark:text-gray-600">·</span>
            <span className="inline-flex items-center gap-1">
              <Icon name="star" className="w-3 h-3" />
              <span className="font-mono">{entry.reviewScore}</span>
            </span>
          </>
        )}
        {entry.reviewPassed !== undefined && (
          <>
            <span className="text-gray-300 dark:text-gray-600">·</span>
            {entry.reviewPassed ? (
              <span className="inline-flex items-center gap-1 text-green-600 dark:text-green-400">
                <Icon name="check-circle" className="w-3 h-3" />
                通过
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-amber-600 dark:text-amber-400">
                <Icon name="x-circle" className="w-3 h-3" />
                未通过
              </span>
            )}
          </>
        )}
        {entry.publishedAt && (
          <>
            <span className="text-gray-300 dark:text-gray-600">·</span>
            <span className="inline-flex items-center gap-1">
              <Icon name="calendar" className="w-3 h-3" />
              {formatDate(entry.publishedAt)}
            </span>
          </>
        )}
      </div>

      {/* 操作按钮组 */}
      <div className="flex flex-wrap gap-2 pt-3 border-t border-gray-100 dark:border-gray-700">
        <Button variant="ghost" size="sm" onClick={onEdit} leftIcon="pen">
          编辑
        </Button>
        {isPublished ? (
          <Button variant="outline" size="sm" onClick={onUnpublish} leftIcon="rotate">
            撤回发布
          </Button>
        ) : (
          <Button variant="primary" size="sm" onClick={onPublish} leftIcon="share">
            发布
          </Button>
        )}
        <Button
          variant="ghost"
          size="sm"
          iconOnly
          aria-label="删除作品"
          onClick={onDelete}
          className="text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 ml-auto"
        >
          <Icon name="trash" className="w-4 h-4" />
        </Button>
      </div>
    </article>
  );
}

function StatusBadge({ status }: { status: PortfolioEntry["status"] }) {
  if (status === "published") {
    return (
      <span className="inline-flex items-center gap-1 text-2xs font-medium text-green-700 dark:text-green-300 bg-green-50 dark:bg-green-950/40 border border-green-200 dark:border-green-800 px-2 py-0.5 rounded-pill shrink-0">
        <Icon name="check-circle" className="w-3 h-3" />
        已发布
      </span>
    );
  }
  if (status === "unlisted") {
    return (
      <span className="inline-flex items-center gap-1 text-2xs font-medium text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-900/40 border border-gray-200 dark:border-gray-700 px-2 py-0.5 rounded-pill shrink-0">
        <Icon name="info" className="w-3 h-3" />
        未列出
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 text-2xs font-medium text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 px-2 py-0.5 rounded-pill shrink-0">
      <Icon name="pen" className="w-3 h-3" />
      草稿
    </span>
  );
}

function formatDate(iso: string): string {
  if (!iso) return "";
  try {
    const d = new Date(iso);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  } catch {
    return "";
  }
}
