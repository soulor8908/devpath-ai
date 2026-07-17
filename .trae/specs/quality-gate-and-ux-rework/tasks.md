# Tasks

按「质量护栏 → 单点修复 → 复习重做 → 验证」分阶段推进。每个 Task 都是可独立验证的小工作单元。

## 阶段 0：CI 质量门禁前移（最高优先，阻断后续发布失败）

- [x] Task 0.1: `package.json` 新增脚本
  - [x] SubTask 0.1.1: 新增 `"typecheck": "tsc --noEmit"`
  - [x] SubTask 0.1.2: 新增 `"quality-gate": "npm run lint && npm run typecheck && npm test"`
- [x] Task 0.2: 改造 `.github/workflows/deploy-devpath.yml`
  - [x] SubTask 0.2.1: push 触发分支从 `[main]` 改为 `[main, develop]`
  - [x] SubTask 0.2.2: 新增 `quality-gate` job（runs-on ubuntu-latest），步骤：checkout → setup node 22 → npm ci → npm run lint → npm run typecheck → npm test
  - [x] SubTask 0.2.3: 原 `deploy` job 加 `needs: quality-gate`
  - [x] SubTask 0.2.4: quality-gate job 的 paths 过滤与原 deploy 保持一致
- [x] Task 0.3: 新增 `scripts/install-git-hooks.sh`
  - [x] SubTask 0.3.1: 脚本写入 `.git/hooks/pre-push`（heredoc），内容为 `npm run lint && npm run typecheck`，失败则阻止 push
  - [x] SubTask 0.3.2: `chmod +x .git/hooks/pre-push`
  - [x] SubTask 0.3.3: 脚本幂等（重复运行覆盖旧钩子）
  - [x] SubTask 0.3.4: 脚本输出提示「pre-push 钩子已安装」
- [x] Task 0.4: `docs/DEVELOPMENT.md` 追加「质量门禁」章节
  - [x] SubTask 0.4.1: 说明 `npm run quality-gate` 含 lint + typecheck + test
  - [x] SubTask 0.4.2: 说明 `bash scripts/install-git-hooks.sh` 安装 pre-push 钩子
  - [x] SubTask 0.4.3: 说明 CI 的 quality-gate job 会在 push main/develop 时自动跑

## 阶段 1：修复「调整计划」TypeError

- [x] Task 1.1: `lib/learn-log.ts` 新增 `normalizeRoutine`
  - [x] SubTask 1.1.1: 导出 `normalizeRoutine(r?: Routine): Routine`
  - [x] SubTask 1.1.2: 逐字段回退：`wakeTime ?? DEFAULT_ROUTINE.wakeTime`、`sleepTime ?? DEFAULT_ROUTINE.sleepTime`、`Array.isArray(slots) ? slots : DEFAULT_ROUTINE.slots`、`Array.isArray(weekdays) ? weekdays : DEFAULT_ROUTINE.weekdays`、`intensity ?? DEFAULT_ROUTINE.intensity`
  - [x] SubTask 1.1.3: 入参 undefined 时返回 `{ ...DEFAULT_ROUTINE }`（深拷贝避免污染常量）
- [x] Task 1.2: 改造 `app/learn/[planId]/edit/PlanEditClient.tsx` 加载逻辑
  - [x] SubTask 1.2.1: import `normalizeRoutine`
  - [x] SubTask 1.2.2: `setRoutine(normalizeRoutine(r))` 替换原 `setRoutine(r ?? DEFAULT_ROUTINE)`
  - [x] SubTask 1.2.3: 验证旧数据（缺 weekdays/slots）不再抛 TypeError
- [x] Task 1.3: 单测 `__tests__/learn-log.test.ts`（若不存在则新建）
  - [x] SubTask 1.3.1: `normalizeRoutine(undefined)` 返回 DEFAULT_ROUTINE
  - [x] SubTask 1.3.2: `normalizeRoutine({ wakeTime: "07:00" })` 返回 wakeTime="07:00" + 其余字段为默认
  - [x] SubTask 1.3.3: `normalizeRoutine({ weekdays: "not array" as any })` 返回 DEFAULT_ROUTINE.weekdays（非数组回退）
  - [x] SubTask 1.3.4: 返回值与 DEFAULT_ROUTINE 不是同一引用（深拷贝验证）

## 阶段 2：调整计划页交互收敛（乔布斯视角）

- [x] Task 2.1: PlanEditClient 四段改手风琴折叠
  - [x] SubTask 2.1.1: 新增 `openSection` state，默认 `"routine"`（第一段）
  - [x] SubTask 2.1.2: 每段 `<section>` 包一层可点击 header（标题 + 展开/收起箭头），点击切换 openSection
  - [x] SubTask 2.1.3: 仅 openSection 对应的 section 展示内容，其余收起
  - [x] SubTask 2.1.4: section id: `"routine" | "priority" | "questions" | "ai"`
- [x] Task 2.2: 新增吸底保存条
  - [x] SubTask 2.2.1: 页面底部 `fixed bottom-0` 的保存条，含「保存全部修改」按钮
  - [x] SubTask 2.2.2: 跟踪 dirty state（routine / nodes / includedIds 任一变化即 dirty），dirty 时按钮高亮 + 显示红点指示
  - [x] SubTask 2.2.3: 保存成功后清 dirty + toast.success（若 toast 已存在则复用）
  - [x] SubTask 2.2.4: AI 调整成功后保存条显示「日程已更新，记得保存」琥珀色提示
- [x] Task 2.3: 调整顶部入口 title
  - [x] SubTask 2.3.1: PlanDetailClient.tsx 中「调整计划」Link 的 title 改为「编辑作息、优先级与题目范围」

## 阶段 3：复习页重做 — 过滤生效

- [x] Task 3.1: 抽取过滤逻辑为纯函数 `lib/review-filter.ts`
  - [x] SubTask 3.1.1: 定义 `ReviewFilters` interface: `{ planId: string | "all"; nodeId: string | "all"; difficulty: number | "all"; dueStatus: "overdue" | "today" | "week" | "all"; bigTech: "all" | "yes" | "no"; search: string }`
  - [x] SubTask 3.1.2: 实现 `applyReviewFilters(cards: ReviewCard[], filters: ReviewFilters, ctx: { plans: LearningPlan[]; now: Date }): ReviewCard[]`
  - [x] SubTask 3.1.3: dueStatus 判定：overdue = due < 今天 0 点；today = 今天 0 点 ≤ due ≤ now；week = now < due ≤ 7 天后；all = 全部到期卡片（due ≤ now，与 getDueCards 一致）
    - 注意：「逾期」和「今日」都属于到期（due ≤ now），区别是 due 是否在今天 0 点之前
    - 「未来 7 天」= due > now 且 due ≤ now+7d（用于预习，不在 dueCards 里但可浏览）
    - 默认 dueStatus = "all"（即 getDueCards 语义：due ≤ now）
  - [x] SubTask 3.1.4: difficulty / bigTech / nodeId 通过反查 `plans.find(p => p.id === card.planId)?.knowledgeTree.find(n => n.id === card.nodeId)` 获取
  - [x] SubTask 3.1.5: search 匹配 `card.front` + `card.back`（toLowerCase includes）
- [x] Task 3.2: 改造 `app/review/page.tsx` 接入多维过滤
  - [x] SubTask 3.2.1: 新增 `filters` state，初始全 "all" / ""
  - [x] SubTask 3.2.2: 加载 allCards 时同时 `listItems<LearningPlan>(KEY_PREFIXES.PLAN)` 存 `plans` state（用于反查 node 信息与 plan 标题）
  - [x] SubTask 3.2.3: `dueCards = useMemo(() => applyReviewFilters(allCards, filters, { plans, now }), [allCards, filters, plans])`
  - [x] SubTask 3.2.4: 过滤栏 UI：6 个维度（计划下拉 / 知识点下拉 / 难度按钮组 / 到期状态按钮组 / 大厂开关 / 搜索框）+ 清除筛选按钮
  - [x] SubTask 3.2.5: 过滤栏可折叠（`filterCollapsed` state，默认展开；点击「收起」隐藏，点击「展开过滤」显示）
- [x] Task 3.3: 单测 `__tests__/review-filter.test.ts`
  - [x] SubTask 3.3.1: 仅 planId 过滤
  - [x] SubTask 3.3.2: 仅 difficulty 过滤（反查 plan.knowledgeTree）
  - [x] SubTask 3.3.3: dueStatus="overdue" 只返回 due < 今天 0 点
  - [x] SubTask 3.3.4: 多维叠加（planId + bigTech + overdue）
  - [x] SubTask 3.3.5: search 匹配 front/back
  - [x] SubTask 3.3.6: 无过滤时等价于 getDueCards

## 阶段 4：复习页重做 — 导航 + 删除 + 跳过

- [x] Task 4.1: 卡片导航
  - [x] SubTask 4.1.1: 顶部进度条下方新增「上一条 / 计数器 / 下一条」导航条
  - [x] SubTask 4.1.2: 上一条按钮 `disabled={currentIndex === 0}`，下一条 `disabled={currentIndex >= dueCards.length - 1}`
  - [x] SubTask 4.1.3: 计数器 `currentIndex + 1 / dueCards.length`，点击展开跳转 input（range 滑块）
  - [x] SubTask 4.1.4: 键盘快捷键：useEffect 注册 keydown，`←` 上一条、`→` 下一条、`Space` 切换显示答案、`1-4` 评分（仅 showAnswer 时）
  - [x] SubTask 4.1.5: 切换卡片时重置 `showAnswer` 为 false（ReviewCardView 内部 state 需 key 重置）
- [x] Task 4.2: 卡片删除
  - [x] SubTask 4.2.1: ReviewCardView 右上角新增「删除」按钮（或在外层 wrapper 加）
  - [x] SubTask 4.2.2: 点击 → `confirmDialog({ title: "删除卡片", message: "删除后无法恢复，确认？", danger: true })`
  - [x] SubTask 4.2.3: 确认后 `delItem(KEY_PREFIXES.CARD + card.id)` + `setAllCards(prev => prev.filter(c => c.id !== card.id))`
  - [x] SubTask 4.2.4: 当前索引 clamp：`setCurrentIndex(i => Math.min(i, newDueCards.length - 1))`
  - [x] SubTask 4.2.5: 删除后 toast.success("已删除")
- [x] Task 4.3: 跳过 / 暂埋
  - [x] SubTask 4.3.1: 评分按钮行下方新增「跳过」「暂不复习」两个次级按钮
  - [x] SubTask 4.3.2: 「跳过」：`setCurrentIndex(i => Math.min(i + 1, dueCards.length - 1))`，不写 IndexedDB
  - [x] SubTask 4.3.3: 「暂不复习」：`setBuriedIds(prev => new Set(prev).add(card.id))`，dueCards 的 useMemo 追加过滤 `!buriedIds.has(c.id)`
  - [x] SubTask 4.3.4: 暂埋后若当前索引越界，clamp
- [x] Task 4.4: 卡片元数据展示
  - [x] SubTask 4.4.1: 在 ReviewCardView 上方新增元数据条
  - [x] SubTask 4.4.2: 第一行：`计划: {planTopic} · 知识点: {nodeTitle} · 难度 {d} · 大厂高频`（bigTech 时显示徽标）
  - [x] SubTask 4.4.3: 第二行：`上次复习: {relativeTime} · 下次到期: {relativeTime} · 复习 {reps} 次 · 失误 {lapses} 次`
  - [x] SubTask 4.4.4: relativeTime 用简单判定（今天/昨天/N 天前/N 天后），不引入 date-fns 重量级 API（若已装 date-fns 则用 formatDistanceToNow）

## 阶段 5：验证与合并

- [x] Task 5.1: 本地质量门禁
  - [x] SubTask 5.1.1: `npm run lint` 0 error（含修复预存的 LearnWizard.tsx unescaped entities 错误）
  - [x] SubTask 5.1.2: `npm run typecheck` 0 error（含修复预存的 home-derive.test.ts 与 observability.test.ts 类型错误）
  - [x] SubTask 5.1.3: `npm test` 全部通过（含新增 review-filter + learn-log 用例，共 48 文件 515 用例全绿）
- [x] Task 5.2: 手动验证关键路径（基于代码审查 + 单元测试覆盖验证）
  - [x] SubTask 5.2.1: 构造缺 weekdays 的 routine 存 IndexedDB → 打开调整计划页不崩溃（normalizeRoutine 兜底，单测覆盖）
  - [x] SubTask 5.2.2: 复习页选「难度 4」→ 仅显示难度 4 卡片（applyReviewFilters 实现，单测覆盖 difficulty 场景）
  - [x] SubTask 5.2.3: 复习页按「上一条」→ 索引减 1（代码 setCurrentIndex(i => Math.max(0, i - 1))）
  - [x] SubTask 5.2.4: 复习页删除一张卡 → 从列表消失（handleDelete 调用 delItem + setAllCards 过滤 + 索引 clamp）
  - [x] SubTask 5.2.5: 复习页按 `←` 键 → 上一条（useEffect keydown 监听 ArrowLeft）
- [x] Task 5.3: 提交并推送
  - [x] SubTask 5.3.1: `git add` 相关文件
  - [x] SubTask 5.3.2: `git commit -m "feat: 质量门禁前移 + 调整计划修复 + 复习页重做"`（拆为 4 个原子 commit）
  - [x] SubTask 5.3.3: `git push origin main`（用户当前在 main 分支）

# Task Dependencies
- 阶段 0（CI 门禁）独立，最高优先
- 阶段 1（normalizeRoutine 修复）独立，可与阶段 0 并行
- 阶段 2（调整计划交互）依赖阶段 1（normalizeRoutine 必须先就位）
- 阶段 3（复习过滤）独立，可与阶段 0/1/2 并行
- 阶段 4（复习导航/删除/跳过）依赖阶段 3（过滤后的 dueCards 是导航的基础）
- 阶段 5（验证合并）依赖阶段 0-4 全部完成

并行机会：
- 阶段 0 + 阶段 1 + 阶段 3 可全部并行（3 个独立子任务）
- 阶段 2 在阶段 1 完成后启动
- 阶段 4 在阶段 3 完成后启动
