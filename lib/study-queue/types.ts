// lib/study-queue/types.ts
// 「学习+复习合并」第 1 阶段数据模型
//
// 设计思路（卡帕西视角）：
//   - 现有 /learn 与 /review 是两条独立路由，首页 KPI 也是分开统计
//     「今日待学 N / 今日待复习 N」。但用户真实的学习体验里，"新学"和"复习"
//     本就该在同一队列里被智能调度：低能量优先做复习，认知过载时避免连续
//     新内容，FSRS 到期卡片紧迫度高时插队。
//   - 第 1 阶段只做数据层：定义统一的 StudyTask（合并 new / review 两类）+
//     排序上下文 StudyQueueContext，配合 computePriority 纯函数排序。
//   - 严格"只读"：不写入 IndexedDB、不动 /learn /review 路由、不改 UI。
//     现有 KEY_PREFIXES.LEARN_LOG / REVIEW_LOG 仍是唯一事实源，本模块
//     只是把它们读出来聚合成 StudyTask[] 供未来 UI 消费。
//   - 类型独立放在 lib/study-queue/types.ts，不修改 lib/types.ts，避免破坏
//     现有 400+ 测试和上线数据。

/** 任务类型：新学 vs 复习 */
export type StudyTaskType = "new" | "review";

/** 任务状态机：todo → doing → done | skipped */
export type StudyTaskStatus = "todo" | "doing" | "done" | "skipped";

/**
 * 统一学习任务（合并 learn + review）
 *
 * 字段约定：
 *   - type === "new"    → nodeId / topic / estimatedMinutes 有值
 *   - type === "review" → cardId / dueDate / stability / retrievability 有值
 *   - title / priority / reason / status 在两种类型下都有值
 *
 * 字段是「可选 + 联合」而非「联合类型」，是为了让排序算法可以一次性处理
 * 同一个数组（避免 type narrowing 反复），同时让消费方知道哪些字段是哪类
 * 任务的"专属字段"。
 */
export interface StudyTask {
  /** 任务 id（nanoid 生成，仅本次队列会话内有效，不入库） */
  id: string;
  /** "YYYY-MM-DD"（中国时区，由 chinaDateNow 生成） */
  date: string;
  type: StudyTaskType;

  // ---- new 类型专属字段（type === "new" 时填）----
  /** 关联的计划 id（LearningPlan.id），用于跳转到 /learn/{planId} */
  planId?: string;
  /** 关联的知识点 id（对应 KnowledgeNode.id） */
  nodeId?: string;
  /** 主题（LearnLog 没有直接字段，从计划 topic 或节点 title 衍生） */
  topic?: string;
  /** 预计耗时（分钟，来自 ScheduleItem.estimatedMinutes） */
  estimatedMinutes?: number;

  // ---- review 类型专属字段（type === "review" 时填）----
  /** 关联 FSRS 卡片 id */
  cardId?: string;
  /** 卡片到期时间 ISO（对应 ReviewCard.due） */
  dueDate?: string;
  /** FSRS stability（天），稳定性低 = 易忘 = 紧迫 */
  stability?: number;
  /** FSRS 可提取性 0-1（retrievability，未来用于排序细化） */
  retrievability?: number;

  // ---- 共享字段 ----
  /** 显示用标题，如「复习 - React Fiber」「新学 - 闭包」 */
  title: string;
  /** 优先级 0-100，越大越先做（由 computePriority 计算） */
  priority: number;
  /** 可解释性字符串（由 explainPriority.reasons 拼接而成） */
  reason: string;
  status: StudyTaskStatus;
  /** 创建时间 ISO */
  createdAt: string;
  /** 开始时间 ISO（status === "doing" 时填） */
  startedAt?: string;
  /** 完成时间 ISO（status === "done" 时填） */
  completedAt?: string;
}

/**
 * 排序上下文：用户当前状态
 *
 * 这三个维度共同决定同一天内任务的相对优先级：
 *   - energy：低能量时优先做复习（认知负担小）
 *   - dopamine：高干扰日避免开新内容（容易分心）
 *   - lastTaskType：避免连续 new 内容认知过载
 */
export interface StudyQueueContext {
  /** 当前能量 1-5，默认 3（取自 DailyStatus.energy） */
  energy: number;
  /** 今日多巴胺干扰源，"无" 表示无干扰（取自 DailyStatus.dopamineTrigger） */
  dopamine: "无" | "刷手机" | "社交媒体" | "游戏" | "短视频" | string;
  /** 上一项任务类型（用于避免连续 new 内容认知过载），首轮无 */
  lastTaskType?: StudyTaskType;
}
