// lib/model-config-form.ts
// 模型配置表单的共享纯函数（单一事实源）
//
// 设计（卡帕西视角）：
//   - 之前 app/profile/page.tsx 与 components/ModelConfigModal.tsx 各自实现一份
//     applyPreset / handleProviderChange / mapExchangeErrorMessage，行为已开始漂移
//     （如预设触发条件不一致、错误码映射覆盖不全）。本文件抽出来作为唯一实现，
//     两处调用方共享，行为差异天然消除。
//   - 全部为纯函数：输入相同 → 输出相同，无副作用，可在 Node 环境单测。
//   - 不依赖 React / IndexedDB / fetch，仅依赖 MODEL_PRESETS 与 ExchangeError 类型。
//
// 设计（乔布斯视角）：
//   - 错误文案不是「失败」而是「下一步动作建议」——
//     SERVER_MISCONFIG 不是重试 100 次能解决的，要给用户具体动作
//     （重新部署 / 检查 KV binding / 重新生成密钥）
//   - 校验失败时文案直接指向字段，不留「请检查输入」这类无效提示

import { MODEL_PRESETS } from "./model-config";
import { ExchangeError } from "./api-client";

/**
 * 模型配置表单状态（编辑/新建共用）。
 *
 * 与 ModelConfig 区别：不含 id / createdAt（保存时由 createModelConfig 注入）。
 * provider 用宽泛的 string 而非联合类型，便于表单输入受控处理；
 * 调用方在保存前可强制断言为 ModelConfig["provider"]。
 */
export interface ModelFormState {
  name: string;
  provider: string;
  baseURL: string;
  apiKey: string;
  model: string;
  isDefault: boolean;
}

/**
 * 根据 provider 名称回填 baseURL + model。
 *
 * 行为：
 *   - 命中预设（glm/deepseek/mimo/kimi）→ 返回预设的 baseURL + model
 *   - provider = "custom" → 返回 null（保留用户已填内容，不覆盖）
 *   - 未命中预设 → 返回 null
 *
 * 注意：MODEL_PRESETS 中 OpenAI / 通义千问 预设的 provider 也是 "custom"，
 * 但按 name 匹配会被误命中，所以这里按 provider 字段精确匹配——
 * 切到 custom 时不应该把用户填的 baseURL 覆盖成 OpenAI 的。
 */
export function applyPreset(providerName: string): {
  baseURL?: string;
  model?: string;
} | null {
  // custom 不自动回填（保留用户填的 baseURL/model）
  if (providerName === "custom") return null;
  const preset = MODEL_PRESETS.find((p) => p.provider === providerName);
  if (!preset) return null;
  return { baseURL: preset.baseURL, model: preset.model };
}

/**
 * 处理 provider 切换：返回新 provider + 应使用的 baseURL / model。
 *
 * 策略：
 *   - 切到 glm/deepseek/mimo/kimi → 用预设的 baseURL + model 覆盖当前值
 *   - 切到 custom → 保留当前 baseURL，清空 model（让用户重新填，因为 custom
 *     的 model 名格式各异，保留旧值容易误用）
 *
 * 不修改原对象，返回新对象（纯函数）。
 */
export function handleProviderChange(
  newProvider: string,
  currentBaseURL: string,
): { provider: string; baseURL: string; model: string } {
  const preset = applyPreset(newProvider);
  if (preset) {
    return {
      provider: newProvider,
      baseURL: preset.baseURL ?? currentBaseURL,
      model: preset.model ?? "",
    };
  }
  // custom 或未知 provider：保留 baseURL，model 留给用户填
  return {
    provider: newProvider,
    baseURL: currentBaseURL,
    model: "",
  };
}

/**
 * 把 exchangeSession / aiFetch 抛出的错误映射为「可操作」的用户提示文案。
 *
 * 服务端 code 翻译策略（卡帕西视角）：
 *   - SERVER_MISCONFIG / ENCRYPT_FAILED / SESSION_STORE_FAILED：服务端配置类错误，
 *     重试无效，必须给具体动作建议（重新部署 / 重新生成密钥 / 检查 KV binding）
 *   - MISSING_FIELDS / INVALID_BODY：客户端可恢复，提示重新填表
 *   - UPSTREAM_AUTH：上游 AI provider 鉴权失败，提示检查 apiKey
 *   - INVALID_API_KEY / RATE_LIMIT / INSUFFICIENT_QUOTA / NETWORK_ERROR：上游 AI 常见错误码，
 *     给具体动作建议（检查 apiKey / 稍后重试 / 充值 / 检查网络）
 *   - 其它 / UNKNOWN：兜底用原 message，永远返回非空字符串
 *
 * 设计（乔布斯视角）：
 *   - 旧的提示「加密会话启用失败，请重试」对服务端配置类错误是无效的——
 *     重试 100 次还是同一个错，用户只会越来越 frustrated
 *   - 把服务端 code 翻译成具体动作建议（重新部署 / 检查字段 / 联系管理员）
 */
export function mapExchangeErrorMessage(err: unknown): string {
  if (err instanceof ExchangeError) {
    switch (err.code) {
      case "SERVER_MISCONFIG":
        return "服务端未配置 MASTER_KEY，加密会话不可用。请联系管理员或在 Cloudflare Pages secrets 中设置 MASTER_KEY（openssl rand -base64 32 生成）后重新部署";
      case "ENCRYPT_FAILED":
        return "加密失败：MASTER_KEY 可能不是 32 字节 base64。请用 `openssl rand -base64 32` 重新生成并更新 Cloudflare Pages secret";
      case "SESSION_STORE_FAILED":
        return "会话存储不可用（KV namespace 异常）。请检查 Cloudflare AUTH_SESSIONS KV binding 是否存在且 id 正确";
      case "MISSING_FIELDS":
        return `字段缺失：${err.message}。请重新填写表单后保存`;
      case "INVALID_BODY":
        return "请求体格式错误，请刷新页面后重试";
      case "UPSTREAM_AUTH":
        return `apiKey 鉴权失败：${err.message || "上游 AI 拒绝"}。请检查 apiKey 是否正确、是否被风控或失效`;
      case "INVALID_API_KEY":
        return "API Key 无效，请检查是否复制完整";
      case "RATE_LIMIT":
        return "请求过于频繁，请稍后再试";
      case "INSUFFICIENT_QUOTA":
        return "AI 服务额度不足";
      case "NETWORK_ERROR":
        return "网络连接异常";
      case "UNKNOWN":
        return `AI 服务连接失败：${err.message || "未知错误"}`;
      default:
        return err.message || `加密会话启用失败（HTTP ${err.status}）`;
    }
  }
  if (err instanceof Error) {
    return err.message || "加密会话启用失败";
  }
  return "加密会话启用失败";
}

/**
 * 表单校验：返回 null 表示通过，否则返回错误文案。
 *
 * 校验项：
 *   - name 非空
 *   - provider 非空
 *   - baseURL 必须是合法 http/https URL
 *   - apiKey 非空
 *   - model 非空
 *
 * 注意：URL 校验用 new URL() 解析，能识别「无协议」「非法字符」等错误。
 * 协议必须是 http/https，禁止 file:/data: 等本地协议。
 */
export function validateModelForm(form: ModelFormState): string | null {
  if (!form.name.trim()) return "请填写名称";
  if (!form.provider.trim()) return "请选择 provider";
  const trimmedBase = form.baseURL.trim();
  if (!trimmedBase) return "请填写 baseURL";
  try {
    const u = new URL(trimmedBase);
    if (u.protocol !== "http:" && u.protocol !== "https:") {
      return "baseURL 必须以 http:// 或 https:// 开头";
    }
  } catch {
    return "baseURL 不是合法的 URL";
  }
  if (!form.apiKey.trim()) return "请填写 API Key";
  if (!form.model.trim()) return "请填写模型名称";
  return null;
}
