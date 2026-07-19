# DevPath-AI UI 全面体检报告 — 乔布斯视角

> **报告类型：** UI 视觉与体验健康检查（非实现计划）
> **审计目标：** https://devpath-ai.pages.dev/  及其源代码
> **审计视角：** 史蒂夫·乔布斯（产品设计与体验优先）
> **审计日期：** 2026-07-19
> **审计范围：** 全部页面（首页 / 学习 / 复习 / 我的 / 番茄 / 成就墙 / 数据 / 错题 / 情绪 / 休息 / 公开主页）+ 全部 UI 组件（components/ui/* + 业务组件）

---

## 一、执行摘要

### 总体评分：**C+（及格偏上，但远未达到"Insanely Great"）**

DevPath-AI 是一个有"好骨架"的产品：
- 移动优先 + 底部 4 Tab 导航的方向是对的（已从 8 Tab 减到 4 Tab，符合减法哲学）
- 自建了 8 个表单组件（`components/ui/`）的尝试值得肯定
- 暗色模式覆盖度较高
- `<button>` 原生元素已基本被 `Button` 组件取代（全仓只有 3 处原生 `<button>`，且都在 ui/ 内部）

**但它犯了设计纪律上的"原罪"——缺乏统一的设计令牌（Design Tokens）：**

1. **`tailwind.config.ts` 的 `theme.extend` 是空的 `{}`** —— 这是所有视觉不一致的根源。没有品牌色定义、没有字体比例、没有间距系统、没有阴影层级。每个开发者都在硬编码 `blue-600`、`gray-100`、`rounded-xl`，导致同一语义的元素在不同页面长得不一样。
2. **圆角失控**：全仓 228 处混用 `rounded-lg / rounded-xl / rounded-2xl / rounded-full`，4 种圆角在同一屏内同时出现，视觉上"碎"。
3. **字号系统破裂**：51 处使用 `text-[10px]` / `text-[11px]` 等"逃逸值"，绕过了 Tailwind 的字号比例；Nav 标签 `text-[10px]` 在 iOS 上几乎不可读。
4. **图标语言混乱**：自建了 65+ 个 Lucide 风格 SVG 图标，却又在 16 处混用 emoji（🍅📚✨🔥），两种视觉语言在同一界面打架。Apple 永远不会这样做。
5. **首页信息密度过高**：所谓"5 区结构"实际塞进了 9+ 个信息块，违背了"焦点 = 对 1000 件事说不"的原则。

### 核心结论

> **"It's not bad, but it's not insanely great. You need to subtract, not add. Define your design tokens, enforce your component library, and remove every visual element that doesn't serve the user."**
>
> （"不差，但还不够伟大。你需要做减法，不是加法。定义你的设计令牌、强制推行组件库、删掉每一个不为用户服务的视觉元素。"）

---

## 二、体检方法论

### 检查范围

| 类别 | 检查内容 |
|---|---|
| **设计系统根基** | tailwind.config.ts / globals.css / Design Tokens |
| **组件库** | `components/ui/*`（Button/Input/Textarea/Select/Checkbox/Switch/Slider/FormField）|
| **业务组件** | 35+ 个业务组件（Nav / Toast / FloatingChat / CurrentTaskCard 等）|
| **页面** | 18 个路由页面（首页 / 学习 / 复习 / 我的 / 番茄 / 成就墙 / 数据 / 错题 / 情绪 等）|
| **生产环境** | https://devpath-ai.pages.dev/ 实际渲染（WebFetch 抓取）|

### 评估维度

1. **设计令牌完整性**（Design Tokens）
2. **视觉一致性**（Visual Consistency）：颜色 / 字体 / 间距 / 圆角 / 阴影
3. **组件执行度**（Component Adoption）
4. **视觉层级**（Visual Hierarchy）
5. **美观度**（Aesthetics）
6. **可访问性**（Accessibility）
7. **暗色模式**（Dark Mode）
8. **信息架构**（Information Architecture）

---

## 三、设计系统根基（Design System Foundation）

### 3.1 【致命】Design Tokens 完全缺失

**问题位置：** [tailwind.config.ts](file:///workspace/tailwind.config.ts)

```typescript
theme: {
  extend: {},   // ← 完全为空
},
```

**这是整个 UI 体检中最大的问题。** Tailwind 配置的 `theme.extend` 是空的，意味着：

- ❌ 没有定义品牌主色（`brand` / `primary`）
- ❌ 没有定义语义色（`success` / `warning` / `danger` / `info`）
- ❌ 没有自定义字体族（`font-sans` / `font-mono`）
- ❌ 没有自定义字号比例（type scale）
- ❌ 没有自定义间距系统（spacing scale）
- ❌ 没有自定义圆角层级（border-radius scale）
- ❌ 没有自定义阴影层级（shadow scale）
- ❌ 没有自定义动效曲线（transition timing）

**后果：** 每个开发者都在硬编码 Tailwind 默认值（`blue-600`、`gray-100`、`rounded-xl`），导致：
- 品牌色散落各处，改一处要改 200+ 处
- "primary" 在 A 页是 `blue-600`，在 B 页可能是 `blue-500`
- 无法实现"换肤"或"主题继承"

**乔布斯视角：** 设计令牌是设计的"宪法"。没有宪法的国家，每个州自己定规矩，结果就是分裂。Apple 的设计系统从色彩到字号到圆角，全部有且只有一套定义。

### 3.2 【严重】颜色系统散乱

全仓颜色使用统计（基于代码审查）：

| 语义 | 实际使用的色值 | 出现位置示例 | 问题 |
|---|---|---|---|
| 主色（Primary）| `blue-600` / `blue-500` / `blue-700` | Button / Nav / Link | 3 种色阶混用，无统一规范 |
| 成功（Success）| `green-500` / `green-600` / `green-700` | Toast / Button | 同上 |
| 警告（Warning）| `amber-500` / `amber-600` / `orange-500` / `orange-700` | Toast / 错题标签 | `amber` 和 `orange` 混用 |
| 危险（Danger）| `red-500` / `red-600` / `red-700` | Button / 错题 | 同上 |
| 卡片背景 | `bg-white` / `bg-gray-50` / `bg-gray-50/50` | 各页面 | 3 种白底混用 |
| 卡片边框 | `border-gray-100` / `border-gray-200` / `border-gray-300` | 各页面 | 3 种边框色混用 |
| 次要文字 | `text-gray-400` / `text-gray-500` / `text-gray-600` | 各页面 | 层级不清晰 |

**典型问题代码：**

[HomeClient.tsx](file:///workspace/app/HomeClient.tsx) 中 KPI 卡片用 `border-gray-100`，但同一页的 schedule 列表也用 `border-gray-100`，而 profile 页面的 Section 卡片用 `border`（无颜色，默认 `gray-200`）。同一"卡片"语义，三种边框色。

### 3.3 【严重】字体系统未定义

**问题：** 没有定义 `fontFamily`，使用 Tailwind 默认（system-ui）。中文字体未优化，在 Windows 上会回退到 SimSun，在 macOS 上是 PingFang SC——跨平台体验不一致。

**字号使用统计：**
- `text-xs` (12px) / `text-sm` (14px) / `text-base` (16px) / `text-lg` (18px) / `text-xl` (20px) / `text-2xl` (24px) / `text-3xl` (30px)
- **逃逸值：** 51 处 `text-[10px]` / `text-[11px]` / `text-[3.5rem]` 分布在 24 个文件

**问题位置示例：**

[Nav.tsx:45](file:///workspace/components/Nav.tsx#L45) — 底部导航标签用 `text-[10px]`，在 iOS 上低于 11px 的最小可读字号，老年用户基本看不清。

[HomeClient.tsx](file:///workspace/app/HomeClient.tsx) — 错题计数用 `text-[10px]`，多巴胺标签用 `text-[10px]`，schedule 类型标签用 `text-xs`——同一屏内"小字"有 3 种字号。

### 3.4 【严重】圆角系统失控

**全仓统计：** 228 处 `rounded-*` 分布在 53 个文件，混用 4 种圆角：

| 圆角类 | 像值 | 用途 | 出现次数（估算）|
|---|---|---|---|
| `rounded-lg` | 8px | 输入框 / 按钮 / 小卡片 | 最多 |
| `rounded-xl` | 12px | 卡片 / schedule 项 / Section | 次多 |
| `rounded-2xl` | 16px | KPI 三宫格 / 能量趋势 | 较少 |
| `rounded-full` | 9999px | Filter Chip / FAB / CTA | 较少 |

**问题：** 同一屏内（如首页）同时出现 `rounded-lg`（schedule 标签）、`rounded-xl`（schedule 卡片）、`rounded-2xl`（KPI 卡片），视觉上"碎成一片"。

**乔布斯视角：** Apple 的圆角是数学推导出来的——外层容器和内层元素的圆角差等于它们之间的间距（"squircle"原则）。这里完全没遵循。

### 3.5 【重要】阴影层级混乱

**全仓统计：** 40 处 `shadow-*` 分布在 22 个文件，混用 4 种阴影：

| 阴影类 | 语义 | 实际用途 |
|---|---|---|
| `shadow-sm` | 微弱浮起 | Button / 卡片静态 |
| `shadow-md` | 中等浮起 | 卡片 hover |
| `shadow-lg` | 强浮起 | 欢迎页 CTA / FAB |
| `shadow-2xl` | 最强浮起 | 升级提示模态 |

**问题：**
- 没有清晰的"elevation system"——什么时候用 sm、什么时候用 md，全凭开发者感觉
- `shadow-2xl` 只用在 1 处（升级模态），与其它模态（`shadow-lg`）不一致

### 3.6 【次要】间距系统缺乏节奏

页面级间距统计：
- `mb-2` / `mb-3` / `mb-4` / `mb-5` / `mb-6` 全部混用
- `p-2` / `p-2.5` / `p-3` / `p-4` / `p-6` 全部混用
- `gap-1` / `gap-1.5` / `gap-2` / `gap-3` / `gap-6` 全部混用

**问题：** 没有建立在 4pt / 8pt 网格上的节奏感。`mb-5`（20px）和 `mb-4`（16px）的差异肉眼几乎不可见，但开发者却在不同页面随机选择。

---

## 四、组件一致性（Component Consistency）

### 4.1 【优秀】Button 组件执行度高

**全仓统计：** 原生 `<button>` 仅 3 处（都在 [Button.tsx](file:///workspace/components/ui/Button.tsx) 和 [Input.tsx](file:///workspace/components/ui/Input.tsx) 内部实现）。

**评价：** 这是整个项目最成功的设计决策之一。8 种 variant + 3 种 size + iconOnly 模式覆盖了绝大多数场景，`forwardRef` 让 form lib 可用。

**但仍有漏洞：**

[HomeClient.tsx:125-129](file:///workspace/app/HomeClient.tsx#L125-L129) — 新用户欢迎页的 CTA 用了原生 `<Link>` + ad-hoc 样式，**没有**使用 `Button` 组件：

```tsx
<Link
  href="/learn"
  className="inline-block rounded-full bg-gradient-to-r from-blue-500 to-purple-600 px-8 py-3 text-white font-medium hover:opacity-90 transition-opacity shadow-lg"
>
  开始第一个学习计划 →
</Link>
```

**问题：**
1. `rounded-full` —— Button 组件用 `rounded-lg`，这里突然变成胶囊形
2. `bg-gradient-to-r from-blue-500 to-purple-600` —— 这个渐变**全仓只此一处**，没有任何其它元素使用紫蓝渐变
3. `px-8 py-3` —— 不在 Button 的 SIZE_CLASSES 里（lg 是 `px-5 py-2.5`）
4. `shadow-lg` —— Button 用 `shadow-sm`
5. `transition-opacity` —— Button 用 `transition-colors`

**这是"破窗效应"的典型：一个特例破坏了整个系统的可信度。**

### 4.2 【严重】Link 当 Button 用，样式各不相同

全仓大量 `<Link>` 被当成按钮使用，且每个都有不同的样式：

| 位置 | 样式 | 问题 |
|---|---|---|
| [HomeClient.tsx:166](file:///workspace/app/HomeClient.tsx#L166) 低能量提示 | `rounded-xl bg-green-50 border-green-200 p-3` | 自定义卡片样式 |
| [HomeClient.tsx:180](file:///workspace/app/HomeClient.tsx#L180) 番茄钟入口 | `rounded-xl bg-red-50 border-red-200 p-3` | 同上但红色 |
| [HomeClient.tsx:283](file:///app/HomeClient.tsx#L283) 继续学习 | `rounded-xl border-blue-200 bg-blue-50 p-3` | 同上但蓝色 |
| [HomeClient.tsx:196](file:///workspace/app/HomeClient.tsx#L196) KPI 卡片 | `rounded-2xl p-4 hover:shadow-md` | 又一种新样式 |
| [profile/page.tsx:660](file:///workspace/app/profile/page.tsx#L660) 热力图入口 | `rounded-lg border px-3 py-2 text-xs` | 又一种新样式 |
| [profile/page.tsx:704](file:///workspace/app/profile/page.tsx#L704) 查看收藏 | `rounded-lg border px-4 py-2 text-sm` | 又一种新样式 |
| [profile/page.tsx:1346](file:///workspace/app/profile/page.tsx#L1346) 查看文档 | `rounded-lg border-blue-200 bg-blue-50 px-3 py-2.5` | 又一种新样式 |

**统计：** 至少 7 种不同的"Link 当按钮"样式，没有统一的 `LinkButton` 组件。

**乔布斯视角：** 用户看到 7 个看起来差不多的"按钮"，但它们的圆角、内边距、颜色各不相同——这会潜意识地传递"这个产品不专业"的信号。

### 4.3 【严重】图标语言混乱（SVG + Emoji 混用）

**全仓统计：** emoji 在 16 个文件中出现 28 次（部分在非 UI 文件，但 UI 中至少 10+ 处）。

**典型问题：**

[HomeClient.tsx:185](file:///workspace/app/HomeClient.tsx#L185) — 番茄钟入口用 emoji `🍅`：
```tsx
<span className="text-base leading-none">🍅</span>
番茄钟 · 开始一段专注
```

但同一文件的 [HomeClient.tsx:233](file:///workspace/app/HomeClient.tsx#L233) 又用 SVG 图标：
```tsx
<Icon name="calendar-check" className="w-4 h-4" />
今日安排
```

**问题：**
1. `🍅` 在不同操作系统上渲染完全不同（iOS 彩色 / Android 另一风格 / Windows 无色）
2. 自建的 `Icon` 组件是 stroke-based 黑白线条，emoji 是彩色填充——两种视觉语言并存，像两套设计系统打架
3. 番茄钟页面 [timer/page.tsx](file:///workspace/app/timer/page.tsx) 标题用 `🍅今日番茄`，但 [PomodoroWidget](file:///workspace/components/PomodoroWidget.tsx) 浮窗又用 SVG——同一功能两种图标

**还有这些 emoji 混用：**
- `📚` 学习（在通知文案里）
- `✨` 闪光（与 `sparkles` 图标语义重复）
- `🔥` 火焰（与 `flame` 图标语义重复）

**乔布斯视角：** Apple 永远不会在同一个界面里混用 SF Symbols 和 emoji。要么全用 SVG 图标，要么全用 emoji——不能两个都要。

### 4.4 【重要】模态系统不统一

全仓至少有 3 套模态实现：

| 实现 | 位置 | 背景色 | 圆角 | 阴影 |
|---|---|---|---|---|
| Toast confirm | [Toast.tsx:179](file:///workspace/components/Toast.tsx#L179) | `bg-black/40 backdrop-blur-sm` | （复用 ToastCard）| `shadow-lg` |
| 升级提示模态 | [profile/page.tsx:1401](file:///workspace/app/profile/page.tsx#L1401) | `bg-black/50` | `rounded-xl` | `shadow-2xl` |
| ChatModal | [ChatModal.tsx](file:///workspace/components/ChatModal.tsx) | 待查 | 待查 | 待查 |
| AITaskModal | [AITaskModal.tsx](file:///workspace/components/AITaskModal.tsx) | 待查 | 待查 | 待查 |

**问题：**
- 背景遮罩：`bg-black/40` vs `bg-black/50` —— 不一致
- 阴影：`shadow-lg` vs `shadow-2xl` —— 不一致
- 没有共享的 `Modal` / `Dialog` 组件

**应抽取为统一组件：** `<Modal open onClose size="sm|md|lg" backdrop="blur|opaque">`

### 4.5 【重要】空状态各做各的

| 页面 | 空状态样式 | 视觉处理 |
|---|---|---|
| 首页 schedule 为空 | [HomeClient.tsx:269](file:///workspace/app/HomeClient.tsx#L269) | `rounded-2xl p-4` 卡片 + check-circle 图标 + "今日无安排" + 蓝色链接 |
| 复习页无卡片 | [review/page.tsx:491](file:///workspace/app/review/page.tsx#L491) | `py-12 text-gray-400` 纯文字 + check-circle 图标 |
| Profile 无模型 | [profile/page.tsx:718](file:///workspace/app/profile/page.tsx#L718) | `border-dashed bg-gray-50 px-3 py-4` 虚线框 + "暂无模型配置" |
| 错题本无错题 | [HomeClient.tsx:469](file:///workspace/app/HomeClient.tsx#L469) | `rounded-lg p-4` 实心卡片 + check-circle + "还没有未解决的错题" |
| 成就墙 0% | [achievements/page.tsx](file:///workspace/app/achievements/page.tsx) | 进度条 0% + 百分比文字 |
| 复习完成 | [review/page.tsx:257](file:///workspace/app/review/page.tsx#L257) | party 图标 + "复习完成！" + 统计 |

**6 种空状态，6 种视觉处理。** 应抽取为 `<EmptyState icon title description action />` 组件。

### 4.6 【重要】加载状态不统一

| 页面 | 加载态 | 问题 |
|---|---|---|
| 学习路由页 | [learn/page.tsx:42](file:///workspace/app/learn/page.tsx#L42) | `animate-pulse` 图标 + "正在进入学习…" | 有动画 ✓ |
| 复习页 | [review/page.tsx:248](file:///workspace/app/review/page.tsx#L248) | 纯文字 "加载复习卡片..." | 无动画 ✗ |
| 数据页 | 推测用 Suspense | 无骨架屏 | 数据密集页应有骨架 |
| ChatModal | [FloatingChat.tsx:61](file:///workspace/components/FloatingChat.tsx#L61) | "加载中..." 文字 | 无动画 ✗ |

**应抽取为 `<Skeleton />` / `<LoadingSpinner />` / `<PageSkeleton />` 组件。**

---

## 五、视觉层级（Visual Hierarchy）

### 5.1 【致命】首页信息密度过高

[HomeClient.tsx](file:///workspace/app/HomeClient.tsx) 注释声称是"5 区结构"，但实际渲染：

1. **顶部问候 + 分享按钮** + shareMsg 提示
2. **CurrentTaskCard**（核心）
3. **低能量休息提示**（条件渲染）
4. **番茄钟入口**（常驻）
5. **KPI 三宫格**（待学 / 待复习 / 连续打卡）
6. **HomeInsightsCard**（AI 教练洞察，含成就 + 健康告警）
7. **今日安排**（schedule 列表，最多 3 项 + "查看全部"）
8. **继续学习入口**
9. **EnergyTrendMini 能量趋势迷你图**
10. **能力画像 + AI 质量摘要**（双卡片）
11. **StatusCard 今日状态记录**
12. **折叠区：情绪记录 + 错题回顾 + 7 天热力图**

**实际是 12 个信息块，不是 5 个。**

**乔布斯视角：** "Focus is about saying no to 1000 things." 首页的核心问题不是"该展示什么"，而是"该砍掉什么"。

**建议砍掉或合并：**
- 番茄钟入口与低能量入口重复（都是"开始一段专注"的变体）→ 合并为一个"行动入口"
- 能力画像 + AI 质量摘要 + StatusCard 三块功能重叠 → 合并到 HomeInsightsCard
- 7 天热力图已有 KPI 三宫格的"连续打卡"→ 折叠区只保留情绪 + 错题

**目标：** 首屏只展示 3 个信息块——
1. Hero：现在该做什么（CurrentTaskCard）
2. KPI 三宫格
3. AI 教练洞察

### 5.2 【重要】页面标题层级不统一

| 页面 | H1 样式 | 位置 |
|---|---|---|
| 首页 | `text-xl font-bold` "今天" | [HomeClient.tsx:140](file:///workspace/app/HomeClient.tsx#L140) |
| Profile | `text-2xl font-bold` "我的" | [profile/page.tsx:629](file:///workspace/app/profile/page.tsx#L629) |
| 数据 | `text-2xl` (?) | 待确认 |
| 成就墙 | 推测 `text-2xl` | 待确认 |

**首页用 `text-xl`，Profile 用 `text-2xl`——同一产品的页面标题字号不一致。**

### 5.3 【次要】导航缺少活动指示器

[Nav.tsx](file:///workspace/components/Nav.tsx) 当前活动态只有颜色变化（`text-blue-600`），没有视觉指示器（如顶部小圆点、底部下划线、图标填充态）。

**iOS / Android 原生模式：**
- 活动图标变填充（filled）
- 非活动图标是描边（outline）

**当前实现：** 活动和非活动都是同一个 stroke-based 图标，只靠颜色区分——色盲用户无法分辨。

### 5.4 【重要】焦点引导缺失

首页 CurrentTaskCard 是"核心答案"，但视觉上与 KPI 三宫格的权重差距不够大。KPI 用 `text-3xl font-bold` 的大数字反而抢了焦点。

**应调整：** CurrentTaskCard 用更大的字号 / 更强的阴影 / 更鲜明的背景色，让用户 3 秒内锁定"现在该做什么"。

---

## 六、美观度（Aesthetics）

### 6.1 【重要】整体风格缺乏"签名感"

当前 UI 是"合格的 Tailwind 默认风"——蓝灰配色、圆角卡片、阴影浮起。但它没有"签名感"——没有让人一看就知道"这是 DevPath"的独特视觉语言。

**对比：**
- Linear 的深色 + 紫色 + 精致动画
- Notion 的黑白 + 极简 + emoji 点缀
- Things 3 的圆角 + 蓝色 + 转场动画

DevPath 目前是"Tailwind UI 组件库的演示页"——干净但没记忆点。

**建议：** 选一个"品牌色"（不一定是蓝色）+ 一个"品牌字体"（考虑 Inter / 思源黑体）+ 一个"签名动效"（如 CurrentTaskCard 的进入动画）。

### 6.2 【次要】渐变使用不一致

全仓只有 2 处使用渐变：
1. [HomeClient.tsx:125](file:///workspace/app/HomeClient.tsx#L125) 欢迎页 CTA：`from-blue-500 to-purple-600`
2. （待查其它）

**问题：** 渐变是强视觉语言，要么系统化使用（如所有 primary CTA 都用同一渐变），要么完全不用。当前"只用一次"是最差的选择——它会让用户以为这是一个"特殊按钮"，破坏按钮系统的语义。

### 6.3 【次要】留白节奏不稳

首页 `mb-5`（section 间距）vs `mb-3`（卡片间距）vs `mb-2`（卡片内元素间距）—— 差值太小（20/12/8px），视觉上缺乏呼吸感。

**Apple 的节奏：** section 间距通常是卡片间距的 2 倍，让"分组"一目了然。

### 6.4 【次要】微交互不足

**当前交互：**
- Button hover：`hover:bg-blue-700`（颜色变化）✓
- Card hover：`hover:shadow-md`（阴影变化）✓
- CollapsibleSection：chevron-down `rotate-180` ✓
- Toast：`translate-y-2` + `opacity-0` 退出 ✓

**缺失：**
- CurrentTaskCard 内容切换无动画
- KPI 数字变化无 count-up
- 列表项进入无 stagger 动画
- 按下（active）态只有颜色变化，无 scale 反馈

**建议：** 引入 Framer Motion（或纯 CSS `@keyframes`），为核心交互添加 200ms 内的微动效。

---

## 七、可访问性（Accessibility）

### 7.1 【严重】字号低于可读下限

**全仓 51 处 `text-[10px]` / `text-[11px]`，分布在 24 个文件。**

典型问题：
- [Nav.tsx:45](file:///workspace/components/Nav.tsx#L45) 底部导航标签 `text-[10px]` —— iOS HIG 建议最小 11px
- [HomeClient.tsx](file:///workspace/app/HomeClient.tsx) 多处 `text-[10px]` 用于错题计数 / 多巴胺标签 / AI 质量详情入口
- [review/page.tsx:546](file:///workspace/app/review/page.tsx#L546) FilterRow 标签 `text-[11px]`

**WCAG 1.4.4：** 文字应可在 200% 缩放后仍可读。`text-[10px]` 缩放后仍只有 20px，但布局可能崩。

### 7.2 【重要】对比度风险

- `text-gray-400` 在 `bg-white` 上对比度约 **4.5:1**（WCAG AA 文字下限是 4.5:1，刚好擦边）
- `text-gray-400` 在 `bg-gray-50` 上对比度约 **4.0:1**（不达标）
- `text-gray-300` 用于图标时对比度更低

**典型问题：** [HomeClient.tsx:142](file:///workspace/app/HomeClient.tsx#L142) 日期文字 `text-gray-400 dark:text-gray-500` 在浅色背景上擦边，在深色背景上不达标。

### 7.3 【重要】焦点状态不统一

- Button：`focus-visible:ring-2 focus-visible:ring-blue-500/40`
- Input：`focus:ring-2 focus:ring-blue-500/20`（注意是 `focus` 不是 `focus-visible`）
- Link：多数无焦点样式

**问题：**
1. Button 用 `focus-visible`（仅键盘聚焦时显示），Input 用 `focus`（鼠标点击也显示）—— 不一致
2. Ring 透明度 40 vs 20 —— 不一致
3. Link 普遍缺焦点环，键盘用户无法定位

### 7.4 【次要】模态焦点陷阱缺失

[profile/page.tsx:1399](file:///workspace/app/profile/page.tsx#L1399) 的升级模态、[Toast.tsx:179](file:///workspace/components/Toast.tsx#L179) 的 confirm 对话框，都没有实现焦点陷阱（focus trap）—— Tab 键会跑到模态背后的页面。

### 7.5 【次要】语义化 HTML 不足

- [profile/page.tsx:1358](file:///workspace/app/profile/page.tsx#L1358) FAQ 用原生 `<details>` / `<summary>`（语义正确 ✓），但样式不统一（`[&_summary::-webkit-details-marker]:hidden` 隐藏了原生箭头，自己用 `›` 替代）
- 没有跳转到主内容的链接（skip-to-content）
- `<kbd>` 元素直接用，没有统一样式

---

## 八、暗色模式（Dark Mode）

### 8.1 【良好】覆盖度高

绝大多数组件都有 `dark:` 变体，layout.tsx 通过内联脚本预判主题避免闪烁——这两点做得对。

### 8.2 【重要】部分元素遗漏 dark 变体

- [HomeClient.tsx:125](file:///workspace/app/HomeClient.tsx#L125) 欢迎页 CTA 的 `bg-gradient-to-r from-blue-500 to-purple-600` —— **没有 dark 变体**，暗色模式下渐变过亮
- [profile/page.tsx:1058](file:///workspace/app/profile/page.tsx#L1058) 实时预览区 `bg-gray-50` 有 dark 变体 ✓，但内部部分元素遗漏
- 热力图颜色 [HomeClient.tsx:101-107](file:///workspace/app/HomeClient.tsx#L101-L107) 在暗色模式下 `bg-green-200/400/500/700` 的对比度未优化

### 8.3 【次要】暗色模式色阶未定义

没有定义 `dark:bg-card` / `dark:text-secondary` 这样的语义令牌，每个开发者手动写 `dark:bg-gray-800` / `dark:text-gray-300`，导致暗色背景色阶散乱（`gray-800` / `gray-900` / `gray-950` 混用）。

---

## 九、具体问题清单（Issue List）

### 严重问题（Critical — 立即修复）

| # | 问题 | 位置 | 修复方向 |
|---|---|---|---|
| C1 | Design Tokens 完全缺失 | [tailwind.config.ts](file:///workspace/tailwind.config.ts) | 定义 brand/semantic/spacing/radius/shadow/typography 令牌 |
| C2 | 首页信息密度过高（12 块 vs 声称的 5 块）| [HomeClient.tsx](file:///workspace/app/HomeClient.tsx) | 砍到 3-5 块，合并功能重叠区 |
| C3 | SVG 图标与 emoji 混用 | 16 个文件 | 统一为 SVG Icon，番茄钟 `🍅` 改用 `flame` 或新增 `tomato` 图标 |
| C4 | 字号低于可读下限（51 处 `text-[10px/11px]`）| 24 个文件 | 全部提升到 `text-xs`(12px) 起，定义最小字号令牌 |
| C5 | 模态系统 3 套实现不统一 | Toast / profile / ChatModal | 抽取 `<Modal>` 统一组件 |

### 重要问题（Major — 本迭代修复）

| # | 问题 | 位置 | 修复方向 |
|---|---|---|---|
| M1 | 圆角 4 种混用（228 处）| 53 个文件 | 定义 radius scale：sm=8 / md=12 / lg=16 / full=9999，按语义分配 |
| M2 | 阴影 4 种混用（40 处）| 22 个文件 | 定义 elevation：flat / sm / md / lg，按层级分配 |
| M3 | Link 当 Button 用，7+ 种样式 | 多处 | 抽取 `<LinkButton variant>` 组件 |
| M4 | 空状态 6 种视觉处理 | 6 个页面 | 抽取 `<EmptyState icon title desc action />` 组件 |
| M5 | 加载状态不统一 | 多处 | 抽取 `<Skeleton>` / `<LoadingSpinner>` 组件 |
| M6 | 页面标题字号不统一（text-xl vs text-2xl）| Home vs Profile | 统一为 `text-2xl font-bold` |
| M7 | 焦点状态不统一（focus vs focus-visible，ring 40 vs 20）| Button vs Input | 统一为 `focus-visible:ring-2 ring-blue-500/40` |
| M8 | 暗色模式部分元素遗漏（欢迎 CTA 渐变）| [HomeClient.tsx:125](file:///workspace/app/HomeClient.tsx#L125) | 添加 dark 变体或改用纯色 |
| M9 | 颜色系统散乱（amber/orange 混用，3 种灰边框）| 多处 | 定义 semantic color tokens |
| M10 | 焦点引导不足（CurrentTaskCard 权重不够）| 首页 | 加大字号 / 阴影 / 背景 |

### 次要问题（Minor — 后续迭代修复）

| # | 问题 | 位置 | 修复方向 |
|---|---|---|---|
| m1 | 渐变只用 1 处（欢迎 CTA）| [HomeClient.tsx:125](file:///workspace/app/HomeClient.tsx#L125) | 系统化或移除 |
| m2 | 留白节奏不稳（mb-5/4/3/2 差值太小）| 多处 | 定义 spacing scale，section=2x card |
| m3 | 微交互不足（无 count-up / stagger / active scale）| 多处 | 引入 Framer Motion |
| m4 | Nav 无活动指示器（仅颜色）| [Nav.tsx](file:///workspace/components/Nav.tsx) | 活动态加填充图标或下划线 |
| m5 | 模态焦点陷阱缺失 | Toast / profile | 实现 focus trap |
| m6 | 缺 skip-to-content 链接 | [layout.tsx](file:///workspace/app/layout.tsx) | 添加 a11y skip link |
| m7 | 整体风格缺"签名感" | 全局 | 选品牌色 + 字体 + 签名动效 |
| m8 | `<kbd>` 样式未统一 | [profile/page.tsx:1388](file:///workspace/app/profile/page.tsx#L1388) | 抽取 `<Kbd>` 组件 |
| m9 | 字体未定义（中文回退不一致）| tailwind config | 定义 `font-sans` 包含 PingFang/Microsoft YaHei |
| m10 | Nav 标签 `text-[10px]` 过小 | [Nav.tsx:45](file:///workspace/components/Nav.tsx#L45) | 改为 `text-xs` |

---

## 十、改进路线图（Roadmap）

### 阶段 1：建立设计令牌（1-2 天）

**目标：** 把 `tailwind.config.ts` 的 `extend: {}` 填满。

```typescript
// tailwind.config.ts（建议）
theme: {
  extend: {
    colors: {
      brand: {
        50: '#eff6ff', 100: '#dbeafe', 200: '#bfdbfe',
        500: '#3b82f6', 600: '#2563eb', 700: '#1d4ed8',
        DEFAULT: '#2563eb', // brand = brand.600
      },
      // semantic aliases
      success: { DEFAULT: '#16a34a', soft: '#dcfce7' },
      warning: { DEFAULT: '#d97706', soft: '#fef3c7' },
      danger:  { DEFAULT: '#dc2626', soft: '#fee2e2' },
    },
    borderRadius: { card: '0.75rem', pill: '9999px' },
    boxShadow: {
      card: '0 1px 3px rgba(0,0,0,0.08)',
      'card-hover': '0 4px 12px rgba(0,0,0,0.12)',
      modal: '0 20px 50px rgba(0,0,0,0.25)',
    },
    fontFamily: {
      sans: ['Inter', 'PingFang SC', 'Microsoft YaHei', 'system-ui', 'sans-serif'],
    },
    fontSize: {
      '2xs': ['11px', { lineHeight: '16px' }], // 替代 text-[11px]
    },
  },
},
```

### 阶段 2：抽取缺失组件（2-3 天）

- `<LinkButton href variant size>` — 统一 Link 当按钮的场景
- `<Modal open onClose size backdrop>` — 统一所有模态
- `<EmptyState icon title description action>` — 统一空状态
- `<Skeleton variant="text|card|avatar">` — 统一加载态
- `<Kbd>` — 统一键盘按键样式

### 阶段 3：清理逃逸值（1-2 天）

- 全局替换 `text-[10px]` → `text-2xs`（新令牌）或 `text-xs`
- 全局替换 `text-[11px]` → `text-2xs`
- 全局替换 `rounded-lg/xl/2xl` 按语义重映射到 `rounded-card`
- 全局替换 emoji `🍅📚✨🔥` 为对应 SVG Icon

### 阶段 4：首页减法（1-2 天）

把首页从 12 块砍到 5 块：
1. Hero（CurrentTaskCard + 行动入口合并）
2. KPI 三宫格
3. AI 教练洞察（合并 HomeInsights + 能力画像 + AI 质量 + StatusCard）
4. 今日安排（含能量趋势）
5. 折叠区（情绪 + 错题 + 热力图）

### 阶段 5：可访问性与暗色模式（1 天）

- 统一 `focus-visible:ring-2 ring-brand-500/40`
- 修复对比度（`text-gray-400` → `text-gray-500`）
- 模态实现 focus trap
- 补全 dark 变体

---

## 十一、附录：检查依据

### 生产环境抓取（WebFetch）

| 页面 | URL | 状态 |
|---|---|---|
| 首页 | https://devpath-ai.pages.dev/ | ✓ 抓取成功 |
| 学习 | https://devpath-ai.pages.dev/learn | ✓ 路由跳转中 |
| 复习 | https://devpath-ai.pages.dev/review | ✓ 抓取成功 |
| 我的 | https://devpath-ai.pages.dev/profile | ✓ 抓取成功 |
| 番茄 | https://devpath-ai.pages.dev/timer | ✓ 抓取成功 |
| 成就墙 | https://devpath-ai.pages.dev/achievements | ✓ 抓取成功（0/16）|
| 数据 | https://devpath-ai.pages.dev/stats | ✓ 抓取成功 |

### 源代码审查文件清单

- 配置：[tailwind.config.ts](file:///workspace/tailwind.config.ts) / [app/globals.css](file:///workspace/app/globals.css) / [app/layout.tsx](file:///workspace/app/layout.tsx)
- UI 组件库：[components/ui/](file:///workspace/components/ui/) 全部 8 个组件
- 业务组件：[Nav.tsx](file:///workspace/components/Nav.tsx) / [Toast.tsx](file:///workspace/components/Toast.tsx) / [FloatingChat.tsx](file:///workspace/components/FloatingChat.tsx) / [Icon.tsx](file:///workspace/components/Icon.tsx) / [ThemeToggle.tsx](file:///workspace/components/ThemeToggle.tsx)
- 页面：[HomeClient.tsx](file:///workspace/app/HomeClient.tsx) / [profile/page.tsx](file:///workspace/app/profile/page.tsx) / [review/page.tsx](file:///workspace/app/review/page.tsx) / [learn/page.tsx](file:///workspace/app/learn/page.tsx)
- 工具：[lib/cn.ts](file:///workspace/lib/cn.ts)

### 全仓 grep 统计

| 模式 | 出现次数 | 文件数 |
|---|---|---|
| `text-[10px]\|text-[11px]\|text-[3.5rem]` | 51 | 24 |
| `rounded-2xl\|rounded-xl\|rounded-lg\|rounded-full` | 228 | 53 |
| `<button` | 3 | 2（都在 ui/）|
| emoji `🍅📚🔥✨📖💪🎯🚀💡` | 28 | 16（含非 UI）|
| `shadow-sm\|shadow-md\|shadow-lg\|shadow-2xl` | 40 | 22 |

---

## 结语

DevPath-AI 有一个值得骄傲的工程基础——8 个自建 UI 组件、移动优先架构、暗色模式覆盖、TDD 测试套件。这些都是"对的事"。

**但从乔布斯的标准看，它在"设计纪律"上还有很长的路要走。**

设计不是"把组件拼起来"，而是"在每个决策点都说 NO，直到只剩下真正必要的元素"。当前的产品有太多的"YES"——
- YES，我们可以混用 emoji 和 SVG → 不行，选一个
- YES，我们可以让每个 Link 按钮长得不一样 → 不行，统一
- YES，我们可以在首页放 12 个信息块 → 不行，砍到 5 个
- YES，我们可以让 text-[10px] 偷偷存在 → 不行，定义最小字号

**把这些 YES 全部变成 NO，产品就会从"合格"变成"伟大"。**

> "Design is not just what it looks like and feels like. Design is how it works."
>
> 设计不只是它看起来和感觉起来的样子——设计是它如何运作。
>
> —— Steve Jobs

---

**报告版本：** v1.0
**下次复审建议：** 完成阶段 1-2 后（预计 1 周内）
