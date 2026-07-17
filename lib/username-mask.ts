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
