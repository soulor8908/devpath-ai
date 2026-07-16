import { describe, it, expect } from "vitest";
import {
  parseDailyLog,
  toggleChecklistItem,
  createEmptyLog,
  formatDailyLog,
} from "../lib/daily";

const SAMPLE_MD = `# 📅 2026-07-13 作战日志

## 🎯 今日计划（昨晚睡前制定）

学习 React Fiber 架构

## ✅ 实际执行（实时记录）

- [x] 6:00-6:30 晨练
- [ ] 6:30-7:00 早起学习
- [x] 12:30-13:00 午休休息

## 📊 今日数据

### 能量（核心指标）
- 昨晚睡眠：7.5 小时（22:45 关灯？✅）
- 晨练执行：✅
- 今日能量曲线：晨4 中3 晚2（1-5分）
- 今日情绪：😊
- 陪娃质量：⭐⭐⭐

## 📝 复盘

### 今天做得好的
完成了 Fiber 架构学习

### 今天的问题
下午能量太低

### 明天的调整
- 上午做难题，下午做简单复习
`;

describe("daily parser", () => {
  it("parseDailyLog 提取 checklist", () => {
    const log = parseDailyLog(SAMPLE_MD, "2026-07-13");
    expect(log.checklist.length).toBe(3);
    expect(log.checklist[0].checked).toBe(true);
    expect(log.checklist[1].checked).toBe(false);
    expect(log.checklist[2].checked).toBe(true);
  });

  it("parseDailyLog 提取能量数据", () => {
    const log = parseDailyLog(SAMPLE_MD, "2026-07-13");
    expect(log.energy.sleep).toBe("7.5");
    expect(log.energy.sleepOnTime).toBe(true);
    expect(log.energy.exerciseDone).toBe(true);
    expect(log.energy.energyMorning).toBe(4);
    expect(log.energy.energyNoon).toBe(3);
    expect(log.energy.energyEvening).toBe(2);
    expect(log.energy.familyQuality).toBe(3);
  });

  it("parseDailyLog 提取复盘", () => {
    const log = parseDailyLog(SAMPLE_MD, "2026-07-13");
    expect(log.review.good).toContain("Fiber");
    expect(log.review.problems).toContain("能量太低");
    expect(log.review.tomorrow).toContain("上午做难题");
  });

  it("parseDailyLog 提取计划", () => {
    const log = parseDailyLog(SAMPLE_MD, "2026-07-13");
    expect(log.plan).toContain("React Fiber");
  });

  it("toggleChecklistItem 切换状态", () => {
    const toggled = toggleChecklistItem(SAMPLE_MD, 1);
    const log = parseDailyLog(toggled, "2026-07-13");
    expect(log.checklist[1].checked).toBe(true);
  });

  it("createEmptyLog 生成默认 checklist", () => {
    const empty = createEmptyLog("2026-07-14");
    expect(empty.checklist.length).toBeGreaterThan(0);
    expect(empty.checklist.every((c) => !c.checked)).toBe(true);
  });

  it("formatDailyLog 生成可再解析的 Markdown", () => {
    const empty = createEmptyLog("2026-07-14");
    const md = formatDailyLog(empty);
    const reparsed = parseDailyLog(md, "2026-07-14");
    expect(reparsed.checklist.length).toBe(empty.checklist.length);
    expect(reparsed.date).toBe("2026-07-14");
  });
});
