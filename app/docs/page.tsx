"use client";

// app/docs/page.tsx
// 产品使用文档：支持分类浏览、关键词搜索、Markdown 渲染

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { Icon } from "@/components/Icon";
import { AnswerContent } from "@/components/CodeBlock";
import { DOC_CATEGORIES, DOC_SECTIONS, type DocSection } from "@/lib/docs-content";

export default function DocsPage() {
  const [search, setSearch] = useState("");
  const [activeId, setActiveId] = useState<string>(DOC_SECTIONS[0]?.id ?? "");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // 搜索过滤：匹配标题、关键词、分类、内容
  const filteredSections = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return DOC_SECTIONS;
    return DOC_SECTIONS.filter((s) => {
      const haystack = [
        s.title,
        s.category,
        ...s.keywords,
        s.content,
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [search]);

  // 按分类分组
  const groupedSections = useMemo(() => {
    const map = new Map<string, DocSection[]>();
    for (const cat of DOC_CATEGORIES) {
      map.set(cat, []);
    }
    for (const s of filteredSections) {
      const list = map.get(s.category);
      if (list) list.push(s);
    }
    return map;
  }, [filteredSections]);

  const activeSection = DOC_SECTIONS.find((s) => s.id === activeId) ?? null;

  // 搜索时自动选中第一个结果
  useEffect(() => {
    if (search && filteredSections.length > 0 && !filteredSections.find((s) => s.id === activeId)) {
      setActiveId(filteredSections[0].id);
    }
  }, [search, filteredSections, activeId]);

  // 切换文档时滚动到顶部
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [activeId]);

  const hasResults = filteredSections.length > 0;

  return (
    <div className="mx-auto max-w-5xl p-4 pb-20">
      {/* 标题栏 */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSidebarOpen((v) => !v)}
            className="lg:hidden p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
            aria-label="切换目录"
          >
            <Icon name="list" className="w-5 h-5" />
          </button>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Icon name="book" className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            使用文档
          </h1>
        </div>
        <Link
          href="/profile"
          className="text-sm text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 flex items-center gap-1"
        >
          <Icon name="chevron-right" className="w-4 h-4 rotate-180" />
          返回
        </Link>
      </div>

      {/* 搜索框 */}
      <div className="relative mb-4">
        <Icon name="search" className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="搜索文档…（如：同步、模型、复习、错题）"
          className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600"
        />
        {search && (
          <button
            onClick={() => setSearch("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            aria-label="清除搜索"
          >
            <Icon name="x" className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="flex gap-6">
        {/* 侧边栏目录 */}
        <aside
          className={`${sidebarOpen ? "block" : "hidden"} lg:block w-56 shrink-0 fixed lg:sticky top-0 lg:top-4 bottom-0 lg:bottom-auto left-0 z-40 lg:z-auto bg-white dark:bg-gray-900 lg:bg-transparent p-4 lg:p-0 overflow-y-auto max-h-screen lg:max-h-[calc(100vh-2rem)]`}
        >
          {hasResults ? (
            DOC_CATEGORIES.map((cat) => {
              const sections = groupedSections.get(cat) ?? [];
              if (sections.length === 0) return null;
              return (
                <div key={cat} className="mb-4">
                  <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-1.5 px-2">
                    {cat}
                  </p>
                  <div className="space-y-0.5">
                    {sections.map((s) => (
                      <button
                        key={s.id}
                        onClick={() => {
                          setActiveId(s.id);
                          setSidebarOpen(false);
                        }}
                        className={`block w-full text-left px-2 py-1.5 rounded text-sm transition-colors ${
                          activeId === s.id
                            ? "bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 font-medium"
                            : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                        }`}
                      >
                        {s.title}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })
          ) : (
            <p className="text-sm text-gray-400 px-2">未找到相关文档</p>
          )}
        </aside>

        {/* 移动端遮罩 */}
        {sidebarOpen && (
          <div
            className="lg:hidden fixed inset-0 bg-black/30 z-30"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* 内容区 */}
        <main className="flex-1 min-w-0">
          {activeSection ? (
            <article className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400">
                  {activeSection.category}
                </span>
              </div>
              <h2 className="text-xl font-bold mb-4">{activeSection.title}</h2>
              <AnswerContent
                text={activeSection.content}
                className="text-sm text-gray-700 dark:text-gray-300"
              />

              {/* 上下篇导航 */}
              <DocNavigation
                sections={filteredSections}
                activeId={activeId}
                onSelect={setActiveId}
              />
            </article>
          ) : (
            <div className="text-center py-20 text-gray-400">
              <Icon name="search" className="w-12 h-12 mx-auto mb-3 opacity-40" />
              <p className="text-sm">
                {search ? `未找到与"${search}"相关的文档` : "暂无文档"}
              </p>
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="mt-3 text-sm text-blue-500 hover:underline"
                >
                  清除搜索
                </button>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

/** 上一篇 / 下一篇导航 */
function DocNavigation({
  sections,
  activeId,
  onSelect,
}: {
  sections: DocSection[];
  activeId: string;
  onSelect: (id: string) => void;
}) {
  const idx = sections.findIndex((s) => s.id === activeId);
  if (idx === -1) return null;
  const prev = idx > 0 ? sections[idx - 1] : null;
  const next = idx < sections.length - 1 ? sections[idx + 1] : null;

  if (!prev && !next) return null;

  return (
    <div className="mt-8 pt-4 border-t border-gray-200 dark:border-gray-700 flex justify-between gap-4">
      {prev ? (
        <button
          onClick={() => onSelect(prev.id)}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors text-left"
        >
          <Icon name="chevron-right" className="w-4 h-4 rotate-180 shrink-0" />
          <span className="truncate">{prev.title}</span>
        </button>
      ) : (
        <span />
      )}
      {next ? (
        <button
          onClick={() => onSelect(next.id)}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors text-right"
        >
          <span className="truncate">{next.title}</span>
          <Icon name="chevron-right" className="w-4 h-4 shrink-0" />
        </button>
      ) : (
        <span />
      )}
    </div>
  );
}
