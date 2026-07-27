// __tests__/home-auto-reload-guard.test.ts
// useHomeData 窗口聚焦自动 reload 守护测试
//
// 守护 2026-07-27 修复（用户反馈"训练页学会了，回首页 PathProgressBar 进度不更新
// + 已 mastered 节点仍在今日清单"）：
//   - useHomeData 原本只在 mount 时调 load，无自动刷新机制
//   - 用户从训练页/计划详情页回首页时，首页 hook 不重新加载，显示旧数据
//   - 修复：监听 visibilitychange + focus，窗口聚焦时自动 reload（带节流）
//
// 这是行为守护（卡帕西视角）：
//   - 测试即文档：每条断言说明一个必须存在的逻辑点
//   - CI 即评审：防止未来重构时误删自动刷新机制
//   - 误删任一关键标记 → 测试失败 → CI red
//
// 检测策略：源码级别扫描 lib/home.ts，断言关键标记存在
// （不验证运行时行为，因为 useHomeData 是 React hook，集成测试成本高；
//   源码守护已足以防止"误删整段逻辑"的最常见失效模式）

import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const SOURCE = readFileSync(
  resolve(__dirname, "../lib/home.ts"),
  "utf-8",
);

describe("useHomeData 窗口聚焦自动 reload 守护", () => {
  it("监听 visibilitychange 事件（用户切回标签页时触发 reload）", () => {
    expect(SOURCE).toContain("visibilitychange");
  });

  it("监听 window focus 事件（窗口聚焦时触发 reload）", () => {
    expect(SOURCE).toContain('"focus"');
  });

  it("有节流逻辑（避免短时间多次刷新，如切标签页快速来回）", () => {
    expect(SOURCE).toContain("RELOAD_THROTTLE_MS");
  });

  it("SSR 安全（typeof window 检查，避免服务端渲染崩溃）", () => {
    expect(SOURCE).toContain('typeof window === "undefined"');
  });

  it("仅在 visible 状态时触发 reload（hidden 时不触发，避免无效刷新）", () => {
    expect(SOURCE).toContain('document.visibilityState === "visible"');
  });

  it("用 lastLoadRef 记录上次 load 时间（节流对比基准）", () => {
    expect(SOURCE).toContain("lastLoadRef");
  });

  it("事件监听有清理函数（组件卸载时移除监听，避免内存泄漏）", () => {
    // 检查 removeEventListener 至少出现 2 次（visibilitychange + focus 各一次）
    const removeCount = (SOURCE.match(/removeEventListener/g) || []).length;
    expect(removeCount).toBeGreaterThanOrEqual(2);
  });
});
