// app/api/learn/answers/route.ts
// 生成答案 API（学习向导第 3 步，流式）
//
// 设计（卡帕西视角）：
//   - 入参 { questions, nodes, topic }
//   - 用 streamText 为每题生成答案，按 questionId 逐题返回
//   - 返回 NDJSON 流（每行一个 chunk）
//   - 并发池：3 个 worker 同时跑，避免单题串行阻塞
//
// 流式协议（NDJSON）：
//   - 每行一个 JSON 对象
//   - 成功：{"questionId":"...","answer":"..."}
//   - 单题失败：{"questionId":"...","answer":"","error":"..."}
//   - 结束标记：{"questionId":"","answer":"","done":true,"total":N}
//
// 鉴权（apiKey Session 安全架构）：requireSession 注入 session，body 不含客户端凭证 / userId
//   session 架构下所有用户都用自己加密在 session 中的 apiKey，服务端不再做"今日 N 次"限流
//
// 为什么不用 Vercel AI SDK 的 data stream protocol？
//   - data stream 适合"单一对话流"，无法表达"按 questionId 分批完成"的语义
//   - NDJSON 简单、自描述、易调试，客户端用 ReadableStream reader 即可解析

import { NextRequest, NextResponse } from "next/server";
import { streamText } from "ai";
import { getModelFromSession } from "@/lib/ai/provider";
import { initCloudflareEnv } from "@/lib/ai/cloudflare-env";
import { requireSession } from "@/lib/ai/session-middleware";
import { getPrompt } from "@/lib/ai/prompts";
import type { KnowledgeNode, Question } from "@/lib/types";

export const runtime = "edge";

const PROMPT_DEF = getPrompt("answer_generate");

/** 并发 worker 数量：3 个一组，平衡吞吐和 LLM 端 RPS */
const CONCURRENCY = 3;

interface AnswerChunk {
  questionId: string;
  answer: string;
  done?: boolean;
  total?: number;
  error?: string;
  /** 错误码：UPSTREAM_AUTH 表示上游 AI 鉴权失败（apiKey 失效/风控） */
  errorCode?: string;
}

export async function POST(req: NextRequest) {
  await initCloudflareEnv();
  // 先鉴权
  const sessionResult = await requireSession(req);
  if (sessionResult instanceof NextResponse) return sessionResult;
  const { session } = sessionResult;

  const body = await req.json();
  const { questions, nodes, topic } = body as {
    questions?: Question[];
    nodes?: KnowledgeNode[];
    topic?: string;
  };

  if (!Array.isArray(questions) || questions.length === 0) {
    return NextResponse.json(
      { error: "questions 是必填项且不能为空" },
      { status: 400 },
    );
  }
  if (!topic || typeof topic !== "string" || !topic.trim()) {
    return NextResponse.json({ error: "topic 是必填项" }, { status: 400 });
  }

  const model = getModelFromSession(session, "learn");

  // 构建 nodeId → node 映射，便于按节点上下文生成答案
  const nodeMap = new Map<string, KnowledgeNode>();
  if (Array.isArray(nodes)) {
    for (const n of nodes) {
      if (n?.id) nodeMap.set(n.id, n);
    }
  }

  const total = questions.length;
  const encoder = new TextEncoder();

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const send = (chunk: AnswerChunk) => {
        try {
          controller.enqueue(encoder.encode(JSON.stringify(chunk) + "\n"));
        } catch {
          // controller 可能已关闭（客户端断开）
        }
      };

      // 处理单题：调用 streamText，等待完整文本后推送 chunk
      const handleOne = async (q: Question): Promise<void> => {
        const node = q.nodeId ? nodeMap.get(q.nodeId) : undefined;
        const promptParts: string[] = [
          `学习主题：${topic}`,
        ];
        if (node) {
          promptParts.push(
            `知识点：${node.title}${node.summary ? "（" + node.summary + "）" : ""}`,
          );
          if (node.difficulty) {
            promptParts.push(`难度：${node.difficulty}`);
          }
        }
        promptParts.push("", `面试题：${q.question}`);
        if (Array.isArray(q.keyPoints) && q.keyPoints.length > 0) {
          promptParts.push("", `已知关键点：${q.keyPoints.join(" / ")}`);
        }
        try {
          const result = await streamText({
            model,
            system: PROMPT_DEF.system,
            prompt: promptParts.join("\n"),
          });
          // await result.text 在流结束后 resolve 为完整文本
          const answer = await result.text;
          send({ questionId: q.id, answer });
        } catch (e) {
          const msg = e instanceof Error ? e.message : String(e);
          // 上游 AI 鉴权失败：标记 errorCode，让客户端能提示用户检查 apiKey
          const isUpstreamAuthError = /401|invalid api key|invalid signature|unauthorized/i.test(msg);
          send({
            questionId: q.id,
            answer: "",
            error: isUpstreamAuthError
              ? `AI 服务鉴权失败：${msg}。请到「我的」→「AI 模型」检查 apiKey`
              : msg,
            errorCode: isUpstreamAuthError ? "UPSTREAM_AUTH" : undefined,
          });
        }
      };

      // 并发池：从队列中取任务，最多 CONCURRENCY 个 worker 同时跑
      const queue = [...questions];
      const workers: Promise<void>[] = [];
      for (let i = 0; i < Math.min(CONCURRENCY, queue.length); i++) {
        workers.push(
          (async () => {
            while (queue.length > 0) {
              const q = queue.shift();
              if (q) await handleOne(q);
            }
          })(),
        );
      }
      await Promise.all(workers);

      // 结束标记
      send({ questionId: "", answer: "", done: true, total });
      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "application/x-ndjson; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      "X-AI-Scene": "answer_generate",
    },
  });
}
