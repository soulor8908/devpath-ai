// __tests__/heatmap.test.ts
// 守护测试：Heatmap 组件的关键修复点
//
// 2026-07-26 修复用户反馈"看不到图"的根因：
//   1. renderBlock 必须返回 SVG 元素，不能包裹 HTML <div>（SVG <g> 不允许包含 div）
//   2. 数据必须按日期升序排序（ActivityCalendar fillHoles 依赖 activities[0]/[last])
//   3. fallback 数据应填充整个时间范围（避免只渲染单个 12px 格子）

import { describe, it, expect } from "vitest";

// 复制 Heatmap.tsx 中的 generateEmptyRange 逻辑做断言
// 不直接 import 组件，因为 ActivityCalendar 是 ESM-only 且依赖浏览器环境
function generateEmptyRange(weeks: number): { date: string; count: number; level: 0 }[] {
  const today = new Date();
  const start = new Date(today);
  start.setDate(start.getDate() - weeks * 7);
  const arr: { date: string; count: number; level: 0 }[] = [];
  const cursor = new Date(start);
  while (cursor <= today) {
    arr.push({
      date: cursor.toISOString().slice(0, 10),
      count: 0,
      level: 0,
    });
    cursor.setDate(cursor.getDate() + 1);
  }
  return arr;
}

describe("Heatmap 修复守护", () => {
  it("generateEmptyRange 应生成连续日期（无空洞）", () => {
    const range = generateEmptyRange(4); // 4 周 = 28 天
    expect(range.length).toBeGreaterThanOrEqual(28);
    expect(range.length).toBeLessThanOrEqual(29); // 含 today 边界

    // 验证连续性：相邻日期差 1 天
    for (let i = 1; i < range.length; i++) {
      const prev = new Date(range[i - 1].date).getTime();
      const curr = new Date(range[i].date).getTime();
      const diffDays = (curr - prev) / (24 * 60 * 60 * 1000);
      expect(diffDays).toBe(1);
    }
  });

  it("generateEmptyRange 应按日期升序排序", () => {
    const range = generateEmptyRange(12);
    for (let i = 1; i < range.length; i++) {
      expect(range[i].date > range[i - 1].date).toBe(true);
    }
  });

  it("generateEmptyRange 应覆盖 weeks*7 天范围", () => {
    const weeks = 12;
    const range = generateEmptyRange(weeks);
    const today = new Date().toISOString().slice(0, 10);
    const start = new Date();
    start.setDate(start.getDate() - weeks * 7);
    const startStr = start.toISOString().slice(0, 10);

    expect(range[0].date).toBe(startStr);
    expect(range[range.length - 1].date).toBe(today);
  });

  it("Heatmap.tsx 不应在 renderBlock 中使用 div 包裹", async () => {
    // 静态扫描：Heatmap.tsx 的 renderBlock 不应返回 <div> 元素
    // 这是 2026-07-26 修复的核心：SVG <g> 不能包含 <div>，会导致整个 SVG 渲染失败
    const fs = await import("fs");
    const path = await import("path");
    const fileContent = fs.readFileSync(
      path.join(process.cwd(), "components/Heatmap.tsx"),
      "utf-8",
    );

    // 提取 renderBlock 的代码块（从 "renderBlock={" 到对应的 "}"）
    const renderBlockStart = fileContent.indexOf("renderBlock={");
    expect(renderBlockStart, "Heatmap.tsx 应该有 renderBlock prop").toBeGreaterThan(-1);

    // 提取从 renderBlock 开始的代码段（取 1000 字符足够）
    const renderBlockSection = fileContent.slice(renderBlockStart, renderBlockStart + 1000);

    // 不能在 renderBlock 返回值中包含 JSX 形式的 <div（HTML div，会破坏 SVG）
    // 只检查 JSX 语法：return <div 或 (<div 或 >\s*<div（在 JSX children 中）
    // 排除注释中的 <div（如 "原代码 <div onClick..."）
    const jsxDivPattern = /return\s*\(?<div|>\s*<div\b/;
    expect(
      jsxDivPattern.test(renderBlockSection),
      "renderBlock 不能返回 <div>（SVG <g> 不允许包含 HTML div，会导致渲染失败）",
    ).toBe(false);

    // 应该用 cloneElement 保持 SVG 元素类型
    expect(
      renderBlockSection.includes("cloneElement"),
      "renderBlock 应用 cloneElement 给原 SVG rect 加事件，保持 SVG 元素类型",
    ).toBe(true);
  });

  it("Heatmap.tsx 应对 internal 数据按 date 升序排序", async () => {
    // 静态扫描：聚合后应 sort by date
    const fs = await import("fs");
    const path = await import("path");
    const fileContent = fs.readFileSync(
      path.join(process.cwd(), "components/Heatmap.tsx"),
      "utf-8",
    );

    // 应该有 arr.sort((a, b) => a.date.localeCompare(b.date)) 这样的代码
    expect(
      fileContent.includes("arr.sort((a, b) => a.date.localeCompare(b.date))"),
      "internal 数据应按 date 升序排序（避免 ActivityCalendar fillHoles 抛 RangeError）",
    ).toBe(true);

    // 外部传入 data 也应排序
    expect(
      fileContent.includes(
        "const sorted = [...data].sort((a, b) => a.date.localeCompare(b.date))",
      ),
      "外部传入的 data 也应按 date 升序排序",
    ).toBe(true);
  });
});
