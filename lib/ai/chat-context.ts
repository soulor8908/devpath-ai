// lib/ai/chat-context.ts
// 上下文感知聊天：从客户端 IndexedDB 聚合用户当前状态，作为 system prompt 注入
// AI Native 核心升级：把 LLM 从"无状态问答机"变成"了解你的私人教练"
// 聚合维度：
//   1. 最近一次学习计划（topic + 进度 + 当前节点）
//   2. 最近 7 天学习日志（学过哪些节点）
//   3. 未解决错题（最近 5 条）
//   4. 今日状态（能量/心情/可用时间）
//   5. 近 7 天能量趋势
//   6. 当前 routine 时段（如果正在学习时段内）

import { getItem, listItems } from "../storage/db";
import { KEY_PREFIXES, type LearningPlan, type LearnLog, type MistakeRecord, type DailyStatus, type Routine, type ReviewLog, type Reminder, type UserProfile, type SkillLevel } from "../types";
import { chinaDateNow, chinaDateShift } from "../time";
import { getPendingReminders } from "../reminder";
import type { ToolContext, PlanContextItem } from "./chat-tools";

export interface ChatContextSnapshot {
  hasPlan: boolean;
  currentTopic?: string;
  currentPlanId?: string;
  totalNodes?: number;
  completedNodes?: number;
  currentNodeTitle?: string;
  recentLearnedTitles: string[];
  recentMistakeQuestions: string[];
  todayEnergy?: number;
  todayMood?: string;
  todayAvailableMinutes?: number;
  energyTrend7d: number[];
  streakDays: number;
}

/**
 * 从 IndexedDB 聚合当前用户状态，构建可注入 system prompt 的简短文本
 * 设计原则：
 *   - 任何环节失败不抛错，缺数据就跳过（保证 chat 不被上下文拖崩）
 *   - 控制体积 < 1.5KB，避免 token 爆炸
 *   - 全部用自然语言片段拼接，LLM 易于消费
 */
export async function buildChatContext(): Promise<string> {
  const snapshot = await collectSnapshot();
  return renderSnapshot(snapshot);
}

async function collectSnapshot(): Promise<ChatContextSnapshot> {
  const snapshot: ChatContextSnapshot = {
    hasPlan: false,
    recentLearnedTitles: [],
    recentMistakeQuestions: [],
    energyTrend7d: [],
    streakDays: 0,
  };

  // 并行抓取各维度数据，每个 try/catch 独立
  await Promise.all([
    collectLatestPlan(snapshot).catch(() => {}),
    collectRecentLearnLogs(snapshot).catch(() => {}),
    collectRecentMistakes(snapshot).catch(() => {}),
    collectTodayStatus(snapshot).catch(() => {}),
    collectEnergyTrend(snapshot).catch(() => {}),
    collectStreak(snapshot).catch(() => {}),
  ]);

  return snapshot;
}

async function collectLatestPlan(s: ChatContextSnapshot): Promise<void> {
  const plans = await listItems<LearningPlan>(KEY_PREFIXES.PLAN);
  if (plans.length === 0) return;
  plans.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  const latest = plans[0];
  s.hasPlan = true;
  s.currentPlanId = latest.id;
  s.currentTopic = latest.topic;
  s.totalNodes = latest.knowledgeTree.length;
  s.completedNodes = latest.schedule.filter((it) => it.type === "learn" && it.completed).length;

  // 找到当前应该学的第一个未完成 learn 节点
  const todayLearn = latest.schedule.find(
    (it) => it.type === "learn" && !it.completed,
  );
  if (todayLearn) {
    const node = latest.knowledgeTree.find((n) => n.id === todayLearn.nodeId);
    if (node) s.currentNodeTitle = node.title;
  }
}

async function collectRecentLearnLogs(s: ChatContextSnapshot): Promise<void> {
  const logs = await listItems<LearnLog>(KEY_PREFIXES.LEARN_LOG);
  // 最近 7 天、type=learn/learn_complete 的
  const sevenDaysAgo = chinaDateShift(chinaDateNow(), -6);
  const recent = logs
    .filter((l) => l.date >= sevenDaysAgo && (l.type === "learn" || l.type === "learn_complete"))
    .sort((a, b) => (b.timestamp ?? b.date).localeCompare(a.timestamp ?? a.date))
    .slice(0, 5);

  // 尝试从最新 plan 找到节点标题（best-effort）
  let plans: LearningPlan[] = [];
  try {
    plans = await listItems<LearningPlan>(KEY_PREFIXES.PLAN);
  } catch {
    /* ignore */
  }
  const titleByNodeId = new Map<string, string>();
  for (const p of plans) {
    for (const n of p.knowledgeTree) titleByNodeId.set(n.id, n.title);
  }
  const titles: string[] = [];
  for (const log of recent) {
    if (log.nodeId) {
      const t = titleByNodeId.get(log.nodeId);
      if (t) titles.push(t);
    }
  }
  s.recentLearnedTitles = [...new Set(titles)].slice(0, 5);
}

async function collectRecentMistakes(s: ChatContextSnapshot): Promise<void> {
  const all = await listItems<MistakeRecord>(KEY_PREFIXES.MISTAKE);
  const unresolved = all
    .filter((m) => !m.resolved)
    .sort((a, b) => new Date(b.lastWrongAt).getTime() - new Date(a.lastWrongAt).getTime())
    .slice(0, 5);
  s.recentMistakeQuestions = unresolved.map((m) => m.questionText);
}

async function collectTodayStatus(s: ChatContextSnapshot): Promise<void> {
  const key = KEY_PREFIXES.STATUS + chinaDateNow();
  const today = await getItem<DailyStatus>(key);
  if (!today) return;
  s.todayEnergy = today.energy;
  s.todayMood = today.mood;
  s.todayAvailableMinutes = today.availableMinutes;
}

async function collectEnergyTrend(s: ChatContextSnapshot): Promise<void> {
  const all = await listItems<DailyStatus>(KEY_PREFIXES.STATUS);
  const trend: number[] = [];
  for (let i = 6; i >= 0; i--) {
    const date = chinaDateShift(chinaDateNow(), -i);
    const found = all.find((x) => x.date === date);
    trend.push(found?.energy ?? 0);
  }
  s.energyTrend7d = trend;
}

async function collectStreak(s: ChatContextSnapshot): Promise<void> {
  const logs = await listItems<LearnLog>(KEY_PREFIXES.LEARN_LOG);
  const dates = new Set(logs.map((l) => l.date));
  let count = 0;
  let cursor = chinaDateNow();
  while (dates.has(cursor)) {
    count++;
    cursor = chinaDateShift(cursor, -1);
  }
  s.streakDays = count;
}

function renderSnapshot(s: ChatContextSnapshot): string {
  const lines: string[] = [];

  // 计划与进度
  if (s.hasPlan) {
    lines.push(`# 用户当前学习上下文`);
    lines.push(`- 主线计划：${s.currentTopic}`);
    if (s.totalNodes && s.completedNodes !== undefined) {
      const pct = s.totalNodes > 0 ? Math.round((s.completedNodes / s.totalNodes) * 100) : 0;
      lines.push(`- 进度：${s.completedNodes}/${s.totalNodes}（${pct}%）`);
    }
    if (s.currentNodeTitle) {
      lines.push(`- 当前应该学的节点：${s.currentNodeTitle}`);
    }
  } else {
    lines.push(`# 用户当前学习上下文`);
    lines.push(`- 暂无学习计划`);
  }

  // 最近学过
  if (s.recentLearnedTitles.length > 0) {
    lines.push(`- 最近 7 天学过的知识点：${s.recentLearnedTitles.join("、")}`);
  }

  // 错题
  if (s.recentMistakeQuestions.length > 0) {
    lines.push(`- 最近答错的题目（回答时优先关注这些薄弱点）：`);
    for (const q of s.recentMistakeQuestions) {
      const trimmed = q.length > 80 ? q.slice(0, 80) + "…" : q;
      lines.push(`  · ${trimmed}`);
    }
  }

  // 今日状态
  if (s.todayEnergy !== undefined) {
    const moodLabel =
      s.todayMood === "good" ? "良好" : s.todayMood === "bad" ? "低落" : "一般";
    lines.push(`- 今日状态：能量 ${s.todayEnergy}/5、心情${moodLabel}、可用时间 ${s.todayAvailableMinutes ?? "?"} 分钟`);
  }

  // 能量趋势
  const nonZero = s.energyTrend7d.filter((v) => v > 0);
  if (nonZero.length > 0) {
    lines.push(`- 近 7 天能量曲线：${s.energyTrend7d.join("/")}`);
  }

  // 打卡
  if (s.streakDays > 0) {
    lines.push(`- 连续打卡：${s.streakDays} 天`);
  }

  lines.push("");
  lines.push(`# 你的角色`);
  lines.push(`你是 DevPath 私人学习教练。基于以上上下文个性化回答：`);
  lines.push(`- 如果用户问"接下来学什么"，参考"当前应该学的节点"`);
  lines.push(`- 如果用户问的概念命中错题列表，重点讲透、举例、追问`);
  lines.push(`- 能量 ≤2 时主动建议先休息（指引用户去 /rest）`);
  lines.push(`- 回答简洁、结合实际案例，必要时给代码示例，使用 Markdown。`);

  return lines.join("\n");
}

// ============ Tool Context：AI 工具所需的结构化上下文 ============

/**
 * 从 IndexedDB 聚合工具所需的结构化数据。
 * 客户端在发送聊天请求时一并传入，服务端工具直接读取。
 * 设计原则：任何环节失败不抛错，缺数据就跳过。
 */
export async function buildToolContext(): Promise<ToolContext> {
  const ctx: ToolContext = {
    plans: [],
    todayLearnLogs: [],
    todayReviewCount: 0,
    now: new Date().toISOString(),
    pendingReminders: [],
    recentMistakes: [],
  };

  await Promise.all([
    collectPlansForTools(ctx).catch(() => {}),
    collectTodayLearnLogs(ctx).catch(() => {}),
    collectTodayReviewCount(ctx).catch(() => {}),
    collectTodayStatusForTools(ctx).catch(() => {}),
    collectRoutine(ctx).catch(() => {}),
    collectPendingReminders(ctx).catch(() => {}),
    collectRecentMistakesForTools(ctx).catch(() => {}),
  ]);

  return ctx;
}

async function collectPlansForTools(ctx: ToolContext): Promise<void> {
  const plans = await listItems<LearningPlan>(KEY_PREFIXES.PLAN);
  const today = chinaDateNow();

  ctx.plans = plans.map((plan) => {
    const completedNodes = plan.schedule.filter(
      (it) => it.type === "learn" && it.completed,
    ).length;

    // 找当前未完成的学习节点
    const nextLearn = plan.schedule.find((it) => it.type === "learn" && !it.completed);
    let currentNodeTitle: string | undefined;
    if (nextLearn) {
      const node = plan.knowledgeTree.find((n) => n.id === nextLearn.nodeId);
      if (node) currentNodeTitle = node.title;
    }

    // 构建未来 7 天的日程
    const upcomingSchedule: PlanContextItem["upcomingSchedule"] = [];
    const scheduleByDay = new Map<number, typeof plan.schedule>();
    for (const item of plan.schedule) {
      if (!scheduleByDay.has(item.day)) scheduleByDay.set(item.day, []);
      scheduleByDay.get(item.day)!.push(item);
    }

    const todayDay = plan.schedule.find(
      (it) => !it.completed && it.type === "learn",
    )?.day ?? 1;

    for (let d = 0; d < 7; d++) {
      const dayNum = todayDay + d;
      const dayItems = scheduleByDay.get(dayNum) ?? [];
      const date = chinaDateShift(today, d);
      upcomingSchedule.push({
        day: dayNum,
        date,
        tasks: dayItems.map((item) => {
          const node = plan.knowledgeTree.find((n) => n.id === item.nodeId);
          return {
            nodeId: item.nodeId,
            nodeTitle: node?.title ?? item.nodeId,
            type: item.type,
            estimatedMinutes: item.estimatedMinutes,
            completed: item.completed,
          };
        }),
      });
    }

    return {
      id: plan.id,
      topic: plan.topic,
      frozen: plan.frozen ?? false,
      priority: plan.priority ?? 3,
      dailyMinutes: plan.dailyMinutes,
      maxNewPerDay: plan.maxNewPerDay,
      totalNodes: plan.knowledgeTree.length,
      completedNodes,
      currentNodeTitle,
      upcomingSchedule,
    };
  });
}

async function collectTodayLearnLogs(ctx: ToolContext): Promise<void> {
  const logs = await listItems<LearnLog>(KEY_PREFIXES.LEARN_LOG);
  const today = chinaDateNow();
  const todayLogs = logs.filter((l) => l.date === today);

  // 尝试从计划找节点标题
  let plans: LearningPlan[] = [];
  try {
    plans = await listItems<LearningPlan>(KEY_PREFIXES.PLAN);
  } catch {
    /* ignore */
  }
  const titleByNodeId = new Map<string, string>();
  for (const p of plans) {
    for (const n of p.knowledgeTree) titleByNodeId.set(n.id, n.title);
  }

  ctx.todayLearnLogs = todayLogs.map((l) => ({
    type: l.type,
    nodeTitle: l.nodeId ? titleByNodeId.get(l.nodeId) : undefined,
    timestamp: l.timestamp,
  }));
}

async function collectTodayReviewCount(ctx: ToolContext): Promise<void> {
  const logs = await listItems<ReviewLog>(KEY_PREFIXES.REVIEW_LOG);
  const today = chinaDateNow();
  ctx.todayReviewCount = logs.filter((l) => l.date === today).length;
}

async function collectTodayStatusForTools(ctx: ToolContext): Promise<void> {
  const key = KEY_PREFIXES.STATUS + chinaDateNow();
  const today = await getItem<DailyStatus>(key);
  if (!today) return;
  ctx.todayStatus = {
    energy: today.energy,
    mood: today.mood,
    availableMinutes: today.availableMinutes,
  };
}

async function collectRoutine(ctx: ToolContext): Promise<void> {
  const routine = await getItem<Routine>(KEY_PREFIXES.ROUTINE_DATA);
  if (!routine) return;
  ctx.routine = {
    wakeTime: routine.wakeTime,
    sleepTime: routine.sleepTime,
    slots: routine.slots.map((s) => ({
      label: s.label,
      start: s.start,
      end: s.end,
      minutes: s.minutes,
    })),
    weekdays: routine.weekdays,
    intensity: routine.intensity,
  };
}

async function collectPendingReminders(ctx: ToolContext): Promise<void> {
  const reminders = await getPendingReminders();
  ctx.pendingReminders = reminders.map((r) => ({
    id: r.id,
    title: r.title,
    scheduledFor: r.scheduledFor,
  }));
}

async function collectRecentMistakesForTools(ctx: ToolContext): Promise<void> {
  const all = await listItems<MistakeRecord>(KEY_PREFIXES.MISTAKE);
  const unresolved = all
    .filter((m) => !m.resolved)
    .sort((a, b) => new Date(b.lastWrongAt).getTime() - new Date(a.lastWrongAt).getTime())
    .slice(0, 5);
  ctx.recentMistakes = unresolved.map((m) => m.questionText);
}

// ============ 用户画像上下文 ============

/** 技能等级 → 中文标签 */
const SKILL_LEVEL_LABEL: Record<SkillLevel, string> = {
  advanced: "进阶",
  intermediate: "中级",
  beginner: "入门",
};

/** 技能等级排序权重（advanced > intermediate > beginner） */
const SKILL_LEVEL_ORDER: Record<SkillLevel, number> = {
  advanced: 3,
  intermediate: 2,
  beginner: 1,
};

/**
 * 从时段 "HH:00-HH:59" 提取小时并返回中文时段前缀（早/午/晚/夜）
 */
function timeSlotPrefix(slot: string): string {
  const hour = parseInt(slot.slice(0, 2), 10);
  if (isNaN(hour)) return "";
  if (hour >= 6 && hour < 12) return "早";
  if (hour >= 12 && hour < 18) return "午";
  if (hour >= 18 && hour < 24) return "晚";
  return "夜";
}

/**
 * 将 UserProfile 渲染为 ≤ 500 字符的画像文本（供 system prompt 注入）
 *
 * 格式示例：
 *   # 用户画像
 *   - 技能画像：React(进阶)、算法(入门)、Node.js(中级)
 *   - 薄弱环节：闭包、事件循环、动态规划
 *   - 常用学习时段：早 06:00-06:59、午 12:00-12:59
 *   - 平均专注时长：35 分钟
 *
 * - 技能画像：Top 5（按 advanced>intermediate>beginner 排序）
 * - 薄弱环节：skillLevel 中 beginner 的 key（最多 3 个）
 * - nodeId 会尽量从 LearningPlan.knowledgeTree 解析为可读标题
 */
export async function buildProfileContext(profile: UserProfile): Promise<string> {
  // 从所有计划解析 nodeId → 标题（best-effort，找不到就用 nodeId）
  let titleByNodeId = new Map<string, string>();
  try {
    const plans = await listItems<LearningPlan>(KEY_PREFIXES.PLAN);
    for (const p of plans) {
      for (const n of p.knowledgeTree) {
        titleByNodeId.set(n.id, n.title);
      }
    }
  } catch {
    /* ignore */
  }

  const resolveTitle = (nodeId: string) => titleByNodeId.get(nodeId) ?? nodeId;

  const lines: string[] = ["# 用户画像"];

  // 技能画像 Top 5
  const topSkills = Object.entries(profile.skillLevel)
    .sort((a, b) => SKILL_LEVEL_ORDER[b[1]] - SKILL_LEVEL_ORDER[a[1]])
    .slice(0, 5)
    .map(([nodeId, level]) => `${resolveTitle(nodeId)}(${SKILL_LEVEL_LABEL[level]})`);
  if (topSkills.length > 0) {
    lines.push(`- 技能画像：${topSkills.join("、")}`);
  }

  // 薄弱环节（beginner，最多 3 个）
  const weakAreas = Object.entries(profile.skillLevel)
    .filter(([, level]) => level === "beginner")
    .slice(0, 3)
    .map(([nodeId]) => resolveTitle(nodeId));
  if (weakAreas.length > 0) {
    lines.push(`- 薄弱环节：${weakAreas.join("、")}`);
  }

  // 偏好时段
  if (profile.preferredTimeSlots.length > 0) {
    const slotLabels = profile.preferredTimeSlots.map(
      (s) => `${timeSlotPrefix(s)} ${s}`,
    );
    lines.push(`- 常用学习时段：${slotLabels.join("、")}`);
  }

  // 平均专注时长
  if (profile.averageSessionMinutes > 0) {
    lines.push(`- 平均专注时长：${profile.averageSessionMinutes} 分钟`);
  }

  let text = lines.join("\n");
  // 硬限制 ≤ 500 字符（超出截断，避免 token 爆炸）
  if (text.length > 500) {
    text = text.slice(0, 497) + "...";
  }
  return text;
}
