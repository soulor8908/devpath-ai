// __tests__/async-button-loading-guard.test.ts
// 守护测试：async onClick 的 Button 必须带 loading prop
//
// 背景（2026-07-27）：
//   - 用户反馈"项目很多地方点击体验不友好，没有 loading 提示，页面响应慢"
//   - 部署失败根因之一：TrainSessionFlow.tsx 声明了 submitting/favoriting state 但没接到
//     Button 的 loading prop → ESLint no-unused-vars 失败 → next build 失败 → CF 部署失败
//   - 修复后引入此守护测试，防止未来新加异步按钮漏掉 loading 反馈，导致同类问题再现
//
// 规则：
//   扫描 components/ 和 app/ 下所有 .tsx 文件（components/ui/ 除外）
//   检测每个 <Button ...> 开标签：
//     - 若 onClick 形如 onClick={async ...}（异步回调）
//     - 则同开标签内必须出现 loading={...} prop
//   违反则报错，打印文件路径 + 行号 + 开标签内容
//
// 卡帕西视角：
//   1. async onClick 几乎都对应"写 IndexedDB / 调 AI API / 网络请求"等耗时操作
//   2. 没有 loading 反馈 = 用户点击后无视觉反馈 = 用户连点 = 重复造卡/竞态/体验差
//   3. 守护测试比代码评审更可靠 — 一旦漏掉 loading 反馈，CI 立即失败
//
// 例外：components/ui/ 是统一组件库实现本身，不扫描
// 同步 onClick（onClick={() => ...}）不强制要求 loading，因为同步操作无延迟

import { describe, it, expect } from "vitest";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const ROOT = process.cwd();
const SCAN_DIRS = ["components", "app"];
const EXCLUDE_DIRS = ["components/ui", "components/__tests__", "__tests__"];
const INCLUDE_EXT = [".tsx"];

// 匹配整个 <Button ...>...</Button> 块（含跨行 props 和 children）
// 重要：不能用 [^>]* 匹配开标签——onClick={async () => {...}} 中的箭头函数 =>
// 包含 > 字符，会让 [^>]* 在 => 处提前结束，导致检测漏掉 loading prop。
// 改为匹配 <Button ... </Button> 整块（Button 实际不嵌套 Button，非贪婪 [\s\S]*? 安全）
// 自闭合 <Button ... /> 也覆盖（用 \/?> 也能匹配，但实际 Button 都有 children）
const BUTTON_BLOCK = /<Button\b[\s\S]*?<\/Button>/g;
// onClick 是 async 箭头函数：onClick={async ... 或 onClick={ async ...
const ASYNC_ONCLICK = /onClick=\{\s*async\b/;
// loading prop 存在：loading={...
const LOADING_PROP = /loading=\{/;

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

function isExcluded(filePath: string): boolean {
  const rel = relative(ROOT, filePath).replaceAll("\\", "/");
  return EXCLUDE_DIRS.some((d) => rel.startsWith(d + "/") || rel === d);
}

function lineIndexOf(offset: number, content: string): number {
  let line = 1;
  for (let i = 0; i < offset && i < content.length; i++) {
    if (content[i] === "\n") line++;
  }
  return line;
}

function scanFile(filePath: string): Violation[] {
  const content = readFileSync(filePath, "utf8");
  const violations: Violation[] = [];
  let match;
  BUTTON_BLOCK.lastIndex = 0;
  while ((match = BUTTON_BLOCK.exec(content)) !== null) {
    const blockContent = match[0];
    if (ASYNC_ONCLICK.test(blockContent) && !LOADING_PROP.test(blockContent)) {
      const lineNum = lineIndexOf(match.index, content);
      violations.push({
        file: relative(ROOT, filePath),
        line: lineNum,
        snippet: blockContent.replace(/\s+/g, " ").slice(0, 200),
      });
    }
  }
  return violations;
}

function collectViolations(): Violation[] {
  const all: Violation[] = [];
  for (const dir of SCAN_DIRS) {
    const files = walk(join(ROOT, dir));
    for (const f of files) {
      if (isExcluded(f)) continue;
      all.push(...scanFile(f));
    }
  }
  return all;
}

describe("async onClick Button must have loading prop", () => {
  it("异步 onClick 的 Button 必须带 loading prop（防止点击无反馈）", () => {
    const violations = collectViolations();
    if (violations.length > 0) {
      const msg = violations
        .map((v) => `  ${v.file}:${v.line}  ${v.snippet}`)
        .join("\n");
      throw new Error(
        `发现 ${violations.length} 处 Button 的 onClick 是 async 但缺 loading prop：\n${msg}\n\n` +
          `修复指南：\n` +
          `  1. 在组件中加 const [loading, setLoading] = useState(false)\n` +
          `  2. onClick 改为 async + 包 try { ... } finally { setLoading(false) }\n` +
          `     开头加 setLoading(true)\n` +
          `  3. 给 Button 加 loading={loading} prop\n\n` +
          `原因：async onClick 几乎都是耗时操作（IndexedDB 写入 / AI 调用 / 网络请求），\n` +
          `  没有 loading 反馈会让用户以为点击没生效，连点导致重复造卡 / 竞态 / 体验差。\n` +
          `  参考已修复组件：TrainSessionFlow / QuestionCard / KnowledgeTree / MistakeBookClient`,
      );
    }
    expect(violations).toHaveLength(0);
  });
});
