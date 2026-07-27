---
name: build-project-tutorial
description: 把任意项目教学化，产出可复用的教程文档。两阶段流程：Phase 1 扫描项目 → 生成 checklist → 用户确认；Phase 2 按确认后的 checklist 按章节产出。覆盖立项到部署全 SDLC，含技术选型对比表、迭代史重建、踩坑记录。用户说"把这个项目变成教程" / "教学化" / "build project tutorial" / "写项目教程" 时执行。
---

# build-project-tutorial — 项目教学化 Skill

> **用途**：把任意代码仓库转化为面向初学者的教学教程，覆盖立项 → 需求 → 产品设计 → 技术选型 → 规范 → 实现 → 迭代 → 部署 → 总结全流程。
> **触发**：用户说"把这个项目变成教程" / "教学化" / "write project tutorial" / "整理教学文档" 等。
> **产出**：`docs/tutorial/` 目录（12 章 + appendix + README 主入口）。
> **受众假设**：初学者（学过 React / Vue / 后端框架基础），需解释每个技术对比项的基础概念。
> **视角策略**：产品设计用乔布斯视角（聚焦 / 少即是多 / 真实场景驱动），技术架构用卡帕西视角（系统思维 / 第一性原理 / 权衡分析）。

---

## 总体流程

```
Phase 1: 扫描 + 生成 checklist + 用户确认
    │
    ├─ Step 1-7: 扫描项目（元信息 / 文档 / specs/plans / 技术栈 / 规范 / CI/CD / 代码实现）
    ├─ Step 8: 生成 checklist（按 SDLC 9 阶段 + appendix）
    └─ Step 9: 用户确认 checklist（可增删 / 调整深度 / 调整顺序）
           ↓ 用户批准
Phase 2: 按确认后的 checklist 产出章节
    │
    ├─ Step 10: 创建 docs/tutorial/ 目录结构
    ├─ Step 11-22: 按章节顺序产出（每章独立文件）
    ├─ Step 23: 产出 README 主入口
    ├─ Step 24: 产出 appendix
    ├─ Step 25: 一致性校验
    └─ Step 26: 提交并推送
```

---

## Phase 1: 扫描项目 + 生成 checklist

### Step 1: 扫描项目元信息

读取以下文件获取项目基本信息：

```bash
# 用 Read 工具读取
package.json          # 项目名 / 依赖 / 脚本
README.md             # 项目简介
LICENSE               # 开源协议
```

```bash
# 用 LS 工具查看目录结构
LS /workspace         # 顶层目录
LS /workspace/docs    # 文档目录
LS /workspace/app     # 应用目录（Next.js）
LS /workspace/lib     # 库目录
LS /workspace/components  # 组件目录
```

```bash
# 用 RunCommand 获取关键数字
git log --all --oneline | wc -l           # commit 总数
git log --all --pretty=format:"%ad" --date=short | sort -u | head -1   # 最早 commit 日期
git log --all --pretty=format:"%ad" --date=short | sort -u | tail -1   # 最新 commit 日期
```

**记录**：项目名 / 项目简介 / 技术栈 / commit 数 / 时间跨度 / 目录结构。

### Step 2: 扫描文档清单

读取项目内所有 markdown 文档：

```bash
# 用 Glob 找所有 md 文件
Glob "**/*.md" --path /workspace

# 用 Read 读取关键文档（按重要性排序）
README.md
AGENTS.md                 # AI 编码守则（如有）
docs/ARCHITECTURE.md      # 架构文档
docs/DEVELOPMENT.md       # 开发文档
docs/PRODUCT.md           # 产品文档
docs/README.md            # 文档目录索引（如有）
```

**记录**：文档清单 + 每份文档的职责 + 是否需在 tutorial 中引用。

### Step 3: 扫描 specs / plans 历史

查找项目的设计文档与实施计划（用于重建迭代史）：

```bash
# 用 Glob 查找
Glob ".trae/specs/*/spec.md" --path /workspace
Glob "docs/superpowers/specs/*.md" --path /workspace
Glob "docs/superpowers/plans/*.md" --path /workspace

# 用 Read 读取每个 spec/plan 的前 10-20 行（标题 + Goal + Why）
```

**记录**：spec/plan 清单 + 日期 + 主题。按日期排序，用于 07-iteration.md 的迭代史重建。

**如果 git log 可用**（commit 数 > 1），补充扫描：

```bash
git log --all --pretty=format:"%h %ad %s" --date=short | head -200
```

**如果 git log 不可用**（仓库被压缩，仅 1 个 commit），在 07-iteration.md 开头声明"基于 specs/plans 重建，非 git log"。

### Step 4: 扫描技术栈

从 package.json 的 dependencies 提取技术栈：

```bash
# 用 Read 读取 package.json，提取 dependencies / devDependencies
```

按以下分类整理：
- **前端框架**：Next.js / Remix / Vite / Astro / Nuxt
- **UI 样式**：Tailwind / CSS-in-JS / CSS Modules
- **状态管理**：Redux / Zustand / Jotai / useState+Context
- **后端 / 存储**：IndexedDB / SQLite / Supabase / Firebase / KV
- **AI 集成**：Vercel AI SDK / LangChain / 直接 fetch
- **校验**：Zod / Yup / Joi
- **测试**：Vitest / Jest / Playwright
- **部署**：Cloudflare Pages / Vercel / Netlify

**记录**：技术栈清单 + 每个技术的版本 + 用途。

### Step 5: 扫描规范约束

查找项目的编码规范与守护测试：

```bash
# 用 Read 读取
AGENTS.md                 # AI 编码守则（如有）
docs/ui-design-system.md  # UI 设计系统（如有）
.eslintrc.json            # ESLint 配置
tsconfig.json             # TypeScript 配置

# 用 Glob 查找守护测试
Glob "**/*guard*.test.ts" --path /workspace
Glob "__tests__/*.test.ts" --path /workspace
```

**记录**：规范清单 + 守护测试清单 + 强制规则数。

### Step 6: 扫描 CI/CD

查找部署与 CI/CD 配置：

```bash
# 用 Glob 查找
Glob ".github/workflows/*.yml" --path /workspace
Glob "wrangler.toml" --path /workspace
Glob "vercel.json" --path /workspace
Glob "netlify.toml" --path /workspace
Glob "Dockerfile" --path /workspace

# 用 Read 读取找到的配置文件
```

**记录**：CI/CD 平台 / 部署流程 / Secrets 配置 / 环境变量。

### Step 7: 扫描代码实现关键文件

读取核心模块的源码（用于 06-implementation.md）：

```bash
# 用 LS 查看
LS /workspace/lib        # 库目录
LS /workspace/app        # 应用目录
LS /workspace/components # 组件目录

# 用 Read 读取关键文件（前 50-100 行，了解结构）
# 优先读取：
lib/ 下的核心模块（如 fsrs / ai / db / sync / auth）
app/ 下的页面入口（如 layout.tsx / page.tsx）
components/ 下的核心组件
```

**记录**：6-8 个核心模块 + 职责 + 关键决策点。

### Step 8: 生成 checklist

基于 Step 1-7 的扫描结果，生成 checklist。模板：

```markdown
# 项目教学化 Checklist

## 章节清单

| # | 文件 | 职责 | 视角 | 深度 | 数据源 |
|---|---|---|---|---|---|
| 00 | 00-overview.md | 项目全景 + 学习目标 | 双视角 | 中等 | Step 1-2 |
| 01 | 01-initiation.md | 立项背景 | 乔布斯 | 中等 | Step 2 + 产品文档 |
| 02 | 02-requirements.md | 需求分析 | 双视角 | 中等 | Step 2 + 架构文档 |
| 03 | 03-product-design.md | 产品设计 | 乔布斯 | 深入 | 产品文档 + redesign |
| 04a | 04a-tech-frontend.md | 前端选型 | 卡帕西 | 深入 | Step 4 |
| 04b | 04b-tech-backend.md | 后端存储选型 | 卡帕西 | 深入 | Step 4 |
| 04c | 04c-tech-ai.md | AI 集成选型 | 卡帕西 | 深入 | Step 4 |
| 04d | 04d-tech-deployment.md | 部署 CI/CD 选型 | 卡帕西 | 深入 | Step 6 |
| 05 | 05-standards.md | 规范约束 | 卡帕西 | 深入 | Step 5 |
| 06 | 06-implementation.md | 代码实现 | 卡帕西 | 深入 | Step 7 |
| 07 | 07-iteration.md | 迭代史 | 双视角 | 深入 | Step 3 |
| 08 | 08-deployment.md | 发布部署 | 卡帕西 | 中等 | Step 6 |
| 09 | 09-retrospective.md | 总结与延伸 | 双视角 | 中等 | 全部 |
| A1 | appendix/tech-decision-cards.md | 技术决策卡片 | 卡帕西 | 简略 | Step 4 |
| A2 | appendix/pitfalls.md | 踩坑记录 | 双视角 | 简略 | Step 3 + 5 |
| A3 | appendix/glossary.md | 术语表 | - | 简略 | 全部 |

## 技术对比清单（按 4 类组织，每类 5 个决策点）

### 前端（04a）
- F1: [决策点] - 对比选项 - 实际选择
- F2: ...

### 后端（04b）
- B1: ...
...

### AI（04c）
- A1: ...
...

### 部署（04d）
- D1: ...
...

## 迭代史时间线（基于 specs/plans）

| 阶段 | 时间 | 主题 | 数据源 |
|---|---|---|---|
| Phase 0 | [日期] | [主题] | [spec/plan] |
| Phase 1 | ... | ... | ... |
...
```

### Step 9: 用户确认 checklist

向用户展示 checklist，询问：
1. 章节是否需要增删？
2. 技术对比清单是否覆盖了所有想要的决策点？有没有遗漏？
3. 迭代史时间线是否准确？
4. 实施顺序：先 skill 文件，再按章节顺序产出 tutorial，最后 README + appendix — 是否同意？

**等待用户批准后**，进入 Phase 2。

---

## Phase 2: 按章节产出

### Step 10: 创建目录结构

```bash
# 用 RunCommand 创建
mkdir -p docs/tutorial/appendix
```

### Step 11-22: 按章节顺序产出

每章用 Write 工具产出，遵循以下结构模板：

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

**产出顺序**：00 → 01 → 02 → 03 → 04a → 04b → 04c → 04d → 05 → 06 → 07 → 08 → 09

**每章产出后自检**：
- 前置知识 / 学习目标 / 小结 / 下一章衔接 是否完整
- 视角标注与内容是否一致
- 术语首次出现时是否有解释
- 引用现有文档是否用 file:// 链接

### 各章节产出指令

#### 00-overview.md（双视角）
- 项目全景（项目名 / 解决什么问题 / 当前规模：测试数 / 节点数 / preset 数等关键数字）
- 学习目标（学完本教程能做什么）
- 适合谁（初学者，学过框架基础）
- 阅读路径（推荐顺序 / 跳读建议）
- 关联文档清单

#### 01-initiation.md（乔布斯视角）
- 问题陈述（用户痛点 / 现有方案不足）
- 目标用户画像
- 核心矛盾（2-3 个）
- 立项初心

#### 02-requirements.md（双视角）
- 功能性需求（核心矛盾 → 核心功能）
- 非功能性需求（性能 / 安全 / 可用性 / 离线 / 成本）
- 用户故事（5-8 个典型场景）
- 约束条件（运行时限制 / 平台限制 / 成本限制）

#### 03-product-design.md（乔布斯视角）
- 核心架构（L1-L4 四层或项目的核心分层）
- 产品原则（5-8 条）
- 与竞品差异
- 设计哲学

#### 04a-tech-frontend.md（卡帕西视角）
- 5 个前端决策点深对比表
- 每个决策点：背景 / 对比表（5+ 维度）/ 选择理由 / 代价 / 踩过的坑

#### 04b-tech-backend.md（卡帕西视角）
- 5 个后端存储决策点深对比表
- 同上结构

#### 04c-tech-ai.md（卡帕西视角）
- 5 个 AI 集成决策点深对比表
- 同上结构

#### 04d-tech-deployment.md（卡帕西视角）
- 5 个部署 CI/CD 决策点深对比表
- 同上结构

#### 05-standards.md（卡帕西视角）
- 编码守则的地位与三层质量护栏（预防 / 检测 / 审计）
- UI 编码强制规则（逐条讲解）
- 守护测试清单
- 设计令牌是单一事实源
- 测试即文档

#### 06-implementation.md（卡帕西视角）
- 6-8 个核心模块的实现决策 + 代码片段（每段 ≤ 30 行）
- 每模块：职责 / 关键决策 / 代码片段 / 踩过的坑

#### 07-iteration.md（双视角）
- 14 阶段迭代史（基于 specs/plans 重建）
- 每阶段：做了什么 / 为什么做 / 关键决策 / 学到了什么 / 如果重写会怎么做 / 关联 spec/plan
- 开头声明"基于 specs/plans 重建，非 git log"（如适用）

#### 08-deployment.md（卡帕西视角）
- 部署平台与流程
- Secrets 配置
- 环境变量
- 域名与 HTTPS
- CI/CD 流水线

#### 09-retrospective.md（双视角）
- 方法论总结（5-8 条可迁移经验）
- 卡帕西视角：技术决策的得与失
- 乔布斯视角：产品决策的得与失
- 延伸阅读

### Step 23: 产出 README 主入口

`docs/tutorial/README.md`：
- 教程标题 + 一句话简介
- 学习路径索引（推荐顺序 + 章节链接）
- 适合谁 / 学完能做什么
- 阅读建议（按水平跳读）
- 章节清单表（# / 标题 / 视角 / 预计时间 / 链接）
- 关联文档清单

### Step 24: 产出 appendix

#### appendix/tech-decision-cards.md
- 20 个技术决策卡片（F1-F5 / B1-B5 / A1-A5 / D1-D5）
- 每卡 1 张表：决策 / 选项 / 选择 / 理由 / 代价

#### appendix/pitfalls.md
- 踩坑记录（10-15 条）
- 每坑：现象 / 根因 / 修复 / 关联 spec
- 来源：编码守则的反模式根因 + 各 spec 的"Why"部分

#### appendix/glossary.md
- 术语表（30-50 个术语）
- 每术语：1 句解释 + 链接
- 覆盖项目用到的所有技术术语

### Step 25: 一致性校验

用 Grep 工具校验关键数字在所有引用处一致：

```bash
# 用 Grep 工具（不是 shell grep）
Grep "[测试数]" --path /workspace/docs/tutorial --output_mode content
Grep "[节点数]" --path /workspace/docs/tutorial --output_mode content
Grep "[preset 数]" --path /workspace/docs/tutorial --output_mode content
```

校验项：
- 关键数字（测试数 / 节点数 / preset 数等）在所有引用处一致
- 文件链接（file:// 格式）可达
- 术语首次出现时有解释
- 视角标注与章节内容一致
- 每章含前置知识 / 学习目标 / 小结 / 下一章衔接

修复发现的不一致。

### Step 26: 提交并推送

```bash
git add docs/tutorial/ .trae/skills/build-project-tutorial/
git commit -m "docs(tutorial): 新增项目教学化 skill + N 章教程

- 新增 .trae/skills/build-project-tutorial/SKILL.md（可复用方法论）
- 新增 docs/tutorial/ 目录（12 章 + 3 appendix + README）
- 覆盖立项 → 需求 → 产品设计 → 技术选型（4 章）→ 规范 → 实现 → 迭代 → 部署 → 总结
- 含 N 个技术决策点深对比表 + 迭代史重建
- 面向初学者，每章含前置知识 / 学习目标 / 小结"

git push origin main
```

如果 push 失败（沙箱认证限制），告知用户需在本地终端手动 push。

---

## 注意事项

1. **不依赖记忆，所有数字必须实时扫描**：测试数 / 节点数 / preset 数 / commit 数等关键数字，必须用 shell 命令实时扫描，不能凭印象写。

2. **不重写现有文档**：tutorial 引用现有文档（README / ARCHITECTURE / DEVELOPMENT / PRODUCT 等），不复制全文。每章开头明确引用（如"本章基于 ARCHITECTURE.md 第 3 节，详见..."）。

3. **视角策略**：
   - 产品设计 / 立项 / 需求 → 乔布斯视角（聚焦 / 少即是多 / 真实场景驱动 / 10 秒 Aha）
   - 技术选型 / 规范 / 实现 / 部署 → 卡帕西视角（系统思维 / 第一性原理 / 权衡分析 / 关注点分离）
   - 迭代史 / 总结 → 双视角（乔布斯讲"做错了什么"，卡帕西讲"架构如何演化"）

4. **初学者友好**：
   - 每个术语首次出现时解释（或链接到 glossary）
   - 每个技术对比项前加"基础概念"小节
   - 代码片段 ≤ 30 行，超过则拆分或链接到源文件
   - 用 file:// 链接引用源文件（遵循项目 Code Reference 规则）

5. **代码示例策略**：
   - 贴关键片段，不贴大段代码
   - 关键决策贴"对比代码"（如"用统一组件 vs 原生 HTML"的对比）
   - 不让学生跟着改代码（本教程是"读懂项目"而非"重建项目"）

6. **迭代史重建**：
   - git log 不可用时，基于 specs/plans 重建
   - 在 07-iteration.md 开头声明数据源
   - 标注"推断"部分（无 spec/plan 记录的早期阶段）

7. **Skill 通用性**：本 skill 不依赖任何特定项目结构。扫描命令用通用路径（package.json / docs/ / .github/workflows/ 等），可在任意项目上运行。

8. **分批产出**：章节间有引用关系（如 04a 引用 03 的产品设计），需顺序产出。每批 3-4 章，避免单次输出过长导致质量下降。

9. **提交粒度**：每个 Task（1-3 个文件）commit 一次，遵循 Conventional Commits 格式。

10. **遵循项目规范**：如果目标项目有 AGENTS.md 或类似编码守则，tutorial 产出也需遵循（如 file:// 链接格式 / 不用 emoji 当功能图标等）。
