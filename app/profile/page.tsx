"use client";

// app/profile/page.tsx
// 「我的」中心：关键信息前置 + 个人信息折叠 + 低频功能收纳到「更多」
// 布局：学习统计 / 收藏 / AI 模型（置顶·始终展开）→ 个人信息（折叠）→ 更多（折叠）
// 安全架构（apiKey Session 改造后）：
//   - 保存模型配置时调 exchangeSession 用 apiKey 换取加密 session
//   - session 存储在 IndexedDB key="auth:session"，apiKey 不再随每次请求传输
//   - 提供「登出所有设备」按钮调 revokeSession 吊销 session
//   - 旧用户首次访问检测：有 modelConfig.apiKey 但无 session → 显示升级提示

import { useState, useEffect } from "react";
import Link from "next/link";
import type { PublicProfile, LearnLog, UserProfile, PersonaId, Achievement } from "@/lib/types";
import { getItem as dbGet, setItem as dbSet, listItems } from "@/lib/storage/db";
import { KEY_PREFIXES } from "@/lib/types";
import { chinaDateNow, chinaDateShift } from "@/lib/time";
import { apiFetch, aiFetch, exchangeSession, revokeSession, hasValidSession, ExchangeError } from "@/lib/api-client";
import { listAchievements } from "@/lib/achievements/store";
import { confirmDialog } from "@/lib/confirm-dialog";
import { ShareCardButton } from "@/components/ShareCardButton";
import { SyncStatus } from "@/components/SyncStatus";
import { ThemeToggle } from "@/components/ThemeToggle";
import { scheduleAutoSync, getUserId } from "@/lib/sync";
import {
  loadRoutineMarkdown,
  saveRoutineMarkdown,
  defaultRoutineMarkdown,
  parseRoutine,
} from "@/lib/routine";
import { listFavoriteDecks, listFavoritedQuestions } from "@/lib/favorite";
import {
  listModelConfigs,
  createModelConfig,
  updateModelConfig,
  deleteModelConfig,
  setDefaultModel,
  MODEL_PRESETS,
} from "@/lib/model-config";
import type { ModelConfig } from "@/lib/types";
import { Icon, type IconName } from "@/components/Icon";
import { Button, Input, Textarea, Select, Checkbox } from "@/components/ui";
import { maybeRetrain } from "@/lib/energy-regression";
import { getUserProfile, saveUserProfile } from "@/lib/ai/memory/user-profile";
import { buildUserProfile } from "@/lib/ai/memory/profile-builder";
import { PERSONA_LIST } from "@/lib/ai/persona";

const STORAGE_KEY = "my:profile";

/** VAPID 公钥转 Uint8Array（push 订阅需要） */
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  return Uint8Array.from(rawData, (c) => c.charCodeAt(0));
}

const defaultProfile: PublicProfile = {
  username: "",
  displayName: "",
  avatar: undefined,
  bio: "",
  visibility: { radar: true, heatmap: true, currentTopic: true, notes: false, achievements: false },
  followerCount: 0,
  followingCount: 0,
  updatedAt: new Date().toISOString(),
};

// 常见问题列表（FAQ）
const FAQS: Array<{ q: string; a: string }> = [
  {
    q: "如何开始学习？",
    a: "在首页输入想学的主题，或点击预设知识库一键导入",
  },
  {
    q: "数据存储在哪里？",
    a: "本地 IndexedDB 优先，可在设置中开启云端同步到 Cloudflare KV",
  },
  {
    q: "如何跨设备同步？",
    a: "在「我的个人信息 → 用户 ID」处：旧设备点击「上传到云端」并复制 ID；新设备点击「导入已有 ID」粘贴后，再点「从云端恢复」即可",
  },
  {
    q: "什么是 FSRS？",
    a: "Free Spaced Repetition Scheduler，科学的间隔重复算法，根据你的遗忘曲线安排复习时间",
  },
  {
    q: "API Key 如何存储？",
    a: "API Key 通过加密会话（session）安全传输：保存时仅一次性发送到服务端加密存储，之后所有请求用 session 签名，不再传输 API Key。换设备需重新输入。",
  },
  {
    q: "AI 接口失败/报错怎么办？",
    a: "1) 确保在「AI 模型配置」添加了自己的模型（含 API Key），这是最常见的原因；2) 在聊天页底部确认模型选择器已选中你配置的模型；3) 预设知识库无需 AI 也可使用",
  },
  {
    q: "支持哪些语言？",
    a: "中文界面，代码示例支持 JS/TS/Python/Java/Go/SQL/Bash 等主流语言高亮",
  },
];

export default function ProfilePage() {
  const [profile, setProfile] = useState<PublicProfile>(defaultProfile);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  // 公开主页同步错误（401/500 等向用户展示）
  const [syncError, setSyncError] = useState<string | null>(null);

  // 编辑表单是否展开（默认折叠）
  const [editOpen, setEditOpen] = useState(false);

  // 每日时间表
  const [routine, setRoutine] = useState<string>("");
  const [routineSaving, setRoutineSaving] = useState(false);
  const [routineSaved, setRoutineSaved] = useState(false);
  const [routineHint, setRoutineHint] = useState<string>("");

  // PWA 通知
  const [notifSupported, setNotifSupported] = useState(false);
  const [notifPermission, setNotifPermission] = useState<NotificationPermission | "unsupported">("unsupported");

  // 安全升级提示：检测到旧 modelConfig.apiKey 但无 session 时显示
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  // 收藏统计
  const [deckCount, setDeckCount] = useState(0);
  const [questionCount, setQuestionCount] = useState(0);

  // P2.5 学习统计概览（dashboard Tab 移除后补全闭环）
  const [streak, setStreak] = useState(0);
  const [totalMinutes, setTotalMinutes] = useState(0);
  const [weekMinutes, setWeekMinutes] = useState(0);

  // AI 模型配置
  const [modelConfigs, setModelConfigs] = useState<ModelConfig[]>([]);
  const [showModelForm, setShowModelForm] = useState(false);
  const [editingModel, setEditingModel] = useState<ModelConfig | null>(null);
  const [modelName, setModelName] = useState("");
  const [modelProvider, setModelProvider] = useState<ModelConfig["provider"]>("custom");
  const [modelBaseURL, setModelBaseURL] = useState("");
  const [modelApiKey, setModelApiKey] = useState("");
  const [modelModel, setModelModel] = useState("");
  const [modelIsDefault, setModelIsDefault] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  const [modelSaving, setModelSaving] = useState(false);
  const [modelError, setModelError] = useState("");
  const [testingId, setTestingId] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<Record<string, { ok: boolean; msg: string }>>({});

  // AI 人格（Persona）设置
  // preferredPersona: undefined = 自动（按用户状态选）；否则为 4 种 PersonaId 之一
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [personaSaving, setPersonaSaving] = useState(false);
  const [personaSaved, setPersonaSaved] = useState(false);

  useEffect(() => {
    (async () => {
      const stored = await dbGet<PublicProfile>(STORAGE_KEY);
      if (stored) setProfile(stored);

      const r = await loadRoutineMarkdown();
      setRoutine(r);

      // 检查 PWA 通知支持
      if (typeof window !== "undefined" && "Notification" in window) {
        setNotifSupported(true);
        setNotifPermission(Notification.permission);
      }

      // 加载收藏统计
      const [decks, questions] = await Promise.all([
        listFavoriteDecks(),
        listFavoritedQuestions(),
      ]);
      setDeckCount(decks.length);
      setQuestionCount(questions.length);

      // P2.5 加载学习统计概览：连续打卡 + 总时长 + 本周时长
      const logs = await listItems<LearnLog>(KEY_PREFIXES.LEARN_LOG);
      const total = logs.reduce((sum, l) => sum + (l.duration ?? 0), 0);
      setTotalMinutes(total);
      // 本周（最近 7 天）时长
      let week = 0;
      for (let i = 0; i < 7; i++) {
        const d = chinaDateShift(chinaDateNow(), -i);
        week += logs
          .filter((l) => l.date === d)
          .reduce((s, l) => s + (l.duration ?? 0), 0);
      }
      setWeekMinutes(week);
      // 连续打卡
      const logDates = new Set(logs.map((l) => l.date));
      let streakCount = 0;
      let checkDate = chinaDateNow();
      while (logDates.has(checkDate)) {
        streakCount++;
        checkDate = chinaDateShift(checkDate, -1);
      }
      setStreak(streakCount);

      // 加载 AI 模型配置
      const configs = await listModelConfigs();
      setModelConfigs(configs);

      // 安全升级检测：有 modelConfig.apiKey 但无有效 session → 显示升级提示
      const hasSession = await hasValidSession();
      if (!hasSession) {
        const hasApiKey = configs.some((c) => c.apiKey.trim().length > 0);
        if (hasApiKey) {
          setShowUpgradeModal(true);
        }
      }

      // 加载用户画像（用于 persona 设置）
      const profile = await getUserProfile();
      setUserProfile(profile);

      // P3.4：页面加载时静默检查能量模型是否需要重训练（不阻塞 UI，失败仅 console.warn）
      void maybeRetrain();
    })();
  }, []);

  function update<K extends keyof PublicProfile>(key: K, value: PublicProfile[K]) {
    setProfile((p) => ({ ...p, [key]: value }));
    setSaved(false);
  }

  function toggleVisibility(key: keyof PublicProfile["visibility"]) {
    setProfile((p) => ({
      ...p,
      visibility: { ...p.visibility, [key]: !p.visibility[key] },
    }));
    setSaved(false);
  }

  // 保存个人信息：写入 IndexedDB + 调用 /api/public/[username] PUT
  async function save() {
    setSaving(true);
    try {
      await dbSet(STORAGE_KEY, profile);
      // 成就墙开启时，上传已解锁成就到云端（供公开主页展示）
      let achievementsPayload: Achievement[] | undefined = undefined;
      if (profile.visibility.achievements) {
        try {
          achievementsPayload = await listAchievements();
        } catch {
          achievementsPayload = [];
        }
      }
      const res = await apiFetch(`/api/public/${encodeURIComponent(profile.username)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profile, achievements: achievementsPayload }),
      });
      // 任何非 2xx 都视为同步失败：401（未授权）/ 404（路由异常）/ 500（服务端错误）都不应继续走"已保存"
      if (!res.ok) {
        // 解析服务端返回的错误消息，向用户展示（而不是仅 console.warn）
        let serverMsg = "";
        try {
          const errBody = (await res.json()) as { message?: string; error?: string };
          serverMsg = errBody.message ?? errBody.error ?? "";
        } catch {
          serverMsg = `HTTP ${res.status}`;
        }
        console.warn("公开主页同步失败:", res.status, serverMsg);
        // 401 时给用户明确提示：session 可能过期，需重新保存模型配置以 exchange
        if (res.status === 401) {
          setSyncError(
            `公开主页同步未授权（${serverMsg}）。加密会话可能已过期，请在「AI 模型配置」中重新编辑并保存模型配置以启用加密会话。`,
          );
        } else {
          setSyncError(`公开主页同步失败：${serverMsg}`);
        }
        // 关键修复：同步失败时不显示"已保存"，避免用户误以为已成功（实际 KV 未写入 → /u/x 404）
        setSaved(false);
      } else {
        // 同步成功：清空错误、显示已保存、触发后续自动同步
        setSyncError(null);
        setSaved(true);
        // 触发自动云端同步（含 profile）
        scheduleAutoSync();
      }
    } finally {
      setSaving(false);
    }
  }

  async function saveRoutine() {
    setRoutineSaving(true);
    try {
      await saveRoutineMarkdown(routine);
      // 简单校验：解析后能否得到时段
      const slots = parseRoutine(routine);
      setRoutineHint(
        slots.length > 0
          ? `已识别 ${slots.length} 个时段`
          : "已保存（未识别到任何时段，请检查格式）",
      );
      setRoutineSaved(true);
    } finally {
      setRoutineSaving(false);
    }
  }

  async function requestNotifPermission() {
    if (!notifSupported) return;
    const perm = await Notification.requestPermission();
    setNotifPermission(perm);
    if (perm === "granted") {
      // 尝试订阅 Push（需要配置 NEXT_PUBLIC_VAPID_PUBLIC_KEY）
      try {
        const reg = await navigator.serviceWorker.ready;
        let sub = await reg.pushManager.getSubscription();
        if (!sub) {
          const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
          if (vapidKey) {
            sub = await reg.pushManager.subscribe({
              userVisibleOnly: true,
              applicationServerKey: urlBase64ToUint8Array(vapidKey) as BufferSource,
            });
          }
        }
        if (sub) {
          await dbSet("push:subscription", sub);
        }
      } catch (e) {
        console.warn("Push 订阅失败:", e);
      }
      // 注册 Periodic Background Sync（后台定期检查，让 AI "在呼吸"）
      if ("serviceWorker" in navigator && "PeriodicSyncManager" in window) {
        try {
          const reg = await navigator.serviceWorker.ready;
          const periodicSync = (
            reg as ServiceWorkerRegistration & {
              periodicSync?: {
                register: (
                  tag: string,
                  options?: { minInterval?: number },
                ) => Promise<void>;
              };
            }
          ).periodicSync;
          await periodicSync?.register("devpath-background-check", {
            minInterval: 30 * 60 * 1000, // 30 分钟
          });
        } catch (e) {
          console.warn("Periodic Sync 注册失败:", e);
        }
      }
      // 测试通知
      new Notification("devpath 打卡提醒已开启", {
        body: "我们会在每日学习时段提醒你 📚",
        icon: "/icons/icon-192.png",
      });
    }
  }

  // ============ AI 人格（Persona）设置 ============

  /**
   * 保存 persona 偏好到 UserProfile
   * - value = undefined 表示"自动选择"
   * - 若 userProfile 不存在（首次使用），先 buildUserProfile 构造一份再保存
   */
  async function savePersonaPreference(value: PersonaId | undefined) {
    setPersonaSaving(true);
    try {
      let profile = userProfile;
      if (!profile) {
        // 首次使用：构建画像兜底
        try {
          profile = await buildUserProfile();
        } catch {
          // 构建失败：用最小默认画像兜底（保证用户能选 persona）
          profile = {
            id: "ai:profile",
            skillLevel: {},
            accuracyByNode: {},
            preferredTimeSlots: [],
            averageSessionMinutes: 0,
            goals: { short: [], mid: [], long: [] },
            updatedAt: new Date().toISOString(),
          };
        }
      }
      const next: UserProfile = { ...profile, preferredPersona: value };
      await saveUserProfile(next);
      setUserProfile(next);
      setPersonaSaved(true);
      setTimeout(() => setPersonaSaved(false), 2000);
      // 触发云端同步（确保跨设备生效）
      scheduleAutoSync();
    } finally {
      setPersonaSaving(false);
    }
  }

  // ============ AI 模型配置 ============

  /** 刷新模型配置列表 */
  async function refreshModelConfigs() {
    const configs = await listModelConfigs();
    setModelConfigs(configs);
  }

  /** 重置表单（清空字段，退出编辑模式） */
  function resetModelForm() {
    setEditingModel(null);
    setModelName("");
    setModelProvider("custom");
    setModelBaseURL("");
    setModelApiKey("");
    setModelModel("");
    setModelIsDefault(false);
    setModelError("");
  }

  /** 点击预设模板，填充表单（baseURL + model + name） */
  function applyPreset(preset: (typeof MODEL_PRESETS)[number]) {
    setModelName(preset.name);
    setModelProvider(preset.provider);
    setModelBaseURL(preset.baseURL);
    setModelModel(preset.model);
    setModelError("");
  }

  /** 打开新建表单 */
  function openNewModelForm() {
    resetModelForm();
    setShowModelForm(true);
  }

  /** 点击编辑：用已有配置填充表单并展开 */
  function openEditModelForm(config: ModelConfig) {
    setEditingModel(config);
    setModelName(config.name);
    setModelProvider(config.provider);
    setModelBaseURL(config.baseURL);
    setModelApiKey(config.apiKey);
    setModelModel(config.model);
    setModelIsDefault(config.isDefault);
    setModelError("");
    setShowModelForm(true);
  }

  /** Provider 改变时，若为 glm/deepseek/mimo/kimi 自动回填 baseURL+model */
  function handleProviderChange(provider: ModelConfig["provider"]) {
    setModelProvider(provider);
    const preset = MODEL_PRESETS.find((p) => p.provider === provider);
    if (preset && (provider === "glm" || provider === "deepseek" || provider === "mimo" || provider === "kimi")) {
      setModelBaseURL(preset.baseURL);
      setModelModel(preset.model);
    }
  }

  /** 保存（新建 / 更新）+ 用新配置交换加密 session */
  async function saveModelConfig() {
    setModelError("");
    if (!modelName.trim() || !modelBaseURL.trim() || !modelApiKey.trim() || !modelModel.trim()) {
      setModelError("请填写名称、baseURL、API Key、模型名称");
      return;
    }
    setModelSaving(true);
    try {
      const payload = {
        name: modelName.trim(),
        provider: modelProvider,
        baseURL: modelBaseURL.trim(),
        apiKey: modelApiKey.trim(),
        model: modelModel.trim(),
        isDefault: modelIsDefault,
      };
      let savedConfig: ModelConfig;
      if (editingModel) {
        await updateModelConfig(editingModel.id, payload);
        savedConfig = { ...editingModel, ...payload };
      } else {
        savedConfig = await createModelConfig(payload);
      }

      // exchange session：用新配置交换加密 session（apiKey 一次性发送到服务端）
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
        setShowUpgradeModal(false);
        setTestResult((prev) => ({
          ...prev,
          [savedConfig.id]: { ok: true, msg: "已保存并启用加密会话" },
        }));
      } catch (e) {
        console.warn("[profile] exchange session failed:", e);
        setTestResult((prev) => ({
          ...prev,
          [savedConfig.id]: {
            ok: false,
            msg: mapExchangeErrorMessage(e),
          },
        }));
      }

      await refreshModelConfigs();
      resetModelForm();
      setShowModelForm(false);
      // 触发云端同步，确保跨设备可用（否则换设备后会报 503）
      scheduleAutoSync();
    } finally {
      setModelSaving(false);
    }
  }

  /** 删除模型配置 */
  async function handleDeleteModel(id: string) {
    const ok = await confirmDialog({
      title: "删除模型配置？",
      message: "确定删除该模型配置吗？此操作不可恢复。",
      confirmText: "删除",
      cancelText: "取消",
      danger: true,
    });
    if (!ok) return;
    await deleteModelConfig(id);
    await refreshModelConfigs();
    if (editingModel?.id === id) {
      resetModelForm();
      setShowModelForm(false);
    }
    scheduleAutoSync();
  }

  /** 设为默认 */
  async function handleSetDefault(id: string) {
    await setDefaultModel(id);
    await refreshModelConfigs();
    scheduleAutoSync();
  }

  /**
   * 测试模型连接：完整链路验证（exchange → requireSession → 上游 AI）
   *
   * 历史问题：旧实现只调 exchange，没调 /api/ai-test，导致「测试通过」是假象——
   * exchange 路由只写不读 session，即使 KV binding 没生效也会假性成功。
   * 修复：exchange 后必须调一次 /api/ai-test（走 requireSession），验证：
   *   1. session 能从 KV 读回（KV binding 生效）
   *   2. 签名校验通过（客户端/服务端签名算法一致）
   *   3. 上游 AI provider 接受 apiKey（不是 invalid signature / 401）
   */
  async function handleTestModel(config: ModelConfig) {
    setTestingId(config.id);
    setTestResult((prev) => ({ ...prev, [config.id]: { ok: false, msg: "测试中..." } }));
    try {
      const userId = await getUserId();
      // 第 1 步：exchange 拿到 session（写入服务端 KV + 本地 IndexedDB）
      await exchangeSession({
        apiKey: config.apiKey,
        userId,
        provider: config.provider,
        baseURL: config.baseURL,
        model: config.model,
        name: config.name,
      });
      // 第 2 步：调 /api/ai-test，走完整 requireSession 链路 + 上游 AI 调用
      // 这一步能通过才证明：KV binding 生效 + 签名一致 + apiKey 有效
      const res = await aiFetch("/api/ai-test", {
        method: "POST",
        body: JSON.stringify({}),
      });
      if (!res.ok) {
        const errText = await res.text().catch(() => "");
        // 区分上游 401（apiKey 失效）vs 本地 401（session 链路问题）
        let code = "";
        try {
          const body = await res.clone().json();
          code = typeof body.code === "string" ? body.code : "";
        } catch {
          /* 非 JSON */
        }
        const msg =
          code === "UPSTREAM_AUTH"
            ? `apiKey 鉴权失败：${errText || "上游 AI 拒绝"}。请检查 apiKey 是否正确、是否被风控或失效`
            : `测试失败 (${res.status})${errText ? `: ${errText}` : ""}`;
        setTestResult((prev) => ({
          ...prev,
          [config.id]: { ok: false, msg },
        }));
        return;
      }
      const data = await res.json();
      setTestResult((prev) => ({
        ...prev,
        [config.id]: {
          ok: true,
          msg: `连接成功${data.reply ? `（AI 回复：${data.reply}）` : ""}，加密会话已启用`,
        },
      }));
    } catch (e) {
      const msg = mapExchangeErrorMessage(e);
      setTestResult((prev) => ({
        ...prev,
        [config.id]: { ok: false, msg },
      }));
    } finally {
      setTestingId(null);
    }
  }

  /** 登出所有设备：吊销当前 session */
  async function handleRevokeSession() {
    const ok = await confirmDialog({
      title: "登出所有设备？",
      message: "将吊销当前加密会话，所有设备需重新输入 API Key 才能使用 AI 功能。",
      confirmText: "登出",
      cancelText: "取消",
      danger: true,
    });
    if (!ok) return;
    await revokeSession();
    // 刷新 UI：清空本地 session 后页面状态需重置
    location.reload();
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-4 pb-20">
      <h1 className="text-2xl font-bold">我的</h1>

      {/* === 置顶：核心使用功能（始终展开）=== */}

      {/* 1. 学习统计概览 */}
      <Section
        icon="chart"
        title="学习统计"
        desc="连续打卡 · 累计时长 · 本周表现"
      >
        <div className="grid grid-cols-3 gap-3 mb-3">
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600 flex items-center justify-center gap-1">
              {streak >= 3 && <Icon name="flame" className="w-4 h-4" />}
              {streak}
            </div>
            <div className="text-xs text-gray-500">连续打卡</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {Math.floor(totalMinutes / 60)}
              <span className="text-sm font-normal text-gray-400">h</span>
            </div>
            <div className="text-xs text-gray-500">累计学习</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{weekMinutes}</div>
            <div className="text-xs text-gray-500">本周分钟</div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Link
            href="/stats?tab=heatmap"
            className="rounded-lg border border-gray-200 dark:border-gray-700 px-3 py-2 text-xs text-center hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center justify-center gap-1"
          >
            <Icon name="calendar" className="w-3.5 h-3.5" />
            热力图
          </Link>
          <Link
            href="/stats?tab=radar"
            className="rounded-lg border border-gray-200 dark:border-gray-700 px-3 py-2 text-xs text-center hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center justify-center gap-1"
          >
            <Icon name="target" className="w-3.5 h-3.5" />
            雷达图
          </Link>
          <Link
            href="/stats?tab=weekly"
            className="rounded-lg border border-gray-200 dark:border-gray-700 px-3 py-2 text-xs text-center hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center justify-center gap-1"
          >
            <Icon name="sparkles" className="w-3.5 h-3.5" />
            AI 周报
          </Link>
          <Link
            href="/mistakes"
            className="rounded-lg border border-gray-200 dark:border-gray-700 px-3 py-2 text-xs text-center hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center justify-center gap-1"
          >
            <Icon name="book" className="w-3.5 h-3.5" />
            错题本
          </Link>
        </div>
      </Section>

      {/* 2. 我的收藏 */}
      <Section icon="star" title="我的收藏" desc="收藏的试题集与单题">
        <div className="flex items-center justify-between gap-3">
          <div className="flex gap-6">
            <div>
              <div className="text-2xl font-bold text-blue-600">{deckCount}</div>
              <div className="text-xs text-gray-500">试题集</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-600">{questionCount}</div>
              <div className="text-xs text-gray-500">单题</div>
            </div>
          </div>
          <Link
            href="/favorites"
            className="rounded-lg border px-4 py-2 text-sm hover:bg-gray-50"
          >
            查看收藏 →
          </Link>
        </div>
      </Section>

      {/* 3. AI 模型配置（核心使用功能） */}
      <Section icon="sparkles" title="AI 模型配置" desc="管理 OpenAI 兼容模型">
        {/* 配置列表 */}
        <div className="space-y-2">
          {modelConfigs.length === 0 ? (
            <p className="rounded-lg border border-dashed bg-gray-50 px-3 py-4 text-center text-sm text-gray-500">
              暂无模型配置，点击下方按钮新建一个吧
            </p>
          ) : (
            modelConfigs.map((c) => (
              <div
                key={c.id}
                className="rounded-lg border bg-white px-3 py-2 text-sm shadow-sm"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-medium">{c.name}</span>
                      <span className="rounded bg-gray-100 px-1.5 py-0.5 text-xs text-gray-600">
                        {c.provider}
                      </span>
                      {c.isDefault && (
                        <span className="rounded bg-blue-100 px-1.5 py-0.5 text-xs text-blue-700">
                          默认
                        </span>
                      )}
                    </div>
                    <div className="mt-1 truncate text-xs text-gray-500">
                      {c.model} · {c.baseURL}
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-1">
                    {!c.isDefault && (
                      <button
                        onClick={() => handleSetDefault(c.id)}
                        className="rounded border px-2 py-1 text-xs hover:bg-gray-50"
                      >
                        设为默认
                      </button>
                    )}
                    <button
                      onClick={() => handleTestModel(c)}
                      disabled={testingId === c.id}
                      className="rounded border border-green-200 px-2 py-1 text-xs text-green-600 hover:bg-green-50 disabled:opacity-50"
                    >
                      {testingId === c.id ? "测试中..." : "测试"}
                    </button>
                    <button
                      onClick={() => openEditModelForm(c)}
                      className="rounded border px-2 py-1 text-xs hover:bg-gray-50"
                    >
                      编辑
                    </button>
                    <button
                      onClick={() => handleDeleteModel(c.id)}
                      className="rounded border border-red-200 px-2 py-1 text-xs text-red-600 hover:bg-red-50"
                    >
                      删除
                    </button>
                  </div>
                </div>
                {testResult[c.id] && (
                  <div
                    className={`mt-1.5 rounded px-2 py-1 text-xs ${
                      testResult[c.id].ok
                        ? "bg-green-50 text-green-700"
                        : "bg-red-50 text-red-600"
                    }`}
                  >
                    {testResult[c.id].ok ? <Icon name="check-circle" className="w-3.5 h-3.5 inline-block align-middle" /> : <Icon name="x-circle" className="w-3.5 h-3.5 inline-block align-middle" />} {testResult[c.id].msg}
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* 新建 / 收起表单按钮 */}
        <div>
          {!showModelForm ? (
            <Button
              variant="secondary"
              block
              onClick={openNewModelForm}
            >
              + 新建模型配置
            </Button>
          ) : (
            <Button
              variant="secondary"
              block
              onClick={() => {
                setShowModelForm(false);
                resetModelForm();
              }}
            >
              ▲ 收起表单
            </Button>
          )}
        </div>

        {/* 表单 */}
        {showModelForm && (
          <div className="space-y-3 rounded-lg border bg-gray-50/50 p-3">
            {/* 预设模板 */}
            <div>
              <label className="block text-sm font-medium">预设模板</label>
              <p className="text-xs text-gray-500">
                点击预设可快速填充 baseURL / 模型 / 名称
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {MODEL_PRESETS.map((p) => (
                  <button
                    key={p.name}
                    onClick={() => applyPreset(p)}
                    className="rounded-full border bg-white px-3 py-1 text-xs hover:border-blue-400 hover:text-blue-600"
                  >
                    {p.name}
                  </button>
                ))}
              </div>
            </div>

            {/* 名称 */}
            <div>
              <label className="block text-sm font-medium">名称</label>
              <Input
                value={modelName}
                onChange={(e) => setModelName(e.target.value)}
                placeholder="如 我的 GPT"
                className="mt-1"
              />
            </div>

            {/* Provider */}
            <div>
              <label className="block text-sm font-medium">Provider</label>
              <Select
                value={modelProvider}
                onChange={(e) =>
                  handleProviderChange(e.target.value as ModelConfig["provider"])
                }
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
              <label className="block text-sm font-medium">baseURL</label>
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
              <label className="block text-sm font-medium">API Key</label>
              <Input
                type={showApiKey ? "text" : "password"}
                value={modelApiKey}
                onChange={(e) => setModelApiKey(e.target.value)}
                placeholder="sk-..."
                inputSize="sm"
                showPasswordToggle={false}
                className="mt-1 font-mono"
                rightSlot={
                  <button
                    type="button"
                    onClick={() => setShowApiKey((v) => !v)}
                    className="text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 px-1"
                  >
                    {showApiKey ? "隐藏" : "显示"}
                  </button>
                }
              />
            </div>

            {/* 模型名称 */}
            <div>
              <label className="block text-sm font-medium">模型名称</label>
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
              <p className="text-sm text-red-600">{modelError}</p>
            )}

            {/* 保存按钮 */}
            <div className="flex items-center gap-2">
              <Button
                onClick={saveModelConfig}
                loading={modelSaving}
              >
                {editingModel ? "更新配置" : "保存配置"}
              </Button>
              {editingModel && (
                <span className="text-xs text-gray-500">编辑中：{editingModel.name}</span>
              )}
            </div>
          </div>
        )}
      </Section>

      {/* === 折叠：个人信息 === */}
      <CollapsibleSection
        icon="user"
        title="个人信息"
        desc={profile.displayName || `@${profile.username || "username"}`}
      >
        {/* 个人信息概要 */}
        <div className="flex items-center gap-4">
          {profile.avatar ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={profile.avatar}
              alt="头像"
              className="h-16 w-16 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 text-gray-400">
              <Icon name="user" className="w-8 h-8" />
            </div>
          )}
          <div className="min-w-0 flex-1">
            <div className="text-lg font-semibold">
              {profile.displayName || "(未设置显示名)"}
            </div>
            <div className="text-sm text-gray-500">
              @{profile.username || "username"}
            </div>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
              {profile.bio || "(暂无简介)"}
            </p>
          </div>
        </div>

        <div className="border-t pt-3">
          <SyncStatus />
        </div>

        {/* 公开主页同步错误提示 */}
        {syncError && (
          <div className="rounded-lg border border-amber-200 bg-amber-50 dark:bg-amber-950/30 dark:border-amber-800 p-3 text-xs text-amber-800 dark:text-amber-200 space-y-1">
            <p className="font-medium"><Icon name="alert" className="w-3.5 h-3.5 inline-block align-middle" /> 公开主页未同步</p>
            <p>{syncError}</p>
            <p className="text-amber-700 dark:text-amber-300">
              提示：未同步时 /u/{profile.username || "username"} 会显示&quot;用户不存在&quot;。
            </p>
          </div>
        )}

        {/* 仅当设置了 username 时才显示分享按钮（没有 username 无法生成公开主页链接） */}
        {profile.username && (
          <div>
            <ShareCardButton profile={profile} />
          </div>
        )}

        {/* 编辑表单：复用原 editOpen 状态 */}
        <Button
          variant="secondary"
          block
          onClick={() => setEditOpen((v) => !v)}
        >
          {editOpen ? "▲ 收起编辑表单" : "▼ 展开编辑表单"}
        </Button>

        {editOpen && (
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium">用户名（URL 标识）</label>
              <Input
                value={profile.username}
                onChange={(e) =>
                  update(
                    "username",
                    e.target.value.replace(/[^a-zA-Z0-9_-]/g, "").toLowerCase(),
                  )
                }
                placeholder="alice"
                className="mt-1"
              />
              {profile.username && (
                <p className="mt-1 text-xs text-gray-500">
                  主页地址：/u/{profile.username}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium">显示名</label>
              <Input
                value={profile.displayName}
                onChange={(e) => update("displayName", e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium">简介</label>
              <Textarea
                value={profile.bio}
                onChange={(e) => update("bio", e.target.value)}
                rows={2}
                className="mt-1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium">头像 URL（可选）</label>
              <Input
                value={profile.avatar ?? ""}
                onChange={(e) => update("avatar", e.target.value || undefined)}
                className="mt-1"
              />
            </div>

            <div className="rounded bg-gray-50 p-3">
              <p className="mb-2 text-xs font-medium text-gray-500">实时预览</p>
              <div className="flex items-center gap-2">
                {profile.avatar && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={profile.avatar} alt="" className="h-8 w-8 rounded-full" />
                )}
                <div>
                  <div className="font-medium">
                    {profile.displayName || "(未设置)"}
                  </div>
                  <div className="text-xs text-gray-500">
                    @{profile.username || "username"}
                  </div>
                </div>
              </div>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                {profile.bio || "(暂无简介)"}
              </p>
              <div className="mt-2 flex gap-2 text-xs text-gray-500">
                {profile.visibility.radar && <span className="inline-flex items-center gap-1"><Icon name="chart" className="w-3.5 h-3.5 inline-block" />雷达图</span>}
                {profile.visibility.heatmap && <span className="inline-flex items-center gap-1"><Icon name="flame" className="w-3.5 h-3.5 inline-block" />热力图</span>}
                {profile.visibility.currentTopic && <span className="inline-flex items-center gap-1"><Icon name="book" className="w-3.5 h-3.5 inline-block" />当前主题</span>}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                onClick={save}
                disabled={saving || !profile.username}
                loading={saving}
              >
                保存
              </Button>
              {saved && <span className="text-sm text-green-600 inline-flex items-center gap-1">已保存 <Icon name="check" className="w-3.5 h-3.5 inline-block" /></span>}
            </div>
          </div>
        )}
      </CollapsibleSection>

      {/* === 折叠：更多 === */}
      <CollapsibleSection
        icon="settings"
        title="更多"
        desc="主题 / 时间表 / 隐私 / 高级 / 帮助"
      >
        {/* 外观主题 */}
        <div className="space-y-3 border-b pb-4">
          <h3 className="font-medium">主题模式</h3>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600 dark:text-gray-400">切换浅色 / 深色 / 跟随系统</span>
            <ThemeToggle />
          </div>
        </div>

        {/* 每日时间表 */}
        <div className="space-y-3 border-b pb-4">
          <h3 className="font-medium">每日时间表</h3>
          <p className="text-xs text-gray-500">
            配置后首页会显示&quot;现在该做什么&quot;+ 剩余分钟 + 下一项，并联动 FSRS 复习 / 休息工具
          </p>
          <Textarea
            value={routine}
            onChange={(e) => {
              setRoutine(e.target.value);
              setRoutineSaved(false);
              setRoutineHint("");
            }}
            rows={12}
            placeholder={defaultRoutineMarkdown()}
            inputSize="sm"
            className="mt-1 font-mono"
          />
          <div className="flex flex-wrap items-center gap-2">
            <Button
              size="sm"
              onClick={saveRoutine}
              loading={routineSaving}
            >
              保存时间表
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => {
                setRoutine(defaultRoutineMarkdown());
                setRoutineSaved(false);
              }}
            >
              使用模板
            </Button>
            {routineSaved && (
              <span className="text-sm text-green-600 inline-flex items-center gap-1">已保存 <Icon name="check" className="w-3.5 h-3.5 inline-block" /></span>
            )}
            {routineHint && (
              <span className="text-xs text-gray-500">{routineHint}</span>
            )}
          </div>
        </div>

        {/* AI 人格（Persona） */}
        <div className="space-y-3 border-b py-4">
          <h3 className="font-medium">AI 人格（Persona）</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            选择 AI 对话的语气风格。&quot;自动&quot; 会根据你当下的能量、心情、提问内容智能切换。
          </p>
          <div className="space-y-1.5">
            <button
              type="button"
              onClick={() => savePersonaPreference(undefined)}
              disabled={personaSaving}
              className={`flex w-full items-center justify-between rounded-lg border px-3 py-2 text-left text-sm transition-colors ${
                !userProfile?.preferredPersona
                  ? "border-blue-500 bg-blue-50 dark:bg-blue-950/30 dark:border-blue-700"
                  : "border-gray-200 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-700"
              }`}
            >
              <span>
                <Icon name="sparkles" className="w-3.5 h-3.5 inline-block align-middle mr-1.5" />
                <span className="font-medium">自动</span>
                <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
                  按状态智能切换（推荐）
                </span>
              </span>
              {!userProfile?.preferredPersona && (
                <Icon name="check" className="w-4 h-4 text-blue-600" />
              )}
            </button>

            {PERSONA_LIST.map((p) => {
              const selected = userProfile?.preferredPersona === p.id;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => savePersonaPreference(p.id)}
                  disabled={personaSaving}
                  className={`flex w-full items-center justify-between rounded-lg border px-3 py-2 text-left text-sm transition-colors ${
                    selected
                      ? "border-blue-500 bg-blue-50 dark:bg-blue-950/30 dark:border-blue-700"
                      : "border-gray-200 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-700"
                  }`}
                >
                  <span className="min-w-0 flex-1">
                    <span className="font-medium">{p.name}</span>
                    <span className="ml-2 block text-xs text-gray-500 dark:text-gray-400">
                      {p.description}
                    </span>
                  </span>
                  {selected && (
                    <Icon name="check" className="w-4 h-4 shrink-0 text-blue-600" />
                  )}
                </button>
              );
            })}
          </div>
          {personaSaving && (
            <p className="text-xs text-gray-400">保存中...</p>
          )}
          {personaSaved && (
            <p className="text-xs text-green-600 inline-flex items-center gap-1">
              <Icon name="check" className="w-3.5 h-3.5 inline-block" /> 已保存
            </p>
          )}
        </div>

        {/* 隐私设置 */}
        <div className="space-y-3 border-b py-4">
          <h3 className="font-medium">隐私设置</h3>
          {(
            [
              { key: "radar" as const, label: "能力雷达图" },
              { key: "heatmap" as const, label: "学习热力图" },
              { key: "currentTopic" as const, label: "当前学习主题" },
              { key: "notes" as const, label: "笔记内容" },
              { key: "achievements" as const, label: "成就墙" },
            ]
          ).map((item) => (
            <div
              key={item.key}
              className="flex items-center justify-between"
            >
              <span className="text-sm">{item.label}</span>
              <Checkbox
                checked={profile.visibility[item.key]}
                onChange={() => toggleVisibility(item.key)}
                checkboxSize="lg"
                labelPosition="left"
              />
            </div>
          ))}
          <div className="flex items-center gap-2 pt-1">
            <Button
              size="sm"
              onClick={save}
              disabled={saving || !profile.username}
              loading={saving}
            >
              保存隐私设置
            </Button>
            {saved && <span className="text-sm text-green-600 inline-flex items-center gap-1">已保存 <Icon name="check" className="w-3.5 h-3.5 inline-block" /></span>}
            {!profile.username && (
              <span className="text-xs text-gray-400">需先设置用户名</span>
            )}
          </div>
        </div>

        {/* PWA 学习提醒 */}
        <div className="space-y-3 border-b py-4">
          <h3 className="font-medium">学习提醒（PWA 通知）</h3>
          {!notifSupported ? (
            <p className="text-sm text-gray-500">当前环境不支持通知</p>
          ) : notifPermission === "granted" ? (
            <p className="text-sm text-green-600"><Icon name="check" className="w-3.5 h-3.5 inline-block align-middle" /> 通知已开启</p>
          ) : (
            <div className="space-y-2">
              <p className="text-sm text-gray-500">
                开启后可每日定时提醒你学习（外部监督）
              </p>
              <Button
                size="sm"
                variant="dark"
                onClick={requestNotifPermission}
              >
                开启通知
              </Button>
            </div>
          )}
        </div>

        {/* 高级：加密会话管理 */}
        <div className="space-y-3 border-b py-4">
          <h3 className="font-medium">高级 · 加密会话</h3>
          <div className="rounded-lg bg-blue-50 dark:bg-blue-950/30 p-3 text-xs text-blue-800 dark:text-blue-200 space-y-1">
            <p><strong>API Key 安全机制</strong></p>
            <p>保存模型配置时，API Key 仅一次性发送到服务端加密存储，之后所有请求用 session 签名，不再传输 API Key。换设备需重新输入。</p>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            <Icon name="alert" className="w-3.5 h-3.5 inline-block align-middle" /> 加密会话有效期 7 天，每次成功请求自动续期。如需吊销所有设备，点击下方按钮。
          </p>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="ghost"
              onClick={handleRevokeSession}
            >
              登出所有设备
            </Button>
          </div>
        </div>

        {/* 应用信息 */}
        <div className="space-y-3 border-b py-4">
          <h3 className="font-medium">应用信息</h3>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-gray-500">应用名称</dt>
              <dd className="font-medium">devpath · AI 学习教练</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">版本号</dt>
              <dd className="font-mono">0.1.0</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="shrink-0 text-gray-500">技术栈</dt>
              <dd className="text-right text-gray-700 dark:text-gray-300">
                Next.js 15 · React 19 · TypeScript · Cloudflare Pages · IndexedDB · FSRS · Vercel AI SDK
              </dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="shrink-0 text-gray-500">GitHub 仓库</dt>
              <dd>
                <a
                  href="https://github.com/soulor8908/devpath-ai"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="break-all text-blue-600 hover:underline"
                >
                  soulor8908/devpath-ai
                </a>
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">部署平台</dt>
              <dd className="text-gray-700 dark:text-gray-300">Cloudflare Pages（edge runtime）</dd>
            </div>
          </dl>
        </div>

        {/* 帮助 */}
        <div className="space-y-3 py-4">
          <h3 className="font-medium">帮助</h3>
          <Link
            href="/docs"
            className="flex items-center justify-between rounded-lg border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/30 px-3 py-2.5 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
          >
            <span className="flex items-center gap-2 text-sm font-medium text-blue-700 dark:text-blue-300">
              <Icon name="book" className="w-4 h-4" />
              查看完整使用文档
            </span>
            <Icon name="chevron-right" className="w-4 h-4 text-blue-400" />
          </Link>

          <div className="space-y-2">
            <p className="text-xs font-medium text-gray-500">常见问题</p>
            {FAQS.map((faq) => (
              <details
                key={faq.q}
                className="group rounded-lg border px-3 py-2 text-sm [&_summary::-webkit-details-marker]:hidden"
              >
                <summary className="flex cursor-pointer items-center justify-between font-medium hover:text-blue-600">
                  <span>{faq.q}</span>
                  <span className="text-gray-400 transition-transform group-open:rotate-90">
                    ›
                  </span>
                </summary>
                <p className="mt-2 text-gray-600 dark:text-gray-300">{faq.a}</p>
              </details>
            ))}
          </div>

          <div className="flex items-center justify-between border-t pt-4 text-sm">
            <span className="text-gray-500">反馈渠道</span>
            <a
              href="https://github.com/soulor8908/devpath-ai/issues"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              GitHub Issues →
            </a>
          </div>

          <div className="flex items-center justify-between border-t pt-4 text-sm">
            <span className="text-gray-500">快捷键</span>
            <span className="text-gray-700 dark:text-gray-300">
              <kbd className="rounded border bg-gray-50 px-1.5 py-0.5 text-xs">
                Cmd/Ctrl+K
              </kbd>{" "}
              快速跳转
              <span className="ml-1 text-xs text-gray-400">（即将支持）</span>
            </span>
          </div>
        </div>
      </CollapsibleSection>

      {/* 安全升级提示模态：旧用户首次访问时显示 */}
      {showUpgradeModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-md rounded-xl bg-white dark:bg-gray-800 p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-2">
              <Icon name="alert" className="w-5 h-5 text-amber-500" />
              <h2 className="text-lg font-semibold">安全升级提示</h2>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              检测到您已配置过 AI 模型，但尚未启用加密会话。为提升安全性，请重新输入 API Key 启用加密会话：保存时仅一次性发送到服务端加密存储，之后所有请求用 session 签名，不再传输 API Key。
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              操作方式：在上方「AI 模型配置」中点击任意模型的「编辑」按钮，确认 API Key 后点击「更新配置」即可完成升级。
            </p>
            <div className="flex justify-end gap-2">
              <Button variant="ghost" size="sm" onClick={() => setShowUpgradeModal(false)}>
                稍后再说
              </Button>
              <Button
                size="sm"
                onClick={() => {
                  setShowUpgradeModal(false);
                  // 滚动到 AI 模型配置区
                  const el = document.querySelector('section[class*="rounded-xl"]');
                  el?.scrollIntoView({ behavior: "smooth", block: "start" });
                }}
              >
                去升级
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/** 分区卡片：左侧 emoji + 标题，右侧描述；圆角分组卡片样式 */
function Section({
  icon,
  title,
  desc,
  children,
}: {
  icon: IconName;
  title: string;
  desc: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-3 rounded-xl border dark:border-gray-700 bg-white dark:bg-gray-800 p-4 shadow-sm">
      <header className="flex items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 text-base font-semibold">
          <Icon name={icon} className="w-5 h-5 shrink-0" />
          {title}
        </h2>
        <span className="text-right text-xs text-gray-400">{desc}</span>
      </header>
      <div className="space-y-3">{children}</div>
    </section>
  );
}

/** 可折叠分区：点击标题切换展开/收起。用于个人信息与「更多」。 */
function CollapsibleSection({
  icon,
  title,
  desc,
  defaultOpen = false,
  children,
}: {
  icon: IconName;
  title: string;
  desc?: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <section className="rounded-xl border dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-3 p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
        aria-expanded={open}
      >
        <h2 className="flex items-center gap-2 text-base font-semibold">
          <Icon name={icon} className="w-5 h-5 shrink-0" />
          {title}
        </h2>
        <span className="flex items-center gap-2">
          {desc && <span className="text-right text-xs text-gray-400">{desc}</span>}
          <Icon
            name="chevron-down"
            className={`w-4 h-4 text-gray-400 transition-transform ${open ? "rotate-180" : ""}`}
          />
        </span>
      </button>
      {open && <div className="space-y-3 px-4 pb-4">{children}</div>}
    </section>
  );
}

// ============ 辅助：exchange 错误 → 可操作用户文案 ============

/**
 * 把 exchangeSession 抛出的错误映射为「可操作」的用户提示。
 *
 * 设计（乔布斯视角）：
 *   - 旧的提示「加密会话启用失败，请重试」对服务端配置类错误是无效的——
 *     重试 100 次还是同一个错，用户只会越来越 frustrated
 *   - 把服务端 code 翻译成具体动作建议（重新部署 / 检查字段 / 联系管理员）
 *
 * 技术约束（卡帕西视角）：
 *   - ExchangeError 携带 code；其它 Error 只有 message
 *   - 永远返回非空字符串（fallback 兜底）
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
