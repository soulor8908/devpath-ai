import { describe, it, expect } from "vitest";
import { normalizeRoutine, DEFAULT_ROUTINE } from "../lib/learn-log";
import type { Routine } from "../lib/types";

describe("normalizeRoutine", () => {
  it("入参 undefined → 返回与 DEFAULT_ROUTINE 等价但非同引用的深拷贝", () => {
    const result = normalizeRoutine(undefined);
    // 值相等
    expect(result).toEqual(DEFAULT_ROUTINE);
    // 顶层非同引用
    expect(result).not.toBe(DEFAULT_ROUTINE);
    // slots 数组非同引用
    expect(result.slots).not.toBe(DEFAULT_ROUTINE.slots);
    // weekdays 数组非同引用
    expect(result.weekdays).not.toBe(DEFAULT_ROUTINE.weekdays);
    // slots 内部对象非同引用
    expect(result.slots[0]).not.toBe(DEFAULT_ROUTINE.slots[0]);
  });

  it("入参仅含 wakeTime → 保留 wakeTime，其余字段回退到默认", () => {
    const result = normalizeRoutine({ wakeTime: "07:00" } as Routine);
    expect(result.wakeTime).toBe("07:00");
    expect(result.sleepTime).toBe(DEFAULT_ROUTINE.sleepTime);
    expect(result.slots).toEqual(DEFAULT_ROUTINE.slots);
    expect(result.weekdays).toEqual(DEFAULT_ROUTINE.weekdays);
    expect(result.intensity).toBe(DEFAULT_ROUTINE.intensity);
  });

  it("入参 weekdays 非数组 → 回退到 DEFAULT_ROUTINE.weekdays", () => {
    const result = normalizeRoutine({
      weekdays: "not array" as any,
    } as Routine);
    expect(result.weekdays).toEqual(DEFAULT_ROUTINE.weekdays);
    expect(Array.isArray(result.weekdays)).toBe(true);
  });

  it("入参 slots 为 null → 回退到 DEFAULT_ROUTINE.slots", () => {
    const result = normalizeRoutine({ slots: null as any } as Routine);
    expect(result.slots).toEqual(DEFAULT_ROUTINE.slots);
    expect(Array.isArray(result.slots)).toBe(true);
  });

  it("修改返回值的 slots/weekdays 不会污染 DEFAULT_ROUTINE（深拷贝验证）", () => {
    const result = normalizeRoutine(undefined);
    // 修改返回值的数组
    result.slots.push({
      label: "新",
      start: "23:00",
      end: "23:30",
      minutes: 30,
    });
    result.slots[0].label = "被修改";
    result.weekdays.push(6);
    // DEFAULT_ROUTINE 不应被影响
    expect(DEFAULT_ROUTINE.slots).toHaveLength(3);
    expect(DEFAULT_ROUTINE.slots[0].label).toBe("早晨");
    expect(DEFAULT_ROUTINE.weekdays).toEqual([1, 2, 3, 4, 5]);
  });
});
