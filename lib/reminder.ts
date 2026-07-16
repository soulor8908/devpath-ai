// lib/reminder.ts
// 提醒管理系统：AI 工具通过 set_reminder 创建提醒，客户端定期检查并触发浏览器通知
//
// 设计：
// - 提醒存储在 IndexedDB（key=reminder:<id>），通过 sync.ts 同步到云端
// - 客户端每 30 秒检查一次到期提醒
// - 使用 Notification API 弹出通知（需用户授权）
// - 触发后标记 triggered=true，不再重复触发
// - 支持"X 分钟后提醒"和"指定时间提醒"两种模式

import { nanoid } from "nanoid";
import { getItem, setItem, listItems, delItem } from "./storage/db";
import { KEY_PREFIXES, type Reminder } from "./types";
import { scheduleAutoSync } from "./sync";

/** 检查浏览器是否支持通知 */
export function isNotificationSupported(): boolean {
  return typeof window !== "undefined" && "Notification" in window;
}

/** 获取通知权限状态 */
export function getNotificationPermission(): NotificationPermission | "unsupported" {
  if (!isNotificationSupported()) return "unsupported";
  return Notification.permission;
}

/** 请求通知权限 */
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!isNotificationSupported()) return "denied";
  return await Notification.requestPermission();
}

/**
 * 创建提醒
 * @param title 提醒标题
 * @param scheduledFor ISO 时间字符串（何时触发）
 * @param options.body 详细内容
 * @param options.planId 关联计划 ID
 */
export async function createReminder(
  title: string,
  scheduledFor: string,
  options?: { body?: string; planId?: string },
): Promise<Reminder> {
  const reminder: Reminder = {
    id: nanoid(),
    title,
    body: options?.body,
    scheduledFor,
    createdAt: new Date().toISOString(),
    triggered: false,
    planId: options?.planId,
  };
  await setItem(KEY_PREFIXES.REMINDER + reminder.id, reminder);
  scheduleAutoSync();
  return reminder;
}

/**
 * 创建"X 分钟后"的提醒
 * @param title 提醒标题
 * @param minutesFromNow 几分钟后触发
 * @param options.body 详细内容
 * @param options.planId 关联计划 ID
 */
export async function createReminderInMinutes(
  title: string,
  minutesFromNow: number,
  options?: { body?: string; planId?: string },
): Promise<Reminder> {
  const scheduledFor = new Date(Date.now() + minutesFromNow * 60_000).toISOString();
  return createReminder(title, scheduledFor, options);
}

/** 获取所有未触发的提醒 */
export async function getPendingReminders(): Promise<Reminder[]> {
  const all = await listItems<Reminder>(KEY_PREFIXES.REMINDER);
  return all
    .filter((r) => !r.triggered)
    .sort((a, b) => new Date(a.scheduledFor).getTime() - new Date(b.scheduledFor).getTime());
}

/** 获取所有提醒（包括已触发） */
export async function listAllReminders(): Promise<Reminder[]> {
  const all = await listItems<Reminder>(KEY_PREFIXES.REMINDER);
  return all.sort(
    (a, b) => new Date(b.scheduledFor).getTime() - new Date(a.scheduledFor).getTime(),
  );
}

/** 删除提醒 */
export async function deleteReminder(id: string): Promise<void> {
  await delItem(KEY_PREFIXES.REMINDER + id);
  scheduleAutoSync();
}

/** 标记提醒已触发 */
async function markTriggered(id: string): Promise<void> {
  const reminder = await getItem<Reminder>(KEY_PREFIXES.REMINDER + id);
  if (reminder) {
    await setItem(KEY_PREFIXES.REMINDER + id, { ...reminder, triggered: true });
    scheduleAutoSync();
  }
}

/**
 * 检查并触发到期的提醒
 * 在客户端每 30 秒调用一次
 */
export async function checkAndTriggerReminders(): Promise<void> {
  if (!isNotificationSupported()) return;
  if (Notification.permission !== "granted") return;

  const pending = await getPendingReminders();
  const now = Date.now();
  const due = pending.filter((r) => new Date(r.scheduledFor).getTime() <= now);

  for (const reminder of due) {
    try {
      new Notification(reminder.title, {
        body: reminder.body ?? "",
        tag: reminder.id, // 防止重复通知
        icon: "/icon-192.png",
      });
      await markTriggered(reminder.id);
    } catch {
      // 通知失败也标记为已触发，避免反复尝试
      await markTriggered(reminder.id);
    }
  }
}

// ============ 轮询器 ============
let pollTimer: ReturnType<typeof setInterval> | null = null;
const POLL_INTERVAL_MS = 30_000; // 30 秒检查一次

/** 启动提醒轮询（在应用初始化时调用） */
export function startReminderPolling(): void {
  if (pollTimer) return; // 已启动
  // 立即检查一次
  void checkAndTriggerReminders();
  pollTimer = setInterval(() => {
    void checkAndTriggerReminders();
  }, POLL_INTERVAL_MS);
}

/** 停止提醒轮询 */
export function stopReminderPolling(): void {
  if (pollTimer) {
    clearInterval(pollTimer);
    pollTimer = null;
  }
}
