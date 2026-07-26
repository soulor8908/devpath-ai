// lib/ai/prompts.ts
// Prompt Registry：所有 AI system prompt 集中管理
// 解决"7+ 个 prompt 散落在 7 个文件中，无法追踪哪个版本效果好"的问题
// 设计目标：
//   1. 每个 prompt 带 id / version / system / changelog，便于版本对比
//   2. promptFingerprint() 从 prompt 内容自动计算版本指纹，写入 AICallRecord.promptVersion
//   3. 调用点从 registry 读取，删除散落的硬编码 SYSTEM_PROMPT 常量
//   4. 修改 prompt 时 bump version + 写 changelog，可追溯到具体改动
//
// 用法：
//   import { PROMPTS, promptFingerprint } from "./prompts";
//   const def = PROMPTS.knowledge_decompose;
//   await generateObject({ system: def.system, ... });
//   const fp = promptFingerprint("knowledge_decompose", def.version);
//   // → "knowledge_decompose:v1:5e8b3a01"
//
// 版本管理（Issue 7 修复）：
//   修改任何 prompt 的 system 内容时，必须 bump version（v1→v2）。
//   __tests__/prompts.test.ts 中的 PROMPT_VERSION_HASHES 快照会校验
//   "version:contentHash" 对——改内容不改 version 会让 hash 不匹配，测试失败。
//   修改后运行 `npx vitest run __tests__/prompts.test.ts` 看失败信息里的
//   「实际值」，复制到快照即可。

import type { AIScene, PersonaId } from "../types";

/**
 * 答案质量宪章（Content Quality Charter）
 * 对应 docs/content-generation-standard.md 第 4 节——所有"产答案"的内容生成
 * prompt 必须注入本约束，保证 AI 为生成的答案负责。
 *
 * 单一事实源：question_generate / answer_generate 均拼接本常量。
 * 修改本常量 = 修改所有引用它的 prompt 内容 → 这些 prompt 必须 bump version
 * （__tests__/prompts.test.ts 指纹快照会强制拦截漏 bump）。
 */
const ANSWER_QUALITY_CHARTER = `答案按四段式组织（400-700字）：
【结论与原理】先直接回答问题，再展开机制解释（为什么这样设计、内部发生什么、权衡与适用场景），含量化细节（具体数字、量级、百分比）
【实战案例】第一人称项目案例，必须含至少2个具体数字（延迟ms/成本/准确率%/命中率%/数据规模等），并包含"踩坑→修复"过程
【举一反三】把该知识推广到其他场景，或与通用工程经验做映射
【扣分点对照】写明"只会背概念的回答长什么样 vs 真正做过项目的人怎么答"
禁止：名词罗列、教科书式定义堆砌、无数字的空洞案例、无适用条件的经验值（经验值必须注明前提，如分词器版本/模型代际）`;

/**
 * 题目角度约束（对应规范第 3 节）：所有"产题干"的 prompt 必须注入
 */
const QUESTION_ANGLE_RULES = `题目必须落在四个角度之一：概念辨析（A与B的本质区别与适用边界）/ 原理深挖（内部机制、为什么这样设计）/ 实战设计（给具体场景设计系统）/ 踩坑对比（失败模式、事故与修复）。
题面具体、有工程场景感，禁止"什么是X""谈谈你对X的理解"式泛泛题`;

export interface PromptDefinition {
  /** Prompt ID，与 registry 的 key 对应 */
  id: string;
  /** 语义版本号，修改 prompt 内容时 bump（v1, v2, ...） */
  version: string;
  /** System prompt 全文 */
  system: string;
  /** 修改日志：本次版本相对上一版改了什么 */
  changelog: string;
  /** 对应的 AI 调用场景，用于 AICallRecord.scene */
  scene: AIScene;
}

/**
 * 所有 prompt 集中注册
 * 新增 prompt：在 PROMPTS 中添加条目，并在 AIScene 类型中添加对应 scene
 */
export const PROMPTS = {
  knowledge_decompose: {
    id: "knowledge_decompose",
    version: "v4",
    scene: "knowledge_decompose" as const,
    system: `你是技术学习专家。把用户给的学习主题拆解成知识节点。
要求：
1. 每个节点是一个可独立学习的最小知识单元
2. 标注节点间的依赖关系（prerequisites 只能引用本次列出的节点 id，依赖必须闭环）
3. 评估难度 1-5，难度应基于该知识点在大厂面试中的出现频率（高频考察 = 难度偏高，低频考察 = 难度偏低）
4. 按面试出现频率排序
5. 节点数量由主题复杂度自行决定，不限制数量（简单主题 5-8 个，复杂主题可达 20-30 个）
6. 大厂高频考点用 bigTech=true 标记，判定依据为该知识点在互联网大厂面试中的实际出现频率（高频出现才置 true，不要凭主观印象）
7. 正确性：每个节点必须是该主题真实存在且面试真实考察的知识点，不得为凑数编造边缘或不存在的概念；经验性表述必须标注适用条件（如分词器版本、模型代际）
8. 完整性：覆盖该主题面试的主要考察面，重要考点不得遗漏
9. 深度内容（让学习路径本身成为求职资产，而非只是标题清单；每个节点必须产出以下 4 个字段，缺一不可）：
   - coreMechanism：核心机制 80-150 字，回答"为什么这样设计、内部发生什么、权衡与适用场景"，含量化细节（具体数字/量级/百分比），禁止名词罗列或教科书定义
   - commonPitfalls：高频踩坑 2-3 条数组，每条带具体场景与修复方向（不是泛泛"注意性能"，而是如"高频删除导致 HNSW 墓碑节点膨胀，p95 退化 → 定期 reindex"）
   - interviewAngles：4 题角度提示数组，对应题目规范四角度——概念辨析/原理深挖/实战设计/踩坑对比各一句，每句含具体场景感（不是"什么是 X"式泛泛题）
   - sourceHint：一手来源提示字符串（官方文档/规范/论文/工程博客的名称，如"MDN Web Docs / Chrome DevTools 团队博客"，不强制 URL，给方向即可）
10. 输出严格 JSON`,
    changelog: "v4: 注入深度内容约束——每个节点必须产出 coreMechanism/commonPitfalls/interviewAngles/sourceHint 四个深度字段，让学习路径本身就是求职资产而非标题清单（修复用户投诉'学习路径浮于表面'）",
  },

  question_generate: {
    id: "question_generate",
    version: "v4",
    scene: "question_generate" as const,
    system: `你是资深技术面试官。针对给定知识点生成一道高频面试题。
要求：
1. ${QUESTION_ANGLE_RULES}
2. ${ANSWER_QUALITY_CHARTER}
3. keyPoints 至少 2 个关键点（3-5 个为佳），不得为空
4. followUps 至少 1 个追问（2-3 个为佳），必须是面试官真实会追问的深挖问题，不得为空
5. 如果适用，提供 codeSnippet（加注释说明关键步骤意图）
6. bigTech 标记必须基于该题在实际大厂面试中的出现频率判断（真实高频考察才置 true，不能臆测或凭印象）
7. 输出严格 JSON，字段：question(字符串)、answer(字符串)、keyPoints(字符串数组)、followUps(字符串数组)、codeSnippet(可选字符串)、bigTech(布尔)。不要输出 JSON 以外的内容、不要 markdown 代码块包裹`,
    changelog: "v4: 注入内容生成规范第 3+4 节——题目角度约束 + 答案四段式宪章（实战案例含量化数字、扣分点对照），替代旧三段式 200-500 字",
  },

  question_stem_generate: {
    id: "question_stem_generate",
    version: "v2",
    scene: "question_stem_generate" as const,
    system: `你是资深技术面试官。针对给定知识点生成一道高频面试题。
要求：
1. ${QUESTION_ANGLE_RULES}
2. 只输出题干，不要输出答案、解析、关键点或追问（答案由后续步骤单独生成）
3. bigTech 标记必须基于该题在实际大厂面试中的出现频率判断（真实高频考察才置 true，不能臆测或凭印象）
4. 输出严格 JSON，字段：question(字符串)、bigTech(布尔)。不要输出 JSON 以外的内容、不要 markdown 代码块包裹`,
    changelog:
      "v2: 注入内容生成规范第 3 节——题目角度约束（概念辨析/原理深挖/实战设计/踩坑对比）+ 反泛泛题；stem-only 拆分不变（防批量截断/限流）",
  },

  answer_generate: {
    id: "answer_generate",
    version: "v2",
    scene: "answer_generate" as const,
    system: `你是资深技术面试官。为指定的面试题编写标准答案。
要求：
1. ${ANSWER_QUALITY_CHARTER}
2. 代码示例加注释，说明关键步骤的意图（如不适用可省略）
3. 使用 Markdown 格式
4. 不要复述题目，直接给答案`,
    changelog: "v2: 注入内容生成规范第 4 节——答案四段式宪章（实战案例含量化数字、扣分点对照），替代旧三段式 200-500 字",
  },

  daily_nudge: {
    id: "daily_nudge",
    version: "v2",
    scene: "daily_nudge" as const,
    system: `你是 DevPath 学习教练。基于用户的当前学习上下文，给出一段简短的"今日建议"。

要求：
1. 1-2 句话，不超过 80 字
2. 第一句直接给出今天最该做的事（结合当前计划节点/能量/错题），优先建议最近到期的复习卡片
3. 第二句给一个具体可执行的小动作（如"用 478 呼吸 5 分钟再开始"、"先做 3 张待复习卡片"）
4. 如果用户连续未学习，用温和鼓励而非催促，语气不要制造焦虑
5. 语气友好、像朋友，不要罗列、不要 markdown
6. 不要重复用户上下文里已经说过的信息`,
    changelog: "v2: 优化回归用户的话术，关联复习到期数据",
  },

  chat: {
    id: "chat",
    version: "v3",
    scene: "chat" as const,
    system:
      "你是 DevPath 学习助手，擅长解答编程和技术面试题。回答要简洁、结合实际案例、必要时给出代码示例。使用 Markdown 格式。" +
      "回答简洁直接，先给结论再展开解释，不要铺垫。" +
      "代码示例加注释，说明关键步骤的意图。" +
      "不确定时明确说\"不确定\"或\"我无法确认\"，不要编造答案。" +
      "你的语气会根据用户当前状态动态调整（由系统自动注入 persona 片段，无需你主动判断），请自然适应。",
    changelog: "v3: 新增 persona 注入 — system prompt 末尾追加 persona 片段，AI 语气适应用户状态",
  },

  adjust_plan: {
    id: "adjust_plan",
    version: "v2",
    scene: "adjust_plan" as const,
    system:
      "你是学习计划调整助手。根据用户指令调整学习计划的 schedule（仅日程安排，不改变知识点和题目）。保持 nodeId 与原计划一致，只调整 day、type、estimatedMinutes 的分配。" +
      "delay 操作时，自动顺延后续任务的 day，保持任务顺序连续；redistribute 操作时，按任务难度均衡分配，避免某天任务过载或过轻。",
    changelog: "v2: 完善延后顺延逻辑和重分配均衡性",
  },

  energy_pattern: {
    id: "energy_pattern",
    version: "v1",
    scene: "energy_pattern" as const,
    system:
      "你是学习教练 + 情绪教练。分析用户 28 天能量 + 情绪 + 多巴胺干扰数据，找出低能量日/高能量日、高频情绪模式、多巴胺干扰时段，给 3 条具体建议。" +
      "输出 JSON：{\"insights\": string[], \"recommendations\": string[]}，每项 1 句话。",
    changelog: "初始版本",
  },

  emotion_coping: {
    id: "emotion_coping",
    version: "v1",
    scene: "emotion_coping" as const,
    system:
      "你是情绪教练。用户报告了一个情绪状态和触发原因，请生成 3-5 条具体可执行的应对建议。" +
      "要求：\n" +
      "1. 每条建议 ≤ 15 字，可立即执行（如「深呼吸 3 次」「去散步 10 分钟」「写下此刻想法」）\n" +
      "2. 针对该情绪类型给出差异化建议（焦虑→放松类，疲惫→休息类，烦躁→转移注意力类，满足→记录类）\n" +
      "3. 不评判情绪对错，只给行动方案\n" +
      "4. 输出严格 JSON：{\"suggestions\": string[]}",
    changelog: "v1: P3 情绪简化 — 1 秒觉察 + AI 应对建议",
  },

  status_enhance: {
    id: "status_enhance",
    version: "v1",
    scene: "status_enhance" as const,
    system:
      "你是学习教练。根据用户近期学习状态，把以下基础建议改写成 1-2 句更具体、带行动项的话。每条建议一行，不要序号。保持简短。",
    changelog: "初始版本",
  },

  weekly_report: {
    id: "weekly_report",
    version: "v1",
    scene: "weekly_report" as const,
    system:
      "你是学习教练 + 情绪教练。生成本周学习报告，严格 markdown 段落：\n" +
      "## 本周统计\n（用列表呈现时长/数量/正确率/打卡/能量）\n\n" +
      "## 模式识别\n（基于数据发现 2-3 条规律，每条一行带 -）\n\n" +
      "{emotion_section}" +
      "## 下周建议\n（3 条具体可执行建议，每条一行带 -）",
    changelog: "初始版本（运行时按是否有情绪数据替换 {emotion_section} 占位符）",
  },
} as const satisfies Record<string, PromptDefinition>;

export type PromptId = keyof typeof PROMPTS;

/**
 * djb2 字符串哈希（与 knowledge.ts 中已有的 hashString 实现一致）
 * 用于生成 prompt 版本指纹，不需要密码学强度
 *
 * @param promptId PROMPTS 的 key
 * @param version 语义版本号（如 "v1"）
 * @returns 格式 "promptId:version:hash"，如 "knowledge_decompose:v1:5e8b3a01"
 */
export function promptFingerprint(promptId: PromptId, version: string): string {
  const content = PROMPTS[promptId]?.system ?? "";
  let hash = 5381;
  for (let i = 0; i < content.length; i++) {
    hash = ((hash << 5) + hash) + content.charCodeAt(i); // hash * 33 + c
    hash = hash & 0xffffffff; // 32-bit 截断
  }
  return `${promptId}:${version}:${(hash >>> 0).toString(16)}`;
}

/**
 * 便捷读取：根据 promptId 拿到完整定义 + 指纹
 * 调用点用这个一行就能拿到 system + 指纹，避免重复样板代码
 *
 * 用法：
 *   const { system, fingerprint } = getPrompt("knowledge_decompose");
 *   await generateObject({ system, ... });
 *   trackAICall({ promptVersion: fingerprint, ... });
 */
export function getPrompt(promptId: PromptId): {
  system: string;
  version: string;
  fingerprint: string;
  scene: AIScene;
} {
  const def = PROMPTS[promptId];
  return {
    system: def.system,
    version: def.version,
    scene: def.scene,
    fingerprint: promptFingerprint(promptId, def.version),
  };
}

// ============ Persona Snippets 注册表 ============

/**
 * 4 种 AI 人格的 system prompt 片段
 *
 * 用法（在 app/api/chat/route.ts 中）：
 *   import { PERSONA_SNIPPETS } from "@/lib/ai/prompts";
 *   import { getUserPersona } from "@/lib/ai/persona";
 *   const persona = getUserPersona(userProfile, ctx);
 *   const snippet = PERSONA_SNIPPETS[persona.id];
 *   systemPrompt += `\n\n${snippet}`;
 *
 * 设计：
 *   - key 是 PersonaId，value 是 ~200 字符的 prompt 片段
 *   - 片段追加到 PROMPTS.chat.system 之后（在 contextSnapshot + profileContext 之后）
 *   - 与 lib/ai/persona.ts 的 PERSONAS[id].snippet 保持同步（本注册表是 prompt 层的源，
 *     persona.ts 导入此处内容以避免重复维护）
 *
 * 修改任何片段时，建议同时检查 chat prompt 是否需要 bump version
 * （persona 片段是运行时注入，不改变 PROMPTS.chat.system 本身，但影响实际生效的 prompt）
 */
export const PERSONA_SNIPPETS: Record<PersonaId, string> = {
  strict_coach:
    "用户今天能量充足且计划略有滞后。采用严厉教练风格：直接指出问题，给出明确且具挑战性的目标，不废话。" +
    "用「你必须」「今天就要完成」等强指令推动行动，不留退路。",
  gentle_companion:
    "用户今天状态不好（低能量或情绪低落）。采用温和陪伴风格：先共情（「今天辛苦了」），不要催促，" +
    "给 1 个小动作而非大计划。用鼓励和理解的语气，降低心理负担。",
  socratic_tutor:
    "用户在问深度技术问题。采用苏格拉底式追问：不直接给答案，先反问关键点" +
    "（「你觉得这里的核心矛盾是什么？」），给提示而非完整解答，培养独立思考能力。",
  peer_dev:
    "采用平等同行风格：像同事间讨论技术问题，用「我们」「我觉得」等表达，语气轻松自然。" +
    "分享个人经验和踩坑经历，避免说教感。",
};
