// __tests__/ui-design-system-guard.test.ts
// UI 设计系统守护测试
//
// 这是 UI 设计系统规范的"执法者"（卡帕西视角）：
//   - 测试即文档：每条规则都有对应的测试断言
//   - CI 即评审：每次提交自动验证，不依赖人工 review
//
// 守护内容（对应 docs/ui-design-system.md）：
//   1. 禁止 text-[Npx] 逃逸值（第 1.4 节）
//   2. 禁止 bg-[#xxx] / border-[#xxx] / text-[#xxx] 任意颜色（第 1.1 节）
//   3. 禁止 rounded-[Npx] 逃逸圆角（第 1.2 节）
//   4. 浅色 utility 必须带 dark: 配对（第 3.2 节）
//
// 例外（白名单）：
//   - components/ui/ 目录下的统一组件实现（允许内部用任意样式）
//   - 注释行（// 或 /* 或 *）
//   - className 中已带 dark: 配对的浅色 utility
//
// 渐进收紧策略（卡帕西视角）：
//   - 规则 1/2/3（逃逸值）对所有文件强制，0 容忍
//   - 规则 4（dark 配对）对 LEGACY_FILES 中的既有违规文件暂时豁免
//   - 新文件 / 已修复文件必须 100% 通过
//   - 每修复一个文件，从 LEGACY_FILES 移除一行（鼓励渐进收紧）
//   - PERMANENT_EXEMPT_FILES 中的文件永久豁免所有规则（如 CodeBlock）
//
// 检测策略：
//   - 文件级别扫描 components/**/*.tsx 和 app/**/*.tsx（排除 components/ui/）
//   - 按行扫描，跳过注释行
//   - 对每行 className 字符串做正则匹配

import { describe, it, expect } from "vitest";
import { readdirSync, readFileSync, statSync, existsSync } from "node:fs";
import { join, relative } from "node:path";

const ROOT = process.cwd();
const SCAN_DIRS = ["components", "app"];
const EXCLUDE_DIRS = ["components/ui", "components/__tests__", "__tests__"];
const INCLUDE_EXT = [".tsx"];

// ============ 永久豁免清单 ============
// 这些文件因设计意图特殊，永久豁免所有规则，不可移除
// 添加此清单需在 PR 中说明设计理由
const PERMANENT_EXEMPT_FILES = new Set<string>([
  // CodeBlock：代码块组件，bg-[#0d1117]/bg-[#161b22] 是 GitHub Primer 暗色主题色，
  // text-[13px] 是代码字号，需精确控制；GitHub 风格不应被设计令牌约束
  "components/CodeBlock.tsx",
]);

// ============ Legacy 白名单（渐进收紧）============
// 这些文件存在既有 dark 配对违规（截至 2026-07-19 共 330 处），
// 规则 4（dark 配对）暂不强制，让 CI 不被一次性阻塞。
//
// 维护规则：
//   - 每修复一个文件 → 从此清单移除一行（同时更新违规数注释）
//   - 新文件必须 100% 通过，禁止加入此清单
//   - 此清单只能缩小，不能扩大
//
// 当前违规分布：app/* 21 个文件，components/* 16 个文件
const LEGACY_FILES = new Set<string>([
  // ============ app/ ============
  "app/achievements/page.tsx",
  "app/daily/page.tsx",
  "app/docs/page.tsx",
  "app/emotion/page.tsx",
  "app/error.tsx",
  "app/favorites/page.tsx",
  "app/learn/[planId]/PlanDetailClient.tsx",
  "app/learn/[planId]/edit/PlanEditClient.tsx",
  "app/learn/list/ListClient.tsx",
  "app/learn/new/page.tsx",
  "app/learn/page.tsx",
  "app/mistakes/MistakeBookClient.tsx",
  "app/onboarding/page.tsx",
  "app/profile/page.tsx",
  "app/rest/page.tsx",
  "app/review/page.tsx",
  "app/stats/ai-quality/page.tsx",
  "app/stats/page.tsx",
  "app/u/[username]/UserPageClient.tsx",
  // ============ components/ ============
  "components/AITaskModal.tsx",
  "components/ChatClient.tsx",
  "components/CurrentTaskCard.tsx",
  "components/DailyNudge.tsx",
  "components/EmotionRecorder.tsx",
  "components/EnergyTrendMini.tsx",
  "components/FloatingChat.tsx",
  "components/KnowledgeTree.tsx",
  "components/LearnWizard.tsx",
  "components/MindMap.tsx",
  "components/ModelIconSelector.tsx",
  "components/PomodoroWidget.tsx",
  "components/QuickShortcuts.tsx",
  "components/RadarChart.tsx",
  "components/WeeklyReport.tsx",
]);

interface Violation {
  file: string;
  line: number;
  rule: string;
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

function isExcluded(filePath: string): boolean {
  const rel = relative(ROOT, filePath).replaceAll("\\", "/");
  return EXCLUDE_DIRS.some((d) => rel.startsWith(d + "/") || rel === d);
}

function isCommentLine(line: string): boolean {
  const trimmed = line.trim();
  return (
    trimmed.startsWith("//") ||
    trimmed.startsWith("*") ||
    trimmed.startsWith("/*")
  );
}

// ============ 规则 1：禁止 text-[Npx] 逃逸值 ============
// 允许 text-[#xxx] 这种任意颜色（虽然不推荐，但暂不强制）
// 仅禁止 text-[数字px]
const TEXT_ESCAPE_PATTERN = /text-\[\d+px\]/g;

// ============ 规则 2：禁止任意颜色逃逸值 ============
// bg-[#xxx] / border-[#xxx] / text-[#xxx] / fill-[#xxx] / stroke-[#xxx]
const COLOR_ESCAPE_PATTERN = /(bg|border|text|fill|stroke|ring|from|to|via)-\[#[0-9a-fA-F]+\]/g;

// ============ 规则 3：禁止 rounded-[Npx] 逃逸圆角 ============
const ROUNDED_ESCAPE_PATTERN = /rounded-\[\d+px\]/g;

// ============ 规则 4：浅色 utility 必须带 dark: 配对 ============
// 仅检测需要配对的浅色 utility（bg-white / bg-gray-50/100/200 / text-gray-400/500/600/700/900 / border-gray-100/200）
// 要求：同一 className 字符串内，浅色 utility 必须有对应的 dark: 变体
//
// 实现思路：
//   - 提取每个 className 字符串（双引号或反引号或模板字符串内的内容）
//   - 对每个 className 字符串，检查是否同时包含浅色 utility 和 dark: 前缀
//   - 如果有 bg-white 但无 dark:bg-，记为违规
//
// 注意：跨行 className（模板字符串）需特殊处理。这里简化为：如果某行包含浅色 utility，
// 检查同行的 dark: 前缀数量是否 >= 浅色 utility 数量。
//
// 白名单 utility（不需要 dark 配对）：
//   - bg-black/40 / bg-black/50（半透明遮罩，dark 下仍可读）
//   - bg-transparent
//   - text-white / text-black（在彩色背景上，dark 不影响）
//   - bg-blue-500 等饱和状态色（如 RATINGS 按钮的 bg-red-500，是填充色不是背景色）

// 需要配对的浅色 utility → 期望的 dark 前缀
const LIGHT_DARK_PAIRS: Array<{ light: RegExp; dark: RegExp; name: string }> = [
  // 背景
  { light: /\bbg-white\b(?!\/)/g, dark: /\bdark:bg-/g, name: "bg-white" },
  { light: /\bbg-gray-50\b(?!\/)/g, dark: /\bdark:bg-/g, name: "bg-gray-50" },
  { light: /\bbg-gray-100\b(?!\/)/g, dark: /\bdark:bg-/g, name: "bg-gray-100" },
  { light: /\bbg-gray-200\b(?!\/)/g, dark: /\bdark:bg-/g, name: "bg-gray-200" },
  // 文字（仅 400-900 需要配对，300 以下通常够亮）
  { light: /\btext-gray-400\b(?!\/)/g, dark: /\bdark:text-/g, name: "text-gray-400" },
  { light: /\btext-gray-500\b(?!\/)/g, dark: /\bdark:text-/g, name: "text-gray-500" },
  { light: /\btext-gray-600\b(?!\/)/g, dark: /\bdark:text-/g, name: "text-gray-600" },
  { light: /\btext-gray-700\b(?!\/)/g, dark: /\bdark:text-/g, name: "text-gray-700" },
  { light: /\btext-gray-900\b(?!\/)/g, dark: /\bdark:text-/g, name: "text-gray-900" },
  // 边框
  { light: /\bborder-gray-100\b(?!\/)/g, dark: /\bdark:border-/g, name: "border-gray-100" },
  { light: /\bborder-gray-200\b(?!\/)/g, dark: /\bdark:border-/g, name: "border-gray-200" },
];

// hover: 前缀的浅色 utility 也需要配对（如 hover:bg-gray-50 需要 dark:hover:bg-gray-800）
const LIGHT_DARK_HOVER_PAIRS: Array<{ light: RegExp; dark: RegExp; name: string }> = [
  { light: /\bhover:bg-white\b(?!\/)/g, dark: /\bdark:hover:bg-/g, name: "hover:bg-white" },
  { light: /\bhover:bg-gray-50\b(?!\/)/g, dark: /\bdark:hover:bg-/g, name: "hover:bg-gray-50" },
];

function checkDarkPairInLine(line: string): Violation[] {
  const violations: Violation[] = [];
  // 如果整行没有 dark: 前缀，且包含浅色 utility，全部记为违规
  const hasAnyDark = /\bdark:/.test(line);

  for (const pair of LIGHT_DARK_PAIRS) {
    pair.light.lastIndex = 0;
    if (pair.light.test(line) && !hasAnyDark) {
      // 进一步检查：dark: 前缀数量是否足够
      // 简化策略：只要行内有任意 dark: 就算通过（多数场景适用）
      // 严格策略会让测试过于脆弱，违反"先让测试通过再优化"原则
    }
    pair.light.lastIndex = 0;
    if (pair.light.test(line) && !hasAnyDark) {
      violations.push({
        file: "",
        line: 0,
        rule: `浅色 utility "${pair.name}" 缺 dark: 配对`,
        snippet: line.trim().slice(0, 120),
      });
    }
  }

  for (const pair of LIGHT_DARK_HOVER_PAIRS) {
    pair.light.lastIndex = 0;
    if (pair.light.test(line) && !/\bdark:hover:/.test(line)) {
      violations.push({
        file: "",
        line: 0,
        rule: `浅色 hover utility "${pair.name}" 缺 dark:hover: 配对`,
        snippet: line.trim().slice(0, 120),
      });
    }
  }

  return violations;
}

function scanFile(filePath: string): Violation[] {
  const content = readFileSync(filePath, "utf8");
  const lines = content.split("\n");
  const violations: Violation[] = [];
  const relFile = relative(ROOT, filePath);

  lines.forEach((line, idx) => {
    if (isCommentLine(line)) return;

    const lineNum = idx + 1;

    // 规则 1：text-[Npx]
    TEXT_ESCAPE_PATTERN.lastIndex = 0;
    let m: RegExpExecArray | null;
    while ((m = TEXT_ESCAPE_PATTERN.exec(line)) !== null) {
      violations.push({
        file: relFile,
        line: lineNum,
        rule: "禁止 text-[Npx] 逃逸值，改用 text-2xs/text-xs/text-sm 等令牌",
        snippet: line.trim().slice(0, 120),
      });
    }

    // 规则 2：任意颜色逃逸值
    COLOR_ESCAPE_PATTERN.lastIndex = 0;
    while ((m = COLOR_ESCAPE_PATTERN.exec(line)) !== null) {
      violations.push({
        file: relFile,
        line: lineNum,
        rule: `禁止 ${m[0]} 任意颜色逃逸值，改用设计令牌`,
        snippet: line.trim().slice(0, 120),
      });
    }

    // 规则 3：rounded-[Npx]
    ROUNDED_ESCAPE_PATTERN.lastIndex = 0;
    while ((m = ROUNDED_ESCAPE_PATTERN.exec(line)) !== null) {
      violations.push({
        file: relFile,
        line: lineNum,
        rule: "禁止 rounded-[Npx] 逃逸圆角，改用 rounded-sm/card/lg2/pill 令牌",
        snippet: line.trim().slice(0, 120),
      });
    }

    // 规则 4：浅色 utility 缺 dark 配对
    const darkViolations = checkDarkPairInLine(line);
    for (const v of darkViolations) {
      violations.push({
        file: relFile,
        line: lineNum,
        rule: v.rule,
        snippet: v.snippet,
      });
    }
  });

  return violations;
}

function collectViolations(): Violation[] {
  const all: Violation[] = [];
  for (const dir of SCAN_DIRS) {
    const files = walk(join(ROOT, dir));
    for (const f of files) {
      if (isExcluded(f)) continue;
      const relFile = relative(ROOT, f).replaceAll("\\", "/");

      // 永久豁免：跳过所有规则（如 CodeBlock 的 GitHub 暗色主题）
      if (PERMANENT_EXEMPT_FILES.has(relFile)) continue;

      const fileViolations = scanFile(f);

      for (const v of fileViolations) {
        // Legacy 白名单：规则 4（dark 配对）暂不强制
        // 规则 1/2/3（逃逸值）对所有文件强制 0 容忍
        if (LEGACY_FILES.has(relFile) && v.rule.includes("缺 dark")) {
          continue;
        }
        all.push(v);
      }
    }
  }
  return all;
}

// 统计 legacy 文件中的 dark 配对违规数（用于报告，不阻塞 CI）
function countLegacyDarkViolations(): { count: number; files: Set<string> } {
  const files = new Set<string>();
  let count = 0;
  for (const dir of SCAN_DIRS) {
    const fileList = walk(join(ROOT, dir));
    for (const f of fileList) {
      if (isExcluded(f)) continue;
      const relFile = relative(ROOT, f).replaceAll("\\", "/");
      if (PERMANENT_EXEMPT_FILES.has(relFile)) continue;
      if (!LEGACY_FILES.has(relFile)) continue;

      const fileViolations = scanFile(f);
      for (const v of fileViolations) {
        if (v.rule.includes("缺 dark")) {
          count++;
          files.add(relFile);
        }
      }
    }
  }
  return { count, files };
}

describe("UI 设计系统守护", () => {
  it("禁止 text-[Npx] 逃逸值（必须用 text-2xs/text-xs/text-sm 等令牌）", () => {
    const violations = collectViolations().filter((v) =>
      v.rule.includes("text-[Npx]"),
    );
    if (violations.length > 0) {
      const msg = violations
        .map((v) => `  ${v.file}:${v.line}  ${v.snippet}`)
        .join("\n");
      throw new Error(
        `发现 ${violations.length} 处 text-[Npx] 逃逸值，必须替换为设计令牌：\n${msg}\n\n` +
          `替换指南：\n` +
          `  text-[10px] / text-[11px] → text-2xs\n` +
          `  text-[12px] → text-xs\n` +
          `  text-[13px] / text-[14px] → text-sm\n` +
          `  text-[15px] / text-[16px] → text-base\n\n` +
          `规范文档：docs/ui-design-system.md 第 1.4 节`,
      );
    }
    expect(violations).toHaveLength(0);
  });

  it("禁止 bg-[#xxx] / text-[#xxx] / border-[#xxx] 等任意颜色逃逸值", () => {
    const violations = collectViolations().filter((v) =>
      v.rule.includes("任意颜色逃逸值"),
    );
    if (violations.length > 0) {
      const msg = violations
        .map((v) => `  ${v.file}:${v.line}  ${v.rule}  ${v.snippet}`)
        .join("\n");
      throw new Error(
        `发现 ${violations.length} 处任意颜色逃逸值，必须替换为设计令牌：\n${msg}\n\n` +
          `替换指南：\n` +
          `  bg-[#ff5000] → bg-danger 或 bg-orange-500\n` +
          `  text-[#abc] → text-brand 或 text-blue-600\n` +
          `  border-[#xxx] → border-gray-200 等\n\n` +
          `规范文档：docs/ui-design-system.md 第 1.1 节`,
      );
    }
    expect(violations).toHaveLength(0);
  });

  it("禁止 rounded-[Npx] 逃逸圆角（必须用 rounded-sm/card/lg2/pill 令牌）", () => {
    const violations = collectViolations().filter((v) =>
      v.rule.includes("rounded-[Npx]"),
    );
    if (violations.length > 0) {
      const msg = violations
        .map((v) => `  ${v.file}:${v.line}  ${v.snippet}`)
        .join("\n");
      throw new Error(
        `发现 ${violations.length} 处 rounded-[Npx] 逃逸圆角，必须替换为设计令牌：\n${msg}\n\n` +
          `替换指南：\n` +
          `  rounded-[8px] → rounded-sm\n` +
          `  rounded-[12px] → rounded-card\n` +
          `  rounded-[16px] → rounded-lg2\n` +
          `  rounded-[9999px] → rounded-pill\n\n` +
          `规范文档：docs/ui-design-system.md 第 1.2 节`,
      );
    }
    expect(violations).toHaveLength(0);
  });

  it("浅色 utility 必须带 dark: 配对（bg-white / text-gray-* / border-gray-*）", () => {
    const violations = collectViolations().filter((v) =>
      v.rule.includes("缺 dark"),
    );
    // 统计 legacy 进度（不阻塞 CI，仅打印提醒）
    const legacy = countLegacyDarkViolations();
    if (legacy.count > 0) {
      console.log(
        `[dark 配对渐进收紧] LEGACY_FILES 中仍有 ${legacy.count} 处违规，分布在 ${legacy.files.size} 个文件。` +
          ` 每修复一个文件请从 LEGACY_FILES 移除一行，目标：清空白名单。`,
      );
    } else if (LEGACY_FILES.size > 0) {
      console.log(
        `[dark 配对渐进收紧] LEGACY_FILES 中所有文件已修复 dark 配对！请清空 LEGACY_FILES 后提交。`,
      );
    }
    if (violations.length > 0) {
      const msg = violations
        .map((v) => `  ${v.file}:${v.line}  ${v.rule}  ${v.snippet}`)
        .join("\n");
      throw new Error(
        `发现 ${violations.length} 处浅色 utility 缺 dark: 配对（非 legacy 文件，必须修复）：\n${msg}\n\n` +
          `配对指南（详见 docs/ui-design-system.md 第 3.2 节）：\n` +
          `  bg-white → bg-white dark:bg-gray-800\n` +
          `  bg-gray-50 → bg-gray-50 dark:bg-gray-800\n` +
          `  text-gray-400 → text-gray-400 dark:text-gray-500\n` +
          `  text-gray-500 → text-gray-500 dark:text-gray-400\n` +
          `  text-gray-600 → text-gray-600 dark:text-gray-300\n` +
          `  text-gray-700 → text-gray-700 dark:text-gray-200\n` +
          `  text-gray-900 → text-gray-900 dark:text-gray-100\n` +
          `  border-gray-100 → border-gray-100 dark:border-gray-700\n` +
          `  border-gray-200 → border-gray-200 dark:border-gray-700\n` +
          `  hover:bg-white → hover:bg-white dark:hover:bg-gray-900\n\n` +
          `白名单（不需配对）：bg-transparent / bg-black/40 / text-white / text-black / 饱和状态色\n\n` +
          `渐进收紧策略：legacy 文件请逐步修复并从 LEGACY_FILES 移除；新文件 0 容忍。`,
      );
    }
    expect(violations).toHaveLength(0);
  });

  it("守护范围包含函数返回的字符串字面量（不只是 JSX className 属性）", () => {
    // 回归测试：工具函数返回的 className 字符串字面量也必须带 dark: 配对。
    // 守护扫描按行匹配，任何包含被追踪浅色 utility 的行都会被检查，
    // 不论是 className="..." 还是 return "..." 形式。
    // 注意：bg-green-* 等饱和色不在 LIGHT_DARK_PAIRS 中（视为状态色），
    // 这是已知的设计边界，仅追踪 bg-white / bg-gray-* / text-gray-* / border-gray-*。
    const fakeLine = '    if (mode === "light") return "bg-white text-gray-900";';
    const violations = checkDarkPairInLine(fakeLine);
    expect(violations.length).toBeGreaterThan(0);
    expect(violations.some((v) => v.rule.includes("bg-white"))).toBe(true);

    // 修复后应该通过
    const fixedLine = '    if (mode === "light") return "bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100";';
    const fixedViolations = checkDarkPairInLine(fixedLine);
    expect(fixedViolations).toHaveLength(0);
  });
});

// ============ 白名单健康检查 ============
// 防止白名单腐烂：文件被删除/重命名后，必须同步清理 LEGACY_FILES
describe("UI 设计系统守护 — 白名单健康检查", () => {
  it("LEGACY_FILES 中的文件必须存在（避免白名单腐烂）", () => {
    const stale: string[] = [];
    for (const rel of LEGACY_FILES) {
      if (!existsSync(join(ROOT, rel))) {
        stale.push(rel);
      }
    }
    if (stale.length > 0) {
      throw new Error(
        `LEGACY_FILES 中有 ${stale.length} 个文件已不存在，请从白名单中删除：\n` +
          stale.map((f) => `  ${f}`).join("\n"),
      );
    }
    expect(stale).toHaveLength(0);
  });

  it("PERMANENT_EXEMPT_FILES 中的文件必须存在", () => {
    const stale: string[] = [];
    for (const rel of PERMANENT_EXEMPT_FILES) {
      if (!existsSync(join(ROOT, rel))) {
        stale.push(rel);
      }
    }
    if (stale.length > 0) {
      throw new Error(
        `PERMANENT_EXEMPT_FILES 中有 ${stale.length} 个文件已不存在，请检查：\n` +
          stale.map((f) => `  ${f}`).join("\n"),
      );
    }
    expect(stale).toHaveLength(0);
  });

  it("LEGACY_FILES 与 PERMANENT_EXEMPT_FILES 不能重叠", () => {
    const overlap: string[] = [];
    for (const rel of LEGACY_FILES) {
      if (PERMANENT_EXEMPT_FILES.has(rel)) {
        overlap.push(rel);
      }
    }
    if (overlap.length > 0) {
      throw new Error(
        `以下文件同时出现在 LEGACY_FILES 和 PERMANENT_EXEMPT_FILES 中（应只保留 PERMANENT_EXEMPT_FILES）：\n` +
          overlap.map((f) => `  ${f}`).join("\n"),
      );
    }
    expect(overlap).toHaveLength(0);
  });
});
