// lib/time.ts
// 固定使用中国时区（Asia/Shanghai, UTC+8）
// 不受浏览器/系统/代理时区影响

const TZ = "Asia/Shanghai";

function formatParts(date: Date) {
  return new Intl.DateTimeFormat("zh-CN", {
    timeZone: TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).formatToParts(date);
}

function get(parts: ReturnType<typeof formatParts>, type: string): string {
  return parts.find((p) => p.type === type)?.value || "";
}

// 中国时区当前日期 "YYYY-MM-DD"
export function chinaDateNow(): string {
  const parts = formatParts(new Date());
  return `${get(parts, "year")}-${get(parts, "month")}-${get(parts, "day")}`;
}

// 中国时区当前时间 "HH:MM"
export function chinaTimeNow(): string {
  const parts = formatParts(new Date());
  return `${get(parts, "hour")}:${get(parts, "minute")}`;
}

// 中国时区今天的年/月/日（month 0-based，便于传给 new Date）
export function chinaTodayParts(): { year: number; month: number; day: number } {
  const parts = formatParts(new Date());
  return {
    year: +get(parts, "year"),
    month: +get(parts, "month") - 1,
    day: +get(parts, "day"),
  };
}

// 把 "YYYY-MM-DD" 推移 n 天（n 可为负），返回新日期字符串
export function chinaDateShift(dateStr: string, days: number): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  date.setUTCDate(date.getUTCDate() + days);
  const yy = date.getUTCFullYear();
  const mm = String(date.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(date.getUTCDate()).padStart(2, "0");
  return `${yy}-${mm}-${dd}`;
}

// 当前 ISO 时间戳
export function nowISO(): string {
  return new Date().toISOString();
}

// 把 ISO 时间戳格式化为 "YYYY-MM-DD"（用本地时区，与原 formatDate 行为一致）
// 2026-07-26 抽取：app/portfolio/page.tsx / app/u/[username]/portfolio/PortfolioPublicClient.tsx /
// app/achievements/page.tsx 三处完全相同的实现合并为单一事实源。
// 注意：此函数用本地时区（new Date(iso).getFullYear() 等），与 chinaDateNow 的固定
// Asia/Shanghai 不同。保留本地时区行为以避免显示回归（用户已有的"解锁于"日期不应突然变化）。
export function formatISODate(iso: string): string {
  if (!iso) return "";
  try {
    const d = new Date(iso);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  } catch {
    return "";
  }
}
