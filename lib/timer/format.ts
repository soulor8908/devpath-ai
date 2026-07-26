// lib/timer/format.ts
// 番茄钟 / 计时器相关的格式化工具
//
// 2026-07-26 抽取（卡帕西视角）：
//   components/PomodoroWidget.tsx 与 components/PomodoroFullContent.tsx 各自实现了
//   formatCountdown 函数（字节级一致），违反 DRY。这里抽为单一事实源，
//   未来改格式（如加小时支持）只改一处。

/**
 * 把毫秒数格式化为 "MM:SS" 倒计时字符串。
 * 负数会被钳为 0。
 *
 * @example formatCountdown(125000) // "02:05"
 * @example formatCountdown(-100)   // "00:00"
 */
export function formatCountdown(ms: number): string {
  if (ms < 0) ms = 0;
  const totalSec = Math.floor(ms / 1000);
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

/**
 * 把毫秒数格式化为 "MM:SS"（同 formatCountdown，但超过 1 小时时显示 "HH:MM:SS"）。
 * 番茄钟通常不超过 25/50 分钟，但通用计时器可能跨小时。
 */
export function formatDuration(ms: number): string {
  if (ms < 0) ms = 0;
  const totalSec = Math.floor(ms / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  if (h > 0) {
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  }
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}
