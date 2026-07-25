// __tests__/train-session-persistence.test.ts
// 训练进度持久化测试
//
// 守护内容（对应 lib/ai/train-scheduler.ts 的 sessionStorage 持久化）：
//   1. saveTrainSession → restoreTrainSession 往返一致
//   2. restoreTrainSession 拒绝脏数据（JSON 异常 / 字段缺失 / 类型错误）
//   3. restoreTrainSession 拒绝 completed phase（会话已结束，不应恢复）
//   4. restoreTrainSession 拒绝 currentIndex 越界（队列已变）
//   5. restoreTrainSession 把瞬态 phase 降级（feedback → questioning, breaking → learning）
//   6. saveTrainSession 跳过 completed phase（不写入）
//   7. clearTrainSession 清除 key
//   8. 不同天 key 不同（自动开始新会话）
//
// 这是 2026-07-25 用户反馈"训练到第3题跳出去再回来又要从第1题开始"的守护测试。
// 规则没有测试守护等于不存在。

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import {
  createInitialTrainState,
  saveTrainSession,
  restoreTrainSession,
  clearTrainSession,
  type TrainSessionState,
} from "../lib/ai/train-scheduler";

// ============ 环境配置 ============
// sessionStorage 在 Node.js 默认不存在，用 jsdom 或手动 polyfill
// vitest 默认 environment 是 jsdom（见 vitest.config.ts），sessionStorage 可用

beforeEach(() => {
  // 每个用例前清空 sessionStorage，避免互相干扰
  sessionStorage.clear();
});

afterEach(() => {
  vi.useRealTimers();
  sessionStorage.clear();
});

// ============ 工具函数 ============

function makeState(overrides: Partial<TrainSessionState> = {}): TrainSessionState {
  return {
    phase: "learning",
    currentIndex: 0,
    questionsAnswered: 0,
    questionsCorrect: 0,
    focusMinutes: 0,
    needsBreak: false,
    ...overrides,
  };
}

/** 计算 今日 的 sessionStorage key（与 train-scheduler.ts 内部逻辑保持一致） */
function todayKey(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `train-session:${y}-${m}-${d}`;
}

// ============ 测试用例 ============

describe("训练进度持久化 - 往返一致性", () => {
  it("saveTrainSession + restoreTrainSession 往返一致（learning phase）", () => {
    const state = makeState({
      phase: "learning",
      currentIndex: 2,
      questionsAnswered: 1,
      questionsCorrect: 1,
      focusMinutes: 5,
      needsBreak: false,
    });
    const queueLength = 5;

    saveTrainSession(state, { answerRevealed: false }, queueLength);

    const restored = restoreTrainSession(queueLength);
    expect(restored).not.toBeNull();
    expect(restored!.state.phase).toBe("learning");
    expect(restored!.state.currentIndex).toBe(2);
    expect(restored!.state.questionsAnswered).toBe(1);
    expect(restored!.state.questionsCorrect).toBe(1);
    expect(restored!.state.focusMinutes).toBe(5);
    expect(restored!.state.needsBreak).toBe(false);
    expect(restored!.extras.answerRevealed).toBe(false);
  });

  it("saveTrainSession + restoreTrainSession 往返一致（questioning phase + answerRevealed=true）", () => {
    const state = makeState({
      phase: "questioning",
      currentIndex: 3,
      questionsAnswered: 2,
      questionsCorrect: 1,
      focusMinutes: 10,
      needsBreak: false,
    });
    const queueLength = 8;

    saveTrainSession(state, { answerRevealed: true }, queueLength);

    const restored = restoreTrainSession(queueLength);
    expect(restored).not.toBeNull();
    expect(restored!.state.phase).toBe("questioning");
    expect(restored!.state.currentIndex).toBe(3);
    expect(restored!.extras.answerRevealed).toBe(true);
  });
});

describe("训练进度持久化 - 拒绝脏数据", () => {
  it("无持久化数据时返回 null", () => {
    expect(restoreTrainSession(5)).toBeNull();
  });

  it("JSON 格式异常时返回 null", () => {
    sessionStorage.setItem(todayKey(), "{not valid json");
    expect(restoreTrainSession(5)).toBeNull();
  });

  it("缺少 state 字段时返回 null", () => {
    sessionStorage.setItem(
      todayKey(),
      JSON.stringify({ extras: { answerRevealed: false }, queueLength: 5 }),
    );
    expect(restoreTrainSession(5)).toBeNull();
  });

  it("缺少 extras 字段时返回 null", () => {
    sessionStorage.setItem(
      todayKey(),
      JSON.stringify({ state: createInitialTrainState(), queueLength: 5 }),
    );
    expect(restoreTrainSession(5)).toBeNull();
  });

  it("state 字段类型错误时返回 null", () => {
    // currentIndex 不是 number
    sessionStorage.setItem(
      todayKey(),
      JSON.stringify({
        state: { ...createInitialTrainState(), currentIndex: "abc" },
        extras: { answerRevealed: false },
        queueLength: 5,
      }),
    );
    expect(restoreTrainSession(5)).toBeNull();
  });

  it("needsBreak 类型错误时返回 null", () => {
    sessionStorage.setItem(
      todayKey(),
      JSON.stringify({
        state: { ...createInitialTrainState(), needsBreak: "yes" as unknown as boolean },
        extras: { answerRevealed: false },
        queueLength: 5,
      }),
    );
    expect(restoreTrainSession(5)).toBeNull();
  });
});

describe("训练进度持久化 - 拒绝无效场景", () => {
  it("phase === 'completed' 不恢复（会话已结束应走完成流程）", () => {
    const state = makeState({ phase: "completed", currentIndex: 0 });
    // 注意：saveTrainSession 内部会跳过 completed phase，所以直接写入 sessionStorage
    sessionStorage.setItem(
      todayKey(),
      JSON.stringify({ state, extras: { answerRevealed: false }, queueLength: 5 }),
    );
    expect(restoreTrainSession(5)).toBeNull();
  });

  it("currentIndex 越界（>= queueLength）不恢复", () => {
    const state = makeState({ phase: "questioning", currentIndex: 10 });
    saveTrainSession(state, { answerRevealed: false }, 10);
    // 当前队列只有 5 项，持久化的索引 10 越界
    expect(restoreTrainSession(5)).toBeNull();
  });

  it("currentIndex 为负数不恢复", () => {
    const state = makeState({ phase: "learning", currentIndex: -1 });
    sessionStorage.setItem(
      todayKey(),
      JSON.stringify({ state, extras: { answerRevealed: false }, queueLength: 5 }),
    );
    expect(restoreTrainSession(5)).toBeNull();
  });

  it("当前队列为空时不恢复", () => {
    const state = makeState({ phase: "learning", currentIndex: 0 });
    saveTrainSession(state, { answerRevealed: false }, 5);
    expect(restoreTrainSession(0)).toBeNull();
  });
});

describe("训练进度持久化 - 瞬态 phase 降级", () => {
  it("feedback phase 恢复时降级为 questioning（避免空反馈 UI）", () => {
    const state = makeState({
      phase: "feedback",
      currentIndex: 2,
      questionsAnswered: 3,
      questionsCorrect: 2,
    });
    saveTrainSession(state, { answerRevealed: true }, 5);

    const restored = restoreTrainSession(5);
    expect(restored).not.toBeNull();
    expect(restored!.state.phase).toBe("questioning");
    // 其他字段保持原值
    expect(restored!.state.currentIndex).toBe(2);
    expect(restored!.state.questionsAnswered).toBe(3);
    expect(restored!.state.questionsCorrect).toBe(2);
    // answerRevealed 保留（用户已经看过答案）
    expect(restored!.extras.answerRevealed).toBe(true);
  });

  it("breaking phase 恢复时降级为 learning（休息被打断，直接进入下一项学习）", () => {
    const state = makeState({
      phase: "breaking",
      currentIndex: 3,
      questionsAnswered: 3,
      questionsCorrect: 3,
      focusMinutes: 25,
      needsBreak: true,
    });
    saveTrainSession(state, { answerRevealed: false }, 5);

    const restored = restoreTrainSession(5);
    expect(restored).not.toBeNull();
    expect(restored!.state.phase).toBe("learning");
    expect(restored!.state.currentIndex).toBe(3);
    expect(restored!.state.focusMinutes).toBe(25);
  });
});

describe("训练进度持久化 - saveTrainSession 行为", () => {
  it("phase === 'completed' 时不写入 sessionStorage", () => {
    const state = makeState({ phase: "completed" });
    saveTrainSession(state, { answerRevealed: false }, 5);
    // sessionStorage 应该没有数据
    expect(sessionStorage.length).toBe(0);
  });
});

describe("训练进度持久化 - clearTrainSession", () => {
  it("clearTrainSession 清除已持久化的数据", () => {
    const state = makeState({ phase: "learning", currentIndex: 2 });
    saveTrainSession(state, { answerRevealed: false }, 5);
    expect(restoreTrainSession(5)).not.toBeNull();

    clearTrainSession();

    expect(restoreTrainSession(5)).toBeNull();
  });

  it("clearTrainSession 在无数据时不报错", () => {
    expect(() => clearTrainSession()).not.toThrow();
  });
});

describe("训练进度持久化 - 按日期分桶", () => {
  it("不同天的数据互不干扰（key 按 YYYY-MM-DD 分桶）", () => {
    // 模拟今天
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 6, 25, 10, 0, 0)); // 2026-07-25 10:00

    const todayState = makeState({ phase: "learning", currentIndex: 3 });
    saveTrainSession(todayState, { answerRevealed: false }, 5);

    // 模拟明天
    vi.setSystemTime(new Date(2026, 6, 26, 10, 0, 0)); // 2026-07-26 10:00

    // 明天读不到昨天的数据 → 返回 null（自动开始新会话）
    expect(restoreTrainSession(5)).toBeNull();

    // 明天写入新数据
    const tomorrowState = makeState({ phase: "learning", currentIndex: 1 });
    saveTrainSession(tomorrowState, { answerRevealed: false }, 5);
    const restored = restoreTrainSession(5);
    expect(restored).not.toBeNull();
    expect(restored!.state.currentIndex).toBe(1);

    // 回到今天，今天的数据还在
    vi.setSystemTime(new Date(2026, 6, 25, 10, 0, 0));
    const todayRestored = restoreTrainSession(5);
    expect(todayRestored).not.toBeNull();
    expect(todayRestored!.state.currentIndex).toBe(3);
  });
});

describe("训练进度持久化 - 边界场景", () => {
  it("currentIndex === 0 时正常恢复（边界值）", () => {
    const state = makeState({ phase: "learning", currentIndex: 0 });
    saveTrainSession(state, { answerRevealed: false }, 1);
    const restored = restoreTrainSession(1);
    expect(restored).not.toBeNull();
    expect(restored!.state.currentIndex).toBe(0);
  });

  it("currentIndex === queueLength - 1 时正常恢复（最后一项，边界值）", () => {
    const state = makeState({ phase: "questioning", currentIndex: 4 });
    saveTrainSession(state, { answerRevealed: false }, 5);
    const restored = restoreTrainSession(5);
    expect(restored).not.toBeNull();
    expect(restored!.state.currentIndex).toBe(4);
  });
});
