// lib/ai/crypto.ts
// Edge runtime 兼容的加解密工具
//
// 硬约束：仅使用 Web Crypto API（crypto.subtle，edge runtime 原生支持）
// 与 atob / btoa / TextEncoder / Uint8Array 等标准 Web 平台 API。
// 禁止使用 Node.js 专属 API（Buffer / node:crypto 模块）。

// ---------------------------------------------------------------------------
// 编码辅助函数
// ---------------------------------------------------------------------------

/** base64 字符串 → Uint8Array（edge runtime 无 Buffer，用 atob 解码） */
export function base64ToBytes(b64: string): Uint8Array {
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

/** Uint8Array → base64 字符串（分块处理避免 fromCharCode apply 栈溢出） */
export function bytesToBase64(bytes: Uint8Array): string {
  let binary = "";
  const chunkSize = 0x8000;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    const chunk = bytes.subarray(i, i + chunkSize);
    binary += String.fromCharCode(...chunk);
  }
  return btoa(binary);
}

/** hex 字符串 → Uint8Array */
export function hexToBytes(hex: string): Uint8Array {
  if (hex.length % 2 !== 0) {
    throw new Error("hex string must have even length");
  }
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  }
  return bytes;
}

/** Uint8Array → hex 字符串（小写） */
export function bytesToHex(bytes: Uint8Array): string {
  let hex = "";
  for (let i = 0; i < bytes.length; i++) {
    const b = bytes[i];
    hex += (b < 16 ? "0" : "") + b.toString(16);
  }
  return hex;
}

// ---------------------------------------------------------------------------
// AES-GCM 256
// ---------------------------------------------------------------------------

/**
 * 将 Uint8Array 适配为 Web Crypto API 的 BufferSource 参数类型。
 * 纯类型层转换：TS 5.7+ 起 `Uint8Array<ArrayBufferLike>` 不再直接满足 `BufferSource`
 * （要求 `ArrayBufferView<ArrayBuffer>`），但运行时 `new Uint8Array(n)` / `subarray()`
 * 总是由 ArrayBuffer 支撑（非 SharedArrayBuffer），故此 cast 运行时安全。
 */
function asBuf(bytes: Uint8Array): BufferSource {
  return bytes as unknown as BufferSource;
}

/**
 * AES-GCM 256 加密
 * @param plaintext 明文
 * @param keyBase64 base64 编码的 32 字节密钥
 * @param associatedData 附加认证数据（AAD，不加密但参与认证）
 * @returns base64(IV(12B) + ciphertext + tag(16B))
 */
export async function aesGcmEncrypt(
  plaintext: string,
  keyBase64: string,
  associatedData?: Uint8Array,
): Promise<string> {
  const keyBytes = base64ToBytes(keyBase64);
  if (keyBytes.length !== 32) {
    throw new Error(
      `AES-256-GCM key must be 32 bytes, got ${keyBytes.length}`,
    );
  }
  // 12 字节随机 IV（GCM 推荐 96-bit IV）
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    asBuf(keyBytes),
    { name: "AES-GCM" },
    false,
    ["encrypt"],
  );
  const plaintextBytes = new TextEncoder().encode(plaintext);
  // encrypt 输出 = ciphertext + tag(16B)
  const ciphertextBuf = await crypto.subtle.encrypt(
    {
      name: "AES-GCM",
      iv: asBuf(iv),
      ...(associatedData ? { additionalData: asBuf(associatedData) } : {}),
      tagLength: 128,
    },
    cryptoKey,
    plaintextBytes,
  );
  const ciphertextBytes = new Uint8Array(ciphertextBuf);
  // 拼接 IV + ciphertext + tag
  const packed = new Uint8Array(iv.length + ciphertextBytes.length);
  packed.set(iv, 0);
  packed.set(ciphertextBytes, iv.length);
  return bytesToBase64(packed);
}

/**
 * AES-GCM 256 解密
 * @param packedBase64 base64(IV(12B) + ciphertext + tag)
 * @param keyBase64 base64 编码的 32 字节密钥
 * @param associatedData 附加认证数据（必须与加密时一致）
 * @returns plaintext 字符串
 */
export async function aesGcmDecrypt(
  packedBase64: string,
  keyBase64: string,
  associatedData?: Uint8Array,
): Promise<string> {
  const keyBytes = base64ToBytes(keyBase64);
  if (keyBytes.length !== 32) {
    throw new Error(
      `AES-256-GCM key must be 32 bytes, got ${keyBytes.length}`,
    );
  }
  const packed = base64ToBytes(packedBase64);
  // 至少需要 IV(12) + tag(16)
  if (packed.length < 12 + 16) {
    throw new Error("packed ciphertext too short");
  }
  const iv = packed.subarray(0, 12);
  const ciphertextWithTag = packed.subarray(12);
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    asBuf(keyBytes),
    { name: "AES-GCM" },
    false,
    ["decrypt"],
  );
  const plaintextBuf = await crypto.subtle.decrypt(
    {
      name: "AES-GCM",
      iv: asBuf(iv),
      ...(associatedData ? { additionalData: asBuf(associatedData) } : {}),
      tagLength: 128,
    },
    cryptoKey,
    asBuf(ciphertextWithTag),
  );
  return new TextDecoder().decode(plaintextBuf);
}

// ---------------------------------------------------------------------------
// HMAC-SHA256 / SHA-256
// ---------------------------------------------------------------------------

/**
 * HMAC-SHA256
 * @param keyBase64 base64 编码的 key（任意长度）
 * @param message 消息
 * @returns hex 字符串（64 字符）
 */
export async function hmacSha256(
  keyBase64: string,
  message: string,
): Promise<string> {
  const keyBytes = base64ToBytes(keyBase64);
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    asBuf(keyBytes),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const msgBytes = new TextEncoder().encode(message);
  const sigBuf = await crypto.subtle.sign("HMAC", cryptoKey, msgBytes);
  return bytesToHex(new Uint8Array(sigBuf));
}

/**
 * SHA-256
 * @param message 消息
 * @returns hex 字符串（64 字符）
 */
export async function sha256(message: string): Promise<string> {
  const msgBytes = new TextEncoder().encode(message);
  const buf = await crypto.subtle.digest("SHA-256", msgBytes);
  return bytesToHex(new Uint8Array(buf));
}

// ---------------------------------------------------------------------------
// 常数时间比较 / 随机字节
// ---------------------------------------------------------------------------

/**
 * 常数时间字符串比较，防止 timing attack
 * 长度不同时仍走完整流程（用 XOR 累积），不提前 return
 */
export function constantTimeEqual(a: string, b: string): boolean {
  const maxLen = Math.max(a.length, b.length);
  let result = 0;
  for (let i = 0; i < maxLen; i++) {
    const ca = i < a.length ? a.charCodeAt(i) : 0;
    const cb = i < b.length ? b.charCodeAt(i) : 0;
    result |= ca ^ cb;
  }
  // 长度差异也 OR 进结果，避免通过长度差异泄漏
  result |= a.length ^ b.length;
  return result === 0;
}

/**
 * 生成 n 个随机字节，返回 hex 字符串（长度 = n*2）
 * 用 crypto.getRandomValues（edge runtime 原生支持）
 */
export function randomBytes(n: number): string {
  const bytes = crypto.getRandomValues(new Uint8Array(n));
  return bytesToHex(bytes);
}
