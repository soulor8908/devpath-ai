/**
 * 策展式课程内容层（L1）领域类型。
 *
 * 设计原则（见 docs/redesign）：
 * - Content-as-Code：内容以 YAML 形式存于 content/ 目录，版本化、可审查
 * - 权威 = 策展：每个技能节点必须挂载 ≥2 条 T0-T2 级权威来源
 * - LLM 是导师，不是教材：运行时 AI 基于本图谱做 RAG，而非即兴生成
 */

/** 权威来源等级：T0 一手规范 / T1 一手实现 / T2 权威工程实践 / T3 二手解读 */
export type SourceTier = "T0" | "T1" | "T2" | "T3";

export type SourceType =
  | "official-doc"
  | "spec"
  | "paper"
  | "canonical-repo"
  | "official-cookbook"
  | "engineering-blog"
  | "community-article";

/** 权威来源登记处条目（content/sources/registry.yaml） */
export interface SourceEntry {
  id: string;
  title: string;
  url: string;
  tier: SourceTier;
  type: SourceType;
  /** ISO 日期，最后一次人工验证该来源有效的时间 */
  lastVerified: string;
  note?: string;
}

/** 验证等级：V1 理解 / V2 应用 / V3 构建 / V4 交付 */
export type VerificationLevel = "V1" | "V2" | "V3" | "V4";

export type MasteryCheckType =
  | "fsrs-cards" // V1：FSRS 卡片
  | "code-challenge" // V2：沙箱代码题
  | "project-checkpoint" // V3：项目检查点（AI 按 Rubric 审查）
  | "portfolio-release"; // V4：作品集发布

/** 面试题（入库内容，非运行时生成） */
export interface InterviewQuestion {
  q: string;
  answerSkeleton: string;
  followups: string[];
}

/** 评分细则（V3/V4 验证用） */
export interface RubricCriterion {
  id: string;
  description: string;
  /** 权重，同一 Rubric 内权重之和必须为 100 */
  weight: number;
}

export interface Rubric {
  id: string;
  title: string;
  criteria: RubricCriterion[];
  /** 通过线（加权总分 0-100） */
  passScore: number;
}

/** 技能节点的验证方式 */
export interface MasteryCheck {
  level: VerificationLevel;
  type: MasteryCheckType;
  description: string;
  rubricId?: string;
}

/** 策展技能节点（content/graph/nodes/*.yaml 解析后的形状） */
export interface SkillNode {
  id: string;
  title: string;
  summary: string;
  /** 所属学习轨道 */
  tracks: string[];
  /** 阶段序号（0 起），轨道内分阶段展示用 */
  phase: number;
  /** 前置节点 id 列表（必须存在于图谱中） */
  prerequisites: string[];
  /** 预计学习时长（分钟） */
  estimatedMinutes: number;
  difficulty: 1 | 2 | 3 | 4 | 5;
  /** 前端迁移映射：该节点与前端已有技能的对应关系（第一性原理：利用已有资产） */
  frontendBridge?: string;
  /** 核心概念（含心智模型） */
  concepts: string[];
  /** 权威来源 id 列表，必须 ≥2 条且至少 1 条 T0/T1 */
  sourceIds: string[];
  /** 可运行实验（content/labs/ 下的相对路径） */
  lab?: string;
  /** 坑点（真实工程经验） */
  gotchas: string[];
  interview: InterviewQuestion[];
  masteryCheck: MasteryCheck;
  /** 内容状态：draft → reviewed → authoritative */
  status: "draft" | "reviewed" | "authoritative";
  /** ISO 日期，内容最后一次验证时间 */
  lastVerified: string;
}

/** 学习轨道中的一个阶段 */
export interface TrackPhase {
  index: number;
  title: string;
  goal: string;
}

/** 学习轨道（content/graph/tracks/*.yaml） */
export interface Track {
  id: string;
  title: string;
  description: string;
  /** 目标受众（如「前端工程师」） */
  audience: string;
  phases: TrackPhase[];
}

/** 编译产物：运行时消费的完整课程图谱（public/data/curriculum-graph.json） */
export interface CurriculumGraph {
  version: number;
  builtAt: string;
  sources: Record<string, SourceEntry>;
  nodes: SkillNode[];
  tracks: Track[];
  rubrics: Rubric[];
}

/** 路径引擎输入 */
export interface PathRequest {
  trackId: string;
  /** 入学评估认定为已掌握的节点 id（将被跳过） */
  knownNodeIds: string[];
  /** 每日可用分钟数 */
  dailyMinutes: number;
}

/** 排程后的单个学习日 */
export interface PathDay {
  day: number;
  nodeIds: string[];
  totalMinutes: number;
}

/** 路径引擎输出 */
export interface LearningPath {
  trackId: string;
  /** 拓扑排序后的待学节点（已剔除 knownNodeIds 及其传递闭包中无需重学的部分） */
  orderedNodeIds: string[];
  skippedNodeIds: string[];
  totalMinutes: number;
  totalDays: number;
  days: PathDay[];
}
