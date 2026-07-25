// lib/presets/loader.ts
// 预设知识库【按需加载器】——客户端组件获取完整题库数据的唯一入口。
//
// 设计（卡帕西视角）：
//   每个 preset 文件都是一个独立 chunk（webpack 对动态 import 自动 code-splitting），
//   只有用户真正点击某个预设时才下载对应数据（几十~几百 kB），
//   首包从 ~800kB 降到 ~150kB（共享块 + 页面代码）。
//   映射表显式列出 id → import()，保证 webpack 能静态分析出 chunk 边界；
//   不要用变量拼接路径（`import(`./${id}`)` 会把整个目录打进 context chunk）。
//
// 使用方式：
//   const preset = await loadPresetById("frontend"); // PresetMeta | undefined
//   列表/卡片/匹配等轻量场景请用 ./meta 的 PRESET_METAS（同步、零数据下载）。

import { getPresetMetaById, type PresetCardMeta } from "./meta";
import type { PresetMeta } from "./index";
import type { KnowledgeNode, Question, ScheduleItem } from "../types";

// 类型再导出：消费方只需从本模块拿类型，无需触碰 barrel（见 ./index.ts 头注释的性能约束）
export type { PresetMeta } from "./index";

/** 单个 preset 文件的数据形态（topic + 知识树 + 题库 + 日程） */
interface PresetData {
  topic: string;
  knowledgeTree: KnowledgeNode[];
  questions: Question[];
  schedule: ScheduleItem[];
}

/**
 * id → 动态 import 映射。
 * 显式穷举（而非变量路径）让 webpack 为每个文件生成独立 chunk，
 * 且未列出的 id 不会触发任何网络请求。
 */
const PRESET_LOADERS: Record<string, () => Promise<{ default?: unknown } & Record<string, unknown>>> = {
  "frontend-to-ai-engineer": () => import("./frontend-to-ai-engineer"),
  "algorithm-200": () => import("./algorithm-200"),
  frontend: () => import("./frontend"),
  backend: () => import("./backend"),
  ai: () => import("./ai"),
  "llm-app": () => import("./llm-app"),
};

/** 各 preset 文件的主导出常量名（与文件内 export const XXX_PRESET 对应） */
const PRESET_EXPORT_NAMES: Record<string, string> = {
  "frontend-to-ai-engineer": "FRONTEND_TO_AI_ENGINEER_PRESET",
  "algorithm-200": "ALGORITHM_200_PRESET",
  frontend: "FRONTEND_PRESET",
  backend: "BACKEND_PRESET",
  ai: "AI_PRESET",
  "llm-app": "LLM_APP_PRESET",
};

/** 简单内存缓存：同一预设重复加载时复用（模块级 chunk 已被 webpack 缓存，这里再省一次对象组装） */
const presetCache = new Map<string, PresetMeta>();

/**
 * 按 id 动态加载完整预设数据（含题库）。
 * 未命中返回 undefined；加载失败抛错（调用方自行 try/catch 降级）。
 */
export async function loadPresetById(id: string): Promise<PresetMeta | undefined> {
  const cached = presetCache.get(id);
  if (cached) return cached;

  const meta: PresetCardMeta | undefined = getPresetMetaById(id);
  const loader = PRESET_LOADERS[id];
  const exportName = PRESET_EXPORT_NAMES[id];
  if (!meta || !loader || !exportName) return undefined;

  const mod = await loader();
  const data = mod[exportName] as PresetData | undefined;
  if (!data) return undefined;

  const preset: PresetMeta = {
    id: meta.id,
    name: meta.name,
    icon: meta.icon,
    description: meta.description,
    tags: meta.tags,
    topic: data.topic,
    knowledgeTree: data.knowledgeTree,
    questions: data.questions,
    schedule: data.schedule,
  };
  presetCache.set(id, preset);
  return preset;
}
