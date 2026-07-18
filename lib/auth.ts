// lib/auth.ts
// 统一鉴权入口（apiKey Session 安全架构 Task 14）
//
// 重导出 session 鉴权（向后兼容旧 import 路径）：
//   - 旧代码 `import { requireAuth } from "@/lib/auth"` 已被全量替换为 `requireSession`
//   - 此文件保留作为统一鉴权入口，避免散落在各路由的 import 路径不一致
//   - 实际逻辑在 lib/ai/session-middleware.ts（服务端中间件）

export { requireSession, type SessionContext } from "./ai/session-middleware";
