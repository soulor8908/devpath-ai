# AGENTS.md — AI 编码守则

> **地位**：本项目所有 AI（Claude / Cursor / Copilot / Trae 等）和人类开发者**必须**遵守的强制规范。
> **优先级**：本文件 > `docs/DEVELOPMENT.md` > `docs/ARCHITECTURE.md` > 其他文档。
> **强制性**：与 `docs/ui-design-system.md` + `__tests__/no-native-form-elements.test.ts` + `__tests__/ui-design-system-guard.test.ts` 一起构成护栏。任何违反都会让 CI 失败。

---

## 0. 项目身份

- **项目名**：devpath-ai — AI 驱动的开发者成长 OS
- **技术栈**：Next.js 15 (App Router) + React 19 + TypeScript 5.5 + Tailwind CSS 3.4
- **测试**：Vitest 1.6 + Testing Library + jsdom
- **存储**：IndexedDB（本地）+ Cloudflare KV（云端同步，可选）
- **生产链接**：https://devpath-ai.ai-kits.workers.dev/

---

## 1. 必读文档（按顺序）

启动任何 UI / 前端任务前，**必须**先读：

1. [docs/ui-design-system.md](file:///workspace/docs/ui-design-system.md) — UI 设计系统规范（强制）
2. [tailwind.config.ts](file:///workspace/tailwind.config.ts) — 设计令牌定义
3. [components/ui/index.ts](file:///workspace/components/ui/index.ts) — 可用的统一组件清单
4. 目标文件的头注释（如 [app/HomeClient.tsx](file:///workspace/app/HomeClient.tsx) 文件头有 5 区结构说明）

启动后端 / API 任务前，先读 [docs/ARCHITECTURE.md](file:///workspace/docs/ARCHITECTURE.md) 和 [docs/DEVELOPMENT.md](file:///workspace/docs/DEVELOPMENT.md)。

---

## 2. UI 编码强制规则

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

### 2.2 设计令牌是单一事实源

**禁止**以下逃逸值：

```tsx
// ❌ 禁止
<div className="text-[10px] text-[11px] text-[13px]" />
<div className="bg-[#ff5000] border-[#abcdef]" />
<div className="rounded-[13px] shadow-[0_0_10px_red]" />
```

**必须**用 [tailwind.config.ts](file:///workspace/tailwind.config.ts) 定义的令牌：`text-2xs` / `text-xs` / `text-sm` / `rounded-card` / `shadow-card` / `bg-brand-600` 等。

### 2.3 暗色模式必须配对

每一组浅色 utility **必须**带对应的 `dark:` 变体。常见配对见 [docs/ui-design-system.md](file:///workspace/docs/ui-design-system.md) 第 3.2 节。

```tsx
// ✅ 正确
<div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-4" />
<p className="text-gray-500 dark:text-gray-400">辅助文字</p>

// ❌ 禁止（守护测试会失败）
<div className="bg-white p-4" />
<p className="text-gray-400" />
```

**守护测试**：[__tests__/ui-design-system-guard.test.ts](file:///workspace/__tests__/ui-design-system-guard.test.ts) 扫描浅色 utility，要求同 className 内必须带 `dark:` 配对。

### 2.4 模态必须用 `<Modal>`

```tsx
// ✅ 正确：用统一 Modal 组件（内置 focus trap + ARIA + ESC + 焦点恢复）
<Modal open={open} onClose={onClose} titleId="my-title">
  <h2 id="my-title">标题</h2>
  ...
</Modal>

// ❌ 禁止：手写 div 模态（缺 ARIA + focus trap）
<div className="fixed inset-0 bg-black/40" onClick={onClose}>
  <div onClick={(e) => e.stopPropagation()}>...</div>
</div>
```

### 2.5 折叠按钮必须带 `aria-expanded` + `aria-controls`

```tsx
// ✅ 正确
<Button aria-expanded={open} aria-controls="panel-id" onClick={toggle}>
  展开
</Button>
<section id="panel-id" className={open ? "" : "hidden"}>...</section>

// ❌ 禁止
<Button onClick={toggle}>展开</Button>
```

### 2.6 进度条必须带 `role="progressbar"`

```tsx
// ✅ 正确
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
// ✅ 正确
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
<Icon name="alert" className="w-3.5 h-3.5" /> 已被打断

// ❌ 禁止：emoji 当功能图标
<div className="text-5xl">🍅</div>
<span>⚠️ 已被打断</span>
```

**例外**：情绪表情等纯装饰 emoji 允许保留，但应加 `aria-hidden="true"`。

### 2.10 禁止 `div onClick` 当交互元素

```tsx
// ❌ 禁止：div onClick 当按钮（键盘不可访问）
<div onClick={handleClick} className="cursor-pointer">点击</div>

// ✅ 必须用 <Button> 或 <Link>
<Button onClick={handleClick}>点击</Button>
<Link href="/target">点击</Link>
```

如必须用 div（如复杂卡片整体可点击），必须补 `role="button"` + `tabIndex={0}` + `onKeyDown`（Enter/Space）。

### 2.11 浮层 UI 反模式：禁止 `absolute` 浮层覆盖可滚动内容

**背景**：2026-07-25 用户反馈"脑图搜索框挡住工具栏 + 工具栏和搜索框遮挡脑图节点"。根因分析：

1. **同位置浮层互相重叠**：搜索框 `absolute top-2 left-2 w-44`（176px）+ 工具栏 `absolute top-2 right-2`（约 320px 宽，含"展开"/"收起"文字按钮）在 < 510px 视口下空间不够 → 重叠。
2. **浮层抢画布空间**：两个浮层都 `z-20` 覆盖在 SVG 画布上，导致画布顶部 60-80px 的节点被永久遮挡（用户永远看不到这些节点，必须放大/拖动才能露出）。
3. **测试盲区**：开发时只在小数据集 / 桌面宽屏上验证，没考虑窄 Modal（如脑图弹窗在 xl=1024px Modal 内）和移动端场景。

**根因总结**：用 `absolute` 浮层当"工具栏"，默认假设它"不占空间"。实际上：
- 它占了 viewport 顶部一块固定区域（z-20 + 宽高）
- 在窄屏下与同位置浮层重叠
- 在大屏下也遮挡画布主内容

**正确模式**：工具栏 / 搜索框 / 过滤器应当用 **sticky header** 或 **flex 行**布局，让它们占据自己应得的空间，画布从工具栏下方开始。

```tsx
// ❌ 禁止：absolute 浮层当工具栏（抢画布 + 窄屏重叠）
<div className="relative h-[600px]">
  <div className="absolute top-2 left-2 z-20 w-44">搜索框</div>
  <div className="absolute top-2 right-2 z-20">工具按钮</div>
  <svg>...</svg>  {/* 顶部 60px 被遮挡 */}
</div>

// ✅ 正确：sticky header 占据自己空间，画布从下方开始
<div className="relative h-[600px] flex flex-col">
  <div className="flex items-center gap-2 px-2 py-2 border-b shrink-0">
    <div className="flex-1">搜索框</div>
    <div>工具按钮（全部 icon-only，节省宽度）</div>
  </div>
  <div className="flex-1 min-h-0">
    <svg>...</svg>  {/* 完整可见 */}
  </div>
</div>
```

**判断标准**（设计审查时自查）：
- 工具栏是否与同位置其他浮层在窄屏（< 600px）下重叠？
- 工具栏是否覆盖了主要内容区？
- 工具按钮文字是否能换成 icon-only（用 `aria-label` + `title`）省宽度？
- 在窄屏 + 数据稀疏 / 窄屏 + 数据密集两种场景下，画布顶部节点是否都可见？

**适用范围**：所有"画布 + 工具栏"类组件（脑图 / 图表 / 时间轴 / 看板 / 大表格等）。

### 2.12 交互闭环：跳转必须携带场景参数

**背景**：2026-07-25 用户反馈"我从某个知识点进来的，那就默认过来某个知识点；从今天计划进来的，就加今日过滤条件"。原代码从首页/计划详情跳到训练/复习/学习详情页时**不带任何 query 参数**，导致用户落到目标页后还要重新找一遍刚点过的任务——交互闭环断裂。

**根因**：跳转方只写了 `href="/review"` 或 `href={`/learn/${planId}`}`，没有把"用户当前在看的任务上下文"传过去。目标页也只能从全量数据里加载，不知道用户想聚焦哪一项。

**正确模式**：跳转方用 `buildSceneUrl` 构造带场景参数的 URL；目标页用 `parseSceneParams` 读取并过滤/预选。

```tsx
// ❌ 禁止：跳转不带场景参数（用户在目标页要重新找）
<Link href="/review">去复习</Link>
<Link href={`/learn/${task.planId}`}>去学习</Link>

// ✅ 正确：用 buildSceneUrl 把当前任务上下文带过去
import { buildSceneUrl } from "@/lib/study-queue/nav-params";
<Link href={buildSceneUrl("/review", task, "home")}>去复习</Link>
<Link href={buildSceneUrl(`/learn/${task.planId}`, task, "home")}>去学习</Link>

// ✅ 正确：目标页用 parseSceneParams 读取并过滤
import { parseSceneParams } from "@/lib/study-queue/nav-params";
const searchParams = useSearchParams();
const scene = useMemo(() => parseSceneParams(searchParams), [searchParams]);
// 用 scene.planId / scene.nodeId / scene.cardId / scene.date 过滤数据
```

**参数约定**（见 [lib/study-queue/nav-params.ts](file:///workspace/lib/study-queue/nav-params.ts)）：
- `planId`：关联的学习计划 id（type=new 时有值）
- `nodeId`：关联的知识点 id（type=new 时有值）
- `questionId`：关联的题目 id（type=new 时有值，2026-07-27 题目维度重构后必带——学习队列从节点维度改成题目维度，一题一 task）
- `cardId`：关联的 FSRS 卡片 id（type=review 时有值）
- `date`：任务日期 "YYYY-MM-DD"（用于"今日计划"过滤）
- `from`：来源标记（如 "home" / "plan-detail"），用于目标页做埋点/差异化提示

**判断标准**（设计审查时自查）：
- 跳转入口是否知道用户当前在看哪个任务？知道就带场景参数。
- 目标页是否能从全量数据里聚焦到目标任务？不能就加 `parseSceneParams` 读取。
- 用户从 A 页面点任务 X 跳到 B 页面，B 页面是否默认选中/过滤到任务 X？
- routine-based 的通用 CTA（如"去复习"、"去休息"）不需要带参数——它们没有具体任务上下文。

**适用范围**：所有"任务列表 → 任务详情/训练/复习"的跳转入口（首页今日清单 / 计划详情页 / 知识树 / 脑图节点等）。

### 2.13 学习路径节点必须自带深度内容（v4，修复"浮于表面"投诉）

**背景**：2026-07-26 用户投诉"所有学习路径还是不行，太简单，不全面，让人觉得候选人知识太浮于表面"。根因诊断（卡帕西视角）：

1. **schema 太薄**：旧 `knowledge_decompose` 只产 `summary` 一句话，用户看到的学习路径就是"标题列表 + 一句话摘要"，必然浮于表面。
2. **守护断层**：`preset-content-quality.test.ts` 只查答案字符数，不查答案是否真有四段式结构；`content-generation-standard.test.ts` 只查 prompt 字符串 marker，不查 preset 实际产物。结果 16 道 AI preset 题答案 < 500 字符蒙混过关（main 分支 CI 本来就是 red 的）。
3. **prompt 不要求深度**：`knowledge_decompose` 第 5 条"节点数量"+ 第 8 条"覆盖面试主要考察面"，只管"宽度"不管"深度"。

**正确模式**：AI 生成的知识节点必须自带 4 个深度字段，让学习路径本身就是求职资产，而非只是标题清单。

```typescript
// ✅ 正确：knowledge_decompose v4 schema（lib/ai/knowledge.ts）
const nodeSchema = z.object({
  // ... 基础字段
  summary: z.string().describe("一句话知识点摘要"),
  // v4 深度字段（必填，让学习路径节点本身就是求职资产）
  coreMechanism: z.string().describe("核心机制 80-150 字：为什么这样设计、内部发生什么、权衡与适用场景，含量化细节"),
  commonPitfalls: z.array(z.string()).describe("高频踩坑 2-3 条，每条带具体场景与修复方向"),
  interviewAngles: z.array(z.string()).describe("4 题角度提示：概念辨析/原理深挖/实战设计/踩坑对比各一句"),
  sourceHint: z.string().describe("一手来源提示：官方文档/规范/论文/工程博客的名称"),
});

// ✅ 正确：KnowledgeNode 类型字段可选（向后兼容旧 preset）
interface KnowledgeNode {
  // ... 基础字段
  summary: string;
  // v4 深度字段（可选，AI 新生成节点会自带）
  coreMechanism?: string;
  commonPitfalls?: string[];
  interviewAngles?: string[];
  sourceHint?: string;
}
```

```typescript
// ❌ 禁止：knowledge_decompose prompt 不要求深度字段
// （会让 AI 退化到只产 summary 一句话，学习路径就是标题清单）
const system = `你是技术学习专家。拆解知识节点。输出 JSON。`;
```

**守护测试**：
- [content-generation-standard.test.ts](file:///workspace/__tests__/content-generation-standard.test.ts) 守护 `knowledge_decompose` prompt 必须包含 `coreMechanism`/`commonPitfalls`/`interviewAngles`/`sourceHint` 4 个字段标记 + "求职资产" + "缺一不可" + "禁止名词罗列" 三个意图标记
- [preset-content-quality.test.ts](file:///workspace/__tests__/preset-content-quality.test.ts) 守护 preset 节点若带深度字段必须达标（coreMechanism >= 50 字符、commonPitfalls >= 2 条、interviewAngles == 4 条、sourceHint >= 5 字符；且要么 4 个都带要么都不带，防"凑数式"部分补充）
- [prompts.test.ts](file:///workspace/__tests__/prompts.test.ts) 指纹快照守护 prompt 改动留痕

**判断标准**（设计审查时自查）：
- AI 生成的学习路径节点是否自带 coreMechanism/commonPitfalls/interviewAngles/sourceHint 4 个字段？
- 用户看知识树本身（不点进具体题目）能否获取求职级深度？
- preset 答案是否 >= 500 字符且符合四段式宪章（结论与原理/实战案例/举一反三/扣分点对照）？
- 守护测试是否真的在跑（CI green 不等于内容达标，要确认测试覆盖了结构而非只查长度）？

**适用范围**：所有 AI 生成学习路径入口（`lib/ai/knowledge.ts` 的 `decomposeKnowledge` / `lib/ai/plan-generator.ts` 的 `generateLearningPlan` / 任何未来新增的知识拆解入口）+ 所有 preset 答案（手工或策展）。

### 2.14 pre-push 必须跑 4 层门禁（v1，修复"部署失败"连环事故）

**背景**：2026-07-25~27 连续 3 次"代码 push 后 Cloudflare Pages 部署失败"：
1. `layout.tsx` 用 `next/dynamic` + `ssr:false`（Next.js 15 Server Component 限制）
2. 队列改题目维度后测试类型不匹配
3. 删除"今天还没开始"提示后测试断言过期

**根因诊断（卡帕西视角）**：
- `typecheck` 通过 ≠ `build` 通过：Next.js 15 Server Component 不能用 `ssr:false`，tsc 不报错但 `next build` 失败
- `lint` 通过 ≠ `test` 通过：lint 检查代码风格，test 验证行为，删除分支后测试断言过期 lint 发现不了
- 旧 pre-push hook 只跑 `lint + typecheck`，让 build/测试错误漏到 main 分支 → CF Pages 部署失败 → 用户看到旧版本 → 信任崩塌

**正确模式**：pre-push 必须跑 4 层门禁，缺一不可：

```bash
# .husky/pre-push
set -e
npm run lint        # 1. 代码风格 + ESLint 规则
npm run typecheck   # 2. TypeScript 类型检查
npm test            # 3. 全量测试（行为正确性）
npm run build       # 4. Next.js 构建（部署可行性，最关键的一层）
```

**守护测试**：[__tests__/pre-push-hook-guard.test.ts](file:///workspace/__tests__/pre-push-hook-guard.test.ts) 扫描 `.husky/pre-push` 文件，断言 4 层门禁都在，防止未来被误删/降级回只跑 lint+typecheck。

**判断标准**（设计审查时自查）：
- pre-push hook 是否包含 `lint + typecheck + test + build` 4 层？
- 是否有 `set -e`（任一层失败立即终止）？
- 是否有跳过指引（紧急 hotfix 用 `git push --no-verify`）？
- 守护测试是否在跑（防止 hook 被误改）？

**适用范围**：所有 push 到 `main` / `develop` 等受保护分支的操作。

**紧急跳过**：`git push --no-verify`，但必须在 commit message 里说明原因，且事后补跑门禁。

---

## 3. 测试与质量门禁

### 3.1 提交前必跑

```bash
npm run typecheck       # TypeScript 类型检查
npm run lint            # ESLint (--max-warnings 0)
./node_modules/.bin/vitest run   # 全量测试（必须 100% 通过）
```

### 3.2 守护测试清单

| 测试文件 | 守护内容 |
|---|---|
| [__tests__/no-native-form-elements.test.ts](file:///workspace/__tests__/no-native-form-elements.test.ts) | `components/ui/` 之外禁止原生表单元素 |
| [__tests__/ui-design-system-guard.test.ts](file:///workspace/__tests__/ui-design-system-guard.test.ts) | 浅色 utility 必须带 `dark:` 配对；禁止 `text-[Npx]` 逃逸值 |
| [__tests__/content-generation-standard.test.ts](file:///workspace/__tests__/content-generation-standard.test.ts) | 内容生成 prompt 必须注入四段式宪章/四角度/正确性完整性/深度字段约束 |
| [__tests__/preset-content-quality.test.ts](file:///workspace/__tests__/preset-content-quality.test.ts) | preset 答案 >= 500 字符、无占位符、keyPoints/followUps 必填、深度字段达标 |
| [__tests__/prompts.test.ts](file:///workspace/__tests__/prompts.test.ts) | prompt 版本指纹快照（改 prompt 必须 bump version + 同步 hash） |

**新增设计规则时，应同时新增对应的守护测试**。规则没有测试守护等于不存在。

### 3.3 测试即文档

测试名应该描述规则：
```tsx
it("不允许在 components/ui/ 之外使用原生 <input>/<select>/<textarea>/<button>", () => { ... });
it("浅色 utility 必须带 dark: 配对", () => { ... });
```

### 3.4 多轮深度审计

里程碑 / 重大版本发布前 / 定期执行多轮深度审计，流程规范见 [docs/code-audit-methodology.md](file:///workspace/docs/code-audit-methodology.md)。

**三层质量护栏**：
1. **预防**（编码规范）：AGENTS.md 第 2 节 + ui-design-system.md — 写代码前
2. **检测**（守护测试）：`__tests__/*-guard.test.ts` — 每次 commit
3. **审计**（深度扫描）：code-audit-methodology.md — 里程碑 / 定期

三层缺一不可：没有预防 → 缺陷流入代码；没有检测 → 缺陷流入 main；没有审计 → 累积技术债。

---

## 4. 代码风格

### 4.1 TypeScript

- 严格模式（`strict: true`）
- 禁止 `any`，用 `unknown` + 类型守卫
- 优先 `interface`，扩展用 `extends`，联合类型用 `type`
- 所有公共函数和组件 props 必须有显式类型

### 4.2 React

- 组件用 `forwardRef`（除非是页面级组件）
- 状态优先用 `useState`，跨组件用 Context
- 副作用用 `useEffect`，清理函数必须返回
- 列表 `key` 用稳定 id，不用 index

### 4.3 命名

- 组件：`PascalCase`（如 `CurrentTaskCard`）
- 函数/变量：`camelCase`（如 `handleClick`）
- 常量：`UPPER_SNAKE_CASE`（如 `KEY_PREFIXES`）
- 类型：`PascalCase`（如 `Question`）
- 文件名：组件文件 `PascalCase.tsx`，工具文件 `kebab-case.ts`

### 4.4 注释

- 文件头必须有注释，说明组件用途和设计思路
- 复杂逻辑必须有行内注释
- 设计决策（如重大架构选择）写在文件头
- **禁止**仅复述代码的注释（如 `// 设置 state`）

---

## 5. Git 规范

### 5.1 Commit message

用 [Conventional Commits](https://www.conventionalcommits.org/) 格式：

```
<type>(<scope>): <subject>

<body>
```

`type` 取值：
- `feat`：新功能
- `fix`：bug 修复
- `refactor`：重构（无功能变化）
- `style`：样式调整
- `docs`：文档
- `test`：测试
- `chore`：杂项（构建 / 依赖）

### 5.2 分支

- `main`：生产分支，受保护
- 功能开发：从 `main` 切出，PR 合回 `main`

### 5.3 提交粒度

- 一次 commit 解决一个问题
- 不要在一个 commit 里混合多个无关改动
- 大改动拆成多个小 commit（便于 review 和 revert）

---

## 6. 安全规范

详见 [docs/DEVELOPMENT.md](file:///workspace/docs/DEVELOPMENT.md) 安全配置章节。关键点：

- `MASTER_KEY` 是加密会话根密钥，必须配置
- API Key 通过加密 session 传输，不直接暴露
- 旧用户首次访问检测：有 `modelConfig.apiKey` 但无 session → 显示升级提示
- 提供「登出所有设备」按钮调 `revokeSession` 吊销 session

---

## 7. 部署

- 平台：Cloudflare Pages
- 命令：`npm run build`
- 环境变量：`MASTER_KEY`（必配）、`NEXT_PUBLIC_VAPID_PUBLIC_KEY`（推送通知，可选）

---

## 8. 违反守则的后果

| 违反项 | 后果 |
|---|---|
| 用原生表单元素 | `no-native-form-elements.test.ts` 失败 → CI red |
| 浅色 utility 缺 dark 配对 | `ui-design-system-guard.test.ts` 失败 → CI red |
| 用 `text-[10px]` 逃逸值 | `ui-design-system-guard.test.ts` 失败 → CI red |
| 手写 div 模态 | 代码评审打回（暂无测试守护，未来补） |
| 折叠按钮缺 aria-expanded | 代码评审打回（暂无测试守护） |
| emoji 当功能图标 | 代码评审打回（暂无测试守护） |
| absolute 浮层覆盖画布内容（见 2.11） | 代码评审打回（暂无测试守护，需自查窄屏 + 浮层重叠） |
| 跳转不带场景参数（见 2.12） | 代码评审打回（暂无测试守护，需自查交互闭环） |
| 学习路径节点缺深度字段（见 2.13） | `content-generation-standard.test.ts` 失败（缺 prompt 约束标记）→ CI red |
| preset 节点深度字段凑数（见 2.13） | `preset-content-quality.test.ts` 失败（字段不达标或不一致）→ CI red |
| AI 生成内容删除/削弱质量宪章约束（见第 9 节） | `content-generation-standard.test.ts` 失败 → CI red |
| AI 生成内容含占位符 / 裸答案 / 孤儿题（见第 9 节） | `preset-content-quality.test.ts` 失败 → CI red |
| 改 prompt 不 bump version（见第 9 节） | `prompts.test.ts` 指纹快照失败 → CI red |

---

## 9. AI 内容生成规范（知识点 / 题目 / 答案）

**强制规范全文**：[docs/content-generation-standard.md](file:///workspace/docs/content-generation-standard.md)。
所有 AI 生成知识库内容（运行时生成 + 策展轨道批量生产 + 任何未来入口）必须遵守。核心：

1. **答案四段式宪章**：结论与原理（含量化细节）→ 实战案例（第一人称 + 至少 2 个具体数字 + 踩坑修复过程）→ 举一反三（场景推广/工程经验映射）→ 扣分点对照（背题 vs 真做过）。禁止名词罗列、教科书定义堆砌、无数字空洞案例、无前提经验值。
2. **题目四角度**：概念辨析 / 原理深挖 / 实战设计 / 踩坑对比；题面具体有场景，禁止泛泛题。
3. **知识点正确性/完整性**：事实可被一手来源佐证；经验值标注适用条件；高频考点不得遗漏；依赖闭环。
4. **运行时注入点**：`lib/ai/prompts.ts` 的 `ANSWER_QUALITY_CHARTER` / `QUESTION_ANGLE_RULES` 常量注入 4 个生成 prompt（`knowledge_decompose` / `question_generate` / `question_stem_generate` / `answer_generate`）。修改 prompt 必须 bump version（指纹快照强制）。
5. **守护测试**：[__tests__/content-generation-standard.test.ts](file:///workspace/__tests__/content-generation-standard.test.ts) 守护约束在位；[__tests__/preset-content-quality.test.ts](file:///workspace/__tests__/preset-content-quality.test.ts) 守护产物质量。

---

## 10. 更新本文件

本文件是活文档。新增设计规则、组件、令牌时，**必须**同步更新本文件和 [docs/ui-design-system.md](file:///workspace/docs/ui-design-system.md)。

**规则没有文档等于不存在，文档没有测试守护等于建议。**
