// lib/types/portfolio.ts
// V4 作品集发布数据模型
//
// V4（portfolio-release）是 MasteryState 状态机的最高级验证：
//   - 通过 V4 → 节点 state = "mastered"
//   - 作品集是用户带去面试的"硬资产"
//
// 存储模型：
//   - 本地 IndexedDB：portfolio:<id> → PortfolioEntry（KEY_PREFIXES.PORTFOLIO）
//   - 云端 KV：发布后写入公开 portfolio 存储（lib/storage/kv.ts）

/** 作品集条目状态 */
export type PortfolioStatus = "draft" | "published" | "unlisted";

/** 作品集关联的验证等级（V3 项目通过后可发布为 V4 作品） */
export interface PortfolioEntry {
  /** 唯一 id（nanoid） */
  id: string;
  /** 项目标题 */
  title: string;
  /** 一句话描述 */
  summary: string;
  /** 关联的课程节点 id（如 project.rag-pipeline / project.capstone） */
  nodeId: string;
  /** 关联的 Rubric id（评审用） */
  rubricId: string;
  /** GitHub 仓库链接 */
  repoUrl?: string;
  /** 在线部署链接 */
  deployUrl?: string;
  /** 项目说明文档链接（架构图/eval 报告等） */
  docUrl?: string;
  /** 评审总分（0-100，AI 按 Rubric 评分） */
  reviewScore?: number;
  /** 评审是否通过（>= rubric.passScore） */
  reviewPassed?: boolean;
  /** AI 评审反馈摘要 */
  reviewFeedback?: string;
  /** V4 发布状态 */
  status: PortfolioStatus;
  /** 发布时间（status=published 时设置） */
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
}

/** 发布到云端 KV 的公开作品集（脱敏，不含 draft） */
export interface PublicPortfolioEntry {
  id: string;
  title: string;
  summary: string;
  nodeId: string;
  rubricId: string;
  repoUrl?: string;
  deployUrl?: string;
  docUrl?: string;
  reviewScore?: number;
  reviewPassed?: boolean;
  publishedAt: string;
}

/** 用户公开作品集（按 username 聚合） */
export interface PublicPortfolio {
  username: string;
  entries: PublicPortfolioEntry[];
}
