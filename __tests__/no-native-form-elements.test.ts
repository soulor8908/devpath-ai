// __tests__/no-native-form-elements.test.ts
// 回归测试：禁止在 components/ui/ 之外使用原生 <input>/<select>/<textarea>/<button>
//
// 这是"统一表单组件"的护栏：每次有人新写表单组件，必须用 @/components/ui。
// 任何遗漏都会让本测试失败，并在控制台打印出具体的文件名和行号。
//
// 例外（白名单）：components/ui/ 目录下的统一组件实现本身
//
// 检测规则（正则）：
//   - <input\s 或 <input>
//   - <select\s 或 <select>
//   - <textarea\s 或 <textarea>
//   - <button\s 或 <button>
//
// 当前状态：过渡期。strict 测试 skip 中，先打印遗漏清单。
// Task 18 启用 strict 模式后，任何遗漏都会让 CI 失败。
//
// 卡帕西视角：测试即文档。这个测试告诉所有人"在 ui/ 之外禁止原生表单元素"，
// 比 100 行代码评审更可靠 — 因为它在每次 CI 都跑。

import { describe, it, expect } from "vitest";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const ROOT = process.cwd();
const SCAN_DIRS = ["components", "app"];
const EXCLUDE_DIRS = ["components/ui", "components/__tests__", "__tests__"];
const INCLUDE_EXT = [".tsx"];

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

// 匹配 JSX 中的 <input>/<select>/<textarea>/<button> 开标签（含多行）
// 重要：用 /g 全文匹配，不是按行匹配 — 因为 <button 后面通常换行写 onClick 等 props
// 单行扫描会漏掉所有多行 button（占 90%+），护栏形同虚设。
// 用全文 match + 通过 match.index 反推行号。
const PATTERN = /<(input|select|textarea|button)(\s[^>]*?)?(?:\/?)>/g;

function lineIndexOf(offset: number, content: string): number {
  // 返回 1-based 行号
  let line = 1;
  for (let i = 0; i < offset && i < content.length; i++) {
    if (content[i] === "\n") line++;
  }
  return line;
}

function isCommentLine(line: string): boolean {
  const trimmed = line.trim();
  return (
    trimmed.startsWith("//") ||
    trimmed.startsWith("*") ||
    trimmed.startsWith("/*")
  );
}

function scanFile(filePath: string): Violation[] {
  const content = readFileSync(filePath, "utf8");
  const lines = content.split("\n");
  const violations: Violation[] = [];
  let match;
  PATTERN.lastIndex = 0;
  while ((match = PATTERN.exec(content)) !== null) {
    const lineNum = lineIndexOf(match.index, content);
    const line = lines[lineNum - 1] ?? "";
    // 跳过注释行
    if (isCommentLine(line)) continue;
    violations.push({
      file: relative(ROOT, filePath),
      line: lineNum,
      snippet: line.trim().slice(0, 120),
    });
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

describe("no native form elements outside components/ui/", () => {
  it.skip("【strict，Task 18 启用】不允许在 components/ui/ 之外使用原生 <input>/<select>/<textarea>/<button>", () => {
    const violations = collectViolations();
    if (violations.length > 0) {
      const msg = violations
        .map((v) => `  ${v.file}:${v.line}  ${v.snippet}`)
        .join("\n");
      throw new Error(
        `发现 ${violations.length} 处原生表单元素，必须替换为 @/components/ui 组件库：\n${msg}\n\n` +
          `替换指南：\n` +
          `  <input type="text/password/number/date/time/range"> → <Input> 或 <Slider>\n` +
          `  <textarea> → <Textarea>\n` +
          `  <select> → <Select>\n` +
          `  <button>含文字 → <Button variant="...">\n` +
          `  <button>纯图标 → <Button iconOnly aria-label="...">`,
      );
    }
    expect(violations).toHaveLength(0);
  });

  it("【过渡】打印当前遗漏清单（Task 18 删除此测试）", () => {
    const violations = collectViolations();
    if (violations.length > 0) {
      // 按 file 分组打印，便于查看
      const byFile = new Map<string, number>();
      for (const v of violations) {
        byFile.set(v.file, (byFile.get(v.file) ?? 0) + 1);
      }
      const summary = Array.from(byFile.entries())
        .map(([f, n]) => `  ${f}  (${n} 处)`)
        .join("\n");
      console.log(
        `📋 当前还有 ${violations.length} 处原生表单元素需要替换，分布：\n${summary}`,
      );
    } else {
      console.log("✅ 无原生表单元素遗漏，可以启用 strict 模式了");
    }
    // 不抛错，只打印 — 让后续任务逐步消除
    expect(true).toBe(true);
  });
});
