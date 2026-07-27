# 第 5 章：规范约束制定

> **视角**：卡帕西（契约层优先 / 测试即文档 / 单一事实源 / 关注点分离）
> **前置知识**：读完了 [第 4d 章 部署技术选型](file:///workspace/docs/tutorial/04d-tech-deployment.md)
> **本章学什么**：
> 1. AGENTS.md 的地位与三层质量护栏
> 2. 13 条 UI 编码强制规则（含反模式根因）
> 3. 守护测试清单（5 个测试文件）
> 4. 设计令牌是单一事实源
> 5. 测试即文档
> **预计阅读时间**：35 分钟
> **关联文档**：[AGENTS.md](file:///workspace/AGENTS.md) / [docs/ui-design-system.md](file:///workspace/docs/ui-design-system.md) / [docs/code-audit-methodology.md](file:///workspace/docs/code-audit-methodology.md) / [docs/content-generation-standard.md](file:///workspace/docs/content-generation-standard.md)

---

## 5.1 AGENTS.md 的地位

[AGENTS.md](file:///workspace/AGENTS.md) 是本项目的**最高优先级强制规范**，所有 AI（Claude / Cursor / Copilot / Trae 等）和人类开发者必须遵守。

**优先级**：AGENTS.md > docs/DEVELOPMENT.md > docs/ARCHITECTURE.md > 其他文档

**强制性**：与 [docs/ui-design-system.md](file:///workspace/docs/ui-design-system.md) + [__tests__/no-native-form-elements.test.ts](file:///workspace/__tests__/no-native-form-elements.test.ts) + [__tests__/ui-design-system-guard.test.ts](file:///workspace/__tests__/ui-design-system-guard.test.ts) 一起构成护栏。任何违反都会让 CI 失败。

**卡帕西视角**：规范不是"建议"，是"契约"。规则没有测试守护等于不存在，文档没有测试守护等于建议。AGENTS.md 的每条规则都对应守护测试或代码评审检查项。

---

## 5.2 三层质量护栏

devpath-ai 用三层质量护栏防止缺陷流入生产：

```
1. 预防（编码规范）
   AGENTS.md 13 条 UI 强制规则 + docs/ui-design-system.md
   → 写代码前
   ↓
2. 检测（守护测试）
   __tests__/*-guard.test.ts
   → 每次 commit 自动跑
   ↓
3. 审计（深度扫描）
   docs/code-audit-methodology.md + docs/perf-optimization-methodology.md
   → 里程碑 / 定期
```

**三层缺一不可**：
- 没有预防 → 缺陷流入代码
- 没有检测 → 缺陷流入 main
- 没有审计 → 累积技术债

---

## 5.3 13 条 UI 编码强制规则

引用自 [AGENTS.md](file:///workspace/AGENTS.md) 第 2 节，每条配卡帕西视角的解读。

### 2.1 表单元素必须用统一组件库

```tsx
// ✅ 正确
import { Button, Input, Select, Textarea, Modal } from "@/components/ui";

// ❌ 禁止：原生表单元素（守护测试会失败）
<button>...</button>
<input />
<select>...</select>
<textarea />
```

**守护测试**：[__tests__/no-native-form-elements.test.ts](file:///workspace/__tests__/no-native-form-elements.test.ts) 扫描 `components/` 和 `app/` 下所有 `.tsx` 文件（`components/ui/` 除外），发现原生表单元素即失败。

**卡帕西解读**：契约层优先。统一组件库保证一致性（设计令牌 / a11y / 暗色模式），守护测试强制执行。开发者不能"偷懒"用原生元素。

### 2.2 设计令牌是单一事实源

```tsx
// ❌ 禁止
<div className="text-[10px] text-[11px] text-[13px]" />
<div className="bg-[#ff5000] border-[#abcdef]" />
<div className="rounded-[13px] shadow-[0_0_10px_red]" />

// ✅ 必须用 tailwind.config.ts 定义的令牌
<div className="text-2xs text-sm" />
<div className="bg-brand-600 border-gray-200" />
```

**卡帕西解读**：单一事实源。设计令牌在 `tailwind.config.ts` 定义，所有颜色 / 字号 / 圆角 / 阴影都从令牌取，禁止逃逸值。修改令牌一次，全站生效。

### 2.3 暗色模式必须配对

```tsx
// ✅ 正确
<div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-4" />
<p className="text-gray-500 dark:text-gray-400">辅助文字</p>

// ❌ 禁止（守护测试会失败）
<div className="bg-white p-4" />
<p className="text-gray-400" />
```

**守护测试**：[__tests__/ui-design-system-guard.test.ts](file:///workspace/__tests__/ui-design-system-guard.test.ts) 扫描浅色 utility，要求同 className 内必须带 `dark:` 配对。

**卡帕西解读**：暗色模式不是"可选功能"，是"强制配对"。每个浅色 utility 必须带对应 `dark:` 变体，否则暗色模式下UI 不可读。

### 2.4 模态必须用 `<Modal>`

```tsx
// ✅ 正确：用统一 Modal 组件（内置 focus trap + ARIA + ESC + 焦点恢复）
<Modal open={open} onClose={onClose} titleId="my-title">
  <h2 id="my-title">标题</h2>
</Modal>

// ❌ 禁止：手写 div 模态（缺 ARIA + focus trap）
<div className="fixed inset-0 bg-black/40" onClick={onClose}>
  <div onClick={(e) => e.stopPropagation()}>...</div>
</div>
```

**卡帕西解读**：a11y 内置。手写 div 模态缺 focus trap（键盘用户焦点跑出 modal）/ ARIA（屏幕阅读器不识别）/ ESC 关闭 / 焦点恢复。统一 `<Modal>` 内置这些。

### 2.5 折叠按钮必须带 `aria-expanded` + `aria-controls`

```tsx
// ✅ 正确
<Button aria-expanded={open} aria-controls="panel-id" onClick={toggle}>展开</Button>
<section id="panel-id" className={open ? "" : "hidden"}>...</section>

// ❌ 禁止
<Button onClick={toggle}>展开</Button>
```

### 2.6 进度条必须带 `role="progressbar"`

```tsx
<div
  role="progressbar"
  aria-valuenow={50}
  aria-valuemin={0}
  aria-valuemax={100}
  aria-label="掌握度 50%"
  className="bg-gray-200 dark:bg-gray-700 rounded-full h-2"
>
  <div style={{ width: "50%" }} />
</div>
```

### 2.7 倒计时必须带 `role="timer"`

```tsx
<div
  role="timer"
  aria-live="off"
  aria-atomic="true"
  aria-label={`剩余 ${seconds} 秒`}
>
  {seconds}
</div>
```

### 2.8 icon-only 按钮必须带 `aria-label`

```tsx
// ✅ 正确
<Button iconOnly aria-label="关闭" onClick={close}>
  <Icon name="x" />
</Button>

// ❌ 禁止
<Button iconOnly onClick={close}>
  <Icon name="x" />
</Button>
```

### 2.9 图标必须用 `<Icon>` 组件，禁止 emoji 当功能图标

```tsx
// ✅ 正确
<Icon name="tomato" className="w-16 h-16 text-red-500" />

// ❌ 禁止：emoji 当功能图标
<div className="text-5xl">🍅</div>
```

**例外**：情绪表情等纯装饰 emoji 允许保留，但应加 `aria-hidden="true"`。

### 2.10 禁止 `div onClick` 当交互元素

```tsx
// ❌ 禁止：div onClick 当按钮（键盘不可访问）
<div onClick={handleClick} className="cursor-pointer">点击</div>

// ✅ 必须用 <Button> 或 <Link>
<Button onClick={handleClick}>点击</Button>
```

如必须用 div（如复杂卡片整体可点击），必须补 `role="button"` + `tabIndex={0}` + `onKeyDown`（Enter/Space）。

### 2.11 浮层 UI 反模式：禁止 `absolute` 浮层覆盖可滚动内容

**背景**：2026-07-25 用户反馈"脑图搜索框挡住工具栏 + 工具栏和搜索框遮挡脑图节点"。

**根因分析**：
1. 同位置浮层互相重叠（搜索框 + 工具栏在窄屏 < 510px 重叠）
2. 浮层抢画布空间（z-20 覆盖在 SVG 画布上，顶部 60-80px 节点被永久遮挡）
3. 测试盲区（开发时只在小数据集 / 桌面宽屏验证）

**正确模式**：工具栏用 sticky header 或 flex 行布局，让它们占据自己应得的空间。

```tsx
// ❌ 禁止：absolute 浮层当工具栏
<div className="relative h-[600px]">
  <div className="absolute top-2 left-2 z-20 w-44">搜索框</div>
  <svg>...</svg>  {/* 顶部 60px 被遮挡 */}
</div>

// ✅ 正确：sticky header 占据自己空间
<div className="relative h-[600px] flex flex-col">
  <div className="flex items-center gap-2 px-2 py-2 border-b shrink-0">
    <div className="flex-1">搜索框</div>
  </div>
  <div className="flex-1 min-h-0">
    <svg>...</svg>  {/* 完整可见 */}
  </div>
</div>
```

### 2.12 交互闭环：跳转必须携带场景参数

**背景**：2026-07-25 用户反馈"我从某个知识点进来的，那就默认过来某个知识点；从今天计划进来的，就加今日过滤条件"。

**正确模式**：跳转方用 `buildSceneUrl` 构造带场景参数的 URL；目标页用 `parseSceneParams` 读取并过滤。

```tsx
// ❌ 禁止：跳转不带场景参数
<Link href="/review">去复习</Link>

// ✅ 正确：用 buildSceneUrl 把当前任务上下文带过去
import { buildSceneUrl } from "@/lib/study-queue/nav-params";
<Link href={buildSceneUrl("/review", task, "home")}>去复习</Link>

// ✅ 正确：目标页用 parseSceneParams 读取并过滤
import { parseSceneParams } from "@/lib/study-queue/nav-params";
const scene = useMemo(() => parseSceneParams(searchParams), [searchParams]);
```

**参数约定**：
- `planId`：关联的学习计划 id
- `nodeId`：关联的知识点 id
- `cardId`：关联的 FSRS 卡片 id
- `date`：任务日期 "YYYY-MM-DD"
- `from`：来源标记（如 "home" / "plan-detail"）

### 2.13 学习路径节点必须自带深度内容（v4）

**背景**：2026-07-26 用户投诉"所有学习路径还是不行，太简单，不全面，让人觉得候选人知识太浮于表面"。

**根因**：旧 schema 只产 `summary` 一句话，学习路径就是"标题列表 + 一句话摘要"。

**正确模式**：AI 生成的知识节点必须自带 4 个深度字段。

```typescript
// ✅ 正确：knowledge_decompose v4 schema
const nodeSchema = z.object({
  summary: z.string(),
  coreMechanism: z.string().describe("核心机制 80-150 字"),
  commonPitfalls: z.array(z.string()).describe("高频踩坑 2-3 条"),
  interviewAngles: z.array(z.string()).describe("4 题角度提示"),
  sourceHint: z.string().describe("一手来源提示"),
});
```

**守护测试**：
- [__tests__/content-generation-standard.test.ts](file:///workspace/__tests__/content-generation-standard.test.ts) 守护 prompt 必须包含 4 个字段标记
- [__tests__/preset-content-quality.test.ts](file:///workspace/__tests__/preset-content-quality.test.ts) 守护 preset 节点深度字段达标

---

## 5.4 守护测试清单

| 测试文件 | 守护内容 | 失败后果 |
|---|---|---|
| [__tests__/no-native-form-elements.test.ts](file:///workspace/__tests__/no-native-form-elements.test.ts) | `components/ui/` 之外禁止原生表单元素 | CI red |
| [__tests__/ui-design-system-guard.test.ts](file:///workspace/__tests__/ui-design-system-guard.test.ts) | 浅色 utility 必须带 `dark:` 配对；禁止 `text-[Npx]` 逃逸值 | CI red |
| [__tests__/content-generation-standard.test.ts](file:///workspace/__tests__/content-generation-standard.test.ts) | 内容生成 prompt 必须注入四段式宪章/四角度/正确性完整性/深度字段约束 | CI red |
| [__tests__/preset-content-quality.test.ts](file:///workspace/__tests__/preset-content-quality.test.ts) | preset 答案 >= 500 字符、无占位符、keyPoints/followUps 必填、深度字段达标 | CI red |
| [__tests__/prompts.test.ts](file:///workspace/__tests__/prompts.test.ts) | prompt 版本指纹快照（改 prompt 必须 bump version + 同步 hash） | CI red |

**卡帕西解读**：新增设计规则时，应同时新增对应的守护测试。规则没有测试守护等于不存在。

---

## 5.5 设计令牌是单一事实源

引用自 [tailwind.config.ts](file:///workspace/tailwind.config.ts)，设计令牌定义：

| 类型 | 令牌示例 | 含义 |
|---|---|---|
| 字号 | `text-2xs` / `text-xs` / `text-sm` / `text-base` / `text-lg` / `text-xl` | 比例化字号 |
| 颜色 | `bg-brand-600` / `text-gray-500` / `border-gray-200` | 品牌色 + 灰阶 |
| 圆角 | `rounded-sm` / `rounded-md` / `rounded-card` / `rounded-full` | 比例化圆角 |
| 阴影 | `shadow-sm` / `shadow-card` / `shadow-modal` | 层级阴影 |
| 间距 | `p-2` / `p-4` / `gap-2` / `gap-4` | 4px 基础单位 |

**禁止的逃逸值**：
- `text-[10px]` / `text-[11px]` / `text-[13px]`（自定义字号）
- `bg-[#ff5000]` / `border-[#abcdef]`（自定义颜色）
- `rounded-[13px]` / `shadow-[0_0_10px_red]`（自定义圆角/阴影）

**卡帕西解读**：单一事实源 + 守护测试强制。修改令牌一次，全站生效；禁止逃逸值保证一致性。

---

## 5.6 测试即文档

测试名应该描述规则：

```tsx
// ✅ 测试名描述规则
it("不允许在 components/ui/ 之外使用原生 <input>/<select>/<textarea>/<button>", () => { ... });
it("浅色 utility 必须带 dark: 配对", () => { ... });

// ❌ 测试名描述实现
it("test input", () => { ... });
it("should pass", () => { ... });
```

**卡帕西解读**：测试名是文档的一部分。新人读测试名就能理解规则，不用读 AGENTS.md。测试失败时，测试名直接告诉违反了哪条规则。

---

## 5.7 AI 内容生成规范

引用自 [docs/content-generation-standard.md](file:///workspace/docs/content-generation-standard.md)，所有 AI 生成知识库内容必须遵守：

### 答案四段式宪章

1. **结论与原理**（含量化细节）
2. **实战案例**（第一人称 + 至少 2 个具体数字 + 踩坑修复过程）
3. **举一反三**（场景推广/工程经验映射）
4. **扣分点对照**（背题 vs 真做过）

禁止：名词罗列 / 教科书定义堆砌 / 无数字空洞案例 / 无前提经验值。

### 题目四角度

1. 概念辨析
2. 原理深挖
3. 实战设计
4. 踩坑对比

题面具体有场景，禁止泛泛题。

### 知识点正确性/完整性

- 事实可被一手来源佐证
- 经验值标注适用条件
- 高频考点不得遗漏
- 依赖闭环

### 运行时注入点

`lib/ai/prompts.ts` 的 `ANSWER_QUALITY_CHARTER` / `QUESTION_ANGLE_RULES` 常量注入 4 个生成 prompt：
- `knowledge_decompose`
- `question_generate`
- `question_stem_generate`
- `answer_generate`

修改 prompt 必须 bump version（指纹快照强制）。

---

## 5.8 多轮深度审计

引用自 [docs/code-audit-methodology.md](file:///workspace/docs/code-audit-methodology.md)，里程碑 / 重大版本发布前 / 定期执行多轮深度审计。

**审计流程**：
1. 第一轮：架构审计（分层 / 依赖 / 数据流）
2. 第二轮：实现审计（关键模块代码质量）
3. 第三轮：测试审计（覆盖率 / 守护测试有效性）
4. 第四轮：性能审计（首屏 / 路由 / Bundle）
5. 第五轮：安全审计（鉴权 / 加密 / 防护）

详细见 [docs/code-audit-methodology.md](file:///workspace/docs/code-audit-methodology.md) + [docs/perf-optimization-methodology.md](file:///workspace/docs/perf-optimization-methodology.md)。

---

## 本章小结

**学到了什么**：
1. AGENTS.md 是最高优先级强制规范，三层质量护栏（预防 / 检测 / 审计）缺一不可
2. 13 条 UI 强制规则：统一组件 / 设计令牌 / 暗色配对 / Modal / ARIA / Icon / 反浮层 / 场景参数 / 深度字段
3. 5 个守护测试：原生表单 / 设计令牌 / 内容生成标准 / Preset 质量 / Prompt 指纹
4. 设计令牌单一事实源 + 守护测试强制禁逃逸值
5. 测试即文档：测试名描述规则
6. AI 内容生成规范：四段式宪章 + 四角度 + 正确性完整性 + Prompt 指纹

**关键决策回顾**：
1. **规则没有测试守护等于不存在**：每条规则都对应守护测试或代码评审
2. **三层护栏**：预防（AGENTS.md）+ 检测（守护测试）+ 审计（深度扫描）
3. **单一事实源**：设计令牌在 tailwind.config.ts，禁逃逸值
4. **Prompt 版本指纹**：改 prompt 必须 bump version + 同步 hash

## 下一章衔接

下一章 [06-implementation.md](file:///workspace/docs/tutorial/06-implementation.md) 讲代码实现：6 个核心模块的实现决策 + 代码片段 + 踩过的坑。

## 延伸阅读

- [AGENTS.md](file:///workspace/AGENTS.md) — AI 编码守则（强制规范）
- [docs/ui-design-system.md](file:///workspace/docs/ui-design-system.md) — UI 设计系统
- [docs/code-audit-methodology.md](file:///workspace/docs/code-audit-methodology.md) — 代码审计方法论
- [docs/content-generation-standard.md](file:///workspace/docs/content-generation-standard.md) — AI 内容生成规范
