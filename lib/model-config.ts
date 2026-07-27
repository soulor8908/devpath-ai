// lib/model-config.ts
// AI 模型配置 CRUD：用户可在 profile 配置多个 OpenAI 兼容模型
//
// 2026-07-27 P0 安全加固（卡帕西视角：根因修复）：
//   - apiKey 不再持久化到 IndexedDB（仅在表单内存中持有，用于 exchange）
//   - createModelConfig / updateModelConfig 写入前用 stripApiKey 去除 apiKey 字段
//   - 旧数据若含 apiKey 会在下次 update 时自动清除（向后兼容迁移）
//   - 服务端只通过 session 鉴权，apiKey 永不离开本机除了 exchange 那一次

import { nanoid } from "nanoid";
import { getItem, setItem, listItems, delItem } from "./storage/db";
import { KEY_PREFIXES, type ModelConfig } from "./types";

/**
 * 从 ModelConfig 中剥离 apiKey 字段。
 *
 * 用途：写入 IndexedDB 前调用，确保 apiKey 永不落盘。
 * 类型上 apiKey 已是可选，这里用解构 + rest 把它从对象中物理删除，
 * 避免某些序列化路径（如 JSON.stringify）把 undefined 字段也带上。
 */
function stripApiKey<T extends { apiKey?: string }>(config: T): Omit<T, "apiKey"> {
  const { apiKey: _omit, ...rest } = config;
  void _omit;
  return rest;
}

/** 预设模型模板（点击后填充到表单，不自动创建） */
export const MODEL_PRESETS: Array<Pick<ModelConfig, "name" | "provider" | "baseURL" | "model">> = [
  {
    name: "智谱 GLM",
    provider: "glm",
    baseURL: "https://open.bigmodel.cn/api/paas/v4",
    model: "glm-4-flash",
  },
  {
    name: "DeepSeek",
    provider: "deepseek",
    baseURL: "https://api.deepseek.com/v1",
    // 2026-07-25：deepseek-chat 已被新 API 拒绝（要求 deepseek-v4-pro/flash）
    model: "deepseek-v4-flash",
  },
  {
    name: "小米 MiMo",
    provider: "mimo",
    baseURL: "https://api.xiaomimimo.com/v1",
    model: "mimo-v2-pro",
  },
  {
    name: "Kimi (Moonshot AI)",
    provider: "kimi",
    baseURL: "https://api.moonshot.cn/v1",
    model: "moonshot-v1-8k",
  },
  {
    name: "OpenAI",
    provider: "custom",
    baseURL: "https://api.openai.com/v1",
    model: "gpt-4o-mini",
  },
  {
    name: "通义千问",
    provider: "custom",
    baseURL: "https://dashscope.aliyuncs.com/compatible-mode/v1",
    model: "qwen-plus",
  },
];

/** 获取所有模型配置 */
export async function listModelConfigs(): Promise<ModelConfig[]> {
  // 2026-07-25 迁移：把老用户的 deepseek-chat 自动升级到 deepseek-v4-flash
  // 旧预设 deepseek-chat 在新 API key 下报错（supported: deepseek-v4-pro/flash）
  // 迁移幂等：仅升级 model="deepseek-chat" 且 baseURL 包含 deepseek.com 的配置
  await migrateDeepseekChatToV4();

  const configs = await listItems<ModelConfig>(KEY_PREFIXES.MODEL_CONFIG);
  return configs.sort((a, b) => {
    // 默认模型排第一，其余按创建时间
    if (a.isDefault && !b.isDefault) return -1;
    if (!a.isDefault && b.isDefault) return 1;
    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
  });
}

/**
 * 迁移：把 deepseek-chat 升级到 deepseek-v4-flash
 *
 * 背景：DeepSeek API 2026 年某次升级后，旧 key 不再支持 deepseek-chat，
 * 报错 "supported API model names are deepseek-v4-pro or deepseek-v4-flash"。
 * 老用户在 profile 里保存的 modelConfig 仍是 deepseek-chat，导致聊天全挂。
 *
 * 策略：
 *   - 仅匹配 baseURL 含 "deepseek.com" 且 model === "deepseek-chat" 的配置
 *   - 升级到 model = "deepseek-v4-flash"（与原 deepseek-chat 同档位的轻量版）
 *   - 幂等：已升级的不重复处理
 *   - 不修改用户自定义的其他模型配置
 */
async function migrateDeepseekChatToV4(): Promise<void> {
  try {
    const configs = await listItems<ModelConfig>(KEY_PREFIXES.MODEL_CONFIG);
    const toMigrate = configs.filter(
      (c) =>
        c.model === "deepseek-chat" &&
        typeof c.baseURL === "string" &&
        c.baseURL.includes("deepseek.com"),
    );
    if (toMigrate.length === 0) return;
    await Promise.all(
      toMigrate.map((c) =>
        setItem(KEY_PREFIXES.MODEL_CONFIG + c.id, stripApiKey({
          ...c,
          model: "deepseek-v4-flash",
        })),
      ),
    );
  } catch {
    // 迁移失败不影响 listModelConfigs 主流程（返回未迁移的数据也比挂掉强）
  }
}

/** 获取默认模型（无则取第一个） */
export async function getDefaultModelConfig(): Promise<ModelConfig | undefined> {
  const configs = await listModelConfigs();
  return configs.find((c) => c.isDefault) ?? configs[0];
}

/** 根据 ID 获取模型 */
export async function getModelConfig(id: string): Promise<ModelConfig | undefined> {
  return getItem<ModelConfig>(KEY_PREFIXES.MODEL_CONFIG + id);
}

/** 创建模型配置 */
export async function createModelConfig(data: Omit<ModelConfig, "id" | "createdAt">): Promise<ModelConfig> {
  const config: ModelConfig = {
    ...data,
    id: nanoid(),
    createdAt: new Date().toISOString(),
  };
  // 如果设为默认，取消其他默认
  if (config.isDefault) {
    await clearOtherDefaults(config.id);
  }
  // P0 安全加固：apiKey 仅用于 exchange，永不落盘 IndexedDB
  const persisted = stripApiKey(config);
  await setItem(KEY_PREFIXES.MODEL_CONFIG + config.id, persisted);
  // 返回不含 apiKey 的配置（调用方应用 payload.apiKey 做 exchange，不依赖此返回值）
  return persisted as ModelConfig;
}

/** 更新模型配置 */
export async function updateModelConfig(id: string, patch: Partial<Omit<ModelConfig, "id" | "createdAt">>): Promise<void> {
  const existing = await getModelConfig(id);
  if (!existing) return;
  const updated = { ...existing, ...patch };
  // 如果设为默认，取消其他默认
  if (patch.isDefault) {
    await clearOtherDefaults(id);
  }
  // P0 安全加固：strip apiKey（旧数据若有 apiKey，本次更新会自动清除）
  await setItem(KEY_PREFIXES.MODEL_CONFIG + id, stripApiKey(updated));
}

/** 删除模型配置 */
export async function deleteModelConfig(id: string): Promise<void> {
  await delItem(KEY_PREFIXES.MODEL_CONFIG + id);
}

/** 设为默认 */
export async function setDefaultModel(id: string): Promise<void> {
  await clearOtherDefaults(id);
  const config = await getModelConfig(id);
  if (config) {
    // P0 安全加固：strip apiKey（旧数据可能含 apiKey，此处顺带清除）
    await setItem(KEY_PREFIXES.MODEL_CONFIG + id, stripApiKey({ ...config, isDefault: true }));
  }
}

/** 取消其他模型的默认标记 */
async function clearOtherDefaults(exceptId: string): Promise<void> {
  const configs = await listModelConfigs();
  await Promise.all(
    configs
      .filter((c) => c.id !== exceptId && c.isDefault)
      .map((c) => setItem(KEY_PREFIXES.MODEL_CONFIG + c.id, stripApiKey({ ...c, isDefault: false })))
  );
}
