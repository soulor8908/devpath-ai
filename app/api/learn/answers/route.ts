// app/api/learn/answers/route.ts
// 生成答案 API（学习向导第 3 步，流式）
//
// 设计（卡帕西视角）：
//   - 入参 { questions, nodes, topic }
//   - 用 streamText 为每题生成答案，按 questionId 逐题返回
//   - 返回 NDJSON 流（每行一个 chunk）
//   - 并发池：3 个 worker 同时跑，避免单题串行阻塞
//   - KV 限流 scene=answer_generate（5/天，DEFAULT_QUOTA）
//
// 流式协议（NDJSON）：
//   - 每行一个 JSON 对象
//   - 成功：{"questionId":"...","answer":"..."}
//   - 单题失败：{"questionId":"...","answer":"","error":"..."}
//   - 结束标记：{"questionId":"","answer":"","done":true,"total":N}
//
// 鉴权（apiKey Session 安全架构）：requireSession 注入 session，body 不含客户端凭证 / userId
//
// 为什么不用 Vercel AI SDK 的 data stream protocol？
//   - data stream 适合"单一对话流"，无法表达"按 questionId 分批完成"的语义
//   - NDJSON 简单、自描述、易调试，客户端用 ReadableStream reader 即可解析

import { NextRequest, NextResponse } from "next/server";
import { streamText } from "ai";
import { getModelFromSession } from "@/lib/ai/provider";
import { initCloudflareEnv, getCloudflareKV } from "@/lib/ai/cloudflare-env";
import { requireSession } from "@/lib/ai/session-middleware";
import { createKVStore } from "@/lib/storage/kv";
import { checkRateLimit, incrementRateLimit } from "@/lib/ai/rate-limit";
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

  // 限流：所有请求都限流
  const kv = createKVStore(getCloudflareKV());
  const { allowed, limit } = await checkRateLimit(
    session.userId,
    "answer_generate",
    kv,
  );
  if (!allowed) {
    return NextResponse.json(
      {
        error: "今日 AI 调用已达上限",
        code: "RATE_LIMITED",
        scene: "answer_generate",
        remaining: 0,
        limit,
      },
      { status: 429 },
    );
  }
  // 乐观计数：流式响应前先 +1，失败不回滚（保守计数）
  await incrementRateLimit(session.userId, "answer_generate", kv);

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
          send({ questionId: q.id, answer: "", error: msg });
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
