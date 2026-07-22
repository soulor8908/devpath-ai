// scripts/build-knowledge-index.ts
// 知识索引构建脚本：读取静态预设 + 内置文档 → 嵌入 → 输出 public/data/knowledge-index.json
//
// 用法：
//   npm run build:knowledge-index                              # 默认 local（@xenova/transformers）
//   EMBEDDING_PROVIDER=cloudflare npm run build:knowledge-index  # 用 Workers AI（需凭证）
//
// Provider 说明（卡帕西视角：dev 用本地、prod 用云端，向量一致性靠同款模型）：
//   - local（默认）：@xenova/transformers 跑 Xenova/bge-base-en-v1.5（ONNX），无需凭证，
//     首次拉模型 ~80MB。dev 友好，但与 Workers AI 在线模型向量分布可能有细微差异。
//   - cloudflare：调 Workers AI REST，需 CLOUDFLARE_API_TOKEN + CLOUDFLARE_ACCOUNT_ID。
//     生产构建必须用此 provider 保证与运行时 /api/embed 同模型同分布。
//
// 输出：public/data/knowledge-index.json（KnowledgeIndexManifest，含 entries + vectors）
// 该文件随版本发布，部署不需凭证，客户端 fetch 后缓存 IndexedDB。

import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

// 复用项目源码里的类型和数据源（tsx 直接跑 TS，无需编译）
import type {
  KnowledgeIndexEntry,
  KnowledgeIndexManifest,
} from "../lib/types";
import { PRESETS } from "../lib/presets";
import { DOC_SECTIONS } from "../lib/docs-content";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const OUTPUT_PATH = path.join(__dirname, "..", "public", "data", "knowledge-index.json");

/** 嵌入模型 id（与 /api/embed 保持一致） */
const EMBEDDING_MODEL = "@cf/baai/bge-base-en-v1.5";
/** bge-base-en-v1.5 输出维度 */
const DIMENSIONS = 768;
/** 索引 schema 版本（schema 不变则不变） */
const INDEX_VERSION = "1.0.0";
/** 批量嵌入大小（Workers AI 单次建议 ≤ 100 条） */
const BATCH_SIZE = 50;

// ============================================================================
// 构造索引条目（不含 vector）
// ============================================================================

function buildEntries(): KnowledgeIndexEntry[] {
  const entries: KnowledgeIndexEntry[] = [];

  // 1. 静态预设节点
  for (const preset of PRESETS) {
    for (const node of preset.knowledgeTree) {
      const searchText = `${node.title} ${node.summary}`.trim();
      entries.push({
        id: `preset:${preset.id}:${node.id}`,
        source: "preset",
        presetId: preset.id,
        presetName: preset.name,
        title: node.title,
        summary: node.summary,
        searchText,
        vector: [], // 占位，后续填充
        difficulty: node.difficulty,
        frequency: node.frequency,
        prerequisites: node.prerequisites,
        href: "", // preset 节点无独立路由，由 KnowledgeDetailModal 处理
        tags: preset.tags,
      });
    }
  }

  // 2. 内置文档节
  for (const doc of DOC_SECTIONS) {
    const summary = doc.content.slice(0, 200).replace(/\n+/g, " ").trim();
    const searchText = `${doc.title} ${doc.keywords.join(" ")} ${doc.content.slice(0, 200)}`.trim();
    entries.push({
      id: `doc:${doc.id}`,
      source: "doc",
      docCategory: doc.category,
      title: doc.title,
      summary,
      searchText,
      vector: [],
      href: `/docs#${doc.id}`,
      tags: doc.keywords,
    });
  }

  return entries;
}

// ============================================================================
// 嵌入 Provider 抽象
// ============================================================================

interface EmbedProvider {
  name: string;
  embed(texts: string[]): Promise<number[][]>;
}

// ---- Local: @xenova/transformers ----
// 注意：需要联网从 huggingface.co 下载 ONNX 模型（首次 ~80MB）。
// 离线/受限网络环境下改用 createMockProvider 生成确定性占位向量，
// 功能链路完整可测，真实部署时用 EMBEDDING_PROVIDER=cloudflare 重建。
async function createLocalProvider(): Promise<EmbedProvider> {
  // 动态 import 避免 prod 构建拉入
  const { pipeline } = await import("@xenova/transformers");
  // Xenova/bge-base-en-v1.5 是 ONNX 版本的同款 BGE 模型
  const extractor = await pipeline(
    "feature-extraction",
    "Xenova/bge-base-en-v1.5",
  );

  return {
    name: "local(@xenova/transformers)",
    embed: async (texts: string[]) => {
      const results: number[][] = [];
      for (const text of texts) {
        const output = await extractor(text, { pooling: "mean", normalize: true });
        // output.data 是 Float32Array，转成 number[]
        results.push(Array.from(output.data as Float32Array));
      }
      return results;
    },
  };
}

// ---- Mock: 确定性占位向量（离线/CI 用，不可用于生产） ----
// 用文本 hash 生成确定性 768 维向量，相同文本 → 相同向量，
// 不同文本 → 不同向量，保证客户端检索链路可测。
// ⚠️ 占位向量无真实语义，仅用于 dev/CI 跑通流程。
// 生产部署必须用 EMBEDDING_PROVIDER=cloudflare 重建。
function createMockProvider(): EmbedProvider {
  return {
    name: "mock(deterministic hash, dev/CI only)",
    embed: async (texts: string[]) => {
      return texts.map((text) => {
        // 简单确定性 hash → 768 维向量，归一化
        const vec = new Array(DIMENSIONS).fill(0);
        for (let i = 0; i < text.length; i++) {
          const ch = text.charCodeAt(i);
          vec[i % DIMENSIONS] += ch;
          vec[(i * 7 + 13) % DIMENSIONS] += ch * 0.7;
        }
        // 加点文本长度特征让相似文本更近
        const lenFeature = text.length / 100;
        for (let i = 0; i < DIMENSIONS; i++) {
          vec[i] += lenFeature * Math.sin(i * 0.1);
        }
        // L2 归一化
        const norm = Math.sqrt(vec.reduce((s, v) => s + v * v, 0)) || 1;
        return vec.map((v) => v / norm);
      });
    },
  };
}

// ---- Cloudflare: Workers AI REST ----
async function createCloudflareProvider(): Promise<EmbedProvider> {
  const token = process.env.CLOUDFLARE_API_TOKEN;
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  if (!token || !accountId) {
    throw new Error(
      "EMBEDDING_PROVIDER=cloudflare 需要 CLOUDFLARE_API_TOKEN + CLOUDFLARE_ACCOUNT_ID 环境变量",
    );
  }
  const endpoint = `https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/run/${EMBEDDING_MODEL}`;

  return {
    name: "cloudflare(Workers AI)",
    embed: async (texts: string[]) => {
      const resp = await fetch(endpoint, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: texts }),
      });
      if (!resp.ok) {
        const errText = await resp.text();
        throw new Error(`Workers AI 请求失败 ${resp.status}: ${errText}`);
      }
      const json = (await resp.json()) as { result?: { data?: number[][] } };
      const data = json.result?.data;
      if (!Array.isArray(data)) {
        throw new Error(`Workers AI 返回格式异常: ${JSON.stringify(json).slice(0, 200)}`);
      }
      return data;
    },
  };
}

// ============================================================================
// 主流程
// ============================================================================

async function main() {
  const providerName = (process.env.EMBEDDING_PROVIDER ?? "local").toLowerCase();
  console.info(`[build-knowledge-index] provider = ${providerName}`);

  let provider: EmbedProvider;
  if (providerName === "cloudflare") {
    provider = await createCloudflareProvider();
  } else if (providerName === "mock") {
    provider = createMockProvider();
  } else {
    // local：尝试加载 @xenova/transformers，失败（如离线）自动降级 mock
    try {
      provider = await createLocalProvider();
    } catch (e) {
      console.warn(
        `[build-knowledge-index] local provider 加载失败（${e instanceof Error ? e.message : e}），降级 mock`,
      );
      console.warn(
        `[build-knowledge-index] ⚠️ mock 向量无真实语义，生产部署必须用 EMBEDDING_PROVIDER=cloudflare 重建`,
      );
      provider = createMockProvider();
    }
  }
  console.info(`[build-knowledge-index] 使用 ${provider.name}`);

  // 构造条目
  const entries = buildEntries();
  console.info(`[build-knowledge-index] 共 ${entries.length} 条目待嵌入`);

  // 校验 id 唯一
  const idSet = new Set<string>();
  for (const e of entries) {
    if (idSet.has(e.id)) {
      throw new Error(`重复的 entry id: ${e.id}`);
    }
    idSet.add(e.id);
  }

  // 分批嵌入
  const startedAt = Date.now();
  for (let i = 0; i < entries.length; i += BATCH_SIZE) {
    const batch = entries.slice(i, i + BATCH_SIZE);
    const texts = batch.map((e) => e.searchText);
    const vectors = await provider.embed(texts);

    if (vectors.length !== batch.length) {
      throw new Error(
        `批量嵌入数量不匹配：期望 ${batch.length}，实际 ${vectors.length}（batch ${i}-${i + batch.length}）`,
      );
    }
    for (let j = 0; j < batch.length; j++) {
      const vec = vectors[j];
      if (vec.length !== DIMENSIONS) {
        throw new Error(
          `维度不匹配：条目 ${batch[j].id} 期望 ${DIMENSIONS}，实际 ${vec.length}`,
        );
      }
      batch[j].vector = vec;
    }
    process.stdout.write(`  已嵌入 ${Math.min(i + BATCH_SIZE, entries.length)}/${entries.length}\r`);
  }
  console.info(""); // 换行

  const elapsed = ((Date.now() - startedAt) / 1000).toFixed(1);
  console.info(`[build-knowledge-index] 嵌入完成，耗时 ${elapsed}s`);

  // 构造 manifest
  const manifest: KnowledgeIndexManifest = {
    version: INDEX_VERSION,
    model: EMBEDDING_MODEL,
    dimensions: DIMENSIONS,
    builtAt: new Date().toISOString(),
    count: entries.length,
    entries,
  };

  // 写文件
  await fs.mkdir(path.dirname(OUTPUT_PATH), { recursive: true });
  await fs.writeFile(OUTPUT_PATH, JSON.stringify(manifest), "utf-8");

  const sizeMB = ((await fs.stat(OUTPUT_PATH)).size / 1024 / 1024).toFixed(2);
  console.info(`[build-knowledge-index] 已写入 ${path.relative(process.cwd(), OUTPUT_PATH)} (${sizeMB} MB)`);
  console.info(`[build-knowledge-index] 统计：${entries.length} 条目 × ${DIMENSIONS} 维，模型 ${EMBEDDING_MODEL}`);
}

main().catch((err) => {
  console.error("[build-knowledge-index] 失败:", err);
  process.exit(1);
});
