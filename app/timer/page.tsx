// app/timer/page.tsx
// 番茄时钟全屏专注页面（server component，仅渲染客户端组件）

import { PomodoroFull } from "@/components/PomodoroFull";

export default function TimerPage() {
  return <PomodoroFull />;
}
