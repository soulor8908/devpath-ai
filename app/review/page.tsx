"use client";

// app/review/page.tsx
// 复习页：FSRS 间隔重复算法驱动的卡片复习
//
// 设计（Stage 3 + Stage 4 重构）：
//   - 多维筛选：计划 / 知识点 / 难度 / 到期状态 / 大厂标记 / 关键词搜索
//   - 导航：上一条 / 下一条 + 键盘 ← → + 计数器点击展开跳转滑块
//   - 卡片操作：删除 / 跳过 / 暂不复习（bury，本会话内移除）
//   - 卡片元信息：计划 / 知识点 / 难度 / 大厂标记 / 上次复习 / 下次到期 / 复习次数 / 失误次数
//   - 答错（Again）自动加入错题本
//   - 完成后展示统计

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { listItems, setItem, delItem } from "@/lib/storage/db";
import { aiFetch } from "@/lib/api-client";
import { KEY_PREFIXES } from "@/lib/types";
import type {
  ReviewCard,
  ReviewLog,
  Rating,
  FavoriteDeck,
  LearningPlan,
  KnowledgeNode,
} from "@/lib/types";
import { recordMistake } from "@/lib/mistake-book";
import { listFavoriteDecks } from "@/lib/favorite";
import { ReviewCardView } from "@/components/ReviewCardView";
import { Icon } from "@/components/Icon";
import {
  applyReviewFilters,
  DEFAULT_FILTERS,
  type ReviewFilters,
} from "@/lib/review-filter";
import { confirmDialog } from "@/lib/confirm-dialog";
import { toast } from "@/lib/toast";

const DIFFICULTIES: number[] = [1, 2, 3, 4, 5];
const DUE_STATUSES: { value: ReviewFilters["dueStatus"]; label: string }[] = [
  { value: "all", label: "全部" },
  { value: "overdue", label: "逾期" },
  { value: "today", label: "今日" },
  { value: "week", label: "未来7天" },
];
const BIGTECH_OPTIONS: { value: ReviewFilters["bigTech"]; label: string }[] = [
  { value: "all", label: "全部" },
  { value: "yes", label: "大厂" },
  { value: "no", label: "普通" },
];

export default function ReviewPage() {
  const [allCards, setAllCards] = useState<ReviewCard[]>([]);
  const [plans, setPlans] = useState<LearningPlan[]>([]);
  const [decks, setDecks] = useState<FavoriteDeck[]>([]);
  const [filters, setFilters] = useState<ReviewFilters>(DEFAULT_FILTERS);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [buriedIds, setBuriedIds] = useState<Set<string>>(new Set());
  const [filterCollapsed, setFilterCollapsed] = useState(false);
  const [showJumpSlider, setShowJumpSlider] = useState(false);
  const [stats, setStats] = useState({ again: 0, hard: 0, good: 0, easy: 0 });
  const [finished, setFinished] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadCards = useCallback(async () => {
    const [cards, planList, deckList] = await Promise.all([
      listItems<ReviewCard>(KEY_PREFIXES.CARD),
      listItems<LearningPlan>(KEY_PREFIXES.PLAN),
      listFavoriteDecks(),
    ]);
    setAllCards(cards);
    setPlans(planList);
    setDecks(deckList);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadCards();
  }, [loadCards]);

  // 多维筛选 + 排除已 bury 的卡片
  const dueCards = useMemo(() => {
    const now = new Date();
    const filtered = applyReviewFilters(allCards, filters, { plans, now });
    return filtered.filter((c) => !buriedIds.has(c.id));
  }, [allCards, filters, plans, buriedIds]);

  // 所有计划下的知识点去重列表（筛选下拉用）
  const allNodes = useMemo<KnowledgeNode[]>(() => {
    const map = new Map<string, KnowledgeNode>();
    for (const p of plans) {
      for (const n of p.knowledgeTree ?? []) {
        if (!map.has(n.id)) map.set(n.id, n);
      }
    }
    return Array.from(map.values());
  }, [plans]);

  // 筛选变化时重置进度（注意：不依赖 dueCards.length，避免 bury/delete 误触发重置）
  useEffect(() => {
    setCurrentIndex(0);
    setStats({ again: 0, hard: 0, good: 0, easy: 0 });
    setFinished(false);
    setShowJumpSlider(false);
  }, [filters]);

  // 键盘导航：← →（输入框聚焦时不响应）
  useEffect(() => {
    if (finished || dueCards.length === 0) return;
    function onKey(e: KeyboardEvent) {
      const tag = (e.target as HTMLElement | null)?.tagName;
      if (tag === "INPUT" || tag === "SELECT" || tag === "TEXTAREA") return;
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        setCurrentIndex((i) => Math.max(0, i - 1));
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        setCurrentIndex((i) => Math.min(dueCards.length - 1, i + 1));
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [finished, dueCards.length]);

  function goPrev() {
    setCurrentIndex((i) => Math.max(0, i - 1));
  }
  function goNext() {
    setCurrentIndex((i) => Math.min(dueCards.length - 1, i + 1));
  }

  // 触摸滑动：左滑下一条、右滑上一条（水平位移 > 50px 且 > 2*垂直位移）
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);

  function handleTouchStart(e: React.TouchEvent) {
    const touch = e.touches[0];
    touchStartRef.current = { x: touch.clientX, y: touch.clientY };
  }

  function handleTouchEnd(e: React.TouchEvent) {
    if (!touchStartRef.current) return;
    const touch = e.changedTouches[0];
    const dx = touch.clientX - touchStartRef.current.x;
    const dy = touch.clientY - touchStartRef.current.y;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 2) {
      if (dx < 0) goNext(); // 左滑 → 下一条
      else goPrev(); // 右滑 → 上一条
    }
    touchStartRef.current = null;
  }

  async function handleRate(rating: Rating) {
    const card = dueCards[currentIndex];
    if (!card) return;

    try {
      const res = await aiFetch("/api/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ card, rating }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        setError(err.error || `评分失败 (${res.status})`);
        return;
      }
      const { card: updatedCard, log } = (await res.json()) as {
        card: ReviewCard;
        log: ReviewLog;
      };

      // 存回 IndexedDB
      await setItem(KEY_PREFIXES.CARD + updatedCard.id, updatedCard);
      await setItem(KEY_PREFIXES.REVIEW_LOG + log.id, log);

      // 答错（Again）自动加入错题本
      if (rating === 1) {
        try {
          await recordMistake({
            planId: card.planId,
            questionId: card.questionId,
            nodeId: card.nodeId,
            questionText: card.front,
            answerText: card.back,
          });
        } catch {
          // 错题记录失败不影响复习流程
        }
      }

      // 更新统计
      setStats((prev) => ({
        ...prev,
        again: prev.again + (rating === 1 ? 1 : 0),
        hard: prev.hard + (rating === 2 ? 1 : 0),
        good: prev.good + (rating === 3 ? 1 : 0),
        easy: prev.easy + (rating === 4 ? 1 : 0),
      }));

      // 自动前进到最后一张则完成
      if (currentIndex + 1 >= dueCards.length) {
        setFinished(true);
      } else {
        setCurrentIndex((i) => Math.min(i + 1, dueCards.length - 1));
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "评分失败");
    }
  }

  async function handleDelete(cardId: string) {
    const ok = await confirmDialog({
      title: "删除卡片",
      message: "删除后无法恢复，确认删除这张复习卡片？",
      confirmText: "删除",
      cancelText: "取消",
      danger: true,
    });
    if (!ok) return;
    try {
      await delItem(KEY_PREFIXES.CARD + cardId);
      setAllCards((prev) => prev.filter((c) => c.id !== cardId));
      setCurrentIndex((i) => Math.min(i, Math.max(0, dueCards.length - 2)));
      toast.success("已删除");
    } catch {
      toast.error("删除失败");
    }
  }

  function handleSkip() {
    setCurrentIndex((i) => Math.min(i + 1, dueCards.length - 1));
  }

  function handleBury() {
    const card = dueCards[currentIndex];
    if (!card) return;
    setBuriedIds((prev) => {
      const next = new Set(prev);
      next.add(card.id);
      return next;
    });
    setCurrentIndex((i) => Math.min(i, dueCards.length - 2));
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-400">加载复习卡片...</p>
      </div>
    );
  }

  if (finished) {
    const total = stats.again + stats.hard + stats.good + stats.easy;
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6">
        <div className="mb-4">
          <Icon name="party" className="w-12 h-12 inline-block" />
        </div>
        <h1 className="text-xl font-bold mb-2">
          {total === 0 ? "今天没有需要复习的卡片" : "复习完成！"}
        </h1>
        {total > 0 && (
          <div className="mt-4 space-y-1 text-sm">
            <p>
              <Icon name="frown" className="w-4 h-4 inline-block align-middle" /> Again: {stats.again}
            </p>
            <p>
              <Icon name="meh" className="w-4 h-4 inline-block align-middle" /> Hard: {stats.hard}
            </p>
            <p>
              <Icon name="smile" className="w-4 h-4 inline-block align-middle" /> Good: {stats.good}
            </p>
            <p>
              <Icon name="smile" className="w-4 h-4 inline-block align-middle" /> Easy: {stats.easy}
            </p>
            <p className="font-medium mt-2">总计: {total} 张</p>
          </div>
        )}
      </div>
    );
  }

  const card = dueCards[currentIndex];
  const cardPlan = card ? plans.find((p) => p.id === card.planId) : undefined;
  const cardNode = cardPlan?.knowledgeTree.find((n) => n.id === card.nodeId);
  const cardDeck = card?.deckId ? decks.find((d) => d.id === card.deckId) : undefined;
  const isFiltered =
    filters.planId !== "all" ||
    filters.nodeId !== "all" ||
    filters.difficulty !== "all" ||
    filters.dueStatus !== "all" ||
    filters.bigTech !== "all" ||
    filters.search.trim() !== "";

  return (
    <div className="min-h-screen p-4 max-w-2xl mx-auto pb-20">
      {/* ===== 筛选栏（可收起）===== */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <Icon name="filter" className="w-3.5 h-3.5 text-gray-500" />
            <span className="text-xs text-gray-500">筛选</span>
            {isFiltered && !filterCollapsed && (
              <span className="text-[10px] text-blue-500">·已筛选</span>
            )}
          </div>
          <button
            onClick={() => setFilterCollapsed((v) => !v)}
            className="text-xs text-gray-500 hover:text-gray-700"
          >
            {filterCollapsed ? "展开过滤" : "收起"}
          </button>
        </div>

        {!filterCollapsed && (
          <div className="space-y-2 rounded-lg border border-gray-200 bg-white p-3">
            {/* 计划 + 知识点下拉 */}
            <div className="grid grid-cols-2 gap-2">
              <select
                value={filters.planId}
                onChange={(e) => setFilters((f) => ({ ...f, planId: e.target.value }))}
                className="text-xs border border-gray-200 rounded px-2 py-1 bg-white"
              >
                <option value="all">全部计划</option>
                {plans.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.topic}
                  </option>
                ))}
              </select>
              <select
                value={filters.nodeId}
                onChange={(e) => setFilters((f) => ({ ...f, nodeId: e.target.value }))}
                className="text-xs border border-gray-200 rounded px-2 py-1 bg-white"
              >
                <option value="all">全部知识点</option>
                {allNodes.map((n) => (
                  <option key={n.id} value={n.id}>
                    {n.title}
                  </option>
                ))}
              </select>
            </div>

            {/* 难度按钮 */}
            <FilterRow label="难度">
              <FilterChip
                active={filters.difficulty === "all"}
                onClick={() => setFilters((f) => ({ ...f, difficulty: "all" }))}
                label="全部"
              />
              {DIFFICULTIES.map((d) => (
                <FilterChip
                  key={d}
                  active={filters.difficulty === d}
                  onClick={() => setFilters((f) => ({ ...f, difficulty: d }))}
                  label={String(d)}
                />
              ))}
            </FilterRow>

            {/* 到期状态按钮 */}
            <FilterRow label="到期">
              {DUE_STATUSES.map((s) => (
                <FilterChip
                  key={s.value}
                  active={filters.dueStatus === s.value}
                  onClick={() => setFilters((f) => ({ ...f, dueStatus: s.value }))}
                  label={s.label}
                />
              ))}
            </FilterRow>

            {/* 大厂标记按钮 */}
            <FilterRow label="标记">
              {BIGTECH_OPTIONS.map((o) => (
                <FilterChip
                  key={o.value}
                  active={filters.bigTech === o.value}
                  onClick={() => setFilters((f) => ({ ...f, bigTech: o.value }))}
                  label={o.label}
                />
              ))}
            </FilterRow>

            {/* 搜索 + 清除 */}
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Icon
                  name="search"
                  className="w-3.5 h-3.5 text-gray-400 absolute left-2 top-1/2 -translate-y-1/2"
                />
                <input
                  type="text"
                  value={filters.search}
                  onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))}
                  placeholder="搜索正面 / 背面"
                  className="w-full text-xs border border-gray-200 rounded pl-7 pr-2 py-1"
                />
              </div>
              <button
                onClick={() => setFilters(DEFAULT_FILTERS)}
                disabled={!isFiltered}
                className="text-xs text-gray-500 hover:text-gray-700 disabled:opacity-40"
              >
                清除筛选
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ===== 进度 + 导航栏 ===== */}
      {dueCards.length > 0 && (
        <div className="mb-3">
          <div className="flex items-center justify-between gap-2">
            <button
              onClick={goPrev}
              disabled={currentIndex === 0}
              className="text-xs px-2 py-1 rounded border border-gray-200 bg-white disabled:opacity-40 hover:bg-gray-50"
            >
              <Icon name="chevron-right" className="w-3.5 h-3.5 inline-block rotate-180" /> 上一条
            </button>
            <button
              onClick={() => setShowJumpSlider((v) => !v)}
              className="text-xs text-gray-600 hover:text-gray-900"
            >
              {currentIndex + 1} / {dueCards.length}
            </button>
            <button
              onClick={goNext}
              disabled={currentIndex >= dueCards.length - 1}
              className="text-xs px-2 py-1 rounded border border-gray-200 bg-white disabled:opacity-40 hover:bg-gray-50"
            >
              下一条 <Icon name="chevron-right" className="w-3.5 h-3.5 inline-block" />
            </button>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-1 mt-2">
            <div
              className="bg-blue-500 h-1 rounded-full transition-all"
              style={{
                width: `${((currentIndex + 1) / dueCards.length) * 100}%`,
              }}
            />
          </div>
          {showJumpSlider && (
            <input
              type="range"
              min={0}
              max={Math.max(0, dueCards.length - 1)}
              value={currentIndex}
              onChange={(e) => setCurrentIndex(Number(e.target.value))}
              className="w-full mt-2"
            />
          )}
        </div>
      )}

      {/* ===== 卡片元信息 ===== */}
      {card && (
        <div className="mb-2">
          <div className="flex items-start justify-between gap-2">
            <div className="text-xs text-gray-500 leading-relaxed flex-1 min-w-0">
              <p className="truncate">
                计划: {cardPlan?.topic ?? "未知"} · 知识点: {cardNode?.title ?? "未知"} · 难度{" "}
                {cardNode?.difficulty ?? "?"}
                {cardNode?.bigTech && (
                  <span className="ml-1 inline-block px-1 py-0.5 text-[10px] bg-orange-100 text-orange-700 rounded">
                    大厂
                  </span>
                )}
                {cardDeck && <span className="ml-1 text-gray-400">· 来源: {cardDeck.topic}</span>}
              </p>
              <p className="truncate text-gray-400">
                上次复习: {formatRelative(card.lastReview)} · 下次到期: {formatRelative(card.due)} ·
                复习 {card.reps} 次 · 失误 {card.lapses} 次
              </p>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="mb-2 rounded bg-red-50 px-3 py-2 text-sm text-red-600">{error}</div>
      )}

      {/* ===== 卡片视图 / 空状态 ===== */}
      {dueCards.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <Icon name="check-circle" className="w-10 h-10 inline-block mb-2" />
          <p>当前筛选下没有到期的复习卡片</p>
          {isFiltered && (
            <button
              onClick={() => setFilters(DEFAULT_FILTERS)}
              className="mt-3 text-xs text-blue-500 hover:underline"
            >
              清除筛选查看全部 →
            </button>
          )}
        </div>
      ) : (
        <>
          <div onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
            <ReviewCardView key={card.id} card={card} onRate={handleRate} />
          </div>

          {/* 操作行 */}
          <div className="mt-3 flex items-center justify-between gap-2">
            <button
              onClick={handleSkip}
              className="text-xs px-3 py-1.5 rounded border border-gray-200 bg-white hover:bg-gray-50"
            >
              跳过
            </button>
            <button
              onClick={handleBury}
              className="text-xs px-3 py-1.5 rounded border border-gray-200 bg-white hover:bg-gray-50"
            >
              暂不复习
            </button>
            <button
              onClick={() => handleDelete(card.id)}
              className="text-xs px-3 py-1.5 rounded border border-red-200 text-red-500 bg-white hover:bg-red-50"
            >
              <Icon name="trash" className="w-3.5 h-3.5 inline-block" /> 删除
            </button>
          </div>
        </>
      )}
    </div>
  );
}

/** 筛选行：标签 + 子元素 */
function FilterRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-[11px] text-gray-400 w-8 shrink-0">{label}</span>
      <div className="flex flex-wrap gap-1.5">{children}</div>
    </div>
  );
}

/** 过滤芯片按钮 */
function FilterChip({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`text-xs px-2.5 py-1 rounded-full transition-colors ${
        active
          ? "bg-black text-white"
          : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
      }`}
    >
      {label}
    </button>
  );
}

/** 相对时间格式化：今天 / 昨天 / 明天 / N天前 / N天后 / 无 */
function formatRelative(iso: string): string {
  if (!iso) return "无";
  const date = new Date(iso);
  if (isNaN(date.getTime())) return "无";
  const now = new Date();
  const startOfDay = (d: Date) => {
    const x = new Date(d);
    x.setHours(0, 0, 0, 0);
    return x;
  };
  const dayDiff = Math.round(
    (startOfDay(date).getTime() - startOfDay(now).getTime()) / (24 * 60 * 60 * 1000)
  );
  if (dayDiff === 0) return "今天";
  if (dayDiff === -1) return "昨天";
  if (dayDiff === 1) return "明天";
  if (dayDiff < 0) return `${-dayDiff}天前`;
  return `${dayDiff}天后`;
}
