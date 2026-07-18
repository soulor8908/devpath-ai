// lib/ai/chat-tools.ts
// AI 聊天工具定义：8 个工具让 AI 能查看用户状态、创建提醒、调整学习计划
//
// 架构：
// - 只读工具（get_*）：execute 在服务端执行，直接从 toolContext 返回数据
// - 写入工具（set_*/toggle_*/adjust_*）：execute 返回 clientAction 描述符，
//   客户端在流结束后解析并执行实际 IndexedDB 操作
//
// 工具列表：
// 1. get_daily_schedule    — 获取今日时间表（routine + 学习计划）
// 2. get_next_task         — 接下来该干什么
// 3. set_reminder          — 设置提醒（X 分钟后 / 指定时间）
// 4. review_today          — 复盘今天表现
// 5. get_upcoming_plan     — 未来几天的学习计划
// 6. adjust_plan           — 调整学习计划（如周日有事，延后/跳过/重新分配）
// 7. toggle_plan_freeze    — 冻结/解冻学习计划
// 8. set_plan_priority     — 调整学习计划优先级

import { tool } from "ai";
import { z } from "zod";

// ============ ToolContext：客户端传来的结构化上下文 ============

export interface PlanContextItem {
  id: string;
  topic: string;
  frozen: boolean;
  priority: number;
  dailyMinutes: number;
  maxNewPerDay: number;
  totalNodes: number;
  completedNodes: number;
  currentNodeTitle?: string;
  /** 未来 N 天的日程（day → 任务列表） */
  upcomingSchedule: Array<{
    day: number;
    date: string;
    tasks: Array<{
      nodeId: string;
      nodeTitle: string;
      type: "learn" | "review";
      estimatedMinutes: number;
      completed: boolean;
    }>;
  }>;
}

export interface ToolContext {
  /** 所有学习计划（包括冻结的，标注 frozen） */
  plans: PlanContextItem[];
  /** 今日学习日志 */
  todayLearnLogs: Array<{
    type: string;
    nodeTitle?: string;
    timestamp?: string;
  }>;
  /** 今日复习记录 */
  todayReviewCount: number;
  /** 今日状态 */
  todayStatus?: {
    energy: number;
    mood: string;
    availableMinutes: number;
  };
  /** 用户作息时间表 */
  routine?: {
    wakeTime: string;
    sleepTime: string;
    slots: Array<{
      label: string;
      start: string;
      end: string;
      minutes: number;
    }>;
    weekdays: number[];
    intensity: string;
  };
  /** 当前时间 ISO */
  now: string;
  /** 未触发的提醒 */
  pendingReminders: Array<{
    id: string;
    title: string;
    scheduledFor: string;
  }>;
  /** 最近错题 */
  recentMistakes: string[];
}

/** 写入工具返回的客户端动作描述符 */
export interface ClientAction {
  type:
    | "create_reminder"
    | "adjust_plan"
    | "toggle_plan_freeze"
    | "set_plan_priority"
    | "start_focus_session"
    | "reorder_schedule"
    | "generate_plan";
  params: Record<string, unknown>;
  /**
   * 幂等键：基于 action.type + params 内容自动计算
   * - 客户端在执行前检查此 key 是否已记录（24h TTL）
   * - 已记录 → 跳过执行（防止流式响应重试导致重复写入）
   * - 未记录 → 执行成功后写入此 key 标记完成
   * - 失败时不写入，允许后续重试
   */
  idempotencyKey: string;
}

/** 工具执行结果 */
interface ToolResult {
  success: boolean;
  message: string;
  data?: unknown;
  /** 客户端需要执行的动作（仅写入工具） */
  clientAction?: ClientAction;
}

// ============ 辅助函数 ============

/** 获取今天是星期几（1=周一 ... 7=周日） */
function getTodayWeekday(now: string): number {
  const d = new Date(now).getDay();
  return d === 0 ? 7 : d;
}

/** 格式化时间为 HH:MM */
function formatTime(iso: string): string {
  const d = new Date(iso);
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

/**
 * 基于 action.type + params 内容生成幂等键
 * 同一个 (type, params) 总是产生相同的 key，客户端可据此去重
 * 使用 djb2 hash（不需要密码学强度，只需稳定 + 低冲突率）
 */
function makeIdempotencyKey(
  type: ClientAction["type"],
  params: Record<string, unknown>,
): string {
  const content = `${type}:${JSON.stringify(params)}`;
  let hash = 5381;
  for (let i = 0; i < content.length; i++) {
    hash = (hash << 5) + hash + content.charCodeAt(i); // hash * 33 + c
    hash = hash & 0xffffffff; // 32-bit 截断
  }
  return `idem:${(hash >>> 0).toString(16)}`;
}

// ============ 8 个工具定义 ============

/**
 * 创建所有聊天工具
 * @param ctx 客户端传来的结构化上下文
 */
export function createChatTools(ctx: ToolContext) {
  return {
    // 1. 获取今日时间表
    get_daily_schedule: tool({
      description:
        '获取用户今日的完整时间表，包括作息 routine 和学习计划安排。当用户问"今天有什么安排"、"今日时间表"时调用。',
      parameters: z.object({}),
      execute: async () => {
        const now = new Date(ctx.now);
        const todayWeekday = getTodayWeekday(ctx.now);
        const isLearningDay = ctx.routine?.weekdays?.includes(todayWeekday) ?? true;

        const result: ToolResult = {
          success: true,
          message: "今日时间表",
          data: {
            date: now.toISOString().slice(0, 10),
            weekday: todayWeekday,
            isLearningDay,
            wakeTime: ctx.routine?.wakeTime,
            sleepTime: ctx.routine?.sleepTime,
            routineSlots: ctx.routine?.slots ?? [],
            intensity: ctx.routine?.intensity,
            todayPlanSchedule: ctx.plans
              .filter((p) => !p.frozen)
              .map((p) => ({
                topic: p.topic,
                priority: p.priority,
                dailyMinutes: p.dailyMinutes,
                currentNode: p.currentNodeTitle,
                todayTasks: p.upcomingSchedule[0]?.tasks ?? [],
              })),
            todayLearnLogs: ctx.todayLearnLogs,
            todayReviewCount: ctx.todayReviewCount,
            todayStatus: ctx.todayStatus,
          },
        };
        return result;
      },
    }),

    // 2. 接下来该干什么
    get_next_task: tool({
      description:
        '根据用户当前时间、作息和学习计划，推荐接下来该做什么。当用户问"接下来学什么"、"现在该干什么"、"下一步"时调用。',
      parameters: z.object({}),
      execute: async () => {
        const currentTime = formatTime(ctx.now);
        const todayWeekday = getTodayWeekday(ctx.now);
        const isLearningDay = ctx.routine?.weekdays?.includes(todayWeekday) ?? true;

        // 找当前 routine 时段
        let currentSlot: { label: string; end: string } | null = null;
        let nextSlot: { label: string; start: string } | null = null;
        if (ctx.routine?.slots) {
          for (const slot of ctx.routine.slots) {
            if (currentTime >= slot.start && currentTime < slot.end) {
              currentSlot = { label: slot.label, end: slot.end };
            } else if (currentTime < slot.start) {
              if (!nextSlot) nextSlot = { label: slot.label, start: slot.start };
            }
          }
        }

        // 找未完成计划中优先级最高（数字最小）的
        const activePlans = ctx.plans
          .filter((p) => !p.frozen)
          .sort((a, b) => a.priority - b.priority);
        const nextPlan = activePlans[0];

        // 检查能量
        const energy = ctx.todayStatus?.energy;
        const energyLow = energy !== undefined && energy <= 2;

        const result: ToolResult = {
          success: true,
          message: "接下来建议",
          data: {
            currentTime,
            isLearningDay,
            currentRoutineSlot: currentSlot,
            nextRoutineSlot: nextSlot,
            energy,
            energyLow,
            recommendedPlan: nextPlan
              ? {
                  topic: nextPlan.topic,
                  priority: nextPlan.priority,
                  currentNode: nextPlan.currentNodeTitle,
                  dailyMinutes: nextPlan.dailyMinutes,
                }
              : null,
            todayCompleted: ctx.todayLearnLogs.length,
            pendingReminders: ctx.pendingReminders.length,
            suggestion: energyLow
              ? "能量较低，建议先休息或做轻度复习，指引用户去 /rest"
              : nextPlan
                ? `建议继续学习「${nextPlan.topic}」${nextPlan.currentNodeTitle ? `，当前节点：${nextPlan.currentNodeTitle}` : ""}`
                : "暂无活跃学习计划，建议创建新计划或复习错题",
          },
        };
        return result;
      },
    }),

    // 3. 设置提醒
    set_reminder: tool({
      description:
        '设置一个提醒，到时间后通过浏览器通知提醒用户。当用户说"X分钟后提醒我..."、"提醒我..."时调用。支持相对时间（minutesFromNow）或绝对时间（scheduledFor 为 ISO 字符串）。',
      parameters: z.object({
        title: z.string().describe('提醒标题，如"该学习React了"'),
        minutesFromNow: z
          .number()
          .optional()
          .describe("几分钟后提醒（与 scheduledFor 二选一）"),
        scheduledFor: z
          .string()
          .optional()
          .describe("ISO 时间字符串，如 2024-01-15T14:30:00Z（与 minutesFromNow 二选一）"),
        body: z.string().optional().describe("提醒详细内容"),
      }),
      execute: async (args) => {
        const scheduledFor =
          args.scheduledFor ??
          (args.minutesFromNow
            ? new Date(Date.now() + args.minutesFromNow * 60_000).toISOString()
            : null);

        if (!scheduledFor) {
          return {
            success: false,
            message: "必须提供 minutesFromNow 或 scheduledFor 之一",
          } as ToolResult;
        }

        const triggerTime = new Date(scheduledFor);
        const displayTime = `${triggerTime.getHours().toString().padStart(2, "0")}:${triggerTime.getMinutes().toString().padStart(2, "0")}`;

        return {
          success: true,
          message: `已创建提醒「${args.title}」，将在 ${displayTime} 触发`,
          clientAction: {
            type: "create_reminder" as const,
            params: {
              title: args.title,
              scheduledFor,
              body: args.body,
            },
            idempotencyKey: makeIdempotencyKey("create_reminder", {
              title: args.title,
              scheduledFor,
              body: args.body,
            }),
          },
        } as ToolResult;
      },
    }),

    // 4. 复盘今天表现
    review_today: tool({
      description:
        '获取今天的完整学习表现数据，供 AI 进行复盘分析。当用户说"复盘今天"、"今天表现怎么样"、"总结一下今天"时调用。',
      parameters: z.object({}),
      execute: async () => {
        const todayLogs = ctx.todayLearnLogs;
        const learnCount = todayLogs.filter((l) => l.type === "learn" || l.type === "learn_complete").length;
        const reviewCount = ctx.todayReviewCount;
        const energy = ctx.todayStatus?.energy;
        const availableMin = ctx.todayStatus?.availableMinutes;

        // 统计各计划今日进度
        const planProgress = ctx.plans
          .filter((p) => !p.frozen)
          .map((p) => ({
            topic: p.topic,
            todayTasks: p.upcomingSchedule[0]?.tasks ?? [],
            completedToday: (p.upcomingSchedule[0]?.tasks ?? []).filter((t) => t.completed).length,
            totalToday: (p.upcomingSchedule[0]?.tasks ?? []).length,
          }));

        return {
          success: true,
          message: "今日复盘数据",
          data: {
            date: new Date(ctx.now).toISOString().slice(0, 10),
            learnCount,
            reviewCount,
            energy,
            mood: ctx.todayStatus?.mood,
            availableMinutes: availableMin,
            planProgress,
            recentMistakes: ctx.recentMistakes.slice(0, 5),
            pendingReminders: ctx.pendingReminders.length,
            summary: `今天学习了 ${learnCount} 个知识点，复习了 ${reviewCount} 道题，能量 ${energy ?? "?"}/5`,
          },
        } as ToolResult;
      },
    }),

    // 5. 获取未来几天的计划
    get_upcoming_plan: tool({
      description:
        '获取未来几天的学习计划安排。当用户问"未来几天有什么计划"、"下周学什么"、"接下来的安排"时调用。',
      parameters: z.object({
        days: z
          .number()
          .optional()
          .default(7)
          .describe("查看未来几天（默认7天）"),
      }),
      execute: async (args) => {
        const days = args.days ?? 7;
        const upcoming = ctx.plans
          .filter((p) => !p.frozen)
          .flatMap((p) =>
            p.upcomingSchedule.slice(0, days).map((s) => ({
              topic: p.topic,
              priority: p.priority,
              day: s.day,
              date: s.date,
              tasks: s.tasks,
              totalMinutes: s.tasks.reduce((sum, t) => sum + t.estimatedMinutes, 0),
            })),
          )
          .sort((a, b) => a.date.localeCompare(b.date));

        return {
          success: true,
          message: `未来 ${days} 天计划`,
          data: {
            days,
            schedule: upcoming,
            frozenPlans: ctx.plans
              .filter((p) => p.frozen)
              .map((p) => ({ topic: p.topic, priority: p.priority })),
          },
        } as ToolResult;
      },
    }),

    // 6. 调整学习计划
    adjust_plan: tool({
      description:
        '调整学习计划的日程安排。当用户说"周日有事帮我调整计划"、"那天没空延后一下"、"跳过那天的学习"时调用。支持延后（delay）、跳过（skip）、重新分配（redistribute）。',
      parameters: z.object({
        planId: z.string().describe("要调整的计划 ID"),
        action: z
          .enum(["delay", "skip", "redistribute"])
          .describe("delay=延后一天, skip=跳过该天任务, redistribute=将任务分摊到其他天"),
        targetDay: z
          .number()
          .optional()
          .describe("要调整的第几天（plan schedule 的 day 字段）"),
        reason: z.string().optional().describe('调整原因（如"周日有事"）'),
      }),
      execute: async (args) => {
        const plan = ctx.plans.find((p) => p.id === args.planId);
        if (!plan) {
          return {
            success: false,
            message: `未找到计划 ID: ${args.planId}。可用计划：${ctx.plans.map((p) => `${p.id}(${p.topic})`).join(", ")}`,
          } as ToolResult;
        }
        if (plan.frozen) {
          return {
            success: false,
            message: `计划「${plan.topic}」已冻结，请先解冻再调整`,
          } as ToolResult;
        }

        const actionLabel = {
          delay: "延后一天",
          skip: "跳过该天",
          redistribute: "重新分配到其他天",
        }[args.action];

        return {
          success: true,
          message: `已将计划「${plan.topic}」第 ${args.targetDay ?? "??"} 天的任务${actionLabel}${args.reason ? `（原因：${args.reason}）` : ""}`,
          clientAction: {
            type: "adjust_plan" as const,
            params: {
              planId: args.planId,
              action: args.action,
              targetDay: args.targetDay,
              reason: args.reason,
            },
            idempotencyKey: makeIdempotencyKey("adjust_plan", {
              planId: args.planId,
              action: args.action,
              targetDay: args.targetDay,
            }),
          },
        } as ToolResult;
      },
    }),

    // 7. 冻结/解冻学习计划
    toggle_plan_freeze: tool({
      description:
        '冻结或解冻学习计划。冻结后计划不计入每日调度和 AI 推荐。当用户说"暂停这个计划"、"冻结一下"、"先不学这个了"或"恢复这个计划"、"解冻"时调用。',
      parameters: z.object({
        planId: z.string().describe("要冻结/解冻的计划 ID"),
        freeze: z.boolean().describe("true=冻结, false=解冻"),
      }),
      execute: async (args) => {
        const plan = ctx.plans.find((p) => p.id === args.planId);
        if (!plan) {
          return {
            success: false,
            message: `未找到计划 ID: ${args.planId}。可用计划：${ctx.plans.map((p) => `${p.id}(${p.topic})`).join(", ")}`,
          } as ToolResult;
        }

        return {
          success: true,
          message: args.freeze
            ? `已冻结计划「${plan.topic}」，暂停每日调度`
            : `已解冻计划「${plan.topic}」，恢复每日调度`,
          clientAction: {
            type: "toggle_plan_freeze" as const,
            params: {
              planId: args.planId,
              freeze: args.freeze,
            },
            idempotencyKey: makeIdempotencyKey("toggle_plan_freeze", {
              planId: args.planId,
              freeze: args.freeze,
            }),
          },
        } as ToolResult;
      },
    }),

    // 8. 调整学习计划优先级
    set_plan_priority: tool({
      description:
        '调整学习计划的优先级（1=最高, 5=最低）。多计划并存时，AI 按优先级推荐。当用户说"这个优先级调高"、"先学这个"、"降低这个计划的优先级"时调用。',
      parameters: z.object({
        planId: z.string().describe("要调整优先级的计划 ID"),
        priority: z
          .number()
          .min(1)
          .max(5)
          .describe("优先级 1-5（1=最高, 5=最低）"),
      }),
      execute: async (args) => {
        const plan = ctx.plans.find((p) => p.id === args.planId);
        if (!plan) {
          return {
            success: false,
            message: `未找到计划 ID: ${args.planId}。可用计划：${ctx.plans.map((p) => `${p.id}(${p.topic})`).join(", ")}`,
          } as ToolResult;
        }

        const oldPriority = plan.priority;
        return {
          success: true,
          message: `已将计划「${plan.topic}」的优先级从 ${oldPriority} 调整为 ${args.priority}`,
          clientAction: {
            type: "set_plan_priority" as const,
            params: {
              planId: args.planId,
              priority: args.priority,
            },
            idempotencyKey: makeIdempotencyKey("set_plan_priority", {
              planId: args.planId,
              priority: args.priority,
            }),
          },
        } as ToolResult;
      },
    }),

    // 9. 启动番茄时钟专注学习 session
    start_focus_session: tool({
      description:
        '启动番茄时钟专注学习 session。当用户说"开始专注"、"开始学习"、"启动番茄钟"、"我要学 25 分钟"时调用。',
      parameters: z.object({
        task_description: z.string().describe("本次专注的任务描述，如「学习 React Hooks」"),
        duration_minutes: z
          .number()
          .default(25)
          .describe("专注时长（分钟），默认 25"),
        plan_id: z.string().optional().describe("关联学习计划 ID（可选）"),
        node_id: z.string().optional().describe("关联知识点 ID（可选）"),
      }),
      execute: async (args) => {
        return {
          success: true,
          message: `已启动番茄钟（${args.duration_minutes} 分钟）：${args.task_description}`,
          clientAction: {
            type: "start_focus_session" as const,
            params: {
              task_description: args.task_description,
              duration_minutes: args.duration_minutes,
              plan_id: args.plan_id,
              node_id: args.node_id,
            },
            idempotencyKey: makeIdempotencyKey("start_focus_session", args),
          },
        } as ToolResult;
      },
    }),

    // 10. 根据用户画像生成个性化学习计划
    generate_learning_plan: tool({
      description:
        '根据用户画像生成个性化学习计划。当用户说"帮我制定学习计划"、"生成 React 学习计划"、"我想 4 周学完算法"时调用。',
      parameters: z.object({
        goal: z.string().describe("学习目标，如「掌握 React 基础」"),
        duration_weeks: z.number().describe("计划周期（周）"),
        constraints: z
          .object({
            hours_per_week: z.number().describe("每周可投入小时数"),
            preferred_times: z.array(z.string()).optional().describe("偏好学习时段，如 [\"06:00-06:59\"]"),
          })
          .describe("时间约束"),
      }),
      execute: async (args) => {
        return {
          success: true,
          message: `已生成学习计划：目标「${args.goal}」，周期 ${args.duration_weeks} 周`,
          clientAction: {
            type: "generate_plan" as const,
            params: args,
            idempotencyKey: makeIdempotencyKey("generate_plan", args),
          },
        } as ToolResult;
      },
    }),

    // 11. 智能优化今日学习安排的优先级
    optimize_schedule: tool({
      description:
        '智能优化今日学习安排的优先级。当用户说"帮我安排今天的顺序"、"优化今日日程"、"今天该先学什么"时调用。',
      parameters: z.object({
        date: z.string().describe("日期 YYYY-MM-DD"),
        mode: z
          .enum(["balanced", "catch_up", "light"])
          .optional()
          .describe("优化模式：balanced=均衡, catch_up=追赶进度, light=轻量"),
      }),
      execute: async (args) => {
        return {
          success: true,
          message: `已优化 ${args.date} 的日程优先级${args.mode ? `（模式：${args.mode}）` : ""}`,
          clientAction: {
            type: "reorder_schedule" as const,
            params: args,
            idempotencyKey: makeIdempotencyKey("reorder_schedule", args),
          },
        } as ToolResult;
      },
    }),
  };
}

/** 写入工具的客户端执行函数类型 */
export type ClientActionExecutor = (action: ClientAction) => Promise<void>;
