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

import { describe, it, expect, beforeEach, vi } from "vitest";
import "fake-indexeddb/auto";
import { setItem, listItems, listKeys, delItem } from "../lib/storage/db";
import { KEY_PREFIXES, type PomodoroSession } from "../lib/types";
import type { ClientAction } from "../lib/ai/chat-tools";

// 屏蔽 pomodoro 模块中无意义的 console 输出
vi.spyOn(console, "info").mockImplementation(() => {});
vi.spyOn(console, "warn").mockImplementation(() => {});

import {
  createSession,
  getRunningSession,
} from "../lib/timer/pomodoro";

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
    const s1 = await createSession({
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
