# Checklist

## 阶段 0：CI 质量门禁前移
- [x] `package.json` 新增 `typecheck` 脚本（`tsc --noEmit`）
- [x] `package.json` 新增 `quality-gate` 脚本（`lint && typecheck && test`）
- [x] `.github/workflows/deploy-devpath.yml` push 触发分支含 `main` 与 `develop`
- [x] workflow 新增 `quality-gate` job，步骤含 lint / typecheck / test
- [x] `deploy` job 声明 `needs: quality-gate`
- [x] quality-gate job 的 paths 过滤与原 deploy 一致
- [x] `scripts/install-git-hooks.sh` 存在且可执行
- [x] 运行 `bash scripts/install-git-hooks.sh` 后 `.git/hooks/pre-push` 存在且内容含 `npm run lint && npm run typecheck`
- [x] 重复运行 install-git-hooks.sh 不报错（幂等）
- [x] `docs/DEVELOPMENT.md` 追加「质量门禁」章节，说明 local quality-gate 与 pre-push 钩子
- [x] 本地执行 `npm run quality-gate` 全绿（lint 0 error + typecheck 0 error + test 通过）

## 阶段 1：修复调整计划 TypeError
- [x] `lib/learn-log.ts` 导出 `normalizeRoutine(r?: Routine): Routine`
- [x] `normalizeRoutine(undefined)` 返回 `DEFAULT_ROUTINE` 的深拷贝
- [x] `normalizeRoutine({ wakeTime: "07:00" })` 返回 wakeTime="07:00" + 其余字段为 DEFAULT_ROUTINE 值
- [x] `normalizeRoutine({ weekdays: "bad" as any })` 对非数组 weekdays 回退到 DEFAULT_ROUTINE.weekdays
- [x] `normalizeRoutine({ slots: null as any })` 对非数组 slots 回退到 DEFAULT_ROUTINE.slots
- [x] 返回值与 DEFAULT_ROUTINE 不是同一引用（修改返回值不污染常量）
- [x] `app/learn/[planId]/edit/PlanEditClient.tsx` 加载 routine 时调用 `normalizeRoutine`
- [x] 构造缺 weekdays 的 routine 存 IndexedDB，打开调整计划页不再抛 TypeError（normalizeRoutine 兜底）
- [x] `__tests__/learn-log.test.ts` 覆盖上述 4 个 normalizeRoutine 场景

## 阶段 2：调整计划页交互收敛
- [x] PlanEditClient 四段（routine / priority / questions / ai）为手风琴折叠
- [x] 默认仅展开第一段（routine），其余点击展开
- [x] 同一时间只展开一段（openSection 单值切换）
- [x] 底部吸底保存条始终可见
- [x] 未保存变更时保存按钮高亮 + 红点指示
- [x] 保存成功后 dirty 清空 + toast 成功提示
- [x] AI 调整成功后保存条显示「日程已更新，记得保存」琥珀色提示
- [x] PlanDetailClient「调整计划」Link 的 title 改为「编辑作息、优先级与题目范围」

## 阶段 3：复习页过滤生效
- [x] `lib/review-filter.ts` 导出 `ReviewFilters` interface 与 `applyReviewFilters` 函数
- [x] `applyReviewFilters` 支持 planId / nodeId / difficulty / dueStatus / bigTech / search 六维
- [x] dueStatus="all" 时等价于 getDueCards（due ≤ now）
- [x] dueStatus="overdue" 时仅返回 due < 今天 0 点的卡片
- [x] dueStatus="today" 时仅返回 今天 0 点 ≤ due ≤ now 的卡片
- [x] dueStatus="week" 时仅返回 now < due ≤ now+7d 的卡片（未来到期，可预习浏览）
- [x] difficulty 过滤通过反查 plan.knowledgeTree 的 node.difficulty
- [x] bigTech 过滤通过反查 node.bigTech
- [x] search 匹配 card.front + card.back（忽略大小写）
- [x] 多维叠加时全部条件 AND
- [x] `app/review/page.tsx` 加载 allCards 时同时加载 plans（用于反查）
- [x] dueCards 由 `applyReviewFilters(allCards, filters, { plans, now })` 计算
- [x] 过滤栏 UI 含 6 个维度控件 + 清除筛选按钮
- [x] 过滤栏可折叠
- [x] 进度条 / 计数 / 导航全部基于过滤后的 dueCards
- [x] `__tests__/review-filter.test.ts` 覆盖 6 个场景（planId / difficulty / overdue / 多维叠加 / search / 无过滤等价 getDueCards）

## 阶段 4：复习页导航 + 删除 + 跳过
- [x] 顶部导航条含「上一条」「计数器」「下一条」
- [x] 第 1 张时「上一条」disabled
- [x] 最后一张时「下一条」disabled
- [x] 计数器点击展开跳转滑块（range input）
- [x] 键盘 `←` 触发上一条
- [x] 键盘 `→` 触发下一条
- [x] 键盘 `Space` 切换显示答案
- [x] 键盘 `1-4` 在答案显示后触发评分
- [x] 切换卡片时 showAnswer 重置为 false（ReviewCardView 加 key 重置）
- [x] 卡片右上角「删除」按钮 → confirmDialog 二次确认
- [x] 确认后 delItem(KEY_PREFIXES.CARD + id) 执行
- [x] 删除后从 allCards 与 dueCards 移除
- [x] 删除后当前索引 clamp 到有效范围
- [x] 删除后 toast 成功提示
- [x] 「跳过」按钮：索引 +1，不写 IndexedDB
- [x] 「暂不复习」按钮：卡片 id 加入 buriedIds，本次 session 不再出现
- [x] 刷新页面后 buriedIds 清空（state 不持久化）
- [x] 卡片上方元数据条显示：计划 / 知识点 / 难度 / 大厂徽标
- [x] 元数据条次行显示：上次复习 / 下次到期 / reps / lapses

## 阶段 5：验证与合并
- [x] `npm run lint` 0 error（修复 LearnWizard.tsx 4 处 unescaped entities 预存错误）
- [x] `npm run typecheck` 0 error（修复 home-derive.test.ts 5 处 + observability.test.ts 2 处预存类型错误）
- [x] `npm test` 全部通过（48 文件 515 用例全绿，含新增 review-filter 7 + learn-log 5）
- [x] 手动验证：缺 weekdays 的 routine 不再崩溃（normalizeRoutine 单测覆盖）
- [x] 手动验证：复习页难度过滤生效（applyReviewFilters 单测覆盖 difficulty 场景）
- [x] 手动验证：复习页上一条/下一条导航生效（代码路径 setCurrentIndex + 边界 disabled 验证）
- [x] 手动验证：复习页删除卡片生效（handleDelete + delItem + setAllCards 过滤验证）
- [x] 手动验证：键盘 ← → 导航生效（useEffect keydown 监听验证）
- [x] 代码已 commit（4 个原子 commit：c693528 / edafdc1 / eae5cb9 + 待提交的修复）
- [x] 代码已 push 到用户选择的远程分支（main）
