// __tests__/username-mask.test.ts
// 测试用户名脱敏函数

import { describe, it, expect } from "vitest";
import { maskUsername, maskUserId } from "../lib/username-mask";

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

describe("maskUserId", () => {
  it("长度 21（nanoid 默认）：前 4 + **** + 后 4", () => {
    const id = "V1StGXRK_Z5jdHi6J5oPq"; // 长度 21
    const masked = maskUserId(id);
    expect(masked).toBe("V1St" + "****" + "5oPq");
    expect(masked.length).toBe(12);
  });

  it("长度 12：前 4 + **** + 后 4", () => {
    expect(maskUserId("abcdefghijkl")).toBe("abcd****ijkl");
  });

  it("长度 9：前 4 + **** + 后 4", () => {
    expect(maskUserId("abcdefghi")).toBe("abcd****fghi");
  });

  it("长度 8：前 2 + **** + 后 2", () => {
    expect(maskUserId("abcdefgh")).toBe("ab****gh");
  });

  it("长度 6：前 2 + **** + 后 2", () => {
    expect(maskUserId("abcdef")).toBe("ab****ef");
  });

  it("空 ID 返回空串", () => {
    expect(maskUserId("")).toBe("");
  });

  it("脱敏后始终包含 4 个 *（不暴露原始长度）", () => {
    const short = maskUserId("abc");      // 长度 3
    const medium = maskUserId("abcdefgh"); // 长度 8
    const long = maskUserId("V1StGXRK_Z5jdHi6J5"); // 长度 18
    // 都包含 4 个连续 *
    expect(short.includes("****")).toBe(true);
    expect(medium.includes("****")).toBe(true);
    expect(long.includes("****")).toBe(true);
  });

  it("长度 3：前 2 + **** + 后 2（脱敏后字符比原长，仍按规则）", () => {
    expect(maskUserId("abc")).toBe("ab****bc");
  });

  it("保留首末字符让用户能认出自己", () => {
    const id = "V1StGXRK_Z5jdHi6J5oPq";
    const masked = maskUserId(id);
    expect(masked.startsWith("V1St")).toBe(true);  // 前 4
    expect(masked.endsWith("5oPq")).toBe(true);   // 后 4
  });
});
