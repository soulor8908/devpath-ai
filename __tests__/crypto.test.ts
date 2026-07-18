import { describe, it, expect } from "vitest";
import {
  aesGcmEncrypt,
  aesGcmDecrypt,
  hmacSha256,
  sha256,
  constantTimeEqual,
  randomBytes,
  bytesToBase64,
  base64ToBytes,
  hexToBytes,
  bytesToHex,
} from "../lib/ai/crypto";

// 生成 32 字节 base64 密钥用于 AES 测试（确定性，便于复现）
function makeKey32(): string {
  const k = new Uint8Array(32);
  for (let i = 0; i < 32; i++) k[i] = (i + 1) % 256;
  return bytesToBase64(k);
}

describe("crypto: 编码辅助函数", () => {
  it("bytesToBase64 + base64ToBytes 往返", () => {
    const bytes = new Uint8Array([0, 1, 2, 3, 255, 128, 64, 32, 127]);
    const b64 = bytesToBase64(bytes);
    const back = base64ToBytes(b64);
    expect(Array.from(back)).toEqual(Array.from(bytes));
  });

  it("bytesToHex + hexToBytes 往返", () => {
    const bytes = new Uint8Array([0, 15, 255, 128, 10, 171]);
    const hex = bytesToHex(bytes);
    expect(hex).toBe("000fff800aab");
    const back = hexToBytes(hex);
    expect(Array.from(back)).toEqual(Array.from(bytes));
  });

  it("hexToBytes 奇数长度抛错", () => {
    expect(() => hexToBytes("abc")).toThrow();
  });

  it("bytesToBase64 处理大数组（分块路径）", () => {
    // 大于 0x8000 触发分块
    const big = new Uint8Array(0x9000);
    for (let i = 0; i < big.length; i++) big[i] = i % 256;
    const b64 = bytesToBase64(big);
    const back = base64ToBytes(b64);
    expect(back.length).toBe(big.length);
    expect(back[0]).toBe(0);
    expect(back[255]).toBe(255);
  });
});

describe("crypto: AES-GCM 256", () => {
  it("加密后解密应得原文", async () => {
    const key = makeKey32();
    const plaintext = "hello world, 开发者成长 OS apikey-secret";
    const packed = await aesGcmEncrypt(plaintext, key);
    const decrypted = await aesGcmDecrypt(packed, key);
    expect(decrypted).toBe(plaintext);
  });

  it("不同 plaintext 加密结果不同（IV 随机）", async () => {
    const key = makeKey32();
    const a = await aesGcmEncrypt("same text", key);
    const b = await aesGcmEncrypt("same text", key);
    expect(a).not.toBe(b);
    // 两者都能解密回原文
    expect(await aesGcmDecrypt(a, key)).toBe("same text");
    expect(await aesGcmDecrypt(b, key)).toBe("same text");
  });

  it("错误 key 解密抛错", async () => {
    const key = makeKey32();
    const wrongKey = bytesToBase64(new Uint8Array(32).fill(99));
    const packed = await aesGcmEncrypt("secret payload", key);
    await expect(aesGcmDecrypt(packed, wrongKey)).rejects.toThrow();
  });

  it("密钥长度不是 32 字节抛错", async () => {
    const badKey = bytesToBase64(new Uint8Array(16).fill(1));
    await expect(aesGcmEncrypt("x", badKey)).rejects.toThrow();
  });

  it("带 AAD 加解密往返；AAD 不一致则解密失败", async () => {
    const key = makeKey32();
    const aad = new Uint8Array([1, 2, 3, 4]);
    const packed = await aesGcmEncrypt("with aad", key, aad);
    expect(await aesGcmDecrypt(packed, key, aad)).toBe("with aad");
    // AAD 不一致 → 解密失败
    await expect(
      aesGcmDecrypt(packed, key, new Uint8Array([9, 9, 9])),
    ).rejects.toThrow();
    // 加密时带 AAD，解密时不带 → 失败
    await expect(aesGcmDecrypt(packed, key)).rejects.toThrow();
  });
});

describe("crypto: hmacSha256", () => {
  it("RFC 4231 test case 1（key=0x0b*20, data='Hi There'）", async () => {
    const keyBytes = new Uint8Array(20).fill(0x0b);
    const keyBase64 = bytesToBase64(keyBytes);
    const sig = await hmacSha256(keyBase64, "Hi There");
    expect(sig).toBe(
      "b0344c61d8db38535ca8afceaf0bf12b881dc200c9833da726e9376c2e32cff7",
    );
  });

  it("返回 64 字符 hex", async () => {
    const key = bytesToBase64(new Uint8Array(32).fill(1));
    const sig = await hmacSha256(key, "any message");
    expect(sig).toMatch(/^[0-9a-f]{64}$/);
  });
});

describe("crypto: sha256", () => {
  it("sha256('abc') 已知向量", async () => {
    const h = await sha256("abc");
    expect(h).toBe(
      "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad",
    );
  });

  it("sha256('') 已知向量", async () => {
    const h = await sha256("");
    expect(h).toBe(
      "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
    );
  });

  it("返回 64 字符 hex", async () => {
    const h = await sha256("anything");
    expect(h).toMatch(/^[0-9a-f]{64}$/);
  });
});

describe("crypto: constantTimeEqual", () => {
  it("相同字符串返回 true", () => {
    expect(constantTimeEqual("abc", "abc")).toBe(true);
    expect(constantTimeEqual("", "")).toBe(true);
    expect(constantTimeEqual("aBc123!@#", "aBc123!@#")).toBe(true);
  });

  it("不同字符串返回 false", () => {
    expect(constantTimeEqual("abc", "abd")).toBe(false);
    expect(constantTimeEqual("abc", "abc ")).toBe(false);
    expect(constantTimeEqual("ABC", "abc")).toBe(false);
  });

  it("长度不同返回 false 不抛错", () => {
    expect(constantTimeEqual("a", "ab")).toBe(false);
    expect(constantTimeEqual("longstring", "short")).toBe(false);
    expect(constantTimeEqual("", "a")).toBe(false);
    expect(constantTimeEqual("a", "")).toBe(false);
  });
});

describe("crypto: randomBytes", () => {
  it("返回 hex 字符串，长度 = n*2", () => {
    expect(randomBytes(16)).toMatch(/^[0-9a-f]{32}$/);
    expect(randomBytes(0)).toBe("");
    expect(randomBytes(1)).toMatch(/^[0-9a-f]{2}$/);
  });

  it("两次调用大概率不同", () => {
    const a = randomBytes(32);
    const b = randomBytes(32);
    expect(a).not.toBe(b);
  });
});
