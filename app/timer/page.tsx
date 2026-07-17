"use client";

// app/timer/page.tsx
// 番茄时钟全屏专注页面
// 改为 "use client" 避免 SSR 阶段访问 IndexedDB 时抛错（修复 /timer 404）

import { PomodoroFull } from "@/components/PomodoroFull";

export default function TimerPage() {
  return <PomodoroFull />;
}
