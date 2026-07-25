// __tests__/preset-bundle-guard.test.ts
// 守护测试：预设题库数据（约 3.9 万行 / ~700kB）禁止静态打进客户端 bundle
//
// 背景（2026-07-25 包体积治理）：
//   lib/presets/index.ts barrel 静态引入全部 6 个 preset 数据文件，
//   曾被 learn/new、onboarding、KnowledgeDetailModal 静态引用，
//   导致 5 个页面首包 800kB+（全站共享块仅 102kB）。
//   治理方案：meta.ts（轻量元数据）+ loader.ts（按 id 动态 import）。
//
// 本测试守护两件事：
//   1. app/ components/ lib/（lib/presets/ 自身除外）禁止静态 import
//      "@/lib/presets" barrel 或任何 preset 数据文件（meta / loader 除外）。
//      动态 import()（含 await import）是允许的按需加载模式，不在此列。
//   2. lib/presets/meta.ts 的计数（knowledgeCount/questionCount/dayCount/topic）
//      与真实 preset 数据一一对应——meta 是硬编码快照，防漂移。
//
// 规则没有测试守护等于建议（AGENTS.md 第 9 节）。

import { describe, it, expect } from "vitest";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { PRESETS, getPresetById, matchPresetByTopic } from "@/lib/presets";
import {
  PRESET_METAS,
  getPresetMetaById,
  matchPresetMetaByTopic,
} from "@/lib/presets/meta";
import { loadPresetById } from "@/lib/presets/loader";

const ROOT = process.cwd();
// lib/presets/ 内部文件（index.ts barrel 与数据文件之间的静态引用）不扫描
const SCAN_DIRS = ["app", "components", "lib"];
const EXCLUDE_PREFIXES = ["lib/presets/", "lib/demo/__tests__"];
const INCLUDE_EXT = [".ts", ".tsx"];

// 禁止的静态 import 目标：
//   - "@/lib/presets"（barrel，拉全量数据）
//   - "@/lib/presets/<data-file>"（单个数据文件，同样进首包）
// 允许："@/lib/presets/meta"、"@/lib/presets/loader"、动态 import("...")
const FORBIDDEN_PATTERN =
  /from\s+["']@\/lib\/presets(?:\/(frontend|backend|ai|llm-app|algorithm-200|frontend-to-ai-engineer))?["']/;

interface Violation {
  file: string;
  line: number;
  snippet: string;
}

function walk(dir: string, out: string[] = []): string[] {
  let entries: string[];
  try {
    entries = readdirSync(dir);
  } catch {
    return out;
  }
  for (const name of entries) {
    const full = join(dir, name);
    let st;
    try {
      st = statSync(full);
    } catch {
      continue;
    }
    if (st.isDirectory()) {
      walk(full, out);
    } else if (st.isFile() && INCLUDE_EXT.includes(name.slice(name.lastIndexOf(".")))) {
      out.push(full);
    }
  }
  return out;
}

function collectViolations(): Violation[] {
  const violations: Violation[] = [];
  for (const dir of SCAN_DIRS) {
    for (const file of walk(join(ROOT, dir))) {
      const rel = relative(ROOT, file).replaceAll("\\", "/");
      if (EXCLUDE_PREFIXES.some((p) => rel.startsWith(p))) continue;
      const lines = readFileSync(file, "utf8").split("\n");
      lines.forEach((line, i) => {
        const trimmed = line.trim();
        // 跳过注释行
        if (trimmed.startsWith("//") || trimmed.startsWith("*") || trimmed.startsWith("/*")) return;
        if (FORBIDDEN_PATTERN.test(line)) {
          violations.push({ file: rel, line: i + 1, snippet: trimmed.slice(0, 120) });
        }
      });
    }
  }
  return violations;
}

describe("preset bundle guard", () => {
  it("客户端代码禁止静态 import @/lib/presets barrel 或 preset 数据文件（用 meta/loader 替代）", () => {
    const violations = collectViolations();
    if (violations.length > 0) {
      const msg = violations.map((v) => `  ${v.file}:${v.line}  ${v.snippet}`).join("\n");
      throw new Error(
        `发现 ${violations.length} 处静态引用 preset 数据（会把 ~700kB 题库打进首包）：\n${msg}\n\n` +
          `替代方案：\n` +
          `  列表/卡片/主题匹配 → import { PRESET_METAS, getPresetMetaById, matchPresetMetaByTopic } from "@/lib/presets/meta"\n` +
          `  需要完整题库数据 → import { loadPresetById } from "@/lib/presets/loader"（动态 import，按需加载）`,
      );
    }
    expect(violations).toHaveLength(0);
  });

  it("PRESET_METAS 与真实 preset 数据一致（id 集合 / topic / 三类计数）", () => {
    expect(PRESET_METAS.map((m) => m.id).sort()).toEqual(PRESETS.map((p) => p.id).sort());
    for (const meta of PRESET_METAS) {
      const preset = getPresetById(meta.id);
      expect(preset, `meta ${meta.id} 找不到对应 preset`).toBeDefined();
      expect(meta.topic, `${meta.id}.topic 漂移`).toBe(preset!.topic);
      expect(meta.knowledgeCount, `${meta.id}.knowledgeCount 漂移，改 preset 后需同步 meta.ts`).toBe(
        preset!.knowledgeTree.length,
      );
      expect(meta.questionCount, `${meta.id}.questionCount 漂移，改 preset 后需同步 meta.ts`).toBe(
        preset!.questions.length,
      );
      expect(meta.dayCount, `${meta.id}.dayCount 漂移，改 preset 后需同步 meta.ts`).toBe(
        preset!.schedule.length,
      );
      // meta 的展示字段也应与 barrel 保持一致（同一数据源的两个视图不该分叉）
      expect(meta.name, `${meta.id}.name 漂移`).toBe(preset!.name);
      expect(meta.description, `${meta.id}.description 漂移`).toBe(preset!.description);
      expect(meta.tags, `${meta.id}.tags 漂移`).toEqual(preset!.tags);
    }
  });

  it("matchPresetMetaByTopic 与 matchPresetByTopic 行为一致（精确匹配 topic / name，无模糊匹配）", () => {
    for (const preset of PRESETS) {
      const byTopic = matchPresetMetaByTopic(preset.topic);
      expect(byTopic?.id, `topic「${preset.topic}」应命中 ${preset.id}`).toBe(preset.id);
      const byName = matchPresetMetaByTopic(preset.name);
      expect(byName?.id, `name「${preset.name}」应命中 ${preset.id}`).toBe(preset.id);
    }
    // 无匹配场景与 barrel 版行为一致
    expect(matchPresetMetaByTopic("前端性能优化")).toBeUndefined();
    expect(matchPresetByTopic("前端性能优化")).toBeUndefined();
    expect(matchPresetMetaByTopic("")).toBeUndefined();
  });

  it("loadPresetById 按需加载完整数据且与 barrel 数据一致；未知 id 返回 undefined", async () => {
    for (const meta of PRESET_METAS) {
      const loaded = await loadPresetById(meta.id);
      const expected = getPresetById(meta.id);
      expect(loaded, `loadPresetById(${meta.id}) 应返回数据`).toBeDefined();
      expect(loaded!.topic).toBe(expected!.topic);
      expect(loaded!.knowledgeTree.length).toBe(expected!.knowledgeTree.length);
      expect(loaded!.questions.length).toBe(expected!.questions.length);
      expect(loaded!.schedule.length).toBe(expected!.schedule.length);
    }
    expect(await loadPresetById("not-a-preset")).toBeUndefined();
  });

  it("getPresetMetaById 按 id 取元信息；未知 id 返回 undefined", () => {
    for (const meta of PRESET_METAS) {
      expect(getPresetMetaById(meta.id)).toEqual(meta);
    }
    expect(getPresetMetaById("not-a-preset")).toBeUndefined();
  });
});
