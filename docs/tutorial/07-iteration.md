# 第 7 章 迭代史：14 阶段从 MVP 到生产级

> **视角**：双视角（乔布斯看产品决策，卡帕西看技术决策）
> **预计阅读时间**：35 分钟
> **前置知识**：第 3 章产品设计、第 4 章技术选型、第 6 章代码实现
> **学习目标**：理解一个真实项目如何通过 14 轮迭代从 MVP 演进到生产级，每轮迭代都回答「做了什么 / 为什么做 / 关键决策 / 学到了什么 / 如果重写会怎么做」。

---

## 关于本章的资料来源

> **声明**：本章基于仓库内 `.trae/specs/` 与 `docs/superpowers/plans/` 中留存的 spec/plan 文档重建，**不是 git log 的逆序展开**。原因：
> 1. spec/plan 是设计意图的固化，能解释「为什么做」而不只是「改了什么」；
> 2. git log 一条 commit 粒度太细，看不到决策脉络；
> 3. spec/plan 里的"Why"章节是教学价值最高的部分——它记录了根因分析的过程。

每阶段末尾的「关联 spec/plan」给出原始文档链接，供深读。

---

## 阶段总览

```
Phase 0  MVP 基础                 → FSRS + IndexedDB + AI 聊天 + 能量回归
Phase 1  脱敏与首页重设计          → username mask + 行动指挥中心
Phase 2  沉浸式学习流程            → 自动全屏 + 学习入口智能路由 + 我的页重构
Phase 3  复习交互重构              → 过滤栏 + 上下导航 + 卡片删除
Phase 4  UI 体检与统一表单         → 16 个 UI 组件 + 守护测试
Phase 5  质量门禁前移              → CI 拆 quality-gate → deploy 两段
Phase 6  智能化扩展                → 用户画像 + 节奏引擎 + 番茄钟 widget + 优先级引擎
Phase 7  乔布斯视角产品重构        → Path/Train/Interview 三模式 + 6 区首页
Phase 8  ESLint 强化 + 零信任 session → AES-GCM + nonce + HMAC + 滑动续期
Phase 9  React 死循环修复 + 架构加固 → useCallback 链式依赖 + 7 个架构隐患
Phase 10 聊天重设计 + AI 工具修复  → 浮动入口 + 流式工具调用修复
Phase 11 知识库向量化              → BGE 768 维 + 三级降级
Phase 12 UI 重构与学习页重写       → sticky header + 反浮层反模式
Phase 13 内容层重构                → Content-as-Code + L1-L4 四层架构 + 49 节点策展
```

---

## Phase 0：MVP 基础

**做了什么**：搭起最小可运行骨架。FSRS 复习调度（`lib/fsrs.ts`）+ IndexedDB 持久化（`lib/storage/dexie-db.ts` 单表 kv + 4 索引）+ AI 聊天（`/api/chat` 走 Vercel AI SDK `streamText`）+ 能量回归（8 维线性回归，`lib/energy-*.ts`）+ 番茄钟（`lib/timer/`）+ 学习计划（`lib/ai/plan-generator.ts`）+ 公开主页 `/u/<username>`。

**为什么做**：先验证「自学者真的需要被陪跑」这个假设，而不是先做花哨功能。能跑起来 + 能记录 + 能复习 + 能聊天 = 最小的"教练"闭环。

**关键决策（卡帕西视角）**：
- **单表 kv 而非多表关系**：所有业务数据塞进 IndexedDB 单表 `kv`，主键 `&key`，二级索引 `prefix, updatedAt, dueAt`。代价是查询要靠 prefix 扫描 + 内存过滤，收益是迁移成本为零（idb-keyval 直接升级到 Dexie）。这个决策在 Phase 6 智能化扩展时被验证是对的——画像/能量/节奏引擎都靠 prefix 索引快速取数据。
- **Vercel AI SDK 而非裸 fetch**：流式响应、工具调用、structured output 都开箱即用。代价是绑定 Vercel 协议（Data Stream Protocol），后续 Phase 10 修工具调用 bug 时花了大力气理解 `6:` 前缀协议。
- **ts-fsrs 4.5 而非自写 SM-2**：复习算法是产品的护城河之一，但自写 SM-2 必然踩坑（参数稳定性、新卡处理）。ts-fsrs 是社区最佳实现，直接用。

**学到了什么**：MVP 阶段最大的诱惑是"再加一个功能"。坚持只做闭环——能记录、能复习、能聊天——把所有花哨想法写进 redesign.md 里压着，是 Phase 7 重构时还有素材可用的关键。

**如果重写会怎么做**：从一开始就把 `lib/storage/db.ts` 的查询接口设计成"按 prefix 列表 + 内存过滤"的纯函数，而不是让业务代码直接调 Dexie。Phase 6 画像构建时为了取学习日志，要写 5 段几乎相同的 prefix 扫描逻辑。

**关联文档**：[devpath-ai-redesign.md](file:///workspace/devpath-ai-redesign.md) 第一部分「现状诊断」还原了 MVP 阶段的实际状态。

---

## Phase 1：脱敏与首页重设计

**做了什么**：[username-mask-dashboard-rework](file:///workspace/docs/superpowers/plans/2026-07-16-username-mask-dashboard-rework.md) —— `lib/username-mask.ts` 纯函数在公开渲染点替换 userId；首页从 KPI 罗列重写为「行动指挥中心」（3 秒知道做什么）；修复部署阻塞（`<a href="/">` 改 `<Link>`）合入 main。

**为什么做**：用户反馈"我的 userId 在同步状态里明文显示还能复制，任何看到的人都能拉取覆盖我的数据"。同时首页是 KPI 三宫格——"学习了 X 小时 / 完成 Y 任务 / 连续 Z 天"——好看但没用，用户打开首页不知道现在该做什么。

**关键决策（乔布斯视角）**：
- **首页要回答一个问题：现在该做什么**。KPI 是回顾视角，行动指挥中心是当下视角。把"AI 教练洞察区"、"能量趋势"、"今日学习队列"放到首屏，KPI 缩成顶部一行小字。
- **脱敏用纯函数而非组件**：`maskUsername("user_abc123def") → "user_abc***"`。纯函数可单测、可在 Edge API 复用、不引入 React 依赖。守护测试 `username-mask.test.ts` 锁定行为。

**学到了什么**：安全问题的根因不是"忘了脱敏"，是"渲染点分散且无统一入口"。修一次只能堵一个洞，下次新加功能又会漏。Phase 4 的守护测试思路就是从这里萌芽的——把"不能再漏"变成 CI 检查。

**如果重写会怎么做**：从一开始就把公开主页 `/u/<username>` 的渲染层做成单一组件树，所有 userId 出口都过一层 `maskIfPublic()` 高阶函数，而不是在 7 个组件里手动调 `maskUsername`。

**关联文档**：[2026-07-16-username-mask-dashboard-rework.md](file:///workspace/docs/superpowers/plans/2026-07-16-username-mask-dashboard-rework.md)

---

## Phase 2：沉浸式学习流程

**做了什么**：三个并行子任务——(a) [fullscreen-share-fix-review-rework](file:///workspace/docs/superpowers/plans/2026-07-16-fullscreen-share-fix-review-rework.md) 的全屏部分（`useAutoFullscreen` hook + 提示弹窗）；(b) [learn-entry-router](file:///workspace/docs/superpowers/plans/2026-07-16-learn-entry-router.md) 把 `/learn` 改造成薄路由（新用户进 `/learn/new`，老用户进 `/learn/list`）；(c) [profile-layout-restructure](file:///workspace/docs/superpowers/plans/2026-07-16-profile-layout-restructure.md) 关键信息前置 + 个人信息折叠 + API Token 智能显隐。

**为什么做**：用户反馈三个连续的体验断裂——"点开始专注跳到 /timer 是 404"、"新用户进 /learn 看到一堆别人的计划懵了"、"我的页面 API Token 永远显示让我以为必须填"。

**关键决策（卡帕西视角）**：
- **`resolveLearnEntry()` 抽成纯函数**：路由判断逻辑（`hasAnyPlan() ? '/learn/list' : '/learn/new'`）抽出来便于单测。这是"决策逻辑不藏在组件里"原则的第一次实践，后续 Phase 6 的节奏引擎、优先级引擎都遵循这个模式。
- **App Router 静态路由优先于动态路由**：`/learn/new` 和 `/learn/list` 是静态，`/learn/[planId]` 是动态，Next.js 解析时静态优先。所以不需要写复杂的路由守卫。

**学到了什么**：404 类问题的根因不是"忘了建页面"，是"导航入口和路由结构没对齐"。Phase 12 重写学习页时把"所有导航入口"列成清单逐个对账，就是从这里学的。

**如果重写会怎么做**：`useAutoFullscreen` 应该从一开始就考虑"用户主动退出全屏"的情况——当时只处理了"自动进入 + 失败提示"，导致 Phase 12 又回来加"主动切换全屏入口"。

**关联文档**：[2026-07-16-fullscreen-share-fix-review-rework.md](file:///workspace/docs/superpowers/plans/2026-07-16-fullscreen-share-fix-review-rework.md) / [2026-07-16-learn-entry-router.md](file:///workspace/docs/superpowers/plans/2026-07-16-learn-entry-router.md) / [2026-07-16-profile-layout-restructure.md](file:///workspace/docs/superpowers/plans/2026-07-16-profile-layout-restructure.md)

---

## Phase 3：复习交互重构

**做了什么**：[fullscreen-share-fix-review-rework](file:///workspace/docs/superpowers/plans/2026-07-16-fullscreen-share-fix-review-rework.md) 的复习部分——`createCard` 前查重（避免重复添加）+ 成功后自动跳转 + ReviewCard 增加 deckId 元数据 + 复习页过滤栏（按 deckId 过滤真正生效）+ 卡片可删除 + 上一条/下一条导航。同时 [share-token-fix-and-ai-tool-library](file:///workspace/docs/superpowers/plans/2026-07-16-share-token-fix-and-ai-tool-library.md) 修正分享页 404 文案（移除 Token 误导）+ 重构 AI 工具库（补全 3 个缺失的 clientAction + 工具元数据注册表 `lib/ai/tool-registry.ts` + 分类网格面板）。

**为什么做**：用户反馈"复习页过滤形同虚设，只能按 deckId 过滤但我有 50 个 deck"、"卡片无法删除"、"没有上一条/下一条导航"。同时分享页 404 文案暗示访问者要填 API Token，造成困惑。AI 工具库的 7 个写入工具里有 3 个 clientAction 是空壳（Phase 10 才发现是流解析器 bug，但 Phase 3 先补了空壳）。

**关键决策（双视角）**：
- **过滤逻辑放客户端而非 API**：复习卡片全在 IndexedDB，过滤是 O(n) 内存操作，不需要走 API。代价是大数据集下渲染卡顿（Phase 12 用虚拟列表解决）。
- **工具元数据集中注册**：`lib/ai/tool-registry.ts` 统一管理工具的分类/图标/快捷指令，消除 `ChatClient.tsx` 和 `route.ts` 的重复。这是"单一事实源"原则在 AI 工具上的实践。

**学到了什么**：404 文案不是"加一句说明"那么简单——它反映的是产品对"访问者 vs 拥有者"的视角混乱。Phase 7 重构公开主页时把"访客视角"作为独立设计维度，就是从这里学的。

**如果重写会怎么做**：复习卡片从开始就该带 `deckId` 字段，而不是 Phase 3 才补。旧卡片没有 deckId 导致过滤栏对历史数据无效，要做数据迁移。

**关联文档**：[2026-07-16-fullscreen-share-fix-review-rework.md](file:///workspace/docs/superpowers/plans/2026-07-16-fullscreen-share-fix-review-rework.md) / [2026-07-16-share-token-fix-and-ai-tool-library.md](file:///workspace/docs/superpowers/plans/2026-07-16-share-token-fix-and-ai-tool-library.md)

---

## Phase 4：UI 体检与统一表单组件

**做了什么**：[ui-health-check-report](file:///workspace/docs/superpowers/plans/2026-07-19-ui-health-check-report.md) 乔布斯视角全站体检 → 发现 16 类问题 → [unify-all-form-components](file:///workspace/docs/superpowers/plans/2026-07-19-unify-all-form-components.md) 把 `components/` 和 `app/` 下所有原生 `<input>/<select>/<textarea>/<button>` 替换为 `@/components/ui` 组件库（新建 `ui/Slider`、扩展 `ui/Button` 支持 `iconOnly`）+ 写守护测试 `__tests__/no-native-form-elements.test.ts` 扫描所有 `.tsx` 文件，凡在 `components/ui/` 之外出现原生表单元素即失败。

**为什么做**：UI 体检发现组件风格不统一——有的地方用 `ui/Button`，有的地方写 `<button className="...">`，原生元素缺 ARIA、缺 focus trap、缺键盘支持。每修一个 bug 都要查"这里到底用的是哪个按钮"。

**关键决策（卡帕西视角）**：
- **三层防御**：(1) 扩展统一组件库覆盖缺口（Slider / IconButton）；(2) 守护测试扫描原生元素，CI 拦截；(3) 逐文件替换 + 每完成一组跑回归。这是后续所有"规范约束"的范式——**规则没有测试守护等于建议**。
- **守护测试扫描正则而非 AST**：用简单正则 `<input\b` 扫描，不引入 AST 解析依赖。代价是会有少量误报（如注释里的 `<input>`），但收益是测试本身 100 行内可读、可维护、零依赖。这个思路后续催生了 `ui-design-system-guard.test.ts`（守护 dark: 配对）和 `content-generation-standard.test.ts`（守护 prompt 标记）。

**学到了什么**：UI 一致性不是"设计师画规范"能解决的，是"代码层面强制"才能解决的。规范文档会被忽略，但 CI red 不会。Phase 5 的质量门禁前移思路就是从这里来的。

**如果重写会怎么做**：从一开始就用 Radix Primitives + Tailwind 自己包一层 `ui/` 组件库，而不是先用原生元素再迁移。迁移成本是 Phase 4 整整一周的工作量。

**关联文档**：[2026-07-19-ui-health-check-report.md](file:///workspace/docs/superpowers/plans/2026-07-19-ui-health-check-report.md) / [2026-07-19-unify-all-form-components.md](file:///workspace/docs/superpowers/plans/2026-07-19-unify-all-form-components.md)

---

## Phase 5：质量门禁前移

**做了什么**：[quality-gate-and-ux-rework](file:///workspace/.trae/specs/quality-gate-and-ux-rework/spec.md) spec —— 把 `next build` 里的 lint 拆出来，CI 改成 `quality-gate → deploy` 两段。quality-gate 跑 `npm run lint && npm run typecheck && npm test`，失败直接阻断 deploy。同时修了"调整计划"页 `TypeError: Cannot read properties of undefined (reading 'includes')`（旧 routine 数据缺字段）。

**为什么做**：又一次因为 ESLint 问题导致发布失败——`next build` 在 deploy 工作流里才跑 lint，错误暴露太晚，已经构建了 5 分钟才发现一个未使用变量。同时旧 routine 数据缺字段导致"调整计划"页直接崩溃，用户看不到任何提示。

**关键决策（卡帕西视角）**：
- **CI 是 source of truth，不是本地反馈的替代品**：本地 pre-commit hook 会漏装（新人/换机器），但 CI 永远跑。所以 CI 必须严格——`--max-warnings 0`，warning 当 error。代价是开发体验略差（要修所有 warning 才能合并），收益是 main 分支永远是绿的。
- **两段而非一段**：quality-gate 失败时不浪费 deploy 的构建时间。Cloudflare Pages 部署是一次性消费构建产物的，quality-gate 先过滤掉污染。

**学到了什么**：本地反馈和 CI 是互补的，不是替代关系。Phase 8 会在本地反馈链上再补一刀（ESLint `warn` 改 `error` + git hooks 自动安装），形成"本地即时 + CI 兜底"的双层。

**如果重写会怎么做**：从第一天就把 `.eslintrc.json` 里所有规则设为 `"error"` 而非 `"warn"`。Phase 8 修这个花了大半天扫历史 warning。

**关联文档**：[quality-gate-and-ux-rework spec](file:///workspace/.trae/specs/quality-gate-and-ux-rework/spec.md)

---

## Phase 6：智能化扩展

**做了什么**：[smart-learning-expansion](file:///workspace/.trae/specs/smart-learning-expansion/spec.md) spec —— 用户画像（6 维：技能水平 / 偏好时段 / 平均专注时长 / 薄弱环节 / 学习风格 / 目标，24h TTL 自动重建 + 高频维度事件驱动增量更新）+ 节奏引擎（6 条决策优先级链：继续专注 → 低能量休息 → 到期复习 → routine 时段专注 → 睡前复盘 → 默认学习，不消耗 AI 额度）+ 优先级引擎（4 维加权评分：截止紧迫度 0.3 + FSRS 到期 0.3 + 技能差距 0.2 + 能量匹配 0.2，每日缓存 + 健康检查）+ 精准计划生成（画像驱动 + 可行性评分 confidence < 0.5 自动降级 + 跳过已掌握节点）+ 番茄钟 widget 化（右下角浮动，ring 56px ↔ card 280px 两态，可拖动 + 边缘吸附）+ AI Persona（4 种：严厉教练 / 温和陪伴 / 苏格拉底导师 / 平等同行，根据能量/心情/连续天数/提问内容自动切换）+ 学习队列（合并 new + review 为单一待办流，5 维评分 + 中文 reason）。

**为什么做**：用户反馈"AI 能告诉我接下来学什么，但没有'现在就开始学'的强执行机制"、"AI 对我一无所知，对入门者和进阶者回答一样"、"FSRS、能量回归、错题本、学习计划各自独立，没有指挥官编排"。

**关键决策（卡帕西视角）**：
- **节奏引擎不消耗 AI 额度**：6 条决策链是纯规则（if-else），不调 LLM。代价是决策不"聪明"（无法处理边缘场景），收益是零成本、零延迟、零失败。LLM 留给真正需要推理的场景（生成计划、聊天、周报）。这是"AI 不是银弹，是特定场景的工具"原则的实践。
- **画像 24h TTL + 事件驱动增量更新**：全量重建画像贵（要扫所有 LearnLog + 能量样本 + FSRS 稳定性），所以 24h TTL。但 `averageSessionMinutes` 和 `accuracy` 这种高频维度不能等 24h——事件驱动增量更新。混合策略。
- **学习队列合并 new + review**：用户不需要在两个 tab 间切换。5 维评分（FSRS 紧迫度 + 能量补偿 + 多巴胺补偿 + 连续 new 过载扣分）让最该做的事排第一。每条带中文 reason——"为什么是这个任务"比"这个任务是什么"更重要。

**学到了什么**：智能化不是"加更多 AI 调用"，是"在正确的层抽象决策"。节奏引擎是规则层（快、便宜、确定），优先级引擎是评分层（中、便宜、可解释），AI Persona 是 LLM 层（慢、贵、灵活）。三层各司其职，不要让 LLM 干规则能干的事。

**如果重写会怎么做**：画像从一开始就该分"稳定维度"（技能水平、目标，30 天 TTL）和"高频维度"（averageSessionMinutes、accuracy，事件驱动）。Phase 6 用了统一的 24h TTL，导致稳定维度频繁重建浪费计算。

**关联文档**：[smart-learning-expansion spec](file:///workspace/.trae/specs/smart-learning-expansion/spec.md)

---

## Phase 7：乔布斯视角产品重构

**做了什么**：两轮迭代——[jobsian-product-redesign v1](file:///workspace/docs/superpowers/plans/2026-07-20-jobsian-product-redesign.md) 提出 Path/Train/Interview 三模式替代 15+ 功能；[jobsian-product-redesign v2](file:///workspace/docs/superpowers/plans/2026-07-21-jobsian-product-redesign-v2.md) 在 v1 基础上复用 Phase 6 的基础设施（study-queue、节奏引擎、画像、番茄钟 widget），落地 6 区首页（Hero / KPI / AI 洞察 / 能量 / 热力图 / 学习队列）+ Path 视图 + Train 沉浸式会话 + Interview AI 模拟面试。

**为什么做**：Phase 6 后功能堆到 15+，用户反馈"打开 app 不知道从哪开始"。乔布斯视角的诊断是"功能堆砌的学习工具，没有灵魂"——需要做减法，把核心模式收敛到 3 个，让用户从"使用工具"转变为"被教练陪跑"。

**关键决策（乔布斯视角）**：
- **三模式而非 15 功能**：Path（转岗路径图，一条线看到从入门到 offer 的进度）/ Train（沉浸式训练会话：学→练→复→番茄钟一体化，不跳转）/ Interview（AI 模拟面试：真实场景压力测试）。砍掉手动情绪记录、能量配置、复杂仪表盘——这些是"机制过剩"。
- **6 区首页而非 KPI 罗列**：Hero 区（节奏引擎告诉你"现在该做什么"）+ KPI 三宫格（今日 N 项 / 已完成 X / 连续 Y 天）+ AI 教练洞察区（画像 + 雷达 + AI 质量摘要）+ 能量趋势迷你图 + 7 天热力图 + 今日学习队列。3 秒知道做什么。
- **复用而非推倒**：v2 的核心是"减法+聚焦"，不是推倒重来。study-queue、节奏引擎、画像、番茄钟 widget 都保留，只是包装成 Path/Train/Interview 三模式的入口。

**学到了什么**：产品重构最大的诱惑是"重写"。v1 计划是推倒重来，v2 改成复用基础设施 + 重新组织入口，省了 80% 工作量。乔布斯说"简单比复杂更难"，但简单不等于重写——简单是把复杂藏起来。

**如果重写会怎么做**：从 Phase 0 就该有"三模式"的产品骨架，而不是先堆 15 功能再做减法。但这是事后诸葛亮——Phase 0 时不知道哪些功能会被砍，必须先做出来才能判断。

**关联文档**：[2026-07-20-jobsian-product-redesign.md](file:///workspace/docs/superpowers/plans/2026-07-20-jobsian-product-redesign.md) / [2026-07-21-jobsian-product-redesign-v2.md](file:///workspace/docs/superpowers/plans/2026-07-21-jobsian-product-redesign-v2.md)

---

## Phase 8：ESLint 强化 + 零信任 session

**做了什么**：[eslint-and-apikey-security-overhaul](file:///workspace/.trae/specs/eslint-and-apikey-security-overhaul/spec.md) spec —— (a) `.eslintrc.json` 把 `no-unused-vars` / `exhaustive-deps` / `prefer-const` 从 `"warn"` 改 `"error"`，`npm run lint` 加 `--max-warnings 0`，pre-commit hook 自动安装（husky + lint-staged）；(b) 零信任 session 架构：apiKey 不直接暴露，AES-GCM 加密 session + nonce 5min 一次性消费 + HMAC-SHA256 签名 + 时间窗 ±60s + 滑动续期 7d，4 个独立 KV namespace（业务 / AUTH_SESSIONS / AUTH_NONCES / AUTH_AUDIT），提供「登出所有设备」按钮调 `revokeSession`。

**为什么做**：ESLint 问题又一次复发——CI 是 source of truth 了，但本地反馈链断裂（warning 容忍）+ git hooks 漏装。同时 apiKey 一直是明文存在 IndexedDB + 明文同步到云端 KV，这是定时炸弹。

**关键决策（卡帕西视角）**：
- **零信任而非 HttpOnly Cookie**：本项目无后端服务器（Cloudflare Edge + KV），HttpOnly Cookie 需要 Set-Cookie 响应头 + 浏览器自动携带，但 Edge 函数是无状态的，每次都要解析 Cookie。零信任 session 把 apiKey 加密成 session token，nonce 防重放，HMAC 防篡改，时间窗防中间人。代价是客户端要管理 session 生命周期，收益是 apiKey 永不出现在请求里。
- **4 个独立 KV namespace**：业务数据 / AUTH_SESSIONS / AUTH_NONCES / AUTH_AUDIT。隔离的原因是审计日志不能被业务数据污染，nonce 消费要有独立 TTL。代价是 wrangler.toml 配置复杂，收益是安全边界清晰。
- **滑动续期 7d 而非固定过期**：用户每次有效请求续期 7 天，避免"正在用着突然 session 过期"。代价是 active session 长期占用 KV，收益是体验好。

**学到了什么**：安全架构的设计要在"威胁模型"指导下做，不能堆技术。零信任 session 的每个组件（AES-GCM / nonce / HMAC / 时间窗 / 滑动续期）都对应一个具体威胁（泄露 / 重放 / 篡改 / 中间人 / 长期占用）。Phase 9 的架构加固延续了"威胁驱动设计"思路。

**如果重写会怎么做**：从 Phase 0 就该用零信任 session，而不是先明文存 apiKey 再迁移。迁移要处理"旧用户首次访问检测：有 `modelConfig.apiKey` 但无 session → 显示升级提示"，这是用户迁移成本。

**关联文档**：[eslint-and-apikey-security-overhaul spec](file:///workspace/.trae/specs/eslint-and-apikey-security-overhaul/spec.md)

---

## Phase 9：React 死循环修复 + 架构加固

**做了什么**：[fix-react-loop-and-arch-hardening](file:///workspace/.trae/specs/fix-react-loop-and-arch-hardening/spec.md) spec —— (a) 修复 `app/learn/list/ListClient.tsx` 的 `useCallback(refresh, [router])` + `useEffect(refresh)` 链式依赖导致的 React error #185（Maximum update depth exceeded），同类 `useEffect(..., [planId, router])` 反模式在 4 个文件中重复出现，全部修复；(b) 7 个架构隐患系统性排期：apiKey 同步到云端（Phase 8 已修）、Provider 单点故障（加 fallback 链）、首页全量加载（改 7 路并行 + 5 路后台任务触发）、同步不传播删除（加 tombstone TTL 30 天）、能量回归特征薄弱（加 sin/cos 时段编码 + dayOfWeek + dopamineInterference）、`MODEL_CONFIG` 进同步前缀（移出 `SYNC_PREFIXES`）、AI 调用无 observability（加 `lib/ai/observability.ts` + `trace.ts`）。

**为什么做**：用户反馈"打开学习列表页直接白屏，控制台 Maximum update depth exceeded"。同时 7 个架构隐患积压，零散修补无效，需要系统性排期。

**关键决策（卡帕西视角）**：
- **`useCallback` 依赖要稳定**：`router` 引用会抖动（Next.js App Router 的 router 实例不保证引用稳定），所以 `useCallback(refresh, [router])` 会让 `refresh` 每次 render 都变，`useEffect(refresh)` 就无限触发。修复：把 `router` 用 `useRouter` 的 `pathname` 替代（pathname 是 string，引用稳定），或者把 `refresh` 拆成"读数据"和"副作用"两层。
- **架构隐患按"威胁等级 × 修复成本"排序**：apiKey 同步是 P0（安全）但 Phase 8 已修；Provider 单点故障是 P1（可用性）成本中等（加 fallback 链）；首页全量加载是 P2（性能）成本低（改并行）。不要按"发现的先后"修，按"风险密度"修。
- **tombstone 而非物理删除**：同步删除时不能真删 KV 里的数据，否则另一台设备同步时会"复活"。用 tombstone（带 `deletedAt` 时间戳的墓碑），TTL 30 天后真删。代价是 KV 存储多 30 天，收益是删除可传播。

**学到了什么**：React 死循环的根因永远是"依赖项引用不稳定"。`useCallback` / `useMemo` 的依赖必须是 primitive 或 useRef 持有的稳定引用，不能是 router / form / context value 这种每次 render 都变的对象。Phase 12 重写学习页时建立了"`useEffect` 依赖审计" checklist。

**如果重写会怎么做**：从 Phase 0 就该有 `lib/hooks/use-stable-router.ts` 这样的封装，把 `useRouter()` 的不稳定部分隔离。React 19 的 `use()` API 部分缓解了这个问题，但本项目还在 React 19.0。

**关联文档**：[fix-react-loop-and-arch-hardening spec](file:///workspace/.trae/specs/fix-react-loop-and-arch-hardening/spec.md)

---

## Phase 10：聊天重设计 + AI 工具修复

**做了什么**：两个 spec——[chat-redesign-and-title-layout](file:///workspace/.trae/specs/chat-redesign-and-title-layout/spec.md) 把聊天从底部 tab 改成右下角浮动入口（FloatingChatButton 常驻 + ChatModal 按需挂载），输入框独占一行，模型图标化 popover，快捷方式常驻，最新用户消息可编辑/可刷新；同时修学习详情页标题被按钮挤压（标题与按钮分两行而非 flex-wrap）。[ai-tool-fix-and-ux-polish](file:///workspace/.trae/specs/ai-tool-fix-and-ux-polish/spec.md) 修复 AI 工具完全空转 bug——`ChatClient.tsx:637` 流解析器监听 `type === "a"`（annotation 前缀），但工具结果实际通过 `6:` 前缀发送（Vercel AI SDK Data Stream Protocol），`pendingActions` 永远为空，`executeClientAction` 从不执行，7 个写入工具全是空转。还有二级 bug：`start_focus_session` 跳 `/focus`（实际是 `/timer`），`generate_learning_plan` 写 `learn:pending_plan` 但无人读取。

**为什么做**：用户反馈"只看到 AI 回复，没看到番茄钟启动"——AI 工具调用看起来在工作但实际没执行。同时聊天占用底部 tab 太重，用户希望改成浮动入口。

**关键决策（卡帕西视角）**：
- **理解协议而非猜前缀**：Vercel AI SDK Data Stream Protocol 的 `6:` 前缀是 `data` 类型的 chunk，工具结果走这个通道。Phase 3 误以为是 `type === "a"`（annotation），是猜的。修复时先读了一遍 SDK 源码的协议文档，确认 `0:` text / `2:` data / `6:` tool-result / `8:` annotations 等。代价是多花半天读源码，收益是修复一次到位。
- **浮动入口而非 tab**：聊天是"按需"功能（用户有问题时打开），不是"常驻"功能（不需要在导航位占一格）。FloatingChatButton 56px 圆形浮窗，点击展开 ChatModal 满屏。常驻 + 按需挂载——modal 不挂载时不占 bundle。
- **幂等键防重复执行**：工具调用可能因网络重试触发多次，幂等键（`toolCallId + args hash`）确保同一调用只执行一次。这是 Phase 6 没考虑到的——节奏引擎是纯规则不会有重复，但 AI 工具调用是网络请求。

**学到了什么**：流式协议的 bug 最难发现——表面上"AI 回复正常"，实际上工具空转。Phase 10 之后建立了"AI 工具调用端到端冒烟测试"的 checklist，每次改流解析器都跑一遍。

**如果重写会怎么做**：从 Phase 0 就该用 Vercel AI SDK 的 `useChat` hook 而非自己写流解析器。`useChat` 内置了协议解析、工具调用、消息状态管理。代价是绑定 Vercel 协议（其实已经绑了），收益是不用自己维护协议解析。

**关联文档**：[chat-redesign-and-title-layout spec](file:///workspace/.trae/specs/chat-redesign-and-title-layout/spec.md) / [ai-tool-fix-and-ux-polish spec](file:///workspace/.trae/specs/ai-tool-fix-and-ux-polish/spec.md)

---

## Phase 11：知识库向量化

**做了什么**：[knowledge-vector-search-design](file:///workspace/docs/superpowers/specs/2026-07-22-knowledge-vector-search-design.md) spec —— Workers AI `bge-base-en-v1.5`（768 维）预嵌入 500 条知识条目 → `public/data/knowledge-index.json`（构建期预嵌入，运行时只嵌查询文本）+ 余弦相似度 top-k 检索 + 关键词降级（向量失败时）+ 启发式判定（命令型前缀如"删除"/"创建"不检索）+ 三级降级加载（内存 → IndexedDB → fetch JSON）。

**为什么做**：用户反馈"问 AI '闭包是什么'，它给我背书式回答，没结合我自己的知识库里已有的相关条目"。RAG 检索能让 AI 回答基于用户已有知识图谱，而非凭空生成。

**关键决策（卡帕西视角）**：
- **构建期预嵌入而非运行时嵌入**：500 条 × 768 维如果运行时嵌入，每次冷启动要调 500 次 Workers AI，慢且贵。构建期 `scripts/build-knowledge-index.ts` 一次性预嵌入成 JSON，运行时只嵌查询文本（1 次 API 调用）。代价是知识库更新要重新跑脚本，收益是运行时零成本。
- **三级降级加载**：内存命中（最快）→ IndexedDB 命中（次快）→ fetch JSON（最慢但首次必走）。一旦加载到内存或 IndexedDB，后续查询零网络成本。
- **启发式判定跳过检索**："删除这张卡"、"创建提醒"这种命令型输入不需要 RAG，直接跳过检索走工具调用。用前缀匹配（"删除"/"创建"/"调整"/"启动"等）判定。代价是边缘场景会漏检索（如"我想了解删除策略"），收益是命令型输入零延迟。

**学到了什么**：RAG 不是"调嵌入 API + 余弦相似度"那么简单。要考虑：(1) 嵌入时机（构建期 vs 运行时）；(2) 加载策略（内存 / IndexedDB / fetch）；(3) 检索触发条件（不是所有输入都需要 RAG）；(4) 降级方案（向量失败时关键词降级）。每一层都是工程决策。

**如果重写会怎么做**：从 Phase 0 就该把知识库设计成"内容 + 嵌入"分离，而不是 Phase 11 才补嵌入层。Phase 13 的 Content-as-Code 课程图谱就是从这个教训来的——YAML 节点 + 构建期嵌入，结构清晰。

**关联文档**：[2026-07-22-knowledge-vector-search-design.md](file:///workspace/docs/superpowers/specs/2026-07-22-knowledge-vector-search-design.md)

---

## Phase 12：UI 重构与学习页重写

**做了什么**：[ui-redesign-and-learning-page-rework-design](file:///workspace/docs/superpowers/specs/2026-07-23-ui-redesign-and-learning-page-rework-design.md) spec —— 5 个 UI/交互设计点整体重构。包括：sticky header 替代 absolute 浮层（AGENTS.md 2.11 反模式根因）、`buildSceneUrl` 携带场景参数闭环（AGENTS.md 2.12）、虚拟列表优化大列表性能、路由级骨架屏（RouteLoading 4 variant）、模态用统一 `<Modal>` 组件（AGENTS.md 2.4）。

**为什么做**：用户反馈"脑图搜索框挡住工具栏 + 工具栏和搜索框遮挡脑图节点"。根因是 absolute 浮层覆盖可滚动内容（同位置浮层在窄屏重叠 + 浮层抢画布空间）。同时跳转不带场景参数导致用户在目标页要重新找任务（交互闭环断裂）。

**关键决策（双视角）**：
- **sticky header 占据自己空间（卡帕西视角）**：工具栏 / 搜索框 / 过滤器用 `sticky top-0` + `flex` 行布局，让它们占据自己应得的空间，画布从工具栏下方开始。代价是工具栏永远占顶部 60px，收益是画布完整可见、窄屏不重叠。AGENTS.md 2.11 把这个模式固化为强制规则。
- **`buildSceneUrl` / `parseSceneParams` 场景参数路由（乔布斯视角）**：用户从首页点任务 X 跳到学习页，学习页应该默认选中任务 X，而不是让用户重新找。`buildSceneUrl("/learn/${planId}", task, "home")` 构造带 `planId/nodeId/cardId/date/from` 的 URL，目标页 `parseSceneParams` 读取并过滤/预选。AGENTS.md 2.12 把这个模式固化为强制规则。
- **路由级骨架屏 4 variant**：list / detail / chart / form。每个 variant 对应不同的骨架结构，避免"全屏 spinner"的廉价感。代价是要维护 4 个骨架组件，收益是用户感知"页面在加载"而非"app 卡了"。

**学到了什么**：UI 反模式的根因不是"设计师没画好"，是"开发时只在小数据集 / 桌面宽屏上验证"。Phase 12 之后建立了"窄屏 + 数据稀疏 / 窄屏 + 数据密集"两种场景的必测 checklist，写进 AGENTS.md 2.11 的判断标准。

**如果重写会怎么做**：从 Phase 0 就该用 sticky header 而非 absolute 浮层。absolute 浮层是"看起来省事"的反模式——以为不占空间，实际遮挡内容。Phase 12 修这个花了整整 3 天重构所有"画布 + 工具栏"类组件。

**关联文档**：[2026-07-23-ui-redesign-and-learning-page-rework-design.md](file:///workspace/docs/superpowers/specs/2026-07-23-ui-redesign-and-learning-page-rework-design.md) / [AGENTS.md 2.11-2.12](file:///workspace/AGENTS.md)

---

## Phase 13：内容层重构（L1-L4 四层架构）

**做了什么**：基于 [devpath-ai-redesign.md](file:///workspace/devpath-ai-redesign.md) 的产品诊断与重构设计——(a) L1 内容层 Content-as-Code：`content/graph/nodes/*.yaml` 49 个技能节点（覆盖 LLM / RAG / Agent / 工程 / Python / Prompt 等九大类），每个节点必须挂载 ≥2 条 T0-T2 级权威来源（官方文档 / 论文 / 经典源码 / 一线工程博客），`content/sources/registry.yaml` 约 40 条来源登记处，`content/rubrics/` 5 个评分细则；(b) L2 路径引擎：`lib/curriculum/path-engine.ts` 技能图谱 + Kahn 拓扑排序（同层按 phase/id 字典序保证产物确定性）+ 跳过已掌握节点（`skillLevel=advanced 且 stability>21天`）+ 可行性评分（confidence < 0.5 自动降级）；(c) L3 验证层 V1-V4 状态机：V1 FSRS 卡片（已有）→ V2 代码沙箱（Vitest）→ V3 AI 按 Rubric 审 GitHub 仓库（`lib/ai/project-review.ts`）→ V4 作品集发布（`/portfolio` + `/u/[username]/portfolio`）；(d) 三层质量门禁：结构层（zod schema）+ 图谱层 G1-G7（前置存在/来源已登记/≥1 T0-T1/无环/轨道阶段合法/V3-V4 必挂 Rubric/权重=100）+ 成分层（权威体系/教学完备/路径引擎端到端）；(e) v4 深度字段：每个 AI 生成节点自带 `coreMechanism`（核心机制 80-150 字）/ `commonPitfalls`（高频踩坑 2-3 条）/ `interviewAngles`（4 题角度提示）/ `sourceHint`（一手来源提示），让学习路径本身是求职资产而非标题清单。

**为什么做**：用户投诉"所有学习路径还是不行，太简单，不全面，让人觉得候选人知识太浮于表面"。根因诊断（卡帕西视角）：(1) schema 太薄（旧 `knowledge_decompose` 只产 `summary` 一句话）；(2) 守护断层（preset 答案 < 500 字符蒙混过关）；(3) prompt 不要求深度。同时 [devpath-ai-redesign.md](file:///workspace/devpath-ai-redesign.md) 第一性原理诊断"通用 = 无定位 / AI 生成内容没权威 / 没能力验证闭环 / 机制过剩内容贫血"。

**关键决策（双视角）**：
- **Content-as-Code 而非数据库（卡帕西视角）**：知识库不是数据库行，是仓库里的 YAML 代码。原因：(1) 版本化（git diff 看内容变化）；(2) 可审查（PR review 内容质量）；(3) 可校验（CI 跑 G1-G7 图谱规则）；(4) 可重建（YAML → JSON → 向量索引全自动化）。代价是内容更新要提 PR，收益是质量可控。
- **T0-T2 权威来源强制（乔布斯视角）**：每节点 ≥2 条 T0-T2 来源（T0 官方文档/论文 / T1 经典源码/Cookbook / T2 一线工程博客），T3 二手解读仅作补充不可单独支撑节点。原因：2026 年 LLM 生成的二手内容无限供应且持续贬值，有出处的一手内容反而升值。LLM 是导师，不是教材本身。
- **V3 项目审查而非选择题（乔布斯视角）**：用户在 GitHub 推代码，AI 按 Rubric 逐项打分（架构 / 错误处理 / 成本意识 / 安全）。这是"能造出来没"的客观验证，比选择题高两个层级。技术上复用 Phase 6 的 AI 调用层 + 工具调用 + 质量追踪。
- **v4 深度字段必填（卡帕西视角）**：`coreMechanism` 80-150 字（核心机制，含量化细节）/ `commonPitfalls` 2-3 条（高频踩坑，带场景与修复方向）/ `interviewAngles` 4 题（概念辨析/原理深挖/实战设计/踩坑对比各一句）/ `sourceHint`（一手来源提示）。让学习路径节点本身就是求职资产，而非标题清单。守护测试 `content-generation-standard.test.ts` + `preset-content-quality.test.ts` 强制 prompt 标记 + 产物达标。

**学到了什么**：内容是护城河，不是机制。Phase 0-12 都在做"机制"（FSRS / 节奏引擎 / 优先级引擎 / 能量回归），但用户反馈"浮于表面"——机制过剩而内容贫血。Phase 13 把重心从"再加一个机制"转到"把内容做厚"。这是产品认知的转折点。

**如果重写会怎么做**：从 Phase 0 就该有 Content-as-Code 的内容层骨架，而不是先做 AI 现场生成再补策展。原因：(1) 策展内容是质量标杆，没有标杆 AI 生成会退化；(2) 策展过程会暴露 schema 缺口（Phase 13 才发现旧 schema 只有 summary 一句话）；(3) 策展节点能直接接入 FSRS / 路径引擎，不需要"AI 生成 → 落库 → 索引"的额外管线。

**关联文档**：[devpath-ai-redesign.md](file:///workspace/devpath-ai-redesign.md) / [AGENTS.md 2.13 + 第 9 节](file:///workspace/AGENTS.md) / [docs/content-generation-standard.md](file:///workspace/docs/content-generation-standard.md) / [docs/curriculum-content.md](file:///workspace/docs/curriculum-content.md)

---

## 迭代史的 5 条规律

回顾 Phase 0-13，能提炼出 5 条可迁移的迭代规律：

### 规律 1：每个 Phase 都有"威胁驱动"的根因

- Phase 1 脱敏：威胁 = userId 泄露
- Phase 4 守护测试：威胁 = 规范不执行
- Phase 8 零信任 session：威胁 = apiKey 明文
- Phase 9 tombstone：威胁 = 删除不传播
- Phase 13 权威来源：威胁 = LLM 二手内容贬值

**规律**：每个 Phase 都问"威胁是什么"，而非"功能是什么"。威胁驱动的设计能让每个组件对应一个具体问题，避免堆技术。

### 规律 2：守护测试是规范落地的唯一手段

- Phase 4 `no-native-form-elements.test.ts` 守护表单统一
- Phase 5 CI 两段守护质量门禁
- Phase 8 `--max-warnings 0` 守护 ESLint
- Phase 13 `content-generation-standard.test.ts` 守护 prompt 标记

**规律**：规范文档会被忽略，CI red 不会。**规则没有测试守护等于建议。** 每加一条规范，同时加一个守护测试。

### 规律 3：复用而非推倒

- Phase 7 v2 复用 Phase 6 的 study-queue / 节奏引擎 / 画像，省 80% 工作量
- Phase 13 复用 Phase 6 的 AI 调用层做 V3 项目审查
- Phase 13 复用 Phase 11 的向量索引做策展节点 RAG

**规律**：重构最大的诱惑是"重写"。先盘点"已有基础设施能复用什么"，再决定"要新做什么"。乔布斯说"简单比复杂更难"，但简单不等于重写——简单是把复杂藏起来。

### 规律 4：决策逻辑抽成纯函数

- Phase 2 `resolveLearnEntry()` 路由判断
- Phase 6 节奏引擎 6 条决策链
- Phase 6 优先级引擎 4 维评分
- Phase 13 Kahn 拓扑排序

**规律**：决策逻辑不藏在组件里。抽成纯函数有 4 个好处：(1) 可单测；(2) 可在 Edge API 复用；(3) 不引入 React 依赖；(4) 决策路径可解释。

### 规律 5：内容是护城河，不是机制

- Phase 0-12 都在做机制（FSRS / 节奏 / 优先级 / 能量）
- Phase 13 才做内容（Content-as-Code + 49 节点策展）
- 用户反馈"浮于表面"是在 Phase 12 后才爆发的——机制过剩而内容贫血

**规律**：学习产品的护城河是内容，不是机制。机制过剩会变成"给自行车装飞机引擎"。先做内容标杆，再做机制调度。

---

## 小结

14 个 Phase 不是线性的"做完一个做下一个"，而是螺旋上升——Phase 4 守护测试 → Phase 5 质量门禁 → Phase 8 ESLint 强化 → Phase 13 内容守护测试，是"质量护栏"维度的 4 轮迭代；Phase 6 智能化 → Phase 7 三模式 → Phase 13 四层架构，是"产品架构"维度的 3 轮迭代；Phase 8 零信任 session → Phase 9 架构加固 → Phase 11 向量检索，是"工程基础"维度的 3 轮迭代。

每个 Phase 都不是"完成即结束"，而是"为下一个 Phase 铺路"。Phase 0 的 IndexedDB 单表设计 → Phase 6 的画像 prefix 扫描 → Phase 9 的 tombstone 同步 → Phase 13 的 Content-as-Code，是一条从"数据存储"到"内容护城河"的连贯演进线。

下一章 [08-deployment.md](file:///workspace/docs/tutorial/08-deployment.md) 会讲部署流程——这些迭代是怎么真正上线到 https://devpath-ai.pages.dev/ 的。
