// lib/types/routine.ts
// 日常作息领域类型：作息时段、当前任务、用户作息表

// 每日时间表时段
export interface RoutineSlot {
  start: string; // "HH:MM"
  end: string; // "HH:MM"
  activity: string;
  type: "运动" | "学习" | "休息" | "家庭" | "睡眠" | "工作" | "其他";
}

// 当前任务（首页"现在该做什么"卡片）
export interface CurrentTask {
  current: RoutineSlot | null;
  next: RoutineSlot | null;
  minutesLeft: number;
}

// 用户作息时间表（用于 AI 调整计划）
export interface Routine {
  /** 起床时间 HH:MM */
  wakeTime: string;
  /** 睡觉时间 HH:MM */
  sleepTime: string;
  /** 可用学习时段 */
  slots: {
    /** 时段标签：早晨/午间/晚上 */
    label: string;
    /** 开始 HH:MM */
    start: string;
    /** 结束 HH:MM */
    end: string;
    /** 可用分钟数 */
    minutes: number;
  }[];
  /** 每周可学习的星期（1-7，1=周一） */
  weekdays: number[];
  /** 偏好学习强度：轻松/标准/冲刺 */
  intensity: "light" | "standard" | "intensive";
}
