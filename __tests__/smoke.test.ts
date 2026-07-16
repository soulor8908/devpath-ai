import { describe, it, expect } from "vitest";
import { chinaDateNow, chinaDateShift, nowISO } from "../lib/time";

describe("smoke test", () => {
  it("vitest 正常运行", () => {
    expect(1 + 1).toBe(2);
  });

  it("chinaDateNow 返回 YYYY-MM-DD 格式", () => {
    const date = chinaDateNow();
    expect(date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it("chinaDateShift 正确推移日期", () => {
    expect(chinaDateShift("2026-07-13", 1)).toBe("2026-07-14");
    expect(chinaDateShift("2026-07-13", -1)).toBe("2026-07-12");
    expect(chinaDateShift("2026-01-01", -1)).toBe("2025-12-31");
  });

  it("nowISO 返回 ISO 字符串", () => {
    expect(nowISO()).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  });
});
