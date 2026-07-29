# 第 0 章：项目全景与学习目标

> **视角**：双视角（乔布斯讲"为什么学这个项目"，卡帕西讲"技术全景"）
> **前置知识**：学过 React 基础（组件 / props / state / hooks），了解 HTML / CSS / JS 基本语法
> **本章学什么**：
> 1. devpath-ai 是什么、解决什么问题
> 2. 项目当前规模与技术栈全景
> 3. 学完本教程你能做什么
> 4. 推荐的学习路径与阅读建议
> **预计阅读时间**：15 分钟
> **关联文档**：[README.md](file:///workspace/README.md) / [docs/PRODUCT.md](file:///workspace/docs/PRODUCT.md) / [docs/ARCHITECTURE.md](file:///workspace/docs/ARCHITECTURE.md)

---

## 0.1 devpath-ai 是什么

**一句话定位**：devpath-ai 是把自学者变成能独立交付 AI 产品的工程师的转型系统。

不是学习工具，是身份转变。学习只是过程，能交付才是结果。

更具体地说，devpath-ai 是一个面向自学开发者的**本地优先 PWA**（Progressive Web App，渐进式 Web 应用）：
- 数据存在浏览器的 IndexedDB（本地数据库），不会主动上传到任何服务器
- 可选同步到 Cloudflare KV（云端键值存储）
- AI 调用走云端（用户自带 API Key 走零信任加密 session，或用服务端 Trial 模式按场景配额免费试用）
- 生产链接：<https://devpath-ai.pages.dev/>

**目标用户**：前端工程师 → AI 全栈 / AI Agent 工程师。旗舰路径已策展（49 节点 / 196 题 / 5 阶段 16-20 周）。

---

## 0.2 项目当前规模

读完本教程你会理解一个真实生产项目的全貌。先看几个关键数字：

| 维度 | 数字 | 含义 |
|---|---|---|
| 测试用例 | **1035 个**（92 个测试文件） | 1035 行为都被测试守护，改代码不怕破坏 |
| 技能节点 | **49 个** | 策展式知识库的深度，每个节点都挂载权威来源 |
| 预置学习计划 | **6 个** | 前端转 AI（旗舰）/ 算法 200 / 前端 / 后端 / AI / LLM 应用 |
| 业务组件 | **51 个** | UI 组件库之上的业务封装 |
| 统一 UI 组件 | **16 个** | Button / Input / Select / Modal 等，被守护测试保护 |
| 顶层路由 | **18 个** | App Router 的页面入口 |
| Edge API 路由 | **25 个** | 聊天 / 学习 / 复习 / 节奏 / 限流 / 同步 / 周报 / V3 评审 / V4 作品集 / 鉴权等 |
| 守护测试 | **5+ 个** | 原生表单 / 设计令牌 / 暗色配对 / Prompt 指纹 / Preset 质量 |
| 文档 | **9 份** | README / AGENTS / ARCHITECTURE / DEVELOPMENT / PRODUCT / UI 设计系统 / 课程内容 / 内容生成规范 / 审计方法论 |

---

## 0.3 技术栈全景

| 层 | 选型 | 一句话解释 |
|---|---|---|
| 前端 | Next.js 15 App Router + React 19 + TypeScript 5.5 + Tailwind CSS 3.4 | App Router 是 Next.js 13+ 的新路由系统，支持 Server Component |
| 运行时 | Cloudflare Pages（Edge Runtime + nodejs_compat） | Edge Runtime 是离用户最近的计算节点，冷启动几乎为零 |
| 本地存储 | IndexedDB（Dexie.js 封装） | 浏览器内置的 NoSQL 数据库，Dexie 是它的 Promise 化封装 |
| 云端存储 | Cloudflare KV（4 namespace） | 全球边缘键值存储，按 namespace 隔离不同数据 |
| AI Provider | DeepSeek / GLM / MiMo / 用户自定义 | 通过 `@ai-sdk/openai` 适配（OpenAI 兼容协议） |
| AI 调用 | Vercel AI SDK + 流式 tool calling | 流式让用户看到 AI 一个字一个字输出，体验更好 |
| 复习算法 | ts-fsrs 4.5（FSRS-4.5） | 基于遗忘曲线的科学复习调度算法 |
| 能量模型 | 8 维线性回归 | 预测用户明天的学习容量，自动降级过载日程 |
| 知识向量 | Workers AI `bge-base-en-v1.5`（768 维） | 把文本转成向量，做语义搜索 |
| 课程图谱 | YAML Content-as-Code + zod 校验 | 知识库不是数据库行，是仓库里的代码 |
| PWA | Service Worker + Web Push + Manifest | 让网页能像 App 一样离线工作 + 推送通知 |
| 测试 | Vitest 1.6 + Playwright E2E | Vitest 是 Vite 原生测试框架，快；Playwright 做端到端测试 |
| CI/CD | GitHub Actions（quality-gate → deploy） | 推送到 main 自动跑测试 + 部署 |

**术语解释**（首次出现）：
- **Edge Runtime**：运行在 CDN 边缘节点的 JS 运行时（类似 Node.js 但更轻量），离用户最近，冷启动几乎为零
- **App Router**：Next.js 13+ 引入的新路由系统，支持 React Server Component（在服务器渲染的组件）
- **PWA**：Progressive Web App，能用 Service Worker 离线工作 + 推送通知 + 装到桌面的网页
- **IndexedDB**：浏览器内置的 NoSQL 数据库，能存大量结构化数据
- **Content-as-Code**：把内容（如知识库）当作代码管理，用 YAML/JSON 文件存储 + Git 版本化 + CI 校验

详细的技术选型对比见 [第 4a 章 前端技术选型](file:///workspace/docs/tutorial/04a-tech-frontend.md) 到 [第 4d 章 部署技术选型](file:///workspace/docs/tutorial/04d-tech-deployment.md)。

---

## 0.4 学完本教程你能做什么

**卡帕西视角**（技术能力）：

1. **理解一个真实生产项目的全貌**：从立项到部署的完整 SDLC（Software Development Life Cycle，软件开发生命周期）
2. **学会怎么做技术选型决策**：不是"用了什么"，而是"为什么用这个，对比过哪些 alternatives，付出了什么代价"
3. **掌握现代前端工程实践**：TypeScript 严格模式 / 守护测试 / 三层质量护栏 / Content-as-Code / Edge Runtime 适配
4. **理解 AI-Native 架构**：如何把 AI 当编排器（Persona + 画像 + 工具调用）而非主功能
5. **学会迭代式产品演化**：从 v1 功能堆砌到 v4 策展护城河的 14 阶段迭代史

**乔布斯视角**（产品能力）：

1. **理解"聚焦"的价值**：从"想学什么都行"到"前端转 AI 旗舰路径"的定位收窄
2. **学会用第一性原理做产品决策**：6 条原理 → 4 个产品推论 → 4 层架构
3. **掌握"少即是多"的设计哲学**：番茄钟只有 ring/card 两态；首页只有 6 区；底部导航只有 4 项
4. **理解"内容是护城河，不是机制"**：健身房再豪华也没用，关键看里面有没有训练计划

---

## 0.5 适合谁

**适合**：
- 学过 React 基础，想看一个真实生产项目是怎么搭的
- 想转 AI 方向的前端工程师（本项目就是为这个人群造的）
- 想学习现代前端工程实践（测试 / CI / 守护测试 / 类型系统）
- 想理解 AI-Native 架构的设计思路

**不适合**：
- 完全没写过 React 的人（先去学 React 基础再来）
- 想找"3 天速成 LLM"的人（这里没有捷径）
- 不愿意读代码的人（本教程会让你看大量真实代码片段）

---

## 0.6 阅读建议

### 推荐顺序（按章节顺序读）

```
00-overview（你正在读）→ 01-initiation → 02-requirements → 03-product-design
→ 04a/04b/04c/04d-tech-* → 05-standards → 06-implementation
→ 07-iteration → 08-deployment → 09-retrospective
```

### 跳读建议（按兴趣）

| 你的兴趣 | 推荐跳读路径 |
|---|---|
| 只想看技术选型 | 04a → 04b → 04c → 04d + appendix/tech-decision-cards |
| 只想看迭代史 | 07-iteration + appendix/pitfalls |
| 只想看产品决策 | 01 → 02 → 03 + 09-retrospective |
| 只想看工程规范 | 05-standards + 06-implementation |
| 初学者从头学 | 按章节顺序读，遇到不懂的术语查 appendix/glossary |

### 阅读时长预估

| 章节 | 预计时间 |
|---|---|
| 00-overview | 15 分钟 |
| 01-initiation | 20 分钟 |
| 02-requirements | 25 分钟 |
| 03-product-design | 35 分钟 |
| 04a-04d tech-*（4 章合计） | 120 分钟（每章 30 分钟） |
| 05-standards | 35 分钟 |
| 06-implementation | 40 分钟 |
| 07-iteration | 50 分钟 |
| 08-deployment | 20 分钟 |
| 09-retrospective | 20 分钟 |
| appendix（3 个合计） | 30 分钟 |
| **总计** | **约 6.5 小时** |

---

## 0.7 关联文档清单

本教程不重写以下文档，而是引用它们：

| 文档 | 内容 | 何时参考 |
|---|---|---|
| [README.md](file:///workspace/README.md) | 项目介绍（开发者入口） | 想看快速开始 / 仓库结构 |
| [AGENTS.md](file:///workspace/AGENTS.md) | AI 编码守则（强制规范） | 第 5 章规范约束会引用 |
| [docs/ARCHITECTURE.md](file:///workspace/docs/ARCHITECTURE.md) | 技术架构（分层 / 数据流 / 设计决策） | 第 3 / 6 章会引用 |
| [docs/DEVELOPMENT.md](file:///workspace/docs/DEVELOPMENT.md) | 开发指南（环境 / 测试 / 各模块开发流程） | 第 6 / 8 章会引用 |
| [docs/PRODUCT.md](file:///workspace/docs/PRODUCT.md) | 产品说明（用户视角的功能介绍） | 第 1 / 3 章会引用 |
| [docs/ui-design-system.md](file:///workspace/docs/ui-design-system.md) | UI 设计系统规范 | 第 5 章会引用 |
| [docs/curriculum-content.md](file:///workspace/docs/curriculum-content.md) | 课程内容规范 | 第 6 章会引用 |
| [docs/content-generation-standard.md](file:///workspace/docs/content-generation-standard.md) | AI 内容生成规范 | 第 5 / 6 章会引用 |
| [devpath-ai-redesign.md](file:///workspace/devpath-ai-redesign.md) | 产品诊断与重构设计 | 第 1 / 3 / 7 / 9 章会引用 |

---

## 本章小结

**学到了什么**：
1. devpath-ai 是前端工程师转 AI 工程师的转型系统，本地优先 PWA
2. 项目规模：1035 测试 / 49 节点 / 6 preset / 18 路由 / 25 API / 5+ 守护测试
3. 技术栈：Next.js 15 + Cloudflare Pages Edge + IndexedDB + Vercel AI SDK + ts-fsrs
4. 教程覆盖立项 → 需求 → 产品设计 → 技术选型（4 章）→ 规范 → 实现 → 迭代 → 部署 → 总结

**关键决策回顾**：
1. 项目定位从"想学什么都行"收窄到"前端转 AI 旗舰路径"（乔布斯的聚焦原则）
2. 技术栈选择现代但成熟（Next.js 15 / Cloudflare Edge / Vitest），不追新但不落后

## 下一章衔接

下一章 [01-initiation.md](file:///workspace/docs/tutorial/01-initiation.md) 会讲项目立项背景：要解决什么问题、目标用户是谁、三个核心矛盾是什么。这是乔布斯视角的"为什么做这个项目"。

## 延伸阅读

- [Next.js App Router 文档](https://nextjs.org/docs/app)
- [Cloudflare Pages 文档](https://developers.cloudflare.com/pages/)
- [Vercel AI SDK 文档](https://sdk.vercel.ai/docs)
- [FSRS 算法介绍](https://github.com/open-spaced-repetition/fsrs4anki/wiki)
