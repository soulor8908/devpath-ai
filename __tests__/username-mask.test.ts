// __tests__/username-mask.test.ts
// 测试用户名脱敏函数

import { describe, it, expect } from "vitest";
import { maskUsername } from "../lib/username-mask";

describe("maskUsername", () => {
  it("长度 > 6：保留前 2 + 后 2，中间固定 4 个 *", () => {
    expect(maskUsername("soulor8908")).toBe("so****08");
    expect(maskUsername("abcdefghij")).toBe("ab****ij");
    expect(maskUsername("verylongusername123")).toBe("ve****23");
  });

  it("长度 6：保留首末各 1，中间 4 个 *", () => {
    expect(maskUsername("abcdef")).toBe("a****f");
  });

  it("长度 5：保留首末各 1，中间 3 个 *", () => {
    expect(maskUsername("alice")).toBe("a***e");
  });

  it("长度 4：保留首末各 1，中间 2 个 *", () => {
    expect(maskUsername("abcd")).toBe("a**d");
  });

  it("长度 3：保留首字符 + 2 个 *", () => {
    expect(maskUsername("abc")).toBe("a**");
  });

  it("长度 2：保留首字符 + 1 个 *", () => {
    expect(maskUsername("ab")).toBe("a*");
  });

  it("长度 1：单个 *", () => {
    expect(maskUsername("x")).toBe("*");
  });

  it("空字符串原样返回", () => {
    expect(maskUsername("")).toBe("");
  });

  it("不同长度不暴露原始长度（防长度枚举）", () => {
    // 长度 7 和长度 20 应该有相同的 * 数量（4 个）
    expect(maskUsername("abcdefg")).toBe("ab****fg");
    expect(maskUsername("abcdefghijklmnopqrst")).toBe("ab****st");
    // 两者都是 4 个 *，攻击者无法通过 * 数量推断原始长度
  });

  it("保留首末字符让用户能认出自己", () => {
    const masked = maskUsername("soulor8908");
    expect(masked.startsWith("so")).toBe(true);
    expect(masked.endsWith("08")).toBe(true);
  });
});
