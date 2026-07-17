// lib/parse-ndjson.ts
// NDJSON 流式解析器
//
// 用途：解析 /api/learn/answers 返回的 NDJSON 流
// 设计（卡帕西视角）：
//   - 无状态可推导：每个 chunk 喂进去，返回已完成的行 + 残留 buffer
//   - 容错：单行解析失败不阻塞后续行
//   - 测试友好：纯函数，不依赖任何 IO

/**
 * 解析 NDJSON 数据流的一个 chunk
 *
 * @param buffer 之前残留的未完成行（首次调用传空串）
 * @param rawChunk 本次接收到的原始数据
 * @returns { chunks: 已完成解析的对象数组; remaining: 残留 buffer（传给下次调用） }
 */
export function parseNDJSONChunk<T = unknown>(
  buffer: string,
  rawChunk: string,
): { chunks: T[]; remaining: string } {
  const combined = buffer + rawChunk;
  const lines = combined.split("\n");
  // 最后一行可能不完整，留作下次的 buffer
  const remaining = lines.pop() ?? "";
  const chunks: T[] = [];
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    try {
      chunks.push(JSON.parse(trimmed) as T);
    } catch {
      // 单行解析失败跳过，不阻塞后续行
    }
  }
  return { chunks, remaining };
}

/**
 * 解析完整的 NDJSON 字符串（用于测试或一次性消费）
 */
export function parseNDJSON<T = unknown>(input: string): T[] {
  const { chunks } = parseNDJSONChunk<T>("", input + "\n");
  return chunks;
}
