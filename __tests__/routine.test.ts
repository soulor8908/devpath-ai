import { describe, it, expect } from "vitest";
import { parseRoutine, getCurrentTask, defaultRoutineMarkdown } from "../lib/routine";

describe("routine", () => {
  it("parseRoutine 解析标准表格行", () => {
    const md = `# 时间表

| 时间 | 活动 | 类型 |
| --- | --- | --- |
| 06:30 - 07:00 | 🏃 晨跑 | 运动 |
| 07:00 - 08:00 | 🍽️ 早餐 | 家庭 |
| 19:00 - 21:00 | 📚 晚间学习 | 学习 |
`;
    const slots = parseRoutine(md);
    expect(slots).toHaveLength(3);
    expect(slots[0]).toMatchObject({ start: "06:30", end: "07:00", activity: "晨跑", type: "运动" });
    expect(slots[1]).toMatchObject({ start: "07:00", end: "08:00", activity: "早餐", type: "家庭" });
    expect(slots[2]).toMatchObject({ start: "19:00", end: "21:00", activity: "晚间学习", type: "学习" });
  });

  it("parseRoutine 对不合法行直接跳过", () => {
    const md = `# 时间表

| 时间 | 活动 | 类型 |
| --- | --- | --- |
| 06:30 - 07:00 | 晨跑 | 运动 |
一些说明文字
| 不合法行
`;
    const slots = parseRoutine(md);
    expect(slots).toHaveLength(1);
  });

  it("getCurrentTask 命中当前时段", () => {
    const slots = parseRoutine(
      `| 09:00 - 10:00 | 学习 | 学习 |\n| 10:00 - 11:00 | 休息 | 休息 |\n`,
    );
    const t = getCurrentTask(slots, "09:30");
    expect(t.current?.activity).toBe("学习");
    expect(t.minutesLeft).toBe(30);
    expect(t.next?.activity).toBe("休息");
  });

  it("getCurrentTask 在间隔内 → current=null, next 为下一时段", () => {
    const slots = parseRoutine(
      `| 09:00 - 10:00 | 学习 | 学习 |\n| 11:00 - 12:00 | 休息 | 休息 |\n`,
    );
    const t = getCurrentTask(slots, "10:30");
    expect(t.current).toBeNull();
    expect(t.next?.activity).toBe("休息");
    expect(t.minutesLeft).toBe(0);
  });

  it("getCurrentTask 晚于所有时段 → current=null, next=null", () => {
    const slots = parseRoutine(`| 09:00 - 10:00 | 学习 | 学习 |\n`);
    const t = getCurrentTask(slots, "23:00");
    expect(t.current).toBeNull();
    expect(t.next).toBeNull();
  });

  it("defaultRoutineMarkdown 含学习/休息/运动时段", () => {
    const md = defaultRoutineMarkdown();
    const slots = parseRoutine(md);
    const types = new Set(slots.map((s) => s.type));
    expect(types.has("学习")).toBe(true);
    expect(types.has("休息")).toBe(true);
    expect(types.has("运动")).toBe(true);
  });
});
