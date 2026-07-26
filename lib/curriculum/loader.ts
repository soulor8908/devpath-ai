import { parse as parseYaml } from "yaml";

import {
  rubricFileSchema,
  skillNodeSchema,
  sourceRegistrySchema,
  trackFileSchema,
} from "@/lib/curriculum/schema";
import { ContentLoadError } from "@/lib/curriculum/content-load-error";
import type {
  Rubric,
  SourceEntry,
  SkillNode,
  Track,
} from "@/lib/types/curriculum";

/**
 * 纯函数加载器：把 content/ 目录的 YAML 文本解析并校验为强类型数据。
 * 不依赖 fs —— 文件读取由 scripts/compile-content.ts 或测试完成，
 * 保证本模块在 Edge / 浏览器 / Vitest 中均可运行。
 *
 * 注意：本模块依赖 yaml npm 包（约 100KB+），仅用于内容编译脚本和测试。
 * 客户端代码不应 import 本模块（会拉入 yaml 库导致 bundle 超限）。
 * ContentLoadError 已拆到 content-load-error.ts，graph.ts 只 import 那个轻量类。
 */

export interface ContentFile {
  /** 相对 content/ 的路径，如 graph/nodes/llm.tokens.yaml */
  path: string;
  content: string;
}

export interface LoadedCurriculum {
  sources: SourceEntry[];
  nodes: SkillNode[];
  tracks: Track[];
  rubrics: Rubric[];
}

// ContentLoadError 从 content-load-error.ts re-export，保持向后兼容
export { ContentLoadError };

function parseOne<T>(file: ContentFile, parse: (data: unknown) => T): T {
  let raw: unknown;
  try {
    raw = parseYaml(file.content);
  } catch (err) {
    throw new ContentLoadError(
      file.path,
      `YAML 解析失败: ${err instanceof Error ? err.message : String(err)}`,
    );
  }
  try {
    return parse(raw);
  } catch (err) {
    throw new ContentLoadError(
      file.path,
      err instanceof Error ? err.message : String(err),
    );
  }
}

function isPath(file: ContentFile, prefix: string): boolean {
  return file.path.replace(/\\/g, "/").startsWith(prefix);
}

/** 解析并结构校验全部内容文件（跨文件引用校验在 graph.ts 中做） */
export function loadCurriculumFiles(files: ContentFile[]): LoadedCurriculum {
  const sources: SourceEntry[] = [];
  const nodes: SkillNode[] = [];
  const tracks: Track[] = [];
  const rubrics: Rubric[] = [];

  for (const file of files) {
    if (isPath(file, "sources/")) {
      const registry = parseOne(file, (d) => sourceRegistrySchema.parse(d));
      sources.push(...registry.sources);
    } else if (isPath(file, "graph/nodes/")) {
      nodes.push(parseOne(file, (d) => skillNodeSchema.parse(d)));
    } else if (isPath(file, "graph/tracks/")) {
      const parsed = parseOne(file, (d) => trackFileSchema.parse(d));
      tracks.push(parsed.track);
    } else if (isPath(file, "rubrics/")) {
      const parsed = parseOne(file, (d) => rubricFileSchema.parse(d));
      rubrics.push(parsed.rubric);
    }
    // 其他路径（labs/、projects/、reviews/）不参与编译
  }

  assertUniqueIds("来源", sources.map((s) => s.id));
  assertUniqueIds("节点", nodes.map((n) => n.id));
  assertUniqueIds("轨道", tracks.map((t) => t.id));
  assertUniqueIds("Rubric", rubrics.map((r) => r.id));

  return { sources, nodes, tracks, rubrics };
}

function assertUniqueIds(kind: string, ids: string[]): void {
  const seen = new Set<string>();
  for (const id of ids) {
    if (seen.has(id)) {
      throw new ContentLoadError("(global)", `${kind} id 重复: ${id}`);
    }
    seen.add(id);
  }
}
