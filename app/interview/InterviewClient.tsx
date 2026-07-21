"use client";

// app/interview/InterviewClient.tsx
// AI 模拟面试客户端——选择难度 → 面试 → 报告
//
// 设计（乔布斯视角）：
//   - 三阶段单页流程：config（配置）→ interviewing（面试中）→ reporting（报告）
//   - 配置阶段：4 档难度（卡片网格）+ 6 个主题（chip）→ "开始面试"主操作
//   - 面试阶段：顶部 sticky 信息栏 + 中间消息流 + 底部输入栏（仿 ChatClient 布局）
//   - 报告阶段：复用 <InterviewReportView>，结构化展示评分与建议
//   - 失败兜底：每个 AI 调用都有默认回复，不让面试因网络问题卡死
//
// 设计（卡帕西视角）：
//   - 鉴权策略与 ChatClient 一致：有模型配置 → aiFetch（签名 session）；
//     无配置 → plain fetch（trial 模式，服务端 IP 限流）
//   - 单次 AI 调用用 generateText（非流式）：面试一问一答，流式反而增加复杂度
//   - 消息状态用 useState 数组，避免全局 store 复杂度
//   - AbortController：用户离开/重置时取消进行中的请求，避免竞态
//   - 全部用 @/components/ui 组件（Button / Textarea / LinkButton），无原生表单元素

import { useState, useRef, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  type InterviewDifficulty,
  type InterviewConfig,
  type InterviewMessage,
  type InterviewReport,
  DIFFICULTY_LABELS,
  parseInterviewReport,
} from "@/lib/ai/interview-coach";
import { Icon } from "@/components/Icon";
import { Button, Textarea } from "@/components/ui";
import { InterviewReportView } from "@/components/InterviewReport";
import { aiFetch } from "@/lib/api-client";
import { getDefaultModelConfig } from "@/lib/model-config";
import { toast } from "@/lib/toast";

type Phase = "config" | "interviewing" | "reporting";

const TOPICS = [
  "Transformer 基础",
  "RAG 检索增强生成",
  "Prompt Engineering",
  "LLM 应用开发",
  "Agent 智能体",
  "向量数据库",
];

interface InterviewApiResponse {
  reply?: string;
  reportJson?: string;
  fallback?: boolean;
  trial?: boolean;
  error?: string;
}

/**
 * 调用 /api/interview 接口
 * - 有模型配置 → aiFetch（session 签名）
 * - 无模型配置 → plain fetch（trial 模式，服务端 IP 限流）
 * 失败时抛错，由调用方 catch 并降级
 */
async function callInterviewApi(
  body: { mode: "interview" | "report"; config: InterviewConfig; messages: InterviewMessage[] },
  signal?: AbortSignal,
): Promise<InterviewApiResponse> {
  const requestBody = JSON.stringify(body);
  let res: Response;

  // 检查是否有模型配置：有则用 aiFetch（session 签名），无则 plain fetch（trial）
  let hasModel = false;
  try {
    const cfg = await getDefaultModelConfig();
    hasModel = Boolean(cfg && cfg.apiKey);
  } catch {
    hasModel = false;
  }

  try {
    res = hasModel
      ? await aiFetch("/api/interview", {
          method: "POST",
          body: requestBody,
          signal,
        })
      : await fetch("/api/interview", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: requestBody,
          signal,
        });
  } catch (err) {
    // 用户主动中止：静默
    if (signal?.aborted) throw err;
    // 网络错误：转成统一格式
    const msg = err instanceof Error ? err.message : String(err);
    throw new Error(`网络请求失败：${msg}`);
  }

  if (!res.ok) {
    let errMsg = `请求失败 (${res.status})`;
    try {
      const errBody = (await res.json()) as { error?: string };
      if (errBody.error) errMsg = errBody.error;
    } catch {
      // 非 JSON 响应
    }
    throw new Error(errMsg);
  }

  return (await res.json()) as InterviewApiResponse;
}

export default function InterviewClient() {
  const searchParams = useSearchParams();
  const topicParam = searchParams.get("topic");

  const [phase, setPhase] = useState<Phase>("config");
  const [config, setConfig] = useState<InterviewConfig>({
    difficulty: "junior",
    topic: topicParam || TOPICS[0],
    duration: 20,
    questionCount: 5,
  });
  const [messages, setMessages] = useState<InterviewMessage[]>([]);
  const [userInput, setUserInput] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [report, setReport] = useState<InterviewReport | null>(null);
  const [error, setError] = useState<string | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  // 自动滚动到底部
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, aiLoading]);

  // 组件卸载时中止进行中的请求
  useEffect(() => {
    return () => {
      abortRef.current?.abort();
    };
  }, []);

  // 开始面试：调用 AI 生成第一个问题
  const handleStart = useCallback(async () => {
    setPhase("interviewing");
    setMessages([]);
    setError(null);
    setAiLoading(true);

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const result = await callInterviewApi(
        { mode: "interview", config, messages: [] },
        controller.signal,
      );
      const reply =
        result.reply ||
        "你好，我是今天的面试官。我们先从基础开始，你能说说你对这个主题的理解吗？";
      setMessages([
        {
          role: "interviewer",
          content: reply,
          timestamp: new Date().toISOString(),
        },
      ]);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(msg);
      // 降级：插入默认问题，让用户能继续面试
      setMessages([
        {
          role: "interviewer",
          content:
            "你好，我是今天的面试官。我们先从基础开始，你能说说你对这个主题的理解吗？",
          timestamp: new Date().toISOString(),
        },
      ]);
    } finally {
      setAiLoading(false);
      abortRef.current = null;
    }
  }, [config]);

  // 发送回答 → AI 追问
  const handleSend = useCallback(async () => {
    const text = userInput.trim();
    if (!text || aiLoading) return;

    const userMsg: InterviewMessage = {
      role: "candidate",
      content: text,
      timestamp: new Date().toISOString(),
    };
    // 先乐观插入用户消息，让 UI 即时响应
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setUserInput("");
    setError(null);
    setAiLoading(true);

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const result = await callInterviewApi(
        {
          mode: "interview",
          config,
          messages: updatedMessages,
        },
        controller.signal,
      );
      const reply =
        result.reply || "好的，我们换个角度再问问。你能举个实际项目中的例子吗？";
      setMessages((prev) => [
        ...prev,
        {
          role: "interviewer",
          content: reply,
          timestamp: new Date().toISOString(),
        },
      ]);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(msg);
      // 降级：插入默认追问，让用户能继续
      setMessages((prev) => [
        ...prev,
        {
          role: "interviewer",
          content:
            "好的，我们换个角度再问问。你能举个实际项目中的例子吗？",
          timestamp: new Date().toISOString(),
        },
      ]);
    } finally {
      setAiLoading(false);
      abortRef.current = null;
    }
  }, [userInput, aiLoading, messages, config]);

  // 结束面试，生成报告
  const handleFinish = useCallback(async () => {
    if (messages.length < 2) {
      toast.info("至少完成一轮问答再结束面试");
      return;
    }
    setAiLoading(true);
    setError(null);

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const result = await callInterviewApi(
        { mode: "report", config, messages },
        controller.signal,
      );
      const parsed = parseInterviewReport(result.reportJson || "");
      setReport(parsed);
      setPhase("reporting");
      toast.success("面试报告已生成");
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(msg);
      // 降级：用默认报告，仍然进入报告阶段
      setReport({
        overallScore: 70,
        strengths: ["能够回答基本问题"],
        weaknesses: ["部分回答不够深入"],
        improvements: ["多练习项目经验的表述"],
        nextStep: "继续练习，重点提升深度回答能力",
        canInterview: false,
      });
      setPhase("reporting");
    } finally {
      setAiLoading(false);
      abortRef.current = null;
    }
  }, [messages, config]);

  // 重置回到配置阶段
  const handleRetry = useCallback(() => {
    abortRef.current?.abort();
    setPhase("config");
    setMessages([]);
    setReport(null);
    setUserInput("");
    setError(null);
  }, []);

  // 键盘快捷键：Enter 发送，Shift+Enter 换行
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        void handleSend();
      }
    },
    [handleSend],
  );

  // 中止当前 AI 请求
  const handleAbort = useCallback(() => {
    abortRef.current?.abort();
    setAiLoading(false);
  }, []);

  // ====== Phase 1: 配置 ======
  if (phase === "config") {
    return (
      <div className="min-h-screen p-4 max-w-lg mx-auto pb-20 dark:bg-gray-900">
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-sm text-gray-400 dark:text-gray-500 mb-4"
        >
          <Icon name="chevron-left" className="w-4 h-4" />
          返回
        </Link>

        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-card bg-blue-50 dark:bg-blue-950 flex items-center justify-center mx-auto mb-3">
            <Icon name="message-circle" className="w-6 h-6 text-blue-500 dark:text-blue-400" />
          </div>
          <h1 className="text-2xl font-bold mb-2 text-gray-900 dark:text-gray-100">
            AI 模拟面试
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            选择难度和主题，开始你的面试练习
          </p>
        </div>

        {/* 难度选择 */}
        <div className="mb-4">
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            面试难度
          </p>
          <div className="grid grid-cols-2 gap-2">
            {(Object.keys(DIFFICULTY_LABELS) as InterviewDifficulty[]).map(
              (d) => {
                const selected = config.difficulty === d;
                return (
                  <Button
                    key={d}
                    variant={selected ? "primary" : "outline"}
                    size="md"
                    onClick={() => setConfig((prev) => ({ ...prev, difficulty: d }))}
                    className={
                      selected
                        ? "border-blue-500 dark:border-blue-400"
                        : ""
                    }
                  >
                    {DIFFICULTY_LABELS[d]}
                  </Button>
                );
              },
            )}
          </div>
        </div>

        {/* 主题选择 */}
        <div className="mb-4">
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            面试主题
          </p>
          <div className="flex flex-wrap gap-2">
            {TOPICS.map((t) => {
              const selected = config.topic === t;
              return (
                <Button
                  key={t}
                  variant={selected ? "primary" : "outline"}
                  size="sm"
                  onClick={() => setConfig((prev) => ({ ...prev, topic: t }))}
                  className={
                    selected
                      ? "rounded-pill border-blue-500 dark:border-blue-400"
                      : "rounded-pill"
                  }
                >
                  {t}
                </Button>
              );
            })}
          </div>
        </div>

        {/* 错误提示（如有） */}
        {error && (
          <div className="mb-4 p-3 rounded-card bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-xs text-red-700 dark:text-red-300 flex items-start gap-2">
            <Icon name="alert" className="w-3.5 h-3.5 mt-0.5 shrink-0" />
            <span className="flex-1">{error}</span>
            <Button
              variant="ghost"
              size="sm"
              iconOnly
              onClick={() => setError(null)}
              aria-label="关闭错误提示"
              className="text-red-400 hover:text-red-600 dark:hover:text-red-200"
            >
              <Icon name="x" className="w-3.5 h-3.5" />
            </Button>
          </div>
        )}

        <Button
          variant="primary"
          size="lg"
          block
          onClick={handleStart}
          leftIcon="zap"
          className="rounded-pill"
        >
          开始面试
        </Button>
      </div>
    );
  }

  // ====== Phase 2: 面试中 ======
  if (phase === "interviewing") {
    return (
      <div className="min-h-screen flex flex-col dark:bg-gray-900">
        {/* 顶部信息栏 */}
        <div className="sticky top-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur-lg border-b border-gray-200 dark:border-gray-800 px-4 py-3 z-10">
          <div className="flex items-center justify-between max-w-2xl mx-auto">
            <Button
              variant="ghost"
              size="sm"
              iconOnly
              onClick={handleRetry}
              aria-label="返回配置"
              className="text-gray-400 dark:text-gray-500"
            >
              <Icon name="chevron-left" className="w-5 h-5" />
            </Button>
            <div className="text-center">
              <p className="text-xs text-gray-400 dark:text-gray-500">
                {DIFFICULTY_LABELS[config.difficulty]}
              </p>
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                {config.topic}
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleFinish}
              disabled={messages.length < 2 || aiLoading}
            >
              结束
            </Button>
          </div>
        </div>

        {/* 错误提示（面试中） */}
        {error && (
          <div className="shrink-0 bg-red-50 dark:bg-red-950/40 border-b border-red-200 dark:border-red-900 px-3 py-2 text-xs text-red-700 dark:text-red-300 flex items-center justify-between gap-2">
            <span className="truncate flex-1 flex items-center gap-1">
              <Icon name="alert" className="w-3.5 h-3.5 shrink-0" />
              {error}
            </span>
            <Button
              variant="ghost"
              size="sm"
              iconOnly
              onClick={() => setError(null)}
              aria-label="关闭错误"
              className="text-red-400 hover:text-red-600 dark:hover:text-red-200 shrink-0"
            >
              <Icon name="x" className="w-3.5 h-3.5" />
            </Button>
          </div>
        )}

        {/* 消息列表 */}
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-4 max-w-2xl mx-auto w-full"
        >
          <div className="space-y-3">
            {messages.map((msg, i) => {
              const isCandidate = msg.role === "candidate";
              return (
                <div
                  key={i}
                  className={`flex ${isCandidate ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] rounded-card px-4 py-2.5 ${
                      isCandidate
                        ? "bg-blue-500 text-white"
                        : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-100 dark:border-gray-700"
                    }`}
                  >
                    <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                      {msg.content}
                    </p>
                  </div>
                </div>
              );
            })}
            {aiLoading && (
              <div className="flex justify-start">
                <div className="bg-white dark:bg-gray-800 rounded-card px-4 py-2.5 border border-gray-100 dark:border-gray-700">
                  <Icon
                    name="loader"
                    className="w-4 h-4 text-gray-400 dark:text-gray-500 animate-spin"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 输入区 */}
        <div className="sticky bottom-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur-lg border-t border-gray-200 dark:border-gray-800 p-3">
          <div className="max-w-2xl mx-auto flex gap-2 items-end">
            <Textarea
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="输入你的回答... (Enter 发送，Shift+Enter 换行)"
              rows={2}
              className="flex-1"
              disabled={aiLoading}
            />
            {aiLoading ? (
              <Button
                variant="danger"
                onClick={handleAbort}
                aria-label="中止生成"
                title="中止生成"
                className="shrink-0"
              >
                <Icon name="x-circle" className="w-5 h-5" />
              </Button>
            ) : (
              <Button
                variant="primary"
                onClick={handleSend}
                disabled={!userInput.trim()}
                leftIcon="send"
                className="shrink-0"
              >
                发送
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ====== Phase 3: 报告 ======
  if (phase === "reporting" && report) {
    return <InterviewReportView report={report} onRetry={handleRetry} />;
  }

  return null;
}
