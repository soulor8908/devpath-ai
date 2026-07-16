// lib/ai/quality-tracker.ts
// AI 输出质量追踪器（客户端）
// 解决"AI 生成了内容，但系统不知道生成得好不好"的问题
//
// 设计原则（用户规范）：
//   1. 零侵入：不改变主流程，所有写入失败时静默 no-op
//   2. 可观测：每次 AI 输出都有质量标签（AICallRecord）
//   3. 可归因：能追溯到 prompt 版本 + 场景 + 输入摘要
//   4. 可优化：基于反馈数据生成 QualityReport，迭代 prompt
//
// 数据流：
//   - 客户端发起 AI 调用前：生成 callId + 记录 t0
//   - 服务端处理（不变）：API 路由照旧返回结果
//   - 客户端收到结果后：recordAICall() 写入 IndexedDB（ai_call:<id>）
//   - 用户交互触发反馈：trackAIFeedback() 写入 IndexedDB（ai_feedback:<id>）
//   - 仪表盘读取：getQualityReport() 聚合统计
//
// 环境兼容：
//   - 服务端渲染（SSR / Edge）：所有写入函数静默 no-op
//   - IndexedDB 不可用：catch 后 no-op，不抛错
//   - 数据格式损坏：读取时 try/catch 跳过

import { getItem, setItem, listItems, listKeys, delItem } from "@/lib/storage/db";
import { KEY_PREFIXES, type AICallRecord, type AIFeedback, type AIScene, type AIFeedbackRating, type AIFeedbackAction, type AIImplicitAction } from "@/lib/types";
import { PROMPTS, type PromptId, promptFingerprint } from "./prompts";

// ============ 环境检测 ============

const isBrowser = typeof window !== "undefined" && typeof indexedDB !== "undefined";

// ============ ID 生成 ============

/**
 * 生成 AICallRecord / AIFeedback 的唯一 ID
 * 浏览器 + Edge runtime 都有 crypto.randomUUID
 * 兜底用时间戳 + 随机数
 */
export function generateCallId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

// ============ 摘要工具 ============

/**
 * djb2 哈希（与 knowledge.ts / prompts.ts 一致）
 * 用于 inputDigest：把对象 stringify 后哈希，不存原文
 */
function djb2Hash(str: string): string {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) + hash) + str.charCodeAt(i);
    hash = hash & 0xffffffff;
  }
  return (hash >>> 0).toString(16);
}

/**
 * 输入摘要：对象 → JSON → 哈希（前 16 位）
 * 用于 AICallRecord.inputDigest，不存原始输入（隐私 + 体积）
 *
 * 用法：
 *   makeInputDigest({ topic: "React Fiber" })           → "f3a2b1c9..."
 *   makeInputDigest({ nodeId: "k3", title: "Hooks" })   → "8e7d6f5a..."
 *   makeInputDigest("snapshot 文本")                      → "2a1b3c4d..."
 */
export function makeInputDigest(input: unknown): string {
  if (input == null) return "empty";
  const str = typeof input === "string" ? input : JSON.stringify(input);
  if (str.length === 0) return "empty";
  return djb2Hash(str).padStart(8, "0");
}

/**
 * 输出摘要：前 100 字 + 结构化字段数量
 * 用于 AICallRecord.outputDigest，控制体积同时保留可识别性
 *
 * @param output AI 返回内容（字符串或对象）
 * @returns "字段数:N|前100字:..."  或纯文本摘要
 */
export function makeOutputDigest(output: unknown): string {
  if (output == null) return "fields:0|";
  if (typeof output === "string") {
    return `fields:0|${output.slice(0, 100)}`;
  }
  if (typeof output === "object") {
    const obj = output as Record<string, unknown>;
    const fieldCount = Object.keys(obj).length;
    // 尝试取最常见的"内容字段"作为摘要
    const preview =
      (typeof obj.answer === "string" && obj.answer) ||
      (typeof obj.text === "string" && obj.text) ||
      (typeof obj.question === "string" && obj.question) ||
      (typeof obj.nudge === "string" && obj.nudge) ||
      (typeof obj.insights === "object" && Array.isArray(obj.insights) && obj.insights.slice(0, 2).join(" / ")) ||
      JSON.stringify(obj).slice(0, 100);
    return `fields:${fieldCount}|${String(preview).slice(0, 100)}`;
  }
  return `fields:0|${String(output).slice(0, 100)}`;
}

// ============ 计时器 ============

/**
 * 启动计时器，返回 stop 函数
 * 用法：
 *   const stop = startTimer();
 *   ... await fetch(...)
 *   const durationMs = stop();
 */
export function startTimer(): () => number {
  const start = performance.now();
  return () => Math.round(performance.now() - start);
}

// ============ 写入：AICallRecord ============

export interface RecordAICallInput {
  /** 调用场景，与 promptId 对应（一般传相同值） */
  scene: AIScene;
  /** Prompt registry 中的 key，用于查版本 + 算指纹 */
  promptId: PromptId;
  /** 输入摘要（用 makeInputDigest 生成） */
  inputDigest: string;
  /** 输出摘要（用 makeOutputDigest 生成） */
  outputDigest: string;
  /** 结构化输出是否通过 schema 验证 */
  schemaValid: boolean;
  /** 耗时 ms */
  durationMs: number;
  /** 来源：ai=LLM 成功 / rule=规则降级 / fallback=模板兜底 */
  source: "ai" | "rule" | "fallback";
  /** 关联资源 ID（如 questionId / planId / conversationId） */
  refId?: string;
  /** 显式指定 callId（不传则自动生成） */
  callId?: string;
}

/**
 * 客户端：写入一条 AI 调用记录
 * 在收到 API 响应后调用，把记录持久化到 IndexedDB
 *
 * @returns callRecordId（用于后续 trackAIFeedback 关联）
 *
 * 用法：
 *   const stop = startTimer();
 *   const res = await fetch("/api/daily-nudge", ...);
 *   const data = await res.json();
 *   const callId = await recordAICall({
 *     scene: "daily_nudge",
 *     promptId: "daily_nudge",
 *     inputDigest: makeInputDigest(contextSnapshot),
 *     outputDigest: makeOutputDigest(data.nudge),
 *     schemaValid: true,
 *     durationMs: stop(),
 *     source: data.source === "ai" ? "ai" : "rule",
 *   });
 *   // 后续可以挂到组件 state，触发反馈时引用 callId
 */
export async function recordAICall(input: RecordAICallInput): Promise<string> {
  if (!isBrowser) return input.callId ?? generateCallId();

  const id = input.callId ?? generateCallId();
  const def = PROMPTS[input.promptId];
  const promptVersion = def ? promptFingerprint(input.promptId, def.version) : `${input.promptId}:unknown`;

  const record: AICallRecord = {
    id,
    scene: input.scene,
    promptVersion,
    inputDigest: input.inputDigest,
    outputDigest: input.outputDigest,
    schemaValid: input.schemaValid,
    durationMs: input.durationMs,
    source: input.source,
    refId: input.refId,
    createdAt: new Date().toISOString(),
  };

  try {
    await setItem(`${KEY_PREFIXES.AI_CALL}${id}`, record);
  } catch (e) {
    // 静默降级：不影响主流程
    console.warn("[quality-tracker] recordAICall failed:", e);
  }
  return id;
}

// ============ 写入：AIFeedback ============

export interface TrackAIFeedbackInput {
  /** 关联的 AICallRecord.id（必填） */
  callRecordId: string;
  scene: AIScene;
  /** 显式评分：1=很差 5=很好（仅负面反馈采集，默认满意不记录） */
  rating?: AIFeedbackRating;
  /** 显式动作：采纳/丢弃/再生成/编辑 */
  action?: AIFeedbackAction;
  /** 隐式动作：浏览/展开/忽略/追问/复制/收藏 */
  implicitAction?: AIImplicitAction;
  /** 反馈原因（用户选择，如"太难""不相关""答案错误"） */
  reason?: string;
}

/**
 * 客户端：记录用户对某次 AI 输出的反馈
 * 在用户交互回调中调用，写入 IndexedDB
 *
 * 用法（隐式反馈 - 换一题）：
 *   trackAIFeedback({
 *     callRecordId: question.aiCallId,
 *     scene: "question_generate",
 *     action: "regenerated",
 *   });
 *
 * 用法（显式反馈 - 点 👎）：
 *   trackAIFeedback({
 *     callRecordId: nudge.callId,
 *     scene: "daily_nudge",
 *     rating: 1,
 *   });
 */
export async function trackAIFeedback(input: TrackAIFeedbackInput): Promise<void> {
  if (!isBrowser) return;
  if (!input.callRecordId) {
    console.warn("[quality-tracker] trackAIFeedback called without callRecordId");
    return;
  }

  const id = generateCallId();
  const feedback: AIFeedback = {
    id,
    callRecordId: input.callRecordId,
    scene: input.scene,
    rating: input.rating,
    action: input.action,
    implicitAction: input.implicitAction,
    reason: input.reason,
    createdAt: new Date().toISOString(),
  };

  try {
    await setItem(`${KEY_PREFIXES.AI_FEEDBACK}${id}`, feedback);
  } catch (e) {
    console.warn("[quality-tracker] trackAIFeedback failed:", e);
  }
}

// ============ 读取：仪表盘用 ============

export async function listAICalls(): Promise<AICallRecord[]> {
  if (!isBrowser) return [];
  try {
    return await listItems<AICallRecord>(KEY_PREFIXES.AI_CALL);
  } catch {
    return [];
  }
}

export async function listAIFeedbacks(): Promise<AIFeedback[]> {
  if (!isBrowser) return [];
  try {
    return await listItems<AIFeedback>(KEY_PREFIXES.AI_FEEDBACK);
  } catch {
    return [];
  }
}

// ============ 质量报告聚合 ============

export interface SceneQualityStats {
  scene: AIScene;
  calls: number;
  /** 平均评分（无评分数据时为 null） */
  avgRating: number | null;
  /** 采纳率 = adopted / (adopted + discarded)，无数据为 null */
  adoptionRate: number | null;
  /** 再生成率 = regenerated / calls */
  regenerationRate: number | null;
  /** 平均耗时 ms */
  avgDurationMs: number;
}

export interface PromptVersionStats {
  promptVersion: string;
  calls: number;
  avgRating: number | null;
  adoptionRate: number | null;
}

export interface FailureCluster {
  /** 失败模式标签（inputDigest 或 refId） */
  label: string;
  scene: AIScene;
  count: number;
  /** 再生成率（针对该标签） */
  regenerationRate: number;
}

export interface QualityReport {
  /** 按场景聚合 */
  scenes: SceneQualityStats[];
  /** 按 prompt 版本聚合 */
  promptVersions: PromptVersionStats[];
  /** 失败模式聚类（高再生成率的输入） */
  failureClusters: FailureCluster[];
  /** 总调用数 */
  totalCalls: number;
  /** 总反馈数 */
  totalFeedback: number;
  /** 数据时间范围 */
  period: { from: string | null; to: string | null };
}

/**
 * 客户端：从 IndexedDB 读取所有记录，聚合生成质量报告
 *
 * @param since 可选，仅统计 createdAt >= since 的记录（ISO 字符串）
 */
export async function getQualityReport(since?: string): Promise<QualityReport> {
  const [calls, feedbacks] = await Promise.all([listAICalls(), listAIFeedbacks()]);

  const sinceMs = since ? new Date(since).getTime() : 0;
  const filteredCalls = since
    ? calls.filter((c) => new Date(c.createdAt).getTime() >= sinceMs)
    : calls;
  const filteredFeedbacks = since
    ? feedbacks.filter((f) => new Date(f.createdAt).getTime() >= sinceMs)
    : feedbacks;

  // feedback 按 callRecordId 索引（一个 call 可能有多条反馈）
  const feedbacksByCall = new Map<string, AIFeedback[]>();
  for (const f of filteredFeedbacks) {
    const arr = feedbacksByCall.get(f.callRecordId) ?? [];
    arr.push(f);
    feedbacksByCall.set(f.callRecordId, arr);
  }

  // === 按场景聚合 ===
  const sceneMap = new Map<AIScene, AICallRecord[]>();
  for (const c of filteredCalls) {
    const arr = sceneMap.get(c.scene) ?? [];
    arr.push(c);
    sceneMap.set(c.scene, arr);
  }
  const scenes: SceneQualityStats[] = Array.from(sceneMap.entries()).map(([scene, sceneCalls]) => {
    const ratings: number[] = [];
    let adopted = 0;
    let discarded = 0;
    let regenerated = 0;
    for (const c of sceneCalls) {
      const fs = feedbacksByCall.get(c.id) ?? [];
      for (const f of fs) {
        if (typeof f.rating === "number") ratings.push(f.rating);
        if (f.action === "adopted") adopted++;
        if (f.action === "discarded") discarded++;
        if (f.action === "regenerated") regenerated++;
      }
    }
    return {
      scene,
      calls: sceneCalls.length,
      avgRating: ratings.length > 0 ? Number((ratings.reduce((s, r) => s + r, 0) / ratings.length).toFixed(2)) : null,
      adoptionRate: adopted + discarded > 0 ? Number((adopted / (adopted + discarded) * 100).toFixed(1)) : null,
      regenerationRate: sceneCalls.length > 0 ? Number((regenerated / sceneCalls.length * 100).toFixed(1)) : null,
      avgDurationMs: sceneCalls.length > 0
        ? Math.round(sceneCalls.reduce((s, c) => s + c.durationMs, 0) / sceneCalls.length)
        : 0,
    };
  });

  // === 按 prompt 版本聚合 ===
  const versionMap = new Map<string, AICallRecord[]>();
  for (const c of filteredCalls) {
    const arr = versionMap.get(c.promptVersion) ?? [];
    arr.push(c);
    versionMap.set(c.promptVersion, arr);
  }
  const promptVersions: PromptVersionStats[] = Array.from(versionMap.entries()).map(([version, versionCalls]) => {
    const ratings: number[] = [];
    let adopted = 0;
    let discarded = 0;
    for (const c of versionCalls) {
      const fs = feedbacksByCall.get(c.id) ?? [];
      for (const f of fs) {
        if (typeof f.rating === "number") ratings.push(f.rating);
        if (f.action === "adopted") adopted++;
        if (f.action === "discarded") discarded++;
      }
    }
    return {
      promptVersion: version,
      calls: versionCalls.length,
      avgRating: ratings.length > 0 ? Number((ratings.reduce((s, r) => s + r, 0) / ratings.length).toFixed(2)) : null,
      adoptionRate: adopted + discarded > 0 ? Number((adopted / (adopted + discarded) * 100).toFixed(1)) : null,
    };
  });

  // === 失败模式聚类：高再生成率的输入 ===
  // 按 (scene, inputDigest 或 refId) 分组，统计 regenerated 比例
  const clusterMap = new Map<string, { label: string; scene: AIScene; calls: AICallRecord[] }>();
  for (const c of filteredCalls) {
    const label = c.refId ?? c.inputDigest;
    const key = `${c.scene}|${label}`;
    const entry = clusterMap.get(key) ?? { label, scene: c.scene, calls: [] };
    entry.calls.push(c);
    clusterMap.set(key, entry);
  }
  const failureClusters: FailureCluster[] = Array.from(clusterMap.values())
    .map((cluster) => {
      const regenCount = cluster.calls.filter((c) => {
        const fs = feedbacksByCall.get(c.id) ?? [];
        return fs.some((f) => f.action === "regenerated");
      }).length;
      return {
        label: cluster.label,
        scene: cluster.scene,
        count: cluster.calls.length,
        regenerationRate: cluster.calls.length > 0
          ? Number((regenCount / cluster.calls.length * 100).toFixed(1))
          : 0,
      };
    })
    .filter((c) => c.count >= 2 && c.regenerationRate > 0) // 至少 2 次调用 + 有再生成
    .sort((a, b) => b.regenerationRate - a.regenerationRate)
    .slice(0, 10); // Top 10

  // 时间范围
  const timestamps = filteredCalls.map((c) => c.createdAt).sort();
  const period = {
    from: timestamps.length > 0 ? timestamps[0] : null,
    to: timestamps.length > 0 ? timestamps[timestamps.length - 1] : null,
  };

  return {
    scenes,
    promptVersions,
    failureClusters,
    totalCalls: filteredCalls.length,
    totalFeedback: filteredFeedbacks.length,
    period,
  };
}

// ============ 维护：清理旧记录 ============

/**
 * 清理超过 maxAgeDays 天的旧记录（默认 90 天）
 * 在仪表盘页面加载时静默调用，避免 IndexedDB 无限增长
 */
export async function pruneOldRecords(maxAgeDays = 90): Promise<number> {
  if (!isBrowser) return 0;
  const cutoff = Date.now() - maxAgeDays * 24 * 60 * 60 * 1000;
  let deleted = 0;
  try {
    const callKeys = await listKeys(KEY_PREFIXES.AI_CALL);
    const feedbackKeys = await listKeys(KEY_PREFIXES.AI_FEEDBACK);
    for (const key of [...callKeys, ...feedbackKeys]) {
      const item = await getItem<AICallRecord | AIFeedback>(key);
      if (item && new Date(item.createdAt).getTime() < cutoff) {
        await delItem(key);
        deleted++;
      }
    }
  } catch (e) {
    console.warn("[quality-tracker] pruneOldRecords failed:", e);
  }
  return deleted;
}
