"use client";

// app/mistakes/MistakeBookClient.tsx
// 错题本：展示复习答错的题目，支持标记已掌握、跳转复习

import { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import { listItems } from "@/lib/storage/db";
import { KEY_PREFIXES, type LearningPlan, type MistakeRecord } from "@/lib/types";
import {
  getUnresolvedMistakes,
  resolveMistake,
} from "@/lib/mistake-book";
import { Icon } from "@/components/Icon";
import { Button } from "@/components/ui";

/** 相对时间（"2小时前"） */
function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "刚刚";
  if (minutes < 60) return `${minutes}分钟前`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}小时前`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}天前`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}个月前`;
  return `${Math.floor(months / 12)}年前`;
}

export default function MistakeBookClient() {
  const [unresolved, setUnresolved] = useState<MistakeRecord[]>([]);
  const [resolved, setResolved] = useState<MistakeRecord[]>([]);
  const [plans, setPlans] = useState<LearningPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showResolved, setShowResolved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      const [unresolvedList, allMistakes, allPlans] = await Promise.all([
        getUnresolvedMistakes(),
        listItems<MistakeRecord>(KEY_PREFIXES.MISTAKE),
        listItems<LearningPlan>(KEY_PREFIXES.PLAN),
      ]);
      setUnresolved(unresolvedList);
      setResolved(
        allMistakes
          .filter((m) => m.resolved)
          .sort(
            (a, b) =>
              new Date(b.lastWrongAt).getTime() -
              new Date(a.lastWrongAt).getTime()
          )
      );
      setPlans(allPlans);
    } catch (e) {
      setError(e instanceof Error ? e.message : "加载错题失败");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // nodeId → 节点标题（从所有计划的知识树里找）
  const nodeTitleMap = useMemo(() => {
    const map = new Map<string, string>();
    for (const plan of plans) {
      for (const node of plan.knowledgeTree) {
        if (!map.has(node.id)) map.set(node.id, node.title);
      }
    }
    return map;
  }, [plans]);

  // 统计：错得最多的知识点
  const topWrongNode = useMemo(() => {
    const counts = new Map<string, number>();
    for (const m of unresolved) {
      counts.set(m.nodeId, (counts.get(m.nodeId) ?? 0) + 1);
    }
    let topId: string | null = null;
    let topCount = 0;
    for (const [id, c] of counts) {
      if (c > topCount) {
        topCount = c;
        topId = id;
      }
    }
    if (!topId) return null;
    return { title: nodeTitleMap.get(topId) ?? "未知知识点", count: topCount };
  }, [unresolved, nodeTitleMap]);

  async function handleResolve(id: string) {
    await resolveMistake(id);
    await loadData();
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-400">加载错题本...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 max-w-3xl mx-auto pb-20">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold"><Icon name="x-circle" className="w-5 h-5 inline-block align-middle" /> 错题本</h1>
        <span className="text-sm text-gray-500">
          {unresolved.length} 道待攻克
        </span>
      </div>

      {error && (
        <div className="mb-3 rounded bg-red-50 px-3 py-2 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2 mb-5">
        <div className="border rounded-lg p-3 bg-white text-center">
          <p className="text-2xl font-bold text-gray-800">
            {unresolved.length + resolved.length}
          </p>
          <p className="text-xs text-gray-500 mt-1">累计错题</p>
        </div>
        <div className="border rounded-lg p-3 bg-white text-center">
          <p className="text-2xl font-bold text-red-500">{unresolved.length}</p>
          <p className="text-xs text-gray-500 mt-1">未掌握</p>
        </div>
        <div className="border rounded-lg p-3 bg-white text-center">
          <p className="text-sm font-bold text-gray-800 truncate px-1" title={topWrongNode?.title}>
            {topWrongNode ? topWrongNode.title : "—"}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {topWrongNode ? `错最多 (${topWrongNode.count})` : "最易错知识点"}
          </p>
        </div>
      </div>

      {/* 未解决错题列表 */}
      {unresolved.length === 0 ? (
        <div className="text-center py-16">
          <div className="mb-3 flex justify-center">
            <Icon name="party" className="w-12 h-12 text-gray-400" />
          </div>
          <p className="text-gray-600 font-medium">还没有错题，继续保持！</p>
          <Link
            href="/review"
            className="inline-block mt-4 px-4 py-2 bg-black text-white rounded-lg text-sm hover:bg-gray-800 transition-colors"
          >
            去复习
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {unresolved.map((m) => {
            const expanded = expandedId === m.id;
            const nodeTitle = nodeTitleMap.get(m.nodeId);
            return (
              <div
                key={m.id}
                className="border rounded-lg p-3 bg-white"
              >
                <div
                  className="flex items-start gap-2 cursor-pointer"
                  onClick={() => setExpandedId(expanded ? null : m.id)}
                >
                  <span className="shrink-0 mt-0.5 inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-red-50 text-red-600">
                    <Icon name="x-circle" className="w-3 h-3" /> x {m.wrongCount}
                  </span>
                  <p className={`flex-1 text-sm text-gray-800 ${expanded ? "" : "line-clamp-2"}`}>
                    {m.questionText}
                  </p>
                </div>

                <div className="flex items-center justify-between mt-2">
                  <div className="flex flex-wrap items-center gap-2 text-xs text-gray-400">
                    {nodeTitle && (
                      <span className="bg-gray-100 px-2 py-0.5 rounded text-gray-600">
                        {nodeTitle}
                      </span>
                    )}
                    <span>{relativeTime(m.lastWrongAt)}</span>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleResolve(m.id)}
                    >
                      已掌握
                    </Button>
                    <Link
                      href="/review"
                      className="px-2 py-1 text-xs bg-blue-50 text-blue-700 rounded font-medium hover:bg-blue-100 transition-colors"
                    >
                      去复习
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 已掌握的错题（折叠） */}
      {resolved.length > 0 && (
        <div className="mt-6">
          <button
            onClick={() => setShowResolved((v) => !v)}
            className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-800"
          >
            <span>{showResolved ? "▾" : "▸"}</span>
            <span>
              已掌握的错题（{resolved.length}）
            </span>
          </button>
          {showResolved && (
            <div className="mt-3 space-y-2">
              {resolved.map((m) => {
                const nodeTitle = nodeTitleMap.get(m.nodeId);
                return (
                  <div
                    key={m.id}
                    className="border rounded-lg p-3 bg-gray-50 opacity-75"
                  >
                    <div className="flex items-start gap-2">
                      <span className="shrink-0 mt-0.5 inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-green-50 text-green-600">
                        <Icon name="check" className="w-3 h-3" /> 已掌握
                      </span>
                      <p className="flex-1 text-sm text-gray-600 line-clamp-2">
                        {m.questionText}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 mt-2 text-xs text-gray-400">
                      {nodeTitle && (
                        <span className="bg-gray-100 px-2 py-0.5 rounded text-gray-500">
                          {nodeTitle}
                        </span>
                      )}
                      <span>曾错 {m.wrongCount} 次</span>
                      <span>
                        {new Date(m.lastWrongAt).toLocaleDateString("zh-CN")}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
