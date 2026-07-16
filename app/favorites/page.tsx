"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { listFavoriteDecks, deleteFavoriteDeck, listFavoritedQuestions, unfavorQuestion } from "@/lib/favorite";
import { createCard } from "@/lib/fsrs";
import { getItem, setItem } from "@/lib/storage/db";
import { KEY_PREFIXES } from "@/lib/types";
import type { FavoriteDeck } from "@/lib/types";
import type { FavoritedQuestionWithPlan } from "@/lib/favorite";

export default function FavoritesPage() {
  const [tab, setTab] = useState<"decks" | "questions">("decks");
  const [decks, setDecks] = useState<FavoriteDeck[]>([]);
  const [questions, setQuestions] = useState<FavoritedQuestionWithPlan[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedDeck, setExpandedDeck] = useState<string | null>(null);

  async function loadData() {
    const [d, q] = await Promise.all([listFavoriteDecks(), listFavoritedQuestions()]);
    setDecks(d);
    setQuestions(q);
    setLoading(false);
  }

  useEffect(() => {
    loadData();
  }, []);

  async function handleDeleteDeck(id: string, topic: string) {
    if (!confirm(`确定删除试题集「${topic}」吗？此操作不可恢复。`)) return;
    await deleteFavoriteDeck(id);
    await loadData();
  }

  async function handleUnfavorQuestion(planId: string, questionId: string, questionText: string) {
    if (!confirm(`确定取消收藏这道题吗？\n\n${questionText.slice(0, 50)}${questionText.length > 50 ? "..." : ""}`)) return;
    await unfavorQuestion(planId, questionId);
    await loadData();
  }

  async function handleStartReview(deck: FavoriteDeck) {
    // 用 deck 的题创建 FSRS 卡片
    const cardKeys: string[] = [];
    for (const q of deck.questions) {
      const card = createCard(deck.id, q.nodeId, q.id, q.question, q.answer, "standard");
      await setItem(KEY_PREFIXES.CARD + card.id, card);
      cardKeys.push(KEY_PREFIXES.CARD + card.id);
    }
    // 存 key 列表供 /review 读取
    const existing = await getItem<string[]>("all_card_keys").then((k) => k || []);
    await setItem("all_card_keys", [...existing, ...cardKeys]);
    setMessage(`已创建 ${deck.questions.length} 张复习卡片，去 /review 开始复习`);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-400">加载中...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 max-w-2xl mx-auto pb-20">
      <h1 className="text-xl font-bold mb-4">收藏夹</h1>

      {message && (
        <div className="mb-4 rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">
          {message}
        </div>
      )}

      {/* Tab 切换 */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setTab("decks")}
          className={`flex-1 py-2 rounded-lg text-sm font-medium ${
            tab === "decks" ? "bg-black text-white" : "bg-gray-100 text-gray-600"
          }`}
        >
          试题集（{decks.length}）
        </button>
        <button
          onClick={() => setTab("questions")}
          className={`flex-1 py-2 rounded-lg text-sm font-medium ${
            tab === "questions" ? "bg-black text-white" : "bg-gray-100 text-gray-600"
          }`}
        >
          单题（{questions.length}）
        </button>
      </div>

      {/* 试题集 Tab */}
      {tab === "decks" && (
        <div className="space-y-3">
          {decks.length === 0 ? (
            <p className="text-center text-gray-400 py-8">还没有收藏的试题集</p>
          ) : (
            decks.map((deck) => (
              <div key={deck.id} className="border rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-medium">{deck.topic}</h3>
                    <p className="text-xs text-gray-400 mt-1">
                      {deck.questionCount} 题 · {new Date(deck.favoritedAt).toLocaleDateString("zh-CN")}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={() => handleStartReview(deck)}
                    className="px-3 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium hover:bg-blue-200"
                  >
                    开始复习
                  </button>
                  <button
                    onClick={() => setExpandedDeck(expandedDeck === deck.id ? null : deck.id)}
                    className="px-3 py-1 bg-gray-100 text-gray-600 rounded text-xs font-medium hover:bg-gray-200"
                  >
                    {expandedDeck === deck.id ? "收起" : "查看题目"}
                  </button>
                  <button
                    onClick={() => handleDeleteDeck(deck.id, deck.topic)}
                    className="px-3 py-1 bg-red-50 text-red-600 rounded text-xs font-medium hover:bg-red-100"
                  >
                    删除
                  </button>
                </div>
                {expandedDeck === deck.id && (
                  <div className="mt-3 space-y-2">
                    {deck.questions.map((q, i) => (
                      <div key={q.id} className="text-sm border-l-2 border-gray-200 pl-2">
                        <p className="font-medium">{i + 1}. {q.question}</p>
                        <p className="text-xs text-gray-500 mt-1">{q.answer.slice(0, 80)}...</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* 单题 Tab */}
      {tab === "questions" && (
        <div className="space-y-2">
          {questions.length === 0 ? (
            <p className="text-center text-gray-400 py-8">还没有收藏的单题</p>
          ) : (
            questions.map(({ question: q, planId, planTopic }) => (
              <div key={q.id} className="border rounded-lg p-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{q.question}</p>
                    <p className="text-xs text-gray-400 mt-1">来自：{planTopic}</p>
                  </div>
                  <button
                    onClick={() => handleUnfavorQuestion(planId, q.id, q.question)}
                    className="shrink-0 px-2 py-1 bg-red-50 text-red-600 rounded text-xs font-medium hover:bg-red-100"
                  >
                    取消收藏
                  </button>
                </div>
                {q.keyPoints.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {q.keyPoints.map((kp, i) => (
                      <span key={i} className="text-xs bg-gray-100 px-2 py-0.5 rounded">
                        {kp}
                      </span>
                    ))}
                  </div>
                )}
                <Link
                  href={`/learn/${planId}`}
                  className="text-xs text-blue-500 mt-2 inline-block hover:underline"
                >
                  查看原计划 →
                </Link>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
