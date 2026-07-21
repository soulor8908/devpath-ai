// lib/ai/interview-coach.ts
// AI 面试官逻辑——追问+评分+反馈生成
//
// 设计（乔布斯视角）：
//   - 面试是双向对话，不是单向出题。AI 必须根据候选人回答决定追问还是切换主题
//   - 4 档难度对应真实面试场景：初级（友好引导）/ 中级（追问细节）/ 高级（系统设计）/ 压力面（抗压测试）
//   - 报告用结构化 JSON：总分 + 优势 + 不足 + 改进建议 + 下一步，让用户拿到可执行的行动项
//   - 不让 AI 一次给反馈——面试结束后统一评估，模拟真实面试官行为
//
// 设计（卡帕西视角）：
//   - 类型先行：InterviewConfig / InterviewMessage / InterviewReport 都是显式 interface
//   - Prompt 模板纯函数：buildInterviewerPrompt / buildReportPrompt 无副作用，可单测
//   - DIFFICULTY_MAP / DIFFICULTY_LABELS 用 Record<key, value> 字典 lookup，O(1)
//   - 不依赖外部状态，纯 prompt 构建，便于在不同 API 路由复用（interview 模式 + report 模式）

export type InterviewDifficulty = "junior" | "mid" | "senior" | "stress";

export interface InterviewConfig {
  difficulty: InterviewDifficulty;
  topic: string;
  /** 预计时长（分钟） */
  duration: number;
  /** 题目数量 */
  questionCount: number;
}

export interface InterviewMessage {
  role: "interviewer" | "candidate";
  content: string;
  timestamp: string;
}

export interface InterviewReport {
  /** 总评分 0-100 */
  overallScore: number;
  /** 答得好的地方 */
  strengths: string[];
  /** 可以更好的地方 */
  weaknesses: string[];
  /** 具体改进建议 */
  improvements: string[];
  /** 下一步建议 */
  nextStep: string;
  /** 是否准备好参加真实面试 */
  canInterview: boolean;
}

const DIFFICULTY_MAP: Record<InterviewDifficulty, string> = {
  junior: "初级面试官，考察基础概念，态度友好，会引导",
  mid: "中级面试官，考察项目经验和深度理解，会追问细节",
  senior: "高级面试官，考察系统设计和架构思维，压力大",
  stress: "压力面试官，故意挑战你的回答，考察抗压能力",
};

/**
 * 生成面试官系统 Prompt
 * @param config 面试配置（难度/主题/时长/题数）
 */
export function buildInterviewerPrompt(config: InterviewConfig): string {
  return `你是一位${DIFFICULTY_MAP[config.difficulty]}。

面试主题：${config.topic}
预计时长：${config.duration} 分钟
题目数量：约 ${config.questionCount} 题

面试规则：
1. 每次只问一个问题
2. 根据候选人的回答决定是否追问（追问是面试的核心）
3. 不要一次给反馈，面试结束后统一给
4. 如果候选人卡壳，给适当提示而不是直接跳过
5. 从简单到难，循序渐进
6. 用中文面试，态度专业但不冷漠

现在开始面试。先简短自我介绍，然后问第一个问题。`;
}

/**
 * 生成面试结束后的结构化报告 Prompt
 * @param messages 面试消息列表
 * @param config 面试配置
 */
export function buildReportPrompt(
  messages: InterviewMessage[],
  config: InterviewConfig,
): string {
  const transcript = messages
    .map((m) => `${m.role === "interviewer" ? "面试官" : "候选人"}：${m.content}`)
    .join("\n");

  return `以下是候选人面试记录，请生成结构化反馈报告。

面试主题：${config.topic}
难度：${config.difficulty}

面试记录：
${transcript}

请按以下 JSON 格式返回报告（只返回 JSON，不要其他内容）：
{
  "overallScore": 0到100的整数,
  "strengths": ["答得好的地方1", "答得好的地方2"],
  "weaknesses": ["可以更好的地方1", "可以更好的地方2"],
  "improvements": ["具体改进建议1", "具体改进建议2"],
  "nextStep": "下一步建议",
  "canInterview": true或false
}`;
}

/** 难度中文标签（UI 展示用） */
export const DIFFICULTY_LABELS: Record<InterviewDifficulty, string> = {
  junior: "初级 · 友好引导",
  mid: "中级 · 追问细节",
  senior: "高级 · 系统设计",
  stress: "压力面 · 抗压测试",
};

/**
 * 安全解析 AI 返回的报告 JSON。
 * - 容错处理：截取首个 { 到末尾 } 之间的内容，再 JSON.parse
 * - 字段校验 + 默认值兜底（避免 AI 返回不完整字段导致 UI 崩溃）
 * - 数组字段强制 string[]，单个非字符串项会被丢弃
 */
export function parseInterviewReport(raw: string): InterviewReport {
  const fallback: InterviewReport = {
    overallScore: 70,
    strengths: ["能够回答基本问题"],
    weaknesses: ["部分回答不够深入"],
    improvements: ["多练习项目经验的表述"],
    nextStep: "继续练习，重点提升深度回答能力",
    canInterview: false,
  };

  let parsed: unknown;
  try {
    // AI 偶尔会在 JSON 前后塞 markdown 标记或解释文本，截取首尾花括号
    const start = raw.indexOf("{");
    const end = raw.lastIndexOf("}");
    if (start === -1 || end === -1 || end <= start) return fallback;
    parsed = JSON.parse(raw.slice(start, end + 1));
  } catch {
    return fallback;
  }

  if (!parsed || typeof parsed !== "object") return fallback;
  const obj = parsed as Record<string, unknown>;

  const toStringArray = (v: unknown): string[] => {
    if (!Array.isArray(v)) return [];
    return v
      .filter((x): x is string => typeof x === "string" && x.length > 0)
      .slice(0, 10);
  };

  const score = typeof obj.overallScore === "number"
    ? Math.max(0, Math.min(100, Math.round(obj.overallScore)))
    : typeof obj.overallScore === "string"
      ? Number.parseInt(obj.overallScore, 10) || fallback.overallScore
      : fallback.overallScore;

  return {
    overallScore: score,
    strengths: toStringArray(obj.strengths),
    weaknesses: toStringArray(obj.weaknesses),
    improvements: toStringArray(obj.improvements),
    nextStep:
      typeof obj.nextStep === "string" && obj.nextStep.length > 0
        ? obj.nextStep
        : fallback.nextStep,
    canInterview:
      typeof obj.canInterview === "boolean" ? obj.canInterview : fallback.canInterview,
  };
}
