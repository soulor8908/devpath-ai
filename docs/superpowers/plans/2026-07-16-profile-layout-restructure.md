# 「我的」页面布局重构 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 重构「我的」页面布局——关键信息（学习统计/收藏/AI 模型）前置，个人信息折叠，低频功能收纳到「更多」，API Token 智能显隐（已配置模型时隐藏，消除分享场景下的困惑）。

**Architecture:** 单文件重组（`app/profile/page.tsx`），不拆分文件（所有 state 紧密耦合）。新增 `CollapsibleSection` 辅助组件用于折叠分区。API Token 显隐基于 `modelConfigs` 派生状态 `hasModelConfig`。

**Tech Stack:** Next.js App Router、React 19、Tailwind、IndexedDB（只读）。

---

## 设计分析（乔布斯视角）

**问题 1：布局平铺，焦点散乱**
当前 7 大分区平铺：学习统计 / 收藏 / 个人信息 / AI 模型 / 个人信息编辑 / 设置 / 应用信息 / 帮助。用户每次打开都要滚动找自己关心的东西。这违背焦点原则——没有告诉用户"先看什么"。

**问题 2：API Token 困惑**
经代码核查，`ShareCardButton`（分享图）**根本不使用 API Token**，它纯本地生成图片。API Token 仅在 `apiFetch`/`aiFetch` 调用服务端 API 时附加到 Authorization 头，且仅当用户**未配置自己的 AI 模型**时才需要。把它放在"个人信息"分区下方是 UX 错误——用户在分享场景看到它完全无意义，且大多数用户配置了自己的模型后根本不需要它。

**解法**：
1. **关键信息前置**：学习统计、收藏、AI 模型配置三个核心使用功能置顶，始终展开。
2. **个人信息折叠**：默认显示头像+用户名概要，点击展开编辑表单。同步状态、分享图按钮随分区一起折叠（用户需要时才点开）。
3. **「更多」分区**：收纳低频功能——主题、每日时间表、AI 人格、隐私、通知、API Token、应用信息、帮助。默认折叠。
4. **API Token 智能显隐**：
   - 已配置 AI 模型（`modelConfigs` 中有含 `apiKey` 的配置）→ 显示"✓ 已配置自己的 AI 模型，无需填写 API Token"，隐藏输入框。
   - 未配置模型 → 显示引导文字 + 输入框，引导文字优先推荐"配置自己的 AI 模型"。

**为何不删除 API Token**：自部署用户若使用服务端默认模型仍需要它。删除会破坏这部分用户体验。智能显隐是最优解——既消除普通用户的困惑，又保留功能。

## 文件结构

| 文件 | 责任 | 类型 |
|------|------|------|
| `app/profile/page.tsx` | 重构布局：置顶分区 + 折叠个人信息 + 「更多」分区 + API Token 显隐 | 改写 |

**不新建文件**：`CollapsibleSection` 作为 `page.tsx` 内联辅助组件，与现有 `Section` 共存。所有 state 已在组件内，拆分反而增加 prop 传递复杂度（YAGNI）。

**新布局结构**：
```
我的
├── [置顶·始终展开] 学习统计概览
├── [置顶·始终展开] 我的收藏
├── [置顶·始终展开] AI 模型配置
├── [折叠] 个人信息（概要 + 编辑表单 + 同步 + 分享图）
└── [折叠] 更多
    ├── 外观主题
    ├── 每日时间表
    ├── AI 人格（Persona）
    ├── 隐私设置
    ├── 学习提醒（PWA）
    ├── 高级 ▼
    │   └── API 鉴权 Token（已配置模型时隐藏输入框）
    ├── 应用信息
    └── 帮助 / FAQ
```

---

### Task 1: 添加 CollapsibleSection 辅助组件 + hasModelConfig 派生状态

**Files:**
- Modify: `app/profile/page.tsx`（在文件末尾 `Section` 组件定义后追加 `CollapsibleSection`；在组件内加 `hasModelConfig` 派生）

- [ ] **Step 1: 在 `ProfilePage` 组件内，`useEffect` 之后、`update` 函数之前，添加 `hasModelConfig` 派生状态**

在 `app/profile/page.tsx` 中找到：
```tsx
  useEffect(() => {
    (async () => {
      const stored = await dbGet<PublicProfile>(STORAGE_KEY);
```

在 `useEffect` 块**之前**插入一行派生状态声明：
```tsx
  // 是否已配置含 API Key 的模型 → 决定 API Token 输入框是否显示
  const hasModelConfig = modelConfigs.some((c) => c.apiKey.trim().length > 0);
```

注意：`modelConfigs` 已在组件 state 中（第 129 行），`hasModelConfig` 是纯派生值，无需 useState。

- [ ] **Step 2: 在文件末尾 `Section` 函数之后，追加 `CollapsibleSection` 辅助组件**

找到文件末尾：
```tsx
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
```

在其后追加：
```tsx
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
```

- [ ] **Step 3: 验证类型**

Run: `npx tsc --noEmit 2>&1 | grep "app/profile" || echo "profile clean"`
Expected: `profile clean`（无新增类型错误；预先存在的 observability.test.ts 错误与本改动无关）

- [ ] **Step 4: 提交**

```bash
git add app/profile/page.tsx
git commit -m "feat(profile): add CollapsibleSection helper + hasModelConfig derived state"
```

---

### Task 2: 重组布局——置顶分区 + 折叠个人信息 + 「更多」分区

**Files:**
- Modify: `app/profile/page.tsx`（重组 return 语句的 JSX 结构）

- [ ] **Step 1: 重组 `return` 语句**

找到 `return` 语句起始（约 541 行）：
```tsx
  return (
    <div className="mx-auto max-w-2xl space-y-6 p-4 pb-20">
      <h1 className="text-2xl font-bold">我的</h1>

      {/* 0. 学习统计概览（P2.5: dashboard Tab 移除后补全闭环） */}
      <Section
```

将其下方到文件末尾 `</div>` 闭合（约 1324 行）的**整段 JSX** 替换为以下新结构。保留所有内部逻辑（统计、收藏、AI 模型、编辑表单、主题、时间表、AI 人格、隐私、通知、Token、应用信息、帮助的 JSX 内容不变），仅调整分区容器与顺序：

```tsx
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
        {/* [原 0. 学习统计的 JSX 内容原样搬入] */}
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
        <div className="grid grid-cols-3 gap-2">
          <Link
            href="/stats"
            className="rounded-lg border border-gray-200 dark:border-gray-700 px-3 py-2 text-xs text-center hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center justify-center gap-1"
          >
            <Icon name="calendar" className="w-3.5 h-3.5" />
            热力图
          </Link>
          <Link
            href="/stats"
            className="rounded-lg border border-gray-200 dark:border-gray-700 px-3 py-2 text-xs text-center hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center justify-center gap-1"
          >
            <Icon name="target" className="w-3.5 h-3.5" />
            雷达图
          </Link>
          <Link
            href="/stats"
            className="rounded-lg border border-gray-200 dark:border-gray-700 px-3 py-2 text-xs text-center hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center justify-center gap-1"
          >
            <Icon name="sparkles" className="w-3.5 h-3.5" />
            AI 周报
          </Link>
        </div>
      </Section>

      {/* 2. 我的收藏 */}
      <Section icon="star" title="我的收藏" desc="收藏的试题集与单题">
        {/* [原 1. 我的收藏的 JSX 内容原样搬入] */}
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
        {/* [原 2. AI 模型配置的整段 JSX 原样搬入——含配置列表、新建按钮、表单] */}
        {/* 从 "配置列表" 注释开始，到表单结束的 </Section> 之前 */}
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

        {showModelForm && (
          <div className="space-y-3 rounded-lg border bg-gray-50/50 p-3">
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

            <div>
              <label className="block text-sm font-medium">名称</label>
              <input
                value={modelName}
                onChange={(e) => setModelName(e.target.value)}
                placeholder="如 我的 GPT"
                className="mt-1 w-full rounded border px-2 py-1"
              />
            </div>

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

            <div>
              <label className="block text-sm font-medium">baseURL</label>
              <input
                value={modelBaseURL}
                onChange={(e) => setModelBaseURL(e.target.value)}
                placeholder="https://api.openai.com/v1"
                className="mt-1 w-full rounded border px-2 py-1 font-mono text-xs"
              />
            </div>

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

            <div>
              <label className="block text-sm font-medium">模型名称</label>
              <input
                value={modelModel}
                onChange={(e) => setModelModel(e.target.value)}
                placeholder="如 gpt-4o-mini / deepseek-chat"
                className="mt-1 w-full rounded border px-2 py-1 font-mono text-xs"
              />
            </div>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={modelIsDefault}
                onChange={(e) => setModelIsDefault(e.target.checked)}
                className="h-5 w-5"
              />
              <span className="text-sm">设为默认模型</span>
            </label>

            {modelError && (
              <p className="text-sm text-red-600">{modelError}</p>
            )}

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
            <p className="mt-1 text-sm text-gray-600 line-clamp-2">
              {profile.bio || "(暂无简介)"}
            </p>
          </div>
        </div>

        <div className="border-t pt-3">
          <SyncStatus />
        </div>

        {syncError && (
          <div className="rounded-lg border border-amber-200 bg-amber-50 dark:bg-amber-950/30 dark:border-amber-800 p-3 text-xs text-amber-800 dark:text-amber-200 space-y-1">
            <p className="font-medium"><Icon name="alert" className="w-3.5 h-3.5 inline-block align-middle" /> 公开主页未同步</p>
            <p>{syncError}</p>
            <p className="text-amber-700 dark:text-amber-300">
              提示：未同步时 /u/{profile.username || "username"} 会显示&quot;用户不存在&quot;。
            </p>
          </div>
        )}

        <div>
          <ShareCardButton profile={profile} />
        </div>

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
              <p className="mt-2 text-sm text-gray-600">
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
              <dd className="text-right text-gray-700">
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
              <dd className="text-gray-700">Cloudflare Pages（edge runtime）</dd>
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
                <p className="mt-2 text-gray-600">{faq.a}</p>
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
            <span className="text-gray-700">
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
```

**关键变化总结**：
1. 学习统计、收藏、AI 模型配置三个 `<Section>` 保留不变，始终展开。
2. 原"我的个人信息" + "个人信息编辑"两个分区合并为一个 `<CollapsibleSection>`，`desc` 显示用户名概要。
3. 原"设置"分区拆解：主题、时间表、AI 人格、隐私、通知、API Token、应用信息、帮助全部收纳进 `<CollapsibleSection title="更多">`。
4. API Token 块改为基于 `hasModelConfig` 条件渲染：已配置模型时显示绿色提示卡片，未配置时显示引导 + 输入框。
5. 原 FAQ 中"API Token 和 API Key 有什么区别？"条目保留（仍有教育价值）。

- [ ] **Step 2: 验证类型**

Run: `npx tsc --noEmit 2>&1 | grep "app/profile" || echo "profile clean"`
Expected: `profile clean`

- [ ] **Step 3: 跑测试确保无回归**

Run: `npx vitest run __tests__/smoke.test.ts __tests__/api-status.test.ts 2>&1 | tail -10`
Expected: PASS

- [ ] **Step 4: ESLint 检查**

Run: `npx next lint --file app/profile/page.tsx`
Expected: 无 error

- [ ] **Step 5: 提交**

```bash
git add app/profile/page.tsx
git commit -m "feat(profile): restructure layout — key info first, collapse personal, move token to more"
```

---

### Task 3: 全量验证与推送

**Files:** 无新增，仅验证

- [ ] **Step 1: 全量测试**

Run: `npx vitest run 2>&1 | tail -10`
Expected: 所有测试通过（预先存在的 observability.test.ts 类型错误不影响 vitest 运行）

- [ ] **Step 2: TypeScript 全量检查（确认无新增错误）**

Run: `npx tsc --noEmit 2>&1 | grep -c "error TS"`
Expected: 与改动前相同（仅 observability.test.ts 的 2 个预先存在错误）

- [ ] **Step 3: 推送到远程**

```bash
git push origin develop
```

---

## Self-Review

**1. Spec coverage**：
- "重新设计布局，不重要的放更多，关键信息往前放" → Task 2 重组：学习统计/收藏/AI 模型置顶，低频功能进「更多」✅
- "个人信息之类的分类折叠" → Task 2 用 `CollapsibleSection` 折叠个人信息 + 「更多」✅
- "api token 为什么要存在？分享场景为什么要 api token？" → 经核查 ShareCardButton 不使用 API Token；Task 2 将其移到「更多 → 高级」并智能显隐 ✅
- "如果一定要，请放更多" → Task 2 API Token 放入「更多」分区，且已配置模型时隐藏输入框 ✅

**2. Placeholder scan**：Task 2 Step 1 包含完整 JSX 代码，无 "TODO/TBD"；所有引用的类型/函数（`hasModelConfig`、`modelConfigs`、`apiToken`、`saveToken` 等）在 Task 1 或原文件中已定义。✅

**3. Type consistency**：
- `CollapsibleSection` props（icon/title/desc/defaultOpen/children）在 Task 1 定义，Task 2 使用一致 ✅
- `hasModelConfig` 在 Task 1 定义为 `modelConfigs.some((c) => c.apiKey.trim().length > 0)`，Task 2 使用一致 ✅
- `IconName` 类型中 `settings`/`chevron-down`/`check-circle`/`alert` 均已存在 ✅
