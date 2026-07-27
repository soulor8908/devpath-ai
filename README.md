# devpath-ai

> AI-Native 开发者成长 OS — 告诉 AI 你想学什么，它给你策展知识图谱、排学习路径、生面试题、按遗忘曲线复习、追踪能量与情绪、编排学习节奏、陪伴你专注，并把学习轨迹变成可证明的求职资产。

一个面向自学开发者的本地优先（local-first）PWA：数据存在浏览器 IndexedDB，可跨设备同步到 Cloudflare KV，AI 调用走云端（用户自带 Key 走零信任 session 加密，或用服务端 Trial 模式按场景配额免费试用）。

**生产链接**：<https://devpath-ai.pages.dev/>

---

## ✨ 核心能力

### 基础能力（L4 交付层）

- **知识拆解**：输入主题（如「前端性能」「系统设计」），AI 拆成可独立学习的知识节点 + 依赖图 + 面试频率标注；v4 节点自带 `coreMechanism` / `commonPitfalls` / `interviewAngles` / `sourceHint` 四个深度字段，让学习路径本身是求职资产
- **学习计划**：按每日可用分钟自动排日程，支持延后 / 重分配 / 冻结 / 优先级调整
- **面试题生成**：每个知识点生成 4 角度面试题（概念辨析 / 原理深挖 / 实战设计 / 踩坑对比）+ 四段式答案（结论与原理 / 实战案例 / 举一反三 / 扣分点对照）+ 关键点 + 追问
- **FSRS 复习**：基于遗忘曲线的复习卡片调度（ts-fsrs 4.5），Streak + 热力图可视化，3 种参数预设（conservative 0.95 / standard 0.9 / aggressive 0.8）
- **能量回归**：8 维特征线性回归（含 sin/cos 时段编码 + dayOfWeek + dopamineInterference），每周自动重训练，预测次日容量，自动回填实际学习时长
- **情绪觉察**：1 秒记录情绪 + 多巴胺干扰来源，AI 生成应对建议
- **AI 聊天**：流式对话 + 8 个工具调用（创建提醒 / 调整计划 / 切换冻结 / 设置优先级 / 启动番茄 / 生成计划 / 优化日程 / 获取今日日程），幂等键防止重复执行
- **周报**：AI 生成本周学习报告（统计 / 模式识别 / 情绪与多巴胺 / 下周建议）
- **公开主页**：`/u/<username>` 分享学习轨迹（热力图 + 雷达图 + 打卡天数 + 成就墙）
- **跨设备同步**：增量同步到 Cloudflare KV，Last-Write-Wins 合并，tombstone TTL 30 天

### 智能化能力（AI-Native）

- **番茄时钟**：25 分钟专注 + 5 分钟休息的番茄工作法，4-1 长休息规则，浏览器通知提醒，打断追踪（严格模式 3 次打断自动放弃），完成后自动写 LearnLog + 更新能量样本；统一为右下角浮动 widget（两态：ring 56px 圆环 ↔ card 280px 卡片，可拖动 + 边缘吸附）
- **用户画像**：从 FSRS 稳定性 + 准确率 + 学习日志 + 能量样本自动构建多维画像（技能水平 / 偏好时段 / 平均专注时长 / 薄弱环节 / 学习风格），24h TTL 自动重建，高频维度（averageSessionMinutes / accuracy）事件驱动增量更新，注入每次 AI 对话上下文
- **精准计划**：基于用户画像生成个性化学习计划，可行性评分（confidence < 0.5 自动降级），跳过已掌握节点加速进度
- **优先级引擎**：4 维加权评分（截止紧迫度 0.3 + FSRS 到期 0.3 + 技能差距 0.2 + 能量匹配 0.2），每日缓存，健康检查（逾期 / 完成率 / 能量趋势 / 卡片积压）
- **节奏引擎**：6 条决策优先级链统一编排「现在该做什么」——继续专注 → 低能量休息 → 到期复习 → routine 时段专注 → 睡前复盘 → 默认学习，不消耗 AI 额度
- **AI 人格化**：4 种 Persona（严厉教练 / 温和陪伴 / 苏格拉底导师 / 平等同行），根据能量/心情/连续天数/提问内容自动切换，用户可手动覆盖
- **专注环境保护**：严格/宽松两种模式，严格模式 3 次打断自动放弃 session，actualMinutes 扣除打断时长避免污染能量模型
- **成就系统**：16 个预置成就（连续打卡 / 计划完成 / 专注时长 / 复习连续 / 断卡恢复 / 首次成就），纯函数检测，首页通知 + 成就墙
- **学习队列**：合并「新学」+「复习」为单一待办流，5 维评分（FSRS 紧迫度 + 能量补偿 + 多巴胺补偿 + 连续 new 过载扣分），每条带中文 reason；跳转用 `buildSceneUrl` 携带场景参数闭环（AGENTS.md 2.12 强制）
- **Demo 站**：首次访问自动注入示例数据（前端工程师计划 + 3 张复习卡片 + 2 天学习日志），创建真实计划后可一键清除
- **零信任 session**：apiKey 不直接暴露，AES-GCM 加密 session + nonce 5min 一次性消费 + HMAC-SHA256 签名 + 时间窗 ±60s + 滑动续期 7d；旧用户首次访问检测：有 `modelConfig.apiKey` 但无 session → 显示升级提示
- **AI 调用限流**：按场景配额（聊天 20/日 / 计划生成 5/日 / 周报 1/日 / 提醒 4/日 / Trial 5/日），用户自带 API Key 不受限
- **AI 质量观测**：按场景统计调用数 / 采纳率 / 再生成率 / 平均耗时，Prompt 版本对比，失败模式聚类
- **AI 成本追踪**：从 Vercel AI SDK data stream 协议的 finish 消息解析 token 使用量，按模型定价表（GLM / DeepSeek / GPT 等）估算 USD 成本，仪表盘展示 Token 总量 + 估算成本 + 场景级成本聚合

### 内容层（L1 策展护城河）

- **Content-as-Code 课程图谱**：知识库不是数据库行，是仓库里的 YAML 代码。`content/graph/nodes/*.yaml` 49 个技能节点（覆盖 LLM / RAG / Agent / 工程 / Python / Prompt 等九大类），每个节点必须挂载 ≥2 条 T0-T2 级权威来源（官方文档 / 论文 / 经典源码 / 一线工程博客），不允许 LLM 即兴生成
- **L2 路径引擎**：技能图谱 + 拓扑排序（Kahn 算法，同层按 phase/id 字典序保证产物确定性）→ 跳过已掌握节点的最短路径
- **L3 验证层 V1-V4**：V1 FSRS 卡片（理解）→ V2 沙箱代码题（应用）→ V3 项目检查点（AI 按 Rubric 审 GitHub 仓库，构建）→ V4 作品集发布（交付）
- **L4 作品集**：`/portfolio` 草稿/发布/删除/同步云端 + 二维码分享；`/u/[username]/portfolio` 公开作品集访客查看
- **权威来源等级**：T0 一手规范（官方文档/论文） / T1 一手实现（经典源码/Cookbook） / T2 权威工程实践（一线从业者深度文章） / T3 二手解读（仅作补充，不可单独支撑节点）
- **6 个预置学习计划**：frontend-to-ai-engineer（旗舰，49 节点派生自策展图谱）/ algorithm-200（LeetCode 200 题）/ frontend / backend / ai / llm-app
- **三层质量门禁**：结构层（zod schema）+ 图谱层 G1-G7（前置存在/来源已登记/≥1 T0-T1/无环/轨道阶段合法/V3-V4 必挂 Rubric/权重=100）+ 成分层（权威体系/教学完备/路径引擎端到端）
- **知识库向量搜索**：500 条 × 768 维 BGE 嵌入（构建期预嵌入，运行时只嵌查询文本），余弦相似度 top-k + 关键词降级 + 启发式判定（命令型前缀不检索）
- **PWA Service Worker**：stale-while-revalidate 缓存策略 + Web Push 推送 + periodicsync 后台检查（到期复习提醒 + 断卡回归提醒）

---

## 🏗️ 技术架构

| 层 | 选型 |
|---|---|
| 前端 | Next.js 15 App Router + React 19 + TypeScript 5.5 + Tailwind CSS 3.4 |
| 运行时 | Cloudflare Pages（Edge Runtime + nodejs_compat）|
| 本地存储 | IndexedDB（Dexie.js 封装，单表 kv + 4 索引：`&key, prefix, updatedAt, dueAt`）|
| 云端存储 | Cloudflare KV（4 namespace：业务数据 / AUTH_SESSIONS / AUTH_NONCES / AUTH_AUDIT）|
| AI Provider | DeepSeek / GLM / MiMo / 用户自定义（通过 `@ai-sdk/openai` 适配）|
| AI 调用 | Vercel AI SDK（`generateObject` / `streamText`）+ 流式 tool calling + NDJSON 协议 |
| 复习算法 | ts-fsrs 4.5（FSRS-4.5）|
| 能量模型 | 8 维线性回归（正规方程 + 高斯消元，每周自动重训练）|
| 知识向量 | Workers AI `bge-base-en-v1.5`（768 维，构建期预嵌入）|
| 课程图谱 | YAML Content-as-Code + zod 校验 + G1-G7 图谱规则 |
| PWA | Service Worker + Web Push + Manifest + periodicsync |
| 测试 | Vitest 1.6（**1039 单测 / 92 个测试文件**）+ Playwright E2E |
| 代码质量 | ESLint（next/core-web-vitals + typescript）+ 三层质量护栏 |
| CI/CD | GitHub Actions（quality-gate → deploy to Cloudflare Pages）|

详细架构图与数据流见 [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)。

### 四层架构（卡帕西视角）

```
┌─────────────────────────────────────────────────────────────┐
│  L4 交付层（已有，保留）                                          │
│  FSRS 复习 · 番茄钟 · 节奏引擎 · 情绪能量 · 成就系统 · 学习队列    │
│  → 职责：解决"坚持"和"记忆"                                     │
├─────────────────────────────────────────────────────────────┤
│  L3 验证层（V1-V4 状态机）                                       │
│  V1 FSRS 卡片 · V2 代码沙箱 · V3 AI 按 Rubric 审 GitHub 仓库 ·   │
│  V4 作品集发布到 /portfolio + 公开展示                            │
│  → 职责：解决"学会了吗"的客观验证                                │
├─────────────────────────────────────────────────────────────┤
│  L2 路径引擎（lib/curriculum/path-engine.ts）                   │
│  技能图谱 + 迁移映射 + Kahn 拓扑排序 + 时间约束 → 个性化路径      │
│  → 职责：解决"下一步学什么"                                      │
├─────────────────────────────────────────────────────────────┤
│  L1 内容层（content/ YAML，护城河）                              │
│  策展式知识库：技能图谱 · 权威来源 · 代码实验 · 坑点库 · Rubric   │
│  Content-as-Code，版本化，可审查                                 │
│  → 职责：解决"学什么"和"凭什么信你"                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 📁 仓库结构

```
app/                    Next.js App Router 路由（18 顶层路由，24 个 page.tsx）
  ├── page.tsx          首页（Server Component + Suspense 骨架屏）
  ├── HomeClient.tsx    首页客户端（6 区结构：Hero / KPI / AI 洞察 / 能量 / 热力图 / 学习队列）
  ├── learn/            学习（new / list / [planId] 详情与编辑 / Demo 清除提示）
  ├── review/           FSRS 复习卡片
  ├── train/            训练会话（沉浸式学习，自动唤起番茄钟）
  ├── interview/        AI 模拟面试（4 档难度追问 + 结构化报告）
  ├── portfolio/        V4 作品集管理（草稿/发布/删除/同步）
  ├── achievements/     成就墙
  ├── emotion/          情绪日记
  ├── daily/            每日状态评估
  ├── stats/            学习统计 + AI 质量看板（ai-quality 子页）
  ├── mistakes/         错题本
  ├── favorites/        收藏
  ├── onboarding/       首次引导（3 选 1 极简入职）
  ├── profile/          个人设置（AI 模型 / Persona / 专注模式 / 时间表 / 成就墙隐私）
  ├── u/[username]/     公开学习主页（含 V4 作品集子路由）
  ├── rest/             休息引导（478 呼吸法）
  ├── docs/             应用内使用文档
  └── api/              20 个 Edge API 路由（聊天 / 学习 / 复习 / 节奏 / 限流 / 同步 / 周报 / V3 项目评审 / V4 作品集 / 鉴权 等）

components/              49 个业务组件 + 16 个统一 UI 组件
  ├── ui/               统一组件库（Button/Input/Select/Textarea/Modal/Checkbox/Switch/
  │                     Slider/FormField/LinkButton/EmptyState/Skeleton/ProgressBar/
  │                     LoadingScreen/Kbd/ToastContainer）— 被 no-native-form-elements.test.ts 守护
  ├── PomodoroWidget.tsx    番茄时钟浮动 widget（ring 56px ↔ card 280px 两态）
  ├── FloatingChat.tsx      全局浮动聊天入口（FloatingChatButton + ChatModal）
  ├── ChatClient.tsx        AI 聊天客户端（流式 + 8 工具调用 + Persona 注入）
  ├── MindMap.tsx           知识树脑图（DAG→Tree + 拖拽缩放 + 已掌握节点变绿）
  ├── Heatmap.tsx           热力图外壳（轻量）→ 懒加载 HeatmapContent（react-activity-calendar 重库）
  ├── RadarChart.tsx        雷达图外壳（轻量）→ 懒加载 RadarChartContent（recharts 重库）
  ├── RouteLoading.tsx      路由级骨架屏（4 variant：list/detail/chart/form）
  ├── PortfolioEditorModal.tsx  V4 作品集编辑器模态
  └── ...                   CurrentTaskCard / HealthAlertCard / AchievementCard / UserProfileCard ...

lib/                    业务逻辑与 AI 引擎
  ├── ai/               AI 调用层
  │   ├── provider.ts       模型解析（GLM / DeepSeek / MiMo / 用户自定义 + fallback 链）
  │   ├── session-middleware.ts  零信任 session 鉴权（AES-GCM + nonce + HMAC + 滑动续期 7d）
  │   ├── crypto.ts         Edge runtime 兼容的加解密（base64/hex/AES-GCM/HMAC-SHA256）
  │   ├── prompts.ts        Prompt 注册表（版本化 + 指纹校验 + Persona 片段 + 四段式宪章）
  │   ├── chat-tools.ts     8 个 AI 工具定义
  │   ├── chat-context.ts   上下文构建（学习状态 + 用户画像 + Persona 注入，≤2.3KB）
  │   ├── persona.ts        4 种 Persona 自动选择
  │   ├── rhythm-engine.ts  节奏引擎（6 条决策优先级链）
  │   ├── priority-engine.ts 优先级引擎（4 维加权评分）
  │   ├── plan-generator.ts  精准计划生成（画像驱动 + 可行性评分）
  │   ├── plan-feasibility.ts 可行性评分 + 自动降级
  │   ├── plan-health.ts    计划健康检查（4 条规则）
  │   ├── project-review.ts V3 项目评审（AI 按 Rubric 逐项打分）
  │   ├── memory/           用户画像构建 + 对话记忆
  │   ├── quality-tracker.ts AI 质量追踪 + 成本估算（MODEL_PRICING 表）
  │   ├── rate-limit.ts     场景化限流 + Trial 模式
  │   ├── trial-mode.ts     未配置 apiKey 用户的 Trial 模式（IP 维度限流）
  │   ├── observability.ts  AI 调用计时包装
  │   ├── trace.ts          调用链路 traceId
  │   ├── behavior-analyzer.ts 隐式行为感知（推断 energy/mood/persona）
  │   └── ...
  ├── curriculum/       课程图谱系统（Content-as-Code）
  │   ├── schema.ts         zod 校验 schema
  │   ├── loader.ts         YAML 解析（纯函数，可在 Edge/Vitest 运行）
  │   ├── graph.ts          图谱构建 + G1-G7 校验 + Kahn 拓扑排序
  │   ├── path-engine.ts    L2 个性化路径引擎
  │   ├── verification.ts   L3 验证状态机（V1-V4 逐级递进）
  │   ├── mastery-store.ts  节点掌握状态 IndexedDB 持久化
  │   ├── portfolio-store.ts V4 作品集存储
  │   ├── server-graph.ts   服务端图谱访问器
  │   └── content-load-error.ts  独立错误类（避免 yaml 库进客户端 bundle）
  ├── knowledge/        知识向量搜索
  │   ├── index-store.ts   索引加载三级降级（内存 → IndexedDB → fetch JSON）
  │   └── search.ts        余弦相似度 top-k + 关键词降级 + 启发式判定
  ├── presets/          预置学习计划
  │   ├── index.ts          PRESET_METAS 同步轻量 + loadPresetData async fetch JSON
  │   ├── frontend-to-ai-engineer.ts  旗舰轨道（派生自策展图谱）
  │   ├── algorithm-200.ts  LeetCode 200 题
  │   ├── frontend.ts / backend.ts / ai/ / llm-app.ts  其他 4 个 preset
  │   └── ai/               AI 算法工程师 7 域题库（ml/dl/cv/nlp/rec-rl/frontier/infrastructure）
  ├── study-queue/      学习队列
  │   ├── types.ts          StudyTask 统一模型（合并 new/review）
  │   ├── build-study-queue.ts  队列聚合纯函数
  │   ├── compute-priority.ts   5 维评分 + 中文 reason
  │   └── nav-params.ts     buildSceneUrl / parseSceneParams 场景参数路由
  ├── storage/          IndexedDB + KV 封装
  │   ├── dexie-db.ts       Dexie 单表 kv + 4 索引 + 自动迁移 idb-keyval
  │   ├── db.ts             getItem/setItem/delItem/listItems + countDueCards/listDueCards 索引查询
  │   ├── cache.ts          5min TTL + LRU 100 内存缓存
  │   └── kv.ts             Cloudflare KV（公开主页 + session + 限流 + backup + 增量合并）
  ├── timer/            番茄时钟（pomodoro / pomodoro-rule / session-tracker / focus-guard / interruption-tracker / notification-permission / format）
  ├── achievements/     成就系统（detector 16 个成就纯函数 + store + checkAndNotify）
  ├── demo/             Demo 站预置数据
  ├── types/            全局类型（按域分文件：plan/review/emotion/routine/log/public-profile/kb-index/ai/pomodoro/profile/engine/achievement/constants/curriculum/portfolio）
  ├── hooks/            React hooks（use-ai-task / use-ask-ai / use-toast）
  ├── fsrs.ts           FSRS 复习调度
  ├── energy-*.ts       能量采集 + 配置 + 8 维线性回归
  ├── home.ts           首页数据 hook（7 路并行 + 5 路后台任务触发）
  ├── sync.ts           增量同步引擎
  ├── api-client.ts     零信任客户端（session + HMAC + nonce + 时间窗 + retry）
  ├── share-image.ts    分享图生成（html-to-image + qrcode 按需 dynamic import）
  ├── time.ts           固定 Asia/Shanghai 时区（UTC+8）
  └── ...

content/                Content-as-Code 课程图谱（YAML 源码）
  ├── graph/tracks/      学习轨道（frontend-to-ai-engineer 旗舰）
  ├── graph/nodes/       49 个技能节点（agent/eng/frontend/llm/llm-api/project/prompt/python/rag 九大类）
  ├── rubrics/           5 个评分细则（V3 项目检查点用）
  └── sources/registry.yaml  权威来源登记处（约 40 条 T0-T3 来源）

scripts/                内容生产管线脚本
  ├── compile-content.ts        content/ YAML → public/data/curriculum-graph.json（含 G1-G7 校验）
  ├── export-presets.ts         lib/presets/*.ts → public/data/presets/{id}.json
  ├── build-knowledge-index.ts  预嵌入 BGE 768 维向量 → public/data/knowledge-index.json
  ├── audit-source-freshness.ts 来源新鲜度巡检（90 天 stale 阈值，进 CI）
  └── audit-presets.ts          Preset 量化体检（9 维检查，手动跑）

public/data/            数据产物（运行时 fetch）
  ├── curriculum-graph.json     编译后课程图谱
  ├── knowledge-index.json      2.7MB 知识向量索引
  ├── presets/{id}.json         6 个 preset 数据
  └── knowledge-articles/*.json 入门长文（前端类比驱动）

public/                 PWA 配置（manifest / sw.js / _routes.json / icons）
__tests__/              Vitest 单测（92 个测试文件 / 1039 个用例）
e2e/                    Playwright E2E（主流程）
docs/                   项目文档（架构 / 开发指南 / 产品说明 / UI 设计系统 / 内容生成规范 / 性能优化方法论 / 代码审计方法论）
.github/workflows/      CI：quality-gate → deploy to Cloudflare Pages
AGENTS.md               AI 编码守则（强制规范，所有 AI 与人类开发者必须遵守）
```

---

## 🚀 快速开始

### 1. 安装依赖

```bash
npm ci
```

### 2. 配置 AI Provider

复制 `.env.local.example` 为 `.env.local`，填入任一 AI Key（GLM 国内免梯子有免费额度）：

```bash
cp .env.local.example .env.local
# 编辑 .env.local，填 GLM_API_KEY 或 DEEPSEEK_API_KEY
# 必配 MASTER_KEY（openssl rand -base64 32 生成），用于加密 session
```

> 也可以不配 `.env.local`，启动后在应用内「我的 → AI 模型配置」填写（Trial 模式可免费试用，按场景配额限流）。

### 3. 本地开发

```bash
npm run dev
# 打开 http://localhost:3000
```

> 首次访问会自动注入 Demo 数据（前端工程师示例计划 + 3 张复习卡片 + 2 天学习日志），让你立即体验完整功能。

### 4. 测试与质量门禁

```bash
npm test                # Vitest 单测（1039 个用例 / 92 个测试文件）
npm run test:watch      # 监听模式
npm run test:e2e        # Playwright E2E（需先 npx playwright install chromium）
npm run test:perf       # 性能基准测试
npm run test:coverage   # 覆盖率
npm run typecheck       # TypeScript 类型检查
npm run lint            # ESLint（next/core-web-vitals + typescript，--max-warnings 0）
npm run quality-gate    # 一键校验：lint → typecheck → test
npm run content:validate    # 课程内容校验（YAML + G1-G7 图谱规则）
npm run content:freshness   # 来源新鲜度巡检
```

### 5. 内容生产管线

```bash
npm run content:compile      # 编译 content/ YAML → public/data/curriculum-graph.json
npm run presets:export       # 导出 lib/presets/*.ts → public/data/presets/{id}.json
npm run build:knowledge-index # 构建 BGE 向量索引 → public/data/knowledge-index.json
```

### 6. 部署

推送到 `main` 分支会自动触发 [`deploy-devpath.yml`](.github/workflows/deploy-devpath.yml) 部署到 Cloudflare Pages（quality-gate job 通过后才部署）。

需在仓库 Settings → Secrets 配置：
- `CLOUDFLARE_API_TOKEN` — Cloudflare API 令牌
- `CLOUDFLARE_ACCOUNT_ID` — Cloudflare 账户 ID
- `MASTER_KEY` — 加密会话根密钥（必须配置，否则 `/api/auth/exchange` 返回 500）。生成：`openssl rand -base64 32`；本地写入 `.env.local`，Cloudflare Pages 用 `wrangler pages secret put MASTER_KEY` 上传
- `DEEPSEEK_API_KEY` / `GLM_API_KEY` — 服务端默认模型用（如启用 Trial 模式）

> 详细配置说明见 [docs/DEVELOPMENT.md](docs/DEVELOPMENT.md) 的「安全配置」章节。
> Workflow 会自动创建 Pages 项目（如不存在），首次部署后访问 <https://devpath-ai.pages.dev>

---

## 🔒 数据与隐私

- 所有学习数据存储在浏览器 IndexedDB，**不会主动上传**到任何服务器
- 跨设备同步是**手动触发**：用户在「我的 → 数据同步」点击「上传到云端」
- 云端数据按 `userId` 隔离，存储在 Cloudflare KV（4 个独立 namespace：业务 / session / nonce / 审计）
- **零信任 session**：apiKey 不直接暴露，通过 AES-GCM 加密 session 传输，服务端不存 apiKey 明文，nonce 5min 一次性消费，HMAC-SHA256 签名 + 时间窗 ±60s
- AI 调用只传输必要的上下文（学习日志摘要、能量数据、用户画像、聊天历史），不传输全量数据
- `MODEL_CONFIG`（含 apiKey）不在 `SYNC_PREFIXES`，仅本地存储
- 成就墙默认关闭，需用户在隐私设置中显式开启才会公开展示
- 提供「登出所有设备」按钮调 `revokeSession` 吊销 session

---

## 🛡️ 三层质量护栏

1. **预防**（编码规范）：[AGENTS.md](AGENTS.md) 13 条 UI 强制规则 + [docs/ui-design-system.md](docs/ui-design-system.md) — 写代码前
2. **检测**（守护测试）：`__tests__/*-guard.test.ts` — 每次 commit 自动跑（含原生表单元素守护 / 设计令牌守护 / 暗色配对守护 / prompt 版本指纹 / preset 内容质量 / 课程图谱完整性等）
3. **审计**（深度扫描）：[docs/code-audit-methodology.md](docs/code-audit-methodology.md) + [docs/perf-optimization-methodology.md](docs/perf-optimization-methodology.md) — 里程碑 / 定期

三层缺一不可：没有预防 → 缺陷流入代码；没有检测 → 缺陷流入 main；没有审计 → 累积技术债。

---

## 📚 文档导航

| 文档 | 内容 |
|---|---|
| [AGENTS.md](AGENTS.md) | AI 编码守则（强制规范，最高优先级）|
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | 技术架构（分层、数据流、关键设计决策、AI-Native 演化）|
| [docs/DEVELOPMENT.md](docs/DEVELOPMENT.md) | 开发指南（环境、测试、Prompt/工具/类型/番茄/画像/优先级/节奏/Persona/成就/限流 开发流程）|
| [docs/PRODUCT.md](docs/PRODUCT.md) | 产品说明（用户视角的功能介绍与使用场景）|
| [docs/ui-design-system.md](docs/ui-design-system.md) | UI 设计系统规范（设计令牌、组件库、a11y、布局规则）|
| [docs/curriculum-content.md](docs/curriculum-content.md) | 课程内容规范（Content-as-Code 流程、Schema、G1-G7 图谱规则）|
| [docs/content-generation-standard.md](docs/content-generation-standard.md) | AI 内容生成规范（四段式宪章、四角度、深度字段约束）|
| [docs/code-audit-methodology.md](docs/code-audit-methodology.md) | 代码审计方法论（多轮深度审计流程）|
| [docs/perf-optimization-methodology.md](docs/perf-optimization-methodology.md) | 性能优化方法论（七步审计清单）|
| [devpath-ai-redesign.md](devpath-ai-redesign.md) | 产品诊断与重构设计（第一性原理视角）|

---

## 📜 License

MIT
