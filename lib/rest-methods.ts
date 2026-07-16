// lib/rest-methods.ts
// 休息方法库：结构化数据（参考主项目 rest/methods.md，补全原理+步骤+适用场景）

export interface RestMethod {
  id: string;
  name: string;
  emoji: string;
  duration: string;
  energyLevels: (1 | 2 | 3 | 4 | 5)[]; // 适用能量等级
  principle: string; // 原理
  steps?: string[]; // 操作步骤
  suitableFor: string; // 适用场景
}

export const REST_METHODS: RestMethod[] = [
  {
    id: "nsdr",
    name: "NSDR 非睡眠深度休息",
    emoji: "🧘",
    duration: "10-20 分钟",
    energyLevels: [1, 2],
    principle: "瑜伽休息术精简版，引导身体进入深度放松但保持意识，能快速恢复认知资源",
    steps: [
      "平躺或靠在椅背上，闭上眼睛",
      "深呼吸 3 次，每次吸气 4 秒、呼气 8 秒",
      "从脚趾开始，依次将注意力移到每个身体部位",
      "想象每个部位逐渐变沉、变暖",
      "保持 10-20 分钟，结束后缓慢睁眼",
    ],
    suitableFor: "午休、睡前过度兴奋时、下午能量低谷",
  },
  {
    id: "breath-478",
    name: "478 呼吸法",
    emoji: "🌬️",
    duration: "约 3 分钟（4 轮）",
    energyLevels: [1, 2],
    principle: "延长呼气激活迷走神经，快速降低心率，能在 1-2 分钟内显著降低焦虑感",
    steps: [
      "用鼻子吸气 4 秒",
      "屏住呼吸 7 秒",
      "用嘴缓慢呼气 8 秒（发出「呼」声）",
      "重复 4 轮",
    ],
    suitableFor: "焦虑、紧张、考前/面试前、睡前难以平静",
  },
  {
    id: "nap",
    name: "小睡（Power Nap）",
    emoji: "😴",
    duration: "15-20 分钟",
    energyLevels: [1, 2],
    principle: "短时小睡不进入深度睡眠阶段，可恢复警觉性和认知功能；超过 30 分钟会进入深睡导致醒后昏沉",
    steps: [
      "设闹钟 20 分钟（含入睡时间）",
      "找一个安静的地方，闭眼放松",
      "闹钟响后立即起床，不要赖",
      "喝一杯水、看看窗外光线加速清醒",
    ],
    suitableFor: "午休、严重疲惫时、连续学习 3 小时后",
  },
  {
    id: "walk",
    name: "户外散步",
    emoji: "🚶",
    duration: "10 分钟",
    energyLevels: [2, 3],
    principle: "户外光照重置生物钟，步行促进血液循环，帮助大脑切换上下文",
    suitableFor: "学习卡壳、思路混乱、久坐后",
  },
  {
    id: "progressive-relax",
    name: "渐进式肌肉放松",
    emoji: "💪",
    duration: "约 10 分钟",
    energyLevels: [2, 3],
    principle: "通过交替收紧和放松肌肉群，释放身体积累的紧张感，间接降低心理焦虑",
    steps: [
      "从脚趾开始，用力收紧 5 秒",
      "突然放松，感受放松感持续 10 秒",
      "依次向上：小腿 → 大腿 → 腹部 → 手臂 → 肩颈 → 面部",
      "全程保持缓慢呼吸",
      "结束后静坐 1 分钟再起身",
    ],
    suitableFor: "身体紧绷、长时间坐姿后、考前焦虑",
  },
  {
    id: "far-look",
    name: "远眺放松",
    emoji: "🌄",
    duration: "5 分钟",
    energyLevels: [3, 4, 5],
    principle: "看远处（6 米外）能让睫状肌放松，缓解长时间看屏幕导致的眼疲劳",
    suitableFor: "长时间用眼后、眼睛酸涩时",
  },
  {
    id: "stretch",
    name: "走动伸展",
    emoji: "🤸",
    duration: "5 分钟",
    energyLevels: [4, 5],
    principle: "轻量运动促进血液循环，帮助大脑在任务间切换",
    suitableFor: "任务切换间隙、学习状态良好时",
  },
  {
    id: "water",
    name: "喝水 + 茶歇",
    emoji: "🍵",
    duration: "3 分钟",
    energyLevels: [3, 4, 5],
    principle: "轻度脱水会导致注意力下降，补充水分 + 短暂离开工位能快速重置状态",
    suitableFor: "任何时候、需要轻量切换时",
  },
];

/** 按能量等级筛选推荐方法 */
export function getMethodsByEnergy(energy: number): RestMethod[] {
  return REST_METHODS.filter((m) => m.energyLevels.includes(energy as 1 | 2 | 3 | 4 | 5));
}
