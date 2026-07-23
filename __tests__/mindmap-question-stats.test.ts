// __tests__/mindmap-question-stats.test.ts
// 守护测试：MindMap 必须支持 questionStats prop + 搜索高亮
//
// 这是 docs/superpowers/specs/2026-07-23-ui-redesign-and-learning-page-rework-design.md
// 设计点 5（优化 1 + 优化 2）的"执法者"（卡帕西视角）：
//   - 测试即文档：脑图节点显示题目数 X/Y，搜索关键词高亮匹配节点
//   - CI 即评审：防止有人移除 questionStats prop 或搜索功能
//
// 守护内容：
//   1. MindMap 接受 questionStats?: Record<string, { total, understood }> prop
//   2. 节点元信息渲染 `X/Y 题` 格式（understood/total）
//   3. MindMap 有搜索 Input（左上角，placeholder 含"搜索"）
//   4. 搜索匹配逻辑：matchedIds + 变灰 opacity
//   5. PlanDetailClient 计算 questionStats 并传给 MindMap
//
// 设计动机（乔布斯视角）：
//   - 节点只显示 mastery 百分比不够，用户需要知道"几道题/答对几道"
//   - 知识树节点多时搜索是刚需，高亮 + 变灰让用户 3 秒找到目标

import { describe, it, expect } from "vitest";
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const ROOT = process.cwd();
const MINDMAP_FILE = join(ROOT, "components", "MindMap.tsx");
const PLAN_DETAIL_FILE = join(ROOT, "app", "learn", "[planId]", "PlanDetailClient.tsx");

function readSource(file: string): string {
  if (!existsSync(file)) {
    throw new Error(`文件不存在：${file}`);
  }
  return readFileSync(file, "utf-8");
}

describe("MindMap：questionStats prop + 搜索高亮", () => {
  const src = readSource(MINDMAP_FILE);

  it("MindMap.tsx 文件存在且可读", () => {
    expect(src.length).toBeGreaterThan(0);
  });

  it("MindMapProps 接口含 questionStats prop", () => {
    // 匹配 questionStats?: Record<string, { total: number; understood: number }>;
    expect(src).toMatch(/questionStats\?\s*:\s*Record<string,\s*\{\s*total:\s*number;\s*understood:\s*number\s*\}\s*>/);
  });

  it("节点渲染 `X/Y 题` 格式（understood/total）", () => {
    // 匹配 {stats.understood}/{stats.total} 题
    expect(src).toMatch(/stats\.understood[^]*stats\.total[^]*题/);
  });

  it("understood 全部时高亮绿色（#15803d）", () => {
    expect(src).toMatch(/stats\.understood\s*>=\s*stats\.total/);
  });

  it("有搜索 Input 组件（placeholder 含「搜索」）", () => {
    expect(src).toMatch(/<Input\b/);
    expect(src).toMatch(/placeholder=["']搜索/);
  });

  it("使用 leftIcon=\"search\" 图标", () => {
    expect(src).toContain('leftIcon="search"');
  });

  it("搜索匹配逻辑：matchedIds + isDimmed 变灰", () => {
    expect(src).toMatch(/matchedIds/);
    expect(src).toMatch(/isDimmed/);
    // 变灰节点 opacity 0.25
    expect(src).toMatch(/opacity:\s*isDimmed\s*\?\s*0\.25/);
  });

  it("搜索匹配节点边框加粗（strokeWidth 3）+ 蓝色高亮", () => {
    expect(src).toMatch(/isMatched\s*&&\s*matchedIds\s*!==\s*null/);
    // strokeWidth 是 const 变量：搜索匹配时为 3
    expect(src).toMatch(/const\s+strokeWidth\s*=\s*isMatched\s*&&\s*matchedIds\s*!==\s*null\s*\?\s*3/);
    // 搜索匹配时边框颜色为蓝色 #3b82f6
    expect(src).toMatch(/isMatched\s*&&\s*matchedIds\s*!==\s*null\s*\?\s*["']#3b82f6["']/);
  });

  it("按 Enter 触发 fitViewToMatches 聚焦匹配节点", () => {
    expect(src).toMatch(/fitViewToMatches/);
    expect(src).toMatch(/e\.key\s*===\s*["']Enter["']/);
  });
});

describe("PlanDetailClient：计算 questionStats 并传入 MindMap", () => {
  const src = readSource(PLAN_DETAIL_FILE);

  it("PlanDetailClient.tsx 文件存在且可读", () => {
    expect(src.length).toBeGreaterThan(0);
  });

  it("用 useMemo 计算 questionStats（按 nodeId 分组）", () => {
    expect(src).toMatch(/questionStats\s*=\s*useMemo/);
    expect(src).toMatch(/stats\[q\.nodeId\]\.total/);
    expect(src).toMatch(/q\.understood/);
  });

  it("questionStats 依赖 plan（实时更新）", () => {
    // 依赖数组含 plan，确保标记"看懂"后 plan 更新 → questionStats 重算
    // 用 [plan] 而非 [plan.questions] 是因为 hooks 必须在早返回前调用，plan 可能为 null
    expect(src).toMatch(/\},\s*\[plan\]\)/);
  });

  it("把 questionStats 传给 <MindMap>", () => {
    // 匹配 <MindMap ... questionStats={questionStats} ... />
    expect(src).toMatch(/<MindMap[\s\S]*?questionStats=\{questionStats\}/);
  });

  it("导入 useMemo", () => {
    expect(src).toMatch(/import\s*\{[^}]*useMemo[^}]*\}\s*from\s*["']react["']/);
  });
});
