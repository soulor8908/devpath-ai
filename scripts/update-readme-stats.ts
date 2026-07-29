// scripts/update-readme-stats.ts
// 从 vitest 输出提取测试统计（测试文件数 + 用例数），注入 README.md 的占位符。
//
// 历史根因：
//   README 里硬编码 "1039 单测 / 92 个测试文件"，每次新增测试都要手改，
//   忘了改就漂移（已经漂移过两次）。P2 任务要求"改由脚本生成，杜绝第三次漂移"。
//
// 解法（卡帕西视角）：
//   1. 用 vitest --reporter=json 拿结构化结果（不用解析 CLI 文本）
//   2. 从 numTotalTests / numTotalTestSuites 取准确数字
//   3. README.md 用 <!-- STATS_START -->...<!-- STATS_END --> 包裹动态区域
//   4. 脚本只替换这个区域，其余内容不动
//
// 用法：
//   npm run stats:update     # 跑 vitest + 更新 README
//   npm run stats:check      # 只检查 README 是否与实际一致（CI 用）

import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { execSync } from "node:child_process";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const README_PATH = resolve(ROOT, "README.md");

const STATS_START = "<!-- STATS_START -->";
const STATS_END = "<!-- STATS_END -->";

interface VitestJsonSummary {
  numTotalTests: number;
  // numTotalTestSuites 统计的是 describe 块数（每文件顶层也算 1），不是文件数
  numTotalTestSuites: number;
  numPassedTests: number;
  numFailedTests: number;
  // testResults: 每个测试文件一条结果，length = 测试文件数
  testResults: Array<{ name: string }>;
}

/**
 * 运行 vitest --reporter=json，解析输出拿测试统计。
 * vitest json reporter 把结果写到 stdout（最后一个是 JSON），中间有 console.log 干扰。
 */
function getVitestStats(): { totalTests: number; totalFiles: number } {
  const jsonPath = resolve(ROOT, ".vitest-stats.json");
  try {
    // vitest --reporter=json 输出到 stdout，用 outputFile 更可靠
    execSync(`npx vitest run --reporter=json --outputFile="${jsonPath}"`, {
      cwd: ROOT,
      stdio: "pipe", // 静默 vitest 输出，只关心 JSON 文件
    });
  } catch {
    // vitest 返回非 0（有失败测试）也会写 JSON 文件，继续解析
  }

  if (!existsSync(jsonPath)) {
    throw new Error(`vitest JSON 输出不存在：${jsonPath}`);
  }

  const raw = readFileSync(jsonPath, "utf-8");
  const summary = JSON.parse(raw) as VitestJsonSummary;

  return {
    totalTests: summary.numTotalTests,
    // testResults 数组每个元素对应一个测试文件，length = 测试文件数
    // （numTotalTestSuites 是 describe 块数，不是文件数）
    totalFiles: summary.testResults?.length ?? 0,
  };
}

/**
 * 生成 README 中的测试统计文本。
 */
function buildStatsBlock(stats: { totalTests: number; totalFiles: number }): string {
  return `${STATS_START}\n| 测试 | Vitest 1.6（**${stats.totalTests} 单测 / ${stats.totalFiles} 个测试文件**）+ Playwright E2E |\n${STATS_END}`;
}

/**
 * 更新 README.md 中 STATS_START...STATS_END 区域。
 * 如果 README 没有这个标记，报错提示先手动加。
 */
function updateReadme(stats: { totalTests: number; totalFiles: number }): boolean {
  const readme = readFileSync(README_PATH, "utf-8");
  const startIdx = readme.indexOf(STATS_START);
  const endIdx = readme.indexOf(STATS_END);

  if (startIdx === -1 || endIdx === -1) {
    throw new Error(
      `README.md 中找不到 ${STATS_START} / ${STATS_END} 标记。\n` +
        `请在 README.md 的测试统计行周围加上这两个 HTML 注释标记。`,
    );
  }

  const oldBlock = readme.slice(startIdx, endIdx + STATS_END.length);
  const newBlock = buildStatsBlock(stats);

  if (oldBlock === newBlock) {
    console.log(`✓ README 测试统计已是最新（${stats.totalTests} 单测 / ${stats.totalFiles} 个测试文件）`);
    return false;
  }

  const updated = readme.slice(0, startIdx) + newBlock + readme.slice(endIdx + STATS_END.length);
  writeFileSync(README_PATH, updated, "utf-8");
  console.log(`✓ README 测试统计已更新：${stats.totalTests} 单测 / ${stats.totalFiles} 个测试文件`);
  return true;
}

// --- main ---

const checkOnly = process.argv.includes("--check");
const stats = getVitestStats();

if (checkOnly) {
  // 只检查不一致，不写入
  const readme = readFileSync(README_PATH, "utf-8");
  const startIdx = readme.indexOf(STATS_START);
  const endIdx = readme.indexOf(STATS_END);
  if (startIdx === -1 || endIdx === -1) {
    console.error(`✗ README.md 缺少 STATS 标记`);
    process.exit(1);
  }
  const current = readme.slice(startIdx, endIdx + STATS_END.length);
  const expected = buildStatsBlock(stats);
  if (current !== expected) {
    console.error(`✗ README 测试统计已过期`);
    console.error(`  当前：${current.replace(/\n/g, " ").trim()}`);
    console.error(`  期望：${expected.replace(/\n/g, " ").trim()}`);
    console.error(`  运行 npm run stats:update 修复`);
    process.exit(1);
  }
  console.log(`✓ README 测试统计一致（${stats.totalTests} 单测 / ${stats.totalFiles} 个测试文件）`);
} else {
  updateReadme(stats);
}
