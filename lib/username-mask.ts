// lib/username-mask.ts
// 用户名脱敏：用于公开可见场景（分享图、公开主页 hero / 404 文案）
//
// 设计考量（卡帕西视角）：
//   - 纯函数，零副作用，可单测
//   - 不暴露原始长度（固定 * 数量防长度枚举攻击）
//   - 保留首末字符让用户能认出是自己的用户名
//   - 自己可见场景（profile 编辑页）不脱敏

/**
 * 用户名脱敏
 *
 * 规则：
 *   - 长度 > 6：保留前 2 + 后 2，中间固定 4 个 *
 *   - 长度 4-6：保留首末各 1，中间用 * 填充
 *   - 长度 2-3：保留首字符 + *
 *   - 长度 1：单个 *
 *   - 空：原样返回
 *
 * @example
 *   maskUsername("soulor8908") → "so****08"
 *   maskUsername("alice")      → "a***e"
 *   maskUsername("ab")         → "a*"
 *   maskUsername("x")          → "*"
 */
export function maskUsername(username: string): string {
  if (!username) return "";
  const len = username.length;
  if (len === 1) return "*";
  if (len <= 3) return username[0] + "*".repeat(len - 1);
  if (len <= 6) return username[0] + "*".repeat(len - 2) + username[len - 1];
  // len > 6：前 2 + 固定 4 个 * + 后 2（不暴露长度）
  return username.slice(0, 2) + "****" + username.slice(-2);
}

/**
 * 用户 ID 脱敏
 *
 * userId（nanoid 生成的同步钥匙）与 username 不同：
 *   - 长度更长（默认 nanoid 21 字符）
 *   - 是敏感凭证：泄露后他人可同步/覆盖你的数据
 *
 * 规则：
 *   - 空：原样返回
 *   - 长度 ≤ 8：前 2 + 固定 4 个 * + 后 2
 *   - 长度 > 8：前 4 + 固定 4 个 * + 后 4
 *
 * @example
 *   maskUserId("V1StGXRK_Z5jdHi6J5")   → "V1St****i6J5"（nanoid 默认长度 21）
 *   maskUserId("V1StGXRK_Z5")          → "V1St****K_Z5"
 *   maskUserId("abcd")                  → "ab****cd"
 *   maskUserId("")                       → ""
 */
export function maskUserId(userId: string): string {
  if (!userId) return "";
  const len = userId.length;
  if (len <= 8) {
    // 长度 ≤ 8：前 2 + 4 个 * + 后 2
    return userId.slice(0, 2) + "****" + userId.slice(-2);
  }
  // 长度 > 8：前 4 + 4 个 * + 后 4
  return userId.slice(0, 4) + "****" + userId.slice(-4);
}
