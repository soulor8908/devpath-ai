"use client";

// app/profile/page.tsx
// 「我的」中心：关键信息前置 + 个人信息折叠 + 低频功能收纳到「更多」
// 布局：学习统计 / 收藏 / AI 模型（置顶·始终展开）→ 个人信息（折叠）→ 更多（折叠）
// API Token：已配置自己的 AI 模型时隐藏输入框，避免用户困惑

import { useState, useEffect } from "react";
import Link from "next/link";
import type { PublicProfile, LearnLog, UserProfile, PersonaId, Achievement } from "@/lib/types";
import { getItem as dbGet, setItem as dbSet, listItems } from "@/lib/storage/db";
import { KEY_PREFIXES } from "@/lib/types";
import { chinaDateNow, chinaDateShift } from "@/lib/time";
import { apiFetch, getApiToken, setApiToken } from "@/lib/api-client";
import { listAchievements } from "@/lib/achievements/store";
import { confirmDialog } from "@/lib/confirm-dialog";
import { ShareCardButton } from "@/components/ShareCardButton";
import { SyncStatus } from "@/components/SyncStatus";
import { ThemeToggle } from "@/components/ThemeToggle";
import { scheduleAutoSync } from "@/lib/sync";
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
    q: "API Token 和 API Key 有什么区别？",
    a: "API Key 是你从模型服务商（智谱/DeepSeek/OpenAI）获取的密钥，在「AI 模型配置」里填写，用于调用你自己的 AI 额度。API Token 是部署管理员设置的服务端鉴权密钥，仅在未配置自己的模型而使用「服务端默认模型」时才需要。大多数用户只需配置 API Key 即可。",
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

  // API Token
  const [apiToken, setApiTokenState] = useState("");
  const [tokenSaved, setTokenSaved] = useState(false);

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

  // 是否已配置含 API Key 的模型 → 决定 API Token 输入框是否显示
  const hasModelConfig = modelConfigs.some((c) => c.apiKey.trim().length > 0);

  useEffect(() => {
    (async () => {
      const stored = await dbGet<PublicProfile>(STORAGE_KEY);
      if (stored) setProfile(stored);

      const r = await loadRoutineMarkdown();
      setRoutine(r);

      // 加载已存的 API Token
      const token = await getApiToken();
      if (token) setApiTokenState(token);

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
        // 401 时给用户明确提示：要么配置 API Token，要么联系部署方
        if (res.status === 401) {
          setSyncError(
            `公开主页同步未授权（${serverMsg}）。请在「更多 → 高级 · API 鉴权 Token」中填入与部署方一致的 Token 后再保存。`,
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

  async function saveToken() {
    await setApiToken(apiToken);
    setTokenSaved(true);
    setTimeout(() => setTokenSaved(false), 2000);
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

  /** 保存（新建 / 更新） */
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
      if (editingModel) {
        await updateModelConfig(editingModel.id, payload);
      } else {
        await createModelConfig(payload);
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

  /** 测试模型连接 */
  async function handleTestModel(config: ModelConfig) {
    setTestingId(config.id);
    setTestResult((prev) => ({ ...prev, [config.id]: { ok: false, msg: "测试中..." } }));
    try {
      const res = await fetch("/api/ai-test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          modelConfig: {
            baseURL: config.baseURL,
            apiKey: config.apiKey,
            model: config.model,
            name: config.name,
            provider: config.provider,
          },
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setTestResult((prev) => ({
          ...prev,
          [config.id]: {
            ok: true,
            msg: `连接成功 (${data.elapsedMs}ms): ${data.reply?.slice(0, 50) || "OK"}`,
          },
        }));
      } else {
        setTestResult((prev) => ({
          ...prev,
          [config.id]: { ok: false, msg: data.error || `HTTP ${res.status}` },
        }));
      }
    } catch (e) {
      setTestResult((prev) => ({
        ...prev,
        [config.id]: { ok: false, msg: e instanceof Error ? e.message : "网络错误" },
      }));
    } finally {
      setTestingId(null);
    }
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
            <button
              onClick={openNewModelForm}
              className="w-full rounded-lg border px-3 py-2 text-sm hover:bg-gray-50"
            >
              + 新建模型配置
            </button>
          ) : (
            <button
              onClick={() => {
                setShowModelForm(false);
                resetModelForm();
              }}
              className="w-full rounded-lg border px-3 py-2 text-sm hover:bg-gray-50"
            >
              ▲ 收起表单
            </button>
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
              <input
                value={modelName}
                onChange={(e) => setModelName(e.target.value)}
                placeholder="如 我的 GPT"
                className="mt-1 w-full rounded border px-2 py-1"
              />
            </div>

            {/* Provider */}
            <div>
              <label className="block text-sm font-medium">Provider</label>
              <select
                value={modelProvider}
                onChange={(e) =>
                  handleProviderChange(e.target.value as ModelConfig["provider"])
                }
                className="mt-1 w-full rounded border px-2 py-1"
              >
                <option value="glm">glm（智谱）</option>
                <option value="deepseek">deepseek</option>
                <option value="mimo">mimo（小米）</option>
                <option value="kimi">kimi（Moonshot AI）</option>
                <option value="custom">custom</option>
              </select>
            </div>

            {/* baseURL */}
            <div>
              <label className="block text-sm font-medium">baseURL</label>
              <input
                value={modelBaseURL}
                onChange={(e) => setModelBaseURL(e.target.value)}
                placeholder="https://api.openai.com/v1"
                className="mt-1 w-full rounded border px-2 py-1 font-mono text-xs"
              />
            </div>

            {/* API Key（密码 + 显隐） */}
            <div>
              <label className="block text-sm font-medium">API Key</label>
              <div className="mt-1 flex gap-2">
                <input
                  type={showApiKey ? "text" : "password"}
                  value={modelApiKey}
                  onChange={(e) => setModelApiKey(e.target.value)}
                  placeholder="sk-..."
                  className="flex-1 rounded border px-2 py-1 font-mono text-xs"
                />
                <button
                  type="button"
                  onClick={() => setShowApiKey((v) => !v)}
                  className="rounded border px-2 py-1 text-xs hover:bg-gray-50"
                >
                  {showApiKey ? "隐藏" : "显示"}
                </button>
              </div>
            </div>

            {/* 模型名称 */}
            <div>
              <label className="block text-sm font-medium">模型名称</label>
              <input
                value={modelModel}
                onChange={(e) => setModelModel(e.target.value)}
                placeholder="如 gpt-4o-mini / deepseek-chat"
                className="mt-1 w-full rounded border px-2 py-1 font-mono text-xs"
              />
            </div>

            {/* 设为默认 */}
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={modelIsDefault}
                onChange={(e) => setModelIsDefault(e.target.checked)}
                className="h-5 w-5"
              />
              <span className="text-sm">设为默认模型</span>
            </label>

            {/* 错误提示 */}
            {modelError && (
              <p className="text-sm text-red-600">{modelError}</p>
            )}

            {/* 保存按钮 */}
            <div className="flex items-center gap-2">
              <button
                onClick={saveModelConfig}
                disabled={modelSaving}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {modelSaving
                  ? "保存中..."
                  : editingModel
                    ? "更新配置"
                    : "保存配置"}
              </button>
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
        <button
          onClick={() => setEditOpen((v) => !v)}
          className="w-full rounded-lg border px-3 py-2 text-sm hover:bg-gray-50"
        >
          {editOpen ? "▲ 收起编辑表单" : "▼ 展开编辑表单"}
        </button>

        {editOpen && (
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium">用户名（URL 标识）</label>
              <input
                value={profile.username}
                onChange={(e) =>
                  update(
                    "username",
                    e.target.value.replace(/[^a-zA-Z0-9_-]/g, "").toLowerCase(),
                  )
                }
                placeholder="alice"
                className="mt-1 w-full rounded border px-2 py-1"
              />
              {profile.username && (
                <p className="mt-1 text-xs text-gray-500">
                  主页地址：/u/{profile.username}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium">显示名</label>
              <input
                value={profile.displayName}
                onChange={(e) => update("displayName", e.target.value)}
                className="mt-1 w-full rounded border px-2 py-1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium">简介</label>
              <textarea
                value={profile.bio}
                onChange={(e) => update("bio", e.target.value)}
                rows={2}
                className="mt-1 w-full rounded border px-2 py-1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium">头像 URL（可选）</label>
              <input
                value={profile.avatar ?? ""}
                onChange={(e) => update("avatar", e.target.value || undefined)}
                className="mt-1 w-full rounded border px-2 py-1"
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
              <button
                onClick={save}
                disabled={saving || !profile.username}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {saving ? "保存中..." : "保存"}
              </button>
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
          <textarea
            value={routine}
            onChange={(e) => {
              setRoutine(e.target.value);
              setRoutineSaved(false);
              setRoutineHint("");
            }}
            rows={12}
            placeholder={defaultRoutineMarkdown()}
            className="mt-1 w-full rounded border px-2 py-1 font-mono text-xs"
          />
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={saveRoutine}
              disabled={routineSaving}
              className="rounded-lg bg-blue-600 px-3 py-1 text-sm text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {routineSaving ? "保存中..." : "保存时间表"}
            </button>
            <button
              onClick={() => {
                setRoutine(defaultRoutineMarkdown());
                setRoutineSaved(false);
              }}
              className="rounded-lg border px-3 py-1 text-sm hover:bg-gray-50"
            >
              使用模板
            </button>
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
            <label
              key={item.key}
              className="flex items-center justify-between"
            >
              <span className="text-sm">{item.label}</span>
              <input
                type="checkbox"
                checked={profile.visibility[item.key]}
                onChange={() => toggleVisibility(item.key)}
                className="h-5 w-5"
              />
            </label>
          ))}
          <div className="flex items-center gap-2 pt-1">
            <button
              onClick={save}
              disabled={saving || !profile.username}
              className="rounded-lg bg-blue-600 px-4 py-1.5 text-sm text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {saving ? "保存中..." : "保存隐私设置"}
            </button>
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
              <button
                onClick={requestNotifPermission}
                className="rounded-lg bg-black px-3 py-1 text-sm text-white hover:bg-gray-800"
              >
                开启通知
              </button>
            </div>
          )}
        </div>

        {/* 高级：API 鉴权 Token（智能显隐） */}
        <div className="space-y-3 border-b py-4">
          <h3 className="font-medium">高级 · API 鉴权 Token</h3>
          {hasModelConfig ? (
            <div className="rounded-lg bg-green-50 dark:bg-green-950/30 p-3 text-xs text-green-800 dark:text-green-200 flex items-start gap-2">
              <Icon name="check-circle" className="w-4 h-4 shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">已配置自己的 AI 模型，无需填写 API Token</p>
                <p className="mt-1 text-green-700 dark:text-green-300">
                  你的 AI 调用走自己的 API Key，不依赖服务端默认模型，也不需要服务端鉴权。
                </p>
              </div>
            </div>
          ) : (
            <>
              <div className="rounded-lg bg-blue-50 dark:bg-blue-950 p-3 text-xs text-blue-800 dark:text-blue-200 space-y-1">
                <p><strong>推荐：直接配置自己的 AI 模型（更稳定）</strong></p>
                <p>在上方「AI 模型配置」添加一个模型（含 API Key），即可免填此项。</p>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                <Icon name="alert" className="w-3.5 h-3.5 inline-block align-middle" /> API Token 仅在使用「服务端默认模型」时需要——大多数用户不需要填写。
              </p>
              <details className="text-xs text-gray-400 dark:text-gray-500">
                <summary className="cursor-pointer hover:text-gray-600 dark:hover:text-gray-300">什么是 API Token？怎么获取？（点击展开）</summary>
                <div className="mt-2 p-2 bg-gray-50 dark:bg-gray-800 rounded space-y-1">
                  <p>API Token <strong>不是</strong> API Key，不能从模型服务商获取。它是部署此项目时由管理员设置的服务端密钥：</p>
                  <p>1. 如果你是自己部署的（Cloudflare Pages），在项目根目录运行：</p>
                  <pre className="bg-gray-800 text-green-400 p-2 rounded text-[11px] overflow-x-auto">npx wrangler pages secret put API_TOKEN --project-name=你的项目名</pre>
                  <p>2. 然后输入你想设置的 Token 值（任意字符串，如 <code className="bg-gray-200 dark:bg-gray-700 px-1 rounded">my-secret-token-123</code>）</p>
                  <p>3. 将这个值填入下方输入框</p>
                  <p className="text-orange-500"><Icon name="alert" className="w-3.5 h-3.5 inline-block align-middle" /> 如果没有部署服务端默认模型（未设 OPENAI_API_KEY 等环境变量），即使填了 API_TOKEN 也无法使用默认模型。建议直接配置自己的 AI 模型。</p>
                </div>
              </details>
              <input
                type="password"
                value={apiToken}
                onChange={(e) => {
                  setApiTokenState(e.target.value);
                  setTokenSaved(false);
                }}
                placeholder="大多数用户留空即可"
                className="w-full rounded border px-2 py-1 dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600"
              />
              <div className="flex items-center gap-2">
                <button
                  onClick={saveToken}
                  className="rounded-lg bg-blue-600 px-3 py-1 text-sm text-white hover:bg-blue-700"
                >
                  保存 Token
                </button>
                {tokenSaved && (
                  <span className="text-sm text-green-600 inline-flex items-center gap-1">已保存 <Icon name="check" className="w-3.5 h-3.5 inline-block" /></span>
                )}
              </div>
            </>
          )}
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
