// lib/ai/status-enhance.ts
// AI 增强调量：在规则引擎基础上，根据连续低能量/节点失败模式生成自然语言建议
// 无 AI key 时降级为规则模板，保证可独立测试

import { hasAIKey, getModel } from "./provider";
import { generateText } from "ai";
import type { LanguageModel } from "ai";
import { getPrompt } from "./prompts";

// 从 Prompt Registry 读取
const PROMPT_DEF = getPrompt("status_enhance");

export interface EnhancePattern {
  consecutiveLowDays: number;
  nodeFailCount: Record<string, number>; // nodeId/title → 连续低评分次数
}

/**
 * 根据模式生成建议字符串数组
 * - consecutiveLowDays >= 3 → "建议今天休息一天，只做轻度复习"
 * - nodeFailCount[nodeTitle] >= 3 → `建议补学 ${nodeTitle} 相关材料`
 * 无触发条件返回空数组
 * 有 AI key 时调用 LLM 生成更个性化建议，失败降级为模板
 */
export async function enhanceAdjustment(pattern: EnhancePattern, model?: LanguageModel): Promise<string[]> {
  const suggestions: string[] = [];

  if (pattern.consecutiveLowDays >= 3) {
    suggestions.push("建议今天休息一天，只做轻度复习");
  }

  for (const [nodeTitle, failCount] of Object.entries(pattern.nodeFailCount)) {
    if (failCount >= 3) {
      suggestions.push(`建议补学 ${nodeTitle} 相关材料`);
    }
  }

  if (suggestions.length === 0) {
    return [];
  }

  if (!hasAIKey()) {
    return suggestions;
  }

  // AI 个性化润色（失败降级到模板）
  try {
    const aiModel = model ?? getModel();
    const { text } = await generateText({
      model: aiModel,
      system: PROMPT_DEF.system,
      prompt: `基础建议：\n${suggestions.map((s) => `- ${s}`).join("\n")}`,
    });
    const lines = text
      .split("\n")
      .map((s) => s.trim())
      .filter((s) => s.length > 0 && !/^[\d.、\-)]/.test(s));
    return lines.length > 0 ? lines : suggestions;
  } catch {
    return suggestions;
  }
}
