"use client";

// components/LearnWizard.tsx
// 学习向导：渐进式 AI 生成流程（4 步状态机）
//
// 设计（卡帕西视角 + 乔布斯视角）：
//   - 拆解 AI 全量生成为 3 个独立步骤，让用户在每步确认后再继续
//   - 减少等待焦虑：用户能在 30 秒内看到知识点（而不是等 90 秒才看到完整计划）
//   - 错误用 Toast 提示，避免阻塞式 alert
//   - 每步可独立"重新生成"（带可选新提示词），无需回到第一步
//
// 步骤：
//   1. knowledge（拆知识点） → /api/learn/knowledge
//   2. questions（生成题目） → /api/learn/questions
//   3. answers（流式生成答案） → /api/learn/answers (NDJSON stream)
//   4. saving（保存计划 + 跳转） → IndexedDB + router.push
//
// 取消：confirmDialog 二次确认，避免误丢失已生成的数据

import { useState, useCallback, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { aiFetch } from "@/lib/api-client";
import { getItem, setItem, delItem } from "@/lib/storage/db";
import { topoSort, allocateDaily } from "@/lib/schedule";
import { nowISO } from "@/lib/time";
import { nanoid } from "nanoid";
import { toast } from "@/lib/toast";
import { confirmDialog } from "@/lib/confirm-dialog";
import { Icon } from "@/components/Icon";
import { recordInputHistory } from "@/lib/learn-input-history";
import { savePlanSummary } from "@/lib/plan-summary";
import { hasDemoData, clearDemoData } from "@/lib/demo/preset-data";
import { parseNDJSONChunk } from "@/lib/parse-ndjson";
import {
  KEY_PREFIXES,
  type LearningPlan,
  type KnowledgeNode,
  type Question,
} from "@/lib/types";

type Step = "knowledge" | "questions" | "answers" | "saving";

interface Props {
  topic: string;
  initialPrompt?: string;
  dailyMinutes: number;
  maxNewPerDay: number;
  onExit: () => void;
}

export interface AnswerChunk {
  questionId: string;
  answer: string;
  done?: boolean;
  total?: number;
  error?: string;
}

const STEP_FLOW: { key: Step; label: string }[] = [
  { key: "knowledge", label: "1. 知识点" },
  { key: "questions", label: "2. 题目" },
  { key: "answers", label: "3. 答案" },
  { key: "saving", label: "4. 完成" },
];

const FREQUENCY_COLOR: Record<string, string> = {
  "高": "text-red-600 bg-red-50 dark:bg-red-950 dark:text-red-400",
  "中": "text-amber-600 bg-amber-50 dark:bg-amber-950 dark:text-amber-400",
  "低": "text-gray-600 bg-gray-100 dark:bg-gray-700 dark:text-gray-300",
};

export function LearnWizard({
  topic,
  initialPrompt = "",
  dailyMinutes,
  maxNewPerDay,
  onExit,
}: Props) {
  const router = useRouter();
  const [step, setStep] = useState<Step>("knowledge");
  const [promptText, setPromptText] = useState(initialPrompt);
  const [nodes, setNodes] = useState<KnowledgeNode[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(false);
  const [answerProgress, setAnswerProgress] = useState({ done: 0, total: 0 });
  const [answerErrors, setAnswerErrors] = useState(0);
  const didInitRef = useRef(false);

  // ---- Step 1: 拆知识点 ----
  const fetchKnowledge = useCallback(async () => {
    setLoading(true);
    try {
      const res = await aiFetch("/api/learn/knowledge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: topic.trim(),
          prompt: promptText.trim() || undefined,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `请求失败 (${res.status})`);
      }
      const data = (await res.json()) as { nodes: KnowledgeNode[] };
      if (!data.nodes || data.nodes.length === 0) {
        throw new Error("AI 未返回知识点，请重试或调整提示词");
      }
      setNodes(data.nodes);
      await recordInputHistory(topic.trim()).catch(() => {});
      toast.success(`已拆解 ${data.nodes.length} 个知识点`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "未知错误";
      toast.error(`知识点拆解失败：${msg}`);
    } finally {
      setLoading(false);
    }
  }, [topic, promptText]);

  // 首次挂载：优先恢复草稿，无草稿才自动开始拆知识点
  useEffect(() => {
    if (didInitRef.current) return;
    didInitRef.current = true;
    void (async () => {
      try {
        const draft = await getItem<{
          topic: string;
          nodes: KnowledgeNode[];
          questions: Question[];
          answerProgress: { done: number; total: number };
          step: Step;
          savedAt: number;
        }>(KEY_PREFIXES.PLAN_DRAFT + topic);
        if (draft && draft.nodes?.length > 0) {
          setNodes(draft.nodes);
          setQuestions(draft.questions || []);
          setAnswerProgress(draft.answerProgress || { done: 0, total: 0 });
          setStep(draft.step || "knowledge");
          toast.info("已恢复上次未完成的草稿");
          return; // 跳过自动抓取
        }
      } catch {
        // 草稿读取失败：静默回退到自动抓取
      }
      void fetchKnowledge();
    })();
  // 仅挂载时执行一次：fetchKnowledge 通过 didInitRef 守卫避免 StrictMode 双触发
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 草稿持久化：nodes/questions/answerProgress/step 任一变化即写回 IndexedDB
  // 仅当已生成实质内容时写入，避免空草稿覆盖已有草稿
  useEffect(() => {
    if (topic && (nodes.length > 0 || questions.length > 0)) {
      void setItem(KEY_PREFIXES.PLAN_DRAFT + topic, {
        topic,
        nodes,
        questions,
        answerProgress,
        step,
        savedAt: Date.now(),
      }).catch(() => {});
    }
  }, [topic, nodes, questions, answerProgress, step]);

  // ---- Step 2: 生成题目（answer 字段清空） ----
  const fetchQuestions = useCallback(async () => {
    if (nodes.length === 0) return;
    setLoading(true);
    try {
      const res = await aiFetch("/api/learn/questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nodes }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `请求失败 (${res.status})`);
      }
      const data = (await res.json()) as { questions: Question[] };
      if (!data.questions || data.questions.length === 0) {
        throw new Error("AI 未返回题目，请重试");
      }
      setQuestions(data.questions);
      toast.success(`已生成 ${data.questions.length} 道题目`);
      setStep("questions");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "未知错误";
      toast.error(`题目生成失败：${msg}`);
    } finally {
      setLoading(false);
    }
  }, [nodes]);

  // ---- Step 3: 流式生成答案 ----
  const fetchAnswers = useCallback(async () => {
    if (questions.length === 0) return;
    setLoading(true);
    setAnswerProgress({ done: 0, total: questions.length });
    setAnswerErrors(0);
    setStep("answers");
    try {
      const res = await aiFetch("/api/learn/answers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          questions,
          nodes,
          topic: topic.trim(),
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `请求失败 (${res.status})`);
      }
      if (!res.body) throw new Error("响应无流");

      // NDJSON 解析（用 lib/parse-ndjson 纯函数，便于单测）
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let done = 0;
      let errors = 0;
      const updated: Question[] = [...questions];

      const applyChunk = (chunk: AnswerChunk) => {
        if (chunk.done) {
          setAnswerProgress({ done, total: chunk.total ?? questions.length });
          return;
        }
        if (!chunk.questionId) return;
        const idx = updated.findIndex((q) => q.id === chunk.questionId);
        if (idx >= 0) {
          updated[idx] = {
            ...updated[idx],
            answer: chunk.answer ?? "",
          };
          if (chunk.error) errors++;
          done++;
          setAnswerProgress({ done, total: questions.length });
          setAnswerErrors(errors);
          setQuestions([...updated]);
        }
      };

      while (true) {
        const { value, done: streamDone } = await reader.read();
        if (streamDone) break;
        const text = decoder.decode(value, { stream: true });
        const parsed = parseNDJSONChunk<AnswerChunk>(buffer, text);
        buffer = parsed.remaining;
        for (const chunk of parsed.chunks) {
          applyChunk(chunk);
        }
      }
      // 处理最后残留的 buffer（流结束后）
      if (buffer.trim()) {
        const parsed = parseNDJSONChunk<AnswerChunk>("", buffer + "\n");
        for (const chunk of parsed.chunks) {
          applyChunk(chunk);
        }
      }
      if (errors > 0) {
        toast.warning(`答案生成完成（${done}/${questions.length}），${errors} 题失败`);
      } else {
        toast.success(`答案生成完成（${done}/${questions.length}）`);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "未知错误";
      toast.error(`答案生成失败：${msg}`);
    } finally {
      setLoading(false);
    }
  }, [questions, nodes, topic]);

  // ---- Step 4: 保存计划并跳转 ----
  const saveAndRedirect = useCallback(async () => {
    setStep("saving");
    try {
      const sorted = topoSort(nodes);
      const schedule = allocateDaily(sorted, dailyMinutes, maxNewPerDay);
      const now = nowISO();
      const plan: LearningPlan = {
        id: nanoid(),
        topic: topic.trim(),
        knowledgeTree: nodes,
        questions,
        schedule,
        dailyMinutes,
        maxNewPerDay,
        fsrsMode: "standard",
        prompt: promptText.trim() || undefined,
        createdAt: now,
        updatedAt: now,
      };
      await setItem(KEY_PREFIXES.PLAN + plan.id, plan);
      await savePlanSummary(plan);
      // 计划已保存：清除草稿（避免下次进入向导时误恢复）
      await delItem(KEY_PREFIXES.PLAN_DRAFT + topic).catch(() => {});

      // Demo 数据清除提示
      const hasDemo = await hasDemoData();
      if (hasDemo) {
        const ok = await confirmDialog({
          title: "清除示例数据？",
          message: "检测到首次访问注入的示例数据。已创建真实学习计划，是否清除示例数据？",
          confirmText: "清除",
          cancelText: "保留",
          danger: true,
        });
        if (ok) await clearDemoData();
      }
      toast.success("学习计划已创建");
      router.push(`/learn/${plan.id}`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "未知错误";
      toast.error(`保存计划失败：${msg}`);
      setStep("answers");
    }
  }, [nodes, questions, topic, dailyMinutes, maxNewPerDay, promptText, router]);

  // ---- 取消（带二次确认） ----
  const handleExit = useCallback(async () => {
    const hasData = nodes.length > 0 || questions.length > 0;
    if (hasData && step !== "saving") {
      const ok = await confirmDialog({
        title: "退出学习向导？",
        message: "已生成的知识点和题目将丢失，需要重新开始。确定退出吗？",
        confirmText: "退出",
        cancelText: "继续生成",
        danger: true,
      });
      if (!ok) return;
    }
    onExit();
  }, [nodes, questions, step, onExit]);

  // ---- 回到上一步 ----
  const handleBack = useCallback(() => {
    if (step === "questions") setStep("knowledge");
    else if (step === "answers") setStep("questions");
  }, [step]);

  return (
    <div className="min-h-screen p-4 sm:p-6 max-w-3xl mx-auto">
      {/* 顶部：标题 + 退出 */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-bold truncate">{topic}</h1>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            学习向导 · {dailyMinutes} 分钟/天 · 每日 {maxNewPerDay} 个新内容
          </p>
        </div>
        <button
          onClick={handleExit}
          className="ml-2 px-3 py-1.5 text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors flex items-center gap-1"
        >
          <Icon name="x" className="w-4 h-4 inline-block" /> 退出
        </button>
      </div>

      {/* 进度条 */}
      <div className="flex items-center gap-1 mb-6 text-xs">
        {STEP_FLOW.map((s, i) => {
          const active = step === s.key;
          const passed = STEP_FLOW.findIndex((x) => x.key === step) > i;
          return (
            <div key={s.key} className="flex items-center flex-1 last:flex-none">
              <div
                className={`px-2 py-1 rounded-full transition-colors ${
                  active
                    ? "bg-black text-white dark:bg-white dark:text-black"
                    : passed
                    ? "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400"
                    : "bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-500"
                }`}
              >
                {s.label}
              </div>
              {i < STEP_FLOW.length - 1 && (
                <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700 mx-1" />
              )}
            </div>
          );
        })}
      </div>

      {/* Step 1: 知识点 */}
      {step === "knowledge" && (
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">知识点拆解</h2>
            <button
              onClick={fetchKnowledge}
              disabled={loading}
              className="text-xs px-3 py-1.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors flex items-center gap-1"
            >
              {loading ? (
                <span className="inline-block w-3 h-3 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
              ) : (
                <Icon name="refresh-cw" className="w-3.5 h-3.5 inline-block" />
              )}
              {nodes.length > 0 ? "重新生成" : "重新生成"}
            </button>
          </div>

          {/* 提示词输入（可调整后重新生成） */}
          <details className="border rounded-lg p-3 bg-amber-50/50 dark:bg-amber-950/20">
            <summary className="text-sm cursor-pointer text-gray-700 dark:text-gray-300">
              <Icon name="target" className="w-4 h-4 inline-block align-middle" /> 自定义提示词（调整后点&ldquo;重新生成&rdquo;生效）
            </summary>
            <textarea
              value={promptText}
              onChange={(e) => setPromptText(e.target.value)}
              placeholder="例如：请以大厂面试官视角拆解，重点考察高并发场景和源码原理"
              rows={3}
              maxLength={2000}
              className="w-full mt-2 px-3 py-2 text-sm border rounded resize-y focus:outline-none focus:ring-2 focus:ring-amber-400 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-100"
            />
            <p className="text-[11px] text-gray-400 mt-1">{promptText.length}/2000 字</p>
          </details>

          {/* 节点列表 */}
          {loading && nodes.length === 0 ? (
            <div className="py-12 text-center">
              <div className="inline-block w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-3" />
              <p className="text-sm text-gray-600 dark:text-gray-300">AI 正在拆解知识点...</p>
              <p className="text-xs text-gray-400 mt-1">预计 10-30 秒</p>
            </div>
          ) : nodes.length === 0 ? (
            <div className="py-12 text-center text-sm text-gray-500">
              <p>点击&ldquo;重新生成&rdquo;开始拆解知识点</p>
            </div>
          ) : (
            <ul className="space-y-2">
              {nodes.map((n, i) => (
                <li
                  key={n.id}
                  className="p-3 border rounded-lg bg-white dark:bg-gray-900 dark:border-gray-700"
                >
                  <div className="flex items-start gap-2">
                    <span className="text-xs text-gray-400 mt-0.5 shrink-0">#{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium text-gray-900 dark:text-gray-100">{n.title}</span>
                        {n.bigTech && (
                          <span className="px-1.5 py-0.5 text-[10px] bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 rounded">
                            <Icon name="building" className="w-3 h-3 inline-block align-middle" /> 大厂高频
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{n.summary}</p>
                      <div className="flex items-center gap-2 mt-2 text-[11px]">
                        <span className="text-gray-400">难度</span>
                        <span className="text-gray-700 dark:text-gray-300">{"★".repeat(n.difficulty)}{"☆".repeat(5 - n.difficulty)}</span>
                        <span className={`px-1.5 py-0.5 rounded ${FREQUENCY_COLOR[n.frequency] ?? ""}`}>
                          频率 {n.frequency}
                        </span>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}

          {/* 下一步 */}
          {nodes.length > 0 && (
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={fetchQuestions}
                disabled={loading}
                className="px-4 py-2 bg-black text-white dark:bg-white dark:text-black text-sm rounded-lg font-medium hover:opacity-90 disabled:opacity-50 transition-opacity flex items-center gap-1"
              >
                {loading ? (
                  <>
                    <span className="inline-block w-3 h-3 border-2 border-white border-t-transparent dark:border-black dark:border-t-transparent rounded-full animate-spin" />
                    生成题目中...
                  </>
                ) : (
                  <>
                    确认知识点 → 生成题目
                    <Icon name="chevron-right" className="w-4 h-4 inline-block" />
                  </>
                )}
              </button>
            </div>
          )}
        </section>
      )}

      {/* Step 2: 题目 */}
      {step === "questions" && (
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">面试题（{questions.length} 题）</h2>
            <div className="flex items-center gap-2">
              <button
                onClick={handleBack}
                disabled={loading}
                className="text-xs px-3 py-1.5 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                ← 返回知识点
              </button>
              <button
                onClick={fetchQuestions}
                disabled={loading}
                className="text-xs px-3 py-1.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors flex items-center gap-1"
              >
                {loading ? (
                  <span className="inline-block w-3 h-3 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Icon name="refresh-cw" className="w-3.5 h-3.5 inline-block" />
                )}
                重新生成
              </button>
            </div>
          </div>

          <p className="text-xs text-gray-500 dark:text-gray-400">
            <Icon name="info" className="w-3.5 h-3.5 inline-block align-middle" />
            确认题目后，AI 会逐题生成答案（流式输出，逐题完成）。
          </p>

          {loading ? (
            <div className="py-12 text-center">
              <div className="inline-block w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-3" />
              <p className="text-sm text-gray-600 dark:text-gray-300">AI 正在生成题目...</p>
              <p className="text-xs text-gray-400 mt-1">预计 20-60 秒</p>
            </div>
          ) : (
            <ul className="space-y-2">
              {questions.map((q, i) => (
                <li
                  key={q.id}
                  className="p-3 border rounded-lg bg-white dark:bg-gray-900 dark:border-gray-700"
                >
                  <div className="flex items-start gap-2">
                    <span className="text-xs text-gray-400 mt-0.5 shrink-0">Q{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900 dark:text-gray-100">{q.question}</p>
                      {q.bigTech && (
                        <span className="inline-block mt-1 px-1.5 py-0.5 text-[10px] bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 rounded">
                          <Icon name="building" className="w-3 h-3 inline-block align-middle" /> 大厂高频
                        </span>
                      )}
                      {q.keyPoints && q.keyPoints.length > 0 && (
                        <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1">
                          关键点：{q.keyPoints.join(" / ")}
                        </p>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}

          {!loading && questions.length > 0 && (
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={fetchAnswers}
                disabled={loading}
                className="px-4 py-2 bg-black text-white dark:bg-white dark:text-black text-sm rounded-lg font-medium hover:opacity-90 disabled:opacity-50 transition-opacity flex items-center gap-1"
              >
                确认题目 → 生成答案
                <Icon name="chevron-right" className="w-4 h-4 inline-block" />
              </button>
            </div>
          )}
        </section>
      )}

      {/* Step 3: 答案（流式） */}
      {step === "answers" && (
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">答案生成</h2>
            <button
              onClick={handleBack}
              disabled={loading}
              className="text-xs px-3 py-1.5 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              ← 返回题目
            </button>
          </div>

          {/* 进度条 */}
          <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900">
            <div className="flex items-center justify-between text-xs">
              <span className="text-blue-700 dark:text-blue-300">
                {loading ? "AI 正在逐题生成答案..." : "答案生成完成"}
              </span>
              <span className="text-blue-700 dark:text-blue-300 font-mono">
                {answerProgress.done} / {answerProgress.total}
              </span>
            </div>
            <div className="mt-2 h-2 bg-blue-100 dark:bg-blue-900 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-600 transition-all duration-300"
                style={{
                  width: `${
                    answerProgress.total > 0
                      ? (answerProgress.done / answerProgress.total) * 100
                      : 0
                  }%`,
                }}
              />
            </div>
            {answerErrors > 0 && (
              <p className="text-[11px] text-amber-600 dark:text-amber-400 mt-1">
                {answerErrors} 题生成失败（可保存后逐题重新生成）
              </p>
            )}
          </div>

          {/* 题目 + 答案 */}
          <ul className="space-y-3">
            {questions.map((q, i) => (
              <li
                key={q.id}
                className={`p-3 border rounded-lg bg-white dark:bg-gray-900 dark:border-gray-700 ${
                  q.answer ? "border-green-200 dark:border-green-900" : "opacity-70"
                }`}
              >
                <div className="flex items-start gap-2">
                  <span className="text-xs text-gray-400 mt-0.5 shrink-0">Q{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{q.question}</p>
                    {q.answer ? (
                      <div className="mt-2 text-xs text-gray-700 dark:text-gray-300 whitespace-pre-wrap border-t pt-2 dark:border-gray-700">
                        {q.answer}
                      </div>
                    ) : loading ? (
                      <p className="mt-2 text-xs text-gray-400 animate-pulse">生成中...</p>
                    ) : (
                      <p className="mt-2 text-xs text-red-500">未生成</p>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>

          {/* 完成 → 保存（允许部分答案未生成：进入详情页可继续生成） */}
          {!loading && answerProgress.total > 0 && (
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={saveAndRedirect}
                className="px-4 py-2 bg-black text-white dark:bg-white dark:text-black text-sm rounded-lg font-medium hover:opacity-90 transition-opacity flex items-center gap-1"
              >
                {answerProgress.done < answerProgress.total ? (
                  `完成（${answerProgress.total - answerProgress.done} 题未生成答案）`
                ) : (
                  <>确认完成 → 创建学习计划 <Icon name="check" className="w-4 h-4 inline-block" /></>
                )}
              </button>
            </div>
          )}
        </section>
      )}

      {/* Step 4: 保存中 */}
      {step === "saving" && (
        <div className="py-16 text-center">
          <div className="inline-block w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4" />
          <p className="text-base font-medium">正在创建学习计划...</p>
          <p className="text-xs text-gray-400 mt-1">编排日程并保存到本地</p>
        </div>
      )}
    </div>
  );
}
