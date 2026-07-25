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
- **测试**：新增 100 个用例（课程模块单测 + 内容完整性 + preset 集成），quality-gate 886/886 全绿

相关提交：`a244fcb`（内容层）、`8b67bda`（preset 内容修复）等，均已推送。

---

## 剩余待办（2 项）

### [ ] 1. 加深 frontend-to-ai-engineer 轨道的 9 条薄答案（YAML）

- **背景**：`frontend-to-ai-engineer` 是策展的 YAML 轨道，18 个节点每个只带 1 条面试题，其中 **9 条答案 < 80 字**，深度不足。
- **待办**：把这 9 条面试答案加深到与面试 preset 同等深度（含「为什么 / tradeoff / 前端迁移映射」），改后重新 `npm run content:compile` 刷新 `public/data/curriculum-graph.json`。
- **涉及节点**（示例，需以体检脚本实际输出为准）：`python.env-tooling`、`prompt.system-and-fewshot` 等。
- **验证**：`npm run content:validate` 通过 + `npx tsx scripts/audit-presets.ts` 该轨道薄答案降为 0。

### [ ] 2. 内容质量门禁测试（防再贫血）

- **待办**：新增 `__tests__/preset-content-quality.test.ts`，对所有 preset 做成分测试兜底：
  - 答案最小长度阈值
  - `keyPoints` / `followUps` 必填
  - 无占位符（TODO / 待补充 / lorem 等）
  - `nodeId` 引用有效
  - 题目 id 唯一、题面不重复
- **目的**：让「内容不再贫血」有 CI 门禁保障，任何人改内容都会被自动拦截。
- **验证**：`npm run quality-gate` 全绿。

---

## 后续可选（非本次重构范围）

- Phase 2-4（RAG / Agent / 工程化）技能节点策展——按同一 Schema 量产
- V3 代码沙箱评测运行时（Rubric 与掌握状态机已就位）
- 作品集发布（V4 验证等级）落地
