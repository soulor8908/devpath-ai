"use client";

// components/ModelConfigModal.tsx
// 模型配置弹框表单（从 profile 页抽取的单一事实源）
//
// 设计（乔布斯视角）：
//   - 用户在聊天中遇到「未配置模型」或 trial 提示时，不跳转 profile 页
//     而是直接在聊天界面弹框完成添加，3 步内完成（选预设 → 填 API Key → 保存）
//   - 入口：ChatClient banner CTA / ModelIconSelector + 号 / 错误提示中的「去添加」
//
// 设计（卡帕西视角）：
//   - 复用 createModelConfig / exchangeSession / MODEL_PRESETS，零新依赖
//   - 保存成功后 onSuccess(config) 回调，调用方可据此：
//     - ChatClient：setModelConfigs + setSelectedModelId + 清 trialMode
//     - profile 页：刷新列表 + 关闭 modal
//   - 错误码映射复用 profile 同款（ExchangeError.code → 可操作提示文案）
//   - 表单状态由本组件自管，避免外部状态污染

import { useEffect, useState } from "react";
import {
  Modal,
  Button,
  Input,
  Select,
  Checkbox,
} from "@/components/ui";
import { Icon } from "@/components/Icon";
import { toast } from "@/lib/toast";
import {
  createModelConfig,
  MODEL_PRESETS,
} from "@/lib/model-config";
import { exchangeSession, ExchangeError } from "@/lib/api-client";
import { getUserId } from "@/lib/sync";
import { scheduleAutoSync } from "@/lib/sync";
import type { ModelConfig } from "@/lib/types";

export interface ModelConfigModalProps {
  open: boolean;
  onClose: () => void;
  /** 保存成功后回调（已 exchange session + 写入 IndexedDB） */
  onSuccess?: (config: ModelConfig) => void;
}

/**
 * 把 exchangeSession 抛出的错误映射为「可操作」的用户提示文案。
 * 与 profile/page.tsx 同款实现，保持行为一致。
 */
function mapExchangeErrorMessage(e: unknown): string {
  if (e instanceof ExchangeError) {
    switch (e.code) {
      case "SERVER_MISCONFIG":
        return "服务端未配置 MASTER_KEY，加密会话不可用。请联系管理员或在 Cloudflare Pages secrets 中设置 MASTER_KEY（openssl rand -base64 32 生成）后重新部署";
      case "ENCRYPT_FAILED":
        return "加密失败：MASTER_KEY 可能不是 32 字节 base64。请用 `openssl rand -base64 32` 重新生成并更新 Cloudflare Pages secret";
      case "SESSION_STORE_FAILED":
        return "会话存储不可用（KV namespace 异常）。请检查 Cloudflare AUTH_SESSIONS KV binding 是否存在且 id 正确";
      case "MISSING_FIELDS":
        return `字段缺失：${e.message}。请重新填写表单后保存`;
      case "INVALID_BODY":
        return "请求体格式错误，请刷新页面后重试";
      default:
        return e.message || `加密会话启用失败（HTTP ${e.status}）`;
    }
  }
  if (e instanceof Error) {
    return e.message || "加密会话启用失败";
  }
  return "加密会话启用失败";
}

export function ModelConfigModal({
  open,
  onClose,
  onSuccess,
}: ModelConfigModalProps) {
  // 表单字段
  const [modelName, setModelName] = useState("");
  const [modelProvider, setModelProvider] =
    useState<ModelConfig["provider"]>("glm");
  const [modelBaseURL, setModelBaseURL] = useState("");
  const [modelApiKey, setModelApiKey] = useState("");
  const [modelModel, setModelModel] = useState("");
  const [modelIsDefault, setModelIsDefault] = useState(true);
  const [showApiKey, setShowApiKey] = useState(false);
  const [modelError, setModelError] = useState("");
  const [saving, setSaving] = useState(false);
  // exchange session 失败的提示（与 modelError 区分：前者是创建后启用加密会话失败）
  const [sessionMsg, setSessionMsg] = useState<
    { ok: boolean; msg: string } | null
  >(null);

  // 默认打开时自动应用第一个预设（GLM），减少用户决策
  useEffect(() => {
    if (!open) return;
    if (!modelName && !modelBaseURL && !modelModel) {
      const preset = MODEL_PRESETS.find((p) => p.provider === "glm");
      if (preset) {
        setModelName(preset.name);
        setModelProvider(preset.provider);
        setModelBaseURL(preset.baseURL);
        setModelModel(preset.model);
      }
    }
    // 仅在打开时初始化一次（关闭时不清空，下次打开保留已填内容便于重试）
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  function applyPreset(preset: (typeof MODEL_PRESETS)[number]) {
    setModelName(preset.name);
    setModelProvider(preset.provider);
    setModelBaseURL(preset.baseURL);
    setModelModel(preset.model);
    setModelError("");
    setSessionMsg(null);
  }

  function handleProviderChange(provider: ModelConfig["provider"]) {
    setModelProvider(provider);
    const preset = MODEL_PRESETS.find((p) => p.provider === provider);
    if (
      preset &&
      (provider === "glm" ||
        provider === "deepseek" ||
        provider === "mimo" ||
        provider === "kimi")
    ) {
      setModelBaseURL(preset.baseURL);
      setModelModel(preset.model);
    }
  }

  async function handleSave() {
    setModelError("");
    setSessionMsg(null);
    if (
      !modelName.trim() ||
      !modelBaseURL.trim() ||
      !modelApiKey.trim() ||
      !modelModel.trim()
    ) {
      setModelError("请填写名称、baseURL、API Key、模型名称");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        name: modelName.trim(),
        provider: modelProvider,
        baseURL: modelBaseURL.trim(),
        apiKey: modelApiKey.trim(),
        model: modelModel.trim(),
        isDefault: modelIsDefault,
      };

      // 1. 写入 IndexedDB（modelConfig 表）
      const savedConfig = await createModelConfig(payload);

      // 2. exchange session：用 apiKey 换取加密 session（服务端 AES-GCM 落 KV）
      // 失败时模型配置已写入，但 session 不可用 → 用户可重试 exchange（profile 页有重试入口）
      try {
        const userId = await getUserId();
        await exchangeSession({
          apiKey: payload.apiKey,
          userId,
          provider: payload.provider,
          baseURL: payload.baseURL,
          model: payload.model,
          name: payload.name,
        });
        setSessionMsg({ ok: true, msg: "已保存并启用加密会话" });
      } catch (e) {
        console.warn("[ModelConfigModal] exchange session failed:", e);
        setSessionMsg({ ok: false, msg: mapExchangeErrorMessage(e) });
        // 模型配置已保存，但加密会话未启用 → 视为部分成功
        // 仍触发 onSuccess 让 UI 更新，但 toast 提示用户去 profile 重试 exchange
        toast.warning("模型已保存，但加密会话启用失败：" + mapExchangeErrorMessage(e));
        onSuccess?.(savedConfig);
        onClose();
        return;
      }

      // 3. 成功 → toast + onSuccess + 关闭 + 触发云端同步
      toast.success("模型已添加，可正常使用 AI 聊天");
      scheduleAutoSync();
      onSuccess?.(savedConfig);
      onClose();
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      setModelError(msg);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="添加 AI 模型"
      description="选预设 → 填 API Key → 保存，3 步即可使用"
      size="md"
    >
      <div className="space-y-3">
        {/* 预设模板 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            预设模板
          </label>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            点击预设可快速填充 baseURL / 模型 / 名称
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {MODEL_PRESETS.map((p) => (
              <Button
                key={p.name}
                variant="outline"
                size="sm"
                onClick={() => applyPreset(p)}
                type="button"
              >
                {p.name}
              </Button>
            ))}
          </div>
        </div>

        {/* 名称 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            名称
          </label>
          <Input
            value={modelName}
            onChange={(e) => setModelName(e.target.value)}
            placeholder="如 我的 GPT"
            inputSize="sm"
            className="mt-1"
          />
        </div>

        {/* Provider */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Provider
          </label>
          <Select
            value={modelProvider}
            onChange={(e) =>
              handleProviderChange(
                e.target.value as ModelConfig["provider"],
              )
            }
            inputSize="sm"
            className="mt-1"
          >
            <option value="glm">glm（智谱）</option>
            <option value="deepseek">deepseek</option>
            <option value="mimo">mimo（小米）</option>
            <option value="kimi">kimi（Moonshot AI）</option>
            <option value="custom">custom</option>
          </Select>
        </div>

        {/* baseURL */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            baseURL
          </label>
          <Input
            value={modelBaseURL}
            onChange={(e) => setModelBaseURL(e.target.value)}
            placeholder="https://api.openai.com/v1"
            inputSize="sm"
            className="mt-1 font-mono"
          />
        </div>

        {/* API Key（密码 + 显隐） */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            API Key
          </label>
          <Input
            type={showApiKey ? "text" : "password"}
            value={modelApiKey}
            onChange={(e) => setModelApiKey(e.target.value)}
            placeholder="sk-..."
            inputSize="sm"
            showPasswordToggle={false}
            className="mt-1 font-mono"
            rightSlot={
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowApiKey((v) => !v)}
                type="button"
              >
                {showApiKey ? "隐藏" : "显示"}
              </Button>
            }
          />
        </div>

        {/* 模型名称 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            模型名称
          </label>
          <Input
            value={modelModel}
            onChange={(e) => setModelModel(e.target.value)}
            placeholder="如 gpt-4o-mini / deepseek-chat"
            inputSize="sm"
            className="mt-1 font-mono"
          />
        </div>

        {/* 设为默认 */}
        <Checkbox
          checked={modelIsDefault}
          onChange={(e) => setModelIsDefault(e.target.checked)}
          className="mt-1"
        >
          设为默认模型
        </Checkbox>

        {/* 错误提示 */}
        {modelError && (
          <div className="rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 px-3 py-2 text-xs text-red-700 dark:text-red-300 flex items-start gap-2">
            <Icon name="x-circle" className="w-3.5 h-3.5 inline-block mt-0.5 shrink-0" />
            <span className="flex-1">{modelError}</span>
          </div>
        )}
        {sessionMsg && (
          <div
            className={`rounded-lg px-3 py-2 text-xs flex items-start gap-2 border ${
              sessionMsg.ok
                ? "bg-green-50 dark:bg-green-950/40 border-green-200 dark:border-green-900 text-green-700 dark:text-green-300"
                : "bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-900 text-amber-800 dark:text-amber-200"
            }`}
          >
            <Icon
              name={sessionMsg.ok ? "check-circle" : "alert"}
              className="w-3.5 h-3.5 inline-block mt-0.5 shrink-0"
            />
            <span className="flex-1">{sessionMsg.msg}</span>
          </div>
        )}
      </div>

      {/* 底部按钮 */}
      <div className="flex items-center justify-end gap-2 mt-5 pt-4 border-t border-gray-200 dark:border-gray-700">
        <Button variant="ghost" onClick={onClose} disabled={saving}>
          取消
        </Button>
        <Button onClick={handleSave} loading={saving} disabled={saving}>
          保存配置
        </Button>
      </div>
    </Modal>
  );
}
