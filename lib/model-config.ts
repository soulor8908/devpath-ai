// lib/model-config.ts
// AI 模型配置 CRUD：用户可在 profile 配置多个 OpenAI 兼容模型

import { nanoid } from "nanoid";
import { getItem, setItem, listItems, delItem } from "./storage/db";
import { KEY_PREFIXES, type ModelConfig } from "./types";

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
    model: "deepseek-chat",
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
  const configs = await listItems<ModelConfig>(KEY_PREFIXES.MODEL_CONFIG);
  return configs.sort((a, b) => {
    // 默认模型排第一，其余按创建时间
    if (a.isDefault && !b.isDefault) return -1;
    if (!a.isDefault && b.isDefault) return 1;
    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
  });
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
  await setItem(KEY_PREFIXES.MODEL_CONFIG + config.id, config);
  return config;
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
  await setItem(KEY_PREFIXES.MODEL_CONFIG + id, updated);
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
    await setItem(KEY_PREFIXES.MODEL_CONFIG + id, { ...config, isDefault: true });
  }
}

/** 取消其他模型的默认标记 */
async function clearOtherDefaults(exceptId: string): Promise<void> {
  const configs = await listModelConfigs();
  await Promise.all(
    configs
      .filter((c) => c.id !== exceptId && c.isDefault)
      .map((c) => setItem(KEY_PREFIXES.MODEL_CONFIG + c.id, { ...c, isDefault: false }))
  );
}
