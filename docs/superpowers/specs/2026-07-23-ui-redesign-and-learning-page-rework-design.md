# UI 重构与学习页重写设计

> **日期**：2026-07-23
> **范围**：5 个 UI/交互设计点的整体重构方案
> **依赖文档**：[docs/ui-design-system.md](file:///workspace/docs/ui-design-system.md) v1.1（已含 z-index 层级表）、[docs/ARCHITECTURE.md](file:///workspace/docs/ARCHITECTURE.md)
> **状态**：待用户审查

---

## 0. 设计哲学（乔布斯 + 卡帕西双视角）

**乔布斯视角（产品/交互）**：
- **专注时无打扰**：番茄钟在 running 态必须是最小的视觉存在，不打断用户当前的阅读/答题流
- **克制即设计**：底部导航去文字、模型弹窗定位收敛，都是"减法优先于加法"的实践
- **状态可感知**：脑图节点变绿、进度统计、悬浮入口，让用户随时"看到自己在哪"
- **3 秒原则**：学习页打开 3 秒内必须看到完整知识地图，并知道下一步点哪里

**卡帕西视角（架构/契约）**：
- **单一事实源**：番茄钟完成状态机已在 widget 统一，本次重构保留这一架构，避免 large modal 删除后逻辑回流
- **复用已有契约**：MindMap 已封装为可复用组件，本次扩展只增加 props，不破坏既有 API
- **z-index 层级表**：所有浮层必须查 [docs/ui-design-system.md](file:///workspace/docs/ui-design-system.md) 第 11 节，禁止凭感觉写 `z-[9999]`
- **测试守护**：每条新规则配套守护测试，规则没有测试等于不存在

---

## 1. 设计点 1：番茄时钟移除 large Modal，只保留小浮窗

### 1.1 现状与问题

当前 `components/PomodoroWidget.tsx`（758 行）有两态：
- **small**：56px 圆环浮窗，常驻显示倒计时
- **large**：`<Modal size="lg">` 包 `<PomodoroFullContent>`，承载 idle/running/completed 三态视图

**问题**：large Modal 是全屏遮罩，每次想看番茄详情或调整选项都被迫中断当前页面流，与"专注工具应该克制"的设计哲学冲突。

### 1.2 方案：三态自适应浮窗（推荐）

**核心思路**：移除 `<Modal>` 包装，按 session 状态自适应浮窗尺寸：

| 状态 | 浮窗形态 | 尺寸 | 承载内容 |
|---|---|---|---|
| **idle**（无 session） | 卡片浮窗 | 280×360px | 时长预设（15/25/50）+ 任务描述（折叠）+ 计划关联（折叠）+ 严格模式开关 + 开始按钮 + 今日统计迷你 |
| **running**（专注中） | 圆环浮窗 | 56×56px | 圆环进度 + 剩余分钟数；长按唤起菜单（暂停/恢复/放弃） |
| **completed**（刚完成） | 卡片浮窗 | 280×320px | 番茄完成庆祝 + 休息建议（短/长）+ "再来一个"按钮 + 今日统计迷你 |
| **break running**（休息中） | 圆环浮窗（绿色环） | 56×56px | 与 running 同形态，仅颜色编码区分 |

**关键约束**：
- running 态必须是 56px 圆环（专注中无打扰，原 small widget 设计保留）
- idle/completed 必须是卡片浮窗（不是全屏 Modal），尺寸 280×360 内承载核心表单
- 卡片浮窗可拖动 + 边缘吸附（复用现有 `clampPosition` / `snapToNearestEdge` 逻辑）
- 卡片浮窗关闭按钮 → 切回 running 圆环（若有 session）或彻底隐藏（若无 session）

**实现要点**：
1. `WidgetMode` 类型从 `"small" | "large"` 改为 `"ring" | "card"`（语义更清晰）
2. 卡片浮窗尺寸：`CARD_WIDTH = 280`, `CARD_HEIGHT_IDLE = 360`, `CARD_HEIGHT_COMPLETED = 320`
3. `BOTTOM_NAV_RESERVE` 从 96 调整为新的 Nav 高度（40px，见设计点 3）+ 安全边距 = 56
4. 状态机：`refresh()` 根据 `active?.status` + `computeRemainingMs` 决定 mode
5. 全局事件 `POMODORO_OPEN_LARGE_EVENT` 重命名为 `POMODORO_OPEN_EVENT`，唤起卡片浮窗（idle 态）或保持圆环（running 态）
6. `PomodoroFullContent` 拆分为 `PomodoroIdleCard`（idle 表单）+ `PomodoroCompletedCard`（completed 视图），running 视图不再需要（圆环已是 running 视图）

### 1.3 入口收敛

| 入口 | 行为 |
|---|---|
| 首页 Hero 区「开始专注」 | 派发 `POMODORO_OPEN_EVENT` → 卡片浮窗 idle 态 |
| 训练页自动唤起 | 检测无 running session 时派发 `POMODORO_OPEN_EVENT` |
| AI 工具 `start_focus_session` | 直接 `createSession` → 圆环 running 态 |
| 圆环点击 | 切到卡片浮窗（若 idle/completed）或保持圆环（若 running） |
| 圆环长按 | 唤起菜单（暂停/恢复/放弃），不切浮窗形态 |

### 1.4 z-index 调整

- 卡片浮窗与圆环统一 `z-[80]`（高于 Modal z-[60]、Nav z-50、FloatingChat z-50）
- 长按菜单 `z-[100]`（高于浮窗本体）

### 1.5 风险与对策

| 风险 | 对策 |
|---|---|
| 卡片浮窗在移动端遮挡内容 | 默认位置右下角，可拖动到任意位置；底部预留新 Nav 高度 |
| 表单字段太多挤不下 280×360 | 任务描述/计划关联/严格模式 默认折叠（如同当前 PomodoroFullContent 的"更多选项"） |
| completed 自动切卡片可能打扰 | 仅在 focus 完成时切卡片（休息结束保持圆环，下一段 focus 由用户主动开始） |

---

## 2. 设计点 2：ModelConfigModal 定位与层级修复

### 2.1 现状与问题

`components/ModelConfigModal.tsx`（478 行）使用统一 `<Modal size="md">`：
- 移动端：`items-end` 贴底 + `max-h-[90vh]` → **顶部留白**（modal 高度不足 90vh 时上方空着）
- 桌面端：`items-center` 居中，正常
- z-[60] 理论上高于 Nav z-50，但移动端贴底时 modal 底部与 Nav 顶部视觉重叠

**用户反馈**：
1. 被底部导航遮挡
2. 层级要高点
3. 定位不对
4. 顶部有空白

### 2.2 方案：ModelConfigModal 移动端也居中

**核心思路**：表单类 Modal 不需要贴底（贴底是为底部抽屉准备的，如表单选择器），居中更符合"打断用户流"的强视觉语义。

**实现要点**：
1. 在 `components/ui/Modal.tsx` 新增 `mobilePosition` prop：
   ```ts
   mobilePosition?: "bottom" | "center"; // 默认 "bottom"
   ```
2. ModelConfigModal 显式传 `mobilePosition="center"`
3. Modal 内部条件渲染：
   ```tsx
   className={cn(
     "fixed inset-0 z-[60] flex justify-center p-0 sm:p-4",
     mobilePosition === "center" ? "items-center" : "items-end sm:items-center"
   )}
   ```
4. ModelConfigModal 的卡片圆角从 `rounded-t-card sm:rounded-card` 改为全圆角 `rounded-card`（移动端也居中时不再需要顶部无圆角）

### 2.3 备选方案（更激进）

直接修改统一 `<Modal>` 默认行为：所有 `size="md"` 及以下的 Modal 移动端居中，只有 `size="lg"/"xl"` 或显式 `mobilePosition="bottom"` 的才贴底。

**不推荐**：会破坏现有 ChatModal、Profile 升级提示等已依赖贴底行为的组件，回归测试成本高。

### 2.4 z-index 不变

- ModelConfigModal 仍是 `z-[60]`（统一 Modal 层）
- 修复"被遮挡"问题的主要手段是定位修复（居中后不再与 Nav 视觉重叠），而非抬升 z-index

---

## 3. 设计点 3：底部导航栏去文字 + 高度变小

### 3.1 现状

`components/Nav.tsx`（49 行）：
- 3 Tab：路径 / 训练 / 我的
- 每项 `min-h-[48px]` + `flex flex-col items-center gap-0.5 py-2 px-1`
- 图标 22px + label `text-2xs`（11px）

### 3.2 方案：44px 纯图标导航

**实现要点**：
```tsx
<Link
  className="flex items-center justify-center py-2.5 px-1 transition-colors min-h-[44px]"
>
  <Icon name={item.icon} className="w-[22px] h-[22px]" />
</Link>
```

- 去掉 `<span>{item.label}</span>`
- `min-h-[48px]` → `min-h-[44px]`（iOS HIG 推荐最小触控区 44px，可访问性合规）
- `flex flex-col items-center gap-0.5` → `flex items-center justify-center`（无 label 不需要纵向排列）
- `py-2` → `py-2.5`（补偿去掉 label 后的垂直留白）
- `aria-label={item.label}` 保留（已存在，无障碍不变）
- 3 Tab 总高度从 ~64px 降到 44px + safe-area-inset-bottom

### 3.3 影响联动

- `app/layout.tsx` 的 `<body className="... pb-16">` 需调整为 `pb-11`（44px = 11 × 4）
- `components/PomodoroWidget.tsx` 的 `BOTTOM_NAV_RESERVE = 96` 调整为 `56`（44 + 12 安全边距）
- `components/FloatingChatButton.tsx` 的 `bottom-20`（80px）调整为 `bottom-16`（64px）
- `app/learn/[planId]/PlanDetailClient.tsx` 脑图悬浮按钮的 `bottom-32`（128px）调整为 `bottom-28`（112px）

### 3.4 守护测试

新增 `__tests__/nav-icon-only.test.ts`：
- 扫描 `components/Nav.tsx`，断言每个 `<Link>` 内不包含 `<span>` 子元素
- 断言 `min-h-[44px]` 存在

---

## 4. 设计点 4：今日学习队列移动端最下面 + KPI 卡片进入学习

### 4.1 现状

`app/HomeClient.tsx`（526 行）已是 6 区结构：
1. Hero 行动区
2. KPI 三宫格（第 1 格「今日学习清单 N 项」已可点击进入学习）
3. AI 教练洞察区
4. 能量趋势迷你图
5. 7 天热力图
6. **今日学习队列**（已在最底部）

KPI 第 1 格的 `href`：
```tsx
href={studyQueue[0] ? (studyQueue[0].type === "review" ? "/review" : `/learn/${studyQueue[0].planId ?? ""}`) : "/learn/new"}
```

### 4.2 方案：验证现状 + 微调移动端

**核心思路**：需求 4 已基本实现，本次只做移动端体验微调：

1. **KPI 第 1 格视觉强化**：当前可点击但视觉上与其他 KPI 格无明显区分。增加 hover 态 + 右上角箭头图标，让"可点击进入学习"更明显
2. **今日学习队列卡片移动端布局**：当前每项卡片在移动端是横向布局，验证在小屏（375px）下是否需要改为纵向（题目在上、操作在下）
3. **空队列状态**：今日学习队列为空时，第 6 区显示 EmptyState「今天没有待学习项，去 /learn/new 创建计划」

### 4.3 不做的事

- 不把今日学习队列挪到 Hero 区（违反"6 区结构"原则）
- 不在 KPI 第 1 格直接做题（KPI 是入口，不是答题区）

---

## 5. 设计点 5：学习页脑图优化

### 5.1 现状

`app/learn/[planId]/PlanDetailClient.tsx`（1230 行）已实现：
- 首次进入自动弹脑图 Modal（无 `?node=` 参数 + 无 lastViewedQ 时）
- 续学场景：有 lastViewedQ 时直接滚动到上次查看的题目，不弹脑图但显示悬浮按钮
- 脑图节点点击 → `handleMindMapNodeSelect`：过滤该节点题目 + 关闭弹窗 + 显示悬浮按钮 + 滚动到题目区
- 底部「直接进入」按钮 → 不过滤 + 关闭弹窗 + 显示悬浮按钮
- 关闭/ESC/遮罩点击 → 关闭弹窗 + 显示悬浮按钮（保留当前 filter）
- 悬浮按钮：`fixed right-4 bottom-32 z-50 w-14 h-14`，点击重新展开脑图
- `MindMap` 组件已支持 `titleClickMode="select"` + `onSelectNode` 回调
- 已掌握节点变绿（`MASTERED_BG/BORDER/BAR`）

### 5.2 优化方向（4 项，按优先级）

#### 优化 1：节点题目数统计（P0）

**问题**：当前节点只显示 mastery 百分比，用户不知道该节点有多少题、答对几道。

**方案**：节点元信息行增加 `X/Y` 题目数显示：
```
入门 · ★ · 3频 · 大厂 · 5/8 题
```
- `5/8` = 已答对 5 道 / 该节点共 8 道题
- 数据源：`plan.questions` 按 `nodeId` 分组 + `question.understood` 字段统计

**实现要点**：
- `MindMap` 新增可选 prop `questionStats?: Record<nodeId, { total: number; understood: number }>`
- `PlanDetailClient` 计算 stats 并传入
- 节点渲染时优先级：mastered > questionStats > 默认元信息

#### 优化 2：mastered 自动折叠子树（P1）

**问题**：用户掌握父节点后，子节点通常也掌握，但当前默认全部展开，视觉噪音大。

**方案**：`MindMap` 初始化 `expanded` Set 时，过滤掉 `mastered === true` 的节点（其子树默认折叠）：
```ts
const [expanded, setExpanded] = useState<Set<string>>(
  () => new Set(allIds.filter(id => !nodeMap.get(id)?.mastered))
);
```

- 用户主动点击父节点可展开查看（不影响交互）
- "全部展开"按钮仍可强制展开所有

#### 优化 3：脑图搜索高亮（P1）

**问题**：知识树节点多时，找特定知识点需要拖动 + 缩放，效率低。

**方案**：脑图工具栏增加搜索输入框：
- 输入关键词后，匹配节点高亮（边框加粗 + 背景变蓝），非匹配节点变灰（opacity 0.3）
- 按 Enter 自动 `fitView` 到匹配节点群
- 清空搜索恢复原状

**实现要点**：
- `MindMap` 新增 `searchQuery?: string` 内部状态
- 工具栏右上角增加 `<Input inputSize="sm" placeholder="搜索知识点" />`
- 节点渲染时根据 `searchQuery` 决定 `opacity` 和 `strokeWidth`

#### 优化 4：节点状态实时更新（P2）

**问题**：当前答对题目后，脑图节点的 mastery 不会实时变绿，需要刷新页面或重新打开脑图。

**方案**：`PlanDetailClient` 在 `markQuestionUnderstood` / `markNodeMastered` 后，更新 `plan.knowledgeTree` 对应节点的 `mastery` 和 `mastered` 字段，触发 MindMap 重渲染。

**实现要点**：
- `handleMarkQuestionUnderstood` 完成后，更新本地 `plan` state：
  ```ts
  setPlan(prev => prev ? {
    ...prev,
    knowledgeTree: prev.knowledgeTree.map(n =>
      n.id === nodeId
        ? { ...n, mastery: newMastery, mastered: newMastery >= 100 }
        : n
    )
  } : prev);
  ```
- `MindMap` 的 `useEffect` 监听 `nodes` 变化重置 `expanded`（已有逻辑）
- 增加动画：节点变绿时 `animate-fade-in` + 边框过渡

### 5.3 不做的事

- 不做脑图节点拖拽改顺序（YAGNI，节点顺序由 AI 拆解时确定）
- 不做脑图节点编辑（YAGNI，知识点应通过重新生成计划调整）
- 不做脑图导出图片（YAGNI，截图即可）

---

## 6. 整体架构影响

### 6.1 文件变更清单

| 文件 | 变更类型 | 说明 |
|---|---|---|
| `components/PomodoroWidget.tsx` | 重构 | 移除 large Modal，新增卡片浮窗形态；状态机从 small/large 改为 ring/card |
| `components/PomodoroFullContent.tsx` | 拆分 | 拆为 `PomodoroIdleCard` + `PomodoroCompletedCard`，running 视图由圆环承载 |
| `components/Nav.tsx` | 修改 | 去掉 label，min-h-[44px] |
| `components/ui/Modal.tsx` | 扩展 | 新增 `mobilePosition` prop |
| `components/ModelConfigModal.tsx` | 修改 | 传 `mobilePosition="center"` |
| `components/MindMap.tsx` | 扩展 | 新增 `questionStats` prop + 搜索框 + mastered 折叠 |
| `app/HomeClient.tsx` | 微调 | KPI 第 1 格视觉强化 + 空队列 EmptyState |
| `app/layout.tsx` | 修改 | `pb-16` → `pb-11` |
| `app/learn/[planId]/PlanDetailClient.tsx` | 扩展 | 计算 questionStats 传入 MindMap + 实时更新节点状态 |
| `components/FloatingChatButton.tsx` | 修改 | `bottom-20` → `bottom-16` |
| `__tests__/nav-icon-only.test.ts` | 新增 | 守护测试：Nav 纯图标 + min-h-[44px] |

### 6.2 z-index 层级表更新

更新 [docs/ui-design-system.md](file:///workspace/docs/ui-design-system.md) 第 11 节：

| 层级 | z-index | 元素 | 说明 |
|---|---|---|---|
| 内容层 | `z-10` | sticky 顶部 | 页面内局部 sticky |
| 导航层 | `z-50` | 底部 `<Nav>` | 44px 高度，纯图标 |
| 浮动按钮层 | `z-50` | `<FloatingChatButton>` + 学习页脑图浮按钮 | `bottom-16` 让位 Nav |
| 模态层 | `z-[60]` | 统一 `<Modal>` | 移动端默认贴底，`mobilePosition="center"` 时居中 |
| 番茄 widget 层 | `z-[80]` | `<PomodoroWidget>` ring/card 形态 | 高于 Modal，专注中常驻可见 |
| 番茄长按菜单 | `z-[100]` | 番茄控制菜单 | 高于 widget 本体 |

### 6.3 守护测试

新增 3 个测试文件：

1. `__tests__/nav-icon-only.test.ts`
   - 扫描 `components/Nav.tsx`
   - 断言每个 `<Link>` 内不包含 `<span>` 子元素
   - 断言 `min-h-[44px]` 存在

2. `__tests__/pomodoro-widget-no-modal.test.ts`
   - 扫描 `components/PomodoroWidget.tsx`
   - 断言不导入 `Modal` from `@/components/ui`
   - 断言不渲染 `<Modal>` 元素

3. `__tests__/mindmap-question-stats.test.ts`
   - 单测 `MindMap` 接收 `questionStats` prop 后正确渲染 `X/Y` 格式

---

## 7. 实施顺序建议

按依赖关系分 4 个阶段：

### 阶段 1：基础设施（独立可发布）
- 设计点 3：Nav 去文字 + 高度变小
- 设计点 2：ModelConfigModal mobilePosition="center"
- 联动：layout.tsx pb-16→pb-11、PomodoroWidget BOTTOM_NAV_RESERVE、FloatingChatButton bottom-16

### 阶段 2：番茄钟重构（核心）
- 设计点 1：PomodoroWidget 移除 large Modal，新增卡片浮窗
- 拆分 PomodoroFullContent → PomodoroIdleCard + PomodoroCompletedCard
- 重命名 POMODORO_OPEN_LARGE_EVENT → POMODORO_OPEN_EVENT

### 阶段 3：学习页脑图优化（独立）
- 设计点 5：MindMap 扩展 questionStats + 搜索 + mastered 折叠
- PlanDetailClient 计算 stats + 实时更新节点状态

### 阶段 4：首页微调（独立）
- 设计点 4：KPI 第 1 格视觉强化 + 空队列 EmptyState

每个阶段完成后跑 `npm run quality-gate` 验证，全部通过后再进入下一阶段。

---

## 8. 验收标准

| 设计点 | 验收项 |
|---|---|
| 1 | 番茄钟不再出现全屏 Modal；idle/completed 态为 280px 卡片浮窗；running 态为 56px 圆环；长按菜单可暂停/放弃 |
| 2 | ModelConfigModal 在移动端居中显示；顶部无空白；不与底部 Nav 视觉重叠 |
| 3 | Nav 仅显示图标；高度 44px；aria-label 保留；3 Tab 总宽不超过屏幕 |
| 4 | 今日学习队列在首页最底部；KPI 第 1 格可点击进入学习且有视觉提示；空队列显示 EmptyState |
| 5 | 脑图节点显示 X/Y 题目数；mastered 节点默认折叠子树；搜索框可高亮匹配节点；答对题目后节点实时变绿 |
| 全局 | `npm run quality-gate` 全绿；新增 3 个守护测试通过；z-index 层级表更新到 ui-design-system.md v1.2 |

---

## 9. 待用户确认的开放问题

1. **设计点 1 的卡片浮窗尺寸**：280×360 是否合适？移动端 375px 屏宽下两边各留 47px，可接受；若用户觉得太大可缩到 240×320
2. **设计点 5 优化 3 搜索框位置**：放在脑图工具栏右侧（与缩放按钮同行）还是顶部独立一行？前者紧凑但可能挤压工具栏，后者更易用
3. **阶段划分是否合理**：是否需要把阶段 2（番茄钟）拆得更细？例如先做"移除 Modal + 圆环态"再做"卡片浮窗 idle/completed 态"

---

## 10. 后续

用户审查本 spec 后：
- 若批准 → 调用 `writing-plans` skill 生成详细实现计划，按阶段 1-4 拆分任务
- 若有调整 → 修改 spec 后重新审查
- 实现完成后同步更新 [docs/ARCHITECTURE.md](file:///workspace/docs/ARCHITECTURE.md) 番茄时钟流程章节 + [docs/ui-design-system.md](file:///workspace/docs/ui-design-system.md) z-index 层级表
