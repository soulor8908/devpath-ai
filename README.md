# devpath-ai

> AI 驱动的开发者成长 OS — 告诉 AI 你想学什么，它给你拆知识树、排学习计划、生面试题、按遗忘曲线复习、追踪能量与情绪。

一个面向自学开发者的本地优先（local-first）PWA：数据存在浏览器 IndexedDB，可跨设备同步到 Cloudflare KV，AI 调用走云端（用户自带 Key 免鉴权，或用服务端默认模型）。

## ✨ 核心能力

- **知识拆解**：输入主题（如「前端性能」「系统设计」），AI 拆成可独立学习的知识节点 + 依赖图 + 面试频率标注
- **学习计划**：按每日可用分钟自动排日程，支持延后 / 重分配 / 冻结 / 优先级调整
- **面试题生成**：每个知识点生成高频面试题 + 三段式答案 + 关键点 + 追问
- **FSRS 复习**：基于遗忘曲线的复习卡片调度，Streak + 热力图可视化
- **能量回归**：记录每日能量/心情/可用时长，训练线性回归模型预测次日容量，自动回填实际学习时长
- **情绪觉察**：1 秒记录情绪 + 多巴胺干扰来源，AI 生成应对建议
- **AI 聊天**：流式对话 + 工具调用（创建提醒 / 调整计划 / 切换冻结 / 设置优先级），幂等键防止重复执行
- **周报**：AI 生成本周学习报告（统计 / 模式识别 / 情绪与多巴胺 / 下周建议）
- **公开主页**：`/u/<username>` 分享学习轨迹（热力图 + 雷达图 + 打卡天数）
- **跨设备同步**：增量同步到 Cloudflare KV，Last-Write-Wins 合并

## 🏗️ 技术架构

| 层 | 选型 |
|---|---|
| 前端 | Next.js 15 App Router + React 19 + Tailwind CSS |
| 运行时 | Cloudflare Pages（Edge Runtime）|
| 本地存储 | IndexedDB（Dexie.js 封装，`&key, prefix, updatedAt` 三索引）|
| 云端存储 | Cloudflare KV（UserBackup 全量 + 增量合并）|
| AI Provider | DeepSeek / GLM / MiMo / 用户自定义（通过 `@ai-sdk/openai` 适配）|
| AI 调用 | Vercel AI SDK（`generateObject` / `streamText`）+ 流式 tool calling |
| 复习算法 | ts-fsrs（FSRS-4.5）|
| PWA | Service Worker + Web Push + Manifest |
| 测试 | Vitest（183+ 单测）+ Playwright（E2E）|

## 📁 仓库结构

```
app/                    Next.js App Router 路由
  ├── page.tsx          首页（Server Component + Suspense 骨架屏）
  ├── HomeClient.tsx    首页客户端组件（useHomeData hook）
  ├── chat/             AI 聊天（流式 + 工具调用）
  ├── learn/            学习计划详情 / 编辑
  ├── review/           FSRS 复习卡片
  ├── emotion/          情绪日记
  ├── daily/            每日状态评估
  ├── stats/            学习统计 + AI 质量看板
  ├── mistakes/         错题本
  ├── favorites/        收藏
  ├── dashboard/        仪表盘
  ├── profile/          个人设置（AI 模型 / 通知 / 同步 / 时间表）
  ├── u/[username]/     公开学习主页
  ├── docs/             应用内使用文档
  └── api/              Edge API 路由（学习 / 复习 / 聊天 / 同步 / 周报 等）
components/              React 组件（Heatmap / RadarChart / KnowledgeTree / EmotionRecorder ...）
lib/
  ├── ai/               AI 调用层（provider / prompts registry / chat-tools / weekly-report ...）
  ├── storage/          IndexedDB + KV 封装（增量同步 / LWW 合并）
  ├── fsrs.ts           FSRS 复习调度
  ├── energy-*.ts       能量回归 + 冷启动自动回填
  ├── emotion-migrate.ts 情绪字段迁移层
  ├── home.ts           首页数据获取 hook（Promise.all 并行化）
  ├── sync.ts           增量同步引擎
  └── types.ts          全局类型
functions/api/public/   Cloudflare Pages Functions（公开主页 API）
public/                 PWA 配置（manifest / sw / icons）
__tests__/              Vitest 单测
e2e/                    Playwright E2E
docs/                   项目文档
.github/workflows/      CI：部署到 Cloudflare Pages
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

### 4. 测试

```bash
npm test           # Vitest 单测
npm run test:e2e   # Playwright E2E（需先启动 dev server）
```

### 5. 部署

推送到 `main` 分支会自动触发 [`deploy-devpath.yml`](.github/workflows/deploy-devpath.yml) 部署到 Cloudflare Pages。

需在仓库 Settings → Secrets 配置：
- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`
- `API_TOKEN`（应用鉴权 token，客户端在 profile 页面填相同值）
- `DEEPSEEK_API_KEY` / `GLM_API_KEY`（服务端默认模型用）

## 🔒 数据与隐私

- 所有学习数据存储在浏览器 IndexedDB，**不会主动上传**到任何服务器
- 跨设备同步是**手动触发**：用户在「我的 → 数据同步」点击「上传到云端」
- 云端数据按 `userId` 隔离，存储在 Cloudflare KV
- AI 调用只传输必要的上下文（学习日志摘要、能量数据、聊天历史），不传输全量数据

## 📜 License

MIT
