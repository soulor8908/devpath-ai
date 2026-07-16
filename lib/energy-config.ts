// lib/energy-config.ts
// 能量感知公式参数配置（从 lib/status.ts 硬编码提取）
// P1 阶段：规则引擎参数可配置；P3 阶段可由机器学习模型替代（通过 version 区分）

/**
 * 能量感知配置接口
 * - capacity 公式：capacity = (energy/energyDivisor) * moodMultiplier * (availableMinutes/timeDivisor)
 * - 调档阈值：根据 capacity 落在哪个区间决定当日负载调整策略
 * - 增强触发：连续 N 天 energy 低于阈值时触发 AI 增强建议
 */
export interface EnergyConfig {
  // capacity 公式参数
  energyDivisor: number; // 默认 3
  moodBadMultiplier: number; // 默认 0.7
  moodNeutralMultiplier: number; // 默认 1.0
  moodGoodMultiplier: number; // 默认 1.0
  timeDivisor: number; // 默认 30
  // 调档阈值
  restOnlyThreshold: number; // 默认 0.5 - 低于此只复习不学新
  reducedThreshold: number; // 默认 1.0 - 低于此新内容减半
  boostThreshold: number; // 默认 1.2 - 高于此加学一个节点
  // 增强触发
  consecutiveLowDays: number; // 默认 3 - 连续多少天低能量触发增强
  lowEnergyThreshold: number; // 默认 3 - energy 低于此算"低"
  // 版本（用于 P3 机器学习替代时区分）
  version: string;
}

/**
 * 默认能量感知配置
 * 与提取前 lib/status.ts 的硬编码值完全一致，保证向后兼容
 */
export const DEFAULT_ENERGY_CONFIG: EnergyConfig = {
  energyDivisor: 3,
  moodBadMultiplier: 0.7,
  moodNeutralMultiplier: 1.0,
  moodGoodMultiplier: 1.0,
  timeDivisor: 30,
  restOnlyThreshold: 0.5,
  reducedThreshold: 1.0,
  boostThreshold: 1.2,
  consecutiveLowDays: 3,
  lowEnergyThreshold: 3,
  version: "rule-v1",
};
