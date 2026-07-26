/**
 * 旗舰轨道 preset 集成测试：
 * 策展图谱（编译产物）→ preset → PRESET_METAS / CAREER_PATHS 注册链路全量校验
 *
 * 这是 L1 内容层与 L4 交付层的接缝测试：
 * 保证 onboarding 职业卡、预设选择、计划生成、脑图、FSRS 能零改动消费策展内容。
 *
 * 注意：preset 数据已改为运行时 fetch JSON（v3，修复 Worker bundle > 3MB 部署失败），
 * 测试直接 import TS 源模块，不走 fetch，保证校验源码内容。
 */
import { describe, expect, it } from "vitest";

import rawGraph from "@/public/data/curriculum-graph.json";
import type { CurriculumGraph } from "@/lib/types";
import { computePath } from "@/lib/curriculum/path-engine";
import {
  matchPresetByTopic,
  PRESET_METAS,
  type PresetMeta,
} from "@/lib/presets";
import { CAREER_PATHS } from "@/lib/onboarding/career-paths";
import {
  CURRICULUM_TRACK_ID,
  FRONTEND_TO_AI_ENGINEER_PRESET,
} from "@/lib/presets/frontend-to-ai-engineer";

const graph = rawGraph as unknown as CurriculumGraph;
const trackNodes = graph.nodes.filter((n) =>
  n.tracks.includes(CURRICULUM_TRACK_ID),
);

// 测试直接 import TS 源模块（不走 fetch），校验源码内容
const presetMeta = PRESET_METAS.find((m) => m.id === CURRICULUM_TRACK_ID);
if (!presetMeta) throw new Error(`PRESET_METAS 缺少 ${CURRICULUM_TRACK_ID}`);
const preset: PresetMeta = { ...presetMeta, ...FRONTEND_TO_AI_ENGINEER_PRESET };

describe("preset 注册", () => {
  it("已在 PRESET_METAS 中注册且可加载", () => {
    expect(preset).toBeDefined();
    expect(PRESET_METAS.some((p) => p.id === CURRICULUM_TRACK_ID)).toBe(true);
  });

  it("topic 精确匹配可命中", () => {
    expect(matchPresetByTopic("前端工程师 → AI 工程师")?.id).toBe(
      CURRICULUM_TRACK_ID,
    );
  });

  it("不会被其他主题误匹配", () => {
    expect(matchPresetByTopic("前端性能优化")).toBeUndefined();
  });
});

describe("职业卡注册", () => {
  it("旗舰职业卡置顶且 linkedPresetId 可解析", () => {
    const card = CAREER_PATHS.find((c) => c.id === CURRICULUM_TRACK_ID);
    expect(card).toBeDefined();
    expect(CAREER_PATHS[0].id).toBe(CURRICULUM_TRACK_ID);
    expect(PRESET_METAS.some((p) => p.id === card!.linkedPresetId)).toBe(true);
  });

  it("职业卡每日分钟数与 preset 排程假设一致", () => {
    const card = CAREER_PATHS.find((c) => c.id === CURRICULUM_TRACK_ID);
    // preset schedule 按 60 分钟/天装箱（见 frontend-to-ai-engineer.ts）
    expect(card!.dailyMinutesDefault).toBe(60);
  });
});

describe("knowledgeTree 与策展图谱一致性", () => {
  it("节点数量与图谱轨道节点一致", () => {
    expect(preset!.knowledgeTree.length).toBe(trackNodes.length);
  });

  it("拓扑序合法：所有前置节点出现在依赖者之前", () => {
    const order = preset!.knowledgeTree.map((n) => n.id);
    const position = new Map(order.map((id, i) => [id, i] as const));
    for (const node of trackNodes) {
      for (const pre of node.prerequisites) {
        if (!position.has(pre)) continue; // 跨轨道前置不在本树中
        expect(position.get(pre)!).toBeLessThan(position.get(node.id)!);
      }
    }
  });

  it("与路径引擎 computePath 的输出顺序一致", () => {
    const path = computePath(graph, {
      trackId: CURRICULUM_TRACK_ID,
      knownNodeIds: [],
      dailyMinutes: 60,
    });
    expect(preset!.knowledgeTree.map((n) => n.id)).toEqual(
      path.orderedNodeIds,
    );
  });

  it("每个节点字段完整（标题/摘要/难度/频次）", () => {
    for (const node of preset!.knowledgeTree) {
      expect(node.title.length).toBeGreaterThan(0);
      expect(node.summary.length).toBeGreaterThan(0);
      expect(node.difficulty).toBeGreaterThanOrEqual(1);
      expect(node.difficulty).toBeLessThanOrEqual(5);
      expect(["高", "中", "低"]).toContain(node.frequency);
    }
  });
});

describe("questions 与知识树引用完整性", () => {
  it("每个节点至少 1 道面试题", () => {
    const byNode = new Map<string, number>();
    for (const q of preset!.questions) {
      byNode.set(q.nodeId, (byNode.get(q.nodeId) ?? 0) + 1);
    }
    for (const node of preset!.knowledgeTree) {
      expect(byNode.get(node.id) ?? 0).toBeGreaterThanOrEqual(1);
    }
  });

  it("题目 id 全局唯一且字段非空", () => {
    const ids = new Set<string>();
    for (const q of preset!.questions) {
      expect(ids.has(q.id)).toBe(false);
      ids.add(q.id);
      expect(q.question.length).toBeGreaterThan(0);
      expect(q.answer.length).toBeGreaterThan(0);
      expect(q.keyPoints.length).toBeGreaterThan(0);
    }
  });

  it("所有题目引用的节点都存在于知识树", () => {
    const treeIds = new Set(preset!.knowledgeTree.map((n) => n.id));
    for (const q of preset!.questions) {
      expect(treeIds.has(q.nodeId)).toBe(true);
    }
  });
});

describe("schedule 与路径引擎一致性", () => {
  it("每个节点恰好 1 次 learn + 1 次 review", () => {
    const learn = preset!.schedule.filter((s) => s.type === "learn");
    const review = preset!.schedule.filter((s) => s.type === "review");
    expect(learn.length).toBe(trackNodes.length);
    expect(review.length).toBe(trackNodes.length);
    expect(new Set(learn.map((s) => s.nodeId)).size).toBe(trackNodes.length);
  });

  it("learn 顺序与 computePath 拓扑序一致", () => {
    const path = computePath(graph, {
      trackId: CURRICULUM_TRACK_ID,
      knownNodeIds: [],
      dailyMinutes: 60,
    });
    const learnOrder = preset!.schedule
      .filter((s) => s.type === "learn")
      .map((s) => s.nodeId);
    expect(learnOrder).toEqual(path.orderedNodeIds);
  });

  it("review 排在 learn 次日", () => {
    for (const item of preset!.schedule) {
      if (item.type !== "review") continue;
      const learnItem = preset!.schedule.find(
        (s) => s.type === "learn" && s.nodeId === item.nodeId,
      );
      expect(learnItem).toBeDefined();
      expect(item.day).toBe(learnItem!.day + 1);
    }
  });

  it("每日 learn 总时长不超过排程假设（超大节点独占一天除外）", () => {
    const byDay = new Map<number, number>();
    for (const item of preset!.schedule) {
      if (item.type !== "learn") continue;
      byDay.set(item.day, (byDay.get(item.day) ?? 0) + item.estimatedMinutes);
    }
    for (const [day, minutes] of byDay) {
      const items = preset!.schedule.filter(
        (s) => s.type === "learn" && s.day === day,
      );
      if (items.length === 1) continue; // 独占一天的超大节点
      expect(minutes).toBeLessThanOrEqual(60);
    }
  });
});
