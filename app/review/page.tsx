"use client";

// app/review/page.tsx
// 复习页：FSRS 间隔重复算法驱动的卡片复习
//
// 设计：
//   - 数据源：listItems(KEY_PREFIXES.CARD) 全量扫描（与 home/stats 等保持一致，
//     避免 all_card_keys 数组与实际卡片不同步导致"卡片丢失"）
//   - 过滤：支持按 deckId 过滤「只复习某个试题集的卡片」
//   - 进度条 + 当前/总数 + 评分四按钮（Again/Hard/Good/Easy）
//   - 答错（Again）自动加入错题本
//   - 完成后展示统计

import { useState, useEffect, useCallback, useMemo } from "react";
import { listItems, setItem } from "@/lib/storage/db";
import { aiFetch } from "@/lib/api-client";
import { KEY_PREFIXES } from "@/lib/types";
import type { ReviewCard, ReviewLog, Rating, FavoriteDeck } from "@/lib/types";
import { getDueCards } from "@/lib/fsrs";
import { recordMistake } from "@/lib/mistake-book";
import { listFavoriteDecks } from "@/lib/favorite";
import { ReviewCardView } from "@/components/ReviewCardView";
import { Icon } from "@/components/Icon";

export default function ReviewPage() {
  const [allCards, setAllCards] = useState<ReviewCard[]>([]);
  const [decks, setDecks] = useState<FavoriteDeck[]>([]);
  const [selectedDeckId, setSelectedDeckId] = useState<string | "all">("all");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<{ again: number; hard: number; good: number; easy: number }>({
    again: 0,
    hard: 0,
    good: 0,
    easy: 0,
  });
  const [finished, setFinished] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadCards = useCallback(async () => {
    // 数据源切换为 listItems 全量扫描，确保不丢失任何卡片
    // （旧实现读 all_card_keys 数组，与 IndexedDB 实际卡片可能不同步）
    const [cards, deckList] = await Promise.all([
      listItems<ReviewCard>(KEY_PREFIXES.CARD),
      listFavoriteDecks(),
    ]);
    setAllCards(cards);
    setDecks(deckList);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadCards();
  }, [loadCards]);

  // 按选中的 deckId 过滤 + 计算到期卡片
  const dueCards = useMemo(() => {
    const filtered =
      selectedDeckId === "all"
        ? allCards
        : allCards.filter((c) => c.deckId === selectedDeckId);
    return getDueCards(filtered);
  }, [allCards, selectedDeckId]);

  // 切换 deck 过滤或重新加载时，重置进度
  useEffect(() => {
    setCurrentIndex(0);
    setStats({ again: 0, hard: 0, good: 0, easy: 0 });
    setFinished(dueCards.length === 0);
  }, [selectedDeckId, dueCards.length]);

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

      // 下一张
      if (currentIndex + 1 >= dueCards.length) {
        setFinished(true);
      } else {
        setCurrentIndex(currentIndex + 1);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "评分失败");
    }
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
            <p><Icon name="frown" className="w-4 h-4 inline-block align-middle" /> Again: {stats.again}</p>
            <p><Icon name="meh" className="w-4 h-4 inline-block align-middle" /> Hard: {stats.hard}</p>
            <p><Icon name="smile" className="w-4 h-4 inline-block align-middle" /> Good: {stats.good}</p>
            <p><Icon name="smile" className="w-4 h-4 inline-block align-middle" /> Easy: {stats.easy}</p>
            <p className="font-medium mt-2">总计: {total} 张</p>
          </div>
        )}
        {dueCards.length === 0 && allCards.length > 0 && (
          <p className="mt-3 text-xs text-gray-400">
            共 {allCards.length} 张卡片，当前筛选下无到期卡片
          </p>
        )}
      </div>
    );
  }

  const card = dueCards[currentIndex];

  // 找当前卡片所属的 deck（用于显示来源）
  const currentDeck = card?.deckId
    ? decks.find((d) => d.id === card.deckId)
    : undefined;

  return (
    <div className="min-h-screen p-4 max-w-2xl mx-auto pb-20">
      {/* Deck 过滤栏 */}
      {decks.length > 0 && (
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <Icon name="filter" className="w-3.5 h-3.5 text-gray-500" />
            <span className="text-xs text-gray-500">来源筛选</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            <FilterChip
              active={selectedDeckId === "all"}
              onClick={() => setSelectedDeckId("all")}
              label={`全部 (${getDueCards(allCards).length})`}
            />
            {decks.map((d) => {
              const dueCount = getDueCards(
                allCards.filter((c) => c.deckId === d.id)
              ).length;
              return (
                <FilterChip
                  key={d.id}
                  active={selectedDeckId === d.id}
                  onClick={() => setSelectedDeckId(d.id)}
                  label={`${d.topic} (${dueCount})`}
                />
              );
            })}
          </div>
        </div>
      )}

      <div className="text-center mb-4">
        <p className="text-sm text-gray-500">
          {currentIndex + 1} / {dueCards.length} 今日待复习
        </p>
        <div className="w-full bg-gray-200 rounded-full h-1 mt-2">
          <div
            className="bg-blue-500 h-1 rounded-full transition-all"
            style={{ width: `${dueCards.length > 0 ? ((currentIndex + 1) / dueCards.length) * 100 : 0}%` }}
          />
        </div>
        {currentDeck && (
          <p className="mt-1.5 text-[11px] text-gray-400">
            来自：{currentDeck.topic}
          </p>
        )}
      </div>

      {error && (
        <div className="mb-2 rounded bg-red-50 px-3 py-2 text-sm text-red-600">
          {error}
        </div>
      )}

      {dueCards.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <Icon name="check-circle" className="w-10 h-10 inline-block mb-2" />
          <p>当前筛选下没有到期的复习卡片</p>
          {selectedDeckId !== "all" && (
            <button
              onClick={() => setSelectedDeckId("all")}
              className="mt-3 text-xs text-blue-500 hover:underline"
            >
              查看全部卡片 →
            </button>
          )}
        </div>
      ) : (
        <ReviewCardView card={card} onRate={handleRate} />
      )}
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
