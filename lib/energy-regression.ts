// lib/energy-regression.ts
// 能量感知模型：多元线性回归（3 特征 → actualMinutes）+ 每周自动重训练
// 纯 TypeScript 实现，不依赖外部库
// P3.3/P3.4 阶段：用学习到的模型替代规则计算 capacity
//
// 特征：energy (1-5), moodNumeric (bad=0/neutral=1/good=2), availableMinutes
// 目标：actualMinutes（实际学习时长）
// 模型：y = w0 + w1*energy + w2*moodNumeric + w3*availableMinutes
//   - weights[0] = w0 = bias（截距）
//   - weights[1..3] = 各特征权重
// 求解：正规方程 (X^T X) W = X^T y，高斯消元解 4×4 线性方程组

import { getItem, setItem } from "./storage/db";
import { KEY_PREFIXES } from "./types";
import { listEnergySamples, type EnergySample } from "./energy-collector";

/** 已训练的线性回归模型 */
export interface TrainedModel {
  /**
   * 4 个系数：[w0, w1, w2, w3]
   * - w0 = 截距（= bias）
   * - w1 = energy 权重
   * - w2 = moodNumeric 权重
   * - w3 = availableMinutes 权重
   */
  weights: [number, number, number, number];
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

/** mood 字符串 → 数值特征 */
function moodToNumeric(mood: string): number {
  return mood === "good" ? 2 : mood === "neutral" ? 1 : 0;
}

// ============ 线性代数工具（纯 TS，仅用于 4×4 小矩阵） ============

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
  // 设计矩阵 X (n×4)：每行 [1, energy, moodNumeric, availableMinutes]
  const X: number[][] = valid.map((s) => [
    1,
    s.energy,
    moodToNumeric(s.mood),
    s.availableMinutes,
  ]);
  const y: number[] = valid.map((s) => s.actualMinutes);

  // A = X^T X (4×4)
  const Xt = transpose(X);
  const A = matMul(Xt, X);

  // b = X^T y (4×1)
  const b = new Array(4).fill(0);
  for (let i = 0; i < 4; i++) {
    let s = 0;
    for (let k = 0; k < n; k++) {
      s += Xt[i][k] * y[k];
    }
    b[i] = s;
  }

  // 微小岭回归项，防止数值奇异（对结果影响可忽略）
  for (let i = 0; i < 4; i++) {
    A[i][i] += 1e-8;
  }

  const W = solveLinearSystem(A, b);
  if (!W) {
    throw new Error("正规方程奇异，无法求解（样本特征方差不足）");
  }

  const weights: [number, number, number, number] = [W[0], W[1], W[2], W[3]];
  return {
    weights,
    bias: W[0],
    sampleCount: valid.length,
    trainedAt: new Date().toISOString(),
  };
}

/**
 * 用模型预测实际学习时长（分钟）
 * y = bias + w1*energy + w2*moodNumeric + w3*availableMinutes
 * 结果下限钳制为 0（学习时长不能为负）
 */
export function predictActualMinutes(
  model: TrainedModel,
  energy: number,
  mood: string,
  availableMinutes: number,
): number {
  const moodNumeric = moodToNumeric(mood);
  const pred =
    model.bias +
    model.weights[1] * energy +
    model.weights[2] * moodNumeric +
    model.weights[3] * availableMinutes;
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
