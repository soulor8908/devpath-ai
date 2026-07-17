// __tests__/energy-regression.test.ts
// 测试能量回归模型的特征工程增强（P3）：
//   1. extractFeatures 返回 8 维向量
//   2. dopamineToNumeric 映射
//   3. predictActualMinutes 向后兼容旧 4 权重模型
//   4. predictActualMinutes 新 8 权重模型
//   5. trainEnergyModel 产出 8 权重模型

import { describe, it, expect } from "vitest";
import {
  extractFeatures,
  dopamineToNumeric,
  getHourFromISO,
  getDayOfWeekFromDate,
  predictActualMinutes,
  trainEnergyModel,
  MIN_SAMPLES_TO_TRAIN,
  type TrainedModel,
} from "../lib/energy-regression";
import type { EnergySample } from "../lib/energy-collector";

// ============ 特征提取 ============

describe("extractFeatures", () => {
  it("返回 8 维向量（含 bias 项 1）", () => {
    const features = extractFeatures({
      energy: 3,
      mood: "neutral",
      availableMinutes: 60,
      createdAt: "2026-07-17T10:00:00.000Z",
      date: "2026-07-17",
    });
    expect(features).toHaveLength(8);
    expect(features[0]).toBe(1); // bias 项
    expect(features[1]).toBe(3); // energy
    expect(features[2]).toBe(1); // moodNumeric (neutral=1)
    expect(features[3]).toBe(60); // availableMinutes
    // features[4] = sin(hour), features[5] = cos(hour)
    // features[6] = dayOfWeek, features[7] = dopamineInterference
  });

  it("good mood → moodNumeric=2", () => {
    const features = extractFeatures({
      energy: 5,
      mood: "good",
      availableMinutes: 30,
      createdAt: "2026-07-17T08:00:00.000Z",
      date: "2026-07-17",
      dopamineTrigger: "无",
    });
    expect(features[2]).toBe(2);
    expect(features[7]).toBe(0); // "无" → 0
  });

  it("有 dopamineTrigger → dopamineInterference=1", () => {
    const features = extractFeatures({
      energy: 2,
      mood: "bad",
      availableMinutes: 45,
      createdAt: "2026-07-17T22:00:00.000Z",
      date: "2026-07-17",
      dopamineTrigger: "刷手机",
    });
    expect(features[7]).toBe(1);
  });

  it("无 dopamineTrigger（旧数据）→ dopamineInterference=0", () => {
    const features = extractFeatures({
      energy: 3,
      mood: "neutral",
      availableMinutes: 60,
      createdAt: "2026-07-17T10:00:00.000Z",
      date: "2026-07-17",
    });
    expect(features[7]).toBe(0);
  });

  it("sin/cos 编码为周期性值（[-1, 1] 范围）", () => {
    const features = extractFeatures({
      energy: 3,
      mood: "neutral",
      availableMinutes: 60,
      createdAt: "2026-07-17T06:00:00.000Z",
      date: "2026-07-17",
    });
    expect(features[4]).toBeGreaterThanOrEqual(-1);
    expect(features[4]).toBeLessThanOrEqual(1);
    expect(features[5]).toBeGreaterThanOrEqual(-1);
    expect(features[5]).toBeLessThanOrEqual(1);
  });
});

// ============ dopamineToNumeric ============

describe("dopamineToNumeric", () => {
  it("undefined → 0（旧数据兼容）", () => {
    expect(dopamineToNumeric(undefined)).toBe(0);
  });

  it('"无" → 0', () => {
    expect(dopamineToNumeric("无")).toBe(0);
  });

  it('其他触发源 → 1', () => {
    expect(dopamineToNumeric("刷手机")).toBe(1);
    expect(dopamineToNumeric("游戏")).toBe(1);
    expect(dopamineToNumeric("短视频")).toBe(1);
    expect(dopamineToNumeric("甜食")).toBe(1);
    expect(dopamineToNumeric("其他")).toBe(1);
  });
});

// ============ 时间工具函数 ============

describe("getHourFromISO", () => {
  it("从 ISO 提取小时", () => {
    expect(getHourFromISO("2026-07-17T14:30:00.000Z")).toBe(14);
    expect(getHourFromISO("2026-07-17T00:00:00.000Z")).toBe(0);
    expect(getHourFromISO("2026-07-17T23:59:00.000Z")).toBe(23);
  });

  it("无效 ISO → 默认 12（中午）", () => {
    expect(getHourFromISO("invalid")).toBe(12);
  });
});

describe("getDayOfWeekFromDate", () => {
  it("从 YYYY-MM-DD 提取星期几", () => {
    // 2026-07-17 是周五 → getDay()=5
    expect(getDayOfWeekFromDate("2026-07-17")).toBe(5);
    // 2026-07-19 是周日 → getDay()=0
    expect(getDayOfWeekFromDate("2026-07-19")).toBe(0);
  });

  it("无效日期 → 默认 3（周三）", () => {
    expect(getDayOfWeekFromDate("invalid")).toBe(3);
  });
});

// ============ predictActualMinutes 向后兼容 ============

describe("predictActualMinutes 向后兼容", () => {
  it("旧 4 权重模型：仅用 energy/mood/availableMinutes", () => {
    // y = 10 + 5*energy + 2*moodNumeric + 0.5*availableMinutes
    const oldModel: TrainedModel = {
      weights: [10, 5, 2, 0.5],
      bias: 10,
      sampleCount: 20,
      trainedAt: "2026-07-01T00:00:00.000Z",
    };
    // energy=3, mood="neutral"(1), available=100 → 10 + 15 + 2 + 50 = 77
    const pred = predictActualMinutes(oldModel, 3, "neutral", 100);
    expect(pred).toBeCloseTo(77, 5);
  });

  it("旧 4 权重模型：新参数被忽略", () => {
    const oldModel: TrainedModel = {
      weights: [10, 5, 2, 0.5],
      bias: 10,
      sampleCount: 20,
      trainedAt: "2026-07-01T00:00:00.000Z",
    };
    // 传入新特征参数，但旧模型应忽略
    const pred1 = predictActualMinutes(oldModel, 3, "neutral", 100, 6, 3, 1);
    const pred2 = predictActualMinutes(oldModel, 3, "neutral", 100, 22, 0, 0);
    expect(pred1).toBeCloseTo(pred2, 5);
  });

  it("旧 4 权重模型：预测为负 → 钳制为 0", () => {
    const oldModel: TrainedModel = {
      weights: [-100, 1, 0, 0],
      bias: -100,
      sampleCount: 20,
      trainedAt: "2026-07-01T00:00:00.000Z",
    };
    // y = -100 + 1*3 = -97 → 0
    expect(predictActualMinutes(oldModel, 3, "neutral", 100)).toBe(0);
  });
});

describe("predictActualMinutes 新 8 权重模型", () => {
  it("8 权重模型：使用全部特征", () => {
    // 构造一个简单模型：bias=10, energy=5, mood=2, avail=0.5, sin=0, cos=0, dow=0, di=-20
    const newModel: TrainedModel = {
      weights: [10, 5, 2, 0.5, 0, 0, 0, -20],
      bias: 10,
      sampleCount: 30,
      trainedAt: "2026-07-01T00:00:00.000Z",
    };
    // energy=3, mood=neutral(1), avail=100, hour=12, dow=3, di=0
    // y = 10 + 15 + 2 + 50 + 0 + 0 + 0 + 0 = 77
    const pred = predictActualMinutes(newModel, 3, "neutral", 100, 12, 3, 0);
    expect(pred).toBeCloseTo(77, 5);
  });

  it("8 权重模型：dopamineInterference 降低预测值", () => {
    const newModel: TrainedModel = {
      weights: [10, 5, 2, 0.5, 0, 0, 0, -20],
      bias: 10,
      sampleCount: 30,
      trainedAt: "2026-07-01T00:00:00.000Z",
    };
    const noInterference = predictActualMinutes(newModel, 3, "neutral", 100, 12, 3, 0);
    const withInterference = predictActualMinutes(newModel, 3, "neutral", 100, 12, 3, 1);
    expect(withInterference).toBeLessThan(noInterference);
    // 差值 = 20（di 权重 -20 × 1）
    expect(noInterference - withInterference).toBeCloseTo(20, 5);
  });

  it("8 权重模型：预测为负 → 钳制为 0", () => {
    const newModel: TrainedModel = {
      weights: [-200, 1, 0, 0, 0, 0, 0, 0],
      bias: -200,
      sampleCount: 30,
      trainedAt: "2026-07-01T00:00:00.000Z",
    };
    expect(predictActualMinutes(newModel, 3, "neutral", 100, 12, 3, 0)).toBe(0);
  });
});

// ============ trainEnergyModel ============

describe("trainEnergyModel 特征增强", () => {
  /** 生成 n 个有效 EnergySample（actualMinutes > 0） */
  function makeSamples(n: number): EnergySample[] {
    const samples: EnergySample[] = [];
    for (let i = 0; i < n; i++) {
      samples.push({
        id: `s${i}`,
        date: `2026-07-${String((i % 28) + 1).padStart(2, "0")}`,
        energy: (i % 5) + 1,
        mood: ["bad", "neutral", "good"][i % 3],
        availableMinutes: 30 + (i % 4) * 15,
        predictedLoad: 1,
        actualMinutes: 20 + (i % 6) * 10,
        createdAt: `2026-07-${String((i % 28) + 1).padStart(2, "0")}T${String((i % 24)).padStart(2, "0")}:00:00.000Z`,
        dopamineTrigger: i % 3 === 0 ? "刷手机" : "无",
      });
    }
    return samples;
  }

  it("训练产出 8 权重模型", () => {
    const samples = makeSamples(20);
    const model = trainEnergyModel(samples);
    expect(model.weights).toHaveLength(8);
    expect(model.bias).toBe(model.weights[0]);
    expect(model.sampleCount).toBe(20);
  });

  it("样本不足时抛出", () => {
    const samples = makeSamples(MIN_SAMPLES_TO_TRAIN - 1);
    expect(() => trainEnergyModel(samples)).toThrow();
  });

  it("训练后预测值在合理范围（非负）", () => {
    const samples = makeSamples(15);
    const model = trainEnergyModel(samples);
    // 用训练集内的特征预测
    const pred = predictActualMinutes(
      model,
      3,
      "neutral",
      60,
      14,
      3,
      0,
    );
    expect(pred).toBeGreaterThanOrEqual(0);
  });

  it("无 dopamineTrigger 的旧样本也能训练（兼容）", () => {
    const samples: EnergySample[] = [];
    for (let i = 0; i < 15; i++) {
      samples.push({
        id: `old${i}`,
        date: `2026-06-${String((i % 28) + 1).padStart(2, "0")}`,
        energy: 3,
        mood: "neutral",
        availableMinutes: 45,
        predictedLoad: 1,
        actualMinutes: 30,
        createdAt: `2026-06-${String((i % 28) + 1).padStart(2, "0")}T10:00:00.000Z`,
        // 无 dopamineTrigger 字段（旧数据）
      });
    }
    const model = trainEnergyModel(samples);
    expect(model.weights).toHaveLength(8);
  });
});
