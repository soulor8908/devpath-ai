# devpath-ai

> AI-Native 开发者成长 OS — 告诉 AI 你想学什么，它给你拆知识树、排学习计划、生面试题、按遗忘曲线复习、追踪能量与情绪、编排学习节奏、陪伴你专注。

一个面向自学开发者的本地优先（local-first）PWA：数据存在浏览器 IndexedDB，可跨设备同步到 Cloudflare KV，AI 调用走云端（用户自带 Key 免鉴权，或用服务端默认模型）。

## ✨ 核心能力

### 基础能力

- **知识拆解**：输入主题（如「前端性能」「系统设计」），AI 拆成可独立学习的知识节点 + 依赖图 + 面试频率标注
- **学习计划**：按每日可用分钟自动排日程，支持延后 / 重分配 / 冻结 / 优先级调整
- **面试题生成**：每个知识点生成高频面试题 + 三段式答案 + 关键点 + 追问
- **FSRS 复习**：基于遗忘曲线的复习卡片调度，Streak + 热力图可视化
- **能量回归**：记录每日能量/心情/可用时长，训练线性回归模型预测次日容量，自动回填实际学习时长
- **情绪觉察**：1 秒记录情绪 + 多巴胺干扰来源，AI 生成应对建议
- **AI 聊天**：流式对话 + 工具调用（创建提醒 / 调整计划 / 切换冻结 / 设置优先级 / 启动番茄 / 生成计划 / 优化日程），幂等键防止重复执行
- **周报**：AI 生成本周学习报告（统计 / 模式识别 / 情绪与多巴胺 / 下周建议）
- **公开主页**：`/u/<username>` 分享学习轨迹（热力图 + 雷达图 + 打卡天数 + 成就墙）
- **跨设备同步**：增量同步到 Cloudflare KV，Last-Write-Wins 合并

### 智能化能力（AI-Native）

- **番茄时钟**：25 分钟专注 + 5 分钟休息的番茄工作法，4-1 长休息规则，浏览器通知提醒，打断追踪（严格模式 3 次打断自动放弃），完成后自动写 LearnLog + 更新能量样本
- **用户画像**：从 FSRS 稳定性 + 准确率 + 学习日志 + 能量样本自动构建多维画像（技能水平 / 偏好时段 / 平均专注时长 / 薄弱环节 / 学习风格），24h TTL 自动重建，注入每次 AI 对话上下文
- **精准计划**：基于用户画像生成个性化学习计划，可行性评分（confidence < 0.5 自动降级），跳过已掌握节点加速进度
- **优先级引擎**：4 维加权评分（截止紧迫度 0.3 + FSRS 到期 0.3 + 技能差距 0.2 + 能量匹配 0.2），每日缓存，健康检查（逾期 / 完成率 / 能量趋势 / 卡片积压）
- **节奏引擎**：6 条决策优先级链统一编排「现在该做什么」——继续专注 → 低能量休息 → 到期复习 → routine 时段专注 → 睡前复盘 → 默认学习，不消耗 AI 额度
- **AI 人格化**：4 种 Persona（严厉教练 / 温和陪伴 / 苏格拉底导师 / 平等同行），根据能量/心情/连续天数/提问内容自动切换，用户可手动覆盖
- **专注环境保护**：严格/宽松两种模式，严格模式 3 次打断自动放弃 session，actualMinutes 扣除打断时长避免污染能量模型
- **成就系统**：16 个预置成就（连续打卡 / 计划完成 / 专注时长 / 复习连续 / 断卡恢复 / 首次成就），纯函数检测，首页通知 + 成就墙
- **Demo 站**：首次访问自动注入示例数据（前端工程师计划 + 3 张复习卡片 + 2 天学习日志），创建真实计划后可一键清除
- **AI 调用限流**：按场景配额（聊天 20/日 / 计划生成 5/日 / 周报 1/日 / 提醒 4/日），用户自带 API Key 不受限
- **AI 质量观测**：按场景统计调用数 / 采纳率 / 再生成率 / 平均耗时，Prompt 版本对比，失败模式聚类

## 🏗️ 技术架构

| 层 | 选型 |
|---|---|
| 前端 | Next.js 15 App Router + React 19 + Tailwind CSS |
| 运行时 | Cloudflare Pages（Edge Runtime）|
| 本地存储 | IndexedDB（Dexie.js 封装，`&key, prefix, updatedAt` 三索引）|
| 云端存储 | Cloudflare KV（UserBackup 全量 + 增量合并 + 限流计数 + 公开成就）|
| AI Provider | DeepSeek / GLM / MiMo / 用户自定义（通过 `@ai-sdk/openai` 适配）|
| AI 调用 | Vercel AI SDK（`generateObject` / `streamText`）+ 流式 tool calling |
| 复习算法 | ts-fsrs（FSRS-4.5）|
| 能量模型 | 线性回归（3 特征 → actualMinutes，正则方程闭式解）|
| PWA | Service Worker + Web Push + Manifest |
| 测试 | Vitest（379+ 单测）+ Playwright（E2E）|
| 代码质量 | ESLint（next/core-web-vitals + typescript）|

## 📁 仓库结构

```
app/                    Next.js App Router 路由
  ├── page.tsx          首页（Server Component + Suspense 骨架屏）
  ├── HomeClient.tsx    首页客户端（健康告警 + 成就通知 + 节奏引擎）
  ├── chat/             AI 聊天（流式 + 工具调用 + Persona 注入）
  ├── learn/            学习计划详情 / 编辑（Demo 清除提示）
  ├── review/           FSRS 复习卡片
  ├── timer/            番茄时钟全屏专注模式
  ├── achievements/     成就墙
  ├── emotion/          情绪日记
  ├── daily/            每日状态评估
  ├── stats/            学习统计 + AI 质量看板
  ├── mistakes/         错题本
  ├── favorites/        收藏
  ├── dashboard/        仪表盘
  ├── profile/          个人设置（AI 模型 / Persona / 专注模式 / 时间表 / 成就墙隐私）
  ├── u/[username]/     公开学习主页（含成就墙）
  ├── rest/             休息引导
  ├── docs/             应用内使用文档
  └── api/              Edge API 路由（聊天 / 学习 / 复习 / 节奏 / 限流 / 同步 / 周报 等）
components/              React 组件
  ├── PomodoroWidget.tsx    番茄时钟浮动组件
  ├── PomodoroFull.tsx      全屏专注模式
  ├── CurrentTaskCard.tsx   节奏引擎驱动的"现在该做什么"
  ├── HealthAlertCard.tsx   健康告警 + 一键采纳
  ├── AchievementCard.tsx   新成就通知
  ├── UserProfileCard.tsx   用户画像展示
  ├── RateLimitBanner.tsx   AI 额度提示
  └── ...                   Heatmap / RadarChart / KnowledgeTree / EmotionRecorder ...
lib/
  ├── ai/               AI 调用层
  │   ├── provider.ts       模型解析（服务端默认 / 用户自定义）
  │   ├── prompts.ts        Prompt 注册表（版本化 + 指纹校验 + Persona 片段）
  │   ├── chat-tools.ts     AI 工具定义（7 个：调整计划 / 提醒 / 冻结 / 优先级 / 番茄 / 生成计划 / 优化日程）
  │   ├── chat-context.ts   上下文构建（学习状态 + 用户画像 + Persona 注入，≤2.3KB）
  │   ├── persona.ts        4 种 Persona 自动选择
  │   ├── rhythm-engine.ts  节奏引擎（6 条决策优先级链）
  │   ├── priority-engine.ts 优先级引擎（4 维加权评分）
  │   ├── plan-generator.ts  精准计划生成（画像驱动 + 可行性评分）
  │   ├── plan-feasibility.ts 可行性评分 + 自动降级
  │   ├── plan-health.ts    计划健康检查（4 条规则）
  │   ├── memory/           用户画像构建 + 对话记忆
  │   ├── quality-tracker.ts AI 质量追踪
  │   ├── rate-limit.ts     场景化限流
  │   ├── observability.ts  AI 调用计时包装
  │   └── ...
  ├── timer/            番茄时钟
  │   ├── pomodoro.ts       Session 生命周期管理
  │   ├── pomodoro-rule.ts  4-1 长休息规则 + 时长配置
  │   ├── session-tracker.ts 今日统计
  │   ├── focus-guard.ts    专注保护（strict/loose）
  │   ├── interruption-tracker.ts 打断追踪（visibilitychange + blur）
  │   └── notification-permission.ts 通知降级
  ├── achievements/     成就系统
  │   ├── detector.ts       16 个成就纯函数检测
  │   ├── store.ts          IndexedDB 持久化
  │   └── index.ts          checkAndNotify 统一入口
  ├── demo/             Demo 站预置数据
  │   └── preset-data.ts    注入 / 清除 / 检测
  ├── storage/          IndexedDB + KV 封装
  ├── fsrs.ts           FSRS 复习调度
  ├── energy-*.ts       能量回归 + 冷启动自动回填
  ├── home.ts           首页数据 hook（5 路并行后台任务）
  ├── sync.ts           增量同步引擎
  └── types.ts          全局类型
functions/api/public/   Cloudflare Pages Functions（公开主页 API + 成就墙）
public/                 PWA 配置（manifest / sw / icons）
__tests__/              Vitest 单测（37 个文件 / 379+ 用例）
e2e/                    Playwright E2E（番茄时钟 + Demo 流程 + 主流程）
docs/                   项目文档（架构 / 开发指南）
.github/workflows/      CI：自动部署到 Cloudflare Pages
```

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
```

> 也可以不配 `.env.local`，启动后在应用内「我的 → AI 模型配置」填写。

### 3. 本地开发

```bash
npm run dev
# 打开 http://localhost:3000
```

> 首次访问会自动注入 Demo 数据（前端工程师示例计划 + 3 张复习卡片 + 2 天学习日志），让你立即体验完整功能。

### 4. 测试

```bash
npm test           # Vitest 单测（379+ 用例）
npm run test:e2e   # Playwright E2E（需先 npx playwright install chromium）
npx tsc --noEmit   # 类型检查
npx next lint      # ESLint
```

### 5. 部署

推送到 `main` 分支会自动触发 [`deploy-devpath.yml`](.github/workflows/deploy-devpath.yml) 部署到 Cloudflare Pages。

需在仓库 Settings → Secrets 配置：
- `CLOUDFLARE_API_TOKEN` — Cloudflare API 令牌
- `CLOUDFLARE_ACCOUNT_ID` — Cloudflare 账户 ID
- `API_TOKEN` — 应用鉴权 token（客户端在 profile 页面填相同值）
- `DEEPSEEK_API_KEY` / `GLM_API_KEY` — 服务端默认模型用

> Workflow 会自动创建 Pages 项目（如不存在），首次部署后访问 https://devpath-ai.pages.dev

## 🔒 数据与隐私

- 所有学习数据存储在浏览器 IndexedDB，**不会主动上传**到任何服务器
- 跨设备同步是**手动触发**：用户在「我的 → 数据同步」点击「上传到云端」
- 云端数据按 `userId` 隔离，存储在 Cloudflare KV
- AI 调用只传输必要的上下文（学习日志摘要、能量数据、用户画像、聊天历史），不传输全量数据
- 成就墙默认关闭，需用户在隐私设置中显式开启才会公开展示

## 📜 License

MIT
