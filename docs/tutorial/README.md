# devpath-ai 全流程教学教程

> 从立项到部署，一个真实 AI-Native 开发者成长 OS 的全流程决策脉络。覆盖立项 → 需求分析 → 产品设计 → 技术选型（20 个决策点深对比）→ 规范约束 → 代码实现 → 14 阶段迭代史 → 部署上线 → 复盘总结。

**生产链接**：<https://devpath-ai.ai-kits.workers.dev/>
**仓库**：[devpath-ai](file:///workspace/README.md)
**关联 skill**：[build-project-tutorial](file:///workspace/.trae/skills/build-project-tutorial/SKILL.md)（把任何项目变成教程的可复用方法论）

---

## 一句话简介

本教程把 devpath-ai 项目从立项到部署的全过程拆解为 12 章 + 3 附录，每一章都回答"为什么这么决策"而非"做了什么"。读完你能建立自己的"项目决策框架"——遇到技术选型时知道怎么对比，遇到规范约束时知道怎么守护，遇到迭代时知道怎么复盘。

---

## 适合谁

- **前端工程师想转全栈/AI 工程**：看一个真实生产项目怎么从需求到部署
- **独立开发者**：学习如何一个人维护 986+ 测试 / 49 节点策展 / 6 preset / 20 个 API 路由的工程
- **技术决策者**：看 20 个技术决策点的对比表和选择理由
- **教学/分享者**：用 `build-project-tutorial` skill 把自己的项目也变成教程

---

## 学完能做什么

- 用第一性原理拆解产品需求，而非堆功能
- 在 5 个前端 / 5 个后端 / 5 个 AI / 5 个部署决策点上做有依据的选择
- 写出有守护测试强制的规范约束（不只是文档建议）
- 用 spec/plan 记录"为什么做"，用 git log 只看"改了什么"
- 设计零信任 session、增量同步、Content-as-Code 等生产级架构
- 把一个项目的全流程沉淀成可复用的 skill

---

## 阅读建议

### 完整阅读路径（推荐）

按章节顺序读，约 4-5 小时读完。每章末尾有"小结"和"下一章衔接"，形成连贯脉络。

### 按目标跳读

| 你的目标 | 推荐路径 |
|---|---|
| **学习技术选型方法** | 第 4a / 4b / 4c / 4d 章 + 附录 A（决策卡片） |
| **学习规范约束设计** | 第 5 章 + 附录 B（踩坑记录） |
| **学习生产级架构实现** | 第 6 章 + 附录 C（术语表） |
| **学习项目迭代管理** | 第 7 章（14 阶段迭代史） |
| **学习部署上线** | 第 8 章 |
| **学习复盘方法论** | 第 9 章 |
| **完整理解产品决策** | 第 1 / 2 / 3 章 + 第 9 章 |
| **快速浏览全貌** | 第 0 章（5 分钟） |

### 按水平跳读

- **初学者（学过 React 基础）**：从头读，遇到不熟悉的术语查附录 C
- **中级开发者**：跳过第 0-2 章，从第 3 章产品设计开始
- **高级开发者**：直接看第 4 章技术选型 + 第 6 章实现 + 第 9 章复盘

---

## 章节清单

| # | 标题 | 视角 | 预计时间 | 链接 |
|---|---|---|---|---|
| 0 | 项目全景与学习目标 | 双视角 | 5 min | [00-overview.md](file:///workspace/docs/tutorial/00-overview.md) |
| 1 | 立项与背景 | 乔布斯 | 15 min | [01-initiation.md](file:///workspace/docs/tutorial/01-initiation.md) |
| 2 | 需求分析 | 双视角 | 20 min | [02-requirements.md](file:///workspace/docs/tutorial/02-requirements.md) |
| 3 | 产品设计 | 乔布斯 | 25 min | [03-product-design.md](file:///workspace/docs/tutorial/03-product-design.md) |
| 4a | 前端技术选型（5 决策点） | 卡帕西 | 30 min | [04a-tech-frontend.md](file:///workspace/docs/tutorial/04a-tech-frontend.md) |
| 4b | 后端与存储技术选型（5 决策点） | 卡帕西 | 30 min | [04b-tech-backend.md](file:///workspace/docs/tutorial/04b-tech-backend.md) |
| 4c | AI 集成技术选型（5 决策点） | 卡帕西 | 30 min | [04c-tech-ai.md](file:///workspace/docs/tutorial/04c-tech-ai.md) |
| 4d | 部署与 CI/CD 技术选型（5 决策点） | 卡帕西 | 25 min | [04d-tech-deployment.md](file:///workspace/docs/tutorial/04d-tech-deployment.md) |
| 5 | 规范约束与守护测试 | 卡帕西 | 25 min | [05-standards.md](file:///workspace/docs/tutorial/05-standards.md) |
| 6 | 核心模块代码实现 | 卡帕西 | 35 min | [06-implementation.md](file:///workspace/docs/tutorial/06-implementation.md) |
| 7 | 14 阶段迭代史 | 双视角 | 35 min | [07-iteration.md](file:///workspace/docs/tutorial/07-iteration.md) |
| 8 | 部署与上线 | 卡帕西 | 18 min | [08-deployment.md](file:///workspace/docs/tutorial/08-deployment.md) |
| 9 | 总结与复盘 | 双视角 | 22 min | [09-retrospective.md](file:///workspace/docs/tutorial/09-retrospective.md) |
| A | 附录：技术决策卡片（20 张） | — | 10 min | [appendix/tech-decision-cards.md](file:///workspace/docs/tutorial/appendix/tech-decision-cards.md) |
| B | 附录：踩坑记录（15 条） | — | 15 min | [appendix/pitfalls.md](file:///workspace/docs/tutorial/appendix/pitfalls.md) |
| C | 附录：术语表（45 个） | — | 按需查 | [appendix/glossary.md](file:///workspace/docs/tutorial/appendix/glossary.md) |

**总计**：约 5 小时完整阅读 + 1 小时附录查阅

---

## 视角策略说明

本教程采用双视角叙述：

- **乔布斯视角**：看产品决策——聚焦、少即是多、真实场景驱动、说人话。用于第 1 / 3 章（立项 / 产品设计）和第 7 / 9 章的产品决策部分。
- **卡帕西视角**：看技术决策——第一性原理、可重复、可观测、可回滚。用于第 4 / 5 / 6 / 8 章和第 7 / 9 章的技术决策部分。

每个决策都问"为什么这么选"而非"选了什么"。对比表给出 3-5 个选项 × 5 个维度的横向比较，让你看到选择的代价。

---

## 关联文档清单

### 项目内核心文档

- [README.md](file:///workspace/README.md) — 项目介绍（开发者入口）
- [AGENTS.md](file:///workspace/AGENTS.md) — AI 编码守则（强制规范，本教程第 5 章详解）
- [docs/PRODUCT.md](file:///workspace/docs/PRODUCT.md) — 产品说明（乔布斯视角）
- [docs/ARCHITECTURE.md](file:///workspace/docs/ARCHITECTURE.md) — 技术架构（卡帕西视角）
- [docs/DEVELOPMENT.md](file:///workspace/docs/DEVELOPMENT.md) — 开发指南
- [docs/ui-design-system.md](file:///workspace/docs/ui-design-system.md) — UI 设计系统
- [docs/content-generation-standard.md](file:///workspace/docs/content-generation-standard.md) — AI 内容生成规范
- [docs/curriculum-content.md](file:///workspace/docs/curriculum-content.md) — 课程内容规范
- [docs/code-audit-methodology.md](file:///workspace/docs/code-audit-methodology.md) — 代码审计方法论
- [devpath-ai-redesign.md](file:///workspace/devpath-ai-redesign.md) — 产品诊断与重构设计

### 设计与实施原始材料

- [.trae/specs/](file:///workspace/.trae/specs/) — 7 个 spec（设计意图，第 7 章迭代史原始材料）
- [docs/superpowers/plans/](file:///workspace/docs/superpowers/plans/) — 9 个 plan（实施计划）
- [docs/superpowers/specs/](file:///workspace/docs/superpowers/specs/) — 3 个深度 spec（向量检索 / UI 重构 / 教程设计）

### 可复用 skill

- [.trae/skills/build-project-tutorial/SKILL.md](file:///workspace/.trae/skills/build-project-tutorial/SKILL.md) — 把任何项目变成教程的两阶段 skill
- [.trae/skills/update-docs/SKILL.md](file:///workspace/.trae/skills/update-docs/SKILL.md) — 自动更新项目基础文档

---

## 教程设计原则

1. **不依赖记忆**：所有数字（986 测试 / 49 节点 / 6 preset 等）基于实时扫描，非凭记忆
2. **不重写现有文档**：引用 [AGENTS.md](file:///workspace/AGENTS.md) / [ARCHITECTURE.md](file:///workspace/docs/ARCHITECTURE.md) 等，而非复制内容
3. **视角策略**：乔布斯看产品，卡帕西看技术，双视角交替
4. **初学者友好**：术语首次出现时解释，章节有前置知识 / 学习目标 / 小结 / 下一章衔接
5. **可复用**：把整理过程沉淀为 `build-project-tutorial` skill，可应用到其他项目

---

## 反馈与改进

本教程是活文档，发现错误或建议改进请：
1. 在 GitHub 仓库提 issue / PR
2. 或直接修改对应章节文件（每章是独立 `.md` 文件，易于局部修改）
3. 修改后跑一致性校验（数字 / 链接 / 术语）确保全局一致

---

**开始阅读**：[第 0 章 项目全景](file:///workspace/docs/tutorial/00-overview.md)
