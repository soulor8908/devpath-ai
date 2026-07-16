// __tests__/pomodoro.test.ts
// 番茄钟 Phase 1 测试
//
// 测试覆盖：
//   - createSession + completeSession 流程（fake-indexeddb）
//   - recoverInterruptedSession 超时自动完成
//   - getNextBreakType 4-1 规则
//
// 环境配置参考 __tests__/db.test.ts：fake-indexeddb/auto + jsdom

import { describe, it, expect, beforeEach, vi } from "vitest";
import "fake-indexeddb/auto";
import { setItem, getItem, listKeys, delItem, listItems } from "../lib/storage/db";
import { KEY_PREFIXES, type PomodoroSession, type LearnLog } from "../lib/types";

// 屏蔽 recoverInterruptedSession 中无意义的 console.info
vi.spyOn(console, "info").mockImplementation(() => {});
// 屏蔽 completeSession 中可能的 console.warn（updateActualMinutes 在无 sample 时静默返回）
vi.spyOn(console, "warn").mockImplementation(() => {});

import {
  createSession,
  completeSession,
  abandonSession,
  pauseSession,
  resumeSession,
  getRunningSession,
  recoverInterruptedSession,
} from "../lib/timer/pomodoro";
import {
  getNextBreakType,
  getRecommendedDuration,
} from "../lib/timer/pomodoro-rule";
import {
  getTodayCount,
  getTodayFocusMinutes,
  getRecentSessions,
} from "../lib/timer/session-tracker";

// ============ 公共清理 ============

beforeEach(async () => {
  // 清理 pomodoro:* + learn_log:* 前缀的 key
  const pomodoroKeys = await listKeys(KEY_PREFIXES.POMODORO_SESSION);
  const learnLogKeys = await listKeys(KEY_PREFIXES.LEARN_LOG);
  for (const k of [...pomodoroKeys, ...learnLogKeys]) {
    await delItem(k);
  }
});

// ============ 纯函数测试：pomodoro-rule ============

describe("getNextBreakType", () => {
  it("sessionCount=0 返回 short_break", () => {
    expect(getNextBreakType(0)).toBe("short_break");
  });

  it("sessionCount=1 返回 short_break", () => {
    expect(getNextBreakType(1)).toBe("short_break");
  });

  it("sessionCount=3 返回 short_break", () => {
    expect(getNextBreakType(3)).toBe("short_break");
  });

  it("sessionCount=4 返回 long_break（每 4 个专注后长休息）", () => {
    expect(getNextBreakType(4)).toBe("long_break");
  });

  it("sessionCount=5 返回 short_break（重新开始计数）", () => {
    expect(getNextBreakType(5)).toBe("short_break");
  });

  it("sessionCount=8 返回 long_break（第二个长休息节点）", () => {
    expect(getNextBreakType(8)).toBe("long_break");
  });

  it("sessionCount=12 返回 long_break（第三个长休息节点）", () => {
    expect(getNextBreakType(12)).toBe("long_break");
  });

  it("sessionCount=7 返回 short_break（长休息前一个）", () => {
    expect(getNextBreakType(7)).toBe("short_break");
  });
});

describe("getRecommendedDuration", () => {
  it("standard 强度：focus=25 / short_break=5 / long_break=15", () => {
    expect(getRecommendedDuration("focus", "standard")).toBe(25);
    expect(getRecommendedDuration("short_break", "standard")).toBe(5);
    expect(getRecommendedDuration("long_break", "standard")).toBe(15);
  });

  it("light 强度：focus=15 / short_break=5 / long_break=10", () => {
    expect(getRecommendedDuration("focus", "light")).toBe(15);
    expect(getRecommendedDuration("short_break", "light")).toBe(5);
    expect(getRecommendedDuration("long_break", "light")).toBe(10);
  });

  it("intensive 强度：focus=50 / short_break=10 / long_break=20", () => {
    expect(getRecommendedDuration("focus", "intensive")).toBe(50);
    expect(getRecommendedDuration("short_break", "intensive")).toBe(10);
    expect(getRecommendedDuration("long_break", "intensive")).toBe(20);
  });

  it("默认强度为 standard", () => {
    expect(getRecommendedDuration("focus")).toBe(25);
  });
});

// ============ 集成测试：pomodoro.ts + session-tracker.ts ============

describe("createSession + completeSession 流程", () => {
  it("createSession 创建一个 running session，sessionIndex 从 1 开始", async () => {
    const session = await createSession({
      taskDescription: "学习 React Hooks",
      type: "focus",
      durationMinutes: 25,
    });

    expect(session.id).toBeDefined();
    expect(session.taskDescription).toBe("学习 React Hooks");
    expect(session.type).toBe("focus");
    expect(session.durationMinutes).toBe(25);
    expect(session.status).toBe("running");
    expect(session.sessionIndex).toBe(1); // 今日第 1 个
    expect(session.interruptions).toBe(0);
    expect(session.pausedMinutes).toBe(0);
    expect(session.startedAt).toBeDefined();

    // 持久化到 IndexedDB
    const stored = await getItem<PomodoroSession>(
      KEY_PREFIXES.POMODORO_SESSION + session.id,
    );
    expect(stored).toBeDefined();
    expect(stored!.id).toBe(session.id);
  });

  it("连续创建多个 session，sessionIndex 递增（仅 completed 才计入）", async () => {
    // 第 1 个：未完成，不计入 getTodayCount
    const s1 = await createSession({
      taskDescription: "task 1",
      type: "focus",
      durationMinutes: 25,
    });
    expect(s1.sessionIndex).toBe(1);

    // 第 2 个：未完成，也不计入
    const s2 = await createSession({
      taskDescription: "task 2",
      type: "focus",
      durationMinutes: 25,
    });
    // 因为 s1 还在 running（未 completed），getTodayCount 仍为 0
    expect(s2.sessionIndex).toBe(1);

    // 完成 s2
    await completeSession(s2.id);

    // 第 3 个：s2 已完成，getTodayCount=1，sessionIndex=2
    const s3 = await createSession({
      taskDescription: "task 3",
      type: "focus",
      durationMinutes: 25,
    });
    expect(s3.sessionIndex).toBe(2);
  });

  it("completeSession 标记 completed + completedAt，并写 LearnLog(type=focus_session)", async () => {
    const session = await createSession({
      taskDescription: "测试完成流程",
      type: "focus",
      durationMinutes: 25,
    });

    await completeSession(session.id);

    // 验证 session 状态
    const stored = await getItem<PomodoroSession>(
      KEY_PREFIXES.POMODORO_SESSION + session.id,
    );
    expect(stored).toBeDefined();
    expect(stored!.status).toBe("completed");
    expect(stored!.completedAt).toBeDefined();

    // 验证 LearnLog 已写入
    const logs = await listItems<LearnLog>(KEY_PREFIXES.LEARN_LOG);
    const focusLogs = logs.filter((l) => l.type === "focus_session");
    expect(focusLogs).toHaveLength(1);
    expect(focusLogs[0].duration).toBe(25); // durationMinutes - interruptions(0) = 25
    expect(focusLogs[0].planId).toBe("standalone"); // 无 planId 时占位
  });

  it("completeSession 时 duration 扣除 interruptions（每次打断按 1 分钟扣减）", async () => {
    // 直接构造一个带 interruptions 的 running session
    const session: PomodoroSession = {
      id: "test-interrupt-session",
      taskDescription: "被打断的专注",
      type: "focus",
      durationMinutes: 25,
      startedAt: new Date().toISOString(),
      status: "running",
      sessionIndex: 1,
      interruptions: 3,
      pausedMinutes: 0,
    };
    await setItem(KEY_PREFIXES.POMODORO_SESSION + session.id, session);

    await completeSession(session.id);

    const logs = await listItems<LearnLog>(KEY_PREFIXES.LEARN_LOG);
    const focusLog = logs.find((l) => l.type === "focus_session");
    expect(focusLog).toBeDefined();
    expect(focusLog!.duration).toBe(22); // 25 - 3 = 22
  });

  it("getTodayCount / getTodayFocusMinutes 仅统计今日 completed 的 focus session", async () => {
    // 创建 2 个 focus session，完成 1 个，放弃 1 个
    const s1 = await createSession({
      taskDescription: "完成的",
      type: "focus",
      durationMinutes: 25,
    });
    await completeSession(s1.id);

    const s2 = await createSession({
      taskDescription: "放弃的",
      type: "focus",
      durationMinutes: 25,
    });
    await abandonSession(s2.id, "test");

    const count = await getTodayCount();
    expect(count).toBe(1); // 只算 completed

    const minutes = await getTodayFocusMinutes();
    expect(minutes).toBe(25); // 只算 completed 的时长
  });

  it("abandonSession 不写 LearnLog", async () => {
    const session = await createSession({
      taskDescription: "放弃测试",
      type: "focus",
      durationMinutes: 25,
    });

    await abandonSession(session.id, "user gave up");

    const stored = await getItem<PomodoroSession>(
      KEY_PREFIXES.POMODORO_SESSION + session.id,
    );
    expect(stored!.status).toBe("abandoned");
    expect(stored!.completedAt).toBeDefined();

    // 不应写 LearnLog
    const logs = await listItems<LearnLog>(KEY_PREFIXES.LEARN_LOG);
    const focusLogs = logs.filter((l) => l.type === "focus_session");
    expect(focusLogs).toHaveLength(0);
  });

  it("pauseSession / resumeSession 切换 status", async () => {
    const session = await createSession({
      taskDescription: "暂停测试",
      type: "focus",
      durationMinutes: 25,
    });

    await pauseSession(session.id);
    let stored = await getItem<PomodoroSession>(
      KEY_PREFIXES.POMODORO_SESSION + session.id,
    );
    expect(stored!.status).toBe("paused");

    await resumeSession(session.id);
    stored = await getItem<PomodoroSession>(
      KEY_PREFIXES.POMODORO_SESSION + session.id,
    );
    expect(stored!.status).toBe("running");
  });

  it("getRunningSession 返回 status=running 的 session", async () => {
    expect(await getRunningSession()).toBeNull();

    const session = await createSession({
      taskDescription: "running test",
      type: "focus",
      durationMinutes: 25,
    });

    const running = await getRunningSession();
    expect(running).toBeDefined();
    expect(running!.id).toBe(session.id);

    await pauseSession(session.id);
    // paused 状态不应被 getRunningSession 返回
    expect(await getRunningSession()).toBeNull();
  });
});

// ============ recoverInterruptedSession 测试 ============

describe("recoverInterruptedSession", () => {
  it("无 running session 时返回 null", async () => {
    const result = await recoverInterruptedSession();
    expect(result).toBeNull();
  });

  it("超时的 running session 自动完成（距 startedAt 超过 durationMinutes）", async () => {
    // 构造一个 30 分钟前开始、时长 25 分钟的 session（已超时 5 分钟）
    const startedAt = new Date(Date.now() - 30 * 60_000).toISOString();
    const session: PomodoroSession = {
      id: "test-timeout-session",
      taskDescription: "超时的番茄",
      type: "focus",
      durationMinutes: 25,
      startedAt,
      status: "running",
      sessionIndex: 1,
      interruptions: 0,
      pausedMinutes: 0,
    };
    await setItem(KEY_PREFIXES.POMODORO_SESSION + session.id, session);

    // 调用 recoverInterruptedSession：应自动 completeSession 并返回 null
    const result = await recoverInterruptedSession();
    expect(result).toBeNull();

    // 验证 session 已被标记为 completed
    const stored = await getItem<PomodoroSession>(
      KEY_PREFIXES.POMODORO_SESSION + session.id,
    );
    expect(stored).toBeDefined();
    expect(stored!.status).toBe("completed");
    expect(stored!.completedAt).toBeDefined();

    // 验证 LearnLog 已写入（completeSession 内部触发）
    const logs = await listItems<LearnLog>(KEY_PREFIXES.LEARN_LOG);
    const focusLogs = logs.filter((l) => l.type === "focus_session");
    expect(focusLogs).toHaveLength(1);
    expect(focusLogs[0].duration).toBe(25); // 25 - 0 interruptions
  });

  it("未超时的 running session 返回该 session 让 UI 提示用户", async () => {
    // 构造一个刚刚开始（10 秒前）、时长 25 分钟的 session（未超时）
    const startedAt = new Date(Date.now() - 10_000).toISOString();
    const session: PomodoroSession = {
      id: "test-running-session",
      taskDescription: "未超时的番茄",
      type: "focus",
      durationMinutes: 25,
      startedAt,
      status: "running",
      sessionIndex: 1,
      interruptions: 0,
      pausedMinutes: 0,
    };
    await setItem(KEY_PREFIXES.POMODORO_SESSION + session.id, session);

    // 调用 recoverInterruptedSession：应返回该 session（未超时）
    const result = await recoverInterruptedSession();
    expect(result).not.toBeNull();
    expect(result!.id).toBe(session.id);
    expect(result!.status).toBe("running"); // 状态未变

    // 验证 session 仍是 running（未被自动完成）
    const stored = await getItem<PomodoroSession>(
      KEY_PREFIXES.POMODORO_SESSION + session.id,
    );
    expect(stored!.status).toBe("running");
    expect(stored!.completedAt).toBeUndefined();

    // 不应写 LearnLog
    const logs = await listItems<LearnLog>(KEY_PREFIXES.LEARN_LOG);
    expect(logs.filter((l) => l.type === "focus_session")).toHaveLength(0);
  });

  it("paused 状态的 session 不被 recoverInterruptedSession 处理", async () => {
    // paused session 不在 running 检测范围内
    const session: PomodoroSession = {
      id: "test-paused-session",
      taskDescription: "暂停的番茄",
      type: "focus",
      durationMinutes: 25,
      startedAt: new Date(Date.now() - 60 * 60_000).toISOString(), // 1 小时前
      status: "paused",
      sessionIndex: 1,
      interruptions: 0,
      pausedMinutes: 0,
    };
    await setItem(KEY_PREFIXES.POMODORO_SESSION + session.id, session);

    // paused 不在 running 范围内 → 返回 null（无 running session）
    const result = await recoverInterruptedSession();
    expect(result).toBeNull();

    // 状态未变
    const stored = await getItem<PomodoroSession>(
      KEY_PREFIXES.POMODORO_SESSION + session.id,
    );
    expect(stored!.status).toBe("paused");
  });
});

// ============ session-tracker 查询测试 ============

describe("session-tracker 查询", () => {
  it("getRecentSessions 返回最近 N 天的 sessions（按 startedAt 倒序）", async () => {
    // 创建 3 个 session：今天、昨天、3 天前
    const today = new Date();
    const yesterday = new Date(Date.now() - 1 * 86400_000);
    const threeDaysAgo = new Date(Date.now() - 3 * 86400_000);

    const sessions: PomodoroSession[] = [
      {
        id: "old",
        taskDescription: "3 天前",
        type: "focus",
        durationMinutes: 25,
        startedAt: threeDaysAgo.toISOString(),
        status: "completed",
        sessionIndex: 1,
        interruptions: 0,
      },
      {
        id: "yesterday",
        taskDescription: "昨天",
        type: "focus",
        durationMinutes: 25,
        startedAt: yesterday.toISOString(),
        status: "completed",
        sessionIndex: 1,
        interruptions: 0,
      },
      {
        id: "today",
        taskDescription: "今天",
        type: "focus",
        durationMinutes: 25,
        startedAt: today.toISOString(),
        status: "completed",
        sessionIndex: 1,
        interruptions: 0,
      },
    ];
    for (const s of sessions) {
      await setItem(KEY_PREFIXES.POMODORO_SESSION + s.id, s);
    }

    // 查询最近 2 天：应返回 today + yesterday，不含 3 天前
    const recent = await getRecentSessions(2);
    expect(recent).toHaveLength(2);
    const ids = recent.map((s) => s.id);
    expect(ids).toContain("today");
    expect(ids).toContain("yesterday");
    expect(ids).not.toContain("old");

    // 倒序：今天在前
    expect(recent[0].id).toBe("today");
    expect(recent[1].id).toBe("yesterday");
  });
});
