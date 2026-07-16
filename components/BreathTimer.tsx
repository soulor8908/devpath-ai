"use client";

// components/BreathTimer.tsx
// 478 呼吸法计时器（4 秒吸气 / 7 秒屏息 / 8 秒呼气，循环 4 轮）
// 从主项目迁移，无外部依赖

import { useState, useEffect, useRef } from "react";

type Phase = "idle" | "inhale" | "hold" | "exhale" | "done";

const PHASES: { name: Phase; label: string; duration: number; color: string }[] = [
  { name: "inhale", label: "吸气", duration: 4, color: "bg-blue-100" },
  { name: "hold", label: "屏息", duration: 7, color: "bg-yellow-100" },
  { name: "exhale", label: "呼气", duration: 8, color: "bg-green-100" },
];

export function BreathTimer() {
  const [running, setRunning] = useState(false);
  const [phase, setPhase] = useState<Phase>("idle");
  const [countdown, setCountdown] = useState(0);
  const [round, setRound] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!running) return;

    let phaseIdx = 0;
    let currentPhase = PHASES[phaseIdx];
    setPhase(currentPhase.name);
    setCountdown(currentPhase.duration);
    setRound(1);

    timerRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev > 1) return prev - 1;

        phaseIdx++;
        if (phaseIdx >= PHASES.length) {
          setRound((r) => {
            if (r >= 4) {
              setRunning(false);
              setPhase("done");
              if (timerRef.current) clearInterval(timerRef.current);
              return r;
            }
            return r + 1;
          });
          phaseIdx = 0;
        }
        currentPhase = PHASES[phaseIdx];
        setPhase(currentPhase.name);
        return currentPhase.duration;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [running]);

  function start() {
    setPhase("inhale");
    setRound(1);
    setRunning(true);
  }

  function stop() {
    setRunning(false);
    setPhase("idle");
    setRound(0);
    if (timerRef.current) clearInterval(timerRef.current);
  }

  const phaseLabel =
    phase === "idle" ? "准备" :
    phase === "done" ? "完成！" :
    PHASES.find((p) => p.name === phase)?.label || "";

  const bgColor =
    phase === "idle" ? "bg-gray-100" :
    phase === "done" ? "bg-green-100" :
    PHASES.find((p) => p.name === phase)?.color || "bg-gray-100";

  return (
    <div className={`rounded-xl p-6 shadow-sm text-center transition-colors ${bgColor}`}>
      <p className="text-xs text-gray-500 mb-2">478 呼吸法</p>
      <p className="text-5xl font-bold mb-2">
        {phase === "idle" || phase === "done" ? "—" : countdown}
      </p>
      <p className="text-lg font-medium mb-1">{phaseLabel}</p>
      {running && round > 0 && (
        <p className="text-xs text-gray-500">第 {round} / 4 轮</p>
      )}
      <button
        onClick={running ? stop : start}
        className={`mt-4 px-6 py-2 rounded-full text-sm font-medium ${
          running ? "bg-red-500 text-white" : "bg-black text-white"
        }`}
      >
        {running ? "停止" : phase === "done" ? "再来" : "开始"}
      </button>
    </div>
  );
}
