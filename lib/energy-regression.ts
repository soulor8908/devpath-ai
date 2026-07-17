// lib/energy-regression.ts
// 能量感知模型：多元线性回归（7 特征 → actualMinutes）+ 每周自动重训练
// 纯 TypeScript 实现，不依赖外部库
// P3.3/P3.4 阶段：用学习到的模型替代规则计算 capacity
// P3 特征工程增强：3 特征 → 7 特征（加 sin/cos(hourOfDay)、dayOfWeek、dopamineInterference）
//
// 特征向量（8 维，含 bias）：
//   [1, energy, moodNumeric, availableMinutes, sin(hour), cos(hour), dayOfWeek, dopamineInterference]
//
// 目标：actualMinutes（实际学习时长）
// 模型：y = w0 + w1*energy + w2*moodNumeric + w3*availableMinutes
//        + w4*sin(2π·hour/24) + w5*cos(2π·hour/24) + w6*dayOfWeek + w7*dopamineInterference
//
// 时段效应（sin/cos 编码）：晚上 vs 早上效率不同，周期性特征用 sin/cos 避免离散跳跃
// 累积疲劳/周末效应：dayOfWeek 捕捉周内节律差异
// 多巴胺干扰：刷手机/游戏/短视频等会降低实际学习投入
//
// 求解：正规方程 (X^T X) W = X^T y，高斯消元解 8×8 线性方程组
// 向后兼容：旧模型 weights.length=4 → predict 用旧 3 特征公式

import { getItem, setItem } from "./storage/db";
import { KEY_PREFIXES } from "./types";
import type { DopamineTrigger } from "./types";
import { listEnergySamples, type EnergySample } from "./energy-collector";

/** 已训练的线性回归模型 */
export interface TrainedModel {
  /**
   * 系数数组（动态长度，支持向后兼容）：
   * - 旧模型（4 维）：[w0, w1, w2, w3] = [bias, energy, moodNumeric, availableMinutes]
   * - 新模型（8 维）：[w0, w1, w2, w3, w4, w5, w6, w7]
   *   w4 = sin(hour) 权重, w5 = cos(hour) 权重, w6 = dayOfWeek 权重, w7 = dopamineInterference 权重
   */
  weights: number[];
  /** 截距，等于 weights[0]（单独保留以便调用方直观取用） */
  bias: number;
  /** 训练时使用的有效样本数 */
  sampleCount: number;
  /** 训练时间 ISO（用于重训练周期判断） */
  trainedAt: string;
}

/** 模型在 IndexedDB 中的单例 key */
const MODEL_KEY = KEY_PREFIXES.ENERGY_MODEL + "current";

/** 训练所需的最小有效样本数 */
export const MIN_SAMPLES_TO_TRAIN = 10;

/** 重训练周期：7 天 */
const RETRAIN_INTERVAL_MS = 7 * 24 * 60 * 60 * 1000;

/** 特征维度（含 bias） */
const FEATURE_DIM = 8;

/** mood 字符串 → 数值特征 */
function moodToNumeric(mood: string): number {
  return mood === "good" ? 2 : mood === "neutral" ? 1 : 0;
}

/** dopamineTrigger → 数值特征（"无" 或 undefined = 0，其余 = 1） */
export function dopamineToNumeric(trigger?: DopamineTrigger): number {
  if (!trigger || trigger === "无") return 0;
  return 1;
}

/** 从 ISO 时间戳提取小时（0-23），失败默认 12（中午，中性值） */
export function getHourFromISO(iso: string): number {
  const d = new Date(iso);
  const h = d.getHours();
  if (isNaN(h)) return 12;
  return h;
}

/** 从 "YYYY-MM-DD" 日期字符串提取星期几（0=周日 - 6=周六，与 JS getDay 一致），失败默认 3（周三，中性值） */
export function getDayOfWeekFromDate(date: string): number {
  const d = new Date(date + "T00:00:00");
  const dow = d.getDay();
  if (isNaN(dow)) return 3;
  return dow;
}

/** sin 编码小时（周期性特征，避免 23→0 的离散跳跃） */
function sinHour(hour: number): number {
  return Math.sin((2 * Math.PI * hour) / 24);
}

/** cos 编码小时 */
function cosHour(hour: number): number {
  return Math.cos((2 * Math.PI * hour) / 24);
}

/**
 * 从 EnergySample 提取 8 维特征向量（含 bias 项 1）
 * 纯函数：相同输入 → 相同输出
 */
export function extractFeatures(sample: {
  energy: number;
  mood: string;
  availableMinutes: number;
  createdAt: string;
  date: string;
  dopamineTrigger?: DopamineTrigger;
}): number[] {
  const hour = getHourFromISO(sample.createdAt);
  const dow = getDayOfWeekFromDate(sample.date);
  return [
    1,
    sample.energy,
    moodToNumeric(sample.mood),
    sample.availableMinutes,
    sinHour(hour),
    cosHour(hour),
    dow,
    dopamineToNumeric(sample.dopamineTrigger),
  ];
}

// ============ 线性代数工具（纯 TS，通用维度） ============

/** 矩阵转置 */
function transpose(A: number[][]): number[][] {
  const rows = A.length;
  const cols = A[0].length;
  const T: number[][] = Array.from({ length: cols }, () => new Array(rows).fill(0));
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      T[j][i] = A[i][j];
    }
  }
  return T;
}

/** 矩阵乘法 A(m×k) × B(k×n) → C(m×n) */
function matMul(A: number[][], B: number[][]): number[][] {
  const m = A.length;
  const k = A[0].length;
  const n = B[0].length;
  const C: number[][] = Array.from({ length: m }, () => new Array(n).fill(0));
  for (let i = 0; i < m; i++) {
    for (let j = 0; j < n; j++) {
      let s = 0;
      for (let p = 0; p < k; p++) {
        s += A[i][p] * B[p][j];
      }
      C[i][j] = s;
    }
  }
  return C;
}

/**
 * 高斯消元法解线性方程组 A x = b（带部分主元选取）
 * @returns 解向量 x；若矩阵奇异返回 null
 */
function solveLinearSystem(A: number[][], b: number[]): number[] | null {
  const n = A.length;
  // 增广矩阵 [A | b]
  const M: number[][] = A.map((row, i) => [...row, b[i]]);

  for (let col = 0; col < n; col++) {
    // 选主元（绝对值最大的行）
    let pivotRow = col;
    let maxVal = Math.abs(M[col][col]);
    for (let row = col + 1; row < n; row++) {
      const v = Math.abs(M[row][col]);
      if (v > maxVal) {
        maxVal = v;
        pivotRow = row;
      }
    }
    if (maxVal < 1e-12) {
      return null; // 奇异矩阵
    }
    if (pivotRow !== col) {
      [M[col], M[pivotRow]] = [M[pivotRow], M[col]];
    }
    // 消去下方
    for (let row = col + 1; row < n; row++) {
      const factor = M[row][col] / M[col][col];
      for (let j = col; j <= n; j++) {
        M[row][j] -= factor * M[col][j];
      }
    }
  }

  // 回代
  const x = new Array(n).fill(0);
  for (let i = n - 1; i >= 0; i--) {
    let sum = M[i][n];
    for (let j = i + 1; j < n; j++) {
      sum -= M[i][j] * x[j];
    }
    x[i] = sum / M[i][i];
  }
  return x;
}

// ============ 训练 / 预测 ============

/**
 * 训练能量回归模型
 * - 仅使用 actualMinutes > 0 的样本（未回填的样本对回归无意义）
 * - 至少需要 10 个有效样本
 * - 使用正规方程 (X^T X) W = X^T y 求解
 * - 8 维特征（含 bias）：energy, moodNumeric, availableMinutes, sin/cos(hour), dayOfWeek, dopamineInterference
 *
 * @throws 样本不足或正规方程奇异时抛出
 */
export function trainEnergyModel(samples: EnergySample[]): TrainedModel {
  const valid = samples.filter((s) => s.actualMinutes > 0);
  if (valid.length < MIN_SAMPLES_TO_TRAIN) {
    throw new Error(
      `训练需要至少 ${MIN_SAMPLES_TO_TRAIN} 个有效样本（已回填 actualMinutes），当前仅 ${valid.length} 个`,
    );
  }

  const n = valid.length;
  // 设计矩阵 X (n×8)：每行 extractFeatures(sample)
  const X: number[][] = valid.map((s) => extractFeatures(s));
  const y: number[] = valid.map((s) => s.actualMinutes);

  // A = X^T X (8×8)
  const Xt = transpose(X);
  const A = matMul(Xt, X);

  // b = X^T y (8×1)
  const b = new Array(FEATURE_DIM).fill(0);
  for (let i = 0; i < FEATURE_DIM; i++) {
    let s = 0;
    for (let k = 0; k < n; k++) {
      s += Xt[i][k] * y[k];
    }
    b[i] = s;
  }

  // 微小岭回归项，防止数值奇异（对结果影响可忽略）
  for (let i = 0; i < FEATURE_DIM; i++) {
    A[i][i] += 1e-8;
  }

  const W = solveLinearSystem(A, b);
  if (!W) {
    throw new Error("正规方程奇异，无法求解（样本特征方差不足）");
  }

  return {
    weights: W,
    bias: W[0],
    sampleCount: valid.length,
    trainedAt: new Date().toISOString(),
  };
}

/**
 * 用模型预测实际学习时长（分钟）
 *
 * 向后兼容：
 *   - 旧模型 weights.length=4：y = w0 + w1*energy + w2*moodNumeric + w3*availableMinutes
 *   - 新模型 weights.length=8：增加 sin/cos(hour), dayOfWeek, dopamineInterference 项
 *
 * 新特征参数为可选，缺省时：
 *   - hourOfDay：取当前小时
 *   - dayOfWeek：取当前星期
 *   - dopamineInterference：0（无干扰）
 *
 * 结果下限钳制为 0（学习时长不能为负）
 */
export function predictActualMinutes(
  model: TrainedModel,
  energy: number,
  mood: string,
  availableMinutes: number,
  hourOfDay?: number,
  dayOfWeek?: number,
  dopamineInterference?: number,
): number {
  const moodNumeric = moodToNumeric(mood);
  const w = model.weights;

  // 向后兼容：旧模型只有 4 个权重
  if (w.length <= 4) {
    const pred = w[0] + w[1] * energy + w[2] * moodNumeric + w[3] * availableMinutes;
    return Math.max(0, pred);
  }

  // 新模型 8 个权重
  const hour = hourOfDay ?? new Date().getHours();
  const dow = dayOfWeek ?? new Date().getDay();
  const di = dopamineInterference ?? 0;

  const pred =
    w[0] +
    w[1] * energy +
    w[2] * moodNumeric +
    w[3] * availableMinutes +
    w[4] * sinHour(hour) +
    w[5] * cosHour(hour) +
    w[6] * dow +
    w[7] * di;
  return Math.max(0, pred);
}

// ============ 模型持久化 ============

/** 从 IndexedDB 读取已训练模型；不存在返回 null */
export async function getTrainedModel(): Promise<TrainedModel | null> {
  const m = await getItem<TrainedModel>(MODEL_KEY);
  return m ?? null;
}

/** 保存（覆盖）已训练模型到 IndexedDB */
export async function saveTrainedModel(model: TrainedModel): Promise<void> {
  await setItem(MODEL_KEY, model);
}

// ============ 每周自动重训练 ============

/**
 * 静默检查是否需要重训练模型（建议在 profile 页加载时调用）
 * - 从未训练：若有效样本 >= 10，训练初始模型
 * - 已有模型：若距上次训练 > 7 天 且 新增有效样本 >= 10，用全部有效样本重训练
 * - 任何异常均吞掉（仅 console.warn），不影响页面加载
 */
export async function maybeRetrain(): Promise<void> {
  try {
    const allSamples = await listEnergySamples();
    const validSamples = allSamples.filter((s) => s.actualMinutes > 0);
    const existing = await getTrainedModel();

    // 冷启动：从未训练过
    if (!existing) {
      if (validSamples.length >= MIN_SAMPLES_TO_TRAIN) {
        try {
          const model = trainEnergyModel(validSamples);
          await saveTrainedModel(model);
        } catch (e) {
          console.warn("[energy] 初始训练失败:", e);
        }
      }
      return;
    }

    // 已有模型：检查周期 + 新样本数
    const lastTrainedAt = new Date(existing.trainedAt).getTime();
    if (Date.now() - lastTrainedAt < RETRAIN_INTERVAL_MS) return;

    const newValidSamples = validSamples.filter(
      (s) => new Date(s.createdAt).getTime() > lastTrainedAt,
    );
    if (newValidSamples.length < MIN_SAMPLES_TO_TRAIN) return;

    try {
      const model = trainEnergyModel(validSamples);
      await saveTrainedModel(model);
    } catch (e) {
      console.warn("[energy] 重训练失败:", e);
    }
  } catch (e) {
    // 整个流程失败不应影响页面渲染
    console.warn("[energy] maybeRetrain 异常:", e);
  }
}
