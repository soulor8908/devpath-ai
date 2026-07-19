"use client";

// components/ChatClient.tsx
// AI 聊天界面：支持多对话管理、流式响应、历史搜索、提示词库、模型选择
//
// 路由变更说明：
//   - 已删除 /chat 路由，统一为聊天弹窗（ChatModal）
//   - ChatClient 不再使用 useRouter / useSearchParams / router.replace
//   - prefill / source 等参数通过 props 从父组件（FloatingChat）传入，
//     父组件消费 lib/chat-modal-store 全局 store
//   - 任何想"打开聊天 + 预填充"的业务方调用 openChatModal({ prefill, source })

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { aiFetch } from "@/lib/api-client";
import {
  type ChatMessage,
  type Conversation,
  type ModelConfig,
  type LearningPlan,
  type ChatSource,
  KEY_PREFIXES,
} from "@/lib/types";
import {
  listConversations,
  createConversation,
  getConversation,
  deleteConversation,
  getMessages,
  addMessage,
  togglePin,
  cleanupOldConversations,
  deleteMessage,
  deleteMessagesFrom,
} from "@/lib/chat-store";
import { listModelConfigs, getDefaultModelConfig } from "@/lib/model-config";
import { AnswerContent } from "@/components/CodeBlock";
import { Icon } from "@/components/Icon";
import { QuickShortcuts } from "@/components/QuickShortcuts";
import { ModelIconSelector } from "@/components/ModelIconSelector";
import { buildChatContext, buildToolContext } from "@/lib/ai/chat-context";
import type { ClientAction } from "@/lib/ai/chat-tools";
import { TOOL_CATEGORIES, getToolsByCategory } from "@/lib/ai/tool-registry";
import { createReminder, startReminderPolling } from "@/lib/reminder";
import { getItem as dbGet, setItem as dbSet, listItems } from "@/lib/storage/db";
import { scheduleAutoSync } from "@/lib/sync";
import { confirmDialog } from "@/lib/confirm-dialog";
import { toast } from "@/lib/toast";
import { createSession } from "@/lib/timer/pomodoro";
import { Button, Input, Textarea } from "@/components/ui";
import {
  recordAICall,
  trackAIFeedback,
  startTimer,
  makeInputDigest,
  makeOutputDigest,
  generateCallId,
  parseUsageFromFinishMessage,
} from "@/lib/ai/quality-tracker";
// 注：聊天场景不使用全局 AITaskModal（流式输出本身就是反馈），
// 只用本地 AbortController 控制中止。

// 内置提示词库
const BUILTIN_PROMPTS = [
  "详细解释这个概念",
  "给出代码示例",
  "对比优缺点",
  "面试中怎么回答",
  "常见误区有哪些",
];

export interface ChatClientProps {
  /** 预填充文本（追问场景：自动塞入输入框，用户编辑后发送）。每次变化触发新一轮 prefill。 */
  prefill?: string;
  /** 预填充来源（题目/知识点），写入 Conversation.source 用于归因 */
  source?: ChatSource;
  /**
   * prefill 序号（来自 chat-modal-store 的 seq）。
   * 父组件每次 openChatModal 调用都递增 seq，ChatClient 通过比较 seq 知道"新一轮 prefill"。
   * 同一 seq 只消费一次，避免 StrictMode 双调用导致重复 setInput。
   */
  prefillSeq?: number;
  /** ChatClient 消费完 prefill 后通知父组件清空 store（避免关闭重开后重复消费） */
  onPrefillConsumed?: () => void;
}

export default function ChatClient({
  prefill,
  source,
  prefillSeq,
  onPrefillConsumed,
}: ChatClientProps = {}) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConv, setActiveConv] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [streamContent, setStreamContent] = useState("");
  const [modelConfigs, setModelConfigs] = useState<ModelConfig[]>([]);
  const [selectedModelId, setSelectedModelId] = useState("");
  const [showHistory, setShowHistory] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  // 用户消息编辑：仅最新一条 user 消息可编辑，编辑时渲染 textarea 替代气泡
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);
  // AI 调用记录 ID 映射：messageId → callId（用于反馈归因，仅当前会话有效）
  const aiCallIdMap = useRef<Map<string, string>>(new Map());
  // 初始加载守卫：避免在 modal 反复挂载/卸载或 StrictMode 双调用时重复自动选中最近对话
  const initialRestoreDone = useRef(false);
  // 预填充来源信息：当通过 props prefill 进入新对话时，暂存来源（题目/知识点），
  // 供 handleSend 创建对话时写入 Conversation.source
  const pendingSourceRef = useRef<ChatSource | null>(null);
  // 已消费的 prefillSeq（避免同一 seq 重复 setInput）
  const consumedSeqRef = useRef<number | undefined>(undefined);
  // 当前流式请求的 AbortController：streaming 时用于「中止」按钮
  // （聊天场景不使用全局 AITaskModal，流式输出本身即用户反馈）
  const abortControllerRef = useRef<AbortController | null>(null);

  // 刷新对话列表
  const refreshConversations = useCallback(async () => {
    const list = await listConversations();
    setConversations(list);
  }, []);

  // 刷新模型配置列表（从 profile 页返回时模型列表可能已变化）
  const refreshModelConfigs = useCallback(async () => {
    const configs = await listModelConfigs();
    setModelConfigs(configs);
    if (configs.length > 0) {
      // 如果当前选中的模型已不存在，回退到第一个（默认模型排第一）
      const stillExists = configs.find((c) => c.id === selectedModelId);
      if (!stillExists) {
        setSelectedModelId(configs[0].id);
      }
    }
  }, [selectedModelId]);

  // 加载某个对话的消息
  const loadConversation = useCallback(async (conv: Conversation) => {
    setActiveConv(conv);
    const msgs = await getMessages(conv.id);
    setMessages(msgs);
    // 清空当前会话的 AI 调用映射（历史消息不在当前会话生成，不展示反馈按钮）
    aiCallIdMap.current.clear();
  }, []);

  // 初始化
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        await cleanupOldConversations();
        const [convs, configs, defaultCfg] = await Promise.all([
          listConversations(),
          listModelConfigs(),
          getDefaultModelConfig(),
        ]);
        if (cancelled) return;
        setConversations(convs);
        setModelConfigs(configs);
        setSelectedModelId(defaultCfg?.id ?? "");

        // prefill 通过 props 注入（chat-modal-store），不再走 URL searchParams
        if (prefill) {
          // prefill 存在 → 开启新对话，不恢复最近一条对话（追问场景）
          initialRestoreDone.current = true;
          if (source) {
            pendingSourceRef.current = source;
          }
          setActiveConv(null);
          setMessages([]);
          setInput(prefill);
          // 标记 seq 已消费
          consumedSeqRef.current = prefillSeq;
          // 通知父组件清空 store 中的 prefill/source（避免重复消费）
          onPrefillConsumed?.();
        } else if (!initialRestoreDone.current) {
          // 无 prefill（用户直接点浮动按钮打开）：默认恢复最近一条对话
          initialRestoreDone.current = true;
          if (convs.length > 0) {
            const latest = convs[0]; // listConversations 已按 pinned + lastMessageAt desc 排序
            await loadConversation(latest);
            if (latest.modelConfigId) setSelectedModelId(latest.modelConfigId);
          }
          // 列表为空则保持空状态（messages 区会展示快捷指引）
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 监听 prefillSeq 变化（弹窗已打开时，用户从外部再次"追问"触发 openChatModal）
  // 同一 seq 只消费一次，避免 StrictMode 双调用导致重复 setInput
  useEffect(() => {
    if (prefillSeq === undefined) return;
    if (consumedSeqRef.current === prefillSeq) return;
    if (!prefill) return;
    consumedSeqRef.current = prefillSeq;
    // 新一轮 prefill：开新对话 + 填入输入框
    initialRestoreDone.current = true;
    if (source) pendingSourceRef.current = source;
    setActiveConv(null);
    setMessages([]);
    setInput(prefill);
    onPrefillConsumed?.();
    inputRef.current?.focus();
  }, [prefillSeq, prefill, source, onPrefillConsumed]);

  // 实时搜索历史
  const filteredConversations = (() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return conversations;
    return conversations.filter((c) => c.title.toLowerCase().includes(q));
  })();

  // 最新一条 user 消息 id（用于"编辑"与"刷新"按钮的展示判定）
  const lastUserMessageId = (() => {
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].role === "user") return messages[i].id;
    }
    return null;
  })();

  // 页面重新可见时刷新模型配置（从 profile 页添加模型后返回）
  useEffect(() => {
    const handler = () => {
      if (document.visibilityState === "visible") {
        refreshModelConfigs();
      }
    };
    document.addEventListener("visibilitychange", handler);
    return () => document.removeEventListener("visibilitychange", handler);
  }, [refreshModelConfigs]);

  // 启动提醒轮询（浏览器通知）
  useEffect(() => {
    startReminderPolling();
  }, []);

  // 执行工具返回的客户端动作（写入 IndexedDB）+ 结果回传到质量追踪
  // 增强项（Issue 3 修复）：
  //   - 幂等性：基于 action.idempotencyKey 去重（24h TTL），防止流式响应重试导致重复写入
  //   - 事务性：adjust_plan 用不可变克隆 + 单次原子写入，避免中途失败留下半成品状态
  //   - 错误反馈：失败时回传 trackAIFeedback action="discarded" + 设置 error state 给用户可见反馈
  const executeClientAction = useCallback(async (action: ClientAction, callRecordId?: string): Promise<{ ok: boolean; error?: string }> => {
    const startTime = Date.now();
    let success = false;
    let skipped = false;
    let errorMsg: string | undefined;

    // 幂等检查：已执行过的 action 跳过
    if (action.idempotencyKey) {
      try {
        const idemKey = `idempotency:${action.idempotencyKey}`;
        const existing = await dbGet<{ timestamp: number }>(idemKey);
        const TTL_MS = 24 * 60 * 60 * 1000; // 24h
        if (existing && Date.now() - existing.timestamp < TTL_MS) {
          skipped = true;
          console.info("[chat] 跳过已执行的 clientAction:", action.type);
        } else {
          // 占位标记（执行成功后更新时间戳；失败时不写入，允许重试）
          // 注意：这里先不写，等执行成功后再写
        }
      } catch (e) {
        console.warn("[chat] 幂等检查失败，继续执行:", e);
      }
    }

    if (!skipped) {
      try {
        switch (action.type) {
          case "create_reminder": {
            const params = action.params as {
              title: string;
              scheduledFor: string;
              body?: string;
            };
            await createReminder(params.title, params.scheduledFor, {
              body: params.body,
            });
            success = true;
            break;
          }
          case "toggle_plan_freeze": {
            const params = action.params as { planId: string; freeze: boolean };
            const plan = await dbGet<LearningPlan>(KEY_PREFIXES.PLAN + params.planId);
            if (plan) {
              await dbSet(KEY_PREFIXES.PLAN + params.planId, {
                ...plan,
                frozen: params.freeze,
                updatedAt: new Date().toISOString(),
              });
              scheduleAutoSync();
              success = true;
            } else {
              errorMsg = `计划 ${params.planId} 不存在`;
            }
            break;
          }
          case "set_plan_priority": {
            const params = action.params as { planId: string; priority: number };
            const plan = await dbGet<LearningPlan>(KEY_PREFIXES.PLAN + params.planId);
            if (plan) {
              await dbSet(KEY_PREFIXES.PLAN + params.planId, {
                ...plan,
                priority: params.priority,
                updatedAt: new Date().toISOString(),
              });
              scheduleAutoSync();
              success = true;
            } else {
              errorMsg = `计划 ${params.planId} 不存在`;
            }
            break;
          }
          case "adjust_plan": {
            const params = action.params as {
              planId: string;
              action: "delay" | "skip" | "redistribute";
              targetDay?: number;
            };
            const plan = await dbGet<LearningPlan>(KEY_PREFIXES.PLAN + params.planId);
            if (!plan) {
              errorMsg = `计划 ${params.planId} 不存在`;
              break;
            }
            if (params.targetDay === undefined) {
              errorMsg = "adjust_plan 缺少 targetDay";
              break;
            }
            // 关键改动：克隆 schedule 数组，避免修改原 plan 对象
            // 这样即使中途异常，原 plan 状态不被破坏，IndexedDB 中的数据保持一致
            const newSchedule = plan.schedule.map((s) => ({ ...s }));
            const dayTasks = newSchedule.filter((s) => s.day === params.targetDay);
            if (params.action === "skip") {
              // 跳过：标记为已完成（跳过）
              for (const task of dayTasks) {
                task.completed = true;
                task.completedAt = new Date().toISOString();
              }
            } else if (params.action === "delay") {
              // 延后：将该天所有任务的 day +1，后续任务也顺延
              for (const task of newSchedule) {
                if (task.day >= params.targetDay!) {
                  task.day += 1;
                }
              }
            } else if (params.action === "redistribute") {
              // 重新分配：将该天任务分散到未来 3 天
              const futureDays = [params.targetDay! + 1, params.targetDay! + 2, params.targetDay! + 3];
              dayTasks.forEach((task, i) => {
                task.day = futureDays[i % futureDays.length];
              });
            }
            // 原子写入：一次性更新整个 plan
            await dbSet(KEY_PREFIXES.PLAN + params.planId, {
              ...plan,
              schedule: newSchedule,
              updatedAt: new Date().toISOString(),
            });
            scheduleAutoSync();
            success = true;
            break;
          }
          case "start_focus_session": {
            const params = action.params as {
              task_description: string;
              duration_minutes: number;
              plan_id?: string;
              node_id?: string;
            };
            // 通过 createSession 写入 status=running 的 PomodoroSession，
            // key 前缀为 KEY_PREFIXES.POMODORO_SESSION，getRunningSession() 可直接扫描到。
            // createSession 内部会派发 POMODORO_SESSION_CHANGED_EVENT 事件，
            // 全局挂载的 PomodoroWidget 监听该事件后立即显示浮动倒计时（z-index 高于 ChatModal）。
            // 不再使用 window.location.href 硬跳转 —— 那会销毁聊天模态、中断流式响应，
            // 与"AI 唤起番茄钟"的体验相悖。
            await createSession({
              taskDescription: params.task_description,
              type: "focus",
              durationMinutes: params.duration_minutes,
              planId: params.plan_id,
              nodeId: params.node_id,
            });
            toast.success(
              `番茄钟已启动：${params.task_description}（${params.duration_minutes} 分钟）`,
            );
            success = true;
            break;
          }
          case "generate_plan": {
            const params = action.params as {
              goal: string;
              duration_weeks: number;
              constraints: {
                hours_per_week: number;
                preferred_times?: string[];
              };
            };
            // 构造一个学习计划并跳转到创建页预填
            const planData = {
              topic: params.goal,
              dailyMinutes: Math.max(
                15,
                Math.floor(
                  (params.constraints.hours_per_week * 60) /
                    (params.duration_weeks * 7),
                ),
              ),
              maxNewPerDay: 2,
              prompt: `基于用户画像生成：目标 ${params.goal}，${params.duration_weeks} 周，每周 ${params.constraints.hours_per_week} 小时`,
            };
            sessionStorage.setItem(
              "learn:pending_plan",
              JSON.stringify(planData),
            );
            window.location.href = "/learn/new";
            success = true;
            break;
          }
          case "reorder_schedule": {
            const params = action.params as {
              date: string;
              mode?: "balanced" | "catch_up" | "light";
            };
            // 遍历所有未冻结计划，按 mode 调整今日任务优先级
            const allPlans = await listItems<LearningPlan>(
              KEY_PREFIXES.PLAN,
            );
            const modePriority: Record<string, number> = {
              catch_up: 5,
              balanced: 3,
              light: 1,
            };
            const maxNew = modePriority[params.mode ?? "balanced"] ?? 3;
            for (const plan of allPlans) {
              if (plan.frozen) continue;
              plan.maxNewPerDay = maxNew;
              plan.updatedAt = new Date().toISOString();
              await dbSet(KEY_PREFIXES.PLAN + plan.id, plan);
            }
            scheduleAutoSync();
            success = true;
            break;
          }
        }

        // 执行成功后写入幂等标记（防止后续重复执行）
        if (success && action.idempotencyKey) {
          try {
            await dbSet(`idempotency:${action.idempotencyKey}`, {
              timestamp: Date.now(),
            });
          } catch {
            // 标记失败不影响主流程
          }
        }
      } catch (e) {
        errorMsg = e instanceof Error ? e.message : String(e);
        console.warn("[chat] 执行客户端动作失败:", e);
      }
    }

    // 结果回传：记录工具动作执行结果（成功/失败/跳过 + 耗时 + 动作类型）
    if (callRecordId) {
      void trackAIFeedback({
        callRecordId,
        scene: "chat_tool_action",
        action: skipped ? "viewed" : success ? "adopted" : "discarded",
        reason: `${action.type} (${Date.now() - startTime}ms)${skipped ? " [skipped-duplicate]" : errorMsg ? ` [error: ${errorMsg}]` : ""}`,
      }).catch(() => {});
    }

    return { ok: success || skipped, error: success || skipped ? undefined : errorMsg };
  }, []);

  // 自动滚动到底部
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamContent]);

  // 切换对话
  const switchConversation = useCallback(
    async (conv: Conversation) => {
      setShowHistory(false);
      await loadConversation(conv);
      if (conv.modelConfigId) setSelectedModelId(conv.modelConfigId);
      // 路由模式已移除：不再用 router.replace 同步 URL（弹窗模式下用户看不到 URL）
    },
    [loadConversation]
  );

  // 新建对话
  const handleNewConversation = useCallback(() => {
    setActiveConv(null);
    setMessages([]);
    setInput("");
    setShowHistory(false);
    setError(null);
    inputRef.current?.focus();
  }, []);

  // 删除对话
  const handleDelete = useCallback(
    async (id: string) => {
      await deleteConversation(id);
      if (activeConv?.id === id) {
        handleNewConversation();
      }
      await refreshConversations();
    },
    [activeConv, handleNewConversation, refreshConversations]
  );

  // 切换收藏
  const handleTogglePin = useCallback(
    async (id: string) => {
      await togglePin(id);
      await refreshConversations();
      if (activeConv?.id === id) {
        const updated = await getConversation(id);
        if (updated) setActiveConv(updated);
      }
    },
    [activeConv, refreshConversations]
  );

  // 应用提示词
  const applyPrompt = useCallback((prompt: string) => {
    setInput((prev) => {
      if (!prev.trim()) return prompt;
      return `${prev}\n${prompt}`;
    });
    inputRef.current?.focus();
  }, []);

  // 快捷指令：直接填入输入框（覆盖），不自动发送
  const handleShortcutSelect = useCallback((prompt: string) => {
    setInput(prompt);
    inputRef.current?.focus();
  }, []);

  // 共享：调用 /api/chat 流式获取 AI 回复，返回完整内容 + 执行 clientAction
  // convId/msgs/history 由调用方决定（普通发送 vs 重新生成）
  const streamAIResponse = useCallback(
    async (params: {
      convId: string;
      history: Array<{ role: "user" | "assistant" | "system"; content: string }>;
      label: string;
    }): Promise<{ content: string; callId: string } | { error: string } | { aborted: true }> => {
      // 准备模型配置
      let modelConfig = modelConfigs.find((m) => m.id === selectedModelId);
      if (!modelConfig && modelConfigs.length > 0) {
        modelConfig = modelConfigs[0];
        setSelectedModelId(modelConfig.id);
      }
      if (!modelConfig) {
        const freshConfigs = await listModelConfigs();
        if (freshConfigs.length > 0) {
          setModelConfigs(freshConfigs);
          modelConfig = freshConfigs[0];
          setSelectedModelId(modelConfig.id);
        }
      }
      if (!modelConfig || !modelConfig.apiKey) {
        return {
          error:
            '未配置 AI 模型。请前往「我的 → AI 模型配置」添加模型（需填写 API Key），或点击下方"去添加"链接。',
        };
      }

      // 上下文快照 + 工具上下文（失败时静默降级）
      let contextSnapshot = "";
      try {
        contextSnapshot = await buildChatContext();
      } catch {
        contextSnapshot = "";
      }
      let toolContext = undefined;
      try {
        toolContext = await buildToolContext();
      } catch {
        toolContext = undefined;
      }

      const callId = generateCallId();
      const stopTimer = startTimer();

      // session 鉴权由 aiFetch 自动处理（签名头注入）
      // body 不含 modelConfig / userId（服务端从 session 取）
      // 聊天场景不使用全局 AITaskModal——流式输出本身就是反馈，
      // 中止由本地 AbortController + 发送按钮变「中止」控制
      const controller = new AbortController();
      abortControllerRef.current = controller;
      let res: Response;
      try {
        res = await aiFetch(
          "/api/chat",
          {
            method: "POST",
            body: JSON.stringify({
              messages: params.history,
              contextSnapshot,
              toolContext,
            }),
            signal: controller.signal,
          },
          0, // 流式响应不设超时（由用户中止按钮控制）
        );
      } catch (err) {
        // 用户主动中止：静默，不抛错（流式内容已部分展示）
        if (controller.signal.aborted) {
          return { aborted: true };
        }
        throw err;
      }

      if (!res.ok) {
        const errText = await res.text().catch(() => "");
        const msg = `请求失败 (${res.status})${errText ? `: ${errText}` : ""}`;
        return { error: msg };
      }
      if (!res.body) {
        const msg = "响应没有流式内容";
        return { error: msg };
      }

      // 从响应头读取模型 ID（用于成本估算）
      const responseModelId = res.headers.get("X-AI-Model-Id") ?? undefined;

      setStreaming(true);
      setStreamContent("");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let acc = "";
      const pendingActions: ClientAction[] = [];
      // 从 data stream protocol 的 "d:" finish 消息中提取的 token usage
      let tokenUsage: import("@/lib/types").TokenUsage | undefined;

      const parseDataLine = (line: string): string => {
        const idx = line.indexOf(":");
        if (idx <= 0) return "";
        const type = line.slice(0, idx);
        const payload = line.slice(idx + 1);
        if (type === "0") {
          try {
            const parsed = JSON.parse(payload);
            if (typeof parsed === "string") return parsed;
          } catch {
            return "";
          }
        }
        if (type === "6") {
          try {
            const parsed = JSON.parse(payload) as {
              result?: { clientAction?: ClientAction };
            };
            if (parsed.result?.clientAction) {
              pendingActions.push(parsed.result.clientAction);
            }
          } catch {
            /* ignore */
          }
        }
        // data stream protocol v3+: "d:" 是 finish 消息，包含 usage 信息
        if (type === "d") {
          const usage = parseUsageFromFinishMessage(payload);
          if (usage) tokenUsage = usage;
        }
        return "";
      };

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          let nlIdx: number;
          while ((nlIdx = buffer.indexOf("\n")) !== -1) {
            const rawLine = buffer.slice(0, nlIdx);
            buffer = buffer.slice(nlIdx + 1);
            const line = rawLine.trim();
            if (!line) continue;
            if (line.startsWith("data:")) {
              const data = line.slice(5).trim();
              if (data === "[DONE]") continue;
              const chunk = parseDataLine(data);
              if (chunk) {
                acc += chunk;
                setStreamContent(acc);
              }
            } else if (!line.startsWith(":")) {
              const chunk = parseDataLine(line);
              if (chunk) {
                acc += chunk;
                setStreamContent(acc);
              }
            }
          }
        }
      } catch (err) {
        // 用户主动中止：保留已收到的流式内容作为最终回复
        if (controller.signal.aborted) {
          // 落到下面的 finalContent 逻辑，把已收到的部分存为消息
        } else {
          throw err;
        }
      }

      const finalContent = acc || "(无响应内容)";
      const aiMsg = await addMessage({
        conversationId: params.convId,
        role: "assistant",
        content: finalContent,
      });
      setMessages((prev) => [...prev, aiMsg]);
      setStreamContent("");
      setStreaming(false);

      // 执行工具返回的客户端动作（传入 callId 用于结果回传）
      // 失败时收集错误信息展示给用户（不再静默吞掉）+ 成功/失败 toast 反馈
      if (pendingActions.length > 0) {
        const failedMessages: string[] = [];
        for (const action of pendingActions) {
          try {
            const result = await executeClientAction(action, callId);
            if (result.ok) {
              // 按动作类型显示成功 toast
              switch (action.type) {
                case "start_focus_session":
                  toast.success("番茄钟已启动");
                  break;
                case "create_reminder":
                  toast.success("提醒已设置");
                  break;
                case "adjust_plan":
                  toast.success("计划已调整");
                  break;
                case "toggle_plan_freeze": {
                  const freeze = (action.params as { freeze?: boolean }).freeze;
                  toast.success(freeze ? "计划已冻结" : "计划已解冻");
                  break;
                }
                case "set_plan_priority":
                  toast.success("优先级已调整");
                  break;
                case "reorder_schedule":
                  toast.success("日程已优化");
                  break;
                case "generate_plan":
                  toast.success("学习计划已生成，正在跳转...");
                  break;
              }
            } else {
              const msg = result.error ?? "未知错误";
              failedMessages.push(msg);
              toast.error("工具执行失败：" + msg);
            }
          } catch (err) {
            const msg = err instanceof Error ? err.message : String(err);
            failedMessages.push(msg);
            toast.error("工具执行失败：" + msg);
          }
        }
        if (failedMessages.length > 0) {
          // 不覆盖已有错误，追加工具执行失败提示
          const toolError = `工具执行失败：${failedMessages.join("; ")}`;
          setError((prev) => (prev ? `${prev} | ${toolError}` : toolError));
        }
      }

      // AI 质量追踪（含 token 使用量 + 成本估算）
      const durationMs = stopTimer();
      aiCallIdMap.current.set(aiMsg.id, callId);
      void recordAICall({
        callId,
        scene: "chat",
        promptId: "chat",
        inputDigest: makeInputDigest({
          conversationId: params.convId,
          userMessage: params.label,
        }),
        outputDigest: makeOutputDigest(finalContent),
        schemaValid: true,
        durationMs,
        source: "ai",
        refId: params.convId,
        tokenUsage,
        modelId: responseModelId,
      }).catch(() => {});

      abortControllerRef.current = null;
      return { content: finalContent, callId };
    },
    [modelConfigs, selectedModelId, executeClientAction],
  );

  // 中止当前流式生成（用户点「中止」按钮时调用）
  const handleAbort = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      // setStreaming(false) 会在 streamAIResponse 的 finally 路径里触发；
      // 但中止时 streamAIResponse 可能在 await reader.read() 阻塞，
      // 这里立即更新 UI 状态，避免按钮卡住
      setStreaming(false);
      setStreamContent("");
      toast.info("已中止生成");
    }
  }, []);

  // 发送消息
  const handleSend = useCallback(async () => {
    const text = input.trim();
    if (!text || streaming) return;

    setError(null);
    let conv = activeConv;
    try {
      // 没有活动对话则先创建
      if (!conv) {
        // 消费暂存的来源信息（追问场景通过 prefill 进入时写入）
        const source = pendingSourceRef.current ?? undefined;
        conv = await createConversation({
          title: text.slice(0, 30),
          modelConfigId: selectedModelId || undefined,
          source,
        });
        pendingSourceRef.current = null;
        setActiveConv(conv);
        // 路由模式已移除：不再用 router.replace 同步 conversationId
      }

      // 保存用户消息
      const userMsg = await addMessage({
        conversationId: conv.id,
        role: "user",
        content: text,
      });
      const newMessages = [...messages, userMsg];
      setMessages(newMessages);
      setInput("");

      const history = newMessages.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const result = await streamAIResponse({
        convId: conv.id,
        history,
        label: text,
      });
      if ("error" in result) {
        setError(result.error);
      } else if ("aborted" in result) {
        // 用户中止：不报错，已收到部分作为回复保存
        await refreshConversations();
      } else {
        await refreshConversations();
      }
    } catch (e) {
      setStreaming(false);
      setStreamContent("");
      const msg = e instanceof Error ? e.message : String(e);
      setError(msg);
    }
  }, [
    input,
    streaming,
    activeConv,
    messages,
    selectedModelId,
    refreshConversations,
    streamAIResponse,
  ]);

  // 重新生成：以 user 消息为锚点，删除其后的 AI 回复及后续消息，用该 user 消息重新请求 AI
  // 入参由原先的 assistantMessageId 改为 userMessageId（刷新按钮挂在 user 消息下）
  const handleRegenerateAnswer = useCallback(
    async (userMessageId: string) => {
      if (streaming) return;
      setError(null);
      try {
        // 1. 定位该 user 消息
        const userIdx = messages.findIndex((m) => m.id === userMessageId);
        if (userIdx === -1) return;
        const userMsg = messages[userIdx];
        if (userMsg.role !== "user") return;
        const convId = userMsg.conversationId;
        if (!convId) return;

        // 2. 找到其后的下一条 assistant 消息（要被删除的 AI 回复起点）
        let assistantIdx = userIdx + 1;
        while (
          assistantIdx < messages.length &&
          messages[assistantIdx].role !== "assistant"
        ) {
          assistantIdx++;
        }

        // 3. 删除该 assistant 消息及其后的所有消息（保留 user 消息及更早的消息）
        if (assistantIdx < messages.length) {
          await deleteMessagesFrom(messages[assistantIdx].id);
        }
        // 本地 state：保留 user 消息（含）及之前的消息
        const remaining = messages.slice(0, userIdx + 1);
        setMessages(remaining);

        // 4. 用截断后的历史重新请求 AI（user 消息已在 history 末尾）
        const history = remaining.map((m) => ({
          role: m.role,
          content: m.content,
        }));
        const result = await streamAIResponse({
          convId,
          history,
          label: userMsg.content,
        });
        if ("error" in result) {
          setError(result.error);
        } else if ("aborted" in result) {
          await refreshConversations();
        } else {
          await refreshConversations();
        }
      } catch (e) {
        setStreaming(false);
        setStreamContent("");
        const msg = e instanceof Error ? e.message : String(e);
        setError(msg);
      }
    },
    [messages, streaming, streamAIResponse, refreshConversations],
  );

  // 删除单条消息（多轮对话中删除某次对话）
  const handleDeleteMessage = useCallback(
    async (messageId: string) => {
      // 本地先乐观删除，避免界面闪烁
      const prevMessages = messages;
      setMessages((prev) => prev.filter((m) => m.id !== messageId));
      try {
        await deleteMessage(messageId);
        // 如果删的是 AI 消息，相关的 callId 也清掉
        aiCallIdMap.current.delete(messageId);
        await refreshConversations();
      } catch (e) {
        // 回滚
        setMessages(prevMessages);
        setError(e instanceof Error ? e.message : "删除失败");
      }
    },
    [messages, refreshConversations],
  );

  // 显式反馈：用户对某条 AI 回复点 👎
  const handleThumbsDown = useCallback((messageId: string) => {
    const callId = aiCallIdMap.current.get(messageId);
    if (!callId) return;
    void trackAIFeedback({
      callRecordId: callId,
      scene: "chat",
      rating: 1,
    }).catch(() => {});
  }, []);

  // 保存编辑后的用户消息：删除该消息及之后所有消息 → 重新写入编辑后的 user 消息 → 重新请求 AI
  const handleSaveEdit = useCallback(
    async (messageId: string) => {
      const text = editContent.trim();
      if (!text || streaming) return;
      const idx = messages.findIndex((m) => m.id === messageId);
      if (idx === -1) return;
      const targetMsg = messages[idx];
      if (targetMsg.role !== "user") return;
      const convId = targetMsg.conversationId;
      if (!convId) return;

      setError(null);
      setEditingMessageId(null);
      setEditContent("");

      try {
        // 1. 删除该 user 消息及其后所有消息（含对应的 AI 回复）
        await deleteMessagesFrom(messageId);
        // 2. 写入编辑后的新 user 消息
        const newUserMsg = await addMessage({
          conversationId: convId,
          role: "user",
          content: text,
        });
        // 3. 本地 state：保留 idx 之前的消息 + 新 user 消息
        const remaining = messages.slice(0, idx);
        const newMessages = [...remaining, newUserMsg];
        setMessages(newMessages);
        // 4. 用截断后的历史重新请求 AI
        const history = newMessages.map((m) => ({
          role: m.role,
          content: m.content,
        }));
        const result = await streamAIResponse({
          convId,
          history,
          label: text,
        });
        if ("error" in result) {
          setError(result.error);
        } else if ("aborted" in result) {
          await refreshConversations();
        } else {
          await refreshConversations();
        }
      } catch (e) {
        setStreaming(false);
        setStreamContent("");
        const msg = e instanceof Error ? e.message : String(e);
        setError(msg);
      }
    },
    [editContent, streaming, messages, streamAIResponse, refreshConversations],
  );

  // 键盘快捷键：Enter 发送，Shift+Enter 换行
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend]
  );

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-gray-400 dark:text-gray-500">加载中...</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* 顶部精简工具条：新建对话 + 标题 + 收藏/删除
          （ChatModal 已提供标题栏与关闭按钮，这里只保留对话级操作） */}
      <header className="shrink-0 bg-white dark:bg-gray-800 border-b dark:border-gray-700 px-3 py-2 flex items-center gap-1 z-20">
        <Button
          variant="ghost"
          size="md"
          iconOnly
          onClick={() => setShowHistory(true)}
          aria-label="历史对话"
          className="rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-500 dark:text-gray-300"
          title="历史对话"
        >
          <Icon name="clock" className="w-5 h-5" />
        </Button>
        <Button
          variant="ghost"
          size="md"
          iconOnly
          onClick={handleNewConversation}
          aria-label="新建对话"
          className="rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-blue-500"
          title="新建对话"
        >
          <Icon name="plus" className="w-5 h-5" />
        </Button>
        <h1 className="flex-1 truncate font-medium text-sm px-1">
          {activeConv?.title ?? "新对话"}
        </h1>
        <Button
          variant="ghost"
          size="md"
          iconOnly
          onClick={() => activeConv && handleTogglePin(activeConv.id)}
          aria-label="收藏对话"
          className={`rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
            activeConv?.pinned ? "text-blue-500" : "text-gray-400"
          }`}
          disabled={!activeConv}
        >
          <Icon name="pin" className="w-5 h-5" />
        </Button>
        <Button
          variant="ghost"
          size="md"
          iconOnly
          onClick={() => activeConv && handleDelete(activeConv.id)}
          aria-label="删除对话"
          className="rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-400"
          disabled={!activeConv}
        >
          <Icon name="trash" className="w-5 h-5" />
        </Button>
      </header>

      {/* 来源横幅 */}
      {activeConv?.source && (
        <div className="shrink-0 bg-amber-50 border-b px-3 py-2 text-xs flex items-center gap-2">
          <span className="inline-flex items-center gap-1"><Icon name="paperclip" className="w-3.5 h-3.5 inline-block" />来自：</span>
          {activeConv.source.planId ? (
            <Link
              href={`/learn/${activeConv.source.planId}`}
              className="text-blue-600 hover:underline truncate"
            >
              {activeConv.source.title} →
            </Link>
          ) : (
            <span className="truncate">{activeConv.source.title}</span>
          )}
        </div>
      )}

      {/* 错误提示 */}
      {error && (
        <div className="shrink-0 bg-red-50 border-b border-red-200 px-3 py-2 text-xs text-red-600 flex items-center justify-between gap-2">
          <span className="truncate"><Icon name="alert" className="w-3.5 h-3.5 inline-block align-middle" /> {error}</span>
          <Button
            variant="ghost"
            size="sm"
            iconOnly
            onClick={() => setError(null)}
            className="text-red-400 hover:text-red-600 shrink-0"
            aria-label="关闭错误"
          >
            <Icon name="x" className="w-4 h-4" />
          </Button>
        </div>
      )}

      {/* 消息区（仅此区域滚动） */}
      <main className="flex-1 min-h-0 overflow-y-auto overscroll-contain p-4 space-y-3">
        {messages.length === 0 && !streaming && (
          <div className="h-full flex flex-col items-center justify-center text-center text-gray-400 py-10">
            <div className="w-16 h-16 rounded-2xl bg-blue-50 dark:bg-blue-950/40 flex items-center justify-center mb-4">
              <Icon name="chat" className="w-8 h-8 text-blue-400" />
            </div>
            <p className="mb-1 text-gray-600 dark:text-gray-300 font-medium">
              开始一段新对话
            </p>
            <p className="mb-6 text-sm">向 AI 提问，获取即时解答</p>
            <div className="flex flex-wrap gap-2 justify-center max-w-md mb-4">
              {BUILTIN_PROMPTS.map((p) => (
                <Button
                  key={p}
                  variant="ghost"
                  size="sm"
                  onClick={() => applyPrompt(p)}
                  className="px-3 py-1.5 text-xs bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
                >
                  {p}
                </Button>
              ))}
            </div>
            <div className="w-full max-w-lg space-y-3">
              <p className="text-xs text-gray-400 font-medium">AI 工具能力</p>
              {TOOL_CATEGORIES.map((cat) => {
                const tools = getToolsByCategory(cat.id);
                if (tools.length === 0) return null;
                return (
                  <div key={cat.id} className="text-left">
                    <p className="mb-1 text-xs text-gray-500 flex items-center gap-1">
                      <Icon name={cat.icon} className="w-3.5 h-3.5 inline-block" />
                      {cat.label}
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {tools.map((t) => (
                        <Button
                          key={t.name}
                          variant="ghost"
                          size="sm"
                          onClick={() => applyPrompt(t.quickPrompts[0])}
                          className="px-2.5 py-1 text-xs bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 text-blue-600 dark:text-blue-300 rounded-lg transition-colors flex items-center gap-1"
                          title={t.description}
                        >
                          <Icon name={t.icon} className="w-3 h-3 inline-block" />
                          {t.quickPrompts[0].length > 12
                            ? t.quickPrompts[0].slice(0, 12) + "…"
                            : t.quickPrompts[0]}
                        </Button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {messages.map((m) =>
          m.role === "user" ? (
            <div
              key={m.id}
              className="ml-auto max-w-[80%] group relative flex flex-col items-end"
            >
              {m.id === editingMessageId ? (
                /* 编辑模式：textarea + 保存/取消 */
                <div className="w-full bg-blue-50 dark:bg-blue-900/30 rounded-2xl rounded-br-sm p-2 border border-blue-200 dark:border-blue-800">
                  <Textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    rows={3}
                    autoFocus
                    inputSize="sm"
                    className="border-0 bg-transparent focus:ring-0"
                  />
                  <div className="flex justify-end gap-2 mt-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setEditingMessageId(null);
                        setEditContent("");
                      }}
                    >
                      取消
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleSaveEdit(m.id)}
                      disabled={!editContent.trim() || streaming}
                    >
                      保存
                    </Button>
                  </div>
                </div>
              ) : (
                /* 正常气泡 */
                <div className="bg-blue-500 text-white rounded-2xl rounded-br-sm px-3 py-2 text-sm whitespace-pre-wrap break-words">
                  {m.content}
                </div>
              )}

              {/* 操作按钮（hover 显示；编辑模式下隐藏） */}
              {m.id !== editingMessageId && (
                <>
                  {/* 删除单条消息按钮 */}
                  <Button
                    variant="ghost"
                    size="sm"
                    iconOnly
                    onClick={async () => {
                      const ok = await confirmDialog({
                        title: "删除这条消息？",
                        message: "确定删除这条消息吗？此操作不可恢复。",
                        confirmText: "删除",
                        cancelText: "取消",
                        danger: true,
                      });
                      if (ok) handleDeleteMessage(m.id);
                    }}
                    className="absolute -left-7 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                    aria-label="删除消息"
                    title="删除消息"
                  >
                    <Icon name="trash" className="w-3.5 h-3.5" />
                  </Button>
                  {/* 编辑按钮：仅最新一条 user 消息 + 非流式输出时显示 */}
                  {!streaming && m.id === lastUserMessageId && (
                    <Button
                      variant="ghost"
                      size="sm"
                      iconOnly
                      onClick={() => {
                        setEditingMessageId(m.id);
                        setEditContent(m.content);
                      }}
                      className="absolute -left-14 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity"
                      aria-label="编辑消息"
                      title="编辑消息"
                    >
                      <Icon name="pen" className="w-3.5 h-3.5" />
                    </Button>
                  )}
                </>
              )}

              {/* 刷新按钮：仅最新一条 user 消息下方显示（重新生成对应 AI 回复） */}
              {!streaming && m.id === lastUserMessageId && m.id !== editingMessageId && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRegenerateAnswer(m.id)}
                  className="mt-1 inline-flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  aria-label="刷新回答"
                  title="重新生成 AI 回答"
                >
                  <Icon name="refresh-cw" className="w-3 h-3" />
                  刷新
                </Button>
              )}
            </div>
          ) : (
            <div
              key={m.id}
              className="mr-auto max-w-[80%] bg-gray-100 dark:bg-gray-700 rounded-2xl rounded-bl-sm px-3 py-2 text-sm group"
            >
              <AnswerContent text={m.content} />
              {/* 操作工具栏：删除 / 反馈（hover 显示）
                  注：重新生成入口已迁移到"最新 user 消息下方的刷新按钮"，此处不再重复 */}
              <div className="mt-1 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  variant="ghost"
                  size="sm"
                  iconOnly
                  onClick={async () => {
                    const ok = await confirmDialog({
                      title: "删除这条回复？",
                      message: "确定删除这条回复吗？此操作不可恢复。",
                      confirmText: "删除",
                      cancelText: "取消",
                      danger: true,
                    });
                    if (ok) handleDeleteMessage(m.id);
                  }}
                  className="text-2xs text-gray-400 hover:text-red-500"
                  aria-label="删除回复"
                  title="删除回复"
                >
                  <Icon name="trash" className="w-3.5 h-3.5" />
                </Button>
                {/* 显式反馈：👎 仅在当前会话生成的消息上展示（历史消息无 callId，不展示） */}
                {aiCallIdMap.current.has(m.id) && (
                  <Button
                    variant="ghost"
                    size="sm"
                    iconOnly
                    onClick={() => handleThumbsDown(m.id)}
                    className="text-2xs text-gray-400 hover:text-red-500"
                    aria-label="这条回复没帮助"
                    title="这条回复没帮助"
                  >
                    <Icon name="thumbs-down" className="w-3.5 h-3.5" />
                  </Button>
                )}
              </div>
            </div>
          )
        )}

        {/* 流式输出中的临时气泡 */}
        {streaming && (
          <div className="mr-auto max-w-[80%] bg-gray-100 dark:bg-gray-700 rounded-2xl rounded-bl-sm px-3 py-2 text-sm">
            {streamContent ? (
              <AnswerContent text={streamContent} />
            ) : (
              <span className="text-gray-400 inline-flex items-center gap-1">
                <span className="animate-pulse">●</span>
                <span className="animate-pulse" style={{ animationDelay: "0.2s" }}>●</span>
                <span className="animate-pulse" style={{ animationDelay: "0.4s" }}>●</span>
              </span>
            )}
          </div>
        )}

        <div ref={messagesEndRef} />
      </main>

      {/* 底部输入栏（两行布局：上=快捷指令+模型图标，下=输入框+发送） */}
      <footer className="shrink-0 bg-white dark:bg-gray-800 border-t dark:border-gray-700 p-3 space-y-2">
        {/* 第 1 行：快捷指令按钮 + 模型图标选择器（左对齐并排） */}
        <div className="flex items-center gap-2">
          <QuickShortcuts onSelect={handleShortcutSelect} />
          <ModelIconSelector
            selectedModelId={selectedModelId || null}
            onSelect={setSelectedModelId}
          />
        </div>
        {/* 第 2 行：输入框 + 发送/中止按钮（streaming 时切换为中止） */}
        <div className="flex items-end gap-2">
          <Textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="输入消息... (Enter 发送，Shift+Enter 换行)"
            rows={1}
            className="flex-1 max-h-32"
            disabled={streaming}
          />
          {streaming ? (
            <Button
              onClick={handleAbort}
              variant="danger"
              className="shrink-0 px-3 py-2.5"
              aria-label="中止生成"
              title="中止生成"
            >
              <Icon name="x-circle" className="w-5 h-5" />
            </Button>
          ) : (
            <Button
              onClick={handleSend}
              disabled={!input.trim()}
              className="shrink-0 px-3 py-2.5"
              aria-label="发送"
              title="发送"
            >
              <Icon name="send" className="w-5 h-5" />
            </Button>
          )}
        </div>
      </footer>

      {/* 历史对话抽屉：左侧滑入面板，点击遮罩或选中对话后关闭 */}
      {showHistory && (
        <div
          className="fixed inset-0 z-[70] flex"
          onClick={() => setShowHistory(false)}
        >
          <div className="absolute inset-0 bg-black/30" />
          <div
            className="relative w-80 max-w-[80vw] bg-white dark:bg-gray-800 h-full flex flex-col shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-3 border-b dark:border-gray-700">
              <h3 className="font-semibold">历史对话</h3>
              <Button
                variant="ghost"
                size="sm"
                iconOnly
                onClick={() => setShowHistory(false)}
                aria-label="关闭"
                className="rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <Icon name="x" className="w-5 h-5" />
              </Button>
            </div>
            {/* Search */}
            <div className="p-2 border-b dark:border-gray-700">
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="搜索对话..."
                inputSize="sm"
                leftIcon="search"
                className="w-full"
              />
            </div>
            {/* List */}
            <div className="flex-1 overflow-y-auto">
              {filteredConversations.length === 0 ? (
                <p className="text-center text-gray-400 text-sm py-8">暂无对话</p>
              ) : (
                filteredConversations.map((conv) => (
                  <div
                    key={conv.id}
                    className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-700 border-b dark:border-gray-700 cursor-pointer group"
                    onClick={() => {
                      switchConversation(conv);
                      setShowHistory(false);
                    }}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1">
                        {conv.pinned && (
                          <Icon name="pin" className="w-3 h-3 text-blue-500" />
                        )}
                        <p className="text-sm font-medium truncate">
                          {conv.title || "未命名对话"}
                        </p>
                      </div>
                      <p className="text-xs text-gray-400">
                        {new Date(conv.lastMessageAt).toLocaleString()}
                      </p>
                    </div>
                    <div
                      className="flex gap-1 opacity-0 group-hover:opacity-100"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Button
                        variant="ghost"
                        size="sm"
                        iconOnly
                        onClick={() => handleTogglePin(conv.id)}
                        aria-label="收藏"
                        className="rounded hover:bg-gray-200 dark:hover:bg-gray-600"
                      >
                        <Icon name="pin" className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        iconOnly
                        onClick={() => handleDelete(conv.id)}
                        aria-label="删除"
                        className="rounded hover:bg-gray-200 dark:hover:bg-gray-600"
                      >
                        <Icon name="trash" className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
