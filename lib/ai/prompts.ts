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

import type { AIScene } from "../types";

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
    version: "v2",
    scene: "knowledge_decompose" as const,
    system: `你是技术学习专家。把用户给的学习主题拆解成知识节点。
要求：
1. 每个节点是一个可独立学习的最小知识单元
2. 标注节点间的依赖关系
3. 评估难度 1-5，难度应基于该知识点在大厂面试中的出现频率（高频考察 = 难度偏高，低频考察 = 难度偏低）
4. 按面试出现频率排序
5. 节点数量由主题复杂度自行决定，不限制数量（简单主题 5-8 个，复杂主题可达 20-30 个）
6. 大厂高频考点用 bigTech=true 标记，判定依据为该知识点在互联网大厂面试中的实际出现频率（高频出现才置 true，不要凭主观印象）
7. 输出严格 JSON`,
    changelog: "v2: 关联大厂面试频率到 bigTech 标记和难度评估",
  },

  question_generate: {
    id: "question_generate",
    version: "v2",
    scene: "question_generate" as const,
    system: `你是资深技术面试官。针对给定知识点生成一道高频面试题。
要求：
1. 题目要考察对知识点的深度理解
2. 答案用三段式：结论 → 展开解释 → 代码示例（200-500 字）
3. keyPoints 至少 2 个关键点（3-5 个为佳），不得为空
4. followUps 至少 1 个追问（2-3 个为佳），不得为空
5. 如果适用，提供 codeSnippet
6. bigTech 标记必须基于该题在实际大厂面试中的出现频率判断（真实高频考察才置 true，不能臆测或凭印象）`,
    changelog: "v2: 强化字段完整性要求，明确 keyPoints/followUps/bigTech 的生成规则",
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
    version: "v2",
    scene: "chat" as const,
    system:
      "你是 DevPath 学习助手，擅长解答编程和技术面试题。回答要简洁、结合实际案例、必要时给出代码示例。使用 Markdown 格式。" +
      "回答简洁直接，先给结论再展开解释，不要铺垫。" +
      "代码示例加注释，说明关键步骤的意图。" +
      "不确定时明确说\"不确定\"或\"我无法确认\"，不要编造答案。",
    changelog: "v2: 强调简洁直接 + 诚实表达不确定性",
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
