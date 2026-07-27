# 项目教学化 Skill + devpath-ai 教程设计

> **日期**：2026-07-27
> **状态**：待用户审查
> **作者**：brainstorming 流程产出
> **范围**：两个产物 — (1) 可复用的 `build-project-tutorial` skill；(2) 在 devpath-ai 上执行该 skill 的等价流程产出的 12 章教程
> **依赖文档**：[AGENTS.md](file:///workspace/AGENTS.md) / [docs/ARCHITECTURE.md](file:///workspace/docs/ARCHITECTURE.md) / [docs/DEVELOPMENT.md](file:///workspace/docs/DEVELOPMENT.md) / [docs/PRODUCT.md](file:///workspace/docs/PRODUCT.md) / [devpath-ai-redesign.md](file:///workspace/devpath-ai-redesign.md) / [.trae/skills/update-docs/SKILL.md](file:///workspace/.trae/skills/update-docs/SKILL.md)

---

## 0. 背景与目标

### 0.1 用户诉求

把 devpath-ai 项目当作教学教程，手把手教学生一个项目从立项到部署的全流程。重点：
- **技术选型时的详细调研对比**（不只是"用了什么"，而是"为什么用这个，对比过哪些 alternatives"）
- **具体实现时遇到的技术决策对比选择**（不只是"怎么实现"，而是"当时有哪些方案，为什么选这个"）
- **全流程覆盖**：立项 → 需求分析 → 产品设计 → 技术选型 → 规范约束 → 代码实现 → 迭代更新 → 发布部署
- **可复用**：把整理过程写成一个 skill，方便在其他项目做相同工作

### 0.2 受众

**初学者（学过 React 基础）**：
- 学过 JS / React 基础，没做过生产项目
- 需要解释每个技术对比项的基础概念
- 需要解释"为什么这个选择比那个好"
- 重点在"教会怎么做技术决策"（方法论可迁移）

### 0.3 目标

1. 产出可复用的 `build-project-tutorial` skill（项目无关方法论）
2. 在 devpath-ai 上执行该 skill 的等价流程，产出 12 章 + appendix 的完整教程
3. 教程与 skill 互为印证：skill 是方法论，tutorial 是参考实现
4. 用户规则遵循：产品设计章节用乔布斯视角，技术架构章节用卡帕西视角

### 0.4 非目标

- **不重写现有文档**：README / ARCHITECTURE / DEVELOPMENT / PRODUCT 等保持不变，tutorial 引用它们
- **不修改代码**：本任务只产出文档与 skill 文件
- **不补全 git 历史**：git log 不可用（仓库被压缩），迭代史基于 specs/plans 重建
- **不覆盖守护测试**：本任务不触发守护测试（只新增 docs/ 和 .trae/skills/ 下的文件）

---

## 1. 两个产物概述

| 维度 | Skill | Tutorial |
|---|---|---|
| 性质 | 方法论 / 流程 / 模板 | 具体内容 / 参考实现 |
| 项目相关性 | 无关（任意项目可跑） | devpath-ai 特定 |
| 输入 | 任意代码仓库 | devpath-ai 仓库 |
| 输出 | checklist + 章节骨架 | 完整章节内容 |
| 复用性 | 多次复用 | 一次性 |
| 文件位置 | `.trae/skills/build-project-tutorial/SKILL.md` | `docs/tutorial/` |

### 1.1 整体架构图

```
┌─────────────────────────────────────────────────────────────┐
│  Skill（方法论，项目无关）                                       │
│  .trae/skills/build-project-tutorial/SKILL.md                │
│  职责：定义"把任意项目教学化"的两阶段流程                          │
│  Phase 1: 扫描项目 → 生成 checklist → 用户确认                  │
│  Phase 2: 按确认后的 checklist 产出章节                          │
└──────────────────┬──────────────────────────────────────────┘
                   │ 参考实现（互为印证）
                   ▼
┌─────────────────────────────────────────────────────────────┐
│  Tutorial（应用，devpath-ai 特定）                               │
│  docs/tutorial/                                              │
│  ├── README.md（主入口 + 学习路径 + 索引）                       │
│  ├── 00-overview.md   项目全景与学习目标                         │
│  ├── 01-initiation.md 立项与背景                                │
│  ├── 02-requirements.md 需求分析                                │
│  ├── 03-product-design.md 产品设计（乔布斯视角）                 │
│  ├── 04a-tech-frontend.md   技术选型：前端（含对比表）           │
│  ├── 04b-tech-backend.md    技术选型：后端与存储（含对比表）     │
│  ├── 04c-tech-ai.md         技术选型：AI 集成（含对比表）        │
│  ├── 04d-tech-deployment.md 技术选型：部署与 CI/CD（含对比表）   │
│  ├── 05-standards.md 规范约束制定                                │
│  ├── 06-implementation.md 代码实现（含技术决策对比）              │
│  ├── 07-iteration.md 迭代更新（重建 + 反思）                    │
│  ├── 08-deployment.md 发布部署                                  │
│  ├── 09-retrospective.md 总结与延伸                              │
│  └── appendix/                                                │
│      ├── tech-decision-cards.md  技术决策卡片                   │
│      ├── pitfalls.md             踩坑记录                       │
│      └── glossary.md            术语表（初学者友好）             │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. Skill 设计

### 2.1 设计哲学

**Skill 是项目无关的方法论**，不依赖 devpath-ai 的任何特定结构。它定义"把任意项目教学化"的标准流程，包含：
- 扫描模板（哪些文件 / 目录 / 配置要看）
- checklist 生成规则（按 SDLC 阶段组织）
- 章节产出指令（每章写什么、深度策略、视角选择）
- 质量校验（章节完整性、引用准确性、初学者友好度）

### 2.2 两阶段流程

```
Phase 1: 扫描 + 生成 checklist + 用户确认
    │
    ├─ 1.1 扫描项目元信息（package.json / README / 目录结构）
    ├─ 1.2 扫描文档清单（docs/ / README / AGENTS 等）
    ├─ 1.3 扫描 specs / plans 历史（.trae/specs/ / docs/superpowers/）
    ├─ 1.4 扫描技术栈（dependencies / config files）
    ├─ 1.5 扫描规范约束（AGENTS.md / 守护测试 / ESLint config）
    ├─ 1.6 扫描 CI/CD（.github/workflows/ / wrangler.toml）
    ├─ 1.7 扫描代码实现关键文件（lib/ / app/ / components/）
    │
    ├─ 1.8 生成 checklist（按 SDLC 9 阶段 + appendix 组织）
    │      每项含：章节 / 主题 / 数据源 / 深度策略 / 视角
    │
    └─ 1.9 用户确认 checklist（可增删 / 调整深度 / 调整顺序）
           ↓ 用户批准
Phase 2: 按确认后的 checklist 产出章节
    │
    ├─ 2.1 创建 docs/tutorial/ 目录结构
    ├─ 2.2 按章节顺序产出（每章独立文件）
    │      每章含：前置知识 / 本章学什么 / 学习目标 / 正文 / 小结 / 下一章衔接
    ├─ 2.3 产出主入口 README.md（学习路径 + 索引）
    ├─ 2.4 产出 appendix（技术决策卡片 / 踩坑 / 术语表）
    ├─ 2.5 一致性校验（数字 / 引用 / 术语）
    └─ 2.6 提交并推送（遵循 user_rules：同步到用户选择的远程分支）
```

### 2.3 Skill 文件结构

单个 SKILL.md 文件，遵循 `.trae/skills/update-docs/SKILL.md` 的格式：

```markdown
---
name: build-project-tutorial
description: 把任意项目教学化，产出可复用的教程文档。两阶段流程：扫描项目 → 生成 checklist → 用户确认 → 按章节产出。覆盖立项到部署全 SDLC，含技术选型对比表、迭代史重建、踩坑记录。用户说"把这个项目变成教程" / "教学化" / "build project tutorial" 时执行。
---

# build-project-tutorial — 项目教学化 Skill

> 用途：把任意代码仓库转化为面向初学者的教学教程...
> 触发：用户说"把这个项目变成教程" / "教学化" / "write project tutorial" 等...
> 范围：产出 docs/tutorial/ 目录 + 主入口 README.md...

## Step 1: 扫描项目元信息
...（具体命令模板）

## Step 2: 扫描文档清单
...

## Step 9: 生成 checklist
...

## Step 10: 用户确认
...

## Step 11-20: 按章节产出
...

## 注意事项
1. 不依赖记忆，所有数字必须实时扫描
2. 不重写现有文档，tutorial 引用它们
3. 视角策略：产品设计用乔布斯视角，技术架构用卡帕西视角
4. 初学者友好：每个术语首次出现时解释
...
```

### 2.4 Skill 关键设计决策

1. **两阶段而非一次跑完**：用户在 Phase 1 末确认 checklist，可调整深度 / 顺序 / 增删章节。质量更高，符合"教学叙事需要人工把关"的本质。
2. **扫描模板用命令而非记忆**：所有数字（测试数 / 节点数 / preset 数）必须用 shell 命令实时扫描，不能凭印象写（借鉴 update-docs skill 的原则）。
3. **章节按 SDLC 阶段切分**：学生学的是"项目怎么从 0 到 1 搭起来"，按阶段切符合教学逻辑。
4. **技术选型章节按层拆分**：前端 / 后端存储 / AI / 部署 4 章，避免单章过长（用户决策）。
5. **迭代史基于 specs/plans 重建**：git log 不可用时，从 .trae/specs/ + docs/superpowers/ + redesign.md 重建时间线。
6. **视角策略内嵌**：每章产出指令明确标注视角（乔布斯 / 卡帕西 / 双视角）。
7. **appendix 容纳溢出内容**：技术决策卡片 / 踩坑 / 术语表，正文过长时拆到这里。

---

## 3. Tutorial 结构

### 3.1 章节清单（12 章 + 3 appendix）

| # | 文件 | 职责 | 视角 | 深度策略 |
|---|---|---|---|---|
| 00 | `00-overview.md` | 项目全景 + 学习目标 + 阅读路径 | 双视角 | 中等：定位 / 适合谁 / 学完能做什么 / 阅读建议 |
| 01 | `01-initiation.md` | 立项背景 / 要解决的问题 / 目标用户 | 乔布斯 | 中等：问题陈述 / 用户画像 / 三个核心矛盾 |
| 02 | `02-requirements.md` | 需求分析 / 功能性 + 非功能性需求 | 双视角 | 中等：4 矛盾 → 4 层架构 / 用户故事 / 约束条件 |
| 03 | `03-product-design.md` | 产品设计 / L1-L4 四层架构 / 6 条产品原则 | 乔布斯 | 深入：四层架构 / 6 原则 / 与竞品差异 / 设计哲学 |
| 04a | `04a-tech-frontend.md` | 技术选型：前端 | 卡帕西 | 深入：5 个决策点深对比表 |
| 04b | `04b-tech-backend.md` | 技术选型：后端与存储 | 卡帕西 | 深入：5 个决策点深对比表 |
| 04c | `04c-tech-ai.md` | 技术选型：AI 集成 | 卡帕西 | 深入：5 个决策点深对比表 |
| 04d | `04d-tech-deployment.md` | 技术选型：部署与 CI/CD | 卡帕西 | 深入：5 个决策点深对比表 |
| 05 | `05-standards.md` | 规范约束 / AGENTS.md / 三层质量护栏 | 卡帕西 | 深入：13 条 UI 规则 / 守护测试清单 / 设计令牌 |
| 06 | `06-implementation.md` | 代码实现 / 关键模块 / 技术决策对比 | 卡帕西 | 深入：6 个核心模块的实现决策 + 代码片段 |
| 07 | `07-iteration.md` | 迭代史重建 + 反思 | 双视角 | 深入：7 specs + 9 plans 时间线 + redesign 反思 |
| 08 | `08-deployment.md` | 发布部署 / Cloudflare Pages / CI/CD | 卡帕西 | 中等：部署流程 / Secrets / KV 配置 / 域名 |
| 09 | `09-retrospective.md` | 总结与延伸 / 学到了什么 / 下一步 | 双视角 | 中等：方法论总结 / 可迁移经验 / 延伸阅读 |
| A1 | `appendix/tech-decision-cards.md` | 20 个技术决策卡片 | 卡帕西 | 简略：每卡 1 张表（决策 / 选项 / 理由） |
| A2 | `appendix/pitfalls.md` | 踩坑记录 | 双视角 | 简略：每坑 1 段（现象 / 根因 / 修复） |
| A3 | `appendix/glossary.md` | 术语表 | - | 简略：每术语 1 句解释 + 链接 |

### 3.2 每章结构模板

```markdown
# 第 X 章：[章节标题]

> **视角**：[乔布斯 / 卡帕西 / 双视角]
> **前置知识**：[学生应先学什么]
> **本章学什么**：[3-5 个学习目标]
> **预计阅读时间**：[X 分钟]
> **关联文档**：[引用现有文档清单]

---

## X.1 [小节标题]
[正文内容，含对比表 / 代码片段 / 图表]

## X.2 [小节标题]
...

---

## 本章小结
- 学到了什么（3-5 个要点）
- 关键决策回顾（2-3 个）

## 下一章衔接
[1 段话引出下一章]

## 延伸阅读
- [外部资源链接]
- [项目内文档链接]
```

### 3.3 代码示例策略

- **贴关键片段，不贴大段代码**：每段代码 ≤ 30 行，超过则拆分或链接到源文件
- **用 file:// 链接引用源文件**：遵循 AGENTS.md 的 Code Reference 规则，如 [lib/fsrs.ts](file:///workspace/lib/fsrs.ts)
- **关键决策贴"对比代码"**：如"用 Modal vs 手写 div 模态"的对比
- **不让学生跟着改代码**：本教程是"读懂项目"而非"重建项目"

### 3.4 与现有文档的关系

**教学叙事 + 引用现有文档**：
- Tutorial 重新组织现有文档的内容为学生可理解的顺序
- 重点在"为什么这么设计"而不是"是什么"
- 每章开头明确引用现有文档（如"本章基于 ARCHITECTURE.md 第 3 节，详见..."）
- 不复制现有文档全文，只摘录关键片段 + 链接

引用示例：
```markdown
> 本章基于 [docs/ARCHITECTURE.md](file:///workspace/docs/ARCHITECTURE.md) 第 3 节"数据流"，
> 重点关注"为什么这样设计数据流"而非"数据流是什么"。完整数据流图见原文档。
```

### 3.5 视角策略

遵循 user_rules："产品设计和优化时站在乔布斯角度；技术架构和优化时站在卡帕西角度"。

| 章节 | 视角 | 视角体现 |
|---|---|---|
| 00-overview | 双视角 | 乔布斯讲"为什么学这个项目"，卡帕西讲"技术全景" |
| 01-initiation | 乔布斯 | 聚焦 / 少即是多 / 真实场景驱动 |
| 02-requirements | 双视角 | 乔布斯讲用户矛盾，卡帕西讲非功能约束 |
| 03-product-design | 乔布斯 | 6 条产品原则 / 设计哲学 / 与竞品差异 |
| 04a-d tech-* | 卡帕西 | 系统思维 / 第一性原理 / 权衡分析 |
| 05-standards | 卡帕西 | 契约层优先 / 测试即文档 / 单一事实源 |
| 06-implementation | 卡帕西 | 关注点分离 / 纯函数 / 不可变数据 |
| 07-iteration | 双视角 | 乔布斯讲"做错了什么"，卡帕西讲"架构如何演化" |
| 08-deployment | 卡帕西 | Edge Runtime / 零信任 / 成本控制 |
| 09-retrospective | 双视角 | 方法论总结 + 可迁移经验 |

---

## 4. 技术对比清单（20 个决策点）

按 4 类组织，每类 5 个决策点。每个决策点做 3-5 选项的深对比表。

### 4.1 前端技术选型（04a-tech-frontend.md，5 个决策点）

| # | 决策点 | 对比选项 | 项目实际选择 |
|---|---|---|---|
| F1 | 框架 | Next.js 15 / Remix / Vite + React Router / Astro | Next.js 15 App Router |
| F2 | UI 样式方案 | Tailwind CSS / CSS-in-JS (styled-components) / CSS Modules / Vanilla Extract | Tailwind CSS 3.4 |
| F3 | 状态管理 | useState + Context / Redux Toolkit / Zustand / Jotai | useState + Context（轻量） |
| F4 | 表单组件策略 | 原生 HTML + 守护测试 / 统一组件库 / Headless UI 库 (Radix) / shadcn/ui | 统一组件库 + 守护测试 |
| F5 | 图表库 | Recharts / Chart.js / D3.js / Visx / 自绘 SVG | Recharts（懒加载） |

### 4.2 后端与存储技术选型（04b-tech-backend.md，5 个决策点）

| # | 决策点 | 对比选项 | 项目实际选择 |
|---|---|---|---|
| B1 | 本地存储 | IndexedDB (Dexie) / localStorage / SQLite (WASM) / OPFS | IndexedDB + Dexie |
| B2 | 云端存储 | Cloudflare KV / Supabase / Firebase / PlanetScale (MySQL) / Turso (SQLite) | Cloudflare KV |
| B3 | 数据同步策略 | 全量备份 / 增量同步 (updatedAt 索引) / CRDT / 实时同步 | 增量同步 + LWW |
| B4 | API 路由模式 | Next.js API Routes / Edge Functions / Pages Functions / 独立后端 | Next.js API Routes (Edge) |
| B5 | 数据校验 | Zod / Yup / Joi / Valibot / 手写类型守卫 | Zod |

### 4.3 AI 集成技术选型（04c-tech-ai.md，5 个决策点）

| # | 决策点 | 对比选项 | 项目实际选择 |
|---|---|---|---|
| A1 | AI SDK | Vercel AI SDK / LangChain.js / LlamaIndex.TS / 直接 fetch | Vercel AI SDK |
| A2 | AI Provider 适配 | @ai-sdk/openai 适配 / 各家原生 SDK / OpenRouter / 自写适配层 | @ai-sdk/openai 适配 |
| A3 | 复习算法 | ts-fsrs (FSRS-4.5) / SuperMemo-2 / Anki 算法 / 自写 SM-2 | ts-fsrs 4.5 |
| A4 | 向量搜索 | Workers AI (BGE) / Transformers.js / OpenAI Embeddings / Pinecone / 自建 | Workers AI BGE（构建期预嵌入） |
| A5 | Session 安全 | 明文存 apiKey / Cookie + HttpOnly / 零信任 session (AES-GCM + nonce + HMAC) | 零信任 session |

### 4.4 部署与 CI/CD 技术选型（04d-tech-deployment.md，5 个决策点）

| # | 决策点 | 对比选项 | 项目实际选择 |
|---|---|---|---|
| D1 | 部署平台 | Cloudflare Pages / Vercel / Netlify / AWS Amplify / 自建 | Cloudflare Pages |
| D2 | 运行时 | Edge Runtime / Node.js / Deno / Bun | Edge Runtime + nodejs_compat |
| D3 | CI/CD | GitHub Actions / GitLab CI / CircleCI / Jenkins / Drone | GitHub Actions |
| D4 | 测试框架 | Vitest / Jest / Bun test / Node test runner | Vitest 1.6 |
| D5 | PWA 策略 | 无 PWA / Service Worker (stale-while-revalidate) / Workbox / 自写 SW | 自写 SW + Web Push |

### 4.5 对比表模板

每个决策点用统一的对比表格式：

```markdown
### F1. 框架选型：Next.js 15 vs Remix vs Vite

**决策**：选择 Next.js 15 App Router

**背景**：[为什么需要这个决策，2-3 句话]

**对比**：

| 维度 | Next.js 15 | Remix | Vite + React Router | Astro |
|---|---|---|---|---|
| SSR/SSG | ✅ App Router 全栈 | ✅ Loader/Action | ❌ 需额外配置 | ✅ Islands |
| Edge Runtime | ✅ 原生支持 | ✅ 支持 | ❌ | ✅ 支持 |
| API Routes | ✅ 内置 | ✅ Loader/Action | ❌ 需额外 | ✅ Endpoints |
| 生态成熟度 | ✅ 最大 | 中 | 大（React 生态） | 中 |
| 学习曲线 | 中（App Router 新） | 低 | 低 | 中 |
| Cloudflare 兼容 | ✅ next-on-pages | ✅ 直接 | ✅ 直接 | ✅ 直接 |

**选择理由**（卡帕西视角）：
1. App Router 的 Server Component + Client Component 边界清晰，适合"骨架屏 SSR + 交互 CSR"模式
2. next-on-pages 适配 Cloudflare Pages Edge Runtime，零冷启动
3. 生态最大，遇到问题可参考资料多
4. API Routes 内置，无需额外后端

**代价**：
- App Router 较新，部分文档滞后
- next-on-pages 有 3MB bundle 限制（已通过 preset 数据 fetch 化解决）
- Edge Runtime 限制部分 Node API（需 nodejs_compat flag）

**踩过的坑**：
- preset TS 源文件静态 import 导致 Worker bundle 13MB → 改为运行时 fetch JSON 降到 6.5MB
- 详见 [appendix/pitfalls.md](file:///workspace/docs/tutorial/appendix/pitfalls.md) 的"preset bundle 爆炸"条目
```

---

## 5. 迭代史重建方法

### 5.1 数据源

git log 不可用（仓库被压缩，仅 1 个 commit）。基于以下数据源重建迭代史：

| 数据源 | 数量 | 用途 |
|---|---|---|
| `.trae/specs/*/spec.md` | 7 个 | 每个里程碑的"Why + What Changes" |
| `docs/superpowers/specs/*.md` | 2 个 | brainstorming 产出的设计文档 |
| `docs/superpowers/plans/*.md` | 9 个 | 实施计划（含 Goal / Architecture / 任务清单） |
| `devpath-ai-redesign.md` | 1 个 | 产品诊断与重构设计（第一性原理） |
| `AGENTS.md` 第 2.11-2.13 节 | 3 条 | 反模式根因分析（用户反馈驱动的修复） |

### 5.2 时间线重建

按文件名日期 + spec 内容主题，重建迭代时间线：

| 阶段 | 时间 | 主题 | 数据源 |
|---|---|---|---|
| Phase 0 | 2026-07 早期 | 基础功能搭建（FSRS / 番茄 / 学习计划 / AI 聊天） | 推断（无 spec，从现有代码反推） |
| Phase 1 | 2026-07-16 | 6 项 UX 修复（全屏分享 / 学习入口路由 / 个人页布局 / 分享 token / 用户名脱敏 / 仪表盘重构） | 6 个 plans（2026-07-16-*） |
| Phase 2 | 2026-07-19 | UI 全面体检 + 统一表单组件 | ui-health-check-report + unify-all-form-components |
| Phase 3 | 2026-07-20 | 乔布斯视角产品重构 V1 | jobsian-product-redesign.md |
| Phase 4 | 2026-07-21 | 乔布斯视角产品重构 V2（基于最新系统状态） | jobsian-product-redesign-v2.md |
| Phase 5 | 2026-07-22 | 知识库向量化设计 | knowledge-vector-search-design.md |
| Phase 6 | 2026-07-23 | UI 重构 + 学习页重写 | ui-redesign-and-learning-page-rework-design.md |
| Phase 7 | 2026-07-2x | UX 大修 + 学习流程重构 | ux-overhaul-and-learning-flow-rework spec |
| Phase 8 | 2026-07-2x | React 死循环修复 + 架构加固 | fix-react-loop-and-arch-hardening spec |
| Phase 9 | 2026-07-2x | ESLint 本地门禁 + apiKey Session 安全 | eslint-and-apikey-security-overhaul spec |
| Phase 10 | 2026-07-2x | 质量门禁 + 学习/复习体验重做 | quality-gate-and-ux-rework spec |
| Phase 11 | 2026-07-2x | 智能化学习系统扩展（番茄 / 画像 / 优先级 / 节奏 / Persona / 成就） | smart-learning-expansion spec |
| Phase 12 | 2026-07-2x | 聊天重设计 + 标题布局修复 | chat-redesign-and-title-layout spec |
| Phase 13 | 2026-07-2x | AI 工具修复 + 多项体验打磨 | ai-tool-fix-and-ux-polish spec |
| Phase 14 | 2026-07-27 | 知识库去重 + 内容质量加固 | 最新 commit + AGENTS.md 2.13 |

### 5.3 反思章节结构

每阶段在 `07-iteration.md` 中的结构：

```markdown
### 7.X [阶段名]（[时间]）

**做了什么**：[1-2 句话总结]

**为什么做**：[根因 / 用户反馈 / 架构债]

**关键决策**：
- [决策 1]：[选择 + 理由]
- [决策 2]：[选择 + 理由]

**学到了什么**：
- [教训 1]
- [教训 2]

**如果重写会怎么做**（反思）：
- [改进点 1]
- [改进点 2]

**关联 spec/plan**：[链接]
```

### 5.4 反思的来源

`devpath-ai-redesign.md` 已包含完整的"如果重写会怎么做"内容，直接引用：
- 第一部分"现状诊断"→ 各阶段的"做错了什么"
- 第二部分"第一性原理"→ 方法论反思
- 第五部分"落地路线图"→ 改进方向

---

## 6. 实施计划

### 6.1 产出顺序

1. **先产出 Skill 文件**（`.trae/skills/build-project-tutorial/SKILL.md`）
   - 定义两阶段流程
   - 包含扫描模板 / checklist 生成规则 / 章节产出指令
   - 项目无关，可复用

2. **再产出 Tutorial**（按章节顺序）
   - Phase 1 已完成（本次 brainstorming 已扫描项目）
   - 直接进入 Phase 2：按确认后的 checklist 产出章节
   - 顺序：00 → 01 → 02 → 03 → 04a → 04b → 04c → 04d → 05 → 06 → 07 → 08 → 09 → appendix

3. **最后产出主入口 README.md**
   - 学习路径索引
   - 章节链接
   - 阅读建议

### 6.2 章节产出策略

- **并行产出不可行**：章节间有引用关系（如 04a 引用 03 的产品设计），需顺序产出
- **分批产出**：每批 3-4 章，避免单次输出过长导致质量下降
- **每章产出后自检**：前置知识 / 学习目标 / 小结 / 下一章衔接 是否完整

### 6.3 一致性校验

产出全部章节后，运行一致性校验：

- 测试用例数（986）在所有引用处一致
- 节点数（49）在所有引用处一致
- preset 数（6）在所有引用处一致
- 文件链接（file:// 格式）可达
- 术语首次出现时有解释
- 视角标注与章节内容一致

### 6.4 提交与推送

遵循 user_rules：
- 涉及文件变动需同步到远程分支（用户选择的分支，非 trae 自动创建）
- 完成后 commit + push，回复是否成功
- commit message 用 Conventional Commits 格式

提交内容：
```
docs(tutorial): 新增项目教学化 skill + devpath-ai 12 章教程

- 新增 .trae/skills/build-project-tutorial/SKILL.md（可复用方法论）
- 新增 docs/tutorial/ 目录（12 章 + 3 appendix）
- 覆盖立项 → 需求 → 产品设计 → 技术选型（4 章）→ 规范 → 实现 → 迭代 → 部署 → 总结
- 含 20 个技术决策点深对比表 + 迭代史重建（7 specs + 9 plans）
- 面向初学者（学过 React 基础），每章含前置知识 / 学习目标 / 小结
```

---

## 7. 产物清单

### 7.1 Skill 文件（1 个）

| 文件 | 行数预估 | 内容 |
|---|---|---|
| `.trae/skills/build-project-tutorial/SKILL.md` | 400-500 | 两阶段流程 + 扫描模板 + checklist 生成 + 章节产出指令 |

### 7.2 Tutorial 文件（16 个）

| 文件 | 行数预估 | 内容 |
|---|---|---|
| `docs/tutorial/README.md` | 150-200 | 主入口 + 学习路径 + 索引 |
| `docs/tutorial/00-overview.md` | 200-250 | 项目全景 + 学习目标 |
| `docs/tutorial/01-initiation.md` | 250-300 | 立项背景 |
| `docs/tutorial/02-requirements.md` | 300-350 | 需求分析 |
| `docs/tutorial/03-product-design.md` | 400-500 | 产品设计（乔布斯视角） |
| `docs/tutorial/04a-tech-frontend.md` | 500-600 | 前端选型（5 决策点对比表） |
| `docs/tutorial/04b-tech-backend.md` | 500-600 | 后端存储选型（5 决策点对比表） |
| `docs/tutorial/04c-tech-ai.md` | 500-600 | AI 集成选型（5 决策点对比表） |
| `docs/tutorial/04d-tech-deployment.md` | 500-600 | 部署 CI/CD 选型（5 决策点对比表） |
| `docs/tutorial/05-standards.md` | 400-500 | 规范约束 |
| `docs/tutorial/06-implementation.md` | 500-600 | 代码实现 |
| `docs/tutorial/07-iteration.md` | 600-800 | 迭代史（14 阶段 + 反思） |
| `docs/tutorial/08-deployment.md` | 250-300 | 发布部署 |
| `docs/tutorial/09-retrospective.md` | 250-300 | 总结与延伸 |
| `docs/tutorial/appendix/tech-decision-cards.md` | 300-400 | 20 个技术决策卡片 |
| `docs/tutorial/appendix/pitfalls.md` | 200-300 | 踩坑记录 |
| `docs/tutorial/appendix/glossary.md` | 150-200 | 术语表 |

**总预估**：6,000-8,000 行 markdown，约 30,000-50,000 字。

### 7.3 不产出的文件

- 不修改 README.md / ARCHITECTURE.md / DEVELOPMENT.md / PRODUCT.md（现有文档保持不变）
- 不修改 AGENTS.md（守护规则保持不变）
- 不修改代码 / 测试 / 配置文件
- 不创建新的守护测试（本任务是文档产出，不引入新规则）

---

## 8. 风险与对策

| 风险 | 对策 |
|---|---|
| Tutorial 篇幅过长（预估 30K-50K 字） | 分批产出，每批 3-4 章；appendix 容纳溢出内容 |
| 技术对比表信息密度高，初学者看不懂 | 每个对比表前加"基础概念"小节；术语首次出现时解释 |
| 迭代史基于 specs/plans 重建，可能遗漏未文档化的决策 | 在 07-iteration.md 开头声明"基于 specs/plans 重建，非 git log"；标注"推断"部分 |
| 引用现有文档的链接失效（文档后续更新） | 用相对路径 + file:// 双重链接；产出后运行链接校验 |
| Skill 过拟合 devpath-ai（在别的项目跑不通） | Skill 用通用扫描命令（package.json / docs/ / .github/），不依赖 devpath-ai 特定路径 |
| 章节间引用不一致（如测试数 986 在不同章节不同） | 产出后运行一致性校验（grep 关键数字） |
| 视角标注与内容不符 | 每章产出时明确标注视角；自检时核对 |

---

## 9. 成功标准

实施完成后，以下标准必须全部满足：

- [ ] Skill 文件可被 Trae 识别（frontmatter 格式正确）
- [ ] Skill 在 devpath-ai 上可跑（扫描命令真实可执行）
- [ ] Tutorial 12 章 + 3 appendix 全部产出
- [ ] 每章含前置知识 / 学习目标 / 小结 / 下一章衔接
- [ ] 20 个技术决策点全部有深对比表
- [ ] 迭代史 14 阶段全部覆盖 + 反思
- [ ] 初学者友好（术语首次出现时解释）
- [ ] 视角标注正确（乔布斯 / 卡帕西 / 双视角）
- [ ] 引用现有文档（不重写）
- [ ] 一致性校验通过（数字 / 链接 / 术语）
- [ ] 提交并推送到远程分支

---

## 10. 后续步骤

1. **用户审查本 spec**（当前阶段）
2. 用户批准后，调用 `writing-plans` skill 产出详细实施计划
3. 按实施计划分批产出 Skill + Tutorial 文件
4. 一致性校验 + 提交推送
