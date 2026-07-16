// lib/prompt-library.ts
// 常用提示词库：IndexedDB 存取 + 内置默认提示词
// 用户可保存自己常用的 AI 提示词，下次直接选择使用

import { getItem, setItem, listItems, delItem } from "./storage/db";
import { KEY_PREFIXES, type PromptLibraryItem } from "./types";
import { nanoid } from "nanoid";

// ============================================================
// 内置默认提示词（首次使用时自动注入）
// ============================================================

export const BUILTIN_PROMPTS: PromptLibraryItem[] = [
  {
    id: "builtin-bigtech",
    title: "大厂面试视角",
    content:
      "请以字节/腾讯/阿里等大厂面试官的视角拆解知识点，标注哪些是大厂高频考点，并提供大厂真实面试题示例。",
    createdAt: "2024-01-01T00:00:00.000Z",
    usedCount: 0,
  },
  {
    id: "builtin-project",
    title: "结合项目实战",
    content:
      "每个知识点请结合真实项目场景说明应用方式，提供可运行的代码示例，并指出常见踩坑和最佳实践。",
    createdAt: "2024-01-01T00:00:00.000Z",
    usedCount: 0,
  },
  {
    id: "builtin-deep",
    title: "深度原理",
    content:
      "请深入讲解底层原理，包括源码级实现、设计哲学、历史演进，不要只停留在 API 使用层面。",
    createdAt: "2024-01-01T00:00:00.000Z",
    usedCount: 0,
  },
  {
    id: "builtin-comparison",
    title: "横向对比",
    content:
      "请横向对比同类技术方案（如 React vs Vue、REST vs GraphQL），列出优缺点、适用场景和选型建议。",
    createdAt: "2024-01-01T00:00:00.000Z",
    usedCount: 0,
  },
  {
    id: "builtin-newbie",
    title: "零基础友好",
    content:
      "请用最简单的语言解释，假设读者是初学者，从基础概念讲起，循序渐进，多用类比和图示说明。",
    createdAt: "2024-01-01T00:00:00.000Z",
    usedCount: 0,
  },
];

// ============================================================
// CRUD
// ============================================================

/** 加载全部提示词（内置 + 用户自定义） */
export async function listPrompts(): Promise<PromptLibraryItem[]> {
  const userPrompts = await listItems<PromptLibraryItem>(KEY_PREFIXES.PROMPT);
  // 合并内置 + 用户自定义，按使用次数降序、创建时间降序
  const all = [...BUILTIN_PROMPTS, ...userPrompts];
  return all.sort((a, b) => {
    // 使用次数多的在前
    if (b.usedCount !== a.usedCount) return b.usedCount - a.usedCount;
    // 其次按创建时间
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
}

/** 按 id 获取单个提示词 */
export async function getPrompt(id: string): Promise<PromptLibraryItem | undefined> {
  // 先查内置
  const builtin = BUILTIN_PROMPTS.find((p) => p.id === id);
  if (builtin) return builtin;
  // 再查 IndexedDB
  return getItem<PromptLibraryItem>(KEY_PREFIXES.PROMPT + id);
}

/** 保存用户自定义提示词 */
export async function savePrompt(title: string, content: string): Promise<PromptLibraryItem> {
  const now = new Date().toISOString();
  const item: PromptLibraryItem = {
    id: nanoid(),
    title: title.trim() || "未命名提示词",
    content: content.trim(),
    createdAt: now,
    usedCount: 0,
  };
  await setItem(KEY_PREFIXES.PROMPT + item.id, item);
  return item;
}

/** 更新提示词使用次数和最近使用时间 */
export async function markPromptUsed(id: string): Promise<void> {
  // 内置提示词：不持久化使用次数（保持原样）
  if (BUILTIN_PROMPTS.some((p) => p.id === id)) return;
  const item = await getItem<PromptLibraryItem>(KEY_PREFIXES.PROMPT + id);
  if (!item) return;
  item.usedCount += 1;
  item.usedAt = new Date().toISOString();
  await setItem(KEY_PREFIXES.PROMPT + id, item);
}

/** 删除用户自定义提示词（内置不可删） */
export async function deletePrompt(id: string): Promise<boolean> {
  if (BUILTIN_PROMPTS.some((p) => p.id === id)) return false;
  await delItem(KEY_PREFIXES.PROMPT + id);
  return true;
}
