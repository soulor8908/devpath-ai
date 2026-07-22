// lib/types/kb-index.ts
// 知识库向量化与 AI 语义检索领域类型（v1）
// 详见 docs/superpowers/specs/2026-07-22-knowledge-vector-search-design.md

// ============================================================================
// 知识库向量化与 AI 语义检索（v1）
// 详见 docs/superpowers/specs/2026-07-22-knowledge-vector-search-design.md
// ============================================================================

/** 知识索引条目：一个可被检索的知识单元（preset 节点 或 doc 文档节） */
export interface KnowledgeIndexEntry {
  /** 稳定 id：preset 节点 = `preset:<presetId>:<nodeId>`；doc = `doc:<sectionId>` */
  id: string;
  /** 来源类型 */
  source: "preset" | "doc";
  /** 来源预设 id（仅 preset），如 "frontend" */
  presetId?: string;
  /** 来源预设名（仅 preset），如 "前端工程师" */
  presetName?: string;
  /** 文档分类（仅 doc），如 "核心功能" */
  docCategory?: string;
  /** 标题 */
  title: string;
  /** 摘要（卡片展示 + 检索文本的一部分） */
  summary: string;
  /** 检索用全文 = title + " " + summary + keywords 拼接，嵌入用 */
  searchText: string;
  /** 嵌入向量（768 维，bge-base-en-v1.5） */
  vector: number[];
  /** 难度（仅 preset） */
  difficulty?: 1 | 2 | 3 | 4 | 5;
  /** 频率（仅 preset） */
  frequency?: "高" | "中" | "低";
  /** 前置依赖节点 id 列表（仅 preset，用于详情页展示 prereq 链） */
  prerequisites?: string[];
  /** 跳转锚点：doc → `/docs#<id>`；preset → 由 KnowledgeDetailModal 处理（无路由） */
  href: string;
  /** 标签（preset 用 tags，doc 用 keywords） */
  tags: string[];
}

/** 知识索引清单（随构建产物发布的元数据 + 向量） */
export interface KnowledgeIndexManifest {
  /** 索引语义版本（schema 不变则不变，内容变了用 builtAt 区分） */
  version: string;
  /** 嵌入模型 id，如 "@cf/baai/bge-base-en-v1.5" */
  model: string;
  /** 向量维度，如 768 */
  dimensions: number;
  /** 构建时间 ISO */
  builtAt: string;
  /** 条目数 */
  count: number;
  /** 全部条目（含向量） */
  entries: KnowledgeIndexEntry[];
}

/**
 * 聊天消息中引用的知识来源（轻量引用，仅存 id/title/score，不重复存向量）。
 * 挂在 assistant 消息上，用于渲染「知识来源卡片」与点击进入详情。
 */
export interface KnowledgeSourceRef {
  /** 对应 KnowledgeIndexEntry.id */
  id: string;
  /** 标题快照（避免每次都查索引） */
  title: string;
  /** 相似度分数 0–1 */
  score: number;
  /** 来源类型快照 */
  source: "preset" | "doc";
}
