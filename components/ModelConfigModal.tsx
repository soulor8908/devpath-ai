"use client";

// components/ModelConfigModal.tsx
// 模型配置弹框表单（从 profile 页抽取的单一事实源）
//
// 设计（乔布斯视角）：
//   - 用户在聊天中遇到「未配置模型」或 trial 提示时，不跳转 profile 页
//     而是直接在聊天界面弹框完成添加，3 步内完成（选预设 → 填 API Key → 保存）
//   - 入口：ChatClient banner CTA / ModelIconSelector + 号 / 错误提示中的「去添加」
//   - profile 页列表的「编辑/删除/测试」也复用本组件，消除 6 处重复代码
//
// 设计（卡帕西视角）：
//   - 复用 createModelConfig / exchangeSession / MODEL_PRESETS，零新依赖
//   - 保存成功后 onSuccess(config) 回调，调用方可据此：
//     - ChatClient：setModelConfigs + setSelectedModelId + 清 trialMode
//     - profile 页：刷新列表 + 关闭 modal
//   - 错误码映射复用 lib/model-config-form.ts（单一事实源，与 profile 共享）
//   - 表单状态由本组件自管，避免外部状态污染
//   - 关闭时统一 resetForm，修掉 API Key 残留隐患
//   - 编辑模式与新建模式行为差异通过 editingModel prop 区分：
//     - 保存逻辑：editingModel ? updateModelConfig(id, patch) : createModelConfig(data)
//     - 标题：编辑模型配置 / 添加 AI 模型
//     - 底部按钮：编辑模式可加「删除」「测试连接」按钮（需传入对应回调）

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
import { confirmDialog } from "@/lib/confirm-dialog";
import {
  createModelConfig,
  updateModelConfig,
  MODEL_PRESETS,
} from "@/lib/model-config";
import { exchangeSession } from "@/lib/api-client";
import { getUserId } from "@/lib/sync";
import { scheduleAutoSync } from "@/lib/sync";
// applyPreset 由 handleProviderChange 内部调用，组件无需直接导入
import {
  handleProviderChange,
  mapExchangeErrorMessage,
  validateModelForm,
} from "@/lib/model-config-form";
import type { ModelConfig } from "@/lib/types";

export interface ModelConfigModalProps {
  open: boolean;
  onClose: () => void;
  /** 保存成功后回调（已 exchange session + 写入 IndexedDB） */
  onSuccess?: (config: ModelConfig) => void;
  /** 编辑模式：传入已有配置则进入编辑模式，null 或不传为新建 */
  editingModel?: ModelConfig | null;
  /** 编辑模式下的删除回调（提供后才显示"删除"按钮） */
  onDelete?: (id: string) => void | Promise<void>;
  /** 编辑模式下的"测试连接"回调（提供后才显示"测试连接"按钮） */
  onTest?: (config: ModelConfig) => void | Promise<void>;
}

export function ModelConfigModal({
  open,
  onClose,
  onSuccess,
  editingModel,
  onDelete,
  onTest,
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
  const [deleting, setDeleting] = useState(false);
  const [testing, setTesting] = useState(false);
  // exchange session 失败的提示（与 modelError 区分：前者是创建后启用加密会话失败）
  const [sessionMsg, setSessionMsg] = useState<
    { ok: boolean; msg: string } | null
  >(null);

  // 打开时初始化表单：
  //   - 编辑模式（editingModel 非空）：用已有配置填充字段
  //   - 新建模式：保留原"自动应用 GLM 预设"逻辑，减少用户决策
  // 关闭时统一 resetForm，修掉 API Key 残留隐患
  useEffect(() => {
    if (!open) {
      // 关闭时清空，避免下次打开残留上次输入（特别是 API Key）
      resetForm();
      return;
    }
    if (editingModel) {
      // 编辑模式：用已有配置填充
      setModelName(editingModel.name);
      setModelProvider(editingModel.provider);
      setModelBaseURL(editingModel.baseURL);
      setModelApiKey(editingModel.apiKey);
      setModelModel(editingModel.model);
      setModelIsDefault(editingModel.isDefault);
      setModelError("");
      setSessionMsg(null);
    } else {
      // 新建模式：首次打开自动应用第一个预设（GLM），减少用户决策
      // 仅在所有字段为空时回填，避免覆盖用户已填内容（重试场景）
      if (!modelName && !modelBaseURL && !modelModel) {
        const preset = MODEL_PRESETS.find((p) => p.provider === "glm");
        if (preset) {
          setModelName(preset.name);
          setModelProvider(preset.provider);
          setModelBaseURL(preset.baseURL);
          setModelModel(preset.model);
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, editingModel]);

  /** 重置表单（关闭时调用，避免 API Key 残留） */
  function resetForm() {
    setModelName("");
    setModelProvider("glm");
    setModelBaseURL("");
    setModelApiKey("");
    setModelModel("");
    setModelIsDefault(true);
    setShowApiKey(false);
    setModelError("");
    setSessionMsg(null);
  }

  /** 点击预设模板：填充 name + provider + baseURL + model */
  function handleApplyPreset(preset: (typeof MODEL_PRESETS)[number]) {
    setModelName(preset.name);
    setModelProvider(preset.provider);
    setModelBaseURL(preset.baseURL);
    setModelModel(preset.model);
    setModelError("");
    setSessionMsg(null);
  }

  /** Provider 改变时，调用共享的 handleProviderChange 计算新 baseURL + model */
  function handleProviderSelect(provider: ModelConfig["provider"]) {
    const next = handleProviderChange(provider, modelBaseURL);
    setModelProvider(next.provider as ModelConfig["provider"]);
    setModelBaseURL(next.baseURL);
    setModelModel(next.model);
  }

  async function handleSave() {
    setModelError("");
    setSessionMsg(null);
    // 调用共享校验：返回 null 表示通过
    const formError = validateModelForm({
      name: modelName,
      provider: modelProvider,
      baseURL: modelBaseURL,
      apiKey: modelApiKey,
      model: modelModel,
      isDefault: modelIsDefault,
    });
    if (formError) {
      setModelError(formError);
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

      // 1. 写入 IndexedDB：编辑模式 update / 新建模式 create
      let savedConfig: ModelConfig;
      if (editingModel) {
        await updateModelConfig(editingModel.id, payload);
        savedConfig = { ...editingModel, ...payload };
      } else {
        savedConfig = await createModelConfig(payload);
      }

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
        toast.warning(
          "模型已保存，但加密会话启用失败：" + mapExchangeErrorMessage(e),
        );
        onSuccess?.(savedConfig);
        onClose();
        return;
      }

      // 3. 成功 → toast + onSuccess + 关闭 + 触发云端同步
      toast.success(
        editingModel ? "模型配置已更新" : "模型已添加，可正常使用 AI 聊天",
      );
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

  /** 删除：弹 confirmDialog 二次确认 → 调 onDelete → 关闭 modal */
  async function handleDelete() {
    if (!editingModel || !onDelete) return;
    const ok = await confirmDialog({
      title: "删除模型配置？",
      message: `确定删除「${editingModel.name}」吗？此操作不可恢复。`,
      confirmText: "删除",
      cancelText: "取消",
      danger: true,
    });
    if (!ok) return;
    setDeleting(true);
    try {
      await onDelete(editingModel.id);
      onClose();
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      setModelError(msg);
    } finally {
      setDeleting(false);
    }
  }

  /** 测试连接：调 onTest 回调（profile 列表页传入完整链路） */
  async function handleTest() {
    if (!editingModel || !onTest) return;
    setTesting(true);
    try {
      await onTest(editingModel);
    } finally {
      setTesting(false);
    }
  }

  const isEditMode = !!editingModel;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEditMode ? "编辑模型配置" : "添加 AI 模型"}
      description={
        isEditMode
          ? "修改后点击保存即可生效"
          : "选预设 → 填 API Key → 保存，3 步即可使用"
      }
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
                onClick={() => handleApplyPreset(p)}
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
              handleProviderSelect(
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
      <div className="flex items-center justify-between gap-2 mt-5 pt-4 border-t border-gray-200 dark:border-gray-700">
        {/* 左侧：编辑模式 + onDelete 才显示删除按钮 */}
        {isEditMode && onDelete ? (
          <Button
            variant="ghost"
            onClick={handleDelete}
            loading={deleting}
            disabled={deleting || saving || testing}
            className="text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40"
          >
            删除
          </Button>
        ) : (
          <span />
        )}

        {/* 右侧：测试连接 + 取消 + 保存 */}
        <div className="flex items-center gap-2">
          {isEditMode && onTest && (
            <Button
              variant="outline"
              onClick={handleTest}
              loading={testing}
              disabled={testing || saving || deleting}
            >
              测试连接
            </Button>
          )}
          <Button
            variant="ghost"
            onClick={onClose}
            disabled={saving || deleting || testing}
          >
            取消
          </Button>
          <Button
            onClick={handleSave}
            loading={saving}
            disabled={saving || deleting || testing}
          >
            {isEditMode ? "更新配置" : "保存配置"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
