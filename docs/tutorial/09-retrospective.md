# 第 9 章 总结与复盘

> **视角**：双视角（乔布斯看产品，卡帕西看技术）
> **预计阅读时间**：22 分钟
> **前置知识**：第 1-8 章全部
> **学习目标**：从 devpath-ai 的全流程中提炼可迁移的方法论，理解技术决策与产品决策的得与失，建立自己的"项目复盘 checklist"。

---

## 5 条可迁移的方法论

### 方法论 1：威胁驱动设计

**核心**：每个架构决策都问"威胁是什么"，而非"功能是什么"。

**devpath-ai 的实践**：
- Phase 1 脱敏：威胁 = userId 泄露 → 纯函数 `maskUsername()` + 守护测试
- Phase 8 零信任 session：威胁 = apiKey 明文 → AES-GCM + nonce + HMAC + 时间窗 + 滑动续期
- Phase 9 tombstone：威胁 = 删除不传播 → tombstone TTL 30 天
- Phase 13 权威来源：威胁 = LLM 二手内容贬值 → T0-T2 来源强制 + 守护测试

**如何迁移到其他项目**：
1. 写架构文档前，先列"威胁清单"——这个系统可能被谁、用什么方式、攻击哪个点
2. 每个组件对应一个具体威胁，而非"为了安全"
3. 守护测试断言"威胁被防住"，而非"功能正常"

**反例**："加个 HTTPS 就安全了"——HTTPS 只防中间人，不防 XSS / CSRF / 重放攻击。威胁驱动会逼你问"我要防什么"。

### 方法论 2：规则没有测试守护等于建议

**核心**：规范文档会被忽略，CI red 不会。

**devpath-ai 的实践**：

| 规则 | 守护测试 | 守护内容 |
|---|---|---|
| 表单元素必须用统一组件库 | `no-native-form-elements.test.ts` | 扫描 `.tsx` 发现原生 `<input>/<select>/<textarea>/<button>` 即失败 |
| 浅色 utility 必须带 `dark:` 配对 | `ui-design-system-guard.test.ts` | 扫描 className，缺 `dark:` 配对即失败 |
| 禁止 `text-[Npx]` 逃逸值 | `ui-design-system-guard.test.ts` | 扫描 className，发现 `text-[10px]` 等即失败 |
| Prompt 必须含四段式宪章标记 | `content-generation-standard.test.ts` | 扫描 prompt 字符串，缺标记即失败 |
| Preset 答案 >= 500 字符 | `preset-content-quality.test.ts` | 扫描 preset JSON，字符数不足即失败 |
| Prompt 改动必须 bump version | `prompts.test.ts` | 指纹快照不匹配即失败 |

**如何迁移到其他项目**：
1. 每加一条规范，同时加一个守护测试
2. 守护测试用最简单的实现（正则扫描 > AST 解析），零依赖优先
3. 守护测试名要描述规则（`it("不允许在 components/ui/ 之外使用原生 <input>", ...)`），测试即文档
4. 守护测试进 CI，失败阻断部署

**反例**：写了一份《代码规范》PDF 放 Wiki 里，没人看。3 个月后代码风格五花八门。

### 方法论 3：复用而非推倒

**核心**：重构最大的诱惑是"重写"。先盘点"已有基础设施能复用什么"，再决定"要新做什么"。

**devpath-ai 的实践**：
- Phase 7 v2 复用 Phase 6 的 study-queue / 节奏引擎 / 画像，省 80% 工作量
- Phase 13 复用 Phase 6 的 AI 调用层做 V3 项目审查
- Phase 13 复用 Phase 11 的向量索引做策展节点 RAG
- Phase 13 复用 Phase 8 的零信任 session 做内容生产管线鉴权

**如何迁移到其他项目**：
1. 重构前先做"基础设施盘点"——列出已有模块 / 工具 / 模式
2. 每个新需求先问"能复用什么"，再问"要新做什么"
3. 复用的代价是"被旧设计束缚"，但收益是"省 80% 工作量"
4. 乔布斯说"简单比复杂更难"——简单不等于重写，简单是把复杂藏起来

**反例**：每次重构都推倒重来，3 个月后又重构一次，永远在重写同一段代码。

### 方法论 4：决策逻辑抽成纯函数

**核心**：决策逻辑不藏在组件里。

**devpath-ai 的实践**：
- Phase 2 `resolveLearnEntry()` 路由判断
- Phase 6 节奏引擎 6 条决策链（纯 if-else，不调 LLM）
- Phase 6 优先级引擎 4 维评分
- Phase 13 Kahn 拓扑排序
- Phase 13 路径引擎跳过已掌握节点

**如何迁移到其他项目**：
1. 任何"if-else 决策"或"评分排序"逻辑，抽成纯函数
2. 纯函数 = 给定输入有确定输出，无副作用
3. 好处：可单测、可在 Edge API 复用、不引入 React 依赖、决策路径可解释
4. 决策逻辑的"原因"写在函数头注释里（"为什么是 0.3 而非 0.4"）

**反例**：决策逻辑写在 `useEffect` 里，每次 render 都重新计算，且无法单测。

### 方法论 5：内容是护城河，不是机制

**核心**：学习产品的护城河是内容，不是机制。机制过剩会变成"给自行车装飞机引擎"。

**devpath-ai 的实践**：
- Phase 0-12 都在做机制（FSRS / 节奏 / 优先级 / 能量）
- Phase 13 才做内容（Content-as-Code + 49 节点策展）
- 用户反馈"浮于表面"是在 Phase 12 后才爆发的——机制过剩而内容贫血
- Phase 13 把重心从"再加一个机制"转到"把内容做厚"

**如何迁移到其他项目**：
1. 任何"工具型"产品都要问"内容从哪来"
2. AI 生成内容 ≠ 内容护城河——LLM 生成的二手内容无限供应且持续贬值
3. Content-as-Code：内容是仓库里的代码，版本化、可审查、可校验
4. 权威来源强制：每条内容必须能回答"出处在哪"

**反例**：做一个"AI 学习助手"，让 LLM 现场拆知识树、生面试题。用户用 3 次后发现"答案都对但都很浅"，流失。

---

## 卡帕西视角：技术决策的得与失

### 得

#### 1. IndexedDB 单表 kv 设计

**得**：迁移成本为零（idb-keyval 直接升级到 Dexie），prefix 索引快速取数据，单一查询接口易于抽象。

**反思**：业务复杂后（Phase 6 画像 / Phase 8 session / Phase 13 mastery-store），单表 kv 的 prefix 扫描效率下降。Phase 13 引入了 `mastery-store.ts` 做更结构化的存储，但本质上还是 prefix 扫描。

**如果重写**：保留单表 kv 作为"通用 KV"，但为高频结构化数据（mastery / portfolio）引入独立 Dexie 表，用 Dexie 的 `where().equals()` 走索引而非 prefix 扫描。

#### 2. Vercel AI SDK

**得**：流式响应、工具调用、structured output 开箱即用，省了大量协议解析工作。

**反思**：Phase 10 的工具调用空转 bug 暴露了"不理解协议就出 bug"的问题。`6:` 前缀是 Data Stream Protocol 的 tool-result 通道，Phase 3 误以为是 `type === "a"`（annotation）。

**如果重写**：仍然用 Vercel AI SDK，但第一天就读一遍协议文档（[Data Stream Protocol](https://sdk.vercel.ai/docs/ai-sdk-ui/streaming)），把 `0:` text / `2:` data / `6:` tool-result / `8:` annotations 等前缀写成内部文档。

#### 3. ts-fsrs 4.5

**得**：复习算法是社区最佳实现，参数稳定，3 种预设（conservative 0.95 / standard 0.9 / aggressive 0.8）覆盖不同用户偏好。

**反思**：FSRS-4.5 是 2024 年的版本，2026 年已经有 FSRS-5（更好的短时记忆建模）。ts-fsrs 库支持升级，但 API 有 breaking change。

**如果重写**：直接用 FSRS-5，但保留 3 种预设的抽象层，让算法版本可替换。

#### 4. 零信任 session 架构

**得**：apiKey 永不出现在请求里，nonce 防重放，HMAC 防篡改，时间窗防中间人，滑动续期体验好。4 个独立 KV namespace 安全边界清晰。

**反思**：架构复杂度高，4 个 KV namespace 的 wrangler.toml 配置冗长。Phase 8 写完后才意识到 `AUTH_AUDIT` 几乎没用过——审计日志写了但没人看。

**如果重写**：保留零信任 session 架构，但把 `AUTH_AUDIT` 改成应用内日志（写 IndexedDB 而非 KV），定期清理。KV 只留 3 个 namespace。

#### 5. Content-as-Code 课程图谱

**得**：YAML 节点版本化（git diff 看内容变化）、可审查（PR review 内容质量）、可校验（CI 跑 G1-G7 图谱规则）、可重建（YAML → JSON → 向量索引全自动化）。

**反思**：49 个节点手工策展花了 2 周。AI 起草能加速，但人工审校仍不可省。

**如果重写**：保留 Content-as-Code，但从第一天就建立"AI 起草 + 人工审校"的管线，而非先手工做 30 个标杆节点再补管线。

### 失

#### 1. 没有从 Phase 0 用 Content-as-Code

**失**：Phase 0-12 都是 AI 现场生成内容，导致用户反馈"浮于表面"。Phase 13 才补 Content-as-Code，付出了"既要维护旧 AI 生成路径，又要建新策展路径"的并行成本。

**根因**：MVP 阶段想快速验证"AI 教练"假设，跳过了内容层。但学习产品的护城河就是内容，跳过内容层等于跳过产品本身。

**教训**：MVP 不是"跳过非核心功能"，是"跳过非核心机制"。内容是核心功能，不能跳。

#### 2. absolute 浮层反模式蔓延

**失**：Phase 0-11 多次用 `absolute top-2 left-2` 浮层当工具栏，导致 Phase 12 用户反馈"脑图搜索框挡住工具栏 + 工具栏和搜索框遮挡脑图节点"。修这个花了 3 天重构所有"画布 + 工具栏"类组件。

**根因**：开发时只在小数据集 / 桌面宽屏上验证，没考虑窄 Modal（脑图弹窗在 xl=1024px Modal 内）和移动端。

**教训**：UI 反模式不是"看起来不对"，是"窄屏 + 数据密集场景下必然崩"。Phase 12 后建立了"窄屏 + 数据稀疏 / 窄屏 + 数据密集"两种场景的必测 checklist。

#### 3. React `useCallback` 链式依赖

**失**：Phase 9 React error #185 阻塞用户使用。`useCallback(refresh, [router])` + `useEffect(refresh)` 形成链式依赖，router 引用抖动即触发无限渲染。同类反模式在 4 个文件中重复出现。

**根因**：不熟悉 Next.js App Router 的 `useRouter()` 返回的 router 实例不保证引用稳定。

**教训**：`useCallback` / `useMemo` 的依赖必须是 primitive 或 useRef 持有的稳定引用。React 19 的 `use()` API 部分缓解了这个问题，但仍需谨慎。

#### 4. AI 工具调用流解析器 bug 隐藏太久

**失**：Phase 3 就有 AI 工具空转 bug，但到 Phase 10 才发现。期间 7 个写入工具（番茄钟/计划调整/提醒/生成计划）全是空转，用户以为"AI 回复了但没执行"。

**根因**：表面上看 AI 回复正常，工具调用看起来在工作。没有端到端冒烟测试验证工具实际执行。

**教训**：流式协议的 bug 最难发现。AI 工具调用必须有端到端冒烟测试——不只是"AI 回复了"，而是"工具真的执行了"。

#### 5. 审计日志写了没人看

**失**：Phase 8 的 `AUTH_AUDIT` KV namespace 写了 session 创建 / 续期 / 吊销 / nonce 消费 / 异常时间窗请求，但从未实际查看过。

**根因**：审计日志没有"消费端"——没有 dashboard 展示，没有告警触发。

**教训**：可观测性不只是"记录"，是"记录 + 展示 + 告警"。没有消费端的日志等于没记。

---

## 乔布斯视角：产品决策的得与失

### 得

#### 1. 6 区首页（3 秒知道做什么）

**得**：用户打开 app 3 秒内知道"现在该做什么"——节奏引擎告诉你"继续专注 / 低能量休息 / 到期复习 / routine 时段专注 / 睡前复盘 / 默认学习"。KPI 缩成顶部一行小字，行动指挥中心是当下视角。

**反思**：6 区是 Phase 7 v2 落地的，之前是 KPI 三宫格。乔布斯视角的诊断"功能堆砌的学习工具，没有灵魂"逼出了 6 区设计。

**如果重写**：从 Phase 0 就该有"现在该做什么"的 Hero 区，而非先做 KPI 罗列再改。

#### 2. Path/Train/Interview 三模式

**得**：把 15+ 功能收敛为 3 个核心模式——Path（转岗路径图）/ Train（沉浸式训练会话）/ Interview（AI 模拟面试）。用户从"使用工具"转变为"被教练陪跑"。

**反思**：v1 计划是推倒重来，v2 改成复用基础设施 + 重新组织入口，省 80% 工作量。乔布斯说"简单比复杂更难"——简单不等于重写，简单是把复杂藏起来。

**如果重写**：从 Phase 0 就该有"三模式"的产品骨架，而不是先堆 15 功能再做减法。但这是事后诸葛亮——Phase 0 时不知道哪些功能会被砍，必须先做出来才能判断。

#### 3. 番茄钟 widget 两态（ring ↔ card）

**得**：右下角浮动 widget，ring 态 56px 圆环常驻显示倒计时进度，card 态 280×420 卡片承载完整交互。可拖动 + 边缘吸附。不打断用户当前任务，需要时展开。

**反思**：Phase 6 之前番茄钟是独立页面 `/timer`，用户要离开当前任务去启动。widget 化后番茄钟常驻，启动成本归零。

**如果重写**：从第一天就该用 widget 而非独立页面。番茄钟是"陪跑"功能，不是"目的地"功能。

#### 4. Demo 站（首次访问自动注入示例数据）

**得**：首次打开 https://devpath-ai.ai-kits.workers.dev/ 自动注入示例数据（前端工程师计划 + 3 张复习卡片 + 2 天学习日志），不用配置即可体验完整功能。创建真实计划时提示一键清除。

**反思**：降低首次体验门槛。用户不用先配置 AI 模型就能看到"这个 app 能干什么"。

**如果重写**：保留 Demo 站设计，但 Demo 数据应该更贴近"目标用户画像"——前端工程师转 AI 的真实场景，而非泛泛示例。

#### 5. 学习队列合并 new + review

**得**：用户不需要在两个 tab 间切换。5 维评分让最该做的事排第一。每条带中文 reason——"为什么是这个任务"比"这个任务是什么"更重要。

**反思**：Phase 6 之前新学和复习是分开的 tab，用户要在两个列表间手动选择。合并后单一待办流，5 维评分自动排序。

**如果重写**：从第一天就该合并。但 5 维评分是 Phase 6 智能化才有的，Phase 0 时还没画像 / 能量 / 多巴胺数据，评分维度不全。

### 失

#### 1. 通用定位（"想学什么都行"）

**失**：Phase 0-12 都是"告诉 AI 你想学什么"的通用工具定位，没有聚焦。Phase 13 才收敛为"前端工程师 → AI 全栈 / AI Agent 工程师的转型系统"。

**根因**：怕"做窄了没用户"。但通用 = 无定位，用户不为"学习工具"付费，为"身份转变"付费。

**教训**：乔布斯说"聚焦不是说不对其他事情说不，是说对 1000 个好想法说不"。先做窄做深，一条被验证的 16 周转型路径，比一百条 AI 现场生成的路径值钱。

#### 2. AI 现场生成内容（无权威层）

**失**：Phase 0-12 让 LLM 现场拆知识树、生面试题，质量不可验证、内容无出处、错误无追责。用户反馈"浮于表面"。

**根因**：LLM 应该是导师，不应该是教材本身。职业提升场景下，用户需要的是官方文档、论文、经典实现这些**有出处（provenance）**的内容。

**教训**：2026 年的信息环境，LLM 生成的二手内容无限供应且持续贬值，有出处的一手内容反而升值。每条内容必须能回答"这句话的依据是什么？出处在哪？"

#### 3. 没有验证闭环（"记住没" vs "能造出来没"）

**失**：Phase 0-12 只验证"你记住了吗"（FSRS 卡片、面试题），不验证"你能造出来吗"。技能习得的第一性原理是 **Skills are built by doing, not by reading.**

**根因**：缺少项目、代码执行验证、作品集产出。学习没有终点证据。

**教训**：每个知识节点必须挂可执行验证——V1 FSRS 卡片（理解）→ V2 代码沙箱（应用）→ V3 项目检查点（构建）→ V4 作品集发布（交付）。V3 是关键创新：AI 按 Rubric 审真实 GitHub 仓库。

#### 4. 机制过剩，内容贫血

**失**：Phase 0-12 做了大量机制（节奏引擎 + 优先级引擎 + 能量回归 + 情绪追踪 + 成就系统），但只有 151 条内容。这是给"已经有几千小时课程内容"的产品准备的调度系统，在 151 条内容上跑这套引擎，是给自行车装飞机引擎。

**根因**：先做机制后做内容。机制做起来有成就感（看得到代码），内容做起来枯燥（要查文档、写 YAML）。但学习产品的护城河是内容，不是机制。

**教训**：Duolingo 值钱的地方不是 Streak 机制，是几千节被精细编排过的课程。Streak 之所以有效，是因为课程本身值得坚持。

#### 5. 文案不够人话

**失**：部分文案偏技术化——"Confirm Mastery" / "Next Action" / "Break Session"。乔布斯视角的文案应该是"我答对了" / "现在该做什么" / "休息 5 分钟"。

**根因**：开发者写文案，没有产品视角审查。

**教训**：UI 文案是产品的一部分，不是"功能完成后补的字"。每个文案都要问"用户看到这个会怎么想"。

---

## 延伸阅读

### 项目内文档

- [README.md](file:///workspace/README.md) — 项目介绍（开发者入口）
- [AGENTS.md](file:///workspace/AGENTS.md) — AI 编码守则（强制规范）
- [docs/PRODUCT.md](file:///workspace/docs/PRODUCT.md) — 产品说明（乔布斯视角）
- [docs/ARCHITECTURE.md](file:///workspace/docs/ARCHITECTURE.md) — 技术架构（卡帕西视角）
- [docs/DEVELOPMENT.md](file:///workspace/docs/DEVELOPMENT.md) — 开发指南
- [docs/ui-design-system.md](file:///workspace/docs/ui-design-system.md) — UI 设计系统
- [docs/content-generation-standard.md](file:///workspace/docs/content-generation-standard.md) — AI 内容生成规范
- [docs/curriculum-content.md](file:///workspace/docs/curriculum-content.md) — 课程内容规范
- [docs/code-audit-methodology.md](file:///workspace/docs/code-audit-methodology.md) — 代码审计方法论
- [devpath-ai-redesign.md](file:///workspace/devpath-ai-redesign.md) — 产品诊断与重构设计

### Spec / Plan 文档（迭代史原始材料）

- [.trae/specs/](file:///workspace/.trae/specs/) — 7 个 spec（设计意图）
- [docs/superpowers/plans/](file:///workspace/docs/superpowers/plans/) — 9 个 plan（实施计划）
- [docs/superpowers/specs/](file:///workspace/docs/superpowers/specs/) — 3 个深度 spec（向量检索 / UI 重构 / 教程设计）

### 外部资源

#### 技术栈官方文档
- [Next.js 15 App Router](https://nextjs.org/docs/app) — 路由 / Server Components / Edge Runtime
- [React 19](https://react.dev/blog/2024/12/05/react-19) — `use()` / Actions / Server Components
- [TypeScript 5.5](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-5-5.html) — 推断类型守卫
- [Tailwind CSS 3.4](https://tailwindcss.com/blog/tailwindcss-v3-4) — dark mode / container queries
- [Vercel AI SDK](https://sdk.vercel.ai/docs) — `streamText` / `generateObject` / Data Stream Protocol
- [ts-fsrs](https://github.com/open-spaced-repetition/ts-fsrs) — FSRS-4.5 实现
- [Vitest](https://vitest.dev/) — 测试框架
- [Dexie.js](https://dexie.org/) — IndexedDB 封装

#### Cloudflare 平台
- [Cloudflare Pages](https://developers.cloudflare.com/pages/) — 部署平台
- [Cloudflare KV](https://developers.cloudflare.com/kv/) — 边缘存储
- [Workers AI](https://developers.cloudflare.com/workers-ai/) — 边缘 AI 推理
- [`@cloudflare/next-on-pages`](https://github.com/cloudflare/next-on-pages) — Next.js → Edge Runtime 转换
- [wrangler](https://developers.cloudflare.com/workers/wrangler/) — CLI 工具

#### 学习理论
- [FSRS Algorithm](https://github.com/open-spaced-repetition/fsrs4anki/wiki/The-Algorithm) — FSRS 算法原理
- [Spaced Repetition](https://www.gwern.net/Spaced-repetition) — Gwern 的间隔重复深度文章
- [Ebbinghaus Forgetting Curve](https://en.wikipedia.org/wiki/Forgetting_curve) — 艾宾浩斯遗忘曲线

#### 产品设计
- [Steve Jobs on Focus](https://www.youtube.com/watch?v=H8eP99ne6s4) — 乔布斯谈聚焦
- [The Mom Test](https://www.momtestbook.com/) — Rob Fitzpatrick 的用户访谈方法
- [Inspired](https://www.svpg.com/inspired-how-to-create-tech-products-customers-love/) — Marty Cagan 的产品管理

#### 工程实践
- [The Pragmatic Programmer](https://pragprog.com/titles/tpp20/the-pragmatic-programmer-20th-anniversary-edition/) — David Thomas & Andrew Hunt
- [Refactoring](https://martinfowler.com/books/refactoring.html) — Martin Fowler
- [Working Effectively with Legacy Code](https://www.oreilly.com/library/view/working-effectively-with/0131177052/) — Michael Feathers

---

## 最后：给读者的复盘 checklist

读完本教程后，把以下 checklist 应用到你自己的项目：

### 立项阶段
- [ ] 我能一句话说清"这个产品解决什么问题"吗？
- [ ] 我列出了"威胁清单"（产品失败的具体威胁）吗？
- [ ] 我定义了"目标用户画像"（不是"所有人"）吗？

### 需求分析阶段
- [ ] 我区分了功能性需求和非功能性需求吗？
- [ ] 我写了 5-8 个用户故事（具体场景）吗？
- [ ] 我列出了约束条件（技术 / 业务 / 时间）吗？

### 产品设计阶段
- [ ] 我有产品原则（聚焦 / 少即是多 / 真实场景驱动）吗？
- [ ] 我做了减法（砍掉非核心功能）吗？
- [ ] 我考虑了"内容从哪来"（不只是机制）吗？

### 技术选型阶段
- [ ] 每个技术决策都有"对比表"（3-5 个选项 × 5 个维度）吗？
- [ ] 我能说清"为什么选这个而非那个"吗？
- [ ] 我记录了"代价"（每个选择的代价）吗？

### 规范约束阶段
- [ ] 我有规范文档（AGENTS.md 等价物）吗？
- [ ] 每条规范都有守护测试吗？
- [ ] 守护测试进 CI 了吗？

### 代码实现阶段
- [ ] 决策逻辑抽成纯函数了吗？
- [ ] 关键模块有单测吗？
- [ ] 我建立了"窄屏 + 数据密集"测试场景吗？

### 迭代阶段
- [ ] 我用 spec/plan 记录"为什么做"吗（不只是 git log）？
- [ ] 每个 Phase 末尾做了复盘吗？
- [ ] 我建立了"基础设施盘点"习惯（复用而非推倒）吗？

### 部署阶段
- [ ] CI 是两段（quality-gate → deploy）吗？
- [ ] Secrets 区分了 GitHub Secrets / 运行时 Secrets / vars 吗？
- [ ] 有回滚策略（一键回滚 / git revert / 数据 backup）吗？

### 复盘阶段
- [ ] 我从"威胁驱动"角度复盘了吗？
- [ ] 我记录了"得与失"（不只是"做了什么"）吗？
- [ ] 我提炼了可迁移的方法论（不只适用于这个项目）吗？

---

## 小结

devpath-ai 的全流程教学到这里结束。从立项到部署的 14 个 Phase、20 个技术决策点、13 条 UI 规范、6 个核心模块实现、5 条可迁移方法论——这些都是**一个真实项目**的决策脉络，不是教科书定义。

教程的最终目标不是让你复制 devpath-ai 的代码，而是让你建立自己的"项目决策框架"——遇到技术选型时知道怎么对比，遇到规范约束时知道怎么守护，遇到迭代时知道怎么复盘。

如果这份教程对你有帮助，把 `build-project-tutorial` skill 应用到你自己的项目，产出你自己的教程。教学是最好的学习——你能讲清楚一个决策的"为什么"，才是真的理解了它。

完整教程索引见 [README.md](file:///workspace/docs/tutorial/README.md)。
