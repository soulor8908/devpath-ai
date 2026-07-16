// lib/timer/notification-permission.ts
// 番茄钟浏览器通知封装：请求权限 / 发送通知 / 检测权限状态
//
// 设计：
//   - 优先使用 Notification API
//   - 不支持或被拒绝时降级为 console.log
//   - SSR 安全：所有调用前用 typeof window !== "undefined" 守卫

/** 检测浏览器是否支持 Notification API */
function isSupported(): boolean {
  return typeof window !== "undefined" && "Notification" in window;
}

/**
 * 检测当前通知权限状态
 * @returns true 表示已授权；false 表示未授权/拒绝/不支持
 */
export function hasPermission(): boolean {
  if (!isSupported()) return false;
  return Notification.permission === "granted";
}

/**
 * 请求通知权限
 * @returns true 表示用户授权；false 表示拒绝或不支持
 */
export async function requestPermission(): Promise<boolean> {
  if (!isSupported()) return false;
  if (Notification.permission === "granted") return true;
  if (Notification.permission === "denied") return false;
  try {
    const result = await Notification.requestPermission();
    return result === "granted";
  } catch {
    return false;
  }
}

/**
 * 发送一条浏览器通知
 * 优先 Notification API；降级为 console.log
 *
 * @param title 通知标题
 * @param body 通知正文（可选）
 */
export async function notify(title: string, body?: string): Promise<void> {
  if (isSupported() && Notification.permission === "granted") {
    try {
      new Notification(title, {
        body: body ?? "",
        // tag 防止重复通知堆叠
        tag: "pomodoro",
        // icon 复用 PWA 图标
        icon: "/icon-192.png",
      });
      return;
    } catch (e) {
      // 通知构造失败时降级 console
      console.warn("[pomodoro:notify] Notification failed, fallback to console:", e);
    }
  }
  // 降级：仅打印日志
  console.log(`[pomodoro:notify] ${title}${body ? ` — ${body}` : ""}`);
}
