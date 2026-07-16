// __tests__/achievements.test.ts
// 成就系统 Phase 5 测试
//
// 测试覆盖（spec Task 5.9）：
//   - streak 3/7/30/100 阈值判定（边界值）
//   - first_time 成就只触发一次（已存在 id 不再返回）
//   - recovery 断卡后 3 天内恢复
//   - detectNewAchievements 幂等性（相同输入相同输出）
//   - getAchievementProgress 返回 0-1 范围
//
// 环境配置参考 __tests__/pomodoro.test.ts：fake-indexeddb/auto + jsdom

import { describe, it, expect, beforeEach, vi } from "vitest";
import "fake-indexeddb/auto";
import { setItem, listKeys, delItem } from "../lib/storage/db";
import {
  KEY_PREFIXES,
  type LearnLog,
  type ReviewLog,
} from "../lib/types";
import { chinaDateNow, chinaDateShift } from "../lib/time";
import {
  detectNewAchievements,
  getAchievementProgress,
  ACHIEVEMENT_DEFINITIONS,
  type AchievementStats,
} from "../lib/achievements/detector";
import {
  collectStats,
  checkAndNotify,
} from "../lib/achievements";
import {
  saveAchievement,
  listAchievements,
  listUnlockedIds,
  hasAchievement,
} from "../lib/achievements/store";

// 屏蔽 checkAndNotify / store 内的 console.warn（notify 在 jsdom 无 Notification 时静默降级）
vi.spyOn(console, "warn").mockImplementation(() => {});
vi.spyOn(console, "info").mockImplementation(() => {});

// ============ 公共辅助 ============

/** 构造一个全 0 / false 的 stats */
function emptyStats(): AchievementStats {
  return {
    streakDays: 0,
    completedPlans: 0,
    focusMinutes: 0,
    reviewStreak: 0,
    recoveredFromBreak: false,
    firstPomodoroDone: false,
    firstMistakeCorrected: false,
    firstWeeklyReportGenerated: false,
  };
}

/** 构造一条 focus_session 类型的 LearnLog（计入专注分钟 + 学习连续天数） */
function makeFocusLog(date: string, duration = 25): LearnLog {
  return {
    id: `log_${date}_${Math.random().toString(36).slice(2, 8)}`,
    planId: "plan_test",
    date,
    type: "focus_session",
    duration,
    timestamp: new Date().toISOString(),
  };
}

/** 构造一条普通 learn 类型的 LearnLog（计入学习连续天数，不计入专注分钟） */
function makeLearnLog(date: string): LearnLog {
  return {
    id: `learn_${date}_${Math.random().toString(36).slice(2, 8)}`,
    planId: "plan_test",
    date,
    type: "learn",
  };
}

beforeEach(async () => {
  // 清理 achievement: / learn_log: / review_log: 前缀，避免测试间互相污染
  const prefixes = [
    KEY_PREFIXES.ACHIEVEMENT,
    KEY_PREFIXES.LEARN_LOG,
    KEY_PREFIXES.REVIEW_LOG,
  ];
  for (const p of prefixes) {
    const keys = await listKeys(p);
    for (const k of keys) await delItem(k);
  }
});

// ============ 纯函数测试：detectNewAchievements ============

describe("detectNewAchievements — streak 阈值判定", () => {
  it("streak=2 不触发任何 streak 成就", () => {
    const stats = { ...emptyStats(), streakDays: 2 };
    const result = detectNewAchievements(stats, []);
    const streakIds = result.filter((a) => a.type === "streak").map((a) => a.id);
    expect(streakIds).toEqual([]);
  });

  it("streak=3 触发 streak_3（边界值：等于阈值）", () => {
    const stats = { ...emptyStats(), streakDays: 3 };
    const result = detectNewAchievements(stats, []);
    const streakIds = result.filter((a) => a.type === "streak").map((a) => a.id);
    expect(streakIds).toEqual(["streak_3"]);
  });

  it("streak=6 仅触发 streak_3（未达 7）", () => {
    const stats = { ...emptyStats(), streakDays: 6 };
    const result = detectNewAchievements(stats, []);
    const streakIds = result.filter((a) => a.type === "streak").map((a) => a.id);
    expect(streakIds).toEqual(["streak_3"]);
  });

  it("streak=7 触发 streak_3 + streak_7（边界值）", () => {
    const stats = { ...emptyStats(), streakDays: 7 };
    const result = detectNewAchievements(stats, []);
    const streakIds = result.filter((a) => a.type === "streak").map((a) => a.id);
    expect(streakIds).toEqual(["streak_3", "streak_7"]);
  });

  it("streak=29 触发 streak_3 + streak_7（未达 30）", () => {
    const stats = { ...emptyStats(), streakDays: 29 };
    const result = detectNewAchievements(stats, []);
    const streakIds = result.filter((a) => a.type === "streak").map((a) => a.id);
    expect(streakIds).toEqual(["streak_3", "streak_7"]);
  });

  it("streak=30 触发 streak_3 + streak_7 + streak_30（边界值）", () => {
    const stats = { ...emptyStats(), streakDays: 30 };
    const result = detectNewAchievements(stats, []);
    const streakIds = result.filter((a) => a.type === "streak").map((a) => a.id);
    expect(streakIds).toEqual(["streak_3", "streak_7", "streak_30"]);
  });

  it("streak=99 触发前 3 个 streak（未达 100）", () => {
    const stats = { ...emptyStats(), streakDays: 99 };
    const result = detectNewAchievements(stats, []);
    const streakIds = result.filter((a) => a.type === "streak").map((a) => a.id);
    expect(streakIds).toEqual(["streak_3", "streak_7", "streak_30"]);
  });

  it("streak=100 触发全部 4 个 streak 成就（边界值）", () => {
    const stats = { ...emptyStats(), streakDays: 100 };
    const result = detectNewAchievements(stats, []);
    const streakIds = result.filter((a) => a.type === "streak").map((a) => a.id);
    expect(streakIds).toEqual(["streak_3", "streak_7", "streak_30", "streak_100"]);
  });

  it("streak=200 仍只触发 4 个 streak 成就（超过最大阈值不再产生新成就）", () => {
    const stats = { ...emptyStats(), streakDays: 200 };
    const result = detectNewAchievements(stats, []);
    const streakIds = result.filter((a) => a.type === "streak").map((a) => a.id);
    expect(streakIds).toHaveLength(4);
  });
});

// ============ first_time 只触发一次 ============

describe("detectNewAchievements — first_time 只触发一次", () => {
  it("首次完成番茄触发 first_pomodoro", () => {
    const stats = { ...emptyStats(), firstPomodoroDone: true };
    const result = detectNewAchievements(stats, []);
    const ids = result.map((a) => a.id);
    expect(ids).toContain("first_pomodoro");
  });

  it("已解锁 first_pomodoro 后再次检测不再返回（existingIds 去重）", () => {
    const stats = { ...emptyStats(), firstPomodoroDone: true };
    const result = detectNewAchievements(stats, ["first_pomodoro"]);
    const ids = result.map((a) => a.id);
    expect(ids).not.toContain("first_pomodoro");
  });

  it("三个 first_time 成就可同时触发（互不影响）", () => {
    const stats = {
      ...emptyStats(),
      firstPomodoroDone: true,
      firstMistakeCorrected: true,
      firstWeeklyReportGenerated: true,
    };
    const result = detectNewAchievements(stats, []);
    const firstTimeIds = result
      .filter((a) => a.type === "first_time")
      .map((a) => a.id)
      .sort();
    expect(firstTimeIds).toEqual([
      "first_mistake_corrected",
      "first_pomodoro",
      "first_weekly_report",
    ]);
  });

  it("已解锁其中一个 first_time 后，未解锁的仍可触发", () => {
    const stats = {
      ...emptyStats(),
      firstPomodoroDone: true,
      firstMistakeCorrected: true,
      firstWeeklyReportGenerated: true,
    };
    // first_pomodoro 已解锁，另两个未解锁
    const result = detectNewAchievements(stats, ["first_pomodoro"]);
    const ids = result.map((a) => a.id);
    expect(ids).not.toContain("first_pomodoro");
    expect(ids).toContain("first_mistake_corrected");
    expect(ids).toContain("first_weekly_report");
  });
});

// ============ 幂等性 ============

describe("detectNewAchievements — 幂等性", () => {
  it("相同输入产生相同输出（结构相等）", () => {
    const stats: AchievementStats = {
      streakDays: 5,
      completedPlans: 2,
      focusMinutes: 1200,
      reviewStreak: 10,
      recoveredFromBreak: true,
      firstPomodoroDone: true,
      firstMistakeCorrected: false,
      firstWeeklyReportGenerated: false,
    };
    const r1 = detectNewAchievements(stats, []);
    const r2 = detectNewAchievements(stats, []);
    // 深度比较：相同输入 → 相同输出（包括 unlockedAt 占位空串）
    expect(JSON.stringify(r1)).toBe(JSON.stringify(r2));
    expect(r1).toEqual(r2);
  });

  it("不同 existingIds 产生不同输出（去重生效）", () => {
    const stats = { ...emptyStats(), streakDays: 3 };
    const r1 = detectNewAchievements(stats, []);
    const r2 = detectNewAchievements(stats, ["streak_3"]);
    expect(r1).toHaveLength(1);
    expect(r2).toHaveLength(0);
  });

  it("返回的 Achievement.unlockedAt 为空字符串占位（纯函数不写时间）", () => {
    const stats = { ...emptyStats(), streakDays: 3 };
    const result = detectNewAchievements(stats, []);
    expect(result).toHaveLength(1);
    expect(result[0].unlockedAt).toBe("");
    expect(result[0].progress).toBe(1);
  });
});

// ============ getAchievementProgress 0-1 范围 ============

describe("getAchievementProgress — 返回 0-1 范围", () => {
  describe("streak", () => {
    it("currentValue=0 → 0", () => {
      expect(getAchievementProgress("streak", 0)).toBe(0);
    });
    it("currentValue=2 → 2/3（下一个阈值 3）", () => {
      expect(getAchievementProgress("streak", 2)).toBeCloseTo(2 / 3, 5);
    });
    it("currentValue=3 → 3/7（已达 3，下一个阈值 7）", () => {
      expect(getAchievementProgress("streak", 3)).toBeCloseTo(3 / 7, 5);
    });
    it("currentValue=7 → 7/30（已达 7，下一个阈值 30）", () => {
      expect(getAchievementProgress("streak", 7)).toBeCloseTo(7 / 30, 5);
    });
    it("currentValue=30 → 30/100（已达 30，下一个阈值 100）", () => {
      expect(getAchievementProgress("streak", 30)).toBeCloseTo(30 / 100, 5);
    });
    it("currentValue=100 → 1（已超过所有阈值）", () => {
      expect(getAchievementProgress("streak", 100)).toBe(1);
    });
    it("currentValue=150 → 1（远超最大阈值仍为 1）", () => {
      expect(getAchievementProgress("streak", 150)).toBe(1);
    });
  });

  describe("focus_hours（单位：分钟，阈值 600/3000/12000）", () => {
    it("currentValue=0 → 0", () => {
      expect(getAchievementProgress("focus_hours", 0)).toBe(0);
    });
    it("currentValue=300 → 0.5（下一个阈值 600）", () => {
      expect(getAchievementProgress("focus_hours", 300)).toBeCloseTo(0.5, 5);
    });
    it("currentValue=600 → 0.2（已达 600，下一个阈值 3000）", () => {
      expect(getAchievementProgress("focus_hours", 600)).toBeCloseTo(0.2, 5);
    });
    it("currentValue=12000 → 1（已超过所有阈值）", () => {
      expect(getAchievementProgress("focus_hours", 12000)).toBe(1);
    });
  });

  describe("topic_mastery", () => {
    it("currentValue=0 → 0", () => {
      expect(getAchievementProgress("topic_mastery", 0)).toBe(0);
    });
    it("currentValue=1 → 1/3（下一个阈值 3）", () => {
      expect(getAchievementProgress("topic_mastery", 1)).toBeCloseTo(1 / 3, 5);
    });
    it("currentValue=10 → 1（已超过所有阈值）", () => {
      expect(getAchievementProgress("topic_mastery", 10)).toBe(1);
    });
  });

  describe("review_streak", () => {
    it("currentValue=0 → 0", () => {
      expect(getAchievementProgress("review_streak", 0)).toBe(0);
    });
    it("currentValue=7 → 7/30（已达 7，下一个阈值 30）", () => {
      expect(getAchievementProgress("review_streak", 7)).toBeCloseTo(7 / 30, 5);
    });
    it("currentValue=30 → 1（已超过所有阈值）", () => {
      expect(getAchievementProgress("review_streak", 30)).toBe(1);
    });
  });

  describe("recovery（布尔型）", () => {
    it("currentValue=0 → 0", () => {
      expect(getAchievementProgress("recovery", 0)).toBe(0);
    });
    it("currentValue=1 → 1", () => {
      expect(getAchievementProgress("recovery", 1)).toBe(1);
    });
  });

  describe("first_time（布尔型）", () => {
    it("currentValue=0 → 0", () => {
      expect(getAchievementProgress("first_time", 0)).toBe(0);
    });
    it("currentValue=1 → 1", () => {
      expect(getAchievementProgress("first_time", 1)).toBe(1);
    });
  });

  it("所有 type + 任意非负输入：返回值始终在 [0, 1]", () => {
    const types: Array<
      Parameters<typeof getAchievementProgress>[0]
    > = [
      "streak",
      "topic_mastery",
      "focus_hours",
      "review_streak",
      "recovery",
      "first_time",
    ];
    for (const t of types) {
      for (const v of [0, 1, 2, 3, 5, 7, 10, 50, 100, 500, 1000, 9999]) {
        const p = getAchievementProgress(t, v);
        expect(p).toBeGreaterThanOrEqual(0);
        expect(p).toBeLessThanOrEqual(1);
      }
    }
  });
});

// ============ collectStats — recovery 断卡后 3 天内恢复 ============

describe("collectStats — recovery 断卡后 3 天内恢复", () => {
  it("streak=1 且断卡前一天有记录 → recoveredFromBreak=true", async () => {
    // 今天有记录，昨天无，前天有 → streak=1, gapDay=昨天(无), prevDay=前天(有)
    const today = chinaDateNow();
    const yesterday = chinaDateShift(today, -1);
    const dayBefore = chinaDateShift(today, -2);
    await setItem(KEY_PREFIXES.LEARN_LOG + "log_today", makeLearnLog(today));
    await setItem(KEY_PREFIXES.LEARN_LOG + "log_db", makeLearnLog(dayBefore));

    const stats = await collectStats();
    expect(stats.streakDays).toBe(1);
    expect(stats.recoveredFromBreak).toBe(true);
  });

  it("streak=2 且断卡前一天有记录 → recoveredFromBreak=true", async () => {
    // 今天+昨天有，前天无，大前天有 → streak=2, gapDay=前天(无), prevDay=大前天(有)
    const today = chinaDateNow();
    const yesterday = chinaDateShift(today, -1);
    const dayBefore = chinaDateShift(today, -2); // gap day（无记录）
    const threeDaysAgo = chinaDateShift(today, -3); // prev day（有记录）
    await setItem(KEY_PREFIXES.LEARN_LOG + "log_t", makeLearnLog(today));
    await setItem(KEY_PREFIXES.LEARN_LOG + "log_y", makeLearnLog(yesterday));
    await setItem(KEY_PREFIXES.LEARN_LOG + "log_3", makeLearnLog(threeDaysAgo));

    const stats = await collectStats();
    expect(stats.streakDays).toBe(2);
    expect(stats.recoveredFromBreak).toBe(true);
  });

  it("streak=3 且断卡前一天有记录 → recoveredFromBreak=true（3 天内恢复边界）", async () => {
    // 今天+昨天+前天有，大前天无，大大前天有 → streak=3, gapDay=大前天(无), prevDay=大大前天(有)
    const today = chinaDateNow();
    const yesterday = chinaDateShift(today, -1);
    const dayBefore = chinaDateShift(today, -2);
    const threeDaysAgo = chinaDateShift(today, -3); // gap day（无）
    const fourDaysAgo = chinaDateShift(today, -4); // prev day（有）
    await setItem(KEY_PREFIXES.LEARN_LOG + "log_t", makeLearnLog(today));
    await setItem(KEY_PREFIXES.LEARN_LOG + "log_y", makeLearnLog(yesterday));
    await setItem(KEY_PREFIXES.LEARN_LOG + "log_db", makeLearnLog(dayBefore));
    await setItem(KEY_PREFIXES.LEARN_LOG + "log_4", makeLearnLog(fourDaysAgo));

    const stats = await collectStats();
    expect(stats.streakDays).toBe(3);
    expect(stats.recoveredFromBreak).toBe(true);
  });

  it("streak=4 → recoveredFromBreak=false（超过 3 天，不再算恢复）", async () => {
    // 今天+昨天+前天+大前天有 → streak=4 > 3
    const today = chinaDateNow();
    await setItem(KEY_PREFIXES.LEARN_LOG + "log_t", makeLearnLog(today));
    await setItem(KEY_PREFIXES.LEARN_LOG + "log_y", makeLearnLog(chinaDateShift(today, -1)));
    await setItem(KEY_PREFIXES.LEARN_LOG + "log_db", makeLearnLog(chinaDateShift(today, -2)));
    await setItem(KEY_PREFIXES.LEARN_LOG + "log_3", makeLearnLog(chinaDateShift(today, -3)));

    const stats = await collectStats();
    expect(stats.streakDays).toBe(4);
    expect(stats.recoveredFromBreak).toBe(false);
  });

  it("streak=1 但断卡前无连续记录 → recoveredFromBreak=false", async () => {
    // 今天有，昨天无，前天也无 → streak=1, gapDay=昨天(无), prevDay=前天(也无) → false
    const today = chinaDateNow();
    await setItem(KEY_PREFIXES.LEARN_LOG + "log_t", makeLearnLog(today));

    const stats = await collectStats();
    expect(stats.streakDays).toBe(1);
    expect(stats.recoveredFromBreak).toBe(false);
  });

  it("recoveredFromBreak=true 触发 recovery_3day 成就", async () => {
    // 构造 streak=1 + 恢复场景
    const today = chinaDateNow();
    const dayBefore = chinaDateShift(today, -2);
    await setItem(KEY_PREFIXES.LEARN_LOG + "log_t", makeLearnLog(today));
    await setItem(KEY_PREFIXES.LEARN_LOG + "log_db", makeLearnLog(dayBefore));

    const stats = await collectStats();
    const newOnes = detectNewAchievements(stats, []);
    const ids = newOnes.map((a) => a.id);
    expect(ids).toContain("recovery_3day");
  });
});

// ============ collectStats — 其他派生指标 ============

describe("collectStats — focusMinutes 与 reviewStreak", () => {
  it("focus_session 的 duration 累加为 focusMinutes", async () => {
    const today = chinaDateNow();
    await setItem(KEY_PREFIXES.LEARN_LOG + "f1", makeFocusLog(today, 25));
    await setItem(KEY_PREFIXES.LEARN_LOG + "f2", makeFocusLog(today, 35));
    // 非 focus_session 不计入 focusMinutes
    await setItem(KEY_PREFIXES.LEARN_LOG + "l1", makeLearnLog(today));

    const stats = await collectStats();
    expect(stats.focusMinutes).toBe(60);
  });

  it("连续复习 N 天 → reviewStreak=N", async () => {
    const today = chinaDateNow();
    const yesterday = chinaDateShift(today, -1);
    const reviewLog = (date: string): ReviewLog => ({
      id: `rl_${date}`,
      cardId: "card_1",
      date,
      rating: 3,
      elapsedDays: 1,
      stateBefore: 1,
      stateAfter: 2,
    });
    await setItem(KEY_PREFIXES.REVIEW_LOG + "r_t", reviewLog(today));
    await setItem(KEY_PREFIXES.REVIEW_LOG + "r_y", reviewLog(yesterday));

    const stats = await collectStats();
    expect(stats.reviewStreak).toBe(2);
  });
});

// ============ store 持久化 + checkAndNotify 端到端 ============

describe("store + checkAndNotify — 持久化与去重", () => {
  it("saveAchievement 为空 unlockedAt 填入 ISO 时间戳", async () => {
    const ach = detectNewAchievements(
      { ...emptyStats(), streakDays: 3 },
      [],
    )[0];
    expect(ach.unlockedAt).toBe("");
    await saveAchievement(ach);
    const list = await listAchievements();
    expect(list).toHaveLength(1);
    expect(list[0].unlockedAt).not.toBe("");
    // 合法 ISO 时间戳
    expect(() => new Date(list[0].unlockedAt).toISOString()).not.toThrow();
  });

  it("hasAchievement 正确反映持久化状态", async () => {
    expect(await hasAchievement("streak_3")).toBe(false);
    const ach = detectNewAchievements(
      { ...emptyStats(), streakDays: 3 },
      [],
    )[0];
    await saveAchievement(ach);
    expect(await hasAchievement("streak_3")).toBe(true);
  });

  it("listUnlockedIds 返回已持久化的 id 列表", async () => {
    expect(await listUnlockedIds()).toEqual([]);
    await saveAchievement(
      detectNewAchievements({ ...emptyStats(), streakDays: 3 }, [])[0],
    );
    expect(await listUnlockedIds()).toEqual(["streak_3"]);
  });

  it("checkAndNotify 首次触发新成就，二次调用不再重复触发", async () => {
    // 构造 first_pomodoro 触发条件
    const today = chinaDateNow();
    await setItem(KEY_PREFIXES.LEARN_LOG + "f1", makeFocusLog(today, 25));

    // 首次：应返回 first_pomodoro（且可能含 streak_3 等其他成就，这里只断言包含）
    const first = await checkAndNotify();
    expect(first.map((a) => a.id)).toContain("first_pomodoro");

    // 持久化已生效
    expect(await hasAchievement("first_pomodoro")).toBe(true);

    // 二次：相同数据，不应再返回 first_pomodoro
    const second = await checkAndNotify();
    expect(second.map((a) => a.id)).not.toContain("first_pomodoro");
  });

  it("checkAndNotify 失败时返回空数组（不抛出）", async () => {
    // 无数据场景：所有 stats 为 0/false，不应触发任何成就，返回空数组
    const result = await checkAndNotify();
    expect(result).toEqual([]);
  });
});

// ============ ACHIEVEMENT_DEFINITIONS 完整性 ============

describe("ACHIEVEMENT_DEFINITIONS 完整性", () => {
  it("共 16 个成就定义", () => {
    expect(ACHIEVEMENT_DEFINITIONS).toHaveLength(16);
  });

  it("每个定义的 id 唯一", () => {
    const ids = ACHIEVEMENT_DEFINITIONS.map((d) => d.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("每个定义的 isUnlocked 是函数且 threshold 为正数", () => {
    for (const def of ACHIEVEMENT_DEFINITIONS) {
      expect(typeof def.isUnlocked).toBe("function");
      expect(def.threshold).toBeGreaterThan(0);
      expect(def.title.length).toBeGreaterThan(0);
      expect(def.description.length).toBeGreaterThan(0);
    }
  });

  it("detectNewAchievements 全部达成时返回全部 16 个", () => {
    const allTrue: AchievementStats = {
      streakDays: 100,
      completedPlans: 10,
      focusMinutes: 12000,
      reviewStreak: 30,
      recoveredFromBreak: true,
      firstPomodoroDone: true,
      firstMistakeCorrected: true,
      firstWeeklyReportGenerated: true,
    };
    const result = detectNewAchievements(allTrue, []);
    expect(result).toHaveLength(16);
  });
});
