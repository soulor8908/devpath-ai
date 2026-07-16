// lib/ai/persona.ts
// AI 人格化：根据用户状态选择匹配的 AI 人格
//
// 设计（卡帕西视角）：
//   - 4 种 Persona 各对应一段 ~200 字符的 system prompt 片段
//   - selectPersona 是纯函数：相同 ctx → 相同 persona，便于单测
//   - 优先级链：gentle_companion > socratic_tutor > strict_coach > peer_dev
//     （先共情再求知再推动，日常默认同行）
//   - getUserPersona 支持 preferredPersona 覆盖（用户手动设置优先级最高）

import type { PersonaId, UserProfile } from "../types";
import { PERSONA_SNIPPETS } from "./prompts";

/** Persona 定义 */
export interface Persona {
  id: PersonaId;
  /** 中文显示名（profile 页用） */
  name: string;
  /** 简短描述（profile 页用） */
  description: string;
  /** system prompt 片段（~200 字符，追加到 PROMPTS.chat.system 之后） */
  snippet: string;
}

/** selectPersona 的上下文 */
export interface PersonaContext {
  /** 今日能量 1-5 */
  energy: number;
  /** 今日心情："good" | "neutral" | "bad" */
  mood: string;
  /** 当前连续打卡天数 */
  streak: number;
  /** 用户提问主题/内容（可选，用于判断是否深度技术问题） */
  topic?: string;
}

/** 4 种 Persona 定义（snippet 从 prompts.ts 的 PERSONA_SNIPPETS 导入，保持单一源） */
export const PERSONAS: Record<PersonaId, Persona> = {
  strict_coach: {
    id: "strict_coach",
    name: "严厉教练",
    description: "高能量日 + 计划滞后时启用，直接推动行动",
    snippet: PERSONA_SNIPPETS.strict_coach,
  },
  gentle_companion: {
    id: "gentle_companion",
    name: "温和陪伴",
    description: "低能量日 + 情绪低落时启用，先共情再给小动作",
    snippet: PERSONA_SNIPPETS.gentle_companion,
  },
  socratic_tutor: {
    id: "socratic_tutor",
    name: "苏格拉底追问",
    description: "深度技术问题时启用，引导独立思考",
    snippet: PERSONA_SNIPPETS.socratic_tutor,
  },
  peer_dev: {
    id: "peer_dev",
    name: "平等同行",
    description: "日常闲聊默认启用，像同事间讨论",
    snippet: PERSONA_SNIPPETS.peer_dev,
  },
};

/** PersonaId 列表（profile 页渲染用） */
export const PERSONA_LIST: Persona[] = [
  PERSONAS.strict_coach,
  PERSONAS.gentle_companion,
  PERSONAS.socratic_tutor,
  PERSONAS.peer_dev,
];

/** 深度技术问题关键词（命中则触发 socratic_tutor） */
const DEEP_TECH_KEYWORDS = [
  // 中文
  "代码", "算法", "原理", "源码", "实现", "复杂度", "数据结构", "设计模式",
  "架构", "编译", "运行时", "内存", "并发", "异步", "闭包", "事件循环",
  "垃圾回收", "虚拟机", "状态机", "时间复杂度", "空间复杂度", "动态规划",
  // 英文
  "code", "algorithm", "principle", "implement", "complexity", "data structure",
  "design pattern", "architecture", "runtime", "memory", "concurrency", "async",
  "closure", "event loop", "garbage collection", "state machine",
];

/**
 * 自动选择 Persona（纯函数）
 *
 * 优先级链（从上到下短路）：
 *   1. energy ≤ 2 或 mood === "bad" → gentle_companion（先共情）
 *   2. topic 含深度技术关键词 → socratic_tutor（引导思考）
 *   3. energy ≥ 4 且 streak < 3 → strict_coach（高能量但落后，推动行动）
 *   4. 默认 → peer_dev（平等同行）
 *
 * @param ctx 包含 energy / mood / streak / topic
 */
export function selectPersona(ctx: PersonaContext): Persona {
  // 1. 低能量或情绪低落 → 温和陪伴（优先共情）
  if (ctx.energy <= 2 || ctx.mood === "bad") {
    return PERSONAS.gentle_companion;
  }

  // 2. 深度技术问题 → 苏格拉底追问
  if (ctx.topic && hasDeepTechKeyword(ctx.topic)) {
    return PERSONAS.socratic_tutor;
  }

  // 3. 高能量但计划落后（streak 低）→ 严厉教练
  if (ctx.energy >= 4 && ctx.streak < 3) {
    return PERSONAS.strict_coach;
  }

  // 4. 默认 → 平等同行
  return PERSONAS.peer_dev;
}

/**
 * 获取用户 Persona（含 preferredPersona 覆盖逻辑）
 *
 * 优先级：
 *   1. userProfile.preferredPersona 存在 → 直接返回该 persona（用户手动设置优先级最高）
 *   2. 否则 → selectPersona(ctx) 自动选择
 *   3. 无 ctx → 返回 peer_dev（默认）
 *
 * @param userProfile 用户画像（可选，含 preferredPersona）
 * @param ctx Persona 上下文（可选，用于自动选择）
 */
export function getUserPersona(
  userProfile?: UserProfile | null,
  ctx?: PersonaContext,
): Persona {
  if (userProfile?.preferredPersona) {
    return PERSONAS[userProfile.preferredPersona];
  }
  if (ctx) {
    return selectPersona(ctx);
  }
  return PERSONAS.peer_dev;
}

/**
 * 从 Persona 获取 system prompt 片段
 * 供 chat route 注入到 systemPrompt
 */
export function getPersonaSnippet(persona: Persona): string {
  return persona.snippet;
}

// ============ 内部工具 ============

/** 检测 topic 是否包含深度技术关键词（大小写不敏感） */
function hasDeepTechKeyword(topic: string): boolean {
  const lower = topic.toLowerCase();
  return DEEP_TECH_KEYWORDS.some((kw) =>
    lower.includes(kw.toLowerCase()),
  );
}
