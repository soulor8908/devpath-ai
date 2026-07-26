/**
 * 把 lib/presets/*.ts 的 preset 数据导出为 public/data/presets/{id}.json
 *
 * 目的（卡帕西视角，2026-07-26 修复 Cloudflare Pages 部署失败）：
 *   next-on-pages 把所有动态 import() 的目标内联进 Worker bundle，
 *   6 个 preset（~50k 行 TS）全量打进 Worker 导致 bundle 达 13MB，远超 3MB 限制。
 *   改为运行时 fetch JSON 后，preset 数据不再进 Worker bundle，
 *   仅作为静态资源部署在 public/data/presets/。
 *
 * 用法：
 *   npx tsx scripts/export-presets.ts
 *
 * 何时运行：
 *   - 任何 lib/presets/*.ts 内容变更后
 *   - 部署前（已纳入 quality-gate 流程）
 *   - CI 中通过 content:freshness 校验产物新鲜度
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

import { FRONTEND_TO_AI_ENGINEER_PRESET } from "@/lib/presets/frontend-to-ai-engineer";
import { ALGORITHM_200_PRESET } from "@/lib/presets/algorithm-200";
import { FRONTEND_PRESET } from "@/lib/presets/frontend";
import { BACKEND_PRESET } from "@/lib/presets/backend";
import { AI_PRESET } from "@/lib/presets/ai";
import { LLM_APP_PRESET } from "@/lib/presets/llm-app";

interface PresetData {
  topic: string;
  knowledgeTree: unknown[];
  questions: unknown[];
  schedule: unknown[];
}

const OUTPUT_DIR = join(process.cwd(), "public", "data", "presets");

const PRESETS: Array<{ id: string; data: PresetData }> = [
  { id: "frontend-to-ai-engineer", data: FRONTEND_TO_AI_ENGINEER_PRESET },
  { id: "algorithm-200", data: ALGORITHM_200_PRESET },
  { id: "frontend", data: FRONTEND_PRESET },
  { id: "backend", data: BACKEND_PRESET },
  { id: "ai", data: AI_PRESET },
  { id: "llm-app", data: LLM_APP_PRESET },
];

function main(): void {
  mkdirSync(OUTPUT_DIR, { recursive: true });

  for (const { id, data } of PRESETS) {
    const path = join(OUTPUT_DIR, `${id}.json`);
    const json = JSON.stringify(data);
    writeFileSync(path, json, "utf-8");
    const sizeKB = (Buffer.byteLength(json, "utf-8") / 1024).toFixed(1);
    console.log(`  ${id}.json  ${sizeKB} KB  (${data.knowledgeTree.length} nodes, ${data.questions.length} questions)`);
  }

  console.log(`\n导出完成 → ${OUTPUT_DIR}`);
}

main();
