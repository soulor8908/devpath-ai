// lib/theme.ts
// 暗黑模式管理

export type Theme = "light" | "dark" | "system";

const STORAGE_KEY = "devpath:theme";

/** 获取存储的主题偏好 */
export function getStoredTheme(): Theme {
  if (typeof window === "undefined") return "system";
  const stored = localStorage.getItem(STORAGE_KEY);
  return (stored as Theme) || "system";
}

/** 获取实际应用的主题（system 时根据 prefers-color-scheme） */
export function getResolvedTheme(theme: Theme): "light" | "dark" {
  if (theme === "system") {
    if (typeof window === "undefined") return "light";
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }
  return theme;
}

/** 应用主题到 document */
export function applyTheme(theme: Theme): void {
  if (typeof document === "undefined") return;
  const resolved = getResolvedTheme(theme);
  if (resolved === "dark") {
    document.documentElement.classList.add("dark");
  } else {
    document.documentElement.classList.remove("dark");
  }
}

/** 设置并保存主题 */
export function setTheme(theme: Theme): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, theme);
  applyTheme(theme);
}

/** 初始化主题（在 app/layout.tsx 中调用，或通过 inline script） */
export function initTheme(): void {
  applyTheme(getStoredTheme());
}

/** 监听系统主题变化（当偏好为 system 时） */
export function watchSystemTheme(callback: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  const mq = window.matchMedia("(prefers-color-scheme: dark)");
  const handler = () => callback();
  mq.addEventListener("change", handler);
  return () => mq.removeEventListener("change", handler);
}
