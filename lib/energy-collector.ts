// lib/energy-collector.ts
// 能量样本采集：记录每日 (energy, mood, availableMinutes, predictedLoad) 与学习结束后的 actualMinutes
// 所有数据存浏览器本地 IndexedDB，不离开设备
// P3.2 阶段：为线性回归模型提供训练数据
//
// 冷启动修复（Issue 4）：
//   - 新增 autoFillTodayActualMinutes() 自动回填当天实际学习时长
//   - 首页加载时调用，无需用户手动触发
//   - 这样模型训练循环 closed-loop：record → autoFill → maybeRetrain

import { nanoid } from "nanoid";
import { getItem, setItem, listItems } from "./storage/db";
import { KEY_PREFIXES } from "./types";
import type { LearnLog } from "./types";
import { chinaDateNow } from "./time";

/**
 * 能量样本：一天一条（recordEnergySample 写入，updateActualMinutes 回填实际时长）
 * - predictedLoad: computeCapacity 当天输出的容量系数（规则预测值）
 * - actualMinutes: 学习结束后实际学习时长（分钟），初始为 0
 */
export interface EnergySample {
  id: string;
  /** "YYYY-MM-DD" */
  date: string;
  /** 1-5 */
  energy: number;
  /** bad / neutral / good */
  mood: string;
  availableMinutes: number;
  /** computeCapacity 的输出（规则预测容量系数） */
  predictedLoad: number;
  /** 实际学习时长（分钟） */
  actualMinutes: number;
  /** ISO 创建时间 */
  createdAt: string;
}

/**
 * 记录一条能量样本（通常每日学习开始时调用一次）
 * id 与 createdAt 自动生成
 */
export async function recordEnergySample(
  sample: Omit<EnergySample, "id" | "createdAt">,
): Promise<EnergySample> {
  const full: EnergySample = {
    ...sample,
    id: nanoid(),
    createdAt: new Date().toISOString(),
  };
  await setItem(KEY_PREFIXES.ENERGY_SAMPLE + full.id, full);
  return full;
}

/**
 * 读取历史样本（按 createdAt 倒序，最近的在前）
 * @param limit 可选，限制返回条数
 */
export async function listEnergySamples(limit?: number): Promise<EnergySample[]> {
  const all = await listItems<EnergySample>(KEY_PREFIXES.ENERGY_SAMPLE);
  all.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  if (limit !== undefined && limit > 0) {
    return all.slice(0, limit);
  }
  return all;
}

/**
 * 学习结束后更新当天样本的 actualMinutes
 * 若当天存在多条样本，更新最近创建的一条；若无样本则不操作
 */
export async function updateActualMinutes(
  date: string,
  actualMinutes: number,
): Promise<void> {
  const all = await listItems<EnergySample>(KEY_PREFIXES.ENERGY_SAMPLE);
  const daySamples = all
    .filter((s) => s.date === date)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  if (daySamples.length === 0) return;
  const target = daySamples[0];
  await setItem(KEY_PREFIXES.ENERGY_SAMPLE + target.id, {
    ...target,
    actualMinutes,
  });
}

/** 内部使用：按 id 直接读取（供回归模块复用） */
export async function getEnergySampleById(id: string): Promise<EnergySample | undefined> {
  return getItem<EnergySample>(KEY_PREFIXES.ENERGY_SAMPLE + id);
}

/**
 * 自动回填今日 actualMinutes（冷启动修复）
 *
 * 工作原理：
 *   1. 读取今日所有 LearnLog，累加 duration（学习时长）
 *   2. 若今天有 EnergySample，调 updateActualMinutes 回填
 *   3. 若今天无 sample（用户还没设过能量），什么都不做
 *
 * 设计目标：
 *   - 让 maybeRetrain 的"无 actualMinutes → 无法训练"问题自动消失
 *   - 用户只要正常使用 App（记录学习日志），actualMinutes 会被自动维护
 *   - 不需要用户手动触发任何"回填"按钮
 *
 * 调用时机：首页加载时（lib/home.ts 的 useHomeData hook 中触发）
 *
 * @returns 回填的分钟数；若今天无 sample 则返回 null
 */
export async function autoFillTodayActualMinutes(): Promise<number | null> {
  const today = chinaDateNow();
  // 读今日 LearnLog 累计 duration
  const logs = await listItems<LearnLog>(KEY_PREFIXES.LEARN_LOG);
  const todayMinutes = logs
    .filter((l) => l.date === today)
    .reduce((sum, l) => sum + (l.duration ?? 0), 0);

  // 检查今天是否有 sample
  const allSamples = await listItems<EnergySample>(KEY_PREFIXES.ENERGY_SAMPLE);
  const todaySamples = allSamples.filter((s) => s.date === today);
  if (todaySamples.length === 0) {
    return null; // 今天没 sample，不回填
  }

  // 仅当 actualMinutes 与当前累计值不同时才写入（避免无意义 IO）
  const latest = todaySamples.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  )[0];
  if (latest.actualMinutes === todayMinutes) {
    return todayMinutes;
  }
  await updateActualMinutes(today, todayMinutes);
  return todayMinutes;
}
