/**
 * curriculum/loader.ts 单元测试：YAML 解析、路径分发、id 唯一性
 */
import { describe, expect, it } from "vitest";

import {
  ContentLoadError,
  loadCurriculumFiles,
  type ContentFile,
} from "@/lib/curriculum/loader";

const minimalSourceRegistry = `
sources:
  - id: openai-docs
    title: OpenAI Docs
    url: https://platform.openai.com/docs
    tier: T0
    type: official-doc
    lastVerified: "2026-07-20"
  - id: python-docs
    title: Python Docs
    url: https://docs.python.org/3/
    tier: T0
    type: official-doc
    lastVerified: "2026-07-20"
`;

const minimalTrack = `
track:
  id: frontend-to-ai-engineer
  title: 前端转 AI
  description: d
  audience: a
  phases:
    - index: 0
      title: p0
      goal: g
`;

const minimalNode = `
id: llm.tokens-and-context
title: t
summary: s
tracks: [frontend-to-ai-engineer]
phase: 0
prerequisites: []
estimatedMinutes: 60
difficulty: 2
concepts: [c1]
sourceIds: [openai-docs, python-docs]
gotchas: []
interview:
  - q: q
    answerSkeleton: a
    followups: [f1]
masteryCheck:
  level: V1
  type: fsrs-cards
  description: d
status: reviewed
lastVerified: "2026-07-24"
`;

function baseFiles(): ContentFile[] {
  return [
    { path: "sources/registry.yaml", content: minimalSourceRegistry },
    { path: "graph/tracks/t.yaml", content: minimalTrack },
    { path: "graph/nodes/llm.tokens-and-context.yaml", content: minimalNode },
  ];
}

describe("loadCurriculumFiles", () => {
  it("按路径分发并解析各类文件", () => {
    const loaded = loadCurriculumFiles(baseFiles());
    expect(loaded.sources).toHaveLength(2);
    expect(loaded.tracks).toHaveLength(1);
    expect(loaded.nodes).toHaveLength(1);
    expect(loaded.nodes[0].id).toBe("llm.tokens-and-context");
  });

  it("忽略 labs/ 等非编译目录", () => {
    const files = [
      ...baseFiles(),
      { path: "labs/demo/notes.yaml", content: "anything: true" },
    ];
    expect(() => loadCurriculumFiles(files)).not.toThrow();
  });

  it("YAML 语法错误抛出带路径的 ContentLoadError", () => {
    const files: ContentFile[] = [
      { path: "sources/registry.yaml", content: "sources: [broken" },
    ];
    try {
      loadCurriculumFiles(files);
      expect.unreachable();
    } catch (err) {
      expect(err).toBeInstanceOf(ContentLoadError);
      expect((err as ContentLoadError).path).toBe("sources/registry.yaml");
    }
  });

  it("schema 校验失败抛出 ContentLoadError", () => {
    const files: ContentFile[] = [
      { path: "graph/nodes/bad.yaml", content: "id: x" },
    ];
    expect(() => loadCurriculumFiles(files)).toThrow(ContentLoadError);
  });

  it("检测重复节点 id", () => {
    const files = [
      ...baseFiles(),
      { path: "graph/nodes/dup.yaml", content: minimalNode },
    ];
    expect(() => loadCurriculumFiles(files)).toThrow(/重复/);
  });

  it("检测重复来源 id", () => {
    const files = [
      ...baseFiles(),
      { path: "sources/extra.yaml", content: minimalSourceRegistry },
    ];
    expect(() => loadCurriculumFiles(files)).toThrow(/重复/);
  });

  it("支持 rubrics 目录解析", () => {
    const rubric = `
rubric:
  id: r1
  title: t
  passScore: 70
  criteria:
    - id: c1
      description: d
      weight: 100
`;
    const files = [...baseFiles(), { path: "rubrics/r1.yaml", content: rubric }];
    const loaded = loadCurriculumFiles(files);
    expect(loaded.rubrics).toHaveLength(1);
    expect(loaded.rubrics[0].passScore).toBe(70);
  });
});
