// lib/visualization.ts
// 公开主页数据聚合：从 IndexedDB 聚合学习数据，按隐私设置过滤

import type { PublicProfile, LearnLog, ReviewLog, ReviewCard, KnowledgeNode } from "./types";
import type { PublicStats } from "./storage/kv";

/**
 * 聚合公开主页统计数据
 * @param username 用户名
 * @param profile 公开主页配置（含 visibility）
 * @param learnLogs 学习日志
 * @param reviewLogs 复习日志
 * @param cards FSRS 卡片（用于雷达图）
 * @param currentTopic 当前学习主题（如公开则展示）
 *
 * 隐私：followerCount / followingCount 永不出现在 PublicStats
 */
export async function buildPublicStats(
  username: string,
  profile: PublicProfile,
  learnLogs: LearnLog[],
  reviewLogs: ReviewLog[],
  cards: ReviewCard[],
  currentTopic: string | undefined,
): Promise<PublicStats> {
  const today = new Date();
  const todayStr = today.toISOString().slice(0, 10);

  // 连续打卡：从今天往前数，连续有 learnLog 的天数
  const datesSet = new Set(learnLogs.map((l) => l.date));
  let streakDays = 0;
  const cursor = new Date(today);
  while (datesSet.has(cursor.toISOString().slice(0, 10))) {
    streakDays++;
    cursor.setDate(cursor.getDate() - 1);
  }

  const totalMinutes = learnLogs.reduce((sum, l) => sum + (l.duration ?? 0), 0);

  const stats: PublicStats = {
    username,
    streakDays,
    totalMinutes,
    updatedAt: new Date().toISOString(),
  };

  // 隐私过滤
  if (profile.visibility.currentTopic && currentTopic) {
    stats.currentTopic = currentTopic;
  }

  if (profile.visibility.heatmap) {
    const byDate = new Map<string, number>();
    for (const l of learnLogs) {
      byDate.set(l.date, (byDate.get(l.date) ?? 0) + (l.duration ?? 0));
    }
    stats.heatmapData = Array.from(byDate.entries())
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }

  if (profile.visibility.radar) {
    // 雷达图：按 nodeId 聚合掌握度
    const nodeMap = new Map<string, { sum: number; count: number }>();
    for (const c of cards) {
      const cur = nodeMap.get(c.nodeId) ?? { sum: 0, count: 0 };
      // 掌握度映射：stability 越大掌握度越高，stability 0-30 映射 0-100
      const mastery = Math.min(100, Math.round((c.stability / 30) * 100));
      cur.sum += mastery;
      cur.count += 1;
      nodeMap.set(c.nodeId, cur);
    }
    stats.radarData = Array.from(nodeMap.entries()).map(([node, v]) => ({
      node,
      value: v.count > 0 ? Math.round(v.sum / v.count) : 0,
    }));
  }

  return stats;
}

/**
 * 从 KnowledgeNode + ReviewCard 计算节点掌握度列表（用于雷达图）
 */
export function aggregateNodeMastery(
  nodes: KnowledgeNode[],
  cards: ReviewCard[],
): Array<{ node: string; value: number }> {
  return nodes.slice(0, 8).map((n) => {
    const nodeCards = cards.filter((c) => c.nodeId === n.id);
    if (nodeCards.length === 0) return { node: n.title, value: n.mastery };
    const avg = nodeCards.reduce((s, c) => s + Math.min(100, Math.round((c.stability / 30) * 100)), 0) / nodeCards.length;
    return { node: n.title, value: Math.round(avg) };
  });
}
