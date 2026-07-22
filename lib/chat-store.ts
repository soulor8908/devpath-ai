// lib/chat-store.ts
// 聊天对话与消息的 CRUD + 自动清理（未收藏 7 天后删除）

import { nanoid } from "nanoid";
import { getItem, setItem, listItems, delItem } from "./storage/db";
import { KEY_PREFIXES, type ChatMessage, type Conversation, type ChatSource } from "./types";

/** 未收藏对话的保留天数 */
const RETENTION_DAYS = 7;

/** 创建新对话 */
export async function createConversation(params: {
  title?: string;
  modelConfigId?: string;
  source?: ChatSource;
}): Promise<Conversation> {
  const now = new Date().toISOString();
  const conv: Conversation = {
    id: nanoid(),
    title: params.title?.trim() || "新对话",
    createdAt: now,
    updatedAt: now,
    lastMessageAt: now,
    pinned: false,
    modelConfigId: params.modelConfigId,
    source: params.source,
    messageCount: 0,
  };
  await setItem(KEY_PREFIXES.CONVERSATION + conv.id, conv);
  return conv;
}

/**
 * 获取所有对话（按最后消息时间倒序）
 *
 * 设计变更（用户需求 4）：
 *   - 原版：pinned 优先 → lastMessageAt 倒序（"保存固定"会置顶）
 *   - 新版：仅按 lastMessageAt 倒序，pinned 不再影响排序
 *   - pinned 仍然在 UI 中显示图钉标识，仅排序不再特殊处理
 *   - 这样用户的对话列表严格按时间顺序，符合直觉
 */
export async function listConversations(): Promise<Conversation[]> {
  const convs = await listItems<Conversation>(KEY_PREFIXES.CONVERSATION);
  return convs.sort(
    (a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime(),
  );
}

/** 获取单个对话 */
export async function getConversation(id: string): Promise<Conversation | undefined> {
  return getItem<Conversation>(KEY_PREFIXES.CONVERSATION + id);
}

/** 更新对话 */
export async function updateConversation(id: string, patch: Partial<Conversation>): Promise<void> {
  const conv = await getConversation(id);
  if (!conv) return;
  await setItem(KEY_PREFIXES.CONVERSATION + id, { ...conv, ...patch, updatedAt: new Date().toISOString() });
}

/** 切换收藏 */
export async function togglePin(id: string): Promise<void> {
  const conv = await getConversation(id);
  if (!conv) return;
  await setItem(KEY_PREFIXES.CONVERSATION + id, { ...conv, pinned: !conv.pinned, updatedAt: new Date().toISOString() });
}

/** 重命名 */
export async function renameConversation(id: string, title: string): Promise<void> {
  await updateConversation(id, { title: title.trim() || "未命名对话" });
}

/** 删除对话（及其所有消息） */
export async function deleteConversation(id: string): Promise<void> {
  // 先删除消息
  const messages = await getMessages(id);
  await Promise.all(messages.map((m) => delItem(KEY_PREFIXES.CHAT_MESSAGE + m.id)));
  // 再删除对话
  await delItem(KEY_PREFIXES.CONVERSATION + id);
}

/** 添加消息 */
export async function addMessage(params: {
  conversationId: string;
  role: ChatMessage["role"];
  content: string;
  /** 该 assistant 回答引用的知识来源（v1 知识检索 pre-retrieval 命中后传入） */
  knowledgeSources?: ChatMessage["knowledgeSources"];
}): Promise<ChatMessage> {
  const msg: ChatMessage = {
    id: nanoid(),
    conversationId: params.conversationId,
    role: params.role,
    content: params.content,
    createdAt: new Date().toISOString(),
    ...(params.knowledgeSources && params.knowledgeSources.length > 0
      ? { knowledgeSources: params.knowledgeSources }
      : {}),
  };
  await setItem(KEY_PREFIXES.CHAT_MESSAGE + msg.id, msg);
  // 更新对话的 lastMessageAt 和 messageCount
  const conv = await getConversation(params.conversationId);
  if (conv) {
    const now = msg.createdAt;
    // 如果是第一条用户消息，更新标题
    let title = conv.title;
    if (conv.messageCount === 0 && params.role === "user") {
      title = params.content.slice(0, 30) + (params.content.length > 30 ? "..." : "");
    }
    await setItem(KEY_PREFIXES.CONVERSATION + conv.id, {
      ...conv,
      title,
      lastMessageAt: now,
      updatedAt: now,
      messageCount: conv.messageCount + 1,
    });
  }
  return msg;
}

/** 获取对话的所有消息（按时间正序） */
export async function getMessages(conversationId: string): Promise<ChatMessage[]> {
  const all = await listItems<ChatMessage>(KEY_PREFIXES.CHAT_MESSAGE);
  return all
    .filter((m) => m.conversationId === conversationId)
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
}

/** 更新消息内容（用于流式输出完成后保存） */
export async function updateMessage(id: string, content: string): Promise<void> {
  const msg = await getItem<ChatMessage>(KEY_PREFIXES.CHAT_MESSAGE + id);
  if (msg) {
    await setItem(KEY_PREFIXES.CHAT_MESSAGE + id, { ...msg, content });
  }
}

/**
 * 删除单条消息（多轮对话中删除某次对话）
 * 同步递减对话的 messageCount，但不删除对话本身
 */
export async function deleteMessage(id: string): Promise<void> {
  const msg = await getItem<ChatMessage>(KEY_PREFIXES.CHAT_MESSAGE + id);
  if (!msg) return;
  await delItem(KEY_PREFIXES.CHAT_MESSAGE + id);
  // 递减对话消息数
  const conv = await getConversation(msg.conversationId);
  if (conv) {
    await setItem(KEY_PREFIXES.CONVERSATION + conv.id, {
      ...conv,
      messageCount: Math.max(0, conv.messageCount - 1),
      updatedAt: new Date().toISOString(),
    });
  }
}

/**
 * 删除从某条消息开始（含）之后的全部消息（用于"重新生成答案"场景）
 * 保留触发消息本身（通常是用户消息），删除其后的 AI 回复及后续消息
 * @param fromMessageId 起始消息 ID（含）
 * @returns 被删除的消息列表（用于回滚）
 */
export async function deleteMessagesFrom(fromMessageId: string): Promise<ChatMessage[]> {
  const target = await getItem<ChatMessage>(KEY_PREFIXES.CHAT_MESSAGE + fromMessageId);
  if (!target) return [];
  const all = await listItems<ChatMessage>(KEY_PREFIXES.CHAT_MESSAGE);
  const convMsgs = all
    .filter((m) => m.conversationId === target.conversationId)
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

  const startIdx = convMsgs.findIndex((m) => m.id === fromMessageId);
  if (startIdx === -1) return [];
  // 删除该消息及其后所有消息
  const toDelete = convMsgs.slice(startIdx);
  await Promise.all(toDelete.map((m) => delItem(KEY_PREFIXES.CHAT_MESSAGE + m.id)));
  // 更新对话消息数
  const conv = await getConversation(target.conversationId);
  if (conv) {
    const remaining = Math.max(0, conv.messageCount - toDelete.length);
    await setItem(KEY_PREFIXES.CONVERSATION + conv.id, {
      ...conv,
      messageCount: remaining,
      updatedAt: new Date().toISOString(),
    });
  }
  return toDelete;
}

/** 自动清理：删除未收藏且超过保留天数的对话 */
export async function cleanupOldConversations(): Promise<number> {
  const convs = await listConversations();
  const now = Date.now();
  const threshold = now - RETENTION_DAYS * 86400000;
  const toDelete = convs.filter((c) => {
    if (c.pinned) return false;
    return new Date(c.lastMessageAt).getTime() < threshold;
  });
  await Promise.all(toDelete.map((c) => deleteConversation(c.id)));
  return toDelete.length;
}

/** 搜索对话（按标题和首条消息内容） */
export async function searchConversations(query: string): Promise<Conversation[]> {
  const q = query.trim().toLowerCase();
  if (!q) return listConversations();
  const convs = await listConversations();
  const matched = convs.filter((c) => c.title.toLowerCase().includes(q));
  if (matched.length >= convs.length) return matched;
  // 也搜索消息内容
  const allMsgs = await listItems<ChatMessage>(KEY_PREFIXES.CHAT_MESSAGE);
  const convIdsWithMatch = new Set(
    allMsgs.filter((m) => m.content.toLowerCase().includes(q)).map((m) => m.conversationId)
  );
  return convs.filter((c) => matched.includes(c) || convIdsWithMatch.has(c.id));
}
