// lib/daily.ts
// 每日日志 Markdown 解析与生成（从主站 lib/daily.ts 迁移）
// 存储格式：IndexedDB key = "daily_log:<YYYY-MM-DD>", value = markdown string
// 与主站 DailyEditor 逻辑完全兼容，迁移后改为直接操作 Markdown 字符串

import type { DailyLog, ChecklistItem, DailyEnergy, DailyReview } from "@/lib/types";

export function parseDailyLog(markdown: string, date: string): DailyLog {
  const checklist: ChecklistItem[] = [];
  const energy: DailyEnergy = {
    sleep: "",
    sleepOnTime: null,
    exerciseDone: null,
    exerciseNote: "",
    energyMorning: null,
    energyNoon: null,
    energyEvening: null,
    emotion: "",
    familyQuality: 0,
  };
  const review: DailyReview = { good: "", problems: "", tomorrow: "" };

  const lines = markdown.split("\n");

  let inChecklist = false;
  for (const line of lines) {
    if (line.startsWith("## ✅")) { inChecklist = true; continue; }
    if (line.startsWith("## ")) { inChecklist = false; }
    if (inChecklist) {
      const m = line.match(/^- \[([ x])\] (.+)$/);
      if (m) {
        checklist.push({
          checked: m[1] === "x",
          text: m[2].trim(),
        });
      }
    }
  }

  const sleepMatch = markdown.match(/昨晚睡眠[：:]\s*([\d.]+)\s*小时[^\n]*22:45\s*关灯[？?]\s*(✅|❌)?/);
  if (sleepMatch) {
    energy.sleep = sleepMatch[1];
    energy.sleepOnTime = sleepMatch[2] === "✅" ? true : sleepMatch[2] === "❌" ? false : null;
  }

  const exerciseMatch = markdown.match(/晨练执行[：:]\s*(✅|❌)(?:[^\n]*未执行原因[：:]\s*(.+))?/);
  if (exerciseMatch) {
    energy.exerciseDone = exerciseMatch[1] === "✅";
    energy.exerciseNote = exerciseMatch[2]?.trim() || "";
  }

  const energyCurveMatch = markdown.match(/今日能量曲线[：:]\s*晨(\d)\s*中(\d)\s*晚(\d)/);
  if (energyCurveMatch) {
    energy.energyMorning = +energyCurveMatch[1];
    energy.energyNoon = +energyCurveMatch[2];
    energy.energyEvening = +energyCurveMatch[3];
  }

  const emotionMatch = markdown.match(/今日情绪[：:]\s*(\S+)/);
  if (emotionMatch) energy.emotion = emotionMatch[1];

  const familyMatch = markdown.match(/陪娃质量[：:]\s*(⭐+)/);
  if (familyMatch) energy.familyQuality = familyMatch[1].length;

  const reviewGoodMatch = markdown.match(/### 今天做得好的\s*\n+([\s\S]*?)(?=###|$)/);
  if (reviewGoodMatch) review.good = reviewGoodMatch[1].trim();

  const reviewProblemMatch = markdown.match(/### 今天的问题\s*\n+([\s\S]*?)(?=###|$)/);
  if (reviewProblemMatch) review.problems = reviewProblemMatch[1].trim();

  const reviewTomorrowMatch = markdown.match(/### 明天的调整\s*\n+([\s\S]*?)(?=##|$)/);
  if (reviewTomorrowMatch) review.tomorrow = reviewTomorrowMatch[1].trim();

  const planMatch = markdown.match(/## 🎯 今日计划[^\n]*\n([\s\S]*?)(?=## ✅|$)/);
  const plan = planMatch ? planMatch[1].trim() : "";

  return { date, plan, checklist, energy, review };
}

export function toggleChecklistItem(markdown: string, index: number): string {
  const lines = markdown.split("\n");
  let inChecklist = false;
  let currentIdx = 0;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].startsWith("## ✅")) { inChecklist = true; continue; }
    if (lines[i].startsWith("## ")) { inChecklist = false; }
    if (inChecklist) {
      const m = lines[i].match(/^(- \[)([ x])(\] .+)$/);
      if (m) {
        if (currentIdx === index) {
          lines[i] = m[1] + (m[2] === "x" ? " " : "x") + m[3];
          return lines.join("\n");
        }
        currentIdx++;
      }
    }
  }
  return markdown;
}

export function createEmptyLog(date: string): DailyLog {
  return {
    date,
    plan: "",
    checklist: [
      { text: "6:00-6:30 晨练", checked: false },
      { text: "6:30-7:00 早起学习", checked: false },
      { text: "7:00-8:20 通勤算法", checked: false },
      { text: "12:30-13:00 午休休息", checked: false },
      { text: "13:00-13:30 午休学习", checked: false },
      { text: "18:30-20:30 公司学习", checked: false },
    ],
    energy: {
      sleep: "",
      sleepOnTime: null,
      exerciseDone: null,
      exerciseNote: "",
      energyMorning: null,
      energyNoon: null,
      energyEvening: null,
      emotion: "",
      familyQuality: 0,
    },
    review: { good: "", problems: "", tomorrow: "" },
  };
}

export function formatDailyLog(log: DailyLog): string {
  const checklistMd = log.checklist
    .map((item) => `- [${item.checked ? "x" : " "}] ${item.text}`)
    .join("\n");

  const sleepLine = log.energy.sleep
    ? `- 昨晚睡眠：${log.energy.sleep} 小时（22:45 关灯？${log.energy.sleepOnTime === true ? "✅" : log.energy.sleepOnTime === false ? "❌" : ""}）`
    : `- 昨晚睡眠：X 小时（22:45 关灯？✅/❌）`;
  const exerciseLine = log.energy.exerciseDone === null
    ? `- 晨练执行：✅/❌`
    : `- 晨练执行：${log.energy.exerciseDone ? "✅" : "❌"}${log.energy.exerciseNote ? `（未执行原因：${log.energy.exerciseNote}）` : ""}`;
  const energyLine = `- 今日能量曲线：晨${log.energy.energyMorning ?? "★"} 中${log.energy.energyNoon ?? "★"} 晚${log.energy.energyEvening ?? "★"}（1-5分）`;
  const emotionLine = `- 今日情绪：${log.energy.emotion || "😊😐😔"}`;
  const familyLine = `- 陪娃质量：${"⭐".repeat(log.energy.familyQuality || 5)}`;

  return `# 📅 ${log.date} 作战日志

## 🎯 今日计划（昨晚睡前制定）

${log.plan || "| 时段 | 任务 | 预计时长 | 优先级 |\n|-----|------|---------|--------|\n| 6:00-6:30 晨练 | 🏃 俯卧撑/拉伸/快走 | 30min | P0 |"}

## ✅ 实际执行（实时记录）

${checklistMd}

## 📊 今日数据

### 产出
- 算法题完成：X 道（题号：）
- 有效学习时长：X 小时
- 时间利用率：X%

### 能量（核心指标）
${sleepLine}
${exerciseLine}
${energyLine}
${emotionLine}
${familyLine}

## 📝 复盘（22:45娃睡后，手机快速填写）

### 今天做得好的
${log.review.good || "1. "}

### 今天的问题
${log.review.problems || "1. "}

### 明天的调整
${log.review.tomorrow || "- "}
`;
}
