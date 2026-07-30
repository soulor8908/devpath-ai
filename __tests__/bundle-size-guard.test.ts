// __tests__/bundle-size-guard.test.ts
// 打包体积守护测试（2026-07-30 性能优化闭环）
//
// 背景：
//   Cloudflare Pages 在国内访问慢，对体积敏感。2026-07-30 性能优化前：
//   - 933KB preset chunk（FRONTEND_PRESET TS 源码被 dynamic import 拉进客户端）
//   - qrcode（60KB）静态 import 进 /u/[username] 首屏
//   - stats 页 3 个 tab 全静态 import（163KB First Load）
//   - 重模态（ModelConfigModal/PortfolioEditorModal/...）静态 import
//
// 闭环解法（两层守护）：
//   1. 源码级守护：扫描 components/ 和 app/ 下 .tsx/.ts，禁止静态 import
//      已知重库（必须用 next/dynamic 或 await import）
//   2. 构建产物守护：若 .next/app-build-manifest.json 存在（本地或 CI build 后），
//      检查关键路由 First Load JS 不超过阈值
//
// 卡帕西视角：
//   - 源码级守护先于构建发现问题，反馈更快
//   - 阈值基于 2026-07-30 优化后的体积 + 20% 余量，防止未来回潮
//   - 测试即文档：每条禁用规则说明为什么这个库不能静态 import

import { describe, it, expect } from "vitest";
import { readdirSync, readFileSync, statSync, existsSync } from "node:fs";
import { join, relative, resolve } from "node:path";
import { gzipSync } from "node:zlib";

const ROOT = process.cwd();

// ============================================================
// 第一层：源码级守护 —— 禁止静态 import 重库
// ============================================================

const SCAN_DIRS = ["components", "app", "lib"];
const INCLUDE_EXT = [".tsx", ".ts"];

// 重库黑名单：静态 import 会把整个库打进首屏 chunk
// 这些库必须用 next/dynamic 或 await import() 异步加载
// 例外：lib/share-image.ts 已封装动态 import，是合法入口
// 例外：lib/presets/index.ts 用 fetch JSON，preset TS 文件只用于脚本/测试
const HEAVY_MODULE_RULES: Array<{
  pattern: RegExp;
  reason: string;
  /** 允许静态 import 的文件白名单（相对 ROOT 的路径前缀） */
  allowIn?: string[];
}> = [
  {
    pattern: /from\s+['"]html-to-image['"]/,
    reason:
      "html-to-image（~50KB）必须动态 import。请在 lib/share-image.ts 或调用处用 await import('html-to-image')。",
    allowIn: ["lib/share-image.ts"],
  },
  {
    pattern: /from\s+['"]qrcode['"]/,
    reason:
      "qrcode（~60KB）必须动态 import。请在调用处用 const QRCode = await import('qrcode')。",
    allowIn: ["lib/share-image.ts"],
  },
  {
    pattern: /from\s+['"]recharts['"]/,
    reason:
      "recharts（~234KB vendor）必须通过 next/dynamic 包装的组件异步加载。参考 components/RadarChart.tsx 的模式。",
    allowIn: ["components/RadarChartContent.tsx"],
  },
  {
    pattern: /from\s+['"]react-activity-calendar['"]/,
    reason:
      "react-activity-calendar（~80KB）必须通过 next/dynamic 包装的组件异步加载。参考 components/HeatmapContent.tsx 的模式。",
    allowIn: ["components/HeatmapContent.tsx"],
  },
  {
    pattern: /from\s+['"]@xenova\/transformers['"]/,
    reason:
      "@xenova/transformers（数十 MB）禁止进客户端 bundle。仅 scripts/ 下构建脚本可用。",
    allowIn: ["scripts/"],
  },
  // preset TS 源文件含 13k 行数据，禁止客户端静态 import
  // 客户端必须用 lib/presets/index.ts 的 loadPresetData（fetch JSON）
  {
    pattern: /from\s+['"]@\/lib\/presets\/(frontend|backend|ai|llm-app|algorithm-200|frontend-to-ai-engineer)['"]/,
    reason:
      "preset TS 源文件（含 13k 行数据，933KB chunk）禁止客户端 import。客户端用 lib/presets/index.ts 的 loadPresetData(id) 走 fetch JSON。脚本/测试可用。",
    allowIn: ["scripts/", "__tests__/"],
  },
];

interface SourceViolation {
  file: string;
  line: number;
  lineContent: string;
  reason: string;
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

function isAllowed(filePath: string, allowIn?: string[]): boolean {
  if (!allowIn || allowIn.length === 0) return false;
  const rel = relative(ROOT, filePath).replaceAll("\\", "/");
  return allowIn.some((p) => rel.startsWith(p));
}

function scanSourceFile(filePath: string): SourceViolation[] {
  const content = readFileSync(filePath, "utf8");
  const lines = content.split("\n");
  const violations: SourceViolation[] = [];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    for (const rule of HEAVY_MODULE_RULES) {
      if (rule.pattern.test(line) && !isAllowed(filePath, rule.allowIn)) {
        violations.push({
          file: relative(ROOT, filePath),
          line: i + 1,
          lineContent: line.trim(),
          reason: rule.reason,
        });
      }
    }
  }
  return violations;
}

function collectSourceViolations(): SourceViolation[] {
  const all: SourceViolation[] = [];
  for (const dir of SCAN_DIRS) {
    const files = walk(join(ROOT, dir));
    for (const f of files) {
      all.push(...scanSourceFile(f));
    }
  }
  return all;
}

describe("源码级守护：禁止静态 import 重库", () => {
  it("components/app/lib 下不得静态 import 重库（必须用 dynamic import）", () => {
    const violations = collectSourceViolations();
    if (violations.length > 0) {
      const msg = violations
        .map(
          (v) =>
            `  ${v.file}:${v.line}\n    ${v.lineContent}\n    → ${v.reason}`,
        )
        .join("\n\n");
      throw new Error(
        `发现 ${violations.length} 处违规静态 import 重库：\n${msg}\n\n` +
          `修复指南：\n` +
          `  1. 改用 next/dynamic（组件级异步加载）或 await import()（函数级异步加载）\n` +
          `  2. 重库包括：html-to-image / qrcode / recharts / react-activity-calendar / @xenova/transformers / preset TS 源文件\n` +
          `  3. 客户端 preset 数据用 lib/presets/index.ts 的 loadPresetData(id) 走 fetch JSON\n` +
          `  4. 参考已优化组件：RadarChart / Heatmap / share-image / demo/preset-data`,
      );
    }
    expect(violations).toHaveLength(0);
  });
});

// ============================================================
// 第二层：构建产物守护 —— 关键路由 First Load JS 阈值
// ============================================================

// 阈值基于 2026-07-30 优化后的体积 + 20% 余量（KB）
// 防止未来回潮：新增静态 import 会让体积上涨，超阈值即 CI 失败
// 阈值调整规则：只能下调（更严格），不能上调（放松）
// 调整时必须在 commit message 说明原因并同步本注释
const ROUTE_THRESHOLDS_KB: Record<string, number> = {
  "/": 230, // 当前 189 kB，阈值 230 kB
  "/learn/new": 200, // 当前 165 kB
  "/learn/[planId]": 220, // 当前 181 kB
  "/profile": 210, // 当前 172 kB
  "/review": 195, // 当前 161 kB
  "/stats": 150, // 当前 122 kB（优化重点：曾 163 kB）
  "/mistakes": 155, // 当前 127 kB（优化重点：曾 157 kB）
  "/train": 225, // 当前 185 kB
  "/interview": 185, // 当前 151 kB
  "/portfolio": 185, // 当前 152 kB
  "/emotion": 195, // 当前 160 kB
  "/u/[username]": 155, // 当前 127 kB（优化重点：曾 136 kB）
};

const MANIFEST_PATH = resolve(ROOT, ".next/app-build-manifest.json");
const ROUTES_MANIFEST_PATH = resolve(ROOT, ".next/app-path-routes-manifest.json");
const CHUNKS_DIR = resolve(ROOT, ".next/static/chunks");

function chunkSizeKB(chunkPath: string): number {
  const full = resolve(CHUNKS_DIR, chunkPath.replace(/^static\/chunks\//, ""));
  try {
    // Next.js 报告的 First Load JS 是 gzipped 大小，这里用 gzipSync 对齐
    // 原始文件大小约是 gzipped 的 3x，直接用原始大小会让阈值失真
    const content = readFileSync(full);
    const gzipped = gzipSync(content);
    return gzipped.length / 1024;
  } catch {
    return 0;
  }
}

function computeRouteFirstLoadKB(routeKey: string, manifest: { pages: Record<string, string[]> }): number {
  // First Load JS = layout chunks + page chunks（含 shared chunks）
  const layoutChunks = manifest.pages["/layout"] ?? [];
  const pageChunks = manifest.pages[routeKey] ?? [];
  const all = new Set<string>([...layoutChunks, ...pageChunks]);
  let total = 0;
  for (const c of all) {
    if (c.endsWith(".css")) continue; // CSS 不算 JS 体积
    total += chunkSizeKB(c);
  }
  return total;
}

const hasBuildOutput = existsSync(MANIFEST_PATH) && existsSync(ROUTES_MANIFEST_PATH);

describe.runIf(hasBuildOutput)("构建产物守护：关键路由 First Load JS 阈值", () => {
  it("关键路由 First Load JS 不超过阈值（防止体积回潮）", () => {
    const manifest = JSON.parse(readFileSync(MANIFEST_PATH, "utf8")) as {
      pages: Record<string, string[]>;
    };
    const routes = JSON.parse(readFileSync(ROUTES_MANIFEST_PATH, "utf8")) as Record<string, string>;

    const violations: Array<{ route: string; size: number; threshold: number }> = [];

    for (const [pageKey, routePath] of Object.entries(routes)) {
      const threshold = ROUTE_THRESHOLDS_KB[routePath];
      if (!threshold) continue; // 未设阈值的路由不检查
      const size = computeRouteFirstLoadKB(pageKey, manifest);
      if (size > threshold) {
        violations.push({ route: routePath, size: Math.round(size), threshold });
      }
    }

    if (violations.length > 0) {
      const msg = violations
        .map((v) => `  ${v.route}: ${v.size} KB > 阈值 ${v.threshold} KB`)
        .join("\n");
      throw new Error(
        `发现 ${violations.length} 个路由 First Load JS 超阈值：\n${msg}\n\n` +
          `修复指南：\n` +
          `  1. 检查最近改动是否新增静态 import 重库/重组件\n` +
          `  2. 把重组件改用 next/dynamic 异步加载（参考 stats 页 3 tab 模式）\n` +
          `  3. 重库（recharts/qrcode/html-to-image）必须动态 import\n` +
          `  4. 若阈值确实需要上调，必须在 commit message 说明原因，并同步更新本测试阈值注释\n` +
          `  5. 阈值只能下调（更严格），不能上调（放松）`,
      );
    }

    expect(violations).toHaveLength(0);
  });

  it("layout chunks 总体积不超过 130 KB（框架+主包+布局基线）", () => {
    const manifest = JSON.parse(readFileSync(MANIFEST_PATH, "utf8")) as {
      pages: Record<string, string[]>;
    };
    const layoutChunks = manifest.pages["/layout"] ?? [];
    let total = 0;
    for (const c of layoutChunks) {
      if (c.endsWith(".css")) continue;
      total += chunkSizeKB(c);
    }
    // 当前约 118 KB（gzipped），阈值 130 KB
    // 含 webpack runtime + framework + main-app + layout 组件 + Nav + GlobalWidgets 等
    // Next.js 报告的 "shared by all" 103 KB 只含跨路由共享的框架 chunk，
    // 本测试的 layout chunks 还包含布局组件本身，故阈值更宽松
    // 超过说明布局层引入了新依赖或重组件，需排查
    expect(Math.round(total)).toBeLessThanOrEqual(130);
  });
});
