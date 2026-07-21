// __tests__/ai-tool-execution.test.ts
// AI 工具执行链端到端测试
//
// 验证 Vercel AI SDK Data Stream Protocol 的流解析逻辑：
//   - "6:" 前缀行携带 {toolCallId, toolName, result}，result.clientAction 是动作描述符
//   - "0:" 前缀行是文本 delta（JSON 编码的字符串）
//   - "d:" 前缀行是 finish 消息（含 usage）
//   - 畸形的 "6:" 行不应导致崩溃
//
// parseDataLine 是 ChatClient.tsx 中 streamAIResponse 内部的闭包（未导出），
// 因此此处复制其核心解析逻辑进行等价性验证，确保数据格式可被正确解析。
// 同时验证 createSession → getRunningSession 的集成（Task 1.2 修复的核心链路）。
//
// planId 闭环验证：
//   - 4 个只读工具（get_daily_schedule / get_next_task / get_upcoming_plan / review_today）
//     返回的数据中必须暴露 planId，让 AI 能据此调用写入工具（adjust_plan /
//     toggle_plan_freeze / set_plan_priority），闭环关键

import { describe, it, expect, beforeEach, vi } from "vitest";
import "fake-indexeddb/auto";
import { setItem, listItems, listKeys, delItem } from "../lib/storage/db";
import { KEY_PREFIXES, type PomodoroSession } from "../lib/types";
import type { ClientAction, ToolContext } from "../lib/ai/chat-tools";

// 屏蔽 pomodoro 模块中无意义的 console 输出
vi.spyOn(console, "info").mockImplementation(() => {});
vi.spyOn(console, "warn").mockImplementation(() => {});

import {
  createSession,
  getRunningSession,
} from "../lib/timer/pomodoro";
import { createChatTools } from "../lib/ai/chat-tools";

// ============ 复制 parseDataLine 核心逻辑（与 ChatClient.tsx 保持一致） ============
// 原函数是 streamAIResponse 内的闭包，无法直接导入测试。
// 此处提取等价逻辑，验证 Vercel AI SDK Data Stream Protocol 格式的可解析性。

interface ParseResult {
  /** 文本 chunk（"0:" 行提取的内容） */
  text: string;
  /** 从 "6:" 行提取的 clientAction 列表 */
  actions: ClientAction[];
}

/**
 * 等价于 ChatClient.tsx 中 parseDataLine 的解析逻辑。
 * 输入是去掉 "data:" 前缀后的单行（如 `6:{...}` 或 `0:"hello"`）。
 */
function parseDataLine(line: string, actions: ClientAction[]): string {
  const idx = line.indexOf(":");
  if (idx <= 0) return "";
  const type = line.slice(0, idx);
  const payload = line.slice(idx + 1);

  // "0:" 文本 delta
  if (type === "0") {
    try {
      const parsed = JSON.parse(payload);
      if (typeof parsed === "string") return parsed;
    } catch {
      return "";
    }
  }

  // "6:" 工具结果 — Vercel AI SDK Data Stream Protocol
  // 携带 {toolCallId, toolName, result}，result.clientAction 是动作描述符
  if (type === "6") {
    try {
      const parsed = JSON.parse(payload) as {
        result?: { clientAction?: ClientAction };
      };
      if (parsed.result?.clientAction) {
        actions.push(parsed.result.clientAction);
      }
    } catch {
      /* ignore — 畸形行不崩溃 */
    }
  }

  // "d:" finish 消息（含 usage），此处不提取 usage，仅验证不崩溃
  if (type === "d") {
    // parseUsageFromFinishMessage 的等价占位 — 仅验证行可被识别
  }

  return "";
}

/** 模拟完整流处理：逐行解析，返回累积文本 + 提取的 actions */
function processStream(lines: string[]): ParseResult {
  const actions: ClientAction[] = [];
  let text = "";
  for (const line of lines) {
    const chunk = parseDataLine(line, actions);
    if (chunk) text += chunk;
  }
  return { text, actions };
}

// ============ 流解析测试 ============

describe("AI 工具流解析 — Vercel AI SDK Data Stream Protocol", () => {
  it("应从 '6:' 行提取 clientAction 到 pendingActions", () => {
    const clientAction: ClientAction = {
      type: "start_focus_session",
      params: {
        task_description: "学习 React Hooks",
        duration_minutes: 25,
      },
      idempotencyKey: "idem:abc123",
    };
    // 模拟 Vercel AI SDK 的 ToolResult 行格式
    const line = `6:${JSON.stringify({
      toolCallId: "call_xyz",
      toolName: "start_focus_session",
      result: {
        success: true,
        message: "已启动番茄钟",
        clientAction,
      },
    })}`;

    const { actions } = processStream([line]);
    expect(actions).toHaveLength(1);
    expect(actions[0].type).toBe("start_focus_session");
    expect(actions[0].params.task_description).toBe("学习 React Hooks");
    expect(actions[0].idempotencyKey).toBe("idem:abc123");
  });

  it("应从多个 '6:' 行提取多个 clientAction", () => {
    const action1: ClientAction = {
      type: "create_reminder",
      params: { title: "该学习了", scheduledFor: "2025-01-01T10:00:00Z" },
      idempotencyKey: "idem:1",
    };
    const action2: ClientAction = {
      type: "set_plan_priority",
      params: { planId: "plan_1", priority: 1 },
      idempotencyKey: "idem:2",
    };

    const lines = [
      `6:${JSON.stringify({ toolCallId: "c1", toolName: "set_reminder", result: { clientAction: action1 } })}`,
      `6:${JSON.stringify({ toolCallId: "c2", toolName: "set_plan_priority", result: { clientAction: action2 } })}`,
    ];

    const { actions } = processStream(lines);
    expect(actions).toHaveLength(2);
    expect(actions[0].type).toBe("create_reminder");
    expect(actions[1].type).toBe("set_plan_priority");
  });

  it("应正确解析 '0:' 文本 delta 行", () => {
    const lines = [
      `0:${JSON.stringify("Hello ")}`,
      `0:${JSON.stringify("World")}`,
    ];
    const { text } = processStream(lines);
    expect(text).toBe("Hello World");
  });

  it("应同时处理 '0:' 文本和 '6:' 工具结果", () => {
    const action: ClientAction = {
      type: "toggle_plan_freeze",
      params: { planId: "p1", freeze: true },
      idempotencyKey: "idem:freeze",
    };
    const lines = [
      `0:${JSON.stringify("正在冻结计划...")}`,
      `6:${JSON.stringify({ toolCallId: "c1", toolName: "toggle_plan_freeze", result: { clientAction: action } })}`,
      `0:${JSON.stringify("已完成")}`,
    ];
    const { text, actions } = processStream(lines);
    expect(text).toBe("正在冻结计划...已完成");
    expect(actions).toHaveLength(1);
    expect(actions[0].type).toBe("toggle_plan_freeze");
  });

  it("应处理 'd:' finish 行而不崩溃", () => {
    const finishPayload = JSON.stringify({
      finishReason: "stop",
      usage: { promptTokens: 100, completionTokens: 50, totalTokens: 150 },
    });
    const lines = [
      `0:${JSON.stringify("done")}`,
      `d:${finishPayload}`,
    ];
    const { text, actions } = processStream(lines);
    expect(text).toBe("done");
    expect(actions).toHaveLength(0);
  });

  it("畸形的 '6:' 行不应导致崩溃", () => {
    const malformedLines = [
      "6:{invalid json",
      "6:",
      "6:not json at all",
      "6:null",
      "6:{}",
      `6:${JSON.stringify({ result: {} })}`,
      `6:${JSON.stringify({ noResult: true })}`,
    ];
    const { actions } = processStream(malformedLines);
    // 所有畸形行都应被静默跳过，actions 为空
    expect(actions).toHaveLength(0);
  });

  it("'6:' 行 result 中无 clientAction 时不提取", () => {
    const line = `6:${JSON.stringify({
      toolCallId: "c1",
      toolName: "get_daily_schedule",
      result: { success: true, message: "今日时间表", data: { date: "2025-01-01" } },
    })}`;
    const { actions } = processStream([line]);
    expect(actions).toHaveLength(0);
  });

  it("不应从旧版 'a:' 前缀行提取 clientAction（回归测试）", () => {
    // 修复前用 "a" 前缀，修复后用 "6"。"a:" 行不应再被识别为工具结果
    const action: ClientAction = {
      type: "create_reminder",
      params: { title: "test", scheduledFor: "2025-01-01T10:00:00Z" },
      idempotencyKey: "idem:a",
    };
    const line = `a:${JSON.stringify({ result: { clientAction: action } })}`;
    const { actions } = processStream([line]);
    expect(actions).toHaveLength(0);
  });

  it("无冒号或空行应返回空字符串且不崩溃", () => {
    const { text, actions } = processStream(["", "nocolon", ":noleft"]);
    expect(text).toBe("");
    expect(actions).toHaveLength(0);
  });
});

// ============ createSession → getRunningSession 集成测试 ============
// 验证 Task 1.2 修复：AI 启动的 session 使用 createSession 写入，
// getRunningSession 能扫描到（key 前缀 + status=running）

describe("AI start_focus_session 集成 — createSession → getRunningSession", () => {
  beforeEach(async () => {
    // 清理 pomodoro:* + learn_log:* 前缀的 key（与 pomodoro.test.ts 一致）
    const pomodoroKeys = await listKeys(KEY_PREFIXES.POMODORO_SESSION);
    const learnLogKeys = await listKeys(KEY_PREFIXES.LEARN_LOG);
    for (const k of [...pomodoroKeys, ...learnLogKeys]) {
      await delItem(k);
    }
  });

  it("createSession 写入的 session 应被 getRunningSession 扫描到", async () => {
    const session = await createSession({
      taskDescription: "AI 启动的专注：学习 TypeScript",
      type: "focus",
      durationMinutes: 25,
      planId: "plan_ai_1",
      nodeId: "node_ts",
    });

    // 验证 session 属性
    expect(session.status).toBe("running");
    expect(session.type).toBe("focus");
    expect(session.taskDescription).toBe("AI 启动的专注：学习 TypeScript");
    expect(session.durationMinutes).toBe(25);
    expect(session.planId).toBe("plan_ai_1");
    expect(session.id).toBeTruthy();
    expect(session.startedAt).toBeTruthy();
    expect(typeof session.sessionIndex).toBe("number");
    expect(session.interruptions).toBe(0);

    // 验证 getRunningSession 能找到它
    const running = await getRunningSession();
    expect(running).not.toBeNull();
    expect(running!.id).toBe(session.id);
    expect(running!.status).toBe("running");
    expect(running!.taskDescription).toBe("AI 启动的专注：学习 TypeScript");
  });

  it("getRunningSession 应返回 startedAt 最新的 running session", async () => {
    // 第一个 session 仅用于制造数据，不参与断言（用 _ 前缀符合 no-unused-vars 规则）
    const _s1 = await createSession({
      taskDescription: "第一个番茄",
      type: "focus",
      durationMinutes: 25,
    });
    // 稍微延迟确保 startedAt 不同
    await new Promise((r) => setTimeout(r, 10));
    const s2 = await createSession({
      taskDescription: "第二个番茄",
      type: "focus",
      durationMinutes: 25,
    });

    const running = await getRunningSession();
    expect(running).not.toBeNull();
    expect(running!.id).toBe(s2.id);
  });

  it("status=pending 的 session 不应被 getRunningSession 扫描到（回归测试）", async () => {
    // 旧代码写入 status=pending 到 focus:pending_session，getRunningSession 找不到
    // 这里验证旧模式确实找不到
    const fakeSession = {
      id: "old-pending",
      taskDescription: "旧模式 pending session",
      durationMinutes: 25,
      status: "pending" as const,
      createdAt: new Date().toISOString(),
    };
    // 写入旧的 key（focus:pending_session），不是 pomodoro: 前缀
    await setItem("focus:pending_session", fakeSession);

    const running = await getRunningSession();
    // getRunningSession 只扫描 pomodoro: 前缀 + status=running，旧 key 找不到
    expect(running).toBeNull();
  });

  it("getRunningSession 只扫描 pomodoro: 前缀的 key", async () => {
    // 确认 createSession 写入的 key 前缀是 KEY_PREFIXES.POMODORO_SESSION
    const session = await createSession({
      taskDescription: "验证 key 前缀",
      type: "focus",
      durationMinutes: 15,
    });

    const allPomodoroSessions = await listItems<PomodoroSession>(
      KEY_PREFIXES.POMODORO_SESSION,
    );
    const found = allPomodoroSessions.find((s) => s.id === session.id);
    expect(found).toBeDefined();
    expect(found!.status).toBe("running");
  });
});

// ============ planId 闭环测试 ============
// 验证 4 个只读工具返回的数据中均暴露 planId，
// 让 AI 能据此调用 adjust_plan / toggle_plan_freeze / set_plan_priority 等写入工具。
//
// 此闭环是工具能力"调用得起来"的关键：旧实现只读工具返回里没有 planId，
// AI 即使想调写入工具也无 planId 可传 → 这些写入工具实际上从未被 AI 真正调用成功。

/** 构造测试用 ToolContext：含 2 个未冻结计划 + 1 个冻结计划 */
function buildTestToolContext(): ToolContext {
  const now = new Date("2026-07-21T10:00:00+08:00").toISOString();
  return {
    plans: [
      {
        id: "plan_react",
        topic: "React 进阶",
        frozen: false,
        priority: 1,
        dailyMinutes: 60,
        maxNewPerDay: 2,
        totalNodes: 20,
        completedNodes: 8,
        currentNodeTitle: "useEffect 进阶",
        upcomingSchedule: [
          {
            day: 1,
            date: "2026-07-21",
            tasks: [
              {
                nodeId: "node_1",
                nodeTitle: "useEffect 依赖",
                type: "learn",
                estimatedMinutes: 30,
                completed: false,
              },
            ],
          },
          {
            day: 2,
            date: "2026-07-22",
            tasks: [
              {
                nodeId: "node_2",
                nodeTitle: "useReducer",
                type: "learn",
                estimatedMinutes: 30,
                completed: false,
              },
            ],
          },
        ],
      },
      {
        id: "plan_algo",
        topic: "算法基础",
        frozen: false,
        priority: 2,
        dailyMinutes: 30,
        maxNewPerDay: 1,
        totalNodes: 30,
        completedNodes: 5,
        currentNodeTitle: "动态规划",
        upcomingSchedule: [
          {
            day: 1,
            date: "2026-07-21",
            tasks: [
              {
                nodeId: "node_a",
                nodeTitle: "0-1 背包",
                type: "learn",
                estimatedMinutes: 30,
                completed: true,
              },
            ],
          },
        ],
      },
      {
        id: "plan_frozen",
        topic: "已暂停的计划",
        frozen: true,
        priority: 5,
        dailyMinutes: 0,
        maxNewPerDay: 0,
        totalNodes: 0,
        completedNodes: 0,
        upcomingSchedule: [],
      },
    ],
    todayLearnLogs: [{ type: "learn_complete", nodeTitle: "useState 基础", timestamp: now }],
    todayReviewCount: 3,
    todayStatus: {
      energy: 4,
      mood: "focused",
      availableMinutes: 120,
    },
    routine: {
      wakeTime: "06:00",
      sleepTime: "23:00",
      slots: [
        { label: "晨间学习", start: "06:30", end: "08:00", minutes: 90 },
        { label: "晚间复习", start: "21:00", end: "22:00", minutes: 60 },
      ],
      weekdays: [1, 2, 3, 4, 5],
      intensity: "medium",
    },
    now,
    pendingReminders: [],
    recentMistakes: [],
  };
}

describe("AI 工具 planId 闭环 — 只读工具必须暴露 planId", () => {
  let ctx: ToolContext;
  let tools: ReturnType<typeof createChatTools>;

  beforeEach(() => {
    ctx = buildTestToolContext();
    tools = createChatTools(ctx);
  });

  it("get_daily_schedule 返回的 todayPlanSchedule[].planId 应为真实计划 ID", async () => {
    const result = await tools.get_daily_schedule.execute({}, {
      messages: [], toolCallId: "test",
    } as never);
    expect(result.success).toBe(true);
    const data = result.data as {
      todayPlanSchedule: Array<{ planId: string; topic: string }>;
    };
    expect(data.todayPlanSchedule).toHaveLength(2); // 冻结的不算
    const planIds = data.todayPlanSchedule.map((p) => p.planId);
    expect(planIds).toContain("plan_react");
    expect(planIds).toContain("plan_algo");
    // 冻结计划不应出现
    expect(planIds).not.toContain("plan_frozen");
  });

  it("get_next_task 返回的 recommendedPlan.planId 应为真实计划 ID", async () => {
    const result = await tools.get_next_task.execute({}, {
      messages: [], toolCallId: "test",
    } as never);
    expect(result.success).toBe(true);
    const data = result.data as {
      recommendedPlan: { planId: string; topic: string } | null;
    };
    expect(data.recommendedPlan).not.toBeNull();
    expect(data.recommendedPlan!.planId).toBe("plan_react"); // priority=1 最高
  });

  it("get_upcoming_plan 返回的 schedule[].planId 应为真实计划 ID", async () => {
    const result = await tools.get_upcoming_plan.execute({ days: 7 }, {
      messages: [], toolCallId: "test",
    } as never);
    expect(result.success).toBe(true);
    const data = result.data as {
      schedule: Array<{ planId: string; topic: string; date: string }>;
    };
    expect(data.schedule.length).toBeGreaterThan(0);
    const planIds = data.schedule.map((p) => p.planId);
    expect(planIds).toContain("plan_react");
    expect(planIds).toContain("plan_algo");
    // 每一项都必须有 planId
    for (const item of data.schedule) {
      expect(typeof item.planId).toBe("string");
      expect(item.planId.length).toBeGreaterThan(0);
    }
  });

  it("review_today 返回的 planProgress[].planId 应为真实计划 ID", async () => {
    const result = await tools.review_today.execute({}, {
      messages: [], toolCallId: "test",
    } as never);
    expect(result.success).toBe(true);
    const data = result.data as {
      planProgress: Array<{ planId: string; topic: string }>;
    };
    expect(data.planProgress.length).toBeGreaterThan(0);
    const planIds = data.planProgress.map((p) => p.planId);
    expect(planIds).toContain("plan_react");
    expect(planIds).toContain("plan_algo");
    // 每一项都必须有 planId
    for (const item of data.planProgress) {
      expect(typeof item.planId).toBe("string");
      expect(item.planId.length).toBeGreaterThan(0);
    }
  });

  it("adjust_plan 用真实 planId 调用应返回 clientAction", async () => {
    // 这是 planId 闭环的最终验证：只读工具返回的 planId 能被写入工具接受
    const result = await tools.adjust_plan.execute(
      { planId: "plan_react", action: "delay", targetDay: 1 },
      { messages: [], toolCallId: "test" } as never,
    );
    expect(result.success).toBe(true);
    expect(result.clientAction).toBeDefined();
    expect(result.clientAction!.type).toBe("adjust_plan");
    expect((result.clientAction!.params as { planId: string }).planId).toBe(
      "plan_react",
    );
  });

  it("adjust_plan 用编造的 planId 应返回 success=false（闭环防护）", async () => {
    // AI 若编造 planId，写入工具应明确拒绝（返回可用计划列表引导）
    const result = await tools.adjust_plan.execute(
      { planId: "fake_plan_id", action: "delay", targetDay: 1 },
      { messages: [], toolCallId: "test" } as never,
    );
    expect(result.success).toBe(false);
    expect(result.message).toContain("未找到计划 ID");
    expect(result.message).toContain("plan_react"); // 列出真实可用计划引导 AI
  });

  it("toggle_plan_freeze 用真实 planId 调用应返回 clientAction", async () => {
    const result = await tools.toggle_plan_freeze.execute(
      { planId: "plan_algo", freeze: true },
      { messages: [], toolCallId: "test" } as never,
    );
    expect(result.success).toBe(true);
    expect(result.clientAction!.type).toBe("toggle_plan_freeze");
    expect((result.clientAction!.params as { planId: string }).planId).toBe(
      "plan_algo",
    );
  });
});
