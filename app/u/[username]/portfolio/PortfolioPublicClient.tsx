"use client";

// app/u/[username]/portfolio/PortfolioPublicClient.tsx
// 公开作品集展示页客户端组件
//
// 数据流：
//   - GET /api/portfolio/[username] → { entries: PublicPortfolioEntry[] }
//   - GET /api/public/[username] → 取 displayName（与主页一致的头像/署名展示）
//
// 设计（乔布斯视角）：
//   - 这是用户带去面试的"硬资产"展示页：每张卡片都是一个可点击的成果
//   - 视觉层次：Hero（用户身份）→ 统计（数量/平均分/通过率）→ 作品列表
//   - 空状态：明确告诉访客「该用户尚未发布作品」（不是「加载失败」）
//   - 评审分数 + 通过徽章前置展示——这是访客最关心的"客观信号"
//
// 设计（卡帕西视角）：
//   - 全部 UI 用统一组件库（Button/Icon/EmptyState/SkeletonCard），守护测试自动覆盖
//   - 浅色 utility 全部带 dark: 配对（ui-design-system-guard 强制）
//   - 链接用 <Link> 或 <a>，不用 div onClick
//   - 加载态用 SkeletonCard（与设计令牌一致）
//   - fetch 失败降级为 EmptyState，不破坏整页可用性

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Icon, type IconName } from "@/components/Icon";
import { Button, EmptyState, SkeletonCard } from "@/components/ui";
import type { PublicProfile, PublicPortfolioEntry } from "@/lib/types";
import { maskUsername } from "@/lib/username-mask";

interface PortfolioResponse {
  entries: PublicPortfolioEntry[];
}

interface ProfileResponse {
  profile: PublicProfile;
}

type LoadState =
  | { kind: "loading" }
  | { kind: "error"; message: string }
  | { kind: "empty"; displayName: string }
  | { kind: "ready"; entries: PublicPortfolioEntry[]; displayName: string };

export default function PortfolioPublicClient() {
  const params = useParams<{ username: string }>();
  const username = params?.username ?? "";
  const [state, setState] = useState<LoadState>({ kind: "loading" });

  useEffect(() => {
    if (!username) return;
    let cancelled = false;
    (async () => {
      setState({ kind: "loading" });
      try {
        // 并行取作品集 + 公开主页（拿 displayName）
        const [portfolioRes, profileRes] = await Promise.all([
          fetch(`/api/portfolio/${encodeURIComponent(username)}`),
          fetch(`/api/public/${encodeURIComponent(username)}`),
        ]);

        if (!portfolioRes.ok) {
          throw new Error(`HTTP ${portfolioRes.status}`);
        }
        const portfolio = (await portfolioRes.json()) as PortfolioResponse;
        let displayName = username;
        if (profileRes.ok) {
          const profile = (await profileRes.json()) as ProfileResponse;
          displayName = profile.profile?.displayName || username;
        }

        if (cancelled) return;
        if (!portfolio.entries || portfolio.entries.length === 0) {
          setState({ kind: "empty", displayName });
        } else {
          setState({ kind: "ready", entries: portfolio.entries, displayName });
        }
      } catch (e) {
        if (cancelled) return;
        setState({
          kind: "error",
          message: e instanceof Error ? e.message : "加载失败",
        });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [username]);

  if (state.kind === "loading") {
    return (
      <PortfolioShell username={username} displayName={username}>
        <div className="space-y-3">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      </PortfolioShell>
    );
  }

  if (state.kind === "error") {
    return (
      <PortfolioShell username={username} displayName={username}>
        <EmptyState
          icon="alert"
          title="作品集加载失败"
          description={state.message}
          action={
            <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
              <Icon name="refresh-cw" className="w-3.5 h-3.5" />
              重试
            </Button>
          }
        />
      </PortfolioShell>
    );
  }

  if (state.kind === "empty") {
    return (
      <PortfolioShell username={username} displayName={state.displayName}>
        <EmptyState
          icon="package"
          title="暂未发布作品"
          description={`「${maskUsername(username)}」还没有发布任何 V4 作品集条目`}
        />
      </PortfolioShell>
    );
  }

  const { entries, displayName } = state;
  const passedCount = entries.filter((e) => e.reviewPassed === true).length;
  const avgScore =
    entries.filter((e) => typeof e.reviewScore === "number").length > 0
      ? Math.round(
          entries
            .filter((e) => typeof e.reviewScore === "number")
            .reduce((s, e) => s + (e.reviewScore ?? 0), 0) /
            entries.filter((e) => typeof e.reviewScore === "number").length,
        )
      : null;

  return (
    <PortfolioShell username={username} displayName={displayName}>
      {/* 统计条 */}
      <section className="grid grid-cols-3 gap-2 mb-5">
        <StatBlock icon="package" label="作品数" value={`${entries.length}`} />
        <StatBlock icon="check-circle" label="AI 通过" value={`${passedCount}`} />
        <StatBlock icon="star" label="平均分" value={avgScore !== null ? `${avgScore}` : "-"} />
      </section>

      {/* 作品列表 */}
      <section className="space-y-3">
        {entries
          .slice()
          .sort((a, b) => (a.publishedAt < b.publishedAt ? 1 : -1))
          .map((entry) => (
            <PortfolioCard key={entry.id} entry={entry} />
          ))}
      </section>
    </PortfolioShell>
  );
}

/** 页面外壳：Hero + 内容容器 */
function PortfolioShell({
  username,
  displayName,
  children,
}: {
  username: string;
  displayName: string;
  children: React.ReactNode;
}) {
  const initial = (displayName || username || "?").slice(0, 1).toUpperCase();
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/30 to-pink-50/40 dark:from-gray-950 dark:via-purple-950/20 dark:to-gray-900 pb-20">
      <div className="mx-auto max-w-3xl px-4 py-6 space-y-5">
        {/* Hero */}
        <header className="relative overflow-hidden rounded-3xl shadow-xl">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-400" />
          <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-white/10 blur-2xl" />
          <div className="absolute -bottom-16 -left-12 w-56 h-56 rounded-full bg-white/10 blur-3xl" />
          <div className="relative p-6 sm:p-8 text-white">
            <div className="flex items-start gap-4">
              <div className="h-16 w-16 rounded-2xl bg-white/20 border-2 border-white/40 backdrop-blur flex items-center justify-center text-3xl font-bold shadow-lg">
                {initial}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 text-xs text-white/70 mb-1">
                  <Icon name="package" className="w-3.5 h-3.5" />
                  <span>作品集 · V4 验证</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold leading-tight break-words">
                  {displayName || "(未设置)"}
                </h1>
                <p className="text-sm text-white/80 mt-0.5">@{maskUsername(username)}</p>
              </div>
            </div>
          </div>
        </header>

        {children}

        {/* Footer */}
        <footer className="text-center text-xs text-gray-400 dark:text-gray-500 pt-4">
          <Link
            href={`/u/${encodeURIComponent(username)}`}
            className="inline-flex items-center gap-1 hover:text-purple-500 transition-colors"
          >
            <Icon name="user" className="w-3.5 h-3.5" />
            查看主页 →
          </Link>
        </footer>
      </div>
    </div>
  );
}

function StatBlock({
  icon,
  label,
  value,
}: {
  icon: IconName;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-card bg-white dark:bg-gray-800 p-3 shadow-sm border border-gray-100 dark:border-gray-700">
      <div className="flex items-center gap-1.5 text-purple-500 dark:text-purple-400 mb-1">
        <Icon name={icon} className="w-3.5 h-3.5" />
        <span className="text-2xs text-gray-500 dark:text-gray-400">{label}</span>
      </div>
      <div className="text-xl font-bold text-gray-900 dark:text-gray-100 leading-tight">
        {value}
      </div>
    </div>
  );
}

function PortfolioCard({ entry }: { entry: PublicPortfolioEntry }) {
  const publishedAt = formatDate(entry.publishedAt);
  return (
    <article className="rounded-card bg-white dark:bg-gray-800 p-5 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-card-hover transition-shadow">
      {/* 标题行 + 通过徽章 */}
      <div className="flex items-start justify-between gap-3 mb-2">
        <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100 flex-1 min-w-0">
          {entry.title}
        </h2>
        {entry.reviewPassed === true && (
          <span className="inline-flex items-center gap-1 text-2xs font-medium text-green-700 dark:text-green-300 bg-green-50 dark:bg-green-950/40 border border-green-200 dark:border-green-800 px-2 py-0.5 rounded-pill shrink-0">
            <Icon name="check-circle" className="w-3 h-3" />
            AI 通过
          </span>
        )}
        {entry.reviewPassed === false && (
          <span className="inline-flex items-center gap-1 text-2xs font-medium text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 px-2 py-0.5 rounded-pill shrink-0">
            <Icon name="alert" className="w-3 h-3" />
            未通过
          </span>
        )}
      </div>

      {/* 摘要 */}
      <p className="text-sm text-gray-600 dark:text-gray-300 mb-3 line-clamp-3">
        {entry.summary}
      </p>

      {/* 元信息：节点 + Rubric + 分数 + 时间 */}
      <div className="flex flex-wrap items-center gap-2 text-2xs text-gray-500 dark:text-gray-400 mb-3">
        <span className="inline-flex items-center gap-1">
          <Icon name="book" className="w-3 h-3" />
          <span className="font-mono">{entry.nodeId}</span>
        </span>
        <span className="text-gray-300 dark:text-gray-600">·</span>
        <span className="inline-flex items-center gap-1">
          <Icon name="tag" className="w-3 h-3" />
          <span className="font-mono">{entry.rubricId}</span>
        </span>
        {typeof entry.reviewScore === "number" && (
          <>
            <span className="text-gray-300 dark:text-gray-600">·</span>
            <span className="inline-flex items-center gap-1">
              <Icon name="star" className="w-3 h-3" />
              <span className="font-mono font-medium text-gray-700 dark:text-gray-300">
                {entry.reviewScore}
              </span>
            </span>
          </>
        )}
        <span className="text-gray-300 dark:text-gray-600">·</span>
        <span className="inline-flex items-center gap-1">
          <Icon name="calendar" className="w-3 h-3" />
          {publishedAt}
        </span>
      </div>

      {/* 链接组 */}
      {(entry.repoUrl || entry.deployUrl || entry.docUrl) && (
        <div className="flex flex-wrap gap-2 pt-3 border-t border-gray-100 dark:border-gray-700">
          {entry.repoUrl && (
            <LinkButton href={entry.repoUrl} icon="github" label="查看代码" />
          )}
          {entry.deployUrl && (
            <LinkButton href={entry.deployUrl} icon="external-link" label="在线 Demo" />
          )}
          {entry.docUrl && (
            <LinkButton href={entry.docUrl} icon="book" label="项目文档" />
          )}
        </div>
      )}
    </article>
  );
}

function LinkButton({
  href,
  icon,
  label,
}: {
  href: string;
  icon: IconName;
  label: string;
}) {
  // URL 协议白名单（存储型 XSS 防护：数据来自 KV，访问者点击 javascript: 链接会在本站域下执行脚本）
  if (!/^https?:\/\//i.test(href.trim())) return null;
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1.5 text-xs font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 bg-blue-50 dark:bg-blue-950/30 hover:bg-blue-100 dark:hover:bg-blue-900/40 border border-blue-200 dark:border-blue-800 px-2.5 py-1 rounded-pill transition-colors"
    >
      <Icon name={icon} className="w-3.5 h-3.5" />
      {label}
      <Icon name="external-link" className="w-3 h-3 opacity-60" />
    </a>
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
