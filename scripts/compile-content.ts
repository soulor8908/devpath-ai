/**
 * 内容编译管线：content 目录 YAML → 校验 → public/data/curriculum-graph.json
 *
 * 用法：
 *   npm run content:compile        # 校验 + 写入编译产物
 *   npm run content:validate       # 仅校验（CI 用，不写文件）
 *
 * 校验失败时以非零码退出，并输出全部错误（便于 CI 一次性报完）。
 */
import { readdirSync, readFileSync, mkdirSync, writeFileSync, existsSync } from "node:fs";
import { join, relative } from "node:path";

import { loadCurriculumFiles, type ContentFile } from "../lib/curriculum/loader";
import { buildCurriculumGraph } from "../lib/curriculum/graph";

const CONTENT_DIR = join(__dirname, "..", "content");
const OUTPUT_PATH = join(
  __dirname,
  "..",
  "public",
  "data",
  "curriculum-graph.json",
);

function collectYamlFiles(dir: string): string[] {
  if (!existsSync(dir)) return [];
  const entries = readdirSync(dir, { withFileTypes: true });
  const files: string[] = [];
  for (const entry of entries) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...collectYamlFiles(full));
    } else if (/\.(yaml|yml)$/.test(entry.name)) {
      files.push(full);
    }
  }
  return files.sort();
}

/**
 * 新鲜度校验：已提交的编译产物必须与 content/ 当前状态一致。
 * preset（lib/presets/frontend-to-ai-engineer.ts）在构建期打包该 JSON，
 * 若 content 改了却没重新编译，应用会静默发布陈旧内容。
 * 比较时剔除 builtAt 时间戳（每次编译必然变化）。
 */
function assertCompiledArtifactFresh(graph: unknown): void {
  if (!existsSync(OUTPUT_PATH)) {
    console.error(
      `编译产物不存在: ${OUTPUT_PATH}\n请运行 npm run content:compile 生成`,
    );
    process.exit(1);
  }
  const committed = JSON.parse(readFileSync(OUTPUT_PATH, "utf-8")) as Record<
    string,
    unknown
  >;
  const fresh = graph as Record<string, unknown>;
  const strip = (g: Record<string, unknown>) =>
    JSON.stringify({ ...g, builtAt: null });
  if (strip(committed) !== strip(fresh)) {
    console.error(
      "编译产物已陈旧：content/ 与 public/data/curriculum-graph.json 不一致\n" +
        "请运行 npm run content:compile 重新生成",
    );
    process.exit(1);
  }
  console.log("编译产物新鲜度校验通过");
}

function main(): void {
  const validateOnly = process.argv.includes("--check");

  const paths = collectYamlFiles(CONTENT_DIR);
  if (paths.length === 0) {
    console.error(`未找到任何内容文件: ${CONTENT_DIR}`);
    process.exit(1);
  }

  const files: ContentFile[] = paths.map((p) => ({
    path: relative(CONTENT_DIR, p),
    content: readFileSync(p, "utf-8"),
  }));

  try {
    const loaded = loadCurriculumFiles(files);
    const graph = buildCurriculumGraph(loaded);

    const summary = {
      sources: loaded.sources.length,
      nodes: loaded.nodes.length,
      tracks: loaded.tracks.length,
      rubrics: loaded.rubrics.length,
      byPhase: loaded.nodes.reduce<Record<number, number>>((acc, n) => {
        acc[n.phase] = (acc[n.phase] ?? 0) + 1;
        return acc;
      }, {}),
    };

    if (validateOnly) {
      console.log("内容校验通过:", JSON.stringify(summary, null, 2));
      assertCompiledArtifactFresh(graph);
      return;
    }

    mkdirSync(join(OUTPUT_PATH, ".."), { recursive: true });
    writeFileSync(OUTPUT_PATH, JSON.stringify(graph, null, 2), "utf-8");
    console.log(`编译完成 → ${OUTPUT_PATH}`);
    console.log(JSON.stringify(summary, null, 2));
  } catch (err) {
    console.error(err instanceof Error ? err.message : String(err));
    process.exit(1);
  }
}

main();
