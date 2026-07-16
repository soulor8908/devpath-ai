// lib/ai/tool-registry.ts
// AI 工具元数据单一事实源：工具名/分类/图标/描述/快捷指令
// 消费方：route.ts（生成 system prompt）、ChatClient.tsx（渲染快捷面板）
// 新增/修改工具时只需改这一个文件

import type { IconName } from "@/components/Icon";

export type ToolCategoryId = "query" | "plan" | "focus" | "assist";

export interface ToolCategory {
  id: ToolCategoryId;
  label: string;
  icon: IconName;
  desc: string;
}

export interface ToolMeta {
  /** 工具名，与 chat-tools.ts 中的 key 一致 */
  name: string;
  /** 分类 ID */
  category: ToolCategoryId;
  /** 图标名 */
  icon: IconName;
  /** 简短描述（面向用户） */
  description: string;
  /** 快捷指令（点击后直接发送，触发该工具） */
  quickPrompts: string[];
}

export const TOOL_CATEGORIES: ToolCategory[] = [
  {
    id: "query",
    label: "查询",
    icon: "search",
    desc: "查看今日安排、推荐任务、未来计划",
  },
  {
    id: "plan",
    label: "计划管理",
    icon: "calendar-check",
    desc: "调整、冻结、优先级、优化日程",
  },
  {
    id: "focus",
    label: "专注学习",
    icon: "zap",
    desc: "启动番茄钟、生成学习计划",
  },
  {
    id: "assist",
    label: "提醒与复盘",
    icon: "bell",
    desc: "设置提醒、复盘今日表现",
  },
];

export const TOOL_REGISTRY: ToolMeta[] = [
  // === 查询类 ===
  {
    name: "get_daily_schedule",
    category: "query",
    icon: "calendar",
    description: "查看今日完整时间表（作息 + 学习计划）",
    quickPrompts: ["今天有什么安排？"],
  },
  {
    name: "get_next_task",
    category: "query",
    icon: "target",
    description: "推荐接下来该做什么",
    quickPrompts: ["接下来该学什么？"],
  },
  {
    name: "get_upcoming_plan",
    category: "query",
    icon: "list",
    description: "查看未来几天的学习安排",
    quickPrompts: ["未来几天有什么计划？"],
  },
  {
    name: "review_today",
    category: "assist",
    icon: "trending-up",
    description: "获取今日学习数据用于复盘",
    quickPrompts: ["复盘一下今天的表现"],
  },

  // === 计划管理类 ===
  {
    name: "adjust_plan",
    category: "plan",
    icon: "refresh-cw",
    description: "调整学习计划（延后/跳过/重分配）",
    quickPrompts: ["周日有事，把那天的计划延后一天", "今天的计划太多了，帮我重新分配"],
  },
  {
    name: "toggle_plan_freeze",
    category: "plan",
    icon: "snowflake",
    description: "冻结/解冻学习计划",
    quickPrompts: ["暂停我的 React 学习计划", "解冻算法学习计划"],
  },
  {
    name: "set_plan_priority",
    category: "plan",
    icon: "star",
    description: "调整计划优先级（1-5）",
    quickPrompts: ["把算法计划优先级提到最高", "降低前端计划的优先级"],
  },
  {
    name: "optimize_schedule",
    category: "plan",
    icon: "sparkles",
    description: "智能优化今日学习安排的优先级",
    quickPrompts: ["优化今天的日程顺序", "帮我安排今天该先学什么"],
  },

  // === 专注学习类 ===
  {
    name: "start_focus_session",
    category: "focus",
    icon: "zap",
    description: "启动番茄钟专注学习 session",
    quickPrompts: ["开始专注 25 分钟", "我要学 50 分钟算法"],
  },
  {
    name: "generate_learning_plan",
    category: "focus",
    icon: "lightbulb",
    description: "根据用户画像生成个性化学习计划",
    quickPrompts: ["帮我制定 4 周 React 学习计划", "生成一个 2 周算法计划，每天 1 小时"],
  },

  // === 提醒与复盘类 ===
  {
    name: "set_reminder",
    category: "assist",
    icon: "bell",
    description: "设置学习提醒（X 分钟后 / 指定时间）",
    quickPrompts: ["30分钟后提醒我学习", "晚上 8 点提醒我复习"],
  },
];

/** 按 ID 查找工具 */
export function getToolById(name: string): ToolMeta | undefined {
  return TOOL_REGISTRY.find((t) => t.name === name);
}

/** 获取所有工具的快捷指令（扁平数组） */
export function getToolQuickPrompts(): string[] {
  return TOOL_REGISTRY.flatMap((t) => t.quickPrompts);
}

/** 按分类分组工具 */
export function getToolsByCategory(categoryId: ToolCategoryId): ToolMeta[] {
  return TOOL_REGISTRY.filter((t) => t.category === categoryId);
}

/** 生成 system prompt 中的工具能力说明文本 */
export function buildToolSystemSuffix(): string {
  const lines: string[] = [
    "# AI 工具能力",
    "你拥有以下工具，可以根据用户意图主动调用：",
  ];
  for (const cat of TOOL_CATEGORIES) {
    const tools = getToolsByCategory(cat.id);
    lines.push(`\n## ${cat.label}`);
    for (const t of tools) {
      lines.push(`- ${t.name}：${t.description}`);
    }
  }
  lines.push(
    "\n调用工具时遵循：",
    "1. 优先用工具获取数据，再基于数据给出建议",
    "2. 一个回合可调用多个工具（maxSteps: 5）",
    "3. 调用工具后，用自然语言总结结果并给出建议",
  );
  return lines.join("\n");
}
