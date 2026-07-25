# TODO — 内容层重构剩余工作

> 本文件记录「策展式课程内容层 + 路径引擎 + 验证层」重构的剩余待办。
> 会话任务系统里的任务清单不进仓库，此文件是它在仓库中的持久化快照。
> 最近更新：2026-07-25

## 状态总览

已完成的大块工作（均已提交并推送至 `origin/main`）：

- **L1 内容层（Content-as-Code）**：`content/`（27 条权威来源、18 个 Phase 0/1 技能节点、旗舰轨道、2 个里程碑 Rubric）
- **L2 路径引擎 + L3 验证层**：`lib/curriculum/`（schema/loader/graph/path-engine/verification，全部纯函数）
- **编译管线**：`scripts/compile-content.ts`（`content:validate` / `content:compile` + 产物新鲜度校验），接入 quality-gate
- **UI 集成**：`lib/presets/frontend-to-ai-engineer.ts` preset 化 + onboarding 旗舰职业卡置顶
- **5 个面试预置知识库全量审计与修复**：algorithm-200 / frontend / backend / ai / llm-app
  - 修复总账：28 条事实错误 + 21 条过时内容 + 73 处深度不足，各库新增题补覆盖缺口
  - 1026 题总量，重复题 / 孤儿题 / 悬空前置均为 0
- **测试**：新增 100 个用例（课程模块单测 + 内容完整性 + preset 集成），quality-gate 897/897 全绿

相关提交：`a244fcb`（内容层）、`8b67bda`（preset 内容修复）等，均已推送。

---

## 剩余待办（0 项 — 本次重构收尾完成）

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
- **验证结果**：`npm run quality-gate` 全绿（897/897，较修复前 +11 用例）

---

## 接下来要完成什么（分析与建议）

> 以下从「乔布斯视角（产品）」与「卡帕西视角（技术）」两个维度分析。

### 一、产品视角（乔布斯）：先把已有内容的价值释放给用户

内容层重构已完成（27 来源 / 18 节点 / 1026 题 / 质量门禁），但**用户感知到的价值还远未释放**。当前旗舰轨道只有 Phase 0-1（语言桥接 + LLM API 工程化），用户走完 16-20 周后就「无路可走」。最大的产品风险不是内容不够深，而是**用户走不到能产生求职收益的那一天**。

按用户价值排序的下一步：

1. **Phase 2 RAG 节点策展（最高优先级）** — 这是「能找到 AI 工作」与「不能」的分水岭。市场对 RAG 工程师的需求远高于「会调 API」的工程师。建议按 Phase 0-1 的同一 Schema 量产 6-8 个 RAG 节点（chunking / embedding / vector store / retrieval / reranking / eval），每个带 2-3 条面试题 + 1 个里程碑项目。这是把「学习轨迹即求职资产」从口号变成现实的关键一跃。

2. **里程碑项目的「可交付」闭环** — 现在两个 Rubric（CLI 工具 / 流式对话应用）只有评分细则，没有「用户提交 → AI 评审 → 反馈」的运行时。用户做完了项目没人评，等于白做。这是 V3 代码沙箱评测运行时的事，但产品上应该先想清楚「用户提交什么、得到什么反馈、反馈如何回写学习计划」。

3. **作品集发布（V4 验证等级）落地** — 这是用户唯一能带去面试的「硬资产」。当前 masteryCheck 有 V1-V4 四级，但 V4（portfolio-release）只是 schema 里的字符串，没有对应的交付物。产品上要回答：用户发布什么、发布到哪里、面试官能看到什么。

### 二、技术视角（卡帕西）：架构已就位，重点在「评测闭环」与「可观测」

技术债不高，因为内容层是纯函数 + 编译产物，schema 严格。真正的技术投资方向：

1. **V3 代码沙箱评测运行时** — Rubric 与掌握状态机已就位（`lib/curriculum/verification.ts`），缺的是「用户提交代码 → 沙箱执行 → 按 Rubric 打分 → 写回 mastery 状态」的运行时。技术选型建议：Cloudflare Workers + Durable Objects（沙箱隔离）或对接 E2B / Modal（外部沙箱）。这是把「学习-验证」从「自我感觉」变成「客观信号」的工程基础。

2. **Eval 体系自身需要 Eval** — `prompt.versioning-and-testing` 节点教用户做 Prompt 回归测试，但本产品的 Prompt（AI 生成知识树、AI 评审项目）自己有没有回归测试？这是「鞋匠的孩子没鞋穿」问题。建议把 `scripts/audit-presets.ts` 升级为 CI 步骤（目前是手动体检），并新增 Prompt 输出的成分测试（与 `preset-content-quality.test.ts` 同构）。

3. **内容新鲜度的自动化** — `lastVerified` 字段现在靠人工维护，27 条来源会随时间过时。建议加一个「来源新鲜度巡检脚本」：按 `lastVerified` 超过 90 天的来源标记 stale，提醒人工复核 URL 可达性与内容准确性。这比 RAG 节点策展成本低，但能防内容腐烂。

### 三、建议的执行顺序

| 优先级 | 任务 | 类型 | 预估节点/工作量 |
|---|---|---|---|
| P0 | Phase 2 RAG 节点策展 | 内容 | 6-8 节点 + 1 里程碑 |
| P0 | 来源新鲜度巡检脚本 | 技术 | 1 脚本 + CI 接入 |
| P1 | V3 代码沙箱评测运行时 | 技术 | 沙箱选型 + 评审管线 |
| P1 | Phase 3 Agent 节点策展 | 内容 | 5-7 节点 + 1 里程碑 |
| P2 | Phase 4 工程化节点策展 | 内容 | 5-6 节点 + Capstone |
| P2 | 作品集发布（V4）落地 | 产品+技术 | 发布管线 + 展示页 |

**核心判断**：内容层重构的「内功」已练完，接下来应转向「外功」——让用户能跑完轨道、能交项目、能拿作品集去面试。RAG 节点 + 评测运行时是两个最高杠杆点。

---

## 后续可选（非本次重构范围）

- Phase 2-4（RAG / Agent / 工程化）技能节点策展——按同一 Schema 量产
- V3 代码沙箱评测运行时（Rubric 与掌握状态机已就位）
- 作品集发布（V4 验证等级）落地
