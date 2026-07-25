# TODO — 内容层重构剩余工作

> 本文件记录「策展式课程内容层 + 路径引擎 + 验证层」重构的剩余待办。
> 会话任务系统里的任务清单不进仓库，此文件是它在仓库中的持久化快照。
> 最近更新：2026-07-25

## 状态总览

已完成的大块工作（均已提交并推送至 `origin/main`）：

- **L1 内容层（Content-as-Code）**：`content/`（46 条权威来源、38 个 Phase 0-4 技能节点、旗舰轨道、5 个里程碑 Rubric）
- **L2 路径引擎 + L3 验证层**：`lib/curriculum/`（schema/loader/graph/path-engine/verification，全部纯函数）
- **编译管线**：`scripts/compile-content.ts`（`content:validate` / `content:compile` + 产物新鲜度校验），接入 quality-gate
- **UI 集成**：`lib/presets/frontend-to-ai-engineer.ts` preset 化 + onboarding 旗舰职业卡置顶
- **5 个面试预置知识库全量审计与修复**：algorithm-200 / frontend / backend / ai / llm-app
  - 修复总账：28 条事实错误 + 21 条过时内容 + 73 处深度不足，各库新增题补覆盖缺口
  - 1026 题总量，重复题 / 孤儿题 / 悬空前置均为 0
- **P0-P2 全部完成**：Phase 2-4 节点策展 + 来源新鲜度巡检 + V3 AI 评审运行时 + V4 作品集发布管线
- **测试**：新增 125 个用例（课程模块单测 + 内容完整性 + preset 集成 + portfolio 存储/API/UI），quality-gate 922/922 全绿

---

## 剩余待办（0 项 — P0-P2 全部完成）

### [x] 1. 加深 frontend-to-ai-engineer 轨道的薄答案（YAML）

- **背景**：`frontend-to-ai-engineer` 是策展的 YAML 轨道，18 个节点每个只带 1 条面试题，深度不足。
- **完成情况**：将全部 18 条 `answerSkeleton` 加深到 ≥ 300 字符（含「为什么 / tradeoff / 前端迁移映射」三层结构），重新 `npm run content:compile` 刷新 `public/data/curriculum-graph.json`。
- **验证结果**：
  - `npm run content:validate` 通过
  - `npx tsx scripts/audit-presets.ts` 该轨道：min=319 avg=414 median=409 max=599，严重残缺 0、浅薄 0
  - 原审计误判为「9 条 < 80 字」，实际是 9 条严重残缺 + 9 条浅薄（全部 18 条均 < 300），本次一并修复
- **涉及节点**：18 个 Phase 0/1 节点全部（python.* / llm.* / llm-api.* / prompt.* / frontend.* / project.*）

### [x] 2. 内容质量门禁测试（防再贫血）

- **完成情况**：新增 `__tests__/preset-content-quality.test.ts`（11 个用例），对所有 preset 做成分测试兜底：
  - 答案最小长度阈值（80 字符，与 `audit-presets.ts` 的 `FLAG_ANSWER_MIN` 对齐）
  - `keyPoints` / `followUps` 必填且每条非空
  - 无占位符（`待补充` / `TODO:` / `FIXME:` / `lorem ipsum` 等明确未完成标记；不误伤 HTML `placeholder` 属性、CSS Modules hash 后缀等合法技术术语）
  - `nodeId` 引用有效（防孤儿题）
  - 题目 id 唯一（preset 内 + 跨 preset）
  - 题面不重复（trim + 大小写不敏感）
  - 知识树 `prerequisites` 引用闭环（本地或全局存在）
- **阈值设计**：全局硬阈值 = 80 字符（所有 preset 当前 min ≥ 193，安全余量充足）；300 字符「浅薄线」由 `audit-presets.ts` 手动体检追踪，不进 CI 硬门禁——避免 algorithm-200 的 25 条 < 300 题目让 CI red。当所有 preset 的 min 都达标时可渐进提升阈值。
- **验证结果**：`npm run quality-gate` 全绿（922/922）

### [x] 3. P0 — Phase 2 RAG 节点策展

- **背景**：RAG 是「能找到 AI 工作」与「不能」的分水岭，市场对 RAG 工程师需求远高于「会调 API」的工程师。
- **完成情况**：按 Phase 0-1 同一 Schema 量产 8 个 RAG 节点 + 1 个里程碑项目 + 1 个 Rubric：
  - `rag.embedding-fundamentals` / `rag.chunking-strategies` / `rag.vector-stores` / `rag.retrieval-strategies` / `rag.reranking` / `rag.evaluation` / `rag.production-pipeline`
  - `project.rag-pipeline`（里程碑）+ `content/rubrics/project-rag-pipeline.yaml`
- **来源扩展**：新增 19 条权威来源（Cohere / BGE / Pinecone / Weaviate / Chroma / LlamaIndex / LangChain / RAGAS / Arize 等），`registry.yaml` 总数 27 → 46
- **验证结果**：`npm run content:validate` 通过（38 节点 / 5 Rubric / Phase 2 = 8 节点）

### [x] 4. P0 — 来源新鲜度巡检脚本

- **背景**：`lastVerified` 字段靠人工维护，27+ 条来源会随时间过时；需要自动化巡检防内容腐烂。
- **完成情况**：新增 `scripts/audit-source-freshness.ts` + 接入 `quality-gate`（`npm run content:freshness`）：
  - 按 `lastVerified` 超过 90 天标记 stale
  - 阈值设计：stale 占比 > 30% 时 CI red（避免一两条来源过时就阻塞整个 CI）
  - 检测非法 `lastVerified` 格式（必须 YYYY-MM-DD）
  - 输出可读报告：总数 / 新鲜 / 陈旧 / 非法 + 占比
- **验证结果**：当前 46 来源全部新鲜（0 stale / 0 illegal），巡检通过

### [x] 5. P1 — V3 代码沙箱评测运行时（AI 评审管线）

- **背景**：Rubric 与掌握状态机已就位（`lib/curriculum/verification.ts`），缺「用户提交代码 → 按 Rubric 打分 → 写回 mastery 状态」的运行时。
- **完成情况**：实现 LLM-based AI 评审管线（不引入外部沙箱，先用 LLM 评审替代代码执行，符合 MVP 阶段成本控制）：
  - `lib/ai/project-review.ts`：按 Rubric 维度逐项打分 + 总评 + pass/fail 阈值 + 结构化反馈
  - `app/api/review-project/route.ts`：Edge runtime API，session 鉴权 + 调用 AI 评审 + 返回结构化结果
  - `lib/curriculum/mastery-store.ts`：mastery 状态存储（IndexedDB，V1-V4 进度追踪）
  - `lib/curriculum/server-graph.ts`：服务端按 nodeId 加载 Rubric 与节点元信息
- **设计权衡**：未引入 E2B/Modal 外部沙箱——MVP 阶段 LLM 评审足以验证「项目交付完整性」，代码执行沙箱留作 P3+ 投入（成本/复杂度不匹配当前用户量）

### [x] 6. P1 — Phase 3 Agent 节点策展

- **背景**：Agent 是 LLM 工程化的下一站，市场对「会做 Agent 系统」的工程师需求快速上升。
- **完成情况**：按同一 Schema 量产 5 个 Agent 节点 + 1 个里程碑项目 + 1 个 Rubric：
  - `agent.fundamentals` / `agent.langgraph-orchestration` / `agent.tool-ecosystem`（含 MCP）/ `agent.memory-and-state` / `agent.hitl-safety`
  - `project.agent-system`（里程碑）+ `content/rubrics/project-agent-system.yaml`
- **验证结果**：`npm run content:validate` 通过（Phase 3 = 6 节点）

### [x] 7. P2 — Phase 4 工程化节点策展

- **背景**：工程化是「能上生产」的最后一公里，从 demo 到产品的跨越。
- **完成情况**：按同一 Schema 量产 5 个工程化节点 + 1 个 Capstone 里程碑 + 1 个 Rubric：
  - `eng.llm-eval-system` / `eng.observability` / `eng.prompt-injection-defense` / `eng.cost-latency-optimization` / `eng.production-deployment`
  - `project.capstone`（毕业项目）+ `content/rubrics/project-capstone.yaml`
- **验证结果**：`npm run content:validate` 通过（Phase 4 = 6 节点）

### [x] 8. P2 — 作品集发布（V4 验证等级）落地

- **背景**：作品集是用户唯一能带去面试的「硬资产」。V4（portfolio-release）此前只是 schema 里的字符串，没有对应交付物。
- **完成情况**：实现端到端作品集发布管线（本地草稿 → V3 AI 评审 → 云端发布 → 公开访问）：
  - **数据层**：`lib/types/portfolio.ts`（PortfolioEntry / PublicPortfolio 类型）+ `lib/curriculum/portfolio-store.ts`（IndexedDB CRUD + 状态机：draft → published）+ `lib/storage/kv.ts` 扩展 portfolio KV 接口 + `lib/sync.ts` 集成同步
  - **API 层**：`app/api/portfolio/[username]/route.ts`（GET 公开 / PUT 鉴权发布 / DELETE 撤销）+ `app/api/review-project/route.ts`（V3 AI 评审）
  - **UI 层**：`components/PortfolioEditorModal.tsx`（创建/编辑模态，必填校验 + 评审结果只读展示）+ `app/portfolio/page.tsx`（用户管理台：CRUD + 云同步 + 发布状态）+ `app/u/[username]/portfolio/`（公开作品集页，loading/empty/error/ready 四态）
  - **设计契约**：「发布 = AI 已验证」——评审字段（score/passed/feedback）由 V3 AI 生成，编辑器中只读，保证作品集的可信度
- **测试覆盖**：3 个新测试文件共 17 个用例
  - `__tests__/portfolio-store.test.ts`（9 用例）：CRUD + 状态机 + 数据一致性
  - `__tests__/api-portfolio.test.ts`（4 用例）：KV 存储 + 用户隔离
  - `__tests__/portfolio-editor.test.tsx`（8 用例）：表单校验 + 提交 + 评审展示 + 模态交互
- **验证结果**：`npm run quality-gate` 全绿（922/922）

---

## 接下来要完成什么（分析与建议）

> P0-P2 已全部完成。以下是 P3+ 的可选方向，从「乔布斯视角（产品）」与「卡帕西视角（技术）」两个维度分析。

### 一、产品视角（乔布斯）：从「能学完」到「能找到工作」

内容层 + 验证层 + 作品集层已全部就位（38 节点 / 5 Rubric / V1-V4 全链路），用户可以走完「学习 → 验证 → 作品集 → 公开展示」的完整闭环。接下来的产品杠杆点：

1. **真实代码沙箱（V3 升级）** — 当前 V3 是 LLM 评审（看 README/代码片段/文档），没有真正执行用户代码。对于「CLI 工具」「RAG 管线」这类需要运行时验证的项目，LLM 评审的信号强度不如真实执行。建议接 E2B / Modal / Cloudflare Durable Objects 沙箱，让用户提交的代码真正跑起来，按 Rubric 自动化测试用例打分。这是把「AI 评审」从「主观判断」升级到「客观信号」的关键。

2. **作品集的「面试官视角」** — 当前公开页 (`/u/[username]/portfolio`) 是平铺卡片，面试官 30 秒内看不出「这人值不值得面试」。建议加：① 一句话定位（如「前端转 AI 工程师，3 个月完成 5 个 LLM 项目」）；② 技能雷达图（从 mastery 状态聚合）；③ 项目难度标签（V3/V4 + Rubric 分数）。让作品集从「项目列表」变成「求职叙事」。

3. **学习节奏的「智能调度」** — 当前路径引擎是静态 DAG，所有用户走同一顺序。但有人卡在 Python 有人卡在 RAG，应该基于 mastery 状态动态跳过已掌握节点 + 加强薄弱节点。这是把「路径引擎」从「地图」升级到「导航」。

### 二、技术视角（卡帕西）：架构稳，重点在「可观测」与「成本」

技术债低，因为内容层是纯函数 + 编译产物，schema 严格。真正的技术投资方向：

1. **Prompt 自身的 Eval 体系** — `prompt.versioning-and-testing` 节点教用户做 Prompt 回归测试，但本产品的 Prompt（AI 评审、AI 生成知识树）自己没有回归测试。建议新增 Prompt 输出的成分测试（与 `preset-content-quality.test.ts` 同构）：固定输入 → 断言输出结构 + 关键字段 + 长度阈值。这是「鞋匠的孩子没鞋穿」问题。

2. **AI 评审的成本/延迟可观测** — V3 AI 评审每次调用 LLM，但没有 trace。建议接 Langfuse / Helicone（或自建最小 trace）：记录每次评审的 input/output/latency/cost/tokens，按 Rubric 维度聚合分数分布。这是把「AI 评审」从「黑盒」变成「可优化的工程系统」。

3. **内容新鲜度的自动化 V2** — 当前 `audit-source-freshness.ts` 只查 `lastVerified` 时间戳，不验证 URL 可达性。建议加：① 定期 HEAD 请求验证 URL 200；② 用 LLM 抽样比对来源内容与节点摘要是否一致（防「来源还在但内容已大改」）。成本可控（每周跑一次），能防内容腐烂。

### 三、建议的执行顺序（P3+ 可选）

| 优先级 | 任务 | 类型 | 预估工作量 |
|---|---|---|---|
| P3 | 真实代码沙箱（V3 升级） | 技术 | E2B/Modal 选型 + 测试用例编写 + 集成 |
| P3 | Prompt 自身 Eval 体系 | 技术 | 评审/知识树 Prompt 回归测试 |
| P3 | 作品集面试官视角 | 产品+设计 | 公开页重构 + 技能雷达图 |
| P4 | AI 评审可观测（trace） | 技术 | Langfuse/Helicone 接入 |
| P4 | 学习节奏智能调度 | 技术+算法 | mastery-aware 路径推荐 |
| P4 | 内容新鲜度 V2（URL + LLM 比对） | 技术 | 巡检脚本升级 |

**核心判断**：P0-P2 把「学习-验证-作品集」的完整闭环跑通了，用户可以从 0 走到能拿作品集去面试。P3+ 的核心是「信号强度升级」——把主观判断变客观执行、把黑盒变可观测、把静态地图变动态导航。

---

## 后续可选（非本次重构范围，已全部完成）

- [x] Phase 2-4（RAG / Agent / 工程化）技能节点策展——按同一 Schema 量产（20 节点 + 3 Rubric）
- [x] V3 代码沙箱评测运行时（Rubric 与掌握状态机已就位）→ LLM 评审管线落地
- [x] 作品集发布（V4 验证等级）落地 → 端到端发布管线 + 公开展示页
