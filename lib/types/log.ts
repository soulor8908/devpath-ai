// lib/types/log.ts
// 主站迁移类型（legacy daily log）：日志 checklist、能量数据、复盘段落、完整日志、进度统计、AI 分析、Tab

// ============ 主站迁移类型（阶段 1：类型统一）============
// 以下类型从主站 lib/types.ts 迁入，用于日志编辑器 / 算法进度 / 后端路线

// 日志 checklist 项
export interface ChecklistItem {
  text: string;
  checked: boolean;
}

// 日志能量数据（从 daily/*.md Markdown 解析）
export interface DailyEnergy {
  sleep: string;
  sleepOnTime: boolean | null;
  exerciseDone: boolean | null;
  exerciseNote: string;
  energyMorning: number | null;
  energyNoon: number | null;
  energyEvening: number | null;
  emotion: string;
  familyQuality: number;
}

// 复盘段落（每日日志的三段式回顾）
export interface DailyReview {
  good: string;
  problems: string;
  tomorrow: string;
}

// 完整的日志结构（从 daily/*.md Markdown 解析）
export interface DailyLog {
  date: string;
  plan: string;
  checklist: ChecklistItem[];
  energy: DailyEnergy;
  review: DailyReview;
}

// 进度统计（仪表盘聚合数据）
export interface ProgressInfo {
  algorithmDone: number;
  algorithmTotal: number;
  algorithmPercent: number;
  streakDays: number;
  totalLogs: number;
  latestLog: string;
  weekHours: number;
  algorithmTodayCount: number;
  algorithmIndependentCount: number;
  backendWeeksDone: number;
  backendWeeksTotal: number;
}

// AI 分析结果（主站 /api/ai 返回格式，DevPath 用 AICallRecord + EnergyPattern 替代）
export interface AIAnalysis {
  summary: string;
  patterns: string[];
  suggestions: string[];
}

// 学习中心 Tab（阶段 3 迁移后用于 /stats 页面切换）
export type StudyTab = "stats";
