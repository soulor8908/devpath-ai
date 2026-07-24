import { z } from "zod";

import type {
  InterviewQuestion,
  MasteryCheck,
  Rubric,
  SourceEntry,
  SkillNode,
  Track,
} from "@/lib/types/curriculum";

/**
 * content/ 目录 YAML 文件的 zod 校验 Schema。
 *
 * 校验分两层：
 * 1. 结构校验（本文件，zod）：单个文件形状是否合法
 * 2. 图谱校验（graph.ts）：跨文件引用是否自洽（前置存在、来源存在、无环、权威等级达标）
 */

const isoDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "必须是 YYYY-MM-DD 格式的日期");

const nodeId = z
  .string()
  .regex(
    /^[a-z][a-z0-9-]*(\.[a-z][a-z0-9-]*)+$/,
    "节点 id 必须是点分层级格式，如 rag.chunking-strategies",
  );

const sourceId = z
  .string()
  .regex(/^[a-z][a-z0-9-]*$/, "来源 id 必须是 kebab-case");

export const sourceTierSchema = z.enum(["T0", "T1", "T2", "T3"]);

export const sourceEntrySchema = z.object({
  id: sourceId,
  title: z.string().min(1),
  url: z.string().url(),
  tier: sourceTierSchema,
  type: z.enum([
    "official-doc",
    "spec",
    "paper",
    "canonical-repo",
    "official-cookbook",
    "engineering-blog",
    "community-article",
  ]),
  lastVerified: isoDate,
  note: z.string().optional(),
}) satisfies z.ZodType<SourceEntry>;

/** registry.yaml 的顶层结构 */
export const sourceRegistrySchema = z.object({
  sources: z.array(sourceEntrySchema).min(1),
});

export const interviewQuestionSchema = z.object({
  q: z.string().min(1),
  answerSkeleton: z.string().min(1),
  followups: z.array(z.string().min(1)).min(1),
}) satisfies z.ZodType<InterviewQuestion>;

export const rubricCriterionSchema = z.object({
  id: z.string().min(1),
  description: z.string().min(1),
  weight: z.number().int().min(1).max(100),
});

export const rubricSchema = z.object({
  id: z.string().regex(/^[a-z][a-z0-9-]*$/, "Rubric id 必须是 kebab-case"),
  title: z.string().min(1),
  criteria: z.array(rubricCriterionSchema).min(1),
  passScore: z.number().int().min(1).max(100),
}) satisfies z.ZodType<Rubric>;

export const masteryCheckSchema = z.object({
  level: z.enum(["V1", "V2", "V3", "V4"]),
  type: z.enum([
    "fsrs-cards",
    "code-challenge",
    "project-checkpoint",
    "portfolio-release",
  ]),
  description: z.string().min(1),
  rubricId: z.string().optional(),
}) satisfies z.ZodType<MasteryCheck>;

export const skillNodeSchema = z.object({
  id: nodeId,
  title: z.string().min(1),
  summary: z.string().min(1),
  tracks: z.array(z.string().min(1)).min(1),
  phase: z.number().int().min(0),
  prerequisites: z.array(nodeId),
  estimatedMinutes: z.number().int().min(5),
  difficulty: z.union([
    z.literal(1),
    z.literal(2),
    z.literal(3),
    z.literal(4),
    z.literal(5),
  ]),
  frontendBridge: z.string().optional(),
  concepts: z.array(z.string().min(1)).min(1),
  sourceIds: z.array(sourceId).min(2, "每个节点至少挂载 2 条权威来源"),
  lab: z.string().optional(),
  gotchas: z.array(z.string().min(1)),
  interview: z.array(interviewQuestionSchema).min(1),
  masteryCheck: masteryCheckSchema,
  status: z.enum(["draft", "reviewed", "authoritative"]),
  lastVerified: isoDate,
}) satisfies z.ZodType<SkillNode>;

export const trackPhaseSchema = z.object({
  index: z.number().int().min(0),
  title: z.string().min(1),
  goal: z.string().min(1),
});

export const trackSchema = z.object({
  id: z.string().regex(/^[a-z][a-z0-9-]*$/, "轨道 id 必须是 kebab-case"),
  title: z.string().min(1),
  description: z.string().min(1),
  audience: z.string().min(1),
  phases: z.array(trackPhaseSchema).min(1),
}) satisfies z.ZodType<Track>;

/** tracks/*.yaml 的顶层结构（单文件单轨道） */
export const trackFileSchema = z.object({
  track: trackSchema,
});

/** rubrics/*.yaml 的顶层结构 */
export const rubricFileSchema = z.object({
  rubric: rubricSchema,
});

export type ParsedSourceRegistry = z.infer<typeof sourceRegistrySchema>;
