# 质量门禁与学习/复习体验重做 Spec

## Why

近期又一次因为 ESLint 问题导致发布失败（`next build` 在 deploy 工作流里才跑 lint，错误暴露太晚）；学习详情页点击「调整计划」直接抛 `TypeError: Cannot read properties of undefined (reading 'includes')`（旧 routine 数据缺字段）；复习页过滤条件形同虚设（只能按 deckId 过滤）、卡片无法删除、没有上一条/下一条导航。三件事本质同一类问题：**质量护栏缺位 + 核心交互未以用户心智为本打磨**。

目标：
1. 把质量门禁前移到部署之前，让 ESLint/类型/单测错误在 CI 早期暴露并阻断；
2. 修掉调整计划页的崩溃根因，并把该页交互从「四段平铺」收敛为「可聚焦的分步编辑」；
3. 重做复习页：过滤真正生效、可删除、可上下导航、卡片元数据可见。

### 关于 `@ai-spec/skill` 的评估结论（卡帕西视角）

调研了 `https://github.com/soulor8908/ai-spec-skill`。**不直接引入**，理由：
- 仅 GitHub 仓库分发（`npm install @ai-spec/skill@github:...`），无 npm registry 版本锚定，CI 安装脆弱；
- 其 RuleEngine 面向 `.ai-spec/` 目录的 spec 文档校验，本项目用 `.trae/specs/`，目录约定不兼容；
- 其 InjectPipeline 面向「给既有项目注入 spec 脚手架」的一次性改造，不是日常代码质量护栏；
- 它解决的是「spec 文档质量」，而当前痛点是「代码 ESLint 错误漏到部署」，二者不在同一层。

转而**借鉴其方法论内核**（spec-first + rule engine + safety net + rollback），用本项目既有工具链（ESLint + tsc + vitest + git）落地。这是最简有效解——用对工具，不堆叠依赖。

## What Changes

### 一、CI 质量门禁前移（借鉴 ai-spec-skill 的 safety net 思想）

- **BREAKING**: `.github/workflows/deploy-devpath.yml` 拆为两个 job：`quality-gate`（lint + typecheck + unit test）→ `deploy`（build + 上线）。`deploy` 依赖 `quality-gate` 通过
- 触发分支从仅 `main` 扩展到 `main` + `develop`（让错误在 develop 阶段就暴露，不等到合并 main）
- `package.json` 新增 `typecheck` 脚本（`tsc --noEmit`）与 `quality-gate` 脚本（`npm run lint && npm run typecheck && npm test`）
- 新增 `scripts/install-git-hooks.sh`：安装 pre-push 钩子（运行 `npm run lint` 与 `npm run typecheck`），本地可选执行；CI 不依赖该钩子，仅靠 workflow job 兜底
- `docs/DEVELOPMENT.md` 追加一节「质量门禁」说明本地如何跑 `npm run quality-gate` 与安装钩子

### 二、修复「调整计划」TypeError + 交互收敛

- **根因**：[PlanEditClient.tsx](file:///workspace/app/learn/%5BplanId%5D/edit/PlanEditClient.tsx) 加载 `getRoutine()` 后直接用 `routine.weekdays.includes(day)` / `routine.slots.map(...)`。IndexedDB 里存的旧 routine 可能缺 `weekdays` 或 `slots` 字段 → `undefined.includes` 崩溃
- **修复**：在 [lib/learn-log.ts](file:///workspace/lib/learn-log.ts) 新增 `normalizeRoutine(r?: Routine): Routine`，对 `wakeTime / sleepTime / slots / weekdays / intensity` 逐字段回退到 `DEFAULT_ROUTINE`；`PlanEditClient` 加载时 `setRoutine(normalizeRoutine(r))`
- **交互重做（乔布斯视角：砍掉噪声，聚焦决策）**：
  - 四段（作息 / 优先级 / 题目包含 / AI 调整）改为**手风琴折叠**，默认只展开第一段，其余点击展开
  - 底部新增**吸底保存条**（sticky），始终可见「保存全部修改」+ 未保存变更指示点
  - 顶部「调整计划」入口的 title 从冗长文案改为「编辑作息、优先级与题目范围」
  - AI 调整成功后，吸底条显示「日程已更新，记得保存」高亮提示

### 三、复习页重做（过滤生效 + 可删除 + 可导航）

- **BREAKING**: [app/review/page.tsx](file:///workspace/app/review/page.tsx) 重写过滤栏与卡片导航
- **过滤**：从仅 `deckId` 扩展为多维过滤，且过滤结果与展示卡片强绑定：
  - 来源计划（planId，从 allCards 反查 plan topic）
  - 知识点（nodeId）
  - 难度（1-5，反查 plan.knowledgeTree）
  - 到期状态（逾期 / 今日 / 未来 7 天 / 全部）
  - 大厂高频（bigTech）
  - 关键词搜索（匹配 front/back）
  - 过滤后重新计算 `dueCards`，进度条 / 计数 / 导航全部基于过滤后集合
- **导航**：
  - 上一条 / 下一条按钮（始终可见，到达边界时 disabled）
  - 卡片计数器 `3 / 15`，点击展开跳转滑块
  - 键盘快捷键：`←` 上一条、`→` 下一条、`1-4` 评分（答案显示后生效）、`Space` 显示答案
- **删除**：
  - 卡片右上角「删除」按钮 → `confirmDialog` 确认 → `delItem(KEY_PREFIXES.CARD + id)` → 从 allCards 移除 → 重新计算 dueCards
  - 删除后若当前索引越界，自动 clamp 到最后一张
- **跳过 / 暂埋**：
  - 「跳过」按钮：不评分，直接 `setCurrentIndex(i+1)`，卡片保持 due 状态（稍后可回来）
  - 「暂不复习」按钮：把卡片 id 加入本次 session 的 `buriedIds: Set<string>`，本次不再出现（刷新页面清空）
- **卡片元数据**：在卡片上方显示来源计划标题、知识点标题、难度、大厂徽标、上次复习时间、下次到期时间、reps / lapses
- **布局**：过滤栏可折叠（进入复习时自动收起，腾出空间聚焦卡片）

## Impact

### Affected specs
- 现有 `ux-overhaul-and-learning-flow-rework` spec 的「Learn Stats Buttons」需求不受影响
- 现有 `smart-learning-expansion` spec 的「Rate Limit Enforcement」需求不受影响
- 新增独立能力：CI Quality Gate / Review Navigation / Review Delete

### Affected code
- 修改文件 5 个：
  - `.github/workflows/deploy-devpath.yml`（拆 quality-gate job + develop 触发）
  - `package.json`（新增 typecheck / quality-gate 脚本）
  - `lib/learn-log.ts`（新增 normalizeRoutine）
  - `app/learn/[planId]/edit/PlanEditClient.tsx`（用 normalizeRoutine + 手风琴 + 吸底保存条）
  - `app/review/page.tsx`（多维过滤 + 导航 + 删除 + 跳过 + 元数据 + 键盘快捷键）
  - `docs/DEVELOPMENT.md`（追加质量门禁说明）
- 新增文件 2 个：
  - `scripts/install-git-hooks.sh`（安装 pre-push 钩子）
  - `.git/hooks/pre-push`（由脚本生成，不入库；脚本里 heredoc 写入）
- 新增单测：
  - `__tests__/learn-log.test.ts` 增补 `normalizeRoutine` 用例（若文件不存在则新建）
  - `__tests__/review-filter.test.ts` 新建：多维过滤 + dueCards 联动

## ADDED Requirements

### Requirement: CI Quality Gate
系统 SHALL 在部署前运行 lint + typecheck + unit test 三重门禁，任一失败则阻断部署。

#### Scenario: ESLint 存在 error
- **GIVEN** develop 分支推送了含 ESLint error 的代码
- **WHEN** GitHub Actions 触发 `quality-gate` job
- **THEN** `npm run lint` 以非零退出码失败
- **AND** `deploy` job 被跳过（needs: quality-gate）
- **AND** job 日志明确显示是 lint 失败（而非 build 失败）

#### Scenario: 类型错误
- **GIVEN** 代码含 `tsc` 报错
- **WHEN** `quality-gate` job 运行 `npm run typecheck`
- **THEN** 失败并阻断 deploy

#### Scenario: 全部通过
- **GIVEN** lint / typecheck / test 全绿
- **WHEN** `quality-gate` job 完成
- **THEN** `deploy` job 启动 build + 上线

### Requirement: Routine Normalization
系统 SHALL 在加载 Routine 时对每个字段做回退，避免旧数据缺字段导致渲染崩溃。

#### Scenario: 旧数据缺 weekdays
- **GIVEN** IndexedDB 中 routine 为 `{ wakeTime: "08:00", sleepTime: "23:00" }`（无 weekdays / slots）
- **WHEN** PlanEditClient 调用 `normalizeRoutine(r)`
- **THEN** 返回完整 Routine，`weekdays = [1,2,3,4,5]`、`slots = DEFAULT_ROUTINE.slots`、`intensity = "standard"`
- **AND** 渲染不抛 TypeError

#### Scenario: routine 完全为空
- **GIVEN** `getRoutine()` 返回 undefined
- **WHEN** 调用 `normalizeRoutine(undefined)`
- **THEN** 返回 `DEFAULT_ROUTINE`

### Requirement: Review Multi-Dimensional Filter
系统 SHALL 支持按计划 / 知识点 / 难度 / 到期状态 / 大厂 / 关键词六维过滤复习卡片，过滤结果与展示强绑定。

#### Scenario: 按难度过滤
- **GIVEN** 用户选择「难度 4」
- **WHEN** 过滤栏应用
- **THEN** dueCards 仅包含知识点难度为 4 的到期卡片
- **AND** 进度条 / 计数 / 导航全部基于过滤后集合

#### Scenario: 多维叠加
- **GIVEN** 用户同时选「计划 A + 大厂 + 逾期」
- **WHEN** 过滤应用
- **THEN** dueCards = 计划 A 下 + bigTech=true + due < now 的卡片
- **AND** 任一维度变化都重新计算

### Requirement: Review Card Navigation
系统 SHALL 提供上一条/下一条导航、计数器、键盘快捷键，用户可在卡片间自由跳转。

#### Scenario: 上一条
- **GIVEN** 当前在第 3 张
- **WHEN** 用户点击「上一条」或按 `←`
- **THEN** 当前索引变为 2
- **AND** 第 1 张时「上一条」按钮 disabled

#### Scenario: 评分后不强制前进
- **GIVEN** 用户对第 3 张评分 Good
- **WHEN** 评分完成
- **THEN** 卡片状态更新（写回 IndexedDB）
- **AND** 自动前进到第 4 张（保留原行为，但用户可点「上一条」回到已评分的卡片查看）

### Requirement: Review Card Delete
系统 SHALL 允许用户删除复习卡片，删除需二次确认。

#### Scenario: 删除单张
- **GIVEN** 用户点击卡片右上角「删除」
- **WHEN** confirmDialog 确认
- **THEN** `delItem(KEY_PREFIXES.CARD + id)` 删除卡片
- **AND** 从 allCards 与 dueCards 移除
- **AND** 当前索引 clamp 到有效范围

### Requirement: Review Card Skip and Bury
系统 SHALL 允许用户跳过当前卡片（不评分）或暂埋（本次不再出现）。

#### Scenario: 跳过
- **WHEN** 用户点击「跳过」
- **THEN** 当前索引 +1，卡片保持 due 状态
- **AND** 用户可通过「上一条」回来评分

#### Scenario: 暂埋
- **WHEN** 用户点击「暂不复习」
- **THEN** 卡片 id 加入 `buriedIds`，本次 session 从 dueCards 过滤掉
- **AND** 刷新页面后 buriedIds 清空

### Requirement: Review Card Metadata Display
系统 SHALL 在卡片上方显示来源计划、知识点、难度、大厂徽标、上次/下次复习时间、reps/lapses。

#### Scenario: 展示元数据
- **WHEN** 渲染当前卡片
- **THEN** 顶部显示：`计划: 前端性能优化 · 知识点: 事件循环 · 难度 4 · 大厂高频`
- **AND** 次行显示：`上次复习: 2 天前 · 下次到期: 今天 · 复习 3 次 · 失误 1 次`

## MODIFIED Requirements

### Requirement: Deploy Workflow
原 `.github/workflows/deploy-devpath.yml` 仅在 push main 时触发，且 lint 错误在 `next build` 阶段才暴露。修改为：拆 `quality-gate` job 前置，触发分支增加 develop，deploy 依赖 quality-gate 通过。

### Requirement: Plan Edit Page Interaction
原 [PlanEditClient.tsx](file:///workspace/app/learn/%5BplanId%5D/edit/PlanEditClient.tsx) 四段平铺、保存按钮在页面最底部需滚动寻找、加载 routine 不做字段回退。修改为：手风琴折叠 + 吸底保存条 + normalizeRoutine 兜底。

### Requirement: Review Page Filter and Navigation
原 [app/review/page.tsx](file:///workspace/app/review/page.tsx) 仅按 deckId 过滤、评分后强制前进无导航、无删除。修改为：六维过滤 + 上下导航 + 删除 + 跳过/暂埋 + 元数据展示 + 键盘快捷键。

## REMOVED Requirements

### Requirement: Review Auto-Advance Without Navigation
**Reason**: 评分后只能前进不能回看，用户无法回头检查刚评分的卡片。
**Migration**: 保留「评分后自动前进」作为默认行为，但新增「上一条」按钮允许回退。导航与评分解耦。
