"use client";
import { useState, useEffect } from "react";
import { getStoredTheme, setTheme, applyTheme, watchSystemTheme, type Theme } from "@/lib/theme";
import { type IconName } from "@/components/Icon";
import { Button } from "@/components/ui";

export function ThemeToggle() {
  const [theme, setThemeState] = useState<Theme>("system");

  useEffect(() => {
    setThemeState(getStoredTheme());
    applyTheme(getStoredTheme());
    const unwatch = watchSystemTheme(() => {
      if (getStoredTheme() === "system") applyTheme("system");
    });
    return unwatch;
  }, []);

  function cycle() {
    const next: Theme = theme === "light" ? "dark" : theme === "dark" ? "system" : "light";
    setTheme(next);
    setThemeState(next);
  }

  const iconName: IconName = theme === "light" ? "sun" : theme === "dark" ? "moon" : "monitor";
  const label = theme === "light" ? "浅色" : theme === "dark" ? "深色" : "跟随系统";

  return (
    <Button
      variant="secondary"
      size="sm"
      onClick={cycle}
      leftIcon={iconName}
      title={`当前：${label}（点击切换）`}
    >
      <span className="hidden sm:inline">{label}</span>
    </Button>
  );
}
