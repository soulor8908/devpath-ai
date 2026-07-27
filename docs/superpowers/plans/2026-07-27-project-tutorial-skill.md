# 项目教学化 Skill + devpath-ai 教程实施计划

> **For agentic workers:** 本计划产出 markdown 文档与 skill 文件，不涉及代码改动。每个任务产出 1 个文件后立即自检 + 提交。Steps 用 checkbox (`- [ ]`) 语法追踪。

**Goal:** 在 devpath-ai 上执行 build-project-tutorial skill 的等价流程，产出 1 个 skill 文件 + 16 个 tutorial 文件（12 章 + 3 appendix + 1 README）。

**Architecture:** 先产出 skill（方法论），再按章节顺序产出 tutorial（参考实现），最后产出 README 主入口 + appendix。每批 1-3 个文件，产出后自检 + 提交。

**Tech Stack:** Markdown + frontmatter（skill 用 YAML frontmatter）

**关联 spec:** [docs/superpowers/specs/2026-07-27-project-tutorial-skill-design.md](file:///workspace/docs/superpowers/specs/2026-07-27-project-tutorial-skill-design.md)

---

## 文件结构总览

```
.trae/skills/build-project-tutorial/
└── SKILL.md                          # Task 1

docs/tutorial/
├── README.md                         # Task 11
├── 00-overview.md                    # Task 2
├── 01-initiation.md                  # Task 3
├── 02-requirements.md                # Task 4
├── 03-product-design.md              # Task 5
├── 04a-tech-frontend.md              # Task 6
├── 04b-tech-backend.md               # Task 7
├── 04c-tech-ai.md                    # Task 8
├── 04d-tech-deployment.md            # Task 9
├── 05-standards.md                   # Task 10
├── 06-implementation.md              # Task 10
├── 07-iteration.md                   # Task 11
├── 08-deployment.md                  # Task 11
├── 09-retrospective.md               # Task 11
└── appendix/
    ├── tech-decision-cards.md        # Task 12
    ├── pitfalls.md                   # Task 12
    └── glossary.md                   # Task 12
```

**注意**：Task 编号与文件不完全 1:1，因为部分章节合并到一个 Task 中批量产出（避免任务过碎）。

---

## Task 1: 产出 Skill 文件

**Files:**
- Create: `.trae/skills/build-project-tutorial/SKILL.md`

**参考**：spec 第 2 节"Skill 设计" + [.trae/skills/update-docs/SKILL.md](file:///workspace/.trae/skills/update-docs/SKILL.md) 的格式

- [ ] **Step 1: 写 SKILL.md（含 frontmatter + 两阶段流程 + 扫描模板 + checklist 生成 + 章节产出指令 + 注意事项）**

内容要点：
- frontmatter: `name: build-project-tutorial` + `description`（触发词：教学化 / 把这个项目变成教程 / build project tutorial）
- Phase 1: 7 个扫描步骤（项目元信息 / 文档清单 / specs/plans / 技术栈 / 规范约束 / CI/CD / 代码实现）
- Phase 1 末: 生成 checklist + 用户确认
- Phase 2: 创建目录 + 按章节产出 + README + appendix + 一致性校验 + 提交
- 每章产出指令含：视角策略 / 深度策略 / 引用现有文档原则 / 初学者友好要求
- 注意事项：不依赖记忆（数字实时扫描）/ 不重写现有文档 / 视角策略 / 术语首次出现时解释

- [ ] **Step 2: 自检**

- frontmatter 格式正确（name + description）
- 不依赖 devpath-ai 特定路径（用 `package.json` / `docs/` / `.github/workflows/` 等通用路径）
- 包含两阶段流程
- 包含视角策略（乔布斯 / 卡帕西）

- [ ] **Step 3: Commit**

```bash
git add .trae/skills/build-project-tutorial/SKILL.md
git commit -m "feat(skill): 新增 build-project-tutorial skill（项目教学化方法论）"
```

---

## Task 2: 产出 00-overview.md

**Files:**
- Create: `docs/tutorial/00-overview.md`

**参考**：spec 第 3.2 节"每章结构模板" + 第 3.5 节"视角策略"

- [ ] **Step 1: 写 00-overview.md**

视角：双视角
内容：
- 项目全景（devpath-ai 是什么 / 解决什么问题 / 当前规模：986 测试 / 49 节点 / 6 preset）
- 学习目标（学完本教程能做什么）
- 适合谁（初学者，学过 React 基础）
- 阅读路径（推荐顺序 / 跳读建议）
- 关联文档清单（README / AGENTS / ARCHITECTURE / DEVELOPMENT / PRODUCT）

- [ ] **Step 2: 自检**（前置知识 / 学习目标 / 小结 / 下一章衔接 是否完整）

- [ ] **Step 3: Commit**

```bash
git add docs/tutorial/00-overview.md
git commit -m "docs(tutorial): 新增第 0 章 项目全景"
```

---

## Task 3: 产出 01-initiation.md

**Files:**
- Create: `docs/tutorial/01-initiation.md`

**参考**：spec 第 3.5 节（乔布斯视角）+ [docs/PRODUCT.md](file:///workspace/docs/PRODUCT.md) + [devpath-ai-redesign.md](file:///workspace/devpath-ai-redesign.md) 第一部分

- [ ] **Step 1: 写 01-initiation.md**

视角：乔布斯
内容：
- 问题陈述（程序员转 AI 难 / 现有工具散 / 学习路径乱）
- 目标用户画像（转 AI 的程序员 / 面试焦虑 / 需要陪跑）
- 三个核心矛盾（学习与工作冲突 / 知识与面试脱节 / 工具与教练差异）
- 立项初心（引用 redesign.md 的"为什么做"）

- [ ] **Step 2: 自检**

- [ ] **Step 3: Commit**

```bash
git add docs/tutorial/01-initiation.md
git commit -m "docs(tutorial): 新增第 1 章 立项与背景"
```

---

## Task 4: 产出 02-requirements.md

**Files:**
- Create: `docs/tutorial/02-requirements.md`

**参考**：spec 第 3.5 节（双视角）+ [docs/ARCHITECTURE.md](file:///workspace/docs/ARCHITECTURE.md) + [docs/PRODUCT.md](file:///workspace/docs/PRODUCT.md)

- [ ] **Step 1: 写 02-requirements.md**

视角：双视角
内容：
- 功能性需求（4 矛盾 → 4 层架构 L1-L4：路径 / 训练 / 复习 / 面试）
- 非功能性需求（性能 / 安全 / 可用性 / 离线 / 成本）
- 用户故事（5-8 个典型场景）
- 约束条件（Edge Runtime / Cloudflare KV 限制 / 零后端 / 本地优先）

- [ ] **Step 2: 自检**

- [ ] **Step 3: Commit**

```bash
git add docs/tutorial/02-requirements.md
git commit -m "docs(tutorial): 新增第 2 章 需求分析"
```

---

## Task 5: 产出 03-product-design.md

**Files:**
- Create: `docs/tutorial/03-product-design.md`

**参考**：spec 第 3.5 节（乔布斯视角）+ [devpath-ai-redesign.md](file:///workspace/devpath-ai-redesign.md) + [docs/PRODUCT.md](file:///workspace/docs/PRODUCT.md)

- [ ] **Step 1: 写 03-product-design.md**

视角：乔布斯
内容：
- L1-L4 四层架构（路径 / 训练 / 复习 / 面试）
- 6 条产品原则（聚焦 / 少即是多 / 真实场景驱动 / 10 秒 Aha / 减法 / 设计让技术隐于无形）
- 与竞品差异（vs Anki / vs LeetCode / vs ChatGPT）
- 设计哲学（为什么是"教练"而非"工具"）

- [ ] **Step 2: 自检**

- [ ] **Step 3: Commit**

```bash
git add docs/tutorial/03-product-design.md
git commit -m "docs(tutorial): 新增第 3 章 产品设计"
```

---

## Task 6: 产出 04a-tech-frontend.md

**Files:**
- Create: `docs/tutorial/04a-tech-frontend.md`

**参考**：spec 第 4.1 节（5 个前端决策点）+ 第 4.5 节（对比表模板）

- [ ] **Step 1: 写 04a-tech-frontend.md**

视角：卡帕西
内容：5 个决策点深对比表
- F1 框架：Next.js 15 vs Remix vs Vite+RR vs Astro
- F2 UI 样式：Tailwind vs CSS-in-JS vs CSS Modules vs Vanilla Extract
- F3 状态管理：useState+Context vs Redux Toolkit vs Zustand vs Jotai
- F4 表单组件策略：原生+守护测试 vs 统一组件库 vs Radix vs shadcn/ui
- F5 图表库：Recharts vs Chart.js vs D3 vs Visx vs 自绘 SVG

每个决策点含：背景 / 对比表 / 选择理由（卡帕西视角）/ 代价 / 踩过的坑

- [ ] **Step 2: 自检**（5 个对比表完整 / 每个含 5 个维度 / 选择理由充分）

- [ ] **Step 3: Commit**

```bash
git add docs/tutorial/04a-tech-frontend.md
git commit -m "docs(tutorial): 新增第 4a 章 前端技术选型"
```

---

## Task 7: 产出 04b-tech-backend.md

**Files:**
- Create: `docs/tutorial/04b-tech-backend.md`

**参考**：spec 第 4.2 节（5 个后端决策点）+ [docs/ARCHITECTURE.md](file:///workspace/docs/ARCHITECTURE.md)

- [ ] **Step 1: 写 04b-tech-backend.md**

视角：卡帕西
内容：5 个决策点深对比表
- B1 本地存储：IndexedDB+Dexie vs localStorage vs SQLite WASM vs OPFS
- B2 云端存储：Cloudflare KV vs Supabase vs Firebase vs PlanetScale vs Turso
- B3 数据同步策略：全量备份 vs 增量同步+LWW vs CRDT vs 实时同步
- B4 API 路由模式：Next.js API Routes vs Edge Functions vs Pages Functions vs 独立后端
- B5 数据校验：Zod vs Yup vs Joi vs Valibot vs 手写类型守卫

- [ ] **Step 2: 自检**

- [ ] **Step 3: Commit**

```bash
git add docs/tutorial/04b-tech-backend.md
git commit -m "docs(tutorial): 新增第 4b 章 后端与存储技术选型"
```

---

## Task 8: 产出 04c-tech-ai.md

**Files:**
- Create: `docs/tutorial/04c-tech-ai.md`

**参考**：spec 第 4.3 节（5 个 AI 决策点）+ [docs/ARCHITECTURE.md](file:///workspace/docs/ARCHITECTURE.md) + [docs/content-generation-standard.md](file:///workspace/docs/content-generation-standard.md)

- [ ] **Step 1: 写 04c-tech-ai.md**

视角：卡帕西
内容：5 个决策点深对比表
- A1 AI SDK：Vercel AI SDK vs LangChain.js vs LlamaIndex.TS vs 直接 fetch
- A2 AI Provider 适配：@ai-sdk/openai 适配 vs 各家原生 SDK vs OpenRouter vs 自写适配层
- A3 复习算法：ts-fsrs (FSRS-4.5) vs SuperMemo-2 vs Anki 算法 vs 自写 SM-2
- A4 向量搜索：Workers AI BGE vs Transformers.js vs OpenAI Embeddings vs Pinecone vs 自建
- A5 Session 安全：明文存 apiKey vs Cookie+HttpOnly vs 零信任 session (AES-GCM+nonce+HMAC)

- [ ] **Step 2: 自检**

- [ ] **Step 3: Commit**

```bash
git add docs/tutorial/04c-tech-ai.md
git commit -m "docs(tutorial): 新增第 4c 章 AI 集成技术选型"
```

---

## Task 9: 产出 04d-tech-deployment.md

**Files:**
- Create: `docs/tutorial/04d-tech-deployment.md`

**参考**：spec 第 4.4 节（5 个部署决策点）+ [.github/workflows/deploy-devpath.yml](file:///workspace/.github/workflows/deploy-devpath.yml) + [wrangler.toml](file:///workspace/wrangler.toml)

- [ ] **Step 1: 写 04d-tech-deployment.md**

视角：卡帕西
内容：5 个决策点深对比表
- D1 部署平台：Cloudflare Pages vs Vercel vs Netlify vs AWS Amplify vs 自建
- D2 运行时：Edge Runtime vs Node.js vs Deno vs Bun
- D3 CI/CD：GitHub Actions vs GitLab CI vs CircleCI vs Jenkins vs Drone
- D4 测试框架：Vitest vs Jest vs Bun test vs Node test runner
- D5 PWA 策略：无 PWA vs SW stale-while-revalidate vs Workbox vs 自写 SW

- [ ] **Step 2: 自检**

- [ ] **Step 3: Commit**

```bash
git add docs/tutorial/04d-tech-deployment.md
git commit -m "docs(tutorial): 新增第 4d 章 部署与 CI/CD 技术选型"
```

---

## Task 10: 产出 05-standards.md + 06-implementation.md

**Files:**
- Create: `docs/tutorial/05-standards.md`
- Create: `docs/tutorial/06-implementation.md`

**参考**：[AGENTS.md](file:///workspace/AGENTS.md) + [docs/ui-design-system.md](file:///workspace/docs/ui-design-system.md) + [docs/code-audit-methodology.md](file:///workspace/docs/code-audit-methodology.md)

- [ ] **Step 1: 写 05-standards.md**

视角：卡帕西
内容：
- AGENTS.md 的地位与三层质量护栏（预防 / 检测 / 审计）
- 13 条 UI 编码强制规则（2.1-2.13，含反模式根因）
- 守护测试清单（5 个测试文件）
- 设计令牌是单一事实源
- 测试即文档

- [ ] **Step 2: 写 06-implementation.md**

视角：卡帕西
内容：6 个核心模块的实现决策 + 代码片段
- 模块 1: FSRS 复习引擎（lib/fsrs.ts）
- 模块 2: study-queue 智能排序（lib/study-queue/）
- 模块 3: AI 流式响应（lib/ai/）
- 模块 4: IndexedDB 数据层（lib/db/）
- 模块 5: Cloudflare KV 同步（lib/sync/）
- 模块 6: 零信任 session（lib/auth.ts）

每模块含：职责 / 关键决策 / 代码片段（≤30 行）/ 踩过的坑

- [ ] **Step 3: 自检**（两章）

- [ ] **Step 4: Commit**

```bash
git add docs/tutorial/05-standards.md docs/tutorial/06-implementation.md
git commit -m "docs(tutorial): 新增第 5 章 规范约束 + 第 6 章 代码实现"
```

---

## Task 11: 产出 07-iteration.md + 08-deployment.md + 09-retrospective.md

**Files:**
- Create: `docs/tutorial/07-iteration.md`
- Create: `docs/tutorial/08-deployment.md`
- Create: `docs/tutorial/09-retrospective.md`

**参考**：spec 第 5 节（14 阶段迭代史）+ [.trae/specs/](file:///workspace/.trae/specs/) + [docs/superpowers/plans/](file:///workspace/docs/superpowers/plans/) + [devpath-ai-redesign.md](file:///workspace/devpath-ai-redesign.md)

- [ ] **Step 1: 写 07-iteration.md**

视角：双视角
内容：14 阶段迭代史（Phase 0-14）+ 反思
每阶段含：做了什么 / 为什么做 / 关键决策 / 学到了什么 / 如果重写会怎么做 / 关联 spec/plan
开头声明"基于 specs/plans 重建，非 git log"

- [ ] **Step 2: 写 08-deployment.md**

视角：卡帕西
内容：
- Cloudflare Pages 部署流程
- Secrets 配置（MASTER_KEY / NEXT_PUBLIC_VAPID_PUBLIC_KEY）
- KV 命名空间配置
- 域名与 HTTPS
- CI/CD 流水线（quality-gate → deploy 两段）

- [ ] **Step 3: 写 09-retrospective.md**

视角：双视角
内容：
- 方法论总结（5-8 条可迁移经验）
- 卡帕西视角：技术决策的得与失
- 乔布斯视角：产品决策的得与失
- 延伸阅读（外部资源 + 项目内文档）

- [ ] **Step 4: 自检**（三章）

- [ ] **Step 5: Commit**

```bash
git add docs/tutorial/07-iteration.md docs/tutorial/08-deployment.md docs/tutorial/09-retrospective.md
git commit -m "docs(tutorial): 新增第 7 章 迭代史 + 第 8 章 部署 + 第 9 章 总结"
```

---

## Task 12: 产出 appendix（3 个文件）

**Files:**
- Create: `docs/tutorial/appendix/tech-decision-cards.md`
- Create: `docs/tutorial/appendix/pitfalls.md`
- Create: `docs/tutorial/appendix/glossary.md`

- [ ] **Step 1: 写 tech-decision-cards.md**

内容：20 个技术决策卡片（F1-F5 / B1-B5 / A1-A5 / D1-D5）
每卡 1 张表：决策 / 选项 / 选择 / 理由 / 代价

- [ ] **Step 2: 写 pitfalls.md**

内容：踩坑记录（10-15 条）
每坑：现象 / 根因 / 修复 / 关联 spec
来源：AGENTS.md 2.11-2.13 + 各 spec 的"Why"部分

- [ ] **Step 3: 写 glossary.md**

内容：术语表（30-50 个术语）
每术语：1 句解释 + 链接
覆盖：FSRS / LWW / Edge Runtime / KV / App Router / Server Component / Client Component / Zod / Dexie / Vercel AI SDK / Data Stream Protocol / nodejs_compat / next-on-pages / Web Push / VAPID / 等等

- [ ] **Step 4: 自检**

- [ ] **Step 5: Commit**

```bash
git add docs/tutorial/appendix/
git commit -m "docs(tutorial): 新增 appendix（技术决策卡片 + 踩坑 + 术语表）"
```

---

## Task 13: 产出 README.md 主入口

**Files:**
- Create: `docs/tutorial/README.md`

- [ ] **Step 1: 写 README.md**

内容：
- 教程标题 + 一句话简介
- 学习路径索引（推荐顺序 + 章节链接）
- 适合谁 / 学完能做什么
- 阅读建议（按水平跳读）
- 章节清单表（# / 标题 / 视角 / 预计时间 / 链接）
- 关联文档清单

- [ ] **Step 2: 自检**

- [ ] **Step 3: Commit**

```bash
git add docs/tutorial/README.md
git commit -m "docs(tutorial): 新增主入口 README"
```

---

## Task 14: 一致性校验 + 推送

- [ ] **Step 1: 一致性校验**

校验项：
- 测试数（986）在所有引用处一致
- 节点数（49）在所有引用处一致
- preset 数（6）在所有引用处一致
- 文件链接（file:// 格式）可达
- 术语首次出现时有解释
- 视角标注与章节内容一致
- 每章含前置知识 / 学习目标 / 小结 / 下一章衔接

用 Grep 工具校验关键数字：
- `grep -r "986" docs/tutorial/`
- `grep -r "49" docs/tutorial/`
- `grep -r "6 preset\|6 个 preset" docs/tutorial/`

- [ ] **Step 2: 修复发现的不一致**

- [ ] **Step 3: 推送到远程**

```bash
git push origin main
```

如果 push 失败（沙箱认证限制），告知用户需在本地终端手动 push。

- [ ] **Step 4: 最终汇报**

向用户汇报：
- 产出文件清单（17 个文件）
- 总行数 / 总字数
- 一致性校验结果
- push 状态

---

## Self-Review

**1. Spec coverage:** 
- spec 第 2 节 Skill 设计 → Task 1 ✓
- spec 第 3 节 Tutorial 结构（12 章 + 3 appendix + README）→ Task 2-13 ✓
- spec 第 4 节 20 个技术决策点 → Task 6-9（每章 5 个）+ Task 12（卡片汇总）✓
- spec 第 5 节 迭代史 14 阶段 → Task 11 ✓
- spec 第 6 节 实施计划 → 本计划 ✓
- spec 第 7 节 产物清单 → Task 1-13 ✓
- spec 第 8 节 风险与对策 → 已内嵌到各 Task 的自检步骤 ✓
- spec 第 9 节 成功标准 → Task 14 一致性校验 ✓

**2. Placeholder scan:** 无 "TBD" / "TODO" / "implement later"。每个 Task 都有具体步骤和文件路径。

**3. Type consistency:** 章节文件名在 Task 和文件结构总览中一致（00-overview / 01-initiation / ... / 09-retrospective / appendix/*）。

---

## Execution Handoff

**计划已保存到 `docs/superpowers/plans/2026-07-27-project-tutorial-skill.md`。**

由于本计划是文档产出（非代码），不需要 TDD 循环。采用 **Inline Execution**（在当前会话顺序执行 Task 1-14），因为：
1. 文档产出无测试可跑，subagent 难以验证质量
2. 章节间有引用关系，需顺序产出
3. 上下文已加载完整（spec + 项目扫描结果），不需 fresh subagent

**开始执行。**
